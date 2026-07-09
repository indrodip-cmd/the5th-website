/* CMS content platform — the single source of truth for all content
   (programs, products, articles, knowledge, videos, case studies, FAQs,
   testimonials, announcements, events). One base model + JSONB `data`. */
import { getSupabaseAdmin } from '@/lib/supabase'

export const CONTENT_TYPES = [
  'program', 'product', 'article', 'knowledge', 'video',
  'case_study', 'faq', 'testimonial', 'announcement', 'event', 'team', 'page',
] as const
export type ContentType = (typeof CONTENT_TYPES)[number]

export interface Content {
  id: string
  type: string
  slug: string
  title: string
  subtitle: string | null
  summary: string | null
  description: string | null
  cover_image: string | null
  hero_image: string | null
  category: string | null
  tags: string[]
  author: string | null
  status: string
  visibility: string
  featured: boolean
  pinned: boolean
  reading_time: number | null
  sort: number
  published_at: string | null
  updated_at: string
  seo: Record<string, unknown>
  data: Record<string, unknown>
  ai_summary: string | null
  keywords: string[]
}

// Public-facing projection (never leaks drafts or internal fields to the widget).
const PUBLIC_COLS =
  'id,type,slug,title,subtitle,summary,description,cover_image,hero_image,category,tags,author,featured,pinned,reading_time,sort,published_at,updated_at,seo,data'

export interface ListOpts {
  type?: string
  category?: string
  tag?: string
  featured?: boolean
  limit?: number
  offset?: number
  includeDrafts?: boolean
}

export async function listContent(opts: ListOpts = {}): Promise<Content[]> {
  try {
    let q = getSupabaseAdmin().from('cms_content').select(PUBLIC_COLS)
    if (!opts.includeDrafts) q = q.eq('status', 'published')
    if (opts.type) q = q.eq('type', opts.type)
    if (opts.category) q = q.eq('category', opts.category)
    if (opts.tag) q = q.contains('tags', [opts.tag])
    if (opts.featured != null) q = q.eq('featured', opts.featured)
    q = q.order('pinned', { ascending: false }).order('sort', { ascending: true }).order('published_at', { ascending: false })
    q = q.range(opts.offset || 0, (opts.offset || 0) + (opts.limit || 50) - 1)
    const { data } = await q
    return (data as Content[]) || []
  } catch (e) {
    console.error('cms.listContent failed', e)
    return []
  }
}

export async function getBySlug(slug: string, includeDrafts = false): Promise<Content | null> {
  try {
    let q = getSupabaseAdmin().from('cms_content').select(PUBLIC_COLS).eq('slug', slug)
    if (!includeDrafts) q = q.eq('status', 'published')
    const { data } = await q.single()
    return (data as Content) || null
  } catch {
    return null
  }
}

export async function getRelated(id: string): Promise<Content[]> {
  try {
    const db = getSupabaseAdmin()
    const { data: rels } = await db.from('cms_relations').select('to_id').eq('from_id', id)
    const ids = (rels || []).map((r) => (r as { to_id: string }).to_id)
    if (!ids.length) return []
    const { data } = await db.from('cms_content').select(PUBLIC_COLS).in('id', ids).eq('status', 'published')
    return (data as Content[]) || []
  } catch {
    return []
  }
}

/* Hybrid search — full-text now; vector similarity blends in automatically
   once embeddings exist (Part 3B). Keyword works from day one. */
export async function searchContent(query: string, opts: { type?: string; limit?: number } = {}): Promise<Content[]> {
  const term = (query || '').trim()
  if (!term) return []
  try {
    const db = getSupabaseAdmin()
    let q = db
      .from('cms_content')
      .select(PUBLIC_COLS)
      .eq('status', 'published')
      .textSearch('search_tsv', term, { type: 'websearch', config: 'english' })
    if (opts.type) q = q.eq('type', opts.type)
    q = q.limit(opts.limit || 12)
    const { data } = await q
    if (data && data.length) return data as Content[]
    // Fallback: simple ILIKE on title/summary for partial terms.
    let f = db.from('cms_content').select(PUBLIC_COLS).eq('status', 'published').ilike('title', `%${term}%`)
    if (opts.type) f = f.eq('type', opts.type)
    const { data: fb } = await f.limit(opts.limit || 12)
    return (fb as Content[]) || []
  } catch (e) {
    console.error('cms.searchContent failed', e)
    return []
  }
}

export async function getCategories(type?: string) {
  try {
    let q = getSupabaseAdmin().from('cms_categories').select('*').order('sort', { ascending: true })
    if (type) q = q.eq('type', type)
    const { data } = await q
    return data || []
  } catch {
    return []
  }
}
