/* Branded appointment-confirmation email for Carolina bookings.
   Uses Resend (already configured for the sequence emails). Fails soft. */
import { Resend } from 'resend'

const FROM = 'The5th Consulting <indrodip@10kroadmap.org>'

function fmt(startISO: string, timeZone: string): string {
  try {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      timeZoneName: 'short',
      timeZone: timeZone || 'UTC',
    }).format(new Date(startISO))
  } catch {
    return new Date(startISO).toUTCString()
  }
}

const SUPPORT_INBOX = 'support@10kroadmap.org'

/* Notify the team the moment a support ticket is filed. reply_to is set to the
   visitor so a reply goes straight back to them. Fails soft. */
export async function sendTicketEmail(opts: {
  ref: string
  category: string
  name?: string | null
  email?: string | null
  subject?: string | null
  message: string
  pageUrl?: string | null
  source?: string
}): Promise<boolean> {
  const key = process.env.RESEND_API_KEY
  if (!key) {
    console.error('sendTicketEmail: RESEND_API_KEY missing')
    return false
  }
  const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  const row = (label: string, value: string) =>
    `<tr><td style="padding:5px 0;color:#5a5550;font-size:14px;"><strong style="color:#1A1A2E;">${label}:</strong> ${value}</td></tr>`

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#FAF6F0;font-family:Georgia,serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#FAF6F0;padding:28px 16px;"><tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#fff;border-radius:12px;overflow:hidden;">
  <tr><td style="background:#2E1A35;padding:20px 34px;">
    <span style="color:#fff;font-weight:700;font-size:12px;letter-spacing:2px;font-family:sans-serif;">THE5TH CONSULTING</span>
    <span style="color:#C9A84C;font-size:10px;font-weight:700;letter-spacing:1px;font-family:sans-serif;float:right;">NEW SUPPORT TICKET</span>
  </td></tr>
  <tr><td style="padding:30px 34px 6px;">
    <h1 style="font-family:Georgia,serif;font-size:22px;color:#1A1A2E;margin:0 0 14px;font-weight:400;">${esc(opts.ref)} &middot; ${esc(opts.category)}</h1>
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#FAF6F0;border-left:3px solid #C9A84C;border-radius:0 6px 6px 0;padding:16px 20px;margin:0 0 20px;">
      ${opts.subject ? row('Subject', esc(opts.subject)) : ''}
      ${row('From', esc(opts.name || 'Anonymous') + (opts.email ? ` &lt;${esc(opts.email)}&gt;` : ' (no email)'))}
      ${row('Source', esc(opts.source || 'website'))}
      ${opts.pageUrl ? row('Page', `<a href="${esc(opts.pageUrl)}" style="color:#B0902F;">${esc(opts.pageUrl)}</a>`) : ''}
    </table>
    <p style="color:#1A1A2E;font-size:15px;line-height:1.7;margin:0 0 6px;white-space:pre-wrap;">${esc(opts.message)}</p>
  </td></tr>
  <tr><td style="padding:20px 34px 30px;border-top:1px solid #eee;">
    <p style="color:#8A8075;font-size:11px;line-height:1.6;margin:0;font-family:sans-serif;">Reply to this email to respond to the visitor directly. Manage tickets at platform admin &rarr; Tickets.</p>
  </td></tr>
</table></td></tr></table></body></html>`

  try {
    const resend = new Resend(key)
    await resend.emails.send({
      from: FROM,
      to: SUPPORT_INBOX,
      replyTo: opts.email || undefined,
      subject: `[${opts.ref}] ${opts.category}${opts.subject ? `: ${opts.subject}` : ''}`,
      html,
    })
    return true
  } catch (e) {
    console.error('sendTicketEmail failed', e)
    return false
  }
}

export async function sendAppointmentEmail(opts: {
  name: string
  email: string
  startISO: string
  timeZone: string
  meetingUrl?: string
}): Promise<boolean> {
  const key = process.env.RESEND_API_KEY
  if (!key) {
    console.error('sendAppointmentEmail: RESEND_API_KEY missing')
    return false
  }
  const firstName = (opts.name || 'there').split(' ')[0]
  const when = fmt(opts.startISO, opts.timeZone)
  const joinRow = opts.meetingUrl
    ? `<tr><td style="padding:6px 0;color:#5a5550;font-size:14px;"><strong style="color:#1A1A2E;">Join link:</strong> <a href="${opts.meetingUrl}" style="color:#B0902F;">${opts.meetingUrl}</a></td></tr>`
    : ''

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#FAF6F0;font-family:Georgia,serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#FAF6F0;padding:32px 16px;"><tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden;">
  <tr><td style="background:#2E1A35;padding:22px 40px;">
    <span style="color:#fff;font-weight:700;font-size:12px;letter-spacing:2px;font-family:sans-serif;">THE5TH CONSULTING</span>
    <span style="color:#C9A84C;font-size:10px;font-weight:700;letter-spacing:1px;font-family:sans-serif;float:right;">APPOINTMENT CONFIRMED</span>
  </td></tr>
  <tr><td style="padding:36px 40px 8px;">
    <h1 style="font-family:Georgia,serif;font-size:24px;color:#1A1A2E;margin:0 0 14px;font-weight:400;">You're booked, ${firstName} &#127881;</h1>
    <p style="color:#5a5550;font-size:15px;line-height:1.7;margin:0 0 22px;">Your call with The5th Consulting is confirmed. Here are the details:</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#FAF6F0;border-left:3px solid #C9A84C;border-radius:0 6px 6px 0;padding:18px 22px;margin:0 0 24px;">
      <tr><td style="padding:6px 0;color:#5a5550;font-size:14px;"><strong style="color:#1A1A2E;">When:</strong> ${when}</td></tr>
      <tr><td style="padding:6px 0;color:#5a5550;font-size:14px;"><strong style="color:#1A1A2E;">With:</strong> The5th Consulting</td></tr>
      ${joinRow}
    </table>
    <p style="color:#5a5550;font-size:14px;line-height:1.7;margin:0 0 8px;">You'll also receive a calendar invite from cal.com. If you need to reschedule, just reply to this email.</p>
    <p style="color:#5a5550;font-size:14px;line-height:1.7;margin:22px 0 0;">Talk soon,<br><strong style="color:#1A1A2E;">Carolina &amp; the The5th team</strong></p>
  </td></tr>
  <tr><td style="padding:24px 40px 34px;border-top:1px solid #eee;">
    <p style="color:#8A8075;font-size:11px;line-height:1.6;margin:0;font-family:sans-serif;">The5th Consulting &middot; Helping professionals 40+ turn expertise into income.</p>
  </td></tr>
</table></td></tr></table></body></html>`

  try {
    const resend = new Resend(key)
    await resend.emails.send({
      from: FROM,
      to: opts.email,
      subject: `Your call is confirmed — ${when}`,
      html,
    })
    return true
  } catch (e) {
    console.error('sendAppointmentEmail failed', e)
    return false
  }
}
