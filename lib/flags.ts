/* Feature flags — enable/disable major features without a deploy. Server checks
   isEnabled(); the admin shell hides nav for disabled flags. Fail-open (a flag
   store outage never hides the whole product). */
import { getSupabaseAdmin } from '@/lib/supabase'

type Row = Record<string, unknown>

export async function listFlags(): Promise<Row[]> {
  const { data } = await getSupabaseAdmin().from('feature_flags').select('*').order('label')
  return data || []
}
export async function enabledFlagKeys(): Promise<string[]> {
  const { data } = await getSupabaseAdmin().from('feature_flags').select('key,enabled,rollout')
  return (data || []).filter((f) => f.enabled && Number(f.rollout ?? 100) > 0).map((f) => f.key as string)
}
export async function isEnabled(key: string): Promise<boolean> {
  try {
    const { data } = await getSupabaseAdmin().from('feature_flags').select('enabled,rollout').eq('key', key).maybeSingle()
    if (!data) return true // unknown flag → on (fail-open)
    return !!data.enabled && Number(data.rollout ?? 100) > 0
  } catch { return true }
}
export async function setFlag(key: string, patch: Row): Promise<void> {
  const allowed: Row = { updated_at: new Date().toISOString() }
  for (const k of ['enabled', 'rollout', 'audience', 'description', 'label']) if (k in patch) allowed[k] = patch[k]
  await getSupabaseAdmin().from('feature_flags').update(allowed).eq('key', key)
}
