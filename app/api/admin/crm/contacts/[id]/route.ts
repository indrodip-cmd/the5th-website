import { NextRequest, NextResponse } from 'next/server'
import { adminEmail } from '@/lib/session'
import { sanitizeText } from '@/lib/validation'
import { getContactBundle, updateContact, softDeleteContact } from '@/lib/crm'

export const dynamic = 'force-dynamic'

const PIPELINE = ['new', 'qualified', 'discovery', 'call_booked', 'call_completed', 'proposal', 'won', 'closed', 'lost', 'customer']

/* GET — full contact profile bundle by id. */
export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  if (!adminEmail(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await ctx.params
  const bundle = await getContactBundle(id)
  if (!bundle) return NextResponse.json({ error: 'Contact not found.' }, { status: 404 })
  return NextResponse.json(bundle)
}

/* PATCH — authoritative update of a single contact. */
export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const actor = adminEmail(req)
  if (!actor) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await ctx.params
  const b = await req.json().catch(() => ({}))
  const patch: Record<string, unknown> = {}
  const strFields: Array<[string, number]> = [
    ['name', 120], ['first_name', 80], ['last_name', 80], ['preferred_name', 80], ['phone', 40],
    ['company', 160], ['country', 80], ['state', 80], ['city', 80], ['timezone', 60],
    ['interest', 200], ['business_stage', 200], ['owner', 120], ['status', 40],
    ['lifecycle_stage', 40], ['lead_status', 60], ['source', 60], ['website', 300],
    ['linkedin', 300], ['whatsapp', 40], ['notes', 8000],
  ]
  for (const [f, max] of strFields) if (typeof b[f] === 'string') patch[f] = sanitizeText(b[f], max) || null
  if (typeof b.pipeline_stage === 'string' && PIPELINE.includes(b.pipeline_stage)) patch.pipeline_stage = b.pipeline_stage
  if (Number.isFinite(b.lead_score)) patch.lead_score = Math.max(0, Math.round(b.lead_score))
  if (Number.isFinite(b.revenue)) patch.revenue = Math.max(0, Math.round(b.revenue * 100) / 100)
  if (typeof b.call_booked === 'boolean') patch.call_booked = b.call_booked
  if (Array.isArray(b.tags)) patch.tags = b.tags.slice(0, 40).map((t: unknown) => sanitizeText(t, 40)).filter(Boolean)

  const contact = await updateContact(id, patch, actor)
  if (!contact) return NextResponse.json({ error: 'Contact not found.' }, { status: 404 })
  return NextResponse.json({ ok: true, contact })
}

/* DELETE — soft delete. */
export async function DELETE(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const actor = adminEmail(req)
  if (!actor) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await ctx.params
  await softDeleteContact(id, actor)
  return NextResponse.json({ ok: true })
}
