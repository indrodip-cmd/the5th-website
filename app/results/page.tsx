'use client'

import React from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'

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
  role: string
  tagline: string
  background: string
  challenge: string
  whatWeDid: string
  headline: { v: string; period: string }
  metrics?: Metric[]
  bullets?: string[]
}

const STUDIES: Study[] = [
  {
    slug: 'abbas-jamie',
    name: 'Abbas Jamie',
    image: '/clients/abbas.jpg',
    role: 'Former Corporate CEO · Conscious Living Coach · Indonesia',
    tagline: 'From Corporate CEO to Conscious Living Advocate',
    background:
      "Abbas spent years as a CEO at one of South Africa's most recognized companies — a life defined by status, luxury, and relentless pressure. He walked away from all of it, relocated to a quiet island in Indonesia, and rebuilt his life around simplicity and inner peace. He turned that transformation into a coaching practice serving burned-out executives ready to do the same.",
    challenge:
      'Abbas had a powerful story and a proven philosophy, but no system to monetize it. He had written a book to share his message but needed a launch strategy that could generate momentum, build an audience, and convert readers into clients — all within a defined timeframe.',
    whatWeDid:
      "We built a full book-launch funnel. It began with a lead-generation campaign offering the first chapter as a free download to warm the audience and collect contacts. That list was nurtured toward purchasing the full book, followed by a consultation offer for readers who wanted personalized guidance. High-intent buyers were invited into Abbas's premium $3,000 coaching program.",
    headline: { v: '$21,000+', period: 'in 2 months' },
    metrics: [
      { v: '400', l: 'first-chapter downloads' },
      { v: '190', l: 'full books purchased' },
      { v: '25', l: 'consultations booked' },
      { v: '7', l: 'enrolled at $3,000' },
    ],
  },
  {
    slug: 'laurie-gerber',
    name: 'Laurie Gerber',
    image: '/clients/laurie.jpg',
    role: 'Dating Coach · TEDx Speaker · 20 years experience',
    tagline: 'Relaunching a Stalled Course into a Profitable, Community-Led Program',
    background:
      'Laurie is a dating coach with 20 years of experience and a TEDx talk to her name, specializing in helping women over 50 find meaningful relationships. Despite her credibility and deep expertise, a previous course launch had underperformed, leaving her program without the traction it deserved.',
    challenge:
      'Laurie needed to relaunch with a strategy that matched her authority, attracted the right audience, and justified a higher price point. The previous launch at $79 had not reflected the true value of her offer.',
    whatWeDid:
      "We rebuilt the launch around three pillars. First, a targeted webinar to attract students and invite them into a dedicated Facebook community. Second, we used the webinar replay inside the community to keep building trust after the live event. Third, we repositioned the course from $79 to $249 to reflect Laurie's expertise and the transformation she delivers.",
    headline: { v: '$14,193', period: 'in 60 days' },
    metrics: [
      { v: '600', l: 'joined the community' },
      { v: '57', l: 'enrolled at $249' },
      { v: '$79 → $249', l: 'price repositioned' },
    ],
  },
  {
    slug: 'bharti-chauhan',
    name: 'Bharti Chauhan',
    image: '/clients/c3.jpg',
    role: 'Marriage Coach · TEDx Speaker · 10+ years of retreats',
    tagline: 'Reviving a Decade-Old Retreat Program with a Low-Ticket Funnel',
    background:
      'Bharti is a marriage coach and TEDx speaker who has run couples retreat programs for over ten years. Her retreats were transformative, but attendance had declined. Selling retreat tickets directly at $700 per couple was no longer generating consistent demand.',
    challenge:
      'Bharti needed to rebuild interest in her program, reach new couples who did not yet know her, and create a low-friction entry point that would move people into her higher-ticket retreat offer.',
    whatWeDid:
      'We implemented a paid challenge funnel. A webinar ticket priced at $2.99 was low enough to eliminate hesitation and high enough to attract committed participants. We built a dedicated landing page and a WhatsApp community, with automated phone reminders to lift show-up rates. After the webinar, Bharti presented her retreat program, and a sales team followed up by phone to handle objections and convert.',
    headline: { v: '$18,000+', period: 'from one challenge' },
    metrics: [
      { v: '477', l: 'webinar registrations' },
      { v: '$1,426', l: 'in ticket sales' },
      { v: '38', l: 'couples at $700' },
    ],
  },
  {
    slug: 'gurpreet',
    name: 'Gurpreet',
    image: '/clients/c4.jpg',
    role: 'Coach · From zero revenue to traction',
    tagline: 'From Zero Revenue to $18,000 in 3 Months',
    background:
      'Gurpreet came in with no active income from her coaching practice. She had already invested more than $16,000 across multiple programs searching for a path forward — and had not yet seen a return. She was exhausted, overwhelmed, and on the edge of giving up entirely.',
    challenge:
      'Gurpreet needed more than strategy. She needed a clear, executable system to move from zero to paying clients without adding more complexity to an already overwhelming situation.',
    whatWeDid:
      'We stripped everything back to fundamentals. We clarified her offer, identified her ideal client, and built a simple outreach and conversion system she could run consistently. The focus was removing friction and creating direct paths to revenue — no complicated funnels, no wasted motion.',
    headline: { v: '$18,000', period: 'in 3 months' },
    bullets: [
      'Went from $0 in coaching revenue to her first paying clients within weeks',
      'Built a repeatable client-acquisition process from scratch',
      'Revenue on a business that had previously produced nothing',
    ],
  },
  {
    slug: 'shyama-prasad-goswami',
    name: 'Shyama Prasad Goswami',
    image: '/clients/c5.jpg',
    role: 'Former Fortune 500 CEO · Textile & Pharmaceutical',
    tagline: 'A Fortune 500 CEO Builds a High-Ticket Consulting Practice After Retirement',
    background:
      'Shyama spent decades as CEO of a billion-dollar Fortune 500 company, with deep expertise across textiles and pharmaceuticals. After retiring, he wanted to use that experience to help small and mid-size companies grow — but had no system for packaging or selling that expertise as a consulting offer.',
    challenge:
      'Shyama had unquestionable authority and decades of real-world results. What he lacked was a structured offer, a way to position himself in a new market, and a process for attracting and converting clients outside the corporate world he had left behind.',
    whatWeDid:
      'We built his consulting practice from the ground up. We defined a clear positioning statement around his industry credibility, structured his offer at a premium price point appropriate for the results he could deliver, and developed a client-acquisition approach that leveraged his professional network and reputation.',
    headline: { v: '$180,000', period: 'in 5 months' },
    bullets: [
      'Launched a structured consulting offer for the first time',
      'Secured high-value clients from his target market',
      'Translated decades of corporate authority into a sellable offer',
    ],
  },
  {
    slug: 'torill',
    name: 'Torill',
    image: '/clients/toril.jpg',
    role: 'Leadership Coach · Norway · Advised governments',
    tagline: 'A Celebrity Coach Returns After 15 Years and Sells Out a $7,000 Program',
    background:
      'Torill is a leadership coach based in Norway whose career reached the highest levels — she did not just work with private entrepreneurs, she consulted governments. After 15 years at the top of her field, she stepped away from everything. When she decided to return, she needed to re-enter the market with a program that matched her caliber.',
    challenge:
      'Torill had not launched anything publicly in over a decade. Despite her exceptional track record, she had no current audience, no active platform, and no system for filling a high-ticket program in today’s market.',
    whatWeDid:
      'We built her re-entry strategy from scratch. We structured a $7,000 leadership program for high-performing professionals and positioned it around the depth of transformation only someone with Torill’s background could deliver. We built the launch system, defined the audience, and created the conversion pathway that turned her reputation into revenue.',
    headline: { v: '$210,000', period: 'in 3 months' },
    metrics: [
      { v: '15 yrs', l: 'back to market' },
      { v: '30', l: 'enrolled at $7,000' },
      { v: '1', l: 'program launch' },
    ],
  },
  {
    slug: 'amalia',
    name: 'Amalia',
    image: '/clients/c7.jpg',
    role: 'Canadian Army Veteran (13 yrs) · Fitness Coach',
    tagline: 'From Army Veteran and Stay-at-Home Mom to Six-Figure Fitness Coach',
    background:
      'Amalia served in the Canadian Army for 13 years. After leaving service she spent years as a stay-at-home mother — skilled, disciplined, and deeply passionate about fitness, but without a path to turn that passion into income. She had the expertise. She did not yet have the business.',
    challenge:
      'Amalia needed to package her fitness knowledge into a professional offer, position herself credibly in the market, and build a client-acquisition system — all while starting from zero as a business owner.',
    whatWeDid:
      'We built her coaching business from the foundation. We defined her unique positioning — a fitness coach with real military-grade discipline and experience — created an $8,000 premium coaching program, and built the funnel and outreach system to fill it with clients who valued that level of commitment.',
    headline: { v: '$16,000', period: 'in 5 months' },
    bullets: [
      'Launched her first professional coaching offer',
      'Built a client-acquisition system from scratch',
      'Signed clients into an $8,000 program',
    ],
  },
  {
    slug: 'girish',
    name: 'Girish',
    image: '/clients/c8.jpg',
    role: 'Law of Attraction & Mindset Coach',
    tagline: 'A Law of Attraction Coach Launches Publicly for the First Time and Hits $100K',
    background:
      'Girish is a well-known figure in Law of Attraction and mindset coaching circles. Despite his expertise and reputation within certain communities, he had never formally launched a program to the general public. His knowledge had not yet been packaged into a scalable offer with a structured go-to-market approach.',
    challenge:
      'Girish needed to translate his authority and existing credibility into a public-facing program with a clear offer, an audience-building strategy, and a system for consistent enrollment.',
    whatWeDid:
      'We built his first public launch from scratch — defining the program structure, setting the price point, creating the marketing assets, and building the pipeline that would take him from niche recognition to mainstream coaching revenue.',
    headline: { v: '$100,000', period: 'first year public' },
    bullets: [
      'Successfully launched to a general public audience for the first time',
      'Built a repeatable enrollment system',
      'Turned niche recognition into mainstream coaching revenue',
    ],
  },
  {
    slug: 'max',
    name: 'Max',
    image: '/clients/c9.jpg',
    role: 'U.S. Veteran · Divorce Coach',
    tagline: 'An American War Hero Turns Personal Pain into a Divorce Coaching Practice',
    background:
      'Max is an American veteran who lost his leg serving in the Vietnam War. In the decades that followed he went through two divorces — experiences that gave him hard-won perspective on loss, identity, and rebuilding. He recognized that other men going through divorce needed exactly the grounded, real-world guidance he could offer.',
    challenge:
      'Max had a story that commanded respect and a perspective that was genuinely rare. What he needed was a structured offer, clear positioning, and a system to attract and convert men in the middle of one of the hardest experiences of their lives.',
    whatWeDid:
      'We built his divorce coaching practice from the ground up. We positioned Max around his authenticity and lived experience rather than credentials alone, structured his offer at a price point accessible to his target client, and created a simple, direct outreach and conversion system aligned with how his audience searches for help.',
    headline: { v: '$9,000', period: 'in 3.5 months' },
    bullets: [
      'Launched his coaching practice for the first time',
      'Signed paying clients within the first weeks',
      'Built positioning around lived experience, not credentials alone',
    ],
  },
]

