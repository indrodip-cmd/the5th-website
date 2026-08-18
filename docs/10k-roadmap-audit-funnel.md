# The $10K Roadmap Audit — paid conversion funnel

A premium **light/white high-authority** funnel for cold traffic (The5th brand:
plum `#2E1A35` + purple accent `#5E2E86` on white/cream `#FAF6F0`, Cormorant Garamond serif, no em dashes),
built as ONE continuous experience:

```
VSL → Qualification → [ 5-step wizard ] → done
                    ↘ Not qualified → /not-a-fit (relationship preserved)

5-step wizard (persistent progress indicator, purple accent):
  1. Your Details (/apply)     name/email/phone → save lead
  2. Payment (/pay)            $27 Whop embedded checkout
  3. Deep Questions (/questions)  embedded Typeform — SERVER-GATED on payment
  4. Pick a Time (/schedule)   cal.com embed (prefilled) — SERVER-GATED on payment
  5. Confirmation (/confirmed) date/time + countdown + Google/Apple/Outlook + refund reminder

Server-side gating: Steps 3-5 require the signed HttpOnly `audit_paid_pass`
cookie, issued only by /api/10k-roadmap/unlock after the Whop webhook marks the
lead paid. Direct-URL access without it renders the PayGate, never the step.
(Legacy standalone pages /reserved, /thank-you, /success remain but are not in
this primary flow.)
```

Lives at **`/10k-roadmap`** (a NEW route — the existing free `/lp/make-10k-month`
funnel is untouched, so nothing running on ads breaks). Not indexed.

## Routes

| Path | What |
|---|---|
| `/10k-roadmap` | Landing: hero + VSL, recognition→tension copy, mechanism chain, video + case-study proof, who-it's-for, $27 deposit explainer, 3 FAQs, final CTA |
| `/10k-roadmap/qualify` | 5-question qualification, one at a time. A `reject` option routes to `/not-a-fit`. On success it redirects STRAIGHT to the Whop checkout (`AUDIT_CHECKOUT_URL` in `config.ts`, currently `plan_85pIPWE1K0uBB`) |
| `/10k-roadmap/not-a-fit` | Rejection page — rejects the timing/fit, not the person. Routes to `/results` + `/quiz` |
| `/10k-roadmap/reserved` | **The post-payment page — set this as Whop's post-purchase redirect: `https://the5th.consulting/10k-roadmap/reserved`.** Explains why the step matters, embeds the deep-questions **Typeform** (`NEXT_PUBLIC_AUDIT_TYPEFORM_ID`); on submit it **auto-redirects to the cal.com page** (`NEXT_PUBLIC_AUDIT_CAL_URL`). Mandatory — no skip (only a refresh fallback if the form fails to load) |
| `/10k-roadmap/thank-you` | **Set this as cal.com's "redirect on booking" URL: `https://the5th.consulting/10k-roadmap/thank-you`.** Shows the booked date/time, a live **countdown**, and **Add to Google / Apple / Outlook** calendar links. Resolves the booking from cal.com's appended `uid`/`email` (via `/api/10k-roadmap/booking-lookup`), with an email-lookup fallback |
| `/10k-roadmap/success` | Confirmation moment + booking card + **Add to Google/Apple/Outlook** (ICS built from the real event) |

APIs under `/api/10k-roadmap/*`: `reserve`, `status`, `diagnostic`, `slots`, `booking`.

## Data & reuse (no new tables, no migrations)

- **Leads:** reuses `vsl_leads` (source `10k-roadmap-audit`). All structured funnel
  data (qualification, deep diagnostic, payment, booking) lives in the
  `typeform_payload` JSONB under an `audit` object; `status`/`segment` carry the
  stage (`audit_reserved → audit_paid → audit_booked`). Engine: `lib/roadmap-audit.ts`.
- **CRM:** every transition mirrors into `crm_contacts` via `lib/crm.ts` (tags +
  pipeline_stage + timeline), so audit leads land in `/admin/crm` and `/admin/inbox`.
- **Payment:** existing Whop embedded checkout. The Whop webhook
  (`app/api/integrations/whop/webhook`) matches the audit plan id and calls
  `markAuditPaid()` → flips the lead to paid. **Payment is verified server-side**;
  the `/reserved` page polls `/api/10k-roadmap/status` and only unlocks the
  diagnostic + booking once the webhook has confirmed it.
- **Booking:** real cal.com availability via `lib/calcom.ts` (`getSlots` /
  `createBooking`). No fake calendar — if cal.com isn't configured, the booking
  step falls back to the public cal.com link.
- **Attribution:** UTM params persist across the whole funnel (sessionStorage) and
  are stored on the lead.

## Tracking

Single dispatcher `app/10k-roadmap/track.ts` fans every funnel event out to GA
(`gtag`) + dataLayer + Vercel Analytics + the Whop Pixel: `page_view`, `vsl_play`,
`vsl_25/50/75`, `vsl_complete`, `cta_click`, `qualification_started/completed/
accepted/rejected`, `checkout_started`, `payment_success/failed`,
`deep_application_started/completed`, `calendar_viewed`, `calendar_time_selected`,
`booking_completed`, `success_page_viewed`, `calendar_{google,apple,outlook}_clicked`.

## Copy & question logic are modular

All copy, design tokens, and BOTH question sets (with `reject` flags that drive
routing) live in `app/10k-roadmap/config.ts`. Tune the psychology there without
touching the funnel plumbing. Rejection verdict is re-derived server-side in
`/api/10k-roadmap/reserve` so a forged "qualified" can't reach checkout.

## Required environment variables

| Var | Purpose |
|---|---|
| `NEXT_PUBLIC_AUDIT_VIDEO_URL` | VSL (YouTube / Vimeo / mp4). Empty → "coming soon" poster |
| `NEXT_PUBLIC_WHOP_AUDIT_PLAN_ID` | **$27 deposit** Whop plan id (client — powers the checkout embed) |
| `WHOP_AUDIT_PLAN_ID` | Same plan id, server-side (webhook match + paid gate) |
| `NEXT_PUBLIC_AUDIT_TYPEFORM_ID` | Typeform id for the post-payment deep questions (default `u9maum7Y`) |
| `NEXT_PUBLIC_AUDIT_CAL_URL` | cal.com booking URL to redirect to after the Typeform (default `https://cal.com/indrodip-ghosh-ut1vxh/60min`) |

> ⚠️ **Create a DEDICATED $27 Whop plan for the deposit.** Until
> `NEXT_PUBLIC_WHOP_AUDIT_PLAN_ID` / `WHOP_AUDIT_PLAN_ID` are set, the checkout
> falls back to the shared diagnostic plan id and the deposit will be
> mis-attributed (and the paid-gate webhook branch won't fire). Set both before launch.

Already-configured infra it reuses: `CALCOM_API_KEY` (+ optional
`CALCOM_EVENT_TYPE_ID`), `RESEND_API_KEY`, `WHOP_WEBHOOK_SECRET` (+ Whop connector),
Supabase keys, `NEXT_PUBLIC_SITE_URL`.

## Whop setup checklist

1. Create a $27 one-time "10K Roadmap Audit — Commitment Deposit" plan in Whop.
2. Set `NEXT_PUBLIC_WHOP_AUDIT_PLAN_ID` and `WHOP_AUDIT_PLAN_ID` to that plan id.
3. Ensure the Whop webhook endpoint is subscribed to `payment.succeeded`
   (already wired; the audit branch is additive and guarded).
