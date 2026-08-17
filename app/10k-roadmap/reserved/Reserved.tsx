'use client'
/* Post-payment page (the URL Whop redirects to after the $27 deposit).
   Whop captures the buyer's email, so we confirm their details here, save the
   qualification answers to the lead, then run the deep diagnostic + booking.
   Refresh-safe: an already-booked email jumps straight to the success page. */
import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { DEEP, BOOK, SUCCESS, T } from '../config'
import { Fonts, Header, Btn, QuestionFlow, Reveal, useUtm, loadQualAnswers, getAuditId } from '../ui'
import { track } from '../track'

type Phase = 'confirm' | 'saving' | 'diagnostic' | 'booking'

const TZ_LIST = ['America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles', 'America/Sao_Paulo', 'Europe/London', 'Europe/Berlin', 'Europe/Athens', 'Asia/Dubai', 'Asia/Kolkata', 'Asia/Singapore', 'Australia/Sydney']

function prefillEmail(): string {
  if (typeof window === 'undefined') return ''
  try { return (new URLSearchParams(window.location.search).get('email') || '').trim().toLowerCase() || sessionStorage.getItem('audit_email') || '' } catch { return '' }
}

export default function Reserved() {
  const router = useRouter()
  const utm = useUtm()
  const [phase, setPhase] = useState<Phase>('confirm')
  const [form, setForm] = useState({ name: '', email: prefillEmail() })
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [err, setErr] = useState('')

  // Refresh-safe: if this email already booked, skip straight to success.
  useEffect(() => {
    const e = prefillEmail()
    if (!e) return
    ;(async () => {
      try {
        const r = await fetch(`/api/10k-roadmap/status?email=${encodeURIComponent(e)}`, { cache: 'no-store' })
        const j = await r.json()
        if (j?.booked) router.replace('/10k-roadmap/success')
        else if (j?.name && !form.name) setForm((f) => ({ ...f, name: j.name }))
      } catch { /* ignore */ }
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => { if (phase === 'diagnostic') track('deep_application_started') }, [phase])

  const submitConfirm = async (e: React.FormEvent) => {
    e.preventDefault(); setErr('')
    const em = form.email.trim().toLowerCase()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)) { setErr('Please enter the email you used at checkout.'); return }
    if (form.name.trim().length < 2) { setErr('Please enter your name.'); return }
    setPhase('saving')
    try {
      await fetch('/api/10k-roadmap/reserve', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name.trim(), email: em, qualification: loadQualAnswers(), utm, audit_id: getAuditId() }),
      })
      try { sessionStorage.setItem('audit_email', em); sessionStorage.setItem('audit_name', form.name.trim()) } catch { /* noop */ }
      track('payment_success')
      setEmail(em); setName(form.name.trim()); setPhase('diagnostic')
    } catch {
      setErr('We couldn’t save that. Your details are safe. Please try again.')
      setPhase('confirm')
    }
  }

  const onDeepComplete = useCallback(async (answers: Record<string, string | string[]>) => {
    try {
      await fetch('/api/10k-roadmap/diagnostic', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, answers }),
      })
    } catch { /* saved best-effort; never block booking */ }
    track('deep_application_completed')
    setPhase('booking')
  }, [email])

  return (
    <div style={{ minHeight: '100dvh', background: T.bg, color: T.text, fontFamily: T.sans }}>
      <Fonts />
      <Header />
      <main style={{ maxWidth: phase === 'booking' ? 1040 : 640, margin: '0 auto', padding: 'clamp(30px,6vw,60px) 22px 90px' }}>
        {(phase === 'confirm' || phase === 'saving') && (
          <Reveal style={{ textAlign: 'center' }}>
            <svg width="60" height="60" viewBox="0 0 86 86" style={{ margin: '0 auto 18px', display: 'block' }} aria-hidden>
              <circle cx="43" cy="43" r="40" fill="none" stroke={T.accent} strokeWidth="2.5" strokeDasharray="252" strokeDashoffset="252" style={{ animation: 'rm-draw 0.8s ease forwards' }} />
              <path d="M26 44 l12 12 l22 -24" fill="none" stroke={T.accent} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="60" strokeDashoffset="60" style={{ animation: 'rm-draw 0.5s 0.6s ease forwards' }} />
            </svg>
            <div className="rm-eyebrow" style={{ marginBottom: 12 }}>Deposit received</div>
            <h1 className="rm-serif" style={{ fontSize: 'clamp(26px,4vw,36px)', margin: '0 0 8px', fontWeight: 700 }}>You’re in. Let’s lock in your audit.</h1>
            <p style={{ color: T.text2, fontSize: 15.5, lineHeight: 1.55, maxWidth: 440, margin: '0 auto 26px' }}>
              Confirm the details you used at checkout so we can prepare your session and send your booking.
            </p>
            <form onSubmit={submitConfirm} style={{ display: 'grid', gap: 12, maxWidth: 400, margin: '0 auto', textAlign: 'left' }}>
              <input className="rm-focus" placeholder="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} autoComplete="name" style={inp} />
              <input className="rm-focus" placeholder="Email used at checkout" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} autoComplete="email" style={inp} />
              {err && <p role="alert" style={{ color: T.danger, fontSize: 13, margin: 0 }}>{err}</p>}
              <Btn type="submit" full disabled={phase === 'saving'}>{phase === 'saving' ? 'Saving…' : 'Continue to my booking →'}</Btn>
            </form>
          </Reveal>
        )}

        {phase === 'diagnostic' && (
          <>
            <Reveal style={{ textAlign: 'center', marginBottom: 30 }}>
              <div className="rm-eyebrow" style={{ marginBottom: 12 }}>A few questions before we meet</div>
              <h1 className="rm-serif" style={{ fontSize: 'clamp(24px,3.6vw,34px)', margin: 0, fontWeight: 700 }}>Let’s make your 45 minutes count.</h1>
            </Reveal>
            <QuestionFlow questions={DEEP} onComplete={onDeepComplete} />
          </>
        )}

        {phase === 'booking' && <Booking email={email} name={name} onBooked={() => router.push('/10k-roadmap/success')} />}
      </main>
    </div>
  )
}

