/* ─────────────────────────────────────────────────────────────────────────
   /roadmap-session — ALL copy lives here so the founder can edit without
   touching code. Built against FUNNEL_BRIEF.md sections 4-6. Every line in
   this file was checked against section 4's compliance rules; see
   docs/changes.md for the line-by-line compliance check and the before/after
   for every section this replaces from /10k-roadmap.

   No dollar figure is ever paired with a deadline/timeframe as a promise to
   the reader. Dollar figures that remain are either (a) a user's own
   self-reported revenue range in the quiz — data, not a claim — or (b) a
   named, individual, already-documented case study result, which section 4
   explicitly allows when labeled as an individual result with a disclaimer
   next to it (done in every case-study card below).
   ───────────────────────────────────────────────────────────────────────── */

export const T = {
  bg: '#ffffff',
  surface: '#FAF6F0',
  surface2: '#FBF8F2',
  line: 'rgba(46,26,53,0.12)',
  lineStrong: 'rgba(46,26,53,0.22)',
  text: '#2E1A35',
  text2: '#645a6e',
  text3: '#9a93a2',
  accent: '#5E2E86',
  accentInk: '#5E2E86',
  accentSoft: 'rgba(94,46,134,0.12)',
  gold: '#E4C879',
  serif: "'Plus Jakarta Sans', 'Inter', system-ui, -apple-system, sans-serif",
  sans: "'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
} as const

export function calUrl(): string {
  return process.env.NEXT_PUBLIC_AUDIT_CAL_URL || process.env.NEXT_PUBLIC_RS_CAL_URL || 'https://cal.com/indrodip-ghosh-ut1vxh/60min'
}

export const HELP = {
  phone: '+1 (917) 967 6380',
  phoneHref: 'tel:+19179676380',
  email: 'support@the5thglobal.consulting',
  emailHref: 'mailto:support@the5thglobal.consulting',
}

export const RATING = { score: '4.8', text: 'from 76 coaches across 12 nations' }

/* ── Headline options (brief P0-1): 5 drafted, ranked, top one used ───────
   None pair a dollar figure with a deadline. Ranked on: how directly it
   promises an output (not income), how specific it is, and how little it
   needs the reader to already trust the brand to make sense. */
export const HEADLINE_OPTIONS = [
  {
    rank: 1,
    headline: 'A Free 60-Minute Working Session to Map Your Offer, Your Buyer, and Your Next 100 Days',
    why: 'Leads with "free," states the exact output in three concrete nouns, and makes no income promise at all — the strongest fit for section 5’s "promise outputs, not income" rule.',
  },
  {
    rank: 2,
    headline: 'Find the One Bottleneck Between Your Expertise and Steady Clients',
    why: 'Names the pain precisely (expertise that isn’t converting) without a number of any kind. Slightly less concrete about what the session itself produces.',
  },
  {
    rank: 3,
    headline: 'You Know Your Craft. Let’s Find Out Why It Isn’t Turning Into Clients Yet.',
    why: 'Warm, conversational, speaks to the exact frustration in section 5’s pain list. Less specific about the session format.',
  },
  {
    rank: 4,
    headline: 'One Free Session. One Clear Plan. The Next Step for Your Coaching or Consulting Business.',
    why: 'Short and declarative, good for a sticky mobile CTA bar, but reads slightly more generic than 1-3.',
  },
  {
    rank: 5,
    headline: 'Stop Guessing What’s Missing. Map Your Offer, Your Buyer, and Your Next 100 Days, Free.',
    why: 'Strong verb opener, but "stop guessing" edges toward a mild "you’re doing it wrong" framing that’s a little sharper than the brand’s warm, grown-up voice.',
  },
] as const

export const HEADLINE = HEADLINE_OPTIONS[0].headline

