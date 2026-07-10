/* System Health (3I.5) — quick live probes for every subsystem. Read-only,
   fail-soft. Composes app checks + integration status + recent telemetry. */
import { getSupabaseAdmin } from '@/lib/supabase'
import { listIntegrations } from '@/lib/integrations'
import { dbHealth } from '@/lib/db-health'

type Row = Record<string, unknown>
export interface Service {
  name: string; category: string; status: 'online' | 'degraded' | 'offline'
  responseMs?: number; lastSync?: string | null; lastError?: string | null; detail?: string
}

function ago(iso?: string | null): number { return iso ? Date.now() - +new Date(iso) : Infinity }

export async function checkHealth() {
  const db = getSupabaseAdmin()
  const services: Service[] = []

  // Website (we're serving it)
  services.push({ name: 'Website', category: 'core', status: 'online' })

  // Database — timed round-trip
  const t0 = Date.now()
  let dbOk = true
  try { await db.from('platform_settings').select('key', { count: 'exact', head: true }).limit(1) } catch { dbOk = false }
  services.push({ name: 'Database', category: 'core', status: dbOk ? 'online' : 'offline', responseMs: Date.now() - t0 })

  // Storage
  let storageOk = true
  try { const { error } = await db.storage.listBuckets(); storageOk = !error } catch { storageOk = false }
  services.push({ name: 'Storage', category: 'core', status: storageOk ? 'online' : 'degraded' })

  // Vector search (pgvector) + DB detail
  const dbh = await dbHealth()
  services.push({ name: 'Vector Search', category: 'core', status: dbh.ok ? (dbh.hasVector ? 'online' : 'degraded') : 'degraded', detail: dbh.ok && !dbh.hasVector ? 'pgvector not enabled' : undefined })

  // AI service — configured + recent error rate
  const { data: aiRecent } = await db.from('ai_events').select('status').gte('created_at', new Date(Date.now() - 3600000).toISOString()).limit(1000)
  const aiRows = (aiRecent || []) as Row[]
  const aiErr = aiRows.filter((r) => r.status === 'error').length
  services.push({
    name: 'AI Service', category: 'core',
    status: !process.env.ANTHROPIC_API_KEY ? 'offline' : aiRows.length && aiErr / aiRows.length > 0.2 ? 'degraded' : 'online',
    detail: !process.env.ANTHROPIC_API_KEY ? 'ANTHROPIC_API_KEY not set' : aiRows.length ? `${aiRows.length} calls/1h` : undefined,
  })

  // Background workers / event queue — recency of the last sync job
  const { data: lastSync } = await db.from('crm_integration_syncs').select('started_at,status').order('started_at', { ascending: false }).limit(1).maybeSingle()
  const syncAge = ago(lastSync?.started_at as string)
  services.push({ name: 'Background Workers', category: 'core', status: syncAge < 26 * 3600000 ? 'online' : syncAge < 72 * 3600000 ? 'degraded' : 'offline', lastSync: (lastSync?.started_at as string) || null, detail: 'daily cron' })

  // Authentication (admin OTP scheme configured)
  services.push({ name: 'Authentication', category: 'core', status: process.env.SESSION_SECRET ? 'online' : 'degraded' })

  // Every integration → a service row
  const integrations = await listIntegrations()
  const iconCat: Record<string, string> = { payments: 'integration', analytics: 'integration', marketing: 'integration', meetings: 'integration' }
  for (const i of integrations) {
    services.push({
      name: i.label, category: iconCat[i.category] || 'integration',
      status: i.configured ? (i.status === 'error' ? 'degraded' : 'online') : 'offline',
      lastSync: i.last_sync_at as string | null, lastError: i.last_error as string | null,
      detail: i.configured ? undefined : 'not connected',
    })
  }

  const version = process.env.VERCEL_GIT_COMMIT_SHA ? String(process.env.VERCEL_GIT_COMMIT_SHA).slice(0, 7) : 'dev'
  const worst = services.some((s) => s.status === 'offline' && s.category === 'core') ? 'offline'
    : services.some((s) => s.status === 'degraded') ? 'degraded' : 'online'
  return { services, version, overall: worst, database: dbh, checkedAt: new Date().toISOString() }
}
