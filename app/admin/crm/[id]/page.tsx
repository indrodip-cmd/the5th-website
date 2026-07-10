'use client'
/* CRM · Contact profile — header + tabbed detail (Timeline, Notes, Tasks,
   Business, Relationships, Tags, Files, Custom Fields). */
import { useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import {
  T, Card, Button, Input, Textarea, Select, Field, TagPill, Avatar, EmptyState,
  Drawer, ActivityTimeline, JourneyStrip, useAdminFetch, adminSend, fmtDate, type Activity,
} from '@/components/admin/ui'

const PIPELINE = ['new', 'qualified', 'discovery', 'call_booked', 'call_completed', 'proposal', 'won', 'closed', 'lost', 'customer']
const LIFECYCLE = ['lead', 'mql', 'sql', 'opportunity', 'customer', 'evangelist']
const REL_TYPES = ['partner', 'spouse', 'assistant', 'decision_maker', 'referral_partner', 'friend', 'coach', 'team_member', 'custom']

type Row = Record<string, unknown>
interface Bundle {
  contact: Row; activities: Activity[]; notes: Row[]; tasks: Row[]
  business: Row | null; relationships: Row[]; customValues: Row[]; attachments: Row[]
}

const TABS = ['Timeline', 'AI', 'Attribution', 'Notes', 'Tasks', 'Purchases', 'Business', 'Relationships', 'Tags', 'Files', 'Custom'] as const

export default function ContactProfile() {
  const params = useParams<{ id: string }>()
  const id = params.id
  const { data, loading, reload } = useAdminFetch<Bundle>(`/api/admin/crm/contacts/${id}`)
  const [tab, setTab] = useState<typeof TABS[number]>('Timeline')
  const [editing, setEditing] = useState(false)

  if (loading && !data) return <div className="skeleton" style={{ height: 180, borderRadius: 14 }} />
  if (!data?.contact) return <EmptyState title="Contact not found" hint="It may have been deleted." />
  const c = data.contact
  const base = `/api/admin/crm/contacts/${id}`

  return (
    <>
      <Link href="/admin/crm" style={{ fontSize: 13, color: T.sub, textDecoration: 'none' }}>← All contacts</Link>

      <Card style={{ marginTop: 12, marginBottom: 18 }}>
        <div style={{ display: 'flex', gap: 18, alignItems: 'center', flexWrap: 'wrap' }}>
          <Avatar name={c.name as string} email={c.email as string} size={60} />
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: T.ink }}>{(c.name as string) || (c.email as string) || 'Unknown'}</div>
            <div style={{ fontSize: 14, color: T.sub, marginTop: 3, display: 'flex', gap: 14, flexWrap: 'wrap' }}>
              {c.email ? <span>✉ {c.email as string}</span> : null}
              {c.phone ? <span>☎ {c.phone as string}</span> : null}
              {c.company ? <span>🏢 {c.company as string}</span> : null}
              {c.country ? <span>📍 {c.country as string}</span> : null}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 22, alignItems: 'center' }}>
            <Stat label="Lifecycle" value={(c.lifecycle_stage as string) || '—'} />
            <Stat label="Stage" value={((c.pipeline_stage as string) || '—').replace(/_/g, ' ')} />
            <Stat label="Score" value={String(c.lead_score ?? 0)} />
            <Stat label="Revenue" value={`$${Number(c.revenue || 0).toLocaleString()}`} />
            <Stat label="LTV" value={`$${Number(c.ltv || 0).toLocaleString()}`} />
            <Button variant="ghost" onClick={() => setEditing(true)}>Edit</Button>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 14, alignItems: 'center' }}>
          {((c.tags as string[]) || []).map((t) => <TagPill key={t} label={t} />)}
          <div style={{ flex: 1 }} />
          <QuickActions contactId={id} onDone={reload} onTab={setTab} />
        </div>
      </Card>

      <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
        {TABS.map((t) => (
          <button key={t} className="tab-btn" onClick={() => setTab(t)}
            style={{ background: tab === t ? T.green2 : '#fff', color: tab === t ? '#fff' : T.sub, border: `1px solid ${tab === t ? T.green2 : T.border}` }}>
            {t}
          </button>
        ))}
      </div>

      {tab === 'Timeline' && <Card><JourneyStrip activities={data.activities} /><ActivityTimeline activities={data.activities} /></Card>}
      {tab === 'AI' && <AiTab contactId={id} />}
      {tab === 'Attribution' && <AttributionTab id={id} />}
      {tab === 'Purchases' && <PurchasesTab base={base} reload={reload} />}
      {tab === 'Notes' && <NotesTab base={base} notes={data.notes} reload={reload} />}
      {tab === 'Tasks' && <TasksTab base={base} tasks={data.tasks} reload={reload} />}
      {tab === 'Business' && <BusinessTab base={base} business={data.business} reload={reload} />}
      {tab === 'Relationships' && <RelationshipsTab base={base} rels={data.relationships} reload={reload} />}
      {tab === 'Tags' && <TagsTab base={base} tags={(c.tags as string[]) || []} reload={reload} />}
      {tab === 'Files' && <FilesTab base={base} files={data.attachments} reload={reload} />}
      {tab === 'Custom' && <CustomTab base={base} values={data.customValues} reload={reload} />}

      <Drawer open={editing} onClose={() => setEditing(false)}>
        <EditContact contact={c} id={id} onSaved={() => { setEditing(false); reload() }} onClose={() => setEditing(false)} />
      </Drawer>
    </>
  )
}

