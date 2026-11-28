'use client'
import React, { useEffect, useRef, useState } from 'react'
import { C } from './ui'

const SANS = "'Public Sans', system-ui, -apple-system, sans-serif"

/* Floating reading toolbar: progress ring + time left, listen aloud, text size,
   top. Also: highlight-to-share quotes, scroll reveals and chapter parallax. */
export default function ReaderTools({ title }: { title: string }) {
  const [p, setP] = useState(0)
  const [mins, setMins] = useState(0)
  const [zoom, setZoom] = useState(1)
  const [speaking, setSpeaking] = useState(false)
  const [sel, setSel] = useState<{ x: number; y: number; t: string } | null>(null)
  const [copied, setCopied] = useState(false)
  const [canSpeak, setCanSpeak] = useState(false)
  useEffect(() => { const id = requestAnimationFrame(() => setCanSpeak('speechSynthesis' in window)); return () => cancelAnimationFrame(id) }, [])
  const stop = useRef(false)

  /* progress + time left */
  useEffect(() => {
    const art = document.querySelector('.rsch-art') as HTMLElement | null
    const words = (art?.innerText ?? '').split(/\s+/).length
    const total = Math.max(1, Math.round(words / 230))
    const on = () => {
      if (!art) return
      const r = art.getBoundingClientRect()
      const k = Math.min(1, Math.max(0, (-r.top + innerHeight * 0.3) / Math.max(1, r.height - innerHeight * 0.3)))
      setP(k); setMins(Math.max(0, Math.round(total * (1 - k))))
    }
    on()
    window.addEventListener('scroll', on, { passive: true }); window.addEventListener('resize', on)
    return () => { window.removeEventListener('scroll', on); window.removeEventListener('resize', on) }
  }, [])

  /* text size */
  useEffect(() => {
    let z = 1
    try { z = Number(localStorage.getItem('rsch-zoom')) || 1 } catch { /* ignore */ }
    const id = requestAnimationFrame(() => setZoom(z))
    return () => cancelAnimationFrame(id)
  }, [])
  useEffect(() => {
    document.documentElement.style.setProperty('--rsch-z', String(zoom))
    try { localStorage.setItem('rsch-zoom', String(zoom)) } catch { /* ignore */ }
  }, [zoom])

  /* reveal on scroll + chapter parallax */
  useEffect(() => {
    const art = document.querySelector('.rsch-art')
    if (!art || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return
    const items = Array.from(art.children).filter((el) => el.getBoundingClientRect().top > innerHeight && !el.hasAttribute('hidden')) as HTMLElement[]
    items.forEach((el) => el.classList.add('rsch-rv'))
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('rsch-in'); io.unobserve(e.target) } }), { rootMargin: '0px 0px -8% 0px' })
    items.forEach((el) => io.observe(el))
    let raf = 0
    const par = () => {
      raf = 0
      document.querySelectorAll<HTMLElement>('.rsch-chap').forEach((c) => {
        const r = c.getBoundingClientRect()
        if (r.bottom < 0 || r.top > innerHeight) return
        const k = (r.top + r.height / 2 - innerHeight / 2) / innerHeight
        const a = c.querySelector<HTMLElement>('.rsch-chap-art > div')
        if (a) a.style.translate = `0 ${(k * -36).toFixed(1)}px`
      })
    }
    const sc = () => { if (!raf) raf = requestAnimationFrame(par) }
    window.addEventListener('scroll', sc, { passive: true }); par()
    return () => { io.disconnect(); window.removeEventListener('scroll', sc); items.forEach((el) => el.classList.remove('rsch-rv', 'rsch-in')) }
  }, [])

  /* highlight to share */
  useEffect(() => {
    const on = () => {
      const s = window.getSelection()
      const t = s?.toString().trim() ?? ''
      const art = document.querySelector('.rsch-art')
      if (!s || !t || t.length < 12 || t.length > 420 || !art || !s.anchorNode || !art.contains(s.anchorNode)) { setSel(null); return }
      const r = s.getRangeAt(0).getBoundingClientRect()
      setSel({ x: Math.min(innerWidth - 150, Math.max(150, r.left + r.width / 2)), y: Math.max(70, r.top - 10), t })
    }
    document.addEventListener('mouseup', on); document.addEventListener('keyup', on)
    document.addEventListener('touchend', () => setTimeout(on, 250))
    return () => { document.removeEventListener('mouseup', on); document.removeEventListener('keyup', on) }
  }, [])

  const listen = () => {
    const ss = window.speechSynthesis
    if (!ss) return
    if (speaking) { stop.current = true; ss.cancel(); setSpeaking(false); document.querySelectorAll('.rsch-say').forEach((e) => e.classList.remove('rsch-say')); return }
    const nodes = Array.from(document.querySelectorAll<HTMLElement>('.rsch-art > p, .rsch-art > h2, .rsch-art > h3, .rsch-art > ul > li, .rsch-art > ol > li, .rsch-art > div > p')).filter((n) => !n.closest('figure, .rsch-chap, nav, #new-in-2026, [hidden]') && (n.innerText ?? '').trim().length > 2)
    stop.current = false
    setSpeaking(true)
    let i = 0
    const next = () => {
      document.querySelectorAll('.rsch-say').forEach((e) => e.classList.remove('rsch-say'))
      if (stop.current || i >= nodes.length) { setSpeaking(false); return }
      const n = nodes[i++]
      n.classList.add('rsch-say')
      n.scrollIntoView({ block: 'center', behavior: 'smooth' })
      const u = new SpeechSynthesisUtterance(n.innerText)
      u.lang = 'en-US'; u.rate = 1
      u.onend = next; u.onerror = next
      ss.speak(u)
    }
    next()
  }
  useEffect(() => () => { stop.current = true; try { window.speechSynthesis?.cancel() } catch { /* ignore */ } }, [])

  const copy = async () => { try { await navigator.clipboard.writeText(`"${sel?.t}" — ${title}\n${location.href}`); setCopied(true); setTimeout(() => setCopied(false), 1500) } catch { /* ignore */ } }
  const R = 15, CIRC = 2 * Math.PI * R
  const b: React.CSSProperties = { fontFamily: SANS, fontSize: 12.5, fontWeight: 800, color: '#fff', background: 'transparent', border: 'none', cursor: 'pointer', padding: '8px 10px', borderRadius: 999, whiteSpace: 'nowrap' }

  return (
    <>
      <div role="toolbar" aria-label="Reading tools" style={{ position: 'fixed', left: '50%', bottom: 16, transform: 'translateX(-50%)', zIndex: 60, display: 'flex', alignItems: 'center', gap: 2, background: 'rgba(31,15,38,.92)', backdropFilter: 'blur(14px)', border: '1px solid rgba(255,255,255,.16)', borderRadius: 999, padding: '6px 8px 6px 10px', boxShadow: '0 20px 50px -18px rgba(0,0,0,.6)', maxWidth: 'calc(100vw - 20px)' }}>
        <svg width="38" height="38" viewBox="0 0 38 38" aria-hidden style={{ flexShrink: 0 }}>
          <circle cx="19" cy="19" r={R} fill="none" stroke="rgba(255,255,255,.18)" strokeWidth="3" />
          <circle cx="19" cy="19" r={R} fill="none" stroke={C.gold} strokeWidth="3" strokeLinecap="round" strokeDasharray={CIRC} strokeDashoffset={CIRC * (1 - p)} transform="rotate(-90 19 19)" />
          <text x="19" y="23" textAnchor="middle" fontSize="10.5" fontWeight="800" fill="#fff" fontFamily={SANS}>{Math.round(p * 100)}</text>
        </svg>
        <span style={{ fontFamily: SANS, fontSize: 12.5, color: 'rgba(255,255,255,.85)', padding: '0 8px 0 6px', whiteSpace: 'nowrap' }}>{mins > 0 ? `${mins} min left` : 'Done'}</span>
        {canSpeak && <button type="button" onClick={listen} style={{ ...b, background: speaking ? C.gold : 'rgba(255,255,255,.1)', color: speaking ? C.plumDark : '#fff' }}>{speaking ? 'Stop' : 'Listen'}</button>}
        <button type="button" aria-label="Smaller text" onClick={() => setZoom((z) => Math.max(0.9, +(z - 0.1).toFixed(2)))} style={b}>A−</button>
        <button type="button" aria-label="Larger text" onClick={() => setZoom((z) => Math.min(1.4, +(z + 0.1).toFixed(2)))} style={b}>A+</button>
        <button type="button" aria-label="Back to top" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} style={b}>Top</button>
      </div>
      {sel && (
        <div style={{ position: 'fixed', left: sel.x, top: sel.y, transform: 'translate(-50%,-100%)', zIndex: 70, display: 'flex', gap: 2, background: C.plumDark, borderRadius: 999, padding: 5, boxShadow: '0 16px 40px -12px rgba(0,0,0,.6)', border: '1px solid rgba(201,168,76,.5)' }} onMouseDown={(e) => e.preventDefault()}>
          <button type="button" onClick={copy} style={b}>{copied ? 'Copied' : 'Copy quote'}</button>
          <a style={{ ...b, textDecoration: 'none' }} target="_blank" rel="noopener noreferrer" href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`"${sel.t.slice(0, 220)}"`)}&url=${encodeURIComponent(typeof location !== 'undefined' ? location.href : '')}`}>Post on X</a>
        </div>
      )}
    </>
  )
}
