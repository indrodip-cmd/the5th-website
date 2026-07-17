'use client'
/* Client helper: fetch a reCAPTCHA v3 token for a given action. Returns null
   when reCAPTCHA isn't configured/loaded (the server verifier then fails open),
   so forms keep working before keys are set. */
export const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || ''

type Grecaptcha = {
  ready: (cb: () => void) => void
  execute: (siteKey: string, opts: { action: string }) => Promise<string>
}

export function getRecaptchaToken(action: string): Promise<string | null> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !RECAPTCHA_SITE_KEY) return resolve(null)
    const g = (window as unknown as { grecaptcha?: Grecaptcha }).grecaptcha
    if (!g?.execute) return resolve(null)
    try {
      g.ready(() => {
        g.execute(RECAPTCHA_SITE_KEY, { action }).then((t) => resolve(t)).catch(() => resolve(null))
      })
    } catch {
      resolve(null)
    }
  })
}
