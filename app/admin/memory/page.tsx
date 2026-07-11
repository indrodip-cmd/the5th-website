'use client'
/* Business Memory Explorer (3I.7) — the company's organizational brain. Timeline,
   semantic-ish search, decision & experiment logs, and a knowledge-graph entity
   explorer. Command AI reads the same memory as its primary context. */
import { useState } from 'react'
import { T, Card, Button, PageHeader, EmptyState, Modal, useAdminFetch, adminSend, fmtDate } from '@/components/admin/ui'

type Row = Record<string, unknown>
const TYPE_META: Record<string, { icon: string; color: string }> = {
  customer: { icon: '👤', color: '#0369a1' }, meeting: { icon: '📅', color: '#7c3aed' }, sales: { icon: '💼', color: '#16a34a' },
  coaching: { icon: '🎯', color: '#c026d3' }, marketing: { icon: '📣', color: '#d97706' }, content: { icon: '✍️', color: '#0891b2' },
  financial: { icon: '💰', color: '#16a34a' }, operational: { icon: '⚙️', color: '#6b7280' }, system: { icon: '🖥️', color: '#6b7280' },
  decision: { icon: '⚖️', color: '#C9A84C' }, experiment: { icon: '🧪', color: '#dc2626' },
}
const tmeta = (t: string) => TYPE_META[t] || { icon: '•', color: '#6b7280' }
const TABS = ['Overview', 'Timeline', 'Search', 'Decisions', 'Experiments', 'Graph'] as const
type Tab = typeof TABS[number]

export default function MemoryExplorer() {
  const [tab, setTab] = useState<Tab>('Overview')
  return (
    <>
      <PageHeader title="Business Memory" subtitle="The company's permanent brain — searchable across all of history" />
      <div style={{ display: 'flex', gap: 6, marginBottom: 18, flexWrap: 'wrap' }}>
        {TABS.map((t) => <button key={t} className="tab-btn" onClick={() => setTab(t)} style={{ background: tab === t ? T.green2 : '#fff', color: tab === t ? '#fff' : T.sub, border: `1px solid ${tab === t ? T.green2 : T.border}` }}>{t}</button>)}
      </div>
      {tab === 'Overview' && <Overview />}
      {tab === 'Timeline' && <Timeline />}
      {tab === 'Search' && <Search />}
      {tab === 'Decisions' && <Decisions />}
      {tab === 'Experiments' && <Experiments />}
      {tab === 'Graph' && <Graph />}
    </>
  )
}

function MemoryRow({ m, onOpen }: { m: Row; onOpen?: (m: Row) => void }) {
  const meta = tmeta(m.memory_type as string)
  return (
    <div onClick={() => onOpen?.(m)} style={{ display: 'flex', gap: 12, padding: '11px 14px', borderBottom: `1px solid ${T.border}`, cursor: onOpen ? 'pointer' : 'default' }}>
      <span style={{ fontSize: 17 }}>{meta.icon}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13.5, fontWeight: 600, color: T.ink }}>{m.title as string}</div>
        {m.summary ? <div style={{ fontSize: 12.5, color: T.sub, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.summary as string}</div> : null}
        {(m.topics as string[] || []).length > 0 && <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginTop: 4 }}>{(m.topics as string[]).slice(0, 5).map((t) => <span key={t} className="a-pill" style={{ background: '#eef2f0', color: T.sub, fontSize: 10.5 }}>{t}</span>)}</div>}
      </div>
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <span className="a-pill" style={{ background: `${meta.color}1a`, color: meta.color, textTransform: 'capitalize' }}>{m.memory_type as string}</span>
        <div style={{ fontSize: 11, color: T.muted, marginTop: 4 }}>{fmtDate(m.occurred_at as string)}</div>
      </div>
    </div>
  )
}

