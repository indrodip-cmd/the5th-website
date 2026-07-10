'use client'
/* The Business Command Center grid — composes registered widgets per the
   admin's saved layout. Drag-reorder, resize (span), collapse, pin, hide;
   presets + custom saved layouts persisted per admin. Dependency-free. */
import { useCallback, useEffect, useRef, useState } from 'react'
import { T, Card, Button, PageHeader } from './ui'
import { WidgetDataProvider, getWidget, allWidgets } from './widgets'
import { PRESETS, DEFAULT_PRESET, type LayoutItem } from './widgets/presets'

const HEIGHTS: Record<string, number> = { sm: 96, md: 300, lg: 420 }

export default function DashboardGrid() {
  const [layout, setLayout] = useState<LayoutItem[]>([])
  const [editing, setEditing] = useState(false)
  const [dirty, setDirty] = useState(false)
  const [presetOpen, setPresetOpen] = useState(false)
  const [addOpen, setAddOpen] = useState(false)
  const [ready, setReady] = useState(false)

  // Load the admin's default layout (or a preset).
  useEffect(() => {
    let alive = true
    fetch('/api/admin/dashboards').then((r) => r.ok ? r.json() : null).then((d) => {
      if (!alive) return
      const def = (d?.dashboards || []).find((x: { is_default?: boolean }) => x.is_default) || (d?.dashboards || [])[0]
      const cached = typeof window !== 'undefined' ? window.localStorage.getItem('a5_dash') : null
      setLayout(def?.layout?.length ? def.layout : (cached ? JSON.parse(cached) : PRESETS[DEFAULT_PRESET].layout))
    }).catch(() => setLayout(PRESETS[DEFAULT_PRESET].layout)).finally(() => setReady(true))
    return () => { alive = false }
  }, [])

  const persist = useCallback(async (next: LayoutItem[]) => {
    setLayout(next); setDirty(true)
    try { window.localStorage.setItem('a5_dash', JSON.stringify(next)) } catch {}
  }, [])

  const save = async () => {
    try { await fetch('/api/admin/dashboards', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: 'My dashboard', layout, is_default: true }) }); setDirty(false) } catch {}
  }

  const applyPreset = (name: string) => { persist(PRESETS[name].layout.map((x) => ({ ...x }))); setPresetOpen(false) }
  const resize = (id: string) => persist(layout.map((it) => it.id === id ? { ...it, w: ((it.w % 4) + 1) as number } : it))
  const collapse = (id: string) => persist(layout.map((it) => it.id === id ? { ...it, collapsed: !it.collapsed } : it))
  const pin = (id: string) => persist(layout.map((it) => it.id === id ? { ...it, pinned: !it.pinned } : it))
  const hide = (id: string) => persist(layout.map((it) => it.id === id ? { ...it, hidden: true } : it))
  const addWidget = (id: string) => {
    const exists = layout.find((it) => it.id === id)
    const def = getWidget(id)
    if (exists) persist(layout.map((it) => it.id === id ? { ...it, hidden: false } : it))
    else persist([...layout, { id, w: def?.defaultW || 1 }])
    setAddOpen(false)
  }

  // pinned first, then declared order; hidden excluded from render
  const visible = [...layout].filter((it) => !it.hidden && getWidget(it.id))
    .sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0))
  const hidden = layout.filter((it) => it.hidden)
  const available = allWidgets().filter((w) => !layout.find((it) => it.id === w.id && !it.hidden))

  // ── pointer drag-reorder (edit mode) ──
  const dragRef = useRef<{ id: string; over: string | null } | null>(null)
  const [dragId, setDragId] = useState<string | null>(null)
  const [overId, setOverId] = useState<string | null>(null)
  const onMove = useCallback((e: PointerEvent) => {
    if (!dragRef.current) return
    const el = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement | null
    const cell = el?.closest('[data-cell]') as HTMLElement | null
    const over = cell?.getAttribute('data-cell') || null
    dragRef.current.over = over; setOverId(over)
  }, [])
  const onUp = useCallback(() => {
    window.removeEventListener('pointermove', onMove)
    const d = dragRef.current; dragRef.current = null; setDragId(null); setOverId(null)
    if (!d || !d.over || d.over === d.id) return
    setLayout((prev) => {
      const arr = [...prev]
      const from = arr.findIndex((x) => x.id === d.id); const to = arr.findIndex((x) => x.id === d.over)
      if (from < 0 || to < 0) return prev
      const [m] = arr.splice(from, 1); arr.splice(to, 0, m)
      try { window.localStorage.setItem('a5_dash', JSON.stringify(arr)) } catch {}
      setDirty(true); return arr
    })
  }, [onMove])
  const startDrag = (e: React.PointerEvent, id: string) => {
    if (!editing) return
    dragRef.current = { id, over: null }; setDragId(id)
    window.addEventListener('pointermove', onMove); window.addEventListener('pointerup', onUp, { once: true })
  }
  useEffect(() => () => window.removeEventListener('pointermove', onMove), [onMove])

  if (!ready) return <div className="skeleton" style={{ height: 300, borderRadius: 14 }} />

  return (
    <WidgetDataProvider>
      <PageHeader title="Business Command Center" subtitle="Run The5th from one workspace"
        actions={<>
          <div style={{ position: 'relative' }}>
            <Button variant="ghost" onClick={() => setPresetOpen((o) => !o)}>Presets ▾</Button>
            {presetOpen && (
              <div style={{ position: 'absolute', right: 0, top: 40, background: '#fff', border: `1px solid ${T.border}`, borderRadius: 10, boxShadow: '0 8px 30px rgba(0,0,0,0.14)', zIndex: 50, minWidth: 160, overflow: 'hidden' }}>
                {Object.keys(PRESETS).map((p) => <button key={p} onClick={() => applyPreset(p)} style={{ display: 'block', width: '100%', textAlign: 'left', padding: '10px 14px', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: T.text, fontFamily: 'inherit' }}>{p}</button>)}
              </div>
            )}
          </div>
          {editing && <Button variant="ghost" onClick={() => setAddOpen((o) => !o)}>+ Widget</Button>}
          {editing && dirty && <Button onClick={save}>Save</Button>}
          <Button variant={editing ? 'primary' : 'ghost'} onClick={() => { if (editing && dirty) save(); setEditing((e) => !e) }}>{editing ? 'Done' : 'Customize'}</Button>
        </>}
      />

      {editing && addOpen && (
        <Card style={{ marginBottom: 14 }} pad={14}>
          <div style={{ fontSize: 12, fontWeight: 700, color: T.sub, textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 10 }}>Add a widget</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {available.length === 0 ? <span style={{ fontSize: 13, color: T.muted }}>All widgets are on your dashboard.</span> : available.map((w) => (
              <button key={w.id} onClick={() => addWidget(w.id)} style={{ padding: '7px 12px', borderRadius: 8, border: `1px solid ${T.border}`, background: '#fafbfa', cursor: 'pointer', fontSize: 13, color: T.text, fontFamily: 'inherit' }}>+ {w.title}</button>
            ))}
          </div>
        </Card>
      )}

      <div className="dash-grid">
        {visible.map((it) => {
          const def = getWidget(it.id)!
          const isDrag = dragId === it.id
          return (
            <div key={it.id} data-cell={it.id} className={`dash-cell ${isDrag ? 'dragging' : ''} ${overId === it.id && dragId ? 'drop-target' : ''}`} style={{ gridColumn: `span ${Math.min(it.w, 4)}` }}>
              <Card pad={16} style={{ position: 'relative', minHeight: it.collapsed ? undefined : HEIGHTS[def.defaultH], height: def.defaultH === 'sm' ? HEIGHTS.sm : undefined, overflow: 'hidden', outline: it.pinned ? `1px solid ${T.green2}55` : undefined }}>
                {editing && (
                  <div style={{ position: 'absolute', top: 6, right: 8, display: 'flex', gap: 4, zIndex: 5, background: '#fff', borderRadius: 8, padding: 2, boxShadow: '0 1px 4px rgba(0,0,0,.1)' }}>
                    <span onPointerDown={(e) => startDrag(e, it.id)} title="Drag" style={{ cursor: 'grab', padding: '2px 5px', touchAction: 'none' }}>⠿</span>
                    <button onClick={() => resize(it.id)} title="Resize" style={ctl}>⤢{it.w}</button>
                    <button onClick={() => collapse(it.id)} title="Collapse" style={ctl}>{it.collapsed ? '▸' : '▾'}</button>
                    <button onClick={() => pin(it.id)} title="Pin" style={{ ...ctl, color: it.pinned ? T.green : T.sub }}>📌</button>
                    <button onClick={() => hide(it.id)} title="Hide" style={ctl}>✕</button>
                  </div>
                )}
                {it.collapsed ? <div style={{ fontSize: 13, fontWeight: 700, color: T.ink }}>{def.title}</div> : <def.Component />}
              </Card>
            </div>
          )
        })}
      </div>

      {editing && hidden.length > 0 && (
        <div style={{ marginTop: 16, fontSize: 12, color: T.muted }}>Hidden: {hidden.map((h) => <button key={h.id} onClick={() => addWidget(h.id)} style={{ margin: '0 6px', background: 'none', border: 'none', color: T.green, cursor: 'pointer', fontSize: 12 }}>{getWidget(h.id)?.title} +</button>)}</div>
      )}
    </WidgetDataProvider>
  )
}

const ctl: React.CSSProperties = { border: 'none', background: 'none', cursor: 'pointer', fontSize: 12, color: T.sub, padding: '2px 4px', fontFamily: 'inherit' }
