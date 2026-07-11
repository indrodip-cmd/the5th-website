'use client'
/* Automation Studio (3I.6) — AI-native workflow builder inside the Workspace.
   Describe an automation in plain English or build it visually: Trigger →
   Conditions → AI → Actions → Delay → Approval → End. Runs on the shared event
   bus + Tool Registry + AI router + approval engine. */
import { useState } from 'react'
import { T, Card, Button, PageHeader, EmptyState, Modal, useAdminFetch, adminSend, fmtDate, money } from '@/components/admin/ui'

type Row = Record<string, unknown>
interface Catalogs { triggers: string[]; actions: string[]; conditionFields: string[]; nodeTypes: string[] }

const NODE_META: Record<string, { icon: string; label: string; color: string }> = {
  trigger: { icon: '⚡', label: 'Trigger', color: '#C9A84C' },
  condition: { icon: '⑃', label: 'Condition', color: '#0369a1' },
  ai: { icon: '✦', label: 'AI', color: '#7c3aed' },
  action: { icon: '▶', label: 'Action', color: '#16a34a' },
  notify: { icon: '🔔', label: 'Notify', color: '#d97706' },
  delay: { icon: '⏱', label: 'Delay', color: '#6b7280' },
  approval: { icon: '✋', label: 'Approval', color: '#dc2626' },
  end: { icon: '■', label: 'End', color: '#9ca3af' },
}
const statusColor: Record<string, string> = { published: '#16a34a', draft: '#6b7280', paused: '#d97706', success: '#16a34a', error: '#dc2626', awaiting_approval: '#d97706', scheduled: '#0369a1', running: '#0369a1', test: '#7c3aed' }
const pill = (s: string) => <span className="a-pill" style={{ background: `${statusColor[s] || '#6b7280'}1a`, color: statusColor[s] || '#6b7280' }}>{String(s).replace(/_/g, ' ')}</span>
const uid = () => 'n' + Math.random().toString(36).slice(2, 8)

const TABS = ['Workflows', 'Templates', 'Runs', 'Approvals'] as const
type Tab = typeof TABS[number]

export default function AutomationStudio() {
  const [tab, setTab] = useState<Tab>('Workflows')
  const { data, reload } = useAdminFetch<{ workflows: Row[]; catalogs: Catalogs; templates: Row[] }>('/api/admin/automation')
  const [editing, setEditing] = useState<Row | null>(null)
  const catalogs = data?.catalogs

  return (
    <>
      <PageHeader title="Automation Studio" subtitle="AI-native workflows across your whole business"
        actions={<Button onClick={() => setEditing(newWorkflow())}>＋ New workflow</Button>} />
      <div style={{ display: 'flex', gap: 6, marginBottom: 18, flexWrap: 'wrap' }}>
        {TABS.map((t) => <button key={t} className="tab-btn" onClick={() => setTab(t)} style={{ background: tab === t ? T.green2 : '#fff', color: tab === t ? '#fff' : T.sub, border: `1px solid ${tab === t ? T.green2 : T.border}` }}>{t}</button>)}
      </div>
      {tab === 'Workflows' && <WorkflowsTab data={data} reload={reload} onEdit={setEditing} />}
      {tab === 'Templates' && <TemplatesTab templates={data?.templates || []} onUse={async (key) => { const r = await adminSend('/api/admin/automation', 'POST', { action: 'instantiate', key }) as Row; if (r?.workflow) { setEditing(r.workflow as Row); reload() } }} />}
      {tab === 'Runs' && <RunsTab />}
      {tab === 'Approvals' && <ApprovalsTab />}
      {editing && catalogs && <Builder workflow={editing} catalogs={catalogs} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); reload() }} />}
    </>
  )
}

function newWorkflow(): Row { return { name: 'Untitled workflow', description: '', category: 'custom', status: 'draft', trigger: { type: 'manual', config: {} }, graph: { nodes: [{ id: uid(), type: 'trigger', config: {} }, { id: uid(), type: 'end', config: {} }] } } }

