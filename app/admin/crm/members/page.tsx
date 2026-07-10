'use client'
/* CRM · Members — every Whop customer with their lifetime value (LTV).
   Sortable by LTV/joined, status-segmented, with live server-side search. */
import { useMemo, useState } from 'react'
import Link from 'next/link'
import { T, Card, Button, Input, Avatar, EmptyState, PageHeader, useAdminFetch, adminSend, fmtDate, money } from '@/components/admin/ui'

type Row = Record<string, unknown>
const STATUSES = ['All', 'Active', 'Past Due', 'Canceling', 'Churned'] as const
const BADGE: Record<string, { bg: string; color: string }> = {
  Active: { bg: '#dcfce7', color: '#16a34a' }, 'Past Due': { bg: '#fef3c7', color: '#b45309' },
  Canceling: { bg: '#ffedd5', color: '#c2410c' }, Churned: { bg: '#fee2e2', color: '#dc2626' }, Other: { bg: '#f3f4f6', color: '#6b7280' },
}

export default function MembersPage() {
  const [status, setStatus] = useState<string>('All')
  const [sort, setSort] = useState<'ltv' | 'joined'>('ltv')
  const [dir, setDir] = useState<'asc' | 'desc'>('desc')
  const [q, setQ] = useState('')
  const [page, setPage] = useState(1)

  const qs = useMemo(() => {
    const p = new URLSearchParams()
    if (q.trim()) p.set('q', q.trim())
    else { p.set('status', status); p.set('sort', sort); p.set('dir', dir); p.set('page', String(page)) }
    return p.toString()
  }, [q, status, sort, dir, page])

  const { data, loading, reload } = useAdminFetch<{ members: Row[]; total?: number; live?: boolean; page?: number; pageSize?: number }>(`/api/admin/crm/members?${qs}`, [qs])
  const [syncing, setSyncing] = useState(false)
  const members = data?.members || []
  const pages = data?.total ? Math.max(1, Math.ceil(data.total / (data.pageSize || 50))) : 1

  const sync = async () => { setSyncing(true); try { const r = await adminSend('/api/admin/crm/members', 'POST') as { records?: number }; alert(`Synced ${r?.records ?? 0} members.`); reload() } finally { setSyncing(false) } }
  const toggleSort = (col: 'ltv' | 'joined') => { if (sort === col) setDir((d) => d === 'desc' ? 'asc' : 'desc'); else { setSort(col); setDir('desc') } }
  const memberName = (m: Row) => (m.name as string) || (m.username as string) || (m.email as string) || '—'

  return (
    <>
      <PageHeader title="Members" subtitle={data?.total != null ? `${data.total} members · LTV from Whop` : 'Whop customers & lifetime value'}
        actions={<Button variant="ghost" disabled={syncing} onClick={sync}>{syncing ? 'Syncing…' : '↻ Sync from Whop'}</Button>} />

      <Card pad={14} style={{ marginBottom: 14 }}>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <Input placeholder="Search name, username or email (live)…" value={q} onChange={(e) => { setQ(e.target.value); setPage(1) }} style={{ flex: 1, minWidth: 220 }} />
          {!q && (
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              {STATUSES.map((s) => (
                <button key={s} onClick={() => { setStatus(s); setPage(1) }} className="tab-btn" style={{ padding: '7px 12px', background: status === s ? T.green2 : '#fff', color: status === s ? '#fff' : T.sub, border: `1px solid ${status === s ? T.green2 : T.border}` }}>{s}</button>
              ))}
            </div>
          )}
        </div>
      </Card>

      <Card pad={0} style={{ overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="a-table">
            <thead>
              <tr>
                <th>Member</th><th>Email</th>
                <th onClick={() => toggleSort('ltv')} style={{ cursor: 'pointer' }}>LTV {sort === 'ltv' ? (dir === 'desc' ? '↓' : '↑') : ''}</th>
                <th>Status</th>
                <th onClick={() => toggleSort('joined')} style={{ cursor: 'pointer' }}>Joined {sort === 'joined' ? (dir === 'desc' ? '↓' : '↑') : ''}</th>
                <th>Phone</th>
              </tr>
            </thead>
            <tbody>
              {loading && !data ? Array.from({ length: 8 }).map((_, i) => <tr key={i}>{Array.from({ length: 6 }).map((_, j) => <td key={j}><div className="skeleton" style={{ height: 14, width: j === 0 ? 160 : 70 }} /></td>)}</tr>)
                : members.length === 0 ? <tr><td colSpan={6}><EmptyState title="No members" hint="Click “Sync from Whop” to import your members." /></td></tr>
                : members.map((m) => {
                  const badge = BADGE[(m.derived_status as string) || 'Other'] || BADGE.Other
                  const inner = (
                    <>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <Avatar name={memberName(m)} email={m.email as string} size={30} />
                          <span style={{ fontWeight: 600, color: T.ink }}>{memberName(m)}</span>
                        </div>
                      </td>
                      <td style={{ color: T.sub }}>{(m.email as string) || '—'}</td>
                      <td style={{ fontWeight: 700, color: T.green }}>{money(Number(m.usd_total_spent || 0))}</td>
                      <td><span className="a-pill" style={{ background: badge.bg, color: badge.color }}>{(m.derived_status as string) || 'Other'}</span></td>
                      <td style={{ color: T.sub, whiteSpace: 'nowrap' }}>{fmtDate((m.joined_at as string) || (m.member_created_at as string))}</td>
                      <td style={{ color: T.sub }}>{(m.phone as string) || '—'}</td>
                    </>
                  )
                  return m.contact_id
                    ? <tr key={m.id as string} className="admin-row" style={{ cursor: 'pointer' }} onClick={() => (window.location.href = `/admin/crm/${m.contact_id}`)}>{inner}</tr>
                    : <tr key={m.id as string}>{inner}</tr>
                })}
            </tbody>
          </table>
        </div>
      </Card>

      {!q && pages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginTop: 16, alignItems: 'center' }}>
          <Button variant="ghost" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>← Prev</Button>
          <span style={{ fontSize: 13, color: T.sub }}>Page {page} of {pages}</span>
          <Button variant="ghost" disabled={page >= pages} onClick={() => setPage((p) => p + 1)}>Next →</Button>
        </div>
      )}
    </>
  )
}
