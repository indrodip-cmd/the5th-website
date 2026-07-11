/* Prompt Management (3I.5) — internal AI prompts are versioned, configurable
   assets, never hardcoded strings. Supports draft → publish → rollback, with one
   published version per key. Agents/Command AI can read the published prompt for
   a key (falling back to their built-in default when none is published). */
import { getSupabaseAdmin } from '@/lib/supabase'

type Row = Record<string, unknown>

export async function listPromptKeys() {
  const { data } = await getSupabaseAdmin().from('ai_prompts').select('key,version,status,label,updated:published_at,created_at').order('created_at', { ascending: false })
  const byKey = new Map<string, Row>()
  for (const r of (data || []) as Row[]) {
    const k = r.key as string
    const cur = byKey.get(k) || { key: k, versions: 0, published: null as string | null, latest: 0 }
    ;(cur.versions as number) = (cur.versions as number) + 1
    if ((r.version as number) > (cur.latest as number)) cur.latest = r.version
    if (r.status === 'published') cur.published = r.version
    byKey.set(k, cur)
  }
  return [...byKey.values()]
}

export async function getPromptVersions(key: string) {
  const { data } = await getSupabaseAdmin().from('ai_prompts').select('*').eq('key', key).order('version', { ascending: false })
  return data || []
}

/** The currently published prompt content for a key, or null. */
export async function getPublishedPrompt(key: string): Promise<string | null> {
  const { data } = await getSupabaseAdmin().from('ai_prompts').select('content').eq('key', key).eq('status', 'published').order('version', { ascending: false }).limit(1).maybeSingle()
  return (data?.content as string) ?? null
}

/** Save a new draft version (auto-incremented) for a key. */
export async function savePromptDraft(key: string, content: string, actor?: string, label?: string, notes?: string) {
  const db = getSupabaseAdmin()
  const { data: last } = await db.from('ai_prompts').select('version').eq('key', key).order('version', { ascending: false }).limit(1).maybeSingle()
  const version = ((last?.version as number) || 0) + 1
  const { data } = await db.from('ai_prompts').insert({ key, version, content, label: label || null, notes: notes || null, status: 'draft', created_by: actor || null }).select('*').single()
  return data
}

/** Publish a version (archives any other published version of the same key). */
export async function publishPrompt(key: string, version: number, actor?: string) {
  const db = getSupabaseAdmin()
  await db.from('ai_prompts').update({ status: 'archived' }).eq('key', key).eq('status', 'published')
  const { data } = await db.from('ai_prompts').update({ status: 'published', published_at: new Date().toISOString(), created_by: actor || undefined }).eq('key', key).eq('version', version).select('*').single()
  return data
}
