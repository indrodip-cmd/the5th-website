'use client'
/* Step 4 — Pick a Time. Embeds the cal.com scheduler (prefilled with the
   buyer's name/email). On a successful booking we record the appointment
   (markBooked + confirmation email) and advance to Confirmation. */
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Cal, { getCalApi } from '@calcom/embed-react'
import { auditCalUrl, SCHEDULE, T } from '../config'
import { Reveal, loadQualAnswers, getAuditId, useUtm } from '../ui'
import { track } from '../track'

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

  useEffect(() => { track('calendar_viewed') }, [])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const cal = await getCalApi({ namespace })
        if (cancelled) return
        cal('ui', { hideEventTypeDetails: false, layout: 'month_view' })
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
              // qualification answers (no prior payment step to do it), then
              // marks it booked + fires the confirmation email.
              fetch('/api/10k-roadmap/record-booking', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, name, start, qualification: loadQualAnswers(), audit_id: getAuditId(), utm }),
              }).catch(() => {})
              try { sessionStorage.setItem('audit_email', email); if (name) sessionStorage.setItem('audit_name', name) } catch { /* noop */ }
            }
            router.push(`/10k-roadmap/questions${email ? `?email=${encodeURIComponent(email)}` : ''}`)
          },
        })
      } catch { /* embed will still render; booking sync falls back to email lookup */ }
    })()
    return () => { cancelled = true }
  }, [namespace, me, router, utm])

  return (
    <>
      <Reveal style={{ textAlign: 'center', marginBottom: 20 }}>
        <div className="rm-eyebrow" style={{ marginBottom: 10 }}>{SCHEDULE.eyebrow}</div>
        <h1 className="rm-serif" style={{ fontSize: 'clamp(26px,4vw,38px)', margin: '0 0 10px', fontWeight: 700 }}>{SCHEDULE.headline}</h1>
        <p style={{ color: T.text2, fontSize: 15.5, lineHeight: 1.55, maxWidth: 520, margin: '0 auto' }}>{SCHEDULE.sub}</p>
      </Reveal>
      <Reveal>
        <div style={{ borderRadius: 16, overflow: 'hidden', border: `1px solid ${T.line}`, background: '#fff', boxShadow: '0 24px 70px -50px rgba(46,26,53,.5)', minHeight: 560 }}>
          <Cal namespace={namespace} calLink={calLink} style={{ width: '100%', height: '100%', minHeight: 560, overflow: 'scroll' }} config={{ layout: 'month_view', useSlotsViewOnSmallScreen: 'true', name: me.name, email: me.email }} />
        </div>
      </Reveal>
    </>
  )
}
