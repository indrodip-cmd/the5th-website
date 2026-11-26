'use client'
/* Tactile, interactive blocks for /book. Nothing here fakes activity, stock
   or social proof: it is movement, feedback and the visitor's own choices. */
import { useEffect, useRef, useState } from 'react'
import { T } from '../10k-roadmap/config'
import { ftrack, ftrackOnce } from './funnel'
import { BOOK_PRICE, BOOK_CHECKOUT_PATH } from './config'

const CARD: React.CSSProperties = { background: 'var(--surface)', border: `1px solid var(--line)`, borderRadius: T.radius }
const reduced = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

/* ── confetti burst (Web Animations API, self-cleaning) ── */
export function burst(x: number, y: number, n = 46) {
  if (typeof document === 'undefined' || reduced()) return
  const colors = ['#C9FF48', '#E8FFA6', '#2FA866', '#FFC94A', '#ffffff']
  for (let i = 0; i < n; i++) {
    const d = document.createElement('i')
    const s = 5 + Math.random() * 7
    Object.assign(d.style, { position: 'fixed', left: x + 'px', top: y + 'px', width: s + 'px', height: s * (Math.random() > 0.5 ? 1 : 2.2) + 'px', background: colors[i % colors.length], borderRadius: '2px', zIndex: '9999', pointerEvents: 'none' })
    document.body.appendChild(d)
    const a = Math.random() * Math.PI * 2, v = 120 + Math.random() * 260
    d.animate([{ transform: 'translate(0,0) rotate(0deg)', opacity: 1 }, { transform: `translate(${Math.cos(a) * v}px, ${Math.sin(a) * v + 220}px) rotate(${Math.random() * 720}deg)`, opacity: 0 }], { duration: 900 + Math.random() * 600, easing: 'cubic-bezier(.12,.7,.3,1)' }).onfinish = () => d.remove()
  }
}

/* ── thin scroll-progress bar ── */
export function ScrollBar() {
  const ref = useRef<HTMLDivElement | null>(null)
  useEffect(() => {
    let raf = 0
    const on = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(() => { const el = ref.current; if (!el) return; const h = document.documentElement.scrollHeight - window.innerHeight; el.style.transform = `scaleX(${h > 0 ? Math.min(1, window.scrollY / h) : 0})` }) }
    on(); window.addEventListener('scroll', on, { passive: true }); window.addEventListener('resize', on)
    return () => { window.removeEventListener('scroll', on); window.removeEventListener('resize', on); cancelAnimationFrame(raf) }
  }, [])
  return <div aria-hidden="true" style={{ position: 'fixed', top: 0, left: 0, right: 0, height: 3, zIndex: 80, pointerEvents: 'none' }}><div ref={ref} style={{ height: '100%', background: `linear-gradient(90deg, var(--accent), var(--accentHi))`, transformOrigin: '0 50%', transform: 'scaleX(0)', boxShadow: `0 0 12px var(--accent)` }} /></div>
}

/* ── spotlight that follows the cursor over any .bk-spot card ── */
export function SpotlightLayer() {
  useEffect(() => {
    const on = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return
      const el = (e.target as HTMLElement | null)?.closest?.('.bk-spot') as HTMLElement | null
      if (!el) return
      const r = el.getBoundingClientRect(); el.style.setProperty('--mx', e.clientX - r.left + 'px'); el.style.setProperty('--my', e.clientY - r.top + 'px')
    }
    document.addEventListener('pointermove', on, { passive: true })
    return () => document.removeEventListener('pointermove', on)
  }, [])
  return null
}

/* ── book that tilts toward the pointer, with a moving glare ── */
export function TiltBook({ children }: { children: React.ReactNode }) {
  const [t, setT] = useState({ rx: 0, ry: 0, gx: 50, gy: 30, on: false })
  const move = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === 'touch' || reduced()) return
    const r = e.currentTarget.getBoundingClientRect(); const px = (e.clientX - r.left) / r.width - 0.5, py = (e.clientY - r.top) / r.height - 0.5
    setT({ rx: -py * 16, ry: px * 22, gx: (px + 0.5) * 100, gy: (py + 0.5) * 100, on: true })
  }
  return (
    <div onPointerMove={move} onPointerLeave={() => setT({ rx: 0, ry: 0, gx: 50, gy: 30, on: false })} style={{ position: 'relative', perspective: 1100, display: 'inline-block', width: 'min(78%, 400px)', touchAction: 'pan-y' }}>
      <div style={{ transform: `rotateX(${t.rx}deg) rotateY(${t.ry}deg)`, transition: t.on ? 'transform .08s linear' : 'transform .6s cubic-bezier(.16,1,.3,1)', transformStyle: 'preserve-3d', position: 'relative' }}>
        {children}
        <div aria-hidden="true" style={{ position: 'absolute', inset: 0, borderRadius: 8, pointerEvents: 'none', opacity: t.on ? 1 : 0, transition: 'opacity .3s', background: `radial-gradient(circle at ${t.gx}% ${t.gy}%, rgba(var(--inkRGB),.28), transparent 45%)`, mixBlendMode: 'overlay' }} />
      </div>
    </div>
  )
}

