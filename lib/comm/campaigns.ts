/* Campaigns (broadcast to an audience) + Sequences (drip) — both send THROUGH
   the Communication Engine's queue, so suppression, rate limits, provider
   failover, tracking and the CRM timeline all apply. (3I.8A.3) */
import { getSupabaseAdmin } from '@/lib/supabase'
import { unsubscribeUrl, isUnsubscribed } from '@/lib/comm/unsubscribe'

type Row = Record<string, unknown>
export interface Audience { tags?: string[]; lifecycle_stage?: string; pipeline_stage?: string; country?: string; min_score?: number }
const interp = (s: unknown, v: Row) => String(s ?? '').replace(/\{\{\s*([\w.]+)\s*\}\}/g, (_m, k) => { const x = v[k]; return x == null ? '' : String(x) })

// ── Audience resolution over the CRM ──
function applyAudience<T>(q: T, a: Audience): T {
  let query = q as unknown as { eq: (c: string, v: unknown) => typeof query; gte: (c: string, v: unknown) => typeof query; overlaps: (c: string, v: unknown) => typeof query }
  if (a.lifecycle_stage) query = query.eq('lifecycle_stage', a.lifecycle_stage)
  if (a.pipeline_stage) query = query.eq('pipeline_stage', a.pipeline_stage)
  if (a.country) query = query.eq('country', a.country)
  if (a.min_score != null) query = query.gte('lead_score', a.min_score)
  if (a.tags?.length) query = query.overlaps('tags', a.tags)
  return query as unknown as T
}
export async function countAudience(a: Audience): Promise<number> {
  let q = getSupabaseAdmin().from('crm_contacts').select('id', { count: 'exact', head: true }).is('deleted_at', null).not('email', 'is', null)
  q = applyAudience(q, a)
  const { count } = await q
  return count || 0
}
export async function resolveAudience(a: Audience, limit = 5000): Promise<Array<{ id: string; name: string; email: string }>> {
  let q = getSupabaseAdmin().from('crm_contacts').select('id,name,email').is('deleted_at', null).not('email', 'is', null).limit(limit)
  q = applyAudience(q, a)
  const { data } = await q
  return (data || []).map((r) => ({ id: r.id as string, name: (r.name as string) || '', email: (r.email as string) || '' })).filter((r) => r.email)
}

async function defaultSender(): Promise<{ from: string; reply_to: string | null }> {
  const { data } = await getSupabaseAdmin().from('comm_senders').select('name,email,reply_to').eq('enabled', true).order('is_default', { ascending: false }).limit(1).maybeSingle()
  if (!data) return { from: 'The5th <indrodip@10kroadmap.org>', reply_to: null }
  return { from: `${data.name} <${data.email}>`, reply_to: (data.reply_to as string) || null }
}
function personalize(c: { id: string; name: string; email: string }, subject: string, body: string, sender: { from: string; reply_to: string | null }, extra: Row) {
  const vars: Row = { name: c.name, first_name: (c.name || '').split(' ')[0], email: c.email, unsubscribe_url: unsubscribeUrl(c.email) }
  return { channel: 'email', direction: 'outbound', to_addr: c.email, from_addr: sender.from, reply_to: sender.reply_to, subject: interp(subject, vars), body: interp(body, vars), status: 'queued', contact_id: c.id, contact_email: c.email, priority: 120, tags: [], ...extra }
}