export const LANDING = {
  eyebrow: 'For coaches, consultants and experienced professionals',
  headline: HEADLINE,
  headlineSub: 'For coaches, consultants and service experts who already have real expertise, just not yet a predictable way to turn it into clients. Free, 60 minutes, 1:1 with Indrodip Ghosh. Not a pitch.',
  heroMicro: 'Free · 60 minutes · 1:1 with Indrodip · not a pitch',
  ctaPrimary: 'See If You Qualify',
  ctaPrimaryShort: 'See if you qualify, 2 min',
  ctaApply: 'Apply for Your Roadmap Session',
  ctaSecondary: { label: 'See Real Client Results', href: '#proof' },

  proof: {
    eyebrow: 'Proven, not theoretical',
    heading: 'Real client outcomes, not projections.',
    stats: ['$180,000 from a single client engagement', '$120,000 built from scratch', '$21,000+ from a book-launch funnel', '$18,000 from one paid challenge', '$14,193 in a client’s first 60 days'],
    disclaimer: 'These are documented individual client results. Results are not typical and results vary. They depend on the client’s experience, effort, offer, market, and factors outside our control.',
  },

  eligibility: {
    eyebrow: 'Who It’s For',
    heading: 'Who the Roadmap Session is for, and who it isn’t',
    forHeading: 'This is for you if…',
    forItems: [
      'You’re a coach, consultant, or service expert with real expertise, even if the business around it isn’t built yet.',
      'You’ve already spent money on programs that didn’t work and you’re done guessing.',
      'You know what you do is valuable. You just can’t say it in one sentence people understand.',
      'You’re ready to look honestly at what isn’t working and act on what we find.',
    ],
    notHeading: 'This probably isn’t for you if…',
    notItems: [
      'You’re only looking for free advice with no intent to act on it.',
      'You’re not currently running, or seriously building, a business of your own.',
    ],
  },

  reach: { stat: '76 coaches and consultants', body: 'across 12 nations, coached remotely, one call at a time.' },

  call: {
    eyebrow: 'What Happens in Your 60 Minutes',
    heading: 'The five things we’ll do together on the call',
    sub: 'Every Roadmap Session follows the same structure, in this order.',
    steps: [
      { n: '01', icon: 'search', t: 'Look at how you talk about what you do', d: 'Where your current positioning is losing buyers before they ever hear your offer.' },
      { n: '02', icon: 'tag', t: 'Find the sellable version of your expertise', d: 'The gap between what you know and what people will actually pay for.' },
      { n: '03', icon: 'target', t: 'Name your real buyer', d: 'One buyer, one expensive problem, specific enough to build a message around.' },
      { n: '04', icon: 'compass', t: 'Find the one bottleneck', d: 'Out of positioning, offer, leads, sales and conversion, the single thing actually in your way.' },
      { n: '05', icon: 'calendar', t: 'Build your next 100 days', d: 'A short, ordered plan for what to do first, second and third, so you leave with a next step, not just insight.' },
    ],
  },

  framework: {
    eyebrow: 'The Path',
    heading: 'The three things every Roadmap Session maps',
    sub: 'No dollar targets, no deadline. Just the three things that have to be true before steady clients happen.',
    stages: [
      { tag: 'Offer', t: 'What you sell', d: 'We find the part of your expertise people actually pay for. Rarely the part you’d choose yourself.' },
      { tag: 'Buyer', t: 'Who buys it', d: 'We define the one buyer with one expensive problem, specific enough that your next message writes itself.' },
      { tag: 'Reach', t: 'How you reach them', d: 'A repeatable way to start real conversations with people who already trust you. No daily posting required.' },
    ],
  },

  caseStudies: { eyebrow: 'Case Studies', heading: 'Client results from the Roadmap Method', expanderLabel: 'See all 14 case studies', collapseLabel: 'Show fewer' },

  founder: {
    eyebrow: 'Who You’ll Speak With',
    heading: 'Who you’ll speak with on the call',
    quote: 'I grew up surrounded by talented professionals who spent years helping families, communities, workplaces and businesses, yet rarely got paid for the value they created. That gap is what built The5th.',
    body: 'Indrodip Ghosh founded The5th Global Consulting after years as a marketer and funnel strategist watching the same pattern repeat: professionals with real expertise believed they had nothing worth selling, while people with far less experience built thriving businesses around far less knowledge. Every Roadmap Session is run by Indrodip personally, not a sales rep, not a junior coach.',
    name: 'Indrodip Ghosh',
    role: 'Founder, The5th Global Consulting',
  },
  founder2: {
    photo: '/images/manisha.png',
    quote: 'I’ve sat across the table with founders at every stage, from their first client to their tenth million in revenue, and the pattern is always the same. The plan was already there. What was missing was the execution discipline to run it like a real business.',
    body: 'Manisha is a business consultant who has helped scale multiple companies, bringing that operating experience directly into your Roadmap Session, pressure-testing your plan the way she would a real P&L, not handing you advice in theory.',
    name: 'Manisha',
    role: 'Managing Partner, The5th Global Consulting',
  },

  videoEyebrow: 'Client reviews after their Roadmap Session',
  videoHeading: 'Hear it from them directly.',
  videoSub: 'Unscripted reactions from clients after their Roadmap Session. Tap any clip to play.',

  press: { label: 'Our clients have been featured in', items: ['Forbes', 'The New York Times', 'HuffPost', 'Psychology Today', 'The Wall Street Journal', 'The Guardian', 'Yahoo Finance'] },

  faq: {
    eyebrow: 'Questions',
    heading: 'Roadmap Session FAQs',
    items: [
      { q: 'Is the call actually free?', a: 'Yes. The 60-minute Roadmap Session has no cost and no credit card required. We ask a short set of qualifying questions first so the time is well spent on both sides.' },
      { q: 'Is this a sales pitch disguised as a strategy session?', a: 'No. It’s a working session. We’re diagnosing your positioning, offer and bottleneck live. If it becomes clear that working together further would help, we’ll say so directly. It won’t be a surprise pitch.' },
      { q: 'What does working together cost?', a: 'We never discuss pricing on this page or in the Roadmap Session itself. If, after the call, it’s clear a paid program would genuinely help, we’ll talk about what that looks like and what it costs, openly, with no pressure to decide on the spot.' },
      { q: 'Is this therapy?', a: 'No. We work on money mindset, pricing, and the beliefs behind undercharging as part of the business work, but this isn’t clinical or therapeutic support. If you’re looking for that, please talk to a licensed professional.' },
      { q: 'What if I’ve already spent money on programs that didn’t work?', a: 'That’s who this is built for. Most people who book a Roadmap Session have already tried something that didn’t land. We start from what actually happened for you, not a generic script.' },
      { q: 'What if I’m not qualified?', a: 'The short quiz tells you immediately. If it’s not the right fit yet, we’ll say so and point you to a better next step instead of booking a call that won’t help you.' },
      { q: 'What do I need to prepare?', a: 'Nothing elaborate. Just know roughly your current monthly revenue, your average offer price, and how many qualified conversations you’re having each month. We do the rest together on the call.' },
      { q: 'What happens after the call?', a: 'You leave with a specific bottleneck identified and an ordered 100-day plan. For some people, that’s enough to execute alone. For others, we’ll talk about what working together further could look like.' },
    ],
  },

  nav: [
    { label: 'Proof', href: '#proof' },
    { label: 'The Path', href: '#path' },
    { label: 'FAQ', href: '#faq' },
    { label: 'Apply', href: '#quiz' },
  ],
} as const

