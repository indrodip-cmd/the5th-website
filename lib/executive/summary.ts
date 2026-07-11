/* Executive Command Center (3I.8B.3) — one aggregation over every system, so the
   owner sees the whole business at a glance and knows what to focus on. Reuses
   the existing engines (revenue, sales, comms, AI, journey decisions, health). */
import { getSupabaseAdmin } from '@/lib/supabase'
import { getRevenueSummary, getBalances } from '@/lib/revenue'
import { listBoard } from '@/lib/sales'
import { aiCostSummary } from '@/lib/ai-usage'
import { intelligenceDashboard, topRecommendations } from '@/lib/journey/decisions'

type Row = Record<string, unknown>
const iso = (d: Date) => d.toISOString()

export async function executiveSummary(): Promise<Row> {
  const db = getSupabaseAdmin()
  const now = new Date()
  const startToday = iso(new Date(now.getFullYear(), now.getMonth(), now.getDate()))
  const endToday = iso(new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1))
  const last7 = iso(new Date(Date.now() - 7 * 86400000))
  const last30 = iso(new Date(Date.now() - 30 * 86400000))
  const today = startToday.slice(0, 10)

  const [rev, balances, board, ai, intel, recs] = await Promise.all([
    getRevenueSummary().catch(() => ({})), getBalances().catch(() => ({})), listBoard().catch(() => ({ stages: [] })),
    aiCostSummary().catch(() => ({})), intelligenceDashboard().catch(() => ({})), topRecommendations('open', 8).catch(() => []),
  ])

  const [newLeads, callsToday, upcoming, comms, overdue, wfCounts, apprCount] = await Promise.all([
    db.from('crm_contacts').select('id', { count: 'exact', head: true }).is('deleted_at', null).gte('created_at', last7),
    db.from('crm_meetings').select('id', { count: 'exact', head: true }).eq('status', 'upcoming').gte('starts_at', startToday).lt('starts_at', endToday),
    db.from('crm_meetings').select('title,starts_at,contact:crm_contacts(name,email)').eq('status', 'upcoming').gte('starts_at', now.toISOString()).order('starts_at').limit(6),
    db.from('comm_messages').select('status,direction').gte('created_at', last30).limit(20000),
    db.from('crm_tasks').select('title,due_date,contact:crm_contacts(name,email)').neq('status', 'done').lt('due_date', today).order('due_date').limit(8),
    db.from('automation_workflows').select('status').limit(1000),
    db.from('automation_workflow_runs').select('id', { count: 'exact', head: true }).eq('status', 'awaiting_approval'),
  ])

  const cm = (comms.data || []) as Row[]
  const sent = cm.filter((m) => m.direction === 'outbound').length
  const opened = cm.filter((m) => ['opened', 'clicked'].includes(m.status as string)).length
  const clicked = cm.filter((m) => m.status === 'clicked').length
  const inbound = cm.filter((m) => m.direction === 'inbound').length
  const wf = (wfCounts.data || []) as Row[]
  const pipelineValue = ((board as Row).stages as Row[] || []).reduce((s, st) => s + Number(st.value || 0), 0)

  // Today's priorities: journey recommendations + overdue tasks + system alerts.
  const priorities: Row[] = []
  for (const r of recs as Row[]) priorities.push({ kind: 'lead', priority: r.priority, title: r.action, detail: `${r.contact_name || r.contact_email} · ${r.reason || ''}`, link: `/admin/crm/${r.contact_id}` })
  for (const t of (overdue.data || []) as Row[]) priorities.push({ kind: 'task', priority: 70, title: `Overdue: ${t.title}`, detail: (t.contact as Row)?.name as string || (t.contact as Row)?.email as string || '', link: '/admin/crm/tasks' })
  priorities.sort((a, b) => Number(b.priority) - Number(a.priority))

  return {
    revenue: { today: (rev as Row).today || 0, month: (rev as Row).month || 0, lifetime: (rev as Row).lifetime || 0, balances },
    sales: { pipeline_value: pipelineValue, stages: (board as Row).stages || [] },
    leads: { new_7d: newLeads.count || 0, high_intent: (intel as Row).highIntent || 0, at_risk: (intel as Row).atRisk || 0, open_recommendations: (intel as Row).open || 0 },
    meetings: { today: callsToday.count || 0, upcoming: upcoming.data || [] },
    comms: { sent_30d: sent, open_rate: sent ? Math.round((opened / sent) * 100) : 0, click_rate: opened ? Math.round((clicked / opened) * 100) : 0, replies_30d: inbound },
    ai: { month_cost: (ai as Row).monthCost ?? (ai as Row).month ?? 0, today_cost: (ai as Row).todayCost ?? (ai as Row).today ?? 0 },
    automation: { total: wf.length, published: wf.filter((w) => w.status === 'published').length, paused: wf.filter((w) => w.status === 'paused').length, approvals: apprCount.count || 0 },
    priorities: priorities.slice(0, 10),
    lifecycle: (intel as Row).lifecycle || [],
  }
}
