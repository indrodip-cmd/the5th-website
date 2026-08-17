import { NextRequest, NextResponse } from 'next/server'
import { getSlots } from '@/lib/calcom'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/* Real availability from cal.com, grouped by day for the premium booking UI.
   Never fabricates slots — an empty list means the booking step falls back to
   the cal.com embed. */
export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const tz = url.searchParams.get('tz') || 'UTC'
  const days = Math.min(30, Math.max(3, Number(url.searchParams.get('days')) || 14))
  const slots = await getSlots(tz, days, 12)

  const byDay: Record<string, string[]> = {}
  for (const s of slots) {
    const day = new Date(s.start).toLocaleDateString('en-CA', { timeZone: tz }) // YYYY-MM-DD
    ;(byDay[day] = byDay[day] || []).push(s.start)
  }
  const days_out = Object.keys(byDay).sort().map((day) => ({ day, slots: byDay[day] }))
  return NextResponse.json({ configured: slots.length > 0, tz, days: days_out }, { headers: { 'Cache-Control': 'no-store' } })
}
