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
     NEXT_PUBLIC_WHOP_AUDIT_PLAN_ID  $29 "commitment deposit" plan id
   ───────────────────────────────────────────────────────────────────────── */

/* ── Design tokens ─────────────────────────────────────────────────────────
   2026-11-14: relit a second time to the premium dark-forest / acid-lime
   system specified for the global page (near-black + deep green undertones,
   lime as the one accent, pill CTAs) — replaces the earlier purple-on-black
   pass. Hero copy/layout/photo stay locked; only the shared accent color
   changes so the hero reads as part of one consistent system.
   Original site display serif is Cormorant Garamond (used across /results +
   case studies); this funnel keeps Plus Jakarta Sans for its own headlines.
   The psychology comes from the copy + structure as much as the interface. */
export const T = {
  bg: '#070A06',
  surface: '#121810',      // near-black forest, section separation / cards
  surface2: '#182014',
  line: 'rgba(255,255,255,0.09)',
  lineStrong: 'rgba(255,255,255,0.18)',
  text: '#F2F6EC',          // off-white ink, headings + primary copy
  text2: '#9AA79A',         // muted body
  text3: '#6F7D6F',         // faint / captions
  accent: '#C9FF48',        // acid lime, the one signal color (CTA fills, play buttons, badges)
  accentInk: '#C9FF48',     // same lime for emphasis text on black (AA on this bg)
  accentSoft: 'rgba(201,255,72,0.14)',
  accentText: '#0B0F08',    // near-black text used ON lime fills
  brand: '#F2F6EC',         // ink on this dark field
  danger: '#e5584a',
  radius: 18,
  // Clean, bold, modern. Headlines use Plus Jakarta Sans (700/800); body Inter.
  serif: "'Plus Jakarta Sans', 'Inter', system-ui, -apple-system, sans-serif",
  sans: "'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
} as const

export function videoUrl(): string {
  return process.env.NEXT_PUBLIC_AUDIT_VIDEO_URL || ''
}
export function auditPlanId(): string {
  return process.env.NEXT_PUBLIC_WHOP_AUDIT_PLAN_ID || 'plan_85pIPWE1K0uBB'
}

/* The Whop hosted product page every CTA on the global /10k-roadmap page
   links to directly for the $29 audit. Configure Whop's post-payment
   redirect to send buyers to
   https://the5thglobal.consulting/10k-roadmap/reserved (the post-payment page). */
export const AUDIT_CHECKOUT_URL = 'https://whop.com/checkout/plan_27RBggiz8MDCo/'

/* Post-payment page: the deep-questions Typeform, then the cal.com page buyers
   are auto-redirected to after they submit it. Both are env-overridable so you
   can swap the form / calendar without a deploy. */
export function auditTypeformId(): string {
  return process.env.NEXT_PUBLIC_AUDIT_TYPEFORM_ID || process.env.NEXT_PUBLIC_TYPEFORM_FORM_ID || 'u9maum7Y'
}
export function auditCalUrl(): string {
  return process.env.NEXT_PUBLIC_AUDIT_CAL_URL || 'https://cal.com/indrodip-ghosh-ut1vxh/60min'
}

export const DEPOSIT = { amount: 29, label: '$29', currency: 'USD' } as const

/* Support contact shown in the header of every funnel page. */
export const HELP = {
  phone: '+1 (917) 967 6380',
  phoneHref: 'tel:+19179676380',
  email: 'support@10kroadmap.org',
  emailHref: 'mailto:support@10kroadmap.org',
}

/* Social-proof rating (mirrors the /quiz + free-training funnel — real figure). */
export const RATING = { score: '4.8', text: 'from 76 coaches across 12 nations' }

/* "As featured in" press strip (styled wordmarks — same set as the /call page). */
export const PRESS = {
  label: 'Our clients have been featured in',
  items: ['Forbes', 'The New York Times', 'HuffPost', 'Psychology Today', 'The Wall Street Journal', 'The Guardian', 'Yahoo Finance', 'The Sydney Morning Herald'],
}

