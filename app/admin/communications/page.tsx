'use client'
/* Communication Center (3I.8A.1) — one interface over Resend, Brevo & Twilio.
   Compose, queue, track, retry; manage providers/senders/templates; every
   message stored, linked to the CRM timeline, and observable. */
import { useState } from 'react'
import Link from 'next/link'
import { T, Card, Button, PageHeader, EmptyState, Modal, useAdminFetch, adminSend, fmtDate } from '@/components/admin/ui'

type Row = Record<string, unknown>
const SC: Record<string, string> = { sent: '#0369a1', delivered: '#16a34a', opened: '#16a34a', clicked: '#16a34a', queued: '#6b7280', scheduled: '#7c3aed', sending: '#0369a1', failed: '#dc2626', bounced: '#dc2626', complained: '#dc2626', cancelled: '#9ca3af', replied: '#16a34a', received: '#7c3aed' }
const pill = (s: string) => <span className="a-pill" style={{ background: `${SC[s] || '#6b7280'}1a`, color: SC[s] || '#6b7280' }}>{s}</span>
const TABS = ['Dashboard', 'Messages', 'Compose', 'Designs', 'Campaigns', 'Sequences', 'Providers', 'Templates', 'Senders'] as const
type Tab = typeof TABS[number]

export default function Communications() {
  const [tab, setTab] = useState<Tab>('Dashboard')
  return (
    <>
      <PageHeader title="Communications" subtitle="Email & SMS across every provider — one engine, fully tracked" />
      <div style={{ display: 'flex', gap: 6, marginBottom: 18, flexWrap: 'wrap' }}>
        {TABS.map((t) => <button key={t} className="tab-btn" onClick={() => setTab(t)} style={{ background: tab === t ? T.green2 : '#fff', color: tab === t ? '#fff' : T.sub, border: `1px solid ${tab === t ? T.green2 : T.border}` }}>{t}</button>)}
      </div>
      {tab === 'Dashboard' && <Dashboard />}
      {tab === 'Messages' && <Messages />}
      {tab === 'Compose' && <Compose />}
      {tab === 'Designs' && <Designs />}
      {tab === 'Campaigns' && <Campaigns />}
      {tab === 'Sequences' && <Sequences />}
      {tab === 'Providers' && <Providers />}
      {tab === 'Templates' && <Templates />}
      {tab === 'Senders' && <Senders />}
    </>
  )
}

