import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const { email, otp } = await req.json()
    if (!email || !otp) return NextResponse.json({ error: 'Email and OTP are required' }, { status: 400 })

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

    return NextResponse.json({ success: true, lead, roadmap: lead?.roadmap || null })
  } catch (err) {
    console.error('verify-otp error', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
