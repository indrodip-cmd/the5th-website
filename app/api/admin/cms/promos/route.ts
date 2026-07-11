import { NextRequest, NextResponse } from 'next/server'
import { adminEmail } from '@/lib/session'
import { getSupabaseAdmin } from '@/lib/supabase'
import { sanitizeText } from '@/lib/validation'

export const dynamic = 'force-dynamic'

const FIELDS = ['slug', 'kind', 'eyebrow', 'title', 'subtitle', 'description', 'features', 'badge', 'stat_label', 'stat_value', 'cta_label', 'cta_href', 'secondary_label', 'secondary_href', 'accent', 'gradient', 'image_url', 'image_mobile_url', 'icon', 'theme', 'sort', 'enabled'] as const

function slugify(s: string) { return String(s || '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60) }

/* GET — all promos for the admin manager. */
export async function GET(req: NextRequest) {
  if (!adminEmail(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { data } = await getSupabaseAdmin().from('homepage_promos').select('*').order('kind').order('sort').order('created_at')
  return NextResponse.json({ promos: data || [] })
}

/* POST — create or update one promo (upsert by id when present). */
export async function POST(req: NextRequest) {
  if (!adminEmail(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const b = await req.json().catch(() => ({})) as Record<string, unknown>
  const db = getSupabaseAdmin()
  const row: Record<string, unknown> = { updated_at: new Date().toISOString() }
  for (const f of FIELDS) if (f in b) row[f] = b[f]
  if (typeof row.title === 'string') row.title = sanitizeText(row.title, 120)
  if (typeof row.description === 'string') row.description = sanitizeText(row.description as string, 1200)
  if (!row.slug && row.title) row.slug = slugify(row.title as string)
  if (Array.isArray(row.features)) row.features = (row.features as unknown[]).map((x) => String(x)).filter(Boolean).slice(0, 8)

  if (b.id) {
    const { data, error } = await db.from('homepage_promos').update(row).eq('id', b.id as string).select('*').single()
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ ok: true, promo: data })
  }
  if (!row.slug) return NextResponse.json({ error: 'Title or slug required.' }, { status: 400 })
  const { data, error } = await db.from('homepage_promos').insert(row).select('*').single()
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ ok: true, promo: data })
}

/* PATCH — reorder: { order: [id,id,...] }. */
export async function PATCH(req: NextRequest) {
  if (!adminEmail(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const b = await req.json().catch(() => ({}))
  const order = Array.isArray(b?.order) ? (b.order as string[]) : []
  const db = getSupabaseAdmin()
  await Promise.all(order.map((id, i) => db.from('homepage_promos').update({ sort: i, updated_at: new Date().toISOString() }).eq('id', id)))
  return NextResponse.json({ ok: true })
}

/* DELETE ?id= — remove a promo. */
export async function DELETE(req: NextRequest) {
  if (!adminEmail(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const id = new URL(req.url).searchParams.get('id')
  if (id) await getSupabaseAdmin().from('homepage_promos').delete().eq('id', id)
  return NextResponse.json({ ok: true })
}
