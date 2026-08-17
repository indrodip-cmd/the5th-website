import { NextRequest, NextResponse } from 'next/server'
import { limit, clientIp } from '@/lib/rateLimit'
import { isValidEmail, sanitizeAnswers } from '@/lib/validation'
import { saveDeep, getAuditStatus } from '@/lib/roadmap-audit'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/* Save the post-payment deep diagnostic. Guarded: only a paid lead can write
   deep answers (so this can't be used to spam the CRM). */
export async function POST(req: NextRequest) {
  const ip = clientIp(req)
  const rl = await limit(`audit-deep:ip:${ip}`, 30, 600)
  if (!rl.ok) return NextResponse.json({ error: 'Too many attempts.' }, { status: 429 })

  try {
    const body = await req.json().catch(() => ({}))
    const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : ''
    if (!isValidEmail(email)) return NextResponse.json({ error: 'invalid_email' }, { status: 400 })

    const status = await getAuditStatus(email)
    if (!status.paid) return NextResponse.json({ error: 'not_paid' }, { status: 402 })

    const answers = sanitizeAnswers(body?.answers)
    const res = await saveDeep(email, answers)
    return NextResponse.json({ ok: res.ok })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
