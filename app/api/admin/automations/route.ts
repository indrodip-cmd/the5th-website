import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { adminEmail } from '@/lib/session'
import { sanitizeText } from '@/lib/validation'
import { TRIGGERS, CONDITION_FIELDS, ACTIONS } from '@/lib/events'

export const dynamic = 'force-dynamic'

/* GET: workflows + registries + recent runs (for the no-code builder). */
export async function GET(req: NextRequest) {
  if (!adminEmail(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const db = getSupabaseAdmin()
  const [{ data: automations }, { data: runs }] = await Promise.all([
    db.from('automations').select('*').order('updated_at', { ascending: false }),
    db.from('automation_runs').select('*').order('created_at', { ascending: false }).limit(30),
  ])
  return NextResponse.json({
    automations: automations || [],
    runs: runs || [],
    registry: { triggers: TRIGGERS, fields: CONDITION_FIELDS, actions: ACTIONS },
  })
}

/* POST: create or update a workflow (id present → update). */
export async function POST(req: NextRequest) {
  if (!adminEmail(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const b = await req.json().catch(() => ({}))
  if (!b?.name || !b?.trigger) return NextResponse.json({ error: 'Name and trigger are required.' }, { status: 400 })
  const row: Record<string, unknown> = {
    name: sanitizeText(b.name, 120),
    description: sanitizeText(b.description, 400) || null,
    trigger: sanitizeText(b.trigger, 60),
    match: b.match === 'any' ? 'any' : 'all',
    conditions: Array.isArray(b.conditions) ? b.conditions.slice(0, 20) : [],
    actions: Array.isArray(b.actions) ? b.actions.slice(0, 20) : [],
    enabled: b.enabled !== false,
    status: b.status === 'published' ? 'published' : 'draft',
    updated_at: new Date().toISOString(),
  }
  const db = getSupabaseAdmin()
  if (b.id) {
    const { error } = await db.from('automations').update(row).eq('id', b.id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true, id: b.id })
  }
  const { data, error } = await db.from('automations').insert(row).select('id').single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true, id: data.id })
}

export async function DELETE(req: NextRequest) {
  if (!adminEmail(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const id = new URL(req.url).searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Missing id.' }, { status: 400 })
  const { error } = await getSupabaseAdmin().from('automations').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
