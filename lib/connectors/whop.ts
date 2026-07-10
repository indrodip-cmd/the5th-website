/* Whop connector — first payment provider in the integration platform.
   Credential-gated (WHOP_API_KEY + WHOP_BUSINESS_ID + WHOP_WEBHOOK_SECRET);
   dormant + "not connected" until set. Normalizes into revenue_events /
   revenue_balances so the dashboard never talks to Whop directly.

   Webhooks use Svix (secret starts with whsec_): signed content is
   `${svix-id}.${svix-timestamp}.${rawBody}`, key = base64-decode(secret after
   whsec_), signature = base64 HMAC-SHA256 (space-delimited `v1,<sig>` list). */
import crypto from 'crypto'
import { getSupabaseAdmin } from '@/lib/supabase'
import { recordRevenueEvent, type RevenueEvent } from '@/lib/revenue'
import { resolveOrCreateContact } from '@/lib/crm'

type Row = Record<string, unknown>

const BASE = 'https://api.whop.com'

export function whopConfigured(): boolean {
  return !!(process.env.WHOP_API_KEY && process.env.WHOP_BUSINESS_ID)
}

async function whopApi(path: string): Promise<Record<string, unknown> | null> {
  if (!process.env.WHOP_API_KEY) return null
  try {
    const r = await fetch(`${BASE}${path}`, { headers: { Authorization: `Bearer ${process.env.WHOP_API_KEY}` }, cache: 'no-store' })
    if (!r.ok) { console.error('whop api', path, r.status); return null }
    return await r.json()
  } catch (e) { console.error('whop api error', e); return null }
}

function num(v: unknown): number { const n = Number(v); return Number.isFinite(n) ? n : 0 }

/* Balances — GET /api/v1/ledger_accounts/{business_id} → one snapshot per currency. */
export async function whopSyncBalances(): Promise<{ records: number; log: string[] }> {
  if (!whopConfigured()) return { records: 0, log: ['whop not configured'] }
  const data = await whopApi(`/api/v1/ledger_accounts/${process.env.WHOP_BUSINESS_ID}`)
  if (!data) return { records: 0, log: ['whop ledger fetch failed'] }
  const balances = (data.balances as Array<Record<string, unknown>>) || []
  const db = getSupabaseAdmin()
  let records = 0
  for (const b of balances) {
    await db.from('revenue_balances').insert({
      provider: 'whop',
      available: num(b.balance),
      pending: num(b.pending_balance),
      reserve: num(b.reserve_balance),
      currency: String(b.currency || 'usd').toUpperCase(),
    })
    records++
  }
  // Treasury: a USD-normalized combined total across everything (if present).
  const treasury = data.treasury_balance as Record<string, unknown> | undefined
  if (treasury && treasury.balance_usd != null) {
    await db.from('revenue_balances').insert({ provider: 'whop', available: num(treasury.balance_usd), pending: 0, reserve: 0, currency: 'TREASURY' })
    records++
  }
  const usd = balances.find((b) => String(b.currency).toLowerCase() === 'usd')
  return { records, log: [`whop balances synced (${balances.length} currencies)${usd ? ` · USD available ${num(usd.balance)}` : ''}`] }
}

// ── Products ──
export async function whopSyncProducts(maxPages = 20): Promise<{ records: number; log: string[] }> {
  if (!whopConfigured()) return { records: 0, log: ['whop not configured'] }
  const db = getSupabaseAdmin()
  let after: string | null = null, records = 0
  for (let i = 0; i < maxPages; i++) {
    const data = await whopApi(`/products?company_id=${process.env.WHOP_BUSINESS_ID}&first=100${after ? `&after=${encodeURIComponent(after)}` : ''}`)
    if (!data) break
    const list = ((data.data as Row[]) || (data.products as Row[]) || []) as Row[]
    for (const p of list) {
      await db.from('whop_products').upsert({
        id: String(p.id), title: (p.title as string) || null, description: (p.description as string) || null,
        headline: (p.headline as string) || null, custom_cta: (p.custom_cta as string) || null,
        gallery_images: (p.gallery_images as unknown[]) || [],
        global_affiliate_percentage: p.global_affiliate_percentage != null ? num(p.global_affiliate_percentage) : null,
        member_affiliate_percentage: p.member_affiliate_percentage != null ? num(p.member_affiliate_percentage) : null,
        product_created_at: whopDate(p.created_at), product_updated_at: whopDate(p.updated_at),
        raw: p, synced_at: new Date().toISOString(),
      }, { onConflict: 'id' })
      records++
    }
    const pi = (data.page_info as Row) || {}
    after = (pi.end_cursor as string) || null
    if (!after || !pi.has_next_page || list.length === 0) break
  }
  return { records, log: [`whop products synced: ${records}`] }
}

