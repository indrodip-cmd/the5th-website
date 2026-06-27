'use client'

import React, { useState, useEffect, useMemo } from 'react'
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
  image: string
  category: string      // broad — drives the filter chips
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
    niche: 'Dating coach for women 50+',
    location: 'USA',
    tagline: 'Relaunching a Stalled Course into a Profitable, Community-Led Program',
    background:
      'Laurie is a dating coach with 20 years of experience and a TEDx talk, helping women over 50 find meaningful relationships. Despite her credibility, a previous course launch had underperformed.',
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
    tags: ['webinar', 'course', 'community', 'dating', 'women over 50', 'tedx', 'facebook'],
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
    niche: 'Law of Attraction & mindset',
    location: '',
    tagline: 'A Law of Attraction Coach Launches Publicly for the First Time and Hits $100K',
    background:
      'Girish is well known in Law of Attraction and mindset circles, but had never formally launched a program to the general public. His knowledge was not yet packaged into a scalable offer.',
    challenge:
      'He needed to translate his authority into a public-facing program with a clear offer, an audience-building strategy, and a system for consistent enrollment.',
    whatWeDid:
      'We built his first public launch from scratch — program structure, price point, marketing assets, and the pipeline to take him from niche recognition to mainstream coaching revenue.',
    headline: { v: '$100,000', period: 'first year public' },
    bullets: [
      'Launched to a general public audience for the first time',
      'Built a repeatable enrollment system',
      'Turned niche recognition into mainstream revenue',
    ],
    tags: ['law of attraction', 'mindset', 'manifestation', 'public launch', 'enrollment'],
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
]

const CATEGORIES = ['All', ...Array.from(new Set(STUDIES.map(s => s.category)))]

/* ════════ Shared bits ════════ */
const eyebrow: React.CSSProperties = { fontSize: 11, letterSpacing: '.2em', textTransform: 'uppercase', color: C.goldDeep, fontWeight: 700, display: 'block' }

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
            <Image src={study.image} alt={study.name} fill sizes="72px" style={{ objectFit: 'cover' }} />
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
        <Image src={study.image} alt={study.name} fill sizes="(max-width:680px) 100vw, 320px" style={{ objectFit: 'cover' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg,transparent 45%,rgba(35,16,41,.66))' }} />
        <span style={{ position: 'absolute', top: 12, left: 12, fontSize: 10, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: C.plumDark, background: 'rgba(255,255,255,.92)', borderRadius: 50, padding: '4px 11px' }}>{study.category}</span>
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

/* ════════ Page ════════ */
export default function ResultsPage() {
  const [query, setQuery] = useState('')
  const [cat, setCat] = useState('All')
  const [active, setActive] = useState<Study | null>(null)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return STUDIES.filter(s => {
      if (cat !== 'All' && s.category !== cat) return false
      if (!q) return true
      const hay = [s.name, s.niche, s.category, s.location, s.tagline, ...s.tags].join(' ').toLowerCase()
      return q.split(/\s+/).every(w => hay.includes(w))
    })
  }, [query, cat])

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
        .chip{transition:all .18s ease}
        @media(max-width:560px){.cs-cards{grid-template-columns:1fr}}
      `}</style>

      {/* top bar */}
      <header style={{ padding: '18px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${C.border}`, background: C.ivory, position: 'sticky', top: 0, zIndex: 50, backdropFilter: 'blur(10px)' }}>
        <a href="/"><Image src="/logo-the5th.png" alt="The5th Consulting" width={150} height={38} style={{ objectFit: 'contain' }} /></a>
        <a href="/quiz" style={{ fontSize: 13, fontWeight: 600, color: C.plum, textDecoration: 'none', border: `1px solid ${C.goldLine}`, padding: '9px 18px', borderRadius: 50 }}>
          Take the assessment →
        </a>
      </header>

      {/* hero */}
      <section className="rwrap" style={{ textAlign: 'center', padding: '60px 24px 8px' }}>
        <span style={{ ...eyebrow, marginBottom: 14 }}>The 10K Roadmap Program · Case Study Library</span>
        <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 'clamp(34px,5.6vw,58px)', fontWeight: 500, color: C.ink, lineHeight: 1.04, letterSpacing: '-.02em', maxWidth: 760, margin: '0 auto' }}>
          Real coaches. Real revenue. <em style={{ fontStyle: 'italic', color: C.goldDeep }}>Browse the proof.</em>
        </h1>
        <p style={{ fontSize: 16.5, fontWeight: 300, color: C.inkSoft, maxWidth: 560, margin: '18px auto 0', lineHeight: 1.7 }}>
          Search by niche or category to find a story like yours, then open it to see exactly what we built and what it produced.
        </p>
      </section>

      {/* search + filters */}
      <section className="rwrap" style={{ padding: '30px 24px 8px', position: 'sticky', top: 75, zIndex: 40 }}>
        <div style={{ background: C.ivory, border: `1px solid ${C.border}`, borderRadius: 18, padding: '18px 18px', boxShadow: '0 12px 30px -26px rgba(46,26,53,.5)' }}>
          {/* search */}
          <div style={{ position: 'relative', marginBottom: 14 }}>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke={C.muted} strokeWidth="2" strokeLinecap="round" style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)' }}><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input
              value={query} onChange={e => setQuery(e.target.value)}
              placeholder="Search a niche, category, or name — e.g. dating, consulting, fitness, webinar…"
              style={{ width: '100%', border: `1px solid ${C.border}`, background: C.white, borderRadius: 11, padding: '14px 16px 14px 46px', fontSize: 15, fontFamily: 'inherit', color: C.ink, outline: 'none' }}
            />
            {query && (
              <button onClick={() => setQuery('')} aria-label="Clear search" style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'none', color: C.muted, fontSize: 18, cursor: 'pointer' }}>×</button>
            )}
          </div>
          {/* category chips */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 9 }}>
            {CATEGORIES.map(c => {
              const on = cat === c
              return (
                <button key={c} onClick={() => setCat(c)} className="chip"
                  style={{ border: `1px solid ${on ? C.plum : C.border}`, background: on ? C.plum : C.white, color: on ? '#fff' : C.inkMid, fontSize: 13, fontWeight: 600, padding: '8px 16px', borderRadius: 50, cursor: 'pointer', fontFamily: 'inherit' }}>
                  {c}
                </button>
              )
            })}
          </div>
        </div>
        <p style={{ fontSize: 13, color: C.muted, margin: '14px 4px 0' }}>
          {filtered.length === STUDIES.length ? `${STUDIES.length} case studies` : `${filtered.length} of ${STUDIES.length} case studies`}
        </p>
      </section>

      {/* grid */}
      <section className="rwrap" style={{ padding: '14px 24px 40px' }}>
        {filtered.length > 0 ? (
          <div className="cs-cards">
            {filtered.map(s => <StudyCard key={s.slug} study={s} onOpen={() => setActive(s)} />)}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '70px 24px', color: C.muted }}>
            <p style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 26, color: C.ink, marginBottom: 10 }}>No case studies match that search.</p>
            <p style={{ fontSize: 15, fontWeight: 300, marginBottom: 20 }}>Try a broader term, or clear your filters.</p>
            <button onClick={() => { setQuery(''); setCat('All') }} style={{ border: `1px solid ${C.goldLine}`, background: 'none', color: C.goldDeep, fontWeight: 600, fontSize: 14, padding: '11px 24px', borderRadius: 50, cursor: 'pointer' }}>
              Clear filters
            </button>
          </div>
        )}
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
