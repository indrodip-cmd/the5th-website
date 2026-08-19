'use client'
/* Funnel event tracking — one clean dispatcher for the whole audit funnel.

   Every funnel event flows through track(name, meta). It fans out to:
     • Google Analytics (gtag) + dataLayer  — for GA4 / GTM
     • Vercel Analytics (window.va)          — custom events
     • Whop Pixel (lib/whop)                 — for the conversion events that map
   All calls are guarded: tracking must never throw or block the funnel. */
import { whopTrack } from '@/lib/whop'

export type AuditEvent =
  | 'page_view' | 'vsl_play' | 'vsl_25' | 'vsl_50' | 'vsl_75' | 'vsl_complete'
  | 'cta_click' | 'qualification_started' | 'qualification_completed'
  | 'qualification_accepted' | 'qualification_rejected'
  | 'checkout_started' | 'payment_success' | 'payment_failed'
  | 'deep_application_started' | 'deep_application_completed'
  | 'calendar_viewed' | 'calendar_time_selected' | 'booking_completed'
  | 'success_page_viewed' | 'calendar_google_clicked' | 'calendar_apple_clicked' | 'calendar_outlook_clicked'
  | 'meeting_link_clicked' | 'thankyou_save_clicked'

// Whop pixel events are a fixed vocabulary — map ours onto theirs where it fits.
const WHOP_MAP: Partial<Record<AuditEvent, string>> = {
  qualification_started: 'lead',
  qualification_accepted: 'quiz_completed',
  checkout_started: 'complete_registration',
  calendar_time_selected: 'schedule',
  booking_completed: 'schedule',
}

type Meta = Record<string, unknown>

export function track(event: AuditEvent, meta: Meta = {}): void {
  if (typeof window === 'undefined') return
  const w = window as unknown as {
    gtag?: (...a: unknown[]) => void
    dataLayer?: unknown[]
    va?: (...a: unknown[]) => void
  }
  try { w.gtag?.('event', event, { funnel: '10k_roadmap_audit', ...meta }) } catch { /* noop */ }
  try { (w.dataLayer = w.dataLayer || []).push({ event: `audit_${event}`, ...meta }) } catch { /* noop */ }
  try { w.va?.('event', { name: `audit_${event}`, ...meta }) } catch { /* noop */ }
  const whopEvent = WHOP_MAP[event]
  if (whopEvent) { try { whopTrack(whopEvent, meta as { value?: number; currency?: string }) } catch { /* noop */ } }
}
