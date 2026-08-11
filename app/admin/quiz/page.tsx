'use client'
/* Quiz Leads — everyone who has taken the website quiz, with their answers and
   AI-generated 15-day roadmap. Data comes from the quiz_leads table via
   /api/quiz-leads (admin-only). This is the modern home for what used to live
   under the deprecated /admin/legacy "Leads" tab. */
import { useMemo, useState } from 'react'
import { T, Card, PageHeader, Input, Button, Drawer, EmptyState, ErrorState, useAdminFetch, fmtDate } from '@/components/admin/ui'

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
  created_at: string
}

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

function status(l: Lead): { label: string; color: string } {
  if (l.converted_to_member) return { label: 'Member', color: '#16a34a' }
  if (l.call_booked) return { label: 'Call booked', color: '#2563eb' }
  if (l.report_viewed_at) return { label: 'Viewed report', color: '#7c3aed' }
  if (l.last_visit && new Date(l.last_visit) > new Date(Date.now() - 7 * 86400000)) return { label: 'Active', color: T.green }
  return { label: 'New', color: '#b45309' }
}

const th: React.CSSProperties = { padding: '12px 14px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.65)', textTransform: 'uppercase', letterSpacing: '.06em', whiteSpace: 'nowrap' }
const td: React.CSSProperties = { padding: '13px 14px', fontSize: 13.5, color: T.text, whiteSpace: 'nowrap' }

function Stat({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return (
    <Card pad={18} style={{ flex: 1, minWidth: 150 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: T.muted, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 26, fontWeight: 800, color: T.text, lineHeight: 1 }}>{value}</div>
      {hint && <div style={{ fontSize: 12, color: T.muted, marginTop: 5 }}>{hint}</div>}
    </Card>
  )
}

export default function QuizLeadsPage() {
  const { data, loading, error, reload } = useAdminFetch<{ leads: Lead[] }>('/api/quiz-leads')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Lead | null>(null)

  const leads = useMemo(() => data?.leads ?? [], [data])
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return leads
    return leads.filter(l => leadName(l).toLowerCase().includes(q) || l.email.toLowerCase().includes(q))
  }, [leads, search])

  const newThisWeek = leads.filter(l => isNewThisWeek(l.created_at)).length
  const withRoadmap = leads.filter(l => l.roadmap && (l.roadmap.days?.length || l.roadmap.summary)).length
  const viewedReport = leads.filter(l => l.report_viewed_at).length

  const exportCSV = () => {
    const cols = ['Name', 'Email', 'Signed Up', 'Status', 'Track', 'UTM Source', 'Roadmap', 'Report Viewed']
    const rows = filtered.map(l => [
      leadName(l), l.email, l.created_at, status(l).label, l.sequence_assigned || '',
      l.utm_source || '', l.roadmap ? 'yes' : 'no', l.report_viewed_at || '',
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

  return (
    <>
      <PageHeader
        title="Quiz Leads"
        subtitle="Everyone who has taken the website quiz — with their answers and AI roadmap"
        actions={filtered.length > 0 ? <Button variant="ghost" onClick={exportCSV}>Export CSV</Button> : undefined}
      />

      <div style={{ display: 'flex', gap: 12, marginBottom: 18, flexWrap: 'wrap' }}>
        <Stat label="Total Leads" value={leads.length} />
        <Stat label="New This Week" value={newThisWeek} />
        <Stat label="With AI Roadmap" value={withRoadmap} />
        <Stat label="Viewed Report" value={viewedReport} />
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
                  {['#', 'Name', 'Email', 'Signed Up', 'Track', 'Roadmap', 'Status', ''].map((c, i) => (
                    <th key={i} style={th}>{c}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={8} style={{ padding: '48px 24px', textAlign: 'center', color: T.muted }}>No results match your search.</td></tr>
                ) : filtered.map((l, i) => {
                  const s = status(l)
                  return (
                    <tr key={l.id} className="admin-row" style={{ borderTop: `1px solid ${T.border}`, cursor: 'pointer' }} onClick={() => setSelected(l)}>
                      <td style={{ ...td, color: T.muted }}>{i + 1}</td>
                      <td style={{ ...td, fontWeight: 600 }}>{leadName(l)}</td>
                      <td style={{ ...td, color: T.sub }}>{l.email}</td>
                      <td style={{ ...td, color: T.sub }}>{fmtDate(l.created_at)}</td>
                      <td style={{ ...td, color: T.sub }}>{l.sequence_assigned || '—'}</td>
                      <td style={td}>{l.roadmap ? '✓' : '—'}</td>
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

      <Drawer open={!!selected} onClose={() => setSelected(null)} width={520}>
        {selected && <LeadDetail lead={selected} />}
      </Drawer>
    </>
  )
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.08em', color: T.green, textTransform: 'uppercase', marginBottom: 12 }}>{label}</div>
      {children}
    </div>
  )
}

function LeadDetail({ lead }: { lead: Lead }) {
  const answers = orderedAnswers(lead.answers)
  const rm = lead.roadmap
  const s = status(lead)
  return (
    <div>
      <div style={{ fontSize: 20, fontWeight: 800, color: T.text }}>{leadName(lead)}</div>
      <div style={{ fontSize: 14, color: T.sub, marginTop: 3 }}>{lead.email}</div>
      <div style={{ fontSize: 12, color: T.muted, marginTop: 5, display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        <span>Signed up {fmtDate(lead.created_at)}</span>
        <span style={{ padding: '2px 9px', borderRadius: 20, background: s.color + '18', color: s.color, fontWeight: 700 }}>{s.label}</span>
        {lead.utm_source && <span>· via {lead.utm_source}</span>}
      </div>

      <div style={{ display: 'flex', gap: 8, marginTop: 16, marginBottom: 8, flexWrap: 'wrap' }}>
        <a href={`mailto:${lead.email}`}><Button variant="primary">Send Email →</Button></a>
        <a href={`/admin/crm?q=${encodeURIComponent(lead.email)}`}><Button variant="ghost">Open in CRM</Button></a>
      </div>

      <div style={{ height: 1, background: T.border, margin: '18px 0' }} />

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

function Field({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ fontSize: 11, color: T.muted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 3 }}>{label}</div>
      <div style={{ fontSize: 14, color: accent ? T.green : T.text, fontWeight: accent ? 600 : 400, lineHeight: 1.5 }}>{value}</div>
    </div>
  )
}
