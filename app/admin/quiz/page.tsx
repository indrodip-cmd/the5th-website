'use client'
/* Quiz Leads — everyone who has taken the website quiz, with their answers,
   AI roadmap, computed LEAD QUALIFICATION, and full communication history.
   Data comes from the quiz_leads table via /api/quiz-leads (admin-only);
   per-lead email engagement comes from /api/quiz-leads/comms.

   Qualification colours (founder-specified, intentionally inverted):
     Qualified → RED · Nurture → GREEN · Not qualified → BLUE */
import { useEffect, useMemo, useState } from 'react'
import { T, Card, PageHeader, Input, Button, Drawer, EmptyState, ErrorState, useAdminFetch, fmtDate } from '@/components/admin/ui'
import type { Qualification, QualTier } from '@/lib/qualification'

type Roadmap = {
  days?: Array<{ day: number; title?: string; theme?: string; tasks?: string[]; win_condition?: string; motivation?: string }>
  summary?: string
  biggest_opportunity?: string
  first_action?: string
} | null

type Lead = {
  id: string
  email: string
  name: string | null
  full_name: string | null
  profile_type: string | null
  answers: Record<string, string | string[]> | null
  roadmap: Roadmap
  current_day: number | null
  streak: number | null
  revenue_logged: number | null
  last_visit: string | null
  utm_source: string | null
  converted_to_member: boolean | null
  call_booked: boolean | null
  report_viewed_at: string | null
  sequence_assigned: string | null
  paid: boolean | null
  paid_at: string | null
  created_at: string
  qualification: Qualification
}

type CommMessage = {
  id: string; channel: string; direction: string; to_addr: string | null; subject: string | null
  status: string | null; source: string | null; created_at: string; opened_at: string | null; clicked_at: string | null
}
type CommStats = { sent: number; opened: number; clicked: number; replies: number; openRate: number; clickRate: number; engagement: number }

/* Human labels for the quiz question keys. */
const Q_LABELS: Record<string, string> = {
  qgoal: 'Biggest Goal (12 months)',
  q1: 'Business Stage', q2: 'Ideal Client', q3: 'Client Age Range',
  q4: 'Client Pain', q5: 'Zone of Genius', q6: 'Transformation Story',
  q7: 'Client Transformation', q8: 'Delivery Method', q9: 'Program Length',
  q10: 'Price Confidence (1–5)', q11: 'Pricing Block', q12: 'Content Consistency',
  q13: 'Content Formats', q14: 'Content Block', q15: 'Sales Relationship',
  q16: 'Biggest Fear', q17: 'Support Needed', q18: 'Revenue Goal',
  q19: 'Weekly Hours', q20: 'Urgency Level (1–5)',
  qmp1: 'Comfort Charging Premium', qmp2: 'Feeling About Money',
  qmp3: 'What Feels Most True', qmp4: "Family's Money Relationship",
  qmp5: 'Fear Affecting Business Most',
  qchallenge: 'One Challenge to Solve',
  from: 'From State', to: 'To State',
}

const ANSWER_ORDER = [
  'qgoal', 'q1', 'q2', 'q3', 'q4', 'q5', 'q6', 'q7', 'q8', 'q9', 'q10',
  'q11', 'q12', 'q13', 'q14', 'q15', 'q16', 'q17', 'q18', 'q19', 'q20',
  'qmp1', 'qmp2', 'qmp3', 'qmp4', 'qmp5', 'qchallenge',
]

function leadName(l: Lead): string { return l.name || l.full_name || l.email }
function isNewThisWeek(iso: string | null): boolean {
  return !!iso && new Date(iso).getTime() > Date.now() - 7 * 86400000
}
function displayVal(v: string | string[]): string { return Array.isArray(v) ? v.join(', ') : String(v) }

function orderedAnswers(answers: Lead['answers']): Array<[string, string | string[]]> {
  if (!answers) return []
  const entries = Object.entries(answers)
  return entries.sort((a, b) => {
    const ia = ANSWER_ORDER.indexOf(a[0]); const ib = ANSWER_ORDER.indexOf(b[0])
    return (ia === -1 ? 999 : ia) - (ib === -1 ? 999 : ib)
  })
}

/* Journey/lifecycle status (separate from qualification). */
function status(l: Lead): { label: string; color: string } {
  if (l.converted_to_member) return { label: 'Member', color: '#16a34a' }
  if (l.paid) return { label: 'Paid', color: '#C9A84C' }
  if (l.call_booked) return { label: 'Call booked', color: '#2563eb' }
  if (l.report_viewed_at) return { label: 'Viewed report', color: '#7c3aed' }
  if (l.last_visit && new Date(l.last_visit) > new Date(Date.now() - 7 * 86400000)) return { label: 'Active', color: T.green }
  return { label: 'New', color: '#b45309' }
}

