import { NextRequest, NextResponse } from 'next/server'
import { adminEmail } from '@/lib/session'
import { listMeetings, syncCalcomBookings } from '@/lib/meetings'

export const dynamic = 'force-dynamic'
export const maxDuration = 30

/* GET ?status= — meetings list (all providers). */
export async function GET(req: NextRequest) {
  if (!adminEmail(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const status = new URL(req.url).searchParams.get('status') || undefined
  return NextResponse.json({ meetings: await listMeetings({ status }) })
}

/* POST ?sync=calcom — reconcile Cal.com bookings into meetings + opportunities. */
export async function POST(req: NextRequest) {
  if (!adminEmail(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const sync = new URL(req.url).searchParams.get('sync')
  if (sync === 'calcom') return NextResponse.json(await syncCalcomBookings())
  return NextResponse.json({ error: 'Unknown action.' }, { status: 400 })
}
