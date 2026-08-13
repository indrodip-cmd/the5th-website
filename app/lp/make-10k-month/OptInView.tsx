'use client'
/* Cold-traffic opt-in / sales page for the FREE 12-MINUTE STRATEGY TRAINING.
   ONE primary action: WATCH THE FREE TRAINING. Every CTA (and the whole video
   card) opens the same opt-in modal, which captures first name + email, creates
   the lead (opted_in → vsl_leads + crm_contacts), fires the Whop 'lead' pixel,
   and routes to the gated /watch page where the training plays.

   Conversion architecture (in order):
     HERO → TRUST → PROBLEM → DISCOVERY → OBJECTION → RESULTS → TRANSITION →
     FOUNDER → WHO-IT'S-FOR → HOW-IT-WORKS → MID-CTA → TESTIMONIALS →
     2ND-OBJECTION → FINAL-CTA → FINAL-TRUST → FOOTER

   Functionality (modal, submit, tracking, resume) is preserved from the prior
   build; this is a copy + information-hierarchy redesign. No navigation, no
   competing CTAs, no autoplay. Mobile-first. */
import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { OPT_IN, LP, MODAL, REAL_PROOF, LEGAL, PRESS } from './config'
import ProofPopups from './ProofPopups'
import { getRecaptchaToken } from '@/lib/recaptcha-client'
import { whopTrack } from '@/lib/whop'

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
const BODY = '#544c42'
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

/* Fine film-grain texture (same device as the quiz) for a tactile, premium
   surface instead of a flat wash. */
const GRAIN_URI = "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")"

/* Four-point gold sparkle motif used across eyebrows, dividers and card corners. */
function Sparkle({ size = 16, color = GOLD, style, className }: { size?: number; color?: string; style?: React.CSSProperties; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none" style={style} className={className} aria-hidden="true">
      <path d="M14 2 L15.2 10.8 L22 6 L17.2 13.4 L26 14 L17.2 14.6 L22 22 L15.2 17.2 L14 26 L12.8 17.2 L6 22 L10.8 14.6 L2 14 L10.8 13.4 L6 6 L12.8 10.8 Z" fill={color} />
    </svg>
  )
}

/* Editorial section divider — hairline gold rule with a centered sparkle. */
function Divider({ max = 640 }: { max?: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, maxWidth: max, margin: '54px auto', paddingLeft: 18, paddingRight: 18 }}>
      <span style={{ flex: 1, height: 1, background: 'linear-gradient(90deg,transparent,rgba(201,168,76,.5))' }} />
      <Sparkle size={15} color={GOLD} style={{ opacity: .85, flexShrink: 0 }} />
      <span style={{ flex: 1, height: 1, background: 'linear-gradient(90deg,rgba(201,168,76,.5),transparent)' }} />
    </div>
  )
}

/* ── Small presentational atoms ── */
function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 16 }}>
      <span style={{ width: 26, height: 1, background: 'rgba(201,168,76,.55)' }} />
      <span style={{ fontFamily: SANS, fontSize: 11.5, fontWeight: 600, letterSpacing: '.2em', textTransform: 'uppercase', color: GOLD_DK, textAlign: 'center' }}>{children}</span>
      <span style={{ width: 26, height: 1, background: 'rgba(201,168,76,.55)' }} />
    </div>
  )
}

function Stars({ light = false }: { light?: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center' }}>
      <span style={{ color: GOLD, fontSize: 17, letterSpacing: 1 }}>★★★★<span style={{ opacity: .5 }}>★</span></span>
      <span style={{ fontFamily: SANS, fontSize: 13.5, color: light ? 'rgba(255,255,255,.82)' : '#5f574c' }}>
        <strong style={{ color: light ? '#fff' : INK, fontWeight: 700 }}>{OPT_IN.rating.score} stars</strong> {OPT_IN.rating.text}
      </span>
    </div>
  )
}

/* Reusable CTA block — every instance opens the same existing opt-in gate.
   Module-scoped (stable identity) and driven by props. */
function CtaBlock({ onClick, label, max = 470, size = 15.5, micro = true, light = false }: { onClick: () => void; label: string; max?: number; size?: number; micro?: boolean; light?: boolean }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
      <button onClick={onClick} className="cta" style={{ ...goldBtn, width: '100%', maxWidth: max, padding: '18px 26px', borderRadius: 9, fontSize: size }}>{label}</button>
      {micro && (
        <p style={{ fontFamily: SANS, fontSize: 12.5, color: light ? 'rgba(255,255,255,.62)' : MUTE, marginTop: 12, letterSpacing: '.02em', display: 'flex', alignItems: 'center', gap: 7 }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={light ? 'rgba(255,255,255,.62)' : GOLD_DK} strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
          {OPT_IN.ctaMicro}
        </p>
      )}
    </div>
  )
}

