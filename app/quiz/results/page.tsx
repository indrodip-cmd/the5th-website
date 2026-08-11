'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import Cal, { getCalApi } from '@calcom/embed-react'
import { whopTrack } from '@/lib/whop'
import type { Diagnostic } from '@/lib/diagnostic'

/* ════════ Brand tokens ════════ */
const C = {
  cream: '#FAF6F0', ivory: '#FBF8F2', creamMid: '#F4EEE4', creamDeep: '#EAE3D8',
  plum: '#3D2645', plumDark: '#2E1A35', plumDeep: '#231029',
  gold: '#C9A84C', goldSoft: '#E4C879', goldDeep: '#B0902F', goldLine: 'rgba(201,168,76,.32)',
  green: '#1C4A32', greenDark: '#143826',
  ink: '#1A1A2E', inkMid: '#403b3b', inkSoft: '#5a5550', muted: '#8A8075', border: '#E2DCD2', white: '#fff',
}

interface Snapshot {
  health: string
  strengths: string[]
  biggest_gap: string
  recommendation: string
  next_step: string
}

/* ════════ Helpers (kept) ════════ */
function formatStage(q1: string): string {
  const m: Record<string, string> = { starting: 'The Pioneer', idea: 'The Pioneer', launched: 'The Pathfinder', scaling: 'The Builder', established: 'The Luminary' }
  return m[q1] || q1 || 'The Pioneer'
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
  'Scoring your business health',
  'Preparing your assessment',
]

const TESTIMONIALS = [
  { name: 'Jeanne', quote: 'That one conversation gave me more clarity than $10,000 of coaching ever did. Six weeks later I closed my first client.', result: 'First client in 6 weeks' },
  { name: 'Laurie', quote: 'We rebuilt my strategy and repositioned my pricing. Within three months I generated $26,000 in revenue.', result: '$26,000 in 3 months' },
  { name: 'Angela', quote: 'After years of guessing, two months with Indrodip and I finally understood my own business. The first sale followed quickly.', result: 'First $2,500 sale' },
]

const SESSION_INCLUDES = [
  'We review your full diagnostic and roadmap together',
  'We prioritize the highest-impact next 90 days',
  'We refine your offer and your pricing',
  'We name the one blind spot holding you back',
  'You leave with clarity, whether or not we work together',
]

/* What the $27 full diagnostic unlocks — shown on the paywall. */
const FULL_REPORT_INCLUDES = [
  'Your complete executive summary and full category breakdown',
  'Your signature offer, built for your niche and stage',
  'Your pricing strategy and the exact language to hold your price',
  'Your personalised 30-day action plan and 7-day content plan',
  'Your lead magnet and digital product blueprints',
  'Your prioritised fixes and the fastest path forward',
  'A free 1:1 strategy call to implement it, included',
]

/* ════════ Add-to-calendar links (Google / Microsoft / Apple) ════════ */
const CAL_TITLE = 'Private Strategy & Coaching Session · The5th Consulting'
function pad(n: number) { return String(n).padStart(2, '0') }
function toUTCStamp(d: Date) {
  return `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`
}
function buildCalendarLinks(startISO: string, meetingUrl?: string | null) {
  const start = new Date(startISO)
  if (isNaN(start.getTime())) return null
  const end = new Date(start.getTime() + 60 * 60 * 1000) // 60-min session
  const s = toUTCStamp(start), e = toUTCStamp(end)
  const location = meetingUrl || 'Online — link in your confirmation email'
  const details = `Your Private Strategy & Coaching Session with Indrodip Ghosh. We'll walk through your full report and map your next 14 days.${meetingUrl ? `\n\nJoin: ${meetingUrl}` : ''}`
  const google = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(CAL_TITLE)}&dates=${s}/${e}&details=${encodeURIComponent(details)}&location=${encodeURIComponent(location)}`
  const outlook = `https://outlook.office.com/calendar/0/deeplink/compose?path=%2Fcalendar%2Faction%2Fcompose&rru=addevent&subject=${encodeURIComponent(CAL_TITLE)}&startdt=${start.toISOString()}&enddt=${end.toISOString()}&body=${encodeURIComponent(details)}&location=${encodeURIComponent(location)}`
  const ics = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//The5th Consulting//Session//EN', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH', 'BEGIN:VEVENT', `UID:${s}-the5th@the5th.consulting`, `DTSTAMP:${toUTCStamp(new Date())}`, `DTSTART:${s}`, `DTEND:${e}`, `SUMMARY:${CAL_TITLE}`, `DESCRIPTION:${details.replace(/\n/g, '\\n')}`, `LOCATION:${location}`, 'END:VEVENT', 'END:VCALENDAR'].join('\r\n')
  const apple = 'data:text/calendar;charset=utf-8,' + encodeURIComponent(ics)
  return { google, outlook, apple }
}

