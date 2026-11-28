import React from 'react'

/* Generative editorial illustrations, one distinct motif per article.
   Pure SVG, deterministic, no assets. Each is drawn in a 1200x500 field
   and scaled with preserveAspectRatio="xMidYMid slice". */

const GOLD = '#C9A84C'
const GOLD_L = '#E4C879'
const BG = ['#3a2145', '#241129', '#160a1b']

function rnd(seed: number) {
  let s = seed >>> 0
  return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296 }
}
function hash(str: string) { let h = 7; for (let i = 0; i < str.length; i++) h = (h * 33 + str.charCodeAt(i)) >>> 0; return h }

function Persuasion() {
  // concentric ripples from a source, bending streams toward a crowd of dots
  const r = rnd(11)
  const dots = Array.from({ length: 70 }, () => ({ x: 640 + r() * 520, y: 40 + r() * 420, a: r() }))
  return (<>
    <g fill="none" stroke={GOLD} strokeWidth="1">
      {Array.from({ length: 11 }, (_, i) => <circle key={i} cx="210" cy="250" r={40 + i * 44} strokeOpacity={0.55 - i * 0.045} />)}
    </g>
    <g fill="none" stroke={GOLD_L} strokeWidth="1.2" strokeOpacity=".5">
      {Array.from({ length: 9 }, (_, i) => <path key={i} d={`M210,250 C ${420 + i * 8},${60 + i * 46} ${560},${400 - i * 40} ${700 + i * 38},${90 + i * 40}`} />)}
    </g>
    {dots.map((d, i) => <circle key={i} cx={d.x} cy={d.y} r={2 + d.a * 3.2} fill={d.a > 0.6 ? GOLD : '#fff'} opacity={0.2 + d.a * 0.6} />)}
    <circle cx="210" cy="250" r="14" fill={GOLD} /><circle cx="210" cy="250" r="30" fill="none" stroke={GOLD} strokeOpacity=".6" />
  </>)
}
function Tone() {
  const a = ['A', 'a', 'E', 'e', 'R', 'S', 'T', 'N']
  const h = ['अ', 'आ', 'क', 'ख', 'म', 'न', 'स', 'र']
  const r = rnd(5)
  return (<>
    <line x1="600" y1="0" x2="600" y2="500" stroke={GOLD} strokeOpacity=".5" strokeDasharray="4 8" />
    {Array.from({ length: 24 }, (_, i) => {
      const left = i % 2 === 0
      const x = left ? 80 + r() * 460 : 660 + r() * 460
      const y = 30 + r() * 440
      const s = 22 + r() * 54
      return <text key={i} x={x} y={y} fontSize={s} fontFamily="Georgia, 'Noto Serif Devanagari', serif" fill={left ? '#fff' : GOLD} opacity={0.12 + r() * 0.4}>{left ? a[i % 8] : h[i % 8]}</text>
    })}
    <path d="M120,370 C 300,250 420,420 600,300 S 900,200 1080,300" fill="none" stroke={GOLD_L} strokeWidth="2" strokeOpacity=".7" />
  </>)
}
function Expertise() {
  const r = rnd(21)
  const pts = Array.from({ length: 34 }, () => ({ x: 60 + r() * 1080, y: 40 + r() * 420 }))
  const c = { x: 600, y: 250 }
  return (<>
    {pts.map((p, i) => <line key={i} x1={c.x} y1={c.y} x2={p.x} y2={p.y} stroke={GOLD} strokeOpacity={0.1 + (i % 5) * 0.05} />)}
    {pts.map((p, i) => i < 33 && ((i * 7) % 3 === 0) ? <line key={'l' + i} x1={p.x} y1={p.y} x2={pts[i + 1].x} y2={pts[i + 1].y} stroke="#fff" strokeOpacity=".08" /> : null)}
    {pts.map((p, i) => <circle key={'c' + i} cx={p.x} cy={p.y} r={3 + (i % 4) * 1.6} fill={i % 6 === 0 ? GOLD : '#fff'} opacity={i % 6 === 0 ? 0.95 : 0.4} />)}
    <circle cx={c.x} cy={c.y} r="22" fill={GOLD} /><circle cx={c.x} cy={c.y} r="46" fill="none" stroke={GOLD} strokeOpacity=".5" /><circle cx={c.x} cy={c.y} r="78" fill="none" stroke={GOLD} strokeOpacity=".25" />
  </>)
}
function BrainBridge() {
  const r = rnd(33)
  const L = Array.from({ length: 22 }, () => ({ x: 70 + r() * 300, y: 60 + r() * 380 }))
  const Rn = Array.from({ length: 22 }, () => ({ x: 830 + r() * 300, y: 60 + r() * 380 }))
  return (<>
    {L.map((p, i) => <line key={'a' + i} x1={p.x} y1={p.y} x2={L[(i + 3) % 22].x} y2={L[(i + 3) % 22].y} stroke="#fff" strokeOpacity=".12" />)}
    {Rn.map((p, i) => <line key={'b' + i} x1={p.x} y1={p.y} x2={Rn[(i + 5) % 22].x} y2={Rn[(i + 5) % 22].y} stroke={GOLD} strokeOpacity=".2" />)}
    {Array.from({ length: 9 }, (_, i) => <path key={i} d={`M${L[i].x},${L[i].y} C 520,${L[i].y - 70 + i * 16} 680,${Rn[i].y + 70 - i * 16} ${Rn[i].x},${Rn[i].y}`} fill="none" stroke={GOLD_L} strokeOpacity=".55" strokeWidth="1.3" />)}
    {L.map((p, i) => <circle key={'x' + i} cx={p.x} cy={p.y} r={3.5 + (i % 3)} fill="#fff" opacity=".55" />)}
    {Rn.map((p, i) => <circle key={'y' + i} cx={p.x} cy={p.y} r={3.5 + (i % 3)} fill={GOLD} opacity=".85" />)}
  </>)
}
function Consciousness() {
  return (<>
    <g fill="none" stroke={GOLD}>
      {[70, 120, 175, 235, 300].map((rx, i) => <ellipse key={i} cx="600" cy="250" rx={rx * 1.55} ry={rx * .62} strokeOpacity={0.5 - i * 0.08} transform={`rotate(${-18 + i * 9} 600 250)`} />)}
    </g>
    <circle cx="600" cy="250" r="64" fill="none" stroke="#fff" strokeOpacity=".6" strokeWidth="1.4" />
    <circle cx="600" cy="250" r="30" fill={GOLD} /><circle cx="612" cy="238" r="9" fill="#fff" opacity=".85" />
    {Array.from({ length: 36 }, (_, i) => { const a = (i / 36) * Math.PI * 2; return <line key={i} x1={600 + Math.cos(a) * 82} y1={250 + Math.sin(a) * 82} x2={600 + Math.cos(a) * 112} y2={250 + Math.sin(a) * 112} stroke={GOLD_L} strokeOpacity=".45" /> })}
  </>)
}
function Funnel() {
  const layers = 7
  return (<>
    {Array.from({ length: layers }, (_, i) => {
      const w = 980 - i * 130, y = 60 + i * 58
      return <g key={i}><path d={`M${600 - w / 2},${y} L${600 + w / 2},${y} L${600 + w / 2 - 65},${y + 44} L${600 - w / 2 + 65},${y + 44} Z`} fill={i % 2 ? 'rgba(255,255,255,.05)' : 'rgba(201,168,76,.12)'} stroke={GOLD} strokeOpacity={0.55 - i * 0.05} /></g>
    })}
    {Array.from({ length: 26 }, (_, i) => { const r = rnd(i + 3); return <circle key={i} cx={260 + r() * 680} cy={20 + (i * 16) % 360} r="3" fill={GOLD_L} opacity={0.25 + r() * .55} /> })}
    <circle cx="600" cy="452" r="12" fill={GOLD} />
  </>)
}
function Agents() {
  const steps = [0, 1, 2, 3, 4]
  return (<>
    {steps.map((i) => (
      <g key={i}>
        <rect x={80 + i * 218} y={330 - i * 62} width="170" height={90 + i * 62} rx="14" fill={`rgba(201,168,76,${0.05 + i * 0.05})`} stroke={GOLD} strokeOpacity={0.3 + i * 0.12} />
        {i > 0 && <path d={`M${80 + i * 218 - 30},${340 - (i - 1) * 62} L${80 + i * 218 - 4},${340 - i * 62}`} stroke={GOLD_L} strokeWidth="2" markerEnd="none" strokeOpacity=".7" />}
        <circle cx={165 + i * 218} cy={354 - i * 62} r={5 + i * 2} fill={i === 4 ? GOLD : '#fff'} opacity={i === 4 ? 1 : 0.5} />
      </g>
    ))}
    <path d="M165,354 L383,292 L601,230 L819,168 L1037,106" fill="none" stroke={GOLD_L} strokeWidth="2" strokeDasharray="2 7" strokeLinecap="round" />
  </>)
}
function Thinking() {
  const r = rnd(9)
  return (<>
    {Array.from({ length: 14 }, (_, row) => Array.from({ length: 34 }, (_, col) => {
      const fade = col / 34
      const live = r() > fade * 1.05
      return <circle key={row + '-' + col} cx={50 + col * 34} cy={40 + row * 31} r={live ? 4.2 : 1.6} fill={live ? GOLD : '#fff'} opacity={live ? 0.9 - fade * 0.5 : 0.18} />
    }))}
    <path d="M40,440 C 300,360 520,420 780,260 S 1060,140 1160,90" fill="none" stroke={GOLD_L} strokeWidth="1.6" strokeOpacity=".7" />
  </>)
}
function Agencies() {
  const r = rnd(17)
  return (<>
    {Array.from({ length: 9 }, (_, row) => Array.from({ length: 22 }, (_, col) => {
      const gone = col > 5 + row * 1.3 && r() > 0.25
      const x = 80 + col * 50, y = 50 + row * 46
      return <rect key={row + '-' + col} x={x} y={gone ? y + (r() * 40) : y} width="34" height="30" rx="6" fill={gone ? 'none' : 'rgba(201,168,76,.16)'} stroke={GOLD} strokeOpacity={gone ? 0.25 : 0.6} strokeDasharray={gone ? '3 4' : undefined} opacity={gone ? 0.6 : 1} />
    }))}
    <circle cx="1050" cy="110" r="46" fill="none" stroke={GOLD_L} strokeOpacity=".5" /><circle cx="1050" cy="110" r="10" fill={GOLD} />
  </>)
}

