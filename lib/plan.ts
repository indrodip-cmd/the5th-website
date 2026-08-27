/* 7-Day Action Plan — the day-by-day to-do list a lead works through after the
   quiz. Personalised from their AI report's "YOUR NEXT 7 DAYS" section when we
   have it (paid full report); otherwise everyone gets a solid fixed starter.

   One day unlocks per calendar day from plan_started_at. Pure functions only,
   so the same lead + clock always produce the same board. */

export interface PlanTask { text: string; done: boolean }
export interface PlanDay { day: number; title: string; tasks: PlanTask[]; unlocked: boolean; unlockAt: string }
export interface Plan { startedAt: string; unlockedDay: number; days: PlanDay[] }

export const PLAN_LENGTH = 7
const DAY_MS = 24 * 60 * 60 * 1000

/* Fixed starter used for free-tier leads (no personalised plan yet) and as a
   fallback whenever the report can't be parsed into 7 clean days. */
const FIXED_PLAN: { title: string; task: string }[] = [
  { title: 'Get clear on your premium offer', task: 'Write down your top 3 areas of expertise and the one transformation you help people achieve.' },
  { title: 'Define your ideal client', task: 'Describe your ideal client in detail: their situation, their biggest frustration, and the outcome they want.' },
  { title: 'Write your origin story', task: 'In 2 to 3 short paragraphs, write how you gained your expertise and why it matters to the people you serve.' },
  { title: 'Shape your signature offer', task: 'Outline what your offer includes, how it is delivered, how long it runs, and a price you feel good about.' },
  { title: 'Show up once', task: 'Write and post one short, honest story that demonstrates your expertise to the people you want to help.' },
  { title: 'Start real conversations', task: 'Reach out personally to 3 people who might need your help, with a genuine question, not a pitch.' },
  { title: 'Make one clear invitation', task: 'Invite one person who is a good fit to take the next step with you.' },
]

/* Pull the 7 daily actions out of the report's "## YOUR NEXT 7 DAYS" section.
   Each line looks like "- Day 1: do this specific thing." Returns null unless we
   recover a full, clean set of 7 so we never show a half-personalised board. */
export function parsePlanFromRoadmap(roadmap: string | null | undefined): { title: string; task: string }[] | null {
  if (!roadmap || typeof roadmap !== 'string') return null
  const m = roadmap.match(/##\s*YOUR NEXT 7 DAYS\s*([\s\S]*?)(?:\n##\s|$)/i)
  if (!m) return null
  const found: Record<number, string> = {}
  for (const raw of m[1].split('\n')) {
    const line = raw.trim().replace(/^[-*•]\s*/, '')
    const dm = line.match(/^Day\s*(\d)\s*[:.\-]\s*(.+)$/i)
    if (dm) {
      const n = parseInt(dm[1], 10)
      const text = dm[2].replace(/\*\*/g, '').trim()
      if (n >= 1 && n <= PLAN_LENGTH && text) found[n] = text
    }
  }
  const out: { title: string; task: string }[] = []
  for (let n = 1; n <= PLAN_LENGTH; n++) {
    if (!found[n]) return null
    out.push({ title: `Day ${n}`, task: found[n] })
  }
  return out
}

/* Build the full board: pick the source (personalised or fixed), compute which
   days are unlocked from startedAt, and merge in the saved completion state. */
export function buildPlan(opts: {
  roadmap?: string | null
  startedAt: string
  progress?: Record<string, Record<string, boolean>> | null
  now?: number
}): Plan {
  const source = parsePlanFromRoadmap(opts.roadmap) || FIXED_PLAN
  const start = new Date(opts.startedAt).getTime()
  const now = opts.now ?? Date.now()
  const elapsedDays = Math.max(0, Math.floor((now - start) / DAY_MS))
  const unlockedDay = Math.min(PLAN_LENGTH, elapsedDays + 1)
  const progress = opts.progress || {}

  const days: PlanDay[] = source.slice(0, PLAN_LENGTH).map((d, idx) => {
    const day = idx + 1
    const dayProg = progress[String(day)] || {}
    const taskTexts = [d.task]
    return {
      day,
      title: d.title,
      tasks: taskTexts.map((text, i) => ({ text, done: !!dayProg[String(i)] })),
      unlocked: day <= unlockedDay,
      unlockAt: new Date(start + (day - 1) * DAY_MS).toISOString(),
    }
  })

  return { startedAt: new Date(start).toISOString(), unlockedDay, days }
}

/* The current unlocked day for a given start time — used by the daily email
   cron to decide whether a new day just opened. */
export function currentUnlockedDay(startedAt: string, now = Date.now()): number {
  const start = new Date(startedAt).getTime()
  if (!Number.isFinite(start)) return 1
  return Math.min(PLAN_LENGTH, Math.max(0, Math.floor((now - start) / DAY_MS)) + 1)
}

/* The single headline task for a day (for the daily unlock email). */
export function taskForDay(roadmap: string | null | undefined, day: number): string {
  const source = parsePlanFromRoadmap(roadmap) || FIXED_PLAN
  const d = source[day - 1]
  return d ? d.task : ''
}
