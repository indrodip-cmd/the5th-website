/* Smart Search (3I.3) — natural language → a *constrained JSON filter* (never
   raw SQL), executed via safe query builders over crm_contacts + joins.
   The model can only emit whitelisted keys; anything else is dropped. */
import Anthropic from '@anthropic-ai/sdk'
import { getSupabaseAdmin } from '@/lib/supabase'
import { logAiEvent } from '@/lib/ai-usage'

type Row = Record<string, unknown>

export interface SmartFilter {
  source?: string; country?: string; pipeline_stage?: string; lifecycle?: string
  tag?: string; min_score?: number; booked_call?: boolean; not_booked?: boolean
  purchased?: boolean; content_viewed?: string; min_pageviews?: number
}

const ALLOWED = new Set<keyof SmartFilter>([
  'source', 'country', 'pipeline_stage', 'lifecycle', 'tag', 'min_score',
  'booked_call', 'not_booked', 'purchased', 'content_viewed', 'min_pageviews',
])

/* Ask the model to translate the query into the constrained filter. */
export async function parseQuery(nl: string): Promise<SmartFilter> {
  if (!process.env.ANTHROPIC_API_KEY) return {}
  const ai = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  const t0 = Date.now()
  const msg = await ai.messages.create({
    model: 'claude-haiku-4-5-20251001', max_tokens: 300,
    system:
      'Translate the user query about CRM contacts into a JSON filter. Only use these keys: ' +
      'source (marketing source e.g. facebook, google, quiz, chat), country (ISO-2 or name), pipeline_stage, lifecycle, tag, ' +
      'min_score (int), booked_call (bool), not_booked (bool), purchased (bool), content_viewed (a slug/keyword), min_pageviews (int). ' +
      'Omit keys you cannot infer. Return ONLY minified JSON.',
    messages: [{ role: 'user', content: nl }],
  })
  logAiEvent({ endpoint: 'smart_search', model: 'claude-haiku-4-5-20251001', usage: msg.usage, latencyMs: Date.now() - t0 })
  const text = msg.content.find((b) => b.type === 'text')
  const raw = text && text.type === 'text' ? text.text : '{}'
  let parsed: Row = {}
  try { parsed = JSON.parse(raw.slice(raw.indexOf('{'), raw.lastIndexOf('}') + 1)) } catch { parsed = {} }
  // Whitelist: drop anything not allowed.
  const filter: SmartFilter = {}
  for (const [k, v] of Object.entries(parsed)) {
    if (!ALLOWED.has(k as keyof SmartFilter)) continue
    if (typeof v === 'string') (filter as Row)[k] = v.slice(0, 80)
    else if (typeof v === 'number') (filter as Row)[k] = Math.round(v)
    else if (typeof v === 'boolean') (filter as Row)[k] = v
  }
  return filter
}

/* Execute the constrained filter safely. */
export async function runSmartSearch(filter: SmartFilter): Promise<Row[]> {
  const db = getSupabaseAdmin()

  // Pre-resolve contact-id sets for the join-based filters.
  let restrictIds: Set<string> | null = null
  const intersect = (ids: string[]) => {
    const s = new Set(ids)
    restrictIds = restrictIds ? new Set([...restrictIds].filter((x) => s.has(x))) : s
  }

  if (filter.purchased) {
    const { data } = await db.from('crm_purchases').select('contact_id').eq('status', 'paid').is('deleted_at', null).limit(5000)
    intersect((data || []).map((r) => r.contact_id as string))
  }
  if (filter.content_viewed || filter.min_pageviews) {
    // visitor_ids matching the content, then map to contacts via identity/visitors.
    let vq = db.from('analytics_events').select('visitor_id').eq('event_type', 'pageview').limit(5000)
    if (filter.content_viewed) vq = vq.ilike('path', `%${filter.content_viewed}%`)
    const { data: ev } = await vq
    const counts = new Map<string, number>()
    for (const e of ev || []) counts.set(e.visitor_id as string, (counts.get(e.visitor_id as string) || 0) + 1)
    const minV = filter.min_pageviews || 1
    const visitorIds = [...counts].filter(([, n]) => n >= minV).map(([v]) => v)
    if (visitorIds.length) {
      const { data: vis } = await db.from('crm_visitors').select('contact_id').in('visitor_id', visitorIds).not('contact_id', 'is', null)
      intersect((vis || []).map((r) => r.contact_id as string))
    } else intersect([])
  }

  let q = db.from('crm_contacts').select('id,name,email,company,country,pipeline_stage,lifecycle_stage,lead_score,tags,call_booked,source').is('deleted_at', null).limit(100)
  if (filter.source) q = q.ilike('source', `%${filter.source}%`)
  if (filter.country) q = filter.country.length === 2 ? q.eq('country', filter.country.toUpperCase()) : q.ilike('country', `%${filter.country}%`)
  if (filter.pipeline_stage) q = q.eq('pipeline_stage', filter.pipeline_stage)
  if (filter.lifecycle) q = q.eq('lifecycle_stage', filter.lifecycle)
  if (filter.tag) q = q.contains('tags', [filter.tag])
  if (typeof filter.min_score === 'number') q = q.gte('lead_score', filter.min_score)
  if (filter.booked_call) q = q.eq('call_booked', true)
  if (filter.not_booked) q = q.eq('call_booked', false)
  if (restrictIds) {
    const arr = [...restrictIds]
    if (arr.length === 0) return []
    q = q.in('id', arr.slice(0, 300))
  }
  const { data } = await q
  return data || []
}
