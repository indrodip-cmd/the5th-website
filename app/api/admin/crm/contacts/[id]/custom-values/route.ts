import { NextRequest, NextResponse } from 'next/server'
import { adminEmail } from '@/lib/session'
import { getSupabaseAdmin } from '@/lib/supabase'
import { setCustomValue } from '@/lib/crm'

export const dynamic = 'force-dynamic'

/* GET — custom field values for a contact, joined with their definitions. */
export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  if (!adminEmail(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await ctx.params
  const { data } = await getSupabaseAdmin().from('crm_custom_values')
    .select('*, field:crm_custom_fields(*)').eq('contact_id', id)
  return NextResponse.json({ values: data || [] })
}

/* PUT — set a custom value ({ field_id, value }). */
export async function PUT(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  if (!adminEmail(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await ctx.params
  const b = await req.json().catch(() => ({}))
  const fieldId = String(b?.field_id || '')
  if (!fieldId) return NextResponse.json({ error: 'field_id required.' }, { status: 400 })
  const value = await setCustomValue(id, fieldId, b?.value ?? null)
  return NextResponse.json({ ok: true, value })
}
