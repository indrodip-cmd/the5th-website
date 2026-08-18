/* ─────────────────────────────────────────────────────────────────────────
   The $10K Roadmap Audit — funnel engine.

   Reuses the `vsl_leads` table (source = '10k-roadmap-audit') and the
   company-wide CRM (crm_contacts via lib/crm.ts) rather than a new table, so
   the paid audit funnel lands in the same inbox/CRM/segment views as every
   other funnel. All the structured funnel data (qualification answers, deep
   diagnostic, payment, booking) lives in the `typeform_payload` JSONB under a
   single `audit` object; `status`/`segment` carry the stage.

   State machine (keyed by email — email is the unique key):
     audit_reserved  →  audit_paid  →  audit_booked

   Every transition is idempotent and fails soft: funnel plumbing must never
   block a visitor-facing request, and webhook retries / double submits must
   never duplicate leads or admin emails.
   ───────────────────────────────────────────────────────────────────────── */
import crypto from 'crypto'
import { Resend } from 'resend'
import { getSupabaseAdmin } from '@/lib/supabase'
import { normEmail, normPhone, upsertContact, logActivity } from '@/lib/crm'
import { emitEvent } from '@/lib/events'

export const AUDIT_SOURCE = '10k-roadmap-audit'
// Defaults to the shared $27 plan so the webhook marks audit leads paid out of
// the box; override with a dedicated plan via WHOP_AUDIT_PLAN_ID for clean CRM.
export const AUDIT_PLAN_ID = process.env.WHOP_AUDIT_PLAN_ID || process.env.NEXT_PUBLIC_WHOP_AUDIT_PLAN_ID || 'plan_85pIPWE1K0uBB'

/* ── Signed "paid" pass (server-side step gating) ───────────────────────────
   After payment is verified against the DB, we hand the browser an HttpOnly,
   HMAC-signed cookie bound to the buyer's email. The gated step routes (server
   components) verify this cookie and redirect to Payment if it's missing/invalid
   — so Steps 3-5 can't be reached by direct URL without a confirmed payment. */
export const AUDIT_PAID_COOKIE = 'audit_paid_pass'
const PASS_SECRET = process.env.VSL_SESSION_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || 'dev-secret'
const PASS_MAX_AGE_MS = 24 * 60 * 60 * 1000 // 24h

export function signPaidPass(email: string): string {
  const payload = Buffer.from(JSON.stringify({ e: normEmail(email), t: Date.now() })).toString('base64url')
  const sig = crypto.createHmac('sha256', PASS_SECRET).update(payload).digest('base64url')
  return `${payload}.${sig}`
}

export function verifyPaidPass(token?: string | null): { email: string } | null {
  if (!token) return null
  const [payload, sig] = token.split('.')
  if (!payload || !sig) return null
  const expected = crypto.createHmac('sha256', PASS_SECRET).update(payload).digest('base64url')
  try { if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null } catch { return null }
  try {
    const j = JSON.parse(Buffer.from(payload, 'base64url').toString())
    if (!j?.e || typeof j.e !== 'string') return null
    if (Date.now() - Number(j.t || 0) > PASS_MAX_AGE_MS) return null
    return { email: String(j.e) }
  } catch { return null }
}

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://the5th.consulting').replace(/\/$/, '')
const FROM = 'The5th Consulting <indrodip@10kroadmap.org>'
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || process.env.NOTIFY_EMAIL || 'indrodip@10kroadmap.org'

type Row = Record<string, unknown>
type Stage = 'audit_reserved' | 'audit_paid' | 'audit_booked'

export type AuditPayload = {
  v: 'audit'
  qualification?: Record<string, unknown>
  verdict?: 'qualified' | 'rejected'
  reject_reason?: string | null
  deep?: Record<string, unknown>
  payment?: { status: string; id?: string | null; at?: string }
  booking?: { start?: string; end?: string; tz?: string; uid?: string | number | null; meetingUrl?: string | null; at?: string }
}

