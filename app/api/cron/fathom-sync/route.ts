import { NextRequest, NextResponse } from 'next/server'
import { syncFathomRecordings } from '@/lib/meetings'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

/* Poll recent Fathom recordings and attach them to matching meetings.
   Callable manually; the daily crm-sync cron also runs this. Credential-gated. */
export async function GET(req: NextRequest) {
  if (req.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  return NextResponse.json(await syncFathomRecordings())
}
