import { NextRequest, NextResponse } from 'next/server'
import { adminEmail } from '@/lib/session'
import { sanitizeText } from '@/lib/validation'
import {
  listContacts, getContactBundle, resolveContact, resolveOrCreateContact,
  updateContact, softDeleteContact, addNote, type ContactFilters,
} from '@/lib/crm'

export const dynamic = 'force-dynamic'

export const PIPELINE = ['new', 'qualified', 'discovery', 'call_booked', 'call_completed', 'proposal', 'won', 'closed', 'lost', 'customer']
// Stages that count as realised revenue.
export const CLOSED_STAGES = ['won', 'closed', 'customer']

/* GET
   - ?id=<uuid> or ?email=<email> → full contact profile bundle
   - otherwise → filtered, paginated contact list (?q,&lifecycle,&pipeline,&owner,
     &country,&source,&tag,&minScore,&bookedCall,&page,&pageSize,&sort) */
export async function GET(req: NextRequest) {
  if (!adminEmail(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const sp = new URL(req.url).searchParams
  const id = sp.get('id')
  const email = sp.get('email')
  if (id || email) {
    const bundle = await getContactBundle(id || email!)
    if (!bundle) return NextResponse.json({ error: 'Contact not found.' }, { status: 404 })
    return NextResponse.json(bundle)
  }
  const filters: ContactFilters = {
    q: sp.get('q') || undefined,
    lifecycle: sp.get('lifecycle') || undefined,
    pipeline: sp.get('pipeline') || undefined,
    owner: sp.get('owner') || undefined,
    country: sp.get('country') || undefined,
    source: sp.get('source') || undefined,
    tag: sp.get('tag') || undefined,
    minScore: sp.get('minScore') ? Number(sp.get('minScore')) : undefined,
    bookedCall: sp.get('bookedCall') === '1' || undefined,
    page: sp.get('page') ? Number(sp.get('page')) : undefined,
    pageSize: sp.get('pageSize') ? Number(sp.get('pageSize')) : undefined,
    sort: sp.get('sort') || undefined,
  }
  const { contacts, total, page, pageSize } = await listContacts(filters)
  return NextResponse.json({ contacts, total, page, pageSize, pipeline: PIPELINE })
}

/* POST
   - { email, body } → add a note to the contact (backward compatible)
   - { email|phone, ...fields } → create/resolve a contact */
export async function POST(req: NextRequest) {
  const actor = adminEmail(req)
  if (!actor) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const b = await req.json().catch(() => ({}))

  const noteBody = sanitizeText(b?.body, 4000)
  if (noteBody) {
    const email = String(b?.email || '').trim().toLowerCase()
    const contact = await resolveContact({ email })
    if (!contact) return NextResponse.json({ error: 'Contact not found.' }, { status: 404 })
    const note = await addNote(contact.id as string, noteBody, { author: actor, pinned: !!b?.pinned, private: !!b?.private })
    return NextResponse.json({ ok: true, note })
  }

  const email = String(b?.email || '').trim().toLowerCase()
  const phone = String(b?.phone || '').trim()
  if (!email && !phone) return NextResponse.json({ error: 'Email or phone required.' }, { status: 400 })
  const contact = await resolveOrCreateContact({
    email, phone,
    name: sanitizeText(b?.name, 120) || undefined,
    first_name: sanitizeText(b?.first_name, 80) || undefined,
    last_name: sanitizeText(b?.last_name, 80) || undefined,
    company: sanitizeText(b?.company, 160) || undefined,
    country: sanitizeText(b?.country, 80) || undefined,
    interest: sanitizeText(b?.interest, 200) || undefined,
    source: sanitizeText(b?.source, 60) || 'manual',
    owner: sanitizeText(b?.owner, 120) || undefined,
    lifecycle_stage: sanitizeText(b?.lifecycle_stage, 40) || undefined,
    tags: Array.isArray(b?.tags) ? b.tags : undefined,
  }, { actor, source: 'manual' })
  return NextResponse.json({ ok: true, contact })
}

/* PATCH — update a contact by id or email (authoritative admin edit). */
export async function PATCH(req: NextRequest) {
  const actor = adminEmail(req)
  if (!actor) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const b = await req.json().catch(() => ({}))
  const id = b?.id || (b?.email ? (await resolveContact({ email: String(b.email).toLowerCase() }))?.id : null)
  if (!id) return NextResponse.json({ error: 'Contact not found.' }, { status: 404 })

  const patch: Record<string, unknown> = {}
  const strFields: Array<[string, number]> = [
    ['name', 120], ['first_name', 80], ['last_name', 80], ['preferred_name', 80], ['phone', 40],
    ['company', 160], ['country', 80], ['state', 80], ['city', 80], ['timezone', 60],
    ['interest', 200], ['business_stage', 200], ['owner', 120], ['status', 40],
    ['lifecycle_stage', 40], ['lead_status', 60], ['source', 60], ['website', 300],
    ['linkedin', 300], ['whatsapp', 40], ['notes', 8000],
  ]
  for (const [f, max] of strFields) if (typeof b[f] === 'string') patch[f] = sanitizeText(b[f], max) || null
  if (typeof b.pipeline_stage === 'string' && PIPELINE.includes(b.pipeline_stage)) patch.pipeline_stage = b.pipeline_stage
  if (Number.isFinite(b.lead_score)) patch.lead_score = Math.max(0, Math.round(b.lead_score))
  if (Number.isFinite(b.revenue)) patch.revenue = Math.max(0, Math.round(b.revenue * 100) / 100)
  if (typeof b.call_booked === 'boolean') patch.call_booked = b.call_booked
  if (Array.isArray(b.tags)) patch.tags = b.tags.slice(0, 40).map((t: unknown) => sanitizeText(t, 40)).filter(Boolean)

  const contact = await updateContact(id, patch, actor)
  if (!contact) return NextResponse.json({ error: 'Contact not found.' }, { status: 404 })
  return NextResponse.json({ ok: true, contact })
}

/* DELETE ?id= or ?email= — soft delete (recoverable; audit-logged). */
export async function DELETE(req: NextRequest) {
  const actor = adminEmail(req)
  if (!actor) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const sp = new URL(req.url).searchParams
  const key = sp.get('id') || sp.get('email')
  if (!key) return NextResponse.json({ error: 'Missing id or email.' }, { status: 400 })
  await softDeleteContact(key.toLowerCase(), actor)
  return NextResponse.json({ ok: true })
}
