import BookLanding from './BookLanding'
import { BOOK_PRICE, BOOK_TITLE, BOOK_SUBTITLE, BOOK_PAGES, FAQ } from './config'

const TITLE = `${BOOK_TITLE}: ${BOOK_SUBTITLE} | Stop Selling Your Time. Start Building an Asset.`
const DESC = `A ${BOOK_PAGES}-page story-driven workbook that takes coaches, consultants and healers from expertise to a first digital product, a simple offer and a launch plan. Instant PDF download, ${BOOK_PRICE.label}.`

export const metadata = {
  title: TITLE,
  description: DESC,
  alternates: { canonical: '/book' },
  openGraph: {
    title: `${BOOK_TITLE}: ${BOOK_SUBTITLE}`,
    description: DESC,
    url: '/book',
    type: 'website',
    images: [{ url: '/images/book/og.jpg', width: 1200, height: 630, alt: `${BOOK_TITLE} book cover` }],
  },
  twitter: { card: 'summary_large_image', title: `${BOOK_TITLE}: ${BOOK_SUBTITLE}`, description: DESC, images: ['/images/book/og.jpg'] },
}

const JSONLD = [
  {
    '@context': 'https://schema.org',
    '@type': 'Book',
    name: `${BOOK_TITLE}: ${BOOK_SUBTITLE}`,
    author: [{ '@type': 'Person', name: 'Indrodip Ghosh' }, { '@type': 'Person', name: 'Christinee Mathison' }],
    numberOfPages: BOOK_PAGES,
    bookFormat: 'https://schema.org/EBook',
    inLanguage: 'en',
    image: 'https://the5thglobal.consulting/images/book/cover.webp',
    publisher: { '@type': 'Organization', name: 'The5th Global Consulting' },
    offers: { '@type': 'Offer', price: String(BOOK_PRICE.amount), priceCurrency: BOOK_PRICE.currency, availability: 'https://schema.org/InStock', url: 'https://the5thglobal.consulting/book' },
  },
  {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
  },
]

export default function BookPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(JSONLD) }} />
      <BookLanding />
    </>
  )
}
