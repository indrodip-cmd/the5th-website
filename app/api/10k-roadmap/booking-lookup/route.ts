import { NextRequest, NextResponse } from 'next/server'
import { limit, clientIp } from '@/lib/rateLimit'
import { getBookingByUid, getBookingsOverview } from '@/lib/calcom'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 30

/* Thank-you page lookup: resolve the just-booked cal.com call by its uid (which
   cal.com appends to its post-booking redirect) or, as a fallback, by the
   attendee email. Returns the full booking so the page can show date/time +
   countdown + calendar links. Fails soft (booking: null). */
export async function GET(req: NextRequest) {
  const lim = await limit(`audit-cal-lookup:ip:${clientIp(req)}`, 40, 600)
  if (!lim.ok) return NextResponse.json({ booking: null })

  const url = new URL(req.url)
  const uid = (url.searchParams.get('uid') || '').trim()
  const email = (url.searchParams.get('email') || '').trim().toLowerCase()

  try {
    let b = uid ? await getBookingByUid(uid) : null
    if (!b && email && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
      const ov = await getBookingsOverview()
      const mine = ov.upcoming.filter((x) => x.email === email).sort((a, z) => a.start.localeCompare(z.start))
      b = mine[0] || null
    }
    if (!b) return NextResponse.json({ booking: null })
    return NextResponse.json({
      booking: { uid: b.uid, name: b.name, title: b.title, start: b.start, end: b.end, timeZone: b.timeZone, meetingUrl: b.meetingUrl || null },
    }, { headers: { 'Cache-Control': 'no-store' } })
  } catch {
    return NextResponse.json({ booking: null })
  }
}
