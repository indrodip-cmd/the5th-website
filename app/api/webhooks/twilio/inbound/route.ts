import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { getSupabaseAdmin } from '@/lib/supabase'
import { getSecret } from '@/lib/comm/config'
import { emitEvent } from '@/lib/events'

export const dynamic = 'force-dynamic'

/* Twilio "A MESSAGE COMES IN" webhook — inbound SMS + WhatsApp.
   Stores the message (comm_messages, direction=inbound), links it to the CRM
   contact by phone, drops it on the CRM timeline, emits an event so Automation
   Studio / Command AI can react, and replies with valid (empty) TwiML.
   Set this URL in Twilio → Phone Numbers → your number → Messaging →
   "A MESSAGE COMES IN":  https://<your-domain>/api/webhooks/twilio/inbound */

// Twilio signs requests: base64( HMAC-SHA1( authToken, fullURL + sorted(key+value…) ) ).
function validateSignature(authToken: string, url: string, params: Record<string, string>, signature: string): boolean {
  if (!authToken) return true // can't verify without the token — accept but log
  try {
    const data = url + Object.keys(params).sort().map((k) => k + params[k]).join('')
    const expected = crypto.createHmac('sha1', authToken).update(Buffer.from(data, 'utf-8')).digest('base64')
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature || ''))
  } catch { return false }
}

const twiml = (msg?: string) =>
  new NextResponse(`<?xml version="1.0" encoding="UTF-8"?><Response>${msg ? `<Message>${msg.replace(/[<&]/g, (c) => (c === '<' ? '&lt;' : '&amp;'))}</Message>` : ''}</Response>`, { headers: { 'Content-Type': 'text/xml' } })

export async function POST(req: NextRequest) {
  const db = getSupabaseAdmin()
  const raw = await req.text()
  const params = Object.fromEntries(new URLSearchParams(raw)) as Record<string, string>

  // Reconstruct the public URL Twilio signed (behind Vercel's proxy).
  const proto = req.headers.get('x-forwarded-proto') || 'https'
  const host = req.headers.get('x-forwarded-host') || req.headers.get('host') || ''
  const url = `${proto}://${host}${new URL(req.url).pathname}`
  const authToken = await getSecret('TWILIO_AUTH_TOKEN')
  const signatureValid = validateSignature(authToken, url, params, req.headers.get('x-twilio-signature') || '')

  const from = String(params.From || '')
  const to = String(params.To || '')
  const body = String(params.Body || '')
  const sid = String(params.MessageSid || params.SmsSid || '')
  const isWhatsApp = from.startsWith('whatsapp:') || to.startsWith('whatsapp:')
  const channel = isWhatsApp ? 'whatsapp' : 'sms'
  const phone = from.replace(/^whatsapp:/, '').trim()

  // Log the raw hit for observability / replay protection.
  try {
    await db.from('integration_webhooks').insert({ provider: `twilio:inbound:${channel}`, event_type: 'message_received', status: signatureValid ? 'processed' : 'rejected', signature_valid: signatureValid, payload: params, received_at: new Date().toISOString() })
  } catch (e) { console.error('inbound webhook log failed', e) }

  if (!signatureValid || !from) return twiml()

  // Idempotency — Twilio can retry; don't double-store the same MessageSid.
  if (sid) { const { data: dup } = await db.from('comm_messages').select('id').eq('provider_message_id', sid).maybeSingle(); if (dup) return twiml() }

  // Link to a CRM contact by phone (best effort).
  let contactId: string | null = null, contactEmail: string | null = null
  const digits = phone.replace(/[^\d]/g, '').slice(-10)
  if (digits) {
    const { data: c } = await db.from('crm_contacts').select('id,email,phone').ilike('phone', `%${digits}%`).limit(1).maybeSingle()
    if (c) { contactId = c.id as string; contactEmail = (c.email as string) || null }
  }

  const { data: msg } = await db.from('comm_messages').insert({
    channel, provider: 'twilio', direction: 'inbound', to_addr: to, from_addr: from, body,
    status: 'received', provider_message_id: sid || null, contact_id: contactId, contact_email: contactEmail,
    source: 'inbound', metadata: { num_media: Number(params.NumMedia || 0), city: params.FromCity || null, state: params.FromState || null, country: params.FromCountry || null },
  }).select('id').single()

  try {
    if (contactId) await db.from('crm_activities').insert({ contact_id: contactId, contact_email: contactEmail, type: channel === 'whatsapp' ? 'whatsapp' : 'sms', title: `Inbound ${channel === 'whatsapp' ? 'WhatsApp' : 'SMS'}: ${body.slice(0, 80)}`, actor: 'inbound' })
    // Notify + fire an event so workflows can auto-respond.
    await db.from('notifications').insert({ type: 'message_received', title: `New ${channel === 'whatsapp' ? 'WhatsApp' : 'SMS'} from ${phone}`, body: body.slice(0, 160) })
  } catch (e) { console.error('inbound side-effects failed', e) }
  emitEvent(channel === 'whatsapp' ? 'whatsapp_received' : 'sms_received', { phone, from, to, body, message_id: msg?.id, contact_id: contactId, email: contactEmail })

  return twiml() // add an auto-reply string here to respond automatically
}
