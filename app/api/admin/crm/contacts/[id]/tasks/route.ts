import { NextRequest, NextResponse } from 'next/server'
import { adminEmail } from '@/lib/session'
import { sanitizeText } from '@/lib/validation'
import { getSupabaseAdmin } from '@/lib/supabase'
import { createTask, completeTask } from '@/lib/crm'

export const dynamic = 'force-dynamic'

/* GET — tasks for a contact. */
export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  if (!adminEmail(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await ctx.params
  const { data } = await getSupabaseAdmin().from('crm_tasks')
    .select('*').eq('contact_id', id).order('due_date', { ascending: true, nullsFirst: false })
  return NextResponse.json({ tasks: data || [] })
}

/* POST — create a task for a contact. */
export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const actor = adminEmail(req)
  if (!actor) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await ctx.params
  const b = await req.json().catch(() => ({}))
  const title = sanitizeText(b?.title, 200)
  if (!title) return NextResponse.json({ error: 'Task title required.' }, { status: 400 })
  const task = await createTask({
    contactId: id, title,
    description: sanitizeText(b?.description, 4000) || undefined,
    dueDate: b?.due_date || null,
    priority: sanitizeText(b?.priority, 20) || 'normal',
    owner: sanitizeText(b?.owner, 120) || actor,
    reminderAt: b?.reminder_at || null,
  })
  return NextResponse.json({ ok: true, task })
}

/* PATCH — update or complete a task ({ task_id, status?, ...fields }). */
export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const actor = adminEmail(req)
  if (!actor) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  await ctx.params
  const b = await req.json().catch(() => ({}))
  const taskId = String(b?.task_id || '')
  if (!taskId) return NextResponse.json({ error: 'task_id required.' }, { status: 400 })
  if (b?.status === 'done') {
    const task = await completeTask(taskId, actor)
    return NextResponse.json({ ok: true, task })
  }
  const patch: Record<string, unknown> = {}
  if (typeof b?.title === 'string') patch.title = sanitizeText(b.title, 200)
  if (typeof b?.description === 'string') patch.description = sanitizeText(b.description, 4000)
  if (typeof b?.priority === 'string') patch.priority = sanitizeText(b.priority, 20)
  if (typeof b?.status === 'string') patch.status = sanitizeText(b.status, 20)
  if (typeof b?.owner === 'string') patch.owner = sanitizeText(b.owner, 120)
  if ('due_date' in b) patch.due_date = b.due_date || null
  if ('reminder_at' in b) patch.reminder_at = b.reminder_at || null
  const { data } = await getSupabaseAdmin().from('crm_tasks').update(patch).eq('id', taskId).select('*').single()
  return NextResponse.json({ ok: true, task: data })
}

/* DELETE ?task_id= */
export async function DELETE(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  if (!adminEmail(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  await ctx.params
  const taskId = new URL(req.url).searchParams.get('task_id')
  if (!taskId) return NextResponse.json({ error: 'task_id required.' }, { status: 400 })
  await getSupabaseAdmin().from('crm_tasks').delete().eq('id', taskId)
  return NextResponse.json({ ok: true })
}
