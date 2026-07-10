/* ─────────────────────────────────────────────────────────────────────────
   Meetings — provider-agnostic sync (Cal.com now; Zoom/Fathom credential-gated).

   One path turns any booking/meeting into: a deduped crm_meetings row → a
   linked opportunity → a journey timeline event → a reminder task.
   Same conventions as lib/crm.ts (service-role, fail-soft, emit + audit).
   ───────────────────────────────────────────────────────────────────────── */
import { getSupabaseAdmin } from '@/lib/supabase'
import { emitEvent } from '@/lib/events'
import { resolveOrCreateContact, logActivity, createTask } from '@/lib/crm'
import { ensurePrimaryOpportunity, moveOpportunityToStageKey } from '@/lib/sales'
import { getBookingsOverview, type CalBooking } from '@/lib/calcom'
import { fathomConfigured, listRecent } from '@/lib/fathom'

type Row = Record<string, unknown>

export interface MeetingInput {
  provider: 'calcom' | 'zoom' | 'manual'
  external_id: string
  contactEmail?: string
  contactName?: string
  title?: string
  starts_at?: string
  ends_at?: string
  status?: string
  timezone?: string
  join_url?: string
  host_url?: string
  attendees?: unknown[]
  source?: string
  advanceStageKey?: string  // move the linked opportunity to this stage key
  extra?: Row               // provider-specific columns (zoom_uuid, recording_url…)
}

/* Upsert a meeting (dedup by provider+external_id), link a contact + open
   opportunity, log a journey event, and ensure a reminder task exists. */
export async function upsertMeeting(m: MeetingInput): Promise<Row | null> {
  const db = getSupabaseAdmin()
  // 1) contact
  const contact = m.contactEmail
    ? await resolveOrCreateContact({ email: m.contactEmail, name: m.contactName }, { source: m.provider })
    : null
  const contactId = (contact?.id as string) || null

  // 2) opportunity (open) for the contact
  let opportunityId: string | null = null
  if (contactId) {
    const opp = await ensurePrimaryOpportunity(contactId, { name: m.title || 'Strategy call', source: m.provider })
    opportunityId = (opp?.id as string) || null
    if (opportunityId && m.advanceStageKey && (opp?.status === 'open')) {
      const pid = opp?.pipeline_id as string
      await moveOpportunityToStageKey(opportunityId, pid, m.advanceStageKey, 'system')
    }
  }

  // 3) upsert the meeting row
  const durationMin = m.starts_at && m.ends_at ? Math.round((+new Date(m.ends_at) - +new Date(m.starts_at)) / 60000) : null
  const { data: meeting } = await db.from('crm_meetings').upsert({
    provider: m.provider, external_id: m.external_id, contact_id: contactId, opportunity_id: opportunityId,
    title: m.title || null, starts_at: m.starts_at || null, ends_at: m.ends_at || null,
    status: m.status || 'upcoming', timezone: m.timezone || null, join_url: m.join_url || null,
    host_url: m.host_url || null, duration_min: durationMin, attendees: m.attendees || [],
    source: m.source || m.provider, ...(m.extra || {}),
  }, { onConflict: 'provider,external_id' }).select('*').single()
  if (!meeting) return null
  const meetingId = meeting.id as string

  // 4) journey activity (only when we have a contact)
  if (contactId && m.contactEmail) {
    const isPast = m.status === 'completed' || m.status === 'no_show'
    await logActivity(m.contactEmail, isPast ? 'meeting_completed' : 'call_booked',
      isPast ? `Meeting ${m.status === 'no_show' ? 'no-show' : 'completed'}: ${m.title || ''}` : `Booked: ${m.title || 'Strategy call'}`,
      m.starts_at ? new Date(m.starts_at).toISOString() : undefined, { meeting_id: meetingId, via: m.provider })
    if (m.status === 'completed') emitEvent('meeting_completed', { contact_id: contactId, meeting_id: meetingId })
  }

  // 5) reminder task for upcoming meetings (dedup by meeting_id)
  if (contactId && m.status === 'upcoming' && m.starts_at) {
    const { data: existing } = await db.from('crm_tasks').select('id').eq('meeting_id', meetingId).maybeSingle()
    if (!existing) {
      await createTask({
        contactId, opportunityId, meetingId, kind: 'meeting',
        title: `Prep for ${m.title || 'meeting'}`, dueDate: new Date(m.starts_at).toISOString().slice(0, 10),
        reminderAt: m.starts_at, priority: 'high', owner: 'system',
      })
    }
  }

  emitEvent('meeting_synced', { provider: m.provider, meeting_id: meetingId, contact_id: contactId })
  return meeting
}

