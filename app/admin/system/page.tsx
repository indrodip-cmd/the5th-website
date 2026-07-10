'use client'
/* System — the operator observability workspace (3I.5). Health, AI cost,
   webhooks, jobs, security, database, logs, cost protection. */
import { useState } from 'react'
import { T, Card, Button, Input, Select, EmptyState, PageHeader, useAdminFetch, adminSend, money, fmtDate } from '@/components/admin/ui'

type Row = Record<string, unknown>
const TABS = ['Health', 'AI Cost', 'Webhooks', 'Jobs', 'Security', 'Database', 'Logs', 'Cost Protection', 'Backups'] as const
const DOT: Record<string, string> = { online: '#16a34a', degraded: '#d97706', offline: '#dc2626' }

function bytes(n: number): string { if (n > 1e9) return `${(n / 1e9).toFixed(2)} GB`; if (n > 1e6) return `${(n / 1e6).toFixed(1)} MB`; if (n > 1e3) return `${(n / 1e3).toFixed(0)} KB`; return `${n} B` }
function ago(iso?: string | null): string { if (!iso) return 'never'; const s = Math.floor((Date.now() - +new Date(iso)) / 1000); if (s < 60) return `${s}s ago`; if (s < 3600) return `${Math.floor(s / 60)}m ago`; if (s < 86400) return `${Math.floor(s / 3600)}h ago`; return `${Math.floor(s / 86400)}d ago` }

export default function SystemPage() {
  const [tab, setTab] = useState<typeof TABS[number]>('Health')
  return (
    <>
      <PageHeader title="System" subtitle="Operational health, AI cost & reliability" />
      <div style={{ display: 'flex', gap: 6, marginBottom: 18, flexWrap: 'wrap' }}>
        {TABS.map((t) => (
          <button key={t} className="tab-btn" onClick={() => setTab(t)} style={{ background: tab === t ? T.green2 : '#fff', color: tab === t ? '#fff' : T.sub, border: `1px solid ${tab === t ? T.green2 : T.border}` }}>{t}</button>
        ))}
      </div>
      {tab === 'Health' && <HealthPanel />}
      {tab === 'AI Cost' && <AiPanel />}
      {tab === 'Webhooks' && <WebhooksPanel />}
      {tab === 'Jobs' && <JobsPanel />}
      {tab === 'Security' && <SecurityPanel />}
      {tab === 'Database' && <DatabasePanel />}
      {tab === 'Logs' && <LogsPanel />}
      {tab === 'Cost Protection' && <CostPanel />}
      {tab === 'Backups' && <BackupsPanel />}
    </>
  )
}

function HealthPanel() {
  const { data, loading, reload } = useAdminFetch<{ services: Row[]; version: string; overall: string; checkedAt: string }>('/api/admin/system?panel=health')
  if (loading && !data) return <div className="skeleton" style={{ height: 200, borderRadius: 14 }} />
  const services = data?.services || []
  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ width: 12, height: 12, borderRadius: '50%', background: DOT[data?.overall || 'online'] }} />
          <span style={{ fontSize: 15, fontWeight: 700, color: T.ink, textTransform: 'capitalize' }}>{data?.overall === 'online' ? 'All systems operational' : `Status: ${data?.overall}`}</span>
          <span style={{ fontSize: 12, color: T.muted }}>· v{data?.version} · checked {ago(data?.checkedAt)}</span>
        </div>
        <Button variant="ghost" onClick={reload}>Refresh</Button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: 12 }}>
        {services.map((s) => (
          <Card key={s.name as string} pad={14}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 9, height: 9, borderRadius: '50%', background: DOT[s.status as string] }} />
              <span style={{ fontSize: 14, fontWeight: 600, color: T.ink, flex: 1 }}>{s.name as string}</span>
              {s.responseMs != null ? <span style={{ fontSize: 12, color: T.muted }}>{s.responseMs as number}ms</span> : null}
            </div>
            <div style={{ fontSize: 12, color: T.sub, marginTop: 6, textTransform: 'capitalize' }}>{s.status as string}{s.detail ? ` · ${s.detail}` : ''}</div>
            {s.lastSync ? <div style={{ fontSize: 11.5, color: T.muted, marginTop: 2 }}>Last sync {ago(s.lastSync as string)}</div> : null}
            {s.lastError ? <div style={{ fontSize: 11.5, color: T.danger, marginTop: 2 }}>{String(s.lastError).slice(0, 60)}</div> : null}
          </Card>
        ))}
      </div>
    </>
  )
}

