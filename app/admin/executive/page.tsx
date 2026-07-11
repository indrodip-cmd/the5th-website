'use client'
/* Executive Command Center (3I.8B.3) — the operational homepage. Every system
   reports here: what to focus on now, live business KPIs, today's AI-ranked
   priorities, upcoming calls, and Command AI's grounded morning briefing. */
import { useState } from 'react'
import Link from 'next/link'
import { T, Card, Button, PageHeader, EmptyState, useAdminFetch, adminSend, fmtDate, money } from '@/components/admin/ui'

type Row = Record<string, unknown>
const priColor = (p: number) => p >= 84 ? '#dc2626' : p >= 60 ? '#d97706' : '#6b7280'

export default function Executive() {
  const { data, loading } = useAdminFetch<{ summary: Row }>('/api/admin/executive')
  const [brief, setBrief] = useState('')
  const [busy, setBusy] = useState(false)
  const runBriefing = async () => { setBusy(true); try { const r = await adminSend('/api/admin/executive', 'POST', { action: 'briefing' }) as Row; setBrief((r?.briefing as string) || 'No briefing.') } catch (e) { setBrief(String(e instanceof Error ? e.message : e)) } finally { setBusy(false) } }
  if (loading && !data) return <div className="skeleton" style={{ height: 300, borderRadius: 14 }} />
  const s = (data?.summary || {}) as Row
  const rev = (s.revenue || {}) as Row, leads = (s.leads || {}) as Row, meet = (s.meetings || {}) as Row, comms = (s.comms || {}) as Row, ai = (s.ai || {}) as Row, auto = (s.automation || {}) as Row, sales = (s.sales || {}) as Row
  const kpis: Array<[string, string, string]> = [
    ['Revenue today', money(Number(rev.today || 0)), '/admin/revenue'],
    ['Revenue this month', money(Number(rev.month || 0)), '/admin/revenue'],
    ['Pipeline value', money(Number(sales.pipeline_value || 0)), '/admin/crm/pipeline'],
    ['New leads (7d)', String(leads.new_7d || 0), '/admin/crm'],
    ['Calls today', String(meet.today || 0), '/admin/crm/meetings'],
    ['High-intent leads', String(leads.high_intent || 0), '/admin/journeys'],
    ['Customers at risk', String(leads.at_risk || 0), '/admin/journeys'],
    ['Email open rate', `${comms.open_rate || 0}%`, '/admin/communications'],
    ['Replies (30d)', String(comms.replies_30d || 0), '/admin/communications'],
    ['AI cost (month)', money(Number(ai.month_cost || 0)), '/admin/system'],
    ['Approvals waiting', String(auto.approvals || 0), '/admin/automation'],
    ['Live workflows', String(auto.published || 0), '/admin/automation'],
  ]

  return (
    <>
      <PageHeader title="Command Center" subtitle="Your whole business at a glance — what to focus on right now"
        actions={<div style={{ display: 'flex', gap: 8 }}><Link href="/admin/launch"><Button variant="ghost">Launch readiness</Button></Link><Button disabled={busy} onClick={runBriefing}>{busy ? 'Thinking…' : '✦ Morning briefing'}</Button></div>} />

      {brief && <Card style={{ marginBottom: 16, background: 'linear-gradient(150deg,#2A1830,#160D1A)', border: '1px solid rgba(201,168,76,.2)' }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: '#C9A84C', marginBottom: 8 }}>✦ Today's executive briefing</div>
        <div style={{ fontSize: 13.5, color: '#ECECEC', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{brief}</div>
      </Card>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: 12, marginBottom: 18 }}>
        {kpis.map(([label, val, href]) => (
          <Link key={label} href={href} style={{ textDecoration: 'none' }}>
            <Card pad={16} style={{ cursor: 'pointer' }}><div style={{ fontSize: 20, fontWeight: 800, color: T.ink }}>{val}</div><div style={{ fontSize: 11.5, color: T.sub }}>{label}</div></Card>
          </Link>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 16 }}>
        <Card pad={0}>
          <div style={{ display: 'flex', alignItems: 'center', padding: '14px 16px 8px' }}>
            <span style={{ fontSize: 14, fontWeight: 800, color: T.ink, flex: 1 }}>Today's priorities</span>
            <Link href="/admin/journeys" style={{ fontSize: 12.5, color: T.green, textDecoration: 'none' }}>Journey intelligence →</Link>
          </div>
          {((s.priorities as Row[]) || []).length === 0 ? <EmptyState title="You're all caught up" hint="No urgent actions right now." /> : ((s.priorities as Row[]) || []).map((p, i) => (
            <Link key={i} href={p.link as string} style={{ textDecoration: 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 16px', borderTop: `1px solid ${T.border}` }}>
                <span style={{ width: 30, textAlign: 'center', fontSize: 12.5, fontWeight: 800, color: priColor(Number(p.priority)) }}>{Number(p.priority)}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 600, color: T.ink }}>{p.title as string}</div>
                  <div style={{ fontSize: 12, color: T.muted, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.detail as string}</div>
                </div>
                <span className="a-pill" style={{ background: '#eef2f0', color: T.sub }}>{p.kind as string}</span>
              </div>
            </Link>
          ))}
        </Card>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Card>
            <div style={{ fontSize: 13, fontWeight: 700, color: T.ink, marginBottom: 10 }}>Upcoming calls</div>
            {((meet.upcoming as Row[]) || []).length === 0 ? <div style={{ fontSize: 13, color: T.muted }}>None scheduled.</div> : ((meet.upcoming as Row[]) || []).map((m, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 0', borderBottom: `1px solid #f4f5f4` }}>
                <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: 13, color: T.ink }}>{(m.contact as Row)?.name as string || (m.title as string)}</div></div>
                <span style={{ fontSize: 11.5, color: T.muted }}>{fmtDate(m.starts_at as string)}</span>
              </div>
            ))}
          </Card>
          <Card>
            <div style={{ fontSize: 13, fontWeight: 700, color: T.ink, marginBottom: 8 }}>Ask Command AI</div>
            <div style={{ fontSize: 12.5, color: T.sub, marginBottom: 10 }}>Grounded in every system — CRM, revenue, comms, journeys, memory.</div>
            {['What should I focus on today?', 'Which leads are most likely to buy?', 'What changed yesterday?'].map((q) => (
              <Link key={q} href={`/admin/ai?q=${encodeURIComponent(q)}`} style={{ display: 'block', fontSize: 12.5, color: T.green, textDecoration: 'none', padding: '5px 0' }}>→ {q}</Link>
            ))}
          </Card>
        </div>
      </div>
    </>
  )
}
