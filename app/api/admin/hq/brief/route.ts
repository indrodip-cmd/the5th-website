// app/api/admin/hq/brief/route.ts
// AI "Daily COO Brief" over the whole business. Ported from the5th-platform.
// Gated by the website's server-side admin session (adminEmail cookie).

import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { adminEmail } from '@/lib/session'
import { buildMetrics } from '@/lib/hq/metrics'
import { getWhopRevenue } from '@/lib/hq/whop'
import { getCalBookings } from '@/lib/hq/calcom'
import { getWiseBalances } from '@/lib/hq/wise'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export const dynamic = 'force-dynamic'
export const maxDuration = 60

export async function POST(req: NextRequest) {
  if (!adminEmail(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const [m, whop, calcom, wise] = await Promise.all([
      buildMetrics(),
      getWhopRevenue(),
      getCalBookings(),
      getWiseBalances(),
    ])
    const cashLine = wise.connected
      ? `Cash in bank (Wise live): ${wise.balances.map((b) => `${b.currency} ${b.value.toLocaleString()}`).join(', ') || 'no balances'}.`
      : `Cash in bank: UNKNOWN — Wise not connected.`

    const revLine = whop.connected
      ? `Revenue (Whop live): MRR $${whop.mrr}, ARR $${whop.arr}, $${whop.revenue30d}/30d, $${whop.revenue7d}/7d, ${whop.newSales30d} new sales/30d, ${whop.refunds30d} refunds, ${whop.failedPayments} failed payments, ${whop.activeMemberships} active memberships.`
      : `Revenue: UNKNOWN — Whop API is not connected. Do NOT estimate revenue; explicitly tell the founder to add WHOP_API_KEY so revenue can be shown.`

    const bookingLine = calcom.connected
      ? `Bookings (Cal.com live): ${calcom.upcoming7d} upcoming in 7d, ${calcom.booked30d} booked/30d, ${calcom.cancelled30d} cancelled, ${calcom.noShows30d} no-shows.`
      : `Bookings: UNKNOWN — Cal.com is not connected. Do NOT estimate; note that CALCOM_API_KEY is needed.`

    const systemPrompt = `You are the COO of "The5th", a coaching + AI SaaS business, briefing the founder each morning. Analyze the data and return ONLY valid JSON — no markdown, no commentary.

Return exactly this structure:
{
  "headline": "one-sentence state of the business today",
  "momentum": "strong" | "building" | "stalling" | "at_risk",
  "momentum_reason": "string grounded in real numbers",
  "attention": [{"icon":"🔥","title":"string","detail":"string","action":"string","priority":"high"|"medium"|"low"}],
  "wins": [{"title":"string","detail":"string"}],
  "risks": [{"title":"string","detail":"string"}],
  "opportunities": [{"title":"string","detail":"string"}]
}

Rules:
- Every item must reference real numbers from the data.
- "attention" max 4, most urgent first. "wins"/"risks" max 3 each. "opportunities" max 3.
- If data is sparse or an integration is off, say so specifically — never fabricate numbers.
- Tone: sharp, direct, like a COO briefing a CEO who wants signal not fluff.`

    const userPrompt = `THE5TH — BUSINESS SNAPSHOT (${new Date().toISOString().split('T')[0]})

${revLine}
${cashLine}
Members by tier: ${m.growth.membersByTier.map((t) => `${t.label} x${t.count}`).join(', ') || 'none'}

GROWTH:
- Members: ${m.growth.totalMembers} total, ${m.growth.activeMembers} active, +${m.growth.newMembers7d} in 7d, +${m.growth.newMembers30d} in 30d
- Coaching-active: ${m.growth.coachingActive}
- AI trials: ${m.growth.trials} (${m.growth.trialsConverted} converted, ${m.growth.trialConversionRate}%)
- Cancellations/failed: ${m.growth.cancellations}

QUIZ FUNNEL:
- ${m.funnel.quizTotal} leads → ${m.funnel.quizVideo} watched video → ${m.funnel.quizBooked} booked call → ${m.funnel.quizConverted} converted (${m.funnel.quizConversionRate}%)
- Revenue logged by leads: $${m.funnel.quizRevenueLogged}
- Profile types: ${Object.entries(m.funnel.profileTypes).map(([k, v]) => `${k}:${v}`).join(', ') || 'none'}
- Sales pipeline stages: ${Object.entries(m.funnel.pipelineByStage).map(([k, v]) => `${k}:${v}`).join(', ') || 'none'}

PRODUCT USAGE:
- AI messages all-time: ${m.usage.totalAiMessages}, active AI users 7d: ${m.usage.aiActive7d}, conversations 30d: ${m.usage.conversations30d}
- Active sessions 7d: ${m.usage.activeSessions7d}, missions completed 7d: ${m.usage.missionsCompleted7d}
- Member-logged activity 7d: ${m.usage.tracker.dms} DMs, ${m.usage.tracker.calls} calls booked, ${m.usage.tracker.sales} sales, $${m.usage.tracker.cash} cash collected

${bookingLine}

Generate the founder brief now.`

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1400,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    })

    const raw = response.content[0]?.type === 'text' ? response.content[0].text : '{}'
    let brief: unknown
    try {
      brief = JSON.parse(raw)
    } catch {
      const match = raw.match(/\{[\s\S]*\}/)
      brief = match ? JSON.parse(match[0]) : {}
    }

    return NextResponse.json({ brief, generated_at: new Date().toISOString() })
  } catch (err) {
    console.error('[admin/hq/brief]', err)
    return NextResponse.json({ error: err instanceof Error ? err.message : 'error' }, { status: 500 })
  }
}
