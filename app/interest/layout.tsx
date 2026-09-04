import type { Metadata, Viewport } from 'next'

const TITLE = 'The end-to-end platform to build your coaching business — The5th Consulting'
const DESC =
  'One place to build and grow your coaching business — positioning, offers, funnels, content and automation. Tell us what you’re building and we’ll map where you are and how we can help.'
const URL = 'https://the5th.consulting/interest'

export const metadata: Metadata = {
  title: TITLE,
  description: DESC,
  alternates: { canonical: '/interest' },
  robots: {
    index: true, follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
  },
  openGraph: {
    type: 'website', url: URL, siteName: 'The5th Consulting', title: TITLE, description: DESC,
  },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESC },
}

/* Pin a light color-scheme for this route so a phone's dark theme / the
   browser's auto-dark can't invert the branded cream page into near-black.
   Emits <meta name="color-scheme" content="light">, which Chrome's Auto Dark
   honours as an opt-out. */
export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#FBF8F2',
  width: 'device-width',
  initialScale: 1,
}

/* Scoped styles for the interest form + funnel chrome hygiene (hide the
   third-party feedback/toolbar/chat widgets, pin the mobile theme colour). */
const CSS = `
  :root { color-scheme: light; }
  html, body { background:#FBF8F2 !important; overflow-x: hidden; max-width: 100%; }
  /* Keep the branded look identical under a device/browser dark theme —
     never let the page get auto-inverted. */
  @media (prefers-color-scheme: dark) {
    html, body { background:#FBF8F2 !important; }
  }
  #vercel-toolbar, vercel-live-feedback, [data-vercel-toolbar-root],
  [aria-label="Feedback" i], iframe[title*="feedback" i], iframe[title*="survey" i] {
    display: none !important; visibility: hidden !important;
  }
  .io-card {
    display: flex; align-items: center; gap: 14px; width: 100%; text-align: left;
    padding: 17px 18px; border: 1px solid #E7DDCE; border-radius: 15px;
    background: #fff; cursor: pointer; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 16px; -webkit-tap-highlight-color: transparent;
    transition: border-color .15s ease, background .15s ease, box-shadow .15s ease, transform .08s ease;
  }
  @media (hover: hover) { .io-card:hover { border-color: #D8C58E; box-shadow: 0 4px 16px rgba(46,26,53,0.06); } }
  .io-card:active { transform: scale(0.985); }
  .io-card:focus-visible { outline: 2px solid #C9A84C; outline-offset: 2px; }
  .io-card--on {
    border-color: #C9A84C; background: rgba(201,168,76,0.09);
    box-shadow: 0 0 0 1px #C9A84C, 0 6px 18px rgba(201,168,76,0.14);
  }
  .io-mark {
    flex: 0 0 auto; width: 24px; height: 24px; border: 2px solid #E7DDCE;
    display: inline-flex; align-items: center; justify-content: center; transition: all .15s ease;
  }
  .io-card-text { flex: 1; min-width: 0; line-height: 1.35; }
  .io-btn { -webkit-tap-highlight-color: transparent; }
  .io-btn:active:not(:disabled) { transform: scale(0.98); }
  @media (hover: hover) {
    .io-btn--primary:not(:disabled):hover { box-shadow: 0 10px 30px rgba(46,26,53,0.30); }
    .io-btn--ghost:hover { color: #2E1A35; }
  }
  .io-btn:focus-visible { outline: 2px solid #C9A84C; outline-offset: 3px; }
  select:focus-visible { outline: 2px solid #C9A84C; outline-offset: 1px; }
  @media (max-width: 520px) {
    .io-card { padding: 16px 15px; font-size: 15.5px; border-radius: 14px; }
    .io-mark { width: 22px; height: 22px; }
  }
`

export default function InterestLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      {children}
    </>
  )
}
