'use client'
/* Confirmation page after a successful $27 Whop checkout for the Breakthrough Intensive.
   Lets attendees add each of the 3 live sessions to Google / Apple / Outlook.
   Times default to 11:00 AM ET (EDT, UTC-4 in August). Adjust SESSIONS if the
   real session time differs — the ICS + Google links derive from it. */
import { useMemo } from 'react'

const SERIF = "'Cormorant Garamond', Georgia, serif"
const SANS = "'DM Sans', system-ui, -apple-system, sans-serif"
const PLUM = '#2E1A35'
const GOLD = '#C9A84C'
const GOLD_L = '#E4C879'
const GOLD_DK = '#B0902F'
const PARCH = '#FAF6F0'
const INK = '#1A1A2E'
const MUTE = '#8A8075'
const BORDER = '#E7E0D6'

/* UTC times. 11:00 AM–12:30 PM PT during August (PDT = UTC-7) → 18:00–19:30 UTC.
   Calendar apps convert these Z times to each attendee's local zone. */
const SESSIONS = [
  { label: 'Day 1 · Overcome Your Mental & Money Blocks', date: 'Thursday, August 7, 2026', start: '20260807T180000Z', end: '20260807T193000Z' },
  { label: 'Day 2 · Create Your Offer', date: 'Friday, August 8, 2026', start: '20260808T180000Z', end: '20260808T193000Z' },
  { label: 'Day 3 · Get Better at Sales & Close With Confidence', date: 'Saturday, August 9, 2026', start: '20260809T180000Z', end: '20260809T193000Z' },
]

const TIME_LINE = '11:00 AM PT · 12:00 PM MT · 1:00 PM CT · 2:00 PM ET · 6:00 PM GMT'

const EVENT_DESC =
  'The 3-Day Breakthrough Intensive with Indrodip Ghosh. The joining link will be emailed to you before we go live. Bring a pen, you will be writing, not just listening.'
const LOCATION = 'Online (link emailed before the session)'

const goldBtn: React.CSSProperties = {
  background: `linear-gradient(180deg,${GOLD_L} 0%,${GOLD} 55%,#B8983F 100%)`,
  color: PLUM,
  fontFamily: SANS,
  fontWeight: 700,
  border: 'none',
  cursor: 'pointer',
  borderRadius: 999,
  textDecoration: 'none',
  display: 'inline-flex',
  alignItems: 'center',
  gap: 8,
  fontSize: 13.5,
  padding: '11px 20px',
}

function googleUrl(s: (typeof SESSIONS)[number]) {
  const p = new URLSearchParams({
    action: 'TEMPLATE',
    text: `Breakthrough Intensive · ${s.label}`,
    dates: `${s.start}/${s.end}`,
    details: EVENT_DESC,
    location: LOCATION,
  })
  return `https://calendar.google.com/calendar/render?${p.toString()}`
}

function icsFor(sessions: typeof SESSIONS) {
  const stamp = '20260101T000000Z'
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//The5th Consulting//Breakthrough Intensive//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
  ]
  for (const s of sessions) {
    lines.push(
      'BEGIN:VEVENT',
      `UID:the-shift-${s.start}@the5th.consulting`,
      `DTSTAMP:${stamp}`,
      `DTSTART:${s.start}`,
      `DTEND:${s.end}`,
      `SUMMARY:Breakthrough Intensive · ${s.label}`,
      `DESCRIPTION:${EVENT_DESC}`,
      `LOCATION:${LOCATION}`,
      'BEGIN:VALARM',
      'TRIGGER:-PT30M',
      'ACTION:DISPLAY',
      'DESCRIPTION:The Breakthrough Intensive starts in 30 minutes',
      'END:VALARM',
      'END:VEVENT',
    )
  }
  lines.push('END:VCALENDAR')
  return lines.join('\r\n')
}

