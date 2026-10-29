'use client'
/* Shared UI kit + the 5-step quiz engine for /roadmap-session. Mobile-first:
   16px+ base font, 44px+ tap targets, visible focus states (brief P1/design
   rules). Separate from app/10k-roadmap/ui.tsx on purpose — this route must
   not depend on, or risk changing, that funnel's behavior. */
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { T, QUIZ, QUIZ_INTRO, LEGAL, HELP, type Step } from './content'
import { track } from './track'

/* ── Fonts / base styles ───────────────────────────────────────────────── */
export function Fonts() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Plus+Jakarta+Sans:wght@600;700;800&display=swap');
      *{box-sizing:border-box}
      html{scroll-behavior:smooth}
      section[id]{scroll-margin-top:86px}
      html,body{margin:0;padding:0;background:${T.bg};color:${T.text};font-family:${T.sans};font-size:16px;-webkit-font-smoothing:antialiased;text-rendering:optimizeLegibility}
      ::selection{background:${T.accentSoft};color:${T.text}}
      a{color:inherit}
      .rs-serif{font-family:${T.serif};font-weight:700;letter-spacing:-.022em;line-height:1.05}
      .rs-eyebrow{font-size:12px;font-weight:700;letter-spacing:.2em;text-transform:uppercase;color:${T.accentInk}}
      .rs-reveal{opacity:0;transform:translateY(16px);transition:opacity .7s cubic-bezier(.2,.7,.2,1),transform .7s cubic-bezier(.2,.7,.2,1)}
      .rs-reveal.in{opacity:1;transform:none}
      @keyframes rs-fade{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
      @keyframes rs-spin{to{transform:rotate(360deg)}}
      @keyframes rs-draw{to{stroke-dashoffset:0}}
      @media (prefers-reduced-motion: reduce){.rs-reveal{opacity:1!important;transform:none!important;transition:none!important}*{animation-duration:.001ms!important}}
      button{font-family:inherit}
      img{max-width:100%}
      h1,h2,h3{text-wrap:balance}
      p{text-wrap:pretty}
      .rs-focus:focus-visible{outline:3px solid ${T.accent};outline-offset:3px;border-radius:10px}
      @media (max-width:640px){p{line-height:1.68!important}li{line-height:1.6!important}}
    `}</style>
  )
}

/* ── Attribution: UTM + fbp/fbc + a stable visitor id, persisted for the
   whole session so every event and the quiz save carry it (brief section 7). */
const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term']
function readCookie(name: string): string | null {
  if (typeof document === 'undefined') return null
  const m = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'))
  return m ? decodeURIComponent(m[1]) : null
}
export function useUtm(): Record<string, string> {
  const [utm] = useState<Record<string, string>>(() => {
    if (typeof window === 'undefined') return {}
    try {
      const stored = JSON.parse(sessionStorage.getItem('rs_utm') || '{}')
      const params = new URLSearchParams(window.location.search)
      const fresh: Record<string, string> = { ...stored }
      for (const k of UTM_KEYS) { const v = params.get(k); if (v) fresh[k] = v.slice(0, 160) }
      return fresh
    } catch { return {} }
  })
  useEffect(() => { try { sessionStorage.setItem('rs_utm', JSON.stringify(utm)) } catch { /* noop */ } }, [utm])
  return utm
}
export function useFbpFbc(): { fbp: string | null; fbc: string | null } {
  const [v] = useState(() => {
    if (typeof window === 'undefined') return { fbp: null, fbc: null }
    let fbc = readCookie('_fbc')
    if (!fbc) {
      try {
        const fbclid = new URLSearchParams(window.location.search).get('fbclid')
        if (fbclid) fbc = `fb.1.${Date.now()}.${fbclid}`
      } catch { /* noop */ }
    }
    return { fbp: readCookie('_fbp'), fbc }
  })
  return v
}
export function getVisitorId(): string {
  if (typeof window === 'undefined') return ''
  try {
    let id = localStorage.getItem('rs_visitor_id')
    if (!id) { id = 'rs_' + Math.random().toString(36).slice(2) + Date.now().toString(36); localStorage.setItem('rs_visitor_id', id) }
    return id
  } catch { return '' }
}
export function saveRsEmail(email: string) { try { sessionStorage.setItem('rs_email', email) } catch { /* noop */ } }
export function loadRsEmail(): string { try { return sessionStorage.getItem('rs_email') || '' } catch { return '' } }
export function saveRsName(name: string) { try { sessionStorage.setItem('rs_name', name) } catch { /* noop */ } }
export function loadRsName(): string { try { return sessionStorage.getItem('rs_name') || '' } catch { return '' } }

/* ── Scroll reveal ─────────────────────────────────────────────────────── */
export function Reveal({ children, delay = 0, style, id }: { children: React.ReactNode; delay?: number; style?: React.CSSProperties; id?: string }) {
  const ref = useRef<HTMLDivElement | null>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { el.classList.add('in'); io.disconnect() } }), { threshold: 0.14 })
    io.observe(el)
    return () => io.disconnect()
  }, [])
  return <div id={id} ref={ref} className="rs-reveal" style={{ transitionDelay: `${delay}ms`, ...style }}>{children}</div>
}

/* ── Buttons (44px+ tap target everywhere) ─────────────────────────────── */
export function Btn({ children, onClick, href, variant = 'primary', full, type = 'button', disabled, style, ariaLabel }: {
  children: React.ReactNode; onClick?: () => void; href?: string; variant?: 'primary' | 'ghost' | 'outline'; full?: boolean; type?: 'button' | 'submit'; disabled?: boolean; style?: React.CSSProperties; ariaLabel?: string
}) {
  const base: React.CSSProperties = {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 10,
    fontFamily: T.sans, fontWeight: 700, fontSize: 16, letterSpacing: '.005em',
    padding: '16px 32px', minHeight: 48, minWidth: 44, borderRadius: 999, cursor: disabled ? 'not-allowed' : 'pointer',
    border: '1px solid transparent', textDecoration: 'none', width: full ? '100%' : undefined,
    transition: 'transform .18s cubic-bezier(.2,.7,.2,1), box-shadow .2s ease, filter .18s ease',
    opacity: disabled ? 0.55 : 1, WebkitTapHighlightColor: 'transparent',
  }
  const skin: React.CSSProperties = variant === 'primary'
    ? { background: 'linear-gradient(180deg,#6b39a0 0%,#5a2c86 55%,#4c2472 100%)', color: '#fff', boxShadow: '0 16px 32px -14px rgba(94,46,134,.7), inset 0 1px 0 rgba(255,255,255,.22)' }
    : variant === 'outline'
    ? { background: 'transparent', color: T.text, borderColor: T.lineStrong }
    : { background: '#fff', color: T.text, borderColor: T.lineStrong, boxShadow: '0 6px 18px -12px rgba(46,26,53,.4)' }
  const props = { className: 'rs-focus rs-btn', 'aria-label': ariaLabel, style: { ...base, ...skin, ...style } }
  if (href) return <a href={href} onClick={onClick} {...props}>{children}</a>
  return <button type={type} onClick={onClick} disabled={disabled} {...props}>{children}</button>
}

/* ── Header / Footer ───────────────────────────────────────────────────── */
export function Header() {
  const [solid, setSolid] = useState(false)
  useEffect(() => { const on = () => setSolid(window.scrollY > 40); on(); window.addEventListener('scroll', on, { passive: true }); return () => window.removeEventListener('scroll', on) }, [])
  return (
    <header style={{ position: 'sticky', top: 0, zIndex: 50, transition: 'background .3s, border-color .3s', background: solid ? 'rgba(255,255,255,.92)' : 'transparent', backdropFilter: solid ? 'saturate(140%) blur(12px)' : 'none', borderBottom: `1px solid ${solid ? T.line : 'transparent'}` }}>
      <div style={{ maxWidth: 1160, margin: '0 auto', padding: '12px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14 }}>
        <a href="/roadmap-session" aria-label="The5th Global Consulting home" style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0, minHeight: 44 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/the5th-logo-purple.png" alt="The5th Global Consulting logo" width={140} height={40} style={{ height: 'clamp(32px,5vw,40px)', width: 'auto' }} />
        </a>
        <p style={{ textAlign: 'right', fontSize: 12.5, lineHeight: 1.45, color: T.text2, maxWidth: 260, margin: 0 }}>
          Need help? Text <a href={HELP.phoneHref} style={{ color: T.accentInk, fontWeight: 700 }}>{HELP.phone}</a>
        </p>
      </div>
    </header>
  )
}

export function Footer() {
  return (
    <footer style={{ borderTop: `1px solid ${T.line}`, background: T.surface, padding: '46px 22px 100px' }}>
      <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/the5th-logo-purple.png" alt="The5th Global Consulting logo" width={140} height={34} style={{ height: 34, width: 'auto', opacity: 0.9, marginBottom: 20 }} />
        <div style={{ display: 'flex', gap: 22, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 22 }}>
          {LEGAL.links.map((l) => <a key={l.label} href={l.href} style={{ color: T.text2, fontSize: 13, textDecoration: 'none', minHeight: 44, display: 'inline-flex', alignItems: 'center' }}>{l.label}</a>)}
        </div>
        <p style={{ color: T.text3, fontSize: 12, lineHeight: 1.7, maxWidth: 720, margin: '0 auto 14px' }}>{LEGAL.earnings}</p>
        <p style={{ color: T.text3, fontSize: 12, lineHeight: 1.7, maxWidth: 720, margin: '0 auto 18px' }}>{LEGAL.meta}</p>
        <p style={{ color: T.text2, fontSize: 13, lineHeight: 1.75, maxWidth: 880, margin: '0 auto' }}>{LEGAL.copyright}</p>
      </div>
    </footer>
  )
}

/* ── Progress bar ──────────────────────────────────────────────────────── */
export function Progress({ value }: { value: number }) {
  return (
    <div style={{ height: 4, background: T.line, borderRadius: 999, overflow: 'hidden' }}>
      <div style={{ height: '100%', width: `${Math.max(4, Math.min(100, value * 100))}%`, background: T.accent, borderRadius: 999, transition: 'width .5s cubic-bezier(.2,.7,.2,1)' }} />
    </div>
  )
}

/* ── Quiz state shared between hero Q1 and the full #quiz section, so
   tapping an option in the hero continues the SAME quiz in place rather than
   restarting it (brief P1 item 8: "Every CTA opens or scrolls to the
   in-place quiz"). ─────────────────────────────────────────────────────── */
type QuizState = {
  index: number
  answers: Record<string, string>
  contact: { name: string; email: string; phone: string; smsConsent: boolean }
}
type QuizCtx = {
  state: QuizState
  answerSingle: (stepId: string, value: string) => void
  submitContact: (c: { name: string; email: string; phone: string; smsConsent: boolean }) => Promise<void>
  submitFinal: (value: string) => Promise<void>
  jumpToQuiz: () => void
  saving: boolean
  error: string
}
const QuizContext = React.createContext<QuizCtx | null>(null)

export function QuizProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const utm = useUtm()
  const { fbp, fbc } = useFbpFbc()
  const [state, setState] = useState<QuizState>({ index: 0, answers: {}, contact: { name: '', email: '', phone: '', smsConsent: false } })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const visitorId = useMemo(() => getVisitorId(), [])
  const startedRef = useRef(false)

  const saveStep = useCallback((stepId: string, answer: unknown, email?: string) => {
    fetch('/api/roadmap-session/quiz-progress', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ visitorId, stepId, answer, email: email || loadRsEmail() || undefined, utm, fbp, fbc }),
    }).catch(() => {})
  }, [visitorId, utm, fbp, fbc])

  const answerSingle = useCallback((stepId: string, value: string) => {
    if (!startedRef.current) { startedRef.current = true; track('QuizStart') }
    setState((s) => {
      const answers = { ...s.answers, [stepId]: value }
      const idx = QUIZ.findIndex((q) => q.id === stepId)
      return { ...s, answers, index: Math.max(s.index, idx + 1) }
    })
    saveStep(stepId, value)
  }, [saveStep])

  const submitContact = useCallback(async (c: { name: string; email: string; phone: string; smsConsent: boolean }) => {
    setSaving(true); setError('')
    try {
      const eventId = `rs-lead-${visitorId}-${Date.now()}`
      const r = await fetch('/api/roadmap-session/contact', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ visitorId, name: c.name, email: c.email, phone: c.phone, smsConsent: c.smsConsent, quizSoFar: state.answers, utm, fbp, fbc, eventId, pageUrl: window.location.href }),
      })
      const j = await r.json()
      if (!r.ok) { setError(j?.error || 'Could not save. Please try again.'); return }
      saveRsEmail(c.email); saveRsName(c.name)
      track('Lead', { eventId, value: 0 })
      setState((s) => ({ ...s, contact: c, index: Math.max(s.index, QUIZ.findIndex((q) => q.id === 'contact') + 1) }))
    } catch {
      setError('Something went wrong. Please try again.')
    } finally { setSaving(false) }
  }, [visitorId, state.answers, utm, fbp, fbc])

  const submitFinal = useCallback(async (value: string) => {
    setSaving(true); setError('')
    try {
      const eventId = `rs-app-${visitorId}-${Date.now()}`
      const email = state.contact.email || loadRsEmail()
      const r = await fetch('/api/roadmap-session/verdict', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, answer: value, eventId, pageUrl: window.location.href }),
      })
      const j = await r.json()
      if (!r.ok) { setError('Could not save. Please try again.'); return }
      if (j.verdict === 'qualified') {
        track('SubmitApplication', { eventId })
        router.push(`/roadmap-session/schedule?name=${encodeURIComponent(state.contact.name)}&email=${encodeURIComponent(email)}`)
      } else {
        router.push('/roadmap-session/not-a-fit')
      }
    } catch {
      setError('Something went wrong. Please try again.')
    } finally { setSaving(false) }
  }, [visitorId, state.contact, router])

  const jumpToQuiz = useCallback(() => {
    track('cta_click', { where: 'scroll_to_quiz' })
    document.getElementById('quiz')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [])

  return <QuizContext.Provider value={{ state, answerSingle, submitContact, submitFinal, jumpToQuiz, saving, error }}>{children}</QuizContext.Provider>
}
export function useQuiz(): QuizCtx {
  const ctx = React.useContext(QuizContext)
  if (!ctx) throw new Error('useQuiz must be used within QuizProvider')
  return ctx
}

/* ── Single-choice option grid (used by both the hero Q1 and the full quiz). */
export function OptionGrid({ step, large }: { step: Extract<Step, { type: 'single' }>; large?: boolean }) {
  const { state, answerSingle } = useQuiz()
  const selected = state.answers[step.id]
  return (
    <div style={{ display: 'grid', gap: 10 }}>
      {step.options.map((opt) => {
        const isSel = selected === opt.value
        return (
          <button key={opt.value} className="rs-focus"
            onClick={() => answerSingle(step.id, opt.value)}
            style={{
              display: 'flex', alignItems: 'center', gap: 14, textAlign: 'left', width: '100%',
              minHeight: 48, padding: large ? '18px 20px' : '15px 18px', borderRadius: 14, cursor: 'pointer',
              background: isSel ? T.accentSoft : '#fff', border: `1.5px solid ${isSel ? T.accent : T.lineStrong}`,
              color: T.text, fontSize: large ? 17 : 15.5, fontWeight: large ? 700 : 500,
            }}>
            <span style={{ width: 24, height: 24, flexShrink: 0, borderRadius: '50%', border: `1.5px solid ${isSel ? T.accent : T.lineStrong}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.accentInk, fontSize: 13, fontWeight: 700 }}>{isSel ? '✓' : ''}</span>
            <span>{opt.label}</span>
          </button>
        )
      })}
    </div>
  )
}

