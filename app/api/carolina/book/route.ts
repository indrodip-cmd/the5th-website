import { NextRequest, NextResponse } from 'next/server'
import { createBooking, CAL_PUBLIC_LINK } from '@/lib/calcom'
import { sendAppointmentEmail } from '@/lib/carolina-email'
import { limit, clientIp } from '@/lib/rateLimit'
import { isValidEmail, sanitizeText } from '@/lib/validation'
import { logActivity, upsertContact } from '@/lib/crm'
import { emitEvent } from '@/lib/events'

export const dynamic = 'force-dynamic'
export const maxDuration = 30

/* Book a strategy call directly from the in-chat calendar (no redirect).
   Creates the cal.com booking, emails confirmation, and records it in the CRM. */
export async function POST(req: NextRequest) {
  const ip = clientIp(req)
  const rl = await limit(`carolina:book:${ip}`, 8, 600)
  if (!rl.ok) return NextResponse.json({ error: 'Too many attempts — please try again shortly.' }, { status: 429 })

  const body = await req.json().catch(() => null)
  const name = sanitizeText(body?.name, 120)
  const email = String(body?.email || '').trim().toLowerCase()
  const start = String(body?.start || '')
  const tz = sanitizeText(body?.timeZone, 60) || 'UTC'
  const notes = sanitizeText(body?.notes, 800)
  if (!name || !isValidEmail(email) || !start) {
    return NextResponse.json({ error: 'Please provide your name, a valid email, and pick a time.' }, { status: 400 })
  }

  const booking = await createBooking({ startISO: start, name, email, timeZone: tz, notes })
  if (!booking.ok) {
    return NextResponse.json({ error: 'That time just became unavailable — please pick another.', fallback_link: CAL_PUBLIC_LINK }, { status: 409 })
  }

  const emailed = await sendAppointmentEmail({ name, email, startISO: booking.start || start, timeZone: tz, meetingUrl: booking.meetingUrl })
  await upsertContact(email, { name, call_booked: true, booking_start: booking.start || start, timezone: tz, pipeline_stage: 'call_booked' })
  await logActivity(email, 'call_booked', 'Strategy call booked', new Date(booking.start || start).toISOString(), { meetingUrl: booking.meetingUrl || null, via: 'in-chat calendar' })
  emitEvent('appointment_booked', { email, start: booking.start || start })

  return NextResponse.json({ ok: true, start: booking.start || start, email_sent: emailed, meeting_url: booking.meetingUrl || null })
}
