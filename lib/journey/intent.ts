/* Customer Journey Intelligence (3I.8B.1) — resolves a contact's full behavioral
   footprint (web events, comms, meetings, revenue) into live intent scores,
   a segment, lifecycle, confidence estimates and a next-best-action. Rule-based
   (no AI cost) so it can power dashboards and ground Command AI. */
import { getSupabaseAdmin } from '@/lib/supabase'

type Row = Record<string, unknown>
const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)))

async function visitorIds(contactId: string): Promise<string[]> {
  const { data } = await getSupabaseAdmin().from('crm_visitors').select('visitor_id').eq('contact_id', contactId).limit(20)
  return (data || []).map((v) => v.visitor_id as string)
}

export async function computeJourney(contactId: string): Promise<Row | null> {
  const db = getSupabaseAdmin()
  const { data: c } = await db.from('crm_contacts').select('id,name,email,pipeline_stage,lifecycle_stage,lead_score,revenue,ltv,call_booked,created_at,last_activity_at').eq('id', contactId).maybeSingle()
  if (!c) return null
  const vids = await visitorIds(contactId)
  let events: Row[] = []
  if (vids.length) { const { data } = await db.from('analytics_events').select('event_type,path,scroll_pct,created_at').in('visitor_id', vids).order('created_at', { ascending: false }).limit(500); events = data || [] }
  const [{ data: comms }, { data: meetings }] = await Promise.all([
    db.from('comm_messages').select('direction,status,opened_at,clicked_at,created_at').eq('contact_id', contactId).limit(200),
    db.from('crm_meetings').select('status').eq('contact_id', contactId).limit(50),
  ])

  const is = (t: string) => events.filter((e) => e.event_type === t).length
  const pageviews = is('pageview')
  const sessions = new Set(events.map((e) => String(e.created_at || '').slice(0, 10))).size
  const pricingViews = is('pricing_view') + events.filter((e) => /pric|fast-forward|\/ai|collective|call/.test(String(e.path || ''))).length
  const scrollDeep = events.filter((e) => Number(e.scroll_pct) >= 75).length
  const videoComplete = is('video_complete') > 0, videoStart = is('video_start') > 0
  const quizComplete = is('quiz_complete') > 0
  const opens = (comms || []).filter((m) => m.opened_at || ['opened', 'clicked'].includes(m.status as string)).length
  const clicks = (comms || []).filter((m) => m.clicked_at || m.status === 'clicked').length
  const replies = (comms || []).filter((m) => m.direction === 'inbound').length
  const attended = (meetings || []).filter((m) => m.status === 'completed').length
  const booked = !!c.call_booked || (meetings || []).length > 0
  const revenue = Number(c.revenue || 0), ltv = Number(c.ltv || 0)
  const score = Number(c.lead_score || 0)

  const engagement = clamp(pageviews * 3 + scrollDeep * 5 + opens * 4 + clicks * 9 + sessions * 6 + (quizComplete ? 12 : 0))
  const buying_intent = clamp(pricingViews * 10 + (videoComplete ? 22 : videoStart ? 8 : 0) + clicks * 8 + (booked ? 25 : 0) + Math.min(28, score / 2))
  const trust = clamp(attended * 22 + replies * 12 + sessions * 5 + (quizComplete ? 10 : 0) + (revenue > 0 ? 30 : 0))
  const readiness = clamp(buying_intent * 0.5 + (booked ? 38 : 0) + (['proposal', 'won', 'call_completed'].includes(String(c.pipeline_stage)) ? 28 : 0))
  const health = clamp(revenue > 0 ? (60 + trust * 0.4 - staleDays(c.last_activity_at) * 1.5) : engagement)

  let segment = 'Cold Visitor'
  if (revenue > 0) segment = staleDays(c.last_activity_at) > 60 ? 'At Risk' : 'Customer'
  else if (booked) segment = 'Ready to Buy'
  else if (buying_intent >= 60) segment = 'High Intent'
  else if (engagement >= 40) segment = 'Warm Lead'
  else if (events.length > 3 || opens > 0) segment = 'Researching'

  const lifecycle = revenue > 0 ? 'Customer' : booked ? 'Sales Opportunity' : score >= 50 ? 'Lead' : events.length ? 'Returning Visitor' : 'Anonymous Visitor'
  const signals: string[] = []
  if (pricingViews >= 2) signals.push('Viewed pricing/offer pages repeatedly (buying signal)')
  if (videoComplete) signals.push('Watched a VSL to completion')
  else if (videoStart) signals.push('Started but did not finish the VSL')
  if (scrollDeep >= 3) signals.push('Reads deeply (high scroll depth)')
  if (clicks >= 2) signals.push('Clicks through emails (engaged)')
  if (replies >= 1) signals.push('Replies to messages (warm)')
  if (sessions >= 3) signals.push('Returning visitor (multiple sessions)')
  if (opens === 0 && (comms || []).length >= 3) signals.push('Not opening emails (cooling / deliverability)')
  if (segment === 'At Risk') signals.push('Customer inactive 60+ days')

  const nba = revenue > 0 ? (segment === 'At Risk' ? 'Personal check-in — win-back before churn' : 'Offer next step (Collective / renewal / upsell)')
    : booked ? 'Prep the strategy call; send a reminder'
      : buying_intent >= 60 ? 'Invite to book a strategy call now'
        : engagement >= 40 ? 'Send a case study, then the quiz/VSL' : 'Nurture: educational email + retargeting'

  return {
    contact: { id: c.id, name: c.name, email: c.email }, segment, lifecycle,
    scores: { buying_intent, engagement, trust, readiness, health },
    confidence: { book_call: clamp(readiness * 0.9), buy_fast_forward: clamp(buying_intent * 0.7), needs_education: clamp(100 - readiness) },
    signals, next_best_action: nba,
    counts: { events: events.length, pageviews, sessions, pricing_views: pricingViews, email_opens: opens, email_clicks: clicks, replies, meetings_attended: attended, revenue, ltv },
  }
}
function staleDays(d: unknown): number { if (!d) return 999; return Math.floor((Date.now() - new Date(d as string).getTime()) / 86400000) }