function Cart() {
  const r = rnd(41)
  return (<>
    {Array.from({ length: 40 }, (_, i) => <circle key={i} cx={80 + r() * 560} cy={40 + r() * 420} r={2 + r() * 3} fill={r() > 0.7 ? GOLD : '#fff'} opacity={0.15 + r() * 0.5} />)}
    <g fill="none" stroke={GOLD} strokeWidth="2" strokeOpacity=".85" strokeLinejoin="round" strokeLinecap="round">
      <path d="M720,140 L780,140 L830,300 L1010,300 L1050,190 L800,190" />
      <circle cx="850" cy="350" r="16" /><circle cx="990" cy="350" r="16" />
    </g>
    <g fill="none" stroke={GOLD_L} strokeOpacity=".5">
      {[60, 100, 140, 190].map((q) => <circle key={q} cx="910" cy="235" r={q + 120} />)}
    </g>
    <circle cx="930" cy="240" r="30" fill={GOLD} opacity=".9" /><circle cx="930" cy="240" r="12" fill="#2a1433" />
    {Array.from({ length: 8 }, (_, i) => <path key={i} d={`M${200 + i * 60},${100 + i * 40} C 500,${60 + i * 50} 700,${220} 900,240`} fill="none" stroke={GOLD_L} strokeOpacity=".3" />)}
  </>)
}

