import { NextRequest, NextResponse } from 'next/server'
import { adminEmail } from '@/lib/session'
import { getRevenueSummary, getBalances, getRevenueTrend } from '@/lib/revenue'
import { whopConfigured } from '@/lib/connectors/whop'

export const dynamic = 'force-dynamic'

/* GET — revenue summary + balances + 30-day trend for the Revenue Center. */
export async function GET(req: NextRequest) {
  if (!adminEmail(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const [summary, balances, trend] = await Promise.all([getRevenueSummary(), getBalances(), getRevenueTrend(30)])
  return NextResponse.json({ summary, balances, trend, providers: { whop: whopConfigured() } })
}
