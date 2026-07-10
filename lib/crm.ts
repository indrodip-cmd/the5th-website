/* ─────────────────────────────────────────────────────────────────────────
   The5th CRM OS — Contact Engine.

   crm_contacts (UUID) is the single source of truth for every visitor, lead,
   customer, meeting and AI conversation. Every entry point — chat, quiz,
   cal.com, booking, forms, AI tools — funnels through here so we get one
   unified, de-duplicated profile with a complete timeline.

   Dedup priority: email → phone. Never create duplicates; merge new info,
   append activities, preserve history. Fails soft — never blocks a request.

   Dependency-light: imports emitEvent (one-directional; the event bus never
   imports back) and the Supabase admin client.
   ───────────────────────────────────────────────────────────────────────── */
import { getSupabaseAdmin } from '@/lib/supabase'
import { emitEvent } from '@/lib/events'
import { bumpScore } from '@/lib/scoring'

type Row = Record<string, unknown>
type Patch = Record<string, unknown>

/* Columns a caller may set directly on a contact. Anything else in a patch is
   ignored (tags/email/phone are handled explicitly). */
const CONTACT_COLS = new Set<string>([
  'first_name', 'last_name', 'preferred_name', 'name', 'phone', 'whatsapp', 'linkedin', 'website', 'avatar_url',
  'birthday', 'location', 'country', 'state', 'city', 'timezone',
  'lifecycle_stage', 'lead_score', 'lead_status', 'owner', 'source',
  'utm_source', 'utm_medium', 'utm_campaign', 'pipeline_stage', 'revenue',
  'interest', 'business_stage', 'call_booked', 'booking_start', 'company', 'status', 'notes',
])

// ── Normalizers ──
export function normEmail(v: unknown): string | null {
  if (typeof v !== 'string') return null
  const e = v.trim().toLowerCase()
  return e && e.includes('@') && e.length <= 254 ? e : null
}
export function normPhone(v: unknown): string | null {
  if (typeof v !== 'string') return null
  let p = v.replace(/[^\d+]/g, '')
  if (p.indexOf('+') > 0) p = p.replace(/\+/g, '')
  const digits = p.replace(/\D/g, '')
  return digits.length >= 7 ? p : null
}

/* Only keep whitelisted, defined, non-empty patch values (never wipe an
   existing field with an empty string). */
function cleanPatch(patch: Patch): Patch {
  const out: Patch = {}
  for (const [k, v] of Object.entries(patch)) {
    if (!CONTACT_COLS.has(k)) continue
    if (v === undefined || v === null) continue
    if (typeof v === 'string' && v.trim() === '') continue
    out[k] = v
  }
  return out
}

// ── Audit ──
export async function audit(
  actor: string | null,
  action: string,
  entityType: string,
  entityId: string | null,
  contactId: string | null,
  before?: Row | null,
  after?: Row | null,
) {
  try {
    await getSupabaseAdmin().from('crm_audit_log').insert({
      actor: actor || null, action, entity_type: entityType,
      entity_id: entityId, contact_id: contactId,
      before: before || null, after: after || null,
    })
  } catch (e) { console.error('crm audit failed', e) }
}

// ── Contact resolution / creation (the heart of dedup) ──
export async function resolveContact(input: { email?: unknown; phone?: unknown; id?: unknown }): Promise<Row | null> {
  const db = getSupabaseAdmin()
  const id = typeof input.id === 'string' ? input.id : null
  if (id) {
    const { data } = await db.from('crm_contacts').select('*').eq('id', id).maybeSingle()
    if (data) return data
  }
  const email = normEmail(input.email)
  if (email) {
    const { data } = await db.from('crm_contacts').select('*').eq('email', email).maybeSingle()
    if (data) return data
  }
  const phone = normPhone(input.phone)
  if (phone) {
    const { data } = await db.from('crm_contacts').select('*').eq('phone', phone).maybeSingle()
    if (data) return data
  }
  return null
}

/* Find-or-create a contact, merging new info. Returns the contact row (or null
   on hard failure). Emits contact_created / contact_updated + audit. */