// ── Workflows dashboard ──
function WorkflowsTab({ data, reload, onEdit }: { data?: { workflows: Row[] } | null; reload: () => void; onEdit: (w: Row) => void }) {
  const [desc, setDesc] = useState('')
  const [gen, setGen] = useState(false)
  const wfs = data?.workflows || []
  const stat = (f: (w: Row) => boolean) => wfs.filter(f).length
  const runsTotal = wfs.reduce((s, w) => s + Number(w.runs || 0), 0)
  const succ = wfs.reduce((s, w) => s + Number(w.success_count || 0), 0)
  const fail = wfs.reduce((s, w) => s + Number(w.fail_count || 0), 0)
  const rate = succ + fail > 0 ? Math.round((succ / (succ + fail)) * 100) : 100

  const generate = async () => {
    if (!desc.trim()) return
    setGen(true)
    try { const r = await adminSend('/api/admin/automation', 'POST', { action: 'generate', description: desc }) as Row; if (r?.ok && r.workflow) onEdit(r.workflow as Row); else alert((r?.error as string) || 'Could not generate') }
    catch (e) { alert(String(e instanceof Error ? e.message : e)) } finally { setGen(false) }
  }
  const toggle = async (w: Row) => { await adminSend('/api/admin/automation', 'POST', { action: 'toggle', id: w.id, status: w.status === 'published' ? 'paused' : 'published' }); reload() }
  const test = async (w: Row) => { const r = await adminSend('/api/admin/automation', 'POST', { action: 'test', id: w.id, sample: { email: 'test@example.com', name: 'Test Lead', lead_score: 80, amount: 1500 } }) as Row; const run = r?.run as Row; alert(`Test: ${run?.status}\n${(run?.steps as Row[] || []).map((s) => `• ${s.type}: ${s.output || s.error || ''}`).join('\n').slice(0, 800)}`) }
  const del = async (w: Row) => { if (!confirm(`Delete "${w.name}"?`)) return; await adminSend('/api/admin/automation', 'POST', { action: 'delete', id: w.id }); reload() }

  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(130px,1fr))', gap: 12, marginBottom: 18 }}>
        {[['Active', stat((w) => w.status === 'published')], ['Paused', stat((w) => w.status === 'paused')], ['Drafts', stat((w) => w.status === 'draft')], ['Total runs', runsTotal], ['Success rate', `${rate}%`]].map(([k, v]) => (
          <Card key={k as string} pad={16}><div style={{ fontSize: 22, fontWeight: 800, color: T.ink }}>{v as string}</div><div style={{ fontSize: 12, color: T.sub }}>{k as string}</div></Card>
        ))}
      </div>

      <Card pad={18} style={{ marginBottom: 18, background: 'linear-gradient(150deg,#2A1830,#160D1A)', border: '1px solid rgba(201,168,76,.2)' }}>
        <div style={{ fontSize: 14, fontWeight: 800, color: '#fff', marginBottom: 8 }}>✦ Describe an automation — AI builds it</div>
        <div style={{ display: 'flex', gap: 8 }}>
          <input className="a-input" style={{ background: 'rgba(255,255,255,.06)', color: '#fff', border: '1px solid rgba(255,255,255,.14)' }} placeholder="e.g. When someone books a strategy call, generate a meeting brief and notify me" value={desc} onChange={(e) => setDesc(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && generate()} />
          <Button disabled={gen || !desc.trim()} onClick={generate}>{gen ? 'Building…' : 'Generate'}</Button>
        </div>
      </Card>

      {wfs.length === 0 ? <EmptyState title="No workflows yet" hint="Describe one above, start from a template, or build from scratch." /> : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(340px,1fr))', gap: 14 }}>
          {wfs.map((w) => {
            const wsucc = Number(w.success_count || 0), wfail = Number(w.fail_count || 0)
            return (
              <Card key={w.id as string} pad={18}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <span style={{ fontSize: 15, fontWeight: 800, color: T.ink, flex: 1 }}>{w.name as string}</span>{pill(w.status as string)}
                </div>
                <div style={{ fontSize: 12.5, color: T.sub, minHeight: 32, marginBottom: 10 }}>{(w.description as string) || '—'}</div>
                <div style={{ display: 'flex', gap: 10, fontSize: 11.5, color: T.muted, marginBottom: 12 }}>
                  <span>⚡ {(w.trigger as Row)?.type as string || 'manual'}</span><span>· {w.runs as number || 0} runs</span>
                  {wsucc + wfail > 0 ? <span>· {Math.round((wsucc / (wsucc + wfail)) * 100)}% ok</span> : null}
                  {w.last_run_at ? <span style={{ marginLeft: 'auto' }}>{fmtDate(w.last_run_at as string)}</span> : null}
                </div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  <Button onClick={() => onEdit(w)}>Edit</Button>
                  <Button variant="ghost" onClick={() => toggle(w)}>{w.status === 'published' ? 'Pause' : 'Publish'}</Button>
                  <Button variant="ghost" onClick={() => test(w)}>Test</Button>
                  <button className="a-pill" onClick={() => del(w)} style={{ cursor: 'pointer', border: 'none', background: '#eef2f0', color: T.danger, marginLeft: 'auto' }}>✕</button>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </>
  )
}

// ── Visual builder ──
function Builder({ workflow, catalogs, onClose, onSaved }: { workflow: Row; catalogs: Catalogs; onClose: () => void; onSaved: () => void }) {
  const [wf, setWf] = useState<Row>(JSON.parse(JSON.stringify(workflow)))
  const [busy, setBusy] = useState('')
  const [openNode, setOpenNode] = useState<string | null>(null)
  const nodes = ((wf.graph as Row)?.nodes as Row[]) || []
  const setNodes = (ns: Row[]) => setWf({ ...wf, graph: { nodes: ns } })
  const trigger = (wf.trigger as Row) || { type: 'manual', config: {} }
  const setTrigger = (t: Row) => setWf({ ...wf, trigger: t })

  const addNode = (type: string, atIdx: number) => {
    const node: Row = { id: uid(), type, config: defaultConfig(type) }
    const ns = [...nodes]; ns.splice(atIdx, 0, node); setNodes(ns); setOpenNode(node.id as string)
  }
  const updateNode = (id: string, config: Row) => setNodes(nodes.map((n) => n.id === id ? { ...n, config } : n))
  const removeNode = (id: string) => setNodes(nodes.filter((n) => n.id !== id))
  const move = (i: number, dir: -1 | 1) => { const j = i + dir; if (j < 1 || j > nodes.length - 2) return; const ns = [...nodes]; ;[ns[i], ns[j]] = [ns[j], ns[i]]; setNodes(ns) }

  const save = async (publish?: boolean) => {
    setBusy(publish ? 'publish' : 'save')
    try {
      const r = await adminSend('/api/admin/automation', 'POST', { action: 'save', ...wf }) as Row
      const saved = r?.workflow as Row
      if (saved?.id && publish) await adminSend('/api/admin/automation', 'POST', { action: 'publish', id: saved.id })
      onSaved()
    } catch (e) { alert(String(e instanceof Error ? e.message : e)) } finally { setBusy('') }
  }
  const test = async () => {
    if (!wf.id) { await save(); return }
    setBusy('test')
    try { const r = await adminSend('/api/admin/automation', 'POST', { action: 'test', id: wf.id, sample: { email: 'test@example.com', name: 'Test Lead', lead_score: 80, amount: 1500, interest: 'coaching' } }) as Row; const run = r?.run as Row; alert(`Test: ${run?.status}\n${(run?.steps as Row[] || []).map((s) => `• ${s.type}: ${String(s.output || s.error || '').slice(0, 120)}`).join('\n')}`) }
    finally { setBusy('') }
  }

  const AddMenu = ({ atIdx }: { atIdx: number }) => (
    <div style={{ display: 'flex', justifyContent: 'center', margin: '2px 0' }}>
      <details style={{ position: 'relative' }}>
        <summary style={{ listStyle: 'none', cursor: 'pointer', width: 26, height: 26, borderRadius: '50%', border: `1px dashed ${T.border}`, color: T.sub, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15 }}>＋</summary>
        <div style={{ position: 'absolute', zIndex: 5, left: '50%', transform: 'translateX(-50%)', marginTop: 4, background: '#fff', border: `1px solid ${T.border}`, borderRadius: 10, boxShadow: '0 10px 30px rgba(0,0,0,.15)', padding: 6, display: 'flex', flexDirection: 'column', gap: 2, minWidth: 130 }}>
          {['condition', 'ai', 'action', 'notify', 'delay', 'approval'].map((t) => (
            <button key={t} onClick={(e) => { addNode(t, atIdx); (e.currentTarget.closest('details') as HTMLDetailsElement).open = false }} style={{ display: 'flex', gap: 8, alignItems: 'center', border: 'none', background: 'none', padding: '7px 9px', borderRadius: 7, cursor: 'pointer', fontSize: 13, color: T.text, textAlign: 'left' }}>
              <span style={{ color: NODE_META[t].color }}>{NODE_META[t].icon}</span>{NODE_META[t].label}
            </button>
          ))}
        </div>
      </details>
    </div>
  )

  return (
    <Modal open onClose={onClose} title={(wf.id ? 'Edit' : 'New') + ' workflow'}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.15fr', gap: 20, minHeight: 420 }}>
        {/* Meta + trigger */}
        <div style={{ maxHeight: '64vh', overflowY: 'auto', paddingRight: 6 }}>
          <L label="Name"><input className="a-input" value={wf.name as string} onChange={(e) => setWf({ ...wf, name: e.target.value })} /></L>
          <L label="Description"><textarea className="a-input" style={{ minHeight: 48 }} value={(wf.description as string) || ''} onChange={(e) => setWf({ ...wf, description: e.target.value })} /></L>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <L label="Category"><select className="a-input" value={wf.category as string} onChange={(e) => setWf({ ...wf, category: e.target.value })}>{['sales', 'crm', 'marketing', 'content', 'meetings', 'revenue', 'support', 'ai', 'custom'].map((c) => <option key={c}>{c}</option>)}</select></L>
            <L label="Trigger"><select className="a-input" value={trigger.type as string} onChange={(e) => setTrigger({ ...trigger, type: e.target.value })}>{catalogs.triggers.map((t) => <option key={t} value={t}>{t}</option>)}</select></L>
          </div>
          <div style={{ fontSize: 11.5, color: T.muted, marginTop: 6 }}>Trigger fires the workflow. Add trigger-level conditions on the trigger node below, or gate steps with a Condition node.</div>
        </div>

        {/* Flow */}
        <div style={{ maxHeight: '64vh', overflowY: 'auto' }}>
          {nodes.map((node, i) => (
            <div key={node.id as string}>
              <NodeCard node={node} open={openNode === node.id} onToggle={() => setOpenNode(openNode === node.id ? null : node.id as string)}
                onChange={(cfg) => updateNode(node.id as string, cfg)} onRemove={() => removeNode(node.id as string)}
                canRemove={node.type !== 'trigger' && node.type !== 'end'} catalogs={catalogs} triggerType={trigger.type as string}
                onMoveUp={() => move(i, -1)} onMoveDown={() => move(i, 1)} />
              {i < nodes.length - 1 && <>
                <div style={{ display: 'flex', justifyContent: 'center' }}><div style={{ width: 2, height: 10, background: T.border }} /></div>
                <AddMenu atIdx={i + 1} />
                <div style={{ display: 'flex', justifyContent: 'center' }}><div style={{ width: 2, height: 10, background: T.border }} /></div>
              </>}
            </div>
          ))}
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8, marginTop: 16, borderTop: `1px solid ${T.border}`, paddingTop: 14 }}>
        <Button disabled={!!busy} onClick={() => save(false)}>{busy === 'save' ? 'Saving…' : 'Save draft'}</Button>
        <Button disabled={!!busy} onClick={() => save(true)}>{busy === 'publish' ? 'Publishing…' : 'Save & publish'}</Button>
        <Button variant="ghost" disabled={!!busy} onClick={test}>{busy === 'test' ? 'Testing…' : 'Test run'}</Button>
        <Button variant="ghost" onClick={onClose} >Close</Button>
      </div>
    </Modal>
  )
}

function defaultConfig(type: string): Row {
  if (type === 'condition') return { conditions: [{ field: 'lead_score', op: 'gte', value: '50' }], match: 'all' }
  if (type === 'ai') return { prompt: 'Summarize the context for {{name}}.', task: 'cheap', output: 'ai' }
  if (type === 'action') return { action: 'create_task', params: { title: 'Follow up with {{name}}', due_in_days: 1 } }
  if (type === 'notify') return { title: 'Automation', body: '{{name}} — {{email}}' }
  if (type === 'delay') return { hours: 1 }
  if (type === 'approval') return { title: 'Approve this step', note: '' }
  return {}
}

function NodeCard({ node, open, onToggle, onChange, onRemove, canRemove, catalogs, onMoveUp, onMoveDown }: { node: Row; open: boolean; onToggle: () => void; onChange: (c: Row) => void; onRemove: () => void; canRemove: boolean; catalogs: Catalogs; triggerType: string; onMoveUp: () => void; onMoveDown: () => void }) {
  const meta = NODE_META[node.type as string] || NODE_META.action
  const cfg = (node.config as Row) || {}
  return (
    <div style={{ border: `1px solid ${open ? meta.color : T.border}`, borderRadius: 12, overflow: 'hidden', background: '#fff' }}>
      <div onClick={canRemove ? onToggle : undefined} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 13px', cursor: canRemove ? 'pointer' : 'default', borderLeft: `3px solid ${meta.color}` }}>
        <span style={{ color: meta.color, fontSize: 15 }}>{meta.icon}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13.5, fontWeight: 700, color: T.ink }}>{meta.label}</div>
          <div style={{ fontSize: 11.5, color: T.muted, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{summarize(node)}</div>
        </div>
        {canRemove && <>
          <button onClick={(e) => { e.stopPropagation(); onMoveUp() }} style={miniBtn}>↑</button>
          <button onClick={(e) => { e.stopPropagation(); onMoveDown() }} style={miniBtn}>↓</button>
          <button onClick={(e) => { e.stopPropagation(); onRemove() }} style={{ ...miniBtn, color: T.danger }}>✕</button>
        </>}
      </div>
      {open && canRemove && <div style={{ padding: '4px 13px 13px', borderTop: `1px solid ${T.border}` }}><NodeEditor node={node} cfg={cfg} onChange={onChange} catalogs={catalogs} /></div>}
    </div>
  )
}
const miniBtn: React.CSSProperties = { border: 'none', background: '#f1f3f2', width: 22, height: 22, borderRadius: 6, cursor: 'pointer', color: '#6b7280', fontSize: 12 }

function summarize(node: Row): string {
  const c = (node.config as Row) || {}
  switch (node.type) {
    case 'trigger': return 'When the workflow trigger fires'
    case 'condition': return `${((c.conditions as Row[]) || []).length} condition(s), match ${c.match || 'all'}`
    case 'ai': return String(c.prompt || '').slice(0, 60) || 'AI reasoning step'
    case 'action': return `${c.action} ${JSON.stringify(c.params || {}).slice(0, 40)}`
    case 'notify': return String(c.title || 'Notification')
    case 'delay': return `Wait ${c.days || 0}d ${c.hours || 0}h ${c.minutes || 0}m`
    case 'approval': return String(c.title || 'Wait for human approval')
    case 'end': return 'Workflow ends'
    default: return ''
  }
}

function NodeEditor({ node, cfg, onChange, catalogs }: { node: Row; cfg: Row; onChange: (c: Row) => void; catalogs: Catalogs }) {
  const set = (k: string, v: unknown) => onChange({ ...cfg, [k]: v })
  if (node.type === 'ai') return (
    <>
      <L label="Prompt (use {{field}} / {{prevOutput}})"><textarea className="a-input" style={{ minHeight: 70, fontSize: 12.5 }} value={(cfg.prompt as string) || ''} onChange={(e) => set('prompt', e.target.value)} /></L>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <L label="Model"><select className="a-input" value={(cfg.task as string) || 'cheap'} onChange={(e) => set('task', e.target.value)}><option value="cheap">Fast (Haiku)</option><option value="chat">Smart (Sonnet)</option></select></L>
        <L label="Save output as"><input className="a-input" value={(cfg.output as string) || 'ai'} onChange={(e) => set('output', e.target.value)} /></L>
      </div>
    </>
  )
  if (node.type === 'action') return (
    <>
      <L label="Action"><select className="a-input" value={(cfg.action as string) || catalogs.actions[0]} onChange={(e) => set('action', e.target.value)}>{catalogs.actions.map((a) => <option key={a}>{a}</option>)}</select></L>
      <L label="Params (JSON — values may use {{field}})"><textarea className="a-input" style={{ minHeight: 60, fontSize: 12, fontFamily: 'monospace' }} defaultValue={JSON.stringify(cfg.params || {}, null, 2)} onBlur={(e) => { try { set('params', JSON.parse(e.target.value || '{}')) } catch { alert('Invalid JSON') } }} /></L>
    </>
  )
  if (node.type === 'notify') return (
    <>
      <L label="Title"><input className="a-input" value={(cfg.title as string) || ''} onChange={(e) => set('title', e.target.value)} /></L>
      <L label="Body"><textarea className="a-input" style={{ minHeight: 44 }} value={(cfg.body as string) || ''} onChange={(e) => set('body', e.target.value)} /></L>
    </>
  )
  if (node.type === 'delay') return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
      {['days', 'hours', 'minutes'].map((u) => <L key={u} label={u}><input className="a-input" type="number" value={(cfg[u] as number) || 0} onChange={(e) => set(u, Number(e.target.value))} /></L>)}
    </div>
  )
  if (node.type === 'approval') return (
    <>
      <L label="Approval title"><input className="a-input" value={(cfg.title as string) || ''} onChange={(e) => set('title', e.target.value)} /></L>
      <L label="Note (what to review — may use {{field}})"><textarea className="a-input" style={{ minHeight: 44 }} value={(cfg.note as string) || ''} onChange={(e) => set('note', e.target.value)} /></L>
    </>
  )
  if (node.type === 'condition') {
    const conds = (cfg.conditions as Row[]) || []
    const setCond = (i: number, k: string, v: string) => set('conditions', conds.map((c, j) => j === i ? { ...c, [k]: v } : c))
    return (
      <>
        <L label="Match"><select className="a-input" value={(cfg.match as string) || 'all'} onChange={(e) => set('match', e.target.value)}><option value="all">All (AND)</option><option value="any">Any (OR)</option></select></L>
        {conds.map((c, i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 0.8fr 1fr auto', gap: 6, marginBottom: 6 }}>
            <select className="a-input" value={c.field as string} onChange={(e) => setCond(i, 'field', e.target.value)}>{catalogs.conditionFields.map((f) => <option key={f}>{f}</option>)}</select>
            <select className="a-input" value={c.op as string} onChange={(e) => setCond(i, 'op', e.target.value)}>{['eq', 'ne', 'gt', 'gte', 'lt', 'lte', 'contains', 'exists'].map((o) => <option key={o}>{o}</option>)}</select>
            <input className="a-input" value={c.value as string} onChange={(e) => setCond(i, 'value', e.target.value)} />
            <button style={miniBtn} onClick={() => set('conditions', conds.filter((_, j) => j !== i))}>✕</button>
          </div>
        ))}
        <Button variant="ghost" onClick={() => set('conditions', [...conds, { field: 'lead_score', op: 'gte', value: '50' }])}>＋ Condition</Button>
      </>
    )
  }
  return null
}
function L({ label, children }: { label: string; children: React.ReactNode }) { return <label style={{ display: 'block', marginBottom: 10 }}><span style={{ fontSize: 11.5, fontWeight: 700, color: T.sub, textTransform: 'uppercase', letterSpacing: '.03em' }}>{label}</span><div style={{ marginTop: 4 }}>{children}</div></label> }

