import type { Metadata } from 'next'

const TITLE = 'Build a business around what you already know — Fifth Consulting'
const DESC =
  'Tell us what you’re building. A short set of questions to understand where you are, what you’re trying to achieve, and how Fifth Consulting can help.'
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
    type: 'website', url: URL, siteName: 'Fifth Consulting', title: TITLE, description: DESC,
  },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESC },
}

/* Scoped styles for the interest form + funnel chrome hygiene (hide the
   third-party feedback/toolbar widgets, pin the mobile theme colour). */
const CSS = `
  html { color-scheme: light; background:#FAF6F0; }
  #vercel-toolbar, vercel-live-feedback, [data-vercel-toolbar-root],
  [aria-label="Feedback" i], iframe[title*="feedback" i], iframe[title*="survey" i] {
    display: none !important; visibility: hidden !important;
  }
  .io-card {
    display: flex; align-items: center; gap: 14px; width: 100%; text-align: left;
    padding: 16px 18px; border: 1px solid #E7DFD4; border-radius: 14px;
    background: #fff; cursor: pointer; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 16px; transition: border-color .15s ease, background .15s ease, box-shadow .15s ease, transform .1s ease;
  }
  .io-card:hover { border-color: #C9B8DA; }
  .io-card:active { transform: scale(0.99); }
  .io-card:focus-visible { outline: 2px solid #552879; outline-offset: 2px; }
  .io-mark {
    flex: 0 0 auto; width: 22px; height: 22px; border: 2px solid #E7DFD4;
    display: inline-flex; align-items: center; justify-content: center; transition: all .15s ease;
  }
  .io-card-text { flex: 1; min-width: 0; }
  input:focus-visible, select:focus-visible { outline: 2px solid #552879; outline-offset: 1px; }
  @media (max-width: 520px) {
    .io-card { padding: 15px 16px; font-size: 15.5px; }
  }
`

export default function InterestLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <meta name="theme-color" content="#FAF6F0" />
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      {children}
    </>
  )
}
