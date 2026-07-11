/* Unsubscribe — signed one-click tokens + suppression list. A token is
   base64url(email).hmac so the link can't be forged and needs no lookup to
   identify the recipient. The engine checks the suppression list before sending. */
import crypto from 'crypto'
import { getSupabaseAdmin } from '@/lib/supabase'

const SECRET = process.env.SESSION_SECRET || process.env.CRON_SECRET || 'the5th-unsub-secret'
const b64u = (b: Buffer | string) => Buffer.from(b).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')

export function signUnsub(email: string): string {
  const e = b64u(email.trim().toLowerCase())
  const sig = b64u(crypto.createHmac('sha256', SECRET).update(e).digest())
  return `${e}.${sig}`
}
export function verifyUnsub(token: string): string | null {
  const [e, sig] = String(token || '').split('.')
  if (!e || !sig) return null
  const expected = b64u(crypto.createHmac('sha256', SECRET).update(e).digest())
  if (sig.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null
  try { return Buffer.from(e.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf-8').toLowerCase() } catch { return null }
}

export function unsubscribeUrl(email: string): string {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://the5th.co'
  return `${base}/api/unsubscribe?token=${encodeURIComponent(signUnsub(email))}`
}

export async function isUnsubscribed(email: string): Promise<boolean> {
  if (!email) return false
  const { data } = await getSupabaseAdmin().from('email_unsubscribes').select('email').eq('email', email.trim().toLowerCase()).maybeSingle()
  return !!data
}
export async function unsubscribe(email: string, reason = 'link', source = 'link'): Promise<void> {
  await getSupabaseAdmin().from('email_unsubscribes').upsert({ email: email.trim().toLowerCase(), reason, source }, { onConflict: 'email' })
}
export async function resubscribe(email: string): Promise<void> {
  await getSupabaseAdmin().from('email_unsubscribes').delete().eq('email', email.trim().toLowerCase())
}
