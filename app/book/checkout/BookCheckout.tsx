'use client'
/* In-site checkout for the $4.99 ebook, using Whop Elements exactly like
   /audit-checkout (buyer email and card details stay inside Whop's secure
   form). The Whop plan must be a digital-download plan that delivers the PDF;
   set NEXT_PUBLIC_WHOP_BOOK_PLAN_ID. If it is not set, the page says so
   instead of showing a dead form. */
import CheckoutPanel from '../CheckoutPanel'
import { T } from '../../10k-roadmap/config'
import { Fonts, Header, Reveal, StepLegal } from '../../10k-roadmap/ui'
import { BOOK_PRICE, BOOK_PAGES, BOOK_CHAPTERS, BOOK_TITLE, BOOK_SUBTITLE, BOOK_GUARANTEE_DAYS } from '../config'

export default function BookCheckout() {
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
            <CheckoutPanel viewEvent="mount" />
          </Reveal>
        </div>
      </main>
      <StepLegal />
      <style>{`@media(max-width:960px){.bc-grid{grid-template-columns:1fr!important;max-width:600px;margin:0 auto}}`}</style>
    </div>
  )
}
