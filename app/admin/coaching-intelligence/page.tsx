'use client'
/* AI Coaching Intelligence — admin-only Business Intelligence module.
   Connect meetings → ingest transcripts → classify → AI evaluation (DPC + type
   specific) → living customer profiles + health → AI Success Coach. */
import { useState, useEffect, type ReactNode } from 'react'
import { T, Card, PageHeader, Button, Input, Textarea, Select, Field, EmptyState, useAdminFetch, adminSend } from '@/components/admin/ui'

const TYPES = [
  ['discovery_call', 'Discovery Call'], ['sales_call', 'Sales Call'], ['strategy_call', 'Strategy Call'],
  ['coaching_session', 'Coaching Session'], ['onboarding_call', 'Onboarding Call'], ['customer_success_review', 'Customer Success Review'],
  ['support_call', 'Support Call'], ['accountability_call', 'Accountability Call'], ['renewal_call', 'Renewal Call'],
  ['team_meeting', 'Team Meeting'], ['internal_meeting', 'Internal Meeting'], ['other', 'Other'],
]
const TYPE_LABEL: Record<string, string> = Object.fromEntries(TYPES)
const TABS = ['Dashboard', 'Meeting Intelligence', 'Call Reviews', 'Customer Intelligence', 'Practice', 'Frameworks', 'Rubrics', 'Trends', 'Success Plans', 'Knowledge Library', 'Reports', 'Settings']
const RISK_COLOR: Record<string, string> = { high: '#dc2626', medium: '#d97706', low: '#16a34a' }

function Badge({ text, color }: { text: string; color: string }) {
  return <span style={{ fontSize: 11, fontWeight: 700, color, background: color + '18', borderRadius: 6, padding: '2px 8px', textTransform: 'capitalize' }}>{text}</span>
}
function Bar({ label, v }: { label: string; v: number | null | undefined }) {
  const pct = Math.max(0, Math.min(100, ((Number(v) || 0) / 10) * 100))
  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, color: T.sub, marginBottom: 3 }}><span style={{ textTransform: 'capitalize' }}>{label.replace(/_/g, ' ')}</span><span style={{ fontWeight: 700, color: T.ink }}>{v == null ? '—' : `${v}/10`}</span></div>
      <div style={{ height: 6, borderRadius: 4, background: '#eef0ee' }}><div style={{ width: `${pct}%`, height: '100%', borderRadius: 4, background: pct >= 70 ? '#16a34a' : pct >= 40 ? '#d97706' : '#dc2626' }} /></div>
    </div>
  )
}

export default function CoachingIntelligence() {
  const [tab, setTab] = useState('Dashboard')
  const [openMeeting, setOpenMeeting] = useState<string | null>(null)
  const [openCustomer, setOpenCustomer] = useState<string | null>(null)

  return (
    <>
      <PageHeader title="AI Coaching Intelligence" subtitle="Call analysis, customer intelligence & coaching success — admin only" />
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
        {TABS.map((t) => (
          <button key={t} className="tab-btn" onClick={() => { setTab(t); setOpenMeeting(null); setOpenCustomer(null) }}
            style={{ background: tab === t ? T.green2 : '#fff', color: tab === t ? '#fff' : T.sub, border: `1px solid ${tab === t ? T.green2 : T.border}` }}>{t}</button>
        ))}
      </div>

      {tab === 'Dashboard' && <Dashboard onCustomer={(k) => { setOpenCustomer(k); setTab('Customer Intelligence') }} />}
      {tab === 'Meeting Intelligence' && <MeetingIntelligence onOpen={(id) => { setOpenMeeting(id); setTab('Call Reviews') }} />}
      {tab === 'Call Reviews' && <CallReviews openId={openMeeting} setOpenId={setOpenMeeting} />}
      {tab === 'Customer Intelligence' && <CustomerIntelligence openKey={openCustomer} setOpenKey={setOpenCustomer} />}
      {tab === 'Practice' && <Practice />}
      {tab === 'Frameworks' && <FrameworkLibrary />}
      {tab === 'Rubrics' && <Rubrics />}
      {tab === 'Trends' && <Trends />}
      {tab === 'Success Plans' && <Scaffold title="Success Plans" body="Open any customer under Customer Intelligence and click ‘Generate success plan’ — a 30/60/90-day plan (north star, milestones, homework, risks, next-meeting agenda) is built from their profile and meeting history and saved to their workspace." />}
      {tab === 'Knowledge Library' && <Scaffold title="Knowledge Library" body="A searchable library of winning calls, objection responses and coaching questions surfaced from analyzed meetings. Uploads already flow into each customer's Knowledge Vault under Customer Intelligence, and methodologies live under Frameworks." />}
      {tab === 'Reports' && <Reports />}
      {tab === 'Settings' && <SettingsTab />}
    </>
  )
}

