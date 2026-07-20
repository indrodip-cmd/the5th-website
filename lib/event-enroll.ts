import { Resend } from 'resend'
import { createHmac } from 'node:crypto'
import { getSupabaseAdmin } from '@/lib/supabase'
import { EMAIL_BY_KEY, FROM, REPLY_TO } from '@/lib/event-campaign'

const SITE = 'https://the5th.consulting'

/** One-click unsubscribe link signed with CRON_SECRET (tamper-proof). */
export function unsubUrlFor(email: string) {
  const e = email.trim().toLowerCase()
  const sig = createHmac('sha256', process.env.CRON_SECRET || 'x').update(e).digest('hex').slice(0, 16)
  return `${SITE}/api/event/unsubscribe?e=${encodeURIComponent(e)}&k=${sig}`
}

export function verifyUnsub(email: string, sig: string) {
  const expected = createHmac('sha256', process.env.CRON_SECRET || 'x').update(email.trim().toLowerCase()).digest('hex').slice(0, 16)
  return sig === expected
}

/* Server-side send + enrollment helpers for the Breakthrough Intensive.
   Shared by the campaign API route and the Whop payment webhook. Every real
   send is logged (unique(email,email_key)) so retries never double-email. */

export async function sendCampaignEmail(opts: {
  key: string
  to: string
  name?: string
  log?: boolean
  unsubUrl?: string
}): Promise<{ ok: boolean; id?: string | null; error?: string }> {
  const def = EMAIL_BY_KEY[opts.key]
  if (!def) return { ok: false, error: `unknown email key: ${opts.key}` }
  const key = process.env.RESEND_API_KEY
  if (!key) return { ok: false, error: 'RESEND_API_KEY missing' }
  const resend = new Resend(key)
  const html = def.build({ name: opts.name, unsubUrl: opts.unsubUrl })
  // RFC 8058 one-click unsubscribe: improves Gmail/Yahoo placement + reputation.
  const headers: Record<string, string> = {
    'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
  }
  if (opts.unsubUrl && opts.unsubUrl !== '#') {
    headers['List-Unsubscribe'] = `<${opts.unsubUrl}>, <mailto:Indrodip@10kroadmap.org?subject=unsubscribe>`
  }
  const { data, error } = await resend.emails.send({
    from: FROM,
    to: opts.to,
    replyTo: REPLY_TO,
    subject: def.subject,
    html,
    text: def.preview,
    headers,
    tags: [
      { name: 'campaign', value: 'breakthrough' },
      { name: 'email_key', value: opts.key },
    ],
  })
  if (error) return { ok: false, error: String((error as { message?: string }).message || error) }
  if (opts.log) {
    const db = getSupabaseAdmin()
    await db
      .from('event_email_log')
      .insert({ email: opts.to.toLowerCase(), email_key: opts.key, provider_id: data?.id || null })
      .then(() => {}, () => {})
  }
  return { ok: true, id: data?.id || null }
}

/** Record a buyer and send the welcome once. Safe to call repeatedly. */
export async function enrollBuyer(email: string, name?: string | null, source = 'whop') {
  const e = email.trim().toLowerCase()
  if (!e || !e.includes('@')) return { ok: false, error: 'invalid email' }
  const db = getSupabaseAdmin()
  await db
    .from('event_registrants')
    .upsert({ email: e, name: name || null, list: 'buyer', source, event_key: 'breakthrough' }, { onConflict: 'email' })
    .then(() => {}, () => {})
  const { data: seen } = await db.from('event_email_log').select('id').eq('email', e).eq('email_key', 'welcome').maybeSingle()
  if (seen) return { ok: true, welcome: 'already_sent' as const }
  const r = await sendCampaignEmail({ key: 'welcome', to: e, name: name || undefined, log: true, unsubUrl: unsubUrlFor(e) })
  return { ok: r.ok, welcome: r }
}

/** Apply a Resend webhook event (delivered/opened/clicked/bounced/complained)
    to the campaign send log. Matches on the Resend email id, so events for any
    non-campaign email simply update 0 rows and are ignored. */
export async function applyResendEventToCampaign(body: unknown): Promise<{ matched: boolean }> {
  const b = body as { type?: string; data?: { email_id?: string } }
  const type = b?.type
  const emailId = b?.data?.email_id
  if (!type || !emailId) return { matched: false }
  const db = getSupabaseAdmin()
  const { data: row } = await db
    .from('event_email_log')
    .select('id,email,open_count,click_count')
    .eq('provider_id', emailId)
    .maybeSingle()
  if (!row) return { matched: false }

  const now = new Date().toISOString()
  const patch: Record<string, unknown> = {}
  switch (type) {
    case 'email.delivered': patch.delivered_at = now; break
    case 'email.opened': patch.opened_at = now; patch.open_count = (row.open_count || 0) + 1; break
    case 'email.clicked': patch.clicked_at = now; patch.click_count = (row.click_count || 0) + 1; break
    case 'email.bounced': patch.bounced_at = now; break
    case 'email.complained': patch.complained_at = now; break
    default: return { matched: true }
  }
  await db.from('event_email_log').update(patch).eq('id', row.id)
  // A spam complaint or hard bounce should stop all future sends to them.
  if (type === 'email.complained' || type === 'email.bounced') {
    await db.from('event_registrants').update({ unsubscribed: true }).eq('email', row.email).then(() => {}, () => {})
  }
  return { matched: true }
}

/** Bulk-add presale leads (or buyers) into event_registrants. Idempotent. */
export async function importRegistrants(
  people: Array<{ email: string; name?: string | null }>,
  list: 'lead' | 'buyer' = 'lead',
  source = 'import',
): Promise<{ imported: number; skipped: number }> {
  const db = getSupabaseAdmin()
  const seen = new Set<string>()
  const rows = people
    .map((p) => ({ email: String(p.email || '').trim().toLowerCase(), name: p.name || null }))
    .filter((p) => {
      if (!p.email || !p.email.includes('@') || seen.has(p.email)) return false
      seen.add(p.email)
      return true
    })
    .map((p) => ({ email: p.email, name: p.name, list, source, event_key: 'breakthrough' }))
  if (!rows.length) return { imported: 0, skipped: people.length }
  // ignoreDuplicates keeps an existing buyer from being downgraded to a lead.
  const { error } = await db.from('event_registrants').upsert(rows, { onConflict: 'email', ignoreDuplicates: true })
  if (error) return { imported: 0, skipped: people.length }
  return { imported: rows.length, skipped: people.length - rows.length }
}
