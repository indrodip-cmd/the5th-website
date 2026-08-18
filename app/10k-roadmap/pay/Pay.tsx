'use client'
/* Step 2 — Payment. Whop embedded checkout for the $27 refundable deposit.
   On success Whop redirects to Step 3 (?email=…); the Whop webhook marks the
   lead paid, which the gated steps verify server-side. Skeleton + hosted
   fallback so a blocked embed never strands the buyer. */
import { useEffect, useRef, useState } from 'react'
import { PAY, DEPOSIT, T } from '../config'
import { Fonts, Header, Btn, Reveal, Stepper } from '../ui'
import { track } from '../track'

function readEmail(): string {
  if (typeof window === 'undefined') return ''
  try { return (new URLSearchParams(window.location.search).get('email') || '').trim().toLowerCase() || sessionStorage.getItem('audit_email') || '' } catch { return '' }
}

export default function Pay({ planId }: { planId: string }) {
  // Email is optional now: qualified users come straight to payment and Whop
  // collects it. If we happen to have it (return visit), we prefill the embed.
  const [email] = useState(readEmail)

  useEffect(() => { track('checkout_started', { value: DEPOSIT.amount, currency: DEPOSIT.currency }) }, [])

  return (
    <div style={{ minHeight: '100dvh', background: T.bg, color: T.text, fontFamily: T.sans }}>
      <Fonts />
      <Header />
      <main style={{ maxWidth: 940, margin: '0 auto', padding: 'clamp(26px,5vw,48px) 22px 80px' }}>
        <Stepper current={0} />
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,420px)', gap: 34, alignItems: 'start' }} className="pay-grid">
          <Reveal>
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

            <div style={{ background: T.surface, border: `1px solid ${T.accent}`, borderRadius: 14, padding: '16px 18px', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={T.accentInk} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 1 }}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="M9 12l2 2 4-4" /></svg>
              <p style={{ margin: 0, fontSize: 14.5, lineHeight: 1.6, color: T.text }}>
                <b style={{ color: T.accentInk, fontWeight: 800 }}>{PAY.guaranteeTitle}:</b> {PAY.guaranteeBody}
              </p>
            </div>
          </Reveal>

          <Reveal delay={80}>
            <div style={{ background: T.surface, border: `1px solid ${T.line}`, borderRadius: 20, padding: '24px 22px', position: 'sticky', top: 90 }}>
              <div style={{ textAlign: 'center', marginBottom: 16 }}>
                <span className="rm-serif" style={{ fontSize: 42, color: T.accentInk, fontWeight: 700 }}>{DEPOSIT.label}</span>
                <span style={{ color: T.text2, fontSize: 14, marginLeft: 6 }}>refundable deposit</span>
              </div>
              <WhopCheckout planId={planId} email={email} />
              <p style={{ textAlign: 'center', fontSize: 11.5, color: T.text3, marginTop: 12, lineHeight: 1.5 }}>{PAY.micro}</p>
            </div>
          </Reveal>
        </div>
      </main>
      <style>{`@media(max-width:780px){.pay-grid{grid-template-columns:1fr!important}}`}</style>
    </div>
  )
}

function WhopCheckout({ planId, email }: { planId: string; email: string }) {
  const ref = useRef<HTMLDivElement | null>(null)
  const [mounted, setMounted] = useState(false)
  const [slow, setSlow] = useState(false)
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://the5th.consulting'
  const redirect = `${origin}/10k-roadmap/questions?email=${encodeURIComponent(email)}`
  const hosted = `https://whop.com/checkout/${planId}?email=${encodeURIComponent(email)}`

  useEffect(() => {
    const SRC = 'https://js.whop.com/static/checkout/loader.js'
    if (!document.querySelector(`script[src="${SRC}"]`)) { const s = document.createElement('script'); s.src = SRC; s.async = true; document.body.appendChild(s) }
  }, [])
  useEffect(() => {
    const el = ref.current; if (!el) return
    const check = () => { if (el.querySelector('iframe')) { setMounted(true); return true } return false }
    if (check()) return
    const obs = new MutationObserver(() => check()); obs.observe(el, { childList: true, subtree: true })
    const t = setTimeout(() => { if (!el.querySelector('iframe')) setSlow(true) }, 7000)
    return () => { obs.disconnect(); clearTimeout(t) }
  }, [planId, email])

  return (
    <div style={{ position: 'relative', minHeight: 110 }}>
      <div ref={ref} key={`${planId}:${email}`}
        data-whop-checkout-plan-id={planId}
        data-whop-checkout-theme="light"
        data-whop-checkout-redirect-url={redirect}
        data-whop-checkout-email={email || undefined}
        style={{ width: '100%', minHeight: 110 }} />
      {!mounted && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, background: T.surface, borderRadius: 12 }}>
          {!slow ? (
            <>
              <div style={{ width: 26, height: 26, borderRadius: '50%', border: `3px solid ${T.line}`, borderTopColor: T.accent, animation: 'rm-spin .8s linear infinite' }} />
              <p style={{ fontSize: 13, color: T.text2, margin: 0 }}>Loading secure checkout…</p>
            </>
          ) : (
            <>
              <p style={{ fontSize: 13.5, color: T.text, margin: 0, textAlign: 'center', fontWeight: 600 }}>Checkout is taking a moment.</p>
              <Btn href={hosted}>Pay {DEPOSIT.label} securely →</Btn>
            </>
          )}
        </div>
      )}
    </div>
  )
}
