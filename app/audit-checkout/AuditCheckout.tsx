'use client'
/* Two-step, in-site checkout. Deliberately NOT styled like the rest of
   /10k-roadmap's black/lime funnel: this is the payment screen, so it reads
   like a neutral, generic processor page (think Razorpay/Stripe's own
   checkout chrome) — the familiar, unbranded look buyers already trust with
   their card, rather than a marketing page asking for one. */
import { useEffect, useRef, useState } from 'react'
import { PAY, DEPOSIT, HELP, auditDirectPlanId } from '../10k-roadmap/config'
import { track } from '../10k-roadmap/track'

const INK = '#16181d'
const MUTE = '#6b7280'
const LINE = '#e5e7eb'
const BLUE = '#2f6fed'
const BLUE_DK = '#1e4fc4'
const BG = '#f4f5f7'

function isValidEmail(v: string) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) }
function isValidPhone(v: string) { return v.replace(/\D/g, '').length >= 7 }

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
    <div style={{ minHeight: '100dvh', background: BG, fontFamily: 'Inter, system-ui, -apple-system, sans-serif', color: INK }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        .ac-grid{display:grid;grid-template-columns:1.05fr minmax(0,440px);gap:40px;align-items:start}
        @media(max-width:880px){.ac-grid{grid-template-columns:1fr;gap:24px}.ac-sticky{position:static!important}}
        @keyframes ac-spin{to{transform:rotate(360deg)}}`}</style>

      <header style={{ padding: '18px 20px', borderBottom: `1px solid ${LINE}`, background: '#fff' }}>
        <div style={{ maxWidth: 1040, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 10 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={MUTE} strokeWidth="2"><rect x="3" y="11" width="18" height="10" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
          <span style={{ fontSize: 13.5, color: MUTE, fontWeight: 600 }}>Secure checkout</span>
        </div>
      </header>

      <main style={{ maxWidth: 1040, margin: '0 auto', padding: 'clamp(20px,4vw,40px) 20px 60px' }}>
        <div className="ac-grid">
          {/* Left — what they're paying for */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 22 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/founder-og.jpg" alt="Indrodip Ghosh" width={48} height={48} style={{ borderRadius: '50%', objectFit: 'cover', border: `1px solid ${LINE}` }} />
              <div>
                <div style={{ fontSize: 15, fontWeight: 700 }}>Indrodip Ghosh</div>
                <div style={{ fontSize: 12.5, color: MUTE }}>The5th Global Consulting</div>
              </div>
            </div>

            <h1 style={{ fontSize: 'clamp(22px,3vw,28px)', fontWeight: 800, lineHeight: 1.25, margin: '0 0 6px' }}>{PAY.headline}</h1>
            <div style={{ width: 46, height: 4, borderRadius: 2, background: BLUE, margin: '10px 0 16px' }} />
            <p style={{ fontSize: 15, color: '#374151', lineHeight: 1.65, marginBottom: 18 }}>{PAY.sub}</p>

            <p style={{ fontSize: 14.5, fontWeight: 700, margin: '0 0 10px' }}>{PAY.coverLead}</p>
            <div style={{ display: 'grid', gap: 10, marginBottom: 20 }}>
              {PAY.points.map((p) => (
                <div key={p} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={BLUE} strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" style={{ marginTop: 2, flexShrink: 0 }}><polyline points="20 6 9 17 4 12" /></svg>
                  <span style={{ fontSize: 14.5, lineHeight: 1.5, color: '#374151' }}>{p}</span>
                </div>
              ))}
            </div>

            <div style={{ background: '#fff', border: `1px solid ${LINE}`, borderRadius: 12, padding: '14px 16px', marginBottom: 20 }}>
              <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.6, color: '#374151' }}>
                <b style={{ color: INK }}>{PAY.guaranteeTitle}:</b> {PAY.guaranteeBody}
              </p>
            </div>

            <div style={{ fontSize: 13, color: MUTE, lineHeight: 1.8 }}>
              <div style={{ fontWeight: 700, color: INK, marginBottom: 2 }}>Contact</div>
              <div><a href={HELP.emailHref} style={{ color: MUTE, textDecoration: 'none' }}>{HELP.email}</a></div>
              <div><a href={HELP.phoneHref} style={{ color: MUTE, textDecoration: 'none' }}>{HELP.phone}</a></div>
            </div>
          </div>

          {/* Right — payment */}
          <div className="ac-sticky" style={{ position: 'sticky', top: 20 }}>
            <div style={{ background: '#fff', border: `1px solid ${LINE}`, borderRadius: 14, boxShadow: '0 10px 30px rgba(16,24,40,.06)', padding: '22px 20px' }}>
              <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>Payment Details</div>
              <div style={{ width: 36, height: 3, borderRadius: 2, background: BLUE, marginBottom: 18 }} />

              {step === 'details' ? (
                <>
                  <Field label="Amount">
                    <input value={`$${DEPOSIT.amount}.00`} readOnly style={{ ...inputStyle, background: '#f9fafb', color: MUTE, fontWeight: 600 }} />
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

                  {error && <p style={{ color: '#c0352b', fontSize: 13, margin: '4px 0 12px' }}>{error}</p>}

                  <button type="button" onClick={handlePay} disabled={submitting}
                    style={{ width: '100%', marginTop: 6, background: submitting ? BLUE_DK : BLUE, color: '#fff', border: 'none', borderRadius: 9, padding: '14px 16px', fontSize: 15.5, fontWeight: 700, cursor: submitting ? 'default' : 'pointer', fontFamily: 'inherit', opacity: submitting ? 0.8 : 1 }}>
                    {submitting ? 'Please wait…' : `Pay $${DEPOSIT.amount}.00`}
                  </button>
                </>
              ) : (
                <>
                  <button type="button" onClick={() => setStep('details')}
                    style={{ background: 'none', border: 'none', color: MUTE, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit', padding: 0, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 5 }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={MUTE} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
                    Edit details
                  </button>
                  <div style={{ background: '#f9fafb', border: `1px solid ${LINE}`, borderRadius: 10, padding: '12px 14px', marginBottom: 16, fontSize: 13, color: '#374151', display: 'grid', gap: 3 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: MUTE }}>Amount</span><b>${DEPOSIT.amount}.00</b></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: MUTE }}>Email</span><span>{email}</span></div>
                  </div>
                  <WhopEmbed planId={auditDirectPlanId()} email={email} />
                </>
              )}

              <p style={{ textAlign: 'center', fontSize: 11.5, color: '#9ca3af', marginTop: 14, lineHeight: 1.5 }}>{PAY.micro}</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#374151', marginBottom: 6 }}>{label}</label>
      {children}
      {error && <p style={{ color: '#c0352b', fontSize: 12, margin: '5px 0 0' }}>{error}</p>}
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%', boxSizing: 'border-box', padding: '11px 13px', fontSize: 14.5,
  border: `1px solid ${LINE}`, borderRadius: 9, fontFamily: 'inherit', color: INK, outline: 'none',
}

/* Mounts Whop's embedded card form once step 2 is shown. Same defensive
   pattern as the rest of the funnel's checkout embeds: a loading skeleton,
   and a hosted-checkout fallback link if the iframe doesn't mount in time
   (ad-blockers, CSP, slow network) — so a blocked embed never strands a
   buyer who already entered their details. */
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
    <div style={{ position: 'relative', minHeight: 110 }}>
      <div ref={ref} key={`${planId}:${email}`}
        data-whop-checkout-plan-id={planId}
        data-whop-checkout-theme="light"
        data-whop-checkout-redirect-url={redirect}
        data-whop-checkout-email={email || undefined}
        style={{ width: '100%', minHeight: 110 }} />
      {!mounted && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, background: '#fff', borderRadius: 10 }}>
          {!slow ? (
            <>
              <div style={{ width: 24, height: 24, borderRadius: '50%', border: `3px solid ${LINE}`, borderTopColor: BLUE, animation: 'ac-spin .8s linear infinite' }} />
              <p style={{ fontSize: 13, color: MUTE, margin: 0 }}>Loading secure payment form…</p>
            </>
          ) : (
            <>
              <p style={{ fontSize: 13.5, color: INK, margin: 0, textAlign: 'center', fontWeight: 600 }}>Checkout is taking a moment.</p>
              <a href={hosted} target="_top" style={{ display: 'inline-block', background: BLUE, color: '#fff', fontWeight: 700, fontSize: 14.5, padding: '11px 22px', borderRadius: 9, textDecoration: 'none' }}>
                Pay ${DEPOSIT.amount}.00 securely →
              </a>
            </>
          )}
        </div>
      )}
    </div>
  )
}
