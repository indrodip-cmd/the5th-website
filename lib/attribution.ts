/* Attribution engine (3I.3) — turns a contact's touchpoints into first/last/
   linear/position-based credit. First touch is preserved forever (written by
   lib/identity.applyTouchToContact). Read-only analysis over crm_touchpoints. */
import { getSupabaseAdmin } from '@/lib/supabase'

type Row = Record<string, unknown>
export type AttributionModel = 'first' | 'last' | 'linear' | 'position'

export interface Touchpoint {
  source: string | null; medium: string | null; campaign: string | null
  landing_page: string | null; referrer: string | null; kind: string; occurred_at: string
}

/* All touchpoints for a contact, oldest → newest. */
export async function getTouchpoints(contactId: string): Promise<Touchpoint[]> {
  const { data } = await getSupabaseAdmin().from('crm_touchpoints')
    .select('source,medium,campaign,landing_page,referrer,kind,occurred_at')
    .eq('contact_id', contactId).order('occurred_at', { ascending: true })
  return (data || []) as Touchpoint[]
}

/* Credit each channel (source/medium) by model. Returns [{channel, credit}]. */
export function attribute(touches: Touchpoint[], model: AttributionModel): Array<{ channel: string; credit: number }> {
  if (touches.length === 0) return []
  const channel = (t: Touchpoint) => `${t.source || 'direct'} / ${t.medium || '(none)'}`
  const weights = new Array(touches.length).fill(0)
  if (model === 'first') weights[0] = 1
  else if (model === 'last') weights[touches.length - 1] = 1
  else if (model === 'linear') weights.fill(1 / touches.length)
  else if (model === 'position') {
    if (touches.length === 1) weights[0] = 1
    else if (touches.length === 2) { weights[0] = 0.5; weights[touches.length - 1] = 0.5 }
    else {
      weights[0] = 0.4; weights[touches.length - 1] = 0.4
      const mid = 0.2 / (touches.length - 2)
      for (let i = 1; i < touches.length - 1; i++) weights[i] = mid
    }
  }
  const credit = new Map<string, number>()
  touches.forEach((t, i) => { const c = channel(t); credit.set(c, (credit.get(c) || 0) + weights[i]) })
  return [...credit].map(([channel, c]) => ({ channel, credit: Math.round(c * 1000) / 1000 })).sort((a, b) => b.credit - a.credit)
}

/* Full attribution summary for a contact profile. */
export async function computeAttribution(contactId: string) {
  const db = getSupabaseAdmin()
  const [{ data: contact }, touches] = await Promise.all([
    db.from('crm_contacts').select('first_touch,last_touch,first_seen_at').eq('id', contactId).maybeSingle(),
    getTouchpoints(contactId),
  ])
  return {
    first_touch: (contact?.first_touch as Row) || null,
    last_touch: (contact?.last_touch as Row) || null,
    first_seen_at: contact?.first_seen_at || null,
    touchpoints: touches,
    models: {
      first: attribute(touches, 'first'),
      last: attribute(touches, 'last'),
      linear: attribute(touches, 'linear'),
      position: attribute(touches, 'position'),
    },
  }
}

/* Record an explicit touch (chat/booking/ad/referral) for a contact. */
export async function recordTouch(contactId: string, t: Partial<Touchpoint> & { kind?: string }) {
  await getSupabaseAdmin().from('crm_touchpoints').insert({
    contact_id: contactId, source: t.source || null, medium: t.medium || null, campaign: t.campaign || null,
    landing_page: t.landing_page || null, referrer: t.referrer || null, kind: t.kind || 'web',
  })
}
