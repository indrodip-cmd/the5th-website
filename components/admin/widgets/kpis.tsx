'use client'
/* KPI widgets — small hero numbers. Registered from a spec list so adding one
   is a single line. All read the shared WidgetDataProvider. */
import { registerWidget, useWidgetData, type WidgetData } from './registry'
import { KpiView } from './shared'
import { money, T } from '../ui'

function n(o: Record<string, unknown> | null, k: string): number { return Number((o || {})[k] || 0) }

interface KpiSpec { id: string; title: string; category: 'revenue' | 'crm' | 'meetings' | 'ai' | 'analytics'; get: (d: WidgetData) => { value: string; sub?: string } }

// Balance KPIs show EVERY currency (USD + EUR + …), never a single hardcoded one.
function BalanceKpi({ field, label }: { field: 'available' | 'pending'; label: string }) {
  const d = useWidgetData()
  const balances = (((d.revenue || {}).balances as Array<Record<string, unknown>>) || []).filter((x) => x.currency !== 'TREASURY')
  if (balances.length === 0) return <KpiView label={label} value="—" sub="Connect Whop" loading={d.loading && !d.revenue} />
  const primary = balances.find((x) => String(x.currency).toUpperCase() === 'USD') || balances[0]
  const rest = balances.filter((x) => x !== primary)
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <div style={{ fontSize: 24, fontWeight: 800, color: T.ink, lineHeight: 1.1 }}>{money(Number(primary[field] || 0), primary.currency as string)}</div>
      {rest.map((x) => <div key={x.currency as string} style={{ fontSize: 13, fontWeight: 600, color: T.sub, marginTop: 2 }}>{money(Number(x[field] || 0), x.currency as string)}</div>)}
      <div style={{ fontSize: 12.5, color: T.sub, marginTop: 6, fontWeight: 500 }}>{label}</div>
    </div>
  )
}
registerWidget({ id: 'kpi-available-balance', title: 'Available balance', category: 'revenue', defaultW: 1, defaultH: 'sm', Component: () => <BalanceKpi field="available" label="Available balance" /> })
registerWidget({ id: 'kpi-pending-balance', title: 'Pending balance', category: 'revenue', defaultW: 1, defaultH: 'sm', Component: () => <BalanceKpi field="pending" label="Pending balance" /> })

const KPIS: KpiSpec[] = [
  { id: 'kpi-revenue-today', title: "Today's revenue", category: 'revenue', get: (d) => ({ value: money(n(d.cc, 'revenueToday')), sub: `Yesterday ${money(n(d.cc, 'revenueYesterday'))}` }) },
  { id: 'kpi-revenue-week', title: 'This week', category: 'revenue', get: (d) => ({ value: money(n(d.cc, 'revenueWeek')) }) },
  { id: 'kpi-revenue-month', title: 'This month', category: 'revenue', get: (d) => ({ value: money(n(d.cc, 'revenueMonth')) }) },
  { id: 'kpi-revenue-lifetime', title: 'Lifetime revenue', category: 'revenue', get: (d) => ({ value: money(n(d.cc, 'revenueLifetime')) }) },
  { id: 'kpi-calls-today', title: 'Strategy calls today', category: 'meetings', get: (d) => ({ value: String(n(d.cc, 'callsToday')) }) },
  { id: 'kpi-calls-tomorrow', title: 'Strategy calls tomorrow', category: 'meetings', get: (d) => ({ value: String(n(d.cc, 'callsTomorrow')) }) },
  { id: 'kpi-hot-leads', title: 'Hot leads', category: 'crm', get: (d) => ({ value: String(n(d.cc, 'hotLeads')) }) },
  { id: 'kpi-pipeline-value', title: 'Pipeline value', category: 'crm', get: (d) => ({ value: money(n(d.cc, 'pipelineValue')), sub: `${n(d.cc, 'openOpps')} open` }) },
  { id: 'kpi-upcoming-meetings', title: 'Upcoming meetings', category: 'meetings', get: (d) => ({ value: String(n(d.cc, 'upcomingMeetings')) }) },
  { id: 'kpi-ai-today', title: 'AI conversations today', category: 'ai', get: (d) => ({ value: String(n(d.cc, 'aiConversationsToday')) }) },
  { id: 'kpi-visitors', title: 'Visitors (24h)', category: 'analytics', get: (d) => ({ value: String(n(d.cc, 'visitors24h')) }) },
  { id: 'kpi-new-customers', title: 'New customers (7d)', category: 'revenue', get: (d) => ({ value: String(n(d.cc, 'newCustomers')) }) },
  { id: 'kpi-conversion', title: 'Lead→call conversion', category: 'analytics', get: (d) => ({ value: `${n(d.analytics, 'conversionRate')}%` }) },
]

for (const spec of KPIS) {
  const Comp = () => { const d = useWidgetData(); const { value, sub } = spec.get(d); return <KpiView label={spec.title} value={value} sub={sub} loading={d.loading && !d.cc} /> }
  Comp.displayName = spec.id
  registerWidget({ id: spec.id, title: spec.title, category: spec.category, defaultW: 1, defaultH: 'sm', Component: Comp })
}
