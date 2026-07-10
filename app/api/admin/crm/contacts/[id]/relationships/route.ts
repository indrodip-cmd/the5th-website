import { NextRequest, NextResponse } from 'next/server'
import { adminEmail } from '@/lib/session'
import { sanitizeText } from '@/lib/validation'
import { getSupabaseAdmin } from '@/lib/supabase'
import { addRelationship } from '@/lib/crm'

export const dynamic = 'force-dynamic'

/* GET — relationships for a contact (with related contact basics). */
export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  if (!adminEmail(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await ctx.params
  const { data } = await getSupabaseAdmin().from('crm_relationships')
    .select('*, related:crm_contacts!crm_relationships_related_contact_id_fkey(id,name,email)')
    .eq('contact_id', id).order('created_at', { ascending: false })
  return NextResponse.json({ relationships: data || [] })
}

/* POST — add a relationship ({ type, related_contact_id?, label?, note? }). */
export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  if (!adminEmail(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await ctx.params
  const b = await req.json().catch(() => ({}))
  const type = sanitizeText(b?.type, 40)
  if (!type) return NextResponse.json({ error: 'Relationship type required.' }, { status: 400 })
  const rel = await addRelationship(id, {
    relatedContactId: b?.related_contact_id || null,
    type,
    label: sanitizeText(b?.label, 160) || undefined,
    note: sanitizeText(b?.note, 400) || undefined,
  })
  return NextResponse.json({ ok: true, relationship: rel })
}

/* DELETE ?rel_id= */
export async function DELETE(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  if (!adminEmail(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  await ctx.params
  const relId = new URL(req.url).searchParams.get('rel_id')
  if (!relId) return NextResponse.json({ error: 'rel_id required.' }, { status: 400 })
  await getSupabaseAdmin().from('crm_relationships').delete().eq('id', relId)
  return NextResponse.json({ ok: true })
}
