import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { limit, clientIp } from '@/lib/rateLimit'

/* Public first-party analytics collector. Receives beacons from every page
   (static marketing HTML + the Next app) and records pageviews, scroll depth
   and conversions. Deliberately permissive and fail-soft: analytics must never
   break a page, and a failed insert is silently dropped. */

const EVENT_TYPES = new Set(['pageview', 'scroll', 'conversion'])
const CONTROL_RE = new RegExp('[\u0000-\u001F\u007F]', 'g')

function clampStr(v: unknown, max: number): string | null {
  if (typeof v !== 'string') return null
  const s = v.replace(CONTROL_RE, ' ').trim()
  return s ? s.slice(0, max) : null
}

export async function POST(req: NextRequest) {
  try {
    // sendBeacon posts as text/plain, so read the raw body and parse ourselves.
    const raw = await req.text()
    if (!raw || raw.length > 4000) return NextResponse.json({ ok: false }, { status: 400 })
    let body: Record<string, unknown>
    try { body = JSON.parse(raw) } catch { return NextResponse.json({ ok: false }, { status: 400 }) }

    const eventType = typeof body.event_type === 'string' ? body.event_type : ''
    if (!EVENT_TYPES.has(eventType)) return NextResponse.json({ ok: false }, { status: 400 })

    // Cheap abuse guard: cap events per IP. Fail-open on limiter errors.
    const ip = clientIp(req)
    const lim = await limit(`track:ip:${ip}`, 600, 600)
    if (!lim.ok) return NextResponse.json({ ok: true }) // silently drop, don't error the client

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ ok: true })
    }

    let scrollPct: number | null = null
    if (body.scroll_pct != null) {
      const n = Math.round(Number(body.scroll_pct))
      if (Number.isFinite(n)) scrollPct = Math.min(Math.max(n, 0), 100)
    }

    const row = {
      visitor_id: clampStr(body.visitor_id, 64),
      session_id: clampStr(body.session_id, 64),
      event_type: eventType,
      path: clampStr(body.path, 512),
      referrer: clampStr(body.referrer, 512),
      scroll_pct: scrollPct,
      meta: body.meta && typeof body.meta === 'object' ? body.meta : null,
      user_agent: clampStr(req.headers.get('user-agent'), 512),
    }

    await getSupabaseAdmin().from('analytics_events').insert(row)
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('track: unhandled', err)
    return NextResponse.json({ ok: true }) // never surface tracking errors to the page
  }
}
