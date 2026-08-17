'use client'
/* Post-payment experience: verify the deposit (server-side) → deep diagnostic
   → premium native booking. One continuous flow; nothing here is reachable
   without a webhook-confirmed payment. */
import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { DEEP, BOOK, SUCCESS, T } from '../config'
import { Fonts, Header, Btn, QuestionFlow, Reveal } from '../ui'
import { track } from '../track'

type Phase = 'verifying' | 'unpaid' | 'diagnostic' | 'booking'

const TZ_LIST = ['America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles', 'America/Sao_Paulo', 'Europe/London', 'Europe/Berlin', 'Europe/Athens', 'Asia/Dubai', 'Asia/Kolkata', 'Asia/Singapore', 'Australia/Sydney']

// Read the applicant identity once, from the URL or the session it was saved in.
function readIdentity(): { email: string; name: string } {
  if (typeof window === 'undefined') return { email: '', name: '' }
  try {
    const email = (new URLSearchParams(window.location.search).get('email') || '').trim().toLowerCase() || sessionStorage.getItem('audit_email') || ''
    return { email, name: sessionStorage.getItem('audit_name') || '' }
  } catch { return { email: '', name: '' } }
}

export default function Reserved() {
  const router = useRouter()
  const [phase, setPhase] = useState<Phase>('verifying')
  const [{ email, name }] = useState(readIdentity)

  useEffect(() => {
    if (!email) { router.replace('/10k-roadmap/qualify'); return }
    let tries = 0, stop = false
    const poll = async () => {
      tries++
      try {
        const r = await fetch(`/api/10k-roadmap/status?email=${encodeURIComponent(email)}`, { cache: 'no-store' })
        const j = await r.json()
        if (stop) return
        if (j.booked) { router.replace('/10k-roadmap/success'); return }
        if (j.paid) { track('payment_success'); setPhase(j.deepDone ? 'booking' : 'diagnostic'); return }
      } catch { /* keep polling */ }
      if (tries >= 12) { setPhase('unpaid'); return }
      setTimeout(poll, 2500)
    }
    poll()
    return () => { stop = true }
  }, [email, router])

  useEffect(() => { if (phase === 'diagnostic') track('deep_application_started') }, [phase])

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
      <main style={{ maxWidth: phase === 'booking' ? 1040 : 720, margin: '0 auto', padding: 'clamp(30px,6vw,60px) 22px 90px' }}>
        {phase === 'verifying' && <Verifying />}
        {phase === 'unpaid' && <Unpaid email={email} />}
        {phase === 'diagnostic' && (
          <>
            <Reveal style={{ textAlign: 'center', marginBottom: 30 }}>
              <div className="rm-eyebrow" style={{ marginBottom: 12 }}>Deposit confirmed · a few questions before we meet</div>
              <h1 className="rm-serif" style={{ fontSize: 'clamp(24px,3.6vw,34px)', margin: 0 }}>Let’s make your 45 minutes count.</h1>
            </Reveal>
            <QuestionFlow questions={DEEP} onComplete={onDeepComplete} />
          </>
        )}
        {phase === 'booking' && <Booking email={email} name={name} onBooked={() => router.push('/10k-roadmap/success')} />}
      </main>
    </div>
  )
}

function Verifying() {
  return (
    <div style={{ textAlign: 'center', padding: '60px 0' }}>
      <div style={{ width: 34, height: 34, borderRadius: '50%', border: `3px solid ${T.line}`, borderTopColor: T.accent, animation: 'rm-spin .8s linear infinite', margin: '0 auto 22px' }} />
      <h1 className="rm-serif" style={{ fontSize: 26, margin: '0 0 8px' }}>Confirming your deposit…</h1>
      <p style={{ color: T.text2, fontSize: 15 }}>This takes just a moment. Please don’t close this tab.</p>
    </div>
  )
}

function Unpaid({ email }: { email: string }) {
  return (
    <div style={{ textAlign: 'center', padding: '50px 0', maxWidth: 520, margin: '0 auto' }}>
      <h1 className="rm-serif" style={{ fontSize: 26, margin: '0 0 12px' }}>We couldn’t confirm your deposit yet.</h1>
      <p style={{ color: T.text2, fontSize: 15, lineHeight: 1.65, marginBottom: 24 }}>
        Your information is safe. If you just paid, it can take a minute to register — refresh this page. If you haven’t completed the {`$27`} deposit, you can do it now.
      </p>
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
        <Btn onClick={() => location.reload()}>Refresh</Btn>
        <Btn href="/10k-roadmap/reserve" variant="ghost">Back to checkout</Btn>
      </div>
      {email && <p style={{ color: T.text3, fontSize: 12.5, marginTop: 18 }}>Confirming for {email}</p>}
    </div>
  )
}

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
      setErr('We couldn’t lock that slot in. Your deposit is safe — please pick another time and try again (you won’t be charged again).')
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
                        background: sel ? T.accent : T.bg, color: sel ? T.brand : T.text, border: `1px solid ${sel ? T.accent : T.line}` }}>
                      {fmtTime(iso)}
                    </button>
                  )
                })}
                {active && active.slots.length === 0 && <p style={{ color: T.text3, fontSize: 14 }}>No times left this day — try another.</p>}
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
      <p style={{ color: T.text2, fontSize: 15, lineHeight: 1.6, marginBottom: 18 }}>Choose your time on the next screen — it opens our live calendar.</p>
      <Btn href="https://cal.com/indrodip-ghosh-ut1vxh/60min" >Open the calendar →</Btn>
    </div>
  )
}
