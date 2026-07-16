import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { getSupabaseAdmin } from '@/lib/supabase'
import { markCallBooked } from '@/lib/lp-funnel'

export const dynamic = 'force-dynamic'

/* Typeform "Book a call" submission webhook.

   Flow: verify the Typeform-Signature HMAC → LOG the raw payload (always, before
   processing) → extract the hidden `email`/`name` fields → match the existing
   vsl_lead → flip to call_booked + notify admin (all idempotent, so Typeform's
   automatic retries are safe). Always responds fast so Typeform doesn't
   retry-storm. Point a Typeform webhook at: /api/webhooks/typeform */

function verifySignature(raw: string, header: string | null, secret: string): boolean {
  if (!header) return false
  const expected = 'sha256=' + crypto.createHmac('sha256', secret).update(raw, 'utf8').digest('base64')
  try {
    const a = Buffer.from(header)
    const b = Buffer.from(expected)
    return a.length === b.length && crypto.timingSafeEqual(a, b)
  } catch {
    return false
  }
}

/* Pull an email out of the answers array if the hidden field is missing. */
function emailFromAnswers(answers: unknown): string | null {
  if (!Array.isArray(answers)) return null
  for (const a of answers) {
    if (a && typeof a === 'object') {
      const ans = a as Record<string, unknown>
      if (ans.type === 'email' && typeof ans.email === 'string') return ans.email
      if (typeof ans.email === 'string') return ans.email
    }
  }
  return null
}

export async function POST(req: NextRequest) {
  const raw = await req.text()
  const db = getSupabaseAdmin()
  const secret = process.env.TYPEFORM_WEBHOOK_SECRET

  let body: Record<string, unknown> = {}
  try { body = JSON.parse(raw) } catch { body = {} }

  // Verify signature when a secret is configured; if none is set, accept but
  // flag it so the log shows the webhook is running unsecured.
  const signatureValid = secret ? verifySignature(raw, req.headers.get('typeform-signature'), secret) : false
  const secured = Boolean(secret)

  const fr = (body.form_response || {}) as Record<string, unknown>
  const hidden = (fr.hidden || {}) as Record<string, unknown>
  const responseId = (fr.token as string) || (body.event_id as string) || null
  const email =
    (typeof hidden.email === 'string' && hidden.email) ||
    emailFromAnswers(fr.answers) ||
    null
  const name = (typeof hidden.name === 'string' && hidden.name) || null

  // LOG every payload before processing (dedupe on Typeform's event_id).
  try {
    await db.from('integration_webhooks').insert({
      provider: 'typeform',
      event_type: (body.event_type as string) || 'form_response',
      external_id: responseId,
      signature_valid: signatureValid,
      status: secured && !signatureValid ? 'rejected' : email ? 'processed' : 'ignored',
      payload: body,
      received_at: new Date().toISOString(),
    })
  } catch (e) {
    console.error('typeform webhook log failed', e)
  }

  // Reject tampered payloads (only when a secret is configured).
  if (secured && !signatureValid) {
    return NextResponse.json({ error: 'invalid signature' }, { status: 401 })
  }

  if (!email) {
    // Nothing to match — ack so Typeform stops retrying.
    return NextResponse.json({ ok: true, matched: false, reason: 'no_email' })
  }

  const res = await markCallBooked({
    email,
    name,
    typeformResponseId: responseId,
    payload: body,
  }).catch((e) => {
    console.error('typeform markCallBooked failed', e)
    return { ok: false, matched: false, notified: false }
  })

  return NextResponse.json({ ok: true, matched: res.matched, notified: res.notified })
}
