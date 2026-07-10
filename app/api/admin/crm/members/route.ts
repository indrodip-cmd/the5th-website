import { NextRequest, NextResponse } from 'next/server'
import { adminEmail } from '@/lib/session'
import { getSupabaseAdmin } from '@/lib/supabase'
import { whopSyncMembers, whopSearchMembers } from '@/lib/connectors/whop'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

/* GET — Whop members with LTV.
   - ?q=  → live server-side search via Whop's query param (name/username/email)
   - else → the synced whop_members table, sortable + status-filtered + paginated */
export async function GET(req: NextRequest) {
  if (!adminEmail(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const sp = new URL(req.url).searchParams
  const q = (sp.get('q') || '').trim()
  if (q) return NextResponse.json({ members: await whopSearchMembers(q), live: true })

  const db = getSupabaseAdmin()
  const status = sp.get('status') || ''
  const sort = sp.get('sort') === 'joined' ? 'joined_at' : 'usd_total_spent'
  const dir = sp.get('dir') === 'asc'
  const page = Math.max(1, Number(sp.get('page')) || 1)
  const pageSize = 50
  let query = db.from('whop_members').select('*', { count: 'exact' })
  if (status && status !== 'All') query = query.eq('derived_status', status)
  query = query.order(sort, { ascending: dir, nullsFirst: false }).range((page - 1) * pageSize, page * pageSize - 1)
  const { data, count } = await query
  return NextResponse.json({ members: data || [], total: count || 0, page, pageSize })
}

/* POST ?action=sync — full members sync from Whop. */
export async function POST(req: NextRequest) {
  if (!adminEmail(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  return NextResponse.json(await whopSyncMembers())
}
