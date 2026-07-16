'use client'
/* Cold-traffic opt-in / sales page (built to the5th.consulting's premium
   standard). The hero video is a poster/teaser: clicking it (or any CTA) opens
   a modal that captures first name + email + phone. On submit the lead is
   created (opted_in → vsl_leads + crm_contacts) and we route to the dedicated
   /watch page where the training actually plays.

   No navigation, no exit links (except required legal). Mobile-first. */
import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { OPT_IN, MODAL, REAL_PROOF, LEGAL } from './config'
import ProofPopups from './ProofPopups'

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
const WATCH_URL = '/lp/make-10k-month/watch'

/* Identity for on-page personalization only: URL params (?name=) first, then
   the stored lead. Access to the training itself is gated server-side by an
   HttpOnly cookie, NOT by these values. */
function readIdentity(): { name: string; email: string } | null {
  try {
    const p = new URLSearchParams(window.location.search)
    const un = p.get('name') || p.get('n')
    const ue = p.get('email') || p.get('e')
    if (un || ue) return { name: (un || '').slice(0, 120), email: (ue || '').trim().toLowerCase() }
    const raw = localStorage.getItem('vsl_make10k')
    if (raw) { const j = JSON.parse(raw); if (j?.email || j?.name) return { name: j.name || '', email: j.email || '' } }
  } catch { /* noop */ }
  return null
}

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

const CLIENT_AVATARS = Array.from({ length: 12 }, (_, i) => `/clients/c${i + 1}.jpg`)

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 16 }}>
      <span style={{ width: 26, height: 1, background: 'rgba(201,168,76,.55)' }} />
      <span style={{ fontFamily: SANS, fontSize: 11.5, fontWeight: 600, letterSpacing: '.2em', textTransform: 'uppercase', color: GOLD_DK }}>{children}</span>
      <span style={{ width: 26, height: 1, background: 'rgba(201,168,76,.55)' }} />
    </div>
  )
}

