'use client'
/* Two-step, in-site checkout — same dark/lime visual system as the rest of
   /10k-roadmap (shared Fonts/Header/Btn/Reveal kit from ../10k-roadmap/ui),
   so landing on this page never feels like leaving the site. */
import { useEffect, useRef, useState } from 'react'
import { PAY, DEPOSIT, HELP, T, auditDirectPlanId } from '../10k-roadmap/config'
import { Fonts, Header, Btn, Reveal, StepLegal } from '../10k-roadmap/ui'
import { track } from '../10k-roadmap/track'

function isValidEmail(v: string) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) }
function isValidPhone(v: string) { return v.replace(/\D/g, '').length >= 7 }

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

type Step = 'details' | 'pay'

export default function AuditCheckout() {
  const [step, setStep] = useState<Step>('details')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [touched, setTouched] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => { track('page_view') }, [])

  const nameOk = name.trim().length > 1
  const emailOk = isValidEmail(email)
  const phoneOk = isValidPhone(phone)
  const formOk = nameOk && emailOk && phoneOk

  async function handlePay() {
    setTouched(true)
    if (!formOk) return
    setSubmitting(true)
    setError('')
    try {
      try {
        sessionStorage.setItem('audit_email', email.trim().toLowerCase())
        sessionStorage.setItem('audit_name', name.trim())
      } catch { /* noop */ }

      const res = await fetch('/api/10k-roadmap/reserve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, qualification: {} }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) { setError(data?.error || 'Could not save your details. Please try again.'); setSubmitting(false); return }
      track('checkout_started', { value: DEPOSIT.amount, currency: DEPOSIT.currency })
      setStep('pay')
    } catch {
      setError('Something went wrong. Please check your connection and try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div style={{ minHeight: '100dvh', background: T.bg, color: T.text, fontFamily: T.sans }}>
      <Fonts />
      <Header />
      <main style={{ maxWidth: 1080, margin: '0 auto', padding: 'clamp(26px,5vw,48px) clamp(16px,4vw,22px) 80px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(460px,540px)', gap: 40, alignItems: 'start' }} className="ac-grid">
          {/* Left — what they're paying for */}
          <Reveal>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 22 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/founder-og.jpg" alt="Indrodip Ghosh" width={48} height={48} style={{ borderRadius: '50%', objectFit: 'cover', border: `1.5px solid ${T.line}` }} />
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: T.text }}>Indrodip Ghosh</div>
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

            <div style={{ fontSize: 13, color: T.text2, lineHeight: 1.8 }}>
              <div style={{ fontWeight: 700, color: T.text, marginBottom: 2 }}>Contact</div>
              <div><a href={HELP.emailHref} style={{ color: T.text2, textDecoration: 'none' }}>{HELP.email}</a></div>
              <div><a href={HELP.phoneHref} style={{ color: T.text2, textDecoration: 'none' }}>{HELP.phone}</a></div>
            </div>
          </Reveal>

          {/* Right — payment */}
          <Reveal delay={80}>
            <div className="rm-glass" style={{ borderRadius: 20, padding: 'clamp(20px,3vw,28px) clamp(16px,2.5vw,22px)', position: 'sticky', top: 90 }}>
              <div style={{ fontSize: 17, fontWeight: 800, marginBottom: 4, color: T.text }}>Payment Details</div>
              <div style={{ width: 36, height: 3, borderRadius: 2, background: T.accent, marginBottom: 18 }} />

              {step === 'details' ? (
                <>
                  <Field label="Amount">
                    <input value={`$${DEPOSIT.amount}.00`} readOnly style={{ ...inputStyle, color: T.text2, fontWeight: 700 }} />
                  </Field>
                  <Field label="Email" error={touched && !emailOk ? 'Enter a valid email address.' : ''}>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" style={inputStyle} autoComplete="email" />
                  </Field>
                  <Field label="WhatsApp number" error={touched && !phoneOk ? 'Enter a valid phone number.' : ''}>
                    <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 234 567 8900" style={inputStyle} autoComplete="tel" />
                  </Field>
                  <Field label="Full Name" error={touched && !nameOk ? 'Enter your full name.' : ''}>
                    <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Doe" style={inputStyle} autoComplete="name" />
                  </Field>

                  {error && <p style={{ color: T.danger, fontSize: 13, margin: '4px 0 12px' }}>{error}</p>}

                  <Btn onClick={handlePay} disabled={submitting} full style={{ marginTop: 6 }}>
                    {submitting ? 'Please wait…' : `Pay $${DEPOSIT.amount}.00`}
                  </Btn>
                  <p style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, fontSize: 11.5, color: T.text3, marginTop: 10 }}>
                    <LockIcon /> Your bank may ask you to verify this payment (3D Secure).
                  </p>
                </>
              ) : (
                <>
                  <button type="button" onClick={() => setStep('details')}
                    style={{ background: 'none', border: 'none', color: T.text2, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit', padding: 0, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 5 }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
                    Edit details
                  </button>
                  <div className="rm-glass-flat" style={{ borderRadius: 10, padding: '12px 14px', marginBottom: 16, fontSize: 13, color: T.text, display: 'grid', gap: 3 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: T.text2 }}>Amount</span><b>${DEPOSIT.amount}.00</b></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: T.text2 }}>Email</span><span>{email}</span></div>
                  </div>
                  <WhopEmbed planId={auditDirectPlanId()} email={email} />
                </>
              )}

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

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: T.text2, marginBottom: 6 }}>{label}</label>
      {children}
      {error && <p style={{ color: T.danger, fontSize: 12, margin: '5px 0 0' }}>{error}</p>}
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%', boxSizing: 'border-box', padding: '11px 13px', fontSize: 14.5,
  background: 'rgba(255,255,255,.04)', border: `1px solid ${T.line}`, borderRadius: 9,
  fontFamily: 'inherit', color: T.text, outline: 'none',
}

/* Mounts Whop's embedded card form once step 2 is shown. Same defensive
   pattern as the rest of the funnel's checkout embeds: a loading skeleton,
   and a hosted-checkout fallback link if the iframe doesn't mount in time
   (ad-blockers, CSP, slow network) — so a blocked embed never strands a
   buyer who already entered their details. Whop's own widget renders a
   white card regardless of host theme, same as every other embed in this
   funnel (see ../pay/Pay.tsx) — it sits as a light "insert" inside the
   dark glass panel rather than trying to force it dark. */
function WhopEmbed({ planId, email }: { planId: string; email: string }) {
  const ref = useRef<HTMLDivElement | null>(null)
  const [mounted, setMounted] = useState(false)
  const [slow, setSlow] = useState(false)
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://the5thglobal.consulting'
  const redirect = `${origin}/10k-roadmap/reserved?email=${encodeURIComponent(email)}`
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
              <Btn href={hosted}>Pay ${DEPOSIT.amount}.00 securely →</Btn>
            </>
          )}
        </div>
      )}
    </div>
  )
}
