'use client'
/* ─────────────────────────────────────────────────────────────────────────
   THE KNOWLEDGE ASSET — editorial, million-dollar-brand sales page.

   Built on the house system (aubergine/plum + royal gold + parchment,
   Cormorant Garamond display w/ italic emphasis over DM Sans) but art-
   directed for depth: layered/grained hero, gold-foil detailing, numbered
   section kickers, a Cormorant marquee, drop caps, pull quotes, and hover-
   lift cards. Live Whop checkout embedded above the fold (#buy). No
   fabricated proof; the 7-day The5th AI trial is the flagship bonus.
   ───────────────────────────────────────────────────────────────────────── */
import { useEffect, useRef, useState, type ReactNode, type CSSProperties } from 'react'

/* ── Brand tokens ─────────────────────────────────────────────────────────── */
const PLUM = '#3D2645'
const PLUM_DK = '#2E1A35'
const PLUM_DEEP = '#241229'
const NOIR = '#180f20'
const GOLD = '#C9A84C'
const GOLD_LT = '#EBD48A'
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
const GRAIN = "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")"

/* ── Scroll reveal ────────────────────────────────────────────────────────── */
function Reveal({ children, delay = 0, style }: { children: ReactNode; delay?: number; style?: CSSProperties }) {
  const ref = useRef<HTMLDivElement | null>(null)
  const [state, setState] = useState({ shown: false, reduce: false })
  const { shown, reduce } = state
  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setState({ shown: true, reduce: reduceMotion }); io.disconnect() } }, { threshold: 0.1, rootMargin: '0px 0px -8% 0px' })
    io.observe(el)
    return () => io.disconnect()
  }, [])
  const transition = reduce ? 'none' : `opacity .85s ease ${delay}ms, transform .85s cubic-bezier(.22,1,.36,1) ${delay}ms`
  return <div ref={ref} style={{ opacity: shown ? 1 : 0, transform: shown ? 'none' : 'translateY(22px)', transition, ...style }}>{children}</div>
}

/* ── Royal-gold CTA (shine sweep on hover) ────────────────────────────────── */
function CTA({ label = `Get The Book — ${PRICE}`, href = '#buy', size = 'lg', style }: { label?: string; href?: string; size?: 'lg' | 'md'; style?: CSSProperties }) {
  const pad = size === 'lg' ? '1.15rem 2.5rem' : '.8rem 1.6rem'
  const fs = size === 'lg' ? '.95rem' : '.76rem'
  return (
    <a href={href} className="ka-cta" style={{ position: 'relative', overflow: 'hidden', display: 'inline-flex', alignItems: 'center', gap: 10, background: `linear-gradient(180deg,${GOLD_LT} 0%,${GOLD} 52%,${GOLD_DK} 100%)`, color: PLUM_DK, fontFamily: SANS, fontWeight: 700, fontSize: fs, letterSpacing: '.12em', textTransform: 'uppercase', padding: pad, borderRadius: 4, textDecoration: 'none', minHeight: 52, boxShadow: '0 10px 28px rgba(184,152,63,0.36), inset 0 1px 0 rgba(255,255,255,0.55)', ...style }}>
      <span style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', gap: 10 }}>{label}
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
      </span>
    </a>
  )
}

/* ── Numbered section kicker ───────────────────────────────────────────────── */
function Kicker({ n, children, center = false, onDark = false }: { n: string; children: ReactNode; center?: boolean; onDark?: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, justifyContent: center ? 'center' : 'flex-start' }}>
      <span style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: 19, color: onDark ? GOLD_LT : GOLD_INK }}>{n}</span>
      <span style={{ width: 34, height: 1, background: onDark ? GOLD_LINE : 'rgba(184,152,63,.5)' }} />
      <span style={{ fontFamily: SANS, fontSize: 11.5, fontWeight: 600, letterSpacing: '.2em', textTransform: 'uppercase', color: onDark ? 'rgba(246,239,227,.72)' : INK_MUTE }}>{children}</span>
    </div>
  )
}

function Divider() {
  return (
    <div aria-hidden style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, padding: '4px 0' }}>
      <span style={{ height: 1, width: 90, background: 'linear-gradient(90deg,transparent,rgba(184,152,63,.55))' }} />
      <span style={{ width: 7, height: 7, transform: 'rotate(45deg)', background: GOLD, boxShadow: '0 0 0 4px rgba(201,168,76,.14)' }} />
      <span style={{ height: 1, width: 90, background: 'linear-gradient(90deg,rgba(184,152,63,.55),transparent)' }} />
    </div>
  )
}

