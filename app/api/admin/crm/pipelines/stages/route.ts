import { NextRequest, NextResponse } from 'next/server'
import { adminEmail } from '@/lib/session'
import { sanitizeText } from '@/lib/validation'
import { getSupabaseAdmin } from '@/lib/supabase'
import { createStage, updateStage, reorderStages } from '@/lib/sales'

export const dynamic = 'force-dynamic'

/* POST — create a stage in a pipeline ({ pipeline_id, name, color?, is_won?, is_lost? }). */
export async function POST(req: NextRequest) {
  if (!adminEmail(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const b = await req.json().catch(() => ({}))
  const pipelineId = String(b?.pipeline_id || '')
  const name = sanitizeText(b?.name, 60)
  if (!pipelineId || !name) return NextResponse.json({ error: 'pipeline_id and name required.' }, { status: 400 })
  const stage = await createStage(pipelineId, { name, color: b?.color, is_won: b?.is_won, is_lost: b?.is_lost, key: b?.key })
  return NextResponse.json({ ok: true, stage })
}

/* PATCH — update a stage ({ id, ... }) or reorder ({ order: [ids] }). */
export async function PATCH(req: NextRequest) {
  if (!adminEmail(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const b = await req.json().catch(() => ({}))
  if (Array.isArray(b?.order)) { await reorderStages(b.order.map(String)); return NextResponse.json({ ok: true }) }
  const id = String(b?.id || '')
  if (!id) return NextResponse.json({ error: 'id required.' }, { status: 400 })
  const patch: Record<string, unknown> = {}
  if (typeof b?.name === 'string') patch.name = sanitizeText(b.name, 60)
  if (typeof b?.color === 'string') patch.color = b.color
  if (typeof b?.is_won === 'boolean') patch.is_won = b.is_won
  if (typeof b?.is_lost === 'boolean') patch.is_lost = b.is_lost
  if (typeof b?.archived === 'boolean') patch.archived = b.archived
  return NextResponse.json({ ok: true, stage: await updateStage(id, patch) })
}

/* DELETE ?id= — archive a stage (never hard-delete: keeps opportunities safe). */
export async function DELETE(req: NextRequest) {
  if (!adminEmail(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const id = new URL(req.url).searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id required.' }, { status: 400 })
  // Block archiving a stage that still holds opportunities.
  const { count } = await getSupabaseAdmin().from('crm_opportunities').select('id', { count: 'exact', head: true }).eq('stage_id', id).is('deleted_at', null)
  if (count && count > 0) return NextResponse.json({ error: `Move the ${count} opportunit${count === 1 ? 'y' : 'ies'} in this stage first.` }, { status: 409 })
  await updateStage(id, { archived: true })
  return NextResponse.json({ ok: true })
}
