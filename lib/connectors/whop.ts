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
  const usd = balances.find((b) => String(b.currency).toLowerCase() === 'usd')
  return { records, log: [`whop balances synced (${records} currencies)${usd ? ` · USD available ${num(usd.balance)}` : ''}`] }
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
