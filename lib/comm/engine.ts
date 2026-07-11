/* Communication Engine (3I.8A.1) — the single path for every outbound message.
   Validates → personalizes → stores → selects a provider (priority + failover)
   → sends → logs to the CRM timeline → emits an event. Nothing sends directly;
   everything flows through here, is queued, retried, rate-limited and observable. */
import { getSupabaseAdmin } from '@/lib/supabase'
import { PROVIDERS, getProvider } from '@/lib/comm/providers'
import { emitEvent } from '@/lib/events'

type Row = Record<string, unknown>
const MAX_ATTEMPTS = 3

export interface SendMessage {
  channel?: 'email' | 'sms' | 'whatsapp'; to: string; subject?: string; html?: string; text?: string
  from?: string; replyTo?: string; contactId?: string; contactEmail?: string
  templateId?: string; campaignId?: string; source?: string
  scheduledAt?: string; priority?: number; tags?: string[]
}

function interp(s: string, vars: Row): string { return String(s || '').replace(/\{\{\s*([\w.]+)\s*\}\}/g, (_m, k) => { const v = vars[k]; return v == null ? '' : String(v) }) }

async function defaultSender(): Promise<{ from: string; replyTo?: string }> {
  const { data } = await getSupabaseAdmin().from('comm_senders').select('name,email,reply_to').eq('enabled', true).order('is_default', { ascending: false }).limit(1).maybeSingle()
  if (!data) return { from: 'The5th <indrodip@10kroadmap.org>' }
  return { from: `${data.name} <${data.email}>`, replyTo: (data.reply_to as string) || undefined }
}

async function contactForRecipient(m: SendMessage): Promise<Row | null> {
  const db = getSupabaseAdmin()
  if (m.contactId) { const { data } = await db.from('crm_contacts').select('id,name,email').eq('id', m.contactId).maybeSingle(); if (data) return data }
  const email = (m.contactEmail || (m.channel === 'email' ? m.to : '')).toLowerCase()
  if (email) { const { data } = await db.from('crm_contacts').select('id,name,email').eq('email', email).maybeSingle(); return data }
  // Phone channels: link by phone number.
  if (m.channel === 'sms' || m.channel === 'whatsapp') {
    const digits = m.to.replace(/[^\d]/g, '').slice(-10)
    if (digits) { const { data } = await db.from('crm_contacts').select('id,name,email').ilike('phone', `%${digits}%`).limit(1).maybeSingle(); return data }
  }
  return null
}

/* Queue a message. Immediate messages are delivered inline; scheduled ones wait
   for the queue processor (cron). Returns the stored message id. */
export async function sendMessage(m: SendMessage): Promise<{ id: string | null; status: string; error?: string }> {
  const db = getSupabaseAdmin()
  const channel = m.channel || 'email'
  if (!m.to) return { id: null, status: 'failed', error: 'no recipient' }
  const contact = await contactForRecipient(m)
  const vars: Row = { name: (contact?.name as string) || '', first_name: String(contact?.name || '').split(' ')[0] || '', email: (contact?.email as string) || m.to }
  const sender = m.from ? { from: m.from, replyTo: m.replyTo } : await defaultSender()
  const scheduled = m.scheduledAt && new Date(m.scheduledAt).getTime() > Date.now()
  const toAddr = channel === 'whatsapp' && !m.to.startsWith('whatsapp:') ? `whatsapp:${m.to}` : m.to
  const { data } = await db.from('comm_messages').insert({
    channel, direction: 'outbound', to_addr: toAddr, from_addr: sender.from, reply_to: m.replyTo || sender.replyTo || null,
    subject: m.subject ? interp(m.subject, vars) : null, body: interp(m.html || m.text || '', vars),
    status: scheduled ? 'scheduled' : 'queued', contact_id: (contact?.id as string) || m.contactId || null, contact_email: (contact?.email as string) || m.contactEmail || (channel === 'email' ? m.to : null),
    template_id: m.templateId || null, campaign_id: m.campaignId || null, source: m.source || 'manual',
    priority: m.priority ?? 100, tags: m.tags || [], scheduled_at: m.scheduledAt || null,
  }).select('id').single()
  const id = (data?.id as string) || null
  if (!id) return { id: null, status: 'failed', error: 'store failed' }
  if (scheduled) return { id, status: 'scheduled' }
  return { id, ...(await deliver(id)) }
}

