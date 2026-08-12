/* ─────────────────────────────────────────────────────────────────────────
   Lead qualification engine.

   Pure, dependency-free scoring of a quiz taker's likelihood of being a good
   fit for The5th's paid offers (diagnostic → Collective). Derived ENTIRELY
   from the existing quiz answers — no extra questions — so it can be computed
   for every historical lead too.

   Signals (all already collected in the quiz):
     q18  revenue goal (6mo)      — ambition / ticket size
     q20  urgency (scale 1-5)     — buying intent
     q1   business stage          — traction / ability to invest
     q19  weekly hours available  — commitment / ability to invest
     q10  price confidence (1-5)  — readiness to sell
     qmp1 comfort charging premium(1-5) — money mindset

   The result is a transparent 0-100 score, a tier, a colour, and the human
   reasons behind it. Tune WEIGHTS / thresholds here — everything else reads
   from this single source.

   COLOUR MAPPING (as specified by the founder — intentionally non-standard):
     qualified  → RED    (hot lead, act now)
     nurture    → GREEN  (middle, warm up)
     unqualified→ BLUE   (cold / not a fit yet)
   ───────────────────────────────────────────────────────────────────────── */

export type QualTier = 'qualified' | 'nurture' | 'unqualified'

export interface Qualification {
  score: number            // 0-100
  tier: QualTier
  label: string            // 'Qualified' | 'Nurture' | 'Not qualified'
  color: string            // hex for admin badges/accents
  reasons: string[]        // positive drivers ("why they're hot")
  gaps: string[]           // negative drivers ("why they're not")
}

type Answers = Record<string, string | string[] | number | null | undefined>

/* Colours for each tier (founder-specified inverted mapping). */
export const QUAL_COLORS: Record<QualTier, string> = {
  qualified: '#dc2626',   // red
  nurture: '#16a34a',     // green
  unqualified: '#2563eb', // blue
}

export const QUAL_LABELS: Record<QualTier, string> = {
  qualified: 'Qualified',
  nurture: 'Nurture',
  unqualified: 'Not qualified',
}

/* Weight of each signal (sums to 100). */
const WEIGHTS = {
  revenueGoal: 25, // q18
  urgency: 25,     // q20
  stage: 15,       // q1
  hours: 10,       // q19
  priceConf: 12,   // q10
  premium: 13,     // qmp1
}

/* Tier thresholds on the 0-100 score. */
const QUALIFIED_AT = 65
const NURTURE_AT = 40

/* ── value → 0-1 normalisers ── */
const REVENUE: Record<string, number> = { '1-3k': 0.25, '3-5k': 0.5, '5-10k': 0.8, '10k+': 1 }
const STAGE: Record<string, number> = { idea: 0.1, starting: 0.35, launched: 0.8, scaling: 1 }
const HOURS: Record<string, number> = { lt5: 0.2, '5-10': 0.5, '10-20': 0.8, '20+': 1 }

/* A scale answer ('1'..'5', number, or missing) → 0-1. Missing = neutral 0.4. */
function scale01(v: string | string[] | number | null | undefined): number | null {
  if (v == null || v === '') return null
  const n = Number(Array.isArray(v) ? v[0] : v)
  if (!Number.isFinite(n)) return null
  return Math.max(0, Math.min(1, (n - 1) / 4))
}

function pick(v: string | string[] | number | null | undefined): string {
  return String(Array.isArray(v) ? v[0] : v ?? '').trim()
}

/* Compute qualification for a lead from its quiz answers. */
export function scoreLead(answers: Answers | null | undefined): Qualification {
  const a: Answers = answers || {}
  const reasons: string[] = []
  const gaps: string[] = []

  // Each component returns a 0-1 strength, or null when unanswered (neutral).
  const NEUTRAL = 0.4

  // Revenue goal (q18)
  const revKey = pick(a.q18)
  const rev = revKey in REVENUE ? REVENUE[revKey] : null
  if (rev != null) {
    const money = { '1-3k': '$1–3K/mo', '3-5k': '$3–5K/mo', '5-10k': '$5–10K/mo', '10k+': '$10K+/mo' }[revKey]
    if (rev >= 0.8) reasons.push(`Aiming for ${money}`)
    else if (rev <= 0.25) gaps.push(`Modest revenue goal (${money})`)
  }

  // Urgency (q20, scale)
  const urg = scale01(a.q20)
  if (urg != null) {
    const n = Number(pick(a.q20))
    if (urg >= 0.75) reasons.push(`High urgency (${n}/5)`)
    else if (urg <= 0.25) gaps.push(`Low urgency (${n}/5)`)
  }

  // Stage (q1)
  const stageKey = pick(a.q1)
  const stage = stageKey in STAGE ? STAGE[stageKey] : null
  if (stage != null) {
    const nm = { idea: 'still an idea', starting: 'just starting out', launched: 'launched with clients', scaling: 'established & scaling' }[stageKey]
    if (stage >= 0.8) reasons.push(`Business ${nm}`)
    else if (stage <= 0.35) gaps.push(`Early stage (${nm})`)
  }

  // Hours available (q19)
  const hoursKey = pick(a.q19)
  const hours = hoursKey in HOURS ? HOURS[hoursKey] : null
  if (hours != null) {
    const nm = { lt5: '<5 hrs/wk', '5-10': '5–10 hrs/wk', '10-20': '10–20 hrs/wk', '20+': '20+ hrs/wk' }[hoursKey]
    if (hours >= 0.8) reasons.push(`Committed (${nm})`)
    else if (hours <= 0.2) gaps.push(`Limited time (${nm})`)
  }

  // Price confidence (q10, scale)
  const conf = scale01(a.q10)
  if (conf != null && conf >= 0.75) reasons.push('Confident stating price')
  else if (conf != null && conf <= 0.25) gaps.push('Low pricing confidence')

  // Comfort charging premium (qmp1, scale)
  const prem = scale01(a.qmp1)
  if (prem != null && prem >= 0.75) reasons.push('Comfortable charging premium')
  else if (prem != null && prem <= 0.25) gaps.push('Uncomfortable charging premium')

  const score = Math.round(
    WEIGHTS.revenueGoal * (rev ?? NEUTRAL) +
    WEIGHTS.urgency * (urg ?? NEUTRAL) +
    WEIGHTS.stage * (stage ?? NEUTRAL) +
    WEIGHTS.hours * (hours ?? NEUTRAL) +
    WEIGHTS.priceConf * (conf ?? NEUTRAL) +
    WEIGHTS.premium * (prem ?? NEUTRAL)
  )

  const tier: QualTier = score >= QUALIFIED_AT ? 'qualified' : score >= NURTURE_AT ? 'nurture' : 'unqualified'

  return {
    score,
    tier,
    label: QUAL_LABELS[tier],
    color: QUAL_COLORS[tier],
    reasons,
    gaps,
  }
}
