import { NextRequest, NextResponse } from 'next/server'
import { adminEmail } from '@/lib/session'
import { listNotifications, unreadCount, markRead } from '@/lib/notifications'

export const dynamic = 'force-dynamic'

/* GET — notifications + unread count. */
export async function GET(req: NextRequest) {
  if (!adminEmail(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const [notifications, unread] = await Promise.all([listNotifications({ limit: 40 }), unreadCount()])
  return NextResponse.json({ notifications, unread })
}

/* PATCH — mark read ({ ids: [] } or { all: true }). */
export async function PATCH(req: NextRequest) {
  if (!adminEmail(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const b = await req.json().catch(() => ({}))
  await markRead(b?.all ? 'all' : (Array.isArray(b?.ids) ? b.ids.map(String) : []))
  return NextResponse.json({ ok: true })
}
