'use client'

import React, { useState, useEffect, useMemo, useRef } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'

/* ════════ Brand tokens (shared with /quiz/results + AI Home) ════════ */
const C = {
  cream: '#FAF6F0', ivory: '#FBF8F2', creamMid: '#F4EEE4', creamDeep: '#EAE3D8',
  plum: '#3D2645', plumDark: '#2E1A35', plumDeep: '#231029',
  gold: '#C9A84C', goldSoft: '#E4C879', goldDeep: '#B0902F', goldLine: 'rgba(201,168,76,.32)',
  green: '#1C4A32',
  ink: '#1A1A2E', inkMid: '#403b3b', inkSoft: '#5a5550', muted: '#8A8075', border: '#E2DCD2', white: '#fff',
}

/* ════════ Case study data ════════ */
type Metric = { v: string; l: string }
interface Study {
  slug: string
  name: string
  image?: string        // optional — falls back to a branded monogram poster
  videoUrl?: string     // optional — when set, the card shows a ▶ badge + modal embeds it
  category: string      // broad — drives the niche shelves + filter chips
  niche: string         // specific — shown on the card + searchable
  location: string
  tagline: string
  background: string
  challenge: string
  whatWeDid: string
  headline: { v: string; period: string }
  metrics?: Metric[]
  bullets?: string[]
  tags: string[]        // extra search keywords
}

