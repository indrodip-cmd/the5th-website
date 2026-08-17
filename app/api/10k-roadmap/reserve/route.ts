import { NextRequest, NextResponse } from 'next/server'
import { limit, clientIp } from '@/lib/rateLimit'
import { isValidEmail, sanitizeName, sanitizeAnswers } from '@/lib/validation'
import { saveApplication } from '@/lib/roadmap-audit'
import { QUALIFICATION } from '@/app/10k-roadmap/config'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/* Save the qualification answers + contact at the deposit step. Re-derives the
   verdict server-side from the answers (never trust the client) so a forged
   "qualified" can't sneak a rejected applicant into checkout. */
function verdictFrom(answers: Record<string, string | string[]>): { verdict: 'qualified' | 'rejected'; reason: string | null } {
  for (const q of QUALIFICATION) {
    if (!('options' in q)) continue
    const val = answers[q.id]
    const hit = q.options.find((o) => o.reject && (Array.isArray(val) ? val.includes(o.value) : val === o.value))
    if (hit) return { verdict: 'rejected', reason: q.id === 'business_type' ? 'no_business' : q.id === 'readiness' ? 'free_advice' : 'default' }
  }
  return { verdict: 'qualified', reason: null }
}

export async function POST(req: NextRequest) {
  const ip = clientIp(req)
  const rl = await limit(`audit-reserve:ip:${ip}`, 20, 600)
  if (!rl.ok) return NextResponse.json({ error: 'Too many attempts. Please wait a moment.' }, { status: 429 })

  try {
    const body = await req.json().catch(() => ({}))
    const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : ''
    const name = sanitizeName(body?.name)
    const phone = typeof body?.phone === 'string' ? body.phone.slice(0, 40) : null
    if (!isValidEmail(email)) return NextResponse.json({ error: 'Please enter a valid email.' }, { status: 400 })

    const qualification = sanitizeAnswers(body?.qualification)
    const { verdict, reason } = verdictFrom(qualification)

    let city: string | null = null
    try { city = decodeURIComponent(req.headers.get('x-vercel-ip-city') || '') || null } catch { city = req.headers.get('x-vercel-ip-city') }
    const country = req.headers.get('x-vercel-ip-country') || null

    const res = await saveApplication({
      name, email, phone, city, country,
      visitorId: typeof body?.audit_id === 'string' ? body.audit_id : null,
      utm: body?.utm && typeof body.utm === 'object' ? body.utm : {},
      qualification, verdict, reject_reason: reason,
    })
    if (!res.ok) return NextResponse.json({ error: 'Could not save. Please try again.' }, { status: 400 })
    return NextResponse.json({ ok: true, verdict })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
