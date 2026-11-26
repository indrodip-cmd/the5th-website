/* Sending, scheduling and bookkeeping for the book funnel emails.

   - Chapter 1 delivery: sent the moment someone asks for the free chapter.
   - Purchase delivery:  sent when the Whop payment webhook confirms a sale.
   - Campaign (5 emails): days 1, 3, 5, 8 and 12 after Chapter 1, to people who
     have NOT bought, stopped the moment they buy or unsubscribe.

   State lives in tables that already exist, so no migration is needed:
     event_email_log   one row per (email, email_key). sent_at is the schedule
                       anchor; opened_at / clicked_at fill from provider webhooks.
                       Keys: book_c1_0 (chapter 1), book_c1_1..5 (campaign),
                       book_buy_0 (purchase delivery).
     analytics_events  event_type 'download' rows, one per file download.
   Idempotent per (email, key): re-running the cron can never double-send. */
import crypto from 'crypto'
import { Resend } from 'resend'
import { getSupabaseAdmin } from '@/lib/supabase'
import { isUnsubscribed, unsubscribeUrl } from '@/lib/comm/unsubscribe'
import { FROM, REPLY_TO } from '@/lib/event-campaign'
import { resolveOrCreateContact, addTag, logActivity } from '@/lib/crm'
import { CAMPAIGN_DAYS, TEMPLATES, campaign, chapter1, purchase, SITE, type CampaignStep, type Rendered } from '@/lib/book-email'

export const KEYS = { chapter1: 'book_c1_0', purchase: 'book_buy_0', step: (n: number) => `book_c1_${n}` }

/* ── signed download links ─────────────────────────────────────────────── */
const secret = () => process.env.BOOK_DOWNLOAD_SECRET || process.env.SESSION_SECRET || process.env.CRON_SECRET || ''
const b64 = (b: Buffer | string) => Buffer.from(b).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')

export function signDownload(email: string, kind: 'book' | 'chapter1', days = 365): string {
  const s = secret(); if (!s) return ''
  const payload = b64(JSON.stringify({ e: email.trim().toLowerCase(), k: kind, x: Math.floor(Date.now() / 1000) + days * 86400 }))
  return `${payload}.${b64(crypto.createHmac('sha256', s).update(payload).digest())}`
}
export function verifyDownload(token: string | null | undefined): { email: string; kind: string } | null {
  const s = secret(); if (!s || !token || token.length > 1024) return null
  const [payload, sig] = token.split('.'); if (!payload || !sig) return null
  const want = b64(crypto.createHmac('sha256', s).update(payload).digest())
  if (sig.length !== want.length || !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(want))) return null
  try {
    const j = JSON.parse(Buffer.from(payload.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString())
    if (typeof j.e !== 'string' || typeof j.x !== 'number' || j.x < Date.now() / 1000) return null
    return { email: j.e, kind: String(j.k) }
  } catch { return null }
}
/* Absolute link for emails; falls back to a safe public destination when no signing secret is configured. */
export function downloadUrl(email: string, kind: 'book' | 'chapter1'): string | undefined {
  const t = signDownload(email, kind)
  return t ? `${SITE}/api/book/download?k=${kind}&t=${encodeURIComponent(t)}` : undefined
}

/* ── sending ───────────────────────────────────────────────────────────── */
async function alreadySent(email: string, key: string) {
  const { data } = await getSupabaseAdmin().from('event_email_log').select('id').eq('email', email).eq('email_key', key).maybeSingle()
  return !!data
}

async function deliver(to: string, key: string, r: Rendered, opts: { transactional: boolean; unsub?: string }): Promise<{ ok: boolean; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) return { ok: false, error: 'RESEND_API_KEY missing' }
  const { data, error } = await new Resend(apiKey).emails.send({
    from: FROM, to, replyTo: REPLY_TO, subject: r.subject, html: r.html, text: r.text,
    ...(opts.transactional ? {} : { headers: { 'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click', 'List-Unsubscribe': `<${opts.unsub}>, <mailto:${REPLY_TO}?subject=unsubscribe>` } }),
    tags: [{ name: 'campaign', value: 'book' }, { name: 'email_key', value: key }],
  })
  if (error) return { ok: false, error: String((error as { message?: string }).message || error) }
  await getSupabaseAdmin().from('event_email_log').upsert({ email: to, email_key: key, provider_id: data?.id || null }, { onConflict: 'email,email_key' }).then(() => {}, () => {})
  return { ok: true }
}

type SendResult = { ok: boolean; error?: string; skipped?: string }
export async function sendChapter1(email: string, name?: string | null): Promise<SendResult> {
  const to = email.trim().toLowerCase()
  if (await alreadySent(to, KEYS.chapter1)) return { ok: true, skipped: 'already sent' }
  const unsub = unsubscribeUrl(to)
  return deliver(to, KEYS.chapter1, chapter1({ name: name || undefined, unsub, downloadUrl: downloadUrl(to, 'chapter1') }), { transactional: false, unsub })
}

