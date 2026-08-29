import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { adminEmail } from '@/lib/session'
import { dispatchWhopEvent, whopAction } from '@/lib/whop-fulfillment'

export const dynamic = 'force-dynamic'
export const maxDuration = 300

/* Admin-only recovery for Whop events that were DROPPED while the webhook was
   failing signature verification. Their full payloads are stored in
   integration_webhooks (status='error'); this replays each one through the same
   fulfillment dispatcher the live webhook uses — recording revenue, enrolling
   buyers, granting entitlements — then marks the row 'reprocessed' so a second
   run is a no-op. Every side-effect is idempotent, so this is safe to run more
   than once. GET → dry-run preview (counts only). POST → actually recover.
   Admin founder notifications are muted so recovery doesn't spam the inbox;
   buyer-facing emails (welcome / confirmation) still send since those buyers
   never received them. */

async function preview() {
  const db = getSupabaseAdmin()
  const { data } = await db.from('integration_webhooks').select('payload').eq('provider', 'whop').eq('status', 'error').limit(5000)
  const by: Record<string, number> = {}
  for (const r of data || []) { const a = whopAction((r.payload as Record<string, unknown>) || {}); by[a] = (by[a] || 0) + 1 }
  return { pending: (data || []).length, by }
}

export async function GET(req: NextRequest) {
  if (!adminEmail(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  return NextResponse.json({ dryRun: true, ...(await preview()) })
}

export async function POST(req: NextRequest) {
  if (!adminEmail(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json().catch(() => ({}))
  const limit = Math.min(Number(body?.limit) || 500, 2000)
  const db = getSupabaseAdmin()

  const { data: rows, error } = await db
    .from('integration_webhooks')
    .select('id,payload')
    .eq('provider', 'whop').eq('status', 'error')
    .order('received_at', { ascending: true })
    .limit(limit)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const summary: Record<string, number> = {}
  let recovered = 0, skipped = 0, errors = 0
  for (const row of rows || []) {
    const payload = (row.payload as Record<string, unknown>) || {}
    const action = whopAction(payload)
    if (!payload || action === 'unknown') { skipped++; continue }
    try {
      await dispatchWhopEvent(payload, JSON.stringify(payload), { adminNotify: false })
      await db.from('integration_webhooks').update({ status: 'reprocessed', signature_valid: true, processed_at: new Date().toISOString(), error: 'recovered via admin replay' }).eq('id', row.id)
      recovered++
      summary[action] = (summary[action] || 0) + 1
    } catch (e) {
      errors++
      await db.from('integration_webhooks').update({ error: `recovery failed: ${String(e).slice(0, 160)}` }).eq('id', row.id).then(() => {}, () => {})
    }
  }
  return NextResponse.json({ ok: errors === 0, recovered, skipped, errors, by: summary, remaining: (await preview()).pending })
}