// ── Dashboard ──────────────────────────────────────────────
function Dashboard({ onCustomer }: { onCustomer: (k: string) => void }) {
  const { data, loading } = useAdminFetch<any>('/api/admin/coaching-intelligence?view=dashboard')
  if (loading && !data) return <div className="skeleton" style={{ height: 260, borderRadius: 14 }} />
  const t = data?.totals || {}
  const kpis = [
    { label: 'Meetings', v: t.meetings ?? 0 }, { label: 'Analyzed', v: t.analyzed ?? 0 },
    { label: 'Win rate', v: data?.win_rate == null ? '—' : `${data.win_rate}%` }, { label: 'Customers', v: t.customers ?? 0 },
  ]
  return (
    <div style={{ display: 'grid', gap: 14 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: 12 }}>
        {kpis.map((k) => (
          <Card key={k.label} pad={18}><div style={{ fontSize: 12, color: T.muted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.05em' }}>{k.label}</div><div style={{ fontSize: 30, fontWeight: 800, color: T.ink, marginTop: 4 }}>{k.v}</div></Card>
        ))}
      </div>
      <ExecutiveInsights />
      {data?.by_type && Object.keys(data.by_type).length > 0 && (
        <Card><div style={{ fontWeight: 800, color: T.ink, marginBottom: 12 }}>Meetings by type</div>
          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
            {Object.entries(data.by_type).sort((a: any, b: any) => b[1] - a[1]).map(([k, v]: any) => (
              <div key={k} style={{ textAlign: 'center', minWidth: 70 }}>
                <div style={{ fontSize: 24, fontWeight: 800, color: T.green2 }}>{v}</div>
                <div style={{ fontSize: 11.5, color: T.muted, marginTop: 2 }}>{TYPE_LABEL[k] || k}</div>
              </div>
            ))}
            <div style={{ marginLeft: 'auto', textAlign: 'center' }}><div style={{ fontSize: 24, fontWeight: 800, color: '#16a34a' }}>{data?.won ?? 0}</div><div style={{ fontSize: 11.5, color: T.muted }}>Won</div></div>
            <div style={{ textAlign: 'center' }}><div style={{ fontSize: 24, fontWeight: 800, color: '#dc2626' }}>{data?.lost ?? 0}</div><div style={{ fontSize: 11.5, color: T.muted }}>Lost</div></div>
          </div>
        </Card>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 14 }}>
        <Card><div style={{ fontWeight: 800, color: T.ink, marginBottom: 12 }}>Average call scores</div>
          <Bar label="discovery" v={data?.avg_scores?.discovery} /><Bar label="listening" v={data?.avg_scores?.listening} />
          <Bar label="objection handling" v={data?.avg_scores?.objection} /><Bar label="closing" v={data?.avg_scores?.closing} />
        </Card>
        <Card><div style={{ fontWeight: 800, color: T.ink, marginBottom: 12 }}>Customers at risk</div>
          {(data?.at_risk || []).length === 0 ? <div style={{ color: T.muted, fontSize: 14 }}>No high-risk customers detected.</div> :
            (data.at_risk).map((p: any) => (
              <button key={p.contact_key} onClick={() => onCustomer(p.contact_key)} style={{ display: 'flex', width: '100%', justifyContent: 'space-between', alignItems: 'center', padding: '9px 0', borderBottom: `1px solid ${T.border}`, background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
                <span style={{ color: T.ink, fontWeight: 600, fontSize: 14 }}>{p.name || p.contact_key}</span>
                <span style={{ display: 'flex', gap: 8, alignItems: 'center' }}><Badge text={p.risk || 'unknown'} color={RISK_COLOR[p.risk] || T.muted} /><span style={{ fontSize: 12, color: T.muted }}>health {p.health_score ?? '—'}</span></span>
              </button>
            ))}
        </Card>
      </div>
    </div>
  )
}

// ── Meeting Intelligence (ingest + list) ───────────────────
function MeetingIntelligence({ onOpen }: { onOpen: (id: string) => void }) {
  const { data, loading, reload } = useAdminFetch<any>('/api/admin/coaching-intelligence?view=meetings')
  const [f, setF] = useState({ title: '', meeting_type: 'sales_call', contact_name: '', contact_email: '', meeting_date: '', transcript: '', consent: true })
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')
  const [uploading, setUploading] = useState(false)

  const onFile = async (file: File) => {
    const isText = /\.(txt|md|vtt|srt)$/i.test(file.name) || file.type.startsWith('text')
    if (isText) {
      const raw = await file.text()
      const cleaned = raw.replace(/\r/g, '').replace(/^\d+\s*$/gm, '').replace(/^[\d:.,]+\s*-->\s*[\d:.,]+.*$/gm, '').replace(/^WEBVTT.*$/gm, '').replace(/\n{3,}/g, '\n\n').trim()
      setF((p) => ({ ...p, transcript: cleaned, title: p.title || file.name.replace(/\.[^.]+$/, '') }))
      setMsg('Loaded transcript — review and ingest.')
      return
    }
    setUploading(true); setMsg('Transcribing recording (this can take a minute)…')
    try {
      const fd = new FormData(); fd.append('file', file)
      const r = await fetch('/api/admin/coaching-intelligence/transcribe', { method: 'POST', credentials: 'include', body: fd })
      const d = await r.json()
      if (r.ok && d.text) { setF((p) => ({ ...p, transcript: d.text, title: p.title || file.name.replace(/\.[^.]+$/, '') })); setMsg('Transcribed — review and ingest.') }
      else setMsg(d.error || 'Transcription failed.')
    } catch { setMsg('Upload failed.') }
    setUploading(false)
  }

  const ingest = async () => {
    if (f.transcript.trim().length < 40) { setMsg('Paste a fuller transcript first.'); return }
    setBusy(true); setMsg('Analyzing…')
    const r = await adminSend('/api/admin/coaching-intelligence', 'POST', { action: 'ingest', ...f })
    setBusy(false)
    if (r?.ok) { setMsg(''); setF({ ...f, title: '', transcript: '' }); reload(); if (r.id) onOpen(r.id) }
    else setMsg(r?.error || 'Failed to ingest.')
  }

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <Card>
        <div style={{ fontWeight: 800, color: T.ink, marginBottom: 14 }}>Ingest a meeting</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 12, marginBottom: 12 }}>
          <Field label="Title"><Input value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} placeholder="e.g. Discovery — Jane Doe" /></Field>
          <Field label="Meeting type"><Select value={f.meeting_type} onChange={(e) => setF({ ...f, meeting_type: e.target.value })}>{TYPES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</Select></Field>
          <Field label="Customer name"><Input value={f.contact_name} onChange={(e) => setF({ ...f, contact_name: e.target.value })} placeholder="Jane Doe" /></Field>
          <Field label="Customer email"><Input value={f.contact_email} onChange={(e) => setF({ ...f, contact_email: e.target.value })} placeholder="jane@co.com" /></Field>
          <Field label="Meeting date"><Input type="date" value={f.meeting_date} onChange={(e) => setF({ ...f, meeting_date: e.target.value })} /></Field>
        </div>
        <Field label="Transcript"><Textarea rows={6} value={f.transcript} onChange={(e) => setF({ ...f, transcript: e.target.value })} placeholder="Paste the transcript, or upload a recording / transcript file below…" /></Field>
        <div style={{ marginTop: 10 }}>
          <label className="tab-btn" style={{ display: 'inline-block', background: '#fff', border: `1px dashed ${T.border}`, color: T.sub, cursor: 'pointer' }}>
            {uploading ? 'Transcribing…' : '⬆ Upload recording (audio/video) or transcript file (.txt/.vtt/.srt)'}
            <input type="file" accept="audio/*,video/*,.txt,.md,.vtt,.srt" disabled={uploading} style={{ display: 'none' }} onChange={(e) => { const file = e.target.files?.[0]; if (file) onFile(file); e.currentTarget.value = '' }} />
          </label>
        </div>
        <label style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 13, color: T.sub, marginTop: 12 }}>
          <input type="checkbox" checked={f.consent} onChange={(e) => setF({ ...f, consent: e.target.checked })} />
          I have consent to store and analyze this recording
        </label>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 12 }}>
          <div style={{ maxWidth: 220 }}><Button onClick={ingest} disabled={busy}>{busy ? 'Analyzing…' : 'Ingest & analyze'}</Button></div>
          {msg && <span style={{ fontSize: 13, color: T.sub }}>{msg}</span>}
          <span style={{ fontSize: 12, color: T.muted, marginLeft: 'auto' }}>Provider auto-import (Fathom, Fireflies…) is configured under Settings.</span>
        </div>
      </Card>

      <Card>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
          <div style={{ fontWeight: 800, color: T.ink }}>Meetings</div>
          <button onClick={() => window.open('/api/admin/coaching-intelligence?view=export_csv', '_blank')} className="tab-btn" style={{ marginLeft: 'auto', background: '#fff', border: `1px solid ${T.border}`, color: T.sub, padding: '6px 12px' }}>Export CSV</button>
        </div>
        {loading && !data ? <div className="skeleton" style={{ height: 160, borderRadius: 12 }} /> :
          (data?.meetings || []).length === 0 ? <EmptyState title="No meetings yet" hint="Ingest a transcript above to get your first AI call review." icon="🎧" /> :
          <div style={{ display: 'grid', gap: 8 }}>
            {data.meetings.map((m: any) => (
              <button key={m.id} onClick={() => onOpen(m.id)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 12, border: `1px solid ${T.border}`, background: '#fff', cursor: 'pointer', textAlign: 'left', width: '100%' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, color: T.ink, fontSize: 14 }}>{m.title || TYPE_LABEL[m.meeting_type] || 'Meeting'}</div>
                  <div style={{ fontSize: 12.5, color: T.muted, marginTop: 2 }}>{m.contact_name || m.contact_email || 'Unknown'} · {m.meeting_date || m.created_at?.slice(0, 10)}</div>
                </div>
                <Badge text={TYPE_LABEL[m.meeting_type] || m.meeting_type} color={T.green2} />
                {m.outcome && m.outcome !== 'n/a' && <Badge text={m.outcome} color={m.outcome === 'won' ? '#16a34a' : m.outcome === 'lost' ? '#dc2626' : T.muted} />}
                <Badge text={m.status} color={m.status === 'analyzed' ? '#16a34a' : '#d97706'} />
              </button>
            ))}
          </div>}
      </Card>
    </div>
  )
}

