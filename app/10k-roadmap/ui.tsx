'use client'
/* Shared premium dark UI kit for the $10K Roadmap Audit funnel.
   One source of truth for the aesthetic (fonts, tokens, buttons, reveals) and
   the one-question-at-a-time flow engine, so every step feels like one
   continuous, expensive experience. */
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, useReducedMotion } from 'framer-motion'
import { T, STEPS, GATE, LEGAL, HELP, PRESS, type Q } from './config'

/* ── Global styles / fonts (scoped to the funnel routes) ───────────────────*/
export function Fonts() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Plus+Jakarta+Sans:wght@600;700;800&display=swap');
      *{box-sizing:border-box}
      html{scroll-behavior:smooth}
      section[id]{scroll-margin-top:86px}
      html,body{margin:0;padding:0;background:${T.bg};color:${T.text};font-family:${T.sans};-webkit-font-smoothing:antialiased;text-rendering:optimizeLegibility}
      ::selection{background:${T.accentSoft};color:${T.text}}
      a{color:inherit}
      .rm-serif{font-family:${T.serif};font-weight:700;letter-spacing:-.022em;line-height:1.05}
      .rm-eyebrow{font-size:12px;font-weight:700;letter-spacing:.2em;text-transform:uppercase;color:${T.accentInk}}
      .rm-mark{color:${T.accentInk}}
      @keyframes rm-fade{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
      @keyframes rm-spin{to{transform:rotate(360deg)}}
      @keyframes rm-draw{to{stroke-dashoffset:0}}
      @media (prefers-reduced-motion: reduce){
        *{animation-duration:.001ms!important}
      }
      button{font-family:inherit}
      img{max-width:100%}
      h1,h2,h3{text-wrap:balance}
      p{text-wrap:pretty}
      .rm-focus:focus-visible{outline:2px solid ${T.accent};outline-offset:3px;border-radius:10px}
      .rm-range:focus-visible{outline:2px solid ${T.accent};outline-offset:5px;border-radius:999px}
      /* Shared premium interaction primitives. Hover/press live on Btn as
         Motion spring gestures now; the shine sweep stays CSS (Motion has
         no clean ::after hook) and transform/opacity only, per the motion
         floor (never width/height/top/left). */
      .rm-btn[disabled]{pointer-events:none}
      .rm-btn-shine{position:relative;overflow:hidden}
      .rm-btn-shine::after{content:'';position:absolute;inset:0;background:linear-gradient(115deg,transparent 30%,rgba(255,255,255,.4) 48%,rgba(255,255,255,.4) 52%,transparent 70%);transform:translateX(-130%);transition:transform .7s cubic-bezier(.16,1,.3,1);pointer-events:none}
      .rm-btn-shine:hover::after{transform:translateX(130%)}
      .rm-lift{transition:transform .45s cubic-bezier(.16,1,.3,1),box-shadow .45s cubic-bezier(.16,1,.3,1),border-color .3s ease;will-change:transform}
      .rm-lift:hover{transform:translateY(-6px)}
      .rm-pop{display:inline-flex;transition:transform .3s cubic-bezier(.16,1,.3,1),box-shadow .3s cubic-bezier(.16,1,.3,1),filter .25s ease}
      .rm-pop:hover{transform:translateY(-2px) scale(1.025);filter:brightness(1.05)}
      .rm-pop:active{transform:translateY(0) scale(.98)}
      .rm-photo-frame{overflow:hidden;display:block}
      .rm-photo-frame img{transition:transform .7s cubic-bezier(.16,1,.3,1);display:block}
      .rm-photo-frame:hover img{transform:scale(1.045)}
      @media (prefers-reduced-motion: reduce){
        .rm-lift,.rm-lift:hover,.rm-pop,.rm-pop:hover,.rm-pop:active,.rm-photo-frame img,.rm-photo-frame:hover img{transform:none!important;transition:none!important}
        .rm-btn-shine::after{display:none}
      }
      /* Mobile readability: more generous leading so text never feels cramped. */
      @media (max-width:640px){
        .rm-serif{letter-spacing:-.005em!important;line-height:1.2!important}
        p{line-height:1.68!important}
        li{line-height:1.6!important}
        details summary{line-height:1.4!important}
      }
    `}</style>
  )
}

/* ── UTM persistence (survives the whole funnel via sessionStorage) ────────*/
const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term']
export function useUtm(): Record<string, string> {
  // Lazy-read once (URL params + anything already persisted this session).
  const [utm] = useState<Record<string, string>>(() => {
    if (typeof window === 'undefined') return {}
    try {
      const stored = JSON.parse(sessionStorage.getItem('audit_utm') || '{}')
      const params = new URLSearchParams(window.location.search)
      const fresh: Record<string, string> = { ...stored }
      for (const k of UTM_KEYS) { const v = params.get(k); if (v) fresh[k] = v.slice(0, 160) }
      return fresh
    } catch { return {} }
  })
  // Persist to the session store (external system) so later steps inherit it.
  useEffect(() => { try { sessionStorage.setItem('audit_utm', JSON.stringify(utm)) } catch { /* noop */ } }, [utm])
  return utm
}

/* Stable client id for the applicant across the funnel. */
export function getAuditId(): string {
  if (typeof window === 'undefined') return ''
  try {
    let id = localStorage.getItem('audit_id')
    if (!id) { id = 'aud_' + Math.random().toString(36).slice(2) + Date.now().toString(36); localStorage.setItem('audit_id', id) }
    return id
  } catch { return '' }
}

/* Shared applicant answers (qualification) carried client-side to the
   post-payment page, where they're saved to the lead. */
export function saveQualAnswers(a: Record<string, unknown>) { try { sessionStorage.setItem('audit_qual', JSON.stringify(a)) } catch { /* noop */ } }
export function loadQualAnswers(): Record<string, unknown> { try { return JSON.parse(sessionStorage.getItem('audit_qual') || '{}') } catch { return {} } }

/* ── Scroll reveal ─────────────────────────────────────────────────────────
   Spring-settled rise with a soft blur-in — the one entrance every section
   on the funnel shares, so the whole site reads as one considered system
   rather than a CSS fade bolted onto each block. Triggers once, respects
   reduced motion, and never blocks content if JS is slow to hydrate. */
export function Reveal({ children, delay = 0, style, id }: { children: React.ReactNode; delay?: number; style?: React.CSSProperties; id?: string }) {
  const shouldReduceMotion = useReducedMotion()
  if (shouldReduceMotion) return <div id={id} style={style}>{children}</div>
  return (
    <motion.div
      id={id}
      style={style}
      initial={{ opacity: 0, y: 26, scale: 0.98, filter: 'blur(6px)' }}
      whileInView={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
      viewport={{ once: true, amount: 0.14 }}
      transition={{ type: 'spring', stiffness: 110, damping: 20, mass: 0.9, delay: delay / 1000 }}
    >
      {children}
    </motion.div>
  )
}

/* ── Buttons ───────────────────────────────────────────────────────────────*/
export function Btn({ children, onClick, href, variant = 'primary', full, type = 'button', disabled, style }: {
  children: React.ReactNode; onClick?: () => void; href?: string; variant?: 'primary' | 'ghost' | 'outline'; full?: boolean; type?: 'button' | 'submit'; disabled?: boolean; style?: React.CSSProperties
}) {
  const shouldReduceMotion = useReducedMotion()
  const base: React.CSSProperties = {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 10,
    fontFamily: T.sans, fontWeight: 700, fontSize: 16, letterSpacing: '.005em',
    padding: '16px 32px', minHeight: 54, borderRadius: 999, cursor: disabled ? 'not-allowed' : 'pointer',
    border: '1px solid transparent', textDecoration: 'none', width: full ? '100%' : undefined,
    opacity: disabled ? 0.55 : 1, WebkitTapHighlightColor: 'transparent',
  }
  const skin: React.CSSProperties = variant === 'primary'
    ? { background: T.accent, color: T.accentText, boxShadow: '0 14px 30px -14px rgba(201,255,72,.5)' }
    : variant === 'outline'
    ? { background: 'transparent', color: T.text, borderColor: T.lineStrong }
    : { background: T.surface, color: T.text, borderColor: T.lineStrong, boxShadow: '0 6px 18px -12px rgba(0,0,0,.4)' }
  // Spring-based hover/press — the tactile, slightly-overshooting feel that
  // reads as "expensive" rather than a flat CSS ease. Disabled entirely for
  // reduced-motion, and never on a disabled control.
  const gestures = (disabled || shouldReduceMotion) ? {} : {
    whileHover: { y: -3, filter: 'brightness(1.07)' },
    whileTap: { scale: 0.96, y: 0 },
    transition: { type: 'spring' as const, stiffness: 420, damping: 24, mass: 0.6 },
  }
  const props = {
    className: 'rm-focus rm-btn' + (variant === 'primary' ? ' rm-btn-shine' : ''),
    style: { ...base, ...skin, ...style },
    ...gestures,
  }
  if (href) return <motion.a href={href} onClick={onClick} {...props}>{children}</motion.a>
  return <motion.button type={type} onClick={onClick} disabled={disabled} {...props}>{children}</motion.button>
}

/* ── Minimal funnel header + footer ────────────────────────────────────────*/
function HelpContact() {
  const link: React.CSSProperties = { color: T.accentInk, fontWeight: 700, textDecoration: 'none', whiteSpace: 'nowrap' }
  return (
    <div style={{ textAlign: 'right', fontSize: 12.5, lineHeight: 1.45, color: T.text2, maxWidth: 260 }}>
      Need help? Text us at <a href={HELP.phoneHref} style={link}>{HELP.phone}</a> or email us at <a href={HELP.emailHref} style={link}>{HELP.email}</a>
    </div>
  )
}

export function Header({ nav, showFounder, homeHref = '/10k-roadmap' }: { nav?: { label: string; href: string }[]; showFounder?: boolean; homeHref?: string }) {
  // Always solid, from the very first pixel: the logo and founder credential
  // need a frame behind them on the first screen, not just after the visitor
  // scrolls past a transparent hero. (Scroll state kept only to deepen the
  // shadow slightly, never to toggle visibility.)
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => { const on = () => setScrolled(window.scrollY > 40); on(); window.addEventListener('scroll', on, { passive: true }); return () => window.removeEventListener('scroll', on) }, [])
  return (
    <header style={{ position: 'sticky', top: 0, zIndex: 50, transition: 'box-shadow .3s', background: 'rgba(7,10,6,.92)', backdropFilter: 'saturate(140%) blur(12px)', borderBottom: `1px solid ${T.line}`, boxShadow: scrolled ? '0 6px 24px -18px rgba(0,0,0,.5)' : 'none' }}>
      <div style={{ maxWidth: 1160, margin: '0 auto', padding: '12px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14 }}>
        <a href={homeHref} aria-label="The5th" style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/the5th-logo-colorful.png" alt="The5th Global Consulting" style={{ height: 'clamp(34px,5vw,46px)', width: 'auto' }} />
          {showFounder && (
            <span className="rm-header-founder" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ width: 1, height: 22, background: T.line }} />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/founder.png" alt="Indrodip Ghosh, Founder" style={{ width: 34, height: 34, borderRadius: '50%', objectFit: 'cover', border: `1.5px solid ${T.line}` }} />
            </span>
          )}
        </a>
        {nav && (
          <nav className="rm-nav" style={{ display: 'flex', gap: 28 }}>
            {nav.map((l) => <a key={l.label} href={l.href} style={{ fontSize: 14, fontWeight: 600, color: T.text2, textDecoration: 'none' }} onMouseEnter={(e) => (e.currentTarget.style.color = T.text)} onMouseLeave={(e) => (e.currentTarget.style.color = T.text2)}>{l.label}</a>)}
          </nav>
        )}
        <span className="rm-header-help"><HelpContact /></span>
      </div>
      {/* "As featured in" sits right under the logo, pinned to the header so
          it reads on the first screen alongside the brand mark, not only
          after scrolling down to the press strip further down the page.
          Mobile keeps the header down to just the logo (see below), so this
          row is hidden there rather than squeezed into a scrolling strip. */}
      <div className="rm-press-row" style={{ borderTop: `1px solid ${T.line}`, padding: '7px 18px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: T.text3, whiteSpace: 'nowrap' }}>Our Clients Featured In</span>
        <span style={{ display: 'flex', gap: 'clamp(10px,2vw,22px)', flexWrap: 'wrap', justifyContent: 'center' }}>
          {PRESS.items.map((p) => <span key={p} style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontWeight: 700, fontSize: 11.5, color: T.text2, opacity: 0.75, whiteSpace: 'nowrap' }}>{p}</span>)}
        </span>
      </div>
      <style>{`@media(max-width:900px){.rm-nav{display:none!important}}@media(max-width:640px){.rm-header-founder,.rm-header-help,.rm-press-row{display:none!important}}`}</style>
    </header>
  )
}

export function Footer({ legal }: { legal: { earnings: string; meta: string; copyright?: string; links: { label: string; href: string }[] } }) {
  return (
    <footer style={{ borderTop: `1px solid ${T.line}`, background: T.surface, padding: '46px 22px 60px' }}>
      <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/the5th-logo-purple.png" alt="The5th Global Consulting" style={{ height: 34, opacity: 0.9, marginBottom: 20 }} />
        <div style={{ display: 'flex', gap: 22, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 22 }}>
          {legal.links.map((l) => <a key={l.label} href={l.href} style={{ color: T.text2, fontSize: 13, textDecoration: 'none' }}>{l.label}</a>)}
        </div>
        <p style={{ color: T.text3, fontSize: 11.5, lineHeight: 1.7, maxWidth: 720, margin: '0 auto 14px' }}>{legal.earnings}</p>
        <p style={{ color: T.text3, fontSize: 11.5, lineHeight: 1.7, maxWidth: 720, margin: '0 auto 18px' }}>{legal.meta}</p>
        <LegalNote copyright={legal.copyright} />
      </div>
    </footer>
  )
}

/* Copyright + jurisdiction notice, shown at the foot of every funnel page.
   Defaults to the parent funnel's text for StepLegal's no-prop callers;
   Footer always passes its own `legal.copyright` through explicitly so an
   India (or any other localised) page shows its own jurisdiction, not the
   parent's. */
export function LegalNote({ copyright }: { copyright?: string } = {}) {
  return (
    <p style={{ color: T.text2, fontSize: 13, lineHeight: 1.75, maxWidth: 880, margin: '0 auto', textAlign: 'center' }}>{copyright || LEGAL.copyright}</p>
  )
}

/* Compact page-foot legal strip for step/form pages without the full Footer. */
export function StepLegal() {
  return (
    <footer style={{ borderTop: `1px solid ${T.line}`, background: T.surface, padding: '26px 22px 34px', marginTop: 40 }}>
      <div style={{ maxWidth: 860, margin: '0 auto' }}><LegalNote /></div>
    </footer>
  )
}

/* ── Progress bar ──────────────────────────────────────────────────────────*/
export function Progress({ value }: { value: number }) {
  return (
    <div style={{ height: 3, background: T.line, borderRadius: 999, overflow: 'hidden' }}>
      <div style={{ height: '100%', width: `${Math.max(4, Math.min(100, value * 100))}%`, background: T.accent, borderRadius: 999, transition: 'width .5s cubic-bezier(.2,.7,.2,1)' }} />
    </div>
  )
}

/* ── Booking wizard progress indicator (persists across all steps) ─────────*/
export function Stepper({ current }: { current: number }) {
  return (
    <div style={{ maxWidth: 640, margin: '0 auto 30px' }}>
      {/* Desktop: numbered steps + connectors */}
      <div className="rm-stepper" style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
        {STEPS.map((s, i) => {
          const done = i < current, active = i === current
          return (
            <React.Fragment key={s.key}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7, flex: '0 0 auto' }}>
                <span style={{ width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700,
                  background: done || active ? T.accent : T.surface, color: done || active ? T.accentText : T.text3,
                  border: `1.5px solid ${done || active ? 'transparent' : T.line}`,
                  boxShadow: active ? '0 8px 18px -6px rgba(201,255,72,.4)' : done ? '0 3px 8px -4px rgba(201,255,72,.3)' : 'none',
                  transition: 'background .3s ease, color .3s ease, border-color .3s ease, box-shadow .3s ease' }}>
                  {done ? '✓' : i + 1}
                </span>
                <span style={{ fontSize: 11.5, fontWeight: active ? 700 : 600, color: active ? T.text : T.text3, whiteSpace: 'nowrap' }}>{s.label}</span>
              </div>
              {i < STEPS.length - 1 && <span style={{ flex: 1, height: 2, background: i < current ? T.accent : T.line, margin: '0 6px', marginBottom: 22, borderRadius: 2 }} />}
            </React.Fragment>
          )
        })}
      </div>
      {/* Mobile: compact label + bar */}
      <div className="rm-stepper-m" style={{ display: 'none' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: T.text }}>{STEPS[current]?.label}</span>
          <span style={{ fontSize: 12, color: T.text3 }}>Step {current + 1} of {STEPS.length}</span>
        </div>
        <Progress value={(current + 1) / STEPS.length} />
      </div>
      <style>{`@media(max-width:640px){.rm-stepper{display:none!important}.rm-stepper-m{display:block!important}}`}</style>
    </div>
  )
}

/* ── Voice-to-text answer button ───────────────────────────────────────────
   Progressive enhancement on top of a text/textarea field: tap to talk, tap
   again to stop, the transcript is appended to whatever's already typed.
   Feature-detects the Web Speech API and renders nothing where it's
   unavailable (Firefox, Safari on some versions, etc.) — typing still works
   everywhere regardless. */
type SpeechRecognitionLike = {
  lang: string; continuous: boolean; interimResults: boolean
  start: () => void; stop: () => void
  onresult: ((e: { resultIndex: number; results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal: boolean }> }) => void) | null
  onerror: ((e: { error?: string }) => void) | null
  onend: (() => void) | null
}
function getSpeechRecognitionCtor(): (new () => SpeechRecognitionLike) | null {
  if (typeof window === 'undefined') return null
  const w = window as unknown as { SpeechRecognition?: new () => SpeechRecognitionLike; webkitSpeechRecognition?: new () => SpeechRecognitionLike }
  return w.SpeechRecognition || w.webkitSpeechRecognition || null
}
function VoiceInputButton({ onTranscript, align = 'top' }: { onTranscript: (text: string) => void; align?: 'top' | 'center' }) {
  const [listening, setListening] = useState(false)
  const [error, setError] = useState('')
  // Feature detection only runs after mount — the server has no `window`, so
  // rendering based on it synchronously would mismatch the client's first
  // render (a React hydration error). Render nothing until mounted, exactly
  // matching the server's output, then switch on if the browser supports it.
  const [Ctor, setCtor] = useState<(new () => SpeechRecognitionLike) | null>(null)
  const recRef = useRef<SpeechRecognitionLike | null>(null)
  useEffect(() => { setCtor(() => getSpeechRecognitionCtor()) }, [])
  useEffect(() => () => { recRef.current?.stop() }, [])
  if (!Ctor) return null

  const stop = () => { recRef.current?.stop(); setListening(false) }
  const start = () => {
    setError('')
    const rec = new Ctor()
    rec.lang = 'en-US'; rec.continuous = true; rec.interimResults = false
    rec.onresult = (e) => {
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i]
        if (r.isFinal) onTranscript(r[0].transcript.trim())
      }
    }
    // Surface *why* it stopped instead of reverting silently — "not-allowed"
    // (mic permission denied or blocked by the browser/site policy) and
    // "network" (the browser's speech service is unreachable) are the two a
    // visitor can actually act on; anything else just quietly resets.
    rec.onerror = (e) => {
      setListening(false)
      const code = e?.error
      if (code === 'not-allowed' || code === 'service-not-allowed') setError('Mic access is blocked — check your browser/site permissions.')
      else if (code === 'network') setError('Voice input needs an internet connection. Try typing instead.')
    }
    rec.onend = () => setListening(false)
    recRef.current = rec
    try { rec.start(); setListening(true) } catch { setError('Couldn’t start voice input. Try typing instead.') }
  }

  return (
    <>
      <button type="button" onClick={listening ? stop : start} aria-label={listening ? 'Stop voice input' : 'Answer by voice'} className="rm-focus"
        style={{
          position: 'absolute', right: 12, ...(align === 'center' ? { top: '50%', transform: 'translateY(-50%)' } : { top: 12 }),
          width: 38, height: 38, borderRadius: '50%', border: 'none', cursor: 'pointer',
          background: listening ? T.danger : T.accentSoft, color: listening ? '#fff' : T.accentInk,
          display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background .15s',
        }}>
        {listening && <span aria-hidden style={{ position: 'absolute', inset: -4, borderRadius: '50%', border: `2px solid ${T.danger}`, opacity: .6, animation: 'rm-voice-pulse 1.4s ease-out infinite' }} />}
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <rect x="9" y="2" width="6" height="12" rx="3" /><path d="M5 10a7 7 0 0 0 14 0" /><line x1="12" y1="19" x2="12" y2="22" />
        </svg>
        <style>{`@keyframes rm-voice-pulse{from{transform:scale(1);opacity:.6}to{transform:scale(1.5);opacity:0}}`}</style>
      </button>
      {error && <span style={{ position: 'absolute', right: 0, top: '100%', marginTop: 6, fontSize: 11.5, color: T.danger, whiteSpace: 'nowrap' }}>{error}</span>}
    </>
  )
}

/* ── One-question-at-a-time flow engine ────────────────────────────────────
   Handles single / multi / scale / text with keyboard support. A `reject`
   option fires onReject immediately. Emits onComplete(answers) at the end. */
export function QuestionFlow({ questions, onComplete, onReject, eyebrow, onStep }: {
  questions: Q[]
  onComplete: (answers: Record<string, string | string[]>) => void
  onReject?: (reason: string, answers: Record<string, string | string[]>) => void
  eyebrow?: string
  onStep?: (index: number) => void
}) {
  const [i, setI] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({})
  const [leaving, setLeaving] = useState(false)
  const q = questions[i]
  const total = questions.length

  const advance = useCallback((next: Record<string, string | string[]>) => {
    if (i + 1 >= total) { onComplete(next); return }
    setLeaving(true)
    setTimeout(() => { setI((x) => x + 1); setLeaving(false); onStep?.(i + 1) }, 190)
  }, [i, total, onComplete, onStep])

  const choose = useCallback((val: string, reject?: boolean) => {
    const next = { ...answers, [q.id]: val }
    setAnswers(next)
    if (reject && onReject) { onReject(val, next); return }
    setTimeout(() => advance(next), 130)
  }, [answers, q, onReject, advance])

  const toggleMulti = useCallback((val: string) => {
    setAnswers((a) => {
      const cur = Array.isArray(a[q.id]) ? (a[q.id] as string[]) : []
      return { ...a, [q.id]: cur.includes(val) ? cur.filter((x) => x !== val) : [...cur, val] }
    })
  }, [q])

  // Keyboard: number keys pick options on single/multi; Enter continues.
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (q.type === 'single' || q.type === 'multi') {
        const n = parseInt(e.key, 10)
        if (n >= 1 && n <= q.options.length) {
          const opt = q.options[n - 1]
          if (q.type === 'single') choose(opt.value, opt.reject)
          else toggleMulti(opt.value)
        }
      }
      if (e.key === 'Enter' && (q.type === 'text' || q.type === 'scale' || q.type === 'multi')) {
        const el = document.querySelector('#rm-continue-host button') as HTMLButtonElement | null
        if (el && !el.disabled) el.click()
      }
    }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [q, choose, toggleMulti])

  const cardStyle: React.CSSProperties = {
    animation: leaving ? undefined : 'rm-fade .32s cubic-bezier(.2,.7,.2,1)',
    opacity: leaving ? 0 : 1, transform: leaving ? 'translateY(-8px)' : 'none', transition: 'opacity .19s, transform .19s',
  }

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: '0 4px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 26 }}>
        <div style={{ flex: 1 }}><Progress value={(i + (q.type === 'single' ? 0 : 0.5)) / total} /></div>
        <span style={{ color: T.text3, fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap' }}>{i + 1} / {total}</span>
      </div>

      <div key={i} style={cardStyle}>
        {eyebrow && i === 0 && <div className="rm-eyebrow" style={{ marginBottom: 14 }}>{eyebrow}</div>}
        <h2 className="rm-serif" style={{ fontSize: 'clamp(24px,3.6vw,32px)', margin: '0 0 10px' }}>{q.prompt}</h2>
        {q.helper && <p style={{ color: T.text2, fontSize: 15, lineHeight: 1.6, margin: '0 0 22px' }}>{q.helper}</p>}
        {!q.helper && <div style={{ height: 16 }} />}

        {(q.type === 'single' || q.type === 'multi') && (
          <div style={{ display: 'grid', gap: 10 }}>
            {q.options.map((opt, idx) => {
              const selected = q.type === 'multi' ? (Array.isArray(answers[q.id]) && (answers[q.id] as string[]).includes(opt.value)) : answers[q.id] === opt.value
              return (
                <button key={opt.value} className="rm-focus"
                  onClick={() => q.type === 'single' ? choose(opt.value, opt.reject) : toggleMulti(opt.value)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 14, textAlign: 'left', width: '100%',
                    padding: '16px 18px', borderRadius: 14, cursor: 'pointer',
                    background: selected ? T.accentSoft : T.surface,
                    border: `1px solid ${selected ? T.accent : T.line}`,
                    color: T.text, fontSize: 15.5, transition: 'background .15s, border-color .15s, transform .1s',
                  }}
                  onMouseEnter={(e) => { if (!selected) e.currentTarget.style.borderColor = T.lineStrong }}
                  onMouseLeave={(e) => { if (!selected) e.currentTarget.style.borderColor = T.line }}
                >
                  <span style={{ width: 26, height: 26, flexShrink: 0, borderRadius: q.type === 'multi' ? 7 : '50%', border: `1.5px solid ${selected ? T.accent : T.lineStrong}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.accentInk, fontSize: 12, fontWeight: 700 }}>
                    {selected ? '✓' : <span style={{ color: T.text3 }}>{idx + 1}</span>}
                  </span>
                  <span>{opt.label}</span>
                </button>
              )
            })}
          </div>
        )}

        {q.type === 'scale' && (
          <ScaleInput q={q} value={answers[q.id] as string} onChange={(v) => setAnswers((a) => ({ ...a, [q.id]: v }))} />
        )}

        {q.type === 'text' && (
          <div style={{ position: 'relative' }}>
            {q.long
              ? <textarea className="rm-focus" placeholder={q.placeholder || 'Type your answer, or tap the mic to talk…'} value={(answers[q.id] as string) || ''} onChange={(e) => setAnswers((a) => ({ ...a, [q.id]: e.target.value }))} rows={8}
                  style={{ width: '100%', minHeight: 220, background: T.surface, border: `1px solid ${T.line}`, borderRadius: 16, color: T.text, fontSize: 17, padding: '20px 60px 20px 20px', resize: 'vertical', fontFamily: T.sans, lineHeight: 1.7 }} autoFocus />
              : <input className="rm-focus" placeholder={q.placeholder || 'Type your answer, or tap the mic to talk…'} value={(answers[q.id] as string) || ''} onChange={(e) => setAnswers((a) => ({ ...a, [q.id]: e.target.value }))}
                  style={{ width: '100%', minHeight: 64, background: T.surface, border: `1px solid ${T.line}`, borderRadius: 16, color: T.text, fontSize: 17, padding: '20px 60px 20px 20px', fontFamily: T.sans }} autoFocus />}
            <VoiceInputButton align={q.long ? 'top' : 'center'} onTranscript={(t) => setAnswers((a) => { const prev = (a[q.id] as string) || ''; return { ...a, [q.id]: prev ? `${prev} ${t}` : t } })} />
          </div>
        )}

        {(q.type === 'text' || q.type === 'scale' || q.type === 'multi') && (
          <div style={{ marginTop: 22, display: 'flex', alignItems: 'center', gap: 14 }}>
            <span id="rm-continue-host" style={{ display: 'inline-flex' }}>
              <Btn onClick={() => advance(answers)} disabled={q.type === 'multi' ? !(Array.isArray(answers[q.id]) && (answers[q.id] as string[]).length > 0) : q.type === 'scale' ? !answers[q.id] : false}>
                {i + 1 >= total ? 'Finish' : 'Continue'} →
              </Btn>
            </span>
            <span style={{ color: T.text3, fontSize: 12.5 }}>press Enter ↵</span>
          </div>
        )}
        {q.type === 'single' && <p style={{ marginTop: 18, color: T.text3, fontSize: 12.5 }}>Tap an option, or press its number.</p>}
      </div>
    </div>
  )
}