function QuickActions({ contactId, onDone, onTab }: { contactId: string; onDone: () => void; onTab: (t: typeof TABS[number]) => void }) {
  const [busy, setBusy] = useState(false)
  const newOpp = async () => {
    setBusy(true)
    try { await adminSend('/api/admin/crm/opportunities', 'POST', { contact_id: contactId }); onDone(); window.location.href = '/admin/crm/pipeline' }
    finally { setBusy(false) }
  }
  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      <Button variant="ghost" disabled={busy} onClick={newOpp}>＋ Opportunity</Button>
      <Button variant="ghost" onClick={() => onTab('Tasks')}>＋ Task</Button>
      <Button variant="ghost" onClick={() => onTab('Notes')}>＋ Note</Button>
      <a className="a-btn a-btn-ghost" href="https://cal.com/indrodip-ghosh-ut1vxh/60min" target="_blank" rel="noreferrer">Book call</a>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return <div style={{ textAlign: 'center' }}><div style={{ fontSize: 16, fontWeight: 700, color: T.ink }}>{value}</div><div style={{ fontSize: 11, color: T.muted, textTransform: 'uppercase', letterSpacing: '.05em', marginTop: 2 }}>{label}</div></div>
}

// ── AI insights (grounded, cited) ──
const INSIGHT_KINDS: Array<{ kind: string; label: string }> = [
  { kind: 'summary', label: 'Summary' }, { kind: 'next_actions', label: 'Next actions' },
  { kind: 'close_probability', label: 'Close probability' }, { kind: 'risk', label: 'Risks' }, { kind: 'insight', label: 'Signals' },
]
function renderInsightBody(kind: string, body: Row): React.ReactNode {
  if (kind === 'summary') return <div style={{ fontSize: 14, color: T.text, lineHeight: 1.6 }}>{(body.text as string) || '—'}</div>
  if (kind === 'close_probability') return <div><div style={{ fontSize: 24, fontWeight: 800, color: T.green }}>{Number(body.probability ?? 0)}%</div><div style={{ fontSize: 13, color: T.sub, marginTop: 4 }}>{body.reasoning as string}</div></div>
  const list = (body.actions || body.risks || body.insights || []) as string[]
  if (Array.isArray(list) && list.length) return <ul style={{ margin: 0, paddingLeft: 18 }}>{list.map((x, i) => <li key={i} style={{ fontSize: 14, color: T.text, marginBottom: 4 }}>{x}</li>)}</ul>
  return <div style={{ fontSize: 13, color: T.muted }}>{JSON.stringify(body)}</div>
}
function AiTab({ contactId }: { contactId: string }) {
  const { data, loading, reload } = useAdminFetch<{ insights: Row[] }>(`/api/admin/crm/insights?contact_id=${contactId}`)
  const [busy, setBusy] = useState<string | null>(null)
  const byKind = new Map((data?.insights || []).map((i) => [i.kind as string, i]))
  const generate = async (kind: string) => {
    setBusy(kind)
    try { await adminSend('/api/admin/crm/insights', 'POST', { kind, contact_id: contactId }); reload() }
    catch (e) { alert(String(e instanceof Error ? e.message : e)) } finally { setBusy(null) }
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <Card pad={16}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {INSIGHT_KINDS.map((k) => (
            <Button key={k.kind} variant="ghost" disabled={busy === k.kind} onClick={() => generate(k.kind)}>{busy === k.kind ? 'Thinking…' : `✨ ${k.label}`}</Button>
          ))}
        </div>
        <div style={{ fontSize: 12, color: T.muted, marginTop: 10 }}>Grounded in this contact&apos;s CRM data. The coach never invents facts.</div>
      </Card>
      {loading && !data ? <div className="skeleton" style={{ height: 80 }} /> : INSIGHT_KINDS.filter((k) => byKind.has(k.kind)).map((k) => {
        const ins = byKind.get(k.kind)!
        return (
          <Card key={k.kind}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <h3 style={secLabel}>{k.label}</h3>
              <span style={{ fontSize: 11, color: T.muted }}>{fmtDate(ins.created_at as string)}</span>
            </div>
            {renderInsightBody(k.kind, ins.body as Row)}
          </Card>
        )
      })}
    </div>
  )
}

