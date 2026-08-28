'use client'
/* ─────────────────────────────────────────────────────────────────────────
   THE KNOWLEDGE ASSET — rebuilt to live inside The5th Consulting family.

   Mirrors the homepage design system 1:1: warm parchment surfaces, plum
   Cormorant Garamond headings with italic emphasis, DM Sans body, GREEN as the
   primary CTA colour (gold is accent only), sharp-cornered cards with thin
   #DDD8CF borders, and the signature house components — gold "chapter"
   eyebrow, featured-in marquee, ink proof-strip, and the scrolling client
   testimonial cards (real The5th client results, reused honestly).

   Live Whop checkout embedded above the fold (#buy). The 7-day The5th AI
   trial is the flagship bonus. No fabricated book reviews.
   ───────────────────────────────────────────────────────────────────────── */
import { useEffect, useRef, useState, type ReactNode, type CSSProperties } from 'react'

/* ── House tokens (from the homepage) ─────────────────────────────────────── */
const PLUM = '#3D2645'
const PLUM_DK = '#2E1A35'
const GOLD = '#C9A84C'
const GOLD_SOFT = 'rgba(201,168,76,0.12)'
const GOLD_LINE = 'rgba(201,168,76,0.35)'
const GREEN = '#1C4A32'
const GREEN_DK = '#143826'
const PARCH = '#FAF6F0'
const PARCH_MID = '#F2EDE6'
const PARCH_DEEP = '#EAE3D8'
const INK = '#1A1A2E'
const INK_MID = '#403b3b'
const INK_MUTE = '#8A8075'
const BORDER = '#DDD8CF'
const WHITE = '#fff'

const SERIF = "'Cormorant Garamond', Georgia, Times, serif"
const SANS = "'DM Sans', system-ui, -apple-system, sans-serif"
const PRICE = '$7.93'

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
  const transition = reduce ? 'none' : `opacity .7s ease ${delay}ms, transform .7s cubic-bezier(.22,1,.36,1) ${delay}ms`
  return <div ref={ref} style={{ opacity: shown ? 1 : 0, transform: shown ? 'none' : 'translateY(20px)', transition, ...style }}>{children}</div>
}

/* ── Buttons — GREEN primary (house signature), gold nav, ghost ───────────── */
function Btn({ label, href = '#buy', variant = 'green', size = 'lg', style }: { label: string; href?: string; variant?: 'green' | 'gold' | 'ghost'; size?: 'lg' | 'md'; style?: CSSProperties }) {
  const pad = size === 'lg' ? '1.125rem 2.75rem' : '.85rem 1.7rem'
  const base: CSSProperties = { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontFamily: SANS, fontWeight: 700, fontSize: size === 'lg' ? '1rem' : '.8rem', letterSpacing: variant === 'gold' ? '.12em' : '.02em', textTransform: variant === 'gold' ? 'uppercase' : 'none', padding: pad, textDecoration: 'none', minHeight: 52, cursor: 'pointer', border: 'none', transition: 'transform .22s ease, box-shadow .22s ease, background .2s ease', ...style }
  if (variant === 'gold') return <a href={href} className="ka-btn ka-btn-gold" style={{ ...base, background: 'linear-gradient(180deg,#E4C879 0%,#C9A84C 55%,#B8983F 100%)', color: PLUM_DK, boxShadow: '0 6px 18px rgba(201,168,76,0.28), inset 0 1px 0 rgba(255,255,255,0.45)' }}>{label}</a>
  if (variant === 'ghost') return <a href={href} className="ka-btn ka-btn-ghost" style={{ ...base, background: 'transparent', color: GREEN, boxShadow: `inset 0 0 0 1.5px rgba(28,74,50,0.4)` }}>{label}</a>
  return <a href={href} className="ka-btn ka-btn-green" style={{ ...base, background: GREEN, color: WHITE, boxShadow: '0 8px 32px rgba(28,74,50,0.4)' }}>{label} <span aria-hidden style={{ fontSize: '1.1em' }}>→</span></a>
}

function Eyebrow({ children, center = false }: { children: ReactNode; center?: boolean }) {
  return <span style={{ display: 'block', fontFamily: SANS, fontSize: 12, fontWeight: 700, letterSpacing: '.16em', textTransform: 'uppercase', color: GOLD, textAlign: center ? 'center' : 'left' }}>{children}</span>
}

const H2: CSSProperties = { fontFamily: SERIF, fontWeight: 600, fontSize: 'clamp(2.25rem, 4.5vw, 3.75rem)', lineHeight: 1.02, letterSpacing: '-.03em', color: INK, margin: 0 }
const emItal: CSSProperties = { fontStyle: 'italic', fontWeight: 300, color: PLUM }

