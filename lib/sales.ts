/* ─────────────────────────────────────────────────────────────────────────
   The5th Sales CRM (3I.2) — opportunities & configurable pipelines.

   Opportunities are the first-class pipeline cards; a contact may have several.
   crm_contacts.pipeline_stage + revenue are kept as an auto-synced rollup of
   the contact's primary open opportunity / won total (syncContactRollup), so
   the existing dashboard, Cal.com panel and lead scoring keep working.

   Same conventions as lib/crm.ts: service-role, fail-soft, emit + audit.
   ───────────────────────────────────────────────────────────────────────── */
import { getSupabaseAdmin } from '@/lib/supabase'
import { emitEvent } from '@/lib/events'
import { audit, logActivity } from '@/lib/crm'

type Row = Record<string, unknown>
type Patch = Record<string, unknown>

// ── Pipelines & stages ──
export async function listPipelines() {
  const db = getSupabaseAdmin()
  const [{ data: pipelines }, { data: stages }] = await Promise.all([
    db.from('crm_pipelines').select('*').eq('archived', false).order('position'),
    db.from('crm_pipeline_stages').select('*').eq('archived', false).order('position'),
  ])
  return (pipelines || []).map((p) => ({ ...p, stages: (stages || []).filter((s) => s.pipeline_id === p.id) }))
}

export async function getDefaultPipeline(): Promise<{ pipelineId: string; stageId: string } | null> {
  const db = getSupabaseAdmin()
  const { data: pipe } = await db.from('crm_pipelines').select('id').eq('archived', false)
    .order('is_default', { ascending: false }).order('position').limit(1).maybeSingle()
  if (!pipe) return null
  const { data: stage } = await db.from('crm_pipeline_stages').select('id')
    .eq('pipeline_id', pipe.id).eq('archived', false).order('position').limit(1).maybeSingle()
  if (!stage) return null
  return { pipelineId: pipe.id as string, stageId: stage.id as string }
}

export async function createPipeline(name: string) {
  const { data } = await getSupabaseAdmin().from('crm_pipelines').insert({ name }).select('*').single()
  return data
}
export async function updatePipeline(id: string, patch: Patch) {
  const clean: Patch = {}
  for (const k of ['name', 'position', 'archived', 'is_default']) if (k in patch) clean[k] = patch[k]
  const { data } = await getSupabaseAdmin().from('crm_pipelines').update(clean).eq('id', id).select('*').single()
  return data
}
export async function createStage(pipelineId: string, patch: Patch) {
  const db = getSupabaseAdmin()
  const { data: last } = await db.from('crm_pipeline_stages').select('position').eq('pipeline_id', pipelineId).order('position', { ascending: false }).limit(1).maybeSingle()
  const key = String(patch.key || patch.name || 'stage').toString().toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '').slice(0, 40)
  const { data } = await db.from('crm_pipeline_stages').insert({
    pipeline_id: pipelineId, name: patch.name, key,
    color: patch.color || '#6b7280', position: (Number(last?.position) || 0) + 1,
    is_won: !!patch.is_won, is_lost: !!patch.is_lost,
  }).select('*').single()
  return data
}
export async function updateStage(id: string, patch: Patch) {
  const clean: Patch = {}
  for (const k of ['name', 'color', 'position', 'is_won', 'is_lost', 'archived']) if (k in patch) clean[k] = patch[k]
  const { data } = await getSupabaseAdmin().from('crm_pipeline_stages').update(clean).eq('id', id).select('*').single()
  return data
}
export async function reorderStages(orderedIds: string[]) {
  const db = getSupabaseAdmin()
  await Promise.all(orderedIds.map((id, i) => db.from('crm_pipeline_stages').update({ position: i }).eq('id', id)))
}

// ── Opportunities ──
const OPP_COLS = ['name', 'value', 'currency', 'probability', 'expected_close_date', 'products', 'source', 'owner', 'notes', 'pipeline_id'] as const

