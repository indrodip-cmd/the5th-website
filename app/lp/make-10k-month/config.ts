/* Copy + integration config for the Make-$10k VSL funnel. Kept in one place so
   the page stays in sync and non-devs can tune the offer.

   Video + Typeform are env-driven so they can change without a code deploy:
     NEXT_PUBLIC_VSL_VIDEO_URL      YouTube or Vimeo URL/ID for the VSL
     NEXT_PUBLIC_VSL_REVEAL_SECONDS seconds of watch-time before the CTA unlocks (default 600)
     NEXT_PUBLIC_TYPEFORM_FORM_ID   Typeform form id for "Book a call" (default u9maum7Y)
*/

export const OPT_IN = {
  eyebrow: 'Free 12-Minute Strategy Training · For Coaches & Consultants',
  // Positioning: what an expensive strategist would tell you — free, in 12 min.
  // (Value anchor, NOT an income claim — keeps the Meta ad review-safe.)
  headline: 'What a $2,000 strategist would tell you about your coaching business.',
  subhead: 'Free, in 12 minutes.',
  sub: 'You don’t need another marketing strategy. You need to see what’s actually keeping your expertise from becoming a business people are willing to pay for. In this short training, you’ll discover the positioning shift that can change how you package your expertise, communicate your value, and turn the right prospects into paying clients.',
  // Overlay label on the video poster (the primary conversion element).
  playLabel: 'Watch the Free Training',
  playNote: '12 minutes · Free · Watch instantly',
  // Explicit CTA button below the video (also opens the gate).
  ctaButton: 'Watch the Free Training →',
  ctaMicro: '12 minutes · Free · No credit card · Watch instantly',
  // Social-proof strip (mirrors /quiz — real client photos + rating).
  rating: { score: '4.8', text: 'from 76 coaches across 12 nations' },
  trustStatement: 'Trusted by coaches, consultants & experts building businesses around what they already know.',
  proofEyebrow: 'Results From the 10K Roadmap',
  proofHeading: 'Real experts. Real expertise. Real revenue.',
  proofDisclaimer: 'Case studies shown reflect real client outcomes; individual results are not typical.',
}

/* Full page copy for the conversion-focused sections (in reading order).
   Tunable by non-devs; the component maps 1:1 onto these blocks. */
