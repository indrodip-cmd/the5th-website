import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { sanitizeText } from '@/lib/validation'

// Widget poll: is this conversation human-controlled, and are there new messages
// from Indrodip to show? Scoped to the caller's own conversationId.
export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const sp = new URL(req.url).searchParams
  const conversationId = sanitizeText(sp.get('conversationId') || '', 80)
  const after = Number(sp.get('after')) || 0
  if (!conversationId) return NextResponse.json({ status: 'bot', messages: [] })

  try {
    const db = getSupabaseAdmin()
    const { data: chat } = await db.from('carolina_chats').select('status, read_at, human_typing_at').eq('conversation_id', conversationId).maybeSingle()
    const status = chat?.status === 'human' ? 'human' : 'bot'
    // Indrodip counts as "typing" for ~6s after his last keystroke ping.
    const typing = !!chat?.human_typing_at && (Date.now() - new Date(chat.human_typing_at).getTime() < 6000)

    // Only deliver Indrodip's (human) messages to the widget.
    const { data: msgs } = await db
      .from('carolina_messages')
      .select('id, text')
      .eq('conversation_id', conversationId)
      .eq('sender', 'human')
      .gt('id', after)
      .order('id', { ascending: true })
      .limit(20)

    return NextResponse.json({
      status,
      agent: status === 'human' ? 'indrodip' : null,
      typing,
      readAt: chat?.read_at || null,
      messages: (msgs || []).map((m) => ({ id: m.id, text: m.text })),
    })
  } catch {
    return NextResponse.json({ status: 'bot', messages: [] })
  }
}
