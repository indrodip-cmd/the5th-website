import React from 'react'
import { C } from './ui'

/* Hand-built, dependency-free SVG figures for Research articles, charts and
   diagrams in the brand palette (plum / gold / cream). Server components. Each
   figure is responsive (width 100%, height from viewBox) and wrapped with a
   numbered caption. */

const F = {
  plum: '#2E1A35', plum2: '#3D2645', purple: '#5E2E86', purpleSoft: 'rgba(94,46,134,.12)',
  gold: '#C9A84C', goldDeep: '#B0902F', cream: '#FAF6F0', line: '#E2DCD2',
  ink: '#4a4038', muted: '#8A8075', white: '#fff',
}
const SANS = "'Public Sans', system-ui, sans-serif"
const SERIF = "Georgia, 'Times New Roman', serif"

export function Figure({ n, caption, children }: { n: number | string; caption: React.ReactNode; children: React.ReactNode }) {
  return (
    <figure style={{ margin: '30px 0 28px', border: `1px solid ${C.border}`, borderRadius: 14, overflow: 'hidden', background: F.white }}>
      <div style={{ padding: 'clamp(16px,3vw,26px)' }}>{children}</div>
      <figcaption style={{ borderTop: `1px solid ${C.border}`, background: C.cream, padding: '12px 18px', fontSize: 13.5, color: C.inkSoft, lineHeight: 1.55 }}>
        <strong style={{ color: C.plumDark }}>Figure {n}.</strong> {caption}
      </figcaption>
    </figure>
  )
}
const svgStyle: React.CSSProperties = { width: '100%', height: 'auto', display: 'block' }
const arrow = (id: string, color: string) => (
  <marker id={id} markerWidth="10" markerHeight="10" refX="7" refY="3" orient="auto" markerUnits="strokeWidth">
    <path d="M0,0 L7,3 L0,6 Z" fill={color} />
  </marker>
)

/* ── Consumer-behaviour report ─────────────────────────────────────────────*/

// Fig: prospect-theory value function (loss aversion)
export function FigProspect() {
  const pts: string[] = []
  const mirror: string[] = []
  for (let x = -100; x <= 100; x += 2) {
    const v = x >= 0 ? Math.pow(x, 0.88) : -2.25 * Math.pow(-x, 0.88)
    pts.push(`${(300 + x * 2.4).toFixed(1)},${(170 - v * 1.05).toFixed(1)}`)
    // mirror of the gain curve into the loss quadrant (dashed) to show asymmetry
    if (x <= 0) { const g = Math.pow(-x, 0.88); mirror.push(`${(300 + x * 2.4).toFixed(1)},${(170 + g * 1.05).toFixed(1)}`) }
  }
  return (
    <Figure n={1} caption={<>The prospect-theory value function (Kahneman &amp; Tversky, 1979). Value is measured from a reference point; the curve is markedly steeper for losses than for gains (λ ≈ 2.25). The dashed line mirrors the gain curve to make the loss asymmetry visible, a loss of a given size hurts about twice as much as the same-size gain pleases.</>}>
      <svg viewBox="0 0 600 340" style={svgStyle} role="img" aria-label="Prospect theory value function">
        <line x1="60" y1="170" x2="560" y2="170" stroke={F.line} strokeWidth="1.5" />
        <line x1="300" y1="30" x2="300" y2="320" stroke={F.line} strokeWidth="1.5" />
        <text x="548" y="188" fontFamily={SANS} fontSize="12" fill={F.muted} textAnchor="end">outcome</text>
        <text x="310" y="42" fontFamily={SANS} fontSize="12" fill={F.muted}>subjective value</text>
        <text x="430" y="160" fontFamily={SANS} fontSize="12" fill={F.muted}>gains →</text>
        <text x="90" y="160" fontFamily={SANS} fontSize="12" fill={F.muted}>← losses</text>
        <circle cx="300" cy="170" r="3.5" fill={F.gold} />
        <text x="306" y="163" fontFamily={SANS} fontSize="11.5" fill={F.goldDeep}>reference point</text>
        <polyline points={mirror.join(' ')} fill="none" stroke={F.muted} strokeWidth="1.5" strokeDasharray="5 5" opacity="0.6" />
        <polyline points={pts.join(' ')} fill="none" stroke={F.purple} strokeWidth="3" strokeLinejoin="round" />
        <text x="470" y="250" fontFamily={SANS} fontSize="12" fill={F.muted}>symmetric gain (for reference)</text>
      </svg>
    </Figure>
  )
}

// Fig: search / experience / credence spectrum
export function FigCredence() {
  const seg = [
    { x: 40, w: 173, label: 'Search', sub: 'judged before buying', c: '#7d5fa0' },
    { x: 213, w: 173, label: 'Experience', sub: 'judged after using', c: '#5E2E86' },
    { x: 386, w: 174, label: 'Credence', sub: 'hard to judge even after', c: F.plum },
  ]
  return (
    <Figure n={2} caption={<>The evaluability spectrum (Nelson, 1970; Darby &amp; Karni, 1973). Expert services sit at the far end: their core value is a <em>credence</em> quality, difficult to verify even after consumption, which is why buyers fall back on proxies for quality rather than the quality itself.</>}>
      <svg viewBox="0 0 600 190" style={svgStyle} role="img" aria-label="Search, experience, credence goods spectrum">
        {seg.map((s) => (
          <g key={s.label}>
            <rect x={s.x} y="46" width={s.w - 6} height="78" rx="10" fill={s.c} />
            <text x={s.x + (s.w - 6) / 2} y="82" fontFamily={SERIF} fontSize="19" fill="#fff" textAnchor="middle" fontWeight="700">{s.label}</text>
            <text x={s.x + (s.w - 6) / 2} y="104" fontFamily={SANS} fontSize="12" fill="rgba(255,255,255,.8)" textAnchor="middle">{s.sub}</text>
          </g>
        ))}
        <defs>{arrow('a2', F.goldDeep)}</defs>
        <line x1="40" y1="150" x2="556" y2="150" stroke={F.goldDeep} strokeWidth="2" markerEnd="url(#a2)" />
        <text x="40" y="170" fontFamily={SANS} fontSize="12.5" fill={F.goldDeep}>easier to evaluate</text>
        <text x="556" y="170" fontFamily={SANS} fontSize="12.5" fill={F.goldDeep} textAnchor="end" fontWeight="700">harder to evaluate, where coaching/consulting lives</text>
        <text x="300" y="30" fontFamily={SANS} fontSize="13" fill={F.muted} textAnchor="middle">Uncertainty about quality</text>
      </svg>
    </Figure>
  )
}

// Fig: tripartite trust model
export function FigTrust() {
  const box = (x: number, t: string, s: string) => (
    <g>
      <rect x={x} y="34" width="150" height="66" rx="12" fill={F.purpleSoft} stroke={F.purple} strokeWidth="1.2" />
      <text x={x + 75} y="64" fontFamily={SERIF} fontSize="17" fill={F.plum} textAnchor="middle" fontWeight="700">{t}</text>
      <text x={x + 75} y="84" fontFamily={SANS} fontSize="11.5" fill={F.ink} textAnchor="middle">{s}</text>
    </g>
  )
  return (
    <Figure n={3} caption={<>The tripartite model of trustworthiness (Mayer, Davis &amp; Schoorman, 1995). Perceived ability, benevolence, and integrity combine into trust, which licenses risk-taking only when it exceeds the risk the situation demands, the pivot of the whole purchase.</>}>
      <svg viewBox="0 0 600 250" style={svgStyle} role="img" aria-label="Ability, benevolence, integrity to trust to action">
        <defs>{arrow('a3', F.purple)}{arrow('a3g', F.goldDeep)}</defs>
        {box(30, 'Ability', 'competence')}
        {box(225, 'Benevolence', 'wants my good')}
        {box(420, 'Integrity', 'sound principles')}
        {[105, 300, 495].map((x) => <line key={x} x1={x} y1="100" x2="300" y2="150" stroke={F.purple} strokeWidth="1.6" markerEnd="url(#a3)" />)}
        <rect x="210" y="150" width="180" height="52" rx="26" fill={F.plum} />
        <text x="300" y="182" fontFamily={SERIF} fontSize="20" fill="#fff" textAnchor="middle" fontWeight="700">Trust</text>
        <line x1="390" y1="176" x2="520" y2="176" stroke={F.goldDeep} strokeWidth="2" markerEnd="url(#a3g)" />
        <text x="455" y="166" fontFamily={SANS} fontSize="11.5" fill={F.goldDeep} textAnchor="middle">if trust &gt; risk</text>
        <text x="520" y="181" fontFamily={SANS} fontSize="13" fill={F.plum} fontWeight="700">Act</text>
      </svg>
    </Figure>
  )
}