/* ── The full 5-step quiz, rendered once in-place in the #quiz section. ──
   Step index comes from QuizState, driven both by the hero Q1 and by
   answering steps here, so there's exactly one quiz, not two. */
export function QuizSection() {
  const { state } = useQuiz()
  const step = QUIZ[state.index]
  const total = QUIZ.length

  return (
    <div style={{ maxWidth: 640, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24 }}>
        <div style={{ flex: 1 }}><Progress value={Math.min(state.index, total - 1) / (total - 1)} /></div>
        <span style={{ color: T.text3, fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap' }}>{Math.min(state.index + 1, total)} / {total}</span>
      </div>
      {!step ? (
        <ThankYouForQuizzing />
      ) : step.type === 'contact' ? (
        <ContactStep step={step} />
      ) : step.id === 'readiness' ? (
        <FinalStep step={step} />
      ) : (
        <div key={state.index} style={{ animation: 'rs-fade .32s cubic-bezier(.2,.7,.2,1)' }}>
          <h2 className="rs-serif" style={{ fontSize: 'clamp(22px,3.4vw,30px)', margin: '0 0 18px' }}>{step.prompt}</h2>
          <OptionGrid step={step} />
        </div>
      )}
    </div>
  )
}

function ThankYouForQuizzing() {
  return <p style={{ textAlign: 'center', color: T.text2, fontSize: 15 }}>Thanks — give us a moment while we save your answers.</p>
}

function ContactStep({ step }: { step: Extract<Step, { type: 'contact' }> }) {
  const { submitContact, saving, error } = useQuiz()
  const [name, setName] = useState(loadRsName())
  const [email, setEmail] = useState(loadRsEmail())
  const [phone, setPhone] = useState('')
  const [smsConsent, setSmsConsent] = useState(false)
  const valid = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) && name.trim().length > 1

  return (
    <form onSubmit={(e) => { e.preventDefault(); if (valid && !saving) submitContact({ name, email, phone, smsConsent }) }} style={{ animation: 'rs-fade .32s cubic-bezier(.2,.7,.2,1)' }}>
      <h2 className="rs-serif" style={{ fontSize: 'clamp(22px,3.4vw,30px)', margin: '0 0 8px' }}>{step.prompt}</h2>
      {step.helper && <p style={{ color: T.text2, fontSize: 14.5, margin: '0 0 20px' }}>{step.helper}</p>}
      <div style={{ display: 'grid', gap: 12 }}>
        <label style={{ display: 'grid', gap: 6 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: T.text2 }}>Name</span>
          <input className="rs-focus" required value={name} onChange={(e) => setName(e.target.value)} style={inputStyle} autoComplete="name" />
        </label>
        <label style={{ display: 'grid', gap: 6 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: T.text2 }}>Email</span>
          <input className="rs-focus" required type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle} autoComplete="email" />
        </label>
        <label style={{ display: 'grid', gap: 6 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: T.text2 }}>Mobile (optional)</span>
          <input className="rs-focus" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} style={inputStyle} autoComplete="tel" />
        </label>
        <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, minHeight: 44 }}>
          <input type="checkbox" checked={smsConsent} onChange={(e) => setSmsConsent(e.target.checked)} style={{ width: 20, height: 20, marginTop: 2, flexShrink: 0 }} />
          <span style={{ fontSize: 13, color: T.text2, lineHeight: 1.5 }}>Text me a reminder before my call. Standard messaging rates may apply. Reply STOP anytime to opt out.</span>
        </label>
        {error && <p style={{ color: '#c0392b', fontSize: 13.5, margin: 0 }}>{error}</p>}
        <Btn type="submit" disabled={!valid || saving}>{saving ? 'Saving…' : 'Continue →'}</Btn>
      </div>
    </form>
  )
}