export default function FunnelView({ videoUrl }: { videoUrl: string }) {
  const router = useRouter()
  const [lead, setLead] = useState<Lead | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const meta = useRef<{ visitor_id: string | null; utm: Record<string, string> }>({ visitor_id: null, utm: {} })

  const [identity, setIdentity] = useState<{ name: string; email: string } | null>(null)
  const [resuming, setResuming] = useState(false)
  const firstName = (identity?.name || lead?.name || '').split(' ')[0] || ''
  const ctaLabel = resuming
    ? 'One moment…'
    : lead
      ? `Resume the Training${firstName ? `, ${firstName}` : ''} →`
      : firstName ? `Watch Now, ${firstName} →` : OPT_IN.ctaButton

  // Opt-in progress: 20% on open → 90% once they enter a name → the last 10%
  // across email/phone and the redirect. No number shown — the bar tells the
  // story (near-completion nudge).
  const progress = loading ? 100
    : phone.replace(/\D/g, '').length >= 6 ? 97
      : email.trim() ? 94
        : name.trim() ? 90
          : 20

  useEffect(() => {
    meta.current = { visitor_id: readVisitorId(), utm: readUtm() }
    router.prefetch(WATCH_URL)
    const id = readIdentity()
    if (id) { setIdentity(id); if (id.name) setName(id.name) }
    try {
      const raw = localStorage.getItem('vsl_make10k')
      if (raw) { const p = JSON.parse(raw); if (p?.email) setLead({ name: p.name || '', email: p.email }) }
    } catch { /* noop */ }
  }, [router])

  // Poster / CTA: returning opted-in visitors go straight to the training
  // (carrying identity in the URL); everyone else opens the opt-in gate.
  async function primaryAction() {
    // Returning visitor: re-issue the session pass (no second opt-in) and go
    // straight to the training. If the email isn't recognised, fall through to
    // the opt-in gate.
    if (lead?.email && !resuming) {
      setResuming(true)
      try {
        const res = await fetch('/api/lp/resume', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: lead.email }),
        })
        if (res.ok) { router.push(WATCH_URL); return }
      } catch { /* noop */ }
      setResuming(false)
    }
    setError(''); setModalOpen(true)
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (loading) return
    setError('')
    if (!name.trim()) return setError('Please enter your first name.')
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) return setError('Please enter a valid email.')
    const digits = phone.replace(/\D/g, '')
    if (digits.length < 8) return setError('Please enter a valid phone number (with country code).')
    setLoading(true)
    try {
      const res = await fetch('/api/lp/opt-in', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), phone: phone.trim(), visitor_id: meta.current.visitor_id, utm: meta.current.utm }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) { setError(data?.error || 'Something went wrong. Please try again.'); setLoading(false); return }
      try { localStorage.setItem('vsl_make10k', JSON.stringify({ name: data.name, email: data.email, t: Date.now() })) } catch { /* noop */ }
      router.push(WATCH_URL)
    } catch {
      setError('Network error. Please try again.'); setLoading(false)
    }
  }

  const poster = ytPoster(videoUrl)

  return (
    <main style={{ minHeight: '100dvh', background: `radial-gradient(140% 90% at 50% -20%, #FBF8F3 0%, ${PARCH} 45%, #F3ECE2 100%)`, color: INK, fontFamily: SANS }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=DM+Sans:wght@300;400;500;600;700&display=swap');
        *{box-sizing:border-box}
        @keyframes rise{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
        @keyframes fade{from{opacity:0}to{opacity:1}}
        @keyframes halo{0%{transform:scale(1);opacity:.7}70%{transform:scale(1.5);opacity:0}100%{opacity:0}}
        @keyframes barSheen{0%{background-position:200% 0}100%{background-position:-200% 0}}
        .pb-track{position:relative;height:7px;width:100%;background:#ece2d4;border-radius:99px;overflow:hidden}
        .pb-fill{height:100%;border-radius:99px;background:linear-gradient(90deg,#35213c 0%,#4E3158 45%,#7a5b86 55%,#35213c 100%);background-size:220% 100%;animation:barSheen 2.2s linear infinite;box-shadow:0 0 10px rgba(53,33,60,.45);transition:width .75s cubic-bezier(.22,1,.36,1)}
        .rise{animation:rise .6s ease both}
        .lp-input{width:100%;padding:15px 16px;font-size:16px;border-radius:8px;border:1.5px solid ${BORDER};background:#fff;color:${INK};font-family:${SANS};transition:border-color .15s,box-shadow .15s}
        .lp-input::placeholder{color:#b3aca0}
        .lp-input:focus{outline:none;border-color:${GOLD};box-shadow:0 0 0 3px rgba(201,168,76,.18)}
        .cta{transition:transform .15s ease,filter .15s ease,box-shadow .15s ease}
        .cta:hover:not(:disabled){transform:translateY(-2px);filter:brightness(1.03)}
        .cta:active:not(:disabled){transform:translateY(0)}
        .posterWrap:hover .poster{transform:scale(1.03)}
        .posterWrap:hover .playBtn{transform:scale(1.06)}
        .poster,.playBtn{transition:transform .3s ease}
      `}</style>

      <header style={{ padding: '18px 20px 16px', textAlign: 'center', borderBottom: `1px solid rgba(221,216,207,.8)`, background: 'rgba(250,246,240,.6)' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/the5th-logo-purple.png" alt="The5th Consulting" style={{ height: 'clamp(40px,10vw,50px)', width: 'auto', verticalAlign: 'middle' }} />
      </header>

      <div style={{ maxWidth: 760, margin: '0 auto', padding: '30px 18px 10px' }}>
        {/* Hero */}
        <div className="rise" style={{ textAlign: 'center' }}>
          {firstName && (
            <p style={{ fontFamily: SANS, fontSize: 13.5, fontWeight: 600, color: GOLD_DK, margin: '0 0 10px', letterSpacing: '.02em' }}>
              {lead ? `Welcome back, ${firstName} 👋` : `${firstName}, this is for you 👋`}
            </p>
          )}
          <Eyebrow>{OPT_IN.eyebrow}</Eyebrow>
          <h1 style={{ fontFamily: SERIF, fontSize: 'clamp(27px,6vw,46px)', fontWeight: 500, lineHeight: 1.12, letterSpacing: '-.01em', margin: '0 auto', maxWidth: 640, color: INK }}>{OPT_IN.headline}</h1>
          <p style={{ fontFamily: SANS, fontSize: 'clamp(14.5px,3.3vw,16.5px)', fontWeight: 300, color: '#5f574c', lineHeight: 1.6, margin: '16px auto 0', maxWidth: 560 }}>{OPT_IN.sub}</p>
        </div>

        {/* Video poster (teaser) */}
        <div className="rise" style={{ marginTop: 26, padding: 8, borderRadius: 16, background: `linear-gradient(160deg, rgba(201,168,76,.28), rgba(201,168,76,.06))`, boxShadow: '0 34px 80px -30px rgba(46,26,53,.55)' }}>
          <button
            onClick={primaryAction}
            className="posterWrap"
            aria-label={OPT_IN.playLabel}
            style={{ position: 'relative', display: 'block', width: '100%', aspectRatio: '16 / 9', border: 'none', cursor: 'pointer', padding: 0, borderRadius: 11, overflow: 'hidden', background: '#120912' }}
          >
            <span className="poster" style={{ position: 'absolute', inset: 0, background: poster ? `#120912 url(${poster}) center/cover` : `linear-gradient(155deg, ${PLUM_MID} 0%, ${PLUM} 55%, ${GREEN} 135%)` }} />
            <span style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(18,9,18,.32) 0%, rgba(18,9,18,.30) 40%, rgba(18,9,18,.68) 100%)' }} />
            <span style={{ position: 'absolute', top: 14, left: 14, fontFamily: SANS, fontSize: 10.5, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', color: PLUM, background: `linear-gradient(180deg,${GOLD_L},${GOLD})`, padding: '5px 11px', borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,.25)' }}>Free Training</span>
            <span style={{ position: 'absolute', left: '50%', top: '46%', transform: 'translate(-50%,-50%)', width: 88, height: 88 }}>
              <span style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: `1.5px solid rgba(201,168,76,.6)`, animation: 'halo 2.4s ease-out infinite' }} />
              <span className="playBtn" style={{ position: 'absolute', inset: 6, borderRadius: '50%', background: `linear-gradient(180deg,${GOLD_L},#B8983F)`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 30px rgba(0,0,0,.4), inset 0 1px 0 rgba(255,255,255,.6)' }}>
                <svg width="30" height="30" viewBox="0 0 24 24" fill={PLUM} style={{ marginLeft: 4 }}><path d="M8 5v14l11-7z" /></svg>
              </span>
            </span>
            <span style={{ position: 'absolute', left: 0, right: 0, bottom: 20, textAlign: 'center' }}>
              <span style={{ display: 'block', fontFamily: SERIF, fontWeight: 600, fontSize: 'clamp(19px,4.4vw,25px)', color: '#fff', letterSpacing: '.01em', textShadow: '0 2px 16px rgba(0,0,0,.5)' }}>{OPT_IN.playLabel}</span>
              <span style={{ display: 'block', fontFamily: SANS, fontSize: 12.5, color: 'rgba(255,255,255,.82)', marginTop: 5, letterSpacing: '.02em' }}>{OPT_IN.playNote}</span>
            </span>
          </button>
        </div>

        {/* Primary CTA + client social proof */}
        <div className="rise" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 24 }}>
          <button onClick={primaryAction} className="cta" style={{ ...goldBtn, width: '100%', maxWidth: 470, padding: '19px 26px', borderRadius: 9, fontSize: 15.5 }}>{ctaLabel}</button>
          <p style={{ fontFamily: SANS, fontSize: 12.5, color: MUTE, marginTop: 13, letterSpacing: '.02em', display: 'flex', alignItems: 'center', gap: 7 }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={GOLD_DK} strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
            {OPT_IN.ctaMicro}
          </p>
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
            <span style={{ fontFamily: SANS, fontSize: 13.5, color: '#5f574c' }}><strong style={{ color: INK, fontWeight: 700 }}>{OPT_IN.rating.score} stars</strong> {OPT_IN.rating.text}</span>
          </div>
        </div>

        {/* Real social proof */}
        <section id="proof" style={{ marginTop: 46 }}>
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
          <p style={{ fontFamily: SANS, fontSize: 11.5, fontWeight: 300, color: MUTE, lineHeight: 1.55, textAlign: 'center', margin: '16px auto 0', maxWidth: 520 }}>{OPT_IN.proofDisclaimer}</p>
        </section>

        {/* Secondary: the story + what's inside */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, margin: '44px 0 24px' }}>
          <span style={{ flex: 1, height: 1, background: 'linear-gradient(90deg,transparent,rgba(201,168,76,.5))' }} />
          <span style={{ fontFamily: SANS, fontSize: 11, fontWeight: 600, letterSpacing: '.2em', textTransform: 'uppercase', color: MUTE }}>Is This For You?</span>
          <span style={{ flex: 1, height: 1, background: 'linear-gradient(90deg,rgba(201,168,76,.5),transparent)' }} />
        </div>
        <section style={{ maxWidth: 560, margin: '0 auto' }}>
          {OPT_IN.narrative.map((line, i) => (
            <p key={i} style={{ fontFamily: i === 0 ? SERIF : SANS, fontSize: i === 0 ? 'clamp(20px,4.6vw,26px)' : 15.5, fontWeight: i === 0 ? 500 : 300, color: i === 0 ? INK : '#544c42', lineHeight: i === 0 ? 1.3 : 1.7, margin: i === 0 ? '0 0 16px' : '0 0 14px' }}>{line}</p>
          ))}
          <p style={{ fontFamily: SANS, fontSize: 11, fontWeight: 700, letterSpacing: '.18em', textTransform: 'uppercase', color: GOLD_DK, margin: '28px 0 16px' }}>{OPT_IN.checklistTitle}</p>
          <div style={{ display: 'grid', gap: 12 }}>
            {OPT_IN.bullets.map((b) => (
              <div key={b} style={{ display: 'flex', gap: 11, alignItems: 'flex-start' }}>
                <span style={{ color: GOLD_DK, fontFamily: SANS, fontSize: 16, fontWeight: 700, lineHeight: 1.4, flexShrink: 0 }}>→</span>
                <span style={{ fontFamily: SANS, fontSize: 15, fontWeight: 400, lineHeight: 1.55, color: '#4a4238' }}>{b}</span>
              </div>
            ))}
          </div>
          <p style={{ fontFamily: SERIF, fontSize: 'clamp(19px,4.4vw,24px)', fontWeight: 500, color: INK, textAlign: 'center', margin: '28px 0 20px' }}>{OPT_IN.narrativeClose}</p>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <button onClick={primaryAction} className="cta" style={{ ...goldBtn, width: '100%', maxWidth: 440, padding: '17px 26px', borderRadius: 9, fontSize: 14.5 }}>{ctaLabel}</button>
          </div>
        </section>
      </div>

      {/* Footer (brand + legal) */}
      <footer style={{ marginTop: 50, background: `linear-gradient(180deg,${PLUM_2},${PLUM})`, padding: '34px 20px 40px' }}>
        <div style={{ maxWidth: 640, margin: '0 auto', textAlign: 'center' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/logo-white.png" alt="The5th Consulting" style={{ height: 'clamp(42px,11vw,56px)', width: 'auto', opacity: .95 }} />
          <p style={{ fontFamily: SANS, fontSize: 12, color: 'rgba(255,255,255,.55)', marginTop: 14, lineHeight: 1.6 }}>Helping experts turn decades of expertise into income.</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '6px 18px', marginTop: 18 }}>
            {LEGAL.links.map((l) => (
              <a key={l.href} href={l.href} target="_blank" rel="noopener noreferrer" style={{ fontFamily: SANS, fontSize: 12, color: 'rgba(255,255,255,.6)', textDecoration: 'none' }}>{l.label}</a>
            ))}
          </div>
          <div style={{ height: 1, background: 'rgba(255,255,255,.12)', margin: '20px 0' }} />
          <p style={{ fontFamily: SANS, fontSize: 10.5, color: 'rgba(255,255,255,.42)', lineHeight: 1.7, margin: 0 }}>{LEGAL.earnings}</p>
          <p style={{ fontFamily: SANS, fontSize: 10.5, color: 'rgba(255,255,255,.42)', lineHeight: 1.7, margin: '12px 0 0' }}>{LEGAL.meta}</p>
          <p style={{ fontFamily: SANS, fontSize: 11, color: 'rgba(255,255,255,.32)', marginTop: 18 }}>© {new Date().getFullYear()} The5th Consulting. All rights reserved.</p>
        </div>
      </footer>

      {/* Live demand — social-proof activity popups (bottom-left) */}
      <ProofPopups />

      {/* Opt-in modal (the gate) */}
      {modalOpen && (
        <div role="dialog" aria-modal="true" onClick={(e) => { if (e.target === e.currentTarget && !loading) setModalOpen(false) }}
          style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(24,12,26,.62)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, animation: 'fade .2s ease' }}>
          <div style={{ position: 'relative', width: '100%', maxWidth: 430, background: PARCH, borderRadius: 16, boxShadow: '0 40px 90px rgba(20,8,22,.5)', overflow: 'hidden', animation: 'rise .35s ease both' }}>
            <div style={{ background: `linear-gradient(180deg,${PLUM_2},${PLUM})`, height: 4 }} />
            {/* Opt-in progress bar (no number — smooth near-completion nudge) */}
            <div style={{ padding: '14px 18px 0' }}>
              <div className="pb-track"><div className="pb-fill" style={{ width: `${progress}%` }} /></div>
            </div>
            <button onClick={() => !loading && setModalOpen(false)} aria-label="Close" style={{ position: 'absolute', top: 14, right: 14, width: 32, height: 32, borderRadius: '50%', border: 'none', background: 'rgba(46,26,53,.06)', color: '#8a8075', fontSize: 18, cursor: 'pointer', lineHeight: 1 }}>×</button>
            <div style={{ padding: 'clamp(20px,5vw,30px) clamp(24px,6vw,34px) clamp(24px,6vw,34px)' }}>
              <Eyebrow>{MODAL.eyebrow}</Eyebrow>
              <h2 style={{ fontFamily: SERIF, fontSize: 'clamp(24px,6vw,30px)', fontWeight: 500, lineHeight: 1.14, margin: '0 0 8px', textAlign: 'center', color: INK }}>{MODAL.title}</h2>
              <p style={{ fontFamily: SANS, fontSize: 14.5, fontWeight: 300, color: '#5f574c', lineHeight: 1.55, margin: '0 0 20px', textAlign: 'center' }}>{MODAL.sub}</p>
              <form onSubmit={submit}>
                <input className="lp-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="First name" autoComplete="given-name" autoFocus enterKeyHint="next" />
                <input className="lp-input" style={{ marginTop: 12 }} type="email" inputMode="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" autoComplete="email" enterKeyHint="next" />
                <input className="lp-input" style={{ marginTop: 12 }} type="tel" inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone (with country code)" autoComplete="tel" enterKeyHint="go" />
                <p style={{ fontFamily: SANS, fontSize: 11.5, color: MUTE, margin: '7px 2px 0' }}>{MODAL.phoneNote}</p>
                {error && <div style={{ marginTop: 12, fontFamily: SANS, color: '#a3341f', background: '#fdeee9', border: '1px solid #f6cabb', borderRadius: 8, padding: '10px 12px', fontSize: 13 }}>{error}</div>}
                <button type="submit" disabled={loading} className="cta" style={{ ...goldBtn, width: '100%', marginTop: 16, padding: '17px 22px', borderRadius: 8, fontSize: 14 }}>{loading ? 'Taking you in…' : MODAL.cta}</button>
                <p style={{ fontFamily: SANS, textAlign: 'center', fontSize: 12, color: MUTE, marginTop: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={MUTE} strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                  {MODAL.microtrust}
                </p>
                <p style={{ fontFamily: SANS, textAlign: 'center', fontSize: 11, color: '#a79e90', marginTop: 8, lineHeight: 1.5 }}>
                  By continuing you agree to our{' '}
                  <a href="/privacy" target="_blank" rel="noopener noreferrer" style={{ color: GOLD_DK, textDecoration: 'underline' }}>Privacy Policy</a>{' '}and{' '}
                  <a href="/terms" target="_blank" rel="noopener noreferrer" style={{ color: GOLD_DK, textDecoration: 'underline' }}>Terms</a>.
                </p>
              </form>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