/* Pull Cal.com bookings and reconcile them into meetings + opportunities. */
export async function syncCalcomBookings(): Promise<{ configured: boolean; synced: number }> {
  const ov = await getBookingsOverview()
  if (!ov.configured) return { configured: false, synced: 0 }
  let synced = 0
  const run = async (b: CalBooking, status: string, advance?: string) => {
    if (!b.uid) return
    await upsertMeeting({
      provider: 'calcom', external_id: b.uid, contactEmail: b.email || undefined, contactName: b.name || undefined,
      title: b.title, starts_at: b.start, ends_at: b.end, status, timezone: b.timeZone,
      join_url: b.meetingUrl, attendees: [{ name: b.name, email: b.email }], source: 'cal.com', advanceStageKey: advance,
    })
    synced++
  }
  for (const b of ov.upcoming) await run(b, 'upcoming', 'discovery_scheduled')
  for (const b of ov.past) await run(b, b.noShow ? 'no_show' : 'completed', b.noShow ? undefined : 'discovery_completed')
  for (const b of ov.cancelled) await run(b, 'cancelled')
  return { configured: true, synced }
}

/* Poll recent Fathom recordings and attach intelligence to the matching
   meeting (by attendee email + date window), creating one if none exists. */
export async function syncFathomRecordings(): Promise<{ configured: boolean; recordings: number; attached: number }> {
  if (!fathomConfigured()) return { configured: false, recordings: 0, attached: 0 }
  const db = getSupabaseAdmin()
  const recordings = await listRecent(new Date(Date.now() - 7 * 86400000).toISOString())
  let attached = 0
  for (const rec of recordings) {
    if (!rec.started_at) continue
    const from = new Date(+new Date(rec.started_at) - 12 * 3600000).toISOString()
    const to = new Date(+new Date(rec.started_at) + 12 * 3600000).toISOString()
    let contactId: string | null = null
    for (const email of rec.attendee_emails) {
      const { data } = await db.from('crm_contacts').select('id').eq('email', email).maybeSingle()
      if (data) { contactId = data.id as string; break }
    }
    let meetingId: string | null = null
    let mq = db.from('crm_meetings').select('id').gte('starts_at', from).lte('starts_at', to).is('fathom_recording_id', null)
    if (contactId) mq = mq.eq('contact_id', contactId)
    const { data: existing } = await mq.limit(1).maybeSingle()
    if (existing) meetingId = existing.id as string
    else {
      const created = await upsertMeeting({
        provider: 'manual', external_id: `fathom:${rec.id}`, contactEmail: rec.attendee_emails[0],
        title: rec.title || 'Recorded meeting', starts_at: rec.started_at, status: 'completed', source: 'fathom',
      })
      meetingId = (created?.id as string) || null
    }
    if (!meetingId) continue
    await attachFathom(meetingId, {
      fathom_recording_id: rec.id, fathom_share_url: rec.share_url, recording_url: rec.recording_url,
      transcript: rec.transcript, summary: rec.summary, action_items: rec.action_items,
      chapters: rec.chapters, key_topics: rec.key_topics, questions: rec.questions,
    })
    attached++
  }
  return { configured: true, recordings: recordings.length, attached }
}

// ── Reads ──
export async function listMeetings(filter?: { status?: string }) {
  let q = getSupabaseAdmin().from('crm_meetings')
    .select('*, contact:crm_contacts(id,name,email)')
    .is('deleted_at', null).order('starts_at', { ascending: false }).limit(300)
  if (filter?.status) q = q.eq('status', filter.status)
  const { data } = await q
  return data || []
}
export async function getMeeting(id: string) {
  const db = getSupabaseAdmin()
  const { data: meeting } = await db.from('crm_meetings')
    .select('*, contact:crm_contacts(*), opportunity:crm_opportunities(id,name,value,currency)')
    .eq('id', id).maybeSingle()
  if (!meeting) return null
  const { data: tasks } = await db.from('crm_tasks').select('*').eq('meeting_id', id).order('due_date', { ascending: true, nullsFirst: false })
  return { meeting, tasks: tasks || [] }
}
export async function setMeetingNotes(id: string, notes: string) {
  const { data } = await getSupabaseAdmin().from('crm_meetings').update({ notes }).eq('id', id).select('*').single()
  return data
}

// ── Attach intelligence (used by Zoom webhook / Fathom cron / manual) ──
export async function attachZoom(meetingId: string, data: { recording_url?: string; zoom_uuid?: string; host_url?: string; duration_min?: number }) {
  const { data: row } = await getSupabaseAdmin().from('crm_meetings').update({
    recording_url: data.recording_url, zoom_uuid: data.zoom_uuid, host_url: data.host_url, duration_min: data.duration_min,
  }).eq('id', meetingId).select('*').single()
  return row
}
export async function attachFathom(meetingId: string, data: {
  fathom_recording_id?: string; fathom_share_url?: string; recording_url?: string; transcript?: string
  summary?: string; action_items?: unknown[]; chapters?: unknown[]; key_topics?: unknown[]; questions?: unknown[]
}) {
  const { data: row } = await getSupabaseAdmin().from('crm_meetings').update({
    fathom_recording_id: data.fathom_recording_id, fathom_share_url: data.fathom_share_url,
    recording_url: data.recording_url, transcript: data.transcript, summary: data.summary,
    action_items: data.action_items || [], chapters: data.chapters || [], key_topics: data.key_topics || [], questions: data.questions || [],
  }).eq('id', meetingId).select('*').single()
  return row
}
