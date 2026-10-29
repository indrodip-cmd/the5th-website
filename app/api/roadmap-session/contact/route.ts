import { NextRequest, NextResponse } from 'next/server'
import { limit, clientIp } from '@/lib/rateLimit'
import { isValidEmail, sanitizeName, sanitizeAnswers } from '@/lib/validation'
import { saveContact } from '@/lib/roadmap-session'
import { sendCapiEvent } from '@/lib/meta-capi'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/* Quiz step 4 — name, email, optional mobile + SMS consent. Saves the
   contact (folding in any pre-contact quiz answers) and fires the Lead
   event server-side via Conversions API, sharing event_id with the client
   pixel fire for dedup (brief section 7). */
export async function POST(req: NextRequest) {
  const ip = clientIp(req)
  const rl = await limit(`rs-contact:ip:${ip}`, 20, 600)
  if (!rl.ok) return NextResponse.json({ error: 'Too many attempts. Please wait a moment.' }, { status: 429 })

  try {
    const body = await req.json().catch(() => ({}))
    const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : ''
    const name = sanitizeName(body?.name)
    const phone = typeof body?.phone === 'string' ? body.phone.slice(0, 40) : null
    const smsConsent = body?.smsConsent === true
    const visitorId = typeof body?.visitorId === 'string' ? body.visitorId.slice(0, 64) : ''
    const eventId = typeof body?.eventId === 'string' ? body.eventId.slice(0, 80) : `rs-lead-${Date.now()}`
    if (!isValidEmail(email)) return NextResponse.json({ error: 'Please enter a valid email.' }, { status: 400 })
    if (!visitorId) return NextResponse.json({ error: 'invalid_request' }, { status: 400 })
    if (!name) return NextResponse.json({ error: 'Please enter your name.' }, { status: 400 })

    const quizSoFar = sanitizeAnswers(body?.quizSoFar)
    const utm = body?.utm && typeof body.utm === 'object' ? body.utm : {}
    const fbp = typeof body?.fbp === 'string' ? body.fbp.slice(0, 120) : null
    const fbc = typeof body?.fbc === 'string' ? body.fbc.slice(0, 120) : null

    const res = await saveContact({ visitorId, name, email, phone, smsConsent, quizSoFar, attribution: { fbp, fbc, utm } })
    if (!res.ok) return NextResponse.json({ error: 'Could not save. Please try again.' }, { status: 400 })

    await sendCapiEvent({
      eventName: 'Lead', eventId, sourceUrl: typeof body?.pageUrl === 'string' ? body.pageUrl : '',
      user: { email, phone, fbp, fbc, clientIp: ip, userAgent: req.headers.get('user-agent') },
    }).catch(() => {})

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
