/* The5th Income OS: deterministic assessment engine.
   Pure functions, no network, no AI. The same answers always produce the same
   profile, instantly, on the server, in the browser and in the sales brief. */
import { QUESTIONS, BLOCKER_IDS, DIM_IDS, ITEMS, ANSWER_KEYS, LEGACY, type BlockerId, type DimId, type Answers, type Q, type Opt } from './questions'
import { BLOCKERS, STAGE_MOVES, NICHE_LINES, INCOME_LINES, STRENGTH_LINES, DIM_COPY, BLIND_SPOTS, pairLine, type Stage, type Niche, type IncomeKey } from './content'

const ORDER: BlockerId[] = ['worth', 'pricing', 'clarity', 'visibility', 'selling', 'system'] // tie-break priority

const INCOME_MID: Record<string, number> = { none: 0, u1k: 500, '1-3k': 2000, '3-10k': 6000, '10k+': 12000 }
const GOAL_MID: Record<string, number> = { '1-3k': 2000, '3-5k': 4000, '5-10k': 7500, '10k+': 12000 }

type W = Partial<Record<BlockerId, number>>

function scaleWeights(id: string, n: number): W {
  const inv = 5 - n // 0 (confident) .. 4 (not at all)
  if (id === 'price') return { pricing: inv, worth: inv * 0.5 }
  if (id === 'comfort') return { worth: inv, pricing: inv * 0.5 }
  return {}
}

/* How much each mindset dimension (0 = needs attention, 1 = strong) pushes each blocker. */
function dimWeights(d: Record<DimId, number>): W {
  const lo = (k: DimId) => 1 - d[k] / 100
  return {
    worth: lo('deserve') * 4 + lo('compare') * 2,
    pricing: lo('comfort') * 3 + lo('risk') * 2,
    selling: lo('comfort') * 2,
    visibility: lo('compare') * 1,
    clarity: lo('risk') * 1,
  }
}
const DIM_MAX: W = { worth: 6, pricing: 5, selling: 2, visibility: 1, clarity: 1 }

/* Highest each blocker can score across the whole assessment (for normalising). */
const MAX: Record<BlockerId, number> = (() => {
  const m = Object.fromEntries(BLOCKER_IDS.map((b) => [b, 0])) as Record<BlockerId, number>
  for (const q of QUESTIONS) {
    if (q.type === 'scale') {
      const w = scaleWeights(q.id, 1)
      for (const b of BLOCKER_IDS) m[b] += w[b] || 0
    } else if (q.type === 'single') {
      for (const b of BLOCKER_IDS) m[b] += Math.max(0, ...q.options.map((o) => o.w?.[b] || 0))
    } else if (q.type === 'multi') {
      for (const b of BLOCKER_IDS) {
        m[b] += q.options.map((o) => o.w?.[b] || 0).sort((a, c) => c - a).slice(0, q.max).reduce((x, y) => x + y, 0)
      }
    }
  }
  for (const b of BLOCKER_IDS) m[b] += DIM_MAX[b] || 0
  return m
})()

export type Band = 'low' | 'moderate' | 'high' | 'critical'
export const bandOf = (v: number): Band => (v >= 78 ? 'critical' : v >= 60 ? 'high' : v >= 40 ? 'moderate' : 'low')
export const BAND_LABEL: Record<Band, string> = { low: 'Low', moderate: 'Moderate', high: 'High', critical: 'Critical' }
export type DimBand = 'strong' | 'developing' | 'attention'
export const dimBandOf = (v: number): DimBand => (v >= 68 ? 'strong' : v >= 45 ? 'developing' : 'attention')

export interface Result {
  intensities: Record<BlockerId, number>
  order: BlockerId[]
  primary: BlockerId
  secondary: BlockerId
  overall: number
  band: Band
  archetype: string
  profileId: string
  pair: string
  dims: Record<DimId, number>
  strengths: string[]
  blindSpots: string[]
  stage: Stage
  niche: Niche
  incomeKey: IncomeKey
  goalKey: string
  urgency: number
  hours: string
  invest: string
  support: string
  tried: string[]
  gap: { current: number; target: number; monthly: number; yearly: number }
  signals: string[]
  stageMove: string
  nicheLine: { who: string; line: string }
  incomeLine: string
  /** 0-100: how ready they are to act, from urgency, time and willingness to invest. */
  readinessScore: number
  readiness: 'hot' | 'warm' | 'cool'
  code: string
}

