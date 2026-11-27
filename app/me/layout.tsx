import type { Metadata, Viewport } from 'next'
import './me.css'

export const metadata: Metadata = {
  title: 'Your space | The5th',
  description: 'Your personal progress on The5th: your profile, what you have explored and your next best step. Stored on this device only.',
  robots: { index: false, follow: false },
}
export const viewport: Viewport = { themeColor: '#231029' }

/* Fonts load in the browser (same stylesheet as the static pages) so the build never depends on fetching Google Fonts. */
export default function MeLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="me-root">
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&display=swap" rel="stylesheet" />
      {children}
    </div>
  )
}