export default function ThankYouView() {
  // Data-URI .ics works for Apple Calendar / Outlook downloads on click.
  const allIcs = useMemo(
    () => `data:text/calendar;charset=utf-8,${encodeURIComponent(icsFor(SESSIONS))}`,
    [],
  )
  const singleIcs = (s: (typeof SESSIONS)[number]) =>
    `data:text/calendar;charset=utf-8,${encodeURIComponent(icsFor([s]))}`

  return (
    <div style={{ minHeight: '100dvh', background: PARCH, color: INK, fontFamily: SANS }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600;700&family=DM+Sans:wght@400;500;600;700&display=swap');
        @keyframes rise{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
        .ty-row{display:flex;gap:10px;flex-wrap:wrap}
      `}</style>

      <header style={{ padding: '22px', display: 'flex', justifyContent: 'center' }}>
        <a href="/"><img src="/images/logo.png" alt="The5th Consulting" style={{ height: 34 }} /></a>
      </header>

      <main style={{ maxWidth: 640, margin: '0 auto', padding: '18px 22px 70px', animation: 'rise .5s ease' }}>
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              width: 62,
              height: 62,
              borderRadius: '50%',
              margin: '0 auto',
              background: 'linear-gradient(180deg,#eaf7ef,#d6efe0)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#1C4A32" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <div style={{ fontFamily: SANS, fontSize: 12, fontWeight: 700, letterSpacing: '.22em', textTransform: 'uppercase', color: GOLD_DK, marginTop: 20 }}>
            You’re in
          </div>
          <h1 style={{ fontFamily: SERIF, fontSize: 'clamp(30px,6vw,44px)', color: PLUM, margin: '10px 0 0', lineHeight: 1.08 }}>
            Your seat for the Breakthrough Intensive is confirmed.
          </h1>
          <p style={{ fontSize: 16.5, color: '#5a5248', lineHeight: 1.65, marginTop: 16 }}>
            A confirmation email is on its way with your joining link. The most important next step:{' '}
            <strong>add all three sessions to your calendar right now</strong> so nothing gets in the way.
          </p>
        </div>

        {/* Add all three */}
        <div style={{ textAlign: 'center', marginTop: 26 }}>
          <a href={allIcs} download="the-shift-all-sessions.ics" style={{ ...goldBtn, fontSize: 14.5, padding: '14px 26px' }}>
            📅 Add all 3 days (Apple / Outlook)
          </a>
        </div>

        {/* Per-day cards */}
        <div style={{ marginTop: 26, display: 'grid', gap: 14 }}>
          {SESSIONS.map((s) => (
            <div key={s.start} style={{ background: '#fff', border: `1px solid ${BORDER}`, borderRadius: 18, padding: '20px 22px' }}>
              <div style={{ fontFamily: SERIF, fontSize: 21, color: PLUM, lineHeight: 1.2 }}>{s.label}</div>
              <div style={{ fontSize: 13.5, color: INK, fontWeight: 600, margin: '6px 0 2px' }}>{s.date}</div>
              <div style={{ fontSize: 12.5, color: MUTE, margin: '0 0 14px' }}>{TIME_LINE}</div>
              <div className="ty-row">
                <a href={googleUrl(s)} target="_blank" rel="noopener noreferrer" style={{ ...goldBtn, background: '#fff', color: PLUM, border: `1px solid ${BORDER}` }}>
                  Add to Google
                </a>
                <a href={singleIcs(s)} download={`the-shift-${s.start.slice(0, 8)}.ics`} style={{ ...goldBtn, background: '#fff', color: PLUM, border: `1px solid ${BORDER}` }}>
                  Apple / Outlook
                </a>
              </div>
            </div>
          ))}
        </div>

        <div
          style={{
            marginTop: 26,
            background: '#FBF8F3',
            border: `1px solid ${BORDER}`,
            borderRadius: 16,
            padding: '18px 20px',
            fontSize: 14.5,
            color: '#5a5248',
            lineHeight: 1.6,
          }}
        >
          <strong style={{ color: PLUM }}>One small ask:</strong> show up live if you possibly can. The hot-seat
          coaching, where your offer and your words get workshopped in real time, only happens live. Replays are
          included, but the breakthroughs happen in the room.
        </div>

        <div style={{ textAlign: 'center', marginTop: 30 }}>
          <a href="/" style={{ fontSize: 14, color: GOLD_DK, textDecoration: 'none' }}>
            ← Back to the5th.consulting
          </a>
        </div>
      </main>
    </div>
  )
}
