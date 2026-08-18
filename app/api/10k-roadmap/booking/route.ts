import { NextRequest, NextResponse } from 'next/server'
import { limit, clientIp } from '@/lib/rateLimit'
import { isValidEmail, sanitizeName } from '@/lib/validation'
import { createBooking } from '@/lib/calcom'
import { markBooked, getAuditStatus } from '@/lib/roadmap-audit'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const AUDIT_MINUTES = 60

/* Create the real cal.com booking, then record it on the audit lead. Only a
   paid lead may book. Returns the confirmed booking so the success page can
   build the calendar event. Booking failure never charges again — the deposit
   already succeeded; the user simply retries this step. */
export async function POST(req: NextRequest) {
  const ip = clientIp(req)
  const rl = await limit(`audit-book:ip:${ip}`, 15, 600)
  if (!rl.ok) return NextResponse.json({ error: 'Too many attempts. Please wait a moment.' }, { status: 429 })

  try {
    const body = await req.json().catch(() => ({}))
    const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : ''
    const name = sanitizeName(body?.name)
    const startISO = typeof body?.start === 'string' ? body.start : ''
    const timeZone = typeof body?.tz === 'string' ? body.tz : 'UTC'
    if (!isValidEmail(email)) return NextResponse.json({ error: 'invalid_email' }, { status: 400 })
    if (!startISO || Number.isNaN(Date.parse(startISO))) return NextResponse.json({ error: 'invalid_time' }, { status: 400 })

    // Trust the Whop post-payment redirect: require the lead to exist (saved on
    // the post-payment page) rather than a webhook-confirmed paid flag, so the
    // shared checkout plan works without extra env wiring.
    const status = await getAuditStatus(email)
    if (!status.found) return NextResponse.json({ error: 'lead_not_found' }, { status: 404 })

    const res = await createBooking({
      startISO, name: name || status.name || 'Guest', email, timeZone,
      notes: '10K Roadmap Audit — deposit paid. See CRM for qualification + deep diagnostic answers.',
    })
    if (!res.ok) return NextResponse.json({ error: res.error || 'booking_failed' }, { status: 502 })

    const start = res.start || startISO
    const end = new Date(new Date(start).getTime() + AUDIT_MINUTES * 60000).toISOString()
    await markBooked(email, { start, end, tz: timeZone, uid: res.bookingId ?? null, meetingUrl: res.meetingUrl ?? null })

    return NextResponse.json({ ok: true, booking: { start, end, tz: timeZone, uid: res.bookingId ?? null, meetingUrl: res.meetingUrl ?? null } })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
