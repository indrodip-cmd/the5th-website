import type { Metadata, Viewport } from 'next'
import localFont from 'next/font/local'
import './quiz.css'

/* Fonts are vendored in app/fonts, so the build never depends on reaching Google. */
const serif = localFont({
  src: [
    { path: '../fonts/cormorant-normal.woff2', style: 'normal', weight: '300 700' },
    { path: '../fonts/cormorant-italic.woff2', style: 'italic', weight: '300 700' },
  ],
  variable: '--qz-serif', display: 'swap',
})
const sans = localFont({ src: '../fonts/dmsans.woff2', weight: '100 1000', variable: '--qz-sans', display: 'swap' })

const TITLE = 'Free Income Blocker Quiz: What Is Really Stopping You From Making Money? | The5th'
const DESC = 'Take the free 3-minute quiz and get your personal Income Blocker Report: the mental and money block holding your income down, what it costs you, and a 7-day plan to move it. From Indrodip Ghosh, The5th Global Consulting.'

export const metadata: Metadata = {
  title: TITLE,
  description: DESC,
  alternates: { canonical: '/quiz' },
  openGraph: { title: TITLE, description: DESC, url: '/quiz', type: 'website', siteName: 'The5th Global Consulting', images: [{ url: '/og/quiz-hero.png', width: 1200, height: 630, alt: 'Free Income Blocker Quiz' }] },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESC, images: ['/og/quiz-hero.png'] },
}

export const viewport: Viewport = { themeColor: '#231029' }

export default function QuizLayout({ children }: { children: React.ReactNode }) {
  return <div className={`${serif.variable} ${sans.variable} qz-root`}>{children}</div>
}
