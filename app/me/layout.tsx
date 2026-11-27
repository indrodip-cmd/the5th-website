import type { Metadata, Viewport } from 'next'
import { Cormorant_Garamond, DM_Sans } from 'next/font/google'
import './me.css'

const serif = Cormorant_Garamond({ subsets: ['latin'], weight: ['400', '500', '600'], style: ['normal', 'italic'], variable: '--me-serif', display: 'swap' })
const sans = DM_Sans({ subsets: ['latin'], variable: '--me-sans', display: 'swap' })

export const metadata: Metadata = {
  title: 'Your space | The5th',
  description: 'Your personal progress on The5th: your profile, what you have explored and your next best step. Stored on this device only.',
  robots: { index: false, follow: false },
}
export const viewport: Viewport = { themeColor: '#231029' }

export default function MeLayout({ children }: { children: React.ReactNode }) {
  return <div className={`${serif.variable} ${sans.variable} me-root`}>{children}</div>
}
