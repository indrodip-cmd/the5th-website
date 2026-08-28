import type { Metadata } from 'next'

/* Post-purchase confirmation. Whop redirects here after a successful checkout
   (data-whop-checkout-redirect-url on the embed) and the Whop webhook on the
   platform provisions access / delivery automatically. No index. */
export const metadata: Metadata = {
  title: "You're in — The Knowledge Asset",
  robots: { index: false, follow: false },
}

const INK = '#15120D'
const IVORY2 = '#FBF7EF'
const GOLD_LT = '#C9A75A'
const GOLD_DK = '#846421'
const MUTE = 'rgba(245,240,230,.8)'
const SERIF = "'Gelica', 'Playfair Display', Georgia, serif"
const SANS = "'Inter', system-ui, -apple-system, sans-serif"

export default function WorkbookSuccess() {
  return (
    <main style={{ minHeight: '100dvh', background: INK, color: IVORY2, fontFamily: SANS, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 22px' }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&display=swap');`}</style>
      <div style={{ maxWidth: 560, textAlign: 'center' }}>
        <div style={{ width: 76, height: 76, margin: '0 auto 26px', borderRadius: '50%', background: `linear-gradient(145deg,${GOLD_LT},${GOLD_DK})`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#1c1405" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden><polyline points="20 6 9 17 4 12" /></svg>
        </div>
        <div style={{ fontFamily: SANS, fontSize: 12, fontWeight: 800, letterSpacing: '.22em', textTransform: 'uppercase', color: GOLD_LT }}>The Knowledge Asset</div>
        <h1 style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 'clamp(40px,9vw,64px)', letterSpacing: '-.02em', margin: '14px 0 0', lineHeight: 1 }}>YOU&apos;RE IN.</h1>
        <p style={{ fontSize: 17, color: MUTE, marginTop: 18, lineHeight: 1.7 }}>
          Your Knowledge Asset is ready. Check your email for access instructions — your three bonuses are included.
        </p>
        <div style={{ marginTop: 28, background: 'rgba(201,167,90,.1)', border: `1px solid rgba(201,167,90,.28)`, borderRadius: 16, padding: '22px 24px', textAlign: 'left' }}>
          <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: '.16em', textTransform: 'uppercase', color: GOLD_LT }}>Next step</div>
          <p style={{ fontFamily: SERIF, fontSize: 21, color: IVORY2, marginTop: 8, lineHeight: 1.4 }}>Open the workbook. Start with Chapter 1.</p>
          <p style={{ fontSize: 14.5, color: MUTE, marginTop: 6 }}>Read it. Do the work. Build the business.</p>
        </div>
        <a href="/" style={{ display: 'inline-block', marginTop: 26, fontSize: 13.5, color: 'rgba(245,240,230,.6)', textDecoration: 'none' }}>← Back to The5th Consulting</a>
      </div>
    </main>
  )
}