export default function FunnelView({ videoUrl }: { videoUrl: string }) {
  const router = useRouter()
  // Returning opted-in visitor (client-only; never rendered, only used to skip
  // a second opt-in). Lazy init avoids a setState-in-effect + SSR access.
  const [lead] = useState<Lead | null>(() => {
    if (typeof window === 'undefined') return null
    try {
      const raw = localStorage.getItem('vsl_make10k')
      if (raw) { const p = JSON.parse(raw); if (p?.email) return { name: p.name || '', email: p.email } }
    } catch { /* noop */ }
    return null
  })
  const [modalOpen, setModalOpen] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [resuming, setResuming] = useState(false)
  const meta = useRef<{ visitor_id: string | null; utm: Record<string, string> }>({ visitor_id: null, utm: {} })

  // Cold-traffic page: the CTA is ALWAYS the same primary action label. We keep
  // the returning-visitor resume path (so a known lead is taken straight in) but
  // never surface "Resume"/"Welcome back" copy.
  const ctaLabel = resuming ? 'One moment…' : OPT_IN.ctaButton

  const progress = loading ? 100 : email.trim() ? 95 : name.trim() ? 90 : 20

  useEffect(() => {
    meta.current = { visitor_id: readVisitorId(), utm: readUtm() }
    router.prefetch(WATCH_URL)
  }, [router])

  // Subtle scroll reveal (transform only — content is always visible even if JS
  // fails). Respects reduced-motion.
  useEffect(() => {
    try {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    } catch { return }
    const els = Array.from(document.querySelectorAll('[data-reveal]'))
    if (!('IntersectionObserver' in window) || !els.length) return
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target) } })
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' })
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])

  async function primaryAction() {
    // Returning visitor: re-issue the session pass (no second opt-in) and go
    // straight to the training. Falls through to the gate if not recognised.
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
    setLoading(true)
    try {
      const recaptchaToken = await getRecaptchaToken('optin')
      const res = await fetch('/api/lp/opt-in', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), recaptchaToken, visitor_id: meta.current.visitor_id, utm: meta.current.utm }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) { setError(data?.error || 'Something went wrong. Please try again.'); setLoading(false); return }
      try { localStorage.setItem('vsl_make10k', JSON.stringify({ name: data.name, email: data.email, t: Date.now() })) } catch { /* noop */ }
      whopTrack('lead') // Whop Pixel: opt-in submitted — a lead.
      router.push(WATCH_URL)
    } catch {
      setError('Network error. Please try again.'); setLoading(false)
    }
  }

  const poster = ytPoster(videoUrl)
  const READ = 640

  return (
    <main style={{ minHeight: '100dvh', background: `radial-gradient(140% 90% at 50% -20%, #FBF8F3 0%, ${PARCH} 45%, #F3ECE2 100%)`, color: INK, fontFamily: SANS }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=DM+Sans:wght@300;400;500;600;700&display=swap');
        *{box-sizing:border-box}
        @keyframes fade{from{opacity:0}to{opacity:1}}
        @keyframes rise{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
        @keyframes revealUp{from{transform:translateY(16px)}to{transform:none}}
        @keyframes halo{0%{transform:scale(1);opacity:.7}70%{transform:scale(1.5);opacity:0}100%{opacity:0}}
        @keyframes barSheen{0%{background-position:200% 0}100%{background-position:-200% 0}}
        @keyframes marq{from{transform:translateX(0)}to{transform:translateX(-50%)}}
        .marq-wrap{overflow:hidden;-webkit-mask-image:linear-gradient(90deg,transparent,#000 12%,#000 88%,transparent);mask-image:linear-gradient(90deg,transparent,#000 12%,#000 88%,transparent)}
        .marq-track{display:flex;align-items:center;gap:clamp(30px,7vw,60px);width:max-content;animation:marq 26s linear infinite}
        .marq-wrap:hover .marq-track{animation-play-state:paused}
        .marq-track span{font-family:${SERIF};font-size:clamp(17px,4.4vw,24px);font-weight:500;color:#b3a99c;letter-spacing:.01em;white-space:nowrap}
        .hero-in{animation:rise .6s ease both}
        [data-reveal].in{animation:revealUp .55s cubic-bezier(.22,1,.36,1) both}
        .pb-track{position:relative;height:7px;width:100%;background:#ece2d4;border-radius:99px;overflow:hidden}
        .pb-fill{height:100%;border-radius:99px;background:linear-gradient(90deg,#35213c 0%,#4E3158 45%,#7a5b86 55%,#35213c 100%);background-size:220% 100%;animation:barSheen 2.2s linear infinite;box-shadow:0 0 10px rgba(53,33,60,.45);transition:width .75s cubic-bezier(.22,1,.36,1)}
        .lp-input{width:100%;padding:15px 16px;font-size:16px;border-radius:8px;border:1.5px solid ${BORDER};background:#fff;color:${INK};font-family:${SANS};transition:border-color .15s,box-shadow .15s}
        .lp-input::placeholder{color:#b3aca0}
        .lp-input:focus{outline:none;border-color:${GOLD};box-shadow:0 0 0 3px rgba(201,168,76,.18)}
        .cta{transition:transform .15s ease,filter .15s ease,box-shadow .15s ease}
        .cta:hover:not(:disabled){transform:translateY(-2px);filter:brightness(1.03)}
        .cta:active:not(:disabled){transform:translateY(0)}
        .cta:focus-visible{outline:3px solid rgba(201,168,76,.55);outline-offset:3px}
        .posterWrap:hover .poster{transform:scale(1.03)}
        .posterWrap:hover .playBtn{transform:scale(1.06)}
        .posterWrap:focus-visible{outline:3px solid ${GOLD};outline-offset:3px}
        .poster,.playBtn{transition:transform .3s ease}
        .pcard{position:relative;transition:transform .3s cubic-bezier(.2,.7,.2,1),box-shadow .35s ease,border-color .3s ease}
        .pcard:hover{transform:translateY(-4px);box-shadow:0 32px 66px -32px rgba(46,26,53,.5);border-color:rgba(201,168,76,.5)}
        .disc-card{overflow:hidden}
        .disc-card .disc-num{position:absolute;top:2px;right:16px;font-family:${SERIF};font-size:96px;font-weight:600;line-height:1;color:rgba(201,168,76,.12);pointer-events:none;user-select:none}
        .disc-card .disc-top{position:absolute;top:0;left:22px;right:22px;height:2px;background:linear-gradient(90deg,transparent,${GOLD},transparent);opacity:.55}
        .glow{position:absolute;border-radius:50%;pointer-events:none;filter:blur(46px);z-index:0}
        .corner-star{position:absolute;opacity:.5}
        @keyframes floaty{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
        .float{animation:floaty 7s ease-in-out infinite}
        @media(prefers-reduced-motion:reduce){.float{animation:none}}
        .lp-sec{max-width:${READ}px;margin:0 auto;padding-left:18px;padding-right:18px;position:relative;z-index:1}
        .disc-grid{display:grid;grid-template-columns:1fr;gap:14px}
        .who-grid{display:grid;grid-template-columns:1fr;gap:22px}
        .how-grid{display:grid;grid-template-columns:1fr;gap:16px}
        @media(min-width:820px){
          .disc-grid{grid-template-columns:1fr 1fr;gap:18px}
          .who-grid{grid-template-columns:1fr 1fr;gap:26px}
          .how-grid{grid-template-columns:repeat(3,1fr);gap:20px}
        }
        .bio-row{display:flex;gap:24px;align-items:flex-start}
        @media(max-width:600px){.bio-row{flex-direction:column;align-items:center;text-align:center;gap:18px}}
        @media(prefers-reduced-motion:reduce){.hero-in,[data-reveal].in,.pb-fill,.marq-track,.halo{animation:none!important}}
      `}</style>

      {/* Film-grain texture over the whole page (premium, tactile) */}
      <div aria-hidden="true" style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, opacity: .05, backgroundImage: GRAIN_URI, mixBlendMode: 'multiply' }} />

      <header style={{ position: 'relative', zIndex: 1, padding: '18px 20px 16px', textAlign: 'center', borderBottom: `1px solid rgba(221,216,207,.8)`, background: 'rgba(250,246,240,.6)' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/the5th-logo-purple.png" alt="The5th Consulting" style={{ height: 'clamp(38px,9vw,48px)', width: 'auto', verticalAlign: 'middle' }} />
      </header>

      {/* ══════════ HERO ══════════ */}
      <section className="lp-sec hero-in" style={{ padding: '34px 18px 6px', textAlign: 'center' }}>
        {/* soft gold aura behind the hero */}
        <div className="glow float" aria-hidden="true" style={{ top: -60, left: '50%', width: 'min(560px,86vw)', height: 320, transform: 'translateX(-50%)', background: 'radial-gradient(ellipse at center, rgba(201,168,76,.20), transparent 70%)' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <Sparkle size={26} color={GOLD} className="float" style={{ marginBottom: 12 }} />
        </div>
        <Eyebrow>{OPT_IN.eyebrow}</Eyebrow>
        <h1 style={{ fontFamily: SERIF, fontSize: 'clamp(30px,6.6vw,50px)', fontWeight: 500, lineHeight: 1.08, letterSpacing: '-.015em', margin: '0 auto', maxWidth: 660, color: INK }}>{OPT_IN.headline}</h1>
        <p style={{ fontFamily: SERIF, fontSize: 'clamp(19px,4.6vw,26px)', fontWeight: 500, fontStyle: 'italic', color: GOLD_DK, margin: '10px 0 0' }}>{OPT_IN.subhead}</p>
        <p style={{ fontFamily: SANS, fontSize: 'clamp(14.5px,3.2vw,16.5px)', fontWeight: 300, color: '#5f574c', lineHeight: 1.65, margin: '18px auto 0', maxWidth: 560 }}>{OPT_IN.sub}</p>
      </section>

      {/* Video poster (teaser → opens gate) */}
      <div className="lp-sec" style={{ maxWidth: 760 }}>
        <div className="hero-in" style={{ marginTop: 24, padding: 8, borderRadius: 16, background: `linear-gradient(160deg, rgba(201,168,76,.28), rgba(201,168,76,.06))`, boxShadow: '0 34px 80px -30px rgba(46,26,53,.55)' }}>
          <button onClick={primaryAction} className="posterWrap" aria-label={OPT_IN.playLabel}
            style={{ position: 'relative', display: 'block', width: '100%', aspectRatio: '16 / 9', border: 'none', cursor: 'pointer', padding: 0, borderRadius: 11, overflow: 'hidden', background: '#120912' }}>
            <span className="poster" style={{ position: 'absolute', inset: 0, background: poster ? `#120912 url(${poster}) center/cover` : `linear-gradient(155deg, ${PLUM_MID} 0%, ${PLUM} 55%, ${GREEN} 135%)` }} />
            <span style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(18,9,18,.32) 0%, rgba(18,9,18,.30) 40%, rgba(18,9,18,.68) 100%)' }} />
            <span style={{ position: 'absolute', top: 14, left: 14, fontFamily: SANS, fontSize: 10.5, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', color: PLUM, background: `linear-gradient(180deg,${GOLD_L},${GOLD})`, padding: '5px 11px', borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,.25)' }}>Free Training</span>
            <span style={{ position: 'absolute', top: 14, right: 14, fontFamily: SANS, fontSize: 10.5, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: '#fff', background: 'rgba(18,9,18,.5)', border: '1px solid rgba(255,255,255,.25)', padding: '5px 11px', borderRadius: 3, backdropFilter: 'blur(2px)' }}>12 Minutes</span>
            <span style={{ position: 'absolute', left: '50%', top: '46%', transform: 'translate(-50%,-50%)', width: 88, height: 88 }}>
              <span className="halo" style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: `1.5px solid rgba(201,168,76,.6)`, animation: 'halo 2.4s ease-out infinite' }} />
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

        {/* Primary CTA */}
        <div className="hero-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 24 }}>
          <CtaBlock onClick={primaryAction} label={ctaLabel} />
        </div>
      </div>

      {/* ══════════ TRUST ══════════ */}
      <section className="lp-sec" style={{ maxWidth: 760, marginTop: 26, textAlign: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {CLIENT_AVATARS.map((src, i) => (
            <span key={src} style={{ width: 'clamp(34px,8.5vw,42px)', height: 'clamp(34px,8.5vw,42px)', borderRadius: '50%', overflow: 'hidden', border: '2px solid #FBF8F3', boxShadow: '0 2px 6px rgba(46,26,53,.18)', marginLeft: i === 0 ? 0 : -11, zIndex: 12 - i, position: 'relative', flexShrink: 0, background: '#EAE3D8' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center' }} />
            </span>
          ))}
        </div>
        <div style={{ marginTop: 14 }}><Stars /></div>
        <p style={{ fontFamily: SANS, fontSize: 13.5, fontWeight: 300, color: '#6b6357', lineHeight: 1.6, margin: '14px auto 0', maxWidth: 460 }}>{OPT_IN.trustStatement}</p>
        {/* As featured in — running marquee */}
        <div style={{ marginTop: 34 }}>
          <p style={{ textAlign: 'center', fontFamily: SANS, fontSize: 11, fontWeight: 700, letterSpacing: '.2em', textTransform: 'uppercase', color: MUTE, marginBottom: 18 }}>{PRESS.label}</p>
          <div className="marq-wrap">
            <div className="marq-track">
              {[...PRESS.items, ...PRESS.items].map((n, i) => (<span key={i} aria-hidden={i >= PRESS.items.length}>{n}</span>))}
            </div>
          </div>
        </div>
      </section>

      <Divider max={520} />

      {/* ══════════ PROBLEM ══════════ */}
      <section className="lp-sec" data-reveal style={{ marginTop: 8 }}>
        <h2 style={{ fontFamily: SERIF, fontSize: 'clamp(26px,5.6vw,40px)', fontWeight: 500, lineHeight: 1.12, letterSpacing: '-.01em', margin: 0, color: INK, textAlign: 'center' }}>{LP.problem.heading}</h2>
        <div style={{ margin: '20px auto 0', maxWidth: 560 }}>
          {LP.problem.body.map((t, i) => (
            <p key={i} style={{ fontFamily: SANS, fontSize: 'clamp(15px,3.4vw,16.5px)', fontWeight: 300, color: BODY, lineHeight: 1.75, margin: '0 0 14px' }}>{t}</p>
          ))}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, margin: '6px 0 16px' }}>
            {LP.problem.questions.map((q) => (
              <div key={q} style={{ background: '#fff', border: `1px solid ${BORDER}`, borderRadius: 10, padding: '13px 16px', fontFamily: SERIF, fontSize: 'clamp(17px,4vw,20px)', fontWeight: 600, color: PLUM_2, textAlign: 'center' }}>{q}</div>
            ))}
          </div>
          <p style={{ fontFamily: SANS, fontSize: 'clamp(15px,3.4vw,16.5px)', fontWeight: 300, color: BODY, lineHeight: 1.75, margin: '0 0 22px' }}>{LP.problem.after}</p>
          <p style={{ fontFamily: SERIF, fontSize: 'clamp(20px,4.6vw,26px)', fontWeight: 500, fontStyle: 'italic', color: GOLD_DK, lineHeight: 1.3, textAlign: 'center', margin: 0 }}>{LP.problem.transition}</p>
        </div>
      </section>

      {/* ══════════ DISCOVERY ══════════ */}
      <section data-reveal style={{ marginTop: 60 }}>
        <div className="lp-sec" style={{ maxWidth: 900, textAlign: 'center', marginBottom: 26 }}>
          <Eyebrow>What You’ll Discover</Eyebrow>
          <h2 style={{ fontFamily: SERIF, fontSize: 'clamp(25px,5.2vw,38px)', fontWeight: 500, lineHeight: 1.14, letterSpacing: '-.01em', margin: '0 auto', maxWidth: 700, color: INK }}>{LP.discover.heading}</h2>
        </div>
        <div className="lp-sec disc-grid" style={{ maxWidth: 900 }}>
          {LP.discover.items.map((it) => (
            <div key={it.n} className="pcard disc-card" style={{ background: '#fff', border: `1px solid ${BORDER}`, borderRadius: 14, padding: 'clamp(22px,4vw,28px)', boxShadow: '0 18px 44px -34px rgba(46,26,53,.5)' }}>
              <span className="disc-top" />
              <span className="disc-num">{it.n}</span>
              <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 40, height: 40, borderRadius: 11, background: 'linear-gradient(160deg, rgba(201,168,76,.18), rgba(201,168,76,.06))', border: '1px solid rgba(201,168,76,.35)', marginBottom: 14 }}>
                  <span style={{ fontFamily: SERIF, fontSize: 18, fontWeight: 700, color: GOLD_DK, lineHeight: 1 }}>{it.n}</span>
                </div>
                <h3 style={{ fontFamily: SERIF, fontSize: 'clamp(19px,4vw,22px)', fontWeight: 600, color: INK, lineHeight: 1.2, margin: '0 0 8px' }}>{it.title}</h3>
                <p style={{ fontFamily: SANS, fontSize: 14.5, fontWeight: 300, color: BODY, lineHeight: 1.65, margin: 0 }}>{it.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════ OBJECTION (dark) ══════════ */}
      <section data-reveal style={{ position: 'relative', overflow: 'hidden', marginTop: 62, background: `linear-gradient(165deg,${PLUM_2},${PLUM} 60%,${PLUM})`, padding: 'clamp(52px,9vw,76px) 0' }}>
        <div aria-hidden="true" style={{ position: 'absolute', inset: 0, opacity: .5, backgroundImage: GRAIN_URI, mixBlendMode: 'overlay', pointerEvents: 'none' }} />
        <div className="glow" aria-hidden="true" style={{ top: -80, right: -40, width: 340, height: 340, background: 'radial-gradient(circle, rgba(201,168,76,.22), transparent 68%)' }} />
        <Sparkle size={20} color="rgba(201,168,76,.4)" style={{ position: 'absolute', top: 30, left: 28 }} />
        <Sparkle size={14} color="rgba(201,168,76,.3)" style={{ position: 'absolute', bottom: 34, right: 34 }} />
        <div className="lp-sec" style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <h2 style={{ fontFamily: SERIF, fontSize: 'clamp(25px,5.4vw,38px)', fontWeight: 500, lineHeight: 1.14, letterSpacing: '-.01em', margin: '0 auto', maxWidth: 560, color: '#fff' }}>{LP.objection.heading}</h2>
          <div style={{ display: 'inline-flex', flexDirection: 'column', gap: 9, margin: '26px 0 6px', textAlign: 'left' }}>
            {LP.objection.nots.map((t) => (
              <div key={t} style={{ display: 'flex', gap: 11, alignItems: 'center' }}>
                <span style={{ color: 'rgba(201,168,76,.8)', fontSize: 15, flexShrink: 0 }}>✕</span>
                <span style={{ fontFamily: SANS, fontSize: 15, fontWeight: 300, color: 'rgba(255,255,255,.72)' }}>{t}</span>
              </div>
            ))}
          </div>
          <p style={{ fontFamily: SERIF, fontSize: 'clamp(26px,6vw,40px)', fontWeight: 600, color: GOLD_L, margin: '26px 0 6px' }}>{LP.objection.lead}</p>
          <div style={{ margin: '0 auto', maxWidth: 480 }}>
            {LP.objection.ones.map((t) => (
              <p key={t} style={{ fontFamily: SANS, fontSize: 'clamp(15px,3.4vw,17px)', fontWeight: 300, color: 'rgba(255,255,255,.85)', lineHeight: 1.6, margin: '4px 0' }}>{t}</p>
            ))}
          </div>
          <div style={{ height: 1, background: 'rgba(255,255,255,.14)', margin: '30px auto', maxWidth: 320 }} />
          <div style={{ maxWidth: 560, margin: '0 auto' }}>
            {LP.objection.emphasis.map((t, i) => (
              <p key={i} style={{ fontFamily: SERIF, fontSize: 'clamp(20px,4.6vw,27px)', fontWeight: 500, fontStyle: 'italic', color: '#fff', lineHeight: 1.32, margin: '0 0 10px' }}>{t}</p>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ RESULTS ══════════ */}
      <section id="proof" className="lp-sec" data-reveal style={{ maxWidth: 760, marginTop: 60 }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <Eyebrow>{OPT_IN.proofEyebrow}</Eyebrow>
          <h2 style={{ fontFamily: SERIF, fontSize: 'clamp(25px,5.2vw,36px)', fontWeight: 500, lineHeight: 1.14, letterSpacing: '-.01em', margin: 0, color: INK }}>{OPT_IN.proofHeading}</h2>
        </div>
        <div style={{ display: 'grid', gap: 14 }}>
          {REAL_PROOF.map((p) => (
            <figure key={p.name} className="pcard" style={{ margin: 0, background: '#fff', border: `1px solid ${BORDER}`, borderRadius: 12, padding: '20px 22px', boxShadow: '0 18px 44px -34px rgba(46,26,53,.55)' }}>
              <div style={{ display: 'flex', gap: 14, alignItems: 'center', marginBottom: 12 }}>
                {p.photo ? (
                  <span style={{ width: 50, height: 50, flexShrink: 0, borderRadius: '50%', overflow: 'hidden', border: `2px solid rgba(201,168,76,.45)`, boxShadow: '0 4px 12px rgba(46,26,53,.18)' }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.photo} alt={p.name} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center' }} />
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
              <blockquote style={{ margin: 0, fontFamily: SANS, fontSize: 14.5, fontWeight: 300, color: BODY, lineHeight: 1.65 }}>{p.quote}</blockquote>
            </figure>
          ))}
        </div>
        <p style={{ fontFamily: SANS, fontSize: 11.5, fontWeight: 300, color: MUTE, lineHeight: 1.55, textAlign: 'center', margin: '16px auto 0', maxWidth: 520 }}>{OPT_IN.proofDisclaimer}</p>
      </section>

      {/* ══════════ RESULTS TRANSITION ══════════ */}
      <section className="lp-sec" data-reveal style={{ marginTop: 54, textAlign: 'center' }}>
        <p style={{ fontFamily: SANS, fontSize: 12.5, fontWeight: 700, letterSpacing: '.16em', textTransform: 'uppercase', color: GOLD_DK, margin: 0 }}>{LP.resultsTransition.small}</p>
        <h2 style={{ fontFamily: SERIF, fontSize: 'clamp(26px,6vw,42px)', fontWeight: 500, lineHeight: 1.12, letterSpacing: '-.015em', color: INK, margin: '10px auto 16px', maxWidth: 560 }}>{LP.resultsTransition.big}</h2>
        <div style={{ maxWidth: 440, margin: '0 auto' }}>
          {LP.resultsTransition.body.map((t) => (
            <p key={t} style={{ fontFamily: SERIF, fontSize: 'clamp(18px,4.2vw,22px)', fontWeight: 500, fontStyle: 'italic', color: BODY, lineHeight: 1.4, margin: '4px 0' }}>{t}</p>
          ))}
        </div>
      </section>

      {/* ══════════ FOUNDER ══════════ */}
      <section className="lp-sec" data-reveal style={{ maxWidth: 760, marginTop: 58 }}>
        <div style={{ textAlign: 'center', marginBottom: 22 }}>
          <Eyebrow>Who’s Behind the Training</Eyebrow>
          <h2 style={{ fontFamily: SERIF, fontSize: 'clamp(23px,5vw,34px)', fontWeight: 500, lineHeight: 1.15, letterSpacing: '-.01em', margin: '0 auto', maxWidth: 620, color: INK }}>{LP.founder.heading}</h2>
        </div>
        <div className="pcard" style={{ background: '#fff', border: `1px solid ${BORDER}`, borderRadius: 16, boxShadow: '0 22px 55px -34px rgba(46,26,53,.5)', padding: 'clamp(22px,5vw,32px)' }}>
          <div className="bio-row">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/founder.png" alt="Indrodip Ghosh, Founder of The5th" loading="lazy" style={{ width: 'clamp(120px,30vw,150px)', aspectRatio: '3 / 3.6', objectFit: 'cover', objectPosition: 'top center', borderRadius: 14, border: `2px solid rgba(201,168,76,.4)`, flexShrink: 0 }} />
            <div>
              {LP.founder.body.map((t, i) => (
                <p key={i} style={{ fontFamily: i === 2 ? SERIF : SANS, fontSize: i === 2 ? 'clamp(17px,3.9vw,20px)' : 'clamp(14.5px,3.3vw,16px)', fontStyle: i === 2 ? 'italic' : 'normal', fontWeight: i === 2 ? 500 : 300, color: i === 2 ? INK : BODY, lineHeight: i === 2 ? 1.35 : 1.7, margin: '0 0 12px' }}>{t}</p>
              ))}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 20px', margin: '14px 0 14px' }}>
                {[['$15M+', 'client revenue'], ['12', 'nations'], ['76+', 'experts coached']].map(([n, l]) => (
                  <div key={l as string} style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                    <span style={{ fontFamily: SERIF, fontSize: 20, fontWeight: 600, color: GREEN }}>{n}</span>
                    <span style={{ fontFamily: SANS, fontSize: 11.5, color: MUTE, letterSpacing: '.02em' }}>{l}</span>
                  </div>
                ))}
              </div>
              <div style={{ fontFamily: SERIF, fontSize: 19, fontWeight: 600, color: INK }}>{LP.founder.name}</div>
              <div style={{ fontFamily: SANS, fontSize: 12, color: GOLD_DK, fontWeight: 600, letterSpacing: '.04em' }}>{LP.founder.title}</div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════ WHO IT'S FOR ══════════ */}
      <section className="lp-sec" data-reveal style={{ maxWidth: 900, marginTop: 60 }}>
        <div style={{ textAlign: 'center', marginBottom: 26 }}>
          <Eyebrow>Is This For You?</Eyebrow>
          <h2 style={{ fontFamily: SERIF, fontSize: 'clamp(25px,5.2vw,36px)', fontWeight: 500, lineHeight: 1.14, letterSpacing: '-.01em', margin: 0, color: INK }}>{LP.whoFor.heading}</h2>
        </div>
        <div className="who-grid">
          <div className="pcard" style={{ background: '#fff', border: `1px solid ${BORDER}`, borderRadius: 14, padding: 'clamp(22px,4vw,28px)', boxShadow: '0 18px 44px -36px rgba(46,26,53,.5)' }}>
            <p style={{ fontFamily: SANS, fontSize: 11, fontWeight: 700, letterSpacing: '.16em', textTransform: 'uppercase', color: GREEN, margin: '0 0 16px' }}>This is for you</p>
            <div style={{ display: 'grid', gap: 13 }}>
              {LP.whoFor.forItems.map((t) => (
                <div key={t} style={{ display: 'flex', gap: 11, alignItems: 'flex-start' }}>
                  <span style={{ flexShrink: 0, marginTop: 1, color: GREEN }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={GREEN} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                  </span>
                  <span style={{ fontFamily: SANS, fontSize: 14.5, fontWeight: 400, color: '#4a4238', lineHeight: 1.55 }}>{t}</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{ background: 'linear-gradient(180deg,#fbf7f1,#f6efe4)', border: `1px solid ${BORDER}`, borderRadius: 14, padding: 'clamp(22px,4vw,28px)' }}>
            <p style={{ fontFamily: SANS, fontSize: 11, fontWeight: 700, letterSpacing: '.16em', textTransform: 'uppercase', color: '#a05a3c', margin: '0 0 16px' }}>{LP.whoFor.notHeading}</p>
            <div style={{ display: 'grid', gap: 13 }}>
              {LP.whoFor.notItems.map((t) => (
                <div key={t} style={{ display: 'flex', gap: 11, alignItems: 'flex-start' }}>
                  <span style={{ flexShrink: 0, marginTop: 1, color: '#b06a4a' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#b06a4a" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                  </span>
                  <span style={{ fontFamily: SANS, fontSize: 14.5, fontWeight: 400, color: '#6b5f52', lineHeight: 1.55 }}>{t}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <p style={{ fontFamily: SERIF, fontSize: 'clamp(19px,4.4vw,24px)', fontWeight: 500, color: INK, textAlign: 'center', margin: '26px auto 0', maxWidth: 540, lineHeight: 1.35 }}>{LP.whoFor.close}</p>
      </section>

      {/* ══════════ HOW IT WORKS ══════════ */}
      <section className="lp-sec" data-reveal style={{ maxWidth: 900, marginTop: 60 }}>
        <div style={{ textAlign: 'center', marginBottom: 26 }}>
          <Eyebrow>How It Works</Eyebrow>
          <h2 style={{ fontFamily: SERIF, fontSize: 'clamp(25px,5.2vw,36px)', fontWeight: 500, lineHeight: 1.14, letterSpacing: '-.01em', margin: 0, color: INK }}>{LP.how.heading}</h2>
        </div>
        <div className="how-grid">
          {LP.how.steps.map((s) => (
            <div key={s.n} style={{ textAlign: 'center', padding: 'clamp(18px,3vw,24px)' }}>
              <div style={{ width: 54, height: 54, margin: '0 auto 14px', borderRadius: '50%', background: `linear-gradient(160deg,${PLUM_MID},${PLUM})`, color: GOLD, fontFamily: SERIF, fontSize: 22, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 24px -12px rgba(46,26,53,.6)' }}>{s.n}</div>
              <h3 style={{ fontFamily: SERIF, fontSize: 21, fontWeight: 600, color: INK, margin: '0 0 6px' }}>{s.title}</h3>
              <p style={{ fontFamily: SANS, fontSize: 14.5, fontWeight: 300, color: BODY, lineHeight: 1.6, margin: 0 }}>{s.body}</p>
            </div>
          ))}
        </div>
        <p style={{ fontFamily: SERIF, fontSize: 'clamp(18px,4vw,22px)', fontWeight: 500, fontStyle: 'italic', color: GOLD_DK, textAlign: 'center', margin: '18px 0 0' }}>{LP.how.close}</p>
      </section>

      {/* ══════════ MID CTA ══════════ */}
      <section className="lp-sec" data-reveal style={{ marginTop: 58, textAlign: 'center' }}>
        <h2 style={{ fontFamily: SERIF, fontSize: 'clamp(28px,6vw,44px)', fontWeight: 500, lineHeight: 1.1, letterSpacing: '-.015em', color: INK, margin: 0 }}>{LP.midCta.heading}</h2>
        <p style={{ fontFamily: SANS, fontSize: 'clamp(15px,3.4vw,17px)', fontWeight: 300, color: BODY, lineHeight: 1.65, margin: '14px auto 24px', maxWidth: 480 }}>{LP.midCta.body}</p>
        <div style={{ display: 'flex', justifyContent: 'center' }}><CtaBlock onClick={primaryAction} label={ctaLabel} /></div>
      </section>

      <Divider max={520} />

      {/* ══════════ TESTIMONIALS (pull-quotes) ══════════ */}
      <section className="lp-sec" data-reveal style={{ maxWidth: 720, marginTop: 8 }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <Eyebrow>In Their Words</Eyebrow>
          <h2 style={{ fontFamily: SERIF, fontSize: 'clamp(25px,5.2vw,36px)', fontWeight: 500, lineHeight: 1.14, letterSpacing: '-.01em', margin: 0, color: INK }}>{LP.testimonialsHeading}</h2>
        </div>
        <div style={{ display: 'grid', gap: 16 }}>
          {REAL_PROOF.filter((p) => p.quote.trim().startsWith('“')).map((p) => (
            <figure key={p.name} className="pcard" style={{ margin: 0, background: '#fff', border: `1px solid ${BORDER}`, borderLeft: `3px solid ${GOLD}`, borderRadius: 12, padding: 'clamp(22px,4vw,28px)', position: 'relative' }}>
              <Sparkle size={16} color="rgba(201,168,76,.5)" style={{ position: 'absolute', top: 16, right: 18 }} />
              <blockquote style={{ margin: 0, fontFamily: SERIF, fontSize: 'clamp(19px,4.4vw,24px)', fontWeight: 500, fontStyle: 'italic', color: INK, lineHeight: 1.4 }}>{p.quote}</blockquote>
              <figcaption style={{ marginTop: 14, fontFamily: SANS, fontSize: 13, color: MUTE }}>
                <strong style={{ color: INK, fontWeight: 700 }}>{p.name}</strong> · {p.role} <span style={{ color: GREEN, fontWeight: 700 }}>· {p.result}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* ══════════ SECOND OBJECTION ══════════ */}
      <section className="lp-sec" data-reveal style={{ marginTop: 58, textAlign: 'center' }}>
        <h2 style={{ fontFamily: SERIF, fontSize: 'clamp(25px,5.4vw,38px)', fontWeight: 500, lineHeight: 1.14, letterSpacing: '-.01em', color: INK, margin: '0 auto', maxWidth: 560 }}>{LP.secondObjection.heading}</h2>
        <div style={{ maxWidth: 480, margin: '16px auto 24px' }}>
          {LP.secondObjection.body.map((t) => (
            <p key={t} style={{ fontFamily: SANS, fontSize: 'clamp(15px,3.4vw,17px)', fontWeight: 300, color: BODY, lineHeight: 1.7, margin: '4px 0' }}>{t}</p>
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'center' }}><CtaBlock onClick={primaryAction} label={ctaLabel} max={440} size={14.5} /></div>
      </section>

      {/* ══════════ FINAL CTA (dark, strongest) ══════════ */}
      <section data-reveal style={{ position: 'relative', overflow: 'hidden', marginTop: 62, background: `linear-gradient(168deg,${PLUM_2} 0%,${PLUM} 55%,#241029 100%)`, padding: 'clamp(60px,11vw,92px) 0' }}>
        <div aria-hidden="true" style={{ position: 'absolute', inset: 0, opacity: .5, backgroundImage: GRAIN_URI, mixBlendMode: 'overlay', pointerEvents: 'none' }} />
        <div className="glow float" aria-hidden="true" style={{ top: '50%', left: '50%', width: 'min(560px,88vw)', height: 360, transform: 'translate(-50%,-50%)', background: 'radial-gradient(ellipse at center, rgba(201,168,76,.20), transparent 70%)' }} />
        <Sparkle size={22} color="rgba(201,168,76,.45)" style={{ position: 'absolute', top: 34, left: 30 }} />
        <Sparkle size={16} color="rgba(201,168,76,.35)" style={{ position: 'absolute', top: 60, right: 40 }} />
        <Sparkle size={18} color="rgba(201,168,76,.3)" style={{ position: 'absolute', bottom: 40, left: '18%' }} />
        <div className="lp-sec" style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <Eyebrow>The Free 12-Minute Training</Eyebrow>
          <h2 style={{ fontFamily: SERIF, fontSize: 'clamp(28px,6.4vw,48px)', fontWeight: 500, lineHeight: 1.1, letterSpacing: '-.015em', color: '#fff', margin: '0 auto', maxWidth: 620 }}>{LP.finalCta.heading}</h2>
          <div style={{ margin: '18px auto 28px', maxWidth: 420 }}>
            {LP.finalCta.body.map((t) => (
              <p key={t} style={{ fontFamily: SERIF, fontSize: 'clamp(19px,4.6vw,26px)', fontWeight: 500, fontStyle: 'italic', color: GOLD_L, lineHeight: 1.3, margin: '2px 0' }}>{t}</p>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'center' }}><CtaBlock onClick={primaryAction} label={ctaLabel} max={500} size={16} light /></div>
          <div style={{ marginTop: 30 }}><Stars light /></div>
        </div>
      </section>

      {/* ══════════ FINAL TRUST ══════════ */}
      <section className="lp-sec" style={{ marginTop: 48, textAlign: 'center' }}>
        <h3 style={{ fontFamily: SERIF, fontSize: 'clamp(20px,4.6vw,26px)', fontWeight: 500, color: INK, margin: '0 auto 12px', maxWidth: 520, lineHeight: 1.25 }}>{LP.finalTrust.heading}</h3>
        <p style={{ fontFamily: SANS, fontSize: 14, fontWeight: 300, color: BODY, lineHeight: 1.7, margin: '0 auto', maxWidth: 500 }}>
          Led by <strong style={{ color: INK, fontWeight: 600 }}>{LP.founder.name}</strong>, {LP.founder.title} — advising Fortune 500 leaders and billion-dollar companies, with <strong style={{ color: GREEN, fontWeight: 600 }}>$15M+</strong> generated by clients across 12 countries.
        </p>
        <p style={{ fontFamily: SANS, fontSize: 12.5, fontWeight: 600, letterSpacing: '.02em', color: GOLD_DK, margin: '18px 0 0' }}>{LP.finalTrust.privacy}</p>
      </section>

      {/* ══════════ FOOTER ══════════ */}
      <footer style={{ marginTop: 50, background: `linear-gradient(180deg,${PLUM_2},${PLUM})`, padding: '34px 20px 40px' }}>
        <div style={{ maxWidth: 640, margin: '0 auto', textAlign: 'center' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/logo-white.png" alt="The5th Consulting" loading="lazy" style={{ height: 'clamp(42px,11vw,56px)', width: 'auto', opacity: .95 }} />
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

      {/* Opt-in modal (the gate) — unchanged behavior */}
      {modalOpen && (
        <div role="dialog" aria-modal="true" onClick={(e) => { if (e.target === e.currentTarget && !loading) setModalOpen(false) }}
          style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(24,12,26,.62)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, animation: 'fade .2s ease' }}>
          <div style={{ position: 'relative', width: '100%', maxWidth: 430, background: PARCH, borderRadius: 16, boxShadow: '0 40px 90px rgba(20,8,22,.5)', overflow: 'hidden', animation: 'rise .35s ease both' }}>
            <div style={{ background: `linear-gradient(180deg,${PLUM_2},${PLUM})`, height: 4 }} />
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
                <input className="lp-input" style={{ marginTop: 12 }} type="email" inputMode="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" autoComplete="email" enterKeyHint="go" />
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
