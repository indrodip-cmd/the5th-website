import { NextRequest, NextResponse, after } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { Resend } from 'resend'
import { getSupabaseAdmin } from '@/lib/supabase'
import { otpEmail, email1, email2, email3, email4, email5, email6, email7 } from '@/lib/email-templates'
import { limit, clientIp } from '@/lib/rateLimit'
import { isValidEmail, sanitizeName } from '@/lib/validation'
import { verifyTurnstile } from '@/lib/turnstile'
import { upsertContact, logActivity } from '@/lib/crm'
import { isUnsubscribed } from '@/lib/comm/unsubscribe'
import { subscribeToBeehiiv } from '@/lib/beehiiv'

function getAnthropicClient() {
  const key = process.env.ANTHROPIC_API_KEY
  if (!key) throw new Error('ANTHROPIC_API_KEY is not set')
  return new Anthropic({ apiKey: key })
}
function getResendClient() {
  const key = process.env.RESEND_API_KEY
  if (!key) console.error('send-otp: RESEND_API_KEY is not set — emails will fail')
  return new Resend(key || 'placeholder')
}

const FROM = 'Indrodip | The5th <noreply@10kroadmap.org>'

export async function POST(req: NextRequest) {
  try {
    // Validate required env vars early for clear error messages
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('send-otp: Missing Supabase env vars', {
        url: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        key: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      })
      return NextResponse.json({ error: 'Server configuration error: database credentials missing' }, { status: 500 })
    }

    const ip = clientIp(req)
    const ipLimit = await limit(`otp:ip:${ip}`, 10, 600)
    if (!ipLimit.ok) return NextResponse.json({ error: 'Too many requests. Please wait a few minutes.' }, { status: 429, headers: { 'Retry-After': String(ipLimit.retryAfter) } })

    const reqBody = await req.json()
    if (!(await verifyTurnstile(reqBody?.turnstileToken, ip))) {
      return NextResponse.json({ error: 'Verification failed. Please reload and try again.' }, { status: 403 })
    }
    const { email: rawEmail, name: rawName, answers } = reqBody
    const email = typeof rawEmail === 'string' ? rawEmail.trim().toLowerCase() : ''
    const name = sanitizeName(rawName)
    if (!isValidEmail(email) || !name) return NextResponse.json({ error: 'A valid email and name are required' }, { status: 400 })

    // Cap OTP sends per email to prevent inbox bombing.
    const emailLimit = await limit(`otp:email:${email}`, 5, 1800)
    if (!emailLimit.ok) return NextResponse.json({ error: 'Please check your inbox, an email is already on its way.' }, { status: 429 })

    const firstName = name.split(' ')[0]

    // 1. Upsert lead
    let lead: { id: string } | null = null
    try {
      const { data, error: leadErr } = await getSupabaseAdmin()
        .from('quiz_leads')
        .upsert({ email, name, answers }, { onConflict: 'email', ignoreDuplicates: false })
        .select()
        .single()
      if (leadErr) {
        console.error('send-otp: lead upsert failed', JSON.stringify({
          code: leadErr.code, message: leadErr.message,
          details: leadErr.details, hint: leadErr.hint
        }))
        return NextResponse.json({ error: `Failed to save lead: ${leadErr.message}` }, { status: 500 })
      }
      lead = data
    } catch (e) {
      console.error('send-otp: lead upsert threw', e)
      return NextResponse.json({ error: 'Database error saving lead' }, { status: 500 })
    }

    // 2. Generate OTP + session — this is the ONLY thing on the critical path.
    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    // 30-minute validity. Our audience skews 45+ and often opens the code on a
    // second device or after a distraction; a 15-min window was expiring before
    // they finished, forcing confusing resends. 30 min removes that friction.
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString()
    try {
      const { error: otpErr } = await getSupabaseAdmin().from('roadmap_sessions').insert({ email, otp, expires_at: expiresAt })
      if (otpErr) {
        console.error('send-otp: OTP insert failed', JSON.stringify({ code: otpErr.code, message: otpErr.message }))
        return NextResponse.json({ error: `Failed to create session: ${otpErr.message}` }, { status: 500 })
      }
    } catch (e) {
      console.error('send-otp: OTP insert threw', e)
      return NextResponse.json({ error: 'Database error creating session' }, { status: 500 })
    }

    // 3. Send the OTP email IMMEDIATELY — code only. Previously this waited on a
    //    multi-second Claude roadmap call before the code was even sent, which is
    //    why codes were slow. The roadmap preview now rides along in email #1.
    try {
      await getResendClient().emails.send({
        from: FROM,
        to: email,
        subject: `${otp} is your code to unlock your roadmap`,
        html: otpEmail(firstName, otp, []),
        // A plain-text alternative markedly improves inbox placement for
        // transactional codes (a missing text/plain part is a spam signal).
        text: `Hi ${firstName},\n\nYour 6-digit code is: ${otp}\n\nIt expires in 30 minutes. Enter it on the page to unlock your roadmap.\n\nIf you did not request this, you can ignore this email.\n\nThe5th Consulting · noreply@10kroadmap.org`,
      })
    } catch (e) {
      console.error('send-otp: OTP email send failed', e)
      // Don't fail — OTP is saved, user can request resend
    }

    // 4. Everything slow (AI roadmap → save → email sequence) runs AFTER the
    //    response is sent, so neither the code email nor the client spinner waits
    //    on it. after() keeps this alive on Vercel past the response.
    const leadId = lead?.id ?? ''
    after(async () => {
      // Mirror every quiz taker into the native CRM at email capture — even those
      // who never reach /quiz/results (where save-lead mirrors them). Without this,
      // drop-offs live only in quiz_leads and never appear under Contacts.
      try {
        const stage = (answers as Record<string, unknown> | null)?.q1
        await upsertContact(email, {
          name,
          source: 'quiz',
          business_stage: typeof stage === 'string' ? stage : null,
          tags: ['quiz'],
        })
        await logActivity(email, 'lead', 'Started the quiz', typeof stage === 'string' && stage ? `Stage: ${stage}` : undefined)
      } catch (e) {
        console.error('send-otp: CRM mirror failed', e)
      }

      // Add every joiner to the 10K Roadmap newsletter (Beehiiv). No-op if unconfigured.
      const stageVal = (answers as Record<string, unknown> | null)?.q1
      await subscribeToBeehiiv(email, { name, stage: typeof stageVal === 'string' ? stageVal : undefined, source: 'quiz' })

      let roadmap: Record<string, unknown> | null = null
      try {
        const profile = JSON.stringify(answers, null, 2)
        const msg = await getAnthropicClient().messages.create({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 4000,
          system: 'You are an expert business coach. Generate a personalized 15-day roadmap for someone wanting to make their first $5,000 online from their expertise. Profile: ' + profile + '. Return ONLY valid JSON, no markdown.',
          messages: [{
            role: 'user',
            content: 'Generate a 15-day roadmap as JSON with this exact structure: {"days":[{"day":1,"title":"string","theme":"string","tasks":["task1","task2","task3"],"win_condition":"string","motivation":"string"}],"summary":"string","biggest_opportunity":"string","first_action":"string"}'
          }]
        })
        const raw = msg.content[0].type === 'text' ? msg.content[0].text : ''
        const jsonMatch = raw.match(/\{[\s\S]*\}/)
        if (jsonMatch) roadmap = JSON.parse(jsonMatch[0])
      } catch (e) {
        console.error('send-otp: roadmap generation failed', e)
        roadmap = {
          days: [],
          summary: 'Your personalized roadmap is being built.',
          biggest_opportunity: 'Leverage your expertise into a premium offer.',
          first_action: 'Define your ideal client and their #1 problem.'
        }
      }

      // NOTE: do NOT persist this JSON roadmap to quiz_leads.roadmap — that column
      // is owned by /api/generate-roadmap, which stores the full MARKDOWN report and
      // reads it back as a cache. Writing a JSON object here overwrites that report
      // and breaks the results page (cache miss → regenerate → rate-limit → "taking
      // a little longer"). The email sequence uses this roadmap in-memory below.
      await triggerEmailSequence(email, firstName, roadmap, leadId)
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('send-otp: unhandled error', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

async function triggerEmailSequence(email: string, firstName: string, roadmap: Record<string, unknown> | null, leadId: string) {
  // Never send the marketing drip to someone who has unsubscribed.
  if (await isUnsubscribed(email)) return

  const days = (roadmap as { days?: { day: number; title: string; tasks: string[] }[] })?.days || []
  const summary = (roadmap as { summary?: string })?.summary || 'Your roadmap is ready to unlock your path to $5K/month.'

  try {
    await getResendClient().emails.send({
      from: FROM, to: email,
      subject: '🗺️ Your Personal 15-Day Roadmap is inside',
      html: email1(firstName, summary, days, email)
    })
  } catch (e) { console.error('Email 1 failed', e) }

  const delays = [172800000, 96 * 3600000, 144 * 3600000, 192 * 3600000, 240 * 3600000, 288 * 3600000]
  const subjects = [
    'The offer mistake that keeps experts broke',
    'Where your next 3 clients are hiding right now',
    '"Tell me more" — what to say next',
    "You're closer than you think",
    'The pricing conversation that changes everything',
    "Your 15 days are almost up — here's what's next"
  ]
  const templates = [email2, email3, email4, email5, email6, email7]

  delays.forEach((delay, i) => {
    setTimeout(async () => {
      try {
        await getResendClient().emails.send({
          from: FROM, to: email,
          subject: subjects[i],
          html: templates[i](firstName, email)
        })
      } catch (e) { console.error(`Email ${i + 2} failed`, e) }
    }, delay)
  })

  void leadId
}
