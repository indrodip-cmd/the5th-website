import { NextRequest, NextResponse } from 'next/server'
import { adminEmail } from '@/lib/session'
import { getSupabaseAdmin } from '@/lib/supabase'
import { listIntegrations } from '@/lib/integrations'
import { PROVIDERS } from '@/lib/comm/providers'
import { checkDomain } from '@/lib/comm/deliverability'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

type Item = { label: string; status: 'green' | 'yellow' | 'red'; detail?: string }
const env = (k: string) => !!process.env[k]

/* Launch readiness — green/yellow/red across every dependency. */
export async function GET(req: NextRequest) {
  if (!adminEmail(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const db = getSupabaseAdmin()

  let dbOk = false
  try { const { error } = await db.from('crm_contacts').select('id', { head: true, count: 'exact' }).limit(1); dbOk = !error } catch {}
  const { data: sender } = await db.from('comm_senders').select('email').eq('enabled', true).order('is_default', { ascending: false }).limit(1).maybeSingle()
  const [integrations, providerCfg, auth] = await Promise.all([
    listIntegrations().catch(() => []),
    Promise.all(PROVIDERS.map(async (p) => ({ name: p.name, kind: p.kind, ok: await p.isConfigured() }))),
    checkDomain((sender?.email as string) || 'the5th.co').catch(() => null),
  ])

  const core: Item[] = [
    { label: 'Database', status: dbOk ? 'green' : 'red', detail: dbOk ? 'connected' : 'unreachable' },
    { label: 'Command AI (Anthropic)', status: env('ANTHROPIC_API_KEY') ? 'green' : 'red', detail: env('ANTHROPIC_API_KEY') ? 'configured' : 'ANTHROPIC_API_KEY missing' },
    { label: 'Session secret', status: env('SESSION_SECRET') ? 'green' : 'yellow', detail: env('SESSION_SECRET') ? 'set' : 'SESSION_SECRET recommended' },
    { label: 'Cron secret', status: env('CRON_SECRET') ? 'green' : 'yellow' },
    { label: 'Supabase service key', status: env('SUPABASE_SERVICE_ROLE_KEY') ? 'green' : 'red' },
  ]
  const comms: Item[] = providerCfg.map((p) => ({ label: `${p.name} (${p.kind})`, status: p.ok ? 'green' : (p.name === 'Resend' ? 'red' : 'yellow'), detail: p.ok ? 'configured' : 'add credentials' }))
  const email: Item[] = auth ? [
    { label: `SPF · ${auth.domain}`, status: auth.spf.ok ? 'green' : 'red', detail: auth.spf.ok ? 'verified' : 'not detected' },
    { label: 'DKIM', status: auth.dkim.ok ? 'green' : 'red' },
    { label: 'DMARC', status: auth.dmarc.ok ? 'green' : 'yellow', detail: auth.dmarc.policy || undefined },
  ] : [{ label: 'Email authentication', status: 'yellow', detail: 'no sender domain' }]
  const integ: Item[] = ((integrations as Row[]) || []).map((i) => ({ label: (i.label as string) || (i.provider as string), status: i.configured ? 'green' : 'yellow', detail: (i.status as string) || (i.configured ? 'connected' : 'not connected') }))

  const sections = [
    { name: 'Core platform', items: core },
    { name: 'Email authentication', items: email },
    { name: 'Communication providers', items: comms },
    { name: 'Integrations', items: integ },
  ]
  const reds = sections.flatMap((s) => s.items).filter((i) => i.status === 'red').length
  return NextResponse.json({ sections, ready: reds === 0, blockers: reds })
}
type Row = Record<string, unknown>
