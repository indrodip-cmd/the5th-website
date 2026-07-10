import { NextRequest, NextResponse } from 'next/server'
import { adminEmail } from '@/lib/session'
import { sanitizeText } from '@/lib/validation'
import { getSupabaseAdmin } from '@/lib/supabase'
import { listBoard, createOpportunity } from '@/lib/sales'

export const dynamic = 'force-dynamic'

/* GET
   - ?board=1&pipeline=<id> → Kanban (stages + ordered opportunities)
   - ?contact=<id> → that contact's opportunities
   - otherwise → recent opportunities list */
export async function GET(req: NextRequest) {
  if (!adminEmail(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const sp = new URL(req.url).searchParams
  if (sp.get('board')) return NextResponse.json(await listBoard(sp.get('pipeline') || undefined))
  const db = getSupabaseAdmin()
  let q = db.from('crm_opportunities')
    .select('*, contact:crm_contacts(id,name,email), stage:crm_pipeline_stages(name,key,color)')
    .is('deleted_at', null).order('updated_at', { ascending: false }).limit(200)
  if (sp.get('contact')) q = q.eq('contact_id', sp.get('contact'))
  const { data } = await q
  return NextResponse.json({ opportunities: data || [] })
}

/* POST — create an opportunity ({ contact_id, name?, value?, ...}). */
export async function POST(req: NextRequest) {
  const actor = adminEmail(req)
  if (!actor) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const b = await req.json().catch(() => ({}))
  const contactId = String(b?.contact_id || '')
  if (!contactId) return NextResponse.json({ error: 'contact_id required.' }, { status: 400 })
  const opp = await createOpportunity({
    contact_id: contactId,
    name: sanitizeText(b?.name, 160) || undefined,
    value: Number.isFinite(b?.value) ? Math.max(0, b.value) : undefined,
    currency: sanitizeText(b?.currency, 8) || undefined,
    probability: Number.isFinite(b?.probability) ? Math.max(0, Math.min(100, Math.round(b.probability))) : undefined,
    expected_close_date: b?.expected_close_date || undefined,
    products: Array.isArray(b?.products) ? b.products.map((p: unknown) => sanitizeText(p, 80)).filter(Boolean) : undefined,
    source: sanitizeText(b?.source, 60) || undefined,
    owner: sanitizeText(b?.owner, 120) || actor,
    pipeline_id: b?.pipeline_id || undefined,
    stage_id: b?.stage_id || undefined,
  }, actor)
  if (!opp) return NextResponse.json({ error: 'Could not create opportunity.' }, { status: 500 })
  return NextResponse.json({ ok: true, opportunity: opp })
}