// ── Attribution / Customer 360 web journey ──
function touchLabel(t: Row | null): string {
  if (!t) return '—'
  return `${(t.source as string) || 'direct'} / ${(t.medium as string) || '(none)'}${t.campaign ? ` · ${t.campaign as string}` : ''}`
}
function AttributionTab({ id }: { id: string }) {
  const { data, loading } = useAdminFetch<{ first_touch: Row | null; last_touch: Row | null; first_seen_at: string | null; touchpoints: Row[]; models: Record<string, Array<{ channel: string; credit: number }>>; webEvents: Row[] }>(`/api/admin/crm/contacts/${id}/attribution`)
  if (loading && !data) return <Card><div className="skeleton" style={{ height: 120 }} /></Card>
  const d = data!
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Card>
        <h3 style={secLabel}>Attribution</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div><div style={{ fontSize: 11, color: T.muted, textTransform: 'uppercase', letterSpacing: '.05em' }}>First touch</div><div style={{ fontSize: 14, color: T.ink, fontWeight: 600, marginTop: 3 }}>{touchLabel(d.first_touch)}</div>{d.first_seen_at ? <div style={{ fontSize: 12, color: T.muted }}>{fmtDate(d.first_seen_at)}</div> : null}</div>
          <div><div style={{ fontSize: 11, color: T.muted, textTransform: 'uppercase', letterSpacing: '.05em' }}>Last touch</div><div style={{ fontSize: 14, color: T.ink, fontWeight: 600, marginTop: 3 }}>{touchLabel(d.last_touch)}</div></div>
        </div>
        {Object.keys(d.models?.linear || {}).length > 0 || (d.touchpoints?.length || 0) > 0 ? (
          <div style={{ marginTop: 16 }}>
            <div style={{ fontSize: 11, color: T.muted, textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 8 }}>Channel credit (position-based)</div>
            {(d.models?.position || []).map((m) => (
              <div key={m.channel} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                <span style={{ fontSize: 13, color: T.text, width: 200 }}>{m.channel}</span>
                <div style={{ flex: 1, height: 8, background: '#f0f1f0', borderRadius: 4, overflow: 'hidden' }}><div style={{ width: `${Math.round(m.credit * 100)}%`, height: '100%', background: T.green2 }} /></div>
                <span style={{ fontSize: 12, color: T.sub, width: 42, textAlign: 'right' }}>{Math.round(m.credit * 100)}%</span>
              </div>
            ))}
          </div>
        ) : <div style={{ fontSize: 13, color: T.muted, marginTop: 14 }}>No attributable touchpoints yet.</div>}
      </Card>
      <Card>
        <h3 style={secLabel}>Web journey {d.webEvents?.length ? `· ${d.webEvents.length}` : ''}</h3>
        {(d.webEvents || []).length === 0 ? <EmptyState title="No anonymous web activity linked" hint="Merges automatically once the visitor identifies." /> : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, maxHeight: 360, overflowY: 'auto' }}>
            {d.webEvents.map((e, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, padding: '7px 0', borderBottom: '1px solid #f4f5f4', fontSize: 13 }}>
                <span style={{ width: 74, color: T.muted }}>{e.event_type as string}</span>
                <span style={{ flex: 1, color: T.text }}>{(e.path as string) || '—'}{e.scroll_pct != null ? <span style={{ color: T.muted }}> · {e.scroll_pct as number}%</span> : null}</span>
                <span style={{ color: T.muted, whiteSpace: 'nowrap' }}>{new Date(e.created_at as string).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
const secLabel: React.CSSProperties = { fontSize: 12, fontWeight: 700, letterSpacing: '.05em', color: T.green, textTransform: 'uppercase', marginBottom: 12 }

// ── Notes ──
function NotesTab({ base, notes, reload }: { base: string; notes: Row[]; reload: () => void }) {
  const [body, setBody] = useState('')
  const [busy, setBusy] = useState(false)
  const add = async () => {
    if (!body.trim()) return
    setBusy(true)
    try { await adminSend(`${base}/notes`, 'POST', { body }); setBody(''); reload() } finally { setBusy(false) }
  }
  const pin = async (n: Row) => { await adminSend(`${base}/notes`, 'PATCH', { note_id: n.id, pinned: !n.pinned }); reload() }
  const del = async (n: Row) => { await adminSend(`${base}/notes?note_id=${n.id}`, 'DELETE'); reload() }
  return (
    <Card>
      <Textarea placeholder="Add a note…" value={body} onChange={(e) => setBody(e.target.value)} />
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 10 }}><Button disabled={busy || !body.trim()} onClick={add}>Add note</Button></div>
      <div style={{ marginTop: 18, display: 'flex', flexDirection: 'column', gap: 12 }}>
        {notes.length === 0 ? <EmptyState title="No notes yet" /> : notes.map((n) => (
          <div key={n.id as string} style={{ padding: 14, borderRadius: 10, background: n.pinned ? '#fffbeb' : '#fafbfa', border: `1px solid ${T.border}` }}>
            <div style={{ fontSize: 14, color: T.text, whiteSpace: 'pre-wrap' }}>{n.body as string}</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, alignItems: 'center' }}>
              <span style={{ fontSize: 12, color: T.muted }}>{(n.author as string) || 'team'} · {fmtDate(n.created_at as string)}{n.private ? ' · private' : ''}</span>
              <span style={{ display: 'flex', gap: 12 }}>
                <button onClick={() => pin(n)} style={linkBtn}>{n.pinned ? 'Unpin' : 'Pin'}</button>
                <button onClick={() => del(n)} style={{ ...linkBtn, color: T.danger }}>Delete</button>
              </span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}

// ── Tasks ──
function TasksTab({ base, tasks, reload }: { base: string; tasks: Row[]; reload: () => void }) {
  const [title, setTitle] = useState('')
  const [due, setDue] = useState('')
  const add = async () => { if (!title.trim()) return; await adminSend(`${base}/tasks`, 'POST', { title, due_date: due || null }); setTitle(''); setDue(''); reload() }
  const done = async (t: Row) => { await adminSend(`${base}/tasks`, 'PATCH', { task_id: t.id, status: 'done' }); reload() }
  return (
    <Card>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <Input placeholder="New task…" value={title} onChange={(e) => setTitle(e.target.value)} style={{ flex: 1, minWidth: 180 }} />
        <Input type="date" value={due} onChange={(e) => setDue(e.target.value)} style={{ width: 160 }} />
        <Button disabled={!title.trim()} onClick={add}>Add task</Button>
      </div>
      <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {tasks.length === 0 ? <EmptyState title="No tasks" /> : tasks.map((t) => (
          <div key={t.id as string} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderRadius: 10, background: '#fafbfa', border: `1px solid ${T.border}`, opacity: t.status === 'done' ? 0.55 : 1 }}>
            <input type="checkbox" checked={t.status === 'done'} onChange={() => t.status !== 'done' && done(t)} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 500, color: T.text, textDecoration: t.status === 'done' ? 'line-through' : 'none' }}>{t.title as string}</div>
              {t.description ? <div style={{ fontSize: 13, color: T.sub }}>{t.description as string}</div> : null}
            </div>
            {t.due_date ? <span className="a-pill" style={{ background: '#f3f4f6', color: T.sub }}>{fmtDate(t.due_date as string)}</span> : null}
          </div>
        ))}
      </div>
    </Card>
  )
}

