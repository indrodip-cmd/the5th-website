import BookLanding from './BookLanding'
import { BOOK_PRICE, BOOK_TITLE, BOOK_SUBTITLE, BOOK_PAGES, BOOK_GUARANTEE_DAYS, FAQ, COMPANY_SALES } from './config'

const SITE = 'https://the5thglobal.consulting'
const URL = `${SITE}/book`
const TITLE = `${BOOK_TITLE}: The 10K Roadmap Workbook | ${BOOK_PRICE.label} Ebook`
const DESC = `A ${BOOK_PAGES}-page step-by-step workbook to turn your expertise into a digital product, an offer and a 7-day launch plan. By Indrodip Ghosh and Christinee Mathison. ${BOOK_PRICE.label}.`
const OG_IMG = `${SITE}/images/book/og.jpg`

export const metadata = {
  title: TITLE,
  description: DESC,
  keywords: ['expertise to income', '10K roadmap workbook', 'digital product ebook', 'how to sell your expertise', 'coach ebook', 'consultant workbook', 'create a digital product', 'stop trading time for money', 'Indrodip Ghosh', 'Christinee Mathison', 'The5th Global Consulting'],
  authors: [{ name: 'Indrodip Ghosh', url: `${SITE}/about` }, { name: 'Christinee Mathison' }],
  creator: 'Indrodip Ghosh',
  publisher: 'The5th Global Consulting',
  category: 'Business & Money',
  alternates: { canonical: URL },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1, 'max-video-preview': -1 } },
  openGraph: {
    title: `${BOOK_TITLE}: The 10K Roadmap Workbook`,
    description: DESC,
    url: URL,
    siteName: 'The5th Global Consulting',
    locale: 'en_US',
    type: 'website',
    images: [{ url: OG_IMG, width: 1200, height: 630, alt: `${BOOK_TITLE} ebook cover by Indrodip Ghosh and Christinee Mathison` }],
  },
  twitter: { card: 'summary_large_image', title: `${BOOK_TITLE}: The 10K Roadmap Workbook`, description: DESC, images: [OG_IMG] },
  other: {
    'product:price:amount': String(BOOK_PRICE.amount),
    'product:price:currency': BOOK_PRICE.currency,
    'product:availability': 'in stock',
    'og:price:amount': String(BOOK_PRICE.amount),
    'og:price:currency': BOOK_PRICE.currency,
  },
}

/* One connected graph: the Book is also the Product being sold, authored by
   the existing Person node (#indrodip, defined site-wide in app/layout.tsx)
   and a second Person for the co-author, published by the Organization node.
   No ratings or review counts are claimed for the book itself. */
const GRAPH = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebPage',
      '@id': `${URL}#webpage`,
      url: URL,
      name: TITLE,
      description: DESC,
      inLanguage: 'en',
      isPartOf: { '@id': `${SITE}/#website` },
      primaryImageOfPage: { '@id': `${URL}#cover` },
      breadcrumb: { '@id': `${URL}#breadcrumb` },
      about: { '@id': `${URL}#book` },
      datePublished: '2026-11-26',
      dateModified: '2026-11-26',
    },
    {
      '@type': 'BreadcrumbList',
      '@id': `${URL}#breadcrumb`,
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'The5th Global Consulting', item: `${SITE}/` },
        { '@type': 'ListItem', position: 2, name: BOOK_TITLE, item: URL },
      ],
    },
    { '@type': 'ImageObject', '@id': `${URL}#cover`, url: `${SITE}/images/book/cover.webp`, width: 840, height: 1200, caption: `${BOOK_TITLE} ebook cover` },
    { '@type': 'Person', '@id': `${SITE}/#christinee`, name: 'Christinee Mathison', jobTitle: 'Mindset coach and co-author', description: 'Mindset coach with expertise in audience clarity and offer building. Co-author of Expertise to Income.' },
    {
      '@type': ['Book', 'Product'],
      '@id': `${URL}#book`,
      name: `${BOOK_TITLE}: ${BOOK_SUBTITLE}`,
      alternateName: BOOK_TITLE,
      description: `A story-driven ${BOOK_PAGES}-page workbook that takes coaches, consultants and healers from expertise to a first digital product, a simple offer and a launch plan. Founded by The5th Global Consulting, which has generated ${COMPANY_SALES}.`,
      image: { '@id': `${URL}#cover` },
      url: URL,
      inLanguage: 'en',
      numberOfPages: BOOK_PAGES,
      bookFormat: 'https://schema.org/EBook',
      genre: 'Business',
      author: [{ '@id': `${SITE}/#indrodip` }, { '@id': `${SITE}/#christinee` }],
      publisher: { '@id': `${SITE}/#organization` },
      brand: { '@id': `${SITE}/#organization` },
      sku: 'expertise-to-income-ebook',
      workExample: { '@type': 'Book', bookFormat: 'https://schema.org/EBook', encodingFormat: 'application/pdf', inLanguage: 'en' },
      offers: {
        '@type': 'Offer',
        url: URL,
        price: String(BOOK_PRICE.amount),
        priceCurrency: BOOK_PRICE.currency,
        availability: 'https://schema.org/InStock',
        itemCondition: 'https://schema.org/NewCondition',
        seller: { '@id': `${SITE}/#organization` },
        hasMerchantReturnPolicy: {
          '@type': 'MerchantReturnPolicy',
          applicableCountry: 'US',
          returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
          merchantReturnDays: BOOK_GUARANTEE_DAYS,
        },
      },
    },
    {
      '@type': 'FAQPage',
      '@id': `${URL}#faq`,
      mainEntity: FAQ.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
    },
  ],
}

export default function BookPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(GRAPH) }} />
      <BookLanding />
    </>
  )
}
