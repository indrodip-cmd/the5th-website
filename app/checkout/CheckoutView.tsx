'use client'
/* Shared premium in-site checkout. Renders the Whop EMBEDDED checkout (the
   js.whop.com loader lives in the root layout) so buyers never leave the site.
   On success Whop redirects to the plan's return URL; the Whop webhook on the
   platform provisions the member + tier automatically. Keying the checkout div
   by plan id remounts it when the billing toggle flips. */
import { useEffect, useState } from 'react'

const FOREST = '#1C4A32'
const FOREST_2 = '#2d6a4f'
const GOLD = '#C9A84C'
const GOLD_DK = '#a9862f'
const INK = '#2a2233'
const MUTE = '#57505f'

export type CheckoutPlan = { key: string; label: string; price: string; cadence: string; note: string; planId: string }

export type CheckoutConfig = {
  eyebrow: string
  title: string
  subtitle: string
  features: string[]
  plans: CheckoutPlan[]
  returnUrl: string
  guarantee?: string
  backHref: string
  backLabel: string
}

export default function CheckoutView({ config }: { config: CheckoutConfig }) {
  const [planKey, setPlanKey] = useState(config.plans[0]?.key)
  const plan = config.plans.find((p) => p.key === planKey) || config.plans[0]

  // Ensure the Whop embedded-checkout loader is present on this route (it lives
  // in the root layout too, but re-adding it here guarantees it runs even on
  // client-side SPA navigation, so the checkout always mounts).
  useEffect(() => {
    const SRC = 'https://js.whop.com/static/checkout/loader.js'
    if (!document.querySelector(`script[src="${SRC}"]`)) {
      const s = document.createElement('script')
      s.src = SRC
      s.async = true
      document.body.appendChild(s)
    }
  }, [])

  return (
    <div style={{ minHeight: '100dvh', background: 'radial-gradient(120% 80% at 50% -10%, #f3ecfa 0%, #faf8fc 55%)', fontFamily: 'Inter, system-ui, sans-serif', color: INK }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        @keyframes rise{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}
        .co-grid{display:grid;grid-template-columns:1fr minmax(0,440px);gap:44px;align-items:start}
        @media(max-width:900px){.co-grid{grid-template-columns:1fr;gap:28px}.co-sticky{position:static!important}}`}</style>

      <header style={{ padding: '24px 28px', display: 'flex', justifyContent: 'center' }}>
        <a href="/"><img src="/public/images/logo.png" alt="The5th Consulting" style={{ height: 38, width: 'auto' }} /></a>
      </header>

      <main style={{ maxWidth: 1040, margin: '0 auto', padding: '8px 24px 70px' }}>
        <div className="co-grid">
          {/* Left — the offer */}
          <div style={{ animation: 'rise .4s ease' }}>
            <a href={config.backHref} style={{ display: 'inline-block', fontSize: 13, color: MUTE, textDecoration: 'none', marginBottom: 16 }}>← {config.backLabel}</a>
            <div style={{ display: 'inline-block', fontSize: 11.5, fontWeight: 800, letterSpacing: 2.5, textTransform: 'uppercase', color: GOLD_DK, marginBottom: 12 }}>{config.eyebrow}</div>
            <h1 style={{ fontFamily: 'Gelica, Georgia, serif', fontSize: 'clamp(30px,4.4vw,44px)', fontWeight: 800, letterSpacing: '-.02em', lineHeight: 1.08, margin: 0, color: INK }}>{config.title}</h1>
            <p style={{ fontSize: 16.5, color: MUTE, lineHeight: 1.65, marginTop: 16, maxWidth: 500 }}>{config.subtitle}</p>

            <div style={{ marginTop: 26, display: 'grid', gap: 12 }}>
              {config.features.map((f) => (
                <div key={f} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <span style={{ width: 22, height: 22, borderRadius: '50%', background: '#eaf7ef', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 1 }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={FOREST} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                  </span>
                  <span style={{ fontSize: 15.5, color: INK, lineHeight: 1.5 }}>{f}</span>
                </div>
              ))}
            </div>

            {config.guarantee && (
              <div style={{ marginTop: 24, background: '#f2f8f4', border: '1px solid #cfe8d8', borderRadius: 14, padding: '14px 18px', fontSize: 13.5, color: FOREST, lineHeight: 1.6 }}>
                {config.guarantee}
              </div>
            )}
          </div>

          {/* Right — the checkout */}
          <div className="co-sticky" style={{ position: 'sticky', top: 20, animation: 'rise .5s ease' }}>
            <div style={{ background: '#fff', border: '1px solid #ece7f0', borderRadius: 22, boxShadow: '0 18px 50px rgba(40,20,50,.1)', padding: '24px 22px 26px' }}>
              {config.plans.length > 1 && (
                <div style={{ display: 'flex', gap: 6, background: '#f5f1f8', borderRadius: 12, padding: 4, marginBottom: 16 }}>
                  {config.plans.map((p) => (
                    <button key={p.key} type="button" onClick={() => setPlanKey(p.key)} style={{ flex: 1, padding: '9px 6px', borderRadius: 9, border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 700, background: planKey === p.key ? '#fff' : 'transparent', color: planKey === p.key ? INK : MUTE, boxShadow: planKey === p.key ? '0 2px 8px rgba(40,20,50,.08)' : 'none' }}>{p.label}</button>
                  ))}
                </div>
              )}

              <div style={{ textAlign: 'center', marginBottom: 6 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 5 }}>
                  <span style={{ fontFamily: 'Gelica, Georgia, serif', fontSize: 40, fontWeight: 700, color: FOREST }}>{plan.price}</span>
                  <span style={{ fontSize: 14, color: MUTE }}>{plan.cadence}</span>
                </div>
                <p style={{ fontSize: 12.5, color: MUTE, marginTop: 4 }}>{plan.note}</p>
              </div>

              {/* Whop embedded checkout — remounts on plan change via key */}
              <div key={plan.planId} data-whop-checkout-plan-id={plan.planId} data-whop-checkout-theme="light" data-whop-checkout-redirect-url={config.returnUrl} style={{ height: 'fit-content', overflow: 'hidden', maxWidth: 500, margin: '10px auto 0', width: '100%', minHeight: 70 }} />

              <p style={{ textAlign: 'center', fontSize: 11.5, color: '#a99fb2', marginTop: 12, lineHeight: 1.5 }}>
                Secure checkout · Powered by Whop · Instant platform access · Cancel anytime
              </p>
            </div>
          </div>
        </div>
      </main>

      <div style={{ textAlign: 'center', fontSize: 12, color: '#b3abbb', padding: '0 0 22px' }}>© 2026 The5th Consulting</div>
    </div>
  )
}