const th: React.CSSProperties = { padding: '12px 14px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.65)', textTransform: 'uppercase', letterSpacing: '.06em', whiteSpace: 'nowrap' }
const td: React.CSSProperties = { padding: '13px 14px', fontSize: 13.5, color: T.text, whiteSpace: 'nowrap' }

function QualBadge({ q, dot }: { q: Qualification; dot?: boolean }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '3px 10px', borderRadius: 20, background: q.color + '18', color: q.color, fontSize: 12, fontWeight: 700 }}>
      {dot && <span style={{ width: 7, height: 7, borderRadius: '50%', background: q.color }} />}
      {q.label} · {q.score}
    </span>
  )
}

function Stat({ label, value, hint, color }: { label: string; value: string | number; hint?: string; color?: string }) {
  return (
    <Card pad={18} style={{ flex: 1, minWidth: 140, borderTop: color ? `3px solid ${color}` : undefined }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: T.muted, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 26, fontWeight: 800, color: color || T.text, lineHeight: 1 }}>{value}</div>
      {hint && <div style={{ fontSize: 12, color: T.muted, marginTop: 5 }}>{hint}</div>}
    </Card>
  )
}

type FilterKey = 'all' | QualTier | 'paid'

export default function QuizLeadsPage() {
  const { data, loading, error, reload } = useAdminFetch<{ leads: Lead[] }>('/api/quiz-leads')
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<FilterKey>('all')
  const [sortHot, setSortHot] = useState(true)
  const [selected, setSelected] = useState<Lead | null>(null)

  const leads = useMemo(() => data?.leads ?? [], [data])

  const counts = useMemo(() => ({
    qualified: leads.filter(l => l.qualification?.tier === 'qualified').length,
    nurture: leads.filter(l => l.qualification?.tier === 'nurture').length,
    unqualified: leads.filter(l => l.qualification?.tier === 'unqualified').length,
    paid: leads.filter(l => l.paid).length,
  }), [leads])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    let list = leads
    if (filter === 'paid') list = list.filter(l => l.paid)
    else if (filter !== 'all') list = list.filter(l => l.qualification?.tier === filter)
    if (q) list = list.filter(l => leadName(l).toLowerCase().includes(q) || l.email.toLowerCase().includes(q))
    const sorted = [...list]
    if (sortHot) sorted.sort((a, b) => (b.qualification?.score ?? 0) - (a.qualification?.score ?? 0))
    return sorted
  }, [leads, search, filter, sortHot])

  const newThisWeek = leads.filter(l => isNewThisWeek(l.created_at)).length

  const exportCSV = () => {
    const cols = ['Name', 'Email', 'Signed Up', 'Qualification', 'Score', 'Status', 'Track', 'UTM Source', 'Paid', 'Report Viewed']
    const rows = filtered.map(l => [
      leadName(l), l.email, l.created_at, l.qualification?.label || '', String(l.qualification?.score ?? ''),
      status(l).label, l.sequence_assigned || '', l.utm_source || '', l.paid ? 'yes' : 'no', l.report_viewed_at || '',
    ])
    const esc = (v: string) => `"${String(v).replace(/"/g, '""')}"`
    const csv = [cols, ...rows].map(r => r.map(esc).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `quiz-leads-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(a.href)
  }

  const FILTERS: { key: FilterKey; label: string; color?: string }[] = [
    { key: 'all', label: `All (${leads.length})` },
    { key: 'qualified', label: `Qualified (${counts.qualified})`, color: '#dc2626' },
    { key: 'nurture', label: `Nurture (${counts.nurture})`, color: '#16a34a' },
    { key: 'unqualified', label: `Not qualified (${counts.unqualified})`, color: '#2563eb' },
    { key: 'paid', label: `Paid (${counts.paid})`, color: '#C9A84C' },
  ]

  return (
    <>
      <PageHeader
        title="Quiz Leads"
        subtitle="Everyone who has taken the quiz — qualified, colour-coded, with answers, roadmap & email engagement"
        actions={filtered.length > 0 ? <Button variant="ghost" onClick={exportCSV}>Export CSV</Button> : undefined}
      />

      <div style={{ display: 'flex', gap: 12, marginBottom: 18, flexWrap: 'wrap' }}>
        <Stat label="Total Leads" value={leads.length} hint={`${newThisWeek} new this week`} />
        <Stat label="Qualified" value={counts.qualified} color="#dc2626" hint="Hot — act now" />
        <Stat label="Nurture" value={counts.nurture} color="#16a34a" hint="Warm up" />
        <Stat label="Not Qualified" value={counts.unqualified} color="#2563eb" hint="Cold / not a fit" />
        <Stat label="Paid $27" value={counts.paid} color="#C9A84C" />
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap', alignItems: 'center' }}>
        {FILTERS.map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)} style={{
            padding: '7px 13px', borderRadius: 20, cursor: 'pointer', fontSize: 12.5, fontWeight: 700,
            border: `1px solid ${filter === f.key ? (f.color || T.text) : T.border}`,
            background: filter === f.key ? (f.color || T.text) + '18' : 'transparent',
            color: filter === f.key ? (f.color || T.text) : T.sub,
          }}>{f.label}</button>
        ))}
        <div style={{ flex: 1 }} />
        <button onClick={() => setSortHot(s => !s)} style={{ padding: '7px 13px', borderRadius: 20, cursor: 'pointer', fontSize: 12.5, fontWeight: 700, border: `1px solid ${T.border}`, background: 'transparent', color: T.sub }}>
          Sort: {sortHot ? 'Hottest first' : 'Newest first'}
        </button>
      </div>

      <div style={{ marginBottom: 14, maxWidth: 320 }}>
        <Input placeholder="Search by name or email…" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {loading && !data && <div className="skeleton" style={{ height: 260, borderRadius: 14 }} />}
      {error && <ErrorState message="Couldn't load quiz leads." onRetry={reload} />}

      {!loading && !error && leads.length === 0 && (
        <EmptyState title="No quiz leads yet" hint="When people take the quiz on your website, they'll appear here." icon="📝" />
      )}

      {!error && leads.length > 0 && (
        <Card pad={0} style={{ overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: T.ink }}>
                  {['', 'Name', 'Email', 'Qualification', 'Signed Up', 'Track', 'Status', ''].map((c, i) => (
                    <th key={i} style={th}>{c}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={8} style={{ padding: '48px 24px', textAlign: 'center', color: T.muted }}>No results match your filter.</td></tr>
                ) : filtered.map((l) => {
                  const s = status(l)
                  const qc = l.qualification?.color || T.muted
                  return (
                    <tr key={l.id} className="admin-row" style={{ borderTop: `1px solid ${T.border}`, cursor: 'pointer', boxShadow: `inset 4px 0 0 ${qc}` }} onClick={() => setSelected(l)}>
                      <td style={{ ...td, width: 8, paddingLeft: 12, paddingRight: 0 }}><span style={{ width: 9, height: 9, borderRadius: '50%', background: qc, display: 'inline-block' }} /></td>
                      <td style={{ ...td, fontWeight: 600 }}>{leadName(l)}{l.paid && <span title="Paid $27" style={{ marginLeft: 6, color: '#C9A84C' }}>★</span>}</td>
                      <td style={{ ...td, color: T.sub }}>{l.email}</td>
                      <td style={td}>{l.qualification ? <QualBadge q={l.qualification} /> : '—'}</td>
                      <td style={{ ...td, color: T.sub }}>{fmtDate(l.created_at)}</td>
                      <td style={{ ...td, color: T.sub }}>{l.sequence_assigned || '—'}</td>
                      <td style={td}><span style={{ padding: '3px 10px', borderRadius: 20, background: s.color + '18', color: s.color, fontSize: 12, fontWeight: 700 }}>{s.label}</span></td>
                      <td style={td}><Button variant="ghost" onClick={(e) => { e.stopPropagation(); setSelected(l) }}>View</Button></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {!loading && leads.length > 0 && (
        <p style={{ fontSize: 12, color: T.muted, marginTop: 10, textAlign: 'right' }}>{filtered.length} of {leads.length} leads</p>
      )}

      <Drawer open={!!selected} onClose={() => setSelected(null)} width={560}>
        {selected && <LeadDetail lead={selected} />}
      </Drawer>
    </>
  )
}

function Section({ label, children, accent }: { label: string; children: React.ReactNode; accent?: string }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.08em', color: accent || T.green, textTransform: 'uppercase', marginBottom: 12 }}>{label}</div>
      {children}
    </div>
  )
}

function LeadDetail({ lead }: { lead: Lead }) {
  const answers = orderedAnswers(lead.answers)
  const rm = lead.roadmap
  const s = status(lead)
  const q = lead.qualification

  const [comms, setComms] = useState<{ messages: CommMessage[]; stats: CommStats } | null>(null)
  const [commsLoading, setCommsLoading] = useState(true)
  useEffect(() => {
    let cancelled = false
    setCommsLoading(true)
    fetch(`/api/quiz-leads/comms?email=${encodeURIComponent(lead.email)}`, { credentials: 'same-origin' })
      .then(r => r.json())
      .then(j => { if (!cancelled) setComms({ messages: j.messages || [], stats: j.stats }) })
      .catch(() => { if (!cancelled) setComms({ messages: [], stats: { sent: 0, opened: 0, clicked: 0, replies: 0, openRate: 0, clickRate: 0, engagement: 0 } }) })
      .finally(() => { if (!cancelled) setCommsLoading(false) })
    return () => { cancelled = true }
  }, [lead.email])

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 800, color: T.text }}>{leadName(lead)}</div>
          <div style={{ fontSize: 14, color: T.sub, marginTop: 3 }}>{lead.email}</div>
        </div>
        {q && (
          <div style={{ textAlign: 'center', flexShrink: 0 }}>
            <div style={{ width: 62, height: 62, borderRadius: '50%', border: `3px solid ${q.color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 800, color: q.color }}>{q.score}</div>
            <div style={{ fontSize: 11, fontWeight: 700, color: q.color, marginTop: 5 }}>{q.label}</div>
          </div>
        )}
      </div>

      <div style={{ fontSize: 12, color: T.muted, marginTop: 10, display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        <span>Signed up {fmtDate(lead.created_at)}</span>
        <span style={{ padding: '2px 9px', borderRadius: 20, background: s.color + '18', color: s.color, fontWeight: 700 }}>{s.label}</span>
        {lead.paid && <span style={{ padding: '2px 9px', borderRadius: 20, background: '#C9A84C22', color: '#a9862f', fontWeight: 700 }}>Paid{lead.paid_at ? ` · ${fmtDate(lead.paid_at)}` : ''}</span>}
        {lead.utm_source && <span>· via {lead.utm_source}</span>}
      </div>

      <div style={{ display: 'flex', gap: 8, marginTop: 16, marginBottom: 8, flexWrap: 'wrap' }}>
        <a href={`mailto:${lead.email}`}><Button variant="primary">Send Email →</Button></a>
        <a href={`/admin/crm?q=${encodeURIComponent(lead.email)}`}><Button variant="ghost">Open in CRM</Button></a>
      </div>

      <div style={{ height: 1, background: T.border, margin: '18px 0' }} />

      {/* Qualification breakdown */}
      {q && (
        <Section label="Lead Qualification" accent={q.color}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <QualBadge q={q} dot />
            <span style={{ fontSize: 12.5, color: T.muted }}>Fit score {q.score}/100</span>
          </div>
          {q.reasons.length > 0 && (
            <div style={{ marginBottom: 10 }}>
              {q.reasons.map((r, i) => (
                <div key={i} style={{ display: 'flex', gap: 9, margin: '6px 0', fontSize: 13.5, color: T.text }}>
                  <span style={{ color: '#16a34a', fontWeight: 800 }}>▲</span><span>{r}</span>
                </div>
              ))}
            </div>
          )}
          {q.gaps.length > 0 && q.gaps.map((g, i) => (
            <div key={i} style={{ display: 'flex', gap: 9, margin: '6px 0', fontSize: 13.5, color: T.sub }}>
              <span style={{ color: '#2563eb', fontWeight: 800 }}>▼</span><span>{g}</span>
            </div>
          ))}
          {q.reasons.length === 0 && q.gaps.length === 0 && (
            <p style={{ fontSize: 13, color: T.muted }}>Not enough answers to explain the score.</p>
          )}
        </Section>
      )}

      {/* Communications / engagement */}
      <Section label="Email Engagement">
        {commsLoading && !comms ? (
          <div className="skeleton" style={{ height: 70, borderRadius: 10 }} />
        ) : comms && comms.stats ? (
          <>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 12 }}>
              <MiniStat label="Sent" value={comms.stats.sent} />
              <MiniStat label="Open rate" value={`${comms.stats.openRate}%`} sub={`${comms.stats.opened} opened`} />
              <MiniStat label="Click rate" value={`${comms.stats.clickRate}%`} sub={`${comms.stats.clicked} clicked`} />
              <MiniStat label="Replies" value={comms.stats.replies} />
            </div>
            {comms.messages.length === 0 ? (
              <p style={{ fontSize: 13, color: T.muted }}>No emails logged yet for this lead.</p>
            ) : (
              <div style={{ display: 'grid', gap: 8 }}>
                {comms.messages.slice(0, 25).map(m => (
                  <div key={m.id} style={{ background: T.bg, borderRadius: 10, padding: '10px 12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'baseline' }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: T.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {m.direction === 'inbound' ? '↩ ' : ''}{m.subject || `(${m.channel})`}
                      </div>
                      <div style={{ fontSize: 11, color: T.muted, flexShrink: 0 }}>{fmtDate(m.created_at)}</div>
                    </div>
                    <div style={{ display: 'flex', gap: 6, marginTop: 5, flexWrap: 'wrap' }}>
                      <Tag>{m.channel}</Tag>
                      {m.source && <Tag>{m.source}</Tag>}
                      {m.opened_at || m.status === 'opened' || m.status === 'clicked' ? <Tag color="#16a34a">opened</Tag> : m.direction === 'outbound' ? <Tag color={T.muted}>not opened</Tag> : null}
                      {(m.clicked_at || m.status === 'clicked') && <Tag color="#C9A84C">clicked</Tag>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <p style={{ fontSize: 13, color: T.muted }}>Couldn&apos;t load communications.</p>
        )}
        <div style={{ fontSize: 12, color: T.muted, marginTop: 10, display: 'flex', gap: 14, flexWrap: 'wrap' }}>
          {typeof lead.current_day === 'number' && <span>Drip day: {lead.current_day}</span>}
          {lead.report_viewed_at && <span>Report viewed {fmtDate(lead.report_viewed_at)}</span>}
          {lead.call_booked && <span>Call booked ✓</span>}
        </div>
      </Section>

      <Section label="Quiz Answers">
        {answers.length === 0 ? (
          <p style={{ fontSize: 13, color: T.muted }}>No answers recorded.</p>
        ) : answers.map(([k, v], i) => (
          <div key={k} style={{ paddingBottom: 10, marginBottom: 10, borderBottom: i < answers.length - 1 ? `1px solid ${T.border}` : 'none' }}>
            <div style={{ fontSize: 11, color: T.muted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 3 }}>{Q_LABELS[k] ?? k}</div>
            <div style={{ fontSize: 14, color: T.text, lineHeight: 1.5 }}>{displayVal(v)}</div>
          </div>
        ))}
      </Section>

      {rm && (rm.summary || rm.biggest_opportunity || rm.first_action || rm.days?.length) && (
        <Section label="AI Roadmap">
          {rm.summary && <Field label="Summary" value={rm.summary} />}
          {rm.biggest_opportunity && <Field label="Biggest Opportunity" value={rm.biggest_opportunity} />}
          {rm.first_action && <Field label="First Action" value={rm.first_action} accent />}
          {rm.days && rm.days.length > 0 && (
            <div style={{ marginTop: 14, display: 'grid', gap: 10 }}>
              {rm.days.map(d => (
                <div key={d.day} style={{ background: T.bg, borderRadius: 10, padding: '12px 14px' }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: T.text, marginBottom: 6 }}>Day {d.day}{d.title ? ` — ${d.title}` : ''}</div>
                  {d.tasks && d.tasks.length > 0 && (
                    <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: T.sub, lineHeight: 1.6 }}>
                      {d.tasks.map((t, j) => <li key={j}>{t}</li>)}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          )}
        </Section>
      )}
    </div>
  )
}

function MiniStat({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div style={{ flex: 1, minWidth: 92, background: T.bg, borderRadius: 10, padding: '10px 12px' }}>
      <div style={{ fontSize: 10.5, fontWeight: 700, color: T.muted, textTransform: 'uppercase', letterSpacing: '.05em' }}>{label}</div>
      <div style={{ fontSize: 20, fontWeight: 800, color: T.text, lineHeight: 1.1, marginTop: 3 }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>{sub}</div>}
    </div>
  )
}

function Tag({ children, color }: { children: React.ReactNode; color?: string }) {
  const c = color || T.sub
  return <span style={{ fontSize: 10.5, fontWeight: 700, padding: '2px 7px', borderRadius: 6, background: c + '1e', color: c, textTransform: 'uppercase', letterSpacing: '.04em' }}>{children}</span>
}

function Field({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ fontSize: 11, color: T.muted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 3 }}>{label}</div>
      <div style={{ fontSize: 14, color: accent ? T.green : T.text, fontWeight: accent ? 600 : 400, lineHeight: 1.5 }}>{value}</div>
    </div>
  )
}
