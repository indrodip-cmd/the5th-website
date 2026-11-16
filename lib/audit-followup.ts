/* Follow-up state for the $29 audit, stored in vsl_leads.typeform_payload.audit.followup:
   which reminders went out, and whether the post-call assets were delivered. */
import { Resend } from 'resend'
import { getSupabaseAdmin } from '@/lib/supabase'
import { AUDIT_SOURCE, type AuditPayload } from '@/lib/roadmap-audit'
import { getBookingsOverview } from '@/lib/calcom'
import { AUDIT_FROM, reminder24Email, reminder1hEmail } from '@/lib/audit-emails'

type Lead = { email: string; name: string | null; status: string; typeform_payload: AuditPayload | null }

export async function getAuditLead(email: string): Promise<Lead | null> {
  const { data } = await getSupabaseAdmin().from('vsl_leads').select('email,name,status,typeform_payload').eq('email', email).eq('source', AUDIT_SOURCE).maybeSingle()
  return (data as Lead | null) || null
}

export async function patchFollowup(email: string, patch: NonNullable<AuditPayload['followup']>): Promise<void> {
  const db = getSupabaseAdmin()
  const { data } = await db.from('vsl_leads').select('typeform_payload').eq('email', email).maybeSingle()
  const audit = ((data?.typeform_payload || {}) as AuditPayload)
  await db.from('vsl_leads').update({ typeform_payload: { ...audit, v: 'audit', followup: { ...(audit.followup || {}), ...patch } } }).eq('email', email)
}

/* Booked audit leads whose call has already started and that have not been sent
   the assets yet: the admin's worklist of people to mark as attended. */
export async function pendingAttendees(now = new Date()) {
  const { data } = await getSupabaseAdmin().from('vsl_leads').select('email,name,status,typeform_payload').eq('source', AUDIT_SOURCE).eq('status', 'audit_booked').limit(2000)
  return ((data || []) as Lead[])
    .filter((l) => { const a = l.typeform_payload; return a?.booking?.start && new Date(a.booking.start) <= now && !a.followup?.assets_sent_at })
    .map((l) => ({ email: l.email, name: l.name, start: l.typeform_payload!.booking!.start! }))
    .sort((a, b) => b.start.localeCompare(a.start))
}

/* Pre-call reminders. Call this on a short interval (about every 15 minutes): the
   existing vercel.json crons are daily, so it is NOT scheduled there. Idempotent:
   each reminder is stamped on the lead and never repeats. The 24h reminder is
   skipped for bookings made less than 25h ahead (the confirmation already covers it). */
export async function sendDueReminders(now = new Date()) {
  const key = process.env.RESEND_API_KEY
  const out = { checked: 0, reminder24: 0, reminder1h: 0, skipped: 0 }
  if (!key) return { ...out, error: 'RESEND_API_KEY not set' }
  const resend = new Resend(key)
  const { upcoming } = await getBookingsOverview()
  for (const b of upcoming) {
    out.checked++
    const lead = b.email ? await getAuditLead(b.email) : null
    const audit = lead?.typeform_payload
    if (!lead || lead.status !== 'audit_booked' || !audit?.booking?.start) { out.skipped++; continue }
    const startMs = new Date(b.start).getTime()
    const hoursOut = (startMs - now.getTime()) / 3600000
    const bookedAt = audit.booking.at ? new Date(audit.booking.at).getTime() : 0
    const leadHours = bookedAt ? (startMs - bookedAt) / 3600000 : 0
    const f = audit.followup || {}

    if (hoursOut <= 24 && hoursOut > 2 && leadHours > 25 && !f.reminder24_at) {
      const m = reminder24Email({ name: lead.name || b.name, start: b.start })
      await patchFollowup(lead.email, { reminder24_at: now.toISOString() })
      const r = await resend.emails.send({ from: AUDIT_FROM, to: lead.email, subject: m.subject, html: m.html }).catch(() => null)
      if (r && !r.error) out.reminder24++; else await patchFollowup(lead.email, { reminder24_at: undefined })
    } else if (hoursOut <= 1.1 && hoursOut > 0 && leadHours > 1.2 && !f.reminder1h_at) {
      const m = reminder1hEmail({ name: lead.name || b.name, start: b.start, meetingUrl: b.meetingUrl || audit.booking.meetingUrl })
      await patchFollowup(lead.email, { reminder1h_at: now.toISOString() })
      const r = await resend.emails.send({ from: AUDIT_FROM, to: lead.email, subject: m.subject, html: m.html }).catch(() => null)
      if (r && !r.error) out.reminder1h++; else await patchFollowup(lead.email, { reminder1h_at: undefined })
    }
  }
  return out
}
