'use client'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { C } from './ui'
import type { BarItem, LineSeries, Stat } from './data2026'

const SANS = "'Public Sans', system-ui, -apple-system, sans-serif"
const SERIF = "Georgia, 'Times New Roman', serif"

/* In-view hook: true once the element has entered the viewport. */
function useInView<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  const [seen, setSeen] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (typeof IntersectionObserver === 'undefined') { requestAnimationFrame(() => setSeen(true)); return }
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setSeen(true); io.disconnect() } }, { threshold: 0.25 })
    io.observe(el)
    return () => io.disconnect()
  }, [])
  return [ref, seen] as const
}
const reduced = () => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

/* ── Reading progress bar ─────────────────────────────────────────────────*/
export function ReadingProgress() {
  const [p, setP] = useState(0)
  useEffect(() => {
    const on = () => {
      const h = document.documentElement
      const max = h.scrollHeight - h.clientHeight
      setP(max > 0 ? Math.min(1, Math.max(0, h.scrollTop / max)) : 0)
    }
    on()
    window.addEventListener('scroll', on, { passive: true })
    window.addEventListener('resize', on)
    return () => { window.removeEventListener('scroll', on); window.removeEventListener('resize', on) }
  }, [])
  return (
    <div aria-hidden style={{ position: 'fixed', top: 0, left: 0, right: 0, height: 3, zIndex: 50, background: 'transparent' }}>
      <div style={{ height: '100%', width: `${p * 100}%`, background: `linear-gradient(90deg, ${C.goldDeep}, ${C.gold})`, transition: 'width .08s linear' }} />
    </div>
  )
}

