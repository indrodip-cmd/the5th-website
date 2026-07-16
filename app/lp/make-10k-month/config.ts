/* Copy + integration config for the Make-$10k VSL funnel. Kept in one place so
   the opt-in and watch pages stay in sync and non-devs can tune the offer.

   Video + Typeform are env-driven so they can change without a code deploy:
     NEXT_PUBLIC_VSL_VIDEO_URL      YouTube or Vimeo URL/ID for the VSL
     NEXT_PUBLIC_VSL_REVEAL_SECONDS seconds of watch-time before the CTA unlocks (default 600)
     NEXT_PUBLIC_TYPEFORM_FORM_ID   Typeform form id for "Book a call" (default u9maum7Y)
*/

export const OPT_IN = {
  eyebrow: 'FREE TRAINING · FOR EXPERTS, COACHES & CONSULTANTS 40+',
  headline: 'How Women Over 40 Are Turning Decades of Expertise Into a Predictable $10K a Month',
  sub: 'Watch the free training and get the exact 3-part system — no cold DMs, no funnel-hacking, no chasing. Just your experience, packaged and priced so the right clients say yes.',
  bullets: [
    'The offer structure that makes a $10K month feel inevitable — not lucky',
    'Why “post more content” keeps you invisible (and what actually fills your calendar)',
    'The simple daily rhythm that fits around your real life, not the other way around',
  ],
  ctaLabel: 'Watch the Free Training →',
  microtrust: 'Instant access. No spam, ever. Your details stay private.',
}

export const WATCH = {
  eyebrow: 'YOUR FREE TRAINING IS READY',
  headline: 'Watch This Before We Speak',
  sub: 'Give it your full attention — everything you need to see how a $10K month works for someone with your experience is in here.',
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
