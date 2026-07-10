/* Automation engine — the event-driven glue between every subsystem. Any
   module calls emitEvent(); the engine loads matching published workflows,
   evaluates conditions, runs actions, logs the execution, and (on failure)
   raises an internal notification. Fire-and-forget: never blocks a request. */
import Anthropic from '@anthropic-ai/sdk'
import { getSupabaseAdmin } from '@/lib/supabase'

// ── Registries (also surfaced to the admin builder) ──
export const TRIGGERS = [
  'lead_captured', 'lead_qualified', 'lead_score_changed', 'pipeline_changed',
  'program_recommended', 'human_handoff', 'appointment_booked', 'appointment_cancelled',
  'content_published', 'conversation_started', 'revenue_logged',
  // CRM OS foundation events
  'contact_created', 'contact_updated', 'activity_added', 'note_created',
  'task_created', 'task_completed', 'business_profile_updated',
  // Sales CRM (3I.2) events
  'opportunity_created', 'opportunity_updated', 'opportunity_stage_changed',
  'opportunity_won', 'opportunity_lost', 'meeting_synced', 'meeting_completed',
  'lead_score_changed',
  // AI CRM / attribution (3I.3) events
  'visitor_seen', 'identity_merged', 'attribution_recorded', 'purchase_recorded',
  'refund_recorded', 'content_viewed', 'insight_generated', 'integration_synced',
  // Command Center (3I.4) events
  'revenue_recorded', 'webhook_received', 'webhook_failed', 'notification_created',
] as const

/* Resolve a contact id from an email against the CRM source of truth. Kept
   local so the event bus never imports lib/crm (which imports emitEvent). */
async function contactIdByEmail(email: string): Promise<string | null> {
  if (!email) return null
  const { data } = await getSupabaseAdmin().from('crm_contacts').select('id').eq('email', email.toLowerCase()).maybeSingle()
  return (data?.id as string) || null
}

export const CONDITION_FIELDS = [
  'lead_score', 'pipeline_stage', 'country', 'interest', 'intent', 'program', 'email',
] as const

export const ACTIONS = [
  'create_task', 'add_tag', 'remove_tag', 'move_stage', 'update_score',
  'create_note', 'notify', 'log', 'ai_summary',
] as const

export interface Condition { field: string; op: string; value: string }
export interface Action { type: string; params?: Record<string, unknown> }
type Ctx = Record<string, unknown>

// ── Condition engine ──
function cmp(a: unknown, op: string, b: string): boolean {
  const an = Number(a), bn = Number(b)
  const numeric = !isNaN(an) && !isNaN(bn)
  switch (op) {
    case 'eq': return String(a ?? '').toLowerCase() === b.toLowerCase()
    case 'ne': return String(a ?? '').toLowerCase() !== b.toLowerCase()
    case 'gt': return numeric && an > bn
    case 'gte': return numeric && an >= bn
    case 'lt': return numeric && an < bn
    case 'lte': return numeric && an <= bn
    case 'contains': return String(a ?? '').toLowerCase().includes(b.toLowerCase())
    default: return false
  }
}
function evalConditions(conditions: Condition[], match: string, ctx: Ctx): boolean {
  if (!conditions?.length) return true
  const results = conditions.map((c) => cmp(ctx[c.field], c.op, c.value))
  return match === 'any' ? results.some(Boolean) : results.every(Boolean)
}

