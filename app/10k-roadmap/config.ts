/* ─────────────────────────────────────────────────────────────────────────
   The $10K Roadmap Audit, funnel configuration.

   ALL copy, the design tokens, and the qualification / deep-diagnostic
   question sets live here so the psychology can be tuned aggressively later
   WITHOUT touching the funnel plumbing (Go-with-A: modular copy + logic on top
   of a stable system). Non-devs can edit strings; the verdict logic reads the
   `reject` flags on options so routing stays in sync with the copy.

   Video is env-driven so it can change without a deploy:
     NEXT_PUBLIC_AUDIT_VIDEO_URL   YouTube / Vimeo / mp4 URL for the VSL
   Payment reuses the existing Whop infra:
     NEXT_PUBLIC_WHOP_AUDIT_PLAN_ID  $27 "commitment deposit" plan id
   ───────────────────────────────────────────────────────────────────────── */

/* ── Design tokens ─────────────────────────────────────────────────────────
   Light, premium, high-authority, a $10K+ advisory aesthetic. White/cream
   environment, deep plum-ink typography, restrained PURPLE accent (the brand
   plum family, not gold). Original site display serif is Cormorant Garamond
   (used across /results + case studies). The psychology comes from the copy +
   structure, not from a dark interface. */
export const T = {
  bg: '#ffffff',
  surface: '#FAF6F0',      // cream, section separation / cards
  surface2: '#FBF8F2',
  line: 'rgba(46,26,53,0.12)',
  lineStrong: 'rgba(46,26,53,0.22)',
  text: '#2E1A35',         // plum-ink, headings + primary copy (reads near-black)
  text2: '#645a6e',        // muted body
  text3: '#9a93a2',        // faint / captions
  accent: '#5E2E86',       // brand purple (CTA fills, play buttons, badges)
  accentInk: '#5E2E86',    // purple for emphasis text on white (AA)
  accentSoft: 'rgba(94,46,134,0.12)',
  brand: '#2E1A35',        // plum, primary brand colour
  danger: '#c0392b',
  radius: 16,
  // Original site display serif (used across /results + case studies).
  serif: "'Cormorant Garamond', Georgia, 'Times New Roman', serif",
  sans: "system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
} as const

export function videoUrl(): string {
  return process.env.NEXT_PUBLIC_AUDIT_VIDEO_URL || ''
}
export function auditPlanId(): string {
  return process.env.NEXT_PUBLIC_WHOP_AUDIT_PLAN_ID || 'plan_85pIPWE1K0uBB'
}

/* The Whop hosted checkout page qualified applicants are sent to for the $27
   commitment deposit. Configure Whop's post-payment redirect to send buyers to
   https://the5th.consulting/10k-roadmap/reserved (the post-payment page). */
export const AUDIT_CHECKOUT_URL = 'https://whop.com/checkout/plan_85pIPWE1K0uBB'

export const DEPOSIT = { amount: 27, label: '$27', currency: 'USD' } as const

/* Social-proof rating (mirrors the /quiz + free-training funnel — real figure). */
export const RATING = { score: '4.8', text: 'from 76 coaches across 12 nations' }

/* "As featured in" press strip (styled wordmarks — same set as the /call page). */
export const PRESS = {
  label: 'Our clients have been featured in',
  items: ['Forbes', 'The New York Times', 'HuffPost', 'TEDx', 'The Guardian', 'Yahoo Finance'],
}

