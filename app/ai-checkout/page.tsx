import CheckoutView, { CheckoutConfig } from '../checkout/CheckoutView'

// The5th AI ($47/mo or $470/yr) → platform tier ai_only:
// The5th AI + Vega + My Journey (AI coaching). No community/calls.
export const metadata = { title: 'Get The5th AI — Checkout | The5th' }

const config: CheckoutConfig = {
  eyebrow: 'The5th AI',
  title: 'Your AI business partner, from today.',
  subtitle:
    'The5th AI coaching, the Vega creative engine, and your personalised My Journey roadmap — everything you need to think, build, and launch. Instant access the moment you join.',
  features: [
    'The5th AI — coaching, strategy, content & scripts on demand',
    'Vega — your creative engine for PDFs, lead magnets & sales pages',
    'My Journey — your personalised roadmap & AI coaching path',
    'Instant platform access · cancel anytime',
  ],
  plans: [
    { key: 'monthly', label: 'Monthly', price: '$47', cadence: '/month', note: 'Instant access · cancel anytime', planId: process.env.NEXT_PUBLIC_WHOP_AI_MONTHLY_PLAN_ID || 'plan_3j4lU1rGraSsI' },
    { key: 'yearly', label: 'Yearly · save', price: '$470', cadence: '/year', note: '3-day free trial · card required, nothing charged until day 4', planId: process.env.NEXT_PUBLIC_WHOP_AI_YEARLY_PLAN_ID || 'plan_WcN3LXNivkAss' },
  ],
  returnUrl: process.env.NEXT_PUBLIC_PLATFORM_ORIGIN || 'https://platform.the5th.consulting',
  backHref: '/ai',
  backLabel: 'Back to The5th AI',
}

export default function AiCheckout() {
  return <CheckoutView config={config} />
}