const one = (v: string | string[] | undefined): string => (Array.isArray(v) ? v[0] || '' : v || '')
const many = (v: string | string[] | undefined): string[] => (Array.isArray(v) ? v : v ? [v] : [])

export function dimScores(answers: Answers): Record<DimId, number> {
  const sums = { deserve: 0, comfort: 0, risk: 0, compare: 0 } as Record<DimId, number>
  const cnt = { deserve: 0, comfort: 0, risk: 0, compare: 0 } as Record<DimId, number>
  for (const it of ITEMS) {
    const n = Math.min(5, Math.max(1, Number(one(answers[it.id])) || 3))
    const healthy = it.rev ? 6 - n : n // 1..5, 5 = healthiest
    sums[it.dim] += healthy
    cnt[it.dim] += 1
  }
  return Object.fromEntries(DIM_IDS.map((d) => [d, cnt[d] ? Math.round(((sums[d] / cnt[d]) - 1) / 4 * 100) : 50])) as Record<DimId, number>
}

export function score(answers: Answers): Result {
  const raw = Object.fromEntries(BLOCKER_IDS.map((b) => [b, 0])) as Record<BlockerId, number>
  const add = (w?: W) => { if (w) for (const b of BLOCKER_IDS) raw[b] += w[b] || 0 }

  for (const q of QUESTIONS) {
    const a = answers[q.id]
    if (q.type === 'scale') add(scaleWeights(q.id, Math.min(5, Math.max(1, Number(one(a)) || 3))))
    else if (q.type === 'single') add(q.options.find((o) => o.v === one(a))?.w)
    else if (q.type === 'multi') for (const v of many(a).slice(0, q.max)) add(q.options.find((o) => o.v === v)?.w)
  }
  const dims = dimScores(answers)
  add(dimWeights(dims))

  const intensities = Object.fromEntries(BLOCKER_IDS.map((b) => {
    const pct = MAX[b] > 0 ? Math.min(1, raw[b] / MAX[b]) : 0
    return [b, Math.round(14 + 82 * Math.pow(pct, 0.78))]
  })) as Record<BlockerId, number>

  const order = [...BLOCKER_IDS].sort((x, y) => intensities[y] - intensities[x] || ORDER.indexOf(x) - ORDER.indexOf(y))
  const primary = order[0]
  const secondary = order[1]

  const stage = (['idea', 'starting', 'launched', 'scaling'].includes(one(answers.stage)) ? one(answers.stage) : 'starting') as Stage
  const niche = (Object.keys(NICHE_LINES).includes(one(answers.niche)) ? one(answers.niche) : 'creative') as Niche
  const incomeKey = (Object.keys(INCOME_MID).includes(one(answers.income)) ? one(answers.income) : '1-3k') as IncomeKey
  const goalKey = Object.keys(GOAL_MID).includes(one(answers.goal)) ? one(answers.goal) : '5-10k'
  const urgency = Math.min(5, Math.max(1, Number(one(answers.urgency)) || 3))
  const hours = one(answers.hours) || '5-10'
  const invest = one(answers.invest) || 'month'
  const support = one(answers.support) || 'one'
  const tried = many(answers.tried)

  const current = INCOME_MID[incomeKey]
  let target = GOAL_MID[goalKey]
  if (target <= current) target = Math.max(Math.round(current * 1.5 / 500) * 500, current + 1000)
  const monthly = Math.max(0, target - current)

  /* The visitor's own words, quoted back. */
  const signals: string[] = []
  const opt = (id: string, v: string): Opt | undefined => { const q = QUESTIONS.find((x) => x.id === id) as Q | undefined; return q && 'options' in q ? q.options.find((o) => o.v === v) : undefined }
  const wall = opt('wall', one(answers.wall))
  if (wall) signals.push(`You said the biggest wall is: "${wall.label}"`)
  for (const v of many(answers.voices).slice(0, 3)) { const o = opt('voices', v); if (o) signals.push(`A voice you hear: "${o.label}"`) }
  const ask = opt('ask', one(answers.ask))
  if (ask && ask.v !== 'calm') signals.push(`When someone asks your price: "${ask.label}"`)
  const price = Number(one(answers.price)) || 0
  if (price && price <= 2) signals.push(`You rated your price confidence ${price} out of 5`)
  const comfort = Number(one(answers.comfort)) || 0
  if (comfort && comfort <= 2) signals.push(`You rated your comfort charging premium prices ${comfort} out of 5`)

  /* Strengths: the two calmest blockers + the healthiest mindset dimensions. */
  const strengths: string[] = [...order].reverse().slice(0, 2).map((b) => STRENGTH_LINES[b])
  for (const d of DIM_IDS) if (dims[d] >= 70 && strengths.length < 4) strengths.push(DIM_COPY[d].strong)

  /* Blind spots: contradictions between answers (preset rules). */
  const blindSpots = BLIND_SPOTS.filter((b) => b.when({ answers, dims, intensities, tried, goalKey, incomeKey, urgency, hours, invest })).map((b) => b.line).slice(0, 3)

  const hoursPts = hours === 'lt5' ? 5 : hours === '5-10' ? 12 : hours === '10-20' ? 20 : 28
  const investPts = invest === 'now' ? 37 : invest === 'month' ? 26 : invest === 'sure' ? 14 : 5
  const readinessScore = Math.min(100, urgency * 7 + hoursPts + investPts)
  const readiness: Result['readiness'] = readinessScore >= 70 ? 'hot' : readinessScore >= 45 ? 'warm' : 'cool'

  const overall = Math.round((intensities[primary] * 2 + intensities[secondary]) / 3)
  const band = bandOf(overall)
  const profileId = `${BLOCKERS[primary].code}-${BLOCKERS[secondary].code}-${band[0].toUpperCase()}${overall}`

  return {
    intensities, order, primary, secondary, overall, band,
    archetype: BLOCKERS[primary].archetype, profileId, pair: pairLine(primary, secondary),
    dims, strengths, blindSpots,
    stage, niche, incomeKey, goalKey, urgency, hours, invest, support, tried,
    gap: { current, target, monthly, yearly: monthly * 12 },
    signals: signals.slice(0, 6),
    stageMove: STAGE_MOVES[primary][stage],
    nicheLine: NICHE_LINES[niche],
    incomeLine: INCOME_LINES[incomeKey],
    readinessScore, readiness,
    code: encode(answers),
  }
}

