import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { getSupabaseAdmin } from '@/lib/supabase'
import { adminOtpEmail } from '@/lib/email-templates'
import { limit, clientIp } from '@/lib/rateLimit'
import { isValidEmail } from '@/lib/validation'
import { isAllowedAdmin, sessionEnabled } from '@/lib/session'

const FROM = 'Indrodip | The5th <noreply@10kroadmap.org>'

function getResendClient() {
  const key = process.env.RESEND_API_KEY
  if (!key) console.error('admin/send-otp: RESEND_API_KEY is not set — emails will fail')
  return new Resend(key || 'placeholder')
}

export async function POST(req: NextRequest) {
  try {
    if (!sessionEnabled()) {
      console.error('admin/send-otp: SESSION_SECRET not set — admin auth disabled')
      return NextResponse.json({ error: 'Admin auth is not configured on the server.' }, { status: 500 })
    }
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ error: 'Server configuration error.' }, { status: 500 })
    }

    const ip = clientIp(req)
    const ipLimit = await limit(`admin-otp:ip:${ip}`, 10, 600)
    if (!ipLimit.ok) return NextResponse.json({ error: 'Too many requests. Please wait a few minutes.' }, { status: 429, headers: { 'Retry-After': String(ipLimit.retryAfter) } })

    const body = await req.json().catch(() => null)
    const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : ''
    if (!isValidEmail(email)) return NextResponse.json({ error: 'A valid email is required.' }, { status: 400 })

    // Only founders on the allowlist may ever receive a code. To avoid leaking
    // which emails are admins, respond with the same success shape regardless.
    if (!isAllowedAdmin(email)) {
      return NextResponse.json({ success: true })
    }

    const emailLimit = await limit(`admin-otp:email:${email}`, 5, 900)
    if (!emailLimit.ok) return NextResponse.json({ error: 'A code is already on its way. Please check your inbox.' }, { status: 429 })

    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString()

    const { error: insErr } = await getSupabaseAdmin().from('admin_otps').insert({ email, otp, expires_at: expiresAt })
    if (insErr) {
      console.error('admin/send-otp: insert failed', JSON.stringify({ code: insErr.code, message: insErr.message }))
      return NextResponse.json({ error: 'Failed to create sign-in code.' }, { status: 500 })
    }

    try {
      await getResendClient().emails.send({
        from: FROM,
        to: email,
        subject: `Your admin code: ${otp}`,
        html: adminOtpEmail(otp),
      })
    } catch (e) {
      console.error('admin/send-otp: email send failed', e)
      return NextResponse.json({ error: 'Failed to send the code. Please try again.' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('admin/send-otp: unhandled', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
