'use client'
/* Rejection (India) — but it preserves the relationship. We reject the
   timing/fit, not the person. Reuses the shared UI kit; copy from ../config. */
import { Suspense, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { REJECT, LEGAL, T } from '../config'
import { Fonts, Header, Footer, Btn, Reveal } from '../../ui'
import { track } from '../../track'

function Body() {
  const params = useSearchParams()
  const reason = params.get('r') || 'default'
  const explanation = REJECT.reasons[reason] || REJECT.reasons.default
  useEffect(() => { track('qualification_rejected', { reason, view: true }) }, [reason])

  return (
    <main style={{ maxWidth: 720, margin: '0 auto', padding: 'clamp(50px,10vw,110px) 22px 90px', textAlign: 'center' }}>
      <Reveal>
        <div className="rm-eyebrow" style={{ marginBottom: 22 }}>A note on timing</div>
        <h1 className="rm-serif" style={{ fontSize: 'clamp(30px,5.4vw,52px)', margin: '0 auto', maxWidth: 620 }}>{REJECT.headline}</h1>
        <p style={{ color: T.text2, fontSize: 18, lineHeight: 1.65, margin: '24px auto 0', maxWidth: 560 }}>{REJECT.sub}</p>
      </Reveal>
      <Reveal delay={120} style={{ marginTop: 30 }}>
        <p style={{ color: T.text2, fontSize: 16, lineHeight: 1.75, maxWidth: 560, margin: '0 auto' }}>{explanation}</p>
      </Reveal>
      <Reveal delay={200} style={{ marginTop: 44 }}>
        <p className="rm-serif" style={{ fontSize: 'clamp(22px,3.4vw,30px)', color: T.accentInk, maxWidth: 560, margin: '0 auto 8px' }}>{REJECT.dontForce}</p>
      </Reveal>
      <Reveal delay={280} style={{ marginTop: 40 }}>
        <div style={{ background: T.surface, border: `1px solid ${T.line}`, borderRadius: 18, padding: '30px 26px', maxWidth: 520, margin: '0 auto' }}>
          <h2 className="rm-serif" style={{ fontSize: 22, margin: '0 0 10px' }}>{REJECT.altHeading}</h2>
          <p style={{ color: T.text2, fontSize: 15, lineHeight: 1.65, margin: '0 0 22px' }}>{REJECT.altBody}</p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
            <Btn href={REJECT.altHref}>{REJECT.altCta}</Btn>
            <Btn href={REJECT.altHref2} variant="ghost">{REJECT.altCta2}</Btn>
          </div>
        </div>
      </Reveal>
    </main>
  )
}

export default function NotAFit() {
  return (
    <div style={{ minHeight: '100dvh', background: T.bg, color: T.text, fontFamily: T.sans, display: 'flex', flexDirection: 'column' }}>
      <Fonts />
      <Header />
      <div style={{ flex: 1 }}>
        <Suspense fallback={null}><Body /></Suspense>
      </div>
      <Footer legal={LEGAL} />
    </div>
  )
}
