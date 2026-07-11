/* Automation Studio engine (3I.6) — an AI-native, graph-based workflow runner.
   Triggers come from the platform event bus, actions from the Tool Registry +
   native CRM actions, reasoning from the AI router, and human gates from the
   approval engine. A workflow is an ordered list of typed nodes executed with a
   shared variable context; delay/approval nodes pause and resume (via cron/API). */
import { getSupabaseAdmin } from '@/lib/supabase'
import { anthropic, modelFor, type TaskKind } from '@/lib/ai/router'
import { logAiEvent, costOf } from '@/lib/ai-usage'
import { getRegistered } from '@/lib/ai/registry'
import { createTask, addNote, updateContact, resolveContact } from '@/lib/crm'

type Row = Record<string, unknown>
export interface Node { id: string; type: string; config?: Row }
export interface Workflow { id: string; name: string; version?: number; trigger?: Row; graph?: { nodes?: Node[] } }
export interface RunResult { runId: string; status: string; steps: Row[]; costUsd: number; error?: string }

// ── Catalogs surfaced to the builder + NL generator ──
export const TRIGGER_TYPES = [
  'contact_created', 'contact_updated', 'appointment_booked', 'meeting_completed',
  'purchase_recorded', 'refund_recorded', 'task_created', 'task_completed',
  'content_published', 'opportunity_won', 'opportunity_lost', 'lead_score_changed',
  'webhook_received', 'revenue_recorded', 'schedule', 'manual', 'webhook',
]
export const ACTION_TYPES = [
  'create_contact', 'update_contact', 'create_task', 'add_note', 'create_opportunity',
  'move_stage', 'add_tag', 'update_score', 'recommend_product', 'notify', 'log', 'trigger_webhook',
]

// ── Variable interpolation: {{path.to.value}} ──
function get(vars: Row, path: string): unknown { return path.split('.').reduce<unknown>((o, k) => (o == null ? undefined : (o as Row)[k]), vars) }
function interp<T>(v: T, vars: Row): T {
  if (typeof v === 'string') return v.replace(/\{\{\s*([\w.]+)\s*\}\}/g, (_m, p) => { const x = get(vars, p); return x == null ? '' : String(x) }) as unknown as T
  if (Array.isArray(v)) return v.map((x) => interp(x, vars)) as unknown as T
  if (v && typeof v === 'object') { const o: Row = {}; for (const k in v as Row) o[k] = interp((v as Row)[k], vars); return o as unknown as T }
  return v
}

// ── Condition evaluation ──
function cmp(a: unknown, op: string, b: string): boolean {
  const an = Number(a), bn = Number(b), numeric = !isNaN(an) && !isNaN(bn)
  const as = String(a ?? '').toLowerCase(), bs = String(b ?? '').toLowerCase()
  switch (op) {
    case 'eq': return as === bs
    case 'ne': return as !== bs
    case 'gt': return numeric && an > bn
    case 'gte': return numeric && an >= bn
    case 'lt': return numeric && an < bn
    case 'lte': return numeric && an <= bn
    case 'contains': return as.includes(bs)
    case 'exists': return a != null && a !== ''
    default: return true
  }
}
export function evalConditions(conds: Array<{ field: string; op: string; value: string }> = [], match: string, vars: Row): boolean {
  if (!conds.length) return true
  const r = conds.map((c) => cmp(get(vars, c.field), c.op, String(c.value ?? '')))
  return match === 'any' ? r.some(Boolean) : r.every(Boolean)
}

