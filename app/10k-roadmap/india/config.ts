/* ─────────────────────────────────────────────────────────────────────────
   The Business Roadmap Audit — INDIA edition.

   A self-contained copy of the /10k-roadmap funnel, localised for an Indian
   audience: all figures in INR (₹ / lakh / crore), no dollars. The original
   funnel is untouched — this only overrides the *copy* (and the video / cal /
   typeform env hooks). The shared UI kit, tracking and VSL player are reused
   from the parent funnel, so the two stay visually identical.

   Positioning (per brief):
     • Audience  — Indian working professionals & business owners.
     • Floor     — must ALREADY earn ≥ ₹50,000/month from a job or business to
                   qualify (the income question rejects below that).
     • Promise   — build a predictable, profitable business from your expertise.
     • Free      — no payment step, mirroring the current live parent funnel.

   Env (all optional; fall back to the parent funnel's values):
     NEXT_PUBLIC_AUDIT_INDIA_VIDEO_URL     VSL for the India landing
     NEXT_PUBLIC_AUDIT_INDIA_TYPEFORM_ID   deep-diagnostic Typeform id
     NEXT_PUBLIC_AUDIT_INDIA_CAL_URL       cal.com scheduler link
   ───────────────────────────────────────────────────────────────────────── */
import type { Q } from '../config'

// Design tokens + press strip are brand-level and identical — reuse verbatim.
export { T, PRESS, MANISHA } from '../config'
export type { Q, Opt } from '../config'

export function videoUrl(): string {
  return process.env.NEXT_PUBLIC_AUDIT_INDIA_VIDEO_URL || ''
}
export function auditTypeformId(): string {
  return process.env.NEXT_PUBLIC_AUDIT_INDIA_TYPEFORM_ID || process.env.NEXT_PUBLIC_AUDIT_TYPEFORM_ID || 'u9maum7Y'
}
export function auditCalUrl(): string {
  return process.env.NEXT_PUBLIC_AUDIT_INDIA_CAL_URL || process.env.NEXT_PUBLIC_AUDIT_CAL_URL || 'https://cal.com/indrodip-ghosh-ut1vxh/60min'
}

/* Social-proof rating (kept honest + non-numeric-country to avoid inventing
   India-specific counts). */
export const RATING = { score: '4.8', text: 'from the founders and professionals we advise' }

/* The ₹199 audit deposit (India). Mirrors the parent funnel's $27 pattern —
   a small, refundable commitment fee that filters tire-kickers and raises
   show-up rate, not a real price for the advisory itself. Requires a real
   INR plan created in Whop; see auditIndiaPlanId() below. */
export const DEPOSIT_INDIA = { amount: 199, label: '₹199', currency: 'INR' } as const
export function auditIndiaPlanId(): string {
  return process.env.NEXT_PUBLIC_WHOP_AUDIT_PLAN_ID_INDIA || ''
}

/* ── Landing copy (INR, India) ─────────────────────────────────────────────
   Restructured to mirror the proven "clarity call" funnel pattern: a
   hyper-specific attention line, a risk-reversed headline, a self-qualifying
   checklist, a 4-part clarity framework, a before/after transformation list,
   proof, authority, then an objection-handling FAQ, with the CTA repeated
   after every section. */
