import type { Metadata } from 'next'
import TheShiftView from './TheShiftView'

const TITLE = 'The 3-Day Breakthrough Intensive with Indrodip Ghosh'
const DESC =
  'Three live days (Aug 7 to 9) to clear the block that’s kept you stuck, build an offer you actually believe in, and learn to sell it without ever feeling pushy. Just $27.'
const URL = 'https://the5th.consulting/event/the-shift'

export const metadata: Metadata = {
  title: TITLE,
  description: DESC,
  keywords: [
    'The 3-Day Breakthrough Intensive',
    'Indrodip Ghosh',
    'The5th Consulting',
    'coaching business event',
    'offer creation workshop',
    'sales training for coaches',
    'live business intensive',
  ],
  alternates: { canonical: '/event/the-shift' },
  openGraph: {
    type: 'website',
    url: URL,
    siteName: 'The5th Consulting',
    title: TITLE,
    description: DESC,
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESC,
  },
}

/* Event structured data so search + social surface the name, date, price and host. */
const EVENT_JSONLD = {
  '@context': 'https://schema.org',
  '@type': 'Event',
  name: 'The 3-Day Breakthrough Intensive',
  description: DESC,
  startDate: '2026-08-07T11:00:00-07:00',
  endDate: '2026-08-09T12:30:00-07:00',
  eventStatus: 'https://schema.org/EventScheduled',
  eventAttendanceMode: 'https://schema.org/OnlineEventAttendanceMode',
  location: { '@type': 'VirtualLocation', url: URL },
  image: [`${URL}/opengraph-image`],
  organizer: { '@type': 'Organization', name: 'The5th Consulting', url: 'https://the5th.consulting/' },
  performer: { '@type': 'Person', name: 'Indrodip Ghosh' },
  offers: {
    '@type': 'Offer',
    price: '27',
    priceCurrency: 'USD',
    availability: 'https://schema.org/InStock',
    url: URL,
    validFrom: '2026-07-01T00:00:00-07:00',
  },
}

export default function TheShiftPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(EVENT_JSONLD) }} />
      <TheShiftView />
    </>
  )
}
