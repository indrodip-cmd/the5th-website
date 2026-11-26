'use client'
/* Graphic and interactive blocks for the /book sales page. Everything here is
   either decoration or the visitor's own arithmetic: nothing invents a
   statistic, a review or a deadline. */
import { useEffect, useRef, useState } from 'react'
import { T } from '../10k-roadmap/config'
import { ftrack } from './funnel'
import { BOOK_PRICE, BOOK_CHECKOUT_PATH, BOOK_GUARANTEE_DAYS } from './config'

/* ── icons (24-unit strokes, same family as the book) ── */
const PATHS: Record<string, string> = {
  clock: '<circle cx="24" cy="24" r="18"/><path d="M24 12v13l9 5"/>',
  target: '<circle cx="24" cy="24" r="17"/><circle cx="24" cy="24" r="10"/><circle cx="24" cy="24" r="3"/>',
  shield: '<path d="M24 5l15 5v12c0 10-6 17-15 21C15 39 9 32 9 22V10z"/><path d="M17 24l5 5 9-10"/>',
  rocket: '<path d="M24 6c8 4 12 12 10 22l-6 6h-8l-6-6C12 18 16 10 24 6z"/><circle cx="24" cy="19" r="3.5"/><path d="M14 30l-6 4 2 6 8-4M34 30l6 4-2 6-8-4"/>',
  bulb: '<path d="M17 33c0-3-5-6-5-12a12 12 0 0 1 24 0c0 6-5 9-5 12z"/><path d="M18 38h12M20 43h8"/>',
  heart: '<path d="M24 41C8 29 6 20 11 14c4-4 10-3 13 2 3-5 9-6 13-2 5 6 3 15-13 27z"/>',
  chat: '<path d="M8 10h32a2 2 0 0 1 2 2v18a2 2 0 0 1-2 2H26l-9 8v-8H8a2 2 0 0 1-2-2V12a2 2 0 0 1 2-2z"/><path d="M15 18h18M15 25h11"/>',
  book: '<path d="M8 10c6-2 12-2 16 2 4-4 10-4 16-2v28c-6-2-12-2-16 2-4-4-10-4-16-2z"/><path d="M24 12v28"/>',
  coin: '<ellipse cx="24" cy="14" rx="14" ry="6"/><path d="M10 14v10c0 3.3 6.3 6 14 6s14-2.7 14-6V14M10 24v10c0 3.3 6.3 6 14 6s14-2.7 14-6V24"/>',
  user: '<circle cx="24" cy="16" r="8"/><path d="M8 42c0-9 7-14 16-14s16 5 16 14"/>',
  lock: '<rect x="9" y="21" width="30" height="21" rx="5"/><path d="M15 21v-6a9 9 0 0 1 18 0v6"/>',
  star: '<path d="M24 5l5.6 12.2 13.4 1.5-10 9 2.8 13.1L24 34l-11.8 6.8 2.8-13.1-10-9 13.4-1.5z"/>',
  flag: '<path d="M12 6v38M12 8h26l-6 9 6 9H12"/>',
  pen: '<path d="M8 40l3-10L33 8l7 7-22 22z"/><path d="M28 13l7 7"/>',
}
export function Icon({ name, size = 24, stroke = 'var(--accent)', sw = 3 }: { name: string; size?: number; stroke?: string; sw?: number }) {
  return <svg width={size} height={size} viewBox="0 0 48 48" fill="none" stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" dangerouslySetInnerHTML={{ __html: PATHS[name] || '' }} />
}


/* ── count-up numbers ── */
export function CountUp({ to, prefix = '', suffix = '', decimals = 0 }: { to: number; prefix?: string; suffix?: string; decimals?: number }) {
  const ref = useRef<HTMLSpanElement | null>(null)
  // Starts at the final value (correct with no JS and for crawlers), then
  // replays from zero the first time it scrolls into view.
  const [v, setV] = useState(to)
  useEffect(() => {
    const el = ref.current; if (!el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || typeof IntersectionObserver === 'undefined') return
    let raf = 0
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return
      io.disconnect()
      const t0 = performance.now(), dur = 1400
      const tick = (t: number) => { const p = Math.min(1, (t - t0) / dur); setV(to * (1 - Math.pow(1 - p, 3))); if (p < 1) raf = requestAnimationFrame(tick) }
      raf = requestAnimationFrame(tick)
    }, { threshold: 0.4 })
    io.observe(el)
    return () => { io.disconnect(); cancelAnimationFrame(raf) }
  }, [to])
  return <span ref={ref}>{prefix}{v.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}{suffix}</span>
}

/* ── Do the math on your time ── */
export function FloatingBuy() {
  const [show, setShow] = useState(false)
  useEffect(() => {
    const hero = document.getElementById('bk-hero')
    if (!hero || typeof IntersectionObserver === 'undefined') return
    let heroGone = false, nearCta = 0
    const upd = () => setShow(heroGone && nearCta === 0)
    const a = new IntersectionObserver(([e]) => { heroGone = !e.isIntersecting && e.boundingClientRect.top < 0; upd() }, { threshold: 0 })
    a.observe(hero)
    // hide the pill whenever another buy button is already on screen
    const seen = new Set<Element>()
    const b = new IntersectionObserver((entries) => { entries.forEach((e) => { if (e.isIntersecting) seen.add(e.target); else seen.delete(e.target) }); nearCta = seen.size; upd() }, { threshold: 0.2 })
    document.querySelectorAll('a[href="' + BOOK_CHECKOUT_PATH + '"]:not(.bk-float), #bk-final, #checkout').forEach((el) => b.observe(el))
    return () => { a.disconnect(); b.disconnect() }
  }, [])
  return (
    <a href={BOOK_CHECKOUT_PATH} onClick={() => ftrack('book_cta_click', { where: 'floating' })} className="bk-float" style={{ position: 'fixed', left: '50%', bottom: 22, zIndex: 55, transform: `translate(-50%, ${show ? 0 : 140}%)`, opacity: show ? 1 : 0, pointerEvents: show ? 'auto' : 'none', transition: 'transform .4s cubic-bezier(.16,1,.3,1), opacity .3s', display: 'none', alignItems: 'center', gap: 14, padding: '10px 12px 10px 22px', borderRadius: 999, background: 'rgba(12,16,10,.94)', border: `1px solid var(--lineStrong)`, boxShadow: '0 20px 50px -14px rgba(0,0,0,.8), 0 0 0 1px rgba(var(--limeRGB),.15)', backdropFilter: 'blur(14px)', color: 'var(--text)', textDecoration: 'none', fontWeight: 700, fontSize: 15 }}>
      <span>Expertise to Income <span style={{ color: 'var(--text3)', fontWeight: 500 }}>· {BOOK_PRICE.label} · {BOOK_GUARANTEE_DAYS}-day guarantee</span></span>
      <span style={{ background: 'var(--accent)', color: 'var(--accentText)', borderRadius: 999, padding: '11px 20px', fontWeight: 800 }}>Get the book →</span>
    </a>
  )
}