function AiPanel() {
  const { data, loading } = useAdminFetch<{ cost: Row; perf: Row; org: Row }>('/api/admin/system?panel=ai')
  if (loading && !data) return <div className="skeleton" style={{ height: 200, borderRadius: 14 }} />
  const c = (data?.cost as Row) || {}, p = (data?.perf as Row) || {}, org = (data?.org as Row) || {}
  const metric = (label: string, val: string, sub?: string) => <Card pad={16}><div style={{ fontSize: 22, fontWeight: 800, color: T.ink }}>{val}</div><div style={{ fontSize: 12, color: T.sub, marginTop: 4 }}>{label}</div>{sub && <div style={{ fontSize: 11, color: T.muted }}>{sub}</div>}</Card>
  return (
    <>
      {/* Anthropic org — matches the Claude console (all apps on the key) */}
      <Card style={{ marginBottom: 16, background: `linear-gradient(135deg,${T.ink},${T.green})` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '.05em' }}>Anthropic organization · matches Claude console</div>
            {org.configured ? (
              <div style={{ display: 'flex', gap: 28, marginTop: 8, flexWrap: 'wrap' }}>
                <div><div style={{ fontSize: 28, fontWeight: 800, color: '#fff' }}>{money(Number(org.today || 0), (org.currency as string) || 'USD')}</div><div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>Today (org)</div></div>
                <div><div style={{ fontSize: 28, fontWeight: 800, color: '#fff' }}>{money(Number(org.month || 0), (org.currency as string) || 'USD')}</div><div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>This month (org)</div></div>
                <div><div style={{ fontSize: 28, fontWeight: 800, color: '#fff' }}>{(Number(org.inputTokens || 0) + Number(org.outputTokens || 0)).toLocaleString()}</div><div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>Tokens (month)</div></div>
              </div>
            ) : (
              <div style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.85)', marginTop: 8, maxWidth: 520 }}>Add an <strong>ANTHROPIC_ADMIN_KEY</strong> (Console → Settings → Admin keys, starts with sk-ant-admin) in Vercel to show your whole organization&apos;s spend + tokens here — exactly what the Claude console reports.</div>
            )}
          </div>
          <a href="https://console.anthropic.com/settings/usage" target="_blank" rel="noreferrer" style={{ fontSize: 12, color: '#fff', textDecoration: 'underline' }}>Open console ↗</a>
        </div>
        {Boolean(org.configured) && ((org.byModel as Row[]) || []).length > 0 && (
          <div style={{ marginTop: 14, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            {(org.byModel as Row[]).map((m) => <span key={m.model as string} style={{ fontSize: 12, color: 'rgba(255,255,255,0.85)' }}>{m.model as string}: {(Number(m.inputTokens || 0) + Number(m.outputTokens || 0)).toLocaleString()} tok</span>)}
          </div>
        )}
      </Card>
      <div style={{ fontSize: 12, color: T.muted, marginBottom: 8 }}>This site&apos;s AI (attributed per conversation / feature):</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: 12, marginBottom: 16 }}>
        {metric("Today's AI cost", money(Number(c.today || 0)), `Yesterday ${money(Number(c.yesterday || 0))}`)}
        {metric('This month', money(Number(c.month || 0)), `${c.calls || 0} calls`)}
        {metric('Per conversation', money(Number(c.perConversation || 0)), `${c.conversations || 0} convos`)}
        {metric('Avg latency', `${p.avgLatency || 0}ms`, `p95 ${p.p95Latency || 0}ms`)}
        {metric('Success rate', `${p.successRate ?? 100}%`, `${p.errorRate || 0}% errors`)}
        {metric('Cache hit rate', `${c.cacheHitRate || 0}%`)}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 14 }}>
        <Card><h3 style={sec}>Cost by model</h3>{((c.byModel as Row[]) || []).length === 0 ? <EmptyState title="No AI calls yet" /> : (c.byModel as Row[]).map((m) => <Line key={m.model as string} label={m.model as string} value={money(Number(m.cost || 0))} />)}</Card>
        <Card><h3 style={sec}>Cost by feature</h3>{((c.byEndpoint as Row[]) || []).map((m) => <Line key={m.endpoint as string} label={m.endpoint as string} value={money(Number(m.cost || 0))} />)}</Card>
        <Card><h3 style={sec}>Tokens</h3>
          <Line label="Input" value={Number(c.inputTokens || 0).toLocaleString()} />
          <Line label="Output" value={Number(c.outputTokens || 0).toLocaleString()} />
          <Line label="Cache reads" value={Number(c.cacheReadTokens || 0).toLocaleString()} />
          <Line label="Cache writes" value={Number(c.cacheWriteTokens || 0).toLocaleString()} />
        </Card>
      </div>
    </>
  )
}

