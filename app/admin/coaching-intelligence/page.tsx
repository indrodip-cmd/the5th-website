'use client'
/* AI Coaching Intelligence — admin-only Business Intelligence module.
   Connect meetings → ingest transcripts → classify → AI evaluation (DPC + type
   specific) → living customer profiles + health → AI Success Coach. */
import { useState, type ReactNode } from 'react'
import { T, Card, PageHeader, Button, Input, Textarea, Select, Field, EmptyState, useAdminFetch, adminSend } from '@/components/admin/ui'

const TYPES = [
  ['discovery_call', 'Discovery Call'], ['sales_call', 'Sales Call'], ['strategy_call', 'Strategy Call'],
  ['coaching_session', 'Coaching Session'], ['onboarding_call', 'Onboarding Call'], ['customer_success_review', 'Customer Success Review'],
  ['support_call', 'Support Call'], ['accountability_call', 'Accountability Call'], ['renewal_call', 'Renewal Call'],
  ['team_meeting', 'Team Meeting'], ['internal_meeting', 'Internal Meeting'], ['other', 'Other'],
]
const TYPE_LABEL: Record<string, string> = Object.fromEntries(TYPES)
const TABS = ['Dashboard', 'Meeting Intelligence', 'Call Reviews', 'Customer Intelligence', 'Success Plans', 'Knowledge Library', 'Reports', 'Settings']
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
      {tab === 'Success Plans' && <Scaffold title="Success Plans" body="Per-customer 30/60/90-day success plans generated from their goals, health score and meeting history. Wired to the same profiles you see under Customer Intelligence." />}
      {tab === 'Knowledge Library' && <Scaffold title="Knowledge Library" body="A searchable library of winning calls, objection responses and coaching questions surfaced from analyzed meetings. Uploads already flow into each customer's Knowledge Vault under Customer Intelligence." />}
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
  const [f, setF] = useState({ title: '', meeting_type: 'sales_call', contact_name: '', contact_email: '', meeting_date: '', transcript: '' })
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')

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
        <Field label="Transcript"><Textarea rows={6} value={f.transcript} onChange={(e) => setF({ ...f, transcript: e.target.value })} placeholder="Paste the full transcript (from Fathom, Fireflies, Otter, Zoom, etc.)…" /></Field>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 12 }}>
          <div style={{ maxWidth: 220 }}><Button onClick={ingest} disabled={busy}>{busy ? 'Analyzing…' : 'Ingest & analyze'}</Button></div>
          {msg && <span style={{ fontSize: 13, color: T.sub }}>{msg}</span>}
          <span style={{ fontSize: 12, color: T.muted, marginLeft: 'auto' }}>Provider auto-import (Fathom, Fireflies…) is configured under Settings.</span>
        </div>
      </Card>

      <Card>
        <div style={{ fontWeight: 800, color: T.ink, marginBottom: 12 }}>Meetings</div>
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
        <div style={{ maxWidth: 150 }}><Button variant="ghost" onClick={reanalyze} disabled={busy}>{busy ? '…' : 'Re-analyze'}</Button></div>
      </div>
      {m.status !== 'analyzed' ? <EmptyState title="Not analyzed yet" hint="Click Re-analyze to run the AI review." icon="🧠" /> : (
        <>
          {a.executive_summary && <Card><div style={{ fontWeight: 800, color: T.ink, marginBottom: 8 }}>Executive summary</div><p style={{ color: T.sub, lineHeight: 1.6, fontSize: 14.5 }}>{a.executive_summary}</p>{a.why_outcome && <p style={{ color: T.sub, lineHeight: 1.6, fontSize: 14, marginTop: 10 }}><b style={{ color: T.ink }}>Why this outcome: </b>{a.why_outcome}</p>}</Card>}
          {a.dpc && <Card><div style={{ fontWeight: 800, color: T.ink, marginBottom: 10 }}>DPC framework</div>{['diagnose', 'prescribe', 'close'].map((k) => a.dpc[k] && <p key={k} style={{ fontSize: 14, color: T.sub, marginBottom: 8, lineHeight: 1.55 }}><b style={{ color: T.ink, textTransform: 'capitalize' }}>{k}: </b>{a.dpc[k]}</p>)}</Card>}
          {Object.keys(scores).length > 0 && <Card><div style={{ fontWeight: 800, color: T.ink, marginBottom: 12 }}>Scores</div><div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: '0 24px' }}>{Object.entries(scores).map(([k, v]) => <Bar key={k} label={k} v={v} />)}</div></Card>}
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
  const { data, loading } = useAdminFetch<any>('/api/admin/coaching-intelligence?view=profiles')
  if (loading && !data) return <div className="skeleton" style={{ height: 200, borderRadius: 14 }} />
  const rows = data?.profiles || []
  if (rows.length === 0) return <EmptyState title="No customer profiles yet" hint="Profiles build automatically as you ingest and analyze meetings." icon="👤" />
  return (
    <div style={{ display: 'grid', gap: 8 }}>
      {rows.map((p: any) => (
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
  if (loading && !data) return <div className="skeleton" style={{ height: 300, borderRadius: 14 }} />
  return (
    <div style={{ display: 'grid', gap: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={onBack} className="tab-btn" style={{ background: '#fff', border: `1px solid ${T.border}`, color: T.sub }}>← Back</button>
        <div style={{ fontWeight: 800, color: T.ink, fontSize: 18 }}>{data?.profile?.name || ckey}</div>
        {data?.profile?.risk && <Badge text={data.profile.risk} color={RISK_COLOR[data.profile.risk] || T.muted} />}
        <span style={{ marginLeft: 'auto', fontSize: 13, color: T.sub }}>Health <b style={{ color: T.ink }}>{data?.profile?.health_score ?? '—'}</b> · Engagement <b style={{ color: T.ink }}>{data?.profile?.engagement_score ?? '—'}</b> · Success <b style={{ color: T.ink }}>{data?.profile?.success_probability ?? '—'}%</b></span>
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
          <Card><div style={{ fontWeight: 800, color: T.ink, marginBottom: 8 }}>Knowledge Vault</div>
            <Input value={doc.name} onChange={(e) => setDoc({ ...doc, name: e.target.value })} placeholder="Document name" />
            <div style={{ height: 8 }} /><Textarea rows={3} value={doc.text} onChange={(e) => setDoc({ ...doc, text: e.target.value })} placeholder="Paste homework, notes, support chat, contract text…" />
            <div style={{ maxWidth: 160, marginTop: 8 }}><Button variant="ghost" onClick={addDoc} disabled={savingDoc}>{savingDoc ? 'Saving…' : 'Add to vault'}</Button></div>
            {(data?.docs || []).length > 0 && <div style={{ marginTop: 10 }}>{data.docs.map((d: any) => <div key={d.id} style={{ fontSize: 12.5, color: T.muted, padding: '3px 0' }}>📄 {d.name}</div>)}</div>}
          </Card>
        </div>
      </div>
    </div>
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
  const providers = ['Fathom', 'Fireflies.ai', 'Grain', 'Otter.ai', 'Read.ai', 'Zoom Recording', 'Google Meet Recording', 'Manual / Video / Audio Upload']
  return (
    <div style={{ display: 'grid', gap: 14 }}>
      <Card><div style={{ fontWeight: 800, color: T.ink, marginBottom: 6 }}>Meeting providers</div>
        <p style={{ fontSize: 13.5, color: T.sub, marginBottom: 14 }}>Connect one or more providers to auto-import transcripts. Fathom uses the existing platform integration; others are on the roadmap. Manual transcript paste works today under Meeting Intelligence.</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 10 }}>
          {providers.map((p) => <div key={p} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', border: `1px solid ${T.border}`, borderRadius: 12 }}><span style={{ fontSize: 14, color: T.ink, fontWeight: 600 }}>{p}</span><Badge text={p === 'Fathom' ? 'available' : 'soon'} color={p === 'Fathom' ? '#16a34a' : T.muted} /></div>)}
        </div>
      </Card>
      <Card><div style={{ fontWeight: 800, color: T.ink, marginBottom: 6 }}>Security & access</div>
        <p style={{ fontSize: 13.5, color: T.sub, lineHeight: 1.6 }}>This module is admin-only and hidden behind the <b>coaching_intelligence</b> feature flag until you release it. All API routes are cookie-authed to admins, data is stored in your Supabase (encrypted at rest) and served over TLS. Consent and retention controls for imported recordings are on the roadmap.</p>
      </Card>
    </div>
  )
}

function Scaffold({ title, body }: { title: string; body: string }) {
  return <Card><div style={{ fontWeight: 800, color: T.ink, marginBottom: 8 }}>{title}</div><p style={{ fontSize: 14, color: T.sub, lineHeight: 1.6 }}>{body}</p></Card>
}