/* Transactional: sent even to people who unsubscribed from marketing. */
export async function sendPurchaseEmail(email: string, name?: string | null): Promise<SendResult> {
  const to = email.trim().toLowerCase()
  if (await alreadySent(to, KEYS.purchase)) return { ok: true, skipped: 'already sent' }
  return deliver(to, KEYS.purchase, purchase({ name: name || undefined, downloadUrl: downloadUrl(to, 'book') }), { transactional: true })
}

/* ── the campaign ──────────────────────────────────────────────────────── */
/* Pure and testable: which campaign step (if any) is due for a lead. */
export function dueStep(anchor: Date, now: Date, sentSteps: number[]): CampaignStep | null {
  const days = (now.getTime() - anchor.getTime()) / 864e5
  for (let i = 0; i < CAMPAIGN_DAYS.length; i++) {
    const step = (i + 1) as CampaignStep
    if (sentSteps.includes(step)) continue
    // never skip ahead: step N waits for step N-1, and only the earliest due step sends per run
    return days >= CAMPAIGN_DAYS[i] ? step : null
  }
  return null
}

export async function buyerEmails(): Promise<Set<string>> {
  const db = getSupabaseAdmin()
  const out = new Set<string>()
  const { data: a } = await db.from('event_email_log').select('email').eq('email_key', KEYS.purchase).limit(20000)
  for (const r of a || []) out.add(String(r.email).toLowerCase())
  const { data: b } = await db.from('crm_contacts').select('email').contains('tags', ['book-buyer']).limit(20000)
  for (const r of b || []) if (r.email) out.add(String(r.email).toLowerCase())
  return out
}

export async function runBookCampaign(now = new Date()): Promise<{ checked: number; sent: number; skippedBuyers: number; skippedUnsub: number; errors: string[] }> {
  const db = getSupabaseAdmin()
  const res = { checked: 0, sent: 0, skippedBuyers: 0, skippedUnsub: 0, errors: [] as string[] }
  const { data: leads } = await db.from('event_email_log').select('email,sent_at').eq('email_key', KEYS.chapter1).gte('sent_at', new Date(now.getTime() - 40 * 864e5).toISOString()).limit(5000)
  if (!leads?.length) return res
  const buyers = await buyerEmails()
  const { data: logs } = await db.from('event_email_log').select('email,email_key').like('email_key', 'book_c1_%').limit(50000)
  const sentBy = new Map<string, number[]>()
  for (const l of logs || []) { const n = Number(String(l.email_key).replace('book_c1_', '')); if (n >= 1) sentBy.set(l.email, [...(sentBy.get(l.email) || []), n]) }

  for (const lead of leads) {
    const email = String(lead.email).toLowerCase(); res.checked++
    if (buyers.has(email)) { res.skippedBuyers++; continue }
    if (await isUnsubscribed(email)) { res.skippedUnsub++; continue }
    const step = dueStep(new Date(lead.sent_at), now, sentBy.get(lead.email) || [])
    if (!step) continue
    try {
      const { data: c } = await db.from('crm_contacts').select('name,first_name').eq('email', email).maybeSingle()
      const name = (c as { name?: string; first_name?: string } | null)?.first_name || (c as { name?: string } | null)?.name || undefined
      const r = await deliver(email, KEYS.step(step), campaign(step, { name, unsub: unsubscribeUrl(email) }), { transactional: false, unsub: unsubscribeUrl(email) })
      if (r.ok) { res.sent++; await logActivity(email, 'email', `Book campaign email ${step} sent`).catch(() => {}) } else res.errors.push(`${email}#${step}: ${r.error}`)
    } catch (e) { res.errors.push(`${email}#${step}: ${String(e)}`) }
  }
  return res
}

/* ── capture helpers used by the lead route and the webhook ───────────── */
export async function captureLead(email: string, name: string | null, meta: Record<string, unknown>) {
  const contact = await resolveOrCreateContact({ email, name, tags: ['book-sample', 'book-lead'] }, { source: 'book-landing', actor: 'book-lead' })
  if (contact?.id) await addTag(contact.id as string, 'book-sample').catch(() => {})
  await logActivity(email, 'program_view', 'Requested free Chapter 1 of Expertise to Income', JSON.stringify(meta)).catch(() => {})
}

export async function logDownload(kind: string, email: string | null, req: { ip?: string; ua?: string }) {
  try {
  await getSupabaseAdmin().from('analytics_events').insert({
    event_type: 'download', path: '/api/book/download', user_agent: (req.ua || '').slice(0, 300),
    meta: { name: 'book_download', kind, email: email || null, product: 'expertise-to-income' },
  }).then(() => {}, () => {})
  if (email) await logActivity(email, 'program_view', kind === 'book' ? 'Downloaded the full book' : 'Downloaded Chapter 1').catch(() => {})
  } catch { /* fail soft */ }
}

export { TEMPLATES }
