import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { adminEmail } from '@/lib/session'
import { getBookingsOverview, type CalBooking } from '@/lib/calcom'

export const dynamic = 'force-dynamic'
export const maxDuration = 30

// Stages early enough that a fresh booking should advance them to "call_booked".
const EARLY = new Set(['new', 'qualified', 'discovery', '', null, undefined])

/* Live cal.com bookings for the CRM "Calls Booked" panel.
   Every fetch also reconciles bookings into the native CRM so the pipeline
   stays automatic: booked attendees become contacts, get call_booked + their
   next appointment time, and early-stage contacts advance to "call_booked". */
export async function GET(req: NextRequest) {
  if (!adminEmail(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const ov = await getBookingsOverview()
  if (!ov.configured) {
    return NextResponse.json({ configured: false, hint: 'Set CALCOM_API_KEY in the environment to show live bookings.' })
  }

  try {
    const db = getSupabaseAdmin()
    // Nearest upcoming booking per attendee email.
    const byEmail = new Map<string, CalBooking>()
    for (const b of ov.upcoming) if (b.email && !byEmail.has(b.email)) byEmail.set(b.email, b)
    const emails = [...byEmail.keys()]
    if (emails.length) {
      const { data: existing } = await db.from('carolina_leads').select('email,pipeline_stage,name').in('email', emails)
      const exMap = new Map((existing || []).map((r) => [r.email, r]))
      await Promise.all([...byEmail].map(async ([email, b]) => {
        const ex = exMap.get(email)
        const now = new Date().toISOString()
        if (!ex) {
          await db.from('carolina_leads').upsert(
            { email, name: b.name || null, source: 'cal.com', call_booked: true, booking_start: b.start, pipeline_stage: 'call_booked', tags: ['call'], updated_at: now },
            { onConflict: 'email' },
          )
        } else {
          const patch: Record<string, unknown> = { call_booked: true, booking_start: b.start, updated_at: now }
          if (b.name && !ex.name) patch.name = b.name
          if (EARLY.has(ex.pipeline_stage)) patch.pipeline_stage = 'call_booked'
          await db.from('carolina_leads').update(patch).eq('email', email)
        }
      }))
    }
  } catch (e) {
    console.error('calcom CRM reconcile failed', e)
  }

  return NextResponse.json({
    configured: true,
    totalBooked: ov.totalBooked,
    upcomingCount: ov.upcomingCount,
    pastCount: ov.pastCount,
    cancelledCount: ov.cancelledCount,
    noShowCount: ov.noShowCount,
    upcoming: ov.upcoming.slice(0, 25),
    past: ov.past,
    cancelled: ov.cancelled,
  })
}
