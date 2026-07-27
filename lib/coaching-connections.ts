import { getSupabaseAdmin } from '@/lib/supabase'

// One-click app connections for AI Coaching Intelligence. Two methods:
//  • apikey — the admin pastes a key/token, we store it (Cal.com, Stripe, Whop, Fathom, Fireflies)
//  • oauth  — a "Connect" button runs the provider's OAuth flow (Zoom, Google
//             Calendar, Calendly, PayPal). Works once the provider's client
//             id/secret are set in env (registered app in their dashboard).

type Method = 'apikey' | 'oauth'
interface Provider {
  key: string; label: string; method: Method; category: 'calls' | 'calendar' | 'payments'
  // apikey
  keyHint?: string
  // oauth (env-driven)
  clientIdEnv?: string; clientSecretEnv?: string; authorizeUrl?: string; tokenUrl?: string; scope?: string; extraAuth?: Record<string, string>
}

export const PROVIDERS: Provider[] = [
  { key: 'fathom', label: 'Fathom', method: 'apikey', category: 'calls', keyHint: 'Fathom API key' },
  { key: 'fireflies', label: 'Fireflies.ai', method: 'apikey', category: 'calls', keyHint: 'Fireflies API key' },
  { key: 'zoom', label: 'Zoom', method: 'oauth', category: 'calls', clientIdEnv: 'ZOOM_CLIENT_ID', clientSecretEnv: 'ZOOM_CLIENT_SECRET', authorizeUrl: 'https://zoom.us/oauth/authorize', tokenUrl: 'https://zoom.us/oauth/token', scope: 'cloud_recording:read:list_user_recordings' },
  { key: 'google_calendar', label: 'Google Calendar', method: 'oauth', category: 'calendar', clientIdEnv: 'GOOGLE_CLIENT_ID', clientSecretEnv: 'GOOGLE_CLIENT_SECRET', authorizeUrl: 'https://accounts.google.com/o/oauth2/v2/auth', tokenUrl: 'https://oauth2.googleapis.com/token', scope: 'https://www.googleapis.com/auth/calendar.readonly', extraAuth: { access_type: 'offline', prompt: 'consent' } },
  { key: 'calendly', label: 'Calendly', method: 'oauth', category: 'calendar', clientIdEnv: 'CALENDLY_CLIENT_ID', clientSecretEnv: 'CALENDLY_CLIENT_SECRET', authorizeUrl: 'https://auth.calendly.com/oauth/authorize', tokenUrl: 'https://auth.calendly.com/oauth/token' },
  { key: 'cal_com', label: 'Cal.com', method: 'apikey', category: 'calendar', keyHint: 'Cal.com API key (cal_live_…)' },
  { key: 'stripe', label: 'Stripe', method: 'apikey', category: 'payments', keyHint: 'Stripe secret key (sk_live_…)' },
  { key: 'whop', label: 'Whop', method: 'apikey', category: 'payments', keyHint: 'Whop API key' },
  { key: 'paypal', label: 'PayPal', method: 'oauth', category: 'payments', clientIdEnv: 'PAYPAL_CLIENT_ID', clientSecretEnv: 'PAYPAL_CLIENT_SECRET', authorizeUrl: 'https://www.paypal.com/connect', tokenUrl: 'https://api-m.paypal.com/v1/oauth2/token', scope: 'openid https://uri.paypal.com/services/reporting/search/read' },
]
export function providerByKey(key: string): Provider | undefined { return PROVIDERS.find((p) => p.key === key) }
function envOk(p: Provider): boolean { return p.method !== 'oauth' || !!(p.clientIdEnv && process.env[p.clientIdEnv] && p.clientSecretEnv && process.env[p.clientSecretEnv]) }

export async function listConnections() {
  const { data } = await getSupabaseAdmin().from('ci_connections').select('provider, status, connected_at')
  const byKey = new Map((data || []).map((r) => [r.provider as string, r]))
  return PROVIDERS.map((p) => {
    const row = byKey.get(p.key)
    return { key: p.key, label: p.label, method: p.method, category: p.category, keyHint: p.keyHint, configured: envOk(p), status: (row?.status as string) || 'disconnected', connected_at: row?.connected_at || null }
  })
}
export async function getConnection(provider: string) {
  const { data } = await getSupabaseAdmin().from('ci_connections').select('*').eq('provider', provider).maybeSingle()
  return data
}
export async function saveApiKey(provider: string, apiKey: string, by: string) {
  const p = providerByKey(provider)
  if (!p || p.method !== 'apikey') return { ok: false, error: 'Not an API-key provider' }
  if (!apiKey.trim()) return { ok: false, error: 'Paste a key first.' }
  await getSupabaseAdmin().from('ci_connections').upsert({ provider, method: 'apikey', api_key: apiKey.trim(), status: 'connected', connected_by: by, connected_at: new Date().toISOString(), updated_at: new Date().toISOString() }, { onConflict: 'provider' })
  return { ok: true }
}
export async function disconnect(provider: string) {
  await getSupabaseAdmin().from('ci_connections').upsert({ provider, status: 'disconnected', api_key: null, access_token: null, refresh_token: null, updated_at: new Date().toISOString() }, { onConflict: 'provider' })
  return { ok: true }
}

// OAuth: build the provider authorize URL.
export function oauthAuthorizeUrl(provider: string, redirectUri: string, state: string): { url?: string; error?: string } {
  const p = providerByKey(provider)
  if (!p || p.method !== 'oauth') return { error: 'Not an OAuth provider' }
  if (!envOk(p)) return { error: `${p.label} isn't configured yet. Set ${p.clientIdEnv} and ${p.clientSecretEnv} in your environment.` }
  const params = new URLSearchParams({ client_id: process.env[p.clientIdEnv!]!, redirect_uri: redirectUri, response_type: 'code', state })
  if (p.scope) params.set('scope', p.scope)
  for (const [k, v] of Object.entries(p.extraAuth || {})) params.set(k, v)
  return { url: `${p.authorizeUrl}?${params.toString()}` }
}
// OAuth: exchange the code for tokens and store them.
export async function oauthExchange(provider: string, code: string, redirectUri: string, by: string): Promise<{ ok: boolean; error?: string }> {
  const p = providerByKey(provider)
  if (!p || p.method !== 'oauth') return { ok: false, error: 'Not an OAuth provider' }
  const clientId = process.env[p.clientIdEnv!]!; const clientSecret = process.env[p.clientSecretEnv!]!
  const body = new URLSearchParams({ grant_type: 'authorization_code', code, redirect_uri: redirectUri })
  const res = await fetch(p.tokenUrl!, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}` },
    body,
  })
  if (!res.ok) return { ok: false, error: `Token exchange failed (${res.status})` }
  const t = await res.json().catch(() => ({}))
  const expires = t.expires_in ? new Date(Date.now() + Number(t.expires_in) * 1000).toISOString() : null
  await getSupabaseAdmin().from('ci_connections').upsert({
    provider, method: 'oauth', access_token: t.access_token || null, refresh_token: t.refresh_token || null,
    expires_at: expires, status: 'connected', connected_by: by, connected_at: new Date().toISOString(), updated_at: new Date().toISOString(),
  }, { onConflict: 'provider' })
  return { ok: true }
}
