import { Fonts, Header, Btn, StepLegal } from '../../10k-roadmap/ui'
import { T } from '../../10k-roadmap/config'
import { BOOK_TITLE } from '../config'

export const metadata = {
  title: 'Your book is on its way | The5th',
  robots: { index: false, follow: false },
}

export default function BookThankYou() {
  return (
    <div style={{ minHeight: '100dvh', background: T.bg, color: T.text, fontFamily: T.sans }}>
      <Fonts />
      <Header homeHref="/book" />
      <main style={{ maxWidth: 680, margin: '0 auto', padding: 'clamp(40px,7vw,80px) 20px 70px', textAlign: 'center' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/book/book-3d.webp" alt={`${BOOK_TITLE} book`} width={794} height={986} style={{ width: 'min(100%, 240px)', height: 'auto', margin: '0 auto 8px' }} />
        <div className="rm-eyebrow" style={{ marginBottom: 12 }}>Payment received</div>
        <h1 className="rm-serif" style={{ fontSize: 'clamp(32px,5vw,48px)', margin: '0 0 16px' }}>You are in. <span className="rm-mark">Your book is on its way.</span></h1>
        <p style={{ color: T.text2, fontSize: 17, lineHeight: 1.7, margin: '0 auto 28px', maxWidth: 520 }}>
          Your download link is in your confirmation email, and it is also available from your Whop receipt. If you do not see it within a few minutes, check your spam or promotions folder.
        </p>
        <div style={{ textAlign: 'left', background: T.surface, border: `1px solid ${T.line}`, borderRadius: T.radius, padding: 22, margin: '0 0 28px' }}>
          <div className="rm-eyebrow" style={{ marginBottom: 12 }}>Start here</div>
          <ol style={{ margin: 0, paddingLeft: 20, display: 'grid', gap: 10, fontSize: 15.5, lineHeight: 1.6, color: T.text2 }}>
            <li>Download the PDF and save it somewhere easy to find.</li>
            <li>Sign your 30-day commitment on the first pages.</li>
            <li>Read Chapter 1 tonight and write your Layer 3 why. One sitting is enough.</li>
          </ol>
        </div>
        <p style={{ color: T.text2, fontSize: 15, lineHeight: 1.65, margin: '0 0 22px' }}>
          Want help turning the book into a plan for your business? Book a private 60-minute audit with Indrodip and Manisha.
        </p>
        <Btn href="/10k-roadmap">See the private business audit</Btn>
      </main>
      <StepLegal />
    </div>
  )
}