const SEGMENT_TAG: Record<Stage, string> = {
  audit_reserved: 'audit-reserved',
  audit_paid: 'audit-deposit-paid',
  audit_booked: 'audit-booked',
}
const SEGMENT_STAGE: Record<Stage, string> = {
  audit_reserved: 'Lead',
  audit_paid: 'Deposit Paid',
  audit_booked: 'Call Booked',
}

/* Merge a patch into the lead's audit payload (read-modify-write). */
function mergeAudit(existing: unknown, patch: Partial<AuditPayload>): AuditPayload {
  const base = (existing && typeof existing === 'object' ? existing : {}) as AuditPayload
  return { ...base, v: 'audit', ...patch }
}

async function mirrorToCrm(email: string, name: string | null, phone: string | null, stage: Stage, detail: string, extra?: Record<string, unknown>) {
  if (!email) return
  try {
    await upsertContact(email, {
      name: name || null,
      phone: phone || null,
      source: AUDIT_SOURCE,
      pipeline_stage: SEGMENT_STAGE[stage],
      ...(stage === 'audit_booked' ? { call_booked: true } : {}),
      tags: ['10k-roadmap-audit', SEGMENT_TAG[stage]],
    })
    await logActivity(
      email,
      stage === 'audit_booked' ? 'meeting' : stage === 'audit_paid' ? 'deal' : 'lead',
      detail,
      undefined,
      { funnel: AUDIT_SOURCE, stage, ...(extra || {}) },
    )
  } catch (e) {
    console.error('audit mirrorToCrm failed', e)
  }
}

/* ── 1. Save application (qualification answers + contact) ──────────────────
   Called at the "Reserve" step, the first point at which we have an email.
   Creates the lead (status audit_reserved) or backfills an existing one. */
export async function saveApplication(input: {
  name?: string | null
  email: string
  phone?: string | null
  city?: string | null
  country?: string | null
  visitorId?: string | null
  utm?: Record<string, unknown>
  qualification: Record<string, unknown>
  verdict: 'qualified' | 'rejected'
  reject_reason?: string | null
}): Promise<{ ok: boolean; error?: string }> {
  const email = normEmail(input.email)
  if (!email) return { ok: false, error: 'invalid_email' }
  const name = (input.name || '').trim().slice(0, 120) || null
  const phone = normPhone(input.phone)
  const db = getSupabaseAdmin()

  const { data: existing } = await db.from('vsl_leads').select('*').eq('email', email).maybeSingle()
  const audit = mergeAudit(existing?.typeform_payload, {
    qualification: input.qualification,
    verdict: input.verdict,
    reject_reason: input.reject_reason ?? null,
  })

  if (!existing) {
    const { error } = await db.from('vsl_leads').insert({
      email, name, phone,
      city: (input.city || '').trim().slice(0, 80) || null,
      country: (input.country || '').trim().slice(0, 2).toUpperCase() || null,
      source: AUDIT_SOURCE,
      status: 'audit_reserved',
      segment: 'audit_reserved',
      opted_in_at: new Date().toISOString(),
      last_watch_at: new Date().toISOString(),
      visitor_id: input.visitorId || null,
      utm: input.utm || {},
      typeform_payload: audit,
    })
    // Race on unique(email): re-read + patch instead of failing.
    if (error) {
      await db.from('vsl_leads').update({ typeform_payload: audit, name: name || undefined, phone: phone || undefined }).eq('email', email)
    }
  } else {
    const patch: Record<string, unknown> = { typeform_payload: audit }
    if (name && !existing.name) patch.name = name
    if (phone && !existing.phone) patch.phone = phone
    // Never downgrade a paid/booked lead back to reserved.
    if (existing.status !== 'audit_paid' && existing.status !== 'audit_booked') {
      patch.status = 'audit_reserved'; patch.segment = 'audit_reserved'
    }
    await db.from('vsl_leads').update(patch).eq('email', email)
  }

  // Mirror to CRM at the lead's CURRENT stage so a post-payment save (email
  // arrives after checkout now) never downgrades a paid/booked contact to "Lead".
  const stage: Stage = existing?.status === 'audit_booked' ? 'audit_booked' : existing?.status === 'audit_paid' ? 'audit_paid' : 'audit_reserved'
  const detail = stage === 'audit_reserved'
    ? 'Qualified for the $10K Roadmap Audit, reserving a slot'
    : 'Saved qualification answers to the audit lead'
  await mirrorToCrm(email, name, phone, stage, detail)
  emitEvent('lead_captured', { email, name: name || undefined, source: AUDIT_SOURCE }).catch(() => {})
  return { ok: true }
}

