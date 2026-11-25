import type { Metadata } from 'next'
import Landing from '../10k-roadmap/india/Landing'

export const metadata: Metadata = {
  title: 'Business Roadmap Audit for Coaches in India | The5th',
  description: 'A 60-minute audit of your offer and client flow with Indradip Ghosh and Manisha Satpute. Receive a personalized audit PDF and 100-day roadmap. ₹199 refundable booking deposit.',
  alternates: { canonical: '/india' },
  openGraph: {
    type: 'website',
    url: 'https://the5thglobal.consulting/india',
    siteName: 'The5th Global Consulting',
    title: 'More ideas. Still unsure what brings clients?',
    description: 'A 60-minute audit of your offer and client flow with Indradip Ghosh and Manisha Satpute. Receive a personalized audit PDF and 100-day roadmap. ₹199 refundable booking deposit.',
    images: [{ url: '/og/10k-roadmap-india-hero.png', width: 1200, height: 630, alt: 'The5th India Business Roadmap Audit' }],
  },
}

export default function IndiaPage() {
  return <Landing />
}
