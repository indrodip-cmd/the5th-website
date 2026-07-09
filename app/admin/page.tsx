'use client'

import { useState, useEffect, useCallback } from 'react'

/* ─── Types ─── */
interface Lead {
  id: string
  email: string
  name: string
  answers: Record<string, string | string[]>
  roadmap: {
    days?: Array<{ day: number; title: string; tasks: string[] }>
    summary?: string
    biggest_opportunity?: string
    first_action?: string
  } | null
  current_day: number
  streak: number
  revenue_logged: number
  last_visit: string | null
  created_at: string
}

interface PerPage { path: string; views: number; visitors: number; avg_scroll: number }
interface DayPoint { day: string; views: number; visitors: number }
interface Referrer { referrer: string; views: number }
interface Device { device: string; pageviews: number; visitors: number }
interface Stats {
  range_days: number
  since: string
  totals: { pageviews: number; unique_visitors: number; sessions: number }
  per_page: PerPage[]
  devices: Device[]
  timeseries: DayPoint[]
  referrers: Referrer[]
  conversions: number
  leads: number
  leads_total: number
}

const DEVICE_META: Record<string, { label: string; color: string; icon: string }> = {
  desktop: { label: 'Desktop', color: '#225840', icon: '🖥️' },
  mobile:  { label: 'Mobile',  color: '#2d6a4f', icon: '📱' },
  tablet:  { label: 'Tablet',  color: '#b8960c', icon: '📲' },
  unknown: { label: 'Unknown', color: '#9ca3af', icon: '❔' },
}

/* ─── Question labels ─── */
const Q_LABELS: Record<string, string> = {
  q1: 'Business Stage', q2: 'Ideal Client', q3: 'Client Age Range',
  q4: 'Client Pain', q5: 'Zone of Genius', q6: 'Transformation Story',
  q7: 'Client Transformation', q8: 'Delivery Method', q9: 'Program Length',
  q10: 'Price Confidence (1–5)', q11: 'Pricing Block', q12: 'Content Consistency',
  q13: 'Content Formats', q14: 'Content Block', q15: 'Sales Relationship',
  q16: 'Biggest Fear', q17: 'Support Needed', q18: 'Revenue Goal',
  q19: 'Weekly Hours', q20: 'Urgency Level (1–5)', qgoal: 'Biggest Goal',
  from: 'From State', to: 'To State',
}

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  New:    { bg: '#f3f4f6', color: '#6b7280' },
  Active: { bg: '#dcfce7', color: '#16a34a' },
  Cold:   { bg: '#fef3c7', color: '#d97706' },
}

/* ─── Friendly page names ─── */
function pageName(path: string): string {
  const map: Record<string, string> = {
    '/': 'Home', '/ai': 'AI Landing', '/about': 'About', '/call': 'Book a Call',
    '/fast-forward': 'Fast Forward', '/collective': 'Collective', '/quiz': 'Quiz',
    '/quiz/thank-you': 'Quiz · Thank You', '/quiz/results': 'Quiz · Results',
    '/results': 'Results', '/privacy': 'Privacy', '/terms': 'Terms',
    '/refund': 'Refund', '/disclaimer': 'Disclaimer', '/data': 'Data', '/admin': 'Admin',
  }
  return map[path] || path
}

/* ─── Helpers ─── */
function getStatus(lead: Lead): 'New' | 'Active' | 'Cold' {
  if (!lead.last_visit && (lead.current_day || 1) <= 1) return 'New'
  if (lead.last_visit && new Date(lead.last_visit) > new Date(Date.now() - 7 * 86400000)) return 'Active'
  return 'Cold'
}
function fmtDate(iso: string | null | undefined): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}
function pctStr(n: number): string {
  if (!Number.isFinite(n)) return '0%'
  return (Math.round(n * 10) / 10).toString() + '%'
}

/* ─── useCountUp ─── */
function useCountUp(target: number, duration = 900) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    if (!target) { setVal(0); return }
    let curr = 0
    const step = target / (duration / 16)
    const timer = setInterval(() => {
      curr += step
      if (curr >= target) { setVal(target); clearInterval(timer) }
      else setVal(Math.floor(curr))
    }, 16)
    return () => clearInterval(timer)
  }, [target, duration])
  return val
}

