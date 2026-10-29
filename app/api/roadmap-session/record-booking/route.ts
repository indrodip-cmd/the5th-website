import { NextRequest, NextResponse } from 'next/server'
import { limit, clientIp } from '@/lib/rateLimit'
import { isValidEmail, sanitizeName } from '@/lib/validation'
import { Resend } from 'resend'
import { markBooked } from '@/lib/roadmap-session'
import { sendCapiEvent } from '@/lib/meta-capi'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const MINUTES = 60
const FROM = 'The5th Global Consulting <indrodip@10kroadmap.org>'

/* Records a cal.com booking made in the /roadmap-session/schedule embed.
   Fires Schedule via Conversions API (brief section 7); the thank-you page
   fires a backup client-side pixel event with the SAME event_id for dedup. */
export async function POST(req: NextRequest) {
  const ip = clientIp(req)
  const rl = await limit(`rs-record-booking:ip:${ip}`, 20, 600)
  if (!rl.ok) return NextResponse.json({ ok: false }, { status: 429 })

  try {
    const body = await req.json().catch(() => ({}))
    const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : ''
    const name = sanitizeName(body?.name)
    const start = typeof body?.start === 'string' ? body.start : ''
    const eventId = typeof body?.eventId === 'string' ? body.eventId.slice(0, 80) : `rs-sched-${Date.now()}`
    if (!isValidEmail(email) || !start || Number.isNaN(Date.parse(start))) return NextResponse.json({ ok: false }, { status: 400 })

    const end = new Date(new Date(start).getTime() + MINUTES * 60000).toISOString()
    await markBooked(email, { start, end, meetingUrl: null })

    await sendCapiEvent({
      eventName: 'Schedule', eventId, sourceUrl: typeof body?.pageUrl === 'string' ? body.pageUrl : '',
      user: { email, clientIp: ip, userAgent: req.headers.get('user-agent') },
    }).catch(() => {})

    const key = process.env.RESEND_API_KEY
    if (key) {
      const first = (name || '').split(' ')[0] || 'there'
      const when = new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit', timeZoneName: 'short' }).format(new Date(start))
      await new Resend(key).emails.send({
        from: FROM, to: email, subject: 'Your free Roadmap Session is booked',
        html: `<div style="font-family:Inter,system-ui,sans-serif;max-width:520px;margin:0 auto;color:#2E1A35">
          <h1 style="font-size:22px;margin:0 0 12px">You're booked, ${first}.</h1>
          <p style="font-size:15px;line-height:1.6;color:#645a6e">Your free, 60-minute Roadmap Session with Indrodip is confirmed for:</p>
          <p style="font-size:17px;font-weight:700;margin:10px 0 16px">${when}</p>
          <p style="font-size:14px;line-height:1.6;color:#645a6e">Before we meet, it helps to know roughly your current monthly revenue, your average offer price, and how many qualified conversations you're having each month. Bring those three numbers and we'll do the rest together.</p>
          <p style="font-size:12px;color:#9a93a2;margin-top:22px">© ${new Date().getFullYear()} The5th Global Consulting</p>
        </div>`,
      }).catch(() => {})
    }

    return NextResponse.json({ ok: true, booking: { start, end }, eventId })
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
