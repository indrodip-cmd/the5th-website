'use client'
/* Agent Platform console (3I.5) — the Automation OS surface inside the Workspace.
   Run specialist agents, resolve the human-approval queue, audit execution
   history, test in the Playground, manage versioned prompts + MCP servers, and
   browse the Tool Registry. One login, one shell, one AI platform. */
import { useState } from 'react'
import { T, Card, Button, EmptyState, PageHeader, Modal, useAdminFetch, adminSend, fmtDate, money } from '@/components/admin/ui'

type Row = Record<string, unknown>
const RISK: Record<string, string> = { low: '#16a34a', medium: '#d97706', high: '#dc2626' }
const STATUS_C: Record<string, string> = { completed: '#16a34a', running: '#0369a1', awaiting_approval: '#d97706', blocked: '#dc2626', error: '#dc2626' }
const riskPill = (r: string) => <span className="a-pill" style={{ background: `${RISK[r] || '#6b7280'}1a`, color: RISK[r] || '#6b7280', textTransform: 'capitalize' }}>{r}</span>
const statusPill = (s: string) => <span className="a-pill" style={{ background: `${STATUS_C[s] || '#6b7280'}1a`, color: STATUS_C[s] || '#6b7280' }}>{String(s).replace(/_/g, ' ')}</span>

const TABS = ['Agents', 'Approvals', 'History', 'Playground', 'Prompts', 'MCP', 'Registry'] as const
type Tab = typeof TABS[number]

export default function AgentPlatform() {
  const [tab, setTab] = useState<Tab>('Agents')
  const { data } = useAdminFetch<{ pendingApprovals: number }>('/api/admin/agents')
  const pending = data?.pendingApprovals || 0
  return (
    <>
      <PageHeader title="Agent Platform" subtitle="Specialist AI agents, tools & automation — under human approval" />
      <div style={{ display: 'flex', gap: 6, marginBottom: 18, flexWrap: 'wrap' }}>
        {TABS.map((t) => (
          <button key={t} className="tab-btn" onClick={() => setTab(t)} style={{ background: tab === t ? T.green2 : '#fff', color: tab === t ? '#fff' : T.sub, border: `1px solid ${tab === t ? T.green2 : T.border}` }}>
            {t}{t === 'Approvals' && pending > 0 ? <span style={{ marginLeft: 6, background: '#dc2626', color: '#fff', borderRadius: 10, padding: '0 6px', fontSize: 11 }}>{pending}</span> : null}
          </button>
        ))}
      </div>
      {tab === 'Agents' && <AgentsTab />}
      {tab === 'Approvals' && <ApprovalsTab />}
      {tab === 'History' && <HistoryTab />}
      {tab === 'Playground' && <PlaygroundTab />}
      {tab === 'Prompts' && <PromptsTab />}
      {tab === 'MCP' && <McpTab />}
      {tab === 'Registry' && <RegistryTab />}
    </>
  )
}

// ── Agents ──
function AgentsTab() {
  const { data, loading } = useAdminFetch<{ agents: Row[]; recent: Row[] }>('/api/admin/agents')
  const [run, setRun] = useState<Row | null>(null)
  if (loading && !data) return <div className="skeleton" style={{ height: 200, borderRadius: 14 }} />
  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 14 }}>
        {(data?.agents || []).map((a) => (
          <Card key={a.key as string} pad={18}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
              <div style={{ fontSize: 15, fontWeight: 800, color: T.ink }}>{a.name as string}</div>
              <span className="a-pill" style={{ background: '#eef2f0', color: T.sub, textTransform: 'capitalize' }}>{a.autonomy as string}</span>
            </div>
            <div style={{ fontSize: 12, fontWeight: 600, color: T.green, marginBottom: 6 }}>{a.role as string}</div>
            <div style={{ fontSize: 13, color: T.sub, marginBottom: 12, minHeight: 34 }}>{a.description as string}</div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 11.5, color: T.muted }}>{(a.allowed_tools as string[] || []).length} tools</span>
              <Button onClick={() => setRun(a)}>Run</Button>
            </div>
          </Card>
        ))}
      </div>
      {run && <RunModal agent={run} onClose={() => setRun(null)} />}
    </>
  )
}

