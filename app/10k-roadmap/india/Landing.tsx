'use client'
/* The Business Roadmap Audit — INDIA landing page.
   Redesigned to match the parent /10k-roadmap landing's structure and visual
   language exactly: header → left-aligned 2-col hero (text + founder photo)
   → logo/press strip → dark proof strip → 3-col eligibility → annotated
   growth graph (₹, months instead of $/days) → mid CTA → alternating
   icon+text program-flow rows → real on-camera video testimonials → founder
   section (Indrodip only, no second voice) → plain FAQ list → centered dark
   application section with the qualification form embedded (no /qualify hop)
   → remote-reach line → footer. Reuses the shared UI kit and tracking from
   the parent funnel; only the copy (./config) is India-specific.
   Dropped versus the parent: the dollar-figure case-study list and the
   single-quote testimonial blocks, India has no equivalent verified photo
   + quote proof set, and the reach stat is phrased without a specific count
   for the same reason, everything shown here is real. */
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { LANDING, LEGAL, RATING, PRESS, QUALIFICATION, QUALIFY } from './config'
import { Fonts, Header, Footer, Btn, Reveal, useUtm, QuestionFlow, saveQualAnswers } from '../ui'
import { track } from '../track'
import VideoWall from '@/components/VideoWall'

const MAXW = 1120
const PADX = 'clamp(20px,5vw,22px)'
const SECY = 'clamp(30px,6vw,60px)'
const SECY_LG = 'clamp(30px,8vw,90px)'
const PURPLE = '#5E2E86'
const LINE = 'rgba(46,26,53,0.14)'
const TEXT2 = '#645a6e'
const TEXT3 = '#9a93a2'
const CARD_RADIUS = 28
const CARD_SHADOW = '0 10px 50px -8px rgba(46,26,53,0.14)'
const CARD_PAD = 'clamp(24px,5vw,44px)'
const HRY = 'clamp(28px,6vw,64px)'

function Stars() {
  return <span style={{ display: 'inline-flex', gap: 2 }} aria-hidden>{Array.from({ length: 5 }).map((_, i) => <svg key={i} width="16" height="16" viewBox="0 0 24 24" fill={PURPLE}><path d="M12 2l2.9 6.3 6.9.8-5.1 4.7 1.4 6.8L12 17.8 5.9 20.6l1.4-6.8L2.2 9.1l6.9-.8z" /></svg>)}</span>
}
function RatingRow({ center }: { center?: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: center ? 'center' : 'flex-start', flexWrap: 'wrap' }}>
      <Stars /><span style={{ fontWeight: 800, fontSize: 14.5 }}>{RATING.score}</span>
      <span style={{ color: TEXT2, fontSize: 13 }}>{RATING.text}</span>
    </div>
  )
}
function SectionHead({ eyebrow, heading, sub, maxW, dark, align }: { eyebrow?: string; heading: string; sub?: string; maxW?: number; dark?: boolean; align?: 'left' | 'center' }) {
  const left = align === 'left'
  return (
    <div style={{ textAlign: left ? 'left' : 'center', marginBottom: 28, maxWidth: left ? undefined : (maxW || 680), marginLeft: left ? 0 : 'auto', marginRight: left ? 0 : 'auto' }}>
      {eyebrow && <div className="rm-eyebrow" style={{ marginBottom: 12, color: dark ? '#E4C879' : undefined }}>{eyebrow}</div>}
      <h2 className="rm-serif" style={{ fontSize: 'clamp(22px,4.6vw,42px)', margin: 0, fontWeight: 800, lineHeight: 1.25, color: dark ? '#fff' : undefined }}>{heading}</h2>
      {sub && <p style={{ color: dark ? 'rgba(255,255,255,.65)' : TEXT2, fontSize: 15.5, lineHeight: 1.6, marginTop: 12, maxWidth: left ? 560 : undefined }}>{sub}</p>}
    </div>
  )
}
function Rule() {
  return <div style={{ height: 1, background: '#d9d2dd', margin: `${HRY} 0` }} />
}

/* Growth trajectory over the 12-month plan, in ₹ lakhs/month, annotated with
   what's taught at each phase. The "on your own" line is deliberately
   erratic (a good month, then a dead one), not a smooth ramp, matching the
   feast-or-famine pattern described above it on the page. */
