# `/10k-roadmap` Funnel Audit

Scope: section 9, steps 1–2 of `FUNNEL_BRIEF.md`. Read-only. No pages changed.

## 0. Critical mismatch — read this before anything else

`FUNNEL_BRIEF.md` section 3 describes the "current funnel" as: long-form page,
no VSL, no opt-in form, a 5-step qualification quiz at the bottom that
collects nothing today, qualified leads sent to **Calendly**, Calendly's API
wired into the CRM.

That funnel does not exist in this repo. What's actually live at
`/10k-roadmap` is a different, already-monetized flow:

```
/10k-roadmap            Landing page WITH a VSL (app/10k-roadmap/Vsl.tsx)
  → /qualify            5-question qualifier (not a quiz collecting contact info)
  → /pay                $27 Whop "commitment deposit" checkout
  → /reserved           Typeform (deep diagnostic) — gated on payment webhook
  → cal.com              booking (lib/calcom.ts), NOT Calendly
  → /thank-you or /confirmed   confirmation + countdown + calendar links
```

- Booking runs on **cal.com** (`lib/calcom.ts`, `CALCOM_API_KEY`), not
  Calendly. `grep` for Calendly in the codebase only turns up an unrelated,
  unused OAuth connector stub in the admin "coaching intelligence" module
  (`lib/coaching-connections.ts`) — it has nothing to do with this funnel.
- There is a **$27 paid deposit** gating the deep-dive questions and the
  booking step. The brief's model (free quiz → free Calendly booking) has no
  equivalent paygate.
- Leads persist to `vsl_leads` (source `10k-roadmap-audit`) and mirror into
  `crm_contacts` via `lib/crm.ts` — not through a Calendly webhook, through
  the qualify/pay/reserve/booking API routes directly
  (`app/api/10k-roadmap/*`).
- Tracking (`app/10k-roadmap/track.ts`) fans out to GA/gtag, dataLayer,
  Vercel Analytics, and the Whop pixel. **There is no Meta Pixel, no
  Conversions API call, and no `fbp`/`fbc`/UTM capture anywhere in this
  route.** Section 7 of the brief assumes Meta Pixel + CAPI already exist and
  only need event wiring; they need to be built from zero.
- There's a separate `app/10k-roadmap/india/` variant with its own config —
  out of scope, not mentioned in the brief, left untouched either way.

**Implication:** Section 6 (P0–P3) is written against a funnel shape that
isn't what's deployed. Specific brief instructions that don't map cleanly:

| Brief instruction | Reality |
|---|---|
| "no VSL" opening state | Live page already centers a VSL (`Vsl.tsx`) |
| Quiz collects nothing today | The 5-step qualifier *is* already gating, just not collecting name/email — there's no bottom-of-page quiz, qualification happens mid-funnel after the hero |
| Qualified → Calendly | Qualified → Whop $27 paywall → Typeform → cal.com |
| Calendly API → CRM | cal.com bookings → CRM directly, no Calendly anywhere |
| "Preserve the qualify-then-Calendly flow... change only as specified" | There is no Calendly flow to preserve; P1 item 12 ("pass name/email into the Calendly URL prefill") has no target system |
| Section 7 Meta Pixel events | Zero pixel infrastructure exists; this is new build, not new wiring |

I'm building the new `/roadmap-session` route as the brief directs (P0–P3,
in order), against the **compliance and copy rules in section 4–5**, which
are the real deliverable regardless of the funnel-shape mismatch. But two
decisions need the founder's call before I build further than P0:

1. **Keep the $27 deposit + Whop + cal.com + Typeform structure** on
   `/roadmap-session` (just fix the compliance/copy problems in place), or
   **replace it with the brief's free-quiz-to-Calendly model** (strip the
   paygate, add a Calendly account/integration that doesn't currently
   exist). These are very different products — the first keeps revenue
   infrastructure intact, the second matches the brief literally but
   requires provisioning Calendly and removing the $27 deposit entirely.
2. Section 7's tracking spec (Meta Pixel + CAPI, event_id dedup, hashed
   PII) needs pixel IDs and a CAPI access token as environment variables
   that don't exist yet — these have to come from the founder before P0
   item on tracking can go beyond "event names fire into gtag/dataLayer."

