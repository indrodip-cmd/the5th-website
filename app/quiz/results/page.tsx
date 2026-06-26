'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'

/* ─── Helpers (kept) ─── */
function formatStage(q1: string): string {
  const m: Record<string, string> = { starting: 'The Pioneer', idea: 'The Pioneer', launched: 'The Pathfinder', scaling: 'The Builder' }
  return m[q1] || q1 || 'Starting'
}

function formatGoal(q18: string): string {
  const m: Record<string, string> = { '1-3k': '$1K–$3K/mo', '3-5k': '$3K–$5K/mo', '5-10k': '$5K–$10K/mo', '10k+': '$10K+/mo' }
  return m[q18] || q18 || 'Goal'
}

function getVSLHeadline(firstName: string, q1: string): string {
  const h: Record<string, string> = {
    starting:    `${firstName}, you are The Pioneer — and this video shows exactly why you haven't got your first client yet (and how to fix it this week)`,
    idea:        `${firstName}, you are The Pioneer — and this video shows exactly why you haven't got your first client yet (and how to fix it this week)`,
    launched:    `${firstName}, you are The Pathfinder — and this video reveals the exact reason your income is still inconsistent (it's not what you think)`,
    scaling:     `${firstName}, you are The Builder — and this video shows the one architectural shift that breaks your revenue ceiling for good`,
    established: `${firstName}, you are The Luminary — and this video reveals the strategy shift that takes you from great to genuinely untouchable`,
  }
  return h[q1] || `${firstName}, your personalised video is ready`
}

function getVSLSub(q2: string): string {
  const s: Record<string, string> = {
    action:     'You are wired for action. Watch this short video to see the exact moves that match how you operate — then book your free strategy call below.',
    connection: "You build through relationships, not hustle. Watch this video to see the strategy that fits how you are naturally wired — then let's talk.",
    ideas:      'Your biggest asset is how you think. This video shows you how to turn that into a system that generates consistent income — watch it now.',
    meaning:    'You do not need to hustle to build a $10K month. This video shows you the gentle path that actually works for someone wired like you.',
  }
  return s[q2] || 'Watch your personalised video then book a free strategy call below.'
}

function getPersonalityLabel(q2: string): string {
  const p: Record<string, string> = { action: 'The Driver', connection: 'The Flow Worker', ideas: 'The Deep Thinker', meaning: 'The Gentle Builder' }
  return p[q2] || 'The Driver'
}

/* ─── Archetype one-liners ─── */
const ARCHETYPE_ONELINER: Record<string, string> = {
  pioneer:    'You have the knowledge and the drive. What you have not yet built is the system that turns that knowledge into consistent income. The video below shows you the exact first steps that match how you are wired — and why everything you have tried so far has felt harder than it should.',
  pathfinder: 'You have proven you can get clients. What you have not cracked is how to get them consistently. The video below diagnoses the exact reason your income is still unpredictable — and shows you the one structural fix that changes everything.',
  builder:    'You have built something real. The ceiling you are hitting is not a skill problem — it is an architecture problem. The video below shows you the specific shift that breaks your current revenue limit for good.',
  luminary:   'You are established. The question now is not whether you can build — it is whether you will build the right thing next. The video below shows you what the most successful women at your stage do differently to move from great to genuinely untouchable.',
}

function getArchetypeOneLiner(archetype: string, q1: string): string {
  const a = archetype.toLowerCase()
  if (a.includes('pioneer')    || (!archetype && (q1 === 'starting' || q1 === 'idea'))) return ARCHETYPE_ONELINER.pioneer
  if (a.includes('pathfinder') || (!archetype && q1 === 'launched'))                    return ARCHETYPE_ONELINER.pathfinder
  if (a.includes('builder')    || (!archetype && q1 === 'scaling'))                     return ARCHETYPE_ONELINER.builder
  if (a.includes('luminary')   || (!archetype && q1 === 'established'))                 return ARCHETYPE_ONELINER.luminary
  return ARCHETYPE_ONELINER.pioneer
}