function Overview() {
  const { data, loading, reload } = useAdminFetch<{ stats: Row; recent: Row[]; summaries: Row[] }>('/api/admin/memory?view=overview')
  const [busy, setBusy] = useState('')
  const [open, setOpen] = useState<Row | null>(null)
  const run = async (action: string) => { setBusy(action); try { await adminSend('/api/admin/memory', 'POST', { action }); reload() } finally { setBusy('') } }
  if (loading && !data) return <div className="skeleton" style={{ height: 220, borderRadius: 14 }} />
  const s = data?.stats || {}
  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(120px,1fr))', gap: 12, marginBottom: 16 }}>
        {[['Memories', s.total], ['Entities', s.entities], ['Connections', s.edges], ['Decisions', s.decisions], ['Experiments', s.experiments]].map(([k, v]) => (
          <Card key={k as string} pad={16}><div style={{ fontSize: 22, fontWeight: 800, color: T.ink }}>{Number(v || 0)}</div><div style={{ fontSize: 12, color: T.sub }}>{k as string}</div></Card>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <Button disabled={!!busy} onClick={() => run('sync')}>{busy === 'sync' ? 'Ingesting…' : 'Ingest new data'}</Button>
        <Button variant="ghost" disabled={!!busy} onClick={() => run('summarize')}>{busy === 'summarize' ? 'Summarizing…' : 'Summarize this month'}</Button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <Card pad={0}>
          <div style={{ fontSize: 13, fontWeight: 700, color: T.ink, padding: '14px 14px 6px' }}>Recent memory</div>
          {(data?.recent || []).length === 0 ? <EmptyState title="No memory yet" hint="Click “Ingest new data” to build memory from your meetings & customers." /> : (data?.recent || []).map((m) => <MemoryRow key={m.id as string} m={m} onOpen={setOpen} />)}
        </Card>
        <Card>
          <div style={{ fontSize: 13, fontWeight: 700, color: T.ink, marginBottom: 8 }}>By type</div>
          {(s.byType as Row[] || []).map((t) => (
            <div key={t.type as string} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0' }}>
              <span>{tmeta(t.type as string).icon}</span><span style={{ flex: 1, fontSize: 13, color: T.text, textTransform: 'capitalize' }}>{t.type as string}</span><b style={{ color: T.ink }}>{t.count as number}</b>
            </div>
          ))}
          {(data?.summaries || []).length > 0 && <>
            <div style={{ fontSize: 13, fontWeight: 700, color: T.ink, margin: '14px 0 8px' }}>Monthly digest</div>
            {(data?.summaries || []).map((sm) => (
              <div key={sm.id as string} style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: T.green }}>{sm.period_key as string} · {sm.count as number} memories</div>
                <div style={{ fontSize: 12.5, color: T.sub, whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>{sm.summary as string}</div>
              </div>
            ))}
          </>}
        </Card>
      </div>
      {open && <MemoryModal m={open} onClose={() => setOpen(null)} />}
    </>
  )
}

function MemoryModal({ m, onClose }: { m: Row; onClose: () => void }) {
  const { data } = useAdminFetch<{ memory: Row }>(`/api/admin/memory?view=memory&id=${m.id}`)
  const full = data?.memory || m
  return (
    <Modal open onClose={onClose} title={full.title as string}>
      <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
        <span className="a-pill" style={{ background: `${tmeta(full.memory_type as string).color}1a`, color: tmeta(full.memory_type as string).color, textTransform: 'capitalize' }}>{full.memory_type as string}</span>
        <span style={{ fontSize: 12, color: T.muted }}>{fmtDate(full.occurred_at as string)} · source {full.source as string} · importance {full.importance as number}/5</span>
      </div>
      {full.content ? <div style={{ fontSize: 13.5, color: T.text, lineHeight: 1.6, whiteSpace: 'pre-wrap', marginBottom: 12 }}>{full.content as string}</div> : null}
      {(full.entities as string[] || []).length > 0 && <div style={{ marginBottom: 8 }}><b style={{ fontSize: 12, color: T.sub }}>Entities: </b>{(full.entities as string[]).join(', ')}</div>}
      {(full.topics as string[] || []).length > 0 && <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>{(full.topics as string[]).map((t) => <span key={t} className="a-pill" style={{ background: '#eef2f0', color: T.sub }}>{t}</span>)}</div>}
    </Modal>
  )
}

function Search() {
  const [q, setQ] = useState(''); const [type, setType] = useState(''); const [res, setRes] = useState<Row[] | null>(null); const [busy, setBusy] = useState(false); const [open, setOpen] = useState<Row | null>(null)
  const go = async () => { setBusy(true); try { const r = await fetch(`/api/admin/memory?view=search&q=${encodeURIComponent(q)}${type ? `&type=${type}` : ''}`).then((x) => x.json()); setRes(r.memories || []) } finally { setBusy(false) } }
  return (
    <>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <input className="a-input" placeholder="Search all business memory — e.g. pricing objections, customers who asked about AI…" value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && go()} />
        <select className="a-input" style={{ maxWidth: 160 }} value={type} onChange={(e) => setType(e.target.value)}><option value="">All types</option>{Object.keys(TYPE_META).map((t) => <option key={t} value={t}>{t}</option>)}</select>
        <Button disabled={busy} onClick={go}>{busy ? 'Searching…' : 'Search'}</Button>
      </div>
      {res === null ? <EmptyState title="Search the company brain" hint="Ask across meetings, customers, decisions, experiments and more." /> : res.length === 0 ? <EmptyState title="No matches" /> : (
        <Card pad={0}>{res.map((m) => <MemoryRow key={m.id as string} m={m} onOpen={setOpen} />)}</Card>
      )}
      {open && <MemoryModal m={open} onClose={() => setOpen(null)} />}
    </>
  )
}

