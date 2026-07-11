'use client'
/* Customer Journey Intelligence (3I.8B.1) — live visitors + per-contact journey
   with intent scores, segment, signals and next best action. Reads the shared
   event bus (analytics_events) + comms + CRM; grounds Command AI's get_journey. */
import { useState } from 'react'
import Link from 'next/link'
import { T, Card, Button, PageHeader, EmptyState, useAdminFetch, adminSend, fmtDate } from '@/components/admin/ui'

type Row = Record<string, unknown>
const SEG: Record<string, string> = { 'Cold Visitor': '#9ca3af', Researching: '#0369a1', 'Warm Lead': '#d97706', 'High Intent': '#c026d3', 'Ready to Buy': '#16a34a', Customer: '#16a34a', 'At Risk': '#dc2626' }
const kindColor: Record<string, string> = { web: '#0369a1', comm: '#7c3aed', reply: '#16a34a', crm: '#C9A84C' }

export default function Journeys() {
  const [tab, setTab] = useState<'Intelligence' | 'Live' | 'Explorer'>('Intelligence')
  return (
    <>
      <PageHeader title="Customer Journeys" subtitle="Who's here, what they want, and what to do next" />
      <div style={{ display: 'flex', gap: 6, marginBottom: 18 }}>
        {(['Intelligence', 'Live', 'Explorer'] as const).map((t) => <button key={t} className="tab-btn" onClick={() => setTab(t)} style={{ background: tab === t ? T.green2 : '#fff', color: tab === t ? '#fff' : T.sub, border: `1px solid ${tab === t ? T.green2 : T.border}` }}>{t}</button>)}
      </div>
      {tab === 'Intelligence' && <Intelligence />}
      {tab === 'Live' && <Live />}
      {tab === 'Explorer' && <Explorer />}
    </>
  )
}

function Intelligence() {
  const { data, loading, reload } = useAdminFetch<{ dashboard: Row; recommendations: Row[] }>('/api/admin/journeys?view=intelligence')
  const [busy, setBusy] = useState(false)
  const refresh = async () => { setBusy(true); try { await adminSend('/api/admin/journeys', 'POST', { action: 'refresh' }); reload() } finally { setBusy(false) } }
  const decide = async (id: string, status: string) => { await adminSend('/api/admin/journeys', 'POST', { action: 'decide', id, status }); reload() }
  if (loading && !data) return <div className="skeleton" style={{ height: 240, borderRadius: 14 }} />
  const d = (data?.dashboard || {}) as Row
  const recs = data?.recommendations || []
  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(130px,1fr))', gap: 12, marginBottom: 16 }}>
        {[['Recommended actions', d.open], ['High-intent leads', d.highIntent], ['Customers at risk', d.atRisk], ['Open opportunities', d.openOpportunities]].map(([k, v]) => (
          <Card key={k as string} pad={16}><div style={{ fontSize: 22, fontWeight: 800, color: T.ink }}>{Number(v || 0)}</div><div style={{ fontSize: 12, color: T.sub }}>{k as string}</div></Card>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 16 }}>
        <Card pad={0}>
          <div style={{ display: 'flex', alignItems: 'center', padding: '14px 16px 8px' }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: T.ink, flex: 1 }}>Next best actions</span>
            <Button variant="ghost" disabled={busy} onClick={refresh}>{busy ? 'Analyzing…' : 'Refresh'}</Button>
          </div>
          {recs.length === 0 ? <EmptyState title="No open recommendations" hint="Hit Refresh to have the AI evaluate your contacts." /> : recs.map((r) => (
            <div key={r.id as string} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 16px', borderTop: `1px solid ${T.border}` }}>
              <span style={{ width: 34, textAlign: 'center', fontSize: 13, fontWeight: 800, color: Number(r.priority) >= 84 ? '#dc2626' : Number(r.priority) >= 60 ? '#d97706' : '#6b7280' }}>{r.priority as number}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: T.ink }}>{r.action as string} <span className="a-pill" style={{ background: `${SEG[r.segment as string] || '#6b7280'}1a`, color: SEG[r.segment as string] || '#6b7280' }}>{r.segment as string}</span></div>
                <div style={{ fontSize: 12, color: T.muted }}><Link href={`/admin/crm/${r.contact_id}`} style={{ color: T.green, textDecoration: 'none' }}>{(r.contact_name as string) || (r.contact_email as string)}</Link> · {r.reason as string}</div>
              </div>
              <Button variant="ghost" onClick={() => decide(r.id as string, 'done')}>Done</Button>
              <button className="a-pill" style={{ cursor: 'pointer', border: 'none', background: '#eef2f0', color: T.muted }} onClick={() => decide(r.id as string, 'dismissed')}>Dismiss</button>
            </div>
          ))}
        </Card>
        <Card>
          <div style={{ fontSize: 13, fontWeight: 700, color: T.ink, marginBottom: 10 }}>Lifecycle distribution</div>
          {((d.lifecycle as Row[]) || []).map((l) => (
            <div key={l.stage as string} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0' }}>
              <span style={{ flex: 1, fontSize: 13, color: T.text, textTransform: 'capitalize' }}>{(l.stage as string).replace(/_/g, ' ')}</span><b style={{ color: T.ink }}>{l.count as number}</b>
            </div>
          ))}
        </Card>
      </div>
    </>
  )
}

