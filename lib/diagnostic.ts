/* Business-health diagnostic scoring — deterministic, dependency-free.

   Turns a quiz taker's answers into per-category 0-100 business-health scores.
   This is DISTINCT from lib/scoring.ts (which scores CRM lead heat from activity).
   It exists so the FREE diagnostic snapshot shows real, stable scores without
   an AI call — the paid full report (generate-roadmap) still layers deep AI
   analysis on top. Pure functions only: same answers in → same scores out.

   Answer keys/values mirror the quiz definitions in app/quiz/page.tsx. Scale
   questions (q10, q20, qmp1) store "1".."5"; multi questions store string[]. */

export type Answers = Record<string, string | string[] | undefined>

export type CategoryKey =
  | 'offer' | 'positioning' | 'pricing' | 'sales'
  | 'content' | 'marketing' | 'automation' | 'confidence'

export interface CategoryScore { key: CategoryKey; label: string; score: number; band: DiagnosticBand }
export type DiagnosticBand = 'Critical' | 'Needs work' | 'Solid' | 'Strong'

export interface Diagnostic {
  overall: number
  categories: CategoryScore[]
  topStrengths: CategoryScore[]   // 2-3 highest
  biggestGap: CategoryScore        // single lowest
}

const LABELS: Record<CategoryKey, string> = {
  offer: 'Offer',
  positioning: 'Positioning',
  pricing: 'Pricing',
  sales: 'Sales',
  content: 'Content',
  marketing: 'Marketing',
  automation: 'Systems',
  confidence: 'Confidence',
}

/* Band thresholds — mirrors the tone of lib/scoring.ts band() but tuned for a
   0-100 business-health read rather than lead heat. */
export function diagnosticBand(score: number): DiagnosticBand {
  if (score >= 75) return 'Strong'
  if (score >= 55) return 'Solid'
  if (score >= 35) return 'Needs work'
  return 'Critical'
}

/* ── helpers ── */
function str(a: Answers, key: string): string {
  const v = a[key]
  if (Array.isArray(v)) return v[0] ?? ''
  return typeof v === 'string' ? v : ''
}
function arr(a: Answers, key: string): string[] {
  const v = a[key]
  if (Array.isArray(v)) return v
  return typeof v === 'string' && v ? [v] : []
}
/* Scale answers are "1".."5". Map to 0-100 (1→20 … 5→100); default mid. */
function scale(a: Answers, key: string, fallback = 3): number {
  const n = parseInt(str(a, key), 10)
  const v = Number.isFinite(n) ? Math.min(5, Math.max(1, n)) : fallback
  return v * 20
}
/* Look up option value → points; unknown/absent falls back to `def`. */
function pick(a: Answers, key: string, map: Record<string, number>, def = 45): number {
  const v = str(a, key)
  return v in map ? map[v] : def
}
function clamp(n: number): number { return Math.max(0, Math.min(100, Math.round(n))) }
function avg(...xs: number[]): number { return xs.reduce((s, x) => s + x, 0) / xs.length }

/* Presence of a clear answer to an offer/positioning question is itself signal
   (they've thought it through). Rewards having chosen a concrete option. */
function chosen(a: Answers, key: string, hit = 65, miss = 40): number {
  return str(a, key) ? hit : miss
}

