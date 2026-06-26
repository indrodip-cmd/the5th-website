import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const BLOCKED_DOMAINS = [
  'mailinator.com', 'guerrillamail.com', 'tempmail.com', 'throwam.com',
  'sharklasers.com', 'guerrillamailblock.com', 'grr.la', 'guerrillamail.info',
  'guerrillamail.biz', 'guerrillamail.de', 'guerrillamail.net', 'guerrillamail.org',
  'spam4.me', 'trashmail.com', 'trashmail.me', 'trashmail.net', 'trashmail.io',
  'yopmail.com', 'yopmail.fr', 'cool.fr.nf', 'jetable.fr.nf', 'nospam.ze.tc',
  'nomail.xl.cx', 'mega.zik.dj', 'speed.1s.fr', 'courriel.fr.nf', 'moncourrier.fr.nf',
  'monemail.fr.nf', 'monmail.fr.nf', 'dispostable.com', 'mailnull.com',
  'spamgourmet.com', 'spamgourmet.net', 'spamgourmet.org', 'maildrop.cc',
  'fakeinbox.com', 'mailnesia.com', 'discard.email', 'spamspot.com',
  'spamthisplease.com', 'fakemail.net', 'tempinbox.com', 'tempinbox.co.uk',
  'spammotel.com', 'obobbo.com', 'tempr.email', 'nwldx.com', 'spamgob.com',
  '10minutemail.com', '10minutemail.net', '10minutemail.org', '10minutemail.de',
  'minutemail.com', 'tempail.com', 'emailondeck.com', 'getairmail.com',
  'filzmail.com', 'tempemail.net', 'spambox.us', 'mytrashmail.com',
  'trashmail.at', 'trashmail.xyz', 'wegwerfmail.de', 'wegwerfmail.net',
  'wegwerfmail.org', 'mohmal.com', 'spamfree24.org',
]

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, email, quiz_answers, video_assigned, video_requested, no_video } = body

    const emailDomain = email?.split('@')[1]?.toLowerCase()
    if (!emailDomain || BLOCKED_DOMAINS.includes(emailDomain)) {
      return NextResponse.json({ error: 'Please use a real email address.' }, { status: 400 })
    }

    const q1 = quiz_answers?.q1 || ''
    let sequence_assigned = 'PIONEER'
    if (q1 === 'launched') sequence_assigned = 'PATHFINDER'
    else if (q1 === 'scaling') sequence_assigned = 'BUILDER'
    else if (q1 === 'established') sequence_assigned = 'LUMINARY'
    else sequence_assigned = 'PIONEER'

    const { data, error } = await supabase
      .from('quiz_leads')
      .upsert({
        name,
        email,
        quiz_answers,
        video_assigned,
        video_requested: video_requested || false,
        no_video: no_video || false,
        sequence_assigned,
        last_email_day: -1,
        created_at: new Date().toISOString()
      }, { onConflict: 'email' })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true, lead: data })
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
