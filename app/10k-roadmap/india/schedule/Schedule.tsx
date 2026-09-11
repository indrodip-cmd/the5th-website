'use client'
/* Step 1 — Pick a Time (India). Embeds the cal.com scheduler. On a successful
   booking we record the appointment (shared /api/10k-roadmap/record-booking —
   which creates/backfills the lead from the qualification answers and emails a
   confirmation) and advance to the deep-questions step. */
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Cal, { getCalApi } from '@calcom/embed-react'
import { auditCalUrl, SCHEDULE, T } from '../config'
import { Reveal, loadQualAnswers, getAuditId, useUtm } from '../../ui'
import { track } from '../../track'

function parseCal(url: string): { calLink: string; namespace: string } {
  const calLink = url.replace(/^https?:\/\/(www\.)?cal\.com\//, '').replace(/\/+$/, '')
  const namespace = calLink.split('/').filter(Boolean).pop() || 'audit'
  return { calLink, namespace }
}

export default function Schedule() {
  const router = useRouter()
  const utm = useUtm()
  const { calLink, namespace } = parseCal(auditCalUrl())
  const [me] = useState<{ name: string; email: string }>(() => {
    if (typeof window === 'undefined') return { name: '', email: '' }
    try { return { name: sessionStorage.getItem('audit_name') || '', email: (new URLSearchParams(window.location.search).get('email') || '').toLowerCase() || sessionStorage.getItem('audit_email') || '' } } catch { return { name: '', email: '' } }
  })
  const [calReady, setCalReady] = useState(false)

  useEffect(() => { track('calendar_viewed') }, [])

  useEffect(() => {
    let cancelled = false
    // Fallback: never leave the skeleton up forever if the embed's ready event
    // doesn't fire (slow network, blocked event, etc.).
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
              // Free funnel: this call also creates/backfills the lead from the
              // qualification answers, then marks it booked + fires the email.
              fetch('/api/10k-roadmap/record-booking', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, name, start, qualification: loadQualAnswers(), audit_id: getAuditId(), utm }),
              }).catch(() => {})
              try { sessionStorage.setItem('audit_email', email); if (name) sessionStorage.setItem('audit_name', name) } catch { /* noop */ }
            }
            router.push(`/10k-roadmap/india/questions${email ? `?email=${encodeURIComponent(email)}` : ''}`)
          },
        })
      } catch { /* embed will still render; booking sync falls back to email lookup */ }
    })()
    return () => { cancelled = true; clearTimeout(fallback) }
  }, [namespace, me, router, utm])

  return (
    <>
      <Reveal style={{ textAlign: 'center', marginBottom: 20 }}>
        <div className="rm-eyebrow" style={{ marginBottom: 10 }}>{SCHEDULE.eyebrow}</div>
        <h1 className="rm-serif" style={{ fontSize: 'clamp(26px,4vw,38px)', margin: '0 0 10px', fontWeight: 700 }}>{SCHEDULE.headline}</h1>
        <p style={{ color: T.text2, fontSize: 15.5, lineHeight: 1.55, maxWidth: 520, margin: '0 auto' }}>{SCHEDULE.sub}</p>
      </Reveal>
      <Reveal>
        <div style={{ position: 'relative', borderRadius: 16, overflow: 'hidden', border: `1px solid ${T.line}`, background: '#fff', boxShadow: '0 24px 70px -50px rgba(46,26,53,.5)', minHeight: 560 }}>
          {!calReady && (
            <div aria-hidden style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14, background: '#fff', zIndex: 2 }}>
              <span className="rm-cal-spin" style={{ width: 34, height: 34, borderRadius: '50%', border: `3px solid ${T.line}`, borderTopColor: T.accentInk, display: 'block' }} />
              <span style={{ color: T.text2, fontSize: 14, fontWeight: 600 }}>{SCHEDULE.loading || 'Loading available times…'}</span>
            </div>
          )}
          <Cal namespace={namespace} calLink={calLink} style={{ width: '100%', height: '100%', minHeight: 560, overflow: 'scroll' }} config={{ layout: 'month_view', useSlotsViewOnSmallScreen: 'true', name: me.name, email: me.email }} />
        </div>
      </Reveal>
      <style>{`@keyframes rm-cal-spin{to{transform:rotate(360deg)}}.rm-cal-spin{animation:rm-cal-spin .8s linear infinite}`}</style>
    </>
  )
}
