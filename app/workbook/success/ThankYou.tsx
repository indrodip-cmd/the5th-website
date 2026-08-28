'use client'
/* ─────────────────────────────────────────────────────────────────────────
   Thank-you / delivery page for The Knowledge Asset. Whop redirects here after
   a successful checkout. Gives the buyer their book immediately (direct
   download), reminds them of the bonuses, and offers a free strategy call as a
   bonus via the embedded cal.com scheduler. Brand: parchment + plum + gold +
   green, Cormorant Garamond + DM Sans (house system).
   ───────────────────────────────────────────────────────────────────────── */
import { useEffect, useState } from 'react'
import Cal, { getCalApi } from '@calcom/embed-react'

const PLUM = '#3D2645'
const PLUM_DK = '#2E1A35'
const PLUM_DEEP = '#241229'
const GOLD = '#C9A84C'
const GOLD_DK = '#8a6f22'
const GOLD_LT = '#E4C879'
const GOLD_SOFT = 'rgba(201,168,76,0.12)'
const GOLD_LINE = 'rgba(201,168,76,0.35)'
const GREEN = '#1C4A32'
const GREEN_DK = '#143826'
const PARCH = '#FAF6F0'
const INK = '#1A1A2E'
const INK_MID = '#403b3b'
const INK_MUTE = '#8A8075'
const BORDER = '#DDD8CF'
const WHITE = '#fff'
const CREAM = '#F6EFE3'
const SERIF = "'Cormorant Garamond', Georgia, Times, serif"
const SANS = "'DM Sans', system-ui, -apple-system, sans-serif"

