import { NextRequest, NextResponse } from 'next/server'
import { runSiteInsights } from '@/lib/site-opt/insights'

export const dynamic = 'force-dynamic'
export const maxDuration = 120

/* Nightly: find weak buttons/pages, draft better copy, email a digest. Proposals stay PENDING until approved. */
export async function GET(req: NextRequest) {
  if (req.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  return NextResponse.json(await runSiteInsights({ dry: req.nextUrl.searchParams.get('dry') === '1' }))
}
