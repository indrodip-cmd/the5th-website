import localFont from 'next/font/local'

/* Vendored in app/fonts: no build-time dependency on Google Fonts. */
const inter = localFont({ src: '../fonts/inter.woff2', weight: '100 900', variable: '--f-inter', display: 'swap' })
const jakarta = localFont({ src: '../fonts/jakarta.woff2', weight: '200 800', variable: '--f-jakarta', display: 'swap' })

export default function BookLayout({ children }: { children: React.ReactNode }) {
  return <div className={`${inter.variable} ${jakarta.variable}`} style={{ fontFamily: 'var(--f-inter), system-ui, sans-serif' }}>{children}</div>
}