// ── Call Reviews (structured analysis) ─────────────────────
function CallReviews({ openId, setOpenId }: { openId: string | null; setOpenId: (id: string | null) => void }) {
  if (!openId) return <EmptyState title="Select a meeting" hint="Open a meeting from Meeting Intelligence to see its full AI review." icon="📋" />
  return <ReviewDetail id={openId} onBack={() => setOpenId(null)} />
}
function ReviewDetail({ id, onBack }: { id: string; onBack: () => void }) {
  const { data, loading, reload } = useAdminFetch<any>(`/api/admin/coaching-intelligence?view=meeting&id=${id}`, [id])
  const [busy, setBusy] = useState(false)
  const m = data?.meeting
  const a = m?.analysis || {}
  const reanalyze = async () => { setBusy(true); await adminSend('/api/admin/coaching-intelligence', 'POST', { action: 'analyze', id }); setBusy(false); reload() }
  const [act, setAct] = useState('')
  const doAction = async (action: string) => { setAct('Working…'); const r = await adminSend('/api/admin/coaching-intelligence', 'POST', { action, id }); setAct(r?.ok ? (action === 'send_followup' ? 'Follow-up email sent ✓' : 'CRM task created ✓') : (r?.error || 'Failed')) }
  if (loading && !data) return <div className="skeleton" style={{ height: 300, borderRadius: 14 }} />
  if (!m) return <EmptyState title="Not found" icon="✦" />
  const scores = (m.scores || {}) as Record<string, number>
  const list = (arr: any[], render: (x: any, i: number) => ReactNode) => (arr || []).map(render)
  return (
    <div style={{ display: 'grid', gap: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={onBack} className="tab-btn" style={{ background: '#fff', border: `1px solid ${T.border}`, color: T.sub }}>← Back</button>
        <div style={{ fontWeight: 800, color: T.ink, fontSize: 18 }}>{m.title || TYPE_LABEL[m.meeting_type]}</div>
        <Badge text={TYPE_LABEL[m.meeting_type] || m.meeting_type} color={T.green2} />
        {typeof a.overall_score === 'number' && <span style={{ marginLeft: 'auto', fontWeight: 800, color: T.ink }}>Overall {a.overall_score}/100</span>}
        <div style={{ display: 'flex', gap: 6, marginLeft: typeof a.overall_score === 'number' ? 0 : 'auto' }}>
          {[['PDF', ''], ['Word', '&format=doc'], ['MD', '&format=md']].map(([label, q]) => (
            <button key={label} onClick={() => window.open(`/api/admin/coaching-intelligence?view=report&kind=meeting&id=${id}${q}`, '_blank')} className="tab-btn" style={{ background: '#fff', border: `1px solid ${T.border}`, color: T.sub, padding: '7px 12px' }}>{label}</button>
          ))}
        </div>
        <div style={{ maxWidth: 130 }}><Button variant="ghost" onClick={reanalyze} disabled={busy}>{busy ? '…' : 'Re-analyze'}</Button></div>
      </div>
      {m.status === 'analyzed' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 12.5, fontWeight: 700, color: T.muted, textTransform: 'uppercase', letterSpacing: '.05em' }}>Actions</span>
          <button onClick={() => doAction('create_task')} className="tab-btn" style={{ background: '#fff', border: `1px solid ${T.border}`, color: T.sub, padding: '7px 14px' }}>✓ Create CRM task</button>
          <button onClick={() => doAction('send_followup')} className="tab-btn" style={{ background: '#fff', border: `1px solid ${T.border}`, color: T.sub, padding: '7px 14px' }}>✉ Send follow-up email</button>
          {act && <span style={{ fontSize: 13, color: act.includes('✓') ? '#16a34a' : T.sub }}>{act}</span>}
        </div>
      )}
      {m.status !== 'analyzed' ? <EmptyState title="Not analyzed yet" hint="Click Re-analyze to run the AI review." icon="🧠" /> : (
        <>
          {a.executive_summary && <Card><div style={{ fontWeight: 800, color: T.ink, marginBottom: 8 }}>Executive summary</div><p style={{ color: T.sub, lineHeight: 1.6, fontSize: 14.5 }}>{a.executive_summary}</p>{a.why_outcome && <p style={{ color: T.sub, lineHeight: 1.6, fontSize: 14, marginTop: 10 }}><b style={{ color: T.ink }}>Why this outcome: </b>{a.why_outcome}</p>}</Card>}
          {a.dpc && <Card><div style={{ fontWeight: 800, color: T.ink, marginBottom: 10 }}>DPC framework</div>{['diagnose', 'prescribe', 'close'].map((k) => a.dpc[k] && <p key={k} style={{ fontSize: 14, color: T.sub, marginBottom: 8, lineHeight: 1.55 }}><b style={{ color: T.ink, textTransform: 'capitalize' }}>{k}: </b>{a.dpc[k]}</p>)}</Card>}
          {Object.keys(scores).length > 0 && <Card><div style={{ fontWeight: 800, color: T.ink, marginBottom: 12 }}>Scores</div><div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: '0 24px' }}>{Object.entries(scores).map(([k, v]) => <Bar key={k} label={k} v={v} />)}</div></Card>}
          {a.rubric && <Card>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}><div style={{ fontWeight: 800, color: T.ink }}>{a.rubric.name}</div><span style={{ marginLeft: 'auto', fontWeight: 800, color: a.rubric.passed === false ? '#dc2626' : T.ink }}>{a.rubric.weighted_score ?? '—'}/100{a.rubric.passed === false ? ' · gate failed' : ''}</span></div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: '0 24px' }}>{(a.rubric.categories || []).map((c: any) => <div key={c.name} style={{ marginBottom: 8 }}><div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, color: T.sub }}><span>{c.name}{c.pass === false ? ' ⚠️' : ''}</span><span style={{ fontWeight: 700, color: T.ink }}>{c.score}/10</span></div><div style={{ height: 6, borderRadius: 4, background: '#eef0ee', marginTop: 3 }}><div style={{ width: `${(c.score / 10) * 100}%`, height: '100%', borderRadius: 4, background: c.pass === false ? '#dc2626' : c.score >= 7 ? '#16a34a' : '#d97706' }} /></div></div>)}</div>
          </Card>}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 14 }}>
            {a.strengths?.length > 0 && <Card><div style={{ fontWeight: 800, color: '#16a34a', marginBottom: 10 }}>Strengths</div>{list(a.strengths, (s: any, i: number) => <div key={i} style={{ marginBottom: 12 }}><div style={{ fontSize: 14, color: T.ink, fontWeight: 600 }}>{s.point || s}</div>{s.evidence && <div style={{ fontSize: 12.5, color: T.muted, fontStyle: 'italic', marginTop: 3, borderLeft: `2px solid ${T.border}`, paddingLeft: 8 }}>“{s.evidence}”</div>}</div>)}</Card>}
            {a.improvements?.length > 0 && <Card><div style={{ fontWeight: 800, color: '#d97706', marginBottom: 10 }}>Prioritized improvements</div>{list(a.improvements, (s: any, i: number) => <div key={i} style={{ marginBottom: 12 }}><div style={{ fontSize: 14, color: T.ink, fontWeight: 600 }}>{s.priority && <span style={{ color: '#dc2626', fontWeight: 800, marginRight: 6 }}>{s.priority}</span>}{s.point || s}</div>{s.how && <div style={{ fontSize: 13, color: T.sub, marginTop: 3 }}>{s.how}</div>}{s.evidence && <div style={{ fontSize: 12.5, color: T.muted, fontStyle: 'italic', marginTop: 3, borderLeft: `2px solid ${T.border}`, paddingLeft: 8 }}>“{s.evidence}”</div>}</div>)}</Card>}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 14 }}>
            {[['Buying signals', a.buying_signals], ['Missed signals', a.missed_buying_signals], ['Risk signals', a.risk_signals], ['Questions to have asked', a.questions_should_have_asked], ['Obstacles identified', a.obstacles_identified], ['Missed opportunities', a.missed_opportunities], ['Suggested questions', a.suggested_questions], ['Practice plan', a.practice_plan], ['Suggested homework', a.suggested_homework], ['Key decisions', a.key_decisions], ['Action items', a.action_items]].filter(([, v]) => Array.isArray(v) && v.length).map(([label, arr]: any) => (
              <Card key={label}><div style={{ fontWeight: 800, color: T.ink, marginBottom: 8, fontSize: 14 }}>{label}</div><ul style={{ paddingLeft: 18, margin: 0 }}>{arr.map((x: string, i: number) => <li key={i} style={{ fontSize: 13.5, color: T.sub, marginBottom: 5, lineHeight: 1.5 }}>{x}</li>)}</ul></Card>
            ))}
          </div>
          {a.suggested_followup_email && <Card><div style={{ fontWeight: 800, color: T.ink, marginBottom: 8 }}>Suggested follow-up email</div><pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', fontSize: 13.5, color: T.sub, lineHeight: 1.6, margin: 0 }}>{a.suggested_followup_email}</pre></Card>}
        </>
      )}
    </div>
  )
}

