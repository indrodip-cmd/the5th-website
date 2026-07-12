import { NextRequest, NextResponse } from 'next/server'
import { adminEmail } from '@/lib/session'
import { getSupabaseAdmin } from '@/lib/supabase'
import { sanitizeText } from '@/lib/validation'

// Admin live inbox: list conversations, read a thread, and take charge —
// take over, send as Indrodip, or hand back to Carolina.
export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  if (!adminEmail(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const db = getSupabaseAdmin()
  const conversationId = sanitizeText(new URL(req.url).searchParams.get('conversationId') || '', 80)

  if (conversationId) {
    const { data: chat } = await db.from('carolina_chats').select('*').eq('conversation_id', conversationId).maybeSingle()
    const { data: messages } = await db
      .from('carolina_messages').select('id, sender, text, created_at')
      .eq('conversation_id', conversationId).order('id', { ascending: true }).limit(300)
    return NextResponse.json({ chat: chat || null, messages: messages || [] })
  }

  const { data: chats } = await db
    .from('carolina_chats').select('conversation_id, name, email, status, last_message, updated_at')
    .order('updated_at', { ascending: false }).limit(60)
  return NextResponse.json({ chats: chats || [] })
}

export async function POST(req: NextRequest) {
  const admin = adminEmail(req)
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json().catch(() => null)
  const conversationId = sanitizeText(body?.conversationId || '', 80)
  const action = sanitizeText(body?.action || '', 20)
  if (!conversationId || !action) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  const db = getSupabaseAdmin()

  if (action === 'takeover') {
    await db.from('carolina_chats').upsert({ conversation_id: conversationId, status: 'human', taken_over_at: new Date().toISOString(), updated_at: new Date().toISOString() }, { onConflict: 'conversation_id' })
    return NextResponse.json({ ok: true, status: 'human' })
  }
  if (action === 'release') {
    await db.from('carolina_chats').update({ status: 'bot', updated_at: new Date().toISOString() }).eq('conversation_id', conversationId)
    return NextResponse.json({ ok: true, status: 'bot' })
  }
  if (action === 'send') {
    const text = sanitizeText(body?.text || '', 4000)
    if (!text) return NextResponse.json({ error: 'Empty message' }, { status: 400 })
    await db.from('carolina_messages').insert({ conversation_id: conversationId, sender: 'human', text })
    await db.from('carolina_chats').upsert({ conversation_id: conversationId, status: 'human', last_message: text.slice(0, 200), updated_at: new Date().toISOString() }, { onConflict: 'conversation_id' })
    return NextResponse.json({ ok: true })
  }
  return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
}
