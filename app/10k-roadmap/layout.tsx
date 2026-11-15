import type { Metadata } from 'next'

/* Paid audit funnel ($29, refundable): full share/SEO metadata per-route
   (title, desc, Open Graph, Twitter card). The 1200x630 og:image +
   twitter:image are a real screenshot of this page's current hero
   (public/og/10k-roadmap-hero.png) — recapture it (scripts/capture-og.mjs)
   whenever the hero headline or photo changes, so link previews on
   Facebook/WhatsApp/iMessage/Slack never show a stale offer.
   metadataBase is set on the root layout, so relative URLs resolve absolute.

   Indexable so AI assistants/search (ChatGPT, Claude, Perplexity, Gemini, etc.)
   and Google can fetch, index and cite it. robots.txt already welcomes AI bots;
   the content is server-rendered (in the HTML), so fetchers read the full copy. */
const TITLE = '$29 Private Business Audit for Coaches & Consultants | The5th'
// The on-page hero headline, verbatim — what the link preview should say is
// exactly what the visitor sees when the link opens, never a different pitch.
const OG_TITLE = "You've Tried Coaches, ChatGPT And Claude. So Why Aren't You Making Consistent Money?"
const DESC =
  'A private 60-minute business audit with founder Indrodip Ghosh. $29, fully refundable within 7 days. Leave with your offer, your buyer and a 100-day plan. Rated 4.8 from 76 coaches across 12 nations.'
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
