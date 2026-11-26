import { NextRequest, NextResponse } from 'next/server'
import { limit, clientIp } from '@/lib/rateLimit'
import { isValidEmail, sanitizeName } from '@/lib/validation'
import { emitEvent } from '@/lib/events'
import { captureLead, sendChapter1, downloadUrl } from '@/lib/book-mail'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/* Lead magnet for the book page: free Chapter 1 by email. Builds the email
   list (contact + tag in the CRM, same pipeline as every other funnel) and
   never blocks the visitor: the download link is returned even if a downstream
   step is unavailable. */
export async function POST(req: NextRequest) {
  try {
    const ip = clientIp(req)
    const lim = await limit(`booklead:ip:${ip}`, 8, 600)
    if (!lim.ok) return NextResponse.json({ error: 'Too many requests. Please try again shortly.' }, { status: 429 })
    const body = await req.json().catch(() => ({}))
    const email = String(body.email || '').trim().toLowerCase()
    if (!isValidEmail(email)) return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 })
    const name = body.name ? sanitizeName(String(body.name)) : null

    try { await captureLead(email, name, { exp: body.exp || null, src: body.src || null }); emitEvent('book_lead', { email, exp: body.exp || null, src: body.src || null }) } catch (e) { console.error('book lead crm failed', e) }
    // Branded delivery email (idempotent: a repeat request never re-sends).
    try { const r = await sendChapter1(email, name); if (!r.ok) console.error('book chapter1 email', r.error) } catch (e) { console.error('book lead email failed', e) }

    return NextResponse.json({ ok: true, url: downloadUrl(email, 'chapter1')?.replace('https://the5thglobal.consulting', '') || '/api/book/download?k=chapter1' })
  } catch (e) {
    console.error('book lead error', e)
    return NextResponse.json({ ok: true, url: '/api/book/download?k=chapter1' })
  }
}
