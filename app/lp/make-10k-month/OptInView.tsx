'use client'
/* Single-page, video-gated cold-traffic funnel.

   Gate: the hero shows a video poster. Clicking it opens a modal asking for
   first name + email (no page redirect). On submit we create the lead
   (opted_in → vsl_leads + mirrored into crm_contacts), close the modal, and the
   VSL starts playing in the same spot with sound (a direct user gesture, not
   page-load autoplay). Closing the modal without submitting creates NO lead and
   the poster stays clickable to retry.

   Watch-time tracking + 10-min "Book a call" reveal come from useVslWatch.
   No navigation, no exit links. Mobile-first: the video sits above the fold. */
import { useEffect, useRef, useState } from 'react'
import { OPT_IN, MODAL, WATCH, REAL_PROOF } from './config'
import { useVslWatch } from './useVslWatch'
import VslPlayer from './watch/VslPlayer'

const CREAM = '#FAF6F0'
const PLUM = '#2E1A35'
const GOLD = '#C9A84C'
const GOLD_SOFT = '#E4C879'
const GOLD_DK = '#a9862f'
const INK = '#2a2233'
const MUTE = '#57505f'

type Lead = { name: string; email: string }

function ytPoster(url: string): string {
  const raw = (url || '').trim()
  let id = ''
  if (/^[a-zA-Z0-9_-]{11}$/.test(raw)) id = raw
  else {
    try {
      const u = new URL(raw.startsWith('http') ? raw : `https://${raw}`)
      if (u.hostname.includes('youtu')) id = u.searchParams.get('v') || u.pathname.split('/').filter(Boolean).pop() || ''
    } catch { /* noop */ }
  }
  return id ? `https://i.ytimg.com/vi/${id}/maxresdefault.jpg` : ''
}

function readVisitorId(): string | null {
  try {
    const ls = localStorage.getItem('t5_visitor_id') || localStorage.getItem('visitor_id')
    if (ls) return ls
    const m = document.cookie.match(/(?:^|;\s*)(?:t5_vid|visitor_id)=([^;]+)/)
    return m ? decodeURIComponent(m[1]) : null
  } catch { return null }
}
function readUtm(): Record<string, string> {
  const out: Record<string, string> = {}
  try {
    const p = new URLSearchParams(window.location.search)
    for (const k of ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'fbclid', 'gclid']) {
      const v = p.get(k); if (v) out[k] = v.slice(0, 120)
    }
  } catch { /* noop */ }
  return out
}

