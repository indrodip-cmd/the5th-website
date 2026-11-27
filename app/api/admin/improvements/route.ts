import { NextRequest, NextResponse } from 'next/server'
import { adminEmail } from '@/lib/session'
import { getSupabaseAdmin } from '@/lib/supabase'
import { runSiteInsights, computeMetrics } from '@/lib/site-opt/insights'

export const dynamic = 'force-dynamic'
export const maxDuration = 120

export async function GET(req: NextRequest) {
  if (!adminEmail(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { data } = await getSupabaseAdmin().from('site_proposals').select('*').order('created_at', { ascending: false }).limit(60)
  const metrics = await computeMetrics(7).catch(() => null)
  return NextResponse.json({ proposals: data || [], metrics })
}

/* POST { id, action: approve|reject|revert } or { action: 'run' } to run the review now. */
export async function POST(req: NextRequest) {
  const who = adminEmail(req)
  if (!who) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const b = await req.json().catch(() => ({}))
  if (b.action === 'run') return NextResponse.json(await runSiteInsights())
  const status = { approve: 'approved', reject: 'rejected', revert: 'reverted' }[String(b.action) as 'approve'] as string | undefined
  if (!status || typeof b.id !== 'string') return NextResponse.json({ error: 'bad request' }, { status: 400 })
  const { error } = await getSupabaseAdmin().from('site_proposals').update({ status, decided_at: new Date().toISOString(), decided_by: who }).eq('id', b.id)
  return NextResponse.json({ ok: !error, error: error?.message })
}
