/* Distributed rate limiting.
   Uses Upstash Redis (REST) when configured — a true global limit across all
   serverless instances. Falls back to per-instance in-memory limiting when
   Upstash env is absent, so the app is never blocked by missing config.

   Env to activate Upstash:
     UPSTASH_REDIS_REST_URL
     UPSTASH_REDIS_REST_TOKEN
*/

export interface RateLimitResult {
  ok: boolean
  remaining: number
  retryAfter: number // seconds until the window resets
}

/* ── In-memory fallback (per instance) ── */
type Bucket = { count: number; reset: number }
const buckets = new Map<string, Bucket>()
let lastSweep = 0
function memLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now()
  if (now - lastSweep > 60_000) { lastSweep = now; for (const [k, b] of buckets) if (now > b.reset) buckets.delete(k) }
  const b = buckets.get(key)
  if (!b || now > b.reset) { buckets.set(key, { count: 1, reset: now + windowMs }); return { ok: true, remaining: limit - 1, retryAfter: 0 } }
  if (b.count >= limit) return { ok: false, remaining: 0, retryAfter: Math.ceil((b.reset - now) / 1000) }
  b.count++
  return { ok: true, remaining: limit - b.count, retryAfter: 0 }
}

/* ── Upstash (global) via REST: INCR then EXPIRE on first hit ── */
const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN

async function upstashLimit(key: string, limit: number, windowSec: number): Promise<RateLimitResult> {
  try {
    // Pipeline: INCR <key>; EXPIRE <key> <window> NX
    const res = await fetch(`${UPSTASH_URL}/pipeline`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${UPSTASH_TOKEN}`, 'Content-Type': 'application/json' },
      body: JSON.stringify([['INCR', key], ['EXPIRE', key, String(windowSec), 'NX'], ['TTL', key]]),
      cache: 'no-store',
    })
    if (!res.ok) return memLimit(key, limit, windowSec * 1000)
    const out = await res.json() as Array<{ result: number }>
    const count = Number(out?.[0]?.result ?? 1)
    const ttl = Number(out?.[2]?.result ?? windowSec)
    if (count > limit) return { ok: false, remaining: 0, retryAfter: ttl > 0 ? ttl : windowSec }
    return { ok: true, remaining: Math.max(0, limit - count), retryAfter: 0 }
  } catch {
    return memLimit(key, limit, windowSec * 1000)
  }
}

/* Single async entry point. windowSec in seconds. */
export async function limit(key: string, max: number, windowSec: number): Promise<RateLimitResult> {
  if (UPSTASH_URL && UPSTASH_TOKEN) return upstashLimit(key, max, windowSec)
  return memLimit(key, max, windowSec * 1000)
}

/* Best-effort client IP from proxy headers (Vercel sets x-forwarded-for). */
export function clientIp(req: Request): string {
  const xff = req.headers.get('x-forwarded-for') || ''
  return (xff.split(',')[0] || req.headers.get('x-real-ip') || 'unknown').trim()
}
