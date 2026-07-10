'use client'
/* CRM · Settings — manage reusable tags (colors) and custom field definitions. */
import { useState } from 'react'
import Link from 'next/link'
import { T, Card, Button, Input, Select, Field, TagPill, EmptyState, PageHeader, useAdminFetch, adminSend } from '@/components/admin/ui'

type Row = Record<string, unknown>
const FIELD_TYPES = ['text', 'textarea', 'number', 'currency', 'date', 'boolean', 'dropdown', 'multi_select', 'url', 'email', 'phone']

export default function CrmSettings() {
  return (
    <>
      <PageHeader title="CRM Settings" subtitle="Pipeline stages, tags & custom fields" actions={<Link href="/admin/crm"><Button variant="ghost">← Contacts</Button></Link>} />
      <div style={{ marginBottom: 18 }}><PipelineManager /></div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(320px,1fr))', gap: 18 }}>
        <TagsManager />
        <FieldsManager />
      </div>
    </>
  )
}

function PipelineManager() {
  const { data, reload } = useAdminFetch<{ pipelines: Row[] }>('/api/admin/crm/pipelines')
  const pipeline = (data?.pipelines || [])[0] as Row | undefined
  const stages = (pipeline?.stages as Row[]) || []
  const [name, setName] = useState('')
  const [color, setColor] = useState('#60a5fa')
  const addStage = async () => {
    if (!name.trim() || !pipeline) return
    await adminSend('/api/admin/crm/pipelines/stages', 'POST', { pipeline_id: pipeline.id, name, color })
    setName(''); reload()
  }
  const patchStage = async (id: string, patch: Row) => { await adminSend('/api/admin/crm/pipelines/stages', 'PATCH', { id, ...patch }); reload() }
  const archive = async (id: string) => {
    try { await adminSend(`/api/admin/crm/pipelines/stages?id=${id}`, 'DELETE'); reload() }
    catch (e) { alert(String(e instanceof Error ? e.message : e)) }
  }
  const move = async (idx: number, dir: -1 | 1) => {
    const order = stages.map((s) => s.id as string)
    const j = idx + dir
    if (j < 0 || j >= order.length) return
    ;[order[idx], order[j]] = [order[j], order[idx]]
    await adminSend('/api/admin/crm/pipelines/stages', 'PATCH', { order }); reload()
  }
  return (
    <Card>
      <h3 style={{ fontSize: 15, fontWeight: 700, color: T.ink, marginBottom: 14 }}>Pipeline stages{pipeline ? ` · ${pipeline.name as string}` : ''}</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
        {stages.map((s, i) => (
          <div key={s.id as string} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderRadius: 8, background: '#fafbfa', border: `1px solid ${T.border}` }}>
            <input type="color" value={(s.color as string) || '#6b7280'} onChange={(e) => patchStage(s.id as string, { color: e.target.value })} style={{ width: 30, height: 26, border: 'none', background: 'none', cursor: 'pointer' }} />
            <span style={{ flex: 1, fontSize: 14, fontWeight: 500, color: T.text }}>{s.name as string}</span>
            {s.is_won ? <span className="a-pill" style={{ background: '#dcfce7', color: '#16a34a' }}>won</span> : null}
            {s.is_lost ? <span className="a-pill" style={{ background: '#fee2e2', color: '#dc2626' }}>lost</span> : null}
            <button onClick={() => move(i, -1)} style={arrowBtn} disabled={i === 0}>↑</button>
            <button onClick={() => move(i, 1)} style={arrowBtn} disabled={i === stages.length - 1}>↓</button>
            <button onClick={() => archive(s.id as string)} style={{ background: 'none', border: 'none', color: T.danger, fontSize: 13, cursor: 'pointer', fontWeight: 600 }}>Archive</button>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <Input placeholder="New stage name" value={name} onChange={(e) => setName(e.target.value)} style={{ flex: 1 }} />
        <input type="color" value={color} onChange={(e) => setColor(e.target.value)} style={{ width: 42, height: 40, border: 'none', background: 'none', cursor: 'pointer' }} />
        <Button disabled={!name.trim()} onClick={addStage}>Add stage</Button>
      </div>
    </Card>
  )
}

const arrowBtn: React.CSSProperties = { background: '#eef0ee', border: 'none', borderRadius: 6, width: 26, height: 26, cursor: 'pointer', color: T.sub, fontSize: 13 }

function TagsManager() {
  const { data, reload } = useAdminFetch<{ tags: Row[] }>('/api/admin/crm/tags')
  const [name, setName] = useState('')
  const [color, setColor] = useState('#225840')
  const add = async () => { if (!name.trim()) return; await adminSend('/api/admin/crm/tags', 'POST', { name, color }); setName(''); reload() }
  const del = async (id: string) => { await adminSend(`/api/admin/crm/tags?id=${id}`, 'DELETE'); reload() }
  return (
    <Card>
      <h3 style={{ fontSize: 15, fontWeight: 700, color: T.ink, marginBottom: 14 }}>Tags</h3>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <Input placeholder="Tag name" value={name} onChange={(e) => setName(e.target.value)} style={{ flex: 1 }} />
        <input type="color" value={color} onChange={(e) => setColor(e.target.value)} style={{ width: 42, height: 40, border: 'none', background: 'none', cursor: 'pointer' }} />
        <Button disabled={!name.trim()} onClick={add}>Add</Button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {(data?.tags || []).length === 0 ? <EmptyState title="No tags yet" /> : (data?.tags || []).map((t) => (
          <div key={t.id as string} style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'space-between' }}>
            <TagPill label={t.name as string} color={(t.color as string) || T.green} />
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <span style={{ fontSize: 12, color: T.muted }}>{(t.count as number) || 0} contacts</span>
              <button onClick={() => del(t.id as string)} style={{ background: 'none', border: 'none', color: T.danger, fontSize: 13, cursor: 'pointer', fontWeight: 600 }}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}

function FieldsManager() {
  const { data, reload } = useAdminFetch<{ fields: Row[] }>('/api/admin/crm/custom-fields')
  const [label, setLabel] = useState('')
  const [type, setType] = useState('text')
  const add = async () => { if (!label.trim()) return; await adminSend('/api/admin/crm/custom-fields', 'POST', { label, type }); setLabel(''); reload() }
  const del = async (id: string) => { await adminSend(`/api/admin/crm/custom-fields?id=${id}`, 'DELETE'); reload() }
  return (
    <Card>
      <h3 style={{ fontSize: 15, fontWeight: 700, color: T.ink, marginBottom: 14 }}>Custom fields</h3>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <Input placeholder="Field label" value={label} onChange={(e) => setLabel(e.target.value)} style={{ flex: 1 }} />
        <Select value={type} onChange={(e) => setType(e.target.value)} style={{ width: 130 }}>{FIELD_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}</Select>
        <Button disabled={!label.trim()} onClick={add}>Add</Button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {(data?.fields || []).length === 0 ? <EmptyState title="No custom fields" /> : (data?.fields || []).map((f) => (
          <div key={f.id as string} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', borderRadius: 8, background: '#fafbfa', border: `1px solid ${T.border}` }}>
            <div><span style={{ fontSize: 14, fontWeight: 500, color: T.text }}>{f.label as string}</span> <span style={{ fontSize: 12, color: T.muted }}>· {f.type as string}</span></div>
            <button onClick={() => del(f.id as string)} style={{ background: 'none', border: 'none', color: T.danger, fontSize: 13, cursor: 'pointer', fontWeight: 600 }}>Delete</button>
          </div>
        ))}
      </div>
    </Card>
  )
}
