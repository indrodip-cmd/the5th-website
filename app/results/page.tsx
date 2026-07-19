'use client'

import React, { useState, useEffect, useMemo } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import VideoWall from '@/components/VideoWall'
import { type Study, CASE_STUDIES as STUDIES, CASE_CATEGORIES as CATEGORIES } from '@/lib/case-studies'

/* ════════ Brand tokens (shared with /quiz/results + AI Home) ════════ */
const C = {
  cream: '#FAF6F0', ivory: '#FBF8F2', creamMid: '#F4EEE4', creamDeep: '#EAE3D8',
  plum: '#3D2645', plumDark: '#2E1A35', plumDeep: '#231029',
  gold: '#C9A84C', goldSoft: '#E4C879', goldDeep: '#B0902F', goldLine: 'rgba(201,168,76,.32)',
  green: '#1C4A32',
  ink: '#1A1A2E', inkMid: '#403b3b', inkSoft: '#5a5550', muted: '#8A8075', border: '#E2DCD2', white: '#fff',
}


/* ════════ Shared bits ════════ */
const eyebrow: React.CSSProperties = { fontSize: 11, letterSpacing: '.2em', textTransform: 'uppercase', color: C.goldDeep, fontWeight: 700, display: 'block' }

const initialsOf = (name: string) =>
  name.trim().split(/\s+/).slice(0, 2).map(w => w[0]).join('').toUpperCase()

