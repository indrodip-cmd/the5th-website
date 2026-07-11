/* Communication OS — provider adapters + registry. Every provider plugs into the
   same abstraction so the engine never hardcodes a vendor. Add a provider by
   implementing Provider + adding it to PROVIDERS — no engine changes. */
import crypto from 'crypto'
import { Resend } from 'resend'
import { getSecret, hasSecret } from '@/lib/comm/config'

export interface SendInput { to: string; from: string; replyTo?: string; subject?: string; html?: string; text?: string; tags?: string[] }
export interface SendResult { ok: boolean; id?: string; error?: string }
export interface WebhookEvent { providerMessageId?: string; event: string; to?: string }
export interface Provider {
  slug: string; name: string; kind: 'email' | 'sms'; capabilities: string[]
  isConfigured(): Promise<boolean>
  requiredSecrets: string[]
  send(i: SendInput): Promise<SendResult>
  verifyWebhook?(headers: Record<string, string>, raw: string): boolean
  parseWebhook?(body: unknown): WebhookEvent[]
}

// Normalize provider status events to our canonical message statuses.
const EVENT_MAP: Record<string, string> = {
  'email.sent': 'sent', 'email.delivered': 'delivered', 'email.delivery_delayed': 'sending',
  'email.opened': 'opened', 'email.clicked': 'clicked', 'email.bounced': 'bounced', 'email.complained': 'complained',
  delivered: 'delivered', opened: 'opened', click: 'clicked', clicked: 'clicked', hard_bounce: 'bounced', soft_bounce: 'bounced',
  spam: 'complained', unsubscribed: 'complained', request: 'sent',
  sent: 'sent', failed: 'failed', undelivered: 'failed', queued: 'queued',
}
export const canonicalEvent = (e: string) => EVENT_MAP[e] || e

// ── Resend (transactional email) ──
const resend: Provider = {
  slug: 'resend', name: 'Resend', kind: 'email', requiredSecrets: ['RESEND_API_KEY'],
  capabilities: ['transactional', 'templates', 'attachments', 'webhooks', 'scheduling', 'tracking', 'reply_to', 'tags'],
  isConfigured: () => hasSecret('RESEND_API_KEY'),
  async send(i) {
    try {
      const key = await getSecret('RESEND_API_KEY'); if (!key) return { ok: false, error: 'RESEND_API_KEY not set' }
      const client = new Resend(key)
      const r = await client.emails.send({ from: i.from, to: i.to, subject: i.subject || '', html: i.html || i.text || '', replyTo: i.replyTo, tags: (i.tags || []).map((t) => ({ name: 'tag', value: t })) })
      if (r.error) return { ok: false, error: r.error.message }
      return { ok: true, id: r.data?.id }
    } catch (e) { return { ok: false, error: String(e) } }
  },
  verifyWebhook(headers, raw) {
    const secret = process.env.RESEND_WEBHOOK_SECRET || ''
    if (!secret) return true // accept when unset (still logged)
    try {
      const id = headers['svix-id'], ts = headers['svix-timestamp'], sig = headers['svix-signature'] || ''
      const key = Buffer.from(secret.replace(/^whsec_/, ''), 'base64')
      const expected = crypto.createHmac('sha256', key).update(`${id}.${ts}.${raw}`).digest('base64')
      return sig.split(' ').some((s) => s.split(',')[1] === expected)
    } catch { return false }
  },
  parseWebhook(body) {
    const b = body as { type?: string; data?: { email_id?: string; to?: string | string[] } }
    if (!b?.type) return []
    const to = Array.isArray(b.data?.to) ? b.data?.to[0] : b.data?.to
    return [{ providerMessageId: b.data?.email_id, event: canonicalEvent(b.type), to }]
  },
}

// ── Brevo (marketing + transactional email) ──
const brevo: Provider = {
  slug: 'brevo', name: 'Brevo', kind: 'email', requiredSecrets: ['BREVO_API_KEY'],
  capabilities: ['campaigns', 'bulk', 'lists', 'tracking', 'templates', 'webhooks', 'scheduling', 'statistics'],
  isConfigured: () => hasSecret('BREVO_API_KEY'),
  async send(i) {
    try {
      const key = await getSecret('BREVO_API_KEY'); if (!key) return { ok: false, error: 'BREVO_API_KEY not set' }
      const m = /<([^>]+)>/.exec(i.from); const email = m ? m[1] : i.from; const name = m ? i.from.replace(/<[^>]+>/, '').trim() : undefined
      const res = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST', headers: { 'api-key': key, 'Content-Type': 'application/json', accept: 'application/json' },
        body: JSON.stringify({ sender: { email, name }, to: [{ email: i.to }], subject: i.subject || '', htmlContent: i.html || `<p>${i.text || ''}</p>`, replyTo: i.replyTo ? { email: i.replyTo } : undefined, tags: i.tags }),
      })
      const j = await res.json().catch(() => ({}))
      if (!res.ok) return { ok: false, error: (j as { message?: string })?.message || `HTTP ${res.status}` }
      return { ok: true, id: (j as { messageId?: string }).messageId }
    } catch (e) { return { ok: false, error: String(e) } }
  },
  parseWebhook(body) {
    const b = body as { event?: string; 'message-id'?: string; email?: string }
    if (!b?.event) return []
    return [{ providerMessageId: b['message-id'], event: canonicalEvent(b.event), to: b.email }]
  },
}

// ── Twilio (SMS via REST) ──
const twilio: Provider = {
  slug: 'twilio', name: 'Twilio', kind: 'sms', requiredSecrets: ['TWILIO_ACCOUNT_SID', 'TWILIO_AUTH_TOKEN', 'TWILIO_FROM_NUMBER'],
  capabilities: ['sms', 'delivery_status', 'scheduled', 'webhooks', 'status'],
  async isConfigured() { return (await hasSecret('TWILIO_ACCOUNT_SID')) && (await hasSecret('TWILIO_AUTH_TOKEN')) && (await hasSecret('TWILIO_FROM_NUMBER')) },
  async send(i) {
    try {
      const sid = await getSecret('TWILIO_ACCOUNT_SID'), token = await getSecret('TWILIO_AUTH_TOKEN'), from = await getSecret('TWILIO_FROM_NUMBER')
      if (!sid || !token || !from) return { ok: false, error: 'Twilio not configured' }
      const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
        method: 'POST', headers: { Authorization: 'Basic ' + Buffer.from(`${sid}:${token}`).toString('base64'), 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ To: i.to, From: from, Body: i.text || i.subject || '' }),
      })
      const j = await res.json().catch(() => ({}))
      if (!res.ok) return { ok: false, error: (j as { message?: string })?.message || `HTTP ${res.status}` }
      return { ok: true, id: (j as { sid?: string }).sid }
    } catch (e) { return { ok: false, error: String(e) } }
  },
  parseWebhook(body) {
    const b = body as { MessageSid?: string; MessageStatus?: string }
    if (!b?.MessageSid) return []
    return [{ providerMessageId: b.MessageSid, event: canonicalEvent(b.MessageStatus || 'sent') }]
  },
}

export const PROVIDERS: Provider[] = [resend, brevo, twilio]
export function getProvider(slug: string): Provider | undefined { return PROVIDERS.find((p) => p.slug === slug) }
