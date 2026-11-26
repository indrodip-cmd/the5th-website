import { Suspense } from 'react'
import BookCheckout from './BookCheckout'

export const metadata = {
  title: 'Checkout: Expertise to Income | The5th',
  robots: { index: false, follow: false },
}

export default function BookCheckoutPage() {
  return (
    <Suspense fallback={null}>
      <BookCheckout />
    </Suspense>
  )
}
