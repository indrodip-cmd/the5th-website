'use client'
/* Integration Center — connection status, health, last sync, logs, sync now. */
import { useState } from 'react'
import { T, Card, Button, EmptyState, Drawer, PageHeader, useAdminFetch, adminSend, fmtDate } from '@/components/admin/ui'

type Row = Record<string, unknown>
interface Integ { provider: string; label: string; category: string; configured: boolean; has_sync: boolean; status: string; last_sync_at: string | null; last_error: string | null; enabled: boolean }

const STATUS: Record<string, { color: string; label: string }> = {
  connected: { color: '#16a34a', label: 'Connected' },
  disconnected: { color: '#9ca3af', label: 'Not connected' },
  error: { color: '#dc2626', label: 'Error' },
}
const ICON: Record<string, string> = { whop: '🟣', ai: '🤖', clarity: '🔍', ga4: '📊', gsc: '🔎', meta_ads: '📣', google_ads: '🅖', calcom: '📅', zoom: '🎥', fathom: '📝' }

export default function IntegrationCenter() {
  const { data, loading, reload } = useAdminFetch<{ integrations: Integ[]; recent: Row[] }>('/api/admin/integrations')
  const [logsFor, setLogsFor] = useState<string | null>(null)
  const [syncing, setSyncing] = useState<string | null>(null)
  const [view, setView] = useState<'integrations' | 'events'>('integrations')
  const integrations = data?.integrations || []
  const byCat = (c: string) => integrations.filter((i) => i.category === c)

  const sync = async (provider: string) => {
    setSyncing(provider)
    try { await adminSend('/api/admin/integrations', 'POST', { provider, action: 'sync' }); reload() }
    catch (e) { alert(String(e instanceof Error ? e.message : e)) } finally { setSyncing(null) }
  }
  const backfill = async (provider: string) => {
    setSyncing(provider)
    try { const r = await adminSend('/api/admin/integrations', 'POST', { provider, action: 'backfill' }) as { imported?: number }; alert(`Imported ${r?.imported ?? 0} historical payments. Re-run to continue if truncated.`); reload() }
    catch (e) { alert(String(e instanceof Error ? e.message : e)) } finally { setSyncing(null) }
  }
  const syncWhopEntity = async (kind: 'members' | 'products') => {
    setSyncing('whop')
    try { const r = await adminSend(`/api/admin/crm/${kind}`, 'POST') as { records?: number }; alert(`Synced ${r?.records ?? 0} ${kind}.`) }
    catch (e) { alert(String(e instanceof Error ? e.message : e)) } finally { setSyncing(null) }
  }
  const analyzeCoaching = async () => {
    setSyncing('fathom')
    try { const r = await adminSend('/api/admin/coaching', 'POST') as { analyzed?: number; remaining?: number }; alert(`Analyzed ${r?.analyzed ?? 0} calls into coaching intelligence. ${r?.remaining ? `${r.remaining} left — click again to continue.` : 'All caught up.'}`) }
    catch (e) { alert(String(e instanceof Error ? e.message : e)) } finally { setSyncing(null) }
  }

  const Section = ({ title, cat }: { title: string; cat: string }) => (
    <div style={{ marginBottom: 26 }}>
      <h3 style={{ fontSize: 13, fontWeight: 700, color: T.sub, textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 12 }}>{title}</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 14 }}>
        {byCat(cat).map((i) => {
          const st = STATUS[i.status] || STATUS.disconnected
          return (
            <Card key={i.provider} pad={18}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <span style={{ fontSize: 26 }}>{ICON[i.provider] || '🔌'}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: T.ink }}>{i.label}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: st.color }} />
                    <span style={{ fontSize: 12.5, color: st.color, fontWeight: 600 }}>{st.label}</span>
                  </div>
                </div>
              </div>
              <div style={{ fontSize: 12.5, color: T.muted, marginBottom: 12 }}>
                {i.last_sync_at ? `Last sync ${fmtDate(i.last_sync_at)}` : i.configured ? 'Ready — never synced' : 'Add credentials to connect'}
                {i.last_error ? <div style={{ color: T.danger, marginTop: 4 }}>{String(i.last_error).slice(0, 80)}</div> : null}
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {i.has_sync && <Button variant={i.configured ? 'primary' : 'ghost'} disabled={!i.configured || syncing === i.provider} onClick={() => sync(i.provider)}>{syncing === i.provider ? 'Syncing…' : 'Sync now'}</Button>}
                {i.provider === 'whop' && i.configured && <Button variant="ghost" disabled={syncing === i.provider} onClick={() => backfill(i.provider)}>Backfill history</Button>}
                {i.provider === 'whop' && i.configured && <Button variant="ghost" disabled={syncing === i.provider} onClick={() => syncWhopEntity('members')}>Sync members</Button>}
                {i.provider === 'whop' && i.configured && <Button variant="ghost" disabled={syncing === i.provider} onClick={() => syncWhopEntity('products')}>Sync products</Button>}
                {i.provider === 'fathom' && <Button variant="ghost" disabled={syncing === i.provider} onClick={analyzeCoaching}>{syncing === 'fathom' ? 'Analyzing…' : 'Analyze calls'}</Button>}
                <Button variant="ghost" onClick={() => setLogsFor(i.provider)}>Logs</Button>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )

  return (
    <>
      <PageHeader title="Integrations" subtitle="Every external system, in one place" />
      <div style={{ display: 'flex', gap: 6, marginBottom: 18 }}>
        {(['integrations', 'events'] as const).map((t) => (
          <button key={t} className="tab-btn" onClick={() => setView(t)} style={{ background: view === t ? T.green2 : '#fff', color: view === t ? '#fff' : T.sub, border: `1px solid ${view === t ? T.green2 : T.border}`, textTransform: 'capitalize' }}>{t === 'events' ? 'Event Center' : 'Integrations'}</button>
        ))}
      </div>
      {view === 'events' ? <EventCenter /> : loading && !data ? <div className="skeleton" style={{ height: 200, borderRadius: 14 }} /> : (
        <>
          <Section title="Payments" cat="payments" />
          <Section title="Analytics" cat="analytics" />
          <Section title="Marketing" cat="marketing" />
          <Section title="Meetings" cat="meetings" />
        </>
      )}
      <Drawer open={!!logsFor} onClose={() => setLogsFor(null)}>
        {logsFor && <LogsPanel provider={logsFor} onClose={() => setLogsFor(null)} />}
      </Drawer>
    </>
  )
}

