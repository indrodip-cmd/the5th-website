'use client'
/* Confirmation — an onboarding moment, not a green checkmark. Reveals the real
   booked event and builds live Google / Apple / Outlook calendar entries from
   it. Survives a refresh: if sessionStorage is empty it re-reads the booking
   from the server by email. */
import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { SUCCESS, LEGAL, T } from '../config'
import { Fonts, Header, Footer, Btn, Reveal } from '../ui'
import { track } from '../track'

type Booking = { start?: string; end?: string; tz?: string; meetingUrl?: string | null }

function icsDate(iso: string) { return new Date(iso).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z' }

function googleUrl(b: Booking) {
  const p = new URLSearchParams({
    action: 'TEMPLATE', text: SUCCESS.event.title,
    dates: `${icsDate(b.start!)}/${icsDate(b.end!)}`,
    details: `${SUCCESS.event.description}${b.meetingUrl ? `\n\nJoin: ${b.meetingUrl}` : ''}`,
    location: b.meetingUrl || 'Online',
  })
  return `https://calendar.google.com/calendar/render?${p.toString()}`
}
function outlookUrl(b: Booking) {
  const p = new URLSearchParams({
    path: '/calendar/action/compose', rru: 'addevent', subject: SUCCESS.event.title,
    startdt: b.start!, enddt: b.end!,
    body: `${SUCCESS.event.description}${b.meetingUrl ? ` Join: ${b.meetingUrl}` : ''}`,
    location: b.meetingUrl || 'Online',
  })
  return `https://outlook.live.com/calendar/0/deeplink/compose?${p.toString()}`
}
function icsBlobUrl(b: Booking) {
  const ics = [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//The5th//10K Roadmap Audit//EN', 'BEGIN:VEVENT',
    `UID:${Date.now()}@the5th.consulting`, `DTSTAMP:${icsDate(new Date().toISOString())}`,
    `DTSTART:${icsDate(b.start!)}`, `DTEND:${icsDate(b.end!)}`,
    `SUMMARY:${SUCCESS.event.title}`,
    `DESCRIPTION:${SUCCESS.event.description.replace(/\n/g, '\\n')}${b.meetingUrl ? `\\n\\nJoin: ${b.meetingUrl}` : ''}`,
    `LOCATION:${b.meetingUrl || 'Online'}`, 'END:VEVENT', 'END:VCALENDAR',
  ].join('\r\n')
  return URL.createObjectURL(new Blob([ics], { type: 'text/calendar' }))
}

export default function Success() {
  const params = useSearchParams()
  const [b, setB] = useState<Booking | null>(null)

  useEffect(() => {
    track('success_page_viewed')
    ;(async () => {
      let booking: Booking | null = null
      try { booking = JSON.parse(sessionStorage.getItem('audit_booking') || 'null') } catch { /* noop */ }
      if (booking?.start) { setB(booking); return }
      // Refresh-safe recovery: re-read from the server by email.
      let email = params.get('email') || ''
      try { email = email || sessionStorage.getItem('audit_email') || '' } catch { /* noop */ }
      if (!email) return
      try {
        const r = await fetch(`/api/10k-roadmap/status?email=${encodeURIComponent(email)}`, { cache: 'no-store' })
        const j = await r.json()
        if (j?.booking?.start) setB(j.booking)
      } catch { /* noop */ }
    })()
  }, [params])

  const tz = b?.tz || (() => { try { return Intl.DateTimeFormat().resolvedOptions().timeZone } catch { return 'UTC' } })()
  const fmt = (iso?: string, opts?: Intl.DateTimeFormatOptions) => iso ? new Date(iso).toLocaleString('en-US', { timeZone: tz, ...opts }) : ''

  return (
    <div style={{ minHeight: '100dvh', background: T.bg, color: T.text, fontFamily: T.sans, display: 'flex', flexDirection: 'column' }}>
      <Fonts />
      <Header />
      <main style={{ flex: 1, maxWidth: 760, margin: '0 auto', width: '100%', padding: 'clamp(40px,7vw,80px) 22px 60px', textAlign: 'center' }}>
        {/* Confirmation moment */}
        <Reveal>
          <svg width="86" height="86" viewBox="0 0 86 86" style={{ margin: '0 auto 24px', display: 'block' }} aria-hidden>
            <circle cx="43" cy="43" r="40" fill="none" stroke={T.accent} strokeWidth="2.5" strokeDasharray="252" strokeDashoffset="252" style={{ animation: 'rm-draw 0.8s ease forwards' }} />
            <path d="M26 44 l12 12 l22 -24" fill="none" stroke={T.accent} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="60" strokeDashoffset="60" style={{ animation: 'rm-draw 0.5s 0.6s ease forwards' }} />
          </svg>
          <div className="rm-eyebrow" style={{ marginBottom: 14 }}>{SUCCESS.badge}</div>
          <h1 className="rm-serif" style={{ fontSize: 'clamp(38px,7vw,68px)', margin: 0 }}>{SUCCESS.headline}</h1>
          <p style={{ color: T.text2, fontSize: 19, marginTop: 14 }}>{SUCCESS.sub}</p>
        </Reveal>

        {/* Confirmation card */}
        <Reveal delay={120} style={{ marginTop: 34 }}>
          <div style={{ background: T.surface, border: `1px solid ${T.accent}`, borderRadius: 20, padding: '26px 24px', textAlign: 'left', maxWidth: 460, margin: '0 auto' }}>
            {b?.start ? (
              <div style={{ display: 'grid', gap: 14 }}>
                <Row label="Date" value={fmt(b.start, { weekday: 'long', month: 'long', day: 'numeric' })} />
                <Row label="Time" value={fmt(b.start, { hour: 'numeric', minute: '2-digit' })} />
                <Row label="Timezone" value={tz.replace(/_/g, ' ')} />
                <Row label="Duration" value="45 minutes" />
                {b.meetingUrl && <Row label="Link" value={<a href={b.meetingUrl} style={{ color: T.accent }}>{b.meetingUrl}</a>} />}
              </div>
            ) : (
              <p style={{ color: T.text2, fontSize: 15, margin: 0 }}>Your audit is confirmed. Full details are on their way to your inbox.</p>
            )}
          </div>
        </Reveal>

        {/* Add to calendar */}
        {b?.start && b?.end && (
          <Reveal delay={180} style={{ marginTop: 22 }}>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Btn href={googleUrl(b)} variant="ghost" onClick={() => track('calendar_google_clicked')}>Add to Google Calendar</Btn>
              <a href={icsBlobUrl(b)} download="10k-roadmap-audit.ics" onClick={() => track('calendar_apple_clicked')}
                className="rm-focus" style={{ display: 'inline-flex', alignItems: 'center', padding: '17px 34px', borderRadius: 999, border: `1px solid ${T.lineStrong}`, color: T.text, textDecoration: 'none', fontWeight: 700, fontSize: 16 }}>Add to Apple Calendar</a>
              <Btn href={outlookUrl(b)} variant="ghost" onClick={() => track('calendar_outlook_clicked')}>Add to Outlook</Btn>
            </div>
          </Reveal>
        )}

        {/* What happens next */}
        <Reveal delay={220} style={{ marginTop: 44, textAlign: 'left', maxWidth: 560, marginLeft: 'auto', marginRight: 'auto' }}>
          <h2 className="rm-serif" style={{ fontSize: 24, margin: '0 0 18px', textAlign: 'center' }}>Here’s what happens next.</h2>
          <ol style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 12 }}>
            {SUCCESS.next.map((n, k) => (
              <li key={k} style={{ display: 'flex', gap: 14, alignItems: 'flex-start', background: T.surface, border: `1px solid ${T.line}`, borderRadius: 12, padding: '14px 16px' }}>
                <span style={{ color: T.accent, fontWeight: 700, fontFamily: T.serif, fontSize: 18 }}>{k + 1}</span>
                <span style={{ color: T.text2, fontSize: 15, lineHeight: 1.55 }}>{n}</span>
              </li>
            ))}
          </ol>
        </Reveal>

        {/* Before we meet */}
        <Reveal delay={260} style={{ marginTop: 44 }}>
          <div style={{ background: T.surface, border: `1px solid ${T.line}`, borderRadius: 18, padding: '30px 26px' }}>
            <h2 className="rm-serif" style={{ fontSize: 24, margin: '0 0 14px' }}>{SUCCESS.before.heading}</h2>
            {SUCCESS.before.lines.map((l) => <p key={l} style={{ color: T.text2, fontSize: 16, margin: '0 0 6px' }}>{l}</p>)}
            <p style={{ color: T.text3, fontSize: 14.5, lineHeight: 1.6, marginTop: 14 }}>{SUCCESS.before.close}</p>
          </div>
        </Reveal>

        {/* 3 numbers */}
        <Reveal delay={300} style={{ marginTop: 22 }}>
          <div style={{ background: 'radial-gradient(120% 100% at 50% 0%, #14110a, #0e0e0e)', border: `1px solid ${T.line}`, borderRadius: 18, padding: '30px 26px' }}>
            <h2 className="rm-serif" style={{ fontSize: 24, margin: '0 0 18px' }}>{SUCCESS.numbers.heading}</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: 14 }}>
              {SUCCESS.numbers.items.map((it, k) => (
                <div key={it} style={{ background: T.bg, border: `1px solid ${T.line}`, borderRadius: 12, padding: '18px 16px' }}>
                  <div style={{ color: T.accent, fontFamily: T.serif, fontSize: 24 }}>{k + 1}</div>
                  <div style={{ color: T.text2, fontSize: 14, marginTop: 6, lineHeight: 1.4 }}>{it}</div>
                </div>
              ))}
            </div>
            <p style={{ color: T.text3, fontSize: 13.5, marginTop: 16 }}>{SUCCESS.numbers.sub}</p>
          </div>
        </Reveal>

        {/* What we'll cover */}
        <Reveal delay={340} style={{ marginTop: 44 }}>
          <h2 className="rm-serif" style={{ fontSize: 22, margin: '0 0 18px' }}>{SUCCESS.cover.heading}</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
            {SUCCESS.cover.chain.map((c) => (
              <span key={c} style={{ background: T.surface, border: `1px solid ${T.line}`, borderRadius: 999, padding: '9px 16px', fontSize: 13.5, color: T.text2 }}>{c}</span>
            ))}
          </div>
        </Reveal>
      </main>
      <Footer legal={LEGAL} />
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
