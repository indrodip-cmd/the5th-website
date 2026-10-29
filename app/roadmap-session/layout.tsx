import type { Metadata } from 'next'
import Script from 'next/script'

const TITLE = 'Free Roadmap Session: Map Your Offer, Buyer & Next 100 Days'
const OG_TITLE = 'A Free 60-Minute Working Session to Map Your Offer, Your Buyer, and Your Next 100 Days'
const DESC = 'A free, 60-minute 1:1 Roadmap Session for coaches, consultants and service experts. Leave with your offer, your buyer and your first 100-day plan. No pitch.'
const URL = 'https://the5thglobal.consulting/roadmap-session'

export const metadata: Metadata = {
  title: TITLE,
  description: DESC,
  keywords: ['coaching business', 'consultant growth', 'client acquisition', 'business strategy session', 'The5th Global Consulting'],
  alternates: { canonical: '/roadmap-session' },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 } },
  openGraph: { type: 'website', url: URL, siteName: 'The5th Global Consulting', title: OG_TITLE, description: DESC },
  twitter: { card: 'summary_large_image', title: OG_TITLE, description: DESC },
}

const FUNNEL_CSS = `
  html { color-scheme: light; background:#ffffff; }
  #vercel-toolbar, vercel-live-feedback, [data-vercel-toolbar-root],
  [aria-label="Feedback" i], [aria-label*="feedback" i], [title="Feedback" i],
  iframe[title*="feedback" i], iframe[title*="survey" i],
  .cs-voc-widget, [class*="feedback-button" i], #hotjar-survey, .hj-widget-container {
    display: none !important; visibility: hidden !important;
  }
`

/* Meta Pixel base code — deferred, and entirely absent when the env var is
   unset, so the funnel never ships a hardcoded pixel id (section 7). */
function PixelScript() {
  const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID
  if (!pixelId) return null
  return (
    <Script id="meta-pixel" strategy="lazyOnload">
      {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
      n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
      n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
      t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
      document,'script','https://connect.facebook.net/en_US/fbevents.js');
      fbq('init', '${pixelId}');
      fbq('track', 'PageView');`}
    </Script>
  )
}

export default function RoadmapSessionLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <meta name="theme-color" content="#ffffff" />
      <link rel="preconnect" href="https://app.cal.com" crossOrigin="" />
      <link rel="dns-prefetch" href="https://app.cal.com" />
      <style dangerouslySetInnerHTML={{ __html: FUNNEL_CSS }} />
      <PixelScript />
      {children}
    </>
  )
}
