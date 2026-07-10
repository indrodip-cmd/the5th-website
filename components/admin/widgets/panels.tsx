'use client'
/* Panel widgets — richer cards. Most read the shared WidgetDataProvider; a few
   fetch their own slice. Each registers itself. */
import Link from 'next/link'
import { registerWidget, useWidgetData } from './registry'
import { WidgetTitle, ListRow, Empty, NotConnected } from './shared'
import { T, money, fmtDate, useAdminFetch, Avatar } from '../ui'

type Row = Record<string, unknown>
const arr = (o: Row | null, k: string): Row[] => (Array.isArray((o || {})[k]) ? ((o || {})[k] as Row[]) : [])

// ── Live Activity Feed ──
function ActivityFeed() {
  const d = useWidgetData()
  const items = d.activity?.items || []
  return (
    <>
      <WidgetTitle title="Live activity" />
      {items.length === 0 ? <Empty label={d.loading ? 'Loading…' : 'No recent activity'} /> : (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {items.slice(0, 12).map((it) => (
            <ListRow key={it.id as string} icon={it.icon as string} title={it.title as string} sub={it.detail as string} meta={timeAgo(it.at as string)} href={it.href as string | undefined} />
          ))}
        </div>
      )}
    </>
  )
}
registerWidget({ id: 'activity-feed', title: 'Live activity', category: 'ops', defaultW: 2, defaultH: 'lg', Component: ActivityFeed })

// ── Revenue snapshot ──
function RevenueSnapshot() {
  const d = useWidgetData()
  const s = (d.revenue?.summary as Row) || {}
  const products = ((s.topProducts as Row[]) || [])
  return (
    <>
      <WidgetTitle title="Revenue" action={<Link href="/admin/revenue" style={{ fontSize: 12, color: T.green, textDecoration: 'none' }}>Open →</Link>} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
        {[['Today', s.today], ['This week', s.week], ['This month', s.month], ['Lifetime', s.lifetime]].map(([l, v]) => (
          <div key={l as string}><div style={{ fontSize: 18, fontWeight: 800, color: T.ink }}>{money(Number(v || 0))}</div><div style={{ fontSize: 11.5, color: T.sub }}>{l as string}</div></div>
        ))}
      </div>
      {products.length > 0 ? products.slice(0, 4).map((p) => <ListRow key={p.product as string} title={p.product as string} meta={money(Number(p.revenue || 0))} />) : <Empty label="No sales yet — connect Whop" />}
    </>
  )
}
registerWidget({ id: 'revenue-center', title: 'Revenue', category: 'revenue', defaultW: 2, defaultH: 'md', Component: RevenueSnapshot })

// ── Balances (all currencies) ──
function Balances() {
  const d = useWidgetData()
  const balances = ((d.revenue?.balances as Row[]) || [])
  const currencies = balances.filter((b) => b.currency !== 'TREASURY')
  const treasury = balances.find((b) => b.currency === 'TREASURY')
  return (
    <>
      <WidgetTitle title="Balances" action={<Link href="/admin/revenue" style={{ fontSize: 12, color: T.green, textDecoration: 'none' }}>Revenue →</Link>} />
      {currencies.length === 0 ? <NotConnected label="Whop" /> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {currencies.map((b) => (
            <div key={b.currency as string} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '7px 0', borderBottom: '1px solid #f4f5f4' }}>
              <span style={{ fontSize: 12.5, color: T.sub, textTransform: 'uppercase', letterSpacing: '.04em' }}>{b.currency as string}</span>
              <span style={{ fontSize: 18, fontWeight: 800, color: T.ink }}>{money(Number(b.available || 0), b.currency as string)}</span>
            </div>
          ))}
          {treasury && <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', paddingTop: 8 }}><span style={{ fontSize: 12, color: T.muted }}>Combined (USD)</span><span style={{ fontSize: 14, fontWeight: 700, color: T.green }}>{money(Number(treasury.available || 0), 'USD')}</span></div>}
        </div>
      )}
    </>
  )
}
registerWidget({ id: 'balances', title: 'Balances', category: 'revenue', defaultW: 1, defaultH: 'md', Component: Balances })

