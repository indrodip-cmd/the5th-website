import { NextRequest, NextResponse } from 'next/server'
import { syncCalcomBookings, syncFathomRecordings } from '@/lib/meetings'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

/* Single daily CRM sync (fits the Hobby plan's 2-cron / once-daily limits):
   reconcile Cal.com bookings into meetings + opportunities, then pull recent
   Fathom recordings. Both no-op when their credentials aren't set. */
export async function GET(req: NextRequest) {
  if (req.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const calcom = await syncCalcomBookings().catch((e) => ({ error: String(e) }))
  const fathom = await syncFathomRecordings().catch((e) => ({ error: String(e) }))
  return NextResponse.json({ ok: true, calcom, fathom })
}
