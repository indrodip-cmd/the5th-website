'use client'
/* Pick a Time — cal.com embed, prefilled with the name/email the quiz just
   captured (brief P1 item 12: "pass name and email into the booking URL as
   prefill"). On a successful booking, records it via
   /api/roadmap-session/record-booking (fires Schedule + CRM + confirmation
   email) and redirects to the thank-you page. */
import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Cal, { getCalApi } from '@calcom/embed-react'
import { calUrl, T } from '../content'
import { Fonts, Header, Footer, Reveal, saveRsEmail, saveRsName, loadRsEmail, loadRsName } from '../ui'
import { track } from '../track'

function parseCal(url: string): { calLink: string; namespace: string } {
  const calLink = url.replace(/^https?:\/\/(www\.)?cal\.com\//, '').replace(/\/+$/, '')
  const namespace = calLink.split('/').filter(Boolean).pop() || 'roadmap-session'
  return { calLink, namespace }
}

export default function Schedule() {
  const router = useRouter()
  const params = useSearchParams()
  const { calLink, namespace } = parseCal(calUrl())
  const [me] = useState<{ name: string; email: string }>(() => ({
    name: params.get('name') || loadRsName(),
    email: (params.get('email') || '').toLowerCase() || loadRsEmail(),
  }))
  const [calReady, setCalReady] = useState(false)

  useEffect(() => { if (me.email) saveRsEmail(me.email); if (me.name) saveRsName(me.name) }, [me])

  useEffect(() => {
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
            const eventId = `rs-sched-${Date.now()}`
            if (email && start) {
              fetch('/api/roadmap-session/record-booking', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, name, start, eventId, pageUrl: window.location.href }),
              }).then(() => track('Schedule', { eventId })).catch(() => {})
              saveRsEmail(email); if (name) saveRsName(name)
            }
            router.push(`/roadmap-session/thank-you?email=${encodeURIComponent(email)}`)
          },
        })
      } catch { /* embed will still render; booking sync falls back to email lookup on the thank-you page */ }
    })()
    return () => { cancelled = true; clearTimeout(fallback) }
  }, [namespace, me, router])

  return (
    <div style={{ minHeight: '100dvh', background: T.bg, color: T.text, fontFamily: T.sans, display: 'flex', flexDirection: 'column' }}>
      <Fonts />
      <Header />
      <main style={{ flex: 1, maxWidth: 760, margin: '0 auto', width: '100%', padding: 'clamp(28px,5vw,44px) clamp(20px,4vw,22px) 48px' }}>
        <Reveal style={{ textAlign: 'center', marginBottom: 20 }}>
          <div className="rs-eyebrow" style={{ marginBottom: 10 }}>You’re qualified</div>
          <h1 className="rs-serif" style={{ fontSize: 'clamp(24px,4vw,36px)', margin: '0 0 10px', fontWeight: 800 }}>Choose your free session time.</h1>
          <p style={{ color: T.text2, fontSize: 15.5, lineHeight: 1.55, maxWidth: 520, margin: '0 auto' }}>Free, 60 minutes, 1:1 with Indrodip. Not a pitch.</p>
        </Reveal>
        <Reveal>
          <div style={{ position: 'relative', borderRadius: 16, overflow: 'hidden', border: `1px solid ${T.line}`, background: '#fff', boxShadow: '0 24px 70px -50px rgba(46,26,53,.5)', minHeight: 560 }}>
            {!calReady && (
              <div aria-hidden style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14, background: '#fff', zIndex: 2 }}>
                <span style={{ width: 34, height: 34, borderRadius: '50%', border: `3px solid ${T.line}`, borderTopColor: T.accentInk, display: 'block', animation: 'rs-spin .8s linear infinite' }} />
                <span style={{ color: T.text2, fontSize: 14, fontWeight: 600 }}>Loading available times…</span>
              </div>
            )}
            <Cal namespace={namespace} calLink={calLink} style={{ width: '100%', height: '100%', minHeight: 560, overflow: 'scroll' }} config={{ layout: 'month_view', useSlotsViewOnSmallScreen: 'true', name: me.name, email: me.email }} />
          </div>
        </Reveal>
      </main>
      <Footer />
    </div>
  )
}
