import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { getSupabaseAdmin } from '@/lib/supabase'
import { adminEmail } from '@/lib/session'
import { isValidEmail, sanitizeText } from '@/lib/validation'
import { logActivity } from '@/lib/crm'

export const dynamic = 'force-dynamic'

const FROM = 'The5th Consulting <indrodip@10kroadmap.org>'

function wrap(name: string, bodyHtml: string): string {
  const firstName = (name || 'there').split(' ')[0]
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#FAF6F0;font-family:Georgia,serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#FAF6F0;padding:32px 16px;"><tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#fff;border-radius:12px;overflow:hidden;">
  <tr><td style="background:#2E1A35;padding:20px 40px;"><span style="color:#fff;font-weight:700;font-size:12px;letter-spacing:2px;font-family:sans-serif;">THE5TH CONSULTING</span></td></tr>
  <tr><td style="padding:34px 40px;color:#3d3d3d;font-size:15px;line-height:1.7;">
    <p style="margin:0 0 14px;">Hi ${firstName},</p>
    ${bodyHtml}
    <p style="margin:22px 0 0;">— The5th team</p>
  </td></tr>
  <tr><td style="padding:20px 40px 30px;border-top:1px solid #eee;"><p style="color:#8A8075;font-size:11px;margin:0;font-family:sans-serif;">The5th Consulting · Reply to this email to reach us.</p></td></tr>
</table></td></tr></table></body></html>`
}

/* Send a personal email to a contact and log it on their timeline. */
export async function POST(req: NextRequest) {
  if (!adminEmail(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const key = process.env.RESEND_API_KEY
  if (!key) return NextResponse.json({ error: 'RESEND_API_KEY not configured.' }, { status: 500 })

  const b = await req.json().catch(() => ({}))
  const email = String(b?.email || '').trim().toLowerCase()
  const subject = sanitizeText(b?.subject, 200)
  const body = sanitizeText(b?.body, 8000)
  if (!isValidEmail(email) || !subject || !body) return NextResponse.json({ error: 'Email, subject and body are required.' }, { status: 400 })

  const { data: contact } = await getSupabaseAdmin().from('crm_contacts').select('name').eq('email', email).maybeSingle()
  const html = wrap(contact?.name || '', body.split(/\n{2,}/).map((p) => `<p style="margin:0 0 14px;">${p.replace(/\n/g, '<br>')}</p>`).join(''))

  try {
    const resend = new Resend(key)
    await resend.emails.send({ from: FROM, to: email, subject, html, replyTo: 'indrodip@10kroadmap.org' })
  } catch (e) {
    console.error('crm email send failed', e)
    return NextResponse.json({ error: 'Failed to send email.' }, { status: 502 })
  }
  await logActivity(email, 'email', 'Email sent: ' + subject, body.slice(0, 300))
  return NextResponse.json({ ok: true })
}
