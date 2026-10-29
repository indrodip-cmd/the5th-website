import { NextRequest, NextResponse } from 'next/server'
import { limit, clientIp } from '@/lib/rateLimit'
import { sanitizeText } from '@/lib/validation'
import { saveQuizStep } from '@/lib/roadmap-session'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/* Saves one quiz step as soon as it's answered, so an abandoned quiz still
   persists (brief P1 item 2). Keyed by visitor_id until an email exists. */
export async function POST(req: NextRequest) {
  const rl = await limit(`rs-quiz-progress:ip:${clientIp(req)}`, 60, 600)
  if (!rl.ok) return NextResponse.json({ error: 'Too many attempts. Please wait a moment.' }, { status: 429 })

  try {
    const body = await req.json().catch(() => ({}))
    const visitorId = typeof body?.visitorId === 'string' ? body.visitorId.slice(0, 64) : ''
    const stepId = typeof body?.stepId === 'string' ? body.stepId.slice(0, 40) : ''
    if (!visitorId || !stepId) return NextResponse.json({ error: 'invalid_request' }, { status: 400 })

    const answer = Array.isArray(body?.answer)
      ? body.answer.slice(0, 24).map((x: unknown) => sanitizeText(x, 120))
      : sanitizeText(body?.answer, 200)
    const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : null
    const utm = body?.utm && typeof body.utm === 'object' ? body.utm : {}
    const fbp = typeof body?.fbp === 'string' ? body.fbp.slice(0, 120) : null
    const fbc = typeof body?.fbc === 'string' ? body.fbc.slice(0, 120) : null

    await saveQuizStep({ visitorId, email, stepId, answer, attribution: { fbp, fbc, utm } })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'server_error' }, { status: 500 })
  }
}
