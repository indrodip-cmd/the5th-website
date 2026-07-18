'use client'
/* /event/the-shift — "The Shift", a $27 live 3-day breakthrough intensive
   hosted by Indrodip Ghosh. Built to the5th.consulting's premium standard:
   Cormorant Garamond + DM Sans, plum/gold/parchment palette. Payment is
   collected via the Whop EMBEDDED checkout (the js.whop.com loader lives in
   the root layout; we re-inject it here to survive client-side navigation).
   On success Whop redirects to the thank-you page. Single price, one plan. */
import { useEffect } from 'react'

/* ── Brand tokens (mirrors app/lp/make-10k-month/OptInView.tsx) ── */
const SERIF = "'Cormorant Garamond', Georgia, serif"
const SANS = "'DM Sans', system-ui, -apple-system, sans-serif"
const PLUM = '#2E1A35'
const GOLD = '#C9A84C'
const GOLD_L = '#E4C879'
const GOLD_DK = '#B0902F'
const GREEN = '#1C4A32'
const PARCH = '#FAF6F0'
const CREAM = '#FBF8F3'
const INK = '#1A1A2E'
const MUTE = '#8A8075'
const BORDER = '#E7E0D6'

/* ── Whop checkout config ──
   NOTE: two plan IDs were provided. Using the first as primary — swap this one
   constant if the correct live plan is plan_27Q0jIw0aHUEp. */
const WHOP_PLAN_ID = 'plan_MfwV4VVtZodmR'
const WHOP_ACCENT = '#35213c'
const RETURN_URL = 'https://the5th.consulting/event/the-shift/thank-you'
const WHOP_HOSTED_URL = 'https://whop.com/10kroadmap-org/the-shift-b0/'

const goldBtn: React.CSSProperties = {
  background: `linear-gradient(180deg,${GOLD_L} 0%,${GOLD} 55%,#B8983F 100%)`,
  color: PLUM,
  fontFamily: SANS,
  fontWeight: 700,
  letterSpacing: '.08em',
  textTransform: 'uppercase',
  boxShadow: '0 14px 30px rgba(201,168,76,.34), inset 0 1px 0 rgba(255,255,255,.5)',
  border: 'none',
  cursor: 'pointer',
  borderRadius: 999,
  textDecoration: 'none',
  display: 'inline-block',
}

const CLIENT_AVATARS = Array.from({ length: 8 }, (_, i) => `/clients/c${i + 1}.jpg`)

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontFamily: SANS,
        fontSize: 12,
        fontWeight: 700,
        letterSpacing: '.22em',
        textTransform: 'uppercase',
        color: GOLD_DK,
      }}
    >
      {children}
    </div>
  )
}

const DAYS = [
  {
    n: 'Day 1',
    date: 'Thu, Aug 7',
    title: 'Overcome Your Mental & Money Blocks',
    body:
      "The real reason you've been stuck was never a missing strategy. In session one we name the invisible obstacle out loud — the fear, the old money story, the self-doubt wearing the disguise of perfectionism — and we move past it. You leave with a why strong enough to survive the hard days.",
    take: 'Name the block that has quietly run your business for years.',
  },
  {
    n: 'Day 2',
    date: 'Fri, Aug 8',
    title: 'Create Your Offer',
    body:
      'Most offers fail before they ever launch — because they describe what you do instead of what changes for the person you help. Using a simple four-part framework, you build an offer so specific your ideal client thinks "how does she know exactly what I\'m going through?" That\'s not marketing anymore. That\'s trust.',
    take: 'Walk away with a clear, specific offer you actually believe in.',
  },
  {
    n: 'Day 3',
    date: 'Sat, Aug 9',
    title: 'Get Better at Sales & Close With Confidence',
    body:
      "Selling isn't manipulation — it's helping someone make a decision that's already right for them, faster than they'd get there alone. You get the exact call structure, the two objections that come up most, and the words to handle them with warmth instead of pressure.",
    take: 'Learn to sell it without ever feeling pushy or gross.',
  },
]