function Dashboard() {
  const { data, loading } = useAdminFetch<{ total: number; byStatus: Row; byProvider: Row; providers: Row[]; recent: Row[] }>('/api/admin/communications?view=dashboard')
  if (loading && !data) return <div className="skeleton" style={{ height: 200, borderRadius: 14 }} />
  const bs = (data?.byStatus || {}) as Record<string, number>
  const stat = (keys: string[]) => keys.reduce((s, k) => s + (bs[k] || 0), 0)
  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(120px,1fr))', gap: 12, marginBottom: 18 }}>
        {[['Sent (30d)', data?.total || 0], ['Delivered', stat(['delivered', 'opened', 'clicked'])], ['Failed', stat(['failed', 'bounced'])], ['Queued', stat(['queued', 'scheduled'])]].map(([k, v]) => (
          <Card key={k as string} pad={16}><div style={{ fontSize: 22, fontWeight: 800, color: T.ink }}>{v as number}</div><div style={{ fontSize: 12, color: T.sub }}>{k as string}</div></Card>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: 16 }}>
        <Card>
          <div style={{ fontSize: 13, fontWeight: 700, color: T.ink, marginBottom: 10 }}>Providers</div>
          {(data?.providers || []).map((p) => (
            <div key={p.slug as string} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 0', borderBottom: `1px solid ${T.border}` }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: p.configured ? '#16a34a' : '#9ca3af' }} />
              <span style={{ flex: 1, fontSize: 13.5, color: T.ink }}>{p.name as string}</span>
              <span className="a-pill" style={{ background: '#eef2f0', color: T.sub }}>{p.kind as string}</span>
              <span style={{ fontSize: 11.5, color: p.configured ? '#16a34a' : T.muted }}>{p.configured ? 'ready' : 'not set'}</span>
            </div>
          ))}
        </Card>
        <Card pad={0}>
          <div style={{ fontSize: 13, fontWeight: 700, color: T.ink, padding: '14px 14px 6px' }}>Recent messages</div>
          {(data?.recent || []).length === 0 ? <EmptyState title="No messages yet" hint="Compose one, or let an automation send it." /> : (data?.recent || []).map((m) => (
            <div key={m.id as string} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 14px', borderTop: `1px solid ${T.border}` }}>
              <span>{m.channel === 'sms' ? '💬' : '✉️'}</span>
              <span style={{ flex: 1, minWidth: 0, fontSize: 13, color: T.ink, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{(m.subject as string) || (m.to_addr as string)}</span>
              <span style={{ fontSize: 11.5, color: T.muted }}>{m.provider as string || '—'}</span>{pill(m.status as string)}
            </div>
          ))}
        </Card>
      </div>
    </>
  )
}

function Messages() {
  const [q, setQ] = useState(''); const [status, setStatus] = useState(''); const [refresh, setRefresh] = useState(0)
  const { data, loading, reload } = useAdminFetch<{ messages: Row[] }>(`/api/admin/communications?view=messages${q ? `&q=${encodeURIComponent(q)}` : ''}${status ? `&status=${status}` : ''}`, [status, refresh])
  const retry = async (id: string) => { await adminSend('/api/admin/communications', 'POST', { action: 'retry', id }); reload() }
  const cancel = async (id: string) => { await adminSend('/api/admin/communications', 'POST', { action: 'cancel', id }); reload() }
  return (
    <>
      <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
        <input className="a-input" placeholder="Search recipient, subject…" value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && setRefresh((n) => n + 1)} />
        <select className="a-input" style={{ maxWidth: 150 }} value={status} onChange={(e) => setStatus(e.target.value)}><option value="">All statuses</option>{Object.keys(SC).map((s) => <option key={s}>{s}</option>)}</select>
        <Button onClick={() => setRefresh((n) => n + 1)}>Search</Button>
      </div>
      {loading && !data ? <div className="skeleton" style={{ height: 200, borderRadius: 14 }} /> : (data?.messages || []).length === 0 ? <EmptyState title="No messages" /> : (
        <Card pad={0}>
          {(data?.messages || []).map((m) => {
            const inbound = m.direction === 'inbound'
            return (
            <div key={m.id as string} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderBottom: `1px solid ${T.border}`, background: inbound ? '#faf8fc' : 'transparent' }}>
              <span title={inbound ? 'Inbound' : 'Outbound'}>{inbound ? '📥' : m.channel === 'sms' || m.channel === 'whatsapp' ? '💬' : '✉️'}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: T.ink, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{inbound ? (String(m.body || '') || '(empty)') : ((m.subject as string) || (String(m.body || '').slice(0, 60)) || '(no subject)')}</div>
                <div style={{ fontSize: 11.5, color: T.muted }}>{inbound ? `from ${m.from_addr as string}` : (m.to_addr as string)} · {m.channel as string} · {m.provider as string || m.source as string} {m.error ? `· ${String(m.error).slice(0, 40)}` : ''}</div>
              </div>
              {pill(m.status as string)}
              <span style={{ fontSize: 11, color: T.muted, width: 88, textAlign: 'right' }}>{fmtDate(m.created_at as string)}</span>
              {['failed', 'bounced'].includes(m.status as string) && <button className="a-pill" style={{ cursor: 'pointer', border: 'none', background: '#eef2f0', color: T.green }} onClick={() => retry(m.id as string)}>Retry</button>}
              {['queued', 'scheduled'].includes(m.status as string) && <button className="a-pill" style={{ cursor: 'pointer', border: 'none', background: '#eef2f0', color: T.danger }} onClick={() => cancel(m.id as string)}>Cancel</button>}
            </div>
          ) })}
        </Card>
      )}
    </>
  )
}

function Compose() {
  const [f, setF] = useState<Row>({ channel: 'email', to: '', subject: '', body: '' })
  const [busy, setBusy] = useState(false); const [res, setRes] = useState<Row | null>(null)
  const send = async () => {
    if (!(f.to as string)?.trim()) return
    setBusy(true); setRes(null)
    try { setRes(await adminSend('/api/admin/communications', 'POST', { action: 'send', ...f }) as Row) }
    catch (e) { setRes({ ok: false, result: { error: String(e instanceof Error ? e.message : e) } }) } finally { setBusy(false) }
  }
  return (
    <div style={{ maxWidth: 640 }}>
      <Card>
        <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
          {['email', 'sms', 'whatsapp'].map((c) => <button key={c} className="tab-btn" onClick={() => setF({ ...f, channel: c })} style={{ background: f.channel === c ? T.green2 : '#fff', color: f.channel === c ? '#fff' : T.sub, border: `1px solid ${f.channel === c ? T.green2 : T.border}`, textTransform: 'capitalize' }}>{c}</button>)}
        </div>
        <input className="a-input" style={{ marginBottom: 10 }} placeholder={f.channel !== 'email' ? 'Phone (E.164, +1…)' : 'Recipient email'} value={f.to as string} onChange={(e) => setF({ ...f, to: e.target.value })} />
        {f.channel === 'email' && <input className="a-input" style={{ marginBottom: 10 }} placeholder="Subject" value={f.subject as string} onChange={(e) => setF({ ...f, subject: e.target.value })} />}
        <textarea className="a-input" style={{ minHeight: 140, marginBottom: 10 }} placeholder={f.channel === 'email' ? 'HTML or text — use {{name}}, {{first_name}}' : 'Message text — use {{first_name}}'} value={f.body as string} onChange={(e) => setF({ ...f, body: e.target.value })} />
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <label style={{ fontSize: 12, color: T.sub }}>Schedule <input type="datetime-local" className="a-input" style={{ display: 'inline-block', width: 200, marginLeft: 6 }} onChange={(e) => setF({ ...f, scheduled_at: e.target.value ? new Date(e.target.value).toISOString() : undefined })} /></label>
          <Button style={{ marginLeft: 'auto' }} disabled={busy || !(f.to as string)?.trim()} onClick={send}>{busy ? 'Sending…' : (f.scheduled_at ? 'Schedule' : 'Send now')}</Button>
        </div>
        {res && <div style={{ marginTop: 12, fontSize: 13, color: (res.ok ? T.green : T.danger) }}>{res.ok ? `Queued — status: ${(res.result as Row)?.status}` : `Failed: ${(res.result as Row)?.error}`}</div>}
      </Card>
    </div>
  )
}