// ── Customer Intelligence ──────────────────────────────────
function CustomerIntelligence({ openKey, setOpenKey }: { openKey: string | null; setOpenKey: (k: string | null) => void }) {
  if (openKey) return <CustomerDetail ckey={openKey} onBack={() => setOpenKey(null)} />
  return <CustomerList onOpen={setOpenKey} />
}
function CustomerList({ onOpen }: { onOpen: (k: string) => void }) {
  const { data, loading, reload } = useAdminFetch<any>('/api/admin/coaching-intelligence?view=profiles')
  const [adding, setAdding] = useState(false)
  const [nc, setNc] = useState({ name: '', email: '' })
  const [busy, setBusy] = useState(false)
  const rows = data?.profiles || []
  const add = async () => {
    if (!nc.name.trim() && !nc.email.trim()) return
    setBusy(true)
    const r = await adminSend('/api/admin/coaching-intelligence', 'POST', { action: 'add_client', name: nc.name, email: nc.email })
    setBusy(false); setAdding(false); setNc({ name: '', email: '' })
    if (r?.ok && r.key) { reload(); onOpen(r.key) }
  }
  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <Card pad={16}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div><div style={{ fontWeight: 800, color: T.ink }}>Your clients</div><p style={{ fontSize: 13, color: T.sub, margin: '3px 0 0' }}>Every client&apos;s calls, files and history in one place. Add a client, then drop in their files and recordings.</p></div>
          <div style={{ marginLeft: 'auto', maxWidth: 150 }}><Button onClick={() => setAdding(!adding)}>{adding ? 'Close' : '+ Add a client'}</Button></div>
        </div>
        {adding && (
          <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
            <input value={nc.name} onChange={(e) => setNc({ ...nc, name: e.target.value })} placeholder="Client name" style={{ flex: 1, minWidth: 160, padding: '10px 12px', borderRadius: 9, border: `1px solid ${T.border}`, fontSize: 14, fontFamily: 'inherit' }} />
            <input value={nc.email} onChange={(e) => setNc({ ...nc, email: e.target.value })} placeholder="Email (optional)" style={{ flex: 1, minWidth: 160, padding: '10px 12px', borderRadius: 9, border: `1px solid ${T.border}`, fontSize: 14, fontFamily: 'inherit' }} />
            <div style={{ maxWidth: 120 }}><Button onClick={add} disabled={busy}>{busy ? 'Adding…' : 'Add'}</Button></div>
          </div>
        )}
      </Card>
      {loading && !data ? <div className="skeleton" style={{ height: 160, borderRadius: 14 }} /> :
        rows.length === 0 ? <EmptyState title="No clients yet" hint="Add your first client above, or import calls under Meeting Intelligence." icon="👤" /> :
      rows.map((p: any) => (
        <button key={p.contact_key} onClick={() => onOpen(p.contact_key)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 15px', borderRadius: 12, border: `1px solid ${T.border}`, background: '#fff', cursor: 'pointer', textAlign: 'left', width: '100%' }}>
          <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontWeight: 700, color: T.ink }}>{p.name || p.contact_key}</div><div style={{ fontSize: 12.5, color: T.muted }}>{p.email || p.contact_key}</div></div>
          <span style={{ fontSize: 12.5, color: T.sub }}>Health <b style={{ color: T.ink }}>{p.health_score ?? '—'}</b></span>
          <span style={{ fontSize: 12.5, color: T.sub }}>Engage <b style={{ color: T.ink }}>{p.engagement_score ?? '—'}</b></span>
          <Badge text={p.risk || 'unknown'} color={RISK_COLOR[p.risk] || T.muted} />
        </button>
      ))}
    </div>
  )
}
function CustomerDetail({ ckey, onBack }: { ckey: string; onBack: () => void }) {
  const { data, loading, reload } = useAdminFetch<any>(`/api/admin/coaching-intelligence?view=profile&key=${encodeURIComponent(ckey)}`, [ckey])
  const [q, setQ] = useState(''); const [ans, setAns] = useState(''); const [asking, setAsking] = useState(false)
  const [doc, setDoc] = useState({ name: '', text: '' }); const [savingDoc, setSavingDoc] = useState(false)
  const p = data?.profile?.profile || {}
  const ask = async () => { if (!q.trim()) return; setAsking(true); setAns(''); const r = await adminSend('/api/admin/coaching-intelligence', 'POST', { action: 'ask', key: ckey, question: q }); setAsking(false); setAns(r?.answer || 'No answer.') }
  const addDoc = async () => { if (!doc.text.trim()) return; setSavingDoc(true); await adminSend('/api/admin/coaching-intelligence', 'POST', { action: 'add_document', contact_key: ckey, name: doc.name || 'Note', doc_type: 'note', text: doc.text }); setSavingDoc(false); setDoc({ name: '', text: '' }); reload() }
  const [planBusy, setPlanBusy] = useState(false)
  const genPlan = async () => { setPlanBusy(true); await adminSend('/api/admin/coaching-intelligence', 'POST', { action: 'success_plan', key: ckey }); setPlanBusy(false); reload() }
  const plan = data?.profile?.success_plan
  const [upBusy, setUpBusy] = useState(false)
  const onVaultFile = async (file: File) => { setUpBusy(true); const fd = new FormData(); fd.append('file', file); fd.append('contact_key', ckey); await fetch('/api/admin/coaching-intelligence/upload', { method: 'POST', credentials: 'include', body: fd }); setUpBusy(false); reload() }
  if (loading && !data) return <div className="skeleton" style={{ height: 300, borderRadius: 14 }} />
  return (
    <div style={{ display: 'grid', gap: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={onBack} className="tab-btn" style={{ background: '#fff', border: `1px solid ${T.border}`, color: T.sub }}>← Back</button>
        <div style={{ fontWeight: 800, color: T.ink, fontSize: 18 }}>{data?.profile?.name || ckey}</div>
        {data?.profile?.risk && <Badge text={data.profile.risk} color={RISK_COLOR[data.profile.risk] || T.muted} />}
        <span style={{ marginLeft: 'auto', fontSize: 13, color: T.sub }}>Health <b style={{ color: T.ink }}>{data?.profile?.health_score ?? '—'}</b> · Engagement <b style={{ color: T.ink }}>{data?.profile?.engagement_score ?? '—'}</b> · Success <b style={{ color: T.ink }}>{data?.profile?.success_probability ?? '—'}%</b></span>
        <div style={{ display: 'flex', gap: 6 }}>
          {[['PDF', ''], ['Word', '&format=doc'], ['MD', '&format=md']].map(([label, q]) => (
            <button key={label} onClick={() => window.open(`/api/admin/coaching-intelligence?view=report&kind=customer&key=${encodeURIComponent(ckey)}${q}`, '_blank')} className="tab-btn" style={{ background: '#fff', border: `1px solid ${T.border}`, color: T.sub, padding: '7px 12px' }}>{label}</button>
          ))}
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 14 }}>
        <Card><div style={{ fontWeight: 800, color: T.ink, marginBottom: 8 }}>Profile</div>
          {p.summary && <p style={{ fontSize: 14, color: T.sub, lineHeight: 1.6, marginBottom: 10 }}>{p.summary}</p>}
          {[['Company', p.company], ['Role', p.role], ['Industry', p.industry], ['Stage', p.current_stage], ['Communication', p.communication_preferences], ['Learning style', p.learning_style]].filter(([, v]) => v).map(([k, v]: any) => <div key={k} style={{ fontSize: 13, color: T.sub, marginBottom: 4 }}><b style={{ color: T.ink }}>{k}: </b>{v}</div>)}
          {[['Goals', p.goals], ['Challenges', p.challenges], ['Risk factors', p.risk_factors], ['Wins', p.wins], ['Next best actions', p.next_best_actions]].filter(([, v]) => Array.isArray(v) && v.length).map(([k, arr]: any) => <div key={k} style={{ marginTop: 8 }}><div style={{ fontSize: 12.5, fontWeight: 700, color: T.ink }}>{k}</div><ul style={{ paddingLeft: 18, margin: '4px 0 0' }}>{arr.map((x: string, i: number) => <li key={i} style={{ fontSize: 13, color: T.sub, marginBottom: 3 }}>{x}</li>)}</ul></div>)}
        </Card>
        <div style={{ display: 'grid', gap: 14, alignContent: 'start' }}>
          <Card><div style={{ fontWeight: 800, color: T.ink, marginBottom: 8 }}>AI Success Coach</div>
            <Textarea rows={2} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Why is this customer struggling? What should I focus on next?" />
            <div style={{ maxWidth: 140, marginTop: 8 }}><Button onClick={ask} disabled={asking}>{asking ? 'Thinking…' : 'Ask'}</Button></div>
            {ans && <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', fontSize: 13.5, color: T.sub, lineHeight: 1.6, marginTop: 12 }}>{ans}</pre>}
          </Card>
          <Card><div style={{ fontWeight: 800, color: T.ink, marginBottom: 8 }}>Meetings</div>
            {(data?.meetings || []).length === 0 ? <div style={{ color: T.muted, fontSize: 13 }}>No meetings.</div> : data.meetings.map((m: any) => <div key={m.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: T.sub, padding: '6px 0', borderBottom: `1px solid ${T.border}` }}><span>{TYPE_LABEL[m.meeting_type] || m.meeting_type} · {m.meeting_date || ''}</span>{m.outcome && m.outcome !== 'n/a' && <Badge text={m.outcome} color={m.outcome === 'won' ? '#16a34a' : '#dc2626'} />}</div>)}
          </Card>
          <Card><div style={{ fontWeight: 800, color: T.ink, marginBottom: 8 }}>File space &amp; Knowledge Vault</div>
            <label className="tab-btn" style={{ display: 'block', textAlign: 'center', background: '#f7f9f8', border: `1px dashed ${T.border}`, color: T.sub, cursor: 'pointer', marginBottom: 12 }}>
              {upBusy ? 'Uploading…' : '⬆ Upload a file (PDF, image, doc, notes, contract…)'}
              <input type="file" disabled={upBusy} style={{ display: 'none' }} onChange={(e) => { const file = e.target.files?.[0]; if (file) onVaultFile(file); e.currentTarget.value = '' }} />
            </label>
            <Input value={doc.name} onChange={(e) => setDoc({ ...doc, name: e.target.value })} placeholder="…or paste a note (name)" />
            <div style={{ height: 8 }} /><Textarea rows={3} value={doc.text} onChange={(e) => setDoc({ ...doc, text: e.target.value })} placeholder="Paste homework, notes, support chat, contract text…" />
            <div style={{ maxWidth: 160, marginTop: 8 }}><Button variant="ghost" onClick={addDoc} disabled={savingDoc}>{savingDoc ? 'Saving…' : 'Add note'}</Button></div>
            {(data?.docs || []).length > 0 && <div style={{ marginTop: 12, borderTop: `1px solid ${T.border}`, paddingTop: 10 }}>{data.docs.map((d: any) => d.doc_type === 'file'
              ? <a key={d.id} href={`/api/admin/coaching-intelligence?view=file&id=${d.id}`} target="_blank" rel="noreferrer" style={{ display: 'block', fontSize: 12.5, color: T.green2, padding: '3px 0', textDecoration: 'none' }}>📎 {d.name}</a>
              : <div key={d.id} style={{ fontSize: 12.5, color: T.muted, padding: '3px 0' }}>📝 {d.name}</div>)}</div>}
          </Card>
        </div>
      </div>
      <Card>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 10 }}>
          <div style={{ fontWeight: 800, color: T.ink }}>Success Workspace — 30/60/90 plan</div>
          <div style={{ marginLeft: 'auto', maxWidth: 180 }}><Button variant="ghost" onClick={genPlan} disabled={planBusy}>{planBusy ? 'Building…' : plan ? 'Regenerate plan' : 'Generate success plan'}</Button></div>
        </div>
        {!plan ? <div style={{ color: T.muted, fontSize: 13.5 }}>Generate a living 30/60/90-day plan from this customer&apos;s profile and history.</div> : (
          <div>
            {plan.north_star && <p style={{ fontSize: 14, color: T.ink, fontWeight: 600, marginBottom: 12 }}>🎯 {plan.north_star}</p>}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 12 }}>
              {(plan.milestones || []).map((m: any, i: number) => (
                <div key={i} style={{ border: `1px solid ${T.border}`, borderRadius: 12, padding: 14 }}>
                  <div style={{ fontSize: 12, fontWeight: 800, color: T.green2, textTransform: 'uppercase' }}>{m.horizon}</div>
                  <div style={{ fontSize: 14, color: T.ink, fontWeight: 600, margin: '4px 0 6px' }}>{m.goal}</div>
                  <ul style={{ paddingLeft: 16, margin: 0 }}>{(m.actions || []).map((a: string, j: number) => <li key={j} style={{ fontSize: 12.5, color: T.sub, marginBottom: 3 }}>{a}</li>)}</ul>
                  {m.success_metric && <div style={{ fontSize: 12, color: T.muted, marginTop: 6 }}>✓ {m.success_metric}</div>}
                </div>
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 14, marginTop: 12 }}>
              {[['Assigned homework', plan.assigned_homework], ['Blockers', plan.blockers], ['Risks', plan.risks], ['Next-meeting agenda', plan.next_meeting_agenda]].filter(([, v]) => Array.isArray(v) && v.length).map(([label, arr]: any) => (
                <div key={label}><div style={{ fontSize: 12.5, fontWeight: 700, color: T.ink, marginBottom: 4 }}>{label}</div><ul style={{ paddingLeft: 16, margin: 0 }}>{arr.map((x: string, i: number) => <li key={i} style={{ fontSize: 12.5, color: T.sub, marginBottom: 3 }}>{x}</li>)}</ul></div>
              ))}
            </div>
          </div>
        )}
      </Card>
      <CustomerTimeline ckey={ckey} />
    </div>
  )
}

