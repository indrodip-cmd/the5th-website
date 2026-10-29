/* ─────────────────────────────────────────────────────────────────────────
   /roadmap-session — funnel engine.

   A free quiz -> booking -> thank-you funnel for FUNNEL_BRIEF.md. Reuses the
   same `vsl_leads` + `crm_contacts` infrastructure as every other funnel
   (lib/crm.ts, lib/supabase.ts), but under its own source tag so it never
   collides with the existing `10k-roadmap-audit` ($27 deposit) funnel in
   lib/roadmap-audit.ts. That file is NOT imported or modified here.

   All structured data (quiz answers per step, verdict, attribution, booking)
   lives under `typeform_payload.roadmap_session` as additive JSONB — existing
   callers of vsl_leads / crm_contacts are unaffected.
   ───────────────────────────────────────────────────────────────────────── */
import { Resend } from 'resend'
import { getSupabaseAdmin } from '@/lib/supabase'
import { normEmail, normPhone, upsertContact, logActivity } from '@/lib/crm'
import { emitEvent } from '@/lib/events'

export const SOURCE = 'roadmap-session'
const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://the5thglobal.consulting').replace(/\/$/, '')
const FROM = 'The5th Global Consulting <indrodip@10kroadmap.org>'
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || process.env.NOTIFY_EMAIL || 'indrodip@10kroadmap.org'

export type Attribution = {
  fbp?: string | null
  fbc?: string | null
  utm?: Record<string, string>
}

export type Verdict = 'qualified' | 'rejected' | null

export type SessionPayload = {
  v: 'roadmap_session'
  visitorId?: string
  attribution?: Attribution
  quiz?: Record<string, unknown> // partial answers, saved progressively
  verdict?: Verdict
  reject_reason?: string | null
  sms_consent?: boolean
  booking?: { start?: string; end?: string; tz?: string; uid?: string | number | null; meetingUrl?: string | null; at?: string }
  nurture?: { entered_at?: string; sequence?: string }
}

function mergeSession(existing: unknown, patch: Partial<SessionPayload>): SessionPayload {
  const base = (existing && typeof existing === 'object' ? existing : {}) as SessionPayload
  return { ...base, v: 'roadmap_session', ...patch }
}

/* ── 1. Progressive quiz save (every step, including abandons) ─────────────
   No email required yet for steps 1-3 — keyed by visitorId until step 4
   supplies an email. Once an email exists, the visitorId-only row (if any)
   is folded in by visitorId match on the next save. */
export async function saveQuizStep(input: {
  visitorId: string
  email?: string | null
  stepId: string
  answer: unknown
  attribution?: Attribution
}): Promise<{ ok: boolean }> {
  const db = getSupabaseAdmin()
  const email = normEmail(input.email)

  if (email) {
    const { data: existing } = await db.from('vsl_leads').select('*').eq('email', email).maybeSingle()
    const quiz = { ...((existing?.typeform_payload as SessionPayload)?.quiz || {}), [input.stepId]: input.answer }
    const session = mergeSession(existing?.typeform_payload, { visitorId: input.visitorId, quiz, attribution: input.attribution })
    if (!existing) {
      await db.from('vsl_leads').insert({
        email, source: SOURCE, status: 'rs_in_progress', segment: 'rs_in_progress',
        opted_in_at: new Date().toISOString(), visitor_id: input.visitorId, utm: input.attribution?.utm || {},
        typeform_payload: session,
      }).then(() => {}, () => {})
    } else {
      await db.from('vsl_leads').update({ typeform_payload: session }).eq('email', email)
    }
    return { ok: true }
  }

  // No email yet: key by visitor_id so an abandoned pre-contact quiz still persists.
  const { data: existing } = await db.from('vsl_leads').select('*').eq('visitor_id', input.visitorId).eq('source', SOURCE).maybeSingle()
  const quiz = { ...((existing?.typeform_payload as SessionPayload)?.quiz || {}), [input.stepId]: input.answer }
  const session = mergeSession(existing?.typeform_payload, { visitorId: input.visitorId, quiz, attribution: input.attribution })
  if (!existing) {
    await db.from('vsl_leads').insert({
      email: `anon-${input.visitorId}@no-email.invalid`, source: SOURCE,
      status: 'rs_abandoned_pre_contact', segment: 'rs_abandoned_pre_contact',
      visitor_id: input.visitorId, utm: input.attribution?.utm || {},
      typeform_payload: session,
    }).then(() => {}, () => {})
  } else {
    await db.from('vsl_leads').update({ typeform_payload: session }).eq('id', existing.id)
  }
  return { ok: true }
}

/* ── 2. Contact captured (quiz step 4) — fires the Lead event ──────────────
   Folds any visitor_id-only row (saved pre-contact) into the real email row
   so the step-1-3 answers aren't lost. */
