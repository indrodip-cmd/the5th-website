/* Anthropic org usage + cost (3I.5) — pulls the same numbers you see in the
   Claude console (whole organization, all apps on the key). Requires an Admin
   API key: ANTHROPIC_ADMIN_KEY (sk-ant-admin…). Read-only; server-side only. */

const BASE = 'https://api.anthropic.com/v1/organizations'

export function anthropicUsageConfigured(): boolean {
  return !!process.env.ANTHROPIC_ADMIN_KEY
}

function headers() {
  return { 'x-api-key': process.env.ANTHROPIC_ADMIN_KEY || '', 'anthropic-version': '2023-06-01' }
}

function num(v: unknown): number { const n = Number(v); return Number.isFinite(n) ? n : 0 }
function monthStartUTC(): string { const n = new Date(); return new Date(Date.UTC(n.getUTCFullYear(), n.getUTCMonth(), 1)).toISOString() }
function todayUTC(): string { const n = new Date(); return new Date(Date.UTC(n.getUTCFullYear(), n.getUTCMonth(), n.getUTCDate())).toISOString().slice(0, 10) }

async function get(path: string): Promise<Record<string, unknown> | null> {
  try {
    const r = await fetch(`${BASE}${path}`, { headers: headers(), cache: 'no-store' })
    if (!r.ok) { console.error('anthropic usage api', path, r.status); return null }
    return await r.json()
  } catch (e) { console.error('anthropic usage api error', e); return null }
}

export interface OrgUsage {
  configured: boolean
  today: number
  month: number
  currency: string
  inputTokens: number
  outputTokens: number
  cacheReadTokens: number
  cacheWriteTokens: number
  byModel: Array<{ model: string; inputTokens: number; outputTokens: number }>
  error?: string
}

/* Month-to-date org cost + token usage, matching the console. */
export async function getAnthropicOrgUsage(): Promise<OrgUsage> {
  const empty: OrgUsage = { configured: false, today: 0, month: 0, currency: 'USD', inputTokens: 0, outputTokens: 0, cacheReadTokens: 0, cacheWriteTokens: 0, byModel: [] }
  if (!anthropicUsageConfigured()) return empty
  const start = monthStartUTC()

  // Cost report (USD by daily bucket)
  const cost = await get(`/cost_report?starting_at=${encodeURIComponent(start)}`)
  let month = 0, today = 0, currency = 'USD'
  const todayStr = todayUTC()
  for (const bucket of ((cost?.data as Array<Record<string, unknown>>) || [])) {
    const results = (bucket.results as Array<Record<string, unknown>>) || []
    const bucketTotal = results.reduce((s, r) => s + num(r.amount ?? r.cost ?? r.value), 0)
    if (results[0]?.currency) currency = String(results[0].currency).toUpperCase()
    month += bucketTotal
    if (String(bucket.starting_at || '').slice(0, 10) === todayStr) today += bucketTotal
  }

  // Usage report (tokens by model)
  const usage = await get(`/usage_report/messages?starting_at=${encodeURIComponent(start)}&group_by[]=model`)
  const byModel = new Map<string, { inputTokens: number; outputTokens: number }>()
  let inTok = 0, outTok = 0, cacheRead = 0, cacheWrite = 0
  for (const bucket of ((usage?.data as Array<Record<string, unknown>>) || [])) {
    for (const r of ((bucket.results as Array<Record<string, unknown>>) || [])) {
      const model = String(r.model || 'unknown')
      const inp = num(r.uncached_input_tokens ?? r.input_tokens) + num(r.cache_read_input_tokens) + num(r.cache_creation_input_tokens)
      const out = num(r.output_tokens)
      const cur = byModel.get(model) || { inputTokens: 0, outputTokens: 0 }
      cur.inputTokens += inp; cur.outputTokens += out; byModel.set(model, cur)
      inTok += num(r.uncached_input_tokens ?? r.input_tokens); outTok += out
      cacheRead += num(r.cache_read_input_tokens); cacheWrite += num(r.cache_creation_input_tokens)
    }
  }

  return {
    configured: true, today: Math.round(today * 100) / 100, month: Math.round(month * 100) / 100, currency,
    inputTokens: inTok, outputTokens: outTok, cacheReadTokens: cacheRead, cacheWriteTokens: cacheWrite,
    byModel: [...byModel].map(([model, t]) => ({ model, ...t })).sort((a, b) => b.inputTokens - a.inputTokens),
  }
}