// ── Purchases ──
function PurchasesTab({ base, reload }: { base: string; reload: () => void }) {
  const { data, loading, reload: reloadP } = useAdminFetch<{ purchases: Row[] }>(`${base}/purchases`)
  const [product, setProduct] = useState('')
  const [amount, setAmount] = useState('')
  const purchases = data?.purchases || []
  const add = async () => {
    if (!product.trim()) return
    await adminSend(`${base}/purchases`, 'POST', { product, amount: Number(amount) || 0 })
    setProduct(''); setAmount(''); reloadP(); reload()
  }
  const refund = async (pid: string) => { await adminSend(`${base}/purchases`, 'PATCH', { purchase_id: pid }); reloadP(); reload() }
  const ltv = purchases.filter((p) => p.status === 'paid').reduce((s, p) => s + Number(p.amount || 0), 0)
  return (
    <Card>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 8 }}>
        <Input placeholder="Product" value={product} onChange={(e) => setProduct(e.target.value)} style={{ flex: 1, minWidth: 160 }} />
        <Input type="number" placeholder="Amount" value={amount} onChange={(e) => setAmount(e.target.value)} style={{ width: 130 }} />
        <Button disabled={!product.trim()} onClick={add}>Record purchase</Button>
      </div>
      <div style={{ fontSize: 13, color: T.sub, marginBottom: 14 }}>Lifetime value: <strong style={{ color: T.green }}>${ltv.toLocaleString()}</strong></div>
      {loading ? <div className="skeleton" style={{ height: 40 }} /> : purchases.length === 0 ? <EmptyState title="No purchases yet" /> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {purchases.map((p) => (
            <div key={p.id as string} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderRadius: 10, background: '#fafbfa', border: `1px solid ${T.border}`, opacity: p.status === 'refunded' ? 0.55 : 1 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: T.text }}>{p.product as string}</div>
                <div style={{ fontSize: 12, color: T.muted }}>{fmtDate(p.purchased_at as string)} · {p.provider as string}</div>
              </div>
              <span style={{ fontSize: 14, fontWeight: 700, color: p.status === 'refunded' ? T.muted : T.green }}>${Number(p.amount || 0).toLocaleString()}</span>
              {p.status === 'paid' ? <button onClick={() => refund(p.id as string)} style={{ background: 'none', border: 'none', color: T.danger, fontSize: 12, cursor: 'pointer', fontWeight: 600 }}>Refund</button>
                : <span className="a-pill" style={{ background: '#f3f4f6', color: T.sub }}>refunded</span>}
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}

// ── Business ──
const BIZ_FIELDS: Array<[string, string]> = [
  ['business_name', 'Business name'], ['personal_brand_name', 'Personal brand'], ['website', 'Website'],
  ['industry', 'Industry'], ['business_model', 'Business model'], ['revenue_range', 'Revenue range'],
  ['team_size', 'Team size'], ['years_in_business', 'Years in business'], ['target_audience', 'Target audience'],
  ['primary_offer', 'Primary offer'], ['main_goal', 'Main goal'], ['biggest_challenge', 'Biggest challenge'],
]
function BusinessTab({ base, business, reload }: { base: string; business: Row | null; reload: () => void }) {
  const [form, setForm] = useState<Row>(business || {})
  const [busy, setBusy] = useState(false)
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }))
  const save = async () => { setBusy(true); try { await adminSend(`${base}/business`, 'PUT', form); reload() } finally { setBusy(false) } }
  return (
    <Card>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: 14 }}>
        {BIZ_FIELDS.map(([k, label]) => (
          <Field key={k} label={label}><Input value={(form[k] as string) || ''} onChange={(e) => set(k, e.target.value)} /></Field>
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}><Button disabled={busy} onClick={save}>{busy ? 'Saving…' : 'Save business profile'}</Button></div>
    </Card>
  )
}