function Timeline() {
  const days = (n: number) => new Date(Date.now() - n * 86400000).toISOString()
  const [from, setFrom] = useState(days(90).slice(0, 10)); const [type, setType] = useState('')
  const { data, loading } = useAdminFetch<{ memories: Row[] }>(`/api/admin/memory?view=timeline&from=${from}T00:00:00Z${type ? `&type=${type}` : ''}&limit=100`, [from, type])
  const [open, setOpen] = useState<Row | null>(null)
  return (
    <>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, alignItems: 'center' }}>
        <span style={{ fontSize: 13, color: T.sub }}>Since</span>
        <input type="date" className="a-input" style={{ maxWidth: 170 }} value={from} onChange={(e) => setFrom(e.target.value)} />
        <select className="a-input" style={{ maxWidth: 160 }} value={type} onChange={(e) => setType(e.target.value)}><option value="">All types</option>{Object.keys(TYPE_META).map((t) => <option key={t} value={t}>{t}</option>)}</select>
      </div>
      {loading && !data ? <div className="skeleton" style={{ height: 200, borderRadius: 14 }} /> : (data?.memories || []).length === 0 ? <EmptyState title="Nothing in this window" /> : <Card pad={0}>{(data?.memories || []).map((m) => <MemoryRow key={m.id as string} m={m} onOpen={setOpen} />)}</Card>}
      {open && <MemoryModal m={open} onClose={() => setOpen(null)} />}
    </>
  )
}

