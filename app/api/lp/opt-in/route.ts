import { NextRequest, NextResponse } from 'next/server'
import { promises as dns } from 'dns'
import { limit, clientIp } from '@/lib/rateLimit'
import { isValidEmail, sanitizeName } from '@/lib/validation'
import { verifyRecaptcha } from '@/lib/recaptcha'
import { optInLead, signVslPass, VSL_PASS_COOKIE } from '@/lib/lp-funnel'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/* Disposable / fake / temporary inbox domains — we only want real, reachable
   leads (they get a phone call). Extend freely. */
const BLOCKED_DOMAINS = new Set([
  'mailinator.com', 'guerrillamail.com', 'guerrillamail.info', 'guerrillamail.biz', 'guerrillamail.net',
  'guerrillamail.org', 'guerrillamailblock.com', 'grr.la', 'sharklasers.com', 'spam4.me',
  'tempmail.com', 'temp-mail.org', 'temp-mail.io', 'tempmail.net', 'tempmailo.com', 'tempr.email', 'tempail.com',
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
  'guerrillamail.de', 'sharklasers.org', 'grr.la', 'pokemail.net', 'spam4.me', 'byom.de', 'mailde.de',
  'tmpmail.org', 'tmpmail.net', 'tmpeml.com', 'tmails.net', 'mailpoof.com', 'mail-temp.com', 'tempmail.plus',
  'test.com', 'example.com', 'example.org', 'example.net', 'test.test', 'mail.com', 'email.com',
])

const FAKE_LOCAL = new Set(['test', 'testing', 'fake', 'asdf', 'asdfasdf', 'qwerty', 'abc', 'abcd', 'noemail', 'none', 'nomail', 'xxx'])

/* Confirm the domain can actually receive mail. Blocks fake/random domains
   with no mail server; fails open on transient DNS errors so real users aren't
   punished for a flaky lookup. */
async function domainCanReceiveMail(domain: string): Promise<boolean> {
  try {
    const mx = await Promise.race([
      dns.resolveMx(domain),
      new Promise<never>((_, rej) => setTimeout(() => rej(Object.assign(new Error('timeout'), { code: 'ETIMEOUT' })), 2500)),
    ])
    if (Array.isArray(mx) && mx.length > 0) return true
    // No MX — some domains accept mail on the A record; check that as a fallback.
    try { const a = await dns.resolve(domain); return Array.isArray(a) && a.length > 0 } catch { return false }
  } catch (e) {
    const code = (e as { code?: string })?.code
    if (code === 'ENOTFOUND' || code === 'ENODATA') return false // domain doesn't exist / no mail
    return true // transient (timeout, SERVFAIL) — allow
  }
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

    // Bot protection — Google reCAPTCHA v3 (fails open until keys are configured).
    const rc = await verifyRecaptcha(body?.recaptchaToken, { action: 'optin', ip })
    if (!rc.ok) {
      return NextResponse.json({ error: 'Verification failed. Please reload the page and try again.' }, { status: 403 })
    }

    const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : ''
    const name = sanitizeName(body?.name)
    const domain = email.split('@')[1] || ''
    const local = email.split('@')[0] || ''

    // Basic shape / obvious fakes.
    if (!isValidEmail(email) || !domain || domain.indexOf('.') === -1 || FAKE_LOCAL.has(local)) {
      return NextResponse.json({ error: 'Please enter a real email address you can access.' }, { status: 400 })
    }

    // Disposable / temporary → warn, and rate-block repeat abusers.
    if (BLOCKED_DOMAINS.has(domain)) {
      const ab = await limit(`vsl-abuse:ip:${ip}`, 5, 3600)
      const blocked = !ab.ok
      return NextResponse.json({
        blocked,
        error: blocked
          ? '🚫 You’ve been blocked for repeatedly submitting fake or temporary emails. This attempt to abuse the system has been logged.'
          : '⚠️ Temporary email blocked. Disposable inboxes aren’t allowed here — please use your real email. Repeated attempts will get you blocked from our site.',
      }, { status: 403 })
    }

    // Real, reachable domain? (email validation without OTP — MX/DNS check)
    if (!(await domainCanReceiveMail(domain))) {
      return NextResponse.json({ error: 'That email domain can’t receive mail. Please enter a real email address.' }, { status: 400 })
    }

    // Approximate location from Vercel's edge geo headers (we don't ask for it).
    let city: string | null = null
    try { city = decodeURIComponent(req.headers.get('x-vercel-ip-city') || '') || null } catch { city = req.headers.get('x-vercel-ip-city') }
    const country = req.headers.get('x-vercel-ip-country') || null

    const res = await optInLead({
      name,
      email,
      city,
      country,
      visitorId: typeof body?.visitor_id === 'string' ? body.visitor_id : null,
      utm: body?.utm && typeof body.utm === 'object' ? body.utm : {},
    })

    if (!res.ok) {
      return NextResponse.json({ error: 'Could not save. Please try again.' }, { status: 400 })
    }

    // Grant a session-bound pass to the training page (HttpOnly — the client
    // can't forge it, and it isn't in the URL).
    const out = NextResponse.json({ ok: true, name, email, redirect: '/lp/make-10k-month/watch' })
    out.cookies.set(VSL_PASS_COOKIE, signVslPass(name, email), {
      httpOnly: true, secure: true, sameSite: 'lax', path: '/lp/make-10k-month', maxAge: 60 * 60 * 12,
    })
    return out
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
