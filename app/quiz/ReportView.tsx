'use client'
/* The Income OS profile + report. Rendered from a deterministic Result, so it is
   instant and identical for the same answers. No AI, no waiting. */
import { useEffect, useRef, useState } from 'react'
import { BLOCKER_IDS, DIM_IDS, type BlockerId, type DimId } from '@/lib/quiz/questions'
import { BLOCKERS, DIM_COPY, GOAL_LABEL } from '@/lib/quiz/content'
import { BAND_LABEL, dimBandOf, type Result } from '@/lib/quiz/engine'
import { casesFor, SITE_FACTS } from '@/lib/quiz/real'
import { whopTrack } from '@/lib/whop'
import Ic from './Icons'

const money = (n: number) => '$' + Math.round(n).toLocaleString('en-US')
const HIST = 'a5_quiz_hist'

/* ── confetti (canvas, self-cleaning) ── */
export function fireConfetti() {
  if (typeof document === 'undefined' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  const c = document.createElement('canvas')
  c.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:400'
  c.width = innerWidth; c.height = innerHeight
  document.body.appendChild(c)
  const ctx = c.getContext('2d')!
  const cols = ['#E4C879', '#C9A84C', '#ffffff', '#c9a6dc', '#7EE0C3']
  const ps = Array.from({ length: 130 }, () => ({ x: c.width / 2, y: c.height * 0.45, vx: (Math.random() - 0.5) * 16, vy: -Math.random() * 15 - 4, s: 4 + Math.random() * 6, r: Math.random() * 6, vr: (Math.random() - 0.5) * 0.4, col: cols[Math.floor(Math.random() * cols.length)] }))
  const t0 = performance.now()
  const tick = (t: number) => {
    ctx.clearRect(0, 0, c.width, c.height)
    for (const p of ps) { p.vy += 0.42; p.x += p.vx; p.y += p.vy; p.r += p.vr; ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r); ctx.fillStyle = p.col; ctx.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2); ctx.restore() }
    if (t - t0 < 3200) requestAnimationFrame(tick); else c.remove()
  }
  requestAnimationFrame(tick)
}

/* ── six-blocker radar ── */
export function Radar({ r, active, onPick, mini }: { r: Result; active?: BlockerId; onPick?: (b: BlockerId) => void; mini?: boolean }) {
  const C = 200, R = 120
  const pt = (i: number, v: number): [number, number] => { const a = (-90 + i * 60) * Math.PI / 180; return [C + Math.cos(a) * R * v, C + Math.sin(a) * R * v] }
  const poly = BLOCKER_IDS.map((b, i) => pt(i, r.intensities[b] / 100).join(',')).join(' ')
  return (
    <svg viewBox="-50 -10 500 420" className={'qz-radar' + (mini ? ' qz-radar--mini' : '')} role="img" aria-label="Radar chart of your six income blockers">
      <defs><radialGradient id={'rdG' + (mini ? 'm' : '')} cx=".5" cy=".5" r=".6"><stop offset="0" stopColor="#E4C879" stopOpacity=".5" /><stop offset="1" stopColor="#C9A84C" stopOpacity=".12" /></radialGradient></defs>
      {[0.25, 0.5, 0.75, 1].map((s) => <polygon key={s} points={BLOCKER_IDS.map((_, i) => pt(i, s).join(',')).join(' ')} fill="none" stroke="rgba(255,255,255,.14)" strokeWidth="1" />)}
      {BLOCKER_IDS.map((_, i) => <line key={i} x1={C} y1={C} x2={pt(i, 1)[0]} y2={pt(i, 1)[1]} stroke="rgba(255,255,255,.12)" />)}
      <polygon points={poly} fill={`url(#rdG${mini ? 'm' : ''})`} stroke="#E4C879" strokeWidth="3" strokeLinejoin="round" className="qz-radar__shape" />
      {BLOCKER_IDS.map((b, i) => {
        const [x, y] = pt(i, r.intensities[b] / 100)
        const [lx, ly] = pt(i, 1.26)
        const isP = b === r.primary
        return (
          <g key={b} onClick={() => onPick?.(b)} style={{ cursor: onPick ? 'pointer' : 'default' }}>
            <circle cx={x} cy={y} r={isP ? 9 : 6} fill={isP ? '#fff' : '#E4C879'} stroke="#2E1A35" strokeWidth="3" className={isP ? 'qz-pulse' : ''} />
            {!mini && <text x={lx} y={ly} textAnchor={lx < C - 10 ? 'end' : lx > C + 10 ? 'start' : 'middle'} dominantBaseline="middle" className={'qz-radar__lab' + (active === b ? ' on' : '')}>{BLOCKERS[b].name}</text>}
          </g>
        )
      })}
    </svg>
  )
}

