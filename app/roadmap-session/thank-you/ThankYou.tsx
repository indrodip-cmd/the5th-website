'use client'
import { useEffect, useState } from 'react'
import { THANKYOU, T } from '../content'
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
  const ics = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//The5th//Roadmap Session//EN', 'BEGIN:VEVENT', `UID:${Date.now()}@the5thglobal.consulting`, `DTSTAMP:${icsDate(new Date().toISOString())}`, `DTSTART:${icsDate(b.start)}`, `DTEND:${icsDate(b.end)}`, `SUMMARY:${THANKYOU.event.title}`, `DESCRIPTION:${THANKYOU.event.description.replace(/\n/g, '\\n')}${b.meetingUrl ? `\\n\\nJoin: ${b.meetingUrl}` : ''}`, `LOCATION:${b.meetingUrl || 'Online'}`, 'END:VEVENT', 'END:VCALENDAR'].join('\r\n')
  return URL.createObjectURL(new Blob([ics], { type: 'text/calendar' }))
}

function Countdown({ start }: { start: string }) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => { const id = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(id) }, [])
  const diff = new Date(start).getTime() - now
  if (diff <= 0) {
    const started = now - new Date(start).getTime()
    const label = started < 60 * 60 * 1000 ? THANKYOU.liveLabel : THANKYOU.passedLabel
    return <div className="rs-serif" style={{ fontSize: 20, color: T.accentInk, fontWeight: 700, textAlign: 'center' }}>{label}</div>
  }
  const d = Math.floor(diff / 86400000), h = Math.floor((diff % 86400000) / 3600000), m = Math.floor((diff % 3600000) / 60000), s = Math.floor((diff % 60000) / 1000)
  const parts: [number, string][] = [[d, 'days'], [h, 'hrs'], [m, 'min'], [s, 'sec']]
  return (
    <div style={{ textAlign: 'center' }}>
      <div className="rs-eyebrow" style={{ marginBottom: 10 }}>{THANKYOU.countdownLabel}</div>
      <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
        {parts.map(([v, l]) => (
          <div key={l} style={{ minWidth: 64, background: '#fff', border: `1px solid ${T.line}`, borderRadius: 14, padding: '10px 8px' }}>
            <div className="rs-serif" style={{ fontSize: 28, fontWeight: 700, lineHeight: 1, color: T.text }}>{String(v).padStart(2, '0')}</div>
            <div style={{ fontSize: 10.5, letterSpacing: '.1em', textTransform: 'uppercase', color: T.text3, marginTop: 6 }}>{l}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function PreCallVideo() {
  return (
    <div style={{ background: T.surface, border: `1px dashed ${T.lineStrong}`, borderRadius: 16, padding: '20px 18px', textAlign: 'center' }}>
      <p style={{ fontWeight: 700, fontSize: 14.5, margin: '0 0 6px' }}>{THANKYOU.preCallVideo.heading}</p>
      <p style={{ color: T.text3, fontSize: 12.5, lineHeight: 1.6, margin: 0 }}>{THANKYOU.preCallVideo.body}</p>
    </div>
  )
}

function SmsOptIn() {
  const [checked, setChecked] = useState(false)
  return (
    <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, minHeight: 44, background: '#fff', border: `1px solid ${T.line}`, borderRadius: 14, padding: '14px 16px', textAlign: 'left' }}>
      <input type="checkbox" checked={checked} onChange={(e) => setChecked(e.target.checked)} style={{ width: 20, height: 20, marginTop: 2, flexShrink: 0 }} />
      <span>
        <span style={{ display: 'block', fontSize: 14, fontWeight: 700 }}>{THANKYOU.smsOptIn.label}</span>
        <span style={{ display: 'block', fontSize: 12, color: T.text3, marginTop: 2 }}>{THANKYOU.smsOptIn.sub}</span>
      </span>
    </label>
  )
}

export default function ThankYou() {
  const [b, setB] = useState<Booking | null>(null)
  const [tried, setTried] = useState(false)
  const [emailInput, setEmailInput] = useState('')
  const [shareParam, setShareParam] = useState('')

  useEffect(() => {
    let stop = false
    let tries = 0
    const runPoll = async (query: string) => {
      tries++
      try {
        const r = await fetch(`/api/roadmap-session/booking-lookup?${query}`, { cache: 'no-store' })
        const j = await r.json()
        if (stop) return
        if (j?.booking?.start) { setB(j.booking); setTried(true); return }
      } catch { /* keep trying */ }
      if (tries >= 5) { setTried(true); return }
      setTimeout(() => runPoll(query), 2500)
    }
    ;(async () => {
      track('cta_click', { where: 'thank_you_view' })
      const sp = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '')
      const start = param(sp, ['start', 'startTime', 'date'])
      const tz = param(sp, ['timeZone', 'tz']) || (() => { try { return Intl.DateTimeFormat().resolvedOptions().timeZone } catch { return 'UTC' } })()
      const uid = param(sp, ['uid', 'bookingUid', 'bookingId'])
      let email = param(sp, ['email', 'attendeeEmail']).toLowerCase()
      if (!email) { try { email = (sessionStorage.getItem('rs_email') || '').toLowerCase() } catch { /* noop */ } }
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
      const r = await fetch(`/api/roadmap-session/booking-lookup?email=${encodeURIComponent(em)}`, { cache: 'no-store' })
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
      <main style={{ flex: 1, width: '100%', maxWidth: 640, margin: '0 auto', padding: 'clamp(32px,6vw,60px) 22px 56px', textAlign: 'center' }}>
        <Reveal>
          <svg width="76" height="76" viewBox="0 0 86 86" style={{ margin: '0 auto 20px', display: 'block' }} aria-hidden>
            <circle cx="43" cy="43" r="40" fill="none" stroke={T.accent} strokeWidth="2.5" strokeDasharray="252" strokeDashoffset="252" style={{ animation: 'rs-draw 0.8s ease forwards' }} />
            <path d="M26 44 l12 12 l22 -24" fill="none" stroke={T.accent} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="60" strokeDashoffset="60" style={{ animation: 'rs-draw 0.5s 0.6s ease forwards' }} />
          </svg>
          <div className="rs-eyebrow" style={{ marginBottom: 10 }}>{THANKYOU.badge}</div>
          <h1 className="rs-serif" style={{ fontSize: 'clamp(30px,6vw,48px)', margin: 0, fontWeight: 800 }}>{THANKYOU.headline}</h1>
          <p style={{ color: T.text2, fontSize: 17, marginTop: 10 }}>{THANKYOU.sub}</p>
        </Reveal>

        {b?.start ? (
          <>
            <Reveal delay={100} style={{ marginTop: 26 }}>
              <div style={{ background: T.surface, border: `1px solid ${T.accent}`, borderRadius: 18, padding: '22px 20px', textAlign: 'left', display: 'grid', gap: 10 }}>
                <Row label="Date" value={fmt(b.start, { weekday: 'long', month: 'long', day: 'numeric' })} />
                <Row label="Time" value={fmt(b.start, { hour: 'numeric', minute: '2-digit' })} />
                <Row label="Timezone" value={tz.replace(/_/g, ' ')} />
              </div>
            </Reveal>
            <Reveal delay={140} style={{ marginTop: 24 }}><Countdown start={b.start} /></Reveal>
            {b.meetingUrl ? (
              <Reveal delay={180} style={{ marginTop: 24 }}>
                <a href={b.meetingUrl} target="_blank" rel="noopener noreferrer" className="rs-focus"
                  style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 10, width: '100%', maxWidth: 420, minHeight: 48, padding: '16px 26px', borderRadius: 14, background: 'linear-gradient(180deg,#6b39a0,#552879)', color: '#fff', textDecoration: 'none', fontWeight: 700, fontSize: 16 }}>Join the call</a>
                <p style={{ color: T.text3, fontSize: 12.5, marginTop: 10 }}>{THANKYOU.joinNote}</p>
              </Reveal>
            ) : (
              <Reveal delay={180} style={{ marginTop: 20 }}>
                <p style={{ color: T.text3, fontSize: 13, lineHeight: 1.6, maxWidth: 460, margin: '0 auto' }}>{THANKYOU.joinPending}</p>
              </Reveal>
            )}
            {full && (
              <Reveal delay={220} style={{ marginTop: 26 }}>
                <div className="rs-eyebrow" style={{ marginBottom: 12 }}>{THANKYOU.addHeading}</div>
                <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
                  <Btn href={googleUrl(full)} variant="ghost">Google Calendar</Btn>
                  <a href={icsBlobUrl(full)} download="roadmap-session.ics" className="rs-focus" style={{ display: 'inline-flex', alignItems: 'center', minHeight: 48, padding: '15px 28px', borderRadius: 999, border: `1px solid ${T.lineStrong}`, background: '#fff', color: T.text, textDecoration: 'none', fontWeight: 700, fontSize: 15 }}>Apple Calendar</a>
                  <Btn href={outlookUrl(full)} variant="ghost">Outlook</Btn>
                </div>
              </Reveal>
            )}
            <Reveal delay={240} style={{ marginTop: 22 }}><SaveThisPage shareParam={shareParam} /></Reveal>
          </>
        ) : tried ? (
          <Reveal delay={100} style={{ marginTop: 26 }}>
            <div style={{ background: T.surface, border: `1px solid ${T.line}`, borderRadius: 18, padding: '24px 20px' }}>
              <p style={{ color: T.text2, fontSize: 15, lineHeight: 1.6, margin: '0 0 14px' }}>{THANKYOU.detailsPending}</p>
              <form onSubmit={lookupByEmail} style={{ display: 'grid', gap: 10, maxWidth: 360, margin: '0 auto' }}>
                <p style={{ color: T.text3, fontSize: 13, margin: 0 }}>{THANKYOU.emailPrompt}</p>
                <input className="rs-focus" type="email" placeholder="Email you booked with" value={emailInput} onChange={(e) => setEmailInput(e.target.value)} style={{ minHeight: 48, width: '100%', background: '#fff', border: `1px solid ${T.line}`, borderRadius: 12, color: T.text, fontSize: 16, padding: '13px 15px' }} />
                <Btn type="submit" full>Show my countdown →</Btn>
              </form>
            </div>
          </Reveal>
        ) : (
          <Reveal delay={100} style={{ marginTop: 28 }}>
            <div style={{ width: 26, height: 26, borderRadius: '50%', border: `3px solid ${T.line}`, borderTopColor: T.accent, animation: 'rs-spin .8s linear infinite', margin: '0 auto' }} />
          </Reveal>
        )}

        <Reveal delay={260} style={{ marginTop: 32 }}><PreCallVideo /></Reveal>

        <Reveal delay={300} style={{ marginTop: 24, textAlign: 'left' }}>
          <h2 className="rs-serif" style={{ fontSize: 19, margin: '0 0 12px', textAlign: 'center' }}>{THANKYOU.prepHeading}</h2>
          <ol style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 8 }}>
            {THANKYOU.prepItems.map((n, k) => (
              <li key={k} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', background: T.surface, border: `1px solid ${T.line}`, borderRadius: 12, padding: '12px 14px' }}>
                <span style={{ color: T.accentInk, fontWeight: 800, fontFamily: T.serif, fontSize: 16 }}>{k + 1}</span>
                <span style={{ color: T.text2, fontSize: 14.5, lineHeight: 1.55 }}>{n}</span>
              </li>
            ))}
          </ol>
          <p style={{ color: T.text3, fontSize: 12.5, textAlign: 'center', marginTop: 10 }}>{THANKYOU.prepSub}</p>
        </Reveal>

        <Reveal delay={340} style={{ marginTop: 24 }}><SmsOptIn /></Reveal>

        <Reveal delay={380} style={{ marginTop: 28, textAlign: 'left' }}>
          <h2 className="rs-serif" style={{ fontSize: 18, margin: '0 0 12px', textAlign: 'center' }}>What past clients said after their call</h2>
          <div style={{ display: 'grid', gap: 12 }}>
            {THANKYOU.testimonials.map((t) => (
              <div key={t.name} style={{ background: T.surface, border: `1px solid ${T.line}`, borderRadius: 12, padding: '14px 16px' }}>
                <p style={{ margin: '0 0 6px', fontSize: 14, fontStyle: 'italic', color: T.text2 }}>&ldquo;{t.quote.replace(/^[“"]|[”"]$/g, '')}&rdquo;</p>
                <p style={{ margin: 0, fontSize: 12.5, fontWeight: 700 }}>{t.name}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </main>
      <Footer />
    </div>
  )
}

function SaveThisPage({ shareParam }: { shareParam: string }) {
  const [copied, setCopied] = useState(false)
  const pageUrl = () => {
    if (typeof window === 'undefined') return ''
    const base = `${window.location.origin}/roadmap-session/thank-you`
    return shareParam ? `${base}?${shareParam}` : window.location.href
  }
  const onSave = async () => {
    const url = pageUrl()
    const nav = navigator as Navigator & { share?: (d: { title?: string; url?: string }) => Promise<void> }
    if (nav.share) { try { await nav.share({ title: THANKYOU.event.title, url }); return } catch { /* fall through to copy */ } }
    try { await navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 2200) } catch { window.prompt('Copy this link to save your confirmation:', url) }
  }
  return (
    <div style={{ background: T.surface, border: `1px solid ${T.line}`, borderRadius: 14, padding: '16px 16px', maxWidth: 440, margin: '0 auto' }}>
      <p style={{ fontSize: 14, fontWeight: 700, margin: '0 0 4px' }}>{THANKYOU.saveTitle}</p>
      <p style={{ color: T.text2, fontSize: 13, lineHeight: 1.55, margin: '0 0 12px' }}>{THANKYOU.saveSub}</p>
      <Btn onClick={onSave} variant="ghost" full>{copied ? 'Link copied ✓' : THANKYOU.saveCta}</Btn>
    </div>
  )
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, borderBottom: `1px solid ${T.line}`, paddingBottom: 10 }}>
      <span style={{ color: T.text3, fontSize: 12.5, textTransform: 'uppercase', letterSpacing: '.08em' }}>{label}</span>
      <span style={{ fontSize: 14.5, fontWeight: 600, textAlign: 'right' }}>{value}</span>
    </div>
  )
}
