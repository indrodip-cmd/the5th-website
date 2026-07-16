/* Copy + integration config for the Make-$10k VSL funnel. Kept in one place so
   the page stays in sync and non-devs can tune the offer.

   Video + Typeform are env-driven so they can change without a code deploy:
     NEXT_PUBLIC_VSL_VIDEO_URL      YouTube or Vimeo URL/ID for the VSL
     NEXT_PUBLIC_VSL_REVEAL_SECONDS seconds of watch-time before the CTA unlocks (default 600)
     NEXT_PUBLIC_TYPEFORM_FORM_ID   Typeform form id for "Book a call" (default u9maum7Y)
*/

export const OPT_IN = {
  eyebrow: 'A Free 12-Minute Training · For Coaches & Consultants',
  headline: 'The 12-Minute Training That Changes How You See Your Own Coaching Business',
  // Ad-facing copy: the "internal-shift" mechanism, no income claims / no
  // viewer-status language (keeps the Meta ad + landing page review-safe).
  sub: 'It’s not a new niche or a new offer. It’s a shift in how you see the business you already have — the same reframe behind how our clients price their work, talk about what they do, and get the right people to say yes.',
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

/* Legal / compliance copy (earnings disclaimer + Meta non-affiliation). Shown
   in the footer so the funnel is safe to run on Meta ads. */
export const LEGAL = {
  earnings:
    'This training is educational and makes no guarantee of income or results. The case studies shown are the real experiences of specific clients — they are not a promise or representation that you will achieve the same or similar outcomes. Most people who watch a free training take no action; results depend on your experience, effort, offer, market and factors outside our control.',
  meta:
    'This site is not a part of the Facebook or Instagram website or Meta Platforms, Inc. Additionally, this site is not endorsed by Meta in any way. FACEBOOK and INSTAGRAM are trademarks of Meta Platforms, Inc.',
  links: [
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms', href: '/terms' },
    { label: 'Disclaimer', href: '/disclaimer' },
  ],
}

/* The click-to-play gate: shown as a popup when the visitor clicks the video. */
export const MODAL = {
  eyebrow: 'One Step to Begin',
  title: 'Where should we send your training?',
  sub: 'Enter your details and we’ll take you straight to the training.',
  cta: 'Take Me to the Training →',
  microtrust: 'Instant access. No spam, ever. Your details stay private.',
  phoneNote: 'We’ll only call if you book — never spam.',
}

export const WATCH = {
  eyebrow: 'Your Free Training Is Playing',
  headline: 'Watch the Training',
  // Commitment device — leaving restarts the training.
  warning: 'Please don’t close or refresh this tab — if you leave, the training starts over from the beginning.',
  // Shown before the CTA unlocks, so visitors know the button is coming.
  lockedHint: 'Stay with it — the part that makes everything click is coming up.',
  // Copy revealed once the reveal threshold of watch-time is reached. Content
  // adapted from the /call page offer.
  reveal: {
    eyebrow: 'Your Private Invitation',
    headline: 'This Isn’t a Sales Call. It’s a Real Working Session.',
    body: 'You’ve seen the system. Now let’s apply it to you. On a free call, Indrodip will map your exact roadmap to your next $10K month — and you’ll leave with a concrete plan, whether or not we ever work together.',
    pointsTitle: 'On your call, we’ll:',
    points: [
      'Look closely at your offer — what you sell, to whom, and for how much',
      'Uncover the quiet money beliefs shaping your decisions',
      'Pinpoint the one bottleneck holding you back right now',
      'Give you specific actions for the next 30 days to start creating income',
    ],
    fitLine: 'And if we decide we’re not the right fit? You’ll still walk away with insight worth far more than the hour you spent.',
    quote: '“That one call was worth more than a $10,000 mastermind.”',
    quoteBy: 'Jeanne · after her conversation with Indrodip',
    host: 'Led by Indrodip Ghosh — who has advised Fortune 500 leaders and billion-dollar companies. $15M+ generated by clients across 12 countries.',
    ctaLabel: 'Book My Free Call →',
    reassure: 'Free · 45 minutes · A plan, not a pitch',
  },
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
  return Number.isFinite(v) && v > 0 ? Math.floor(v) : 300 // 5:00
}