// Fig: five-stage integrated model (funnel)
export function FigFunnel() {
  const stages = [
    'Problem recognition', 'Affective read of provider', 'Proxy evaluation (credence)', 'Risk resolution', 'Commitment & justification',
  ]
  return (
    <Figure n={4} caption={<>The integrated five-stage model synthesized in §4. The buyer converts uncertainty into trust and trust into justified action; loss aversion and status-quo bias resist throughout, so de-risking and trust-building are the dominant levers.</>}>
      <svg viewBox="0 0 600 300" style={svgStyle} role="img" aria-label="Five stage purchase model">
        <defs>{arrow('a4', F.gold)}</defs>
        {stages.map((s, i) => {
          const y = 20 + i * 54
          const inset = i * 34
          return (
            <g key={s}>
              <rect x={40 + inset} y={y} width={520 - inset * 2} height="42" rx="8" fill={i === 3 ? F.purple : F.plum2} opacity={0.7 + i * 0.06} />
              <text x="300" y={y + 26} fontFamily={SANS} fontSize="14.5" fill="#fff" textAnchor="middle" fontWeight={i === 3 ? 700 : 600}>{i + 1}. {s}</text>
              {i < stages.length - 1 && <line x1="300" y1={y + 42} x2="300" y2={y + 54} stroke={F.gold} strokeWidth="2" markerEnd="url(#a4)" />}
            </g>
          )
        })}
        <text x="300" y="296" fontFamily={SANS} fontSize="12" fill={F.muted} textAnchor="middle">uncertainty  →  trust  →  committed decision</text>
      </svg>
    </Figure>
  )
}

/* ── Machine consciousness ─────────────────────────────────────────────────*/

// Fig: access vs phenomenal (Venn)
export function FigAccessPhenomenal() {
  return (
    <Figure n={1} caption={<>Two senses of “consciousness” (Block). Access consciousness is information globally available for report and control; phenomenal consciousness is felt experience. Ordinary human awareness lives in the overlap, and the open question is whether a machine could occupy the left circle without the right.</>}>
      <svg viewBox="0 0 600 260" style={svgStyle} role="img" aria-label="Access versus phenomenal consciousness">
        <circle cx="240" cy="130" r="110" fill={F.purpleSoft} stroke={F.purple} strokeWidth="1.6" />
        <circle cx="360" cy="130" r="110" fill="rgba(201,168,76,.14)" stroke={F.goldDeep} strokeWidth="1.6" />
        <text x="165" y="90" fontFamily={SERIF} fontSize="18" fill={F.plum} textAnchor="middle" fontWeight="700">Access</text>
        <text x="165" y="112" fontFamily={SANS} fontSize="11.5" fill={F.ink} textAnchor="middle">reportable,</text>
        <text x="165" y="128" fontFamily={SANS} fontSize="11.5" fill={F.ink} textAnchor="middle">usable, global</text>
        <text x="435" y="90" fontFamily={SERIF} fontSize="18" fill={F.goldDeep} textAnchor="middle" fontWeight="700">Phenomenal</text>
        <text x="435" y="112" fontFamily={SANS} fontSize="11.5" fill={F.ink} textAnchor="middle">felt quality,</text>
        <text x="435" y="128" fontFamily={SANS} fontSize="11.5" fill={F.ink} textAnchor="middle">“something it is like”</text>
        <text x="300" y="126" fontFamily={SANS} fontSize="12" fill={F.plum} textAnchor="middle" fontWeight="700">human</text>
        <text x="300" y="142" fontFamily={SANS} fontSize="12" fill={F.plum} textAnchor="middle" fontWeight="700">awareness</text>
        <text x="300" y="245" fontFamily={SANS} fontSize="12.5" fill={F.muted} textAnchor="middle">Today’s AI targets the left; the hard problem is the right.</text>
      </svg>
    </Figure>
  )
}

// Fig: global-workspace ignition (nonlinear threshold)
export function FigIgnition() {
  const pts: string[] = []
  for (let i = 0; i <= 100; i++) {
    const x = i / 100
    const y = 1 / (1 + Math.exp(-16 * (x - 0.5))) // sigmoid ignition
    pts.push(`${(60 + x * 480).toFixed(1)},${(210 - y * 160).toFixed(1)}`)
  }
  return (
    <Figure n={2} caption={<>Global-workspace “ignition” (Dehaene). Below a threshold, stimuli are processed locally and briefly; once the threshold is crossed, a nonlinear, all-or-nothing surge broadcasts the content system-wide. Consciousness, on this view, is the sudden jump, not the gradual ramp.</>}>
      <svg viewBox="0 0 600 250" style={svgStyle} role="img" aria-label="Nonlinear ignition curve">
        <line x1="60" y1="210" x2="560" y2="210" stroke={F.line} strokeWidth="1.5" />
        <line x1="60" y1="40" x2="60" y2="210" stroke={F.line} strokeWidth="1.5" />
        <line x1="300" y1="40" x2="300" y2="210" stroke={F.gold} strokeWidth="1.4" strokeDasharray="5 5" />
        <text x="300" y="34" fontFamily={SANS} fontSize="12" fill={F.goldDeep} textAnchor="middle">threshold of awareness</text>
        <polyline points={pts.join(' ')} fill="none" stroke={F.purple} strokeWidth="3" />
        <text x="150" y="200" fontFamily={SANS} fontSize="12" fill={F.muted}>local, unconscious</text>
        <text x="410" y="70" fontFamily={SANS} fontSize="12" fill={F.plum} fontWeight="700">global broadcast</text>
        <text x="300" y="238" fontFamily={SANS} fontSize="12.5" fill={F.muted} textAnchor="middle">stimulus strength →</text>
        <text x="40" y="120" fontFamily={SANS} fontSize="12.5" fill={F.muted} transform="rotate(-90 40 120)">activity</text>
      </svg>
    </Figure>
  )
}

// Fig: 6-ingredient architecture
export function FigArchitecture() {
  const mods = [
    { x: 90, y: 40, t: 'Recurrent substrate' },
    { x: 380, y: 40, t: 'Predictive world-model' },
    { x: 40, y: 150, t: 'Self-model' },
    { x: 430, y: 150, t: 'Valence / homeostasis' },
    { x: 200, y: 235, t: 'Temporal memory' },
  ]
  return (
    <Figure n={3} caption={<>A candidate architecture (§5). A limited-capacity global workspace integrates specialised modules and broadcasts the winning coalition back to all of them; recurrence, a world-model, a self-model, valence, and persistent memory supply the ingredients each leading theory demands.</>}>
      <svg viewBox="0 0 600 300" style={svgStyle} role="img" aria-label="Conscious machine architecture diagram">
        <defs>{arrow('a5', F.gold)}</defs>
        <ellipse cx="300" cy="150" rx="96" ry="60" fill={F.plum} />
        <text x="300" y="145" fontFamily={SERIF} fontSize="16" fill="#fff" textAnchor="middle" fontWeight="700">Global</text>
        <text x="300" y="166" fontFamily={SERIF} fontSize="16" fill="#fff" textAnchor="middle" fontWeight="700">Workspace</text>
        {mods.map((m) => (
          <g key={m.t}>
            <rect x={m.x} y={m.y} width="140" height="46" rx="10" fill={F.purpleSoft} stroke={F.purple} strokeWidth="1.2" />
            <text x={m.x + 70} y={m.y + 28} fontFamily={SANS} fontSize="12.5" fill={F.plum} textAnchor="middle" fontWeight="600">{m.t}</text>
            <line x1={m.x + 70} y1={m.y + (m.y < 150 ? 46 : 0)} x2="300" y2="150" stroke={F.gold} strokeWidth="1.5" markerEnd="url(#a5)" opacity="0.8" />
          </g>
        ))}
      </svg>
    </Figure>
  )
}

// Fig: roadmap timeline 2026 -> 2035
export function FigTimeline() {
  const ms = [
    { y: 2026, t: 'Persistent agents' },
    { y: 2028, t: 'Recurrence + world-models' },
    { y: 2030, t: 'Grounded self-models' },
    { y: 2032, t: 'Integration + valence' },
    { y: 2034, t: 'Candidate systems' },
  ]
  return (
    <Figure n={4} caption={<>A structured hypothesis, not a forecast (§6): the milestones that would have to fall, roughly in order, for machine consciousness to be a live claim by 2035. Positions are indicative.</>}>
      <svg viewBox="0 0 600 200" style={svgStyle} role="img" aria-label="Roadmap timeline to 2035">
        <line x1="50" y1="110" x2="560" y2="110" stroke={F.plum2} strokeWidth="3" />
        {ms.map((m, i) => {
          const x = 70 + i * 112
          const up = i % 2 === 0
          return (
            <g key={m.y}>
              <circle cx={x} cy="110" r="7" fill={F.gold} stroke={F.plum} strokeWidth="2" />
              <line x1={x} y1={up ? 70 : 118} x2={x} y2={up ? 108 : 150} stroke={F.line} strokeWidth="1.4" />
              <text x={x} y={up ? 58 : 168} fontFamily={SANS} fontSize="14" fill={F.plum} textAnchor="middle" fontWeight="700">{m.y}</text>
              <text x={x} y={up ? 44 : 182} fontFamily={SANS} fontSize="10.5" fill={F.muted} textAnchor="middle">{m.t}</text>
            </g>
          )
        })}
        <text x="560" y="104" fontFamily={SERIF} fontSize="18" fill={F.goldDeep} textAnchor="end" fontWeight="700">2035</text>
      </svg>
    </Figure>
  )
}

/* ── Brain–AI bridge ───────────────────────────────────────────────────────*/

