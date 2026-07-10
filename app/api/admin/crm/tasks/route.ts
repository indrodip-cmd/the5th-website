import { NextRequest, NextResponse } from 'next/server'
import { adminEmail } from '@/lib/session'
import { getSupabaseAdmin } from '@/lib/supabase'
import { completeTask } from '@/lib/crm'

export const dynamic = 'force-dynamic'

/* GET — cross-contact task board (?status=open|done, &owner, &overdue=1). */
export async function GET(req: NextRequest) {
  if (!adminEmail(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const sp = new URL(req.url).searchParams
  let q = getSupabaseAdmin().from('crm_tasks')
    .select('*, contact:crm_contacts(id,name,email)')
    .order('due_date', { ascending: true, nullsFirst: false }).limit(500)
  const status = sp.get('status')
  if (status) q = q.eq('status', status)
  if (sp.get('owner')) q = q.eq('owner', sp.get('owner'))
  if (sp.get('overdue') === '1') q = q.lt('due_date', new Date().toISOString().slice(0, 10)).neq('status', 'done')
  const { data } = await q
  return NextResponse.json({ tasks: data || [] })
}

/* PATCH — complete a task ({ task_id }). */
export async function PATCH(req: NextRequest) {
  const actor = adminEmail(req)
  if (!actor) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const b = await req.json().catch(() => ({}))
  const taskId = String(b?.task_id || '')
  if (!taskId) return NextResponse.json({ error: 'task_id required.' }, { status: 400 })
  const task = await completeTask(taskId, actor)
  return NextResponse.json({ ok: true, task })
}
