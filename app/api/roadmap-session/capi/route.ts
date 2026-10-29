import { NextRequest, NextResponse } from 'next/server'
import { limit, clientIp } from '@/lib/rateLimit'
import { sendCapiEvent } from '@/lib/meta-capi'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const ALLOWED = new Set(['PageView', 'ViewContent', 'QuizStart'])

/* Generic CAPI relay for the top-of-funnel events that have no email yet
   (PageView, ViewContent at 50% scroll, QuizStart). Lead/SubmitApplication/
   Schedule fire from their own routes, which already have the email in hand. */
export async function POST(req: NextRequest) {
  const ip = clientIp(req)
  const rl = await limit(`rs-capi:ip:${ip}`, 60, 600)
  if (!rl.ok) return NextResponse.json({ ok: false }, { status: 429 })

  try {
    const body = await req.json().catch(() => ({}))
    const eventName = typeof body?.eventName === 'string' ? body.eventName : ''
    if (!ALLOWED.has(eventName)) return NextResponse.json({ ok: false, error: 'event_not_allowed' }, { status: 400 })
    const eventId = typeof body?.eventId === 'string' ? body.eventId.slice(0, 80) : `rs-${eventName}-${Date.now()}`
    const fbp = typeof body?.fbp === 'string' ? body.fbp.slice(0, 120) : null
    const fbc = typeof body?.fbc === 'string' ? body.fbc.slice(0, 120) : null

    const res = await sendCapiEvent({
      eventName: eventName as 'PageView' | 'ViewContent' | 'QuizStart',
      eventId, sourceUrl: typeof body?.pageUrl === 'string' ? body.pageUrl : '',
      user: { fbp, fbc, clientIp: ip, userAgent: req.headers.get('user-agent') },
    })
    return NextResponse.json(res)
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
