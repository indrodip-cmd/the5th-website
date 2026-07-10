'use client'
/* CRM · Tasks — cross-contact task board. */
import { useState } from 'react'
import Link from 'next/link'
import { T, Card, Button, EmptyState, PageHeader, useAdminFetch, adminSend, fmtDate } from '@/components/admin/ui'

type Row = Record<string, unknown>

export default function TasksBoard() {
  const [filter, setFilter] = useState<'open' | 'done' | 'overdue'>('open')
  const qs = filter === 'overdue' ? 'overdue=1' : `status=${filter}`
  const { data, loading, reload } = useAdminFetch<{ tasks: Row[] }>(`/api/admin/crm/tasks?${qs}`, [qs])
  const tasks = data?.tasks || []
  const complete = async (id: string) => { await adminSend('/api/admin/crm/tasks', 'PATCH', { task_id: id }); reload() }

  return (
    <>
      <PageHeader title="Tasks" subtitle="Every follow-up across the CRM" actions={<Link href="/admin/crm"><Button variant="ghost">← Contacts</Button></Link>} />
      <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
        {(['open', 'overdue', 'done'] as const).map((f) => (
          <button key={f} className="tab-btn" onClick={() => setFilter(f)} style={{ background: filter === f ? T.green2 : '#fff', color: filter === f ? '#fff' : T.sub, border: `1px solid ${filter === f ? T.green2 : T.border}`, textTransform: 'capitalize' }}>{f}</button>
        ))}
      </div>
      <Card pad={0} style={{ overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 20 }}>{Array.from({ length: 5 }).map((_, i) => <div key={i} className="skeleton" style={{ height: 18, marginBottom: 12 }} />)}</div>
        ) : tasks.length === 0 ? <EmptyState title={`No ${filter} tasks`} /> : (
          <div>
            {tasks.map((t) => {
              const contact = t.contact as Row | null
              return (
                <div key={t.id as string} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '13px 18px', borderBottom: `1px solid #f2f3f2` }}>
                  {filter !== 'done' && <input type="checkbox" onChange={() => complete(t.id as string)} />}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 500, color: T.text, textDecoration: filter === 'done' ? 'line-through' : 'none' }}>{t.title as string}</div>
                    {contact && <Link href={`/admin/crm/${contact.id}`} style={{ fontSize: 13, color: T.green, textDecoration: 'none' }}>{(contact.name as string) || (contact.email as string)}</Link>}
                  </div>
                  {t.due_date ? <span className="a-pill" style={{ background: '#f3f4f6', color: T.sub }}>{fmtDate(t.due_date as string)}</span> : null}
                  {t.priority && t.priority !== 'normal' ? <span className="a-pill" style={{ background: '#fef3c7', color: '#b45309' }}>{t.priority as string}</span> : null}
                </div>
              )
            })}
          </div>
        )}
      </Card>
    </>
  )
}
