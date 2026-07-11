import { NextRequest, NextResponse } from 'next/server'
import { adminEmail } from '@/lib/session'
import { getSupabaseAdmin } from '@/lib/supabase'
import { sanitizeText } from '@/lib/validation'
import { TRIGGER_TYPES, ACTION_TYPES, runWorkflow, resumeRun, type Workflow } from '@/lib/automation/engine'
import { generateWorkflow } from '@/lib/automation/nl'
import { TEMPLATES, templateByKey } from '@/lib/automation/templates'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

const CONDITION_FIELDS = ['email', 'name', 'lead_score', 'pipeline_stage', 'lifecycle_stage', 'country', 'interest', 'value', 'amount', 'title']
const SAVE_FIELDS = ['name', 'description', 'category', 'status', 'trigger', 'graph', 'enabled']

/* GET — workflows + catalogs + templates for the Studio. */
export async function GET(req: NextRequest) {
  if (!adminEmail(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const db = getSupabaseAdmin()
  const id = new URL(req.url).searchParams.get('id')
  if (id) {
    const { data } = await db.from('automation_workflows').select('*').eq('id', id).maybeSingle()
    return NextResponse.json({ workflow: data })
  }
  const { data } = await db.from('automation_workflows').select('*').order('updated_at', { ascending: false })
  return NextResponse.json({
    workflows: data || [],
    catalogs: { triggers: TRIGGER_TYPES, actions: ACTION_TYPES, conditionFields: CONDITION_FIELDS, nodeTypes: ['condition', 'ai', 'action', 'notify', 'delay', 'approval', 'end'] },
    templates: TEMPLATES.map((t) => ({ key: t.key, name: t.name, description: t.description, category: t.category, icon: t.icon })),
  })
}

/* POST { action } — save | delete | publish | toggle | test | run | generate |
   instantiate | approve | reject */
export async function POST(req: NextRequest) {
  const actor = adminEmail(req)
  if (!actor) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const b = await req.json().catch(() => ({}))
  const db = getSupabaseAdmin()
  const action = String(b?.action || 'save')

  if (action === 'generate') {
    const desc = sanitizeText(b?.description, 2000)
    if (!desc) return NextResponse.json({ error: 'Describe the automation you want.' }, { status: 400 })
    return NextResponse.json(await generateWorkflow(desc, actor))
  }

  if (action === 'instantiate') {
    const t = templateByKey(String(b?.key || ''))
    if (!t) return NextResponse.json({ error: 'Unknown template' }, { status: 400 })
    const { data } = await db.from('automation_workflows').insert({ name: t.name, description: t.description, category: t.category, trigger: t.trigger, graph: t.graph, status: 'draft', created_by: actor }).select('*').single()
    return NextResponse.json({ ok: true, workflow: data })
  }

  if (action === 'save') {
    const row: Record<string, unknown> = { updated_at: new Date().toISOString() }
    for (const f of SAVE_FIELDS) if (f in b) row[f] = b[f]
    if (typeof row.name === 'string') row.name = sanitizeText(row.name, 120)
    if (b.id) { const { data, error } = await db.from('automation_workflows').update(row).eq('id', b.id).select('*').single(); if (error) return NextResponse.json({ error: error.message }, { status: 400 }); return NextResponse.json({ ok: true, workflow: data }) }
    row.created_by = actor
    const { data, error } = await db.from('automation_workflows').insert(row).select('*').single()
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ ok: true, workflow: data })
  }

  if (action === 'publish') {
    const { data: wf } = await db.from('automation_workflows').select('*').eq('id', b.id).maybeSingle()
    if (!wf) return NextResponse.json({ error: 'not found' }, { status: 404 })
    const version = Number(wf.version || 1)
    await db.from('automation_workflow_versions').insert({ workflow_id: wf.id, version, name: wf.name, trigger: wf.trigger, graph: wf.graph, created_by: actor, note: b?.note || null })
    await db.from('automation_workflows').update({ status: 'published', enabled: true, version: version + 1, updated_at: new Date().toISOString() }).eq('id', b.id)
    return NextResponse.json({ ok: true })
  }

  if (action === 'toggle') {
    const status = String(b?.status || 'paused')
    await db.from('automation_workflows').update({ status, enabled: status === 'published', updated_at: new Date().toISOString() }).eq('id', b.id)
    return NextResponse.json({ ok: true })
  }

  if (action === 'delete') { await db.from('automation_workflows').delete().eq('id', b.id); return NextResponse.json({ ok: true }) }

  if (action === 'test' || action === 'run') {
    const { data: wf } = await db.from('automation_workflows').select('*').eq('id', b.id).maybeSingle()
    if (!wf) return NextResponse.json({ error: 'not found' }, { status: 404 })
    const sample = (b?.sample && typeof b.sample === 'object') ? b.sample : {}
    const res = await runWorkflow(wf as unknown as Workflow, sample, { test: action === 'test', actor })
    return NextResponse.json({ ok: true, run: res })
  }

  if (action === 'approve' || action === 'reject') {
    const res = await resumeRun(String(b?.run_id || ''), { rejected: action === 'reject' })
    return NextResponse.json({ ok: !!res, run: res })
  }

  return NextResponse.json({ error: 'unknown action' }, { status: 400 })
}