export default function FunnelView({ videoUrl, revealSeconds, formId }: { videoUrl: string; revealSeconds: number; formId: string }) {
  const [lead, setLead] = useState<Lead | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const meta = useRef<{ visitor_id: string | null; utm: Record<string, string> }>({ visitor_id: null, utm: {} })

  const { seed, revealed, booked, onWatched, bookCall } = useVslWatch(lead, revealSeconds, formId)

  // Returning visitor: if they already opted in, skip the gate and play.
  useEffect(() => {
    meta.current = { visitor_id: readVisitorId(), utm: readUtm() }
    try {
      const raw = localStorage.getItem('vsl_make10k')
      if (raw) { const p = JSON.parse(raw); if (p?.email) setLead({ name: p.name || '', email: p.email }) }
    } catch { /* noop */ }
  }, [])

  function openGate() { setError(''); setModalOpen(true) }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (loading) return
    setError('')
    if (!name.trim()) return setError('Please enter your first name.')
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) return setError('Please enter a valid email.')
    setLoading(true)
    try {
      const res = await fetch('/api/lp/opt-in', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), visitor_id: meta.current.visitor_id, utm: meta.current.utm }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) { setError(data?.error || 'Something went wrong. Please try again.'); setLoading(false); return }
      try { localStorage.setItem('vsl_make10k', JSON.stringify({ name: data.name, email: data.email, t: Date.now() })) } catch { /* noop */ }
      setModalOpen(false)
      setLead({ name: data.name || name.trim(), email: data.email }) // → player mounts + autoplays
    } catch {
      setError('Network error. Please try again.'); setLoading(false)
    }
  }

  const poster = ytPoster(videoUrl)
  const firstName = lead?.name?.split(' ')[0] || ''

  return (
    <main style={{ minHeight: '100dvh', background: `radial-gradient(120% 60% at 50% -8%, #f7efe4 0%, ${CREAM} 55%)`, color: INK }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        .lp{font-family:Inter,system-ui,sans-serif}
        .lp-h{font-family:Gelica,Georgia,serif}
        @keyframes lpRise{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}
        .lp-rise{animation:lpRise .5s ease both}
        .lp-input:focus{outline:none;border-color:${GOLD}!important;box-shadow:0 0 0 3px rgba(201,168,76,.2)!important}
        .lp-cta{transition:transform .12s ease,filter .12s ease,box-shadow .12s ease}
        .lp-cta:hover:not(:disabled){transform:translateY(-1px);filter:brightness(1.05)}
        .lp-cta:active:not(:disabled){transform:translateY(0)}
        .lp-play{transition:transform .18s ease}
        .lp-poster:hover .lp-play{transform:scale(1.08)}
        .lp-pulse{animation:lpPulse 2.4s ease-in-out infinite}
        @keyframes lpPulse{0%,100%{box-shadow:0 12px 30px rgba(201,168,76,.4)}50%{box-shadow:0 12px 46px rgba(201,168,76,.7)}}
        @keyframes lpFade{from{opacity:0}to{opacity:1}}
      `}</style>

      <div className="lp" style={{ maxWidth: 780, margin: '0 auto', padding: '18px 16px 60px' }}>
        {/* Brand mark (not a link — no funnel exits) */}
        <div style={{ textAlign: 'center', marginBottom: 14 }}>
          <span style={{ fontWeight: 800, letterSpacing: 3, fontSize: 11, color: PLUM }}>THE5TH CONSULTING</span>
        </div>

        {/* Hero — kept compact so the video is above the fold on mobile */}
        <div className="lp-rise" style={{ textAlign: 'center', marginBottom: 16 }}>
          <div style={{ display: 'inline-block', fontSize: 10.5, fontWeight: 800, letterSpacing: 1.4, color: GOLD_DK, background: '#fff7e6', border: '1px solid #f0e2bd', borderRadius: 999, padding: '6px 13px', marginBottom: 12 }}>
            {OPT_IN.eyebrow}
          </div>
          <h1 className="lp-h" style={{ fontSize: 'clamp(25px,6vw,40px)', fontWeight: 700, lineHeight: 1.1, letterSpacing: '-.02em', margin: '0 auto 8px', maxWidth: 600 }}>
            {firstName ? `${firstName}, ${OPT_IN.headline.charAt(0).toLowerCase() + OPT_IN.headline.slice(1)}` : OPT_IN.headline}
          </h1>
          <p style={{ fontSize: 'clamp(14px,3.4vw,16px)', color: MUTE, lineHeight: 1.5, margin: '0 auto', maxWidth: 440 }}>{OPT_IN.sub}</p>
        </div>

        {/* Video area — poster (gate) OR live player */}
        <div style={{ borderRadius: 16, boxShadow: '0 22px 55px rgba(46,26,53,.22)', overflow: 'hidden', background: '#120912' }}>
          {lead ? (
            videoUrl ? (
              <div style={{ animation: 'lpFade .4s ease' }}>
                <VslPlayer videoUrl={videoUrl} initialSeconds={seed} onWatched={onWatched} autoplay />
              </div>
            ) : (
              <div style={{ width: '100%', aspectRatio: '16 / 9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#e9dcc4', fontSize: 14, textAlign: 'center', padding: 20 }}>
                Set NEXT_PUBLIC_VSL_VIDEO_URL to your VSL (YouTube or Vimeo) to play it here.
              </div>
            )
          ) : (
            <button
              onClick={openGate}
              className="lp-poster"
              aria-label={OPT_IN.playLabel}
              style={{
                position: 'relative', width: '100%', aspectRatio: '16 / 9', border: 'none', cursor: 'pointer', padding: 0,
                background: poster ? `#120912 url(${poster}) center/cover` : `linear-gradient(150deg, #3D2645 0%, ${PLUM} 55%, #1C4A32 130%)`,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <span style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(18,9,18,.28), rgba(18,9,18,.62))' }} />
              <span className="lp-play lp-pulse" style={{ position: 'relative', width: 78, height: 78, borderRadius: '50%', background: `linear-gradient(180deg, ${GOLD_SOFT}, ${GOLD_DK})`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="30" height="30" viewBox="0 0 24 24" fill={PLUM}><path d="M8 5v14l11-7z" /></svg>
              </span>
              <span style={{ position: 'relative', marginTop: 16, color: '#fff', fontWeight: 800, fontSize: 'clamp(15px,3.6vw,18px)', letterSpacing: '.01em', textShadow: '0 2px 12px rgba(0,0,0,.4)' }}>
                {OPT_IN.playLabel}
              </span>
              <span style={{ position: 'relative', marginTop: 4, color: 'rgba(255,255,255,.75)', fontSize: 12.5 }}>Free · Tap to watch now</span>
            </button>
          )}
        </div>

        {/* Locked hint OR revealed CTA */}
        {lead && (revealed ? (
          <div className="lp-rise" style={{ marginTop: 26, background: '#fff', border: '1px solid #efe7db', borderRadius: 20, boxShadow: '0 22px 55px rgba(46,26,53,.14)', padding: 'clamp(22px,5vw,32px)', textAlign: 'center' }}>
            {booked ? (
              <>
                <div style={{ fontSize: 40, marginBottom: 8 }}>🎉</div>
                <h2 className="lp-h" style={{ fontSize: 'clamp(22px,5vw,30px)', fontWeight: 700, margin: '0 0 10px' }}>You’re booked{firstName ? `, ${firstName}` : ''}!</h2>
                <p style={{ color: MUTE, fontSize: 15.5, lineHeight: 1.6, maxWidth: 460, margin: '0 auto' }}>Check your email for the details. We can’t wait to map your path to $10K months with you.</p>
              </>
            ) : (
              <>
                <div style={{ display: 'inline-block', fontSize: 10.5, fontWeight: 800, letterSpacing: 1.5, color: GOLD_DK, marginBottom: 12 }}>{WATCH.reveal.eyebrow}</div>
                <h2 className="lp-h" style={{ fontSize: 'clamp(23px,5.4vw,34px)', fontWeight: 700, lineHeight: 1.12, letterSpacing: '-.02em', margin: '0 auto 14px', maxWidth: 560 }}>{WATCH.reveal.headline}</h2>
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
                <button onClick={bookCall} className="lp-cta lp-pulse" style={{ width: '100%', maxWidth: 460, padding: '18px 24px', border: 'none', borderRadius: 14, background: `linear-gradient(180deg, ${GOLD_SOFT}, ${GOLD_DK})`, color: PLUM, fontWeight: 800, fontSize: 18, cursor: 'pointer' }}>{WATCH.reveal.ctaLabel}</button>
                <p style={{ fontSize: 13, color: MUTE, marginTop: 13 }}>{WATCH.reveal.reassure}</p>
              </>
            )}
          </div>
        ) : (
          <div style={{ textAlign: 'center', marginTop: 18, color: MUTE, fontSize: 13.5, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={GOLD_DK} strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
            {WATCH.lockedHint}
          </div>
        ))}

        {/* ── Real social proof (near the CTA) ── */}
        <section style={{ marginTop: 34 }}>
          <p style={{ textAlign: 'center', fontSize: 12, fontWeight: 800, letterSpacing: 1.6, color: GOLD_DK, marginBottom: 16 }}>
            REAL RESULTS FROM THE 10K ROADMAP
          </p>
          <div style={{ display: 'grid', gap: 12 }}>
            {REAL_PROOF.map((p) => (
              <div key={p.name} style={{ background: '#fff', border: '1px solid #efe7db', borderRadius: 14, padding: '16px 18px', boxShadow: '0 8px 22px rgba(46,26,53,.05)' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                  <span className="lp-h" style={{ fontSize: 17, fontWeight: 700, color: INK }}>{p.name}</span>
                  <span style={{ fontSize: 14.5, fontWeight: 800, color: '#1C4A32' }}>{p.result}</span>
                </div>
                <div style={{ fontSize: 11.5, color: GOLD_DK, fontWeight: 700, letterSpacing: .3, margin: '3px 0 8px' }}>{p.role}</div>
                <p style={{ fontSize: 13.5, color: MUTE, lineHeight: 1.55, margin: 0 }}>{p.quote}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Secondary: what's inside (clearly below the fold, de-emphasised) ── */}
        <hr style={{ border: 0, borderTop: '1px solid #e7ddcf', margin: '34px 0 22px' }} />
        <section>
          <p style={{ textAlign: 'center', fontSize: 11.5, fontWeight: 700, letterSpacing: 1.2, color: '#9a8f80', marginBottom: 14 }}>{OPT_IN.checklistTitle.toUpperCase()}</p>
          <div style={{ display: 'grid', gap: 8, maxWidth: 560, margin: '0 auto' }}>
            {OPT_IN.bullets.map((b) => (
              <div key={b} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#b6a98f" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 3 }}><polyline points="20 6 9 17 4 12" /></svg>
                <span style={{ fontSize: 13.5, lineHeight: 1.5, color: '#7c7367', fontWeight: 400 }}>{b}</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* ── Opt-in modal (the gate) ── */}
      {modalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={(e) => { if (e.target === e.currentTarget && !loading) setModalOpen(false) }}
          style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(24,12,26,.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, animation: 'lpFade .2s ease' }}
        >
          <div className="lp" style={{ position: 'relative', width: '100%', maxWidth: 420, background: '#fff', borderRadius: 20, boxShadow: '0 30px 70px rgba(20,8,22,.4)', padding: 'clamp(22px,5vw,30px)', animation: 'lpRise .3s ease both' }}>
            <button onClick={() => !loading && setModalOpen(false)} aria-label="Close" style={{ position: 'absolute', top: 12, right: 12, width: 32, height: 32, borderRadius: '50%', border: 'none', background: '#f2ece3', color: '#7c7367', fontSize: 18, cursor: 'pointer', lineHeight: 1 }}>×</button>
            <div style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: 1.4, color: GOLD_DK, marginBottom: 8 }}>{MODAL.eyebrow}</div>
            <h2 className="lp-h" style={{ fontSize: 'clamp(21px,5vw,26px)', fontWeight: 700, lineHeight: 1.15, margin: '0 0 8px' }}>{MODAL.title}</h2>
            <p style={{ fontSize: 14, color: MUTE, lineHeight: 1.5, margin: '0 0 18px' }}>{MODAL.sub}</p>
            <form onSubmit={submit}>
              <input className="lp-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="First name" autoComplete="given-name" autoFocus enterKeyHint="next" style={inputStyle} />
              <input className="lp-input" type="email" inputMode="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" autoComplete="email" enterKeyHint="go" style={{ ...inputStyle, marginTop: 12 }} />
              {error && <div style={{ marginTop: 11, color: '#a3341f', background: '#fdeee9', border: '1px solid #f6cabb', borderRadius: 10, padding: '9px 12px', fontSize: 13 }}>{error}</div>}
              <button type="submit" disabled={loading} className="lp-cta" style={{ width: '100%', marginTop: 15, padding: '16px 22px', border: 'none', borderRadius: 12, background: loading ? '#c9b98a' : `linear-gradient(180deg, ${GOLD_SOFT}, ${GOLD_DK})`, color: PLUM, fontWeight: 800, fontSize: 16.5, cursor: loading ? 'wait' : 'pointer', boxShadow: '0 10px 24px rgba(201,168,76,.4)' }}>
                {loading ? 'Starting your training…' : MODAL.cta}
              </button>
              <p style={{ textAlign: 'center', fontSize: 12, color: '#8a8075', marginTop: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#8a8075" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                {MODAL.microtrust}
              </p>
            </form>
          </div>
        </div>
      )}
    </main>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '14px 16px', fontSize: 16, borderRadius: 12,
  border: '1.5px solid #e3d9cb', background: '#fffdfa', color: '#2a2233',
  fontFamily: 'Inter,sans-serif', transition: 'border-color .12s ease, box-shadow .12s ease',
}
