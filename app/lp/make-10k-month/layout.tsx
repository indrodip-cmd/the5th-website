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

export default function Make10kLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* Belt-and-suspenders: pre-set the widget's own load guard so the chat
          never mounts here even if a cached carolina.js (without the /lp/ path
          guard) is served from the edge. */}
      <script dangerouslySetInnerHTML={{ __html: 'window.__carolinaLoaded=true;' }} />
      {children}
    </>
  )
}
