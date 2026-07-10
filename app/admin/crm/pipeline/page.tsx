'use client'
/* CRM · Pipeline — Kanban of opportunities with pointer (mouse+touch) drag-drop. */
import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import {
  T, Card, Button, Input, Select, Textarea, Field, Avatar, TagPill, EmptyState, Modal, Drawer,
  PageHeader, useAdminFetch, adminSend, fmtDate, money, leadBand, bandColor,
} from '@/components/admin/ui'

type Row = Record<string, unknown>
interface Stage { id: string; name: string; color: string; opportunities: Opp[]; count: number; value: number; is_won?: boolean; is_lost?: boolean }
interface Opp { id: string; name: string; value: number; currency: string; products: string[]; stage_id: string; contact: Row | null; next_task: Row | null }
interface Board { pipeline: Row | null; stages: Stage[] }

export default function PipelinePage() {
  const { data: pipeData } = useAdminFetch<{ pipelines: Row[] }>('/api/admin/crm/pipelines')
  const pipelines = pipeData?.pipelines || []
  const [pipelineId, setPipelineId] = useState<string>('')
  const url = `/api/admin/crm/opportunities?board=1${pipelineId ? `&pipeline=${pipelineId}` : ''}`
  const { data, loading, reload, setData } = useAdminFetch<Board>(url, [url])
  const [board, setBoard] = useState<Board | null>(null)
  useEffect(() => { if (data) setBoard(data) }, [data])

  const [showNew, setShowNew] = useState(false)
  const [openOpp, setOpenOpp] = useState<string | null>(null)

  // ── Pointer drag-and-drop ──
  const dragRef = useRef<{ oppId: string; fromStage: string; startX: number; startY: number; active: boolean; hover: string | null }>({ oppId: '', fromStage: '', startX: 0, startY: 0, active: false, hover: null })
  const [drag, setDrag] = useState<{ x: number; y: number; label: string } | null>(null)
  const [hover, setHover] = useState<string | null>(null)

  const onMove = useCallback((e: PointerEvent) => {
    const d = dragRef.current
    if (!d.oppId) return
    if (!d.active && Math.hypot(e.clientX - d.startX, e.clientY - d.startY) < 6) return
    d.active = true
    const el = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement | null
    const col = el?.closest('[data-stage]') as HTMLElement | null
    d.hover = col?.getAttribute('data-stage') || null
    setHover(d.hover)
    setDrag({ x: e.clientX, y: e.clientY, label: d.oppId })
  }, [])

  const move = useCallback(async (oppId: string, fromStage: string, toStage: string) => {
    setBoard((b) => {
      if (!b) return b
      const stages = b.stages.map((s) => ({ ...s, opportunities: [...s.opportunities] }))
      const from = stages.find((s) => s.id === fromStage); const to = stages.find((s) => s.id === toStage)
      if (!from || !to) return b
      const idx = from.opportunities.findIndex((o) => o.id === oppId)
      if (idx < 0) return b
      const [card] = from.opportunities.splice(idx, 1)
      card.stage_id = toStage; to.opportunities.push(card)
      for (const s of stages) { s.count = s.opportunities.length; s.value = s.opportunities.reduce((sum, o) => sum + Number(o.value || 0), 0) }
      return { ...b, stages }
    })
    try { await adminSend(`/api/admin/crm/opportunities/${oppId}`, 'PATCH', { stage_id: toStage, position: 9999 }) }
    catch { reload() }
  }, [reload])

  const onUp = useCallback(() => {
    window.removeEventListener('pointermove', onMove)
    const d = dragRef.current
    const { oppId, fromStage, active, hover: hv } = d
    dragRef.current = { oppId: '', fromStage: '', startX: 0, startY: 0, active: false, hover: null }
    setDrag(null); setHover(null)
    if (!oppId) return
    if (!active) { setOpenOpp(oppId); return } // it was a click
    if (hv && hv !== fromStage) move(oppId, fromStage, hv)
  }, [onMove, move])

  const onCardDown = (e: React.PointerEvent, oppId: string, fromStage: string) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return
    dragRef.current = { oppId, fromStage, startX: e.clientX, startY: e.clientY, active: false, hover: null }
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp, { once: true })
  }
  useEffect(() => () => window.removeEventListener('pointermove', onMove), [onMove])

  const stages = board?.stages || []

  return (
    <>
      <PageHeader
        title="Pipeline"
        subtitle={board?.pipeline ? String(board.pipeline.name) : 'Sales'}
        actions={<>
          {pipelines.length > 1 && (
            <Select value={pipelineId} onChange={(e) => setPipelineId(e.target.value)} style={{ width: 160 }}>
              {pipelines.map((p) => <option key={p.id as string} value={p.id as string}>{p.name as string}</option>)}
            </Select>
          )}
          <Link href="/admin/crm/settings"><Button variant="ghost">Stages</Button></Link>
          <Button onClick={() => setShowNew(true)}>+ Opportunity</Button>
        </>}
      />

      {loading && !board ? (
        <div style={{ display: 'flex', gap: 14 }}>{Array.from({ length: 5 }).map((_, i) => <div key={i} className="skeleton" style={{ height: 400, flex: 1, borderRadius: 12 }} />)}</div>
      ) : (
        <div style={{ display: 'flex', gap: 14, overflowX: 'auto', paddingBottom: 12, alignItems: 'flex-start' }}>
          {stages.map((s) => (
            <div key={s.id} data-stage={s.id}
              style={{ minWidth: 270, width: 270, flexShrink: 0, background: hover === s.id ? '#eef7f1' : '#f0f1f0', borderRadius: 12, border: `1.5px solid ${hover === s.id ? T.green2 : 'transparent'}`, transition: 'background .12s, border-color .12s', maxHeight: '78vh', display: 'flex', flexDirection: 'column' }}>
              <div style={{ padding: '12px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `2px solid ${s.color}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 9, height: 9, borderRadius: '50%', background: s.color }} />
                  <span style={{ fontSize: 13, fontWeight: 700, color: T.ink }}>{s.name}</span>
                  <span style={{ fontSize: 12, color: T.muted }}>{s.count}</span>
                </div>
                <span style={{ fontSize: 12, fontWeight: 600, color: T.sub }}>{money(s.value)}</span>
              </div>
              <div style={{ padding: 10, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 9, flex: 1 }}>
                {s.opportunities.length === 0 ? <div style={{ padding: '18px 8px', textAlign: 'center', color: T.muted, fontSize: 12 }}>Drop here</div>
                  : s.opportunities.map((o) => <OppCard key={o.id} opp={o} onDown={(e) => onCardDown(e, o.id, s.id)} dragging={drag?.label === o.id} />)}
              </div>
            </div>
          ))}
          {stages.length === 0 && <Card><EmptyState title="No stages" hint="Add stages in Settings." /></Card>}
        </div>
      )}

      {drag && <div style={{ position: 'fixed', left: drag.x + 6, top: drag.y + 6, pointerEvents: 'none', zIndex: 300, opacity: 0.9, transform: 'rotate(-2deg)' }}>
        <div style={{ width: 240, padding: 12, background: '#fff', borderRadius: 10, boxShadow: '0 12px 30px rgba(0,0,0,0.2)', border: `1px solid ${T.border}`, fontSize: 13, fontWeight: 600, color: T.ink }}>Moving…</div>
      </div>}

      <NewOpportunityModal open={showNew} stages={stages} onClose={() => setShowNew(false)} onCreated={() => { setShowNew(false); reload() }} />
      <Drawer open={!!openOpp} onClose={() => setOpenOpp(null)}>
        {openOpp && <OppDrawer id={openOpp} stages={stages} onClose={() => setOpenOpp(null)} onChanged={() => { reload() }} />}
      </Drawer>
    </>
  )
}

function OppCard({ opp, onDown, dragging }: { opp: Opp; onDown: (e: React.PointerEvent) => void; dragging: boolean }) {
  const c = opp.contact || {}
  const score = Number((c as Row).lead_score || 0)
  const b = leadBand(score)
  return (
    <div onPointerDown={onDown}
      style={{ background: '#fff', borderRadius: 10, border: `1px solid ${T.border}`, padding: 12, cursor: 'grab', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', opacity: dragging ? 0.4 : 1, touchAction: 'none', userSelect: 'none' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 8 }}>
        <Avatar name={(c as Row).name as string} email={(c as Row).email as string} size={30} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13.5, fontWeight: 600, color: T.ink, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{((c as Row).name as string) || opp.name}</div>
          {(c as Row).company ? <div style={{ fontSize: 12, color: T.muted }}>{(c as Row).company as string}</div> : null}
        </div>
        <span className="a-pill" style={{ background: bandColor(b) + '1a', color: bandColor(b), fontSize: 11 }}>{b}</span>
      </div>
      <div style={{ fontSize: 13, fontWeight: 700, color: T.green }}>{money(opp.value, opp.currency)}</div>
      {opp.products?.length ? <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginTop: 7 }}>{opp.products.slice(0, 2).map((p) => <TagPill key={p} label={p} />)}</div> : null}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 9, fontSize: 11.5, color: T.muted }}>
        <span>{(c as Row).call_booked ? '📅 booked' : ''}</span>
        <span>{opp.next_task ? `✓ ${(opp.next_task as Row).title as string}` : fmtDate((c as Row).last_activity_at as string)}</span>
      </div>
    </div>
  )
}