/* ── Case studies (verbatim from /10k-roadmap/config.ts REAL_PROOF — no new
   names, numbers, or quotes invented). Every card carries consent: 'unknown'
   per the standing decision: kept on the page, flagged as not cleared for
   ads use until the founder confirms written consent (docs/open-questions.md). */
export type CaseStudy = { name: string; role: string; result: string; quote: string; photo?: string; consent: 'unknown' }
const mk = (c: Omit<CaseStudy, 'consent'>): CaseStudy => ({ ...c, consent: 'unknown' })

/* Featured first (brief P1 item 10): the 6 that best match a US woman 40+. */
export const FEATURED_CASES: CaseStudy[] = [
  mk({ name: 'Laurie', role: 'Dating Coach · TEDx speaker', result: '$14,193 in her first 60 days', quote: 'Repositioned from $79 to $249, 57 buyers and a 600-strong community within two months.', photo: '/clients/laurie.jpg' }),
  mk({ name: 'Angela', role: '10K Roadmap Accelerator', result: '$12,000 in 63 days', quote: '“I had never earned that from my own business in my life. The framework works if you work it.”', photo: '/clients/angela.jpg' }),
  mk({ name: 'Jeanne', role: '10K Roadmap Accelerator', result: '$8,000 in 56 days', quote: '“56 days later I had closed my first two clients and was earning more than I ever imagined possible.”', photo: '/clients/jeanne.jpg' }),
  mk({ name: 'Susan Taylor', role: 'Personal Finance Coach for Homemakers', result: '$8,000 in 3 months', quote: 'After $20,000+ spent across other programs with no results, we taught her how to create content, sell, and pitch without overwhelming herself. She built real confidence in the process.', photo: '/clients/cases/susan-taylor.jpg' }),
  // Torill's photo is intentionally omitted — no consent to use her image.
  mk({ name: 'Torill', role: 'Leadership Coach · returned after 15 years', result: '$210,000 from a single launch', quote: 'Came back with no current audience; we structured a $7,000 program and turned her reputation into revenue.' }),
  mk({ name: 'Amalia', role: 'Fitness Coach · 13-year Army veteran, Canada', result: '$16,000 in 5 months', quote: 'We built her business from the foundation: a unique positioning as a fitness coach with real military-grade discipline, and the funnel and outreach system to fill it.', photo: '/clients/cases/amalia.png' }),
]

