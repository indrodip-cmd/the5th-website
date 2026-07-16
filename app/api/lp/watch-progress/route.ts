import { NextRequest, NextResponse } from 'next/server'
import { limit, clientIp } from '@/lib/rateLimit'
import { isValidEmail } from '@/lib/validation'
import { recordWatchProgress } from '@/lib/lp-funnel'

export const dynamic = 'force-dynamic'

/* Incremental VSL watch-time checkpoint. Called every ~30s AND on tab-close via
   navigator.sendBeacon (Blob, application/json) so partial-watch data is never
   lost. Stores the furthest cumulative watched-seconds and flips the lead to
   watched_10min when the reveal threshold is crossed (idempotent). */
export async function POST(req: NextRequest) {
  const ip = clientIp(req)
  // Generous: a 30-min VSL beacons ~60× + close events. Cap abuse only.
  const rl = await limit(`vsl-watch:ip:${ip}`, 240, 600)
  if (!rl.ok) return NextResponse.json({ ok: false }, { status: 429 })

  try {
    const body = await req.json().catch(() => ({}))
    const email = typeof body?.email === 'string' ? body.email.trim() : ''
    if (!isValidEmail(email)) return NextResponse.json({ ok: false }, { status: 400 })

    const res = await recordWatchProgress({
      email,
      seconds: Number(body?.seconds) || 0,
      completed: Boolean(body?.completed),
    })

    return NextResponse.json(res)
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
