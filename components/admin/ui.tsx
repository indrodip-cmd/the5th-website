'use client'
/* Shared admin UI primitives — reused by every Workspace module so nothing
   is duplicated. Intentionally lightweight (no external UI deps). */
import React, { useCallback, useEffect, useState } from 'react'
import { T } from './theme'

// ── Data fetching hook (admin routes are same-origin, cookie-authed) ──
export function useAdminFetch<T = unknown>(url: string | null, deps: unknown[] = []) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(!!url)
  const [error, setError] = useState<string | null>(null)
  const reload = useCallback(() => {
    if (!url) return
    setLoading(true)
    fetch(url)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((d) => { setData(d as T); setError(null) })
      .catch((e) => setError(String(e)))
      .finally(() => setLoading(false))
  }, [url]) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { reload() }, [url, ...deps]) // eslint-disable-line react-hooks/exhaustive-deps
  return { data, loading, error, reload, setData }
}

export async function adminSend(url: string, method: string, body?: unknown) {
  const res = await fetch(url, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error((json as { error?: string })?.error || `Request failed (${res.status})`)
  return json
}

// ── Buttons ──
export function Button({ variant = 'primary', children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'ghost' }) {
  return <button {...props} className={`a-btn ${variant === 'primary' ? 'a-btn-primary' : 'a-btn-ghost'} ${props.className || ''}`}>{children}</button>
}

// ── Card ──
export function Card({ children, style, pad = 22 }: { children: React.ReactNode; style?: React.CSSProperties; pad?: number }) {
  return <div className="a-card" style={{ padding: pad, ...style }}>{children}</div>
}

// ── Field (label + input) ──
export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label style={{ display: 'block', marginBottom: 14 }}><span className="a-label">{label}</span>{children}</label>
}
export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`a-input ${props.className || ''}`} />
}
export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`a-input ${props.className || ''}`} style={{ resize: 'vertical', minHeight: 84, ...props.style }} />
}
export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={`a-input ${props.className || ''}`} />
}

// ── Tag pill ──
export function TagPill({ label, color = T.green, onRemove }: { label: string; color?: string; onRemove?: () => void }) {
  return (
    <span className="a-pill" style={{ background: color + '1a', color }}>
      {label}
      {onRemove && <button onClick={onRemove} style={{ border: 'none', background: 'none', color, cursor: 'pointer', fontWeight: 800, fontSize: 13, lineHeight: 1 }}>×</button>}
    </span>
  )
}

// ── Avatar ──
export function Avatar({ name, email, size = 38 }: { name?: string | null; email?: string | null; size?: number }) {
  const s = (name || email || '?').trim()
  const initials = s.split(/\s+/).slice(0, 2).map((w) => w[0]).join('').toUpperCase() || '?'
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', background: `linear-gradient(135deg,${T.green},${T.green2})`, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: size * 0.38, flexShrink: 0 }}>
      {initials}
    </div>
  )
}

// ── EmptyState ──
export function EmptyState({ title, hint, icon = '✦', action }: { title: string; hint?: string; icon?: string; action?: React.ReactNode }) {
  return (
    <div style={{ padding: '48px 24px', textAlign: 'center', color: T.muted, animation: 'riseIn .3s cubic-bezier(.22,1,.36,1)' }}>
      <div style={{ width: 52, height: 52, borderRadius: 16, margin: '0 auto 14px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, color: T.green, background: 'linear-gradient(160deg,#eef7f1,#f6faf7)', border: `1px solid ${T.border}` }}>{icon}</div>
      <div style={{ fontSize: 15.5, fontWeight: 700, color: T.ink }}>{title}</div>
      {hint && <div style={{ fontSize: 13, marginTop: 6, maxWidth: 320, marginLeft: 'auto', marginRight: 'auto', lineHeight: 1.5 }}>{hint}</div>}
      {action && <div style={{ marginTop: 16 }}>{action}</div>}
    </div>
  )
}

/* Premium, non-technical error state with retry — nothing should feel broken. */
export function ErrorState({ message, onRetry }: { message?: string; onRetry?: () => void }) {
  return (
    <div style={{ padding: '44px 24px', textAlign: 'center', color: T.muted }}>
      <div style={{ width: 52, height: 52, borderRadius: 16, margin: '0 auto 14px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626' }}>!</div>
      <div style={{ fontSize: 15, fontWeight: 700, color: T.ink }}>Something went wrong</div>
      <div style={{ fontSize: 13, marginTop: 6 }}>{message || 'We couldn’t load this right now.'}</div>
      {onRetry && <button className="a-btn a-btn-ghost" style={{ marginTop: 14 }} onClick={onRetry}>Try again</button>}
    </div>
  )
}

// ── Drawer (right slide-over) ──
export function Drawer({ open, onClose, children, width }: { open: boolean; onClose: () => void; children: React.ReactNode; width?: number }) {
  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    if (open) window.addEventListener('keydown', onEsc)
    return () => window.removeEventListener('keydown', onEsc)
  }, [open, onClose])
  if (!open) return null
  return (
    <>
      <div className="a-overlay" onClick={onClose} />
      <div className="a-drawer detail-panel" style={width ? { width } : undefined}>{children}</div>
    </>
  )
}

// ── Modal ──
export function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title?: string; children: React.ReactNode }) {
  if (!open) return null
  return (
    <>
      <div className="a-overlay" onClick={onClose} />
      <div className="a-modal">
        {title && <div style={{ padding: '18px 22px', borderBottom: `1px solid ${T.border}`, fontWeight: 700, fontSize: 16, color: T.ink }}>{title}</div>}
        <div style={{ padding: 22 }}>{children}</div>
      </div>
    </>
  )
}