/* Everything else, demoted behind the "See all 14" expander — none deleted. */
export const MORE_CASES: CaseStudy[] = [
  mk({ name: 'Shyama Prasad Goswami', role: 'B2B Growth Consultant · ex-Fortune 500 CEO', result: '$180,000 in 5 months', quote: 'We built his consulting practice from the ground up: a clear positioning statement around his credibility, an offer at a premium price point, and a client-acquisition approach leveraging his network and reputation.', photo: '/clients/cases/shyama-prasad-goswami.jpg' }),
  mk({ name: 'Girish', role: 'Celebrity Law of Attraction Coach · India', result: '$120,000 in 8 months', quote: 'We launched him inside the Roadmap program and built a two-tier offer, now running as his core revenue engine.', photo: '/clients/cases/girish.png' }),
  mk({ name: 'Abbas Jamie', role: 'Executive & Conscious-Living Coach · Indonesia', result: '$21,000+ in 2 months', quote: 'We built a full book-launch funnel: a free first chapter to warm the audience, a path to the full book, then a consultation offer into his premium coaching program.', photo: '/clients/cases/abbas-jamie.jpeg' }),
  mk({ name: 'Bharti Chauhan', role: 'Marriage & Couples Retreats · TEDx speaker, India', result: '$18,000+ from one challenge', quote: 'We built a paid challenge funnel: a webinar ticket, a dedicated landing page and community, automated show-up reminders, then a retreat pitch with phone follow-up to convert.', photo: '/clients/cases/bharti-chauhan.png' }),
  mk({ name: 'Gurpreet', role: 'Law of Attraction & Self Development Coach', result: '$18,000 in 3 months', quote: 'After $16,000 spent elsewhere with no return, we stripped everything back to fundamentals: clarified her offer, identified her ideal client, and built a simple outreach and conversion system she could run consistently.', photo: '/clients/cases/gurpreet.png' }),
  mk({ name: 'Maham Kabani', role: 'Social Media & Personal Branding Coach · Dubai', result: '$12,000 in 2 months', quote: 'After her first launch converted at 0%, we rebuilt her funnel from the ground up and repositioned her community as the core product instead of a side offer.', photo: '/clients/cases/maham-kabani.png' }),
  mk({ name: 'Max', role: 'Divorce Coach for Men · Vietnam War veteran, USA', result: '$9,000 in 3.5 months', quote: 'We built his divorce coaching practice from the ground up: positioning around authenticity and lived experience, an accessible price point, and a simple, direct outreach and conversion system.', photo: '/clients/cases/max.jpg' }),
  mk({ name: 'Seth', role: 'Roadmap Program Member', result: '2 clients in 42 days', quote: '“After revamping my offer with the framework, I sold two high-ticket packages within weeks. The clarity alone was worth more than I paid.”', photo: '/clients/seth.jpg' }),
]

/* ── Quiz (5 steps, brief section "Structure and logic changes" #1) ───────
   `reject` on the final step's "no" routes to not-a-fit; everything else is
   routing data, not a gate — re-derived server-side in /api/roadmap-session. */
export type Opt = { value: string; label: string }
export type Step =
  | { id: string; type: 'single'; prompt: string; helper?: string; options: Opt[] }
  | { id: 'contact'; type: 'contact'; prompt: string; helper?: string }

