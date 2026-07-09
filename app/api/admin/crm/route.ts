import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { adminEmail } from '@/lib/session'
import { sanitizeText } from '@/lib/validation'
import { emitEvent } from '@/lib/events'

export const dynamic = 'force-dynamic'

export const PIPELINE = ['new', 'qualified', 'discovery', 'call_booked', 'call_completed', 'proposal', 'won', 'lost', 'customer']

/* GET: contacts list, or ?email=<> for a full profile (contact + timeline + notes). */
export async function GET(req: NextRequest) {
  if (!adminEmail(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const db = getSupabaseAdmin()
  const email = new URL(req.url).searchParams.get('email')
  if (email) {
    const [{ data: contact }, { data: activities }, { data: notes }] = await Promise.all([
      db.from('carolina_leads').select('*').eq('email', email.toLowerCase()).single(),
      db.from('crm_activities').select('*').eq('contact_email', email.toLowerCase()).order('created_at', { ascending: false }).limit(50),
      db.from('crm_notes').select('*').eq('contact_email', email.toLowerCase()).order('created_at', { ascending: false }),
    ])
    return NextResponse.json({ contact: contact || null, activities: activities || [], notes: notes || [] })
  }
  const { data } = await db
    .from('carolina_leads')
    .select('email,name,pipeline_stage,lead_score,interest,business_stage,call_booked,tags,updated_at')
    .order('updated_at', { ascending: false })
    .limit(500)
  return NextResponse.json({ contacts: data || [], pipeline: PIPELINE })
}

/* PATCH: update a contact (pipeline stage, tags, status). */
export async function PATCH(req: NextRequest) {
  if (!adminEmail(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const b = await req.json().catch(() => ({}))
  const email = String(b?.email || '').trim().toLowerCase()
  if (!email) return NextResponse.json({ error: 'Missing email.' }, { status: 400 })
  const patch: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if (typeof b.pipeline_stage === 'string' && PIPELINE.includes(b.pipeline_stage)) patch.pipeline_stage = b.pipeline_stage
  if (Array.isArray(b.tags)) patch.tags = b.tags.slice(0, 20).map((t: unknown) => sanitizeText(t, 40)).filter(Boolean)
  if (typeof b.status === 'string') patch.status = sanitizeText(b.status, 40)
  const { error } = await getSupabaseAdmin().from('carolina_leads').update(patch).eq('email', email)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (patch.pipeline_stage) {
    await getSupabaseAdmin().from('crm_activities').insert({ contact_email: email, type: 'note', title: `Stage → ${patch.pipeline_stage}` })
    emitEvent('pipeline_changed', { email, pipeline_stage: patch.pipeline_stage })
  }
  return NextResponse.json({ ok: true })
}

/* DELETE ?email= — GDPR erasure: remove the contact and all their data. */
export async function DELETE(req: NextRequest) {
  if (!adminEmail(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const email = (new URL(req.url).searchParams.get('email') || '').toLowerCase()
  if (!email) return NextResponse.json({ error: 'Missing email.' }, { status: 400 })
  const db = getSupabaseAdmin()
  await Promise.all([
    db.from('crm_activities').delete().eq('contact_email', email),
    db.from('crm_notes').delete().eq('contact_email', email),
    db.from('crm_tasks').delete().eq('contact_email', email),
    db.from('carolina_sessions').delete().eq('email', email),
  ])
  await db.from('carolina_leads').delete().eq('email', email)
  return NextResponse.json({ ok: true })
}

/* POST: add a note to a contact. */
export async function POST(req: NextRequest) {
  if (!adminEmail(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const b = await req.json().catch(() => ({}))
  const email = String(b?.email || '').trim().toLowerCase()
  const body = sanitizeText(b?.body, 4000)
  if (!email || !body) return NextResponse.json({ error: 'Email and note body required.' }, { status: 400 })
  const author = adminEmail(req)
  const { error } = await getSupabaseAdmin().from('crm_notes').insert({ contact_email: email, body, author })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
