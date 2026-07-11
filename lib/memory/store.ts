/* Business Memory store (3I.7) — the company's organizational brain. Records
   structured memories, maintains a lightweight knowledge graph (entities +
   edges), and serves timeline / search / decision / experiment reads that
   Command AI uses as its primary context source. Service-role. */
import { getSupabaseAdmin } from '@/lib/supabase'

type Row = Record<string, unknown>
export interface EntityRef { name: string; type?: string }
export interface MemoryInput {
  memory_type: string; title: string; content?: string; summary?: string
  entities?: EntityRef[]; topics?: string[]; source?: string; source_id?: string
  importance?: number; confidence?: number; sensitive?: boolean; occurred_at?: string; metadata?: Row
}

async function upsertEntity(name: string, type = 'topic'): Promise<string | null> {
  const db = getSupabaseAdmin()
  const nm = String(name || '').trim(); if (!nm) return null
  const normalized = nm.toLowerCase().slice(0, 120)
  const { data: e } = await db.from('memory_entities').select('id,mention_count').eq('entity_type', type).eq('normalized', normalized).maybeSingle()
  if (e) { await db.from('memory_entities').update({ mention_count: Number(e.mention_count || 0) + 1, updated_at: new Date().toISOString() }).eq('id', e.id); return e.id as string }
  const { data } = await db.from('memory_entities').insert({ entity_type: type, name: nm, normalized }).select('id').single()
  return (data?.id as string) || null
}

async function linkPair(a: string | null, b: string | null, relation: string, memoryId?: string) {
  if (!a || !b || a === b) return
  const db = getSupabaseAdmin()
  const { data: e } = await db.from('memory_edges').select('id,weight').eq('from_entity', a).eq('to_entity', b).eq('relation', relation).maybeSingle()
  if (e) await db.from('memory_edges').update({ weight: Number(e.weight || 0) + 1 }).eq('id', e.id)
  else await db.from('memory_edges').insert({ from_entity: a, to_entity: b, relation, memory_id: memoryId || null })
}

/* Record one memory (idempotent on source+source_id) and weave it into the graph.
   The first entity is treated as the subject; others link to it (related_to). */
export async function recordMemory(m: MemoryInput): Promise<string | null> {
  const db = getSupabaseAdmin()
  const ents = (m.entities || []).filter((e) => e && e.name)
  const row: Row = {
    memory_type: m.memory_type, title: m.title.slice(0, 240), content: m.content || null, summary: m.summary || null,
    entities: ents.map((e) => e.name), topics: (m.topics || []).slice(0, 12), source: m.source || 'manual', source_id: m.source_id || null,
    importance: m.importance ?? 3, confidence: m.confidence ?? 0.8, sensitive: !!m.sensitive,
    occurred_at: m.occurred_at || new Date().toISOString(), metadata: m.metadata || {}, updated_at: new Date().toISOString(),
  }
  let id: string | null = null
  if (m.source_id) {
    const { data: ex } = await db.from('business_memories').select('id').eq('source', row.source as string).eq('source_id', m.source_id).maybeSingle()
    if (ex) { await db.from('business_memories').update(row).eq('id', ex.id); id = ex.id as string }
  }
  if (!id) { const { data } = await db.from('business_memories').insert(row).select('id').single(); id = (data?.id as string) || null }
  if (!id) return null
  // Graph: upsert entities + topics, link to the subject entity.
  const entIds = await Promise.all([...ents.slice(0, 8).map((e) => upsertEntity(e.name, e.type || 'topic')), ...(m.topics || []).slice(0, 6).map((t) => upsertEntity(t, 'topic'))])
  const subject = entIds[0]
  for (let i = 1; i < entIds.length; i++) await linkPair(subject, entIds[i], 'related_to', id)
  return id
}

