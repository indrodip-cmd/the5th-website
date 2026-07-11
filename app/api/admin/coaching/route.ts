import { NextRequest, NextResponse } from 'next/server'
import { adminEmail } from '@/lib/session'
import { coachingTrends, recentCoachingIntel, syncCoachingIntel } from '@/lib/coaching-intel'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

/* GET — coaching intelligence trends + recent analyzed calls (for admin UI). */
export async function GET(req: NextRequest) {
  if (!adminEmail(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const [trends, recent] = await Promise.all([coachingTrends(), recentCoachingIntel(15)])
  return NextResponse.json({ trends, recent })
}

/* POST ?action=analyze — analyze a batch of not-yet-analyzed Fathom coaching
   calls (backfill). Resumable: returns how many are left so the UI can re-run. */
export async function POST(req: NextRequest) {
  if (!adminEmail(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const res = await syncCoachingIntel(30).catch((e) => ({ analyzed: 0, remaining: -1, error: String(e) }))
  return NextResponse.json(res)
}