/* ─── Static data ─── */
const LOADING_MESSAGES = [
  'Reading your 20 answers...',
  'Identifying your Expert Archetype...',
  'Mapping your personality type...',
  'Building your signature offer...',
  'Writing your personalised 7-day plan...',
  'Finalising your blueprint...',
]

const WISTIA_IDS: Record<string, string> = {
  v1: '',
  v2: '',
  v3: '',
  v4: '',
}

const TESTIMONIALS = [
  {
    name:   'Jeanne Tomasak',
    quote:  'I had spent over $10,000 on coaches before working with Indrodip. None gave me the clarity he did. Six weeks later I closed my first client.',
    result: 'First client in 6 weeks',
  },
  {
    name:   'Angela Gregg',
    quote:  'After burning through $25,000 on coaches who did not understand my context, two months with Indrodip and I closed my first $2,500 sale.',
    result: 'First $2,500 sale',
  },
  {
    name:   'Laurie Gerber',
    quote:  'We rebuilt the strategy, repositioned my pricing from $79 to $225, and within three months I generated $26,000 in revenue.',
    result: '$26,000 in 3 months',
  },
  {
    name:   'Jennifer',
    quote:  'I went from zero to $4,000 every single month. The clarity I got in one call changed everything I thought I knew about my business.',
    result: '$4K/month consistently',
  },
]

const WHAT_YOU_GET = [
  'Your offer completely defined and priced',
  'Your exact sales conversation mapped out',
  'Your 30-day revenue plan ready to execute',
  'Your biggest growth block identified and removed',
  'Your exact next 3 steps starting tomorrow',
]

