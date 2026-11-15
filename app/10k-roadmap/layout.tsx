import type { Metadata } from 'next'

/* Paid audit funnel ($29, refundable): full share/SEO metadata per-route
   (title, desc, Open Graph, Twitter card). og:image + twitter:image come
   from the sibling opengraph-image.tsx (Next's file convention, same as
   /results, /event/the-shift and /research/*) — a composed, crop-safe card,
   not a raw page screenshot, so every surface that reads Open Graph tags
   (Facebook, WhatsApp, iMessage, Slack, Zoom chat, LinkedIn, ...) shows the
   same correct preview with nothing to configure per platform.
   metadataBase is set on the root layout, so relative URLs resolve absolute.

   Indexable so AI assistants/search (ChatGPT, Claude, Perplexity, Gemini, etc.)
   and Google can fetch, index and cite it. robots.txt already welcomes AI bots;
   the content is server-rendered (in the HTML), so fetchers read the full copy. */
const TITLE = '$29 Private Business Audit for Coaches & Consultants | The5th'
// The on-page hero headline, verbatim — what the link preview should say is
// exactly what the visitor sees when the link opens, never a different pitch.
const OG_TITLE = "You've Tried Coaches, ChatGPT And Claude. So Why Aren't You Making Consistent Money?"
const DESC =
  'A private 60-minute business audit with Indrodip Ghosh and Manisha Satpute. $29, fully refundable within 7 days. Leave with your offer, your buyer and a 100-day plan. Rated 4.8 from 76 coaches across 12 nations.'
const URL = 'https://the5thglobal.consulting/10k-roadmap'

export const metadata: Metadata = {
  title: TITLE,
  description: DESC,
  keywords: ['business audit for coaches', 'consultant growth audit', '$29 business audit', 'coaching business strategy', 'predictable revenue coaching', 'business growth calculator', 'The5th Global Consulting'],
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
  },
  twitter: {
    card: 'summary_large_image',
    title: OG_TITLE,
    description: DESC,
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
