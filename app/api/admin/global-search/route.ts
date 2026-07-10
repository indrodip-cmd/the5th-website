import { NextRequest, NextResponse } from 'next/server'
import { adminEmail } from '@/lib/session'
import { getSupabaseAdmin } from '@/lib/supabase'
import { searchContacts } from '@/lib/crm'

export const dynamic = 'force-dynamic'

/* One search across the whole platform, for the ⌘K command palette. */
export async function GET(req: NextRequest) {
  if (!adminEmail(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const q = (new URL(req.url).searchParams.get('q') || '').trim()
  if (!q) return NextResponse.json({ contacts: [], meetings: [], opportunities: [], content: [], tasks: [] })
  const db = getSupabaseAdmin()
  const like = `%${q}%`
  const [contacts, meetings, opportunities, content, tasks] = await Promise.all([
    searchContacts(q, 8),
    db.from('crm_meetings').select('id,title,starts_at,status').ilike('title', like).is('deleted_at', null).limit(6),
    db.from('crm_opportunities').select('id,name,value,contact_id').ilike('name', like).is('deleted_at', null).limit(6),
    db.from('cms_content').select('id,title,slug,type').ilike('title', like).limit(6),
    db.from('crm_tasks').select('id,title,contact_id,status').ilike('title', like).limit(6),
  ])
  return NextResponse.json({
    contacts, meetings: meetings.data || [], opportunities: opportunities.data || [],
    content: content.data || [], tasks: tasks.data || [],
  })
}