/* Fire-and-forget funnel event → Journey Intelligence (server dedups/ignores unknown). */
function track(event: string, meta?: Record<string, unknown>) {
  try {
    const email = sessionStorage.getItem('quiz_email') || ''
    fetch('/api/quiz/track', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event, email, meta: meta || {} }), keepalive: true,
    }).catch(() => {})
  } catch { /* ignore */ }
}

/* Ordered deep sections for the paid full report. */
const FULL_SECTIONS: { key: string; title: string; dark?: boolean }[] = [
  { key: 'YOUR SITUATION RIGHT NOW', title: 'Your situation, right now' },
  { key: 'MONEY PSYCHOLOGY INSIGHTS', title: 'Money psychology insights', dark: true },
  { key: 'YOUR SIGNATURE OFFER', title: 'Your signature offer' },
  { key: 'YOUR PRICING STRATEGY', title: 'Your pricing strategy' },
  { key: 'YOUR LEAD MAGNET IDEA', title: 'Your lead magnet' },
  { key: 'YOUR DIGITAL PRODUCT IDEA', title: 'Your digital product' },
  { key: '7-DAY CONTENT PLAN', title: 'Your 7-day content plan' },
  { key: '30-DAY ACTION PLAN', title: 'Your 30-day action plan' },
  { key: 'YOUR BIGGEST OPPORTUNITY', title: 'Your biggest opportunity' },
  { key: 'YOUR NEXT 7 DAYS', title: 'Your next 7 days' },
]