function NewOpportunityModal({ open, stages, onClose, onCreated }: { open: boolean; stages: Stage[]; onClose: () => void; onCreated: () => void }) {
  const [q, setQ] = useState('')
  const [picked, setPicked] = useState<Row | null>(null)
  const [name, setName] = useState('')
  const [value, setValue] = useState('')
  const [stageId, setStageId] = useState('')
  const [busy, setBusy] = useState(false)
  const { data } = useAdminFetch<{ contacts: Row[] }>(q.trim().length >= 2 ? `/api/admin/crm/search?q=${encodeURIComponent(q)}` : null, [q])
  const submit = async () => {
    if (!picked) return
    setBusy(true)
    try {
      await adminSend('/api/admin/crm/opportunities', 'POST', { contact_id: picked.id, name: name || undefined, value: Number(value) || 0, stage_id: stageId || undefined })
      onCreated()
    } finally { setBusy(false) }
  }
  return (
    <Modal open={open} onClose={onClose} title="New opportunity">
      {!picked ? (
        <>
          <Field label="Contact"><Input placeholder="Search name or email…" value={q} onChange={(e) => setQ(e.target.value)} autoFocus /></Field>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 220, overflowY: 'auto' }}>
            {(data?.contacts || []).map((c) => (
              <button key={c.id as string} onClick={() => { setPicked(c); setName(`${(c.name as string) || 'New'} — deal`) }}
                style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 8, borderRadius: 8, border: `1px solid ${T.border}`, background: '#fff', cursor: 'pointer', textAlign: 'left' }}>
                <Avatar name={c.name as string} email={c.email as string} size={28} />
                <div><div style={{ fontSize: 13, fontWeight: 600, color: T.ink }}>{(c.name as string) || '—'}</div><div style={{ fontSize: 12, color: T.sub }}>{c.email as string}</div></div>
              </button>
            ))}
          </div>
        </>
      ) : (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <Avatar name={picked.name as string} email={picked.email as string} size={32} />
            <div style={{ flex: 1 }}><div style={{ fontSize: 14, fontWeight: 600 }}>{picked.name as string}</div><div style={{ fontSize: 12, color: T.sub }}>{picked.email as string}</div></div>
            <button onClick={() => setPicked(null)} style={{ background: 'none', border: 'none', color: T.sub, cursor: 'pointer', fontSize: 13 }}>Change</button>
          </div>
          <Field label="Opportunity name"><Input value={name} onChange={(e) => setName(e.target.value)} /></Field>
          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ flex: 1 }}><Field label="Value ($)"><Input type="number" value={value} onChange={(e) => setValue(e.target.value)} /></Field></div>
            <div style={{ flex: 1 }}><Field label="Stage"><Select value={stageId} onChange={(e) => setStageId(e.target.value)}><option value="">First stage</option>{stages.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</Select></Field></div>
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <Button variant="ghost" onClick={onClose}>Cancel</Button>
            <Button disabled={busy} onClick={submit}>{busy ? 'Creating…' : 'Create'}</Button>
          </div>
        </>
      )}
    </Modal>
  )
}

