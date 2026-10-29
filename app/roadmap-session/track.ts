'use client'
/* Funnel event tracking for /roadmap-session. Fires:
     • Meta Pixel (fbq) client-side, when NEXT_PUBLIC_META_PIXEL_ID is set
       (loaded once by <PixelScript/> in layout.tsx)
     • Server-side Conversions API for the same event_id (dedup), via
       /api/roadmap-session/capi for top-of-funnel events; Lead /
       SubmitApplication / Schedule fire server-side from their own routes
       and this file only mirrors them to the client pixel.
     • GA (gtag) + dataLayer + Vercel Analytics, same as every other funnel.
   Every call is guarded — tracking must never throw or block the funnel. */
import { getVisitorId, useFbpFbc } from './ui'

export type RsEvent = 'PageView' | 'ViewContent' | 'QuizStart' | 'Lead' | 'SubmitApplication' | 'Schedule' | 'cta_click'
const STANDARD = new Set(['PageView', 'ViewContent', 'QuizStart', 'Lead', 'SubmitApplication', 'Schedule'])
const CAPI_ROUTE_EVENTS = new Set(['PageView', 'ViewContent', 'QuizStart']) // Lead/SubmitApplication/Schedule fire server-side from their own routes

type Meta = Record<string, unknown>

export function track(event: RsEvent, meta: Meta = {}): void {
  if (typeof window === 'undefined') return
  const w = window as unknown as {
    gtag?: (...a: unknown[]) => void
    dataLayer?: unknown[]
    va?: (...a: unknown[]) => void
    fbq?: (...a: unknown[]) => void
  }
  try { w.gtag?.('event', event, { funnel: 'roadmap_session', ...meta }) } catch { /* noop */ }
  try { (w.dataLayer = w.dataLayer || []).push({ event: `rs_${event}`, ...meta }) } catch { /* noop */ }
  try { w.va?.('event', { name: `rs_${event}`, ...meta }) } catch { /* noop */ }

  if (STANDARD.has(event)) {
    const eventId = (meta.eventId as string) || `${event}-${Date.now()}`
    try { w.fbq?.('track', event, meta.value != null ? { value: meta.value, currency: 'USD' } : {}, { eventID: eventId }) } catch { /* noop */ }
    if (CAPI_ROUTE_EVENTS.has(event)) {
      try {
        const fbp = document.cookie.match(/(?:^|; )_fbp=([^;]*)/)?.[1]
        const fbc = document.cookie.match(/(?:^|; )_fbc=([^;]*)/)?.[1]
        fetch('/api/roadmap-session/capi', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ eventName: event, eventId, fbp, fbc, pageUrl: window.location.href }),
        }).catch(() => {})
      } catch { /* noop */ }
    }
  }
}

/* 50% scroll -> ViewContent, once per page view. Attach in a useEffect at
   the call site; returns the cleanup function for that effect. */
export function watchScrollViewContent(onFire: () => void): () => void {
  let fired = false
  const handler = () => {
    if (fired) return
    const pct = window.scrollY / Math.max(1, document.documentElement.scrollHeight - window.innerHeight)
    if (pct >= 0.5) { fired = true; onFire(); window.removeEventListener('scroll', handler) }
  }
  window.addEventListener('scroll', handler, { passive: true })
  return () => window.removeEventListener('scroll', handler)
}

export { getVisitorId, useFbpFbc }
