'use client'
/* Tactile, interactive blocks for /book. Nothing here fakes activity, stock
   or social proof: it is movement, feedback and the visitor's own choices. */
import { useEffect, useRef, useState } from 'react'
import { T } from '../10k-roadmap/config'
import { ftrack, ftrackOnce, getExp } from './funnel'
import { BOOK_PRICE, BOOK_PAGES, BOOK_CHECKOUT_PATH, BOOK_GUARANTEE_DAYS, CHAPTERS, OUTCOMES, PAINS } from './config'
import { Icon } from './Graphics'
import { mark } from './events'

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
export function PainCheck() {
  const [on, setOn] = useState<boolean[]>(PAINS.map(() => false))
  const n = on.filter(Boolean).length
  const msg = n === 0 ? 'Tap the ones that sound like you.' : n <= 2 ? 'You are closer than you think. Keep going.' : n <= 4 ? 'This sounds a lot like you. The book was written for exactly this.' : 'This is you. The book was written for exactly this, and it starts tonight.'
  return (
    <div>
      <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 12 }}>
        {PAINS.map((t, i) => (
          <li key={t}>
            <button className="bk-spot" aria-pressed={on[i]} onClick={() => { setOn((p) => p.map((v, j) => (j === i ? !v : v))); if (!on[i]) { mark('pain'); if (navigator.vibrate) navigator.vibrate(8) } }}
              style={{ ...CARD, width: '100%', textAlign: 'left', padding: '16px 20px', display: 'flex', gap: 14, alignItems: 'flex-start', fontSize: 17, lineHeight: 1.55, color: 'var(--text)', cursor: 'pointer', fontFamily: 'inherit', transition: 'transform .2s, background .25s, border-color .25s', background: on[i] ? 'rgba(var(--limeRGB),.10)' : 'var(--surface)', borderColor: on[i] ? 'rgba(var(--limeRGB),.55)' : 'var(--line)', transform: on[i] ? 'scale(1.01)' : 'none' }}>
              <span style={{ flex: '0 0 26px', height: 26, borderRadius: 8, border: `2px solid ${on[i] ? 'var(--accent)' : 'var(--lineStrong)'}`, background: on[i] ? 'var(--accent)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .2s', marginTop: 1 }}>
                {on[i] && <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={'var(--accentText)'} strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>}
              </span>{t}
            </button>
          </li>
        ))}
      </ul>
      <div style={{ marginTop: 22, ...CARD, padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap', borderColor: n > 0 ? 'rgba(var(--limeRGB),.4)' : 'var(--line)', transition: 'border-color .3s' }}>
        <div style={{ flex: '1 1 260px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--text3)', marginBottom: 8 }}><span>You ticked</span><strong style={{ color: n ? 'var(--accentInk)' : 'var(--text3)' }}>{n} of {PAINS.length}</strong></div>
          <div style={{ height: 8, borderRadius: 4, background: 'rgba(var(--inkRGB),.08)', overflow: 'hidden' }}><div style={{ height: '100%', width: `${(n / PAINS.length) * 100}%`, background: `linear-gradient(90deg, var(--accent), var(--accentHi))`, transition: 'width .4s cubic-bezier(.16,1,.3,1)' }} /></div>
          <div style={{ marginTop: 12, fontSize: 15.5, lineHeight: 1.5, color: 'var(--text)' }}>{msg}</div>
        </div>
        {n >= 3 && <a href={BOOK_CHECKOUT_PATH} onClick={() => ftrack('book_cta_click', { where: 'painCheck', ticked: n })} className="rm-btn" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '15px 28px', borderRadius: 999, background: 'var(--accent)', color: 'var(--accentText)', fontWeight: 800, fontSize: 16, textDecoration: 'none' }}>Get the book: {BOOK_PRICE.label} →</a>}
      </div>
    </div>
  )
}