function Designs() {
  const { data, loading, reload } = useAdminFetch<{ templates: Row[] }>('/api/admin/communications/designer?view=list')
  const dup = async (id: string) => { await adminSend('/api/admin/communications/designer', 'POST', { action: 'duplicate', id }); reload() }
  const del = async (id: string) => { if (!confirm('Delete this email design?')) return; await adminSend('/api/admin/communications/designer', 'POST', { action: 'delete', id }); reload() }
  return (
    <>
      <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
        <Link href="/admin/communications/designer"><Button>＋ New email design</Button></Link>
        <Link href="/admin/communications/brand"><Button variant="ghost">Brand system</Button></Link>
      </div>
      {loading && !data ? <div className="skeleton" style={{ height: 160, borderRadius: 14 }} /> : (data?.templates || []).length === 0 ? <EmptyState title="No email designs yet" hint="Design one visually or generate it with AI — it inherits your brand system." /> : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 12 }}>
          {(data?.templates || []).map((t) => {
            const score = (t.quality as Row)?.score as number | undefined
            return (
              <Card key={t.id as string} pad={16}>
                <div style={{ display: 'flex', gap: 6, marginBottom: 4, alignItems: 'center' }}>
                  <span style={{ fontSize: 14.5, fontWeight: 700, color: T.ink, flex: 1 }}>{t.name as string}</span>
                  <span className="a-pill" style={{ background: t.status === 'published' ? '#dcfce7' : '#f3f4f6', color: t.status === 'published' ? '#16a34a' : T.sub }}>{t.status as string}</span>
                </div>
                <div style={{ fontSize: 12, color: T.sub, marginBottom: 10 }}>{(t.subject as string) || '—'}{typeof score === 'number' ? ` · score ${score}` : ''}</div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <Link href={`/admin/communications/designer?id=${t.id}`}><Button>Open</Button></Link>
                  <Button variant="ghost" onClick={() => dup(t.id as string)}>Duplicate</Button>
                  <button className="a-pill" style={{ cursor: 'pointer', border: 'none', background: '#eef2f0', color: T.danger, marginLeft: 'auto' }} onClick={() => del(t.id as string)}>✕</button>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </>
  )
}

function Campaigns() {
  const { data, loading, reload } = useAdminFetch<{ campaigns: Row[]; templates: Row[] }>('/api/admin/communications/campaigns')
  const [edit, setEdit] = useState<Row | null>(null)
  const [count, setCount] = useState<number | null>(null)
  const [review, setReview] = useState<string | null>(null)
  const [stats, setStats] = useState<string | null>(null)
  const send = async (c: Row) => { if (!confirm(`Send "${c.name}" now to the audience?`)) return; const r = await adminSend('/api/admin/communications/campaigns', 'POST', { action: 'send_campaign', id: c.id, require_ready: true }) as Row; if (r?.error) { alert(`Blocked: ${r.error}`); return } const q = Number(r?.queued || 0); alert(`Sent — ${q} emails ${q <= 300 ? 'delivered now' : 'queued'}.`); reload() }
  const del = async (id: string) => { if (!confirm('Delete campaign?')) return; await adminSend('/api/admin/communications/campaigns', 'POST', { action: 'delete_campaign', id }); reload() }
  const save = async () => { if (!(edit?.name as string)?.trim() || !edit?.template_id) { alert('Name + template required'); return } await adminSend('/api/admin/communications/campaigns', 'POST', { action: 'save_campaign', ...edit }); setEdit(null); reload() }
  const preview = async (aud: Row) => { const r = await adminSend('/api/admin/communications/campaigns', 'POST', { action: 'audience_count', audience: aud }) as Row; setCount((r?.count as number) ?? 0) }
  return (
    <>
      <div style={{ marginBottom: 14 }}><Button onClick={() => { setEdit({ audience: {} }); setCount(null) }}>＋ New campaign</Button></div>
      {loading && !data ? <div className="skeleton" style={{ height: 140 }} /> : (data?.campaigns || []).length === 0 ? <EmptyState title="No campaigns yet" hint="Broadcast a design to a CRM audience — suppression, rate limits & tracking are automatic." /> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {(data?.campaigns || []).map((c) => (
            <Card key={c.id as string} pad={16}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ flex: 1 }}><b style={{ color: T.ink }}>{c.name as string}</b><div style={{ fontSize: 12, color: T.muted }}>{c.status as string}{c.total ? ` · ${c.sent || c.total} sent` : ''}{c.scheduled_at ? ` · scheduled ${fmtDate(c.scheduled_at as string)}` : ''}</div></div>
                {pill(c.status as string)}
                <Button variant="ghost" onClick={() => setReview(c.id as string)}>Review</Button>
                {c.status === 'sent' && <Button variant="ghost" onClick={() => setStats(c.id as string)}>Analytics</Button>}
                {['draft', 'scheduled'].includes(c.status as string) && <Button onClick={() => send(c)}>Send</Button>}
                <Button variant="ghost" onClick={() => { setEdit(c); setCount(null) }}>Edit</Button>
                <button className="a-pill" style={{ cursor: 'pointer', border: 'none', background: '#eef2f0', color: T.danger }} onClick={() => del(c.id as string)}>✕</button>
              </div>
            </Card>
          ))}
        </div>
      )}
      {edit && (
        <Modal open onClose={() => setEdit(null)} title={edit.id ? 'Edit campaign' : 'New campaign'}>
          <input className="a-input" style={{ marginBottom: 10 }} placeholder="Campaign name" value={(edit.name as string) || ''} onChange={(e) => setEdit({ ...edit, name: e.target.value })} />
          <select className="a-input" style={{ marginBottom: 10 }} value={(edit.template_id as string) || ''} onChange={(e) => setEdit({ ...edit, template_id: e.target.value })}><option value="">Choose email design…</option>{(data?.templates || []).map((t) => <option key={t.id as string} value={t.id as string}>{t.name as string}</option>)}</select>
          <input className="a-input" style={{ marginBottom: 10 }} placeholder="Subject override (optional)" value={(edit.subject as string) || ''} onChange={(e) => setEdit({ ...edit, subject: e.target.value })} />
          <div style={{ fontSize: 11.5, fontWeight: 700, color: T.sub, textTransform: 'uppercase', marginBottom: 6 }}>Audience</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
            <input className="a-input" placeholder="Tags (comma)" onChange={(e) => setEdit({ ...edit, audience: { ...(edit.audience as Row), tags: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) } })} />
            <input className="a-input" placeholder="Lifecycle stage" onChange={(e) => setEdit({ ...edit, audience: { ...(edit.audience as Row), lifecycle_stage: e.target.value || undefined } })} />
            <input className="a-input" placeholder="Country" onChange={(e) => setEdit({ ...edit, audience: { ...(edit.audience as Row), country: e.target.value || undefined } })} />
            <input className="a-input" type="number" placeholder="Min lead score" onChange={(e) => setEdit({ ...edit, audience: { ...(edit.audience as Row), min_score: e.target.value ? Number(e.target.value) : undefined } })} />
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12 }}>
            <Button variant="ghost" onClick={() => preview(edit.audience as Row)}>Count audience</Button>
            {count != null && <span style={{ fontSize: 13, color: T.ink }}>{count} recipients</span>}
            <label style={{ fontSize: 12, color: T.sub, marginLeft: 'auto' }}>Schedule <input type="datetime-local" className="a-input" style={{ display: 'inline-block', width: 190, marginLeft: 4 }} onChange={(e) => setEdit({ ...edit, scheduled_at: e.target.value ? new Date(e.target.value).toISOString() : null })} /></label>
          </div>
          <Button onClick={save}>Save campaign</Button>
        </Modal>
      )}
      {review && <CampaignReview id={review} onClose={() => setReview(null)} />}
      {stats && <CampaignStats id={stats} onClose={() => setStats(null)} />}
    </>
  )
}

