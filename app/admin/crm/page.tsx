'use client'
/* CRM · Contacts — the list view. Filter, search, page and open any contact. */
import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  T, Card, Button, Input, Select, TagPill, Avatar, EmptyState, Modal, Field,
  PageHeader, useAdminFetch, adminSend, fmtDate,
} from '@/components/admin/ui'

const PIPELINE = ['new', 'qualified', 'discovery', 'call_booked', 'call_completed', 'proposal', 'won', 'closed', 'lost', 'customer']
const LIFECYCLE = ['lead', 'mql', 'sql', 'opportunity', 'customer', 'evangelist']
const CLOSED = ['won', 'closed', 'customer']

function stagePill(s: string) {
  const bg = CLOSED.includes(s) ? '#e8f0ea' : s === 'lost' ? '#fdeaea' : s === 'call_booked' ? '#e0f2fe' : '#f3f4f6'
  const color = CLOSED.includes(s) ? T.green : s === 'lost' ? '#b91c1c' : s === 'call_booked' ? '#0369a1' : '#4b5563'
  return <span className="a-pill" style={{ background: bg, color }}>{s.replace(/_/g, ' ')}</span>
}

interface Contact {
  id: string; email: string; name: string | null; company: string | null; country: string | null
  pipeline_stage: string; lifecycle_stage: string; lead_score: number; source: string | null
  tags: string[]; call_booked: boolean; last_activity_at: string | null
}

export default function CrmContactsPage() {
  const router = useRouter()
  const initialQ = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('q') || '' : ''
  const [q, setQ] = useState(initialQ)
  const [lifecycle, setLifecycle] = useState('')
  const [pipeline, setPipeline] = useState('')
  const [tag, setTag] = useState('')
  const [bookedOnly, setBookedOnly] = useState(false)
  const [page, setPage] = useState(1)
  const [showNew, setShowNew] = useState(false)

  const qs = useMemo(() => {
    const p = new URLSearchParams()
    if (q.trim()) p.set('q', q.trim())
    if (lifecycle) p.set('lifecycle', lifecycle)
    if (pipeline) p.set('pipeline', pipeline)
    if (tag) p.set('tag', tag)
    if (bookedOnly) p.set('bookedCall', '1')
    p.set('page', String(page))
    p.set('pageSize', '50')
    return p.toString()
  }, [q, lifecycle, pipeline, tag, bookedOnly, page])

  const { data, loading, reload } = useAdminFetch<{ contacts: Contact[]; total: number; page: number; pageSize: number }>(`/api/admin/crm?${qs}`, [qs])
  const contacts = data?.contacts || []
  const total = data?.total || 0
  const pages = Math.max(1, Math.ceil(total / (data?.pageSize || 50)))

  const [selected, setSelected] = useState<Set<string>>(new Set())
  const toggle = (id: string) => setSelected((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n })
  const toggleAll = () => setSelected((s) => s.size === contacts.length ? new Set() : new Set(contacts.map((c) => c.id)))
  const bulk = async (action: string) => {
    const ids = [...selected]
    if (!ids.length) return
    if (action === 'delete' && !confirm(`Delete ${ids.length} contact(s)?`)) return
    let extra: Record<string, unknown> = {}
    if (action === 'assign_owner') { const owner = prompt('Assign owner (email or name):'); if (owner === null) return; extra = { owner } }
    if (action === 'add_tags') { const tag = prompt('Tag to add:'); if (!tag) return; extra = { tags: [tag] } }
    const res = await adminSend('/api/admin/crm/bulk', 'POST', { action, ids, ...extra }) as { csv?: string }
    if (action === 'export' && res?.csv) {
      const blob = new Blob([res.csv], { type: 'text/csv' }); const url = URL.createObjectURL(blob)
      const a = document.createElement('a'); a.href = url; a.download = 'contacts.csv'; a.click(); URL.revokeObjectURL(url)
    }
    setSelected(new Set()); reload()
  }

  return (
    <>
      <PageHeader
        title="Contacts"
        subtitle={`${total.toLocaleString()} ${total === 1 ? 'contact' : 'contacts'} · one source of truth`}
        actions={<>
          <Link href="/admin/crm/tasks"><Button variant="ghost">Tasks</Button></Link>
          <Link href="/admin/crm/settings"><Button variant="ghost">Settings</Button></Link>
          <Button onClick={() => setShowNew(true)}>+ New contact</Button>
        </>}
      />

      <Card pad={16} style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <form onSubmit={(e) => { e.preventDefault(); setPage(1) }} style={{ flex: 1, minWidth: 220 }}>
            <Input placeholder="Search name, email, phone, company…" value={q} onChange={(e) => setQ(e.target.value)} />
          </form>
          <Select value={lifecycle} onChange={(e) => { setLifecycle(e.target.value); setPage(1) }} style={{ width: 150 }}>
            <option value="">All lifecycles</option>
            {LIFECYCLE.map((l) => <option key={l} value={l}>{l}</option>)}
          </Select>
          <Select value={pipeline} onChange={(e) => { setPipeline(e.target.value); setPage(1) }} style={{ width: 160 }}>
            <option value="">All stages</option>
            {PIPELINE.map((s) => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
          </Select>
          <Input placeholder="Tag" value={tag} onChange={(e) => { setTag(e.target.value); setPage(1) }} style={{ width: 120 }} />
          <label style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 13, color: T.sub, cursor: 'pointer' }}>
            <input type="checkbox" checked={bookedOnly} onChange={(e) => { setBookedOnly(e.target.checked); setPage(1) }} /> Booked a call
          </label>
        </div>
      </Card>

      {selected.size > 0 && (
        <Card pad={12} style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: T.ink }}>{selected.size} selected</span>
          <Button variant="ghost" onClick={() => bulk('assign_owner')}>Assign owner</Button>
          <Button variant="ghost" onClick={() => bulk('add_tags')}>Add tag</Button>
          <Button variant="ghost" onClick={() => bulk('export')}>Export CSV</Button>
          <Button variant="ghost" onClick={() => bulk('delete')}><span style={{ color: T.danger }}>Delete</span></Button>
          <button onClick={() => setSelected(new Set())} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: T.sub, cursor: 'pointer', fontSize: 13 }}>Clear</button>
        </Card>
      )}

      <Card pad={0} style={{ overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="a-table">
            <thead>
              <tr>
                <th style={{ width: 34 }}><input type="checkbox" checked={contacts.length > 0 && selected.size === contacts.length} onChange={toggleAll} /></th>
                {['Contact', 'Stage', 'Score', 'Tags', 'Source', 'Last activity'].map((c) => <th key={c}>{c}</th>)}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i}>{Array.from({ length: 7 }).map((_, j) => <td key={j}><div className="skeleton" style={{ height: 14, width: j === 1 ? 180 : 70 }} /></td>)}</tr>
                ))
              ) : contacts.length === 0 ? (
                <tr><td colSpan={7}><EmptyState title="No contacts match" hint="Adjust filters or add a contact." /></td></tr>
              ) : contacts.map((c) => (
                <tr key={c.id} className="admin-row" style={{ cursor: 'pointer' }} onClick={() => router.push(`/admin/crm/${c.id}`)}>
                  <td onClick={(e) => e.stopPropagation()}><input type="checkbox" checked={selected.has(c.id)} onChange={() => toggle(c.id)} /></td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                      <Avatar name={c.name} email={c.email} size={34} />
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontWeight: 600, color: T.text }}>{c.name || '—'}</div>
                        <div style={{ fontSize: 12.5, color: T.sub }}>{c.email || c.country || ''}</div>
                      </div>
                    </div>
                  </td>
                  <td>{stagePill(c.pipeline_stage)}</td>
                  <td style={{ fontWeight: 600, color: c.lead_score >= 50 ? T.green : T.sub }}>{c.lead_score}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', maxWidth: 220 }}>
                      {(c.tags || []).slice(0, 3).map((t) => <TagPill key={t} label={t} />)}
                      {(c.tags || []).length > 3 && <span style={{ fontSize: 12, color: T.muted }}>+{c.tags.length - 3}</span>}
                    </div>
                  </td>
                  <td style={{ color: T.sub, fontSize: 13 }}>{c.source || '—'}</td>
                  <td style={{ color: T.sub, fontSize: 13, whiteSpace: 'nowrap' }}>{fmtDate(c.last_activity_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {pages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginTop: 18, alignItems: 'center' }}>
          <Button variant="ghost" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>← Prev</Button>
          <span style={{ fontSize: 13, color: T.sub }}>Page {page} of {pages}</span>
          <Button variant="ghost" disabled={page >= pages} onClick={() => setPage((p) => p + 1)}>Next →</Button>
        </div>
      )}

      <NewContactModal open={showNew} onClose={() => setShowNew(false)} onCreated={(id) => { setShowNew(false); if (id) router.push(`/admin/crm/${id}`); else reload() }} />
    </>
  )
}