/* Branded poster used whenever a client photo isn't in yet (videos coming later) */
function Poster({ study, rounded }: { study: Study; rounded?: number }) {
  return (
    <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(150deg,${C.plum},${C.plumDark} 55%,${C.plumDeep})`, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: rounded }}>
      <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: rounded ? 30 : 58, fontWeight: 600, color: C.gold, opacity: 0.92, letterSpacing: '.02em' }}>{initialsOf(study.name)}</span>
    </div>
  )
}

/* ════════ Detail modal ════════ */
function StudyModal({ study, onClose }: { study: Study; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = prev }
  }, [onClose])

  const sec = (label: string, text: string) => (
    <div style={{ marginBottom: 16 }}>
      <span style={{ ...eyebrow, color: C.muted, fontSize: 10, marginBottom: 6 }}>{label}</span>
      <p style={{ fontSize: 14.5, color: C.inkSoft, lineHeight: 1.7, fontWeight: 300 }}>{text}</p>
    </div>
  )

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.22 }}
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(35,16,41,.55)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: 'max(16px,env(safe-area-inset-top)) 16px max(24px,env(safe-area-inset-bottom))', overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}
    >
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 16, scale: 0.98 }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        onClick={e => e.stopPropagation()}
        role="dialog" aria-modal="true" aria-label={`${study.name} case study`}
        style={{ position: 'relative', width: '100%', maxWidth: 580, margin: 'auto', background: C.cream, borderRadius: 20, border: `1px solid ${C.border}`, boxShadow: '0 40px 90px -30px rgba(35,16,41,.65)', overflow: 'hidden' }}
      >
        {/* close */}
        <button onClick={onClose} aria-label="Close" style={{ position: 'absolute', top: 14, right: 14, zIndex: 3, width: 34, height: 34, borderRadius: '50%', border: 'none', background: 'rgba(255,255,255,.9)', color: C.plum, fontSize: 20, lineHeight: 1, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 14px rgba(46,26,53,.2)' }}>×</button>

        {/* header */}
        <div style={{ display: 'flex', gap: 16, padding: '24px 24px 18px', background: C.ivory, borderBottom: `1px solid ${C.border}` }}>
          <div style={{ position: 'relative', width: 72, height: 90, borderRadius: 12, overflow: 'hidden', flexShrink: 0, border: `1px solid ${C.border}` }}>
            {study.image ? <Image src={study.image} alt={study.name} fill sizes="72px" style={{ objectFit: 'cover' }} /> : <Poster study={study} rounded={12} />}
          </div>
          <div style={{ flex: 1, minWidth: 0, paddingRight: 28 }}>
            <span style={{ display: 'inline-block', fontSize: 10, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: C.goldDeep, background: 'rgba(201,168,76,.12)', border: `1px solid ${C.goldLine}`, borderRadius: 50, padding: '3px 10px', marginBottom: 8 }}>{study.category}</span>
            <h3 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 25, fontWeight: 600, color: C.ink, lineHeight: 1.1 }}>{study.name}</h3>
            <p style={{ fontSize: 12.5, color: C.muted, marginTop: 3 }}>{study.niche}{study.location ? ` · ${study.location}` : ''}</p>
          </div>
        </div>

        {/* headline metric */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, padding: '18px 24px', background: `linear-gradient(165deg,${C.plum},${C.plumDark})`, color: '#fff' }}>
          <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 34, fontWeight: 600, color: C.gold, lineHeight: 1 }}>{study.headline.v}</span>
          <span style={{ fontSize: 13.5, color: 'rgba(255,255,255,.72)' }}>{study.headline.period}</span>
        </div>

        {/* optional video */}
        {study.videoUrl && (
          <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9', background: '#000' }}>
            <iframe src={study.videoUrl} title={`${study.name} — video`} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none' }} />
          </div>
        )}

        {/* body */}
        <div style={{ padding: '22px 24px 8px' }}>
          <p style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 19, fontStyle: 'italic', color: C.goldDeep, lineHeight: 1.3, marginBottom: 18 }}>{study.tagline}</p>
          {sec('Background', study.background)}
          {sec('The Challenge', study.challenge)}
          {sec('What We Did', study.whatWeDid)}

          {/* results */}
          <div style={{ background: C.white, border: `1px solid ${C.border}`, borderTop: `3px solid ${C.green}`, borderRadius: 14, padding: '18px 20px', marginBottom: 6 }}>
            <span style={{ ...eyebrow, color: C.green, fontSize: 10, marginBottom: 12 }}>The Results</span>
            {study.metrics && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(96px,1fr))', gap: 10, marginBottom: study.bullets ? 14 : 0 }}>
                {study.metrics.map(m => (
                  <div key={m.l} style={{ background: C.cream, border: `1px solid ${C.border}`, borderRadius: 10, padding: '12px 8px', textAlign: 'center' }}>
                    <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 22, fontWeight: 600, color: C.plum, lineHeight: 1 }}>{m.v}</div>
                    <div style={{ fontSize: 10.5, color: C.muted, marginTop: 6, lineHeight: 1.35 }}>{m.l}</div>
                  </div>
                ))}
              </div>
            )}
            {study.bullets && study.bullets.map(b => (
              <div key={b} style={{ display: 'flex', gap: 9, margin: '8px 0' }}>
                <span style={{ color: C.goldDeep, flexShrink: 0, fontWeight: 700 }}>✓</span>
                <span style={{ fontSize: 14, color: C.inkSoft, lineHeight: 1.55, fontWeight: 300 }}>{b}</span>
              </div>
            ))}
          </div>
        </div>

        {/* footer cta */}
        <div style={{ padding: '14px 24px 24px', textAlign: 'center' }}>
          <a href="/quiz" style={{ display: 'inline-block', background: `linear-gradient(180deg,${C.goldSoft},${C.gold} 60%,${C.goldDeep})`, color: C.plumDark, fontSize: 14.5, fontWeight: 700, padding: '13px 30px', borderRadius: 7, textDecoration: 'none' }}>
            Get a plan like this →
          </a>
        </div>
      </motion.div>
    </motion.div>
  )
}

/* ════════ Card ════════ */
function StudyCard({ study, onOpen }: { study: Study; onOpen: () => void }) {
  return (
    <button onClick={onOpen} className="cs-card"
      style={{ textAlign: 'left', cursor: 'pointer', background: C.white, border: `1px solid ${C.border}`, borderRadius: 16, overflow: 'hidden', display: 'flex', flexDirection: 'column', padding: 0, font: 'inherit', color: 'inherit' }}>
      <div style={{ position: 'relative', width: '100%', aspectRatio: '3/2', background: C.creamMid }}>
        {study.image ? <Image src={study.image} alt={study.name} fill sizes="(max-width:680px) 100vw, 320px" style={{ objectFit: 'cover' }} /> : <Poster study={study} />}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg,transparent 45%,rgba(35,16,41,.66))' }} />
        <span style={{ position: 'absolute', top: 12, left: 12, fontSize: 10, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: C.plumDark, background: 'rgba(255,255,255,.92)', borderRadius: 50, padding: '4px 11px' }}>{study.category}</span>
        {study.videoUrl && (
          <span style={{ position: 'absolute', top: 11, right: 12, display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 10, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: C.plumDark, background: C.goldSoft, borderRadius: 50, padding: '4px 10px' }}>▶ Watch</span>
        )}
        <div style={{ position: 'absolute', left: 14, right: 14, bottom: 12 }}>
          <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 21, fontWeight: 600, color: '#fff', lineHeight: 1.1 }}>{study.name}</div>
          <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,.82)', marginTop: 2 }}>{study.niche}</div>
        </div>
      </div>
      <div style={{ padding: '16px 18px 18px', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 10 }}>
          <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 27, fontWeight: 600, color: C.goldDeep, lineHeight: 1 }}>{study.headline.v}</span>
          <span style={{ fontSize: 12, color: C.muted }}>{study.headline.period}</span>
        </div>
        <p style={{ fontSize: 13.5, color: C.inkSoft, lineHeight: 1.5, fontWeight: 300, flex: 1, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{study.tagline}</p>
        <span style={{ fontSize: 13, fontWeight: 600, color: C.plum, marginTop: 14 }}>View case study →</span>
      </div>
    </button>
  )
}

/* ════════ Access gate — name + email to unlock the library ════════ */
function AccessGate({ onUnlock }: { onUnlock: (firstName: string) => void }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    const nm = name.trim()
    const em = email.trim()
    if (nm.length < 2) { setErr('Please enter your first name.'); return }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)) { setErr('Please enter a valid email address.'); return }
    setErr(''); setBusy(true)
    const first = nm.split(' ')[0]
    try {
      localStorage.setItem('the5th_first_name', first)
      localStorage.setItem('cw_lead_name', first)
      localStorage.setItem('cw_lead_email', em)
    } catch {}
    let visitorId = ''
    try { visitorId = (window as unknown as { __a5vid?: string }).__a5vid || localStorage.getItem('a5_vid') || '' } catch {}
    // Let Carolina + the personalization layer know instantly.
    try { window.dispatchEvent(new CustomEvent('the5th:identified', { detail: { firstName: first, email: em } })) } catch {}
    // Report to the CRM as a Results-page visitor (fire-and-forget).
    fetch('/api/results/access', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: nm, email: em, visitor_id: visitorId }) }).catch(() => {})
    onUnlock(first)
  }

  const field: React.CSSProperties = { width: '100%', border: `1px solid ${C.border}`, background: C.white, borderRadius: 11, padding: '13px 15px', fontSize: 15, fontFamily: 'inherit', color: C.ink, outline: 'none' }

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}
      style={{ position: 'fixed', inset: 0, zIndex: 210, background: 'rgba(35,16,41,.42)', backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'max(18px,env(safe-area-inset-top)) 16px max(24px,env(safe-area-inset-bottom))', overflowY: 'auto' }}
    >
      <motion.div
        initial={{ opacity: 0, y: 26, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.36, ease: [0.22, 1, 0.36, 1] }}
        role="dialog" aria-modal="true" aria-label="Unlock the case study library"
        style={{ position: 'relative', width: '100%', maxWidth: 460, margin: 'auto', background: C.cream, borderRadius: 22, border: `1px solid ${C.border}`, boxShadow: '0 50px 110px -30px rgba(35,16,41,.7)', overflow: 'hidden' }}
      >
        {/* branded top */}
        <div style={{ background: `linear-gradient(165deg,${C.plum},${C.plumDark} 60%,${C.plumDeep})`, color: '#fff', padding: '30px 30px 26px', textAlign: 'center' }}>
          <span style={{ ...eyebrow, color: C.goldSoft, marginBottom: 12 }}>Client Case Study Library</span>
          <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 'clamp(26px,4.4vw,34px)', fontWeight: 600, lineHeight: 1.12, letterSpacing: '-.01em' }}>
            See the real numbers behind <em style={{ fontStyle: 'italic', color: C.gold }}>15+ client wins.</em>
          </h2>
        </div>

        {/* body */}
        <form onSubmit={submit} style={{ padding: '24px 30px 28px' }}>
          <p style={{ fontSize: 14.5, color: C.inkSoft, lineHeight: 1.6, fontWeight: 300, marginBottom: 18, textAlign: 'center' }}>
            Tell us who you are and we&rsquo;ll open the full library — then tailor the stories and your next step to <b style={{ fontWeight: 600, color: C.ink }}>your</b> niche. It&rsquo;s free.
          </p>

          {/* why it matters */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 9, background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: '14px 16px', marginBottom: 18 }}>
            {[
              'Unlock all 15+ documented case studies + video reviews',
              'Get the wins closest to your business, not random ones',
              'Your concierge greets you by name and remembers you',
            ].map(t => (
              <div key={t} style={{ display: 'flex', gap: 9, alignItems: 'flex-start' }}>
                <span style={{ color: C.goldDeep, fontWeight: 700, flexShrink: 0, lineHeight: 1.5 }}>✓</span>
                <span style={{ fontSize: 13, color: C.inkSoft, lineHeight: 1.5 }}>{t}</span>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="First name" autoComplete="given-name" style={field} />
            <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email address" type="email" autoComplete="email" inputMode="email" style={field} />
          </div>

          {err && <p style={{ fontSize: 12.5, color: '#a1451f', marginTop: 10 }}>{err}</p>}

          <button type="submit" disabled={busy}
            style={{ width: '100%', marginTop: 16, background: `linear-gradient(180deg,${C.goldSoft},${C.gold} 60%,${C.goldDeep})`, color: C.plumDark, fontSize: 15.5, fontWeight: 700, padding: '15px 24px', borderRadius: 10, border: 'none', cursor: busy ? 'default' : 'pointer', opacity: busy ? 0.7 : 1, fontFamily: 'inherit', boxShadow: '0 14px 34px rgba(201,168,76,.32)' }}>
            {busy ? 'Opening…' : 'Show me the results →'}
          </button>
          <p style={{ fontSize: 11.5, color: C.muted, marginTop: 12, textAlign: 'center', lineHeight: 1.5 }}>
            No spam — just your results library and the occasional useful email. Unsubscribe anytime.
          </p>
        </form>
      </motion.div>
    </motion.div>
  )
}

/* ════════ Page ════════ */
export default function ResultsPage() {
  const [query, setQuery] = useState('')
  const [cat, setCat] = useState('All')
  const [active, setActive] = useState<Study | null>(null)

  // Access gate — visitors enter name + email to unlock the library. Returning
  // visitors (email already stored on this device) skip straight in.
  const [gateOpen, setGateOpen] = useState(false)
  const [gateReady, setGateReady] = useState(false)
  useEffect(() => {
    const check = () => {
      let hasEmail = false
      try { hasEmail = !!localStorage.getItem('cw_lead_email') } catch {}
      setGateOpen(!hasEmail)
      setGateReady(true)
    }
    check()
  }, [])

  // Personalization — if Carolina knows the visitor's name, this page greets
  // them by it (and updates live the moment she learns it).
  const [firstName, setFirstName] = useState('')
  useEffect(() => {
    const read = () => {
      try {
        const w = (window as unknown as { The5thVisitor?: { firstName?: string } }).The5thVisitor?.firstName
        const n = w || localStorage.getItem('the5th_first_name') || localStorage.getItem('cw_lead_name') || ''
        setFirstName(n ? String(n).split(' ')[0] : '')
      } catch {}
    }
    read()
    const onId = (e: Event) => {
      const n = (e as CustomEvent<{ firstName?: string }>).detail?.firstName
      if (n) setFirstName(String(n).split(' ')[0])
    }
    window.addEventListener('the5th:identified', onId)
    return () => window.removeEventListener('the5th:identified', onId)
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return STUDIES.filter(s => {
      if (cat !== 'All' && s.category !== cat) return false
      if (!q) return true
      const hay = [s.name, s.niche, s.category, s.location, s.tagline, ...s.tags].join(' ').toLowerCase()
      return q.split(/\s+/).every(w => hay.includes(w))
    })
  }, [query, cat])

  return (
    <div style={{ minHeight: '100vh', background: C.cream, fontFamily: "'DM Sans', system-ui, sans-serif", color: C.ink }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,600&family=DM+Sans:wght@300;400;500;600&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        html,body{max-width:100%;overflow-x:hidden}
        body{-webkit-font-smoothing:antialiased;-webkit-text-size-adjust:100%;text-size-adjust:100%}
        img,iframe{max-width:100%}
        /* content wrapper: fluid gutters that also respect notch safe-areas */
        .rwrap{max-width:1120px;margin:0 auto;padding-left:max(clamp(16px,4vw,24px),env(safe-area-inset-left));padding-right:max(clamp(16px,4vw,24px),env(safe-area-inset-right))}
        /* card grid: min() keeps a single card from ever overflowing a narrow phone */
        .cs-cards{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,260px),1fr));gap:clamp(14px,2.4vw,22px)}
        .cs-card{transition:transform .2s ease, box-shadow .2s ease, border-color .2s ease}
        @media(hover:hover){.cs-card:hover{transform:translateY(-4px);box-shadow:0 24px 50px -34px rgba(46,26,53,.55);border-color:${C.goldLine}}}
        .cs-card:active{transform:translateY(-1px)}
        .chip{transition:all .18s ease;white-space:nowrap;flex:0 0 auto}
        .chiprow{display:flex;gap:9px;overflow-x:auto;scrollbar-width:none;-webkit-overflow-scrolling:touch;padding-bottom:2px;scroll-snap-type:x proximity;-ms-overflow-style:none}
        .chiprow>*{scroll-snap-align:start}
        .chiprow::-webkit-scrollbar{display:none}
        .toolbar-inner{display:flex;align-items:center;gap:16px}
        .rhead{padding:12px clamp(16px,4vw,28px);padding-left:max(clamp(16px,4vw,28px),env(safe-area-inset-left));padding-right:max(clamp(16px,4vw,28px),env(safe-area-inset-right))}
        .rlogo{width:clamp(148px,42vw,212px);height:auto}
        .rcta{font-size:13px;padding:9px 18px;white-space:nowrap}
        @media(max-width:640px){.toolbar-inner{flex-direction:column;align-items:stretch;gap:10px}}
        @media(max-width:420px){.rcta{font-size:12px;padding:8px 13px}}
        /* short landscape phones: tighten vertical rhythm so cards show sooner */
        @media(max-height:520px) and (orientation:landscape){.rhero{padding-top:26px!important;padding-bottom:16px!important}}
      `}</style>

      {/* top bar — stays fixed at the top while the page scrolls */}
      <header className="rhead" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, borderBottom: `1px solid ${C.border}`, background: 'rgba(251,248,242,.92)', position: 'sticky', top: 0, zIndex: 50, backdropFilter: 'blur(10px)' }}>
        <a href="/" style={{ display: 'inline-flex', flexShrink: 1, minWidth: 0 }}><Image src="/images/the5th-logo-purple.png" alt="The5th Consulting" width={212} height={83} priority className="rlogo" style={{ objectFit: 'contain' }} /></a>
        <a href="/quiz" className="rcta" style={{ fontWeight: 600, color: C.plum, textDecoration: 'none', border: `1px solid ${C.goldLine}`, borderRadius: 50, flexShrink: 0 }}>
          Take the assessment →
        </a>
      </header>

      {/* hero — personalized by name when Carolina knows the visitor */}
      <section className="rwrap rhero" style={{ textAlign: 'center', paddingTop: 'clamp(38px,7vw,60px)', paddingBottom: 'clamp(20px,4vw,30px)' }}>
        <span style={{ ...eyebrow, marginBottom: 14 }}>{firstName ? `Curated for ${firstName} · Case Study Library` : 'The 10K Roadmap Program · Case Study Library'}</span>
        <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 'clamp(30px,5.6vw,58px)', fontWeight: 500, color: C.ink, lineHeight: 1.05, letterSpacing: '-.02em', maxWidth: 760, margin: '0 auto' }}>
          Real coaches. Real revenue.{' '}
          <em style={{ fontStyle: 'italic', color: C.goldDeep }}>{firstName ? `${firstName}, yours is next.` : 'Browse the proof.'}</em>
        </h1>
        <p style={{ fontSize: 'clamp(15px,1.8vw,16.5px)', fontWeight: 300, color: C.inkSoft, maxWidth: 560, margin: '18px auto 0', lineHeight: 1.7 }}>
          {firstName
            ? `Hand-picked wins across every niche, ${firstName} — search yours, then open a story to see exactly what we built and what it produced.`
            : 'Every win in one place — search a niche or filter, then open a story to see exactly what we built and what it produced.'}
        </p>
      </section>

      {/* filter toolbar — scrolls with the page (only the header stays fixed) */}
      <div style={{ background: C.ivory, borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}` }}>
        <div className="rwrap" style={{ paddingTop: 12, paddingBottom: 12 }}>
          <div className="toolbar-inner">
            {/* search */}
            <div style={{ position: 'relative', flex: 1, minWidth: 0 }}>
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke={C.muted} strokeWidth="2" strokeLinecap="round" style={{ position: 'absolute', left: 15, top: '50%', transform: 'translateY(-50%)' }}><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input
                value={query} onChange={e => setQuery(e.target.value)}
                placeholder="Search a niche or name — e.g. dating, fitness, EFT, branding…"
                style={{ width: '100%', border: `1px solid ${C.border}`, background: C.white, borderRadius: 50, padding: '11px 40px 11px 44px', fontSize: 14.5, fontFamily: 'inherit', color: C.ink, outline: 'none' }}
              />
              {query && (
                <button onClick={() => setQuery('')} aria-label="Clear search" style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'none', color: C.muted, fontSize: 18, cursor: 'pointer', lineHeight: 1 }}>×</button>
              )}
            </div>
            {/* count */}
            <span style={{ fontSize: 12.5, color: C.muted, whiteSpace: 'nowrap', flexShrink: 0 }}>
              {filtered.length === STUDIES.length ? `${STUDIES.length} stories` : `${filtered.length} of ${STUDIES.length}`}
            </span>
          </div>
          {/* niche chips */}
          <div className="chiprow" style={{ marginTop: 10 }}>
            {CATEGORIES.map(c => {
              const on = cat === c
              return (
                <button key={c} onClick={() => setCat(c)} className="chip"
                  style={{ border: `1px solid ${on ? C.plum : C.border}`, background: on ? C.plum : C.white, color: on ? '#fff' : C.inkMid, fontSize: 12.5, fontWeight: 600, padding: '7px 15px', borderRadius: 50, cursor: 'pointer', fontFamily: 'inherit' }}>
                  {c}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* library — all case studies together in one grid */}
      <section className="rwrap" style={{ paddingTop: 'clamp(22px,4vw,30px)', paddingBottom: 'clamp(30px,5vw,40px)' }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '70px 12px', color: C.muted }}>
            <p style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 26, color: C.ink, marginBottom: 10 }}>No case studies match that search.</p>
            <p style={{ fontSize: 15, fontWeight: 300, marginBottom: 20 }}>Try a broader term, or clear your filters.</p>
            <button onClick={() => { setQuery(''); setCat('All') }} style={{ border: `1px solid ${C.goldLine}`, background: 'none', color: C.goldDeep, fontWeight: 600, fontSize: 14, padding: '11px 24px', borderRadius: 50, cursor: 'pointer' }}>
              Clear filters
            </button>
          </div>
        ) : (
          <div className="cs-cards">
            {filtered.map(s => <StudyCard key={s.slug} study={s} onOpen={() => setActive(s)} />)}
          </div>
        )}
      </section>

      {/* video testimonials — on-camera reviews */}
      <section className="rwrap" style={{ padding: '24px 24px 40px' }}>
        <div style={{ textAlign: 'center', maxWidth: 620, margin: '0 auto 34px' }}>
          <span style={{ ...eyebrow, marginBottom: 12 }}>On-camera · Paid consultation reviews</span>
          <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 'clamp(28px,4.4vw,46px)', fontWeight: 500, color: C.ink, lineHeight: 1.06, letterSpacing: '-.02em' }}>
            Hear it from them <em style={{ fontStyle: 'italic', color: C.goldDeep }}>directly.</em>
          </h2>
          <p style={{ fontSize: 16, fontWeight: 300, color: C.inkSoft, margin: '16px auto 0', lineHeight: 1.7 }}>
            Unscripted reactions from clients after their paid strategy consultations. Tap any clip to play.
          </p>
        </div>
        <VideoWall />
      </section>

      {/* closing CTA */}
      <section className="rwrap" style={{ padding: '8px 24px 8px' }}>
        <div style={{ background: `linear-gradient(168deg,${C.plum},${C.plumDark} 60%,${C.plumDeep})`, color: '#fff', borderRadius: 20, padding: 'clamp(36px,5vw,60px) clamp(28px,5vw,52px)', textAlign: 'center' }}>
          <span style={{ ...eyebrow, color: C.gold, marginBottom: 12 }}>{firstName ? `${firstName}, your story could be next` : 'Your story could be next'}</span>
          <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 'clamp(26px,4vw,42px)', fontWeight: 500, color: '#fff', lineHeight: 1.1, maxWidth: 600, margin: '0 auto 16px' }}>
            Find the next move for <em style={{ fontStyle: 'italic', color: C.gold }}>{firstName ? `${firstName}'s` : 'your'}</em> business.
          </h2>
          <p style={{ fontSize: 16, fontWeight: 300, color: 'rgba(255,255,255,.74)', maxWidth: 520, margin: '0 auto 28px', lineHeight: 1.7 }}>
            {firstName
              ? `We've mapped 15+ businesses like yours, ${firstName}. Take the free assessment to find your Expert Income Archetype and exact next step — then we map your roadmap together.`
              : 'Take the free assessment to discover your Expert Income Archetype and the exact next step, then we map your roadmap together.'}
          </p>
          <a href="/quiz" style={{ display: 'inline-block', background: `linear-gradient(180deg,${C.goldSoft},${C.gold} 60%,${C.goldDeep})`, color: C.plumDark, fontSize: 16, fontWeight: 700, padding: '16px 38px', borderRadius: 7, textDecoration: 'none', boxShadow: '0 16px 40px rgba(201,168,76,.34)' }}>
            Take the free assessment →
          </a>
        </div>
      </section>

      {/* footer */}
      <footer style={{ padding: '36px 28px 52px', textAlign: 'center', marginTop: 24 }}>
        <p style={{ fontSize: 12.5, color: C.muted }}>
          © 2026 The5th Consulting · Individual results; every business and timeline differs · <a href="/privacy" style={{ color: C.inkSoft, textDecoration: 'underline' }}>Privacy</a>
        </p>
      </footer>

      {/* modal */}
      <AnimatePresence>
        {active && <StudyModal key={active.slug} study={active} onClose={() => setActive(null)} />}
      </AnimatePresence>

      {/* access gate */}
      <AnimatePresence>
        {gateReady && gateOpen && (
          <AccessGate key="gate" onUnlock={(n) => { setFirstName(n); setGateOpen(false) }} />
        )}
      </AnimatePresence>
    </div>
  )
}
