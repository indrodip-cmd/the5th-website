/* Native CRM helpers — the single source of truth for every contact.
   Contacts live in carolina_leads (extended with pipeline/score/tags);
   crm_activities is the per-contact timeline. Fails soft — never blocks chat. */
import { getSupabaseAdmin } from '@/lib/supabase'

export async function logActivity(
  email: string,
  type: string,
  title?: string,
  detail?: string,
  data?: Record<string, unknown>
) {
  if (!email) return
  try {
    await getSupabaseAdmin().from('crm_activities').insert({
      contact_email: email.toLowerCase(),
      type,
      title: title || null,
      detail: detail || null,
      data: data || {},
    })
  } catch (e) {
    console.error('crm logActivity failed', e)
  }
}

export async function upsertContact(email: string, patch: Record<string, unknown>) {
  if (!email) return
  try {
    await getSupabaseAdmin()
      .from('carolina_leads')
      .upsert({ email: email.toLowerCase(), ...patch, updated_at: new Date().toISOString() }, { onConflict: 'email' })
  } catch (e) {
    console.error('crm upsertContact failed', e)
  }
}
