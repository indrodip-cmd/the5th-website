/* Coaching intelligence (3I.3.5+) — turns each Fathom coaching_calls transcript
   into structured signals (sales skills, objections, frameworks, client wins/
   progress, program feedback, strengths, improvement areas) so Command AI can
   answer "how is my program improving / sales skill developing" over time.
   Batched + resumable; runs in the daily cron for new calls automatically. */
import { getSupabaseAdmin } from '@/lib/supabase'
import { anthropic, modelFor } from '@/lib/ai/router'
import { logAiEvent } from '@/lib/ai-usage'

type Row = Record<string, unknown>

const EXTRACT_SYSTEM = `You analyze a coaching/sales call transcript for a business coaching company (The5th) that helps women 40+ turn expertise into income. Extract STRICTLY from the transcript — never invent. Return ONLY minified JSON with this shape:
{"call_type":"discovery|sales|coaching|strategy|group|other",
 "quality_score":<1-10 coaching quality, or null>,
 "sales_score":<1-10 sales execution if it's a sales/discovery call, else null>,
 "summary":"2-3 sentence factual summary",
 "sales_skills":[{"skill":"rapport|discovery|framing|objection_handling|closing|listening","rating":<1-10>,"note":"short evidence"}],
 "objections":["objection raised by prospect/client"],
 "frameworks":["frameworks/methods the coach taught"],
 "client_wins":["concrete wins/results mentioned"],
 "client_progress":"one line on where the client is in their journey",
 "program_feedback":["any feedback about the program/coaching, positive or negative"],
 "strengths":["what the coach did well"],
 "improvement_areas":["specific things the coach could do better"],
 "sentiment":"positive|neutral|negative"}
Omit arrays as [] if nothing applies. Keep it tight.`

function extractJson(text: string): Row {
  try { return JSON.parse(text) } catch {}
  const m = text.match(/\{[\s\S]*\}/); if (m) { try { return JSON.parse(m[0]) } catch {} }
  return {}
}

async function analyzeCall(call: Row): Promise<boolean> {
  const ai = anthropic()
  const transcript = String(call.transcript || '')
  if (!ai || transcript.length < 200) return false
  const model = modelFor('cheap')
  const t0 = Date.now()
  const msg = await ai.messages.create({
    model, max_tokens: 900, system: EXTRACT_SYSTEM,
    messages: [{ role: 'user', content: `TITLE: ${call.title || ''}\nDATE: ${call.date || ''}\n\nTRANSCRIPT:\n${transcript.slice(0, 16000)}` }],
  })
  await logAiEvent({ endpoint: 'coaching_intel', model, usage: msg.usage, latencyMs: Date.now() - t0 })
  const text = msg.content.find((b) => b.type === 'text')
  const a = extractJson(text && text.type === 'text' ? text.text : '{}')
  await getSupabaseAdmin().from('coaching_intelligence').upsert({
    coaching_call_id: call.id, call_type: (a.call_type as string) || 'other', title: (call.title as string) || null,
    call_date: call.date || null, quality_score: Number.isFinite(a.quality_score) ? Number(a.quality_score) : null,
    sales_score: Number.isFinite(a.sales_score) ? Number(a.sales_score) : null, summary: (a.summary as string) || null,
    analysis: a, model,
  }, { onConflict: 'coaching_call_id' })
  return true
}

/* Analyze up to `batch` not-yet-analyzed coaching calls (newest first).
   Idempotent + resumable — safe to run repeatedly and from the cron. */
export async function syncCoachingIntel(batch = 20): Promise<{ analyzed: number; remaining: number }> {
  if (!process.env.ANTHROPIC_API_KEY) return { analyzed: 0, remaining: 0 }
  const db = getSupabaseAdmin()
  let analyzed = 0, offset = 0
  while (analyzed < batch && offset < 500) {
    const { data: page } = await db.from('coaching_calls').select('id,title,date,transcript').order('date', { ascending: false }).range(offset, offset + 24)
    if (!page || page.length === 0) break
    const ids = page.map((p) => p.id as string)
    const { data: done } = await db.from('coaching_intelligence').select('coaching_call_id').in('coaching_call_id', ids)
    const doneSet = new Set((done || []).map((d) => d.coaching_call_id as string))
    for (const call of page) {
      if (analyzed >= batch) break
      if (doneSet.has(call.id as string)) continue
      try { if (await analyzeCall(call as Row)) analyzed++ } catch (e) { console.error('analyzeCall failed', e) }
    }
    offset += 25
  }
  const [{ count: total }, { count: doneCount }] = await Promise.all([
    db.from('coaching_calls').select('id', { count: 'exact', head: true }),
    db.from('coaching_intelligence').select('id', { count: 'exact', head: true }),
  ])
  return { analyzed, remaining: Math.max(0, (total || 0) - (doneCount || 0)) }
}

// ── Reads for Command AI + UI ──
export async function coachingTrends() {
  const { data } = await getSupabaseAdmin().from('coaching_intelligence')
    .select('call_type,call_date,quality_score,sales_score,analysis').order('call_date', { ascending: false }).limit(400)
  const rows = (data || []) as Row[]
  const byMonth = new Map<string, { q: number[]; s: number[] }>()
  const improvement = new Map<string, number>(); const objections = new Map<string, number>(); const wins: string[] = []
  for (const r of rows) {
    const mo = String(r.call_date || '').slice(0, 7) || 'unknown'
    const b = byMonth.get(mo) || { q: [], s: [] }
    if (Number.isFinite(r.quality_score)) b.q.push(Number(r.quality_score))
    if (Number.isFinite(r.sales_score)) b.s.push(Number(r.sales_score))
    byMonth.set(mo, b)
    const a = (r.analysis as Row) || {}
    for (const x of (a.improvement_areas as string[]) || []) improvement.set(x, (improvement.get(x) || 0) + 1)
    for (const x of (a.objections as string[]) || []) objections.set(x, (objections.get(x) || 0) + 1)
    for (const x of ((a.client_wins as string[]) || []).slice(0, 2)) if (wins.length < 20) wins.push(x)
  }
  const avg = (n: number[]) => n.length ? Math.round((n.reduce((a, b) => a + b, 0) / n.length) * 10) / 10 : null
  return {
    analyzed: rows.length,
    monthly: [...byMonth].map(([month, v]) => ({ month, quality: avg(v.q), sales: avg(v.s), calls: v.q.length + v.s.length })).sort((a, b) => a.month.localeCompare(b.month)),
    topImprovementAreas: [...improvement].map(([area, count]) => ({ area, count })).sort((a, b) => b.count - a.count).slice(0, 10),
    topObjections: [...objections].map(([objection, count]) => ({ objection, count })).sort((a, b) => b.count - a.count).slice(0, 10),
    recentWins: wins.slice(0, 12),
  }
}

export async function recentCoachingIntel(limit = 15) {
  const { data } = await getSupabaseAdmin().from('coaching_intelligence')
    .select('call_type,title,call_date,quality_score,sales_score,summary').order('call_date', { ascending: false }).limit(limit)
  return data || []
}