const STUDIES: Study[] = [
  {
    slug: 'abbas-jamie',
    name: 'Abbas Jamie',
    image: '/clients/abbas.jpg',
    category: 'Leadership & Executive',
    niche: 'Executive & conscious-living coaching',
    location: 'Indonesia',
    tagline: 'From Corporate CEO to Conscious Living Advocate',
    background:
      "Abbas spent years as a CEO at one of South Africa's most recognized companies — a life of status, luxury, and relentless pressure. He walked away, relocated to a quiet island in Indonesia, and rebuilt his life around simplicity. He turned that transformation into a coaching practice serving burned-out executives.",
    challenge:
      'A powerful story and proven philosophy, but no system to monetize it. He had written a book but needed a launch strategy to build an audience and convert readers into clients within a defined timeframe.',
    whatWeDid:
      "We built a full book-launch funnel: a lead campaign offering the first chapter free to warm the audience, nurtured toward buying the full book, then a consultation offer, and finally an invite into Abbas's premium $3,000 coaching program.",
    headline: { v: '$21,000+', period: 'in 2 months' },
    metrics: [
      { v: '400', l: 'chapter downloads' },
      { v: '190', l: 'books purchased' },
      { v: '25', l: 'consults booked' },
      { v: '7', l: 'enrolled at $3,000' },
    ],
    tags: ['book launch', 'funnel', 'executive', 'ceo', 'south africa', 'burnout', 'lead generation'],
  },
  {
    slug: 'laurie-gerber',
    name: 'Laurie Gerber',
    image: '/clients/laurie.jpg',
    category: 'Relationships',
    niche: 'Dating coach for professionals 50+',
    location: 'USA',
    tagline: 'Relaunching a Stalled Course into a Profitable, Community-Led Program',
    background:
      'Laurie is a dating coach with 20 years of experience and a TEDx talk, helping professionals over 50 find meaningful relationships. Despite her credibility, a previous course launch had underperformed.',
    challenge:
      'She needed to relaunch with a strategy that matched her authority and justified a higher price. The previous launch at $79 did not reflect the true value of her offer.',
    whatWeDid:
      'We rebuilt the launch around three pillars: a targeted webinar feeding a dedicated Facebook community, the replay used inside the community to keep building trust, and a price reposition from $79 to $249.',
    headline: { v: '$14,193', period: 'in 60 days' },
    metrics: [
      { v: '600', l: 'community members' },
      { v: '57', l: 'enrolled at $249' },
      { v: '$79→$249', l: 'price repositioned' },
    ],
    tags: ['webinar', 'course', 'community', 'dating', 'professionals over 50', 'tedx', 'facebook'],
  },
  {
    slug: 'bharti-chauhan',
    name: 'Bharti Chauhan',
    image: '/clients/c3.jpg',
    category: 'Relationships',
    niche: 'Marriage & couples retreats',
    location: 'India',
    tagline: 'Reviving a Decade-Old Retreat Program with a Low-Ticket Funnel',
    background:
      'Bharti is a marriage coach and TEDx speaker who has run couples retreats for over ten years. The retreats were transformative, but attendance had declined and selling tickets directly at $700 per couple no longer drove demand.',
    challenge:
      'She needed to rebuild interest, reach new couples who did not know her, and create a low-friction entry point into her higher-ticket retreat.',
    whatWeDid:
      'We built a paid challenge funnel: a $2.99 webinar ticket, a dedicated landing page and WhatsApp community, automated phone reminders for show-up, then a retreat pitch with phone follow-up to convert.',
    headline: { v: '$18,000+', period: 'from one challenge' },
    metrics: [
      { v: '477', l: 'registrations' },
      { v: '$1,426', l: 'ticket sales' },
      { v: '38', l: 'couples at $700' },
    ],
    tags: ['challenge funnel', 'webinar', 'retreat', 'couples', 'marriage', 'tedx', 'whatsapp', 'low ticket'],
  },
  {
    slug: 'gurpreet',
    name: 'Gurpreet',
    image: '/clients/c4.jpg',
    category: 'Business & Consulting',
    niche: 'Coaching business, from zero',
    location: '',
    tagline: 'From Zero Revenue to $18,000 in 3 Months',
    background:
      'Gurpreet came in with no active income. She had already invested more than $16,000 across multiple programs with no return, and was exhausted and close to giving up.',
    challenge:
      'She needed a clear, executable system to move from zero to paying clients without adding more complexity to an already overwhelming situation.',
    whatWeDid:
      'We stripped everything back to fundamentals: clarified her offer, identified her ideal client, and built a simple outreach and conversion system she could run consistently — no complicated funnels.',
    headline: { v: '$18,000', period: 'in 3 months' },
    bullets: [
      'From $0 to her first paying clients within weeks',
      'Built a repeatable client-acquisition process from scratch',
      'Revenue on a business that had previously produced nothing',
    ],
    tags: ['outreach', 'from zero', 'first clients', 'offer clarity', 'overwhelm'],
  },
  {
    slug: 'shyama-prasad-goswami',
    name: 'Shyama Prasad Goswami',
    image: '/clients/c5.jpg',
    category: 'Business & Consulting',
    niche: 'B2B growth consulting',
    location: '',
    tagline: 'A Fortune 500 CEO Builds a High-Ticket Consulting Practice After Retirement',
    background:
      'Shyama spent decades as CEO of a billion-dollar Fortune 500 company across textiles and pharmaceuticals. After retiring he wanted to help small and mid-size companies grow, but had no system to package or sell that expertise.',
    challenge:
      'Unquestionable authority and decades of results, but no structured offer, no positioning in a new market, and no process for attracting clients outside the corporate world.',
    whatWeDid:
      'We built his consulting practice from the ground up: a clear positioning statement around his credibility, an offer at a premium price point, and a client-acquisition approach leveraging his network and reputation.',
    headline: { v: '$180,000', period: 'in 5 months' },
    bullets: [
      'Launched a structured consulting offer for the first time',
      'Secured high-value clients from his target market',
      'Turned corporate authority into a sellable offer',
    ],
    tags: ['consulting', 'fortune 500', 'ceo', 'pharmaceutical', 'textile', 'high-ticket', 'retirement', 'b2b'],
  },
  {
    slug: 'torill',
    name: 'Torill',
    image: '/clients/toril.jpg',
    category: 'Leadership & Executive',
    niche: 'Leadership coaching',
    location: 'Norway',
    tagline: 'A Celebrity Coach Returns After 15 Years and Sells Out a $7,000 Program',
    background:
      'Torill is a leadership coach in Norway whose career reached the highest levels — she consulted governments, not just entrepreneurs. After 15 years at the top she stepped away, and needed to re-enter with a program matching her caliber.',
    challenge:
      'She had not launched publicly in over a decade. Despite an exceptional track record, she had no current audience, no active platform, and no system for filling a high-ticket program.',
    whatWeDid:
      'We built her re-entry from scratch: a $7,000 leadership program for high performers, positioned around the depth only her background could deliver, with the launch system, audience, and conversion pathway.',
    headline: { v: '$210,000', period: 'in 3 months' },
    metrics: [
      { v: '15 yrs', l: 'back to market' },
      { v: '30', l: 'enrolled at $7,000' },
      { v: '1', l: 'program launch' },
    ],
    tags: ['leadership', 'norway', 'high-ticket', 'relaunch', 'government', 'executive'],
  },
  {
    slug: 'amalia',
    name: 'Amalia',
    image: '/clients/c7.jpg',
    category: 'Health & Fitness',
    niche: 'Fitness coaching',
    location: 'Canada',
    tagline: 'From Army Veteran and Stay-at-Home Mom to Six-Figure Fitness Coach',
    background:
      'Amalia served in the Canadian Army for 13 years, then spent years as a stay-at-home mother — disciplined and passionate about fitness, but with no path to turn that passion into income.',
    challenge:
      'She needed to package her fitness knowledge into a professional offer, position herself credibly, and build a client-acquisition system — all while starting from zero as a business owner.',
    whatWeDid:
      'We built her business from the foundation: a unique positioning as a fitness coach with real military-grade discipline, an $8,000 premium program, and the funnel and outreach system to fill it.',
    headline: { v: '$16,000', period: 'in 5 months' },
    bullets: [
      'Launched her first professional coaching offer',
      'Built a client-acquisition system from scratch',
      'Signed clients into an $8,000 program',
    ],
    tags: ['fitness', 'army', 'veteran', 'canada', 'premium', 'stay at home mom'],
  },
  {
    slug: 'girish',
    name: 'Girish',
    image: '/clients/c8.jpg',
    category: 'Mindset',
    niche: 'Celebrity Law of Attraction coaching',
    location: 'India',
    tagline: "A Celebrity Law of Attraction Coach's Comeback",
    background:
      'Girish is a well-known celebrity coach in India. Personal setbacks, including a divorce, pulled him out of work for a year. He was ready to return and build a structured way to help people again.',
    challenge:
      'He had authority and an audience but no tiered offer to convert either into consistent revenue.',
    whatWeDid:
      'We launched him inside the 10K Roadmap program and built a two-tier offer: an entry tier at $200/year and a platinum tier at $3,500/year — now running as his core revenue engine.',
    headline: { v: '$120,000', period: 'in 8 months' },
    metrics: [
      { v: '$200 / $3,500', l: 'two-tier offer' },
      { v: '$35,000', l: 'paid ad spend' },
      { v: '8 mo', l: 'to $120K' },
    ],
    tags: ['law of attraction', 'mindset', 'manifestation', 'celebrity', 'india', 'comeback', 'two-tier offer', 'coaching'],
  },
  {
    slug: 'max',
    name: 'Max',
    image: '/clients/c9.jpg',
    category: 'Relationships',
    niche: 'Divorce coaching for men',
    location: 'USA',
    tagline: 'An American War Hero Turns Personal Pain into a Divorce Coaching Practice',
    background:
      'Max is an American veteran who lost his leg in the Vietnam War. Two divorces gave him hard-won perspective on loss, identity, and rebuilding — and he wanted to guide other men through the same.',
    challenge:
      'A story that commanded respect and a rare perspective, but no structured offer, no clear positioning, and no system to reach men in the middle of one of the hardest experiences of their lives.',
    whatWeDid:
      'We built his divorce coaching practice from the ground up: positioning around authenticity and lived experience, an accessible price point, and a simple, direct outreach and conversion system.',
    headline: { v: '$9,000', period: 'in 3.5 months' },
    bullets: [
      'Launched his coaching practice for the first time',
      'Signed paying clients within the first weeks',
      'Positioned around lived experience, not credentials alone',
    ],
    tags: ['divorce', 'men', 'veteran', 'vietnam', 'war hero', 'authenticity'],
  },
  {
    slug: 'maham-kabani',
    name: 'Maham Kabani',
    category: 'Personal Branding',
    niche: 'Social media & personal branding',
    location: 'Dubai',
    tagline: 'From a Failed Storytelling Course to a Converting Funnel',
    background:
      'Maham moved from Pakistan to Dubai to build a social media and personal branding business. She had the skill and the audience but no proven system to turn either into revenue.',
    challenge:
      'Her first storytelling course launch failed. The funnel was wrong, the upsell sequence was wrong, and the offer sat at 0% conversion.',
    whatWeDid:
      'We rebuilt her funnel from the ground up and repositioned her community as the core product instead of a side offer.',
    headline: { v: '$12,000', period: 'in 2 months' },
    metrics: [
      { v: '0% → 15%', l: 'conversion rate' },
      { v: '$47', l: 'avg revenue / customer' },
      { v: '$5,000', l: 'ad spend' },
    ],
    tags: ['social media', 'personal branding', 'funnel', 'storytelling', 'community', 'dubai', 'pakistan', 'upsell'],
  },
  {
    slug: 'angela',
    name: 'Angela',
    category: 'Career Coaching',
    niche: 'Career coaching',
    location: 'UK',
    tagline: '20 Years in Education, Turned Into a Coaching Offer',
    background:
      "Angela spent 20 years working in education and NGOs across the UK, watching job outcomes for students deteriorate year over year. She wanted to build a course and coaching program to address it directly.",
    challenge:
      "She had deep expertise but no clear offer and no framework for understanding her audience's real pain points.",
    whatWeDid:
      "Over 3 months of coaching, we defined her offer, clarified her audience's pain, and rebuilt her messaging to speak to it directly.",
    headline: { v: '$2,500', period: 'first revenue, in 2 months' },
    bullets: [
      'First sale closed within 2 months of joining',
      '$2,500 in first revenue',
      'Offer and messaging built around real audience pain',
    ],
    tags: ['career coaching', 'education', 'ngo', 'uk', 'offer clarity', 'messaging', 'first sale', 'course'],
  },
  {
    slug: 'gabe',
    name: 'Gabe',
    category: 'Health & Fitness',
    niche: 'Fitness coaching for men 40+',
    location: '',
    tagline: 'Leaving a Job to Build a Coaching Business for Men 40+',
    background:
      'Gabe wanted to leave his job and build a coaching program for men over 40. He had the intent but lacked mental clarity on what to actually offer.',
    challenge:
      'No clear offer, no clarity on positioning, no momentum.',
    whatWeDid:
      'Over 3 months, we helped him define his offer and launch his coaching program with a long-term business focus rather than a quick win.',
    headline: { v: 'Launched', period: 'program live, momentum built' },
    bullets: [
      'Coaching program successfully launched',
      'Clear offer and positioning built',
      'Momentum established; results tracking toward long-term goals (work in progress)',
    ],
    tags: ['fitness', 'men over 40', 'coaching', 'positioning', 'offer', 'launch', 'long-term'],
  },
  {
    slug: 'kate-winchester',
    name: 'Kate Winchester',
    category: 'Health & Fitness',
    niche: "Women's wellness coaching",
    location: 'New Zealand',
    tagline: 'A New Zealand Bodybuilder Turns Her Own Struggle Into a Business',
    background:
      'Kate is a successful bodybuilder in New Zealand who privately struggled with anxiety and depression. She wanted to help other women navigate the same.',
    challenge:
      'Her first program launch converted at zero.',
    whatWeDid:
      'Inside the community program, we rebuilt her audience targeting, her offer, and her content strategy.',
    headline: { v: '$2,500', period: 'first revenue' },
    bullets: [
      'First $2,500 in revenue after a zero-conversion launch',
      'Right audience and offer identified and validated',
      'Content strategy rebuilt around her own story',
    ],
    tags: ["women's wellness", 'anxiety', 'depression', 'bodybuilder', 'new zealand', 'community', 'offer', 'content'],
  },
  {
    slug: 'milesa-arjoon-greene',
    name: 'Milesa Arjoon Greene',
    category: 'Mindset',
    niche: 'EFT & anxiety coaching',
    location: '',
    tagline: '20 Years in Corporate, Rebuilt Into an EFT Coaching Business',
    background:
      'Milesa spent 20 years in corporate before deciding to retire from it and help other women overcome anxiety through EFT.',
    challenge:
      'Her first launch failed to generate revenue.',
    whatWeDid:
      'Inside the community program, we clarified her offer, defined her content strategy, and gave her a clear channel-specific messaging strategy.',
    headline: { v: '$4,500', period: 'in 3 months' },
    bullets: [
      'Clear offer defined and validated',
      'Content strategy built from scratch',
      'Channel-specific messaging strategy in place',
    ],
    tags: ['eft', 'anxiety', 'women', 'corporate', 'tapping', 'content strategy', 'messaging', 'emotional freedom technique'],
  },
]

