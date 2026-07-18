import type { Metadata } from 'next'
import TheShiftView from './TheShiftView'

const TITLE = 'The Shift — 3-Day Breakthrough Intensive with Indrodip Ghosh'
const DESC =
  "Three live days to clear the block that's kept you stuck, build an offer you actually believe in, and learn to sell it without ever feeling pushy. August 7–9 · just $27."

export const metadata: Metadata = {
  title: TITLE,
  description: DESC,
  alternates: { canonical: '/event/the-shift' },
  openGraph: { title: TITLE, description: DESC, url: '/event/the-shift', type: 'website' },
  twitter: { title: TITLE, description: DESC },
}

export default function TheShiftPage() {
  return <TheShiftView />
}