function CustomerTimeline({ ckey }: { ckey: string }) {
  const { data, loading } = useAdminFetch<any>(`/api/admin/coaching-intelligence?view=timeline&key=${encodeURIComponent(ckey)}`, [ckey])
  if (loading && !data) return <div className="skeleton" style={{ height: 120, borderRadius: 12 }} />
  const events = data?.events || []
  if (events.length === 0) return null
  return (
    <Card>
      <div style={{ fontWeight: 800, color: T.ink, marginBottom: 12 }}>Timeline</div>
      <div style={{ display: 'grid', gap: 0 }}>
        {events.map((e: any, i: number) => (
          <div key={i} style={{ display: 'flex', gap: 12, padding: '10px 0', borderBottom: i < events.length - 1 ? `1px solid ${T.border}` : 'none' }}>
            <div style={{ fontSize: 18, lineHeight: 1.2 }}>{e.icon}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13.5, fontWeight: 600, color: T.ink }}>{e.title}</div>
              {e.detail && <div style={{ fontSize: 12.5, color: T.muted, marginTop: 2 }}>{e.detail}</div>}
            </div>
            <div style={{ fontSize: 12, color: T.muted, whiteSpace: 'nowrap' }}>{String(e.at || '').slice(0, 10)}</div>
          </div>
        ))}
      </div>
    </Card>
  )
}

// ── Reports (AI trend surface over the module data) ────────
function Reports() {
  const { data, loading } = useAdminFetch<any>('/api/admin/coaching-intelligence?view=dashboard')
  if (loading && !data) return <div className="skeleton" style={{ height: 200, borderRadius: 14 }} />
  const byType = data?.by_type || {}
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 14 }}>
      <Card><div style={{ fontWeight: 800, color: T.ink, marginBottom: 12 }}>Meetings by type</div>{Object.keys(byType).length === 0 ? <div style={{ color: T.muted, fontSize: 14 }}>No data yet.</div> : Object.entries(byType).sort((a: any, b: any) => b[1] - a[1]).map(([k, v]: any) => <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13.5, color: T.sub, padding: '6px 0', borderBottom: `1px solid ${T.border}` }}><span>{TYPE_LABEL[k] || k}</span><b style={{ color: T.ink }}>{v}</b></div>)}</Card>
      <Card><div style={{ fontWeight: 800, color: T.ink, marginBottom: 12 }}>Win / loss</div><div style={{ display: 'flex', gap: 24 }}><div><div style={{ fontSize: 30, fontWeight: 800, color: '#16a34a' }}>{data?.won ?? 0}</div><div style={{ fontSize: 12, color: T.muted }}>Won</div></div><div><div style={{ fontSize: 30, fontWeight: 800, color: '#dc2626' }}>{data?.lost ?? 0}</div><div style={{ fontSize: 12, color: T.muted }}>Lost</div></div><div><div style={{ fontSize: 30, fontWeight: 800, color: T.ink }}>{data?.win_rate == null ? '—' : `${data.win_rate}%`}</div><div style={{ fontSize: 12, color: T.muted }}>Win rate</div></div></div></Card>
      <Card style={{ gridColumn: '1 / -1' }}><div style={{ fontWeight: 800, color: T.ink, marginBottom: 6 }}>Ask Command AI</div><p style={{ fontSize: 13.5, color: T.sub, lineHeight: 1.6 }}>Command AI can query this module for trend questions like <i>“Why are discovery calls converting poorly?”</i>, <i>“Which customers are likely to churn?”</i>, and <i>“Which coaching techniques lead to better outcomes?”</i> once this section is enabled. Open <b>Command AI</b> in the sidebar and ask.</p></Card>
    </div>
  )
}

// ── Settings (providers + module) ──────────────────────────
function SettingsTab() {
  const providers: [string, string][] = [['Fathom', 'available'], ['Fireflies.ai', 'available'], ['Manual / Video / Audio Upload', 'available'], ['Grain', 'via webhook'], ['Otter.ai', 'via webhook'], ['Read.ai', 'via webhook'], ['Zoom Recording', 'via webhook'], ['Google Meet Recording', 'via webhook']]
  const [busy, setBusy] = useState(false); const [msg, setMsg] = useState('')
  const sync = async (provider: 'fathom' | 'fireflies') => {
    setBusy(true); setMsg(`Importing & analyzing recent ${provider} calls…`)
    const r = await adminSend('/api/admin/coaching-intelligence', 'POST', { action: `sync_${provider}`, since_days: 30 })
    setBusy(false)
    setMsg(r?.ok ? `Imported ${r.imported}, analyzed ${r.analyzed}.` : (r?.note || `${provider} import failed.`))
  }
  const webhookUrl = typeof window !== 'undefined' ? `${window.location.origin}/api/coaching-intelligence/webhook` : '/api/coaching-intelligence/webhook'
  return (
    <div style={{ display: 'grid', gap: 14 }}>
      <Connections />
      <Card><div style={{ fontWeight: 800, color: T.ink, marginBottom: 6 }}>Import your calls</div>
        <p style={{ fontSize: 13.5, color: T.sub, marginBottom: 14 }}>Click a button to bring your calls in. We&apos;ll transcribe and analyze them for you automatically. You can also just paste or upload a recording under Meeting Intelligence, no setup needed.</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 10 }}>
          {providers.map(([p, status]) => <div key={p} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', border: `1px solid ${T.border}`, borderRadius: 12 }}><span style={{ fontSize: 14, color: T.ink, fontWeight: 600 }}>{p}</span><Badge text={status} color={status === 'available' ? '#16a34a' : T.green2} /></div>)}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 14, flexWrap: 'wrap' }}>
          <div style={{ maxWidth: 200 }}><Button onClick={() => sync('fathom')} disabled={busy}>{busy ? 'Importing…' : 'Import from Fathom'}</Button></div>
          <div style={{ maxWidth: 200 }}><Button variant="ghost" onClick={() => sync('fireflies')} disabled={busy}>Import from Fireflies</Button></div>
          {msg && <span style={{ fontSize: 13, color: T.sub }}>{msg}</span>}
        </div>
        <details style={{ marginTop: 14 }}>
          <summary style={{ cursor: 'pointer', fontSize: 12.5, color: T.muted, fontWeight: 600 }}>Advanced: connect other apps (for your tech team)</summary>
          <div style={{ marginTop: 10, padding: '12px 14px', background: '#f7f9f8', borderRadius: 12, border: `1px solid ${T.border}` }}>
            <p style={{ fontSize: 12.5, color: T.sub, margin: '0 0 6px' }}>Pipe any other provider (Zoom, Grain, Otter, Read.ai, Google Meet) in via native webhooks or Zapier/Make. POST JSON <code>{'{ transcript, title, contact_email, meeting_type, provider }'}</code> with header <code>x-ci-token</code> = your <code>CI_WEBHOOK_SECRET</code>.</p>
            <code style={{ fontSize: 12, color: T.green2, wordBreak: 'break-all' }}>{webhookUrl}</code>
          </div>
        </details>
      </Card>
      <Security />
      <Card><div style={{ fontWeight: 800, color: T.ink, marginBottom: 6 }}>Security & access</div>
        <p style={{ fontSize: 13.5, color: T.sub, lineHeight: 1.6 }}>This module is admin-only and hidden behind the <b>coaching_intelligence</b> feature flag until you release it. All API routes are cookie-authed to admins with role-based permissions (below), every meaningful action is audit-logged, data is stored in your Supabase (encrypted at rest) and served over TLS. AI-generated insights are labelled and always quote the source transcript as evidence.</p>
      </Card>
    </div>
  )
}

// ── Executive Insights (proactive AI briefing) ─────────────
function ExecutiveInsights() {
  const [ins, setIns] = useState<string[] | null>(null); const [busy, setBusy] = useState(false)
  const gen = async () => {
    setBusy(true)
    try { const r = await fetch('/api/admin/coaching-intelligence?view=insights', { credentials: 'include' }); const d = await r.json(); setIns(d?.insights || []) } catch { setIns([]) }
    setBusy(false)
  }
  return (
    <Card>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 10 }}>
        <div style={{ fontWeight: 800, color: T.ink }}>Executive insights</div>
        <div style={{ marginLeft: 'auto', maxWidth: 150 }}><Button variant="ghost" onClick={gen} disabled={busy}>{busy ? 'Generating…' : 'Generate'}</Button></div>
      </div>
      {ins == null ? <div style={{ color: T.muted, fontSize: 13.5 }}>An AI briefing across all analyzed meetings — churn signals, the most common missed questions, and what&apos;s driving better outcomes.</div>
        : ins.length === 0 ? <div style={{ color: T.muted, fontSize: 13.5 }}>Not enough analyzed meetings yet — ingest a few calls first.</div>
        : <ul style={{ paddingLeft: 18, margin: 0 }}>{ins.map((s, i) => <li key={i} style={{ fontSize: 14, color: T.sub, marginBottom: 8, lineHeight: 1.55 }}>{s}</li>)}</ul>}
    </Card>
  )
}

