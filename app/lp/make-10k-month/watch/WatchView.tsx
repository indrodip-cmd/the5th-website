'use client'
/* Dedicated training page (post opt-in). The video autoplays and RESTARTS on
   every load — leaving/refreshing starts it over (a commitment device), which
   the warning banner makes explicit. After the reveal threshold of real
   watch-time (default 5 min), the private-call invitation unlocks with the
   offer copy adapted from /call. No navigation, no exit links (except legal). */
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { WATCH, LEGAL } from '../config'
import { useVslWatch } from '../useVslWatch'
import VslPlayer from './VslPlayer'

const SERIF = "'Cormorant Garamond', Georgia, serif"
const SANS = "'DM Sans', system-ui, -apple-system, sans-serif"
const PLUM = '#2E1A35'
const PLUM_2 = '#3D2645'
const PLUM_MID = '#4E3158'
const GOLD = '#C9A84C'
const GOLD_L = '#E4C879'
const GOLD_DK = '#B0902F'
const PARCH = '#FAF6F0'
const INK = '#1A1A2E'
const MUTE = '#8A8075'
const BORDER = '#DDD8CF'

const goldBtn: React.CSSProperties = {
  background: `linear-gradient(180deg,${GOLD_L} 0%,${GOLD} 55%,#B8983F 100%)`,
  color: PLUM, fontFamily: SANS, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase',
  boxShadow: '0 12px 28px rgba(201,168,76,.32), inset 0 1px 0 rgba(255,255,255,.5)',
  border: 'none', cursor: 'pointer',
}

type Lead = { name: string; email: string }

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 14 }}>
      <span style={{ width: 26, height: 1, background: 'rgba(201,168,76,.55)' }} />
      <span style={{ fontFamily: SANS, fontSize: 11.5, fontWeight: 600, letterSpacing: '.2em', textTransform: 'uppercase', color: GOLD_DK }}>{children}</span>
      <span style={{ width: 26, height: 1, background: 'rgba(201,168,76,.55)' }} />
    </div>
  )
}

