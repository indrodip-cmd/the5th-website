import { NextRequest, NextResponse } from 'next/server'
import { limit, clientIp } from '@/lib/rateLimit'
import { isValidEmail, sanitizeText } from '@/lib/validation'
import { identify } from '@/lib/identity'

export const dynamic = 'force-dynamic'

/* Public identity link: called by the site when a visitor identifies themselves
   (e.g. after entering an email). Links the anonymous a5_vid → contact and
   merges their journey. Rate-limited; fails soft. */
export async function POST(req: NextRequest) {
  const ip = clientIp(req)
  const rl = await limit(`identify:ip:${ip}`, 30, 600)
  if (!rl.ok) return NextResponse.json({ ok: true }) // silently drop

  const body = await req.json().catch(() => null)
  const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : ''
  const visitorId = sanitizeText(body?.visitor_id, 64)
  if (!isValidEmail(email) || !visitorId) return NextResponse.json({ ok: false }, { status: 400 })

  await identify({
    visitorId, email,
    phone: sanitizeText(body?.phone, 40) || undefined,
    name: sanitizeText(body?.name, 120) || undefined,
    source: 'web',
  })
  return NextResponse.json({ ok: true })
}
