import { NextRequest, NextResponse } from 'next/server'
import { adminEmail } from '@/lib/session'
import { sanitizeText } from '@/lib/validation'
import { getSupabaseAdmin } from '@/lib/supabase'
import { setBusinessProfile } from '@/lib/crm'

export const dynamic = 'force-dynamic'

/* GET — the contact's business profile (or null). */
export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  if (!adminEmail(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await ctx.params
  const { data } = await getSupabaseAdmin().from('crm_business_profiles').select('*').eq('contact_id', id).maybeSingle()
  return NextResponse.json({ business: data || null })
}

/* PUT — create/update the business profile. */
export async function PUT(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const actor = adminEmail(req)
  if (!actor) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await ctx.params
  const b = await req.json().catch(() => ({}))
  const patch: Record<string, unknown> = {}
  const strFields: Array<[string, number]> = [
    ['business_name', 160], ['personal_brand_name', 160], ['website', 300], ['industry', 120],
    ['business_model', 120], ['years_in_business', 40], ['revenue_range', 60], ['team_size', 40],
    ['target_audience', 400], ['primary_offer', 400], ['main_goal', 400], ['biggest_challenge', 400], ['notes', 4000],
  ]
  for (const [f, max] of strFields) if (typeof b[f] === 'string') patch[f] = sanitizeText(b[f], max) || null
  if (Array.isArray(b?.marketing_channels)) patch.marketing_channels = b.marketing_channels.map((c: unknown) => sanitizeText(c, 60)).filter(Boolean)
  const business = await setBusinessProfile(id, patch, actor)
  return NextResponse.json({ ok: true, business })
}