// ── Framework Library (AI Learning Engine) ─────────────────
function FrameworkLibrary() {
  const { data, loading, reload } = useAdminFetch<any>('/api/admin/coaching-intelligence?view=frameworks')
  const blank = { id: undefined as string | undefined, name: '', kind: 'framework', body: '', applies: '', active: true }
  const [edit, setEdit] = useState<typeof blank | null>(null)
  const [busy, setBusy] = useState(false)
  const save = async () => {
    if (!edit || !edit.name.trim() || edit.body.trim().length < 10) return
    setBusy(true)
    const meeting_types = edit.applies.split(',').map((s) => s.trim()).filter(Boolean)
    await adminSend('/api/admin/coaching-intelligence', 'POST', { action: 'save_framework', id: edit.id, name: edit.name, kind: edit.kind, body: edit.body, meeting_types, active: edit.active })
    setBusy(false); setEdit(null); reload()
  }
  const archive = async (id: string) => { await adminSend('/api/admin/coaching-intelligence', 'POST', { action: 'delete_framework', id }); reload() }

  if (edit) return (
    <Card>
      <div style={{ fontWeight: 800, color: T.ink, marginBottom: 14 }}>{edit.id ? 'Edit' : 'New'} framework</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 200px', gap: 12, marginBottom: 12 }}>
        <Field label="Name"><Input value={edit.name} onChange={(e) => setEdit({ ...edit, name: e.target.value })} placeholder="e.g. MEDDICC, Our Discovery Script" /></Field>
        <Field label="Kind"><Select value={edit.kind} onChange={(e) => setEdit({ ...edit, kind: e.target.value })}>{['framework', 'playbook', 'script', 'sop', 'rubric'].map((k) => <option key={k} value={k}>{k}</option>)}</Select></Field>
      </div>
      <Field label="Applies to (comma-separated meeting types, or * for all)"><Input value={edit.applies} onChange={(e) => setEdit({ ...edit, applies: e.target.value })} placeholder="sales_call, discovery_call  (leave blank = all)" /></Field>
      <div style={{ height: 10 }} />
      <Field label="Methodology (the AI prioritizes this over generic best practice)"><Textarea rows={10} value={edit.body} onChange={(e) => setEdit({ ...edit, body: e.target.value })} placeholder="Paste your playbook, framework, discovery script, objection guide, SOP…" /></Field>
      <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
        <div style={{ maxWidth: 160 }}><Button onClick={save} disabled={busy}>{busy ? 'Saving…' : 'Save framework'}</Button></div>
        <div style={{ maxWidth: 120 }}><Button variant="ghost" onClick={() => setEdit(null)}>Cancel</Button></div>
      </div>
    </Card>
  )

  return (
    <div style={{ display: 'grid', gap: 14 }}>
      <Card>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div><div style={{ fontWeight: 800, color: T.ink }}>Framework Library — AI Learning Engine</div><p style={{ fontSize: 13.5, color: T.sub, margin: '4px 0 0' }}>Teach the AI your methodology. Active frameworks are injected into every matching call review, so coaching is based on your business, not generic best practice.</p></div>
          <div style={{ marginLeft: 'auto', maxWidth: 150 }}><Button onClick={() => setEdit(blank)}>+ New</Button></div>
        </div>
      </Card>
      {loading && !data ? <div className="skeleton" style={{ height: 160, borderRadius: 12 }} /> :
        (data?.frameworks || []).length === 0 ? <EmptyState title="No frameworks yet" hint="Add your DPC framework, playbooks, scripts and SOPs." icon="📚" /> :
        <div style={{ display: 'grid', gap: 8 }}>
          {data.frameworks.map((f: any) => (
            <Card key={f.id} pad={16}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, color: T.ink }}>{f.name} <span style={{ fontSize: 11, color: T.muted, fontWeight: 600 }}>v{f.version}</span></div>
                  <div style={{ fontSize: 12.5, color: T.muted, marginTop: 2 }}>{f.kind} · {(f.meeting_types || []).length ? (f.meeting_types).map((t: string) => TYPE_LABEL[t] || t).join(', ') : 'all meeting types'}</div>
                </div>
                <Badge text={f.active ? 'active' : 'archived'} color={f.active ? '#16a34a' : T.muted} />
                <button onClick={() => setEdit({ id: f.id, name: f.name, kind: f.kind, body: f.body, applies: (f.meeting_types || []).join(', '), active: f.active })} className="tab-btn" style={{ background: '#fff', border: `1px solid ${T.border}`, color: T.sub, padding: '6px 12px' }}>Edit</button>
                {f.active && <button onClick={() => archive(f.id)} className="tab-btn" style={{ background: '#fff', border: `1px solid ${T.border}`, color: '#dc2626', padding: '6px 12px' }}>Archive</button>}
              </div>
            </Card>
          ))}
        </div>}
    </div>
  )
}

// ── Practice & Roleplay Center ─────────────────────────────
const SCENARIOS = [['sales_call', 'Sales Call'], ['discovery_call', 'Discovery Call'], ['objection_handling', 'Objection Handling'], ['coaching_session', 'Coaching Session'], ['difficult_conversation', 'Difficult Conversation'], ['renewal_call', 'Renewal Call']]
function Practice() {
  const [scenario, setScenario] = useState('sales_call'); const [difficulty, setDifficulty] = useState('realistic')
  const [session, setSession] = useState<{ id: string; persona: string; msgs: { role: string; content: string }[] } | null>(null)
  const [input, setInput] = useState(''); const [busy, setBusy] = useState(false)
  const [fb, setFb] = useState<any | null>(null); const [score, setScore] = useState<number | null>(null)

  const start = async () => { setBusy(true); setFb(null); setScore(null); const r = await adminSend('/api/admin/coaching-intelligence', 'POST', { action: 'roleplay_start', scenario, difficulty }); setBusy(false); if (r?.id) setSession({ id: r.id, persona: r.persona, msgs: [{ role: 'assistant', content: r.opening }] }) }
  const send = async () => { if (!session || !input.trim()) return; const mine = input.trim(); setInput(''); setSession({ ...session, msgs: [...session.msgs, { role: 'user', content: mine }] }); setBusy(true); const r = await adminSend('/api/admin/coaching-intelligence', 'POST', { action: 'roleplay_reply', id: session.id, message: mine }); setBusy(false); setSession((s) => s ? { ...s, msgs: [...s.msgs, { role: 'assistant', content: r?.reply || '…' }] } : s) }
  const finish = async () => { if (!session) return; setBusy(true); const r = await adminSend('/api/admin/coaching-intelligence', 'POST', { action: 'roleplay_score', id: session.id }); setBusy(false); if (r?.ok) { setScore(r.score ?? null); setFb(r.feedback) } }

  if (!session) return (
    <Card>
      <div style={{ fontWeight: 800, color: T.ink, marginBottom: 6 }}>Practice & Roleplay Center</div>
      <p style={{ fontSize: 13.5, color: T.sub, marginBottom: 16 }}>Rehearse with a realistic AI prospect/client. Your frameworks shape the scoring. You get a full breakdown after.</p>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div style={{ minWidth: 220 }}><Field label="Scenario"><Select value={scenario} onChange={(e) => setScenario(e.target.value)}>{SCENARIOS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</Select></Field></div>
        <div style={{ minWidth: 180 }}><Field label="Difficulty"><Select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>{['easy', 'realistic', 'hard', 'brutal'].map((d) => <option key={d} value={d}>{d}</option>)}</Select></Field></div>
        <div style={{ maxWidth: 160 }}><Button onClick={start} disabled={busy}>{busy ? 'Setting up…' : 'Start roleplay'}</Button></div>
      </div>
    </Card>
  )
  return (
    <div style={{ display: 'grid', gap: 14 }}>
      <Card pad={16}><div style={{ fontSize: 12.5, color: T.muted, marginBottom: 4, fontWeight: 700, textTransform: 'uppercase' }}>Your prospect</div><div style={{ fontSize: 14, color: T.sub, lineHeight: 1.55 }}>{session.persona}</div></Card>
      <Card>
        <div style={{ display: 'grid', gap: 10, maxHeight: 380, overflowY: 'auto', marginBottom: 12 }}>
          {session.msgs.map((m, i) => (
            <div key={i} style={{ alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '80%', background: m.role === 'user' ? T.green2 : '#f2f4f2', color: m.role === 'user' ? '#fff' : T.ink, padding: '9px 13px', borderRadius: 14, fontSize: 14, lineHeight: 1.5 }}>{m.content}</div>
          ))}
        </div>
        {score == null ? (
          <div style={{ display: 'flex', gap: 10 }}>
            <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') send() }} placeholder="Your response…" style={{ flex: 1, padding: '11px 14px', borderRadius: 10, border: `1px solid ${T.border}`, fontSize: 14, fontFamily: 'inherit', outline: 'none' }} />
            <div style={{ maxWidth: 90 }}><Button onClick={send} disabled={busy}>{busy ? '…' : 'Send'}</Button></div>
            <div style={{ maxWidth: 130 }}><Button variant="ghost" onClick={finish} disabled={busy}>End & score</Button></div>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: 10 }}><div style={{ maxWidth: 160 }}><Button onClick={() => setSession(null)}>New roleplay</Button></div></div>
        )}
      </Card>
      {fb && (
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}><div style={{ fontWeight: 800, color: T.ink }}>Roleplay review</div>{score != null && <span style={{ marginLeft: 'auto', fontWeight: 800, fontSize: 18, color: score >= 70 ? '#16a34a' : score >= 40 ? '#d97706' : '#dc2626' }}>{score}/100</span>}</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 14 }}>
            {[['Strengths', fb.strengths], ['Weaknesses', fb.weaknesses], ['Missed opportunities', fb.missed_opportunities], ['Better questions', fb.better_questions], ['Alternative responses', fb.alternative_responses], ['Practice exercises', fb.practice_exercises]].filter(([, v]) => Array.isArray(v) && v.length).map(([label, arr]: any) => (
              <div key={label}><div style={{ fontSize: 13, fontWeight: 700, color: T.ink, marginBottom: 5 }}>{label}</div><ul style={{ paddingLeft: 16, margin: 0 }}>{arr.map((x: string, i: number) => <li key={i} style={{ fontSize: 13, color: T.sub, marginBottom: 4, lineHeight: 1.5 }}>{x}</li>)}</ul></div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}

// ── Performance Trends ─────────────────────────────────────
function Trends() {
  const { data, loading } = useAdminFetch<any>('/api/admin/coaching-intelligence?view=trends')
  if (loading && !data) return <div className="skeleton" style={{ height: 240, borderRadius: 14 }} />
  const series = data?.series || []
  if (series.length === 0) return <EmptyState title="No trend data yet" hint="Analyze meetings over a few weeks to see performance trends." icon="📈" />
  const maxOverall = 100
  return (
    <div style={{ display: 'grid', gap: 14 }}>
      {data?.trend_note && <Card style={{ borderLeft: `3px solid ${T.green2}` }}><div style={{ fontWeight: 800, color: T.ink, marginBottom: 6 }}>What the AI sees</div><p style={{ fontSize: 14, color: T.sub, lineHeight: 1.6 }}>{data.trend_note}</p></Card>}
      <Card>
        <div style={{ fontWeight: 800, color: T.ink, marginBottom: 14 }}>Overall call score by month</div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 14, height: 180, overflowX: 'auto' }}>
          {series.map((s: any) => (
            <div key={s.month} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, minWidth: 54 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: T.ink }}>{s.overall ?? '—'}</div>
              <div style={{ width: 30, height: `${((s.overall || 0) / maxOverall) * 130}px`, minHeight: 3, borderRadius: 6, background: `linear-gradient(180deg, ${T.green2}, ${T.green})` }} />
              <div style={{ fontSize: 11, color: T.muted }}>{s.month.slice(2)}</div>
            </div>
          ))}
        </div>
      </Card>
      <Card>
        <div style={{ fontWeight: 800, color: T.ink, marginBottom: 12 }}>Dimensions & win rate by month</div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead><tr style={{ textAlign: 'left', color: T.muted }}>{['Month', 'Meetings', 'Discovery', 'Closing', 'Objection', 'Listening', 'Win %'].map((h) => <th key={h} style={{ padding: '6px 10px', borderBottom: `1px solid ${T.border}`, fontWeight: 700 }}>{h}</th>)}</tr></thead>
            <tbody>{series.map((s: any) => (
              <tr key={s.month}><td style={{ padding: '6px 10px', color: T.ink, fontWeight: 600 }}>{s.month}</td><td style={{ padding: '6px 10px', color: T.sub }}>{s.meetings}</td><td style={{ padding: '6px 10px', color: T.sub }}>{s.discovery ?? '—'}</td><td style={{ padding: '6px 10px', color: T.sub }}>{s.closing ?? '—'}</td><td style={{ padding: '6px 10px', color: T.sub }}>{s.objection ?? '—'}</td><td style={{ padding: '6px 10px', color: T.sub }}>{s.listening ?? '—'}</td><td style={{ padding: '6px 10px', color: T.sub }}>{s.win_rate == null ? '—' : `${s.win_rate}%`}</td></tr>
            ))}</tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