function RunModal({ agent, onClose }: { agent: Row; onClose: () => void }) {
  const [goal, setGoal] = useState('')
  const [busy, setBusy] = useState(false)
  const [res, setRes] = useState<Row | null>(null)
  const go = async () => {
    if (!goal.trim()) return
    setBusy(true); setRes(null)
    try { setRes(await adminSend('/api/admin/agents', 'POST', { agent_key: agent.key, goal }) as Row) }
    catch (e) { setRes({ status: 'error', reply: String(e instanceof Error ? e.message : e) }) } finally { setBusy(false) }
  }
  return (
    <Modal open onClose={onClose} title={`Run ${agent.name as string}`}>
      <div style={{ fontSize: 13, color: T.sub, marginBottom: 10 }}>{agent.description as string}</div>
      <textarea className="a-input" style={{ minHeight: 80, marginBottom: 10 }} placeholder="What should this agent do? Be specific." value={goal} onChange={(e) => setGoal(e.target.value)} />
      <Button disabled={busy || !goal.trim()} onClick={go}>{busy ? 'Working…' : 'Run agent'}</Button>
      {res && (
        <div style={{ marginTop: 16, borderTop: `1px solid ${T.border}`, paddingTop: 14 }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 10 }}>
            {statusPill(res.status as string)}
            {Number(res.pendingApprovals) > 0 ? <span style={{ fontSize: 12.5, color: RISK.high }}>{res.pendingApprovals as number} action(s) awaiting your approval →</span> : null}
          </div>
          <div style={{ fontSize: 14, color: T.text, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{res.reply as string}</div>
          {(res.toolsUsed as string[] || []).length > 0 && <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginTop: 10 }}>{[...new Set(res.toolsUsed as string[])].map((t) => <span key={t} className="a-pill" style={{ background: '#eef2f0', color: T.green, fontSize: 11 }}>⚡ {t}</span>)}</div>}
        </div>
      )}
    </Modal>
  )
}

// ── Approvals ──
function ApprovalsTab() {
  const { data, loading, reload } = useAdminFetch<{ approvals: Row[] }>('/api/admin/agents/approvals')
  const [busy, setBusy] = useState<string | null>(null)
  const decide = async (id: string, decision: 'approve' | 'reject') => {
    setBusy(id)
    try { await adminSend('/api/admin/agents/approvals', 'POST', { id, decision }); reload() }
    catch (e) { alert(String(e instanceof Error ? e.message : e)) } finally { setBusy(null) }
  }
  if (loading && !data) return <div className="skeleton" style={{ height: 120, borderRadius: 14 }} />
  const rows = data?.approvals || []
  if (rows.length === 0) return <EmptyState title="No pending approvals" hint="When an agent proposes a data-changing action, it lands here for your sign-off." />
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {rows.map((a) => (
        <Card key={a.id as string} pad={16}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            {riskPill(a.risk as string)}
            <span style={{ fontSize: 14, fontWeight: 700, color: T.ink }}>{a.tool_name as string}</span>
            <span style={{ fontSize: 12, color: T.muted }}>· {a.agent_key as string}</span>
            <span style={{ marginLeft: 'auto', fontSize: 12, color: T.muted }}>{fmtDate(a.created_at as string)}</span>
          </div>
          {(a.execution as Row)?.goal ? <div style={{ fontSize: 12.5, color: T.sub, marginBottom: 8 }}>Goal: {(a.execution as Row).goal as string}</div> : null}
          <pre style={{ background: '#fafbfa', border: `1px solid ${T.border}`, borderRadius: 8, padding: 10, fontSize: 12, color: T.text, overflowX: 'auto', margin: '0 0 12px' }}>{JSON.stringify(a.args, null, 2)}</pre>
          <div style={{ display: 'flex', gap: 8 }}>
            <Button disabled={busy === a.id} onClick={() => decide(a.id as string, 'approve')}>{busy === a.id ? '…' : 'Approve & run'}</Button>
            <Button variant="ghost" disabled={busy === a.id} onClick={() => decide(a.id as string, 'reject')}>Reject</Button>
          </div>
        </Card>
      ))}
    </div>
  )
}