/* Unified chronological journey (web + comms + CRM + meetings). */
export async function journeyTimeline(contactId: string): Promise<Row[]> {
  const db = getSupabaseAdmin()
  const vids = await visitorIds(contactId)
  const [ev, comms, acts] = await Promise.all([
    vids.length ? db.from('analytics_events').select('event_type,path,created_at').in('visitor_id', vids).order('created_at', { ascending: false }).limit(60) : Promise.resolve({ data: [] }),
    db.from('comm_messages').select('channel,direction,subject,status,created_at').eq('contact_id', contactId).order('created_at', { ascending: false }).limit(40),
    db.from('crm_activities').select('type,title,created_at').eq('contact_id', contactId).order('created_at', { ascending: false }).limit(40),
  ])
  const items: Row[] = []
  for (const e of (ev.data || []) as Row[]) items.push({ ts: e.created_at, kind: 'web', label: `${e.event_type}${e.path ? ` · ${e.path}` : ''}` })
  for (const m of (comms.data || []) as Row[]) items.push({ ts: m.created_at, kind: m.direction === 'inbound' ? 'reply' : 'comm', label: `${m.channel} ${m.direction === 'inbound' ? 'received' : m.status}${m.subject ? ` · ${m.subject}` : ''}` })
  for (const a of (acts.data || []) as Row[]) items.push({ ts: a.created_at, kind: 'crm', label: `${a.type} · ${a.title}` })
  return items.sort((x, y) => String(y.ts).localeCompare(String(x.ts))).slice(0, 80)
}

/* Live visitors — recent web activity (last 45 min), linked to contacts. */
export async function liveVisitors(): Promise<Row[]> {
  const db = getSupabaseAdmin()
  const since = new Date(Date.now() - 45 * 60000).toISOString()
  const { data } = await db.from('analytics_events').select('visitor_id,event_type,path,country,city,created_at').gte('created_at', since).order('created_at', { ascending: false }).limit(400)
  const byV = new Map<string, Row>()
  for (const e of (data || []) as Row[]) {
    const v = e.visitor_id as string; if (!v) continue
    if (!byV.has(v)) byV.set(v, { visitor_id: v, last_path: e.path, country: e.country, city: e.city, last_seen: e.created_at, events: 0 })
    ;(byV.get(v)!.events as number) = (byV.get(v)!.events as number) + 1
  }
  const list = [...byV.values()]
  const vids = list.map((l) => l.visitor_id as string)
  if (vids.length) {
    const { data: linked } = await db.from('crm_visitors').select('visitor_id,contact_id,contact:crm_contacts(name,email)').in('visitor_id', vids)
    const map = new Map((linked || []).map((l) => [l.visitor_id as string, l]))
    for (const l of list) { const m = map.get(l.visitor_id as string) as Row | undefined; if (m?.contact) l.contact = m.contact }
  }
  return list.sort((a, b) => String(b.last_seen).localeCompare(String(a.last_seen)))
}