function WebhooksPanel() {
  const { data, loading } = useAdminFetch<{ webhooks: Row[]; byStatus: Record<string, number> }>('/api/admin/system?panel=webhooks')
  if (loading && !data) return <div className="skeleton" style={{ height: 160, borderRadius: 14 }} />
  const rows = data?.webhooks || []
  return (
    <Card pad={0} style={{ overflow: 'hidden' }}>
      {rows.length === 0 ? <EmptyState title="No webhooks received" /> : rows.map((w) => (
        <div key={w.id as string} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 16px', borderBottom: '1px solid #f4f5f4' }}>
          <StatusPill status={w.status as string} />
          <div style={{ flex: 1 }}><div style={{ fontSize: 13.5, fontWeight: 600, color: T.ink }}>{(w.provider as string)} · {(w.event_type as string) || 'event'}</div><div style={{ fontSize: 12, color: T.muted }}>{ago(w.received_at as string)}{w.processed_at ? ` · ${(+new Date(w.processed_at as string) - +new Date(w.received_at as string))}ms` : ''}</div></div>
          {w.error ? <span style={{ fontSize: 12, color: T.danger }}>{String(w.error).slice(0, 40)}</span> : null}
          {!w.signature_valid ? <span className="a-pill" style={{ background: '#fee2e2', color: '#dc2626' }}>bad sig</span> : null}
        </div>
      ))}
    </Card>
  )
}

function JobsPanel() {
  const { data, loading, reload } = useAdminFetch<{ syncs: Row[]; automations: Row[]; crons: Row[] }>('/api/admin/system?panel=jobs')
  const [running, setRunning] = useState(false)
  const rerun = async () => { setRunning(true); try { await adminSend('/api/admin/system', 'POST', { action: 'rerun' }); reload() } finally { setRunning(false) } }
  if (loading && !data) return <div className="skeleton" style={{ height: 160, borderRadius: 14 }} />
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(320px,1fr))', gap: 14 }}>
      <Card><div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}><h3 style={sec}>Sync jobs</h3><Button variant="ghost" disabled={running} onClick={rerun}>{running ? 'Running…' : 'Run now'}</Button></div>
        {(data?.syncs || []).length === 0 ? <EmptyState title="No jobs yet" /> : (data!.syncs).slice(0, 15).map((s) => (
          <div key={s.id as string} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid #f4f5f4' }}>
            <StatusPill status={s.status as string} /><span style={{ flex: 1, fontSize: 13, color: T.text, textTransform: 'capitalize' }}>{s.provider as string}</span><span style={{ fontSize: 12, color: T.muted }}>{s.records as number} · {ago(s.started_at as string)}</span>
          </div>
        ))}
      </Card>
      <Card><h3 style={sec}>Cron schedule</h3>{(data?.crons || []).map((c) => <Line key={c.path as string} label={c.path as string} value={c.schedule as string} />)}
        <h3 style={{ ...sec, marginTop: 16 }}>Automations</h3>{(data?.automations || []).length === 0 ? <div style={{ fontSize: 13, color: T.muted }}>None run yet</div> : (data!.automations).slice(0, 8).map((a) => <div key={a.id as string} style={{ display: 'flex', gap: 8, padding: '5px 0', fontSize: 13 }}><StatusPill status={a.status as string} /><span style={{ flex: 1, color: T.text }}>{a.automation_name as string}</span><span style={{ color: T.muted, fontSize: 12 }}>{a.duration_ms as number}ms</span></div>)}
      </Card>
    </div>
  )
}

