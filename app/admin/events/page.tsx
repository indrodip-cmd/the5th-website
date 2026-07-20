'use client'
/* Breakthrough Intensive — campaign + sales dashboard. Email performance
   (sends, delivered, opens, clicks, bounces) and event revenue in one place. */
import { Card, PageHeader, useAdminFetch, money } from '@/components/admin/ui'

interface EmailRow {
  key: string; subject: string; flow: 'presale' | 'onboard'
  sent: number; delivered: number; opened: number; openRate: number
  clicked: number; clickRate: number; bounced: number; complained: number
}
interface Data {
  totals: { sent: number; delivered: number; opened: number; openRate: number; clicked: number; clickRate: number; bounced: number; complained: number }
  audience: { leads: number; buyers: number; unsubscribed: number; total: number }
  sales: { tickets: number; revenue: number; ticketPrice: number; conversionRate: number }
  perEmail: EmailRow[]
}

function Stat({ label, value, sub, accent }: { label: string; value: string; sub?: string; accent?: string }) {
  return (
    <Card pad={18} style={{ minWidth: 0 }}>
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.05em', textTransform: 'uppercase', color: '#6b7280' }}>{label}</div>
      <div style={{ fontSize: 26, fontWeight: 800, color: accent || '#0a0a0a', marginTop: 6, lineHeight: 1.1 }}>{value}</div>
      {sub && <div style={{ fontSize: 12.5, color: '#8a8f98', marginTop: 4 }}>{sub}</div>}
    </Card>
  )
}

export default function EventsDashboardPage() {
  const { data, loading, error, reload } = useAdminFetch<Data>('/api/admin/events/campaign')

  return (
    <div style={{ maxWidth: 1180, margin: '0 auto', padding: '4px 2px 60px' }}>
      <PageHeader
        title="Breakthrough Intensive"
        subtitle="Email campaign performance + event sales · Aug 7 to 9, 2026"
        actions={<button className="a-btn a-btn-ghost" onClick={reload}>↻ Refresh</button>}
      />

      {loading && <Card>Loading metrics…</Card>}
      {error && <Card style={{ color: '#b42318' }}>Couldn’t load metrics ({error}).</Card>}

      {data && (
        <>
          {/* Sales */}
          <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: '.06em', textTransform: 'uppercase', color: '#6b7280', margin: '4px 2px 10px' }}>Event sales</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 12, marginBottom: 22 }}>
            <Stat label="Tickets sold" value={String(data.sales.tickets)} sub={`$${data.sales.ticketPrice} each`} accent="#225840" />
            <Stat label="Revenue" value={money(data.sales.revenue)} accent="#225840" />
            <Stat label="Conversion" value={`${data.sales.conversionRate}%`} sub="list → buyer" />
            <Stat label="Leads" value={String(data.audience.leads)} sub="on presale list" />
            <Stat label="Buyers" value={String(data.audience.buyers)} />
            <Stat label="Unsubscribed" value={String(data.audience.unsubscribed)} accent={data.audience.unsubscribed ? '#b42318' : undefined} />
          </div>

          {/* Email performance */}
          <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: '.06em', textTransform: 'uppercase', color: '#6b7280', margin: '4px 2px 10px' }}>Email performance (all sends)</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: 12, marginBottom: 22 }}>
            <Stat label="Sent" value={String(data.totals.sent)} />
            <Stat label="Delivered" value={String(data.totals.delivered)} />
            <Stat label="Open rate" value={`${data.totals.openRate}%`} sub={`${data.totals.opened} opened`} accent="#225840" />
            <Stat label="Click rate" value={`${data.totals.clickRate}%`} sub={`${data.totals.clicked} clicked`} accent="#225840" />
            <Stat label="Bounced" value={String(data.totals.bounced)} accent={data.totals.bounced ? '#b42318' : undefined} />
            <Stat label="Complaints" value={String(data.totals.complained)} accent={data.totals.complained ? '#b42318' : undefined} />
          </div>

          {/* Per-email table */}
          <Card pad={0} style={{ overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table className="a-table">
                <thead style={{ background: '#225840' }}>
                  <tr>
                    <th>Email</th><th>Flow</th><th>Sent</th><th>Delivered</th><th>Open %</th><th>Click %</th><th>Bounced</th>
                  </tr>
                </thead>
                <tbody>
                  {data.perEmail.map((e) => (
                    <tr key={e.key}>
                      <td style={{ maxWidth: 340 }}>
                        <div style={{ fontWeight: 600, color: '#0a0a0a' }}>{e.subject}</div>
                        <div style={{ fontSize: 12, color: '#8a8f98' }}>{e.key}</div>
                      </td>
                      <td>
                        <span className="a-pill" style={{ background: e.flow === 'presale' ? '#eef2ff' : '#e9f7ef', color: e.flow === 'presale' ? '#3730a3' : '#225840' }}>
                          {e.flow === 'presale' ? 'Invite' : 'Onboarding'}
                        </span>
                      </td>
                      <td>{e.sent}</td>
                      <td>{e.delivered}</td>
                      <td style={{ fontWeight: 700 }}>{e.openRate}%</td>
                      <td style={{ fontWeight: 700 }}>{e.clickRate}%</td>
                      <td style={{ color: e.bounced ? '#b42318' : '#8a8f98' }}>{e.bounced}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <p style={{ fontSize: 12.5, color: '#8a8f98', marginTop: 14 }}>
            Opens &amp; clicks require open/click tracking enabled on the Resend domain and the Resend webhook pointed at
            <code style={{ margin: '0 4px' }}>/api/webhooks/resend</code>. Test sends are excluded — these are real campaign sends only.
          </p>
        </>
      )}
    </div>
  )
}
