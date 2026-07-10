/* AI Brain — the orchestration layer between the LLM and the user.
   Centralizes: intent detection, conversation state, session memory, lead
   scoring, CTA timing / response planning, knowledge retrieval assembly, and
   observability. The chat route calls this to build the final prompt context;
   no orchestration logic lives in the frontend. */
import { getSupabaseAdmin } from '@/lib/supabase'
import { retrieve, type Source } from '@/lib/retrieval'
import { loadScenario, scenarioBlock } from '@/lib/playbook'

export interface Session {
  conversation_id: string
  email: string | null
  turns: number
  score: number
  state: string
  last_intent: string | null
  recommended: string[]
}

export interface Brain {
  context: string          // extra system text (memory + state + planning + grounding)
  sources: Source[]
  intent: string
  state: string
  score: number
}

// ── Intent detection (fast heuristic; multi-signal) ──
const INTENT_RULES: Array<[string, RegExp]> = [
  ['human', /\b(human|real person|speak to (someone|a person)|agent|your team|talk to a)\b/i],
  ['booking', /\b(book|schedule|set up a|appointment|consult|strategy call|find a time)\b/i],
  ['purchase', /\b(buy|purchase|sign ?up|enrol|enroll|join|get started|i'?m ready|how do i start)\b/i],
  ['pricing', /\b(price|pricing|cost|how much|invest(ment)?|afford|payment|fee)\b/i],
  ['guarantee', /\b(guarantee|refund|money.?back|risk)\b/i],
  ['comparison', /\b(compare|comparison|vs\.?|versus|difference between|which (one|program|is better))\b/i],
  ['case_study', /\b(result|case study|success story|testimonial|revenue|proof|worked for)\b/i],
  ['support', /\b(help me with|problem|issue|not working|can'?t (log|access)|account|billing|broken)\b/i],
  ['program', /\b(fast forward|the collective|coaching program)\b/i],
  ['product', /\b(the ?5th ai|the fifth ai|software|the tool)\b/i],
  ['greeting', /^\s*(hi|hey|hello|good (morning|afternoon|evening)|howdy|yo)\b/i],
]
export function detectIntent(text: string): string {
  const t = (text || '').toLowerCase()
  for (const [intent, re] of INTENT_RULES) if (re.test(t)) return intent
  return 'general'
}

// ── Lead scoring (accumulates buying signals) ──
const INTENT_POINTS: Record<string, number> = {
  purchase: 6, booking: 5, comparison: 4, pricing: 3, guarantee: 3,
  case_study: 2, program: 1, product: 1, support: 0, human: 0, greeting: 0, general: 1,
}
function nextScore(prev: number, intent: string): number {
  return Math.min(prev + (INTENT_POINTS[intent] ?? 1), 40)
}

// ── Conversation state machine ──
function deriveState(intent: string, turns: number): string {
  if (intent === 'greeting' && turns <= 1) return 'greeting'
  if (intent === 'human' || intent === 'support') return 'support'
  if (intent === 'purchase' || intent === 'booking') return 'decision'
  if (intent === 'comparison' || intent === 'pricing' || intent === 'guarantee') return 'objection'
  if (intent === 'case_study' || intent === 'program' || intent === 'product') return 'education'
  return turns <= 2 ? 'discovery' : 'general'
}

async function loadSession(id: string): Promise<Session> {
  try {
    const { data } = await getSupabaseAdmin().from('carolina_sessions').select('*').eq('conversation_id', id).single()
    if (data) return data as Session
  } catch {}
  return { conversation_id: id, email: null, turns: 0, score: 0, state: 'greeting', last_intent: null, recommended: [] }
}

async function knownProfile(email: string | null): Promise<string | null> {
  if (!email) return null
  try {
    const { data } = await getSupabaseAdmin().from('crm_contacts').select('name,business_stage,interest,notes').eq('email', email).maybeSingle()
    if (!data) return null
    const bits: string[] = []
    if (data.name) bits.push(`name: ${data.name}`)
    if (data.business_stage) bits.push(`business: ${data.business_stage}`)
    if (data.interest) bits.push(`interested in: ${data.interest}`)
    if (data.notes) bits.push(`notes: ${data.notes}`)
    return bits.length ? bits.join('; ') : null
  } catch {
    return null
  }
}

/* Build the brain context for this turn. Called before LLM generation. */
export async function orchestrate(opts: {
  conversationId: string
  lastUserText: string
  viewContext?: string | null
  handoff?: boolean
  ctaThreshold?: number
  retrievalLimit?: number
}): Promise<Brain> {
  const ctaThreshold = opts.ctaThreshold ?? 8
  const session = await loadSession(opts.conversationId)
  const intent = detectIntent(opts.lastUserText)
  const turns = session.turns + 1
  const score = nextScore(session.score, intent)
  const state = deriveState(intent, turns)

  // Knowledge retrieval (skip on the internal handoff turn).
  let sources: Source[] = []
  let grounding = ''
  if (!opts.handoff && opts.lastUserText) {
    const r = await retrieve(opts.lastUserText, { hint: opts.viewContext || undefined, limit: opts.retrievalLimit })
    sources = r.sources
    if (r.context) grounding = r.context
  }

  // Response planning — computed hints steer the LLM (no extra model call).
  const parts: string[] = []
  parts.push(`CONVERSATION STATE: ${state}. Detected intent: ${intent}. This is turn ${turns}.`)

  // Playbook scenario for this intent (admin-editable behaviour).
  const scenario = await loadScenario(intent)
  if (scenario) parts.push(scenarioBlock(scenario))

  const profile = await knownProfile(session.email)
  if (profile) parts.push(`YOU ALREADY KNOW THIS VISITOR (${profile}). Do not re-ask what you already know; build on it.`)

  if (session.recommended.length) parts.push(`ALREADY RECOMMENDED: ${session.recommended.join(', ')}. Don't repeat these — go deeper or suggest a genuinely different next step.`)

  if (score >= ctaThreshold || intent === 'purchase' || intent === 'booking' || intent === 'comparison') {
    parts.push('BUYING SIGNALS: HIGH — a strategy call or clear next step is appropriate now. Offer it naturally (show_card booking) if it genuinely helps.')
  } else if (score >= 4) {
    parts.push('BUYING SIGNALS: MEDIUM — keep educating and building trust; only suggest a call if they ask about fit, pricing, or implementation.')
  } else {
    parts.push('BUYING SIGNALS: LOW — the visitor is still exploring. Educate and be helpful; do NOT push a call yet.')
  }

  if (intent === 'human' || intent === 'support') parts.push('The visitor may want a person — offer to connect the team (book a call, or hand off to a colleague) rather than forcing an AI answer.')

  if (grounding) {
    parts.push(`GROUNDED KNOWLEDGE — The5th's own published content. Answer using it when relevant and refer to it by name. If the answer is not covered here and is not basic sales/booking info, say you're not certain and offer a call — never invent facts, pricing, or policies.\n\n${grounding}`)
  }

  return { context: parts.join('\n\n'), sources, intent, state, score }
}

/* Persist session + log one observability event. Called after the turn. */
export async function persistTurn(opts: {
  conversationId: string
  agent: string
  intent: string
  state: string
  score: number
  sources: number
  booked: boolean
  latencyMs: number
  email?: string | null
  recommended?: string[]
}) {
  try {
    const db = getSupabaseAdmin()
    const prev = await loadSession(opts.conversationId)
    const recommended = Array.from(new Set([...(prev.recommended || []), ...(opts.recommended || [])])).slice(0, 20)
    await db.from('carolina_sessions').upsert({
      conversation_id: opts.conversationId,
      email: opts.email || prev.email || null,
      turns: prev.turns + 1,
      score: opts.score,
      state: opts.state,
      last_intent: opts.intent,
      recommended,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'conversation_id' })
    await db.from('carolina_events').insert({
      conversation_id: opts.conversationId, agent: opts.agent, intent: opts.intent,
      state: opts.state, score: opts.score, sources: opts.sources, booked: opts.booked, latency_ms: opts.latencyMs,
    })
  } catch (e) {
    console.error('persistTurn failed', e)
  }
}
