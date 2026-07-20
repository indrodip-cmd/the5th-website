import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { getProvider } from '@/lib/comm/providers'
import { applyResendEventToCampaign } from '@/lib/event-enroll'

export const dynamic = 'force-dynamic'

/* Resend event webhook for the Breakthrough campaign. Verifies the Svix
   signature (RESEND_WEBHOOK_SECRET), then updates event_email_log with
   delivered / opened / clicked / bounced / complained. Point a Resend webhook
   at https://the5th.consulting/api/webhooks/resend and subscribe to the
   email.* events. Always 200s fast so Resend doesn't retry-storm. */
export async function POST(req: NextRequest) {
  const raw = await req.text()
  const headers: Record<string, string> = {}
  req.headers.forEach((v, k) => { headers[k] = v })

  const adapter = getProvider('resend')
  const valid = adapter?.verifyWebhook ? adapter.verifyWebhook(headers, raw) : true
  if (!valid) return NextResponse.json({ error: 'invalid signature' }, { status: 401 })

  let body: unknown = {}
  try { body = JSON.parse(raw) } catch { body = {} }

  try {
    const r = await applyResendEventToCampaign(body)
    const db = getSupabaseAdmin()
    await db.from('integration_webhooks').insert({
      provider: 'resend', event_type: (body as { type?: string })?.type || 'unknown',
      status: r.matched ? 'processed' : 'ignored', signature_valid: true, payload: body,
    }).then(() => {}, () => {})
  } catch {
    /* never fail the webhook */
  }
  return NextResponse.json({ ok: true })
}
