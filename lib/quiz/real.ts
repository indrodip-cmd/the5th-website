/* Real client data used inside the assessment.
   Every figure below is a published result already shown on
   the5thglobal.consulting/results and in app/10k-roadmap/config.ts (REAL_PROOF).
   Nothing is estimated or invented. Individual results vary. */
import type { Niche } from './content'

export interface Case {
  name: string
  role: string
  amount: number        // USD, the figure the client reported
  plus?: boolean        // published as "$X+"
  when: string          // as published
  niches: Niche[]
}

export const CASES: Case[] = [
  { name: 'Torill', role: 'Leadership coach, back after 15 years', amount: 210000, when: '3 months', niches: ['career', 'business'] },
  { name: 'Shyama', role: 'Ex-Fortune 500 CEO turned consultant', amount: 180000, when: '5 months', niches: ['business', 'career'] },
  { name: 'Abbas', role: 'Executive and conscious-living coach', amount: 21000, plus: true, when: '2 months', niches: ['career', 'mindset', 'spiritual'] },
  { name: 'Bharti', role: 'Couples and marriage retreats', amount: 18000, plus: true, when: 'one challenge', niches: ['relationships', 'spiritual', 'wellness'] },
  { name: 'Gurpreet', role: 'Self-development coach', amount: 18000, when: '3 months', niches: ['mindset', 'spiritual'] },
  { name: 'Amalia', role: 'Fitness coach and army veteran', amount: 16000, when: '5 months', niches: ['wellness'] },
  { name: 'Laurie', role: 'Dating coach for professionals 50+', amount: 14193, when: '60 days', niches: ['relationships', 'mindset'] },
  { name: 'Maham', role: 'Personal branding coach', amount: 12000, when: '2 months', niches: ['business', 'creative'] },
  { name: 'Angela', role: '10K Roadmap client', amount: 12000, when: '63 days', niches: ['mindset', 'creative', 'money'] },
  { name: 'Max', role: 'Divorce coach for men', amount: 9000, when: '3.5 months', niches: ['relationships'] },
  { name: 'Jeanne', role: '10K Roadmap client', amount: 8000, when: '56 days', niches: ['mindset', 'wellness', 'creative'] },
  { name: 'Susan', role: 'Personal finance coach', amount: 8000, when: '3 months', niches: ['money'] },
]

/** Up to `n` real cases closest to the visitor's niche, padded with the strongest others. */
export function casesFor(niche: Niche, n = 4): Case[] {
  const hit = CASES.filter((c) => c.niches.includes(niche))
  const rest = CASES.filter((c) => !c.niches.includes(niche))
  return [...hit, ...rest].slice(0, n)
}

/** Headline numbers published on the site. */
export const SITE_FACTS = { revenue: '$15M+', clients: 79, nations: 12, avgDaysToFirstClient: 90 }
