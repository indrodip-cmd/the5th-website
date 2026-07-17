import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Free Business Growth Quiz | The5th Consulting',
  description:
    "Take the free 3-minute quiz to discover what's quietly capping your coaching or consulting income — and your fastest path to your next $10K month. From Indrodip Ghosh, The5th Consulting.",
  alternates: { canonical: '/quiz' },
  openGraph: {
    title: 'Free Business Growth Quiz | The5th Consulting',
    description: "Discover what's holding your business back — and your fastest path to your next $10K month.",
    url: '/quiz',
    type: 'website',
    siteName: 'The5th Consulting',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Business Growth Quiz | The5th Consulting',
    description: "Discover what's holding your business back — and your fastest path to your next $10K month.",
  },
}

export default function QuizLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
