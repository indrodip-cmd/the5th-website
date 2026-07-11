import { NextRequest, NextResponse } from 'next/server'
import { adminEmail } from '@/lib/session'
import { executiveSummary } from '@/lib/executive/summary'
import { dailyBriefing } from '@/lib/ai/command'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

export async function GET(req: NextRequest) {
  if (!adminEmail(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  return NextResponse.json({ summary: await executiveSummary() })
}

/* POST { action:'briefing' } — Command AI's grounded morning briefing. */
export async function POST(req: NextRequest) {
  const actor = adminEmail(req)
  if (!actor) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const b = await req.json().catch(() => ({}))
  if (b?.action === 'briefing') { const r = await dailyBriefing(actor); return NextResponse.json({ ok: true, briefing: r.reply }) }
  return NextResponse.json({ error: 'unknown action' }, { status: 400 })
}
