import Landing from './Landing'
import { LANDING, RATING, AUDIT_CHECKOUT_URL } from './config'

/* Structured data for Google rich results (FAQ accordion → FAQPage, the
   audit itself → Service/Offer). Built from the same config the page
   renders from, so it can never drift out of sync with what's on screen. */
const FAQ_JSONLD = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: LANDING.faq.items.map((it) => ({
    '@type': 'Question',
    name: it.q,
    acceptedAnswer: { '@type': 'Answer', text: it.a },
  })),
}

const SERVICE_JSONLD = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  serviceType: 'Business strategy audit',
  name: 'The $10K Roadmap: Private 60-Minute Business Audit',
  description: 'A private 60-minute 1:1 business audit for coaches and consultants, conducted personally by founder Indrodip Ghosh and director Manisha Satpute. Includes a personalized audit PDF, a 100-day roadmap, business growth calculators and an AI implementation toolkit.',
  provider: { '@type': 'Organization', name: 'The5th Global Consulting', url: 'https://the5thglobal.consulting' },
  areaServed: ['United States', 'Canada', 'United Kingdom', 'Australia'].map((name) => ({ '@type': 'Country', name })),
  offers: {
    '@type': 'Offer',
    price: '29',
    priceCurrency: 'USD',
    url: AUDIT_CHECKOUT_URL,
    availability: 'https://schema.org/InStock',
  },
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: RATING.score,
    reviewCount: '76',
  },
}

export default function RoadmapAuditPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(SERVICE_JSONLD) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_JSONLD) }} />
      <Landing />
    </>
  )
}
