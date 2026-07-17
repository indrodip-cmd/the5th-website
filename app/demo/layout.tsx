import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Try The5th AI — Live Demo | The5th Consulting',
  description:
    'See The5th AI in action — the AI business coach that reads your coaching or consulting business and builds a personalised 90-day roadmap. No signup needed. From Indrodip Ghosh, The5th Consulting.',
  alternates: { canonical: '/demo' },
  openGraph: {
    title: 'Try The5th AI — Live Demo | The5th Consulting',
    description: 'The AI business coach that reads your business and builds your personalised 90-day roadmap. Try it live, no signup.',
    url: '/demo',
    type: 'website',
    siteName: 'The5th Consulting',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Try The5th AI — Live Demo | The5th Consulting',
    description: 'The AI business coach that reads your business and builds your personalised 90-day roadmap. Try it live, no signup.',
  },
}

export default function DemoLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