/* ─── Main page ─── */
export default function ResultsPage() {
  const [name, setName]           = useState('')
  const [email, setEmail]         = useState('')
  const [answers, setAnswers]     = useState<Record<string, string>>({})
  const [roadmap, setRoadmap]     = useState('')
  const [loading, setLoading]     = useState(true)
  const [msgIdx, setMsgIdx]       = useState(0)
  const [progress, setProgress]   = useState(0)
  const [archetype, setArchetype] = useState('')
  const [personalityType, setPersonalityType] = useState('')

  useEffect(() => {
    if (!loading) return
    const iv = setInterval(() => setMsgIdx(i => (i + 1) % LOADING_MESSAGES.length), 2000)
    return () => clearInterval(iv)
  }, [loading])

  useEffect(() => {
    if (loading) { const t = setTimeout(() => setProgress(90), 50); return () => clearTimeout(t) }
    else setProgress(100)
  }, [loading])

  useEffect(() => {
    const storedName    = sessionStorage.getItem('quiz_name')    || ''
    const storedEmail   = sessionStorage.getItem('quiz_email')   || ''
    const storedAnswers = JSON.parse(sessionStorage.getItem('quiz_answers') || '{}')
    setName(storedName)
    setEmail(storedEmail)
    setAnswers(storedAnswers)
    generateRoadmap(storedName, storedAnswers)
    saveLead(storedName, storedEmail, storedAnswers)
  }, [])

  const getVideoSlug = (q1: string) => {
    if (q1 === 'starting' || q1 === 'idea') return 'v1'
    if (q1 === 'launched') return 'v2'
    if (q1 === 'scaling')  return 'v3'
    return 'v1'
  }

  const generateRoadmap = async (n: string, a: Record<string, string>) => {
    try {
      const res  = await fetch('/api/generate-roadmap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: a, name: n })
      })
      const data = await res.json()
      setRoadmap(data.roadmap || '')
      if (data.archetype)   setArchetype(data.archetype)
      if (data.personality) setPersonalityType(data.personality)

      const storedEmail   = sessionStorage.getItem('quiz_email') || ''
      const storedAnswers = JSON.parse(sessionStorage.getItem('quiz_answers') || '{}')
      if (storedEmail && data.roadmap) {
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
        })
          .then(r => r.json())
          .then(d => console.log('PDF sent:', d))
          .catch(err => console.error('PDF error:', err))
      }
    } catch {
      setRoadmap('Your personalised roadmap is being prepared. Check your inbox for the full PDF version.')
    } finally {
      setLoading(false)
    }
  }

  const saveLead = async (n: string, e: string, a: Record<string, string>) => {
    try {
      await fetch('/api/save-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: n, email: e, quiz_answers: a, video_assigned: getVideoSlug(a.q1), sequence_assigned: 'A' })
      })
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
    } catch { /* non-critical */ }
  }

  /* ─── Derived values ─── */
  const firstName      = name.split(' ')[0] || 'there'
  const vslHeadline    = getVSLHeadline(firstName, answers.q1 || 'starting')
  const vslSub         = getVSLSub(answers.q2 || 'action')
  const personalityLabel = getPersonalityLabel(answers.q2 || 'action')
  const stageLabel     = formatStage(answers.q1 || 'starting')
  const oneLiner       = getArchetypeOneLiner(archetype, answers.q1 || 'starting')
  const videoSlug      = getVideoSlug(answers.q1 || 'starting')
  const wistiaId       = WISTIA_IDS[videoSlug] || ''

  /* Suppress unused-var warnings for kept state/helpers */
  void roadmap; void personalityType; void formatGoal

  /* ─── Loading screen (kept exactly) ─── */
  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#0d0d0b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, system-ui, sans-serif' }}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
          *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
          @keyframes spin { to { transform: rotate(360deg); } }
          @keyframes msgFade { 0%{opacity:0;transform:translateY(6px)} 12%{opacity:1;transform:translateY(0)} 88%{opacity:1;transform:translateY(0)} 100%{opacity:0;transform:translateY(-4px)} }
        `}</style>
        <div style={{ textAlign: 'center', maxWidth: 320, padding: '0 24px', width: '100%' }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid rgba(139,127,207,0.2)', borderTopColor: '#8b7fcf', animation: 'spin 0.85s linear infinite', margin: '0 auto 36px' }} />
          <p key={msgIdx} style={{ fontSize: 16, fontWeight: 600, color: '#fff', marginBottom: 10, minHeight: 26, lineHeight: 1.4, animation: 'msgFade 2s ease forwards' }}>
            {LOADING_MESSAGES[msgIdx]}
          </p>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', marginBottom: 28 }}>Usually takes 10–15 seconds</p>
          <div style={{ height: 3, background: 'rgba(255,255,255,0.1)', borderRadius: 2, overflow: 'hidden' }}>
            <div style={{ height: '100%', background: '#8b7fcf', borderRadius: 2, width: `${progress}%`, transition: 'width 10s linear' }} />
          </div>
        </div>
      </div>
    )
  }

  /* ─── Results page ─── */
  return (
    <div style={{ minHeight: '100vh', background: '#0f0e1a', fontFamily: "'Inter', system-ui, sans-serif", color: '#fff' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Cormorant+Garant:wght@700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { -webkit-font-smoothing: antialiased; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        .ru  { animation: fadeUp 0.55s ease both; }
        .ru2 { animation: fadeUp 0.55s 0.1s ease both; }
        .ru3 { animation: fadeUp 0.55s 0.2s ease both; }
        .testi-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; max-width: 640px; margin: 0 auto; }
        @media (max-width: 600px) {
          .testi-grid { grid-template-columns: 1fr !important; }
          .res-header  { padding: 14px 20px !important; }
          .res-hero    { padding: 36px 20px 32px !important; }
          .res-video   { padding: 40px 20px !important; }
          .res-cta     { padding: 32px 20px 48px !important; }
          .res-testi   { padding: 40px 20px !important; }
          .res-footer  { padding: 18px 20px !important; }
        }
      `}</style>

      {/* ── 1. NOTIFICATION BAR ── */}
      <div style={{ background: '#8b7fcf', padding: '10px 24px', textAlign: 'center', fontSize: 13, color: '#fff', lineHeight: 1.5 }}>
        📧 Your personalised PDF blueprint has been sent to {email || 'your inbox'}
      </div>

      {/* ── 2. HEADER ── */}
      <header className="res-header" style={{ background: '#0f0e1a', padding: '16px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <Image src="/logo-white2.png" alt="The5th Consulting" width={160} height={36} style={{ objectFit: 'contain' }} />
        {firstName && firstName !== 'there' && (
          <div style={{ background: 'rgba(255,255,255,0.08)', color: '#a99de0', fontSize: 12, padding: '5px 14px', borderRadius: 20 }}>
            {firstName}&apos;s Results
          </div>
        )}
      </header>

      {/* ── 3. HERO — ARCHETYPE REVEAL ── */}
      <section className="res-hero" style={{ background: '#1a1040', padding: '48px 24px 40px', textAlign: 'center' }}>
        <div style={{ maxWidth: 640, margin: '0 auto' }}>

          {/* Badges */}
          <div className="ru" style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 24 }}>
            {archetype && (
              <div style={{ background: 'rgba(139,127,207,0.2)', color: '#a99de0', border: '1px solid rgba(139,127,207,0.3)', fontSize: 12, padding: '6px 16px', borderRadius: 20 }}>
                {archetype}
              </div>
            )}
            <div style={{ background: 'rgba(201,168,76,0.15)', color: '#c9a84c', border: '1px solid rgba(201,168,76,0.3)', fontSize: 12, padding: '6px 16px', borderRadius: 20 }}>
              {personalityLabel}
            </div>
            <div style={{ background: 'rgba(139,127,207,0.2)', color: '#a99de0', border: '1px solid rgba(139,127,207,0.3)', fontSize: 12, padding: '6px 16px', borderRadius: 20 }}>
              {stageLabel}
            </div>
          </div>

          {/* Small label */}
          <div className="ru" style={{ fontSize: 11, color: '#c9a84c', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: 12 }}>
            Your Expert Income Archetype
          </div>

          {/* Archetype name */}
          <h1 className="ru2" style={{ fontFamily: "'Cormorant Garant', serif", fontSize: 'clamp(42px,6vw,64px)', fontWeight: 700, color: '#ffffff', marginBottom: 8 }}>
            {archetype || stageLabel}
          </h1>

          {/* Sub */}
          <p className="ru2" style={{ fontSize: 15, color: 'rgba(255,255,255,0.5)', marginBottom: 32 }}>
            Personality type: {personalityLabel}
          </p>

          {/* Gold rule */}
          <div className="ru3" style={{ width: 60, height: 1, background: '#c9a84c', margin: '0 auto 32px', opacity: 0.5 }} />

          {/* One-liner card */}
          <div className="ru3" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(201,168,76,0.2)', borderRadius: 12, padding: '24px 28px', maxWidth: 560, margin: '0 auto' }}>
            <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.75)', lineHeight: 1.75 }}>
              {oneLiner}
            </p>
          </div>

        </div>
      </section>

      {/* ── 4. VIDEO SECTION ── */}
      <section className="res-video" style={{ background: '#0f0e1a', padding: '48px 24px' }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>

          <div style={{ fontSize: 11, color: '#c9a84c', letterSpacing: '2px', textTransform: 'uppercase', textAlign: 'center', marginBottom: 16 }}>
            Your Personalised Video
          </div>

          <h2 style={{ fontFamily: "'Cormorant Garant', serif", fontSize: 'clamp(22px,3.5vw,32px)', fontWeight: 700, color: '#ffffff', textAlign: 'center', maxWidth: 640, margin: '0 auto 28px', lineHeight: 1.3 }}>
            {vslHeadline}
          </h2>

          {/* Wistia embed / placeholder */}
          <div style={{ maxWidth: 720, margin: '0 auto', borderRadius: 10, overflow: 'hidden', aspectRatio: '16/9', position: 'relative' }}>
            {wistiaId ? (
              <div
                className={`wistia_embed wistia_async_${wistiaId} videoFoam=true`}
                style={{ height: '100%', position: 'relative', width: '100%' }}
              >&nbsp;</div>
            ) : (
              <div style={{ width: '100%', height: '100%', background: '#1a1040', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
                <div style={{ width: 72, height: 72, borderRadius: '50%', border: '3px solid rgba(255,255,255,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ width: 0, height: 0, borderStyle: 'solid', borderWidth: '14px 0 14px 24px', borderColor: 'transparent transparent transparent rgba(255,255,255,0.9)', marginLeft: 4 }} />
                </div>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontSize: 15, fontWeight: 600, color: 'rgba(255,255,255,0.8)', marginBottom: 6 }}>Your Personalised Video</p>
                  <p style={{ fontSize: 13, color: '#c9a84c', fontWeight: 600 }}>{archetype || stageLabel}</p>
                </div>
              </div>
            )}
          </div>

          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.45)', textAlign: 'center', marginTop: 16, maxWidth: 480, marginLeft: 'auto', marginRight: 'auto' }}>
            {vslSub}
          </p>

        </div>
      </section>

      {/* ── 5. CTA SECTION ── */}
      <section className="res-cta" style={{ background: '#0f0e1a', padding: '40px 24px 56px', textAlign: 'center' }}>
        <div style={{ maxWidth: 640, margin: '0 auto' }}>

          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginBottom: 20, fontStyle: 'italic' }}>
            Watched the video? Here is your next step.
          </p>

          <a
            href="https://cal.com/indrodip-ghosh-ut1vxh/60min"
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: 'inline-block', background: '#8b7fcf', color: '#fff', fontSize: 18, fontWeight: 700, padding: '18px 52px', borderRadius: 50, textDecoration: 'none', boxShadow: '0 8px 28px rgba(139,127,207,0.35)' }}
          >
            Book your free strategy call with Indrodip
          </a>

          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)', marginTop: 14 }}>
            60 minutes · Free · No pressure · Just clarity
          </p>

          {/* What you get */}
          <div style={{ maxWidth: 520, margin: '32px auto 0', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '24px 28px', textAlign: 'left' }}>
            <div style={{ fontSize: 11, color: '#c9a84c', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: 16 }}>
              What You Walk Away With
            </div>
            {WHAT_YOU_GET.map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: 12, marginBottom: i < WHAT_YOU_GET.length - 1 ? 12 : 0 }}>
                <span style={{ color: '#c9a84c', fontSize: 15, flexShrink: 0, lineHeight: 1.5 }}>✓</span>
                <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.65)', lineHeight: 1.5 }}>{item}</span>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ── 6. TESTIMONIALS ── */}
      <section className="res-testi" style={{ background: '#12101e', padding: '48px 24px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>

        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', letterSpacing: '2px', textTransform: 'uppercase', textAlign: 'center', marginBottom: 28 }}>
          Women Who Took This Call
        </div>

        <div className="testi-grid">
          {TESTIMONIALS.map((t, i) => (
            <div key={i} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '20px 22px' }}>
              <div style={{ fontFamily: "'Cormorant Garant', serif", fontSize: 48, color: '#c9a84c', opacity: 0.35, lineHeight: 1, marginBottom: 8 }}>
                &ldquo;
              </div>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', lineHeight: 1.7, marginBottom: 12 }}>
                {t.quote}
              </p>
              <div style={{ fontSize: 12, color: '#c9a84c', fontWeight: 600 }}>{t.name}</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 2 }}>{t.result}</div>
            </div>
          ))}
        </div>

      </section>

      {/* ── 7. FOOTER ── */}
      <footer className="res-footer" style={{ background: '#0a0a08', padding: '20px 40px', borderTop: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)' }}>
          The5th Consulting · support@10kroadmap.org · quiz.the5th.consulting
        </p>
      </footer>

    </div>
  )
}