function ScaleInput({ q, value, onChange }: { q: Extract<Q, { type: 'scale' }>; value?: string; onChange: (v: string) => void }) {
  const nums = useMemo(() => Array.from({ length: q.max - q.min + 1 }, (_, k) => q.min + k), [q.min, q.max])
  return (
    <div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {nums.map((n) => {
          const sel = value === String(n)
          return (
            <button key={n} className="rm-focus" onClick={() => onChange(String(n))}
              style={{ flex: '1 0 auto', minWidth: 46, height: 52, borderRadius: 12, cursor: 'pointer', fontSize: 16, fontWeight: 700,
                background: sel ? T.accent : T.surface, color: sel ? T.accentText : T.text, border: `1px solid ${sel ? T.accent : T.line}`, transition: 'background .12s, color .12s, border-color .12s' }}>
              {n}
            </button>
          )
        })}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, color: T.text3, fontSize: 12.5 }}>
        <span>{q.min} · {q.minLabel}</span><span>{q.maxLabel} · {q.max}</span>
      </div>
    </div>
  )
}

/* Shared frame for wizard steps: chrome + persistent progress indicator. */
export function StepFrame({ current, children, wide, homeHref }: { current: number; children: React.ReactNode; wide?: boolean; homeHref?: string }) {
  return (
    <div style={{ minHeight: '100dvh', background: T.bg, color: T.text, fontFamily: T.sans, display: 'flex', flexDirection: 'column' }}>
      <Fonts />
      <Header homeHref={homeHref} />
      <main style={{ flex: 1, width: '100%', maxWidth: wide ? 1040 : 720, margin: '0 auto', padding: 'clamp(28px,5vw,44px) clamp(20px,4vw,22px) 48px' }}>
        <Stepper current={current} />
        {children}
      </main>
      <StepLegal />
    </div>
  )
}

