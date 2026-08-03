/* Whop Pixel conversion-event helper.

   The global `whop` object is defined by the pixel snippet installed in the
   global <head> (app/layout.tsx for app-router pages, public/*.html for the
   static pages). The snippet exposes whop.track(name, params?) and queues
   events synchronously, so this is safe to call any time after page load.

   Guarded so it never throws if the pixel is blocked (ad-blockers) or absent.
   Purchases/subscriptions are recorded by Whop server-side — never fire those.

   Usage:
     whopTrack('lead')
     whopTrack('schedule')
     whopTrack('quiz_completed', { value: 25, currency: 'USD' }) // value optional
*/
type WhopParams = { value?: number; currency?: string } & Record<string, unknown>

type WhopGlobal = { track: (event: string, params?: WhopParams) => void }

export function whopTrack(event: string, params?: WhopParams): void {
  if (typeof window === 'undefined') return
  try {
    const whop = (window as unknown as { whop?: WhopGlobal }).whop
    if (whop && typeof whop.track === 'function') {
      if (params) whop.track(event, params)
      else whop.track(event)
    }
  } catch {
    /* pixel unavailable — never let tracking break the funnel */
  }
}
