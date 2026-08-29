import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { verifyWhopRequest, normalizeWhopEvent, whopConfigured, whopSyncBalances, whopRefreshMember } from '@/lib/connectors/whop'
import { recordRevenueEvent } from '@/lib/revenue'
import { notify } from '@/lib/notifications'
import { emitEvent } from '@/lib/events'
import { enrollBuyer } from '@/lib/event-enroll'
import { enrollWorkbookBuyer } from '@/lib/workbook-campaign'
import { resolveOrCreateContact, logActivity, addTag } from '@/lib/crm'
import { recordPurchase } from '@/lib/purchases'
import { markAuditPaid, AUDIT_PLAN_ID } from '@/lib/roadmap-audit'
import { Resend } from 'resend'

export const dynamic = 'force-dynamic'

// Whop plan id for The 3-Day Breakthrough Intensive ($27) — buyers get the
// welcome + are enrolled into the event campaign.
const BREAKTHROUGH_PLAN_ID = 'plan_ZXh5ZISKwiWDy'

// Whop plan id for the $27 Business Growth Diagnostic — buyers unlock the full
// report on /quiz/results. Configure via env once the Whop product exists.
const DIAGNOSTIC_PLAN_ID = process.env.WHOP_DIAGNOSTIC_PLAN_ID || ''

// The Knowledge Asset ($7.93 workbook) — buyers are enrolled into the 7-day
// AI-trial nurture (and mirrored into the CRM). Matches plan OR product id.
const WORKBOOK_PLAN_ID = process.env.NEXT_PUBLIC_WHOP_WORKBOOK_PLAN_ID || 'plan_9p1vwkc9eoH2H'
const WORKBOOK_PRODUCT_ID = 'prod_N6s0DPIc5sQAA'

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

  const ver = verifyWhopRequest(raw, req.headers)
  if (!ver.ok) {
    // Capture which signature headers actually arrived so a bad secret vs. a
    // format mismatch can be told apart from the logs without guessing.
    const rawSig = (req.headers.get('x-whop-signature') || req.headers.get('svix-signature') || req.headers.get('webhook-signature') || '').slice(0, 24)
    const diag = `invalid signature · present=[${ver.present.join(',')}] · sig~=${rawSig}`
    await db.from('integration_webhooks').insert({ provider: 'whop', status: 'error', signature_valid: false, error: diag, payload: safeParse(raw) }).then(() => {}, () => {})
    emitEvent('webhook_failed', { provider: 'whop', reason: 'invalid_signature' })
    notify('integration_error', 'Whop webhook rejected: bad signature', `A Whop event failed signature verification (headers present: ${ver.present.join(', ') || 'none'}). Sales, subscriptions and workbook/Breakthrough enrollments are being DROPPED. Verify WHOP_WEBHOOK_SECRET matches the signing secret on the Whop endpoint.`).catch(() => {})
    return NextResponse.json({ error: 'invalid signature' }, { status: 401 })
  }

  const body = safeParse(raw)
  const action = String(body.action || body.event || body.type || 'unknown')
  // Idempotency id — the webhook message id (Svix or Whop), falling back to the
  // event's own id. Retries of the same event share it, so dedup holds.
  const dedupeId = req.headers.get('svix-id') || req.headers.get('webhook-id') || req.headers.get('x-whop-request-id') || String(body.id || (body.data as Record<string, unknown>)?.id || '')

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

    // Enroll Breakthrough Intensive buyers → welcome email + campaign list.
    // Guarded: never let this break the core webhook. Matches the plan id
    // anywhere in the payload (Whop nests it differently across events).
    if (action === 'payment.succeeded' && raw.includes(BREAKTHROUGH_PLAN_ID)) {
      try {
        const d = (body.data as Record<string, unknown>) || {}
        const user = (d.user as Record<string, unknown>) || {}
        const email = String(user.email || d.email || '')
        const name = String(user.name || user.username || d.name || '') || null
        if (email) await enrollBuyer(email, name, 'whop')
      } catch (e) {
        emitEvent('event_enroll_failed', { provider: 'whop', error: String(e) })
      }
    }

    // The Knowledge Asset ($7.93) → record the buyer + start the 7-day AI-trial
    // nurture (day-0 welcome sends only when WORKBOOK_CAMPAIGN_LIVE=true; the
    // cron catches up otherwise). Guarded so it never breaks the core webhook.
    if (action === 'payment.succeeded' && (raw.includes(WORKBOOK_PLAN_ID) || raw.includes(WORKBOOK_PRODUCT_ID))) {
      try {
        const d = (body.data as Record<string, unknown>) || {}
        const user = (d.user as Record<string, unknown>) || {}
        const email = String(user.email || d.email || '').toLowerCase()
        const name = String(user.name || user.username || d.name || '') || null
        if (email) await enrollWorkbookBuyer(email, name, 'whop')
      } catch (e) {
        emitEvent('workbook_enroll_failed', { provider: 'whop', error: String(e) })
      }
    }

    // $27 Business Growth Diagnostic → grant report entitlement + record the
    // purchase in the CRM. Guarded so it can never break the core webhook.
    if (action === 'payment.succeeded' && DIAGNOSTIC_PLAN_ID && raw.includes(DIAGNOSTIC_PLAN_ID)) {
      try {
        const d = (body.data as Record<string, unknown>) || {}
        const user = (d.user as Record<string, unknown>) || {}
        const email = String(user.email || d.email || '').toLowerCase()
        const name = String(user.name || user.username || d.name || '') || null
        const receiptId = String(d.id || d.receipt_id || d.payment_id || '')
        if (email) await grantDiagnostic(email, name, receiptId)
      } catch (e) {
        emitEvent('diagnostic_grant_failed', { provider: 'whop', error: String(e) })
      }
    }

    // $27 10K Roadmap Audit commitment deposit → flip the audit lead to paid
    // (unlocks the deep diagnostic + booking). Guarded so it never breaks the
    // core webhook. Matches the plan id anywhere in the raw payload.
    if (action === 'payment.succeeded' && AUDIT_PLAN_ID && raw.includes(AUDIT_PLAN_ID)) {
      try {
        const d = (body.data as Record<string, unknown>) || {}
        const user = (d.user as Record<string, unknown>) || {}
        const email = String(user.email || d.email || '').toLowerCase()
        const name = String(user.name || user.username || d.name || '') || null
        const receiptId = String(d.id || d.receipt_id || d.payment_id || '')
        if (email) await markAuditPaid(email, name, receiptId)
      } catch (e) {
        emitEvent('audit_grant_failed', { provider: 'whop', error: String(e) })
      }
    }

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

