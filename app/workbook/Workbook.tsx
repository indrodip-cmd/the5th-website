'use client'
/* ─────────────────────────────────────────────────────────────────────────
   THE KNOWLEDGE ASSET — ultra-premium, on-brand sales page.

   Uses the house design system from the homepage: aubergine/plum + royal gold
   + parchment, Cormorant Garamond display (with italic emphasis) over DM Sans.
   Two-sided hero with the live Whop checkout embedded above the fold (#buy),
   a full-bleed 365-day guarantee moment, real author photos, and the 7-Day
   Free The5th AI trial as the headline bonus. Payment is the Whop embedded
   checkout (loader lives in the root layout); no fabricated proof.
   ───────────────────────────────────────────────────────────────────────── */
import { useEffect, useRef, useState, type ReactNode, type CSSProperties } from 'react'

/* ── Brand tokens (from public/index.html) ────────────────────────────────── */
const PLUM = '#3D2645'
const PLUM_DK = '#2E1A35'
const PLUM_DEEP = '#241229'
const GOLD = '#C9A84C'
const GOLD_LT = '#E4C879'
const GOLD_DK = '#B8983F'
const GOLD_INK = '#8a6f22'
const GOLD_SOFT = 'rgba(201,168,76,0.12)'
const GOLD_LINE = 'rgba(201,168,76,0.30)'
const PARCH = '#FAF6F0'
const PARCH_MID = '#F2EDE6'
const PARCH_DEEP = '#EAE3D8'
const INK = '#1A1A2E'
const INK_MID = '#403b3b'
const INK_MUTE = '#8A8075'
const BORDER = '#DDD8CF'
const WHITE = '#fff'
const CREAM = '#F6EFE3'

const SERIF = "'Cormorant Garamond', Georgia, Times, serif"
const SANS = "'DM Sans', system-ui, -apple-system, sans-serif"
const PRICE = '$7.93'

/* ── Scroll reveal (respects prefers-reduced-motion) ──────────────────────── */
function Reveal({ children, delay = 0, style }: { children: ReactNode; delay?: number; style?: CSSProperties }) {
  const ref = useRef<HTMLDivElement | null>(null)
  const [state, setState] = useState({ shown: false, reduce: false })
  const { shown, reduce } = state
  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setState({ shown: true, reduce: reduceMotion }); io.disconnect() } }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' })
    io.observe(el)
    return () => io.disconnect()
  }, [])
  const transition = reduce ? 'none' : `opacity .8s ease ${delay}ms, transform .8s cubic-bezier(.22,1,.36,1) ${delay}ms`
  return <div ref={ref} style={{ opacity: shown ? 1 : 0, transform: shown ? 'none' : 'translateY(20px)', transition, ...style }}>{children}</div>
}

/* ── Royal-gold primary CTA — scrolls to the in-page checkout ──────────────── */
function CTA({ label = `Get The Book — ${PRICE}`, href = '#buy', size = 'lg', style }: { label?: string; href?: string; size?: 'lg' | 'md'; style?: CSSProperties }) {
  const pad = size === 'lg' ? '1.15rem 2.4rem' : '.85rem 1.7rem'
  const fs = size === 'lg' ? '.95rem' : '.78rem'
  return (
    <a href={href} className="ka-cta" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: `linear-gradient(180deg,${GOLD_LT} 0%,${GOLD} 55%,${GOLD_DK} 100%)`, color: PLUM_DK, fontFamily: SANS, fontWeight: 700, fontSize: fs, letterSpacing: '.12em', textTransform: 'uppercase', padding: pad, borderRadius: 6, textDecoration: 'none', minHeight: 52, boxShadow: '0 8px 22px rgba(201,168,76,0.32), inset 0 1px 0 rgba(255,255,255,0.5)', ...style }}>
      {label}
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
    </a>
  )
}

function Eyebrow({ children, center = false, onDark = false }: { children: ReactNode; center?: boolean; onDark?: boolean }) {
  return <div style={{ fontFamily: SANS, fontSize: '.7rem', fontWeight: 700, letterSpacing: '.18em', textTransform: 'uppercase', color: onDark ? GOLD_LT : GOLD_INK, textAlign: center ? 'center' : 'left' }}>{children}</div>
}