// ── Upcoming meetings ──
function UpcomingMeetings() {
  const d = useWidgetData()
  const items = arr(d.dashboard, 'upcomingMeetings')
  return (
    <>
      <WidgetTitle title="Upcoming meetings" action={<Link href="/admin/crm/meetings" style={{ fontSize: 12, color: T.green, textDecoration: 'none' }}>All →</Link>} />
      {items.length === 0 ? <Empty label="Nothing scheduled" /> : items.map((m) => {
        const c = (m.contact as Row) || {}
        return <ListRow key={m.id as string} icon="📅" title={(m.title as string) || 'Meeting'} sub={(c.name as string) || (c.email as string)} meta={m.starts_at ? new Date(m.starts_at as string).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) : ''} href={`/admin/crm/meetings/${m.id}`} />
      })}
    </>
  )
}
registerWidget({ id: 'upcoming-meetings', title: 'Upcoming meetings', category: 'meetings', defaultW: 2, defaultH: 'md', Component: UpcomingMeetings })

// ── Hot leads ──
function HotLeads() {
  const d = useWidgetData()
  const items = arr(d.dashboard, 'hotLeads')
  return (
    <>
      <WidgetTitle title="Hot leads" action={<Link href="/admin/crm?minScore=50" style={{ fontSize: 12, color: T.green, textDecoration: 'none' }}>All →</Link>} />
      {items.length === 0 ? <Empty label="No hot leads yet" /> : items.map((c) => (
        <ListRow key={c.id as string} icon={<Avatar name={c.name as string} email={c.email as string} size={22} />} title={(c.name as string) || (c.email as string)} sub={(c.pipeline_stage as string || '').replace(/_/g, ' ')} meta={String(c.lead_score)} href={`/admin/crm/${c.id}`} />
      ))}
    </>
  )
}
registerWidget({ id: 'hot-leads', title: 'Hot leads', category: 'crm', defaultW: 2, defaultH: 'md', Component: HotLeads })

// ── Overdue tasks ──
function OverdueTasks() {
  const d = useWidgetData()
  const items = arr(d.dashboard, 'overdueTasks')
  return (
    <>
      <WidgetTitle title="Overdue tasks" action={<Link href="/admin/crm/tasks" style={{ fontSize: 12, color: T.green, textDecoration: 'none' }}>All →</Link>} />
      {items.length === 0 ? <Empty label="All caught up" /> : items.map((t) => {
        const c = (t.contact as Row) || {}
        return <ListRow key={t.id as string} icon="☐" title={t.title as string} sub={c.name as string} meta={fmtDate(t.due_date as string)} />
      })}
    </>
  )
}
registerWidget({ id: 'overdue-tasks', title: 'Overdue tasks', category: 'crm', defaultW: 2, defaultH: 'md', Component: OverdueTasks })

// ── Recently won ──
function RecentlyWon() {
  const d = useWidgetData()
  const items = arr(d.dashboard, 'recentlyWon')
  return (
    <>
      <WidgetTitle title="Recently won" />
      {items.length === 0 ? <Empty label="No won deals yet" /> : items.map((o) => {
        const c = (o.contact as Row) || {}
        return <ListRow key={o.id as string} icon="🏆" title={(o.name as string) || (c.name as string)} sub={c.name as string} meta={money(Number(o.value || 0))} />
      })}
    </>
  )
}
registerWidget({ id: 'recently-won', title: 'Recently won', category: 'crm', defaultW: 1, defaultH: 'md', Component: RecentlyWon })

// ── Lead sources ──
function LeadSources() {
  const d = useWidgetData()
  const items = arr(d.analytics, 'leadSources')
  return (
    <>
      <WidgetTitle title="Lead sources" />
      {items.length === 0 ? <Empty label="No data yet" /> : items.slice(0, 6).map((s) => <ListRow key={s.source as string} title={(s.source as string) || 'unknown'} meta={String(s.count)} />)}
    </>
  )
}
registerWidget({ id: 'lead-sources', title: 'Lead sources', category: 'analytics', defaultW: 1, defaultH: 'md', Component: LeadSources })

// ── Products sold ──
function Products() {
  const d = useWidgetData()
  const items = arr(d.analytics, 'products')
  return (
    <>
      <WidgetTitle title="Products sold" />
      {items.length === 0 ? <Empty label="No sales yet" /> : items.slice(0, 6).map((p) => <ListRow key={p.product as string} title={p.product as string} sub={`${p.count} sold`} meta={money(Number(p.revenue || 0))} />)}
    </>
  )
}
registerWidget({ id: 'product-analytics', title: 'Product analytics', category: 'product', defaultW: 1, defaultH: 'md', Component: Products })

