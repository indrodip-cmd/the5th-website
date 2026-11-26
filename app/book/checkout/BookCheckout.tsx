'use client'
/* In-site checkout for the $4.99 ebook. Email first (so the delivery email and
   any recovery have an address), then Whop's embedded card form. Same
   defensive embed pattern as /audit-checkout: loading skeleton plus a hosted
   fallback link. The Whop plan must be a digital-download plan that delivers
   the PDF; set NEXT_PUBLIC_WHOP_BOOK_PLAN_ID. If it is not set, the page says
   so instead of showing a dead form. */
import { useEffect, useRef, useState } from 'react'
import { T } from '../../10k-roadmap/config'
import { Fonts, Header, Btn, Reveal, StepLegal } from '../../10k-roadmap/ui'
import { track } from '../../10k-roadmap/track'
import { BOOK_PRICE, BOOK_PAGES, BOOK_CHAPTERS, BOOK_TITLE, BOOK_SUBTITLE, BOOK_GUARANTEE_DAYS, bookPlanId } from '../config'

const PAYMENT_LOGOS = [
  { name: 'Visa', src: '/images/payment/visa.png', h: 15 },
  { name: 'Mastercard', src: '/images/payment/mastercard.png', h: 22 },
  { name: 'American Express', src: '/images/payment/amex.png', h: 26 },
  { name: 'Cash App', src: '/images/payment/cashapp.png', h: 18 },
]
const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim())

function Lock() {
  return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><rect x="4" y="11" width="16" height="9" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
}

export default function BookCheckout() {
  const planId = bookPlanId()
  const [email, setEmail] = useState('')
  const [touched, setTouched] = useState(false)
  const [paying, setPaying] = useState(false)
  useEffect(() => { track('book_view', { page: 'checkout' }) }, [])
  const ok = isEmail(email)

  return (
    <div style={{ minHeight: '100dvh', background: T.bg, color: T.text, fontFamily: T.sans }}>
      <Fonts />
      <Header homeHref="/book" />
      <main style={{ maxWidth: 1040, margin: '0 auto', padding: 'clamp(26px,5vw,48px) clamp(16px,4vw,22px) 70px' }}>
        <div className="bc-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(420px,500px)', gap: 40, alignItems: 'start' }}>
          <Reveal>
            <div className="rm-eyebrow" style={{ marginBottom: 12 }}>Secure checkout</div>
            <h1 className="rm-serif" style={{ fontSize: 'clamp(30px,4.4vw,44px)', margin: 0 }}>You are one step from <span className="rm-mark">Expertise to Income.</span></h1>
            <div style={{ display: 'flex', gap: 20, alignItems: 'center', margin: '28px 0', padding: 18, background: T.surface, border: `1px solid ${T.line}`, borderRadius: T.radius }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/book/cover.webp" alt={`${BOOK_TITLE} cover`} width={90} height={128} style={{ width: 90, height: 'auto', borderRadius: 5, boxShadow: '0 14px 30px -14px rgba(0,0,0,.7)' }} />
              <div>
                <div style={{ fontFamily: T.serif, fontWeight: 800, fontSize: 19 }}>{BOOK_TITLE}</div>
                <div style={{ color: T.text3, fontSize: 13.5, margin: '3px 0 10px' }}>{BOOK_SUBTITLE} · {BOOK_PAGES} pages · PDF</div>
                <div className="rm-serif" style={{ fontSize: 32 }}>{BOOK_PRICE.label}</div>
              </div>
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 12, fontSize: 15.5, lineHeight: 1.5 }}>
              {[`${BOOK_CHAPTERS} chapters with every worksheet, instantly`, 'Read on your phone, tablet or computer, or print it', `${BOOK_GUARANTEE_DAYS}-day money-back guarantee`, 'One-time payment, no subscription'].map((t) => (
                <li key={t} style={{ display: 'flex', gap: 10 }}><span style={{ color: T.accentInk, fontWeight: 800 }}>✓</span>{t}</li>
              ))}
            </ul>
          </Reveal>

          <Reveal delay={0.06}>
            <div style={{ background: T.surface, border: `1px solid ${T.lineStrong}`, borderRadius: 20, padding: 'clamp(20px,3vw,28px)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 18 }}>
                <span style={{ fontWeight: 700, fontSize: 15 }}>Total today</span>
                <span className="rm-serif" style={{ fontSize: 30 }}>{BOOK_PRICE.label}</span>
              </div>
              {!planId ? (
                <p style={{ margin: 0, padding: 16, borderRadius: 12, background: 'rgba(229,88,74,.1)', border: '1px solid rgba(229,88,74,.35)', color: T.text, fontSize: 14.5, lineHeight: 1.6 }}>
                  Checkout for this book is being switched on. Please check back shortly, or email us and we will send you the book directly.
                </p>
              ) : !paying ? (
                <>
                  <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: T.text2, marginBottom: 6 }}>Where should we send your book?</label>
                  <input type="email" inputMode="email" autoComplete="email" placeholder="you@email.com" value={email} onChange={(e) => setEmail(e.target.value)} onBlur={() => setTouched(true)}
                    style={{ width: '100%', boxSizing: 'border-box', padding: '13px 14px', fontSize: 16, background: 'rgba(255,255,255,.04)', border: `1px solid ${touched && !ok ? T.danger : T.line}`, borderRadius: 10, fontFamily: 'inherit', color: T.text, outline: 'none' }} />
                  {touched && !ok && <p style={{ color: T.danger, fontSize: 12, margin: '6px 0 0' }}>Please enter a valid email address.</p>}
                  <div style={{ marginTop: 16 }}>
                    <Btn full onClick={() => { setTouched(true); if (!ok) return; try { sessionStorage.setItem('book_email', email.trim().toLowerCase()) } catch { /* noop */ } track('book_checkout_started', { value: BOOK_PRICE.amount, currency: BOOK_PRICE.currency }); setPaying(true) }}>Continue to payment</Btn>
                  </div>
                </>
              ) : (
                <>
                  <button onClick={() => setPaying(false)} style={{ background: 'none', border: 0, color: T.text2, fontSize: 13, cursor: 'pointer', padding: 0, marginBottom: 12 }}>← {email}</button>
                  <WhopEmbed planId={planId} email={email.trim().toLowerCase()} />
                </>
              )}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, flexWrap: 'wrap', marginTop: 18, paddingTop: 16, borderTop: `1px solid ${T.line}` }}>
                {PAYMENT_LOGOS.map((l) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={l.name} src={l.src} alt={l.name} style={{ height: l.h, width: 'auto' }} />
                ))}
              </div>
              <p style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, textAlign: 'center', fontSize: 11.5, color: T.text3, marginTop: 10, lineHeight: 1.5 }}>
                <Lock /> 256-bit SSL encrypted · 3D Secure authentication · Powered by Whop
              </p>
            </div>
          </Reveal>
        </div>
      </main>
      <StepLegal />
      <style>{`@media(max-width:960px){.bc-grid{grid-template-columns:1fr!important;max-width:600px;margin:0 auto}}`}</style>
    </div>
  )
}

