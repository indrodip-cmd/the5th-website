/* Google reCAPTCHA v3 (score-based, invisible) server verification.

   Fails OPEN when the secret isn't configured or Google is unreachable, so the
   site never breaks before keys are set / during an outage. Once
   RECAPTCHA_SECRET_KEY is set it enforces: valid token, action match, and a
   minimum score. */
type Result = { ok: boolean; score?: number; reason?: string }

export async function verifyRecaptcha(
  token: unknown,
  opts: { action?: string; minScore?: number; ip?: string | null } = {},
): Promise<Result> {
  const secret = process.env.RECAPTCHA_SECRET_KEY
  if (!secret) return { ok: true, reason: 'not_configured' }
  if (typeof token !== 'string' || !token) return { ok: false, reason: 'missing_token' }

  try {
    const params = new URLSearchParams({ secret, response: token })
    if (opts.ip) params.set('remoteip', opts.ip)
    const r = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    })
    const d = (await r.json()) as { success?: boolean; score?: number; action?: string }
    if (!d.success) return { ok: false, reason: 'failed', score: d.score }
    const min = typeof opts.minScore === 'number' ? opts.minScore : 0.5
    if (typeof d.score === 'number' && d.score < min) return { ok: false, score: d.score, reason: 'low_score' }
    if (opts.action && d.action && d.action !== opts.action) return { ok: false, score: d.score, reason: 'action_mismatch' }
    return { ok: true, score: d.score }
  } catch {
    return { ok: true, reason: 'verify_error' } // don't block real users on a Google outage
  }
}