// ── Action registry ──
async function runAction(action: Action, ctx: Ctx): Promise<string> {
  const db = getSupabaseAdmin()
  const p = action.params || {}
  const email = String(ctx.email || '')
  switch (action.type) {
    case 'create_task': {
      const due = Number(p.due_in_days)
      const due_date = Number.isFinite(due) ? new Date(Date.now() + due * 86400000).toISOString().slice(0, 10) : null
      const cid = await contactIdByEmail(email)
      await db.from('crm_tasks').insert({ contact_id: cid, contact_email: email || null, title: String(p.title || 'Follow up'), due_date, priority: String(p.priority || 'normal') })
      return 'task created'
    }
    case 'add_tag':
    case 'remove_tag': {
      const cid = await contactIdByEmail(email)
      if (!cid) return 'no contact'
      const tag = String(p.tag || '').trim()
      if (!tag) return 'no tag'
      if (action.type === 'add_tag') {
        const { data: t } = await db.from('crm_tags').upsert({ name: tag }, { onConflict: 'name' }).select('id').single()
        if (t?.id) await db.from('crm_contact_tags').upsert({ contact_id: cid, tag_id: t.id }, { onConflict: 'contact_id,tag_id' })
      } else {
        const { data: t } = await db.from('crm_tags').select('id').eq('name', tag).maybeSingle()
        if (t?.id) await db.from('crm_contact_tags').delete().eq('contact_id', cid).eq('tag_id', t.id)
      }
      return action.type
    }
    case 'move_stage': {
      const cid = await contactIdByEmail(email)
      if (!cid) return 'no contact'
      await db.from('crm_contacts').update({ pipeline_stage: String(p.stage || 'qualified') }).eq('id', cid)
      await db.from('crm_activities').insert({ contact_id: cid, contact_email: email, type: 'note', title: `Automation → ${p.stage}` })
      return 'stage moved'
    }
    case 'update_score': {
      const cid = await contactIdByEmail(email)
      if (!cid) return 'no contact'
      const { data } = await db.from('crm_contacts').select('lead_score').eq('id', cid).single()
      const base = Number(data?.lead_score || 0)
      const val = p.set != null ? Number(p.set) : base + Number(p.delta || 0)
      await db.from('crm_contacts').update({ lead_score: Math.max(0, Math.round(val)) }).eq('id', cid)
      return 'score updated'
    }
    case 'create_note': {
      const cid = await contactIdByEmail(email)
      if (!cid) return 'no contact'
      await db.from('crm_notes').insert({ contact_id: cid, contact_email: email, body: String(p.body || ''), author: 'automation' })
      return 'note created'
    }
    case 'log': {
      const cid = await contactIdByEmail(email)
      await db.from('crm_activities').insert({ contact_id: cid, contact_email: email || null, type: 'note', title: String(p.message || 'Automation') })
      return 'logged'
    }
    case 'notify': {
      await db.from('notifications').insert({ type: String(p.type || 'automation'), title: String(p.title || 'Automation'), body: String(p.body || '') })
      return 'notified'
    }
    case 'ai_summary': {
      const cid = await contactIdByEmail(email)
      if (!cid || !process.env.ANTHROPIC_API_KEY) return 'skipped'
      const [{ data: lead }, { data: acts }] = await Promise.all([
        db.from('crm_contacts').select('name,interest,business_stage,lead_score,pipeline_stage,notes').eq('id', cid).single(),
        db.from('crm_activities').select('type,title,created_at').eq('contact_id', cid).order('created_at', { ascending: false }).limit(20),
      ])
      const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
      const msg = await client.messages.create({
        model: 'claude-haiku-4-5-20251001', max_tokens: 300,
        system: 'You write a crisp 3-4 sentence sales CRM summary of a lead for the team. Be factual; no fluff.',
        messages: [{ role: 'user', content: `Lead: ${JSON.stringify(lead)}\nRecent activity: ${JSON.stringify(acts)}` }],
      })
      const text = msg.content.find((b) => b.type === 'text')
      const summary = text && text.type === 'text' ? text.text : ''
      if (summary) await db.from('crm_notes').insert({ contact_id: cid, contact_email: email, body: 'AI summary: ' + summary, author: 'automation' })
      return 'summary generated'
    }
    default:
      return 'unknown action'
  }
}

async function runWorkflows(type: string, ctx: Ctx) {
  const db = getSupabaseAdmin()
  const { data: autos } = await db.from('automations').select('*').eq('trigger', type).eq('status', 'published').eq('enabled', true)
  for (const a of autos || []) {
    if (!evalConditions((a.conditions as Condition[]) || [], a.match, ctx)) continue
    const t0 = Date.now()
    const log: Array<{ action: string; ok: boolean; result?: string; error?: string }> = []
    let ok = true
    for (const action of (a.actions as Action[]) || []) {
      try {
        const r = await runAction(action, ctx)
        log.push({ action: action.type, ok: true, result: r })
      } catch (e) {
        // single automatic retry
        try { const r = await runAction(action, ctx); log.push({ action: action.type, ok: true, result: r + ' (retry)' }) }
        catch (e2) { ok = false; log.push({ action: action.type, ok: false, error: String(e2 || e) }) }
      }
    }
    await db.from('automation_runs').insert({ automation_id: a.id, automation_name: a.name, trigger: type, status: ok ? 'success' : 'error', log, duration_ms: Date.now() - t0 })
    await db.from('automations').update({ runs: (a.runs || 0) + 1, last_run_at: new Date().toISOString() }).eq('id', a.id)
    if (!ok) await db.from('notifications').insert({ type: 'automation_failed', title: `Automation failed: ${a.name}`, body: JSON.stringify(log) })
  }
}

/* Emit a platform event. Enriches with the contact record when an email is
   present so conditions can reference lead fields regardless of source. */
export async function emitEvent(type: string, data: Ctx = {}): Promise<void> {
  const run = (async () => {
    try {
      let ctx = { ...data }
      if (data.email) {
        const { data: lead } = await getSupabaseAdmin()
          .from('crm_contacts').select('lead_score,pipeline_stage,country,interest')
          .eq('email', String(data.email).toLowerCase()).maybeSingle()
        if (lead) ctx = { ...lead, ...ctx }
      }
      await runWorkflows(type, ctx)
    } catch (e) {
      console.error('emitEvent failed', type, e)
    }
  })()
  // fire-and-forget — never block the caller
  run.catch(() => {})
}
