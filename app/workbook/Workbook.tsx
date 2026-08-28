'use client'
/* ─────────────────────────────────────────────────────────────────────────
   THE KNOWLEDGE ASSET — high-converting direct-response sales page.

   One long page, one conversion: buy the workbook for $7.93. Payment happens
   in-page via the Whop embedded checkout (loader lives in the root layout).
   Palette: near-black charcoal + warm ivory + muted gold accent (used
   sparingly for price, guarantee, and small highlights). Display serif is the
   brand "Gelica"; UI/body is Inter. No fabricated testimonials, results, or
   ratings — placeholders are used where verified proof does not yet exist.
   ───────────────────────────────────────────────────────────────────────── */
import { useEffect, useRef, useState, type ReactNode, type CSSProperties } from 'react'

/* ── Tokens ──────────────────────────────────────────────────────────────── */
const INK = '#15120D'
const CHAR = '#2A2620'
const IVORY = '#F5F0E6'
const IVORY2 = '#FBF7EF'
const PAPER = '#FFFFFF'
const LINE = 'rgba(21,18,13,.12)'
const LINE_SOFT = 'rgba(21,18,13,.08)'
const MUTE = '#6E675C'
const MUTE2 = '#938A7B'
const GOLD = '#B0893A'
const GOLD_LT = '#C9A75A'
const GOLD_DK = '#846421'
const GOLD_SOFT = 'rgba(176,137,58,.12)'

const SERIF = "'Gelica', 'Playfair Display', Georgia, serif"
const SANS = "'Inter', system-ui, -apple-system, sans-serif"
const PRICE = '$7.93'

/* ── Small scroll-reveal wrapper (respects prefers-reduced-motion) ────────── */
function Reveal({ children, delay = 0, style }: { children: ReactNode; delay?: number; style?: CSSProperties }) {
  const ref = useRef<HTMLDivElement | null>(null)
  const [state, setState] = useState({ shown: false, reduce: false })
  const { shown, reduce } = state
  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const el = ref.current
    if (!el) return
    // IntersectionObserver fires immediately on observe for on-screen elements,
    // so reduced-motion users still get revealed — just with the transition off.
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setState({ shown: true, reduce: reduceMotion }); io.disconnect() } }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' })
    io.observe(el)
    return () => io.disconnect()
  }, [])
  const transition = reduce ? 'none' : `opacity .7s ease ${delay}ms, transform .7s cubic-bezier(.22,1,.36,1) ${delay}ms`
  return (
    <div ref={ref} style={{ opacity: shown ? 1 : 0, transform: shown ? 'none' : 'translateY(18px)', transition, ...style }}>
      {children}
    </div>
  )
}

/* ── Primary CTA button — scrolls to the in-page checkout ─────────────────── */
function CTA({ label = `GET THE BOOK — ${PRICE}`, size = 'lg', tone = 'gold', style }: { label?: string; size?: 'lg' | 'md'; tone?: 'gold' | 'ink'; style?: CSSProperties }) {
  const pad = size === 'lg' ? '18px 34px' : '14px 26px'
  const fs = size === 'lg' ? 16 : 14.5
  const bg = tone === 'gold' ? `linear-gradient(145deg, ${GOLD_LT}, ${GOLD_DK})` : `linear-gradient(145deg, ${CHAR}, ${INK})`
  const color = tone === 'gold' ? '#1c1405' : IVORY2
  return (
    <a href="#checkout" className="ka-cta" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: bg, color, fontFamily: SANS, fontWeight: 800, fontSize: fs, letterSpacing: '.02em', padding: pad, borderRadius: 999, textDecoration: 'none', minHeight: 52, boxShadow: tone === 'gold' ? '0 14px 34px rgba(132,100,33,.28)' : '0 14px 34px rgba(21,18,13,.22)', ...style }}>
      {label}
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
    </a>
  )
}

function Eyebrow({ children, gold = false, center = false }: { children: ReactNode; gold?: boolean; center?: boolean }) {
  return <div style={{ fontFamily: SANS, fontSize: 12, fontWeight: 800, letterSpacing: '.24em', textTransform: 'uppercase', color: gold ? GOLD_DK : MUTE2, textAlign: center ? 'center' : 'left' }}>{children}</div>
}

