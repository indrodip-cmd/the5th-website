'use client'
/* Revenue Center — normalized revenue across all payment providers (Whop first).
   Reads the internal revenue model only, never a provider API. */
import Link from 'next/link'
import { T, Card, EmptyState, PageHeader, useAdminFetch, money } from './ui'

type Row = Record<string, unknown>
interface RevenueData {
  summary: { today: number; yesterday: number; week: number; month: number; year: number; lifetime: number; refunds: number; netLifetime: number; aov: number; salesCount: number; topProducts: Array<{ product: string; count: number; revenue: number }> }
  balances: Row[]
  trend: Array<{ date: string; amount: number }>
  providers: { whop: boolean }
}

export function RevenueCenterFull() {
  const { data, loading } = useAdminFetch<RevenueData>('/api/admin/revenue')
  if (loading && !data) return <><PageHeader title="Revenue" /><div className="skeleton" style={{ height: 200, borderRadius: 14 }} /></>
  const d = data!
  const s = d.summary
  const maxTrend = Math.max(1, ...d.trend.map((t) => t.amount))

  return (
    <>
      <PageHeader title="Revenue" subtitle="All payment providers, unified" />

      {/* Balances */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 14, marginBottom: 18 }}>
        {d.balances.length === 0 ? (
          <Card style={{ gridColumn: '1 / -1' }}><div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
            <div><div style={{ fontSize: 15, fontWeight: 700, color: T.ink }}>No payment provider connected</div><div style={{ fontSize: 13, color: T.sub }}>Connect Whop to sync balances and payments automatically.</div></div>
            <Link href="/admin/integrations" className="a-btn a-btn-primary">Connect Whop</Link>
          </div></Card>
        ) : d.balances.map((b) => (
          <Card key={b.provider as string} style={{ background: `linear-gradient(135deg,${T.ink},${T.green})` }}>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', textTransform: 'capitalize' }}>{b.provider as string} · available</div>
            <div style={{ fontSize: 30, fontWeight: 800, color: '#fff', marginTop: 4 }}>{money(Number(b.available || 0), b.currency as string)}</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 6 }}>Pending {money(Number(b.pending || 0), b.currency as string)} · Reserve {money(Number(b.reserve || 0), b.currency as string)}</div>
          </Card>
        ))}
      </div>

      {/* KPI row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(130px,1fr))', gap: 14, marginBottom: 18 }}>
        {[['Today', s.today], ['Yesterday', s.yesterday], ['This week', s.week], ['This month', s.month], ['This year', s.year], ['Lifetime', s.lifetime], ['Refunds', -s.refunds], ['Avg order', s.aov]].map(([l, v]) => (
          <Card key={l as string} pad={16}><div style={{ fontSize: 20, fontWeight: 800, color: (v as number) < 0 ? T.danger : T.ink }}>{money(v as number)}</div><div style={{ fontSize: 12, color: T.sub, marginTop: 4 }}>{l as string}</div></Card>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 18, alignItems: 'start' }}>
        <Card>
          <h3 style={{ fontSize: 13, fontWeight: 700, color: T.ink, marginBottom: 16 }}>Revenue · last 30 days</h3>
          {s.lifetime === 0 ? <EmptyState title="No revenue yet" hint="Sales appear here once Whop is connected." /> : (
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 160 }}>
              {d.trend.map((t) => (
                <div key={t.date} title={`${t.date}: ${money(t.amount)}`} style={{ flex: 1, background: t.amount > 0 ? T.green2 : '#eef0ee', height: `${Math.max(2, (t.amount / maxTrend) * 100)}%`, borderRadius: 3, transition: 'height .3s' }} />
              ))}
            </div>
          )}
        </Card>
        <Card>
          <h3 style={{ fontSize: 13, fontWeight: 700, color: T.ink, marginBottom: 12 }}>Top products</h3>
          {s.topProducts.length === 0 ? <EmptyState title="No sales yet" /> : s.topProducts.map((p) => (
            <div key={p.product} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid #f4f5f4', fontSize: 13.5 }}>
              <span style={{ color: T.text }}>{p.product} <span style={{ color: T.muted }}>· {p.count}</span></span>
              <span style={{ fontWeight: 700, color: T.green }}>{money(p.revenue)}</span>
            </div>
          ))}
        </Card>
      </div>
    </>
  )
}