function scoreColor(n: number) { return n >= 85 ? '#16a34a' : n >= 70 ? '#0369a1' : n >= 50 ? '#d97706' : '#dc2626' }
function CampaignReview({ id, onClose }: { id: string; onClose: () => void }) {
  const { data, loading } = useAdminFetch<{ review: Row }>(`/api/admin/communications/campaigns?view=review&id=${id}`)
  const r = data?.review
  return (
    <Modal open onClose={onClose} title="AI pre-launch review">
      {loading || !r ? <div className="skeleton" style={{ height: 160 }} /> : r.error ? <EmptyState title={r.error as string} /> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', border: `4px solid ${scoreColor(r.health as number)}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 800, color: scoreColor(r.health as number) }}>{r.health as number}</div>
            <div><div style={{ fontSize: 16, fontWeight: 800, color: T.ink }}>{r.band as string}</div><div style={{ fontSize: 12, color: T.sub }}>Campaign health · {r.ready ? 'ready to launch' : 'checks failing'}</div></div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
            {Object.entries((r.scores as Row) || {}).map(([k, v]) => <div key={k} style={{ textAlign: 'center', padding: 8, borderRadius: 8, background: '#faf8fc' }}><div style={{ fontSize: 17, fontWeight: 800, color: T.ink }}>{k === 'spam' ? `${v}` : v as number}</div><div style={{ fontSize: 10.5, color: T.muted, textTransform: 'capitalize' }}>{k === 'spam' ? 'spam risk' : k}</div></div>)}
          </div>
          {(r.inbox as Row) && <div style={{ fontSize: 12.5, color: T.text }}>📥 Estimated placement: <b>{(r.inbox as Row).placement as string}</b> — {(r.inbox as Row).note as string}</div>}
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: T.sub, textTransform: 'uppercase', marginBottom: 4 }}>Pre-launch checklist</div>
            {((r.checklist as Row[]) || []).map((c, i) => <div key={i} style={{ display: 'flex', gap: 6, fontSize: 12.5, color: c.ok ? T.text : (c.critical ? '#dc2626' : '#d97706') }}><span>{c.ok ? '✓' : c.critical ? '✕' : '⚠'}</span>{c.label as string}{c.detail ? <span style={{ color: T.muted }}>· {c.detail as string}</span> : null}</div>)}
          </div>
          {((r.spam as Row)?.reasons as string[] || []).length > 0 && <div><div style={{ fontSize: 12, fontWeight: 700, color: T.sub, textTransform: 'uppercase', marginBottom: 4 }}>Spam flags</div>{((r.spam as Row).reasons as string[]).map((s, i) => <div key={i} style={{ fontSize: 12, color: '#d97706' }}>• {s}</div>)}</div>}
          {((r.design_suggestions as string[]) || []).length > 0 && <div><div style={{ fontSize: 12, fontWeight: 700, color: T.sub, textTransform: 'uppercase', marginBottom: 4 }}>AI suggestions</div>{((r.design_suggestions as string[]) || []).slice(0, 5).map((s, i) => <div key={i} style={{ fontSize: 12, color: T.sub }}>• {s}</div>)}</div>}
        </div>
      )}
    </Modal>
  )
}
function CampaignStats({ id, onClose }: { id: string; onClose: () => void }) {
  const { data, loading } = useAdminFetch<{ stats: Row }>(`/api/admin/communications/campaigns?view=stats&id=${id}`)
  const s = data?.stats
  return (
    <Modal open onClose={onClose} title="Campaign analytics">
      {loading || !s ? <div className="skeleton" style={{ height: 120 }} /> : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(110px,1fr))', gap: 10 }}>
          {[['Sent', s.total], ['Delivered %', s.deliveredRate], ['Open %', s.openRate], ['Click %', s.clickRate]].map(([k, v]) => (
            <div key={k as string} style={{ padding: 12, borderRadius: 10, background: '#faf8fc', textAlign: 'center' }}><div style={{ fontSize: 20, fontWeight: 800, color: T.ink }}>{v as number}</div><div style={{ fontSize: 11, color: T.muted }}>{k as string}</div></div>
          ))}
        </div>
      )}
    </Modal>
  )
}