export default function WatchView({ videoUrl, revealSeconds, formId }: { videoUrl: string; revealSeconds: number; formId: string }) {
  const router = useRouter()
  const [lead, setLead] = useState<Lead | null>(null)
  const [ready, setReady] = useState(false)

  const { revealed, booked, onWatched, bookCall } = useVslWatch(lead, revealSeconds, formId)

  // Identity comes from the URL (?name=&email=) first, then the stored lead.
  // A visitor with NO email (a random person opening /watch directly) is
  // redirected to the opt-in — the training is only for people who signed up.
  useEffect(() => {
    let l: Lead | null = null
    try {
      const p = new URLSearchParams(window.location.search)
      const un = p.get('name') || p.get('n') || ''
      const ue = (p.get('email') || p.get('e') || '').trim().toLowerCase()
      if (ue && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(ue)) {
        l = { name: un.slice(0, 120), email: ue }
      } else {
        const raw = localStorage.getItem('vsl_make10k')
        if (raw) { const j = JSON.parse(raw); if (j?.email) l = { name: j.name || '', email: j.email } }
      }
    } catch { /* noop */ }
    if (!l) { router.replace('/lp/make-10k-month'); return }
    // Keep it available for a refresh + downstream steps.
    try { localStorage.setItem('vsl_make10k', JSON.stringify({ name: l.name, email: l.email, t: Date.now() })) } catch { /* noop */ }
    setLead(l); setReady(true)
  }, [router])

  if (!ready || !lead) return <main style={{ minHeight: '100dvh', background: PARCH }} />

  const firstName = lead.name?.split(' ')[0] || ''
  const r = WATCH.reveal

  return (
    <main style={{ minHeight: '100dvh', background: `radial-gradient(140% 90% at 50% -20%, #FBF8F3 0%, ${PARCH} 45%, #F3ECE2 100%)`, color: INK, fontFamily: SANS }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=DM+Sans:wght@300;400;500;600;700&display=swap');
        *{box-sizing:border-box}
        @keyframes rise{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:none}}
        @keyframes fade{from{opacity:0}to{opacity:1}}
        .rise{animation:rise .6s ease both}
        .cta{transition:transform .15s ease,filter .15s ease}
        .cta:hover:not(:disabled){transform:translateY(-2px);filter:brightness(1.03)}
      `}</style>

      <header style={{ padding: '16px 20px 14px', textAlign: 'center', borderBottom: `1px solid rgba(221,216,207,.8)`, background: 'rgba(250,246,240,.6)' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/the5th-logo-purple.png" alt="The5th Consulting" style={{ height: 'clamp(38px,9vw,46px)', width: 'auto', verticalAlign: 'middle' }} />
      </header>

      <div style={{ maxWidth: 820, margin: '0 auto', padding: '24px 16px 10px' }}>
        {/* Title + don't-close warning */}
        <div style={{ textAlign: 'center', marginBottom: 16 }}>
          <Eyebrow>{WATCH.eyebrow}</Eyebrow>
          <h1 style={{ fontFamily: SERIF, fontSize: 'clamp(28px,6vw,44px)', fontWeight: 500, lineHeight: 1.1, letterSpacing: '-.01em', margin: 0, color: INK }}>
            {firstName ? `${firstName}, ${WATCH.headline.charAt(0).toLowerCase() + WATCH.headline.slice(1)}` : WATCH.headline}
          </h1>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', maxWidth: 620, margin: '0 auto 18px', padding: '12px 16px', background: 'rgba(201,168,76,.12)', border: '1px solid rgba(201,168,76,.4)', borderRadius: 10 }}>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={GOLD_DK} strokeWidth="2" style={{ flexShrink: 0, marginTop: 1 }}><path d="M12 9v4M12 17h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /></svg>
          <span style={{ fontFamily: SANS, fontSize: 13.5, color: '#6b5a2a', lineHeight: 1.5 }}>{WATCH.warning}</span>
        </div>

        {/* Player (autoplays; restarts on reload) */}
        <div style={{ padding: 8, borderRadius: 16, background: `linear-gradient(160deg, rgba(201,168,76,.28), rgba(201,168,76,.06))`, boxShadow: '0 34px 80px -30px rgba(46,26,53,.55)' }}>
          <div style={{ borderRadius: 11, overflow: 'hidden', background: '#120912', border: '1px solid rgba(255,255,255,.06)' }}>
            {videoUrl ? (
              <VslPlayer videoUrl={videoUrl} initialSeconds={0} onWatched={onWatched} autoplay />
            ) : (
              <div style={{ width: '100%', aspectRatio: '16 / 9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#e9dcc4', fontFamily: SANS, fontSize: 14, textAlign: 'center', padding: 20 }}>
                Set NEXT_PUBLIC_VSL_VIDEO_URL to your training video (YouTube or Vimeo) to play it here.
              </div>
            )}
          </div>
        </div>

        {/* Locked hint OR the private-call invitation */}
        {revealed ? (
          <div className="rise" style={{ marginTop: 30, background: '#fff', border: `1px solid ${BORDER}`, borderTop: `3px solid ${GOLD}`, borderRadius: 14, boxShadow: '0 30px 70px -40px rgba(46,26,53,.5)', padding: 'clamp(26px,6vw,42px)' }}>
            {booked ? (
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 40, marginBottom: 10 }}>🕊️</div>
                <h2 style={{ fontFamily: SERIF, fontSize: 'clamp(26px,5.6vw,36px)', fontWeight: 500, margin: '0 0 12px', color: INK }}>You’re booked{firstName ? `, ${firstName}` : ''}.</h2>
                <p style={{ fontFamily: SANS, fontSize: 16, fontWeight: 300, color: '#5f574c', lineHeight: 1.7, maxWidth: 460, margin: '0 auto' }}>Check your email for the details. Come to the call ready to map your next $10K month.</p>
              </div>
            ) : (
              <>
                <div style={{ textAlign: 'center' }}>
                  <Eyebrow>{r.eyebrow}</Eyebrow>
                  <h2 style={{ fontFamily: SERIF, fontSize: 'clamp(25px,5.6vw,38px)', fontWeight: 500, lineHeight: 1.12, letterSpacing: '-.01em', margin: '0 auto 14px', maxWidth: 580, color: INK }}>{r.headline}</h2>
                  <p style={{ fontFamily: SANS, fontSize: 'clamp(15px,3.3vw,17px)', fontWeight: 300, color: '#5f574c', lineHeight: 1.7, maxWidth: 540, margin: '0 auto' }}>{r.body}</p>
                </div>

                <p style={{ fontFamily: SANS, fontSize: 12, fontWeight: 700, letterSpacing: '.16em', textTransform: 'uppercase', color: GOLD_DK, margin: '26px 0 14px' }}>{r.pointsTitle}</p>
                <div style={{ display: 'grid', gap: 12, maxWidth: 560, margin: '0 auto' }}>
                  {r.points.map((p) => (
                    <div key={p} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                      <span style={{ width: 24, height: 24, flexShrink: 0, borderRadius: '50%', background: `linear-gradient(160deg,${PLUM_MID},${PLUM})`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 1 }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                      </span>
                      <span style={{ fontFamily: SANS, fontSize: 15.5, lineHeight: 1.5, color: '#403b3b' }}>{p}</span>
                    </div>
                  ))}
                </div>

                <p style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: 'clamp(16px,3.6vw,19px)', color: '#5f574c', lineHeight: 1.5, textAlign: 'center', margin: '24px auto 0', maxWidth: 540 }}>{r.fitLine}</p>

                {/* Testimonial */}
                <div style={{ margin: '26px auto', maxWidth: 520, background: PARCH, borderLeft: `3px solid ${GOLD}`, borderRadius: '0 8px 8px 0', padding: '16px 20px' }}>
                  <p style={{ fontFamily: SERIF, fontSize: 'clamp(18px,4vw,22px)', fontWeight: 500, color: INK, lineHeight: 1.35, margin: 0 }}>{r.quote}</p>
                  <p style={{ fontFamily: SANS, fontSize: 12.5, color: MUTE, margin: '8px 0 0', letterSpacing: '.02em' }}>{r.quoteBy}</p>
                </div>

                <div style={{ textAlign: 'center' }}>
                  <button onClick={bookCall} className="cta" style={{ ...goldBtn, width: '100%', maxWidth: 440, padding: '19px 26px', borderRadius: 9, fontSize: 15.5 }}>{firstName ? `Book My Free Call, ${firstName} →` : r.ctaLabel}</button>
                  <p style={{ fontFamily: SANS, fontSize: 13, color: MUTE, marginTop: 13, letterSpacing: '.02em' }}>{r.reassure}</p>
                </div>

                {/* Host credibility */}
                <p style={{ fontFamily: SANS, fontSize: 12.5, fontWeight: 300, color: MUTE, lineHeight: 1.6, textAlign: 'center', margin: '22px auto 0', maxWidth: 540, borderTop: `1px solid ${BORDER}`, paddingTop: 18 }}>{r.host}</p>
              </>
            )}
          </div>
        ) : (
          <div style={{ textAlign: 'center', marginTop: 20, fontFamily: SANS, color: MUTE, fontSize: 13.5, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, letterSpacing: '.02em' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={GOLD_DK} strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
            {WATCH.lockedHint}
          </div>
        )}
      </div>

      {/* Footer (legal / compliance) */}
      <footer style={{ marginTop: 46, background: `linear-gradient(180deg,${PLUM_2},${PLUM})`, padding: '30px 20px 36px' }}>
        <div style={{ maxWidth: 640, margin: '0 auto', textAlign: 'center' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/logo-white.png" alt="The5th Consulting" style={{ height: 'clamp(40px,10vw,52px)', width: 'auto', opacity: .95 }} />
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '6px 18px', marginTop: 16 }}>
            {LEGAL.links.map((l) => (
              <a key={l.href} href={l.href} target="_blank" rel="noopener noreferrer" style={{ fontFamily: SANS, fontSize: 12, color: 'rgba(255,255,255,.6)', textDecoration: 'none' }}>{l.label}</a>
            ))}
          </div>
          <div style={{ height: 1, background: 'rgba(255,255,255,.12)', margin: '18px 0' }} />
          <p style={{ fontFamily: SANS, fontSize: 10.5, color: 'rgba(255,255,255,.42)', lineHeight: 1.7, margin: 0 }}>{LEGAL.earnings}</p>
          <p style={{ fontFamily: SANS, fontSize: 10.5, color: 'rgba(255,255,255,.42)', lineHeight: 1.7, margin: '12px 0 0' }}>{LEGAL.meta}</p>
          <p style={{ fontFamily: SANS, fontSize: 11, color: 'rgba(255,255,255,.32)', marginTop: 16 }}>© {new Date().getFullYear()} The5th Consulting. All rights reserved.</p>
        </div>
      </footer>
    </main>
  )
}
