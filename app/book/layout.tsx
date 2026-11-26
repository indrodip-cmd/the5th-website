import { Inter, Plus_Jakarta_Sans } from 'next/font/google'

/* Self-hosted with metric-matched fallbacks: no render-blocking Google CSS and no layout shift on swap. */
const inter = Inter({ subsets: ['latin'], variable: '--f-inter', display: 'swap' })
const jakarta = Plus_Jakarta_Sans({ subsets: ['latin'], variable: '--f-jakarta', display: 'swap' })

export default function BookLayout({ children }: { children: React.ReactNode }) {
  return <div className={`${inter.variable} ${jakarta.variable}`} style={{ fontFamily: 'var(--f-inter), system-ui, sans-serif' }}>{children}</div>
}
