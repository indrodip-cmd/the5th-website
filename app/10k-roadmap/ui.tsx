'use client'
/* Shared premium dark UI kit for the $10K Roadmap Audit funnel.
   One source of truth for the aesthetic (fonts, tokens, buttons, reveals) and
   the one-question-at-a-time flow engine, so every step feels like one
   continuous, expensive experience. */
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { T, type Q } from './config'

/* ── Global styles / fonts (scoped to the funnel routes) ───────────────────*/
export function Fonts() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;0,700;1,500;1,600&display=swap');
      *{box-sizing:border-box}
      html,body{margin:0;padding:0;background:${T.bg};color:${T.text};font-family:${T.sans};-webkit-font-smoothing:antialiased}
      ::selection{background:${T.accentSoft};color:${T.text}}
      a{color:inherit}
      .rm-serif{font-family:${T.serif};font-weight:600;letter-spacing:-.005em;line-height:1.08}
      .rm-eyebrow{font-size:12px;font-weight:700;letter-spacing:.2em;text-transform:uppercase;color:${T.accentInk}}
      .rm-mark{color:${T.accentInk}}
      .rm-reveal{opacity:0;transform:translateY(16px);transition:opacity .7s cubic-bezier(.2,.7,.2,1),transform .7s cubic-bezier(.2,.7,.2,1)}
      .rm-reveal.in{opacity:1;transform:none}
      @keyframes rm-fade{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
      @keyframes rm-spin{to{transform:rotate(360deg)}}
      @keyframes rm-draw{to{stroke-dashoffset:0}}
      @media (prefers-reduced-motion: reduce){
        .rm-reveal{opacity:1!important;transform:none!important;transition:none!important}
        *{animation-duration:.001ms!important}
      }
      button{font-family:inherit}
      .rm-focus:focus-visible{outline:2px solid ${T.accent};outline-offset:3px;border-radius:10px}
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

/* Shared applicant answers (qualification) carried client-side to /reserve. */
export function saveQualAnswers(a: Record<string, unknown>) { try { sessionStorage.setItem('audit_qual', JSON.stringify(a)) } catch { /* noop */ } }
export function loadQualAnswers(): Record<string, unknown> { try { return JSON.parse(sessionStorage.getItem('audit_qual') || '{}') } catch { return {} } }

/* ── Scroll reveal ─────────────────────────────────────────────────────────*/
export function Reveal({ children, delay = 0, style, id }: { children: React.ReactNode; delay?: number; style?: React.CSSProperties; id?: string }) {
  const ref = useRef<HTMLDivElement | null>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { el.classList.add('in'); io.disconnect() } }), { threshold: 0.14 })
    io.observe(el)
    return () => io.disconnect()
  }, [])
  return <div id={id} ref={ref} className="rm-reveal" style={{ transitionDelay: `${delay}ms`, ...style }}>{children}</div>
}

/* ── Buttons ───────────────────────────────────────────────────────────────*/
export function Btn({ children, onClick, href, variant = 'primary', full, type = 'button', disabled, style }: {
  children: React.ReactNode; onClick?: () => void; href?: string; variant?: 'primary' | 'ghost'; full?: boolean; type?: 'button' | 'submit'; disabled?: boolean; style?: React.CSSProperties
}) {
  const base: React.CSSProperties = {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 10,
    fontFamily: T.sans, fontWeight: 700, fontSize: 16, letterSpacing: '.01em',
    padding: '17px 34px', borderRadius: 999, cursor: disabled ? 'not-allowed' : 'pointer',
    border: '1px solid transparent', textDecoration: 'none', width: full ? '100%' : undefined,
    transition: 'transform .18s ease, filter .18s ease, background .2s ease, border-color .2s ease',
    opacity: disabled ? 0.5 : 1, ...style,
  }
  const skin: React.CSSProperties = variant === 'primary'
    ? { background: T.accent, color: '#fff', boxShadow: '0 14px 34px -14px rgba(94,46,134,.6)' }
    : { background: '#fff', color: T.text, borderColor: T.lineStrong }
  const props = {
    className: 'rm-focus rm-btn', style: { ...base, ...skin },
    onMouseEnter: (e: React.MouseEvent<HTMLElement>) => { if (!disabled) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.filter = 'brightness(1.05)' } },
    onMouseLeave: (e: React.MouseEvent<HTMLElement>) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.filter = 'none' },
  }
  if (href) return <a href={href} onClick={onClick} {...props}>{children}</a>
  return <button type={type} onClick={onClick} disabled={disabled} {...props}>{children}</button>
}

