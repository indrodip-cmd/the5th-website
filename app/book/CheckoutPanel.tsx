'use client'
/* The book checkout, as one reusable block: total, optional order bump, Whop's
   embedded card form (Whop Elements, same as /audit-checkout), payment logos.
   Used inline on /book (#checkout) and on the standalone /book/checkout page.
   Buyer email and card details stay inside Whop's secure form. */
import { Component, useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { Checkout, CheckoutElement, WhopElements } from '@whop/elements-react'
import { loadWhop } from '@whop/elements'
import { T } from '../10k-roadmap/config'
import { ftrack, ftrackOnce, getExp } from './funnel'
import { bump } from '@/lib/funnel/products'
import { BOOK_PRICE, bookPlanId } from './config'

const PAYMENT_LOGOS = [
  { name: 'Visa', src: '/images/payment/visa.png', h: 15 },
  { name: 'Mastercard', src: '/images/payment/mastercard.png', h: 22 },
  { name: 'American Express', src: '/images/payment/amex.png', h: 26 },
  { name: 'Cash App', src: '/images/payment/cashapp.png', h: 18 },
]

export default function CheckoutPanel({ viewEvent = 'visible' }: { viewEvent?: 'visible' | 'mount' }) {
  const planId = bookPlanId()
  const b = bump()
  const [withBump, setWithBump] = useState(false)
  const box = useRef<HTMLDivElement | null>(null)
  const activePlan = withBump && b ? b.bundlePlanId : planId
  const total = withBump && b ? b.total : BOOK_PRICE.amount

  // "Checkout viewed" = the form actually reached the screen (inline) or the page loaded (standalone).
  useEffect(() => {
    const fire = () => ftrackOnce('checkout', 'book_checkout_view', { value: BOOK_PRICE.amount, currency: BOOK_PRICE.currency })
    if (viewEvent === 'mount' || typeof IntersectionObserver === 'undefined') { fire(); return }
    const el = box.current; if (!el) return
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { fire(); io.disconnect() } }, { threshold: 0.25 })
    io.observe(el)
    return () => io.disconnect()
  }, [viewEvent])

  return (
    <div ref={box} id="bk-pay" style={{ background: T.surface, border: `1px solid ${T.lineStrong}`, borderRadius: 20, padding: 'clamp(20px,3vw,28px)', color: T.text }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 18 }}>
        <span style={{ fontWeight: 700, fontSize: 15 }}>Total today</span>
        <span className="rm-serif" style={{ fontSize: 30 }}>${total.toFixed(2)}</span>
      </div>
      {b && (
        <label style={{ display: 'flex', gap: 14, alignItems: 'flex-start', padding: 16, marginBottom: 16, borderRadius: 14, cursor: 'pointer', border: `2px dashed ${withBump ? T.accent : T.lineStrong}`, background: withBump ? T.accentSoft : 'rgba(255,255,255,.03)', transition: 'all .2s' }}>
          <input type="checkbox" checked={withBump} onChange={(e) => { setWithBump(e.target.checked); ftrack('book_bump_toggle', { on: e.target.checked, value: b.price }) }} style={{ width: 22, height: 22, marginTop: 2, accentColor: '#C9FF48', flexShrink: 0 }} />
          <span style={{ fontSize: 15, lineHeight: 1.5 }}>
            <strong style={{ color: T.text }}>Yes, add {b.name} for just ${b.price.toFixed(2)} more.</strong>
            {b.tagline && <span style={{ display: 'block', color: T.text2, marginTop: 4, fontSize: 14 }}>{b.tagline}</span>}
          </span>
        </label>
      )}
      <WhopEmbed key={activePlan} planId={activePlan} total={total} />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, flexWrap: 'wrap', marginTop: 18, paddingTop: 16, borderTop: `1px solid ${T.line}` }}>
        {PAYMENT_LOGOS.map((l) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img key={l.name} src={l.src} alt={l.name} style={{ height: l.h, width: 'auto' }} />
        ))}
      </div>
      <p style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, textAlign: 'center', fontSize: 11.5, color: T.text3, marginTop: 10, lineHeight: 1.5 }}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><rect x="4" y="11" width="16" height="9" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
        256-bit SSL encrypted · 3D Secure authentication · Powered by Whop
      </p>
    </div>
  )
}