function SecurityPanel() {
  const { data, loading } = useAdminFetch<{ events: Row[]; blockedLimits: Row[]; audit: Row[]; webhookSignatureFailures: number }>('/api/admin/system?panel=security')
  if (loading && !data) return <div className="skeleton" style={{ height: 160, borderRadius: 14 }} />
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(320px,1fr))', gap: 14 }}>
      <Card><h3 style={sec}>Security events</h3>{(data?.events || []).length === 0 ? <EmptyState title="No security events" /> : (data!.events).map((e) => <div key={e.id as string} style={{ padding: '7px 0', borderBottom: '1px solid #f4f5f4', fontSize: 13 }}><span style={{ fontWeight: 600, color: e.severity === 'high' || e.severity === 'critical' ? T.danger : T.ink }}>{(e.event_type as string) || (e.attack_type as string)}</span> <span style={{ color: T.muted }}>· {(e.ip_address as string) || ''} · {ago(e.created_at as string)}</span></div>)}</Card>
      <Card><h3 style={sec}>Blocked / rate-limited</h3><Line label="Webhook signature failures" value={String(data?.webhookSignatureFailures || 0)} />{(data?.blockedLimits || []).slice(0, 10).map((l) => <Line key={l.id as string} label={(l.identifier as string) || (l.endpoint as string)} value={ago(l.created_at as string)} />)}
        <h3 style={{ ...sec, marginTop: 16 }}>Recent audit</h3>{(data?.audit || []).slice(0, 8).map((a) => <div key={`${a.created_at}${a.action}`} style={{ fontSize: 12.5, color: T.sub, padding: '4px 0' }}>{a.action as string} · {(a.actor as string) || 'system'} · {ago(a.created_at as string)}</div>)}
      </Card>
    </div>
  )
}

function DatabasePanel() {
  const { data, loading } = useAdminFetch<Row>('/api/admin/system?panel=database')
  if (loading && !data) return <div className="skeleton" style={{ height: 160, borderRadius: 14 }} />
  if (!data?.ok) return <Card><EmptyState title="Database stats unavailable" hint={String(data?.error || '')} /></Card>
  const tables = (data.topTables as Row[]) || []
  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: 12, marginBottom: 16 }}>
        <Card pad={16}><div style={{ fontSize: 22, fontWeight: 800, color: T.ink }}>{bytes(Number(data.dbSizeBytes || 0))}</div><div style={{ fontSize: 12, color: T.sub, marginTop: 4 }}>Database size</div></Card>
        <Card pad={16}><div style={{ fontSize: 22, fontWeight: 800, color: T.ink }}>{data.connections as number}</div><div style={{ fontSize: 12, color: T.sub, marginTop: 4 }}>Connections ({data.activeConnections as number} active)</div></Card>
        <Card pad={16}><div style={{ fontSize: 22, fontWeight: 800, color: data.hasVector ? T.green : T.danger }}>{data.hasVector ? 'On' : 'Off'}</div><div style={{ fontSize: 12, color: T.sub, marginTop: 4 }}>Vector (pgvector)</div></Card>
        <Card pad={16}><div style={{ fontSize: 22, fontWeight: 800, color: T.ink }}>{data.migrationCount as number}</div><div style={{ fontSize: 12, color: T.sub, marginTop: 4 }}>Migrations</div></Card>
      </div>
      <Card><h3 style={sec}>Largest tables</h3>{tables.map((t) => <Line key={t.name as string} label={`${t.name as string} · ${Number(t.rows || 0).toLocaleString()} rows`} value={bytes(Number(t.bytes || 0))} />)}</Card>
    </>
  )
}

