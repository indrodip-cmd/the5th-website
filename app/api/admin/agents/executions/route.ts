import { NextRequest, NextResponse } from 'next/server'
import { adminEmail } from '@/lib/session'
import { getSupabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

/* GET — execution history (searchable) or ?id=<uuid> for one full record incl.
   plan/steps/approvals (the audit trail for every AI action). */
export async function GET(req: NextRequest) {
  if (!adminEmail(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const db = getSupabaseAdmin()
  const sp = new URL(req.url).searchParams
  const id = sp.get('id')
  if (id) {
    const { data } = await db.from('agent_executions').select('*').eq('id', id).maybeSingle()
    if (!data) return NextResponse.json({ error: 'not found' }, { status: 404 })
    const { data: approvals } = await db.from('agent_approvals').select('*').eq('execution_id', id).order('created_at')
    return NextResponse.json({ execution: data, approvals: approvals || [] })
  }
  let q = db.from('agent_executions').select('id,agent_key,goal,status,tools_used,cost_usd,duration_ms,actor,created_at,finished_at').order('created_at', { ascending: false }).limit(100)
  if (sp.get('agent')) q = q.eq('agent_key', sp.get('agent'))
  if (sp.get('status')) q = q.eq('status', sp.get('status'))
  if (sp.get('q')) q = q.ilike('goal', `%${sp.get('q')}%`)
  const { data } = await q
  return NextResponse.json({ executions: data || [] })
}