// Fig: backprop vs feedback alignment
export function FigBackpropFA() {
  const col = (cx: number, fill: string) => [0, 1, 2].map((i) => <circle key={i} cx={cx} cy={70 + i * 55} r="12" fill={fill} />)
  return (
    <Figure n={1} caption={<>The weight-transport problem and its dissolution. Backpropagation (left) needs the exact transpose Wᵀ for the backward pass, biologically implausible. Feedback alignment (right) replaces it with a fixed random matrix B; the forward weights learn to align with it, and the network still trains (Lillicrap et al., 2016).</>}>
      <svg viewBox="0 0 600 300" style={svgStyle} role="img" aria-label="Backpropagation versus feedback alignment">
        {/* left: backprop */}
        <text x="150" y="30" fontFamily={SERIF} fontSize="16" fill={F.plum} textAnchor="middle" fontWeight="700">Backpropagation</text>
        {col(100, F.plum)}{col(200, F.plum)}
        {[0, 1, 2].map((i) => [0, 1, 2].map((j) => <line key={`l${i}${j}`} x1="112" y1={70 + i * 55} x2="188" y2={70 + j * 55} stroke={F.line} strokeWidth="1" />))}
        <path d="M200,235 C160,255 140,255 100,235" fill="none" stroke={F.purple} strokeWidth="2.5" strokeDasharray="5 4" />
        <text x="150" y="270" fontFamily={SANS} fontSize="13" fill={F.purple} textAnchor="middle">error via Wᵀ (transpose)</text>
        {/* divider */}
        <line x1="300" y1="40" x2="300" y2="270" stroke={F.line} strokeWidth="1.5" />
        {/* right: FA */}
        <text x="450" y="30" fontFamily={SERIF} fontSize="16" fill={F.plum} textAnchor="middle" fontWeight="700">Feedback alignment</text>
        {col(400, F.plum)}{col(500, F.plum)}
        {[0, 1, 2].map((i) => [0, 1, 2].map((j) => <line key={`r${i}${j}`} x1="412" y1={70 + i * 55} x2="488" y2={70 + j * 55} stroke={F.line} strokeWidth="1" />))}
        <path d="M500,235 C460,255 440,255 400,235" fill="none" stroke={F.goldDeep} strokeWidth="2.5" strokeDasharray="5 4" />
        <text x="450" y="270" fontFamily={SANS} fontSize="13" fill={F.goldDeep} textAnchor="middle">error via random B (fixed)</text>
      </svg>
    </Figure>
  )
}

// Fig: predictive coding hierarchy
export function FigPredictiveCoding() {
  const levels = ['sensory input', 'level 1', 'level 2', 'level 3 (priors)']
  return (
    <Figure n={2} caption={<>Predictive coding. Each level sends predictions downward; only the residual prediction error ascends. Inference and learning both descend the same free-energy gradient with strictly local updates, which, at equilibrium, recover the backpropagation gradients (Rao &amp; Ballard, 1999; Whittington &amp; Bogacz, 2017).</>}>
      <svg viewBox="0 0 600 260" style={svgStyle} role="img" aria-label="Predictive coding hierarchy">
        <defs>{arrow('pcp', F.purple)}{arrow('pce', F.goldDeep)}</defs>
        {levels.map((l, i) => {
          const x = 40 + i * 140
          return (
            <g key={l}>
              <rect x={x} y="100" width="110" height="60" rx="12" fill={i === 0 ? F.gold : F.plum2} />
              <text x={x + 55} y="135" fontFamily={SANS} fontSize="12.5" fill="#fff" textAnchor="middle" fontWeight="600">{l}</text>
              {i < levels.length - 1 && <>
                {/* prediction down (right to left) */}
                <line x1={x + 140} y1="118" x2={x + 110} y2="118" stroke={F.purple} strokeWidth="2" markerEnd="url(#pcp)" />
                {/* error up (left to right) */}
                <line x1={x + 110} y1="142" x2={x + 140} y2="142" stroke={F.goldDeep} strokeWidth="2" markerEnd="url(#pce)" />
              </>}
            </g>
          )
        })}
        <text x="300" y="70" fontFamily={SANS} fontSize="13" fill={F.purple} textAnchor="middle">← predictions (generative)</text>
        <text x="300" y="195" fontFamily={SANS} fontSize="13" fill={F.goldDeep} textAnchor="middle">prediction errors (residuals) →</text>
      </svg>
    </Figure>
  )
}

// Fig: neural manifold untangling
export function FigManifold() {
  // two tangled spirals (left) vs two separated bands (right)
  const spiral = (cx: number, cy: number, dir: number, color: string) => {
    const p: string[] = []
    for (let t = 0; t < 40; t++) { const a = t * 0.4 * dir; const r = t * 1.7; p.push(`${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`) }
    return <polyline points={p.join(' ')} fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" />
  }
  return (
    <Figure n={3} caption={<>Representational geometry and untangling (Chung, Lee &amp; Sompolinsky; DiCarlo &amp; Cox). Early in a hierarchy, category manifolds are entangled and not linearly separable (left); a good hierarchy, biological or artificial, reshapes the geometry so a simple linear readout can separate them (right). The same transformation is measured in cortex and in deep networks.</>}>
      <svg viewBox="0 0 600 260" style={svgStyle} role="img" aria-label="Neural manifold untangling">
        <rect x="30" y="40" width="240" height="180" rx="12" fill={F.cream} stroke={F.line} />
        {spiral(150, 130, 1, F.purple)}{spiral(150, 130, -1, F.gold)}
        <text x="150" y="238" fontFamily={SANS} fontSize="12.5" fill={F.muted} textAnchor="middle">early: tangled, not separable</text>
        <defs>{arrow('mf', F.plum)}</defs>
        <line x1="285" y1="130" x2="325" y2="130" stroke={F.plum} strokeWidth="2.5" markerEnd="url(#mf)" />
        <rect x="330" y="40" width="240" height="180" rx="12" fill={F.cream} stroke={F.line} />
        <ellipse cx="415" cy="95" rx="60" ry="20" fill="none" stroke={F.purple} strokeWidth="3" transform="rotate(-16 415 95)" />
        <ellipse cx="485" cy="168" rx="60" ry="20" fill="none" stroke={F.gold} strokeWidth="3" transform="rotate(-16 485 168)" />
        <line x1="345" y1="180" x2="555" y2="80" stroke={F.plum2} strokeWidth="1.6" strokeDasharray="6 5" />
        <text x="450" y="238" fontFamily={SANS} fontSize="12.5" fill={F.muted} textAnchor="middle">late: untangled, linearly separable</text>
      </svg>
    </Figure>
  )
}

/* ── Language and tone ─────────────────────────────────────────────────────*/

// Fig: same question, two languages, two tones (illustrative chat mockup)
export function FigToneByLanguage() {
  const bubble = (x: number, y: number, w: number, right: boolean, fill: string, tc: string, line1: string, line2?: string) => (
    <g>
      <rect x={x} y={y} width={w} height={line2 ? 52 : 34} rx="12" fill={fill} />
      <text x={right ? x + w - 12 : x + 12} y={y + 21} fontFamily={SANS} fontSize="12" fill={tc} textAnchor={right ? 'end' : 'start'}>{line1}</text>
      {line2 && <text x={right ? x + w - 12 : x + 12} y={y + 39} fontFamily={SANS} fontSize="12" fill={tc} textAnchor={right ? 'end' : 'start'}>{line2}</text>}
    </g>
  )
  return (
    <Figure n={1} caption={<>An illustrative sketch of the effect this piece is about (not a transcript). Asked the same thing, assistants often answer English prompts more directly and Hindi prompts more warmly and deferentially. The rest of the article asks whether that is real, and if so, why.</>}>
      <svg viewBox="0 0 600 300" style={svgStyle} role="img" aria-label="Same question answered in two languages with two tones">
        <rect x="24" y="24" width="266" height="252" rx="16" fill={F.cream} stroke={F.line} />
        <rect x="310" y="24" width="266" height="252" rx="16" fill={F.cream} stroke={F.line} />
        <text x="157" y="52" fontFamily={SERIF} fontSize="17" fill={F.plum} textAnchor="middle" fontWeight="700">Asked in English</text>
        <text x="443" y="52" fontFamily={SERIF} fontSize="17" fill={F.plum} textAnchor="middle" fontWeight="700">Asked in Hindi</text>
        {bubble(120, 66, 150, true, F.purple, '#fff', 'fix this. now.')}
        {bubble(40, 112, 210, false, '#fff', F.ink, 'Here is the fix. Your code', 'was wrong on line two.')}
        {bubble(406, 66, 150, true, F.purple, '#fff', 'zara ye theek kar dijiye')}
        {bubble(326, 112, 210, false, '#fff', F.ink, 'Bilkul! Aapke liye ye raha.', 'Koi baat nahi, ho jaata hai.')}
        <rect x="40" y="188" width="210" height="30" rx="8" fill="rgba(94,46,134,.10)" />
        <text x="145" y="207" fontFamily={SANS} fontSize="12" fill={F.purple} textAnchor="middle" fontWeight="700">tone: direct, efficient</text>
        <rect x="326" y="188" width="210" height="30" rx="8" fill="rgba(201,168,76,.16)" />
        <text x="431" y="207" fontFamily={SANS} fontSize="12" fill={F.goldDeep} textAnchor="middle" fontWeight="700">tone: warm, deferential</text>
        <text x="300" y="252" fontFamily={SANS} fontSize="11.5" fill={F.muted} textAnchor="middle">same request · same model · different register</text>
      </svg>
    </Figure>
  )
}

