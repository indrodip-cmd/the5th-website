/* ─────────────────────────────────────────────────────────────────────────
   AI Sales Coach (3I.3) — admin-only, grounded in real CRM data.

   Two capabilities:
   1) generateInsight(kind, entity) — per-record summary / next actions /
      close-probability / risks, cached to crm_ai_insights.
   2) coachChat(messages) — a tool-loop assistant that reads the CRM to answer
      questions ("who are my hottest leads?").

   Hard rule: the model only ever sees real CRM data and is instructed to cite
   it and never fabricate. All reads are service-role, server-side.
   ───────────────────────────────────────────────────────────────────────── */
import Anthropic from '@anthropic-ai/sdk'
import { getSupabaseAdmin } from '@/lib/supabase'
import { emitEvent } from '@/lib/events'
import { getContactBundle, listContacts, searchContacts } from '@/lib/crm'
import { getOpportunity, listBoard } from '@/lib/sales'
import { computeAttribution } from '@/lib/attribution'
import { listPurchases } from '@/lib/purchases'
import { logAiEvent } from '@/lib/ai-usage'

const SONNET = 'claude-sonnet-4-6'
const HAIKU = 'claude-haiku-4-5-20251001'

function client() {
  if (!process.env.ANTHROPIC_API_KEY) return null
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
}

const GROUND = 'You are The5th internal AI Sales Coach for the admin team. You ONLY use the CRM data provided. Never invent facts, names, numbers, or history. When you state something, ground it in the given data. If the data is insufficient, say so plainly. Be concise, specific and useful for a salesperson.'

type Row = Record<string, unknown>

/* Compact 360 context for a contact (kept small for the model). */
export async function contactContext(contactId: string): Promise<Row | null> {
  const bundle = await getContactBundle(contactId)
  if (!bundle) return null
  const c = bundle.contact as Row
  const [attribution, purchases] = await Promise.all([computeAttribution(contactId), listPurchases(contactId)])
  return {
    contact: {
      name: c.name, email: c.email, company: c.company, country: c.country,
      lifecycle_stage: c.lifecycle_stage, pipeline_stage: c.pipeline_stage, lead_score: c.lead_score,
      call_booked: c.call_booked, revenue: c.revenue, ltv: c.ltv, tags: c.tags,
      interest: c.interest, business_stage: c.business_stage, owner: c.owner, source: c.source,
      created_at: c.created_at, last_activity_at: c.last_activity_at,
    },
    first_touch: attribution.first_touch, last_touch: attribution.last_touch,
    activities: (bundle.activities as Row[]).slice(0, 30).map((a) => ({ type: a.type, title: a.title, at: a.created_at })),
    notes: (bundle.notes as Row[]).slice(0, 10).map((n) => ({ body: n.body, at: n.created_at })),
    open_tasks: (bundle.tasks as Row[]).filter((t) => t.status !== 'done').map((t) => ({ title: t.title, due: t.due_date })),
    purchases: purchases.map((p) => ({ product: p.product, amount: p.amount, status: p.status, at: p.purchased_at })),
  }
}

export async function opportunityContext(opportunityId: string): Promise<Row | null> {
  const o = await getOpportunity(opportunityId)
  if (!o) return null
  const opp = o.opportunity as Row
  const contactId = opp.contact_id as string
  const cc = await contactContext(contactId)
  return {
    opportunity: { name: opp.name, value: opp.value, currency: opp.currency, probability: opp.probability, status: opp.status, stage: (opp.stage as Row)?.name, expected_close_date: opp.expected_close_date, products: opp.products },
    meetings: (o.meetings as Row[]).map((m) => ({ title: m.title, status: m.status, at: m.starts_at })),
    ...cc,
  }
}

const PROMPTS: Record<string, { instruction: string; model: string }> = {
  summary: { instruction: 'Write a crisp 3-4 sentence sales summary of this contact for the team. Factual, grounded, no fluff. Return JSON {"text": "..."}.', model: HAIKU },
  next_actions: { instruction: 'Suggest the 3 best next actions to move this relationship forward, grounded in the data. Return JSON {"actions": ["...", "..."]}.', model: HAIKU },
  close_probability: { instruction: 'Estimate the probability (0-100) this becomes/stays a paying customer, with a one-sentence rationale citing the data. Return JSON {"probability": <int>, "reasoning": "..."}.', model: HAIKU },
  risk: { instruction: 'Identify concrete risks or blockers in this deal/relationship, grounded in the data (e.g. no reply in N days, no booking). Return JSON {"risks": ["..."]}.', model: HAIKU },
  insight: { instruction: 'Surface up to 4 sharp, data-grounded observations (e.g. "viewed pricing 5 times", "read 3 case studies", "no reply in 12 days"). Return JSON {"insights": ["..."]}.', model: HAIKU },
}

function extractJson(text: string): Row {
  try { return JSON.parse(text) } catch {}
  const m = text.match(/\{[\s\S]*\}/)
  if (m) { try { return JSON.parse(m[0]) } catch {} }
  return { text }
}

