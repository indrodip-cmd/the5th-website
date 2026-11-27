'use client'
/* Overnight improvements: AI-drafted button copy that goes live ONLY after approval here. */
import { useState } from 'react'
import { T, Card, PageHeader, Button, EmptyState, ErrorState, useAdminFetch, fmtDate } from '@/components/admin/ui'

type Proposal = { id: string; created_at: string; element_id: string; page: string; current_text: string; proposed_text: string; rationale: string | null; metrics: { visitors?: number; clicks?: number; ctr?: number; avgScroll?: number | null } | null; status: string; decided_at: string | null }
type Resp = { proposals: Proposal[]; metrics: { ctas: Array<{ id: string; visitors: number; clicks: number; ctr: number }>; pages: Array<{ path: string; visitors: number; avgScroll: number }> } | null }

export default function ImprovementsPage() {
  const { data, loading, error, reload } = useAdminFetch<Resp>('/api/admin/improvements')
  const [busy, setBusy] = useState<string | null>(null)
  const [note, setNote] = useState('')

  async function act(id: string, action: string) {
    setBusy(id + action)
    await fetch('/api/admin/improvements', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, action }) })
    setBusy(null); reload()
  }
  async function runNow() {
    setBusy('run'); setNote('')
    const r = await fetch('/api/admin/improvements', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'run' }) }).then((x) => x.json()).catch(() => null)
    setBusy(null)
    setNote(r ? `Reviewed ${r.pagesSeen} pages. ${r.eligible} buttons have enough traffic (${r.minViews}+ visitors). ${r.proposals?.length || 0} new proposal(s).` : 'Run failed.')
    reload()
  }

  const pending = (data?.proposals || []).filter((p) => p.status === 'pending')
  const live = (data?.proposals || []).filter((p) => p.status === 'approved')
  const past = (data?.proposals || []).filter((p) => p.status === 'rejected' || p.status === 'reverted').slice(0, 10)

  const row = (p: Proposal, actions: React.ReactNode) => (
    <Card key={p.id} style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 12, color: T.muted, marginBottom: 8 }}>{p.element_id} · page {p.page} · {fmtDate(p.created_at)}</div>
      <div style={{ display: 'grid', gap: 8 }}>
        <div><span style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '.1em', color: T.muted }}>Live now</span><div style={{ fontSize: 16 }}>{p.current_text}</div></div>
        <div><span style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '.1em', color: T.muted }}>Proposed</span><div style={{ fontSize: 16, fontWeight: 700 }}>{p.proposed_text}</div></div>
        {p.rationale && <div style={{ fontSize: 13.5, color: T.muted }}>Why: {p.rationale}</div>}
        {p.metrics && <div style={{ fontSize: 12.5, color: T.muted }}>At proposal time: {p.metrics.clicks ?? 0} clicks / {p.metrics.visitors ?? 0} visitors ({p.metrics.ctr ?? 0}%)</div>}
      </div>
      <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>{actions}</div>
    </Card>
  )

  return (
    <div>
      <PageHeader title="Overnight improvements" subtitle="Each night the site reviews itself and drafts better button copy. Nothing goes live until you approve it here." actions={<Button onClick={runNow} disabled={busy === 'run'}>{busy === 'run' ? 'Reviewing…' : 'Run review now'}</Button>} />
      {note && <p style={{ margin: '0 0 16px', fontSize: 14 }}>{note}</p>}
      {loading && <p>Loading…</p>}
      {error && <ErrorState message={error} />}
      <h3 style={{ margin: '8px 0 12px' }}>Waiting for approval ({pending.length})</h3>
      {pending.length === 0 && !loading && <EmptyState title="Nothing waiting" hint="Proposals appear once a button has enough visitors to judge. Until then the site keeps its current copy." />}
      {pending.map((p) => row(p, <>
        <Button onClick={() => act(p.id, 'approve')} disabled={!!busy}>Approve and publish</Button>
        <Button variant="ghost" onClick={() => act(p.id, 'reject')} disabled={!!busy}>Reject</Button>
      </>))}
      {live.length > 0 && <h3 style={{ margin: '26px 0 12px' }}>Live changes ({live.length})</h3>}
      {live.map((p) => row(p, <Button variant="ghost" onClick={() => act(p.id, 'revert')} disabled={!!busy}>Revert to original</Button>))}
      {data?.metrics && <>
        <h3 style={{ margin: '26px 0 12px' }}>Button performance, last 7 days</h3>
        <Card>{data.metrics.ctas.map((c) => <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: 14, borderBottom: `1px solid ${T.border}` }}><span>{c.id}</span><span>{c.clicks} / {c.visitors} ({c.ctr}%)</span></div>)}</Card>
      </>}
      {past.length > 0 && <h3 style={{ margin: '26px 0 12px' }}>Earlier decisions</h3>}
      {past.map((p) => <div key={p.id} style={{ fontSize: 13, color: T.muted, padding: '4px 0' }}>{p.status}: “{p.proposed_text}” ({p.element_id})</div>)}
    </div>
  )
}