/* ════════ Page ════════ */
export default function ResultsPage() {
  const [name, setName]           = useState('')
  const [email, setEmail]         = useState('')
  const [answers, setAnswers]     = useState<Record<string, string>>({})
  const [tier, setTier]           = useState<'free' | 'full'>('free')
  const [roadmap, setRoadmap]     = useState('')
  const [snapshot, setSnapshot]   = useState<Snapshot | null>(null)
  const [diagnostic, setDiagnostic] = useState<Diagnostic | null>(null)
  const [growthAreas, setGrowthAreas] = useState(7)
  const [loading, setLoading]     = useState(true)
  const [msgIdx, setMsgIdx]       = useState(0)
  const [slow, setSlow]           = useState(false)
  const [genFailed, setGenFailed] = useState(false)
  const [archetype, setArchetype] = useState('')
  const [booked, setBooked]       = useState(false)
  const [booking, setBooking]     = useState<{ name?: string; start?: string; timeZone?: string; meetingUrl?: string | null }>({})

  /* Cal.com embed → capture a successful booking and show the thank-you. */
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const cal = await getCalApi({ namespace: '60min' })
      cal('ui', { hideEventTypeDetails: true, layout: 'month_view' })
      cal('on', {
        action: 'bookingSuccessful',
        callback: (e: unknown) => {
          if (cancelled) return
          const d = ((e as { detail?: { data?: Record<string, unknown> } })?.detail?.data) || {}
          const b = (d.booking as Record<string, unknown>) || d
          const att = ((b.attendees as Array<Record<string, unknown>>)?.[0]) || {}
          const start = String(b.startTime || d.date || b.start || '')
          const nm = String(att.name || sessionStorage.getItem('quiz_name') || '')
          const em = String(att.email || sessionStorage.getItem('quiz_email') || '').toLowerCase()
          setBooking({ name: nm, start })
          setBooked(true)
          whopTrack('schedule') // Whop Pixel: appointment booked
          track('strategy_call_booked', { start })
          window.scrollTo({ top: 0, behavior: 'smooth' })
          // Enrich with the real start time / timezone / meeting link from Cal.
          if (em) fetch(`/api/cal/recent-booking?email=${encodeURIComponent(em)}`)
            .then(r => r.json())
            .then(j => { if (!cancelled && j?.booking) setBooking(c => ({ ...c, ...j.booking })) })
            .catch(() => {})
        },
      })
    })()
    return () => { cancelled = true }
  }, [])

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

  const generateRoadmap = async (n: string, a: Record<string, string>, attempt = 0): Promise<void> => {
    try {
      const res  = await fetch('/api/generate-roadmap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: a, name: n, email: sessionStorage.getItem('quiz_email') || '' })
      })
      const data = await res.json().catch(() => ({}))

      // A successful response has either a free snapshot or a full roadmap.
      const ok = res.ok && ((data.tier === 'free' && data.snapshot) || (data.tier === 'full' && data.roadmap))
      // Transient (concurrency lock / rate limit / 5xx): the first generation may
      // still be completing. Wait and retry so we land on the finished result.
      if (!ok && attempt < 3) {
        await new Promise(r => setTimeout(r, 3500))
        return generateRoadmap(n, a, attempt + 1)
      }
      if (!ok) { setGenFailed(true); setLoading(false); return }

      const t: 'free' | 'full' = data.tier === 'full' ? 'full' : 'free'
      setTier(t)
      if (data.diagnostic) setDiagnostic(data.diagnostic as Diagnostic)
      if (data.archetype)  setArchetype(data.archetype)
      if (typeof data.growthAreas === 'number') setGrowthAreas(data.growthAreas)
      if (t === 'full') setRoadmap(data.roadmap)
      else setSnapshot(data.snapshot as Snapshot)
      setLoading(false)

      track(t === 'full' ? 'full_report_viewed' : 'free_report_viewed')
      if (t === 'free') track('paywall_viewed')

      // Email the PDF only for the PAID full report, on a FRESH generation (no dup PDFs).
      const storedEmail   = sessionStorage.getItem('quiz_email') || ''
      const storedAnswers = JSON.parse(sessionStorage.getItem('quiz_answers') || '{}')
      if (t === 'full' && storedEmail && !data.cached) {
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
        body: JSON.stringify({ name: n, email: e, quiz_answers: a, video_assigned: getVideoSlug(a.q1), sequence_assigned: 'A', visitor_id: (typeof window !== 'undefined' && window.localStorage.getItem('a5_vid')) || undefined })
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
        body: JSON.stringify({ email: e, name: n, day: 0, sequence: 'A', stage: a.q1, video_slug: getVideoSlug(a.q1) })
      }).catch(() => {})
    } catch { /* non-critical, will retry on next load */ }
  }

  /* ─── Derived ─── */
  const firstName  = name.split(' ')[0] || 'there'
  const stageLabel = archetype || formatStage(answers.q1 || 'starting')
  const overall    = diagnostic?.overall ?? 0
  const categories = diagnostic?.categories ?? []
  const sections   = tier === 'full' ? parseRoadmap(roadmap) : {}

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
              ? "We're so sorry, we're seeing a sudden rush of professionals taking the assessment right now, so this is taking a little longer than usual. Please hold on, yours is worth the wait."
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
        {tier === 'full'
          ? <>Your full report has also been sent to <b style={{ color: C.goldSoft }}>{email || 'your inbox'}</b></>
          : <>Your assessment is saved to <b style={{ color: C.goldSoft }}>{email || 'your inbox'}</b></>}
      </div>

      {/* header */}
      <header style={{ padding: '18px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${C.border}`, background: C.ivory }}>
        <Image src="/logo-the5th.png" alt="The5th Consulting" width={150} height={38} style={{ objectFit: 'contain' }} />
        <span style={{ fontSize: 12, color: C.muted, letterSpacing: '.1em', textTransform: 'uppercase' }}>Business Growth Diagnostic</span>
      </header>

      {/* hero */}
      <section className="rwrap ru" style={{ textAlign: 'center', padding: '64px 24px 12px' }}>
        <span style={eyebrow}>{firstName}&apos;s Assessment · Complete</span>
        <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 'clamp(36px,6vw,60px)', fontWeight: 500, color: C.ink, lineHeight: 1.02, letterSpacing: '-.02em', maxWidth: 720, margin: '0 auto' }}>
          Here&apos;s exactly where your business stands, <em style={{ fontStyle: 'italic', color: C.goldDeep }}>{firstName}.</em>
        </h1>
        <p style={{ fontSize: 17, fontWeight: 300, color: C.inkSoft, maxWidth: 560, margin: '20px auto 0', lineHeight: 1.7 }}>
          We read all of your answers and scored your business health across {categories.length || 8} dimensions. Your profile reads as <b style={{ color: C.ink, fontWeight: 600 }}>{stageLabel}</b>.
        </p>
      </section>

      {/* graceful AI-failure notice (after retries) */}
      {genFailed && (
        <section className="rwrap" style={{ padding: '8px 24px 0' }}>
          <div style={{ background: C.ivory, border: `1px solid ${C.goldLine}`, borderRadius: 14, padding: '22px 26px', display: 'flex', gap: 16, alignItems: 'flex-start' }}>
            <div style={{ fontSize: 20, flexShrink: 0 }}>⏳</div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 15.5, color: C.ink, fontWeight: 600, marginBottom: 4 }}>Your assessment is taking a little longer.</p>
              <p style={{ fontSize: 14.5, color: C.inkSoft, fontWeight: 300, lineHeight: 1.6 }}>
                We&apos;re finishing it now. Please try again in a moment.
              </p>
              <button onClick={() => { setGenFailed(false); setLoading(true); generateRoadmap(name, answers) }}
                style={{ marginTop: 12, background: 'none', border: `1px solid ${C.green}`, color: C.green, fontWeight: 600, fontSize: 13.5, padding: '8px 18px', borderRadius: 6, cursor: 'pointer' }}>
                Try again
              </button>
            </div>
          </div>
        </section>
      )}

      {/* score + diagnostic (BOTH tiers) */}
      {diagnostic && (
        <section className="rwrap ru2" style={{ padding: '40px 24px' }}>
          <div className="rgrid2">
            {/* Health score */}
            <div style={{ ...card, background: `linear-gradient(165deg,${C.plum},${C.plumDark})`, color: '#fff', border: 'none', display: 'flex', flexDirection: 'column', justifyContent: 'center', textAlign: 'center' }}>
              <span style={{ ...eyebrow, color: C.gold }}>Business Health Score</span>
              <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 84, fontWeight: 500, color: C.gold, lineHeight: 1 }}>{overall}</div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,.5)', letterSpacing: '.04em' }}>out of 100</div>
              <p style={{ fontSize: 14.5, color: 'rgba(255,255,255,.7)', marginTop: 18, lineHeight: 1.6, fontWeight: 300 }}>
                An honest read on where your business is today, scored from your answers, and how much room there is to grow.
              </p>
            </div>
            {/* Sub scores */}
            <div style={card}>
              <span style={eyebrow}>Your Category Scores</span>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', columnGap: 26, marginTop: 4 }}>
                {categories.map(c => <ScoreBar key={c.key} label={c.label} val={c.score} />)}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ══════════ FREE TIER: snapshot + paywall ══════════ */}
      {tier === 'free' && snapshot && (
        <>
          {/* Overall health snapshot */}
          <section className="rwrap ru3" style={{ padding: '20px 24px 24px' }}>
            <div style={card}>
              <span style={eyebrow}>Your Business Health</span>
              <h2 style={{ ...h2, marginBottom: 18 }}>What we see, <em style={{ fontStyle: 'italic', color: C.goldDeep }}>right now.</em></h2>
              <RoadmapBody text={snapshot.health} />
            </div>
          </section>

          {/* Strengths + biggest gap */}
          <section className="rwrap" style={{ padding: '0 24px 24px' }}>
            <div className="rgrid2">
              <div style={{ ...card, borderTop: `3px solid ${C.green}` }}>
                <span style={eyebrow}>Your Top Strengths</span>
                {(snapshot.strengths.length ? snapshot.strengths : ['You showed up and did the honest work of assessing your business.']).map((s, i) => (
                  <div key={i} style={{ display: 'flex', gap: 11, margin: '10px 0' }}>
                    <span style={{ color: C.green, flexShrink: 0, fontWeight: 700 }}>✓</span>
                    <span style={{ color: C.inkSoft, lineHeight: 1.6, fontSize: 15 }}>{s.replace(/\*\*/g, '')}</span>
                  </div>
                ))}
              </div>
              <div style={{ ...card, background: `linear-gradient(165deg,${C.ivory},${C.creamMid})`, borderColor: C.goldLine }}>
                <span style={eyebrow}>Your Biggest Growth Gap</span>
                <RoadmapBody text={snapshot.biggest_gap} />
              </div>
            </div>
          </section>

          {/* One immediate recommendation */}
          <section className="rwrap" style={{ padding: '0 24px 24px' }}>
            <div style={{ ...card, background: `linear-gradient(165deg,${C.plum},${C.plumDark})`, border: 'none', color: '#fff' }}>
              <span style={{ ...eyebrow, color: C.gold }}>Do This First</span>
              <h2 style={{ ...h2, color: '#fff', marginBottom: 16 }}>One move to make <em style={{ fontStyle: 'italic', color: C.gold }}>this week.</em></h2>
              <p style={{ fontSize: 16.5, color: 'rgba(255,255,255,.82)', lineHeight: 1.75, fontWeight: 300, marginBottom: 14 }}>{snapshot.recommendation.replace(/\*\*/g, '')}</p>
              <p style={{ fontSize: 14.5, color: 'rgba(255,255,255,.6)', lineHeight: 1.7, fontWeight: 300 }}><b style={{ color: C.goldSoft, fontWeight: 600 }}>Focus first:</b> {snapshot.next_step.replace(/\*\*/g, '')}</p>
            </div>
          </section>

          {/* ── Paywall: $27 full diagnostic ── */}
          <section className="rwrap" style={{ padding: '20px 24px 8px' }}>
            <div style={{ ...card, background: `linear-gradient(168deg,${C.plum},${C.plumDark} 60%,${C.plumDeep})`, color: '#fff', border: 'none', textAlign: 'center', padding: '52px 38px' }}>
              <span style={{ ...eyebrow, color: C.gold }}>The5th Business Growth Diagnostic</span>
              <h2 style={{ ...h2, color: '#fff', maxWidth: 660, margin: '0 auto 16px' }}>
                Your assessment identified <em style={{ fontStyle: 'italic', color: C.gold }}>{growthAreas} growth areas.</em> You&apos;ve seen the most important one.
              </h2>
              <p style={{ fontSize: 16.5, fontWeight: 300, color: 'rgba(255,255,255,.74)', maxWidth: 580, margin: '0 auto 8px', lineHeight: 1.75 }}>
                Your full report contains the rest, your complete diagnosis, your prioritised fixes, your personalised action plan, and the fastest path forward, built specifically from your answers.
              </p>

              <div style={{ maxWidth: 520, margin: '30px auto 0', textAlign: 'left', background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.12)', borderRadius: 14, padding: '26px 28px' }}>
                <span style={{ ...eyebrow, color: C.gold }}>Everything you unlock</span>
                {FULL_REPORT_INCLUDES.map((s, i) => (
                  <div key={i} style={{ display: 'flex', gap: 12, marginBottom: 11 }}>
                    <span style={{ color: C.gold, flexShrink: 0, fontWeight: 700 }}>✓</span>
                    <span style={{ fontSize: 15, color: 'rgba(255,255,255,.82)', fontWeight: 300, lineHeight: 1.5 }}>{s}</span>
                  </div>
                ))}
              </div>

              <div style={{ margin: '32px auto 0' }}>
                <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 15, color: 'rgba(255,255,255,.55)', letterSpacing: '.04em' }}>One-time</div>
                <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 64, fontWeight: 600, color: C.gold, lineHeight: 1 }}>$27</div>
              </div>

              <a href="/diagnostic-checkout" onClick={() => track('checkout_started')}
                style={{ display: 'inline-block', marginTop: 24, background: `linear-gradient(180deg,${C.goldSoft},${C.gold} 60%,${C.goldDeep})`, color: C.plumDark, fontSize: 17, fontWeight: 700, padding: '17px 46px', borderRadius: 8, textDecoration: 'none', boxShadow: '0 18px 40px -20px rgba(201,168,76,.8)' }}>
                Unlock Your Full Business Growth Report →
              </a>

              <p style={{ fontSize: 13.5, color: 'rgba(255,255,255,.55)', marginTop: 18, lineHeight: 1.7, maxWidth: 480, marginLeft: 'auto', marginRight: 'auto' }}>
                <b style={{ color: C.goldSoft, fontWeight: 600 }}>7-Day Satisfaction Guarantee.</b> Go through your full report and start implementing it. If you genuinely feel it didn&apos;t give you meaningful value, email us within 7 days and we&apos;ll review your request per our guarantee terms.
              </p>
            </div>
          </section>
        </>
      )}

      {/* ══════════ FULL TIER: complete report + bonus strategy call ══════════ */}
      {tier === 'full' && (
        <>
          {FULL_SECTIONS.filter(s => sections[s.key]).map(s => (
            <section key={s.key} className="rwrap" style={{ padding: '0 24px 24px' }}>
              <div style={s.dark
                ? { ...card, background: `linear-gradient(165deg,${C.plum},${C.plumDark})`, border: 'none', color: '#fff' }
                : card}>
                <span style={{ ...eyebrow, ...(s.dark ? { color: C.gold } : {}) }}>{s.title}</span>
                {s.dark
                  ? <div>{sections[s.key].split('\n').filter(l => l.trim()).map((line, i) => (
                      <p key={i} style={{ color: 'rgba(255,255,255,.78)', lineHeight: 1.8, fontSize: 15.5, margin: '10px 0', fontWeight: 300 }}>{line.trim().replace(/\*\*/g, '')}</p>
                    ))}</div>
                  : <RoadmapBody text={sections[s.key]} />}
              </div>
            </section>
          ))}

          {/* Bonus: free strategy call */}
          <section className="rwrap" id="book" style={{ padding: '20px 24px 8px' }}>
            <div style={{ ...card, background: `linear-gradient(168deg,${C.plum},${C.plumDark} 60%,${C.plumDeep})`, color: '#fff', border: 'none', textAlign: 'center', padding: '52px 38px' }}>
              {!booked ? (
                <>
                  <span style={{ ...eyebrow, color: C.gold }}>Included Bonus · Free 1:1</span>
                  <h2 style={{ ...h2, color: '#fff', maxWidth: 660, margin: '0 auto 16px' }}>Want help implementing this? Book your <em style={{ fontStyle: 'italic', color: C.gold }}>free strategy call.</em></h2>
                  <p style={{ fontSize: 16.5, fontWeight: 300, color: 'rgba(255,255,255,.74)', maxWidth: 580, margin: '0 auto 26px', lineHeight: 1.75 }}>
                    As a bonus with your diagnostic, Indrodip will walk through your complete report with you and map the exact moves to solve the one challenge you came here for. Pick a time below.
                  </p>

                  <div style={{ background: '#fff', borderRadius: 14, overflow: 'hidden', maxWidth: 900, margin: '0 auto', boxShadow: '0 20px 50px -30px rgba(0,0,0,.6)' }}>
                    <Cal namespace="60min" calLink="indrodip-ghosh-ut1vxh/60min" style={{ width: '100%', height: '660px', overflow: 'scroll' }} config={{ layout: 'month_view', useSlotsViewOnSmallScreen: 'true', name, email }} />
                  </div>

                  <p style={{ fontSize: 13, color: 'rgba(255,255,255,.5)', marginTop: 16 }}>Free · You&apos;ll review this report with Indrodip personally · You leave with clarity either way</p>

                  <div style={{ maxWidth: 560, margin: '36px auto 0', textAlign: 'left', borderTop: '1px solid rgba(255,255,255,.12)', paddingTop: 28 }}>
                    <span style={{ ...eyebrow, color: C.gold }}>What We&apos;ll Do Together</span>
                    {SESSION_INCLUDES.map((s, i) => (
                      <div key={i} style={{ display: 'flex', gap: 12, marginBottom: 11 }}>
                        <span style={{ color: C.gold, flexShrink: 0, fontWeight: 700 }}>✓</span>
                        <span style={{ fontSize: 15, color: 'rgba(255,255,255,.78)', fontWeight: 300, lineHeight: 1.5 }}>{s}</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (() => {
                const bFirstName = (booking.name || name || '').split(' ')[0]
                const when = booking.start ? new Date(booking.start).toLocaleString([], { weekday: 'long', month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit', timeZoneName: 'short' }) : ''
                const links = booking.start ? buildCalendarLinks(booking.start, booking.meetingUrl) : null
                const calBtn: React.CSSProperties = { display: 'inline-flex', alignItems: 'center', gap: 9, background: 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.22)', color: '#fff', fontSize: 14, fontWeight: 600, padding: '12px 20px', borderRadius: 8, textDecoration: 'none' }
                return (
                  <>
                    <div style={{ width: 68, height: 68, borderRadius: '50%', background: `linear-gradient(180deg,${C.goldSoft},${C.gold} 60%,${C.goldDeep})`, color: C.plumDark, fontSize: 34, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 22px' }}>✓</div>
                    <span style={{ ...eyebrow, color: C.gold }}>You&apos;re booked</span>
                    <h2 style={{ ...h2, color: '#fff', maxWidth: 620, margin: '0 auto 14px' }}>Your session is confirmed{bFirstName ? `, ${bFirstName}` : ''}.</h2>
                    {when && (
                      <div style={{ display: 'inline-block', background: 'rgba(201,168,76,.12)', border: `1px solid ${C.goldLine}`, borderRadius: 12, padding: '16px 26px', margin: '6px auto 22px' }}>
                        <div style={{ fontSize: 11, letterSpacing: '.16em', textTransform: 'uppercase', color: C.gold, fontWeight: 700, marginBottom: 6 }}>Your Session</div>
                        <div style={{ fontSize: 20, fontWeight: 600, color: '#fff', fontFamily: "'Cormorant Garamond',serif" }}>{when}</div>
                      </div>
                    )}
                    <p style={{ fontSize: 15.5, fontWeight: 300, color: 'rgba(255,255,255,.74)', maxWidth: 520, margin: '0 auto 28px', lineHeight: 1.7 }}>
                      A calendar invite{booking.meetingUrl ? ' and your meeting link' : ''} are on their way to your inbox. Add it to your calendar so it never slips:
                    </p>
                    {links && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center', marginBottom: booking.meetingUrl ? 24 : 4 }}>
                        <a href={links.google} target="_blank" rel="noopener noreferrer" style={calBtn}>📅 Google Calendar</a>
                        <a href={links.apple} download="the5th-session.ics" style={calBtn}>🍎 Apple Calendar</a>
                        <a href={links.outlook} target="_blank" rel="noopener noreferrer" style={calBtn}>🪟 Microsoft / Outlook</a>
                      </div>
                    )}
                    {booking.meetingUrl && (
                      <a href={booking.meetingUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', background: `linear-gradient(180deg,${C.goldSoft},${C.gold} 60%,${C.goldDeep})`, color: C.plumDark, fontSize: 16, fontWeight: 700, padding: '16px 40px', borderRadius: 6, textDecoration: 'none', marginTop: 6 }}>Join Link →</a>
                    )}
                  </>
                )
              })()}
            </div>
          </section>
        </>
      )}

      {/* testimonials */}
      <section className="rwrap" style={{ padding: '48px 24px 20px' }}>
        <p style={{ textAlign: 'center', ...eyebrow, color: C.muted, marginBottom: 26 }}>Professionals who took this step</p>
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
