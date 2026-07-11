'use client'
/* Cost Intelligence Center — unified spend across providers with per-unit
   economics and a spike alert. */
import { T, Card, PageHeader, useAdminFetch, money } from '@/components/admin/ui'

type Row = Record<string, unknown>

export default function Costs() {
  const { data, loading } = useAdminFetch<{ costs: Row }>('/api/admin/costs')
  if (loading && !data) return <div className="skeleton" style={{ height: 260, borderRadius: 14 }} />
  const c = (data?.costs || {}) as Row
  const per = (c.perUnit || {}) as Row
  return (
    <>
      <PageHeader title="Cost Intelligence" subtitle="What the platform costs to run — by provider and per unit" />
      {c.spike ? <Card style={{ marginBottom: 16, background: '#fffbeb', border: '1px solid #fde68a' }}><div style={{ fontSize: 13.5, color: '#b45309' }}>⚠ {c.spike as string}</div></Card> : null}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: 12, marginBottom: 18 }}>
        {[['Total this month', money(Number(c.total_month || 0))], ['AI this month', money(Number(c.ai_month || 0))], ['AI today', money(Number(c.ai_today || 0))], ['Comms this month', money(Number(c.comms_month || 0))]].map(([k, v]) => (
          <Card key={k as string} pad={16}><div style={{ fontSize: 20, fontWeight: 800, color: T.ink }}>{v as string}</div><div style={{ fontSize: 11.5, color: T.sub }}>{k as string}</div></Card>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <Card>
          <div style={{ fontSize: 13, fontWeight: 700, color: T.ink, marginBottom: 10 }}>By provider (this month)</div>
          {((c.providers as Row[]) || []).map((p) => (
            <div key={p.name as string} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 0', borderBottom: `1px solid ${T.border}` }}>
              <span style={{ flex: 1, fontSize: 13, color: T.text }}>{p.name as string}{p.units != null ? <span style={{ color: T.muted }}> · {p.units as number} units</span> : null}</span>
              <b style={{ color: T.ink }}>{money(Number(p.cost || 0))}</b>
            </div>
          ))}
          <div style={{ fontSize: 13, fontWeight: 700, color: T.ink, margin: '14px 0 8px' }}>AI by model</div>
          {((c.byModel as Row[]) || []).map((m) => (
            <div key={m.model as string} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, color: T.sub, padding: '4px 0' }}><span>{m.model as string}</span><b style={{ color: T.ink }}>{money(Number(m.cost || 0))}</b></div>
          ))}
        </Card>
        <Card>
          <div style={{ fontSize: 13, fontWeight: 700, color: T.ink, marginBottom: 10 }}>Unit economics (this month)</div>
          {[['Cost per AI conversation', money(Number(per.per_ai_conversation || 0)), `${per.conversations || 0} conversations`], ['Cost per booking', money(Number(per.per_booking || 0)), `${per.bookings || 0} bookings`], ['Emails sent', String(per.emails || 0), ''], ['SMS sent', String(per.sms || 0), '']].map(([k, v, sub]) => (
            <div key={k as string} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 0', borderBottom: `1px solid ${T.border}` }}>
              <div style={{ flex: 1 }}><div style={{ fontSize: 13, color: T.text }}>{k as string}</div>{sub ? <div style={{ fontSize: 11, color: T.muted }}>{sub as string}</div> : null}</div>
              <b style={{ color: T.ink }}>{v as string}</b>
            </div>
          ))}
          <div style={{ fontSize: 11, color: T.muted, marginTop: 10 }}>AI costs are exact (metered per call). Email/SMS use editable per-message rate estimates.</div>
        </Card>
      </div>
    </>
  )
}
