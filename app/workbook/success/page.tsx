import type { Metadata } from 'next'

/* Post-purchase confirmation. Whop redirects here after a successful checkout
   (data-whop-checkout-redirect-url on the embed) and the Whop webhook on the
   platform provisions access / delivery + the 7-day The5th AI trial. No index. */
export const metadata: Metadata = {
  title: "You're in — The Knowledge Asset",
  robots: { index: false, follow: false },
}

const PLUM_DK = '#2E1A35'
const PLUM_DEEP = '#241229'
const GOLD = '#C9A84C'
const GOLD_LT = '#E4C879'
const GOLD_DK = '#B8983F'
const GOLD_LINE = 'rgba(201,168,76,0.30)'
const CREAM = '#F6EFE3'
const MUTE = 'rgba(246,239,227,.8)'
const SERIF = "'Cormorant Garamond', Georgia, Times, serif"
const SANS = "'DM Sans', system-ui, -apple-system, sans-serif"

export default function WorkbookSuccess() {
  return (
    <main style={{ minHeight: '100dvh', background: `linear-gradient(180deg,${PLUM_DK},${PLUM_DEEP})`, color: CREAM, fontFamily: SANS, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 22px' }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=DM+Sans:wght@300;400;500;600;700&display=swap');`}</style>
      <div style={{ maxWidth: 580, textAlign: 'center' }}>
        <div style={{ width: 80, height: 80, margin: '0 auto 26px', borderRadius: '50%', background: `radial-gradient(circle at 50% 35%, ${GOLD_LT}, ${GOLD} 55%, ${GOLD_DK})`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 20px 50px rgba(184,152,63,.45), inset 0 2px 5px rgba(255,255,255,.5)' }}>
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke={PLUM_DK} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden><polyline points="20 6 9 17 4 12" /></svg>
        </div>
        <div style={{ fontFamily: SANS, fontSize: 11, fontWeight: 700, letterSpacing: '.22em', textTransform: 'uppercase', color: GOLD_LT }}>The Knowledge Asset</div>
        <h1 style={{ fontFamily: SERIF, fontWeight: 600, fontSize: 'clamp(3rem,10vw,5rem)', letterSpacing: '-.02em', margin: '14px 0 0', lineHeight: 1, color: CREAM }}>You&apos;re <em style={{ fontStyle: 'italic', color: GOLD_LT }}>in.</em></h1>
        <p style={{ fontFamily: SANS, fontSize: 17, fontWeight: 300, color: MUTE, marginTop: 18, lineHeight: 1.7 }}>
          Your Knowledge Asset is ready. Check your email for access instructions — your four bonuses, including your 7-day free trial of The5th AI, are included.
        </p>
        <div style={{ marginTop: 28, background: 'rgba(201,168,76,.1)', border: `1px solid ${GOLD_LINE}`, borderRadius: 16, padding: '22px 24px', textAlign: 'left' }}>
          <div style={{ fontFamily: SANS, fontSize: 11, fontWeight: 700, letterSpacing: '.16em', textTransform: 'uppercase', color: GOLD_LT }}>Next step</div>
          <p style={{ fontFamily: SERIF, fontSize: 23, color: CREAM, marginTop: 8, lineHeight: 1.3 }}>Open the workbook. Start with Chapter 1.</p>
          <p style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: 16, color: MUTE, marginTop: 6 }}>Read it. Do the work. Build the business.</p>
        </div>
        <a href="/" style={{ display: 'inline-block', marginTop: 26, fontFamily: SANS, fontSize: 13.5, color: 'rgba(246,239,227,.6)', textDecoration: 'none' }}>← Back to The5th Consulting</a>
      </div>
    </main>
  )
}
