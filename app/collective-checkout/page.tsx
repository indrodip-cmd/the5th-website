import CheckoutView, { CheckoutConfig } from '../checkout/CheckoutView'

// The5th Collective ($197/mo or $1,970/yr) → platform tier member_monthly /
// member_yearly: full platform — weekly calls, The5th AI, Vega, courses,
// community, tracker, and custom 30/60/90-day action plans.
export const metadata = { title: 'Join The5th Collective — Checkout | The5th' }

const config: CheckoutConfig = {
  eyebrow: 'The5th Collective',
  title: 'Everything, and the room to use it.',
  subtitle:
    'The full platform plus the people. Weekly live calls, unlimited The5th AI, Vega, every course, the member community, and custom action plans built around your business.',
  features: [
    'Weekly live community calls with Indrodip',
    'The5th AI coaching — no limits',
    'Vega — your full creative engine',
    'Custom 30 / 60 / 90-day action plans',
    'Every course + the member community & tracker',
    'Instant platform access · cancel anytime',
  ],
  plans: [
    { key: 'yearly', label: 'Yearly · best value', price: '$1,970', cadence: '/year', note: '$164/month · 2 months free', planId: process.env.NEXT_PUBLIC_WHOP_COLLECTIVE_YEARLY_PLAN_ID || 'plan_YEARLY_REPLACE_ME' },
    { key: 'monthly', label: 'Monthly', price: '$197', cadence: '/month', note: 'Instant access · cancel anytime', planId: process.env.NEXT_PUBLIC_WHOP_COLLECTIVE_MONTHLY_PLAN_ID || 'plan_MONTHLY_REPLACE_ME' },
  ],
  returnUrl: (process.env.NEXT_PUBLIC_PLATFORM_ORIGIN || 'https://platform.the5th.consulting') + '/?joined=1',
  guarantee: 'Cancel anytime, self-serve, right from your membership dashboard.',
  backHref: '/collective',
  backLabel: 'Back to The Collective',
}

export default function CollectiveCheckout() {
  return <CheckoutView config={config} />
}
