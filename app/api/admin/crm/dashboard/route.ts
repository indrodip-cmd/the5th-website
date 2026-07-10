import { NextRequest, NextResponse } from 'next/server'
import { adminEmail } from '@/lib/session'
import { getSupabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

/* CRM dashboard widgets: new leads, calls today/this week, pipeline value,
   upcoming meetings, overdue tasks, recently won/lost, hot leads. */
export async function GET(req: NextRequest) {
  if (!adminEmail(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const db = getSupabaseAdmin()
  const now = new Date()
  const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
  const endToday = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).toISOString()
  const week = new Date(Date.now() + 7 * 86400000).toISOString()
  const last7 = new Date(Date.now() - 7 * 86400000).toISOString()
  const today = now.toISOString().slice(0, 10)

  const [newLeads, callsToday, callsWeek, openOpps, upcoming, overdue, won, lost, hot] = await Promise.all([
    db.from('crm_contacts').select('id', { count: 'exact', head: true }).is('deleted_at', null).gte('created_at', last7),
    db.from('crm_meetings').select('id', { count: 'exact', head: true }).eq('status', 'upcoming').gte('starts_at', startToday).lt('starts_at', endToday),
    db.from('crm_meetings').select('id', { count: 'exact', head: true }).eq('status', 'upcoming').gte('starts_at', startToday).lte('starts_at', week),
    db.from('crm_opportunities').select('value').eq('status', 'open').is('deleted_at', null),
    db.from('crm_meetings').select('id,title,starts_at,contact:crm_contacts(id,name,email)').eq('status', 'upcoming').gte('starts_at', now.toISOString()).order('starts_at', { ascending: true }).limit(6),
    db.from('crm_tasks').select('id,title,due_date,contact:crm_contacts(id,name)').neq('status', 'done').lt('due_date', today).order('due_date', { ascending: true }).limit(8),
    db.from('crm_opportunities').select('id,name,value,closed_at,contact:crm_contacts(id,name)').eq('status', 'won').is('deleted_at', null).order('closed_at', { ascending: false }).limit(5),
    db.from('crm_opportunities').select('id,name,closed_at,contact:crm_contacts(id,name)').eq('status', 'lost').is('deleted_at', null).order('closed_at', { ascending: false }).limit(5),
    db.from('crm_contacts').select('id,name,email,lead_score,pipeline_stage').is('deleted_at', null).gte('lead_score', 50).order('lead_score', { ascending: false }).limit(6),
  ])

  const pipelineValue = (openOpps.data || []).reduce((s, o) => s + Number(o.value || 0), 0)

  return NextResponse.json({
    newLeads: newLeads.count || 0,
    callsToday: callsToday.count || 0,
    callsThisWeek: callsWeek.count || 0,
    pipelineValue,
    openCount: (openOpps.data || []).length,
    upcomingMeetings: upcoming.data || [],
    overdueTasks: overdue.data || [],
    recentlyWon: won.data || [],
    recentlyLost: lost.data || [],
    hotLeads: hot.data || [],
  })
}
