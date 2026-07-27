import Anthropic from '@anthropic-ai/sdk'
import { getSupabaseAdmin } from '@/lib/supabase'
import { recordMemory } from '@/lib/memory/store'
import { fathomConfigured, listRecent } from '@/lib/fathom'
import { notify } from '@/lib/notifications'
import { emitEvent } from '@/lib/events'

// AI Coaching Intelligence engine (admin-only). Evaluates meetings with a
// meeting-type-specific lens, builds a living customer profile + health score,
// and powers the AI Success Coach. Evidence-based: every judgement is asked to
// quote the transcript.

const MODEL = 'claude-sonnet-4-6'
function ai() { return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! }) }

export const MEETING_TYPES = [
  'discovery_call', 'sales_call', 'strategy_call', 'coaching_session', 'onboarding_call',
  'customer_success_review', 'support_call', 'accountability_call', 'renewal_call',
  'team_meeting', 'internal_meeting', 'other',
] as const
export type MeetingType = (typeof MEETING_TYPES)[number]

export const MEETING_TYPE_LABEL: Record<string, string> = {
  discovery_call: 'Discovery Call', sales_call: 'Sales Call', strategy_call: 'Strategy Call',
  coaching_session: 'Coaching Session', onboarding_call: 'Onboarding Call',
  customer_success_review: 'Customer Success Review', support_call: 'Support Call',
  accountability_call: 'Accountability Call', renewal_call: 'Renewal Call',
  team_meeting: 'Team Meeting', internal_meeting: 'Internal Meeting', other: 'Other',
}

export function contactKeyFrom(email?: string | null, name?: string | null): string {
  const e = (email || '').trim().toLowerCase()
  if (e) return e
  return (name || 'unknown').trim().toLowerCase().replace(/\s+/g, ' ')
}

// The house methodology every evaluation is measured against.
const DPC = `THE5TH DPC FRAMEWORK (the house methodology, weigh every call against it):
- DIAGNOSE: did they deeply understand the customer's real situation, pain, goals and stakes before prescribing anything? Great diagnosis is specific, uses the customer's own words, and surfaces the cost of inaction.
- PRESCRIBE: did they connect the customer's specific problem to a specific solution/next step, framed as the bridge to the outcome the customer wants (never a generic pitch)?
- CLOSE: did they ask clearly for the next commitment, handle hesitation with empathy, and lock a concrete next step, without pressure or false urgency (this is non-negotiable in our ethics)?`

function scoreShape(dims: string[]): string {
  return `"scores": { ${dims.map((d) => `"${d}": <0-10 integer>`).join(', ')} }`
}

const SALES_DIMS = ['rapport', 'discovery', 'active_listening', 'question_quality', 'emotional_intelligence', 'objection_handling', 'value_communication', 'storytelling', 'pricing', 'confidence', 'trust_building', 'closing', 'follow_up']
const COACH_DIMS = ['listening', 'powerful_questions', 'accountability', 'empathy', 'confidence_building', 'goal_clarity', 'progress_tracking', 'action_planning', 'session_structure', 'client_engagement', 'motivation']

function analysisPrompt(type: string): { system: string; shape: string } {
  const evidenceRule = `Every strength and improvement MUST include a short verbatim quote from the transcript as evidence. Never invent quotes. If the transcript is too thin to judge a dimension, score it null and say so. Be direct and specific, like a world-class sales director / head coach reviewing the call, not a cheerleader.`

  if (type === 'sales_call' || type === 'discovery_call' || type === 'strategy_call' || type === 'renewal_call') {
    return {
      system: `You are an elite Sales Director reviewing a ${MEETING_TYPE_LABEL[type] || 'sales'} transcript to answer: "How can this person get better at selling and helping this customer succeed?"\n\n${DPC}\n\n${evidenceRule}`,
      shape: `{
  "executive_summary": "3-4 sentences: what happened and the headline verdict.",
  "outcome": "won | lost | open",
  "dpc": { "diagnose": "<1-2 sentence assessment>", "prescribe": "<...>", "close": "<...>" },
  ${scoreShape(SALES_DIMS)},
  "overall_score": <0-100 integer>,
  "strengths": [ { "point": "<what they did well>", "evidence": "<verbatim quote>" } ],
  "improvements": [ { "priority": "P1|P2|P3", "point": "<specific fix>", "evidence": "<quote or moment>", "how": "<exactly what to do differently>" } ],
  "buying_signals": ["<signals the customer gave>"],
  "missed_buying_signals": ["<signals that were not acted on>"],
  "risk_signals": ["<churn / no-deal risks>"],
  "questions_should_have_asked": ["<high-value questions that were missing>"],
  "why_outcome": "<if won: what to repeat. if lost/open: where momentum was lost and how to redirect next time>",
  "practice_plan": ["<concrete drills/exercises for this rep>"],
  "suggested_followup_email": "<short, ready-to-send follow-up email>"
}`,
    }
  }
  if (type === 'coaching_session' || type === 'accountability_call' || type === 'onboarding_call' || type === 'customer_success_review') {
    return {
      system: `You are a master Coach Supervisor reviewing a ${MEETING_TYPE_LABEL[type] || 'coaching'} transcript to answer: "How can this coach run a better session and help this client succeed?"\n\n${evidenceRule}`,
      shape: `{
  "executive_summary": "3-4 sentences on the session and headline verdict.",
  "outcome": "n/a",
  ${scoreShape(COACH_DIMS)},
  "overall_score": <0-100 integer>,
  "strengths": [ { "point": "<...>", "evidence": "<verbatim quote>" } ],
  "improvements": [ { "priority": "P1|P2|P3", "point": "<...>", "evidence": "<quote>", "how": "<what to do differently>" } ],
  "obstacles_identified": ["<client obstacles surfaced>"],
  "missed_opportunities": ["<coaching moments missed>"],
  "suggested_questions": ["<powerful questions to use next time, tailored to this client>"],
  "revisit_next_session": ["<topics to revisit>"],
  "practice_plan": ["<how the coach improves>"],
  "suggested_homework": ["<homework to assign the client>"],
  "suggested_followup_email": "<short follow-up email to the client>"
}`,
    }
  }
  // Generic (support / team / internal / other)
  return {
    system: `You are a sharp business consultant reviewing a ${MEETING_TYPE_LABEL[type] || 'meeting'} transcript. Be evidence-based and specific.\n\n${evidenceRule}`,
    shape: `{
  "executive_summary": "3-4 sentences.",
  "outcome": "n/a",
  "scores": { "clarity": <0-10>, "effectiveness": <0-10>, "engagement": <0-10> },
  "overall_score": <0-100 integer>,
  "key_decisions": ["..."],
  "action_items": ["..."],
  "risks": ["..."],
  "wins": ["..."],
  "improvements": [ { "priority": "P1|P2|P3", "point": "<...>", "how": "<...>" } ],
  "suggested_followup_email": "<short follow-up email>"
}`,
  }
}

