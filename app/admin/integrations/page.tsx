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
const ICON: Record<string, string> = { clarity: '🔍', ga4: '📊', gsc: '🔎', meta_ads: '📣', google_ads: '🅖', calcom: '📅', zoom: '🎥', fathom: '📝' }

export default function IntegrationCenter() {
  const { data, loading, reload } = useAdminFetch<{ integrations: Integ[]; recent: Row[] }>('/api/admin/integrations')
  const [logsFor, setLogsFor] = useState<string | null>(null)
  const [syncing, setSyncing] = useState<string | null>(null)
  const integrations = data?.integrations || []
  const byCat = (c: string) => integrations.filter((i) => i.category === c)

  const sync = async (provider: string) => {
    setSyncing(provider)
    try { await adminSend('/api/admin/integrations', 'POST', { provider, action: 'sync' }); reload() }
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
              <div style={{ display: 'flex', gap: 8 }}>
                {i.has_sync && <Button variant={i.configured ? 'primary' : 'ghost'} disabled={!i.configured || syncing === i.provider} onClick={() => sync(i.provider)}>{syncing === i.provider ? 'Syncing…' : 'Sync now'}</Button>}
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
      <PageHeader title="Integrations" subtitle="Connect marketing, analytics & meeting sources into the CRM" />
      {loading && !data ? <div className="skeleton" style={{ height: 200, borderRadius: 14 }} /> : (
        <>
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
