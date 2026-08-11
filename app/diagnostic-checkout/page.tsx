import CheckoutView, { CheckoutConfig } from '../checkout/CheckoutView'

/* $27 Business Growth Diagnostic — one-time Whop purchase that unlocks the full
   report on /quiz/results. The Whop webhook (app/api/integrations/whop/webhook)
   marks quiz_leads.paid for the buyer's email and records the purchase in the CRM.
   Create the $27 Whop product and set NEXT_PUBLIC_WHOP_DIAGNOSTIC_PLAN_ID. */
export const metadata = { title: 'Unlock Your Full Business Growth Diagnostic | The5th' }

const config: CheckoutConfig = {
  eyebrow: 'The5th Business Growth Diagnostic',
  title: 'Your complete business diagnosis, and the exact path forward.',
  subtitle:
    'You have seen your health score and your single biggest gap. This unlocks the rest: your full diagnosis, your prioritised fixes, your personalised 30-day action plan, and a free 1:1 strategy call to implement it.',
  features: [
    'Your complete executive summary and full category breakdown',
    'Your signature offer, pricing strategy, and the language to hold your price',
    'Your personalised 30-day action plan and 7-day content plan',
    'Your prioritised fixes and the fastest path forward',
    'A free 1:1 strategy call with Indrodip, included',
  ],
  plans: [
    { key: 'diagnostic', label: 'Full Diagnostic', price: '$27', cadence: 'one-time', note: 'Instant access · yours to keep', planId: process.env.NEXT_PUBLIC_WHOP_DIAGNOSTIC_PLAN_ID || 'plan_85pIPWE1K0uBB' },
  ],
  returnUrl: 'https://the5th.consulting/checkout/complete?type=diagnostic',
  guarantee: '7-Day Satisfaction Guarantee — go through your full report and start implementing it. If you genuinely feel it did not give you meaningful value, email us within 7 days and we will review your request per our guarantee terms.',
  backHref: '/quiz/results',
  backLabel: 'Back to my assessment',
  prefillQuizEmail: true,
}

export default function DiagnosticCheckout() {
  return <CheckoutView config={config} />
}
