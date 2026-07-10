import { NextRequest, NextResponse } from 'next/server'
import { syncCalcomBookings } from '@/lib/meetings'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

/* Periodic Cal.com reconcile into meetings + opportunities (keeps the pipeline
   fresh even when no admin has the panel open). */
export async function GET(req: NextRequest) {
  if (req.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  return NextResponse.json(await syncCalcomBookings())
}