const inp: React.CSSProperties = { width: '100%', background: '#fff', border: `1px solid ${T.line}`, borderRadius: 12, color: T.text, fontSize: 15.5, padding: '14px 15px', fontFamily: T.sans }

/* ── Native premium booking ────────────────────────────────────────────────*/
type Day = { day: string; slots: string[] }

function Booking({ email, name, onBooked }: { email: string; name: string; onBooked: () => void }) {
  const [tz, setTz] = useState(() => { try { return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC' } catch { return 'UTC' } })
  const [days, setDays] = useState<Day[]>([])
  const [loading, setLoading] = useState(true)
  const [configured, setConfigured] = useState(true)
  const [activeDay, setActiveDay] = useState<string>('')
  const [picked, setPicked] = useState<string>('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')

  useEffect(() => { track('calendar_viewed') }, [])

  useEffect(() => {
    let stop = false
    ;(async () => {
      setLoading(true)
      try {
        const r = await fetch(`/api/10k-roadmap/slots?tz=${encodeURIComponent(tz)}&days=14`, { cache: 'no-store' })
        const j = await r.json()
        if (stop) return
        setConfigured(Boolean(j.configured)); setDays(j.days || []); setActiveDay((j.days?.[0]?.day) || ''); setPicked('')
      } catch { if (!stop) setConfigured(false) }
      finally { if (!stop) setLoading(false) }
    })()
    return () => { stop = true }
  }, [tz])

  const fmtDay = (d: string) => new Date(d + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', timeZone: tz })
  const fmtTime = (iso: string) => new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', timeZone: tz })
  const fmtFull = (iso: string) => new Date(iso).toLocaleString('en-US', { weekday: 'long', month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit', timeZone: tz })

  const confirm = async () => {
    if (!picked) return
    setBusy(true); setErr('')
    try {
      const r = await fetch('/api/10k-roadmap/booking', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name, start: picked, tz }),
      })
      const j = await r.json()
      if (!r.ok || !j.ok) throw new Error(j?.error || 'failed')
      try { sessionStorage.setItem('audit_booking', JSON.stringify(j.booking)) } catch { /* noop */ }
      track('booking_completed')
      onBooked()
    } catch {
      setErr('We couldn’t lock that slot in. Your deposit is safe. Please pick another time and try again (you won’t be charged again).')
      setBusy(false)
    }
  }

  const active = days.find((d) => d.day === activeDay)

  return (
    <div>
      <Reveal style={{ marginBottom: 28 }}>
        <h1 className="rm-serif" style={{ fontSize: 'clamp(26px,4vw,40px)', margin: 0 }}>{BOOK.headline}</h1>
        <p style={{ color: T.text2, fontSize: 17, lineHeight: 1.6, marginTop: 12, maxWidth: 620 }}>{BOOK.sub}</p>
      </Reveal>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,300px) minmax(0,1fr)', gap: 22 }} className="bk-grid">
        {/* Offer summary */}
        <div style={{ background: T.surface, border: `1px solid ${T.line}`, borderRadius: 18, padding: '24px 22px', height: 'fit-content' }}>
          <div className="rm-eyebrow" style={{ marginBottom: 12 }}>{BOOK.offerTitle}</div>
          {BOOK.offerPoints.map((p) => (
            <div key={p} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 11 }}>
              <span style={{ color: T.accentInk, marginTop: 2 }}>•</span>
              <span style={{ fontSize: 14.5, color: T.text2, lineHeight: 1.5 }}>{p}</span>
            </div>
          ))}
          <div style={{ borderTop: `1px solid ${T.line}`, marginTop: 16, paddingTop: 16 }}>
            <label style={{ display: 'block', color: T.text3, fontSize: 12, marginBottom: 6 }}>Your timezone</label>
            <select value={tz} onChange={(e) => setTz(e.target.value)} className="rm-focus"
              style={{ width: '100%', background: T.bg, color: T.text, border: `1px solid ${T.line}`, borderRadius: 10, padding: '10px 12px', fontSize: 14, fontFamily: T.sans }}>
              {[tz, ...TZ_LIST.filter((z) => z !== tz)].map((z) => <option key={z} value={z}>{z.replace(/_/g, ' ')}</option>)}
            </select>
          </div>
        </div>

        {/* Calendar */}
        <div style={{ background: T.surface, border: `1px solid ${T.line}`, borderRadius: 18, padding: '22px 20px', minHeight: 300 }}>
          {loading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 260 }}>
              <div style={{ width: 26, height: 26, borderRadius: '50%', border: `3px solid ${T.line}`, borderTopColor: T.accent, animation: 'rm-spin .8s linear infinite' }} />
            </div>
          ) : !configured ? (
            <CalEmbedFallback />
          ) : (
            <>
              {/* Dates */}
              <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 8, marginBottom: 6 }}>
                {days.map((d) => {
                  const sel = d.day === activeDay
                  return (
                    <button key={d.day} onClick={() => { setActiveDay(d.day); setPicked('') }} className="rm-focus"
                      style={{ flex: '0 0 auto', padding: '10px 14px', borderRadius: 12, cursor: 'pointer', fontSize: 13.5, fontWeight: 600, whiteSpace: 'nowrap',
                        background: sel ? T.accentSoft : T.bg, border: `1px solid ${sel ? T.accent : T.line}`, color: sel ? T.text : T.text2 }}>
                      {fmtDay(d.day)}
                    </button>
                  )
                })}
              </div>
              {/* Times */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(96px,1fr))', gap: 10, marginTop: 14 }}>
                {(active?.slots || []).map((iso) => {
                  const sel = picked === iso
                  return (
                    <button key={iso} onClick={() => { setPicked(iso); track('calendar_time_selected', { start: iso }) }} className="rm-focus"
                      style={{ padding: '12px 8px', borderRadius: 12, cursor: 'pointer', fontSize: 14, fontWeight: 600,
                        background: sel ? T.accent : T.bg, color: sel ? '#fff' : T.text, border: `1px solid ${sel ? T.accent : T.line}` }}>
                      {fmtTime(iso)}
                    </button>
                  )
                })}
                {active && active.slots.length === 0 && <p style={{ color: T.text3, fontSize: 14 }}>No times left this day. Try another.</p>}
              </div>

              {picked && (
                <div style={{ marginTop: 22, borderTop: `1px solid ${T.line}`, paddingTop: 18 }}>
                  <p style={{ color: T.text2, fontSize: 13, margin: '0 0 4px' }}>You’re booking:</p>
                  <p style={{ fontSize: 17, fontWeight: 700, margin: '0 0 2px' }}>{fmtFull(picked)}</p>
                  <p style={{ color: T.text3, fontSize: 13, margin: '0 0 16px' }}>{tz.replace(/_/g, ' ')} · 45 minutes</p>
                  {err && <p role="alert" style={{ color: T.danger, fontSize: 13.5, lineHeight: 1.5, marginBottom: 12 }}>{err}</p>}
                  <Btn onClick={confirm} disabled={busy} full>{busy ? 'Locking it in…' : BOOK.confirmCta}</Btn>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      <p style={{ color: T.text3, fontSize: 12.5, textAlign: 'center', marginTop: 24 }}>{SUCCESS.numbers.sub}</p>
      <style>{`@media(max-width:780px){.bk-grid{grid-template-columns:1fr!important}}`}</style>
    </div>
  )
}

/* If the native slots API returns nothing (cal.com key not set), fall back to
   the official cal.com booking link rather than showing a fake calendar. */
function CalEmbedFallback() {
  return (
    <div style={{ textAlign: 'center', padding: '30px 10px' }}>
      <p style={{ color: T.text2, fontSize: 15, lineHeight: 1.6, marginBottom: 18 }}>Choose your time on the next screen. It opens our live calendar.</p>
      <Btn href="https://cal.com/indrodip-ghosh-ut1vxh/60min" >Open the calendar →</Btn>
    </div>
  )
}
