/* Communication OS — server-only secret resolution. Env vars take precedence;
   UI-set secrets live in platform_settings (never returned to the frontend).
   NOTE: platform_settings is plaintext at rest — for production, back these with
   a KMS/Vault; the access path (server-only, masked in APIs) is already correct. */
import { getSupabaseAdmin } from '@/lib/supabase'

export async function getSecret(name: string): Promise<string> {
  if (process.env[name]) return process.env[name] as string
  const { data } = await getSupabaseAdmin().from('platform_settings').select('value').eq('key', `comm_secret_${name}`).maybeSingle()
  return (data?.value as string) || ''
}
export async function hasSecret(name: string): Promise<boolean> { return !!(await getSecret(name)) }
export async function setSecret(name: string, value: string): Promise<void> {
  await getSupabaseAdmin().from('platform_settings').upsert({ key: `comm_secret_${name}`, value, updated_at: new Date().toISOString() }, { onConflict: 'key' })
}
/** Whether a secret is provided via env (read-only) vs the DB (editable). */
export function isEnvSecret(name: string): boolean { return !!process.env[name] }