/* Grant the $27 diagnostic: dedup the contact, record the purchase, flip the
   entitlement on quiz_leads (the report gate), and email a confirmation. */
async function grantDiagnostic(email: string, name: string | null, receiptId: string) {
  const db = getSupabaseAdmin()
  const contact = await resolveOrCreateContact(
    { email, name, tags: ['quiz', 'diagnostic-buyer'] },
    { source: 'whop', actor: 'whop-webhook' },
  )
  const contactId = contact?.id as string | undefined

  let purchaseId: string | null = null
  if (contactId) {
    // recordPurchase also logs a "deal" activity + recomputes LTV + emits purchase_recorded.
    const p = await recordPurchase(
      { contactId, product: 'business_growth_diagnostic', amount: 27, currency: 'USD', provider: 'whop', externalId: receiptId || undefined },
      'whop-webhook',
    )
    purchaseId = (p?.id as string) || null
    await addTag(contactId, 'diagnostic-buyer').catch(() => {})
  }

  // Entitlement source of truth. Upsert so a buyer whose Whop email is not yet
  // in quiz_leads still gets a paid row (report gate keys on this).
  const patch: Record<string, unknown> = { email, paid: true, paid_at: new Date().toISOString(), purchase_id: purchaseId, report_tier: 'full' }
  if (name) patch.name = name
  await db.from('quiz_leads').upsert(patch, { onConflict: 'email' }).then(() => {}, () => {})

  await logActivity(email, 'program_view', 'Unlocked the Business Growth Diagnostic').catch(() => {})
  emitEvent('purchase_completed', { email, product: 'business_growth_diagnostic', amount: 27, contact_id: contactId })

  // Confirmation email with a link back to the report.
  try {
    const key = process.env.RESEND_API_KEY
    if (!key) return
    const firstName = (name || '').split(' ')[0] || 'there'
    await new Resend(key).emails.send({
      from: 'Indrodip | The5th <noreply@10kroadmap.org>',
      to: email,
      subject: 'Your full Business Growth Diagnostic is unlocked',
      html: `<div style="font-family:Inter,system-ui,sans-serif;max-width:520px;margin:0 auto;color:#1A1A2E">
        <h1 style="font-size:22px;color:#1C4A32;margin:0 0 12px">You're all set, ${firstName}.</h1>
        <p style="font-size:15px;line-height:1.6;color:#5a5550">Your full Business Growth Diagnostic is unlocked. It includes your complete diagnosis, your prioritised fixes, your personalised 30-day action plan, and a free 1:1 strategy call.</p>
        <p style="margin:24px 0"><a href="https://the5th.consulting/quiz/results" style="display:inline-block;background:#C9A84C;color:#1a1206;font-weight:700;font-size:15px;padding:14px 30px;border-radius:10px;text-decoration:none">Open your full report →</a></p>
        <p style="font-size:13px;line-height:1.6;color:#8A8075">Open it on the device you took the quiz on. Need help getting back in? Just reply to this email.</p>
        <p style="font-size:12px;color:#b3abbb;margin-top:24px">© 2026 The5th Consulting</p>
      </div>`,
    })
  } catch (e) {
    console.error('diagnostic confirmation email failed', e)
  }
}
