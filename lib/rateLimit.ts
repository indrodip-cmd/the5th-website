/* Lightweight fixed-window rate limiter.
   In-memory (per serverless instance). Vercel Fluid Compute reuses instances,
   so this meaningfully blunts bursts/abuse. For strict global limits across
   all instances, back this with Upstash Redis (see UPSTASH note below) — the
   public API stays the same. */

type Bucket = { count: number; reset: number }
const buckets = new Map<string, Bucket>()
let lastSweep = 0

function sweep(now: number) {
  // Occasionally drop expired buckets so the map can't grow unbounded.
  if (now - lastSweep < 60_000) return
  lastSweep = now
  for (const [k, b] of buckets) if (now > b.reset) buckets.delete(k)
}

export interface RateLimitResult {
  ok: boolean
  remaining: number
  retryAfter: number // seconds until the window resets
}

export function rateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now()
  sweep(now)
  const b = buckets.get(key)
  if (!b || now > b.reset) {
    buckets.set(key, { count: 1, reset: now + windowMs })
    return { ok: true, remaining: limit - 1, retryAfter: 0 }
  }
  if (b.count >= limit) {
    return { ok: false, remaining: 0, retryAfter: Math.ceil((b.reset - now) / 1000) }
  }
  b.count++
  return { ok: true, remaining: limit - b.count, retryAfter: 0 }
}

/* Best-effort client IP from proxy headers (Vercel sets x-forwarded-for). */
export function clientIp(req: Request): string {
  const xff = req.headers.get('x-forwarded-for') || ''
  return (xff.split(',')[0] || req.headers.get('x-real-ip') || 'unknown').trim()
}