// ── History ──
function HistoryTab() {
  const { data, loading } = useAdminFetch<{ executions: Row[] }>('/api/admin/agents/executions')
  const [open, setOpen] = useState<string | null>(null)
  if (loading && !data) return <div className="skeleton" style={{ height: 200, borderRadius: 14 }} />
  const rows = data?.executions || []
  if (rows.length === 0) return <EmptyState title="No agent runs yet" hint="Run an agent to see its full plan, tools and results here." />
  return (
    <>
      <Card pad={0}>
        {rows.map((e) => (
          <div key={e.id as string} onClick={() => setOpen(e.id as string)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderBottom: `1px solid ${T.border}`, cursor: 'pointer' }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: T.ink, width: 110, flexShrink: 0 }}>{e.agent_key as string}</span>
            <span style={{ flex: 1, minWidth: 0, fontSize: 13, color: T.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{e.goal as string}</span>
            <span style={{ fontSize: 11.5, color: T.muted }}>{(e.tools_used as string[] || []).length} tools</span>
            <span style={{ fontSize: 11.5, color: T.muted }}>{money(Number(e.cost_usd || 0))}</span>
            {statusPill(e.status as string)}
            <span style={{ fontSize: 11.5, color: T.muted, width: 96, textAlign: 'right' }}>{fmtDate(e.created_at as string)}</span>
          </div>
        ))}
      </Card>
      {open && <ExecutionModal id={open} onClose={() => setOpen(null)} />}
    </>
  )
}

function ExecutionModal({ id, onClose }: { id: string; onClose: () => void }) {
  const { data, loading } = useAdminFetch<{ execution: Row; approvals: Row[] }>(`/api/admin/agents/executions?id=${id}`)
  const ex = data?.execution
  return (
    <Modal open onClose={onClose} title="Execution detail">
      {loading || !ex ? <div className="skeleton" style={{ height: 120 }} /> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ fontSize: 14, fontWeight: 800, color: T.ink }}>{ex.agent_key as string}</span>
            {statusPill(ex.status as string)}
            <span style={{ fontSize: 12, color: T.muted }}>{money(Number(ex.cost_usd || 0))} · {ex.duration_ms ? `${Math.round(Number(ex.duration_ms) / 100) / 10}s` : '—'}</span>
          </div>
          <div style={{ fontSize: 13, color: T.sub }}><b>Goal:</b> {ex.goal as string}</div>
          {ex.result ? <div style={{ fontSize: 13.5, color: T.text, lineHeight: 1.6, whiteSpace: 'pre-wrap', background: '#fafbfa', border: `1px solid ${T.border}`, borderRadius: 8, padding: 12 }}>{ex.result as string}</div> : null}
          <div style={{ fontSize: 12, fontWeight: 700, color: T.sub, textTransform: 'uppercase', letterSpacing: '.05em' }}>Steps ({(ex.steps as Row[] || []).length})</div>
          {(ex.steps as Row[] || []).map((s, i) => (
            <div key={i} style={{ borderLeft: `2px solid ${RISK[s.risk as string] || T.border}`, paddingLeft: 10 }}>
              <div style={{ fontSize: 12.5, fontWeight: 600, color: T.ink }}>{(s.type as string) === 'approval_requested' ? '⏸ approval requested' : (s.type as string) === 'approved_action' ? '✅ approved action' : '⚡ tool'} · {s.tool as string} {s.risk ? riskPill(s.risk as string) : null}</div>
              {s.output ? <pre style={{ fontSize: 11.5, color: T.sub, margin: '4px 0 0', whiteSpace: 'pre-wrap', maxHeight: 120, overflow: 'auto' }}>{String(s.output).slice(0, 800)}</pre> : null}
            </div>
          ))}
        </div>
      )}
    </Modal>
  )
}

