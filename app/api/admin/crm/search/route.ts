import { NextRequest, NextResponse } from 'next/server'
import { adminEmail } from '@/lib/session'
import { getSupabaseAdmin } from '@/lib/supabase'
import { searchContacts } from '@/lib/crm'

export const dynamic = 'force-dynamic'

/* GET ?q= — global CRM search across contacts, notes, tasks and activities. */
export async function GET(req: NextRequest) {
  if (!adminEmail(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const q = (new URL(req.url).searchParams.get('q') || '').trim()
  if (!q) return NextResponse.json({ contacts: [], notes: [], tasks: [], activities: [] })
  const db = getSupabaseAdmin()
  const like = `%${q}%`
  const [contacts, notes, tasks, activities, opportunities, meetings] = await Promise.all([
    searchContacts(q, 20),
    db.from('crm_notes').select('id,contact_id,body,created_at').ilike('body', like).is('deleted_at', null).limit(15),
    db.from('crm_tasks').select('id,contact_id,title,status,due_date').ilike('title', like).limit(15),
    db.from('crm_activities').select('id,contact_id,type,title,created_at').ilike('title', like).limit(15),
    db.from('crm_opportunities').select('id,contact_id,name,value,status,contact:crm_contacts(name)').ilike('name', like).is('deleted_at', null).limit(15),
    db.from('crm_meetings').select('id,contact_id,title,status,starts_at').ilike('title', like).is('deleted_at', null).limit(15),
  ])
  return NextResponse.json({
    contacts, notes: notes.data || [], tasks: tasks.data || [], activities: activities.data || [],
    opportunities: opportunities.data || [], meetings: meetings.data || [],
  })
}
