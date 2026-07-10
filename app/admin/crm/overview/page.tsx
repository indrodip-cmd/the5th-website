'use client'
/* CRM · Overview — executive dashboard + smart search + sales widgets. */
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { T, Card, Button, Input, Avatar, EmptyState, PageHeader, useAdminFetch, adminSend, money, fmtDate, leadBand, bandColor } from '@/components/admin/ui'

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
      <SmartSearch />
      <ExecutiveAnalytics />
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

function SmartSearch() {
  const router = useRouter()
  const [q, setQ] = useState('')
  const [busy, setBusy] = useState(false)
  const [res, setRes] = useState<{ filter: Row; contacts: Row[] } | null>(null)
  const run = async () => {
    if (!q.trim()) return
    setBusy(true)
    try { setRes(await adminSend('/api/admin/crm/smart-search', 'POST', { q }) as { filter: Row; contacts: Row[] }) }
    catch (e) { alert(String(e instanceof Error ? e.message : e)) } finally { setBusy(false) }
  }
  return (
    <Card style={{ marginBottom: 18 }}>
      <div style={{ display: 'flex', gap: 10 }}>
        <Input placeholder='Ask in plain English — "people from Facebook in Canada who booked a call"' value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && run()} />
        <Button disabled={busy} onClick={run}>{busy ? 'Searching…' : 'Smart search'}</Button>
      </div>
      {res && (
        <div style={{ marginTop: 14 }}>
          <div style={{ fontSize: 12, color: T.muted, marginBottom: 8 }}>Interpreted as: {Object.keys(res.filter).length ? Object.entries(res.filter).map(([k, v]) => `${k}=${v}`).join(' · ') : 'no filters'} → {res.contacts.length} results</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {res.contacts.slice(0, 12).map((c) => (
              <Link key={c.id as string} href={`/admin/crm/${c.id}`} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 0', textDecoration: 'none', borderBottom: '1px solid #f4f5f4' }}>
                <Avatar name={c.name as string} email={c.email as string} size={28} />
                <span style={{ flex: 1, fontSize: 13.5, color: T.ink, fontWeight: 600 }}>{(c.name as string) || (c.email as string)}</span>
                <span style={{ fontSize: 12, color: T.sub }}>{(c.source as string) || ''} · {(c.country as string) || ''}</span>
              </Link>
            ))}
            {res.contacts.length === 0 && <EmptyState title="No matches" />}
          </div>
        </div>
      )}
    </Card>
  )
}

interface Exec { revenue: number; purchaseRevenue: number; pipelineValue: number; conversionRate: number; meetingCloseRate: number; bookedCount: number; totalContacts: number; leadSources: Array<{ source: string; count: number }>; trafficSources: Array<{ source: string; count: number }>; products: Array<{ product: string; count: number; revenue: number }> }
function ExecutiveAnalytics() {
  const { data } = useAdminFetch<Exec>('/api/admin/analytics')
  if (!data) return null
  const d = data
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: 14, marginBottom: 14 }}>
        <Metric label="Won revenue" value={money(d.revenue)} />
        <Metric label="Purchase revenue" value={money(d.purchaseRevenue)} />
        <Metric label="Lead→call conversion" value={`${d.conversionRate}%`} hint={`${d.bookedCount}/${d.totalContacts}`} />
        <Metric label="Meeting close rate" value={`${d.meetingCloseRate}%`} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 14 }}>
        <BreakCard title="Lead sources" rows={d.leadSources.map((s) => ({ label: s.source, value: String(s.count) }))} />
        <BreakCard title="Traffic sources" rows={d.trafficSources.map((s) => ({ label: s.source, value: String(s.count) }))} />
        <BreakCard title="Products sold" rows={d.products.map((p) => ({ label: p.product, value: money(p.revenue) }))} />
      </div>
    </div>
  )
}
function BreakCard({ title, rows }: { title: string; rows: Array<{ label: string; value: string }> }) {
  return (
    <Card pad={16}>
      <h3 style={{ fontSize: 13, fontWeight: 700, color: T.sub, textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 10 }}>{title}</h3>
      {rows.length === 0 ? <div style={{ fontSize: 13, color: T.muted }}>No data yet</div> : rows.map((r) => (
        <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', fontSize: 13.5, color: T.text, borderBottom: '1px solid #f4f5f4' }}>
          <span style={{ textTransform: 'capitalize' }}>{r.label}</span><span style={{ fontWeight: 600 }}>{r.value}</span>
        </div>
      ))}
    </Card>
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