/* ── Landing copy ──────────────────────────────────────────────────────────
   Speero-style (speero.com/experimentation-services/full-service-experimentation-program):
   press strip, proof stats, a 3-column eligibility block ("is this for you"),
   a trajectory graph that is itself annotated with what's being taught at each
   stage, a numbered program-flow section for the call, detailed case-study
   cards, a founder/team credibility section, an FAQ accordion, then the
   application form itself with the footer directly below it, one page, no
   separate /qualify hop. Same plum/cream/purple palette throughout, no navy
   or gold. No video, the founder photo carries the hero. */
export const LANDING = {
  // ── HERO (locked) ─────────────────────────────────────────────────────
  // Per the 2026-11-14 brief: headline, subheadline, CTA wording, founder
  // image, layout and composition here are explicitly non-negotiable and
  // must not be rewritten. Only the shared accent color (T.accent) changes
  // around it, so it reads as part of one consistent system.
  eyebrow: 'For experienced coaches and consultants who are done buying programs',
  headline: 'You’ve Tried Coaches, ChatGPT And Claude. So Why Aren’t You Making Consistent Money?',
  headlineSub: 'Before you spend another dollar on coaching, courses, or marketing tools, let’s find out what’s actually holding your business back.',
  ctaPrimary: 'Apply for an Audit, $29, Refundable',
  ctaSecondary: { label: 'See Real Client Results', href: '#proof' },
  ctaMicro: '$29, fully refundable if it isn’t worth it to you. Credited toward any program if you book within 14 days.',
  guarantee: 'Tell me within 7 days if it wasn’t worth $29 to you, and I’ll refund you. You keep the written plan either way.',

  // Hero photo card: the credential badge sits on the photo itself, then
  // the session facts sit in a plain caption below it — same layout as
  // the India page's hero. Locked alongside the rest of the hero.
  heroCard: {
    name: 'Indrodip Ghosh',
    role: 'Founder, Business Growth Strategist & AI Researcher',
    credential: 'Consumer Psychologist, University of California, Berkeley',
    recruitedBy: 'Recruited by Google & Anthropic',
    featuredIn: 'Featured in ClickFunnels and Mastermind.com',
    chips: [
      { t: '1-on-1 Zoom Session', s: '60 Minutes' },
      { t: '$29 Only', s: 'Fully Refundable' },
    ],
  },

  // Every CTA OUTSIDE the locked hero uses this single, unambiguous wording,
  // so there is never a question what the $29 is for.
  ctaStandard: 'Book My 60-Minute Business Audit — $29',

  proof: {
    eyebrow: 'Proven, not theoretical',
    heading: 'Real client outcomes, not projections.',
    stats: ['$180K in 5 months', '$120K in 8 months', '$21K+ in 2 months', '$18K in 3 months', '$14,193 in 60 days'],
    disclaimer: 'Documented individual client results. Individual results vary; these are not typical.',
  },

  // ── Section 03: the problem — more advice vs. an actual diagnosis ──────
  problem: {
    eyebrow: 'Sound Familiar?',
    heading: 'You’ve Already Tried The Strategies. Maybe It’s Time To Examine The Business.',
    sub: 'Another course. Another marketing strategy. Another AI-generated action plan. But when you don’t know what’s actually holding your business back, more information can create more confusion.',
    moreAdvice: {
      title: 'More Advice',
      items: ['Another marketing course', 'Another generic funnel', 'Another list of AI-generated ideas', 'Another strategy to implement', 'More information', 'No clear priorities'],
    },
    diagnosis: {
      title: 'Actual Business Diagnosis',
      items: ['Examine your actual business', 'Review your positioning and offer', 'Identify your ideal buyer', 'Find your biggest bottleneck', 'Establish clear priorities', 'Receive a personalized action plan'],
    },
    close: 'Stop collecting strategies. Start understanding your business.',
  },

  // ── Section 04: the 60-minute audit process ─────────────────────────────
  call: {
    eyebrow: 'The 60-Minute Audit',
    heading: 'One Hour. Your Business. One Clear Direction.',
    sub: 'A short application, then the audit itself, in this order. Your personalized audit lands in your inbox within 48 hours.',
    note: 'Camera optional, audio-only is completely fine. Prefer not to get on a call at all? Tell us and we’ll run it as a written-only audit instead, for the same price.',
    steps: [
      { n: '01', icon: 'search', t: 'Understand your business', d: 'We start with what’s actually happening in your business right now, no assumptions carried over from a past program.' },
      { n: '02', icon: 'tag', t: 'Review your offer & positioning', d: 'How you currently describe what you do, your pricing, and where it’s losing buyers before they ever hear the offer.' },
      { n: '03', icon: 'target', t: 'Identify your ideal buyer', d: 'One buyer, one expensive problem, specific enough to build a message and an offer around.' },
      { n: '04', icon: 'compass', t: 'Find your biggest bottleneck', d: 'Out of positioning, offer, leads, sales and conversion, the single thing actually standing between you and consistent clients.' },
      { n: '05', icon: 'calendar', t: 'Build your action plan', d: 'A short, ordered plan for what to fix first, second and third, so you leave with a next step, not just insight.' },
    ],
  },

  // ── Section 05: everything you receive ──────────────────────────────────
  deliverables: {
    eyebrow: 'What You Receive',
    heading: 'More Than Just a 60-Minute Call.',
    sub: 'You’ll receive the recording, a personalized business audit and practical resources you can revisit and use after our conversation.',
    items: [
      { icon: 'video', t: 'Private Call Recording', d: 'Your complete 60-minute session recording so you can revisit the discussion, recommendations and important insights. Provided only when you’ve consented to recording.' },
      { icon: 'file', t: 'Personalized Business Audit PDF', d: 'A professional written assessment covering your current business position, offer and positioning, ideal customer analysis, biggest bottleneck, recommended changes and a priority action plan.' },
      { icon: 'map', t: 'Personalized 100-Day Roadmap', d: 'A structured action plan: what to fix first, what to prioritize next, what to stop doing, which marketing activities to focus on, and your next implementation milestones.' },
      { icon: 'calculator', t: 'Business Growth Calculators', d: 'Access to interactive tools, a revenue goal calculator, offer pricing calculator and client acquisition calculator, to help you understand your own numbers.' },
      { icon: 'brain', t: 'AI Implementation Toolkit', d: 'Relevant ChatGPT and Claude prompts to help you execute your audit recommendations.' },
      { icon: 'download', t: 'Downloadable Sample Report', d: 'See exactly what your personalized audit will look like before you book, an illustrative sample, not an actual client’s audit.' },
    ],
    sampleCta: 'Download Sample Audit PDF',
    sampleNote: 'Illustrative sample only, built to show the format and depth of your real audit. Not an actual client’s report.',
    note: 'The $29 covers the 60-minute session and the deliverables above, not 100 days of coaching or implementation. What you do with the roadmap afterward is up to you.',
  },

  // ── Section 06: interactive business calculators ───────────────────────
  calculators: {
    eyebrow: 'Know Your Numbers',
    heading: 'Your Entire Revenue Engine, On One Screen.',
    sub: 'Your revenue goal, your price and both of your conversion rates, run through one connected model, leads down to booked calls, down to clients, down to revenue. Adjust any input and watch the whole chain move.',
    disclaimer: 'For planning only. These are illustrative calculations based on the numbers you enter, not a prediction or a guarantee of revenue, clients or conversion rates.',
  },

  caseStudies: {
    eyebrow: 'Client Results',
    heading: 'Real Businesses. Real Client Outcomes.',
  },

  founder: {
    eyebrow: 'Who You’ll Speak With',
    heading: 'An honest second opinion, not another guru.',
    quote: 'I grew up surrounded by talented professionals who spent years helping families, communities, workplaces and businesses, yet rarely got paid for the value they created. That gap is what built The5th.',
    // Leads with the Western-recognized credentials, then discloses the
    // India base plainly, once, with no apology, reframed as an asset
    // (outside-the-bubble perspective) rather than hidden or defended.
    body: 'I’m also the founder of an AI startup, backed by University of California alumni, at an approximate valuation of $6M, and I’ve been recruited by Google, Anthropic, Mastermind.com and ClickFunnels along the way. I run The5th Global Consulting from Kolkata, India, working with coaches and consultants across the US and Canada, on your time zone. Working from outside the US coaching bubble means I’m not selling you the same playbook you’ve already bought. Every audit is run by me personally, not a sales rep, not a junior coach.',
    name: 'Indrodip Ghosh',
    role: 'Founder, The5th Global Consulting',
    stat: { value: '$29', label: 'Refundable 1:1 Audit, Written Plan In 48 Hrs' },
    // Western-recognized credentials, shown as a compact strip above the
    // quote (same credibility line used on the India page). The valuation
    // is the startup's, confirmed by the business owner, not personal
    // wealth, and does not guarantee outcomes for audit clients.
    creds: ['Consumer Psychologist, University of California, Berkeley', 'AI Startup Founder', '~$6M Startup Valuation'],
    credsNote: 'Valuation is an approximate estimate of the startup, not personal net worth, and does not guarantee outcomes for audit clients.',
  },

  // Second voice on the call: brought in for the operating/scaling side of
  // the conversation alongside Indrodip's positioning/offer expertise.
  founder2: {
    photo: '/images/manisha.png',
    quote: 'I’ve sat across the table with founders at every stage, from their first dollar to their first ten million, and the pattern is always the same. The plan was already there. What was missing was the execution discipline to run it like a real business.',
    body: 'Manisha is a business consultant who has helped scale multiple companies from $0 to $1M, and on to $10M in revenue. She brings that operating experience directly into your audit, pressure-testing your plan the way she would a real P&L, not handing you advice in theory.',
    name: 'Manisha',
    role: 'Managing Partner, The5th Global Consulting',
  },

  faq: {
    eyebrow: 'Before You Book',
    heading: 'Everything You Should Know.',
    items: [
      { q: 'What exactly am I paying $29 for?', a: 'A private 60-minute business audit, personally conducted by Indrodip, plus your personalized audit PDF, your 100-day roadmap, the business growth calculators and an AI implementation toolkit. That’s the entire product.' },
      { q: 'Who conducts the session?', a: 'Indrodip Ghosh, founder of The5th Global Consulting, personally. Not a sales rep, not a junior coach.' },
      { q: 'Will I receive the recording?', a: 'Yes, if you consent to being recorded. We ask explicitly before the session starts. If you’d rather not be recorded, the session still runs, you just won’t get a video back.' },
      { q: 'When will I receive my PDF?', a: 'Your personalized business audit PDF and 100-day roadmap land in your inbox within 48 hours of the session.' },
      { q: 'Is this a sales call?', a: 'No. It’s a working session, not a pitch. If it becomes clear that working together further would genuinely help, I’ll say so directly, there’s no surprise pitch and no pressure either way.' },
      { q: 'What if I’ve already spent thousands on coaching?', a: 'That’s exactly who this is built for. The audit isn’t another program to buy into, it’s a second, honest set of eyes on what you’ve already built, from someone with no stake in repeating advice you’ve already paid for.' },
      { q: 'What if the session isn’t worth $29 to me?', a: 'Tell me within 7 days and I’ll refund you in full. You keep the written plan regardless. If you book a program with us within 14 days, the $29 is credited toward it.' },
      { q: 'Can you guarantee $10K/month?', a: 'No, and anyone who promises that is selling you something other than an honest audit. We’ll show you documented results from real clients, your own results depend on your effort, your offer and your market.' },
      { q: 'What happens after the session?', a: 'You leave with a specific bottleneck identified, a written plan within 48 hours, and a few AI prompts for the next 30 days. For some people, that’s enough to execute alone. For others, we’ll talk about what working together further could look like.' },
      { q: 'Do I need to turn my camera on?', a: 'No. Audio-only is completely fine. If you’d rather not get on a call at all, tell us and we’ll run it as a written-only audit instead, for the same price.' },
      { q: 'Where are you based?', a: 'Kolkata, India. I work with coaches and consultants across the US, UK, Canada and Australia, on your time zone.' },
    ],
  },

  // ── Section 09: final booking card ──────────────────────────────────────
  apply: {
    eyebrow: 'Your Next Step',
    heading: 'Before You Spend Another Dollar on Your Business, Let’s Take a Look.',
    includes: [
      'A private 60-minute session with Indrodip',
      'Your personalized audit PDF',
      'Your call recording, subject to consent',
      'Your personalized 100-day action roadmap',
      'Interactive business growth calculators',
      'An AI implementation toolkit',
      'A 7-day full refund promise',
    ],
    priceNote: '$29 USD, one-time payment. No subscription, no long-term commitment.',
    micro: '$29, fully refundable within 7 days, credited toward any program if you book within 14 days. If we’re not the right fit, we’ll say so and point you to a better next step.',
  },

  nav: [
    { label: 'Proof', href: '#proof' },
    { label: 'The Process', href: '#call' },
    { label: 'What You Get', href: '#deliverables' },
    { label: 'Results', href: '#proof2' },
    { label: 'FAQ', href: '#faq' },
    { label: 'Book Your Audit', href: '#apply' },
  ],
}

