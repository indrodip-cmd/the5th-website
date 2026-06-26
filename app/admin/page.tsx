'use client'

import { useState, useEffect } from 'react'

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

/* ─── Question labels ─── */
const Q_LABELS: Record<string, string> = {
  q1: 'Business Stage', q2: 'Ideal Client', q3: 'Client Age Range',
  q4: 'Client Pain', q5: 'Zone of Genius', q6: 'Transformation Story',
  q7: 'Client Transformation', q8: 'Delivery Method', q9: 'Program Length',
  q10: 'Price Confidence (1–5)', q11: 'Pricing Block', q12: 'Content Consistency',
  q13: 'Content Formats', q14: 'Content Block', q15: 'Sales Relationship',
  q16: 'Biggest Fear', q17: 'Support Needed', q18: 'Revenue Goal',
  q19: 'Weekly Hours', q20: 'Urgency Level (1–5)', from: 'From State', to: 'To State',
}

/* ─── Status badge colors ─── */
const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  New:    { bg: '#f3f4f6', color: '#6b7280' },
  Active: { bg: '#dcfce7', color: '#16a34a' },
  Cold:   { bg: '#fef3c7', color: '#d97706' },
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

/* ─── useCountUp ─── */
function useCountUp(target: number, duration = 1200) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    if (target === 0) { setVal(0); return }
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
.skeleton { background: linear-gradient(90deg,#f0f0f0 25%,#e8e8e8 50%,#f0f0f0 75%); background-size:200% 100%; animation: shimmer 1.5s infinite; }
@keyframes slideInPanel { from { transform: translateX(100%); } to { transform: translateX(0); } }
.detail-panel { animation: slideInPanel 0.22s cubic-bezier(0.25,0.46,0.45,0.94) both; }
.admin-row:hover td { background: #f0fdf4 !important; }
.admin-row td { transition: background 0.12s ease; }
::-webkit-scrollbar { width: 5px; height: 5px; }
::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 3px; }
.admin-btn {
  padding: 12px 20px;
  background: linear-gradient(135deg, #225840, #2d6a4f);
  border: none; border-radius: 6px; color: #fff;
  font-size: 14px; font-weight: 600; cursor: pointer;
  font-family: inherit; text-align: center; text-decoration: none;
  display: block; width: 100%;
  transition: opacity 0.15s ease;
}
.admin-btn:hover { opacity: 0.9; }
.admin-btn:disabled { background: #d1d5db; cursor: not-allowed; opacity: 1; }
`

/* ─── StatCard ─── */
function StatCard({ label, value, prefix = '' }: { label: string; value: number; prefix?: string }) {
  const displayed = useCountUp(value)
  return (
    <div style={{ background: '#fff', borderRadius: 12, padding: '24px 28px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid #f0f0f0', flex: 1, minWidth: 160 }}>
      <div style={{ fontSize: 36, fontWeight: 800, color: '#0a1a0f', lineHeight: 1 }}>
        {prefix}{displayed.toLocaleString()}
      </div>
      <div style={{ fontSize: 13, color: '#6b7280', marginTop: 8 }}>{label}</div>
    </div>
  )
}

/* ─── SkeletonRow ─── */
function SkeletonRow() {
  const widths = [30, 100, 160, 80, 40, 40, 50, 60, 50]
  return (
    <tr>
      {widths.map((w, i) => (
        <td key={i} style={{ padding: '14px 16px' }}>
          <div className="skeleton" style={{ height: 14, borderRadius: 4, width: w }} />
        </td>
      ))}
    </tr>
  )
}

/* ─── DetailPanel ─── */
function DetailPanel({ lead, onClose }: { lead: Lead; onClose: () => void }) {
  const [syncing, setSyncing] = useState(false)
  const [syncMsg, setSyncMsg] = useState('')

  const curDay = lead.current_day || 1

  const handleSync = async () => {
    setSyncing(true)
    setSyncMsg('')
    try {
      const res = await fetch('/api/quiz-leads/sync-brevo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: lead.email }),
      })
      const d = (await res.json()) as { success?: boolean; error?: string }
      setSyncMsg(d.success ? '✓ Synced to Brevo' : `Error: ${d.error ?? 'unknown'}`)
    } catch {
      setSyncMsg('Request failed')
    } finally {
      setSyncing(false)
    }
  }

  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(lead, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `lead-${lead.email}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const sectionLabel: React.CSSProperties = {
    fontSize: 11, fontWeight: 700, letterSpacing: '.1em',
    color: '#225840', textTransform: 'uppercase', marginBottom: 14,
  }
  const divider: React.CSSProperties = { height: 1, background: '#f0f0f0', margin: '24px 0' }

  return (
    <>
      {/* Backdrop overlay */}
      <div
        onClick={onClose}
        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.15)', zIndex: 200 }}
      />

      {/* Panel */}
      <div
        className="detail-panel"
        style={{
          position: 'fixed', right: 0, top: 0, bottom: 0, width: 500,
          background: '#fff', boxShadow: '-4px 0 28px rgba(0,0,0,0.12)',
          zIndex: 300, overflowY: 'auto', display: 'flex', flexDirection: 'column',
        }}
      >
        {/* Sticky header */}
        <div style={{ padding: '28px 28px 20px', borderBottom: '1px solid #f0f0f0', position: 'sticky', top: 0, background: '#fff', zIndex: 1 }}>
          <button
            onClick={onClose}
            style={{ position: 'absolute', top: 18, right: 20, background: 'none', border: 'none', fontSize: 26, color: '#9ca3af', cursor: 'pointer', lineHeight: 1 }}
          >
            ×
          </button>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#0a0a0a', paddingRight: 40 }}>{lead.name}</div>
          <div style={{ fontSize: 14, color: '#6b7280', marginTop: 3 }}>{lead.email}</div>
          <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 4 }}>Signed up {fmtDate(lead.created_at)}</div>
        </div>

        <div style={{ padding: '24px 28px 48px', flex: 1 }}>

          {/* 1. QUIZ ANSWERS */}
          <div style={sectionLabel as React.CSSProperties}>Quiz Answers</div>
          {Object.keys(lead.answers || {}).length === 0 ? (
            <p style={{ fontSize: 13, color: '#9ca3af' }}>No answers recorded</p>
          ) : (
            Object.entries(lead.answers || {}).map(([key, val], i, arr) => (
              <div
                key={key}
                style={{ borderBottom: i < arr.length - 1 ? '1px solid #f5f5f5' : 'none', paddingBottom: 10, marginBottom: 10 }}
              >
                <div style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 2 }}>
                  {Q_LABELS[key] ?? key}
                </div>
                <div style={{ fontSize: 14, color: '#0a0a0a', lineHeight: 1.5 }}>
                  {Array.isArray(val) ? val.join(', ') : String(val)}
                </div>
              </div>
            ))
          )}

          <div style={divider as React.CSSProperties} />

          {/* 2. AI ROADMAP */}
          {lead.roadmap && (
            <>
              <div style={sectionLabel as React.CSSProperties}>AI Roadmap</div>
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
              <div style={divider as React.CSSProperties} />
            </>
          )}

          {/* 3. 15-DAY PROGRESS */}
          <div style={sectionLabel as React.CSSProperties}>15-Day Progress</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
            {Array.from({ length: 15 }, (_, i) => i + 1).map(d => {
              const done = d < curDay
              const cur  = d === curDay
              return (
                <div
                  key={d}
                  title={`Day ${d}`}
                  style={{
                    width: 30, height: 30, borderRadius: '50%',
                    background: done ? '#225840' : cur ? '#b8960c' : 'transparent',
                    border: `2px solid ${done ? '#225840' : cur ? '#b8960c' : '#d1d5db'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 10, fontWeight: 700,
                    color: done || cur ? '#fff' : '#d1d5db',
                    transition: 'all 0.15s',
                  }}
                >
                  {d}
                </div>
              )
            })}
          </div>
          <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 0 }}>
            Day {curDay} of 15
          </div>

          <div style={divider as React.CSSProperties} />

          {/* 4. STATS */}
          <div style={sectionLabel as React.CSSProperties}>Stats</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 0 }}>
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

          <div style={divider as React.CSSProperties} />

          {/* 5. ACTIONS */}
          <div style={sectionLabel as React.CSSProperties}>Actions</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <a href={`mailto:${lead.email}`} className="admin-btn" style={{ textAlign: 'center' }}>
              Send Email →
            </a>
            <button className="admin-btn" onClick={handleSync} disabled={syncing}>
              {syncing ? 'Syncing…' : 'Sync to Brevo'}
            </button>
            {syncMsg && (
              <p style={{ fontSize: 12, textAlign: 'center', color: syncMsg.startsWith('✓') ? '#16a34a' : '#ef4444' }}>
                {syncMsg}
              </p>
            )}
            <button className="admin-btn" onClick={exportJSON}>
              Export Data (JSON)
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

/* ─── LoginScreen ─── */
function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const attempt = () => {
    if (password === 'The5thAdmin2026') {
      sessionStorage.setItem('admin_auth', '1')
      onLogin()
    } else {
      setError('Invalid password')
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0a1a0f', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <style>{ADMIN_CSS}</style>

      <h1 style={{ fontSize: 28, fontWeight: 800, color: '#fff', marginBottom: 28, letterSpacing: '-0.5px' }}>
        Admin Dashboard
      </h1>

      <div style={{ background: '#fff', borderRadius: 16, padding: 48, maxWidth: 420, width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 36, justifyContent: 'center' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="The5th" style={{ height: 38, width: 'auto' }} />
          <span style={{ fontSize: 15, fontWeight: 800, color: '#225840', letterSpacing: '.08em', textTransform: 'uppercase' }}>
            THE5TH CONSULTING
          </span>
        </div>

        {/* Password */}
        <input
          type="password"
          placeholder="Enter admin password"
          value={password}
          onChange={e => { setPassword(e.target.value); setError('') }}
          onKeyDown={e => e.key === 'Enter' && attempt()}
          autoFocus
          style={{
            width: '100%', padding: '14px 16px',
            border: `2px solid ${error ? '#ef4444' : '#e0e0e0'}`,
            borderRadius: 8, fontSize: 16, fontFamily: 'inherit',
            outline: 'none', marginBottom: error ? 10 : 14,
            color: '#0a0a0a', background: '#fff',
            transition: 'border-color 0.2s',
          }}
        />
        {error && <p style={{ fontSize: 13, color: '#ef4444', marginBottom: 14 }}>{error}</p>}

        <button
          onClick={attempt}
          style={{
            width: '100%', padding: '16px',
            background: 'linear-gradient(135deg, #225840, #2d6a4f)',
            border: 'none', borderRadius: 6, color: '#fff',
            fontSize: 16, fontWeight: 700, cursor: 'pointer',
            fontFamily: 'inherit', letterSpacing: '.02em',
          }}
        >
          Login →
        </button>
      </div>
    </div>
  )
}

/* ─── AdminPage ─── */
export default function AdminPage() {
  const [ready,        setReady]        = useState(false)
  const [authed,       setAuthed]       = useState(false)
  const [leads,        setLeads]        = useState<Lead[]>([])
  const [loading,      setLoading]      = useState(false)
  const [search,       setSearch]       = useState('')
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)

  /* Check sessionStorage after mount to avoid hydration mismatch */
  useEffect(() => {
    if (sessionStorage.getItem('admin_auth') === '1') setAuthed(true)
    setReady(true)
  }, [])

  /* Fetch leads when authed */
  useEffect(() => {
    if (!authed) return
    setLoading(true)
    fetch('/api/quiz-leads')
      .then(r => r.json())
      .then((d: { leads?: Lead[] }) => setLeads(d.leads ?? []))
      .catch(() => setLeads([]))
      .finally(() => setLoading(false))
  }, [authed])

  /* Pre-mount: just a dark screen so SSR matches */
  if (!ready) {
    return <div style={{ minHeight: '100vh', background: '#0a1a0f' }} />
  }

  if (!authed) {
    return <LoginScreen onLogin={() => setAuthed(true)} />
  }

  /* ── Dashboard ── */
  const handleLogout = () => {
    sessionStorage.removeItem('admin_auth')
    setAuthed(false)
    setLeads([])
    setSelectedLead(null)
  }

  /* Stats */
  const totalLeads    = leads.length
  const newThisWeek   = leads.filter(l => l.created_at && new Date(l.created_at) > new Date(Date.now() - 7 * 86400000)).length
  const avgDay        = leads.length ? Math.round(leads.reduce((s, l) => s + (l.current_day || 1), 0) / leads.length) : 0
  const totalRevenue  = Math.round(leads.reduce((s, l) => s + (l.revenue_logged || 0), 0))

  /* Filter */
  const q        = search.toLowerCase()
  const filtered = q ? leads.filter(l => l.name.toLowerCase().includes(q) || l.email.toLowerCase().includes(q)) : leads

  /* Export CSV */
  const exportCSV = () => {
    const header = 'Name,Email,Signed Up,Day,Streak,Revenue,Answers Summary'
    const rows = leads.map(l =>
      [
        `"${(l.name || '').replace(/"/g, '""')}"`,
        `"${l.email}"`,
        `"${fmtDate(l.created_at)}"`,
        l.current_day || 1,
        l.streak || 0,
        l.revenue_logged || 0,
        `"${JSON.stringify(l.answers || {}).replace(/"/g, '""')}"`,
      ].join(',')
    )
    const csv  = [header, ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href = url; a.download = 'quiz-leads.csv'; a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f9f9f9' }}>
      <style>{ADMIN_CSS}</style>

      {/* ── Header ── */}
      <header style={{
        background: '#0a1a0f', height: 60, padding: '0 32px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'sticky', top: 0, zIndex: 100,
      }}>
        {/* Left: logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 18, fontWeight: 800, color: '#fff' }}>
            The<span style={{ color: '#2d6a4f' }}>5th</span>
          </span>
        </div>

        {/* Center: title */}
        <span style={{ fontSize: 15, fontWeight: 700, color: '#fff', letterSpacing: '.01em' }}>
          Quiz Leads Admin
        </span>

        {/* Right: logout */}
        <button
          onClick={handleLogout}
          style={{
            padding: '8px 20px', background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.15)', borderRadius: 6,
            color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
          }}
        >
          Logout
        </button>
      </header>

      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '32px 24px' }}>

        {/* ── Stats Row ── */}
        <div style={{ display: 'flex', gap: 20, marginBottom: 32, flexWrap: 'wrap' }}>
          <StatCard label="Total Leads"           value={totalLeads} />
          <StatCard label="New This Week"          value={newThisWeek} />
          <StatCard label="Avg Day Progress"       value={avgDay} />
          <StatCard label="Total Revenue Logged"   value={totalRevenue} prefix="$" />
        </div>

        {/* ── Table controls ── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, gap: 14, flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="Search by name or email…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              padding: '10px 16px', border: '1.5px solid #e0e0e0', borderRadius: 8,
              fontSize: 14, fontFamily: 'inherit', outline: 'none',
              width: 300, background: '#fff', color: '#0a0a0a',
            }}
          />
          <button
            onClick={exportCSV}
            style={{
              padding: '10px 22px', background: 'linear-gradient(135deg,#225840,#2d6a4f)',
              border: 'none', borderRadius: 6, color: '#fff',
              fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            Export CSV
          </button>
        </div>

        {/* ── Table ── */}
        <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid #f0f0f0', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr style={{ background: '#0a1a0f' }}>
                  {['#', 'Name', 'Email', 'Signed Up', 'Day', 'Streak 🔥', 'Revenue $', 'Status', 'View'].map(col => (
                    <th key={col} style={{ padding: '13px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.65)', textTransform: 'uppercase', letterSpacing: '.07em', whiteSpace: 'nowrap' }}>
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={9} style={{ padding: '64px 24px', textAlign: 'center', color: '#9ca3af', fontSize: 15 }}>
                      {leads.length === 0
                        ? 'No leads yet. Share your quiz to start collecting leads.'
                        : 'No results match your search.'}
                    </td>
                  </tr>
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
                        <td style={{ padding: '14px 16px', background: rowBg }}>
                          <span style={{ padding: '3px 10px', borderRadius: 20, background: bg, color, fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap' }}>
                            {status}
                          </span>
                        </td>
                        <td style={{ padding: '14px 16px', background: rowBg }}>
                          <button
                            onClick={() => setSelectedLead(lead)}
                            style={{
                              padding: '6px 14px', background: 'linear-gradient(135deg,#225840,#2d6a4f)',
                              border: 'none', borderRadius: 6, color: '#fff',
                              fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                            }}
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Row count */}
        {!loading && leads.length > 0 && (
          <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 10, textAlign: 'right' }}>
            {filtered.length} of {leads.length} leads
          </p>
        )}
      </div>

      {/* ── Detail Panel ── */}
      {selectedLead && (
        <DetailPanel lead={selectedLead} onClose={() => setSelectedLead(null)} />
      )}
    </div>
  )
}
