'use client'
/* Direct in-site checkout — same dark/lime visual system as the rest of
   /10k-roadmap (shared Fonts/Header/Btn/Reveal kit from ../10k-roadmap/ui),
   so landing on this page never feels like leaving the site. */
import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { BLOCKERS } from '@/lib/quiz/content'
import { BLOCKER_IDS, type BlockerId } from '@/lib/quiz/questions'
import { Checkout, CheckoutElement, WhopElements } from '@whop/elements-react'
import { loadWhop } from '@whop/elements'
import { PAY, DEPOSIT, T, auditDirectPlanId } from '../10k-roadmap/config'
import { Fonts, Header, Reveal, StepLegal } from '../10k-roadmap/ui'
import { track } from '../10k-roadmap/track'

const PAYMENT_LOGOS = [
  { name: 'Visa', src: '/images/payment/visa.png', h: 15 },
  { name: 'Mastercard', src: '/images/payment/mastercard.png', h: 22 },
  { name: 'American Express', src: '/images/payment/amex.png', h: 26 },
  { name: 'Cash App', src: '/images/payment/cashapp.png', h: 18 },
]

function LockIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
      <rect x="4" y="11" width="16" height="9" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  )
}

export default function AuditCheckout() {
  useEffect(() => { track('page_view') }, [])
  const sp = useSearchParams()
  const fromQuiz = sp.get('src') === 'quiz'
  const pId = sp.get('p') as BlockerId | null
  const sId = sp.get('s') as BlockerId | null
  const P = fromQuiz && pId && BLOCKER_IDS.includes(pId) ? BLOCKERS[pId] : null
  const S = fromQuiz && sId && BLOCKER_IDS.includes(sId) ? BLOCKERS[sId] : null

  return (
    <div style={{ minHeight: '100dvh', background: T.bg, color: T.text, fontFamily: T.sans }}>
      <Fonts />
      <Header />
      <main style={{ maxWidth: 1080, margin: '0 auto', padding: 'clamp(26px,5vw,48px) clamp(16px,4vw,22px) 80px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(460px,540px)', gap: 40, alignItems: 'start' }} className="ac-grid">
          {/* Left — what they're paying for */}
          <Reveal>
            {P && (
              <div style={{ background: T.surface, border: `1px solid ${T.accent}`, borderRadius: 14, padding: '14px 16px', marginBottom: 22 }}>
                <div className="rm-eyebrow" style={{ marginBottom: 6 }}>Your Income Blocker Report is attached</div>
                <p style={{ margin: 0, fontSize: 15, lineHeight: 1.55, color: T.text }}>We will start your audit from your report: <b>{P.name}</b>{S ? <> and <b>{S.name}</b></> : null}. Book below and we arrive prepared.</p>
              </div>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 22 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <span style={{ display: 'inline-flex', flexShrink: 0 }}>
                <img src="/images/founder-og.jpg" alt="Indrodip Ghosh" width={48} height={48} style={{ borderRadius: '50%', objectFit: 'cover', border: `1.5px solid ${T.line}` }} />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/images/manisha-avatar.jpg" alt="Manisha Satpute" width={48} height={48} style={{ borderRadius: '50%', objectFit: 'cover', border: `1.5px solid ${T.line}`, marginLeft: -14 }} />
              </span>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: T.text }}>Indrodip Ghosh &amp; Manisha Satpute</div>
                <div style={{ fontSize: 12.5, color: T.text2 }}>The5th Global Consulting</div>
              </div>
            </div>

            <div className="rm-eyebrow" style={{ marginBottom: 12 }}>{PAY.eyebrow}</div>
            <h1 className="rm-serif" style={{ fontSize: 'clamp(26px,4.2vw,40px)', margin: '0 0 14px', fontWeight: 700, lineHeight: 1.08 }}>{PAY.headline}</h1>
            <p style={{ color: T.text2, fontSize: 16.5, lineHeight: 1.6, marginBottom: 16 }}>{PAY.sub}</p>
            <p style={{ color: T.text, fontSize: 15.5, lineHeight: 1.55, marginBottom: 20, fontWeight: 600 }}>{PAY.notPitch}</p>

            <p style={{ color: T.text, fontSize: 15, fontWeight: 700, margin: '0 0 12px' }}>{PAY.coverLead}</p>
            <div style={{ display: 'grid', gap: 11, marginBottom: 20 }}>
              {PAY.points.map((p) => (
                <div key={p} style={{ display: 'flex', gap: 11, alignItems: 'flex-start' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={T.accentInk} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" style={{ marginTop: 2, flexShrink: 0 }}><polyline points="20 6 9 17 4 12" /></svg>
                  <span style={{ fontSize: 15, lineHeight: 1.5 }}>{p}</span>
                </div>
              ))}
            </div>

            <p style={{ color: T.text2, fontSize: 15, lineHeight: 1.6, marginBottom: 18 }}>{PAY.fit}</p>
            <p style={{ color: T.text2, fontSize: 15, lineHeight: 1.6, marginBottom: 18 }}>{PAY.deposit}</p>

            <div style={{ background: T.surface, border: `1px solid ${T.accent}`, borderRadius: 14, padding: '16px 18px', display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 22 }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={T.accentInk} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 1 }}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="M9 12l2 2 4-4" /></svg>
              <p style={{ margin: 0, fontSize: 14.5, lineHeight: 1.6, color: T.text }}>
                <b style={{ color: T.accentInk, fontWeight: 800 }}>{PAY.guaranteeTitle}:</b> {PAY.guaranteeBody}
              </p>
            </div>

          </Reveal>

          {/* Right — payment */}
          <Reveal delay={80}>
            <div className="rm-glass" style={{ borderRadius: 20, padding: 'clamp(20px,3vw,28px) clamp(16px,2.5vw,22px)', position: 'sticky', top: 90 }}>
              <div style={{ fontSize: 17, fontWeight: 800, marginBottom: 4, color: T.text }}>Payment Details</div>
              <div style={{ width: 36, height: 3, borderRadius: 2, background: T.accent, marginBottom: 18 }} />

              <p style={{ color: T.text2, fontSize: 13.5, lineHeight: 1.5, margin: '0 0 14px' }}>One-time payment: <b style={{ color: T.text }}>${DEPOSIT.amount}.00 USD</b></p>
              <WhopEmbed planId={auditDirectPlanId()} />

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, flexWrap: 'wrap', marginTop: 18, paddingTop: 16, borderTop: `1px solid ${T.line}` }}>
                {PAYMENT_LOGOS.map((l) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={l.name} src={l.src} alt={l.name} style={{ height: l.h, width: 'auto' }} />
                ))}
              </div>
              <p style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, textAlign: 'center', fontSize: 11.5, color: T.text3, marginTop: 10, lineHeight: 1.5 }}>
                <LockIcon /> 256-bit SSL encrypted · 3D Secure authentication · Powered by Whop
              </p>
            </div>
          </Reveal>
        </div>
      </main>
      <StepLegal />
      <style>{`@media(max-width:1000px){.ac-grid{grid-template-columns:1fr!important;max-width:600px;margin:0 auto}}`}</style>
    </div>
  )
}

/* Whop Elements owns the checkout session and payment form. Buyer details
   stay inside Whop's secure checkout surface. */
function WhopEmbed({ planId }: { planId: string }) {
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://the5thglobal.consulting'
  const returnUrl = `${origin}/10k-roadmap/reserved`

  return (
    <div style={{ minHeight: 110, background: '#fff', borderRadius: 12, overflow: 'hidden' }}>
      <WhopElements elements={loadWhop()}>
        <Checkout
          plan={planId}
          returnUrl={returnUrl}
          onComplete={(completion) => {
            if (completion.result === 'payment') {
              track('payment_success', { value: DEPOSIT.amount, currency: DEPOSIT.currency })
            }
          }}
        >
          <CheckoutElement />
        </Checkout>
      </WhopElements>
    </div>
  )
}
