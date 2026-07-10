import { NextRequest, NextResponse } from 'next/server'
import { adminEmail } from '@/lib/session'
import { sanitizeText } from '@/lib/validation'
import { getSupabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

/* GET — this admin's saved dashboards (custom layouts + which is default). */
export async function GET(req: NextRequest) {
  const actor = adminEmail(req)
  if (!actor) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { data } = await getSupabaseAdmin().from('admin_dashboards').select('*').eq('admin_email', actor).order('updated_at', { ascending: false })
  return NextResponse.json({ dashboards: data || [] })
}

/* POST — save/replace a named layout for this admin ({ name, layout, is_default }). */
export async function POST(req: NextRequest) {
  const actor = adminEmail(req)
  if (!actor) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const b = await req.json().catch(() => ({}))
  const name = sanitizeText(b?.name, 60) || 'My dashboard'
  const layout = Array.isArray(b?.layout) ? b.layout : []
  const db = getSupabaseAdmin()
  const { data: existing } = await db.from('admin_dashboards').select('id').eq('admin_email', actor).eq('name', name).maybeSingle()
  let row
  if (existing) {
    ({ data: row } = await db.from('admin_dashboards').update({ layout, is_default: !!b?.is_default }).eq('id', existing.id).select('*').single())
  } else {
    ({ data: row } = await db.from('admin_dashboards').insert({ admin_email: actor, name, layout, is_default: !!b?.is_default }).select('*').single())
  }
  if (b?.is_default && row) await db.from('admin_dashboards').update({ is_default: false }).eq('admin_email', actor).neq('id', row.id)
  return NextResponse.json({ ok: true, dashboard: row })
}

/* DELETE ?id= — remove a saved layout. */
export async function DELETE(req: NextRequest) {
  const actor = adminEmail(req)
  if (!actor) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const id = new URL(req.url).searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id required.' }, { status: 400 })
  await getSupabaseAdmin().from('admin_dashboards').delete().eq('id', id).eq('admin_email', actor)
  return NextResponse.json({ ok: true })
}
