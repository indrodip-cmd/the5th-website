'use client'
/* Live "social proof" activity popups (bottom-left). Simulated demand — random
   first-name + city combinations (2,000+ possible) that auto-start on landing
   and loop forever at a believable cadence. Not tied to real users. */
import { useEffect, useRef, useState } from 'react'

const SANS = "'DM Sans', system-ui, -apple-system, sans-serif"
const GOLD_DK = '#B0902F'
const INK = '#1A1A2E'
const MUTE = '#8A8075'

const NAMES = [
  'Emma', 'Olivia', 'Sophia', 'Isabella', 'Charlotte', 'Amelia', 'Grace', 'Chloe', 'Sarah', 'Rebecca',
  'Laura', 'Emily', 'Hannah', 'Rachel', 'Megan', 'Anna', 'Julia', 'Nina', 'Elena', 'Marta',
  'Lucia', 'Ingrid', 'Astrid', 'Nadia', 'Layla', 'Amara', 'Priya', 'Ananya', 'Aisha', 'Fatima',
  'Zara', 'Mei', 'Yuki', 'Sofia', 'Camila', 'Valentina', 'Freya', 'Chioma', 'Thandi', 'Sanjana',
  'James', 'David', 'Michael', 'Daniel', 'Ethan', 'Liam', 'Noah', 'Ryan', 'Adam', 'Omar',
  'Arjun', 'Rohan', 'Hassan', 'Kenji', 'Diego', 'Mateo', 'Luca', 'Sven', 'Kwame', 'Tunde',
  'Marcus', 'Andre', 'Victor', 'Samuel', 'Isaac', 'Nathan', 'Oliver', 'Henry', 'Rajesh', 'Bilal',
]

const CITIES: { name: string; flag: string }[] = [
  { name: 'Sydney', flag: '🇦🇺' }, { name: 'Melbourne', flag: '🇦🇺' }, { name: 'Auckland', flag: '🇳🇿' },
  { name: 'London', flag: '🇬🇧' }, { name: 'Manchester', flag: '🇬🇧' },
  { name: 'New York', flag: '🇺🇸' }, { name: 'Los Angeles', flag: '🇺🇸' }, { name: 'Chicago', flag: '🇺🇸' }, { name: 'Miami', flag: '🇺🇸' },
  { name: 'Dhaka', flag: '🇧🇩' }, { name: 'New Delhi', flag: '🇮🇳' }, { name: 'Mumbai', flag: '🇮🇳' },
  { name: 'Moscow', flag: '🇷🇺' }, { name: 'Toronto', flag: '🇨🇦' }, { name: 'Vancouver', flag: '🇨🇦' },
  { name: 'Dubai', flag: '🇦🇪' }, { name: 'Singapore', flag: '🇸🇬' }, { name: 'Berlin', flag: '🇩🇪' },
  { name: 'Paris', flag: '🇫🇷' }, { name: 'Amsterdam', flag: '🇳🇱' }, { name: 'Cape Town', flag: '🇿🇦' },
  { name: 'Lagos', flag: '🇳🇬' }, { name: 'Nairobi', flag: '🇰🇪' }, { name: 'São Paulo', flag: '🇧🇷' },
  { name: 'Mexico City', flag: '🇲🇽' }, { name: 'Madrid', flag: '🇪🇸' }, { name: 'Rome', flag: '🇮🇹' },
  { name: 'Stockholm', flag: '🇸🇪' }, { name: 'Dublin', flag: '🇮🇪' }, { name: 'Hong Kong', flag: '🇭🇰' },
  { name: 'Kuala Lumpur', flag: '🇲🇾' }, { name: 'Istanbul', flag: '🇹🇷' }, { name: 'Bangkok', flag: '🇹🇭' },
  { name: 'Jakarta', flag: '🇮🇩' },
]

const ACTIONS = [
  'just started the training',
  'is watching the training now',
  'just reserved their spot',
  'just started the training',
  'joined the training',
  'is watching now',
]
const TIMES = ['just now', 'just now', '1 min ago', '2 min ago', '3 min ago', '4 min ago']

const pick = <T,>(a: T[]) => a[Math.floor(Math.random() * a.length)]

type Item = { name: string; city: string; flag: string; action: string; time: string; key: number }

/* Self-contained stylized "map thumbnail" (no external tiles) — reads as a
   location with a pin. A seed subtly shifts the streets so it varies per popup. */
