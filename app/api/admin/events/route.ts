import { NextRequest, NextResponse } from 'next/server'
import { adminEmail } from '@/lib/session'
import { getSupabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

/* Event Center feed: incoming webhooks + sync jobs, with status/errors. */
export async function GET(req: NextRequest) {
  if (!adminEmail(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const db = getSupabaseAdmin()
  const sp = new URL(req.url).searchParams
  const provider = sp.get('provider')
  let wq = db.from('integration_webhooks').select('id,provider,event_type,status,signature_valid,error,received_at,processed_at').order('received_at', { ascending: false }).limit(50)
  let sq = db.from('crm_integration_syncs').select('id,provider,status,records,error,started_at,finished_at').order('started_at', { ascending: false }).limit(50)
  if (provider) { wq = wq.eq('provider', provider); sq = sq.eq('provider', provider) }
  const [webhooks, syncs] = await Promise.all([wq, sq])
  return NextResponse.json({ webhooks: webhooks.data || [], syncs: syncs.data || [] })
}
