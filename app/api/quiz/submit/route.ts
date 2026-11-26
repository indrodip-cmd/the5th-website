import { NextRequest, NextResponse, after } from 'next/server'
import { Resend } from 'resend'
import { getSupabaseAdmin } from '@/lib/supabase'
import { limit, clientIp } from '@/lib/rateLimit'
import { isValidEmail, sanitizeName } from '@/lib/validation'
import { upsertContact, logActivity } from '@/lib/crm'
import { isUnsubscribed, unsubscribeUrl } from '@/lib/comm/unsubscribe'
import { subscribeToBeehiiv } from '@/lib/beehiiv'
import { FROM, REPLY_TO } from '@/lib/event-campaign'
import { decode, score, toLeadAnswers } from '@/lib/quiz/engine'
import { reportEmail } from '@/lib/quiz/email'
import { REPORT_KEY } from '@/lib/quiz/audit-emails'

export const dynamic = 'force-dynamic'

/* Income Blocker Quiz lead capture. No AI and no OTP: the report is computed
   deterministically from the answer code, shown instantly in the browser, and
   this route only saves the lead and emails them a copy. */
export async function POST(req: NextRequest) {
  try {
    const ip = clientIp(req)
    const rl = await limit(`quizsub:ip:${ip}`, 12, 600)
    if (!rl.ok) return NextResponse.json({ error: 'Too many attempts. Please wait a few minutes.' }, { status: 429 })

    const body = await req.json().catch(() => ({}))
    if (typeof body?.website === 'string' && body.website.trim()) return NextResponse.json({ ok: true }) // honeypot
    const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : ''
    const name = sanitizeName(body?.name)
    if (!isValidEmail(email) || !name) return NextResponse.json({ error: 'Please enter your first name and a valid email.' }, { status: 400 })
    const answers = decode(typeof body?.code === 'string' ? body.code : '')
    if (!answers) return NextResponse.json({ error: 'Something went wrong with your answers. Please retake the quiz.' }, { status: 400 })

    const result = score(answers)
    const first = name.split(' ')[0]

    try {
      const { error } = await getSupabaseAdmin().from('quiz_leads').upsert({ email, name, answers: toLeadAnswers(answers, result) }, { onConflict: 'email', ignoreDuplicates: false })
      if (error) console.error('quiz submit: lead upsert failed', error.message)
    } catch (e) { console.error('quiz submit: lead upsert threw', e) }

    after(async () => {
      try {
        await upsertContact(email, { name, source: 'quiz', business_stage: result.stage, tags: ['quiz', `blocker-${result.primary}`] })
        await logActivity(email, 'lead', 'Completed the Income Blocker Quiz', `${result.profileId} ${result.archetype}: ${result.primary} + ${result.secondary}, intensity ${result.overall}, readiness ${result.readinessScore} (${result.readiness}), invest: ${result.invest}, monthly gap ${result.gap.monthly}`)
      } catch (e) { console.error('quiz submit: CRM mirror failed', e) }
      try { await subscribeToBeehiiv(email, { name, stage: result.stage, source: 'quiz' }) } catch { /* optional */ }
      try {
        if (await isUnsubscribed(email)) return
        const send = await limit(`quizrep:email:${email}`, 3, 3600)
        if (!send.ok || !process.env.RESEND_API_KEY) return
        const mail = reportEmail(first, result, unsubscribeUrl(email))
        const sent = await new Resend(process.env.RESEND_API_KEY).emails.send({ from: FROM, to: email, replyTo: REPLY_TO, subject: mail.subject, html: mail.html, text: mail.text })
        // The report email anchors the 14-email audit sequence (lib/quiz/audit-mail).
        if (!sent.error) await getSupabaseAdmin().from('event_email_log').upsert({ email, email_key: REPORT_KEY, provider_id: sent.data?.id || null }, { onConflict: 'email,email_key' })
      } catch (e) { console.error('quiz submit: report email failed', e) }
    })

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('quiz submit: unhandled', e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