// ── Campaigns ──
export async function sendCampaign(id: string): Promise<{ queued: number }> {
  const db = getSupabaseAdmin()
  const { data: c } = await db.from('comm_campaigns').select('*').eq('id', id).maybeSingle()
  if (!c || !c.template_id) return { queued: 0 }
  const { data: tpl } = await db.from('comm_templates').select('subject,body').eq('id', c.template_id as string).maybeSingle()
  if (!tpl) return { queued: 0 }
  const [audience, sender, sup] = await Promise.all([resolveAudience((c.audience as Audience) || {}), defaultSender(), db.from('email_unsubscribes').select('email')])
  const suppressed = new Set((sup.data || []).map((r) => (r.email as string).toLowerCase()))
  const subject = (c.subject as string) || (tpl.subject as string) || ''
  const rows = audience.filter((x) => !suppressed.has(x.email.toLowerCase())).map((x) => personalize(x, subject, tpl.body as string, sender, { source: 'campaign', campaign_id: id, tags: ['campaign'] }))
  for (let i = 0; i < rows.length; i += 500) await db.from('comm_messages').insert(rows.slice(i, i + 500))
  await db.from('comm_campaigns').update({ status: 'sent', total: rows.length, sent_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq('id', id)
  return { queued: rows.length }
}
export async function processScheduledCampaigns(): Promise<{ sent: number }> {
  const db = getSupabaseAdmin()
  const { data } = await db.from('comm_campaigns').select('id').eq('status', 'scheduled').lte('scheduled_at', new Date().toISOString()).limit(10)
  let sent = 0
  for (const c of data || []) { await db.from('comm_campaigns').update({ status: 'sending' }).eq('id', c.id); await sendCampaign(c.id as string); sent++ }
  return { sent }
}

// ── Sequences (drip) ──
export async function enrollContact(sequenceId: string, ref: { contactId?: string; email?: string }): Promise<{ ok: boolean; error?: string }> {
  const db = getSupabaseAdmin()
  let email = ref.email || '', contactId = ref.contactId || null
  if (contactId && !email) { const { data } = await db.from('crm_contacts').select('email').eq('id', contactId).maybeSingle(); email = (data?.email as string) || '' }
  if (!email) return { ok: false, error: 'no email' }
  const { data: steps } = await db.from('comm_sequence_steps').select('delay_hours').eq('sequence_id', sequenceId).order('step_order').limit(1)
  if (!steps?.length) return { ok: false, error: 'sequence has no steps' }
  const firstDelay = Number(steps[0].delay_hours || 0)
  const { error } = await db.from('comm_sequence_enrollments').insert({ sequence_id: sequenceId, contact_id: contactId, contact_email: email.toLowerCase(), current_step: 0, next_run_at: new Date(Date.now() + firstDelay * 3600000).toISOString() })
  const { count } = await db.from('comm_sequence_enrollments').select('id', { count: 'exact', head: true }).eq('sequence_id', sequenceId)
  await db.from('comm_sequences').update({ enrolled: count || 0, updated_at: new Date().toISOString() }).eq('id', sequenceId)
  return { ok: !error, error: error?.message }
}
export async function processSequences(limit = 60): Promise<{ sent: number; completed: number }> {
  const db = getSupabaseAdmin()
  const { data: due } = await db.from('comm_sequence_enrollments').select('*').eq('status', 'active').lte('next_run_at', new Date().toISOString()).limit(limit)
  let sent = 0, completed = 0
  const sender = await defaultSender()
  for (const e of due || []) {
    const { data: steps } = await db.from('comm_sequence_steps').select('*').eq('sequence_id', e.sequence_id as string).order('step_order')
    const idx = Number(e.current_step || 0)
    const step = (steps || [])[idx]
    if (!step) { await db.from('comm_sequence_enrollments').update({ status: 'completed', completed_at: new Date().toISOString() }).eq('id', e.id); completed++; continue }
    if (!(await isUnsubscribed(e.contact_email as string)) && step.template_id) {
      const { data: tpl } = await db.from('comm_templates').select('subject,body').eq('id', step.template_id as string).maybeSingle()
      if (tpl) { const row = personalize({ id: (e.contact_id as string) || '', name: '', email: e.contact_email as string }, (step.subject as string) || (tpl.subject as string) || '', tpl.body as string, sender, { source: 'sequence' }); await db.from('comm_messages').insert(row); sent++ }
    }
    const next = (steps || [])[idx + 1]
    if (next) await db.from('comm_sequence_enrollments').update({ current_step: idx + 1, next_run_at: new Date(Date.now() + Number(next.delay_hours || 0) * 3600000).toISOString() }).eq('id', e.id)
    else { await db.from('comm_sequence_enrollments').update({ status: 'completed', current_step: idx + 1, completed_at: new Date().toISOString() }).eq('id', e.id); completed++ }
  }
  return { sent, completed }
}
