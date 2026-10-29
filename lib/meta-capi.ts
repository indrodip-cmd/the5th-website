/* Meta Conversions API — server-side event send for /roadmap-session.
   No-ops (returns {ok:false, skipped:true}) when the required env vars are
   absent, so the funnel never breaks or throws for lack of ad-platform
   config. Reads only from env — never hardcode a pixel id or token. */
import crypto from 'crypto'

function sha256(v: string): string {
  return crypto.createHash('sha256').update(v.trim().toLowerCase()).digest('hex')
}

export type CapiUserData = {
  email?: string | null
  phone?: string | null
  fbp?: string | null
  fbc?: string | null
  clientIp?: string | null
  userAgent?: string | null
}

export function pixelId(): string {
  return process.env.NEXT_PUBLIC_META_PIXEL_ID || ''
}

export async function sendCapiEvent(opts: {
  eventName: 'Lead' | 'SubmitApplication' | 'Schedule' | 'Purchase' | 'PageView' | 'ViewContent' | 'QuizStart'
  eventId: string
  sourceUrl: string
  user: CapiUserData
  value?: number
  currency?: string
}): Promise<{ ok: boolean; skipped?: boolean; error?: string }> {
  const pid = pixelId()
  const token = process.env.META_CAPI_ACCESS_TOKEN
  if (!pid || !token) return { ok: false, skipped: true }

  const userData: Record<string, unknown> = {}
  if (opts.user.email) userData.em = [sha256(opts.user.email)]
  if (opts.user.phone) userData.ph = [sha256(opts.user.phone.replace(/[^\d]/g, ''))]
  if (opts.user.fbp) userData.fbp = opts.user.fbp
  if (opts.user.fbc) userData.fbc = opts.user.fbc
  if (opts.user.clientIp) userData.client_ip_address = opts.user.clientIp
  if (opts.user.userAgent) userData.client_user_agent = opts.user.userAgent

  const payload: Record<string, unknown> = {
    data: [{
      event_name: opts.eventName,
      event_time: Math.floor(Date.now() / 1000),
      event_id: opts.eventId, // shared with the client pixel fire, for dedup
      action_source: 'website',
      event_source_url: opts.sourceUrl,
      user_data: userData,
      ...(opts.value != null ? { custom_data: { value: opts.value, currency: opts.currency || 'USD' } } : {}),
    }],
  }
  const testCode = process.env.META_TEST_EVENT_CODE
  if (testCode) payload.test_event_code = testCode

  try {
    const r = await fetch(`https://graph.facebook.com/v21.0/${pid}/events?access_token=${encodeURIComponent(token)}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
    })
    if (!r.ok) {
      const j = await r.json().catch(() => ({}))
      console.error('meta capi non-ok', r.status, j)
      return { ok: false, error: `status_${r.status}` }
    }
    return { ok: true }
  } catch (e) {
    console.error('meta capi failed', e)
    return { ok: false, error: 'exception' }
  }
}
