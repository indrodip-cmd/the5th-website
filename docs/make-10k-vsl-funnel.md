# Make-$10k VSL Funnel (`/lp/make-10k-month`)

Cold-traffic opt-in → gated VSL → book-a-call funnel. Self-contained, no site
nav (single conversion path), `noindex`.

## Flow (two pages: opt-in → training)

1. **`/lp/make-10k-month`** (opt-in / sales) — hero video **poster** + CTAs. Any
   CTA opens a **modal** capturing **first name + email + phone**. `POST
   /api/lp/opt-in` validates a real, non-disposable email and a plausible phone
   (8–15 digits), upserts a `vsl_leads` row (`status=opted_in`, with `phone`),
   and mirrors the contact (incl. phone) into `crm_contacts`. On success it
   routes to `…/watch?name=&email=` (identity in the URL).
2. **`/lp/make-10k-month/watch`** (training) — reads identity from the URL
   (email required) → **a visitor with no email is redirected back to the
   opt-in**. The video **autoplays with sound and RESTARTS on every load**
   (commitment device; a warning banner says "don't close or it starts over").
   Watch-time is cumulative within the session but **not resumed across reloads**
   (`useVslWatch` starts at 0). Progress is still checkpointed to
   `POST /api/lp/watch-progress` every 30s + on tab-close. After the reveal
   threshold (**default 5 min**) the private-call invitation unlocks (offer copy
   from `/call`) and the lead flips to `status=watched_10min`.
3. **Book a call** — Typeform embedded popup (no redirect) with `email`/`name`
   hidden fields.
4. **`POST /api/webhooks/typeform`** — verifies signature, logs the raw payload
   to `integration_webhooks`, matches by hidden `email`, flips to
   `status=call_booked`, stores the response, emails the admin.

**Personalization:** name/email flow through the URL (`?name=&email=`, also
accepts an emailed link). The first name is used in greetings and CTA buttons on
both pages (e.g. "Watch Now, Sandra →", "Book My Free Call, Sandra →").

Note: the `watched_10min` status label is historical — the actual threshold is
`NEXT_PUBLIC_VSL_REVEAL_SECONDS` (default now 300s / 5 min).

`segment` mirrors `status` (`opted_in | watched_10min | call_booked`). Leads that
leave early stay at `opted_in` — visible in the CRM by the `vsl-opted-in` tag /
`Lead` pipeline stage.

## CRM sync

The in-house CRM reads the same Supabase DB. Every transition is mirrored into
`crm_contacts` via `lib/crm.ts` (`upsertContact` + `logActivity`): tags
`vsl-make-10k` + `vsl-opted-in` / `vsl-watched-10min` / `vsl-call-booked`, and
pipeline stage `Lead` → `Engaged` → `Call Booked`. Filter `/admin/crm` by those
tags to see each segment.

## Idempotency

- Email is the unique key on `vsl_leads` (double submits upsert, never duplicate).
- `watched_10min` uses a conditional `UPDATE ... WHERE status='opted_in'` — fires once.
- Admin email is claimed by setting `admin_notified_at` in a single
  `UPDATE ... WHERE admin_notified_at IS NULL` — webhook retries never double-send.
- Every webhook payload is logged to `integration_webhooks` before processing.

## Environment variables (set in Vercel)

| Var | Required | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_VSL_VIDEO_URL` | **yes** | YouTube or Vimeo URL/ID for the VSL. Without it the player shows a placeholder. |
| `NEXT_PUBLIC_VSL_REVEAL_SECONDS` | no | Watch-seconds before the CTA unlocks. Default `600` (10:00). |
| `NEXT_PUBLIC_TYPEFORM_FORM_ID` | no | Typeform form id for "Book a call". Default `u9maum7Y`. |
| `TYPEFORM_WEBHOOK_SECRET` | **yes** | Shared secret for Typeform webhook signature verification. Until set, the webhook runs unsecured (payloads accepted + logged with `signature_valid=false`). |
| `RESEND_API_KEY` | yes* | Already set — sends the admin booking notification. |
| `ADMIN_EMAIL` | no | Recipient of booking notifications. Default `indrodip@10kroadmap.org`. |
| `NEXT_PUBLIC_SITE_URL` | no | Base URL for the CRM link in the admin email. Default `https://the5th.consulting`. |

## Typeform setup

1. In the form, add two **hidden fields**: `email` and `name`.
2. Connect → Webhooks → add endpoint `https://the5th.consulting/api/webhooks/typeform`,
   set the secret to match `TYPEFORM_WEBHOOK_SECRET`.

## Social proof (real, from existing repo content)

The proof cards on the landing page live in `REAL_PROOF` in `config.ts`. Every
entry is pulled verbatim from case studies **already published publicly** on
the5th.consulting, so no new consent is required:

- `public/call/index.html` — detailed case-study cards: **Torill** ($210k single
  launch), **Laurie** ($14,193 / 60 days), **Gurpreet** ($18k / 3 months from $0).
- `public/index.html` — homepage testimonial ticker: **Angela** ($12k / 9 weeks),
  **Jeanne** ($8k / 8 weeks). Also available but unused: Seth, Hayley, Gabe,
  Laurie ($8,900), Toril, Abbas, and the homepage case-study tile (Susan, Shayma
  → $180k / 5 months).

First names only (matches the live site). **Flags to reconcile before scaling
spend — I did not guess:**
- **Laurie** appears twice with different figures — `$14,193 in 60 days`
  (call page, used) vs `$8,900 in 5 weeks` (homepage ticker). Confirm which is
  current.
- **Angela** appears twice — `$12,000 / 9 weeks` (ticker, used) vs `$2,500 /
  6 weeks` (homepage case-study tile). Likely different milestones or two people.
- Spelling **Torill** (call page) vs **Toril** (ticker).
- Avatar mismatch: headline targets "women 40+", but several real testimonials
  are men (Seth, Gabe, Abbas). The 5 selected are all women; broaden the
  headline if you want to feature the male results too.

Do not invent numbers/ratings — edit `REAL_PROOF` to swap in different real ones.

## Data model — `public.vsl_leads`

`id, name, email (unique), source, status, segment, opted_in_at,
watched_10min_at, call_booked_at, watch_progress_seconds, video_completed,
typeform_response_id, typeform_payload, admin_notified_at, crm_contact_id,
visitor_id, utm, created_at, updated_at`. RLS on (server/service-role only).
