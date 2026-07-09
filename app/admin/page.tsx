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
interface Country { country: string; pageviews: number; visitors: number }
interface Stats {
  range_days: number
  since: string
  totals: { pageviews: number; unique_visitors: number; sessions: number }
  per_page: PerPage[]
  devices: Device[]
  countries: Country[]
  timeseries: DayPoint[]
  referrers: Referrer[]
  conversions: number
  leads: number
  leads_total: number
}

/* ISO 3166 alpha-2 → flag emoji (regional indicator symbols). */
function flagEmoji(code: string): string {
  if (!code || code.length !== 2 || !/^[A-Za-z]{2}$/.test(code)) return '🌐'
  const cc = code.toUpperCase()
  return String.fromCodePoint(...[...cc].map(c => 0x1f1e6 + c.charCodeAt(0) - 65))
}

let REGION_NAMES: Intl.DisplayNames | null = null
function countryName(code: string): string {
  if (!code || code === '??') return 'Unknown'
  try {
    if (!REGION_NAMES) REGION_NAMES = new Intl.DisplayNames(['en'], { type: 'region' })
    return REGION_NAMES.of(code.toUpperCase()) || code
  } catch { return code }
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

      {/* Countries / Geo */}
      <div style={sectionCard}>
        <div style={sectionLabel}>Top Countries</div>
        {(!stats || stats.countries.length === 0) ? (
          <EmptyHint />
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #f0f0f0' }}>
                  {['Country', 'Visitors', 'Views', 'Share', ''].map((c, i) => (
                    <th key={c || i} style={{ padding: '10px 12px', textAlign: i === 0 || i === 4 ? 'left' : 'right', fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '.06em', whiteSpace: 'nowrap', width: i === 4 ? '26%' : undefined }}>{c}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(() => {
                  const totalV = stats.countries.reduce((s, c) => s + c.visitors, 0) || 1
                  const maxV = Math.max(1, ...stats.countries.map(c => c.visitors))
                  return stats.countries.map((c) => {
                    const share = (c.visitors / totalV) * 100
                    return (
                      <tr key={c.country} style={{ borderBottom: '1px solid #f5f5f5' }}>
                        <td style={{ padding: '11px 12px', whiteSpace: 'nowrap' }}>
                          <span style={{ fontSize: 18, marginRight: 10 }}>{c.country === '??' ? '🌐' : flagEmoji(c.country)}</span>
                          <span style={{ fontWeight: 600, color: '#0a0a0a' }}>{countryName(c.country)}</span>
                          {c.country !== '??' && <span style={{ fontSize: 11, color: '#9ca3af', marginLeft: 6 }}>{c.country}</span>}
                        </td>
                        <td style={{ padding: '11px 12px', textAlign: 'right', fontWeight: 700, color: '#225840', fontVariantNumeric: 'tabular-nums' }}>{c.visitors.toLocaleString()}</td>
                        <td style={{ padding: '11px 12px', textAlign: 'right', color: '#374151', fontVariantNumeric: 'tabular-nums' }}>{c.pageviews.toLocaleString()}</td>
                        <td style={{ padding: '11px 12px', textAlign: 'right', color: '#374151', fontVariantNumeric: 'tabular-nums' }}>{pctStr(Math.round(share * 10) / 10)}</td>
                        <td style={{ padding: '11px 12px' }}>
                          <div style={{ background: '#f0f0f0', borderRadius: 4, height: 8, overflow: 'hidden' }}>
                            <div style={{ width: `${(c.visitors / maxV) * 100}%`, height: '100%', background: 'linear-gradient(90deg,#2d6a4f,#225840)', borderRadius: 4 }} />
                          </div>
                        </td>
                      </tr>
                    )
                  })
                })()}
              </tbody>
            </table>
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

/* ─── Carolina concierge admin ─── */
interface CarolinaMagnet {
  id: string; title: string; description: string | null; pdf_url: string | null
  hook: string | null; popup_message: string | null; selling_points: string[] | null; active: boolean
}
interface AiCfg { model: string; temperature: number; cta_threshold: number; retrieval_limit: number; max_tokens: number }
interface CarolinaSettingsT {
  avatar_url: string | null; greeting: string | null; knowledge_base: string | null; persona: string | null
  proactive_enabled: boolean; proactive_delay_seconds: number; active_lead_magnet: string | null; ai_config?: AiCfg
}
interface CarolinaAgent { key: string; name: string; role: string | null; avatar_url: string | null }

function CarolinaAdmin() {
  const [settings, setSettings] = useState<CarolinaSettingsT | null>(null)
  const [magnets, setMagnets] = useState<CarolinaMagnet[]>([])
  const [agents, setAgents] = useState<CarolinaAgent[]>([])
  const [agentBusy, setAgentBusy] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState('')
  const [avatarBusy, setAvatarBusy] = useState(false)
  const [magnetBusy, setMagnetBusy] = useState(false)
  const [newTitle, setNewTitle] = useState('')

  const flash = (m: string) => { setToast(m); setTimeout(() => setToast(''), 2600) }

  const load = useCallback(() => {
    setLoading(true)
    fetch('/api/admin/carolina')
      .then(r => r.ok ? r.json() : Promise.reject(new Error('load')))
      .then((d: { settings: CarolinaSettingsT | null; magnets: CarolinaMagnet[]; agents?: CarolinaAgent[] }) => {
        setSettings(d.settings || { avatar_url: null, greeting: '', knowledge_base: '', persona: '', proactive_enabled: true, proactive_delay_seconds: 12, active_lead_magnet: null })
        setMagnets(d.magnets || [])
        setAgents(d.agents || [])
      })
      .catch(() => flash('Failed to load'))
      .finally(() => setLoading(false))
  }, [])
  useEffect(() => { load() }, [load])

  const patch = async (body: Partial<CarolinaSettingsT>) => {
    setSaving(true)
    try {
      const r = await fetch('/api/admin/carolina', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      if (!r.ok) throw new Error('save')
      flash('Saved ✓')
    } catch { flash('Save failed') } finally { setSaving(false) }
  }

  const uploadAvatar = async (file: File) => {
    setAvatarBusy(true)
    const fd = new FormData(); fd.append('kind', 'avatar'); fd.append('file', file)
    try {
      const r = await fetch('/api/admin/carolina/upload', { method: 'POST', body: fd })
      const d = await r.json(); if (!r.ok) throw new Error(d.error || 'upload')
      setSettings(s => s ? { ...s, avatar_url: d.avatar_url } : s); flash('Avatar updated ✓')
    } catch (e) { flash(e instanceof Error ? e.message : 'Upload failed') } finally { setAvatarBusy(false) }
  }

  const uploadAgentAvatar = async (key: string, file: File) => {
    setAgentBusy(key)
    const fd = new FormData(); fd.append('kind', 'agent_avatar'); fd.append('agent', key); fd.append('file', file)
    try {
      const r = await fetch('/api/admin/carolina/upload', { method: 'POST', body: fd })
      const d = await r.json(); if (!r.ok) throw new Error(d.error || 'upload')
      setAgents(a => a.map(x => x.key === key ? { ...x, avatar_url: d.avatar_url } : x)); flash('Avatar updated ✓')
    } catch (e) { flash(e instanceof Error ? e.message : 'Upload failed') } finally { setAgentBusy('') }
  }

  const uploadMagnet = async (file: File) => {
    setMagnetBusy(true)
    const fd = new FormData(); fd.append('kind', 'lead_magnet'); fd.append('file', file); if (newTitle) fd.append('title', newTitle)
    try {
      const r = await fetch('/api/admin/carolina/upload', { method: 'POST', body: fd })
      const d = await r.json(); if (!r.ok) throw new Error(d.error || 'upload')
      setNewTitle(''); flash('Lead magnet added — Carolina wrote the copy ✓'); load()
    } catch (e) { flash(e instanceof Error ? e.message : 'Upload failed') } finally { setMagnetBusy(false) }
  }

  const deleteMagnet = async (id: string) => {
    if (!confirm('Delete this lead magnet?')) return
    try {
      const r = await fetch(`/api/admin/carolina/upload?id=${id}`, { method: 'DELETE' })
      if (!r.ok) throw new Error('del'); flash('Deleted'); load()
    } catch { flash('Delete failed') }
  }

  const card: React.CSSProperties = { background: '#fff', borderRadius: 14, padding: '24px 26px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid #f0f0f0', marginBottom: 22 }
  const label: React.CSSProperties = { fontSize: 12, fontWeight: 700, letterSpacing: '.06em', color: '#225840', textTransform: 'uppercase', marginBottom: 14 }
  const field: React.CSSProperties = { width: '100%', border: '1.5px solid #e0e0e0', borderRadius: 8, fontSize: 14, fontFamily: 'inherit', padding: '10px 12px', outline: 'none', color: '#0a0a0a', background: '#fff' }
  const btn: React.CSSProperties = { padding: '10px 20px', background: 'linear-gradient(135deg,#225840,#2d6a4f)', border: 'none', borderRadius: 8, color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }

  if (loading || !settings) return <div style={{ color: '#9ca3af', padding: 40 }}>Loading Carolina…</div>

  return (
    <div>
      {toast && <div style={{ position: 'fixed', top: 74, right: 24, background: '#0a1a0f', color: '#fff', padding: '10px 18px', borderRadius: 8, fontSize: 13, fontWeight: 600, zIndex: 200 }}>{toast}</div>}

      {/* Avatar + basics */}
      <div style={card}>
        <div style={label}>Avatar & Greeting</div>
        <div style={{ display: 'flex', gap: 22, alignItems: 'flex-start', flexWrap: 'wrap' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: 84, height: 84, borderRadius: '50%', overflow: 'hidden', background: 'linear-gradient(145deg,#C9A84C,#B0902F)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2E1A35', fontFamily: 'Georgia,serif', fontSize: 34, margin: '0 auto 8px' }}>
              {settings.avatar_url ? <img src={settings.avatar_url} alt="Carolina" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : 'C'}
            </div>
            <label style={{ ...btn, display: 'inline-block', padding: '7px 14px', opacity: avatarBusy ? 0.6 : 1 }}>
              {avatarBusy ? 'Uploading…' : 'Upload image'}
              <input type="file" accept="image/*" style={{ display: 'none' }} disabled={avatarBusy}
                onChange={e => { const f = e.target.files?.[0]; if (f) uploadAvatar(f) }} />
            </label>
          </div>
          <div style={{ flex: 1, minWidth: 260 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Opening greeting</div>
            <textarea value={settings.greeting || ''} rows={3} style={{ ...field, resize: 'vertical' }}
              onChange={e => setSettings({ ...settings, greeting: e.target.value })} />
            <button style={{ ...btn, marginTop: 10 }} disabled={saving} onClick={() => patch({ greeting: settings.greeting || '' })}>Save greeting</button>
          </div>
        </div>
      </div>

      {/* Team agents */}
      <div style={card}>
        <div style={label}>Team Agents</div>
        <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 16, lineHeight: 1.6 }}>Your chat team. Carolina handles sales, Natasha customer success, Benjamin support. Conversations transfer between them automatically. Upload a photo for each so visitors see a real team.</p>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          {agents.map(a => (
            <div key={a.key} style={{ textAlign: 'center', width: 120 }}>
              <div style={{ width: 72, height: 72, borderRadius: '50%', overflow: 'hidden', background: 'linear-gradient(145deg,#C9A84C,#B0902F)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2E1A35', fontFamily: 'Georgia,serif', fontSize: 28, margin: '0 auto 8px' }}>
                {a.avatar_url ? <img src={a.avatar_url} alt={a.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : a.name.charAt(0)}
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#0a0a0a' }}>{a.name}</div>
              <div style={{ fontSize: 11.5, color: '#6b7280', marginBottom: 8 }}>{a.role}</div>
              <label style={{ ...btn, display: 'inline-block', padding: '6px 12px', fontSize: 12, opacity: agentBusy === a.key ? 0.6 : 1 }}>
                {agentBusy === a.key ? 'Uploading…' : 'Photo'}
                <input type="file" accept="image/*" style={{ display: 'none' }} disabled={agentBusy === a.key}
                  onChange={e => { const f = e.target.files?.[0]; if (f) uploadAgentAvatar(a.key, f) }} />
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Proactive popup */}
      <div style={card}>
        <div style={label}>Proactive Popup</div>
        <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: '#374151', marginBottom: 14 }}>
          <input type="checkbox" checked={settings.proactive_enabled}
            onChange={e => { const v = e.target.checked; setSettings({ ...settings, proactive_enabled: v }); patch({ proactive_enabled: v }) }} />
          Show a proactive teaser bubble to first-time visitors (promotes your active lead magnet)
        </label>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 14, color: '#374151' }}>Appear after</span>
          <input type="number" min={0} max={120} value={settings.proactive_delay_seconds}
            style={{ ...field, width: 90 }} onChange={e => setSettings({ ...settings, proactive_delay_seconds: Number(e.target.value) })} />
          <span style={{ fontSize: 14, color: '#374151' }}>seconds</span>
          <button style={btn} disabled={saving} onClick={() => patch({ proactive_delay_seconds: settings.proactive_delay_seconds })}>Save</button>
        </div>
      </div>

      {/* Lead magnets */}
      <div style={card}>
        <div style={label}>Lead Magnets</div>
        <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 16, lineHeight: 1.6 }}>Upload a PDF and Carolina reads it to write her own persuasive hook, selling points, and popup message. The newest upload becomes the active magnet she promotes.</p>
        <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
          <input type="text" placeholder="Title (optional)" value={newTitle} onChange={e => setNewTitle(e.target.value)} style={{ ...field, width: 240 }} />
          <label style={{ ...btn, display: 'inline-block', opacity: magnetBusy ? 0.6 : 1 }}>
            {magnetBusy ? 'Analyzing PDF…' : 'Upload PDF'}
            <input type="file" accept="application/pdf" style={{ display: 'none' }} disabled={magnetBusy}
              onChange={e => { const f = e.target.files?.[0]; if (f) uploadMagnet(f) }} />
          </label>
        </div>
        {magnets.length === 0 ? (
          <p style={{ fontSize: 14, color: '#9ca3af' }}>No lead magnets yet.</p>
        ) : magnets.map(m => {
          const isActive = settings.active_lead_magnet === m.id
          return (
            <div key={m.id} style={{ border: `1.5px solid ${isActive ? '#2d6a4f' : '#eee'}`, borderRadius: 10, padding: 16, marginBottom: 12, background: isActive ? '#f4faf6' : '#fff' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, color: '#0a0a0a', fontSize: 15 }}>{m.title} {isActive && <span style={{ fontSize: 11, color: '#2d6a4f', fontWeight: 700 }}>● ACTIVE</span>}</div>
                  {m.description && <div style={{ fontSize: 13, color: '#6b7280', marginTop: 4 }}>{m.description}</div>}
                  {m.hook && <div style={{ fontSize: 13, color: '#B0902F', marginTop: 6, fontStyle: 'italic' }}>“{m.hook}”</div>}
                  {m.popup_message && <div style={{ fontSize: 12.5, color: '#374151', marginTop: 6, background: '#faf6f0', padding: '8px 10px', borderRadius: 6 }}>Popup: {m.popup_message}</div>}
                  {Array.isArray(m.selling_points) && m.selling_points.length > 0 && (
                    <ul style={{ margin: '8px 0 0', paddingLeft: 18, fontSize: 12.5, color: '#6b7280' }}>{m.selling_points.map((p, i) => <li key={i}>{p}</li>)}</ul>
                  )}
                  <div style={{ marginTop: 8, display: 'flex', gap: 12 }}>
                    {m.pdf_url && <a href={m.pdf_url} target="_blank" rel="noopener" style={{ fontSize: 12, color: '#225840', fontWeight: 600 }}>View PDF ↗</a>}
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {!isActive && <button style={{ ...btn, padding: '6px 12px', fontSize: 12 }} onClick={() => { setSettings({ ...settings, active_lead_magnet: m.id }); patch({ active_lead_magnet: m.id }) }}>Set active</button>}
                  <button style={{ padding: '6px 12px', background: '#fff', border: '1px solid #e0a0a0', borderRadius: 6, color: '#b91c1c', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }} onClick={() => deleteMagnet(m.id)}>Delete</button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Knowledge base */}
      <div style={card}>
        <div style={label}>Sales Knowledge Base</div>
        <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 12, lineHeight: 1.6 }}>What Carolina knows about your offers, tone, and routing. Sales & lead-gen only — she never coaches or teaches tactics.</p>
        <textarea value={settings.knowledge_base || ''} rows={16} style={{ ...field, resize: 'vertical', fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 13, lineHeight: 1.55 }}
          onChange={e => setSettings({ ...settings, knowledge_base: e.target.value })} />
        <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
          <button style={btn} disabled={saving} onClick={() => patch({ knowledge_base: settings.knowledge_base || '' })}>Save knowledge base</button>
        </div>
        <div style={{ ...label, marginTop: 26 }}>Persona</div>
        <textarea value={settings.persona || ''} rows={3} style={{ ...field, resize: 'vertical' }}
          onChange={e => setSettings({ ...settings, persona: e.target.value })} />
        <button style={{ ...btn, marginTop: 10 }} disabled={saving} onClick={() => patch({ persona: settings.persona || '' })}>Save persona</button>
      </div>

      {/* AI Control Center */}
      {(() => {
        const ai: AiCfg = settings.ai_config || { model: 'claude-sonnet-4-6', temperature: 0.7, cta_threshold: 8, retrieval_limit: 5, max_tokens: 700 }
        const setAi = (k: keyof AiCfg, v: string | number) => setSettings({ ...settings, ai_config: { ...ai, [k]: v } })
        return (
          <div style={card}>
            <div style={label}>AI Control Center</div>
            <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 16, lineHeight: 1.6 }}>Tune the model and behaviour without touching code.</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Model</div>
                <select value={ai.model} onChange={e => setAi('model', e.target.value)} style={field}>
                  {['claude-sonnet-4-6', 'claude-opus-4-8', 'claude-haiku-4-5-20251001'].map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Temperature: {ai.temperature}</div>
                <input type="range" min={0} max={1} step={0.1} value={ai.temperature} onChange={e => setAi('temperature', Number(e.target.value))} style={{ width: '100%' }} />
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>CTA threshold (lead score to suggest a call)</div>
                <input type="number" min={1} max={40} value={ai.cta_threshold} onChange={e => setAi('cta_threshold', Number(e.target.value))} style={field} />
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Retrieval limit (sources per answer)</div>
                <input type="number" min={1} max={12} value={ai.retrieval_limit} onChange={e => setAi('retrieval_limit', Number(e.target.value))} style={field} />
              </div>
            </div>
            <button style={{ ...btn, marginTop: 14 }} disabled={saving} onClick={() => patch({ ai_config: ai } as Partial<CarolinaSettingsT>)}>Save AI config</button>
          </div>
        )
      })()}
    </div>
  )
}

/* ─── CMS Content Manager ─── */
interface CmsItem { id: string; type: string; slug: string; title: string; status: string; featured: boolean; category: string | null; updated_at: string }
interface CmsCat { slug: string; name: string; type: string | null }
const CMS_TYPES = ['program', 'product', 'article', 'knowledge', 'video', 'case_study', 'faq', 'testimonial', 'announcement', 'event', 'team', 'page']

function CmsAdmin() {
  const [items, setItems] = useState<CmsItem[]>([])
  const [cats, setCats] = useState<CmsCat[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null)
  const [relatedIds, setRelatedIds] = useState<string[]>([])
  const [busy, setBusy] = useState(false)
  const [toast, setToast] = useState('')
  const [filter, setFilter] = useState('all')
  const flash = (m: string) => { setToast(m); setTimeout(() => setToast(''), 2600) }

  const load = useCallback(() => {
    setLoading(true)
    fetch('/api/admin/cms').then(r => r.ok ? r.json() : Promise.reject()).then((d: { items: CmsItem[]; categories: CmsCat[] }) => {
      setItems(d.items || []); setCats(d.categories || [])
    }).catch(() => flash('Failed to load')).finally(() => setLoading(false))
  }, [])
  useEffect(() => { load() }, [load])

  const openNew = () => { setEditing({ type: 'article', title: '', slug: '', status: 'draft', featured: false, data: {}, seo: {} }); setRelatedIds([]) }
  const openEdit = async (id: string) => {
    const r = await fetch('/api/admin/cms?id=' + id); const d = await r.json()
    if (d.item) { setEditing({ ...d.item, tags: (d.item.tags || []).join(', '), data: d.item.data || {}, seo: d.item.seo || {} }); setRelatedIds(d.related || []) }
  }
  const save = async () => {
    if (!editing) return
    setBusy(true)
    const e = editing as Record<string, unknown>
    const body: Record<string, unknown> = {
      id: e.id, type: e.type, title: e.title, slug: e.slug, subtitle: e.subtitle, summary: e.summary,
      description: e.description, cover_image: e.cover_image, category: e.category,
      tags: typeof e.tags === 'string' ? (e.tags as string).split(',').map(s => s.trim()).filter(Boolean) : e.tags,
      status: e.status, featured: !!e.featured, sort: Number(e.sort) || 0, seo: e.seo, data: e.data, related: relatedIds,
    }
    try {
      const r = await fetch('/api/admin/cms', { method: e.id ? 'PATCH' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      const d = await r.json(); if (!r.ok) throw new Error(d.error || 'save')
      flash('Saved ✓'); setEditing(null); load()
    } catch (err) { flash(err instanceof Error ? err.message : 'Save failed') } finally { setBusy(false) }
  }
  const del = async (id: string) => {
    if (!confirm('Delete this content?')) return
    await fetch('/api/admin/cms?id=' + id, { method: 'DELETE' }); flash('Deleted'); load()
  }
  const uploadCover = async (file: File) => {
    const fd = new FormData(); fd.append('kind', 'media'); fd.append('file', file)
    try {
      const r = await fetch('/api/admin/carolina/upload', { method: 'POST', body: fd }); const d = await r.json()
      if (!r.ok) throw new Error(d.error); setEditing(s => s ? { ...s, cover_image: d.url } : s); flash('Image uploaded ✓')
    } catch (e) { flash(e instanceof Error ? e.message : 'Upload failed') }
  }

  const card: React.CSSProperties = { background: '#fff', borderRadius: 14, padding: '24px 26px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid #f0f0f0' }
  const field: React.CSSProperties = { width: '100%', border: '1.5px solid #e0e0e0', borderRadius: 8, fontSize: 14, fontFamily: 'inherit', padding: '10px 12px', outline: 'none', color: '#0a0a0a', background: '#fff', marginBottom: 12 }
  const lbl: React.CSSProperties = { fontSize: 12.5, fontWeight: 700, color: '#374151', margin: '4px 0 5px', display: 'block' }
  const btn: React.CSSProperties = { padding: '10px 20px', background: 'linear-gradient(135deg,#225840,#2d6a4f)', border: 'none', borderRadius: 8, color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }

  if (loading) return <div style={{ color: '#9ca3af', padding: 40 }}>Loading content…</div>

  // ── Editor ──
  if (editing) {
    const e = editing as Record<string, string | boolean | number | Record<string, unknown>>
    const set = (k: string, v: unknown) => setEditing(s => s ? { ...s, [k]: v } : s)
    return (
      <div>
        {toast && <div style={{ position: 'fixed', top: 74, right: 24, background: '#0a1a0f', color: '#fff', padding: '10px 18px', borderRadius: 8, fontSize: 13, fontWeight: 600, zIndex: 200 }}>{toast}</div>}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <button onClick={() => setEditing(null)} style={{ ...btn, background: '#eef2ee', color: '#225840' }}>← Back</button>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => { set('status', 'published'); }} style={{ ...btn, background: '#e8f0ea', color: '#225840' }}>Mark published</button>
            <button onClick={save} disabled={busy} style={btn}>{busy ? 'Saving…' : 'Save'}</button>
          </div>
        </div>
        <div style={{ ...card, marginBottom: 22 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div><label style={lbl}>Type</label><select value={String(e.type)} onChange={ev => set('type', ev.target.value)} style={field}>{CMS_TYPES.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
            <div><label style={lbl}>Status</label><select value={String(e.status)} onChange={ev => set('status', ev.target.value)} style={field}>{['draft', 'published', 'archived'].map(s => <option key={s} value={s}>{s}</option>)}</select></div>
          </div>
          <label style={lbl}>Title</label><input value={String(e.title || '')} onChange={ev => set('title', ev.target.value)} style={field} />
          <label style={lbl}>Slug (leave blank to auto-generate)</label><input value={String(e.slug || '')} onChange={ev => set('slug', ev.target.value)} style={field} />
          <label style={lbl}>Subtitle</label><input value={String(e.subtitle || '')} onChange={ev => set('subtitle', ev.target.value)} style={field} />
          <label style={lbl}>Summary</label><textarea value={String(e.summary || '')} onChange={ev => set('summary', ev.target.value)} rows={2} style={{ ...field, resize: 'vertical' }} />
          <label style={lbl}>Body (markdown)</label><textarea value={String(e.description || '')} onChange={ev => set('description', ev.target.value)} rows={10} style={{ ...field, resize: 'vertical', fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 13 }} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
            <div><label style={lbl}>Category</label><input value={String(e.category || '')} onChange={ev => set('category', ev.target.value)} list="cms-cats" style={field} /><datalist id="cms-cats">{cats.map(c => <option key={c.slug} value={c.slug}>{c.name}</option>)}</datalist></div>
            <div><label style={lbl}>Tags (comma-sep)</label><input value={String(e.tags || '')} onChange={ev => set('tags', ev.target.value)} style={field} /></div>
            <div><label style={lbl}>Sort</label><input type="number" value={Number(e.sort) || 0} onChange={ev => set('sort', ev.target.value)} style={field} /></div>
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: '#374151', margin: '2px 0 14px' }}>
            <input type="checkbox" checked={!!e.featured} onChange={ev => set('featured', ev.target.checked)} /> Featured
          </label>
          <label style={lbl}>Cover image</label>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12 }}>
            {e.cover_image ? <img src={String(e.cover_image)} alt="" style={{ width: 90, height: 51, objectFit: 'cover', borderRadius: 8 }} /> : null}
            <input value={String(e.cover_image || '')} onChange={ev => set('cover_image', ev.target.value)} placeholder="/images/… or upload" style={{ ...field, marginBottom: 0, flex: 1 }} />
            <label style={{ ...btn, padding: '8px 14px' }}>Upload<input type="file" accept="image/*" style={{ display: 'none' }} onChange={ev => { const f = ev.target.files?.[0]; if (f) uploadCover(f) }} /></label>
          </div>
          <label style={lbl}>Type-specific data (JSON)</label>
          <textarea defaultValue={JSON.stringify(e.data || {}, null, 2)} onBlur={ev => { try { set('data', JSON.parse(ev.target.value || '{}')) } catch { flash('Invalid JSON in data') } }} rows={8} style={{ ...field, resize: 'vertical', fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 12.5 }} />
          <label style={lbl}>Related content</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {items.filter(it => it.id !== e.id).map(it => {
              const on = relatedIds.includes(it.id)
              return <button key={it.id} onClick={() => setRelatedIds(on ? relatedIds.filter(x => x !== it.id) : [...relatedIds, it.id])}
                style={{ padding: '6px 11px', borderRadius: 999, border: `1px solid ${on ? '#2d6a4f' : '#e0e0e0'}`, background: on ? '#e8f0ea' : '#fff', color: on ? '#225840' : '#6b7280', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>{it.title}</button>
            })}
          </div>
        </div>
      </div>
    )
  }

  // ── List ──
  const shown = filter === 'all' ? items : items.filter(i => i.type === filter)
  return (
    <div>
      {toast && <div style={{ position: 'fixed', top: 74, right: 24, background: '#0a1a0f', color: '#fff', padding: '10px 18px', borderRadius: 8, fontSize: 13, fontWeight: 600, zIndex: 200 }}>{toast}</div>}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, gap: 12, flexWrap: 'wrap' }}>
        <select value={filter} onChange={e => setFilter(e.target.value)} style={{ padding: '9px 14px', border: '1.5px solid #e0e0e0', borderRadius: 8, fontSize: 14, background: '#fff', color: '#0a0a0a' }}>
          <option value="all">All types</option>{CMS_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={async () => { setBusy(true); try { const r = await fetch('/api/admin/cms/embed', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' }); const d = await r.json(); flash(d.ok ? `Reindexed ${d.chunks} chunks (${d.provider})` : (d.error || 'Failed')) } catch { flash('Reindex failed') } finally { setBusy(false) } }} disabled={busy} style={{ ...btn, background: '#eef2ee', color: '#225840' }}>{busy ? 'Reindexing…' : 'Reindex knowledge'}</button>
          <button onClick={openNew} style={btn}>+ New content</button>
        </div>
      </div>
      <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
          <thead><tr style={{ background: '#0a1a0f' }}>{['Title', 'Type', 'Category', 'Status', '', ''].map((c, i) => <th key={i} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.65)', textTransform: 'uppercase', letterSpacing: '.07em' }}>{c}</th>)}</tr></thead>
          <tbody>
            {shown.length === 0 ? <tr><td colSpan={6} style={{ padding: 48, textAlign: 'center', color: '#9ca3af' }}>No content yet. Click “New content”.</td></tr> :
              shown.map((it, i) => (
                <tr key={it.id} style={{ background: i % 2 ? '#f9f9f9' : '#fff' }}>
                  <td style={{ padding: '12px 16px', fontWeight: 600, color: '#0a0a0a' }}>{it.title}{it.featured && <span style={{ color: '#C9A84C', marginLeft: 6 }}>★</span>}</td>
                  <td style={{ padding: '12px 16px', color: '#6b7280' }}>{it.type}</td>
                  <td style={{ padding: '12px 16px', color: '#6b7280' }}>{it.category || '—'}</td>
                  <td style={{ padding: '12px 16px' }}><span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600, background: it.status === 'published' ? '#e8f0ea' : it.status === 'archived' ? '#f3f4f6' : '#fef3c7', color: it.status === 'published' ? '#225840' : '#6b7280' }}>{it.status}</span></td>
                  <td style={{ padding: '12px 16px' }}><button onClick={() => openEdit(it.id)} style={{ ...btn, padding: '6px 14px', fontSize: 12 }}>Edit</button></td>
                  <td style={{ padding: '12px 16px' }}><button onClick={() => del(it.id)} style={{ padding: '6px 12px', background: '#fff', border: '1px solid #e0a0a0', borderRadius: 6, color: '#b91c1c', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Delete</button></td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

/* ─── Operations dashboard (business intelligence) ─── */
interface Dash {
  kpis: { conversations: number; contacts: number; booked: number; highIntent: number; customers: number; avgLatencyMs: number; turns: number }
  funnel: { label: string; value: number }[]
  pipeline: { stage: string; count: number }[]
  intents: { intent: string; count: number }[]
  knowledge: { content: number; published: number; chunks: number; embedded: number; provider: string }
  recent: { type: string; title: string | null; detail: string | null; contact_email: string; created_at: string }[]
}
function OpsDashboard() {
  const [d, setD] = useState<Dash | null>(null)
  useEffect(() => { fetch('/api/admin/dashboard').then(r => r.ok ? r.json() : null).then(setD).catch(() => {}) }, [])
  if (!d) return null
  const card: React.CSSProperties = { background: '#fff', borderRadius: 14, padding: '20px 22px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid #f0f0f0' }
  const lbl: React.CSSProperties = { fontSize: 12, fontWeight: 700, letterSpacing: '.05em', color: '#225840', textTransform: 'uppercase', marginBottom: 14 }
  const maxF = Math.max(1, ...d.funnel.map(f => f.value))
  const maxI = Math.max(1, ...d.intents.map(i => i.count))
  const fmt = (s: string) => { try { return new Date(s).toLocaleString([], { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) } catch { return s } }
  return (
    <div style={{ marginBottom: 26 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: 14, marginBottom: 18 }}>
        <StatCard label="Conversations" value={d.kpis.conversations} />
        <StatCard label="Leads" value={d.kpis.contacts} />
        <StatCard label="Calls Booked" value={d.kpis.booked} accent />
        <StatCard label="High Intent" value={d.kpis.highIntent} hint="score ≥ 8" />
        <StatCard label="Avg AI Response" value={Math.round(d.kpis.avgLatencyMs / 100) / 10} suffix="s" />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 16, marginBottom: 16 }}>
        <div style={card}>
          <div style={lbl}>Conversion Funnel (30d)</div>
          {d.funnel.map((f, i) => (
            <div key={f.label} style={{ marginBottom: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}><span style={{ color: '#374151' }}>{f.label}</span><span style={{ fontWeight: 700, color: '#0a0a0a' }}>{f.value}{i > 0 && d.funnel[0].value > 0 ? <span style={{ color: '#9ca3af', fontWeight: 400 }}> · {Math.round((f.value / Math.max(1, d.funnel[0].value)) * 100)}%</span> : null}</span></div>
              <div style={{ height: 8, background: '#f0f0f0', borderRadius: 4 }}><div style={{ width: `${(f.value / maxF) * 100}%`, height: '100%', background: 'linear-gradient(90deg,#225840,#2d6a4f)', borderRadius: 4 }} /></div>
            </div>
          ))}
        </div>
        <div style={card}>
          <div style={lbl}>Top Intents (30d)</div>
          {d.intents.length === 0 ? <div style={{ color: '#9ca3af', fontSize: 13 }}>No data yet.</div> : d.intents.map(it => (
            <div key={it.intent} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <div style={{ width: 90, fontSize: 12.5, color: '#374151', textTransform: 'capitalize' }}>{it.intent.replace('_', ' ')}</div>
              <div style={{ flex: 1, height: 7, background: '#f0f0f0', borderRadius: 4 }}><div style={{ width: `${(it.count / maxI) * 100}%`, height: '100%', background: '#C9A84C', borderRadius: 4 }} /></div>
              <div style={{ width: 26, textAlign: 'right', fontSize: 12, fontWeight: 700, color: '#225840' }}>{it.count}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div style={card}>
          <div style={lbl}>Knowledge Health</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, fontSize: 13 }}>
            <div><div style={{ color: '#9ca3af', fontSize: 11 }}>CONTENT</div><b style={{ fontSize: 18 }}>{d.knowledge.content}</b> <span style={{ color: '#9ca3af' }}>({d.knowledge.published} live)</span></div>
            <div><div style={{ color: '#9ca3af', fontSize: 11 }}>CHUNKS</div><b style={{ fontSize: 18 }}>{d.knowledge.chunks}</b></div>
            <div><div style={{ color: '#9ca3af', fontSize: 11 }}>EMBEDDED</div><b style={{ fontSize: 18, color: d.knowledge.embedded > 0 ? '#225840' : '#b91c1c' }}>{d.knowledge.embedded}</b></div>
            <div><div style={{ color: '#9ca3af', fontSize: 11 }}>PROVIDER</div><b style={{ fontSize: 14 }}>{d.knowledge.provider}</b></div>
          </div>
          {d.knowledge.provider === 'none' && <div style={{ marginTop: 12, fontSize: 12, color: '#b45309', background: '#fef3c7', padding: '8px 10px', borderRadius: 8 }}>Semantic search off — set OPENAI_API_KEY and reindex in Content.</div>}
        </div>
        <div style={card}>
          <div style={lbl}>Live Activity</div>
          {d.recent.length === 0 ? <div style={{ color: '#9ca3af', fontSize: 13 }}>No activity yet.</div> : d.recent.slice(0, 7).map((a, i) => (
            <div key={i} style={{ display: 'flex', gap: 9, padding: '6px 0', fontSize: 12.5 }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#2d6a4f', marginTop: 4, flexShrink: 0 }} />
              <div style={{ flex: 1 }}><span style={{ fontWeight: 600, color: '#0a0a0a' }}>{a.title || a.type}</span> <span style={{ color: '#9ca3af' }}>· {a.contact_email}</span><div style={{ color: '#9ca3af', fontSize: 11 }}>{fmt(a.created_at)}</div></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ─── CRM ─── */
interface Contact { email: string; name: string | null; pipeline_stage: string; lead_score: number; interest: string | null; business_stage: string | null; call_booked: boolean; tags: string[]; updated_at: string }
interface Activity { id: string; type: string; title: string | null; detail: string | null; created_at: string }
interface Note { id: string; body: string; author: string | null; created_at: string }
const STAGE_LABEL: Record<string, string> = { new: 'New', qualified: 'Qualified', discovery: 'Discovery', call_booked: 'Call booked', call_completed: 'Call done', proposal: 'Proposal', won: 'Won', lost: 'Lost', customer: 'Customer' }

function CrmAdmin() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [pipeline, setPipeline] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [sel, setSel] = useState<string | null>(null)
  const [profile, setProfile] = useState<{ contact: Contact; activities: Activity[]; notes: Note[] } | null>(null)
  const [note, setNote] = useState('')
  const [q, setQ] = useState('')
  const [toast, setToast] = useState('')
  const flash = (m: string) => { setToast(m); setTimeout(() => setToast(''), 2400) }

  const load = useCallback(() => {
    setLoading(true)
    fetch('/api/admin/crm').then(r => r.ok ? r.json() : Promise.reject()).then((d: { contacts: Contact[]; pipeline: string[] }) => { setContacts(d.contacts || []); setPipeline(d.pipeline || []) }).catch(() => flash('Failed')).finally(() => setLoading(false))
  }, [])
  useEffect(() => { load() }, [load])
  const openProfile = (email: string) => { setSel(email); setProfile(null); fetch('/api/admin/crm?email=' + encodeURIComponent(email)).then(r => r.json()).then(setProfile) }
  const setStage = async (email: string, stage: string) => {
    await fetch('/api/admin/crm', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, pipeline_stage: stage }) })
    flash('Stage updated'); load(); if (sel === email) openProfile(email)
  }
  const addNote = async () => {
    if (!sel || !note.trim()) return
    await fetch('/api/admin/crm', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: sel, body: note }) })
    setNote(''); openProfile(sel)
  }

  const card: React.CSSProperties = { background: '#fff', borderRadius: 14, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid #f0f0f0' }
  const chip = (s: string) => <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600, background: s === 'won' || s === 'customer' ? '#e8f0ea' : s === 'lost' ? '#fdeaea' : s === 'call_booked' ? '#e0f2fe' : '#f3f4f6', color: s === 'won' || s === 'customer' ? '#225840' : s === 'lost' ? '#b91c1c' : '#374151' }}>{STAGE_LABEL[s] || s}</span>
  const fmt = (d: string) => { try { return new Date(d).toLocaleString([], { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) } catch { return d } }

  if (loading) return <div style={{ color: '#9ca3af', padding: 40 }}>Loading CRM…</div>
  const shown = q ? contacts.filter(c => (c.name || '').toLowerCase().includes(q.toLowerCase()) || c.email.toLowerCase().includes(q.toLowerCase())) : contacts

  return (
    <div>
      {toast && <div style={{ position: 'fixed', top: 74, right: 24, background: '#0a1a0f', color: '#fff', padding: '10px 18px', borderRadius: 8, fontSize: 13, fontWeight: 600, zIndex: 300 }}>{toast}</div>}
      <OpsDashboard />
      <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '.05em', color: '#225840', textTransform: 'uppercase', marginBottom: 12 }}>Contacts</div>
      <input placeholder="Search name or email…" value={q} onChange={e => setQ(e.target.value)} style={{ padding: '10px 16px', border: '1.5px solid #e0e0e0', borderRadius: 8, fontSize: 14, width: 320, marginBottom: 14, background: '#fff', color: '#0a0a0a' }} />
      <div style={{ ...card, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
          <thead><tr style={{ background: '#0a1a0f' }}>{['Contact', 'Interest', 'Score', 'Stage', 'Updated', ''].map((c, i) => <th key={i} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.65)', textTransform: 'uppercase', letterSpacing: '.07em' }}>{c}</th>)}</tr></thead>
          <tbody>
            {shown.length === 0 ? <tr><td colSpan={6} style={{ padding: 48, textAlign: 'center', color: '#9ca3af' }}>No contacts yet — they appear as visitors chat.</td></tr> :
              shown.map((c, i) => (
                <tr key={c.email} style={{ background: i % 2 ? '#f9f9f9' : '#fff' }}>
                  <td style={{ padding: '12px 16px' }}><div style={{ fontWeight: 600, color: '#0a0a0a' }}>{c.name || '—'}</div><div style={{ fontSize: 12, color: '#6b7280' }}>{c.email}</div></td>
                  <td style={{ padding: '12px 16px', color: '#6b7280' }}>{c.interest || c.business_stage || '—'}</td>
                  <td style={{ padding: '12px 16px', fontWeight: 700, color: c.lead_score >= 8 ? '#C9A84C' : '#374151' }}>{c.lead_score}</td>
                  <td style={{ padding: '12px 16px' }}>{chip(c.pipeline_stage)}</td>
                  <td style={{ padding: '12px 16px', color: '#9ca3af', fontSize: 12 }}>{fmt(c.updated_at)}</td>
                  <td style={{ padding: '12px 16px' }}><button onClick={() => openProfile(c.email)} style={{ padding: '6px 14px', background: 'linear-gradient(135deg,#225840,#2d6a4f)', border: 'none', borderRadius: 6, color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Open</button></td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {sel && (
        <div onClick={() => setSel(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 250, display: 'flex', justifyContent: 'flex-end' }}>
          <div onClick={e => e.stopPropagation()} style={{ width: 460, maxWidth: '92vw', height: '100%', background: '#f7f8f7', overflowY: 'auto', padding: 24, boxShadow: '-12px 0 40px rgba(0,0,0,0.2)' }}>
            {!profile ? <div style={{ color: '#9ca3af' }}>Loading…</div> : (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
                  <div><div style={{ fontSize: 20, fontWeight: 800, color: '#0a0a0a' }}>{profile.contact.name || 'Contact'}</div><div style={{ fontSize: 13, color: '#6b7280' }}>{profile.contact.email}</div></div>
                  <button onClick={() => setSel(null)} style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid #e0e0e0', background: '#fff', cursor: 'pointer', fontSize: 16 }}>×</button>
                </div>
                <div style={{ ...card, padding: 16, marginBottom: 16 }}>
                  <div style={{ display: 'flex', gap: 18, marginBottom: 14, fontSize: 13 }}>
                    <div><div style={{ color: '#9ca3af', fontSize: 11, textTransform: 'uppercase', fontWeight: 700 }}>Score</div><div style={{ fontWeight: 700, color: profile.contact.lead_score >= 8 ? '#C9A84C' : '#0a0a0a' }}>{profile.contact.lead_score}</div></div>
                    <div><div style={{ color: '#9ca3af', fontSize: 11, textTransform: 'uppercase', fontWeight: 700 }}>Interest</div><div>{profile.contact.interest || '—'}</div></div>
                    <div><div style={{ color: '#9ca3af', fontSize: 11, textTransform: 'uppercase', fontWeight: 700 }}>Booked</div><div>{profile.contact.call_booked ? 'Yes' : 'No'}</div></div>
                  </div>
                  <div style={{ fontSize: 11, color: '#9ca3af', fontWeight: 700, textTransform: 'uppercase', marginBottom: 8 }}>Pipeline stage</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {pipeline.map(s => <button key={s} onClick={() => setStage(profile.contact.email, s)} style={{ padding: '6px 11px', borderRadius: 999, border: `1px solid ${profile.contact.pipeline_stage === s ? '#2d6a4f' : '#e0e0e0'}`, background: profile.contact.pipeline_stage === s ? '#e8f0ea' : '#fff', color: profile.contact.pipeline_stage === s ? '#225840' : '#6b7280', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>{STAGE_LABEL[s] || s}</button>)}
                  </div>
                </div>
                <div style={{ ...card, padding: 16, marginBottom: 16 }}>
                  <div style={{ fontSize: 11, color: '#9ca3af', fontWeight: 700, textTransform: 'uppercase', marginBottom: 10 }}>Notes</div>
                  <textarea value={note} onChange={e => setNote(e.target.value)} placeholder="Add a note…" rows={2} style={{ width: '100%', border: '1.5px solid #e0e0e0', borderRadius: 8, padding: '9px 11px', fontSize: 13, fontFamily: 'inherit', resize: 'vertical' }} />
                  <button onClick={addNote} style={{ marginTop: 8, padding: '8px 16px', background: 'linear-gradient(135deg,#225840,#2d6a4f)', border: 'none', borderRadius: 8, color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Add note</button>
                  {profile.notes.map(n => <div key={n.id} style={{ marginTop: 10, padding: 10, background: '#f4faf6', borderRadius: 8, fontSize: 13, color: '#374151' }}>{n.body}<div style={{ fontSize: 11, color: '#9ca3af', marginTop: 4 }}>{fmt(n.created_at)}</div></div>)}
                </div>
                <div style={{ ...card, padding: 16 }}>
                  <div style={{ fontSize: 11, color: '#9ca3af', fontWeight: 700, textTransform: 'uppercase', marginBottom: 10 }}>Timeline</div>
                  {profile.activities.length === 0 ? <div style={{ color: '#9ca3af', fontSize: 13 }}>No activity yet.</div> :
                    profile.activities.map(a => (
                      <div key={a.id} style={{ display: 'flex', gap: 10, padding: '8px 0', borderBottom: '1px solid #f0f0f0' }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#2d6a4f', marginTop: 5, flexShrink: 0 }} />
                        <div><div style={{ fontSize: 13, fontWeight: 600, color: '#0a0a0a' }}>{a.title || a.type}</div>{a.detail && <div style={{ fontSize: 12, color: '#6b7280' }}>{a.detail}</div>}<div style={{ fontSize: 11, color: '#9ca3af' }}>{fmt(a.created_at)}</div></div>
                      </div>
                    ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

/* ─── AdminPage ─── */
export default function AdminPage() {
  const [ready, setReady] = useState(false)
  const [authed, setAuthed] = useState(false)
  const [tab, setTab] = useState<'overview' | 'leads' | 'carolina' | 'content' | 'crm'>('overview')

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
          {(['overview', 'leads', 'crm', 'carolina', 'content'] as const).map(t => (
            <button
              key={t} onClick={() => setTab(t)} className="tab-btn"
              style={{ background: tab === t ? '#2d6a4f' : 'transparent', color: tab === t ? '#fff' : 'rgba(255,255,255,0.6)' }}
            >
              {t === 'overview' ? 'Analytics' : t === 'leads' ? 'Leads' : t === 'crm' ? 'CRM' : t === 'carolina' ? 'Carolina' : 'Content'}
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
        ) : tab === 'carolina' ? (
          <CarolinaAdmin />
        ) : tab === 'content' ? (
          <CmsAdmin />
        ) : tab === 'crm' ? (
          <CrmAdmin />
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
