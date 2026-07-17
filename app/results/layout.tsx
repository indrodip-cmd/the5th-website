import type { Metadata } from 'next'

/* Personalised quiz results — not for the index. */
export const metadata: Metadata = {
  title: 'Your Results | The5th Consulting',
  robots: { index: false, follow: true },
}

export default function ResultsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