export async function saveContact(input: {
  visitorId: string
  name: string
  email: string
  phone?: string | null
  smsConsent: boolean
  quizSoFar: Record<string, unknown>
  attribution?: Attribution
}): Promise<{ ok: boolean; error?: string }> {
  const email = normEmail(input.email)
  if (!email) return { ok: false, error: 'invalid_email' }
  const phone = normPhone(input.phone)
  const name = input.name.trim().slice(0, 120) || null
  const db = getSupabaseAdmin()

  // Fold in the anonymous pre-contact row for this visitor, if one exists.
  const { data: anon } = await db.from('vsl_leads').select('*').eq('visitor_id', input.visitorId).eq('source', SOURCE).like('email', 'anon-%').maybeSingle()
  const { data: existing } = await db.from('vsl_leads').select('*').eq('email', email).maybeSingle()

  const priorQuiz = {
    ...((anon?.typeform_payload as SessionPayload)?.quiz || {}),
    ...((existing?.typeform_payload as SessionPayload)?.quiz || {}),
    ...input.quizSoFar,
  }
  const session = mergeSession(existing?.typeform_payload, {
    visitorId: input.visitorId, quiz: priorQuiz, sms_consent: input.smsConsent, attribution: input.attribution,
  })

  if (!existing) {
    const { error } = await db.from('vsl_leads').insert({
      email, name, phone, source: SOURCE, status: 'rs_lead', segment: 'rs_lead',
      opted_in_at: new Date().toISOString(), visitor_id: input.visitorId,
      utm: input.attribution?.utm || {}, typeform_payload: session,
    })
    if (error) await db.from('vsl_leads').update({ typeform_payload: session, name: name || undefined, phone: phone || undefined }).eq('email', email)
  } else {
    const patch: Record<string, unknown> = { typeform_payload: session }
    if (name && !existing.name) patch.name = name
    if (phone && !existing.phone) patch.phone = phone
    if (existing.status === 'rs_abandoned_pre_contact' || !existing.status) { patch.status = 'rs_lead'; patch.segment = 'rs_lead' }
    await db.from('vsl_leads').update(patch).eq('email', email)
  }
  if (anon?.id) await db.from('vsl_leads').delete().eq('id', anon.id).then(() => {}, () => {})

  await upsertContact(email, { name, phone, source: SOURCE, pipeline_stage: 'Lead', tags: ['roadmap-session', 'roadmap-session-lead'] })
  await logActivity(email, 'lead', 'Shared contact details on the Roadmap Session quiz', undefined, { funnel: SOURCE })
  emitEvent('lead_captured', { email, name: name || undefined, source: SOURCE }).catch(() => {})
  return { ok: true }
}

/* ── 3. Qualify (quiz step 5) — SubmitApplication on qualified ─────────────*/
export async function saveVerdict(input: {
  email: string
  verdict: 'qualified' | 'rejected'
  reject_reason?: string | null
  finalAnswer: unknown
}): Promise<{ ok: boolean }> {
  const email = normEmail(input.email)
  if (!email) return { ok: false }
  const db = getSupabaseAdmin()
  const { data: lead } = await db.from('vsl_leads').select('*').eq('email', email).maybeSingle()
  const quiz = { ...((lead?.typeform_payload as SessionPayload)?.quiz || {}), readiness: input.finalAnswer }
  const status = input.verdict === 'qualified' ? 'rs_qualified' : 'rs_rejected'
  const session = mergeSession(lead?.typeform_payload, { quiz, verdict: input.verdict, reject_reason: input.reject_reason ?? null })
  await db.from('vsl_leads').update({ status, segment: status, typeform_payload: session }).eq('email', email)

  await upsertContact(email, { pipeline_stage: input.verdict === 'qualified' ? 'Qualified' : 'Not Qualified', tags: ['roadmap-session', input.verdict === 'qualified' ? 'roadmap-session-qualified' : 'roadmap-session-rejected'] })
  await logActivity(email, 'lead', input.verdict === 'qualified' ? 'Qualified for a free Roadmap Session' : 'Did not qualify for a Roadmap Session right now', undefined, { funnel: SOURCE, reason: input.reject_reason })
  if (input.verdict === 'rejected') await enterNurture(email)
  return { ok: true }
}

/* ── 3b. Unqualified nurture — tags the contact so the comms engine can pick
   up the 3-email sequence (lib/comm/*). Sequence copy lives in content.ts /
   docs; wiring the actual send schedule is a comms-engine config task, not
   funnel code, and is flagged in docs/open-questions.md. */
export async function enterNurture(email: string): Promise<void> {
  const e = normEmail(email)
  if (!e) return
  const db = getSupabaseAdmin()
  const { data: lead } = await db.from('vsl_leads').select('typeform_payload').eq('email', e).maybeSingle()
  const session = mergeSession(lead?.typeform_payload, { nurture: { entered_at: new Date().toISOString(), sequence: 'roadmap-session-not-yet-3email' } })
  await db.from('vsl_leads').update({ typeform_payload: session }).eq('email', e)
  await logActivity(e, 'note', 'Entered the Roadmap Session not-yet-qualified nurture sequence', undefined, { funnel: SOURCE }).catch(() => {})
}

