import type { Metadata } from 'next'

/* India audit page: full share/SEO metadata (title, desc, OG, Twitter).
   The 1200x630 og:image is a current screenshot of this landing page's hero
   (public/og/10k-roadmap-india-hero.png).
   Indexable so search + AI assistants can fetch and cite it. */
const TITLE = 'Business Roadmap Audit for Coaches in India | The5th'
const OG_TITLE = 'More ideas. Still unsure what brings clients?'
const DESC =
  'A 60-minute audit of your offer and client flow with Indrodip Ghosh and Manisha Satpute. Receive a personalized audit PDF and 100-day roadmap. ₹199 refundable booking deposit.'
const URL = 'https://the5thglobal.consulting/10k-roadmap/india'

export const metadata: Metadata = {
  title: TITLE,
  description: DESC,
  keywords: ['coaching business India', 'consultant growth India', 'predictable income', 'strategy audit', 'business roadmap', 'side business India', 'The5th Global Consulting'],
  alternates: { canonical: '/10k-roadmap/india' },
  robots: {
    index: true, follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
  },
  openGraph: {
    type: 'website',
    url: URL,
    siteName: 'The5th Global Consulting',
    title: OG_TITLE,
    description: DESC,
    images: [{ url: '/og/10k-roadmap-india-hero.png', width: 1200, height: 630, alt: OG_TITLE }],
  },
  twitter: {
    card: 'summary_large_image',
    title: OG_TITLE,
    description: DESC,
    images: ['/og/10k-roadmap-india-hero.png'],
  },
}

/* Hide third-party feedback/survey/toolbar widgets on the funnel only, and pin
   a light theme-color so mobile browser chrome matches. */
const FUNNEL_CSS = `
  html { color-scheme: light; background:var(--color-paper); }
  #vercel-toolbar, vercel-live-feedback, [data-vercel-toolbar-root],
  [aria-label="Feedback" i], [aria-label*="feedback" i], [title="Feedback" i],
  iframe[title*="feedback" i], iframe[title*="survey" i],
  .cs-voc-widget, [class*="feedback-button" i], #hotjar-survey, .hj-widget-container {
    display: none !important; visibility: hidden !important;
  }
`

export default function RoadmapAuditIndiaLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <meta name="theme-color" content="#f7f4ec" />
      <style dangerouslySetInnerHTML={{ __html: FUNNEL_CSS }} />
      {children}
    </>
  )
}