// ── Members ──
function deriveMemberStatus(status: string, mra: string): string {
  if (mra === 'past_due') return 'Past Due'
  if (mra === 'canceling') return 'Canceling'
  if (mra === 'churned' || status === 'left') return 'Churned'
  if (status === 'joined' && ['paid_subscriber', 'renewing', 'trialing'].includes(mra)) return 'Active'
  return 'Other'
}

function mapMember(m: Row): Row {
  const u = (m.user as Row) || {}
  const status = String(m.status || ''), mra = String(m.most_recent_action || '')
  return {
    id: String(m.id), user_id: (u.id as string) || (m.user_id as string) || null,
    email: (String(u.email || '') || '').toLowerCase() || null, name: (u.name as string) || null, username: (u.username as string) || null,
    phone: (m.phone as string) || (u.phone as string) || null, status, access_level: (m.access_level as string) || null,
    most_recent_action: mra, derived_status: deriveMemberStatus(status, mra),
    usd_total_spent: num(m.usd_total_spent), company_token_balance: m.company_token_balance != null ? num(m.company_token_balance) : null,
    joined_at: whopDate(m.joined_at), member_created_at: whopDate(m.created_at), raw: m,
  }
}

/* Upsert a member row, link it to a CRM contact by email, and set the contact's
   LTV to Whop's server-calculated usd_total_spent (authoritative). */
async function upsertMember(m: Row): Promise<void> {
  const db = getSupabaseAdmin()
  const row = mapMember(m)
  let contactId: string | null = null
  if (row.email) {
    const contact = await resolveOrCreateContact({ email: row.email, name: row.name, phone: row.phone }, { source: 'whop' })
    contactId = (contact?.id as string) || null
    if (contactId) await db.from('crm_contacts').update({ ltv: row.usd_total_spent, lifecycle_stage: row.derived_status === 'Active' ? 'customer' : (contact?.lifecycle_stage as string) || 'lead' }).eq('id', contactId)
  }
  await db.from('whop_members').upsert({ ...row, contact_id: contactId, synced_at: new Date().toISOString() }, { onConflict: 'id' })
}

export async function whopSyncMembers(maxPages = 40): Promise<{ records: number; log: string[] }> {
  if (!whopConfigured()) return { records: 0, log: ['whop not configured'] }
  let after: string | null = null, records = 0
  for (let i = 0; i < maxPages; i++) {
    const data = await whopApi(`/members?company_id=${process.env.WHOP_BUSINESS_ID}&first=100${after ? `&after=${encodeURIComponent(after)}` : ''}`)
    if (!data) break
    const list = ((data.data as Row[]) || (data.members as Row[]) || []) as Row[]
    for (const m of list) { await upsertMember(m); records++ }
    const pi = (data.page_info as Row) || {}
    after = (pi.end_cursor as string) || null
    if (!after || !pi.has_next_page || list.length === 0) break
  }
  return { records, log: [`whop members synced: ${records}`] }
}

/* Re-fetch a single member (after a webhook) to refresh LTV + status now. */
export async function whopRefreshMember(userId: string): Promise<void> {
  if (!whopConfigured() || !userId) return
  const data = await whopApi(`/members?company_id=${process.env.WHOP_BUSINESS_ID}&user_ids[]=${encodeURIComponent(userId)}&first=1`)
  const list = ((data?.data as Row[]) || (data?.members as Row[]) || []) as Row[]
  if (list[0]) await upsertMember(list[0])
}

/* Live server-side member search (query param searches name/username/email). */
export async function whopSearchMembers(query: string): Promise<Row[]> {
  if (!whopConfigured()) return []
  const data = await whopApi(`/members?company_id=${process.env.WHOP_BUSINESS_ID}&query=${encodeURIComponent(query)}&first=25`)
  const list = ((data?.data as Row[]) || (data?.members as Row[]) || []) as Row[]
  return list.map(mapMember)
}