// ── Playground ──
function PlaygroundTab() {
  const { data } = useAdminFetch<{ tools: Row[]; routes: Row[] }>('/api/admin/agents')
  const [sys, setSys] = useState('You are a helpful, grounded analyst for The5th. Use tools to get real data before answering.')
  const [task, setTask] = useState('chat')
  const [tools, setTools] = useState<string[]>([])
  const [msg, setMsg] = useState('')
  const [busy, setBusy] = useState(false)
  const [res, setRes] = useState<Row | null>(null)
  const toggle = (n: string) => setTools((t) => t.includes(n) ? t.filter((x) => x !== n) : [...t, n])
  const run = async () => {
    if (!msg.trim()) return
    setBusy(true); setRes(null)
    try { setRes(await adminSend('/api/admin/agents/playground', 'POST', { system_prompt: sys, model_task: task, tools, message: msg }) as Row) }
    catch (e) { setRes({ reply: String(e instanceof Error ? e.message : e) }) } finally { setBusy(false) }
  }
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
      <Card>
        <div style={{ fontSize: 13, fontWeight: 700, color: T.ink, marginBottom: 8 }}>Configure</div>
        <textarea className="a-input" style={{ minHeight: 90, marginBottom: 10, fontSize: 12.5 }} value={sys} onChange={(e) => setSys(e.target.value)} placeholder="System prompt" />
        <select className="a-input" style={{ marginBottom: 10 }} value={task} onChange={(e) => setTask(e.target.value)}>
          {(data?.routes || []).map((r) => <option key={r.task as string} value={r.task as string}>{r.task as string} — {r.model as string}</option>)}
        </select>
        <div style={{ fontSize: 12, fontWeight: 700, color: T.sub, marginBottom: 6 }}>Tools (mutating = dry-run)</div>
        <div style={{ maxHeight: 160, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 3, marginBottom: 10 }}>
          {(data?.tools || []).map((t) => (
            <label key={t.name as string} style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12.5, color: T.text, cursor: 'pointer' }}>
              <input type="checkbox" checked={tools.includes(t.name as string)} onChange={() => toggle(t.name as string)} />
              {t.name as string} {riskPill(t.risk as string)}
            </label>
          ))}
        </div>
        <textarea className="a-input" style={{ minHeight: 60, marginBottom: 10 }} value={msg} onChange={(e) => setMsg(e.target.value)} placeholder="Test message" />
        <Button disabled={busy || !msg.trim()} onClick={run}>{busy ? 'Running…' : 'Test run'}</Button>
      </Card>
      <Card>
        <div style={{ fontSize: 13, fontWeight: 700, color: T.ink, marginBottom: 8 }}>Result</div>
        {!res ? <EmptyState title="No run yet" /> : (
          <>
            <div style={{ fontSize: 13.5, color: T.text, lineHeight: 1.6, whiteSpace: 'pre-wrap', marginBottom: 10 }}>{res.reply as string}</div>
            {Number(res.costUsd) > 0 ? <div style={{ fontSize: 11.5, color: T.muted }}>~{money(Number(res.costUsd))} · {(res.toolsUsed as string[] || []).length} tool calls</div> : null}
            {(res.steps as Row[] || []).map((s, i) => <pre key={i} style={{ fontSize: 11, color: T.sub, background: '#fafbfa', border: `1px solid ${T.border}`, borderRadius: 6, padding: 8, margin: '8px 0 0', whiteSpace: 'pre-wrap', maxHeight: 120, overflow: 'auto' }}>{s.tool as string}{s.dry_run ? ' (dry-run)' : ''}: {String(s.output).slice(0, 500)}</pre>)}
          </>
        )}
      </Card>
    </div>
  )
}