function GrowthChart({ points }: { points: typeof LANDING.graph.points }) {
  const months = [0, 2, 4, 6, 9, 12]
  const values = [0, 0.3, 1.2, 2.4, 3.8, 5.2]
  const valuesAlone = [0, 1.3, 0.4, 1.8, 0.6, 1.2]
  const w = 640, h = 280, padL = 34, padR = 10, padT = 56, padB = 30
  const max = 7
  const x = (i: number) => padL + (i / (months.length - 1)) * (w - padL - padR)
  const y = (v: number) => padT + (1 - v / max) * (h - padT - padB)

  const xs = values.map((_, i) => x(i))
  const ys = values.map((v) => y(v))
  const smoothPath = (ptsX: number[], ptsY: number[]) => {
    let d = `M ${ptsX[0]} ${ptsY[0]}`
    for (let i = 0; i < ptsX.length - 1; i++) {
      const x0 = ptsX[i - 1] ?? ptsX[i], y0 = ptsY[i - 1] ?? ptsY[i]
      const x1 = ptsX[i], y1 = ptsY[i]
      const x2 = ptsX[i + 1], y2 = ptsY[i + 1]
      const x3 = ptsX[i + 2] ?? x2, y3 = ptsY[i + 2] ?? y2
      const c1x = x1 + (x2 - x0) / 6, c1y = y1 + (y2 - y0) / 6
      const c2x = x2 - (x3 - x1) / 6, c2y = y2 - (y3 - y1) / 6
      d += ` C ${c1x} ${c1y}, ${c2x} ${c2y}, ${x2} ${y2}`
    }
    return d
  }
  const line = smoothPath(xs, ys)
  const xsAlone = valuesAlone.map((_, i) => x(i))
  const ysAlone = valuesAlone.map((v) => y(v))
  const lineAlone = smoothPath(xsAlone, ysAlone)
  const area = `${line} L ${x(values.length - 1)} ${h - padB} L ${x(0)} ${h - padB} Z`
  const markerIdx = [1, 3, 5]
  const labelHalfW = (tag: string) => Math.max(36, tag.length * 4.6 + 12)

  const lastV = values[values.length - 1]
  const lastX = x(values.length - 1), lastY = y(lastV)
  const lastVAlone = valuesAlone[valuesAlone.length - 1]
  const lastXAlone = x(valuesAlone.length - 1), lastYAlone = y(lastVAlone)

  const pathRef = useRef<SVGPathElement | null>(null)
  const svgRef = useRef<SVGSVGElement | null>(null)
  const [pathLen, setPathLen] = useState(0)
  const [visible, setVisible] = useState(false)
  useLayoutEffect(() => { if (pathRef.current) setPathLen(pathRef.current.getTotalLength()) }, [line])
  useEffect(() => {
    const el = svgRef.current
    if (!el) return
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { setVisible(true); io.disconnect() } }), { threshold: 0.25 })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <div>
      <div style={{ display: 'flex', gap: 18, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 8, fontSize: 12.5, fontWeight: 700, color: TEXT2 }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 18, height: 3, borderRadius: 2, background: PURPLE, display: 'inline-block' }} aria-hidden />
          Working with us
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 18, borderTop: `2.5px dashed ${TEXT3}`, display: 'inline-block' }} aria-hidden />
          On your own
        </span>
      </div>
    <svg ref={svgRef} viewBox={`0 0 ${w} ${h}`} width="100%" style={{ height: 'auto', display: 'block' }} role="img" aria-label="Realistic income trajectory over 12 months, compared to going it alone: working with us, flat for the first couple of months while positioning and the offer are rebuilt, then compounding client growth that climbs toward ₹5 lakh/month; on your own, an erratic up-and-down income with no steady system. Annotated with what's taught at each phase">
      <line x1={padL} y1={y(2.5)} x2={w - padR} y2={y(2.5)} stroke="#EDE7F0" strokeWidth={1} />
      <text x={padL - 8} y={y(2.5) + 4} textAnchor="end" fontSize="10.5" fill={TEXT3}>₹2.5L</text>
      <text x={padL - 8} y={h - padB + 4} textAnchor="end" fontSize="10.5" fill={TEXT3}>₹0</text>
      <line x1={padL} y1={y(5)} x2={w - padR} y2={y(5)} stroke="#E4C879" strokeWidth={1.5} strokeDasharray="4 5" />
      <text x={padL} y={y(5) - 8} textAnchor="start" fontSize="12" fontWeight={700} fill="#B9962F">₹5L target</text>
      <defs>
        <linearGradient id="gchart-in" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={PURPLE} stopOpacity="0.22" />
          <stop offset="100%" stopColor={PURPLE} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#gchart-in)" style={{ opacity: visible ? 1 : 0, transition: 'opacity 1.4s ease .3s' }} />
      <path
        d={lineAlone}
        fill="none"
        stroke={TEXT3}
        strokeWidth={2.25}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="5 5"
        style={{ opacity: visible ? 0.8 : 0, transition: 'opacity 1s ease 2.1s' }}
      />
      <circle cx={lastXAlone} cy={lastYAlone} r={4} fill={TEXT3} style={{ opacity: visible ? 0.9 : 0, transition: 'opacity .5s ease 2.3s' }} />
      <text x={lastXAlone - 10} y={lastYAlone - 10} textAnchor="end" fontSize="12" fontWeight={800} fill={TEXT3} style={{ opacity: visible ? 1 : 0, transition: 'opacity .5s ease 2.4s' }}>₹{lastVAlone.toFixed(1)}L alone</text>
      <path
        ref={pathRef}
        d={line}
        fill="none"
        stroke={PURPLE}
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{
          strokeDasharray: pathLen || 1,
          strokeDashoffset: visible ? 0 : pathLen || 1,
          transition: pathLen ? 'stroke-dashoffset 1.8s cubic-bezier(.3,.7,.2,1)' : 'none',
        }}
      />
      {visible && pathLen > 0 && (
        <circle r={4} fill="#E4C879" stroke="#fff" strokeWidth={1}>
          <animateMotion dur="3.2s" begin="1.8s" repeatCount="indefinite" path={line} />
        </circle>
      )}
      {values.map((v, i) => (
        <circle
          key={i}
          cx={x(i)}
          cy={y(v)}
          r={i === values.length - 1 ? 5 : 3.5}
          fill={i === values.length - 1 ? '#E4C879' : PURPLE}
          style={{ opacity: visible ? 1 : 0, transition: `opacity .4s ease ${0.3 + i * 0.28}s` }}
        />
      ))}
      {visible && (
        <circle cx={lastX} cy={lastY} r={5} fill="none" stroke="#E4C879" strokeWidth={2}>
          <animate attributeName="r" values="5;11;5" dur="1.8s" begin="2.1s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.9;0;0.9" dur="1.8s" begin="2.1s" repeatCount="indefinite" />
        </circle>
      )}
      <text x={lastX - 10} y={lastY - 12} textAnchor="end" fontSize="13" fontWeight={800} fill="#2E1A35" style={{ opacity: visible ? 1 : 0, transition: 'opacity .5s ease 1.9s' }}>₹{lastV.toFixed(1)}L</text>
      {months.map((m, i) => <text key={m} x={x(i)} y={h - 8} textAnchor={i === 0 ? 'start' : i === months.length - 1 ? 'end' : 'middle'} fontSize="12" fill={TEXT3}>Month {m}</text>)}
      {markerIdx.map((idx, i) => {
        const p = points[i]
        if (!p) return null
        const cx = x(idx), cy = y(values[idx])
        const hw = labelHalfW(p.tag)
        const boxCx = Math.min(Math.max(cx, padL + hw), w - padR - hw)
        const ly = padT - 18
        return (
          <g key={p.tag} style={{ opacity: visible ? 1 : 0, transition: `opacity .5s ease ${0.5 + i * 0.3}s` }}>
            <line x1={cx} y1={cy - 6} x2={boxCx} y2={ly + 13} stroke={LINE} strokeWidth={1} />
            <rect x={boxCx - hw} y={ly - 13} width={hw * 2} height={20} rx={10} fill="#fff" stroke={PURPLE} strokeWidth={1.3} />
            <text x={boxCx} y={ly + 1} textAnchor="middle" fontSize="11" fontWeight={800} fill={PURPLE}>{p.tag}</text>
          </g>
        )
      })}
    </svg>
    </div>
  )
}

