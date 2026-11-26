'use client'
import { useEffect, useState } from 'react'

type EmailRow = { key: string; label: string; sent: number; opened: number; clicked: number; bounced: number; complained: number }
type Data = {
  days: number
  kpis: { leads: number; chapter1Downloads: number; chapter1Downloaders: number; buyers: number; revenue: number; bookDownloads: number; buyersWhoDownloaded: number; leadsWhoBought: number; leadToBuyer: number; emailsSent: number; unsubscribedLeads: number }
  emails: EmailRow[]
  buyers: { email: string; name: string | null; amount: number; at: string; emailed: boolean; emailedAt: string | null; opened: boolean; clicked: boolean; downloads: number; lastDownload: string | null; bundle: boolean }[]
  leads: { email: string; at: string; downloads: number; campaignSent: number; lastStep: number; campaignOpened: number; bought: boolean; unsubscribed: boolean; bounced: boolean }[]
  downloadsByDay: { date: string; chapter1: number; book: number }[]
  notes: { opensTracked: boolean; plansConfigured: boolean }
}
const pct = (a: number, b: number) => (b ? Math.round((a / b) * 100) + '%' : '-')
const usd = (n: number) => '$' + n.toLocaleString('en-US', { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 })
const when = (s: string | null) => (s ? new Date(s).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) : '-')
const TPL = [['chapter1', 'Chapter 1 delivery'], ['purchase', 'Purchase delivery'], ['c1', 'Campaign 1 (day 1)'], ['c2', 'Campaign 2 (day 3)'], ['c3', 'Campaign 3 (day 5)'], ['c4', 'Campaign 4 (day 8)'], ['c5', 'Campaign 5 (day 12)']]

