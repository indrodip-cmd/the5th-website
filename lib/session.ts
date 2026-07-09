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

/* ─────────────────────────────────────────────────────────────────────────
   Admin session — separate, higher-trust cookie for the /admin command
   center. Same HMAC scheme as the user session but a distinct payload role
   and cookie, so a user session can never be replayed as an admin one.

   Env:
     ADMIN_EMAILS  comma-separated allowlist (defaults to the two founders)
   ───────────────────────────────────────────────────────────────────────── */

export const ADMIN_COOKIE = 'a5_admin'
const ADMIN_TTL_SECONDS = 60 * 60 * 12 // 12h — re-auth twice a day

const DEFAULT_ADMINS = ['indrodip@10kroadmap.org', 'support@10kroadmap.org']

/* The set of emails allowed to receive an admin OTP / hold an admin session. */
export function adminAllowlist(): string[] {
  const raw = process.env.ADMIN_EMAILS
  const list = (raw ? raw.split(',') : DEFAULT_ADMINS)
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)
  return list.length ? list : DEFAULT_ADMINS
}

export function isAllowedAdmin(email: string | null | undefined): boolean {
  if (!email) return false
  return adminAllowlist().includes(email.trim().toLowerCase())
}

export function signAdmin(email: string): string {
  const exp = Math.floor(Date.now() / 1000) + ADMIN_TTL_SECONDS
  const payload = b64url(JSON.stringify({ e: email.trim().toLowerCase(), r: 'admin', exp }))
  const sig = b64url(crypto.createHmac('sha256', SECRET).update(payload).digest())
  return `${payload}.${sig}`
}

/* Returns the admin email if the token is valid, unexpired, role=admin and
   still on the allowlist, else null. */
export function verifyAdmin(token: string | undefined | null): string | null {
  if (!SECRET || !token || token.length > 4096) return null
  const [payload, sig] = token.split('.')
  if (!payload || !sig) return null
  const expected = b64url(crypto.createHmac('sha256', SECRET).update(payload).digest())
  if (sig.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null
  try {
    const { e, r, exp } = JSON.parse(Buffer.from(payload.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString())
    if (r !== 'admin' || typeof e !== 'string' || typeof exp !== 'number' || exp < Math.floor(Date.now() / 1000)) return null
    return isAllowedAdmin(e) ? e : null
  } catch {
    return null
  }
}

export function adminCookie(token: string): string {
  return `${ADMIN_COOKIE}=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${ADMIN_TTL_SECONDS}`
}

export function clearAdminCookie(): string {
  return `${ADMIN_COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`
}

/* Read the verified admin email from the request's admin cookie, or null. */
export function adminEmail(req: Request): string | null {
  const cookie = req.headers.get('cookie') || ''
  const m = cookie.match(new RegExp(`(?:^|; )${ADMIN_COOKIE}=([^;]+)`))
  return m ? verifyAdmin(decodeURIComponent(m[1])) : null
}
