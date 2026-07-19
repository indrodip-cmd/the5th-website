import { NextRequest, NextResponse } from 'next/server'
import { limit, clientIp } from '@/lib/rateLimit'
import { isValidEmail } from '@/lib/validation'
import { upsertContact, logActivity } from '@/lib/crm'
import { emitEvent } from '@/lib/events'
import { identify } from '@/lib/identity'

export const dynamic = 'force-dynamic'

/* Results-page access gate. A visitor enters their name + email to unlock the
   Case Study Library; we record them in the native CRM as a "Results page
   visitor" so the team sees who's browsing proof, and the identity flows into
   Carolina + the site-wide personalization layer. */
export async function POST(req: NextRequest) {
  const ip = clientIp(req)
  const gate = await limit(`results:ip:${ip}`, 20, 600)
  if (!gate.ok) {
    return NextResponse.json({ error: 'Too many attempts. Please wait a moment.' }, { status: 429, headers: { 'Retry-After': String(gate.retryAfter) } })
  }

  try {
    const body = await req.json().catch(() => ({}))
    const name = typeof body?.name === 'string' ? body.name.trim().slice(0, 80) : ''
    const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase().slice(0, 160) : ''
    const visitorId = typeof body?.visitor_id === 'string' ? body.visitor_id.slice(0, 80) : ''

    if (!isValidEmail(email)) {
      return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 })
    }

    await upsertContact(email, {
      name: name || null,
      source: 'results_page',
      tags: ['results_page', 'case_studies'],
    })
    await logActivity(email, 'lead', 'Unlocked the Case Study Library', 'Source: Results page access gate')
    emitEvent('lead_captured', { email, name, source: 'results_page' })
    if (visitorId) identify({ visitorId, email, name: name || undefined, source: 'results_page' }).catch(() => {})

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
