/* Microsoft Clarity connector — LIVE (credential-gated).
   Uses the Clarity Data Export API. Env: CLARITY_API_TOKEN.
   Docs shape: POST-less GET with Bearer token returning metric traffic rows. */
import { getSupabaseAdmin } from '@/lib/supabase'

export function clarityConfigured(): boolean {
  return !!process.env.CLARITY_API_TOKEN
}

interface SyncResult { records: number; log: string[] }

/* Pull the last N days of project-level metrics into crm_analytics_daily. */
export async function claritySync(): Promise<SyncResult> {
  const token = process.env.CLARITY_API_TOKEN
  if (!token) return { records: 0, log: ['not configured'] }
  const log: string[] = []
  let records = 0
  try {
    // Clarity's export API returns aggregated metrics for the requested window.
    const r = await fetch('https://www.clarity.ms/export-data/api/v1/project-live-insights?numOfDays=3', {
      headers: { Authorization: `Bearer ${token}` }, cache: 'no-store',
    })
    if (!r.ok) { log.push(`clarity API ${r.status}`); return { records, log } }
    const data = await r.json().catch(() => null)
    const rows: Array<Record<string, unknown>> = Array.isArray(data) ? data : (data?.metrics as Array<Record<string, unknown>>) || []
    const db = getSupabaseAdmin()
    const today = new Date().toISOString().slice(0, 10)
    for (const m of rows) {
      const metricName = String(m.metricName || m.name || 'metric')
      await db.from('crm_analytics_daily').upsert({
        provider: 'clarity', metric_date: today, dimension: 'overall', dimension_value: metricName,
        metrics: m,
      }, { onConflict: 'provider,metric_date,dimension,dimension_value' })
      records++
    }
    log.push(`synced ${records} clarity metrics`)
  } catch (e) {
    log.push('clarity sync error: ' + String(e))
  }
  return { records, log }
}
