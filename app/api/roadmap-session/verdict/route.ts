import { NextRequest, NextResponse } from 'next/server'
import { limit, clientIp } from '@/lib/rateLimit'
import { isValidEmail } from '@/lib/validation'
import { saveVerdict } from '@/lib/roadmap-session'
import { sendCapiEvent } from '@/lib/meta-capi'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/* Quiz step 5 — "are you in a position to invest in support over the next
   90 days?" Yes / Need to discuss both qualify (routed to booking); No does
   not (routed to the free resource + nurture). Re-derived server-side —
   never trust a client-sent verdict. */
function verdictFrom(answer: string): { verdict: 'qualified' | 'rejected'; reason: string | null } {
  if (answer === 'no') return { verdict: 'rejected', reason: 'not_ready_to_invest' }
  if (answer === 'yes' || answer === 'discuss') return { verdict: 'qualified', reason: null }
  return { verdict: 'rejected', reason: 'unanswered' }
}

export async function POST(req: NextRequest) {
  const ip = clientIp(req)
  const rl = await limit(`rs-verdict:ip:${ip}`, 20, 600)
  if (!rl.ok) return NextResponse.json({ error: 'Too many attempts. Please wait a moment.' }, { status: 429 })

  try {
    const body = await req.json().catch(() => ({}))
    const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : ''
    const answer = typeof body?.answer === 'string' ? body.answer.slice(0, 24) : ''
    const eventId = typeof body?.eventId === 'string' ? body.eventId.slice(0, 80) : `rs-app-${Date.now()}`
    if (!isValidEmail(email)) return NextResponse.json({ error: 'invalid_email' }, { status: 400 })

    const { verdict, reason } = verdictFrom(answer)
    await saveVerdict({ email, verdict, reject_reason: reason, finalAnswer: answer })

    if (verdict === 'qualified') {
      await sendCapiEvent({
        eventName: 'SubmitApplication', eventId, sourceUrl: typeof body?.pageUrl === 'string' ? body.pageUrl : '',
        user: { email, clientIp: ip, userAgent: req.headers.get('user-agent') },
      }).catch(() => {})
    }

    return NextResponse.json({ ok: true, verdict })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