/* One-time historical seed — cursor-paginate GET /api/v1/payments. */
export async function whopBackfillPayments(maxPages = 30): Promise<{ imported: number; pages: number; log: string[] }> {
  if (!whopConfigured()) return { imported: 0, pages: 0, log: ['whop not configured'] }
  let after: string | null = null
  let imported = 0
  let pages = 0
  for (let i = 0; i < maxPages; i++) {
    const q = `/api/v1/payments?company_id=${process.env.WHOP_BUSINESS_ID}&first=100${after ? `&after=${encodeURIComponent(after)}` : ''}`
    const data = await whopApi(q)
    if (!data) break
    pages++
    const list = ((data.data as Array<Record<string, unknown>>) || (data.payments as Array<Record<string, unknown>>) || []) as Array<Record<string, unknown>>
    for (const p of list) {
      const evt = paymentToRevenue(p)
      if (evt) { const r = await recordRevenueEvent(evt); if (r.ok && !r.duplicate) imported++ }
    }
    const pageInfo = (data.page_info as Record<string, unknown>) || {}
    const hasNext = !!pageInfo.has_next_page
    after = (pageInfo.end_cursor as string) || null
    if (!after || !hasNext || list.length === 0) break
  }
  return { imported, pages, log: [`whop backfill: imported ${imported} payments across ${pages} pages`] }
}

/* Map a Whop payment object → a canonical sale RevenueEvent (settled only). */
function paymentToRevenue(p: Record<string, unknown>): RevenueEvent | null {
  const status = String(p.status || '').toLowerCase()
  if (status && !['paid', 'succeeded', 'successful', 'completed'].includes(status)) return null
  const user = (p.user as Record<string, unknown>) || {}
  const usd = num(p.usd_total)
  const amount = usd || num(p.total)
  if (amount <= 0) return null
  return {
    provider: 'whop',
    external_id: String(p.id || ''),
    type: 'sale',
    email: String(user.email || '') || undefined,
    product: String((p.product as Record<string, unknown>)?.title || 'Whop purchase'),
    amount,
    currency: usd ? 'USD' : String(p.currency || 'usd').toUpperCase(),
    occurred_at: whopDate(p.paid_at || p.created_at),
    meta: { plan: (p.plan as Record<string, unknown>)?.id, membership: (p.membership as Record<string, unknown>)?.id, name: user.name },
  }
}

function whopDate(v: unknown): string | undefined {
  if (v == null) return undefined
  if (typeof v === 'string' && v.includes('-')) return v // ISO
  const n = num(v)
  if (!n) return undefined
  return new Date(n < 1e12 ? n * 1000 : n).toISOString() // unix (s or ms)
}

// ── Svix webhook verification ──
export interface SvixHeaders { id: string | null; timestamp: string | null; signature: string | null }

export function verifyWhopWebhook(raw: string, h: SvixHeaders): boolean {
  const secret = process.env.WHOP_WEBHOOK_SECRET
  if (!secret || !h.id || !h.timestamp || !h.signature) return false
  const tsSec = Number(h.timestamp)
  if (Number.isFinite(tsSec) && Math.abs(Date.now() / 1000 - tsSec) > 300) return false // replay guard
  const key = Buffer.from(secret.replace(/^whsec_/, ''), 'base64')
  const signedContent = `${h.id}.${h.timestamp}.${raw}`
  const expected = crypto.createHmac('sha256', key).update(signedContent).digest('base64')
  const provided = h.signature.split(' ').map((s) => (s.includes(',') ? s.split(',')[1] : s))
  return provided.some((sig) => { try { return crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected)) } catch { return false } })
}

/* Revenue-affecting events → RevenueEvent; other events return null and are
   handled (notify / subscriber count) by the webhook route. */
const REVENUE_MAP: Record<string, RevenueEvent['type']> = {
  'payment.succeeded': 'sale',
  'refund.created': 'refund',
  'refund.updated': 'refund',
  'membership.activated': 'membership_created',
  'membership.deactivated': 'membership_cancelled',
}
export function normalizeWhopEvent(body: Record<string, unknown>): RevenueEvent | null {
  const action = String(body.action || body.event || body.type || '')
  const type = REVENUE_MAP[action]
  if (!type) return null
  const d = (body.data as Record<string, unknown>) || {}
  const user = (d.user as Record<string, unknown>) || {}
  const usd = num(d.usd_total)
  const amount = usd || num(d.total)
  return {
    provider: 'whop',
    external_id: String(d.id || (d.membership as Record<string, unknown>)?.id || d.membership_id || ''),
    type,
    email: String(user.email || d.email || '') || undefined,
    product: String((d.product as Record<string, unknown>)?.title || d.product || 'Whop'),
    amount,
    currency: usd ? 'USD' : String(d.currency || 'usd').toUpperCase(),
    occurred_at: whopDate(d.paid_at || d.created_at),
    meta: { action, name: user.name },
  }
}
