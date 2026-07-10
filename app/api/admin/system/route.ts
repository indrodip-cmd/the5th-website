import { NextRequest, NextResponse } from 'next/server'
import { adminEmail } from '@/lib/session'
import { getSupabaseAdmin } from '@/lib/supabase'
import { checkHealth } from '@/lib/health'
import { dbHealth } from '@/lib/db-health'
import { aiCostSummary, aiPerformance } from '@/lib/ai-usage'
import { getCostSettings } from '@/lib/cost-guard'
import { listIntegrations, runAllSyncs } from '@/lib/integrations'
import { getAnthropicOrgUsage } from '@/lib/connectors/anthropic-usage'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

const CRONS = [
  { path: '/api/cron/daily-sequence', schedule: '0 8 * * *' },
  { path: '/api/cron/crm-sync', schedule: '0 7 * * *' },
]

/* GET ?panel=health|ai|webhooks|jobs|security|database|logs|integrations */
export async function GET(req: NextRequest) {
  if (!adminEmail(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const sp = new URL(req.url).searchParams
  const panel = sp.get('panel') || 'health'
  const db = getSupabaseAdmin()

  if (panel === 'health') return NextResponse.json(await checkHealth())
  if (panel === 'database') return NextResponse.json(await dbHealth())
  if (panel === 'integrations') return NextResponse.json({ integrations: await listIntegrations() })
  if (panel === 'ai') {
    const [cost, perf, settings, org] = await Promise.all([aiCostSummary(), aiPerformance(), getCostSettings(), getAnthropicOrgUsage()])
    return NextResponse.json({ cost, perf, settings, org })
  }
  if (panel === 'webhooks') {
    const { data } = await db.from('integration_webhooks').select('*').order('received_at', { ascending: false }).limit(100)
    const rows = data || []
    const byStatus: Record<string, number> = {}
    for (const w of rows) byStatus[w.status as string] = (byStatus[w.status as string] || 0) + 1
    return NextResponse.json({ webhooks: rows, byStatus })
  }
  if (panel === 'jobs') {
    const [syncs, autos] = await Promise.all([
      db.from('crm_integration_syncs').select('*').order('started_at', { ascending: false }).limit(60),
      db.from('automation_runs').select('*').order('created_at', { ascending: false }).limit(40),
    ])
    return NextResponse.json({ syncs: syncs.data || [], automations: autos.data || [], crons: CRONS })
  }
  if (panel === 'security') {
    const [events, limits, audit] = await Promise.all([
      db.from('security_events').select('*').order('created_at', { ascending: false }).limit(60),
      db.from('api_rate_limits').select('*').eq('blocked', true).order('created_at', { ascending: false }).limit(30),
      db.from('crm_audit_log').select('actor,action,entity_type,created_at').order('created_at', { ascending: false }).limit(30),
    ])
    const { count: sigFails } = await db.from('integration_webhooks').select('id', { count: 'exact', head: true }).eq('signature_valid', false)
    return NextResponse.json({ events: events.data || [], blockedLimits: limits.data || [], audit: audit.data || [], webhookSignatureFailures: sigFails || 0 })
  }
  if (panel === 'logs') {
    let q = db.from('system_logs').select('*').order('created_at', { ascending: false }).limit(200)
    if (sp.get('level')) q = q.eq('level', sp.get('level'))
    if (sp.get('source')) q = q.eq('source', sp.get('source'))
    if (sp.get('q')) q = q.ilike('message', `%${sp.get('q')}%`)
    const { data } = await q
    return NextResponse.json({ logs: data || [] })
  }
  return NextResponse.json({ error: 'unknown panel' }, { status: 400 })
}

/* POST { action: 'save_settings' | 'rerun' } */
export async function POST(req: NextRequest) {
  if (!adminEmail(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const b = await req.json().catch(() => ({}))
  const db = getSupabaseAdmin()

  if (b?.action === 'save_settings' && b?.settings && typeof b.settings === 'object') {
    const allowed = ['ai_daily_budget_usd', 'ai_monthly_budget_usd', 'ai_max_cost_per_conversation', 'ai_max_tokens_per_request', 'ai_max_msgs_per_visitor', 'ai_emergency_off', 'ai_throttle_on_budget']
    for (const [k, v] of Object.entries(b.settings as Record<string, unknown>)) {
      if (!allowed.includes(k)) continue
      await db.from('platform_settings').upsert({ key: k, value: typeof v === 'boolean' ? String(v) : String(v), updated_at: new Date().toISOString() }, { onConflict: 'key' })
    }
    return NextResponse.json({ ok: true })
  }
  if (b?.action === 'rerun') {
    const res = await runAllSyncs().catch((e) => ({ error: String(e) }))
    return NextResponse.json({ ok: true, result: res })
  }
  return NextResponse.json({ error: 'unknown action' }, { status: 400 })
}