/* ── 2. Deposit paid (Whop webhook) ─────────────────────────────────────────
   Flip to audit_paid exactly once and email the founder. Upserts a lead if the
   buyer's Whop email never went through /reserve (so a payment is never lost). */
export async function markAuditPaid(email: string, name: string | null, receiptId: string): Promise<void> {
  const e = normEmail(email)
  if (!e) return
  const db = getSupabaseAdmin()
  const { data: lead } = await db.from('vsl_leads').select('*').eq('email', e).maybeSingle()
  const audit = mergeAudit(lead?.typeform_payload, {
    payment: { status: 'paid', id: receiptId || null, at: new Date().toISOString() },
  })

  if (!lead) {
    await db.from('vsl_leads').insert({
      email: e, name: name || null, source: AUDIT_SOURCE,
      status: 'audit_paid', segment: 'audit_paid',
      opted_in_at: new Date().toISOString(),
      typeform_payload: audit,
    }).then(() => {}, () => {})
  } else if (lead.status === 'audit_booked') {
    // Already further along — just record the payment, don't move the stage back.
    await db.from('vsl_leads').update({ typeform_payload: audit }).eq('email', e)
  } else {
    await db.from('vsl_leads').update({ status: 'audit_paid', segment: 'audit_paid', typeform_payload: audit }).eq('email', e)
  }

  const nm = (name || (lead?.name as string) || '') || null
  await mirrorToCrm(e, nm, (lead?.phone as string) || null, 'audit_paid', 'Paid the $27 audit commitment deposit', { receipt: receiptId })
  emitEvent('purchase_recorded', { email: e, product: '10k_roadmap_audit_deposit', amount: 27, source: AUDIT_SOURCE }).catch(() => {})
  await sendAdminEmail(e, nm, 'Deposit paid', '💳 $27 audit deposit paid — awaiting booking').catch(() => {})
}

/* ── 3. Deep diagnostic (post-payment) ─────────────────────────────────────*/
export async function saveDeep(email: string, answers: Record<string, unknown>): Promise<{ ok: boolean }> {
  const e = normEmail(email)
  if (!e) return { ok: false }
  const db = getSupabaseAdmin()
  const { data: lead } = await db.from('vsl_leads').select('typeform_payload,name').eq('email', e).maybeSingle()
  if (!lead) return { ok: false }
  const audit = mergeAudit(lead.typeform_payload, { deep: answers })
  await db.from('vsl_leads').update({ typeform_payload: audit }).eq('email', e)
  await logActivity(e, 'note', 'Completed the pre-call deep diagnostic', undefined, { funnel: AUDIT_SOURCE }).catch(() => {})
  emitEvent('deep_application_completed', { email: e, source: AUDIT_SOURCE }).catch(() => {})
  return { ok: true }
}

/* ── 4. Booked ─────────────────────────────────────────────────────────────*/
export async function markBooked(email: string, booking: { start?: string; end?: string; tz?: string; uid?: string | number | null; meetingUrl?: string | null }): Promise<void> {
  const e = normEmail(email)
  if (!e) return
  const db = getSupabaseAdmin()
  const { data: lead } = await db.from('vsl_leads').select('*').eq('email', e).maybeSingle()
  const audit = mergeAudit(lead?.typeform_payload, { booking: { ...booking, at: new Date().toISOString() } })
  await db.from('vsl_leads').update({
    status: 'audit_booked', segment: 'audit_booked',
    call_booked_at: (lead?.call_booked_at as string) || new Date().toISOString(),
    typeform_payload: audit,
  }).eq('email', e).then(() => {}, () => {})

  // Claim the admin notification exactly once.
  const { data: claim } = await db.from('vsl_leads')
    .update({ admin_notified_at: new Date().toISOString() })
    .eq('email', e).is('admin_notified_at', null).select('email').maybeSingle()

  const nm = (lead?.name as string) || null
  await mirrorToCrm(e, nm, (lead?.phone as string) || null, 'audit_booked', 'Booked the $10K Roadmap Audit')
  emitEvent('appointment_booked', { email: e, source: AUDIT_SOURCE }).catch(() => {})
  if (claim) await sendAdminEmail(e, nm, 'Audit booked', '📞 $10K Roadmap Audit booked', booking).catch(() => {})
}

