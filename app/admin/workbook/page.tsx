'use client'
/* Workbook Buyers — everyone who bought The Knowledge Asset, where each one is
   in the 7-day AI-trial nurture, and their live quiz + call-booked status.
   Data: /api/admin/workbook (admin-only). Buyers are also mirrored into the CRM
   (Contacts, tagged "Workbook Buyer", with a purchase on their timeline). */
import { useMemo, useState } from 'react'
import { T, Card, PageHeader, Input, EmptyState, ErrorState, useAdminFetch, fmtDate, Avatar } from '@/components/admin/ui'

type Buyer = {
  email: string; name: string | null; source: string | null
  purchased_at: string | null; trial_ends_at: string | null
  quiz_taken: boolean; call_booked: boolean; unsubscribed: boolean
  day: number; trial_left: number; trial_active: boolean
  sent_count: number; total_emails: number; last_email_at: string | null; sent_keys: string[]
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
        actions={<button className="a-btn a-btn-ghost" onClick={reload}>Refresh</button>}
      />

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
                    <tr key={b.email} className="admin-row" style={{ borderBottom: `1px solid ${T.border}` }}>
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
    </div>
  )
}