// Self-hosted workbook PDF — clean one-click download (no Drive interstitial).
const DOWNLOAD_URL = '/downloads/the-knowledge-asset.pdf'
const CAL_LINK = 'indrodip-ghosh-ut1vxh/60min'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function ThankYou() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'done'>('idle')

  useEffect(() => {
    (async () => {
      try {
        const cal = await getCalApi({ namespace: '60min' })
        cal('ui', { hideEventTypeDetails: true, layout: 'month_view' })
      } catch { /* embed loads on its own if the API call fails */ }
    })()
  }, [])

  // Enrol the buyer into the 7-day AI-trial nurture. Auto-runs if Whop passes
  // ?email; otherwise the visible form below captures it.
  async function enroll(e: string, n?: string) {
    if (!EMAIL_RE.test(e)) return
    setStatus('sending')
    try {
      await fetch('/api/workbook/enroll', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: e, name: n || undefined, source: 'workbook_thankyou' }) })
    } catch { /* fail soft — never block the thank-you experience */ }
    setStatus('done')
  }

  useEffect(() => {
    try {
      const sp = new URLSearchParams(window.location.search)
      const e = sp.get('email') || ''
      const n = sp.get('name') || ''
      if (EMAIL_RE.test(e)) { queueMicrotask(() => { setEmail(e); enroll(e, n) }) }
    } catch { /* ignore */ }
  }, [])

  return (
    <main style={{ fontFamily: SANS, color: INK, background: PARCH, minHeight: '100dvh', overflowX: 'hidden' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,300;1,400;1,500;1,600&family=DM+Sans:wght@300;400;500;600;700&display=swap');
        .ty-dl:hover{background:${GREEN_DK}!important;transform:translateY(-2px);box-shadow:0 14px 44px rgba(28,74,50,.5)!important}
        .ty-dl{transition:transform .2s ease,box-shadow .2s ease,background .2s ease}
        .ty-steps{display:grid;grid-template-columns:1fr 1fr;gap:16px}
        @media(max-width:720px){ .ty-steps{grid-template-columns:1fr} }
      `}</style>

      {/* Hero — confirmation + instant download */}
      <section style={{ background: `radial-gradient(120% 100% at 80% 0%, ${PLUM} 0%, ${PLUM_DK} 55%, ${PLUM_DEEP} 100%)`, color: CREAM, padding: 'clamp(48px,8vw,80px) 1.25rem clamp(40px,6vw,64px)', textAlign: 'center' }}>
        <div style={{ maxWidth: 640, margin: '0 auto' }}>
          <div style={{ width: 76, height: 76, margin: '0 auto 22px', borderRadius: '50%', background: `radial-gradient(circle at 50% 35%, ${GOLD_LT}, ${GOLD} 55%, #B8983F)`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 20px 50px rgba(184,152,63,.45), inset 0 2px 5px rgba(255,255,255,.5)' }}>
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke={PLUM_DK} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden><polyline points="20 6 9 17 4 12" /></svg>
          </div>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.22em', textTransform: 'uppercase', color: GOLD_LT }}>The Knowledge Asset</div>
          <h1 style={{ fontFamily: SERIF, fontWeight: 600, fontSize: 'clamp(2.6rem,9vw,4.4rem)', letterSpacing: '-.02em', margin: '12px 0 0', lineHeight: 1, color: CREAM }}>You&apos;re <em style={{ fontStyle: 'italic', color: GOLD_LT }}>in.</em> Here&apos;s your book.</h1>
          <p style={{ fontSize: 'clamp(1rem,1.4vw,1.15rem)', fontWeight: 300, color: 'rgba(246,239,227,.82)', marginTop: 16, lineHeight: 1.7 }}>
            Your purchase is confirmed. Download your workbook right now — we&apos;ve also emailed you a copy plus access to your 7-day free trial of The5th AI and your three bonuses.
          </p>
          <div style={{ marginTop: 26 }}>
            <a href={DOWNLOAD_URL} download="The-Knowledge-Asset.pdf" className="ty-dl" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 11, background: GREEN, color: WHITE, fontFamily: SANS, fontWeight: 700, fontSize: '1.05rem', letterSpacing: '.01em', padding: '1.15rem 2.4rem', minHeight: 56, textDecoration: 'none', boxShadow: '0 10px 36px rgba(28,74,50,.45)' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
              Download the workbook (PDF)
            </a>
          </div>
          <p style={{ fontSize: 13, color: 'rgba(246,239,227,.6)', marginTop: 14 }}>Instant access · Also sent to your email · Lifetime access</p>
        </div>
      </section>

      {/* Activate — enrol into the 7-day AI-trial nurture + quiz CTA */}
      <section style={{ padding: 'clamp(40px,6vw,64px) 1.25rem 0', maxWidth: 900, margin: '0 auto' }}>
        <div style={{ background: WHITE, border: `1px solid ${BORDER}`, borderTop: `3px solid ${GOLD}`, padding: 'clamp(24px,4vw,40px)', textAlign: 'center' }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.16em', textTransform: 'uppercase', color: GOLD_DK }}>Activate your bonus</div>
          <h2 style={{ fontFamily: SERIF, fontWeight: 600, fontSize: 'clamp(1.7rem,3.4vw,2.4rem)', color: INK, margin: '10px 0 0', lineHeight: 1.1 }}>Switch on your <em style={{ fontStyle: 'italic', color: PLUM }}>free 7-day AI coaching</em></h2>
          <p style={{ fontSize: 15.5, color: INK_MID, marginTop: 12, lineHeight: 1.7, maxWidth: 560, margin: '12px auto 0' }}>
            Enter your email to activate your bonus coaching. Then take the 2-minute quiz — it gives your The5th AI coach the context to coach <em style={{ color: PLUM, fontStyle: 'italic' }}>your</em> business, and we&apos;ll walk you through the book over the next 7 days.
          </p>
          {status === 'done' ? (
            <div style={{ marginTop: 22, display: 'inline-flex', alignItems: 'center', gap: 10, background: '#f2f8f4', border: `1px solid #cfe6d8`, borderRadius: 10, padding: '14px 20px', color: GREEN_DK, fontWeight: 600, fontSize: 15 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={GREEN} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden><polyline points="20 6 9 17 4 12" /></svg>
              You&apos;re activated — check your inbox for your welcome + coaching.
            </div>
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); enroll(email) }} style={{ marginTop: 22, display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center' }}>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" aria-label="Email address" style={{ flex: '1 1 260px', maxWidth: 340, minHeight: 52, padding: '0 16px', fontFamily: SANS, fontSize: 15.5, color: INK, background: PARCH, border: `1px solid ${BORDER}`, outline: 'none' }} />
              <button type="submit" disabled={status === 'sending'} className="ty-dl" style={{ minHeight: 52, background: GREEN, color: WHITE, fontFamily: SANS, fontWeight: 700, fontSize: 15.5, letterSpacing: '.01em', padding: '0 1.8rem', border: 'none', cursor: 'pointer', boxShadow: '0 8px 26px rgba(28,74,50,.35)' }}>
                {status === 'sending' ? 'Activating…' : 'Activate my AI coaching'}
              </button>
            </form>
          )}
          <div style={{ marginTop: 16 }}>
            <a href="/quiz" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontFamily: SANS, fontSize: 14, fontWeight: 600, color: PLUM, textDecoration: 'none', borderBottom: `1px solid ${GOLD_LINE}`, paddingBottom: 2 }}>
              Take the free 2-minute quiz to personalise your coaching →
            </a>
          </div>
        </div>
      </section>

      {/* Next steps */}
      <section style={{ padding: 'clamp(48px,7vw,84px) 1.25rem', maxWidth: 1080, margin: '0 auto' }}>
        <div className="ty-steps">
          <div style={{ background: WHITE, border: `1px solid ${BORDER}`, padding: '1.8rem 1.7rem' }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.16em', textTransform: 'uppercase', color: GOLD }}>Step 1</div>
            <div style={{ fontFamily: SERIF, fontSize: '1.55rem', fontWeight: 600, color: INK, marginTop: 6 }}>Open the workbook</div>
            <p style={{ fontSize: 15, color: INK_MID, marginTop: 8, lineHeight: 1.7 }}>Start with Chapter 1 and do the first exercise. Don&apos;t just read it — build your product, offer, and launch inside it as you go.</p>
          </div>
          <div style={{ background: WHITE, border: `1px solid ${BORDER}`, padding: '1.8rem 1.7rem' }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.16em', textTransform: 'uppercase', color: GOLD }}>Step 2</div>
            <div style={{ fontFamily: SERIF, fontSize: '1.55rem', fontWeight: 600, color: INK, marginTop: 6 }}>Activate The5th AI</div>
            <p style={{ fontSize: 15, color: INK_MID, marginTop: 8, lineHeight: 1.7 }}>Check your email for your 7-day free trial of The5th AI — your co-pilot that helps you apply the book, live, as you work through it.</p>
          </div>
        </div>
      </section>

      {/* Bonus — free strategy call (cal.com embed) */}
      <section style={{ background: `linear-gradient(160deg,${PLUM},${PLUM_DK})`, color: CREAM, padding: 'clamp(56px,8vw,96px) 1.25rem' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', maxWidth: 640, margin: '0 auto 2.4rem' }}>
            <span style={{ display: 'inline-block', fontSize: 11, fontWeight: 700, letterSpacing: '.16em', textTransform: 'uppercase', color: PLUM_DK, background: `linear-gradient(180deg,${GOLD_LT},${GOLD})`, borderRadius: 999, padding: '.4rem 1rem' }}>Your free bonus</span>
            <h2 style={{ fontFamily: SERIF, fontWeight: 600, fontSize: 'clamp(2rem,4.4vw,3rem)', lineHeight: 1.05, letterSpacing: '-.02em', margin: '1rem 0 0', color: WHITE }}>Book a <em style={{ fontStyle: 'italic', color: GOLD_LT }}>free strategy call</em> with our team.</h2>
            <p style={{ fontSize: 'clamp(1rem,1.4vw,1.12rem)', fontWeight: 300, color: 'rgba(246,239,227,.82)', marginTop: 16, lineHeight: 1.7 }}>
              As a thank-you for grabbing the book, you can claim a complimentary call. We&apos;ll help you pick the one product to build first and map your fastest path to your first $5K month. Pick a time below.
            </p>
          </div>
          <div style={{ background: WHITE, border: `1px solid ${GOLD_LINE}`, borderRadius: 14, padding: 'clamp(8px,1.5vw,16px)', boxShadow: '0 30px 70px rgba(15,6,20,.45)' }}>
            <Cal
              namespace="60min"
              calLink={CAL_LINK}
              style={{ width: '100%', height: 'min(720px, 88vh)', overflow: 'scroll', minHeight: 560 }}
              config={{ layout: 'month_view', useSlotsViewOnSmallScreen: 'true' }}
            />
          </div>
          <p style={{ textAlign: 'center', fontSize: 12.5, color: 'rgba(246,239,227,.55)', marginTop: 16 }}>Prefer to dive in first? No problem — the call is here whenever you want it.</p>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: PLUM_DEEP, color: 'rgba(246,239,227,.6)', padding: '2.4rem 1.25rem', textAlign: 'center', borderTop: `1px solid ${GOLD_LINE}` }}>
        <div style={{ fontFamily: SERIF, fontSize: '1.35rem', fontWeight: 600, color: CREAM }}>The Knowledge <em style={{ fontStyle: 'italic', color: GOLD_LT }}>Asset</em></div>
        <p style={{ fontSize: 12.5, marginTop: 8 }}>Read it. Do the work. Build the business.</p>
        <a href="/" style={{ display: 'inline-block', marginTop: 14, fontSize: 13, color: GOLD_LT, textDecoration: 'none' }}>← Back to The5th Consulting</a>
        <div style={{ marginTop: 16, fontSize: 11, color: 'rgba(246,239,227,.4)' }}>© 2026 The5th Consulting</div>
      </footer>

      {/* Fallback download link if the button is blocked */}
      <noscript />
    </main>
  )
}
