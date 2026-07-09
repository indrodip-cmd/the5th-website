import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { adminEmail } from '@/lib/session'
import { chunkContent } from '@/lib/chunk'
import { embedTexts, embeddingProvider } from '@/lib/embeddings'

export const dynamic = 'force-dynamic'
export const maxDuration = 120

/* Re-index the knowledge engine: (re)chunk published content and embed the
   chunks. Idempotent per content item. Runs keyword-ready even without an
   embedding provider (stores chunks; embeddings fill in when a key is set). */
export async function POST(req: NextRequest) {
  if (!adminEmail(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const db = getSupabaseAdmin()
  const body = await req.json().catch(() => ({}))
  const onlyId = typeof body?.id === 'string' ? body.id : null

  let q = db.from('cms_content').select('id,title,summary,description').eq('status', 'published')
  if (onlyId) q = q.eq('id', onlyId)
  const { data: items, error } = await q
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const provider = embeddingProvider()
  let chunked = 0
  let embedded = 0

  for (const it of items || []) {
    const chunks = chunkContent({ title: it.title, summary: it.summary, body: it.description })
    // Replace existing chunks for this item.
    await db.from('cms_chunks').delete().eq('content_id', it.id)
    if (!chunks.length) continue

    const vectors = provider ? await embedTexts(chunks.map((c) => c.text)) : null
    const rows = chunks.map((c, i) => ({
      content_id: it.id,
      heading: c.heading,
      position: c.position,
      text: c.text,
      embedding: vectors ? vectors[i] : null,
      metadata: {},
    }))
    const { error: insErr } = await db.from('cms_chunks').insert(rows)
    if (insErr) { console.error('insert chunks', insErr.message); continue }
    chunked += rows.length
    if (vectors) embedded += rows.length
  }

  return NextResponse.json({
    ok: true,
    provider: provider || 'none (keyword-only until an embedding key is set)',
    items: (items || []).length,
    chunks: chunked,
    embedded,
  })
}
