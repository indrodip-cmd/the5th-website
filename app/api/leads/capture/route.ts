import { NextRequest, NextResponse } from 'next/server'
import { limit, clientIp } from '@/lib/rateLimit'
import { isValidEmail, sanitizeText } from '@/lib/validation'
import { upsertContact, logActivity } from '@/lib/crm'
import { emitEvent } from '@/lib/events'

export const dynamic = 'force-dynamic'

/* Universal lead intake — any form or page on the site can POST here and the
   lead lands in the native CRM (carolina_leads) with a source + tags, so every
   lead is unified in one pipeline. Public + rate-limited. */
export async function POST(req: NextRequest) {
  const ip = clientIp(req)
  const rl = await limit(`leadcap:ip:${ip}`, 20, 600)
  if (!rl.ok) return NextResponse.json({ error: 'Too many submissions. Please wait a moment.' }, { status: 429, headers: { 'Retry-After': String(rl.retryAfter) } })

  const b = await req.json().catch(() => ({}))
  const email = String(b?.email || '').trim().toLowerCase()
  if (!isValidEmail(email)) return NextResponse.json({ error: 'A valid email is required.' }, { status: 400 })

  const name = sanitizeText(b?.name, 120) || null
  const source = sanitizeText(b?.source, 40) || 'website'
  const interest = sanitizeText(b?.interest, 200) || null
  const message = sanitizeText(b?.message, 2000)
  const tags = Array.isArray(b?.tags) ? b.tags.slice(0, 10).map((t: unknown) => sanitizeText(t, 40)).filter(Boolean) : []
  const finalTags = Array.from(new Set([source, ...tags])).filter(Boolean)

  await upsertContact(email, { name, source, interest, tags: finalTags })
  await logActivity(email, 'lead', `New lead — ${source}`, message || interest || undefined)
  emitEvent('lead_captured', { email, name, source, interest })

  return NextResponse.json({ ok: true })
}