/* ── Minimal funnel header + footer ────────────────────────────────────────*/
export function Header({ cta }: { cta?: React.ReactNode }) {
  const [solid, setSolid] = useState(false)
  useEffect(() => { const on = () => setSolid(window.scrollY > 40); on(); window.addEventListener('scroll', on, { passive: true }); return () => window.removeEventListener('scroll', on) }, [])
  return (
    <header style={{ position: 'sticky', top: 0, zIndex: 50, transition: 'background .3s, border-color .3s, box-shadow .3s', background: solid ? 'rgba(255,255,255,.85)' : 'transparent', backdropFilter: solid ? 'saturate(140%) blur(12px)' : 'none', borderBottom: `1px solid ${solid ? T.line : 'transparent'}`, boxShadow: solid ? '0 6px 24px -18px rgba(46,26,53,.4)' : 'none' }}>
      <div style={{ maxWidth: 1160, margin: '0 auto', padding: '15px 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <a href="/10k-roadmap" aria-label="The5th" style={{ display: 'flex', alignItems: 'center' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/the5th-logo-purple.png" alt="The5th Consulting" style={{ height: 28, width: 'auto' }} />
        </a>
        {cta}
      </div>
    </header>
  )
}

export function Footer({ legal }: { legal: { earnings: string; meta: string; links: { label: string; href: string }[] } }) {
  return (
    <footer style={{ borderTop: `1px solid ${T.line}`, background: T.surface, padding: '46px 22px 60px' }}>
      <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/the5th-logo-purple.png" alt="The5th Consulting" style={{ height: 24, opacity: 0.85, marginBottom: 20 }} />
        <div style={{ display: 'flex', gap: 22, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 22 }}>
          {legal.links.map((l) => <a key={l.label} href={l.href} style={{ color: T.text2, fontSize: 13, textDecoration: 'none' }}>{l.label}</a>)}
        </div>
        <p style={{ color: T.text3, fontSize: 11.5, lineHeight: 1.7, maxWidth: 720, margin: '0 auto 14px' }}>{legal.earnings}</p>
        <p style={{ color: T.text3, fontSize: 11.5, lineHeight: 1.7, maxWidth: 720, margin: '0 auto 20px' }}>{legal.meta}</p>
        <p style={{ color: T.text3, fontSize: 11.5 }}>© {new Date().getFullYear()} The5th Consulting</p>
      </div>
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
          q.long
            ? <textarea className="rm-focus" placeholder={q.placeholder || 'Type your answer…'} value={(answers[q.id] as string) || ''} onChange={(e) => setAnswers((a) => ({ ...a, [q.id]: e.target.value }))} rows={4}
                style={{ width: '100%', background: T.surface, border: `1px solid ${T.line}`, borderRadius: 14, color: T.text, fontSize: 16, padding: '15px 16px', resize: 'vertical', fontFamily: T.sans, lineHeight: 1.6 }} autoFocus />
            : <input className="rm-focus" placeholder={q.placeholder || 'Type your answer…'} value={(answers[q.id] as string) || ''} onChange={(e) => setAnswers((a) => ({ ...a, [q.id]: e.target.value }))}
                style={{ width: '100%', background: T.surface, border: `1px solid ${T.line}`, borderRadius: 14, color: T.text, fontSize: 16, padding: '15px 16px', fontFamily: T.sans }} autoFocus />
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
                background: sel ? T.accent : '#fff', color: sel ? '#fff' : T.text, border: `1px solid ${sel ? T.accent : T.line}`, transition: 'all .12s' }}>
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
