/* ─────────────────────────────────────────────────────────────────────────
   The Business Roadmap Audit — INDIA edition.

   A self-contained copy of the /10k-roadmap funnel, localised for an Indian
   audience: all figures in INR (₹ / lakh / crore), no dollars. The original
   funnel is untouched — this only overrides the *copy* (and the video / cal /
   typeform env hooks). The shared UI kit, tracking and VSL player are reused
   from the parent funnel, so the two stay visually identical.

   Positioning (per brief):
     • Audience  — Indian working professionals & business owners.
     • Floor     — must ALREADY earn ≥ ₹1 lakh/month from a job or business to
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

/* ── Landing copy (INR, India) ─────────────────────────────────────────────*/
export const LANDING = {
  eyebrow: 'From the desk of a Consumer Behaviour & AI Researcher:',
  headline: 'Build a Predictable, Profitable Business From Your Expertise, in 6–12 Months.',
  headlineSub: 'Without quitting your job, running fancy funnels, cold DMs, or chasing people for appointments.',
  guaranteeLine: 'Build a predictable income from your own business, or get every rupee you invested back. ',
  guaranteeEmphasis: 'Yes, I’ll write the cheque.',
  guaranteeBadge: '100% Money-Back Guarantee',
  ctaPrimary: 'See If You Qualify',
  ctaMicro: '2-minute qualification · For professionals & founders already earning ₹1 lakh+/month',
  ctaMicroShort: '2-minute qualification',

  recognition: {
    heading: 'Your expertise isn’t the problem.',
    lines: [
      'You know your craft. You already earn well from your job or business. You may even have people who’d happily pay for your knowledge.',
      'But when you try to turn that expertise into your own predictable income, it looks like this:',
    ],
    rollercoaster: '₹2L → ₹0 → ₹1L → ₹0 → ₹3L…',
    after: 'you don’t have a predictable client-acquisition system. Posting more content won’t fix it. Neither will another funnel. Or another course. Or another 100 cold DMs.',
    turn: 'You have a ',
    turnEmphasis: 'bottleneck.',
    close: ['We find it.', 'We fix it.', 'Then we build the system around it.'],
  },

  roadmap: {
    eyebrow: 'The Business Roadmap',
    heading: 'A data-driven approach to a predictable, profitable business.',
    sub: 'Instead of throwing random tactics at your business, we analyse the six areas that decide whether prospects become paying clients.',
    steps: [
      { n: '01', t: 'Consumer Behaviour', d: 'What your ideal client actually wants, fears, believes, and needs to see before they buy.' },
      { n: '02', t: 'Positioning', d: 'Make your expertise immediately relevant to the people you want to attract.' },
      { n: '03', t: 'Offer', d: 'Turn your knowledge into an offer people understand, value, and want.' },
      { n: '04', t: 'Acquisition', d: 'A predictable way to get qualified prospects into your world, without living in your DMs.' },
      { n: '05', t: 'Conversion', d: 'Turn attention and conversations into paying clients.' },
      { n: '06', t: 'AI-Powered Optimization', d: 'Use AI to research, analyse, personalise, test, and improve your marketing faster.' },
    ],
    close: 'The objective isn’t more marketing. ',
    closeEmphasis: 'It’s more qualified buyers.',
  },

  stop: {
    heading: 'Stop doing what doesn’t work.',
    nots: [
      'Fancy 20-step funnels',
      'Cold-DMing strangers all day',
      'Begging people to book appointments',
      'Posting three times a day for “the algorithm”',
      'Constantly changing your offer',
      'Buying another course',
    ],
    lead: 'You need a simple system that answers four questions:',
    questions: ['Who do I sell to?', 'What do I sell them?', 'How do I get them interested?', 'How do I turn that interest into revenue?'],
    close: 'That’s the Business Roadmap.',
  },

  results: {
    heading: 'And it’s not just theory.',
    sub: 'The professionals and business owners we’ve worked with build something most never do:',
    // No currency figures — real, qualitative outcomes only (India edition).
    stats: ['Consistent monthly clients', 'A predictable pipeline', 'Premium pricing that holds', 'Systems, not daily hustle'],
    principle: 'Different businesses. Different markets. Different starting points. The same principle: find what’s preventing growth, fix it, scale what works.',
    disclaimer: 'Individual results vary. Past results are not typical and do not guarantee future results.',
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
      'You already earn at least ₹1 lakh/month from a job or a business.',
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

  how: {
    heading: 'Here’s how it works.',
    steps: [
      { n: '01', t: 'Apply', d: 'Complete the short qualification form. We’ll determine whether you’re a fit.' },
      { n: '02', t: 'Get your diagnosis', d: 'If invited, book your private strategy session, free of charge.' },
      { n: '03', t: 'Find the bottleneck', d: 'We identify the highest-leverage constraint between where you are and a predictable business income.' },
      { n: '04', t: 'Get the roadmap', d: 'You’ll know exactly what to fix, what to stop doing, and what to focus on next.' },
      { n: '05', t: 'Implement', d: 'Turn the strategy into a predictable client-acquisition system.' },
    ],
  },

  diagnosis: {
    heading: 'This isn’t another “pick my brain” call.',
    body: 'The call itself isn’t the product. The diagnosis is.',
    youLeave: ['What’s holding your business back.', 'Why it’s happening.', 'What needs to change.', 'What to prioritize.', 'And what to do next.'],
    close: 'No generic advice. No motivational speech. A diagnosis of your actual business.',
    cta: 'Get Your Business Diagnosed',
  },

  guarantee: {
    heading: 'I’m putting my money where my mouth is.',
    body: 'You’ve heard people make big promises before. So I’m making the risk simple.',
    terms: ['You do the work.', 'You follow the agreed strategy.', 'You meet the written eligibility requirements.'],
    payoff: 'And you don’t hit the guaranteed outcome we agree on?',
    big: 'You get every rupee of your investment back.',
    cheque: 'Yes. I’ll write the cheque.',
    fine: 'The guarantee is subject to the specific written terms, milestones, implementation requirements, and eligibility criteria provided before you commit.',
  },

  faq: [
    { q: 'What happens on the audit?', a: '60 minutes. We examine your positioning, offer, acquisition, and conversion, identify the bottleneck, and map the strategy I’d recommend.' },
    { q: 'How much does it cost?', a: 'Nothing right now. We’re running these audits at no charge while we refine the process. All we ask is that you qualify and actually show up.' },
    { q: 'Who is this for?', a: 'Professionals and business owners in India already earning at least ₹1 lakh/month from a job or a business, who want to turn their expertise into a predictable income of their own.' },
    { q: 'What if I’m not a fit?', a: 'If I determine that you’re genuinely not a fit for the process, I’ll point you to a better next step. No hard feelings.' },
  ],

  finalCta: {
    heading: 'Ready to build a predictable business from your expertise?',
    lines: ['Stop guessing. Stop chasing. Stop rebuilding your funnel.', 'Start building a predictable acquisition system.'],
    big: 'Build your predictable, profitable business in 6–12 months.',
    guarantee: 'Build a predictable income from your own business, or get every rupee you invested back.',
    cheque: 'Yes, I’ll write the cheque.',
    cta: 'See If You Qualify',
    micro: '2-minute qualification · For professionals & founders already earning ₹1 lakh+/month',
  },

  nav: [
    { label: 'The Roadmap', href: '#how' },
    { label: 'Proof', href: '#proof' },
    { label: 'FAQ', href: '#faq' },
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
    helper: 'This audit is built for people with a stable base of at least ₹1 lakh/month.',
    options: [
      { value: 'u50k', label: 'Under ₹50,000 / month', reject: true },
      { value: '50k-1l', label: '₹50,000 – ₹1,00,000 / month', reject: true },
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
    income: 'Based on your answers, you’re not yet at a stable ₹1 lakh/month base. The audit is built for people with that foundation to build on, so there are earlier, better-fitting steps for you right now.',
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
    '© 2026 The5th Consulting. All rights reserved. Unauthorized copying, reproduction, distribution, use, or collection of any content or information from this website is strictly prohibited. Any unauthorized use may result in legal action. To the extent permitted by law, any dispute arising from or relating to the unauthorized use of this website or its content shall be subject to the exclusive jurisdiction of the competent courts of India.',
}
