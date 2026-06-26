/* Input validation + sanitization. Never trust client input. */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const CONTROL_RE = new RegExp('[\u0000-\u001F\u007F]', 'g')

export function isValidEmail(email: unknown): email is string {
  return typeof email === 'string' && email.length <= 254 && EMAIL_RE.test(email.trim())
}

/* Strip control characters and clamp length. Used on every free-text field
   before it ever reaches the AI prompt (limits token abuse + injection surface). */
export function sanitizeText(value: unknown, maxLen = 800): string {
  if (typeof value !== 'string') return ''
  return value.replace(CONTROL_RE, ' ').replace(/\s{3,}/g, '  ').trim().slice(0, maxLen)
}

export function sanitizeName(value: unknown): string {
  return sanitizeText(value, 80)
}

/* Sanitize a quiz-answers object: keep only sane answer ids, clamp every value.
   Drops anything that is not a short string or array of short strings. */
export function sanitizeAnswers(input: unknown, maxKeys = 60): Record<string, string | string[]> {
  const out: Record<string, string | string[]> = {}
  if (!input || typeof input !== 'object') return out
  let n = 0
  for (const [k, v] of Object.entries(input as Record<string, unknown>)) {
    if (n++ >= maxKeys) break
    if (!/^[a-zA-Z0-9_]{1,24}$/.test(k)) continue
    if (Array.isArray(v)) {
      out[k] = v.slice(0, 24).map((x) => sanitizeText(x, 120))
    } else if (typeof v === 'string') {
      out[k] = sanitizeText(v, 1200)
    }
  }
  return out
}
