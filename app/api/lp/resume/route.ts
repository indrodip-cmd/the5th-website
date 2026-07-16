import { NextRequest, NextResponse } from 'next/server'
import { limit, clientIp } from '@/lib/rateLimit'
import { isValidEmail } from '@/lib/validation'
import { resumeLead, signVslPass, VSL_PASS_COOKIE } from '@/lib/lp-funnel'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/* Returning visitor: their browser remembers them (localStorage) but the pass
   cookie is gone/expired. Re-issue the pass WITHOUT a second opt-in — but only
   for an email that genuinely opted in before (so this can't be used to forge
   access to the training). Records the re-watch in the CRM. */
export async function POST(req: NextRequest) {
  const ip = clientIp(req)
  const rl = await limit(`vsl-resume:ip:${ip}`, 30, 600)
  if (!rl.ok) return NextResponse.json({ ok: false }, { status: 429 })

  try {
    const body = await req.json().catch(() => ({}))
    const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : ''
    if (!isValidEmail(email)) return NextResponse.json({ ok: false, error: 'invalid' }, { status: 400 })

    const res = await resumeLead(email)
    if (!res) {
      // Not a known lead — send them through the normal opt-in.
      return NextResponse.json({ ok: false, error: 'not_registered' }, { status: 404 })
    }

    const out = NextResponse.json({ ok: true, name: res.name, email: res.email, redirect: '/lp/make-10k-month/watch' })
    out.cookies.set(VSL_PASS_COOKIE, signVslPass(res.name, res.email), {
      httpOnly: true, secure: true, sameSite: 'lax', path: '/lp/make-10k-month', maxAge: 60 * 60 * 12,
    })
    return out
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