export async function createOpportunity(input: Patch & { contact_id: string }, actor?: string) {
  const db = getSupabaseAdmin()
  let pipelineId = input.pipeline_id as string | undefined
  let stageId = input.stage_id as string | undefined
  if (!pipelineId || !stageId) {
    const def = await getDefaultPipeline()
    if (!def) throw new Error('No pipeline configured.')
    pipelineId = pipelineId || def.pipelineId
    stageId = stageId || def.stageId
  }
  const insert: Patch = { contact_id: input.contact_id, pipeline_id: pipelineId, stage_id: stageId }
  for (const k of OPP_COLS) if (input[k] !== undefined && k !== 'pipeline_id') insert[k] = input[k]
  if (!insert.name) insert.name = 'New opportunity'
  const { data, error } = await db.from('crm_opportunities').insert(insert).select('*').single()
  if (error || !data) { console.error('createOpportunity failed', error); return null }
  await audit(actor || null, 'opportunity.created', 'opportunity', data.id as string, input.contact_id, null, data)
  emitEvent('opportunity_created', { contact_id: input.contact_id, opportunity_id: data.id })
  await logActivity((await contactEmail(input.contact_id)) || '', 'deal', `Opportunity created: ${insert.name}`, undefined, { opportunity_id: data.id }, actor)
  await syncContactRollup(input.contact_id)
  return data
}

export async function updateOpportunity(id: string, patch: Patch, actor?: string) {
  const db = getSupabaseAdmin()
  const { data: existing } = await db.from('crm_opportunities').select('*').eq('id', id).maybeSingle()
  if (!existing) return null
  // Stage change → route through moveOpportunity for the won/lost + activity logic.
  if (patch.stage_id && patch.stage_id !== existing.stage_id) {
    await moveOpportunity(id, patch.stage_id as string, patch.position as number | undefined, actor)
  }
  const clean: Patch = {}
  for (const k of OPP_COLS) if (k in patch) clean[k] = patch[k]
  if ('position' in patch && !patch.stage_id) clean.position = patch.position
  if (Object.keys(clean).length) await db.from('crm_opportunities').update(clean).eq('id', id)
  const { data: after } = await db.from('crm_opportunities').select('*').eq('id', id).single()
  await audit(actor || null, 'opportunity.updated', 'opportunity', id, existing.contact_id as string, existing, after)
  emitEvent('opportunity_updated', { opportunity_id: id, contact_id: existing.contact_id })
  await syncContactRollup(existing.contact_id as string)
  return after
}

export async function moveOpportunity(id: string, stageId: string, position?: number, actor?: string) {
  const db = getSupabaseAdmin()
  const { data: opp } = await db.from('crm_opportunities').select('*').eq('id', id).maybeSingle()
  if (!opp) return null
  const { data: stage } = await db.from('crm_pipeline_stages').select('*').eq('id', stageId).maybeSingle()
  if (!stage) return null
  const patch: Patch = { stage_id: stageId }
  if (typeof position === 'number') patch.position = position
  if (stage.is_won) { patch.status = 'won'; patch.closed_at = new Date().toISOString() }
  else if (stage.is_lost) { patch.status = 'lost'; patch.closed_at = new Date().toISOString() }
  else { patch.status = 'open'; patch.closed_at = null }
  await db.from('crm_opportunities').update(patch).eq('id', id)

  const email = (await contactEmail(opp.contact_id as string)) || ''
  await logActivity(email, 'deal', `Opportunity → ${stage.name}`, (opp.name as string) || undefined, { opportunity_id: id, stage: stage.key }, actor)
  await audit(actor || null, 'opportunity.stage_changed', 'opportunity', id, opp.contact_id as string, { stage_id: opp.stage_id }, { stage_id: stageId })
  emitEvent('opportunity_stage_changed', { opportunity_id: id, contact_id: opp.contact_id, stage: stage.key, email })
  if (stage.is_won) emitEvent('opportunity_won', { opportunity_id: id, contact_id: opp.contact_id, value: opp.value, email })
  if (stage.is_lost) emitEvent('opportunity_lost', { opportunity_id: id, contact_id: opp.contact_id, email })
  await syncContactRollup(opp.contact_id as string)
  return { ...opp, ...patch }
}

export async function softDeleteOpportunity(id: string, actor?: string) {
  const db = getSupabaseAdmin()
  const { data: opp } = await db.from('crm_opportunities').select('contact_id').eq('id', id).maybeSingle()
  await db.from('crm_opportunities').update({ deleted_at: new Date().toISOString() }).eq('id', id)
  if (opp) { await audit(actor || null, 'opportunity.deleted', 'opportunity', id, opp.contact_id as string, null, null); await syncContactRollup(opp.contact_id as string) }
}

/* Ensure a contact has an open opportunity (used by meeting sync). */
export async function ensurePrimaryOpportunity(contactId: string, opts: { name?: string; source?: string } = {}) {
  const db = getSupabaseAdmin()
  const { data: open } = await db.from('crm_opportunities').select('*')
    .eq('contact_id', contactId).eq('status', 'open').is('deleted_at', null)
    .order('updated_at', { ascending: false }).limit(1).maybeSingle()
  if (open) return open
  return createOpportunity({ contact_id: contactId, name: opts.name || 'Strategy call', source: opts.source }, 'system')
}