Until told otherwise, my working assumption (stated plainly, flag it if
wrong) is **option 1**: keep the existing paid-deposit/cal.com architecture
on `/roadmap-session`, fix every compliance and copy violation from section
4–5 in place, and implement the section 7 tracking spec as Meta Pixel +
CAPI added on top of the existing GA/Whop tracking, using env vars I'll ask
for. I am not touching `/10k-roadmap` itself, matching the brief's "do not
touch until approved" instruction either way.

## 1. Files involved

| Path | Role |
|---|---|
| `app/10k-roadmap/page.tsx`, `Landing.tsx`, `Vsl.tsx` | Landing page + VSL |
| `app/10k-roadmap/config.ts` | ALL copy, case studies, legal text, question sets — single source of truth |
| `app/10k-roadmap/qualify/{page,Qualify}.tsx` | 5-question qualifier, routes to `/pay` or `/not-a-fit` |
| `app/10k-roadmap/pay/{page,Pay}.tsx` | $27 Whop checkout embed |
| `app/10k-roadmap/reserved/{page,Reserved}.tsx` | Post-payment Typeform (deep diagnostic), gated |
| `app/10k-roadmap/schedule/{page,Schedule}.tsx` | cal.com embed, gated |
| `app/10k-roadmap/confirmed/`, `thank-you/`, `success/` | Confirmation pages |
| `app/10k-roadmap/not-a-fit/` | Rejection page |
| `app/10k-roadmap/serverGate.ts` | Server-side paid-pass cookie gate |
| `app/10k-roadmap/track.ts` | Event dispatcher (GA/dataLayer/Vercel/Whop — no Meta) |
| `app/api/10k-roadmap/*` (reserve, status, diagnostic, slots, booking, booking-lookup, record-booking, unlock) | Funnel backend |
| `lib/roadmap-audit.ts` | Lead state machine (`audit_reserved → audit_paid → audit_booked`) |
| `lib/crm.ts` | CRM mirroring |
| `lib/calcom.ts` | Booking provider |
| `lib/whop.ts` | Payment + Whop pixel |
| `app/10k-roadmap/india/*` | Separate India variant, out of scope |

## 2. Compliance violations found in `config.ts` (section 4 of the brief)

All confirmed by direct read of `app/10k-roadmap/config.ts`. Line numbers are
from that file as of this audit.

- **L94** Headline: *"In 60 Minutes, I'll Show You How to Build a
  $10,000/Month Business in the Next 100 Days"* — dollar figure + timeframe,
  the exact banned pattern. **P0-1.**
- **L161** *"93% of clients who implement the method earn $14,000+"* —
  undocumented earnings statistic. **P0-2.**
- **L99** *"100% money-back guarantee on every dollar you invest with us"*
  and **L423-424** *"30-Day Money-Back Guarantee... email us within 30 days
  for a full refund"* — the second one is actually already close to
  compliant (plain, unconditional, written terms), but L99 in the hero ties
  the guarantee to "every dollar you invest," which reads as outcome-tied in
  context next to the $10K promise. Needs rewrite for consistency. **P0-3.**
- **L126-133** "The Path" / 3-stage graph: dollar axis and **"$14.2K vs
  $2.4K"**-style comparison lines (`axisNote` at L133 quotes result ranges
  $14,193–$180K directly on the framework graphic). **P0-4.**
- **L80** `items: ['Forbes', 'The New York Times', 'HuffPost', ...]` under
  what renders as an "As seen in" strip — no "Our clients have been featured
  in" framing anywhere nearby; reads as the brand itself being featured.
  **P0-5.**
- **Case studies (L211-223)**: every single case study carries a raw
  dollar-amount `result` field (`"$210,000 from a single launch"`,
  `"$14,193 in her first 60 days"`, etc.) with **no disclaimer placed next to
  each card** — the only disclaimer in the whole file is the single global
  `LEGAL.earnings` string (L515-516), which the audit couldn't confirm is
  rendered per-badge vs. footer-only without reading `Landing.tsx` render
  logic in full (flagged for the implementation pass). Per section 4, each
  result badge needs its own adjacent "results not typical, results vary"
  line. **P0-7.**
- Dollar figures appear throughout the qualifier revenue-range options
  (L261-291) and diagnostic questions (L309) — these are **data values in a
  dropdown/slider the user picks**, not marketing claims about outcomes, so
  they're not a section-4 violation per se, but worth the founder's eyes:
  "what would $10K/month change in your life" (L309) is borderline ("you" +
  framing around a dollar figure) and should probably be reworded to an
  output ("a predictable path to steady clients") rather than a dollar
  figure, consistent with section 5's "promise outputs, not income" rule.
