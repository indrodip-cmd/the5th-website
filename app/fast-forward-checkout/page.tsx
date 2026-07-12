import CheckoutView, { CheckoutConfig } from '../checkout/CheckoutView'

// Fast Forward group coaching → platform tier member_yearly (full platform +
// coaching). Set the real plan id + price via env once the Whop plan exists.
export const metadata = { title: 'Enroll in Fast Forward — Checkout | The5th' }

const config: CheckoutConfig = {
  eyebrow: 'Fast Forward',
  title: 'Turn a lifetime of experience into $10K months.',
  subtitle:
    'The guided group-coaching program that takes you from expertise to a launched, selling offer — with the full platform, live coaching, and a proven path beside you the whole way.',
  features: [
    'Live group coaching with Indrodip',
    'The complete The5th platform — AI, Vega & My Journey',
    'Weekly calls, community & performance tracking',
    'Custom 30 / 60 / 90-day action plans',
    'Backed by the $10K/month guarantee',
  ],
  plans: [
    { key: 'plan', label: 'Payment plan', price: '$1,850', cadence: '/mo × 3', note: '3 monthly instalments · full access from day one', planId: process.env.NEXT_PUBLIC_WHOP_FASTFORWARD_PLAN_PLAN_ID || 'plan_TMxdlGR3FTwvp' },
  ],
  returnUrl: 'https://the5th.consulting/checkout/complete?type=fast-forward',
  guarantee: 'Backed by our 365-day money-back guarantee — a full year to put it to work.',
  backHref: '/fast-forward',
  backLabel: 'Back to Fast Forward',
}

export default function FastForwardCheckout() {
  return <CheckoutView config={config} />
}
