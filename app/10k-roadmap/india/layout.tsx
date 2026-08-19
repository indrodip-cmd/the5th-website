import type { Metadata } from 'next'

/* India cold-traffic funnel: full share/SEO metadata (title, desc, OG, Twitter).
   The 1200x630 og:image is a real screenshot of this landing page's hero
   (public/og/10k-roadmap-india-hero.png), matching the parent funnel's pattern.
   Indexable so search + AI assistants can fetch and cite it. */
const TITLE = 'Build a Predictable, Profitable Business From Your Expertise | The5th (India)'
const OG_TITLE = 'Build a Predictable Business From Your Expertise, Guaranteed'
const DESC =
  'For Indian professionals & founders already earning ₹1 lakh+/month. You probably don’t need more content or funnels, just one fix. Find the exact bottleneck between you and a predictable business income, or get 100% of your money back.'
const URL = 'https://the5th.consulting/10k-roadmap/india'

export const metadata: Metadata = {
  title: TITLE,
  description: DESC,
  keywords: ['coaching business India', 'consultant growth India', 'predictable income', 'strategy audit', 'business roadmap', 'side business India', 'The5th Consulting'],
  alternates: { canonical: '/10k-roadmap/india' },
  robots: {
    index: true, follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
  },
  openGraph: {
    type: 'website',
    url: URL,
    siteName: 'The5th Consulting',
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
  html { color-scheme: light; background:#ffffff; }
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
      <meta name="theme-color" content="#ffffff" />
      <style dangerouslySetInnerHTML={{ __html: FUNNEL_CSS }} />
      {children}
    </>
  )
}