export async function resolveOrCreateContact(
  input: Patch & { email?: unknown; phone?: unknown; tags?: unknown },
  opts: { actor?: string; source?: string } = {},
): Promise<Row | null> {
  const db = getSupabaseAdmin()
  const email = normEmail(input.email)
  const phone = normPhone(input.phone)
  if (!email && !phone) return null // need at least one identifier

  const tags = Array.isArray(input.tags) ? (input.tags as unknown[]).map(String) : null
  const patch = cleanPatch(input)
  if (phone && !('phone' in patch)) patch.phone = phone

  const existing = await resolveContact({ email, phone })

  if (existing) {
    const id = existing.id as string
    // Merge: fill empty fields; always let progress fields advance (last-write-wins).
    const merged: Patch = {}
    for (const [k, v] of Object.entries(patch)) {
      const cur = existing[k]
      const curEmpty = cur === null || cur === undefined || cur === '' || cur === 0 || cur === false
      const progress = k === 'lead_score' || k === 'pipeline_stage' || k === 'lifecycle_stage' ||
                       k === 'call_booked' || k === 'booking_start' || k === 'revenue' || k === 'owner' ||
                       k === 'status' || k === 'notes'
      if (curEmpty || progress) merged[k] = v
    }
    if (email && !existing.email) merged.email = email
    const changed = Object.keys(merged).length > 0
    if (changed) await db.from('crm_contacts').update(merged).eq('id', id)
    if (tags) await setTags(id, tags)
    const after = { ...existing, ...merged }
    // Only record an update when something actually changed (activity logging
    // resolves contacts with an empty patch on every call).
    if (changed || tags) {
      await audit(opts.actor || null, 'contact.updated', 'contact', id, id, existing, after)
      emitEvent('contact_updated', { email: after.email, contact_id: id, source: opts.source })
    }
    return after
  }

  // Create
  const insert: Patch = { ...patch }
  if (email) insert.email = email
  if (phone) insert.phone = phone
  if (opts.source && !insert.source) insert.source = opts.source
  const { data: created, error } = await db.from('crm_contacts').insert(insert).select('*').single()
  if (error || !created) { console.error('crm create contact failed', error); return null }
  const id = created.id as string
  if (tags) await setTags(id, tags)
  await audit(opts.actor || null, 'contact.created', 'contact', id, id, null, created)
  emitEvent('contact_created', { email: created.email, contact_id: id, source: insert.source })
  return created
}

/* Authoritative admin update by id — overwrites provided fields (unlike the
   merge-based entry-point path). Logs stage/revenue activities + emits events. */
export async function updateContact(id: string, patch: Patch, actor?: string): Promise<Row | null> {
  const db = getSupabaseAdmin()
  const { data: existing } = await db.from('crm_contacts').select('*').eq('id', id).maybeSingle()
  if (!existing) return null
  const tags = Array.isArray(patch.tags) ? (patch.tags as unknown[]).map(String) : null
  const clean: Patch = {}
  for (const [k, v] of Object.entries(patch)) {
    if (k === 'email') { const e = normEmail(v); if (e) clean.email = e; continue }
    if (CONTACT_COLS.has(k)) clean[k] = v // admin may clear fields (null/'')
  }
  if (Object.keys(clean).length) await db.from('crm_contacts').update(clean).eq('id', id)
  if (tags) await setTags(id, tags)
  const after = { ...existing, ...clean }

  if (clean.pipeline_stage && clean.pipeline_stage !== existing.pipeline_stage) {
    await db.from('crm_activities').insert({ contact_id: id, contact_email: after.email, type: 'note', title: `Stage → ${clean.pipeline_stage}`, actor: actor || null })
    emitEvent('pipeline_changed', { email: after.email, contact_id: id, pipeline_stage: clean.pipeline_stage })
  }
  if (clean.revenue !== undefined && Number(clean.revenue) !== Number(existing.revenue)) {
    await db.from('crm_activities').insert({ contact_id: id, contact_email: after.email, type: 'deal', title: `Revenue set to $${Number(clean.revenue).toLocaleString()}`, actor: actor || null })
    emitEvent('revenue_logged', { email: after.email, contact_id: id, revenue: clean.revenue })
  }
  await audit(actor || null, 'contact.updated', 'contact', id, id, existing, after)
  emitEvent('contact_updated', { email: after.email, contact_id: id })
  return after
}

