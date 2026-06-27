'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'

/* ════════ Brand tokens ════════ */
const C = {
  cream: '#FAF6F0', ivory: '#FBF8F2', creamMid: '#F4EEE4', creamDeep: '#EAE3D8',
  plum: '#3D2645', plumDark: '#2E1A35', plumDeep: '#231029',
  gold: '#C9A84C', goldSoft: '#E4C879', goldDeep: '#B0902F', goldLine: 'rgba(201,168,76,.32)',
  green: '#1C4A32', greenDark: '#143826',
  ink: '#1A1A2E', inkMid: '#403b3b', inkSoft: '#5a5550', muted: '#8A8075', border: '#E2DCD2', white: '#fff',
}

/* ════════ Helpers (kept) ════════ */
function formatStage(q1: string): string {
  const m: Record<string, string> = { starting: 'The Pioneer', idea: 'The Pioneer', launched: 'The Pathfinder', scaling: 'The Builder', established: 'The Luminary' }
  return m[q1] || q1 || 'The Pioneer'
}

/* Indicative health score derived from stage (a real proxy: earlier stages score lower). */
function deriveScores(q1: string) {
  const base: Record<string, { offer: number; positioning: number; pricing: number; momentum: number }> = {
    idea:        { offer: 30, positioning: 34, pricing: 33, momentum: 26 },
    starting:    { offer: 36, positioning: 40, pricing: 37, momentum: 32 },
    launched:    { offer: 58, positioning: 56, pricing: 54, momentum: 55 },
    scaling:     { offer: 74, positioning: 71, pricing: 69, momentum: 73 },
    established: { offer: 85, positioning: 83, pricing: 81, momentum: 85 },
  }
  const s = base[q1] || base.starting
  const overall = Math.round((s.offer + s.positioning + s.pricing + s.momentum) / 4)
  return { ...s, overall }
}

/* The nine report dimensions, with the real AI scores parsed from the model's
   ## SCORES block. Falls back to stage-derived values if the AI omits any. */
const SCORE_DIMS: [string, string][] = [
  ['Offer', 'offer'], ['Positioning', 'positioning'], ['Pricing', 'pricing'], ['Sales', 'sales'],
  ['Content', 'content'], ['Marketing', 'marketing'], ['Automation', 'automation'], ['Confidence', 'confidence'],
]
function buildSubScores(scoresText: string, q1: string): { label: string; val: number }[] {
  const ai: Record<string, number> = {}
  for (const line of (scoresText || '').split('\n')) {
    const m = line.match(/^\s*\**([A-Za-z][A-Za-z ]*?)\**\s*:\s*(\d{1,3})/)
    if (m) ai[m[1].trim().toLowerCase()] = Math.max(0, Math.min(100, parseInt(m[2], 10)))
  }
  const fb = deriveScores(q1)
  const fbMap: Record<string, number> = {
    offer: fb.offer, positioning: fb.positioning, pricing: fb.pricing, sales: fb.momentum,
    content: fb.positioning, marketing: fb.momentum, automation: Math.max(20, fb.offer - 12), confidence: fb.pricing,
  }
  return SCORE_DIMS.map(([label, key]) => ({ label, val: ai[key] ?? fbMap[key] ?? fb.overall }))
}