/* Attempt delivery through providers by priority, with failover. */
export async function deliver(id: string): Promise<{ status: string; error?: string }> {
  const db = getSupabaseAdmin()
  const { data: msg } = await db.from('comm_messages').select('*').eq('id', id).maybeSingle()
  if (!msg) return { status: 'failed', error: 'not found' }
  if (['sent', 'delivered', 'opened', 'clicked', 'cancelled'].includes(msg.status as string)) return { status: msg.status as string }
  await db.from('comm_messages').update({ status: 'sending', updated_at: new Date().toISOString() }).eq('id', id)

  const providerKind = msg.channel === 'whatsapp' ? 'sms' : (msg.channel as string)   // Twilio handles SMS + WhatsApp
  const { data: provRows } = await db.from('comm_providers').select('*').eq('enabled', true).eq('kind', providerKind).order('priority', { ascending: true })
  const candidates = (provRows || []).map((p) => ({ row: p, adapter: getProvider(p.slug as string) })).filter((c) => c.adapter)
  let lastErr = 'no configured provider'
  for (const c of candidates) {
    if (!(await c.adapter!.isConfigured())) { lastErr = `${c.adapter!.slug} not configured`; continue }
    if (await overLimit(c.row as Row)) { lastErr = `${c.adapter!.slug} rate limit reached`; continue }
    const r = await c.adapter!.send({ to: msg.to_addr as string, from: msg.from_addr as string, replyTo: (msg.reply_to as string) || undefined, subject: (msg.subject as string) || undefined, html: msg.channel === 'email' ? (msg.body as string) : undefined, text: msg.body as string, tags: (msg.tags as string[]) || [] })
    if (r.ok) {
      await db.from('comm_messages').update({ status: 'sent', provider: c.adapter!.slug, provider_message_id: r.id || null, sent_at: new Date().toISOString(), attempts: Number(msg.attempts || 0) + 1, error: null, updated_at: new Date().toISOString() }).eq('id', id)
      await logTimeline(msg, c.adapter!.slug)
      emitEvent(msg.channel === 'sms' ? 'sms_sent' : 'email_sent', { email: msg.contact_email, message_id: id, provider: c.adapter!.slug })
      return { status: 'sent' }
    }
    lastErr = r.error || 'send failed'
  }
  // All providers failed — retry with backoff or mark failed + alert.
  const attempts = Number(msg.attempts || 0) + 1
  if (attempts < MAX_ATTEMPTS) {
    const backoff = Math.pow(4, attempts) * 60000 // 4m, 16m
    await db.from('comm_messages').update({ status: 'queued', attempts, next_retry_at: new Date(Date.now() + backoff).toISOString(), error: lastErr, updated_at: new Date().toISOString() }).eq('id', id)
    return { status: 'queued', error: lastErr }
  }
  await db.from('comm_messages').update({ status: 'failed', attempts, failed_at: new Date().toISOString(), error: lastErr, updated_at: new Date().toISOString() }).eq('id', id)
  await db.from('notifications').insert({ type: 'comm_failed', title: 'Message delivery failed', body: `${msg.channel} to ${msg.to_addr}: ${lastErr}` })
  return { status: 'failed', error: lastErr }
}

async function overLimit(prov: Row): Promise<boolean> {
  const cap = Number((prov.config as Row)?.rate_limit_per_day || 0)
  if (!cap) return false
  const since = new Date(); since.setHours(0, 0, 0, 0)
  const { count } = await getSupabaseAdmin().from('comm_messages').select('id', { count: 'exact', head: true }).eq('provider', prov.slug as string).gte('sent_at', since.toISOString())
  return (count || 0) >= cap
}

async function logTimeline(msg: Row, provider: string) {
  if (!msg.contact_id) return
  try {
    await getSupabaseAdmin().from('crm_activities').insert({
      contact_id: msg.contact_id, contact_email: msg.contact_email, type: msg.channel === 'sms' ? 'sms' : 'email',
      title: `${msg.channel === 'sms' ? 'SMS' : 'Email'} sent: ${msg.subject || (msg.body as string || '').slice(0, 40)}`, actor: `comm:${provider}`,
    })
  } catch (e) { console.error('comm timeline log failed', e) }
}

/* Cron/queue processor: deliver due queued + scheduled messages. */
export async function processQueue(limit = 40): Promise<{ processed: number }> {
  const db = getSupabaseAdmin(); const now = new Date().toISOString()
  const { data } = await db.from('comm_messages').select('id,scheduled_at,next_retry_at').in('status', ['queued', 'scheduled'])
    .or(`scheduled_at.is.null,scheduled_at.lte.${now}`).limit(limit)
  let processed = 0
  for (const m of data || []) {
    if (m.next_retry_at && new Date(m.next_retry_at as string).getTime() > Date.now()) continue
    try { await deliver(m.id as string); processed++ } catch (e) { console.error('deliver failed', e) }
  }
  return { processed }
}

/* Apply an inbound provider status webhook to the stored message + CRM timeline. */
export async function applyWebhookEvents(events: Array<{ providerMessageId?: string; event: string }>): Promise<number> {
  const db = getSupabaseAdmin(); let n = 0
  const tsField: Record<string, string> = { delivered: 'delivered_at', opened: 'opened_at', clicked: 'clicked_at', replied: 'replied_at', failed: 'failed_at' }
  for (const e of events) {
    if (!e.providerMessageId) continue
    const patch: Row = { status: e.event, updated_at: new Date().toISOString() }
    if (tsField[e.event]) patch[tsField[e.event]] = new Date().toISOString()
    const { data } = await db.from('comm_messages').update(patch).eq('provider_message_id', e.providerMessageId).select('contact_id,contact_email,channel,subject').maybeSingle()
    if (data?.contact_id && ['delivered', 'opened', 'clicked', 'replied', 'bounced', 'complained'].includes(e.event)) {
      await db.from('crm_activities').insert({ contact_id: data.contact_id, contact_email: data.contact_email, type: (data.channel as string) === 'sms' ? 'sms' : 'email', title: `${data.channel === 'sms' ? 'SMS' : 'Email'} ${e.event}: ${data.subject || ''}`.slice(0, 120), actor: 'comm:webhook' })
    }
    n++
  }
  return n
}
export function providerSlugs(): string[] { return PROVIDERS.map((p) => p.slug) }