/* ── Premium aubergine + gold 3D book mockup ──────────────────────────────── */
function BookMockup({ w = 'min(320px, 72vw)' }: { w?: string }) {
  return (
    <div style={{ perspective: 1800, display: 'flex', justifyContent: 'center' }}>
      <div className="ka-book ka-float" style={{ position: 'relative', width: w, aspectRatio: '3 / 4.25', transformStyle: 'preserve-3d', transform: 'rotateY(-25deg) rotateX(7deg)' }}>
        <div style={{ position: 'absolute', top: 8, right: -16, width: 20, height: 'calc(100% - 16px)', background: 'linear-gradient(90deg,#f1e9d8,#ccbfa4)', transform: 'rotateY(90deg) translateZ(10px)', transformOrigin: 'right', borderRadius: 2 }} />
        <div style={{ position: 'absolute', inset: 0, borderRadius: '3px 9px 9px 3px', background: `linear-gradient(160deg, ${PLUM} 0%, ${PLUM_DK} 55%, ${NOIR} 100%)`, boxShadow: `0 48px 90px rgba(15,6,20,.6), inset 0 0 0 1px ${GOLD_LINE}`, padding: '36px 30px', display: 'flex', flexDirection: 'column', color: CREAM, overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, background: GRAIN, opacity: 0.08, mixBlendMode: 'overlay', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', top: 0, left: 0, width: 12, height: '100%', background: 'linear-gradient(90deg, rgba(255,255,255,.2), rgba(255,255,255,0))' }} />
          <div style={{ position: 'absolute', inset: 15, border: `1px solid ${GOLD_LINE}`, borderRadius: 3, pointerEvents: 'none' }} />
          <div style={{ fontFamily: SANS, fontSize: 9.5, fontWeight: 700, letterSpacing: '.28em', color: GOLD_LT, textTransform: 'uppercase' }}>The 10K Roadmap Series</div>
          <div style={{ height: 1, background: `linear-gradient(90deg, ${GOLD}, transparent)`, margin: '18px 0 auto', width: '48%' }} />
          <h3 style={{ fontFamily: SERIF, fontWeight: 600, fontSize: 'clamp(30px, 8vw, 46px)', lineHeight: 0.96, letterSpacing: '-.02em', margin: 0 }}>
            THE<br />KNOWLEDGE<br /><em style={{ fontStyle: 'italic', fontWeight: 500, color: GOLD_LT }}>ASSET</em>
          </h3>
          <p style={{ fontFamily: SANS, fontSize: 11, lineHeight: 1.5, color: 'rgba(246,239,227,.82)', marginTop: 18, fontWeight: 300 }}>Turn What You Know Into a $10K-a-Month Digital Business</p>
          <div style={{ marginTop: 'auto', paddingTop: 18, borderTop: `1px solid ${GOLD_LINE}`, fontFamily: SANS, fontSize: 9.5, letterSpacing: '.09em', color: 'rgba(246,239,227,.9)', textTransform: 'uppercase' }}>
            Indrodip Ghosh <span style={{ color: GOLD_LT }}>&amp;</span> Christinee Mathison
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Author avatar (photo → initials medallion) ───────────────────────────── */
function Avatar({ src, initials, name, size = 96 }: { src: string; initials: string; name: string; size?: number }) {
  const [err, setErr] = useState(false)
  if (err) {
    return <div aria-label={name} style={{ width: size, height: size, borderRadius: '50%', background: `linear-gradient(160deg,${PARCH_MID},${PARCH_DEEP})`, border: `2px solid ${GOLD_LINE}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: SERIF, fontStyle: 'italic', fontSize: size * 0.34, color: PLUM, fontWeight: 600, flexShrink: 0, boxShadow: '0 12px 34px rgba(61,38,69,.16)' }}>{initials}</div>
  }
  return <img src={src} alt={name} loading="lazy" onError={() => setErr(true)} style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', border: `2px solid ${GOLD_LINE}`, flexShrink: 0, boxShadow: '0 12px 34px rgba(61,38,69,.18)' }} />
}

/* ── FAQ accordion ────────────────────────────────────────────────────────── */
function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ borderBottom: `1px solid ${BORDER}` }}>
      <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, background: 'none', border: 'none', cursor: 'pointer', padding: '1.5rem .25rem', textAlign: 'left', fontFamily: SANS, minHeight: 48 }}>
        <span style={{ fontFamily: SERIF, fontSize: 'clamp(1.3rem,2.4vw,1.7rem)', fontWeight: 600, color: INK, lineHeight: 1.12 }}>{q}</span>
        <span aria-hidden style={{ flexShrink: 0, width: 30, height: 30, borderRadius: '50%', border: `1px solid ${GOLD_LINE}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: GOLD_INK, transform: open ? 'rotate(45deg)' : 'none', transition: 'transform .25s ease', fontSize: 22, lineHeight: 1 }}>+</span>
      </button>
      <div style={{ maxHeight: open ? 360 : 0, overflow: 'hidden', transition: 'max-height .34s ease' }}>
        <p style={{ fontFamily: SANS, fontSize: '1.05rem', lineHeight: 1.75, color: INK_MID, padding: '0 .25rem 1.6rem', maxWidth: 720 }}>{a}</p>
      </div>
    </div>
  )
}

/* ── Whop embedded checkout ───────────────────────────────────────────────── */
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
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, background: WHITE, borderRadius: 8, padding: 16 }}>
          {!slow ? (
            <><div style={{ width: 26, height: 26, borderRadius: '50%', border: '3px solid #eee', borderTopColor: GOLD, animation: 'ka-spin .8s linear infinite' }} /><p style={{ fontFamily: SANS, fontSize: 13, color: INK_MUTE, margin: 0 }}>Loading secure checkout…</p></>
          ) : (
            <><p style={{ fontFamily: SANS, fontSize: 13.5, color: INK, margin: 0, textAlign: 'center', fontWeight: 600 }}>Checkout is taking a moment.</p>
              <a href={hostedUrl} target="_top" style={{ display: 'inline-flex', minHeight: 52, alignItems: 'center', background: `linear-gradient(180deg,${GOLD_LT},${GOLD_DK})`, color: PLUM_DK, fontFamily: SANS, fontWeight: 700, fontSize: 15, padding: '.85rem 1.7rem', borderRadius: 4, textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '.08em' }}>Get instant access — {PRICE} →</a>
              <p style={{ fontFamily: SANS, fontSize: 11.5, color: INK_MUTE, margin: 0, textAlign: 'center' }}>Opens Whop&apos;s secure checkout.</p></>
          )}
        </div>
      )}
    </div>
  )
}

