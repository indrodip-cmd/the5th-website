import type { Metadata } from 'next'

/* Cold-traffic paid funnel: keep it out of the index, give it its own share
   metadata, and render NO site navigation/footer chrome so paid traffic has a
   single path. The dark theme + fonts are injected by <Fonts/> in the pages. */
const SHARE_TITLE = 'The $10K Roadmap Audit | The5th'
const SHARE_DESC = 'A private 60-minute audit to find the one bottleneck between your expertise and a predictable $10K/month. For coaches & consultants 40+.'

export const metadata: Metadata = {
  title: SHARE_TITLE,
  description: SHARE_DESC,
  robots: { index: false, follow: false },
  openGraph: { title: SHARE_TITLE, description: SHARE_DESC },
  twitter: { title: SHARE_TITLE, description: SHARE_DESC },
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
      <style dangerouslySetInnerHTML={{ __html: FUNNEL_CSS }} />
      {children}
    </>
  )
}
