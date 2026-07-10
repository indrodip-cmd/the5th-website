/* Integration platform registry (3I.3).

   One place that knows every provider, whether it's configured (credentials
   present — never stored in the DB, only read from env), how to sync it, and
   its health. Powers /admin/integrations. Cal.com/Zoom/Fathom reuse the 3I.2
   libs so the whole stack shows in one unified status view. */
import { getSupabaseAdmin } from '@/lib/supabase'
import { emitEvent } from '@/lib/events'
import { clarityConfigured, claritySync } from '@/lib/connectors/clarity'
import { ga4Configured, ga4Sync, gscConfigured, gscSync, metaAdsConfigured, metaAdsSync, googleAdsConfigured, googleAdsSync } from '@/lib/connectors/dormant'
import { calKey } from '@/lib/calcom'
import { zoomConfigured } from '@/lib/zoom'
import { fathomConfigured } from '@/lib/fathom'

export interface Provider {
  provider: string
  label: string
  category: 'marketing' | 'analytics' | 'meetings' | 'payments'
  configured: () => boolean
  sync?: () => Promise<{ records: number; log: string[] }>
}

const noSync = async () => ({ records: 0, log: ['no sync for this provider'] })

export const PROVIDERS: Provider[] = [
  { provider: 'clarity', label: 'Microsoft Clarity', category: 'analytics', configured: clarityConfigured, sync: claritySync },
  { provider: 'ga4', label: 'Google Analytics 4', category: 'analytics', configured: ga4Configured, sync: ga4Sync },
  { provider: 'gsc', label: 'Google Search Console', category: 'analytics', configured: gscConfigured, sync: gscSync },
  { provider: 'meta_ads', label: 'Meta Ads', category: 'marketing', configured: metaAdsConfigured, sync: metaAdsSync },
  { provider: 'google_ads', label: 'Google Ads', category: 'marketing', configured: googleAdsConfigured, sync: googleAdsSync },
  { provider: 'calcom', label: 'Cal.com', category: 'meetings', configured: () => !!calKey(), sync: noSync },
  { provider: 'zoom', label: 'Zoom', category: 'meetings', configured: zoomConfigured, sync: noSync },
  { provider: 'fathom', label: 'Fathom', category: 'meetings', configured: fathomConfigured, sync: noSync },
]

export function getProvider(name: string): Provider | undefined {
  return PROVIDERS.find((p) => p.provider === name)
}

/* List all integrations with live health (configured?) merged with stored rows. */
export async function listIntegrations() {
  const db = getSupabaseAdmin()
  const { data: rows } = await db.from('crm_integrations').select('*')
  const byProvider = new Map((rows || []).map((r) => [r.provider as string, r]))
  return PROVIDERS.map((p) => {
    const row = byProvider.get(p.provider) as Record<string, unknown> | undefined
    const configured = p.configured()
    return {
      provider: p.provider, label: p.label, category: p.category,
      configured, has_sync: !!p.sync && p.sync !== noSync,
      status: configured ? (row?.status === 'error' ? 'error' : 'connected') : 'disconnected',
      last_sync_at: row?.last_sync_at || null, last_error: row?.last_error || null,
      enabled: row?.enabled ?? true,
    }
  })
}

/* Run a provider's sync, recording a crm_integration_syncs row + status. */
export async function runSync(provider: string): Promise<{ ok: boolean; records: number; log: string[] }> {
  const p = getProvider(provider)
  const db = getSupabaseAdmin()
  if (!p || !p.sync) return { ok: false, records: 0, log: ['unknown provider'] }
  if (!p.configured()) {
    await db.from('crm_integrations').update({ status: 'disconnected' }).eq('provider', provider)
    return { ok: false, records: 0, log: [`${provider} not configured`] }
  }
  const { data: syncRow } = await db.from('crm_integration_syncs').insert({ provider, status: 'running' }).select('id').single()
  const syncId = syncRow?.id as string | undefined
  try {
    const res = await p.sync()
    await db.from('crm_integration_syncs').update({ status: 'success', records: res.records, log: res.log, finished_at: new Date().toISOString() }).eq('id', syncId!)
    await db.from('crm_integrations').update({ status: 'connected', last_sync_at: new Date().toISOString(), last_error: null }).eq('provider', provider)
    emitEvent('integration_synced', { provider, records: res.records })
    return { ok: true, records: res.records, log: res.log }
  } catch (e) {
    const err = String(e)
    await db.from('crm_integration_syncs').update({ status: 'error', error: err, finished_at: new Date().toISOString() }).eq('id', syncId!)
    await db.from('crm_integrations').update({ status: 'error', last_error: err }).eq('provider', provider)
    return { ok: false, records: 0, log: [err] }
  }
}

/* Run every configured provider that has a real sync (used by the daily cron). */
export async function runAllSyncs(): Promise<Record<string, number>> {
  const out: Record<string, number> = {}
  for (const p of PROVIDERS) {
    if (p.sync && p.sync !== noSync && p.configured()) {
      const r = await runSync(p.provider)
      out[p.provider] = r.records
    }
  }
  return out
}
