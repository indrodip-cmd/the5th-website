/* Zoom — Server-to-Server OAuth client + webhook verification.
   Credential-gated: no-ops until ZOOM_* env vars are set (mirrors lib/calcom).
   Env: ZOOM_ACCOUNT_ID, ZOOM_CLIENT_ID, ZOOM_CLIENT_SECRET, ZOOM_WEBHOOK_SECRET_TOKEN */
import crypto from 'crypto'

export function zoomConfigured(): boolean {
  return !!(process.env.ZOOM_ACCOUNT_ID && process.env.ZOOM_CLIENT_ID && process.env.ZOOM_CLIENT_SECRET)
}

let cachedToken: { token: string; exp: number } | null = null

/* Server-to-Server OAuth access token (cached until ~1 min before expiry). */
export async function getToken(): Promise<string | null> {
  if (!zoomConfigured()) return null
  if (cachedToken && cachedToken.exp > Date.now() + 60_000) return cachedToken.token
  try {
    const basic = Buffer.from(`${process.env.ZOOM_CLIENT_ID}:${process.env.ZOOM_CLIENT_SECRET}`).toString('base64')
    const r = await fetch(`https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${process.env.ZOOM_ACCOUNT_ID}`, {
      method: 'POST', headers: { Authorization: `Basic ${basic}` }, cache: 'no-store',
    })
    if (!r.ok) { console.error('zoom token failed', r.status); return null }
    const j = await r.json() as { access_token?: string; expires_in?: number }
    if (!j.access_token) return null
    cachedToken = { token: j.access_token, exp: Date.now() + (j.expires_in || 3600) * 1000 }
    return j.access_token
  } catch (e) { console.error('zoom token error', e); return null }
}

async function api(path: string): Promise<Record<string, unknown> | null> {
  const token = await getToken()
  if (!token) return null
  try {
    const r = await fetch(`https://api.zoom.us/v2${path}`, { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' })
    if (!r.ok) return null
    return await r.json()
  } catch { return null }
}

export async function getMeeting(meetingId: string) { return api(`/meetings/${meetingId}`) }
export async function getRecordings(meetingId: string) { return api(`/meetings/${meetingId}/recordings`) }

/* Verify a Zoom webhook signature and handle the URL-validation handshake.
   Returns { valid, challenge? }. */
export function verifyWebhook(rawBody: string, signature: string | null, timestamp: string | null): boolean {
  const secret = process.env.ZOOM_WEBHOOK_SECRET_TOKEN
  if (!secret || !signature || !timestamp) return false
  const message = `v0:${timestamp}:${rawBody}`
  const hash = crypto.createHmac('sha256', secret).update(message).digest('hex')
  const expected = `v0=${hash}`
  try { return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected)) } catch { return false }
}

/* Answer to the endpoint.url_validation event. */
export function urlValidationResponse(plainToken: string): { plainToken: string; encryptedToken: string } {
  const secret = process.env.ZOOM_WEBHOOK_SECRET_TOKEN || ''
  const encryptedToken = crypto.createHmac('sha256', secret).update(plainToken).digest('hex')
  return { plainToken, encryptedToken }
}