/* ── mindset map: four scales, higher = healthier ── */
export function DimBars({ dims }: { dims: Record<DimId, number> }) {
  return (
    <div className="qz-dims">
      {DIM_IDS.map((d) => {
        const band = dimBandOf(dims[d])
        return (
          <div key={d} className={'qz-dim ' + band}>
            <div className="qz-dim__h"><b>{DIM_COPY[d].name}</b><span>{band === 'strong' ? 'Strong' : band === 'developing' ? 'Developing' : 'Needs attention'}</span></div>
            <div className="qz-dim__track"><i style={{ width: `${Math.max(6, dims[d])}%` }} /><em style={{ left: '45%' }} /><em style={{ left: '68%' }} /></div>
          </div>
        )
      })}
    </div>
  )
}

function Ring({ value }: { value: number }) {
  return (
    <svg viewBox="0 0 120 120" className="qz-ring" role="img" aria-label={`Block intensity ${value} out of 100`}>
      <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(255,255,255,.12)" strokeWidth="9" />
      <circle cx="60" cy="60" r="52" fill="none" stroke="url(#rg)" strokeWidth="9" strokeLinecap="round" pathLength={100} strokeDasharray={100} strokeDashoffset={100 - value} transform="rotate(-90 60 60)" className="qz-ring__v" />
      <defs><linearGradient id="rg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#B0902F" /><stop offset="1" stopColor="#F3DC9B" /></linearGradient></defs>
      <text x="60" y="58" textAnchor="middle" className="qz-ring__n">{value}</text>
      <text x="60" y="76" textAnchor="middle" className="qz-ring__l">OUT OF 100</text>
    </svg>
  )
}