/* ── The book — premium plum + gold cover, soft product shadow ────────────── */
function BookShot({ w = 'min(340px, 76vw)' }: { w?: string }) {
  return (
    <div style={{ perspective: 1700, display: 'flex', justifyContent: 'center', width: '100%' }}>
      <div className="ka-book ka-float" style={{ position: 'relative', width: w, aspectRatio: '3 / 4.5', transformStyle: 'preserve-3d', transform: 'rotateY(-21deg) rotateX(5deg)' }}>
        <div style={{ position: 'absolute', top: 7, right: -14, width: 18, height: 'calc(100% - 14px)', background: 'linear-gradient(90deg,#f1e9d8,#d3c7ac)', transform: 'rotateY(90deg) translateZ(9px)', transformOrigin: 'right' }} />
        <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(160deg, ${PLUM} 0%, ${PLUM_DK} 62%, #241229 100%)`, boxShadow: `0 40px 70px rgba(46,26,53,.4), inset 0 0 0 1px ${GOLD_LINE}`, padding: '30px 26px', display: 'flex', flexDirection: 'column', color: PARCH }}>
          <div style={{ position: 'absolute', top: 0, left: 0, width: 11, height: '100%', background: 'linear-gradient(90deg, rgba(255,255,255,.16), rgba(255,255,255,0))' }} />
          <div style={{ position: 'absolute', inset: 13, border: `1px solid ${GOLD_LINE}`, pointerEvents: 'none' }} />
          <div style={{ fontFamily: SANS, fontSize: 9.5, fontWeight: 700, letterSpacing: '.24em', color: GOLD, textTransform: 'uppercase' }}>The 10K Roadmap Series</div>
          <div style={{ height: 1, background: `linear-gradient(90deg, ${GOLD}, transparent)`, margin: '16px 0 auto', width: '46%' }} />
          <h3 style={{ fontFamily: SERIF, fontWeight: 600, fontSize: 'clamp(28px, 7.4vw, 42px)', lineHeight: 0.98, letterSpacing: '-.02em', margin: 0, color: WHITE }}>
            THE<br />KNOWLEDGE<br /><em style={{ fontStyle: 'italic', fontWeight: 500, color: GOLD }}>ASSET</em>
          </h3>
          <p style={{ fontFamily: SANS, fontSize: 10.5, lineHeight: 1.45, color: 'rgba(250,246,240,.8)', marginTop: 14, fontWeight: 300 }}>Turn What You Know Into a $10K-a-Month Digital Business</p>
          <div style={{ marginTop: 'auto', paddingTop: 14, borderTop: `1px solid ${GOLD_LINE}`, fontFamily: SANS, fontSize: 9, letterSpacing: '.07em', color: 'rgba(250,246,240,.88)', textTransform: 'uppercase' }}>
            Indrodip Ghosh <span style={{ color: GOLD }}>&amp;</span> Christinee Mathison
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Author avatar (photo → initials) ─────────────────────────────────────── */
function Avatar({ src, initials, name, size = 92, ring = GOLD }: { src: string; initials: string; name: string; size?: number; ring?: string }) {
  const [err, setErr] = useState(false)
  if (err) return <div aria-label={name} style={{ width: size, height: size, borderRadius: '50%', background: `linear-gradient(160deg,${PARCH_MID},${PARCH_DEEP})`, border: `2px solid ${ring}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: SERIF, fontStyle: 'italic', fontSize: size * 0.34, color: PLUM, fontWeight: 600, flexShrink: 0 }}>{initials}</div>
  return <img src={src} alt={name} loading="lazy" onError={() => setErr(true)} style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', objectPosition: 'top center', border: `2px solid ${ring}`, flexShrink: 0 }} />
}

/* ── FAQ accordion ────────────────────────────────────────────────────────── */
function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ borderBottom: `1px solid ${BORDER}` }}>
      <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, background: 'none', border: 'none', cursor: 'pointer', padding: '1.5rem .1rem', textAlign: 'left', fontFamily: SANS, minHeight: 48 }}>
        <span style={{ fontFamily: SERIF, fontSize: 'clamp(1.3rem,2.4vw,1.7rem)', fontWeight: 600, color: INK, lineHeight: 1.12 }}>{q}</span>
        <span aria-hidden style={{ flexShrink: 0, width: 30, height: 30, border: `1px solid ${GOLD_LINE}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: GOLD, transform: open ? 'rotate(45deg)' : 'none', transition: 'transform .25s ease', fontSize: 22, lineHeight: 1 }}>+</span>
      </button>
      <div style={{ maxHeight: open ? 360 : 0, overflow: 'hidden', transition: 'max-height .34s ease' }}>
        <p style={{ fontFamily: SANS, fontSize: '1.0625rem', lineHeight: 1.7, color: INK_MID, padding: '0 .1rem 1.6rem', maxWidth: 720 }}>{a}</p>
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
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, background: WHITE, padding: 16 }}>
          {!slow ? (
            <><div style={{ width: 26, height: 26, borderRadius: '50%', border: '3px solid #eee', borderTopColor: GREEN, animation: 'ka-spin .8s linear infinite' }} /><p style={{ fontFamily: SANS, fontSize: 13, color: INK_MUTE, margin: 0 }}>Loading secure checkout…</p></>
          ) : (
            <><p style={{ fontFamily: SANS, fontSize: 13.5, color: INK, margin: 0, textAlign: 'center', fontWeight: 600 }}>Checkout is taking a moment.</p>
              <a href={hostedUrl} target="_top" style={{ display: 'inline-flex', minHeight: 52, alignItems: 'center', background: GREEN, color: WHITE, fontFamily: SANS, fontWeight: 700, fontSize: 15, padding: '.9rem 1.8rem', textDecoration: 'none' }}>Get instant access — {PRICE} →</a>
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
    <div style={{ background: WHITE, border: `1px solid ${BORDER}`, boxShadow: '0 24px 60px rgba(46,26,53,.16)', padding: '1.8rem 1.7rem', position: 'relative' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: GREEN }} />
      <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
        <div style={{ width: 56, height: 74, background: `linear-gradient(160deg,${PLUM},#241229)`, boxShadow: `inset 0 0 0 1px ${GOLD_LINE}`, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 4 }}>
          <span style={{ fontFamily: SERIF, fontSize: 9, color: GOLD, textAlign: 'center', lineHeight: 1.05, fontWeight: 600 }}>THE<br />KNOWLEDGE<br />ASSET</span>
        </div>
        <div>
          <Eyebrow>Digital Workbook</Eyebrow>
          <div style={{ fontFamily: SERIF, fontSize: '1.5rem', fontWeight: 600, color: INK, lineHeight: 1.02, marginTop: 3 }}>The Knowledge Asset</div>
          <div style={{ fontFamily: SANS, fontSize: 12.5, color: INK_MUTE, marginTop: 3 }}>Instant access + 4 bonuses</div>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 9, margin: '1.1rem 0 .2rem' }}>
        <span style={{ fontFamily: SANS, fontSize: 15, color: INK_MUTE, textDecoration: 'line-through' }}>$47</span>
        <span style={{ fontFamily: SERIF, fontSize: '3.4rem', fontWeight: 600, color: PLUM, lineHeight: 1, letterSpacing: '-.02em' }}>{PRICE}</span>
        <span style={{ fontFamily: SANS, fontSize: 13, color: INK_MUTE }}>one-time</span>
      </div>
      <div style={{ display: 'grid', gap: 7, margin: '.9rem 0 1.1rem', paddingTop: '.9rem', borderTop: `1px solid ${BORDER}` }}>
        {['The Knowledge Asset — 9 chapters', '7-day free trial of The5th AI', '90-Day Content Calendar', 'Product Blueprint + Offer Stack tools'].map((t) => (
          <div key={t} style={{ display: 'flex', gap: 10, fontFamily: SANS, fontSize: 13.5, color: INK_MID }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={GREEN} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 2 }} aria-hidden><polyline points="20 6 9 17 4 12" /></svg>{t}
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
const FEATURED = ['Forbes', 'HuffPost', 'TEDx', 'The Guardian', 'Yahoo Finance', 'The New York Times', 'Wall Street Journal']
const PROOF = [['76', '+', 'experts coached'], ['12', '', 'nations represented'], ['90', '', 'avg. days to first client'], ['4.8', '★', 'average client rating']]
const BUILD_STEPS = [
  ['01', 'Find Your Why', 'Get clear on why building an asset matters and what you are actually trying to create.'],
  ['02', 'Diagnose Your Situation', 'Understand where your business is today and what needs to change.'],
  ['03', 'Build the Asset Mindset', 'Shift from hours and availability to assets, leverage, and repeatable value.'],
  ['04', 'Find Your Perfect Audience', 'Identify the person you are actually building for.'],
  ['05', 'Design Your First Product', 'Turn your expertise into a specific product with a clear transformation.'],
  ['06', 'Build Offer + Content', 'Create an offer people understand and organic content that connects to it.'],
  ['07', 'Launch', 'Follow a practical launch plan and learn from real buyers.'],
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
/* "Fascination" bullets — curiosity-framed, each tied to a real chapter. */
const DISCOVER = [
  ['The counter-intuitive first move that matters more than any tactic — skip it and you stay stuck.', 'Ch. 1'],
  ['Why you don’t need a big audience, paid ads, or a team to earn your first digital dollar.', 'Ch. 3'],
  ['How to find the ONE person you’re really building for, so your offer finally clicks.', 'Ch. 4'],
  ['The simplest way to turn a skill you take for granted into a product people happily pay for.', 'Ch. 5'],
  ['The one-sentence “sales promise” that makes the right buyer think “I need this.”', 'Ch. 6'],
  ['A 90-day content system so you never stare at a blank screen wondering what to post.', 'Ch. 7'],
  ['The calm, no-anxiety way to launch and land your first buyers, without a complicated funnel.', 'Ch. 8'],
  ['The mindset shift that separates people who build $10K months from people who keep planning.', 'Ch. 9'],
]
const LADDER = [['$7', 'Ebook'], ['$27', 'Mini-Course'], ['$47', 'Toolkit'], ['$10', 'Strategy Call'], ['$1K–$5K', 'Coaching']]
const BONUSES = [
  ['7-Day Free Trial of The5th AI', 'Full access to The5th AI — your AI business co-pilot — free for 7 days. It works through the book with you: shaping your product, writing your offer, and drafting your content, live as you go.', 'Flagship bonus'],
  ['The 90-Day Content Calendar', '90 daily content topics, pre-planned phase-by-phase, so you never stare at a blank screen wondering what to post.', 'Bonus'],
  ['The Product Blueprint Template', 'A one-page product planning template that helps you turn your expertise into a concrete digital product.', 'Bonus'],
  ['The Offer Stack Builder', 'A fill-in-the-blank document that helps you build your complete offer description in under 30 minutes.', 'Bonus'],
]
/* Real The5th client results (reused from the homepage). Framed as client
   wins from the team behind the book — NOT as reviews of the book itself. */
const CLIENTS = [
  ['jeanne', 'Jeanne', '$8,000 in 8 weeks', 'Joined the program not knowing where to start. Eight weeks later I had closed my first two clients and was earning more than I ever imagined possible.'],
  ['seth', 'Seth', '2 high-ticket clients in 6 weeks', 'After revamping my offer with Indrodip’s framework, I sold two high-ticket packages within weeks. The clarity alone was worth the investment.'],
  ['hayley', 'Hayley', '$2,200 in 3 weeks', 'Three weeks into the program I had already made my investment back. I finally stopped undercharging and started owning the value I bring.'],
  ['laurie', 'Laurie', '$8,900 in 5 weeks', 'I came in sceptical. I left with nearly nine thousand dollars in new revenue and a business model that actually makes sense for my life.'],
  ['angela', 'Angela', '$2,500 in 6 weeks', 'Two thousand five hundred dollars in six weeks. I had never earned a cent from my own business before. The framework works if you work it.'],
  ['toril', 'Toril', 'Programme launched after 15 years', 'Fifteen years of corporate expertise sitting dormant. The5th helped me package it into a premium programme and take it back to market with confidence.'],
  ['abbas', 'Abbas', 'Amazon bestseller in 5 weeks', 'I never thought I would become a published author, let alone an Amazon bestseller. Five weeks after joining The5th, that is exactly what happened.'],
  ['gabe', 'Gabe', 'Launched after years of trying', 'I had been trying to launch my offer for years with nothing to show for it. The5th gave me the system and the accountability I had been missing.'],
]
const FOR_YOU = ['You are a coach, consultant, healer, creator, expert, or service provider.', 'You know you have valuable knowledge but do not know how to package it.', 'You are tired of trading your time for money.', 'You want to create a digital product.', 'You do not know exactly what to sell.', 'You are unsure who your ideal customer is.', 'You are posting content but not seeing a clear path to sales.', 'You want to build toward $10K/month.', 'You want a practical roadmap, not another theory-heavy book.', 'You are willing to actually do the work.']
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
  ['What is the $5K promise?', 'Work through the workbook and do the exercises — build the product, offer, and launch it walks you through. If you put in the work and do not build toward $5,000/month, request a full refund within 365 days and we will return every penny. It is a money-back guarantee on the purchase, not a guarantee of business results.'],
  ['Will this guarantee that I make $5,000 or $10,000/month?', 'No — those figures are the business-building targets the roadmap points you toward, not promised income. Your results depend on your execution, market, offer, audience, and consistency. What we do guarantee is your money back if you do the work and it does not work for you.'],
]

function Section({ id, bg = PARCH, color, children, style }: { id?: string; bg?: string; color?: string; children: ReactNode; style?: CSSProperties }) {
  return (
    <section id={id} style={{ background: bg, color: color || INK, padding: 'clamp(72px, 9vw, 128px) 1.25rem', ...style }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>{children}</div>
    </section>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════ */
export default function Workbook({ planId }: { planId: string }) {
  const NAV: [string, string][] = [['What You Build', '#build'], ['Inside', '#inside'], ['Bonuses', '#bonuses'], ['Authors', '#authors'], ['FAQ', '#faq']]

  return (
    <div style={{ fontFamily: SANS, color: INK, background: PARCH, overflowX: 'hidden' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,500;1,600&family=DM+Sans:wght@300;400;500;600;700&display=swap');
        html{scroll-behavior:smooth}
        .ka-btn:hover{transform:translateY(-2px)}
        .ka-btn-green:hover{background:${GREEN_DK}!important;box-shadow:0 14px 48px rgba(28,74,50,.5)!important}
        .ka-btn-gold:hover{background:linear-gradient(180deg,#EFD89A 0%,#D4B45A 55%,#C2A446 100%)!important}
        .ka-btn-ghost:hover{box-shadow:inset 0 0 0 1.5px ${GREEN}!important;color:${GREEN_DK}!important}
        @keyframes ka-spin{to{transform:rotate(360deg)}}
        @keyframes ka-float{0%,100%{transform:rotateY(-21deg) rotateX(5deg) translateY(0)}50%{transform:rotateY(-18deg) rotateX(5deg) translateY(-12px)}}
        .ka-float{animation:ka-float 7s ease-in-out infinite}
        @keyframes ka-marq{from{transform:translateX(0)}to{transform:translateX(-50%)}}
        .ka-marq{display:flex;width:max-content;animation:ka-marq 32s linear infinite}
        @keyframes ka-tmarq{from{transform:translateX(0)}to{transform:translateX(-50%)}}
        .ka-tmarq{display:flex;gap:1.5rem;width:max-content;animation:ka-tmarq 64s linear infinite}
        .ka-tmarq:hover{animation-play-state:paused}
        .ka-wrap{overflow:hidden;-webkit-mask-image:linear-gradient(to right,transparent,black 7%,black 93%,transparent);mask-image:linear-gradient(to right,transparent,black 7%,black 93%,transparent)}
        .ka-lift{transition:transform .3s ease, box-shadow .3s ease}
        .ka-lift:hover{transform:translateY(-4px);box-shadow:0 20px 44px rgba(46,26,53,.12)}
        .ka-hero{display:grid;grid-template-columns:1.05fr .95fr;gap:clamp(36px,5vw,72px);align-items:center}
        .ka-2col{display:grid;grid-template-columns:1fr 1fr;gap:28px}
        .ka-3col{display:grid;grid-template-columns:repeat(3,1fr);gap:20px}
        .ka-4col{display:grid;grid-template-columns:repeat(4,1fr);gap:18px}
        .ka-timeline{display:grid;grid-template-columns:repeat(7,1fr);gap:14px}
        .ka-nav-links{display:flex;gap:.2rem;align-items:center}
        .ka-ladder{display:flex;align-items:flex-end;justify-content:center;flex-wrap:wrap}
        .ka-guar{display:grid;grid-template-columns:.85fr 1.15fr;gap:clamp(36px,5vw,72px);align-items:center}
        .ka-proofstats{display:flex;justify-content:center;gap:clamp(28px,5vw,64px);flex-wrap:wrap;padding-top:3rem;border-top:1px solid rgba(255,255,255,.1)}
        .ka-sticky{display:none}
        /* Tablet */
        @media(max-width:1000px){
          .ka-hero{grid-template-columns:1fr;gap:40px}
          .ka-4col{grid-template-columns:1fr 1fr}
          .ka-3col{grid-template-columns:1fr 1fr}
          .ka-timeline{grid-template-columns:repeat(2,1fr);gap:22px 18px}
          .ka-nav-links{display:none}
          .ka-guar{grid-template-columns:1fr;gap:36px;text-align:center}
          .ka-discover{grid-template-columns:1fr!important}
          .ka-book-hero{max-width:300px;margin:0 auto}
        }
        /* Mobile */
        @media(max-width:760px){
          .ka-2col{grid-template-columns:1fr}
          .ka-3col{grid-template-columns:1fr}
          .ka-4col{grid-template-columns:1fr}
          .ka-timeline{grid-template-columns:1fr;gap:18px}
          .ka-sticky{display:flex}
          .ka-float{animation:none}
        }
        @media(max-width:480px){
          .ka-hero h1{font-size:clamp(2.2rem,8.4vw,2.9rem)!important}
        }
        @media(prefers-reduced-motion:reduce){.ka-float,.ka-btn,.ka-lift,.ka-marq,.ka-tmarq{animation:none;transition:none}}
      `}</style>

      {/* Nav — globalNav look */}
      <header style={{ position: 'sticky', top: 0, zIndex: 40, background: `linear-gradient(180deg,${PLUM_DK} 0%,#241229 100%)`, borderBottom: `1px solid ${GOLD_LINE}` }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '.7rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          <a href="#top" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
            <img src="/images/logo-header-white.png" alt="The5th Consulting" style={{ height: 34, width: 'auto' }} />
          </a>
          <nav className="ka-nav-links" aria-label="Sections">
            {NAV.map(([l, h]) => <a key={h} href={h} style={{ fontSize: '.72rem', fontWeight: 500, letterSpacing: '.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,.8)', textDecoration: 'none', padding: '0 1.1em' }}>{l}</a>)}
          </nav>
          <Btn label="Get the Book" href="#buy" variant="gold" size="md" />
        </div>
      </header>

      {/* HERO — plum, editorial, green CTA, avatar proof */}
      <div id="top" />
      <section style={{ position: 'relative', background: `radial-gradient(120% 100% at 80% 0%, ${PLUM} 0%, ${PLUM_DK} 55%, #241229 100%)`, color: WHITE, padding: 'clamp(52px,6vw,84px) 1.25rem clamp(44px,5vw,64px)', overflow: 'hidden' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div className="ka-hero">
            <div>
              <span style={{ display: 'inline-block', fontFamily: SANS, fontWeight: 700, fontSize: 11.5, letterSpacing: '.12em', textTransform: 'uppercase', color: GOLD, marginBottom: 18, background: GOLD_SOFT, border: `1px solid ${GOLD_LINE}`, borderRadius: 4, padding: '6px 12px' }}>Attention: coaches, consultants &amp; experts tired of trading time for money</span>
              <h1 style={{ fontFamily: SERIF, fontWeight: 600, fontSize: 'clamp(2.7rem, 5.8vw, 5rem)', lineHeight: 1.0, letterSpacing: '-.03em', margin: 0, color: WHITE }}>
                Turn what you already <span style={{ display: 'inline' }}>know</span> into a <em style={{ fontStyle: 'italic', fontWeight: 400, color: GOLD }}>$5,000-a-month</em> business.
              </h1>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginTop: '1.5rem', background: 'rgba(201,168,76,.1)', border: `1px solid ${GOLD_LINE}`, borderRadius: 6, padding: '.7rem 1.1rem' }}>
                <span aria-hidden style={{ color: GOLD, fontSize: 18 }}>✦</span>
                <span style={{ fontFamily: SANS, fontSize: 14.5, color: '#fff', fontWeight: 500, lineHeight: 1.4 }}><strong style={{ color: GOLD, fontWeight: 700 }}>Our promise:</strong> build it with this workbook, or get every penny back.</span>
              </div>
              <p style={{ fontFamily: SANS, fontSize: 'clamp(1rem,1.5vw,1.2rem)', fontWeight: 300, color: 'rgba(255,255,255,.82)', marginTop: '1.4rem', maxWidth: 500, lineHeight: 1.7 }}>
                <strong style={{ fontWeight: 600, color: WHITE }}>The Knowledge Asset</strong> is a build-as-you-go workbook. You don&apos;t just read it — you build your product, offer, audience, content, and launch inside it. From the team behind The5th Consulting.
              </p>
              <div style={{ marginTop: '1.8rem', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 16 }}>
                <Btn label={`Get the book — ${PRICE}`} href="#buy" />
                <span style={{ fontFamily: SANS, fontSize: 11, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: GOLD, background: GOLD_SOFT, border: `1px solid ${GOLD_LINE}`, borderRadius: 100, padding: '6px 16px' }}>+ Free 7-day The5th AI trial</span>
              </div>
              <p style={{ fontFamily: SANS, fontSize: 14, color: 'rgba(255,255,255,.7)', marginTop: '1rem' }}>Instant digital access · Work through it as you build</p>
              {/* author + brand proof */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: '1.9rem', paddingTop: '1.4rem', borderTop: `1px solid rgba(255,255,255,.14)` }}>
                <div style={{ display: 'flex' }}>
                  <Avatar src="/images/founder.png" initials="IG" name="Indrodip Ghosh" size={46} ring="rgba(255,255,255,.5)" />
                  <div style={{ marginLeft: -12 }}><Avatar src="/images/christinee.png" initials="CM" name="Christinee Mathison" size={46} ring="rgba(255,255,255,.5)" /></div>
                </div>
                <div style={{ fontFamily: SANS, fontSize: 13.5, color: 'rgba(255,255,255,.82)', lineHeight: 1.45 }}>
                  <span style={{ color: GOLD }}>★★★★</span><span style={{ color: 'rgba(201,168,76,.5)' }}>★</span> <strong style={{ color: '#fff' }}>4.8</strong> · By Indrodip Ghosh &amp; Christinee Mathison<br />
                  <span style={{ color: 'rgba(255,255,255,.65)' }}>The5th clients have generated <strong style={{ color: '#fff' }}>$15M+</strong> across 12 nations.</span>
                </div>
              </div>
            </div>
            <div className="ka-book-hero" style={{ display: 'flex', justifyContent: 'center' }}>
              <BookShot w="min(340px, 74vw)" />
            </div>
          </div>
        </div>
      </section>

      {/* Featured-in marquee (house component, real brand proof) */}
      <div style={{ background: PLUM, borderTop: `1px solid rgba(255,255,255,.08)`, padding: '2rem 0 2.2rem' }}>
        <p style={{ fontFamily: SANS, fontSize: 10.5, fontWeight: 700, letterSpacing: '.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,.35)', margin: '0 auto 1.2rem', maxWidth: 1200, padding: '0 1.25rem' }}>Our clients have been featured in</p>
        <div className="ka-wrap">
          <div className="ka-marq">
            {[...FEATURED, ...FEATURED, ...FEATURED].map((t, i) => (
              <span key={i} style={{ fontFamily: SERIF, fontSize: '1.35rem', fontWeight: 600, color: 'rgba(255,255,255,.55)', padding: '0 1.6rem', whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center', gap: '1.6rem' }}>{t}<span style={{ color: GOLD }}>•</span></span>
            ))}
          </div>
        </div>
      </div>

      {/* Problem */}
      <Section bg={PARCH} id="problem">
        <Reveal>
          <span className="gold-rule" style={{ display: 'block', width: 48, height: 2, background: GOLD, marginBottom: '1.4rem' }} />
          <h2 style={{ ...H2, maxWidth: 900 }}>You&apos;ve read enough. <em style={emItal}>Now build the thing.</em></h2>
          <div style={{ display: 'grid', gap: 16, marginTop: '1.6rem', maxWidth: 680, fontFamily: SANS, fontSize: '1.15rem', lineHeight: 1.75, color: INK_MID }}>
            <p>You&apos;ve saved the posts, watched the videos, bought the courses, taken the notes. But information was never the bottleneck — <strong style={{ color: INK, fontWeight: 600 }}>execution is.</strong></p>
            <p>If your income still depends on you showing up for every client, every call, every hour and every dollar, you haven&apos;t built an asset yet. You&apos;ve built yourself another job. <em style={{ fontStyle: 'italic', color: PLUM, fontFamily: SERIF, fontSize: '1.4rem' }}>The Knowledge Asset changes that.</em></p>
          </div>
        </Reveal>
        <Reveal delay={80} style={{ marginTop: '2.8rem' }}>
          <div className="ka-2col">
            <div style={{ background: WHITE, border: `1px solid ${BORDER}`, padding: '1.9rem 1.7rem' }}>
              <Eyebrow>Trading time for money</Eyebrow>
              <ul style={{ listStyle: 'none', margin: '1.1rem 0 0', display: 'grid', gap: 12 }}>
                {['Your income depends on your time.', 'Every client requires you.', 'You start from zero every month.', 'You constantly sell your availability.'].map((t) => (
                  <li key={t} style={{ display: 'flex', gap: 12, fontFamily: SANS, fontSize: '1rem', color: INK_MID }}><span style={{ color: '#b06a52' }}>✕</span>{t}</li>
                ))}
              </ul>
            </div>
            <div style={{ background: `linear-gradient(160deg,${PLUM},${PLUM_DK})`, border: `1px solid ${GOLD_LINE}`, padding: '1.9rem 1.7rem', color: PARCH }}>
              <Eyebrow>Building a knowledge asset</Eyebrow>
              <ul style={{ listStyle: 'none', margin: '1.1rem 0 0', display: 'grid', gap: 12 }}>
                {['Create once.', 'Sell repeatedly.', 'Build a product ladder.', 'Create leverage.', 'Build an asset around your expertise.'].map((t) => (
                  <li key={t} style={{ display: 'flex', gap: 12, fontFamily: SANS, fontSize: '1rem', color: 'rgba(250,246,240,.94)' }}><span style={{ color: GOLD }}>✓</span>{t}</li>
                ))}
              </ul>
            </div>
          </div>
        </Reveal>
      </Section>

      {/* Premise */}
      <Section bg={PARCH_MID}>
        <Reveal style={{ textAlign: 'center', maxWidth: 820, margin: '0 auto' }}>
          <Eyebrow center>The premise</Eyebrow>
          <h2 style={{ ...H2, marginTop: '1rem' }}>The most valuable thing you own is <em style={emItal}>what you already know.</em></h2>
          <p style={{ fontFamily: SANS, fontSize: '1.15rem', lineHeight: 1.8, color: INK_MID, marginTop: '1.4rem' }}>
            You&apos;ve solved problems, learned lessons, developed skills, and lived through transformations other people are still trying to figure out.
          </p>
          <p style={{ fontFamily: SERIF, fontSize: 'clamp(1.5rem,3.2vw,2.2rem)', color: INK, marginTop: '1.6rem', lineHeight: 1.34 }}>
            The question was never <span style={{ color: INK_MUTE, fontStyle: 'italic' }}>&ldquo;Do I know enough?&rdquo;</span><br />It&apos;s <em style={{ fontStyle: 'italic', color: PLUM }}>&ldquo;How do I package it so someone can buy it?&rdquo;</em>
          </p>
        </Reveal>
      </Section>

      {/* What you build */}
      <Section bg={WHITE} id="build">
        <Reveal>
          <Eyebrow>What you&apos;ll build</Eyebrow>
          <h2 style={{ ...H2, marginTop: '.8rem' }}>Don&apos;t just read the book. <em style={emItal}>Build your business inside it.</em></h2>
          <p style={{ fontFamily: SANS, fontSize: '1.15rem', color: INK_MID, marginTop: '1rem', maxWidth: 620 }}>Every section moves you from thinking to doing.</p>
        </Reveal>
        <Reveal delay={80} style={{ marginTop: '2.8rem' }}>
          <div className="ka-timeline">
            {BUILD_STEPS.map(([n, t, d]) => (
              <div key={n} style={{ borderTop: `2px solid ${GOLD_SOFT}`, paddingTop: 18, position: 'relative' }}>
                <span style={{ position: 'absolute', top: -9, left: 0, width: 15, height: 15, borderRadius: '50%', background: GOLD, boxShadow: `0 0 0 4px ${WHITE}` }} />
                <div style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: '2rem', fontWeight: 600, color: PLUM }}>{n}</div>
                <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 15, color: INK, marginTop: 6, lineHeight: 1.25 }}>{t}</div>
                <p style={{ fontFamily: SANS, fontSize: 13, color: INK_MUTE, marginTop: 8, lineHeight: 1.55 }}>{d as string}</p>
              </div>
            ))}
          </div>
        </Reveal>
        <Reveal delay={120} style={{ marginTop: '2.8rem', textAlign: 'center' }}><Btn label={`Start building — ${PRICE}`} /></Reveal>
      </Section>

      {/* Inside */}
      <Section bg={PARCH} id="inside">
        <Reveal>
          <Eyebrow>Inside the book</Eyebrow>
          <h2 style={{ ...H2, marginTop: '.8rem' }}>Nine chapters. Zero fluff. <em style={emItal}>One asset at the end.</em></h2>
        </Reveal>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16, marginTop: '2.4rem' }}>
          {CHAPTERS.map(([t, d], i) => (
            <Reveal key={t} delay={i * 40} style={{ height: '100%' }}>
              <div className="ka-lift" style={{ background: WHITE, border: `1px solid ${BORDER}`, padding: '1.6rem 1.5rem', height: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
                  <span style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: '1.7rem', fontWeight: 600, color: GOLD }}>{String(i + 1).padStart(2, '0')}</span>
                  <span style={{ fontFamily: SANS, fontSize: 10.5, fontWeight: 700, letterSpacing: '.14em', color: INK_MUTE }}>CHAPTER</span>
                </div>
                <div style={{ fontFamily: SERIF, fontSize: '1.45rem', fontWeight: 600, color: INK, marginTop: 8, lineHeight: 1.12 }}>{t}</div>
                <p style={{ fontFamily: SANS, fontSize: 14, color: INK_MUTE, marginTop: 8, lineHeight: 1.55 }}>{d}</p>
              </div>
            </Reveal>
          ))}
        </div>
        <Reveal delay={120} style={{ marginTop: '2.75rem' }}>
          <div style={{ background: `linear-gradient(160deg,${PLUM},${PLUM_DK})`, color: PARCH, padding: '2.8rem 2.2rem', border: `1px solid ${GOLD_LINE}` }}>
            <Eyebrow>Plus · the finale</Eyebrow>
            <div style={{ fontFamily: SERIF, fontSize: '1.9rem', fontWeight: 600, marginTop: 18, color: WHITE, lineHeight: 1.1 }}>Your Next 24 Hours</div>
            <p style={{ fontFamily: SANS, fontSize: 14.5, fontWeight: 300, color: 'rgba(250,246,240,.82)', marginTop: 12, maxWidth: 640, lineHeight: 1.6 }}>A practical, action-focused conclusion designed to get you moving immediately — not someday.</p>
          </div>
        </Reveal>
      </Section>

      {/* What you'll discover — Sell-Like-Crazy fascination bullets */}
      <Section bg={PLUM_DK} color={PARCH} style={{ position: 'relative', overflow: 'hidden' }}>
        <Reveal style={{ maxWidth: 860, margin: '0 auto', textAlign: 'center' }}>
          <Eyebrow center>What you&apos;ll discover inside</Eyebrow>
          <h2 style={{ ...H2, marginTop: '.8rem', color: WHITE }}>A few of the things you&apos;ll walk away <em style={{ fontStyle: 'italic', fontWeight: 300, color: GOLD }}>knowing how to do.</em></h2>
        </Reveal>
        <Reveal delay={80} style={{ maxWidth: 900, margin: '2.6rem auto 0' }}>
          <div className="ka-discover" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,340px),1fr))', gap: '14px 28px' }}>
            {DISCOVER.map(([t, ch]) => (
              <div key={t as string} style={{ display: 'flex', gap: 14, alignItems: 'flex-start', padding: '4px 0' }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 3 }} aria-hidden><polyline points="20 6 9 17 4 12" /></svg>
                <p style={{ fontFamily: SANS, fontSize: '1.05rem', lineHeight: 1.6, color: 'rgba(250,246,240,.9)', margin: 0 }}>{t}<span style={{ color: GOLD, fontFamily: SANS, fontSize: 12, fontWeight: 700, letterSpacing: '.04em', marginLeft: 8, whiteSpace: 'nowrap' }}>{ch}</span></p>
              </div>
            ))}
          </div>
        </Reveal>
        <Reveal delay={120} style={{ textAlign: 'center', marginTop: '2.6rem' }}>
          <p style={{ fontFamily: SERIF, fontSize: 'clamp(1.3rem,2.4vw,1.8rem)', fontStyle: 'italic', color: GOLD, marginBottom: '1.4rem' }}>…and that&apos;s barely scratching the surface.</p>
          <Btn label={`Get the book — ${PRICE}`} />
        </Reveal>
      </Section>

      {/* Workbook method */}
      <Section bg={WHITE}>
        <div className="ka-2col" style={{ alignItems: 'center', gap: 'clamp(32px,5vw,64px)' }}>
          <Reveal>
            <Eyebrow>The method</Eyebrow>
            <h2 style={{ ...H2, marginTop: '.8rem' }}>Not a book you finish. <em style={emItal}>A business you build.</em></h2>
            <p style={{ fontFamily: SANS, fontSize: '1.1rem', color: INK_MID, marginTop: '1.3rem', lineHeight: 1.8, maxWidth: 520 }}>
              Each chapter moves you forward. You&apos;ll answer questions, choose your audience, develop your product, shape your offer, plan your content, set your launch, and commit to the next action.
            </p>
            <p style={{ fontFamily: SERIF, fontSize: '1.5rem', color: INK, marginTop: '1.1rem', fontStyle: 'italic' }}>The goal isn&apos;t to highlight every page. It&apos;s to finish with something real.</p>
          </Reveal>
          <Reveal delay={100}>
            <div style={{ display: 'grid', gap: 12 }}>
              {WORKBOOK_PAGES.map((p, i) => (
                <div key={p} className="ka-lift" style={{ display: 'flex', alignItems: 'center', gap: 16, background: PARCH, border: `1px solid ${BORDER}`, borderLeft: `3px solid ${GOLD}`, padding: '1.05rem 1.15rem' }}>
                  <span style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: 18, color: PLUM, fontWeight: 600, width: 26 }}>{String(i + 1).padStart(2, '0')}</span>
                  <span style={{ fontFamily: SANS, fontSize: 15.5, fontWeight: 500, color: INK }}>{p}</span>
                  <span style={{ marginLeft: 'auto', fontFamily: SERIF, fontSize: 14, color: INK_MUTE, fontStyle: 'italic' }}>your answer →</span>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </Section>

      {/* Ladder */}
      <Section bg={PARCH_MID}>
        <Reveal style={{ textAlign: 'center', maxWidth: 800, margin: '0 auto' }}>
          <Eyebrow center>The economics</Eyebrow>
          <h2 style={{ ...H2, marginTop: '.8rem' }}>One idea. <em style={emItal}>A whole ladder of income.</em></h2>
          <p style={{ fontFamily: SANS, fontSize: '1.1rem', color: INK_MID, marginTop: '1.1rem', lineHeight: 1.7 }}>You don&apos;t need one giant offer. You build a connected product ladder around the same person.</p>
        </Reveal>
        <Reveal delay={100} style={{ marginTop: '2.8rem' }}>
          <div className="ka-ladder">
            {LADDER.map(([price, label], i) => (
              <div key={label} style={{ display: 'flex', alignItems: 'flex-end' }}>
                <div className="ka-lift" style={{ textAlign: 'center', background: i === LADDER.length - 1 ? `linear-gradient(160deg,${PLUM},${PLUM_DK})` : WHITE, color: i === LADDER.length - 1 ? PARCH : INK, border: i === LADDER.length - 1 ? `1px solid ${GOLD_LINE}` : `1px solid ${BORDER}`, padding: '1.15rem 1.25rem', minWidth: 118, marginBottom: i * 9 }}>
                  <div style={{ fontFamily: SERIF, fontSize: 'clamp(1.5rem,3vw,2rem)', fontWeight: 600, color: i === LADDER.length - 1 ? GOLD : PLUM }}>{price}</div>
                  <div style={{ fontFamily: SANS, fontSize: 11, fontWeight: 600, letterSpacing: '.1em', textTransform: 'uppercase', color: i === LADDER.length - 1 ? 'rgba(250,246,240,.7)' : INK_MUTE, marginTop: 4 }}>{label}</div>
                </div>
                {i < LADDER.length - 1 && <span aria-hidden style={{ color: GOLD, fontSize: 22, margin: '0 4px 24px' }}>↗</span>}
              </div>
            ))}
          </div>
        </Reveal>
        <Reveal delay={140} style={{ textAlign: 'center', maxWidth: 640, margin: '2.4rem auto 0' }}>
          <p style={{ fontFamily: SERIF, fontSize: '1.5rem', fontStyle: 'italic', color: PLUM, lineHeight: 1.4 }}>Start small. Prove demand. Go deeper. Build leverage.</p>
        </Reveal>
      </Section>

      {/* Proof strip (house component, on ink) */}
      <section style={{ background: INK, padding: 'clamp(64px,8vw,88px) 1.25rem', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <span aria-hidden style={{ position: 'absolute', top: '-3rem', left: '50%', transform: 'translateX(-50%)', fontFamily: SERIF, fontSize: '20rem', fontWeight: 300, color: 'rgba(255,255,255,.03)', lineHeight: 1, pointerEvents: 'none' }}>&ldquo;</span>
        <Reveal style={{ position: 'relative', maxWidth: 1000, margin: '0 auto' }}>
          <span style={{ display: 'block', fontFamily: SANS, fontSize: 11, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,.35)', marginBottom: '1.4rem' }}>The team behind the book</span>
          <span style={{ display: 'block', fontFamily: SERIF, fontSize: 'clamp(2.6rem,11vw,8rem)', fontWeight: 700, color: WHITE, lineHeight: 1, letterSpacing: '-.04em', marginBottom: '3rem' }}>$15,000,000</span>
          <div className="ka-proofstats">
            {PROOF.map(([fig, sup, label]) => (
              <div key={label}>
                <span style={{ fontFamily: SERIF, fontSize: 'clamp(2.4rem,5vw,3.8rem)', fontWeight: 600, color: WHITE, display: 'block', lineHeight: 1, letterSpacing: '-.03em' }}>{fig}<sup style={{ fontSize: '.4em', color: GOLD }}>{sup}</sup></span>
                <span style={{ fontFamily: SANS, fontSize: 12.5, color: 'rgba(255,255,255,.45)', marginTop: 8, display: 'block', letterSpacing: '.04em', textTransform: 'uppercase', fontWeight: 500 }}>{label}</span>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      {/* Real client story */}
      <Section bg={PARCH}>
        <Reveal style={{ maxWidth: 860, margin: '0 auto', textAlign: 'center' }}>
          <Eyebrow center>Real client story</Eyebrow>
          <h2 style={{ ...H2, marginTop: '.9rem' }}>What happens when expertise <em style={emItal}>becomes an asset?</em></h2>
          <blockquote style={{ fontFamily: SERIF, fontSize: 'clamp(1.5rem,3.2vw,2.2rem)', fontWeight: 300, fontStyle: 'italic', lineHeight: 1.4, color: INK, margin: '1.8rem auto 0', maxWidth: 760, borderTop: `1px solid ${BORDER}`, borderBottom: `1px solid ${BORDER}`, padding: '1.8rem 0' }}>
            A nutritional consultant had spent 12 years giving the same advice one-on-one. We packaged her method into a <span style={{ color: PLUM }}>$47 digital toolkit</span>. In its first month, it out-earned two of her consulting clients combined — without a single extra coaching call.
          </blockquote>
          <div style={{ marginTop: '1.4rem', fontFamily: SANS, fontSize: 11, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', color: INK_MUTE }}>Real client story from the book</div>
        </Reveal>
      </Section>

      {/* Real The5th client results — testimonial strip */}
      <div style={{ background: PARCH, borderTop: `1px solid ${BORDER}`, borderBottom: `1px solid ${BORDER}`, padding: 'clamp(48px,6vw,72px) 0' }}>
        <div style={{ textAlign: 'center', maxWidth: 720, margin: '0 auto 2.4rem', padding: '0 1.25rem' }}>
          <Eyebrow center>From the community</Eyebrow>
          <h2 style={{ ...H2, marginTop: '.7rem', fontSize: 'clamp(1.9rem,3.6vw,2.8rem)' }}>Real results from clients of <em style={emItal}>The5th.</em></h2>
          <p style={{ fontFamily: SANS, fontSize: '.95rem', color: INK_MUTE, marginTop: '.8rem' }}>The same system this workbook teaches. (Client results, not book reviews.)</p>
        </div>
        <div className="ka-wrap">
          <div className="ka-tmarq">
            {[...CLIENTS, ...CLIENTS].map(([img, name, result, quote], i) => (
              <div key={i} style={{ background: WHITE, border: `1px solid ${BORDER}`, padding: '2rem', width: 340, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '1.15rem', position: 'relative' }}>
                <span aria-hidden style={{ position: 'absolute', top: '1rem', right: '1.5rem', fontFamily: SERIF, fontSize: '4rem', color: GOLD, opacity: .3, lineHeight: 1 }}>&ldquo;</span>
                <div style={{ width: 52, height: 52, borderRadius: '50%', overflow: 'hidden', border: `2px solid ${GOLD}` }}>
                  <Avatar src={`/clients/${img}.jpg`} initials={(name as string)[0]} name={name as string} size={48} />
                </div>
                <p style={{ fontFamily: SERIF, fontSize: '1.375rem', fontWeight: 600, color: PLUM, lineHeight: 1.2, letterSpacing: '-.01em' }}>{result}</p>
                <p style={{ fontFamily: SANS, fontSize: '.9375rem', color: INK_MID, lineHeight: 1.7, fontStyle: 'italic' }}>&ldquo;{quote}&rdquo;</p>
                <p style={{ fontFamily: SANS, fontSize: '.75rem', fontWeight: 600, color: INK_MUTE, textTransform: 'uppercase', letterSpacing: '.08em', marginTop: 'auto', paddingTop: '1rem', borderTop: `1px solid ${BORDER}` }}>{name}, The5th client</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bonuses */}
      <Section bg={WHITE} id="bonuses">
        <Reveal>
          <Eyebrow>Included free</Eyebrow>
          <h2 style={{ ...H2, marginTop: '.8rem' }}>The book gets you thinking. <em style={emItal}>The tools get you building.</em></h2>
          <p style={{ fontFamily: SANS, fontSize: '1.1rem', color: INK_MID, marginTop: '1rem' }}>Your {PRICE} includes four practical bonuses — led by 7 days of The5th AI, free.</p>
        </Reveal>
        <div className="ka-4col" style={{ marginTop: '2.6rem' }}>
          {BONUSES.map(([t, d, tag], i) => {
            const flagship = i === 0
            return (
              <Reveal key={t} delay={i * 60}>
                <div className="ka-lift" style={{ background: flagship ? `linear-gradient(160deg,${PLUM},${PLUM_DK})` : PARCH, color: flagship ? PARCH : INK, border: flagship ? `1px solid ${GOLD_LINE}` : `1px solid ${BORDER}`, padding: '1.7rem 1.5rem', height: '100%', position: 'relative' }}>
                  <span style={{ display: 'inline-block', fontFamily: SANS, fontSize: 9.5, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: flagship ? PLUM_DK : GOLD, background: flagship ? 'linear-gradient(180deg,#E4C879,#C9A84C)' : GOLD_SOFT, padding: '.35rem .8rem' }}>{tag}</span>
                  <div style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: '2rem', fontWeight: 600, color: flagship ? GOLD : PLUM, marginTop: 14 }}>0{i + 1}</div>
                  <div style={{ fontFamily: SERIF, fontSize: '1.4rem', fontWeight: 600, color: flagship ? WHITE : INK, marginTop: 4, lineHeight: 1.12 }}>{t}</div>
                  <p style={{ fontFamily: SANS, fontSize: 13.5, color: flagship ? 'rgba(250,246,240,.82)' : INK_MUTE, marginTop: 10, lineHeight: 1.6 }}>{d}</p>
                </div>
              </Reveal>
            )
          })}
        </div>
      </Section>

      {/* Difference */}
      <Section bg={PARCH_MID}>
        <Reveal>
          <Eyebrow>Why it&apos;s different</Eyebrow>
          <h2 style={{ ...H2, marginTop: '.8rem' }}>Most books give you ideas. <em style={emItal}>This one gives you work to do.</em></h2>
        </Reveal>
        <div className="ka-3col" style={{ marginTop: '2.6rem' }}>
          {[
            ['Typical business book', ['Read.', 'Highlight.', 'Put it down.', 'Forget most of it.'], false],
            ['The Knowledge Asset', ['Read.', 'Answer.', 'Build.', 'Launch.', 'Learn.'], true],
            ['The outcome', ['A real product.', 'A real offer.', 'A real audience.', 'A real launch plan.'], false],
          ].map(([title, items, hl]) => (
            <Reveal key={title as string}>
              <div className="ka-lift" style={{ background: hl ? `linear-gradient(160deg,${PLUM},${PLUM_DK})` : WHITE, color: hl ? PARCH : INK, border: hl ? `1px solid ${GOLD_LINE}` : `1px solid ${BORDER}`, padding: '1.8rem 1.6rem', height: '100%' }}>
                <div style={{ fontFamily: SANS, fontSize: 11, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', color: hl ? GOLD : INK_MUTE }}>{title as string}</div>
                <ul style={{ listStyle: 'none', margin: '1.1rem 0 0', display: 'grid', gap: 10 }}>
                  {(items as string[]).map((it) => (
                    <li key={it} style={{ display: 'flex', gap: 10, fontFamily: SERIF, fontSize: '1.35rem', color: hl ? WHITE : INK_MID }}>
                      <span style={{ color: hl ? GOLD : GREEN }}>{hl ? '✓' : '•'}</span>{it}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* Authors */}
      <Section bg={WHITE} id="authors">
        <Reveal style={{ textAlign: 'center' }}>
          <Eyebrow center>The authors</Eyebrow>
          <h2 style={{ ...H2, marginTop: '.8rem' }}>Two authors. Two strengths. <em style={emItal}>One roadmap.</em></h2>
        </Reveal>
        <div className="ka-2col" style={{ marginTop: '2.8rem' }}>
          {[
            { name: 'Indrodip Ghosh', role: 'Digital Product Strategist · Co-Author', src: '/images/founder.png', initials: 'IG', copy: 'Indrodip brings the strategy and systems side of the book — business mechanics, digital products, scaling, and the market reality of building online. His chapters draw from years of building and rebuilding businesses and the real stories of 20+ clients he has guided toward their first $10K months. He also shares his own transition from a service business dependent on his time to digital products and coaching.' },
            { name: 'Christinee Mathison', role: 'Mindset Coach · Co-Author', src: '/images/christinee.png', initials: 'CM', copy: 'Christinee brings the transformation and clarity side — audience clarity, offer building, content, mindset, and the inner work required to show up consistently. Her chapters help readers understand who they are building for, package their expertise into an offer, communicate their value, and develop the mindset required for consistent action.' },
          ].map((a, i) => (
            <Reveal key={a.name} delay={i * 90}>
              <div className="ka-lift" style={{ background: PARCH, border: `1px solid ${BORDER}`, padding: '2rem 1.8rem', height: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
                  <Avatar src={a.src} initials={a.initials} name={a.name} size={92} />
                  <div>
                    <div style={{ fontFamily: SERIF, fontSize: '1.7rem', fontWeight: 600, color: INK, lineHeight: 1.02 }}>{a.name}</div>
                    <div style={{ fontFamily: SANS, fontSize: 12.5, color: GOLD, fontWeight: 700, marginTop: 6, letterSpacing: '.04em', textTransform: 'uppercase' }}>{a.role}</div>
                  </div>
                </div>
                <p style={{ fontFamily: SANS, fontSize: 15, color: INK_MID, marginTop: '1.3rem', lineHeight: 1.72 }}>{a.copy}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* Who it's for */}
      <Section bg={PARCH_MID}>
        <div className="ka-2col" style={{ gap: 'clamp(32px,5vw,56px)' }}>
          <Reveal>
            <Eyebrow>The fit</Eyebrow>
            <h2 style={{ ...H2, marginTop: '.8rem' }}>This book is <em style={emItal}>for you</em> if…</h2>
            <ul style={{ listStyle: 'none', margin: '1.6rem 0 0', display: 'grid', gap: 12 }}>
              {FOR_YOU.map((t) => (
                <li key={t} style={{ display: 'flex', gap: 12, fontFamily: SANS, fontSize: '1rem', color: INK_MID, lineHeight: 1.5 }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={GREEN} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 2 }} aria-hidden><polyline points="20 6 9 17 4 12" /></svg>{t}
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal delay={90}>
            <div style={{ background: WHITE, border: `1px solid ${BORDER}`, padding: '2rem 1.8rem', marginTop: '2.6rem' }}>
              <h3 style={{ fontFamily: SERIF, fontSize: 'clamp(1.6rem,3vw,2.2rem)', fontWeight: 600, color: INK, margin: 0 }}>It&apos;s <em style={{ fontStyle: 'italic', color: PLUM }}>not</em> for you if…</h3>
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

      {/* Offer + book showcase */}
      <Section bg={WHITE} id="offer">
        <div id="buy" style={{ scrollMarginTop: 80 }} />
        <Reveal style={{ textAlign: 'center', maxWidth: 760, margin: '0 auto' }}>
          <Eyebrow center>The offer</Eyebrow>
          <h2 style={{ ...H2, marginTop: '.8rem' }}>Your knowledge is already there. <em style={emItal}>Now build something with it.</em></h2>
        </Reveal>
        <div className="ka-2col" style={{ marginTop: '3rem', alignItems: 'start', gap: 'clamp(32px,5vw,64px)' }}>
          {/* Left — full value stack */}
          <Reveal>
            <div style={{ background: PARCH, border: `1px solid ${BORDER}`, padding: '2rem 1.8rem' }}>
              <div style={{ fontFamily: SERIF, fontSize: '1.7rem', fontWeight: 600, color: INK }}>What&apos;s included</div>
              <ul style={{ listStyle: 'none', margin: '1.3rem 0 0', display: 'grid', gap: 11 }}>
                {OFFER_INCLUDES.map((t) => (
                  <li key={t} style={{ display: 'flex', gap: 11, fontFamily: SANS, fontSize: 15, color: INK_MID }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={GREEN} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 3 }} aria-hidden><polyline points="20 6 9 17 4 12" /></svg>{t}
                  </li>
                ))}
              </ul>
              <div style={{ margin: '1.4rem 0 0', paddingTop: '1.2rem', borderTop: `1px solid ${BORDER}`, display: 'grid', gap: 10 }}>
                {['7-Day Free Trial of The5th AI', '90-Day Content Calendar', 'Product Blueprint Template', 'Offer Stack Builder'].map((t, i) => (
                  <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 11, fontFamily: SANS, fontSize: 15, color: INK_MID }}>
                    <span style={{ fontFamily: SANS, fontSize: 9.5, fontWeight: 700, letterSpacing: '.06em', color: PLUM_DK, background: 'linear-gradient(180deg,#E4C879,#C9A84C)', padding: '.28rem .6rem', whiteSpace: 'nowrap' }}>{i === 0 ? 'FREE 7 DAYS' : 'BONUS'}</span>{t}
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
          {/* Right — the live checkout */}
          <Reveal delay={100}><CheckoutCard planId={planId} /></Reveal>
        </div>
      </Section>

      {/* Guarantee — the $5K promise */}
      <Section bg={PLUM_DK} color={PARCH} style={{ padding: 'clamp(80px,10vw,140px) 1.25rem' }}>
        <div className="ka-guar">
          <Reveal style={{ display: 'flex', justifyContent: 'center' }}>
            <div style={{ position: 'relative', width: 'min(300px,74vw)', aspectRatio: '1', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', background: `radial-gradient(circle at 50% 34%, #4E3158, ${PLUM_DK} 72%)`, boxShadow: `0 30px 70px rgba(15,6,20,.5), inset 0 0 0 2px ${GOLD}` }}>
              <div style={{ position: 'absolute', inset: 18, borderRadius: '50%', border: `1px dashed ${GOLD_LINE}` }} />
              <div style={{ textAlign: 'center', color: PARCH, padding: '0 34px', maxWidth: '86%' }}>
                <div style={{ fontFamily: SANS, fontSize: 11, fontWeight: 700, letterSpacing: '.18em', textTransform: 'uppercase', color: GOLD }}>Build to</div>
                <div style={{ fontFamily: SERIF, fontSize: 'clamp(2.6rem,9.6vw,3.9rem)', fontWeight: 700, lineHeight: 1, margin: '.55rem 0 .5rem', color: WHITE }}>$5,000<span style={{ fontSize: '.3em', color: GOLD }}>/mo</span></div>
                <div style={{ fontFamily: SANS, fontSize: 10.5, fontWeight: 700, letterSpacing: '.1em', lineHeight: 1.4, textTransform: 'uppercase', color: GOLD }}>or your money back</div>
              </div>
            </div>
          </Reveal>
          <Reveal delay={90}>
            <Eyebrow>The $5K promise</Eyebrow>
            <h2 style={{ ...H2, marginTop: '.8rem', color: WHITE }}>Build a $5,000-a-month business — <em style={{ fontStyle: 'italic', fontWeight: 300, color: GOLD }}>or get every penny back.</em></h2>
            <p style={{ fontFamily: SANS, fontSize: '1.15rem', color: 'rgba(250,246,240,.82)', marginTop: '1.3rem', lineHeight: 1.8, maxWidth: 560 }}>
              Here&apos;s our promise. Work through the workbook, do the exercises, and build the product, offer, and launch it walks you through. If you put in the work and don&apos;t build toward <strong style={{ color: '#fff', fontWeight: 600 }}>$5,000/month</strong>, we&apos;ll refund every penny — no hard feelings. You have a full year. That&apos;s how confident we are that this actually works.
            </p>
            <div style={{ marginTop: '1.8rem' }}><Btn label="Start risk-free — $7.93" /></div>
            <p style={{ fontFamily: SANS, fontSize: 12, color: 'rgba(250,246,240,.55)', marginTop: '1.2rem', maxWidth: 540 }}>The guarantee is a money-back guarantee on the purchase price, valid for 365 days and subject to the published refund terms. It is not a guarantee of business results — those depend on your execution, market, and effort.</p>
          </Reveal>
        </div>
      </Section>

      {/* FAQ */}
      <Section bg={WHITE} id="faq">
        <Reveal style={{ maxWidth: 860, margin: '0 auto' }}>
          <Eyebrow>Questions</Eyebrow>
          <h2 style={{ ...H2, marginTop: '.8rem' }}>Everything you might <em style={emItal}>be wondering.</em></h2>
          <div style={{ marginTop: '1.8rem' }}>{FAQS.map(([q, a]) => <FAQItem key={q} q={q} a={a} />)}</div>
        </Reveal>
      </Section>

      {/* Final CTA band (plum-dark, house cv-next look) */}
      <section style={{ background: PLUM_DK, color: PARCH, padding: 'clamp(72px,9vw,120px) 1.25rem' }} id="checkout">
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <Reveal style={{ textAlign: 'center', maxWidth: 820, margin: '0 auto 2.6rem' }}>
            <Eyebrow center>Begin</Eyebrow>
            <h2 style={{ ...H2, marginTop: '.9rem', color: WHITE }}>You already know more than you think. <em style={{ fontStyle: 'italic', fontWeight: 300, color: GOLD }}>Now make it something people can buy.</em></h2>
            <p style={{ fontFamily: SANS, fontSize: '1.1rem', fontWeight: 300, color: 'rgba(250,246,240,.82)', marginTop: '1.3rem', lineHeight: 1.8 }}>
              No more years of planning. No more hundred videos. Just start — open the workbook, do the first exercise, build the first asset.
            </p>
          </Reveal>
          <Reveal delay={80} style={{ maxWidth: 560, margin: '0 auto' }}><CheckoutCard planId={planId} /></Reveal>
          <Reveal delay={120} style={{ textAlign: 'center', marginTop: '2.6rem' }}>
            <div style={{ display: 'flex', gap: 20, justifyContent: 'center', flexWrap: 'wrap', fontFamily: SERIF, fontSize: 'clamp(1.1rem,2vw,1.5rem)', fontStyle: 'italic', color: GOLD }}>
              <span>Read it.</span><span style={{ opacity: .4 }}>/</span><span>Do the work.</span><span style={{ opacity: .4 }}>/</span><span>Build the business.</span>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: '#241229', color: 'rgba(250,246,240,.72)', padding: '3.6rem 1.25rem 2.6rem', borderTop: `1px solid ${GOLD_LINE}` }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontFamily: SERIF, fontSize: '1.5rem', fontWeight: 600, color: WHITE }}>The Knowledge <em style={{ fontStyle: 'italic', color: GOLD }}>Asset</em></div>
              <div style={{ fontFamily: SANS, fontSize: 13.5, marginTop: 8 }}>By Indrodip Ghosh &amp; Christinee Mathison · The5th Consulting</div>
              <a href="https://10kroadmap.org" style={{ fontFamily: SANS, fontSize: 13.5, color: GOLD, textDecoration: 'none', display: 'inline-block', marginTop: 4 }}>10kroadmap.org</a>
            </div>
            <nav style={{ display: 'flex', flexWrap: 'wrap', gap: '10px 22px' }} aria-label="Footer">
              {[['Terms', '/terms'], ['Refund Policy', '/refund'], ['Contact', '/support']].map(([l, h]) => (
                <a key={l} href={h} style={{ fontFamily: SANS, fontSize: 13.5, color: 'rgba(250,246,240,.72)', textDecoration: 'none' }}>{l}</a>
              ))}
            </nav>
          </div>
          <div style={{ borderTop: `1px solid ${GOLD_LINE}`, marginTop: 30, paddingTop: 22, fontFamily: SANS, fontSize: 12, color: 'rgba(250,246,240,.55)', lineHeight: 1.7 }}>
            <p>© 2026 The5th Consulting. All rights reserved.</p>
            <p style={{ marginTop: 8, maxWidth: 800 }}>Business results vary. This book provides educational information and practical exercises; it does not guarantee financial results.</p>
          </div>
        </div>
      </footer>

      {/* Sticky mobile CTA */}
      <div className="ka-sticky" style={{ position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 50, background: `linear-gradient(180deg,${PLUM_DK},#241229)`, padding: '.6rem .9rem', borderTop: `1px solid ${GOLD_LINE}`, alignItems: 'center', justifyContent: 'center' }}>
        <a href="#buy" style={{ display: 'flex', width: '100%', minHeight: 52, alignItems: 'center', justifyContent: 'center', gap: 8, background: GREEN, color: WHITE, fontFamily: SANS, fontWeight: 700, fontSize: 15, textDecoration: 'none', boxShadow: '0 8px 32px rgba(28,74,50,.4)' }}>
          Get The Knowledge Asset — {PRICE} →
        </a>
      </div>
    </div>
  )
}