export const LANDING = {
  // The launch framing: a global consulting practice (real international
  // clients across the US, Canada, the UAE, Indonesia and Vietnam are
  // already in REAL_PROOF) opening its 1:1 session to India for the first
  // time. "Global" is the brand's own name, not an invented superlative.
  launch: {
    badge: 'For coaches and consultants in India',
    kicker: 'A private 60-minute business audit',
  },
  // The founder's credibility strip (hero + founder section). Every claim
  // here must stay exactly this careful: the valuation is the startup's,
  // approximate, and not personal wealth; the UC line says "alumni", never
  // that the university itself backs, funds or endorses the startup.
  founderCreds: ['AI Startup Founder', '~$6M Startup Valuation', 'Backed by University of California Alumni'],
  founderCredsNote: 'Valuation is an approximate estimate of the startup, not personal net worth, and does not guarantee outcomes for consulting clients.',
  // No claim about the reader's own income/financial status in the ad-facing
  // copy (Meta's Personal Attributes policy disallows asserting or implying
  // a viewer's financial status). This names the AUDIENCE by role/intent
  // instead of asserting a fact about the specific person reading it.
  eyebrowAttention: 'A PRIVATE 1:1 BUSINESS AUDIT FOR COACHES IN INDIA',
  eyebrow: 'From the desk of a Consumer Behaviour & AI Researcher:',
  // Mirrors the US page's own headline pattern ("You've Tried Coaches,
  // ChatGPT And Claude. So Why Aren't You Making Consistent Money?") —
  // names the tension (good at the work, money still isn't there) instead
  // of a "what if" tease, while staying short-sentence, no-jargon.
  headlinePre: '',
  headlineHighlight: '',
  headlinePost: '',
  headline: "You're Good At What You Do. So Why Is Making Money From Your Coaching Still So Difficult?",
  headlineSub: 'Build a coaching business that brings you consistent clients and predictable revenue, not one more random marketing activity.',
  guaranteeLine: 'Qualified clients receive a defined refund if we fail to deliver the promised audit. ',
  guaranteeEmphasis: 'See eligibility before you book.',
  guaranteeBadge: '200% Guarantee for Qualified Applicants',
  guaranteeShort: 'If we decline your application, request ₹199 back. The ₹400 total guarantee is limited to qualified clients.',
  // The full guarantee block, set out near the booking decision (apply section).
  guaranteeFull: {
    heading: '₹400 total for qualified clients only.',
    body: 'The ₹400 total guarantee is only for relevant coaching businesses with prior experience and at least one sale, when The5th confirms we can help and then fails to deliver the promised audit. If we decline your application, you may request the standard ₹199 refund.',
    sub: 'One claim per customer and booking. No repeat or stacked payouts.',
    terms: 'See the Refund Policy for eligibility, the request process, exclusions, and your statutory consumer rights.',
  },
  ctaPrimary: 'Book Your ₹199 Business Audit',
  ctaSecondary: { label: 'See How It Works', href: '#clarity' },
  ctaMicro: '₹199 one-time business audit. No recurring charge.',
  ctaMicroShort: '₹199 one-time business audit',

  /* ── The problem: four short, scannable statements, then the one line
     that reframes it — named before the solution, in the reader's own
     words, not the brand's. No personal-attribute assertions: these are
     open pain statements, not claims about the specific reader. */
  pain: {
    eyebrow: 'Sound Familiar?',
    heading: 'A great month. Then a quiet one. Then you’re guessing again.',
    lines: [
      'You have expertise, but struggle to get consistent clients.',
      'Most of your business comes through referrals.',
      'You post content, but struggle to convert followers into customers.',
      'Your monthly revenue is unpredictable.',
      'You’ve paid for coaching or courses before, and nothing really stuck.',
    ],
    close: 'You don’t need more random marketing activities. You need a system.',
  },

  /* ── What you get: shown right after the hero, before any selling. The
     same tangible deliverables as the global audit, in short plain lines. */
  get: {
    eyebrow: 'What You Get',
    heading: 'Everything you get for ₹199.',
    sub: 'Not just a call. You leave with real things you can use.',
    items: [
      { t: '60-Minute 1:1 Call', d: 'A private Zoom call with Indradip and Manisha. Not a team member.' },
      { t: 'Your Business Audit PDF', d: 'A written report on your offer, your buyer and your biggest problem.' },
      { t: 'Your 100-Day Roadmap', d: 'What to fix first, second and third. Step by step.' },
      { t: 'Call Recording', d: 'Watch it again any time. Sent only if you agree to recording.' },
      { t: 'AI Prompt Toolkit', d: 'Ready ChatGPT and Claude prompts made for your plan.' },
      { t: 'Growth Calculators', d: 'Simple tools to know your numbers: revenue, pricing, clients.' },
    ],
    sampleCta: 'See A Sample Audit (17 Pages)',
    sampleNote: 'Sample only. A made-up business, shown in dollars, so you can see the format.',
  },

  // Hero card: the live 1:1 session details, shown next to the founder photo.
  heroCard: {
    name: 'Indradip Ghosh',
    role: 'Founder, Business Growth Strategist & AI Researcher',
    credential: 'Consumer Psychologist, University of California, Berkeley',
    recruitedBy: 'Recruited by Google & Anthropic',
    featuredIn: 'Featured in ClickFunnels and Mastermind.com',
    chips: [
      { t: '1-on-1 Zoom Session', s: '60 Minutes' },
      { t: '₹199 Only', s: 'One-Time Deposit' },
    ],
  },

  // Stat strip directly under the hero. No invented headcounts, and no
  // absolute "0%/100%" guarantee-style claims — only verifiable facts about
  // the format itself.
  stats: [
    { v: '60 Min', l: 'Focused Business Audit' },
    { v: 'Full-Time', l: 'Built For Coaches, Not Side-Hustlers' },
    { v: '1:1', l: 'Personal, Not A Webinar' },
    { v: '₹199', l: 'One-Time Business Audit' },
  ],

  /* ── The named system: HOW the coaching business actually gets built,
     distinct from the "clarity" next-step banner below. Without this, the
     page explains the call but never explains the method. */
  mechanism: {
    eyebrow: 'The Method',
    heading: 'The 3-part business growth system.',
    sub: 'The exact order we follow in your business audit.',
    steps: [
      { n: '01', t: 'Position', d: 'A simple, clear offer that the right customers actually want.' },
      { n: '02', t: 'Attract', d: 'A way to bring in new enquiries every week, not just when you post.' },
      { n: '03', t: 'Convert', d: 'A simple sales conversation that turns enquiries into paying clients.' },
    ],
    close: 'Your business audit shows where you stand, what’s blocking growth, and what to do next.',
  },

  clarity: {
    nextStep: {
      eyebrow: 'Your Ultimate Outcome',
      heading: 'Your Next Step',
      sub: 'You’ll leave knowing exactly what to fix next.',
    },
  },

  // What the system builds, as a flow, not a promise: real steps the system
  // actually moves through, never a guaranteed-revenue claim.
  buildFlow: {
    eyebrow: 'What You Can Build',
    heading: 'A structured path to a predictable business.',
    sub: 'The same flow we map out together, step by step.',
    steps: ['Expertise', 'Positioning', 'Marketing', 'Enquiries', 'Sales', 'Growth'],
    close: 'Not a guarantee. A structure you execute, step by step.',
  },

  results: {
    heading: 'And it’s not just theory.',
    sub: 'The coaches we’ve worked with build something most never do:',
    // No currency figures — real, qualitative outcomes only (India edition).
    stats: ['New clients booking in every month', 'A pipeline that never runs dry', 'Prices you never have to discount', 'A system that runs without daily hustle'],
    principle: 'Different businesses. Different markets. Different starting points. The same principle: find what’s preventing growth, fix it, scale what works.',
    disclaimer: 'Individual results vary. Past results are not typical and do not guarantee future results.',
  },

  // Testimonial section heading (cards pull from REAL_PROOF in the parent config).
  proof: {
    eyebrow: 'Real Results, Real People',
    heading: 'Real results.',
    // Figure confirmed directly by the business owner (Indradip), 2026-11-13:
    // total documented client revenue across the full client base, not only
    // the cases shown below (those sum to a conservative $646,000+).
    revenueLine: 'Clients have generated over $15,000,000 in documented business growth.',
    disclaimer: 'Real client outcomes. Individual results are not typical and depend on your offer, market and effort.',
  },

  whoBook: {
    heading: 'Who should book?',
    goodFitHeading: 'Good fit',
    goodFit: [
      'Coaches',
      'Consultants',
      'Freelancers',
      'Service providers',
      'Experts wanting to monetise their knowledge',
      'Entrepreneurs looking for more consistent clients',
      'Already tried coaching or courses before, with no real result',
    ],
    notFitHeading: 'Not a fit',
    notFit: [
      'Treating this as a side hustle, not a full-time business',
      'Expecting overnight success with no real effort',
      'Looking for guaranteed income, not a system to build',
      'Not willing to implement what gets mapped on the call',
      'Searching for a shortcut instead of a repeatable process',
      'Still deciding if they even want to coach or consult',
    ],
  },

  faq: {
    eyebrow: 'Clearing Your Doubts',
    heading: 'Frequently Asked Questions',
    items: [
      { q: 'What exactly happens during the ₹199 business audit?', a: 'We look at your positioning, offer and client acquisition, find the one bottleneck costing you the most, and map a realistic plan to fix it.' },
      { q: 'How long is the business audit?', a: 'Sixty minutes, with Indradip and Manisha personally.' },
      { q: 'Is this suitable for beginners?', a: 'Yes, if you already have some expertise or clients. It isn’t built for people with no business or income yet.' },
      { q: 'I’ve already paid for coaching before and it didn’t work. Why would this be different?', a: 'This isn’t a programme pitch. The business audit identifies the specific thing blocking your growth and maps a practical plan. There is no obligation to continue.' },
      { q: 'Do I need an existing business?', a: 'You need real expertise, a skill or a service, and some income already coming in. You don’t need a formal company.' },
      { q: 'Will you help me get clients?', a: 'The audit maps your system. If it’s a genuine fit, you can choose to keep working with us afterward, with zero obligation either way.' },
      { q: 'Is there any obligation to purchase a programme?', a: 'No. The ₹199 is a one-time payment for the business audit, not the start of a bigger programme. You decide afterward, with no pressure.' },
      { q: 'Why does the business audit cost ₹199?', a: 'It is a one-time payment for your business audit and listed deliverables. Review the terms before booking.' },
    ],
  },

  reach: {
    stat: 'Full-time coaches across India',
    body: 'advised remotely, one call at a time.',
  },

  // Real, documented client results (same verified case studies as the
  // parent funnel — kept in USD, the figures are the actual amounts
  // clients earned, not a currency-converted estimate). Entries used on this
  // page: shyama-prasad-goswami, girish, bharti-chauhan — all India-based.
  caseStudies: {
    eyebrow: 'Case Studies',
    heading: 'Real Client Results',
    names: ['Torill', 'Shyama Prasad Goswami', 'Girish', 'Abbas Jamie', 'Bharti Chauhan', 'Gurpreet', 'Susan Taylor'],
  },

  founder: {
    eyebrow: 'Someone You Can Trust',
    heading: 'Learn From Someone Building Businesses, Not Just Teaching Them.',
    quote: 'Talented professionals rarely got paid for the value they created. That gap is what built The5th.',
    body: 'I’m also the founder of an AI startup, backed by University of California alumni, at an approximate valuation of $6M. Building that company, not just studying business, is what shapes how I help coaches and consultants position their offer, build a marketing system, and convert leads into clients.',
    name: 'Indradip Ghosh',
    role: 'Founder, The5th Global Consulting',
    stats: [
      { v: '5+ Yrs', l: 'Marketing & Funnel Strategy' },
      { v: '100%', l: 'Sessions Run Personally' },
    ],
  },

  apply: {
    eyebrow: 'Book Your Slot',
    heading: 'Your Next Client Shouldn’t Depend On Luck.',
    sub: 'Let’s identify what’s holding your business back and map out your next steps.',
    priceLine: '₹199 today. Standard refund if we decline your application.',
    micro: 'A ₹400 total guarantee is available only to qualified applicants who meet the published conditions.',
    // What the session itself leaves you with, same facts as the pay step's
    // `points` below, kept here so the apply section can show them before
    // the click, not only after it.
    points: [
      'A 60-minute 1:1 call with Indradip and Manisha personally',
      'A clear picture of your current bottleneck',
      'A realistic next step, whether or not you ever work with us again',
    ],
  },

  /* ── Pay step copy (new): the page the primary CTA leads to. Mirrors the
     parent funnel's $27-deposit pattern, priced in INR. Requires a real
     ₹199 Whop plan — see auditIndiaPlanId() above. */
  pay: {
    eyebrow: 'Last Step',
    headline: 'Reserve your 1:1 Business Audit.',
    sub: 'A 60-minute business audit with Indradip Ghosh and Manisha Satpute. Leave with a clear view of what is holding your business back and what to do next.',
    notPitch: 'This is a working business audit, not a sales call for a bigger program.',
    coverLead: 'Your ₹199 business audit includes:',
    points: [
      'A 60-minute 1:1 business audit with Indradip and Manisha',
      'A clear picture of your current bottleneck',
      'A realistic next step, whether or not you ever work with us again',
    ],
    fit: 'This is for full-time coaches in India who have real expertise and happy clients, and want a predictable, ₹10L/month business instead of a feast-or-famine one.',
    deposit: '₹199 is a one-time payment for the business audit and listed deliverables. Review the refund terms before checkout.',
    micro: 'Secure checkout · One-time payment · No recurring charge.',
  },

  nav: [
    { label: 'The System', href: '#clarity' },
    { label: 'Who It’s For', href: '#who' },
    { label: 'Proof', href: '#proof' },
    { label: 'FAQ', href: '#faq' },
    { label: 'Apply', href: '#apply' },
  ],
}

