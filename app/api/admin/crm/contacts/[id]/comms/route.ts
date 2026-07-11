import { NextRequest, NextResponse } from 'next/server'
import { adminEmail } from '@/lib/session'
import { getSupabaseAdmin } from '@/lib/supabase'
import { sanitizeText } from '@/lib/validation'
import { sendMessage } from '@/lib/comm/engine'
import { writeEmail, writeSms, subjectLines } from '@/lib/comm/aiwriter'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

/* GET — this contact's full communication history + engagement score. */
export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  if (!adminEmail(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await ctx.params
  const db = getSupabaseAdmin()
  const { data } = await db.from('comm_messages').select('id,channel,direction,to_addr,from_addr,subject,body,status,provider,source,created_at,sent_at,opened_at,clicked_at').eq('contact_id', id).order('created_at', { ascending: false }).limit(200)
  const rows = data || []
  const sent = rows.filter((r) => r.direction === 'outbound').length
  const opened = rows.filter((r) => r.opened_at || ['opened', 'clicked'].includes(r.status as string)).length
  const clicked = rows.filter((r) => r.clicked_at || r.status === 'clicked').length
  const replies = rows.filter((r) => r.direction === 'inbound').length
  const engagement = Math.min(100, Math.round((opened * 8) + (clicked * 15) + (replies * 25)))
  return NextResponse.json({ messages: rows, stats: { sent, opened, clicked, replies, engagement } })
}

/* POST { action: send | generate_email | generate_sms | subjects } */
export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const actor = adminEmail(req)
  if (!actor) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await ctx.params
  const b = await req.json().catch(() => ({}))
  const db = getSupabaseAdmin()
  const action = String(b?.action || '')

  if (action === 'generate_email') return NextResponse.json(await writeEmail(id, sanitizeText(b?.brief, 800), actor))
  if (action === 'generate_sms') return NextResponse.json(await writeSms(id, sanitizeText(b?.brief, 800), actor))
  if (action === 'subjects') return NextResponse.json(await subjectLines(sanitizeText(b?.topic, 500), actor))

  if (action === 'send') {
    const { data: c } = await db.from('crm_contacts').select('email,phone').eq('id', id).maybeSingle()
    if (!c) return NextResponse.json({ error: 'contact not found' }, { status: 404 })
    const channel = b?.channel === 'sms' ? 'sms' : b?.channel === 'whatsapp' ? 'whatsapp' : 'email'
    const to = channel === 'email' ? (c.email as string) : (c.phone as string)
    if (!to) return NextResponse.json({ error: `contact has no ${channel === 'email' ? 'email' : 'phone'}` }, { status: 400 })
    const r = await sendMessage({ channel, to, subject: b?.subject ? sanitizeText(b.subject, 240) : undefined, html: channel === 'email' ? b?.body : undefined, text: b?.body, contactId: id, source: 'crm', scheduledAt: b?.scheduled_at })
    return NextResponse.json({ ok: r.status !== 'failed', result: r })
  }
  return NextResponse.json({ error: 'unknown action' }, { status: 400 })
}
