import { NextRequest, NextResponse } from 'next/server'
import { limit, clientIp } from '@/lib/rateLimit'
import { getBookingsOverview } from '@/lib/calcom'

export const dynamic = 'force-dynamic'
export const maxDuration = 30

/* Public: the visitor's just-booked upcoming call, pulled live from the Cal.com
   API for the Thank-You page. Returns only that email's soonest upcoming call. */
export async function GET(req: NextRequest) {
  const email = (new URL(req.url).searchParams.get('email') || '').trim().toLowerCase()
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return NextResponse.json({ booking: null })
  const lim = await limit(`calrb:ip:${clientIp(req)}`, 30, 600)
  if (!lim.ok) return NextResponse.json({ booking: null })

  try {
    const ov = await getBookingsOverview()
    const mine = ov.upcoming.filter((b) => b.email === email).sort((a, b) => a.start.localeCompare(b.start))
    const b = mine[0]
    if (!b) return NextResponse.json({ booking: null })
    return NextResponse.json({ booking: { name: b.name, title: b.title, start: b.start, timeZone: b.timeZone, meetingUrl: b.meetingUrl || null } })
  } catch { return NextResponse.json({ booking: null }) }
}
