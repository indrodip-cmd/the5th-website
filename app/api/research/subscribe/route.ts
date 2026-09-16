import { NextRequest, NextResponse } from 'next/server'
import { limit, clientIp } from '@/lib/rateLimit'
import { isValidEmail } from '@/lib/validation'
import { upsertContact, logActivity } from '@/lib/crm'
import { emitEvent } from '@/lib/events'

/* Research newsletter signup. Reuses the native CRM (crm_contacts is the single
   source of truth) rather than a bespoke table, a subscriber is just a contact
   tagged `research`. Rate-limited per IP; disposable/invalid emails rejected. */
export async function POST(req: NextRequest) {
  const ip = clientIp(req)
  const rl = await limit(`research-sub:ip:${ip}`, 10, 600)
  if (!rl.ok) {
    return NextResponse.json({ error: 'Too many requests. Please wait a moment.' }, { status: 429, headers: { 'Retry-After': String(rl.retryAfter) } })
  }
  try {
    const body = await req.json()
    const email = String(body?.email || '').trim().toLowerCase()
    const name = body?.name ? String(body.name).trim().slice(0, 120) : null
    const domain = email.split('@')[1]
    if (!isValidEmail(email) || !domain) {
      return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 })
    }

    await upsertContact(email, { name, source: 'research', tags: ['research', 'newsletter'] })
    await logActivity(email, 'lead', 'Subscribed to the Research newsletter')
    emitEvent('lead_captured', { email, name, source: 'research' })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
