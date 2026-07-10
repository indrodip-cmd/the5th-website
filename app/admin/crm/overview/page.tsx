'use client'
/* CRM · Overview — the sales dashboard: leads, calls, pipeline value, meetings,
   overdue tasks, recently won/lost, hot leads. */
import Link from 'next/link'
import { T, Card, Avatar, EmptyState, PageHeader, useAdminFetch, money, fmtDate, leadBand, bandColor } from '@/components/admin/ui'

type Row = Record<string, unknown>
interface Dash {
  newLeads: number; callsToday: number; callsThisWeek: number; pipelineValue: number; openCount: number
  upcomingMeetings: Row[]; overdueTasks: Row[]; recentlyWon: Row[]; recentlyLost: Row[]; hotLeads: Row[]
}

export default function CrmOverview() {
  const { data, loading } = useAdminFetch<Dash>('/api/admin/crm/dashboard')
  if (loading && !data) return <><PageHeader title="CRM Overview" /><div style={{ display: 'flex', gap: 16 }}>{Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton" style={{ height: 96, flex: 1, borderRadius: 14 }} />)}</div></>
  const d = data!

  return (
    <>
      <PageHeader title="CRM Overview" subtitle="Your sales workspace at a glance" />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 16, marginBottom: 20 }}>
        <Metric label="New leads · 7d" value={String(d.newLeads)} />
        <Metric label="Calls today" value={String(d.callsToday)} />
        <Metric label="Calls this week" value={String(d.callsThisWeek)} />
        <Metric label="Open pipeline" value={money(d.pipelineValue)} hint={`${d.openCount} opportunities`} accent />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(320px,1fr))', gap: 18 }}>
        <Panel title="Upcoming meetings" href="/admin/crm/meetings">
          {d.upcomingMeetings.length === 0 ? <EmptyState title="Nothing scheduled" /> : d.upcomingMeetings.map((m) => {
            const c = (m.contact as Row) || {}
            return (
              <Link key={m.id as string} href={`/admin/crm/meetings/${m.id}`} style={rowLink}>
                <Avatar name={c.name as string} email={c.email as string} size={30} />
                <div style={{ flex: 1, minWidth: 0 }}><div style={rowTitle}>{(m.title as string) || 'Meeting'}</div><div style={rowSub}>{(c.name as string) || (c.email as string)}</div></div>
                <span style={rowMeta}>{m.starts_at ? new Date(m.starts_at as string).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) : ''}</span>
              </Link>
            )
          })}
        </Panel>

        <Panel title="Overdue tasks" href="/admin/crm/tasks">
          {d.overdueTasks.length === 0 ? <EmptyState title="All caught up" /> : d.overdueTasks.map((t) => {
            const c = (t.contact as Row) || {}
            return (
              <div key={t.id as string} style={rowLink}>
                <span style={{ color: T.danger }}>☐</span>
                <div style={{ flex: 1, minWidth: 0 }}><div style={rowTitle}>{t.title as string}</div><div style={rowSub}>{c.name as string}</div></div>
                <span style={{ ...rowMeta, color: T.danger }}>{fmtDate(t.due_date as string)}</span>
              </div>
            )
          })}
        </Panel>

        <Panel title="Hot leads" href="/admin/crm?minScore=50">
          {d.hotLeads.length === 0 ? <EmptyState title="No hot leads yet" /> : d.hotLeads.map((c) => {
            const b = leadBand(Number(c.lead_score || 0))
            return (
              <Link key={c.id as string} href={`/admin/crm/${c.id}`} style={rowLink}>
                <Avatar name={c.name as string} email={c.email as string} size={30} />
                <div style={{ flex: 1, minWidth: 0 }}><div style={rowTitle}>{(c.name as string) || (c.email as string)}</div><div style={rowSub}>{(c.pipeline_stage as string || '').replace(/_/g, ' ')}</div></div>
                <span className="a-pill" style={{ background: bandColor(b) + '1a', color: bandColor(b) }}>{c.lead_score as number}</span>
              </Link>
            )
          })}
        </Panel>

        <Panel title="Recently won" href="/admin/crm/pipeline">
          {d.recentlyWon.length === 0 ? <EmptyState title="No won deals yet" /> : d.recentlyWon.map((o) => {
            const c = (o.contact as Row) || {}
            return (
              <div key={o.id as string} style={rowLink}>
                <span>🏆</span>
                <div style={{ flex: 1, minWidth: 0 }}><div style={rowTitle}>{(o.name as string) || (c.name as string)}</div><div style={rowSub}>{c.name as string}</div></div>
                <span style={{ ...rowMeta, color: T.green, fontWeight: 700 }}>{money(Number(o.value || 0))}</span>
              </div>
            )
          })}
        </Panel>
      </div>
    </>
  )
}

function Metric({ label, value, hint, accent }: { label: string; value: string; hint?: string; accent?: boolean }) {
  return (
    <div className="a-card" style={{ padding: '20px 22px', background: accent ? `linear-gradient(135deg,${T.ink},${T.green})` : '#fff' }}>
      <div style={{ fontSize: 28, fontWeight: 800, color: accent ? '#fff' : T.ink }}>{value}</div>
      <div style={{ fontSize: 13, color: accent ? 'rgba(255,255,255,0.75)' : T.sub, marginTop: 6 }}>{label}</div>
      {hint && <div style={{ fontSize: 11, color: accent ? 'rgba(255,255,255,0.55)' : T.muted, marginTop: 2 }}>{hint}</div>}
    </div>
  )
}
function Panel({ title, href, children }: { title: string; href: string; children: React.ReactNode }) {
  return (
    <Card>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, color: T.ink }}>{title}</h3>
        <Link href={href} style={{ fontSize: 12, color: T.green, textDecoration: 'none' }}>View all →</Link>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>{children}</div>
    </Card>
  )
}
const rowLink: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', textDecoration: 'none', borderBottom: '1px solid #f4f5f4' }
const rowTitle: React.CSSProperties = { fontSize: 13.5, fontWeight: 600, color: T.ink, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }
const rowSub: React.CSSProperties = { fontSize: 12, color: T.sub }
const rowMeta: React.CSSProperties = { fontSize: 12, color: T.muted, whiteSpace: 'nowrap' }
