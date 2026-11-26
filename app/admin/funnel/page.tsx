'use client'
import { useEffect, useState } from 'react'

type Row = { key: string; visitors: number; cta: number; checkout: number; purchases: number; leads: number; ctr: number; checkoutRate: number; cvr: number }
type Data = {
  days: number; generatedAt: string
  summary: Row & { orders: number; revenue: number; aov: number; revenuePerVisitor: number; bumpTakeRate: number }
  variants: Row[]; devices: Row[]; sources: Row[]
  ctaWhere: { where: string; clicks: number }[]; sections: { section: string; visitors: number; reach: number }[]
  revenueByDay: { date: string; amount: number }[]
  notes: { planIdsConfigured: boolean; revenueSource: string }
}
const pct = (n: number) => (n * 100).toFixed(n && n < 0.1 ? 2 : 1) + '%'
const usd = (n: number) => '$' + n.toLocaleString('en-US', { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 })

export default function FunnelAdmin() {
  const [days, setDays] = useState(30)
  const [d, setD] = useState<Data | null>(null)
  const [err, setErr] = useState('')
  useEffect(() => {
    let live = true
    fetch(`/api/admin/funnel?days=${days}`, { credentials: 'include' }).then(async (r) => { if (!r.ok) throw new Error(r.status === 401 ? 'Not signed in as admin' : 'Failed to load'); return r.json() })
      .then((j) => { if (live) { setD(j); setErr('') } }).catch((e) => live && setErr(String(e.message || e)))
    return () => { live = false }
  }, [days])

  const box: React.CSSProperties = { background: '#fff', border: '1px solid #e5e7eb', borderRadius: 14, padding: 18 }
  const th: React.CSSProperties = { textAlign: 'left', fontSize: 11, textTransform: 'uppercase', letterSpacing: '.08em', color: '#6b7280', padding: '8px 10px', borderBottom: '1px solid #e5e7eb' }
  const td: React.CSSProperties = { padding: '10px', borderBottom: '1px solid #f1f2f4', fontSize: 14 }
  const table = (title: string, hint: string, rows: Row[]) => (
    <div style={box}>
      <div style={{ fontWeight: 800, fontSize: 16 }}>{title}</div><div style={{ color: '#6b7280', fontSize: 12.5, margin: '2px 0 10px' }}>{hint}</div>
      <div style={{ overflowX: 'auto' }}><table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 560 }}>
        <thead><tr>{['', 'Visitors', 'CTA click', 'Checkout', 'Purchases', 'Leads', 'CVR'].map((h) => <th key={h} style={th}>{h}</th>)}</tr></thead>
        <tbody>{rows.length === 0 && <tr><td style={td} colSpan={7}>No data yet</td></tr>}{rows.map((r) => (
          <tr key={r.key}><td style={{ ...td, fontWeight: 700 }}>{r.key}</td><td style={td}>{r.visitors}</td><td style={td}>{r.cta} <span style={{ color: '#6b7280' }}>({pct(r.ctr)})</span></td><td style={td}>{r.checkout} <span style={{ color: '#6b7280' }}>({pct(r.checkoutRate)})</span></td><td style={td}>{r.purchases}</td><td style={td}>{r.leads}</td><td style={{ ...td, fontWeight: 800 }}>{pct(r.cvr)}</td></tr>))}</tbody>
      </table></div>
    </div>
  )
  const kpi = (l: string, v: string, s?: string) => <div style={box}><div style={{ color: '#6b7280', fontSize: 12, textTransform: 'uppercase', letterSpacing: '.08em' }}>{l}</div><div style={{ fontSize: 30, fontWeight: 800, margin: '6px 0 2px' }}>{v}</div>{s && <div style={{ color: '#6b7280', fontSize: 12.5 }}>{s}</div>}</div>

  return (
    <div style={{ maxWidth: 1180, margin: '0 auto', padding: '8px 0 60px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 18 }}>
        <div><h1 style={{ margin: 0, fontSize: 26 }}>Book funnel</h1><div style={{ color: '#6b7280', fontSize: 13.5 }}>Expertise to Income · /book · behaviour from first-party events, revenue from the Whop webhook</div></div>
        <div style={{ display: 'flex', gap: 8 }}>{[7, 30, 90].map((n) => <button key={n} onClick={() => setDays(n)} style={{ padding: '8px 14px', borderRadius: 10, border: '1px solid #d1d5db', background: days === n ? '#111827' : '#fff', color: days === n ? '#fff' : '#111827', cursor: 'pointer', fontWeight: 700 }}>{n}d</button>)}</div>
      </div>
      {err && <div style={{ ...box, borderColor: '#fca5a5', color: '#991b1b' }}>{err}</div>}
      {!d && !err && <div style={box}>Loading…</div>}
      {d && (<>
        {!d.notes.planIdsConfigured && <div style={{ ...box, background: '#fffbeb', borderColor: '#fcd34d', marginBottom: 14 }}>Set <code>NEXT_PUBLIC_WHOP_BOOK_PLAN_ID</code> so revenue can be matched to the book. Behaviour metrics below work without it.</div>}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(190px,1fr))', gap: 12, marginBottom: 14 }}>
          {kpi('Landing visitors', String(d.summary.visitors), `${d.days} days`)}
          {kpi('CTA click-through', pct(d.summary.ctr), `${d.summary.cta} visitors clicked a buy button`)}
          {kpi('Checkout rate', pct(d.summary.checkoutRate), `${d.summary.checkout} reached checkout`)}
          {kpi('Conversion rate', pct(d.summary.cvr), `${d.summary.purchases} purchases (browser-confirmed)`)}
          {kpi('Revenue', usd(d.summary.revenue), `${d.summary.orders} orders (server-confirmed)`)}
          {kpi('Avg order value', usd(d.summary.aov), `bump take rate ${pct(d.summary.bumpTakeRate)}`)}
          {kpi('Revenue / visitor', usd(d.summary.revenuePerVisitor), 'the number to optimise')}
          {kpi('Email leads', String(d.summary.leads), 'free Chapter 1 requests')}
        </div>
        <div style={{ display: 'grid', gap: 14 }}>
          {table('A/B variants', 'Each row is one variant of one experiment (headline / cta / theme). Compare rows with the same prefix. Wait for roughly 100+ visitors per variant and a clear gap before calling a winner.', d.variants)}
          {table('Device', 'Mobile vs tablet vs desktop', d.devices)}
          {table('Traffic source', 'First-touch UTM source, or referring site, or direct', d.sources)}
          <div style={box}>
            <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 8 }}>Which CTAs get clicked</div>
            {d.ctaWhere.length === 0 ? 'No clicks yet' : d.ctaWhere.map((c) => <div key={c.where} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f1f2f4' }}><span>{c.where}</span><strong>{c.clicks}</strong></div>)}
          </div>
          <div style={box}>
            <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 8 }}>Scroll reach by section</div>
            {d.sections.length === 0 ? 'No data yet' : d.sections.map((s) => <div key={s.section} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '5px 0' }}><span style={{ width: 130, fontSize: 14 }}>{s.section}</span><div style={{ flex: 1, height: 10, background: '#f1f2f4', borderRadius: 5 }}><div style={{ width: `${Math.round(s.reach * 100)}%`, height: '100%', background: '#65a30d', borderRadius: 5 }} /></div><strong style={{ width: 52, textAlign: 'right' }}>{pct(s.reach)}</strong></div>)}
          </div>
        </div>
      </>)}
    </div>
  )
}