function Live() {
  const { data, loading, reload } = useAdminFetch<{ visitors: Row[] }>('/api/admin/journeys?view=live')
  if (loading && !data) return <div className="skeleton" style={{ height: 200, borderRadius: 14 }} />
  const v = data?.visitors || []
  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
        <span style={{ fontSize: 13, color: T.sub }}><b style={{ color: T.ink }}>{v.length}</b> active in the last 45 min</span>
        <Button variant="ghost" style={{ marginLeft: 'auto' }} onClick={reload}>Refresh</Button>
      </div>
      {v.length === 0 ? <EmptyState title="No live visitors right now" hint="Behavioral events stream in from the site as people browse." /> : (
        <Card pad={0}>
          {v.map((x) => {
            const c = x.contact as Row | undefined
            return (
              <div key={x.visitor_id as string} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderBottom: `1px solid ${T.border}` }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#16a34a', boxShadow: '0 0 0 3px rgba(22,163,74,.18)' }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: T.ink }}>{c ? (c.name as string || c.email as string) : `Anonymous · ${String(x.visitor_id).slice(0, 8)}`}</div>
                  <div style={{ fontSize: 11.5, color: T.muted, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{(x.last_path as string) || '—'}</div>
                </div>
                <span style={{ fontSize: 11.5, color: T.muted }}>{(x.city as string) ? `${x.city}, ` : ''}{x.country as string || ''}</span>
                <span style={{ fontSize: 11.5, color: T.muted }}>{x.events as number} events</span>
                <span style={{ fontSize: 11, color: T.muted, width: 84, textAlign: 'right' }}>{fmtDate(x.last_seen as string)}</span>
              </div>
            )
          })}
        </Card>
      )}
    </>
  )
}