/* ── The book — a CSS 3D mockup (no stock imagery) ────────────────────────── */
function BookMockup({ float = true }: { float?: boolean }) {
  return (
    <div className="ka-book-wrap" style={{ perspective: 1600, display: 'flex', justifyContent: 'center' }}>
      <div className={`ka-book${float ? ' ka-float' : ''}`} style={{ position: 'relative', width: 'min(320px, 74vw)', aspectRatio: '3 / 4.2', transformStyle: 'preserve-3d', transform: 'rotateY(-22deg) rotateX(5deg)' }}>
        {/* page depth / right edge */}
        <div style={{ position: 'absolute', top: 8, right: -14, width: 18, height: 'calc(100% - 16px)', background: 'linear-gradient(90deg, #efe7d6, #cfc4ad)', transform: 'rotateY(90deg) translateZ(9px)', transformOrigin: 'right', borderRadius: 2 }} />
        {/* front cover */}
        <div style={{ position: 'absolute', inset: 0, borderRadius: '4px 8px 8px 4px', background: `linear-gradient(155deg, #211d16 0%, #14110c 60%, #0d0b07 100%)`, boxShadow: `0 34px 70px rgba(0,0,0,.42), inset 0 0 0 1px rgba(201,167,90,.28)`, padding: '30px 26px', display: 'flex', flexDirection: 'column', color: IVORY2, overflow: 'hidden' }}>
          {/* spine sheen */}
          <div style={{ position: 'absolute', top: 0, left: 0, width: 10, height: '100%', background: 'linear-gradient(90deg, rgba(255,255,255,.16), rgba(255,255,255,0))' }} />
          <div style={{ position: 'absolute', inset: 12, border: `1px solid ${GOLD_SOFT}`, borderRadius: 4, pointerEvents: 'none' }} />
          <div style={{ fontFamily: SANS, fontSize: 10.5, fontWeight: 700, letterSpacing: '.28em', color: GOLD_LT, textTransform: 'uppercase' }}>The 10K Roadmap Series</div>
          <div style={{ height: 1, background: `linear-gradient(90deg, ${GOLD}, transparent)`, margin: '14px 0 auto', width: '44%' }} />
          <h3 style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 'clamp(30px, 8vw, 44px)', lineHeight: 0.98, letterSpacing: '-.01em', margin: 0 }}>
            THE<br />KNOWLEDGE<br /><span style={{ color: GOLD_LT }}>ASSET</span>
          </h3>
          <p style={{ fontFamily: SANS, fontSize: 12, lineHeight: 1.5, color: 'rgba(245,240,230,.82)', marginTop: 16 }}>
            Turn What You Know Into a $10K-a-Month Digital Business
          </p>
          <p style={{ fontFamily: SANS, fontSize: 10, lineHeight: 1.5, color: 'rgba(245,240,230,.55)', marginTop: 10 }}>
            A practical workbook where you build your product, offer, audience, content, and launch — as you go.
          </p>
          <div style={{ marginTop: 'auto', paddingTop: 18, borderTop: `1px solid rgba(201,167,90,.22)`, fontFamily: SANS, fontSize: 10.5, letterSpacing: '.06em', color: 'rgba(245,240,230,.9)', textTransform: 'uppercase' }}>
            Indrodip Ghosh <span style={{ color: GOLD_LT }}>&amp;</span> Christinee Mathison
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── FAQ accordion item ───────────────────────────────────────────────────── */
function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ borderBottom: `1px solid ${LINE}` }}>
      <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, background: 'none', border: 'none', cursor: 'pointer', padding: '22px 4px', textAlign: 'left', fontFamily: SANS, minHeight: 48 }}>
        <span style={{ fontSize: 'clamp(16px,2.4vw,18px)', fontWeight: 700, color: INK }}>{q}</span>
        <span aria-hidden style={{ flexShrink: 0, width: 26, height: 26, borderRadius: '50%', border: `1px solid ${LINE}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: GOLD_DK, transform: open ? 'rotate(45deg)' : 'none', transition: 'transform .25s ease', fontSize: 20, lineHeight: 1 }}>+</span>
      </button>
      <div style={{ maxHeight: open ? 320 : 0, overflow: 'hidden', transition: 'max-height .32s ease' }}>
        <p style={{ fontFamily: SANS, fontSize: 15.5, lineHeight: 1.7, color: MUTE, padding: '0 4px 24px', maxWidth: 720 }}>{a}</p>
      </div>
    </div>
  )
}

/* ── In-page Whop embedded checkout (skeleton + hosted fallback) ──────────── */
function Checkout({ planId }: { planId: string }) {
  const embedRef = useRef<HTMLDivElement | null>(null)
  const [mounted, setMounted] = useState(false)
  const [slow, setSlow] = useState(false)
  const redirectUrl = 'https://the5th.consulting/workbook/success'
  const hostedUrl = `https://whop.com/checkout/${planId}`

  useEffect(() => {
    // The Whop loader lives in the root layout; re-add defensively so the embed
    // mounts even on client-side navigation into this route.
    const SRC = 'https://js.whop.com/static/checkout/loader.js'
    if (!document.querySelector(`script[src="${SRC}"]`)) {
      const s = document.createElement('script'); s.src = SRC; s.async = true; document.body.appendChild(s)
    }
    const el = embedRef.current
    if (!el) return
    const check = () => { if (el.querySelector('iframe')) { setMounted(true); return true } return false }
    if (check()) return
    const obs = new MutationObserver(() => check())
    obs.observe(el, { childList: true, subtree: true })
    const poll = setInterval(() => { if (check()) clearInterval(poll) }, 500)
    const slowT = setTimeout(() => { if (!el.querySelector('iframe')) setSlow(true) }, 7000)
    return () => { obs.disconnect(); clearInterval(poll); clearTimeout(slowT) }
  }, [planId])

  return (
    <div className="ka-checkout-grid">
      {/* Order summary */}
      <div style={{ background: PAPER, border: `1px solid ${LINE}`, borderRadius: 18, padding: '28px 26px' }}>
        <Eyebrow gold>Order Summary</Eyebrow>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginTop: 18, paddingBottom: 20, borderBottom: `1px solid ${LINE_SOFT}` }}>
          <div style={{ width: 52, height: 68, borderRadius: 3, background: `linear-gradient(155deg,#211d16,#0d0b07)`, boxShadow: 'inset 0 0 0 1px rgba(201,167,90,.3)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontFamily: SERIF, fontSize: 9, color: GOLD_LT, textAlign: 'center', lineHeight: 1.1, padding: 4 }}>THE<br />KNOWLEDGE<br />ASSET</span>
          </div>
          <div>
            <div style={{ fontFamily: SERIF, fontSize: 19, fontWeight: 700, color: INK }}>The Knowledge Asset</div>
            <div style={{ fontFamily: SANS, fontSize: 13, color: MUTE }}>Digital Workbook · Instant access</div>
          </div>
        </div>
        {[['Book', 'The Knowledge Asset'], ['Bonuses', '3 included'], ['Guarantee', '365 days'], ['Delivery', 'Instant digital']].map(([k, v]) => (
          <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontFamily: SANS, fontSize: 14.5, color: MUTE, padding: '10px 0' }}>
            <span>{k}</span><span style={{ color: INK, fontWeight: 600 }}>{v}</span>
          </div>
        ))}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 12, paddingTop: 16, borderTop: `1px solid ${LINE}` }}>
          <span style={{ fontFamily: SANS, fontSize: 13, fontWeight: 800, letterSpacing: '.14em', textTransform: 'uppercase', color: INK }}>Total</span>
          <span style={{ fontFamily: SERIF, fontSize: 34, fontWeight: 700, color: GOLD_DK }}>{PRICE}</span>
        </div>
        <div style={{ marginTop: 18, background: IVORY2, border: `1px solid ${LINE_SOFT}`, borderRadius: 12, padding: '14px 16px', fontFamily: SANS, fontSize: 13, lineHeight: 1.6, color: MUTE }}>
          <strong style={{ color: INK }}>Your purchase is protected.</strong> If you don&apos;t love the book, you can request a refund within 365 days, subject to the published refund terms.
        </div>
      </div>

      {/* Payment */}
      <div style={{ background: PAPER, border: `1px solid ${LINE}`, borderRadius: 18, padding: '28px 24px', boxShadow: '0 22px 60px rgba(21,18,13,.10)' }}>
        <Eyebrow gold>Secure Checkout</Eyebrow>
        <p style={{ fontFamily: SANS, fontSize: 13.5, color: MUTE, marginTop: 10 }}>Enter your email and payment below to get instant access.</p>
        <div style={{ position: 'relative', marginTop: 16, minHeight: 120 }}>
          <div
            ref={embedRef}
            data-whop-checkout-plan-id={planId}
            data-whop-checkout-theme="light"
            data-whop-checkout-redirect-url={redirectUrl}
            style={{ width: '100%', minHeight: 120, overflow: 'hidden' }}
          />
          {!mounted && (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, background: PAPER, borderRadius: 12, padding: 16 }}>
              {!slow ? (
                <>
                  <div style={{ width: 26, height: 26, borderRadius: '50%', border: '3px solid #eee', borderTopColor: GOLD, animation: 'ka-spin .8s linear infinite' }} />
                  <p style={{ fontFamily: SANS, fontSize: 13, color: MUTE, margin: 0 }}>Loading secure checkout…</p>
                </>
              ) : (
                <>
                  <p style={{ fontFamily: SANS, fontSize: 13.5, color: INK, margin: 0, textAlign: 'center', fontWeight: 600 }}>Checkout is taking a moment.</p>
                  <a href={hostedUrl} target="_top" style={{ display: 'inline-flex', minHeight: 52, alignItems: 'center', background: `linear-gradient(145deg,${GOLD_LT},${GOLD_DK})`, color: '#1c1405', fontFamily: SANS, fontWeight: 800, fontSize: 15.5, padding: '13px 28px', borderRadius: 999, textDecoration: 'none' }}>
                    Get instant access — {PRICE} →
                  </a>
                  <p style={{ fontFamily: SANS, fontSize: 11.5, color: MUTE2, margin: 0, textAlign: 'center' }}>Opens Whop&apos;s secure checkout.</p>
                </>
              )}
            </div>
          )}
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 16px', justifyContent: 'center', marginTop: 16, fontFamily: SANS, fontSize: 12, color: MUTE2 }}>
          <span>🔒 Secure checkout</span><span>365-day guarantee</span><span>Instant digital access</span>
        </div>
      </div>
    </div>
  )
}

/* ── Data ─────────────────────────────────────────────────────────────────── */
const BUILD_STEPS = [
  ['01', 'Find Your Why', 'Get clear on why building an asset matters and what you are actually trying to create.'],
  ['02', 'Diagnose Your Situation', 'Understand where your business is today and what needs to change.'],
  ['03', 'Build the Asset Mindset', 'Stop thinking only in hours, clients, and availability. Start thinking in assets, leverage, and repeatable value.'],
  ['04', 'Find Your Perfect Audience', 'Identify the person you are actually building for.'],
  ['05', 'Design Your First Product', 'Turn your expertise into a specific product with a clear transformation.'],
  ['06', 'Build Offer + Content', 'Create an offer people understand and organic content that connects to it.'],
  ['07', 'Launch', 'Follow a practical launch plan and start learning from real buyers.'],
]

