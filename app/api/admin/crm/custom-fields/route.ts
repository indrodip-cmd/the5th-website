import { NextRequest, NextResponse } from 'next/server'
import { adminEmail } from '@/lib/session'
import { sanitizeText } from '@/lib/validation'
import { getSupabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

const TYPES = ['text', 'textarea', 'number', 'currency', 'date', 'boolean', 'dropdown', 'multi_select', 'url', 'email', 'phone']

function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '').slice(0, 40)
}

/* GET — custom field definitions. */
export async function GET(req: NextRequest) {
  if (!adminEmail(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { data } = await getSupabaseAdmin().from('crm_custom_fields').select('*').order('position').order('created_at')
  return NextResponse.json({ fields: data || [] })
}

/* POST — create a field ({ label, type, options?, entity? }). */
export async function POST(req: NextRequest) {
  if (!adminEmail(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const b = await req.json().catch(() => ({}))
  const label = sanitizeText(b?.label, 80)
  const type = String(b?.type || '')
  if (!label || !TYPES.includes(type)) return NextResponse.json({ error: 'Valid label and type required.' }, { status: 400 })
  const key = slugify(b?.key ? String(b.key) : label)
  const { data, error } = await getSupabaseAdmin().from('crm_custom_fields').insert({
    key, label, type,
    options: Array.isArray(b?.options) ? b.options.map((o: unknown) => sanitizeText(o, 60)).filter(Boolean) : [],
    entity: b?.entity === 'business' ? 'business' : 'contact',
    position: Number.isFinite(b?.position) ? Math.round(b.position) : 0,
  }).select('*').single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true, field: data })
}

/* PATCH — update a field definition ({ id, label?, options?, position? }). */
export async function PATCH(req: NextRequest) {
  if (!adminEmail(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const b = await req.json().catch(() => ({}))
  const id = String(b?.id || '')
  if (!id) return NextResponse.json({ error: 'id required.' }, { status: 400 })
  const patch: Record<string, unknown> = {}
  if (typeof b?.label === 'string') patch.label = sanitizeText(b.label, 80)
  if (Array.isArray(b?.options)) patch.options = b.options.map((o: unknown) => sanitizeText(o, 60)).filter(Boolean)
  if (Number.isFinite(b?.position)) patch.position = Math.round(b.position)
  const { data } = await getSupabaseAdmin().from('crm_custom_fields').update(patch).eq('id', id).select('*').single()
  return NextResponse.json({ ok: true, field: data })
}

/* DELETE ?id= — remove a field (cascades its values). */
export async function DELETE(req: NextRequest) {
  if (!adminEmail(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const id = new URL(req.url).searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id required.' }, { status: 400 })
  await getSupabaseAdmin().from('crm_custom_fields').delete().eq('id', id)
  return NextResponse.json({ ok: true })
}