// ── Templates ──
function TemplatesTab({ templates, onUse }: { templates: Row[]; onUse: (key: string) => void }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(320px,1fr))', gap: 14 }}>
      {templates.map((t) => (
        <Card key={t.key as string} pad={18}>
          <div style={{ fontSize: 26, marginBottom: 8 }}>{t.icon as string}</div>
          <div style={{ fontSize: 15, fontWeight: 800, color: T.ink, marginBottom: 4 }}>{t.name as string}</div>
          <div style={{ fontSize: 13, color: T.sub, marginBottom: 12, minHeight: 40 }}>{t.description as string}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><span className="a-pill" style={{ background: '#eef2f0', color: T.sub, textTransform: 'capitalize' }}>{t.category as string}</span><Button style={{ marginLeft: 'auto' }} onClick={() => onUse(t.key as string)}>Use template</Button></div>
        </Card>
      ))}
    </div>
  )
}

// ── Runs ──
function RunsTab() {
  const { data, loading } = useAdminFetch<{ runs: Row[] }>('/api/admin/automation/runs')
  const [open, setOpen] = useState<string | null>(null)
  if (loading && !data) return <div className="skeleton" style={{ height: 200, borderRadius: 14 }} />
  const runs = data?.runs || []
  if (!runs.length) return <EmptyState title="No runs yet" hint="Publish a workflow (or hit Test) to see executions here." />
  return (
    <>
      <Card pad={0}>
        {runs.map((r) => (
          <div key={r.id as string} onClick={() => setOpen(r.id as string)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 16px', borderBottom: `1px solid ${T.border}`, cursor: 'pointer' }}>
            <span style={{ flex: 1, fontSize: 13.5, fontWeight: 600, color: T.ink }}>{r.workflow_name as string}{r.is_test ? <span className="a-pill" style={{ marginLeft: 8, background: '#f3e8ff', color: '#7c3aed' }}>test</span> : null}</span>
            <span style={{ fontSize: 11.5, color: T.muted }}>⚡ {r.trigger_type as string}</span>
            <span style={{ fontSize: 11.5, color: T.muted }}>{money(Number(r.cost_usd || 0))}</span>
            {pill(r.status as string)}
            <span style={{ fontSize: 11.5, color: T.muted, width: 92, textAlign: 'right' }}>{fmtDate(r.created_at as string)}</span>
          </div>
        ))}
      </Card>
      {open && <RunModal id={open} onClose={() => setOpen(null)} />}
    </>
  )
}
function RunModal({ id, onClose }: { id: string; onClose: () => void }) {
  const { data, loading } = useAdminFetch<{ run: Row }>(`/api/admin/automation/runs?id=${id}`)
  const r = data?.run
  return (
    <Modal open onClose={onClose} title="Execution detail">
      {loading || !r ? <div className="skeleton" style={{ height: 120 }} /> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}><b style={{ color: T.ink }}>{r.workflow_name as string}</b>{pill(r.status as string)}<span style={{ fontSize: 12, color: T.muted }}>{money(Number(r.cost_usd || 0))} · {r.duration_ms ? `${Math.round(Number(r.duration_ms) / 100) / 10}s` : '—'}</span></div>
          {(r.steps as Row[] || []).map((s, i) => (
            <div key={i} style={{ borderLeft: `2px solid ${s.ok === false ? '#dc2626' : (NODE_META[s.type as string]?.color || T.border)}`, paddingLeft: 10 }}>
              <div style={{ fontSize: 12.5, fontWeight: 600, color: T.ink }}>{NODE_META[s.type as string]?.icon} {s.type as string}{s.action ? ` · ${s.action}` : ''}</div>
              <div style={{ fontSize: 12, color: s.ok === false ? '#dc2626' : T.sub, whiteSpace: 'pre-wrap' }}>{String(s.output || s.error || '').slice(0, 600)}</div>
            </div>
          ))}
        </div>
      )}
    </Modal>
  )
}

