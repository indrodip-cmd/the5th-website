import { NextRequest, NextResponse } from 'next/server'
import { adminEmail } from '@/lib/session'
import { sanitizeText } from '@/lib/validation'
import { getSupabaseAdmin } from '@/lib/supabase'
import { addNote, editNote } from '@/lib/crm'

export const dynamic = 'force-dynamic'

/* GET — notes for a contact (newest / pinned first). */
export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  if (!adminEmail(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await ctx.params
  const { data } = await getSupabaseAdmin().from('crm_notes')
    .select('*').eq('contact_id', id).is('deleted_at', null)
    .order('pinned', { ascending: false }).order('created_at', { ascending: false })
  return NextResponse.json({ notes: data || [] })
}

/* POST — add a note. */
export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const actor = adminEmail(req)
  if (!actor) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await ctx.params
  const b = await req.json().catch(() => ({}))
  const body = sanitizeText(b?.body, 8000)
  if (!body) return NextResponse.json({ error: 'Note body required.' }, { status: 400 })
  const note = await addNote(id, body, { author: actor, pinned: !!b?.pinned, private: !!b?.private })
  return NextResponse.json({ ok: true, note })
}

/* PATCH — edit a note (keeps version history) or toggle pin. */
export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const actor = adminEmail(req)
  if (!actor) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  await ctx.params
  const b = await req.json().catch(() => ({}))
  const noteId = String(b?.note_id || '')
  if (!noteId) return NextResponse.json({ error: 'note_id required.' }, { status: 400 })
  if (typeof b?.pinned === 'boolean') {
    await getSupabaseAdmin().from('crm_notes').update({ pinned: b.pinned }).eq('id', noteId)
  }
  if (typeof b?.body === 'string') {
    const note = await editNote(noteId, sanitizeText(b.body, 8000), actor)
    return NextResponse.json({ ok: true, note })
  }
  return NextResponse.json({ ok: true })
}

/* DELETE ?note_id= — soft delete a note. */
export async function DELETE(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  if (!adminEmail(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  await ctx.params
  const noteId = new URL(req.url).searchParams.get('note_id')
  if (!noteId) return NextResponse.json({ error: 'note_id required.' }, { status: 400 })
  await getSupabaseAdmin().from('crm_notes').update({ deleted_at: new Date().toISOString() }).eq('id', noteId)
  return NextResponse.json({ ok: true })
}