/* ── pick a chapter, see what it does and what you walk away with ── */
export function ChapterExplorer() {
  const [i, setI] = useState(0)
  const c = CHAPTERS[i], o = OUTCOMES[i]
  const go = (n: number) => setI((n + CHAPTERS.length) % CHAPTERS.length)
  return (
    <div className="bk-explorer" role="group" aria-label="Chapter explorer" onKeyDown={(e) => { if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); go(i + 1) } if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); go(i - 1) } }}>
      <div className="bk-tabs" role="tablist" aria-orientation="vertical">
        {CHAPTERS.map((ch, k) => (
          <button key={ch.n} role="tab" aria-selected={k === i} tabIndex={k === i ? 0 : -1} onClick={() => { setI(k); if (navigator.vibrate) navigator.vibrate(6) }}
            style={{ display: 'flex', alignItems: 'center', gap: 12, textAlign: 'left', padding: '12px 14px', borderRadius: 14, cursor: 'pointer', fontFamily: 'inherit', fontSize: 14.5, fontWeight: k === i ? 800 : 600, lineHeight: 1.3, color: k === i ? 'var(--text)' : 'var(--text2)', background: k === i ? 'rgba(var(--limeRGB),.10)' : 'transparent', border: `1px solid ${k === i ? 'rgba(var(--limeRGB),.5)' : 'transparent'}`, transition: 'all .2s', flex: '0 0 auto' }}>
            <span className="rm-serif" style={{ width: 30, height: 30, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, background: k < i ? 'var(--accent)' : k === i ? 'var(--accent)' : 'rgba(var(--inkRGB),.07)', color: k <= i ? 'var(--accentText)' : 'var(--text3)' }}>{ch.n}</span>
            <span className="bk-tab-t">{ch.title}</span>
          </button>
        ))}
      </div>
      <div key={i} className="bk-spot bk-panel" style={{ ...CARD, padding: 'clamp(22px,3.4vw,38px)', minHeight: 360, display: 'flex', flexDirection: 'column', background: 'linear-gradient(160deg,var(--cardA),var(--cardB))', borderColor: 'rgba(var(--limeRGB),.25)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 16 }}>
          <span className="rm-eyebrow">Chapter {c.n} of 9 · by {c.by}</span>
          <span style={{ fontSize: 12.5, color: 'var(--text3)' }}>{Math.round(((i + 1) / CHAPTERS.length) * 100)}% of the road</span>
        </div>
        <div style={{ height: 5, borderRadius: 3, background: 'rgba(var(--inkRGB),.08)', marginBottom: 22, overflow: 'hidden' }}><div style={{ height: '100%', width: `${((i + 1) / CHAPTERS.length) * 100}%`, background: 'var(--accent)', transition: 'width .5s cubic-bezier(.16,1,.3,1)' }} /></div>
        <h3 className="rm-serif" style={{ fontSize: 'clamp(26px,3.6vw,38px)', margin: '0 0 8px', lineHeight: 1.15 }}>{o.t}</h3>
        <div style={{ color: 'var(--text3)', fontSize: 14, marginBottom: 14 }}>{c.title}</div>
        <p style={{ color: 'var(--text2)', fontSize: 17, lineHeight: 1.7, margin: '0 0 22px' }}>{o.d} {c.line}</p>
        <div style={{ marginTop: 'auto', borderRadius: 16, padding: '16px 18px', background: 'var(--accentSoft)', border: '1px solid rgba(var(--limeRGB),.3)' }}>
          <div className="rm-eyebrow" style={{ marginBottom: 6 }}>You walk away with</div>
          <div style={{ fontSize: 16.5, lineHeight: 1.55, color: 'var(--text)' }}>{c.get}</div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 20, gap: 10, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => go(i - 1)} aria-label="Previous chapter" style={{ width: 46, height: 46, borderRadius: '50%', border: `1px solid var(--lineStrong)`, background: 'transparent', color: 'var(--text)', cursor: 'pointer', fontSize: 18 }}>←</button>
            <button onClick={() => go(i + 1)} aria-label="Next chapter" style={{ width: 46, height: 46, borderRadius: '50%', border: 0, background: 'var(--accent)', color: 'var(--accentText)', cursor: 'pointer', fontSize: 18, fontWeight: 800 }}>→</button>
          </div>
          {i === CHAPTERS.length - 1 && <a href={BOOK_CHECKOUT_PATH} onClick={() => ftrack('book_cta_click', { where: 'explorer_end' })} className="rm-btn" style={{ display: 'inline-flex', gap: 10, padding: '13px 24px', borderRadius: 999, background: 'var(--accent)', color: 'var(--accentText)', fontWeight: 800, textDecoration: 'none' }}>You have seen the road. Get the book →</a>}
        </div>
      </div>
    </div>
  )
}

