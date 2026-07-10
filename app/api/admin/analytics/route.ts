import { NextRequest, NextResponse } from 'next/server'
import { adminEmail } from '@/lib/session'
import { getSupabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

type Row = Record<string, unknown>

/* Executive analytics: revenue, pipeline, conversion, lead sources, meeting
   close rate, products sold, traffic sources, AI-chat + booking conversion. */
export async function GET(req: NextRequest) {
  if (!adminEmail(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const db = getSupabaseAdmin()

  const [contacts, openOpps, wonOpps, meetings, purchases, webSources] = await Promise.all([
    db.from('crm_contacts').select('id,source,call_booked,created_at', { count: 'exact' }).is('deleted_at', null),
    db.from('crm_opportunities').select('value').eq('status', 'open').is('deleted_at', null),
    db.from('crm_opportunities').select('value,closed_at').eq('status', 'won').is('deleted_at', null),
    db.from('crm_meetings').select('status').is('deleted_at', null),
    db.from('crm_purchases').select('product,amount,status').eq('status', 'paid').is('deleted_at', null),
    db.from('crm_visitors').select('first_source,contact_id'),
  ])

  const contactRows = (contacts.data || []) as Row[]
  const totalContacts = contacts.count || 0
  const booked = contactRows.filter((c) => c.call_booked).length
  const pipelineValue = (openOpps.data || []).reduce((s, o) => s + Number(o.value || 0), 0)
  const revenue = (wonOpps.data || []).reduce((s, o) => s + Number(o.value || 0), 0)
  const purchaseRevenue = (purchases.data || []).reduce((s, p) => s + Number(p.amount || 0), 0)

  // lead sources
  const sources = new Map<string, number>()
  for (const c of contactRows) { const s = (c.source as string) || 'unknown'; sources.set(s, (sources.get(s) || 0) + 1) }

  // traffic sources (first-touch from visitors)
  const traffic = new Map<string, number>()
  for (const v of (webSources.data || []) as Row[]) { const s = (v.first_source as string) || 'direct'; traffic.set(s, (traffic.get(s) || 0) + 1) }

  const mRows = (meetings.data || []) as Row[]
  const completed = mRows.filter((m) => m.status === 'completed').length
  const meetingCloseRate = mRows.length ? Math.round((completed / mRows.length) * 100) : 0

  // products sold
  const products = new Map<string, { count: number; revenue: number }>()
  for (const p of (purchases.data || []) as Row[]) {
    const k = (p.product as string) || 'unknown'
    const cur = products.get(k) || { count: 0, revenue: 0 }
    cur.count++; cur.revenue += Number(p.amount || 0); products.set(k, cur)
  }

  return NextResponse.json({
    totalContacts, pipelineValue, revenue, purchaseRevenue,
    conversionRate: totalContacts ? Math.round((booked / totalContacts) * 100) : 0,
    bookedCount: booked, meetingCloseRate,
    leadSources: [...sources].map(([source, count]) => ({ source, count })).sort((a, b) => b.count - a.count).slice(0, 8),
    trafficSources: [...traffic].map(([source, count]) => ({ source, count })).sort((a, b) => b.count - a.count).slice(0, 8),
    products: [...products].map(([product, v]) => ({ product, ...v })).sort((a, b) => b.revenue - a.revenue).slice(0, 8),
  })
}
