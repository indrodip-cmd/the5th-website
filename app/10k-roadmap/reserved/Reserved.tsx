'use client'
/* Post-payment page (the URL Whop redirects to after the $29 deposit).
   Two phases, no page navigation between them:
     1. A short, native one-question-at-a-time intake (type or talk — mic
        button on every text field) — just enough context to make the call
        specific, without a long form right after payment.
     2. The Cal.com scheduler, embedded inline on this same page. On a
        successful booking we record it (record-booking API) and hand off
        to /10k-roadmap/thank-you, which shows the exact date/time plus
        Google / Apple / Outlook "add to calendar" links.
   No skip link on the intake — the audit only works with real answers. */
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import CalEmbed, { getCalApi } from '@calcom/embed-react'
import { auditCalUrl, DEEP, RESERVED_WHY, T } from '../config'
import { Fonts, Header, Reveal, StepLegal, QuestionFlow, saveQualAnswers, loadQualAnswers, getAuditId, useUtm } from '../ui'
import { track } from '../track'

function parseCal(url: string): { calLink: string; namespace: string } {
  const calLink = url.replace(/^https?:\/\/(www\.)?cal\.com\//, '').replace(/\/+$/, '')
  const namespace = calLink.split('/').filter(Boolean).pop() || 'audit'
  return { calLink, namespace }
}

/* Fires a short celebratory sequence — a few confetti bursts from
   alternating sides, firework-style — then calls onDone. Lazy-imports
   canvas-confetti (already a dependency, used the same way on
   /checkout/complete) so it never blocks the initial page load. */
function Celebration({ onDone }: { onDone: () => void }) {
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const mod = await import('canvas-confetti')
        const confetti = mod.default
        const colors = ['#C9FF48', '#F2F6EC', '#7C4DBF']
        const burst = (x: number) => confetti({ particleCount: 70, spread: 80, startVelocity: 45, origin: { x, y: 0.4 }, colors })
        if (!cancelled) { burst(0.2); setTimeout(() => !cancelled && burst(0.8), 250); setTimeout(() => !cancelled && confetti({ particleCount: 110, spread: 100, origin: { y: 0.3 }, colors }), 550) }
      } catch { /* confetti is decorative only — never block the flow */ }
    })()
    const t = setTimeout(onDone, 2400)
    return () => { cancelled = true; clearTimeout(t) }
  }, [onDone])

  return (
    <Reveal style={{ textAlign: 'center', padding: '60px 0' }}>
      <svg width="76" height="76" viewBox="0 0 86 86" style={{ margin: '0 auto 20px', display: 'block' }} aria-hidden>
        <circle cx="43" cy="43" r="40" fill="none" stroke={T.accent} strokeWidth="2.5" strokeDasharray="252" strokeDashoffset="252" style={{ animation: 'rm-draw 0.7s ease forwards' }} />
        <path d="M26 44 l12 12 l22 -24" fill="none" stroke={T.accent} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="60" strokeDashoffset="60" style={{ animation: 'rm-draw 0.45s 0.55s ease forwards' }} />
      </svg>
      <h1 className="rm-serif" style={{ fontSize: 'clamp(30px,5vw,44px)', margin: '0 0 12px', fontWeight: 800 }}>🎉 Congratulations!</h1>
      <p style={{ color: T.text2, fontSize: 16.5, lineHeight: 1.6, maxWidth: 440, margin: '0 auto' }}>You’re officially set up for your business audit. Now let’s lock in your time.</p>
    </Reveal>
  )
}

