'use client'

import Image from 'next/image'
import { useCallback, useEffect, useRef, useState } from 'react'
import { track } from '../track'

const IDLE_MS = 10_000
const ARM_MS = 5_000
const SEEN_KEY = 'india_roadmap_pizza_exit_seen'

export default function IndiaExitPopup({ onBook }: { onBook: () => void }) {
  const [open, setOpen] = useState(false)
  const closeRef = useRef<HTMLButtonElement | null>(null)
  const returnFocus = useRef<HTMLElement | null>(null)

  const close = useCallback(() => {
    setOpen(false)
    track('exit_popup_closed', { page: 'india_roadmap' })
  }, [])

  useEffect(() => {
    let seen = false
    try { seen = sessionStorage.getItem(SEEN_KEY) === '1' } catch { /* storage may be unavailable */ }
    if (seen) return

    const desktop = window.matchMedia('(min-width: 1024px) and (hover: hover) and (pointer: fine)')
    const nav = navigator as Navigator & { userAgentData?: { mobile?: boolean } }
    const touchDevice = nav.userAgentData?.mobile === true
      || /Android|iPhone|iPad|iPod|Mobile|Silk|Tablet/i.test(navigator.userAgent)
      || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
    if (touchDevice || !desktop.matches) return

    let done = false
    let armed = false
    let lastActivity = Date.now()
    let lastVideo = 0
    let overIframe = false
    let iframeFocused = false

    const fire = (why: 'exit' | 'idle') => {
      if (done || !desktop.matches) return
      done = true
      returnFocus.current = document.activeElement as HTMLElement | null
      try { sessionStorage.setItem(SEEN_KEY, '1') } catch { /* noop */ }
      track('exit_popup_shown', { page: 'india_roadmap', why })
      setOpen(true)
    }
    const bump = () => { lastActivity = Date.now() }
    const onOver = (event: MouseEvent) => { overIframe = (event.target as Element | null)?.tagName === 'IFRAME' }
    const onBlur = () => window.setTimeout(() => { iframeFocused = document.activeElement?.tagName === 'IFRAME' }, 0)
    const onFocus = () => { iframeFocused = false }
    const onOut = (event: MouseEvent) => { if (armed && !event.relatedTarget && event.clientY <= 0) fire('exit') }
    const videoPlaying = () => Array.from(document.querySelectorAll('video')).some((video) => !video.paused && !video.ended)

    const armTimer = window.setTimeout(() => { armed = true }, ARM_MS)
    const tick = window.setInterval(() => {
      const now = Date.now()
      if (overIframe || iframeFocused || videoPlaying()) lastVideo = now
      if (document.visibilityState !== 'visible') { lastActivity = now; return }
      if (now - lastActivity >= IDLE_MS && now - lastVideo >= IDLE_MS) fire('idle')
    }, 1000)
    const activities: (keyof WindowEventMap)[] = ['mousemove', 'mousedown', 'keydown', 'scroll', 'wheel', 'touchstart']
    activities.forEach((activity) => window.addEventListener(activity, bump, { passive: true, capture: true }))
    document.addEventListener('mouseover', onOver)
    document.addEventListener('mouseout', onOut)
    window.addEventListener('blur', onBlur)
    window.addEventListener('focus', onFocus)

    return () => {
      window.clearTimeout(armTimer)
      window.clearInterval(tick)
      activities.forEach((activity) => window.removeEventListener(activity, bump, { capture: true }))
      document.removeEventListener('mouseover', onOver)
      document.removeEventListener('mouseout', onOut)
      window.removeEventListener('blur', onBlur)
      window.removeEventListener('focus', onFocus)
    }
  }, [])

  useEffect(() => {
    if (!open) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeRef.current?.focus()
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { event.preventDefault(); close(); return }
      if (event.key !== 'Tab') return
      const stops = Array.from(document.querySelectorAll<HTMLElement>('.india-exit__panel button, .india-exit__panel a[href]'))
        .filter((element) => !element.hasAttribute('disabled'))
      const first = stops[0]
      const last = stops[stops.length - 1]
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus() }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus() }
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = previousOverflow
      returnFocus.current?.focus?.()
    }
  }, [open, close])

  if (!open) return null

  return (
    <div className="india-exit" onMouseDown={(event) => { if (event.target === event.currentTarget) close() }}>
      <section className="india-exit__panel" role="dialog" aria-modal="true" aria-labelledby="india-exit-title" aria-describedby="india-exit-copy">
        <button ref={closeRef} className="india-exit__close" type="button" onClick={close} aria-label="Close popup">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" /></svg>
        </button>
        <div className="india-exit__head">
          <p className="india-exit__prelude">Before you go</p>
          <h2 id="india-exit-title">₹199 for your roadmap. <span>₹360 for pizza night.</span></h2>
          <p id="india-exit-copy">One cheese-volcano pizza is about ₹360. Your 60-minute session with both partners includes a personalized 100-day roadmap.</p>
        </div>
        <div className="india-exit__visual">
          <Image
            src="/images/india-cheese-volcano.webp"
            alt="Cheese volcano pizza with a molten cheese centre"
            width={1536}
            height={1024}
            sizes="(max-width: 1100px) 42vw, 420px"
            priority
          />
          <svg className="india-exit__drip" viewBox="0 0 900 72" preserveAspectRatio="none" aria-hidden="true">
            <path d="M0 0h900v24h-96c-14 0-14 30-29 30s-14-18-29-18-15 13-30 13-15-25-30-25h-65c-14 0-14 35-30 35s-15-22-31-22-15 13-30 13-16-26-32-26h-62c-15 0-15 29-30 29s-15-17-30-17-15 11-30 11-15-27-31-27h-62c-15 0-15 34-30 34s-15-19-30-19-16 12-31 12-16-27-32-27H0z" />
          </svg>
          <span className="india-exit__pizza-tag">Cheese-volcano pizza</span>
        </div>
        <div className="india-exit__comparison" aria-label="Price and value comparison">
          <div className="india-exit__choice">
            <div><strong>Pizza night</strong><p>One good meal, enjoyed tonight.</p></div>
            <b>₹360</b>
          </div>
          <div className="india-exit__choice india-exit__choice--session">
            <div><strong>Your strategy session</strong><p>A focused review, plus your written roadmap within 48 hours.</p></div>
            <b>₹199</b>
          </div>
        </div>
        <p className="india-exit__ask">That’s ₹161 less, with a practical plan to take away.</p>
        <button className="btn india-exit__cta" type="button" onClick={onBook}>Book my ₹199 session</button>
        <a className="india-exit__terms" href="/refund#india-roadmap">One-time deposit. Refund terms apply.</a>
      </section>
    </div>
  )
}
