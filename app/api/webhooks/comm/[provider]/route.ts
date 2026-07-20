import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { getProvider } from '@/lib/comm/providers'
import { applyWebhookEvents } from '@/lib/comm/engine'
import { applyResendEventToCampaign } from '@/lib/event-enroll'

export const dynamic = 'force-dynamic'

/* Inbound provider webhooks (Resend / Brevo / Twilio): verify signature, parse
   delivery/open/click/bounce events, apply to the message + CRM timeline. Logged
   to integration_webhooks; always 200s fast so providers don't retry-storm. */
export async function POST(req: NextRequest, ctx: { params: Promise<{ provider: string }> }) {
  const { provider } = await ctx.params
  const adapter = getProvider(provider)
  const raw = await req.text()
  const headers: Record<string, string> = {}
  req.headers.forEach((v, k) => { headers[k] = v })
  const db = getSupabaseAdmin()

  let body: unknown = {}
  try { body = JSON.parse(raw) } catch { body = Object.fromEntries(new URLSearchParams(raw)) }

  let signatureValid = true
  if (adapter?.verifyWebhook) signatureValid = adapter.verifyWebhook(headers, raw)

  const events = signatureValid && adapter?.parseWebhook ? adapter.parseWebhook(body) : []
  let applied = 0
  if (events.length) applied = await applyWebhookEvents(events).catch(() => 0)

  // Also feed Resend events into the Breakthrough campaign stats (no-op for
  // non-campaign emails, so it's safe to run on every resend event).
  if (signatureValid && provider === 'resend') await applyResendEventToCampaign(body).catch(() => ({ matched: false }))

  try {
    await db.from('integration_webhooks').insert({
      provider: `comm:${provider}`, event_type: events[0]?.event || 'unknown', status: signatureValid ? 'processed' : 'rejected',
      signature_valid: signatureValid, payload: body, received_at: new Date().toISOString(),
    })
  } catch (e) { console.error('comm webhook log failed', e) }

  return NextResponse.json({ ok: true, applied })
}
