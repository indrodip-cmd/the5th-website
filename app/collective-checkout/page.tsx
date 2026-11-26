import CheckoutView, { CheckoutConfig } from '../checkout/CheckoutView'

// The5th Collective: single $997/year membership → platform tier member_yearly: full platform — weekly calls, The5th AI, Vega, courses,
// community, tracker, and custom 30/60/90-day action plans.
export const metadata = { title: 'Join The5th Collective — Checkout | The5th' }

// Create a $997 / 1-year plan in Whop and set NEXT_PUBLIC_WHOP_COLLECTIVE_YEARLY_PLAN_ID.
// There is deliberately no fallback: the old fallback plan charged $1,970.
const PLAN_ID = process.env.NEXT_PUBLIC_WHOP_COLLECTIVE_YEARLY_PLAN_ID || ''

const config: CheckoutConfig = {
  eyebrow: 'The5th Collective',
  title: 'Everything, and the room to use it.',
  subtitle:
    'The full platform plus the people. Weekly live calls, unlimited The5th AI, Vega, every course, the member community, and custom action plans built around your business.',
  features: [
    'Weekly live community calls with Indrodip and Manisha',
    'The5th AI coaching — no limits',
    'Vega — your full creative engine',
    'Custom 30 / 60 / 90-day action plans',
    'Every course + the member community & tracker',
    'Instant platform access · cancel anytime',
  ],
  plans: [
    { key: 'yearly', label: 'One-year membership', price: '$997', cadence: '/year', note: 'One payment · 365 days of access', planId: PLAN_ID },
  ],
  returnUrl: 'https://the5thglobal.consulting/checkout/complete?type=collective',
  guarantee: '365-day money-back guarantee: do the work for a full year and if you do not get results, we refund every penny.',
  backHref: '/collective',
  backLabel: 'Back to The Collective',
}

export default function CollectiveCheckout() {
  if (!PLAN_ID) {
    return (
      <main style={{ minHeight: '70vh', display: 'grid', placeItems: 'center', padding: 24, textAlign: 'center', fontFamily: 'DM Sans, sans-serif' }}>
        <div style={{ maxWidth: 460 }}>
          <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2.2rem', fontWeight: 500 }}>Checkout is opening shortly</h1>
          <p style={{ marginTop: 12, color: '#5a5550', lineHeight: 1.6 }}>Email <a href="mailto:support@10kroadmap.org" style={{ textDecoration: 'underline' }}>support@10kroadmap.org</a> and we will get you in today.</p>
        </div>
      </main>
    )
  }
  return <CheckoutView config={config} />
}