function parseJson<T>(text: string): T | null {
  const clean = text.replace(/```json|```/g, '').trim()
  try { return JSON.parse(clean) as T } catch {}
  const m = clean.match(/\{[\s\S]*\}/)
  if (m) { try { return JSON.parse(m[0]) as T } catch {} }
  return null
}

export async function analyzeMeeting(meetingId: string): Promise<{ ok: boolean; error?: string }> {
  const sb = getSupabaseAdmin()
  const { data: m } = await sb.from('ci_meetings').select('*').eq('id', meetingId).maybeSingle()
  if (!m) return { ok: false, error: 'Meeting not found' }
  const transcript = String(m.transcript || '').trim()
  if (transcript.length < 40) return { ok: false, error: 'Transcript is too short to analyze' }

  const { system, shape } = analysisPrompt(m.meeting_type)
  // AI Learning Engine: prioritize the organization's own methodology.
  const methodology = await frameworksFor(m.meeting_type)
  const fullSystem = methodology
    ? `${system}\n\n══ YOUR ORGANIZATION'S METHODOLOGY (AUTHORITATIVE — prioritize this over generic best practice, and name which framework informed each judgement) ══\n${methodology}`
    : system
  const res = await ai().messages.create({
    model: MODEL,
    max_tokens: 3500,
    system: fullSystem,
    messages: [{
      role: 'user',
      content: `MEETING: ${m.title || MEETING_TYPE_LABEL[m.meeting_type]} · Customer: ${m.contact_name || m.contact_email || 'unknown'}\n\nTRANSCRIPT:\n${transcript.slice(0, 45000)}\n\nReturn ONLY valid JSON in exactly this shape (no markdown, no prose):\n${shape}`,
    }],
  })
  const text = res.content[0]?.type === 'text' ? res.content[0].text : ''
  const parsed = parseJson<Record<string, unknown>>(text)
  if (!parsed) return { ok: false, error: 'Could not parse analysis' }

  // Custom rubric scorecard (weighted, gate-aware) if one applies to this type.
  const rubric = await rubricFor(m.meeting_type)
  if (rubric) { const rr = await scoreAgainstRubric(transcript, rubric); if (rr) parsed.rubric = rr }

  await sb.from('ci_meetings').update({
    analysis: parsed,
    scores: parsed.scores || null,
    outcome: (parsed.outcome as string) || 'n/a',
    ai_summary: (parsed.executive_summary as string) || m.ai_summary,
    status: 'analyzed',
    updated_at: new Date().toISOString(),
  }).eq('id', meetingId)

  // Write the analysis through to Business Memory so Command AI can reason over
  // it org-wide (idempotent via source + source_id).
  const who = m.contact_name || m.contact_email || 'customer'
  recordMemory({
    memory_type: 'coaching',
    title: `${MEETING_TYPE_LABEL[m.meeting_type] || 'Meeting'} — ${who}`,
    summary: (parsed.executive_summary as string) || m.ai_summary || '',
    content: JSON.stringify({ outcome: parsed.outcome, scores: parsed.scores, strengths: parsed.strengths, improvements: parsed.improvements }).slice(0, 8000),
    source: 'coaching_intelligence',
    source_id: meetingId,
    entities: (m.contact_name || m.contact_email) ? [{ name: who, type: 'customer' }] : [],
    topics: ['coaching_intelligence', m.meeting_type],
    occurred_at: m.meeting_date || undefined,
    importance: parsed.outcome === 'lost' ? 4 : 3,
  }).catch(() => {})

  // Keep the customer profile evolving as new analyzed calls land.
  if (m.contact_key) buildCustomerProfile(m.contact_key).catch(() => {})
  return { ok: true }
}

// ── AI LEARNING ENGINE / FRAMEWORK LIBRARY ─────────────────
export interface FrameworkInput { id?: string; name: string; kind?: string; body: string; meeting_types?: string[]; active?: boolean; created_by?: string }

export async function listFrameworks(activeOnly = false) {
  const sb = getSupabaseAdmin()
  let q = sb.from('ci_frameworks').select('*').order('updated_at', { ascending: false })
  if (activeOnly) q = q.eq('active', true)
  const { data } = await q
  return data || []
}

