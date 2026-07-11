/* Command AI tool registry (3I.3.5) — permission-checked, READ-ONLY tools that
   return only what an admin may see. Wraps the existing business libs + reads
   the shared DB (website CRM/revenue/meetings/CMS + platform coaching data).
   Every tool is grounded: it returns real data or an explicit "none". */
import Anthropic from '@anthropic-ai/sdk'
import { getSupabaseAdmin } from '@/lib/supabase'
import { searchContacts, resolveContact } from '@/lib/crm'
import { getRevenueSummary, getBalances } from '@/lib/revenue'
import { listBoard } from '@/lib/sales'
import { contactContext } from '@/lib/ai-coach'
import { coachingTrends, recentCoachingIntel } from '@/lib/coaching-intel'
import { searchMemories, listDecisions, listExperiments } from '@/lib/memory/store'

type Row = Record<string, unknown>
export interface Tool { def: Anthropic.Tool; run: (input: Row) => Promise<string> }

const j = (v: unknown) => JSON.stringify(v)
const clip = (s: unknown, n: number) => String(s || '').slice(0, n)

export const TOOLS: Tool[] = [
  {
    def: { name: 'search_contacts', description: 'Find CRM contacts (leads & customers) by name, email, company or phone.', input_schema: { type: 'object', properties: { query: { type: 'string' } }, required: ['query'] } },
    run: async (i) => j(await searchContacts(String(i.query || ''), 15)),
  },
  {
    def: { name: 'get_contact_360', description: 'Full 360 profile for one contact (fields, activity, notes, tasks, purchases, attribution) by id or email.', input_schema: { type: 'object', properties: { id_or_email: { type: 'string' } }, required: ['id_or_email'] } },
    run: async (i) => {
      const key = String(i.id_or_email || '')
      const c = await resolveContact(key.includes('@') ? { email: key } : { id: key })
      if (!c) return j({ error: 'not found' })
      return j(await contactContext(c.id as string))
    },
  },
  {
    def: { name: 'revenue_metrics', description: 'Revenue summary: today/week/month/lifetime, refunds, AOV, top products, and current provider balances.', input_schema: { type: 'object', properties: {} } },
    run: async () => { const [summary, balances] = await Promise.all([getRevenueSummary(), getBalances()]); return j({ summary, balances }) },
  },
  {
    def: { name: 'pipeline_stats', description: 'Sales pipeline: opportunity count and total value per stage.', input_schema: { type: 'object', properties: {} } },
    run: async () => { const b = await listBoard(); return j((b.stages || []).map((s: Row) => ({ stage: s.name, count: s.count, value: s.value }))) },
  },
  {
    def: { name: 'search_meetings', description: 'Search all meetings & recorded calls (Cal.com/Zoom/Fathom + coaching calls) by keyword across titles, summaries, participants, objections and wins.', input_schema: { type: 'object', properties: { query: { type: 'string' } }, required: ['query'] } },
    run: async (i) => {
      const db = getSupabaseAdmin(); const like = `%${String(i.query || '')}%`
      const [crm, ci, cc] = await Promise.all([
        db.from('crm_meetings').select('id,title,status,starts_at,summary,contact:crm_contacts(name,email)').or(`title.ilike.${like},summary.ilike.${like}`).limit(8),
        db.from('call_intelligence').select('id,call_type,call_date,participant_names,summary,objections_raised,client_wins').or(`summary.ilike.${like},participant_names.ilike.${like}`).limit(8),
        db.from('coaching_calls').select('id,title,date,summary').or(`title.ilike.${like},summary.ilike.${like}`).limit(8),
      ])
      return j({ crm_meetings: crm.data || [], call_intelligence: ci.data || [], coaching_calls: cc.data || [] })
    },
  },
  {
    def: { name: 'get_meeting_detail', description: 'Full detail for one meeting/call incl. transcript, summary, action items, objections. Source: crm_meetings | call_intelligence | coaching_calls.', input_schema: { type: 'object', properties: { id: { type: 'string' }, source: { type: 'string', enum: ['crm_meetings', 'call_intelligence', 'coaching_calls'] } }, required: ['id', 'source'] } },
    run: async (i) => {
      const db = getSupabaseAdmin(); const src = String(i.source || 'crm_meetings')
      const { data } = await db.from(src).select('*').eq('id', String(i.id)).maybeSingle()
      if (!data) return j({ error: 'not found' })
      const d = data as Row
      // truncate transcripts to keep the model context bounded
      for (const k of ['transcript', 'raw_transcript', 'raw_payload']) if (d[k]) d[k] = clip(d[k], 12000)
      return j(d)
    },
  },
  {
    def: { name: 'search_knowledge', description: 'Search the coaching knowledge base: golden answers (canonical corrected coaching answers) + published CMS content (programs, articles, case studies).', input_schema: { type: 'object', properties: { query: { type: 'string' } }, required: ['query'] } },
    run: async (i) => {
      const db = getSupabaseAdmin(); const like = `%${String(i.query || '')}%`
      const [gold, cms] = await Promise.all([
        db.from('golden_answers').select('topic_tag,question,golden_answer,category').eq('is_active', true).or(`question.ilike.${like},golden_answer.ilike.${like},topic_tag.ilike.${like}`).limit(8),
        db.from('cms_content').select('title,type,slug,summary').eq('status', 'published').or(`title.ilike.${like},summary.ilike.${like}`).limit(8),
      ])
      return j({ golden_answers: gold.data || [], cms_content: cms.data || [] })
    },
  },
  {
    def: { name: 'list_tasks', description: 'Open follow-up tasks across the CRM (optionally overdue only).', input_schema: { type: 'object', properties: { overdue_only: { type: 'boolean' } } } },
    run: async (i) => {
      let q = getSupabaseAdmin().from('crm_tasks').select('title,due_date,status,contact:crm_contacts(name,email)').neq('status', 'done').order('due_date', { ascending: true, nullsFirst: false }).limit(30)
      if (i.overdue_only) q = q.lt('due_date', new Date().toISOString().slice(0, 10))
      const { data } = await q; return j(data || [])
    },
  },
  {
    def: { name: 'list_members', description: 'Membership base: Whop customers with lifetime value + status, or platform members. Optional name/email search.', input_schema: { type: 'object', properties: { query: { type: 'string' } } } },
    run: async (i) => {
      const db = getSupabaseAdmin(); const q = String(i.query || '')
      let mq = db.from('whop_members').select('name,email,derived_status,usd_total_spent,joined_at').order('usd_total_spent', { ascending: false }).limit(25)
      if (q) mq = mq.or(`name.ilike.%${q}%,email.ilike.%${q}%`)
      const { data } = await mq; return j(data || [])
    },
  },
  {
    def: { name: 'coaching_trends', description: "Trends across all analyzed Fathom coaching/sales calls: coaching-quality & sales-execution scores by month, most common coaching improvement areas, most common client objections, and recent client wins. Use this to answer how the program is improving or how sales skills are developing over time.", input_schema: { type: 'object', properties: {} } },
    run: async () => j(await coachingTrends()),
  },
  {
    def: { name: 'recent_coaching_calls', description: 'Most recent analyzed coaching/sales calls with type, coaching-quality & sales scores, and a short summary.', input_schema: { type: 'object', properties: { limit: { type: 'number' } } } },
    run: async (i) => j(await recentCoachingIntel(Math.min(Number(i.limit) || 15, 40))),
  },
  {
    def: { name: 'business_snapshot', description: 'A live snapshot: new leads (7d), calls today, hot leads, open pipeline value, upcoming meetings, month revenue.', input_schema: { type: 'object', properties: {} } },
    run: async () => {
      const db = getSupabaseAdmin(); const now = new Date()
      const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
      const endToday = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).toISOString()
      const last7 = new Date(Date.now() - 7 * 86400000).toISOString()
      const [newLeads, callsToday, hot, opps, upcoming, rev] = await Promise.all([
        db.from('crm_contacts').select('id', { count: 'exact', head: true }).is('deleted_at', null).gte('created_at', last7),
        db.from('crm_meetings').select('id', { count: 'exact', head: true }).eq('status', 'upcoming').gte('starts_at', startToday).lt('starts_at', endToday),
        db.from('crm_contacts').select('id', { count: 'exact', head: true }).is('deleted_at', null).gte('lead_score', 50),
        db.from('crm_opportunities').select('value').eq('status', 'open').is('deleted_at', null),
        db.from('crm_meetings').select('id', { count: 'exact', head: true }).eq('status', 'upcoming').gte('starts_at', now.toISOString()),
        getRevenueSummary(),
      ])
      return j({ new_leads_7d: newLeads.count || 0, calls_today: callsToday.count || 0, hot_leads: hot.count || 0, open_pipeline_value: (opps.data || []).reduce((s, o) => s + Number(o.value || 0), 0), upcoming_meetings: upcoming.count || 0, revenue_today: (rev as Row).today, revenue_month: (rev as Row).month, revenue_lifetime: (rev as Row).lifetime })
    },
  },
  {
    def: { name: 'search_memory', description: "Search The5th's Business Memory — the company's permanent organizational brain (past meetings, customers, decisions, experiments, sales, coaching, financial and operational memories). Use this FIRST for any question about business history, patterns over time, or 'why did we…'. Optional filters: memory_type, entity, topic, date range (from/to ISO).", input_schema: { type: 'object', properties: { query: { type: 'string' }, memory_type: { type: 'string' }, entity: { type: 'string' }, topic: { type: 'string' }, from: { type: 'string' }, to: { type: 'string' } } } },
    run: async (i) => j(await searchMemories({ query: i.query ? String(i.query) : undefined, type: i.memory_type ? String(i.memory_type) : undefined, entity: i.entity ? String(i.entity) : undefined, topic: i.topic ? String(i.topic) : undefined, from: i.from ? String(i.from) : undefined, to: i.to ? String(i.to) : undefined, limit: 40 })),
  },
  {
    def: { name: 'business_timeline', description: "What happened in the business over a period. Returns memories ordered by time. Give an ISO date range (from/to) — e.g. answer 'what changed last quarter' or 'what happened in May'.", input_schema: { type: 'object', properties: { from: { type: 'string' }, to: { type: 'string' }, memory_type: { type: 'string' } }, required: ['from'] } },
    run: async (i) => j(await searchMemories({ from: String(i.from), to: i.to ? String(i.to) : undefined, type: i.memory_type ? String(i.memory_type) : undefined, limit: 80 })),
  },
  {
    def: { name: 'get_journey', description: "A contact's Customer Journey Intelligence: live intent scores (buying intent, engagement, trust, readiness, health), segment, lifecycle, behavioral signals, conversion confidence and the recommended next best action. Use to answer how interested/ready someone is or what to do next. Give id_or_email.", input_schema: { type: 'object', properties: { id_or_email: { type: 'string' } }, required: ['id_or_email'] } },
    run: async (i) => {
      const { computeJourney } = await import('@/lib/journey/intent')
      const key = String(i.id_or_email || '')
      const c = await resolveContact(key.includes('@') ? { email: key } : { id: key })
      if (!c) return j({ error: 'contact not found' })
      return j(await computeJourney(c.id as string))
    },
  },
  {
    def: { name: 'search_communications', description: "Search the Communication OS — every email & SMS sent or received (subject, status, channel, direction). Use to answer 'what did we send X', 'why hasn't X replied', or engagement questions. Filter by email (recipient/sender) or keyword.", input_schema: { type: 'object', properties: { email: { type: 'string' }, query: { type: 'string' }, status: { type: 'string' } } } },
    run: async (i) => {
      let q = getSupabaseAdmin().from('comm_messages').select('channel,direction,to_addr,from_addr,subject,status,source,created_at').order('created_at', { ascending: false }).limit(30)
      if (i.email) q = q.or(`to_addr.ilike.%${i.email}%,contact_email.ilike.%${i.email}%,from_addr.ilike.%${i.email}%`)
      else if (i.query) { const like = `%${i.query}%`; q = q.or(`subject.ilike.${like},body.ilike.${like}`) }
      if (i.status) q = q.eq('status', String(i.status))
      const { data } = await q; return j(data || [])
    },
  },
  {
    def: { name: 'list_decisions', description: 'The decision log — significant business decisions with who/why/outcome. Use to explain why something was decided or how something evolved.', input_schema: { type: 'object', properties: {} } },
    run: async () => j(await listDecisions(60)),
  },
  {
    def: { name: 'list_experiments', description: 'The experiment log — business experiments with hypothesis, results and conclusion. Use to compare what worked and avoid repeating failures.', input_schema: { type: 'object', properties: {} } },
    run: async () => j(await listExperiments(60)),
  },
  {
    def: { name: 'list_agents', description: 'List the specialist AI agents available to orchestrate (Sales, CRM, Marketing, Meeting, Revenue, CEO, etc.) with their role and what they do.', input_schema: { type: 'object', properties: {} } },
    run: async () => { const { data } = await getSupabaseAdmin().from('ai_agents').select('key,name,role,description,autonomy').eq('enabled', true).order('name'); return j(data || []) },
  },
  {
    def: { name: 'run_agent', description: 'Delegate a task to a specialist agent (by its key from list_agents). The agent works grounded in real data; any action that changes data is held for human approval. Returns the agent\'s summary and how many approvals it queued.', input_schema: { type: 'object', properties: { agent_key: { type: 'string' }, goal: { type: 'string' } }, required: ['agent_key', 'goal'] } },
    run: async (i) => {
      const { runAgent } = await import('@/lib/ai/agents')  // dynamic import breaks the registry↔tools load cycle
      const r = await runAgent(String(i.agent_key || ''), String(i.goal || ''), 'command-ai')
      return j({ agent: r.agent, status: r.status, summary: r.reply, tools_used: r.toolsUsed, pending_approvals: r.pendingApprovals, execution_id: r.executionId })
    },
  },
]

export const TOOL_DEFS: Anthropic.Tool[] = TOOLS.map((t) => t.def)
export async function runTool(name: string, input: Row): Promise<string> {
  const t = TOOLS.find((x) => x.def.name === name)
  if (!t) return j({ error: 'unknown tool' })
  try { return await t.run(input) } catch (e) { return j({ error: String(e) }) }
}
