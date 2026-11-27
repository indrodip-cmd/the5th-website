import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { OPT_BY_ID } from '@/lib/site-opt/registry'

export const dynamic = 'force-dynamic'

/* Public: the copy overrides a human has APPROVED. Only registered elements, text only, short. */
export async function GET() {
  const out: Record<string, string> = {}
  try {
    const { data } = await getSupabaseAdmin().from('site_proposals').select('element_id,proposed_text,decided_at').eq('status', 'approved').order('decided_at', { ascending: true })
    for (const r of data || []) {
      const id = String(r.element_id), t = String(r.proposed_text || '').replace(/[<>]/g, '').slice(0, 90)
      if (OPT_BY_ID.has(id) && t) out[id] = t
    }
  } catch { /* fail-soft: no overrides */ }
  return NextResponse.json(out, { headers: { 'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=600' } })
}
