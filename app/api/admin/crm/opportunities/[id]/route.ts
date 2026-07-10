import { NextRequest, NextResponse } from 'next/server'
import { adminEmail } from '@/lib/session'
import { sanitizeText } from '@/lib/validation'
import { getOpportunity, updateOpportunity, moveOpportunity, softDeleteOpportunity } from '@/lib/sales'

export const dynamic = 'force-dynamic'

/* GET — opportunity detail bundle (opp + contact + stage + meetings + tasks + activities). */
export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  if (!adminEmail(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await ctx.params
  const bundle = await getOpportunity(id)
  if (!bundle) return NextResponse.json({ error: 'Not found.' }, { status: 404 })
  return NextResponse.json(bundle)
}

/* PATCH — update fields, or move stage ({ stage_id, position }) from a drag. */
export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const actor = adminEmail(req)
  if (!actor) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await ctx.params
  const b = await req.json().catch(() => ({}))

  // Fast path: pure drag move.
  if (b?.stage_id && Object.keys(b).filter((k) => !['stage_id', 'position'].includes(k)).length === 0) {
    const moved = await moveOpportunity(id, String(b.stage_id), Number.isFinite(b?.position) ? b.position : undefined, actor)
    if (!moved) return NextResponse.json({ error: 'Not found.' }, { status: 404 })
    return NextResponse.json({ ok: true, opportunity: moved })
  }

  const patch: Record<string, unknown> = {}
  if (typeof b?.name === 'string') patch.name = sanitizeText(b.name, 160)
  if (Number.isFinite(b?.value)) patch.value = Math.max(0, b.value)
  if (typeof b?.currency === 'string') patch.currency = sanitizeText(b.currency, 8)
  if (Number.isFinite(b?.probability)) patch.probability = Math.max(0, Math.min(100, Math.round(b.probability)))
  if ('expected_close_date' in b) patch.expected_close_date = b.expected_close_date || null
  if (Array.isArray(b?.products)) patch.products = b.products.map((p: unknown) => sanitizeText(p, 80)).filter(Boolean)
  if (typeof b?.source === 'string') patch.source = sanitizeText(b.source, 60)
  if (typeof b?.owner === 'string') patch.owner = sanitizeText(b.owner, 120)
  if (typeof b?.notes === 'string') patch.notes = sanitizeText(b.notes, 8000)
  if (b?.stage_id) patch.stage_id = b.stage_id
  if (Number.isFinite(b?.position)) patch.position = b.position

  const opp = await updateOpportunity(id, patch, actor)
  if (!opp) return NextResponse.json({ error: 'Not found.' }, { status: 404 })
  return NextResponse.json({ ok: true, opportunity: opp })
}

/* DELETE — soft delete. */
export async function DELETE(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const actor = adminEmail(req)
  if (!actor) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await ctx.params
  await softDeleteOpportunity(id, actor)
  return NextResponse.json({ ok: true })
}