/* Backward-compatible: upsert a contact by email with an arbitrary patch. */
export async function upsertContact(email: string, patch: Patch = {}) {
  if (!email && !patch.phone) return
  try {
    await resolveOrCreateContact({ ...patch, email }, { source: patch.source as string | undefined })
  } catch (e) { console.error('crm upsertContact failed', e) }
}

// ── Activities / timeline ──
export async function logActivity(
  email: string,
  type: string,
  title?: string,
  detail?: string,
  data?: Record<string, unknown>,
  actor?: string,
) {
  const e = normEmail(email)
  if (!e) return
  try {
    const db = getSupabaseAdmin()
    const contact = await resolveOrCreateContact({ email: e }, { source: 'activity' })
    const contactId = contact?.id as string | undefined
    await db.from('crm_activities').insert({
      contact_id: contactId || null, contact_email: e,
      type, title: title || null, detail: detail || null, data: data || {}, actor: actor || null,
    })
    if (contactId) {
      await db.from('crm_contacts').update({ last_activity_at: new Date().toISOString() }).eq('id', contactId)
      await bumpScore(contactId, type)
    }
    emitEvent('activity_added', { email: e, contact_id: contactId, activity_type: type })
  } catch (e2) { console.error('crm logActivity failed', e2) }
}

// ── Tags (relational; crm_contacts.tags[] cache maintained by DB trigger) ──
export async function ensureTag(name: string, color?: string): Promise<string | null> {
  const n = name.trim()
  if (!n) return null
  const db = getSupabaseAdmin()
  const { data: existing } = await db.from('crm_tags').select('id').eq('name', n).maybeSingle()
  if (existing) return existing.id as string
  const { data } = await db.from('crm_tags').insert({ name: n, ...(color ? { color } : {}) }).select('id').single()
  return (data?.id as string) || null
}
export async function addTag(contactId: string, name: string, color?: string) {
  const tagId = await ensureTag(name, color)
  if (!tagId) return
  await getSupabaseAdmin().from('crm_contact_tags').upsert({ contact_id: contactId, tag_id: tagId }, { onConflict: 'contact_id,tag_id' })
}
export async function removeTag(contactId: string, name: string) {
  const db = getSupabaseAdmin()
  const { data: tag } = await db.from('crm_tags').select('id').eq('name', name.trim()).maybeSingle()
  if (tag) await db.from('crm_contact_tags').delete().eq('contact_id', contactId).eq('tag_id', tag.id)
}
/* Replace a contact's full tag set (used by upsert/merge and the admin UI). */
export async function setTags(contactId: string, names: string[]) {
  const db = getSupabaseAdmin()
  const clean = Array.from(new Set(names.map((s) => String(s).trim()).filter(Boolean))).slice(0, 40)
  const ids: string[] = []
  for (const n of clean) { const id = await ensureTag(n); if (id) ids.push(id) }
  const { data: current } = await db.from('crm_contact_tags').select('tag_id').eq('contact_id', contactId)
  const curIds = new Set((current || []).map((r) => r.tag_id as string))
  const nextIds = new Set(ids)
  const toRemove = [...curIds].filter((x) => !nextIds.has(x))
  const toAdd = ids.filter((x) => !curIds.has(x))
  if (toRemove.length) await db.from('crm_contact_tags').delete().eq('contact_id', contactId).in('tag_id', toRemove)
  if (toAdd.length) await db.from('crm_contact_tags').insert(toAdd.map((tag_id) => ({ contact_id: contactId, tag_id })))
}

// ── Notes (with version history) ──
export async function addNote(contactId: string, body: string, opts: { author?: string; pinned?: boolean; private?: boolean } = {}) {
  const db = getSupabaseAdmin()
  const { data } = await db.from('crm_notes').insert({
    contact_id: contactId, body, author: opts.author || null,
    pinned: !!opts.pinned, private: !!opts.private,
  }).select('*').single()
  emitEvent('note_created', { contact_id: contactId })
  await audit(opts.author || null, 'note.created', 'note', (data?.id as string) || null, contactId, null, data)
  return data
}
export async function editNote(noteId: string, body: string, editor?: string) {
  const db = getSupabaseAdmin()
  const { data: prev } = await db.from('crm_notes').select('*').eq('id', noteId).single()
  if (!prev) return null
  await db.from('crm_note_versions').insert({ note_id: noteId, body: prev.body, edited_by: editor || null })
  const { data } = await db.from('crm_notes').update({ body }).eq('id', noteId).select('*').single()
  await audit(editor || null, 'note.updated', 'note', noteId, (prev.contact_id as string) || null, prev, data)
  return data
}