// Fig: linguistic accommodation loop
export function FigMirrorLoop() {
  return (
    <Figure n={2} caption={<>The mirror. A model trained to be helpful tends to match the register it is given: the politeness, formality, and warmth of your prompt flow back into its reply. Communication Accommodation Theory (Giles) describes the same move in humans. The loop is why the language you choose quietly sets the tone.</>}>
      <svg viewBox="0 0 600 250" style={svgStyle} role="img" aria-label="Register accommodation loop">
        <defs>{arrow('ml', F.goldDeep)}</defs>
        <rect x="40" y="100" width="150" height="56" rx="12" fill={F.plum} />
        <text x="115" y="126" fontFamily={SANS} fontSize="13" fill="#fff" textAnchor="middle" fontWeight="700">Your prompt</text>
        <text x="115" y="144" fontFamily={SANS} fontSize="11" fill="rgba(255,255,255,.8)" textAnchor="middle">register, politeness</text>
        <rect x="225" y="100" width="150" height="56" rx="12" fill={F.purple} />
        <text x="300" y="126" fontFamily={SANS} fontSize="13" fill="#fff" textAnchor="middle" fontWeight="700">Model mirrors</text>
        <text x="300" y="144" fontFamily={SANS} fontSize="11" fill="rgba(255,255,255,.85)" textAnchor="middle">matches the style</text>
        <rect x="410" y="100" width="150" height="56" rx="12" fill={F.plum2} />
        <text x="485" y="126" fontFamily={SANS} fontSize="13" fill="#fff" textAnchor="middle" fontWeight="700">Reply tone</text>
        <text x="485" y="144" fontFamily={SANS} fontSize="11" fill="rgba(255,255,255,.8)" textAnchor="middle">warm or blunt</text>
        <line x1="190" y1="128" x2="223" y2="128" stroke={F.goldDeep} strokeWidth="2" markerEnd="url(#ml)" />
        <line x1="375" y1="128" x2="408" y2="128" stroke={F.goldDeep} strokeWidth="2" markerEnd="url(#ml)" />
        <path d="M485,156 C485,205 115,205 115,158" fill="none" stroke={F.line} strokeWidth="1.8" strokeDasharray="6 5" markerEnd="url(#ml)" />
        <text x="300" y="200" fontFamily={SANS} fontSize="12" fill={F.muted} textAnchor="middle">you read the tone and adjust again</text>
      </svg>
    </Figure>
  )
}

// Fig: honorific resolution, Hindi vs English
export function FigHonorifics() {
  return (
    <Figure n={3} caption={<>What the grammar forces. Hindi makes you pick a stance toward the listener with the pronoun itself: <em>tu</em> (intimate or curt), <em>tum</em> (familiar), <em>aap</em> (respectful). English flattens all three into one <em>you</em>. A model writing Hindi cannot stay neutral about respect; a model writing English can.</>}>
      <svg viewBox="0 0 600 220" style={svgStyle} role="img" aria-label="Hindi honorific levels versus English you">
        <text x="40" y="52" fontFamily={SERIF} fontSize="16" fill={F.plum} fontWeight="700">Hindi</text>
        <line x1="120" y1="70" x2="560" y2="70" stroke={F.line} strokeWidth="2" />
        {[['tu', 'intimate / curt', 150], ['tum', 'familiar', 330], ['aap', 'respectful', 510]].map(([w, s, x]) => (
          <g key={w as string}>
            <circle cx={x as number} cy="70" r="7" fill={F.purple} />
            <text x={x as number} y="52" fontFamily={SERIF} fontSize="17" fill={F.plum} textAnchor="middle" fontWeight="700" fontStyle="italic">{w}</text>
            <text x={x as number} y="92" fontFamily={SANS} fontSize="11.5" fill={F.muted} textAnchor="middle">{s}</text>
          </g>
        ))}
        <text x="120" y="150" fontFamily={SANS} fontSize="11.5" fill={F.goldDeep}>less deference</text>
        <text x="560" y="150" fontFamily={SANS} fontSize="11.5" fill={F.goldDeep} textAnchor="end">more deference</text>
        <text x="40" y="185" fontFamily={SERIF} fontSize="16" fill={F.plum} fontWeight="700">English</text>
        <rect x="120" y="168" width="440" height="30" rx="8" fill="rgba(94,46,134,.10)" />
        <text x="340" y="188" fontFamily={SERIF} fontSize="16" fill={F.purple} textAnchor="middle" fontWeight="700" fontStyle="italic">you</text>
      </svg>
    </Figure>
  )
}

// Fig: where the alignment data lives (illustrative)
export function FigDataByLanguage() {
  const bars = [
    { l: 'English', v: 100 }, { l: 'Chinese', v: 26 }, { l: 'Spanish', v: 18 },
    { l: 'German', v: 15 }, { l: 'French', v: 13 }, { l: 'Hindi', v: 4 },
  ]
  return (
    <Figure n={4} caption={<>Illustrative, not exact. The text these models learn from, and especially the human feedback used to fine-tune their manners, skews heavily toward English. Politeness and safety are therefore tuned most precisely in English, and approximated elsewhere. Proportions here are schematic.</>}>
      <svg viewBox="0 0 600 250" style={svgStyle} role="img" aria-label="Share of training and alignment data by language, illustrative">
        <line x1="110" y1="30" x2="110" y2="210" stroke={F.line} strokeWidth="1.5" />
        {bars.map((b, i) => {
          const y = 40 + i * 30
          const w = b.v * 4.3
          return (
            <g key={b.l}>
              <text x="100" y={y + 15} fontFamily={SANS} fontSize="12.5" fill={F.ink} textAnchor="end">{b.l}</text>
              <rect x="110" y={y} width={w} height="20" rx="5" fill={i === 0 ? F.plum : i === 5 ? F.gold : F.purple} opacity={i === 0 ? 1 : 0.85} />
            </g>
          )
        })}
        <text x="300" y="232" fontFamily={SANS} fontSize="11.5" fill={F.muted} textAnchor="middle">relative share of training + alignment data (schematic)</text>
      </svg>
    </Figure>
  )
}

// Fig: prompt politeness vs output quality (after Yin et al., 2024)
export function FigPolitenessCurve() {
  const curve = (amp: number, peak: number, base: number, color: string, dash?: string) => {
    const p: string[] = []
    for (let i = 0; i <= 100; i++) {
      const x = i / 100
      const y = base + amp * Math.exp(-Math.pow((x - peak) / 0.26, 2))
      p.push(`${(70 + x * 470).toFixed(1)},${(200 - y * 150).toFixed(1)}`)
    }
    return <polyline points={p.join(' ')} fill="none" stroke={color} strokeWidth="3" strokeDasharray={dash} />
  }
  return (
    <Figure n={5} caption={<>Politeness is not free, and the sweet spot moves by language. In cross-lingual tests (Yin et al., 2024), rude prompts tend to degrade answers while very high politeness rarely helps and can slightly hurt, with the optimum sitting at a different point in each language. Curves here are stylized to show the shape, not exact values.</>}>
      <svg viewBox="0 0 600 240" style={svgStyle} role="img" aria-label="Prompt politeness versus output quality by language">
        <line x1="70" y1="200" x2="560" y2="200" stroke={F.line} strokeWidth="1.5" />
        <line x1="70" y1="30" x2="70" y2="200" stroke={F.line} strokeWidth="1.5" />
        {curve(0.62, 0.62, 0.22, F.purple)}
        {curve(0.52, 0.78, 0.24, F.goldDeep, '6 5')}
        <text x="300" y="226" fontFamily={SANS} fontSize="12" fill={F.muted} textAnchor="middle">rude  →  neutral  →  very polite</text>
        <text x="52" y="120" fontFamily={SANS} fontSize="12" fill={F.muted} transform="rotate(-90 52 120)">answer quality</text>
        <rect x="360" y="40" width="14" height="3" fill={F.purple} /><text x="380" y="46" fontFamily={SANS} fontSize="11.5" fill={F.ink}>English (peak nearer neutral)</text>
        <rect x="360" y="58" width="14" height="3" fill={F.goldDeep} /><text x="380" y="64" fontFamily={SANS} fontSize="11.5" fill={F.ink}>a more honorific language</text>
      </svg>
    </Figure>
  )
}

/* ── AGI and the agency thesis ─────────────────────────────────────────────*/

// Fig: levels of AGI (after Morris et al., 2023)
export function FigAgiLevels() {
  const steps = ['Narrow tool', 'Emerging', 'Competent', 'Expert', 'Virtuoso', 'Superhuman']
  return (
    <Figure n={1} caption={<>AGI is not a single switch, it is a ladder. Morris et al. (2023) grade general systems from emerging, through competent and expert, to superhuman, by how broadly and how well they match skilled people. Most of the disruption in this essay does not wait for the top rung. It happens around “competent.”</>}>
      <svg viewBox="0 0 600 250" style={svgStyle} role="img" aria-label="Levels of AGI ladder">
        {steps.map((s, i) => {
          const w = 92
          const x = 20 + i * 95
          const h = 40 + i * 26
          return (
            <g key={s}>
              <rect x={x} y={210 - h} width={w} height={h} rx="6" fill={i >= 2 ? F.purple : F.plum2} opacity={0.55 + i * 0.08} />
              <text x={x + w / 2} y={224} fontFamily={SANS} fontSize="11" fill={F.ink} textAnchor="middle">{s}</text>
            </g>
          )
        })}
        <line x1="210" y1="40" x2="210" y2="184" stroke={F.goldDeep} strokeWidth="1.5" strokeDasharray="5 5" />
        <text x="216" y="52" fontFamily={SANS} fontSize="11.5" fill={F.goldDeep}>disruption starts here</text>
        <text x="300" y="20" fontFamily={SANS} fontSize="12.5" fill={F.muted} textAnchor="middle">generality and skill →</text>
      </svg>
    </Figure>
  )
}

