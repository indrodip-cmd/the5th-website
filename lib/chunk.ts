/* Semantic chunking — split content into ~500-800 token windows while keeping
   document hierarchy (section headings). Token ≈ 4 chars, so target ~2600 chars. */

export interface Chunk { heading: string; position: number; text: string }

const TARGET = 2600 // ~650 tokens
const MAX = 3400

export function chunkContent(opts: { title: string; summary?: string | null; body?: string | null }): Chunk[] {
  const chunks: Chunk[] = []
  let pos = 0
  const push = (heading: string, text: string) => {
    const t = text.trim()
    if (t.length < 20) return
    chunks.push({ heading, position: pos++, text: t })
  }

  // The title + summary always becomes the first, high-signal chunk.
  const head = `${opts.title}${opts.summary ? '\n' + opts.summary : ''}`.trim()
  if (head) push(opts.title, head)

  const body = (opts.body || '').trim()
  if (!body) return chunks

  // Split into sections by markdown headings.
  const lines = body.split(/\r?\n/)
  let heading = opts.title
  let buf: string[] = []
  const flush = () => {
    const section = buf.join('\n').trim(); buf = []
    if (!section) return
    // Split long sections into sentence-aware windows.
    if (section.length <= MAX) { push(heading, section); return }
    const parts = section.split(/(?<=[.!?])\s+/)
    let cur = ''
    for (const p of parts) {
      if ((cur + ' ' + p).length > TARGET && cur) { push(heading, cur); cur = p }
      else cur = cur ? cur + ' ' + p : p
    }
    if (cur) push(heading, cur)
  }
  for (const line of lines) {
    const h = line.match(/^#{1,3}\s+(.*)$/)
    if (h) { flush(); heading = h[1].trim() || opts.title }
    else buf.push(line)
  }
  flush()
  return chunks
}