/* ── flip through real pages ── */
const FLIP = [
  { n: 2, c: 'The title page' }, { n: 13, c: 'Every chapter opens on the trail' }, { n: 20, c: 'Chapter 2: diagnose where you are' }, { n: 29, c: 'The $7 to $10K product ladder' },
  { n: 39, c: 'The pain-to-product bridge' }, { n: 53, c: 'Building an offer people say yes to' }, { n: 68, c: 'Story, Lesson, CTA: content that sells' }, { n: 78, c: 'Your 7-day launch plan' },
]
export function Flipbook() {
  const [i, setI] = useState(0)
  const [flips, setFlips] = useState(0)
  const [dir, setDir] = useState(1)
  const drag = useRef<number | null>(null)
  const go = (n: number) => { setDir(n > i ? 1 : -1); setI((n + FLIP.length) % FLIP.length); setFlips((f) => { if (f + 1 >= 3) mark('flip'); return f + 1 }) }
  useEffect(() => { FLIP.forEach((f) => { const im = new Image(); im.src = `/images/book/flip-${f.n}.webp` }) }, [])
  return (
    <div role="group" aria-label="Flip through the book" tabIndex={0} onKeyDown={(e) => { if (e.key === 'ArrowRight') go(i + 1); if (e.key === 'ArrowLeft') go(i - 1) }} style={{ outline: 'none' }}>
      <div style={{ position: 'relative', perspective: 1600, touchAction: 'pan-y', cursor: 'grab', userSelect: 'none' }}
        onPointerDown={(e) => { drag.current = e.clientX }}
        onPointerUp={(e) => { if (drag.current === null) return; const d = e.clientX - drag.current; drag.current = null; if (Math.abs(d) > 45) go(i + (d < 0 ? 1 : -1)) }}
        onPointerLeave={() => { drag.current = null }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img key={i} className={dir > 0 ? 'bk-flip-r' : 'bk-flip-l'} src={`/images/book/flip-${FLIP[i].n}.webp`} alt={`Pages from the book: ${FLIP[i].c}`} width={1400} height={1000} draggable={false} style={{ width: '100%', height: 'auto', borderRadius: 14, display: 'block', boxShadow: '0 40px 90px -30px rgba(var(--limeRGB),.35)', border: `1px solid var(--line)`, background: '#DCE9D0' }} />
        <button onClick={() => go(i - 1)} aria-label="Previous pages" className="bk-fl-btn" style={{ left: 10 }}>←</button>
        <button onClick={() => go(i + 1)} aria-label="Next pages" className="bk-fl-btn" style={{ right: 10 }}>→</button>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 14, marginTop: 18, flexWrap: 'wrap' }}>
        <div style={{ fontSize: 15, color: 'var(--text2)' }}><strong style={{ color: 'var(--text)' }}>{FLIP[i].c}</strong><span style={{ color: 'var(--text3)' }}> · {i + 1} of {FLIP.length}</span></div>
        <div style={{ display: 'flex', gap: 0 }} role="tablist">{FLIP.map((f, k) => <button key={f.n} role="tab" aria-selected={k === i} aria-label={`Spread ${k + 1}`} onClick={() => go(k)} style={{ width: k === i ? 40 : 24, height: 36, border: 0, cursor: 'pointer', background: 'transparent', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'width .25s' }}><span style={{ display: 'block', width: '100%', height: 10, borderRadius: 5, background: k === i ? 'var(--accent)' : 'rgba(var(--inkRGB),.22)', transition: 'background .25s' }} /></button>)}</div>
      </div>
      {flips >= 3 && (
        <div className="bk-in" style={{ ...CARD, marginTop: 22, padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', borderColor: 'rgba(var(--limeRGB),.4)', background: 'var(--accentSoft)' }}>
          <span style={{ fontSize: 16, lineHeight: 1.5 }}>That was {FLIP.length * 2} of the {BOOK_PAGES} pages. <strong>The rest is waiting for you.</strong></span>
          <a href={BOOK_CHECKOUT_PATH} onClick={() => ftrack('book_cta_click', { where: 'flipbook' })} className="rm-btn" style={{ display: 'inline-flex', gap: 10, padding: '13px 24px', borderRadius: 999, background: 'var(--accent)', color: 'var(--accentText)', fontWeight: 800, textDecoration: 'none' }}>Get all {BOOK_PAGES} pages: {BOOK_PRICE.label} →</a>
        </div>
      )}
    </div>
  )
}

/* ── slide to get the book ── */
export function SlideToBuy() {
  const track_ = useRef<HTMLDivElement | null>(null)
  const [x, setX] = useState(0)
  const [maxX, setMaxX] = useState(0)
  const [done, setDone] = useState(false)
  const [dragging, setDragging] = useState(false)
  const drag = useRef<{ sx: number; ox: number } | null>(null)
  useEffect(() => {
    const el = track_.current; if (!el) return
    const upd = () => setMaxX(Math.max(0, el.clientWidth - 64))
    upd()
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(upd) : null
    ro?.observe(el); window.addEventListener('resize', upd)
    return () => { ro?.disconnect(); window.removeEventListener('resize', upd) }
  }, [])
  const finish = (cx: number, cy: number) => {
    setDone(true); setX(maxX); burst(cx, cy, 70); if (navigator.vibrate) navigator.vibrate([20, 40, 30])
    ftrack('book_cta_click', { where: 'slide' })
    setTimeout(() => { window.location.href = BOOK_CHECKOUT_PATH }, 650)
  }
  return (
    <div style={{ maxWidth: 440, margin: '0 auto' }}>
      <div ref={track_} style={{ position: 'relative', height: 64, borderRadius: 999, background: 'rgba(var(--inkRGB),.06)', border: `1px solid var(--lineStrong)`, overflow: 'hidden', touchAction: 'none', userSelect: 'none' }}>
        <div style={{ position: 'absolute', inset: 0, width: x + 64, background: `linear-gradient(90deg, rgba(var(--limeRGB),.25), var(--accent))`, borderRadius: 999, transition: dragging ? 'none' : 'width .3s' }} />
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', paddingLeft: 56, fontWeight: 800, fontSize: 16, color: done ? 'var(--accentText)' : 'var(--text)', opacity: done ? 1 : Math.max(0.25, 1 - x / (maxX || 1)), pointerEvents: 'none' }}>{done ? 'Unlocked. Taking you in…' : `Slide to get the book · ${BOOK_PRICE.label}`}</div>
        <div role="button" tabIndex={0} aria-label={`Slide to get the book for ${BOOK_PRICE.label}, or press Enter`}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); const r = e.currentTarget.getBoundingClientRect(); finish(r.left + 32, r.top + 32) } }}
          onPointerDown={(e) => { (e.target as HTMLElement).setPointerCapture(e.pointerId); drag.current = { sx: e.clientX, ox: x }; setDragging(true) }}
          onPointerMove={(e) => { if (!drag.current || done) return; setX(Math.max(0, Math.min(maxX, drag.current.ox + e.clientX - drag.current.sx))) }}
          onPointerUp={(e) => { if (!drag.current || done) return; drag.current = null; setDragging(false); if (x > maxX * 0.88) { const r = e.currentTarget.getBoundingClientRect(); finish(r.left + 32, r.top + 32) } else setX(0) }}
          style={{ position: 'absolute', top: 4, left: 4 + x, width: 56, height: 56, borderRadius: '50%', background: done ? '#fff' : 'var(--accent)', color: 'var(--accentText)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'grab', fontSize: 24, fontWeight: 800, boxShadow: '0 10px 24px -8px rgba(0,0,0,.6)', transition: dragging ? 'none' : 'left .3s', touchAction: 'none' }}>{done ? '✓' : '→'}</div>
      </div>
      <p style={{ margin: '12px 0 0', fontSize: 13, color: 'var(--text3)', textAlign: 'center' }}>or <a href={BOOK_CHECKOUT_PATH} style={{ color: 'var(--accentInk)', fontWeight: 700 }}>tap here</a> · {BOOK_GUARANTEE_DAYS}-day money-back guarantee</p>
    </div>
  )
}