function Explorer() {
  const [q, setQ] = useState('')
  const { data: sr } = useAdminFetch<{ results: Row[] }>(q.length >= 2 ? `/api/admin/journeys?view=search&q=${encodeURIComponent(q)}` : null, [q])
  const [id, setId] = useState<string | null>(null)
  const { data, loading } = useAdminFetch<{ journey: Row; timeline: Row[] }>(id ? `/api/admin/journeys?view=explorer&contact_id=${id}` : null, [id])
  const jn = data?.journey
  const bar = (label: string, val: number) => (
    <div style={{ marginBottom: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: T.sub, marginBottom: 3 }}><span style={{ textTransform: 'capitalize' }}>{label.replace(/_/g, ' ')}</span><b style={{ color: T.ink }}>{val}</b></div>
      <div style={{ height: 8, background: '#ece8f0', borderRadius: 999 }}><div style={{ width: `${val}%`, height: 8, borderRadius: 999, background: val >= 70 ? '#16a34a' : val >= 40 ? '#d97706' : '#9ca3af' }} /></div>
    </div>
  )
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 16 }}>
      <Card pad={12}>
        <input className="a-input" placeholder="Search a contact…" value={q} onChange={(e) => setQ(e.target.value)} style={{ marginBottom: 8 }} />
        {(sr?.results || []).map((c) => (
          <div key={c.id as string} onClick={() => setId(c.id as string)} style={{ padding: '8px 10px', borderRadius: 8, cursor: 'pointer', background: id === c.id ? '#eef7f1' : 'transparent', fontSize: 13, color: T.ink }}>
            {(c.name as string) || (c.email as string)}<div style={{ fontSize: 11, color: T.muted }}>{c.email as string}</div>
          </div>
        ))}
      </Card>
      <div>
        {!id ? <EmptyState title="Pick a contact" hint="See their intent scores, segment, signals and next best action." /> : loading || !jn ? <div className="skeleton" style={{ height: 260, borderRadius: 14 }} /> : jn.error ? <EmptyState title="No journey data" /> : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Card>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <span style={{ fontSize: 16, fontWeight: 800, color: T.ink }}>{(jn.contact as Row)?.name as string || (jn.contact as Row)?.email as string}</span>
                <span className="a-pill" style={{ background: `${SEG[jn.segment as string] || '#6b7280'}1a`, color: SEG[jn.segment as string] || '#6b7280' }}>{jn.segment as string}</span>
                <span className="a-pill" style={{ background: '#eef2f0', color: T.sub }}>{jn.lifecycle as string}</span>
                <Link href={`/admin/crm/${(jn.contact as Row)?.id}`} style={{ marginLeft: 'auto', fontSize: 12.5, color: T.green, textDecoration: 'none' }}>Open contact →</Link>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                <div>{Object.entries((jn.scores as Row) || {}).map(([k, val]) => bar(k, val as number))}</div>
                <div>
                  <div style={{ fontSize: 12.5, color: T.text, marginBottom: 8 }}><b>Next best action:</b> {jn.next_best_action as string}</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: T.sub, textTransform: 'uppercase', marginBottom: 4 }}>Confidence</div>
                  {Object.entries((jn.confidence as Row) || {}).map(([k, val]) => <div key={k} style={{ fontSize: 12.5, color: T.sub, display: 'flex', justifyContent: 'space-between' }}><span style={{ textTransform: 'capitalize' }}>{k.replace(/_/g, ' ')}</span><b style={{ color: T.ink }}>{val as number}%</b></div>)}
                </div>
              </div>
              {((jn.signals as string[]) || []).length > 0 && <div style={{ marginTop: 12, borderTop: `1px solid ${T.border}`, paddingTop: 10 }}>{((jn.signals as string[]) || []).map((s, i) => <div key={i} style={{ fontSize: 12.5, color: T.sub, display: 'flex', gap: 6 }}><span style={{ color: T.green }}>•</span>{s}</div>)}</div>}
            </Card>
            <Card>
              <h3 style={{ fontSize: 13, fontWeight: 700, color: T.ink, marginBottom: 10 }}>Journey timeline</h3>
              {(data?.timeline || []).length === 0 ? <EmptyState title="No events yet" /> : (data?.timeline || []).map((e, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, padding: '6px 0', borderBottom: `1px solid #f4f5f4` }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: kindColor[e.kind as string] || '#9ca3af', marginTop: 6, flexShrink: 0 }} />
                  <span style={{ flex: 1, fontSize: 12.5, color: T.text }}>{e.label as string}</span>
                  <span style={{ fontSize: 11, color: T.muted }}>{fmtDate(e.ts as string)}</span>
                </div>
              ))}
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
