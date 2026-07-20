'use client'
/* Platform Super Admin (migrated from ~/the5th-platform's embedded AdminPanel).
   Ten tabs of platform product control — members, credits, courses, pricing,
   zoom, onboarding, security, training, whop, blueprints — all backed by
   cookie-gated /api/admin/platform/* routes writing the shared Supabase DB. */
import { useEffect, useMemo, useState } from 'react'
import { T, Card, Button, Input, Select, Textarea, Field, PageHeader, EmptyState, useAdminFetch, adminSend, fmtDate } from '@/components/admin/ui'

type Row = Record<string, unknown>
const TIERS = ['free', 'book_only', 'course_only', 'member_monthly', 'member_yearly', 'ai_only', 'ai_trial']
const TIER_LABEL: Record<string, string> = {
  free: 'Free', book_only: 'Book Access', course_only: 'Course Access',
  member_monthly: 'Monthly Member', member_yearly: 'Yearly Member', admin: 'Admin',
  ai_only: 'The5th AI', ai_trial: 'Free Trial',
}
const TABS = ['members', 'credits', 'calls', 'emails', 'courses', 'pricing', 'zoom', 'onboarding', 'security', 'training', 'whop', 'blueprints'] as const
type Tab = typeof TABS[number]
const TAB_LABEL: Record<Tab, string> = {
  members: 'Members', credits: 'Credits', calls: 'Weekly Call', emails: 'Emails', courses: 'Courses', pricing: 'Pricing', zoom: 'Zoom',
  onboarding: 'Onboarding', security: 'Security', training: 'AI Training', whop: 'Whop', blueprints: 'Blueprints',
}
const DOW = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