/* Aggregate hero stats */
const AGG: Metric[] = [
  { v: '$586K+', l: 'generated across these case studies' },
  { v: '9', l: 'coaches & consultants' },
  { v: '$210K', l: 'from a single launch' },
  { v: '$0 → CEO', l: 'every starting point' },
]

/* ════════ Small presentational helpers ════════ */
const eyebrow: React.CSSProperties = { fontSize: 11, letterSpacing: '.2em', textTransform: 'uppercase', color: C.goldDeep, fontWeight: 700, display: 'block' }
const fade = {
  initial: { opacity: 0, y: 26 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
}

function Block({ label, text }: { label: string; text: string }) {
  return (
    <div style={{ marginBottom: 22 }}>
      <span style={{ ...eyebrow, color: C.muted, fontSize: 10.5, marginBottom: 8 }}>{label}</span>
      <p style={{ fontSize: 16, color: C.inkSoft, lineHeight: 1.78, fontWeight: 300 }}>{text}</p>
    </div>
  )
}

/* ════════ Page ════════ */
export default function ResultPage() {
  return (
    <div style={{ minHeight: '100vh', background: C.cream, fontFamily: "'DM Sans', system-ui, sans-serif", color: C.ink }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500;1,600&family=DM+Sans:wght@300;400;500;600&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        body{-webkit-font-smoothing:antialiased}
        .rwrap{max-width:1080px;margin:0 auto;padding:0 24px}
        .cs-grid{display:grid;grid-template-columns:0.82fr 1.18fr;gap:clamp(28px,4.5vw,64px);align-items:start}
        .cs-media{position:sticky;top:32px}
        .agg{display:grid;grid-template-columns:repeat(4,1fr);gap:18px}
        .metricRow{display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:14px}
        @media(max-width:860px){
          .cs-grid{grid-template-columns:1fr;gap:26px}
          .cs-media{position:static}
          .agg{grid-template-columns:repeat(2,1fr);gap:14px}
        }
      `}</style>

      {/* ── top bar ── */}
      <header style={{ padding: '18px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${C.border}`, background: C.ivory, position: 'sticky', top: 0, zIndex: 50, backdropFilter: 'blur(10px)' }}>
        <a href="/"><Image src="/logo-the5th.png" alt="The5th Consulting" width={150} height={38} style={{ objectFit: 'contain' }} /></a>
        <a href="/quiz" style={{ fontSize: 13, fontWeight: 600, color: C.plum, textDecoration: 'none', border: `1px solid ${C.goldLine}`, padding: '9px 18px', borderRadius: 50 }}>
          Take the assessment →
        </a>
      </header>

      {/* ── hero ── */}
      <section className="rwrap" style={{ textAlign: 'center', padding: '76px 24px 18px' }}>
        <motion.span {...fade} style={{ ...eyebrow, marginBottom: 16 }}>The 10K Roadmap Program · Client Case Studies</motion.span>
        <motion.h1 {...fade} transition={{ ...fade.transition, delay: 0.05 }}
          style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 'clamp(38px,6.4vw,68px)', fontWeight: 500, color: C.ink, lineHeight: 1.02, letterSpacing: '-.02em', maxWidth: 860, margin: '0 auto' }}>
          Real coaches. Real revenue. <em style={{ fontStyle: 'italic', color: C.goldDeep }}>Real transformations.</em>
        </motion.h1>
        <motion.p {...fade} transition={{ ...fade.transition, delay: 0.1 }}
          style={{ fontSize: 18, fontWeight: 300, color: C.inkSoft, maxWidth: 600, margin: '22px auto 0', lineHeight: 1.7 }}>
          Nine people from wildly different backgrounds — a retired Fortune 500 CEO, an army veteran, a war hero, a TEDx speaker — each built a profitable practice inside the same program. Here is exactly what we did, and what it produced.
        </motion.p>
      </section>

      {/* ── aggregate stats ── */}
      <section className="rwrap" style={{ padding: '40px 24px 24px' }}>
        <motion.div {...fade} className="agg">
          {AGG.map(a => (
            <div key={a.l} style={{ background: `linear-gradient(165deg,${C.plum},${C.plumDark})`, color: '#fff', borderRadius: 16, padding: '26px 22px', textAlign: 'center' }}>
              <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 'clamp(30px,4vw,42px)', fontWeight: 500, color: C.gold, lineHeight: 1 }}>{a.v}</div>
              <div style={{ fontSize: 12.5, color: 'rgba(255,255,255,.62)', marginTop: 10, lineHeight: 1.45 }}>{a.l}</div>
            </div>
          ))}
        </motion.div>
        <p style={{ textAlign: 'center', fontSize: 12.5, color: C.muted, marginTop: 16 }}>
          Results reflect individual client outcomes inside the program. Every business and timeline is different.
        </p>
      </section>

      {/* ── case studies ── */}
      <div style={{ padding: '24px 0 8px' }}>
        {STUDIES.map((s, i) => {
          const mediaRight = i % 2 === 1
          return (
            <section key={s.slug} id={s.slug} className="rwrap" style={{ padding: '44px 24px', borderTop: i === 0 ? 'none' : `1px solid ${C.border}` }}>
              <motion.div {...fade} className="cs-grid">
                {/* ── media column ── */}
                <div className="cs-media" style={{ order: mediaRight ? 2 : 1 }}>
                  <div style={{ position: 'relative', width: '100%', aspectRatio: '4/5', borderRadius: 18, overflow: 'hidden', border: `1px solid ${C.border}`, boxShadow: '0 28px 64px -42px rgba(46,26,53,.6)' }}>
                    <Image src={s.image} alt={s.name} fill sizes="(max-width:860px) 100vw, 360px" style={{ objectFit: 'cover' }} />
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg,transparent 55%,rgba(35,16,41,.72))' }} />
                    <div style={{ position: 'absolute', left: 20, right: 20, bottom: 18 }}>
                      <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 26, fontWeight: 600, color: '#fff', lineHeight: 1.1 }}>{s.name}</div>
                      <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,.8)', marginTop: 5, lineHeight: 1.45 }}>{s.role}</div>
                    </div>
                  </div>

                  {/* headline metric */}
                  <div style={{ marginTop: 16, background: `linear-gradient(165deg,${C.ivory},${C.creamMid})`, border: `1px solid ${C.goldLine}`, borderRadius: 16, padding: '22px 24px', textAlign: 'center' }}>
                    <span style={{ ...eyebrow, fontSize: 10, marginBottom: 6 }}>Revenue generated</span>
                    <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 'clamp(40px,5.4vw,56px)', fontWeight: 600, color: C.goldDeep, lineHeight: 1 }}>{s.headline.v}</div>
                    <div style={{ fontSize: 13.5, color: C.inkSoft, marginTop: 6, letterSpacing: '.02em' }}>{s.headline.period}</div>
                  </div>
                </div>

                {/* ── content column ── */}
                <div style={{ order: mediaRight ? 1 : 2 }}>
                  <span style={{ ...eyebrow, marginBottom: 14 }}>Case Study {String(i + 1).padStart(2, '0')}</span>
                  <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 'clamp(26px,3.6vw,38px)', fontWeight: 600, color: C.ink, lineHeight: 1.12, letterSpacing: '-.01em', marginBottom: 26, maxWidth: 560 }}>
                    {s.tagline}
                  </h2>

                  <Block label="Background" text={s.background} />
                  <Block label="The Challenge" text={s.challenge} />
                  <Block label="What We Did" text={s.whatWeDid} />

                  {/* results */}
                  <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 16, padding: '26px 28px', borderTop: `3px solid ${C.green}`, marginTop: 6 }}>
                    <span style={{ ...eyebrow, color: C.green, marginBottom: 16 }}>The Results</span>
                    {s.metrics && (
                      <div className="metricRow" style={{ marginBottom: s.bullets ? 18 : 0 }}>
                        {s.metrics.map(m => (
                          <div key={m.l} style={{ background: C.cream, borderRadius: 12, padding: '16px 14px', textAlign: 'center', border: `1px solid ${C.border}` }}>
                            <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 26, fontWeight: 600, color: C.plum, lineHeight: 1 }}>{m.v}</div>
                            <div style={{ fontSize: 11.5, color: C.muted, marginTop: 7, lineHeight: 1.4 }}>{m.l}</div>
                          </div>
                        ))}
                      </div>
                    )}
                    {s.bullets && (
                      <div>
                        {s.bullets.map(b => (
                          <div key={b} style={{ display: 'flex', gap: 11, margin: '10px 0' }}>
                            <span style={{ color: C.goldDeep, flexShrink: 0, fontWeight: 700 }}>✓</span>
                            <span style={{ fontSize: 15, color: C.inkSoft, lineHeight: 1.6, fontWeight: 300 }}>{b}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            </section>
          )
        })}
      </div>

      {/* ── closing CTA ── */}
      <section className="rwrap" style={{ padding: '40px 24px 8px' }}>
        <motion.div {...fade} style={{ background: `linear-gradient(168deg,${C.plum},${C.plumDark} 60%,${C.plumDeep})`, color: '#fff', borderRadius: 20, padding: 'clamp(40px,6vw,72px) clamp(28px,5vw,56px)', textAlign: 'center' }}>
          <span style={{ ...eyebrow, color: C.gold, marginBottom: 14 }}>Your story could be next</span>
          <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 'clamp(28px,4.2vw,46px)', fontWeight: 500, color: '#fff', lineHeight: 1.08, maxWidth: 640, margin: '0 auto 18px' }}>
            Every one of these started with a single decision, <em style={{ fontStyle: 'italic', color: C.gold }}>and a clear plan.</em>
          </h2>
          <p style={{ fontSize: 17, fontWeight: 300, color: 'rgba(255,255,255,.74)', maxWidth: 540, margin: '0 auto 32px', lineHeight: 1.7 }}>
            Take the free assessment to discover your Expert Income Archetype and the exact next move for your business, then we will map your roadmap together.
          </p>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="/quiz" style={{ display: 'inline-block', background: `linear-gradient(180deg,${C.goldSoft},${C.gold} 60%,${C.goldDeep})`, color: C.plumDark, fontSize: 16, fontWeight: 700, padding: '17px 40px', borderRadius: 7, textDecoration: 'none', boxShadow: '0 16px 40px rgba(201,168,76,.34)' }}>
              Take the free assessment →
            </a>
            <a href="/call" style={{ display: 'inline-block', background: 'transparent', color: '#fff', fontSize: 16, fontWeight: 600, padding: '17px 36px', borderRadius: 7, textDecoration: 'none', border: '1px solid rgba(255,255,255,.28)' }}>
              Book a strategy session
            </a>
          </div>
        </motion.div>
      </section>

      {/* ── footer ── */}
      <footer style={{ padding: '40px 28px 56px', textAlign: 'center', marginTop: 32 }}>
        <p style={{ fontSize: 12.5, color: C.muted }}>
          © 2026 The5th Consulting · <a href="/privacy" style={{ color: C.inkSoft, textDecoration: 'underline' }}>Privacy</a> · support@10kroadmap.org
        </p>
      </footer>
    </div>
  )
}
