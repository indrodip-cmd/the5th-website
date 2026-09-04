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
      className="io-card"
      style={{
        borderColor: selected ? C.purple : C.line,
        background: selected ? 'rgba(85,40,121,0.05)' : C.white,
        boxShadow: selected ? `0 0 0 1px ${C.purple}` : 'none',
      }}
    >
      <span
        aria-hidden
        className="io-mark"
        style={{
          borderRadius: multi ? 6 : 999,
          borderColor: selected ? C.purple : C.line,
          background: selected ? C.purple : 'transparent',
        }}
      >
        {selected && (
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M2.5 6.2 5 8.6l4.5-5" stroke="#fff" strokeWidth="1.8"
              strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </span>
      <span className="io-card-text">
        <span style={{ fontWeight: 500, color: C.ink }}>{label}</span>
        {hint && <span style={{ display: 'block', fontSize: 13, color: C.inkSoft, marginTop: 2 }}>{hint}</span>}
      </span>
    </button>
  )
}

/* Text / email / tel input with a floating label + inline error. */
export function Field({
  id, label, type = 'text', value, onChange, error, placeholder, autoComplete, inputMode, prefix,
}: {
  id: string; label: string; type?: string; value: string
  onChange: (v: string) => void; error?: string | null; placeholder?: string
  autoComplete?: string; inputMode?: 'text' | 'email' | 'tel' | 'numeric'; prefix?: string
}) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label htmlFor={id} style={{ display: 'block', fontSize: 13, fontWeight: 600, color: C.ink, marginBottom: 6, fontFamily: SANS }}>
        {label}
      </label>
      <div style={{ display: 'flex', alignItems: 'stretch' }}>
        {prefix && (
          <span style={{
            display: 'inline-flex', alignItems: 'center', padding: '0 12px',
            border: `1px solid ${error ? '#C0392B' : C.line}`, borderRight: 'none',
            borderRadius: '10px 0 0 10px', background: C.creamAlt, color: C.inkSoft,
            fontSize: 15, fontFamily: SANS, whiteSpace: 'nowrap',
          }}>{prefix}</span>
        )}
        <input
          id={id} type={type} value={value} placeholder={placeholder}
          autoComplete={autoComplete} inputMode={inputMode}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={!!error} aria-describedby={error ? `${id}-err` : undefined}
          style={{
            flex: 1, width: '100%', padding: '13px 14px', fontSize: 16,
            fontFamily: SANS, color: C.ink, background: C.white,
            border: `1px solid ${error ? '#C0392B' : C.line}`,
            borderRadius: prefix ? '0 10px 10px 0' : 10, outline: 'none',
          }}
          onFocus={(e) => { e.target.style.borderColor = error ? '#C0392B' : C.purple }}
          onBlur={(e) => { e.target.style.borderColor = error ? '#C0392B' : C.line }}
        />
      </div>
      {error && <p id={`${id}-err`} role="alert" style={{ color: '#C0392B', fontSize: 13, marginTop: 6, fontFamily: SANS }}>{error}</p>}
    </div>
  )
}

/* Primary / ghost button. */
export function Btn({
  children, onClick, variant = 'primary', disabled, type = 'button', full,
}: {
  children: React.ReactNode; onClick?: () => void
  variant?: 'primary' | 'ghost'; disabled?: boolean; type?: 'button' | 'submit'; full?: boolean
}) {
  const primary = variant === 'primary'
  return (
    <button
      type={type} onClick={onClick} disabled={disabled}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        padding: '14px 26px', fontSize: 15, fontWeight: 600, fontFamily: SANS,
        borderRadius: 999, cursor: disabled ? 'not-allowed' : 'pointer',
        width: full ? '100%' : 'auto',
        border: primary ? 'none' : `1px solid ${C.line}`,
        background: primary ? (disabled ? '#B7A9C6' : C.purple) : 'transparent',
        color: primary ? '#fff' : C.inkSoft,
        opacity: disabled && !primary ? 0.5 : 1,
        transition: 'transform .12s ease, background .2s ease',
      }}
      onMouseDown={(e) => { if (!disabled) e.currentTarget.style.transform = 'scale(0.98)' }}
      onMouseUp={(e) => { e.currentTarget.style.transform = 'scale(1)' }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)' }}
    >
      {children}
    </button>
  )
}

/* Step counter + subtle progress bar. */
export function ProgressIndicator({ current, total }: { current: number; total: number }) {
  const pct = Math.round((current / total) * 100)
  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <span style={{ fontSize: 12, letterSpacing: 2, color: C.inkSoft, fontFamily: SANS, fontWeight: 600 }}>
          {String(current).padStart(2, '0')} / {String(total).padStart(2, '0')}
        </span>
      </div>
      <div style={{ height: 3, background: C.line, borderRadius: 999, overflow: 'hidden' }}>
        <div style={{
          height: '100%', width: `${pct}%`, background: C.purple,
          borderRadius: 999, transition: 'width .4s cubic-bezier(.4,0,.2,1)',
        }} />
      </div>
    </div>
  )
}

/* Small helper: run a callback on Enter for keyboard advance. */
export function useEnter(cb: () => void, enabled: boolean) {
  return useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && enabled) { e.preventDefault(); cb() }
  }, [cb, enabled])
}