function Sequences() {
  const { data, loading, reload } = useAdminFetch<{ sequences: Row[]; templates: Row[] }>('/api/admin/communications/campaigns')
  const [open, setOpen] = useState<Row | null>(null)
  const [ai, setAi] = useState(false)
  const create = async () => { const name = prompt('Sequence name:'); if (!name) return; await adminSend('/api/admin/communications/campaigns', 'POST', { action: 'save_sequence', name }); reload() }
  const toggle = async (s: Row) => { await adminSend('/api/admin/communications/campaigns', 'POST', { action: 'toggle_sequence', id: s.id, status: s.status === 'active' ? 'paused' : 'active' }); reload() }
  const del = async (id: string) => { if (!confirm('Delete sequence?')) return; await adminSend('/api/admin/communications/campaigns', 'POST', { action: 'delete_sequence', id }); reload() }
  return (
    <>
      <div style={{ marginBottom: 14, display: 'flex', gap: 8 }}><Button onClick={() => setAi(true)}>✦ AI campaign builder</Button><Button variant="ghost" onClick={create}>＋ Blank sequence</Button></div>
      {loading && !data ? <div className="skeleton" style={{ height: 140 }} /> : (data?.sequences || []).length === 0 ? <EmptyState title="No sequences yet" hint="Build a drip: steps with delays, auto-enrolled from automations or manually." /> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {(data?.sequences || []).map((s) => (
            <Card key={s.id as string} pad={16}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ flex: 1 }}><b style={{ color: T.ink }}>{s.name as string}</b><div style={{ fontSize: 12, color: T.muted }}>{s.enrolled as number || 0} enrolled</div></div>
                {pill(s.status as string)}
                <Button variant="ghost" onClick={() => toggle(s)}>{s.status === 'active' ? 'Pause' : 'Activate'}</Button>
                <Button onClick={() => setOpen(s)}>Steps</Button>
                <button className="a-pill" style={{ cursor: 'pointer', border: 'none', background: '#eef2f0', color: T.danger }} onClick={() => del(s.id as string)}>✕</button>
              </div>
            </Card>
          ))}
        </div>
      )}
      {open && <SequenceModal seq={open} templates={data?.templates || []} onClose={() => { setOpen(null); reload() }} />}
      {ai && <AiCampaignModal onClose={() => setAi(false)} onDone={(seqId) => { setAi(false); reload(); if (seqId) setTimeout(() => setOpen({ id: seqId, name: 'AI campaign' }), 100) }} />}
    </>
  )
}
function AiCampaignModal({ onClose, onDone }: { onClose: () => void; onDone: (seqId?: string) => void }) {
  const [brief, setBrief] = useState('')
  const [busy, setBusy] = useState(false)
  const go = async () => {
    if (!brief.trim()) return
    setBusy(true)
    try { const r = await adminSend('/api/admin/communications/campaigns', 'POST', { action: 'ai_campaign', brief }) as Row; if (r?.ok) { alert(`Built "${r.name}" — ${r.steps} email steps generated. Review the steps, then enroll the audience.`); onDone(r.sequence_id as string) } else alert((r?.error as string) || 'Failed') }
    catch (e) { alert(String(e instanceof Error ? e.message : e)) } finally { setBusy(false) }
  }
  return (
    <Modal open onClose={onClose} title="✦ AI Campaign Builder">
      <div style={{ fontSize: 13, color: T.sub, marginBottom: 10 }}>Describe the campaign — AI plans the audience, writes and designs every email, and builds the sequence. Everything is editable after.</div>
      <textarea className="a-input" style={{ minHeight: 100, marginBottom: 8 }} placeholder="e.g. A 21-day nurture for people who completed the Business Growth Quiz but haven't booked a strategy call — build trust, share case studies, handle objections, and drive a booking." value={brief} onChange={(e) => setBrief(e.target.value)} />
      {['21-day Fast Forward nurture for quiz completers', 'Win-back for customers who churned', '5-email welcome for new leads'].map((s) => <button key={s} onClick={() => setBrief(s)} style={{ display: 'inline-block', margin: '0 6px 6px 0', border: `1px solid ${T.border}`, background: '#fafbfa', borderRadius: 999, padding: '4px 10px', fontSize: 11.5, color: T.sub, cursor: 'pointer' }}>{s}</button>)}
      <div style={{ marginTop: 8 }}><Button disabled={busy || !brief.trim()} onClick={go}>{busy ? 'Building campaign…' : 'Build campaign'}</Button></div>
    </Modal>
  )
}
function SequenceModal({ seq, templates, onClose }: { seq: Row; templates: Row[]; onClose: () => void }) {
  const { data, reload } = useAdminFetch<{ steps: Row[]; enrolled: number }>(`/api/admin/communications/campaigns?view=sequence&id=${seq.id}`)
  const [step, setStep] = useState<Row>({ delay_hours: 24 })
  const [email, setEmail] = useState('')
  const addStep = async () => { if (!step.template_id) { alert('Pick a template'); return } await adminSend('/api/admin/communications/campaigns', 'POST', { action: 'add_step', sequence_id: seq.id, ...step }); setStep({ delay_hours: 24 }); reload() }
  const delStep = async (id: string) => { await adminSend('/api/admin/communications/campaigns', 'POST', { action: 'delete_step', id }); reload() }
  const enroll = async () => { if (!email.trim()) return; const r = await adminSend('/api/admin/communications/campaigns', 'POST', { action: 'enroll', sequence_id: seq.id, email }) as Row; alert(r?.ok ? 'Enrolled' : `Failed: ${r?.error}`); setEmail(''); reload() }
  const enrollAudience = async () => { if (!confirm('Enroll everyone matching this campaign\'s audience and activate the sequence?')) return; const r = await adminSend('/api/admin/communications/campaigns', 'POST', { action: 'enroll_audience', sequence_id: seq.id }) as Row; alert(`Enrolled ${r?.enrolled ?? 0} contacts — sequence is now active.`); reload() }
  return (
    <Modal open onClose={onClose} title={`${seq.name} · steps`}>
      {(data?.steps || []).map((s, i) => (
        <div key={s.id as string} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 0', borderBottom: `1px solid ${T.border}` }}>
          <span style={{ fontSize: 12, color: T.muted, width: 18 }}>{i + 1}</span>
          <span style={{ flex: 1, fontSize: 13, color: T.ink }}>{(templates.find((t) => t.id === s.template_id)?.name as string) || 'template'}</span>
          <span style={{ fontSize: 11.5, color: T.muted }}>wait {s.delay_hours as number}h</span>
          <button className="a-pill" style={{ cursor: 'pointer', border: 'none', background: '#eef2f0', color: T.danger }} onClick={() => delStep(s.id as string)}>✕</button>
        </div>
      ))}
      <div style={{ display: 'flex', gap: 8, margin: '12px 0', alignItems: 'center' }}>
        <select className="a-input" value={(step.template_id as string) || ''} onChange={(e) => setStep({ ...step, template_id: e.target.value })}><option value="">Template…</option>{templates.map((t) => <option key={t.id as string} value={t.id as string}>{t.name as string}</option>)}</select>
        <input className="a-input" type="number" style={{ width: 110 }} placeholder="wait hrs" value={step.delay_hours as number} onChange={(e) => setStep({ ...step, delay_hours: Number(e.target.value) })} />
        <Button onClick={addStep}>Add step</Button>
      </div>
      <div style={{ borderTop: `1px solid ${T.border}`, paddingTop: 12, display: 'flex', gap: 8, alignItems: 'center' }}>
        <input className="a-input" placeholder="Enroll one email…" value={email} onChange={(e) => setEmail(e.target.value)} />
        <Button variant="ghost" onClick={enroll}>Enroll</Button>
        <Button style={{ marginLeft: 'auto' }} onClick={enrollAudience}>Enroll target audience</Button>
      </div>
    </Modal>
  )
}

