# Make-$10k VSL Funnel (`/lp/make-10k-month`)

Cold-traffic opt-in → gated VSL → book-a-call funnel. Self-contained, no site
nav (single conversion path), `noindex`.

## Flow

1. **`/lp/make-10k-month`** — opt-in (first name + email). `POST /api/lp/opt-in`
   upserts a `vsl_leads` row (`status=opted_in`, `source=make-10k-month`) and
   mirrors the contact into `crm_contacts`. Redirects to `/watch`.
2. **`/lp/make-10k-month/watch`** — VSL. Player is lazy-mounted on scroll.
   Real cumulative watch-time (survives pause/resume **and** reload — seeded
   from `localStorage`) is checkpointed to `POST /api/lp/watch-progress` every
   30s and on tab-close (`sendBeacon`). At the reveal threshold the CTA +
   "Book a call" unlock and the lead flips to `status=watched_10min`.
3. **Book a call** — opens the Typeform in an embedded popup (no redirect) with
   `email`/`name` passed as **hidden fields**.
4. **`POST /api/webhooks/typeform`** — verifies the Typeform signature, logs the
   raw payload to `integration_webhooks`, matches the lead by hidden `email`,
   flips it to `status=call_booked`, stores the response, and emails the admin.

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

## Data model — `public.vsl_leads`

`id, name, email (unique), source, status, segment, opted_in_at,
watched_10min_at, call_booked_at, watch_progress_seconds, video_completed,
typeform_response_id, typeform_payload, admin_notified_at, crm_contact_id,
visitor_id, utm, created_at, updated_at`. RLS on (server/service-role only).
