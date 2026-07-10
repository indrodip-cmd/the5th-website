import { NextRequest, NextResponse } from 'next/server'
import { adminEmail } from '@/lib/session'
import { getContentStats, refreshContentStats } from '@/lib/content-attribution'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

/* GET — content attribution stats (views/unique/leads/revenue per CMS item). */
export async function GET(req: NextRequest) {
  if (!adminEmail(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  return NextResponse.json({ stats: await getContentStats() })
}

/* POST — refresh stats now. */
export async function POST(req: NextRequest) {
  if (!adminEmail(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  return NextResponse.json(await refreshContentStats())
}