// ── Native action library (reused by action nodes; unknown names fall through
//    to the shared Tool Registry so any registered tool is callable) ──
async function contactIdByEmail(email: string): Promise<string | null> {
  if (!email) return null
  const { data } = await getSupabaseAdmin().from('crm_contacts').select('id').eq('email', email.toLowerCase()).maybeSingle()
  return (data?.id as string) || null
}
async function runAction(name: string, params: Row, vars: Row): Promise<string> {
  const db = getSupabaseAdmin()
  const p = interp(params, vars)
  const email = String(p.email || vars.email || '')
  switch (name) {
    case 'create_contact': {
      if (!email) return 'no email'
      await db.from('crm_contacts').upsert({ email: email.toLowerCase(), name: (p.name as string) || null, source: (p.source as string) || 'automation' }, { onConflict: 'email' })
      return 'contact upserted'
    }
    case 'update_contact': { const id = await contactIdByEmail(email); if (!id) return 'no contact'; await updateContact(id, (p.fields as Row) || {}, 'automation'); return 'contact updated' }
    case 'create_task': {
      const id = email ? await resolveContact({ email }) : null
      await createTask({ contactId: (id as Row | null)?.id as string || null, title: String(p.title || 'Follow up'), description: p.description ? String(p.description) : undefined, dueDate: p.due_in_days != null ? new Date(Date.now() + Number(p.due_in_days) * 86400000).toISOString().slice(0, 10) : null })
      return 'task created'
    }
    case 'add_note': { const c = email ? await resolveContact({ email }) : null; if (!c) return 'no contact'; await addNote((c as Row).id as string, String(p.body || ''), { author: 'automation' }); return 'note added' }
    case 'create_opportunity': {
      const c = email ? await resolveContact({ email }) : null
      await db.from('crm_opportunities').insert({ contact_id: (c as Row | null)?.id || null, name: String(p.name || 'New opportunity'), value: Number(p.value || 0), status: 'open' })
      return 'opportunity created'
    }
    case 'move_stage': { const id = await contactIdByEmail(email); if (!id) return 'no contact'; await updateContact(id, { pipeline_stage: String(p.stage || 'qualified') }, 'automation'); return 'stage moved' }
    case 'add_tag': {
      const id = await contactIdByEmail(email); if (!id) return 'no contact'
      const tag = String(p.tag || '').trim(); if (!tag) return 'no tag'
      const { data: t } = await db.from('crm_tags').upsert({ name: tag }, { onConflict: 'name' }).select('id').single()
      if (t?.id) await db.from('crm_contact_tags').upsert({ contact_id: id, tag_id: t.id }, { onConflict: 'contact_id,tag_id' })
      return 'tag added'
    }
    case 'update_score': {
      const id = await contactIdByEmail(email); if (!id) return 'no contact'
      const { data } = await db.from('crm_contacts').select('lead_score').eq('id', id).single()
      const val = p.set != null ? Number(p.set) : Number(data?.lead_score || 0) + Number(p.delta || 0)
      await db.from('crm_contacts').update({ lead_score: Math.max(0, Math.round(val)) }).eq('id', id); return 'score updated'
    }
    case 'recommend_product': { const c = email ? await resolveContact({ email }) : null; if (c) await addNote((c as Row).id as string, 'Recommended: ' + String(p.product || ''), { author: 'automation' }); return 'recommended' }
    case 'notify': case 'send_notification': { await db.from('notifications').insert({ type: String(p.type || 'automation'), title: String(p.title || 'Automation'), body: String(p.body || '') }); return 'notified' }
    case 'log': { await db.from('system_logs').insert({ level: 'info', source: 'automation', message: String(p.message || 'Automation step') }); return 'logged' }
    case 'trigger_webhook': {
      if (!p.url) return 'no url'
      await fetch(String(p.url), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify((p.body as Row) || vars) }).catch(() => {})
      return 'webhook sent'
    }
    default: {
      const tool = getRegistered(name)
      if (tool) return await tool.run(p)
      return 'unknown action: ' + name
    }
  }
}

// ── AI node ──
async function runAiNode(cfg: Row, vars: Row, actor?: string): Promise<{ output: string; cost: number }> {
  const ai = anthropic()
  if (!ai) return { output: '', cost: 0 }
  const model = modelFor((['chat', 'cheap', 'reasoning'].includes(String(cfg.task)) ? cfg.task : 'cheap') as TaskKind)
  const prompt = interp(String(cfg.prompt || ''), vars)
  const t0 = Date.now()
  const msg = await ai.messages.create({ model, max_tokens: Number(cfg.max_tokens) || 700, system: 'You are an automation step in The5th Business OS. Follow the instruction precisely and return only the requested output — no preamble.', messages: [{ role: 'user', content: prompt || 'Summarize the provided context.' + JSON.stringify(vars).slice(0, 4000) }] })
  await logAiEvent({ endpoint: 'automation', model, usage: msg.usage, latencyMs: Date.now() - t0, email: actor })
  const text = msg.content.find((b) => b.type === 'text')
  return { output: text && text.type === 'text' ? text.text : '', cost: costOf(model, msg.usage) }
}

