import { NextRequest, NextResponse } from 'next/server'
import { adminEmail } from '@/lib/session'
import { getBookingsOverview } from '@/lib/calcom'
import { syncCalcomBookings } from '@/lib/meetings'

export const dynamic = 'force-dynamic'
export const maxDuration = 30

/* Live cal.com bookings for the CRM "Calls Booked" panel.
   Every fetch also reconciles bookings into the sales CRM: each booking becomes
   a deduped meeting linked to the contact + an open opportunity (advanced to
   Discovery Scheduled/Completed), with a journey event and reminder task. */
export async function GET(req: NextRequest) {
  if (!adminEmail(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const ov = await getBookingsOverview()
  if (!ov.configured) {
    return NextResponse.json({ configured: false, hint: 'Set CALCOM_API_KEY in the environment to show live bookings.' })
  }

  try {
    await syncCalcomBookings()
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
