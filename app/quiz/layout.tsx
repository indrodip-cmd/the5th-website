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
    // Actual landing-page hero screenshot (1200x630), not a client photo pulled
    // from the page body by the scraper.
    images: [{ url: '/og/quiz-hero.png', width: 1200, height: 630, alt: 'Free Business Growth Quiz | The5th Consulting' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Business Growth Quiz | The5th Consulting',
    description: "Discover what's holding your business back — and your fastest path to your next $10K month.",
    images: ['/og/quiz-hero.png'],
  },
}

export default function QuizLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
