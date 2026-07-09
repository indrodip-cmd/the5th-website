import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { adminEmail } from '@/lib/session'
import { embeddingProvider } from '@/lib/embeddings'

export const dynamic = 'force-dynamic'

/* Business-intelligence aggregation for the Admin dashboard. Pulls from the
   data the platform already logs (events, sessions, leads, activities, CMS). */
export async function GET(req: NextRequest) {
  if (!adminEmail(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const db = getSupabaseAdmin()
  const since = new Date(Date.now() - 30 * 86400000).toISOString()

  const [leadsRes, eventsRes, sessRes, actRes, contentRes, chunkRes, embRes] = await Promise.all([
    db.from('carolina_leads').select('pipeline_stage,lead_score,call_booked,created_at'),
    db.from('carolina_events').select('intent,latency_ms,booked,created_at').gte('created_at', since),
    db.from('carolina_sessions').select('conversation_id', { count: 'exact', head: true }),
    db.from('crm_activities').select('type,title,detail,contact_email,created_at').order('created_at', { ascending: false }).limit(20),
    db.from('cms_content').select('status', { count: 'exact' }),
    db.from('cms_chunks').select('id', { count: 'exact', head: true }),
    db.from('cms_chunks').select('id', { count: 'exact', head: true }).not('embedding', 'is', null),
  ])

  const leads = leadsRes.data || []
  const events = eventsRes.data || []

  // Pipeline distribution
  const pipeline: Record<string, number> = {}
  for (const l of leads) pipeline[l.pipeline_stage || 'new'] = (pipeline[l.pipeline_stage || 'new'] || 0) + 1

  // Intent distribution + AI latency
  const intents: Record<string, number> = {}
  let latSum = 0, latN = 0
  for (const e of events) {
    intents[e.intent || 'general'] = (intents[e.intent || 'general'] || 0) + 1
    if (e.latency_ms) { latSum += e.latency_ms; latN++ }
  }
  const topIntents = Object.entries(intents).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([intent, count]) => ({ intent, count }))

  const conversations = sessRes.count || 0
  const contacts = leads.length
  const booked = leads.filter((l) => l.call_booked).length
  const highIntent = leads.filter((l) => (l.lead_score || 0) >= 8).length
  const customers = leads.filter((l) => l.pipeline_stage === 'won' || l.pipeline_stage === 'customer').length
  const qualified = leads.filter((l) => (l.lead_score || 0) >= 4).length

  const contentStatuses = (contentRes.data || []) as Array<{ status: string }>
  const published = contentStatuses.filter((c) => c.status === 'published').length

  return NextResponse.json({
    kpis: { conversations, contacts, booked, highIntent, customers, avgLatencyMs: latN ? Math.round(latSum / latN) : 0, turns: events.length },
    funnel: [
      { label: 'Conversations', value: conversations },
      { label: 'Leads captured', value: contacts },
      { label: 'Qualified', value: qualified },
      { label: 'Calls booked', value: booked },
      { label: 'Customers', value: customers },
    ],
    pipeline: Object.entries(pipeline).map(([stage, count]) => ({ stage, count })),
    intents: topIntents,
    knowledge: {
      content: contentRes.count || 0,
      published,
      chunks: chunkRes.count || 0,
      embedded: embRes.count || 0,
      provider: embeddingProvider() || 'none',
    },
    recent: actRes.data || [],
  })
}