function Decisions() {
  const { data, loading, reload } = useAdminFetch<{ decisions: Row[] }>('/api/admin/memory?view=decisions')
  const [form, setForm] = useState<Row | null>(null)
  const save = async () => { if (!(form?.title as string)?.trim()) return; await adminSend('/api/admin/memory', 'POST', { action: 'record_decision', ...form }); setForm(null); reload() }
  return (
    <>
      <div style={{ marginBottom: 14 }}><Button onClick={() => setForm({ category: 'general' })}>＋ Log a decision</Button></div>
      {loading && !data ? <div className="skeleton" style={{ height: 140 }} /> : (data?.decisions || []).length === 0 ? <EmptyState title="No decisions logged" hint="Record significant decisions so Command AI can explain the why later." /> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {(data?.decisions || []).map((d) => (
            <Card key={d.id as string} pad={16}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <span>⚖️</span><span style={{ fontSize: 14.5, fontWeight: 700, color: T.ink, flex: 1 }}>{d.title as string}</span>
                <span className="a-pill" style={{ background: '#eef2f0', color: T.sub }}>{d.category as string}</span>
                <span style={{ fontSize: 11.5, color: T.muted }}>{fmtDate(d.decided_at as string)}</span>
              </div>
              {d.description ? <div style={{ fontSize: 13, color: T.text, marginBottom: 4 }}>{d.description as string}</div> : null}
              {d.reason ? <div style={{ fontSize: 12.5, color: T.sub }}><b>Why:</b> {d.reason as string}</div> : null}
              {d.outcome ? <div style={{ fontSize: 12.5, color: T.green }}><b>Outcome:</b> {d.outcome as string}</div> : null}
              {d.decided_by ? <div style={{ fontSize: 11.5, color: T.muted, marginTop: 4 }}>by {d.decided_by as string}</div> : null}
            </Card>
          ))}
        </div>
      )}
      {form && (
        <Modal open onClose={() => setForm(null)} title="Log a decision">
          {['title', 'description', 'category', 'reason', 'outcome'].map((k) => (
            <label key={k} style={{ display: 'block', marginBottom: 10 }}>
              <span style={{ fontSize: 11.5, fontWeight: 700, color: T.sub, textTransform: 'uppercase' }}>{k}</span>
              {k === 'description' || k === 'reason' ? <textarea className="a-input" style={{ marginTop: 4, minHeight: 52 }} value={(form[k] as string) || ''} onChange={(e) => setForm({ ...form, [k]: e.target.value })} /> : <input className="a-input" style={{ marginTop: 4 }} value={(form[k] as string) || ''} onChange={(e) => setForm({ ...form, [k]: e.target.value })} />}
            </label>
          ))}
          <Button onClick={save}>Save decision</Button>
        </Modal>
      )}
    </>
  )
}

function Experiments() {
  const { data, loading, reload } = useAdminFetch<{ experiments: Row[] }>('/api/admin/memory?view=experiments')
  const [form, setForm] = useState<Row | null>(null)
  const save = async () => { if (!(form?.title as string)?.trim()) return; await adminSend('/api/admin/memory', 'POST', { action: 'record_experiment', ...form }); setForm(null); reload() }
  const conclude = async (e: Row, outcome: string) => { await adminSend('/api/admin/memory', 'POST', { action: 'update_experiment', id: e.id, patch: { status: 'concluded', outcome } }); reload() }
  const oc: Record<string, string> = { win: '#16a34a', loss: '#dc2626', inconclusive: '#d97706' }
  return (
    <>
      <div style={{ marginBottom: 14 }}><Button onClick={() => setForm({ status: 'running' })}>＋ Log an experiment</Button></div>
      {loading && !data ? <div className="skeleton" style={{ height: 140 }} /> : (data?.experiments || []).length === 0 ? <EmptyState title="No experiments logged" hint="Track tests so the AI can avoid repeating failures." /> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {(data?.experiments || []).map((e) => (
            <Card key={e.id as string} pad={16}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <span>🧪</span><span style={{ fontSize: 14.5, fontWeight: 700, color: T.ink, flex: 1 }}>{e.title as string}</span>
                {e.outcome ? <span className="a-pill" style={{ background: `${oc[e.outcome as string] || '#6b7280'}1a`, color: oc[e.outcome as string] || '#6b7280' }}>{e.outcome as string}</span> : <span className="a-pill" style={{ background: '#e0f2fe', color: '#0369a1' }}>{e.status as string}</span>}
              </div>
              {e.hypothesis ? <div style={{ fontSize: 12.5, color: T.sub }}><b>Hypothesis:</b> {e.hypothesis as string}</div> : null}
              {e.results ? <div style={{ fontSize: 12.5, color: T.text }}><b>Results:</b> {e.results as string}</div> : null}
              {e.conclusion ? <div style={{ fontSize: 12.5, color: T.green }}><b>Conclusion:</b> {e.conclusion as string}</div> : null}
              {e.status !== 'concluded' && <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>{['win', 'loss', 'inconclusive'].map((o) => <Button key={o} variant="ghost" onClick={() => conclude(e, o)}>{o}</Button>)}</div>}
            </Card>
          ))}
        </div>
      )}
      {form && (
        <Modal open onClose={() => setForm(null)} title="Log an experiment">
          {['title', 'hypothesis', 'metric', 'results', 'conclusion'].map((k) => (
            <label key={k} style={{ display: 'block', marginBottom: 10 }}>
              <span style={{ fontSize: 11.5, fontWeight: 700, color: T.sub, textTransform: 'uppercase' }}>{k}</span>
              {k === 'hypothesis' || k === 'results' || k === 'conclusion' ? <textarea className="a-input" style={{ marginTop: 4, minHeight: 48 }} value={(form[k] as string) || ''} onChange={(e) => setForm({ ...form, [k]: e.target.value })} /> : <input className="a-input" style={{ marginTop: 4 }} value={(form[k] as string) || ''} onChange={(e) => setForm({ ...form, [k]: e.target.value })} />}
            </label>
          ))}
          <Button onClick={save}>Save experiment</Button>
        </Modal>
      )}
    </>
  )
}