export const LP = {
  heroSupporting: [
    'You don’t need another marketing strategy.',
    'You need to see what’s actually keeping your expertise from becoming a business people are willing to pay for.',
    'In this short training, you’ll discover the positioning shift that can change how you package your expertise, communicate your value, and turn the right prospects into paying clients.',
  ],
  problem: {
    heading: 'You probably don’t need more knowledge.',
    body: [
      'You already know a lot. You’ve spent years building expertise, helping people, solving problems, and becoming genuinely good at what you do.',
      'So why does turning that expertise into a consistent coaching business still feel harder than it should?',
      'Because expertise alone doesn’t create demand. The market has to understand:',
    ],
    questions: ['Why you?', 'Why this?', 'Why now?', 'And why is it worth paying you for?'],
    after: 'When those answers aren’t clear, you can have an incredible background and still struggle with inconsistent leads, low confidence in your offer, and prospects who say “Let me think about it.”',
    transition: 'This 12-minute training shows you where that disconnect happens.',
  },
  discover: {
    heading: 'In 12 minutes, you’ll see what most coaches spend months trying to figure out.',
    items: [
      { n: '01', title: 'The real reason expertise doesn’t automatically sell', body: 'Why being highly qualified can actually make your marketing harder — and what to do instead.' },
      { n: '02', title: 'The invisible positioning mistake', body: 'The subtle way coaches describe what they do that makes prospects interested but not ready to buy.' },
      { n: '03', title: 'The shift that makes your offer easier to sell', body: 'How to move from “Here’s what I do” to a message built around what your ideal client actually wants to solve.' },
      { n: '04', title: 'Why more content isn’t always the answer', body: 'Why posting more, creating more lead magnets, or learning another tactic won’t fix a fundamentally unclear offer.' },
      { n: '05', title: 'What your business needs to focus on next', body: 'How to identify the highest-leverage change instead of trying to fix everything at once.' },
    ],
  },
  objection: {
    heading: 'This isn’t another 60-minute marketing masterclass.',
    nots: ['No 47-step funnel.', 'No complicated tech stack.', 'No “post three times a day.”', 'No motivational speech disguised as strategy.', 'And no giant course you’ll never finish.'],
    lead: 'It’s 12 minutes.',
    ones: ['One idea.', 'One strategic shift.', 'One different way of looking at the coaching business you already have.'],
    emphasis: ['You may walk away realizing that the problem isn’t that you need to become a better marketer.', 'You may simply have been marketing the wrong thing.'],
  },
  resultsTransition: {
    small: 'The point isn’t their numbers.',
    big: 'It’s what happened before the numbers.',
    body: ['They stopped trying to become someone else.', 'They learned how to position what they already knew.'],
  },
  founder: {
    heading: 'Strategy that’s been tested far beyond the coaching industry.',
    body: [
      'I’ve spent my career working at the intersection of marketing, positioning, sales, funnels, and business strategy. I’ve advised Fortune 500 executives, billion-dollar companies, celebrity coaches, and organizations operating at the highest level.',
      'But The5th wasn’t built to help big companies become bigger. It was built around a much more interesting problem:',
      'Why do highly experienced people often struggle to monetize the very expertise that took them decades to build?',
      'I’ve seen that problem repeatedly. And I’ve built this training to help you see the part of your business you may be missing.',
    ],
    name: 'Indrodip Ghosh',
    title: 'Founder, The5th Consulting',
  },
  whoFor: {
    heading: 'This training is for you if…',
    forItems: [
      'You have real expertise but struggle to turn it into a clear, premium offer.',
      'You know you can help people, but your marketing doesn’t communicate your value.',
      'You’re tired of creating content without knowing whether it’s actually moving your business forward.',
      'You want premium clients — not thousands of followers.',
      'You’ve bought courses, tried strategies, consumed content, and still don’t have a simple path to consistent clients.',
      'You want to build a business around your expertise without becoming a full-time marketer.',
    ],
    notHeading: 'And it probably isn’t for you if…',
    notItems: [
      'You’re looking for a get-rich-quick shortcut.',
      'You don’t have meaningful expertise or experience to build on.',
      'You want someone else to build your business while you do nothing.',
    ],
    close: 'This training is for people who are ready to stop guessing and start seeing their business clearly.',
  },
  how: {
    heading: 'Getting the training takes less than a minute.',
    steps: [
      { n: '01', title: 'Click', body: 'Click “Watch the Free Training.”' },
      { n: '02', title: 'Get access', body: 'Enter your details. No credit card. No complicated application.' },
      { n: '03', title: 'Watch', body: 'Spend 12 minutes with me and see the strategic shift for yourself.' },
    ],
    close: 'That’s it.',
  },
  midCta: {
    heading: 'Give me 12 minutes.',
    body: 'I’ll show you what may be missing between your expertise and the clients you want.',
  },
  testimonialsHeading: 'Don’t take my word for it.',
  secondObjection: {
    heading: 'You don’t need another year of trial and error.',
    body: ['You may already have the experience, knowledge, and expertise you need.', 'You just haven’t seen how to position it yet.'],
  },
  finalCta: {
    heading: 'What would change if you finally saw your business clearly?',
    body: ['Give me 12 minutes.', 'I’ll show you the shift.'],
  },
  finalTrust: {
    heading: 'Built from real-world strategy, not internet theory.',
    privacy: 'Free & private · No credit card · We never sell your information',
  },
}

/* "As featured in" press strip (mirrors the /call page — styled wordmarks). */
export const PRESS = {
  label: 'Our clients have been featured in',
  items: ['Forbes', 'The New York Times', 'HuffPost', 'TEDx', 'The Guardian', 'Yahoo Finance'],
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
  phoneNote: 'Optional — add it with your country code and we’ll only call if you book.',
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