/* ── Landing copy ──────────────────────────────────────────────────────────*/
export const LANDING = {
  eyebrow: 'For Coaches & Consultants 40+',
  // Hero headline is rendered in parts so the guarantee phrase carries the
  // brand-purple emphasis. Largest element on the page.
  headlineLead: 'Build a Predictable $10K/Month Business, or Get ',
  headlineEmphasis: '100% of Your Money Back.',
  sub: 'Find the bottleneck keeping your coaching or consulting business from consistent $10K months, and get the strategy to fix it.',
  guaranteeBadge: '100% Money-Back Guarantee',
  ctaPrimary: 'See If You Qualify',
  ctaMicro: '2-minute qualification · $27 commitment deposit if invited',
  ctaMicroShort: '2-minute qualification',

  // Recognition → tension, directly under the VSL.
  recognition: {
    lines: [
      'You’ve probably tried the obvious things.',
      'More content. More followers. Another funnel. Another course.',
      'And somehow the revenue is still unpredictable.',
    ],
    turn: 'That’s usually not a motivation problem.',
    turn2: 'It’s a ',
    turn2Emphasis: 'bottleneck problem.',
  },

  proof: {
    heading: 'Don’t take my word for it.',
    sub: 'Watch what happened when other experts fixed the bottleneck.',
    disclaimer: 'Real client outcomes. Individual results are not typical and depend on your offer, market and effort.',
  },

  afterProof: {
    big: 'Your problem probably isn’t that you need more information.',
    line: 'You need to know what to fix first.',
    cta: 'See If You Qualify',
  },

  forYou: {
    heading: 'This is for you if…',
    yes: [
      'You already have expertise people pay for.',
      'You already have a coaching or consulting business.',
      'Revenue is inconsistent or stuck below your target.',
      'You want a predictable path to $10K/month.',
      'You’re willing to implement.',
    ],
    notHeading: 'This isn’t for you if…',
    no: [
      'You’re still looking for your first business idea.',
      'You want someone to magically build the business for you.',
      'You’re unwilling to change what’s not working.',
      'You’re only looking for free advice.',
    ],
  },

  mechanism: {
    heading: 'There is usually a bottleneck somewhere in this chain.',
    sub: 'The audit is about finding it.',
    chain: ['Positioning', 'Offer', 'Lead Generation', 'Sales', 'Conversion', 'Repeatable Acquisition'],
  },

  // Dedicated risk-reversal section, a major trust signal, not buried.
  guarantee: {
    heading: 'You’re Not Taking The Risk Alone.',
    badge: '100% Money-Back Guarantee',
    intro: 'The $27 is a commitment deposit to reserve a private audit slot, not the price of the advice. It simply filters for people who are serious about solving the problem.',
    // Accurate refund terms supplied by the owner. No invented guarantees.
    terms: [
      'If I determine you’re genuinely unqualified for the process, your deposit is refunded.',
      'The strategy from your audit is meant to be implemented. If you genuinely implement it and it doesn’t work within the stated 30-day period, you may request a refund per the official refund policy.',
    ],
    policyLabel: 'Read the full refund policy',
    policyHref: '/data-usage',
  },

  faq: [
    { q: 'What happens on the audit?', a: '45 minutes. We’ll examine your positioning, offer, lead generation, sales and conversion path, identify the bottleneck and map the strategy I’d recommend.' },
    { q: 'Why is there a $27 deposit?', a: 'Because this is a private strategy session, not a free consultation. The deposit helps reserve the session for people who are serious about solving the problem.' },
    { q: 'What if I’m not a fit?', a: 'If I determine that you’re genuinely unqualified for the process, your deposit is refunded.' },
  ],

  finalCta: {
    heading: 'Stop Guessing. Find The Bottleneck.',
    sub: 'Build a predictable path to $10K/month, with a 100% money-back guarantee.',
    cta: 'See If You Qualify',
    micro: '2-minute qualification',
  },

  nav: [
    { label: 'How It Works', href: '#how' },
    { label: 'Proof', href: '#proof' },
    { label: 'FAQ', href: '#faq' },
  ],
}

/* ── Real social proof ─────────────────────────────────────────────────────
   Verbatim from case studies ALREADY published on the5th.consulting
   (public/call, public/index.html). First names only (consent already
   exercised on the live site). No numbers/names invented. */