// ── Page header ──
export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, marginBottom: 22, flexWrap: 'wrap' }}>
      <div>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: T.ink, letterSpacing: '-.01em' }}>{title}</h1>
        {subtitle && <p style={{ fontSize: 14, color: T.sub, marginTop: 4 }}>{subtitle}</p>}
      </div>
      {actions && <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>{actions}</div>}
    </div>
  )
}

// ── Activity timeline ──
export interface Activity { id: string; type: string; title?: string | null; detail?: string | null; created_at: string; actor?: string | null }
const ACT_ICON: Record<string, string> = {
  lead: '✦', chat: '💬', call_booked: '📅', email: '✉️', note: '📝', deal: '💰', task: '✓',
}
export function ActivityTimeline({ activities }: { activities: Activity[] }) {
  if (!activities.length) return <EmptyState title="No activity yet" />
  const groups = new Map<string, Activity[]>()
  for (const a of activities) {
    const day = new Date(a.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    if (!groups.has(day)) groups.set(day, [])
    groups.get(day)!.push(a)
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {[...groups].map(([day, items]) => (
        <div key={day}>
          <div style={{ fontSize: 11, fontWeight: 700, color: T.muted, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 10 }}>{day}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {items.map((a) => (
              <div key={a.id} style={{ display: 'flex', gap: 12, padding: '9px 0', borderBottom: '1px solid #f4f5f4' }}>
                <div style={{ width: 26, height: 26, borderRadius: 8, background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, flexShrink: 0 }}>{ACT_ICON[a.type] || '•'}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, color: T.text, fontWeight: 500 }}>{a.title || a.type}</div>
                  {a.detail && <div style={{ fontSize: 13, color: T.sub, marginTop: 2 }}>{a.detail}</div>}
                </div>
                <div style={{ fontSize: 12, color: T.muted, whiteSpace: 'nowrap' }}>{new Date(a.created_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export function fmtDate(iso: string | null | undefined): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

/* Journey strip — a horizontal milestone timeline derived from key activities. */
const JOURNEY: Array<{ match: (t: string) => boolean; label: string; icon: string }> = [
  { match: (t) => t === 'lead', label: 'Lead', icon: '✦' },
  { match: (t) => t === 'chat', label: 'Engaged', icon: '💬' },
  { match: (t) => t === 'call_booked', label: 'Booked', icon: '📅' },
  { match: (t) => t === 'meeting_completed', label: 'Met', icon: '✓' },
  { match: (t) => t === 'deal', label: 'Opportunity', icon: '💰' },
]
export function JourneyStrip({ activities }: { activities: Activity[] }) {
  const first = new Map<string, string>()
  // activities come newest-first; keep the earliest per type
  for (const a of [...activities].reverse()) if (!first.has(a.type)) first.set(a.type, a.created_at)
  const steps = JOURNEY.filter((s) => [...first.keys()].some((t) => s.match(t)))
  if (steps.length === 0) return null
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap', padding: '4px 0 16px' }}>
      {steps.map((s, i) => {
        const when = [...first.entries()].find(([t]) => s.match(t))?.[1]
        return (
          <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '5px 11px', borderRadius: 20, background: '#f0fdf4', border: '1px solid #dcfce7' }}>
              <span>{s.icon}</span>
              <div><div style={{ fontSize: 12.5, fontWeight: 600, color: T.green }}>{s.label}</div><div style={{ fontSize: 10.5, color: T.muted }}>{fmtDate(when)}</div></div>
            </div>
            {i < steps.length - 1 && <span style={{ color: T.muted }}>→</span>}
          </div>
        )
      })}
    </div>
  )
}

export function money(n: number, currency = 'USD'): string {
  try { return new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(n || 0) }
  catch { return `$${Math.round(n || 0).toLocaleString()}` }
}

// Client-safe lead-score band (mirrors lib/scoring, no server imports).
export function leadBand(score: number): 'Cold' | 'Warm' | 'Hot' | 'Very Hot' {
  if (score >= 75) return 'Very Hot'
  if (score >= 50) return 'Hot'
  if (score >= 25) return 'Warm'
  return 'Cold'
}
export function bandColor(b: string): string {
  return b === 'Very Hot' ? '#dc2626' : b === 'Hot' ? '#ea580c' : b === 'Warm' ? '#d97706' : '#6b7280'
}

// re-export token bag for convenience
export { T }