function OppDrawer({ id, stages, onClose, onChanged }: { id: string; stages: Stage[]; onClose: () => void; onChanged: () => void }) {
  const { data, loading } = useAdminFetch<{ opportunity: Row; meetings: Row[]; tasks: Row[]; activities: Row[] }>(`/api/admin/crm/opportunities/${id}`)
  const [form, setForm] = useState<Row | null>(null)
  const [busy, setBusy] = useState(false)
  useEffect(() => { if (data?.opportunity) setForm(data.opportunity) }, [data])
  if (loading || !form) return <div style={{ padding: 24 }}><div className="skeleton" style={{ height: 120 }} /></div>
  const contact = (data?.opportunity?.contact as Row) || {}
  const set = (k: string, v: unknown) => setForm((f) => ({ ...(f as Row), [k]: v }))
  const save = async () => {
    setBusy(true)
    try {
      await adminSend(`/api/admin/crm/opportunities/${id}`, 'PATCH', {
        name: form.name, value: Number(form.value) || 0, currency: form.currency,
        probability: Number(form.probability) || 0, expected_close_date: form.expected_close_date || null,
        products: typeof form.products === 'string' ? String(form.products).split(',').map((s) => s.trim()).filter(Boolean) : form.products,
        owner: form.owner, notes: form.notes, stage_id: form.stage_id,
      })
      onChanged(); onClose()
    } finally { setBusy(false) }
  }
  const del = async () => { await adminSend(`/api/admin/crm/opportunities/${id}`, 'DELETE'); onChanged(); onClose() }
  const products = Array.isArray(form.products) ? (form.products as string[]).join(', ') : (form.products as string) || ''
  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ fontSize: 18, fontWeight: 800, color: T.ink }}>Opportunity</h2>
        <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 22, color: T.sub, cursor: 'pointer' }}>×</button>
      </div>
      {contact.id ? <Link href={`/admin/crm/${contact.id}`} style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', marginBottom: 16 }}>
        <Avatar name={contact.name as string} email={contact.email as string} size={34} />
        <div><div style={{ fontSize: 14, fontWeight: 600, color: T.ink }}>{(contact.name as string) || (contact.email as string)}</div><div style={{ fontSize: 12, color: T.green }}>View contact →</div></div>
      </Link> : null}
      <Field label="Name"><Input value={(form.name as string) || ''} onChange={(e) => set('name', e.target.value)} /></Field>
      <Field label="Stage"><Select value={(form.stage_id as string) || ''} onChange={(e) => set('stage_id', e.target.value)}>{stages.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</Select></Field>
      <div style={{ display: 'flex', gap: 12 }}>
        <div style={{ flex: 1 }}><Field label="Value ($)"><Input type="number" value={String(form.value ?? 0)} onChange={(e) => set('value', e.target.value)} /></Field></div>
        <div style={{ flex: 1 }}><Field label="Probability %"><Input type="number" value={String(form.probability ?? '')} onChange={(e) => set('probability', e.target.value)} /></Field></div>
      </div>
      <Field label="Expected close"><Input type="date" value={(form.expected_close_date as string) || ''} onChange={(e) => set('expected_close_date', e.target.value)} /></Field>
      <Field label="Products (comma-separated)"><Input value={products} onChange={(e) => set('products', e.target.value)} /></Field>
      <Field label="Owner"><Input value={(form.owner as string) || ''} onChange={(e) => set('owner', e.target.value)} /></Field>
      <Field label="Notes"><Textarea value={(form.notes as string) || ''} onChange={(e) => set('notes', e.target.value)} /></Field>
      {(data?.meetings?.length || 0) > 0 && (
        <div style={{ marginTop: 8, marginBottom: 14 }}>
          <div className="a-label">Meetings</div>
          {data!.meetings.map((m) => <div key={m.id as string} style={{ fontSize: 13, color: T.sub, padding: '4px 0' }}>◷ {(m.title as string) || 'Meeting'} · {fmtDate(m.starts_at as string)}</div>)}
        </div>
      )}
      <div style={{ display: 'flex', gap: 10, justifyContent: 'space-between', marginTop: 8 }}>
        <Button variant="ghost" onClick={del}><span style={{ color: T.danger }}>Delete</span></Button>
        <Button disabled={busy} onClick={save}>{busy ? 'Saving…' : 'Save'}</Button>
      </div>
    </div>
  )
}
