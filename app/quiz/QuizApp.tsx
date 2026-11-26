'use client'
/* The5th Income OS: the Income Blocker Assessment.
   Game-style, one screen at a time, live charts, real client data, zero AI.
   intro → 18 screens in 4 parts (with chart breaks) → email gate → reveal → report → $29 audit. */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { QUESTIONS, PARTS, DIM_IDS, type Answers, type Opt, type PartId, type Q } from '@/lib/quiz/questions'
import { BLOCKERS, DIM_COPY } from '@/lib/quiz/content'
import { score, decode, dimBandOf, type Result } from '@/lib/quiz/engine'
import { casesFor, SITE_FACTS } from '@/lib/quiz/real'
import { whopTrack } from '@/lib/whop'
import Ic from './Icons'
import ReportView, { Radar, DimBars, fireConfetti } from './ReportView'

type Phase = 'intro' | 'q' | 'break' | 'gate' | 'build' | 'reveal' | 'report'

const TOTAL = QUESTIONS.length
const STORE = 'a5_quiz_v2'
const HIST = 'a5_quiz_hist'
const BADGES: Record<PartId, string> = { business: 'Business Mapper', mindset: 'Mindset Mapper', patterns: 'Pattern Detective', readiness: 'Readiness Scout' }
const BUILD_STEPS = ['Reading your 18 answers', 'Scoring six income blockers', 'Mapping your money mindset', 'Matching your profile to 30 types', 'Writing your personal plan']
const money = (n: number) => '$' + Math.round(n).toLocaleString('en-US')

function gt(name: string, params?: Record<string, unknown>) {
  try { (window as unknown as { gtag?: (...a: unknown[]) => void }).gtag?.('event', name, params) } catch { /* ignore */ }
}
function buzz(ms = 8) { try { navigator.vibrate?.(ms) } catch { /* ignore */ } }

