import Anthropic from '@anthropic-ai/sdk'
import { getSupabaseAdmin } from '@/lib/supabase'
import { recordMemory } from '@/lib/memory/store'
import { fathomConfigured, listRecent } from '@/lib/fathom'

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
  const res = await ai().messages.create({
    model: MODEL,
    max_tokens: 3500,
    system,
    messages: [{
      role: 'user',
      content: `MEETING: ${m.title || MEETING_TYPE_LABEL[m.meeting_type]} · Customer: ${m.contact_name || m.contact_email || 'unknown'}\n\nTRANSCRIPT:\n${transcript.slice(0, 45000)}\n\nReturn ONLY valid JSON in exactly this shape (no markdown, no prose):\n${shape}`,
    }],
  })
  const text = res.content[0]?.type === 'text' ? res.content[0].text : ''
  const parsed = parseJson<Record<string, unknown>>(text)
  if (!parsed) return { ok: false, error: 'Could not parse analysis' }

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
  return { ok: true }
}

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
