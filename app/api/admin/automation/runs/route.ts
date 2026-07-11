import { NextRequest, NextResponse } from 'next/server'
import { adminEmail } from '@/lib/session'
import { getSupabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

/* GET — execution history (filterable), a single run (?id=), or the pending
   approval queue (?pending=1). */
export async function GET(req: NextRequest) {
  if (!adminEmail(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const db = getSupabaseAdmin()
  const sp = new URL(req.url).searchParams
  const id = sp.get('id')
  if (id) { const { data } = await db.from('automation_workflow_runs').select('*').eq('id', id).maybeSingle(); return NextResponse.json({ run: data }) }
  if (sp.get('pending')) {
    const { data } = await db.from('automation_workflow_runs').select('id,workflow_name,approval_note,created_at,steps').eq('status', 'awaiting_approval').order('created_at', { ascending: false }).limit(50)
    return NextResponse.json({ approvals: data || [] })
  }
  let q = db.from('automation_workflow_runs').select('id,workflow_id,workflow_name,trigger_type,status,cost_usd,duration_ms,is_test,created_at').order('created_at', { ascending: false }).limit(100)
  if (sp.get('workflow')) q = q.eq('workflow_id', sp.get('workflow'))
  if (sp.get('status')) q = q.eq('status', sp.get('status'))
  const { data } = await q
  return NextResponse.json({ runs: data || [] })
}