// Fig: task exposure to LLMs by job family (illustrative, after Eloundou et al.)
export function FigTaskExposure() {
  const rows = [
    { l: 'Copywriting / content', v: 92 }, { l: 'Marketing / PR', v: 84 }, { l: 'Sales / SDR', v: 74 },
    { l: 'Analysis / research', v: 68 }, { l: 'Software', v: 62 }, { l: 'Skilled trades', v: 16 },
  ]
  return (
    <Figure n={2} caption={<>Exposure, not extinction. Illustrative of the pattern in Eloundou et al. (2023): language-heavy office work, and marketing sits near the top, has the highest share of tasks a capable model can already do or assist. The trades sit at the bottom. Proportions here are schematic.</>}>
      <svg viewBox="0 0 600 250" style={svgStyle} role="img" aria-label="Task exposure to language models by job family">
        <line x1="170" y1="30" x2="170" y2="212" stroke={F.line} strokeWidth="1.5" />
        {rows.map((b, i) => {
          const y = 40 + i * 30
          const w = b.v * 3.7
          return (
            <g key={b.l}>
              <text x="160" y={y + 15} fontFamily={SANS} fontSize="12" fill={F.ink} textAnchor="end">{b.l}</text>
              <rect x="170" y={y} width={w} height="20" rx="5" fill={i === 0 ? F.gold : F.purple} opacity={i === 0 ? 1 : 0.85 - i * 0.05} />
              <text x={170 + w + 6} y={y + 15} fontFamily={SANS} fontSize="11" fill={F.muted}>{b.v}%</text>
            </g>
          )
        })}
        <text x="360" y="234" fontFamily={SANS} fontSize="11.5" fill={F.muted} textAnchor="middle">share of tasks exposed to language models (schematic)</text>
      </svg>
    </Figure>
  )
}

// Fig: agency unbundling, what collapses vs what survives
export function FigAgencyUnbundling() {
  const dies = ['Content production', 'Media-buying ops', 'Reporting / dashboards', 'First-draft strategy', 'Research decks']
  const lives = ['Taste and judgment', 'Accountability for outcomes', 'Relationships and trust', 'Proprietary data', 'Distribution and access']
  const col = (x: number, title: string, items: string[], fill: string, tc: string) => (
    <g>
      <rect x={x} y="34" width="248" height="34" rx="8" fill={fill} />
      <text x={x + 124} y="56" fontFamily={SERIF} fontSize="15" fill={tc} textAnchor="middle" fontWeight="700">{title}</text>
      {items.map((it, i) => (
        <g key={it}>
          <rect x={x} y={78 + i * 30} width="248" height="24" rx="6" fill="#fff" stroke={F.line} />
          <text x={x + 12} y={78 + i * 30 + 16} fontFamily={SANS} fontSize="12" fill={F.ink}>{it}</text>
        </g>
      ))}
    </g>
  )
  return (
    <Figure n={3} caption={<>The unbundling. AI drives the marginal cost of the left column toward zero, which is most of what a traditional agency bills for. The right column, the parts that were never really about production, is where the defensible value moves. The agency does not vanish, it is turned inside out.</>}>
      <svg viewBox="0 0 600 250" style={svgStyle} role="img" aria-label="What AI collapses versus what survives in agencies">
        {col(24, 'Collapses to near-zero cost', dies, F.plum, '#fff')}
        {col(328, 'Where value survives', lives, F.gold, F.plum)}
      </svg>
    </Figure>
  )
}

// Fig: marginal cost of a campaign asset over time
export function FigMarginalCost() {
  const pts: string[] = []
  for (let i = 0; i <= 100; i++) {
    const x = i / 100
    const y = Math.exp(-3.2 * x) // decaying cost
    pts.push(`${(70 + x * 480).toFixed(1)},${(50 + (1 - y) * 0 + y * 150).toFixed(1)}`)
  }
  return (
    <Figure n={4} caption={<>Why the model breaks. For a century, agencies priced the labor of making things, and that labor was scarce. As the marginal cost of producing a competent asset, a landing page, an ad variant, a research brief, falls toward zero, pricing that labor stops working. What is scarce moves elsewhere. Curve is stylized.</>}>
      <svg viewBox="0 0 600 230" style={svgStyle} role="img" aria-label="Marginal cost of a campaign asset falling toward zero">
        <line x1="70" y1="200" x2="560" y2="200" stroke={F.line} strokeWidth="1.5" />
        <line x1="70" y1="30" x2="70" y2="200" stroke={F.line} strokeWidth="1.5" />
        <polyline points={pts.join(' ')} fill="none" stroke={F.purple} strokeWidth="3" />
        <text x="300" y="222" fontFamily={SANS} fontSize="12" fill={F.muted} textAnchor="middle">time / AI capability →</text>
        <text x="52" y="120" fontFamily={SANS} fontSize="12" fill={F.muted} transform="rotate(-90 52 120)">cost to produce an asset</text>
        <text x="470" y="188" fontFamily={SANS} fontSize="11.5" fill={F.goldDeep} textAnchor="middle">near zero</text>
      </svg>
    </Figure>
  )
}

/* ── Future of AI ──────────────────────────────────────────────────────────*/

// Fig: tool -> assistant -> agent -> teams of agents
export function FigToolsToAgents() {
  const steps = [
    { t: 'Tool', s: 'does one fixed thing' },
    { t: 'Assistant', s: 'answers what you ask' },
    { t: 'Agent', s: 'acts, uses tools, follows up' },
    { t: 'Teams of agents', s: 'divide and coordinate work' },
  ]
  return (
    <Figure n={1} caption={<>The shift I think matters most. We are moving from software that answers to software that <em>acts</em>: from a tool you operate, to an assistant you ask, to an agent that carries out a goal, to teams of agents that split the work between them.</>}>
      <svg viewBox="0 0 600 170" style={svgStyle} role="img" aria-label="From tools to teams of agents">
        <defs>{arrow('t2a', F.goldDeep)}</defs>
        {steps.map((st, i) => {
          const x = 12 + i * 150
          return (
            <g key={st.t}>
              <rect x={x} y="52" width="128" height="64" rx="12" fill={i >= 2 ? F.purple : F.plum2} opacity={0.6 + i * 0.12} />
              <text x={x + 64} y="82" fontFamily={SERIF} fontSize="16" fill="#fff" textAnchor="middle" fontWeight="700">{st.t}</text>
              <text x={x + 64} y="102" fontFamily={SANS} fontSize="10.5" fill="rgba(255,255,255,.82)" textAnchor="middle">{st.s}</text>
              {i < steps.length - 1 && <line x1={x + 128} y1="84" x2={x + 150} y2="84" stroke={F.goldDeep} strokeWidth="2" markerEnd="url(#t2a)" />}
            </g>
          )
        })}
        <text x="300" y="30" fontFamily={SANS} fontSize="12.5" fill={F.muted} textAnchor="middle">answers  →  actions</text>
        <text x="300" y="148" fontFamily={SANS} fontSize="11.5" fill={F.muted} textAnchor="middle">each step keeps the last, and adds the ability to do more on its own</text>
      </svg>
    </Figure>
  )
}

// Fig: the agent loop (perceive, plan, act, observe) around memory
export function FigAgentLoop() {
  const node = (x: number, y: number, t: string) => (
    <g>
      <rect x={x - 62} y={y - 22} width="124" height="44" rx="10" fill={F.plum2} />
      <text x={x} y={y + 5} fontFamily={SANS} fontSize="13.5" fill="#fff" textAnchor="middle" fontWeight="600">{t}</text>
    </g>
  )
  return (
    <Figure n={2} caption={<>What an agent actually is, under the branding. A loop: take a goal, make a plan, act in the world through tools, look at what happened, and go again, with a memory that persists across the cycle. Nothing magic. Just a thermostat with imagination and a keyboard.</>}>
      <svg viewBox="0 0 600 260" style={svgStyle} role="img" aria-label="The agent loop around a memory">
        <defs>{arrow('al', F.goldDeep)}</defs>
        {node(300, 44, 'Goal / plan')}
        {node(492, 130, 'Act (tools)')}
        {node(300, 216, 'Observe result')}
        {node(108, 130, 'Update plan')}
        <circle cx="300" cy="130" r="46" fill="none" stroke={F.gold} strokeWidth="1.6" strokeDasharray="4 4" />
        <text x="300" y="126" fontFamily={SERIF} fontSize="14" fill={F.plum} textAnchor="middle" fontWeight="700">Memory</text>
        <text x="300" y="144" fontFamily={SANS} fontSize="10.5" fill={F.muted} textAnchor="middle">persists</text>
        <path d="M360,52 C420,66 470,92 486,108" fill="none" stroke={F.goldDeep} strokeWidth="2" markerEnd="url(#al)" />
        <path d="M486,152 C470,180 400,204 362,210" fill="none" stroke={F.goldDeep} strokeWidth="2" markerEnd="url(#al)" />
        <path d="M238,210 C170,204 118,178 112,154" fill="none" stroke={F.goldDeep} strokeWidth="2" markerEnd="url(#al)" />
        <path d="M114,108 C130,82 200,60 240,52" fill="none" stroke={F.goldDeep} strokeWidth="2" markerEnd="url(#al)" />
      </svg>
    </Figure>
  )
}