/* ── shareable profile card (canvas → PNG) ── */
async function makeCard(r: Result, first: string): Promise<Blob | null> {
  const W = 1080, H = 1350
  const c = document.createElement('canvas'); c.width = W; c.height = H
  const x = c.getContext('2d'); if (!x) return null
  const g = x.createLinearGradient(0, 0, W, H); g.addColorStop(0, '#231029'); g.addColorStop(0.6, '#2E1A35'); g.addColorStop(1, '#1c0d22'); x.fillStyle = g; x.fillRect(0, 0, W, H)
  const glow = x.createRadialGradient(W * 0.8, 200, 0, W * 0.8, 200, 700); glow.addColorStop(0, 'rgba(201,168,76,.35)'); glow.addColorStop(1, 'rgba(201,168,76,0)'); x.fillStyle = glow; x.fillRect(0, 0, W, H)
  x.textAlign = 'left'; x.fillStyle = '#C9A84C'; x.font = '700 30px Helvetica, Arial, sans-serif'; x.fillText('THE5TH INCOME OS', 80, 120)
  x.fillStyle = 'rgba(255,255,255,.7)'; x.font = '400 34px Georgia, serif'; x.fillText(first ? `${first}, you are` : 'You are', 80, 300)
  x.fillStyle = '#fff'; x.font = 'italic 400 110px Georgia, serif'
  const words = r.archetype.split(' '); x.fillText(words.slice(0, 2).join(' '), 80, 420); x.fillText(words.slice(2).join(' '), 80, 540)
  x.fillStyle = '#E4C879'; x.font = '700 40px Helvetica, Arial, sans-serif'; x.fillText(r.profileId, 80, 620)
  const cx = W / 2, cy = 930, R = 270
  const pt = (i: number, v: number) => { const a = (-90 + i * 60) * Math.PI / 180; return [cx + Math.cos(a) * R * v, cy + Math.sin(a) * R * v] }
  x.strokeStyle = 'rgba(255,255,255,.18)'; x.lineWidth = 2
  for (const s of [0.33, 0.66, 1]) { x.beginPath(); BLOCKER_IDS.forEach((_, i) => { const [px, py] = pt(i, s); i ? x.lineTo(px, py) : x.moveTo(px, py) }); x.closePath(); x.stroke() }
  x.beginPath(); BLOCKER_IDS.forEach((b, i) => { const [px, py] = pt(i, r.intensities[b] / 100); i ? x.lineTo(px, py) : x.moveTo(px, py) }); x.closePath()
  x.fillStyle = 'rgba(228,200,121,.32)'; x.fill(); x.strokeStyle = '#E4C879'; x.lineWidth = 6; x.stroke()
  x.font = '600 28px Helvetica, Arial, sans-serif'; x.fillStyle = 'rgba(255,255,255,.85)'
  BLOCKER_IDS.forEach((b, i) => { const [lx, ly] = pt(i, 1.22); x.textAlign = lx < cx - 20 ? 'right' : lx > cx + 20 ? 'left' : 'center'; x.fillText(BLOCKERS[b].name, lx, ly + 10) })
  x.textAlign = 'center'; x.fillStyle = '#C9A84C'; x.font = '700 30px Helvetica, Arial, sans-serif'; x.fillText('Find yours free: the5thglobal.consulting/quiz', W / 2, 1270)
  return await new Promise((res) => c.toBlob((b) => res(b), 'image/png'))
}