export async function upsertFramework(f: FrameworkInput) {
  const sb = getSupabaseAdmin()
  const row: Record<string, unknown> = {
    name: f.name, kind: f.kind || 'framework', body: f.body,
    meeting_types: f.meeting_types || [], active: f.active !== false, updated_at: new Date().toISOString(),
  }
  let id = f.id
  if (id) {
    const { data: cur } = await sb.from('ci_frameworks').select('version').eq('id', id).maybeSingle()
    row.version = (Number(cur?.version) || 1) + 1
    await sb.from('ci_frameworks').update(row).eq('id', id)
  } else {
    row.created_by = f.created_by || null
    const { data } = await sb.from('ci_frameworks').insert(row).select('id').single()
    id = data?.id as string
  }
  // Index the methodology into Business Memory so Command AI knows it too.
  recordMemory({
    memory_type: 'playbook', title: `Methodology: ${f.name}`, summary: `${f.kind || 'framework'} used by AI Coaching Intelligence`,
    content: f.body.slice(0, 8000), source: 'coaching_intelligence_framework', source_id: id,
    topics: ['methodology', 'coaching_intelligence', ...(f.meeting_types || [])], importance: 4,
  }).catch(() => {})
  return { ok: true, id }
}

export async function deleteFramework(id: string) {
  await getSupabaseAdmin().from('ci_frameworks').update({ active: false, updated_at: new Date().toISOString() }).eq('id', id)
  return { ok: true }
}

// Concatenate the active frameworks that apply to a meeting type.
async function frameworksFor(type: string): Promise<string> {
  const sb = getSupabaseAdmin()
  const { data } = await sb.from('ci_frameworks').select('name, kind, body, meeting_types').eq('active', true)
  const rows = (data || []).filter((f) => {
    const mt = (f.meeting_types || []) as string[]
    return mt.length === 0 || mt.includes('*') || mt.includes(type)
  })
  return rows.map((f) => `### ${f.name} (${f.kind})\n${f.body}`).join('\n\n').slice(0, 12000)
}

// ── CUSTOM RUBRIC SCORECARDS ───────────────────────────────
export interface RubricCategory { name: string; weight: number; pass_fail?: boolean }
export interface RubricInput { id?: string; name: string; meeting_types?: string[]; categories: RubricCategory[]; active?: boolean; created_by?: string }

export async function listRubrics(activeOnly = false) {
  const sb = getSupabaseAdmin()
  let q = sb.from('ci_rubrics').select('*').order('updated_at', { ascending: false })
  if (activeOnly) q = q.eq('active', true)
  const { data } = await q
  return data || []
}
export async function upsertRubric(r: RubricInput) {
  const sb = getSupabaseAdmin()
  const row: Record<string, unknown> = { name: r.name, meeting_types: r.meeting_types || [], categories: r.categories || [], active: r.active !== false, updated_at: new Date().toISOString() }
  if (r.id) { await sb.from('ci_rubrics').update(row).eq('id', r.id); return { ok: true, id: r.id } }
  row.created_by = r.created_by || null
  const { data } = await sb.from('ci_rubrics').insert(row).select('id').single()
  return { ok: true, id: data?.id as string }
}
export async function deleteRubric(id: string) {
  await getSupabaseAdmin().from('ci_rubrics').update({ active: false, updated_at: new Date().toISOString() }).eq('id', id)
  return { ok: true }
}
async function rubricFor(type: string): Promise<{ id: string; name: string; categories: RubricCategory[] } | null> {
  const sb = getSupabaseAdmin()
  const { data } = await sb.from('ci_rubrics').select('id, name, categories, meeting_types').eq('active', true)
  const match = (data || []).find((r) => { const mt = (r.meeting_types || []) as string[]; return mt.length === 0 || mt.includes('*') || mt.includes(type) })
  return match ? { id: match.id as string, name: match.name as string, categories: (match.categories || []) as RubricCategory[] } : null
}
// Score a transcript against a rubric. AI grades each category; the weighted
// total is computed in code (never trust the model's arithmetic).
async function scoreAgainstRubric(transcript: string, rubric: { name: string; categories: RubricCategory[] }): Promise<Record<string, unknown> | null> {
  const cats = rubric.categories.map((c) => c.name).join(', ')
  const res = await ai().messages.create({
    model: MODEL, max_tokens: 800,
    system: `Grade this transcript against the "${rubric.name}" scorecard. Score EACH category 0-10 (integer) and, where relevant, pass/fail. Ground each in the transcript. Output valid JSON only.`,
    messages: [{ role: 'user', content: `CATEGORIES: ${cats}\n\nTRANSCRIPT:\n${transcript.slice(0, 40000)}\n\nReturn ONLY: {"categories":[{"name":"<exact category>","score":<0-10>,"pass":<true|false|null>,"note":"<one line>"}]}` }],
  })
  const text = res.content[0]?.type === 'text' ? res.content[0].text : ''
  const p = parseJson<{ categories: Array<{ name: string; score: number; pass?: boolean | null; note?: string }> }>(text)
  if (!p?.categories) return null
  const byName = new Map(p.categories.map((c) => [c.name.toLowerCase(), c]))
  let wsum = 0, wtot = 0; let failedGate = false
  const categories = rubric.categories.map((c) => {
    const g = byName.get(c.name.toLowerCase())
    const score = Math.max(0, Math.min(10, Number(g?.score) || 0))
    const w = Number(c.weight) || 1
    wsum += score * w; wtot += w
    const pass = c.pass_fail ? (g?.pass !== false && score >= 6) : null
    if (c.pass_fail && pass === false) failedGate = true
    return { name: c.name, weight: w, score, pass, note: g?.note || '' }
  })
  return { name: rubric.name, categories, weighted_score: wtot ? Math.round((wsum / wtot) * 10) : null, passed: !failedGate }
}