/* ── Contents with active-section highlight ───────────────────────────────*/
export function TocSpy({ toc }: { toc: [string, string][] }) {
  const [active, setActive] = useState(toc[0]?.[0] ?? '')
  useEffect(() => {
    const els = toc.map(([id]) => document.getElementById(id)).filter(Boolean) as HTMLElement[]
    if (!els.length) return
    const on = () => {
      let cur = els[0].id
      for (const el of els) if (el.getBoundingClientRect().top - 140 <= 0) cur = el.id
      setActive(cur)
    }
    on()
    window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [toc])
  return (
    <nav aria-label="Contents" style={{ display: 'grid', gap: 4, borderLeft: `1px solid ${C.border}` }}>
      {toc.map(([id, label]) => {
        const on = id === active
        return (
          <a key={id} href={`#${id}`} aria-current={on ? 'true' : undefined} style={{
            color: on ? C.plumDark : C.inkSoft, fontSize: 13.5, lineHeight: 1.4, textDecoration: 'none', padding: '5px 0 5px 14px',
            marginLeft: -1, borderLeft: `2px solid ${on ? C.gold : 'transparent'}`, fontWeight: on ? 700 : 400, transition: 'color .15s, border-color .15s',
          }}>{label}</a>
        )
      })}
    </nav>
  )
}

/* ── Count-up stat tiles ──────────────────────────────────────────────────*/
function CountUp({ value, decimals = 0, active }: { value: number; decimals?: number; active: boolean }) {
  const [v, setV] = useState(0)
  useEffect(() => {
    if (!active) return
    if (reduced()) return
    let raf = 0
    const t0 = performance.now()
    const dur = 1100
    const tick = (t: number) => {
      const k = Math.min(1, (t - t0) / dur)
      setV(value * (1 - Math.pow(1 - k, 3)))
      if (k < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [active, value])
  const shown = !active ? 0 : reduced() ? value : v
  return <>{shown.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}</>
}
export function StatTiles({ stats }: { stats: Stat[] }) {
  const [ref, seen] = useInView<HTMLDivElement>()
  return (
    <div ref={ref} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 14 }}>
      {stats.map((s) => (
        <div key={s.label} style={{ background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.14)', borderRadius: 14, padding: '18px 18px 16px' }}>
          <div style={{ fontFamily: SERIF, fontSize: 'clamp(30px,4.4vw,40px)', color: C.gold, lineHeight: 1, letterSpacing: '-.02em' }}>
            {s.prefix}<CountUp value={s.value} decimals={s.decimals} active={seen} />{s.suffix}
          </div>
          <div style={{ fontSize: 14, lineHeight: 1.45, color: 'rgba(255,255,255,.88)', marginTop: 10 }}>{s.label}</div>
          <div style={{ fontSize: 11.5, lineHeight: 1.4, color: 'rgba(255,255,255,.5)', marginTop: 8 }}>{s.src}</div>
        </div>
      ))}
    </div>
  )
}

/* ── Interactive horizontal bar chart ─────────────────────────────────────*/
export function BarChart({ title, subtitle, unit, items, max, src }: { title: string; subtitle: string; unit: string; items: BarItem[]; max?: number; src: string }) {
  const [ref, seen] = useInView<HTMLDivElement>()
  const [sorted, setSorted] = useState(false)
  const [sel, setSel] = useState<number | null>(null)
  const top = max ?? Math.max(...items.map((i) => i.value)) * 1.1
  const rows = useMemo(() => (sorted ? [...items].sort((a, b) => b.value - a.value) : items), [items, sorted])
  const fmt = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(2).replace(/0$/, ''))
  return (
    <div ref={ref} style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 16, padding: 'clamp(18px,3vw,26px)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontFamily: SERIF, fontSize: 20, color: C.plumDark, lineHeight: 1.2 }}>{title}</div>
          <div style={{ fontSize: 13.5, color: C.muted, marginTop: 4, lineHeight: 1.5 }}>{subtitle}</div>
        </div>
        {items.length > 2 && (
          <button type="button" onClick={() => setSorted((s) => !s)} aria-pressed={sorted} style={{ fontFamily: SANS, fontSize: 12.5, fontWeight: 700, color: C.plumDark, background: sorted ? 'rgba(201,168,76,.2)' : C.cream, border: `1px solid ${C.border}`, borderRadius: 999, padding: '7px 14px', cursor: 'pointer' }}>
            {sorted ? 'Sorted' : 'Sort by size'}
          </button>
        )}
      </div>
      <div role="list" style={{ marginTop: 18, display: 'grid', gap: 12 }}>
        {rows.map((r, i) => {
          const on = sel === i
          const w = Math.max(2, (r.value / top) * 100)
          return (
            <div role="listitem" key={r.label}>
              <button type="button" onClick={() => setSel(on ? null : i)} onMouseEnter={() => setSel(i)} onMouseLeave={() => setSel(null)} onFocus={() => setSel(i)} onBlur={() => setSel(null)} aria-label={`${r.label}: ${fmt(r.value)}${unit}${r.note ? '. ' + r.note : ''}`}
                style={{ all: 'unset', display: 'block', width: '100%', cursor: 'pointer', boxSizing: 'border-box' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, fontSize: 14, color: C.inkSoft, marginBottom: 6 }}>
                  <span style={{ fontWeight: r.highlight || on ? 700 : 500, color: r.highlight || on ? C.plumDark : C.inkSoft }}>{r.label}</span>
                  <span style={{ fontFamily: SERIF, color: C.plumDark, fontWeight: 700, whiteSpace: 'nowrap' }}>{fmt(r.value)}{unit}</span>
                </div>
                <div style={{ height: 14, background: 'rgba(61,38,69,.07)', borderRadius: 8, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: seen ? `${w}%` : 0, borderRadius: 8, background: r.highlight ? `linear-gradient(90deg, ${C.goldDeep}, ${C.gold})` : `linear-gradient(90deg, ${C.plumDark}, ${C.plum})`, opacity: sel === null || on ? 1 : 0.55, transition: `width .9s cubic-bezier(.2,.8,.2,1) ${i * 90}ms, opacity .18s` }} />
                </div>
                {r.note && <div style={{ fontSize: 12.5, color: C.goldDeep, marginTop: 6, minHeight: 16, opacity: on ? 1 : 0.0, transition: 'opacity .15s' }}>{r.note}</div>}
              </button>
            </div>
          )
        })}
      </div>
      <div style={{ marginTop: 14, fontSize: 12, color: C.muted, lineHeight: 1.5 }}>Source: {src}. Hover or tap a bar for detail.</div>
    </div>
  )
}

/* ── Interactive line chart with series toggles + crosshair tooltip ───────*/
export function LineChart({ title, subtitle, unit, xLabels, series, src }: { title: string; subtitle: string; unit: string; xLabels: number[]; series: LineSeries[]; src: string }) {
  const [ref, seen] = useInView<HTMLDivElement>()
  const [off, setOff] = useState<Record<string, boolean>>({})
  const [hover, setHover] = useState<number | null>(null)
  const W = 560, H = 270, L = 44, R = 20, T = 18, B = 36
  const xs = [...xLabels].sort((a, b) => a - b)
  const x0 = xs[0], x1 = xs[xs.length - 1]
  const all = series.flatMap((s) => s.points.map((p) => p[1]))
  const yMax = Math.ceil((Math.max(...all) * 1.15) / 10) * 10 || 10
  const X = (x: number) => L + ((x - x0) / Math.max(1, x1 - x0)) * (W - L - R)
  const Y = (y: number) => T + (1 - y / yMax) * (H - T - B)
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((k) => Math.round(k * yMax))
  const onMove = (e: React.PointerEvent<SVGSVGElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    const px = ((e.clientX - r.left) / r.width) * W
    let best = 0, bd = Infinity
    xs.forEach((x, i) => { const d = Math.abs(X(x) - px); if (d < bd) { bd = d; best = i } })
    setHover(best)
  }
  const hx = hover === null ? null : xs[hover]
  return (
    <div ref={ref} style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 16, padding: 'clamp(18px,3vw,26px)' }}>
      <div style={{ fontFamily: SERIF, fontSize: 20, color: C.plumDark, lineHeight: 1.2 }}>{title}</div>
      <div style={{ fontSize: 13.5, color: C.muted, marginTop: 4, lineHeight: 1.5 }}>{subtitle}</div>
      {series.length > 1 && (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 14 }}>
          {series.map((s) => (
            <button key={s.name} type="button" aria-pressed={!off[s.name]} onClick={() => setOff((o) => ({ ...o, [s.name]: !o[s.name] }))} style={{ fontFamily: SANS, fontSize: 12.5, fontWeight: 700, color: off[s.name] ? C.muted : C.plumDark, background: off[s.name] ? 'transparent' : C.cream, border: `1px solid ${C.border}`, borderRadius: 999, padding: '6px 12px 6px 10px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 7 }}>
              <span aria-hidden style={{ width: 10, height: 10, borderRadius: 10, background: off[s.name] ? 'transparent' : s.color, border: `2px solid ${s.color}` }} />{s.name}
            </button>
          ))}
        </div>
      )}
      <div style={{ position: 'relative', marginTop: 12 }}>
        <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`${title}. ${series.map((s) => `${s.name}: ${s.points.map((p) => `${p[0]} ${p[1]}${unit}`).join(', ')}`).join('; ')}`} style={{ width: '100%', height: 'auto', display: 'block', touchAction: 'pan-y' }} onPointerMove={onMove} onPointerDown={onMove} onPointerLeave={() => setHover(null)}>
          {ticks.map((t) => (
            <g key={t}>
              <line x1={L} x2={W - R} y1={Y(t)} y2={Y(t)} stroke={C.border} strokeWidth="1" strokeDasharray={t === 0 ? undefined : '3 4'} />
              <text x={L - 8} y={Y(t) + 4} fontSize="11" textAnchor="end" fill={C.muted}>{t}{unit}</text>
            </g>
          ))}
          {xs.map((x) => <text key={x} x={X(x)} y={H - 12} fontSize="11.5" textAnchor="middle" fill={C.muted}>{x}</text>)}
          {hx !== null && <line x1={X(hx)} x2={X(hx)} y1={T} y2={H - B} stroke={C.goldDeep} strokeWidth="1" strokeDasharray="4 3" />}
          {series.map((s) => {
            if (off[s.name]) return null
            const pts = [...s.points].sort((a, b) => a[0] - b[0])
            const d = pts.map((p, i) => `${i ? 'L' : 'M'}${X(p[0]).toFixed(1)},${Y(p[1]).toFixed(1)}`).join(' ')
            return (
              <g key={s.name}>
                <path d={d} fill="none" stroke={s.color} strokeWidth="2.6" strokeLinejoin="round" strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={seen ? 0 : 1} style={{ transition: 'stroke-dashoffset 1.3s cubic-bezier(.3,.7,.2,1)' }} />
                {pts.map((p) => <circle key={p[0]} cx={X(p[0])} cy={Y(p[1])} r={hx === p[0] ? 6 : 4} fill={C.white} stroke={s.color} strokeWidth="2.4" style={{ opacity: seen ? 1 : 0, transition: 'opacity .6s .9s, r .12s' }} />)}
              </g>
            )
          })}
        </svg>
        {hx !== null && (
          <div style={{ position: 'absolute', top: 6, left: `${Math.min(70, Math.max(2, (X(hx) / W) * 100 - 10))}%`, background: C.plumDark, color: '#fff', borderRadius: 10, padding: '9px 12px', fontSize: 12.5, lineHeight: 1.5, pointerEvents: 'none', boxShadow: '0 12px 30px -12px rgba(0,0,0,.5)', minWidth: 120 }}>
            <div style={{ fontWeight: 800, color: C.gold }}>{hx}</div>
            {series.filter((s) => !off[s.name]).map((s) => {
              const p = s.points.find((q) => q[0] === hx)
              return <div key={s.name}>{s.name}: <strong>{p ? `${p[1]}${unit}` : 'no data'}</strong></div>
            })}
          </div>
        )}
      </div>
      <div style={{ marginTop: 10, fontSize: 12, color: C.muted, lineHeight: 1.5 }}>Source: {src}. Hover or touch the chart for values.</div>
    </div>
  )
}

