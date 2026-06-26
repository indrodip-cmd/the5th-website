/* Stateless signed session, used to authorize access to a person's own
   assessment data (report, AI coach, PDF) without trusting a raw email in
   the request body. The token is an HMAC-SHA256 over { email, exp }, set as
   an httpOnly, Secure, SameSite=Lax cookie after OTP verification.

   Env:
     SESSION_SECRET  (long random string; required to enable enforcement)
*/

import crypto from 'crypto'

const SECRET = process.env.SESSION_SECRET || ''
export const SESSION_COOKIE = 'a5_session'
const TTL_SECONDS = 60 * 60 * 24 * 30 // 30 days

export function sessionEnabled(): boolean {
  return SECRET.length >= 16
}

function b64url(buf: Buffer | string): string {
  return Buffer.from(buf).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

export function signSession(email: string): string {
  const exp = Math.floor(Date.now() / 1000) + TTL_SECONDS
  const payload = b64url(JSON.stringify({ e: email.trim().toLowerCase(), exp }))
  const sig = b64url(crypto.createHmac('sha256', SECRET).update(payload).digest())
  return `${payload}.${sig}`
}

export function verifySession(token: string | undefined | null): string | null {
  if (!SECRET || !token || token.length > 4096) return null
  const [payload, sig] = token.split('.')
  if (!payload || !sig) return null
  const expected = b64url(crypto.createHmac('sha256', SECRET).update(payload).digest())
  // Constant-time compare.
  if (sig.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null
  try {
    const { e, exp } = JSON.parse(Buffer.from(payload.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString())
    if (typeof e !== 'string' || typeof exp !== 'number' || exp < Math.floor(Date.now() / 1000)) return null
    return e
  } catch {
    return null
  }
}

export function sessionCookie(token: string): string {
  return `${SESSION_COOKIE}=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${TTL_SECONDS}`
}

/* Read the verified email from the request's session cookie, or null. */
export function sessionEmail(req: Request): string | null {
  const cookie = req.headers.get('cookie') || ''
  const m = cookie.match(new RegExp(`(?:^|; )${SESSION_COOKIE}=([^;]+)`))
  return m ? verifySession(decodeURIComponent(m[1])) : null
}
