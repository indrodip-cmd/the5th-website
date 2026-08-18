'use client'
/* Step 5 — Confirmation. Pulls the just-booked call from cal.com (by email),
   shows date/time + a live countdown, Google/Apple/Outlook calendar links,
   what happens next, and the refund reminder. */
import { useEffect, useState } from 'react'
import { CONFIRMED, THANKYOU, T } from '../config'
import { Btn, Reveal } from '../ui'
import { track } from '../track'

type Booking = { start?: string; end?: string; timeZone?: string; meetingUrl?: string | null }

function icsDate(iso: string) { return new Date(iso).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z' }
type FullB = Required<Pick<Booking, 'start' | 'end'>> & Booking
function googleUrl(b: FullB) {
  const p = new URLSearchParams({ action: 'TEMPLATE', text: THANKYOU.event.title, dates: `${icsDate(b.start)}/${icsDate(b.end)}`, details: `${THANKYOU.event.description}${b.meetingUrl ? `\n\nJoin: ${b.meetingUrl}` : ''}`, location: b.meetingUrl || 'Online' })
  return `https://calendar.google.com/calendar/render?${p.toString()}`
}
function outlookUrl(b: FullB) {
  const p = new URLSearchParams({ path: '/calendar/action/compose', rru: 'addevent', subject: THANKYOU.event.title, startdt: b.start, enddt: b.end, body: `${THANKYOU.event.description}${b.meetingUrl ? ` Join: ${b.meetingUrl}` : ''}`, location: b.meetingUrl || 'Online' })
  return `https://outlook.live.com/calendar/0/deeplink/compose?${p.toString()}`
}
function icsBlobUrl(b: FullB) {
  const ics = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//The5th//10K Roadmap Audit//EN', 'BEGIN:VEVENT', `UID:${Date.now()}@the5th.consulting`, `DTSTAMP:${icsDate(new Date().toISOString())}`, `DTSTART:${icsDate(b.start)}`, `DTEND:${icsDate(b.end)}`, `SUMMARY:${THANKYOU.event.title}`, `DESCRIPTION:${THANKYOU.event.description.replace(/\n/g, '\\n')}`, `LOCATION:${b.meetingUrl || 'Online'}`, 'END:VEVENT', 'END:VCALENDAR'].join('\r\n')
  return URL.createObjectURL(new Blob([ics], { type: 'text/calendar' }))
}

function Countdown({ start }: { start: string }) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => { const id = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(id) }, [])
  const diff = new Date(start).getTime() - now
  if (diff <= 0) return <div className="rm-serif" style={{ fontSize: 20, color: T.accentInk, fontWeight: 700, textAlign: 'center' }}>{now - new Date(start).getTime() < 3600000 ? THANKYOU.liveLabel : THANKYOU.passedLabel}</div>
  const parts: [number, string][] = [[Math.floor(diff / 86400000), 'days'], [Math.floor((diff % 86400000) / 3600000), 'hrs'], [Math.floor((diff % 3600000) / 60000), 'min'], [Math.floor((diff % 60000) / 1000), 'sec']]
  return (
    <div style={{ textAlign: 'center' }}>
      <div className="rm-eyebrow" style={{ marginBottom: 12 }}>{THANKYOU.countdownLabel}</div>
      <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
        {parts.map(([v, l]) => (
          <div key={l} style={{ minWidth: 66, background: '#fff', border: `1px solid ${T.line}`, borderRadius: 14, padding: '12px 10px', boxShadow: '0 12px 34px -26px rgba(46,26,53,.6)' }}>
            <div className="rm-serif" style={{ fontSize: 30, fontWeight: 700, lineHeight: 1, color: T.text }}>{String(v).padStart(2, '0')}</div>
            <div style={{ fontSize: 11, letterSpacing: '.1em', textTransform: 'uppercase', color: T.text3, marginTop: 6 }}>{l}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function Confirmed() {
  const [b, setB] = useState<Booking | null>(null)
  const [tried, setTried] = useState(false)

  useEffect(() => {
    let stop = false
    ;(async () => {
      track('success_page_viewed')
      let email = ''
      try { email = (new URLSearchParams(window.location.search).get('email') || '').toLowerCase() || sessionStorage.getItem('audit_email') || '' } catch { /* noop */ }
      if (!email) { setTried(true); return }
      let tries = 0
      const poll = async () => {
        tries++
        try {
          const r = await fetch(`/api/10k-roadmap/booking-lookup?email=${encodeURIComponent(email)}`, { cache: 'no-store' })
          const j = await r.json()
          if (stop) return
          if (j?.booking?.start) { setB(j.booking); setTried(true); return }
        } catch { /* keep trying */ }
        if (tries >= 5) { setTried(true); return }
        setTimeout(poll, 2500)
      }
      poll()
    })()
    return () => { stop = true }
  }, [])

  const tz = b?.timeZone || (() => { try { return Intl.DateTimeFormat().resolvedOptions().timeZone } catch { return 'UTC' } })()
  const fmt = (iso?: string, o?: Intl.DateTimeFormatOptions) => iso ? new Date(iso).toLocaleString('en-US', { timeZone: tz, ...o }) : ''
  const full = b?.start && b?.end ? (b as FullB) : null

  return (
    <div style={{ textAlign: 'center' }}>
      <Reveal>
        <svg width="80" height="80" viewBox="0 0 86 86" style={{ margin: '0 auto 18px', display: 'block' }} aria-hidden>
          <circle cx="43" cy="43" r="40" fill="none" stroke={T.accent} strokeWidth="2.5" strokeDasharray="252" strokeDashoffset="252" style={{ animation: 'rm-draw 0.8s ease forwards' }} />
          <path d="M26 44 l12 12 l22 -24" fill="none" stroke={T.accent} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="60" strokeDashoffset="60" style={{ animation: 'rm-draw 0.5s 0.6s ease forwards' }} />
        </svg>
        <div className="rm-eyebrow" style={{ marginBottom: 10 }}>{CONFIRMED.badge}</div>
        <h1 className="rm-serif" style={{ fontSize: 'clamp(32px,5.4vw,50px)', margin: 0, fontWeight: 700 }}>{CONFIRMED.headline}</h1>
        <p style={{ color: T.text2, fontSize: 17, marginTop: 12 }}>{CONFIRMED.sub}</p>
      </Reveal>

      {b?.start ? (
        <>
          <Reveal delay={120} style={{ marginTop: 26, maxWidth: 460, marginLeft: 'auto', marginRight: 'auto' }}>
            <div style={{ background: T.surface, border: `1px solid ${T.accent}`, borderRadius: 20, padding: '22px 22px', textAlign: 'left', display: 'grid', gap: 12 }}>
              <Row label="Date" value={fmt(b.start, { weekday: 'long', month: 'long', day: 'numeric' })} />
              <Row label="Time" value={fmt(b.start, { hour: 'numeric', minute: '2-digit' })} />
              <Row label="Timezone" value={tz.replace(/_/g, ' ')} />
              <Row label="Duration" value="45 minutes" />
            </div>
          </Reveal>
          <Reveal delay={170} style={{ marginTop: 24 }}><Countdown start={b.start} /></Reveal>
          {full && (
            <Reveal delay={210} style={{ marginTop: 26 }}>
              <div className="rm-eyebrow" style={{ marginBottom: 12 }}>{THANKYOU.addHeading}</div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
                <Btn href={googleUrl(full)} variant="ghost" onClick={() => track('calendar_google_clicked')}>Google</Btn>
                <a href={icsBlobUrl(full)} download="10k-roadmap-audit.ics" onClick={() => track('calendar_apple_clicked')} className="rm-focus" style={{ display: 'inline-flex', alignItems: 'center', padding: '17px 30px', borderRadius: 999, border: `1px solid ${T.lineStrong}`, background: '#fff', color: T.text, textDecoration: 'none', fontWeight: 700, fontSize: 16 }}>Apple</a>
                <Btn href={outlookUrl(full)} variant="ghost" onClick={() => track('calendar_outlook_clicked')}>Outlook</Btn>
              </div>
            </Reveal>
          )}
        </>
      ) : tried ? (
        <Reveal delay={120} style={{ marginTop: 26 }}>
          <p style={{ color: T.text2, fontSize: 15.5, lineHeight: 1.6, maxWidth: 460, margin: '0 auto' }}>{THANKYOU.detailsPending}</p>
        </Reveal>
      ) : (
        <Reveal delay={120} style={{ marginTop: 28 }}>
          <div style={{ width: 26, height: 26, borderRadius: '50%', border: `3px solid ${T.line}`, borderTopColor: T.accent, animation: 'rm-spin .8s linear infinite', margin: '0 auto' }} />
        </Reveal>
      )}

      <Reveal delay={250} style={{ marginTop: 40, textAlign: 'left', maxWidth: 520, marginLeft: 'auto', marginRight: 'auto' }}>
        <h2 className="rm-serif" style={{ fontSize: 21, margin: '0 0 14px', textAlign: 'center', fontWeight: 700 }}>Here’s what happens next.</h2>
        <ol style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 10 }}>
          {THANKYOU.next.map((n, k) => (
            <li key={k} style={{ display: 'flex', gap: 13, alignItems: 'flex-start', background: T.surface, border: `1px solid ${T.line}`, borderRadius: 12, padding: '13px 15px' }}>
              <span style={{ color: T.accentInk, fontWeight: 700, fontFamily: T.serif, fontSize: 18 }}>{k + 1}</span>
              <span style={{ color: T.text2, fontSize: 14.5, lineHeight: 1.55 }}>{n}</span>
            </li>
          ))}
        </ol>
      </Reveal>

      <Reveal delay={290} style={{ marginTop: 20, maxWidth: 520, marginLeft: 'auto', marginRight: 'auto' }}>
        <p style={{ color: T.text3, fontSize: 12.5, lineHeight: 1.6, background: T.surface, border: `1px solid ${T.line}`, borderRadius: 12, padding: '14px 16px', margin: 0 }}>{CONFIRMED.refundReminder}</p>
      </Reveal>
    </div>
  )
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, borderBottom: `1px solid ${T.line}`, paddingBottom: 12 }}>
      <span style={{ color: T.text3, fontSize: 13, textTransform: 'uppercase', letterSpacing: '.08em' }}>{label}</span>
      <span style={{ fontSize: 15, fontWeight: 600, textAlign: 'right' }}>{value}</span>
    </div>
  )
}
