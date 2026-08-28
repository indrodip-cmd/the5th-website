'use client'
/* Workbook Buyers — everyone who bought The Knowledge Asset, where each one is
   in the 7-day AI-trial nurture, and their live quiz + call-booked status.
   Data: /api/admin/workbook (admin-only). Buyers are also mirrored into the CRM
   (Contacts, tagged "Workbook Buyer", with a purchase on their timeline). */
import { useMemo, useState } from 'react'
import { T, Card, PageHeader, Input, EmptyState, ErrorState, useAdminFetch, fmtDate, Avatar, Drawer, adminSend } from '@/components/admin/ui'

type Step = { key: string; day: number; subject: string; sent_at: string | null }
type Buyer = {
  email: string; name: string | null; source: string | null
  purchased_at: string | null; trial_ends_at: string | null
  quiz_taken: boolean; call_booked: boolean; unsubscribed: boolean
  day: number; trial_left: number; trial_active: boolean
  sent_count: number; total_emails: number; last_email_at: string | null; sent_keys: string[]
  timeline: Step[]
}
type Stats = { total: number; trial_active: number; quiz_taken: number; call_booked: number; unsubscribed: number; emails_sent: number; live: boolean }
type Resp = { buyers: Buyer[]; stats: Stats; sequence: { key: string; day: number; subject: string }[] }

function Stat({ label, value, accent }: { label: string; value: React.ReactNode; accent?: string }) {
  return (
    <Card pad={18} style={{ flex: '1 1 150px', minWidth: 150 }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: T.sub, textTransform: 'uppercase', letterSpacing: '.04em' }}>{label}</div>
      <div style={{ fontSize: 26, fontWeight: 800, color: accent || T.ink, marginTop: 6, letterSpacing: '-.01em' }}>{value}</div>
    </Card>
  )
}

const Tick = ({ on }: { on: boolean }) =>
  on ? <span style={{ color: T.green, fontWeight: 800 }}>✓</span> : <span style={{ color: T.muted }}>—</span>

