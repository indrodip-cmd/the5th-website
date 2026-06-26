import { NextResponse } from 'next/server'
import { SESSION_COOKIE } from '@/lib/session'

/* Clears the signed session cookie. */
export async function POST() {
  const res = NextResponse.json({ success: true })
  res.headers.set('Set-Cookie', `${SESSION_COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`)
  return res
}