- No instance of banned words (guaranteed/secret/loophole/passive
  income/effortless) or clinical/therapy language found in `config.ts`.
- No "You're over 40" / age-in-copy language found — age is handled via
  targeting only, consistent with section 4.
- "On-Camera · Paid Consultation Reviews" label (brief section 4 asks this
  renamed) — not found verbatim in `config.ts`; needs a check against
  `Landing.tsx` render strings directly in the implementation pass, flagged
  as open item.
- `LEGAL` block (L513-524) already has earnings disclaimer, Meta
  non-affiliation line, and privacy/terms/ethics links — the footer
  requirements in section 4 are largely already met structurally; the gap
  is per-badge placement, not footer absence.

## 3. Risks to booking/CRM integration if P0–P1 are implemented naively

- The booking system is **cal.com**, not Calendly. Brief P1 item 12 ("pass
  name and email into the Calendly URL as prefill") and section 7's
  "Conversions API from the Calendly webhook through the CRM" don't have a
  literal target. I'll implement the equivalent against cal.com
  (`lib/calcom.ts` already supports prefill params and a webhook path should
  exist via `app/api/10k-roadmap/booking` / `record-booking` — needs a
  closer read in the implementation pass) rather than standing up a new
  Calendly account, unless the founder says otherwise.
- The **$27 Whop deposit currently gates** the deep-diagnostic question set
  and the booking step itself (`serverGate.ts`, `/api/10k-roadmap/unlock`).
  If P1's "qualified → Calendly booking" instruction is implemented
  literally (free, no paygate), that removes the deposit revenue mechanic
  entirely — a business-model change, not a copy/compliance change. Flagging
  rather than deciding unilaterally.
- `lib/roadmap-audit.ts`'s state machine (`audit_reserved → audit_paid →
  audit_booked`) and `crm_contacts` mirroring in `lib/crm.ts` are shared
  with the India variant and the legacy standalone pages
  (`/reserved`, `/thank-you`, `/success` per the existing
  `docs/10k-roadmap-audit-funnel.md`). Building `/roadmap-session` as a
  parallel route reusing this lib code is safe as long as I don't change
  `lib/roadmap-audit.ts` / `lib/crm.ts` behavior for existing callers — new
  route, same backend functions, no breaking edits. If I need new fields
  (e.g., `fbp`/`fbc`/UTM capture on the lead), I'll add them additively
  (new optional JSONB keys), never rename/remove existing ones.
- No automated tests exist for this funnel (checked `package.json` — no
  test runner wired for `app/10k-roadmap`). I'll write a manual QA
  checklist per phase as the brief requires, plus lint/typecheck, since
  there's nothing to run as "the project's tests."

## 4. Open questions for the founder (full list maintained in `docs/open-questions.md` once P0 starts)

1. Keep Whop $27 deposit + cal.com, or replace with free quiz + Calendly, per
   section 0 above.
2. Need live Meta Pixel ID + Conversions API access token (env vars) before
   section 7 tracking can go beyond event naming.
3. Confirm the "93% / $14,000+" stat is to be deleted outright (brief says
   remove unless substantiated in writing) — audit assumes deletion.
4. Confirm testimonial/case-study consent status — brief requires written
   consent for any testimonial used in ads; none of this is verifiable from
   the repo.

## 5. Plan for P0 (pending go-ahead)

1. Create `/roadmap-session` as a route-level copy of `/10k-roadmap`
   (new `page.tsx`/`Landing.tsx`/`config.ts`/etc. under
   `app/roadmap-session/`), reusing the same lib backend with additive-only
   changes.
2. In the new route's `config.ts`: replace headline/subhead (5 ranked
   options, no $ + no deadline), delete the 93% stat, rewrite the hero
   guarantee as plain/unconditional, strip the dollar axis from "The Path",
   relabel "As seen in" → "Our clients have been featured in", add a
   disclaimer line directly under every case-study result badge.
3. Leave `/10k-roadmap` byte-for-byte untouched.
4. Manual QA checklist + before/after copy diff in `docs/changes.md` once
   implemented (not yet — P0 hasn't started).

No code has been changed. Waiting for go-ahead on section 0's architecture
question before starting P0.
