import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { getSupabaseAdmin } from '@/lib/supabase'
import { otpEmail } from '@/lib/email-templates'
import { limit, clientIp } from '@/lib/rateLimit'
import { isValidEmail } from '@/lib/validation'

/* Returning-user login: emails a 6-digit code to a lead who already took the
   quiz, so they can sign back in and reach their dashboard. Distinct from
   send-otp (which is the first-time email gate that also captures name +
   answers). Verification reuses /api/quiz/verify-otp. */

const FROM = 'Indrodip | The5th <noreply@10kroadmap.org>'

export async function POST(req: NextRequest) {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ error: 'Server not configured' }, { status: 500 })
    }

    const ip = clientIp(req)
    const ipLimit = await limit(`logincode:ip:${ip}`, 10, 600)
    if (!ipLimit.ok) return NextResponse.json({ error: 'Too many requests. Please wait a few minutes.' }, { status: 429, headers: { 'Retry-After': String(ipLimit.retryAfter) } })

    const body = await req.json().catch(() => null)
    const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : ''
    if (!isValidEmail(email)) return NextResponse.json({ error: 'Please enter a valid email.' }, { status: 400 })

    const emailLimit = await limit(`logincode:email:${email}`, 5, 1800)
    if (!emailLimit.ok) return NextResponse.json({ error: 'A code is already on its way. Please check your inbox and spam folder.' }, { status: 429 })

    const supabase = getSupabaseAdmin()
    const { data: lead } = await supabase.from('quiz_leads').select('name').eq('email', email).maybeSingle()

    // Do not reveal whether an email exists. Only send when we actually have a
    // lead, but always return success so the response can't be used to probe.
    if (lead) {
      const firstName = ((lead.name as string) || '').split(' ')[0] || 'there'
      const otp = Math.floor(100000 + Math.random() * 900000).toString()
      const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString()
      try {
        await supabase.from('roadmap_sessions').insert({ email, otp, expires_at: expiresAt })
        await new Resend(process.env.RESEND_API_KEY || 'placeholder').emails.send({
          from: FROM,
          to: email,
          subject: `${otp} is your code to sign in`,
          html: otpEmail(firstName, otp, []),
          text: `Hi ${firstName},\n\nYour 6-digit sign-in code is: ${otp}\n\nIt expires in 30 minutes.\n\nIf you did not request this, you can ignore this email.\n\nThe5th Consulting · noreply@10kroadmap.org`,
        })
      } catch (e) {
        console.error('login-code send failed', e)
      }
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('login-code error', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
