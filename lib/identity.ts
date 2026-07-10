/* ─────────────────────────────────────────────────────────────────────────
   Identity Resolution Engine (3I.3).

   Anonymous web visitors carry a stable `a5_vid` (crm_visitors, first-touch
   preserved). When they later identify (chat, quiz, booking, form), we link
   the visitor → contact in crm_identities, copy first/last touch onto the
   contact (never overwriting the first touch), and merge their anonymous
   journey into the contact timeline.

   Conventions match lib/crm.ts: service-role, fail-soft, emit + audit.
   ───────────────────────────────────────────────────────────────────────── */
import { getSupabaseAdmin } from '@/lib/supabase'
import { emitEvent } from '@/lib/events'
import { resolveOrCreateContact, logActivity, audit } from '@/lib/crm'

type Row = Record<string, unknown>

export interface Touch {
  source?: string; medium?: string; campaign?: string; content?: string; term?: string
  landing_page?: string; referrer?: string; country?: string
}

function cleanTouch(t: Touch): Touch {
  const out: Touch = {}
  for (const [k, v] of Object.entries(t)) if (typeof v === 'string' && v.trim()) out[k as keyof Touch] = v.trim().slice(0, 400)
  return out
}

/* Record/refresh an anonymous visitor. First-touch columns are written once
   and never overwritten; later beacons only bump last_seen_at. */
export async function recordVisitor(visitorId: string, touch: Touch = {}) {
  if (!visitorId) return
  const t = cleanTouch(touch)
  try {
    const db = getSupabaseAdmin()
    const { error } = await db.from('crm_visitors').insert({
      visitor_id: visitorId,
      first_source: t.source || null, first_medium: t.medium || null, first_campaign: t.campaign || null,
      first_content: t.content || null, first_term: t.term || null,
      landing_page: t.landing_page || null, referrer: t.referrer || null, country: t.country || null,
    })
    if (error) {
      // already exists → just refresh last_seen_at (preserve first-touch)
      await db.from('crm_visitors').update({ last_seen_at: new Date().toISOString() }).eq('visitor_id', visitorId)
    } else {
      emitEvent('visitor_seen', { visitor_id: visitorId, source: t.source })
    }
  } catch (e) { console.error('recordVisitor failed', e) }
}

/* Link an identifier set to a contact and merge anonymous history. */
export async function identify(input: {
  visitorId?: string; email?: string; phone?: string; contactId?: string
  conversationId?: string; name?: string; source?: string
}): Promise<Row | null> {
  const db = getSupabaseAdmin()
  try {
    // 1) resolve/create the contact
    let contact: Row | null = null
    if (input.contactId) {
      const { data } = await db.from('crm_contacts').select('*').eq('id', input.contactId).maybeSingle()
      contact = data
    }
    if (!contact) contact = await resolveOrCreateContact({ email: input.email, phone: input.phone, name: input.name }, { source: input.source })
    if (!contact) return null
    const contactId = contact.id as string

    // 2) write identity edges (first mapping wins)
    const edges: Array<[string, string | undefined]> = [
      ['visitor_id', input.visitorId], ['email', input.email?.toLowerCase()],
      ['phone', input.phone], ['conversation_id', input.conversationId],
    ]
    for (const [kind, value] of edges) {
      if (value) await db.from('crm_identities').upsert({ contact_id: contactId, kind, value }, { onConflict: 'kind,value', ignoreDuplicates: true })
    }

    // 3) merge the visitor's anonymous journey + attribution
    if (input.visitorId) {
      const { data: visitor } = await db.from('crm_visitors').select('*').eq('visitor_id', input.visitorId).maybeSingle()
      if (visitor && !visitor.contact_id) {
        await db.from('crm_visitors').update({ contact_id: contactId, identified_at: new Date().toISOString() }).eq('visitor_id', input.visitorId)
      }
      if (visitor) await applyTouchToContact(contactId, contact, {
        source: visitor.first_source as string, medium: visitor.first_medium as string, campaign: visitor.first_campaign as string,
        content: visitor.first_content as string, term: visitor.first_term as string,
        landing_page: visitor.landing_page as string, referrer: visitor.referrer as string, country: visitor.country as string,
      }, (visitor.first_seen_at as string) || undefined)

      // summarize prior anonymous pageviews into the timeline
      const { count } = await db.from('analytics_events').select('id', { count: 'exact', head: true }).eq('visitor_id', input.visitorId)
      if (count && count > 0 && contact.email) {
        await logActivity(contact.email as string, 'lead', 'Anonymous journey merged', `${count} prior web events linked from visitor ${input.visitorId.slice(0, 8)}…`, { visitor_id: input.visitorId, events: count })
      }
    }

    await audit(null, 'identity.merged', 'contact', contactId, contactId, null, { identifiers: edges.filter(([, v]) => v).map(([k]) => k) })
    emitEvent('identity_merged', { contact_id: contactId, email: contact.email, visitor_id: input.visitorId })
    return contact
  } catch (e) { console.error('identify failed', e); return null }
}

/* Copy a touch onto the contact: first_touch written once (preserved), last_touch always,
   plus a crm_touchpoints row. */
export async function applyTouchToContact(contactId: string, contact: Row | null, touch: Touch, occurredAt?: string) {
  const t = cleanTouch(touch)
  if (Object.keys(t).length === 0) return
  const db = getSupabaseAdmin()
  const c = contact || (await db.from('crm_contacts').select('first_touch,first_seen_at,utm_source').eq('id', contactId).maybeSingle()).data
  const patch: Row = { last_touch: t }
  if (!c?.first_touch) {
    patch.first_touch = { ...t, at: occurredAt || new Date().toISOString() }
    patch.first_seen_at = occurredAt || new Date().toISOString()
    // Also seed the legacy utm_* columns from first touch if empty.
    if (!c?.utm_source && t.source) { patch.utm_source = t.source; patch.utm_medium = t.medium || null; patch.utm_campaign = t.campaign || null }
  }
  await db.from('crm_contacts').update(patch).eq('id', contactId)
  await db.from('crm_touchpoints').insert({
    contact_id: contactId, source: t.source || null, medium: t.medium || null, campaign: t.campaign || null,
    content: t.content || null, term: t.term || null, landing_page: t.landing_page || null, referrer: t.referrer || null,
    kind: 'web', occurred_at: occurredAt || new Date().toISOString(),
  })
  emitEvent('attribution_recorded', { contact_id: contactId, source: t.source })
}

export async function resolveContactByVisitor(visitorId: string): Promise<string | null> {
  if (!visitorId) return null
  const db = getSupabaseAdmin()
  const { data: v } = await db.from('crm_visitors').select('contact_id').eq('visitor_id', visitorId).maybeSingle()
  if (v?.contact_id) return v.contact_id as string
  const { data: id } = await db.from('crm_identities').select('contact_id').eq('kind', 'visitor_id').eq('value', visitorId).maybeSingle()
  return (id?.contact_id as string) || null
}