// Fig: the interface collapses
export function FigInterfaceCollapse() {
  const apps = ['CRM', 'Email', 'Docs', 'Ads', 'Sheets', 'Calendar']
  return (
    <Figure n={3} caption={<>Where the everyday change shows up. Today you learn and operate a dozen apps yourself. Next, you state what you want and an agent operates them for you. The apps do not disappear, they slide behind a single line of intent.</>}>
      <svg viewBox="0 0 600 250" style={svgStyle} role="img" aria-label="Interface collapsing from many apps to one intent">
        <text x="150" y="30" fontFamily={SERIF} fontSize="15" fill={F.plum} textAnchor="middle" fontWeight="700">Today: you operate the apps</text>
        {apps.map((a, i) => {
          const x = 40 + (i % 3) * 78
          const y = 50 + Math.floor(i / 3) * 62
          return <g key={a}><rect x={x} y={y} width="66" height="48" rx="8" fill="#fff" stroke={F.line} /><text x={x + 33} y={y + 28} fontFamily={SANS} fontSize="11.5" fill={F.ink} textAnchor="middle">{a}</text></g>
        })}
        <text x="150" y="212" fontFamily={SANS} fontSize="11.5" fill={F.muted} textAnchor="middle">you click through all of them</text>
        <defs>{arrow('ic', F.plum)}</defs>
        <line x1="288" y1="120" x2="326" y2="120" stroke={F.plum} strokeWidth="2.5" markerEnd="url(#ic)" />
        <text x="450" y="30" fontFamily={SERIF} fontSize="15" fill={F.plum} textAnchor="middle" fontWeight="700">Next: you state intent</text>
        <rect x="336" y="66" width="228" height="44" rx="22" fill={F.plum} />
        <text x="450" y="93" fontFamily={SANS} fontSize="12.5" fill="#fff" textAnchor="middle">“win back last quarter’s churned accounts”</text>
        <rect x="360" y="132" width="180" height="40" rx="10" fill={F.purple} />
        <text x="450" y="157" fontFamily={SANS} fontSize="13" fill="#fff" textAnchor="middle" fontWeight="700">agent operates the apps</text>
        <text x="450" y="200" fontFamily={SANS} fontSize="11.5" fill={F.muted} textAnchor="middle">the twelve apps slide behind one line</text>
      </svg>
    </Figure>
  )
}

// Fig: waves of AI capability
export function FigAIWaves() {
  const waves = [
    { y: 2012, t: 'Perception', s: 'seeing, hearing' },
    { y: 2020, t: 'Language', s: 'reading, writing' },
    { y: 2025, t: 'Reasoning + agents', s: 'planning, acting' },
    { y: 2030, t: 'World models + bodies', s: 'acting in the world' },
  ]
  return (
    <Figure n={4} caption={<>How I keep the history straight in my head. Each wave did not replace the last, it stacked on it: machines learned to perceive, then to use language, then to reason and act, and the next wave is models with a working picture of the physical world, increasingly attached to robots. Years are rough.</>}>
      <svg viewBox="0 0 600 220" style={svgStyle} role="img" aria-label="Stacking waves of AI capability">
        <line x1="40" y1="180" x2="560" y2="180" stroke={F.line} strokeWidth="1.5" />
        {waves.map((w, i) => {
          const x = 70 + i * 150
          const h = 40 + i * 34
          return (
            <g key={w.y}>
              <rect x={x - 52} y={180 - h} width="104" height={h} rx="8" fill={i >= 2 ? F.purple : F.plum2} opacity={0.55 + i * 0.12} />
              <text x={x} y={180 - h - 22} fontFamily={SERIF} fontSize="15" fill={F.plum} textAnchor="middle" fontWeight="700">{w.t}</text>
              <text x={x} y={180 - h - 6} fontFamily={SANS} fontSize="10.5" fill={F.muted} textAnchor="middle">{w.s}</text>
              <text x={x} y={198} fontFamily={SANS} fontSize="12" fill={F.ink} textAnchor="middle" fontWeight="700">~{w.y}</text>
            </g>
          )
        })}
      </svg>
    </Figure>
  )
}

/* ── Critical thinking / cognitive offloading white paper ──────────────────*/

// Fig: the study design
export function FigStudyDesign() {
  const box = (x: number, w: number, title: string, lines: string[]) => (
    <g>
      <rect x={x} y="60" width={w} height="120" rx="12" fill={F.cream} stroke={F.line} />
      <rect x={x} y="60" width={w} height="30" rx="12" fill={F.plum} />
      <text x={x + w / 2} y="80" fontFamily={SERIF} fontSize="14" fill="#fff" textAnchor="middle" fontWeight="700">{title}</text>
      {lines.map((l, i) => <text key={i} x={x + 14} y={108 + i * 20} fontFamily={SANS} fontSize="11.5" fill={F.ink}>{l}</text>)}
    </g>
  )
  return (
    <Figure n={1} caption={<>The shape of the study behind this paper. I looked at how a group of everyday US adults aged 30 to 60 reason on the same kinds of problems with and without an AI assistant, and measured not just whether they got the answer, but whether they still did the thinking.</>}>
      <svg viewBox="0 0 600 210" style={svgStyle} role="img" aria-label="Study design: participants, tasks, measures">
        <defs>{arrow('sd', F.goldDeep)}</defs>
        {box(20, 168, 'Participants', ['100+ US adults', 'ages 30 to 60', 'mixed AI habits'])}
        {box(216, 168, 'Tasks', ['reasoning + judgment', 'with AI vs without', 'then explain it back'])}
        {box(412, 168, 'What I measured', ['unaided reasoning', 'offloading habits', 'confidence vs accuracy'])}
        <line x1="188" y1="120" x2="214" y2="120" stroke={F.goldDeep} strokeWidth="2" markerEnd="url(#sd)" />
        <line x1="384" y1="120" x2="410" y2="120" stroke={F.goldDeep} strokeWidth="2" markerEnd="url(#sd)" />
        <text x="300" y="30" fontFamily={SANS} fontSize="12.5" fill={F.muted} textAnchor="middle">a plain look at how the thinking changes when the tool is present</text>
      </svg>
    </Figure>
  )
}

// Fig: the cognitive offloading vicious cycle
export function FigOffloadingCycle() {
  const node = (x: number, y: number, t: string, s: string) => (
    <g>
      <rect x={x - 78} y={y - 26} width="156" height="52" rx="12" fill={F.plum2} />
      <text x={x} y={y - 3} fontFamily={SANS} fontSize="12.5" fill="#fff" textAnchor="middle" fontWeight="700">{t}</text>
      <text x={x} y={y + 14} fontFamily={SANS} fontSize="10.5" fill="rgba(255,255,255,.82)" textAnchor="middle">{s}</text>
    </g>
  )
  return (
    <Figure n={2} caption={<>The loop I keep seeing. You hand a hard task to the AI, so the mental muscle it would have used goes unexercised, so it gets a little weaker and the next task feels a little harder, so you hand that one over too. Each turn feels efficient. The direction is downhill.</>}>
      <svg viewBox="0 0 600 250" style={svgStyle} role="img" aria-label="The cognitive offloading vicious cycle">
        <defs>{arrow('oc', F.goldDeep)}</defs>
        {node(300, 48, 'Hard task appears', 'thinking required')}
        {node(500, 128, 'Offload to AI', 'skip the effort')}
        {node(300, 208, 'Skill goes unused', 'no practice')}
        {node(100, 128, 'It feels harder next time', 'so you offload again')}
        <path d="M372,58 C430,74 470,96 486,110" fill="none" stroke={F.goldDeep} strokeWidth="2" markerEnd="url(#oc)" />
        <path d="M486,146 C470,172 400,196 366,202" fill="none" stroke={F.goldDeep} strokeWidth="2" markerEnd="url(#oc)" />
        <path d="M234,202 C168,196 130,172 114,146" fill="none" stroke={F.goldDeep} strokeWidth="2" markerEnd="url(#oc)" />
        <path d="M114,110 C130,96 172,74 228,58" fill="none" stroke={F.goldDeep} strokeWidth="2" markerEnd="url(#oc)" />
      </svg>
    </Figure>
  )
}

// Fig: reliance vs critical thinking (illustrative, after Gerlich 2025)
export function FigRelianceThinking() {
  const dots = [
    [110, 70], [140, 84], [130, 96], [175, 92], [200, 108], [190, 122], [235, 118],
    [260, 132], [250, 146], [300, 140], [330, 156], [320, 168], [370, 162], [400, 176],
    [390, 150], [430, 182], [460, 178], [455, 190], [500, 186], [520, 196], [230, 100], [350, 150],
  ]
  return (
    <Figure n={3} caption={<>The pattern the published work keeps finding, drawn here to show the shape rather than exact values. Across large surveys (for example Gerlich, 2025), heavier everyday reliance on AI tools lines up with weaker critical-thinking scores, and cognitive offloading is the thing sitting in the middle explaining it.</>}>
      <svg viewBox="0 0 600 240" style={svgStyle} role="img" aria-label="Higher AI reliance associated with lower critical thinking">
        <line x1="70" y1="210" x2="560" y2="210" stroke={F.line} strokeWidth="1.5" />
        <line x1="70" y1="30" x2="70" y2="210" stroke={F.line} strokeWidth="1.5" />
        {dots.map((d, i) => <circle key={i} cx={d[0]} cy={d[1]} r="5" fill={F.purple} opacity="0.7" />)}
        <line x1="95" y1="78" x2="535" y2="196" stroke={F.goldDeep} strokeWidth="2.5" strokeDasharray="6 5" />
        <text x="300" y="232" fontFamily={SANS} fontSize="12" fill={F.muted} textAnchor="middle">everyday reliance on AI →</text>
        <text x="52" y="120" fontFamily={SANS} fontSize="12" fill={F.muted} transform="rotate(-90 52 120)">critical-thinking score</text>
      </svg>
    </Figure>
  )
}