function Graph() {
  const { data, loading } = useAdminFetch<{ entities: Row[] }>('/api/admin/memory?view=entities')
  const [sel, setSel] = useState<string | null>(null)
  const g = useAdminFetch<{ node: Row; out: Row[]; in: Row[] }>(sel ? `/api/admin/memory?view=graph&id=${sel}` : null, [sel])
  if (loading && !data) return <div className="skeleton" style={{ height: 200, borderRadius: 14 }} />
  const ents = data?.entities || []
  if (!ents.length) return <EmptyState title="Knowledge graph is empty" hint="Ingest memory first — entities (customers, topics, people) and their connections appear here." />
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr', gap: 16 }}>
      <Card pad={0} style={{ maxHeight: '64vh', overflowY: 'auto' }}>
        {ents.map((e) => (
          <div key={e.id as string} onClick={() => setSel(e.id as string)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderBottom: `1px solid ${T.border}`, cursor: 'pointer', background: sel === e.id ? '#eef7f1' : 'transparent' }}>
            <span style={{ flex: 1, fontSize: 13.5, color: T.ink }}>{e.name as string}</span>
            <span className="a-pill" style={{ background: '#eef2f0', color: T.sub }}>{e.entity_type as string}</span>
            <span style={{ fontSize: 11.5, color: T.muted }}>×{e.mention_count as number}</span>
          </div>
        ))}
      </Card>
      <Card>
        {!sel ? <EmptyState title="Pick an entity" hint="See how it connects across the business." /> : g.loading ? <div className="skeleton" style={{ height: 120 }} /> : (
          <>
            <div style={{ fontSize: 16, fontWeight: 800, color: T.ink, marginBottom: 2 }}>{(g.data?.node?.name as string) || '—'}</div>
            <div style={{ fontSize: 12, color: T.muted, marginBottom: 14 }}>{g.data?.node?.entity_type as string} · mentioned {g.data?.node?.mention_count as number} times</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: T.sub, textTransform: 'uppercase', marginBottom: 6 }}>Connections</div>
            {[...(g.data?.out || []).map((e) => ({ e: (e.to as Row), rel: e.relation, w: e.weight })), ...(g.data?.in || []).map((e) => ({ e: (e.from as Row), rel: e.relation, w: e.weight }))].filter((x) => x.e).map((x, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', borderBottom: `1px solid ${T.border}` }}>
                <span className="a-pill" style={{ background: '#f3e8ff', color: '#7c3aed' }}>{x.rel as string}</span>
                <span style={{ flex: 1, fontSize: 13, color: T.ink }}>{(x.e as Row).name as string}</span>
                <span style={{ fontSize: 11, color: T.muted }}>×{x.w as number}</span>
              </div>
            ))}
          </>
        )}
      </Card>
    </div>
  )
}
