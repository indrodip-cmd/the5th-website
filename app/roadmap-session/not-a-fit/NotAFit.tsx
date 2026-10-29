'use client'
import { useEffect } from 'react'
import { REJECT, T } from '../content'
import { Fonts, Header, Footer, Btn, Reveal } from '../ui'
import { track } from '../track'

export default function NotAFit() {
  useEffect(() => { track('cta_click', { where: 'not_a_fit_view' }) }, [])
  return (
    <div style={{ minHeight: '100dvh', background: T.bg, color: T.text, fontFamily: T.sans, display: 'flex', flexDirection: 'column' }}>
      <Fonts />
      <Header />
      <main style={{ flex: 1, maxWidth: 720, margin: '0 auto', padding: 'clamp(40px,8vw,90px) 22px 70px', textAlign: 'center' }}>
        <Reveal>
          <div className="rs-eyebrow" style={{ marginBottom: 18 }}>A note on timing</div>
          <h1 className="rs-serif" style={{ fontSize: 'clamp(28px,5vw,46px)', margin: '0 auto', maxWidth: 600 }}>{REJECT.headline}</h1>
          <p style={{ color: T.text2, fontSize: 17, lineHeight: 1.65, margin: '22px auto 0', maxWidth: 540 }}>{REJECT.sub}</p>
        </Reveal>
        <Reveal delay={100} style={{ marginTop: 24 }}>
          <p style={{ color: T.text2, fontSize: 15.5, lineHeight: 1.7, maxWidth: 540, margin: '0 auto' }}>{REJECT.body}</p>
        </Reveal>
        <Reveal delay={180} style={{ marginTop: 36 }}>
          <p className="rs-serif" style={{ fontSize: 'clamp(20px,3.2vw,26px)', color: T.accentInk, maxWidth: 540, margin: '0 auto' }}>{REJECT.dontForce}</p>
        </Reveal>
        <Reveal delay={260} style={{ marginTop: 36 }}>
          <div style={{ background: T.surface, border: `1px solid ${T.line}`, borderRadius: 18, padding: '28px 24px', maxWidth: 500, margin: '0 auto' }}>
            <h2 className="rs-serif" style={{ fontSize: 20, margin: '0 0 10px' }}>{REJECT.altHeading}</h2>
            <p style={{ color: T.text2, fontSize: 14.5, lineHeight: 1.65, margin: '0 0 20px' }}>{REJECT.altBody}</p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
              <Btn href={REJECT.altHref}>{REJECT.altCta}</Btn>
              <Btn href={REJECT.altHref2} variant="ghost">{REJECT.altCta2}</Btn>
            </div>
          </div>
        </Reveal>
      </main>
      <Footer />
    </div>
  )
}
