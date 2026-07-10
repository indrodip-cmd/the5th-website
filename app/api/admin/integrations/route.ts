import { NextRequest, NextResponse } from 'next/server'
import { adminEmail } from '@/lib/session'
import { getSupabaseAdmin } from '@/lib/supabase'
import { listIntegrations, runSync } from '@/lib/integrations'
import { whopBackfillPayments } from '@/lib/connectors/whop'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

/* GET — all integrations with live health + recent sync activity. */
export async function GET(req: NextRequest) {
  if (!adminEmail(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const [integrations, recent] = await Promise.all([
    listIntegrations(),
    getSupabaseAdmin().from('crm_integration_syncs').select('*').order('started_at', { ascending: false }).limit(20),
  ])
  return NextResponse.json({ integrations, recent: recent.data || [] })
}

/* POST { provider, action } — sync | connect | disconnect. */
export async function POST(req: NextRequest) {
  if (!adminEmail(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const b = await req.json().catch(() => ({}))
  const provider = String(b?.provider || '')
  const action = String(b?.action || 'sync')
  if (!provider) return NextResponse.json({ error: 'provider required.' }, { status: 400 })
  const db = getSupabaseAdmin()
  if (action === 'sync') return NextResponse.json(await runSync(provider))
  if (action === 'backfill' && provider === 'whop') return NextResponse.json(await whopBackfillPayments())
  if (action === 'disconnect') { await db.from('crm_integrations').update({ enabled: false }).eq('provider', provider); return NextResponse.json({ ok: true }) }
  if (action === 'connect') { await db.from('crm_integrations').update({ enabled: true }).eq('provider', provider); return NextResponse.json({ ok: true }) }
  return NextResponse.json({ error: 'unknown action.' }, { status: 400 })
}
