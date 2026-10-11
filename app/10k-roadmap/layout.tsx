import type { Metadata } from 'next'

/* Cold-traffic free-call funnel: full share/SEO metadata per-route (title,
   desc, Open Graph, Twitter card). The 1200x630 og:image + twitter:image are
   a real screenshot of this page's hero (public/og/10k-roadmap-hero.png),
   kept in sync with the live headline below. metadataBase is set on the root
   layout, so relative URLs resolve absolute.

   Indexable so AI assistants/search (ChatGPT, Claude, Perplexity, Gemini, etc.)
   and Google can fetch, index and cite it. robots.txt already welcomes AI bots;
   the content is server-rendered (in the HTML), so fetchers read the full copy. */
const TITLE = 'Build a $10,000/Month Business in the Next 100 Days | Free Roadmap Session'
const OG_TITLE = 'In 60 Minutes, I’ll Show You How to Build a $10,000/Month Business in the Next 100 Days'
const DESC =
  'A free 60-minute 1:1 Roadmap Session for coaches, consultants and experienced professionals 40+. You leave with your offer, your buyer and your first 100-day plan.'
const URL = 'https://the5thglobal.consulting/10k-roadmap'

export const metadata: Metadata = {
  title: TITLE,
  description: DESC,
  keywords: ['coaching business', 'consultant growth', '$10K per month', 'strategy audit', 'coaching for coaches', 'predictable revenue', 'The5th Global Consulting'],
  alternates: { canonical: '/10k-roadmap' },
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
    // Actual landing-page hero screenshot (1200x630), not a generated card.
    images: [{ url: '/og/10k-roadmap-hero.png', width: 1200, height: 630, alt: OG_TITLE }],
  },
  twitter: {
    card: 'summary_large_image',
    title: OG_TITLE,
    description: DESC,
    images: ['/og/10k-roadmap-hero.png'],
  },
}

/* Hide third-party feedback/survey/toolbar widgets on the funnel only, and pin
   a dark theme-color so mobile browser chrome matches. */
const FUNNEL_CSS = `
  html { color-scheme: light; background:#ffffff; }
  #vercel-toolbar, vercel-live-feedback, [data-vercel-toolbar-root],
  [aria-label="Feedback" i], [aria-label*="feedback" i], [title="Feedback" i],
  iframe[title*="feedback" i], iframe[title*="survey" i],
  .cs-voc-widget, [class*="feedback-button" i], #hotjar-survey, .hj-widget-container {
    display: none !important; visibility: hidden !important;
  }
`

export default function RoadmapAuditLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <meta name="theme-color" content="#ffffff" />
      {/* Warm up the cal.com embed connection early so the scheduler iframe on
          /schedule starts loading the moment the user reaches it. */}
      <link rel="preconnect" href="https://app.cal.com" crossOrigin="" />
      <link rel="dns-prefetch" href="https://app.cal.com" />
      <style dangerouslySetInnerHTML={{ __html: FUNNEL_CSS }} />
      {children}
    </>
  )
}