export function computeDiagnostic(answers: Answers): Diagnostic {
  const a = answers || {}

  // OFFER — clarity of what they sell and how it's delivered.
  const offer = clamp(avg(
    chosen(a, 'q7', 70, 38),                                   // client transformation defined
    pick(a, 'q8', { '1on1': 62, group: 72, course: 66, membership: 74, mixed: 70 }, 50), // delivery model
    pick(a, 'q9', { '4-6wk': 58, '8-12wk': 70, '3-6mo': 78, '6-12mo': 74, ongoing: 72 }, 50), // program shape
    chosen(a, 'q5', 68, 40),                                   // zone of genius named
  ))

  // POSITIONING — audience clarity, pain clarity, story.
  const positioning = clamp(avg(
    chosen(a, 'q2', 68, 38),                                   // ideal client named
    chosen(a, 'q4', 70, 40),                                   // #1 client pain named
    pick(a, 'q6', { strong: 82, underused: 60, partial: 45, none: 30 }, 45), // transformation story
    chosen(a, 'q3', 58, 45),                                   // audience age defined
  ))

  // PRICING — confidence + psychology around charging.
  const pricing = clamp(avg(
    scale(a, 'q10', 3),                                        // says price out loud confidently
    scale(a, 'qmp1', 3),                                       // comfort charging premium
    pick(a, 'q11', { confident: 88, justify: 52, fear_no: 40, guilt: 38, not_worth: 30 }, 45),
  ))

  // SALES — relationship with selling/closing.
  const sales = clamp(avg(
    pick(a, 'q15', { strength: 92, good: 76, decent: 58, lose_price: 42, hate: 28 }, 45),
    pick(a, 'q16', { success: 62, visibility: 45, credibility: 42, wont_work: 40, money: 44 }, 45),
  ))

  // CONTENT — consistency + format range.
  const content = clamp(avg(
    pick(a, 'q12', { daily: 92, few_week: 78, weekly: 62, sporadic: 40, rarely: 26 }, 45),
    pick(a, 'q14', { what_say: 40, perfectionism: 42, time: 46, tech: 48, no_results: 38 }, 45),
    clamp(35 + arr(a, 'q13').length * 12),                     // more natural formats = more range
  ))

  // MARKETING — visibility engine: story + consistency + reach.
  const marketing = clamp(avg(
    pick(a, 'q6', { strong: 80, underused: 55, partial: 42, none: 30 }, 45),
    pick(a, 'q12', { daily: 88, few_week: 74, weekly: 60, sporadic: 40, rarely: 26 }, 45),
    pick(a, 'q14', { no_results: 34, what_say: 40, time: 48, perfectionism: 44, tech: 50 }, 45),
  ))

  // SYSTEMS / AUTOMATION — leverage in delivery + capacity to build.
  const automation = clamp(avg(
    pick(a, 'q8', { course: 82, membership: 84, mixed: 66, group: 62, '1on1': 40 }, 50),
    pick(a, 'q19', { '20+': 74, '10-20': 66, '5-10': 50, lt5: 36 }, 50),
    pick(a, 'q12', { daily: 70, few_week: 62, weekly: 52, sporadic: 40, rarely: 30 }, 45),
  ))

  // CONFIDENCE — money psychology + self-belief.
  const confidence = clamp(avg(
    scale(a, 'qmp1', 3),
    pick(a, 'qmp2', { excited: 88, calm: 80, anxious: 46, guilty: 38, avoidant: 34 }, 50),
    pick(a, 'qmp3', { freedom: 86, slow: 56, hard: 46, guilt: 40, rejection: 36 }, 50),
    pick(a, 'qmp5', { overcharging: 44, rejection: 42, judgement: 44, failure: 40, success: 52 }, 45),
  ))

  const categories: CategoryScore[] = ([
    ['offer', offer], ['positioning', positioning], ['pricing', pricing], ['sales', sales],
    ['content', content], ['marketing', marketing], ['automation', automation], ['confidence', confidence],
  ] as [CategoryKey, number][]).map(([key, score]) => ({
    key, label: LABELS[key], score, band: diagnosticBand(score),
  }))

  const overall = clamp(avg(...categories.map(c => c.score)))
  const sorted = [...categories].sort((x, y) => y.score - x.score)
  const topStrengths = sorted.slice(0, 3).filter(c => c.score >= 55).slice(0, 3)
  const biggestGap = sorted[sorted.length - 1]

  return { overall, categories, topStrengths: topStrengths.length ? topStrengths : sorted.slice(0, 2), biggestGap }
}

/* Count of "growth areas" (categories below Strong) — powers the paywall teaser
   ("we identified N growth areas, showing you the most important one"). */
export function growthAreaCount(d: Diagnostic): number {
  return Math.max(1, d.categories.filter(c => c.score < 75).length)
}
