'use client'
/* Qualification, 5 questions, one at a time. A `reject` option routes to
   /not-a-fit. On success we send the applicant STRAIGHT to the Whop $27
   checkout (no in-site reserve page). Whop is configured to redirect back to
   /10k-roadmap/reserved after payment, where the deposit is verified and the
   diagnostic + booking happen. The qualification answers ride in sessionStorage
   and are saved to the lead on the post-payment page. */
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { QUALIFICATION, QUALIFY, LANDING, DEPOSIT, AUDIT_CHECKOUT_URL, T } from '../config'
import { Fonts, Header, QuestionFlow, Reveal, saveQualAnswers, useUtm } from '../ui'
import { track } from '../track'

function whopCheckoutUrl(): string {
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://the5th.consulting'
  const redirect = `${origin}/10k-roadmap/reserved`
  // redirect_url is honoured by Whop when set; if a plan-level redirect is
  // configured in the Whop dashboard it takes over. Either way we land back on
  // /10k-roadmap/reserved after payment.
  return `${AUDIT_CHECKOUT_URL}?redirect_url=${encodeURIComponent(redirect)}`
}

export default function Qualify() {
  const router = useRouter()
  const [redirecting, setRedirecting] = useState(false)
  useUtm()
  useEffect(() => { track('qualification_started') }, [])

  return (
    <div style={{ minHeight: '100dvh', background: T.bg, color: T.text, fontFamily: T.sans }}>
      <Fonts />
      <Header />
      <main style={{ maxWidth: 720, margin: '0 auto', padding: 'clamp(30px,6vw,64px) 22px 80px' }}>
        {redirecting ? (
          <Reveal style={{ textAlign: 'center', padding: '50px 0' }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', border: `3px solid ${T.line}`, borderTopColor: T.accent, animation: 'rm-spin .8s linear infinite', margin: '0 auto 22px' }} />
            <div className="rm-eyebrow" style={{ marginBottom: 12 }}>You qualified</div>
            <h1 className="rm-serif" style={{ fontSize: 'clamp(26px,4vw,34px)', margin: '0 0 10px', fontWeight: 700 }}>Reserving your private audit slot…</h1>
            <p style={{ color: T.text2, fontSize: 15, lineHeight: 1.55, maxWidth: 460, margin: '0 auto' }}>
              Taking you to secure checkout for your {DEPOSIT.label} commitment deposit. If it doesn’t open,{' '}
              <a href={whopCheckoutUrl()} style={{ color: T.accentInk, fontWeight: 600, textDecoration: 'underline' }}>click here</a>.
            </p>
          </Reveal>
        ) : (
          <>
            <QuestionFlow
              questions={QUALIFICATION}
              eyebrow={QUALIFY.eyebrow}
              onReject={(reason, answers) => {
                saveQualAnswers(answers)
                const q = QUALIFICATION.find((x) => 'options' in x && x.options.some((o) => o.reject && o.value === reason))
                const bucket = q?.id === 'business_type' ? 'no_business' : q?.id === 'readiness' ? 'free_advice' : 'default'
                track('qualification_completed'); track('qualification_rejected', { reason: bucket })
                router.push(`/10k-roadmap/not-a-fit?r=${bucket}`)
              }}
              onComplete={(answers) => {
                saveQualAnswers(answers)
                track('qualification_completed'); track('qualification_accepted')
                track('checkout_started', { value: DEPOSIT.amount, currency: DEPOSIT.currency })
                setRedirecting(true)
                setTimeout(() => { window.location.href = whopCheckoutUrl() }, 900)
              }}
            />
            <p style={{ textAlign: 'center', color: T.text3, fontSize: 12.5, marginTop: 40 }}>{LANDING.ctaMicro}</p>
          </>
        )}
      </main>
    </div>
  )
}
