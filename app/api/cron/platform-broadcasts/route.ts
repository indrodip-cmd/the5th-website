import { NextRequest, NextResponse } from 'next/server'
import { dispatchScheduled } from '@/lib/platform/email'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

// Dispatches any platform broadcast whose scheduled_at has arrived, via Resend.
export async function GET(req: NextRequest) {
  if (req.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    return NextResponse.json(await dispatchScheduled())
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'error' }, { status: 500 })
  }
}
