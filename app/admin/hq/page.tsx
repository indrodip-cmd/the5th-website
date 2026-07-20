'use client'

// app/admin/hq/page.tsx — The5th Business HQ (Founder Command Center)
// Ported from the5th-platform /hq into the central website admin. Shows ONLY
// real data: live Whop revenue + Cal.com bookings + Wise cash when connected,
// plus real Supabase facts. Unconnected integrations render a "Connect" prompt,
// never a fabricated number. Access is gated by the admin session (server-side).

import { useEffect, useState, useCallback } from 'react'

const C = {
  bg: '#f6f2ec', bg2: '#ffffff', ink: '#1a1512',
  border: '#eae3d9', border2: '#ddd4c7',
  green: '#2d6a4f', greenDim: 'rgba(45,106,79,0.09)',
  gold: '#b8890c', goldDim: 'rgba(184,137,12,0.10)',
  lav: '#6c5fc7', lavDim: 'rgba(108,95,199,0.10)',
  red: '#c0392b', redDim: 'rgba(192,57,43,0.08)',
  text2: '#736a60', text3: '#a89f93',
  plum: '#2E1A35', plum2: '#3d2645',
  card: '0 1px 2px rgba(46,26,53,0.04), 0 12px 30px -18px rgba(46,26,53,0.18)',
}
const SERIF = "'Cormorant Garamond',Georgia,'Times New Roman',serif"
const SANS = "'DM Sans',system-ui,sans-serif"

const CUR: Record<string, string> = { USD: '$', INR: '₹', EUR: '€', GBP: '£' }
const money = (n: number, cur = 'USD') => (CUR[cur] || '$') + Math.round(n ?? 0).toLocaleString()

const MOMENTUM: Record<string, { c: string; label: string }> = {
  strong: { c: '#2d6a4f', label: 'Strong' },
  building: { c: '#b8890c', label: 'Building' },
  stalling: { c: '#c0392b', label: 'Stalling' },
  at_risk: { c: '#c0392b', label: 'At Risk' },
}

// Env var each integration needs — surfaced in the UI so setup is self-explanatory.
const NEEDS: Record<string, string> = { whop: 'WHOP_API_KEY', calcom: 'CALCOM_API_KEY', brevo: 'BREVO_API_KEY', wise: 'WISE_API_TOKEN' }

