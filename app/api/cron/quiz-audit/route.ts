import { NextRequest, NextResponse } from 'next/server'
import { runQuizAuditCampaign } from '@/lib/quiz/audit-mail'

export const dynamic = 'force-dynamic'
export const maxDuration = 120

/* Daily runner for the 14-email audit sequence. ?dry=1 reports what it WOULD send. */
export async function GET(req: NextRequest) {
  if (req.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  if (process.env.QUIZ_AUDIT_CAMPAIGN_LIVE === 'false') return NextResponse.json({ ok: true, skipped: 'paused (QUIZ_AUDIT_CAMPAIGN_LIVE=false)' })
  return NextResponse.json(await runQuizAuditCampaign({ dry: req.nextUrl.searchParams.get('dry') === '1' }))
}