export default function QuizApp() {
  const [phase, setPhase] = useState<Phase>('intro')
  const [idx, setIdx] = useState(0)
  const [answers, setAnswers] = useState<Answers>({})
  const [first, setFirst] = useState('')
  const [last, setLast] = useState('')
  const [email, setEmail] = useState('')
  const [trap, setTrap] = useState('')
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  const [reflect, setReflect] = useState('')
  const [buildStep, setBuildStep] = useState(0)
  const [dir, setDir] = useState(1)
  const [flip, setFlip] = useState(false)
  const [breakPart, setBreakPart] = useState<PartId>('business')
  const [saved, setSaved] = useState<{ code: string; name: string; email: string } | null>(null)
  const [pop, setPop] = useState(0)
  const lock = useRef(false)
  const started = useRef(false)

  useEffect(() => {
    try {
      const s = JSON.parse(localStorage.getItem(STORE) || 'null')
      if (s?.code && decode(s.code)) Promise.resolve().then(() => setSaved(s))
    } catch { /* ignore */ }
  }, [])

  const q = QUESTIONS[idx]
  const answered = useMemo(() => QUESTIONS.reduce((n, qq) => n + (qq.type === 'matrix' ? (qq.items.every((i) => answers[i.id]) ? 1 : 0) : answers[qq.id] ? 1 : 0), 0), [answers])
  const xp = answered * 25
  const live = useMemo(() => (answered >= 3 ? score(answers) : null), [answers, answered])
  const result: Result | null = useMemo(() => (['break', 'gate', 'build', 'reveal', 'report'].includes(phase) ? score(answers) : null), [phase, answers])

  const go = useCallback((n: number) => { setDir(n > idx ? 1 : -1); setReflect(''); setIdx(n); window.scrollTo({ top: 0 }) }, [idx])

  const start = () => {
    if (!started.current) { started.current = true; whopTrack('quiz_started'); gt('quiz_start') }
    setPhase('q'); window.scrollTo({ top: 0 })
  }

  const advance = useCallback(() => {
    setPop((p) => p + 1)
    const last = idx + 1 >= TOTAL
    const partEnds = last || QUESTIONS[idx + 1].part !== QUESTIONS[idx].part
    if (partEnds && !last) { setBreakPart(QUESTIONS[idx].part); setDir(1); setPhase('break'); window.scrollTo({ top: 0 }); return }
    if (last) { setDir(1); setPhase('gate'); window.scrollTo({ top: 0 }); return }
    go(idx + 1)
  }, [idx, go])

  const afterBreak = () => { setPhase('q'); go(idx + 1) }

  const setAnswer = (id: string, v: string | string[]) => setAnswers((a) => ({ ...a, [id]: v }))

  const pickOne = (qq: Q, value: string, line?: string) => {
    if (lock.current) return
    lock.current = true; buzz()
    setAnswer(qq.id, value); setReflect(line || ''); gt('quiz_answer', { q: qq.id, v: value })
    setTimeout(() => { lock.current = false; advance() }, line ? 1000 : 360)
  }

  const toggleMulti = (qq: Extract<Q, { type: 'multi' }>, value: string) => {
    buzz(6)
    const cur = (answers[qq.id] as string[] | undefined) || []
    setAnswer(qq.id, cur.includes(value) ? cur.filter((x) => x !== value) : cur.length >= qq.max ? [...cur.slice(1), value] : [...cur, value])
  }

  const pickItem = (qq: Extract<Q, { type: 'matrix' }>, itemId: string, n: number) => {
    buzz(6)
    const next = { ...answers, [itemId]: String(n) }
    setAnswers(next)
    if (qq.items.every((i) => next[i.id]) && !lock.current) {
      lock.current = true
      setTimeout(() => { lock.current = false; advance() }, 650)
    }
  }

  const back = () => {
    if (phase === 'gate') { setPhase('q'); setIdx(TOTAL - 1); return }
    if (phase === 'break') { setPhase('q'); return }
    if (idx > 0) go(idx - 1)
    else setPhase('intro')
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (busy) return
    setErr('')
    const f = first.trim(), l = last.trim(), em = email.trim().toLowerCase()
    const nm = `${f} ${l}`.trim()
    if (!f) return setErr('Please add your first name.')
    if (!l) return setErr('Please add your last name.')
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(em)) return setErr('Please enter a valid email so we can send your report.')
    setBusy(true)
    const r = score(answers)
    setPhase('build'); setBuildStep(0); window.scrollTo({ top: 0 })
    const ticker = setInterval(() => setBuildStep((s) => Math.min(s + 1, BUILD_STEPS.length - 1)), 560)
    let ok = true
    try {
      const res = await fetch('/api/quiz/submit', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: nm, email: em, code: r.code, website: trap }) })
      if (!res.ok) { const j = await res.json().catch(() => ({})); if (res.status === 429 || res.status === 400) { ok = false; setErr(j.error || 'Please try again in a moment.') } }
    } catch { /* offline: still show the report */ }
    await new Promise((res) => setTimeout(res, 2900))
    clearInterval(ticker); setBusy(false)
    if (!ok) { setPhase('gate'); return }
    try {
      localStorage.setItem(STORE, JSON.stringify({ code: r.code, name: nm, email: em }))
      const h = JSON.parse(localStorage.getItem(HIST) || '[]')
      h.push({ t: Date.now(), code: r.code, overall: r.overall, i: r.intensities, d: r.dims })
      localStorage.setItem(HIST, JSON.stringify(h.slice(-8)))
    } catch { /* ignore */ }
    whopTrack('quiz_completed'); gt('quiz_complete', { primary: r.primary, secondary: r.secondary })
    setFlip(false); setPhase('reveal'); window.scrollTo({ top: 0 })
  }

  const doFlip = () => { setFlip(true); buzz(20); setTimeout(() => fireConfetti(), 350) }
  const toReport = () => { setPhase('report'); window.scrollTo({ top: 0 }) }

  const openSaved = () => {
    if (!saved) return
    const a = decode(saved.code); if (!a) return
    setAnswers(a); setFirst(saved.name.split(' ')[0] || ''); setLast(saved.name.split(' ').slice(1).join(' ')); setEmail(saved.email); setPhase('report'); window.scrollTo({ top: 0 })
  }

  useEffect(() => {
    if (phase !== 'q' || q.type !== 'single') return
    const h = (e: KeyboardEvent) => { const n = Number(e.key); if (n >= 1 && n <= q.options.length) { const o = q.options[n - 1]; pickOne(q, o.v, o.reflect) } }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, idx])

  const auditHref = result ? `/audit-checkout?src=quiz&p=${result.primary}&s=${result.secondary}&c=${result.code}` : '/audit-checkout'
  const part = phase === 'q' ? PARTS[q.part] : null

  return (
    <div className="qz">
      <div className="qz-bg" aria-hidden="true"><i className="o1" /><i className="o2" /><i className="o3" /></div>

      <header className="qz-head">
        <a href="/" className="qz-logo" aria-label="The5th Global Consulting"><img src="/images/logo-header-white.png" alt="The5th Global Consulting" width={150} height={46} /></a>
        {phase === 'q' ? (
          <div className="qz-prog">
            <span><b>Part {part!.n} of 4</b><span className="qz-prog__nm"> · {part!.name}</span></span>
            <div><i style={{ width: `${((idx + 1) / TOTAL) * 100}%` }} /></div>
          </div>
        ) : phase === 'report' ? <span className="qz-free">Your Income OS profile</span> : <span className="qz-free">The5th Income OS</span>}
        {phase === 'q' && <span className="qz-xp" key={pop}>⚡ {xp} XP</span>}
        {(phase === 'q' || phase === 'gate' || phase === 'break') && <button type="button" className="qz-back" onClick={back} aria-label="Go back">← Back</button>}
      </header>

      <main className="qz-main">
        <AnimatePresence mode="wait" initial={false}>
          {phase === 'intro' && (
            <motion.section key="intro" className="qz-intro" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.4 }}>
              <div className="qz-intro__txt">
                <span className="qz-chip"><Ic name="spark" size={16} sw={3} /> The5th Income OS · free assessment</span>
                <h1>Find out what is <em>really</em> stopping you from making money.</h1>
                <p className="qz-sub qz-sub--long">This is not a quiz. It is the same kind of diagnostic we start every client with: <b>18 screens, 6 income blockers, 4 money-mindset scales</b> and one personal profile out of 30. You get a full report, a 7-day plan and a profile ID you can track.</p>
                <p className="qz-sub qz-sub--short">A 4-minute diagnostic: <b>6 income blockers, 4 mindset scales</b>, one personal profile. You get a full report and a 7-day plan.</p>
                <div className="qz-os">
                  {[['compass', 'Assess', '18 quick screens'], ['target', 'Diagnose', 'Blockers + mindset'], ['map', 'Plan', 'Your 7-day plan'], ['chart', 'Track', 'Retake and compare']].map(([ic, t, s], i) => (
                    <div key={t}><span><Ic name={ic} size={22} /></span><p><b>{t}</b><small>{s}</small></p>{i < 3 && <i>→</i>}</div>
                  ))}
                </div>
                <div className="qz-gets">
                  {[['chart', 'Live charts as you go', 'Watch your profile take shape'], ['bolt', 'Real client data', 'Compare with published results'], ['crown', 'Badges to unlock', 'One for each part'], ['gift', 'A shareable profile card', 'Your type, your ID']].map(([ic, t, s]) => (
                    <div key={t}><span><Ic name={ic} size={24} /></span><p><b>{t}</b><small>{s}</small></p></div>
                  ))}
                </div>
                <div className="qz-cta">
                  <button type="button" className="qz-btn qz-btn--gold qz-btn--xl" onClick={start}>Start my free assessment <i>→</i></button>
                  <p className="qz-micro">No credit card · Instant result · About 4 minutes · Built from patterns Indrodip sees with experts</p>
                </div>
                {saved && <button type="button" className="qz-saved" onClick={openSaved}>Welcome back, {saved.name.split(' ')[0] || 'friend'}. See your saved profile →</button>}
              </div>
              <div className="qz-intro__vis" aria-hidden="true">
                <div className="qz-sample">
                  <div className="qz-sample__top"><span>SAMPLE PROFILE</span><i /></div>
                  <h3>You are <em>The Quiet Voice</em></h3>
                  <p className="qz-sample__id">QV-UC-H81</p>
                  <SampleRadar />
                  <div className="qz-sample__row"><b>Main blocker</b><span>Self-Worth</span></div>
                  <div className="qz-sample__row"><b>Mindset map</b><span>4 scales</span></div>
                  <div className="qz-sample__row"><b>7-day plan</b><span>Included</span></div>
                </div>
                <div className="qz-sample__pill"><Ic name="lock" size={16} /> Your own profile appears when you finish</div>
              </div>
            </motion.section>
          )}

          {phase === 'q' && (
            <motion.section key={q.id} className="qz-q" initial={{ opacity: 0, x: 40 * dir }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 * dir }} transition={{ duration: 0.28 }}>
              <div className="qz-q__ic"><Ic name={q.icon} size={34} /></div>
              <h2>{q.title}</h2>
              <p className="qz-sub">{q.sub}</p>

              {q.type === 'single' && (
                <div className={'qz-opts' + (q.options.length > 5 ? ' qz-opts--2' : '')}>
                  {q.options.map((o: Opt, i) => (
                    <button key={o.v} type="button" className={'qz-opt' + (answers[q.id] === o.v ? ' on' : '')} onClick={() => pickOne(q, o.v, o.reflect)}>
                      <span className="qz-opt__ic"><Ic name={o.icon} size={26} /></span>
                      <span className="qz-opt__t"><b>{o.label}</b>{o.sub && <small>{o.sub}</small>}</span>
                      <span className="qz-opt__k">{i + 1}</span>
                    </button>
                  ))}
                </div>
              )}

              {q.type === 'multi' && (
                <>
                  <div className="qz-opts qz-opts--2">
                    {q.options.map((o: Opt) => {
                      const on = ((answers[q.id] as string[]) || []).includes(o.v)
                      return (
                        <button key={o.v} type="button" className={'qz-opt' + (on ? ' on' : '')} onClick={() => toggleMulti(q, o.v)} aria-pressed={on}>
                          <span className="qz-opt__ic"><Ic name={o.icon} size={26} /></span>
                          <span className="qz-opt__t"><b>{o.label}</b></span>
                          <span className="qz-opt__chk">{on ? <Ic name="check" size={22} sw={3.2} /> : null}</span>
                        </button>
                      )
                    })}
                  </div>
                  <div className="qz-multi">
                    <span>{((answers[q.id] as string[]) || []).length} of {q.max} selected</span>
                    <button type="button" className="qz-btn qz-btn--gold" disabled={!((answers[q.id] as string[]) || []).length} onClick={advance}>Continue <i>→</i></button>
                  </div>
                </>
              )}

              {q.type === 'scale' && (
                <div className="qz-scale">
                  <div className="qz-scale__row">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button key={n} type="button" className={'qz-dot' + (answers[q.id] === String(n) ? ' on' : '')} onClick={() => pickOne(q, String(n), q.reflect[n])} aria-label={`${n} out of 5`}><b>{n}</b></button>
                    ))}
                  </div>
                  <div className="qz-scale__lab"><span>{q.lowLabel}</span><span>{q.highLabel}</span></div>
                </div>
              )}

              {q.type === 'matrix' && (
                <div className="qz-matrix">
                  <div className="qz-matrix__lab"><span>Disagree</span><span>Agree</span></div>
                  {q.items.map((it) => (
                    <div key={it.id} className={'qz-mrow' + (answers[it.id] ? ' done' : '')}>
                      <p>{it.text}</p>
                      <div>{[1, 2, 3, 4, 5].map((n) => <button key={n} type="button" className={'qz-mdot' + (answers[it.id] === String(n) ? ' on' : '')} onClick={() => pickItem(q, it.id, n)} aria-label={`${n} of 5: ${it.text}`}>{n}</button>)}</div>
                    </div>
                  ))}
                </div>
              )}

              <div className="qz-reflect" aria-live="polite">{reflect && <motion.p initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>{reflect}</motion.p>}</div>
              {live && <LiveMeter r={live} />}
            </motion.section>
          )}

          {phase === 'break' && result && (
            <motion.section key={'break-' + breakPart} className="qz-break" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }}>
              <BreakScreen part={breakPart} r={result} onNext={afterBreak} />
            </motion.section>
          )}

          {phase === 'gate' && result && (
            <motion.section key="gate" className="qz-gate" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }}>
              <div className="qz-gate__vis" aria-hidden="true">
                <div className="qz-gate__blur"><Radar r={result} mini /></div>
                <div className="qz-gate__lock"><Ic name="lock" size={28} /><b>Your profile is ready</b><span>One last step to reveal it</span></div>
              </div>
              <div className="qz-gate__form">
                <span className="qz-chip">All 4 badges unlocked</span>
                <h2>Where should we send your profile?</h2>
                <p className="qz-sub">You will see it instantly on the next screen, and we will email you a link so you can come back and track your progress.</p>
                <form onSubmit={submit} noValidate className="qz-form">
                  <div className="qz-form__row">
                    <Field label="First name" icon="user" value={first} onChange={setFirst} autoComplete="given-name" ok={first.trim().length > 0} />
                    <Field label="Last name" icon="user" value={last} onChange={setLast} autoComplete="family-name" ok={last.trim().length > 0} />
                  </div>
                  <Field label="Email address" icon="mail" type="email" value={email} onChange={setEmail} autoComplete="email" ok={/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())} />
                  <input type="text" tabIndex={-1} autoComplete="off" value={trap} onChange={(e) => setTrap(e.target.value)} className="qz-trap" aria-hidden="true" />
                  {err && <p className="qz-err" role="alert">{err}</p>}
                  <button type="submit" className="qz-btn qz-btn--gold qz-btn--xl" disabled={busy}>Reveal my profile <i>→</i></button>
                  <p className="qz-micro"><Ic name="lock" size={13} /> Private and secure. Free. No spam. Unsubscribe any time. We never sell your details. <a href="/privacy">Privacy</a></p>
                </form>
              </div>
            </motion.section>
          )}

          {phase === 'build' && (
            <motion.section key="build" className="qz-build" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="qz-build__orb"><i /><i /><i /></div>
              <h2>Building your profile</h2>
              <ul>{BUILD_STEPS.map((s, i) => <li key={s} className={i < buildStep ? 'done' : i === buildStep ? 'on' : ''}><span>{i < buildStep ? <Ic name="check" size={18} sw={3.4} /> : null}</span>{s}</li>)}</ul>
            </motion.section>
          )}

          {phase === 'reveal' && result && (
            <motion.section key="reveal" className="qz-reveal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <p className="qz-reveal__k">{flip ? 'Your Income OS profile' : 'It is ready'}</p>
              <button type="button" className={'qz-flip' + (flip ? ' on' : '')} onClick={() => !flip && doFlip()} aria-label="Reveal your profile">
                <span className="qz-flip__in">
                  <span className="qz-flip__f"><Ic name="lock" size={44} /><b>Tap to reveal</b><small>Your profile is sealed</small></span>
                  <span className="qz-flip__b">
                    <small>YOU ARE</small>
                    <b style={{ color: BLOCKERS[result.primary].color }}>{result.archetype}</b>
                    <em>{result.profileId}</em>
                    <Radar r={result} mini />
                    <span>{BLOCKERS[result.primary].name} + {BLOCKERS[result.secondary].name}</span>
                  </span>
                </span>
              </button>
              {flip && <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }}><button type="button" className="qz-btn qz-btn--gold qz-btn--xl" onClick={toReport}>See my full report <i>→</i></button></motion.div>}
            </motion.section>
          )}

          {phase === 'report' && result && (
            <motion.div key="report" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
              <ReportView r={result} name={`${first} ${last}`.trim()} email={email} auditHref={auditHref} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}

/* ── live meter: your blockers taking shape as you answer ── */
function LiveMeter({ r }: { r: Result }) {
  return (
    <div className="qz-live" aria-hidden="true">
      <div className="qz-live__h"><i /> LIVE · your blockers taking shape</div>
      {r.order.map((b) => (
        <div key={b} className="qz-live__row"><span>{BLOCKERS[b].name}</span><div><i style={{ width: `${r.intensities[b]}%`, background: BLOCKERS[b].color }} /></div></div>
      ))}
    </div>
  )
}

/* ── chart breaks between parts ── */
function BreakScreen({ part, r, onNext }: { part: PartId; r: Result; onNext: () => void }) {
  const cases = casesFor(r.niche, 3)
  const weakest = [...DIM_IDS].sort((a, b) => r.dims[a] - r.dims[b])[0]
  return (
    <div className="qz-brk">
      <div className="qz-brk__badge"><Ic name="crown" size={28} /><span>Badge unlocked</span><b>{BADGES[part]}</b></div>

      {part === 'business' && (
        <>
          <h2>Here is your starting point.</h2>
          <div className="qz-brk__card">
            <div className="qz-gap__row"><span>Today</span><div className="qz-gap__track"><i style={{ width: `${Math.max(4, Math.round((r.gap.current / r.gap.target) * 100))}%` }} className="now" /></div><b>{money(r.gap.current)}</b></div>
            <div className="qz-gap__row"><span>Goal</span><div className="qz-gap__track"><i style={{ width: '100%' }} className="goal" /></div><b>{money(r.gap.target)}</b></div>
            <p className="qz-brk__big">A gap of <b>{money(r.gap.monthly)}</b> a month</p>
          </div>
          <div className="qz-brk__real">
            <span className="qz-kicker">Real data · what experts like you have done</span>
            <div className="qz-brk__cases">{cases.map((c) => <div key={c.name}><b>{c.plus ? '$' + c.amount.toLocaleString('en-US') + '+' : '$' + c.amount.toLocaleString('en-US')}</b><small>{c.name}, {c.role.toLowerCase()}</small><em>{c.when}</em></div>)}</div>
            <p>Published client results. The average client lands their first paying client in about <b>{SITE_FACTS.avgDaysToFirstClient} days</b>. Individual results vary.</p>
          </div>
        </>
      )}

      {part === 'mindset' && (
        <>
          <h2>Your money mindset map.</h2>
          <div className="qz-brk__card"><DimBars dims={r.dims} /></div>
          <p className="qz-brk__txt">{DIM_COPY[weakest].name} is where the biggest shift is waiting: {DIM_COPY[weakest][dimBandOf(r.dims[weakest])]}</p>
        </>
      )}

      {part === 'patterns' && (
        <>
          <h2>Your pressure points are taking shape.</h2>
          <div className="qz-brk__card">
            {r.order.slice(0, 3).map((b, i) => (
              <div key={b} className="qz-mystery"><span className="qz-mystery__n">{i + 1}</span><div><b>Blocker {i + 1}</b><i style={{ width: `${r.intensities[b]}%`, background: BLOCKERS[b].color }} /></div><strong>{r.intensities[b]}</strong><Ic name="lock" size={18} /></div>
            ))}
            <p className="qz-brk__txt" style={{ marginTop: 10 }}>Names, causes and your fix unlock with your report.</p>
          </div>
        </>
      )}

      {part === 'readiness' && null}

      <button type="button" className="qz-btn qz-btn--gold qz-btn--xl" onClick={onNext}>{part === 'patterns' ? 'On to the last part' : 'Keep going'} <i>→</i></button>
    </div>
  )
}

function SampleRadar() {
  const C = 100, R = 70
  const vals = [0.5, 0.92, 0.7, 0.35, 0.45, 0.6]
  const pt = (i: number, v: number) => { const a = (-90 + i * 60) * Math.PI / 180; return [C + Math.cos(a) * R * v, C + Math.sin(a) * R * v] }
  return (
    <svg viewBox="0 0 200 200" className="qz-sampleRadar">
      {[0.33, 0.66, 1].map((s) => <polygon key={s} points={vals.map((_, i) => pt(i, s).join(',')).join(' ')} fill="none" stroke="rgba(255,255,255,.14)" />)}
      <polygon points={vals.map((v, i) => pt(i, v).join(',')).join(' ')} fill="rgba(228,200,121,.28)" stroke="#E4C879" strokeWidth="2.5" strokeLinejoin="round" className="qz-radar__shape" />
      {vals.map((v, i) => <circle key={i} cx={pt(i, v)[0]} cy={pt(i, v)[1]} r={i === 1 ? 5.5 : 3.6} fill={i === 1 ? '#fff' : '#E4C879'} />)}
    </svg>
  )
}


/* Floating-label field with icon and a live valid tick. */
function Field({ label, icon, value, onChange, type = 'text', autoComplete, ok }: { label: string; icon: string; value: string; onChange: (v: string) => void; type?: string; autoComplete?: string; ok?: boolean }) {
  const id = 'qz-' + label.toLowerCase().replace(/[^a-z]+/g, '-')
  return (
    <div className={'qz-field' + (value ? ' has' : '') + (ok ? ' ok' : '')}>
      <span className="qz-field__ic"><Ic name={icon} size={20} /></span>
      <input id={id} type={type} inputMode={type === 'email' ? 'email' : undefined} value={value} onChange={(e) => onChange(e.target.value)} autoComplete={autoComplete} placeholder=" " />
      <label htmlFor={id}>{label}</label>
      <span className="qz-field__ok"><Ic name="check" size={18} sw={3.4} /></span>
    </div>
  )
}