function Deliverability() {
  const { data, loading } = useAdminFetch<{ auth: Row }>('/api/admin/communications?view=deliverability')
  const a = data?.auth
  if (loading && !data) return <div className="skeleton" style={{ height: 90, borderRadius: 14, marginBottom: 14 }} />
  if (!a) return null
  const row = (label: string, ok: boolean, detail?: string) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5 }}>
      <span style={{ color: ok ? '#16a34a' : '#dc2626', fontWeight: 800 }}>{ok ? '✓' : '✕'}</span>
      <span style={{ width: 56, color: T.text }}>{label}</span>
      <span style={{ color: T.muted, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{ok ? (detail || 'configured') : 'not detected'}</span>
    </div>
  )
  const verified = !!(a.verified)
  return (
    <Card pad={16} style={{ marginBottom: 14, border: `1px solid ${verified ? '#bbf7d0' : '#fde68a'}`, background: verified ? '#f0fdf4' : '#fffbeb' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <span style={{ fontSize: 14, fontWeight: 800, color: T.ink }}>Deliverability · {a.domain as string}</span>
        <span className="a-pill" style={{ background: verified ? '#dcfce7' : '#fef3c7', color: verified ? '#16a34a' : '#d97706' }}>{verified ? 'Authenticated' : 'Action needed'}</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 6 }}>
        {row('SPF', !!(a.spf as Row)?.ok)}
        {row('DKIM', !!(a.dkim as Row)?.ok, (a.dkim as Row)?.selector as string)}
        {row('DMARC', !!(a.dmarc as Row)?.ok, (a.dmarc as Row)?.policy as string)}
      </div>
      {!verified && <div style={{ fontSize: 11.5, color: '#8a6d2a', marginTop: 8 }}>Add the SPF/DKIM/DMARC records from Resend → Domains for {a.domain as string}. Until verified, mail may land in spam.</div>}
    </Card>
  )
}

