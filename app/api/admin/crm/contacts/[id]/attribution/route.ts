import { NextRequest, NextResponse } from 'next/server'
import { adminEmail } from '@/lib/session'
import { getSupabaseAdmin } from '@/lib/supabase'
import { computeAttribution } from '@/lib/attribution'

export const dynamic = 'force-dynamic'

/* GET — attribution summary (first/last touch, model breakdown, touchpoints)
   plus the contact's anonymous web events (joined via the identity graph). */
export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  if (!adminEmail(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await ctx.params
  const db = getSupabaseAdmin()

  const attribution = await computeAttribution(id)

  // Resolve this contact's visitor ids from the identity graph + crm_visitors.
  const [{ data: ids }, { data: vis }] = await Promise.all([
    db.from('crm_identities').select('value').eq('contact_id', id).eq('kind', 'visitor_id'),
    db.from('crm_visitors').select('visitor_id').eq('contact_id', id),
  ])
  const visitorIds = Array.from(new Set([...(ids || []).map((r) => r.value as string), ...(vis || []).map((r) => r.visitor_id as string)]))

  let webEvents: unknown[] = []
  if (visitorIds.length) {
    const { data } = await db.from('analytics_events')
      .select('event_type,path,referrer,scroll_pct,created_at')
      .in('visitor_id', visitorIds).order('created_at', { ascending: false }).limit(100)
    webEvents = data || []
  }
  return NextResponse.json({ ...attribution, visitorIds, webEvents })
}
