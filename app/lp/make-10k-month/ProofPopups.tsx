'use client'
/* Live "social proof" activity popups (bottom-left). Simulated demand — random
   first-name + city combinations (2,000+ possible) that auto-start on landing
   and loop forever at a believable cadence. Not tied to real users. */
import { useEffect, useRef, useState } from 'react'

const SANS = "'DM Sans', system-ui, -apple-system, sans-serif"
const PLUM = '#2E1A35'
const PLUM_MID = '#4E3158'
const GOLD = '#C9A84C'
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

const CITIES = [
  'Sydney', 'London', 'New York', 'Dhaka', 'New Delhi', 'Moscow', 'Toronto', 'Dubai', 'Singapore',
  'Mumbai', 'Berlin', 'Paris', 'Amsterdam', 'Melbourne', 'Auckland', 'Cape Town', 'Lagos', 'Nairobi',
  'São Paulo', 'Mexico City', 'Madrid', 'Rome', 'Stockholm', 'Dublin', 'Manchester', 'Vancouver',
  'Los Angeles', 'Chicago', 'Miami', 'Hong Kong', 'Kuala Lumpur', 'Istanbul', 'Bangkok', 'Jakarta', 'Toronto',
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

type Item = { name: string; city: string; action: string; time: string; key: number }

export default function ProofPopups() {
  const [item, setItem] = useState<Item | null>(null)
  const [show, setShow] = useState(false)
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])

  useEffect(() => {
    let alive = true
    const push = (t: ReturnType<typeof setTimeout>) => timers.current.push(t)

    function schedule(delay: number) {
      push(setTimeout(() => {
        if (!alive) return
        setItem({ name: pick(NAMES), city: pick(CITIES), action: pick(ACTIONS), time: pick(TIMES), key: Date.now() })
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
        maxWidth: 'min(330px, calc(100vw - 24px))',
        transform: show ? 'translateX(0)' : 'translateX(-115%)',
        opacity: show ? 1 : 0,
        transition: 'transform .55s cubic-bezier(.22,1,.36,1), opacity .45s ease',
        pointerEvents: 'none',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#fff', border: '1px solid #ece4d6', borderRadius: 13, boxShadow: '0 16px 40px -14px rgba(46,26,53,.4)', padding: '11px 15px 11px 12px', fontFamily: SANS }}>
        <span style={{ position: 'relative', width: 40, height: 40, flexShrink: 0, borderRadius: '50%', background: `linear-gradient(160deg,${PLUM_MID},${PLUM})`, color: GOLD, fontWeight: 700, fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {item.name.charAt(0)}
          <span style={{ position: 'absolute', right: -1, bottom: -1, width: 12, height: 12, borderRadius: '50%', background: '#2fbf71', border: '2px solid #fff' }} />
        </span>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 13.5, color: INK, lineHeight: 1.35 }}>
            <strong style={{ fontWeight: 700 }}>{item.name}</strong> from {item.city}
          </div>
          <div style={{ fontSize: 12.5, color: MUTE, lineHeight: 1.35 }}>
            {item.action} · <span style={{ color: '#2f9e5e', fontWeight: 600 }}>{item.time}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
