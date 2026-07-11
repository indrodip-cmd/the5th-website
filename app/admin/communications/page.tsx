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
const TABS = ['Dashboard', 'Messages', 'Compose', 'Designs', 'Providers', 'Templates', 'Senders'] as const
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

function Providers() {
  const { data, loading, reload } = useAdminFetch<{ providers: Row[] }>('/api/admin/communications?view=providers')
  const [busy, setBusy] = useState(false)
  const health = async () => { setBusy(true); try { await adminSend('/api/admin/communications', 'POST', { action: 'health_check' }); reload() } finally { setBusy(false) } }
  const save = async (p: Row, patch: Row) => { await adminSend('/api/admin/communications', 'POST', { action: 'save_provider', slug: p.slug, enabled: patch.enabled ?? p.enabled, priority: patch.priority ?? p.priority, config: patch.config ?? p.config }); reload() }
  const saveSecret = async (name: string, value: string) => { if (!value.trim()) return; await adminSend('/api/admin/communications', 'POST', { action: 'save_secret', name, value }); reload() }
  if (loading && !data) return <div className="skeleton" style={{ height: 200, borderRadius: 14 }} />
  return (
    <>
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
