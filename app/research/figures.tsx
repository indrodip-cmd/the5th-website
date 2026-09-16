import React from 'react'
import { C } from './ui'

/* Hand-built, dependency-free SVG figures for Research articles — charts and
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
    <Figure n={1} caption={<>The prospect-theory value function (Kahneman &amp; Tversky, 1979). Value is measured from a reference point; the curve is markedly steeper for losses than for gains (λ ≈ 2.25). The dashed line mirrors the gain curve to make the loss asymmetry visible — a loss of a given size hurts about twice as much as the same-size gain pleases.</>}>
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
    <Figure n={2} caption={<>The evaluability spectrum (Nelson, 1970; Darby &amp; Karni, 1973). Expert services sit at the far end: their core value is a <em>credence</em> quality, difficult to verify even after consumption — which is why buyers fall back on proxies for quality rather than the quality itself.</>}>
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
        <text x="556" y="170" fontFamily={SANS} fontSize="12.5" fill={F.goldDeep} textAnchor="end" fontWeight="700">harder to evaluate — where coaching/consulting lives</text>
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
    <Figure n={3} caption={<>The tripartite model of trustworthiness (Mayer, Davis &amp; Schoorman, 1995). Perceived ability, benevolence, and integrity combine into trust, which licenses risk-taking only when it exceeds the risk the situation demands — the pivot of the whole purchase.</>}>
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
    <Figure n={1} caption={<>Two senses of “consciousness” (Block). Access consciousness is information globally available for report and control; phenomenal consciousness is felt experience. Ordinary human awareness lives in the overlap — and the open question is whether a machine could occupy the left circle without the right.</>}>
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
    <Figure n={2} caption={<>Global-workspace “ignition” (Dehaene). Below a threshold, stimuli are processed locally and briefly; once the threshold is crossed, a nonlinear, all-or-nothing surge broadcasts the content system-wide. Consciousness, on this view, is the sudden jump — not the gradual ramp.</>}>
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
    <Figure n={1} caption={<>The weight-transport problem and its dissolution. Backpropagation (left) needs the exact transpose Wᵀ for the backward pass — biologically implausible. Feedback alignment (right) replaces it with a fixed random matrix B; the forward weights learn to align with it, and the network still trains (Lillicrap et al., 2016).</>}>
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
    <Figure n={2} caption={<>Predictive coding. Each level sends predictions downward; only the residual prediction error ascends. Inference and learning both descend the same free-energy gradient with strictly local updates — which, at equilibrium, recover the backpropagation gradients (Rao &amp; Ballard, 1999; Whittington &amp; Bogacz, 2017).</>}>
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
    <Figure n={3} caption={<>Representational geometry and untangling (Chung, Lee &amp; Sompolinsky; DiCarlo &amp; Cox). Early in a hierarchy, category manifolds are entangled and not linearly separable (left); a good hierarchy — biological or artificial — reshapes the geometry so a simple linear readout can separate them (right). The same transformation is measured in cortex and in deep networks.</>}>
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
