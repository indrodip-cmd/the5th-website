'use client'
/* Platform Super Admin (migrated from ~/the5th-platform's embedded AdminPanel).
   Ten tabs of platform product control — members, credits, courses, pricing,
   zoom, onboarding, security, training, whop, blueprints — all backed by
   cookie-gated /api/admin/platform/* routes writing the shared Supabase DB. */
import { useMemo, useState } from 'react'
import { T, Card, Button, Input, Select, Textarea, Field, PageHeader, EmptyState, useAdminFetch, adminSend, fmtDate } from '@/components/admin/ui'

type Row = Record<string, unknown>
const TIERS = ['free', 'book_only', 'course_only', 'member_monthly', 'member_yearly', 'ai_only', 'ai_trial']
const TIER_LABEL: Record<string, string> = {
  free: 'Free', book_only: 'Book Access', course_only: 'Course Access',
  member_monthly: 'Monthly Member', member_yearly: 'Yearly Member', admin: 'Admin',
  ai_only: 'The5th AI', ai_trial: 'Free Trial',
}
const TABS = ['members', 'credits', 'courses', 'pricing', 'zoom', 'onboarding', 'security', 'training', 'whop', 'blueprints'] as const
type Tab = typeof TABS[number]
const TAB_LABEL: Record<Tab, string> = {
  members: 'Members', credits: 'Credits', courses: 'Courses', pricing: 'Pricing', zoom: 'Zoom',
  onboarding: 'Onboarding', security: 'Security', training: 'AI Training', whop: 'Whop', blueprints: 'Blueprints',
}

export default function PlatformAdmin() {
  const [tab, setTab] = useState<Tab>('members')
  return (
    <>
      <PageHeader title="Platform Control" subtitle="Super-admin control of the member platform — product, members, and the AI brain" />
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 18 }}>
        {TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)}
            style={{ padding: '7px 14px', borderRadius: 9, border: `1px solid ${tab === t ? T.green : T.border}`, background: tab === t ? T.green : '#fff', color: tab === t ? '#fff' : T.sub, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            {TAB_LABEL[t]}
          </button>
        ))}
      </div>
      {tab === 'members' && <MembersTab />}
      {tab === 'credits' && <CreditsTab />}
      {tab === 'courses' && <CoursesTab />}
      {tab === 'pricing' && <PricingTab />}
      {tab === 'zoom' && <JsonSettingTab settingKey="zoom" title="Zoom settings" hint="Coaching-call Zoom configuration (link, passcode, host key, etc.)." />}
      {tab === 'onboarding' && <JsonSettingTab settingKey="onboarding" title="Onboarding settings" hint="New-member onboarding flow configuration." />}
      {tab === 'security' && <SecurityTab />}
      {tab === 'training' && <TrainingTab />}
      {tab === 'whop' && <WhopTab />}
      {tab === 'blueprints' && <BlueprintsTab />}
    </>
  )
}

function Msg({ text }: { text: string }) {
  if (!text) return null
  return <div style={{ fontSize: 12.5, color: T.green, marginTop: 8 }}>{text}</div>
}