// ── Approvals ──
function ApprovalsTab() {
  const { data, loading, reload } = useAdminFetch<{ approvals: Row[] }>('/api/admin/automation/runs?pending=1')
  const [busy, setBusy] = useState<string | null>(null)
  const decide = async (run_id: string, action: 'approve' | 'reject') => { setBusy(run_id); try { await adminSend('/api/admin/automation', 'POST', { action, run_id }); reload() } finally { setBusy(null) } }
  if (loading && !data) return <div className="skeleton" style={{ height: 120, borderRadius: 14 }} />
  const rows = data?.approvals || []
  if (!rows.length) return <EmptyState title="No pending approvals" hint="Workflow approval steps land here for your sign-off." />
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {rows.map((a) => (
        <Card key={a.id as string} pad={16}>
          <div style={{ fontSize: 14, fontWeight: 700, color: T.ink, marginBottom: 6 }}>{a.workflow_name as string}</div>
          <div style={{ fontSize: 13, color: T.sub, whiteSpace: 'pre-wrap', marginBottom: 12 }}>{(a.approval_note as string) || 'Approve to continue this workflow.'}</div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Button disabled={busy === a.id} onClick={() => decide(a.id as string, 'approve')}>Approve & continue</Button>
            <Button variant="ghost" disabled={busy === a.id} onClick={() => decide(a.id as string, 'reject')}>Reject</Button>
          </div>
        </Card>
      ))}
    </div>
  )
}
