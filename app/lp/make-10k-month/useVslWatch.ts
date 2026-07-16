'use client'
/* Watch-time tracking + CTA reveal + Typeform booking, shared by the funnel
   page. Cumulative watched seconds survive pause/resume AND reload (seeded from
   localStorage). Progress is checkpointed to Supabase every 30s and on
   tab-close (sendBeacon), so partial-watch data is never lost. Crossing the
   reveal threshold unlocks the "Book a call" CTA. */
import { useCallback, useEffect, useRef, useState } from 'react'

type Lead = { name: string; email: string }

function loadScript(src: string, id: string) {
  if (document.getElementById(id)) return
  const s = document.createElement('script')
  s.src = src; s.id = id; s.async = true
  document.head.appendChild(s)
}

export function useVslWatch(lead: Lead | null, revealSeconds: number, formId: string) {
  const [seed, setSeed] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const [booked, setBooked] = useState(false)

  const secondsRef = useRef(0)
  const completedRef = useRef(false)
  const lastSyncRef = useRef(0)
  const revealedRef = useRef(false)
  const leadRef = useRef<Lead | null>(null)
  useEffect(() => { leadRef.current = lead })

  // Seed prior watch-time when the lead becomes known; load the Typeform SDK.
  useEffect(() => {
    if (!lead) return
    try {
      const w = JSON.parse(localStorage.getItem(`vsl_watch_${lead.email}`) || '{}')
      const s = Number(w?.seconds) || 0
      secondsRef.current = s
      completedRef.current = Boolean(w?.completed)
      setSeed(s)
      if (s >= revealSeconds || w?.completed) { revealedRef.current = true; setRevealed(true) }
    } catch { /* noop */ }

    loadScript('https://embed.typeform.com/next/embed.js', 'tf-embed-js')
    if (!document.getElementById('tf-embed-css')) {
      const link = document.createElement('link')
      link.id = 'tf-embed-css'; link.rel = 'stylesheet'
      link.href = 'https://embed.typeform.com/next/css/popup.css'
      document.head.appendChild(link)
    }
  }, [lead, revealSeconds])

  const sync = useCallback((opts: { force?: boolean } = {}) => {
    const l = leadRef.current
    if (!l) return
    const now = Date.now()
    if (!opts.force && now - lastSyncRef.current < 30000) return
    lastSyncRef.current = now
    const payload = JSON.stringify({ email: l.email, seconds: secondsRef.current, completed: completedRef.current })
    try {
      if (navigator.sendBeacon) {
        navigator.sendBeacon('/api/lp/watch-progress', new Blob([payload], { type: 'application/json' }))
      } else {
        fetch('/api/lp/watch-progress', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: payload, keepalive: true })
      }
    } catch { /* noop */ }
  }, [])

  // Player progress callback — runs ~1×/sec while playing.
  const onWatched = useCallback((cumulative: number, meta: { completed: boolean }) => {
    secondsRef.current = cumulative
    if (meta.completed) completedRef.current = true
    const l = leadRef.current
    if (l) { try { localStorage.setItem(`vsl_watch_${l.email}`, JSON.stringify({ seconds: cumulative, completed: completedRef.current })) } catch { /* noop */ } }

    if (!revealedRef.current && (cumulative >= revealSeconds || completedRef.current)) {
      revealedRef.current = true
      setRevealed(true)
      sync({ force: true }) // record watched_10min immediately
    } else {
      sync()
    }
  }, [revealSeconds, sync])

  // Flush on tab-hide / unload so nothing is lost.
  useEffect(() => {
    const onHide = () => sync({ force: true })
    const onVis = () => { if (document.visibilityState === 'hidden') sync({ force: true }) }
    window.addEventListener('pagehide', onHide)
    document.addEventListener('visibilitychange', onVis)
    return () => { window.removeEventListener('pagehide', onHide); document.removeEventListener('visibilitychange', onVis) }
  }, [sync])

  const bookCall = useCallback(() => {
    const l = leadRef.current
    type TfPopup = { open: () => void }
    type Tf = { createPopup: (id: string, opts: unknown) => TfPopup }
    const tf = (window as unknown as { tf?: Tf }).tf
    const hidden = { email: l?.email || '', name: l?.name || '' }
    if (tf?.createPopup) {
      tf.createPopup(formId, { hidden, size: 100, onSubmit: () => setBooked(true) }).open()
    } else {
      const q = new URLSearchParams(hidden).toString()
      window.open(`https://form.typeform.com/to/${formId}#${q}`, '_blank', 'noopener')
    }
  }, [formId])

  return { seed, revealed, booked, onWatched, bookCall }
}
