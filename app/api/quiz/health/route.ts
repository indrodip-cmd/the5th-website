import { NextResponse } from 'next/server'

/* Config health check. Reports whether each production env var is present AND
   correctly SHAPED — never the values themselves. Hit /api/quiz/health after a
   deploy to confirm configuration without exposing secrets.

   Each field: "ok" (present + valid shape), "bad" (present but wrong shape —
   e.g. the var name pasted as the value), or "missing".
*/

type Status = 'ok' | 'bad' | 'missing'
const check = (val: string | undefined, valid: (v: string) => boolean): Status =>
  !val ? 'missing' : valid(val) ? 'ok' : 'bad'

export async function GET() {
  const env = process.env

  const turnstileSite = check(env.NEXT_PUBLIC_TURNSTILE_SITE_KEY, v => /^[0-3]x[A-Za-z0-9_-]{12,}$/.test(v))
  const turnstileSecret = check(env.TURNSTILE_SECRET_KEY, v => /^0x[A-Za-z0-9_-]{12,}$/.test(v))
  const sessionSecret = check(env.SESSION_SECRET, v => v.length >= 16)
  const requireOtp = env.NEXT_PUBLIC_REQUIRE_OTP === '1'

  const fields = {
    // Auth + bot protection (the OTP launch path)
    sessionSecret,
    requireOtp: requireOtp ? 'ok' : 'off',
    turnstileSite,
    turnstileSecret,
    upstash: check(env.UPSTASH_REDIS_REST_URL, v => v.startsWith('https://')) === 'ok'
      && !!env.UPSTASH_REDIS_REST_TOKEN ? 'ok' : (env.UPSTASH_REDIS_REST_URL || env.UPSTASH_REDIS_REST_TOKEN ? 'bad' : 'missing'),
    // Core services
    supabaseUrl: check(env.NEXT_PUBLIC_SUPABASE_URL, v => v.includes('supabase')),
    supabaseServiceKey: env.SUPABASE_SERVICE_ROLE_KEY ? 'ok' : 'missing',
    anthropic: check(env.ANTHROPIC_API_KEY, v => v.startsWith('sk-ant-')),
    resend: check(env.RESEND_API_KEY, v => v.startsWith('re_')),
  } as const

  // The OTP + Turnstile flow is fully wired only when all of these are 'ok'.
  const otpFlowReady =
    fields.sessionSecret === 'ok' &&
    fields.requireOtp === 'ok' &&
    turnstileSite === 'ok' &&
    turnstileSecret === 'ok'

  return NextResponse.json({ otpFlowReady, ...fields }, {
    headers: { 'Cache-Control': 'no-store' },
  })
}