/* eslint-disable @typescript-eslint/no-explicit-any */
export default function HQPage() {
  const [status, setStatus] = useState<'loading' | 'ok' | 'denied' | 'error'>('loading')
  const [data, setData] = useState<any>(null)
  const [brief, setBrief] = useState<any>(null)
  const [briefLoading, setBriefLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  const load = useCallback(async () => {
    const res = await fetch('/api/admin/hq/overview', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}',
    })
    if (res.status === 401 || res.status === 403) return setStatus('denied')
    if (!res.ok) return setStatus('error')
    setData(await res.json())
    setStatus('ok')
  }, [])

  useEffect(() => { load() }, [load])

  const refresh = async () => { setRefreshing(true); await load(); setRefreshing(false) }
  const genBrief = async () => {
    setBriefLoading(true)
    try {
      const res = await fetch('/api/admin/hq/brief', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}',
      })
      const j = await res.json()
      if (j.brief) setBrief(j.brief)
    } finally { setBriefLoading(false) }
  }

  if (status === 'loading') return <Center>Loading command center…</Center>
  if (status === 'denied') return <Center>Admin access required.</Center>
  if (status === 'error' || !data) return <Center>Could not load dashboard. Try refreshing.</Center>

  const rev = data.revenue, g = data.growth, f = data.funnel, u = data.usage, bk = data.bookings, em = data.email, cash = data.cash || { balances: [] }
  const cur = rev.currency || 'USD'
  const integ = data.integrations || {}
  const anyOff = !integ.whop || !integ.calcom || !integ.wise

  return (
    <div style={{ background: C.bg, fontFamily: SANS, color: C.ink, padding: '4px 2px 40px', borderRadius: 12 }}>
      <style>{`.hq-scope *{box-sizing:border-box}.hq-scope a{color:inherit}`}</style>
      <div className="hq-scope" style={{ maxWidth: 1200, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14, marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 11, letterSpacing: 2.5, textTransform: 'uppercase', color: C.gold, fontWeight: 700 }}>The5th · Command Center</div>
            <h1 style={{ fontFamily: SERIF, fontSize: 36, fontWeight: 700, margin: '3px 0 0', color: C.plum }}>Business HQ</h1>
            <div style={{ fontSize: 13, color: C.text2, marginTop: 3 }}>
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} · the whole business, one screen
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <IntegChip on={integ.whop} label="Whop" />
            <IntegChip on={integ.wise} label="Wise" />
            <IntegChip on={integ.calcom} label="Cal.com" />
            <IntegChip on={integ.brevo} label="Brevo" />
            <button onClick={refresh} disabled={refreshing}
              style={{ padding: '9px 15px', borderRadius: 10, border: `1px solid ${C.border2}`, background: C.bg2, color: C.ink, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: SANS }}>
              {refreshing ? 'Refreshing…' : '↻ Refresh'}
            </button>
          </div>
        </div>

        {/* Setup banner when integrations are missing */}
        {anyOff && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', background: C.goldDim, border: `1px solid ${C.gold}33`, borderRadius: 13, padding: '12px 16px', marginBottom: 18 }}>
            <span style={{ fontSize: 17 }}>🔌</span>
            <div style={{ fontSize: 13, color: C.ink, flex: 1, minWidth: 220 }}>
              <b>Connect your sources to see live numbers.</b> Add these in Vercel → the5th-website → Settings → Environment Variables, then redeploy. Until then these panels stay empty — no estimates are shown.
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {!integ.whop && <code style={codeChip}>WHOP_API_KEY</code>}
              {!integ.wise && <code style={codeChip}>WISE_API_TOKEN</code>}
              {!integ.calcom && <code style={codeChip}>CALCOM_API_KEY</code>}
            </div>
          </div>
        )}

        {/* Hero KPIs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(190px,1fr))', gap: 12, marginBottom: 20 }}>
          <Hero label="MRR" value={integ.whop ? money(rev.mrr, cur) : null} need="whop" accent={C.green} sub={integ.whop ? `${money(rev.arr, cur)} ARR` : undefined} />
          <Hero label="Revenue · 30d" value={integ.whop ? money(rev.revenue30d, cur) : null} need="whop" sub={integ.whop ? `${rev.newSales30d} sales` : undefined} />
          <Hero label="Active members" value={g.activeMembers} accent={C.plum2} sub={`${g.totalMembers} total`} />
          <Hero label="Upcoming calls" value={integ.calcom ? bk.upcomingTotal : null} need="calcom" accent={C.lav} sub={integ.calcom ? `${bk.upcoming7d} in 7d` : undefined} />
        </div>

        {/* AI Daily Brief */}
        <Panel style={{ marginBottom: 20, background: 'linear-gradient(180deg,#fffdf8,#faf5ec)', borderColor: `${C.gold}30` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, marginBottom: brief ? 16 : 0, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 18 }}>🧠</span>
              <div style={{ fontFamily: SERIF, fontSize: 19, fontWeight: 700, color: C.plum }}>AI Daily COO Brief</div>
              {brief?.momentum && <Badge c={MOMENTUM[brief.momentum]?.c || C.text2}>{MOMENTUM[brief.momentum]?.label || brief.momentum}</Badge>}
            </div>
            <button onClick={genBrief} disabled={briefLoading}
              style={{ padding: '9px 18px', borderRadius: 10, border: 'none', background: C.plum, color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: SANS }}>
              {briefLoading ? 'Analyzing…' : brief ? 'Regenerate' : 'Generate brief'}
            </button>
          </div>
          {brief ? (
            <div>
              <div style={{ fontFamily: SERIF, fontSize: 20, color: C.ink, marginBottom: 5 }}>{brief.headline}</div>
              {brief.momentum_reason && <div style={{ fontSize: 13.5, color: C.text2, marginBottom: 18 }}>{brief.momentum_reason}</div>}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(230px,1fr))', gap: 16 }}>
                <BriefList title="Needs attention" items={brief.attention} render={(a: any) => (<><b>{a.icon} {a.title}</b><div style={liDetail}>{a.detail}</div>{a.action && <div style={{ color: C.green, fontSize: 12, marginTop: 3, fontWeight: 600 }}>→ {a.action}</div>}</>)} />
                <BriefList title="Wins" items={brief.wins} render={(a: any) => (<><b>{a.title}</b><div style={liDetail}>{a.detail}</div></>)} />
                <BriefList title="Risks" items={brief.risks} render={(a: any) => (<><b>{a.title}</b><div style={liDetail}>{a.detail}</div></>)} />
                <BriefList title="Opportunities" items={brief.opportunities} render={(a: any) => (<><b>{a.title}</b><div style={liDetail}>{a.detail}</div></>)} />
              </div>
            </div>
          ) : !briefLoading && (
            <div style={{ fontSize: 13, color: C.text2, marginTop: 12 }}>Generate a COO-level read of the whole business — attention items, wins, risks, opportunities — grounded strictly in today&apos;s real numbers.</div>
          )}
        </Panel>

        {/* Revenue */}
        <SectionTitle right={integ.whop ? 'live · Whop' : undefined}>Revenue</SectionTitle>
        {integ.whop ? (
          <>
            <StatRow>
              <Stat label="MRR" value={money(rev.mrr, cur)} accent={C.green} />
              <Stat label="ARR" value={money(rev.arr, cur)} />
              <Stat label="Revenue · 30d" value={money(rev.revenue30d, cur)} />
              <Stat label="Revenue · 7d" value={money(rev.revenue7d, cur)} />
              <Stat label="New sales · 30d" value={rev.newSales30d} />
              <Stat label="Refunds · 30d" value={money(rev.refunds30d, cur)} accent={rev.refunds30d ? C.red : undefined} />
              <Stat label="Failed payments" value={rev.failedPayments} accent={rev.failedPayments ? C.red : undefined} />
              <Stat label="Active subscriptions" value={rev.activeMemberships} accent={C.plum2} />
            </StatRow>
            <Grid>
              <Panel><PanelH>MRR by plan</PanelH>{rev.mrrByPlan?.length ? rev.mrrByPlan.map((p: any) => <Row key={p.label} left={`${p.label} · ${p.count}`} right={`${money(p.mrr, cur)}/mo`} />) : <Empty>No active recurring plans yet.</Empty>}</Panel>
              <Panel><PanelH>Revenue trend · 14d</PanelH>{rev.trend?.some((x: any) => x.amount) ? <Spark data={rev.trend.map((x: any) => x.amount)} color={C.green} /> : <Empty>No payments in the last 14 days.</Empty>}</Panel>
            </Grid>
          </>
        ) : (
          <ConnectCard icon="💳" title="Connect Whop to see revenue" env="WHOP_API_KEY"
            steps={['whop.com dashboard → Developer → Company API keys → Create', 'Copy the key', 'Vercel → the5th-website → Settings → Environment Variables → add WHOP_API_KEY', 'Redeploy']}
            note={rev.note} />
        )}

        {/* Cash in bank (Wise) */}
        <SectionTitle right={integ.wise ? 'live · Wise' : undefined}>Cash in Bank</SectionTitle>
        {integ.wise ? (
          cash.balances?.length ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 11, marginBottom: 22 }}>
              {cash.balances.map((b: any) => (
                <Stat key={b.currency + b.type} label={`${b.currency}${b.type && b.type !== 'STANDARD' ? ' · ' + b.type : ''}`} value={money(b.value, b.currency)} accent={C.green} />
              ))}
            </div>
          ) : (
            <Panel style={{ marginBottom: 22 }}><Empty>Wise connected — no balances found on this profile.</Empty></Panel>
          )
        ) : (
          <ConnectCard icon="🏦" title="Connect Wise to see cash balances" env="WISE_API_TOKEN"
            steps={['Wise → Settings → API tokens → create a read-only token', 'Copy the token', 'Vercel → Settings → Environment Variables → add WISE_API_TOKEN (optionally WISE_PROFILE_ID)', 'Redeploy']}
            note={cash.note} />
        )}

        {/* Growth */}
        <SectionTitle right="live · your database">Growth</SectionTitle>
        <StatRow>
          <Stat label="Total members" value={g.totalMembers} />
          <Stat label="Active" value={g.activeMembers} accent={C.green} />
          <Stat label="New · 7d" value={`+${g.newMembers7d}`} />
          <Stat label="New · 30d" value={`+${g.newMembers30d}`} />
          <Stat label="Coaching active" value={g.coachingActive} accent={C.lav} />
          <Stat label="Trial → paid" value={`${g.trialConversionRate}%`} sub={`${g.trialsConverted}/${g.trials}`} />
          <Stat label="Cancellations" value={g.cancellations} accent={g.cancellations ? C.red : undefined} />
        </StatRow>
        <Grid>
          <Panel><PanelH>Signups · 14d</PanelH><Spark data={g.signupTrend.map((x: any) => x.count)} color={C.lav} /></Panel>
          <Panel><PanelH>Members by tier</PanelH>{g.membersByTier?.length ? g.membersByTier.map((t: any) => <Row key={t.tier} left={t.label} right={t.count} />) : <Empty>No members yet.</Empty>}</Panel>
        </Grid>

        {/* Funnel */}
        <SectionTitle right="live · your database">Quiz Funnel &amp; Pipeline</SectionTitle>
        <Grid>
          <Panel>
            <PanelH>Quiz → member ({f.quizConversionRate}% convert)</PanelH>
            <Funnel steps={[{ label: 'Leads', n: f.quizTotal }, { label: 'Watched video', n: f.quizVideo }, { label: 'Booked call', n: f.quizBooked }, { label: 'Converted', n: f.quizConverted }]} />
            {f.quizRevenueLogged > 0 && <div style={{ fontSize: 12.5, color: C.text2, marginTop: 10 }}>Revenue logged by leads: <b>{money(f.quizRevenueLogged, cur)}</b></div>}
          </Panel>
          <Panel>
            <PanelH>Sales pipeline</PanelH>
            {Object.keys(f.pipelineByStage).length ? Object.entries(f.pipelineByStage).map(([k, v]: any) => <Row key={k} left={k} right={v} />) : <Empty>No leads in pipeline.</Empty>}
            {Object.keys(f.profileTypes).length > 0 && (<><div style={hr} /><PanelH>Lead profiles</PanelH>{Object.entries(f.profileTypes).map(([k, v]: any) => <Row key={k} left={k} right={v} />)}</>)}
          </Panel>
        </Grid>

        {/* Product usage */}
        <SectionTitle right="live · your database">Product Usage</SectionTitle>
        <StatRow>
          <Stat label="AI messages (all-time)" value={(u.totalAiMessages || 0).toLocaleString()} accent={C.lav} />
          <Stat label="Active AI users · 7d" value={u.aiActive7d} />
          <Stat label="Conversations · 30d" value={u.conversations30d} />
          <Stat label="Active sessions · 7d" value={u.activeSessions7d} accent={C.green} />
          <Stat label="Missions done · 7d" value={u.missionsCompleted7d} />
        </StatRow>
        <Panel style={{ marginBottom: 22 }}>
          <PanelH>Member activity logged · 7d</PanelH>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
            <MiniStat label="DMs sent" value={u.tracker.dms} />
            <MiniStat label="Calls booked" value={u.tracker.calls} />
            <MiniStat label="Sales closed" value={u.tracker.sales} />
            <MiniStat label="Cash collected" value={money(u.tracker.cash, cur)} accent={C.green} />
          </div>
        </Panel>

        {/* Bookings + Email */}
        <SectionTitle right={integ.calcom ? 'live · Cal.com' : undefined}>Bookings &amp; Email</SectionTitle>
        <Grid>
          {integ.calcom ? (
            <Panel>
              <PanelH>Upcoming calls · Cal.com</PanelH>
              <div style={{ display: 'flex', gap: 14, marginBottom: 12, fontSize: 12.5, color: C.text2, flexWrap: 'wrap' }}>
                <span>7d: <b>{bk.upcoming7d}</b></span><span>Booked 30d: <b>{bk.booked30d}</b></span>
                <span>Cancelled: <b>{bk.cancelled30d}</b></span><span>No-shows: <b style={{ color: bk.noShows30d ? C.red : C.ink }}>{bk.noShows30d}</b></span>
              </div>
              {bk.upcoming?.length ? bk.upcoming.map((c: any) => (
                <Row key={c.id} left={`${c.title}${c.attendee && c.attendee !== '—' ? ' · ' + c.attendee : ''}`} right={new Date(c.start).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })} />
              )) : <Empty>No upcoming bookings.</Empty>}
            </Panel>
          ) : (
            <ConnectCard icon="📅" title="Connect Cal.com for bookings" env="CALCOM_API_KEY"
              steps={['Cal.com → Settings → Developer → API keys', 'Copy the cal_live_ key', 'Vercel → Settings → Environment Variables → add CALCOM_API_KEY', 'Redeploy']}
              note={bk.note} inline />
          )}
          <Panel>
            <PanelH>Email lists {em.connected ? '· Brevo' : ''}</PanelH>
            {em.connected ? (<>{em.lists.map((l: any) => <Row key={l.label} left={l.label} right={l.contacts.toLocaleString()} />)}<div style={hr} /><Row left={<b>Total contacts</b>} right={<b>{em.totalContacts.toLocaleString()}</b>} /></>) : <Empty>{em.note || 'Brevo not connected.'}</Empty>}
            <div style={hr} />
            <Row left="Recorded coaching calls · 30d" right={bk.recordedCalls30d} />
          </Panel>
        </Grid>

        <div style={{ textAlign: 'center', fontSize: 11.5, color: C.text3, marginTop: 30 }}>
          Generated {new Date(data.generatedAt).toLocaleString()} · The5th Command Center · showing real data only
        </div>
      </div>
    </div>
  )
}