function StepIcon({ kind }: { kind: string }) {
  const c = { fill: 'none', stroke: PURPLE, strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }
  const box = { width: 56, height: 56, viewBox: '0 0 56 56' }
  if (kind === 'search') return <svg {...box}><circle cx={24} cy={24} r={13} {...c} /><line x1={33.5} y1={33.5} x2={46} y2={46} {...c} /></svg>
  if (kind === 'tag') return <svg {...box}><rect x={14} y={14} width={28} height={28} rx={6} transform="rotate(45 28 28)" {...c} /><circle cx={28} cy={18} r={2} fill={PURPLE} stroke="none" /></svg>
  if (kind === 'target') return <svg {...box}><circle cx={28} cy={28} r={18} {...c} /><circle cx={28} cy={28} r={10} {...c} /><circle cx={28} cy={28} r={3} fill={PURPLE} stroke="none" /></svg>
  if (kind === 'compass') return <svg {...box}><circle cx={28} cy={28} r={18} {...c} /><polygon points="28,16 32,28 28,40 24,28" fill={PURPLE} stroke="none" /></svg>
  return <svg {...box}><rect x={10} y={14} width={36} height={30} rx={5} {...c} /><line x1={10} y1={24} x2={46} y2={24} {...c} /><line x1={19} y1={9} x2={19} y2={18} {...c} /><line x1={37} y1={9} x2={37} y2={18} {...c} /><polyline points="19,34 25,40 38,27" {...c} /></svg>
}