/* ── Checkout card ────────────────────────────────────────────────────────── */
function CheckoutCard({ planId }: { planId: string }) {
  return (
    <div style={{ position: 'relative' }}>
      <div aria-hidden style={{ position: 'absolute', inset: -30, background: `radial-gradient(60% 55% at 50% 20%, rgba(201,168,76,.35), transparent 70%)`, filter: 'blur(20px)', pointerEvents: 'none' }} />
      <div style={{ position: 'relative', background: `linear-gradient(180deg,${WHITE},${PARCH})`, border: `1px solid ${GOLD_LINE}`, borderRadius: 14, boxShadow: '0 40px 90px rgba(15,6,20,.5)', padding: '1.9rem 1.7rem', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg,transparent,${GOLD},transparent)` }} />
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <div style={{ width: 58, height: 76, borderRadius: 3, background: `linear-gradient(160deg,${PLUM},${NOIR})`, boxShadow: `inset 0 0 0 1px ${GOLD_LINE}`, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 4 }}>
            <span style={{ fontFamily: SERIF, fontSize: 9.5, color: GOLD_LT, textAlign: 'center', lineHeight: 1.05, fontWeight: 600 }}>THE<br />KNOWLEDGE<br />ASSET</span>
          </div>
          <div>
            <div style={{ fontFamily: SANS, fontSize: 10.5, fontWeight: 700, letterSpacing: '.16em', textTransform: 'uppercase', color: GOLD_INK }}>Digital Workbook</div>
            <div style={{ fontFamily: SERIF, fontSize: '1.55rem', fontWeight: 600, color: INK, lineHeight: 1.02, marginTop: 3 }}>The Knowledge Asset</div>
            <div style={{ fontFamily: SANS, fontSize: 12.5, color: INK_MUTE, marginTop: 3 }}>Instant access + 4 bonuses</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, margin: '1.15rem 0 .2rem' }}>
          <span style={{ fontFamily: SANS, fontSize: 15, color: INK_MUTE, textDecoration: 'line-through' }}>$47</span>
          <span style={{ fontFamily: SERIF, fontSize: '3.5rem', fontWeight: 600, color: PLUM_DK, lineHeight: 1 }}>{PRICE}</span>
          <span style={{ fontFamily: SANS, fontSize: 13, color: INK_MUTE }}>one-time</span>
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
    </div>
  )
}

/* ── Data ─────────────────────────────────────────────────────────────────── */
const STATS = [['9', 'Chapters'], ['4', 'Bonuses'], ['20+', 'Clients to $10K'], ['365', 'Day guarantee']]
const MARQUEE = ['Read less. Build more.', 'From expertise to asset.', 'Create once, sell repeatedly.', 'Stop trading hours for dollars.', 'From knowledge to product.', 'Build it as you read it.', 'No big team required.', 'One clear roadmap + execution.']
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
  ['The 90-Day Content Calendar', '90 daily content topics, pre-planned phase-by-phase, so you never stare at a blank screen wondering what to post.', 'Bonus'],
  ['The Product Blueprint Template', 'A one-page product planning template that helps you turn your expertise into a concrete digital product.', 'Bonus'],
  ['The Offer Stack Builder', 'A fill-in-the-blank document that helps you build your complete offer description in under 30 minutes.', 'Bonus'],
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
    <section id={id} style={{ background: bg, color: color || INK, padding: 'clamp(72px, 9vw, 128px) 1.25rem', ...style }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>{children}</div>
    </section>
  )
}
const H2: CSSProperties = { fontFamily: SERIF, fontWeight: 600, fontSize: 'clamp(2.4rem, 4.8vw, 4rem)', lineHeight: 1.02, letterSpacing: '-.03em', margin: 0 }
const emItal: CSSProperties = { fontStyle: 'italic', fontWeight: 300, color: PLUM }
const emGold: CSSProperties = { fontStyle: 'italic', fontWeight: 400, color: GOLD_INK }
const emGoldD: CSSProperties = { fontStyle: 'italic', fontWeight: 400, color: GOLD_LT }

/* ═══════════════════════════════════════════════════════════════════════════ */
export default function Workbook({ planId }: { planId: string }) {
  const NAV: [string, string][] = [['The Build', '#build'], ['Inside', '#inside'], ['Bonuses', '#bonuses'], ['Authors', '#authors'], ['FAQ', '#faq']]

  return (
    <div style={{ fontFamily: SANS, color: INK, background: PARCH, overflowX: 'hidden' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,500;1,600&family=DM+Sans:wght@300;400;500;600;700&display=swap');
        html{scroll-behavior:smooth}
        .ka-cta::before{content:'';position:absolute;top:0;left:-130%;width:55%;height:100%;background:linear-gradient(100deg,transparent,rgba(255,255,255,.55),transparent);transform:skewX(-18deg);transition:left .7s ease}
        .ka-cta:hover::before{left:135%}
        .ka-cta{transition:transform .2s ease, box-shadow .2s ease}
        .ka-cta:hover{transform:translateY(-2px); box-shadow:0 16px 36px rgba(184,152,63,0.46), inset 0 1px 0 rgba(255,255,255,0.6)}
        .ka-lift{transition:transform .32s cubic-bezier(.22,1,.36,1), box-shadow .32s ease}
        .ka-lift:hover{transform:translateY(-5px); box-shadow:0 26px 54px rgba(61,38,69,.16)}
        @keyframes ka-spin{to{transform:rotate(360deg)}}
        @keyframes ka-float{0%,100%{transform:rotateY(-25deg) rotateX(7deg) translateY(0)}50%{transform:rotateY(-22deg) rotateX(7deg) translateY(-14px)}}
        .ka-float{animation:ka-float 7s ease-in-out infinite}
        @keyframes ka-marq{from{transform:translateX(0)}to{transform:translateX(-50%)}}
        .ka-marq-track{display:flex;width:max-content;animation:ka-marq 34s linear infinite}
        .ka-marq-wrap{overflow:hidden;-webkit-mask-image:linear-gradient(to right,transparent,black 7%,black 93%,transparent);mask-image:linear-gradient(to right,transparent,black 7%,black 93%,transparent)}
        .ka-hero-grid{display:grid;grid-template-columns:1.05fr .95fr;gap:clamp(36px,5vw,72px);align-items:center}
        .ka-2col{display:grid;grid-template-columns:1fr 1fr;gap:28px}
        .ka-3col{display:grid;grid-template-columns:repeat(3,1fr);gap:20px}
        .ka-4col{display:grid;grid-template-columns:repeat(4,1fr);gap:18px}
        .ka-timeline{display:grid;grid-template-columns:repeat(7,1fr);gap:14px}
        .ka-nav-links{display:flex;gap:.4rem;align-items:center}
        .ka-ladder{display:flex;align-items:flex-end;justify-content:center;flex-wrap:wrap}
        .ka-sticky-cta{display:none}
        .ka-guar{display:grid;grid-template-columns:.9fr 1.1fr;gap:clamp(36px,5vw,80px);align-items:center}
        .ka-statbar{display:flex;justify-content:center;gap:clamp(24px,5vw,64px);flex-wrap:wrap}
        .ka-dropcap:first-letter{font-family:'Cormorant Garamond',serif;font-weight:600;font-size:4.4rem;line-height:.72;float:left;margin:.35rem .7rem 0 0;color:${GOLD_INK}}
        @media(max-width:1000px){
          .ka-hero-grid{grid-template-columns:1fr;gap:44px}
          .ka-4col{grid-template-columns:1fr 1fr}
          .ka-timeline{grid-template-columns:1fr}
          .ka-3col{grid-template-columns:1fr}
          .ka-nav-links{display:none}
          .ka-guar{grid-template-columns:1fr;gap:40px;text-align:center}
        }
        @media(max-width:760px){
          .ka-2col{grid-template-columns:1fr}
          .ka-4col{grid-template-columns:1fr 1fr}
          .ka-sticky-cta{display:flex}
          .ka-float{animation:none}
        }
        @media(prefers-reduced-motion:reduce){.ka-float,.ka-cta,.ka-lift,.ka-marq-track{animation:none;transition:none}}
      `}</style>

      {/* Announcement bar */}
      <div style={{ background: `linear-gradient(90deg,${NOIR},${PLUM_DK},${NOIR})`, color: CREAM, textAlign: 'center', fontFamily: SANS, fontSize: 11.5, fontWeight: 500, letterSpacing: '.14em', padding: '.6rem 1rem', textTransform: 'uppercase', borderBottom: `1px solid ${GOLD_LINE}` }}>
        New Release <span style={{ color: GOLD_LT }}>·</span> The Knowledge Asset for {PRICE} <span style={{ color: GOLD_LT }}>·</span> Includes 7 Days of The5th AI Free <span style={{ color: GOLD_LT }}>·</span> 365-Day Guarantee
      </div>

      {/* Nav */}
      <header style={{ position: 'sticky', top: 0, zIndex: 40, background: 'rgba(24,15,32,.82)', backdropFilter: 'blur(12px)', borderBottom: `1px solid ${GOLD_LINE}` }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '.85rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          <a href="#top" style={{ fontFamily: SERIF, fontWeight: 600, fontSize: '1.35rem', color: CREAM, textDecoration: 'none', letterSpacing: '-.01em' }}>The Knowledge <em style={{ fontStyle: 'italic', color: GOLD_LT }}>Asset</em></a>
          <nav className="ka-nav-links" aria-label="Sections">
            {NAV.map(([l, h]) => <a key={h} href={h} style={{ fontSize: '.72rem', fontWeight: 500, letterSpacing: '.14em', textTransform: 'uppercase', color: 'rgba(246,239,227,.78)', textDecoration: 'none', padding: '0 .9em' }}>{l}</a>)}
            <CTA label="Get the Book" href="#buy" size="md" style={{ marginLeft: '.6rem' }} />
          </nav>
        </div>
      </header>

      {/* HERO — layered, grained, editorial */}
      <div id="top" />
      <section style={{ position: 'relative', background: `radial-gradient(120% 90% at 82% 0%, ${PLUM} 0%, ${PLUM_DK} 42%, ${NOIR} 100%)`, color: CREAM, padding: 'clamp(52px,6vw,92px) 1.25rem clamp(40px,5vw,64px)', overflow: 'hidden' }}>
        <div aria-hidden style={{ position: 'absolute', inset: 0, background: GRAIN, opacity: 0.06, mixBlendMode: 'overlay', pointerEvents: 'none' }} />
        <div aria-hidden style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: `linear-gradient(90deg,transparent,${GOLD_LINE},transparent)` }} />
        <div aria-hidden style={{ position: 'absolute', top: '6%', right: '-2%', fontFamily: SERIF, fontWeight: 700, fontStyle: 'italic', fontSize: 'clamp(12rem,26vw,26rem)', lineHeight: .8, color: 'rgba(201,168,76,.05)', pointerEvents: 'none', userSelect: 'none' }}>10K</div>
        <div style={{ position: 'relative', maxWidth: 1200, margin: '0 auto' }}>
          <div className="ka-hero-grid">
            {/* Left — copy */}
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, fontFamily: SANS, fontSize: 11, fontWeight: 600, letterSpacing: '.2em', textTransform: 'uppercase', color: GOLD_LT, border: `1px solid ${GOLD_LINE}`, borderRadius: 999, padding: '.45rem 1rem' }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: GOLD }} />The 10K Roadmap Series · Vol. I
              </div>
              <h1 style={{ fontFamily: SERIF, fontWeight: 600, fontSize: 'clamp(2.9rem, 6.4vw, 5.4rem)', lineHeight: 0.98, letterSpacing: '-.035em', margin: '1.3rem 0 0', color: CREAM }}>
                Turn what you know into <em style={{ fontStyle: 'italic', fontWeight: 400, color: GOLD_LT }}>an asset you can sell.</em>
              </h1>
              <p style={{ fontFamily: SANS, fontSize: 'clamp(1.05rem,1.5vw,1.2rem)', fontWeight: 300, color: 'rgba(246,239,227,.82)', marginTop: '1.4rem', maxWidth: 520, lineHeight: 1.7 }}>
                <strong style={{ fontWeight: 500, color: CREAM }}>The Knowledge Asset</strong> is a build-as-you-go workbook for coaches, consultants, and experts. You don&apos;t just read it — you build your product, offer, audience, content, and launch inside it, on a real path toward $10K months.
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.6rem 1.4rem', marginTop: '1.7rem' }}>
                {['9 chapters + exercises', '4 bonuses included', '365-day guarantee'].map((t) => (
                  <span key={t} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontFamily: SANS, fontSize: 13.5, fontWeight: 400, color: 'rgba(246,239,227,.9)' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={GOLD_LT} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden><polyline points="20 6 9 17 4 12" /></svg>{t}
                  </span>
                ))}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: '2.2rem', paddingTop: '1.5rem', borderTop: `1px solid ${GOLD_LINE}` }}>
                <div style={{ display: 'flex' }}>
                  <Avatar src="/images/founder.png" initials="IG" name="Indrodip Ghosh" size={50} />
                  <div style={{ marginLeft: -14 }}><Avatar src="/images/christinee.png" initials="CM" name="Christinee Mathison" size={50} /></div>
                </div>
                <div style={{ fontFamily: SANS, fontSize: 13, color: 'rgba(246,239,227,.82)', lineHeight: 1.45 }}>
                  <div style={{ color: GOLD_LT, fontSize: 10.5, letterSpacing: '.14em', textTransform: 'uppercase', fontWeight: 600 }}>Written by</div>
                  Indrodip Ghosh &amp; Christinee Mathison
                </div>
              </div>
            </div>

            {/* Right — live checkout */}
            <div id="buy" style={{ scrollMarginTop: 90 }}>
              <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                <span style={{ display: 'inline-block', fontFamily: SANS, fontSize: 10.5, fontWeight: 700, letterSpacing: '.18em', textTransform: 'uppercase', color: PLUM_DK, background: `linear-gradient(180deg,${GOLD_LT},${GOLD})`, borderRadius: 999, padding: '.4rem 1.1rem', boxShadow: '0 8px 22px rgba(201,168,76,.35)' }}>
                  Read it · Do the work · Build the business
                </span>
              </div>
              <CheckoutCard planId={planId} />
            </div>
          </div>

          {/* Stat bar */}
          <div className="ka-statbar" style={{ marginTop: 'clamp(40px,5vw,64px)', paddingTop: 'clamp(28px,4vw,40px)', borderTop: `1px solid ${GOLD_LINE}` }}>
            {STATS.map(([n, l]) => (
              <div key={l} style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: SERIF, fontSize: 'clamp(2rem,4vw,2.8rem)', fontWeight: 600, color: GOLD_LT, lineHeight: 1 }}>{n}</div>
                <div style={{ fontFamily: SANS, fontSize: 11.5, fontWeight: 500, letterSpacing: '.14em', textTransform: 'uppercase', color: 'rgba(246,239,227,.66)', marginTop: 6 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Marquee */}
      <div style={{ background: NOIR, borderBottom: `1px solid rgba(201,168,76,.14)`, padding: '1.4rem 0' }}>
        <div className="ka-marq-wrap">
          <div className="ka-marq-track">
            {[...MARQUEE, ...MARQUEE].map((t, i) => (
              <span key={i} style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: '1.3rem', color: 'rgba(246,239,227,.5)', padding: '0 1.6rem', whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center', gap: '1.6rem' }}>
                {t}<span style={{ width: 6, height: 6, transform: 'rotate(45deg)', background: GOLD, opacity: .8 }} />
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* 01 — Problem */}
      <Section bg={PARCH} id="problem">
        <Reveal>
          <Kicker n="01">The problem</Kicker>
          <h2 style={{ ...H2, marginTop: '1rem', maxWidth: 940 }}>You&apos;ve read enough. <em style={emGold}>Now build the thing.</em></h2>
          <p className="ka-dropcap" style={{ fontFamily: SANS, fontSize: '1.2rem', lineHeight: 1.8, color: INK_MID, marginTop: '1.6rem', maxWidth: 680 }}>
            You&apos;ve probably consumed enough advice. You&apos;ve saved the posts, watched the videos, bought the courses, taken the notes, made the plans. But information was never the bottleneck. Execution is. And if your income still depends on you showing up for every client, every call, every hour and every dollar — you haven&apos;t built an asset yet. You&apos;ve built yourself another job.
          </p>
          <p style={{ fontFamily: SERIF, fontSize: 'clamp(1.5rem,3vw,2rem)', fontStyle: 'italic', fontWeight: 400, color: PLUM, marginTop: '1.4rem' }}>The Knowledge Asset changes that.</p>
        </Reveal>
        <Reveal delay={80} style={{ marginTop: '2.8rem' }}>
          <div className="ka-2col">
            <div className="ka-lift" style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 14, padding: '1.9rem 1.7rem' }}>
              <div style={{ fontFamily: SANS, fontSize: 11, fontWeight: 700, letterSpacing: '.16em', textTransform: 'uppercase', color: INK_MUTE }}>Trading time for money</div>
              <ul style={{ listStyle: 'none', margin: '1.1rem 0 0', display: 'grid', gap: 12 }}>
                {['Your income depends on your time.', 'Every client requires you.', 'You start from zero every month.', 'You constantly sell your availability.'].map((t) => (
                  <li key={t} style={{ display: 'flex', gap: 12, fontFamily: SANS, fontSize: '1rem', color: INK_MID }}><span style={{ color: '#b06a52' }}>✕</span>{t}</li>
                ))}
              </ul>
            </div>
            <div className="ka-lift" style={{ position: 'relative', background: `linear-gradient(160deg,${PLUM},${NOIR})`, border: `1px solid ${GOLD_LINE}`, borderRadius: 14, padding: '1.9rem 1.7rem', color: CREAM, overflow: 'hidden' }}>
              <div aria-hidden style={{ position: 'absolute', inset: 0, background: GRAIN, opacity: 0.07, mixBlendMode: 'overlay' }} />
              <div style={{ position: 'relative' }}>
                <div style={{ fontFamily: SANS, fontSize: 11, fontWeight: 700, letterSpacing: '.16em', textTransform: 'uppercase', color: GOLD_LT }}>Building a knowledge asset</div>
                <ul style={{ listStyle: 'none', margin: '1.1rem 0 0', display: 'grid', gap: 12 }}>
                  {['Create once.', 'Sell repeatedly.', 'Build a product ladder.', 'Create leverage.', 'Build an asset around your expertise.'].map((t) => (
                    <li key={t} style={{ display: 'flex', gap: 12, fontFamily: SANS, fontSize: '1rem', color: 'rgba(246,239,227,.94)' }}><span style={{ color: GOLD_LT }}>✓</span>{t}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </Reveal>
      </Section>

      {/* 02 — Core promise (pull quote) */}
      <Section bg={PARCH_MID}>
        <Reveal style={{ textAlign: 'center', maxWidth: 860, margin: '0 auto' }}>
          <Kicker n="02" center>The premise</Kicker>
          <h2 style={{ ...H2, marginTop: '1rem' }}>The most valuable thing you own is <em style={emItal}>what you already know.</em></h2>
          <p style={{ fontFamily: SANS, fontSize: '1.15rem', lineHeight: 1.8, color: INK_MID, marginTop: '1.5rem' }}>
            You&apos;ve solved problems. Learned lessons. Developed skills. Made mistakes. Discovered systems. Lived through transformations. Other people are trying to figure out what you already figured out.
          </p>
          <div style={{ margin: '2rem 0' }}><Divider /></div>
          <p style={{ fontFamily: SERIF, fontSize: 'clamp(1.6rem,3.4vw,2.4rem)', color: INK, lineHeight: 1.32 }}>
            The question was never <span style={{ color: INK_MUTE, fontStyle: 'italic' }}>&ldquo;Do I know enough?&rdquo;</span><br />It&apos;s <em style={emGold}>&ldquo;How do I package it so someone can buy it?&rdquo;</em>
          </p>
          <p style={{ fontFamily: SANS, fontSize: '1rem', color: INK_MUTE, marginTop: '1.2rem' }}>That&apos;s the entire book.</p>
        </Reveal>
      </Section>

      {/* 03 — What you'll build */}
      <Section bg={WHITE} id="build">
        <Reveal>
          <Kicker n="03">What you&apos;ll build</Kicker>
          <h2 style={{ ...H2, marginTop: '1rem' }}>Don&apos;t read a book. <em style={emGold}>Build a business in the margins.</em></h2>
          <p style={{ fontFamily: SANS, fontSize: '1.15rem', color: INK_MID, marginTop: '1rem', maxWidth: 620 }}>Every section moves you from thinking to doing.</p>
        </Reveal>
        <Reveal delay={80} style={{ marginTop: '2.8rem' }}>
          <div className="ka-timeline">
            {BUILD_STEPS.map(([n, t, d]) => (
              <div key={n} style={{ borderTop: `2px solid ${GOLD_SOFT}`, paddingTop: 18, position: 'relative' }}>
                <span style={{ position: 'absolute', top: -9, left: 0, width: 16, height: 16, borderRadius: '50%', background: GOLD, boxShadow: `0 0 0 4px ${WHITE}` }} />
                <div style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: '2rem', fontWeight: 600, color: GOLD_INK }}>{n}</div>
                <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 15, color: INK, marginTop: 6, lineHeight: 1.25 }}>{t}</div>
                <p style={{ fontFamily: SANS, fontSize: 13, color: INK_MUTE, marginTop: 8, lineHeight: 1.55 }}>{d as string}</p>
              </div>
            ))}
          </div>
        </Reveal>
        <Reveal delay={120} style={{ marginTop: '2.8rem', textAlign: 'center' }}><CTA label={`Start Building — ${PRICE}`} /></Reveal>
      </Section>

      {/* 04 — Inside */}
      <Section bg={PARCH} id="inside">
        <Reveal>
          <Kicker n="04">Inside the book</Kicker>
          <h2 style={{ ...H2, marginTop: '1rem' }}>Nine chapters. Zero fluff. <em style={emItal}>One asset at the end.</em></h2>
        </Reveal>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16, marginTop: '2.4rem' }}>
          {CHAPTERS.map(([t, d], i) => (
            <Reveal key={t} delay={i * 40}>
              <div className="ka-lift" style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 12, padding: '1.6rem 1.5rem', height: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
                  <span style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: '1.7rem', fontWeight: 600, color: GOLD_INK }}>{String(i + 1).padStart(2, '0')}</span>
                  <span style={{ fontFamily: SANS, fontSize: 10.5, fontWeight: 700, letterSpacing: '.14em', color: INK_MUTE }}>CHAPTER</span>
                </div>
                <div style={{ fontFamily: SERIF, fontSize: '1.45rem', fontWeight: 600, color: INK, marginTop: 8, lineHeight: 1.12 }}>{t}</div>
                <p style={{ fontFamily: SANS, fontSize: 14, color: INK_MUTE, marginTop: 8, lineHeight: 1.55 }}>{d}</p>
              </div>
            </Reveal>
          ))}
        </div>
        <Reveal delay={120} style={{ marginTop: '1.4rem' }}>
          <div style={{ position: 'relative', background: `linear-gradient(160deg,${PLUM},${NOIR})`, color: CREAM, borderRadius: 12, padding: '1.7rem 1.8rem', border: `1px solid ${GOLD_LINE}`, overflow: 'hidden' }}>
            <div aria-hidden style={{ position: 'absolute', inset: 0, background: GRAIN, opacity: 0.06, mixBlendMode: 'overlay' }} />
            <div style={{ position: 'relative' }}>
              <div style={{ fontFamily: SANS, fontSize: 11, fontWeight: 700, letterSpacing: '.16em', color: GOLD_LT }}>PLUS · THE FINALE</div>
              <div style={{ fontFamily: SERIF, fontSize: '1.7rem', fontWeight: 600, marginTop: 4 }}>Your Next 24 Hours</div>
              <p style={{ fontFamily: SANS, fontSize: 14.5, fontWeight: 300, color: 'rgba(246,239,227,.82)', marginTop: 4, maxWidth: 640 }}>A practical, action-focused conclusion designed to get you moving immediately — not someday.</p>
            </div>
          </div>
        </Reveal>
      </Section>

      {/* 05 — Workbook experience */}
      <Section bg={WHITE}>
        <div className="ka-2col" style={{ alignItems: 'center', gap: 'clamp(32px,5vw,64px)' }}>
          <Reveal>
            <Kicker n="05">The method</Kicker>
            <h2 style={{ ...H2, marginTop: '1rem' }}>Not a book you finish. <em style={emGold}>A business you build.</em></h2>
            <p style={{ fontFamily: SANS, fontSize: '1.1rem', color: INK_MID, marginTop: '1.3rem', lineHeight: 1.8, maxWidth: 520 }}>
              Each chapter moves you forward. You&apos;ll answer questions, make decisions, choose your audience, develop your product, shape your offer, plan your content, set your launch, and commit to the next action.
            </p>
            <p style={{ fontFamily: SERIF, fontSize: '1.5rem', color: INK, marginTop: '1.1rem', fontStyle: 'italic' }}>The goal isn&apos;t to highlight every page. It&apos;s to finish with something real.</p>
          </Reveal>
          <Reveal delay={100}>
            <div style={{ display: 'grid', gap: 12 }}>
              {WORKBOOK_PAGES.map((p, i) => (
                <div key={p} className="ka-lift" style={{ display: 'flex', alignItems: 'center', gap: 16, background: PARCH, border: `1px solid ${BORDER}`, borderLeft: `3px solid ${GOLD}`, borderRadius: 10, padding: '1.05rem 1.15rem' }}>
                  <span style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: 18, color: GOLD_INK, fontWeight: 600, width: 26 }}>{String(i + 1).padStart(2, '0')}</span>
                  <span style={{ fontFamily: SANS, fontSize: 15.5, fontWeight: 500, color: INK }}>{p}</span>
                  <span style={{ marginLeft: 'auto', fontFamily: SERIF, fontSize: 14, color: INK_MUTE, fontStyle: 'italic' }}>your answer →</span>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </Section>

      {/* 06 — Ladder */}
      <Section bg={PARCH_MID}>
        <Reveal style={{ textAlign: 'center', maxWidth: 800, margin: '0 auto' }}>
          <Kicker n="06" center>The economics</Kicker>
          <h2 style={{ ...H2, marginTop: '1rem' }}>One idea. <em style={emItal}>A whole ladder of income.</em></h2>
          <p style={{ fontFamily: SANS, fontSize: '1.1rem', color: INK_MID, marginTop: '1.1rem', lineHeight: 1.7 }}>You don&apos;t need one giant offer. You build a connected product ladder around the same person.</p>
        </Reveal>
        <Reveal delay={100} style={{ marginTop: '2.8rem' }}>
          <div className="ka-ladder">
            {LADDER.map(([price, label], i) => (
              <div key={label} style={{ display: 'flex', alignItems: 'flex-end' }}>
                <div className="ka-lift" style={{ textAlign: 'center', background: i === LADDER.length - 1 ? `linear-gradient(160deg,${PLUM},${NOIR})` : WHITE, color: i === LADDER.length - 1 ? CREAM : INK, border: i === LADDER.length - 1 ? `1px solid ${GOLD_LINE}` : `1px solid ${BORDER}`, borderRadius: 10, padding: '1.15rem 1.25rem', minWidth: 120, marginBottom: i * 9, boxShadow: '0 12px 30px rgba(61,38,69,.09)' }}>
                  <div style={{ fontFamily: SERIF, fontSize: 'clamp(1.5rem,3vw,2rem)', fontWeight: 600, color: i === LADDER.length - 1 ? GOLD_LT : INK }}>{price}</div>
                  <div style={{ fontFamily: SANS, fontSize: 11, fontWeight: 600, letterSpacing: '.1em', textTransform: 'uppercase', color: i === LADDER.length - 1 ? 'rgba(246,239,227,.7)' : INK_MUTE, marginTop: 4 }}>{label}</div>
                </div>
                {i < LADDER.length - 1 && <span aria-hidden style={{ color: GOLD, fontSize: 22, margin: '0 4px 24px' }}>↗</span>}
              </div>
            ))}
          </div>
        </Reveal>
        <Reveal delay={140} style={{ textAlign: 'center', maxWidth: 640, margin: '2.4rem auto 0' }}>
          <p style={{ fontFamily: SERIF, fontSize: '1.5rem', fontStyle: 'italic', color: PLUM, lineHeight: 1.4 }}>Start small. Prove demand. Go deeper. Build leverage.</p>
          <p style={{ fontFamily: SANS, fontSize: '1rem', color: INK_MID, marginTop: '.9rem' }}>It&apos;s not about ten products overnight. It&apos;s how one piece of expertise becomes the foundation of an entire business.</p>
        </Reveal>
      </Section>

      {/* 07 — Real client story */}
      <Section bg={NOIR} color={CREAM} style={{ position: 'relative', overflow: 'hidden' }}>
        <div aria-hidden style={{ position: 'absolute', inset: 0, background: GRAIN, opacity: 0.06, mixBlendMode: 'overlay', pointerEvents: 'none' }} />
        <div aria-hidden style={{ position: 'absolute', top: '-10%', left: '50%', transform: 'translateX(-50%)', fontFamily: SERIF, fontSize: 'clamp(14rem,30vw,30rem)', color: 'rgba(201,168,76,.045)', pointerEvents: 'none', lineHeight: 1 }}>&ldquo;</div>
        <Reveal style={{ position: 'relative', maxWidth: 860, margin: '0 auto', textAlign: 'center' }}>
          <Kicker n="07" center onDark>Real client story</Kicker>
          <blockquote style={{ fontFamily: SERIF, fontSize: 'clamp(1.7rem,3.6vw,2.7rem)', fontWeight: 300, fontStyle: 'italic', lineHeight: 1.36, color: CREAM, margin: '1.8rem auto 0', maxWidth: 780 }}>
            &ldquo;A nutritional consultant had spent 12 years giving the same advice one-on-one. We packaged her method into a <span style={{ color: GOLD_LT }}>$47 digital toolkit</span>. In its first month, it out-earned two of her consulting clients combined — without a single extra coaching call.&rdquo;
          </blockquote>
          <div style={{ marginTop: '1.8rem', fontFamily: SANS, fontSize: 11, fontWeight: 700, letterSpacing: '.2em', textTransform: 'uppercase', color: GOLD_LT }}>Real client story from the book</div>
        </Reveal>
      </Section>

      {/* 08 — Bonuses */}
      <Section bg={WHITE} id="bonuses">
        <Reveal>
          <Kicker n="08">Included free</Kicker>
          <h2 style={{ ...H2, marginTop: '1rem' }}>The book gets you thinking. <em style={emGold}>The tools get you building.</em></h2>
          <p style={{ fontFamily: SANS, fontSize: '1.1rem', color: INK_MID, marginTop: '1rem' }}>Your {PRICE} includes four practical bonuses — led by 7 days of The5th AI, free.</p>
        </Reveal>
        <div className="ka-4col" style={{ marginTop: '2.6rem' }}>
          {BONUSES.map(([t, d, tag], i) => {
            const flagship = i === 0
            return (
              <Reveal key={t} delay={i * 60}>
                <div className="ka-lift" style={{ position: 'relative', background: flagship ? `linear-gradient(160deg,${PLUM},${NOIR})` : PARCH, color: flagship ? CREAM : INK, border: flagship ? `1px solid ${GOLD_LINE}` : `1px solid ${BORDER}`, borderRadius: 14, padding: '1.7rem 1.5rem', height: '100%', overflow: 'hidden' }}>
                  {flagship && <><div style={{ position: 'absolute', inset: 0, background: GRAIN, opacity: 0.07, mixBlendMode: 'overlay' }} /><div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg,transparent,${GOLD},transparent)` }} /></>}
                  <div style={{ position: 'relative' }}>
                    <span style={{ display: 'inline-block', fontFamily: SANS, fontSize: 9.5, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: flagship ? PLUM_DK : GOLD_INK, background: flagship ? `linear-gradient(180deg,${GOLD_LT},${GOLD})` : GOLD_SOFT, borderRadius: 999, padding: '.35rem .8rem' }}>{tag}</span>
                    <div style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: '2rem', fontWeight: 600, color: flagship ? GOLD_LT : GOLD_INK, marginTop: 14 }}>0{i + 1}</div>
                    <div style={{ fontFamily: SERIF, fontSize: '1.4rem', fontWeight: 600, color: flagship ? CREAM : INK, marginTop: 4, lineHeight: 1.12 }}>{t}</div>
                    <p style={{ fontFamily: SANS, fontSize: 13.5, color: flagship ? 'rgba(246,239,227,.82)' : INK_MUTE, marginTop: 10, lineHeight: 1.6 }}>{d}</p>
                  </div>
                </div>
              </Reveal>
            )
          })}
        </div>
        <Reveal delay={140} style={{ marginTop: '2.4rem', textAlign: 'center' }}>
          <p style={{ fontFamily: SERIF, fontSize: 'clamp(1.5rem,2.8vw,2rem)', fontStyle: 'italic', color: PLUM, lineHeight: 1.4 }}>Everything you need to stop thinking about your business — and start building it.</p>
        </Reveal>
      </Section>

      {/* 09 — Difference */}
      <Section bg={PARCH}>
        <Reveal>
          <Kicker n="09">Why it&apos;s different</Kicker>
          <h2 style={{ ...H2, marginTop: '1rem' }}>Most books give you ideas. <em style={emGold}>This one gives you homework — and a business.</em></h2>
        </Reveal>
        <div className="ka-3col" style={{ marginTop: '2.6rem' }}>
          {[
            ['Typical business book', ['Read.', 'Highlight.', 'Put it down.', 'Forget most of it.'], false],
            ['The Knowledge Asset', ['Read.', 'Answer.', 'Build.', 'Launch.', 'Learn.'], true],
            ['The outcome', ['A real product.', 'A real offer.', 'A real audience.', 'A real launch plan.'], false],
          ].map(([title, items, hl]) => (
            <Reveal key={title as string}>
              <div className="ka-lift" style={{ position: 'relative', background: hl ? `linear-gradient(160deg,${PLUM},${NOIR})` : WHITE, color: hl ? CREAM : INK, border: hl ? `1px solid ${GOLD_LINE}` : `1px solid ${BORDER}`, borderRadius: 14, padding: '1.8rem 1.6rem', height: '100%', overflow: 'hidden' }}>
                {hl && <div aria-hidden style={{ position: 'absolute', inset: 0, background: GRAIN, opacity: 0.06, mixBlendMode: 'overlay' }} />}
                <div style={{ position: 'relative' }}>
                  <div style={{ fontFamily: SANS, fontSize: 11, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', color: hl ? GOLD_LT : INK_MUTE }}>{title as string}</div>
                  <ul style={{ listStyle: 'none', margin: '1.1rem 0 0', display: 'grid', gap: 10 }}>
                    {(items as string[]).map((it) => (
                      <li key={it} style={{ display: 'flex', gap: 10, fontFamily: SERIF, fontSize: '1.35rem', color: hl ? CREAM : INK_MID }}>
                        <span style={{ color: hl ? GOLD_LT : GOLD_INK }}>{hl ? '✓' : '•'}</span>{it}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* 10 — Authors */}
      <Section bg={WHITE} id="authors">
        <Reveal style={{ textAlign: 'center' }}>
          <Kicker n="10" center>The authors</Kicker>
          <h2 style={{ ...H2, marginTop: '1rem' }}>Two authors. Two strengths. <em style={emItal}>One roadmap.</em></h2>
        </Reveal>
        <div className="ka-2col" style={{ marginTop: '2.8rem' }}>
          {[
            { name: 'Indrodip Ghosh', role: 'Digital Product Strategist · Co-Author', src: '/images/founder.png', initials: 'IG', copy: 'Indrodip brings the strategy and systems side of the book — business mechanics, digital products, scaling, and the market reality of building online. His chapters draw from years of building and rebuilding businesses, his work as a digital product strategist, and the real stories of 20+ clients he has guided toward their first $10K months. He also shares his own transition from a service business dependent on his time to digital products and coaching.' },
            { name: 'Christinee Mathison', role: 'Mindset Coach · Co-Author', src: '/images/christinee.png', initials: 'CM', copy: 'Christinee brings the transformation and clarity side — audience clarity, offer building, content, mindset, and the inner work required to show up consistently. Her chapters help readers understand who they are building for, package their expertise into an offer, communicate their value, and develop the mindset required for consistent action.' },
          ].map((a, i) => (
            <Reveal key={a.name} delay={i * 90}>
              <div className="ka-lift" style={{ background: PARCH, border: `1px solid ${BORDER}`, borderRadius: 16, padding: '2rem 1.8rem', height: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
                  <Avatar src={a.src} initials={a.initials} name={a.name} size={94} />
                  <div>
                    <div style={{ fontFamily: SERIF, fontSize: '1.7rem', fontWeight: 600, color: INK, lineHeight: 1.02 }}>{a.name}</div>
                    <div style={{ fontFamily: SANS, fontSize: 12.5, color: GOLD_INK, fontWeight: 600, marginTop: 6, letterSpacing: '.04em' }}>{a.role}</div>
                  </div>
                </div>
                <p style={{ fontFamily: SANS, fontSize: 15, color: INK_MID, marginTop: '1.3rem', lineHeight: 1.72 }}>{a.copy}</p>
              </div>
            </Reveal>
          ))}
        </div>
        <Reveal delay={140} style={{ textAlign: 'center', marginTop: '2.4rem' }}>
          <p style={{ fontFamily: SERIF, fontSize: 'clamp(1.5rem,2.6vw,2rem)', fontStyle: 'italic', color: PLUM }}>Two voices. One mission. One complete roadmap.</p>
        </Reveal>
      </Section>

      {/* 11 — Who it's for */}
      <Section bg={PARCH}>
        <div className="ka-2col" style={{ gap: 'clamp(32px,5vw,56px)' }}>
          <Reveal>
            <Kicker n="11">The fit</Kicker>
            <h2 style={{ ...H2, marginTop: '1rem' }}>This book is <em style={emItal}>for you</em> if…</h2>
            <ul style={{ listStyle: 'none', margin: '1.6rem 0 0', display: 'grid', gap: 12 }}>
              {FOR_YOU.map((t) => (
                <li key={t} style={{ display: 'flex', gap: 12, fontFamily: SANS, fontSize: '1rem', color: INK_MID, lineHeight: 1.5 }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={GOLD_INK} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 2 }} aria-hidden><polyline points="20 6 9 17 4 12" /></svg>{t}
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal delay={90}>
            <div style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 16, padding: '2rem 1.8rem', marginTop: '2.6rem' }}>
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

      {/* 12 — Offer + book showcase */}
      <Section bg={PLUM_DK} color={CREAM} id="offer" style={{ position: 'relative', overflow: 'hidden' }}>
        <div aria-hidden style={{ position: 'absolute', inset: 0, background: GRAIN, opacity: 0.06, mixBlendMode: 'overlay', pointerEvents: 'none' }} />
        <Reveal style={{ position: 'relative', textAlign: 'center', maxWidth: 760, margin: '0 auto' }}>
          <Kicker n="12" center onDark>The offer</Kicker>
          <h2 style={{ ...H2, marginTop: '1rem', color: CREAM }}>Your knowledge is already there. <em style={emGoldD}>Now build something with it.</em></h2>
        </Reveal>
        <div className="ka-2col" style={{ position: 'relative', marginTop: '3rem', alignItems: 'center', gap: 'clamp(32px,5vw,72px)' }}>
          <Reveal style={{ display: 'flex', justifyContent: 'center' }}><BookMockup w="min(330px,72vw)" /></Reveal>
          <Reveal delay={100} style={{ maxWidth: 560 }}>
            <div style={{ position: 'relative', background: `linear-gradient(180deg,${WHITE},${PARCH})`, color: INK, borderRadius: 18, padding: '2.2rem 1.9rem', boxShadow: '0 50px 100px rgba(15,6,20,.55)', border: `1px solid ${GOLD_LINE}`, overflow: 'hidden' }}>
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
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, justifyContent: 'center' }}>
                  <span style={{ fontFamily: SANS, fontSize: 16, color: INK_MUTE, textDecoration: 'line-through' }}>$47</span>
                  <div style={{ fontFamily: SERIF, fontSize: '3.6rem', fontWeight: 600, color: PLUM_DK, lineHeight: 1 }}>{PRICE}</div>
                </div>
                <div style={{ fontFamily: SANS, fontSize: 12.5, color: INK_MUTE, marginTop: 6 }}>One-time · Digital access · 365-day guarantee</div>
                <div style={{ marginTop: '1.2rem' }}><CTA label="Get The Knowledge Asset" /></div>
              </div>
            </div>
          </Reveal>
        </div>
      </Section>

      {/* 13 — BIG guarantee */}
      <Section bg={PARCH} style={{ padding: 'clamp(80px,10vw,140px) 1.25rem' }}>
        <div className="ka-guar">
          <Reveal style={{ display: 'flex', justifyContent: 'center' }}>
            <div style={{ position: 'relative', width: 'min(300px,74vw)', aspectRatio: '1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: `radial-gradient(circle at 50% 32%, ${GOLD_LT}, ${GOLD} 55%, ${GOLD_DK} 100%)`, boxShadow: '0 34px 74px rgba(184,152,63,.42), inset 0 2px 8px rgba(255,255,255,.55)' }} />
              <div style={{ position: 'absolute', inset: 16, borderRadius: '50%', border: `2px dashed rgba(46,26,53,.32)` }} />
              <div style={{ position: 'relative', textAlign: 'center', color: PLUM_DK }}>
                <div style={{ fontFamily: SANS, fontSize: 11, fontWeight: 700, letterSpacing: '.22em', textTransform: 'uppercase' }}>Money-Back</div>
                <div style={{ fontFamily: SERIF, fontSize: 'clamp(4.4rem,15vw,6.5rem)', fontWeight: 700, lineHeight: .82, margin: '.2rem 0' }}>365</div>
                <div style={{ fontFamily: SANS, fontSize: 13, fontWeight: 700, letterSpacing: '.34em', textTransform: 'uppercase' }}>Day Guarantee</div>
              </div>
            </div>
          </Reveal>
          <Reveal delay={90}>
            <Kicker n="13">Zero risk</Kicker>
            <h2 style={{ ...H2, marginTop: '1rem' }}>A full year to change your mind. <em style={emGold}>We&apos;re that confident.</em></h2>
            <p style={{ fontFamily: SANS, fontSize: '1.15rem', color: INK_MID, marginTop: '1.3rem', lineHeight: 1.8, maxWidth: 560 }}>
              We want you to actually use this book. Work through it. Complete the exercises. Build your product. Shape your offer. Plan your content. Launch. And if you decide it isn&apos;t right for you, you&apos;re protected by our full 365-day money-back guarantee.
            </p>
            <div style={{ marginTop: '1.8rem' }}><CTA label="Get The Book Risk-Free" /></div>
            <p style={{ fontFamily: SANS, fontSize: 12, color: INK_MUTE, marginTop: '1.2rem', maxWidth: 540 }}>365-day money-back guarantee applies to the purchase price and is subject to the published refund terms.</p>
          </Reveal>
        </div>
      </Section>

      {/* 14 — FAQ */}
      <Section bg={WHITE} id="faq">
        <Reveal style={{ maxWidth: 860, margin: '0 auto' }}>
          <Kicker n="14">Questions</Kicker>
          <h2 style={{ ...H2, marginTop: '1rem' }}>Everything you might <em style={emItal}>be wondering.</em></h2>
          <div style={{ marginTop: '1.8rem' }}>{FAQS.map(([q, a]) => <FAQItem key={q} q={q} a={a} />)}</div>
        </Reveal>
      </Section>

      {/* 15 — Final checkout */}
      <Section bg={NOIR} color={CREAM} id="checkout" style={{ position: 'relative', overflow: 'hidden' }}>
        <div aria-hidden style={{ position: 'absolute', inset: 0, background: GRAIN, opacity: 0.06, mixBlendMode: 'overlay', pointerEvents: 'none' }} />
        <Reveal style={{ position: 'relative', textAlign: 'center', maxWidth: 840, margin: '0 auto 2.6rem' }}>
          <Kicker n="15" center onDark>Begin</Kicker>
          <h2 style={{ ...H2, marginTop: '1rem', color: CREAM }}>You already know more than you think. <em style={emGoldD}>Now make it something people can buy.</em></h2>
          <p style={{ fontFamily: SANS, fontSize: '1.1rem', fontWeight: 300, color: 'rgba(246,239,227,.82)', marginTop: '1.3rem', lineHeight: 1.8 }}>
            No more years of planning. No more hundred videos. No complicated funnel. Just start — open the workbook, do the first exercise, build the first asset.
          </p>
        </Reveal>
        <Reveal delay={80} style={{ position: 'relative', maxWidth: 560, margin: '0 auto' }}>
          <CheckoutCard planId={planId} />
        </Reveal>
        <Reveal delay={120} style={{ position: 'relative', textAlign: 'center', marginTop: '2.6rem' }}>
          <div style={{ display: 'flex', gap: 22, justifyContent: 'center', flexWrap: 'wrap', fontFamily: SERIF, fontSize: 'clamp(1.1rem,2vw,1.5rem)', fontStyle: 'italic', letterSpacing: '.04em', color: GOLD_LT }}>
            <span>Read it.</span><span style={{ color: 'rgba(201,168,76,.4)' }}>/</span><span>Do the work.</span><span style={{ color: 'rgba(201,168,76,.4)' }}>/</span><span>Build the business.</span>
          </div>
        </Reveal>
      </Section>

      {/* Footer */}
      <footer style={{ background: PLUM_DEEP, color: 'rgba(246,239,227,.72)', padding: '3.6rem 1.25rem 2.6rem', borderTop: `1px solid ${GOLD_LINE}` }}>
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
      <div className="ka-sticky-cta" style={{ position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 50, background: `linear-gradient(180deg,${PLUM_DK},${NOIR})`, padding: '.6rem .9rem', borderTop: `1px solid ${GOLD_LINE}`, alignItems: 'center', justifyContent: 'center' }}>
        <a href="#buy" style={{ display: 'flex', width: '100%', minHeight: 52, alignItems: 'center', justifyContent: 'center', gap: 8, background: `linear-gradient(180deg,${GOLD_LT},${GOLD} 52%,${GOLD_DK})`, color: PLUM_DK, fontFamily: SANS, fontWeight: 700, fontSize: 15, borderRadius: 4, textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '.08em', boxShadow: 'inset 0 1px 0 rgba(255,255,255,.5)' }}>
          Get The Knowledge Asset — {PRICE}
        </a>
      </div>
    </div>
  )
}