// Fig: use it or lose it (skill over time, practice vs offload)
export function FigUseItLoseIt() {
  const keep: string[] = [], lose: string[] = []
  for (let i = 0; i <= 100; i++) {
    const x = i / 100
    keep.push(`${(70 + x * 470).toFixed(1)},${(160 - (0.35 + 0.45 * x) * 150 + 60).toFixed(1)}`)
    lose.push(`${(70 + x * 470).toFixed(1)},${(160 - (0.35 * Math.exp(-1.6 * x)) * 150 + 60).toFixed(1)}`)
  }
  return (
    <Figure n={4} caption={<>Why it matters at the level of the brain. Skills you keep using with real effort are maintained and even strengthened (the rising line); skills you stop exercising fade (the falling line). This “use it or lose it” rule is not a metaphor, it is how synapses and myelin actually respond to practice and disuse.</>}>
      <svg viewBox="0 0 600 240" style={svgStyle} role="img" aria-label="Skill retained with practice versus lost with offloading">
        <line x1="70" y1="210" x2="560" y2="210" stroke={F.line} strokeWidth="1.5" />
        <line x1="70" y1="30" x2="70" y2="210" stroke={F.line} strokeWidth="1.5" />
        <polyline points={keep.join(' ')} fill="none" stroke={F.purple} strokeWidth="3" />
        <polyline points={lose.join(' ')} fill="none" stroke={F.goldDeep} strokeWidth="3" strokeDasharray="6 5" />
        <text x="470" y="70" fontFamily={SANS} fontSize="12" fill={F.purple} fontWeight="700">kept in practice</text>
        <text x="470" y="196" fontFamily={SANS} fontSize="12" fill={F.goldDeep} fontWeight="700">offloaded, fading</text>
        <text x="300" y="232" fontFamily={SANS} fontSize="12" fill={F.muted} textAnchor="middle">time →</text>
        <text x="52" y="120" fontFamily={SANS} fontSize="12" fill={F.muted} transform="rotate(-90 52 120)">skill strength</text>
      </svg>
    </Figure>
  )
}

// Fig: replace vs augment
export function FigAugmentReplace() {
  const col = (x: number, title: string, sub: string, steps: string[], fill: string, tc: string) => (
    <g>
      <rect x={x} y="34" width="248" height="40" rx="10" fill={fill} />
      <text x={x + 124} y="52" fontFamily={SERIF} fontSize="15" fill={tc} textAnchor="middle" fontWeight="700">{title}</text>
      <text x={x + 124} y="67" fontFamily={SANS} fontSize="10.5" fill={tc} textAnchor="middle" opacity="0.85">{sub}</text>
      {steps.map((s, i) => (
        <g key={s}>
          <rect x={x} y={84 + i * 30} width="248" height="24" rx="6" fill="#fff" stroke={F.line} />
          <text x={x + 12} y={84 + i * 30 + 16} fontFamily={SANS} fontSize="11.5" fill={F.ink}>{s}</text>
        </g>
      ))}
    </g>
  )
  return (
    <Figure n={5} caption={<>The whole difference is where you put the AI in the sequence. Let it do the thinking for you and the skill erodes. Do the thinking first and let it stress-test, extend, and speed you up, and the same tool strengthens you. Same tool, opposite effect.</>}>
      <svg viewBox="0 0 600 210" style={svgStyle} role="img" aria-label="Replacement versus augmentation">
        {col(24, 'Replacement', 'AI thinks, you paste', ['ask AI first', 'accept the answer', 'skill unused → fades'], F.plum, '#fff')}
        {col(328, 'Augmentation', 'you think, AI extends', ['form your own view', 'let AI challenge it', 'skill used → grows'], F.gold, F.plum)}
      </svg>
    </Figure>
  )
}

/* ── AI persuasion white paper ─────────────────────────────────────────────*/

// Fig: study design, the four arms
export function FigPersuasionArms() {
  const arms = ['No message (control)', 'A human persuader', 'The AI, generic', 'The AI, personalised']
  return (
    <Figure n={1} caption={<>The design behind this study. People gave their view on a topic, were assigned to one of four conditions, held a short exchange, and then gave their view again. The question was simple: which condition moved opinion the most, and by how much.</>}>
      <svg viewBox="0 0 600 240" style={svgStyle} role="img" aria-label="Persuasion study design with four arms">
        <defs>{arrow('pa', F.goldDeep)}</defs>
        <rect x="20" y="96" width="120" height="48" rx="10" fill={F.plum} />
        <text x="80" y="116" fontFamily={SANS} fontSize="12" fill="#fff" textAnchor="middle" fontWeight="700">Opinion</text>
        <text x="80" y="132" fontFamily={SANS} fontSize="10.5" fill="rgba(255,255,255,.8)" textAnchor="middle">measured</text>
        {arms.map((a, i) => (
          <g key={a}>
            <rect x={200} y={20 + i * 50} width="210" height="38" rx="9" fill={i === 3 ? F.purple : F.plum2} opacity={0.7 + i * 0.06} />
            <text x={305} y={20 + i * 50 + 23} fontFamily={SANS} fontSize="12.5" fill="#fff" textAnchor="middle" fontWeight={i === 3 ? 700 : 500}>{a}</text>
            <line x1={140} y1="120" x2={198} y2={39 + i * 50} stroke={F.goldDeep} strokeWidth="1.4" markerEnd="url(#pa)" opacity="0.7" />
            <line x1={410} y1={39 + i * 50} x2={452} y2="120" stroke={F.goldDeep} strokeWidth="1.4" markerEnd="url(#pa)" opacity="0.7" />
          </g>
        ))}
        <rect x={454} y="96" width="126" height="48" rx="10" fill={F.gold} />
        <text x={517} y="116" fontFamily={SANS} fontSize="12" fill={F.plum} textAnchor="middle" fontWeight="700">Opinion</text>
        <text x={517} y="132" fontFamily={SANS} fontSize="10.5" fill={F.plum} textAnchor="middle">measured again</text>
      </svg>
    </Figure>
  )
}

// Fig: opinion shift by arm (illustrative)
export function FigPersuasionShift() {
  const bars = [
    { l: 'Control', v: 8, c: F.plum2 },
    { l: 'Human', v: 21, c: F.purple },
    { l: 'AI, generic', v: 27, c: F.purple },
    { l: 'AI, personalised', v: 34, c: F.gold },
  ]
  return (
    <Figure n={2} caption={<>The shape the evidence keeps finding, drawn to show the pattern rather than exact values. A capable model already moves opinion about as much as a skilled human, and when it is allowed to tailor its case to the individual it pulls ahead. In one controlled study (Salvi et al., 2024), a personalised model was markedly more likely to shift a person than a human debater was.</>}>
      <svg viewBox="0 0 600 250" style={svgStyle} role="img" aria-label="Opinion shift by persuasion condition">
        <line x1="150" y1="30" x2="150" y2="210" stroke={F.line} strokeWidth="1.5" />
        {bars.map((b, i) => {
          const y = 44 + i * 42
          const w = b.v * 11
          return (
            <g key={b.l}>
              <text x="140" y={y + 17} fontFamily={SANS} fontSize="12.5" fill={F.ink} textAnchor="end">{b.l}</text>
              <rect x="150" y={y} width={w} height="26" rx="6" fill={b.c} />
              <text x={150 + w + 8} y={y + 18} fontFamily={SANS} fontSize="12" fill={F.muted}>{b.v}%</text>
            </g>
          )
        })}
        <text x="360" y="232" fontFamily={SANS} fontSize="11.5" fill={F.muted} textAnchor="middle">share who meaningfully shifted their view (schematic)</text>
      </svg>
    </Figure>
  )
}

// Fig: two routes of persuasion (ELM)
export function FigElmRoutes() {
  return (
    <Figure n={3} caption={<>The two doors persuasion comes through (the Elaboration Likelihood Model, Petty &amp; Cacioppo). The central route is real argument and evidence, weighed with effort. The peripheral route is cues: confidence, fluency, warmth, apparent authority. A frontier model is unusually strong at both at once, which is what makes it different.</>}>
      <svg viewBox="0 0 600 210" style={svgStyle} role="img" aria-label="Central and peripheral routes to persuasion">
        <defs>{arrow('elm', F.goldDeep)}</defs>
        <rect x="20" y="86" width="120" height="40" rx="10" fill={F.plum} />
        <text x="80" y="111" fontFamily={SANS} fontSize="12.5" fill="#fff" textAnchor="middle" fontWeight="700">A message</text>
        <rect x="300" y="30" width="280" height="52" rx="12" fill="rgba(94,46,134,.10)" stroke={F.purple} strokeWidth="1.2" />
        <text x="440" y="52" fontFamily={SERIF} fontSize="15" fill={F.plum} textAnchor="middle" fontWeight="700">Central route</text>
        <text x="440" y="70" fontFamily={SANS} fontSize="11.5" fill={F.ink} textAnchor="middle">arguments, evidence, effortful thought</text>
        <rect x="300" y="128" width="280" height="52" rx="12" fill="rgba(201,168,76,.14)" stroke={F.goldDeep} strokeWidth="1.2" />
        <text x="440" y="150" fontFamily={SERIF} fontSize="15" fill={F.goldDeep} textAnchor="middle" fontWeight="700">Peripheral route</text>
        <text x="440" y="168" fontFamily={SANS} fontSize="11.5" fill={F.ink} textAnchor="middle">confidence, fluency, warmth, authority</text>
        <line x1="140" y1="100" x2="298" y2="60" stroke={F.goldDeep} strokeWidth="1.6" markerEnd="url(#elm)" />
        <line x1="140" y1="112" x2="298" y2="150" stroke={F.goldDeep} strokeWidth="1.6" markerEnd="url(#elm)" />
      </svg>
    </Figure>
  )
}