export default function WorkbookBuyersPage() {
  const { data, loading, error, reload } = useAdminFetch<Resp>('/api/admin/workbook')
  const [q, setQ] = useState('')
  const [sel, setSel] = useState<Buyer | null>(null)
  const [busy, setBusy] = useState<string | null>(null)
  const [note, setNote] = useState<string | null>(null)

  async function preview() {
    if (!confirm('Send all 8 campaign emails to your own inbox for proofing? (These are marked as previews and do not affect any buyer.)')) return
    setBusy('preview'); setNote(null)
    try { const r = await adminSend('/api/admin/workbook/send', 'POST', { action: 'preview' }); setNote(`✓ Sent the full ${r.sent}-email preview to ${r.to}.`) }
    catch (e) { setNote(`Couldn't send preview: ${String(e)}`) }
    finally { setBusy(null) }
  }

  async function sendToBuyer(email: string, key: string, label: string) {
    if (!confirm(`Send "${label}" to ${email} now? This is a real email.`)) return
    setBusy(key); setNote(null)
    try {
      const r = await adminSend('/api/admin/workbook/send', 'POST', { action: 'send', email, key })
      setNote(r.done ? 'All emails have already been sent to this buyer.' : `✓ Sent "${r.subject || label}" to ${email}.`)
      reload()
    } catch (e) { setNote(`Send failed: ${String(e)}`) }
    finally { setBusy(null) }
  }

  const buyers = useMemo(() => {
    const list = data?.buyers || []
    const term = q.trim().toLowerCase()
    if (!term) return list
    return list.filter((b) => `${b.email} ${b.name || ''}`.toLowerCase().includes(term))
  }, [data, q])

  const s = data?.stats

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '4px 4px 60px' }}>
      <PageHeader
        title="Workbook Buyers"
        subtitle="The Knowledge Asset · post-purchase 7-day AI-trial nurture"
        actions={<>
          <button className="a-btn a-btn-ghost" onClick={preview} disabled={busy === 'preview'}>{busy === 'preview' ? 'Sending…' : '✉ Email me the 8-email preview'}</button>
          <button className="a-btn a-btn-ghost" onClick={reload}>Refresh</button>
        </>}
      />

      {note && (
        <Card pad={12} style={{ marginBottom: 16, background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
          <div style={{ fontSize: 13.5, color: '#166534', display: 'flex', justifyContent: 'space-between', gap: 12 }}>
            <span>{note}</span>
            <button onClick={() => setNote(null)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#166534' }}>×</button>
          </div>
        </Card>
      )}

      {s && !s.live && (
        <Card pad={16} style={{ marginBottom: 18, background: '#fffbeb', border: '1px solid #fde68a' }}>
          <div style={{ fontSize: 14, color: '#92400e' }}>
            <b>Campaign paused.</b> Buyers are being recorded, but no emails send until you set <code style={{ background: '#fef3c7', padding: '1px 6px', borderRadius: 5 }}>WORKBOOK_CAMPAIGN_LIVE=true</code> in Vercel. The daily cron will then catch everyone up.
          </div>
        </Card>
      )}
      {s && s.live && (
        <Card pad={12} style={{ marginBottom: 18, background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
          <div style={{ fontSize: 13.5, color: '#166534', fontWeight: 600 }}>● Campaign live — sending daily.</div>
        </Card>
      )}

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 18 }}>
        <Stat label="Buyers" value={s?.total ?? '—'} />
        <Stat label="In trial" value={s?.trial_active ?? '—'} accent={T.green} />
        <Stat label="Quiz taken" value={s?.quiz_taken ?? '—'} />
        <Stat label="Calls booked" value={s?.call_booked ?? '—'} accent={T.green} />
        <Stat label="Emails sent" value={s?.emails_sent ?? '—'} />
        <Stat label="Unsubscribed" value={s?.unsubscribed ?? '—'} accent={s?.unsubscribed ? T.danger : undefined} />
      </div>

      <Card pad={0}>
        {loading ? (
          <div style={{ padding: 20 }}>{[0, 1, 2, 3].map((i) => <div key={i} className="skeleton" style={{ height: 46, marginBottom: 8 }} />)}</div>
        ) : error ? (
          <ErrorState message={error} onRetry={reload} />
        ) : !buyers.length ? (
          <EmptyState icon="📕" title={q ? 'No matching buyers' : 'No buyers yet'} hint={q ? 'Try a different search.' : 'Buyers of The Knowledge Asset will appear here after checkout.'} />
        ) : (
          <>
            <div style={{ padding: '14px 16px', borderBottom: `1px solid ${T.border}` }}>
              <Input placeholder="Search by name or email…" value={q} onChange={(e) => setQ(e.target.value)} style={{ maxWidth: 340 }} />
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13.5, minWidth: 820 }}>
                <thead>
                  <tr style={{ textAlign: 'left', color: T.sub, fontSize: 11.5, textTransform: 'uppercase', letterSpacing: '.05em' }}>
                    {['Buyer', 'Purchased', 'Trial', 'Quiz', 'Call', 'Sequence', 'Last email'].map((h) => (
                      <th key={h} style={{ padding: '11px 16px', fontWeight: 700, borderBottom: `1px solid ${T.border}`, whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {buyers.map((b) => (
                    <tr key={b.email} className="admin-row" onClick={() => setSel(b)} style={{ borderBottom: `1px solid ${T.border}`, cursor: 'pointer' }}>
                      <td style={{ padding: '11px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <Avatar name={b.name} email={b.email} size={32} />
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontWeight: 700, color: T.ink }}>{b.name || b.email.split('@')[0]}</div>
                            <div style={{ color: T.sub, fontSize: 12, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 220 }}>{b.email}</div>
                          </div>
                          {b.unsubscribed && <span style={{ fontSize: 10.5, fontWeight: 700, color: T.danger, background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 999, padding: '2px 8px' }}>UNSUB</span>}
                        </div>
                      </td>
                      <td style={{ padding: '11px 16px', color: T.sub, whiteSpace: 'nowrap' }}>{fmtDate(b.purchased_at)}</td>
                      <td style={{ padding: '11px 16px', whiteSpace: 'nowrap' }}>
                        <span style={{ fontWeight: 700, color: T.ink }}>Day {b.day}</span>
                        <span style={{ marginLeft: 8, fontSize: 11.5, fontWeight: 700, color: b.trial_active ? '#166534' : T.muted, background: b.trial_active ? '#f0fdf4' : '#f4f5f4', border: `1px solid ${b.trial_active ? '#bbf7d0' : T.border}`, borderRadius: 999, padding: '2px 8px' }}>
                          {b.trial_active ? `${b.trial_left}d left` : 'Trial ended'}
                        </span>
                      </td>
                      <td style={{ padding: '11px 16px', textAlign: 'center' }}><Tick on={b.quiz_taken} /></td>
                      <td style={{ padding: '11px 16px', textAlign: 'center' }}><Tick on={b.call_booked} /></td>
                      <td style={{ padding: '11px 16px', minWidth: 130 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ flex: 1, height: 6, background: T.border, borderRadius: 999, overflow: 'hidden', minWidth: 60 }}>
                            <div style={{ height: '100%', width: `${Math.round((b.sent_count / b.total_emails) * 100)}%`, background: `linear-gradient(90deg,${T.green},${T.green2})`, borderRadius: 999 }} />
                          </div>
                          <span style={{ fontSize: 12, color: T.sub, fontWeight: 600, whiteSpace: 'nowrap' }}>{b.sent_count}/{b.total_emails}</span>
                        </div>
                      </td>
                      <td style={{ padding: '11px 16px', color: T.sub, whiteSpace: 'nowrap' }}>{b.last_email_at ? fmtDate(b.last_email_at) : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </Card>

      {/* Buyer drawer — details, email timeline, and manual sends */}
      <Drawer open={!!sel} onClose={() => setSel(null)} width={460}>
        {sel && (
          <div style={{ padding: 22 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
              <Avatar name={sel.name} email={sel.email} size={44} />
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: T.ink }}>{sel.name || sel.email.split('@')[0]}</div>
                <div style={{ fontSize: 13, color: T.sub }}>{sel.email}</div>
              </div>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, margin: '14px 0 4px' }}>
              <Pill label={`Day ${sel.day}`} />
              <Pill label={sel.trial_active ? `${sel.trial_left}d of trial left` : 'Trial ended'} tone={sel.trial_active ? 'green' : 'muted'} />
              <Pill label={sel.quiz_taken ? 'Quiz taken' : 'No quiz'} tone={sel.quiz_taken ? 'green' : 'muted'} />
              <Pill label={sel.call_booked ? 'Call booked' : 'No call'} tone={sel.call_booked ? 'green' : 'muted'} />
              {sel.unsubscribed && <Pill label="Unsubscribed" tone="danger" />}
            </div>
            <div style={{ fontSize: 12.5, color: T.sub, marginTop: 8 }}>Purchased {fmtDate(sel.purchased_at)} · {sel.sent_count}/{sel.total_emails} emails sent</div>

            <div style={{ display: 'flex', gap: 8, margin: '18px 0 20px', flexWrap: 'wrap' }}>
              <button className="a-btn" style={{ width: 'auto', padding: '10px 16px' }} disabled={!!busy} onClick={() => sendToBuyer(sel.email, 'next', 'next due email')}>
                {busy === 'next' ? 'Sending…' : '↦ Send next email now'}
              </button>
            </div>

            <div style={{ fontSize: 11.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.05em', color: T.sub, marginBottom: 10 }}>Email sequence</div>
            <div style={{ display: 'grid', gap: 8 }}>
              {sel.timeline.map((step) => (
                <div key={step.key} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', border: `1px solid ${T.border}`, borderRadius: 10, background: step.sent_at ? '#f0fdf4' : T.card }}>
                  <div style={{ width: 26, height: 26, borderRadius: 8, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, color: step.sent_at ? '#166534' : T.muted, background: step.sent_at ? '#dcfce7' : '#f4f5f4' }}>{step.sent_at ? '✓' : `D${step.day}`}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: T.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{step.subject}</div>
                    <div style={{ fontSize: 11.5, color: T.sub }}>{step.sent_at ? `Sent ${fmtDate(step.sent_at)}` : `Day ${step.day} · not sent`}</div>
                  </div>
                  <button className="a-btn a-btn-ghost" style={{ width: 'auto', padding: '6px 12px', fontSize: 12.5 }} disabled={busy === step.key} onClick={() => sendToBuyer(sel.email, step.key, step.subject)}>
                    {busy === step.key ? '…' : step.sent_at ? 'Resend' : 'Send'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </Drawer>
    </div>
  )
}

function Pill({ label, tone = 'ink' }: { label: string; tone?: 'ink' | 'green' | 'muted' | 'danger' }) {
  const map: Record<string, { c: string; bg: string; bd: string }> = {
    ink: { c: T.ink, bg: '#f4f5f4', bd: T.border },
    green: { c: '#166534', bg: '#f0fdf4', bd: '#bbf7d0' },
    muted: { c: T.muted, bg: '#f9fafb', bd: T.border },
    danger: { c: T.danger, bg: '#fef2f2', bd: '#fecaca' },
  }
  const s = map[tone]
  return <span style={{ fontSize: 12, fontWeight: 700, color: s.c, background: s.bg, border: `1px solid ${s.bd}`, borderRadius: 999, padding: '3px 10px' }}>{label}</span>
}