// ── Prompts ──
function PromptsTab() {
  const { data, loading, reload } = useAdminFetch<{ keys: Row[] }>('/api/admin/agents/prompts')
  const [newKey, setNewKey] = useState('')
  const [content, setContent] = useState('')
  const save = async () => {
    if (!newKey.trim() || !content.trim()) return
    try { await adminSend('/api/admin/agents/prompts', 'POST', { action: 'save', key: newKey.trim(), content }); setNewKey(''); setContent(''); reload() }
    catch (e) { alert(String(e instanceof Error ? e.message : e)) }
  }
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
      <Card>
        <div style={{ fontSize: 13, fontWeight: 700, color: T.ink, marginBottom: 10 }}>Versioned prompts</div>
        {loading && !data ? <div className="skeleton" style={{ height: 80 }} /> : (data?.keys || []).length === 0 ? <EmptyState title="No prompts yet" hint="Prompts are versioned assets — draft, publish and roll back." /> : (data?.keys || []).map((k) => (
          <div key={k.key as string} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 0', borderBottom: `1px solid ${T.border}` }}>
            <span style={{ flex: 1, fontSize: 13.5, fontWeight: 600, color: T.ink }}>{k.key as string}</span>
            <span style={{ fontSize: 11.5, color: T.muted }}>{k.versions as number} versions</span>
            {k.published ? <span className="a-pill" style={{ background: '#dcfce7', color: '#16a34a' }}>v{k.published as number} live</span> : <span className="a-pill" style={{ background: '#fef3c7', color: '#d97706' }}>draft only</span>}
          </div>
        ))}
      </Card>
      <Card>
        <div style={{ fontSize: 13, fontWeight: 700, color: T.ink, marginBottom: 10 }}>New draft version</div>
        <input className="a-input" style={{ marginBottom: 10 }} placeholder="prompt key (e.g. sales_agent_system)" value={newKey} onChange={(e) => setNewKey(e.target.value)} />
        <textarea className="a-input" style={{ minHeight: 140, marginBottom: 10, fontSize: 12.5 }} placeholder="Prompt content…" value={content} onChange={(e) => setContent(e.target.value)} />
        <Button disabled={!newKey.trim() || !content.trim()} onClick={save}>Save draft</Button>
      </Card>
    </div>
  )
}