export type Proof = { name: string; role: string; result: string; quote: string; photo?: string }
export const REAL_PROOF: Proof[] = [
  // Torill's photo is intentionally omitted, no consent to use her image
  // (mirrors the case-study page). The card renders a branded monogram instead.
  { name: 'Torill', role: 'Leadership Coach · returned after 15 years', result: '$210,000 from a single launch', quote: 'Came back with no current audience, we structured a $7,000 program and turned her reputation into revenue.' },
  { name: 'Laurie', role: 'Dating Coach · TEDx speaker', result: '$14,193 in her first 60 days', quote: 'Repositioned from $79 to $249, 57 buyers and a 600-strong community within two months.', photo: '/clients/laurie.jpg' },
  { name: 'Angela', role: '10K Roadmap Accelerator', result: '$12,000 in 9 weeks', quote: '“I had never earned that from my own business in my life. The framework works if you work it.”', photo: '/clients/angela.jpg' },
  { name: 'Jeanne', role: '10K Roadmap Accelerator', result: '$8,000 in 8 weeks', quote: '“Eight weeks later I had closed my first two clients and was earning more than I ever imagined possible.”', photo: '/clients/jeanne.jpg' },
]

/* ── Qualification screen (pre-payment) ────────────────────────────────────*/
export const QUALIFY = {
  eyebrow: 'Private Advisory · 2-minute qualification',
  intro: 'A few quick questions so we only invite people the audit can genuinely help.',
}

/* ── Question model ────────────────────────────────────────────────────────
   `reject: true` on an option routes to /10k-roadmap/not-a-fit. `key` is the
   column we denormalise into the lead for admin filtering. */
export type Opt = { value: string; label: string; reject?: boolean }
export type Q =
  | { id: string; key?: string; type: 'single'; prompt: string; helper?: string; options: Opt[] }
  | { id: string; key?: string; type: 'multi'; prompt: string; helper?: string; options: Opt[] }
  | { id: string; key?: string; type: 'scale'; prompt: string; helper?: string; min: number; max: number; minLabel: string; maxLabel: string }
  | { id: string; key?: string; type: 'text'; prompt: string; helper?: string; placeholder?: string; long?: boolean }

export const QUALIFICATION: Q[] = [
  {
    id: 'business_type', key: 'business_type', type: 'single',
    prompt: 'What best describes what you do?',
    options: [
      { value: 'coach', label: 'I’m a coach' },
      { value: 'consultant', label: 'I’m a consultant' },
      { value: 'both', label: 'I’m both a coach and consultant' },
      { value: 'expert', label: 'I run another type of expert / service business' },
      { value: 'none', label: 'I’m not currently running a business', reject: true },
    ],
  },
  {
    id: 'revenue', key: 'revenue', type: 'single',
    prompt: 'What best describes your current average monthly revenue?',
    // Deliberately NOT a reject condition on its own.
    options: [
      { value: 'pre', label: 'I’m not generating revenue yet' },
      { value: 'u1k', label: 'Under $1,000/month' },
      { value: '1-3k', label: '$1,000–$3,000/month' },
      { value: '3-5k', label: '$3,000–$5,000/month' },
      { value: '5-7.5k', label: '$5,000–$7,500/month' },
      { value: '7.5-10k', label: '$7,500–$10,000/month' },
      { value: '10k+', label: '$10,000+/month' },
    ],
  },
  {
    id: 'bottleneck', key: 'bottleneck', type: 'single',
    prompt: 'What is the biggest thing standing between you and consistent $10K months right now?',
    options: [
      { value: 'positioning', label: 'My positioning isn’t clear enough' },
      { value: 'offer', label: 'My offer isn’t converting' },
      { value: 'leads', label: 'I don’t have enough qualified leads' },
      { value: 'close', label: 'I get leads but struggle to turn them into clients' },
      { value: 'sales', label: 'My sales process / conversion is inconsistent' },
      { value: 'referrals', label: 'I rely on referrals and can’t reliably generate clients' },
      { value: 'unpredictable', label: 'My business works but acquisition isn’t predictable' },
      { value: 'unsure', label: 'I’m not sure what the real bottleneck is' },
    ],
  },
  {
    id: 'target', key: 'target', type: 'single',
    prompt: 'What would you like your business to consistently generate each month?',
    options: [
      { value: '5-10k', label: '$5K–$10K' },
      { value: '10-15k', label: '$10K–$15K' },
      { value: '15-25k', label: '$15K–$25K' },
      { value: '25-50k', label: '$25K–$50K' },
      { value: '50k+', label: '$50K+' },
    ],
  },
  {
    id: 'readiness', key: 'readiness', type: 'single',
    prompt: 'If we identify the specific bottleneck, and you believe the strategy is right for you, are you ready to invest in implementing it?',
    options: [
      { value: 'yes', label: 'Yes, I’m ready to solve this' },
      { value: 'maybe', label: 'Possibly, I need to understand the strategy first' },
      { value: 'no', label: 'No, I’m only looking for free advice', reject: true },
    ],
  },
]