function LogsPanel() {
  const [level, setLevel] = useState(''); const [q, setQ] = useState('')
  const qs = new URLSearchParams({ panel: 'logs', ...(level ? { level } : {}), ...(q ? { q } : {}) }).toString()
  const { data, loading } = useAdminFetch<{ logs: Row[] }>(`/api/admin/system?${qs}`, [qs])
  const logs = data?.logs || []
  const exportCsv = () => { const csv = ['level,source,message,created_at', ...logs.map((l) => `"${l.level}","${l.source || ''}","${String(l.message).replace(/"/g, '""')}","${l.created_at}"`)].join('\n'); const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' })); a.download = 'system-logs.csv'; a.click() }
  return (
    <>
      <Card pad={12} style={{ marginBottom: 12, display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        <Input placeholder="Search messages…" value={q} onChange={(e) => setQ(e.target.value)} style={{ flex: 1, minWidth: 200 }} />
        <Select value={level} onChange={(e) => setLevel(e.target.value)} style={{ width: 130 }}><option value="">All levels</option><option value="info">Info</option><option value="warn">Warn</option><option value="error">Error</option></Select>
        <Button variant="ghost" onClick={exportCsv}>Export CSV</Button>
      </Card>
      <Card pad={0} style={{ overflow: 'hidden' }}>
        {loading && !data ? <div style={{ padding: 20 }} className="skeleton" /> : logs.length === 0 ? <EmptyState title="No logs" hint="System events appear here as they happen." /> : logs.map((l) => (
          <div key={l.id as string} style={{ display: 'flex', gap: 12, padding: '9px 16px', borderBottom: '1px solid #f4f5f4', fontSize: 13 }}>
            <span className="a-pill" style={{ background: l.level === 'error' ? '#fee2e2' : l.level === 'warn' ? '#fef3c7' : '#f3f4f6', color: l.level === 'error' ? '#dc2626' : l.level === 'warn' ? '#b45309' : T.sub }}>{l.level as string}</span>
            <span style={{ color: T.muted, width: 90 }}>{(l.source as string) || '—'}</span>
            <span style={{ flex: 1, color: T.text }}>{l.message as string}</span>
            <span style={{ color: T.muted, whiteSpace: 'nowrap' }}>{ago(l.created_at as string)}</span>
          </div>
        ))}
      </Card>
    </>
  )
}

const COST_FIELDS: Array<{ key: string; label: string; type: 'number' | 'bool'; hint: string }> = [
  { key: 'ai_emergency_off', label: 'Emergency shutdown', type: 'bool', hint: 'Immediately stop the public AI (admin coach stays on)' },
  { key: 'ai_daily_budget_usd', label: 'Daily AI budget ($)', type: 'number', hint: '0 = unlimited' },
  { key: 'ai_throttle_on_budget', label: 'Throttle when over daily budget', type: 'bool', hint: 'Pause public AI once the daily budget is hit' },
  { key: 'ai_monthly_budget_usd', label: 'Monthly AI budget ($)', type: 'number', hint: '0 = unlimited (alert only)' },
  { key: 'ai_max_msgs_per_visitor', label: 'Max messages / visitor / 24h', type: 'number', hint: '0 = unlimited' },
  { key: 'ai_max_tokens_per_request', label: 'Max tokens / request', type: 'number', hint: '0 = model default' },
]
function CostPanel() {
  const { data, loading, reload } = useAdminFetch<{ settings: Record<string, unknown> }>('/api/admin/system?panel=ai')
  const [form, setForm] = useState<Record<string, string | boolean>>({})
  const [busy, setBusy] = useState(false)
  const s = data?.settings || {}
  const val = (k: string) => k in form ? form[k] : (s as Record<string, unknown>)[camel(k)] ?? (COST_FIELDS.find((f) => f.key === k)?.type === 'bool' ? false : 0)
  const save = async () => { setBusy(true); try { await adminSend('/api/admin/system', 'POST', { action: 'save_settings', settings: buildSettings(form, s) }); reload() } finally { setBusy(false) } }
  if (loading && !data) return <div className="skeleton" style={{ height: 200, borderRadius: 14 }} />
  return (
    <Card style={{ maxWidth: 560 }}>
      <h3 style={sec}>Cost protection</h3>
      <p style={{ fontSize: 13, color: T.sub, marginBottom: 16 }}>Defaults are off/unlimited. Limits enforce on the public AI and degrade it gracefully.</p>
      {COST_FIELDS.map((f) => (
        <div key={f.key} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid #f4f5f4' }}>
          <div style={{ flex: 1 }}><div style={{ fontSize: 14, fontWeight: 600, color: T.ink }}>{f.label}</div><div style={{ fontSize: 12, color: T.muted }}>{f.hint}</div></div>
          {f.type === 'bool'
            ? <input type="checkbox" checked={!!val(f.key)} onChange={(e) => setForm((x) => ({ ...x, [f.key]: e.target.checked }))} />
            : <Input type="number" value={String(val(f.key) ?? 0)} onChange={(e) => setForm((x) => ({ ...x, [f.key]: e.target.value }))} style={{ width: 120 }} />}
        </div>
      ))}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 14 }}><Button disabled={busy} onClick={save}>{busy ? 'Saving…' : 'Save'}</Button></div>
    </Card>
  )
}

function BackupsPanel() {
  const { data } = useAdminFetch<Row>('/api/admin/system?panel=database')
  return (
    <Card style={{ maxWidth: 620 }}>
      <h3 style={sec}>Backups & infrastructure</h3>
      <p style={{ fontSize: 13.5, color: T.text, lineHeight: 1.6 }}>
        Database backups are managed automatically by <strong>Supabase</strong> (daily point-in-time snapshots on the platform infrastructure). Deployments, edge metrics and rollbacks are managed by <strong>Vercel</strong>. These aren&apos;t fabricated here — use the source dashboards for restore points and real-user metrics.
      </p>
      <div style={{ marginTop: 12 }}>
        <Line label="Migrations applied" value={String(data?.migrationCount ?? '—')} />
        <Line label="Last migration" value={String(data?.lastMigration ?? '—')} />
        <Line label="Database size" value={data?.dbSizeBytes ? bytes(Number(data.dbSizeBytes)) : '—'} />
      </div>
      <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
        <a className="a-btn a-btn-ghost" href="https://supabase.com/dashboard/project/hlcvxeujqjhropiignjq/database/backups" target="_blank" rel="noreferrer">Supabase backups →</a>
        <a className="a-btn a-btn-ghost" href="https://vercel.com/dashboard" target="_blank" rel="noreferrer">Vercel dashboard →</a>
      </div>
    </Card>
  )
}

// helpers
function Line({ label, value }: { label: string; value: string }) {
  return <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, padding: '6px 0', borderBottom: '1px solid #f4f5f4', fontSize: 13.5 }}><span style={{ color: T.text }}>{label}</span><span style={{ fontWeight: 600, color: T.ink }}>{value}</span></div>
}
function StatusPill({ status }: { status: string }) {
  const ok = status === 'processed' || status === 'success' || status === 'ok'
  const bad = status === 'error' || status === 'failed'
  return <span className="a-pill" style={{ background: ok ? '#dcfce7' : bad ? '#fee2e2' : '#f3f4f6', color: ok ? '#16a34a' : bad ? '#dc2626' : T.sub }}>{status}</span>
}
function camel(k: string): string { return ({ ai_daily_budget_usd: 'dailyBudget', ai_monthly_budget_usd: 'monthlyBudget', ai_max_cost_per_conversation: 'maxCostPerConversation', ai_max_tokens_per_request: 'maxTokens', ai_max_msgs_per_visitor: 'msgCap', ai_emergency_off: 'emergencyOff', ai_throttle_on_budget: 'throttleOnBudget' } as Record<string, string>)[k] || k }
function buildSettings(form: Record<string, string | boolean>, s: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  for (const f of COST_FIELDS) out[f.key] = f.key in form ? form[f.key] : (s as Record<string, unknown>)[camel(f.key)] ?? (f.type === 'bool' ? false : 0)
  return out
}
const sec: React.CSSProperties = { fontSize: 12, fontWeight: 700, letterSpacing: '.05em', color: T.green, textTransform: 'uppercase', marginBottom: 12 }
