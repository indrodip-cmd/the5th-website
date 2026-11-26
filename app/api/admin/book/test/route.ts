import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { adminEmail } from '@/lib/session'
import { TEMPLATES } from '@/lib/book-email'
import { FROM, REPLY_TO } from '@/lib/event-campaign'

export const dynamic = 'force-dynamic'
/* POST { template } sends that book email to the signed-in admin ONLY, so the
   design can be checked in a real inbox. Never accepts another recipient. */
export async function POST(req: NextRequest) {
  const to = adminEmail(req)
  if (!to) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { template } = await req.json().catch(() => ({ template: '' }))
  const fn = TEMPLATES[String(template)]; if (!fn) return NextResponse.json({ error: 'Unknown template' }, { status: 400 })
  if (!process.env.RESEND_API_KEY) return NextResponse.json({ error: 'RESEND_API_KEY is not set' }, { status: 503 })
  const r = fn({ name: to.split('@')[0], unsub: '#', downloadUrl: 'https://the5thglobal.consulting/book' })
  const { error } = await new Resend(process.env.RESEND_API_KEY).emails.send({ from: FROM, to, replyTo: REPLY_TO, subject: `[TEST] ${r.subject}`, html: r.html, text: r.text })
  if (error) return NextResponse.json({ error: String((error as { message?: string }).message || error) }, { status: 502 })
  return NextResponse.json({ ok: true, to })
}
