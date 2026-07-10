import { NextRequest, NextResponse } from 'next/server'
import { adminEmail } from '@/lib/session'
import { sanitizeText } from '@/lib/validation'
import { getSupabaseAdmin } from '@/lib/supabase'
import { commandChat, dailyBriefing } from '@/lib/ai/command'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

/* GET — thread list, or ?thread=<id> for its messages. */
export async function GET(req: NextRequest) {
  const actor = adminEmail(req)
  if (!actor) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const db = getSupabaseAdmin()
  const threadId = new URL(req.url).searchParams.get('thread')
  if (threadId) {
    const { data } = await db.from('command_ai_messages').select('*').eq('thread_id', threadId).order('created_at')
    return NextResponse.json({ messages: data || [] })
  }
  const { data } = await db.from('command_ai_threads').select('*').eq('admin_email', actor).order('updated_at', { ascending: false }).limit(50)
  return NextResponse.json({ threads: data || [] })
}

/* POST
   - { action:'chat', thread_id?, message } → grounded reply, persisted
   - { action:'briefing' } → today's executive briefing
   - { action:'delete', thread_id } */
export async function POST(req: NextRequest) {
  const actor = adminEmail(req)
  if (!actor) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const b = await req.json().catch(() => ({}))
  const db = getSupabaseAdmin()
  const action = String(b?.action || 'chat')

  if (action === 'briefing') {
    const { reply, toolsUsed } = await dailyBriefing(actor)
    return NextResponse.json({ ok: true, reply, toolsUsed })
  }
  if (action === 'delete') {
    if (b?.thread_id) await db.from('command_ai_threads').delete().eq('id', b.thread_id).eq('admin_email', actor)
    return NextResponse.json({ ok: true })
  }

  // chat
  const message = sanitizeText(b?.message, 4000)
  if (!message) return NextResponse.json({ error: 'Empty message.' }, { status: 400 })
  let threadId = b?.thread_id as string | undefined
  if (!threadId) {
    const { data } = await db.from('command_ai_threads').insert({ admin_email: actor, title: message.slice(0, 60) }).select('id').single()
    threadId = data?.id as string
  }
  // Load history for grounding, append the new user message.
  const { data: history } = await db.from('command_ai_messages').select('role,content').eq('thread_id', threadId).order('created_at').limit(30)
  const messages = [...(history || []).map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content as string })), { role: 'user' as const, content: message }]

  await db.from('command_ai_messages').insert({ thread_id: threadId, role: 'user', content: message })
  const { reply, toolsUsed } = await commandChat(messages, actor)
  await db.from('command_ai_messages').insert({ thread_id: threadId, role: 'assistant', content: reply, tools_used: toolsUsed })
  await db.from('command_ai_threads').update({ updated_at: new Date().toISOString() }).eq('id', threadId)

  return NextResponse.json({ ok: true, thread_id: threadId, reply, toolsUsed })
}
