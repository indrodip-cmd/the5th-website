/* Notification Center (3I.4) — one admin notification stream (reuses the
   existing `notifications` table). Fail-soft; emits a bus event. */
import { getSupabaseAdmin } from '@/lib/supabase'
import { emitEvent } from '@/lib/events'

export async function notify(type: string, title: string, body?: string, meta?: Record<string, unknown>) {
  try {
    await getSupabaseAdmin().from('notifications').insert({ type, title, body: body || (meta ? JSON.stringify(meta) : null) })
    emitEvent('notification_created', { type, title })
  } catch (e) { console.error('notify failed', e) }
}

export async function listNotifications(opts: { unreadOnly?: boolean; limit?: number } = {}) {
  let q = getSupabaseAdmin().from('notifications').select('*').order('created_at', { ascending: false }).limit(opts.limit || 50)
  if (opts.unreadOnly) q = q.eq('read', false)
  const { data } = await q
  return data || []
}

export async function unreadCount(): Promise<number> {
  const { count } = await getSupabaseAdmin().from('notifications').select('id', { count: 'exact', head: true }).eq('read', false)
  return count || 0
}

export async function markRead(ids: string[] | 'all') {
  const db = getSupabaseAdmin()
  if (ids === 'all') { await db.from('notifications').update({ read: true }).eq('read', false); return }
  if (ids.length) await db.from('notifications').update({ read: true }).in('id', ids)
}
