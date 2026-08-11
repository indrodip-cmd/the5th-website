import { NextRequest, NextResponse } from 'next/server'
import { emitEvent } from '@/lib/events'
import { logActivity } from '@/lib/crm'
import { isValidEmail } from '@/lib/validation'

export const dynamic = 'force-dynamic'

/* Funnel telemetry from the quiz results page → Journey Intelligence + CRM
   timeline. Fire-and-forget; only a known allowlist of events is accepted so a
   malicious client cannot inject arbitrary activity. */
const ALLOWED = new Set([
  'free_report_viewed', 'paywall_viewed', 'checkout_started',
  'full_report_viewed', 'strategy_call_booked',
])

/* Events worth pinning to the contact's CRM timeline (not just the event bus). */
const TIMELINE: Record<string, { type: string; title: string }> = {
  paywall_viewed: { type: 'program_view', title: 'Viewed the $27 diagnostic offer' },
  checkout_started: { type: 'program_view', title: 'Started diagnostic checkout' },
  full_report_viewed: { type: 'program_view', title: 'Opened their full diagnostic report' },
  strategy_call_booked: { type: 'call_booked', title: 'Booked a strategy call from the report' },
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const event = String(body?.event || '')
    if (!ALLOWED.has(event)) return NextResponse.json({ ok: true, ignored: true })

    const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : ''
    const meta = (body?.meta && typeof body.meta === 'object') ? body.meta : {}

    await emitEvent(event, { email: email || undefined, source: 'quiz', ...meta })

    const t = TIMELINE[event]
    if (t && email && isValidEmail(email)) {
      await logActivity(email, t.type, t.title).catch(() => {})
    }
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: true })
  }
}
