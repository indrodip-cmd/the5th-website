import type { Metadata } from 'next'

/* Public case-study library SEO. The page is a client component and can't
   export metadata, so this route-segment layout sets title/description/OG,
   overriding the root layout's "assessment" copy that was showing on shared
   links (WhatsApp, iMessage, etc.). og:image comes from opengraph-image.tsx. */
const title = 'Client Case Studies & Results | The5th Consulting'
const description =
  'Real coaches and consultants, real revenue. Browse documented case studies — from a first $2,500 to $210,000 — showing exactly what we built and what it produced.'

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: '/results' },
  robots: { index: true, follow: true },
  openGraph: {
    type: 'website',
    url: '/results',
    siteName: 'The5th Consulting',
    title,
    description,
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
  },
}

export default function ResultsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
