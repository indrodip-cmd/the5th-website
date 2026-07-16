import type { Metadata } from 'next'

/* Cold-traffic funnel: keep it out of the index and give it its own metadata.
   No site navigation is rendered anywhere in this route so paid traffic has a
   single path: watch → book. Gender-neutral share copy (overrides the site
   default). */
const SHARE_TITLE = 'Free 12-Minute Training for Coaches & Consultants | The5th'
const SHARE_DESC = '12 minutes that change how you see your coaching business. Watch free.'

export const metadata: Metadata = {
  title: SHARE_TITLE,
  description: SHARE_DESC,
  robots: { index: false, follow: false },
  openGraph: { title: SHARE_TITLE, description: SHARE_DESC },
  twitter: { title: SHARE_TITLE, description: SHARE_DESC },
}

/* Hide any third-party feedback / survey / toolbar widget that gets injected on
   the funnel (Contentsquare VoC, Hotjar-style, Vercel toolbar, generic
   "Feedback" buttons). Scoped to this route so the rest of the site keeps them. */
const HIDE_FEEDBACK_CSS = `
  #vercel-toolbar, vercel-live-feedback, [data-vercel-toolbar-root],
  [aria-label="Feedback" i], [aria-label*="feedback" i], [title="Feedback" i],
  iframe[title*="feedback" i], iframe[title*="survey" i],
  .cs-voc-widget, [id*="voc" i][class*="cs" i], [class*="feedback-button" i],
  [class*="feedbackButton" i], [id*="feedback" i][class*="widget" i],
  #hotjar-survey, .hj-widget-container, ._hj_feedback_container {
    display: none !important; visibility: hidden !important;
  }
`

export default function Make10kLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* Belt-and-suspenders: pre-set the widget's own load guard so the chat
          never mounts here even if a cached carolina.js (without the /lp/ path
          guard) is served from the edge. */}
      <script dangerouslySetInnerHTML={{ __html: 'window.__carolinaLoaded=true;' }} />
      <style dangerouslySetInnerHTML={{ __html: HIDE_FEEDBACK_CSS }} />
      {children}
    </>
  )
}
