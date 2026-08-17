'use client'
/* Qualified transition → contact capture → $27 Whop deposit checkout.
   The $27 is framed as a commitment deposit, never the price of the advice.
   On successful payment Whop redirects to /reserved?email=… and the Whop
   webhook flips the lead to paid (server-verified there). */
import { useEffect, useRef, useState } from 'react'
import { RESERVE, DEPOSIT, LANDING, T } from '../config'
import { Fonts, Header, Btn, Reveal, useUtm, loadQualAnswers, getAuditId } from '../ui'
import { track } from '../track'

type Step = 'intro' | 'contact' | 'pay'

export default function Reserve({ planId }: { planId: string }) {
  const utm = useUtm()
  const [step, setStep] = useState<Step>('intro')
  const [form, setForm] = useState({ name: '', email: '', phone: '' })
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    // Guard: if someone lands here without qualifying, send them to qualify.
    const q = loadQualAnswers()
    if (!q || Object.keys(q).length === 0) { window.location.replace('/10k-roadmap/qualify'); return }
  }, [])

  const submitContact = async (e: React.FormEvent) => {
    e.preventDefault(); setErr('')
    const email = form.email.trim().toLowerCase()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setErr('Please enter a valid email you can access.'); return }
    if (form.name.trim().length < 2) { setErr('Please enter your name.'); return }
    setBusy(true)
    try {
      const res = await fetch('/api/10k-roadmap/reserve', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, email, qualification: loadQualAnswers(), utm, audit_id: getAuditId() }),
      })
      if (!res.ok) throw new Error()
      try { sessionStorage.setItem('audit_email', email); sessionStorage.setItem('audit_name', form.name.trim()) } catch { /* noop */ }
      track('checkout_started', { value: DEPOSIT.amount, currency: DEPOSIT.currency })
      setStep('pay')
    } catch {
      setErr('We couldn’t save that. Your details are safe — please try again.')
    } finally { setBusy(false) }
  }

  return (
    <div style={{ minHeight: '100dvh', background: T.bg, color: T.text, fontFamily: T.sans }}>
      <Fonts />
      <Header />
      <main style={{ maxWidth: 900, margin: '0 auto', padding: 'clamp(30px,6vw,60px) 22px 90px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: step === 'intro' ? '1fr' : 'minmax(0,1fr) minmax(0,440px)', gap: 40, alignItems: 'start' }} className="rv-grid">

          {/* Offer side (always) */}
          <Reveal>
            <div className="rm-eyebrow" style={{ marginBottom: 16 }}>The next step</div>
            <h1 className="rm-serif" style={{ fontSize: 'clamp(28px,4.4vw,44px)', margin: 0, maxWidth: 620 }}>{RESERVE.headline}</h1>
            <p style={{ color: T.text2, fontSize: 18, lineHeight: 1.6, marginTop: 16, maxWidth: 560 }}>{RESERVE.sub}</p>

            <h2 className="rm-serif" style={{ fontSize: 22, margin: '34px 0 8px' }}>{RESERVE.bodyHeading}</h2>
            <p style={{ color: T.text2, fontSize: 16, lineHeight: 1.65, maxWidth: 560 }}>{RESERVE.body}</p>

            <div style={{ display: 'grid', gap: 12, marginTop: 24, maxWidth: 560 }}>
              {RESERVE.includes.map((f) => (
                <div key={f} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={T.accent} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginTop: 2, flexShrink: 0 }}><polyline points="20 6 9 17 4 12" /></svg>
                  <span style={{ fontSize: 15.5, lineHeight: 1.5 }}>{f}</span>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 26, background: T.surface, border: `1px solid ${T.line}`, borderRadius: 14, padding: '16px 20px', maxWidth: 560 }}>
              <p style={{ margin: 0, color: T.text2, fontSize: 14, lineHeight: 1.6 }}>
                <b style={{ color: T.accentInk }}>{DEPOSIT.label} commitment deposit.</b> {RESERVE.depositNote}
              </p>
            </div>

            {step === 'intro' && (
              <div style={{ marginTop: 30 }}>
                <Btn onClick={() => { setStep('contact'); track('cta_click', { where: 'reserve-intro' }) }} style={{ padding: '18px 40px', fontSize: 17 }}>{RESERVE.cta}</Btn>
              </div>
            )}
          </Reveal>

          {/* Right column: contact form → checkout */}
          {step !== 'intro' && (
            <Reveal delay={80}>
              <div style={{ position: 'sticky', top: 90, background: T.surface, border: `1px solid ${T.line}`, borderRadius: 20, padding: '26px 24px' }}>
                <div style={{ textAlign: 'center', marginBottom: 18 }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 6 }}>
                    <span className="rm-serif" style={{ fontSize: 42, color: T.accentInk }}>{DEPOSIT.label}</span>
                    <span style={{ color: T.text2, fontSize: 14 }}>one-time deposit</span>
                  </div>
                </div>

                {step === 'contact' && (
                  <form onSubmit={submitContact} style={{ display: 'grid', gap: 12 }}>
                    <div>
                      <h3 className="rm-serif" style={{ fontSize: 19, margin: '0 0 4px' }}>{RESERVE.contact.heading}</h3>
                      <p style={{ color: T.text3, fontSize: 13, margin: 0 }}>{RESERVE.contact.sub}</p>
                    </div>
                    <input className="rm-focus" placeholder="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} autoComplete="name" style={inp} />
                    <input className="rm-focus" placeholder="Email address" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} autoComplete="email" style={inp} />
                    <input className="rm-focus" placeholder="Phone (with country code) — optional" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} autoComplete="tel" style={inp} />
                    {err && <p role="alert" style={{ color: T.danger, fontSize: 13, margin: 0 }}>{err}</p>}
                    <Btn type="submit" full disabled={busy}>{busy ? 'Securing your slot…' : RESERVE.contact.cta}</Btn>
                    <p style={{ textAlign: 'center', color: T.text3, fontSize: 11.5, margin: 0, lineHeight: 1.5 }}>{RESERVE.contact.micro}</p>
                  </form>
                )}

                {step === 'pay' && <WhopCheckout planId={planId} email={form.email.trim().toLowerCase()} />}
              </div>
            </Reveal>
          )}
        </div>
        <p style={{ textAlign: 'center', color: T.text3, fontSize: 12.5, marginTop: 40 }}>{LANDING.ctaMicro}</p>
      </main>
      <style>{`@media(max-width:820px){.rv-grid{grid-template-columns:1fr!important}}`}</style>
    </div>
  )
}

