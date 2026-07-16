'use client'
/* Single-page, video-gated cold-traffic funnel — built to the5th.consulting's
   premium standard (Cormorant Garamond + DM Sans, plum/gold/parchment, real
   logo). Designed for experts & coaches over 40: elegant, warm, high-contrast,
   generous type, calm luxury — not hype.

   Gate: hero shows a framed video poster. Clicking it opens a modal (first name
   + email, no redirect). On submit the lead is created (opted_in → vsl_leads +
   mirrored into crm_contacts), the modal closes, and the masterclass plays in
   place with sound. Closing without submitting creates no lead; the poster stays
   clickable. Watch-time + 10-min "Book a call" reveal come from useVslWatch. */
import { useEffect, useRef, useState } from 'react'
import { OPT_IN, MODAL, WATCH, REAL_PROOF } from './config'
import { useVslWatch } from './useVslWatch'
import VslPlayer from './watch/VslPlayer'

// ── Brand tokens (from public/index.html :root) ──
const SERIF = "'Cormorant Garamond', Georgia, serif"
const SANS = "'DM Sans', system-ui, -apple-system, sans-serif"
const PLUM = '#2E1A35'
const PLUM_2 = '#3D2645'
const PLUM_MID = '#4E3158'
const GOLD = '#C9A84C'
const GOLD_L = '#E4C879'
const GOLD_DK = '#B0902F'
const GREEN = '#1C4A32'
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
    const w = window as unknown as { __a5vid?: string }
    const ls = w.__a5vid || localStorage.getItem('a5_vid') || localStorage.getItem('t5_visitor_id') || localStorage.getItem('visitor_id')
    if (ls) return ls
    const m = document.cookie.match(/(?:^|;\s*)(?:a5_vid|t5_vid|visitor_id)=([^;]+)/)
    return m ? decodeURIComponent(m[1]) : null
  } catch { return null }
}

const CLIENT_AVATARS = Array.from({ length: 12 }, (_, i) => `/clients/c${i + 1}.jpg`)
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