/* ── Payment gate (client side of the server gate) ─────────────────────────
   Rendered by a gated step's server component when the paid cookie is absent.
   Re-verifies payment against the DB via /api/10k-roadmap/unlock (which issues
   the cookie on success), then refreshes so the server renders the real step.
   Polls briefly to absorb the webhook lag after the Whop redirect. */
export function PayGate() {
  const router = useRouter()
  const [mode, setMode] = useState<'checking' | 'ask'>('checking')
  const [emailInput, setEmailInput] = useState('')
  const [note, setNote] = useState('')
  const runRef = useRef(0)

  // On a confirmed payment: save the qualification answers to the lead, remember
  // the email for later steps, and re-render the server component (now unlocked).
  const unlockAndGo = useCallback(async (em: string) => {
    try {
      await fetch('/api/10k-roadmap/reserve', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: em, qualification: loadQualAnswers(), audit_id: getAuditId() }) })
    } catch { /* best effort */ }
    try { sessionStorage.setItem('audit_email', em) } catch { /* noop */ }
    router.refresh()
  }, [router])

  const startCheck = useCallback((em: string) => {
    const myRun = ++runRef.current
    setMode('checking'); setNote('')
    let tries = 0
    const poll = async () => {
      if (runRef.current !== myRun) return
      tries++
      try {
        const r = await fetch('/api/10k-roadmap/unlock', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: em }) })
        const j = await r.json()
        if (runRef.current !== myRun) return
        if (j?.paid) { unlockAndGo(em); return }
      } catch { /* keep polling */ }
      if (tries >= 8) { setMode('ask'); setNote('We couldn’t find a completed payment for that email yet. If you just paid, wait a few seconds and try again.'); return }
      setTimeout(poll, 2500)
    }
    poll()
  }, [unlockAndGo])

  useEffect(() => {
    ;(async () => {
      let em = ''
      try { em = (new URLSearchParams(window.location.search).get('email') || '').trim().toLowerCase() || sessionStorage.getItem('audit_email') || '' } catch { /* noop */ }
      if (em) { setEmailInput(em); startCheck(em) } else { setMode('ask') }
    })()
  }, [startCheck])

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const em = emailInput.trim().toLowerCase()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)) { setNote('Please enter a valid email.'); return }
    startCheck(em)
  }

  return (
    <div style={{ textAlign: 'center', padding: '54px 20px', maxWidth: 460, margin: '0 auto' }}>
      {mode === 'checking' ? (
        <>
          <div style={{ width: 32, height: 32, borderRadius: '50%', border: `3px solid ${T.line}`, borderTopColor: T.accent, animation: 'rm-spin .8s linear infinite', margin: '0 auto 20px' }} />
          <h1 className="rm-serif" style={{ fontSize: 26, margin: '0 0 8px', fontWeight: 700 }}>{GATE.verifying}</h1>
          <p style={{ color: T.text2, fontSize: 15 }}>{GATE.verifyingSub}</p>
        </>
      ) : (
        <>
          <h1 className="rm-serif" style={{ fontSize: 26, margin: '0 0 10px', fontWeight: 700 }}>Confirm your payment to continue.</h1>
          <p style={{ color: T.text2, fontSize: 15, lineHeight: 1.6, marginBottom: 20 }}>Enter the email you used at checkout and we’ll unlock the next step.</p>
          <form onSubmit={submit} style={{ display: 'grid', gap: 10 }}>
            <input className="rm-focus" type="email" placeholder="Email used at checkout" value={emailInput} onChange={(e) => setEmailInput(e.target.value)}
              style={{ width: '100%', background: T.surface, border: `1px solid ${T.line}`, borderRadius: 12, color: T.text, fontSize: 15.5, padding: '14px 15px', fontFamily: T.sans }} />
            {note && <p style={{ color: T.text3, fontSize: 13, margin: 0, lineHeight: 1.5 }}>{note}</p>}
            <Btn type="submit" full>Unlock my booking →</Btn>
          </form>
          <p style={{ marginTop: 16 }}>
            <a href="/10k-roadmap/pay" style={{ color: T.text3, fontSize: 13, textDecoration: 'underline' }}>Haven’t paid yet? Go to payment →</a>
          </p>
        </>
      )}
    </div>
  )
}

/* ── Video modal (accessible) ──────────────────────────────────────────────*/
export function VideoModal({ src, onClose }: { src: string; onClose: () => void }) {
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', h)
    document.body.style.overflow = 'hidden'
    return () => { window.removeEventListener('keydown', h); document.body.style.overflow = '' }
  }, [onClose])
  return (
    <div role="dialog" aria-modal="true" aria-label="Client testimonial" onClick={onClose}
      style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,.86)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 18, animation: 'rm-fade .2s' }}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: 'min(900px,100%)', aspectRatio: '16/9', position: 'relative', borderRadius: 16, overflow: 'hidden', boxShadow: '0 40px 120px -30px #000' }}>
        <button className="rm-focus" aria-label="Close" onClick={onClose} style={{ position: 'absolute', top: -46, right: 0, background: 'transparent', border: 'none', color: '#fff', fontSize: 30, cursor: 'pointer', lineHeight: 1 }}>×</button>
        <iframe src={src} title="Client testimonial" allow="autoplay; encrypted-media; fullscreen; picture-in-picture" allowFullScreen style={{ width: '100%', height: '100%', border: 'none', background: '#000' }} />
      </div>
    </div>
  )
}