/* Post-payment deep diagnostic (AFTER the $27 commitment). */
export const DEEP: Q[] = [
  { id: 'd_stuck', type: 'text', long: true, prompt: 'What is the ONE thing you’ve been trying to fix that still hasn’t changed?', placeholder: 'Be specific, this is what we’ll go after first.' },
  { id: 'd_cost', type: 'text', long: true, prompt: 'If nothing changes over the next 6–12 months, what will staying at your current level cost you?', helper: 'Think beyond money, time, freedom, confidence, family, lifestyle and opportunities.' },
  { id: 'd_change', type: 'text', long: true, prompt: 'If you built a predictable path to $10K/month, what would that actually change in your life?' },
  {
    id: 'd_tried', type: 'multi', prompt: 'What have you already tried to fix this?', helper: 'Select all that apply.',
    options: [
      'posting', 'ads', 'courses', 'coach', 'offer', 'positioning', 'outreach', 'networking', 'webinars', 'leadmagnets', 'funnels', 'referrals', 'other',
    ].map((v) => ({ value: v, label: ({
      posting: 'Posting more content', ads: 'Running ads', courses: 'Buying courses', coach: 'Hiring a coach/consultant',
      offer: 'Changing my offer', positioning: 'Changing my positioning', outreach: 'Cold outreach', networking: 'Networking',
      webinars: 'Webinars / workshops', leadmagnets: 'Lead magnets', funnels: 'Funnels', referrals: 'Referrals', other: 'Other',
    } as Record<string, string>)[v] })),
  },
  { id: 'd_tried_result', type: 'text', long: true, prompt: 'What happened?', helper: 'A sentence or two on the result of what you tried above.' },
  {
    id: 'd_source', type: 'single', prompt: 'Where are your clients currently coming from?',
    options: [
      'referrals', 'organic', 'linkedin', 'facebook', 'instagram', 'youtube', 'email', 'ads', 'outreach', 'networking', 'partnerships', 'other',
    ].map((v) => ({ value: v, label: ({
      referrals: 'Referrals', organic: 'Organic social media', linkedin: 'LinkedIn', facebook: 'Facebook', instagram: 'Instagram',
      youtube: 'YouTube', email: 'Email', ads: 'Paid advertising', outreach: 'Cold outreach', networking: 'Networking',
      partnerships: 'Partnerships', other: 'Other',
    } as Record<string, string>)[v] })),
  },
  {
    id: 'd_leads', type: 'single', prompt: 'Roughly how many qualified leads or sales conversations are you generating each month?',
    options: [
      { value: '0', label: '0' }, { value: '1-5', label: '1–5' }, { value: '6-10', label: '6–10' },
      { value: '11-20', label: '11–20' }, { value: '21-50', label: '21–50' }, { value: '50+', label: '50+' },
    ],
  },
  { id: 'd_commitment', type: 'scale', prompt: 'How committed are you to solving this now, not someday?', min: 1, max: 10, minLabel: 'Just exploring', maxLabel: 'I’m ready to act' },
]

/* ── Qualified transition + reserve screen ─────────────────────────────────*/
export const RESERVE = {
  headline: 'Your answers suggest there may be a real opportunity here.',
  sub: 'Let’s find out what’s actually standing between your business and consistent $10K months.',
  bodyHeading: 'The next step is a private 45-minute $10K Roadmap Audit.',
  body: 'On the call, we’ll look at your positioning, offer, lead generation, sales and conversion path, and identify the bottleneck I’d fix first.',
  includes: [
    'A private 45-minute strategy session',
    'A live audit of your positioning, offer, lead gen, sales & conversion',
    'The single bottleneck I’d fix first, and the path around it',
    'Your business reviewed from your answers before we meet',
  ],
  depositNote: 'The $27 is a commitment deposit to reserve your private audit slot, not the price of the advice.',
  cta: 'Reserve My Audit, $27',
  contact: {
    heading: 'Where should we send your audit details?',
    sub: 'We’ll use this to confirm your slot and prepare your session.',
    cta: 'Continue to secure checkout →',
    micro: 'Secure checkout · Powered by Whop · Apple Pay & Google Pay · 7-day guarantee',
  },
}