const WALKAWAY = [
  'The real reason you’ve been stuck — and how to finally move past it',
  'A clear, specific offer you feel genuinely confident selling',
  'A simple, honest sales approach that never feels forced',
  'Three days of live teaching, plus replays and a printable workbook',
  'Live hot-seat coaching — your offer and words workshopped in real time',
]

const FAQ = [
  {
    q: 'Who is this really for?',
    a: 'Coaches, consultants and service providers — often 40+ — who feel capable and experienced but stuck. You’ve likely invested before and didn’t get the traction you hoped for. You’re not looking for more information. You’re looking for someone to finally make it make sense.',
  },
  {
    q: 'What if I can’t attend live?',
    a: 'Come live if you can — the hot-seat coaching is where the magic happens. But every session is recorded, and you get replay access plus the workbook, so nothing is lost if life gets in the way.',
  },
  {
    q: 'Is $27 really the full price?',
    a: 'Yes. $27 for all three days. It’s intentionally low so the decision is easy — and because of how the guarantee works, it may end up costing you nothing at all (keep reading).',
  },
  {
    q: 'Will I be pitched the whole time?',
    a: 'No. You’ll get a genuinely transformative experience worth far more than $27. On Day 3 you’ll hear about what comes next if you want it — but only after you already have your block named, your offer built, and your sales approach in hand.',
  },
]

