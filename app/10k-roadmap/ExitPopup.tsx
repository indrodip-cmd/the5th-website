'use client'
/* Desktop-only "before you go" popup for the $29 audit page.

   Opens at most once per browser session, when either:
     - the cursor leaves the top of the window (heading for a tab, the
       address bar or the close button), or
     - the visitor has been completely still for 10 seconds (no mouse,
       scroll, key or touch) AND is not watching a video. A video counts as
       "being watched" when the cursor is over an iframe, an iframe holds
       keyboard focus (they clicked play inside it), or a native <video> is
       playing; the 10 seconds restart after the last moment any of those
       was true.

   Touch/mobile devices never see it: a media query on width, hover and
   pointer plus a device-type check, so phones, tablets (including iPad in
   landscape) and phones in "desktop site" mode are all excluded.
   Plain CSS animation only (no animation library, no backdrop-filter): both
   have caused real-device render failures on this page before. */
import { useCallback, useEffect, useRef, useState } from 'react'
import { AUDIT_CHECKOUT_URL } from './config'
import { track } from './track'

const IDLE_MS = 10_000
const ARM_MS = 5_000
const SEEN_KEY = 'audit_exit_popup_seen'
const LIME = '#C9FF48'

export default function ExitPopup() {
  const [open, setOpen] = useState(false)
  const closeRef = useRef<HTMLButtonElement | null>(null)
  const ctaRef = useRef<HTMLAnchorElement | null>(null)
  const returnFocus = useRef<HTMLElement | null>(null)

  const close = useCallback(() => {
    setOpen(false)
    track('exit_popup_closed')
  }, [])

  useEffect(() => {
    let seen = false
    try { seen = sessionStorage.getItem(SEEN_KEY) === '1' } catch { /* noop */ }
    if (seen) return
    const desktop = window.matchMedia('(min-width: 1024px) and (hover: hover) and (pointer: fine)')
    // Second, independent guard: phones and tablets are excluded by device
    // type too (iPadOS reports itself as a Mac, hence the touch-points test),
    // so a phone in "desktop site" mode can never slip through on width alone.
    const nav = navigator as Navigator & { userAgentData?: { mobile?: boolean } }
    const touchDevice = nav.userAgentData?.mobile === true
      || /Android|iPhone|iPad|iPod|Mobile|Silk|Tablet/i.test(navigator.userAgent)
      || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
    if (touchDevice) return

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
      track('exit_popup_shown', { why })
      setOpen(true)
    }

    const bump = () => { lastActivity = Date.now() }
    const onOver = (e: MouseEvent) => { overIframe = (e.target as Element | null)?.tagName === 'IFRAME' }
    const onBlur = () => setTimeout(() => { iframeFocused = document.activeElement?.tagName === 'IFRAME' }, 0)
    const onFocus = () => { iframeFocused = false }
    const onOut = (e: MouseEvent) => { if (armed && !e.relatedTarget && e.clientY <= 0) fire('exit') }
    const videoPlaying = () => Array.from(document.querySelectorAll('video')).some((v) => !v.paused && !v.ended)

    const armTimer = setTimeout(() => { armed = true }, ARM_MS)
    const tick = setInterval(() => {
      const now = Date.now()
      if (overIframe || iframeFocused || videoPlaying()) lastVideo = now
      if (document.visibilityState !== 'visible') { lastActivity = now; return }
      if (now - lastActivity >= IDLE_MS && now - lastVideo >= IDLE_MS) fire('idle')
    }, 1000)

    const acts: (keyof WindowEventMap)[] = ['mousemove', 'mousedown', 'keydown', 'scroll', 'wheel', 'touchstart']
    acts.forEach((a) => window.addEventListener(a, bump, { passive: true, capture: true }))
    document.addEventListener('mouseover', onOver)
    document.addEventListener('mouseout', onOut)
    window.addEventListener('blur', onBlur)
    window.addEventListener('focus', onFocus)
    return () => {
      clearTimeout(armTimer); clearInterval(tick)
      acts.forEach((a) => window.removeEventListener(a, bump, { capture: true }))
      document.removeEventListener('mouseover', onOver)
      document.removeEventListener('mouseout', onOut)
      window.removeEventListener('blur', onBlur)
      window.removeEventListener('focus', onFocus)
    }
  }, [])

  useEffect(() => {
    if (!open) return
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeRef.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.preventDefault(); close(); return }
      if (e.key !== 'Tab') return
      const first = closeRef.current, last = ctaRef.current
      if (!first || !last) return
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus() }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
      returnFocus.current?.focus?.()
    }
  }, [open, close])

  if (!open) return null

  return (
    <div className="xp-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) close() }}>
      <style>{`
        .xp-overlay{position:fixed;inset:0;z-index:2147483000;background:rgba(4,6,3,.78);display:flex;align-items:center;justify-content:center;padding:24px;animation:xp-fade .22s ease-out}
        .xp-card{position:relative;width:100%;max-width:560px;max-height:calc(100dvh - 48px);overflow:auto;background:#0E130C;border:1px solid rgba(201,255,72,.3);border-radius:24px;padding:30px 30px 24px;color:#F2F6EC;font-family:'Inter',system-ui,-apple-system,'Segoe UI',Roboto,sans-serif;box-shadow:0 40px 90px -30px rgba(0,0,0,.8);animation:xp-rise .3s cubic-bezier(.16,1,.3,1)}
        .xp-x{position:absolute;top:14px;right:14px;width:38px;height:38px;border-radius:50%;border:1px solid rgba(255,255,255,.2);background:rgba(255,255,255,.06);color:#F2F6EC;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:background .15s,border-color .15s}
        .xp-x:hover{background:rgba(255,255,255,.14);border-color:rgba(255,255,255,.4)}
        .xp-x:focus-visible,.xp-cta:focus-visible{outline:2px solid ${LIME};outline-offset:3px}
        .xp-eyebrow{font-size:12px;font-weight:700;letter-spacing:.2em;text-transform:uppercase;color:${LIME};margin:0 0 10px;padding-right:44px}
        .xp-title{font-family:'Plus Jakarta Sans','Inter',system-ui,sans-serif;font-weight:800;font-size:clamp(26px,3vw,34px);line-height:1.1;letter-spacing:-.02em;margin:0 0 18px;text-wrap:balance}
        .xp-title em{font-style:normal;color:${LIME}}
        .xp-cups{position:relative;background:#F4EEE0;border-radius:16px;padding:20px 22px 34px}
        .xp-cups img{display:block;width:100%;height:auto}
        .xp-tag{position:absolute;left:50%;bottom:-16px;transform:translateX(-50%);white-space:nowrap;background:${LIME};color:#0B0F08;font-weight:800;font-size:14px;padding:9px 18px;border-radius:999px;box-shadow:0 10px 24px -10px rgba(201,255,72,.6)}
        .xp-vs{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:34px 0 0}
        .xp-vs div{border:1px solid rgba(255,255,255,.14);border-radius:14px;padding:14px 16px;background:rgba(255,255,255,.04)}
        .xp-vs div.xp-win{border-color:rgba(201,255,72,.4);background:rgba(201,255,72,.08)}
        .xp-vs b{display:block;font-size:15px;margin-bottom:4px}
        .xp-vs div.xp-win b{color:${LIME}}
        .xp-vs p{margin:0;font-size:14px;line-height:1.45;color:#B9C4B5}
        .xp-ask{margin:18px 0 16px;font-size:16px;font-weight:700;text-align:center}
        .xp-cta{display:flex;align-items:center;justify-content:center;gap:8px;width:100%;box-sizing:border-box;background:${LIME};color:#0B0F08;font-weight:800;font-size:16.5px;text-decoration:none;padding:16px 24px;border-radius:999px;box-shadow:0 14px 30px -14px rgba(201,255,72,.55);transition:transform .2s,filter .2s}
        .xp-cta:hover{transform:translateY(-2px);filter:brightness(1.06)}
        .xp-micro{margin:12px 0 0;text-align:center;font-size:12px;color:#8E9B8B}
        @keyframes xp-fade{from{opacity:0}to{opacity:1}}
        @keyframes xp-rise{from{opacity:0;transform:translateY(14px) scale(.98)}to{opacity:1;transform:none}}
        @media (prefers-reduced-motion:reduce){.xp-overlay,.xp-card{animation:none}.xp-cta{transition:none}}
      `}</style>
      <div className="xp-card" role="dialog" aria-modal="true" aria-labelledby="xp-title">
        <button ref={closeRef} type="button" className="xp-x" aria-label="Close" onClick={close}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden><path d="M5 5l14 14M19 5L5 19" /></svg>
        </button>
        <p className="xp-eyebrow">Wait, before you go</p>
        <h2 id="xp-title" className="xp-title">$29 is about the price of <em>4 Venti Lattes.</em></h2>
        <div className="xp-cups">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/four-venti-lattes.webp" alt="Four Venti lattes" width={1000} height={395} />
          <span className="xp-tag">4 Venti Lattes ≈ $29</span>
        </div>
        <div className="xp-vs">
          <div><b>4 coffees</b><p>A boost for a few hours.</p></div>
          <div className="xp-win"><b>1 business audit</b><p>Shows what is holding your business back and what to fix next.</p></div>
        </div>
        <p className="xp-ask">Four coffees, or one step toward a better business?</p>
        <a ref={ctaRef} className="xp-cta" href={AUDIT_CHECKOUT_URL} onClick={() => track('cta_click', { where: 'exit_popup' })}>
          Get My $29 Business Audit <span aria-hidden>→</span>
        </a>
        <p className="xp-micro">Refundable within 7 days. You keep the written plan either way.</p>
      </div>
    </div>
  )
}