// ── CUSTOMER TIMELINE (unified chronological history) ──────
export async function buildTimeline(contactKey: string): Promise<{ events: Array<Record<string, unknown>> }> {
  const sb = getSupabaseAdmin()
  const [{ data: meetings }, { data: docs }, { data: prof }] = await Promise.all([
    sb.from('ci_meetings').select('id, title, meeting_type, meeting_date, created_at, outcome, ai_summary, status').eq('contact_key', contactKey),
    sb.from('ci_documents').select('id, name, doc_type, created_at').eq('contact_key', contactKey),
    sb.from('ci_customer_profiles').select('updated_at, health_score, risk, success_plan').eq('contact_key', contactKey).maybeSingle(),
  ])
  const events: Array<Record<string, unknown>> = []
  for (const m of meetings || []) events.push({ at: m.meeting_date || m.created_at, kind: 'meeting', icon: '🎧', title: `${MEETING_TYPE_LABEL[m.meeting_type] || m.meeting_type}${m.outcome && m.outcome !== 'n/a' ? ` · ${m.outcome}` : ''}`, detail: String(m.ai_summary || '').slice(0, 300), ref: m.id })
  for (const d of docs || []) events.push({ at: d.created_at, kind: 'document', icon: '📄', title: `Added to vault: ${d.name}`, detail: d.doc_type })
  if (prof?.success_plan) events.push({ at: prof.updated_at, kind: 'plan', icon: '🎯', title: 'Success plan updated', detail: (prof.success_plan as { north_star?: string })?.north_star || '' })
  if (prof && (prof.risk === 'high')) events.push({ at: prof.updated_at, kind: 'risk', icon: '⚠️', title: 'Flagged at churn risk', detail: `Health ${prof.health_score ?? '—'}` })
  events.sort((a, b) => String(b.at || '').localeCompare(String(a.at || '')))
  return { events }
}