// ── CRM insights (composite) ──
function CrmInsights() {
  const d = useWidgetData()
  const hot = Number((d.cc || {}).hotLeads || 0)
  const overdue = arr(d.dashboard, 'overdueTasks').length
  const won = arr(d.dashboard, 'recentlyWon').length
  const lost = arr(d.dashboard, 'recentlyLost').length
  return (
    <>
      <WidgetTitle title="CRM insights" />
      <ListRow icon="🔥" title="High-intent leads" meta={String(hot)} href="/admin/crm?minScore=50" />
      <ListRow icon="⏰" title="Tasks needing follow-up" meta={String(overdue)} href="/admin/crm/tasks" />
      <ListRow icon="🏆" title="Recently won" meta={String(won)} />
      <ListRow icon="🚫" title="Recently lost" meta={String(lost)} />
    </>
  )
}
registerWidget({ id: 'crm-insights', title: 'CRM insights', category: 'crm', defaultW: 1, defaultH: 'md', Component: CrmInsights })

// ── AI performance ──
function AIPerformance() {
  const d = useWidgetData()
  const conv = Number((d.cc || {}).aiConversationsToday || 0)
  const booked = Number((d.cc || {}).callsToday || 0)
  return (
    <>
      <WidgetTitle title="AI performance" />
      <ListRow icon="🤖" title="AI conversations today" meta={String(conv)} />
      <ListRow icon="📅" title="Calls booked today" meta={String(booked)} />
      <ListRow icon="💬" title="Concierge" meta="Live" />
    </>
  )
}
registerWidget({ id: 'ai-performance', title: 'AI performance', category: 'ai', defaultW: 1, defaultH: 'md', Component: AIPerformance })

// ── Content performance (own fetch) ──
function ContentPerformance() {
  const { data } = useAdminFetch<{ stats: Row[] }>('/api/admin/crm/content-stats')
  const items = (data?.stats || []).slice(0, 6)
  return (
    <>
      <WidgetTitle title="Content performance" action={<Link href="/admin/cms" style={{ fontSize: 12, color: T.green, textDecoration: 'none' }}>CMS →</Link>} />
      {items.length === 0 ? <Empty label="No content views yet" /> : items.map((s) => {
        const c = (s.content as Row) || {}
        return <ListRow key={s.content_id as string} title={(c.title as string) || (c.slug as string) || 'Untitled'} sub={c.type as string} meta={`${s.views} views`} />
      })}
    </>
  )
}
registerWidget({ id: 'content-performance', title: 'Content performance', category: 'content', defaultW: 2, defaultH: 'md', Component: ContentPerformance })

// ── Marketing (not-connected honest state) ──
function Marketing() {
  const { data } = useAdminFetch<{ integrations: Row[] }>('/api/admin/integrations')
  const ints = data?.integrations || []
  const connected = ints.filter((i) => i.category === 'marketing' && i.status === 'connected')
  return (
    <>
      <WidgetTitle title="Marketing" action={<Link href="/admin/integrations" style={{ fontSize: 12, color: T.green, textDecoration: 'none' }}>Manage →</Link>} />
      {connected.length === 0 ? <NotConnected label="Meta / Google Ads" /> : connected.map((i) => <ListRow key={i.provider as string} title={i.label as string} meta="Connected" />)}
    </>
  )
}
registerWidget({ id: 'marketing', title: 'Marketing', category: 'marketing', defaultW: 1, defaultH: 'md', Component: Marketing })

// ── Website analytics status ──
function WebsiteAnalytics() {
  const { data } = useAdminFetch<{ integrations: Row[] }>('/api/admin/integrations')
  const ints = (data?.integrations || []).filter((i) => ['clarity', 'ga4', 'gsc'].includes(i.provider as string))
  return (
    <>
      <WidgetTitle title="Website analytics" action={<Link href="/admin/integrations" style={{ fontSize: 12, color: T.green, textDecoration: 'none' }}>Manage →</Link>} />
      {ints.length === 0 ? <NotConnected label="Analytics" /> : ints.map((i) => (
        <ListRow key={i.provider as string} title={i.label as string} meta={i.status === 'connected' ? 'Connected' : 'Not connected'} />
      ))}
    </>
  )
}
registerWidget({ id: 'website-analytics', title: 'Website analytics', category: 'analytics', defaultW: 1, defaultH: 'md', Component: WebsiteAnalytics })

function timeAgo(iso: string): string {
  if (!iso) return ''
  const s = Math.floor((Date.now() - +new Date(iso)) / 1000)
  if (s < 60) return 'now'
  if (s < 3600) return `${Math.floor(s / 60)}m`
  if (s < 86400) return `${Math.floor(s / 3600)}h`
  return `${Math.floor(s / 86400)}d`
}
