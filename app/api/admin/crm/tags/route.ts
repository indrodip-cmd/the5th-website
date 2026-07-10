import { NextRequest, NextResponse } from 'next/server'
import { adminEmail } from '@/lib/session'
import { sanitizeText } from '@/lib/validation'
import { getSupabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

/* GET — all tags with contact counts. */
export async function GET(req: NextRequest) {
  if (!adminEmail(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const db = getSupabaseAdmin()
  const [{ data: tags }, { data: links }] = await Promise.all([
    db.from('crm_tags').select('*').order('name'),
    db.from('crm_contact_tags').select('tag_id'),
  ])
  const counts = new Map<string, number>()
  for (const l of links || []) counts.set(l.tag_id as string, (counts.get(l.tag_id as string) || 0) + 1)
  return NextResponse.json({ tags: (tags || []).map((t) => ({ ...t, count: counts.get(t.id as string) || 0 })) })
}

/* POST — create a tag ({ name, color? }). */
export async function POST(req: NextRequest) {
  if (!adminEmail(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const b = await req.json().catch(() => ({}))
  const name = sanitizeText(b?.name, 40)
  if (!name) return NextResponse.json({ error: 'Tag name required.' }, { status: 400 })
  const { data, error } = await getSupabaseAdmin().from('crm_tags')
    .upsert({ name, ...(typeof b?.color === 'string' ? { color: b.color } : {}) }, { onConflict: 'name' })
    .select('*').single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true, tag: data })
}

/* PATCH — rename / recolor a tag ({ id, name?, color? }). */
export async function PATCH(req: NextRequest) {
  if (!adminEmail(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const b = await req.json().catch(() => ({}))
  const id = String(b?.id || '')
  if (!id) return NextResponse.json({ error: 'id required.' }, { status: 400 })
  const patch: Record<string, unknown> = {}
  if (typeof b?.name === 'string') patch.name = sanitizeText(b.name, 40)
  if (typeof b?.color === 'string') patch.color = b.color
  const { data } = await getSupabaseAdmin().from('crm_tags').update(patch).eq('id', id).select('*').single()
  return NextResponse.json({ ok: true, tag: data })
}

/* DELETE ?id= — remove a tag (cascades the join; cache trigger updates contacts). */
export async function DELETE(req: NextRequest) {
  if (!adminEmail(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const id = new URL(req.url).searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id required.' }, { status: 400 })
  await getSupabaseAdmin().from('crm_tags').delete().eq('id', id)
  return NextResponse.json({ ok: true })
}
