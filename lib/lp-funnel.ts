/* ─────────────────────────────────────────────────────────────────────────
   Make-$10k/Month VSL funnel engine.

   State machine (one row per lead in `vsl_leads`, keyed by email):
     opted_in  →  watched_10min  →  call_booked

   `segment` mirrors `status` so the in-house CRM segment view reflects the
   current stage. crm_contacts is the company-wide source of truth, so every
   transition here is ALSO mirrored into crm_contacts via lib/crm.ts (tags +
   pipeline_stage + timeline activity), exactly like the quiz funnel does.

   Every transition is idempotent: webhook retries and double form submits must
   never create duplicate leads or fire duplicate admin emails. Email is the
   unique key; conditional UPDATEs guarantee a transition fires at most once.
   Fails soft — funnel plumbing never blocks a visitor-facing request.
   ───────────────────────────────────────────────────────────────────────── */
import { Resend } from 'resend'
import { getSupabaseAdmin } from '@/lib/supabase'
import { normEmail, normPhone, upsertContact, logActivity } from '@/lib/crm'
import { emitEvent } from '@/lib/events'

export const FUNNEL_SOURCE = 'make-10k-month'

/* Seconds of real watch-time before the CTA + Book-a-call button unlock. */
export function revealSeconds(): number {
  const v = Number(process.env.NEXT_PUBLIC_VSL_REVEAL_SECONDS)
  return Number.isFinite(v) && v > 0 ? Math.floor(v) : 300 // 5:00
}

type Segment = 'opted_in' | 'watched_10min' | 'call_booked'
type Row = Record<string, unknown>

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://the5th.consulting').replace(/\/$/, '')
const FROM = 'The5th Consulting <indrodip@10kroadmap.org>'
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || process.env.NOTIFY_EMAIL || 'indrodip@10kroadmap.org'

/* CRM tag applied per segment so /admin/crm can filter the funnel by stage. */
const SEGMENT_TAG: Record<Segment, string> = {
  opted_in: 'vsl-opted-in',
  watched_10min: 'vsl-watched-10min',
  call_booked: 'vsl-call-booked',
}
const SEGMENT_STAGE: Record<Segment, string> = {
  opted_in: 'Lead',
  watched_10min: 'Engaged',
  call_booked: 'Call Booked',
}

/* Mirror a funnel transition into crm_contacts (single source of truth). */
async function mirrorToCrm(lead: Row, segment: Segment, detail: string) {
  const email = String(lead.email || '')
  if (!email) return
  try {
    await upsertContact(email, {
      name: (lead.name as string) || null,
      phone: (lead.phone as string) || null,
      source: FUNNEL_SOURCE,
      pipeline_stage: SEGMENT_STAGE[segment],
      ...(segment === 'call_booked' ? { call_booked: true } : {}),
      tags: ['vsl-make-10k', SEGMENT_TAG[segment]],
    })
    await logActivity(
      email,
      segment === 'call_booked' ? 'meeting' : segment === 'watched_10min' ? 'engagement' : 'lead',
      detail,
      undefined,
      { funnel: FUNNEL_SOURCE, segment },
    )
  } catch (e) {
    console.error('vsl mirrorToCrm failed', e)
  }
}

/* ── 1. Opt-in ─────────────────────────────────────────────────────────────
   Create the lead (status=opted_in) or, if it already exists, keep its stage
   and just backfill the name. Idempotent on double submit. */
export async function optInLead(input: {
  name?: string
  email: string
  phone?: string | null
  visitorId?: string | null
  utm?: Record<string, unknown>
}): Promise<{ ok: boolean; lead?: Row; error?: string }> {
  const email = normEmail(input.email)
  if (!email) return { ok: false, error: 'invalid_email' }
  const name = (input.name || '').trim().slice(0, 120) || null
  const phone = normPhone(input.phone)
  const db = getSupabaseAdmin()

  const { data: existing } = await db.from('vsl_leads').select('*').eq('email', email).maybeSingle()

  let lead: Row | null = existing || null
  if (!existing) {
    const { data, error } = await db
      .from('vsl_leads')
      .insert({
        email,
        name,
        phone,
        source: FUNNEL_SOURCE,
        status: 'opted_in',
        segment: 'opted_in',
        opted_in_at: new Date().toISOString(),
        visitor_id: input.visitorId || null,
        utm: input.utm || {},
      })
      .select('*')
      .single()
    // Race: a concurrent insert won the unique(email) — re-read instead of failing.
    if (error) {
      const { data: reread } = await db.from('vsl_leads').select('*').eq('email', email).maybeSingle()
      if (!reread) return { ok: false, error: error.message }
      lead = reread
    } else {
      lead = data
    }
  } else {
    // Backfill name/phone if they were missing.
    const patch: Record<string, unknown> = {}
    if (name && !existing.name) patch.name = name
    if (phone && !existing.phone) patch.phone = phone
    if (Object.keys(patch).length) {
      const { data } = await db.from('vsl_leads').update(patch).eq('email', email).select('*').single()
      lead = data || existing
    }
  }

  // Mirror into the CRM (only meaningful side-effect on first opt-in; upsert is
  // itself idempotent so repeat submits are harmless).
  await mirrorToCrm(lead || { email, name, phone }, 'opted_in', 'Opted in to the Make-$10k VSL funnel')
  emitEvent('lead_captured', { email, name: name || undefined, source: FUNNEL_SOURCE }).catch(() => {})
  return { ok: true, lead: lead || undefined }
}