export default function TheShiftView() {
  // Guarantee the Whop embedded-checkout loader runs on this route even after
  // client-side SPA navigation (it also lives in the root layout).
  useEffect(() => {
    const SRC = 'https://js.whop.com/static/checkout/loader.js'
    if (!document.querySelector(`script[src="${SRC}"]`)) {
      const s = document.createElement('script')
      s.src = SRC
      s.async = true
      document.body.appendChild(s)
    }
  }, [])

  return (
    <div style={{ background: PARCH, color: INK, fontFamily: SANS, overflowX: 'hidden' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600;700&family=DM+Sans:wght@400;500;600;700&display=swap');
        @keyframes rise{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:none}}
        .ts-wrap{max-width:1060px;margin:0 auto;padding:0 22px}
        .ts-h1{font-family:${SERIF};font-weight:700;letter-spacing:-.01em;line-height:1.04;color:${PLUM};margin:0}
        .ts-day-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px}
        .ts-bio{display:grid;grid-template-columns:300px 1fr;gap:40px;align-items:center}
        .ts-checkout{display:grid;grid-template-columns:1fr minmax(0,440px);gap:44px;align-items:start}
        @media(max-width:860px){
          .ts-day-grid{grid-template-columns:1fr}
          .ts-bio{grid-template-columns:1fr;gap:24px;text-align:center}
          .ts-checkout{grid-template-columns:1fr;gap:28px}
          .ts-sticky{position:static!important}
        }
      `}</style>

      {/* ── Top bar ── */}
      <div
        style={{
          borderBottom: `1px solid ${BORDER}`,
          background: 'rgba(250,246,240,.85)',
          backdropFilter: 'blur(8px)',
          position: 'sticky',
          top: 0,
          zIndex: 30,
        }}
      >
        <div
          className="ts-wrap"
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 22px' }}
        >
          <a href="/">
            <img src="/images/logo.png" alt="The5th Consulting" style={{ height: 34, width: 'auto' }} />
          </a>
          <a href="#checkout" style={{ ...goldBtn, fontSize: 12.5, padding: '11px 20px' }}>
            Save my seat · $27
          </a>
        </div>
      </div>

      {/* ── Hero ── */}
      <header style={{ position: 'relative' }}>
        <div className="ts-wrap" style={{ padding: '58px 22px 30px', textAlign: 'center', animation: 'rise .6s ease' }}>
          <Eyebrow>Live 3-Day Intensive · August 7–9</Eyebrow>
          <div
            style={{
              fontFamily: SERIF,
              fontSize: 'clamp(64px,13vw,120px)',
              lineHeight: 0.9,
              color: PLUM,
              fontWeight: 700,
              margin: '14px 0 2px',
              letterSpacing: '-.02em',
            }}
          >
            The Shift
          </div>
          <h1 className="ts-h1" style={{ fontSize: 'clamp(26px,4.4vw,42px)', maxWidth: 760, margin: '10px auto 0' }}>
            Find the block. Build the offer. Learn to sell it — without ever feeling pushy.
          </h1>
          <p
            style={{
              fontSize: 'clamp(16px,2.2vw,19px)',
              color: '#5f574c',
              lineHeight: 1.6,
              maxWidth: 620,
              margin: '20px auto 0',
            }}
          >
            Three days that end with you saying:{' '}
            <em style={{ color: PLUM, fontStyle: 'italic' }}>
              “I know exactly why I’ve been stuck, I have an offer I actually believe in, and I know how to sell it
              without feeling pushy.”
            </em>
          </p>

          <div style={{ marginTop: 30 }}>
            <a href="#checkout" style={{ ...goldBtn, fontSize: 15, padding: '17px 40px' }}>
              Claim your seat — $27
            </a>
            <div style={{ marginTop: 14, fontSize: 13.5, color: MUTE }}>
              Live on Aug 7, 8 &amp; 9 · Replays included · 30-day money-back guarantee
            </div>
          </div>

          {/* social proof */}
          <div
            style={{
              marginTop: 34,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 14,
              flexWrap: 'wrap',
            }}
          >
            <div style={{ display: 'flex' }}>
              {CLIENT_AVATARS.map((src, i) => (
                <img
                  key={src}
                  src={src}
                  alt=""
                  onError={(e) => {
                    ;(e.currentTarget as HTMLImageElement).style.display = 'none'
                  }}
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '2px solid #fff',
                    marginLeft: i === 0 ? 0 : -12,
                    boxShadow: '0 2px 6px rgba(0,0,0,.12)',
                  }}
                />
              ))}
            </div>
            <div style={{ textAlign: 'left', fontSize: 13.5, color: '#5f574c', lineHeight: 1.4 }}>
              <strong style={{ color: INK }}>Hosted by Indrodip Ghosh</strong>
              <br />
              Trusted by coaches &amp; consultants worldwide
            </div>
          </div>
        </div>
      </header>

      {/* ── The promise band ── */}
      <section style={{ background: PLUM, color: '#fff', padding: '54px 0' }}>
        <div className="ts-wrap" style={{ textAlign: 'center', maxWidth: 780 }}>
          <Eyebrow>
            <span style={{ color: GOLD_L }}>The transformation</span>
          </Eyebrow>
          <p
            style={{
              fontFamily: SERIF,
              fontSize: 'clamp(24px,3.6vw,34px)',
              lineHeight: 1.35,
              margin: '16px auto 0',
              color: '#F6EFE3',
            }}
          >
            You don’t fail to reach your income goal because of your skills, your marketing, or your strategy. You get
            stuck because of a block you’ve <span style={{ color: GOLD_L }}>never named out loud</span>. In three days,
            we name it — and move past it together.
          </p>
        </div>
      </section>

      {/* ── Is this you ── */}
      <section className="ts-wrap" style={{ padding: '58px 22px 10px' }}>
        <div style={{ textAlign: 'center', marginBottom: 30 }}>
          <Eyebrow>Is this you?</Eyebrow>
          <h2 className="ts-h1" style={{ fontSize: 'clamp(26px,4vw,38px)', marginTop: 12 }}>
            Capable, experienced — and quietly stuck.
          </h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 16, maxWidth: 860, margin: '0 auto' }}>
          {[
            'You’ve invested in courses before and didn’t get the traction you hoped for.',
            'You know you’re good at what you do — but talking about it makes you shrink.',
            'You undercharge, then quietly resent it.',
            'You’re not short on information. You’re short on clarity and belief.',
          ].map((t) => (
            <div
              key={t}
              style={{
                background: '#fff',
                border: `1px solid ${BORDER}`,
                borderRadius: 16,
                padding: '20px 22px',
                fontSize: 15.5,
                color: '#4a4238',
                lineHeight: 1.55,
              }}
            >
              {t}
            </div>
          ))}
        </div>
        <p style={{ textAlign: 'center', color: MUTE, fontSize: 15, marginTop: 24 }}>
          If you nodded even once — this is built for you.
        </p>
      </section>

      {/* ── 3-day arc ── */}
      <section className="ts-wrap" style={{ padding: '46px 22px 10px' }}>
        <div style={{ textAlign: 'center', marginBottom: 30 }}>
          <Eyebrow>The 3-day arc</Eyebrow>
          <h2 className="ts-h1" style={{ fontSize: 'clamp(26px,4vw,38px)', marginTop: 12 }}>
            Each day delivers one real breakthrough.
          </h2>
          <p style={{ color: MUTE, fontSize: 15.5, marginTop: 10 }}>
            Nothing withheld. You get the real thing, every single day.
          </p>
        </div>
        <div className="ts-day-grid">
          {DAYS.map((d) => (
            <div
              key={d.n}
              style={{
                background: '#fff',
                border: `1px solid ${BORDER}`,
                borderRadius: 20,
                padding: '26px 24px',
                boxShadow: '0 14px 40px rgba(46,26,53,.06)',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontFamily: SANS, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', fontSize: 12, color: GOLD_DK }}>
                  {d.n}
                </span>
                <span style={{ fontSize: 12.5, color: MUTE }}>{d.date}</span>
              </div>
              <h3 style={{ fontFamily: SERIF, fontSize: 24, color: PLUM, margin: '4px 0 12px', lineHeight: 1.15 }}>
                {d.title}
              </h3>
              <p style={{ fontSize: 14.5, color: '#5a5248', lineHeight: 1.6, margin: 0, flex: 1 }}>{d.body}</p>
              <div
                style={{
                  marginTop: 18,
                  paddingTop: 14,
                  borderTop: `1px solid ${BORDER}`,
                  fontSize: 13.5,
                  color: GREEN,
                  fontWeight: 600,
                  lineHeight: 1.45,
                }}
              >
                → {d.take}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── What you'll walk away with ── */}
      <section className="ts-wrap" style={{ padding: '52px 22px 10px' }}>
        <div
          style={{
            background: CREAM,
            border: `1px solid ${BORDER}`,
            borderRadius: 24,
            padding: 'clamp(28px,5vw,48px)',
            maxWidth: 760,
            margin: '0 auto',
          }}
        >
          <Eyebrow>What you’ll walk away with</Eyebrow>
          <div style={{ marginTop: 22, display: 'grid', gap: 16 }}>
            {WALKAWAY.map((f) => (
              <div key={f} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                <span
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: '50%',
                    background: '#f1e8d3',
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginTop: 1,
                  }}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={GOLD_DK} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </span>
                <span style={{ fontSize: 16, color: INK, lineHeight: 1.5 }}>{f}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Founder bio ── */}
      <section className="ts-wrap" style={{ padding: '62px 22px 10px' }}>
        <div className="ts-bio">
          <div style={{ justifySelf: 'center' }}>
            <img
              src="/images/founder.png"
              alt="Indrodip Ghosh"
              style={{
                width: 300,
                maxWidth: '78vw',
                borderRadius: 20,
                objectFit: 'cover',
                boxShadow: '0 20px 50px rgba(46,26,53,.16)',
                border: '4px solid #fff',
              }}
            />
          </div>
          <div>
            <Eyebrow>Your host</Eyebrow>
            <h2 className="ts-h1" style={{ fontSize: 'clamp(26px,3.6vw,36px)', marginTop: 10 }}>
              Indrodip Ghosh
            </h2>
            <p style={{ fontSize: 16.5, color: '#5a5248', lineHeight: 1.7, marginTop: 14 }}>
              I know what it feels like to believe in something completely and watch it fall apart anyway. I put close
              to <strong>$30,000</strong> into courses and masterminds looking for the piece I thought I was missing. I
              worked out of cafés because I couldn’t afford an office. I lost count of failed sales calls somewhere past{' '}
              <strong>300</strong>.
            </p>
            <p style={{ fontSize: 16.5, color: '#5a5248', lineHeight: 1.7, marginTop: 14 }}>
              What I lacked was never effort or ideas — it was clarity on one thing. That obsession with understanding
              business, psychology, marketing, sales, and how people really make decisions became my career. Today I’ve
              advised Fortune 500 executives, billion-dollar companies, celebrity coaches, government organizations, and
              entrepreneurs around the world.
            </p>
            <p style={{ fontSize: 20, color: PLUM, lineHeight: 1.6, marginTop: 16, fontFamily: SERIF }}>
              These three days are the exact process I wish someone had walked me through years ago.
            </p>
          </div>
        </div>
      </section>

      {/* ── The Shift guarantee / donation ── */}
      <section className="ts-wrap" style={{ padding: '58px 22px 10px' }}>
        <div
          style={{
            background: `linear-gradient(160deg,#22331f 0%,#1C4A32 60%,#173d2a 100%)`,
            color: '#EAF3EC',
            borderRadius: 26,
            padding: 'clamp(30px,5vw,54px)',
            textAlign: 'center',
            maxWidth: 820,
            margin: '0 auto',
            boxShadow: '0 24px 60px rgba(23,61,42,.28)',
          }}
        >
          <div style={{ fontFamily: SANS, fontSize: 12, fontWeight: 700, letterSpacing: '.22em', textTransform: 'uppercase', color: '#D8E8DC' }}>
            Zero risk · Real impact
          </div>
          <h2 style={{ fontFamily: SERIF, fontSize: 'clamp(28px,4.4vw,40px)', margin: '14px 0 0', color: '#fff', lineHeight: 1.15 }}>
            The 30-Day, No-Questions Guarantee
          </h2>
          <p style={{ fontSize: 17, lineHeight: 1.7, marginTop: 18, color: '#DCEAE0', maxWidth: 640, marginInline: 'auto' }}>
            Show up, do the work, and if you don’t feel it was worth far more than $27, email us within{' '}
            <strong>30 days</strong> for a full refund. No questions, no forms, no hoops.
          </p>
          <div
            style={{
              marginTop: 22,
              padding: '22px 24px',
              borderRadius: 18,
              background: 'rgba(255,255,255,.08)',
              border: '1px solid rgba(255,255,255,.16)',
            }}
          >
            <p style={{ fontSize: 16.5, lineHeight: 1.7, margin: 0, color: '#F1F8F3' }}>
              And here’s the part that makes this different: <strong>if you don’t ask for a refund</strong>, we donate
              your entire registration to <strong style={{ color: GOLD_L }}>The Shift</strong> — a children’s wellness
              program supporting kids in war-affected countries. So your $27 either transforms your business, or changes
              a child’s week. There is no version of this where you lose.
            </p>
          </div>
        </div>
      </section>

      {/* ── Checkout ── */}
      <section id="checkout" style={{ scrollMarginTop: 70, padding: '64px 0 30px' }}>
        <div className="ts-wrap">
          <div className="ts-checkout">
            {/* Left — value stack */}
            <div>
              <Eyebrow>Reserve your seat</Eyebrow>
              <h2 className="ts-h1" style={{ fontSize: 'clamp(28px,4vw,40px)', marginTop: 12 }}>
                Three days that pay for themselves in the first hour.
              </h2>
              <p style={{ fontSize: 16.5, color: '#5a5248', lineHeight: 1.65, marginTop: 14, maxWidth: 500 }}>
                All three live sessions, hot-seat coaching, replays, and the printable workbook — for the price of a
                lunch you’d forget by Friday.
              </p>
              <div style={{ marginTop: 24, display: 'grid', gap: 12 }}>
                {[
                  '3 live sessions with Indrodip (Aug 7, 8 & 9)',
                  'Live hot-seat coaching on your offer & words',
                  'Full replay access — watch on your schedule',
                  'Printable workbook to lock in every breakthrough',
                  '30-day money-back guarantee (or it funds The Shift)',
                ].map((f) => (
                  <div key={f} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <span style={{ width: 22, height: 22, borderRadius: '50%', background: '#eaf7ef', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 1 }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={GREEN} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </span>
                    <span style={{ fontSize: 15.5, color: INK, lineHeight: 1.5 }}>{f}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — checkout card */}
            <div className="ts-sticky" style={{ position: 'sticky', top: 84 }}>
              <div
                style={{
                  background: '#fff',
                  border: `1px solid ${BORDER}`,
                  borderRadius: 24,
                  boxShadow: '0 22px 60px rgba(46,26,53,.14)',
                  padding: '26px 24px 24px',
                }}
              >
                <div style={{ textAlign: 'center', marginBottom: 8 }}>
                  <div style={{ fontFamily: SANS, fontSize: 12, fontWeight: 700, letterSpacing: '.16em', textTransform: 'uppercase', color: GOLD_DK }}>
                    The Shift · 3-Day Intensive
                  </div>
                  <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 6, marginTop: 8 }}>
                    <span style={{ fontFamily: SERIF, fontSize: 52, fontWeight: 700, color: PLUM }}>$27</span>
                    <span style={{ fontSize: 14, color: MUTE }}>one time</span>
                  </div>
                  <p style={{ fontSize: 12.5, color: MUTE, marginTop: 4 }}>Instant confirmation · All 3 days + replays</p>
                </div>

                {/* Whop embedded checkout */}
                <div
                  data-whop-checkout-plan-id={WHOP_PLAN_ID}
                  data-whop-checkout-theme="light"
                  data-whop-checkout-theme-accent-color={WHOP_ACCENT}
                  data-whop-checkout-redirect-url={RETURN_URL}
                  style={{ maxWidth: 500, margin: '12px auto 0', width: '100%', minHeight: 80, overflow: 'hidden' }}
                />

                <p style={{ textAlign: 'center', fontSize: 11.5, color: '#a99fb2', marginTop: 12, lineHeight: 1.5 }}>
                  Secure checkout · Powered by Whop · 30-day money-back guarantee
                </p>
                <p style={{ textAlign: 'center', fontSize: 12, marginTop: 8 }}>
                  <a href={WHOP_HOSTED_URL} style={{ color: GOLD_DK, textDecoration: 'underline' }}>
                    Trouble checking out? Open secure checkout →
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="ts-wrap" style={{ padding: '40px 22px 20px', maxWidth: 780 }}>
        <div style={{ textAlign: 'center', marginBottom: 26 }}>
          <Eyebrow>Questions</Eyebrow>
          <h2 className="ts-h1" style={{ fontSize: 'clamp(24px,3.6vw,34px)', marginTop: 10 }}>
            Before you decide
          </h2>
        </div>
        <div style={{ display: 'grid', gap: 14 }}>
          {FAQ.map((f) => (
            <div key={f.q} style={{ background: '#fff', border: `1px solid ${BORDER}`, borderRadius: 16, padding: '20px 22px' }}>
              <div style={{ fontFamily: SERIF, fontSize: 20, color: PLUM, marginBottom: 8 }}>{f.q}</div>
              <p style={{ fontSize: 15, color: '#5a5248', lineHeight: 1.6, margin: 0 }}>{f.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section style={{ background: PLUM, color: '#fff', padding: '56px 0', marginTop: 30, textAlign: 'center' }}>
        <div className="ts-wrap" style={{ maxWidth: 680 }}>
          <h2 style={{ fontFamily: SERIF, fontSize: 'clamp(28px,4.6vw,42px)', margin: 0, color: '#fff', lineHeight: 1.12 }}>
            Three days from now, you could finally know your why, your offer, and your words.
          </h2>
          <p style={{ fontSize: 16.5, color: '#E6DCEC', lineHeight: 1.6, marginTop: 16 }}>
            August 7, 8 &amp; 9. Just $27. And if it doesn’t land, it funds a child’s wellness instead.
          </p>
          <a href="#checkout" style={{ ...goldBtn, fontSize: 15, padding: '17px 42px', marginTop: 26 }}>
            Claim your seat — $27
          </a>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ textAlign: 'center', fontSize: 12.5, color: '#b3aca0', padding: '26px 20px 34px' }}>
        <div style={{ marginBottom: 8 }}>
          <a href="/privacy" style={{ color: '#8A8075', textDecoration: 'none', margin: '0 8px' }}>Privacy</a>·
          <a href="/terms" style={{ color: '#8A8075', textDecoration: 'none', margin: '0 8px' }}>Terms</a>·
          <a href="/refund" style={{ color: '#8A8075', textDecoration: 'none', margin: '0 8px' }}>Refund</a>
        </div>
        © 2026 The5th Consulting · Hosted by Indrodip Ghosh
      </footer>
    </div>
  )
}