// ── Runner ──
export async function runWorkflow(wf: Workflow, triggerData: Row = {}, opts: { test?: boolean; actor?: string } = {}): Promise<RunResult> {
  const db = getSupabaseAdmin()
  const { data: run } = await db.from('automation_workflow_runs').insert({
    workflow_id: wf.id, workflow_name: wf.name, version: wf.version || 1,
    trigger_type: String((wf.trigger as Row)?.type || 'manual'), trigger_data: triggerData,
    status: opts.test ? 'test' : 'running', is_test: !!opts.test,
  }).select('id').single()
  const runId = (run?.id as string) || ''
  const vars: Row = { ...triggerData, trigger: triggerData }
  return execFrom(wf, runId, (wf.graph?.nodes) || [], 0, vars, [], 0, opts)
}

async function execFrom(wf: Workflow, runId: string, nodes: Node[], start: number, vars: Row, steps: Row[], cost: number, opts: { test?: boolean; actor?: string }): Promise<RunResult> {
  const db = getSupabaseAdmin()
  const started = Date.now()
  for (let i = start; i < nodes.length; i++) {
    const node = nodes[i]; const cfg = node.config || {}
    // Pausing nodes — persist and stop; a resume (cron/approval) continues here.
    if (node.type === 'delay' && !opts.test) {
      const ms = (Number(cfg.days) || 0) * 86400000 + (Number(cfg.hours) || 0) * 3600000 + (Number(cfg.minutes) || 0) * 60000
      steps.push({ node: node.id, type: 'delay', ok: true, output: `wait ${ms}ms`, ts: new Date().toISOString() })
      await db.from('automation_workflow_runs').update({ status: 'scheduled', resume_index: i + 1, resume_at: new Date(Date.now() + Math.max(60000, ms)).toISOString(), steps, vars, cost_usd: round(cost) }).eq('id', runId)
      return { runId, status: 'scheduled', steps, costUsd: round(cost) }
    }
    if (node.type === 'approval' && !opts.test) {
      steps.push({ node: node.id, type: 'approval', ok: true, output: 'awaiting human approval', ts: new Date().toISOString() })
      await db.from('automation_workflow_runs').update({ status: 'awaiting_approval', resume_index: i + 1, steps, vars, cost_usd: round(cost), approval_note: String(interp(cfg.title || 'Approval required', vars)) }).eq('id', runId)
      await db.from('notifications').insert({ type: 'automation_approval', title: `Approval: ${wf.name}`, body: String(interp(cfg.note || cfg.title || 'A workflow step needs your approval.', vars)) })
      return { runId, status: 'awaiting_approval', steps, costUsd: round(cost) }
    }
    try {
      if (node.type === 'trigger' || node.type === 'end') { /* markers */ }
      else if (node.type === 'condition') {
        const ok = evalConditions((cfg.conditions as Array<{ field: string; op: string; value: string }>) || [], String(cfg.match || 'all'), vars)
        steps.push({ node: node.id, type: 'condition', ok, output: ok ? 'passed' : 'stopped', ts: new Date().toISOString() })
        if (!ok) return finalize(runId, 'success', steps, vars, cost, Date.now() - started, opts, wf, 'stopped')
      } else if (node.type === 'ai') {
        const { output, cost: c } = await runAiNode(cfg, vars, opts.actor); cost += c
        vars[String(cfg.output || 'ai')] = output
        steps.push({ node: node.id, type: 'ai', ok: true, output: output.slice(0, 1200), ts: new Date().toISOString() })
      } else if (node.type === 'action') {
        const out = await runAction(String(cfg.action || ''), (cfg.params as Row) || {}, vars)
        steps.push({ node: node.id, type: 'action', ok: true, action: cfg.action, output: out, ts: new Date().toISOString() })
      } else if (node.type === 'notify') {
        await runAction('notify', { title: cfg.title, body: cfg.body, type: cfg.notify_type }, vars)
        steps.push({ node: node.id, type: 'notify', ok: true, output: 'notified', ts: new Date().toISOString() })
      } else {
        steps.push({ node: node.id, type: node.type, ok: true, output: 'skipped (unsupported)', ts: new Date().toISOString() })
      }
    } catch (e) {
      steps.push({ node: node.id, type: node.type, ok: false, error: String(e), ts: new Date().toISOString() })
      return finalize(runId, 'error', steps, vars, cost, Date.now() - started, opts, wf, String(e))
    }
  }
  return finalize(runId, 'success', steps, vars, cost, Date.now() - started, opts, wf)
}