function FinalStep({ step }: { step: Extract<Step, { type: 'single' }> }) {
  const { submitFinal, saving, error } = useQuiz()
  return (
    <div style={{ animation: 'rs-fade .32s cubic-bezier(.2,.7,.2,1)' }}>
      <h2 className="rs-serif" style={{ fontSize: 'clamp(22px,3.4vw,30px)', margin: '0 0 18px' }}>{step.prompt}</h2>
      <div style={{ display: 'grid', gap: 10 }}>
        {step.options.map((opt) => (
          <button key={opt.value} className="rs-focus" disabled={saving}
            onClick={() => submitFinal(opt.value)}
            style={{ minHeight: 48, padding: '16px 18px', borderRadius: 14, cursor: saving ? 'wait' : 'pointer', background: '#fff', border: `1.5px solid ${T.lineStrong}`, color: T.text, fontSize: 16, fontWeight: 600, textAlign: 'left' }}>
            {opt.label}
          </button>
        ))}
      </div>
      {error && <p style={{ color: '#c0392b', fontSize: 13.5, marginTop: 10 }}>{error}</p>}
      {saving && <p style={{ color: T.text3, fontSize: 13, marginTop: 10 }}>Saving your answer…</p>}
    </div>
  )
}

const inputStyle: React.CSSProperties = { width: '100%', background: '#fff', border: `1.5px solid ${T.lineStrong}`, borderRadius: 12, color: T.text, fontSize: 16, padding: '14px 15px', fontFamily: T.sans, minHeight: 48 }

export { QUIZ_INTRO }