/* ── 4. Booked — mirrors lib/roadmap-audit.ts's markBooked pattern, kept
   separate so that file's behavior is untouched. ────────────────────────── */
export async function markBooked(email: string, booking: { start?: string; end?: string; tz?: string; uid?: string | number | null; meetingUrl?: string | null }): Promise<void> {
  const e = normEmail(email)
  if (!e) return
  const db = getSupabaseAdmin()
  const { data: lead } = await db.from('vsl_leads').select('*').eq('email', e).maybeSingle()
  const session = mergeSession(lead?.typeform_payload, { booking: { ...booking, at: new Date().toISOString() } })
  await db.from('vsl_leads').update({
    status: 'rs_booked', segment: 'rs_booked',
    call_booked_at: (lead?.call_booked_at as string) || new Date().toISOString(),
    typeform_payload: session,
  }).eq('email', e).then(() => {}, () => {})

  const { data: claim } = await db.from('vsl_leads')
    .update({ admin_notified_at: new Date().toISOString() })
    .eq('email', e).is('admin_notified_at', null).select('email').maybeSingle()

  const nm = (lead?.name as string) || null
  await upsertContact(e, { name: nm, phone: (lead?.phone as string) || null, source: SOURCE, pipeline_stage: 'Call Booked', call_booked: true, tags: ['roadmap-session', 'roadmap-session-booked'] })
  await logActivity(e, 'meeting', 'Booked a free Roadmap Session', undefined, { funnel: SOURCE })
  emitEvent('appointment_booked', { email: e, source: SOURCE }).catch(() => {})
  if (claim) await sendAdminEmail(e, nm, booking).catch(() => {})
}

export async function getStatus(email: string): Promise<{ found: boolean; name: string; booking: SessionPayload['booking'] | null }> {
  const e = normEmail(email)
  if (!e) return { found: false, name: '', booking: null }
  const db = getSupabaseAdmin()
  const { data: lead } = await db.from('vsl_leads').select('status,name,typeform_payload').eq('email', e).maybeSingle()
  if (!lead) return { found: false, name: '', booking: null }
  const session = (lead.typeform_payload || {}) as SessionPayload
  return { found: true, name: String(lead.name || ''), booking: session.booking || null }
}

async function sendAdminEmail(email: string, name: string | null, booking?: Record<string, unknown>): Promise<boolean> {
  const key = process.env.RESEND_API_KEY
  if (!key) return false
  const crmLink = `${SITE_URL}/admin/crm?q=${encodeURIComponent(email)}`
  const when = booking?.start ? new Date(String(booking.start)) : null
  const whenStr = when ? new Intl.DateTimeFormat('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', timeZoneName: 'short' }).format(when) : ''
  const html = `<!DOCTYPE html><html><body style="margin:0;background:#0b0b0b;font-family:Arial,sans-serif;padding:28px 16px;">
  <table width="600" align="center" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#141414;border:1px solid #262626;border-radius:14px;overflow:hidden;">
    <tr><td style="background:#0f0f0f;padding:20px 32px;border-bottom:1px solid #262626;">
      <span style="color:#f5f5f5;font-weight:800;font-size:12px;letter-spacing:2px;">THE5TH · ROADMAP SESSION</span>
    </td></tr>
    <tr><td style="padding:28px 32px;">
      <h1 style="color:#f5f5f5;font-size:20px;margin:0 0 16px;font-weight:600;">Roadmap Session booked</h1>
      <p style="margin:4px 0;color:#a3a3a3;font-size:14px;"><b style="color:#f5f5f5;">Name:</b> ${name || '—'}</p>
      <p style="margin:4px 0;color:#a3a3a3;font-size:14px;"><b style="color:#f5f5f5;">Email:</b> ${email}</p>
      ${whenStr ? `<p style="margin:4px 0;color:#a3a3a3;font-size:14px;"><b style="color:#f5f5f5;">When:</b> ${whenStr}</p>` : ''}
      <p style="margin:22px 0 0;"><a href="${crmLink}" style="display:inline-block;background:#C9A84C;color:#111;font-weight:800;font-size:14px;padding:12px 24px;border-radius:8px;text-decoration:none;">Open CRM record →</a></p>
    </td></tr>
  </table></body></html>`
  try {
    await new Resend(key).emails.send({ from: FROM, to: ADMIN_EMAIL, subject: `Roadmap Session booked — ${name || email}`, html })
    return true
  } catch (e) {
    console.error('roadmap-session sendAdminEmail failed', e)
    return false
  }
}
