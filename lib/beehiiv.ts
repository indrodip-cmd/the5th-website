/* Beehiiv newsletter sync for the 10K Roadmap newsletter. Subscribe a joiner
   when they first give us their email, and remove them from Beehiiv when they
   unsubscribe (so "once they leave" really means no more emails, ours OR the
   newsletter's). No-ops when the API keys are absent, so it is safe to call
   unconditionally on every join. Server-only. */

const KEY = process.env.BEEHIIV_API_KEY
const PUB = process.env.BEEHIIV_PUBLICATION_ID
const BASE = 'https://api.beehiiv.com/v2'

export function beehiivConfigured(): boolean {
  return !!KEY && !!PUB
}

export async function subscribeToBeehiiv(email: string, opts: { name?: string; stage?: string; source?: string } = {}): Promise<void> {
  if (!KEY || !PUB || !email) return
  try {
    await fetch(`${BASE}/publications/${PUB}/subscriptions`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: email.trim().toLowerCase(),
        reactivate_existing: true,
        send_welcome_email: true,
        status: 'active',
        utm_source: opts.source || 'the5th',
        utm_medium: 'quiz',
        utm_campaign: opts.stage || 'join',
        custom_fields: [
          ...(opts.name ? [{ name: 'First Name', value: opts.name.split(' ')[0] }] : []),
          ...(opts.stage ? [{ name: 'stage', value: opts.stage }] : []),
        ],
      }),
    })
  } catch (e) {
    console.error('beehiiv subscribe failed', e)
  }
}

export async function unsubscribeFromBeehiiv(email: string): Promise<void> {
  if (!KEY || !PUB || !email) return
  const e = email.trim().toLowerCase()
  try {
    const r = await fetch(`${BASE}/publications/${PUB}/subscriptions/by_email/${encodeURIComponent(e)}`, {
      headers: { Authorization: `Bearer ${KEY}` },
    })
    if (!r.ok) return
    const j = await r.json().catch(() => null)
    const id = j?.data?.id
    if (!id) return
    // Delete the Beehiiv subscription so the newsletter stops emailing them too.
    await fetch(`${BASE}/publications/${PUB}/subscriptions/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${KEY}` },
    })
  } catch (e2) {
    console.error('beehiiv unsubscribe failed', e2)
  }
}