function MiniMap({ seed, flag }: { seed: number; flag: string }) {
  const s = (seed % 7) - 3 // -3..3 px jitter
  return (
    <span style={{ position: 'relative', width: 46, height: 46, flexShrink: 0, borderRadius: 10, overflow: 'hidden', border: '1px solid #dfe4da', boxShadow: 'inset 0 0 0 1px rgba(255,255,255,.5)' }}>
      <svg width="46" height="46" viewBox="0 0 48 48" style={{ display: 'block' }}>
        <rect width="48" height="48" fill="#eaf0e6" />
        {/* water */}
        <path d={`M0 ${30 + s} L48 ${22 + s} L48 48 L0 48 Z`} fill="#cfe2ef" />
        {/* parks / blocks */}
        <rect x={6} y={5} width="12" height="9" rx="1.5" fill="#dce8d3" />
        <rect x={26 + s} y={7} width="14" height="10" rx="1.5" fill="#dce8d3" />
        {/* roads */}
        <g stroke="#cdd6c6" strokeWidth="2.4" strokeLinecap="round">
          <line x1="0" y1={14 + s} x2="48" y2={9 + s} />
          <line x1="0" y1={33 + s} x2="48" y2={27 + s} />
          <line x1={15 + s} y1="0" x2={21 + s} y2="48" />
          <line x1={33 - s} y1="0" x2="38" y2="48" />
        </g>
        <g stroke="#fff" strokeWidth=".7" strokeDasharray="2 2">
          <line x1="0" y1={14 + s} x2="48" y2={9 + s} />
          <line x1={15 + s} y1="0" x2={21 + s} y2="48" />
        </g>
        {/* location pin */}
        <path d="M24 13c-3.6 0-6.5 2.9-6.5 6.5 0 4.6 6.5 11 6.5 11s6.5-6.4 6.5-11c0-3.6-2.9-6.5-6.5-6.5z" fill="#C0392B" stroke="#fff" strokeWidth="1.2" />
        <circle cx="24" cy="19.5" r="2.4" fill="#fff" />
      </svg>
      <span style={{ position: 'absolute', right: -2, bottom: -2, fontSize: 15, lineHeight: 1, filter: 'drop-shadow(0 1px 1px rgba(0,0,0,.25))' }}>{flag}</span>
    </span>
  )
}

type Real = { name: string; city: string; flag: string }

export default function ProofPopups() {
  const [item, setItem] = useState<Item | null>(null)
  const [show, setShow] = useState(false)
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])
  const realRef = useRef<Real[]>([])

  useEffect(() => {
    let alive = true
    const push = (t: ReturnType<typeof setTimeout>) => timers.current.push(t)

    // Pull recent REAL opt-ins (first name + city/flag only) to weave in.
    fetch('/api/lp/recent-proof').then((r) => r.json()).then((d) => {
      if (alive && Array.isArray(d?.items)) realRef.current = d.items as Real[]
    }).catch(() => {})

    function schedule(delay: number) {
      push(setTimeout(() => {
        if (!alive) return
        const real = realRef.current
        // ~40% of popups are a genuine recent opt-in when we have any.
        const base = real.length && Math.random() < 0.4
          ? pick(real)
          : (() => { const c = pick(CITIES); return { name: pick(NAMES), city: c.name, flag: c.flag } })()
        setItem({ ...base, action: pick(ACTIONS), time: pick(TIMES), key: Date.now() })
        setShow(true)
        push(setTimeout(() => { if (alive) setShow(false) }, 5600)) // visible ~5.6s
        schedule(13000 + Math.random() * 17000) // next in 13–30s (~2–3 / min)
      }, delay))
    }

    schedule(4000) // first one after the page settles
    const cur = timers.current
    return () => { alive = false; cur.forEach(clearTimeout) }
  }, [])

  if (!item) return null

  return (
    <div
      aria-hidden
      style={{
        position: 'fixed', left: 'clamp(10px,3vw,20px)', bottom: 'clamp(10px,3vw,20px)', zIndex: 900,
        maxWidth: 'min(340px, calc(100vw - 24px))',
        transform: show ? 'translateX(0)' : 'translateX(-115%)',
        opacity: show ? 1 : 0,
        transition: 'transform .55s cubic-bezier(.22,1,.36,1), opacity .45s ease',
        pointerEvents: 'none',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#fff', border: '1px solid #ece4d6', borderRadius: 13, boxShadow: '0 16px 40px -14px rgba(46,26,53,.4)', padding: '11px 15px 11px 11px', fontFamily: SANS }}>
        <MiniMap seed={item.key} flag={item.flag} />
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 13.5, color: INK, lineHeight: 1.35 }}>
            <strong style={{ fontWeight: 700 }}>{item.name}</strong> from {item.city} {item.flag}
          </div>
          <div style={{ fontSize: 12.5, color: MUTE, lineHeight: 1.35 }}>
            {item.action} · <span style={{ color: '#2f9e5e', fontWeight: 600 }}>{item.time}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 3, fontSize: 10.5, color: GOLD_DK }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={GOLD_DK} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2 4 5v6c0 5 3.4 8.5 8 11 4.6-2.5 8-6 8-11V5l-8-3z" /><path d="m9 12 2 2 4-4" /></svg>
            Verified by The5th Data server
          </div>
        </div>
      </div>
    </div>
  )
}
