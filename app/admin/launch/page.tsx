'use client'
/* Launch Readiness (3I.8B.3) — green/yellow/red across every dependency, so you
   know the platform is production-ready at a glance. */
import Link from 'next/link'
import { T, Card, PageHeader, useAdminFetch } from '@/components/admin/ui'

type Row = Record<string, unknown>
const C: Record<string, string> = { green: '#16a34a', yellow: '#d97706', red: '#dc2626' }

export default function Launch() {
  const { data, loading } = useAdminFetch<{ sections: Row[]; ready: boolean; blockers: number }>('/api/admin/launch')
  if (loading && !data) return <div className="skeleton" style={{ height: 300, borderRadius: 14 }} />
  return (
    <>
      <PageHeader title="Launch Readiness" subtitle="Every dependency, at a glance"
        actions={<Link href="/admin/executive" style={{ color: T.sub, textDecoration: 'none', fontSize: 13 }}>← Command Center</Link>} />
      <Card style={{ marginBottom: 16, background: data?.ready ? '#f0fdf4' : '#fffbeb', border: `1px solid ${data?.ready ? '#bbf7d0' : '#fde68a'}` }}>
        <div style={{ fontSize: 15, fontWeight: 800, color: data?.ready ? '#16a34a' : '#d97706' }}>{data?.ready ? '✓ Ready to launch — no blockers' : `⚠ ${data?.blockers} blocker(s) to resolve`}</div>
      </Card>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 16 }}>
        {(data?.sections || []).map((sec) => (
          <Card key={sec.name as string}>
            <div style={{ fontSize: 13, fontWeight: 700, color: T.ink, marginBottom: 10 }}>{sec.name as string}</div>
            {((sec.items as Row[]) || []).map((it, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 0', borderBottom: `1px solid #f4f5f4` }}>
                <span style={{ width: 9, height: 9, borderRadius: '50%', background: C[it.status as string] || '#9ca3af', flexShrink: 0 }} />
                <span style={{ flex: 1, fontSize: 13, color: T.text }}>{it.label as string}</span>
                <span style={{ fontSize: 11.5, color: T.muted }}>{(it.detail as string) || (it.status as string)}</span>
              </div>
            ))}
          </Card>
        ))}
      </div>
    </>
  )
}
