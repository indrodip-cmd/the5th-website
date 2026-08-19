'use client'
/* Thank-you page — where cal.com redirects after the audit is booked.
   Configure the cal.com event's "redirect on booking" to:
     https://the5th.consulting/10k-roadmap/thank-you
   cal.com appends the booking uid (and often the attendee email), which we use
   to look the booking up and show the exact date/time, a live countdown, and
   Google / Apple / Outlook calendar links. Falls back to an email lookup. */
import { useEffect, useState } from 'react'
import { THANKYOU, LEGAL, T } from '../config'
import { Fonts, Header, Footer, Btn, Reveal } from '../ui'
import { track } from '../track'

type Booking = { start?: string; end?: string; timeZone?: string; meetingUrl?: string | null; name?: string }

function param(sp: URLSearchParams, keys: string[]): string {
  for (const k of keys) { const v = sp.get(k); if (v) return v }
  return ''
}

function icsDate(iso: string) { return new Date(iso).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z' }
function googleUrl(b: Required<Pick<Booking, 'start' | 'end'>> & Booking) {
  const p = new URLSearchParams({ action: 'TEMPLATE', text: THANKYOU.event.title, dates: `${icsDate(b.start)}/${icsDate(b.end)}`, details: `${THANKYOU.event.description}${b.meetingUrl ? `\n\nJoin: ${b.meetingUrl}` : ''}`, location: b.meetingUrl || 'Online' })
  return `https://calendar.google.com/calendar/render?${p.toString()}`
}
function outlookUrl(b: Required<Pick<Booking, 'start' | 'end'>> & Booking) {
  const p = new URLSearchParams({ path: '/calendar/action/compose', rru: 'addevent', subject: THANKYOU.event.title, startdt: b.start, enddt: b.end, body: `${THANKYOU.event.description}${b.meetingUrl ? ` Join: ${b.meetingUrl}` : ''}`, location: b.meetingUrl || 'Online' })
  return `https://outlook.live.com/calendar/0/deeplink/compose?${p.toString()}`
}
function icsBlobUrl(b: Required<Pick<Booking, 'start' | 'end'>> & Booking) {
  const ics = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//The5th//10K Roadmap Audit//EN', 'BEGIN:VEVENT', `UID:${Date.now()}@the5th.consulting`, `DTSTAMP:${icsDate(new Date().toISOString())}`, `DTSTART:${icsDate(b.start)}`, `DTEND:${icsDate(b.end)}`, `SUMMARY:${THANKYOU.event.title}`, `DESCRIPTION:${THANKYOU.event.description.replace(/\n/g, '\\n')}${b.meetingUrl ? `\\n\\nJoin: ${b.meetingUrl}` : ''}`, `LOCATION:${b.meetingUrl || 'Online'}`, 'END:VEVENT', 'END:VCALENDAR'].join('\r\n')
  return URL.createObjectURL(new Blob([ics], { type: 'text/calendar' }))
}

function Countdown({ start }: { start: string }) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => { const id = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(id) }, [])
  const diff = new Date(start).getTime() - now
  if (diff <= 0) {
    const started = now - new Date(start).getTime()
    const label = started < 60 * 60 * 1000 ? THANKYOU.liveLabel : THANKYOU.passedLabel
    return <div className="rm-serif" style={{ fontSize: 22, color: T.accentInk, fontWeight: 700, textAlign: 'center' }}>{label}</div>
  }
  const d = Math.floor(diff / 86400000), h = Math.floor((diff % 86400000) / 3600000), m = Math.floor((diff % 3600000) / 60000), s = Math.floor((diff % 60000) / 1000)
  const parts: [number, string][] = [[d, 'days'], [h, 'hrs'], [m, 'min'], [s, 'sec']]
  return (
    <div style={{ textAlign: 'center' }}>
      <div className="rm-eyebrow" style={{ marginBottom: 12 }}>{THANKYOU.countdownLabel}</div>
      <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
        {parts.map(([v, l]) => (
          <div key={l} style={{ minWidth: 68, background: '#fff', border: `1px solid ${T.line}`, borderRadius: 14, padding: '12px 10px', boxShadow: '0 12px 34px -26px rgba(46,26,53,.6)' }}>
            <div className="rm-serif" style={{ fontSize: 32, fontWeight: 700, lineHeight: 1, color: T.text }}>{String(v).padStart(2, '0')}</div>
            <div style={{ fontSize: 11, letterSpacing: '.1em', textTransform: 'uppercase', color: T.text3, marginTop: 6 }}>{l}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function ThankYou() {
  const [b, setB] = useState<Booking | null>(null)
  const [tried, setTried] = useState(false)
  const [emailInput, setEmailInput] = useState('')
  // Query string that re-resolves this exact booking, so "Save this page" hands
  // the attendee a link they can bookmark and re-open to the live countdown.
  const [shareParam, setShareParam] = useState('')

  useEffect(() => {
    let stop = false
    let tries = 0
    const runPoll = async (query: string) => {
      tries++
      try {
        const r = await fetch(`/api/10k-roadmap/booking-lookup?${query}`, { cache: 'no-store' })
        const j = await r.json()
        if (stop) return
        if (j?.booking?.start) { setB(j.booking); setTried(true); return }
      } catch { /* keep trying */ }
      if (tries >= 5) { setTried(true); return }
      setTimeout(() => runPoll(query), 2500)
    }
    ;(async () => {
      track('success_page_viewed')
      const sp = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '')
      const start = param(sp, ['start', 'startTime', 'date'])
      const tz = param(sp, ['timeZone', 'tz']) || (() => { try { return Intl.DateTimeFormat().resolvedOptions().timeZone } catch { return 'UTC' } })()
      const uid = param(sp, ['uid', 'bookingUid', 'bookingId'])
      let email = param(sp, ['email', 'attendeeEmail']).toLowerCase()
      if (!email) { try { email = (sessionStorage.getItem('audit_email') || '').toLowerCase() } catch { /* noop */ } }

      // Prefer a uid (stable), else the email — either lets the page rebuild.
      const query = uid ? `uid=${encodeURIComponent(uid)}` : email ? `email=${encodeURIComponent(email)}` : ''
      if (query) setShareParam(query)

      if (start && !Number.isNaN(Date.parse(start))) {
        const end = param(sp, ['end', 'endTime']) || new Date(new Date(start).getTime() + 60 * 60000).toISOString()
        setB({ start, end, timeZone: tz, meetingUrl: sp.get('meetingUrl') }); setTried(true); return
      }
      if (!query) { setTried(true); return }
      runPoll(query)
    })()
    return () => { stop = true }
  }, [])

  const lookupByEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    const em = emailInput.trim().toLowerCase()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)) return
    setTried(false)
    setShareParam(`email=${encodeURIComponent(em)}`)
    try {
      const r = await fetch(`/api/10k-roadmap/booking-lookup?email=${encodeURIComponent(em)}`, { cache: 'no-store' })
      const j = await r.json()
      if (j?.booking?.start) setB(j.booking)
    } catch { /* noop */ }
    setTried(true)
  }

  const tz = b?.timeZone || 'UTC'
  const fmt = (iso?: string, o?: Intl.DateTimeFormatOptions) => iso ? new Date(iso).toLocaleString('en-US', { timeZone: tz, ...o }) : ''
  const full = b?.start && b?.end ? (b as Required<Pick<Booking, 'start' | 'end'>> & Booking) : null

  return (
    <div style={{ minHeight: '100dvh', background: T.bg, color: T.text, fontFamily: T.sans, display: 'flex', flexDirection: 'column' }}>
      <Fonts />
      <Header />
      <main style={{ flex: 1, width: '100%', maxWidth: 640, margin: '0 auto', padding: 'clamp(40px,7vw,72px) 22px 56px', textAlign: 'center' }}>
        <Reveal>
          <svg width="82" height="82" viewBox="0 0 86 86" style={{ margin: '0 auto 22px', display: 'block' }} aria-hidden>
            <circle cx="43" cy="43" r="40" fill="none" stroke={T.accent} strokeWidth="2.5" strokeDasharray="252" strokeDashoffset="252" style={{ animation: 'rm-draw 0.8s ease forwards' }} />
            <path d="M26 44 l12 12 l22 -24" fill="none" stroke={T.accent} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="60" strokeDashoffset="60" style={{ animation: 'rm-draw 0.5s 0.6s ease forwards' }} />
          </svg>
          <div className="rm-eyebrow" style={{ marginBottom: 12 }}>{THANKYOU.badge}</div>
          <h1 className="rm-serif" style={{ fontSize: 'clamp(34px,6vw,56px)', margin: 0, fontWeight: 700 }}>{THANKYOU.headline}</h1>
          <p style={{ color: T.text2, fontSize: 18, marginTop: 12 }}>{THANKYOU.sub}</p>
        </Reveal>

        {/* Booking + countdown */}
        {b?.start ? (
          <>
            <Reveal delay={120} style={{ marginTop: 30 }}>
              <div style={{ background: T.surface, border: `1px solid ${T.accent}`, borderRadius: 20, padding: '24px 22px', textAlign: 'left' }}>
                <div style={{ display: 'grid', gap: 12 }}>
                  <Row label="Date" value={fmt(b.start, { weekday: 'long', month: 'long', day: 'numeric' })} />
                  <Row label="Time" value={fmt(b.start, { hour: 'numeric', minute: '2-digit' })} />
                  <Row label="Timezone" value={tz.replace(/_/g, ' ')} />
                  <Row label="Duration" value="60 minutes" />
                </div>
              </div>
            </Reveal>

            <Reveal delay={160} style={{ marginTop: 26 }}>
              <Countdown start={b.start} />
            </Reveal>

            {/* Prominent join link (Zoom / video). Appears once cal.com returns it. */}
            {b.meetingUrl ? (
              <Reveal delay={200} style={{ marginTop: 26 }}>
                <a href={b.meetingUrl} target="_blank" rel="noopener noreferrer" onClick={() => track('meeting_link_clicked')}
                  className="rm-focus"
                  style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 10, width: '100%', maxWidth: 420, padding: '18px 28px', borderRadius: 16, background: 'linear-gradient(180deg,#6b39a0 0%,#5a2c86 55%,#4c2472 100%)', color: '#fff', textDecoration: 'none', fontWeight: 700, fontSize: 17, boxShadow: '0 16px 32px -14px rgba(94,46,134,.7)' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 10l4.55-2.28A1 1 0 0 1 21 8.62v6.76a1 1 0 0 1-1.45.9L15 14M3 8a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /></svg>
                  Join the call
                </a>
                <p style={{ color: T.text3, fontSize: 12.5, marginTop: 10 }}>{THANKYOU.joinNote}</p>
              </Reveal>
            ) : (
              <Reveal delay={200} style={{ marginTop: 22 }}>
                <p style={{ color: T.text3, fontSize: 13, lineHeight: 1.6, maxWidth: 460, margin: '0 auto' }}>{THANKYOU.joinPending}</p>
              </Reveal>
            )}

            {full && (
              <Reveal delay={240} style={{ marginTop: 28 }}>
                <div className="rm-eyebrow" style={{ marginBottom: 14 }}>{THANKYOU.addHeading}</div>
                <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
                  <Btn href={googleUrl(full)} variant="ghost" onClick={() => track('calendar_google_clicked')}>Google Calendar</Btn>
                  <a href={icsBlobUrl(full)} download="10k-roadmap-audit.ics" onClick={() => track('calendar_apple_clicked')} className="rm-focus" style={{ display: 'inline-flex', alignItems: 'center', padding: '17px 30px', borderRadius: 999, border: `1px solid ${T.lineStrong}`, background: '#fff', color: T.text, textDecoration: 'none', fontWeight: 700, fontSize: 16 }}>Apple Calendar</a>
                  <Btn href={outlookUrl(full)} variant="ghost" onClick={() => track('calendar_outlook_clicked')}>Outlook / Microsoft</Btn>
                </div>
              </Reveal>
            )}

            {/* Save this page — copyable, bookmarkable link back to this countdown. */}
            <Reveal delay={280} style={{ marginTop: 26 }}>
              <SaveThisPage shareParam={shareParam} />
            </Reveal>
          </>
        ) : tried ? (
          <Reveal delay={120} style={{ marginTop: 28 }}>
            <div style={{ background: T.surface, border: `1px solid ${T.line}`, borderRadius: 18, padding: '26px 22px' }}>
              <p style={{ color: T.text2, fontSize: 15.5, lineHeight: 1.6, margin: '0 0 16px' }}>{THANKYOU.detailsPending}</p>
              <form onSubmit={lookupByEmail} style={{ display: 'grid', gap: 10, maxWidth: 360, margin: '0 auto' }}>
                <p style={{ color: T.text3, fontSize: 13, margin: 0 }}>{THANKYOU.emailPrompt}</p>
                <input className="rm-focus" type="email" placeholder="Email you booked with" value={emailInput} onChange={(e) => setEmailInput(e.target.value)} style={{ width: '100%', background: '#fff', border: `1px solid ${T.line}`, borderRadius: 12, color: T.text, fontSize: 15.5, padding: '13px 15px', fontFamily: T.sans }} />
                <Btn type="submit" full>Show my countdown →</Btn>
              </form>
            </div>
          </Reveal>
        ) : (
          <Reveal delay={120} style={{ marginTop: 30 }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', border: `3px solid ${T.line}`, borderTopColor: T.accent, animation: 'rm-spin .8s linear infinite', margin: '0 auto' }} />
          </Reveal>
        )}

        {/* What happens next */}
        <Reveal delay={260} style={{ marginTop: 44, textAlign: 'left' }}>
          <h2 className="rm-serif" style={{ fontSize: 22, margin: '0 0 16px', textAlign: 'center', fontWeight: 700 }}>Here’s what happens next.</h2>
          <ol style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 10 }}>
            {THANKYOU.next.map((n, k) => (
              <li key={k} style={{ display: 'flex', gap: 14, alignItems: 'flex-start', background: T.surface, border: `1px solid ${T.line}`, borderRadius: 12, padding: '14px 16px' }}>
                <span style={{ color: T.accentInk, fontWeight: 700, fontFamily: T.serif, fontSize: 18 }}>{k + 1}</span>
                <span style={{ color: T.text2, fontSize: 15, lineHeight: 1.55 }}>{n}</span>
              </li>
            ))}
          </ol>
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

/* "Save this page": copies a bookmarkable link that re-opens to this exact
   booking + live countdown. Uses the Web Share sheet on mobile when available,
   otherwise copies to the clipboard with an inline confirmation. */
function SaveThisPage({ shareParam }: { shareParam: string }) {
  const [copied, setCopied] = useState(false)

  const pageUrl = () => {
    if (typeof window === 'undefined') return ''
    const base = `${window.location.origin}/10k-roadmap/thank-you`
    return shareParam ? `${base}?${shareParam}` : window.location.href
  }

  const onSave = async () => {
    track('thankyou_save_clicked')
    const url = pageUrl()
    // Prefer the native share sheet (great on mobile: Save to Files, bookmark…).
    const nav = navigator as Navigator & { share?: (d: { title?: string; url?: string }) => Promise<void> }
    if (nav.share) {
      try { await nav.share({ title: THANKYOU.event.title, url }); return } catch { /* fall through to copy */ }
    }
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true); setTimeout(() => setCopied(false), 2200)
    } catch { window.prompt('Copy this link to save your confirmation:', url) }
  }

  return (
    <div style={{ background: T.surface, border: `1px solid ${T.line}`, borderRadius: 16, padding: '18px 18px', maxWidth: 460, margin: '0 auto' }}>
      <p style={{ fontSize: 14.5, fontWeight: 700, margin: '0 0 4px' }}>{THANKYOU.saveTitle}</p>
      <p style={{ color: T.text2, fontSize: 13.5, lineHeight: 1.55, margin: '0 0 14px' }}>{THANKYOU.saveSub}</p>
      <Btn onClick={onSave} variant="ghost" full>
        {copied ? 'Link copied ✓' : THANKYOU.saveCta}
      </Btn>
    </div>
  )
}