/* ─── CSS ─── */
const ADMIN_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: 'Inter', system-ui, sans-serif; -webkit-font-smoothing: antialiased; }
@keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
.skeleton { background: linear-gradient(90deg,#f0f0f0 25%,#e8e8e8 50%,#f0f0f0 75%); background-size:200% 100%; animation: shimmer 1.5s infinite; border-radius: 6px; }
@keyframes slideInPanel { from { transform: translateX(100%); } to { transform: translateX(0); } }
.detail-panel { animation: slideInPanel 0.22s cubic-bezier(0.25,0.46,0.45,0.94) both; }
.admin-row:hover td { background: #f0fdf4 !important; }
.admin-row td { transition: background 0.12s ease; }
.bar-col { transition: height 0.4s cubic-bezier(0.25,0.46,0.45,0.94); }
::-webkit-scrollbar { width: 6px; height: 6px; }
::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 3px; }
.admin-btn { padding: 12px 20px; background: linear-gradient(135deg, #225840, #2d6a4f); border: none; border-radius: 6px; color: #fff; font-size: 14px; font-weight: 600; cursor: pointer; font-family: inherit; text-align: center; text-decoration: none; display: block; width: 100%; transition: opacity 0.15s ease; }
.admin-btn:hover { opacity: 0.9; }
.admin-btn:disabled { background: #d1d5db; cursor: not-allowed; opacity: 1; }
.tab-btn { padding: 9px 18px; border-radius: 8px; border: none; font-size: 14px; font-weight: 600; cursor: pointer; font-family: inherit; transition: all 0.15s; }
`

/* ─── StatCard ─── */
function StatCard({ label, value, prefix = '', suffix = '', hint, accent }: { label: string; value: number; prefix?: string; suffix?: string; hint?: string; accent?: boolean }) {
  const displayed = useCountUp(value)
  return (
    <div style={{ background: accent ? 'linear-gradient(135deg,#0a1a0f,#225840)' : '#fff', borderRadius: 14, padding: '22px 26px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid #f0f0f0', flex: 1, minWidth: 180 }}>
      <div style={{ fontSize: 34, fontWeight: 800, color: accent ? '#fff' : '#0a1a0f', lineHeight: 1 }}>
        {prefix}{displayed.toLocaleString()}{suffix}
      </div>
      <div style={{ fontSize: 13, color: accent ? 'rgba(255,255,255,0.7)' : '#6b7280', marginTop: 8, fontWeight: 500 }}>{label}</div>
      {hint && <div style={{ fontSize: 11, color: accent ? 'rgba(255,255,255,0.5)' : '#9ca3af', marginTop: 4 }}>{hint}</div>}
    </div>
  )
}

/* ─── AnalyticsDashboard ─── */
function AnalyticsDashboard({ stats, loading, days, onDays }: { stats: Stats | null; loading: boolean; days: number; onDays: (d: number) => void }) {
  const sectionCard: React.CSSProperties = { background: '#fff', borderRadius: 14, padding: '24px 26px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid #f0f0f0' }
  const sectionLabel: React.CSSProperties = { fontSize: 12, fontWeight: 700, letterSpacing: '.06em', color: '#225840', textTransform: 'uppercase', marginBottom: 18 }

  const visitors = stats?.totals.unique_visitors || 0
  const pageviews = stats?.totals.pageviews || 0
  const leads = stats?.leads || 0
  const convRate = visitors ? (leads / visitors) * 100 : 0

  const quizViews = stats?.per_page.find(p => p.path === '/quiz')?.views || 0
  const quizVisitors = stats?.per_page.find(p => p.path === '/quiz')?.visitors || 0
  const quizConv = quizVisitors ? (leads / quizVisitors) * 100 : 0

  const maxTs = Math.max(1, ...(stats?.timeseries || []).map(t => t.views))
  const maxPageViews = Math.max(1, ...(stats?.per_page || []).map(p => p.views))

  if (loading && !stats) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton" style={{ height: 108, flex: 1, minWidth: 180 }} />)}
        </div>
        <div className="skeleton" style={{ height: 240 }} />
        <div className="skeleton" style={{ height: 320 }} />
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Range selector */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <span style={{ fontSize: 13, color: '#6b7280', marginRight: 4 }}>Showing last</span>
        {[7, 30, 90].map(d => (
          <button
            key={d}
            onClick={() => onDays(d)}
            className="tab-btn"
            style={{ padding: '6px 14px', background: days === d ? '#225840' : '#fff', color: days === d ? '#fff' : '#6b7280', border: '1px solid ' + (days === d ? '#225840' : '#e0e0e0') }}
          >
            {d} days
          </button>
        ))}
      </div>

      {/* Headline stats */}
      <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
        <StatCard label="Unique Visitors" value={visitors} />
        <StatCard label="Page Views" value={pageviews} hint={`${stats?.totals.sessions || 0} sessions`} />
        <StatCard label="Leads Captured" value={leads} hint={`${stats?.leads_total || 0} all-time`} />
        <StatCard label="Visitor → Lead" value={Math.round(convRate * 10) / 10} suffix="%" hint={`${leads} of ${visitors} visitors`} />
        <StatCard label="Quiz Conversion" value={Math.round(quizConv * 10) / 10} suffix="%" accent hint={`${leads} of ${quizVisitors} quiz visitors`} />
      </div>

      {/* Traffic over time */}
      <div style={sectionCard}>
        <div style={sectionLabel}>Traffic Over Time</div>
        {(!stats || stats.timeseries.length === 0) ? (
          <EmptyHint />
        ) : (
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 160, paddingTop: 10 }}>
            {stats.timeseries.map((t) => (
              <div key={t.day} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, minWidth: 0 }}>
                <div style={{ width: '100%', display: 'flex', alignItems: 'flex-end', height: 130 }} title={`${t.day}: ${t.views} views, ${t.visitors} visitors`}>
                  <div className="bar-col" style={{ width: '100%', height: `${(t.views / maxTs) * 100}%`, minHeight: 2, background: 'linear-gradient(180deg,#2d6a4f,#225840)', borderRadius: '4px 4px 0 0' }} />
                </div>
                <div style={{ fontSize: 9, color: '#9ca3af', whiteSpace: 'nowrap' }}>
                  {new Date(t.day).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quiz funnel */}
      <div style={sectionCard}>
        <div style={sectionLabel}>Quiz Conversion Funnel</div>
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'stretch' }}>
          <FunnelStep label="Total Visitors" value={visitors} sub="all pages" />
          <FunnelArrow pct={visitors ? (quizVisitors / visitors) * 100 : 0} />
          <FunnelStep label="Reached Quiz" value={quizVisitors} sub={`${quizViews} views`} />
          <FunnelArrow pct={quizConv} />
          <FunnelStep label="Completed (Leads)" value={leads} sub={pctStr(Math.round(quizConv * 10) / 10) + ' of quiz'} highlight />
        </div>
      </div>

      {/* Devices */}
      <div style={sectionCard}>
        <div style={sectionLabel}>Devices — Mobile vs Desktop</div>
        {(!stats || stats.devices.length === 0) ? (
          <EmptyHint />
        ) : (
          <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'stretch' }}>
            {/* Donut-style share bar */}
            <div style={{ flex: '1 1 320px', minWidth: 280 }}>
              <div style={{ display: 'flex', height: 16, borderRadius: 8, overflow: 'hidden', marginBottom: 18 }}>
                {stats.devices.map(d => {
                  const total = stats.devices.reduce((s, x) => s + x.pageviews, 0) || 1
                  const meta = DEVICE_META[d.device] || DEVICE_META.unknown
                  return <div key={d.device} title={`${meta.label}: ${d.pageviews} views`} style={{ width: `${(d.pageviews / total) * 100}%`, background: meta.color }} />
                })}
              </div>
              {stats.devices.map(d => {
                const totalP = stats.devices.reduce((s, x) => s + x.pageviews, 0) || 1
                const meta = DEVICE_META[d.device] || DEVICE_META.unknown
                const share = (d.pageviews / totalP) * 100
                return (
                  <div key={d.device} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: meta.color, flexShrink: 0 }} />
                    <div style={{ width: 74, fontSize: 14, fontWeight: 600, color: '#0a0a0a' }}>{meta.icon} {meta.label}</div>
                    <div style={{ flex: 1, background: '#f0f0f0', borderRadius: 4, height: 8, overflow: 'hidden' }}>
                      <div style={{ width: `${share}%`, height: '100%', background: meta.color, borderRadius: 4 }} />
                    </div>
                    <div style={{ width: 48, textAlign: 'right', fontSize: 14, fontWeight: 700, color: meta.color, fontVariantNumeric: 'tabular-nums' }}>{pctStr(Math.round(share * 10) / 10)}</div>
                    <div style={{ width: 140, textAlign: 'right', fontSize: 12, color: '#9ca3af', fontVariantNumeric: 'tabular-nums' }}>
                      {d.pageviews.toLocaleString()} views · {d.visitors.toLocaleString()} {d.visitors === 1 ? 'visitor' : 'visitors'}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* Per-page table */}
      <div style={sectionCard}>
        <div style={sectionLabel}>Pages — Views, Visitors & Scroll Depth</div>
        {(!stats || stats.per_page.length === 0) ? (
          <EmptyHint />
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #f0f0f0' }}>
                  {['Page', 'Views', 'Visitors', 'Avg Scroll', ''].map((c, i) => (
                    <th key={c || i} style={{ padding: '10px 12px', textAlign: i === 0 || i === 4 ? 'left' : 'right', fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '.06em', whiteSpace: 'nowrap', width: i === 4 ? '26%' : undefined }}>
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {stats.per_page.map((p) => (
                  <tr key={p.path} style={{ borderBottom: '1px solid #f5f5f5' }}>
                    <td style={{ padding: '11px 12px' }}>
                      <div style={{ fontWeight: 600, color: '#0a0a0a' }}>{pageName(p.path)}</div>
                      <div style={{ fontSize: 11, color: '#9ca3af' }}>{p.path}</div>
                    </td>
                    <td style={{ padding: '11px 12px', textAlign: 'right', fontWeight: 700, color: '#225840', fontVariantNumeric: 'tabular-nums' }}>{p.views.toLocaleString()}</td>
                    <td style={{ padding: '11px 12px', textAlign: 'right', color: '#374151', fontVariantNumeric: 'tabular-nums' }}>{p.visitors.toLocaleString()}</td>
                    <td style={{ padding: '11px 12px', textAlign: 'right', color: '#374151', fontVariantNumeric: 'tabular-nums' }}>{p.avg_scroll}%</td>
                    <td style={{ padding: '11px 12px' }}>
                      <div style={{ background: '#f0f0f0', borderRadius: 4, height: 8, overflow: 'hidden' }}>
                        <div style={{ width: `${(p.views / maxPageViews) * 100}%`, height: '100%', background: 'linear-gradient(90deg,#2d6a4f,#225840)', borderRadius: 4 }} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Referrers */}
      <div style={sectionCard}>
        <div style={sectionLabel}>Top Referrers</div>
        {(!stats || stats.referrers.length === 0) ? (
          <EmptyHint />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {stats.referrers.map((r) => (
              <div key={r.referrer} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 14 }}>
                <span style={{ color: '#374151', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '78%' }}>{r.referrer}</span>
                <span style={{ fontWeight: 700, color: '#225840', fontVariantNumeric: 'tabular-nums' }}>{r.views.toLocaleString()}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function EmptyHint() {
  return (
    <div style={{ padding: '32px 12px', textAlign: 'center', color: '#9ca3af', fontSize: 14 }}>
      No data yet in this range. Stats appear as visitors browse the site.
    </div>
  )
}

function FunnelStep({ label, value, sub, highlight }: { label: string; value: number; sub?: string; highlight?: boolean }) {
  return (
    <div style={{ flex: 1, minWidth: 130, background: highlight ? 'linear-gradient(135deg,#225840,#2d6a4f)' : '#f9fafb', borderRadius: 12, padding: '18px 20px', border: '1px solid ' + (highlight ? 'transparent' : '#f0f0f0') }}>
      <div style={{ fontSize: 30, fontWeight: 800, color: highlight ? '#fff' : '#0a1a0f', lineHeight: 1 }}>{value.toLocaleString()}</div>
      <div style={{ fontSize: 12, fontWeight: 600, color: highlight ? 'rgba(255,255,255,0.9)' : '#374151', marginTop: 8 }}>{label}</div>
      {sub && <div style={{ fontSize: 11, color: highlight ? 'rgba(255,255,255,0.6)' : '#9ca3af', marginTop: 2 }}>{sub}</div>}
    </div>
  )
}
function FunnelArrow({ pct }: { pct: number }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minWidth: 44 }}>
      <div style={{ fontSize: 20, color: '#d1d5db' }}>→</div>
      <div style={{ fontSize: 11, fontWeight: 700, color: '#225840' }}>{pctStr(Math.round(pct * 10) / 10)}</div>
    </div>
  )
}

/* ─── DetailPanel ─── */
function DetailPanel({ lead, onClose }: { lead: Lead; onClose: () => void }) {
  const curDay = lead.current_day || 1

  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(lead, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `lead-${lead.email}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const sectionLabel: React.CSSProperties = { fontSize: 11, fontWeight: 700, letterSpacing: '.1em', color: '#225840', textTransform: 'uppercase', marginBottom: 14 }
  const divider: React.CSSProperties = { height: 1, background: '#f0f0f0', margin: '24px 0' }

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.15)', zIndex: 200 }} />
      <div className="detail-panel" style={{ position: 'fixed', right: 0, top: 0, bottom: 0, width: 500, maxWidth: '92vw', background: '#fff', boxShadow: '-4px 0 28px rgba(0,0,0,0.12)', zIndex: 300, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '28px 28px 20px', borderBottom: '1px solid #f0f0f0', position: 'sticky', top: 0, background: '#fff', zIndex: 1 }}>
          <button onClick={onClose} style={{ position: 'absolute', top: 18, right: 20, background: 'none', border: 'none', fontSize: 26, color: '#9ca3af', cursor: 'pointer', lineHeight: 1 }}>×</button>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#0a0a0a', paddingRight: 40 }}>{lead.name}</div>
          <div style={{ fontSize: 14, color: '#6b7280', marginTop: 3 }}>{lead.email}</div>
          <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 4 }}>Signed up {fmtDate(lead.created_at)}</div>
        </div>

        <div style={{ padding: '24px 28px 48px', flex: 1 }}>
          <div style={sectionLabel}>Quiz Answers</div>
          {Object.keys(lead.answers || {}).length === 0 ? (
            <p style={{ fontSize: 13, color: '#9ca3af' }}>No answers recorded</p>
          ) : (
            Object.entries(lead.answers || {}).map(([key, val], i, arr) => (
              <div key={key} style={{ borderBottom: i < arr.length - 1 ? '1px solid #f5f5f5' : 'none', paddingBottom: 10, marginBottom: 10 }}>
                <div style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 2 }}>{Q_LABELS[key] ?? key}</div>
                <div style={{ fontSize: 14, color: '#0a0a0a', lineHeight: 1.5 }}>{Array.isArray(val) ? val.join(', ') : String(val)}</div>
              </div>
            ))
          )}

          <div style={divider} />

          {lead.roadmap && (
            <>
              <div style={sectionLabel}>AI Roadmap</div>
              {[
                { label: 'Summary', val: lead.roadmap.summary, color: '#374151' },
                { label: 'Biggest Opportunity', val: lead.roadmap.biggest_opportunity, color: '#374151' },
                { label: 'First Action', val: lead.roadmap.first_action, color: '#225840' },
              ].map(({ label, val, color }) => (
                <div key={label} style={{ marginBottom: 14 }}>
                  <div style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 3 }}>{label}</div>
                  <div style={{ fontSize: 14, color, lineHeight: 1.6, fontWeight: label === 'First Action' ? 600 : 400 }}>{val || '—'}</div>
                </div>
              ))}
              <div style={divider} />
            </>
          )}

          <div style={sectionLabel}>15-Day Progress</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
            {Array.from({ length: 15 }, (_, i) => i + 1).map(d => {
              const done = d < curDay
              const cur = d === curDay
              return (
                <div key={d} title={`Day ${d}`} style={{ width: 30, height: 30, borderRadius: '50%', background: done ? '#225840' : cur ? '#b8960c' : 'transparent', border: `2px solid ${done ? '#225840' : cur ? '#b8960c' : '#d1d5db'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: done || cur ? '#fff' : '#d1d5db' }}>{d}</div>
              )
            })}
          </div>
          <div style={{ fontSize: 12, color: '#6b7280' }}>Day {curDay} of 15</div>

          <div style={divider} />

          <div style={sectionLabel}>Stats</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {[
              { label: 'Streak 🔥', value: `${lead.streak || 0} days` },
              { label: 'Revenue Logged', value: `$${(lead.revenue_logged || 0).toLocaleString()}` },
              { label: 'Last Visit', value: fmtDate(lead.last_visit) },
              { label: 'Status', value: getStatus(lead) },
            ].map(({ label, value }) => (
              <div key={label} style={{ background: '#f9f9f9', borderRadius: 8, padding: '12px 14px' }}>
                <div style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 4 }}>{label}</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#0a0a0a' }}>{value}</div>
              </div>
            ))}
          </div>

          <div style={divider} />

          <div style={sectionLabel}>Actions</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <a href={`mailto:${lead.email}`} className="admin-btn">Send Email →</a>
            <button className="admin-btn" onClick={exportJSON}>Export Data (JSON)</button>
          </div>
        </div>
      </div>
    </>
  )
}

/* ─── LoginScreen (OTP) ─── */
function LoginScreen({ onLogin }: { onLogin: (email: string) => void }) {
  const [step, setStep] = useState<'email' | 'code'>('email')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const sendCode = useCallback(async () => {
    setError(''); setBusy(true)
    try {
      const res = await fetch('/api/admin/send-otp', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const d = (await res.json().catch(() => ({}))) as { success?: boolean; error?: string }
      if (!res.ok) { setError(d.error || 'Something went wrong.'); return }
      setStep('code')
    } catch { setError('Network error. Please try again.') } finally { setBusy(false) }
  }, [email])

  const verify = useCallback(async () => {
    setError(''); setBusy(true)
    try {
      const res = await fetch('/api/admin/verify-otp', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      })
      const d = (await res.json().catch(() => ({}))) as { success?: boolean; email?: string; error?: string }
      if (!res.ok || !d.success) { setError(d.error || 'Invalid code.'); return }
      onLogin(d.email || email)
    } catch { setError('Network error. Please try again.') } finally { setBusy(false) }
  }, [email, otp, onLogin])

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '14px 16px', border: `2px solid ${error ? '#ef4444' : '#e0e0e0'}`,
    borderRadius: 8, fontSize: 16, fontFamily: 'inherit', outline: 'none', marginBottom: 14,
    color: '#0a0a0a', background: '#fff',
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0a1a0f', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <style>{ADMIN_CSS}</style>
      <h1 style={{ fontSize: 26, fontWeight: 800, color: '#fff', marginBottom: 24, letterSpacing: '-0.5px' }}>The5th Command Center</h1>

      <div style={{ background: '#fff', borderRadius: 16, padding: 44, maxWidth: 420, width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 30, justifyContent: 'center' }}>
          <span style={{ fontSize: 20, fontWeight: 800, color: '#0a1a0f' }}>The<span style={{ color: '#2d6a4f' }}>5th</span></span>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#225840', letterSpacing: '.08em', textTransform: 'uppercase' }}>Admin</span>
        </div>

        {step === 'email' ? (
          <>
            <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 8 }}>Admin email</label>
            <input
              type="email" placeholder="you@10kroadmap.org" value={email} autoFocus
              onChange={e => { setEmail(e.target.value); setError('') }}
              onKeyDown={e => e.key === 'Enter' && email && !busy && sendCode()}
              style={inputStyle}
            />
            {error && <p style={{ fontSize: 13, color: '#ef4444', marginTop: -6, marginBottom: 14 }}>{error}</p>}
            <button className="admin-btn" onClick={sendCode} disabled={busy || !email} style={{ padding: 16, fontSize: 16 }}>
              {busy ? 'Sending…' : 'Send me a code →'}
            </button>
            <p style={{ fontSize: 12, color: '#9ca3af', textAlign: 'center', marginTop: 16, lineHeight: 1.6 }}>
              A 6-digit code will be emailed to authorised admins only.
            </p>
          </>
        ) : (
          <>
            <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 8 }}>Enter the code sent to {email}</label>
            <input
              type="text" inputMode="numeric" maxLength={6} placeholder="••••••" value={otp} autoFocus
              onChange={e => { setOtp(e.target.value.replace(/\D/g, '').slice(0, 6)); setError('') }}
              onKeyDown={e => e.key === 'Enter' && otp.length === 6 && !busy && verify()}
              style={{ ...inputStyle, letterSpacing: 8, textAlign: 'center', fontSize: 24, fontFamily: 'monospace' }}
            />
            {error && <p style={{ fontSize: 13, color: '#ef4444', marginTop: -6, marginBottom: 14 }}>{error}</p>}
            <button className="admin-btn" onClick={verify} disabled={busy || otp.length !== 6} style={{ padding: 16, fontSize: 16 }}>
              {busy ? 'Verifying…' : 'Verify & sign in →'}
            </button>
            <button
              onClick={() => { setStep('email'); setOtp(''); setError('') }}
              style={{ width: '100%', marginTop: 12, background: 'none', border: 'none', color: '#6b7280', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}
            >
              ← Use a different email / resend
            </button>
          </>
        )}
      </div>
    </div>
  )
}

/* ─── AdminPage ─── */
export default function AdminPage() {
  const [ready, setReady] = useState(false)
  const [authed, setAuthed] = useState(false)
  const [tab, setTab] = useState<'overview' | 'leads'>('overview')

  const [stats, setStats] = useState<Stats | null>(null)
  const [statsLoading, setStatsLoading] = useState(false)
  const [days, setDays] = useState(30)

  const [leads, setLeads] = useState<Lead[]>([])
  const [leadsLoading, setLeadsLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)

  /* Server-side auth check on mount (httpOnly admin cookie). */
  useEffect(() => {
    fetch('/api/admin/me')
      .then(r => setAuthed(r.ok))
      .catch(() => setAuthed(false))
      .finally(() => setReady(true))
  }, [])

  const loadStats = useCallback((d: number) => {
    setStatsLoading(true)
    fetch(`/api/admin/stats?days=${d}`)
      .then(r => r.ok ? r.json() : Promise.reject(new Error('stats')))
      .then((res: { stats?: Stats }) => setStats(res.stats ?? null))
      .catch(() => {})
      .finally(() => setStatsLoading(false))
  }, [])

  const loadLeads = useCallback(() => {
    setLeadsLoading(true)
    fetch('/api/quiz-leads')
      .then(r => r.ok ? r.json() : Promise.reject(new Error('leads')))
      .then((d: { leads?: Lead[] }) => setLeads(d.leads ?? []))
      .catch(() => setLeads([]))
      .finally(() => setLeadsLoading(false))
  }, [])

  useEffect(() => { if (authed) { loadStats(days); loadLeads() } }, [authed]) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (authed) loadStats(days) }, [days]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!ready) return <div style={{ minHeight: '100vh', background: '#0a1a0f' }} />
  if (!authed) return <LoginScreen onLogin={() => setAuthed(true)} />

  const handleLogout = async () => {
    try { await fetch('/api/admin/logout', { method: 'POST' }) } catch {}
    setAuthed(false); setStats(null); setLeads([]); setSelectedLead(null)
  }

  const q = search.toLowerCase()
  const filtered = q ? leads.filter(l => (l.name || '').toLowerCase().includes(q) || l.email.toLowerCase().includes(q)) : leads

  const exportCSV = () => {
    const header = 'Name,Email,Signed Up,Day,Streak,Revenue,Answers Summary'
    const rows = leads.map(l => [
      `"${(l.name || '').replace(/"/g, '""')}"`, `"${l.email}"`, `"${fmtDate(l.created_at)}"`,
      l.current_day || 1, l.streak || 0, l.revenue_logged || 0,
      `"${JSON.stringify(l.answers || {}).replace(/"/g, '""')}"`,
    ].join(','))
    const csv = [header, ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'quiz-leads.csv'; a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f4f5f4' }}>
      <style>{ADMIN_CSS}</style>

      {/* Header */}
      <header style={{ background: '#0a1a0f', minHeight: 60, padding: '10px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ fontSize: 18, fontWeight: 800, color: '#fff' }}>The<span style={{ color: '#2d6a4f' }}>5th</span></span>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.55)', letterSpacing: '.04em' }}>Command Center</span>
        </div>
        <div style={{ display: 'flex', gap: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 10, padding: 4 }}>
          {(['overview', 'leads'] as const).map(t => (
            <button
              key={t} onClick={() => setTab(t)} className="tab-btn"
              style={{ background: tab === t ? '#2d6a4f' : 'transparent', color: tab === t ? '#fff' : 'rgba(255,255,255,0.6)' }}
            >
              {t === 'overview' ? 'Analytics' : 'Leads'}
            </button>
          ))}
        </div>
        <button onClick={handleLogout} style={{ padding: '8px 18px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 6, color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
          Logout
        </button>
      </header>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }}>
        {tab === 'overview' ? (
          <AnalyticsDashboard stats={stats} loading={statsLoading} days={days} onDays={setDays} />
        ) : (
          <>
            <div style={{ display: 'flex', gap: 20, marginBottom: 28, flexWrap: 'wrap' }}>
              <StatCard label="Total Leads" value={leads.length} />
              <StatCard label="New This Week" value={leads.filter(l => l.created_at && new Date(l.created_at) > new Date(Date.now() - 7 * 86400000)).length} />
              <StatCard label="Avg Day Progress" value={leads.length ? Math.round(leads.reduce((s, l) => s + (l.current_day || 1), 0) / leads.length) : 0} />
              <StatCard label="Total Revenue Logged" value={Math.round(leads.reduce((s, l) => s + (l.revenue_logged || 0), 0))} prefix="$" />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, gap: 14, flexWrap: 'wrap' }}>
              <input
                type="text" placeholder="Search by name or email…" value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ padding: '10px 16px', border: '1.5px solid #e0e0e0', borderRadius: 8, fontSize: 14, fontFamily: 'inherit', outline: 'none', width: 300, background: '#fff', color: '#0a0a0a' }}
              />
              <button onClick={exportCSV} style={{ padding: '10px 22px', background: 'linear-gradient(135deg,#225840,#2d6a4f)', border: 'none', borderRadius: 6, color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Export CSV</button>
            </div>

            <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid #f0f0f0', overflow: 'hidden' }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                  <thead>
                    <tr style={{ background: '#0a1a0f' }}>
                      {['#', 'Name', 'Email', 'Signed Up', 'Day', 'Streak 🔥', 'Revenue $', 'Status', 'View'].map(col => (
                        <th key={col} style={{ padding: '13px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.65)', textTransform: 'uppercase', letterSpacing: '.07em', whiteSpace: 'nowrap' }}>{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {leadsLoading ? (
                      Array.from({ length: 6 }).map((_, i) => (
                        <tr key={i}>{[30, 100, 160, 80, 40, 40, 50, 60, 50].map((w, j) => (
                          <td key={j} style={{ padding: '14px 16px' }}><div className="skeleton" style={{ height: 14, width: w }} /></td>
                        ))}</tr>
                      ))
                    ) : filtered.length === 0 ? (
                      <tr><td colSpan={9} style={{ padding: '64px 24px', textAlign: 'center', color: '#9ca3af', fontSize: 15 }}>{leads.length === 0 ? 'No leads yet. Share your quiz to start collecting leads.' : 'No results match your search.'}</td></tr>
                    ) : (
                      filtered.map((lead, i) => {
                        const status = getStatus(lead)
                        const { bg, color } = STATUS_COLORS[status]
                        const rowBg = i % 2 === 0 ? '#fff' : '#f9f9f9'
                        return (
                          <tr key={lead.id} className="admin-row">
                            <td style={{ padding: '14px 16px', color: '#9ca3af', background: rowBg, fontVariantNumeric: 'tabular-nums' }}>{i + 1}</td>
                            <td style={{ padding: '14px 16px', fontWeight: 600, color: '#0a0a0a', background: rowBg, whiteSpace: 'nowrap' }}>{lead.name}</td>
                            <td style={{ padding: '14px 16px', color: '#6b7280', background: rowBg }}>{lead.email}</td>
                            <td style={{ padding: '14px 16px', color: '#6b7280', background: rowBg, whiteSpace: 'nowrap' }}>{fmtDate(lead.created_at)}</td>
                            <td style={{ padding: '14px 16px', color: '#0a0a0a', background: rowBg, whiteSpace: 'nowrap' }}>{lead.current_day || 1}/15</td>
                            <td style={{ padding: '14px 16px', color: '#0a0a0a', background: rowBg }}>{lead.streak || 0}</td>
                            <td style={{ padding: '14px 16px', color: '#225840', fontWeight: 600, background: rowBg }}>${(lead.revenue_logged || 0).toLocaleString()}</td>
                            <td style={{ padding: '14px 16px', background: rowBg }}><span style={{ padding: '3px 10px', borderRadius: 20, background: bg, color, fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap' }}>{status}</span></td>
                            <td style={{ padding: '14px 16px', background: rowBg }}><button onClick={() => setSelectedLead(lead)} style={{ padding: '6px 14px', background: 'linear-gradient(135deg,#225840,#2d6a4f)', border: 'none', borderRadius: 6, color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>View</button></td>
                          </tr>
                        )
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {!leadsLoading && leads.length > 0 && (
              <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 10, textAlign: 'right' }}>{filtered.length} of {leads.length} leads</p>
            )}
          </>
        )}
      </div>

      {selectedLead && <DetailPanel lead={selectedLead} onClose={() => setSelectedLead(null)} />}
    </div>
  )
}