export async function getAuditStatus(email: string): Promise<{ found: boolean; paid: boolean; booked: boolean; deepDone: boolean; name: string; booking: AuditPayload['booking'] | null }> {
  const e = normEmail(email)
  if (!e) return { found: false, paid: false, booked: false, deepDone: false, name: '', booking: null }
  const db = getSupabaseAdmin()
  const { data: lead } = await db.from('vsl_leads').select('status,name,typeform_payload').eq('email', e).maybeSingle()
  if (!lead) return { found: false, paid: false, booked: false, deepDone: false, name: '', booking: null }
  const audit = (lead.typeform_payload || {}) as AuditPayload
  const paid = audit.payment?.status === 'paid' || lead.status === 'audit_paid' || lead.status === 'audit_booked'
  return {
    found: true,
    paid,
    booked: lead.status === 'audit_booked' || Boolean(audit.booking?.start),
    deepDone: Boolean(audit.deep && Object.keys(audit.deep).length),
    name: String(lead.name || ''),
    booking: audit.booking || null,
  }
}

/* ── Admin notification (Resend) ───────────────────────────────────────────*/
async function sendAdminEmail(email: string, name: string | null, tag: string, subjectLead: string, booking?: Row): Promise<boolean> {
  const key = process.env.RESEND_API_KEY
  if (!key) return false
  const crmLink = `${SITE_URL}/admin/crm?q=${encodeURIComponent(email)}`
  const when = booking?.start ? new Date(String(booking.start)) : null
  const whenStr = when ? new Intl.DateTimeFormat('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', timeZoneName: 'short' }).format(when) : ''
  const html = `<!DOCTYPE html><html><body style="margin:0;background:#0b0b0b;font-family:Arial,sans-serif;padding:28px 16px;">
  <table width="600" align="center" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#141414;border:1px solid #262626;border-radius:14px;overflow:hidden;">
    <tr><td style="background:#0f0f0f;padding:20px 32px;border-bottom:1px solid #262626;">
      <span style="color:#f5f5f5;font-weight:800;font-size:12px;letter-spacing:2px;">THE5TH · 10K ROADMAP AUDIT</span>
      <span style="color:#C9A84C;font-size:10px;font-weight:800;letter-spacing:1px;float:right;">${tag.toUpperCase()}</span>
    </td></tr>
    <tr><td style="padding:28px 32px;">
      <h1 style="color:#f5f5f5;font-size:20px;margin:0 0 16px;font-weight:600;">${subjectLead}</h1>
      <p style="margin:4px 0;color:#a3a3a3;font-size:14px;"><b style="color:#f5f5f5;">Name:</b> ${name || '—'}</p>
      <p style="margin:4px 0;color:#a3a3a3;font-size:14px;"><b style="color:#f5f5f5;">Email:</b> ${email}</p>
      ${whenStr ? `<p style="margin:4px 0;color:#a3a3a3;font-size:14px;"><b style="color:#f5f5f5;">When:</b> ${whenStr}</p>` : ''}
      <p style="margin:22px 0 0;"><a href="${crmLink}" style="display:inline-block;background:#C9A84C;color:#111;font-weight:800;font-size:14px;padding:12px 24px;border-radius:8px;text-decoration:none;">Open CRM record →</a></p>
    </td></tr>
  </table></body></html>`
  try {
    await new Resend(key).emails.send({ from: FROM, to: ADMIN_EMAIL, subject: `${subjectLead} — ${name || email}`, html })
    return true
  } catch (e) {
    console.error('audit sendAdminEmail failed', e)
    return false
  }
}
