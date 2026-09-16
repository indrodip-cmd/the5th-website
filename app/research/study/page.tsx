'use client'

import { useState } from 'react'

/* The5th Original Research, the live study instrument.
   Anonymous. Collects demographics, AI-reliance habits, and a short reasoning
   test (Cognitive Reflection Test, Frederick 2005) plus a confidence rating,
   then posts to /api/research/study which scores it server-side. */

const C = {
  cream: '#FAF6F0', plum: '#3D2645', plumDark: '#2E1A35', plumDeep: '#231029',
  gold: '#C9A84C', goldDeep: '#B0902F', ink: '#1A1A2E', inkSoft: '#4a4038',
  muted: '#8A8075', border: '#E2DCD2', white: '#fff', purple: '#5E2E86',
}
const SANS = "'Public Sans', system-ui, -apple-system, sans-serif"
const SERIF = "Georgia, 'Times New Roman', serif"

const AGE = ['Under 30', '30 to 39', '40 to 49', '50 to 60', 'Over 60']
const GENDER = ['Woman', 'Man', 'Non-binary', 'Prefer not to say']
const AI_USE = ['Several times a day', 'Daily', 'A few times a week', 'Rarely', 'Never']

const RELIANCE = [
  { id: 'r1', t: 'I use AI tools for everyday questions and decisions.' },
  { id: 'r2', t: 'When I face a problem, I often ask AI before trying to work it out myself.' },
  { id: 'r3', t: 'I usually accept AI’s answer without double-checking it.' },
  { id: 'r4', t: 'Compared with a few years ago, I find it harder to focus on long or difficult reading.' },
]
const SELF_CT = [
  { id: 's1', t: 'I enjoy problems that make me think hard.' },
  { id: 's2', t: 'Before I accept a claim, I look for reasons it might be wrong.' },
]
const LIKERT = ['Strongly disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly agree']

const CRT = [
  {
    id: 'q1',
    t: 'A bat and a ball cost $1.10 in total. The bat costs $1.00 more than the ball. How much does the ball cost?',
    opts: [{ id: 'l', t: '10 cents' }, { id: 'c', t: '5 cents' }, { id: 'o1', t: '15 cents' }, { id: 'o2', t: '1 dollar' }],
  },
  {
    id: 'q2',
    t: 'If it takes 5 machines 5 minutes to make 5 widgets, how long would 100 machines take to make 100 widgets?',
    opts: [{ id: 'l', t: '100 minutes' }, { id: 'o1', t: '20 minutes' }, { id: 'c', t: '5 minutes' }, { id: 'o2', t: '500 minutes' }],
  },
  {
    id: 'q3',
    t: 'A patch of lily pads doubles in size every day. It takes 48 days to cover the whole lake. How long to cover half the lake?',
    opts: [{ id: 'l', t: '24 days' }, { id: 'o1', t: '12 days' }, { id: 'o2', t: '36 days' }, { id: 'c', t: '47 days' }],
  },
]

type Result = { crtScore: number; crtTotal: number; crtLure: number; confidence: number | null; accuracyPct: number }

function Choice({ options, value, onPick }: { options: string[]; value: string; onPick: (v: string) => void }) {
  return (
    <div style={{ display: 'grid', gap: 10 }}>
      {options.map((o) => {
        const sel = value === o
        return (
          <button key={o} onClick={() => onPick(o)} style={{
            textAlign: 'left', cursor: 'pointer', padding: '14px 16px', borderRadius: 12, fontSize: 15, fontFamily: SANS,
            background: sel ? 'rgba(94,46,134,.10)' : C.cream, border: `1.5px solid ${sel ? C.purple : C.border}`, color: C.ink,
          }}>{o}</button>
        )
      })}
    </div>
  )
}

