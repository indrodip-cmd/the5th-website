'use client'
/* CRM · Meeting Center — all meetings across providers, filterable + sync. */
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { T, Card, Button, Avatar, EmptyState, PageHeader, useAdminFetch, adminSend, fmtDate } from '@/components/admin/ui'

type Row = Record<string, unknown>
const FILTERS = ['upcoming', 'completed', 'cancelled', 'no_show'] as const

const STATUS_STYLE: Record<string, { bg: string; color: string; label: string }> = {
  upcoming: { bg: '#e0f2fe', color: '#0369a1', label: 'Upcoming' },
  completed: { bg: '#dcfce7', color: '#16a34a', label: 'Completed' },
  cancelled: { bg: '#f3f4f6', color: '#6b7280', label: 'Cancelled' },
  no_show: { bg: '#fef3c7', color: '#b45309', label: 'No-show' },
  rescheduled: { bg: '#ede9fe', color: '#7c3aed', label: 'Rescheduled' },
}

export default function MeetingCenter() {
  const router = useRouter()
  const [filter, setFilter] = useState<string>('upcoming')
  const [syncing, setSyncing] = useState(false)
  const { data, loading, reload } = useAdminFetch<{ meetings: Row[] }>(`/api/admin/crm/meetings?status=${filter}`, [filter])
  const meetings = data?.meetings || []
  const sync = async () => {
    setSyncing(true)
    try { await adminSend('/api/admin/crm/meetings?sync=calcom', 'POST'); reload() } finally { setSyncing(false) }
  }
  return (
    <>
      <PageHeader title="Meetings" subtitle="Cal.com · Zoom · Fathom — unified"
        actions={<Button variant="ghost" onClick={sync} disabled={syncing}>{syncing ? 'Syncing…' : '↻ Sync Cal.com'}</Button>} />
      <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
        {FILTERS.map((f) => (
          <button key={f} className="tab-btn" onClick={() => setFilter(f)}
            style={{ background: filter === f ? T.green2 : '#fff', color: filter === f ? '#fff' : T.sub, border: `1px solid ${filter === f ? T.green2 : T.border}` }}>
            {STATUS_STYLE[f]?.label || f}
          </button>
        ))}
      </div>
      <Card pad={0} style={{ overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 20 }}>{Array.from({ length: 5 }).map((_, i) => <div key={i} className="skeleton" style={{ height: 20, marginBottom: 12 }} />)}</div>
        ) : meetings.length === 0 ? <EmptyState title={`No ${STATUS_STYLE[filter]?.label.toLowerCase() || filter} meetings`} hint="Bookings sync automatically from Cal.com." /> : (
          <div>
            {meetings.map((m) => {
              const c = (m.contact as Row) || {}
              const st = STATUS_STYLE[m.status as string] || STATUS_STYLE.upcoming
              return (
                <div key={m.id as string} onClick={() => router.push(`/admin/crm/meetings/${m.id}`)}
                  style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '13px 18px', borderBottom: '1px solid #f2f3f2', cursor: 'pointer' }} className="admin-row">
                  <Avatar name={c.name as string} email={c.email as string} size={34} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: T.ink }}>{(m.title as string) || 'Meeting'}</div>
                    <div style={{ fontSize: 13, color: T.sub }}>{(c.name as string) || (c.email as string) || '—'}</div>
                  </div>
                  {m.recording_url || m.fathom_share_url ? <span title="Has recording">🎥</span> : null}
                  <span style={{ fontSize: 12, color: T.muted, textTransform: 'capitalize' }}>{m.provider as string}</span>
                  <span style={{ fontSize: 13, color: T.sub, whiteSpace: 'nowrap' }}>{m.starts_at ? new Date(m.starts_at as string).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) : fmtDate(m.created_at as string)}</span>
                  <span className="a-pill" style={{ background: st.bg, color: st.color }}>{st.label}</span>
                </div>
              )
            })}
          </div>
        )}
      </Card>
    </>
  )
}