// ── Members ──────────────────────────────────────────────────────────
function MembersTab() {
  const { data, loading, reload } = useAdminFetch<{ members: Row[] }>('/api/admin/platform/members')
  const [q, setQ] = useState('')
  const [nm, setNm] = useState({ full_name: '', email: '', tier: 'member_monthly' })
  const [busy, setBusy] = useState('')
  const members = useMemo(() => data?.members || [], [data])
  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase()
    return s ? members.filter((m) => `${m.full_name} ${m.email}`.toLowerCase().includes(s)) : members
  }, [members, q])

  const setTier = async (id: string, tier: string) => {
    setBusy(id); try { await adminSend('/api/admin/platform/members', 'PATCH', { id, tier }); await reload?.() } finally { setBusy('') }
  }
  const deactivate = async (id: string) => {
    if (!confirm('Deactivate this member?')) return
    setBusy(id); try { await adminSend(`/api/admin/platform/members?id=${id}`, 'DELETE'); await reload?.() } finally { setBusy('') }
  }
  const add = async () => {
    if (!nm.full_name || !nm.email) return
    setBusy('new'); try { await adminSend('/api/admin/platform/members', 'POST', nm); setNm({ full_name: '', email: '', tier: 'member_monthly' }); await reload?.() }
    catch (e) { alert(e instanceof Error ? e.message : 'error') } finally { setBusy('') }
  }

  return (
    <>
      <Card style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: T.ink, marginBottom: 10 }}>Add member</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto auto', gap: 8, alignItems: 'end' }}>
          <Field label="Name"><Input value={nm.full_name} onChange={(e) => setNm({ ...nm, full_name: e.target.value })} placeholder="Full name" /></Field>
          <Field label="Email"><Input value={nm.email} onChange={(e) => setNm({ ...nm, email: e.target.value })} placeholder="email@example.com" /></Field>
          <Field label="Tier"><Select value={nm.tier} onChange={(e) => setNm({ ...nm, tier: e.target.value })}>{TIERS.map((t) => <option key={t} value={t}>{TIER_LABEL[t]}</option>)}</Select></Field>
          <Button disabled={busy === 'new'} onClick={add}>{busy === 'new' ? 'Adding…' : 'Add'}</Button>
        </div>
      </Card>

      <Card pad={0}>
        <div style={{ padding: 14 }}><Input value={q} onChange={(e) => setQ(e.target.value)} placeholder={`Search ${members.length} members…`} /></div>
        {loading && !data ? <div className="skeleton" style={{ height: 200 }} /> : filtered.length === 0 ? <EmptyState title="No members" /> : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead><tr style={{ textAlign: 'left', color: T.muted, fontSize: 11.5 }}>
                <th style={th}>Name</th><th style={th}>Email</th><th style={th}>Tier</th><th style={th}>Credits</th><th style={th}>Joined</th><th style={th}></th>
              </tr></thead>
              <tbody>
                {filtered.map((m) => (
                  <tr key={m.id as string} style={{ borderTop: `1px solid ${T.border}`, opacity: m.is_active === false ? 0.5 : 1 }}>
                    <td style={td}>{(m.full_name as string) || '—'}</td>
                    <td style={{ ...td, color: T.sub }}>{m.email as string}</td>
                    <td style={td}>
                      <Select value={(m.tier as string) === 'admin' ? 'admin' : (m.tier as string)} disabled={(m.tier as string) === 'admin' || busy === m.id} onChange={(e) => setTier(m.id as string, e.target.value)} style={{ padding: '5px 8px', fontSize: 12.5 }}>
                        {(m.tier as string) === 'admin' && <option value="admin">Admin</option>}
                        {TIERS.map((t) => <option key={t} value={t}>{TIER_LABEL[t]}</option>)}
                      </Select>
                    </td>
                    <td style={td}>{Number(m.permanent_credits || 0)}</td>
                    <td style={{ ...td, color: T.muted }}>{fmtDate(m.joined_at as string)}</td>
                    <td style={td}>{(m.tier as string) !== 'admin' && m.is_active !== false && <button onClick={() => deactivate(m.id as string)} style={{ color: T.danger, fontSize: 12, background: 'none', border: 'none', cursor: 'pointer' }}>Deactivate</button>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </>
  )
}

// ── Credits ──────────────────────────────────────────────────────────
function CreditsTab() {
  const { data } = useAdminFetch<{ members: Row[] }>('/api/admin/platform/members')
  const members = data?.members || []
  const [memberId, setMemberId] = useState('')
  const [amount, setAmount] = useState('')
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')
  const grant = async () => {
    if (!memberId || !Number(amount)) return
    setBusy(true); setMsg('')
    try { const r = await adminSend('/api/admin/platform/credits', 'POST', { memberId, amount: Number(amount) }) as Row; setMsg(`Granted. New balance: ${r.balance} credits.`); setAmount('') }
    catch (e) { setMsg(e instanceof Error ? e.message : 'error') } finally { setBusy(false) }
  }
  return (
    <Card style={{ maxWidth: 560 }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: T.ink, marginBottom: 12 }}>Grant AI credits</div>
      <Field label="Member"><Select value={memberId} onChange={(e) => setMemberId(e.target.value)}>
        <option value="">Select a member…</option>
        {members.filter((m) => m.is_active !== false).map((m) => <option key={m.id as string} value={m.id as string}>{(m.full_name as string) || m.email as string} · {m.email as string} ({Number(m.permanent_credits || 0)} cr)</option>)}
      </Select></Field>
      <div style={{ height: 10 }} />
      <Field label="Amount (use a negative number to deduct)"><Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="e.g. 100" /></Field>
      <div style={{ marginTop: 14 }}><Button disabled={busy} onClick={grant}>{busy ? 'Granting…' : 'Grant credits'}</Button></div>
      <Msg text={msg} />
    </Card>
  )
}

// ── Courses ──────────────────────────────────────────────────────────
function CoursesTab() {
  const { data, loading, reload } = useAdminFetch<{ courses: Row[] }>('/api/admin/platform/courses')
  const [nc, setNc] = useState({ title: '', description: '', tag: '' })
  const [busy, setBusy] = useState('')
  const courses = data?.courses || []
  const create = async () => {
    if (!nc.title) return
    setBusy('new'); try { await adminSend('/api/admin/platform/courses', 'POST', nc); setNc({ title: '', description: '', tag: '' }); await reload?.() } finally { setBusy('') }
  }
  const togglePublish = async (id: string, published: boolean) => {
    setBusy(id); try { await adminSend('/api/admin/platform/courses', 'PATCH', { id, published: !published }); await reload?.() } finally { setBusy('') }
  }
  const remove = async (id: string) => {
    if (!confirm('Remove this course?')) return
    setBusy(id); try { await adminSend(`/api/admin/platform/courses?id=${id}`, 'DELETE'); await reload?.() } finally { setBusy('') }
  }
  return (
    <>
      <Card style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: T.ink, marginBottom: 10 }}>New course</div>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr auto', gap: 8, alignItems: 'end' }}>
          <Field label="Title"><Input value={nc.title} onChange={(e) => setNc({ ...nc, title: e.target.value })} /></Field>
          <Field label="Tag"><Input value={nc.tag} onChange={(e) => setNc({ ...nc, tag: e.target.value })} placeholder="Course" /></Field>
          <Button disabled={busy === 'new'} onClick={create}>{busy === 'new' ? 'Creating…' : 'Create'}</Button>
        </div>
      </Card>
      {loading && !data ? <div className="skeleton" style={{ height: 160 }} /> : courses.length === 0 ? <EmptyState title="No courses yet" /> : (
        <div style={{ display: 'grid', gap: 10 }}>
          {courses.map((c) => (
            <Card key={c.id as string}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: T.ink }}>{c.title as string} {c.published ? <span style={pill('#1C4A32')}>Published</span> : <span style={pill(T.muted)}>Draft</span>}</div>
                  <div style={{ fontSize: 12.5, color: T.muted }}>{(c.tag as string) || 'Course'} · {Array.isArray(c.modules) ? (c.modules as unknown[]).length : 0} modules · {Number(c.enrolled_count || 0)} enrolled</div>
                </div>
                <Button variant="ghost" onClick={() => togglePublish(c.id as string, !!c.published)}>{c.published ? 'Unpublish' : 'Publish'}</Button>
                <button onClick={() => remove(c.id as string)} style={{ color: T.danger, fontSize: 12.5, background: 'none', border: 'none', cursor: 'pointer' }}>Remove</button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </>
  )
}

// ── Pricing ──────────────────────────────────────────────────────────
function PricingTab() {
  const { data, loading } = useAdminFetch<{ settings: { pricing: Row | null } }>('/api/admin/platform/settings?keys=pricing')
  if (loading && !data) return <div className="skeleton" style={{ height: 200 }} />
  const pr = (data?.settings?.pricing || {}) as Row
  return <PricingForm initial={{ monthly: String(pr.monthly ?? ''), yearly: String(pr.yearly ?? ''), ai: String(pr.ai ?? '') }} />
}
function PricingForm({ initial }: { initial: { monthly: string; yearly: string; ai: string } }) {
  const [p, setP] = useState(initial)
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')
  const save = async () => {
    setBusy(true); setMsg('')
    try { await adminSend('/api/admin/platform/settings', 'POST', { key: 'pricing', value: { monthly: Number(p.monthly), yearly: Number(p.yearly), ai: Number(p.ai) } }); setMsg('Pricing saved.') }
    catch (e) { setMsg(e instanceof Error ? e.message : 'error') } finally { setBusy(false) }
  }
  return (
    <Card style={{ maxWidth: 480 }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: T.ink, marginBottom: 12 }}>Plan pricing (USD)</div>
      <Field label="Monthly membership"><Input type="number" value={p.monthly} onChange={(e) => setP({ ...p, monthly: e.target.value })} /></Field>
      <div style={{ height: 10 }} />
      <Field label="Yearly membership"><Input type="number" value={p.yearly} onChange={(e) => setP({ ...p, yearly: e.target.value })} /></Field>
      <div style={{ height: 10 }} />
      <Field label="The5th AI"><Input type="number" value={p.ai} onChange={(e) => setP({ ...p, ai: e.target.value })} /></Field>
      <div style={{ marginTop: 14 }}><Button disabled={busy} onClick={save}>{busy ? 'Saving…' : 'Save pricing'}</Button></div>
      <Msg text={msg} />
    </Card>
  )
}

// ── Generic JSON setting (zoom / onboarding) ─────────────────────────
function JsonSettingTab({ settingKey, title, hint }: { settingKey: string; title: string; hint: string }) {
  const { data, loading } = useAdminFetch<{ settings: Record<string, unknown> }>(`/api/admin/platform/settings?keys=${settingKey}`)
  if (loading && !data) return <div className="skeleton" style={{ height: 200 }} />
  const initial = JSON.stringify(data?.settings?.[settingKey] ?? {}, null, 2)
  return <JsonSettingForm settingKey={settingKey} title={title} hint={hint} initial={initial} />
}
function JsonSettingForm({ settingKey, title, hint, initial }: { settingKey: string; title: string; hint: string; initial: string }) {
  const [text, setText] = useState(initial)
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')
  const save = async () => {
    setBusy(true); setMsg('')
    let value: unknown
    try { value = JSON.parse(text || '{}') } catch { setMsg('Invalid JSON — fix formatting.'); setBusy(false); return }
    try { await adminSend('/api/admin/platform/settings', 'POST', { key: settingKey, value }); setMsg('Saved.') }
    catch (e) { setMsg(e instanceof Error ? e.message : 'error') } finally { setBusy(false) }
  }
  return (
    <Card style={{ maxWidth: 640 }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: T.ink }}>{title}</div>
      <div style={{ fontSize: 12.5, color: T.muted, margin: '4px 0 12px' }}>{hint}</div>
      <Textarea value={text} onChange={(e) => setText(e.target.value)} rows={12} style={{ fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 12.5 }} />
      <div style={{ marginTop: 12 }}><Button disabled={busy} onClick={save}>{busy ? 'Saving…' : 'Save'}</Button></div>
      <Msg text={msg} />
    </Card>
  )
}

// ── Security ─────────────────────────────────────────────────────────
function SecurityTab() {
  const { data, loading, reload } = useAdminFetch<{ blocked: Row[]; events: Row[] }>('/api/admin/platform/security')
  const [busy, setBusy] = useState('')
  const unblock = async (userId: string, email: string) => {
    setBusy(userId); try { await adminSend('/api/admin/platform/security', 'PATCH', { targetUserId: userId, targetEmail: email }); await reload?.() } finally { setBusy('') }
  }
  if (loading && !data) return <div className="skeleton" style={{ height: 200 }} />
  const blocked = data?.blocked || [], events = data?.events || []
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
      <Card pad={0}>
        <div style={{ padding: '14px 16px 8px', fontSize: 13, fontWeight: 700, color: T.ink }}>Blocked accounts ({blocked.length})</div>
        {blocked.length === 0 ? <div style={{ padding: 16, fontSize: 13, color: T.muted }}>No blocked accounts.</div> : blocked.map((b) => (
          <div key={b.user_id as string} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', borderTop: `1px solid ${T.border}` }}>
            <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: 13, color: T.ink }}>{b.email as string}</div><div style={{ fontSize: 11.5, color: T.muted }}>{fmtDate(b.blocked_at as string)}{b.reason ? ` · ${b.reason}` : ''}</div></div>
            <Button variant="ghost" disabled={busy === b.user_id} onClick={() => unblock(b.user_id as string, b.email as string)}>{busy === b.user_id ? '…' : 'Unblock'}</Button>
          </div>
        ))}
      </Card>
      <Card pad={0}>
        <div style={{ padding: '14px 16px 8px', fontSize: 13, fontWeight: 700, color: T.ink }}>Recent security events</div>
        {events.length === 0 ? <div style={{ padding: 16, fontSize: 13, color: T.muted }}>No events.</div> : events.slice(0, 30).map((e, i) => (
          <div key={i} style={{ display: 'flex', gap: 10, padding: '8px 16px', borderTop: `1px solid ${T.border}`, fontSize: 12.5 }}>
            <span style={{ color: T.sub, flex: 1 }}>{(e.event_type as string) || 'event'} · {(e.email as string) || '—'}</span>
            <span style={{ color: T.muted }}>{fmtDate(e.created_at as string)}</span>
          </div>
        ))}
      </Card>
    </div>
  )
}

