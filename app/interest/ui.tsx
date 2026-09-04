'use client'
/* Presentational primitives + hooks for the Interest Registration page.
   Self-contained (no shared design-system dependency) and mobile-first. */
import { useEffect, useState, useCallback } from 'react'
import { C } from './config'

const FONT = "'Gelica', ui-serif, Georgia, 'Times New Roman', serif"
const SANS = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
export { FONT, SANS }

const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'] as const

/* Capture UTM params (URL first, then anything persisted this session) plus
   the referrer + landing page. Persisted so a later step still has them. */
export function useAttribution() {
  const [attr] = useState(() => {
    if (typeof window === 'undefined') {
      return { utm: {} as Record<string, string>, landing_page: '', referrer: '' }
    }
    let utm: Record<string, string> = {}
    try { utm = JSON.parse(sessionStorage.getItem('interest_utm') || '{}') } catch { /* noop */ }
    try {
      const p = new URLSearchParams(window.location.search)
      for (const k of UTM_KEYS) { const v = p.get(k); if (v) utm[k] = v.slice(0, 160) }
    } catch { /* noop */ }
    const referrer = document.referrer || ''
    const landing_page = window.location.pathname + window.location.search
    return { utm, landing_page, referrer }
  })
  useEffect(() => {
    try { sessionStorage.setItem('interest_utm', JSON.stringify(attr.utm)) } catch { /* noop */ }
  }, [attr.utm])
  return attr
}

/* Read a stable first-party visitor id if the site set one (cookie a5_vid),
   so this lead links to its anonymous journey. Best-effort; lazy-read once on
   the client (only used in the submit payload, so no hydration mismatch). */
export function useVisitorId() {
  const [vid] = useState<string | null>(() => {
    if (typeof document === 'undefined') return null
    try {
      const m = document.cookie.match(/(?:^|;\s*)a5_vid=([^;]+)/)
      return m ? decodeURIComponent(m[1]) : null
    } catch { return null }
  })
  return vid
}

/* Selectable answer card — radio (single) or checkbox (multi) semantics. */
export function OptionCard({
  label, hint, selected, multi, onSelect,
}: {
  label: string; hint?: string; selected: boolean; multi?: boolean; onSelect: () => void
}) {
  return (
    <button
      type="button"
      role={multi ? 'checkbox' : 'radio'}
      aria-checked={selected}
      onClick={onSelect}
      className={`io-card${selected ? ' io-card--on' : ''}`}
    >
      <span
        aria-hidden
        className="io-mark"
        style={{
          borderRadius: multi ? 7 : 999,
          borderColor: selected ? C.gold : C.line,
          background: selected ? C.gold : 'transparent',
        }}
      >
        {selected && (
          <svg width="13" height="13" viewBox="0 0 12 12" fill="none">
            <path d="M2.5 6.2 5 8.6l4.5-5" stroke={C.plumDeep} strokeWidth="2"
              strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </span>
      <span className="io-card-text">
        <span style={{ fontWeight: 600, color: C.ink }}>{label}</span>
        {hint && <span style={{ display: 'block', fontSize: 13, color: C.inkSoft, marginTop: 2 }}>{hint}</span>}
      </span>
    </button>
  )
}

/* Text / email / tel input with a label + inline error. */
export function Field({
  id, label, type = 'text', value, onChange, error, placeholder, autoComplete, inputMode, prefix,
}: {
  id: string; label: string; type?: string; value: string
  onChange: (v: string) => void; error?: string | null; placeholder?: string
  autoComplete?: string; inputMode?: 'text' | 'email' | 'tel' | 'numeric'; prefix?: string
}) {
  return (
    <div style={{ marginBottom: 18 }}>
      <label htmlFor={id} style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: C.ink, marginBottom: 7, fontFamily: SANS, letterSpacing: '0.01em' }}>
        {label}
      </label>
      <div style={{ display: 'flex', alignItems: 'stretch' }}>
        {prefix && (
          <span style={{
            display: 'inline-flex', alignItems: 'center', padding: '0 13px',
            border: `1px solid ${error ? '#C0392B' : C.line}`, borderRight: 'none',
            borderRadius: '12px 0 0 12px', background: C.creamAlt, color: C.inkSoft,
            fontSize: 15, fontFamily: SANS, whiteSpace: 'nowrap', fontWeight: 600,
          }}>{prefix}</span>
        )}
        <input
          id={id} type={type} value={value} placeholder={placeholder}
          autoComplete={autoComplete} inputMode={inputMode}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={!!error} aria-describedby={error ? `${id}-err` : undefined}
          className="io-input"
          style={{
            flex: 1, width: '100%', padding: '15px 15px', fontSize: 16,
            fontFamily: SANS, color: C.ink, background: C.white,
            border: `1px solid ${error ? '#C0392B' : C.line}`,
            borderRadius: prefix ? '0 12px 12px 0' : 12, outline: 'none',
          }}
          onFocus={(e) => { e.target.style.borderColor = error ? '#C0392B' : C.gold; e.target.style.boxShadow = error ? 'none' : `0 0 0 3px rgba(201,168,76,0.18)` }}
          onBlur={(e) => { e.target.style.borderColor = error ? '#C0392B' : C.line; e.target.style.boxShadow = 'none' }}
        />
      </div>
      {error && <p id={`${id}-err`} role="alert" style={{ color: '#C0392B', fontSize: 13, marginTop: 6, fontFamily: SANS }}>{error}</p>}
    </div>
  )
}

