import { NextRequest, NextResponse } from 'next/server'
import { limit, clientIp } from '@/lib/rateLimit'
import { isValidEmail, sanitizeName } from '@/lib/validation'
import { Resend } from 'resend'
import { markBooked, getAuditStatus } from '@/lib/roadmap-audit'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const AUDIT_MINUTES = 60
const FROM = 'The5th Consulting <indrodip@10kroadmap.org>'

/* Records a cal.com booking made in the embed: marks the appointment on the
   lead (+ CRM + admin email via markBooked) and sends the buyer a branded
   confirmation. Only a verified-paid lead can record a booking. */
export async function POST(req: NextRequest) {
  const rl = await limit(`audit-record:ip:${clientIp(req)}`, 20, 600)
  if (!rl.ok) return NextResponse.json({ ok: false }, { status: 429 })

  try {
    const body = await req.json().catch(() => ({}))
    const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : ''
    const name = sanitizeName(body?.name)
    const start = typeof body?.start === 'string' ? body.start : ''
    if (!isValidEmail(email) || !start || Number.isNaN(Date.parse(start))) return NextResponse.json({ ok: false }, { status: 400 })

    const status = await getAuditStatus(email)
    if (!status.paid) return NextResponse.json({ ok: false, error: 'not_paid' }, { status: 402 })

    const end = new Date(new Date(start).getTime() + AUDIT_MINUTES * 60000).toISOString()
    await markBooked(email, { start, end, meetingUrl: null })

    // Buyer confirmation (cal.com also sends its own invite; this is the branded one).
    const key = process.env.RESEND_API_KEY
    if (key) {
      const first = (name || status.name || '').split(' ')[0] || 'there'
      const when = new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit', timeZoneName: 'short' }).format(new Date(start))
      await new Resend(key).emails.send({
        from: FROM, to: email, subject: 'Your $10K Roadmap Audit is booked',
        html: `<div style="font-family:Inter,system-ui,sans-serif;max-width:520px;margin:0 auto;color:#2E1A35">
          <h1 style="font-size:22px;margin:0 0 12px">You're booked, ${first}.</h1>
          <p style="font-size:15px;line-height:1.6;color:#645a6e">Your private 60-minute $10K Roadmap Audit is confirmed for:</p>
          <p style="font-size:17px;font-weight:700;margin:10px 0 16px">${when}</p>
          <p style="font-size:14px;line-height:1.6;color:#645a6e">I'll review your answers before we meet so we go straight to what matters. Bring three numbers: current monthly revenue, average offer price, and qualified leads per month.</p>
          <p style="font-size:12px;color:#9a93a2;margin-top:22px">© ${new Date().getFullYear()} The5th Consulting</p>
        </div>`,
      }).catch(() => {})
    }

    return NextResponse.json({ ok: true, booking: { start, end } })
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
