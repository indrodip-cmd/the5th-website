/* Runner for the 14-email audit sequence (see audit-emails.ts for the copy).

   Rules:
   - Anchor = when the report email went out (qa_00), else the lead's created_at.
   - One email per lead per run, and at least 40 hours since their last one, so
     a late start or a missed cron never produces a burst.
   - STOP the moment they book on cal.com, pay for the audit, or unsubscribe:
       1. cal.com live bookings (getBookedEmails) and the cal.com webhook
          (/api/webhooks/cal) write a qa_stop row immediately,
       2. the audit table (paid / booked) is re-checked right before each send.
     If they have NOT booked, the next email keeps selling until step 14.
   - Idempotent per (email, key) via event_email_log. */
import { Resend } from 'resend'
import { getSupabaseAdmin } from '@/lib/supabase'
import { isUnsubscribed, unsubscribeUrl } from '@/lib/comm/unsubscribe'
import { FROM, REPLY_TO } from '@/lib/event-campaign'
import { getBookedEmails } from '@/lib/calcom'
import { getAuditStatus } from '@/lib/roadmap-audit'
import { logActivity } from '@/lib/crm'
import { decode, score } from './engine'
import { STEPS, REPORT_KEY, STOP_KEY, renderStep, type Rendered } from './audit-emails'

const MIN_GAP_MS = 40 * 3600 * 1000

type Row = { email: string; email_key: string; sent_at: string | null; provider_id: string | null }

export async function stopSelling(email: string, reason: string): Promise<void> {
  const e = email.trim().toLowerCase()
  if (!e) return
  const db = getSupabaseAdmin()
  const { data } = await db.from('event_email_log').select('id').eq('email', e).eq('email_key', STOP_KEY).maybeSingle()
  if (data) return
  await db.from('event_email_log').upsert({ email: e, email_key: STOP_KEY, provider_id: reason }, { onConflict: 'email,email_key' }).then(() => {}, () => {})
  await logActivity(e, 'call_booked', 'Audit sequence stopped', `Reason: ${reason}. No more audit sales emails will be sent.`).catch(() => {})
}

export async function resumeSelling(email: string, onlyReason?: string): Promise<void> {
  const e = email.trim().toLowerCase()
  const q = getSupabaseAdmin().from('event_email_log').delete().eq('email', e).eq('email_key', STOP_KEY)
  await (onlyReason ? q.eq('provider_id', onlyReason) : q).then(() => {}, () => {})
}

export async function deliver(to: string, key: string, r: Rendered, unsub: string): Promise<{ ok: boolean; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) return { ok: false, error: 'RESEND_API_KEY missing' }
  const { data, error } = await new Resend(apiKey).emails.send({
    from: FROM, to, replyTo: REPLY_TO, subject: r.subject, html: r.html, text: r.text,
    headers: { 'List-Unsubscribe': `<${unsub}>`, 'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click' },
  })
  if (error) return { ok: false, error: error.message }
  await getSupabaseAdmin().from('event_email_log').upsert({ email: to, email_key: key, provider_id: data?.id || null }, { onConflict: 'email,email_key' }).then(() => {}, () => {})
  return { ok: true }
}

export async function runQuizAuditCampaign(opts: { dry?: boolean } = {}): Promise<{ ok: boolean; leads: number; sent: number; stopped: number; waiting: number; done: number; errors: number; by: Record<string, number> }> {
  const db = getSupabaseAdmin()
  const since = new Date(Date.now() - 50 * 864e5).toISOString()
  const { data: leads } = await db.from('quiz_leads').select('email,name,answers,created_at').eq('answers->>quiz_version', 'income-os-v1').gte('created_at', since).limit(5000)
  const list = leads || []
  const out = { ok: true, leads: list.length, sent: 0, stopped: 0, waiting: 0, done: 0, errors: 0, by: {} as Record<string, number> }
  if (!list.length) return out

  const { data: logRows } = await db.from('event_email_log').select('email,email_key,sent_at,provider_id').like('email_key', 'qa_%').limit(100000)
  const byEmail = new Map<string, Row[]>()
  for (const l of (logRows || []) as Row[]) { const k = l.email.toLowerCase(); (byEmail.get(k) || byEmail.set(k, []).get(k)!).push(l) }

  const booked = await getBookedEmails()
  const now = Date.now()

  for (const lead of list) {
    const email = String(lead.email).toLowerCase()
    const logs = byEmail.get(email) || []
    if (logs.some((l) => l.email_key === STOP_KEY)) { out.stopped++; continue }
    if (booked.has(email)) { if (!opts.dry) await stopSelling(email, 'cal_booking'); out.stopped++; continue }

    const sentKeys = new Set(logs.map((l) => l.email_key))
    const next = STEPS.find((s) => !sentKeys.has(s.key))
    if (!next) { out.done++; continue }

    const anchorRow = logs.find((l) => l.email_key === REPORT_KEY)
    const anchor = new Date(anchorRow?.sent_at || lead.created_at).getTime()
    const days = Math.floor((now - anchor) / 864e5)
    const lastSent = Math.max(0, ...logs.filter((l) => l.email_key.startsWith('qa_') && l.email_key !== STOP_KEY && l.sent_at).map((l) => new Date(l.sent_at as string).getTime()))
    if (next.day > days || now - lastSent < MIN_GAP_MS) { out.waiting++; continue }

    // Last check before every send: have they paid for or booked the audit?
    try {
      const st = await getAuditStatus(email)
      if (st.paid || st.booked) { if (!opts.dry) await stopSelling(email, st.booked ? 'audit_booked' : 'audit_paid'); out.stopped++; continue }
    } catch { /* fail-open: better to send than to block */ }
    if (await isUnsubscribed(email)) { out.stopped++; continue }

    const a = (lead.answers || {}) as Record<string, unknown>
    const ans = typeof a.report_code === 'string' ? decode(a.report_code) : null
    if (!ans) { out.waiting++; continue }
    const first = String(lead.name || '').trim().split(' ')[0]
    const unsub = unsubscribeUrl(email)
    const r = renderStep(next.n, { first, r: score(ans), unsub })
    if (opts.dry) { out.sent++; out.by[next.key] = (out.by[next.key] || 0) + 1; continue }
    const res = await deliver(email, next.key, r, unsub)
    if (res.ok) { out.sent++; out.by[next.key] = (out.by[next.key] || 0) + 1 } else { out.errors++; console.error('quiz-audit send failed', email, next.key, res.error) }
  }
  return out
}
