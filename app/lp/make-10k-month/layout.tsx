import type { Metadata } from 'next'

/* Cold-traffic funnel: keep it out of the index and give it its own metadata.
   No site navigation is rendered anywhere in this route so paid traffic has a
   single path: watch → book. Gender-neutral share copy (overrides the site
   default). */
export const metadata: Metadata = {
  title: 'Free Masterclass: Your First $10K Month | The5th Consulting',
  description:
    'A free masterclass for experts, coaches and consultants over 40 on turning decades of expertise into a predictable $10K a month.',
  robots: { index: false, follow: false },
  openGraph: {
    title: 'Free Masterclass: Your First $10K Month | The5th Consulting',
    description:
      'The exact system experts and coaches over 40 use to turn what they already know into a predictable $10K a month.',
  },
  twitter: {
    title: 'Free Masterclass: Your First $10K Month | The5th Consulting',
    description:
      'The exact system experts and coaches over 40 use to turn what they already know into a predictable $10K a month.',
  },
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
