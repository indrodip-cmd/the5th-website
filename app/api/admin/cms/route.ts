import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { adminEmail } from '@/lib/session'
import { sanitizeText } from '@/lib/validation'
import { CONTENT_TYPES } from '@/lib/cms'
import { emitEvent } from '@/lib/events'

export const dynamic = 'force-dynamic'

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80)
}

/* GET: all content (including drafts) + categories, for the admin manager. */
export async function GET(req: NextRequest) {
  if (!adminEmail(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const db = getSupabaseAdmin()
  const url = new URL(req.url)
  const id = url.searchParams.get('id')
  if (id) {
    const [{ data: item }, { data: rels }] = await Promise.all([
      db.from('cms_content').select('*').eq('id', id).single(),
      db.from('cms_relations').select('to_id').eq('from_id', id),
    ])
    return NextResponse.json({ item: item || null, related: (rels || []).map((r) => (r as { to_id: string }).to_id) })
  }
  const [{ data: items }, { data: cats }] = await Promise.all([
    db.from('cms_content').select('id,type,slug,title,status,featured,category,updated_at,sort').order('sort', { ascending: true }).order('updated_at', { ascending: false }),
    db.from('cms_categories').select('*').order('sort', { ascending: true }),
  ])
  return NextResponse.json({ items: items || [], categories: cats || [] })
}

interface Body {
  id?: string
  type?: string; slug?: string; title?: string; subtitle?: string; summary?: string; description?: string
  cover_image?: string; hero_image?: string; category?: string; tags?: string[]; author?: string
  status?: string; visibility?: string; featured?: boolean; pinned?: boolean; reading_time?: number
  sort?: number; seo?: Record<string, unknown>; data?: Record<string, unknown>; keywords?: string[]
  related?: string[]
}

function buildRow(b: Body) {
  const row: Record<string, unknown> = {}
  if (b.type && CONTENT_TYPES.includes(b.type as never)) row.type = b.type
  if (typeof b.title === 'string') row.title = sanitizeText(b.title, 200)
  if (typeof b.slug === 'string') row.slug = slugify(b.slug) || slugify(String(b.title || ''))
  if (typeof b.subtitle === 'string') row.subtitle = sanitizeText(b.subtitle, 300) || null
  if (typeof b.summary === 'string') row.summary = sanitizeText(b.summary, 600) || null
  if (typeof b.description === 'string') row.description = sanitizeText(b.description, 40000) || null
  if (typeof b.cover_image === 'string') row.cover_image = sanitizeText(b.cover_image, 500) || null
  if (typeof b.hero_image === 'string') row.hero_image = sanitizeText(b.hero_image, 500) || null
  if (typeof b.category === 'string') row.category = sanitizeText(b.category, 80) || null
  if (Array.isArray(b.tags)) row.tags = b.tags.slice(0, 30).map((t) => sanitizeText(t, 40)).filter(Boolean)
  if (Array.isArray(b.keywords)) row.keywords = b.keywords.slice(0, 30).map((t) => sanitizeText(t, 40)).filter(Boolean)
  if (typeof b.author === 'string') row.author = sanitizeText(b.author, 120) || null
  if (typeof b.status === 'string' && ['draft', 'published', 'archived'].includes(b.status)) {
    row.status = b.status
    if (b.status === 'published') row.published_at = new Date().toISOString()
  }
  if (typeof b.visibility === 'string') row.visibility = b.visibility
  if (typeof b.featured === 'boolean') row.featured = b.featured
  if (typeof b.pinned === 'boolean') row.pinned = b.pinned
  if (Number.isFinite(b.reading_time)) row.reading_time = Math.max(0, Math.round(b.reading_time as number))
  if (Number.isFinite(b.sort)) row.sort = Math.round(b.sort as number)
  if (b.seo && typeof b.seo === 'object') row.seo = b.seo
  if (b.data && typeof b.data === 'object') row.data = b.data
  return row
}

async function syncRelations(id: string, related?: string[]) {
  if (!Array.isArray(related)) return
  const db = getSupabaseAdmin()
  await db.from('cms_relations').delete().eq('from_id', id)
  const rows = related.filter(Boolean).slice(0, 30).map((to) => ({ from_id: id, to_id: to, kind: 'related' }))
  if (rows.length) await db.from('cms_relations').insert(rows)
}

export async function POST(req: NextRequest) {
  if (!adminEmail(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const b: Body = await req.json().catch(() => ({}))
  if (!b.type || !b.title) return NextResponse.json({ error: 'Type and title are required.' }, { status: 400 })
  const row = buildRow(b)
  if (!row.slug) row.slug = slugify(String(b.title))
  const { data, error } = await getSupabaseAdmin().from('cms_content').insert(row).select('id').single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  await syncRelations(data.id, b.related)
  if (row.status === 'published') emitEvent('content_published', { slug: row.slug, type: row.type })
  return NextResponse.json({ ok: true, id: data.id })
}

export async function PATCH(req: NextRequest) {
  if (!adminEmail(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const b: Body = await req.json().catch(() => ({}))
  if (!b.id) return NextResponse.json({ error: 'Missing id.' }, { status: 400 })
  const row = buildRow(b)
  const { error } = await getSupabaseAdmin().from('cms_content').update(row).eq('id', b.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  await syncRelations(b.id, b.related)
  return NextResponse.json({ ok: true })
}

export async function DELETE(req: NextRequest) {
  if (!adminEmail(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const id = new URL(req.url).searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Missing id.' }, { status: 400 })
  const { error } = await getSupabaseAdmin().from('cms_content').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