// ── Tasks ──
export async function createTask(input: {
  contactId?: string | null; title: string; description?: string; dueDate?: string | null
  priority?: string; owner?: string; reminderAt?: string | null
  kind?: string; opportunityId?: string | null; meetingId?: string | null
}) {
  const db = getSupabaseAdmin()
  const { data } = await db.from('crm_tasks').insert({
    contact_id: input.contactId || null, title: input.title, description: input.description || null,
    due_date: input.dueDate || null, priority: input.priority || 'normal',
    owner: input.owner || null, reminder_at: input.reminderAt || null, status: 'open',
    kind: input.kind || 'task', opportunity_id: input.opportunityId || null, meeting_id: input.meetingId || null,
  }).select('*').single()
  emitEvent('task_created', { contact_id: input.contactId, task_id: data?.id })
  await audit(input.owner || null, 'task.created', 'task', (data?.id as string) || null, input.contactId || null, null, data)
  return data
}
export async function completeTask(taskId: string, actor?: string) {
  const db = getSupabaseAdmin()
  const { data } = await db.from('crm_tasks').update({ status: 'done' }).eq('id', taskId).select('*').single()
  emitEvent('task_completed', { contact_id: data?.contact_id, task_id: taskId })
  await audit(actor || null, 'task.completed', 'task', taskId, (data?.contact_id as string) || null, null, data)
  return data
}

// ── Business profile ──
export async function setBusinessProfile(contactId: string, patch: Patch, actor?: string) {
  const db = getSupabaseAdmin()
  const { data: prev } = await db.from('crm_business_profiles').select('*').eq('contact_id', contactId).maybeSingle()
  const { data } = await db.from('crm_business_profiles')
    .upsert({ contact_id: contactId, ...patch, updated_at: new Date().toISOString() }, { onConflict: 'contact_id' })
    .select('*').single()
  emitEvent('business_profile_updated', { contact_id: contactId })
  await audit(actor || null, prev ? 'business.updated' : 'business.created', 'business', (data?.id as string) || null, contactId, prev, data)
  return data
}

// ── Relationships ──
export async function addRelationship(contactId: string, input: { relatedContactId?: string | null; type: string; label?: string; note?: string }) {
  const { data } = await getSupabaseAdmin().from('crm_relationships').insert({
    contact_id: contactId, related_contact_id: input.relatedContactId || null,
    type: input.type, label: input.label || null, note: input.note || null,
  }).select('*').single()
  return data
}

// ── Custom fields ──
export async function setCustomValue(contactId: string, fieldId: string, value: unknown) {
  const { data } = await getSupabaseAdmin().from('crm_custom_values')
    .upsert({ contact_id: contactId, field_id: fieldId, value, updated_at: new Date().toISOString() }, { onConflict: 'contact_id,field_id' })
    .select('*').single()
  return data
}

// ── Attachments ──
export async function addAttachment(input: {
  contactId: string; noteId?: string | null; taskId?: string | null
  fileName: string; mime?: string; sizeBytes?: number; storagePath: string; uploadedBy?: string
}) {
  const { data } = await getSupabaseAdmin().from('crm_attachments').insert({
    contact_id: input.contactId, note_id: input.noteId || null, task_id: input.taskId || null,
    file_name: input.fileName, mime: input.mime || null, size_bytes: input.sizeBytes ?? null,
    storage_path: input.storagePath, uploaded_by: input.uploadedBy || null,
  }).select('*').single()
  await audit(input.uploadedBy || null, 'attachment.added', 'attachment', (data?.id as string) || null, input.contactId, null, data)
  return data
}