/* ── Task-horizon projector (pure arithmetic on a published doubling time) ─*/
export function HorizonProjector() {
  const [d, setD] = useState(196)
  const [m, setM] = useState(24)
  const mult = Math.pow(2, (m * 30.4) / d)
  const label = mult >= 100 ? Math.round(mult).toLocaleString('en-US') : mult.toFixed(1)
  const presets: [string, number][] = [['Overall 196 days', 196], ['Since 2023: 131 days', 131], ['Since 2024: 89 days', 88.6]]
  return (
    <div style={{ background: C.plumDark, color: '#fff', borderRadius: 16, padding: 'clamp(20px,3.4vw,30px)' }}>
      <div style={{ fontSize: 11.5, fontWeight: 800, letterSpacing: '.16em', textTransform: 'uppercase', color: C.gold }}>Interactive</div>
      <div style={{ fontFamily: SERIF, fontSize: 'clamp(21px,3vw,26px)', margin: '8px 0 6px', lineHeight: 1.2 }}>If the trend held, how much longer a task could an AI finish?</div>
      <div style={{ fontSize: 14, color: 'rgba(255,255,255,.7)', lineHeight: 1.55 }}>Pick one of METR&rsquo;s published doubling times and a horizon. This is arithmetic, not a forecast: METR itself reports wide uncertainty.</div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', margin: '16px 0' }}>
        {presets.map(([l, v]) => (
          <button key={l} type="button" aria-pressed={d === v} onClick={() => setD(v)} style={{ fontFamily: SANS, fontSize: 12.5, fontWeight: 700, color: d === v ? C.plumDark : '#fff', background: d === v ? C.gold : 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.2)', borderRadius: 999, padding: '7px 13px', cursor: 'pointer' }}>{l}</button>
        ))}
      </div>
      <label style={{ display: 'block', fontSize: 13.5, color: 'rgba(255,255,255,.85)' }}>
        Months from now: <strong style={{ color: C.gold }}>{m}</strong>
        <input type="range" min={3} max={60} step={1} value={m} onChange={(e) => setM(Number(e.target.value))} style={{ width: '100%', marginTop: 10, accentColor: C.gold }} aria-label="Months from now" />
      </label>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginTop: 16, flexWrap: 'wrap' }}>
        <span style={{ fontFamily: SERIF, fontSize: 'clamp(40px,8vw,64px)', color: C.gold, lineHeight: 1, letterSpacing: '-.02em' }}>{label}&times;</span>
        <span style={{ fontSize: 14.5, color: 'rgba(255,255,255,.8)' }}>the task length it can complete about half the time, versus today.</span>
      </div>
    </div>
  )
}

