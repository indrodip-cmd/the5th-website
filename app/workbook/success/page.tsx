import type { Metadata } from 'next'
import ThankYou from './ThankYou'

/* Post-purchase thank-you / delivery page. Whop redirects here after a
   successful checkout (data-whop-checkout-redirect-url on the embed); the Whop
   webhook on the platform provisions the 7-day The5th AI trial. The buyer can
   download the workbook immediately and book their free bonus strategy call.
   Not indexed. */
export const metadata: Metadata = {
  title: "You're in — Download The Knowledge Asset",
  robots: { index: false, follow: false },
}

export default function WorkbookSuccessPage() {
  return <ThankYou />
}
