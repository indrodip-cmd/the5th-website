/* Embedding service — abstracted behind one interface so the provider can be
   swapped without touching retrieval. Returns null when no provider key is set;
   the retrieval layer then degrades to keyword search (no runtime failure).

   Default provider: OpenAI text-embedding-3-small (1536 dims — matches the
   `vector(1536)` columns). Voyage support is included but note voyage-3 is 1024
   dims and would require a column dimension change first. */

const DIM = 1536

export function embeddingProvider(): 'openai' | 'voyage' | null {
  if (process.env.OPENAI_API_KEY) return 'openai'
  if (process.env.VOYAGE_API_KEY) return 'voyage'
  return null
}
export function embeddingsEnabled(): boolean {
  return embeddingProvider() !== null
}

export async function embedTexts(texts: string[]): Promise<number[][] | null> {
  const provider = embeddingProvider()
  if (!provider || !texts.length) return null
  const input = texts.map((t) => (t || '').slice(0, 8000))
  try {
    if (provider === 'openai') {
      const r = await fetch('https://api.openai.com/v1/embeddings', {
        method: 'POST',
        headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: 'text-embedding-3-small', input }),
      })
      if (!r.ok) { console.error('openai embed', r.status, await r.text().catch(() => '')); return null }
      const j = await r.json()
      const out = (j.data || []).map((d: { embedding: number[] }) => d.embedding)
      return out.every((v: number[]) => v.length === DIM) ? out : null
    }
    // voyage — note dimension mismatch (1024) vs our 1536 columns.
    const r = await fetch('https://api.voyageai.com/v1/embeddings', {
      method: 'POST',
      headers: { Authorization: `Bearer ${process.env.VOYAGE_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'voyage-3', input }),
    })
    if (!r.ok) return null
    const j = await r.json()
    const out = (j.data || []).map((d: { embedding: number[] }) => d.embedding)
    return out.every((v: number[]) => v.length === DIM) ? out : null
  } catch (e) {
    console.error('embedTexts failed', e)
    return null
  }
}

export async function embedOne(text: string): Promise<number[] | null> {
  const v = await embedTexts([text])
  return v ? v[0] : null
}
