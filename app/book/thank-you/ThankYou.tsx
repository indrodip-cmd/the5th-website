'use client'
import { useEffect, useState } from 'react'
import { Fonts, Header, Btn, StepLegal } from '../../10k-roadmap/ui'
import { T } from '../../10k-roadmap/config'
import { ftrack, ftrackOnce } from '../funnel'
import { AUDIT, activeProducts } from '@/lib/funnel/products'
import { BOOK_TITLE } from '../config'

/* Post-purchase page: confirms the purchase, gives the first action (the
   fastest way to make the book pay off) and presents the next rung of the
   ladder. The offers shown come from the product catalog, so adding an
   upsell/core product there surfaces it here with no page change. */
export default function ThankYou() {
  // Reaching this page is the browser-side purchase signal. Revenue itself is
  // taken from the Whop webhook, never from this event.
  // Whop appends ?status=succeeded|failed|canceled|processing after an off-site
  // step (3D Secure); our own inline-success redirect adds status=succeeded.
  // The URL only decides what to SHOW. Fulfilment and revenue come from the
  // payment.succeeded webhook, never from this page.
  const [status, setStatus] = useState<string>('')
  useEffect(() => {
    const s = new URLSearchParams(location.search).get('status') || ''
    Promise.resolve().then(() => setStatus(s))
    if (s === 'succeeded') ftrackOnce('paid', 'book_payment_success', { via: 'thank-you' })
  }, [])
  if (status === 'failed' || status === 'canceled') {
    return (
      <div style={{ minHeight: '100dvh', background: T.bg, color: T.text, fontFamily: T.sans }}>
        <Fonts external={false} /><Header homeHref="/book" />
        <main style={{ maxWidth: 560, margin: '0 auto', padding: '70px 20px', textAlign: 'center' }}>
          <h1 className="rm-serif" style={{ fontSize: 'clamp(28px,4.6vw,40px)', margin: '0 0 14px' }}>Your payment did not go through.</h1>
          <p style={{ color: T.text2, fontSize: 17, lineHeight: 1.7, margin: '0 0 26px' }}>You have not been charged. This can happen with a bank check or a cancelled step. You can try again, with the same card or a different one.</p>
          <Btn href="/book#checkout">Try again</Btn>
        </main>
        <StepLegal />
      </div>
    )
  }
  const next = activeProducts(['upsell', 'core'])
  return (
    <div style={{ minHeight: '100dvh', background: T.bg, color: T.text, fontFamily: T.sans }}>
      <Fonts external={false} />
      <Header homeHref="/book" />
      <main style={{ maxWidth: 720, margin: '0 auto', padding: 'clamp(36px,6vw,72px) 20px 70px', textAlign: 'center' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/book/book-3d.webp" alt={`${BOOK_TITLE} book`} width={794} height={986} style={{ width: 'min(100%, 220px)', height: 'auto', margin: '0 auto 8px' }} />
        <div className="rm-eyebrow" style={{ marginBottom: 12 }}>{status === 'processing' ? 'Payment processing' : 'Payment received'}</div>
        <h1 className="rm-serif" style={{ fontSize: 'clamp(30px,5vw,46px)', margin: '0 0 14px' }}>You are in. <span className="rm-mark">Your book is on its way.</span></h1>
        <p style={{ color: T.text2, fontSize: 17, lineHeight: 1.7, margin: '0 auto 26px', maxWidth: 540 }}>{status === 'processing' ? 'Your bank is still confirming the payment. We will email your download link as soon as it clears.' : 'Your download link is in your confirmation email and on your Whop receipt. If you do not see it in a few minutes, check spam or promotions.'}</p>

        <div style={{ textAlign: 'left', background: T.surface, border: `1px solid ${T.line}`, borderRadius: T.radius, padding: 22, margin: '0 0 30px' }}>
          <div className="rm-eyebrow" style={{ marginBottom: 12 }}>Do this tonight, it takes one sitting</div>
          <ol style={{ margin: 0, paddingLeft: 20, display: 'grid', gap: 10, fontSize: 16, lineHeight: 1.6, color: T.text2 }}>
            <li>Download the PDF and save it somewhere easy to find.</li>
            <li>Sign your 30-day commitment on the first pages.</li>
            <li>Read Chapter 1 and write your Layer 3 why. That reason is what keeps you going.</li>
          </ol>
        </div>

        {next.map((p) => (
          <div key={p.slug} style={{ textAlign: 'left', borderRadius: 20, padding: 'clamp(20px,3.4vw,30px)', marginBottom: 16, border: '1px solid rgba(201,255,72,.35)', background: 'linear-gradient(160deg, rgba(201,255,72,.10), rgba(201,255,72,.02))' }}>
            <div className="rm-eyebrow" style={{ marginBottom: 8 }}>{p.slug === AUDIT.slug ? 'Want help applying it?' : 'Recommended next'}</div>
            <h2 className="rm-serif" style={{ fontSize: 'clamp(22px,3.2vw,30px)', margin: '0 0 8px' }}>{p.name}</h2>
            <p style={{ color: T.text2, fontSize: 16, lineHeight: 1.65, margin: '0 0 18px' }}>{p.tagline}</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
              <Btn href={p.checkoutPath} onClick={() => ftrack('book_upsell_click', { upsell: p.slug, value: p.price })}>Add it now: ${p.price}</Btn>
              <a href={p.path} onClick={() => ftrack('book_upsell_click', { upsell: p.slug, action: 'details' })} style={{ color: T.accentInk, fontWeight: 700, fontSize: 15 }}>See what is included</a>
            </div>
          </div>
        ))}
      </main>
      <StepLegal />
    </div>
  )
}