// ── AI Training ──────────────────────────────────────────────────────
function TrainingTab() {
  const { data, loading, reload } = useAdminFetch<{ patterns: number; activeVersion: number | null; callsWithTranscript: number; docs: Row[] }>('/api/admin/platform/training')
  const [t, setT] = useState({ title: '', date: '', content: '' })
  const [busy, setBusy] = useState('')
  const [msg, setMsg] = useState('')
  const save = async () => {
    if (!t.title) return
    setBusy('save'); setMsg('')
    try { await adminSend('/api/admin/platform/training', 'POST', { action: 'save_transcript', ...t }); setT({ title: '', date: '', content: '' }); setMsg('Transcript saved.'); await reload?.() }
    catch (e) { setMsg(e instanceof Error ? e.message : 'error') } finally { setBusy('') }
  }
  const del = async (id: string, fathomId: string) => {
    if (!confirm('Delete this training document?')) return
    setBusy(id); try { await adminSend('/api/admin/platform/training', 'POST', { action: 'delete_transcript', id, fathomId }); await reload?.() } finally { setBusy('') }
  }
  if (loading && !data) return <div className="skeleton" style={{ height: 200 }} />
  const docs = data?.docs || []
  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 14 }}>
        <Stat label="Trained patterns" value={data?.patterns ?? 0} />
        <Stat label="Active brain version" value={data?.activeVersion ? `v${data.activeVersion}` : '—'} />
        <Stat label="Calls with transcript" value={data?.callsWithTranscript ?? 0} />
      </div>
      <Card style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: T.ink, marginBottom: 10 }}>Add coaching transcript</div>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 8, marginBottom: 8 }}>
          <Field label="Title"><Input value={t.title} onChange={(e) => setT({ ...t, title: e.target.value })} /></Field>
          <Field label="Date"><Input type="date" value={t.date} onChange={(e) => setT({ ...t, date: e.target.value })} /></Field>
        </div>
        <Field label="Transcript"><Textarea rows={6} value={t.content} onChange={(e) => setT({ ...t, content: e.target.value })} placeholder="Paste the call transcript…" /></Field>
        <div style={{ marginTop: 12 }}><Button disabled={busy === 'save'} onClick={save}>{busy === 'save' ? 'Saving…' : 'Save transcript'}</Button></div>
        <Msg text={msg} />
        <div style={{ fontSize: 11.5, color: T.muted, marginTop: 8 }}>Note: retraining / brain-rebuild remains on the platform&apos;s Fathom sync + train pipeline. This panel manages the source transcripts.</div>
      </Card>
      <Card pad={0}>
        <div style={{ padding: '14px 16px 8px', fontSize: 13, fontWeight: 700, color: T.ink }}>Training documents ({docs.length})</div>
        {docs.length === 0 ? <div style={{ padding: 16, fontSize: 13, color: T.muted }}>No transcripts yet.</div> : docs.map((d) => (
          <div key={d.id as string} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 16px', borderTop: `1px solid ${T.border}` }}>
            <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: 13, color: T.ink }}>{(d.title as string) || 'Untitled'}</div><div style={{ fontSize: 11.5, color: T.muted }}>{fmtDate(d.date as string)} {d.hasTranscript ? '· has transcript' : ''}</div></div>
            <button onClick={() => del(d.id as string, d.fathom_id as string)} style={{ color: T.danger, fontSize: 12, background: 'none', border: 'none', cursor: 'pointer' }}>Delete</button>
          </div>
        ))}
      </Card>
    </>
  )
}