// ── Relationships ──
function RelationshipsTab({ base, rels, reload }: { base: string; rels: Row[]; reload: () => void }) {
  const [type, setType] = useState('partner')
  const [label, setLabel] = useState('')
  const add = async () => { if (!label.trim()) return; await adminSend(`${base}/relationships`, 'POST', { type, label }); setLabel(''); reload() }
  const del = async (r: Row) => { await adminSend(`${base}/relationships?rel_id=${r.id}`, 'DELETE'); reload() }
  return (
    <Card>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <Select value={type} onChange={(e) => setType(e.target.value)} style={{ width: 180 }}>{REL_TYPES.map((t) => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}</Select>
        <Input placeholder="Name (e.g. Jane, their assistant)" value={label} onChange={(e) => setLabel(e.target.value)} style={{ flex: 1, minWidth: 180 }} />
        <Button disabled={!label.trim()} onClick={add}>Add</Button>
      </div>
      <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {rels.length === 0 ? <EmptyState title="No relationships" /> : rels.map((r) => {
          const related = r.related as Row | null
          return (
            <div key={r.id as string} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderRadius: 10, background: '#fafbfa', border: `1px solid ${T.border}` }}>
              <span className="a-pill" style={{ background: '#eef2f0', color: T.green }}>{(r.type as string).replace(/_/g, ' ')}</span>
              <span style={{ flex: 1, fontSize: 14, color: T.text }}>{(related?.name as string) || (r.label as string) || '—'}</span>
              <button onClick={() => del(r)} style={{ ...linkBtn, color: T.danger }}>Remove</button>
            </div>
          )
        })}
      </div>
    </Card>
  )
}

