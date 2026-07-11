/* Memory ingestion (3I.7) — turns raw platform data into structured, graph-linked
   memories (idempotent via source+source_id). Runs incrementally from the daily
   cron and on demand; derives topics/entities from existing structured data
   (coaching intelligence, Whop members) to stay cheap. Layered AI summaries roll
   memories up per month for context-efficient recall. */
import { getSupabaseAdmin } from '@/lib/supabase'
import { anthropic, modelFor } from '@/lib/ai/router'
import { logAiEvent } from '@/lib/ai-usage'
import { recordMemory, type EntityRef } from '@/lib/memory/store'

type Row = Record<string, unknown>

async function existingSourceIds(source: string): Promise<Set<string>> {
  const { data } = await getSupabaseAdmin().from('business_memories').select('source_id').eq('source', source).not('source_id', 'is', null).limit(5000)
  return new Set((data || []).map((r) => r.source_id as string))
}

/* Ingest recent coaching/sales calls as meeting memories, enriched with the
   coaching_intelligence analysis (objections, frameworks, wins → topics). */
async function ingestCoachingCalls(batch: number): Promise<number> {
  const db = getSupabaseAdmin()
  const done = await existingSourceIds('coaching_call')
  const { data: calls } = await db.from('coaching_calls').select('id,title,date,summary,attendees').order('date', { ascending: false }).limit(400)
  const todo = (calls || []).filter((c) => !done.has(c.id as string)).slice(0, batch)
  if (!todo.length) return 0
  const { data: intel } = await db.from('coaching_intelligence').select('coaching_call_id,call_type,analysis,summary').in('coaching_call_id', todo.map((c) => c.id))
  const byCall = new Map((intel || []).map((i) => [i.coaching_call_id as string, i]))
  let n = 0
  for (const c of todo) {
    const ci = byCall.get(c.id as string) as Row | undefined
    const a = (ci?.analysis as Row) || {}
    const topics = [
      ...(ci?.call_type ? [String(ci.call_type)] : []),
      ...((a.objections as string[]) || []).slice(0, 3),
      ...((a.frameworks as string[]) || []).slice(0, 3),
    ].slice(0, 8)
    const attendees = Array.isArray(c.attendees) ? (c.attendees as unknown[]).map((x) => String(x)) : []
    const entities: EntityRef[] = attendees.slice(0, 4).map((nm) => ({ name: nm, type: 'person' }))
    await recordMemory({
      memory_type: 'meeting', title: String(c.title || 'Coaching call'),
      content: (ci?.summary as string) || (c.summary as string) || '', summary: (ci?.summary as string) || (c.summary as string) || '',
      entities, topics, source: 'coaching_call', source_id: c.id as string, importance: 3,
      occurred_at: (c.date as string) || undefined, metadata: { call_type: ci?.call_type || null, wins: (a.client_wins as string[]) || [] },
    })
    n++
  }
  return n
}

/* Ingest Whop customers as customer/financial memories with LTV. */
async function ingestCustomers(batch: number): Promise<number> {
  const db = getSupabaseAdmin()
  const done = await existingSourceIds('whop_member')
  const { data: members } = await db.from('whop_members').select('id,name,email,derived_status,usd_total_spent,joined_at').order('joined_at', { ascending: false }).limit(400)
  const todo = (members || []).filter((m) => !done.has(m.id as string)).slice(0, batch)
  let n = 0
  for (const m of todo) {
    const name = String(m.name || m.email || 'Customer')
    await recordMemory({
      memory_type: 'customer', title: `Customer: ${name}`,
      content: `${name} (${m.email || ''}) — status ${m.derived_status || 'unknown'}, lifetime $${Number(m.usd_total_spent || 0).toLocaleString()}.`,
      entities: [{ name, type: 'customer' }], topics: ['whop', String(m.derived_status || 'customer')],
      source: 'whop_member', source_id: m.id as string, importance: Number(m.usd_total_spent || 0) > 1000 ? 4 : 3,
      occurred_at: (m.joined_at as string) || undefined, metadata: { ltv: Number(m.usd_total_spent || 0) },
    })
    n++
  }
  return n
}

export async function syncMemory(batch = 30): Promise<{ meetings: number; customers: number }> {
  const meetings = await ingestCoachingCalls(batch).catch(() => 0)
  const customers = await ingestCustomers(batch).catch(() => 0)
  return { meetings, customers }
}

/* Layered summary: roll up the current month's memories into one AI summary,
   preserving context while cutting tokens. Idempotent (upsert per period). */
export async function summarizeMonth(monthKey?: string): Promise<{ ok: boolean; period_key: string }> {
  const db = getSupabaseAdmin()
  const now = new Date()
  const key = monthKey || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const start = new Date(`${key}-01T00:00:00Z`).toISOString()
  const end = new Date(new Date(start).setMonth(new Date(start).getMonth() + 1)).toISOString()
  const { data } = await db.from('business_memories').select('memory_type,title,summary,topics,occurred_at').gte('occurred_at', start).lt('occurred_at', end).order('occurred_at', { ascending: false }).limit(400)
  const rows = (data || []) as Row[]
  if (!rows.length) return { ok: false, period_key: key }
  const ai = anthropic()
  if (!ai) return { ok: false, period_key: key }
  const model = modelFor('cheap')
  const digest = rows.map((r) => `[${r.memory_type}] ${r.title}${r.summary ? ' — ' + String(r.summary).slice(0, 120) : ''}`).join('\n').slice(0, 12000)
  const t0 = Date.now()
  const msg = await ai.messages.create({ model, max_tokens: 500, system: 'You write a tight monthly business memory digest for The5th: key meetings, customers, decisions, experiments and themes. Factual, skimmable, 6-10 bullet points.', messages: [{ role: 'user', content: `Month ${key} memories:\n${digest}` }] })
  await logAiEvent({ endpoint: 'memory_summary', model, usage: msg.usage, latencyMs: Date.now() - t0 })
  const text = msg.content.find((b) => b.type === 'text')
  const summary = text && text.type === 'text' ? text.text : ''
  await db.from('memory_summaries').upsert({ period: 'month', period_key: key, memory_type: 'all', summary, count: rows.length }, { onConflict: 'period,period_key,memory_type' })
  return { ok: true, period_key: key }
}
