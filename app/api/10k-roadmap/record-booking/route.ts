import { NextRequest, NextResponse } from 'next/server'
import { limit, clientIp } from '@/lib/rateLimit'
import { isValidEmail, sanitizeName, sanitizeAnswers } from '@/lib/validation'
import { Resend } from 'resend'
import { bookingConfirmationEmail } from '@/lib/audit-emails'
import { markBooked, getAuditStatus, saveApplication } from '@/lib/roadmap-audit'
import { QUALIFICATION } from '@/app/10k-roadmap/config'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const AUDIT_MINUTES = 60
const FROM = 'The5th Global Consulting <indrodip@10kroadmap.org>'

/* Re-derive the qualification verdict server-side (never trust the client). */
function verdictFrom(answers: Record<string, string | string[]>): { verdict: 'qualified' | 'rejected'; reason: string | null } {
  for (const q of QUALIFICATION) {
    if (!('options' in q)) continue
    const val = answers[q.id]
    const hit = q.options.find((o) => o.reject && (Array.isArray(val) ? val.includes(o.value) : val === o.value))
    if (hit) return { verdict: 'rejected', reason: q.id === 'business_type' ? 'no_business' : q.id === 'readiness' ? 'free_advice' : 'default' }
  }
  return { verdict: 'qualified', reason: null }
}

/* Records a cal.com booking made in the embed. The audit is free (no payment
   step), so the calendar booking IS the conversion: if the qualification
   answers ride along, we first create/backfill the lead here (so the email is
   captured), then mark the appointment on the lead (+ CRM + admin email via
   markBooked) and send the attendee a branded confirmation. */
export async function POST(req: NextRequest) {
  const rl = await limit(`audit-record:ip:${clientIp(req)}`, 20, 600)
  if (!rl.ok) return NextResponse.json({ ok: false }, { status: 429 })

  try {
    const body = await req.json().catch(() => ({}))
    const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : ''
    const name = sanitizeName(body?.name)
    const start = typeof body?.start === 'string' ? body.start : ''
    if (!isValidEmail(email) || !start || Number.isNaN(Date.parse(start))) return NextResponse.json({ ok: false }, { status: 400 })

    // Capture the lead from the qualification answers if it isn't saved yet
    // (the removed payment step used to be where the email was first collected).
    const qualification = sanitizeAnswers(body?.qualification)
    if (qualification && Object.keys(qualification).length) {
      const status = await getAuditStatus(email)
      if (!status.found) {
        const { verdict, reason } = verdictFrom(qualification)
        let city: string | null = null
        try { city = decodeURIComponent(req.headers.get('x-vercel-ip-city') || '') || null } catch { city = req.headers.get('x-vercel-ip-city') }
        const country = req.headers.get('x-vercel-ip-country') || null
        await saveApplication({
          name, email, city, country,
          visitorId: typeof body?.audit_id === 'string' ? body.audit_id : null,
          utm: body?.utm && typeof body.utm === 'object' ? body.utm : {},
          qualification, verdict, reject_reason: reason,
        }).catch(() => {})
      }
    }

    const end = new Date(new Date(start).getTime() + AUDIT_MINUTES * 60000).toISOString()
    await markBooked(email, { start, end, meetingUrl: null })

    // Buyer confirmation (cal.com also sends its own invite; this is the branded one).
    const key = process.env.RESEND_API_KEY
    if (key) {
      const m = bookingConfirmationEmail({ name, start })
      await new Resend(key).emails.send({ from: FROM, to: email, subject: m.subject, html: m.html }).catch(() => {})
    }

    return NextResponse.json({ ok: true, booking: { start, end } })
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
