import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { limit, clientIp } from '@/lib/rateLimit'
import { isValidEmail, sanitizeText } from '@/lib/validation'
import { upsertContact, logActivity } from '@/lib/crm'

export const dynamic = 'force-dynamic'

const FROM = 'Carolina · The5th <indrodip@10kroadmap.org>'

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

/* Emails the visitor a clean copy of their whole conversation with Carolina.
   Public + rate-limited. Also lands the visitor in the CRM with a logged
   activity, so every chat is captured. */
export async function POST(req: NextRequest) {
  const ip = clientIp(req)
  const rl = await limit(`transcript:ip:${ip}`, 6, 600)
  if (!rl.ok) return NextResponse.json({ error: 'Too many requests. Please wait a moment.' }, { status: 429, headers: { 'Retry-After': String(rl.retryAfter) } })

  const key = process.env.RESEND_API_KEY
  if (!key) return NextResponse.json({ error: 'Email is not configured.' }, { status: 500 })

  const b = await req.json().catch(() => ({}))
  const email = String(b?.email || '').trim().toLowerCase()
  const name = sanitizeText(b?.name, 120)
  if (!isValidEmail(email)) return NextResponse.json({ error: 'A valid email is required.' }, { status: 400 })

  const raw = Array.isArray(b?.messages) ? b.messages : []
  const msgs = raw
    .map((m: { role?: string; content?: string }) => ({ role: m?.role === 'user' ? 'user' : 'assistant', content: sanitizeText(m?.content, 6000) }))
    .filter((m: { content: string }) => m.content)
    .slice(-100)
  if (msgs.length === 0) return NextResponse.json({ error: 'Nothing to send yet.' }, { status: 400 })

  const firstName = (name || 'there').split(' ')[0]
  const rows = msgs.map((m: { role: string; content: string }) => {
    const mine = m.role === 'user'
    const who = mine ? esc(firstName) : 'Carolina'
    const bg = mine ? '#EEF2FF' : '#FAF6F0'
    const accent = mine ? '#4338CA' : '#B0902F'
    const body = esc(m.content).replace(/\n/g, '<br>')
    return `<tr><td style="padding:4px 0;">
      <div style="font-family:sans-serif;font-size:10px;font-weight:700;letter-spacing:1px;color:${accent};text-transform:uppercase;margin:8px 0 3px;">${who}</div>
      <div style="background:${bg};border-radius:10px;padding:12px 16px;color:#3d3d3d;font-size:14px;line-height:1.6;">${body}</div>
    </td></tr>`
  }).join('')

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#FAF6F0;font-family:Georgia,serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#FAF6F0;padding:32px 16px;"><tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#fff;border-radius:12px;overflow:hidden;">
  <tr><td style="background:#2E1A35;padding:22px 40px;">
    <span style="color:#fff;font-weight:700;font-size:12px;letter-spacing:2px;font-family:sans-serif;">THE5TH CONSULTING</span>
    <span style="color:#C9A84C;font-size:10px;font-weight:700;letter-spacing:1px;font-family:sans-serif;float:right;">YOUR CONVERSATION</span>
  </td></tr>
  <tr><td style="padding:32px 40px 6px;">
    <h1 style="font-family:Georgia,serif;font-size:23px;color:#1A1A2E;margin:0 0 12px;font-weight:400;">Here's your chat, ${esc(firstName)} &#128172;</h1>
    <p style="color:#5a5550;font-size:14px;line-height:1.7;margin:0 0 8px;">A copy of your conversation with Carolina, for your records. Have another question? Just reply to this email.</p>
  </td></tr>
  <tr><td style="padding:8px 40px 20px;"><table width="100%" cellpadding="0" cellspacing="0">${rows}</table></td></tr>
  <tr><td style="padding:22px 40px 34px;border-top:1px solid #eee;">
    <p style="color:#8A8075;font-size:11px;line-height:1.6;margin:0;font-family:sans-serif;">The5th Consulting &middot; Helping professionals 40+ turn expertise into income.</p>
  </td></tr>
</table></td></tr></table></body></html>`

  try {
    const resend = new Resend(key)
    await resend.emails.send({ from: FROM, to: email, subject: 'Your conversation with Carolina', html, replyTo: 'indrodip@10kroadmap.org' })
  } catch (e) {
    console.error('transcript send failed', e)
    return NextResponse.json({ error: 'Could not send the email. Please try again.' }, { status: 502 })
  }

  await upsertContact(email, name ? { name, source: 'chat' } : { source: 'chat' })
  await logActivity(email, 'email', 'Chat transcript emailed', `${msgs.length} messages sent to ${email}`)
  return NextResponse.json({ ok: true })
}
