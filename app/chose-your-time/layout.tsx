import type { Metadata } from 'next'

/* Booking utility step — not for the index. */
export const metadata: Metadata = {
  title: 'Choose Your Time | The5th Consulting',
  robots: { index: false, follow: true },
}

export default function ChoseYourTimeLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
