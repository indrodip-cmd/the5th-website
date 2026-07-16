/* Copy + integration config for the Make-$10k VSL funnel. Kept in one place so
   the page stays in sync and non-devs can tune the offer.

   Video + Typeform are env-driven so they can change without a code deploy:
     NEXT_PUBLIC_VSL_VIDEO_URL      YouTube or Vimeo URL/ID for the VSL
     NEXT_PUBLIC_VSL_REVEAL_SECONDS seconds of watch-time before the CTA unlocks (default 600)
     NEXT_PUBLIC_TYPEFORM_FORM_ID   Typeform form id for "Book a call" (default u9maum7Y)
*/

export const OPT_IN = {
  eyebrow: 'A Free 12-Minute Training · For Coaches & Consultants',
  headline: 'The Exact System 76 Coaches Used to Turn Expertise Into Their First $10K, $50K, Even $210K Months',
  sub: 'The same 3-part framework behind Torill’s $210K launch, Laurie’s $14,193 in 60 days, and Gurpreet’s $18K turnaround — built for coaches and consultants who already have the expertise, just not the system to price and sell it.',
  // Overlay label on the video poster (the primary conversion element).
  playLabel: 'Watch the Free Training',
  playNote: '12 minutes · Free · Watch instantly',
  // Explicit CTA button below the video (also opens the gate).
  ctaButton: 'Watch the 12-Minute Training →',
  ctaMicro: '12 minutes · Free · No credit card · Watch instantly',
  // Social-proof strip (mirrors /quiz — real client photos + rating).
  rating: { score: '4.8', text: 'from 76 coaches & experts across 12 nations' },
  proofEyebrow: 'Results From the 10K Roadmap',
  proofHeading: 'Real experts. Real expertise. Real revenue.',
  proofDisclaimer: 'Case studies shown reflect real client outcomes; individual results are not typical.',
  // Narrative "what this is" block (secondary, below the proof).
  narrative: [
    'There’s a specific moment when a coaching business stops feeling like guesswork.',
    'It’s not a new niche. It’s not a new offer. It’s a shift in how you see the business you already have.',
    'This 12-minute training walks through the exact reframe our clients go through — the one that changes how they price, how they talk about what they do, and how prospects respond to them.',
  ],
  checklistTitle: 'Inside the training',
  bullets: [
    'Why most coaching businesses are one repositioning shift away from feeling completely different',
    'The invisible mistake keeping experts stuck explaining instead of selling',
    'What changes the moment you see your business the way your best clients already do',
  ],
  narrativeClose: '12 minutes. Free. Watch instantly.',
}

/* The click-to-play gate: shown as a popup when the visitor clicks the video. */
export const MODAL = {
  eyebrow: 'One Step to Begin',
  title: 'Where should we send your training?',
  sub: 'Enter your details and the training begins playing right away.',
  cta: 'Watch the Training →',
  microtrust: 'Instant access. No spam, ever. Your details stay private.',
}

export const WATCH = {
  // Copy revealed once the reveal threshold of watch-time is reached.
  reveal: {
    eyebrow: 'YOU’RE READY FOR THE NEXT STEP',
    headline: 'Let’s Map Your Path to $10K Months — Together',
    body: 'You’ve seen the system. On a free, no-pressure call we’ll look at your specific expertise, pinpoint the fastest path to your first (or next) $10K month, and show you exactly what to do next. Spots are limited each week.',
    points: [
      'A personalised look at your offer and pricing',
      'The #1 thing standing between you and $10K months',
      'A clear, doable 90-day plan — whether or not we work together',
    ],
    ctaLabel: 'Book My Free Strategy Call →',
    reassure: 'Free · 30 minutes · No obligation',
  },
  // Shown before the CTA unlocks, so visitors know the button is coming.
  lockedHint: 'Stay with the training — your invitation to book a call will appear here shortly.',
}

/* ── REAL social proof ──────────────────────────────────────────────────────
   Every entry below is pulled verbatim from case studies ALREADY published
   publicly on the5th.consulting:
     • public/call/index.html   (detailed case-study cards — Torill, Laurie, Gurpreet)
     • public/index.html        (homepage testimonial ticker — Jeanne, Angela)
   First names only (consent already exercised on the live site). No numbers,
   ratings or names have been invented. See docs/make-10k-vsl-funnel.md for the
   flagged cross-page discrepancies (Laurie / Angela figures) to reconcile. */
export type Proof = { name: string; role: string; result: string; quote: string; photo?: string }

export const REAL_PROOF: Proof[] = [
  {
    name: 'Torill',
    role: 'Leadership Coach · returned after a 15-year absence',
    result: '$210,000 from a single launch',
    quote: 'Came back with no current audience — we structured a $7,000 program and turned her reputation into revenue.',
    photo: '/clients/toril.jpg',
  },
  {
    name: 'Laurie',
    role: 'Dating Coach · TEDx speaker',
    result: '$14,193 in her first 60 days',
    quote: 'Repositioned from $79 to $249 — 57 buyers and a 600-strong community within two months.',
    photo: '/clients/laurie.jpg',
  },
  {
    name: 'Angela',
    role: '10K Roadmap Accelerator',
    result: '$12,000 in 9 weeks',
    quote: '“I had never earned that from my own business in my life. The framework works if you work it.”',
    photo: '/clients/angela.jpg',
  },
  {
    name: 'Jeanne',
    role: '10K Roadmap Accelerator',
    result: '$8,000 in 8 weeks',
    quote: '“Eight weeks later I had closed my first two clients and was earning more than I ever imagined possible.”',
    photo: '/clients/jeanne.jpg',
  },
  {
    name: 'Gurpreet',
    role: 'Coach · started from $0',
    result: '$18,000 in 3 months',
    quote: 'Arrived close to giving up after $16,000 spent elsewhere. We stripped it back to a clear offer and a simple system.',
  },
]

export function videoConfig() {
  const url = process.env.NEXT_PUBLIC_VSL_VIDEO_URL || ''
  return { url }
}

export function typeformFormId(): string {
  return process.env.NEXT_PUBLIC_TYPEFORM_FORM_ID || 'u9maum7Y'
}

export function revealSecondsClient(): number {
  const v = Number(process.env.NEXT_PUBLIC_VSL_REVEAL_SECONDS)
  return Number.isFinite(v) && v > 0 ? Math.floor(v) : 600
}