const MOTIFS: Record<string, () => React.JSX.Element> = {
  'how-ai-is-changing-how-people-buy': Cart,
  'how-persuasive-is-frontier-ai': Persuasion,
  'chatgpt-tone-hindi-english': Tone,
  'how-people-buy-expertise': Expertise,
  'brain-ai-algorithmic-bridge': BrainBridge,
  'machine-consciousness-2035': Consciousness,
  'vega-2-marketing-funnels-automation': Funnel,
  'future-of-ai-from-tools-to-agents': Agents,
  'is-ai-eroding-critical-thinking': Thinking,
  'agi-society-and-the-end-of-b2b-agencies': Agencies,
}

export function HeroArt({ slug, height = 280, rounded = 0, label }: { slug: string; height?: number | string; rounded?: number; label?: string }) {
  const Motif = MOTIFS[slug]
  const gid = 'ha' + (hash(slug) % 9999)
  return (
    <div role="img" aria-label={label ?? 'Illustration for this research'} style={{ position: 'relative', height, overflow: 'hidden', borderRadius: rounded, background: `linear-gradient(150deg, ${BG[0]} 0%, ${BG[1]} 58%, ${BG[2]} 100%)` }}>
      <svg viewBox="0 0 1200 500" preserveAspectRatio="xMidYMid slice" aria-hidden style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
        <defs>
          <radialGradient id={gid} cx="72%" cy="30%" r="70%"><stop offset="0" stopColor="#E4C879" stopOpacity=".22" /><stop offset="1" stopColor="#E4C879" stopOpacity="0" /></radialGradient>
        </defs>
        <rect width="1200" height="500" fill={`url(#${gid})`} />
        {Motif ? <Motif /> : null}
      </svg>
      <div style={{ position: 'absolute', inset: 0, boxShadow: 'inset 0 0 0 1px rgba(255,255,255,.06), inset 0 -70px 90px -50px rgba(0,0,0,.45)' }} />
    </div>
  )
}
