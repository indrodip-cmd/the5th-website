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

/* Mandatory WhatsApp community — all joining links, reminders and last-minute
   updates go out here first. */
const WHATSAPP_URL = 'https://chat.whatsapp.com/BDStDEgHpXeC2hNaxfXCpR'

/* 20260807T180000Z -> 2026-08-07T18:00:00Z (ISO, needed by Outlook deep links) */
function toIso(compact: string) {
  return `${compact.slice(0, 4)}-${compact.slice(4, 6)}-${compact.slice(6, 8)}T${compact.slice(9, 11)}:${compact.slice(11, 13)}:${compact.slice(13, 15)}Z`
}

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

/* Microsoft: Outlook.com (personal) deep link. Works for outlook.com /
   hotmail / live accounts; office.com work accounts are redirected in. */
function outlookUrl(s: (typeof SESSIONS)[number]) {
  const p = new URLSearchParams({
    path: '/calendar/action/compose',
    rru: 'addevent',
    subject: `Breakthrough Intensive · ${s.label}`,
    startdt: toIso(s.start),
    enddt: toIso(s.end),
    body: EVENT_DESC,
    location: LOCATION,
  })
  return `https://outlook.live.com/calendar/0/deeplink/compose?${p.toString()}`
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
            A confirmation email is on its way. Now do these two things right now:{' '}
            <strong>join the WhatsApp community</strong> (that’s where your joining link lives) and{' '}
            <strong>add all three sessions to your calendar</strong> so nothing gets in the way.
          </p>
        </div>

        {/* Step 1 — mandatory WhatsApp community */}
        <div
          style={{
            marginTop: 30,
            background: 'linear-gradient(180deg,#ffffff, #f2fbf4)',
            border: '2px solid #25D366',
            borderRadius: 20,
            padding: '24px 22px',
            textAlign: 'center',
            boxShadow: '0 22px 50px -34px rgba(37,211,102,.6)',
          }}
        >
          <div style={{ fontFamily: SANS, fontSize: 12, fontWeight: 700, letterSpacing: '.2em', textTransform: 'uppercase', color: '#128C4B' }}>
            Step 1 · Required
          </div>
          <h2 style={{ fontFamily: SERIF, fontSize: 'clamp(23px,4.6vw,30px)', color: PLUM, margin: '8px 0 0', lineHeight: 1.15 }}>
            Join the WhatsApp community now.
          </h2>
          <p style={{ fontSize: 15, color: '#4f5a50', lineHeight: 1.6, margin: '12px auto 0', maxWidth: 460 }}>
            This is <strong>mandatory</strong>. Every joining link, reminder and last-minute update is sent in the
            WhatsApp group first. If you’re not in it, you risk missing the session.
          </p>
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              ...goldBtn,
              background: 'linear-gradient(180deg,#2CE972 0%,#25D366 55%,#1EB958 100%)',
              color: '#08331B',
              fontSize: 15.5,
              padding: '15px 30px',
              marginTop: 18,
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="#08331B" aria-hidden="true">
              <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.46 0 9.9-4.45 9.9-9.91C21.95 6.45 17.5 2 12.04 2Zm5.8 14.16c-.24.68-1.4 1.3-1.94 1.35-.5.05-1.13.07-1.82-.11a15 15 0 0 1-1.65-.61c-2.9-1.25-4.79-4.17-4.94-4.37-.14-.2-1.18-1.57-1.18-2.99s.75-2.12 1.01-2.41c.27-.29.58-.36.78-.36l.56.01c.18.01.42-.07.66.5.24.58.82 2 .89 2.14.07.15.12.32.02.51-.1.2-.15.32-.29.49-.15.17-.31.39-.44.52-.15.15-.3.31-.13.6.17.29.76 1.25 1.63 2.03 1.12 1 2.06 1.31 2.35 1.46.29.15.46.12.63-.07.17-.2.73-.85.92-1.14.19-.29.39-.24.66-.15.27.1 1.7.8 1.99.95.29.15.48.22.55.34.07.12.07.69-.17 1.36Z" />
            </svg>
            Join the WhatsApp community
          </a>
        </div>

        {/* Step 2 — Add all three */}
        <div style={{ textAlign: 'center', marginTop: 34 }}>
          <div style={{ fontFamily: SANS, fontSize: 12, fontWeight: 700, letterSpacing: '.2em', textTransform: 'uppercase', color: GOLD_DK, marginBottom: 12 }}>
            Step 2 · Add the sessions to your calendar
          </div>
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
                  Google
                </a>
                <a href={outlookUrl(s)} target="_blank" rel="noopener noreferrer" style={{ ...goldBtn, background: '#fff', color: PLUM, border: `1px solid ${BORDER}` }}>
                  Outlook
                </a>
                <a href={singleIcs(s)} download={`the-shift-${s.start.slice(0, 8)}.ics`} style={{ ...goldBtn, background: '#fff', color: PLUM, border: `1px solid ${BORDER}` }}>
                  Apple
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