/* ── Share bar ────────────────────────────────────────────────────────────*/
export function ShareBar({ title }: { title: string }) {
  const [done, setDone] = useState(false)
  const url = () => (typeof window !== 'undefined' ? window.location.href : '')
  const copy = async () => {
    try { await navigator.clipboard.writeText(url()); setDone(true); setTimeout(() => setDone(false), 1800) } catch { /* ignore */ }
  }
  const btn: React.CSSProperties = { fontFamily: SANS, fontSize: 13, fontWeight: 700, color: C.plumDark, background: C.white, border: `1px solid ${C.border}`, borderRadius: 999, padding: '8px 15px', cursor: 'pointer', textDecoration: 'none', display: 'inline-block' }
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
      <span style={{ fontSize: 12, fontWeight: 800, letterSpacing: '.14em', textTransform: 'uppercase', color: C.goldDeep }}>Share</span>
      <button type="button" onClick={copy} style={btn}>{done ? 'Link copied' : 'Copy link'}</button>
      <a style={btn} target="_blank" rel="noopener noreferrer" onClick={(e) => { e.currentTarget.href = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url())}` }} href="https://www.linkedin.com/">LinkedIn</a>
      <a style={btn} target="_blank" rel="noopener noreferrer" onClick={(e) => { e.currentTarget.href = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url())}` }} href="https://twitter.com/">X</a>
    </div>
  )
}