const CATEGORIES = ['All', ...Array.from(new Set(STUDIES.map(s => s.category)))]

/* ════════ Video testimonials — on-camera reviews from paid consultations ════════ */
interface VideoReview { src: string; w: number; h: number }
const VIDEO_REVIEWS: VideoReview[] = [
  { src: 'https://www.facebook.com/plugins/video.php?height=314&href=https%3A%2F%2Fwww.facebook.com%2Freel%2F1628699258559837%2F&show_text=false&width=560&t=0', w: 560, h: 314 },
  { src: 'https://www.facebook.com/plugins/video.php?height=314&href=https%3A%2F%2Fwww.facebook.com%2Freel%2F2068186330612350%2F&show_text=false&width=560&t=0', w: 560, h: 314 },
  { src: 'https://www.facebook.com/plugins/video.php?height=314&href=https%3A%2F%2Fwww.facebook.com%2Fthinkwithindrodip%2Fvideos%2F1041170600725458%2F&show_text=false&width=560&t=0', w: 560, h: 314 },
  { src: 'https://www.facebook.com/plugins/video.php?height=314&href=https%3A%2F%2Fwww.facebook.com%2Fthinkwithindrodip%2Fvideos%2F1340424980399186%2F&show_text=false&width=560&t=0', w: 560, h: 314 },
  { src: 'https://www.facebook.com/plugins/video.php?height=314&href=https%3A%2F%2Fwww.facebook.com%2Fthinkwithindrodip%2Fvideos%2F1002983741962578%2F&show_text=false&width=560&t=0', w: 560, h: 314 },
  { src: 'https://www.facebook.com/plugins/video.php?height=314&href=https%3A%2F%2Fwww.facebook.com%2Fthinkwithindrodip%2Fvideos%2F1000671825545007%2F&show_text=false&width=560&t=0', w: 560, h: 314 },
  { src: 'https://www.facebook.com/plugins/video.php?height=314&href=https%3A%2F%2Fwww.facebook.com%2Fthinkwithindrodip%2Fvideos%2F2214638572292265%2F&show_text=false&width=560&t=0', w: 560, h: 314 },
  { src: 'https://www.facebook.com/plugins/video.php?height=314&href=https%3A%2F%2Fwww.facebook.com%2Fthinkwithindrodip%2Fvideos%2F1185750126579075%2F&show_text=false&width=560&t=0', w: 560, h: 314 },
  { src: 'https://www.facebook.com/plugins/video.php?height=476&href=https%3A%2F%2Fwww.facebook.com%2Fthinkwithindrodip%2Fvideos%2F1837980330329319%2F&show_text=false&width=269&t=0', w: 269, h: 476 },
  { src: 'https://www.facebook.com/plugins/video.php?height=314&href=https%3A%2F%2Fwww.facebook.com%2Fthinkwithindrodip%2Fvideos%2F1696526020989444%2F&show_text=false&width=560&t=0', w: 560, h: 314 },
  { src: 'https://www.facebook.com/plugins/video.php?height=314&href=https%3A%2F%2Fwww.facebook.com%2Fthinkwithindrodip%2Fvideos%2F660960940097323%2F&show_text=false&width=560&t=0', w: 560, h: 314 },
  { src: 'https://www.facebook.com/plugins/video.php?height=314&href=https%3A%2F%2Fwww.facebook.com%2Fthinkwithindrodip%2Fvideos%2F9605505709570127%2F&show_text=false&width=560&t=0', w: 560, h: 314 },
  { src: 'https://www.facebook.com/plugins/video.php?height=476&href=https%3A%2F%2Fwww.facebook.com%2Fthinkwithindrodip%2Fvideos%2F635711518831315%2F&show_text=false&width=267&t=0', w: 267, h: 476 },
  { src: 'https://www.facebook.com/plugins/video.php?height=314&href=https%3A%2F%2Fwww.facebook.com%2Fthinkwithindrodip%2Fvideos%2F1468194697216348%2F&show_text=false&width=560&t=0', w: 560, h: 314 },
  { src: 'https://www.facebook.com/plugins/video.php?height=316&href=https%3A%2F%2Fwww.facebook.com%2Fthinkwithindrodip%2Fvideos%2F471183985565185%2F&show_text=false&width=560&t=0', w: 560, h: 316 },
  { src: 'https://www.facebook.com/plugins/video.php?height=314&href=https%3A%2F%2Fwww.facebook.com%2Fthinkwithindrodip%2Fvideos%2F450258107449460%2F&show_text=false&width=560&t=0', w: 560, h: 314 },
]

