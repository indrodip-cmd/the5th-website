import { Suspense } from 'react'
import AuditCheckout from './AuditCheckout'

/* In-site checkout for the $29 Private Business Audit. Replaces a direct link
   to a hosted whop.com page (every CTA on /10k-roadmap used to point there) —
   buyers now never leave the domain. Two steps on one page, no navigation:
     1. Amount + contact details (name, email, WhatsApp number).
     2. Whop's embedded card form, mounted only after step 1 is submitted.
   Step 1 saves the lead via the same /api/10k-roadmap/reserve endpoint the
   rest of the funnel uses, so this lands in the same CRM pipeline. */
export const metadata = {
  title: 'Checkout — $29 Private Business Audit | The5th',
  robots: { index: false, follow: false },
}

export default function AuditCheckoutPage() {
  return (
    <Suspense fallback={null}>
      <AuditCheckout />
    </Suspense>
  )
}
