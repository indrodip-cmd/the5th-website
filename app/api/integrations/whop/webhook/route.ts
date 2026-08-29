import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { verifyWhopRequest, whopConfigured } from '@/lib/connectors/whop'
import { notify } from '@/lib/notifications'
import { emitEvent } from '@/lib/events'
import { dispatchWhopEvent, whopAction } from '@/lib/whop-fulfillment'

export const dynamic = 'force-dynamic'

/* Whop payment webhook (Standard Webhooks / Svix-compatible). Verifies the
   signature over the RAW body, dedups by the webhook message id, stores every
   payload for audit, then hands off to the shared fulfillment dispatcher.
   Answers 200 fast; never trusts input. Subscribe in Whop to payment.succeeded,
   payment.failed, refund.created/updated, membership.activated/deactivated,
   membership.cancel_at_period_end_changed. */
export async function POST(req: NextRequest) {
  const raw = await req.text()
  const db = getSupabaseAdmin()

  if (!whopConfigured() || !process.env.WHOP_WEBHOOK_SECRET) {
    return NextResponse.json({ ok: true, skipped: 'whop not configured' })
  }

  const ver = verifyWhopRequest(raw, req.headers)
  if (!ver.ok) {
    // Capture which signature headers actually arrived so a bad secret vs. a
    // format mismatch can be told apart from the logs without guessing.
    const rawSig = (req.headers.get('webhook-signature') || req.headers.get('x-whop-signature') || req.headers.get('svix-signature') || '').slice(0, 24)
    const diag = `invalid signature · present=[${ver.present.join(',')}] · sig~=${rawSig}`
    await db.from('integration_webhooks').insert({ provider: 'whop', status: 'error', signature_valid: false, error: diag, payload: safeParse(raw) }).then(() => {}, () => {})
    emitEvent('webhook_failed', { provider: 'whop', reason: 'invalid_signature' })
    notify('integration_error', 'Whop webhook rejected: bad signature', `A Whop event failed signature verification (headers present: ${ver.present.join(', ') || 'none'}). Sales, subscriptions and workbook/Breakthrough enrollments are being DROPPED. Verify WHOP_WEBHOOK_SECRET matches the signing secret on the Whop endpoint.`).catch(() => {})
    return NextResponse.json({ error: 'invalid signature' }, { status: 401 })
  }

  const body = safeParse(raw)
  const action = whopAction(body)
  // Idempotency id — the webhook message id, falling back to the event's own id.
  // Retries of the same event share it, so the dedup below holds.
  const dedupeId = req.headers.get('webhook-id') || req.headers.get('svix-id') || req.headers.get('x-whop-request-id') || String(body.id || (body.data as Record<string, unknown>)?.id || '')

  // Dedup + audit: unique(provider, external_id, event_type)
  const { error: insErr } = await db.from('integration_webhooks').insert({
    provider: 'whop', event_type: action, external_id: dedupeId, signature_valid: true, status: 'received', payload: body,
  })
  if (insErr && insErr.code === '23505') return NextResponse.json({ ok: true, duplicate: true })
  emitEvent('webhook_received', { provider: 'whop', event_type: action })

  const finish = (status: string, error?: string) =>
    db.from('integration_webhooks').update({ status, error: error || null, processed_at: new Date().toISOString() })
      .eq('provider', 'whop').eq('external_id', dedupeId).eq('event_type', action)

  try {
    await dispatchWhopEvent(body, raw)
    await finish('processed')
  } catch (e) {
    await finish('error', String(e))
    await notify('webhook_failure', 'Whop webhook failed', String(e))
    emitEvent('webhook_failed', { provider: 'whop', event_type: action })
  }
  return NextResponse.json({ ok: true })
}

function safeParse(raw: string): Record<string, unknown> {
  try { return JSON.parse(raw) } catch { return {} }
}