/* ── Booking ───────────────────────────────────────────────────────────────*/
export const BOOK = {
  headline: 'Your audit is almost locked in.',
  sub: 'Choose a time that works for you. We’ll use your answers to make the 45 minutes extremely specific to your business.',
  offerTitle: 'Your $10K Roadmap Audit',
  offerPoints: ['45 minutes', 'Private strategy session', 'Your business reviewed before the call', '$27 deposit applied per the stated terms'],
  confirmCta: 'Confirm My Audit',
}

/* ── Success ───────────────────────────────────────────────────────────────*/
export const SUCCESS = {
  badge: 'You’re booked',
  headline: 'You’re in.',
  sub: 'Your $10K Roadmap Audit is officially booked.',
  next: [
    'You’ll receive your confirmation email.',
    'Your calendar invitation is available below.',
    'I’ll review the information you submitted before the call.',
    'Come prepared to be honest about what’s working, and what’s not.',
  ],
  before: {
    heading: 'Before we meet…',
    lines: ['Don’t prepare a presentation.', 'Don’t spend hours trying to make your business look impressive.', 'Just come ready to show me what’s actually happening.'],
    close: 'Your answers give me the starting point. The goal of the call is to find the bottleneck.',
  },
  cover: { heading: 'What we’ll cover', chain: ['Positioning', 'Offer', 'Lead Generation', 'Sales', 'Conversion', 'Repeatable Acquisition'] },
  numbers: {
    heading: 'Bring these 3 numbers.',
    items: ['Current monthly revenue', 'Average offer price', 'Qualified conversations / leads per month'],
    sub: 'That’s enough. We’ll do the rest together.',
  },
  event: {
    title: '10K Roadmap Audit',
    description: 'Private business strategy audit focused on identifying the bottleneck preventing a predictable path to $10K/month.',
  },
}

/* ── Rejection ─────────────────────────────────────────────────────────────*/
export const REJECT = {
  headline: 'This probably isn’t the right next step, yet.',
  sub: 'The $10K Roadmap Audit is designed for coaches and consultants who already have a business in motion and are ready to solve a specific growth bottleneck.',
  reasons: {
    no_business: 'Based on your answers, you’re still building the foundation. If you haven’t started generating revenue from your own offer yet, there are earlier, better-fitting steps than a paid strategy audit.',
    free_advice: 'Based on your answers, you’re looking for free advice right now, and that’s completely fair. The audit is built for people ready to implement, so it wouldn’t create enough value for you today.',
    default: 'Based on your answers, I don’t think we’d create enough value for you right now.',
  } as Record<string, string>,
  dontForce: 'Don’t force the next level before you’ve built the foundation.',
  altHeading: 'A better next step',
  altBody: 'Start with the free resources and the case studies, see exactly how experts fixed their bottleneck, then come back when you’re ready to implement.',
  altCta: 'Explore the case studies',
  altHref: '/results',
  altCta2: 'Take the free growth diagnostic',
  altHref2: '/quiz',
}

/* ── Legal (Meta-safe) ─────────────────────────────────────────────────────*/
export const LEGAL = {
  earnings:
    'This is a strategy audit and makes no guarantee of income or results. The case studies shown are the real experiences of specific clients, they are not a promise that you will achieve the same or similar outcomes. Results depend on your experience, effort, offer, market and factors outside our control.',
  meta:
    'This site is not a part of the Facebook or Instagram website or Meta Platforms, Inc., and is not endorsed by Meta in any way. FACEBOOK and INSTAGRAM are trademarks of Meta Platforms, Inc.',
  links: [
    { label: 'Privacy', href: '/data-usage' },
    { label: 'Terms', href: '/data-usage' },
    { label: 'Code of Ethics', href: '/ethics' },
  ],
}
