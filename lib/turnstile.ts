/* Cloudflare Turnstile server-side verification.
   Fails OPEN when not configured (no TURNSTILE_SECRET_KEY) so the flow is
   never blocked before you add keys. Once the secret + the client widget
   (NEXT_PUBLIC_TURNSTILE_SITE_KEY) are set, tokens are enforced.

   Env:
     TURNSTILE_SECRET_KEY            (server)
     NEXT_PUBLIC_TURNSTILE_SITE_KEY  (client widget)
*/

const SECRET = process.env.TURNSTILE_SECRET_KEY
// Only enforce when the secret has a real Cloudflare shape ("0x..."). A
// placeholder/typo (e.g. the var name pasted as the value) is treated as
// "not configured" so it fails open instead of 403-ing every request.
const CONFIGURED = !!SECRET && /^0x[A-Za-z0-9_-]{12,}$/.test(SECRET)

export function turnstileEnabled(): boolean {
  return CONFIGURED
}

export async function verifyTurnstile(token: unknown, ip?: string): Promise<boolean> {
  if (!CONFIGURED) return true // not configured / placeholder -> do not block
  if (typeof token !== 'string' || token.length < 10 || token.length > 4096) return false
  try {
    const body = new URLSearchParams({ secret: SECRET, response: token })
    if (ip) body.set('remoteip', ip)
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
      cache: 'no-store',
    })
    const data = await res.json().catch(() => ({ success: false }))
    return data?.success === true
  } catch {
    // On network error to Cloudflare, fail open (availability > strictness here).
    return true
  }
}