/* ── 2. Watch progress ─────────────────────────────────────────────────────
   Store the furthest cumulative watch-time (monotonic) so a tab-close never
   loses partial-watch data. Crossing the reveal threshold flips the lead to
   watched_10min exactly once. */
export async function recordWatchProgress(input: {
  email: string
  seconds: number
  completed?: boolean
}): Promise<{ ok: boolean; status?: Segment; revealed?: boolean }> {
  const email = normEmail(input.email)
  if (!email) return { ok: false }
  const seconds = Math.max(0, Math.floor(Number(input.seconds) || 0))
  const threshold = revealSeconds()
  const db = getSupabaseAdmin()

  const { data: lead } = await db.from('vsl_leads').select('*').eq('email', email).maybeSingle()
  if (!lead) return { ok: false }

  const prev = Number(lead.watch_progress_seconds || 0)
  const nextSeconds = Math.max(prev, seconds)
  const completed = Boolean(input.completed) || Boolean(lead.video_completed)

  // Always persist progress (monotonic) + completion.
  if (nextSeconds !== prev || completed !== Boolean(lead.video_completed)) {
    await db
      .from('vsl_leads')
      .update({ watch_progress_seconds: nextSeconds, video_completed: completed })
      .eq('email', email)
  }

  const crossed = nextSeconds >= threshold
  let status = lead.status as Segment

  if (crossed && lead.status === 'opted_in') {
    // Conditional update → the transition can fire at most once even under
    // concurrent beacons. Only the winning update returns a row.
    const { data: transitioned } = await db
      .from('vsl_leads')
      .update({ status: 'watched_10min', segment: 'watched_10min', watched_10min_at: new Date().toISOString() })
      .eq('email', email)
      .eq('status', 'opted_in')
      .select('*')
      .maybeSingle()
    if (transitioned) {
      status = 'watched_10min'
      await mirrorToCrm(transitioned, 'watched_10min', `Watched ${Math.round(threshold / 60)} min of the VSL`)
      emitEvent('vsl_watched_10min', { email, source: FUNNEL_SOURCE }).catch(() => {})
    } else {
      status = 'watched_10min'
    }
  }

  return { ok: true, status, revealed: crossed }
}

/* ── 3. Call booked (Typeform webhook) ─────────────────────────────────────
   Store the response, flip to call_booked, and email the admin — each exactly
   once. The admin email is guarded by admin_notified_at set in the SAME
   conditional update, so webhook retries never double-send. */
export async function markCallBooked(input: {
  email: string
  name?: string | null
  typeformResponseId?: string | null
  payload?: unknown
}): Promise<{ ok: boolean; matched: boolean; notified: boolean }> {
  const email = normEmail(input.email)
  if (!email) return { ok: false, matched: false, notified: false }
  const db = getSupabaseAdmin()

  const { data: lead } = await db.from('vsl_leads').select('*').eq('email', email).maybeSingle()
  if (!lead) {
    // No matching opt-in — still record the booking so it isn't silently lost.
    const { data: created } = await db
      .from('vsl_leads')
      .insert({
        email,
        name: input.name || null,
        source: FUNNEL_SOURCE,
        status: 'call_booked',
        segment: 'call_booked',
        call_booked_at: new Date().toISOString(),
        typeform_response_id: input.typeformResponseId || null,
        typeform_payload: input.payload || null,
        admin_notified_at: new Date().toISOString(),
      })
      .select('*')
      .maybeSingle()
    if (created) {
      await mirrorToCrm(created, 'call_booked', 'Booked a call (no prior opt-in matched)')
      await sendAdminBookingEmail(created).catch(() => {})
      emitEvent('appointment_booked', { email, source: FUNNEL_SOURCE }).catch(() => {})
    }
    return { ok: true, matched: false, notified: Boolean(created) }
  }

  // Always store the latest Typeform response (safe to overwrite on retry).
  await db
    .from('vsl_leads')
    .update({
      status: 'call_booked',
      segment: 'call_booked',
      call_booked_at: (lead.call_booked_at as string) || new Date().toISOString(),
      typeform_response_id: input.typeformResponseId || (lead.typeform_response_id as string) || null,
      typeform_payload: input.payload ?? lead.typeform_payload ?? null,
    })
    .eq('email', email)

  // Claim the admin notification exactly once.
  const { data: claim } = await db
    .from('vsl_leads')
    .update({ admin_notified_at: new Date().toISOString() })
    .eq('email', email)
    .is('admin_notified_at', null)
    .select('*')
    .maybeSingle()

  await mirrorToCrm({ ...lead, name: input.name || lead.name }, 'call_booked', 'Booked a call from the VSL funnel')
  emitEvent('appointment_booked', { email, source: FUNNEL_SOURCE }).catch(() => {})

  let notified = false
  if (claim) {
    notified = await sendAdminBookingEmail({ ...lead, ...claim })
  }
  return { ok: true, matched: true, notified }
}