// ── Whop ─────────────────────────────────────────────────────────────
function WhopTab() {
  return (
    <Card style={{ maxWidth: 680 }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: T.ink, marginBottom: 8 }}>Whop integration</div>
      <p style={{ fontSize: 13, color: T.sub, lineHeight: 1.6 }}>Billing runs through Whop. Live revenue appears in <b>Business HQ</b>. Manage the API key in Vercel → the5th-website → Environment Variables (<code style={code}>WHOP_API_KEY</code>).</p>
      <div style={{ fontSize: 12.5, color: T.muted, marginTop: 12 }}>Webhook endpoint (still served by the platform):</div>
      <code style={{ ...code, display: 'block', marginTop: 6, wordBreak: 'break-all' }}>https://platform.the5th.consulting/api/whop-webhook</code>
    </Card>
  )
}

// ── Blueprints (member overview) ─────────────────────────────────────
function BlueprintsTab() {
  const { data, loading } = useAdminFetch<{ members: Row[] }>('/api/admin/platform/members')
  if (loading && !data) return <div className="skeleton" style={{ height: 200 }} />
  const members = (data?.members || []).filter((m) => m.is_active !== false)
  const byTier = members.reduce<Record<string, number>>((a, m) => { const k = m.tier as string; a[k] = (a[k] || 0) + 1; return a }, {})
  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: 10, marginBottom: 14 }}>
        {Object.entries(byTier).map(([t, n]) => <Stat key={t} label={TIER_LABEL[t] || t} value={n} />)}
      </div>
      <Card pad={0}>
        <div style={{ padding: '14px 16px 8px', fontSize: 13, fontWeight: 700, color: T.ink }}>Active members ({members.length})</div>
        {members.map((m) => (
          <div key={m.id as string} style={{ display: 'flex', gap: 10, padding: '9px 16px', borderTop: `1px solid ${T.border}`, fontSize: 13 }}>
            <span style={{ flex: 1, color: T.ink }}>{(m.full_name as string) || m.email as string}</span>
            <span style={{ color: T.sub }}>{TIER_LABEL[m.tier as string] || (m.tier as string)}</span>
            <span style={{ color: T.muted, width: 60, textAlign: 'right' }}>{Number(m.permanent_credits || 0)} cr</span>
          </div>
        ))}
      </Card>
    </>
  )
}

// ── shared bits ──────────────────────────────────────────────────────
const th: React.CSSProperties = { padding: '10px 14px', fontWeight: 600 }
const td: React.CSSProperties = { padding: '9px 14px', verticalAlign: 'middle' }
const code: React.CSSProperties = { fontSize: 12, fontFamily: 'ui-monospace,Menlo,monospace', background: '#f4f5f4', padding: '2px 6px', borderRadius: 5, color: T.ink }
const pill = (c: string): React.CSSProperties => ({ fontSize: 10.5, fontWeight: 700, color: '#fff', background: c, padding: '2px 8px', borderRadius: 20, marginLeft: 8 })
function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return <Card pad={16}><div style={{ fontSize: 22, fontWeight: 800, color: T.ink }}>{value}</div><div style={{ fontSize: 11.5, color: T.sub }}>{label}</div></Card>
}