/* ── UI primitives ── */
const codeChip: React.CSSProperties = { fontSize: 11.5, fontWeight: 700, background: '#fff', border: `1px solid ${C.gold}44`, color: C.gold, padding: '4px 9px', borderRadius: 7, fontFamily: 'ui-monospace,Menlo,monospace' }
const liDetail: React.CSSProperties = { color: C.text2, fontSize: 12.5 }
const hr: React.CSSProperties = { height: 1, background: C.border, margin: '11px 0' }

function Center({ children }: { children: React.ReactNode }) {
  return <div style={{ minHeight: 320, background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: SANS, color: C.text2, fontSize: 15, padding: 24, textAlign: 'center', borderRadius: 12 }}>{children}</div>
}
function Panel({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <div style={{ background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 16, padding: 20, boxShadow: C.card, ...style }}>{children}</div>
}
function PanelH({ children }: { children: React.ReactNode }) {
  return <div style={{ fontSize: 11.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: C.text2, marginBottom: 12 }}>{children}</div>
}
function SectionTitle({ children, right }: { children: React.ReactNode; right?: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '8px 2px 12px' }}>
      <div style={{ fontFamily: SERIF, fontSize: 16, fontWeight: 700, color: C.plum }}>{children}</div>
      {right && <span style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase', color: C.green, background: C.greenDim, padding: '3px 9px', borderRadius: 20 }}>{right}</span>}
    </div>
  )
}
function StatRow({ children }: { children: React.ReactNode }) {
  return <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(148px,1fr))', gap: 11, marginBottom: 16 }}>{children}</div>
}
function Grid({ children }: { children: React.ReactNode }) {
  return <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 14, marginBottom: 22 }}>{children}</div>
}
function Hero({ label, value, sub, accent, need }: { label: string; value: any; sub?: string; accent?: string; need?: string }) {
  const off = value === null || value === undefined
  return (
    <div style={{ background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 15, padding: '16px 18px', boxShadow: C.card }}>
      <div style={{ fontSize: 12, color: C.text2, marginBottom: 7, fontWeight: 600 }}>{label}</div>
      {off ? (
        <div style={{ fontFamily: SERIF, fontSize: 20, fontWeight: 700, color: C.text3 }}>—</div>
      ) : (
        <div style={{ fontFamily: SERIF, fontSize: 30, fontWeight: 700, color: accent || C.ink, lineHeight: 1 }}>{value}</div>
      )}
      {off ? <div style={{ fontSize: 11, color: C.gold, marginTop: 6, fontWeight: 600 }}>needs {NEEDS[need || '']}</div> : sub ? <div style={{ fontSize: 11.5, color: C.text3, marginTop: 6 }}>{sub}</div> : null}
    </div>
  )
}
function Stat({ label, value, sub, accent }: { label: string; value: any; sub?: string; accent?: string }) {
  return (
    <div style={{ background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 13, padding: '13px 15px', boxShadow: C.card }}>
      <div style={{ fontSize: 11.5, color: C.text2, marginBottom: 5, fontWeight: 600 }}>{label}</div>
      <div style={{ fontFamily: SERIF, fontSize: 23, fontWeight: 700, color: accent || C.ink, lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: C.text3, marginTop: 4 }}>{sub}</div>}
    </div>
  )
}
function MiniStat({ label, value, accent }: { label: string; value: any; accent?: string }) {
  return <div style={{ textAlign: 'center', padding: '6px 4px' }}><div style={{ fontFamily: SERIF, fontSize: 22, fontWeight: 700, color: accent || C.ink }}>{value}</div><div style={{ fontSize: 11, color: C.text2, marginTop: 2 }}>{label}</div></div>
}
function Row({ left, right }: { left: React.ReactNode; right: React.ReactNode }) {
  return <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, padding: '7px 0', borderBottom: `1px solid ${C.border}`, fontSize: 13.5 }}><span style={{ color: C.text2, textTransform: 'capitalize' }}>{left}</span><span style={{ fontWeight: 600, whiteSpace: 'nowrap' }}>{right}</span></div>
}
function Empty({ children }: { children: React.ReactNode }) {
  return <div style={{ fontSize: 13, color: C.text3, padding: '8px 0' }}>{children}</div>
}
function Badge({ c, children }: { c: string; children: React.ReactNode }) {
  return <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, color: '#fff', background: c }}>{children}</span>
}
function IntegChip({ on, label }: { on: boolean; label: string }) {
  return <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, color: on ? C.green : C.text3, background: on ? C.greenDim : 'transparent', border: `1px solid ${on ? 'transparent' : C.border2}`, padding: '5px 10px', borderRadius: 20 }}><span style={{ width: 7, height: 7, borderRadius: '50%', background: on ? C.green : C.text3 }} />{label}</span>
}
function BriefList({ title, items, render }: { title: string; items: any[]; render: (i: any) => React.ReactNode }) {
  if (!items?.length) return null
  return (
    <div>
      <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: C.text2, marginBottom: 8 }}>{title}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>{items.map((it, i) => <div key={i} style={{ fontSize: 13.5, lineHeight: 1.4 }}>{render(it)}</div>)}</div>
    </div>
  )
}
function Spark({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(1, ...data)
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 66 }}>
      {data.map((v, i) => <div key={i} title={`${v}`} style={{ flex: 1, height: `${Math.max(4, (v / max) * 100)}%`, background: color, opacity: 0.25 + 0.75 * (v / max), borderRadius: 3, minHeight: 3 }} />)}
    </div>
  )
}
function Funnel({ steps }: { steps: { label: string; n: number }[] }) {
  const top = Math.max(1, steps[0]?.n || 1)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {steps.map((s, i) => (
        <div key={i}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, marginBottom: 3 }}><span style={{ color: C.text2 }}>{s.label}</span><span style={{ fontWeight: 700 }}>{s.n}{i > 0 ? ` · ${Math.round((s.n / top) * 100)}%` : ''}</span></div>
          <div style={{ height: 10, background: C.greenDim, borderRadius: 6, overflow: 'hidden' }}><div style={{ width: `${Math.max(2, (s.n / top) * 100)}%`, height: '100%', background: C.green, borderRadius: 6 }} /></div>
        </div>
      ))}
    </div>
  )
}
function ConnectCard({ icon, title, env, steps, note, inline }: { icon: string; title: string; env: string; steps: string[]; note?: string; inline?: boolean }) {
  return (
    <div style={{ gridColumn: inline ? 'auto' : '1 / -1', background: 'linear-gradient(180deg,#fffdf8,#faf5ec)', border: `1px dashed ${C.gold}66`, borderRadius: 16, padding: 22, marginBottom: inline ? 0 : 22 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
        <span style={{ fontSize: 20 }}>{icon}</span>
        <div style={{ fontFamily: SERIF, fontSize: 18, fontWeight: 700, color: C.plum }}>{title}</div>
        <code style={codeChip}>{env}</code>
      </div>
      <ol style={{ margin: '6px 0 0 18px', padding: 0, fontSize: 13, color: C.text2, lineHeight: 1.9 }}>
        {steps.map((s, i) => <li key={i}>{s}</li>)}
      </ol>
      {note && <div style={{ fontSize: 12, color: C.text3, marginTop: 10 }}>{note}</div>}
    </div>
  )
}
