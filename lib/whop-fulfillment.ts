/* ============================================================================
   Whop event fulfillment — the SINGLE code path for acting on a verified Whop
   event. Used by both the live webhook (app/api/integrations/whop/webhook) and
   the recovery re-processor (app/api/admin/whop-recover), so a replayed event
   does exactly what a live one would: record revenue, enroll buyers, grant
   entitlements, sync balances. Every side-effect is idempotent (revenue dedups
   by external id, enrollments dedup via their own logs, upserts by email), so
   replaying is always safe. Admin notifications can be muted for bulk recovery.
   ========================================================================== */
import { getSupabaseAdmin } from '@/lib/supabase'
import { normalizeWhopEvent, whopSyncBalances, whopRefreshMember } from '@/lib/connectors/whop'
import { recordRevenueEvent } from '@/lib/revenue'
import { notify } from '@/lib/notifications'
import { emitEvent } from '@/lib/events'
import { enrollBuyer } from '@/lib/event-enroll'
import { enrollWorkbookBuyer } from '@/lib/workbook-campaign'
import { resolveOrCreateContact, logActivity, addTag } from '@/lib/crm'
import { recordPurchase } from '@/lib/purchases'
import { markAuditPaid, AUDIT_PLAN_ID } from '@/lib/roadmap-audit'
import { Resend } from 'resend'

// Whop plan/product ids we react to. Env-overridable where the product may change.
export const BREAKTHROUGH_PLAN_ID = 'plan_ZXh5ZISKwiWDy'
export const DIAGNOSTIC_PLAN_ID = process.env.WHOP_DIAGNOSTIC_PLAN_ID || ''
export const WORKBOOK_PLAN_ID = process.env.NEXT_PUBLIC_WHOP_WORKBOOK_PLAN_ID || 'plan_9p1vwkc9eoH2H'
export const WORKBOOK_PRODUCT_ID = 'prod_N6s0DPIc5sQAA'

export function whopAction(body: Record<string, unknown>): string {
  return String(body.action || body.event || body.type || 'unknown')
}

type Obj = Record<string, unknown>
const buyerOf = (body: Obj) => {
  const d = (body.data as Obj) || {}
  const user = (d.user as Obj) || {}
  return {
    email: String(user.email || d.email || '').toLowerCase(),
    name: String(user.name || user.username || d.name || '') || null,
    receiptId: String(d.id || d.receipt_id || d.payment_id || ''),
  }
}

/* Act on one verified/trusted Whop event. Never throws for individual
   side-effect failures (each is guarded); a thrown error means an unexpected
   fault the caller should log. `adminNotify` mutes founder notifications during
   bulk recovery (buyer-facing emails still send). */
export async function dispatchWhopEvent(body: Record<string, unknown>, raw: string, opts: { adminNotify?: boolean } = {}): Promise<void> {
  const adminNotify = opts.adminNotify !== false
  const action = whopAction(body)
  const data = (body.data as Obj) || {}

  // Revenue + churn/renewal signals.
  if (action === 'payment.failed') {
    if (adminNotify) await notify('payment_failure', 'Payment failed', String((data.user as Obj)?.email || data.email || ''))
  } else if (action === 'membership.cancel_at_period_end_changed') {
    if (adminNotify && data.cancel_at_period_end) await notify('renewal_risk', 'Renewal at risk', `Membership set to cancel at period end${data.email ? ` · ${data.email}` : ''}`)
  } else {
    const norm = normalizeWhopEvent(body)
    if (norm) {
      await recordRevenueEvent(norm)
      if (adminNotify && norm.type === 'membership_created') await notify('subscriber', 'New subscriber', String(norm.email || ''))
      if (adminNotify && norm.type === 'membership_cancelled') await notify('churn', 'Membership cancelled', String(norm.email || ''))
    }
  }

  // Product-specific fulfillment on paid events. Each guarded independently.
  if (action === 'payment.succeeded') {
    const { email, name, receiptId } = buyerOf(body)

    if (email && raw.includes(BREAKTHROUGH_PLAN_ID)) {
      try { await enrollBuyer(email, name, 'whop') } catch (e) { emitEvent('event_enroll_failed', { provider: 'whop', error: String(e) }) }
    }
    if (email && (raw.includes(WORKBOOK_PLAN_ID) || raw.includes(WORKBOOK_PRODUCT_ID))) {
      try { await enrollWorkbookBuyer(email, name, 'whop') } catch (e) { emitEvent('workbook_enroll_failed', { provider: 'whop', error: String(e) }) }
    }
    if (email && DIAGNOSTIC_PLAN_ID && raw.includes(DIAGNOSTIC_PLAN_ID)) {
      try { await grantDiagnostic(email, name, receiptId) } catch (e) { emitEvent('diagnostic_grant_failed', { provider: 'whop', error: String(e) }) }
    }
    if (email && AUDIT_PLAN_ID && raw.includes(AUDIT_PLAN_ID)) {
      try { await markAuditPaid(email, name, receiptId) } catch (e) { emitEvent('audit_grant_failed', { provider: 'whop', error: String(e) }) }
    }
  }

  // Keep the balance cache + affected member fresh (fees/FX make manual math
  // unreliable — always re-fetch from Whop).
  const userId = String((data.user as Obj)?.id || data.user_id || '')
  if (['payment.succeeded', 'refund.created', 'refund.updated'].includes(action)) whopSyncBalances().catch(() => {})
  if (['membership.activated', 'membership.deactivated', 'payment.succeeded'].includes(action) && userId) whopRefreshMember(userId).catch(() => {})
}

/* Grant the $27 diagnostic: dedup the contact, record the purchase, flip the
   entitlement on quiz_leads (the report gate), and email a confirmation. */
async function grantDiagnostic(email: string, name: string | null, receiptId: string) {
  const db = getSupabaseAdmin()
  const contact = await resolveOrCreateContact({ email, name, tags: ['quiz', 'diagnostic-buyer'] }, { source: 'whop', actor: 'whop-webhook' })
  const contactId = contact?.id as string | undefined

  let purchaseId: string | null = null
  if (contactId) {
    const p = await recordPurchase({ contactId, product: 'business_growth_diagnostic', amount: 27, currency: 'USD', provider: 'whop', externalId: receiptId || undefined }, 'whop-webhook')
    purchaseId = (p?.id as string) || null
    await addTag(contactId, 'diagnostic-buyer').catch(() => {})
  }

  const patch: Record<string, unknown> = { email, paid: true, paid_at: new Date().toISOString(), purchase_id: purchaseId, report_tier: 'full' }
  if (name) patch.name = name
  await db.from('quiz_leads').upsert(patch, { onConflict: 'email' }).then(() => {}, () => {})

  await logActivity(email, 'program_view', 'Unlocked the Business Growth Diagnostic').catch(() => {})
  emitEvent('purchase_completed', { email, product: 'business_growth_diagnostic', amount: 27, contact_id: contactId })

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