export default function PlatformAdmin() {
  const [tab, setTab] = useState<Tab>('members')
  // Deep-linkable: /admin/platform?tab=zoom (used by the global command palette).
  useEffect(() => {
    const t = new URLSearchParams(window.location.search).get('tab')
    if (t && (TABS as readonly string[]).includes(t)) setTab(t as Tab) // eslint-disable-line react-hooks/set-state-in-effect
  }, [])
  const selectTab = (t: Tab) => {
    setTab(t)
    const u = new URL(window.location.href); u.searchParams.set('tab', t); window.history.replaceState({}, '', u)
  }
  return (
    <>
      <PageHeader title="Platform Control" subtitle="Super-admin control of the member platform — product, members, and the AI brain" />
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 18 }}>
        {TABS.map((t) => (
          <button key={t} onClick={() => selectTab(t)}
            style={{ padding: '7px 14px', borderRadius: 9, border: `1px solid ${tab === t ? T.green : T.border}`, background: tab === t ? T.green : '#fff', color: tab === t ? '#fff' : T.sub, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            {TAB_LABEL[t]}
          </button>
        ))}
      </div>
      {tab === 'members' && <MembersTab />}
      {tab === 'credits' && <CreditsTab />}
      {tab === 'calls' && <CallsTab />}
      {tab === 'emails' && <EmailsTab />}
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

// ── Weekly Call ──────────────────────────────────────────────────────
function CallsTab() {
  const { data, loading, reload } = useAdminFetch<{ settings: Row; dowLabel: string | null; upcoming: Row[] }>('/api/admin/platform/calls')
  if (loading && !data) return <div className="skeleton" style={{ height: 220 }} />
  const s = (data?.settings || {}) as Row
  return <CallsInner initial={s} dowLabel={data?.dowLabel || null} upcoming={data?.upcoming || []} reload={reload} />
}
function CallsInner({ initial, dowLabel, upcoming, reload }: { initial: Row; dowLabel: string | null; upcoming: Row[]; reload: () => void }) {
  const [f, setF] = useState({
    label: String(initial.label ?? 'Weekly Coaching Call'), link: String(initial.link ?? ''),
    day_of_week: Number(initial.day_of_week ?? 2), hour: Number(initial.hour ?? 10), minute: Number(initial.minute ?? 0),
    timezone: String(initial.timezone ?? 'America/New_York'),
  })
  const active = initial.active !== false
  const [busy, setBusy] = useState('')
  const [msg, setMsg] = useState('')
  const [rs, setRs] = useState<{ date: string; nd: string; nh: number; nm: number } | null>(null)
  const call = async (body: Record<string, unknown>, tag: string) => {
    setBusy(tag); setMsg('')
    try { await adminSend('/api/admin/platform/calls', 'POST', body); setMsg('Saved.'); reload() }
    catch (e) { setMsg(e instanceof Error ? e.message : 'error') } finally { setBusy('') }
  }
  return (
    <>
      <Card style={{ marginBottom: 14, ...(active ? {} : { opacity: 0.75 }) }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: T.ink, flex: 1 }}>Weekly call schedule {active ? <span style={pill('#1C4A32')}>Live</span> : <span style={pill(T.danger)}>Paused</span>}</div>
          <Button variant="ghost" disabled={busy === 'active'} onClick={() => call({ action: 'set_active', active: !active }, 'active')}>{active ? 'Pause / remove weekly call' : 'Resume weekly call'}</Button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <Field label="Label"><Input value={f.label} onChange={(e) => setF({ ...f, label: e.target.value })} /></Field>
          <Field label="Zoom / meeting link"><Input value={f.link} onChange={(e) => setF({ ...f, link: e.target.value })} placeholder="https://zoom.us/j/…" /></Field>
          <Field label="Day"><Select value={f.day_of_week} onChange={(e) => setF({ ...f, day_of_week: Number(e.target.value) })}>{DOW.map((d, i) => <option key={d} value={i}>{d}</option>)}</Select></Field>
          <Field label="Time"><div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <Input type="number" min={0} max={23} value={f.hour} onChange={(e) => setF({ ...f, hour: Number(e.target.value) })} style={{ width: 70 }} />
            <span style={{ color: T.muted }}>:</span>
            <Input type="number" min={0} max={59} value={f.minute} onChange={(e) => setF({ ...f, minute: Number(e.target.value) })} style={{ width: 70 }} />
          </div></Field>
          <Field label="Timezone"><Input value={f.timezone} onChange={(e) => setF({ ...f, timezone: e.target.value })} placeholder="America/New_York" /></Field>
        </div>
        <div style={{ marginTop: 14 }}><Button disabled={busy === 'save'} onClick={() => call({ action: 'save_settings', ...f }, 'save')}>{busy === 'save' ? 'Saving…' : 'Save schedule'}</Button></div>
        <Msg text={msg} />
      </Card>

      <Card pad={0}>
        <div style={{ padding: '14px 16px 8px', fontSize: 13, fontWeight: 700, color: T.ink }}>Upcoming calls {dowLabel ? `· ${dowLabel}s` : ''}</div>
        {!active ? <div style={{ padding: 16, fontSize: 13, color: T.muted }}>The weekly call is paused — no upcoming occurrences.</div>
          : upcoming.length === 0 ? <div style={{ padding: 16, fontSize: 13, color: T.muted }}>Set a day to see upcoming calls.</div>
          : upcoming.map((o) => {
            const d = o.original_date as string
            const cancelled = o.status === 'cancelled', resched = o.status === 'rescheduled'
            return (
              <div key={d} style={{ padding: '11px 16px', borderTop: `1px solid ${T.border}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ flex: 1 }}>
                    <span style={{ fontSize: 13.5, color: T.ink, textDecoration: cancelled ? 'line-through' : 'none' }}>{fmtDate(d)}</span>
                    {cancelled && <span style={pill(T.danger)}>Cancelled</span>}
                    {resched && <span style={pill('#b8890c')}>Moved → {fmtDate(o.new_date as string)}</span>}
                  </div>
                  {(cancelled || resched) ? <button onClick={() => call({ action: 'restore', originalDate: d }, d)} style={linkBtn}>Restore</button> : (
                    <>
                      <button onClick={() => setRs({ date: d, nd: d, nh: Number(o.hour ?? 10), nm: Number(o.minute ?? 0) })} style={linkBtn}>Reschedule</button>
                      <button onClick={() => call({ action: 'cancel', originalDate: d }, d)} style={{ ...linkBtn, color: T.danger }}>Cancel</button>
                    </>
                  )}
                </div>
                {rs?.date === d && (
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 10, flexWrap: 'wrap' }}>
                    <Input type="date" value={rs.nd} onChange={(e) => setRs({ ...rs, nd: e.target.value })} style={{ width: 160 }} />
                    <Input type="number" min={0} max={23} value={rs.nh} onChange={(e) => setRs({ ...rs, nh: Number(e.target.value) })} style={{ width: 64 }} />
                    <span style={{ color: T.muted }}>:</span>
                    <Input type="number" min={0} max={59} value={rs.nm} onChange={(e) => setRs({ ...rs, nm: Number(e.target.value) })} style={{ width: 64 }} />
                    <Button onClick={() => { call({ action: 'reschedule', originalDate: d, newDate: rs.nd, newHour: rs.nh, newMinute: rs.nm }, d); setRs(null) }}>Save</Button>
                    <Button variant="ghost" onClick={() => setRs(null)}>Cancel</Button>
                  </div>
                )}
              </div>
            )
          })}
      </Card>
    </>
  )
}

// ── Emails ───────────────────────────────────────────────────────────
function EmailsTab() {
  const { data, loading, reload } = useAdminFetch<{ flows: Row[]; broadcasts: Row[]; audiences: string[] }>('/api/admin/platform/emails')
  if (loading && !data) return <div className="skeleton" style={{ height: 260 }} />
  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <BroadcastComposer audiences={data?.audiences || ['all']} reload={reload} />
      <FlowsPanel flows={data?.flows || []} reload={reload} />
      <BroadcastHistory broadcasts={data?.broadcasts || []} reload={reload} />
    </div>
  )
}

function BroadcastComposer({ audiences, reload }: { audiences: string[]; reload: () => void }) {
  const [f, setF] = useState({ subject: '', body: '', audience: 'all', schedule: '', testTo: '' })
  const [count, setCount] = useState<number | null>(null)
  const [busy, setBusy] = useState('')
  const [msg, setMsg] = useState('')
  const previewCount = async (aud: string) => { try { const r = await adminSend('/api/admin/platform/emails', 'POST', { action: 'audience_count', audience: aud }) as Row; setCount(Number(r.count)) } catch { setCount(null) } }
  const act = async (payload: Record<string, unknown>, tag: string, okMsg: string) => {
    if (!f.subject || !f.body) { setMsg('Subject and body are required.'); return }
    setBusy(tag); setMsg('')
    try { await adminSend('/api/admin/platform/emails', 'POST', payload); setMsg(okMsg); reload() }
    catch (e) { setMsg(e instanceof Error ? e.message : 'error') } finally { setBusy('') }
  }
  return (
    <Card>
      <div style={{ fontSize: 13, fontWeight: 700, color: T.ink, marginBottom: 12 }}>Broadcast to members <span style={{ fontWeight: 400, color: T.muted, fontSize: 12 }}>· sent via Resend</span></div>
      <Field label="Subject"><Input value={f.subject} onChange={(e) => setF({ ...f, subject: e.target.value })} /></Field>
      <div style={{ height: 10 }} />
      <Field label="Body (HTML allowed)"><Textarea rows={8} value={f.body} onChange={(e) => setF({ ...f, body: e.target.value })} placeholder="Write your email… basic HTML supported." /></Field>
      <div style={{ display: 'flex', gap: 10, alignItems: 'end', marginTop: 10, flexWrap: 'wrap' }}>
        <Field label="Audience"><Select value={f.audience} onChange={(e) => { setF({ ...f, audience: e.target.value }); previewCount(e.target.value) }}>{audiences.map((a) => <option key={a} value={a}>{a}</option>)}</Select></Field>
        <Button variant="ghost" onClick={() => previewCount(f.audience)}>{count == null ? 'Preview reach' : `${count} recipients`}</Button>
        <Field label="Schedule (optional)"><Input type="datetime-local" value={f.schedule} onChange={(e) => setF({ ...f, schedule: e.target.value })} /></Field>
      </div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'end', marginTop: 12, flexWrap: 'wrap' }}>
        <Field label="Send test to"><Input value={f.testTo} onChange={(e) => setF({ ...f, testTo: e.target.value })} placeholder="you@email.com" style={{ width: 200 }} /></Field>
        <Button variant="ghost" disabled={busy === 'test'} onClick={() => act({ action: 'send_test', to: f.testTo, subject: f.subject, body: f.body }, 'test', 'Test sent.')}>Send test</Button>
        <div style={{ flex: 1 }} />
        {f.schedule
          ? <Button disabled={busy === 'sched'} onClick={() => act({ action: 'create_broadcast', subject: f.subject, body: f.body, audience: f.audience, scheduled_at: new Date(f.schedule).toISOString() }, 'sched', 'Scheduled.')}>{busy === 'sched' ? 'Scheduling…' : 'Schedule'}</Button>
          : <Button disabled={busy === 'now'} onClick={() => { if (confirm('Send this broadcast now?')) act({ action: 'create_broadcast', subject: f.subject, body: f.body, audience: f.audience, send_now: true }, 'now', 'Sending…') }}>{busy === 'now' ? 'Sending…' : 'Send now'}</Button>}
      </div>
      <Msg text={msg} />
    </Card>
  )
}

function FlowsPanel({ flows, reload }: { flows: Row[]; reload: () => void }) {
  const [open, setOpen] = useState<string | null>(null)
  const [busy, setBusy] = useState('')
  const setStatus = async (key: string, status: string) => {
    setBusy(key); try { await adminSend('/api/admin/platform/emails', 'POST', { action: 'set_flow_status', key, status }); reload() } finally { setBusy('') }
  }
  const statusColor = (s: string) => s === 'live' ? '#1C4A32' : s === 'paused' ? '#b8890c' : T.danger
  return (
    <Card pad={0}>
      <div style={{ padding: '14px 16px 8px', fontSize: 13, fontWeight: 700, color: T.ink }}>Automated emails <span style={{ fontWeight: 400, color: T.muted, fontSize: 12 }}>· pause, go live, suspend, or edit content</span></div>
      {flows.map((fl) => {
        const key = fl.key as string, status = fl.status as string
        return (
          <div key={key} style={{ borderTop: `1px solid ${T.border}`, padding: '11px 16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: T.ink }}>{fl.name as string} <span style={pill(statusColor(status))}>{status}</span> <span style={{ ...pill(T.muted), background: '#eef2f0', color: T.sub }}>{fl.provider as string}</span></div>
                <div style={{ fontSize: 12, color: T.muted }}>{(fl.category as string) || ''}{fl.cadence ? ` · ${fl.cadence}` : ''}{fl.description ? ` — ${fl.description}` : ''}</div>
              </div>
              <div style={{ display: 'flex', gap: 4 }}>
                {(['live', 'paused', 'suspended'] as const).map((st) => (
                  <button key={st} disabled={busy === key || status === st} onClick={() => setStatus(key, st)}
                    style={{ fontSize: 11.5, fontWeight: 600, padding: '5px 9px', borderRadius: 7, cursor: status === st ? 'default' : 'pointer', border: `1px solid ${status === st ? statusColor(st) : T.border}`, background: status === st ? statusColor(st) : '#fff', color: status === st ? '#fff' : T.sub }}>
                    {st === 'live' ? 'Live' : st === 'paused' ? 'Pause' : 'Suspend'}
                  </button>
                ))}
                <button onClick={() => setOpen(open === key ? null : key)} style={linkBtn}>{open === key ? 'Close' : 'Edit'}</button>
              </div>
            </div>
            {open === key && <FlowEditor flow={fl} onSaved={() => { setOpen(null); reload() }} />}
          </div>
        )
      })}
    </Card>
  )
}
function FlowEditor({ flow, onSaved }: { flow: Row; onSaved: () => void }) {
  const [subject, setSubject] = useState(String(flow.subject_override ?? ''))
  const [body, setBody] = useState(String(flow.body_override ?? ''))
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')
  const save = async () => {
    setBusy(true); setMsg('')
    try { await adminSend('/api/admin/platform/emails', 'POST', { action: 'save_flow_override', key: flow.key, subject_override: subject, body_override: body }); onSaved() }
    catch (e) { setMsg(e instanceof Error ? e.message : 'error'); setBusy(false) }
  }
  return (
    <div style={{ marginTop: 10, padding: 12, background: T.bg, borderRadius: 10 }}>
      <div style={{ fontSize: 11.5, color: T.muted, marginBottom: 8 }}>Overrides the default content when set. Leave blank to keep the platform&apos;s built-in copy.</div>
      <Field label="Subject override"><Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="(default)" /></Field>
      <div style={{ height: 8 }} />
      <Field label="Body override (HTML)"><Textarea rows={5} value={body} onChange={(e) => setBody(e.target.value)} placeholder="(default)" /></Field>
      <div style={{ marginTop: 10 }}><Button disabled={busy} onClick={save}>{busy ? 'Saving…' : 'Save override'}</Button></div>
      <Msg text={msg} />
    </div>
  )
}

function BroadcastHistory({ broadcasts, reload }: { broadcasts: Row[]; reload: () => void }) {
  const [busy, setBusy] = useState('')
  const act = async (action: string, id: string) => { setBusy(id); try { await adminSend('/api/admin/platform/emails', 'POST', { action, id }); reload() } finally { setBusy('') } }
  const color = (s: string) => s === 'sent' ? '#1C4A32' : s === 'sending' ? '#b8890c' : s === 'scheduled' ? '#6c5fc7' : s === 'paused' ? '#b8890c' : s === 'canceled' ? T.danger : T.muted
  if (broadcasts.length === 0) return null
  return (
    <Card pad={0}>
      <div style={{ padding: '14px 16px 8px', fontSize: 13, fontWeight: 700, color: T.ink }}>Broadcasts</div>
      {broadcasts.map((b) => {
        const id = b.id as string, status = b.status as string
        return (
          <div key={id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', borderTop: `1px solid ${T.border}` }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13.5, color: T.ink }}>{b.subject as string} <span style={pill(color(status))}>{status}</span></div>
              <div style={{ fontSize: 12, color: T.muted }}>{b.audience as string}{b.scheduled_at ? ` · scheduled ${fmtDate(b.scheduled_at as string)}` : ''}{status === 'sent' ? ` · ${Number(b.sent_count || 0)}/${Number(b.total || 0)} sent` : ''}</div>
            </div>
            {status === 'scheduled' && <><button onClick={() => act('pause_broadcast', id)} style={linkBtn}>Pause</button><button onClick={() => act('send_broadcast', id)} style={linkBtn}>Send now</button></>}
            {status === 'paused' && <button onClick={() => act('resume_broadcast', id)} style={linkBtn}>Resume</button>}
            {['scheduled', 'paused', 'draft'].includes(status) && <button disabled={busy === id} onClick={() => act('cancel_broadcast', id)} style={{ ...linkBtn, color: T.danger }}>Cancel</button>}
          </div>
        )
      })}
    </Card>
  )
}

// ── shared bits ──────────────────────────────────────────────────────
const th: React.CSSProperties = { padding: '10px 14px', fontWeight: 600 }
const td: React.CSSProperties = { padding: '9px 14px', verticalAlign: 'middle' }
const code: React.CSSProperties = { fontSize: 12, fontFamily: 'ui-monospace,Menlo,monospace', background: '#f4f5f4', padding: '2px 6px', borderRadius: 5, color: T.ink }
const linkBtn: React.CSSProperties = { fontSize: 12.5, fontWeight: 600, color: T.green, background: 'none', border: 'none', cursor: 'pointer', padding: '4px 6px' }
const pill = (c: string): React.CSSProperties => ({ fontSize: 10.5, fontWeight: 700, color: '#fff', background: c, padding: '2px 8px', borderRadius: 20, marginLeft: 8 })
function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return <Card pad={16}><div style={{ fontSize: 22, fontWeight: 800, color: T.ink }}>{value}</div><div style={{ fontSize: 11.5, color: T.sub }}>{label}</div></Card>
}
