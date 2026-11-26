import { BOOK_PLAN_ID } from '@/lib/funnel/products'

/* Sales-page config for the "Expertise to Income" ebook ($4.99).
   Everything here is a claim the page makes, so it lives in one place.
   - Price and guarantee length are business decisions: confirm before launch.
   - The checkout plan id comes from the Whop dashboard (digital-download
     plan for the PDF); set NEXT_PUBLIC_WHOP_BOOK_PLAN_ID in Vercel. */
export const BOOK_PRICE = { amount: 4.99, label: '$4.99', currency: 'USD' } as const
export const BOOK_PAGES = 104
export const BOOK_CHAPTERS = 9
export const BOOK_GUARANTEE_DAYS = 365
/* Primary buy buttons scroll to the checkout embedded on the page itself
   (no page load between "yes" and the payment form). /book/checkout still
   exists as a standalone fallback. */
export const BOOK_CHECKOUT_PATH = '#checkout'

export function bookPlanId(): string {
  return BOOK_PLAN_ID
}

export const BOOK_TITLE = 'Expertise to Income'
export const BOOK_SUBTITLE = 'The 10K Roadmap Workbook'

export const BOOK_LEGAL =
  'This book is educational and makes no guarantee of income or results. Client results shown are the real experiences of specific people in the 10K Roadmap coaching program, not outcomes of reading this book, and they are not typical or a promise that you will achieve the same or similar results. Your results depend on your experience, effort, offer, market and factors outside our control.'

export const CHAPTERS = [
  { n: 1, title: 'Understand Your Why', line: 'Find the real reason behind the business, so you do not quit the first time it gets hard.', get: 'Your Layer 3 "why", your non-negotiables and a one-sentence 12-month vision.', by: 'Indrodip' },
  { n: 2, title: 'Diagnose Your Current Situation', line: 'An honest look at where you are: how you earn today, where money leaks, and what you know that others would pay to learn.', get: 'Your income breakdown, your biggest leaks, and your expertise inventory.', by: 'Indrodip' },
  { n: 3, title: 'The Asset Mindset', line: 'The difference between a job, a service business and an asset, and how the $7 to $10K product ladder works.', get: 'Your first product idea, your entry price and your place on the ladder.', by: 'Indrodip' },
  { n: 4, title: 'Find Your Perfect Audience', line: 'The One Person method: who exactly you serve, where they spend time, and what keeps them up at night.', get: 'A 10-detail profile of your One Person and your pain-to-product bridge statement.', by: 'Christinee' },
  { n: 5, title: 'Design Your First Digital Product', line: 'Choose the fastest format, price it with confidence, and say what it does in one sentence.', get: 'Your product blueprint and your one-sentence sales promise.', by: 'Christinee' },
  { n: 6, title: 'Create a Simple Offer That Sells Itself', line: 'The five parts of an offer that feels ridiculous to say no to: product, bonuses, guarantee, urgency and total value.', get: 'Your complete offer stack and a one-page offer description.', by: 'Christinee' },
  { n: 7, title: 'The Organic Content System', line: 'Get found by the right people with the Story, Lesson, CTA formula and five posts that sell without selling.', get: 'A 30-day content map, a 7-day plan and your five posts drafted.', by: 'Christinee' },
  { n: 8, title: 'Your Simple Launch Plan', line: 'Set up your profile and selling platform click by click, then run a 7-day launch with copy-and-personalise scripts.', get: 'A live product page, seven launch posts, ten people to message and a launch date.', by: 'Indrodip' },
  { n: 9, title: 'Mindset for Consistent $10K Months', line: 'Handle rejection and slow days, apply the 1% rule, and run a 5-minute daily reset so you keep going.', get: 'Your doubt response plan, consistency commitment and morning ritual.', by: 'Christinee' },
]

/* The reasons to buy, in the reader's words. Each maps to something that is
   actually in the book. */
export const PAINS = [
  'You are good at what you do, but your income stops the moment you stop working.',
  'You suspect you are sitting on knowledge people would pay for, but you tell yourself it is "too basic".',
  'You have bought courses or watched hours of videos and quit halfway because it all felt overwhelming.',
  'You do not know what to sell, who to sell it to, or what to charge.',
  'The tech side (a store, payments, a link) makes you freeze.',
  'You are afraid to be seen online, to be rejected, or to start "too late".',
]

export const OUTCOMES = [
  { ch: 1, t: 'Know why you are doing this', d: 'A 3-question method that digs past "I want more money" to the reason that keeps you going on slow days.' },
  { ch: 2, t: 'Spot what you already know that people will pay for', d: 'An expertise inventory that turns your experience, results and hard-won lessons into product ideas. One reader-style example in the book: a recovery practitioner who thought her knowledge was "too basic" had a course waiting to exist.' },
  { ch: 3, t: 'Move from trading time to owning an asset', d: 'See the difference between active, leveraged and passive income, and map a product ladder from a $7 entry product to premium coaching.' },
  { ch: 4, t: 'Choose the one person you serve', d: 'Describe your ideal buyer in 10 specific details, where they hang out online, and the five problems they think about at midnight, so everything you write feels personal.' },
  { ch: 5, t: 'Design and price your first product', d: 'Pick the fastest format (PDF, mini-course or template), set a price that removes objections, and write one sentence that says exactly what it does.' },
  { ch: 6, t: 'Build an offer people feel silly refusing', d: 'Stack your product, bonuses and guarantee into an offer, then write the one-page description that sells it.' },
  { ch: 7, t: 'Get found without ads or a big following', d: 'Use the Story, Lesson, CTA formula and a 30-day content map so each post attracts, builds trust or invites the next step.' },
  { ch: 8, t: 'Launch in seven days, even if you are not "techy"', d: 'Set up Facebook, Instagram and a selling platform step by step, then follow a day-by-day launch with message scripts for your first ten sales.' },
  { ch: 9, t: 'Keep going when it gets quiet', d: 'A plan for rejection, slow days and doubt, plus a 5-minute morning reset that keeps you consistent.' },
]

