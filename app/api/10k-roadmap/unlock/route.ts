import { NextRequest, NextResponse } from 'next/server'
import { limit, clientIp } from '@/lib/rateLimit'
import { isValidEmail } from '@/lib/validation'
import { getAuditStatus, signPaidPass, AUDIT_PAID_COOKIE } from '@/lib/roadmap-audit'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/* Verify payment against the DB (set by the Whop webhook) and, if paid, hand the
   browser the signed HttpOnly pass that unlocks Steps 3-5. This is the only way
   to obtain the pass, so the gated pages are genuinely payment-gated. */
export async function POST(req: NextRequest) {
  const ip = clientIp(req)
  const rl = await limit(`audit-unlock:ip:${ip}`, 60, 600)
  if (!rl.ok) return NextResponse.json({ paid: false }, { status: 429 })

  const body = await req.json().catch(() => ({}))
  const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : ''
  if (!isValidEmail(email)) return NextResponse.json({ paid: false }, { status: 400 })

  const status = await getAuditStatus(email)
  if (!status.paid) return NextResponse.json({ paid: false, booked: status.booked })

  const res = NextResponse.json({ paid: true, booked: status.booked, name: status.name })
  res.cookies.set(AUDIT_PAID_COOKIE, signPaidPass(email), {
    httpOnly: true, secure: true, sameSite: 'lax', path: '/10k-roadmap', maxAge: 60 * 60 * 24,
  })
  return res
}
