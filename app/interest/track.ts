'use client'
/* Interest-page analytics dispatcher. One entry point; fans out to whatever is
   already on the site and never throws:
     • Google Analytics (gtag) + dataLayer
     • Vercel Analytics (window.va custom events)
     • First-party collector (/api/track) via sendBeacon, mapped onto the
       collector's existing pageview/quiz/conversion vocabulary.
   Tracking must never block or break the form. */

export type InterestEvent =
  | 'interest_page_view'
  | 'interest_form_started'
  | 'interest_step_completed'
  | 'interest_form_abandoned'
  | 'interest_form_submitted'

type Meta = Record<string, unknown>

/* Map our funnel events onto the collector's allowed event_type set
   (see app/api/track/route.ts EVENT_TYPES). */
const BEACON_MAP: Record<InterestEvent, string | null> = {
  interest_page_view: 'pageview',
  interest_form_started: 'quiz_start',
  interest_step_completed: 'quiz_progress',
  interest_form_abandoned: null, // fire-and-forget custom only
  interest_form_submitted: 'conversion',
}

function beacon(eventType: string, meta: Meta) {
  try {
    const payload = JSON.stringify({
      event_type: eventType,
      path: typeof location !== 'undefined' ? location.pathname : undefined,
      meta: { funnel: 'interest_registration', ...meta },
    })
    if (navigator.sendBeacon) {
      navigator.sendBeacon('/api/track', new Blob([payload], { type: 'text/plain' }))
    } else {
      fetch('/api/track', { method: 'POST', body: payload, keepalive: true }).catch(() => {})
    }
  } catch { /* noop */ }
}

export function track(event: InterestEvent, meta: Meta = {}): void {
  if (typeof window === 'undefined') return
  const w = window as unknown as {
    gtag?: (...a: unknown[]) => void
    dataLayer?: unknown[]
    va?: (...a: unknown[]) => void
  }
  try { w.gtag?.('event', event, { funnel: 'interest_registration', ...meta }) } catch { /* noop */ }
  try { (w.dataLayer = w.dataLayer || []).push({ event, ...meta }) } catch { /* noop */ }
  try { w.va?.('event', { name: event, ...meta }) } catch { /* noop */ }

  const mapped = BEACON_MAP[event]
  if (mapped) beacon(mapped, meta)
}