/* Primary / ghost button. */
export function Btn({
  children, onClick, variant = 'primary', disabled, type = 'button', full, size = 'md',
}: {
  children: React.ReactNode; onClick?: () => void
  variant?: 'primary' | 'ghost'; disabled?: boolean; type?: 'button' | 'submit'
  full?: boolean; size?: 'md' | 'lg'
}) {
  const primary = variant === 'primary'
  return (
    <button
      type={type} onClick={onClick} disabled={disabled}
      className={primary ? 'io-btn io-btn--primary' : 'io-btn io-btn--ghost'}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        padding: size === 'lg' ? '17px 34px' : '14px 26px',
        fontSize: size === 'lg' ? 16 : 15, fontWeight: 700, fontFamily: SANS,
        borderRadius: 999, cursor: disabled ? 'not-allowed' : 'pointer',
        width: full ? '100%' : 'auto', letterSpacing: '0.01em',
        border: primary ? 'none' : `1px solid ${C.line}`,
        background: primary ? (disabled ? '#C7BCC9' : C.plum) : 'transparent',
        color: primary ? '#fff' : C.inkSoft,
        opacity: disabled && !primary ? 0.55 : 1,
        boxShadow: primary && !disabled ? '0 8px 22px rgba(46,26,53,0.22)' : 'none',
        transition: 'transform .12s ease, box-shadow .2s ease, background .2s ease',
      }}
    >
      {children}
    </button>
  )
}

/* Step counter + gradient progress bar. */
export function ProgressIndicator({ current, total }: { current: number; total: number }) {
  const pct = Math.round((current / total) * 100)
  return (
    <div style={{ marginBottom: 30 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <span style={{ fontSize: 12, letterSpacing: 2.5, color: C.inkSoft, fontFamily: SANS, fontWeight: 700 }}>
          {String(current).padStart(2, '0')} <span style={{ color: C.line }}>/</span> {String(total).padStart(2, '0')}
        </span>
      </div>
      <div style={{ height: 4, background: C.line, borderRadius: 999, overflow: 'hidden' }}>
        <div style={{
          height: '100%', width: `${pct}%`, background: C.grad,
          borderRadius: 999, transition: 'width .45s cubic-bezier(.4,0,.2,1)',
        }} />
      </div>
    </div>
  )
}

/* The5th gradient wordmark. */
export function Wordmark({ size = 22 }: { size?: number }) {
  return (
    <span aria-label="The5th Consulting" style={{
      fontFamily: FONT, fontWeight: 700, fontSize: size, letterSpacing: '-0.01em',
      backgroundImage: C.grad, WebkitBackgroundClip: 'text', backgroundClip: 'text',
      WebkitTextFillColor: 'transparent', color: 'transparent',
      filter: 'drop-shadow(0 0 18px rgba(201,168,76,.28))',
    }}>
      the<em style={{ fontStyle: 'italic', WebkitTextFillColor: C.goldSoft, color: C.goldSoft }}>5</em>th.
    </span>
  )
}

/* Branded aubergine footer with the required legal line. */
export function Footer() {
  const linkStyle: React.CSSProperties = { color: 'rgba(246,226,155,0.82)', textDecoration: 'none', fontFamily: SANS, fontSize: 13.5 }
  return (
    <footer style={{ background: C.plumDeep, color: '#EFE7DA', marginTop: 'auto' }}>
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '44px 24px 36px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20, alignItems: 'center', justifyContent: 'space-between', marginBottom: 26 }}>
          <Wordmark size={26} />
          <nav style={{ display: 'flex', flexWrap: 'wrap', gap: '10px 22px' }}>
            <a href="/about" style={linkStyle}>About</a>
            <a href="/privacy" style={linkStyle}>Privacy</a>
            <a href="/terms" style={linkStyle}>Terms</a>
            <a href="/support" style={linkStyle}>Support</a>
          </nav>
        </div>
        <div style={{ height: 1, background: 'rgba(246,226,155,0.14)', marginBottom: 22 }} />
        <p style={{ fontFamily: SANS, fontSize: 12.5, lineHeight: 1.7, color: 'rgba(239,231,218,0.66)', margin: 0 }}>
          © 2026 The5th Consulting. All rights reserved. Unauthorized copying, reproduction,
          distribution, use, or collection of any content or information from this website is
          strictly prohibited. Any unauthorized use may result in legal action. To the extent
          permitted by law, any dispute arising from or relating to the unauthorized use of this
          website or its content shall be subject to the jurisdiction of the courts located in the
          State of New York.
        </p>
      </div>
    </footer>
  )
}

/* Small helper: run a callback on Enter for keyboard advance. */
export function useEnter(cb: () => void, enabled: boolean) {
  return useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && enabled) { e.preventDefault(); cb() }
  }, [cb, enabled])
}
