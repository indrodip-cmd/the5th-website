import { NextRequest, NextResponse } from 'next/server'
import { runWorkbookCampaign } from '@/lib/workbook-campaign'

export const dynamic = 'force-dynamic'
export const maxDuration = 120

/* Daily runner for The Knowledge Asset post-purchase nurture. For each buyer it
   sends whichever emails are due based on days-since-purchase (relative drip),
   branching on live quiz + cal.com-booking status. Idempotent per
   (email, email_key), so re-runs never double-send.

   SAFETY: does nothing unless WORKBOOK_CAMPAIGN_LIVE === 'true' — the whole
   system can be built, deployed and inspected without a single real send. */
export async function GET(req: NextRequest) {
  if (req.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }
  if (process.env.WORKBOOK_CAMPAIGN_LIVE !== 'true') {
    return NextResponse.json({ ok: true, skipped: 'not live (set WORKBOOK_CAMPAIGN_LIVE=true)' })
  }
  const result = await runWorkbookCampaign()
  return NextResponse.json(result)
}
