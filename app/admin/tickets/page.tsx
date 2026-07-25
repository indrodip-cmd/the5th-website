'use client'
/* Support Tickets — bug reports and help requests from the website + Carolina. */
import { useState } from 'react'
import { T, Card, PageHeader, Select, useAdminFetch, adminSend, EmptyState } from '@/components/admin/ui'

type Ticket = {
  id: string; ref: string; created_at: string; name: string | null; email: string | null
  category: string; subject: string | null; message: string; page_url: string | null
  status: string; priority: string; source: string; admin_notes: string | null
}

const STATUSES = ['open', 'in_progress', 'resolved', 'closed']
const STATUS_COLOR: Record<string, string> = {
  open: '#b45309', in_progress: '#2563eb', resolved: '#16a34a', closed: '#6b7280',
}
const CAT_ICON: Record<string, string> = {
  bug: '🐞', question: '❓', billing: '💳', account: '🔐', feedback: '💡', other: '✦',
}

function timeAgo(iso: string): string {
  const s = Math.max(1, Math.floor((Date.now() - new Date(iso).getTime()) / 1000))
  if (s < 60) return `${s}s ago`
  const m = Math.floor(s / 60); if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60); if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

export default function AdminTickets() {
  const [filter, setFilter] = useState('')
  const { data, loading, reload } = useAdminFetch<{ tickets: Ticket[] }>(
    `/api/tickets${filter ? `?status=${filter}` : ''}`, [filter]
  )
  const tickets = data?.tickets || []

  const update = async (id: string, patch: Record<string, unknown>) => {
    await adminSend('/api/tickets', 'PATCH', { id, ...patch })
    reload()
  }

  const openCount = tickets.filter(t => t.status === 'open').length

  return (
    <>
      <PageHeader title="Support Tickets" subtitle="Bug reports and help requests from the website and Carolina" />

      <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 16, flexWrap: 'wrap' }}>
        <Select value={filter} onChange={e => setFilter(e.target.value)} style={{ maxWidth: 200 }}>
          <option value="">All statuses</option>
          {STATUSES.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
        </Select>
        {!filter && <span style={{ fontSize: 13, color: T.muted }}>{openCount} open · {tickets.length} total</span>}
      </div>

      {loading && !data && <div className="skeleton" style={{ height: 240, borderRadius: 14 }} />}

      {!loading && tickets.length === 0 && (
        <EmptyState title="No tickets yet" hint="Bug reports and help requests will show up here." icon="🎫" />
      )}

      <div style={{ display: 'grid', gap: 12 }}>
        {tickets.map(t => (
          <Card key={t.id} pad={18}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
              <div style={{ fontSize: 22, lineHeight: 1 }}>{CAT_ICON[t.category] || '✦'}</div>
              <div style={{ flex: 1, minWidth: 240 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                  <span style={{ fontFamily: 'ui-monospace, Menlo, monospace', fontSize: 12.5, fontWeight: 700, color: T.muted }}>{t.ref}</span>
                  <span style={{
                    fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.04em',
                    color: STATUS_COLOR[t.status] || T.muted, background: (STATUS_COLOR[t.status] || '#999') + '18',
                    borderRadius: 6, padding: '2px 7px',
                  }}>{t.status.replace('_', ' ')}</span>
                  <span style={{ fontSize: 11, color: T.muted, textTransform: 'capitalize' }}>{t.category}</span>
                  {t.source === 'carolina' && <span style={{ fontSize: 11, color: '#7c3aed' }}>via Carolina</span>}
                  <span style={{ fontSize: 11, color: T.muted, marginLeft: 'auto' }}>{timeAgo(t.created_at)}</span>
                </div>
                {t.subject && <div style={{ fontSize: 15, fontWeight: 700, color: T.ink, marginBottom: 3 }}>{t.subject}</div>}
                <div style={{ fontSize: 14, color: T.ink, lineHeight: 1.55, whiteSpace: 'pre-wrap' }}>{t.message}</div>
                <div style={{ fontSize: 12.5, color: T.muted, marginTop: 8 }}>
                  {t.name ? `${t.name} · ` : ''}{t.email
                    ? <a href={`mailto:${t.email}`} style={{ color: T.muted }}>{t.email}</a>
                    : 'no email'}
                  {t.page_url ? <> · <a href={t.page_url} target="_blank" rel="noreferrer" style={{ color: T.muted }}>page</a></> : null}
                </div>
              </div>
              <Select value={t.status} onChange={e => update(t.id, { status: e.target.value })} style={{ maxWidth: 150 }}>
                {STATUSES.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
              </Select>
            </div>
          </Card>
        ))}
      </div>
    </>
  )
}