/* ── share code: compact, PII-free, reproduces the whole profile ── */
function b64e(s: string): string { return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '') }
function b64d(s: string): string { return atob(s.replace(/-/g, '+').replace(/_/g, '/')) }

export function encode(answers: Answers): string {
  return b64e(ANSWER_KEYS.map((k) => { const v = answers[k]; return Array.isArray(v) ? v.join('.') : v || '' }).join('|'))
}

/* Rebuilds a validated answers object. Unknown or malformed values are dropped. */
export function decode(code: string): Answers | null {
  try {
    if (!code || code.length > 900) return null
    const parts = b64d(code).split('|')
    if (parts.length !== ANSWER_KEYS.length) return null
    const out: Answers = {}
    const raw: Record<string, string> = {}
    ANSWER_KEYS.forEach((k, i) => { raw[k] = parts[i] })
    for (const q of QUESTIONS) {
      if (q.type === 'matrix') {
        for (const it of q.items) { const n = Number(raw[it.id]); if (n >= 1 && n <= 5) out[it.id] = String(n) }
      } else if (q.type === 'scale') {
        const n = Number(raw[q.id]); if (n >= 1 && n <= 5) out[q.id] = String(n)
      } else if (q.type === 'single') {
        if (q.options.some((o) => o.v === raw[q.id])) out[q.id] = raw[q.id]
      } else {
        const vs = raw[q.id].split('.').filter((v) => q.options.some((o) => o.v === v)).slice(0, q.max)
        if (vs.length) out[q.id] = vs
      }
    }
    return out
  } catch { return null }
}

/* Answers + derived data in the shape stored on quiz_leads.answers. Includes the
   six legacy keys so admin qualification scoring keeps working. */
export function toLeadAnswers(answers: Answers, r: Result): Record<string, unknown> {
  const out: Record<string, unknown> = { ...answers, quiz_version: 'income-os-v1' }
  for (const [nk, lk] of Object.entries(LEGACY)) if (answers[nk] != null) out[lk] = answers[nk]
  out.blocker_primary = r.primary
  out.blocker_secondary = r.secondary
  out.blocker_scores = r.intensities
  out.mindset_scores = r.dims
  out.archetype = r.archetype
  out.profile_id = r.profileId
  out.readiness_score = r.readinessScore
  out.report_code = r.code
  return out
}