// Small letter-spaced eyebrow with flanking gold hairlines.
function Eyebrow({ children, light = false }: { children: React.ReactNode; light?: boolean }) {
  const c = light ? 'rgba(201,168,76,.95)' : GOLD_DK
  const line = light ? 'rgba(201,168,76,.5)' : 'rgba(201,168,76,.55)'
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 16 }}>
      <span style={{ width: 26, height: 1, background: line }} />
      <span style={{ fontFamily: SANS, fontSize: 11.5, fontWeight: 600, letterSpacing: '.2em', textTransform: 'uppercase', color: c }}>{children}</span>
      <span style={{ width: 26, height: 1, background: line }} />
    </div>
  )
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
      setLead({ name: data.name || name.trim(), email: data.email })
    } catch {
      setError('Network error. Please try again.'); setLoading(false)
    }
  }

  const poster = ytPoster(videoUrl)
  const firstName = lead?.name?.split(' ')[0] || ''

  return (
    <main style={{ minHeight: '100dvh', background: `radial-gradient(140% 90% at 50% -20%, #FBF8F3 0%, ${PARCH} 45%, #F3ECE2 100%)`, color: INK, fontFamily: SANS }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=DM+Sans:wght@300;400;500;600;700&display=swap');
        *{box-sizing:border-box}
        @keyframes rise{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
        @keyframes fade{from{opacity:0}to{opacity:1}}
        @keyframes halo{0%{transform:scale(1);opacity:.7}70%{transform:scale(1.5);opacity:0}100%{opacity:0}}
        @keyframes glow{0%,100%{box-shadow:0 12px 28px rgba(201,168,76,.30),inset 0 1px 0 rgba(255,255,255,.5)}50%{box-shadow:0 12px 40px rgba(201,168,76,.55),inset 0 1px 0 rgba(255,255,255,.5)}}
        .rise{animation:rise .6s ease both}
        .lp-input{width:100%;padding:15px 16px;font-size:16px;border-radius:8px;border:1.5px solid ${BORDER};background:#fff;color:${INK};font-family:${SANS};transition:border-color .15s,box-shadow .15s}
        .lp-input::placeholder{color:#b3aca0}
        .lp-input:focus{outline:none;border-color:${GOLD};box-shadow:0 0 0 3px rgba(201,168,76,.18)}
        .cta{transition:transform .15s ease,filter .15s ease,box-shadow .15s ease}
        .cta:hover:not(:disabled){transform:translateY(-2px);filter:brightness(1.03)}
        .cta:active:not(:disabled){transform:translateY(0)}
        .poster{transition:transform .3s ease}
        .posterWrap:hover .poster{transform:scale(1.03)}
        .posterWrap:hover .playBtn{transform:scale(1.06)}
        .playBtn{transition:transform .25s ease}
      `}</style>

      {/* ── Top bar: real logo, centered, on parchment ── */}
      <header style={{ padding: '16px 20px 15px', textAlign: 'center', borderBottom: `1px solid rgba(221,216,207,.8)`, background: 'rgba(250,246,240,.6)' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/logo.png" alt="The5th Consulting" style={{ height: 38, width: 'auto', verticalAlign: 'middle' }} />
      </header>

      <div style={{ maxWidth: 760, margin: '0 auto', padding: '30px 18px 10px' }}>
        {/* ── Hero (compact so the video sits above the fold on mobile) ── */}
        <div className="rise" style={{ textAlign: 'center' }}>
          <Eyebrow>{OPT_IN.eyebrow}</Eyebrow>
          <h1 style={{ fontFamily: SERIF, fontSize: 'clamp(27px,6vw,46px)', fontWeight: 500, lineHeight: 1.12, letterSpacing: '-.01em', margin: '0 auto', maxWidth: 640, color: INK }}>
            {OPT_IN.headline}
          </h1>
          <p style={{ fontFamily: SANS, fontSize: 'clamp(14.5px,3.3vw,16.5px)', fontWeight: 300, color: '#5f574c', lineHeight: 1.6, margin: '16px auto 0', maxWidth: 560 }}>
            {OPT_IN.sub}
          </p>
        </div>

        {/* ── Cinema-framed video ── */}
        <div className="rise" style={{ marginTop: 26, padding: 8, borderRadius: 16, background: `linear-gradient(160deg, rgba(201,168,76,.28), rgba(201,168,76,.06))`, boxShadow: '0 34px 80px -30px rgba(46,26,53,.55)' }}>
          <div style={{ borderRadius: 11, overflow: 'hidden', background: '#120912', border: '1px solid rgba(255,255,255,.06)' }}>
            {lead ? (
              videoUrl ? (
                <div style={{ animation: 'fade .5s ease' }}>
                  <VslPlayer videoUrl={videoUrl} initialSeconds={seed} onWatched={onWatched} autoplay />
                </div>
              ) : (
                <div style={{ width: '100%', aspectRatio: '16 / 9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#e9dcc4', fontFamily: SANS, fontSize: 14, textAlign: 'center', padding: 20 }}>
                  Set NEXT_PUBLIC_VSL_VIDEO_URL to your masterclass (YouTube or Vimeo) to play it here.
                </div>
              )
            ) : (
              <button
                onClick={openGate}
                className="posterWrap"
                aria-label={OPT_IN.playLabel}
                style={{ position: 'relative', display: 'block', width: '100%', aspectRatio: '16 / 9', border: 'none', cursor: 'pointer', padding: 0, background: '#120912', overflow: 'hidden' }}
              >
                <span
                  className="poster"
                  style={{
                    position: 'absolute', inset: 0,
                    background: poster ? `#120912 url(${poster}) center/cover` : `linear-gradient(155deg, ${PLUM_MID} 0%, ${PLUM} 55%, ${GREEN} 135%)`,
                  }}
                />
                <span style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(18,9,18,.32) 0%, rgba(18,9,18,.30) 40%, rgba(18,9,18,.68) 100%)' }} />
                {/* gold "FREE MASTERCLASS" tab */}
                <span style={{ position: 'absolute', top: 14, left: 14, fontFamily: SANS, fontSize: 10.5, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', color: PLUM, background: `linear-gradient(180deg,${GOLD_L},${GOLD})`, padding: '5px 11px', borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,.25)' }}>Free Masterclass</span>
                {/* play button with halo */}
                <span style={{ position: 'absolute', left: '50%', top: '46%', transform: 'translate(-50%,-50%)', width: 88, height: 88 }}>
                  <span style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: `1.5px solid rgba(201,168,76,.6)`, animation: 'halo 2.4s ease-out infinite' }} />
                  <span className="playBtn" style={{ position: 'absolute', inset: 6, borderRadius: '50%', background: `linear-gradient(180deg,${GOLD_L},#B8983F)`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 30px rgba(0,0,0,.4), inset 0 1px 0 rgba(255,255,255,.6)' }}>
                    <svg width="30" height="30" viewBox="0 0 24 24" fill={PLUM} style={{ marginLeft: 4 }}><path d="M8 5v14l11-7z" /></svg>
                  </span>
                </span>
                {/* label */}
                <span style={{ position: 'absolute', left: 0, right: 0, bottom: 20, textAlign: 'center' }}>
                  <span style={{ display: 'block', fontFamily: SERIF, fontWeight: 600, fontSize: 'clamp(19px,4.4vw,25px)', color: '#fff', letterSpacing: '.01em', textShadow: '0 2px 16px rgba(0,0,0,.5)' }}>{OPT_IN.playLabel}</span>
                  <span style={{ display: 'block', fontFamily: SANS, fontSize: 12.5, color: 'rgba(255,255,255,.82)', marginTop: 5, letterSpacing: '.02em' }}>{OPT_IN.playNote}</span>
                </span>
              </button>
            )}
          </div>
        </div>

        {/* ── Primary CTA button + client social proof (mirrors /quiz) ── */}
        {!lead && (
          <div className="rise" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 24 }}>
            <button onClick={openGate} className="cta" style={{ ...goldBtn, width: '100%', maxWidth: 470, padding: '19px 26px', borderRadius: 9, fontSize: 15.5, animation: 'glow 3s ease-in-out infinite' }}>
              {OPT_IN.ctaButton}
            </button>
            <p style={{ fontFamily: SANS, fontSize: 12.5, color: MUTE, marginTop: 13, letterSpacing: '.02em', display: 'flex', alignItems: 'center', gap: 7 }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={GOLD_DK} strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
              {OPT_IN.ctaMicro}
            </p>

            {/* Client avatar strip + rating */}
            <div style={{ display: 'flex', alignItems: 'center', marginTop: 22 }}>
              {CLIENT_AVATARS.map((src, i) => (
                <span key={src} style={{ width: 'clamp(34px,8.5vw,42px)', height: 'clamp(34px,8.5vw,42px)', borderRadius: '50%', overflow: 'hidden', border: '2px solid #FBF8F3', boxShadow: '0 2px 6px rgba(46,26,53,.18)', marginLeft: i === 0 ? 0 : -11, zIndex: 12 - i, position: 'relative', flexShrink: 0, background: '#EAE3D8' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center' }} />
                </span>
              ))}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginTop: 12 }}>
              <span style={{ color: GOLD, fontSize: 17, letterSpacing: 1 }}>★★★★<span style={{ opacity: .45 }}>★</span></span>
              <span style={{ fontFamily: SANS, fontSize: 13.5, color: '#5f574c' }}>
                <strong style={{ color: INK, fontWeight: 700 }}>{OPT_IN.rating.score} stars</strong> {OPT_IN.rating.text}
              </span>
            </div>
          </div>
        )}

        {/* ── Locked hint OR revealed invitation ── */}
        {lead && (revealed ? (
          <div className="rise" style={{ marginTop: 30, background: '#fff', border: `1px solid ${BORDER}`, borderTop: `3px solid ${GOLD}`, borderRadius: 14, boxShadow: '0 30px 70px -40px rgba(46,26,53,.5)', padding: 'clamp(26px,6vw,40px)', textAlign: 'center' }}>
            {booked ? (
              <>
                <div style={{ fontSize: 40, marginBottom: 10 }}>🕊️</div>
                <h2 style={{ fontFamily: SERIF, fontSize: 'clamp(26px,5.6vw,36px)', fontWeight: 500, margin: '0 0 12px', color: INK }}>You’re booked{firstName ? `, ${firstName}` : ''}.</h2>
                <p style={{ fontFamily: SANS, fontSize: 16, fontWeight: 300, color: '#5f574c', lineHeight: 1.7, maxWidth: 460, margin: '0 auto' }}>Check your email for the details. We can’t wait to map your path to $10K months with you.</p>
              </>
            ) : (
              <>
                <Eyebrow>{WATCH.reveal.eyebrow}</Eyebrow>
                <h2 style={{ fontFamily: SERIF, fontSize: 'clamp(27px,5.8vw,40px)', fontWeight: 500, lineHeight: 1.1, letterSpacing: '-.01em', margin: '0 auto 16px', maxWidth: 560, color: INK }}>{WATCH.reveal.headline}</h2>
                <p style={{ fontFamily: SANS, fontSize: 'clamp(15px,3.4vw,17px)', fontWeight: 300, color: '#5f574c', lineHeight: 1.7, maxWidth: 500, margin: '0 auto 24px' }}>{WATCH.reveal.body}</p>
                <div style={{ display: 'grid', gap: 12, maxWidth: 440, margin: '0 auto 28px', textAlign: 'left' }}>
                  {WATCH.reveal.points.map((p) => (
                    <div key={p} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                      <span style={{ width: 24, height: 24, flexShrink: 0, borderRadius: '50%', background: `linear-gradient(160deg,${PLUM_MID},${PLUM})`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 1 }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                      </span>
                      <span style={{ fontFamily: SANS, fontSize: 15.5, lineHeight: 1.5, color: '#403b3b' }}>{p}</span>
                    </div>
                  ))}
                </div>
                <button onClick={bookCall} className="cta" style={{ ...goldBtn, width: '100%', maxWidth: 440, padding: '18px 26px', borderRadius: 8, fontSize: 15, animation: 'glow 3s ease-in-out infinite' }}>{WATCH.reveal.ctaLabel}</button>
                <p style={{ fontFamily: SANS, fontSize: 13, color: MUTE, marginTop: 14, letterSpacing: '.02em' }}>{WATCH.reveal.reassure}</p>
              </>
            )}
          </div>
        ) : (
          <div style={{ textAlign: 'center', marginTop: 20, fontFamily: SANS, color: MUTE, fontSize: 13.5, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, letterSpacing: '.02em' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={GOLD_DK} strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
            {WATCH.lockedHint}
          </div>
        ))}

        {/* ── Real social proof ── */}
        <section id="proof" style={{ marginTop: 46, scrollMarginTop: 20 }}>
          <div style={{ textAlign: 'center', marginBottom: 22 }}>
            <Eyebrow>{OPT_IN.proofEyebrow}</Eyebrow>
            <h2 style={{ fontFamily: SERIF, fontSize: 'clamp(24px,5vw,34px)', fontWeight: 500, lineHeight: 1.14, letterSpacing: '-.01em', margin: 0, color: INK }}>{OPT_IN.proofHeading}</h2>
          </div>
          <div style={{ display: 'grid', gap: 14 }}>
            {REAL_PROOF.map((p) => (
              <figure key={p.name} style={{ margin: 0, background: '#fff', border: `1px solid ${BORDER}`, borderRadius: 12, padding: '20px 22px', boxShadow: '0 18px 44px -34px rgba(46,26,53,.55)' }}>
                <div style={{ display: 'flex', gap: 14, alignItems: 'center', marginBottom: 12 }}>
                  {p.photo ? (
                    <span style={{ width: 50, height: 50, flexShrink: 0, borderRadius: '50%', overflow: 'hidden', border: `2px solid rgba(201,168,76,.45)`, boxShadow: '0 4px 12px rgba(46,26,53,.18)' }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={p.photo} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center' }} />
                    </span>
                  ) : (
                    <span style={{ width: 50, height: 50, flexShrink: 0, borderRadius: '50%', background: `linear-gradient(160deg,${PLUM_MID},${PLUM})`, border: `2px solid rgba(201,168,76,.4)`, color: GOLD, fontFamily: SERIF, fontSize: 24, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{p.name.charAt(0)}</span>
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: SERIF, fontSize: 22, fontWeight: 600, lineHeight: 1.1, color: INK }}>{p.name}</div>
                    <div style={{ fontFamily: SANS, fontSize: 11.5, fontWeight: 500, letterSpacing: '.04em', color: MUTE, marginTop: 2 }}>{p.role}</div>
                  </div>
                  <span style={{ fontFamily: SANS, fontSize: 14, fontWeight: 700, color: GREEN, textAlign: 'right', flexShrink: 0 }}>{p.result}</span>
                </div>
                <blockquote style={{ margin: 0, fontFamily: SANS, fontSize: 14.5, fontWeight: 300, color: '#5f574c', lineHeight: 1.65 }}>{p.quote}</blockquote>
              </figure>
            ))}
          </div>
          <p style={{ fontFamily: SANS, fontSize: 11.5, fontWeight: 300, color: MUTE, lineHeight: 1.55, textAlign: 'center', margin: '16px auto 0', maxWidth: 520 }}>
            {OPT_IN.proofDisclaimer}
          </p>
        </section>

        {/* ── Secondary: the story + what's inside (de-weighted, after the proof) ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, margin: '44px 0 24px' }}>
          <span style={{ flex: 1, height: 1, background: 'linear-gradient(90deg,transparent,rgba(201,168,76,.5))' }} />
          <span style={{ fontFamily: SANS, fontSize: 11, fontWeight: 600, letterSpacing: '.2em', textTransform: 'uppercase', color: MUTE }}>Is This For You?</span>
          <span style={{ flex: 1, height: 1, background: 'linear-gradient(90deg,rgba(201,168,76,.5),transparent)' }} />
        </div>
        <section style={{ maxWidth: 600, margin: '0 auto' }}>
          {OPT_IN.narrative.map((line, i) => (
            <p key={i} style={{ fontFamily: SANS, fontSize: i === 0 ? 16.5 : 15, fontWeight: i === 0 ? 500 : 300, color: i === 0 ? INK : '#5f574c', lineHeight: 1.65, textAlign: 'center', margin: i === 0 ? '0 0 12px' : '0 0 12px' }}>{line}</p>
          ))}

          <p style={{ fontFamily: SANS, fontSize: 11, fontWeight: 700, letterSpacing: '.18em', textTransform: 'uppercase', color: GOLD_DK, textAlign: 'center', margin: '26px 0 16px' }}>{OPT_IN.checklistTitle}</p>
          <div style={{ display: 'grid', gap: 12 }}>
            {OPT_IN.bullets.map((b) => (
              <div key={b} style={{ display: 'flex', gap: 11, alignItems: 'flex-start' }}>
                <span style={{ color: GOLD_DK, fontFamily: SANS, fontSize: 16, fontWeight: 700, lineHeight: 1.4, flexShrink: 0 }}>→</span>
                <span style={{ fontFamily: SANS, fontSize: 15, fontWeight: 400, lineHeight: 1.55, color: '#4a4238' }}>{b}</span>
              </div>
            ))}
          </div>

          <p style={{ fontFamily: SERIF, fontSize: 'clamp(19px,4.4vw,24px)', fontWeight: 500, color: INK, textAlign: 'center', margin: '28px 0 20px' }}>{OPT_IN.narrativeClose}</p>
          {!lead && (
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <button onClick={openGate} className="cta" style={{ ...goldBtn, width: '100%', maxWidth: 440, padding: '17px 26px', borderRadius: 9, fontSize: 14.5 }}>{OPT_IN.ctaButton}</button>
            </div>
          )}
        </section>
      </div>

      {/* ── Footer ── */}
      <footer style={{ marginTop: 50, background: `linear-gradient(180deg,${PLUM_2},${PLUM})`, padding: '30px 20px 34px', textAlign: 'center' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/logo-white.png" alt="The5th Consulting" style={{ height: 30, width: 'auto', opacity: .95 }} />
        <p style={{ fontFamily: SANS, fontSize: 12, color: 'rgba(255,255,255,.55)', marginTop: 14, lineHeight: 1.6 }}>
          Helping experts 40+ turn decades of expertise into income.
        </p>
        <p style={{ fontFamily: SANS, fontSize: 11, color: 'rgba(255,255,255,.32)', marginTop: 6 }}>© {new Date().getFullYear()} The5th Consulting. All rights reserved.</p>
      </footer>

      {/* ── Opt-in modal (the gate) ── */}
      {modalOpen && (
        <div
          role="dialog" aria-modal="true"
          onClick={(e) => { if (e.target === e.currentTarget && !loading) setModalOpen(false) }}
          style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(24,12,26,.62)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, animation: 'fade .2s ease' }}
        >
          <div style={{ position: 'relative', width: '100%', maxWidth: 430, background: PARCH, borderRadius: 16, boxShadow: '0 40px 90px rgba(20,8,22,.5)', overflow: 'hidden', animation: 'rise .35s ease both' }}>
            <div style={{ background: `linear-gradient(180deg,${PLUM_2},${PLUM})`, height: 4 }} />
            <button onClick={() => !loading && setModalOpen(false)} aria-label="Close" style={{ position: 'absolute', top: 14, right: 14, width: 32, height: 32, borderRadius: '50%', border: 'none', background: 'rgba(46,26,53,.06)', color: '#8a8075', fontSize: 18, cursor: 'pointer', lineHeight: 1 }}>×</button>
            <div style={{ padding: 'clamp(24px,6vw,34px)' }}>
              <Eyebrow>{MODAL.eyebrow}</Eyebrow>
              <h2 style={{ fontFamily: SERIF, fontSize: 'clamp(24px,6vw,30px)', fontWeight: 500, lineHeight: 1.14, margin: '0 0 8px', textAlign: 'center', color: INK }}>{MODAL.title}</h2>
              <p style={{ fontFamily: SANS, fontSize: 14.5, fontWeight: 300, color: '#5f574c', lineHeight: 1.55, margin: '0 0 20px', textAlign: 'center' }}>{MODAL.sub}</p>
              <form onSubmit={submit}>
                <input className="lp-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="First name" autoComplete="given-name" autoFocus enterKeyHint="next" />
                <input className="lp-input" style={{ marginTop: 12 }} type="email" inputMode="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" autoComplete="email" enterKeyHint="go" />
                {error && <div style={{ marginTop: 12, fontFamily: SANS, color: '#a3341f', background: '#fdeee9', border: '1px solid #f6cabb', borderRadius: 8, padding: '10px 12px', fontSize: 13 }}>{error}</div>}
                <button type="submit" disabled={loading} className="cta" style={{ ...goldBtn, width: '100%', marginTop: 16, padding: '17px 22px', borderRadius: 8, fontSize: 14 }}>
                  {loading ? 'Starting…' : MODAL.cta}
                </button>
                <p style={{ fontFamily: SANS, textAlign: 'center', fontSize: 12, color: MUTE, marginTop: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={MUTE} strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                  {MODAL.microtrust}
                </p>
              </form>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