function round(n: number) { return Math.round(n * 1e6) / 1e6 }
async function finalize(runId: string, status: string, steps: Row[], vars: Row, cost: number, ms: number, opts: { test?: boolean }, wf: Workflow, error?: string): Promise<RunResult> {
  const db = getSupabaseAdmin()
  await db.from('automation_workflow_runs').update({ status: opts.test ? 'test' : status, steps, vars, cost_usd: round(cost), duration_ms: ms, error: error && status === 'error' ? error : null, finished_at: new Date().toISOString() }).eq('id', runId)
  if (!opts.test && wf.id) {
    const inc = status === 'error' ? { fail_count: 1 } : { success_count: 1 }
    const { data: cur } = await db.from('automation_workflows').select('runs,success_count,fail_count').eq('id', wf.id).single()
    await db.from('automation_workflows').update({ runs: Number(cur?.runs || 0) + 1, success_count: Number(cur?.success_count || 0) + (inc.success_count || 0), fail_count: Number(cur?.fail_count || 0) + (inc.fail_count || 0), last_run_at: new Date().toISOString(), last_status: status }).eq('id', wf.id)
  }
  return { runId, status, steps, costUsd: round(cost), error }
}

/* Resume a paused run (approval approved, or a scheduled delay elapsed). */
export async function resumeRun(runId: string, opts: { rejected?: boolean } = {}): Promise<RunResult | null> {
  const db = getSupabaseAdmin()
  const { data: run } = await db.from('automation_workflow_runs').select('*').eq('id', runId).maybeSingle()
  if (!run) return null
  const steps = (run.steps as Row[]) || []
  if (opts.rejected) {
    await db.from('automation_workflow_runs').update({ status: 'error', error: 'rejected at approval', finished_at: new Date().toISOString() }).eq('id', runId)
    return { runId, status: 'error', steps, costUsd: Number(run.cost_usd || 0), error: 'rejected' }
  }
  const { data: wf } = await db.from('automation_workflows').select('*').eq('id', run.workflow_id as string).maybeSingle()
  if (!wf) return null
  return execFrom(wf as unknown as Workflow, runId, ((wf.graph as Row)?.nodes as Node[]) || [], Number(run.resume_index || 0), (run.vars as Row) || {}, steps, Number(run.cost_usd || 0), {})
}

/* Dispatch a platform event to all matching published workflows. Called by the
   event bus (fire-and-forget). Trigger-level conditions gate each workflow. */
export async function dispatchEvent(type: string, ctx: Row): Promise<void> {
  const db = getSupabaseAdmin()
  const { data: wfs } = await db.from('automation_workflows').select('*').eq('status', 'published').eq('enabled', true).eq('trigger->>type', type)
  for (const wf of wfs || []) {
    const tc = ((wf.trigger as Row)?.config as Row) || {}
    if (!evalConditions((tc.conditions as Array<{ field: string; op: string; value: string }>) || [], String(tc.match || 'all'), ctx)) continue
    try { await runWorkflow(wf as unknown as Workflow, ctx) } catch (e) { console.error('workflow dispatch failed', e) }
  }
}

/* Cron hook: resume scheduled delays whose time has elapsed. */
export async function processScheduledRuns(): Promise<{ resumed: number }> {
  const db = getSupabaseAdmin()
  const { data } = await db.from('automation_workflow_runs').select('id').eq('status', 'scheduled').lte('resume_at', new Date().toISOString()).limit(25)
  let resumed = 0
  for (const r of data || []) { try { await resumeRun(r.id as string); resumed++ } catch (e) { console.error('resume failed', e) } }
  return { resumed }
}
