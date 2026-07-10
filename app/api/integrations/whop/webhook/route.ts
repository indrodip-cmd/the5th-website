import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { verifyWhopWebhook, normalizeWhopEvent, whopConfigured, whopSyncBalances, whopRefreshMember } from '@/lib/connectors/whop'
import { recordRevenueEvent } from '@/lib/revenue'
import { notify } from '@/lib/notifications'
import { emitEvent } from '@/lib/events'

export const dynamic = 'force-dynamic'

/* Whop payment webhook (Svix). Verifies the signature over the RAW body,
   dedups by Svix message id, stores every payload for audit, then dispatches.
   Answers 200 fast; never trusts input. Subscribe in Whop to payment.succeeded,
   payment.failed, refund.created/updated, membership.activated/deactivated,
   membership.cancel_at_period_end_changed. */
export async function POST(req: NextRequest) {
  const raw = await req.text()
  const db = getSupabaseAdmin()

  if (!whopConfigured() || !process.env.WHOP_WEBHOOK_SECRET) {
    return NextResponse.json({ ok: true, skipped: 'whop not configured' })
  }

  const svix = {
    id: req.headers.get('svix-id') || req.headers.get('webhook-id'),
    timestamp: req.headers.get('svix-timestamp') || req.headers.get('webhook-timestamp'),
    signature: req.headers.get('svix-signature') || req.headers.get('webhook-signature'),
  }
  if (!verifyWhopWebhook(raw, svix)) {
    await db.from('integration_webhooks').insert({ provider: 'whop', status: 'error', signature_valid: false, error: 'invalid signature', payload: safeParse(raw) }).then(() => {}, () => {})
    emitEvent('webhook_failed', { provider: 'whop', reason: 'invalid_signature' })
    return NextResponse.json({ error: 'invalid signature' }, { status: 401 })
  }

  const body = safeParse(raw)
  const action = String(body.action || body.event || body.type || 'unknown')
  const dedupeId = svix.id || String(body.id || '') // Svix message id → retries share it

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
    if (action === 'payment.failed') {
      const d = (body.data as Record<string, unknown>) || {}
      await notify('payment_failure', 'Payment failed', String((d.user as Record<string, unknown>)?.email || d.email || ''))
    } else if (action === 'membership.cancel_at_period_end_changed') {
      const d = (body.data as Record<string, unknown>) || {}
      if (d.cancel_at_period_end) await notify('renewal_risk', 'Renewal at risk', `Membership set to cancel at period end${d.email ? ` · ${d.email}` : ''}`)
    } else {
      const norm = normalizeWhopEvent(body)
      if (norm) {
        await recordRevenueEvent(norm)
        if (norm.type === 'membership_created') await notify('subscriber', 'New subscriber', String(norm.email || ''))
        if (norm.type === 'membership_cancelled') await notify('churn', 'Membership cancelled', String(norm.email || ''))
      }
    }
    await finish('processed')

    // Keep the multi-currency balance cache + affected member fresh (fees/FX
    // make manual math unreliable — always re-fetch from Whop).
    const data = (body.data as Record<string, unknown>) || {}
    const userId = String((data.user as Record<string, unknown>)?.id || data.user_id || '')
    if (['payment.succeeded', 'refund.created', 'refund.updated'].includes(action)) whopSyncBalances().catch(() => {})
    if (['membership.activated', 'membership.deactivated', 'payment.succeeded'].includes(action) && userId) whopRefreshMember(userId).catch(() => {})
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