/* ── Figure lightbox: wraps any figure body with an expand control ────────*/
export function Zoomable({ children, label }: { children: React.ReactNode; label: string }) {
  const [open, setOpen] = useState(false)
  useEffect(() => {
    if (!open) return
    const k = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('keydown', k)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.removeEventListener('keydown', k); document.body.style.overflow = prev }
  }, [open])
  return (
    <div style={{ position: 'relative' }}>
      {children}
      <button type="button" onClick={() => setOpen(true)} aria-label={`Expand ${label}`} style={{ position: 'absolute', top: -8, right: -8, fontFamily: SANS, fontSize: 11.5, fontWeight: 700, color: C.plumDark, background: 'rgba(250,246,240,.95)', border: `1px solid ${C.border}`, borderRadius: 999, padding: '5px 11px', cursor: 'zoom-in' }}>Expand</button>
      {open && (
        <div role="dialog" aria-modal="true" aria-label={label} onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(20,10,26,.88)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'clamp(12px,3vw,40px)' }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: C.white, borderRadius: 16, padding: 'clamp(16px,3vw,32px)', width: 'min(1200px, 100%)', maxHeight: '100%', overflow: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
              <button type="button" autoFocus onClick={() => setOpen(false)} style={{ fontFamily: SANS, fontSize: 13, fontWeight: 700, color: C.plumDark, background: C.cream, border: `1px solid ${C.border}`, borderRadius: 999, padding: '7px 16px', cursor: 'pointer' }}>Close</button>
            </div>
            {children}
          </div>
        </div>
      )}
    </div>
  )
}
