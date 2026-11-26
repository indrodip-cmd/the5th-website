import type { Metadata } from 'next'
import Landing from '../10k-roadmap/india/Landing'

export const metadata: Metadata = {
  title: 'You’ve Tried Coaches, ChatGPT And Claude. So Why Aren’t You Making Consistent Money? | The5th',
  description: 'Before you spend another rupee on coaching, courses, or marketing tools, get a ₹199 business audit. Fully refundable within 7 days if it isn’t worth it.',
  alternates: { canonical: '/india' },
  openGraph: {
    type: 'website',
    url: 'https://the5thglobal.consulting/india',
    siteName: 'The5th Global Consulting',
    title: 'You’ve Tried Coaches, ChatGPT And Claude. So Why Aren’t You Making Consistent Money?',
    description: 'Before you spend another rupee on coaching, courses, or marketing tools, get a ₹199 business audit. Fully refundable within 7 days if it isn’t worth it.',
    images: [{ url: '/og/10k-roadmap-india-hero.png', width: 1200, height: 630, alt: 'The5th India Business Roadmap Audit' }],
  },
}

export default function IndiaPage() {
  return <Landing />
}