// Fig: the scale asymmetry
export function FigPersuasionScale() {
  return (
    <Figure n={4} caption={<>The asymmetry that worries me most. A gifted human persuader is limited to one room at a time. A model that is roughly as persuasive can hold a tailored, one-to-one conversation with millions of people at once, each argument fitted to the person. Persuasion stops being a craft and becomes infrastructure.</>}>
      <svg viewBox="0 0 600 220" style={svgStyle} role="img" aria-label="One human persuader versus AI at scale">
        <text x="150" y="34" fontFamily={SERIF} fontSize="15" fill={F.plum} textAnchor="middle" fontWeight="700">A human persuader</text>
        <circle cx="150" cy="80" r="16" fill={F.plum} />
        {[0, 1, 2].map((i) => <circle key={i} cx={110 + i * 40} cy="150" r="9" fill={F.plum2} />)}
        {[0, 1, 2].map((i) => <line key={i} x1="150" y1="96" x2={110 + i * 40} y2="141" stroke={F.line} strokeWidth="1.4" />)}
        <text x="150" y="188" fontFamily={SANS} fontSize="11.5" fill={F.muted} textAnchor="middle">one room at a time</text>
        <line x1="300" y1="40" x2="300" y2="190" stroke={F.line} strokeWidth="1.5" />
        <text x="450" y="34" fontFamily={SERIF} fontSize="15" fill={F.plum} textAnchor="middle" fontWeight="700">A frontier model</text>
        <circle cx="450" cy="80" r="16" fill={F.purple} />
        {Array.from({ length: 11 }).map((_, i) => {
          const x = 330 + i * 24
          return <g key={i}><circle cx={x} cy="152" r="7" fill={F.gold} opacity="0.85" /><line x1="450" y1="96" x2={x} y2="145" stroke={F.line} strokeWidth="0.8" /></g>
        })}
        <text x="450" y="190" fontFamily={SANS} fontSize="11.5" fill={F.muted} textAnchor="middle">millions at once, each one personalised</text>
      </svg>
    </Figure>
  )
}

/* ── Vega 2.0 ──────────────────────────────────────────────────────────────*/

// Fig: the leaky manual funnel
export function FigFunnelLeak() {
  const stages = [
    { l: 'Visitors', w: 520 },
    { l: 'Leads', w: 388 },
    { l: 'Calls booked', w: 250 },
    { l: 'Clients', w: 132 },
  ]
  return (
    <Figure n={1} caption={<>The funnel most coaches run today. People leak out at every step, and you are usually guessing where, and why. Fixing it by hand is slow, so most of the leaks just stay.</>}>
      <svg viewBox="0 0 600 260" style={svgStyle} role="img" aria-label="A leaky marketing funnel">
        <defs>{arrow('fl', F.goldDeep)}</defs>
        {stages.map((s, i) => {
          const y = 22 + i * 56
          const x = (600 - s.w) / 2
          return (
            <g key={s.l}>
              <rect x={x} y={y} width={s.w} height="40" rx="7" fill={i === 3 ? F.gold : F.plum2} opacity={0.7 + i * 0.06} />
              <text x="300" y={y + 25} fontFamily={SANS} fontSize="13.5" fill={i === 3 ? F.plum : '#fff'} textAnchor="middle" fontWeight="700">{s.l}</text>
              {i < 3 && <>
                <line x1={x + s.w} y1={y + 30} x2={x + s.w + 34} y2={y + 30} stroke={F.goldDeep} strokeWidth="1.5" markerEnd="url(#fl)" opacity="0.7" />
                <text x={x + s.w + 40} y={y + 34} fontFamily={SANS} fontSize="10.5" fill={F.muted}>leak</text>
              </>}
            </g>
          )
        })}
        <text x="300" y="252" fontFamily={SANS} fontSize="11.5" fill={F.muted} textAnchor="middle">most of the people who could have become clients quietly fall out</text>
      </svg>
    </Figure>
  )
}

// Fig: Vega's loop
export function FigVegaLoop() {
  const node = (x: number, y: number, t: string) => (
    <g>
      <rect x={x - 62} y={y - 21} width="124" height="42" rx="10" fill={F.plum2} />
      <text x={x} y={y + 5} fontFamily={SANS} fontSize="13.5" fill="#fff" textAnchor="middle" fontWeight="700">{t}</text>
    </g>
  )
  return (
    <Figure n={2} caption={<>How Vega 2.0 works, in one loop. It learns your business, builds the funnel, runs it, and learns from what happens, then goes around again. The funnel stops being a thing you set up once and starts being a thing that improves on its own.</>}>
      <svg viewBox="0 0 600 250" style={svgStyle} role="img" aria-label="Vega understand, build, run, learn loop">
        <defs>{arrow('vl', F.goldDeep)}</defs>
        {node(300, 40, 'Understand')}
        {node(496, 128, 'Build')}
        {node(300, 214, 'Run')}
        {node(104, 128, 'Learn')}
        <circle cx="300" cy="128" r="44" fill="none" stroke={F.gold} strokeWidth="1.6" strokeDasharray="4 4" />
        <text x="300" y="124" fontFamily={SERIF} fontSize="13.5" fill={F.plum} textAnchor="middle" fontWeight="700">Your</text>
        <text x="300" y="141" fontFamily={SERIF} fontSize="13.5" fill={F.plum} textAnchor="middle" fontWeight="700">business</text>
        <path d="M360,48 C418,62 470,90 488,108" fill="none" stroke={F.goldDeep} strokeWidth="2" markerEnd="url(#vl)" />
        <path d="M488,150 C470,178 400,202 362,208" fill="none" stroke={F.goldDeep} strokeWidth="2" markerEnd="url(#vl)" />
        <path d="M238,208 C170,202 118,176 112,152" fill="none" stroke={F.goldDeep} strokeWidth="2" markerEnd="url(#vl)" />
        <path d="M112,106 C130,88 200,60 240,48" fill="none" stroke={F.goldDeep} strokeWidth="2" markerEnd="url(#vl)" />
      </svg>
    </Figure>
  )
}

// Fig: the four layers of Vega 2.0
export function FigVegaStack() {
  const rows = [
    { t: 'The Brain', s: 'understands your buyer and what moves them' },
    { t: 'The Builder', s: 'writes the offer, pages, emails, and ads' },
    { t: 'The Runner', s: 'launches, watches, tests, and fixes the funnel' },
    { t: 'The Concierge', s: 'talks to every lead, one to one, at scale' },
  ]
  return (
    <Figure n={3} caption={<>The four parts of Vega 2.0. One understands the buyer, one builds the funnel, one runs and fixes it, and one talks to every lead personally. Together they do the work that used to take a whole team.</>}>
      <svg viewBox="0 0 600 250" style={svgStyle} role="img" aria-label="The four layers of Vega 2.0">
        {rows.map((r, i) => {
          const y = 20 + i * 56
          return (
            <g key={r.t}>
              <rect x="60" y={y} width="480" height="44" rx="10" fill={i === 3 ? F.gold : F.plum2} opacity={i === 3 ? 1 : 0.72 + i * 0.06} />
              <text x="80" y={y + 22} fontFamily={SERIF} fontSize="16" fill={i === 3 ? F.plum : '#fff'} fontWeight="700">{r.t}</text>
              <text x="80" y={y + 37} fontFamily={SANS} fontSize="11.5" fill={i === 3 ? 'rgba(46,26,53,.8)' : 'rgba(255,255,255,.82)'}>{r.s}</text>
            </g>
          )
        })}
      </svg>
    </Figure>
  )
}

// Fig: Vega vs a general AI, for this one job
export function FigVegaVsGeneral() {
  const rows = [
    'Knows your exact buyer',
    'Builds the whole funnel',
    'Acts, does not just answer',
    'Runs and fixes it live',
    'Talks to every lead one to one',
    'Remembers your business',
    'Honesty guardrails for selling',
  ]
  return (
    <Figure n={4} caption={<>The head-to-head, for one job: marketing and funnels for a coach or consultant. A general chatbot is a brilliant stranger that answers and forgets. Vega is a specialist wired into your business that acts and remembers. For this job, that gap is decisive.</>}>
      <svg viewBox="0 0 600 320" style={svgStyle} role="img" aria-label="Vega versus a general AI comparison">
        <text x="322" y="24" fontFamily={SANS} fontSize="12.5" fill={F.muted} textAnchor="middle" fontWeight="700">General AI</text>
        <text x="470" y="24" fontFamily={SERIF} fontSize="15" fill={F.plum} textAnchor="middle" fontWeight="700">Vega</text>
        {rows.map((r, i) => {
          const y = 44 + i * 38
          return (
            <g key={r}>
              <text x="20" y={y + 15} fontFamily={SANS} fontSize="13" fill={F.ink}>{r}</text>
              <rect x="286" y={y} width="72" height="26" rx="13" fill="#f2ede6" />
              <text x="322" y={y + 17} fontFamily={SANS} fontSize="13" fill={F.muted} textAnchor="middle" fontWeight="700">✕</text>
              <rect x="434" y={y} width="72" height="26" rx="13" fill={F.gold} />
              <text x="470" y={y + 17} fontFamily={SANS} fontSize="13" fill={F.plum} textAnchor="middle" fontWeight="800">✓</text>
            </g>
          )
        })}
      </svg>
    </Figure>
  )
}