// ── MCP ──
function McpTab() {
  const { data, loading, reload } = useAdminFetch<{ servers: Row[] }>('/api/admin/agents/mcp')
  const [form, setForm] = useState({ slug: '', name: '', url: '' })
  const [busy, setBusy] = useState<string | null>(null)
  const save = async () => {
    if (!form.slug.trim() || !form.name.trim()) return
    try { await adminSend('/api/admin/agents/mcp', 'POST', { action: 'save', ...form }); setForm({ slug: '', name: '', url: '' }); reload() }
    catch (e) { alert(String(e instanceof Error ? e.message : e)) }
  }
  const health = async (slug: string) => { setBusy(slug); try { await adminSend('/api/admin/agents/mcp', 'POST', { action: 'health', slug }); reload() } finally { setBusy(null) } }
  const toggle = async (slug: string, enabled: boolean) => { await adminSend('/api/admin/agents/mcp', 'POST', { action: 'enable', slug, enabled }); reload() }
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 16 }}>
      <Card>
        <div style={{ fontSize: 13, fontWeight: 700, color: T.ink, marginBottom: 10 }}>MCP servers</div>
        {loading && !data ? <div className="skeleton" style={{ height: 80 }} /> : (data?.servers || []).length === 0 ? <EmptyState title="No MCP servers" hint="Register a Model Context Protocol server — its tools flow into the Tool Registry." /> : (data?.servers || []).map((s) => (
          <div key={s.slug as string} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: `1px solid ${T.border}` }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: s.status === 'connected' ? '#16a34a' : s.status === 'error' ? '#dc2626' : '#9ca3af' }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13.5, fontWeight: 600, color: T.ink }}>{s.name as string}</div>
              <div style={{ fontSize: 11.5, color: T.muted, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{(s.url as string) || 'no url'} · {s.status as string}{s.last_error ? ` · ${s.last_error}` : ''}</div>
            </div>
            <Button variant="ghost" disabled={busy === s.slug} onClick={() => health(s.slug as string)}>{busy === s.slug ? '…' : 'Health'}</Button>
            <Button variant="ghost" onClick={() => toggle(s.slug as string, !s.enabled)}>{s.enabled ? 'Disable' : 'Enable'}</Button>
          </div>
        ))}
      </Card>
      <Card>
        <div style={{ fontSize: 13, fontWeight: 700, color: T.ink, marginBottom: 10 }}>Register a server</div>
        <input className="a-input" style={{ marginBottom: 8 }} placeholder="slug (e.g. github)" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
        <input className="a-input" style={{ marginBottom: 8 }} placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <input className="a-input" style={{ marginBottom: 10 }} placeholder="https://… (http transport)" value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} />
        <Button disabled={!form.slug.trim() || !form.name.trim()} onClick={save}>Register</Button>
      </Card>
    </div>
  )
}

// ── Registry / Providers ──
function RegistryTab() {
  const { data, loading } = useAdminFetch<{ tools: Row[]; providers: Row[]; routes: Row[] }>('/api/admin/agents')
  if (loading && !data) return <div className="skeleton" style={{ height: 200, borderRadius: 14 }} />
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
      <Card pad={0}>
        <div style={{ fontSize: 13, fontWeight: 700, color: T.ink, padding: '14px 16px 8px' }}>Tool Registry ({(data?.tools || []).length})</div>
        {(data?.tools || []).map((t) => (
          <div key={t.name as string} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 16px', borderTop: `1px solid ${T.border}` }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: T.ink, width: 170, flexShrink: 0 }}>{t.name as string}</span>
            <span className="a-pill" style={{ background: '#eef2f0', color: T.sub }}>{t.category as string}</span>
            {riskPill(t.risk as string)}
            {t.mutating ? <span className="a-pill" style={{ background: '#fef3c7', color: '#d97706' }}>writes</span> : <span className="a-pill" style={{ background: '#eef2f0', color: T.muted }}>read</span>}
            <span style={{ flex: 1, minWidth: 0, fontSize: 11.5, color: T.muted, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.description as string}</span>
          </div>
        ))}
      </Card>
      <Card>
        <div style={{ fontSize: 13, fontWeight: 700, color: T.ink, marginBottom: 10 }}>Model providers</div>
        {(data?.providers || []).map((p) => (
          <div key={p.id as string} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 0', borderBottom: `1px solid ${T.border}` }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: p.configured ? '#16a34a' : '#9ca3af' }} />
            <span style={{ flex: 1, fontSize: 13, color: T.ink }}>{p.label as string}</span>
            <span style={{ fontSize: 11.5, color: p.configured ? '#16a34a' : T.muted }}>{p.configured ? 'configured' : 'not set'}</span>
          </div>
        ))}
        <div style={{ fontSize: 13, fontWeight: 700, color: T.ink, margin: '14px 0 8px' }}>Task routing</div>
        {(data?.routes || []).map((r) => (
          <div key={r.task as string} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, color: T.sub, padding: '4px 0' }}>
            <span style={{ textTransform: 'capitalize' }}>{r.task as string}</span><span style={{ color: T.ink }}>{r.model as string}</span>
          </div>
        ))}
      </Card>
    </div>
  )
}