// ── Custom Rubric Scorecards ───────────────────────────────
function Rubrics() {
  const { data, loading, reload } = useAdminFetch<any>('/api/admin/coaching-intelligence?view=rubrics')
  type Cat = { name: string; weight: number; pass_fail?: boolean }
  const blank = { id: undefined as string | undefined, name: '', applies: '', active: true, categories: [{ name: '', weight: 1, pass_fail: false }] as Cat[] }
  const [edit, setEdit] = useState<typeof blank | null>(null)
  const [busy, setBusy] = useState(false)
  const save = async () => {
    if (!edit || !edit.name.trim()) return
    setBusy(true)
    await adminSend('/api/admin/coaching-intelligence', 'POST', { action: 'save_rubric', id: edit.id, name: edit.name, meeting_types: edit.applies.split(',').map((s) => s.trim()).filter(Boolean), categories: edit.categories.filter((c) => c.name.trim()), active: edit.active })
    setBusy(false); setEdit(null); reload()
  }
  const archive = async (id: string) => { await adminSend('/api/admin/coaching-intelligence', 'POST', { action: 'delete_rubric', id }); reload() }
  const setCat = (i: number, patch: Partial<Cat>) => edit && setEdit({ ...edit, categories: edit.categories.map((c, j) => j === i ? { ...c, ...patch } : c) })

  if (edit) return (
    <Card>
      <div style={{ fontWeight: 800, color: T.ink, marginBottom: 14 }}>{edit.id ? 'Edit' : 'New'} scorecard</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
        <Field label="Name"><Input value={edit.name} onChange={(e) => setEdit({ ...edit, name: e.target.value })} placeholder="e.g. Enterprise Sales Scorecard" /></Field>
        <Field label="Applies to (comma-separated types, blank = all)"><Input value={edit.applies} onChange={(e) => setEdit({ ...edit, applies: e.target.value })} placeholder="sales_call, discovery_call" /></Field>
      </div>
      <div style={{ fontSize: 12.5, fontWeight: 700, color: T.ink, marginBottom: 6 }}>Categories (weight = relative importance; gate = pass/fail requirement)</div>
      {edit.categories.map((c, i) => (
        <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
          <input value={c.name} onChange={(e) => setCat(i, { name: e.target.value })} placeholder="Category" style={{ flex: 1, padding: '9px 12px', borderRadius: 9, border: `1px solid ${T.border}`, fontSize: 14, fontFamily: 'inherit' }} />
          <input type="number" min={1} max={5} value={c.weight} onChange={(e) => setCat(i, { weight: Number(e.target.value) || 1 })} style={{ width: 70, padding: '9px 10px', borderRadius: 9, border: `1px solid ${T.border}`, fontSize: 14, fontFamily: 'inherit' }} />
          <label style={{ fontSize: 12.5, color: T.sub, display: 'flex', alignItems: 'center', gap: 5 }}><input type="checkbox" checked={!!c.pass_fail} onChange={(e) => setCat(i, { pass_fail: e.target.checked })} />gate</label>
          <button onClick={() => setEdit({ ...edit, categories: edit.categories.filter((_, j) => j !== i) })} style={{ border: 'none', background: 'none', color: '#dc2626', cursor: 'pointer', fontSize: 16 }}>×</button>
        </div>
      ))}
      <button onClick={() => setEdit({ ...edit, categories: [...edit.categories, { name: '', weight: 1, pass_fail: false }] })} className="tab-btn" style={{ background: '#fff', border: `1px dashed ${T.border}`, color: T.sub, marginTop: 4 }}>+ Add category</button>
      <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
        <div style={{ maxWidth: 150 }}><Button onClick={save} disabled={busy}>{busy ? 'Saving…' : 'Save scorecard'}</Button></div>
        <div style={{ maxWidth: 110 }}><Button variant="ghost" onClick={() => setEdit(null)}>Cancel</Button></div>
      </div>
    </Card>
  )
  return (
    <div style={{ display: 'grid', gap: 14 }}>
      <Card>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div><div style={{ fontWeight: 800, color: T.ink }}>Custom Review Rubrics</div><p style={{ fontSize: 13.5, color: T.sub, margin: '4px 0 0' }}>Build your own weighted scorecards with pass/fail gates. Every matching call is scored against the rubric automatically.</p></div>
          <div style={{ marginLeft: 'auto', maxWidth: 150 }}><Button onClick={() => setEdit(blank)}>+ New</Button></div>
        </div>
      </Card>
      {loading && !data ? <div className="skeleton" style={{ height: 140, borderRadius: 12 }} /> :
        (data?.rubrics || []).length === 0 ? <EmptyState title="No scorecards yet" hint="Create a Sales or Coaching scorecard." icon="📋" /> :
        <div style={{ display: 'grid', gap: 8 }}>
          {data.rubrics.map((r: any) => (
            <Card key={r.id} pad={16}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, color: T.ink }}>{r.name}</div>
                  <div style={{ fontSize: 12.5, color: T.muted, marginTop: 2 }}>{(r.categories || []).length} categories · {(r.meeting_types || []).length ? (r.meeting_types).map((t: string) => TYPE_LABEL[t] || t).join(', ') : 'all types'}</div>
                </div>
                <Badge text={r.active ? 'active' : 'archived'} color={r.active ? '#16a34a' : T.muted} />
                <button onClick={() => setEdit({ id: r.id, name: r.name, applies: (r.meeting_types || []).join(', '), active: r.active, categories: (r.categories || []).length ? r.categories : [{ name: '', weight: 1 }] })} className="tab-btn" style={{ background: '#fff', border: `1px solid ${T.border}`, color: T.sub, padding: '6px 12px' }}>Edit</button>
                {r.active && <button onClick={() => archive(r.id)} className="tab-btn" style={{ background: '#fff', border: `1px solid ${T.border}`, color: '#dc2626', padding: '6px 12px' }}>Archive</button>}
              </div>
            </Card>
          ))}
        </div>}
    </div>
  )
}

