import { Suspense } from 'react'
import ThankYou from './ThankYou'

export default function ThankYouPage() {
  return <Suspense fallback={null}><ThankYou /></Suspense>
}