/* ── The book — a premium aubergine + gold CSS 3D mockup ───────────────────── */
function BookMockup({ w = 'min(300px, 70vw)' }: { w?: string }) {
  return (
    <div style={{ perspective: 1700, display: 'flex', justifyContent: 'center' }}>
      <div className="ka-book ka-float" style={{ position: 'relative', width: w, aspectRatio: '3 / 4.2', transformStyle: 'preserve-3d', transform: 'rotateY(-24deg) rotateX(6deg)' }}>
        <div style={{ position: 'absolute', top: 8, right: -15, width: 19, height: 'calc(100% - 16px)', background: 'linear-gradient(90deg,#efe7d6,#cfc4ad)', transform: 'rotateY(90deg) translateZ(9.5px)', transformOrigin: 'right', borderRadius: 2 }} />
        <div style={{ position: 'absolute', inset: 0, borderRadius: '3px 8px 8px 3px', background: `linear-gradient(160deg, ${PLUM} 0%, ${PLUM_DK} 58%, ${PLUM_DEEP} 100%)`, boxShadow: `0 40px 80px rgba(20,8,24,.5), inset 0 0 0 1px ${GOLD_LINE}`, padding: '34px 28px', display: 'flex', flexDirection: 'column', color: CREAM, overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, width: 11, height: '100%', background: 'linear-gradient(90deg, rgba(255,255,255,.18), rgba(255,255,255,0))' }} />
          <div style={{ position: 'absolute', inset: 14, border: `1px solid ${GOLD_LINE}`, borderRadius: 3, pointerEvents: 'none' }} />
          <div style={{ fontFamily: SANS, fontSize: 10, fontWeight: 700, letterSpacing: '.26em', color: GOLD_LT, textTransform: 'uppercase' }}>The 10K Roadmap Series</div>
          <div style={{ height: 1, background: `linear-gradient(90deg, ${GOLD}, transparent)`, margin: '16px 0 auto', width: '46%' }} />
          <h3 style={{ fontFamily: SERIF, fontWeight: 600, fontSize: 'clamp(30px, 8vw, 44px)', lineHeight: 0.98, letterSpacing: '-.02em', margin: 0 }}>
            THE<br />KNOWLEDGE<br /><em style={{ fontStyle: 'italic', fontWeight: 500, color: GOLD_LT }}>ASSET</em>
          </h3>
          <p style={{ fontFamily: SANS, fontSize: 11.5, lineHeight: 1.5, color: 'rgba(246,239,227,.82)', marginTop: 18, fontWeight: 300 }}>Turn What You Know Into a $10K-a-Month Digital Business</p>
          <div style={{ marginTop: 'auto', paddingTop: 18, borderTop: `1px solid ${GOLD_LINE}`, fontFamily: SANS, fontSize: 10, letterSpacing: '.08em', color: 'rgba(246,239,227,.9)', textTransform: 'uppercase' }}>
            Indrodip Ghosh <span style={{ color: GOLD_LT }}>&amp;</span> Christinee Mathison
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Author avatar with graceful fallback (photo → initials medallion) ─────── */
function Avatar({ src, initials, name, size = 96 }: { src: string; initials: string; name: string; size?: number }) {
  const [err, setErr] = useState(false)
  if (err) {
    return (
      <div aria-label={name} style={{ width: size, height: size, borderRadius: '50%', background: `linear-gradient(160deg,${PARCH_MID},${PARCH_DEEP})`, border: `2px solid ${GOLD_LINE}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: SERIF, fontSize: size * 0.32, color: PLUM, fontWeight: 600, flexShrink: 0, boxShadow: '0 10px 30px rgba(61,38,69,.14)' }}>{initials}</div>
    )
  }
  return <img src={src} alt={name} loading="lazy" onError={() => setErr(true)} style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', border: `2px solid ${GOLD_LINE}`, flexShrink: 0, boxShadow: '0 10px 30px rgba(61,38,69,.16)' }} />
}

/* ── FAQ accordion item ───────────────────────────────────────────────────── */
function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ borderBottom: `1px solid ${BORDER}` }}>
      <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, background: 'none', border: 'none', cursor: 'pointer', padding: '1.4rem .25rem', textAlign: 'left', fontFamily: SANS, minHeight: 48 }}>
        <span style={{ fontFamily: SERIF, fontSize: 'clamp(1.25rem,2.4vw,1.6rem)', fontWeight: 600, color: INK, lineHeight: 1.15 }}>{q}</span>
        <span aria-hidden style={{ flexShrink: 0, width: 28, height: 28, borderRadius: '50%', border: `1px solid ${GOLD_LINE}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: GOLD_INK, transform: open ? 'rotate(45deg)' : 'none', transition: 'transform .25s ease', fontSize: 22, lineHeight: 1 }}>+</span>
      </button>
      <div style={{ maxHeight: open ? 340 : 0, overflow: 'hidden', transition: 'max-height .32s ease' }}>
        <p style={{ fontFamily: SANS, fontSize: '1.05rem', lineHeight: 1.7, color: INK_MID, padding: '0 .25rem 1.5rem', maxWidth: 720 }}>{a}</p>
      </div>
    </div>
  )
}

/* ── Whop embedded checkout (skeleton + hosted fallback) ───────────────────── */
function CheckoutEmbed({ planId, minHeight = 130 }: { planId: string; minHeight?: number }) {
  const embedRef = useRef<HTMLDivElement | null>(null)
  const [mounted, setMounted] = useState(false)
  const [slow, setSlow] = useState(false)
  const redirectUrl = 'https://the5th.consulting/workbook/success'
  const hostedUrl = `https://whop.com/checkout/${planId}`
  useEffect(() => {
    const SRC = 'https://js.whop.com/static/checkout/loader.js'
    if (!document.querySelector(`script[src="${SRC}"]`)) { const s = document.createElement('script'); s.src = SRC; s.async = true; document.body.appendChild(s) }
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
    <div style={{ position: 'relative', minHeight }}>
      <div ref={embedRef} data-whop-checkout-plan-id={planId} data-whop-checkout-theme="light" data-whop-checkout-redirect-url={redirectUrl} style={{ width: '100%', minHeight, overflow: 'hidden' }} />
      {!mounted && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, background: WHITE, borderRadius: 10, padding: 16 }}>
          {!slow ? (
            <><div style={{ width: 26, height: 26, borderRadius: '50%', border: '3px solid #eee', borderTopColor: GOLD, animation: 'ka-spin .8s linear infinite' }} /><p style={{ fontFamily: SANS, fontSize: 13, color: INK_MUTE, margin: 0 }}>Loading secure checkout…</p></>
          ) : (
            <><p style={{ fontFamily: SANS, fontSize: 13.5, color: INK, margin: 0, textAlign: 'center', fontWeight: 600 }}>Checkout is taking a moment.</p>
              <a href={hostedUrl} target="_top" style={{ display: 'inline-flex', minHeight: 52, alignItems: 'center', background: `linear-gradient(180deg,${GOLD_LT},${GOLD_DK})`, color: PLUM_DK, fontFamily: SANS, fontWeight: 700, fontSize: 15, padding: '.85rem 1.7rem', borderRadius: 6, textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '.08em' }}>Get instant access — {PRICE} →</a>
              <p style={{ fontFamily: SANS, fontSize: 11.5, color: INK_MUTE, margin: 0, textAlign: 'center' }}>Opens Whop&apos;s secure checkout.</p></>
          )}
        </div>
      )}
    </div>
  )
}

/* ── Checkout card (book + price + includes + embed + guarantee) ───────────── */
function CheckoutCard({ planId, compact = false }: { planId: string; compact?: boolean }) {
  return (
    <div style={{ background: `linear-gradient(180deg,${WHITE},${PARCH})`, border: `1px solid ${BORDER}`, borderRadius: 16, boxShadow: '0 30px 70px rgba(61,38,69,.16)', padding: compact ? '1.6rem 1.5rem' : '1.9rem 1.7rem', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg,transparent,${GOLD},transparent)` }} />
      <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
        <div style={{ width: 58, height: 76, borderRadius: 3, background: `linear-gradient(160deg,${PLUM},${PLUM_DEEP})`, boxShadow: `inset 0 0 0 1px ${GOLD_LINE}`, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 4 }}>
          <span style={{ fontFamily: SERIF, fontSize: 9.5, color: GOLD_LT, textAlign: 'center', lineHeight: 1.05, fontWeight: 600 }}>THE<br />KNOWLEDGE<br />ASSET</span>
        </div>
        <div>
          <Eyebrow>Digital Workbook</Eyebrow>
          <div style={{ fontFamily: SERIF, fontSize: '1.5rem', fontWeight: 600, color: INK, lineHeight: 1.05, marginTop: 3 }}>The Knowledge Asset</div>
          <div style={{ fontFamily: SANS, fontSize: 12.5, color: INK_MUTE, marginTop: 3 }}>Instant access + 4 bonuses</div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, margin: '1.1rem 0 .2rem' }}>
        <span style={{ fontFamily: SERIF, fontSize: '3.4rem', fontWeight: 600, color: PLUM_DK, lineHeight: 1 }}>{PRICE}</span>
        <span style={{ fontFamily: SANS, fontSize: 13, color: INK_MUTE }}>one-time · lifetime access</span>
      </div>

      <div style={{ display: 'grid', gap: 7, margin: '.9rem 0 1.1rem', paddingTop: '.9rem', borderTop: `1px solid ${BORDER}` }}>
        {['The Knowledge Asset — 9 chapters', '7-Day Free trial of The5th AI', '90-Day Content Calendar', 'Product Blueprint + Offer Stack tools'].map((t) => (
          <div key={t} style={{ display: 'flex', gap: 10, fontFamily: SANS, fontSize: 13.5, color: INK_MID }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={GOLD_INK} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 2 }} aria-hidden><polyline points="20 6 9 17 4 12" /></svg>{t}
          </div>
        ))}
      </div>

      <CheckoutEmbed planId={planId} />

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px 14px', justifyContent: 'center', marginTop: 12, fontFamily: SANS, fontSize: 11.5, color: INK_MUTE }}>
        <span>🔒 Secure checkout</span><span>·</span><span>365-day guarantee</span><span>·</span><span>Instant access</span>
      </div>
    </div>
  )
}

/* ── Data ─────────────────────────────────────────────────────────────────── */
const BUILD_STEPS = [
  ['01', 'Find Your Why', 'Get clear on why building an asset matters and what you are actually trying to create.'],
  ['02', 'Diagnose Your Situation', 'Understand where your business is today and what needs to change.'],
  ['03', 'Build the Asset Mindset', 'Stop thinking only in hours and availability. Start thinking in assets, leverage, and repeatable value.'],
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
const LADDER = [['$7', 'Ebook'], ['$27', 'Mini-Course'], ['$47', 'Toolkit'], ['$10', 'Strategy Call'], ['$1K–$5K', 'Coaching']]
const BONUSES = [
  ['7-Day Free Trial of The5th AI', 'Full access to The5th AI — your AI business co-pilot — free for 7 days. It works through the book with you: shaping your product, writing your offer, and drafting your content, live as you go.', 'Flagship bonus'],
  ['The 90-Day Content Calendar', '90 daily content topics, pre-planned phase-by-phase, so you never have to stare at a blank screen wondering what to post.', 'Bonus'],
  ['The Product Blueprint Template', 'A one-page product planning template designed to help you turn your expertise into a concrete digital product.', 'Bonus'],
  ['The Offer Stack Builder', 'A fill-in-the-blank document designed to help you build your complete offer description in under 30 minutes.', 'Bonus'],
]
const FOR_YOU = ['You are a coach, consultant, healer, creator, expert, or service provider.', 'You know you have valuable knowledge but do not know how to package it.', 'You are tired of trading your time for money.', 'You want to create a digital product.', 'You do not know exactly what to sell.', 'You are unsure who your ideal customer is.', 'You are posting content but not seeing a clear path to sales.', 'You want to build toward $10K/month.', 'You want a practical roadmap instead of another theory-heavy book.', 'You are willing to actually do the work.']
const NOT_FOR_YOU = ['You want guaranteed income without execution.', 'You want someone else to build the business for you.', 'You are looking for overnight riches.', 'You have no intention of implementing what you learn.']
const OFFER_INCLUDES = ['The Knowledge Asset — 9 practical chapters', 'Interactive exercises + product worksheets', 'Offer-building framework', 'Organic content system', 'A practical launch plan', 'The $7 → $10K product ladder', 'Mindset for consistent $10K months']
const FAQS = [
  ['Is this a regular business book?', 'No. It is designed as a practical workbook. You are meant to work through the exercises and make decisions as you go.'],
  ['Who is this for?', 'Coaches, consultants, healers, creators, service providers, and experts who want to turn their knowledge into a digital business.'],
  ['Do I need a large audience?', 'No large audience is required to begin. The book focuses on clarity, product creation, positioning, organic content, and a simple launch process.'],
  ['Do I need paid ads?', 'The roadmap emphasizes organic content and a simple launch rather than requiring paid advertising.'],
  ['Do I need a team?', 'No. The book is specifically designed around building a simple digital product business without requiring a large team.'],
  ['What is the 7-day The5th AI trial?', 'Your purchase includes 7 days of free access to The5th AI, our AI business co-pilot. You can cancel any time within the trial. It helps you apply the book — building your product, offer, and content as you read.'],
  ['How much does it cost?', '$7.93 one time.'],
  ['Is there a guarantee?', 'Yes. The purchase comes with a 365-day money-back guarantee, subject to the published refund terms.'],
  ['Will this guarantee that I make $10,000/month?', 'No. The $10K/month figure is the business-building target and roadmap. Results depend on execution, market, offer, audience, consistency, and many factors outside the authors’ control.'],
]

/* ── Section shell ────────────────────────────────────────────────────────── */
function Section({ id, bg = PARCH, color, children, style }: { id?: string; bg?: string; color?: string; children: ReactNode; style?: CSSProperties }) {
  return (
    <section id={id} style={{ background: bg, color: color || INK, padding: 'clamp(64px, 9vw, 120px) 1.25rem', ...style }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>{children}</div>
    </section>
  )
}
const H2: CSSProperties = { fontFamily: SERIF, fontWeight: 600, fontSize: 'clamp(2.25rem, 4.5vw, 3.75rem)', lineHeight: 1.02, letterSpacing: '-.03em', margin: 0 }
const emItal: CSSProperties = { fontStyle: 'italic', fontWeight: 300, color: PLUM }
const emGold: CSSProperties = { fontStyle: 'italic', fontWeight: 400, color: GOLD_INK }

/* ═══════════════════════════════════════════════════════════════════════════ */
export default function Workbook({ planId }: { planId: string }) {
  const NAV: [string, string][] = [['What You’ll Build', '#build'], ['Inside The Book', '#inside'], ['Bonuses', '#bonuses'], ['Authors', '#authors'], ['FAQ', '#faq']]

  return (
    <div style={{ fontFamily: SANS, color: INK, background: PARCH, overflowX: 'hidden' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400;1,500;1,600&family=DM+Sans:wght@300;400;500;600;700&display=swap');
        html{scroll-behavior:smooth}
        .ka-cta{transition:transform .18s ease, box-shadow .18s ease, background .18s ease}
        .ka-cta:hover{transform:translateY(-2px); box-shadow:0 12px 30px rgba(201,168,76,0.42), inset 0 1px 0 rgba(255,255,255,0.6)}
        @keyframes ka-spin{to{transform:rotate(360deg)}}
        @keyframes ka-float{0%,100%{transform:rotateY(-24deg) rotateX(6deg) translateY(0)}50%{transform:rotateY(-21deg) rotateX(6deg) translateY(-12px)}}
        .ka-float{animation:ka-float 6.5s ease-in-out infinite}
        .ka-hero-grid{display:grid;grid-template-columns:1.02fr .98fr;gap:clamp(32px,5vw,64px);align-items:center}
        .ka-2col{display:grid;grid-template-columns:1fr 1fr;gap:28px}
        .ka-3col{display:grid;grid-template-columns:repeat(3,1fr);gap:20px}
        .ka-4col{display:grid;grid-template-columns:repeat(4,1fr);gap:18px}
        .ka-timeline{display:grid;grid-template-columns:repeat(7,1fr);gap:14px}
        .ka-nav-links{display:flex;gap:.5rem;align-items:center}
        .ka-ladder{display:flex;align-items:flex-end;justify-content:center;flex-wrap:wrap}
        .ka-sticky-cta{display:none}
        .ka-guarantee-grid{display:grid;grid-template-columns:.9fr 1.1fr;gap:clamp(32px,5vw,72px);align-items:center}
        @media(max-width:1000px){
          .ka-hero-grid{grid-template-columns:1fr;gap:40px}
          .ka-4col{grid-template-columns:1fr 1fr}
          .ka-timeline{grid-template-columns:1fr}
          .ka-3col{grid-template-columns:1fr}
          .ka-nav-links{display:none}
          .ka-guarantee-grid{grid-template-columns:1fr;gap:36px;text-align:center}
        }
        @media(max-width:760px){
          .ka-2col{grid-template-columns:1fr}
          .ka-4col{grid-template-columns:1fr}
          .ka-sticky-cta{display:flex}
          .ka-float{animation:none}
        }
        @media(prefers-reduced-motion:reduce){.ka-float,.ka-cta{animation:none;transition:none}}
      `}</style>

      {/* Announcement bar */}
      <div style={{ background: `linear-gradient(90deg,${PLUM_DEEP},${PLUM_DK},${PLUM_DEEP})`, color: CREAM, textAlign: 'center', fontFamily: SANS, fontSize: 11.5, fontWeight: 600, letterSpacing: '.14em', padding: '.6rem 1rem', textTransform: 'uppercase', borderBottom: `1px solid ${GOLD_LINE}` }}>
        The Knowledge Asset <span style={{ color: GOLD_LT }}>•</span> Now {PRICE} <span style={{ color: GOLD_LT }}>•</span> Includes 7-Day Free The5th AI <span style={{ color: GOLD_LT }}>•</span> 365-Day Guarantee
      </div>

      {/* Nav */}
      <header style={{ position: 'sticky', top: 0, zIndex: 40, background: `linear-gradient(180deg,${PLUM_DK},${PLUM_DEEP})`, borderBottom: `1px solid ${GOLD_LINE}` }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '.85rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          <a href="#top" style={{ fontFamily: SERIF, fontWeight: 600, fontSize: '1.35rem', color: CREAM, textDecoration: 'none', letterSpacing: '-.01em' }}>The Knowledge <em style={{ fontStyle: 'italic', color: GOLD_LT }}>Asset</em></a>
          <nav className="ka-nav-links" aria-label="Sections">
            {NAV.map(([l, h]) => <a key={h} href={h} style={{ fontSize: '.72rem', fontWeight: 500, letterSpacing: '.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,.8)', textDecoration: 'none', padding: '0 1em' }}>{l}</a>)}
            <CTA label={`Get the Book`} href="#buy" size="md" style={{ marginLeft: '.5rem' }} />
          </nav>
        </div>
      </header>

      {/* 2 — Hero (two-sided, checkout embedded) */}
      <div id="top" />
      <section style={{ background: `linear-gradient(180deg,${PLUM_DK} 0%,${PLUM_DEEP} 100%)`, color: CREAM, padding: 'clamp(48px,6vw,88px) 1.25rem clamp(56px,7vw,96px)', position: 'relative' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: `linear-gradient(90deg,transparent,${GOLD_LINE},transparent)` }} />
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div className="ka-hero-grid">
            {/* Left — copy */}
            <div>
              <Eyebrow onDark>The 10K Roadmap Series</Eyebrow>
              <h1 style={{ fontFamily: SERIF, fontWeight: 600, fontSize: 'clamp(3rem, 7vw, 6rem)', lineHeight: 0.96, letterSpacing: '-.03em', margin: '1rem 0 0', color: CREAM }}>
                The Knowledge <em style={{ fontStyle: 'italic', fontWeight: 500, color: GOLD_LT }}>Asset</em>
              </h1>
              <p style={{ fontFamily: SERIF, fontSize: 'clamp(1.35rem,2.6vw,1.9rem)', fontWeight: 300, fontStyle: 'italic', color: 'rgba(246,239,227,.92)', marginTop: '1.1rem', maxWidth: 520, lineHeight: 1.3 }}>
                Turn What You Know Into a $10K-a-Month Digital Business.
              </p>
              <p style={{ fontFamily: SANS, fontSize: '1.05rem', fontWeight: 300, color: 'rgba(246,239,227,.78)', marginTop: '1.1rem', maxWidth: 500, lineHeight: 1.7 }}>
                A practical, build-as-you-go workbook for coaches, consultants, healers, creators, and experts ready to stop trading time for money — and start turning knowledge into an asset.
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.6rem 1.4rem', marginTop: '1.6rem' }}>
                {['Practical workbook', 'Step-by-step exercises', '4 bonuses included', '365-day guarantee'].map((t) => (
                  <span key={t} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontFamily: SANS, fontSize: 13.5, fontWeight: 400, color: 'rgba(246,239,227,.9)' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={GOLD_LT} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden><polyline points="20 6 9 17 4 12" /></svg>{t}
                  </span>
                ))}
              </div>
              {/* Author byline */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: '2rem', paddingTop: '1.4rem', borderTop: `1px solid ${GOLD_LINE}` }}>
                <div style={{ display: 'flex' }}>
                  <Avatar src="/images/founder.png" initials="IG" name="Indrodip Ghosh" size={48} />
                  <div style={{ marginLeft: -14 }}><Avatar src="/images/christinee.png" initials="CM" name="Christinee Mathison" size={48} /></div>
                </div>
                <div style={{ fontFamily: SANS, fontSize: 13, color: 'rgba(246,239,227,.82)', lineHeight: 1.4 }}>
                  <div style={{ color: GOLD_LT, fontSize: 11, letterSpacing: '.12em', textTransform: 'uppercase', fontWeight: 600 }}>Written by</div>
                  Indrodip Ghosh &amp; Christinee Mathison
                </div>
              </div>
            </div>

            {/* Right — the live checkout */}
            <div id="buy" style={{ scrollMarginTop: 90 }}>
              <div style={{ textAlign: 'center', marginBottom: '.9rem' }}>
                <span style={{ display: 'inline-block', fontFamily: SANS, fontSize: 11, fontWeight: 700, letterSpacing: '.16em', textTransform: 'uppercase', color: PLUM_DK, background: `linear-gradient(180deg,${GOLD_LT},${GOLD})`, borderRadius: 999, padding: '.4rem 1rem', boxShadow: '0 6px 18px rgba(201,168,76,.3)' }}>
                  Read it. Do the work. Build the business.
                </span>
              </div>
              <CheckoutCard planId={planId} />
            </div>
          </div>
        </div>
      </section>

      {/* 3 — Problem */}
      <Section bg={PARCH} id="problem">
        <Reveal>
          <Eyebrow>Read less. Build more.</Eyebrow>
          <h2 style={{ ...H2, marginTop: '.8rem', maxWidth: 940 }}>You don&apos;t need another business book. <em style={emGold}>You need to build.</em></h2>
          <div style={{ display: 'grid', gap: 16, marginTop: '1.6rem', maxWidth: 720, fontFamily: SANS, fontSize: '1.125rem', lineHeight: 1.75, color: INK_MID }}>
            <p>You&apos;ve probably consumed enough advice. You&apos;ve saved posts. Watched videos. Bought courses. Taken notes. Made plans.</p>
            <p>But information isn&apos;t the problem. <strong style={{ color: INK, fontWeight: 600 }}>Execution is.</strong></p>
            <p>And if your income still depends on you being present for every client, every call, every hour and every dollar — you haven&apos;t built an asset yet. You&apos;ve built yourself another job.</p>
            <p style={{ fontFamily: SERIF, fontSize: '1.6rem', fontStyle: 'italic', fontWeight: 400, color: PLUM }}>The Knowledge Asset changes that.</p>
            <p>It gives you a practical roadmap for turning what you already know into something you can package, sell, improve, and build upon.</p>
          </div>
        </Reveal>
        <Reveal delay={80} style={{ marginTop: '2.8rem' }}>
          <div className="ka-2col">
            <div style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 14, padding: '1.8rem 1.6rem' }}>
              <Eyebrow>Trading time for money</Eyebrow>
              <ul style={{ listStyle: 'none', margin: '1rem 0 0', display: 'grid', gap: 12 }}>
                {['Your income depends on your time.', 'Every client requires you.', 'You start from zero every month.', 'You constantly sell your availability.'].map((t) => (
                  <li key={t} style={{ display: 'flex', gap: 12, fontFamily: SANS, fontSize: '1rem', color: INK_MID }}><span style={{ color: '#b06a52' }}>✕</span>{t}</li>
                ))}
              </ul>
            </div>
            <div style={{ background: `linear-gradient(180deg,${PLUM},${PLUM_DK})`, border: `1px solid ${GOLD_LINE}`, borderRadius: 14, padding: '1.8rem 1.6rem', color: CREAM }}>
              <Eyebrow onDark>Building a knowledge asset</Eyebrow>
              <ul style={{ listStyle: 'none', margin: '1rem 0 0', display: 'grid', gap: 12 }}>
                {['Create once.', 'Sell repeatedly.', 'Build a product ladder.', 'Create leverage.', 'Build an asset around your expertise.'].map((t) => (
                  <li key={t} style={{ display: 'flex', gap: 12, fontFamily: SANS, fontSize: '1rem', color: 'rgba(246,239,227,.94)' }}><span style={{ color: GOLD_LT }}>✓</span>{t}</li>
                ))}
              </ul>
            </div>
          </div>
        </Reveal>
      </Section>

      {/* 4 — Core promise */}
      <Section bg={PARCH_MID}>
        <Reveal style={{ textAlign: 'center', maxWidth: 780, margin: '0 auto' }}>
          <Eyebrow center>From expertise to asset</Eyebrow>
          <h2 style={{ ...H2, marginTop: '.9rem' }}>What if your knowledge could become <em style={emItal}>an asset?</em></h2>
          <p style={{ fontFamily: SANS, fontSize: '1.125rem', lineHeight: 1.8, color: INK_MID, marginTop: '1.4rem' }}>
            You already know things other people are trying to figure out. You&apos;ve solved problems. Learned lessons. Developed skills. Made mistakes. Discovered systems. Lived through transformations.
          </p>
          <p style={{ fontFamily: SERIF, fontSize: 'clamp(1.4rem,3vw,2rem)', color: INK, marginTop: '1.6rem', lineHeight: 1.35 }}>
            The question isn&apos;t <span style={{ color: INK_MUTE, fontStyle: 'italic' }}>&ldquo;Do I know enough?&rdquo;</span><br />It&apos;s <em style={emGold}>&ldquo;How do I package what I know so someone can buy it?&rdquo;</em>
          </p>
          <p style={{ fontFamily: SANS, fontSize: '1rem', color: INK_MUTE, marginTop: '1.1rem' }}>The book helps answer that question.</p>
        </Reveal>
      </Section>

      {/* 5 — What you'll build */}
      <Section bg={WHITE} id="build">
        <Reveal>
          <Eyebrow>What you&apos;ll build</Eyebrow>
          <h2 style={{ ...H2, marginTop: '.8rem' }}>Don&apos;t just read the book. <em style={emGold}>Build your business inside it.</em></h2>
          <p style={{ fontFamily: SANS, fontSize: '1.125rem', color: INK_MID, marginTop: '1rem', maxWidth: 620 }}>Every major section moves you from thinking to doing.</p>
        </Reveal>
        <Reveal delay={80} style={{ marginTop: '2.6rem' }}>
          <div className="ka-timeline">
            {BUILD_STEPS.map(([n, t, d]) => (
              <div key={n} style={{ borderTop: `2px solid ${GOLD_SOFT}`, paddingTop: 18, position: 'relative' }}>
                <span style={{ position: 'absolute', top: -9, left: 0, width: 16, height: 16, borderRadius: '50%', background: GOLD, boxShadow: `0 0 0 4px ${WHITE}` }} />
                <div style={{ fontFamily: SERIF, fontSize: '1.9rem', fontWeight: 600, color: GOLD_INK }}>{n}</div>
                <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 15, color: INK, marginTop: 6, lineHeight: 1.25 }}>{t}</div>
                <p style={{ fontFamily: SANS, fontSize: 13, color: INK_MUTE, marginTop: 8, lineHeight: 1.55 }}>{d as string}</p>
              </div>
            ))}
          </div>
        </Reveal>
        <Reveal delay={120} style={{ marginTop: '2.6rem', textAlign: 'center' }}><CTA label={`Start Building — ${PRICE}`} /></Reveal>
      </Section>

      {/* 6 — What's inside */}
      <Section bg={PARCH} id="inside">
        <Reveal>
          <Eyebrow>What&apos;s inside</Eyebrow>
          <h2 style={{ ...H2, marginTop: '.8rem' }}>Nine chapters. <em style={emItal}>One practical roadmap.</em></h2>
        </Reveal>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16, marginTop: '2.4rem' }}>
          {CHAPTERS.map(([t, d], i) => (
            <Reveal key={t} delay={i * 40}>
              <div style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 12, padding: '1.5rem 1.4rem', height: '100%' }}>
                <div style={{ fontFamily: SANS, fontSize: 11, fontWeight: 700, letterSpacing: '.14em', color: GOLD_INK }}>CHAPTER {i + 1}</div>
                <div style={{ fontFamily: SERIF, fontSize: '1.4rem', fontWeight: 600, color: INK, marginTop: 8, lineHeight: 1.15 }}>{t}</div>
                <p style={{ fontFamily: SANS, fontSize: 14, color: INK_MUTE, marginTop: 8, lineHeight: 1.55 }}>{d}</p>
              </div>
            </Reveal>
          ))}
        </div>
        <Reveal delay={120} style={{ marginTop: '1.4rem' }}>
          <div style={{ background: `linear-gradient(180deg,${PLUM},${PLUM_DK})`, color: CREAM, borderRadius: 12, padding: '1.6rem 1.7rem', border: `1px solid ${GOLD_LINE}` }}>
            <div style={{ fontFamily: SANS, fontSize: 11, fontWeight: 700, letterSpacing: '.14em', color: GOLD_LT }}>PLUS</div>
            <div style={{ fontFamily: SERIF, fontSize: '1.6rem', fontWeight: 600, marginTop: 4 }}>Your Next 24 Hours</div>
            <p style={{ fontFamily: SANS, fontSize: 14.5, fontWeight: 300, color: 'rgba(246,239,227,.82)', marginTop: 4, maxWidth: 640 }}>A practical, action-focused conclusion designed to get you moving immediately.</p>
          </div>
        </Reveal>
      </Section>

      {/* 7 — Workbook experience */}
      <Section bg={WHITE}>
        <div className="ka-2col" style={{ alignItems: 'center', gap: 'clamp(32px,5vw,56px)' }}>
          <Reveal>
            <Eyebrow>Build it as you read it</Eyebrow>
            <h2 style={{ ...H2, marginTop: '.8rem' }}>This is not a book you finish. <em style={emGold}>It&apos;s a business you build.</em></h2>
            <p style={{ fontFamily: SANS, fontSize: '1.1rem', color: INK_MID, marginTop: '1.2rem', lineHeight: 1.75, maxWidth: 520 }}>
              Each chapter is designed to move you forward. You&apos;ll answer questions. Make decisions. Choose your audience. Develop your product. Shape your offer. Plan your content. Set your launch. Commit to the next action.
            </p>
            <p style={{ fontFamily: SERIF, fontSize: '1.4rem', color: INK, marginTop: '1rem', fontStyle: 'italic' }}>The goal isn&apos;t to highlight every page. The goal is to finish with something real.</p>
          </Reveal>
          <Reveal delay={100}>
            <div style={{ display: 'grid', gap: 12 }}>
              {WORKBOOK_PAGES.map((p, i) => (
                <div key={p} style={{ display: 'flex', alignItems: 'center', gap: 16, background: PARCH, border: `1px solid ${BORDER}`, borderLeft: `3px solid ${GOLD}`, borderRadius: 10, padding: '1rem 1.1rem' }}>
                  <span style={{ fontFamily: SERIF, fontSize: 16, color: GOLD_INK, fontWeight: 600, width: 24 }}>{String(i + 1).padStart(2, '0')}</span>
                  <span style={{ fontFamily: SANS, fontSize: 15.5, fontWeight: 500, color: INK }}>{p}</span>
                  <span style={{ marginLeft: 'auto', fontFamily: SERIF, fontSize: 14, color: INK_MUTE, fontStyle: 'italic' }}>your answer →</span>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </Section>

      {/* 8 — The $7 → $10K ladder */}
      <Section bg={PARCH_MID}>
        <Reveal style={{ textAlign: 'center', maxWidth: 780, margin: '0 auto' }}>
          <Eyebrow center>The product ladder</Eyebrow>
          <h2 style={{ ...H2, marginTop: '.8rem' }}>See the path from your first sale <em style={emItal}>to $10K months.</em></h2>
          <p style={{ fontFamily: SANS, fontSize: '1.1rem', color: INK_MID, marginTop: '1.1rem', lineHeight: 1.7 }}>You don&apos;t need one giant offer. You can build a connected product ladder around the same person.</p>
        </Reveal>
        <Reveal delay={100} style={{ marginTop: '2.8rem' }}>
          <div className="ka-ladder">
            {LADDER.map(([price, label], i) => (
              <div key={label} style={{ display: 'flex', alignItems: 'flex-end' }}>
                <div style={{ textAlign: 'center', background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 10, padding: '1.1rem 1.2rem', minWidth: 118, marginBottom: i * 8, boxShadow: '0 10px 28px rgba(61,38,69,.08)' }}>
                  <div style={{ fontFamily: SERIF, fontSize: 'clamp(1.5rem,3vw,2rem)', fontWeight: 600, color: i === LADDER.length - 1 ? GOLD_INK : INK }}>{price}</div>
                  <div style={{ fontFamily: SANS, fontSize: 11, fontWeight: 600, letterSpacing: '.1em', textTransform: 'uppercase', color: INK_MUTE, marginTop: 4 }}>{label}</div>
                </div>
                {i < LADDER.length - 1 && <span aria-hidden style={{ color: GOLD, fontSize: 22, margin: '0 4px 22px' }}>↗</span>}
              </div>
            ))}
          </div>
        </Reveal>
        <Reveal delay={140} style={{ textAlign: 'center', maxWidth: 640, margin: '2.4rem auto 0' }}>
          <p style={{ fontFamily: SERIF, fontSize: '1.5rem', fontStyle: 'italic', color: PLUM, lineHeight: 1.4 }}>Start small. Prove demand. Go deeper. Increase value. Build leverage.</p>
          <p style={{ fontFamily: SANS, fontSize: '1rem', color: INK_MID, marginTop: '.9rem' }}>This is not about creating ten products overnight. It&apos;s about how one piece of expertise can become the foundation of an entire business.</p>
        </Reveal>
      </Section>

      {/* 9 — Real client story */}
      <Section bg={PLUM_DK} color={CREAM}>
        <Reveal style={{ maxWidth: 840, margin: '0 auto', textAlign: 'center' }}>
          <Eyebrow center onDark>Real client story</Eyebrow>
          <h2 style={{ ...H2, marginTop: '.9rem', color: CREAM }}>What happens when expertise <em style={{ fontStyle: 'italic', fontWeight: 400, color: GOLD_LT }}>becomes an asset?</em></h2>
          <blockquote style={{ fontFamily: SERIF, fontSize: 'clamp(1.5rem,3vw,2.2rem)', fontWeight: 300, fontStyle: 'italic', lineHeight: 1.4, color: CREAM, margin: '2rem auto 0', maxWidth: 720, borderLeft: `2px solid ${GOLD}`, paddingLeft: 26, textAlign: 'left' }}>
            A nutritional consultant had spent 12 years giving the same advice one-on-one to private clients. We packaged her method into a $47 digital toolkit. In its first month, it made more than two of her consulting clients combined — without a single additional coaching call.
          </blockquote>
          <div style={{ marginTop: '1.5rem', fontFamily: SANS, fontSize: 11, fontWeight: 700, letterSpacing: '.18em', textTransform: 'uppercase', color: GOLD_LT }}>Real client story from the book</div>
        </Reveal>
      </Section>

      {/* 10 — Testimonials (placeholders, not fabricated) */}
      <Section bg={PARCH}>
        <Reveal>
          <Eyebrow>What readers are saying</Eyebrow>
          <h2 style={{ ...H2, marginTop: '.8rem' }}>What readers <em style={emItal}>are saying.</em></h2>
          <p style={{ fontFamily: SANS, fontSize: '.95rem', color: INK_MUTE, marginTop: '.8rem', maxWidth: 620 }}>Verified reader reviews will be published here as they come in.</p>
        </Reveal>
        <div className="ka-3col" style={{ marginTop: '2.2rem' }}>
          {[0, 1, 2].map((i) => (
            <Reveal key={i} delay={i * 60}>
              <div style={{ background: WHITE, border: `1px dashed ${BORDER}`, borderRadius: 12, padding: '1.6rem 1.5rem', height: '100%' }}>
                <div style={{ fontFamily: SERIF, color: GOLD, fontSize: 34, lineHeight: .6 }}>&ldquo;</div>
                <p style={{ fontFamily: SERIF, fontSize: '1.35rem', fontStyle: 'italic', color: INK_MID, lineHeight: 1.4, marginTop: 8 }}>
                  {i === 0 ? 'The book helped me finally ______.' : 'Add a real customer quote about what changed after working through the book.'}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 20, paddingTop: 16, borderTop: `1px solid ${BORDER}` }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: PARCH_DEEP, border: `1px solid ${BORDER}` }} />
                  <div>
                    <div style={{ fontFamily: SANS, fontSize: 13.5, fontWeight: 600, color: INK_MID }}>[Verified reader name]</div>
                    <div style={{ fontFamily: SANS, fontSize: 12, color: INK_MUTE }}>Role · Location</div>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
        <Reveal delay={120} style={{ marginTop: '1.6rem', textAlign: 'center' }}>
          <span style={{ display: 'inline-block', fontFamily: SANS, fontSize: 13.5, color: INK_MID, background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 999, padding: '.7rem 1.4rem' }}>
            <strong style={{ color: GOLD_INK }}>20+ clients</strong> guided to their first $10K months — from Indrodip&apos;s client work.
          </span>
        </Reveal>
      </Section>

      {/* 11 — Bonuses (4, AI flagship) */}
      <Section bg={WHITE} id="bonuses">
        <Reveal>
          <Eyebrow>Included with the book</Eyebrow>
          <h2 style={{ ...H2, marginTop: '.8rem' }}>Buy the book. <em style={emGold}>Get the building tools too.</em></h2>
          <p style={{ fontFamily: SANS, fontSize: '1.1rem', color: INK_MID, marginTop: '1rem' }}>Your {PRICE} purchase includes four practical bonuses — led by 7 days of The5th AI, free.</p>
        </Reveal>
        <div className="ka-4col" style={{ marginTop: '2.4rem' }}>
          {BONUSES.map(([t, d, tag], i) => {
            const flagship = i === 0
            return (
              <Reveal key={t} delay={i * 60}>
                <div style={{ background: flagship ? `linear-gradient(180deg,${PLUM},${PLUM_DK})` : PARCH, color: flagship ? CREAM : INK, border: flagship ? `1px solid ${GOLD_LINE}` : `1px solid ${BORDER}`, borderRadius: 14, padding: '1.6rem 1.4rem', height: '100%', position: 'relative', overflow: 'hidden' }}>
                  {flagship && <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg,transparent,${GOLD},transparent)` }} />}
                  <span style={{ display: 'inline-block', fontFamily: SANS, fontSize: 10, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: flagship ? PLUM_DK : GOLD_INK, background: flagship ? `linear-gradient(180deg,${GOLD_LT},${GOLD})` : GOLD_SOFT, borderRadius: 999, padding: '.35rem .8rem' }}>{tag}</span>
                  <div style={{ fontFamily: SERIF, fontSize: '1.9rem', fontWeight: 600, color: flagship ? GOLD_LT : GOLD_INK, marginTop: 14 }}>#{i + 1}</div>
                  <div style={{ fontFamily: SERIF, fontSize: '1.35rem', fontWeight: 600, color: flagship ? CREAM : INK, marginTop: 4, lineHeight: 1.15 }}>{t}</div>
                  <p style={{ fontFamily: SANS, fontSize: 13.5, color: flagship ? 'rgba(246,239,227,.8)' : INK_MUTE, marginTop: 10, lineHeight: 1.6 }}>{d}</p>
                </div>
              </Reveal>
            )
          })}
        </div>
        <Reveal delay={140} style={{ marginTop: '2.2rem', textAlign: 'center' }}>
          <p style={{ fontFamily: SERIF, fontSize: 'clamp(1.4rem,2.6vw,1.9rem)', fontStyle: 'italic', color: PLUM, lineHeight: 1.4 }}>Everything you need to stop thinking about your business — and start building it.</p>
        </Reveal>
      </Section>

      {/* 12 — What makes this different */}
      <Section bg={PARCH}>
        <Reveal>
          <Eyebrow>The difference</Eyebrow>
          <h2 style={{ ...H2, marginTop: '.8rem' }}>Most books give you ideas. <em style={emGold}>This one gives you work to do.</em></h2>
        </Reveal>
        <div className="ka-3col" style={{ marginTop: '2.4rem' }}>
          {[
            ['Typical business book', ['Read.', 'Highlight.', 'Put it down.', 'Forget most of it.'], false],
            ['The Knowledge Asset', ['Read.', 'Answer.', 'Build.', 'Launch.', 'Learn.'], true],
            ['The goal', ['A real product.', 'A real offer.', 'A real audience.', 'A real launch plan.'], false],
          ].map(([title, items, hl]) => (
            <Reveal key={title as string}>
              <div style={{ background: hl ? `linear-gradient(180deg,${PLUM},${PLUM_DK})` : WHITE, color: hl ? CREAM : INK, border: hl ? `1px solid ${GOLD_LINE}` : `1px solid ${BORDER}`, borderRadius: 14, padding: '1.7rem 1.5rem', height: '100%' }}>
                <div style={{ fontFamily: SANS, fontSize: 11, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', color: hl ? GOLD_LT : INK_MUTE }}>{title as string}</div>
                <ul style={{ listStyle: 'none', margin: '1rem 0 0', display: 'grid', gap: 10 }}>
                  {(items as string[]).map((it) => (
                    <li key={it} style={{ display: 'flex', gap: 10, fontFamily: SERIF, fontSize: '1.3rem', color: hl ? CREAM : INK_MID }}>
                      <span style={{ color: hl ? GOLD_LT : GOLD_INK }}>{hl ? '✓' : '•'}</span>{it}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* 13 — Authors (with photos) */}
      <Section bg={WHITE} id="authors">
        <Reveal style={{ textAlign: 'center' }}>
          <Eyebrow center>The authors</Eyebrow>
          <h2 style={{ ...H2, marginTop: '.8rem' }}>Two authors. Two strengths. <em style={emItal}>One roadmap.</em></h2>
        </Reveal>
        <div className="ka-2col" style={{ marginTop: '2.6rem' }}>
          {[
            { name: 'Indrodip Ghosh', role: 'Digital Product Strategist · Co-Author', src: '/images/founder.png', initials: 'IG', copy: 'Indrodip brings the strategy and systems side of the book — business mechanics, digital products, scaling, and the market reality of building an online business. His chapters draw from years of building and rebuilding businesses, his experience as a digital product strategist, and the real stories of 20+ clients he has guided toward their first $10K months. He also shares the story behind his own transition from a service business dependent on his time to digital products and coaching.' },
            { name: 'Christinee Mathison', role: 'Mindset Coach · Co-Author', src: '/images/christinee.png', initials: 'CM', copy: 'Christinee brings the transformation and clarity side of the book — audience clarity, offer building, content, mindset, and the inner work required to show up consistently. Her chapters help readers understand who they are building for, package their expertise into an offer, communicate their value, and develop the mindset required for consistent action.' },
          ].map((a, i) => (
            <Reveal key={a.name} delay={i * 90}>
              <div style={{ background: PARCH, border: `1px solid ${BORDER}`, borderRadius: 16, padding: '1.9rem 1.7rem', height: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
                  <Avatar src={a.src} initials={a.initials} name={a.name} size={92} />
                  <div>
                    <div style={{ fontFamily: SERIF, fontSize: '1.6rem', fontWeight: 600, color: INK, lineHeight: 1.05 }}>{a.name}</div>
                    <div style={{ fontFamily: SANS, fontSize: 12.5, color: GOLD_INK, fontWeight: 600, marginTop: 6, letterSpacing: '.04em' }}>{a.role}</div>
                  </div>
                </div>
                <p style={{ fontFamily: SANS, fontSize: 15, color: INK_MID, marginTop: '1.2rem', lineHeight: 1.7 }}>{a.copy}</p>
              </div>
            </Reveal>
          ))}
        </div>
        <Reveal delay={140} style={{ textAlign: 'center', marginTop: '2.2rem' }}>
          <p style={{ fontFamily: SERIF, fontSize: 'clamp(1.4rem,2.4vw,1.8rem)', fontStyle: 'italic', color: PLUM }}>Two voices. One mission. One complete roadmap.</p>
        </Reveal>
      </Section>

      {/* 14 — Authors' story */}
      <Section bg={PARCH_MID}>
        <Reveal>
          <Eyebrow>The story behind it</Eyebrow>
          <h2 style={{ ...H2, marginTop: '.8rem' }}>This book came from real business. <em style={emGold}>Not theory.</em></h2>
        </Reveal>
        <div className="ka-2col" style={{ marginTop: '2.4rem' }}>
          <Reveal>
            <div style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 14, padding: '1.8rem 1.6rem', height: '100%' }}>
              <div style={{ fontFamily: SANS, fontSize: 11, fontWeight: 700, letterSpacing: '.14em', color: GOLD_INK }}>INDRODIP&apos;S STORY</div>
              <p style={{ fontFamily: SANS, fontSize: 15, color: INK_MID, marginTop: 14, lineHeight: 1.75 }}>He didn&apos;t begin with a perfect business plan. He tried different ventures, entered digital marketing, built an agency, worked with international clients, and eventually realized something uncomfortable: a business that requires you for every dollar is still dependent on your time.</p>
              <p style={{ fontFamily: SANS, fontSize: 15, color: INK_MID, marginTop: 12, lineHeight: 1.75 }}>He transitioned toward digital products and coaching, started again from zero clients, and eventually reached his first $10K month without relying on ads or a large team.</p>
              <p style={{ fontFamily: SERIF, fontSize: '1.3rem', fontStyle: 'italic', color: PLUM, marginTop: 14 }}>The lesson: clarity + story + a simple system can create momentum.</p>
            </div>
          </Reveal>
          <Reveal delay={90}>
            <div style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 14, padding: '1.8rem 1.6rem', height: '100%' }}>
              <div style={{ fontFamily: SANS, fontSize: 11, fontWeight: 700, letterSpacing: '.14em', color: GOLD_INK }}>CHRISTINEE&apos;S CONTRIBUTION</div>
              <p style={{ fontFamily: SANS, fontSize: 15, color: INK_MID, marginTop: 14, lineHeight: 1.75 }}>She brings the clarity around audience, offers, content, and the inner game required to consistently show up and sell.</p>
              <p style={{ fontFamily: SANS, fontSize: 15, color: INK_MID, marginTop: 12, lineHeight: 1.75 }}>This book combines those two perspectives.</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 16 }}>
                {['Strategy + transformation', 'Systems + clarity'].map((t) => (
                  <span key={t} style={{ fontFamily: SERIF, fontSize: '1.2rem', fontStyle: 'italic', color: PLUM, background: GOLD_SOFT, borderRadius: 999, padding: '.5rem 1.1rem' }}>{t}</span>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </Section>

      {/* 15 — Who it's for */}
      <Section bg={WHITE}>
        <div className="ka-2col" style={{ gap: 'clamp(32px,5vw,48px)' }}>
          <Reveal>
            <h2 style={{ ...H2 }}>This book is <em style={emItal}>for you</em> if…</h2>
            <ul style={{ listStyle: 'none', margin: '1.6rem 0 0', display: 'grid', gap: 12 }}>
              {FOR_YOU.map((t) => (
                <li key={t} style={{ display: 'flex', gap: 12, fontFamily: SANS, fontSize: '1rem', color: INK_MID, lineHeight: 1.5 }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={GOLD_INK} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 2 }} aria-hidden><polyline points="20 6 9 17 4 12" /></svg>{t}
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal delay={90}>
            <div style={{ background: PARCH, border: `1px solid ${BORDER}`, borderRadius: 16, padding: '1.9rem 1.7rem' }}>
              <h3 style={{ fontFamily: SERIF, fontSize: 'clamp(1.6rem,3vw,2.2rem)', fontWeight: 600, color: INK, margin: 0 }}>It&apos;s <em style={emGold}>not</em> for you if…</h3>
              <ul style={{ listStyle: 'none', margin: '1.4rem 0 0', display: 'grid', gap: 14 }}>
                {NOT_FOR_YOU.map((t) => (
                  <li key={t} style={{ display: 'flex', gap: 12, fontFamily: SANS, fontSize: '1rem', color: INK_MUTE, lineHeight: 1.5 }}>
                    <span style={{ color: '#b06a52', fontWeight: 700, flexShrink: 0 }}>✕</span>{t}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </Section>

      {/* 16 — The offer / value stack */}
      <Section bg={PLUM_DK} color={CREAM} id="offer">
        <Reveal style={{ textAlign: 'center', maxWidth: 720, margin: '0 auto' }}>
          <Eyebrow center onDark>The offer</Eyebrow>
          <h2 style={{ ...H2, marginTop: '.9rem', color: CREAM }}>Your knowledge is already there. <em style={{ fontStyle: 'italic', fontWeight: 400, color: GOLD_LT }}>Now build something with it.</em></h2>
        </Reveal>
        <div className="ka-2col" style={{ marginTop: '3rem', alignItems: 'center', gap: 'clamp(32px,5vw,64px)' }}>
          <Reveal style={{ display: 'flex', justifyContent: 'center' }}><BookMockup w="min(320px,72vw)" /></Reveal>
          <Reveal delay={100} style={{ maxWidth: 560 }}>
            <div style={{ background: `linear-gradient(180deg,${WHITE},${PARCH})`, color: INK, borderRadius: 18, padding: '2.2rem 1.9rem', boxShadow: '0 40px 90px rgba(20,8,24,.5)', border: `1px solid ${GOLD_LINE}`, position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg,transparent,${GOLD},transparent)` }} />
            <div style={{ fontFamily: SERIF, fontSize: '1.9rem', fontWeight: 600, textAlign: 'center' }}>The Knowledge Asset</div>
            <div style={{ textAlign: 'center', fontFamily: SANS, fontSize: 13, color: INK_MUTE, marginTop: 4 }}>Digital Workbook + 4 Bonuses</div>
            <ul style={{ listStyle: 'none', margin: '1.6rem 0 0', display: 'grid', gap: 10 }}>
              {OFFER_INCLUDES.map((t) => (
                <li key={t} style={{ display: 'flex', gap: 11, fontFamily: SANS, fontSize: 15, color: INK_MID }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={GOLD_INK} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 3 }} aria-hidden><polyline points="20 6 9 17 4 12" /></svg>{t}
                </li>
              ))}
            </ul>
            <div style={{ margin: '1.4rem 0', paddingTop: '1.2rem', borderTop: `1px solid ${BORDER}`, display: 'grid', gap: 9 }}>
              {['7-Day Free Trial of The5th AI', '90-Day Content Calendar', 'Product Blueprint Template', 'Offer Stack Builder'].map((t, i) => (
                <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 11, fontFamily: SANS, fontSize: 15, color: INK_MID }}>
                  <span style={{ fontFamily: SANS, fontSize: 9.5, fontWeight: 700, letterSpacing: '.08em', color: PLUM_DK, background: `linear-gradient(180deg,${GOLD_LT},${GOLD})`, borderRadius: 999, padding: '.25rem .6rem' }}>{i === 0 ? 'FREE 7 DAYS' : 'BONUS'}</span>{t}
                </div>
              ))}
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: SERIF, fontSize: '3.6rem', fontWeight: 600, color: PLUM_DK, lineHeight: 1 }}>{PRICE}</div>
              <div style={{ fontFamily: SANS, fontSize: 12.5, color: INK_MUTE, marginTop: 6 }}>One-time payment · Digital access · 365-day money-back guarantee</div>
              <div style={{ marginTop: '1.2rem' }}><CTA label={`Get The Knowledge Asset`} /></div>
            </div>
            </div>
          </Reveal>
        </div>
      </Section>

      {/* 18 — BIG Guarantee */}
      <Section bg={PARCH} style={{ padding: 'clamp(72px,10vw,140px) 1.25rem' }}>
        <div className="ka-guarantee-grid">
          <Reveal style={{ display: 'flex', justifyContent: 'center' }}>
            {/* Gold seal */}
            <div style={{ position: 'relative', width: 'min(280px,72vw)', aspectRatio: '1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: `radial-gradient(circle at 50% 35%, ${GOLD_LT}, ${GOLD} 55%, ${GOLD_DK} 100%)`, boxShadow: '0 30px 70px rgba(184,152,63,.4), inset 0 2px 6px rgba(255,255,255,.5)' }} />
              <div style={{ position: 'absolute', inset: 16, borderRadius: '50%', border: `2px dashed rgba(46,26,53,.35)` }} />
              <div style={{ position: 'relative', textAlign: 'center', color: PLUM_DK }}>
                <div style={{ fontFamily: SANS, fontSize: 11, fontWeight: 700, letterSpacing: '.2em', textTransform: 'uppercase' }}>Money-Back</div>
                <div style={{ fontFamily: SERIF, fontSize: 'clamp(4rem,14vw,6rem)', fontWeight: 700, lineHeight: .85, margin: '.2rem 0' }}>365</div>
                <div style={{ fontFamily: SANS, fontSize: 13, fontWeight: 700, letterSpacing: '.32em', textTransform: 'uppercase' }}>Day Guarantee</div>
              </div>
            </div>
          </Reveal>
          <Reveal delay={90}>
            <Eyebrow>Zero risk</Eyebrow>
            <h2 style={{ ...H2, marginTop: '.8rem' }}>Try it for 365 days. <em style={emGold}>You&apos;re fully protected.</em></h2>
            <p style={{ fontFamily: SANS, fontSize: '1.15rem', color: INK_MID, marginTop: '1.2rem', lineHeight: 1.75, maxWidth: 560 }}>
              We want you to actually use this book. Work through it. Complete the exercises. Build your product. Shape your offer. Create your content plan. Launch. And if you decide the book isn&apos;t right for you, you&apos;re protected by our full 365-day money-back guarantee.
            </p>
            <div style={{ marginTop: '1.8rem' }}><CTA label={`Get The Book Risk-Free`} /></div>
            <p style={{ fontFamily: SANS, fontSize: 12, color: INK_MUTE, marginTop: '1.2rem', maxWidth: 540 }}>365-day money-back guarantee applies to the purchase price and is subject to the published refund terms.</p>
          </Reveal>
        </div>
      </Section>

      {/* 19 — FAQ */}
      <Section bg={WHITE} id="faq">
        <Reveal style={{ maxWidth: 840, margin: '0 auto' }}>
          <Eyebrow>FAQ</Eyebrow>
          <h2 style={{ ...H2, marginTop: '.8rem' }}>Questions? <em style={emItal}>Answered.</em></h2>
          <div style={{ marginTop: '1.6rem' }}>{FAQS.map(([q, a]) => <FAQItem key={q} q={q} a={a} />)}</div>
        </Reveal>
      </Section>

      {/* 21 — Final checkout */}
      <Section bg={PLUM_DK} color={CREAM} id="checkout">
        <Reveal style={{ textAlign: 'center', maxWidth: 820, margin: '0 auto 2.6rem' }}>
          <Eyebrow center onDark>Start now</Eyebrow>
          <h2 style={{ ...H2, marginTop: '.9rem', color: CREAM }}>You already know more than you think. <em style={{ fontStyle: 'italic', fontWeight: 400, color: GOLD_LT }}>Now turn it into something people can buy.</em></h2>
          <p style={{ fontFamily: SANS, fontSize: '1.1rem', fontWeight: 300, color: 'rgba(246,239,227,.82)', marginTop: '1.2rem', lineHeight: 1.75 }}>
            You don&apos;t need another year of planning. You don&apos;t need another hundred videos. You need to start. Open the workbook. Do the first exercise. Build the first asset.
          </p>
        </Reveal>
        <Reveal delay={80} style={{ maxWidth: 560, margin: '0 auto' }}>
          <CheckoutCard planId={planId} />
        </Reveal>
        <Reveal delay={120} style={{ textAlign: 'center', marginTop: '2.4rem' }}>
          <div style={{ display: 'flex', gap: 20, justifyContent: 'center', flexWrap: 'wrap', fontFamily: SERIF, fontSize: 'clamp(1rem,2vw,1.4rem)', fontStyle: 'italic', letterSpacing: '.04em', color: GOLD_LT }}>
            <span>Read it.</span><span>Do the work.</span><span>Build the business.</span>
          </div>
        </Reveal>
      </Section>

      {/* 22 — Footer */}
      <footer style={{ background: PLUM_DEEP, color: 'rgba(246,239,227,.72)', padding: '3.4rem 1.25rem 2.6rem', borderTop: `1px solid ${GOLD_LINE}` }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontFamily: SERIF, fontSize: '1.5rem', fontWeight: 600, color: CREAM }}>The Knowledge <em style={{ fontStyle: 'italic', color: GOLD_LT }}>Asset</em></div>
              <div style={{ fontFamily: SANS, fontSize: 13.5, marginTop: 8 }}>Indrodip Ghosh &amp; Christinee Mathison</div>
              <a href="https://10kroadmap.org" style={{ fontFamily: SANS, fontSize: 13.5, color: GOLD_LT, textDecoration: 'none', display: 'inline-block', marginTop: 4 }}>10kroadmap.org</a>
            </div>
            <nav style={{ display: 'flex', flexWrap: 'wrap', gap: '10px 22px' }} aria-label="Footer">
              {[['Privacy Policy', '/privacy'], ['Terms', '/terms'], ['Refund Policy', '/refund'], ['Contact', '/support']].map(([l, h]) => (
                <a key={l} href={h} style={{ fontFamily: SANS, fontSize: 13.5, color: 'rgba(246,239,227,.72)', textDecoration: 'none' }}>{l}</a>
              ))}
            </nav>
          </div>
          <div style={{ borderTop: `1px solid ${GOLD_LINE}`, marginTop: 30, paddingTop: 22, fontFamily: SANS, fontSize: 12, color: 'rgba(246,239,227,.55)', lineHeight: 1.7 }}>
            <p>© 2026 The5th Consulting. All rights reserved.</p>
            <p style={{ marginTop: 8, maxWidth: 800 }}>Business results vary. This book provides educational information and practical exercises; it does not guarantee financial results.</p>
          </div>
        </div>
      </footer>

      {/* Sticky mobile CTA */}
      <div className="ka-sticky-cta" style={{ position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 50, background: `linear-gradient(180deg,${PLUM_DK},${PLUM_DEEP})`, padding: '.6rem .9rem', borderTop: `1px solid ${GOLD_LINE}`, alignItems: 'center', justifyContent: 'center' }}>
        <a href="#buy" style={{ display: 'flex', width: '100%', minHeight: 52, alignItems: 'center', justifyContent: 'center', gap: 8, background: `linear-gradient(180deg,${GOLD_LT},${GOLD} 55%,${GOLD_DK})`, color: PLUM_DK, fontFamily: SANS, fontWeight: 700, fontSize: 15, borderRadius: 6, textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '.08em', boxShadow: 'inset 0 1px 0 rgba(255,255,255,.5)' }}>
          Get The Knowledge Asset — {PRICE}
        </a>
      </div>
    </div>
  )
}
