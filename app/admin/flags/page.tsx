'use client'
/* Feature Flags — enable/disable major features instantly, no deploy required. */
import { T, Card, PageHeader, useAdminFetch, adminSend } from '@/components/admin/ui'

type Row = Record<string, unknown>

export default function Flags() {
  const { data, loading, reload } = useAdminFetch<{ flags: Row[] }>('/api/admin/flags')
  const set = async (key: string, patch: Row) => { await adminSend('/api/admin/flags', 'POST', { key, ...patch }); reload() }
  if (loading && !data) return <div className="skeleton" style={{ height: 240, borderRadius: 14 }} />
  return (
    <>
      <PageHeader title="Feature Flags" subtitle="Turn features on or off instantly — no deploy" />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(320px,1fr))', gap: 14 }}>
        {(data?.flags || []).map((f) => (
          <Card key={f.key as string} pad={18}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <span style={{ fontSize: 15, fontWeight: 800, color: T.ink, flex: 1 }}>{f.label as string}</span>
              <button onClick={() => set(f.key as string, { enabled: !f.enabled })}
                style={{ width: 44, height: 26, borderRadius: 999, border: 'none', cursor: 'pointer', background: f.enabled ? '#16a34a' : '#d1d5db', position: 'relative', transition: 'background .18s' }} aria-label="Toggle">
                <span style={{ position: 'absolute', top: 3, left: f.enabled ? 21 : 3, width: 20, height: 20, borderRadius: '50%', background: '#fff', transition: 'left .18s', boxShadow: '0 1px 3px rgba(0,0,0,.3)' }} />
              </button>
            </div>
            <div style={{ fontSize: 12.5, color: T.sub, minHeight: 32, marginBottom: 10 }}>{(f.description as string) || '—'}</div>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <label style={{ fontSize: 12, color: T.muted }}>Rollout <input className="a-input" type="number" min={0} max={100} style={{ width: 68, display: 'inline-block', marginLeft: 4 }} defaultValue={f.rollout as number} onBlur={(e) => set(f.key as string, { rollout: Math.max(0, Math.min(100, Number(e.target.value))) })} />%</label>
              <label style={{ fontSize: 12, color: T.muted, marginLeft: 'auto' }}>Audience <select className="a-input" style={{ display: 'inline-block', width: 110, marginLeft: 4 }} defaultValue={(f.audience as string) || 'all'} onChange={(e) => set(f.key as string, { audience: e.target.value })}>{['all', 'admin', 'internal', 'beta'].map((a) => <option key={a}>{a}</option>)}</select></label>
            </div>
            <div style={{ fontSize: 10.5, color: T.muted, marginTop: 8, fontFamily: 'monospace' }}>{f.key as string}</div>
          </Card>
        ))}
      </div>
    </>
  )
}