function WhopEmbed({ planId, email }: { planId: string; email: string }) {
  const ref = useRef<HTMLDivElement | null>(null)
  const [mounted, setMounted] = useState(false)
  const [slow, setSlow] = useState(false)
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://the5thglobal.consulting'
  const redirect = `${origin}/book/thank-you?email=${encodeURIComponent(email)}`
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
    const poll = setInterval(() => { if (check()) clearInterval(poll) }, 400)
    const t = setTimeout(() => { if (!el.querySelector('iframe')) setSlow(true) }, 7000)
    return () => { obs.disconnect(); clearInterval(poll); clearTimeout(t) }
  }, [planId, email])

  return (
    <div style={{ position: 'relative', minHeight: 110, background: '#fff', borderRadius: 12, overflow: 'hidden' }}>
      <div ref={ref} key={`${planId}:${email}`}
        data-whop-checkout-plan-id={planId}
        data-whop-checkout-theme="light"
        data-whop-checkout-redirect-url={redirect}
        data-whop-checkout-email={email || undefined}
        style={{ width: '100%', minHeight: 110 }} />
      {!mounted && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, background: '#fff' }}>
          {!slow ? (
            <>
              <div style={{ width: 24, height: 24, borderRadius: '50%', border: '3px solid #e5e7eb', borderTopColor: T.accentInk, animation: 'rm-spin .8s linear infinite' }} />
              <p style={{ fontSize: 13, color: '#6b7280', margin: 0 }}>Loading secure payment form…</p>
            </>
          ) : (
            <>
              <p style={{ fontSize: 13.5, color: '#16181d', margin: 0, textAlign: 'center', fontWeight: 600 }}>Checkout is taking a moment.</p>
              <Btn href={hosted}>Pay {BOOK_PRICE.label} securely →</Btn>
            </>
          )}
        </div>
      )}
    </div>
  )
}
