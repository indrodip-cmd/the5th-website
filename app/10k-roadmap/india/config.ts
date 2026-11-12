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
export { T, PRESS } from '../config'
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
  // No claim about the reader's own income/financial status in the ad-facing
  // copy (Meta's Personal Attributes policy disallows asserting or implying
  // a viewer's financial status). This names the AUDIENCE by role/intent
  // instead of asserting a fact about the specific person reading it.
  eyebrowAttention: 'A PRIVATE 1:1 BUSINESS AUDIT FOR WORKING PROFESSIONALS & BUSINESS OWNERS IN INDIA',
  eyebrow: 'From the desk of a Consumer Behaviour & AI Researcher:',
  headlinePre: 'Stop Trading Time For Money. Learn How To Build A ',
  headlineHighlight: 'Predictable ₹10 Lakh/Month Coaching Business',
  headlinePost: ' From Your Own Expertise, Without Quitting Your Job.',
  headline: 'Build a Predictable ₹10 Lakh/Month Coaching Business From Your Expertise, in 6–12 Months.',
  headlineSub: 'For professionals and business owners who are good at what they do, but tired of a month-to-month income that depends entirely on someone else’s decisions.',
  guaranteeLine: 'Build a predictable income from your own business, or get every rupee you invested back. ',
  guaranteeEmphasis: 'Yes, I’ll write the cheque.',
  guaranteeBadge: '100% Money-Back Guarantee',
  guaranteeShort: 'If we don’t agree on a clear next step by the end of the call, your ₹199 is refunded in full, no questions asked.',
  ctaPrimary: 'Book My 1:1 Business Audit — ₹199',
  ctaSecondary: { label: 'See How It Works', href: '#clarity' },
  ctaMicro: '₹199, fully refundable · Indrodip personally runs every call, so slots are limited by his calendar, not a quota',
  ctaMicroShort: '₹199, fully refundable',

  /* ── Pain / agitation: named before the solution, in the reader's own
     words, not the brand's. This is deliberately the first substantial copy
     block below the hero — the goal is for the reader to feel understood
     before being sold anything. No personal-attribute assertions: these
     are open pain statements, not claims about the specific reader. */
  pain: {
    eyebrow: 'Sound Familiar?',
    heading: 'You’re good at what you do. So why does your income still depend entirely on someone else?',
    lines: [
      'A client cancels, a boss reshuffles the budget, a slow month happens, and suddenly the plan you had for this year is on hold again.',
      'You’ve thought about building something of your own. But every time, it turns into either a side-hustle that never grows past pocket money, or a plan so big it never actually starts.',
      'The truth is, you don’t need another course, another framework, or more hours in your day. You need to know exactly where your specific income is leaking, and what to fix first.',
    ],
    close: 'That’s the one thing a free YouTube video, a WhatsApp forward, or a generic course can never give you: a plan built around your actual numbers, not someone else’s case study.',
  },

  // Hero card: the live 1:1 session details, shown next to the founder photo.
  heroCard: {
    name: 'Indrodip Ghosh',
    role: 'Founder & Business Growth Strategist',
    chips: [
      { t: '1-on-1 Zoom Session', s: '60 Minutes' },
      { t: '₹199 Only', s: 'Fully Refundable' },
    ],
  },

  // Stat strip directly under the hero. No invented headcounts, and no
  // absolute "0%/100%" guarantee-style claims — only verifiable facts about
  // the format itself.
  stats: [
    { v: '60 Min', l: 'Focused Business Audit' },
    { v: 'No Quitting', l: 'Keep Your Job While You Build' },
    { v: '1:1', l: 'Personal, Not A Webinar' },
    { v: '₹199', l: 'Fully Refundable Deposit' },
  ],

  // "Who is this for?" self-qualifying checklist, phrased as reflective
  // questions rather than assertions about the specific reader's finances.
  whoIsThis: {
    eyebrow: 'Is This You?',
    heading: 'Who is this for?',
    sub: 'Ask yourself honestly. If several of these land, this audit was built for exactly this moment in your career.',
    items: [
      'Your income from your job or business has plateaued, and you don’t have a clear plan to change that.',
      'Your expenses keep rising faster than your income does.',
      'You have real expertise or a skill people already respect, but no clear way to turn it into income of your own.',
      'You want a second, predictable income stream, without quitting the job that currently pays your bills.',
      'You’ve had feast-or-famine months before, one good month, then nothing, and you’re done gambling on that pattern.',
      'You’re willing to actually implement a plan, not just collect one more piece of information.',
    ],
    bannerHeading: 'If 3 or more of these are true for you, the only inconsistent move now is closing this tab and doing nothing about it.',
  },

  // The 4-part clarity framework, mirrored directly on the call.
  clarity: {
    eyebrow: 'No Fluff, Real Clarity',
    heading: 'This 1:1 Business Audit Is Designed To Give You Clarity.',
    sub: 'This isn’t another generic webinar or motivational session. It’s about understanding your current business and figuring out the next real step toward a predictable income.',
    boxes: [
      { n: '01', t: 'Where You Are Now', d: 'Your current income, offer, positioning and client-acquisition reality, mapped honestly, not assumed.' },
      { n: '02', t: 'Where You Want To Go', d: 'What a predictable, profitable business income actually looks like for you, beyond just your salary.' },
      { n: '03', t: 'What’s Holding You Back', d: 'The single biggest bottleneck standing between where you are and consistent monthly revenue.' },
      { n: '04', t: 'Your Possible Path Forward', d: 'A realistic plan based on your real constraints, income and expertise, not a generic script.' },
    ],
    nextStep: {
      eyebrow: 'Your Ultimate Outcome',
      heading: 'Your Next Step',
      sub: 'You’ll leave knowing exactly what to fix next, whether or not you ever continue working with us.',
    },
  },

  // Before/after transformation checklist.
  transformation: {
    eyebrow: 'The Transformation',
    heading: 'Imagine Having A Predictable Second Income Stream.',
    items: [
      'Imagine waking up knowing exactly where your next client is coming from.',
      'Imagine having income beyond your salary, without ever quitting your job.',
      'Imagine no longer feeling dependent on one paycheck or one client.',
      'Imagine feeling genuinely secure about your financial future.',
      'Imagine handling unexpected expenses with real confidence.',
      'Imagine your next 90 days of revenue being a plan, not a guess.',
    ],
    close: 'Every month you leave this unanswered is another month of the same unpredictable income. This is exactly what you’ll map out on the call.',
  },

  results: {
    heading: 'And it’s not just theory.',
    sub: 'The professionals and business owners we’ve worked with build something most never do:',
    // No currency figures — real, qualitative outcomes only (India edition).
    stats: ['Consistent monthly clients', 'A predictable pipeline', 'Premium pricing that holds', 'Systems, not daily hustle'],
    principle: 'Different businesses. Different markets. Different starting points. The same principle: find what’s preventing growth, fix it, scale what works.',
    disclaimer: 'Individual results vary. Past results are not typical and do not guarantee future results.',
  },

  // Testimonial section heading (cards pull from REAL_PROOF in the parent config).
  proof: {
    eyebrow: 'Real Results, Real People',
    heading: 'See What Other Professionals Have Discovered From Our 1:1 Audits.',
    // Conservative sum of the dollar figures actually documented in
    // REAL_PROOF (app/10k-roadmap/config.ts) — $646,193, several marked
    // "+" so the true total is at least this. Swap for a verified figure
    // from the revenue dashboard if/when one is confirmed; never round up
    // past what's documented.
    revenueLine: 'Clients have generated over $646,000 in documented, verifiable results.',
    disclaimer: 'Real client outcomes. Individual results are not typical and depend on your offer, market and effort.',
  },

  forYou: {
    heading: 'This is for you if…',
    yes: [
      'You already earn at least ₹50,000/month from a job or a business.',
      'You have expertise, a skill, or a service you can monetise.',
      'You want a predictable income from your own business, not just your salary.',
      'You’re tired of unpredictable, feast-or-famine results.',
      'You want consistent clients without chasing people all day.',
      'You’re willing to implement.',
    ],
    notHeading: 'This is not for you if…',
    no: [
      'You’re not yet earning from a job or a business.',
      'You want someone to magically build the business for you.',
      'You’re unwilling to sell.',
      'You won’t implement.',
      'You’re looking for another course to watch.',
      'You want guaranteed results without doing the work.',
    ],
    close: 'You don’t need to be perfect. You do need to be serious.',
  },

  faq: {
    eyebrow: 'Clearing Your Doubts',
    heading: 'Frequently Asked Questions',
    items: [
      { q: 'How much does this audit cost?', a: 'Just ₹199, a refundable booking deposit, not a fee. It keeps the call serious on both sides. If we don’t land on a clear next step for you, you get every rupee back.' },
      { q: 'What happens during the call?', a: 'We look at your positioning, offer and client-acquisition process, find the one bottleneck costing you the most, and map a realistic path forward.' },
      { q: 'Do I need business or marketing skills?', a: 'No. Most people we audit have real expertise but no marketing background. That gap is exactly what the audit addresses.' },
      { q: 'Can I start without quitting my job?', a: 'Yes. This is built for people who want a second, predictable income stream alongside their current job, not a risky replacement for it on day one.' },
      { q: 'Is my ₹199 really refundable?', a: 'Yes. If you show up and we agree the audit genuinely isn’t a fit for you, we refund it in full. We’d rather lose ₹199 than waste an hour of your time.' },
    ],
  },

  reach: {
    stat: 'Professionals and business owners across India',
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
    heading: 'Meet Your Mentor',
    quote: 'I grew up surrounded by talented professionals who spent years helping families, communities, workplaces and businesses, yet rarely got paid for the value they created. That gap is what built The5th.',
    body: 'Indrodip Ghosh founded The5th Global Consulting after years as a marketer and funnel strategist watching the same pattern repeat: professionals with real expertise believed they had nothing worth selling, while people with far less experience built thriving businesses around far less knowledge. Every audit is run by Indrodip personally, not a sales rep, not a junior coach.',
    name: 'Indrodip Ghosh',
    role: 'Founder, The5th Global Consulting',
    stats: [
      { v: '5+ Yrs', l: 'Marketing & Funnel Strategy' },
      { v: '100%', l: 'Audits Run Personally' },
    ],
  },

  apply: {
    eyebrow: 'Book Your Slot',
    heading: 'Ready to see exactly what’s holding your income back?',
    sub: 'Indrodip personally runs every audit, so slots are limited by how many hours are in his week, not by a fake countdown timer.',
    priceLine: '₹199 today, fully refundable',
    micro: 'No pressure · If we’re not the right fit, we’ll say so on the call and refund your ₹199.',
  },

  /* ── Pay step copy (new): the page the primary CTA leads to. Mirrors the
     parent funnel's $27-deposit pattern, priced in INR. Requires a real
     ₹199 Whop plan — see auditIndiaPlanId() above. */
  pay: {
    eyebrow: 'Last Step',
    headline: 'Reserve your 1:1 Business Audit.',
    sub: 'A 60-minute private call with Indrodip Ghosh, not a sales rep. You’ll leave knowing exactly what’s holding your income back and what to do about it.',
    notPitch: 'This isn’t a disguised sales call for a bigger program. It’s a real audit of your business.',
    coverLead: 'Your ₹199 reserves:',
    points: [
      'A 60-minute 1:1 call with Indrodip personally',
      'A clear picture of your current bottleneck',
      'A realistic next step, whether or not you ever work with us again',
    ],
    fit: 'This is for working professionals and business owners in India who have real expertise or a skill, and want a predictable income of their own alongside it.',
    deposit: 'The ₹199 is a refundable booking deposit, not a program fee. It keeps the call serious on both sides, nothing more.',
    guaranteeTitle: '100% Money-Back Guarantee',
    guaranteeBody: 'If you show up and we agree this genuinely isn’t a fit for you, we refund every rupee.',
    micro: 'Secure checkout · Refundable · No recurring charge.',
  },

  nav: [
    { label: 'Who It’s For', href: '#who' },
    { label: 'The Call', href: '#clarity' },
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
  sub: 'Grab the slot that works for you. Next we’ll ask a few quick questions so your 60 minutes are laser-specific to your business.',
  loading: 'Loading available times…',
}

/* ── Step: A Few Questions (Typeform) ───────────────────────────────────────*/
export const RESERVED_WHY = {
  eyebrow: 'Time reserved',
  headline: 'Your time is held. One essential step before your call.',
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
    { label: 'Privacy', href: '/data-usage' },
    { label: 'Terms', href: '/data-usage' },
    { label: 'Code of Ethics', href: '/ethics' },
  ],
  copyright:
    '© 2026 The5th Global Consulting. All rights reserved. Unauthorized copying, reproduction, distribution, use, or collection of any content or information from this website is strictly prohibited. Any unauthorized use may result in legal action. To the extent permitted by law, any dispute arising from or relating to the unauthorized use of this website or its content shall be subject to the exclusive jurisdiction of the competent courts of India.',
}