export const QUIZ: Step[] = [
  {
    id: 'business_type', type: 'single',
    prompt: 'What best describes what you do?',
    options: [
      { value: 'coach', label: 'I’m a coach' },
      { value: 'consultant', label: 'I’m a consultant' },
      { value: 'both', label: 'I’m both a coach and consultant' },
      { value: 'expert', label: 'I run another type of expert / service business' },
      { value: 'none', label: 'I’m not currently running a business' },
    ],
  },
  {
    id: 'revenue', type: 'single',
    prompt: 'What best describes your current average monthly revenue?',
    options: [
      { value: 'pre', label: 'I’m not generating revenue yet' },
      { value: 'u1k', label: 'Under $1,000/month' },
      { value: '1-3k', label: '$1,000–$3,000/month' },
      { value: '3-5k', label: '$3,000–$5,000/month' },
      { value: '5-10k', label: '$5,000–$10,000/month' },
      { value: '10k+', label: '$10,000+/month' },
    ],
  },
  {
    id: 'bottleneck', type: 'single',
    prompt: 'What’s the biggest thing standing between you and steady clients right now?',
    options: [
      { value: 'offer', label: 'My offer isn’t clear or isn’t converting' },
      { value: 'clients', label: 'I don’t have enough qualified leads' },
      { value: 'pricing', label: 'I’m undercharging, or not sure what to charge' },
      { value: 'confidence', label: 'Confidence and money mindset are holding me back' },
      { value: 'time', label: 'I don’t have a repeatable system, just scattered effort' },
    ],
  },
  { id: 'contact', type: 'contact', prompt: 'Where should we send your session prep sheet?', helper: 'We’ll use this to hold your spot and send your prep sheet before the call.' },
  {
    id: 'readiness', type: 'single',
    prompt: 'If we find the right plan, are you in a position to invest in support over the next 90 days?',
    options: [
      { value: 'yes', label: 'Yes' },
      { value: 'discuss', label: 'Need to discuss' },
      { value: 'no', label: 'No' },
    ],
  },
]

export const QUIZ_INTRO = { eyebrow: 'Private, 2-minute qualification', ctaFinish: 'Book my free session' }

/* ── Rejection / not-a-fit ──────────────────────────────────────────────── */
export const REJECT = {
  headline: 'This probably isn’t the right next step, yet.',
  sub: 'The Roadmap Session is built for people ready to solve a specific growth bottleneck, not just gather more free advice.',
  body: 'Based on your answers, now might not be the right time for a 1:1 strategy session. That’s completely fair, and it doesn’t close the door.',
  dontForce: 'Don’t force the next step before you’re ready for it.',
  altHeading: 'A better next step',
  altBody: 'Start with the free AI Business Assessment. It’s a shorter, self-serve way to see where your business stands right now.',
  altCta: 'Take the free AI Business Assessment',
  altHref: '/ai',
  altCta2: 'Explore the case studies',
  altHref2: '/results',
}

/* ── Thank-you page ────────────────────────────────────────────────────── */
export const THANKYOU = {
  badge: 'You’re booked',
  headline: 'You’re all set.',
  sub: 'Your free Roadmap Session is confirmed.',
  countdownLabel: 'Your call starts in',
  liveLabel: 'Your call is starting now',
  passedLabel: 'This call time has passed. Check your email, or rebook if you need to.',
  addHeading: 'Add it to your calendar',
  preCallVideo: { heading: 'A quick word before we meet', body: 'TODO(founder): record a 2–3 minute pre-call video so everyone who books sees your face before the call. Slot reserved below until the video exists.' },
  prepHeading: 'Bring these 3 numbers',
  prepItems: ['Your current average monthly revenue', 'Your average offer price', 'How many qualified conversations you’re having each month'],
  prepSub: 'That’s enough. We’ll do the rest together on the call.',
  smsOptIn: { label: 'Text me a reminder before my call', sub: 'Standard messaging rates may apply. Reply STOP anytime to opt out.' },
  next: [
    'You’ll receive your confirmation email and calendar invite.',
    'I’ll review your quiz answers before the call so we go straight to what matters.',
    'Bring three numbers: current monthly revenue, average offer price, and qualified leads per month.',
    'Come ready to be honest about what’s working, and what isn’t.',
  ],
  joinNote: 'Save this link, it’s where you’ll join when it’s time.',
  joinPending: 'Your video call link is being generated and will be in your confirmation email and calendar invite. It’ll also appear here in a moment.',
  saveTitle: 'Save this page',
  saveSub: 'Keep a link to this page so you can jump back to your countdown and join link anytime.',
  saveCta: 'Save / copy this page →',
  detailsPending: 'Your call is confirmed. Your calendar invitation and confirmation are on their way to your inbox.',
  emailPrompt: 'Enter the email you booked with to see your countdown and calendar links.',
  event: { title: 'Roadmap Session', description: 'A free, 60-minute 1:1 working session to map your offer, your buyer, and your next 100 days.' },
  testimonials: [
    { name: 'Laurie', quote: 'Repositioned from $79 to $249, 57 buyers and a 600-strong community within two months.', consent: 'unknown' as const },
    { name: 'Jeanne', quote: '“56 days later I had closed my first two clients and was earning more than I ever imagined possible.”', consent: 'unknown' as const },
  ],
}

