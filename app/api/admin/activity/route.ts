import { NextRequest, NextResponse } from 'next/server'
import { adminEmail } from '@/lib/session'
import { getSupabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

type Item = { id: string; kind: string; icon: string; title: string; detail?: string; at: string; href?: string }

/* Merged live activity feed across revenue, CRM, meetings and notifications. */
export async function GET(req: NextRequest) {
  if (!adminEmail(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const db = getSupabaseAdmin()
  const [revenue, activities, meetings, notifs] = await Promise.all([
    db.from('revenue_events').select('id,type,product,amount,currency,contact_id,occurred_at').order('occurred_at', { ascending: false }).limit(20),
    db.from('crm_activities').select('id,type,title,detail,contact_id,created_at').order('created_at', { ascending: false }).limit(30),
    db.from('crm_meetings').select('id,title,status,starts_at,contact_id').order('starts_at', { ascending: false }).limit(15),
    db.from('notifications').select('id,type,title,body,created_at').order('created_at', { ascending: false }).limit(15),
  ])

  const items: Item[] = []
  for (const r of revenue.data || []) items.push({ id: `rev-${r.id}`, kind: 'revenue', icon: r.type === 'refund' ? '↩️' : '💰', title: `${r.type === 'refund' ? 'Refund' : 'Sale'}: ${r.product || ''}`, detail: `$${Number(r.amount || 0).toLocaleString()} ${r.currency || ''}`, at: r.occurred_at as string, href: r.contact_id ? `/admin/crm/${r.contact_id}` : undefined })
  for (const a of activities.data || []) items.push({ id: `act-${a.id}`, kind: 'crm', icon: iconFor(a.type as string), title: (a.title as string) || (a.type as string), detail: (a.detail as string) || undefined, at: a.created_at as string, href: a.contact_id ? `/admin/crm/${a.contact_id}` : undefined })
  for (const m of meetings.data || []) items.push({ id: `mtg-${m.id}`, kind: 'meeting', icon: '📅', title: `${(m.title as string) || 'Meeting'} · ${m.status}`, at: (m.starts_at as string) || '', href: `/admin/crm/meetings/${m.id}` })
  for (const n of notifs.data || []) items.push({ id: `ntf-${n.id}`, kind: 'notification', icon: '🔔', title: n.title as string, detail: (n.body as string) || undefined, at: n.created_at as string })

  items.sort((a, b) => (b.at || '').localeCompare(a.at || ''))
  return NextResponse.json({ items: items.slice(0, 40) })
}

function iconFor(t: string): string {
  return ({ lead: '✦', chat: '💬', call_booked: '📅', email: '✉️', note: '📝', deal: '💰', meeting_completed: '✓' } as Record<string, string>)[t] || '•'
}
