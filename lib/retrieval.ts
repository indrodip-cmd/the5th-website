/* Retrieval service — the Knowledge Engine's core. Hybrid search over the
   unified CMS index: semantic (pgvector chunks) blended with keyword
   (full-text), de-duplicated per content item, assembled into a grounded
   context block + source citations. Degrades to keyword-only when embeddings
   are unavailable, so grounding works from day one. */
import { getSupabaseAdmin } from '@/lib/supabase'
import { embedOne, embeddingsEnabled } from '@/lib/embeddings'
import { searchContent } from '@/lib/cms'

export interface Source { id: string; slug: string; type: string; title: string; cover_image: string | null }
export interface Retrieved { context: string; sources: Source[] }

interface Hit { content_id: string; text: string; score: number }

const MAX_SOURCES = 5
const MAX_CONTEXT_CHARS = 6000

export async function retrieve(query: string, opts: { hint?: string; limit?: number } = {}): Promise<Retrieved> {
  const q = (query || '').trim()
  if (!q) return { context: '', sources: [] }
  const db = getSupabaseAdmin()
  const hits: Hit[] = []

  // 1) Semantic (if an embedding provider is configured + chunks exist).
  if (embeddingsEnabled()) {
    try {
      const vec = await embedOne(opts.hint ? `${q}\n${opts.hint}` : q)
      if (vec) {
        const { data } = await db.rpc('match_cms_chunks', { query_embedding: vec, match_count: 8 })
        for (const r of (data as Array<{ content_id: string; chunk_text: string; similarity: number }>) || []) {
          hits.push({ content_id: r.content_id, text: r.chunk_text, score: r.similarity })
        }
      }
    } catch (e) {
      console.error('semantic retrieve failed', e)
    }
  }

  // 2) Keyword (always) — full-text over the content index.
  try {
    const kw = await searchContent(q, { limit: 8 })
    kw.forEach((c, i) => {
      hits.push({ content_id: c.id, text: (c.summary || c.description || '').slice(0, 800), score: 0.4 - i * 0.02 })
    })
  } catch (e) {
    console.error('keyword retrieve failed', e)
  }

  if (!hits.length) return { context: '', sources: [] }

  // 3) Merge → best hit per content item, ranked by score.
  const best = new Map<string, Hit>()
  for (const h of hits) {
    const cur = best.get(h.content_id)
    if (!cur || h.score > cur.score) best.set(h.content_id, h)
  }
  const ranked = Array.from(best.values()).sort((a, b) => b.score - a.score).slice(0, opts.limit || MAX_SOURCES)

  // 4) Fetch source metadata + assemble the grounded context.
  const ids = ranked.map((h) => h.content_id)
  const { data: rows } = await db
    .from('cms_content')
    .select('id,slug,type,title,cover_image,summary')
    .in('id', ids)
    .eq('status', 'published')
  const meta = new Map((rows || []).map((r) => [r.id, r]))

  const sources: Source[] = []
  const parts: string[] = []
  let used = 0
  for (const h of ranked) {
    const m = meta.get(h.content_id)
    if (!m) continue
    const block = `### ${m.title} (${m.type})\n${h.text || m.summary || ''}`.trim()
    if (used + block.length > MAX_CONTEXT_CHARS) break
    used += block.length
    parts.push(block)
    sources.push({ id: m.id, slug: m.slug, type: m.type, title: m.title, cover_image: m.cover_image || null })
  }

  return { context: parts.join('\n\n'), sources }
}
