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
    { key: 'payinfull', label: 'Pay in full', price: '$5,500', cadence: '', note: 'Full access · best value', planId: process.env.NEXT_PUBLIC_WHOP_FASTFORWARD_FULL_PLAN_ID || 'plan_FF_FULL_REPLACE_ME' },
    { key: 'plan', label: 'Payment plan', price: '$2,200', cadence: '/mo', note: 'Split across instalments', planId: process.env.NEXT_PUBLIC_WHOP_FASTFORWARD_PLAN_PLAN_ID || 'plan_FF_PLAN_REPLACE_ME' },
  ],
  returnUrl: (process.env.NEXT_PUBLIC_PLATFORM_ORIGIN || 'https://platform.the5th.consulting') + '/?joined=1',
  guarantee: 'Prefer to talk first? You can always book a call from the Fast Forward page.',
  backHref: '/fast-forward',
  backLabel: 'Back to Fast Forward',
}

export default function FastForwardCheckout() {
  return <CheckoutView config={config} />
}
