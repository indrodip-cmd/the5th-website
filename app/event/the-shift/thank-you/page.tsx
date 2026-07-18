import type { Metadata } from 'next'
import ThankYouView from './ThankYouView'

export const metadata: Metadata = {
  title: "You're in — The Shift · 3-Day Breakthrough Intensive",
  description: 'Your seat for The Shift is confirmed. Add all three sessions to your calendar.',
  robots: { index: false, follow: false },
}

export default function TheShiftThankYouPage() {
  return <ThankYouView />
}