export const COMPARE = [
  { k: 'Format', book: 'A written workbook: read a short chapter, then fill in the pages', other: 'Hours of video you have to watch, pause and remember' },
  { k: 'Finish rate', book: 'One chapter at a time, each ending with a "write it down" page', other: 'Easy to abandon halfway' },
  { k: 'Outcome', book: 'A finished product, offer and launch plan written in your own words', other: 'Ideas and notes, but no finished plan' },
  { k: 'Tech', book: 'Every tool explained in plain English before it is used', other: 'Assumes you already know the tools' },
  { k: 'Price', book: BOOK_PRICE.label, other: 'Often hundreds or thousands of dollars' },
]

export const FAQ = [
  { q: 'What is Expertise to Income, in one sentence?', a: `A ${BOOK_PAGES}-page workbook that walks you, chapter by chapter, from "I know a lot but I trade hours for money" to a finished first digital product, a simple offer and a 7-day launch plan.` },
  { q: 'What is the catch at this price?', a: 'There is no catch. The book is priced so that money is never the reason you do not start. It stands on its own. If you later want someone to go through your business with you, there is a private audit, and that is entirely optional.' },
  { q: 'Who is this book for?', a: 'Coaches, consultants, healers and experts who know they have something valuable to teach but have not packaged it into a product yet, especially if you are over 40, not tech-savvy, and tired of trading hours for money. If you can send an email, you can follow it.' },
  { q: 'What exactly will I learn?', a: 'How to find your real why, spot the expertise people would pay for, choose the one person you serve, design and price a first digital product, write an offer with a guarantee, create content that attracts buyers, set up a store and launch in seven days, and stay consistent through rejection and slow days.' },
  { q: 'What do I get for the price?', a: `The full ${BOOK_PAGES}-page workbook as an instant PDF download: ${BOOK_CHAPTERS} chapters, every worksheet, the product blueprint, the offer stack, a 7-day launch plan with message scripts, and a 30-day content map. Read it on your phone, tablet or computer, or print it and write in it.` },
  { q: 'Is it just theory, or will I actually build something?', a: 'It is built around doing. Every chapter ends with worksheets and a "write it down" page, so by the end you have your why, your one person, a product blueprint, an offer stack, a content plan and a launch date on paper.' },
  { q: 'Do I need technical skills or a following?', a: 'No. Chapter 8 walks you through setting up your profile and a selling platform one click at a time, and every term is explained before it is used. Your first sales are meant to come from people who already know you.' },
  { q: 'How long will it take me to get through it?', a: 'The book suggests one chapter a week and a 30-day commitment, so most people work through it in a few weeks. Go faster or slower. The only rule is to do the exercises.' },
  { q: 'Will this work for me?', a: 'The book gives you a clear system and the exercises to apply it. Results depend on your effort, your offer and your market, so we cannot promise any outcome. What it will give you is clarity: your why, your one person, a product, an offer and a launch date.' },
  { q: 'How is this different from a course?', a: 'It is a workbook, not a video series. You read one chapter at a time and fill in the pages as you go, so you finish with real decisions written down, not just ideas.' },
  { q: 'How do I get the book?', a: 'Immediately after checkout. Your download link is delivered on the confirmation page and by email. If it does not arrive, check spam or contact us and we will sort it out the same day.' },
  { q: 'What if I do not like it?', a: `You are covered by a ${BOOK_GUARANTEE_DAYS}-day (full year) money-back guarantee. Email us within ${BOOK_GUARANTEE_DAYS} days of purchase and we will refund you.` },
]

/* Claims about the authors and the company. Sources: the live /go page
   (credentials, startup valuation note) and the founder's own statement
   (company sales figure). Keep wording identical to /go where it overlaps. */
export const COMPANY_SALES = 'over $15M in sales'
export const INDRODIP_CREDENTIALS = [
  'Consumer Psychologist, University of California, Berkeley',
  'AI startup founder (~$6M approximate valuation), backed by University of California alumni',
  'Recruited by Google, Anthropic, Mastermind.com and ClickFunnels',
  'Founder, The5th Global Consulting',
]
export const VALUATION_NOTE = 'Startup valuation (approximately $6M) is an estimate of the startup, not personal net worth, and does not guarantee outcomes for readers.'

/* Total clients worked with, per the founder. (/go still shows 76, which is
   the number behind the 4.8 rating: keep the rating's own sample size.) */
export const CLIENTS_SERVED = 79
