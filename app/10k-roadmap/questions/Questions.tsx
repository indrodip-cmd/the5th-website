'use client'
/* Step 2 — Deep Questions (embedded Typeform, mandatory). The time is already
   picked; on submit we advance to the Confirmation (thank-you) page. No skip. */
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { auditTypeformId, RESERVED_WHY, T } from '../config'
import { Btn, Reveal } from '../ui'
import { track } from '../track'

type TfApi = { createWidget: (id: string, opts: Record<string, unknown>) => void }

export default function Questions() {
  const router = useRouter()
  const [failed, setFailed] = useState(false)
  const formId = auditTypeformId()

  useEffect(() => { track('deep_application_started') }, [])

  useEffect(() => {
    const SRC = 'https://embed.typeform.com/next/embed.js'
    let done = false
    const mount = (): boolean => {
      const tf = (window as unknown as { tf?: TfApi }).tf
      const container = document.getElementById('tf-container')
      if (!tf || !container || done) return Boolean(done)
      done = true
      tf.createWidget(formId, {
        container, inlineOnMobile: true, opacity: 100,
        onSubmit: () => {
          track('deep_application_completed')
          let email = ''
          try { email = sessionStorage.getItem('audit_email') || '' } catch { /* noop */ }
          setTimeout(() => { router.push(`/10k-roadmap/thank-you${email ? `?email=${encodeURIComponent(email)}` : ''}`) }, 700)
        },
      })
      return true
    }
    if (!document.querySelector(`script[src="${SRC}"]`)) {
      const s = document.createElement('script'); s.src = SRC; s.async = true
      s.onload = () => { if (!mount()) setTimeout(mount, 400) }
      document.body.appendChild(s)
    } else if (!mount()) { setTimeout(mount, 400) }
    const t = setTimeout(() => { const c = document.getElementById('tf-container'); if (c && !c.querySelector('iframe')) setFailed(true) }, 8000)
    return () => clearTimeout(t)
  }, [formId, router])

  return (
    <>
      <Reveal style={{ textAlign: 'center', marginBottom: 20 }}>
        <div className="rm-eyebrow" style={{ marginBottom: 10 }}>Time reserved · Step 2 of 3</div>
        <h1 className="rm-serif" style={{ fontSize: 'clamp(24px,3.6vw,34px)', margin: '0 0 10px', fontWeight: 700 }}>{RESERVED_WHY.headline}</h1>
        <p style={{ color: T.text2, fontSize: 15.5, lineHeight: 1.55, maxWidth: 540, margin: '0 auto' }}>{RESERVED_WHY.body}</p>
        <p style={{ color: T.text3, fontSize: 13, marginTop: 12 }}>{RESERVED_WHY.footnote}</p>
      </Reveal>
      <Reveal>
        <div id="tf-container" style={{ width: '100%', height: 'clamp(560px,72vh,820px)', borderRadius: 16, overflow: 'hidden', border: `1px solid ${T.line}`, background: '#fff', boxShadow: '0 24px 70px -50px rgba(46,26,53,.5)' }} />
      </Reveal>
      {failed && (
        <Reveal style={{ textAlign: 'center', marginTop: 20 }}>
          <p style={{ color: T.text2, fontSize: 14.5, marginBottom: 12 }}>{RESERVED_WHY.errorHint}</p>
          <Btn onClick={() => location.reload()}>{RESERVED_WHY.errorCta}</Btn>
        </Reveal>
      )}
    </>
  )
}