/* ── Admin notification (Resend) ───────────────────────────────────────────
   Transactional email to the founder on every new call booking. */
export async function sendAdminBookingEmail(lead: Row): Promise<boolean> {
  const key = process.env.RESEND_API_KEY
  if (!key) {
    console.error('sendAdminBookingEmail: RESEND_API_KEY missing')
    return false
  }
  const email = String(lead.email || '')
  const name = String(lead.name || '—')
  const when = new Date((lead.call_booked_at as string) || Date.now())
  const whenStr = new Intl.DateTimeFormat('en-US', {
    weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', timeZoneName: 'short',
  }).format(when)

  const formId = process.env.NEXT_PUBLIC_TYPEFORM_FORM_ID || 'u9maum7Y'
  const responseId = lead.typeform_response_id as string | undefined
  const typeformLink = responseId
    ? `https://admin.typeform.com/form/${formId}/results#responses/${responseId}`
    : `https://admin.typeform.com/form/${formId}/results#responses`
  const crmLink = `${SITE_URL}/admin/crm?q=${encodeURIComponent(email)}`

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#FAF6F0;font-family:Georgia,serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#FAF6F0;padding:32px 16px;"><tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden;">
  <tr><td style="background:#2E1A35;padding:22px 40px;">
    <span style="color:#fff;font-weight:700;font-size:12px;letter-spacing:2px;font-family:sans-serif;">THE5TH CONSULTING</span>
    <span style="color:#C9A84C;font-size:10px;font-weight:700;letter-spacing:1px;font-family:sans-serif;float:right;">NEW CALL BOOKED</span>
  </td></tr>
  <tr><td style="padding:34px 40px 8px;">
    <h1 style="font-family:Georgia,serif;font-size:23px;color:#1A1A2E;margin:0 0 6px;font-weight:400;">📞 New call booked from the VSL funnel</h1>
    <p style="color:#5a5550;font-size:14px;line-height:1.7;margin:0 0 22px;">A Make-$10k lead just booked a strategy call.</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#FAF6F0;border-left:3px solid #C9A84C;border-radius:0 6px 6px 0;padding:18px 22px;margin:0 0 24px;">
      <tr><td style="padding:6px 0;color:#5a5550;font-size:14px;"><strong style="color:#1A1A2E;">Name:</strong> ${name}</td></tr>
      <tr><td style="padding:6px 0;color:#5a5550;font-size:14px;"><strong style="color:#1A1A2E;">Email:</strong> ${email}</td></tr>
      <tr><td style="padding:6px 0;color:#5a5550;font-size:14px;"><strong style="color:#1A1A2E;">Booked:</strong> ${whenStr}</td></tr>
    </table>
    <a href="${typeformLink}" style="display:inline-block;padding:12px 24px;background:#2E1A35;color:#fff;font-weight:700;font-size:14px;border-radius:8px;text-decoration:none;font-family:sans-serif;margin:0 8px 10px 0;">View Typeform response →</a>
    <a href="${crmLink}" style="display:inline-block;padding:12px 24px;background:#C9A84C;color:#2E1A35;font-weight:700;font-size:14px;border-radius:8px;text-decoration:none;font-family:sans-serif;margin:0 0 10px 0;">Open CRM record →</a>
  </td></tr>
  <tr><td style="padding:22px 40px 30px;border-top:1px solid #eee;">
    <p style="color:#8A8075;font-size:11px;line-height:1.6;margin:0;font-family:sans-serif;">The5th Consulting · Make-$10k VSL funnel · ${FUNNEL_SOURCE}</p>
  </td></tr>
</table></td></tr></table></body></html>`

  try {
    const resend = new Resend(key)
    await resend.emails.send({
      from: FROM,
      to: ADMIN_EMAIL,
      subject: `📞 New call booked — ${name} (${email})`,
      html,
    })
    return true
  } catch (e) {
    console.error('sendAdminBookingEmail failed', e)
    return false
  }
}
