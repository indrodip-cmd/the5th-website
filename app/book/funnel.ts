'use client'
/* Funnel measurement for /book and its checkout/thank-you pages.

   Every event is sent to our own first-party collector (/api/track ->
   analytics_events) enriched with: the visitor's A/B bucket, device class,
   first-touch traffic source and the product. That is what makes every metric
   splittable by variant, device and source in /admin/funnel. The same event is
   also forwarded to GA/dataLayer/Vercel Analytics through the shared track().
   Everything is fail-soft: measurement must never break the page. */
import { track } from '../10k-roadmap/track'
import type { AuditEvent } from '../10k-roadmap/track'
import { EXP_COOKIE, parse, serialize } from '@/lib/funnel/experiments'

export const PRODUCT = 'expertise-to-income'

/* Same keys and format as public/track.js. Creating the id here when it does
   not exist yet (this runs before that script loads) means the very first
   event, the landing view that every rate is divided by, is never anonymous,
   and track.js then reuses the same id. */
function ident(store: Storage, key: string): string {
  try {
    let v = store.getItem(key)
    if (!v) { v = (crypto.randomUUID && crypto.randomUUID()) || String(Date.now()) + Math.random().toString(36).slice(2); store.setItem(key, v) }
    return v
  } catch { return '' }
}

export function getExp(): string {
  try {
    const m = document.cookie.match(new RegExp('(?:^|; )' + EXP_COOKIE + '=([^;]*)'))
    return serialize(parse(m ? decodeURIComponent(m[1]) : ''))
  } catch { return serialize(parse('')) }
}
export const getVariants = () => parse(getExp())

export function device(): 'mobile' | 'tablet' | 'desktop' {
  try {
    const w = window.innerWidth, touch = navigator.maxTouchPoints > 1
    if (w < 700) return 'mobile'
    if (w < 1100 && touch) return 'tablet'
    return 'desktop'
  } catch { return 'desktop' }
}

function source(): { src: string; med: string; camp: string } {
  try {
    const ft = JSON.parse(localStorage.getItem('a5_ft') || '{}')
    const q = new URLSearchParams(location.search)
    const src = q.get('utm_source') || ft.utm_source || ''
    const med = q.get('utm_medium') || ft.utm_medium || ''
    let ref = ''
    if (!src && document.referrer) { try { ref = new URL(document.referrer).hostname.replace(/^www\./, '') } catch { /* noop */ } }
    return { src: src || ref || 'direct', med: med || (ref ? 'referral' : ''), camp: q.get('utm_campaign') || ft.utm_campaign || '' }
  } catch { return { src: 'direct', med: '', camp: '' } }
}

const EVENT_TYPE: Record<string, string> = {
  book_landing_view: 'pricing_view',
  book_section_view: 'pricing_view',
  book_cta_click: 'cta_click',
  book_checkout_view: 'booking_start',
  book_checkout_started: 'booking_start',
  book_bump_toggle: 'cta_click',
  book_lead: 'conversion',
  book_payment_success: 'conversion',
  book_upsell_click: 'cta_click',
}

/* Fire a funnel event. `name` is stored in meta.name; add `value` + `currency`
   for anything with money attached. */
export function ftrack(name: keyof typeof EVENT_TYPE | string, meta: Record<string, unknown> = {}): void {
  if (typeof window === 'undefined') return
  const full = { name, product: PRODUCT, exp: getExp(), device: device(), ...source(), ...meta }
  try { track(name as AuditEvent, full) } catch { /* noop */ }
  try {
    const body = JSON.stringify({
      event_type: EVENT_TYPE[name] || 'cta_click',
      visitor_id: ident(localStorage, 'a5_vid'),
      session_id: ident(sessionStorage, 'a5_sid'),
      path: location.pathname, referrer: document.referrer || '', meta: full,
    })
    if (navigator.sendBeacon) navigator.sendBeacon('/api/track', new Blob([body], { type: 'text/plain' }))
    else fetch('/api/track', { method: 'POST', body, keepalive: true, headers: { 'Content-Type': 'text/plain' } }).catch(() => {})
  } catch { /* noop */ }
}

/* Once-per-pageview guard so a section or a landing view is counted once. */
const once = new Set<string>()
export function ftrackOnce(key: string, name: string, meta: Record<string, unknown> = {}) {
  if (once.has(key)) return
  once.add(key); ftrack(name, meta)
}