/* ════════ Shared bits ════════ */
const eyebrow: React.CSSProperties = { fontSize: 11, letterSpacing: '.2em', textTransform: 'uppercase', color: C.goldDeep, fontWeight: 700, display: 'block' }

const initialsOf = (name: string) =>
  name.trim().split(/\s+/).slice(0, 2).map(w => w[0]).join('').toUpperCase()

/* Branded poster used whenever a client photo isn't in yet (videos coming later) */
function Poster({ study, rounded }: { study: Study; rounded?: number }) {
  return (
    <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(150deg,${C.plum},${C.plumDark} 55%,${C.plumDeep})`, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: rounded }}>
      <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: rounded ? 30 : 58, fontWeight: 600, color: C.gold, opacity: 0.92, letterSpacing: '.02em' }}>{initialsOf(study.name)}</span>
    </div>
  )
}

/* ════════ Detail modal ════════ */
function StudyModal({ study, onClose }: { study: Study; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = prev }
  }, [onClose])

  const sec = (label: string, text: string) => (
    <div style={{ marginBottom: 16 }}>
      <span style={{ ...eyebrow, color: C.muted, fontSize: 10, marginBottom: 6 }}>{label}</span>
      <p style={{ fontSize: 14.5, color: C.inkSoft, lineHeight: 1.7, fontWeight: 300 }}>{text}</p>
    </div>
  )

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.22 }}
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(35,16,41,.55)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '24px 16px', overflowY: 'auto' }}
    >
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 16, scale: 0.98 }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        onClick={e => e.stopPropagation()}
        role="dialog" aria-modal="true" aria-label={`${study.name} case study`}
        style={{ position: 'relative', width: '100%', maxWidth: 580, margin: 'auto', background: C.cream, borderRadius: 20, border: `1px solid ${C.border}`, boxShadow: '0 40px 90px -30px rgba(35,16,41,.65)', overflow: 'hidden' }}
      >
        {/* close */}
        <button onClick={onClose} aria-label="Close" style={{ position: 'absolute', top: 14, right: 14, zIndex: 3, width: 34, height: 34, borderRadius: '50%', border: 'none', background: 'rgba(255,255,255,.9)', color: C.plum, fontSize: 20, lineHeight: 1, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 14px rgba(46,26,53,.2)' }}>×</button>

        {/* header */}
        <div style={{ display: 'flex', gap: 16, padding: '24px 24px 18px', background: C.ivory, borderBottom: `1px solid ${C.border}` }}>
          <div style={{ position: 'relative', width: 72, height: 90, borderRadius: 12, overflow: 'hidden', flexShrink: 0, border: `1px solid ${C.border}` }}>
            {study.image ? <Image src={study.image} alt={study.name} fill sizes="72px" style={{ objectFit: 'cover' }} /> : <Poster study={study} rounded={12} />}
          </div>
          <div style={{ flex: 1, minWidth: 0, paddingRight: 28 }}>
            <span style={{ display: 'inline-block', fontSize: 10, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: C.goldDeep, background: 'rgba(201,168,76,.12)', border: `1px solid ${C.goldLine}`, borderRadius: 50, padding: '3px 10px', marginBottom: 8 }}>{study.category}</span>
            <h3 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 25, fontWeight: 600, color: C.ink, lineHeight: 1.1 }}>{study.name}</h3>
            <p style={{ fontSize: 12.5, color: C.muted, marginTop: 3 }}>{study.niche}{study.location ? ` · ${study.location}` : ''}</p>
          </div>
        </div>

        {/* headline metric */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, padding: '18px 24px', background: `linear-gradient(165deg,${C.plum},${C.plumDark})`, color: '#fff' }}>
          <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 34, fontWeight: 600, color: C.gold, lineHeight: 1 }}>{study.headline.v}</span>
          <span style={{ fontSize: 13.5, color: 'rgba(255,255,255,.72)' }}>{study.headline.period}</span>
        </div>

        {/* optional video */}
        {study.videoUrl && (
          <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9', background: '#000' }}>
            <iframe src={study.videoUrl} title={`${study.name} — video`} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none' }} />
          </div>
        )}

        {/* body */}
        <div style={{ padding: '22px 24px 8px' }}>
          <p style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 19, fontStyle: 'italic', color: C.goldDeep, lineHeight: 1.3, marginBottom: 18 }}>{study.tagline}</p>
          {sec('Background', study.background)}
          {sec('The Challenge', study.challenge)}
          {sec('What We Did', study.whatWeDid)}

          {/* results */}
          <div style={{ background: C.white, border: `1px solid ${C.border}`, borderTop: `3px solid ${C.green}`, borderRadius: 14, padding: '18px 20px', marginBottom: 6 }}>
            <span style={{ ...eyebrow, color: C.green, fontSize: 10, marginBottom: 12 }}>The Results</span>
            {study.metrics && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(96px,1fr))', gap: 10, marginBottom: study.bullets ? 14 : 0 }}>
                {study.metrics.map(m => (
                  <div key={m.l} style={{ background: C.cream, border: `1px solid ${C.border}`, borderRadius: 10, padding: '12px 8px', textAlign: 'center' }}>
                    <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 22, fontWeight: 600, color: C.plum, lineHeight: 1 }}>{m.v}</div>
                    <div style={{ fontSize: 10.5, color: C.muted, marginTop: 6, lineHeight: 1.35 }}>{m.l}</div>
                  </div>
                ))}
              </div>
            )}
            {study.bullets && study.bullets.map(b => (
              <div key={b} style={{ display: 'flex', gap: 9, margin: '8px 0' }}>
                <span style={{ color: C.goldDeep, flexShrink: 0, fontWeight: 700 }}>✓</span>
                <span style={{ fontSize: 14, color: C.inkSoft, lineHeight: 1.55, fontWeight: 300 }}>{b}</span>
              </div>
            ))}
          </div>
        </div>

        {/* footer cta */}
        <div style={{ padding: '14px 24px 24px', textAlign: 'center' }}>
          <a href="/quiz" style={{ display: 'inline-block', background: `linear-gradient(180deg,${C.goldSoft},${C.gold} 60%,${C.goldDeep})`, color: C.plumDark, fontSize: 14.5, fontWeight: 700, padding: '13px 30px', borderRadius: 7, textDecoration: 'none' }}>
            Get a plan like this →
          </a>
        </div>
      </motion.div>
    </motion.div>
  )
}

/* ════════ Card ════════ */
function StudyCard({ study, onOpen }: { study: Study; onOpen: () => void }) {
  return (
    <button onClick={onOpen} className="cs-card"
      style={{ textAlign: 'left', cursor: 'pointer', background: C.white, border: `1px solid ${C.border}`, borderRadius: 16, overflow: 'hidden', display: 'flex', flexDirection: 'column', padding: 0, font: 'inherit', color: 'inherit' }}>
      <div style={{ position: 'relative', width: '100%', aspectRatio: '3/2', background: C.creamMid }}>
        {study.image ? <Image src={study.image} alt={study.name} fill sizes="(max-width:680px) 100vw, 320px" style={{ objectFit: 'cover' }} /> : <Poster study={study} />}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg,transparent 45%,rgba(35,16,41,.66))' }} />
        <span style={{ position: 'absolute', top: 12, left: 12, fontSize: 10, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: C.plumDark, background: 'rgba(255,255,255,.92)', borderRadius: 50, padding: '4px 11px' }}>{study.category}</span>
        {study.videoUrl && (
          <span style={{ position: 'absolute', top: 11, right: 12, display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 10, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: C.plumDark, background: C.goldSoft, borderRadius: 50, padding: '4px 10px' }}>▶ Watch</span>
        )}
        <div style={{ position: 'absolute', left: 14, right: 14, bottom: 12 }}>
          <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 21, fontWeight: 600, color: '#fff', lineHeight: 1.1 }}>{study.name}</div>
          <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,.82)', marginTop: 2 }}>{study.niche}</div>
        </div>
      </div>
      <div style={{ padding: '16px 18px 18px', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 10 }}>
          <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 27, fontWeight: 600, color: C.goldDeep, lineHeight: 1 }}>{study.headline.v}</span>
          <span style={{ fontSize: 12, color: C.muted }}>{study.headline.period}</span>
        </div>
        <p style={{ fontSize: 13.5, color: C.inkSoft, lineHeight: 1.5, fontWeight: 300, flex: 1, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{study.tagline}</p>
        <span style={{ fontSize: 13, fontWeight: 600, color: C.plum, marginTop: 14 }}>View case study →</span>
      </div>
    </button>
  )
}

/* ════════ Video review card (lazy — loads the embed only on click) ════════ */
function VideoReviewCard({ review, index }: { review: VideoReview; index: number }) {
  const [playing, setPlaying] = useState(false)
  return (
    <figure className="vcard" style={{ breakInside: 'avoid', marginBottom: 20, background: C.white, border: `1px solid ${C.border}`, borderRadius: 16, overflow: 'hidden', boxShadow: '0 14px 34px -30px rgba(46,26,53,.6)' }}>
      <div style={{ position: 'relative', width: '100%', aspectRatio: `${review.w} / ${review.h}`, background: `linear-gradient(150deg,${C.plum},${C.plumDark} 55%,${C.plumDeep})` }}>
        {playing ? (
          <iframe
            src={`${review.src}&autoplay=true`}
            title={`Client review ${index + 1}`}
            allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
            allowFullScreen
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none' }}
          />
        ) : (
          <button onClick={() => setPlaying(true)} aria-label={`Play client review ${index + 1}`}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none', cursor: 'pointer', background: 'transparent', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14, padding: 20 }}>
            <span style={{ width: 62, height: 62, borderRadius: '50%', background: `linear-gradient(180deg,${C.goldSoft},${C.gold} 60%,${C.goldDeep})`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 12px 30px rgba(201,168,76,.4)' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill={C.plumDark} style={{ marginLeft: 3 }}><path d="M8 5v14l11-7z"/></svg>
            </span>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,.82)' }}>Watch review</span>
          </button>
        )}
      </div>
    </figure>
  )
}

/* ════════ Page ════════ */
export default function ResultsPage() {
  const [query, setQuery] = useState('')
  const [cat, setCat] = useState('All')
  const [active, setActive] = useState<Study | null>(null)

  // Dock the filter toolbar flush under the (variable-height) header.
  const headerRef = useRef<HTMLElement>(null)
  const [headerH, setHeaderH] = useState(74)
  useEffect(() => {
    const el = headerRef.current
    if (!el) return
    const update = () => setHeaderH(el.offsetHeight)
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  const searching = query.trim().length > 0

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return STUDIES.filter(s => {
      if (cat !== 'All' && s.category !== cat) return false
      if (!q) return true
      const hay = [s.name, s.niche, s.category, s.location, s.tagline, ...s.tags].join(' ').toLowerCase()
      return q.split(/\s+/).every(w => hay.includes(w))
    })
  }, [query, cat])

  // Library "shelves": browse mode groups by niche/category; search collapses to a flat result set.
  const shelves = useMemo(() => {
    if (searching) return null
    const cats = cat === 'All' ? CATEGORIES.filter(c => c !== 'All') : [cat]
    return cats
      .map(c => ({ category: c, items: filtered.filter(s => s.category === c) }))
      .filter(shelf => shelf.items.length > 0)
  }, [searching, cat, filtered])

  const cardsGrid = (items: Study[]) => (
    <div className="cs-cards">
      {items.map(s => <StudyCard key={s.slug} study={s} onOpen={() => setActive(s)} />)}
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: C.cream, fontFamily: "'DM Sans', system-ui, sans-serif", color: C.ink }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,600&family=DM+Sans:wght@300;400;500;600&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        body{-webkit-font-smoothing:antialiased}
        .rwrap{max-width:1120px;margin:0 auto;padding:0 24px}
        .cs-cards{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:22px}
        .cs-card{transition:transform .2s ease, box-shadow .2s ease, border-color .2s ease}
        .cs-card:hover{transform:translateY(-4px);box-shadow:0 24px 50px -34px rgba(46,26,53,.55);border-color:${C.goldLine}}
        .chip{transition:all .18s ease;white-space:nowrap;flex:0 0 auto}
        .chiprow{display:flex;gap:9px;overflow-x:auto;scrollbar-width:none;-webkit-overflow-scrolling:touch;padding-bottom:2px}
        .chiprow::-webkit-scrollbar{display:none}
        .toolbar-inner{display:flex;align-items:center;gap:16px}
        @media(max-width:640px){.toolbar-inner{flex-direction:column;align-items:stretch;gap:10px}}
        @media(max-width:560px){.cs-cards{grid-template-columns:1fr}}
        .vmasonry{column-count:3;column-gap:20px}
        .vcard{transition:transform .2s ease, box-shadow .2s ease}
        .vcard:hover{transform:translateY(-3px);box-shadow:0 22px 46px -30px rgba(46,26,53,.6)}
        @media(max-width:900px){.vmasonry{column-count:2}}
        @media(max-width:560px){.vmasonry{column-count:1}}
      `}</style>

      {/* top bar */}
      <header ref={headerRef} style={{ padding: '18px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${C.border}`, background: C.ivory, position: 'sticky', top: 0, zIndex: 50, backdropFilter: 'blur(10px)' }}>
        <a href="/"><Image src="/logo-the5th.png" alt="The5th Consulting" width={150} height={38} style={{ objectFit: 'contain' }} /></a>
        <a href="/quiz" style={{ fontSize: 13, fontWeight: 600, color: C.plum, textDecoration: 'none', border: `1px solid ${C.goldLine}`, padding: '9px 18px', borderRadius: 50 }}>
          Take the assessment →
        </a>
      </header>

      {/* hero */}
      <section className="rwrap" style={{ textAlign: 'center', padding: '60px 24px 30px' }}>
        <span style={{ ...eyebrow, marginBottom: 14 }}>The 10K Roadmap Program · Case Study Library</span>
        <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 'clamp(34px,5.6vw,58px)', fontWeight: 500, color: C.ink, lineHeight: 1.04, letterSpacing: '-.02em', maxWidth: 760, margin: '0 auto' }}>
          Real coaches. Real revenue. <em style={{ fontStyle: 'italic', color: C.goldDeep }}>Browse the proof.</em>
        </h1>
        <p style={{ fontSize: 16.5, fontWeight: 300, color: C.inkSoft, maxWidth: 560, margin: '18px auto 0', lineHeight: 1.7 }}>
          A library of wins across every niche — pick a shelf or search yours, then open a story to see exactly what we built and what it produced.
        </p>
      </section>

      {/* sticky filter toolbar — docks flush under the header */}
      <div style={{ position: 'sticky', top: headerH, zIndex: 40, background: 'rgba(251,248,242,.92)', backdropFilter: 'blur(10px)', borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}` }}>
        <div className="rwrap" style={{ padding: '12px 24px' }}>
          <div className="toolbar-inner">
            {/* search */}
            <div style={{ position: 'relative', flex: 1, minWidth: 0 }}>
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke={C.muted} strokeWidth="2" strokeLinecap="round" style={{ position: 'absolute', left: 15, top: '50%', transform: 'translateY(-50%)' }}><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input
                value={query} onChange={e => setQuery(e.target.value)}
                placeholder="Search a niche or name — e.g. dating, fitness, EFT, branding…"
                style={{ width: '100%', border: `1px solid ${C.border}`, background: C.white, borderRadius: 50, padding: '11px 40px 11px 44px', fontSize: 14.5, fontFamily: 'inherit', color: C.ink, outline: 'none' }}
              />
              {query && (
                <button onClick={() => setQuery('')} aria-label="Clear search" style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'none', color: C.muted, fontSize: 18, cursor: 'pointer', lineHeight: 1 }}>×</button>
              )}
            </div>
            {/* count */}
            <span style={{ fontSize: 12.5, color: C.muted, whiteSpace: 'nowrap', flexShrink: 0 }}>
              {filtered.length === STUDIES.length ? `${STUDIES.length} stories` : `${filtered.length} of ${STUDIES.length}`}
            </span>
          </div>
          {/* niche chips */}
          <div className="chiprow" style={{ marginTop: 10 }}>
            {CATEGORIES.map(c => {
              const on = cat === c
              return (
                <button key={c} onClick={() => setCat(c)} className="chip"
                  style={{ border: `1px solid ${on ? C.plum : C.border}`, background: on ? C.plum : C.white, color: on ? '#fff' : C.inkMid, fontSize: 12.5, fontWeight: 600, padding: '7px 15px', borderRadius: 50, cursor: 'pointer', fontFamily: 'inherit' }}>
                  {c}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* library */}
      <section className="rwrap" style={{ padding: '30px 24px 40px' }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '70px 24px', color: C.muted }}>
            <p style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 26, color: C.ink, marginBottom: 10 }}>No case studies match that search.</p>
            <p style={{ fontSize: 15, fontWeight: 300, marginBottom: 20 }}>Try a broader term, or clear your filters.</p>
            <button onClick={() => { setQuery(''); setCat('All') }} style={{ border: `1px solid ${C.goldLine}`, background: 'none', color: C.goldDeep, fontWeight: 600, fontSize: 14, padding: '11px 24px', borderRadius: 50, cursor: 'pointer' }}>
              Clear filters
            </button>
          </div>
        ) : searching ? (
          <>
            <div style={{ marginBottom: 18, display: 'flex', alignItems: 'baseline', gap: 10 }}>
              <span style={{ ...eyebrow, color: C.muted, fontSize: 10 }}>Search results</span>
              <span style={{ fontSize: 13, color: C.muted }}>“{query.trim()}”</span>
            </div>
            {cardsGrid(filtered)}
          </>
        ) : (
          shelves!.map(shelf => (
            <div key={shelf.category} style={{ marginBottom: 44 }}>
              {/* shelf header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18 }}>
                <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 'clamp(22px,3vw,30px)', fontWeight: 600, color: C.ink, lineHeight: 1, whiteSpace: 'nowrap' }}>{shelf.category}</h2>
                <span style={{ fontSize: 11, fontWeight: 700, color: C.goldDeep, background: 'rgba(201,168,76,.12)', border: `1px solid ${C.goldLine}`, borderRadius: 50, padding: '3px 10px' }}>{shelf.items.length}</span>
                <span style={{ flex: 1, height: 1, background: C.border }} />
              </div>
              {cardsGrid(shelf.items)}
            </div>
          ))
        )}
      </section>

      {/* video testimonials — on-camera reviews */}
      <section className="rwrap" style={{ padding: '24px 24px 40px' }}>
        <div style={{ textAlign: 'center', maxWidth: 620, margin: '0 auto 34px' }}>
          <span style={{ ...eyebrow, marginBottom: 12 }}>On-camera · Paid consultation reviews</span>
          <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 'clamp(28px,4.4vw,46px)', fontWeight: 500, color: C.ink, lineHeight: 1.06, letterSpacing: '-.02em' }}>
            Hear it from them <em style={{ fontStyle: 'italic', color: C.goldDeep }}>directly.</em>
          </h2>
          <p style={{ fontSize: 16, fontWeight: 300, color: C.inkSoft, margin: '16px auto 0', lineHeight: 1.7 }}>
            Unscripted reactions from clients after their paid strategy consultations. Tap any clip to play.
          </p>
        </div>
        <div className="vmasonry">
          {VIDEO_REVIEWS.map((r, i) => <VideoReviewCard key={r.src} review={r} index={i} />)}
        </div>
      </section>

      {/* closing CTA */}
      <section className="rwrap" style={{ padding: '8px 24px 8px' }}>
        <div style={{ background: `linear-gradient(168deg,${C.plum},${C.plumDark} 60%,${C.plumDeep})`, color: '#fff', borderRadius: 20, padding: 'clamp(36px,5vw,60px) clamp(28px,5vw,52px)', textAlign: 'center' }}>
          <span style={{ ...eyebrow, color: C.gold, marginBottom: 12 }}>Your story could be next</span>
          <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 'clamp(26px,4vw,42px)', fontWeight: 500, color: '#fff', lineHeight: 1.1, maxWidth: 600, margin: '0 auto 16px' }}>
            Find the next move for <em style={{ fontStyle: 'italic', color: C.gold }}>your</em> business.
          </h2>
          <p style={{ fontSize: 16, fontWeight: 300, color: 'rgba(255,255,255,.74)', maxWidth: 520, margin: '0 auto 28px', lineHeight: 1.7 }}>
            Take the free assessment to discover your Expert Income Archetype and the exact next step, then we map your roadmap together.
          </p>
          <a href="/quiz" style={{ display: 'inline-block', background: `linear-gradient(180deg,${C.goldSoft},${C.gold} 60%,${C.goldDeep})`, color: C.plumDark, fontSize: 16, fontWeight: 700, padding: '16px 38px', borderRadius: 7, textDecoration: 'none', boxShadow: '0 16px 40px rgba(201,168,76,.34)' }}>
            Take the free assessment →
          </a>
        </div>
      </section>

      {/* footer */}
      <footer style={{ padding: '36px 28px 52px', textAlign: 'center', marginTop: 24 }}>
        <p style={{ fontSize: 12.5, color: C.muted }}>
          © 2026 The5th Consulting · Individual results; every business and timeline differs · <a href="/privacy" style={{ color: C.inkSoft, textDecoration: 'underline' }}>Privacy</a>
        </p>
      </footer>

      {/* modal */}
      <AnimatePresence>
        {active && <StudyModal key={active.slug} study={active} onClose={() => setActive(null)} />}
      </AnimatePresence>
    </div>
  )
}
