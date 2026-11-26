import { NextRequest, NextResponse } from 'next/server'
import { runBookCampaign } from '@/lib/book-mail'

export const dynamic = 'force-dynamic'
export const maxDuration = 120

/* Daily runner for the 5-email Chapter 1 campaign (days 1, 3, 5, 8, 12).
   Sends only to people who have not bought and have not unsubscribed;
   idempotent per (email, step). Pause it any time with BOOK_CAMPAIGN_PAUSED=true. */
export async function GET(req: NextRequest) {
  if (req.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  if (process.env.BOOK_CAMPAIGN_PAUSED === 'true') return NextResponse.json({ ok: true, skipped: 'paused' })
  return NextResponse.json(await runBookCampaign())
}