function PressStrip() {
  return (
    <div style={{ padding: '22px ' + PADX + ' 0' }}>
      <div style={{ maxWidth: MAXW, margin: '0 auto', display: 'flex', gap: 'clamp(16px,4vw,40px)', justifyContent: 'center', flexWrap: 'wrap', alignItems: 'center' }}>
        {PRESS.items.map((p) => <span key={p} style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontWeight: 700, fontSize: 'clamp(13px,2vw,16px)', color: TEXT2, opacity: 0.6, whiteSpace: 'nowrap' }}>{p}</span>)}
      </div>
    </div>
  )
}

export default function Landing() {
  const router = useRouter()
  const [showSticky, setShowSticky] = useState(false)
  useUtm()
  useEffect(() => { track('page_view'); track('qualification_started') }, [])
  useEffect(() => { const on = () => setShowSticky(window.scrollY > 620); on(); window.addEventListener('scroll', on, { passive: true }); return () => window.removeEventListener('scroll', on) }, [])
  const goApply = (where: string) => {
    track('cta_click', { where })
    document.getElementById('apply')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
  const CTA = (where: string, label?: string) => <Btn onClick={() => goApply(where)} style={{ padding: '16px 34px', fontSize: 17 }}>{label || LANDING.ctaPrimary} <span aria-hidden>→</span></Btn>

  return (
    <div style={{ background: '#ffffff', color: '#2E1A35', fontFamily: "'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif", overflowX: 'hidden' }}>
      <Fonts />
      <Header nav={LANDING.nav} showFounder />

      {/* ── Hero: left-aligned 2-col, text + founder photo ── */}
      <div style={{ background: 'radial-gradient(110% 60% at 15% -6%, #FBF6EF 0%, #ffffff 62%)' }}>
        <section style={{ maxWidth: MAXW, margin: '0 auto', padding: 'clamp(30px,6vw,56px) ' + PADX + ' 20px', display: 'flex', gap: 'clamp(24px,5vw,56px)', alignItems: 'center', flexWrap: 'wrap' }} className="rm-hero">
          <div style={{ flex: '1 1 440px', minWidth: 300 }}>
            <Reveal>
              <div className="rm-eyebrow" style={{ marginBottom: 14 }}>{LANDING.eyebrow}</div>
              <h1 className="rm-serif" style={{ fontSize: 'clamp(32px,5.6vw,54px)', margin: 0, fontWeight: 800, lineHeight: 1.04 }}>{LANDING.headline}</h1>
              <p style={{ color: TEXT2, fontSize: 'clamp(15.5px,1.8vw,18px)', lineHeight: 1.55, maxWidth: 520, margin: '16px 0 0', fontWeight: 500 }}>{LANDING.headlineSub}</p>
            </Reveal>
            <Reveal delay={100} style={{ marginTop: 24 }}>
              <div className="rm-hero-ctas" style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                {CTA('hero')}
                <Btn onClick={() => { track('cta_click', { where: 'hero_secondary' }); document.getElementById(LANDING.ctaSecondary.href.slice(1))?.scrollIntoView({ behavior: 'smooth', block: 'start' }) }} variant="outline" style={{ padding: '16px 28px', fontSize: 16 }}>{LANDING.ctaSecondary.label}</Btn>
              </div>
              <p style={{ color: TEXT3, fontSize: 12.5, marginTop: 14 }}>{LANDING.ctaMicro}</p>
              <p className="rm-hero-guarantee" style={{ color: PURPLE, fontSize: 13, fontWeight: 800, marginTop: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={PURPLE} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" aria-hidden><circle cx="12" cy="12" r="10" /><path d="M8 12l3 3 5-6" /></svg>
                {LANDING.guarantee}
              </p>
              <div className="rm-hero-rating" style={{ marginTop: 16 }}><RatingRow /></div>
            </Reveal>
          </div>
          <Reveal delay={150} style={{ flex: '1 1 300px', minWidth: 260, maxWidth: 360, margin: '0 auto', position: 'relative' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/founder.png" alt="Indrodip Ghosh, Founder of The5th Global Consulting" style={{ width: '100%', aspectRatio: '4/5', objectFit: 'cover', objectPosition: 'top', borderRadius: 24, boxShadow: '0 30px 60px -24px rgba(46,26,53,.45)' }} />
          </Reveal>
        </section>
      </div>

      <PressStrip />

      {/* ── Proof strip ── */}
      <section id="proof" style={{ background: '#2E1A35', color: '#fff', padding: 'clamp(28px,4.5vw,40px) ' + PADX, marginTop: SECY_LG }}>
        <div style={{ maxWidth: MAXW, margin: '0 auto', textAlign: 'center' }}>
          <Reveal>
            <div className="rm-eyebrow" style={{ marginBottom: 10, color: '#E4C879' }}>{LANDING.results.heading}</div>
            <h2 className="rm-serif" style={{ fontSize: 'clamp(20px,3.2vw,28px)', margin: '0 0 20px', fontWeight: 800, color: '#fff' }}>{LANDING.results.sub}</h2>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
              {LANDING.results.stats.map((st) => (
                <div key={st} style={{ background: 'rgba(255,255,255,.08)', border: '1px solid rgba(201,168,76,.4)', borderRadius: 12, padding: '12px 18px' }}>
                  <span className="rm-serif" style={{ fontSize: 'clamp(15px,2vw,19px)', fontWeight: 800, color: '#E4C879' }}>{st}</span>
                </div>
              ))}
            </div>
            <p style={{ color: 'rgba(255,255,255,.72)', fontSize: 13.5, lineHeight: 1.6, maxWidth: 560, margin: '16px auto 0' }}>{LANDING.results.principle}</p>
            <p style={{ color: 'rgba(255,255,255,.4)', fontSize: 11.5, marginTop: 14 }}>{LANDING.results.disclaimer}</p>
          </Reveal>
        </div>
      </section>

      {/* ── Eligibility: "Who's this for?" 3-col cards ── */}
      <section style={{ padding: SECY + ' ' + PADX }}>
        <div style={{ maxWidth: MAXW, margin: '0 auto' }}>
          <Reveal><SectionHead eyebrow={LANDING.eligibility.eyebrow} heading={LANDING.eligibility.heading} maxW={720} /></Reveal>
          <Reveal>
            <div className="rm-grid3" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 'clamp(14px,2.5vw,24px)' }}>
              {LANDING.eligibility.cols.map((c) => (
                <div key={c.label} style={{ background: '#fff', borderRadius: CARD_RADIUS, boxShadow: CARD_SHADOW, padding: CARD_PAD }}>
                  <h3 style={{ fontSize: 13, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.04em', color: PURPLE, margin: '0 0 10px' }}>{c.label}</h3>
                  <p style={{ color: TEXT2, fontSize: 14.5, lineHeight: 1.6, margin: 0 }}>{c.body}</p>
                </div>
              ))}
            </div>
          </Reveal>
          <Reveal>
            <p style={{ textAlign: 'center', color: TEXT3, fontSize: 13.5, lineHeight: 1.6, maxWidth: 620, margin: '20px auto 0' }}>{LANDING.eligibility.not}</p>
          </Reveal>
        </div>
      </section>

      {/* ── The path: annotated growth graph ── */}
      <section id="path" style={{ background: '#FAF6F0', borderTop: `1px solid ${LINE}`, borderBottom: `1px solid ${LINE}`, padding: SECY + ' ' + PADX }}>
        <div style={{ maxWidth: MAXW, margin: '0 auto' }}>
          <Reveal><SectionHead eyebrow={LANDING.graph.eyebrow} heading={LANDING.graph.heading} sub={LANDING.graph.sub} maxW={640} /></Reveal>
          <Reveal>
            <div style={{ background: '#fff', borderRadius: CARD_RADIUS, boxShadow: CARD_SHADOW, padding: 'clamp(16px,3.5vw,32px)', marginBottom: 24 }}>
              <GrowthChart points={LANDING.graph.points} />
              <p style={{ color: TEXT3, fontSize: 11.5, textAlign: 'center', marginTop: 6 }}>{LANDING.graph.axisNote}</p>
              <p style={{ color: PURPLE, fontSize: 14, fontWeight: 800, textAlign: 'center', marginTop: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={PURPLE} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" aria-hidden><circle cx="12" cy="12" r="10" /><path d="M8 12l3 3 5-6" /></svg>
                Didn’t hit it? Take your investment back, 100% guaranteed.
              </p>
            </div>
          </Reveal>
          <Reveal>
            <div className="rm-grid3" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: 'clamp(14px,2.5vw,24px)' }}>
              {LANDING.graph.points.map((p, i) => (
                <div key={p.t} style={{ background: '#fff', borderRadius: CARD_RADIUS, boxShadow: CARD_SHADOW, padding: CARD_PAD }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                    <span style={{ width: 30, height: 30, borderRadius: 9, background: 'linear-gradient(180deg,#6b39a0,#552879)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 13, flexShrink: 0 }}>{i + 1}</span>
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: TEXT3, textTransform: 'uppercase', letterSpacing: '.04em' }}>{p.m}</div>
                      <h3 style={{ fontSize: 16, fontWeight: 800, margin: 0 }}>{p.t}</h3>
                    </div>
                  </div>
                  <p style={{ color: PURPLE, fontSize: 13, fontWeight: 700, margin: '4px 0 8px', lineHeight: 1.45 }}>{p.learn}</p>
                  <p style={{ color: TEXT2, fontSize: 14, lineHeight: 1.55, margin: 0 }}>{p.d}</p>
                </div>
              ))}
            </div>
          </Reveal>
          <Reveal>
            <div style={{ textAlign: 'center', marginTop: 32 }}>
              <p style={{ fontWeight: 700, fontSize: 16, marginBottom: 16 }}>Take the first step toward your ₹5L/month plan.</p>
              {CTA('path_cta')}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── On the call: alternating icon+text program-flow rows ── */}
      <section id="call" style={{ padding: SECY + ' ' + PADX }}>
        <div style={{ maxWidth: MAXW, margin: '0 auto' }}>
          <Reveal><SectionHead eyebrow={LANDING.call.eyebrow} heading={LANDING.call.heading} sub={LANDING.call.sub} maxW={640} /></Reveal>
          <div style={{ display: 'grid', gap: 'clamp(28px,4vw,40px)', marginTop: 12 }}>
            {LANDING.call.steps.map((s, i) => {
              const iconRight = i % 2 === 1
              return (
                <Reveal key={s.n}>
                  <div style={{ display: 'flex', gap: 'clamp(20px,4vw,40px)', alignItems: 'center', flexWrap: 'wrap', justifyContent: iconRight ? 'flex-end' : 'flex-start' }} className="rm-call-row">
                    <div style={{ order: iconRight ? 1 : 0, flexShrink: 0, width: 96, height: 96, borderRadius: 20, background: '#FAF6F0', border: `1px solid ${LINE}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <StepIcon kind={s.icon} />
                    </div>
                    <div style={{ flex: '0 1 420px', minWidth: 260, textAlign: iconRight ? 'right' : 'left' }}>
                      <div style={{ fontSize: 12, fontWeight: 800, color: TEXT3, letterSpacing: '.06em', marginBottom: 6 }}>STEP {s.n}</div>
                      <h3 style={{ fontSize: 19, fontWeight: 800, margin: '0 0 8px' }}>{s.t}</h3>
                      <p style={{ color: TEXT2, fontSize: 15, lineHeight: 1.6, margin: 0, maxWidth: 520, marginLeft: iconRight ? 'auto' : 0, marginRight: iconRight ? 0 : 'auto' }}>{s.d}</p>
                    </div>
                  </div>
                </Reveal>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── Video testimonials: real on-camera client reviews, same VideoWall
             used on the parent funnel and /results ── */}
      <section style={{ background: '#FAF6F0', borderTop: `1px solid ${LINE}`, borderBottom: `1px solid ${LINE}`, padding: SECY + ' ' + PADX }}>
        <div style={{ maxWidth: MAXW, margin: '0 auto' }}>
          <Reveal><SectionHead eyebrow="On-Camera · Client Reviews" heading="Hear it from them directly." sub="Unscripted reactions from clients. Tap any clip to play." maxW={620} /></Reveal>
          <Reveal><VideoWall columns={3} limit={6} /></Reveal>
        </div>
      </section>

      {/* ── Founder: dark section ── */}
      <section style={{ background: '#2E1A35', color: '#fff', padding: SECY + ' ' + PADX }}>
        <div style={{ maxWidth: 820, margin: '0 auto' }}>
          <Reveal><SectionHead eyebrow={LANDING.founder.eyebrow} heading={LANDING.founder.heading} dark maxW={640} /></Reveal>
          <Reveal>
            <div style={{ background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.14)', borderRadius: 20, padding: 'clamp(22px,4vw,34px)', display: 'flex', gap: 24, alignItems: 'flex-start', flexWrap: 'wrap' }} className="rm-founder-row">
              <div style={{ flexShrink: 0, textAlign: 'center', width: 140, margin: '0 auto' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/images/founder.png" alt={LANDING.founder.name} style={{ width: 120, height: 120, borderRadius: '50%', objectFit: 'cover', border: '3px solid rgba(255,255,255,.2)' }} />
              </div>
              <div style={{ flex: 1, minWidth: 260 }}>
                <blockquote style={{ margin: '0 0 14px', paddingLeft: 16, borderLeft: '3px solid #E4C879', color: '#fff', fontSize: 16.5, lineHeight: 1.55, fontStyle: 'italic' }}>&ldquo;{LANDING.founder.quote}&rdquo;</blockquote>
                <p style={{ color: 'rgba(255,255,255,.7)', fontSize: 14.5, lineHeight: 1.65, margin: '0 0 14px' }}>{LANDING.founder.body}</p>
                <div style={{ fontWeight: 800, fontSize: 14.5 }}>{LANDING.founder.name}</div>
                <div style={{ color: 'rgba(255,255,255,.5)', fontSize: 12.5 }}>{LANDING.founder.role}</div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── FAQ: plain stacked list ── */}
      <section id="faq" style={{ padding: SECY + ' ' + PADX }}>
        <div style={{ maxWidth: 740, margin: '0 auto' }}>
          <Reveal>
            <div style={{ marginBottom: 8 }}>
              <div className="rm-eyebrow" style={{ marginBottom: 10 }}>{LANDING.faq.eyebrow}</div>
              <h2 className="rm-serif" style={{ fontSize: 'clamp(24px,4vw,34px)', margin: 0, fontWeight: 800 }}>{LANDING.faq.heading}</h2>
            </div>
            <Rule />
          </Reveal>
          {LANDING.faq.items.map((it, i) => (
            <Reveal key={it.q}>
              <div style={{ paddingBottom: 20, marginBottom: i < LANDING.faq.items.length - 1 ? 20 : 0, borderBottom: i < LANDING.faq.items.length - 1 ? `1px solid ${LINE}` : 'none' }}>
                <h3 style={{ fontSize: 16.5, fontWeight: 800, margin: '0 0 8px', color: '#2E1A35' }}>{it.q}</h3>
                <p style={{ color: TEXT2, fontSize: 14.5, lineHeight: 1.65, margin: 0, maxWidth: 620 }}>{it.a}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── Apply: centered header + form, footer directly below ── */}
      <section id="apply" style={{ background: '#2E1A35', padding: SECY + ' ' + PADX }}>
        <div style={{ maxWidth: MAXW, margin: '0 auto', textAlign: 'center' }}>
          <Reveal>
            <div style={{ marginBottom: 28, maxWidth: 560, margin: '0 auto 28px' }}>
              <div className="rm-eyebrow" style={{ marginBottom: 12, color: '#E4C879' }}>{LANDING.apply.eyebrow}</div>
              <h2 className="rm-serif" style={{ fontSize: 'clamp(24px,4vw,36px)', margin: 0, fontWeight: 800, color: '#fff', lineHeight: 1.1 }}>{LANDING.apply.heading}</h2>
            </div>
          </Reveal>
          <Reveal>
            <div style={{ maxWidth: 680, margin: '0 auto', background: '#fff', borderRadius: 20, padding: 'clamp(20px,4vw,32px)', boxShadow: '0 30px 70px -30px rgba(0,0,0,.5)', textAlign: 'left' }}>
              <QuestionFlow
                questions={QUALIFICATION}
                eyebrow={QUALIFY.eyebrow}
                onReject={(reason, answers) => {
                  saveQualAnswers(answers)
                  const q = QUALIFICATION.find((x) => 'options' in x && x.options.some((o) => o.reject && o.value === reason))
                  const bucket = q?.id === 'business_type' ? 'no_business' : q?.id === 'income' ? 'income' : q?.id === 'readiness' ? 'free_advice' : 'default'
                  track('qualification_completed'); track('qualification_rejected', { reason: bucket })
                  router.push(`/10k-roadmap/india/not-a-fit?r=${bucket}`)
                }}
                onComplete={(answers) => {
                  saveQualAnswers(answers)
                  track('qualification_completed'); track('qualification_accepted')
                  router.push('/10k-roadmap/india/schedule')
                }}
              />
            </div>
            <p style={{ color: 'rgba(255,255,255,.55)', fontSize: 12.5, marginTop: 20, maxWidth: 680, margin: '20px auto 0' }}>{LANDING.apply.micro}</p>
            <p style={{ color: '#E4C879', fontSize: 13, fontWeight: 800, marginTop: 10, maxWidth: 680, marginLeft: 'auto', marginRight: 'auto' }}>{LANDING.guarantee}</p>
          </Reveal>
        </div>
      </section>

      {/* ── Reach ── */}
      <section style={{ padding: '26px ' + PADX, textAlign: 'center' }}>
        <p style={{ color: TEXT2, fontSize: 13.5, margin: 0 }}>
          <span style={{ fontWeight: 800, color: '#2E1A35' }}>{LANDING.reach.stat}</span> {LANDING.reach.body}
        </p>
      </section>

      <Footer legal={LEGAL} />

      {/* Sticky mobile CTA */}
      <div className="rm-sticky-cta" style={{ position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 60, padding: '10px 14px calc(10px + env(safe-area-inset-bottom))', background: 'rgba(255,255,255,.92)', backdropFilter: 'saturate(140%) blur(12px)', borderTop: `1px solid ${LINE}`, transform: showSticky ? 'translateY(0)' : 'translateY(120%)', transition: 'transform .3s cubic-bezier(.2,.7,.2,1)', boxShadow: '0 -8px 30px -20px rgba(46,26,53,.5)' }}>
        <button onClick={() => goApply('sticky')} className="rm-focus" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', gap: 4, background: 'linear-gradient(180deg,#6b39a0,#552879)', color: '#fff', border: 'none', borderRadius: 999, padding: '15px 20px', fontSize: 16, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>{LANDING.ctaPrimary} <span aria-hidden>→</span></button>
      </div>

      <style>{`
        .rm-sticky-cta{display:none}
        @media(max-width:768px){.rm-sticky-cta{display:block}footer{padding-bottom:100px!important}}
        @media(max-width:900px){.rm-hero{flex-direction:column;text-align:center}.rm-hero > div:first-child{text-align:center}.rm-hero p{margin-left:auto;margin-right:auto}.rm-hero-ctas,.rm-hero-guarantee,.rm-hero-rating>div{justify-content:center!important}}
        @media(min-width:561px) and (max-width:899px){.rm-grid3{grid-template-columns:1fr!important}}
        @media(max-width:560px){.rm-grid3{grid-template-columns:1fr!important}.rm-founder-row{flex-direction:column;align-items:center!important;text-align:center}.rm-call-row{flex-direction:column!important;justify-content:center!important;text-align:center!important}.rm-call-row>div{order:0!important;flex:none!important;width:100%!important;min-width:0!important;text-align:center!important;margin-left:0!important;margin-right:0!important}}
      `}</style>
    </div>
  )
}