/* ── Real social proof ─────────────────────────────────────────────────────
   Verbatim from case studies ALREADY published on the5thglobal.consulting
   (public/call, public/index.html). First names only (consent already
   exercised on the live site). No numbers/names invented. */
export type Proof = { name: string; role: string; result: string; quote: string; photo?: string }
// Ordered biggest result to smallest (Seth has no dollar figure, so he sits
// last). Keep new entries sorted by $ amount when adding more.
export const REAL_PROOF: Proof[] = [
  // Torill's photo is intentionally omitted, no consent to use her image
  // (mirrors the case-study page). The card renders a branded monogram instead.
  { name: 'Torill', role: 'Leadership Coach · returned after 15 years', result: '$210,000 from a single launch', quote: 'Came back with no current audience, we structured a $7,000 program and turned her reputation into revenue.' },
  { name: 'Shyama Prasad Goswami', role: 'B2B Growth Consultant · ex-Fortune 500 CEO', result: '$180,000 in 5 months', quote: 'We built his consulting practice from the ground up: a clear positioning statement around his credibility, an offer at a premium price point, and a client-acquisition approach leveraging his network and reputation.', photo: '/clients/cases/shyama-prasad-goswami.jpg' },
  { name: 'Girish', role: 'Celebrity Law of Attraction Coach · India', result: '$120,000 in 8 months', quote: 'We launched him inside the 10K Roadmap program and built a two-tier offer, an entry tier at $200/year and a platinum tier at $3,500/year, now running as his core revenue engine.', photo: '/clients/cases/girish.png' },
  { name: 'Abbas Jamie', role: 'Executive & Conscious-Living Coach · Indonesia', result: '$21,000+ in 2 months', quote: 'We built a full book-launch funnel: a free first chapter to warm the audience, a path to the full book, then a consultation offer into his premium $3,000 coaching program.', photo: '/clients/cases/abbas-jamie.jpeg' },
  { name: 'Bharti Chauhan', role: 'Marriage & Couples Retreats · TEDx speaker, India', result: '$18,000+ from one challenge', quote: 'We built a paid challenge funnel: a $2.99 webinar ticket, a dedicated landing page and WhatsApp community, automated show-up reminders, then a retreat pitch with phone follow-up to convert.', photo: '/clients/cases/bharti-chauhan.png' },
  { name: 'Gurpreet', role: 'Law of Attraction & Self Development Coach', result: '$18,000 in 3 months', quote: 'After $16,000 spent elsewhere with no return, we stripped everything back to fundamentals: clarified her offer, identified her ideal client, and built a simple outreach and conversion system she could run consistently.', photo: '/clients/cases/gurpreet.png' },
  { name: 'Amalia', role: 'Fitness Coach · 13-year Army veteran, Canada', result: '$16,000 in 5 months', quote: 'We built her business from the foundation: a unique positioning as a fitness coach with real military-grade discipline, an $8,000 premium program, and the funnel and outreach system to fill it.', photo: '/clients/cases/amalia.png' },
  { name: 'Laurie', role: 'Dating Coach · TEDx speaker', result: '$14,193 in her first 60 days', quote: 'Repositioned from $79 to $249, 57 buyers and a 600-strong community within two months.', photo: '/clients/laurie.jpg' },
  { name: 'Angela', role: '10K Roadmap Accelerator', result: '$12,000 in 63 days', quote: '“I had never earned that from my own business in my life. The framework works if you work it.”', photo: '/clients/angela.jpg' },
  { name: 'Maham Kabani', role: 'Social Media & Personal Branding Coach · Dubai', result: '$12,000 in 2 months', quote: 'After her first launch converted at 0%, we rebuilt her funnel from the ground up and repositioned her community as the core product instead of a side offer.', photo: '/clients/cases/maham-kabani.png' },
  { name: 'Max', role: 'Divorce Coach for Men · Vietnam War veteran, USA', result: '$9,000 in 3.5 months', quote: 'We built his divorce coaching practice from the ground up: positioning around authenticity and lived experience, an accessible price point, and a simple, direct outreach and conversion system.', photo: '/clients/cases/max.jpg' },
  { name: 'Jeanne', role: '10K Roadmap Accelerator', result: '$8,000 in 56 days', quote: '“56 days later I had closed my first two clients and was earning more than I ever imagined possible.”', photo: '/clients/jeanne.jpg' },
  { name: 'Susan Taylor', role: 'Personal Finance Coach for Homemakers', result: '$8,000 in 3 months', quote: 'After $20,000+ spent across other programs with no results, inside the 10K Roadmap program we taught her how to create content, sell, and pitch without overwhelming herself. She built real confidence in the process.', photo: '/clients/cases/susan-taylor.jpg' },
  { name: 'Seth', role: '10K Roadmap Member', result: '2 clients in 42 days', quote: '“After revamping my offer with the framework, I sold two high-ticket packages within weeks. The clarity alone was worth more than I paid.”', photo: '/clients/seth.jpg' },
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

/* Post-payment intake (AFTER the $29 commitment, BEFORE picking a time).
   Deliberately short — three questions, each answerable by typing or by
   voice — so we have just enough context to make the 60 minutes specific,
   without turning the moment right after payment into a long form. */
export const DEEP: Q[] = [
  { id: 'd_business', type: 'text', prompt: 'What’s your business called, and what do you help people do?', placeholder: 'e.g. “Clarity Coaching — I help new managers lead with confidence.”' },
  { id: 'd_stuck', type: 'text', long: true, prompt: 'What’s the one thing you’ve been trying to fix that still hasn’t changed?', placeholder: 'Be specific, this is what we’ll go after first on the call.' },
  {
    id: 'd_revenue', type: 'single', prompt: 'What best describes your current average monthly revenue?',
    options: [
      { value: 'pre', label: 'Not generating revenue yet' },
      { value: 'u1k', label: 'Under $1,000/month' },
      { value: '1-3k', label: '$1,000–$3,000/month' },
      { value: '3-5k', label: '$3,000–$5,000/month' },
      { value: '5-10k', label: '$5,000–$10,000/month' },
      { value: '10k+', label: '$10,000+/month' },
    ],
  },
]

/* ── Qualified transition + reserve screen ─────────────────────────────────*/
export const RESERVE = {
  headline: 'Your answers suggest there may be a real opportunity here.',
  sub: 'Let’s find out what’s actually standing between your business and consistent $10K months.',
  bodyHeading: 'The next step is a private 60-minute $10K Roadmap Audit.',
  body: 'On the call, we’ll look at your positioning, offer, lead generation, sales and conversion path, and identify the bottleneck I’d fix first.',
  includes: [
    'A private 60-minute strategy session',
    'A live audit of your positioning, offer, lead gen, sales & conversion',
    'The single bottleneck I’d fix first, and the path around it',
    'Your business reviewed from your answers before we meet',
  ],
  depositNote: 'The $29 is a commitment deposit to reserve your private audit slot, not the price of the advice.',
  cta: 'Reserve My Audit, $29',
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
  sub: 'Choose a time that works for you. We’ll use your answers to make the 60 minutes extremely specific to your business.',
  offerTitle: 'Your $10K Roadmap Audit',
  offerPoints: ['60 minutes', 'Private strategy session', 'Your business reviewed before the call', '$29 deposit applied per the stated terms'],
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

/* ── 3-step booking wizard ─────────────────────────────────────────────────
   Qualify → Pick a Time → A Few Questions → Confirmation.
   The audit is free while we validate the copy + VSL, so there is no payment
   step and no server-side pay gate. */
export const STEPS = [
  { key: 'schedule', label: 'Pick a Time', href: '/10k-roadmap/schedule' },
  { key: 'questions', label: 'A Few Questions', href: '/10k-roadmap/questions' },
  { key: 'confirmed', label: 'Confirmation', href: '/10k-roadmap/thank-you' },
] as const

export const PAY = {
  eyebrow: 'Step 1 of 4 · Commitment deposit',
  headline: 'Book a 1:1 Call to Map Your Exact Path to $10K/Month',
  sub: 'A focused strategy session where we diagnose what’s blocking your coaching or consulting business from consistent $10K months, and build your plan to fix it.',
  notPitch: 'This is a 1:1 call with Indrodip, not a sales pitch disguised as a strategy session.',
  coverLead: 'In 60 minutes, we’ll cover:',
  points: [
    'Where your current offer, pricing, or positioning is leaking revenue',
    'The single biggest gap standing between you and consistent $10K months',
    'A clear, prioritized action plan you can start using immediately after the call',
  ],
  fit: 'This works if you’re a coach or consultant who has some traction but hasn’t cracked consistency. You know your expertise is valuable, you’re just not converting it into predictable revenue yet.',
  deposit: 'Your $29 deposit reserves your spot and is fully refundable: attend the call and it’s returned to you either way.',
  guaranteeTitle: '30-Day Money-Back Guarantee',
  guaranteeBody: 'If you attend the call and feel it didn’t give you real clarity or a usable next step, email us within 30 days for a full refund. No conditions attached.',
  micro: 'Secure checkout · Powered by Whop · Apple Pay & Google Pay',
}

export const GATE = {
  verifying: 'Confirming your payment…',
  verifyingSub: 'This takes just a moment. Please don’t close this tab.',
  blockedHeadline: 'Payment required to continue.',
  blockedSub: 'This step unlocks once your $29 deposit is confirmed. If you just paid, give it a few seconds and refresh. Otherwise, complete your deposit to continue.',
  blockedCta: 'Go to payment →',
}

export const SCHEDULE = {
  eyebrow: 'Step 1 of 3 · Pick a time',
  headline: 'Choose your audit time.',
  sub: 'Grab the slot that works for you. Next we’ll ask a few quick questions so your 60 minutes are laser-specific to your business.',
  loading: 'Loading available times…',
}

export const CONFIRMED = {
  eyebrow: 'Step 4 of 4',
  badge: 'You’re booked',
  headline: 'You’re all set.',
  sub: 'Your $10K Roadmap Audit is confirmed.',
  refundReminder: 'Reminder: your $29 is a refundable commitment deposit. If you’re genuinely unqualified for the process, it’s refunded per our policy.',
}

/* ── Post-payment intake + booking (native question flow, then Cal inline) ──*/
export const RESERVED_WHY = {
  eyebrow: 'You’re In — One Quick Step',
  headline: 'Just three quick questions before we pick a time.',
  body: 'Type your answers, or tap the mic and just talk. This is how we make your 60 minutes specific to your business instead of generic.',
  footnote: 'Takes about a minute. Then you’ll pick the time that works for you.',
  bookingEyebrow: 'Last Step',
  bookingHeadline: 'Pick a time that works for you.',
  bookingSub: 'Your audit is reserved — choose the slot below and you’re fully booked.',
  errorHint: 'The booking calendar couldn’t load. Please refresh the page to continue.',
  errorCta: 'Refresh',
}

/* ── Thank-you page (after cal.com booking) ────────────────────────────────*/
export const THANKYOU = {
  badge: 'You’re booked',
  headline: 'You’re all set.',
  sub: 'Your $10K Roadmap Audit is confirmed.',
  countdownLabel: 'Your call starts in',
  liveLabel: 'Your call is starting now',
  passedLabel: 'This call time has passed. Check your email, or rebook if you need to.',
  addHeading: 'Add it to your calendar, so you get a reminder',
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
    'Bring three numbers: current monthly revenue, average offer price, and qualified leads per month.',
    'Come ready to be honest about what’s working, and what isn’t.',
  ],
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
  copyright:
    '© 2026 The5th Global Consulting. All rights reserved. Unauthorized copying, reproduction, distribution, use, or collection of any content or information from this website is strictly prohibited. Any unauthorized use may result in legal action. To the extent permitted by law, any dispute arising from or relating to the unauthorized use of this website or its content shall be subject to the jurisdiction of the courts located in the State of New York.',
}
