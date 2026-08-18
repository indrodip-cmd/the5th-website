'use client'
/* Post-payment page (the URL Whop redirects to after the $27 deposit).
   Two things, exactly:
     1. An embedded Typeform with the deep pre-call questions.
     2. On submit, the buyer is auto-redirected to the cal.com booking page.
   Form id + cal URL are configurable in config.ts (env-overridable). If the
   Typeform can't load (blocked/misconfigured), a direct "book your call" button
   is shown so the buyer is never stuck. */
import { useEffect, useState } from 'react'
import { auditTypeformId, auditCalUrl, T } from '../config'
import { Fonts, Header, Btn, Reveal } from '../ui'
import { track } from '../track'

type TfApi = { createWidget: (id: string, opts: Record<string, unknown>) => void }

export default function Reserved() {
  const [failed, setFailed] = useState(false)
  const formId = auditTypeformId()
  const cal = auditCalUrl()

  useEffect(() => { track('page_view'); track('deep_application_started') }, [])

  useEffect(() => {
    const SRC = 'https://embed.typeform.com/next/embed.js'
    let done = false

    const mount = (): boolean => {
      const tf = (window as unknown as { tf?: TfApi }).tf
      const container = document.getElementById('tf-container')
      if (!tf || !container || done) return Boolean(done)
      done = true
      tf.createWidget(formId, {
        container,
        inlineOnMobile: true,
        opacity: 100,
        onSubmit: () => {
          track('deep_application_completed'); track('calendar_viewed')
          // Small beat so Typeform's own "submitted" state shows, then to cal.com.
          setTimeout(() => { window.location.href = cal }, 900)
        },
      })
      return true
    }

    if (!document.querySelector(`script[src="${SRC}"]`)) {
      const s = document.createElement('script')
      s.src = SRC; s.async = true
      s.onload = () => { if (!mount()) setTimeout(mount, 400) }
      document.body.appendChild(s)
    } else if (!mount()) {
      setTimeout(mount, 400)
    }

    // If the form iframe never appears, offer the direct booking fallback.
    const t = setTimeout(() => {
      const c = document.getElementById('tf-container')
      if (c && !c.querySelector('iframe')) setFailed(true)
    }, 8000)
    return () => clearTimeout(t)
  }, [formId, cal])

  return (
    <div style={{ minHeight: '100dvh', background: T.bg, color: T.text, fontFamily: T.sans, display: 'flex', flexDirection: 'column' }}>
      <Fonts />
      <Header />
      <main style={{ flex: 1, width: '100%', maxWidth: 900, margin: '0 auto', padding: 'clamp(26px,5vw,44px) clamp(16px,4vw,22px) 40px' }}>
        <Reveal style={{ textAlign: 'center', marginBottom: 22 }}>
          <svg width="56" height="56" viewBox="0 0 86 86" style={{ margin: '0 auto 14px', display: 'block' }} aria-hidden>
            <circle cx="43" cy="43" r="40" fill="none" stroke={T.accent} strokeWidth="2.5" strokeDasharray="252" strokeDashoffset="252" style={{ animation: 'rm-draw 0.8s ease forwards' }} />
            <path d="M26 44 l12 12 l22 -24" fill="none" stroke={T.accent} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="60" strokeDashoffset="60" style={{ animation: 'rm-draw 0.5s 0.6s ease forwards' }} />
          </svg>
          <div className="rm-eyebrow" style={{ marginBottom: 10 }}>Deposit received</div>
          <h1 className="rm-serif" style={{ fontSize: 'clamp(26px,4vw,38px)', margin: '0 0 8px', fontWeight: 700 }}>You’re in. One quick step, then pick your time.</h1>
          <p style={{ color: T.text2, fontSize: 15.5, lineHeight: 1.55, maxWidth: 480, margin: '0 auto' }}>
            Answer a few questions so your 45-minute audit is built around your business. You’ll go straight to the calendar right after.
          </p>
        </Reveal>

        <Reveal>
          <div id="tf-container" style={{ width: '100%', height: 'clamp(560px,76vh,820px)', borderRadius: 16, overflow: 'hidden', border: `1px solid ${T.line}`, background: '#fff', boxShadow: '0 24px 70px -50px rgba(46,26,53,.5)' }} />
        </Reveal>

        {failed && (
          <Reveal style={{ textAlign: 'center', marginTop: 22 }}>
            <p style={{ color: T.text2, fontSize: 14.5, marginBottom: 12 }}>Trouble loading the questions? You can go straight to booking your call.</p>
            <Btn href={cal} onClick={() => track('calendar_viewed')}>Book my audit call →</Btn>
          </Reveal>
        )}

        <p style={{ textAlign: 'center', marginTop: 18 }}>
          <a href={cal} onClick={() => track('calendar_viewed')} style={{ color: T.text3, fontSize: 12.5, textDecoration: 'underline', textUnderlineOffset: 3 }}>Skip to booking your call →</a>
        </p>
      </main>
    </div>
  )
}
