/* AI telemetry (3I.5) — real token + cost logging for every Anthropic call.
   Fire-and-forget; never blocks a reply. Cost is estimated from a per-model
   pricing map (USD per token) — edit PRICING if Anthropic's rates change; exact
   billing lives in the Anthropic console, these are directional. */
import { getSupabaseAdmin } from '@/lib/supabase'

type Row = Record<string, unknown>

export interface AnthropicUsage {
  input_tokens?: number | null
  output_tokens?: number | null
  cache_read_input_tokens?: number | null
  cache_creation_input_tokens?: number | null
}

interface Rate { input: number; output: number; cacheRead: number; cacheWrite: number }
// USD per token (i.e. per-MTok / 1e6). Estimates — adjust as needed.
const PRICING: Array<{ match: (m: string) => boolean; rate: Rate }> = [
  { match: (m) => m.includes('opus'), rate: { input: 15e-6, output: 75e-6, cacheRead: 1.5e-6, cacheWrite: 18.75e-6 } },
  { match: (m) => m.includes('sonnet'), rate: { input: 3e-6, output: 15e-6, cacheRead: 0.3e-6, cacheWrite: 3.75e-6 } },
  { match: (m) => m.includes('haiku'), rate: { input: 0.8e-6, output: 4e-6, cacheRead: 0.08e-6, cacheWrite: 1e-6 } },
]
const DEFAULT_RATE: Rate = { input: 3e-6, output: 15e-6, cacheRead: 0.3e-6, cacheWrite: 3.75e-6 }
function rateFor(model: string): Rate { return (PRICING.find((p) => p.match(model || '')) || { rate: DEFAULT_RATE }).rate }

export function costOf(model: string, u: AnthropicUsage): number {
  const r = rateFor(model || '')
  const cost = (u.input_tokens || 0) * r.input + (u.output_tokens || 0) * r.output +
    (u.cache_read_input_tokens || 0) * r.cacheRead + (u.cache_creation_input_tokens || 0) * r.cacheWrite
  return Math.round(cost * 1e6) / 1e6
}

/* Log one AI call. Awaited by callers so the write persists before the
   serverless function freezes (fire-and-forget can be dropped on Vercel). */
export async function logAiEvent(input: {
  endpoint: string; model?: string; usage?: AnthropicUsage; latencyMs?: number
  conversationId?: string | null; visitorId?: string | null; email?: string | null
  status?: string; error?: string; meta?: Row
}) {
  const u = input.usage || {}
  try {
    await getSupabaseAdmin().from('ai_events').insert({
      endpoint: input.endpoint, model: input.model || null,
      conversation_id: input.conversationId || null, visitor_id: input.visitorId || null, contact_email: input.email || null,
      input_tokens: u.input_tokens || 0, output_tokens: u.output_tokens || 0,
      cache_read_tokens: u.cache_read_input_tokens || 0, cache_write_tokens: u.cache_creation_input_tokens || 0,
      cost_usd: input.model ? costOf(input.model, u) : 0, latency_ms: input.latencyMs ?? null,
      status: input.status || 'ok', error: input.error || null, meta: input.meta || {},
    })
  } catch (e) { console.error('logAiEvent failed', e) }
}

// ── Reads for the dashboards ──
function dayStart(offset = 0): string { const n = new Date(); return new Date(n.getFullYear(), n.getMonth(), n.getDate() - offset).toISOString() }
function monthStart(): string { const n = new Date(); return new Date(n.getFullYear(), n.getMonth(), 1).toISOString() }

export async function aiCostSummary() {
  const { data } = await getSupabaseAdmin().from('ai_events')
    .select('endpoint,model,cost_usd,input_tokens,output_tokens,cache_read_tokens,cache_write_tokens,conversation_id,created_at')
    .gte('created_at', monthStart()).limit(100000)
  const rows = (data || []) as Row[]
  const today = dayStart(0), yStart = dayStart(1)
  const sum = (f: (r: Row) => number, since?: string) => rows.filter((r) => !since || (r.created_at as string) >= since).reduce((s, r) => s + f(r), 0)
  const cost = (r: Row) => Number(r.cost_usd || 0)

  const byModel = new Map<string, number>(); const byEndpoint = new Map<string, number>()
  let inTok = 0, outTok = 0, cacheRead = 0, cacheWrite = 0
  const convos = new Set<string>()
  for (const r of rows) {
    byModel.set((r.model as string) || 'unknown', (byModel.get((r.model as string) || 'unknown') || 0) + cost(r))
    byEndpoint.set(r.endpoint as string, (byEndpoint.get(r.endpoint as string) || 0) + cost(r))
    inTok += Number(r.input_tokens || 0); outTok += Number(r.output_tokens || 0)
    cacheRead += Number(r.cache_read_tokens || 0); cacheWrite += Number(r.cache_write_tokens || 0)
    if (r.conversation_id) convos.add(r.conversation_id as string)
  }
  const monthCost = sum(cost)
  return {
    today: Math.round(sum(cost, today) * 1e4) / 1e4,
    yesterday: Math.round(sum((r) => (r.created_at as string) < today ? cost(r) : 0, yStart) * 1e4) / 1e4,
    month: Math.round(monthCost * 1e4) / 1e4,
    calls: rows.length, conversations: convos.size,
    perConversation: convos.size ? Math.round((monthCost / convos.size) * 1e4) / 1e4 : 0,
    inputTokens: inTok, outputTokens: outTok, cacheReadTokens: cacheRead, cacheWriteTokens: cacheWrite,
    cacheHitRate: (cacheRead + inTok) ? Math.round((cacheRead / (cacheRead + inTok)) * 100) : 0,
    byModel: [...byModel].map(([model, c]) => ({ model, cost: Math.round(c * 1e4) / 1e4 })).sort((a, b) => b.cost - a.cost),
    byEndpoint: [...byEndpoint].map(([endpoint, c]) => ({ endpoint, cost: Math.round(c * 1e4) / 1e4 })).sort((a, b) => b.cost - a.cost),
  }
}

export async function aiPerformance() {
  const { data } = await getSupabaseAdmin().from('ai_events')
    .select('latency_ms,status,endpoint,created_at').gte('created_at', dayStart(7)).limit(100000)
  const rows = (data || []) as Row[]
  const lat = rows.map((r) => Number(r.latency_ms || 0)).filter((x) => x > 0).sort((a, b) => a - b)
  const errors = rows.filter((r) => r.status === 'error').length
  const blocked = rows.filter((r) => r.status === 'blocked' || r.status === 'throttled').length
  return {
    calls: rows.length,
    avgLatency: lat.length ? Math.round(lat.reduce((a, b) => a + b, 0) / lat.length) : 0,
    p95Latency: lat.length ? lat[Math.floor(lat.length * 0.95)] : 0,
    errorRate: rows.length ? Math.round((errors / rows.length) * 100) : 0,
    throttledCount: blocked,
    successRate: rows.length ? Math.round(((rows.length - errors) / rows.length) * 100) : 100,
  }
}
