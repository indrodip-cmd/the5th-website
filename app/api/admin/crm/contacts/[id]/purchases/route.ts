import { NextRequest, NextResponse } from 'next/server'
import { adminEmail } from '@/lib/session'
import { sanitizeText } from '@/lib/validation'
import { listPurchases, recordPurchase, recordRefund } from '@/lib/purchases'

export const dynamic = 'force-dynamic'

/* GET — a contact's purchases. */
export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  if (!adminEmail(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await ctx.params
  return NextResponse.json({ purchases: await listPurchases(id) })
}

/* POST — record a purchase ({ product, amount, currency? }). */
export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const actor = adminEmail(req)
  if (!actor) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await ctx.params
  const b = await req.json().catch(() => ({}))
  const product = sanitizeText(b?.product, 160)
  if (!product) return NextResponse.json({ error: 'Product required.' }, { status: 400 })
  const purchase = await recordPurchase({
    contactId: id, product, amount: Math.max(0, Number(b?.amount) || 0),
    currency: sanitizeText(b?.currency, 8) || 'USD', purchasedAt: b?.purchased_at || undefined,
  }, actor)
  return NextResponse.json({ ok: true, purchase })
}

/* PATCH — refund a purchase ({ purchase_id }). */
export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const actor = adminEmail(req)
  if (!actor) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  await ctx.params
  const b = await req.json().catch(() => ({}))
  const purchaseId = String(b?.purchase_id || '')
  if (!purchaseId) return NextResponse.json({ error: 'purchase_id required.' }, { status: 400 })
  return NextResponse.json({ ok: true, purchase: await recordRefund(purchaseId, actor) })
}