// ── Tags ──
function TagsTab({ base, tags, reload }: { base: string; tags: string[]; reload: () => void }) {
  const [name, setName] = useState('')
  const add = async () => { if (!name.trim()) return; await adminSend(`${base}/tags`, 'POST', { name }); setName(''); reload() }
  const remove = async (t: string) => { await adminSend(`${base}/tags?name=${encodeURIComponent(t)}`, 'DELETE'); reload() }
  return (
    <Card>
      <div style={{ display: 'flex', gap: 10 }}>
        <Input placeholder="Add a tag…" value={name} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && add()} style={{ flex: 1 }} />
        <Button disabled={!name.trim()} onClick={add}>Add tag</Button>
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 16 }}>
        {tags.length === 0 ? <EmptyState title="No tags" /> : tags.map((t) => <TagPill key={t} label={t} onRemove={() => remove(t)} />)}
      </div>
    </Card>
  )
}

// ── Files ──
function FilesTab({ base, files, reload }: { base: string; files: Row[]; reload: () => void }) {
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const upload = async (file: File) => {
    setErr(''); setBusy(true)
    try {
      const fd = new FormData(); fd.append('file', file)
      const res = await fetch(`${base}/attachments`, { method: 'POST', body: fd })
      if (!res.ok) throw new Error((await res.json().catch(() => ({})))?.error || 'Upload failed')
      reload()
    } catch (e) { setErr(String(e instanceof Error ? e.message : e)) } finally { setBusy(false) }
  }
  return (
    <Card>
      <label style={{ display: 'inline-block' }}>
        <span className="a-btn a-btn-primary" style={{ cursor: 'pointer' }}>{busy ? 'Uploading…' : '+ Upload file'}</span>
        <input type="file" style={{ display: 'none' }} disabled={busy} onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(f) }} />
      </label>
      {err && <div style={{ color: T.danger, fontSize: 13, marginTop: 10 }}>{err}</div>}
      <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {files.length === 0 ? <EmptyState title="No files" /> : files.map((f) => (
          <a key={f.id as string} href={`${base}/attachments?file=${f.id}`} target="_blank" rel="noreferrer"
            style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderRadius: 10, background: '#fafbfa', border: `1px solid ${T.border}`, textDecoration: 'none', color: T.text }}>
            <span>📎</span><span style={{ flex: 1, fontSize: 14 }}>{f.file_name as string}</span>
            <span style={{ fontSize: 12, color: T.muted }}>{fmtDate(f.created_at as string)}</span>
          </a>
        ))}
      </div>
    </Card>
  )
}

// ── Custom fields ──
function CustomTab({ base, values, reload }: { base: string; values: Row[]; reload: () => void }) {
  const { data } = useAdminFetch<{ fields: Row[] }>('/api/admin/crm/custom-fields')
  const fields = (data?.fields || []).filter((f) => f.entity !== 'business')
  const valueMap = new Map(values.map((v) => [v.field_id as string, v.value]))
  const [drafts, setDrafts] = useState<Record<string, string>>({})
  const save = async (fieldId: string) => { await adminSend(`${base}/custom-values`, 'PUT', { field_id: fieldId, value: drafts[fieldId] }); reload() }
  if (fields.length === 0) return <Card><EmptyState title="No custom fields defined" hint="Create them in CRM → Settings." /></Card>
  return (
    <Card>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 14 }}>
        {fields.map((f) => {
          const fid = f.id as string
          const current = drafts[fid] ?? (valueMap.get(fid) as string) ?? ''
          return (
            <Field key={fid} label={f.label as string}>
              <div style={{ display: 'flex', gap: 8 }}>
                <Input value={current} onChange={(e) => setDrafts((d) => ({ ...d, [fid]: e.target.value }))} onBlur={() => drafts[fid] !== undefined && save(fid)} />
              </div>
            </Field>
          )
        })}
      </div>
    </Card>
  )
}