// ── REPORT EXPORT (branded, printable → Save as PDF) ───────
function esc(s: unknown): string { return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') }
function reportShell(title: string, inner: string): string {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${esc(title)}</title>
<style>
  @page { margin: 20mm; }
  body { font-family: Georgia, 'Times New Roman', serif; color: #1a1a2e; max-width: 820px; margin: 0 auto; padding: 40px 28px; line-height: 1.6; }
  .brand { font-family: system-ui, sans-serif; font-weight: 800; letter-spacing: .04em; color: #225840; font-size: 13px; text-transform: uppercase; }
  h1 { font-size: 28px; margin: 6px 0 2px; } h2 { font-size: 18px; margin: 26px 0 8px; color: #225840; border-bottom: 1px solid #e6e9e6; padding-bottom: 4px; }
  .muted { color: #6b7280; font-family: system-ui, sans-serif; font-size: 13px; }
  ul { margin: 6px 0 6px 18px; } li { margin-bottom: 5px; }
  .pill { display: inline-block; font-family: system-ui,sans-serif; font-size: 12px; font-weight: 700; padding: 2px 9px; border-radius: 6px; background: #eef7f1; color: #225840; }
  .quote { border-left: 3px solid #e6e9e6; padding-left: 10px; color: #555; font-style: italic; }
  @media print { .noprint { display: none } }
</style></head><body onload="window.print&&setTimeout(()=>window.print(),350)">
  <div class="noprint" style="text-align:right;font-family:system-ui,sans-serif;margin-bottom:12px"><button onclick="window.print()" style="padding:8px 16px;border:none;border-radius:8px;background:#225840;color:#fff;font-weight:700;cursor:pointer">Save as PDF</button></div>
  <div class="brand">The5th · AI Coaching Intelligence</div>
  ${inner}
  <p class="muted" style="margin-top:32px">Generated ${new Date().toLocaleString()} · AI-generated insights are grounded in the source transcript/history.</p>
</body></html>`
}
function ul(arr: unknown): string { const a = (arr as unknown[]) || []; return a.length ? `<ul>${a.map((x) => `<li>${typeof x === 'string' ? esc(x) : esc((x as { point?: string }).point || JSON.stringify(x))}</li>`).join('')}</ul>` : '<p class="muted">None.</p>' }

export async function renderMeetingReport(id: string): Promise<string> {
  const sb = getSupabaseAdmin()
  const { data: m } = await sb.from('ci_meetings').select('*').eq('id', id).maybeSingle()
  if (!m) return reportShell('Not found', '<h1>Meeting not found</h1>')
  const a = (m.analysis || {}) as Record<string, unknown>
  const sc = (m.scores || {}) as Record<string, number>
  const inner = `
    <h1>${esc(m.title || MEETING_TYPE_LABEL[m.meeting_type])}</h1>
    <p class="muted">${esc(MEETING_TYPE_LABEL[m.meeting_type] || m.meeting_type)} · ${esc(m.contact_name || m.contact_email || 'Customer')} · ${esc(m.meeting_date || '')} ${typeof a.overall_score === 'number' ? `· <span class="pill">Overall ${a.overall_score}/100</span>` : ''}</p>
    ${a.executive_summary ? `<h2>Executive summary</h2><p>${esc(a.executive_summary)}</p>` : ''}
    ${a.dpc ? `<h2>DPC framework</h2>${['diagnose', 'prescribe', 'close'].map((k) => (a.dpc as Record<string, string>)[k] ? `<p><b>${k[0].toUpperCase() + k.slice(1)}:</b> ${esc((a.dpc as Record<string, string>)[k])}</p>` : '').join('')}` : ''}
    ${Object.keys(sc).length ? `<h2>Scores</h2><p>${Object.entries(sc).map(([k, v]) => `${esc(k.replace(/_/g, ' '))}: <b>${v}/10</b>`).join(' &nbsp;·&nbsp; ')}</p>` : ''}
    ${(a.rubric as { name?: string }) ? `<h2>${esc((a.rubric as { name?: string }).name)} — ${(a.rubric as { weighted_score?: number }).weighted_score ?? '—'}/100 ${(a.rubric as { passed?: boolean }).passed === false ? '(gate failed)' : ''}</h2><ul>${(((a.rubric as { categories?: Array<{ name: string; score: number; pass?: boolean }> }).categories) || []).map((c) => `<li>${esc(c.name)}: <b>${c.score}/10</b>${c.pass === false ? ' — <span style="color:#b4231f">fail</span>' : c.pass === true ? ' — pass' : ''}</li>`).join('')}</ul>` : ''}
    <h2>Strengths</h2>${ul(a.strengths)}
    <h2>Prioritized improvements</h2>${ul(a.improvements)}
    ${a.suggested_followup_email ? `<h2>Suggested follow-up email</h2><p class="quote">${esc(a.suggested_followup_email).replace(/\n/g, '<br>')}</p>` : ''}`
  return reportShell(String(m.title || 'Meeting review'), inner)
}
export async function renderCustomerReport(key: string): Promise<string> {
  const sb = getSupabaseAdmin()
  const { data: prof } = await sb.from('ci_customer_profiles').select('*').eq('contact_key', key).maybeSingle()
  if (!prof) return reportShell('Not found', '<h1>Customer not found</h1>')
  const p = (prof.profile || {}) as Record<string, unknown>
  const plan = (prof.success_plan || null) as Record<string, unknown> | null
  const inner = `
    <h1>${esc(prof.name || key)}</h1>
    <p class="muted">Health ${esc(prof.health_score ?? '—')} · Engagement ${esc(prof.engagement_score ?? '—')} · Success ${esc(prof.success_probability ?? '—')}% · <span class="pill">${esc(prof.risk || 'unknown')} risk</span></p>
    ${p.summary ? `<h2>Profile</h2><p>${esc(p.summary)}</p>` : ''}
    ${[['Goals', p.goals], ['Challenges', p.challenges], ['Risk factors', p.risk_factors], ['Wins', p.wins], ['Next best actions', p.next_best_actions]].map(([label, arr]) => (arr as unknown[])?.length ? `<h2>${label}</h2>${ul(arr)}` : '').join('')}
    ${plan ? `<h2>Success plan</h2>${plan.north_star ? `<p><b>North star:</b> ${esc(plan.north_star)}</p>` : ''}${((plan.milestones as Array<{ horizon: string; goal: string; actions?: string[] }>) || []).map((m) => `<p><b>${esc(m.horizon)}:</b> ${esc(m.goal)}</p>${ul(m.actions)}`).join('')}` : ''}`
  return reportShell(String(prof.name || 'Customer profile'), inner)
}

// ── EXECUTIVE INSIGHTS (proactive cross-customer briefing) ──
export async function executiveInsights(): Promise<{ insights: string[] }> {
  const portfolio = await coachingPortfolio()
  if ((portfolio.totals as { analyzed?: number })?.analyzed === 0) return { insights: [] }
  const res = await ai().messages.create({
    model: MODEL,
    max_tokens: 900,
    system: 'You are a Chief Revenue / Customer Success Officer writing this week\'s executive briefing for a coaching/consulting business. From the portfolio data, surface 4-6 ACTIONABLE, specific insights (not generic stats), each one sentence, in the style of: "Your discovery calls averaged 82/100 — the most common missed question was the decision timeline." Ground every insight in the numbers provided. Output valid JSON only.',
    messages: [{ role: 'user', content: `PORTFOLIO DATA:\n${JSON.stringify(portfolio).slice(0, 12000)}\n\nReturn ONLY: {"insights": ["...", "..."]}` }],
  })
  const text = res.content[0]?.type === 'text' ? res.content[0].text : ''
  const p = parseJson<{ insights: string[] }>(text)
  return { insights: Array.isArray(p?.insights) ? p!.insights : [] }
}

// Portfolio-level aggregation that powers Command AI cross-customer questions
// (churn risk, why discovery converts poorly, which techniques work, themes).
export async function coachingPortfolio(): Promise<Record<string, unknown>> {
  const sb = getSupabaseAdmin()
  const [{ data: meetings }, { data: profiles }] = await Promise.all([
    sb.from('ci_meetings').select('meeting_type, outcome, status, scores, analysis, contact_name, contact_key, meeting_date').eq('status', 'analyzed').order('meeting_date', { ascending: false }).limit(500),
    sb.from('ci_customer_profiles').select('contact_key, name, health_score, engagement_score, success_probability, risk').limit(500),
  ])
  const mrows = meetings || []
  const dims: Record<string, number[]> = {}
  const improvementThemes: Record<string, number> = {}
  let won = 0, lost = 0
  const byType: Record<string, number> = {}
  for (const m of mrows) {
    byType[m.meeting_type] = (byType[m.meeting_type] || 0) + 1
    if (m.outcome === 'won') won++; if (m.outcome === 'lost') lost++
    const sc = (m.scores || {}) as Record<string, number>
    for (const [k, v] of Object.entries(sc)) if (Number.isFinite(Number(v))) (dims[k] ||= []).push(Number(v))
    const imps = ((m.analysis as Record<string, unknown>)?.improvements || []) as Array<{ point?: string }>
    for (const im of imps.slice(0, 4)) { const key = (im.point || '').toLowerCase().slice(0, 60); if (key) improvementThemes[key] = (improvementThemes[key] || 0) + 1 }
  }
  const avg = (arr: number[]) => arr.length ? Math.round((arr.reduce((s, n) => s + n, 0) / arr.length) * 10) / 10 : null
  const avg_scores = Object.fromEntries(Object.entries(dims).map(([k, v]) => [k, avg(v)]))
  const topThemes = Object.entries(improvementThemes).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([point, n]) => ({ point, count: n }))
  const atRisk = (profiles || []).filter((p) => p.risk === 'high' || (Number(p.health_score) || 100) < 45)
    .map((p) => ({ customer: p.name || p.contact_key, health: p.health_score, risk: p.risk, success_probability: p.success_probability }))
  return {
    totals: { analyzed: mrows.length, customers: (profiles || []).length },
    win_rate: won + lost ? Math.round((won / (won + lost)) * 100) : null, won, lost,
    by_type: byType, avg_scores,
    top_improvement_themes: topThemes,
    customers_at_risk: atRisk,
    recent: mrows.slice(0, 15).map((m) => ({ type: m.meeting_type, customer: m.contact_name || m.contact_key, outcome: m.outcome, date: m.meeting_date, summary: String((m.analysis as Record<string, unknown>)?.executive_summary || '').slice(0, 240) })),
  }
}

// Auto-import recent Fathom recordings into the module and analyze them.
export async function importFathom(sinceDays = 30): Promise<{ ok: boolean; imported: number; analyzed: number; note?: string }> {
  if (!fathomConfigured()) return { ok: false, imported: 0, analyzed: 0, note: 'FATHOM_API_KEY is not configured.' }
  const sb = getSupabaseAdmin()
  const since = new Date(Date.now() - sinceDays * 86400000).toISOString()
  const recordings = await listRecent(since)
  let imported = 0, analyzed = 0
  for (const r of recordings) {
    if (!r.transcript || r.transcript.trim().length < 40) continue
    const email = (r.attendee_emails || []).find((e) => e && !e.endsWith('@10kroadmap.org')) || r.attendee_emails?.[0] || ''
    const key = contactKeyFrom(email, r.title)
    const { data, error } = await sb.from('ci_meetings').upsert({
      external_id: r.id, provider: 'fathom', title: r.title || 'Fathom recording', meeting_type: 'sales_call',
      contact_key: key, contact_email: email || null, meeting_date: r.started_at ? r.started_at.slice(0, 10) : null,
      recording_url: r.recording_url || r.share_url || null, transcript: r.transcript, ai_summary: r.summary || null,
      action_items: r.action_items || null, created_by: 'fathom-sync',
    }, { onConflict: 'provider,external_id' }).select('id, status').single()
    if (error || !data) continue
    imported++
    if (data.status !== 'analyzed') { const a = await analyzeMeeting(data.id as string); if (a.ok) analyzed++ }
  }
  return { ok: true, imported, analyzed }
}

// Rebuild the living customer profile + health from all their meetings + docs.
export async function buildCustomerProfile(contactKey: string): Promise<{ ok: boolean }> {
  const sb = getSupabaseAdmin()
  const [{ data: meetings }, { data: docs }] = await Promise.all([
    sb.from('ci_meetings').select('title, meeting_type, meeting_date, ai_summary, outcome, scores, analysis').eq('contact_key', contactKey).order('meeting_date', { ascending: true }),
    sb.from('ci_documents').select('name, doc_type, text').eq('contact_key', contactKey),
  ])
  const mrows = meetings || []
  if (mrows.length === 0 && (docs || []).length === 0) return { ok: false }

  const context = [
    'MEETINGS (chronological):',
    ...mrows.map((r) => `- [${r.meeting_date || '?'}] ${MEETING_TYPE_LABEL[r.meeting_type] || r.meeting_type}${r.outcome && r.outcome !== 'n/a' ? ` (${r.outcome})` : ''}: ${String(r.ai_summary || '').slice(0, 500)}`),
    '',
    'SUPPORTING DOCUMENTS:',
    ...(docs || []).map((d) => `- ${d.name} (${d.doc_type}): ${String(d.text || '').slice(0, 800)}`),
  ].join('\n').slice(0, 40000)

  const res = await ai().messages.create({
    model: MODEL,
    max_tokens: 2000,
    system: 'You maintain a living customer intelligence profile for a coaching/consulting business. Be concise, specific, and grounded ONLY in the provided history. Output valid JSON only.',
    messages: [{
      role: 'user',
      content: `Build/refresh this customer's profile from their complete history below.\n\n${context}\n\nReturn ONLY JSON in this shape:\n{
  "summary": "2-3 sentence who-they-are and where they are now",
  "company": "", "role": "", "industry": "",
  "goals": ["..."], "challenges": ["..."], "current_stage": "",
  "personality_insights": "", "communication_preferences": "", "learning_style": "", "buying_behavior": "",
  "risk_factors": ["..."],
  "wins": ["..."],
  "engagement_score": <0-100>, "health_score": <0-100>, "success_probability": <0-100>,
  "risk": "low|medium|high",
  "next_best_actions": ["..."]
}`,
    }],
  })
  const text = res.content[0]?.type === 'text' ? res.content[0].text : ''
  const p = parseJson<Record<string, unknown>>(text)
  if (!p) return { ok: false }

  const first = mrows.find((r) => r.title) as { contact_name?: string } | undefined
  await sb.from('ci_customer_profiles').upsert({
    contact_key: contactKey,
    name: (first?.contact_name as string) || null,
    email: contactKey.includes('@') ? contactKey : null,
    profile: p,
    health_score: Number(p.health_score) || null,
    engagement_score: Number(p.engagement_score) || null,
    success_probability: Number(p.success_probability) || null,
    risk: (p.risk as string) || null,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'contact_key' })

  // Automation: proactively escalate churn risk to the admin feed + event bus.
  const risk = (p.risk as string) || null
  const health = Number(p.health_score)
  if (risk === 'high' || (Number.isFinite(health) && health < 45)) {
    const who = (first?.contact_name as string) || contactKey
    const why = (p.risk_factors as string[] | undefined)?.slice(0, 2).join('; ') || 'declining engagement/health'
    notify('coaching_risk', `Churn risk: ${who}`, `Health ${Number.isFinite(health) ? health : '—'} · ${why}`, { contact_key: contactKey, health, risk }).catch(() => {})
    emitEvent('coaching_customer_at_risk', { contact_key: contactKey, health, risk, why }).catch(() => {})
  }
  return { ok: true }
}

// ── PERFORMANCE TRENDS (long-term improvement over time) ───
export async function performanceTrends(): Promise<Record<string, unknown>> {
  const sb = getSupabaseAdmin()
  const { data } = await sb.from('ci_meetings').select('meeting_date, created_at, meeting_type, outcome, scores, analysis').eq('status', 'analyzed').order('meeting_date', { ascending: true }).limit(1000)
  const rows = data || []
  const buckets: Record<string, { overall: number[]; discovery: number[]; closing: number[]; objection: number[]; listening: number[]; won: number; lost: number; n: number }> = {}
  for (const m of rows) {
    const d = (m.meeting_date || m.created_at || '').slice(0, 7) || 'unknown'
    const b = (buckets[d] ||= { overall: [], discovery: [], closing: [], objection: [], listening: [], won: 0, lost: 0, n: 0 })
    b.n++
    const sc = (m.scores || {}) as Record<string, number>
    const ov = Number((m.analysis as Record<string, unknown>)?.overall_score)
    if (Number.isFinite(ov)) b.overall.push(ov)
    if (Number.isFinite(Number(sc.discovery))) b.discovery.push(Number(sc.discovery))
    if (Number.isFinite(Number(sc.closing))) b.closing.push(Number(sc.closing))
    if (Number.isFinite(Number(sc.objection_handling))) b.objection.push(Number(sc.objection_handling))
    const listen = Number(sc.active_listening ?? sc.listening)
    if (Number.isFinite(listen)) b.listening.push(listen)
    if (m.outcome === 'won') b.won++; if (m.outcome === 'lost') b.lost++
  }
  const avg = (a: number[]) => a.length ? Math.round((a.reduce((s, n) => s + n, 0) / a.length) * 10) / 10 : null
  const series = Object.entries(buckets).sort((a, b) => a[0].localeCompare(b[0])).map(([month, b]) => ({
    month, meetings: b.n, overall: avg(b.overall), discovery: avg(b.discovery), closing: avg(b.closing),
    objection: avg(b.objection), listening: avg(b.listening),
    win_rate: b.won + b.lost ? Math.round((b.won / (b.won + b.lost)) * 100) : null,
  }))
  let trend_note = ''
  if (series.length >= 2) {
    const res = await ai().messages.create({
      model: MODEL, max_tokens: 400,
      system: 'You analyze a coaching/sales performance time-series. In 2-3 sentences, call out the most meaningful improvement AND any regression, with the numbers. No fluff.',
      messages: [{ role: 'user', content: `MONTHLY SERIES:\n${JSON.stringify(series)}` }],
    })
    trend_note = res.content[0]?.type === 'text' ? res.content[0].text : ''
  }
  return { series, trend_note }
}

// ── CUSTOMER SUCCESS PLAN (30/60/90) ───────────────────────
export async function generateSuccessPlan(contactKey: string): Promise<{ ok: boolean; plan?: unknown }> {
  const sb = getSupabaseAdmin()
  const [{ data: prof }, { data: meetings }] = await Promise.all([
    sb.from('ci_customer_profiles').select('name, profile').eq('contact_key', contactKey).maybeSingle(),
    sb.from('ci_meetings').select('meeting_type, meeting_date, ai_summary, outcome').eq('contact_key', contactKey).order('meeting_date', { ascending: false }).limit(20),
  ])
  if (!prof) return { ok: false }
  const res = await ai().messages.create({
    model: MODEL, max_tokens: 1600,
    system: 'You are a Customer Success strategist. Build a concrete 30/60/90-day success plan for THIS customer grounded in their profile + history. Output valid JSON only.',
    messages: [{ role: 'user', content: `PROFILE:\n${JSON.stringify(prof.profile).slice(0, 6000)}\n\nRECENT MEETINGS:\n${JSON.stringify(meetings || []).slice(0, 4000)}\n\nReturn ONLY:\n{"north_star":"the outcome we're driving to","milestones":[{"horizon":"30d|60d|90d","goal":"","actions":["..."],"success_metric":""}],"blockers":["..."],"assigned_homework":["..."],"risks":["..."],"next_meeting_agenda":["..."]}` }],
  })
  const text = res.content[0]?.type === 'text' ? res.content[0].text : ''
  const plan = parseJson<Record<string, unknown>>(text)
  if (!plan) return { ok: false }
  await sb.from('ci_customer_profiles').update({ success_plan: plan, updated_at: new Date().toISOString() }).eq('contact_key', contactKey)
  return { ok: true, plan }
}

// ── PRACTICE & ROLEPLAY CENTER ─────────────────────────────
const SCENARIO_LABEL: Record<string, string> = {
  discovery_call: 'Discovery Call', sales_call: 'Sales Call', objection_handling: 'Objection Handling',
  coaching_session: 'Coaching Session', difficult_conversation: 'Difficult Conversation', renewal_call: 'Renewal Call',
}
export async function startRoleplay(scenario: string, difficulty: string, createdBy: string): Promise<{ id: string; persona: string; opening: string }> {
  const sb = getSupabaseAdmin()
  const res = await ai().messages.create({
    model: MODEL, max_tokens: 500,
    system: `You run a sales/coaching PRACTICE simulator. Invent a realistic prospect/client persona for a "${SCENARIO_LABEL[scenario] || scenario}" at "${difficulty}" difficulty (name, role, company, situation, personality, hidden objection). Then write their OPENING line to start the roleplay. Output JSON only.`,
    messages: [{ role: 'user', content: 'Return ONLY: {"persona":"2-3 sentence description of who they are and their hidden objection","opening":"their first line to the rep/coach"}' }],
  })
  const text = res.content[0]?.type === 'text' ? res.content[0].text : ''
  const p = parseJson<{ persona: string; opening: string }>(text) || { persona: 'A realistic prospect.', opening: 'Hi, thanks for hopping on. So what is this about?' }
  const messages = [{ role: 'assistant', content: p.opening }]
  const { data } = await sb.from('ci_roleplays').insert({ scenario, difficulty, persona: p.persona, messages, created_by: createdBy }).select('id').single()
  return { id: (data?.id as string) || '', persona: p.persona, opening: p.opening }
}
export async function roleplayReply(id: string, userMessage: string): Promise<{ reply: string }> {
  const sb = getSupabaseAdmin()
  const { data: rp } = await sb.from('ci_roleplays').select('*').eq('id', id).maybeSingle()
  if (!rp) return { reply: '' }
  const history = [...((rp.messages as Array<{ role: string; content: string }>) || []), { role: 'user', content: userMessage }]
  const res = await ai().messages.create({
    model: MODEL, max_tokens: 500,
    system: `You are role-playing a customer in a "${SCENARIO_LABEL[rp.scenario] || rp.scenario}" practice session. STAY IN CHARACTER as this persona: ${rp.persona}. Be realistic, not a pushover, raise natural objections, react to how well the rep/coach handles you. Never break character or coach them. Keep replies to 1-4 sentences.`,
    messages: history.map((m) => ({ role: m.role === 'user' ? ('user' as const) : ('assistant' as const), content: m.content })),
  })
  const reply = res.content[0]?.type === 'text' ? res.content[0].text : ''
  await sb.from('ci_roleplays').update({ messages: [...history, { role: 'assistant', content: reply }], updated_at: new Date().toISOString() }).eq('id', id)
  return { reply }
}
export async function scoreRoleplay(id: string): Promise<{ ok: boolean; score?: number; feedback?: unknown }> {
  const sb = getSupabaseAdmin()
  const { data: rp } = await sb.from('ci_roleplays').select('*').eq('id', id).maybeSingle()
  if (!rp) return { ok: false }
  const methodology = await frameworksFor(rp.scenario === 'objection_handling' ? 'sales_call' : rp.scenario)
  const transcript = ((rp.messages as Array<{ role: string; content: string }>) || []).map((m) => `${m.role === 'user' ? 'REP/COACH' : 'CUSTOMER'}: ${m.content}`).join('\n')
  const res = await ai().messages.create({
    model: MODEL, max_tokens: 1400,
    system: `You are an elite coach grading a PRACTICE roleplay. Grade the REP/COACH only.${methodology ? `\n\nPrioritize this methodology:\n${methodology}` : ''}\nOutput valid JSON only.`,
    messages: [{ role: 'user', content: `TRANSCRIPT:\n${transcript}\n\nReturn ONLY:\n{"score":<0-100>,"strengths":["..."],"weaknesses":["..."],"missed_opportunities":["..."],"better_questions":["..."],"alternative_responses":["..."],"practice_exercises":["..."]}` }],
  })
  const text = res.content[0]?.type === 'text' ? res.content[0].text : ''
  const fb = parseJson<Record<string, unknown>>(text)
  if (!fb) return { ok: false }
  await sb.from('ci_roleplays').update({ score: Number(fb.score) || null, feedback: fb, updated_at: new Date().toISOString() }).eq('id', id)
  return { ok: true, score: Number(fb.score) || undefined, feedback: fb }
}

// Portfolio-level aggregation that powers Command AI cross-customer questions

// AI Success Coach: answer an admin's question, grounded in one customer's history.
export async function askSuccessCoach(contactKey: string, question: string): Promise<string> {
  const sb = getSupabaseAdmin()
  const [{ data: prof }, { data: meetings }, { data: docs }] = await Promise.all([
    sb.from('ci_customer_profiles').select('profile').eq('contact_key', contactKey).maybeSingle(),
    sb.from('ci_meetings').select('title, meeting_type, meeting_date, ai_summary, outcome, analysis').eq('contact_key', contactKey).order('meeting_date', { ascending: false }).limit(20),
    sb.from('ci_documents').select('name, doc_type, text').eq('contact_key', contactKey).limit(30),
  ])
  const context = [
    prof?.profile ? `PROFILE:\n${JSON.stringify(prof.profile).slice(0, 6000)}` : '',
    'MEETINGS:',
    ...(meetings || []).map((r) => `- [${r.meeting_date || '?'}] ${MEETING_TYPE_LABEL[r.meeting_type] || r.meeting_type}: ${String(r.ai_summary || '').slice(0, 600)}`),
    'DOCUMENTS:',
    ...(docs || []).map((d) => `- ${d.name}: ${String(d.text || '').slice(0, 600)}`),
  ].join('\n').slice(0, 40000)

  const res = await ai().messages.create({
    model: MODEL,
    max_tokens: 1200,
    system: 'You are an AI Success Coach for a coaching/consulting business. Answer the admin\'s question about THIS customer, grounded ONLY in the history provided. Be direct, specific and actionable. If the history does not support an answer, say so. Cite the meeting/date you drew from.',
    messages: [{ role: 'user', content: `CUSTOMER HISTORY:\n${context}\n\nADMIN QUESTION: ${question}` }],
  })
  return res.content[0]?.type === 'text' ? res.content[0].text : 'I could not generate an answer.'
}