/* Parse the AI markdown roadmap into a map of { SECTION HEADER: body }. */
function parseRoadmap(md: string): Record<string, string> {
  const out: Record<string, string> = {}
  if (!md) return out
  const parts = md.split(/^##\s+/m)
  for (const part of parts) {
    const nl = part.indexOf('\n')
    if (nl === -1) continue
    const header = part.slice(0, nl).trim().toUpperCase()
    const body = part.slice(nl + 1).trim()
    if (header && body) out[header] = body
  }
  return out
}

/* Render plain roadmap body text as elegant paragraphs / bullets. */
function RoadmapBody({ text, muted = false }: { text: string; muted?: boolean }) {
  const lines = text.split('\n').filter(l => l.trim())
  return (
    <>
      {lines.map((line, i) => {
        const t = line.trim()
        const isBullet = /^[-•*]\s+/.test(t)
        const isSubhead = /^(DAY|WEEK)\s/i.test(t) || (t.length < 60 && /:$/.test(t))
        const clean = t.replace(/^[-•*]\s+/, '').replace(/\*\*/g, '')
        if (isSubhead) return <p key={i} style={{ fontWeight: 600, color: muted ? 'rgba(26,26,46,.5)' : C.ink, margin: '16px 0 4px', fontSize: 15 }}>{clean}</p>
        if (isBullet) return (
          <div key={i} style={{ display: 'flex', gap: 11, margin: '8px 0' }}>
            <span style={{ color: C.goldDeep, flexShrink: 0, fontWeight: 700 }}>✓</span>
            <span style={{ color: muted ? 'rgba(26,26,46,.45)' : C.inkSoft, lineHeight: 1.6, fontSize: 15 }}>{clean}</span>
          </div>
        )
        return <p key={i} style={{ color: muted ? 'rgba(26,26,46,.45)' : C.inkSoft, lineHeight: 1.75, fontSize: 15.5, margin: '10px 0' }}>{clean}</p>
      })}
    </>
  )
}

/* ════════ Immersive loading sequence (premium, not a spinner) ════════ */
const LOADING_MESSAGES = [
  'Reading your answers',
  'Analyzing your business',
  'Evaluating your positioning',
  'Reviewing your pricing',
  'Finding hidden opportunities',
  'Comparing successful coaching businesses',
  'Identifying your highest-ROI move',
  'Building your personalized roadmap',
  'Preparing your AI recommendations',
]

const TESTIMONIALS = [
  { name: 'Jeanne', quote: 'That one conversation gave me more clarity than $10,000 of coaching ever did. Six weeks later I closed my first client.', result: 'First client in 6 weeks' },
  { name: 'Laurie', quote: 'We rebuilt my strategy and repositioned my pricing. Within three months I generated $26,000 in revenue.', result: '$26,000 in 3 months' },
  { name: 'Angela', quote: 'After years of guessing, two months with Indrodip and I finally understood my own business. The first sale followed quickly.', result: 'First $2,500 sale' },
]

const SESSION_INCLUDES = [
  'We review your AI report and roadmap together',
  'We prioritize the highest-impact next 90 days',
  'We refine your offer and your pricing',
  'We name the one blind spot holding you back',
  'You leave with clarity, whether or not we work together',
]

/* ════════ Page ════════ */
export default function ResultsPage() {
  const [name, setName]           = useState('')
  const [email, setEmail]         = useState('')
  const [answers, setAnswers]     = useState<Record<string, string>>({})
  const [roadmap, setRoadmap]     = useState('')
  const [loading, setLoading]     = useState(true)
  const [msgIdx, setMsgIdx]       = useState(0)
  const [slow, setSlow]           = useState(false)
  const [genFailed, setGenFailed] = useState(false)
  const [archetype, setArchetype] = useState('')
  const [personalityType, setPersonalityType] = useState('')

  useEffect(() => {
    if (!loading) return
    const iv = setInterval(() => setMsgIdx(i => Math.min(i + 1, LOADING_MESSAGES.length - 1)), 1600)
    const slowT = setTimeout(() => setSlow(true), 16000)
    return () => { clearInterval(iv); clearTimeout(slowT) }
  }, [loading])

  useEffect(() => {
    const storedName    = sessionStorage.getItem('quiz_name')    || ''
    const storedEmail   = sessionStorage.getItem('quiz_email')   || ''
    const storedAnswers = JSON.parse(sessionStorage.getItem('quiz_answers') || '{}')

    // Fresh completion: this browser still holds the answers, so generate (or
    // load the cached) report and run the one-time lead/welcome side effects.
    if (Object.keys(storedAnswers).length > 0) {
      setName(storedName)
      setEmail(storedEmail)
      setAnswers(storedAnswers)
      generateRoadmap(storedName, storedAnswers)
      saveLead(storedName, storedEmail, storedAnswers)
      return
    }

    // Returning user (new browser session): no answers in memory. Load the
    // already-saved report straight from their signed session — never regenerate,
    // never re-run the welcome sequence.
    loadSavedReport()
  }, [])

  /* Hydrate a returning user's report from their session. Falls back to the
     /quiz AI Home (which offers a quick re-verify) if the session is gone. */
  const loadSavedReport = async () => {
    try {
      const res = await fetch('/api/quiz/report', { headers: { 'Accept': 'application/json' } })
      if (res.status === 401 || res.status === 404) { window.location.href = '/quiz'; return }
      const data = await res.json().catch(() => ({}))
      if (!data?.hasReport || !data?.roadmap) { window.location.href = '/quiz'; return }
      setName(data.name || '')
      setEmail(data.email || '')
      setAnswers(data.answers || {})
      setRoadmap(data.roadmap)
      if (data.archetype)   setArchetype(data.archetype)
      if (data.personality) setPersonalityType(data.personality)
      setLoading(false)
    } catch {
      window.location.href = '/quiz'
    }
  }

  const getVideoSlug = (q1: string) => {
    if (q1 === 'starting' || q1 === 'idea') return 'v1'
    if (q1 === 'launched') return 'v2'
    if (q1 === 'scaling')  return 'v3'
    return 'v1'
  }

  const generateRoadmap = async (n: string, a: Record<string, string>, attempt = 0): Promise<void> => {
    try {
      const res  = await fetch('/api/generate-roadmap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: a, name: n, email: sessionStorage.getItem('quiz_email') || '' })
      })
      const data = await res.json().catch(() => ({}))

      // Transient (concurrency lock / rate limit / 5xx): the first generation may
      // still be completing. Wait and retry so we land on the cached report.
      if ((!res.ok || !data.roadmap) && attempt < 3) {
        await new Promise(r => setTimeout(r, 3500))
        return generateRoadmap(n, a, attempt + 1)
      }

      if (!data.roadmap) { setGenFailed(true); setLoading(false); return }

      setRoadmap(data.roadmap)
      if (data.archetype)   setArchetype(data.archetype)
      if (data.personality) setPersonalityType(data.personality)
      setLoading(false)

      // Email the PDF only on a FRESH generation, never on a cache hit (no duplicate PDFs).
      const storedEmail   = sessionStorage.getItem('quiz_email') || ''
      const storedAnswers = JSON.parse(sessionStorage.getItem('quiz_answers') || '{}')
      if (storedEmail && !data.cached) {
        fetch('/api/generate-pdf', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name:        n,
            email:       storedEmail,
            roadmap:     data.roadmap,
            archetype:   data.archetype   || 'The Pioneer',
            personality: data.personality || 'action',
            stage:       storedAnswers?.q1  || 'starting',
            goal:        storedAnswers?.q18 || '$5K-$10K / month',
            hours:       storedAnswers?.q19 || '10-20',
            videoSlug:   getVideoSlug(storedAnswers?.q1 || 'starting'),
          })
        }).then(r => r.json()).catch(() => {})
      }
    } catch {
      if (attempt < 3) { await new Promise(r => setTimeout(r, 3500)); return generateRoadmap(n, a, attempt + 1) }
      setGenFailed(true); setLoading(false)
    }
  }

  const saveLead = async (n: string, e: string, a: Record<string, string>) => {
    // Run lead-save + welcome sequence ONCE per email per browser, so a refresh
    // never re-triggers the day-0 email or CRM sync (no duplicate emails/records).
    const key = `a5_lead_done_${(e || '').toLowerCase()}`
    try { if (localStorage.getItem(key)) return } catch { /* private mode */ }
    try {
      await fetch('/api/save-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: n, email: e, quiz_answers: a, video_assigned: getVideoSlug(a.q1), sequence_assigned: 'A' })
      })
      try { localStorage.setItem(key, '1') } catch { /* ignore */ }
      fetch('/api/sync-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: n, email: e, stage: a.q1 || 'starting', goal: a.q18 || '$5K-$10K / month', hours: a.q19 || '10-20', video_assigned: getVideoSlug(a.q1), quiz_answers: a })
      }).catch(() => {})
      fetch('/api/send-sequence-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: e, name: n, day: 0, sequence: 'A', video_slug: getVideoSlug(a.q1) })
      }).catch(() => {})
    } catch { /* non-critical, will retry on next load */ }
  }

  /* ─── Derived ─── */
  const firstName  = name.split(' ')[0] || 'there'
  const stageLabel = archetype || formatStage(answers.q1 || 'starting')
  const sections   = parseRoadmap(roadmap)
  // Real AI scores (parsed from the model). Falls back to stage-derived values if absent.
  const subScores  = buildSubScores(sections['SCORES'] || '', answers.q1 || 'starting')
  const overall    = Math.round(subScores.reduce((s, x) => s + x.val, 0) / subScores.length)
  const situation  = sections['YOUR SITUATION RIGHT NOW'] || ''
  const moneyPsych = sections['MONEY PSYCHOLOGY INSIGHTS'] || ''
  const opportunity = sections['YOUR BIGGEST OPPORTUNITY'] || ''
  const next7      = sections['YOUR NEXT 7 DAYS'] || ''
  const gatedKeys  = ['YOUR SIGNATURE OFFER', 'YOUR PRICING STRATEGY', '30-DAY ACTION PLAN', '7-DAY CONTENT PLAN', 'YOUR LEAD MAGNET IDEA', 'YOUR DIGITAL PRODUCT IDEA']
  const gatedPreview = (sections[gatedKeys.find(k => sections[k]) || ''] || '').slice(0, 320)
  void personalityType

  /* ════════ Loading ════════ */
  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: `linear-gradient(168deg,${C.plum},${C.plumDark} 60%,${C.plumDeep})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'DM Sans', system-ui, sans-serif", position: 'relative', overflow: 'hidden' }}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');
          *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
          @keyframes lglow{from{opacity:.4;transform:translate(-50%,0) scale(1)}to{opacity:.85;transform:translate(-50%,0) scale(1.15)}}
          @keyframes lmsg{0%{opacity:0;transform:translateY(8px)}15%{opacity:1;transform:translateY(0)}85%{opacity:1}100%{opacity:.5}}
          @keyframes lorbit{to{transform:rotate(360deg)}}
        `}</style>
        <div style={{ position: 'absolute', top: '20%', left: '50%', width: '70vw', height: '60vh', background: 'radial-gradient(ellipse,rgba(201,168,76,.16),transparent 68%)', animation: 'lglow 4s ease-in-out infinite alternate', pointerEvents: 'none' }} />
        <div style={{ textAlign: 'center', maxWidth: 420, padding: '0 28px', width: '100%', position: 'relative', zIndex: 1 }}>
          <div style={{ width: 64, height: 64, margin: '0 auto 36px', position: 'relative' }}>
            <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: `1.5px solid ${C.goldLine}` }} />
            <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', borderTop: `1.5px solid ${C.gold}`, borderRight: '1.5px solid transparent', borderBottom: '1.5px solid transparent', borderLeft: '1.5px solid transparent', animation: 'lorbit 1.1s linear infinite' }} />
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Cormorant Garamond',serif", fontSize: 26, fontStyle: 'italic', color: C.gold }}>5</div>
          </div>
          <div style={{ fontSize: 11, letterSpacing: '.22em', textTransform: 'uppercase', color: C.gold, marginBottom: 20 }}>The5th AI is working</div>
          <p key={msgIdx} style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 26, fontWeight: 500, color: '#fff', minHeight: 36, lineHeight: 1.3, animation: 'lmsg 1.6s ease forwards' }}>
            {LOADING_MESSAGES[msgIdx]}…
          </p>
          <div style={{ height: 2, background: 'rgba(255,255,255,.1)', borderRadius: 2, overflow: 'hidden', marginTop: 30 }}>
            <div style={{ height: '100%', background: `linear-gradient(90deg,${C.goldDeep},${C.gold})`, borderRadius: 2, width: `${((msgIdx + 1) / LOADING_MESSAGES.length) * 100}%`, transition: 'width 1.6s ease' }} />
          </div>
          <p style={{ fontSize: 12.5, color: slow ? C.goldSoft : 'rgba(255,255,255,.4)', marginTop: 22, lineHeight: 1.6, transition: 'color .4s' }}>
            {slow
              ? "We're so sorry, we're seeing a sudden rush of women taking the assessment right now, so this is taking a little longer than usual. Please hold on, yours is worth the wait."
              : 'Building something genuinely personal to you.'}
          </p>
        </div>
      </div>
    )
  }

  /* ════════ Report ════════ */
  const ScoreBar = ({ label, val }: { label: string; val: number }) => (
    <div style={{ marginBottom: 18 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 7 }}>
        <span style={{ fontSize: 13.5, color: C.inkMid, fontWeight: 500 }}>{label}</span>
        <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 18, fontWeight: 600, color: C.goldDeep }}>{val}</span>
      </div>
      <div style={{ height: 7, background: C.creamDeep, borderRadius: 6, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${val}%`, borderRadius: 6, background: `linear-gradient(90deg,${C.green},${C.gold})`, transition: 'width 1.1s cubic-bezier(.2,.7,.2,1)' }} />
      </div>
    </div>
  )

  const card: React.CSSProperties = { background: C.white, border: `1px solid ${C.border}`, borderRadius: 16, padding: '36px 38px', boxShadow: '0 24px 60px -44px rgba(46,26,53,.5)' }
  const eyebrow: React.CSSProperties = { fontSize: 11, letterSpacing: '.18em', textTransform: 'uppercase', color: C.goldDeep, fontWeight: 700, marginBottom: 12, display: 'block' }
  const h2: React.CSSProperties = { fontFamily: "'Cormorant Garamond',serif", fontSize: 'clamp(26px,3.6vw,38px)', fontWeight: 600, color: C.ink, lineHeight: 1.1, letterSpacing: '-.01em' }

  return (
    <div style={{ minHeight: '100vh', background: C.cream, fontFamily: "'DM Sans', system-ui, sans-serif", color: C.ink }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,400;1,600&family=DM+Sans:wght@300;400;500;600&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        body{-webkit-font-smoothing:antialiased}
        @keyframes rfade{from{opacity:0;transform:translateY(22px)}to{opacity:1;transform:none}}
        .ru{animation:rfade .7s cubic-bezier(.2,.7,.2,1) both}
        .ru2{animation:rfade .7s .1s cubic-bezier(.2,.7,.2,1) both}
        .ru3{animation:rfade .7s .2s cubic-bezier(.2,.7,.2,1) both}
        .rwrap{max-width:880px;margin:0 auto;padding:0 24px}
        .rgrid2{display:grid;grid-template-columns:1.1fr .9fr;gap:24px}
        .rtesti{display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px}
        @media(max-width:760px){.rgrid2{grid-template-columns:1fr}.rtesti{grid-template-columns:1fr}}
      `}</style>

      {/* notification */}
      <div style={{ background: C.plumDark, padding: '11px 24px', textAlign: 'center', fontSize: 13, color: 'rgba(255,255,255,.82)' }}>
        Your full report has also been sent to <b style={{ color: C.goldSoft }}>{email || 'your inbox'}</b>
      </div>

      {/* header */}
      <header style={{ padding: '18px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${C.border}`, background: C.ivory }}>
        <Image src="/logo-the5th.png" alt="The5th Consulting" width={150} height={38} style={{ objectFit: 'contain' }} />
        <span style={{ fontSize: 12, color: C.muted, letterSpacing: '.1em', textTransform: 'uppercase' }}>AI Business Assessment</span>
      </header>

      {/* hero */}
      <section className="rwrap ru" style={{ textAlign: 'center', padding: '64px 24px 12px' }}>
        <span style={eyebrow}>{firstName}&apos;s Assessment · Complete</span>
        <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 'clamp(36px,6vw,60px)', fontWeight: 500, color: C.ink, lineHeight: 1.02, letterSpacing: '-.02em', maxWidth: 720, margin: '0 auto' }}>
          Here&apos;s exactly where your business stands, <em style={{ fontStyle: 'italic', color: C.goldDeep }}>{firstName}.</em>
        </h1>
        <p style={{ fontSize: 17, fontWeight: 300, color: C.inkSoft, maxWidth: 560, margin: '20px auto 0', lineHeight: 1.7 }}>
          Our AI read all of your answers and built this for you. Your profile reads as <b style={{ color: C.ink, fontWeight: 600 }}>{stageLabel}</b>.
        </p>
      </section>

      {/* graceful AI-failure notice (after retries) */}
      {genFailed && (
        <section className="rwrap" style={{ padding: '8px 24px 0' }}>
          <div style={{ background: C.ivory, border: `1px solid ${C.goldLine}`, borderRadius: 14, padding: '22px 26px', display: 'flex', gap: 16, alignItems: 'flex-start' }}>
            <div style={{ fontSize: 20, flexShrink: 0 }}>⏳</div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 15.5, color: C.ink, fontWeight: 600, marginBottom: 4 }}>Your full written report is taking a little longer.</p>
              <p style={{ fontSize: 14.5, color: C.inkSoft, fontWeight: 300, lineHeight: 1.6 }}>
                We&apos;re finishing it now and it will also arrive in your inbox shortly. Your scores are below, and you can book your session any time.
              </p>
              <button onClick={() => { setGenFailed(false); setLoading(true); generateRoadmap(name, answers) }}
                style={{ marginTop: 12, background: 'none', border: `1px solid ${C.green}`, color: C.green, fontWeight: 600, fontSize: 13.5, padding: '8px 18px', borderRadius: 6, cursor: 'pointer' }}>
                Try again
              </button>
            </div>
          </div>
        </section>
      )}

      {/* score + diagnostic */}
      <section className="rwrap ru2" style={{ padding: '40px 24px' }}>
        <div className="rgrid2">
          {/* Health score */}
          <div style={{ ...card, background: `linear-gradient(165deg,${C.plum},${C.plumDark})`, color: '#fff', border: 'none', display: 'flex', flexDirection: 'column', justifyContent: 'center', textAlign: 'center' }}>
            <span style={{ ...eyebrow, color: C.gold }}>Business Health Score</span>
            <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 84, fontWeight: 500, color: C.gold, lineHeight: 1 }}>{overall}</div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,.5)', letterSpacing: '.04em' }}>out of 100</div>
            <p style={{ fontSize: 14.5, color: 'rgba(255,255,255,.7)', marginTop: 18, lineHeight: 1.6, fontWeight: 300 }}>
              Scored by our AI from your answers, an honest read on where you are today, and how much room there is to grow.
            </p>
          </div>
          {/* Sub scores */}
          <div style={card}>
            <span style={eyebrow}>Your Nine Scores</span>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', columnGap: 26, marginTop: 4 }}>
              {subScores.map(s => <ScoreBar key={s.label} label={s.label} val={s.val} />)}
            </div>
          </div>
        </div>
      </section>

      {/* diagnostic — "where am I" (FREE) */}
      {situation && (
        <section className="rwrap ru3" style={{ padding: '20px 24px 40px' }}>
          <div style={card}>
            <span style={eyebrow}>What Our AI Sees</span>
            <h2 style={{ ...h2, marginBottom: 18 }}>Your situation, <em style={{ fontStyle: 'italic', color: C.goldDeep }}>right now.</em></h2>
            <RoadmapBody text={situation} />
          </div>
        </section>
      )}

      {/* money psychology insights (FREE) */}
      {moneyPsych && (
        <section className="rwrap" style={{ padding: '0 24px 40px' }}>
          <div style={{ ...card, background: `linear-gradient(165deg,${C.plum},${C.plumDark})`, border: 'none', color: '#fff' }}>
            <span style={{ ...eyebrow, color: C.gold }}>Money Psychology Insights</span>
            <h2 style={{ ...h2, color: '#fff', marginBottom: 18 }}>How you relate to money is <em style={{ fontStyle: 'italic', color: C.gold }}>shaping your pricing.</em></h2>
            <div style={{ color: 'rgba(255,255,255,.82)' }}>
              {moneyPsych.split('\n').filter(l => l.trim()).map((line, i) => (
                <p key={i} style={{ color: 'rgba(255,255,255,.78)', lineHeight: 1.8, fontSize: 15.5, margin: '10px 0', fontWeight: 300 }}>{line.trim().replace(/\*\*/g, '')}</p>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* biggest opportunity (FREE teaser) */}
      {opportunity && (
        <section className="rwrap" style={{ padding: '0 24px 40px' }}>
          <div style={{ ...card, background: `linear-gradient(165deg,${C.ivory},${C.creamMid})`, borderColor: C.goldLine }}>
            <span style={eyebrow}>Your Biggest Opportunity</span>
            <h2 style={{ ...h2, marginBottom: 18 }}>The highest-leverage move <em style={{ fontStyle: 'italic', color: C.goldDeep }}>available to you.</em></h2>
            <RoadmapBody text={opportunity} />
          </div>
        </section>
      )}

      {/* YOUR NEXT 7 DAYS — the solution (FREE) */}
      {next7 && (
        <section className="rwrap" style={{ padding: '0 24px 24px' }}>
          <div style={{ ...card, borderTop: `3px solid ${C.green}` }}>
            <span style={eyebrow}>Your Solution · Start Today</span>
            <h2 style={{ ...h2, marginBottom: 8 }}>Your next 7 days, <em style={{ fontStyle: 'italic', color: C.goldDeep }}>made simple.</em></h2>
            <p style={{ fontSize: 15, color: C.inkSoft, fontWeight: 300, marginBottom: 22 }}>One small, doable step each day. This is where momentum begins.</p>
            <RoadmapBody text={next7} />
          </div>
        </section>
      )}

      {/* 7-day AI coaching activated */}
      <section className="rwrap" style={{ padding: '0 24px 24px' }}>
        <div style={{ ...card, background: `linear-gradient(165deg,${C.ivory},${C.creamMid})`, borderColor: C.goldLine, display: 'flex', gap: 18, alignItems: 'flex-start' }}>
          <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(201,168,76,.14)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 20 }}>✉️</div>
          <div>
            <span style={{ ...eyebrow, marginBottom: 6 }}>Your 7-Day AI Coaching Is Now Active</span>
            <p style={{ fontSize: 15, color: C.inkSoft, fontWeight: 300, lineHeight: 1.65 }}>
              We&apos;ve emailed your full report and PDF to <b style={{ color: C.ink, fontWeight: 600 }}>{email || 'your inbox'}</b>. Starting tomorrow morning, you&apos;ll get one short coaching email a day for 7 days, each tailored to your answers, to keep you moving. Check your inbox (and your spam folder, just in case).
            </p>
          </div>
        </div>
      </section>

      {/* GATED full roadmap → book to unlock */}
      <section className="rwrap" style={{ padding: '0 24px 24px' }}>
        <div style={{ position: 'relative', borderRadius: 16, overflow: 'hidden', border: `1px solid ${C.border}` }}>
          {/* blurred preview */}
          <div style={{ padding: '36px 38px', filter: 'blur(5px)', opacity: .5, userSelect: 'none', pointerEvents: 'none', maxHeight: 240, overflow: 'hidden', background: C.white }} aria-hidden="true">
            <span style={eyebrow}>Your 90-Day Roadmap</span>
            <RoadmapBody text={gatedPreview || 'Your signature offer, your pricing strategy, your full 30-day action plan, and your personalised content plan are ready and waiting inside your roadmap.'} muted />
          </div>
          {/* lock overlay */}
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '40px 28px', background: 'linear-gradient(180deg,rgba(250,246,240,.72),rgba(250,246,240,.96))' }}>
            <div style={{ width: 52, height: 52, borderRadius: '50%', border: `1.5px solid ${C.gold}`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18, background: 'rgba(201,168,76,.1)' }}>
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke={C.goldDeep} strokeWidth="1.6"><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>
            </div>
            <span style={eyebrow}>Your 90-Day Roadmap Is Ready</span>
            <h2 style={{ ...h2, maxWidth: 560, marginBottom: 12 }}>This is the half that changes everything, <em style={{ fontStyle: 'italic', color: C.goldDeep }}>and we build it with you.</em></h2>
            <p style={{ fontSize: 16, fontWeight: 300, color: C.inkSoft, maxWidth: 520, lineHeight: 1.7, marginBottom: 8 }}>
              Your signature offer, your pricing, your full 30-day action plan, and your personalised content plan are ready. We&apos;ll walk through them with you on your Private Strategy &amp; Coaching Session, and prioritise the exact next steps for your situation.
            </p>
          </div>
        </div>
      </section>

      {/* THE SESSION — booking (Step 2) */}
      <section className="rwrap" style={{ padding: '20px 24px 8px' }}>
        <div style={{ ...card, background: `linear-gradient(168deg,${C.plum},${C.plumDark} 60%,${C.plumDeep})`, color: '#fff', border: 'none', textAlign: 'center', padding: '52px 38px' }}>
          <span style={{ ...eyebrow, color: C.gold }}>Your Next 14 Days</span>
          <h2 style={{ ...h2, color: '#fff', maxWidth: 660, margin: '0 auto 16px' }}>Want to understand your full report, and solve your biggest problem, <em style={{ fontStyle: 'italic', color: C.gold }}>within 14 days?</em></h2>
          <p style={{ fontSize: 16.5, fontWeight: 300, color: 'rgba(255,255,255,.74)', maxWidth: 580, margin: '0 auto 14px', lineHeight: 1.75 }}>
            You&apos;ve seen half of it. The other half, your offer, your pricing, and your full 90-day roadmap, is the half that actually changes your income. And right now it&apos;s sitting unopened.
          </p>
          <p style={{ fontSize: 16.5, fontWeight: 300, color: 'rgba(255,255,255,.74)', maxWidth: 580, margin: '0 auto 30px', lineHeight: 1.75 }}>
            On a Private Strategy &amp; Coaching Session, Indrodip walks through your complete report with you and maps the exact moves to solve the one challenge you came here for, <b style={{ color: '#fff', fontWeight: 600 }}>starting in the next 14 days.</b> The women who book leave knowing precisely what&apos;s been holding them back. The ones who don&apos;t are usually in the same place a year from now.
          </p>
          <a href="/call" style={{ display: 'inline-block', background: `linear-gradient(180deg,${C.goldSoft},${C.gold} 60%,${C.goldDeep})`, color: C.plumDark, fontSize: 17, fontWeight: 700, padding: '20px 48px', borderRadius: 6, textDecoration: 'none', boxShadow: '0 16px 40px rgba(201,168,76,.34)' }}>
            Yes, Unlock My Full Report &amp; Plan →
          </a>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,.5)', marginTop: 16 }}>Free · By application · You&apos;ll review this report with Indrodip personally · You leave with clarity either way</p>

          <div style={{ maxWidth: 560, margin: '36px auto 0', textAlign: 'left', borderTop: '1px solid rgba(255,255,255,.12)', paddingTop: 28 }}>
            <span style={{ ...eyebrow, color: C.gold }}>What We&apos;ll Do Together</span>
            {SESSION_INCLUDES.map((s, i) => (
              <div key={i} style={{ display: 'flex', gap: 12, marginBottom: 11 }}>
                <span style={{ color: C.gold, flexShrink: 0, fontWeight: 700 }}>✓</span>
                <span style={{ fontSize: 15, color: 'rgba(255,255,255,.78)', fontWeight: 300, lineHeight: 1.5 }}>{s}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* testimonials */}
      <section className="rwrap" style={{ padding: '48px 24px 20px' }}>
        <p style={{ textAlign: 'center', ...eyebrow, color: C.muted, marginBottom: 26 }}>Women who took this step</p>
        <div className="rtesti">
          {TESTIMONIALS.map((t, i) => (
            <div key={i} style={{ background: C.ivory, border: `1px solid ${C.border}`, borderRadius: 12, padding: '24px 24px' }}>
              <div style={{ color: C.gold, letterSpacing: 2, fontSize: 13, marginBottom: 10 }}>★★★★★</div>
              <p style={{ fontSize: 14, color: C.inkMid, lineHeight: 1.65, marginBottom: 14, fontWeight: 300 }}>{t.quote}</p>
              <div style={{ fontSize: 13, color: C.ink, fontWeight: 600 }}>{t.name}</div>
              <div style={{ fontSize: 12, color: C.goldDeep, marginTop: 2 }}>{t.result}</div>
            </div>
          ))}
        </div>
      </section>

      {/* footer */}
      <footer style={{ padding: '28px 28px 44px', borderTop: `1px solid ${C.border}`, textAlign: 'center', marginTop: 24 }}>
        <p style={{ fontSize: 12, color: C.muted }}>© 2026 The5th Consulting · <a href="/privacy" style={{ color: C.inkSoft, textDecoration: 'underline' }}>Privacy</a> · support@10kroadmap.org</p>
      </footer>
    </div>
  )
}
