import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { adminEmail } from '@/lib/session'
import { isValidEmail } from '@/lib/validation'
import { logActivity } from '@/lib/crm'
import { assetLinks } from '@/lib/audit-assets.server'
import { AUDIT_FROM, postCallEmail } from '@/lib/audit-emails'
import { getAuditLead, patchFollowup, pendingAttendees } from '@/lib/audit-followup'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/* The ONLY way the post-call assets (ebook + software access) are ever sent.
   Admin-only, manual, one attendee at a time. Never called at booking time and
   never run automatically, so no-shows cannot receive them.
   GET  -> booked leads whose call has started and who have not been sent assets yet.
   POST -> { email }: marks attended = true and sends the post-call email, once. */
export async function GET(req: NextRequest) {
  if (!adminEmail(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  return NextResponse.json({ pending: await pendingAttendees() })
}

export async function POST(req: NextRequest) {
  const admin = adminEmail(req)
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json().catch(() => ({}))
  const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : ''
  if (!isValidEmail(email)) return NextResponse.json({ error: 'Valid email required' }, { status: 400 })

  const links = assetLinks()
  if (!links) return NextResponse.json({ error: 'AUDIT_EBOOK_URL and AUDIT_SOFTWARE_URL must both be set (https) before assets can be sent.' }, { status: 503 })
  const key = process.env.RESEND_API_KEY
  if (!key) return NextResponse.json({ error: 'RESEND_API_KEY not set' }, { status: 503 })

  const lead = await getAuditLead(email)
  const booking = lead?.typeform_payload?.booking
  if (!lead || !booking?.start) return NextResponse.json({ error: 'No booked audit found for that email.' }, { status: 404 })
  if (new Date(booking.start) > new Date()) return NextResponse.json({ error: 'That call has not started yet.' }, { status: 409 })
  if (lead.typeform_payload?.followup?.assets_sent_at) return NextResponse.json({ ok: true, alreadySent: true })

  const now = new Date().toISOString()
  await patchFollowup(email, { attended: true, attended_at: now, attended_by: admin, assets_sent_at: now }) // claim first, so a double click cannot double send
  const m = postCallEmail({ name: lead.name, ebookUrl: links.ebook, softwareUrl: links.software })
  const r = await new Resend(key).emails.send({ from: AUDIT_FROM, to: email, subject: m.subject, html: m.html }).catch(() => null)
  if (!r || r.error) {
    await patchFollowup(email, { assets_sent_at: undefined })
    return NextResponse.json({ error: 'Email failed to send; nothing was recorded as sent.' }, { status: 502 })
  }
  await logActivity(email, 'note', 'Attended the audit; sent the ebook and software access', undefined, { funnel: 'audit', by: admin }).catch(() => {})
  return NextResponse.json({ ok: true, sent: true })
}