// ── Soft delete ──
export async function softDeleteContact(idOrEmail: string, actor?: string) {
  const contact = await resolveContact(idOrEmail.includes('@') ? { email: idOrEmail } : { id: idOrEmail })
  if (!contact) return
  const id = contact.id as string
  await getSupabaseAdmin().from('crm_contacts').update({ deleted_at: new Date().toISOString() }).eq('id', id)
  await audit(actor || null, 'contact.deleted', 'contact', id, id, contact, null)
}

// ── Reads: profile bundle, list, search ──
const BUNDLE_LIMIT = 100
export async function getContactBundle(idOrEmail: string) {
  const db = getSupabaseAdmin()
  const contact = await resolveContact(idOrEmail.includes('@') ? { email: idOrEmail } : { id: idOrEmail })
  if (!contact) return null
  const id = contact.id as string
  const [activities, notes, tasks, business, relationships, custom, attachments] = await Promise.all([
    db.from('crm_activities').select('*').eq('contact_id', id).order('created_at', { ascending: false }).limit(BUNDLE_LIMIT),
    db.from('crm_notes').select('*').eq('contact_id', id).is('deleted_at', null).order('pinned', { ascending: false }).order('created_at', { ascending: false }),
    db.from('crm_tasks').select('*').eq('contact_id', id).order('due_date', { ascending: true, nullsFirst: false }),
    db.from('crm_business_profiles').select('*').eq('contact_id', id).maybeSingle(),
    db.from('crm_relationships').select('*').eq('contact_id', id).order('created_at', { ascending: false }),
    db.from('crm_custom_values').select('*, field:crm_custom_fields(*)').eq('contact_id', id),
    db.from('crm_attachments').select('*').eq('contact_id', id).order('created_at', { ascending: false }),
  ])
  return {
    contact,
    activities: activities.data || [], notes: notes.data || [], tasks: tasks.data || [],
    business: business.data || null, relationships: relationships.data || [],
    customValues: custom.data || [], attachments: attachments.data || [],
  }
}

export interface ContactFilters {
  q?: string; lifecycle?: string; pipeline?: string; owner?: string; country?: string; source?: string
  tag?: string; minScore?: number; bookedCall?: boolean; noChat?: boolean
  page?: number; pageSize?: number; sort?: string
}
export async function listContacts(f: ContactFilters = {}) {
  const db = getSupabaseAdmin()
  const pageSize = Math.min(Math.max(f.pageSize || 50, 1), 200)
  const page = Math.max(f.page || 1, 1)
  const from = (page - 1) * pageSize
  let query = db.from('crm_contacts').select(
    'id,email,name,phone,company,country,pipeline_stage,lifecycle_stage,lead_score,lead_status,owner,source,tags,call_booked,revenue,interest,business_stage,last_activity_at,created_at,updated_at',
    { count: 'exact' },
  ).is('deleted_at', null)

  if (f.q && f.q.trim()) query = query.textSearch('search', f.q.trim(), { type: 'websearch', config: 'simple' })
  if (f.lifecycle) query = query.eq('lifecycle_stage', f.lifecycle)
  if (f.pipeline) query = query.eq('pipeline_stage', f.pipeline)
  if (f.owner) query = query.eq('owner', f.owner)
  if (f.country) query = query.eq('country', f.country)
  if (f.source) query = query.eq('source', f.source)
  if (f.tag) query = query.contains('tags', [f.tag])
  if (typeof f.minScore === 'number') query = query.gte('lead_score', f.minScore)
  if (f.bookedCall) query = query.eq('call_booked', true)

  const [col, dir] = (f.sort || 'updated_at:desc').split(':')
  const sortCol = ['updated_at', 'created_at', 'last_activity_at', 'lead_score', 'name'].includes(col) ? col : 'updated_at'
  query = query.order(sortCol, { ascending: dir === 'asc', nullsFirst: false }).range(from, from + pageSize - 1)

  const { data, count } = await query
  return { contacts: data || [], total: count || 0, page, pageSize }
}

export async function searchContacts(q: string, limit = 20) {
  if (!q || !q.trim()) return []
  const { data } = await getSupabaseAdmin().from('crm_contacts')
    .select('id,email,name,phone,company,pipeline_stage,lifecycle_stage,tags')
    .is('deleted_at', null)
    .textSearch('search', q.trim(), { type: 'websearch', config: 'simple' })
    .limit(limit)
  return data || []
}
