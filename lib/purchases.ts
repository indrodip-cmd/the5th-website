/* Purchase history + Lifetime Value (3I.3).
   Architecture for manual entries now; Stripe/Razorpay attach later via the
   same model (provider + external_id). Timeline + LTV rollup + events. */
import { getSupabaseAdmin } from '@/lib/supabase'
import { emitEvent } from '@/lib/events'
import { logActivity, audit } from '@/lib/crm'

type Row = Record<string, unknown>

async function contactEmail(contactId: string): Promise<string | null> {
  const { data } = await getSupabaseAdmin().from('crm_contacts').select('email').eq('id', contactId).maybeSingle()
  return (data?.email as string) || null
}

/* Recompute LTV = sum of non-refunded, non-deleted purchases. */
export async function recomputeLTV(contactId: string): Promise<number> {
  const db = getSupabaseAdmin()
  const { data } = await db.from('crm_purchases').select('amount,status').eq('contact_id', contactId).is('deleted_at', null)
  const ltv = (data || []).filter((p) => p.status === 'paid').reduce((s, p) => s + Number(p.amount || 0), 0)
  await db.from('crm_contacts').update({ ltv: Math.round(ltv * 100) / 100 }).eq('id', contactId)
  return ltv
}

export async function recordPurchase(input: {
  contactId: string; product: string; amount: number; currency?: string
  provider?: string; externalId?: string; purchasedAt?: string; meta?: Row
}, actor?: string) {
  const db = getSupabaseAdmin()
  const { data } = await db.from('crm_purchases').insert({
    contact_id: input.contactId, product: input.product, amount: input.amount,
    currency: input.currency || 'USD', provider: input.provider || 'manual',
    external_id: input.externalId || null, purchased_at: input.purchasedAt || new Date().toISOString(),
    meta: input.meta || {}, status: 'paid',
  }).select('*').single()
  await recomputeLTV(input.contactId)
  const email = await contactEmail(input.contactId)
  if (email) await logActivity(email, 'deal', `Purchased ${input.product}`, `$${Number(input.amount).toLocaleString()} ${input.currency || 'USD'}`, { purchase_id: data?.id }, actor)
  await audit(actor || null, 'purchase.recorded', 'purchase', (data?.id as string) || null, input.contactId, null, data)
  emitEvent('purchase_recorded', { contact_id: input.contactId, product: input.product, amount: input.amount, email })
  return data
}

export async function recordRefund(purchaseId: string, actor?: string) {
  const db = getSupabaseAdmin()
  const { data: p } = await db.from('crm_purchases').update({ status: 'refunded', refunded_at: new Date().toISOString() }).eq('id', purchaseId).select('*').single()
  if (!p) return null
  await recomputeLTV(p.contact_id as string)
  const email = await contactEmail(p.contact_id as string)
  if (email) await logActivity(email, 'deal', `Refunded ${p.product as string}`, `-$${Number(p.amount).toLocaleString()}`, { purchase_id: purchaseId }, actor)
  await audit(actor || null, 'purchase.refunded', 'purchase', purchaseId, p.contact_id as string, null, p)
  emitEvent('refund_recorded', { contact_id: p.contact_id, product: p.product, email })
  return p
}

export async function listPurchases(contactId: string) {
  const { data } = await getSupabaseAdmin().from('crm_purchases')
    .select('*').eq('contact_id', contactId).is('deleted_at', null).order('purchased_at', { ascending: false })
  return data || []
}
