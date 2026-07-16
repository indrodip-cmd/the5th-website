'use client'
/* Gated VSL page. No navigation, no exit links.

   - Identifies the lead from localStorage (set at opt-in); bounces to the
     opt-in page if absent.
   - Lazy-mounts the player only when it scrolls into view.
   - Tracks real cumulative watch-time (survives pause/resume AND reload, seeded
     from localStorage), checkpoints to Supabase every 30s + on tab-close via
     sendBeacon, so partial-watch data is never lost.
   - Reveals the CTA + "Book a call" once the watch-time threshold is crossed.
   - Book-a-call opens the Typeform in an embedded popup (no redirect) with the
     lead's name/email passed as hidden fields. */
import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { WATCH } from '../config'
import VslPlayer from './VslPlayer'

const CREAM = '#FAF6F0'
const PLUM = '#2E1A35'
const GOLD = '#C9A84C'
const GOLD_DK = '#a9862f'
const INK = '#2a2233'
const MUTE = '#57505f'

type Lead = { name: string; email: string }

function loadScript(src: string, id: string) {
  if (document.getElementById(id)) return
  const s = document.createElement('script')
  s.src = src; s.id = id; s.async = true
  document.head.appendChild(s)
}

export default function WatchView({ videoUrl, revealSeconds, formId }: { videoUrl: string; revealSeconds: number; formId: string }) {
  const router = useRouter()
  const [lead, setLead] = useState<Lead | null>(null)
  const [seed, setSeed] = useState(0)
  const [mountPlayer, setMountPlayer] = useState(false)
  const [revealed, setRevealed] = useState(false)
  const [booked, setBooked] = useState(false)

  const secondsRef = useRef(0)
  const completedRef = useRef(false)
  const lastSyncRef = useRef(0)
  const revealedRef = useRef(false)
  const playerBoxRef = useRef<HTMLDivElement>(null)
  const leadRef = useRef<Lead | null>(null)

  // ── Identify the lead (or bounce back to opt-in) + seed prior watch-time ──
  useEffect(() => {
    let l: Lead | null = null
    try {
      const raw = localStorage.getItem('vsl_make10k')
      if (raw) { const p = JSON.parse(raw); if (p?.email) l = { name: p.name || '', email: p.email } }
    } catch { /* noop */ }
    if (!l) { router.replace('/lp/make-10k-month'); return }
    leadRef.current = l
    setLead(l)

    try {
      const w = JSON.parse(localStorage.getItem(`vsl_watch_${l.email}`) || '{}')
      const s = Number(w?.seconds) || 0
      secondsRef.current = s
      completedRef.current = Boolean(w?.completed)
      setSeed(s)
      if (s >= revealSeconds || w?.completed) { revealedRef.current = true; setRevealed(true) }
    } catch { /* noop */ }

    // Typeform embed SDK (popup — keeps the session, no redirect).
    loadScript('https://embed.typeform.com/next/embed.js', 'tf-embed-js')
    if (!document.getElementById('tf-embed-css')) {
      const link = document.createElement('link')
      link.id = 'tf-embed-css'; link.rel = 'stylesheet'
      link.href = 'https://embed.typeform.com/next/css/popup.css'
      document.head.appendChild(link)
    }
  }, [router, revealSeconds])

  // ── Checkpoint watch-time to Supabase (throttled + on tab-close) ──
  const sync = useCallback((opts: { force?: boolean } = {}) => {
    const l = leadRef.current
    if (!l) return
    const now = Date.now()
    if (!opts.force && now - lastSyncRef.current < 30000) return
    lastSyncRef.current = now
    const payload = JSON.stringify({ email: l.email, seconds: secondsRef.current, completed: completedRef.current })
    try {
      if (navigator.sendBeacon) {
        navigator.sendBeacon('/api/lp/watch-progress', new Blob([payload], { type: 'application/json' }))
      } else {
        fetch('/api/lp/watch-progress', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: payload, keepalive: true })
      }
    } catch { /* noop */ }
  }, [])

  // Player progress callback — runs ~1×/sec while playing.
  const onWatched = useCallback((cumulative: number, meta: { completed: boolean }) => {
    secondsRef.current = cumulative
    if (meta.completed) completedRef.current = true
    const l = leadRef.current
    if (l) { try { localStorage.setItem(`vsl_watch_${l.email}`, JSON.stringify({ seconds: cumulative, completed: completedRef.current })) } catch { /* noop */ } }

    if (!revealedRef.current && (cumulative >= revealSeconds || completedRef.current)) {
      revealedRef.current = true
      setRevealed(true)
      sync({ force: true }) // record watched_10min immediately
    } else {
      sync()
    }
  }, [revealSeconds, sync])

  // Lazy-mount the player only when it enters the viewport.
  useEffect(() => {
    if (!lead || !playerBoxRef.current) return
    const el = playerBoxRef.current
    const io = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) { setMountPlayer(true); io.disconnect() }
    }, { rootMargin: '200px' })
    io.observe(el)
    return () => io.disconnect()
  }, [lead])

  // Flush on tab-hide / unload so nothing is lost.
  useEffect(() => {
    const onHide = () => sync({ force: true })
    const onVis = () => { if (document.visibilityState === 'hidden') sync({ force: true }) }
    window.addEventListener('pagehide', onHide)
    document.addEventListener('visibilitychange', onVis)
    return () => { window.removeEventListener('pagehide', onHide); document.removeEventListener('visibilitychange', onVis) }
  }, [sync])

  function bookCall() {
    const l = leadRef.current
    type TfPopup = { open: () => void }
    type Tf = { createPopup: (id: string, opts: unknown) => TfPopup }
    const tf = (window as unknown as { tf?: Tf }).tf
    const hidden = { email: l?.email || '', name: l?.name || '' }
    if (tf?.createPopup) {
      tf.createPopup(formId, { hidden, size: 100, onSubmit: () => setBooked(true) }).open()
    } else {
      // SDK not ready — fall back to a new tab with hidden fields in the hash.
      const q = new URLSearchParams(hidden).toString()
      window.open(`https://form.typeform.com/to/${formId}#${q}`, '_blank', 'noopener')
    }
  }

  if (!lead) {
    return <main style={{ minHeight: '100dvh', background: CREAM }} />
  }

  const firstName = lead.name?.split(' ')[0] || 'there'

  return (
    <main style={{ minHeight: '100dvh', background: `radial-gradient(120% 60% at 50% -10%, #f7efe4 0%, ${CREAM} 55%)`, color: INK }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        .wv{font-family:Inter,system-ui,sans-serif}
        .wv-h{font-family:Gelica,Georgia,serif}
        @keyframes wvReveal{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:none}}
        .wv-reveal{animation:wvReveal .6s ease both}
        .wv-btn{transition:transform .12s ease,filter .12s ease}
        .wv-btn:hover{transform:translateY(-1px);filter:brightness(1.05)}
        .wv-pulse{animation:wvPulse 2.4s ease-in-out infinite}
        @keyframes wvPulse{0%,100%{box-shadow:0 10px 26px rgba(201,168,76,.35)}50%{box-shadow:0 10px 40px rgba(201,168,76,.6)}}
      `}</style>

      <div className="wv" style={{ maxWidth: 820, margin: '0 auto', padding: '26px 16px 70px' }}>
        <div style={{ textAlign: 'center', marginBottom: 18 }}>
          <span style={{ fontWeight: 800, letterSpacing: 3, fontSize: 11, color: PLUM }}>THE5TH CONSULTING</span>
        </div>

        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <div style={{ display: 'inline-block', fontSize: 10.5, fontWeight: 800, letterSpacing: 1.5, color: GOLD_DK, background: '#fff7e6', border: '1px solid #f0e2bd', borderRadius: 999, padding: '6px 13px', marginBottom: 14 }}>
            {WATCH.eyebrow}
          </div>
          <h1 className="wv-h" style={{ fontSize: 'clamp(24px,5.5vw,38px)', fontWeight: 700, lineHeight: 1.12, letterSpacing: '-.02em', margin: '0 auto 10px', maxWidth: 640 }}>
            {firstName}, {WATCH.headline.charAt(0).toLowerCase() + WATCH.headline.slice(1)}
          </h1>
          <p style={{ fontSize: 'clamp(14px,3.4vw,16.5px)', color: MUTE, lineHeight: 1.55, margin: '0 auto', maxWidth: 520 }}>{WATCH.sub}</p>
        </div>

        {/* Player */}
        <div ref={playerBoxRef} style={{ borderRadius: 16, boxShadow: '0 24px 60px rgba(46,26,53,.22)', overflow: 'hidden', background: '#120912' }}>
          {mountPlayer && videoUrl ? (
            <VslPlayer videoUrl={videoUrl} initialSeconds={seed} onWatched={onWatched} />
          ) : (
            <div style={{ width: '100%', aspectRatio: '16 / 9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#e9dcc4', fontSize: 14, textAlign: 'center', padding: 20 }}>
              {videoUrl ? 'Loading your training…' : 'Set NEXT_PUBLIC_VSL_VIDEO_URL to your VSL (YouTube or Vimeo) to play it here.'}
            </div>
          )}
        </div>

        {/* Locked hint OR revealed CTA */}
        {!revealed ? (
          <div style={{ textAlign: 'center', marginTop: 22, color: MUTE, fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={GOLD_DK} strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
            {WATCH.lockedHint}
          </div>
        ) : (
          <div className="wv-reveal" style={{ marginTop: 30, background: '#fff', border: `1px solid #efe7db`, borderRadius: 22, boxShadow: '0 22px 55px rgba(46,26,53,.14)', padding: 'clamp(22px,5vw,34px)', textAlign: 'center' }}>
            {booked ? (
              <>
                <div style={{ fontSize: 40, marginBottom: 8 }}>🎉</div>
                <h2 className="wv-h" style={{ fontSize: 'clamp(22px,5vw,30px)', fontWeight: 700, margin: '0 0 10px' }}>You’re booked, {firstName}!</h2>
                <p style={{ color: MUTE, fontSize: 15.5, lineHeight: 1.6, maxWidth: 460, margin: '0 auto' }}>
                  Check your email for the details. We can’t wait to map your path to $10K months with you.
                </p>
              </>
            ) : (
              <>
                <div style={{ display: 'inline-block', fontSize: 10.5, fontWeight: 800, letterSpacing: 1.5, color: GOLD_DK, marginBottom: 12 }}>{WATCH.reveal.eyebrow}</div>
                <h2 className="wv-h" style={{ fontSize: 'clamp(23px,5.4vw,34px)', fontWeight: 700, lineHeight: 1.12, letterSpacing: '-.02em', margin: '0 auto 14px', maxWidth: 560 }}>{WATCH.reveal.headline}</h2>
                <p style={{ color: MUTE, fontSize: 'clamp(15px,3.4vw,16.5px)', lineHeight: 1.6, maxWidth: 500, margin: '0 auto 20px' }}>{WATCH.reveal.body}</p>

                <div style={{ display: 'grid', gap: 10, maxWidth: 460, margin: '0 auto 24px', textAlign: 'left' }}>
                  {WATCH.reveal.points.map((p) => (
                    <div key={p} style={{ display: 'flex', gap: 11, alignItems: 'flex-start' }}>
                      <span style={{ width: 22, height: 22, flexShrink: 0, borderRadius: '50%', background: PLUM, display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 1 }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                      </span>
                      <span style={{ fontSize: 15, lineHeight: 1.5, color: INK }}>{p}</span>
                    </div>
                  ))}
                </div>

                <button onClick={bookCall} className="wv-btn wv-pulse" style={{ width: '100%', maxWidth: 460, padding: '18px 24px', border: 'none', borderRadius: 14, background: `linear-gradient(180deg, ${GOLD}, ${GOLD_DK})`, color: PLUM, fontWeight: 800, fontSize: 18, cursor: 'pointer', fontFamily: 'Inter,sans-serif' }}>
                  {WATCH.reveal.ctaLabel}
                </button>
                <p style={{ fontSize: 13, color: MUTE, marginTop: 13 }}>{WATCH.reveal.reassure}</p>
              </>
            )}
          </div>
        )}
      </div>
    </main>
  )
}
