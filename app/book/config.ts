/* Sales-page config for the "Expertise to Income" ebook ($4.99).
   Everything here is a claim the page makes, so it lives in one place.
   - Price and guarantee length are business decisions: confirm before launch.
   - The checkout plan id comes from the Whop dashboard (digital-download
     plan for the PDF); set NEXT_PUBLIC_WHOP_BOOK_PLAN_ID in Vercel. */
export const BOOK_PRICE = { amount: 4.99, label: '$4.99', currency: 'USD' } as const
export const BOOK_PAGES = 104
export const BOOK_CHAPTERS = 9
export const BOOK_GUARANTEE_DAYS = 7
export const BOOK_CHECKOUT_PATH = '/book/checkout'

export function bookPlanId(): string {
  return process.env.NEXT_PUBLIC_WHOP_BOOK_PLAN_ID || ''
}

export const BOOK_TITLE = 'Expertise to Income'
export const BOOK_SUBTITLE = 'The 10K Roadmap Workbook'

export const BOOK_LEGAL =
  'This book is educational and makes no guarantee of income or results. Client results shown are the real experiences of specific people in the 10K Roadmap coaching program, not outcomes of reading this book, and they are not typical or a promise that you will achieve the same or similar results. Your results depend on your experience, effort, offer, market and factors outside our control.'

export const CHAPTERS = [
  { n: 1, title: 'Understand Your Why', line: 'The 3-layer method that finds the reason you will not quit on.', by: 'Indrodip' },
  { n: 2, title: 'Diagnose Your Current Situation', line: 'The time-money audit, the bleeding-money audit, and your expertise inventory.', by: 'Indrodip' },
  { n: 3, title: 'The Asset Mindset', line: 'Job, service, or asset: how digital products work, and the $7 to $10K ladder.', by: 'Indrodip' },
  { n: 4, title: 'Find Your Perfect Audience', line: 'The One Person method: who you serve, where they are, what keeps them up at night.', by: 'Christinee' },
  { n: 5, title: 'Design Your First Digital Product', line: 'Pick the fastest format, price it, and write your one-sentence sales promise.', by: 'Christinee' },
  { n: 6, title: 'Create a Simple Offer That Sells Itself', line: 'The 5 parts of an offer that feels ridiculous to say no to.', by: 'Christinee' },
  { n: 7, title: 'The Organic Content System', line: 'Story, lesson, CTA, plus your first 30 days of content mapped out.', by: 'Christinee' },
  { n: 8, title: 'Your Simple Launch Plan', line: 'Set up Facebook, Instagram and your selling platform, then a 7-day launch, step by step.', by: 'Indrodip' },
  { n: 9, title: 'Mindset for Consistent $10K Months', line: 'Handle rejection and slow days, the 1% rule, and a 5-minute morning ritual.', by: 'Christinee' },
]

export const FAQ = [
  { q: 'Who is this book for?', a: 'Coaches, consultants, healers and experts who know they have something valuable to teach but have not packaged it into a product yet, especially if you are over 40, not tech-savvy, and tired of trading hours for money. If you can send an email, you can follow it.' },
  { q: 'What exactly do I get for $4.99?', a: `The full ${BOOK_PAGES}-page workbook as an instant PDF download: ${BOOK_CHAPTERS} chapters, every worksheet, the product blueprint, the offer stack, a 7-day launch plan with message scripts, and a 30-day content map. You can read it on your phone, tablet or computer, or print it and write in it.` },
  { q: 'Do I need technical skills or a following?', a: 'No. Chapter 8 walks you through setting up your social profile and a selling platform one click at a time, and every term is explained before it is used. Your first sales are meant to come from people who already know you.' },
  { q: 'Will this work for me?', a: 'The book gives you a clear system and the exercises to apply it. Results depend on your effort, your offer and your market, so we cannot promise any outcome. What it will give you is clarity: your why, your one person, a product, an offer and a launch date.' },
  { q: 'How is this different from a course?', a: 'It is a workbook, not a video series. You read one chapter at a time and fill in the pages as you go, so you finish with real decisions written down, not just ideas.' },
  { q: 'How do I get the book?', a: 'Immediately after checkout. Your download link is delivered on the confirmation page and by email. If it does not arrive, check spam or contact us and we will sort it out the same day.' },
  { q: 'What if I do not like it?', a: `You are covered by a ${BOOK_GUARANTEE_DAYS}-day money-back guarantee. Email us within ${BOOK_GUARANTEE_DAYS} days of purchase and we will refund you.` },
]
