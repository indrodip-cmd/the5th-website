import { NextRequest, NextResponse } from 'next/server'
import { limit, clientIp } from '@/lib/rateLimit'
import { isValidEmail, sanitizeName } from '@/lib/validation'
import { optInLead } from '@/lib/lp-funnel'

export const dynamic = 'force-dynamic'

/* Disposable / fake / temporary inbox domains — we only want real, reachable
   leads (they get a phone call). Extend freely. */
const BLOCKED_DOMAINS = new Set([
  'mailinator.com', 'guerrillamail.com', 'guerrillamail.info', 'guerrillamail.biz', 'guerrillamail.net',
  'guerrillamail.org', 'guerrillamailblock.com', 'grr.la', 'sharklasers.com', 'spam4.me',
  'tempmail.com', 'temp-mail.org', 'tempmail.net', 'tempmailo.com', 'tempr.email', 'tempail.com',
  'tempinbox.com', 'tempinbox.co.uk', 'throwawaymail.com', 'throwam.com', 'trashmail.com', 'trashmail.me',
  'trashmail.net', 'trashmail.io', 'trashmail.at', 'trashmail.xyz', 'wegwerfmail.de', 'wegwerfmail.net',
  'yopmail.com', 'yopmail.fr', 'yopmail.net', 'dispostable.com', 'maildrop.cc', 'mailnesia.com',
  'fakeinbox.com', 'fakemail.net', 'fakemailgenerator.com', 'getnada.com', 'nada.email', 'inboxkitten.com',
  '10minutemail.com', '10minutemail.net', '10minutemail.org', '10minutemail.de', '20minutemail.com',
  'minutemail.com', 'mohmal.com', 'mytemp.email', 'moakt.com', 'emailondeck.com', 'getairmail.com',
  'discard.email', 'discardmail.com', 'spambox.us', 'spamgourmet.com', 'mytrashmail.com', 'mvrht.com',
  'mailcatch.com', 'mailexpire.com', 'mailnull.com', 'meltmail.com', 'mintemail.com', 'anonbox.net',
  'burnermail.io', 'emailfake.com', 'email-fake.com', 'crazymailing.com', 'dropmail.me', 'harakirimail.com',
  'jetable.org', 'linshiyouxiang.net', 'luxusmail.org', 'mailtemp.info', 'nowmymail.com', 'spam.la',
  'test.com', 'example.com', 'example.org', 'example.net', 'test.test', 'mail.com', 'email.com',
])

/* Obviously fake local-parts. */
const FAKE_LOCAL = new Set(['test', 'testing', 'fake', 'asdf', 'asdfasdf', 'qwerty', 'abc', 'abcd', 'noemail', 'none', 'nomail', 'xxx'])

function validPhone(raw: string): string | null {
  const digits = raw.replace(/\D/g, '')
  // Real numbers: 8–15 digits (E.164 max is 15), not an obvious placeholder.
  if (digits.length < 8 || digits.length > 15) return null
  if (/^(\d)\1+$/.test(digits)) return null // all-same digit (0000000000)
  if (/^(0123456789|1234567890|12345678)/.test(digits)) return null
  return raw.trim()
}

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
    const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : ''
    const name = sanitizeName(body?.name)
    const phoneRaw = typeof body?.phone === 'string' ? body.phone : ''
    const domain = email.split('@')[1] || ''
    const local = email.split('@')[0] || ''

    if (!isValidEmail(email) || !domain || domain.indexOf('.') === -1 || BLOCKED_DOMAINS.has(domain) || FAKE_LOCAL.has(local)) {
      return NextResponse.json({ error: 'Please enter a real email address you can access.' }, { status: 400 })
    }

    const phone = validPhone(phoneRaw)
    if (!phone) {
      return NextResponse.json({ error: 'Please enter a valid phone number (with country code).' }, { status: 400 })
    }

    const res = await optInLead({
      name,
      email,
      phone,
      visitorId: typeof body?.visitor_id === 'string' ? body.visitor_id : null,
      utm: body?.utm && typeof body.utm === 'object' ? body.utm : {},
    })

    if (!res.ok) {
      return NextResponse.json({ error: 'Could not save. Please try again.' }, { status: 400 })
    }

    return NextResponse.json({
      ok: true,
      name,
      email,
      redirect: '/lp/make-10k-month/watch',
    })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