// ── Security & Governance (RBAC + audit + retention/consent) ──
const ROLES = ['owner', 'manager', 'reviewer', 'viewer']
function Security() {
  const { data: me } = useAdminFetch<any>('/api/admin/coaching-intelligence?view=me')
  const caps: string[] = me?.caps || []
  const role: string = me?.role || 'viewer'
  const canRoles = caps.includes('manage_roles'); const canSettings = caps.includes('manage_settings')
  const roles = useAdminFetch<any>(canRoles ? '/api/admin/coaching-intelligence?view=roles' : null)
  const audit = useAdminFetch<any>(canSettings ? '/api/admin/coaching-intelligence?view=audit' : null)
  const [nr, setNr] = useState({ email: '', role: 'reviewer' })
  const [set, setSet] = useState<{ retention_days: number; consent_required: boolean } | null>(null)
  const s = set || me?.settings || { retention_days: 0, consent_required: false }
  const addRole = async () => { if (!nr.email.trim()) return; await adminSend('/api/admin/coaching-intelligence', 'POST', { action: 'set_role', email: nr.email, role: nr.role }); setNr({ email: '', role: 'reviewer' }); roles.reload() }
  const rmRole = async (email: string) => { await adminSend('/api/admin/coaching-intelligence', 'POST', { action: 'remove_role', email }); roles.reload() }
  const saveSettings = async (patch: any) => { const next = { ...s, ...patch }; setSet(next); await adminSend('/api/admin/coaching-intelligence', 'POST', { action: 'update_settings', ...next }) }
  const purge = async () => { const r = await adminSend('/api/admin/coaching-intelligence', 'POST', { action: 'apply_retention' }); alert(r?.ok ? `Purged ${r.purged} old records.` : 'Failed') }

  return (
    <div style={{ display: 'grid', gap: 14 }}>
      <Card>
        <div style={{ fontWeight: 800, color: T.ink, marginBottom: 4 }}>Access control</div>
        <p style={{ fontSize: 13, color: T.sub, marginBottom: 12 }}>Your role: <b style={{ color: T.ink }}>{role}</b>. Roles: owner (full), manager (content, exports, actions), reviewer (analyze & practice), viewer (read-only).</p>
        {canRoles ? (
          <>
            {(roles.data?.roles || []).map((r: any) => (
              <div key={r.email} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 0', borderBottom: `1px solid ${T.border}` }}>
                <span style={{ flex: 1, fontSize: 13.5, color: T.ink }}>{r.email}</span>
                <Badge text={r.role} color={T.green2} />
                <button onClick={() => rmRole(r.email)} style={{ border: 'none', background: 'none', color: '#dc2626', cursor: 'pointer', fontSize: 15 }}>×</button>
              </div>
            ))}
            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <input value={nr.email} onChange={(e) => setNr({ ...nr, email: e.target.value })} placeholder="admin@email.com" style={{ flex: 1, padding: '9px 12px', borderRadius: 9, border: `1px solid ${T.border}`, fontSize: 14, fontFamily: 'inherit' }} />
              <select value={nr.role} onChange={(e) => setNr({ ...nr, role: e.target.value })} style={{ padding: '9px 12px', borderRadius: 9, border: `1px solid ${T.border}`, fontSize: 14, fontFamily: 'inherit' }}>{ROLES.map((r) => <option key={r} value={r}>{r}</option>)}</select>
              <div style={{ maxWidth: 110 }}><Button onClick={addRole}>Assign</Button></div>
            </div>
          </>
        ) : <p style={{ fontSize: 13, color: T.muted }}>Only an owner can manage roles.</p>}
      </Card>

      {canSettings && (
        <Card>
          <div style={{ fontWeight: 800, color: T.ink, marginBottom: 10 }}>Data governance</div>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: T.sub, marginBottom: 12 }}>
            <input type="checkbox" checked={s.consent_required} onChange={(e) => saveSettings({ consent_required: e.target.checked })} />
            Require consent confirmation before ingesting any recording
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 14, color: T.sub }}>Retention: delete meetings older than</span>
            <input type="number" min={0} value={s.retention_days} onChange={(e) => saveSettings({ retention_days: Number(e.target.value) || 0 })} style={{ width: 90, padding: '8px 10px', borderRadius: 9, border: `1px solid ${T.border}`, fontSize: 14, fontFamily: 'inherit' }} />
            <span style={{ fontSize: 14, color: T.sub }}>days (0 = keep forever)</span>
            <div style={{ maxWidth: 150 }}><Button variant="ghost" onClick={purge}>Apply retention now</Button></div>
          </div>
        </Card>
      )}

      {canSettings && (
        <Card>
          <div style={{ fontWeight: 800, color: T.ink, marginBottom: 10 }}>Audit log</div>
          {(audit.data?.audit || []).length === 0 ? <div style={{ fontSize: 13, color: T.muted }}>No activity yet.</div> :
            <div style={{ maxHeight: 300, overflowY: 'auto' }}>{audit.data.audit.map((a: any) => (
              <div key={a.id} style={{ display: 'flex', gap: 10, fontSize: 12.5, color: T.sub, padding: '5px 0', borderBottom: `1px solid ${T.border}` }}>
                <span style={{ color: T.muted, whiteSpace: 'nowrap' }}>{String(a.at).slice(0, 16).replace('T', ' ')}</span>
                <span style={{ fontWeight: 700, color: T.ink }}>{a.action}</span>
                <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.target_type || ''} {a.target_id || ''}</span>
                <span style={{ color: T.muted }}>{a.actor}</span>
              </div>
            ))}</div>}
        </Card>
      )}
    </div>
  )
}

// ── Connections hub (one-click connect apps) ───────────────
const CAT_LABEL: Record<string, string> = { calls: 'Call recording', calendar: 'Calendars', payments: 'Payments' }
const APP_ICON: Record<string, string> = { fathom: '🎧', fireflies: '🔥', zoom: '📹', google_calendar: '📆', calendly: '🗓️', cal_com: '📅', stripe: '💳', whop: '🛍️', paypal: '🅿️' }
function Connections() {
  const { data, loading, reload } = useAdminFetch<any>('/api/admin/coaching-intelligence?view=connections')
  const [keyFor, setKeyFor] = useState<string | null>(null); const [keyVal, setKeyVal] = useState(''); const [busy, setBusy] = useState('')
  const [flash, setFlash] = useState('')
  useEffect(() => {
    const p = new URLSearchParams(window.location.search)
    if (p.get('connected')) { setFlash(`Connected ${p.get('connected')} ✓`); reload() }
    else if (p.get('connect_error')) setFlash(p.get('connect_error') || '')
    if (p.get('connected') || p.get('connect_error')) window.history.replaceState({}, '', window.location.pathname)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps
  const conns = (data?.connections || []) as any[]
  const connect = (c: any) => { if (c.method === 'oauth') { window.location.href = `/api/admin/coaching-intelligence/oauth/${c.key}` } else { setKeyFor(c.key); setKeyVal('') } }
  const saveKey = async (key: string) => { setBusy(key); const r = await adminSend('/api/admin/coaching-intelligence', 'POST', { action: 'save_connection', provider: key, api_key: keyVal }); setBusy(''); if (r?.ok) { setKeyFor(null); reload() } else setFlash(r?.error || 'Failed') }
  const disc = async (key: string) => { await adminSend('/api/admin/coaching-intelligence', 'POST', { action: 'disconnect_app', provider: key }); reload() }

  return (
    <Card>
      <div style={{ fontWeight: 800, color: T.ink, marginBottom: 4 }}>Connections</div>
      <p style={{ fontSize: 13.5, color: T.sub, marginBottom: 12 }}>Connect the apps you already use, one click each. Your calls, calendar and payments flow into Coaching Intelligence automatically.</p>
      {flash && <div style={{ fontSize: 13, color: flash.includes('✓') ? '#16a34a' : '#dc2626', marginBottom: 12 }}>{flash}</div>}
      {loading && !data ? <div className="skeleton" style={{ height: 180, borderRadius: 12 }} /> : (
        ['calls', 'calendar', 'payments'].map((cat) => (
          <div key={cat} style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 11.5, fontWeight: 700, color: T.muted, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 8 }}>{CAT_LABEL[cat]}</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: 10 }}>
              {conns.filter((c) => c.category === cat).map((c) => (
                <div key={c.key} style={{ border: `1px solid ${T.border}`, borderRadius: 12, padding: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                    <span style={{ fontSize: 20 }}>{APP_ICON[c.key] || '🔌'}</span>
                    <span style={{ fontWeight: 700, color: T.ink, flex: 1 }}>{c.label}</span>
                    {c.status === 'connected'
                      ? <Badge text="connected" color="#16a34a" />
                      : c.method === 'oauth' && !c.configured ? <Badge text="setup needed" color={T.muted} /> : null}
                  </div>
                  {keyFor === c.key ? (
                    <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
                      <input value={keyVal} onChange={(e) => setKeyVal(e.target.value)} placeholder={c.keyHint || 'Paste key'} style={{ flex: 1, padding: '8px 10px', borderRadius: 8, border: `1px solid ${T.border}`, fontSize: 13, fontFamily: 'inherit' }} />
                      <button onClick={() => saveKey(c.key)} disabled={busy === c.key} className="tab-btn" style={{ background: T.green2, color: '#fff', border: 'none', padding: '7px 12px' }}>{busy === c.key ? '…' : 'Save'}</button>
                    </div>
                  ) : (
                    <div style={{ marginTop: 10, display: 'flex', gap: 8 }}>
                      {c.status === 'connected'
                        ? <button onClick={() => disc(c.key)} className="tab-btn" style={{ background: '#fff', border: `1px solid ${T.border}`, color: '#dc2626', padding: '7px 14px' }}>Disconnect</button>
                        : <button onClick={() => connect(c)} className="tab-btn" style={{ background: T.green2, color: '#fff', border: 'none', padding: '7px 16px' }}>Connect</button>}
                    </div>
                  )}
                  {c.method === 'oauth' && !c.configured && c.status !== 'connected' && <div style={{ fontSize: 11, color: T.muted, marginTop: 6 }}>Your tech team adds this app&apos;s keys once, then it&apos;s one click.</div>}
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </Card>
  )
}

function Scaffold({ title, body }: { title: string; body: string }) {
  return <Card><div style={{ fontWeight: 800, color: T.ink, marginBottom: 8 }}>{title}</div><p style={{ fontSize: 14, color: T.sub, lineHeight: 1.6 }}>{body}</p></Card>
}
