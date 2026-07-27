import { NextRequest, NextResponse } from 'next/server'
import { applyRetention } from '@/lib/coaching-security'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

// Weekly enforcement of the Coaching Intelligence data-retention policy.
// No-op unless a retention window (> 0 days) is set in the module's governance
// settings. Purges meetings + roleplays older than the window.
export async function GET(req: NextRequest) {
  if (req.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const r = await applyRetention()
  return NextResponse.json({ ok: r.ok, purged: r.purged })
}
