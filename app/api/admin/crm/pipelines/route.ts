import { NextRequest, NextResponse } from 'next/server'
import { adminEmail } from '@/lib/session'
import { sanitizeText } from '@/lib/validation'
import { listPipelines, createPipeline, updatePipeline } from '@/lib/sales'

export const dynamic = 'force-dynamic'

/* GET — all pipelines with their stages. */
export async function GET(req: NextRequest) {
  if (!adminEmail(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  return NextResponse.json({ pipelines: await listPipelines() })
}

/* POST — create a pipeline ({ name }). */
export async function POST(req: NextRequest) {
  if (!adminEmail(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const b = await req.json().catch(() => ({}))
  const name = sanitizeText(b?.name, 80)
  if (!name) return NextResponse.json({ error: 'Pipeline name required.' }, { status: 400 })
  return NextResponse.json({ ok: true, pipeline: await createPipeline(name) })
}

/* PATCH — rename / reorder / archive ({ id, ... }). */
export async function PATCH(req: NextRequest) {
  if (!adminEmail(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const b = await req.json().catch(() => ({}))
  const id = String(b?.id || '')
  if (!id) return NextResponse.json({ error: 'id required.' }, { status: 400 })
  const patch: Record<string, unknown> = {}
  if (typeof b?.name === 'string') patch.name = sanitizeText(b.name, 80)
  if (Number.isFinite(b?.position)) patch.position = Math.round(b.position)
  if (typeof b?.archived === 'boolean') patch.archived = b.archived
  if (typeof b?.is_default === 'boolean') patch.is_default = b.is_default
  return NextResponse.json({ ok: true, pipeline: await updatePipeline(id, patch) })
}
