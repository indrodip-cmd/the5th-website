import type { Metadata } from 'next'

/* The Knowledge Asset — sales landing page for the $7.93 workbook.
   Indexed (this is a public product page). Product structured data below
   uses the exact offer price; no aggregateRating is emitted because there
   are no verified reviews yet (per the brief). */
export const metadata: Metadata = {
  title: 'The Knowledge Asset — Build a $10K-a-Month Digital Business',
  description:
    'Turn what you know into a digital business. The Knowledge Asset is a practical workbook that helps coaches, consultants, healers, creators, and experts build their product, offer, audience, content, and launch toward $10K/month.',
  alternates: { canonical: 'https://the5th.consulting/workbook' },
  openGraph: {
    type: 'website',
    url: 'https://the5th.consulting/workbook',
    title: 'The Knowledge Asset — Turn What You Know Into an Asset You Can Sell',
    description: 'A build-as-you-go workbook for coaches, consultants, and experts. Build your product, offer, audience, content, and launch toward $10K months — including a 7-day free trial of The5th AI.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'The Knowledge Asset — Turn What You Know Into an Asset You Can Sell',
    description: 'A build-as-you-go workbook for coaches, consultants, and experts. Build toward $10K months — includes a 7-day free trial of The5th AI. $7.93.',
  },
}

const PRODUCT_JSONLD = {
  '@context': 'https://schema.org',
  '@type': 'Book',
  name: 'The Knowledge Asset',
  bookFormat: 'https://schema.org/EBook',
  numberOfPages: 9,
  inLanguage: 'en',
  url: 'https://the5th.consulting/workbook',
  author: [
    { '@type': 'Person', name: 'Indrodip Ghosh' },
    { '@type': 'Person', name: 'Christinee Mathison' },
  ],
  publisher: { '@type': 'Organization', name: 'The5th Consulting' },
  description:
    'A practical, build-as-you-go workbook that helps coaches, consultants, healers, creators, and experts turn what they know into a digital business — building their product, offer, audience, content, and launch toward $10K/month.',
  offers: {
    '@type': 'Offer',
    price: '7.93',
    priceCurrency: 'USD',
    availability: 'https://schema.org/InStock',
    url: 'https://the5th.consulting/workbook',
  },
}

export default function WorkbookLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(PRODUCT_JSONLD) }} />
      {children}
    </>
  )
}
