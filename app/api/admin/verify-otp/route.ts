import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { limit, clientIp } from '@/lib/rateLimit'
import { isValidEmail } from '@/lib/validation'
import { signAdmin, adminCookie, isAllowedAdmin, sessionEnabled } from '@/lib/session'

export async function POST(req: NextRequest) {
  try {
    if (!sessionEnabled()) {
      return NextResponse.json({ error: 'Admin auth is not configured on the server.' }, { status: 500 })
    }

    const ip = clientIp(req)
    const ipLimit = await limit(`admin-verify:ip:${ip}`, 30, 600)
    if (!ipLimit.ok) return NextResponse.json({ error: 'Too many attempts. Please wait a few minutes.' }, { status: 429, headers: { 'Retry-After': String(ipLimit.retryAfter) } })

    const body = await req.json().catch(() => null)
    const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : ''
    const otp = typeof body?.otp === 'string' ? body.otp.trim() : String(body?.otp ?? '')
    if (!isValidEmail(email) || !/^\d{6}$/.test(otp)) return NextResponse.json({ error: 'A valid email and 6-digit code are required.' }, { status: 400 })
    if (!isAllowedAdmin(email)) return NextResponse.json({ error: 'Invalid code.' }, { status: 400 })

    const codeLimit = await limit(`admin-verify:email:${email}`, 8, 600)
    if (!codeLimit.ok) return NextResponse.json({ error: 'Too many attempts. Please request a new code.' }, { status: 429 })

    const { data: session, error } = await getSupabaseAdmin()
      .from('admin_otps')
      .select('*')
      .eq('email', email)
      .eq('otp', otp)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (error || !session) return NextResponse.json({ error: 'Invalid code.' }, { status: 400 })
    if (session.verified) return NextResponse.json({ error: 'This code was already used. Please request a new one.' }, { status: 400 })
    if (new Date(session.expires_at) < new Date()) return NextResponse.json({ error: 'Code expired. Please request a new one.' }, { status: 400 })

    await getSupabaseAdmin().from('admin_otps').update({ verified: true }).eq('id', session.id)

    const ok = NextResponse.json({ success: true, email })
    ok.headers.set('Set-Cookie', adminCookie(signAdmin(email)))
    return ok
  } catch (err) {
    console.error('admin/verify-otp: unhandled', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