function LikertRow({ id, text, store, set }: { id: string; text: string; store: Record<string, number>; set: (u: Record<string, number>) => void }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ fontSize: 15, color: C.ink, marginBottom: 10, lineHeight: 1.5 }}>{text}</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 6 }}>
        {LIKERT.map((l, i) => {
          const v = i + 1, sel = store[id] === v
          return (
            <button key={l} onClick={() => set({ ...store, [id]: v })} title={l} style={{
              cursor: 'pointer', padding: '10px 4px', borderRadius: 10, fontSize: 11.5, lineHeight: 1.25, fontFamily: SANS,
              background: sel ? C.purple : C.cream, color: sel ? '#fff' : C.muted, border: `1px solid ${sel ? C.purple : C.border}`, fontWeight: sel ? 700 : 500,
            }}>{l}</button>
          )
        })}
      </div>
    </div>
  )
}

export default function StudyPage() {
  const [step, setStep] = useState(0)
  const [consent, setConsent] = useState(false)
  const [ageBand, setAgeBand] = useState('')
  const [gender, setGender] = useState('')
  const [country, setCountry] = useState('United States')
  const [aiUse, setAiUse] = useState('')
  const [reliance, setReliance] = useState<Record<string, number>>({})
  const [selfCt, setSelfCt] = useState<Record<string, number>>({})
  const [crt, setCrt] = useState<Record<string, string>>({})
  const [confidence, setConfidence] = useState(70)
  const [state, setState] = useState<'idle' | 'loading' | 'error'>('idle')
  const [msg, setMsg] = useState('')
  const [result, setResult] = useState<Result | null>(null)

  const totalSteps = 5
  const relianceDone = RELIANCE.every((r) => reliance[r.id]) && SELF_CT.every((s) => selfCt[s.id])
  const crtDone = CRT.every((q) => crt[q.id])

  async function submit() {
    if (state === 'loading') return
    setState('loading'); setMsg('')
    try {
      const r = await fetch('/api/research/study', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ consent, age_band: ageBand, gender, country, ai_use: aiUse, reliance, self_ct: selfCt, crt, confidence }),
      })
      const j = await r.json().catch(() => ({}))
      if (!r.ok) { setState('error'); setMsg(j?.error || 'Something went wrong. Please try again.'); return }
      setResult(j as Result); setStep(totalSteps)
    } catch {
      setState('error'); setMsg('Network error. Please try again.')
    }
  }

  const card: React.CSSProperties = { background: C.white, border: `1px solid ${C.border}`, borderRadius: 18, padding: 'clamp(22px,4vw,34px)', boxShadow: '0 24px 60px -44px rgba(46,26,53,.5)' }
  const h2: React.CSSProperties = { fontFamily: SERIF, fontSize: 'clamp(22px,3.4vw,28px)', color: C.plumDark, margin: '0 0 8px', lineHeight: 1.15 }
  const p: React.CSSProperties = { fontSize: 15.5, lineHeight: 1.65, color: C.inkSoft, margin: '0 0 18px' }
  const btn = (primary = true): React.CSSProperties => ({
    appearance: 'none', border: 'none', cursor: 'pointer', fontFamily: SANS, fontWeight: 800, fontSize: 15.5,
    padding: '13px 26px', borderRadius: 999,
    background: primary ? `linear-gradient(180deg, ${C.purple}, ${C.plum})` : 'transparent',
    color: primary ? '#fff' : C.muted,
  })

  return (
    <div style={{ minHeight: '100vh', background: C.cream, color: C.ink, fontFamily: SANS }}>
      {/* header */}
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px clamp(20px,5vw,44px)', borderBottom: `1px solid ${C.border}`, background: 'rgba(250,246,240,.9)', backdropFilter: 'blur(10px)', position: 'sticky', top: 0, zIndex: 10 }}>
        <a href="/research" aria-label="The5th Research" style={{ display: 'inline-flex', alignItems: 'center' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/the5th-logo-purple.png" alt="The5th Consulting" style={{ height: 34, width: 'auto', display: 'block' }} />
        </a>
        <span style={{ fontSize: 12, letterSpacing: '.14em', textTransform: 'uppercase', color: C.goldDeep, fontWeight: 700 }}>The5th Original Research</span>
      </header>

      <main style={{ maxWidth: 640, margin: '0 auto', padding: 'clamp(28px,5vw,52px) clamp(20px,5vw,24px) 80px' }}>
        {/* progress */}
        {step < totalSteps && (
          <div style={{ display: 'flex', gap: 6, marginBottom: 22 }}>
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div key={i} style={{ flex: 1, height: 4, borderRadius: 4, background: i <= step ? C.gold : C.border }} />
            ))}
          </div>
        )}

        {/* Step 0: consent */}
        {step === 0 && (
          <div style={card}>
            <div style={{ fontSize: 11.5, letterSpacing: '.16em', textTransform: 'uppercase', color: C.goldDeep, fontWeight: 700, marginBottom: 12 }}>A study by Indrodip Ghosh</div>
            <h1 style={{ ...h2, fontSize: 'clamp(26px,4.4vw,36px)' }}>Is AI changing how we think?</h1>
            <p style={p}>
              This is a short, anonymous research study, about six minutes. I am looking at how everyday use of AI relates
              to the way we reason and how sure we feel about our answers. You will tell me a little about yourself and
              your AI habits, then take a quick reasoning test. At the end I will show you your own result.
            </p>
            <p style={{ ...p, fontSize: 14, color: C.muted }}>
              No names, no email, nothing that identifies you is collected. Your responses are stored anonymously and used
              only, in aggregate, for this research. There are no right answers I am judging you on, so please do not look
              anything up: answer as you naturally would.
            </p>
            <label style={{ display: 'flex', gap: 12, alignItems: 'flex-start', cursor: 'pointer', padding: '14px 16px', borderRadius: 12, background: C.cream, border: `1px solid ${C.border}`, marginBottom: 20 }}>
              <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} style={{ marginTop: 3, width: 18, height: 18, accentColor: C.purple }} />
              <span style={{ fontSize: 14.5, color: C.ink, lineHeight: 1.5 }}>I am 18 or older and I agree to take part in this anonymous study.</span>
            </label>
            <button disabled={!consent} onClick={() => setStep(1)} style={{ ...btn(), opacity: consent ? 1 : 0.5, width: '100%' }}>Start the study →</button>
          </div>
        )}

        {/* Step 1: about you */}
        {step === 1 && (
          <div style={card}>
            <h2 style={h2}>A little about you</h2>
            <p style={p}>This helps me compare patterns across groups. All optional, but it makes the research better.</p>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.plum, margin: '4px 0 8px' }}>Your age</div>
            <Choice options={AGE} value={ageBand} onPick={setAgeBand} />
            <div style={{ fontSize: 13, fontWeight: 700, color: C.plum, margin: '20px 0 8px' }}>Gender</div>
            <Choice options={GENDER} value={gender} onPick={setGender} />
            <div style={{ fontSize: 13, fontWeight: 700, color: C.plum, margin: '20px 0 8px' }}>Country</div>
            <input value={country} onChange={(e) => setCountry(e.target.value)} style={{ width: '100%', padding: '13px 15px', borderRadius: 12, border: `1px solid ${C.border}`, background: C.cream, fontSize: 15, fontFamily: SANS, color: C.ink }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24 }}>
              <button onClick={() => setStep(0)} style={btn(false)}>← Back</button>
              <button onClick={() => setStep(2)} style={btn()}>Continue →</button>
            </div>
          </div>
        )}

        {/* Step 2: AI habits + disposition */}
        {step === 2 && (
          <div style={card}>
            <h2 style={h2}>Your everyday habits</h2>
            <p style={p}>How much do you agree with each statement? There are no right answers here.</p>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.plum, margin: '4px 0 10px' }}>How often do you use AI tools (ChatGPT and the like)?</div>
            <Choice options={AI_USE} value={aiUse} onPick={setAiUse} />
            <div style={{ height: 1, background: C.border, margin: '24px 0' }} />
            {RELIANCE.map((r) => <LikertRow key={r.id} id={r.id} text={r.t} store={reliance} set={setReliance} />)}
            {SELF_CT.map((s) => <LikertRow key={s.id} id={s.id} text={s.t} store={selfCt} set={setSelfCt} />)}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
              <button onClick={() => setStep(1)} style={btn(false)}>← Back</button>
              <button disabled={!relianceDone} onClick={() => setStep(3)} style={{ ...btn(), opacity: relianceDone ? 1 : 0.5 }}>Continue →</button>
            </div>
          </div>
        )}

        {/* Step 3: reasoning test */}
        {step === 3 && (
          <div style={card}>
            <h2 style={h2}>A quick reasoning test</h2>
            <p style={p}>Three short questions. Please answer from your own head, without looking anything up or asking AI. Go with your considered answer.</p>
            {CRT.map((q, i) => (
              <div key={q.id} style={{ marginBottom: 24 }}>
                <div style={{ fontSize: 15.5, color: C.ink, fontWeight: 600, marginBottom: 12, lineHeight: 1.5 }}>{i + 1}. {q.t}</div>
                <Choice options={q.opts.map((o) => o.t)} value={q.opts.find((o) => o.id === crt[q.id])?.t || ''} onPick={(t) => { const o = q.opts.find((x) => x.t === t); if (o) setCrt({ ...crt, [q.id]: o.id }) }} />
              </div>
            ))}
            <div style={{ height: 1, background: C.border, margin: '8px 0 20px' }} />
            <div style={{ fontSize: 15, fontWeight: 700, color: C.plum, marginBottom: 10 }}>How confident are you that you got these right?</div>
            <input type="range" min={0} max={100} value={confidence} onChange={(e) => setConfidence(Number(e.target.value))} style={{ width: '100%', accentColor: C.purple }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, color: C.muted, marginTop: 4 }}><span>Not at all</span><span style={{ fontWeight: 800, color: C.plum }}>{confidence}%</span><span>Completely</span></div>
            {state === 'error' && <p style={{ color: '#c0392b', fontSize: 13.5, marginTop: 14 }}>{msg}</p>}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24 }}>
              <button onClick={() => setStep(2)} style={btn(false)}>← Back</button>
              <button disabled={!crtDone || state === 'loading'} onClick={submit} style={{ ...btn(), opacity: (crtDone && state !== 'loading') ? 1 : 0.5 }}>{state === 'loading' ? 'Submitting…' : 'See my result →'}</button>
            </div>
          </div>
        )}

        {/* Step 4 (== totalSteps): result */}
        {step === totalSteps && result && (
          <div style={card}>
            <div style={{ fontSize: 11.5, letterSpacing: '.16em', textTransform: 'uppercase', color: C.goldDeep, fontWeight: 700, marginBottom: 12 }}>Thank you for taking part</div>
            <h2 style={h2}>Your result</h2>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', margin: '18px 0 6px' }}>
              <div style={{ flex: '1 1 150px', background: C.cream, border: `1px solid ${C.border}`, borderRadius: 14, padding: '18px 20px' }}>
                <div style={{ fontFamily: SERIF, fontSize: 34, fontWeight: 800, color: C.plum }}>{result.crtScore}/{result.crtTotal}</div>
                <div style={{ fontSize: 13, color: C.muted }}>reasoning questions correct</div>
              </div>
              <div style={{ flex: '1 1 150px', background: C.cream, border: `1px solid ${C.border}`, borderRadius: 14, padding: '18px 20px' }}>
                <div style={{ fontFamily: SERIF, fontSize: 34, fontWeight: 800, color: C.goldDeep }}>{result.confidence ?? 'n/a'}%</div>
                <div style={{ fontSize: 13, color: C.muted }}>how confident you felt</div>
              </div>
            </div>
            <p style={{ ...p, marginTop: 18 }}>
              {result.confidence != null && result.confidence / 100 > result.accuracyPct / 100 + 0.15
                ? 'Interesting: you felt more sure than your answers turned out to be. That gap between confidence and accuracy is exactly what this study is about, and it is completely normal. Most of us have it.'
                : 'Your confidence and your accuracy were reasonably in step, which is a good sign of calibrated thinking.'}
              {result.crtLure > 0 ? ' At least one of your answers was the fast, intuitive one that most people reach for first, and that is the whole point of these classic puzzles.' : ''}
            </p>
            <p style={{ ...p, fontSize: 14, color: C.muted }}>
              Your anonymous response has been recorded and will feed into the findings I publish in the research paper.
              Thank you for helping, genuinely.
            </p>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <a href="/research/is-ai-eroding-critical-thinking" style={{ ...btn(), textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}>Read the research →</a>
              <a href="/research" style={{ ...btn(false), textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}>All research</a>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