function NewContactModal({ open, onClose, onCreated }: { open: boolean; onClose: () => void; onCreated: (id?: string) => void }) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', company: '', country: '', source: 'manual' })
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }))
  const submit = async () => {
    setErr(''); setBusy(true)
    try {
      const res = await adminSend('/api/admin/crm', 'POST', form) as { contact?: { id?: string } }
      onCreated(res?.contact?.id)
    } catch (e) { setErr(String(e instanceof Error ? e.message : e)) } finally { setBusy(false) }
  }
  return (
    <Modal open={open} onClose={onClose} title="New contact">
      <Field label="Name"><Input value={form.name} onChange={(e) => set('name', e.target.value)} autoFocus /></Field>
      <div style={{ display: 'flex', gap: 12 }}>
        <div style={{ flex: 1 }}><Field label="Email"><Input value={form.email} onChange={(e) => set('email', e.target.value)} /></Field></div>
        <div style={{ flex: 1 }}><Field label="Phone"><Input value={form.phone} onChange={(e) => set('phone', e.target.value)} /></Field></div>
      </div>
      <div style={{ display: 'flex', gap: 12 }}>
        <div style={{ flex: 1 }}><Field label="Company"><Input value={form.company} onChange={(e) => set('company', e.target.value)} /></Field></div>
        <div style={{ flex: 1 }}><Field label="Country"><Input value={form.country} onChange={(e) => set('country', e.target.value)} /></Field></div>
      </div>
      {err && <div style={{ color: T.danger, fontSize: 13, marginBottom: 10 }}>{err}</div>}
      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
        <Button disabled={busy || (!form.email && !form.phone)} onClick={submit}>{busy ? 'Creating…' : 'Create contact'}</Button>
      </div>
    </Modal>
  )
}
