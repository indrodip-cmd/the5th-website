import { NextRequest, NextResponse } from 'next/server'
import { adminEmail } from '@/lib/session'
import { getSupabaseAdmin } from '@/lib/supabase'
import { getRevenueSummary, getBalances } from '@/lib/revenue'

export const dynamic = 'force-dynamic'

/* One bundle powering the Command Center KPI widgets (widgets read from a
   shared provider so the grid stays fast). */
export async function GET(req: NextRequest) {
  if (!adminEmail(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const db = getSupabaseAdmin()
  const now = new Date()
  const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
  const endToday = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).toISOString()
  const startTom = endToday
  const endTom = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2).toISOString()
  const last7 = new Date(Date.now() - 7 * 86400000).toISOString()
  const last1 = new Date(Date.now() - 86400000).toISOString()

  const [revenue, balances, callsToday, callsTom, hotLeads, openOpps, upcoming, newCustomers, aiToday, visitors] = await Promise.all([
    getRevenueSummary(),
    getBalances(),
    db.from('crm_meetings').select('id', { count: 'exact', head: true }).eq('status', 'upcoming').gte('starts_at', startToday).lt('starts_at', endToday),
    db.from('crm_meetings').select('id', { count: 'exact', head: true }).eq('status', 'upcoming').gte('starts_at', startTom).lt('starts_at', endTom),
    db.from('crm_contacts').select('id', { count: 'exact', head: true }).is('deleted_at', null).gte('lead_score', 50),
    db.from('crm_opportunities').select('value').eq('status', 'open').is('deleted_at', null),
    db.from('crm_meetings').select('id', { count: 'exact', head: true }).eq('status', 'upcoming').gte('starts_at', now.toISOString()),
    db.from('crm_purchases').select('contact_id', { count: 'exact', head: true }).eq('status', 'paid').gte('purchased_at', last7),
    db.from('carolina_events').select('id', { count: 'exact', head: true }).gte('created_at', startToday),
    db.from('analytics_events').select('visitor_id').eq('event_type', 'pageview').gte('created_at', last1).limit(5000),
  ])

  const pipelineValue = (openOpps.data || []).reduce((s, o) => s + Number(o.value || 0), 0)
  const uniqueVisitors = new Set((visitors.data || []).map((r) => r.visitor_id as string)).size
  // Primary balance = USD (fall back to the first available currency).
  const usd = balances.find((b) => String((b as Record<string, unknown>).currency).toUpperCase() === 'USD') || balances[0]
  const balAvail = Number((usd as Record<string, unknown>)?.available || 0)
  const balPending = Number((usd as Record<string, unknown>)?.pending || 0)

  return NextResponse.json({
    availableBalance: balAvail, pendingBalance: balPending, hasBalances: balances.length > 0,
    revenueToday: revenue.today, revenueYesterday: revenue.yesterday, revenueWeek: revenue.week,
    revenueMonth: revenue.month, revenueLifetime: revenue.lifetime,
    callsToday: callsToday.count || 0, callsTomorrow: callsTom.count || 0,
    hotLeads: hotLeads.count || 0, pipelineValue, openOpps: (openOpps.data || []).length,
    upcomingMeetings: upcoming.count || 0, newCustomers: newCustomers.count || 0,
    aiConversationsToday: aiToday.count || 0, visitors24h: uniqueVisitors,
  })
}
