'use client'
/* CRM · Meeting detail — overview, participants, recording, transcript, AI
   summary, action items, notes, tasks, related contact/opportunity. */
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { T, Card, Button, Textarea, Input, Avatar, EmptyState, useAdminFetch, adminSend, fmtDate } from '@/components/admin/ui'

type Row = Record<string, unknown>

export default function MeetingDetail() {
  const { id } = useParams<{ id: string }>()
  const { data, loading, reload } = useAdminFetch<{ meeting: Row; tasks: Row[] }>(`/api/admin/crm/meetings/${id}`)
  const [notes, setNotes] = useState('')
  const [share, setShare] = useState('')
  const [busy, setBusy] = useState(false)
  useEffect(() => { if (data?.meeting) { setNotes((data.meeting.notes as string) || ''); setShare((data.meeting.fathom_share_url as string) || '') } }, [data])

  if (loading && !data) return <div className="skeleton" style={{ height: 200, borderRadius: 14 }} />
  if (!data?.meeting) return <EmptyState title="Meeting not found" />
  const m = data.meeting
  const contact = (m.contact as Row) || {}
  const opp = (m.opportunity as Row) || null
  const actionItems = (m.action_items as unknown[]) || []
  const topics = (m.key_topics as unknown[]) || []
  const questions = (m.questions as unknown[]) || []

  const saveNotes = async () => { setBusy(true); try { await adminSend(`/api/admin/crm/meetings/${id}`, 'PATCH', { notes }); reload() } finally { setBusy(false) } }
  const saveShare = async () => { setBusy(true); try { await adminSend(`/api/admin/crm/meetings/${id}`, 'PATCH', { fathom_share_url: share }); reload() } finally { setBusy(false) } }

  return (
    <>
      <Link href="/admin/crm/meetings" style={{ fontSize: 13, color: T.sub, textDecoration: 'none' }}>← Meeting Center</Link>
      <Card style={{ marginTop: 12, marginBottom: 18 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 14 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: T.ink }}>{(m.title as string) || 'Meeting'}</h1>
            <div style={{ fontSize: 14, color: T.sub, marginTop: 4, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              <span>{m.starts_at ? new Date(m.starts_at as string).toLocaleString() : '—'}</span>
              {m.duration_min ? <span>· {m.duration_min as number} min</span> : null}
              <span style={{ textTransform: 'capitalize' }}>· {m.provider as string}</span>
              <span style={{ textTransform: 'capitalize' }}>· {(m.status as string).replace('_', ' ')}</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            {m.join_url ? <a className="a-btn a-btn-ghost" href={m.join_url as string} target="_blank" rel="noreferrer">Join</a> : null}
            {(m.recording_url || m.fathom_share_url) ? <a className="a-btn a-btn-primary" href={(m.fathom_share_url || m.recording_url) as string} target="_blank" rel="noreferrer">🎥 Recording</a> : null}
          </div>
        </div>
      </Card>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 18, alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {m.summary ? <Card><h3 style={sec}>AI Summary</h3><div style={{ fontSize: 14, color: T.text, whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>{m.summary as string}</div></Card> : null}
          {actionItems.length > 0 && <Card><h3 style={sec}>Action items</h3>{actionItems.map((a, i) => <div key={i} style={{ fontSize: 14, color: T.text, padding: '5px 0' }}>☐ {typeof a === 'string' ? a : JSON.stringify(a)}</div>)}</Card>}
          {topics.length > 0 && <Card><h3 style={sec}>Key topics</h3><div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>{topics.map((t, i) => <span key={i} className="a-pill" style={{ background: '#eef2f0', color: T.green }}>{String(typeof t === 'string' ? t : (t as Row).name || '')}</span>)}</div></Card>}
          {questions.length > 0 && <Card><h3 style={sec}>Questions asked</h3>{questions.map((q, i) => <div key={i} style={{ fontSize: 14, color: T.text, padding: '4px 0' }}>? {typeof q === 'string' ? q : JSON.stringify(q)}</div>)}</Card>}
          {m.transcript ? <Card><h3 style={sec}>Transcript</h3><div style={{ fontSize: 13, color: T.sub, whiteSpace: 'pre-wrap', maxHeight: 320, overflowY: 'auto', lineHeight: 1.6 }}>{m.transcript as string}</div></Card> : null}
          <Card>
            <h3 style={sec}>Notes</h3>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Meeting / call notes…" />
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 10 }}><Button disabled={busy} onClick={saveNotes}>Save notes</Button></div>
          </Card>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {contact.id ? (
            <Card>
              <h3 style={sec}>Contact</h3>
              <Link href={`/admin/crm/${contact.id}`} style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
                <Avatar name={contact.name as string} email={contact.email as string} size={38} />
                <div><div style={{ fontSize: 14, fontWeight: 600, color: T.ink }}>{(contact.name as string) || (contact.email as string)}</div><div style={{ fontSize: 12, color: T.green }}>View contact →</div></div>
              </Link>
            </Card>
          ) : null}
          {opp ? <Card><h3 style={sec}>Opportunity</h3><div style={{ fontSize: 14, fontWeight: 600, color: T.ink }}>{opp.name as string}</div><div style={{ fontSize: 13, color: T.green }}>${Number(opp.value || 0).toLocaleString()}</div></Card> : null}
          <Card>
            <h3 style={sec}>Tasks</h3>
            {(data.tasks || []).length === 0 ? <div style={{ fontSize: 13, color: T.muted }}>No tasks</div> : data.tasks.map((t) => (
              <div key={t.id as string} style={{ fontSize: 13, color: T.text, padding: '4px 0' }}>{t.status === 'done' ? '✓' : '☐'} {t.title as string} {t.due_date ? <span style={{ color: T.muted }}>· {fmtDate(t.due_date as string)}</span> : null}</div>
            ))}
          </Card>
          {!m.summary && !m.transcript && (
            <Card>
              <h3 style={sec}>Attach recording</h3>
              <div style={{ fontSize: 12, color: T.sub, marginBottom: 8 }}>Paste a Fathom/recording share link (auto-attaches via cron once FATHOM_API_KEY is set).</div>
              <Input value={share} onChange={(e) => setShare(e.target.value)} placeholder="https://fathom.video/…" />
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 10 }}><Button disabled={busy} onClick={saveShare}>Attach</Button></div>
            </Card>
          )}
        </div>
      </div>
    </>
  )
}

const sec: React.CSSProperties = { fontSize: 12, fontWeight: 700, letterSpacing: '.05em', color: T.green, textTransform: 'uppercase', marginBottom: 12 }
