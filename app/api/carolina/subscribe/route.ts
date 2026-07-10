import { NextRequest, NextResponse } from 'next/server'
import { limit, clientIp } from '@/lib/rateLimit'
import { isValidEmail } from '@/lib/validation'
import { upsertContact, logActivity } from '@/lib/crm'
import { identify } from '@/lib/identity'

export const dynamic = 'force-dynamic'

/* Newsletter opt-in from the Carolina Home footer. Saves the email as a
   lead (never blocks the UI on failure). */
export async function POST(req: NextRequest) {
  const ip = clientIp(req)
  const rl = await limit(`carolina:sub:${ip}`, 10, 600)
  if (!rl.ok) return NextResponse.json({ error: 'Please try again shortly.' }, { status: 429 })

  const body = await req.json().catch(() => null)
  const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : ''
  if (!isValidEmail(email)) return NextResponse.json({ error: 'Please enter a valid email.' }, { status: 400 })

  try {
    await upsertContact(email, { interest: 'newsletter', source: 'newsletter' })
    await logActivity(email, 'lead', 'Newsletter signup', 'Opted in from the Carolina Home footer')
    if (body?.visitor_id) identify({ visitorId: String(body.visitor_id), email, source: 'newsletter' }).catch(() => {})
  } catch (e) {
    console.error('carolina subscribe failed', e)
  }
  return NextResponse.json({ ok: true })
}