/* ── button that leans toward the cursor ── */
export function Magnetic({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLSpanElement | null>(null)
  return (
    <span ref={ref} style={{ display: 'inline-flex', transition: 'transform .35s cubic-bezier(.16,1,.3,1)', willChange: 'transform' }}
      onPointerMove={(e) => { if (e.pointerType === 'touch' || reduced()) return; const r = ref.current!.getBoundingClientRect(); ref.current!.style.transform = `translate(${((e.clientX - r.left) / r.width - 0.5) * 12}px, ${((e.clientY - r.top) / r.height - 0.5) * 10}px)` }}
      onPointerLeave={() => { if (ref.current) ref.current.style.transform = '' }}>{children}</span>
  )
}

/* ── tick what sounds like you ── */
export function ProgressChip() {
  const [done, setDone] = useState<string[]>([])
  const [open, setOpen] = useState(false)
  const celebrated = useRef(false)
  useEffect(() => {
    const on = (e: Event) => { const k = (e as CustomEvent).detail as string; setDone((d) => (d.includes(k) ? d : [...d, k])) }
    window.addEventListener('bk-step', on)
    return () => window.removeEventListener('bk-step', on)
  }, [])
  const n = done.length, all = n === STEPS.length
  useEffect(() => {
    if (all && !celebrated.current) { celebrated.current = true; setOpen(true); burst(window.innerWidth / 2, window.innerHeight * 0.6, 90); ftrack('book_cta_click', { where: 'progress_complete' }) }
  }, [all])
  if (n === 0) return null
  return (
    <div className="bk-chip" style={{ position: 'fixed', left: 14, zIndex: 58 }}>
      <button onClick={() => setOpen((o) => !o)} aria-expanded={open} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 14px 9px 10px', borderRadius: 999, border: `1px solid ${all ? 'var(--accent)' : 'var(--lineStrong)'}`, background: 'rgba(12,16,10,.94)', color: 'var(--text)', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 700, fontSize: 13.5, backdropFilter: 'blur(12px)', boxShadow: all ? `0 0 0 4px rgba(var(--limeRGB),.18)` : 'none' }}>
        <svg width="30" height="30" viewBox="0 0 36 36" aria-hidden="true"><circle cx="18" cy="18" r="15" fill="none" stroke="rgba(var(--inkRGB),.14)" strokeWidth="4" /><circle cx="18" cy="18" r="15" fill="none" stroke={'var(--accent)'} strokeWidth="4" strokeLinecap="round" strokeDasharray={`${(n / STEPS.length) * 94.2} 94.2`} transform="rotate(-90 18 18)" style={{ transition: 'stroke-dasharray .5s cubic-bezier(.16,1,.3,1)' }} /><text x="18" y="22" textAnchor="middle" fontSize="12" fontWeight="800" fill={'var(--text)'}>{n}</text></svg>
        {all ? 'Your roadmap is built' : `Your roadmap: ${n} of ${STEPS.length}`}
      </button>
      {open && (
        <div className="bk-in" style={{ ...CARD, marginTop: 8, padding: 16, width: 'min(300px, calc(100vw - 28px))', background: 'rgba(12,16,10,.97)', backdropFilter: 'blur(12px)' }}>
          <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 10 }}>
            {STEPS.map((s) => { const d = done.includes(s.k); return (
              <li key={s.k} style={{ display: 'flex', gap: 10, alignItems: 'center', fontSize: 14, color: d ? 'var(--text)' : 'var(--text3)' }}>
                <span style={{ width: 20, height: 20, borderRadius: 6, flexShrink: 0, background: d ? 'var(--accent)' : 'transparent', border: `2px solid ${d ? 'var(--accent)' : 'var(--lineStrong)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{d && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={'var(--accentText)'} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>}</span>{s.t}
              </li>) })}
          </ul>
          {all ? (
            <a href={BOOK_CHECKOUT_PATH} onClick={() => ftrack('book_cta_click', { where: 'chip_complete' })} className="rm-btn" style={{ display: 'flex', justifyContent: 'center', marginTop: 14, padding: '13px 18px', borderRadius: 999, background: 'var(--accent)', color: 'var(--accentText)', fontWeight: 800, textDecoration: 'none', fontSize: 15 }}>You have done the work. Get the book: {BOOK_PRICE.label} →</a>
          ) : <p style={{ margin: '12px 0 0', fontSize: 12.5, color: 'var(--text3)', lineHeight: 1.5 }}>Finish all five and the whole roadmap is yours to keep. The book is what turns it into a plan on paper.</p>}
        </div>
      )}
    </div>
  )
}

/* ── build a personal 30-day plan in four taps ── */


export const STEPS = [
  { k: 'pain', t: 'Tick what sounds like you' },
  { k: 'math', t: 'Do the math on your hours' },
  { k: 'why', t: 'Write your why' },
  { k: 'flip', t: 'Flip through the pages' },
  { k: 'plan', t: 'Build your 30-day plan' },
]

/* ── scroll-depth by section: fires once per section when 35% of it is visible ── */
export function SectionTracker() {
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { const s = (e.target as HTMLElement).dataset.sec || ''; ftrackOnce('sec:' + s, 'book_section_view', { section: s }); io.unobserve(e.target) } }), { threshold: 0.35 })
    document.querySelectorAll('[data-sec]').forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])
  return null
}

/* ── free Chapter 1 by email: grows the list without competing with the buy button ── */