export async function moveOpportunityToStageKey(oppId: string, pipelineId: string, stageKey: string, actor?: string) {
  const { data: stage } = await getSupabaseAdmin().from('crm_pipeline_stages').select('id')
    .eq('pipeline_id', pipelineId).eq('key', stageKey).maybeSingle()
  if (stage?.id) return moveOpportunity(oppId, stage.id as string, undefined, actor)
  return null
}

// ── Board (Kanban read) ──
export async function listBoard(pipelineId?: string) {
  const db = getSupabaseAdmin()
  let pid = pipelineId
  if (!pid) { const def = await getDefaultPipeline(); pid = def?.pipelineId }
  if (!pid) return { pipeline: null, stages: [] }
  const [{ data: pipeline }, { data: stages }, { data: opps }] = await Promise.all([
    db.from('crm_pipelines').select('*').eq('id', pid).maybeSingle(),
    db.from('crm_pipeline_stages').select('*').eq('pipeline_id', pid).eq('archived', false).order('position'),
    db.from('crm_opportunities')
      .select('*, contact:crm_contacts(id,name,email,company,lead_score,tags,call_booked,last_activity_at)')
      .eq('pipeline_id', pid).is('deleted_at', null).order('position'),
  ])
  // Attach the next open task per opportunity (single query).
  const oppIds = (opps || []).map((o) => o.id as string)
  const nextTask = new Map<string, Row>()
  if (oppIds.length) {
    const { data: tasks } = await db.from('crm_tasks').select('opportunity_id,title,due_date')
      .in('opportunity_id', oppIds).neq('status', 'done').order('due_date', { ascending: true, nullsFirst: false })
    for (const t of tasks || []) if (t.opportunity_id && !nextTask.has(t.opportunity_id as string)) nextTask.set(t.opportunity_id as string, t)
  }
  const byStage = new Map<string, Row[]>()
  for (const o of opps || []) {
    const arr = byStage.get(o.stage_id as string) || []
    arr.push({ ...o, next_task: nextTask.get(o.id as string) || null })
    byStage.set(o.stage_id as string, arr)
  }
  return {
    pipeline,
    stages: (stages || []).map((s) => {
      const items = byStage.get(s.id as string) || []
      return { ...s, opportunities: items, count: items.length, value: items.reduce((sum, o) => sum + Number(o.value || 0), 0) }
    }),
  }
}

export async function getOpportunity(id: string) {
  const db = getSupabaseAdmin()
  const { data: opp } = await db.from('crm_opportunities')
    .select('*, contact:crm_contacts(*), stage:crm_pipeline_stages(*), pipeline:crm_pipelines(*)')
    .eq('id', id).maybeSingle()
  if (!opp) return null
  const contactId = opp.contact_id as string
  const [meetings, tasks, activities] = await Promise.all([
    db.from('crm_meetings').select('*').eq('opportunity_id', id).order('starts_at', { ascending: false }),
    db.from('crm_tasks').select('*').eq('opportunity_id', id).order('due_date', { ascending: true, nullsFirst: false }),
    db.from('crm_activities').select('*').eq('contact_id', contactId).order('created_at', { ascending: false }).limit(50),
  ])
  return { opportunity: opp, meetings: meetings.data || [], tasks: tasks.data || [], activities: activities.data || [] }
}

// ── Rollup: keep crm_contacts.pipeline_stage + revenue in sync ──
export async function syncContactRollup(contactId: string) {
  const db = getSupabaseAdmin()
  const { data: opps } = await db.from('crm_opportunities')
    .select('value,status,updated_at, stage:crm_pipeline_stages(key,is_won,is_lost)')
    .eq('contact_id', contactId).is('deleted_at', null).order('updated_at', { ascending: false })
  const list = opps || []
  const wonTotal = list.filter((o) => o.status === 'won').reduce((s, o) => s + Number(o.value || 0), 0)
  const primary = list.find((o) => o.status === 'open') || list[0]
  const stage = primary?.stage as { key?: string } | undefined
  const patch: Row = { revenue: Math.round(wonTotal * 100) / 100 }
  if (stage?.key) patch.pipeline_stage = stage.key
  await db.from('crm_contacts').update(patch).eq('id', contactId)
}

// ── small helper ──
async function contactEmail(contactId: string): Promise<string | null> {
  const { data } = await getSupabaseAdmin().from('crm_contacts').select('email').eq('id', contactId).maybeSingle()
  return (data?.email as string) || null
}