export default function BookAdmin() {
  const [days, setDays] = useState(90)
  const [d, setD] = useState<Data | null>(null)
  const [err, setErr] = useState('')
  const [tpl, setTpl] = useState('chapter1')
  const [msg, setMsg] = useState('')
  useEffect(() => {
    let live = true
    fetch(`/api/admin/book?days=${days}`, { credentials: 'include' }).then(async (r) => { if (!r.ok) throw new Error(r.status === 401 ? 'Not signed in as admin' : 'Failed to load'); return r.json() })
      .then((j) => { if (live) { setD(j); setErr('') } }).catch((e) => live && setErr(String(e.message || e)))
    return () => { live = false }
  }, [days])
  const sendTest = async () => {
    setMsg('Sending…')
    const r = await fetch('/api/admin/book/test', { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ template: tpl }) })
    const j = await r.json().catch(() => ({})); setMsg(r.ok ? `Sent to ${j.to}` : j.error || 'Failed')
  }

  const box: React.CSSProperties = { background: '#fff', border: '1px solid #e5e7eb', borderRadius: 14, padding: 18 }
  const th: React.CSSProperties = { textAlign: 'left', fontSize: 11, textTransform: 'uppercase', letterSpacing: '.08em', color: '#6b7280', padding: '8px 10px', borderBottom: '1px solid #e5e7eb', whiteSpace: 'nowrap' }
  const td: React.CSSProperties = { padding: '9px 10px', borderBottom: '1px solid #f1f2f4', fontSize: 13.5, whiteSpace: 'nowrap' }
  const kpi = (l: string, v: string, s?: string) => <div style={box}><div style={{ color: '#6b7280', fontSize: 12, textTransform: 'uppercase', letterSpacing: '.08em' }}>{l}</div><div style={{ fontSize: 28, fontWeight: 800, margin: '6px 0 2px' }}>{v}</div>{s && <div style={{ color: '#6b7280', fontSize: 12.5 }}>{s}</div>}</div>
  const pill = (t: string, on: boolean) => <span style={{ padding: '2px 8px', borderRadius: 999, fontSize: 12, fontWeight: 700, background: on ? '#ecfccb' : '#f3f4f6', color: on ? '#3f6212' : '#6b7280' }}>{t}</span>

  return (
    <div style={{ maxWidth: 1240, margin: '0 auto', padding: '8px 0 70px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 18 }}>
        <div><h1 style={{ margin: 0, fontSize: 26 }}>Book customers &amp; emails</h1><div style={{ color: '#6b7280', fontSize: 13.5 }}>Expertise to Income: buyers, Chapter 1 leads, downloads and the 5-email campaign</div></div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <a href="/admin/funnel" style={{ fontSize: 13.5, color: '#1d4ed8', marginRight: 8 }}>Conversion funnel</a>
          {[30, 90, 365].map((n) => <button key={n} onClick={() => setDays(n)} style={{ padding: '8px 14px', borderRadius: 10, border: '1px solid #d1d5db', background: days === n ? '#111827' : '#fff', color: days === n ? '#fff' : '#111827', cursor: 'pointer', fontWeight: 700 }}>{n}d</button>)}
        </div>
      </div>
      {err && <div style={{ ...box, borderColor: '#fca5a5', color: '#991b1b' }}>{err}</div>}
      {!d && !err && <div style={box}>Loading…</div>}
      {d && (<div style={{ display: 'grid', gap: 14 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(190px,1fr))', gap: 12 }}>
          {kpi('Buyers', String(d.kpis.buyers), `${usd(d.kpis.revenue)} revenue`)}
          {kpi('Book downloads', String(d.kpis.bookDownloads), `${d.kpis.buyersWhoDownloaded} of ${d.kpis.buyers} buyers downloaded`)}
          {kpi('Chapter 1 leads', String(d.kpis.leads), `${d.kpis.unsubscribedLeads} unsubscribed`)}
          {kpi('Chapter 1 downloads', String(d.kpis.chapter1Downloads), `${d.kpis.chapter1Downloaders} identified people`)}
          {kpi('Lead to buyer', pct(d.kpis.leadsWhoBought, d.kpis.leads), `${d.kpis.leadsWhoBought} leads bought`)}
          {kpi('Emails sent', String(d.kpis.emailsSent), d.notes.opensTracked ? 'open/click tracking on' : 'open/click data not received yet')}
        </div>

        <div style={box}>
          <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 4 }}>Email performance</div>
          <div style={{ color: '#6b7280', fontSize: 12.5, marginBottom: 10 }}>Opens and clicks fill in from Resend webhook events; blank means the provider has not reported them.</div>
          <div style={{ overflowX: 'auto' }}><table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 640 }}>
            <thead><tr>{['Email', 'Sent', 'Opened', 'Clicked', 'Bounced', 'Complaints'].map((h) => <th key={h} style={th}>{h}</th>)}</tr></thead>
            <tbody>{d.emails.map((e) => <tr key={e.key}><td style={{ ...td, fontWeight: 700 }}>{e.label}</td><td style={td}>{e.sent}</td><td style={td}>{e.opened} <span style={{ color: '#6b7280' }}>({pct(e.opened, e.sent)})</span></td><td style={td}>{e.clicked} <span style={{ color: '#6b7280' }}>({pct(e.clicked, e.sent)})</span></td><td style={td}>{e.bounced}</td><td style={td}>{e.complained}</td></tr>)}</tbody>
          </table></div>
        </div>

        <div style={box}>
          <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 10 }}>Buyers</div>
          <div style={{ overflowX: 'auto' }}><table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 860 }}>
            <thead><tr>{['Buyer', 'Paid', 'Date', 'Book emailed', 'Opened', 'Downloads', 'Last download'].map((h) => <th key={h} style={th}>{h}</th>)}</tr></thead>
            <tbody>{d.buyers.length === 0 && <tr><td style={td} colSpan={7}>No purchases yet</td></tr>}{d.buyers.map((b, i) => <tr key={b.email + i}><td style={td}><strong>{b.name || b.email}</strong>{b.name && <div style={{ color: '#6b7280', fontSize: 12 }}>{b.email}</div>}</td><td style={td}>{usd(b.amount)} {b.bundle && pill('bundle', true)}</td><td style={td}>{when(b.at)}</td><td style={td}>{pill(b.emailed ? when(b.emailedAt) : 'not sent', b.emailed)}</td><td style={td}>{pill(b.opened ? 'yes' : 'no', b.opened)}</td><td style={td}><strong>{b.downloads}</strong></td><td style={td}>{when(b.lastDownload)}</td></tr>)}</tbody>
          </table></div>
        </div>

        <div style={box}>
          <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 10 }}>Chapter 1 leads</div>
          <div style={{ overflowX: 'auto' }}><table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 860 }}>
            <thead><tr>{['Email', 'Signed up', 'Ch.1 downloads', 'Campaign sent', 'Last email', 'Campaign opens', 'Status'].map((h) => <th key={h} style={th}>{h}</th>)}</tr></thead>
            <tbody>{d.leads.length === 0 && <tr><td style={td} colSpan={7}>No leads yet</td></tr>}{d.leads.map((l) => <tr key={l.email}><td style={{ ...td, fontWeight: 700 }}>{l.email}</td><td style={td}>{when(l.at)}</td><td style={td}>{l.downloads}</td><td style={td}>{l.campaignSent} / 5</td><td style={td}>{l.lastStep ? `Campaign ${l.lastStep}` : '-'}</td><td style={td}>{l.campaignOpened}</td><td style={td}>{l.bought ? pill('bought', true) : l.unsubscribed ? pill('unsubscribed', false) : l.bounced ? pill('bounced', false) : pill('in campaign', true)}</td></tr>)}</tbody>
          </table></div>
        </div>

        <div style={box}>
          <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 10 }}>Downloads per day</div>
          {d.downloadsByDay.length === 0 ? <div style={{ color: '#6b7280' }}>No downloads yet</div> : d.downloadsByDay.slice(-30).map((x) => <div key={x.date} style={{ display: 'flex', gap: 12, padding: '4px 0', fontSize: 13.5 }}><span style={{ width: 90 }}>{x.date}</span><span style={{ width: 150 }}>Chapter 1: <strong>{x.chapter1}</strong></span><span>Full book: <strong>{x.book}</strong></span></div>)}
        </div>

        <div style={box}>
          <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 4 }}>Preview and test the emails</div>
          <div style={{ color: '#6b7280', fontSize: 12.5, marginBottom: 12 }}>Preview opens the design. Send test goes only to your own admin email.</div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
            <select value={tpl} onChange={(e) => setTpl(e.target.value)} style={{ padding: '9px 12px', borderRadius: 10, border: '1px solid #d1d5db' }}>{TPL.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select>
            <a href={`/api/admin/book/preview?t=${tpl}`} target="_blank" rel="noopener" style={{ padding: '9px 16px', borderRadius: 10, border: '1px solid #d1d5db', textDecoration: 'none', color: '#111827', fontWeight: 700 }}>Preview</a>
            <button onClick={sendTest} style={{ padding: '9px 16px', borderRadius: 10, border: 0, background: '#111827', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>Send test to me</button>
            {msg && <span style={{ color: '#6b7280', fontSize: 13.5 }}>{msg}</span>}
          </div>
        </div>
      </div>)}
    </div>
  )
}