/* Generate (and cache) an insight for a contact or opportunity. */
export async function generateInsight(kind: string, entity: { contactId?: string; opportunityId?: string }): Promise<Row | null> {
  const cfg = PROMPTS[kind]
  const ai = client()
  if (!cfg || !ai) return null
  const context = entity.opportunityId ? await opportunityContext(entity.opportunityId) : entity.contactId ? await contactContext(entity.contactId) : null
  if (!context) return null
  const t0 = Date.now()
  const msg = await ai.messages.create({
    model: cfg.model, max_tokens: 500, system: GROUND,
    messages: [{ role: 'user', content: `${cfg.instruction}\n\nCRM DATA:\n${JSON.stringify(context)}` }],
  })
  logAiEvent({ endpoint: 'insight', model: cfg.model, usage: msg.usage, latencyMs: Date.now() - t0, meta: { kind } })
  const text = msg.content.find((b) => b.type === 'text')
  const body = extractJson(text && text.type === 'text' ? text.text : '{}')
  const db = getSupabaseAdmin()
  const { data } = await db.from('crm_ai_insights').insert({
    contact_id: entity.contactId || null, opportunity_id: entity.opportunityId || null,
    kind, body, model: cfg.model,
  }).select('*').single()
  emitEvent('insight_generated', { kind, contact_id: entity.contactId, opportunity_id: entity.opportunityId })
  return data
}

/* Latest cached insights for an entity. */
export async function getInsights(entity: { contactId?: string; opportunityId?: string }) {
  const db = getSupabaseAdmin()
  let q = db.from('crm_ai_insights').select('*').order('created_at', { ascending: false }).limit(30)
  if (entity.opportunityId) q = q.eq('opportunity_id', entity.opportunityId)
  else if (entity.contactId) q = q.eq('contact_id', entity.contactId)
  const { data } = await q
  // keep the newest per kind
  const latest = new Map<string, Row>()
  for (const r of data || []) if (!latest.has(r.kind as string)) latest.set(r.kind as string, r)
  return [...latest.values()]
}

// ── Coach chat (tool-loop over read-only CRM data) ──
const TOOLS: Anthropic.Tool[] = [
  { name: 'search_contacts', description: 'Search contacts by name/email/company/phone.', input_schema: { type: 'object', properties: { query: { type: 'string' } }, required: ['query'] } },
  { name: 'get_contact', description: 'Get the full 360 record for a contact by id or email.', input_schema: { type: 'object', properties: { id_or_email: { type: 'string' } }, required: ['id_or_email'] } },
  { name: 'hot_leads', description: 'List the current hottest leads (highest lead score).', input_schema: { type: 'object', properties: {} } },
  { name: 'pipeline_summary', description: 'Summarize the sales pipeline: opportunities and value per stage.', input_schema: { type: 'object', properties: {} } },
]

async function runCoachTool(name: string, input: Row): Promise<string> {
  const db = getSupabaseAdmin()
  if (name === 'search_contacts') return JSON.stringify(await searchContacts(String(input.query || ''), 15))
  if (name === 'get_contact') {
    const key = String(input.id_or_email || '')
    const { data } = key.includes('@')
      ? await db.from('crm_contacts').select('id').eq('email', key.toLowerCase()).maybeSingle()
      : { data: { id: key } }
    const id = (data as Row)?.id as string
    return JSON.stringify((id && await contactContext(id)) || { error: 'not found' })
  }
  if (name === 'hot_leads') { const { contacts } = await listContacts({ minScore: 50, sort: 'lead_score:desc', pageSize: 15 }); return JSON.stringify(contacts) }
  if (name === 'pipeline_summary') {
    const board = await listBoard()
    return JSON.stringify((board.stages || []).map((s: Row) => ({ stage: s.name, count: s.count, value: s.value })))
  }
  return JSON.stringify({ error: 'unknown tool' })
}

export async function coachChat(messages: Array<{ role: 'user' | 'assistant'; content: string }>): Promise<string> {
  const ai = client()
  if (!ai) return 'The AI coach is not configured (missing ANTHROPIC_API_KEY).'
  const convo: Anthropic.MessageParam[] = messages.slice(-16).map((m) => ({ role: m.role, content: m.content }))
  const system = `${GROUND}\nYou can call tools to read the CRM. Always base answers on tool results; cite the contact/opportunity you mean. Today is ${new Date().toISOString().slice(0, 10)}.`
  for (let hop = 0; hop < 5; hop++) {
    const t0 = Date.now()
    const res = await ai.messages.create({ model: SONNET, max_tokens: 900, system, tools: TOOLS, messages: convo })
    logAiEvent({ endpoint: 'coach', model: SONNET, usage: res.usage, latencyMs: Date.now() - t0 })
    const toolUses = res.content.filter((b): b is Anthropic.ToolUseBlock => b.type === 'tool_use')
    if (toolUses.length === 0) {
      const text = res.content.find((b) => b.type === 'text')
      return text && text.type === 'text' ? text.text : ''
    }
    convo.push({ role: 'assistant', content: res.content })
    const results: Anthropic.ContentBlockParam[] = []
    for (const tu of toolUses) {
      const out = await runCoachTool(tu.name, (tu.input || {}) as Row).catch((e) => JSON.stringify({ error: String(e) }))
      results.push({ type: 'tool_result', tool_use_id: tu.id, content: out })
    }
    convo.push({ role: 'user', content: results })
  }
  return 'I looked into the CRM but need a more specific question to give you a grounded answer.'
}
