import { NextRequest, NextResponse } from 'next/server'
import { getSlots, CAL_PUBLIC_LINK } from '@/lib/calcom'
import { limit, clientIp } from '@/lib/rateLimit'
import { sanitizeText } from '@/lib/validation'

export const dynamic = 'force-dynamic'

/* Available strategy-call slots for the in-chat calendar. Grouped by day,
   labelled in the visitor's timezone. */
export async function GET(req: NextRequest) {
  const ip = clientIp(req)
  const rl = await limit(`carolina:avail:${ip}`, 30, 300)
  if (!rl.ok) return NextResponse.json({ error: 'Please try again shortly.' }, { status: 429 })

  const tz = sanitizeText(new URL(req.url).searchParams.get('tz'), 60) || 'UTC'
  const slots = await getSlots(tz, 14, 6)
  if (!slots.length) return NextResponse.json({ days: [], fallback_link: CAL_PUBLIC_LINK, tz })

  const days: Record<string, { start: string; label: string }[]> = {}
  const dayFmt = new Intl.DateTimeFormat('en-US', { weekday: 'short', month: 'short', day: 'numeric', timeZone: tz })
  const timeFmt = new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', timeZone: tz })
  for (const s of slots) {
    const d = new Date(s.start)
    const key = dayFmt.format(d)
    if (!days[key]) days[key] = []
    days[key].push({ start: s.start, label: timeFmt.format(d) })
  }
  const ordered = Object.keys(days).map((label) => ({ label, slots: days[label] }))
  return NextResponse.json({ days: ordered, tz })
}
