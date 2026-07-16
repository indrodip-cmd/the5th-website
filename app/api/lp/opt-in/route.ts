import { NextRequest, NextResponse } from 'next/server'
import { limit, clientIp } from '@/lib/rateLimit'
import { isValidEmail, sanitizeName } from '@/lib/validation'
import { optInLead } from '@/lib/lp-funnel'

export const dynamic = 'force-dynamic'

/* Disposable-inbox blocklist (mirrors /api/save-lead) — keeps cold-traffic
   junk out of the funnel. */
const BLOCKED_DOMAINS = new Set([
  'mailinator.com', 'guerrillamail.com', 'tempmail.com', 'sharklasers.com', 'grr.la',
  'yopmail.com', 'dispostable.com', 'maildrop.cc', 'fakeinbox.com', 'trashmail.com',
  '10minutemail.com', '10minutemail.net', 'tempail.com', 'getairmail.com', 'mohmal.com',
  'discard.email', 'spambox.us', 'mytrashmail.com', 'tempinbox.com', 'emailondeck.com',
])

export async function POST(req: NextRequest) {
  const ip = clientIp(req)
  const ipLimit = await limit(`vsl-optin:ip:${ip}`, 20, 600)
  if (!ipLimit.ok) {
    return NextResponse.json(
      { error: 'Too many submissions. Please wait a moment.' },
      { status: 429, headers: { 'Retry-After': String(ipLimit.retryAfter) } },
    )
  }

  try {
    const body = await req.json().catch(() => ({}))
    const email = typeof body?.email === 'string' ? body.email.trim() : ''
    const name = sanitizeName(body?.name)
    const domain = email.split('@')[1]?.toLowerCase() || ''

    if (!isValidEmail(email) || !domain || BLOCKED_DOMAINS.has(domain)) {
      return NextResponse.json({ error: 'Please use a real email address.' }, { status: 400 })
    }

    const res = await optInLead({
      name,
      email,
      visitorId: typeof body?.visitor_id === 'string' ? body.visitor_id : null,
      utm: body?.utm && typeof body.utm === 'object' ? body.utm : {},
    })

    if (!res.ok) {
      return NextResponse.json({ error: 'Could not save. Please try again.' }, { status: 400 })
    }

    return NextResponse.json({
      ok: true,
      name,
      email: email.toLowerCase(),
      redirect: '/lp/make-10k-month/watch',
    })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