export default function Reserved() {
  const router = useRouter()
  const utm = useUtm()
  const { calLink, namespace } = parseCal(auditCalUrl())
  const [phase, setPhase] = useState<'intake' | 'celebration' | 'booking'>('intake')
  const [calReady, setCalReady] = useState(false)
  const [me] = useState<{ name: string; email: string }>(() => {
    if (typeof window === 'undefined') return { name: '', email: '' }
    try { return { name: sessionStorage.getItem('audit_name') || '', email: (new URLSearchParams(window.location.search).get('email') || '').toLowerCase() || sessionStorage.getItem('audit_email') || '' } } catch { return { name: '', email: '' } }
  })

  useEffect(() => { track('page_view'); track('deep_application_started') }, [])

  useEffect(() => {
    if (phase !== 'booking') return
    track('calendar_viewed')
    let cancelled = false
    const fallback = setTimeout(() => { if (!cancelled) setCalReady(true) }, 6000)
    ;(async () => {
      try {
        const cal = await getCalApi({ namespace })
        if (cancelled) return
        cal('ui', { hideEventTypeDetails: false, layout: 'month_view' })
        cal('on', { action: 'linkReady', callback: () => { if (!cancelled) setCalReady(true) } })
        cal('on', {
          action: 'bookingSuccessful',
          callback: (e: unknown) => {
            const d = ((e as { detail?: { data?: Record<string, unknown> } })?.detail?.data) || {}
            const b = (d.booking as Record<string, unknown>) || d
            const att = ((b.attendees as Array<Record<string, unknown>>)?.[0]) || {}
            const start = String(b.startTime || d.date || b.start || '')
            const email = String(att.email || me.email || '').toLowerCase()
            const name = String(att.name || me.name || '')
            track('booking_completed')
            if (email && start) {
              fetch('/api/10k-roadmap/record-booking', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, name, start, qualification: loadQualAnswers(), audit_id: getAuditId(), utm }),
              }).catch(() => {})
              try { sessionStorage.setItem('audit_email', email); if (name) sessionStorage.setItem('audit_name', name) } catch { /* noop */ }
            }
            router.push(`/10k-roadmap/thank-you${email ? `?email=${encodeURIComponent(email)}` : ''}`)
          },
        })
      } catch { /* embed still renders; booking still recorded via email lookup fallback */ }
    })()
    return () => { cancelled = true; clearTimeout(fallback) }
  }, [phase, namespace, me, router, utm])

  return (
    <div style={{ minHeight: '100dvh', background: T.bg, color: T.text, fontFamily: T.sans, display: 'flex', flexDirection: 'column' }}>
      <Fonts />
      <Header />
      <main style={{ flex: 1, width: '100%', maxWidth: phase === 'booking' ? 900 : 680, margin: '0 auto', padding: 'clamp(26px,5vw,44px) clamp(16px,4vw,22px) 44px' }}>
        {phase === 'intake' && (
          <>
            <Reveal style={{ textAlign: 'center', marginBottom: 22 }}>
              <div className="rm-eyebrow" style={{ marginBottom: 10 }}>{RESERVED_WHY.eyebrow}</div>
              <h1 className="rm-serif" style={{ fontSize: 'clamp(26px,4vw,38px)', margin: '0 0 12px', fontWeight: 700 }}>{RESERVED_WHY.headline}</h1>
              <p style={{ color: T.text2, fontSize: 16, lineHeight: 1.6, maxWidth: 520, margin: '0 auto' }}>{RESERVED_WHY.body}</p>
              <p style={{ color: T.text3, fontSize: 13, marginTop: 14 }}>{RESERVED_WHY.footnote}</p>
            </Reveal>
            <Reveal>
              <div style={{ background: T.surface, border: `1px solid ${T.line}`, borderRadius: 20, padding: 'clamp(20px,4vw,32px)', boxShadow: '0 24px 70px -50px rgba(0,0,0,.5)' }}>
                <QuestionFlow
                  questions={DEEP}
                  onComplete={(answers) => {
                    saveQualAnswers({ ...loadQualAnswers(), ...answers })
                    track('deep_application_completed')
                    setPhase('celebration')
                  }}
                />
              </div>
            </Reveal>
          </>
        )}

        {phase === 'celebration' && <Celebration onDone={() => setPhase('booking')} />}

        {phase === 'booking' && (
          <>
            <Reveal style={{ textAlign: 'center', marginBottom: 20 }}>
              <div className="rm-eyebrow" style={{ marginBottom: 10 }}>{RESERVED_WHY.bookingEyebrow}</div>
              <h1 className="rm-serif" style={{ fontSize: 'clamp(26px,4vw,38px)', margin: '0 0 10px', fontWeight: 700 }}>{RESERVED_WHY.bookingHeadline}</h1>
              <p style={{ color: T.text2, fontSize: 15.5, lineHeight: 1.55, maxWidth: 520, margin: '0 auto' }}>{RESERVED_WHY.bookingSub}</p>
            </Reveal>
            <Reveal>
              <div style={{ position: 'relative', borderRadius: 16, overflow: 'hidden', border: `1px solid ${T.line}`, background: '#fff', boxShadow: '0 24px 70px -50px rgba(0,0,0,.5)', minHeight: 560 }}>
                {!calReady && (
                  <div aria-hidden style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14, background: '#fff', zIndex: 2 }}>
                    <span className="rm-cal-spin" style={{ width: 34, height: 34, borderRadius: '50%', border: `3px solid ${T.line}`, borderTopColor: T.accentInk, display: 'block' }} />
                    <span style={{ color: T.text2, fontSize: 14, fontWeight: 600 }}>Loading available times…</span>
                  </div>
                )}
                <CalEmbed namespace={namespace} calLink={calLink} style={{ width: '100%', height: '100%', minHeight: 560, overflow: 'scroll' }} config={{ layout: 'month_view', useSlotsViewOnSmallScreen: 'true', name: me.name, email: me.email }} />
              </div>
            </Reveal>
          </>
        )}
      </main>
      <StepLegal />
      <style>{`@keyframes rm-cal-spin{to{transform:rotate(360deg)}}.rm-cal-spin{animation:rm-cal-spin .8s linear infinite}`}</style>
    </div>
  )
}
