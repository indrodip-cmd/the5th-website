# Funnel architecture (book funnel and every funnel after it)

Goal: one conversion system, many products. A new product should be a catalog
entry plus a page, not a rebuild.

## The ladder

| Rung | What | Where it lives |
| --- | --- | --- |
| Lead magnet | Free Chapter 1 by email | `app/book` `LeadMagnet`, `/api/book/lead` |
| Front-end | Expertise to Income, $4.99 | `lib/funnel/products.ts` `FRONT_BOOK` |
| Order bump | Checkbox on checkout | `bump()` in products.ts, off until configured |
| Upsell | $29 Private Audit on the thank-you page | `AUDIT` in products.ts |
| Core | Higher ticket (coaching, programs) | add with `kind: 'core'`, it appears on the thank-you page automatically |

## Add a product

1. Add an entry to `CATALOG` in `lib/funnel/products.ts` (price, plan id, paths).
2. Copy `app/book` to `app/<product>` and change copy/config. Reuse the shared
   pieces: `Graphics.tsx`, `Interactive.tsx`, `funnel.ts`, `config.ts` shape.
3. Add its Whop plan id to the webhook branch in `lib/whop-fulfillment.ts`
   (tag the buyer; revenue is already recorded for every Whop sale).
4. It shows up in `/admin/funnel` once it emits the same `book_*` style events.

## Enabling the order bump (no deploy needed beyond env)

Create a Whop plan whose price is book + bump, then set in Vercel:

- `NEXT_PUBLIC_BOOK_BUMP_NAME`, `NEXT_PUBLIC_BOOK_BUMP_PRICE` (the extra amount)
- `NEXT_PUBLIC_WHOP_BOOK_BUMP_PLAN_ID` (the combined plan)
- optional `NEXT_PUBLIC_BOOK_BUMP_TAGLINE`

The checkbox appears and swaps the checkout to the combined plan.

## Colour system

`/book` sets CSS variables per section (`.th-dark`, `.th-light` in
`BookLanding.tsx`). Default is hybrid: dark hero, proof band and closing CTA
(attention), light reading sections (readability for a 40+ audience). The
`theme` experiment compares it against the original all-dark page.

## Measurement

- Behaviour: first-party events to `/api/track` (`analytics_events`), each with
  `meta = { name, exp, device, src, med, camp, product, ... }`. See `app/book/funnel.ts`.
- Revenue: Whop webhook -> `revenue_events` (server-confirmed), matched by plan id.
- Report: `/admin/funnel` (conversion, CTR, checkout rate, revenue, AOV,
  revenue per visitor, by variant / device / source, CTA and section reach).
- GA / dataLayer / Vercel Analytics also receive every event.

## A/B tests

Defined in `lib/funnel/experiments.ts`. Visitors are bucketed once in
`proxy.ts` (cookie `a5_exp`, 90 days), the server renders their variant on the
first paint. Currently: `headline` (control | value), `cta` (access | book),
`theme` (hybrid | dark). Force a variant for QA: `/book?exp=theme:dark,cta:book`.
Add an experiment by adding a key; remove one by deleting it.
Decide winners on revenue per visitor, not click-through, and only after
roughly 100+ visitors per variant with a clear gap.

## Not built yet (honest list)

- `/book` is a bespoke page; the shared parts are extracted but it is not yet a
  fully config-driven template.
- Whop "one-click upsell after purchase" needs a Whop-side setup; the thank-you
  upsell is a normal link to the audit checkout.
- No email nurture sequence yet beyond the one Chapter 1 delivery email.
