import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/next";
import Script from 'next/script';
import PageTracker from './PageTracker';

const SITE_JSONLD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://the5th.consulting/#organization",
      name: "The5th Consulting",
      alternateName: "The5th",
      url: "https://the5th.consulting/",
      logo: { "@type": "ImageObject", url: "https://the5th.consulting/images/logo.png" },
      founder: { "@id": "https://the5th.consulting/#indrodip" },
      sameAs: [
        "https://www.instagram.com/the5thconsulting/",
        "https://open.spotify.com/show/033AYgOaBgPXGTAlNfLJfn",
        "https://www.facebook.com/withindrodip",
        "https://www.linkedin.com/in/marketing-growth-consultant/",
      ],
    },
    {
      "@type": "Person",
      "@id": "https://the5th.consulting/#indrodip",
      name: "Indrodip Ghosh",
      jobTitle: "Founder & Marketing Growth Consultant",
      worksFor: { "@id": "https://the5th.consulting/#organization" },
      url: "https://the5th.consulting/about",
      image: "https://the5th.consulting/images/founder.png",
      sameAs: [
        "https://www.facebook.com/withindrodip",
        "https://www.linkedin.com/in/marketing-growth-consultant/",
        "https://www.instagram.com/the5thconsulting/",
        "https://open.spotify.com/show/033AYgOaBgPXGTAlNfLJfn",
      ],
    },
    {
      "@type": "WebSite",
      "@id": "https://the5th.consulting/#website",
      url: "https://the5th.consulting/",
      name: "The5th Consulting",
      publisher: { "@id": "https://the5th.consulting/#organization" },
    },
  ],
}

export const metadata: Metadata = {
  metadataBase: new URL("https://the5th.consulting"),
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
          src="https://t.contentsquare.net/uxa/9af567d0424d8.js"
          strategy="afterInteractive"
        />
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-T45WJY6Q2W"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-T45WJY6Q2W');
          `}
        </Script>
        {/* Microsoft Clarity — session recordings + heatmaps */}
        <Script id="ms-clarity" strategy="afterInteractive">
          {`
            (function(c,l,a,r,i,t,y){
              c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
              t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
              y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window, document, "clarity", "script", "xk846cesvj");
          `}
        </Script>
        {/* First-party analytics — feeds the /admin command center */}
        <Script src="/track.js" strategy="afterInteractive" />
        {/* Cookie / privacy consent banner — shown site-wide */}
        <Script src="/cookie-consent.js" strategy="afterInteractive" />
        {/* Carolina — concierge chat widget (sales + booking) */}
        <Script src="/carolina.js" strategy="afterInteractive" />
        {/* Whop embedded checkout loader — powers the $1 trial checkout on the offer page */}
        <Script src="https://js.whop.com/static/checkout/loader.js" strategy="afterInteractive" />
        {/* Google reCAPTCHA v3 — invisible bot protection on lead forms (loads only when configured) */}
        {process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY && (
          <Script src={`https://www.google.com/recaptcha/api.js?render=${process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}`} strategy="afterInteractive" />
        )}
        {/* Structured data: Organization + Person (Indrodip Ghosh) + WebSite with sameAs */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(SITE_JSONLD) }} />
      </head>
      <body style={{ margin: 0, padding: 0, background: '#FAF6F0' }}>{children}<PageTracker /><Analytics /></body>
    </html>
  );
}