/* ── Qualification screen ───────────────────────────────────────────────────*/
export const QUALIFY = {
  eyebrow: 'Private Advisory · 2-minute qualification',
  intro: 'A few quick questions so we only invite people the audit can genuinely help.',
}

export const QUALIFICATION: Q[] = [
  {
    id: 'business_type', key: 'business_type', type: 'single',
    prompt: 'What best describes you right now?',
    options: [
      { value: 'business', label: 'I run my own business' },
      { value: 'salaried', label: 'I’m a salaried professional (job)' },
      { value: 'coach', label: 'I’m a coach / consultant / expert' },
      { value: 'freelance', label: 'I freelance or sell services' },
      { value: 'none', label: 'I’m not earning from a job or business yet', reject: true },
    ],
  },
  {
    id: 'income', key: 'income', type: 'single',
    prompt: 'Roughly what do you earn each month right now, from your job or business?',
    helper: 'This audit is built for people with a stable base of at least ₹50,000/month.',
    options: [
      { value: 'u50k', label: 'Under ₹50,000 / month', reject: true },
      { value: '50k-1l', label: '₹50,000 – ₹1,00,000 / month' },
      { value: '1-2l', label: '₹1,00,000 – ₹2,00,000 / month' },
      { value: '2-3l', label: '₹2,00,000 – ₹3,00,000 / month' },
      { value: '3-5l', label: '₹3,00,000 – ₹5,00,000 / month' },
      { value: '5l+', label: '₹5,00,000+ / month' },
    ],
  },
  {
    id: 'bottleneck', key: 'bottleneck', type: 'single',
    prompt: 'What is the biggest thing standing between you and a predictable business income right now?',
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
    prompt: 'What would you like your own business to consistently add each month?',
    options: [
      { value: '1-2l', label: '₹1L – ₹2L' },
      { value: '2-3l', label: '₹2L – ₹3L' },
      { value: '3-5l', label: '₹3L – ₹5L' },
      { value: '5-10l', label: '₹5L – ₹10L' },
      { value: '10l+', label: '₹10L+' },
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

/* ── Step: Pick a Time ──────────────────────────────────────────────────────*/
export const SCHEDULE = {
  eyebrow: 'Step 1 of 3 · Pick a time',
  headline: 'Choose your audit time.',
  sub: 'Choose a time for your business audit. Then answer a few quick questions so the review is focused on your business.',
  loading: 'Loading available times…',
}

/* ── Step: A Few Questions (Typeform) ───────────────────────────────────────*/
export const RESERVED_WHY = {
  eyebrow: 'Time reserved',
  headline: 'Your audit time is held. One essential step remains.',
  body: 'This isn’t a formality. Your answers here are exactly how we prepare a personalised audit for YOUR business, so on the call we pinpoint the specific fix you need, not vague, generic advice.',
  points: [
    'It’s how we understand your exact situation before we meet.',
    'It’s what lets us pinpoint the one specific fix, instead of generic advice.',
    'The more honest you are, the more valuable your 60 minutes will be.',
  ],
  footnote: 'Take two minutes. As soon as you finish, your booking is locked in.',
  loadingHint: 'Loading your questions…',
  errorHint: 'The questions couldn’t load. Please refresh the page to continue.',
  errorCta: 'Refresh',
}

/* ── Thank-you page ─────────────────────────────────────────────────────────*/
export const THANKYOU = {
  badge: 'You’re booked',
  headline: 'You’re all set.',
  sub: 'Your Business Roadmap Audit is confirmed.',
  countdownLabel: 'Your call starts in',
  liveLabel: 'Your call is starting now',
  passedLabel: 'This call time has passed. Check your email, or rebook if you need to.',
  addHeading: 'Add it to your calendar',
  joinNote: 'Save this link — it’s where you’ll join when it’s time.',
  joinPending: 'Your video call link is being generated and will be in your confirmation email and calendar invite. It’ll also appear here in a moment.',
  saveTitle: 'Save this page',
  saveSub: 'Keep a link to this page so you can jump back to your countdown and join link anytime.',
  saveCta: 'Save / copy this page →',
  detailsPending: 'Your call is confirmed. Your calendar invitation and confirmation are on their way to your inbox.',
  emailPrompt: 'Enter the email you booked with to see your countdown and calendar links.',
  next: [
    'You’ll receive your confirmation email and calendar invite.',
    'I’ll review your answers before the call so we go straight to what matters.',
    'Bring three numbers: current monthly income, average offer price, and qualified leads per month.',
    'Come ready to be honest about what’s working, and what isn’t.',
  ],
  event: {
    title: 'Business Roadmap Audit',
    description: 'Private business strategy audit focused on identifying the bottleneck preventing a predictable, profitable business.',
  },
}

/* ── Rejection ──────────────────────────────────────────────────────────────*/
export const REJECT = {
  headline: 'This probably isn’t the right next step, yet.',
  sub: 'The Business Roadmap Audit is designed for professionals and business owners who already have a stable income base and are ready to solve a specific growth bottleneck.',
  reasons: {
    no_business: 'Based on your answers, you’re still building the foundation. If you’re not yet earning from a job or a business, there are earlier, better-fitting steps than a private strategy audit.',
    income: 'Based on your answers, you’re not yet at a stable ₹50,000/month base. The audit is built for people with that foundation to build on, so there are earlier, better-fitting steps for you right now.',
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

/* ── Legal (India jurisdiction) ─────────────────────────────────────────────*/
export const LEGAL = {
  earnings:
    'This is a strategy audit and makes no guarantee of income or results. The case studies shown are the real experiences of specific clients, they are not a promise that you will achieve the same or similar outcomes. Results depend on your experience, effort, offer, market and factors outside our control.',
  meta:
    'This site is not a part of the Facebook or Instagram website or Meta Platforms, Inc., and is not endorsed by Meta in any way. FACEBOOK and INSTAGRAM are trademarks of Meta Platforms, Inc.',
  links: [
    { label: 'Privacy', href: '/privacy' },
    { label: 'Refund Policy', href: '/refund' },
    { label: 'Disclaimer', href: '/disclaimer' },
    { label: 'Terms', href: '/terms' },
    { label: 'Code of Ethics', href: '/ethics' },
  ],
  copyright:
    '© 2026 The5th Global Consulting. All rights reserved. Unauthorized copying, reproduction, distribution, use, or collection of any content or information from this website is strictly prohibited. Any unauthorized use may result in legal action. To the extent permitted by law, any dispute arising from or relating to the unauthorized use of this website or its content shall be subject to the exclusive jurisdiction of the competent courts of India.',
}
