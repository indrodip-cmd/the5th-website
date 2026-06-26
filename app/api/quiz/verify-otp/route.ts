import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { limit, clientIp } from '@/lib/rateLimit'
import { isValidEmail } from '@/lib/validation'
import { signSession, sessionCookie } from '@/lib/session'

export async function POST(req: NextRequest) {
  try {
    const ip = clientIp(req)
    // Brute-force protection on the 6-digit code.
    const ipLimit = await limit(`verify:ip:${ip}`, 30, 600)
    if (!ipLimit.ok) return NextResponse.json({ error: 'Too many attempts. Please wait a few minutes.' }, { status: 429, headers: { 'Retry-After': String(ipLimit.retryAfter) } })

    const vbody = await req.json().catch(() => null)
    const email = typeof vbody?.email === 'string' ? vbody.email.trim().toLowerCase() : ''
    const otp = typeof vbody?.otp === 'string' ? vbody.otp.trim() : String(vbody?.otp ?? '')
    if (!isValidEmail(email) || !/^\d{4,8}$/.test(otp)) return NextResponse.json({ error: 'A valid email and code are required' }, { status: 400 })

    const codeLimit = await limit(`verify:email:${email}`, 8, 600)
    if (!codeLimit.ok) return NextResponse.json({ error: 'Too many attempts. Please request a new code.' }, { status: 429 })

    const { data: session, error } = await getSupabaseAdmin()
      .from('roadmap_sessions')
      .select('*')
      .eq('email', email)
      .eq('otp', otp)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (error || !session) return NextResponse.json({ error: 'Invalid code' }, { status: 400 })

    if (new Date(session.expires_at) < new Date()) {
      return NextResponse.json({ error: 'Code expired. Please request a new one.' }, { status: 400 })
    }

    if (session.verified) {
      // Already verified — still return the lead data
    }

    // Mark as verified
    await getSupabaseAdmin().from('roadmap_sessions').update({ verified: true }).eq('id', session.id)

    // Fetch lead
    const { data: lead } = await getSupabaseAdmin()
      .from('quiz_leads')
      .select('*')
      .eq('email', email)
      .single()

    const ok = NextResponse.json({ success: true, lead, roadmap: lead?.roadmap || null })
    // Issue the signed session so private endpoints can authorize this user without trusting a raw email.
    ok.headers.set('Set-Cookie', sessionCookie(signSession(email)))
    return ok
  } catch (err) {
    console.error('verify-otp error', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
