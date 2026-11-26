/* Lightweight A/B testing for funnel pages.

   - Visitors are bucketed once, in proxy.ts, into a first-party cookie
     (`a5_exp`), so the SERVER can render the right variant on the first paint
     (no flicker, no layout shift, no client-side swapping).
   - Every tracked event carries the visitor's bucket (see app/book/funnel.ts),
     so any metric can be split by variant in /admin/funnel.
   - Add an experiment by adding a key here. Remove one by deleting it: unknown
     keys in old cookies are ignored.
   - QA / forcing a variant: /book?exp=headline:pain,cta:book,theme:dark */

export const EXPERIMENTS = {
  /* Headline: the control states the outcome; the challenger leads with value. */
  headline: ['control', 'value'],
  /* CTA wording. */
  cta: ['access', 'book'],
  /* Colour system: 'hybrid' = dark hero/CTA bands with light reading sections
     (higher readability for a 40+ audience); 'dark' = the original all-dark page. */
  theme: ['hybrid', 'dark'],
} as const

export type ExpKey = keyof typeof EXPERIMENTS
export type Assignment = { [K in ExpKey]: (typeof EXPERIMENTS)[K][number] }
export const EXP_COOKIE = 'a5_exp'
export const EXP_HEADER = 'x-a5-exp'

export const DEFAULTS: Assignment = { headline: 'control', cta: 'access', theme: 'hybrid' }

export function serialize(a: Assignment): string {
  return (Object.keys(EXPERIMENTS) as ExpKey[]).map((k) => `${k}:${a[k]}`).join(',')
}

/* Parse "headline:value,cta:book" into a full, valid assignment. Anything
   missing or unknown falls back to the default for that experiment. */
export function parse(raw: string | null | undefined): Assignment {
  const out: Assignment = { ...DEFAULTS }
  if (!raw) return out
  for (const part of raw.split(',')) {
    const [k, v] = part.split(':')
    if (k in EXPERIMENTS && (EXPERIMENTS[k as ExpKey] as readonly string[]).includes(v)) (out as Record<string, string>)[k] = v
  }
  return out
}

export const isComplete = (raw: string | null | undefined): boolean =>
  !!raw && (Object.keys(EXPERIMENTS) as ExpKey[]).every((k) => new RegExp(`(^|,)${k}:`).test(raw))

/* Random 50/50 assignment (equal split across each experiment's variants). */
export function assign(rand: () => number = Math.random): Assignment {
  const a = { ...DEFAULTS } as Record<string, string>
  for (const k of Object.keys(EXPERIMENTS) as ExpKey[]) {
    const v = EXPERIMENTS[k] as readonly string[]
    a[k] = v[Math.floor(rand() * v.length)]
  }
  return a as unknown as Assignment
}