export default function ReportView({ r, name, email, auditHref }: { r: Result; name: string; email?: string; auditHref: string }) {
  const first = (name || '').trim().split(' ')[0]
  const P = BLOCKERS[r.primary]
  const S = BLOCKERS[r.secondary]
  const [pick, setPick] = useState<BlockerId>(r.primary)
  const [done, setDone] = useState<Record<string, boolean>>({})
  const [copied, setCopied] = useState(false)
  const [hist, setHist] = useState<{ t: number; code: string; overall: number; i: Record<BlockerId, number>; d: Record<DimId, number> }[]>([])
  const winsKey = `a5_quiz_wins_${r.code}`
  const sent = useRef(false)
  const cases = casesFor(r.niche, 5)
  const maxAmt = Math.max(...cases.map((c) => c.amount))

  useEffect(() => {
    let saved: Record<string, boolean> = {}
    let h: typeof hist = []
    try { saved = JSON.parse(localStorage.getItem(winsKey) || '{}') } catch { /* ignore */ }
    try { h = JSON.parse(localStorage.getItem(HIST) || '[]') } catch { /* ignore */ }
    Promise.resolve().then(() => { setDone(saved); setHist(h) })
  }, [winsKey])

  useEffect(() => {
    if (sent.current) return
    sent.current = true
    whopTrack('quiz_report_viewed')
    try { (window as unknown as { gtag?: (...a: unknown[]) => void }).gtag?.('event', 'quiz_report_view', { primary: r.primary, secondary: r.secondary, profile: r.profileId }) } catch { /* ignore */ }
  }, [r.primary, r.secondary, r.profileId])

  const toggle = (k: string) => {
    const next = { ...done, [k]: !done[k] }
    setDone(next)
    try { localStorage.setItem(winsKey, JSON.stringify(next)) } catch { /* ignore */ }
  }

  const auditClick = (where: string) => {
    whopTrack('audit_cta_click', { where })
    try { (window as unknown as { gtag?: (...a: unknown[]) => void }).gtag?.('event', 'quiz_audit_click', { where, primary: r.primary }) } catch { /* ignore */ }
    if (email) {
      try { fetch('/api/quiz/track', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ event: 'audit_cta_clicked', email, meta: { where, primary: r.primary, secondary: r.secondary } }), keepalive: true }) } catch { /* ignore */ }
    }
  }

  const copy = async () => {
    try { await navigator.clipboard.writeText(`${window.location.origin}/quiz/report?r=${r.code}${first ? `&n=${encodeURIComponent(first)}` : ''}`); setCopied(true); setTimeout(() => setCopied(false), 2000) } catch { /* ignore */ }
  }

  const share = async () => {
    const blob = await makeCard(r, first)
    if (!blob) return
    const file = new File([blob], 'my-income-os-profile.png', { type: 'image/png' })
    const nav = navigator as Navigator & { canShare?: (d: unknown) => boolean }
    try {
      if (nav.canShare?.({ files: [file] })) { await nav.share({ files: [file], text: `I am ${r.archetype} (${r.profileId}). Find your income blocker free:`, url: `${location.origin}/quiz` }); return }
    } catch { /* fall through to download */ }
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'my-income-os-profile.png'; document.body.appendChild(a); a.click(); a.remove()
  }

  const picked = BLOCKERS[pick]
  const pct = (v: number) => Math.min(100, Math.round((v / r.gap.target) * 100))
  const prev = hist.length >= 2 ? hist[hist.length - 2] : null
  const ready = r.readiness === 'hot' ? 'Ready to act' : r.readiness === 'warm' ? 'Warming up' : 'Exploring'

  return (
    <div className="qz-report">
      {/* ── 1. Profile ── */}
      <section className="qz-rep-hero">
        <div className="qz-rep-hero__txt">
          <span className="qz-chip">Your Income OS profile</span>
          <h1 className="qz-rep-h1">{first ? `${first}, you are ` : 'You are '}<em>{P.archetype}.</em></h1>
          <p className="qz-rep-id"><b>{r.profileId}</b><span>{BAND_LABEL[r.band]} intensity</span></p>
          <p className="qz-rep-lead">{P.tagline}</p>
          <p className="qz-rep-pair">{r.pair}</p>
          <div className="qz-rep-tags"><span style={{ borderColor: P.color, color: P.color }}>Main blocker: {P.name}</span><span style={{ borderColor: S.color, color: S.color }}>Second: {S.name}</span><span style={{ borderColor: 'rgba(255,255,255,.4)', color: 'rgba(255,255,255,.85)' }}>{ready}</span></div>
          <div className="qz-rep-actions"><button type="button" className="qz-btn qz-btn--ghost" onClick={share}><Ic name="gift" size={18} />Share my profile card</button></div>
        </div>
        <div className="qz-rep-hero__vis">
          <Radar r={r} active={pick} onPick={setPick} />
          <div className="qz-rep-ring"><Ring value={r.overall} /><span>Block intensity</span></div>
        </div>
      </section>

      {/* ── 2. Blockers ── */}
      <section className="qz-block">
        <div className="qz-sec-h"><span className="qz-kicker">Module 1 · Your six blockers</span><h2>Where the pressure is, and where it is not.</h2><p>Tap any blocker to see what it means. Higher means it is holding more of your income back.</p></div>
        <div className="qz-bars">
          {r.order.map((b, i) => (
            <button key={b} type="button" className={'qz-bar' + (pick === b ? ' on' : '')} onClick={() => setPick(b)}>
              <span className="qz-bar__n">{i + 1}</span>
              <span className="qz-bar__t"><b>{BLOCKERS[b].name}</b><i style={{ width: `${r.intensities[b]}%`, background: BLOCKERS[b].color }} /></span>
              <span className="qz-bar__v">{r.intensities[b]}</span>
            </button>
          ))}
        </div>
        <div className="qz-pick" key={pick}>
          <div className="qz-pick__h"><span style={{ background: picked.color }} /> {picked.name}: {picked.archetype}</div>
          <p>{picked.tagline}</p>
          <p>{picked.whatItIs[0]}</p>
        </div>
      </section>

      {/* ── 3. Mindset map ── */}
      <section className="qz-block">
        <div className="qz-sec-h"><span className="qz-kicker">Module 2 · Your money mindset map</span><h2>The beliefs behind the numbers.</h2><p>Four scales, scored from your answers. The gold marks show where Developing and Strong begin.</p></div>
        <div className="qz-card"><DimBars dims={r.dims} /></div>
        <div className="qz-dimtxt">{DIM_IDS.map((d) => <div key={d} className="qz-card"><span className="qz-kicker">{DIM_COPY[d].name}</span><p>{DIM_COPY[d][dimBandOf(r.dims[d])]}</p></div>)}</div>
      </section>

      {/* ── 4. Strengths + blind spots ── */}
      <section className="qz-block qz-duo">
        <div className="qz-card qz-card--good"><span className="qz-kicker" style={{ color: '#7EE0C3' }}>Module 3 · Your strengths</span><h3>What is already working for you</h3><ul>{r.strengths.map((s) => <li key={s}><Ic name="check" size={20} />{s}</li>)}</ul></div>
        <div className="qz-card qz-card--warn"><span className="qz-kicker" style={{ color: '#FF9D7E' }}>Blind spots</span><h3>What your answers contradict</h3>{r.blindSpots.length ? <ul>{r.blindSpots.map((s) => <li key={s}><Ic name="eye" size={20} />{s}</li>)}</ul> : <p>Your answers are consistent. No major blind spots showed up, which is a good sign.</p>}</div>
      </section>

      {r.signals.length > 0 && (
        <section className="qz-block qz-words">
          <div className="qz-sec-h"><span className="qz-kicker">In your own words</span><h2>This is what your answers told us.</h2></div>
          <ul>{r.signals.map((s) => <li key={s}><Ic name="voice" size={22} />{s}</li>)}</ul>
        </section>
      )}

      {/* ── 5. Deep dive ── */}
      <section className="qz-block qz-deep">
        <div className="qz-sec-h"><span className="qz-kicker">Module 4 · Your main blocker, explained</span><h2>{P.name}: what it is and why it persists.</h2></div>
        <div className="qz-deep__grid">
          <div className="qz-card">{P.whatItIs.map((t) => <p key={t}>{t}</p>)}<h3>Why it persists</h3><p>{P.why}</p><h3>What it quietly costs</h3><p>{P.costs}</p></div>
          <div className="qz-card qz-card--signs"><h3>You might recognise this</h3><ul>{P.signs.map((s) => <li key={s}><Ic name="check" size={20} />{s}</li>)}</ul></div>
        </div>
        <div className="qz-shifts">{P.shifts.map((s, i) => <div key={s} className="qz-shift"><b>0{i + 1}</b><span>{s}</span></div>)}</div>
      </section>

      {/* ── 6. The gap + real data ── */}
      <section className="qz-block qz-gap">
        <div className="qz-sec-h"><span className="qz-kicker">Module 5 · What it is costing you</span><h2>The distance between today and the number you named.</h2></div>
        <div className="qz-gap__card">
          <div className="qz-gap__row"><span>Today</span><div className="qz-gap__track"><i style={{ width: `${pct(r.gap.current)}%` }} className="now" /></div><b>{money(r.gap.current)}</b></div>
          <div className="qz-gap__row"><span>Your goal</span><div className="qz-gap__track"><i style={{ width: '100%' }} className="goal" /></div><b>{money(r.gap.target)}</b></div>
          <div className="qz-gap__big"><div><small>Monthly gap</small><b>{money(r.gap.monthly)}</b></div><div><small>Over 12 months</small><b>{money(r.gap.yearly)}</b></div></div>
          <p>{r.incomeLine}</p>
          <p className="qz-fine">Simple arithmetic from the income you entered and the goal you chose ({GOAL_LABEL[r.goalKey] ? `about ${GOAL_LABEL[r.goalKey]}` : ''}). It is not a forecast or a promise of results.</p>
        </div>
        <div className="qz-real">
          <span className="qz-kicker">Real data · published results from experts like you</span>
          <h3>What others in {r.nicheLine.who.split(' ').slice(0, 3).join(' ')} and nearby fields reported</h3>
          <div className="qz-real__bars">
            {cases.map((c) => (
              <div key={c.name} className="qz-real__row"><span><b>{c.name}</b><small>{c.role}</small></span><div><i style={{ width: `${Math.max(6, (c.amount / maxAmt) * 100)}%` }} /></div><strong>{money(c.amount)}{c.plus ? '+' : ''}<em>{c.when}</em></strong></div>
            ))}
          </div>
          <p className="qz-fine">Published client results from the5thglobal.consulting/results. Across {SITE_FACTS.clients} experts in {SITE_FACTS.nations} nations the average client lands a first paying client in about {SITE_FACTS.avgDaysToFirstClient} days. Individual results vary and are not a promise.</p>
        </div>
      </section>

      {/* ── 7. Second blocker + niche + move ── */}
      <section className="qz-block qz-trio">
        <div className="qz-card"><span className="qz-kicker" style={{ color: S.color }}>Your second blocker</span><h3>{S.name}</h3><p>{S.tagline}</p></div>
        <div className="qz-card"><span className="qz-kicker">For {r.nicheLine.who}</span><h3>What your clients buy</h3><p>{r.nicheLine.line}</p></div>
        <div className="qz-card qz-card--gold"><span className="qz-kicker">Your best next move</span><h3>Where to start</h3><p>{r.stageMove}</p></div>
      </section>

      {/* ── 8. Readiness ── */}
      <section className="qz-block">
        <div className="qz-sec-h"><span className="qz-kicker">Module 6 · Your readiness</span><h2>{ready}.</h2></div>
        <div className="qz-ready"><div className="qz-ready__track"><i style={{ width: `${r.readinessScore}%` }} /></div><div className="qz-ready__lab"><span>Exploring</span><span>Warming up</span><span>Ready to act</span></div><p>{r.readiness === 'hot' ? 'You want change soon and have the time and willingness to act. The fastest path is a focused conversation about your numbers.' : r.readiness === 'warm' ? 'You are close to moving. A clear next step and a small commitment will turn interest into momentum.' : 'You are gathering information, which is a smart place to start. Use the quick wins below while you decide.'}</p></div>
      </section>

      {/* ── 9. Quick wins + plan ── */}
      <section className="qz-block qz-wins">
        <div className="qz-sec-h"><span className="qz-kicker">Do these this week</span><h2>Three quick wins for {P.name.toLowerCase()}.</h2><p>Tick them off. Each takes under an hour.</p></div>
        <div className="qz-wins__list">
          {P.wins.map((w, i) => (
            <button key={w} type="button" className={'qz-win' + (done[w] ? ' on' : '')} onClick={() => toggle(w)} aria-pressed={!!done[w]}>
              <span className="qz-win__box">{done[w] ? <Ic name="check" size={22} sw={3.2} /> : <b>{i + 1}</b>}</span><span>{w}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="qz-block qz-plan">
        <div className="qz-sec-h"><span className="qz-kicker">Module 7 · Your 7-day starter plan</span><h2>One small action a day, in the right order.</h2></div>
        <ol className="qz-days">{P.plan.map((d, i) => (<li key={d.day}><div className="qz-days__n">{i + 1}</div><div><small>{d.day}</small><h3>{d.title}</h3><p>{d.task}</p></div></li>))}</ol>
      </section>

      {/* ── 10. Tracker ── */}
      <section className="qz-block qz-track">
        <div className="qz-sec-h"><span className="qz-kicker">Module 8 · Track your progress</span><h2>Retake in 30 days and watch it move.</h2></div>
        <div className="qz-card">
          {prev ? (
            <><p>Compared with your last assessment:</p><div className="qz-delta">{r.order.slice(0, 3).map((b) => { const d = r.intensities[b] - prev.i[b]; return <div key={b}><span>{BLOCKERS[b].name}</span><b className={d <= 0 ? 'up' : 'down'}>{d > 0 ? '+' : ''}{d}</b></div> })}<div><span>Overall</span><b className={r.overall - prev.overall <= 0 ? 'up' : 'down'}>{r.overall - prev.overall > 0 ? '+' : ''}{r.overall - prev.overall}</b></div></div><p className="qz-fine">Lower blocker scores mean less holding you back.</p></>
          ) : (
            <p>Your profile ID is <b>{r.profileId}</b>. Do the 7-day plan, then retake the assessment in about 30 days. We will show you exactly which blockers moved, and by how much.</p>
          )}
          <a href="/quiz" className="qz-btn qz-btn--ghost" style={{ marginTop: 14 }}>Retake the assessment</a>
        </div>
      </section>

      {/* ── 11. The audit ── */}
      <section className="qz-audit" id="audit">
        <div className="qz-audit__in">
          <div className="qz-audit__head">
            <span className="qz-chip">The next step</span>
            <h2>A report finds the block. <em>A 60-minute audit removes it.</em></h2>
            <p>You now know your main blocker is <b>{P.name}</b> and your second is <b>{S.name}</b>. On the call, Indrodip and Manisha open your profile <b>({r.profileId})</b>, look at your real numbers and turn it into a plan for your business.</p>
          </div>
          <div className="qz-audit__grid">
            <div className="qz-audit__card">
              <h3>On your call we will</h3>
              <ul>
                <li><Ic name="doc" size={22} />Open this profile and confirm what is really behind your <b>{P.name.toLowerCase()}</b> block</li>
                {P.audit.map((a) => <li key={a}><Ic name="check" size={22} />{a}</li>)}
                <li><Ic name="map" size={22} />Leave you with a written audit and a 100-day roadmap</li>
              </ul>
              <p className="qz-audit__bonus">After your session you also receive the 104-page <i>Expertise to Income</i> workbook and access to The5th AI.</p>
            </div>
            <div className="qz-audit__buy">
              <div className="qz-audit__who"><img src="/images/founder-og.jpg" alt="Indrodip Ghosh" width={52} height={52} /><img src="/images/manisha-avatar.jpg" alt="Manisha Satpute" width={52} height={52} /><span><b>Indrodip Ghosh &amp; Manisha Satpute</b><small>60 minutes, 1:1, on video</small></span></div>
              <div className="qz-audit__price"><b>$29</b><span>Private Business Audit</span></div>
              <a href={auditHref} className="qz-btn qz-btn--gold qz-btn--xl" onClick={() => auditClick('buy-card')}>Book my $29 audit <i>→</i></a>
              <ul className="qz-audit__trust">
                <li><Ic name="shield" size={18} />7-day money-back guarantee</li>
                <li><Ic name="lock" size={18} />Secure checkout, powered by Whop</li>
                <li><Ic name="clock" size={18} />Pick your time right after booking</li>
              </ul>
              <p className="qz-fine">Your profile is linked to your booking by email, so we arrive prepared. Have your last 90 days of revenue and your current offer and price ready.</p>
            </div>
          </div>
          <div className="qz-audit__why">
            <h3>Why a call, and not another course?</h3>
            <div>
              <p><b>Because the block is personal.</b> Two people with the same score can need different next steps. The audit is where your numbers, your offer and your profile come together.</p>
              <p><b>Because it costs less than one coffee a week.</b> It is a $29 decision with a 7-day guarantee, so the risk is small and the clarity is immediate.</p>
              <p><b>Because it is not a sales pitch.</b> It is a working session. You keep the written audit and roadmap whatever you decide next.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="qz-block qz-foot">
        <button type="button" className="qz-btn qz-btn--ghost" onClick={copy}>{copied ? 'Link copied' : 'Copy a link to this profile'}</button>
        <p className="qz-fine">This assessment is educational and based only on the answers you gave. It is not a clinical or validated psychological test, not a guarantee of results, and not therapy, medical, legal or financial advice. Individual results vary.</p>
      </section>

      <div className="qz-sticky"><a href={auditHref} className="qz-btn qz-btn--gold" onClick={() => auditClick('sticky')}>Book my $29 audit →</a></div>
    </div>
  )
}