function Providers() {
  const { data, loading, reload } = useAdminFetch<{ providers: Row[] }>('/api/admin/communications?view=providers')
  const [busy, setBusy] = useState(false)
  const health = async () => { setBusy(true); try { await adminSend('/api/admin/communications', 'POST', { action: 'health_check' }); reload() } finally { setBusy(false) } }
  const save = async (p: Row, patch: Row) => { await adminSend('/api/admin/communications', 'POST', { action: 'save_provider', slug: p.slug, enabled: patch.enabled ?? p.enabled, priority: patch.priority ?? p.priority, config: patch.config ?? p.config }); reload() }
  const saveSecret = async (name: string, value: string) => { if (!value.trim()) return; await adminSend('/api/admin/communications', 'POST', { action: 'save_secret', name, value }); reload() }
  if (loading && !data) return <div className="skeleton" style={{ height: 200, borderRadius: 14 }} />
  return (
    <>
      <Deliverability />
      <div style={{ marginBottom: 14 }}><Button disabled={busy} onClick={health}>{busy ? 'Checking…' : 'Run health check'}</Button></div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(340px,1fr))', gap: 14 }}>
        {(data?.providers || []).map((p) => (
          <Card key={p.slug as string} pad={18}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <span style={{ width: 9, height: 9, borderRadius: '50%', background: p.configured ? '#16a34a' : '#9ca3af' }} />
              <span style={{ fontSize: 15, fontWeight: 800, color: T.ink, flex: 1 }}>{p.name as string}</span>
              <span className="a-pill" style={{ background: '#eef2f0', color: T.sub }}>{p.kind as string}</span>
            </div>
            <div style={{ fontSize: 11.5, color: T.muted, marginBottom: 10 }}>{(p.capabilities as string[] || []).slice(0, 5).join(' · ')}</div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 10 }}>
              <label style={{ fontSize: 12.5, color: T.text, display: 'flex', alignItems: 'center', gap: 5 }}><input type="checkbox" checked={!!p.enabled} onChange={(e) => save(p, { enabled: e.target.checked })} /> Enabled</label>
              <label style={{ fontSize: 12.5, color: T.text, marginLeft: 'auto' }}>Priority <input className="a-input" type="number" style={{ width: 64, display: 'inline-block', marginLeft: 4 }} defaultValue={p.priority as number} onBlur={(e) => save(p, { priority: Number(e.target.value) })} /></label>
            </div>
            <div style={{ borderTop: `1px solid ${T.border}`, paddingTop: 10 }}>
              <div style={{ fontSize: 11.5, fontWeight: 700, color: T.sub, textTransform: 'uppercase', marginBottom: 6 }}>Credentials</div>
              {(p.requiredSecrets as Row[] || []).map((s) => (
                <div key={s.name as string} style={{ display: 'flex', gap: 6, marginBottom: 6, alignItems: 'center' }}>
                  <span style={{ fontSize: 11.5, color: T.muted, width: 150, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.name as string}</span>
                  {s.fromEnv ? <span className="a-pill" style={{ background: '#dcfce7', color: '#16a34a' }}>env ✓</span> : (
                    <input className="a-input" type="password" placeholder="paste key → blur to save" style={{ flex: 1 }} onBlur={(e) => saveSecret(s.name as string, e.target.value)} />
                  )}
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </>
  )
}

function Templates() {
  const { data, loading, reload } = useAdminFetch<{ templates: Row[] }>('/api/admin/communications?view=templates')
  const [edit, setEdit] = useState<Row | null>(null)
  const save = async () => { if (!(edit?.name as string)?.trim()) return; await adminSend('/api/admin/communications', 'POST', { action: 'save_template', ...edit }); setEdit(null); reload() }
  const del = async (id: string) => { if (!confirm('Delete template?')) return; await adminSend('/api/admin/communications', 'POST', { action: 'delete_template', id }); reload() }
  return (
    <>
      <div style={{ marginBottom: 14 }}><Button onClick={() => setEdit({ channel: 'email', category: 'general', body: '' })}>＋ New template</Button></div>
      {loading && !data ? <div className="skeleton" style={{ height: 140 }} /> : (data?.templates || []).length === 0 ? <EmptyState title="No templates yet" /> : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 12 }}>
          {(data?.templates || []).map((t) => (
            <Card key={t.id as string} pad={16}>
              <div style={{ display: 'flex', gap: 6, marginBottom: 4 }}><span style={{ fontSize: 14, fontWeight: 700, color: T.ink, flex: 1 }}>{t.name as string}</span><span className="a-pill" style={{ background: '#eef2f0', color: T.sub }}>{t.channel as string}</span></div>
              <div style={{ fontSize: 12, color: T.sub, marginBottom: 10, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{(t.subject as string) || (t.body as string)}</div>
              <div style={{ display: 'flex', gap: 6 }}><Button variant="ghost" onClick={() => setEdit(t)}>Edit</Button><button className="a-pill" style={{ cursor: 'pointer', border: 'none', background: '#eef2f0', color: T.danger, marginLeft: 'auto' }} onClick={() => del(t.id as string)}>✕</button></div>
            </Card>
          ))}
        </div>
      )}
      {edit && (
        <Modal open onClose={() => setEdit(null)} title={edit.id ? 'Edit template' : 'New template'}>
          <input className="a-input" style={{ marginBottom: 10 }} placeholder="Template name" value={(edit.name as string) || ''} onChange={(e) => setEdit({ ...edit, name: e.target.value })} />
          <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
            <select className="a-input" value={(edit.channel as string) || 'email'} onChange={(e) => setEdit({ ...edit, channel: e.target.value })}><option value="email">email</option><option value="sms">sms</option></select>
            <input className="a-input" placeholder="category" value={(edit.category as string) || ''} onChange={(e) => setEdit({ ...edit, category: e.target.value })} />
          </div>
          {edit.channel !== 'sms' && <input className="a-input" style={{ marginBottom: 10 }} placeholder="Subject" value={(edit.subject as string) || ''} onChange={(e) => setEdit({ ...edit, subject: e.target.value })} />}
          <textarea className="a-input" style={{ minHeight: 160, marginBottom: 10 }} placeholder="Body — use {{name}} {{first_name}}" value={(edit.body as string) || ''} onChange={(e) => setEdit({ ...edit, body: e.target.value })} />
          <Button onClick={save}>Save template</Button>
        </Modal>
      )}
    </>
  )
}

function Senders() {
  const { data, loading, reload } = useAdminFetch<{ senders: Row[] }>('/api/admin/communications?view=senders')
  const [edit, setEdit] = useState<Row | null>(null)
  const save = async () => { if (!(edit?.email as string)?.trim()) return; await adminSend('/api/admin/communications', 'POST', { action: 'save_sender', ...edit }); setEdit(null); reload() }
  return (
    <>
      <div style={{ marginBottom: 14 }}><Button onClick={() => setEdit({ enabled: true })}>＋ New sender identity</Button></div>
      {loading && !data ? <div className="skeleton" style={{ height: 120 }} /> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {(data?.senders || []).map((s) => (
            <Card key={s.id as string} pad={14}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ flex: 1 }}><b style={{ color: T.ink }}>{s.name as string}</b> <span style={{ color: T.muted, fontSize: 12.5 }}>&lt;{s.email as string}&gt;</span>{s.is_default ? <span className="a-pill" style={{ marginLeft: 8, background: '#dcfce7', color: '#16a34a' }}>default</span> : null}</div>
                <Button variant="ghost" onClick={() => setEdit(s)}>Edit</Button>
              </div>
            </Card>
          ))}
        </div>
      )}
      {edit && (
        <Modal open onClose={() => setEdit(null)} title="Sender identity">
          <input className="a-input" style={{ marginBottom: 10 }} placeholder="Display name" value={(edit.name as string) || ''} onChange={(e) => setEdit({ ...edit, name: e.target.value })} />
          <input className="a-input" style={{ marginBottom: 10 }} placeholder="From email (must be on a verified domain)" value={(edit.email as string) || ''} onChange={(e) => setEdit({ ...edit, email: e.target.value })} />
          <input className="a-input" style={{ marginBottom: 10 }} placeholder="Reply-to (optional)" value={(edit.reply_to as string) || ''} onChange={(e) => setEdit({ ...edit, reply_to: e.target.value })} />
          <input className="a-input" style={{ marginBottom: 10 }} placeholder="Signature (optional)" value={(edit.signature as string) || ''} onChange={(e) => setEdit({ ...edit, signature: e.target.value })} />
          <label style={{ fontSize: 13, color: T.text, display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}><input type="checkbox" checked={!!edit.is_default} onChange={(e) => setEdit({ ...edit, is_default: e.target.checked })} /> Default sender</label>
          <Button onClick={save}>Save sender</Button>
        </Modal>
      )}
    </>
  )
}
