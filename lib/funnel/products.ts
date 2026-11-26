/* Product catalog for every funnel on the site.

   One entry per sellable thing. Landing pages, checkouts, order bumps, upsells
   and cross-sell strips all read from here, so adding a product is a catalog
   entry plus a page, never a rebuild.

   kind:
     'front'   the low-friction entry offer a cold visitor buys first
     'bump'    a checkbox add-on on the checkout of another product
     'upsell'  shown on the thank-you page right after a purchase
     'core'    a higher-ticket offer the ecosystem is moving people toward

   A product is `active` only when everything it needs exists (plan id, price,
   name). Inactive products are never rendered, so unfinished offers cannot leak
   onto live pages. */
export type ProductKind = 'front' | 'bump' | 'upsell' | 'core'

export interface Product {
  slug: string
  kind: ProductKind
  name: string
  tagline: string
  price: number            // USD, what the buyer pays for this item on its own
  path: string             // landing page
  checkoutPath: string
  planId: string           // Whop plan; '' until configured
  active: boolean
  image?: string
}

/* NOTE: NEXT_PUBLIC_* values are inlined at build time only when read as a
   literal `process.env.NAME`, so each one is read explicitly below (a dynamic
   process.env[name] lookup would be empty in the browser bundle). */
const t = (v: string | undefined) => (v || '').trim()

export const FRONT_BOOK: Product = {
  slug: 'expertise-to-income',
  kind: 'front',
  name: 'Expertise to Income',
  tagline: 'The 104-page workbook that turns what you know into a digital product, an offer and a launch plan.',
  price: 4.99,
  path: '/book',
  checkoutPath: '/book/checkout',
  planId: t(process.env.NEXT_PUBLIC_WHOP_BOOK_PLAN_ID),
  active: true,
  image: '/images/book/book-3d.webp',
}

/* Order bump: shown as a checkbox on the book checkout. Configure it entirely
   from env (name, price, and a Whop plan whose price is book + bump) and it
   appears; leave any of them out and it stays off. */
export function bump(): (Product & { bundlePlanId: string; total: number }) | null {
  const name = t(process.env.NEXT_PUBLIC_BOOK_BUMP_NAME)
  const price = Number(t(process.env.NEXT_PUBLIC_BOOK_BUMP_PRICE))
  const bundlePlanId = t(process.env.NEXT_PUBLIC_WHOP_BOOK_BUMP_PLAN_ID)
  if (!name || !(price > 0) || !bundlePlanId) return null
  return {
    slug: 'book-bump', kind: 'bump', name, price, path: '/book', checkoutPath: '/book/checkout', planId: bundlePlanId, active: true,
    tagline: t(process.env.NEXT_PUBLIC_BOOK_BUMP_TAGLINE) || '', bundlePlanId, total: Math.round((FRONT_BOOK.price + price) * 100) / 100,
  }
}

/* The existing $29 private audit is the natural next step after the book. */
export const AUDIT: Product = {
  slug: 'private-audit',
  kind: 'upsell',
  name: 'Private 60-Minute Business Audit',
  tagline: 'Indrodip and Manisha go through your business with you, then you get a written audit and a 100-day roadmap.',
  price: 29,
  path: '/10k-roadmap',
  checkoutPath: '/audit-checkout',
  planId: t(process.env.NEXT_PUBLIC_WHOP_AUDIT_DIRECT_PLAN_ID) || 'plan_27RBggiz8MDCo',
  active: true,
}

export const CATALOG: Product[] = [FRONT_BOOK, AUDIT]

export const activeProducts = (kinds?: ProductKind[]) => CATALOG.filter((p) => p.active && (!kinds || kinds.includes(p.kind)))
export const bySlug = (slug: string) => CATALOG.find((p) => p.slug === slug)
