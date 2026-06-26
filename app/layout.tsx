import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/next";
import Script from 'next/script';

export const metadata: Metadata = {
  title: "The5th AI Business Assessment | The5th Consulting",
  description: "A premium AI assessment that reads your coaching or consulting business, gives you a Business Health Score, names your biggest opportunity, and builds your personalised 90-day roadmap. Built for women over 40.",
  openGraph: {
    title: "The5th AI Business Assessment | The5th Consulting",
    description: "Get a Business Health Score, your biggest opportunity, and a personalised 90-day roadmap, built by AI for women turning expertise into income.",
  },
  twitter: {
    title: "The5th AI Business Assessment | The5th Consulting",
    description: "Get a Business Health Score, your biggest opportunity, and a personalised 90-day roadmap, built by AI for women turning expertise into income.",
  },
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-QFT4216XJD"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-QFT4216XJD');
          `}
        </Script>
      </head>
      <body style={{ margin: 0, padding: 0, background: '#FAF6F0' }}>{children}<Analytics /></body>
    </html>
  );
}
