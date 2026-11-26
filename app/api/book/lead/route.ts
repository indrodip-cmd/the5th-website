import { NextRequest, NextResponse } from 'next/server'
import { limit, clientIp } from '@/lib/rateLimit'
import { isValidEmail, sanitizeName } from '@/lib/validation'
import { resolveOrCreateContact, addTag, logActivity } from '@/lib/crm'
import { emitEvent } from '@/lib/events'
import { Resend } from 'resend'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/* Lead magnet for the book page: free Chapter 1 by email. Builds the email
   list (contact + tag in the CRM, same pipeline as every other funnel) and
   never blocks the visitor: the download link is returned even if a downstream
   step is unavailable. */
const SAMPLE_URL = 'https://the5thglobal.consulting/documents/expertise-to-income-chapter-1.pdf'

export async function POST(req: NextRequest) {
  try {
    const ip = clientIp(req)
    const lim = await limit(`booklead:ip:${ip}`, 8, 600)
    if (!lim.ok) return NextResponse.json({ error: 'Too many requests. Please try again shortly.' }, { status: 429 })
    const body = await req.json().catch(() => ({}))
    const email = String(body.email || '').trim().toLowerCase()
    if (!isValidEmail(email)) return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 })
    const name = body.name ? sanitizeName(String(body.name)) : null

    try {
      const contact = await resolveOrCreateContact({ email, name, tags: ['book-sample', 'book-lead'] }, { source: 'book-landing', actor: 'book-lead' })
      if (contact?.id) {
        await addTag(contact.id as string, 'book-sample').catch(() => {})
        await logActivity(email, 'program_view', 'Requested free Chapter 1 of Expertise to Income', JSON.stringify({ exp: body.exp || null, src: body.src || null })).catch(() => {})
      }
      emitEvent('book_lead', { email, exp: body.exp || null, src: body.src || null })
    } catch (e) { console.error('book lead crm failed', e) }

    try {
      const key = process.env.RESEND_API_KEY
      if (key) {
        await new Resend(key).emails.send({
          from: 'Indrodip | The5th <noreply@10kroadmap.org>',
          to: email,
          subject: 'Your free Chapter 1 of Expertise to Income',
          html: `<div style="font-family:Inter,system-ui,sans-serif;max-width:520px;margin:0 auto;color:#14201A">
            <h1 style="font-size:22px;color:#0C3A28;margin:0 0 12px">Here is Chapter 1.</h1>
            <p style="font-size:15px;line-height:1.6">Chapter 1 is about finding the real reason behind your business, the one that keeps you going on slow days. It takes one sitting.</p>
            <p style="margin:22px 0"><a href="${SAMPLE_URL}" style="display:inline-block;background:#C9FF48;color:#0B0F08;font-weight:800;font-size:15px;padding:14px 26px;border-radius:999px;text-decoration:none">Download Chapter 1 (PDF)</a></p>
            <p style="font-size:14px;line-height:1.6;color:#4a5a50">When you are ready for the other eight chapters, the full 104-page workbook is here: <a href="https://the5thglobal.consulting/book" style="color:#1B7A52">Expertise to Income</a>. It comes with a 365-day money-back guarantee.</p>
            <p style="font-size:12px;color:#8a978f;margin-top:24px">You asked for this from the5thglobal.consulting. Reply to this email any time to unsubscribe.</p></div>`,
        })
      }
    } catch (e) { console.error('book lead email failed', e) }

    return NextResponse.json({ ok: true, url: '/documents/expertise-to-income-chapter-1.pdf' })
  } catch (e) {
    console.error('book lead error', e)
    return NextResponse.json({ ok: true, url: '/documents/expertise-to-income-chapter-1.pdf' })
  }
}