/* ── Reminder sequence (copy only, section P2-14). Written in Indrodip's
   voice. Sending schedule needs comms-engine wiring — see docs/open-questions.md. */
export const REMINDERS = {
  instant: {
    channel: 'Email + SMS, sent immediately on booking',
    subject: 'You’re booked — here’s what to expect',
    body: 'Hey, it’s Indrodip. You’re booked for your free Roadmap Session. I’ll review your answers before we meet so we go straight to what matters. Bring three numbers: your current monthly revenue, your average offer price, and how many qualified conversations you’re having each month. See you then.',
  },
  h24: {
    channel: 'Email, 24 hours before',
    subject: 'Tomorrow: your Roadmap Session',
    body: 'Your Roadmap Session is tomorrow. Here’s the agenda: we’ll look at your positioning, name your buyer, find the one bottleneck in your way, and build your next 100 days. Nothing to prepare beyond your three numbers. If the time no longer works, you can reschedule here: {{reschedule_url}}',
  },
  h2: {
    channel: 'SMS, 2 hours before',
    subject: null,
    body: 'Hey, it’s Indrodip — your Roadmap Session is in 2 hours. Here’s your join link: {{join_url}}. See you soon.',
  },
  voiceNote: {
    channel: 'Personal SMS or voice note, the day before',
    subject: null,
    body: 'Hey, it’s Indrodip. Looking forward to our call tomorrow. Come as you are, no need to prepare a presentation, just bring your three numbers and be honest about what’s actually happening in your business. That’s all I need to help you find the bottleneck.',
  },
}

/* ── Unqualified nurture (3 emails, copy only, section "Structure and logic
   changes" #3 + P1 item 11). Sent to the email the quiz captured at step 4,
   even on an unqualified verdict (consistent with "contact capture at step 4
   fires Lead regardless of step 5"). Wiring the send schedule is a
   comms-engine config task, flagged in docs/open-questions.md. */
export const NURTURE = [
  {
    day: 0,
    subject: 'Your AI Business Assessment',
    body: 'Hey, it’s Indrodip. Based on your answers, now might not be the right time for a 1:1 Roadmap Session, and that’s completely fine. Start here instead: {{ai_assessment_url}}. It’s a free, self-serve way to see where your business actually stands right now.',
  },
  {
    day: 3,
    subject: 'The one thing that trips up most people at your stage',
    body: 'Hey, it’s Indrodip again. The most common thing I see at your stage isn’t a lack of expertise, it’s not being able to say what you do in one sentence a stranger understands. If that sounds familiar, the case studies here show how a few people fixed exactly that: {{case_studies_url}}.',
  },
  {
    day: 7,
    subject: 'Ready to talk it through?',
    body: 'If anything’s changed since you took the quiz, and you’d like to talk it through 1:1, you’re welcome to apply again here: {{roadmap_session_url}}. No pressure either way.',
  },
]

/* ── Legal (Meta-safe, matches /10k-roadmap/config.ts LEGAL) ──────────────*/
export const LEGAL = {
  earnings: 'This is a free strategy session and makes no guarantee of income or results. The case studies shown are the real experiences of specific clients. They are not a promise that you will achieve the same or similar outcomes. Results depend on your experience, effort, offer, market and factors outside our control.',
  meta: 'This site is not a part of the Facebook or Instagram website or Meta Platforms, Inc., and is not endorsed by Meta in any way. FACEBOOK and INSTAGRAM are trademarks of Meta Platforms, Inc.',
  links: [
    { label: 'Privacy', href: '/data-usage' },
    { label: 'Terms', href: '/data-usage' },
    { label: 'Code of Ethics', href: '/ethics' },
  ],
  copyright: '© 2026 The5th Global Consulting. All rights reserved. Unauthorized copying, reproduction, distribution, use, or collection of any content or information from this website is strictly prohibited. Any unauthorized use may result in legal action. To the extent permitted by law, any dispute arising from or relating to the unauthorized use of this website or its content shall be subject to the jurisdiction of the courts located in the State of New York.',
}