function EventCenter() {
  const { data, loading } = useAdminFetch<{ webhooks: Row[]; syncs: Row[] }>('/api/admin/events')
  const pill = (s: string) => <span className="a-pill" style={{ background: s === 'processed' || s === 'success' ? '#dcfce7' : s === 'error' ? '#fee2e2' : s === 'duplicate' ? '#f3f4f6' : '#e0f2fe', color: s === 'processed' || s === 'success' ? '#16a34a' : s === 'error' ? '#dc2626' : s === 'duplicate' ? T.sub : '#0369a1' }}>{s}</span>
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(340px,1fr))', gap: 18 }}>
      <Card>
        <h3 style={{ fontSize: 14, fontWeight: 700, color: T.ink, marginBottom: 12 }}>Incoming webhooks</h3>
        {loading ? <div className="skeleton" style={{ height: 40 }} /> : (data?.webhooks || []).length === 0 ? <EmptyState title="No webhooks yet" /> : data!.webhooks.map((w) => (
          <div key={w.id as string} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 0', borderBottom: '1px solid #f4f5f4' }}>
            <span style={{ fontSize: 16 }}>{ICON[w.provider as string] || '🔌'}</span>
            <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: 13.5, fontWeight: 600, color: T.ink }}>{(w.event_type as string) || 'event'}</div><div style={{ fontSize: 12, color: T.muted }}>{new Date(w.received_at as string).toLocaleString()}</div></div>
            {pill(w.status as string)}
          </div>
        ))}
      </Card>
      <Card>
        <h3 style={{ fontSize: 14, fontWeight: 700, color: T.ink, marginBottom: 12 }}>Sync jobs</h3>
        {loading ? <div className="skeleton" style={{ height: 40 }} /> : (data?.syncs || []).length === 0 ? <EmptyState title="No sync jobs yet" /> : data!.syncs.map((s) => (
          <div key={s.id as string} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 0', borderBottom: '1px solid #f4f5f4' }}>
            <span style={{ fontSize: 16 }}>{ICON[s.provider as string] || '🔌'}</span>
            <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: 13.5, fontWeight: 600, color: T.ink, textTransform: 'capitalize' }}>{s.provider as string}</div><div style={{ fontSize: 12, color: T.muted }}>{s.records as number} records · {new Date(s.started_at as string).toLocaleString()}</div></div>
            {pill(s.status as string)}
          </div>
        ))}
      </Card>
    </div>
  )
}

function LogsPanel({ provider, onClose }: { provider: string; onClose: () => void }) {
  const { data, loading } = useAdminFetch<{ logs: Row[] }>(`/api/admin/integrations/${provider}/logs`)
  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ fontSize: 18, fontWeight: 800, color: T.ink }}>{provider} · sync logs</h2>
        <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 22, color: T.sub, cursor: 'pointer' }}>×</button>
      </div>
      {loading ? <div className="skeleton" style={{ height: 60 }} /> : (data?.logs || []).length === 0 ? <EmptyState title="No sync history" /> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {data!.logs.map((l) => (
            <div key={l.id as string} style={{ padding: 12, borderRadius: 8, background: '#fafbfa', border: `1px solid ${T.border}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span className="a-pill" style={{ background: l.status === 'success' ? '#dcfce7' : l.status === 'error' ? '#fee2e2' : '#f3f4f6', color: l.status === 'success' ? '#16a34a' : l.status === 'error' ? '#dc2626' : T.sub }}>{l.status as string}</span>
                <span style={{ fontSize: 12, color: T.muted }}>{new Date(l.started_at as string).toLocaleString()}</span>
              </div>
              <div style={{ fontSize: 13, color: T.text, marginTop: 6 }}>{l.records as number} records</div>
              {l.error ? <div style={{ fontSize: 12, color: T.danger, marginTop: 4 }}>{l.error as string}</div> : null}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