const CHAPTERS = [
  ['Understand Your Why', 'The reason an asset changes everything.'],
  ['Diagnose Your Current Situation', 'An honest look at where you are today.'],
  ['The Asset Mindset', 'Shift from hours to leverage.'],
  ['Find Your Perfect Audience', 'The one person you build for.'],
  ['Design Your First Digital Product', 'Package expertise into a product.'],
  ['Create a Simple Offer That Sells Itself', 'Make the value obvious.'],
  ['The Organic Content System', 'Publish with a strategy, not by luck.'],
  ['Your Simple Launch Plan', 'A calm, practical way to launch.'],
  ['Mindset for Consistent $10K Months', 'Show up and sustain momentum.'],
]

const WORKBOOK_PAGES = ['Your Knowledge Inventory', 'Your Product Blueprint', 'Your One-Sentence Sales Promise', 'Your Offer Stack', 'Your 7-Day Launch Plan', 'Your Consistency Commitment']

const LADDER = [
  ['$7', 'Ebook'],
  ['$27', 'Mini-Course'],
  ['$47', 'Toolkit'],
  ['$10', 'Strategy Call'],
  ['$1K–$5K', 'Coaching'],
]

const BONUSES = [
  ['The 90-Day Content Calendar', '90 daily content topics, pre-planned phase-by-phase, so you never have to stare at a blank screen wondering what to post.'],
  ['The Product Blueprint Template', 'A one-page product planning template designed to help you turn your expertise into a concrete digital product.'],
  ['The Offer Stack Builder', 'A fill-in-the-blank document designed to help you build your complete offer description in under 30 minutes.'],
]

const FOR_YOU = [
  'You are a coach, consultant, healer, creator, expert, or service provider.',
  'You know you have valuable knowledge but do not know how to package it.',
  'You are tired of trading your time for money.',
  'You want to create a digital product.',
  'You do not know exactly what to sell.',
  'You are unsure who your ideal customer is.',
  'You are posting content but not seeing a clear path to sales.',
  'You want to build toward $10K/month.',
  'You want a practical roadmap instead of another theory-heavy book.',
  'You are willing to actually do the work.',
]

const NOT_FOR_YOU = [
  'You want guaranteed income without execution.',
  'You want someone else to build the business for you.',
  'You are looking for overnight riches.',
  'You have no intention of implementing what you learn.',
]

const OFFER_INCLUDES = [
  'The Knowledge Asset — 9 practical chapters',
  'Interactive exercises',
  'Product-building worksheets',
  'Offer-building framework',
  'Organic content system',
  'A practical launch plan',
  'The $7 → $10K product ladder',
  'Mindset for consistent $10K months',
]

const FAQS = [
  ['Is this a regular business book?', 'No. It is designed as a practical workbook. You are meant to work through the exercises and make decisions as you go.'],
  ['Who is this for?', 'Coaches, consultants, healers, creators, service providers, and experts who want to turn their knowledge into a digital business.'],
  ['Do I need a large audience?', 'No large audience is required to begin. The book focuses on clarity, product creation, positioning, organic content, and a simple launch process.'],
  ['Do I need paid ads?', 'The roadmap emphasizes organic content and a simple launch rather than requiring paid advertising.'],
  ['Do I need a team?', 'No. The book is specifically designed around building a simple digital product business without requiring a large team.'],
  ['How much does it cost?', '$7.93 one time.'],
  ['Is there a guarantee?', 'Yes. The purchase comes with a 365-day money-back guarantee, subject to the published refund terms.'],
  ['Will this guarantee that I make $10,000/month?', 'No. The $10K/month figure is the business-building target and roadmap. Results depend on execution, market, offer, audience, consistency, and many factors outside the authors’ control.'],
]

/* ── Section shell ────────────────────────────────────────────────────────── */
function Section({ id, bg = PAPER, color, children, style }: { id?: string; bg?: string; color?: string; children: ReactNode; style?: CSSProperties }) {
  return (
    <section id={id} style={{ background: bg, color: color || INK, padding: 'clamp(64px, 9vw, 116px) 0', ...style }}>
      <div style={{ maxWidth: 1180, margin: '0 auto', padding: '0 clamp(20px, 5vw, 40px)' }}>{children}</div>
    </section>
  )
}

const H2: CSSProperties = { fontFamily: SERIF, fontWeight: 700, fontSize: 'clamp(28px, 5vw, 46px)', lineHeight: 1.08, letterSpacing: '-.02em', margin: 0 }

