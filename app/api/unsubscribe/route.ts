import { NextRequest, NextResponse } from 'next/server'
import { verifyUnsub, unsubscribe, resubscribe } from '@/lib/comm/unsubscribe'

export const dynamic = 'force-dynamic'

/* One-click unsubscribe. GET renders a confirmation page (and unsubscribes);
   POST is the RFC-8058 one-click endpoint mailbox providers call directly. */
function page(title: string, body: string) {
  return new NextResponse(`<!doctype html><html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>${title}</title></head>
<body style="margin:0;font-family:Inter,Helvetica,Arial,sans-serif;background:#f4f2f6;display:flex;align-items:center;justify-content:center;min-height:100vh;">
<div style="background:#fff;border-radius:16px;box-shadow:0 8px 30px rgba(40,20,50,.1);padding:40px;max-width:420px;text-align:center;">
<div style="font-size:20px;font-weight:800;color:#3D2645;margin-bottom:8px;">The<span style="color:#C9A84C">5th</span></div>
${body}</div></body></html>`, { headers: { 'Content-Type': 'text/html' } })
}

export async function POST(req: NextRequest) {
  const token = new URL(req.url).searchParams.get('token') || (await req.text().then((t) => new URLSearchParams(t).get('token')).catch(() => null))
  const email = token ? verifyUnsub(token) : null
  if (email) await unsubscribe(email, 'one-click', 'list-unsubscribe')
  return NextResponse.json({ ok: !!email })
}

export async function GET(req: NextRequest) {
  const sp = new URL(req.url).searchParams
  const token = sp.get('token')
  const email = token ? verifyUnsub(token) : null
  if (!email) return page('Invalid link', '<p style="color:#6b6570;font-size:14px;">This unsubscribe link is invalid or expired.</p>')
  if (sp.get('resubscribe') === '1') { await resubscribe(email); return page('Resubscribed', `<p style="color:#2b2530;font-size:15px;">You're back on the list — <b>${email}</b> will receive our emails again.</p>`) }
  await unsubscribe(email, 'link', 'link')
  return page('Unsubscribed', `<p style="color:#2b2530;font-size:15px;line-height:1.6;">You've been unsubscribed. <b>${email}</b> won't receive further emails from us.</p><p style="margin-top:16px;"><a href="?token=${encodeURIComponent(token!)}&resubscribe=1" style="color:#C9A84C;font-size:13px;">Changed your mind? Resubscribe</a></p>`)
}
