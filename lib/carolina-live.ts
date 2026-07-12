import { getSupabaseAdmin } from '@/lib/supabase'

// Live human-takeover store for the Carolina concierge. When a conversation's
// status is 'human', Indrodip is driving it and the AI stays quiet.

export type ChatStatus = 'bot' | 'human'

export async function getChatStatus(conversationId: string): Promise<ChatStatus> {
  try {
    const db = getSupabaseAdmin()
    const { data } = await db.from('carolina_chats').select('status').eq('conversation_id', conversationId).maybeSingle()
    return data?.status === 'human' ? 'human' : 'bot'
  } catch {
    return 'bot'
  }
}

export async function logMessage(
  conversationId: string,
  sender: 'visitor' | 'ai' | 'human',
  text: string,
  meta?: { name?: string; email?: string },
): Promise<void> {
  const t = (text || '').trim()
  if (!t) return
  try {
    const db = getSupabaseAdmin()
    await db.from('carolina_messages').insert({ conversation_id: conversationId, sender, text: t.slice(0, 4000) })
    await db.from('carolina_chats').upsert(
      {
        conversation_id: conversationId,
        last_message: t.slice(0, 200),
        updated_at: new Date().toISOString(),
        ...(meta?.name ? { name: meta.name } : {}),
        ...(meta?.email ? { email: meta.email } : {}),
      },
      { onConflict: 'conversation_id' },
    )
  } catch {
    /* best-effort */
  }
}