/* A failed Whop script (ad blocker, flaky network, Whop outage) must never be
   able to take the sales page down with it: the embed lives behind an error
   boundary, mounts only when the section is near the viewport, and falls back
   to Whop's hosted checkout for the same plan. */
class Boundary extends Component<{ fallback: ReactNode; children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  componentDidCatch() { /* the fallback is the handling */ }
  render() { return this.state.failed ? this.props.fallback : this.props.children }
}

function Fallback({ planId, why }: { planId: string; why: string }) {
  return (
    <div style={{ padding: 22, textAlign: 'center', background: '#fff', color: '#16181d' }}>
      <p style={{ margin: '0 0 6px', fontWeight: 700, fontSize: 15 }}>{why}</p>
      <p style={{ margin: '0 0 16px', fontSize: 13.5, color: '#4b5563', lineHeight: 1.5 }}>Your payment is not affected. Use Whop&rsquo;s secure checkout page instead:</p>
      <a href={`https://whop.com/checkout/${planId}`} onClick={() => ftrack('book_cta_click', { where: 'checkout_fallback' })} style={{ display: 'inline-flex', padding: '14px 26px', borderRadius: 999, background: '#C9FF48', color: '#0B0F08', fontWeight: 800, textDecoration: 'none' }}>Pay securely on Whop →</a>
    </div>
  )
}

function WhopEmbed({ planId, total }: { planId: string; total: number }) {
  const host = useRef<HTMLDivElement | null>(null)
  const [near, setNear] = useState(false)
  const [elements, setElements] = useState<ReturnType<typeof loadWhop> | null>(null)
  const [failed, setFailed] = useState(false)
  const [slow, setSlow] = useState(false)
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://the5thglobal.consulting'

  // Load Whop's script only when the checkout is about to be seen (or a buy
  // button was pressed): keeps the landing page light for everyone who just reads.
  useEffect(() => {
    const el = host.current; if (!el) return
    if (typeof IntersectionObserver === 'undefined') { Promise.resolve().then(() => setNear(true)); return }
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setNear(true); io.disconnect() } }, { rootMargin: '700px 0px' })
    io.observe(el)
    const go = () => setNear(true)
    window.addEventListener('hashchange', go)
    return () => { io.disconnect(); window.removeEventListener('hashchange', go) }
  }, [])
  useEffect(() => {
    if (!near || elements) return
    Promise.resolve().then(() => { const p = loadWhop(); setElements(p); return p }).catch(() => setFailed(true))
  }, [near, elements])
  // If no payment frame appears in 9s the form is stuck: offer the hosted checkout.
  useEffect(() => {
    if (!near || failed) return
    const t = setTimeout(() => { if (!host.current?.querySelector('iframe')) setSlow(true) }, 9000)
    return () => clearTimeout(t)
  }, [near, failed])

  const vid = typeof window !== 'undefined' ? (localStorage.getItem('a5_vid') || '') : ''
  const onComplete = (completion: { result?: string; paymentId?: string }) => {
    if (completion?.result !== 'payment') return
    ftrackOnce('paid', 'book_payment_success', { value: total, currency: BOOK_PRICE.currency })
    // Inline card payments finish inside the element with no redirect, so take
    // the buyer to the confirmation page ourselves (returnUrl covers 3D Secure
    // and other off-site steps).
    window.location.assign(`/book/thank-you?status=succeeded${completion.paymentId ? `&payment=${encodeURIComponent(completion.paymentId)}` : ''}`)
  }

  return (
    <div ref={host} style={{ minHeight: 110, background: '#fff', borderRadius: 12, overflow: 'hidden' }}>
      {failed ? <Fallback planId={planId} why="The secure payment form could not load." />
        : !near || !elements ? <div style={{ minHeight: 110, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280', fontSize: 13 }}>Loading secure checkout…</div>
        : (
          <Boundary fallback={<Fallback planId={planId} why="The secure payment form could not load." />}>
            <WhopElements elements={elements}>
              <Checkout plan={planId} returnUrl={`${origin}/book/thank-you`} metadata={{ product: 'expertise-to-income', exp: getExp(), vid }} onComplete={onComplete}>
                <CheckoutElement />
              </Checkout>
            </WhopElements>
            {slow && <Fallback planId={planId} why="Checkout is taking longer than usual." />}
          </Boundary>
        )}
    </div>
  )
}
