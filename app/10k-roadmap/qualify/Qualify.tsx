'use client'
/* Qualification — 5 questions, one at a time, pre-payment. A `reject` option
   routes to /not-a-fit; otherwise we carry the answers to /reserve. No email
   is collected here (that happens at the deposit step). */
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { QUALIFICATION, QUALIFY, LANDING, T } from '../config'
import { Fonts, Header, QuestionFlow, saveQualAnswers, useUtm } from '../ui'
import { track } from '../track'

export default function Qualify() {
  const router = useRouter()
  useUtm()
  useEffect(() => { track('qualification_started') }, [])

  return (
    <div style={{ minHeight: '100dvh', background: T.bg, color: T.text, fontFamily: T.sans }}>
      <Fonts />
      <Header />
      <main style={{ maxWidth: 720, margin: '0 auto', padding: 'clamp(30px,6vw,64px) 22px 80px' }}>
        <QuestionFlow
          questions={QUALIFICATION}
          eyebrow={QUALIFY.eyebrow}
          onReject={(reason, answers) => {
            saveQualAnswers(answers)
            const q = QUALIFICATION.find((x) => 'options' in x && x.options.some((o) => o.reject && o.value === reason))
            // Map the rejecting question to a human reason bucket for the page.
            const bucket = q?.id === 'business_type' ? 'no_business' : q?.id === 'readiness' ? 'free_advice' : 'default'
            track('qualification_completed'); track('qualification_rejected', { reason: bucket })
            router.push(`/10k-roadmap/not-a-fit?r=${bucket}`)
          }}
          onComplete={(answers) => {
            saveQualAnswers(answers)
            track('qualification_completed'); track('qualification_accepted')
            router.push('/10k-roadmap/reserve')
          }}
        />
        <p style={{ textAlign: 'center', color: T.text3, fontSize: 12.5, marginTop: 40 }}>{LANDING.ctaMicro}</p>
      </main>
    </div>
  )
}