/* ═══════════════════════════════════════════════════════════════════════════ */
export default function Workbook({ planId }: { planId: string }) {
  const NAV = [
    ['What You’ll Build', '#build'],
    ['Inside The Book', '#inside'],
    ['Bonuses', '#bonuses'],
    ['Authors', '#authors'],
    ['FAQ', '#faq'],
  ]

  return (
    <div style={{ fontFamily: SANS, color: INK, background: IVORY, overflowX: 'hidden' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        html{scroll-behavior:smooth}
        .ka-cta{transition:transform .2s ease, box-shadow .2s ease}
        .ka-cta:hover{transform:translateY(-2px)}
        @keyframes ka-spin{to{transform:rotate(360deg)}}
        @keyframes ka-float{0%,100%{transform:rotateY(-22deg) rotateX(5deg) translateY(0)}50%{transform:rotateY(-19deg) rotateX(5deg) translateY(-12px)}}
        .ka-float{animation:ka-float 6s ease-in-out infinite}
        .ka-hero-grid{display:grid;grid-template-columns:1.05fr .95fr;gap:56px;align-items:center}
        .ka-checkout-grid{display:grid;grid-template-columns:1fr 1.1fr;gap:28px;align-items:start}
        .ka-2col{display:grid;grid-template-columns:1fr 1fr;gap:28px}
        .ka-3col{display:grid;grid-template-columns:repeat(3,1fr);gap:20px}
        .ka-nav-links{display:flex;gap:28px}
        .ka-timeline{display:grid;grid-template-columns:repeat(7,1fr);gap:14px}
        .ka-ladder{display:flex;align-items:flex-end;justify-content:center;gap:0;flex-wrap:wrap}
        .ka-sticky-cta{display:none}
        @media(max-width:960px){
          .ka-hero-grid{grid-template-columns:1fr;gap:36px}
          .ka-checkout-grid{grid-template-columns:1fr}
          .ka-timeline{grid-template-columns:1fr;gap:0}
          .ka-3col{grid-template-columns:1fr}
          .ka-nav-links{display:none}
        }
        @media(max-width:760px){
          .ka-2col{grid-template-columns:1fr}
          .ka-sticky-cta{display:flex}
          .ka-hero-float{animation:none}
        }
        @media(prefers-reduced-motion:reduce){.ka-float,.ka-cta{animation:none;transition:none}}
      `}</style>

      {/* 1 — Announcement bar */}
      <div style={{ background: INK, color: IVORY2, textAlign: 'center', fontSize: 11.5, fontWeight: 700, letterSpacing: '.14em', padding: '9px 16px', textTransform: 'uppercase' }}>
        The Knowledge Asset <span style={{ color: GOLD_LT }}>•</span> Now available for {PRICE} <span style={{ color: GOLD_LT }}>•</span> 365-Day Money-Back Guarantee
      </div>

      {/* Nav */}
      <header style={{ position: 'sticky', top: 0, zIndex: 40, background: 'rgba(245,240,230,.86)', backdropFilter: 'blur(10px)', borderBottom: `1px solid ${LINE_SOFT}` }}>
        <div style={{ maxWidth: 1180, margin: '0 auto', padding: '12px clamp(20px,5vw,40px)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          <a href="#top" style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 17, color: INK, textDecoration: 'none', letterSpacing: '-.01em' }}>The Knowledge Asset</a>
          <nav className="ka-nav-links" aria-label="Sections">
            {NAV.map(([l, h]) => <a key={h} href={h} style={{ fontSize: 13.5, fontWeight: 600, color: MUTE, textDecoration: 'none' }}>{l}</a>)}
          </nav>
          <CTA label={`Get the Book — ${PRICE}`} size="md" />
        </div>
      </header>

      {/* 2 — Hero */}
      <div id="top" />
      <Section bg={IVORY} style={{ paddingTop: 'clamp(48px,7vw,84px)' }}>
        <div className="ka-hero-grid">
          <div>
            <Eyebrow gold>The 10K Roadmap Series</Eyebrow>
            <h1 style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 'clamp(46px, 9vw, 92px)', lineHeight: 0.94, letterSpacing: '-.03em', margin: '18px 0 0' }}>
              THE<br />KNOWLEDGE<br /><span style={{ color: GOLD_DK }}>ASSET</span>
            </h1>
            <p style={{ fontFamily: SERIF, fontSize: 'clamp(18px,2.6vw,23px)', color: CHAR, marginTop: 22, maxWidth: 520, lineHeight: 1.4 }}>
              Turn What You Know Into a $10K-a-Month Digital Business.
            </p>
            <p style={{ fontSize: 16, color: MUTE, marginTop: 16, maxWidth: 500, lineHeight: 1.7 }}>
              A practical, build-as-you-go workbook for coaches, consultants, healers, creators, and experts who are ready to stop trading their time for money — and start turning their knowledge into an asset.
            </p>
            <div style={{ marginTop: 28 }}><CTA /></div>
            <p style={{ fontSize: 13, color: MUTE2, marginTop: 14 }}>Instant digital access · Work through it as you build · 365-day money-back guarantee</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px 22px', marginTop: 22 }}>
              {['Practical workbook', 'Step-by-step exercises', '3 free bonuses', '365-day guarantee'].map((t) => (
                <span key={t} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 13.5, fontWeight: 600, color: CHAR }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={GOLD_DK} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden><polyline points="20 6 9 17 4 12" /></svg>{t}
                </span>
              ))}
            </div>
          </div>
          <div style={{ position: 'relative' }}>
            <BookMockup />
            <div style={{ textAlign: 'center', marginTop: 26 }}>
              <span style={{ display: 'inline-block', fontFamily: SANS, fontSize: 11.5, fontWeight: 800, letterSpacing: '.18em', textTransform: 'uppercase', color: GOLD_DK, border: `1px solid ${GOLD_SOFT}`, borderRadius: 999, padding: '9px 18px', background: GOLD_SOFT }}>
                Read it. Do the work. Build the business.
              </span>
            </div>
          </div>
        </div>
      </Section>

      {/* 3 — Problem */}
      <Section bg={INK} color={IVORY2} id="problem">
        <Reveal>
          <h2 style={{ ...H2, maxWidth: 900 }}>YOU DON&apos;T NEED ANOTHER BUSINESS BOOK.<br /><span style={{ color: GOLD_LT }}>YOU NEED TO BUILD.</span></h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr)', gap: 18, marginTop: 26, maxWidth: 720, fontSize: 17, lineHeight: 1.75, color: 'rgba(245,240,230,.82)' }}>
            <p>You&apos;ve probably consumed enough advice. You&apos;ve saved posts. Watched videos. Bought courses. Taken notes. Made plans.</p>
            <p>But information isn&apos;t the problem. <strong style={{ color: IVORY2 }}>Execution is.</strong></p>
            <p>And if your income still depends on you being present for every client, every call, every hour and every dollar — you haven&apos;t built an asset yet. You&apos;ve built yourself another job.</p>
            <p style={{ color: GOLD_LT, fontFamily: SERIF, fontSize: 22 }}>THE KNOWLEDGE ASSET changes that.</p>
            <p>It gives you a practical roadmap for turning what you already know into something you can package, sell, improve, and build upon.</p>
          </div>
        </Reveal>
        <Reveal delay={80} style={{ marginTop: 44 }}>
          <div className="ka-2col">
            <div style={{ border: `1px solid rgba(245,240,230,.16)`, borderRadius: 16, padding: '26px 24px' }}>
              <Eyebrow>Trading time for money</Eyebrow>
              <ul style={{ listStyle: 'none', margin: '16px 0 0', display: 'grid', gap: 12 }}>
                {['Your income depends on your time.', 'Every client requires you.', 'You start from zero every month.', 'You constantly need to sell your availability.'].map((t) => (
                  <li key={t} style={{ display: 'flex', gap: 12, fontSize: 15.5, color: 'rgba(245,240,230,.78)' }}><span style={{ color: '#8f7a52' }}>✕</span>{t}</li>
                ))}
              </ul>
            </div>
            <div style={{ border: `1px solid ${GOLD_SOFT}`, background: 'rgba(176,137,58,.08)', borderRadius: 16, padding: '26px 24px' }}>
              <Eyebrow gold>Building a knowledge asset</Eyebrow>
              <ul style={{ listStyle: 'none', margin: '16px 0 0', display: 'grid', gap: 12 }}>
                {['Create once.', 'Sell repeatedly.', 'Build a product ladder.', 'Create leverage.', 'Build an asset around your expertise.'].map((t) => (
                  <li key={t} style={{ display: 'flex', gap: 12, fontSize: 15.5, color: IVORY2 }}><span style={{ color: GOLD_LT }}>✓</span>{t}</li>
                ))}
              </ul>
            </div>
          </div>
        </Reveal>
      </Section>

      {/* 4 — Core promise */}
      <Section bg={IVORY2}>
        <Reveal style={{ textAlign: 'center', maxWidth: 760, margin: '0 auto' }}>
          <Eyebrow gold center>From expertise to asset</Eyebrow>
          <h2 style={{ ...H2, marginTop: 16 }}>WHAT IF YOUR KNOWLEDGE COULD BECOME AN ASSET?</h2>
          <p style={{ fontSize: 17, lineHeight: 1.8, color: MUTE, marginTop: 22 }}>
            You already know things other people are trying to figure out. You&apos;ve solved problems. Learned lessons. Developed skills. Made mistakes. Discovered systems. Lived through transformations.
          </p>
          <p style={{ fontFamily: SERIF, fontSize: 'clamp(20px,3vw,26px)', color: INK, marginTop: 24, lineHeight: 1.4 }}>
            The question isn&apos;t <span style={{ color: MUTE2 }}>&ldquo;Do I know enough?&rdquo;</span><br />It&apos;s <span style={{ color: GOLD_DK }}>&ldquo;How do I package what I know so someone can buy it?&rdquo;</span>
          </p>
          <p style={{ fontSize: 16, color: MUTE, marginTop: 18 }}>The book helps answer that question.</p>
        </Reveal>
      </Section>

      {/* 5 — What you'll build */}
      <Section bg={PAPER} id="build">
        <Reveal>
          <Eyebrow gold>What you&apos;ll build</Eyebrow>
          <h2 style={{ ...H2, marginTop: 14 }}>DON&apos;T JUST READ THE BOOK.<br /><span style={{ color: GOLD_DK }}>BUILD YOUR BUSINESS INSIDE IT.</span></h2>
          <p style={{ fontSize: 17, color: MUTE, marginTop: 16, maxWidth: 620 }}>Every major section moves you from thinking to doing.</p>
        </Reveal>
        <Reveal delay={80} style={{ marginTop: 42 }}>
          <div className="ka-timeline">
            {BUILD_STEPS.map(([n, t, d]) => (
              <div key={n} style={{ borderTop: `2px solid ${GOLD_SOFT}`, paddingTop: 18, position: 'relative' }}>
                <span style={{ position: 'absolute', top: -9, left: 0, width: 16, height: 16, borderRadius: '50%', background: GOLD, boxShadow: `0 0 0 4px ${IVORY}` }} />
                <div style={{ fontFamily: SERIF, fontSize: 26, fontWeight: 700, color: GOLD_DK }}>{n}</div>
                <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 15, color: INK, marginTop: 6, lineHeight: 1.25 }}>{t}</div>
                <p style={{ fontSize: 13, color: MUTE, marginTop: 8, lineHeight: 1.55 }}>{d as string}</p>
              </div>
            ))}
          </div>
        </Reveal>
        <Reveal delay={120} style={{ marginTop: 44, textAlign: 'center' }}><CTA label={`START BUILDING — ${PRICE}`} /></Reveal>
      </Section>

      {/* 6 — What's inside */}
      <Section bg={IVORY} id="inside">
        <Reveal>
          <Eyebrow gold>What&apos;s inside</Eyebrow>
          <h2 style={{ ...H2, marginTop: 14 }}>9 CHAPTERS.<br /><span style={{ color: GOLD_DK }}>ONE PRACTICAL ROADMAP.</span></h2>
        </Reveal>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16, marginTop: 40 }}>
          {CHAPTERS.map(([t, d], i) => (
            <Reveal key={t} delay={i * 40}>
              <div style={{ background: PAPER, border: `1px solid ${LINE}`, borderRadius: 14, padding: '22px 22px', height: '100%' }}>
                <div style={{ fontFamily: SANS, fontSize: 12, fontWeight: 800, letterSpacing: '.14em', color: GOLD_DK }}>CHAPTER {i + 1}</div>
                <div style={{ fontFamily: SERIF, fontSize: 20, fontWeight: 700, color: INK, marginTop: 8, lineHeight: 1.2 }}>{t}</div>
                <p style={{ fontSize: 14, color: MUTE, marginTop: 8, lineHeight: 1.55 }}>{d}</p>
              </div>
            </Reveal>
          ))}
        </div>
        <Reveal delay={120} style={{ marginTop: 22 }}>
          <div style={{ background: INK, color: IVORY2, borderRadius: 14, padding: '24px 26px', display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontFamily: SANS, fontSize: 12, fontWeight: 800, letterSpacing: '.14em', color: GOLD_LT }}>PLUS</div>
              <div style={{ fontFamily: SERIF, fontSize: 22, fontWeight: 700, marginTop: 4 }}>Your Next 24 Hours</div>
              <p style={{ fontSize: 14.5, color: 'rgba(245,240,230,.78)', marginTop: 4, maxWidth: 640 }}>A practical, action-focused conclusion designed to get you moving immediately.</p>
            </div>
          </div>
        </Reveal>
      </Section>

      {/* 7 — Workbook experience */}
      <Section bg={PAPER}>
        <div className="ka-2col" style={{ alignItems: 'center', gap: 48 }}>
          <Reveal>
            <Eyebrow gold>Build it as you read it</Eyebrow>
            <h2 style={{ ...H2, marginTop: 14 }}>THIS IS NOT A BOOK YOU FINISH.<br /><span style={{ color: GOLD_DK }}>IT&apos;S A BUSINESS YOU BUILD.</span></h2>
            <p style={{ fontSize: 16.5, color: MUTE, marginTop: 18, lineHeight: 1.75, maxWidth: 520 }}>
              Each chapter is designed to move you forward. You&apos;ll answer questions. Make decisions. Choose your audience. Develop your product. Shape your offer. Plan your content. Set your launch. Commit to the next action.
            </p>
            <p style={{ fontSize: 16.5, color: INK, marginTop: 14, fontWeight: 600 }}>The goal isn&apos;t to highlight every page. The goal is to finish with something real.</p>
          </Reveal>
          <Reveal delay={100}>
            <div style={{ display: 'grid', gap: 12 }}>
              {WORKBOOK_PAGES.map((p, i) => (
                <div key={p} style={{ display: 'flex', alignItems: 'center', gap: 16, background: IVORY2, border: `1px solid ${LINE_SOFT}`, borderLeft: `3px solid ${GOLD}`, borderRadius: 10, padding: '16px 18px' }}>
                  <span style={{ fontFamily: SERIF, fontSize: 15, color: GOLD_DK, fontWeight: 700, width: 24 }}>{String(i + 1).padStart(2, '0')}</span>
                  <span style={{ fontFamily: SANS, fontSize: 15.5, fontWeight: 600, color: INK }}>{p}</span>
                  <span style={{ marginLeft: 'auto', fontSize: 12, color: MUTE2, fontStyle: 'italic' }}>your answer →</span>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </Section>

      {/* 8 — The $7 → $10K ladder */}
      <Section bg={IVORY2}>
        <Reveal style={{ textAlign: 'center', maxWidth: 760, margin: '0 auto' }}>
          <Eyebrow gold center>The product ladder</Eyebrow>
          <h2 style={{ ...H2, marginTop: 14 }}>SEE THE PATH FROM YOUR FIRST DIGITAL SALE TO $10K MONTHS.</h2>
          <p style={{ fontSize: 16.5, color: MUTE, marginTop: 18, lineHeight: 1.7 }}>You don&apos;t need one giant offer. You can build a connected product ladder around the same person.</p>
        </Reveal>
        <Reveal delay={100} style={{ marginTop: 44 }}>
          <div className="ka-ladder">
            {LADDER.map(([price, label], i) => (
              <div key={label} style={{ display: 'flex', alignItems: 'flex-end' }}>
                <div style={{ textAlign: 'center', background: PAPER, border: `1px solid ${LINE}`, borderRadius: 12, padding: '18px 20px', minWidth: 118, marginBottom: i * 6, boxShadow: '0 8px 24px rgba(21,18,13,.06)' }}>
                  <div style={{ fontFamily: SERIF, fontSize: 'clamp(22px,3vw,30px)', fontWeight: 700, color: i === LADDER.length - 1 ? GOLD_DK : INK }}>{price}</div>
                  <div style={{ fontFamily: SANS, fontSize: 11.5, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: MUTE, marginTop: 4 }}>{label}</div>
                </div>
                {i < LADDER.length - 1 && <span aria-hidden style={{ color: GOLD, fontSize: 22, margin: '0 4px 20px' }}>↗</span>}
              </div>
            ))}
          </div>
        </Reveal>
        <Reveal delay={140} style={{ textAlign: 'center', maxWidth: 640, margin: '38px auto 0' }}>
          <p style={{ fontFamily: SERIF, fontSize: 19, color: INK, lineHeight: 1.5 }}>Start small. Prove demand. Go deeper. Increase value. Build leverage.</p>
          <p style={{ fontSize: 15.5, color: MUTE, marginTop: 12 }}>This is not about creating ten products overnight. It&apos;s about understanding how one piece of expertise can become the foundation of an entire business.</p>
        </Reveal>
      </Section>

      {/* 9 — Real client story */}
      <Section bg={INK} color={IVORY2}>
        <Reveal style={{ maxWidth: 820, margin: '0 auto', textAlign: 'center' }}>
          <Eyebrow gold center>Real client story</Eyebrow>
          <h2 style={{ ...H2, marginTop: 16 }}>WHAT HAPPENS WHEN EXPERTISE BECOMES AN ASSET?</h2>
          <blockquote style={{ fontFamily: SERIF, fontSize: 'clamp(20px,3vw,27px)', lineHeight: 1.5, color: IVORY2, margin: '30px auto 0', maxWidth: 700, borderLeft: `3px solid ${GOLD}`, paddingLeft: 24, textAlign: 'left' }}>
            A nutritional consultant had spent 12 years giving the same advice one-on-one to private clients. We packaged her method into a $47 digital toolkit. In its first month, it made more than two of her consulting clients combined — without a single additional coaching call.
          </blockquote>
          <div style={{ marginTop: 22, fontFamily: SANS, fontSize: 12, fontWeight: 800, letterSpacing: '.18em', textTransform: 'uppercase', color: GOLD_LT }}>Real client story from the book</div>
        </Reveal>
      </Section>

      {/* 10 — Testimonials (placeholders, not fabricated) */}
      <Section bg={IVORY}>
        <Reveal>
          <Eyebrow gold>What readers are saying</Eyebrow>
          <h2 style={{ ...H2, marginTop: 14 }}>WHAT READERS ARE SAYING</h2>
          <p style={{ fontSize: 15, color: MUTE2, marginTop: 12, maxWidth: 620 }}>Verified reader reviews will be published here as they come in.</p>
        </Reveal>
        <div className="ka-3col" style={{ marginTop: 36 }}>
          {[0, 1, 2].map((i) => (
            <Reveal key={i} delay={i * 60}>
              <div style={{ background: PAPER, border: `1px dashed ${LINE}`, borderRadius: 14, padding: '26px 24px', height: '100%' }}>
                <div style={{ color: MUTE2, fontSize: 22, letterSpacing: 2 }}>&ldquo;</div>
                <p style={{ fontFamily: SERIF, fontSize: 17, color: CHAR, lineHeight: 1.55, marginTop: 6 }}>
                  {i === 0 ? '“The book helped me finally ______.”' : 'Add a real customer quote about what changed after working through the book.'}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 20, paddingTop: 16, borderTop: `1px solid ${LINE_SOFT}` }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: IVORY, border: `1px solid ${LINE}` }} />
                  <div>
                    <div style={{ fontSize: 13.5, fontWeight: 700, color: MUTE }}>[Verified reader name]</div>
                    <div style={{ fontSize: 12, color: MUTE2 }}>Role · Location</div>
                  </div>
                </div>
                <div style={{ marginTop: 14, fontSize: 11, letterSpacing: '.14em', textTransform: 'uppercase', color: MUTE2 }}>Verified reader testimonial goes here</div>
              </div>
            </Reveal>
          ))}
        </div>
        <Reveal delay={120} style={{ marginTop: 22, textAlign: 'center' }}>
          <span style={{ display: 'inline-block', fontSize: 13.5, color: MUTE, background: PAPER, border: `1px solid ${LINE}`, borderRadius: 999, padding: '10px 20px' }}>
            <strong style={{ color: GOLD_DK }}>20+ clients</strong> guided to their first $10K months — from Indrodip&apos;s client work.
          </span>
        </Reveal>
      </Section>

      {/* 11 — Bonuses */}
      <Section bg={PAPER} id="bonuses">
        <Reveal>
          <Eyebrow gold>Included with the book</Eyebrow>
          <h2 style={{ ...H2, marginTop: 14 }}>BUY THE BOOK.<br /><span style={{ color: GOLD_DK }}>GET THE BUILDING TOOLS TOO.</span></h2>
          <p style={{ fontSize: 16.5, color: MUTE, marginTop: 16 }}>Your purchase includes three practical bonuses.</p>
        </Reveal>
        <div className="ka-3col" style={{ marginTop: 40 }}>
          {BONUSES.map(([t, d], i) => (
            <Reveal key={t} delay={i * 70}>
              <div style={{ background: IVORY2, border: `1px solid ${LINE}`, borderRadius: 16, padding: '26px 24px', height: '100%', position: 'relative' }}>
                <span style={{ position: 'absolute', top: 18, right: 18, fontSize: 10.5, fontWeight: 800, letterSpacing: '.14em', color: GOLD_DK, background: GOLD_SOFT, borderRadius: 999, padding: '5px 12px' }}>BONUS</span>
                <div style={{ fontFamily: SERIF, fontSize: 30, fontWeight: 700, color: GOLD_DK }}>#{i + 1}</div>
                <div style={{ fontFamily: SERIF, fontSize: 21, fontWeight: 700, color: INK, marginTop: 8, lineHeight: 1.2 }}>{t}</div>
                <p style={{ fontSize: 14.5, color: MUTE, marginTop: 10, lineHeight: 1.6 }}>{d}</p>
              </div>
            </Reveal>
          ))}
        </div>
        <Reveal delay={140} style={{ marginTop: 32, textAlign: 'center' }}>
          <p style={{ fontFamily: SERIF, fontSize: 'clamp(19px,2.6vw,24px)', color: INK, lineHeight: 1.4 }}>Everything you need to stop thinking about your business…<br />and start building it.</p>
        </Reveal>
      </Section>

      {/* 12 — What makes this different */}
      <Section bg={IVORY}>
        <Reveal>
          <Eyebrow gold>The difference</Eyebrow>
          <h2 style={{ ...H2, marginTop: 14 }}>MOST BUSINESS BOOKS GIVE YOU IDEAS.<br /><span style={{ color: GOLD_DK }}>THIS ONE GIVES YOU WORK TO DO.</span></h2>
        </Reveal>
        <div className="ka-3col" style={{ marginTop: 40 }}>
          {[
            ['Typical business book', ['Read.', 'Highlight.', 'Put it down.', 'Forget most of it.'], false],
            ['The Knowledge Asset', ['Read.', 'Answer.', 'Build.', 'Launch.', 'Learn.'], true],
            ['The goal', ['A real product.', 'A real offer.', 'A real audience.', 'A real launch plan.'], false],
          ].map(([title, items, hl], i) => (
            <Reveal key={title as string} delay={i * 60}>
              <div style={{ background: hl ? INK : PAPER, color: hl ? IVORY2 : INK, border: hl ? 'none' : `1px solid ${LINE}`, borderRadius: 16, padding: '26px 24px', height: '100%' }}>
                <div style={{ fontFamily: SANS, fontSize: 12, fontWeight: 800, letterSpacing: '.14em', textTransform: 'uppercase', color: hl ? GOLD_LT : MUTE2 }}>{title as string}</div>
                <ul style={{ listStyle: 'none', margin: '16px 0 0', display: 'grid', gap: 10 }}>
                  {(items as string[]).map((it) => (
                    <li key={it} style={{ display: 'flex', gap: 10, fontSize: 16, fontFamily: SERIF, color: hl ? IVORY2 : CHAR }}>
                      <span style={{ color: hl ? GOLD_LT : GOLD_DK }}>{hl ? '✓' : '•'}</span>{it}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* 13 — Authors */}
      <Section bg={PAPER} id="authors">
        <Reveal style={{ textAlign: 'center' }}>
          <Eyebrow gold center>The authors</Eyebrow>
          <h2 style={{ ...H2, marginTop: 14 }}>TWO AUTHORS. TWO STRENGTHS. ONE ROADMAP.</h2>
        </Reveal>
        <div className="ka-2col" style={{ marginTop: 42 }}>
          {[
            { name: 'INDRODIP GHOSH', role: 'Digital Product Strategist · Co-Author', photo: '/images/founder.png', copy: 'Indrodip brings the strategy and systems side of the book — business mechanics, digital products, scaling, and the market reality of building an online business. His chapters draw from years of building and rebuilding businesses, his experience as a digital product strategist, and the real stories of 20+ clients he has guided toward their first $10K months. He also shares the story behind his own transition from a service business dependent on his time to digital products and coaching.' },
            { name: 'CHRISTINEE MATHISON', role: 'Mindset Coach · Co-Author', photo: null, copy: 'Christinee brings the transformation and clarity side of the book — audience clarity, offer building, content, mindset, and the inner work required to show up consistently. Her chapters help readers understand who they are building for, package their expertise into an offer, communicate their value, and develop the mindset required for consistent action.' },
          ].map((a, i) => (
            <Reveal key={a.name} delay={i * 90}>
              <div style={{ background: IVORY2, border: `1px solid ${LINE}`, borderRadius: 18, padding: '28px 26px', height: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
                  {a.photo ? (
                    <img src={a.photo} alt={a.name} loading="lazy" style={{ width: 78, height: 78, borderRadius: '50%', objectFit: 'cover', border: `2px solid ${GOLD_SOFT}` }} />
                  ) : (
                    <div style={{ width: 78, height: 78, borderRadius: '50%', background: `linear-gradient(155deg,#efe7d6,#d8ccb2)`, border: `2px solid ${GOLD_SOFT}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: SERIF, fontSize: 26, color: GOLD_DK, fontWeight: 700 }} aria-label={a.name}>CM</div>
                  )}
                  <div>
                    <div style={{ fontFamily: SERIF, fontSize: 23, fontWeight: 700, color: INK }}>{a.name}</div>
                    <div style={{ fontSize: 13, color: GOLD_DK, fontWeight: 600, marginTop: 4 }}>{a.role}</div>
                  </div>
                </div>
                <p style={{ fontSize: 15, color: MUTE, marginTop: 18, lineHeight: 1.7 }}>{a.copy}</p>
              </div>
            </Reveal>
          ))}
        </div>
        <Reveal delay={140} style={{ textAlign: 'center', marginTop: 34 }}>
          <p style={{ fontFamily: SERIF, fontSize: 'clamp(18px,2.4vw,22px)', color: INK, letterSpacing: '.02em' }}>Two voices. One mission. One complete roadmap.</p>
        </Reveal>
      </Section>

      {/* 14 — Authors' story */}
      <Section bg={IVORY}>
        <Reveal>
          <Eyebrow gold>The story behind it</Eyebrow>
          <h2 style={{ ...H2, marginTop: 14 }}>THIS BOOK CAME FROM REAL BUSINESS.<br /><span style={{ color: GOLD_DK }}>NOT THEORY.</span></h2>
        </Reveal>
        <div className="ka-2col" style={{ marginTop: 38 }}>
          <Reveal>
            <div style={{ background: PAPER, border: `1px solid ${LINE}`, borderRadius: 16, padding: '26px 24px', height: '100%' }}>
              <div style={{ fontFamily: SANS, fontSize: 12, fontWeight: 800, letterSpacing: '.14em', color: GOLD_DK }}>INDRODIP&apos;S STORY</div>
              <p style={{ fontSize: 15.5, color: MUTE, marginTop: 14, lineHeight: 1.75 }}>
                He didn&apos;t begin with a perfect business plan. He tried different ventures, entered digital marketing, built an agency, worked with international clients, and eventually realized something uncomfortable: a business that requires you for every dollar is still dependent on your time.
              </p>
              <p style={{ fontSize: 15.5, color: MUTE, marginTop: 12, lineHeight: 1.75 }}>
                He transitioned toward digital products and coaching, started again from zero clients, and eventually reached his first $10K month without relying on ads or a large team.
              </p>
              <p style={{ fontFamily: SERIF, fontSize: 18, color: INK, marginTop: 14 }}>The lesson: clarity + story + a simple system can create momentum.</p>
            </div>
          </Reveal>
          <Reveal delay={90}>
            <div style={{ background: PAPER, border: `1px solid ${LINE}`, borderRadius: 16, padding: '26px 24px', height: '100%' }}>
              <div style={{ fontFamily: SANS, fontSize: 12, fontWeight: 800, letterSpacing: '.14em', color: GOLD_DK }}>CHRISTINEE&apos;S CONTRIBUTION</div>
              <p style={{ fontSize: 15.5, color: MUTE, marginTop: 14, lineHeight: 1.75 }}>
                She brings the clarity around audience, offers, content, and the inner game required to consistently show up and sell.
              </p>
              <p style={{ fontSize: 15.5, color: MUTE, marginTop: 12, lineHeight: 1.75 }}>
                This book combines those two perspectives.
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 16 }}>
                {['Strategy + transformation', 'Systems + clarity'].map((t) => (
                  <span key={t} style={{ fontFamily: SERIF, fontSize: 16, color: INK, background: GOLD_SOFT, borderRadius: 999, padding: '8px 16px' }}>{t}</span>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </Section>

      {/* 15 — Who it's for */}
      <Section bg={PAPER}>
        <div className="ka-2col" style={{ gap: 40 }}>
          <Reveal>
            <h2 style={{ ...H2 }}>THIS BOOK IS FOR YOU IF…</h2>
            <ul style={{ listStyle: 'none', margin: '24px 0 0', display: 'grid', gap: 12 }}>
              {FOR_YOU.map((t) => (
                <li key={t} style={{ display: 'flex', gap: 12, fontSize: 15.5, color: CHAR, lineHeight: 1.5 }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={GOLD_DK} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 2 }} aria-hidden><polyline points="20 6 9 17 4 12" /></svg>{t}
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal delay={90}>
            <div style={{ background: IVORY2, border: `1px solid ${LINE}`, borderRadius: 16, padding: '28px 26px' }}>
              <h3 style={{ fontFamily: SERIF, fontSize: 'clamp(22px,3vw,30px)', fontWeight: 700, color: INK, margin: 0 }}>THIS BOOK IS NOT FOR YOU IF…</h3>
              <ul style={{ listStyle: 'none', margin: '20px 0 0', display: 'grid', gap: 14 }}>
                {NOT_FOR_YOU.map((t) => (
                  <li key={t} style={{ display: 'flex', gap: 12, fontSize: 15.5, color: MUTE, lineHeight: 1.5 }}>
                    <span style={{ color: '#b06a52', fontWeight: 700, flexShrink: 0 }}>✕</span>{t}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </Section>

      {/* 16 + 17 — The offer / value stack */}
      <Section bg={INK} color={IVORY2} id="offer">
        <Reveal style={{ textAlign: 'center', maxWidth: 720, margin: '0 auto' }}>
          <Eyebrow gold center>The offer</Eyebrow>
          <h2 style={{ ...H2, marginTop: 16 }}>YOUR KNOWLEDGE IS ALREADY THERE.<br /><span style={{ color: GOLD_LT }}>NOW BUILD SOMETHING WITH IT.</span></h2>
        </Reveal>
        <Reveal delay={100} style={{ marginTop: 42, maxWidth: 560, margin: '42px auto 0' }}>
          <div style={{ background: IVORY2, color: INK, borderRadius: 22, padding: '34px 30px', boxShadow: '0 30px 70px rgba(0,0,0,.4)', border: `1px solid ${GOLD_SOFT}` }}>
            <div style={{ fontFamily: SERIF, fontSize: 26, fontWeight: 700, textAlign: 'center' }}>The Knowledge Asset</div>
            <div style={{ textAlign: 'center', fontSize: 13, color: MUTE, marginTop: 4 }}>Digital Workbook + 3 Bonuses</div>
            <ul style={{ listStyle: 'none', margin: '24px 0 0', display: 'grid', gap: 11 }}>
              {OFFER_INCLUDES.map((t) => (
                <li key={t} style={{ display: 'flex', gap: 11, fontSize: 15, color: CHAR }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={GOLD_DK} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 3 }} aria-hidden><polyline points="20 6 9 17 4 12" /></svg>{t}
                </li>
              ))}
            </ul>
            <div style={{ marginTop: 20, paddingTop: 18, borderTop: `1px solid ${LINE}`, display: 'grid', gap: 9 }}>
              {['90-Day Content Calendar', 'Product Blueprint Template', 'Offer Stack Builder'].map((t) => (
                <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 11, fontSize: 15, color: CHAR }}>
                  <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: '.1em', color: GOLD_DK, background: GOLD_SOFT, borderRadius: 999, padding: '3px 9px' }}>BONUS</span>{t}
                </div>
              ))}
            </div>
            <div style={{ textAlign: 'center', marginTop: 26 }}>
              <div style={{ fontFamily: SERIF, fontSize: 52, fontWeight: 700, color: GOLD_DK, lineHeight: 1 }}>{PRICE}</div>
              <div style={{ fontSize: 12.5, color: MUTE, marginTop: 6 }}>One-time payment · Digital access · 365-day money-back guarantee</div>
              <div style={{ marginTop: 18 }}><CTA label={`GET THE KNOWLEDGE ASSET`} /></div>
            </div>
          </div>
        </Reveal>
      </Section>

      {/* 18 — Guarantee */}
      <Section bg={IVORY2}>
        <Reveal style={{ maxWidth: 760, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ width: 96, height: 96, margin: '0 auto 22px', borderRadius: '50%', border: `2px solid ${GOLD}`, display: 'flex', alignItems: 'center', justifyContent: 'center', background: GOLD_SOFT }}>
            <div style={{ textAlign: 'center', lineHeight: 1 }}>
              <div style={{ fontFamily: SERIF, fontSize: 30, fontWeight: 700, color: GOLD_DK }}>365</div>
              <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: '.14em', color: GOLD_DK }}>DAYS</div>
            </div>
          </div>
          <h2 style={{ ...H2 }}>TRY IT FOR 365 DAYS.<br /><span style={{ color: GOLD_DK }}>YOU&apos;RE PROTECTED.</span></h2>
          <p style={{ fontSize: 16.5, color: MUTE, marginTop: 20, lineHeight: 1.75 }}>
            We want you to actually use this book. Work through it. Complete the exercises. Build your product. Shape your offer. Create your content plan. Launch. And if you decide the book isn&apos;t right for you, you&apos;re protected by our 365-day money-back guarantee.
          </p>
          <div style={{ marginTop: 26 }}><CTA label={`GET THE BOOK RISK-FREE`} /></div>
          <p style={{ fontSize: 12, color: MUTE2, marginTop: 18, maxWidth: 520, margin: '18px auto 0' }}>365-day money-back guarantee applies to the purchase price and is subject to the published refund terms.</p>
        </Reveal>
      </Section>

      {/* 19 — FAQ */}
      <Section bg={PAPER} id="faq">
        <Reveal style={{ maxWidth: 820, margin: '0 auto' }}>
          <Eyebrow gold>FAQ</Eyebrow>
          <h2 style={{ ...H2, marginTop: 14 }}>QUESTIONS?</h2>
          <div style={{ marginTop: 24 }}>
            {FAQS.map(([q, a]) => <FAQItem key={q} q={q} a={a} />)}
          </div>
        </Reveal>
      </Section>

      {/* 20 — Final CTA */}
      <Section bg={INK} color={IVORY2}>
        <Reveal style={{ textAlign: 'center', maxWidth: 820, margin: '0 auto' }}>
          <h2 style={{ ...H2 }}>YOU ALREADY KNOW MORE THAN YOU THINK.<br /><span style={{ color: GOLD_LT }}>NOW TURN IT INTO SOMETHING PEOPLE CAN BUY.</span></h2>
          <p style={{ fontSize: 16.5, color: 'rgba(245,240,230,.8)', marginTop: 20, lineHeight: 1.75 }}>
            You don&apos;t need another year of planning. You don&apos;t need another hundred videos. You don&apos;t need another complicated funnel. You need to start.
          </p>
          <p style={{ fontFamily: SERIF, fontSize: 20, color: IVORY2, marginTop: 16 }}>Open the workbook. Do the first exercise. Build the first asset.</p>
          <div style={{ marginTop: 28 }}><CTA label={`GET THE KNOWLEDGE ASSET — ${PRICE}`} /></div>
          <p style={{ fontSize: 13, color: GOLD_LT, marginTop: 14, fontWeight: 600 }}>365-Day Money-Back Guarantee</p>
          <div style={{ marginTop: 26, display: 'flex', gap: 20, justifyContent: 'center', flexWrap: 'wrap', fontFamily: SERIF, fontSize: 'clamp(14px,2vw,18px)', letterSpacing: '.1em', color: 'rgba(245,240,230,.7)' }}>
            <span>READ IT.</span><span>DO THE WORK.</span><span>BUILD THE BUSINESS.</span>
          </div>
        </Reveal>
      </Section>

      {/* 21 — Checkout */}
      <Section bg={IVORY} id="checkout">
        <Reveal style={{ textAlign: 'center', maxWidth: 720, margin: '0 auto 40px' }}>
          <Eyebrow gold center>Checkout</Eyebrow>
          <h2 style={{ ...H2, marginTop: 14 }}>START BUILDING YOUR KNOWLEDGE ASSET</h2>
          <p style={{ fontSize: 15.5, color: MUTE, marginTop: 14 }}>Secure, instant digital access. Your bonuses are included automatically.</p>
        </Reveal>
        <Reveal delay={80}><Checkout planId={planId} /></Reveal>
      </Section>

      {/* 22 — Footer */}
      <footer style={{ background: INK, color: 'rgba(245,240,230,.72)', padding: '54px 0 40px' }}>
        <div style={{ maxWidth: 1180, margin: '0 auto', padding: '0 clamp(20px,5vw,40px)' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontFamily: SERIF, fontSize: 22, fontWeight: 700, color: IVORY2 }}>The Knowledge Asset</div>
              <div style={{ fontSize: 13.5, marginTop: 8 }}>Indrodip Ghosh &amp; Christinee Mathison</div>
              <a href="https://10kroadmap.org" style={{ fontSize: 13.5, color: GOLD_LT, textDecoration: 'none', display: 'inline-block', marginTop: 4 }}>10kroadmap.org</a>
            </div>
            <nav style={{ display: 'flex', flexWrap: 'wrap', gap: '10px 22px' }} aria-label="Footer">
              {[['Privacy Policy', '/privacy'], ['Terms', '/terms'], ['Refund Policy', '/refund'], ['Contact', '/support']].map(([l, h]) => (
                <a key={l} href={h} style={{ fontSize: 13.5, color: 'rgba(245,240,230,.72)', textDecoration: 'none' }}>{l}</a>
              ))}
            </nav>
          </div>
          <div style={{ borderTop: `1px solid rgba(245,240,230,.14)`, marginTop: 30, paddingTop: 22, fontSize: 12, color: 'rgba(245,240,230,.55)', lineHeight: 1.7 }}>
            <p>© 2026 The5th Consulting. All rights reserved.</p>
            <p style={{ marginTop: 8, maxWidth: 780 }}>Business results vary. This book provides educational information and practical exercises; it does not guarantee financial results.</p>
          </div>
        </div>
      </footer>

      {/* Sticky mobile CTA */}
      <div className="ka-sticky-cta" style={{ position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 50, background: 'rgba(21,18,13,.96)', backdropFilter: 'blur(8px)', padding: '10px 14px', borderTop: `1px solid rgba(201,167,90,.3)`, alignItems: 'center', justifyContent: 'center' }}>
        <a href="#checkout" style={{ display: 'flex', width: '100%', minHeight: 52, alignItems: 'center', justifyContent: 'center', gap: 8, background: `linear-gradient(145deg,${GOLD_LT},${GOLD_DK})`, color: '#1c1405', fontFamily: SANS, fontWeight: 800, fontSize: 15.5, borderRadius: 999, textDecoration: 'none' }}>
          GET THE KNOWLEDGE ASSET — {PRICE}
        </a>
      </div>
    </div>
  )
}