/* ── progress: every interaction fills "your roadmap", then offers the book ── */
export const STEPS = [
  { k: 'pain', t: 'Tick what sounds like you' },
  { k: 'math', t: 'Do the math on your hours' },
  { k: 'why', t: 'Write your why' },
  { k: 'flip', t: 'Flip through the pages' },
  { k: 'plan', t: 'Build your 30-day plan' },
]
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
const DOES = [
  { id: 'coach', l: 'I coach people' }, { id: 'consult', l: 'I consult for businesses' }, { id: 'heal', l: 'I am a healer or therapist' }, { id: 'expert', l: 'I am a professional or specialist' },
]
const BLOCK = [
  { id: 'what', l: 'I do not know what to sell', ch: [2, 3, 5], first: 'Take the expertise inventory (Chapter 2) and pick one problem you have already solved.' },
  { id: 'who', l: 'I do not know who to sell to', ch: [4, 7], first: 'Describe your One Person in 10 specific details (Chapter 4).' },
  { id: 'tech', l: 'The tech scares me', ch: [8, 5], first: 'Follow the click-by-click selling-platform setup (Chapter 8) with a friend beside you.' },
  { id: 'fear', l: 'I am afraid to be seen or rejected', ch: [1, 9, 7], first: 'Write your Layer 3 why (Chapter 1) and your doubt response plan (Chapter 9).' },
]
const TIME = [{ id: '2', l: 'About 2 hours a week' }, { id: '5', l: 'About 5 hours a week' }, { id: '10', l: '10 or more hours a week' }]
export function RoadmapBuilder() {
  const [step, setStep] = useState(0)
  const [does, setDoes] = useState('')
  const [block, setBlock] = useState('')
  const [time, setTime] = useState('')
  const [name, setName] = useState('')
  const b = BLOCK.find((x) => x.id === block)
  const doesL = DOES.find((x) => x.id === does)?.l.toLowerCase() || ''
  const pick = (setter: (v: string) => void, v: string) => { setter(v); if (navigator.vibrate) navigator.vibrate(8); setTimeout(() => setStep((s) => s + 1), 220) }
  const opt = (sel: boolean): React.CSSProperties => ({ padding: '16px 18px', borderRadius: 14, textAlign: 'left', fontFamily: 'inherit', fontSize: 16.5, fontWeight: 700, lineHeight: 1.35, cursor: 'pointer', color: 'var(--text)', border: `1px solid ${sel ? 'var(--accent)' : 'var(--line)'}`, background: sel ? 'var(--accentSoft)' : 'var(--surface)', transition: 'all .2s', minHeight: 56 })
  const q = [
    { t: 'What best describes you?', body: <div className="bk-opt">{DOES.map((o) => <button key={o.id} className="bk-spot" style={opt(does === o.id)} onClick={() => pick(setDoes, o.id)}>{o.l}</button>)}</div> },
    { t: 'What is the biggest thing in your way?', body: <div className="bk-opt">{BLOCK.map((o) => <button key={o.id} className="bk-spot" style={opt(block === o.id)} onClick={() => pick(setBlock, o.id)}>{o.l}</button>)}</div> },
    { t: 'How much time can you give this each week?', body: <div className="bk-opt">{TIME.map((o) => <button key={o.id} className="bk-spot" style={opt(time === o.id)} onClick={() => { setTime(o.id); if (navigator.vibrate) navigator.vibrate(8); setTimeout(() => { setStep(3); mark('plan') }, 220) }}>{o.l}</button>)}</div> },
  ]
  return (
    <div style={{ ...CARD, padding: 'clamp(22px,3.6vw,40px)', maxWidth: 860, margin: '0 auto', background: 'linear-gradient(160deg,var(--cardA),var(--cardB))', borderColor: 'rgba(var(--limeRGB),.25)' }}>
      {step < 3 ? (
        <div key={step} className="bk-in">
          <div style={{ display: 'flex', gap: 8, marginBottom: 22 }}>{[0, 1, 2].map((k) => <div key={k} style={{ flex: 1, height: 5, borderRadius: 3, background: k < step ? 'var(--accent)' : k === step ? 'rgba(var(--limeRGB),.45)' : 'rgba(var(--inkRGB),.1)' }} />)}</div>
          <div className="rm-eyebrow" style={{ marginBottom: 10 }}>Question {step + 1} of 3</div>
          <h3 className="rm-serif" style={{ fontSize: 'clamp(24px,3.4vw,34px)', margin: '0 0 22px', lineHeight: 1.2 }}>{q[step].t}</h3>
          {q[step].body}
          {step > 0 && <button onClick={() => setStep(step - 1)} style={{ marginTop: 18, background: 'none', border: 0, color: 'var(--text3)', fontSize: 13.5, cursor: 'pointer', padding: '8px 0' }}>← Back</button>}
        </div>
      ) : (
        <div className="bk-in">
          <div className="rm-eyebrow" style={{ marginBottom: 10 }}>Your personal starting plan</div>
          <h3 className="rm-serif" style={{ fontSize: 'clamp(24px,3.6vw,36px)', margin: '0 0 6px', lineHeight: 1.2 }}>{name.trim() ? `${name.trim()}, here is` : 'Here is'} your first 30 days</h3>
          <p style={{ margin: '0 0 22px', color: 'var(--text2)', fontSize: 15.5, lineHeight: 1.6 }}>For someone who {doesL} and says “{b?.l.toLowerCase()}”, with about {time} hours a week. Built from the book&rsquo;s own chapters.</p>
          <ol style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 12 }}>
            {[{ w: 'Day 1', d: b?.first || '' }, { w: 'Week 1', d: `Work through Chapter ${b?.ch[0]} at your own pace (${time === '2' ? 'two short sittings' : time === '5' ? 'three sittings' : 'a single focused weekend session'}) and fill in every worksheet.` }, { w: 'Week 2', d: `Move to Chapter ${b?.ch[1]} and turn it into something written down: ${CHAPTER_HINT[b?.ch[1] || 1]}` }, { w: 'Weeks 3 to 4', d: `Finish the road: Chapter ${b?.ch[2] || 5} and the 7-day launch plan, then pick your launch date.` }].map((s, k) => (
              <li key={s.w} className="bk-spot" style={{ ...CARD, padding: '16px 18px', display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                <span className="rm-serif" style={{ flex: '0 0 auto', minWidth: 74, color: 'var(--accentInk)', fontSize: 15, fontWeight: 800, paddingTop: 2 }}>{s.w}</span>
                <span style={{ fontSize: 15.5, lineHeight: 1.6, color: 'var(--text)' }}>{s.d}</span>
                <span style={{ marginLeft: 'auto', color: 'var(--text3)', fontSize: 12, paddingTop: 3 }}>{k + 1}/4</span>
              </li>
            ))}
          </ol>
          <div style={{ marginTop: 22, display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
            <input value={name} onChange={(e) => setName(e.target.value.slice(0, 24))} placeholder="Add your first name (optional)" aria-label="Your first name" style={{ flex: '1 1 200px', minWidth: 0, padding: '13px 16px', fontSize: 16, background: 'rgba(var(--inkRGB),.05)', border: `1px solid var(--lineStrong)`, borderRadius: 12, color: 'var(--text)', fontFamily: 'inherit', outline: 'none' }} />
            <a href={BOOK_CHECKOUT_PATH} onClick={() => ftrack('book_cta_click', { where: 'roadmap_builder', blocker: block, time })} className="rm-btn" style={{ flex: '1 1 240px', display: 'inline-flex', justifyContent: 'center', alignItems: 'center', gap: 10, padding: '16px 24px', borderRadius: 999, background: 'var(--accent)', color: 'var(--accentText)', fontWeight: 800, fontSize: 16, textDecoration: 'none' }}>Get the book that fills this in: {BOOK_PRICE.label} →</a>
          </div>
          <p style={{ margin: '14px 0 0', fontSize: 12.5, color: 'var(--text3)' }}>Nothing you chose here is saved or sent. <button onClick={() => { setStep(0); setDoes(''); setBlock(''); setTime('') }} style={{ background: 'none', border: 0, color: 'var(--text2)', textDecoration: 'underline', cursor: 'pointer', fontSize: 12.5, padding: 0 }}>Start over</button></p>
        </div>
      )}
    </div>
  )
}
const CHAPTER_HINT: Record<number, string> = {
  1: 'your Layer 3 why and your 12-month vision.', 2: 'your expertise inventory and your biggest leaks.', 3: 'your first product idea and your place on the product ladder.', 4: 'a 10-detail profile of your One Person.',
  5: 'your product blueprint and one-sentence sales promise.', 6: 'your offer stack and one-page offer.', 7: 'your 30-day content map and five selling posts.', 8: 'your product page, launch posts and ten people to message.', 9: 'your doubt response plan and morning ritual.',
}


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
export function LeadMagnet() {
  const [email, setEmail] = useState('')
  const [state, setState] = useState<'idle' | 'sending' | 'done' | 'error'>('idle')
  const [msg, setMsg] = useState('')
  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) { setState('error'); setMsg('Please enter a valid email address.'); return }
    setState('sending')
    try {
      const r = await fetch('/api/book/lead', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: email.trim(), exp: getExp(), src: document.referrer ? new URL(document.referrer).hostname : 'direct' }) })
      const j = await r.json().catch(() => ({}))
      if (!r.ok) { setState('error'); setMsg(j.error || 'Something went wrong. Please try again.'); return }
      ftrack('book_lead', { where: 'chapter1' }); setState('done'); setMsg(j.url || '')
    } catch { setState('error'); setMsg('Something went wrong. Please check your connection and try again.') }
  }
  return (
    <div className="bk-spot" style={{ ...CARD, padding: 'clamp(22px,3.6vw,38px)', textAlign: 'center', background: 'linear-gradient(160deg,var(--cardA),var(--cardB))' }}>
      <div style={{ width: 52, height: 52, borderRadius: 16, margin: '0 auto 14px', background: 'var(--accentSoft)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="book" size={26} stroke="var(--accentInk)" /></div>
      <div className="rm-eyebrow" style={{ marginBottom: 10 }}>Not ready to buy yet?</div>
      <h2 className="rm-serif" style={{ fontSize: 'clamp(26px,3.8vw,38px)', margin: '0 0 10px' }}>Read Chapter 1 free. Decide after.</h2>
      <p style={{ color: 'var(--text2)', fontSize: 16.5, lineHeight: 1.65, margin: '0 auto 22px', maxWidth: 520 }}>Six pages: the 3-layer why method, your non-negotiables and your 12-month vision. Enter your email and we will send it straight away.</p>
      {state === 'done' ? (
        <div className="bk-in">
          <div style={{ fontWeight: 800, fontSize: 18, marginBottom: 12 }}>It is on its way. You can also open it now.</div>
          <a href={msg || '/documents/expertise-to-income-chapter-1.pdf'} target="_blank" rel="noopener" className="rm-btn" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '15px 28px', borderRadius: 999, background: 'var(--accent)', color: 'var(--accentText)', fontWeight: 800, textDecoration: 'none' }}>Open Chapter 1 (PDF) →</a>
          <p style={{ margin: '16px 0 0', fontSize: 14, color: 'var(--text2)' }}>Like it? <a href={BOOK_CHECKOUT_PATH} onClick={() => ftrack('book_cta_click', { where: 'lead_done' })} style={{ color: 'var(--accentInk)', fontWeight: 800 }}>Get the full book for {BOOK_PRICE.label}</a>.</p>
        </div>
      ) : (
        <form onSubmit={submit} noValidate style={{ display: 'flex', gap: 10, flexWrap: 'wrap', maxWidth: 520, margin: '0 auto' }}>
          <input type="email" inputMode="email" autoComplete="email" value={email} onChange={(e) => { setEmail(e.target.value); if (state === 'error') setState('idle') }} placeholder="Your best email" aria-label="Your email address" style={{ flex: '1 1 230px', minWidth: 0, padding: '15px 18px', fontSize: 16, borderRadius: 999, border: `1px solid ${state === 'error' ? T.danger : 'var(--lineStrong)'}`, background: 'var(--surface)', color: 'var(--text)', fontFamily: 'inherit', outline: 'none' }} />
          <button type="submit" disabled={state === 'sending'} className="rm-btn" style={{ flex: '0 0 auto', padding: '15px 26px', borderRadius: 999, border: 0, background: 'var(--accent)', color: 'var(--accentText)', fontWeight: 800, fontSize: 16, cursor: 'pointer', opacity: state === 'sending' ? 0.6 : 1 }}>{state === 'sending' ? 'Sending…' : 'Send me Chapter 1'}</button>
          {state === 'error' && <p style={{ flexBasis: '100%', margin: '4px 0 0', color: T.danger, fontSize: 13.5 }}>{msg}</p>}
          <p style={{ flexBasis: '100%', margin: '8px 0 0', fontSize: 12.5, color: 'var(--text3)' }}>No spam. One email with your chapter, and the occasional useful note. Unsubscribe any time.</p>
        </form>
      )}
    </div>
  )
}