// ── Reads ──
export interface SearchOpts { query?: string; type?: string; entity?: string; topic?: string; from?: string; to?: string; limit?: number }
export async function searchMemories(o: SearchOpts): Promise<Row[]> {
  let q = getSupabaseAdmin().from('business_memories').select('id,memory_type,title,summary,topics,entities,source,importance,occurred_at,status')
    .order('occurred_at', { ascending: false }).limit(Math.min(o.limit || 50, 200))
  if (o.type) q = q.eq('memory_type', o.type)
  if (o.entity) q = q.contains('entities', [o.entity])
  if (o.topic) q = q.contains('topics', [o.topic])
  if (o.from) q = q.gte('occurred_at', o.from)
  if (o.to) q = q.lte('occurred_at', o.to)
  if (o.query) { const like = `%${o.query}%`; q = q.or(`title.ilike.${like},content.ilike.${like},summary.ilike.${like}`) }
  const { data } = await q
  return data || []
}
export async function getMemory(id: string): Promise<Row | null> {
  const { data } = await getSupabaseAdmin().from('business_memories').select('*').eq('id', id).maybeSingle()
  return data
}
export async function memoryStats() {
  const db = getSupabaseAdmin()
  const { data } = await db.from('business_memories').select('memory_type').limit(20000)
  const byType = new Map<string, number>()
  for (const r of (data || []) as Row[]) byType.set(r.memory_type as string, (byType.get(r.memory_type as string) || 0) + 1)
  const [{ count: entities }, { count: edges }, { count: decisions }, { count: experiments }] = await Promise.all([
    db.from('memory_entities').select('id', { count: 'exact', head: true }),
    db.from('memory_edges').select('id', { count: 'exact', head: true }),
    db.from('business_decisions').select('id', { count: 'exact', head: true }),
    db.from('business_experiments').select('id', { count: 'exact', head: true }),
  ])
  return { total: (data || []).length, byType: [...byType].map(([type, count]) => ({ type, count })).sort((a, b) => b.count - a.count), entities: entities || 0, edges: edges || 0, decisions: decisions || 0, experiments: experiments || 0 }
}
export async function topEntities(type?: string, limit = 40): Promise<Row[]> {
  let q = getSupabaseAdmin().from('memory_entities').select('*').order('mention_count', { ascending: false }).limit(limit)
  if (type) q = q.eq('entity_type', type)
  const { data } = await q; return data || []
}
export async function entityGraph(entityId: string) {
  const db = getSupabaseAdmin()
  const [{ data: node }, { data: out }, { data: inc }] = await Promise.all([
    db.from('memory_entities').select('*').eq('id', entityId).maybeSingle(),
    db.from('memory_edges').select('relation,weight,to:to_entity(id,name,entity_type)').eq('from_entity', entityId).order('weight', { ascending: false }).limit(30),
    db.from('memory_edges').select('relation,weight,from:from_entity(id,name,entity_type)').eq('to_entity', entityId).order('weight', { ascending: false }).limit(30),
  ])
  return { node, out: out || [], in: inc || [] }
}

// ── Decisions ──
export async function recordDecision(input: { title: string; description?: string; category?: string; decided_by?: string; reason?: string; outcome?: string; decided_at?: string; related?: unknown[] }) {
  const db = getSupabaseAdmin()
  const { data } = await db.from('business_decisions').insert({
    title: input.title, description: input.description || null, category: input.category || 'general', decided_by: input.decided_by || null,
    reason: input.reason || null, outcome: input.outcome || null, decided_at: input.decided_at || new Date().toISOString(), related: input.related || [],
  }).select('*').single()
  // Mirror into memory so Command AI + timeline see it.
  if (data) await recordMemory({ memory_type: 'decision', title: input.title, content: [input.description, input.reason && `Reason: ${input.reason}`, input.outcome && `Outcome: ${input.outcome}`].filter(Boolean).join('\n'), source: 'decision', source_id: data.id as string, importance: 5, topics: input.category ? [input.category] : [], occurred_at: data.decided_at as string })
  return data
}
export async function listDecisions(limit = 100): Promise<Row[]> {
  const { data } = await getSupabaseAdmin().from('business_decisions').select('*').order('decided_at', { ascending: false }).limit(limit)
  return data || []
}

// ── Experiments ──
export async function recordExperiment(input: Row) {
  const db = getSupabaseAdmin()
  const { data } = await db.from('business_experiments').insert({
    title: input.title, hypothesis: input.hypothesis || null, metric: input.metric || null,
    start_date: input.start_date || null, end_date: input.end_date || null, results: input.results || null,
    conclusion: input.conclusion || null, status: input.status || 'running', outcome: input.outcome || null,
  }).select('*').single()
  if (data) await recordMemory({ memory_type: 'experiment', title: String(input.title), content: [input.hypothesis && `Hypothesis: ${input.hypothesis}`, input.results && `Results: ${input.results}`, input.conclusion && `Conclusion: ${input.conclusion}`].filter(Boolean).join('\n'), source: 'experiment', source_id: data.id as string, importance: 4, topics: input.metric ? [String(input.metric)] : [] })
  return data
}
export async function updateExperiment(id: string, patch: Row) {
  const { data } = await getSupabaseAdmin().from('business_experiments').update({ ...patch, updated_at: new Date().toISOString() }).eq('id', id).select('*').single()
  return data
}
export async function listExperiments(limit = 100): Promise<Row[]> {
  const { data } = await getSupabaseAdmin().from('business_experiments').select('*').order('created_at', { ascending: false }).limit(limit)
  return data || []
}