const inp: React.CSSProperties = { width: '100%', background: T.bg, border: `1px solid ${T.line}`, borderRadius: 12, color: T.text, fontSize: 15.5, padding: '14px 15px', fontFamily: T.sans }

/* Whop embedded checkout (dark). Skeleton until the iframe mounts; hosted
   fallback if blocked/slow. On success Whop redirects to the return URL. */
function WhopCheckout({ planId, email }: { planId: string; email: string }) {
  const ref = useRef<HTMLDivElement | null>(null)
  const [mounted, setMounted] = useState(false)
  const [slow, setSlow] = useState(false)
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://the5th.consulting'
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
    const t = setTimeout(() => { if (!el.querySelector('iframe')) setSlow(true) }, 7000)
    return () => { obs.disconnect(); clearTimeout(t) }
  }, [planId, email])

  return (
    <div style={{ position: 'relative', minHeight: 110 }}>
      <div ref={ref} key={`${planId}:${email}`}
        data-whop-checkout-plan-id={planId}
        data-whop-checkout-theme="light"
        data-whop-checkout-theme-accent-color="gold"
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
              <p style={{ fontSize: 11.5, color: T.text3, margin: 0 }}>Opens Whop’s secure checkout with your email prefilled.</p>
            </>
          )}
        </div>
      )}
    </div>
  )
}