// ── Edit contact drawer ──
function EditContact({ contact, id, onSaved, onClose }: { contact: Row; id: string; onSaved: () => void; onClose: () => void }) {
  const [form, setForm] = useState<Row>(contact)
  const [busy, setBusy] = useState(false)
  const set = (k: string, v: string | number) => setForm((f) => ({ ...f, [k]: v }))
  const save = async () => {
    setBusy(true)
    try {
      await adminSend(`/api/admin/crm/contacts/${id}`, 'PATCH', {
        name: form.name, first_name: form.first_name, last_name: form.last_name, phone: form.phone,
        company: form.company, country: form.country, interest: form.interest, owner: form.owner,
        lifecycle_stage: form.lifecycle_stage, pipeline_stage: form.pipeline_stage,
        lead_score: Number(form.lead_score) || 0, revenue: Number(form.revenue) || 0, notes: form.notes,
      })
      onSaved()
    } finally { setBusy(false) }
  }
  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
        <h2 style={{ fontSize: 18, fontWeight: 800, color: T.ink }}>Edit contact</h2>
        <button onClick={onClose} style={{ ...linkBtn, fontSize: 20 }}>×</button>
      </div>
      <div style={{ display: 'flex', gap: 12 }}>
        <div style={{ flex: 1 }}><Field label="First name"><Input value={(form.first_name as string) || ''} onChange={(e) => set('first_name', e.target.value)} /></Field></div>
        <div style={{ flex: 1 }}><Field label="Last name"><Input value={(form.last_name as string) || ''} onChange={(e) => set('last_name', e.target.value)} /></Field></div>
      </div>
      <Field label="Display name"><Input value={(form.name as string) || ''} onChange={(e) => set('name', e.target.value)} /></Field>
      <div style={{ display: 'flex', gap: 12 }}>
        <div style={{ flex: 1 }}><Field label="Phone"><Input value={(form.phone as string) || ''} onChange={(e) => set('phone', e.target.value)} /></Field></div>
        <div style={{ flex: 1 }}><Field label="Country"><Input value={(form.country as string) || ''} onChange={(e) => set('country', e.target.value)} /></Field></div>
      </div>
      <Field label="Company"><Input value={(form.company as string) || ''} onChange={(e) => set('company', e.target.value)} /></Field>
      <div style={{ display: 'flex', gap: 12 }}>
        <div style={{ flex: 1 }}><Field label="Lifecycle"><Select value={(form.lifecycle_stage as string) || 'lead'} onChange={(e) => set('lifecycle_stage', e.target.value)}>{LIFECYCLE.map((l) => <option key={l} value={l}>{l}</option>)}</Select></Field></div>
        <div style={{ flex: 1 }}><Field label="Pipeline stage"><Select value={(form.pipeline_stage as string) || 'new'} onChange={(e) => set('pipeline_stage', e.target.value)}>{PIPELINE.map((s) => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}</Select></Field></div>
      </div>
      <div style={{ display: 'flex', gap: 12 }}>
        <div style={{ flex: 1 }}><Field label="Lead score"><Input type="number" value={String(form.lead_score ?? 0)} onChange={(e) => set('lead_score', e.target.value)} /></Field></div>
        <div style={{ flex: 1 }}><Field label="Revenue ($)"><Input type="number" value={String(form.revenue ?? 0)} onChange={(e) => set('revenue', e.target.value)} /></Field></div>
      </div>
      <Field label="Owner"><Input value={(form.owner as string) || ''} onChange={(e) => set('owner', e.target.value)} /></Field>
      <Field label="Interest"><Input value={(form.interest as string) || ''} onChange={(e) => set('interest', e.target.value)} /></Field>
      <Field label="Notes"><Textarea value={(form.notes as string) || ''} onChange={(e) => set('notes', e.target.value)} /></Field>
      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
        <Button disabled={busy} onClick={save}>{busy ? 'Saving…' : 'Save changes'}</Button>
      </div>
    </div>
  )
}

const linkBtn: React.CSSProperties = { background: 'none', border: 'none', color: T.sub, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }
