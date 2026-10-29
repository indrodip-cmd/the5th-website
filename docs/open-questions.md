# Open questions for the founder — `/roadmap-session`

Everything below is either a `TODO(founder)` left in the code/copy, a
decision I made by default that's easy to reverse, or something that needs
founder-only information (consent, DNS, credentials) before it can be
finished. Nothing here blocks the funnel from running; each item names what
happens if it's left as-is.

## Consent — blocks ad use, not page display

1. **Every case study and testimonial on `/roadmap-session` is tagged
   `consent: 'unknown'`** in `app/roadmap-session/content.ts` (`FEATURED_CASES`,
   `MORE_CASES`, `THANKYOU.testimonials`). They're kept on the page (names,
   results and quotes are unchanged from what's already live on
   `the5thglobal.consulting`), but per section 4 of the brief, using any of
   them **in a paid ad** needs written client consent first. `ads/ad-copy.md`
   concept #6 (the video-testimonial-cut angle) and all 3 testimonial cut
   notes are marked "pending consent" and should not go live until that's
   confirmed per clip.
2. Torill's case study photo is intentionally omitted (carried over from
   `/10k-roadmap/config.ts`) — no consent on file for her image either.

## Needs founder-supplied values (no secrets committed)

3. **Meta Pixel + Conversions API.** Set these env vars for section 7's
   tracking to do more than fire into GA/dataLayer:
   - `NEXT_PUBLIC_META_PIXEL_ID`
   - `META_CAPI_ACCESS_TOKEN`
   - `META_TEST_EVENT_CODE` (for verifying events in Meta Test Events before
     removing it)
   Until these are set, `lib/meta-capi.ts` and the client pixel script in
   `app/roadmap-session/layout.tsx` no-op — nothing breaks, but no ad
   platform ever sees a conversion.
4. **Pre-call video.** `app/roadmap-session/thank-you/ThankYou.tsx` renders
   a placeholder card (`THANKYOU.preCallVideo`) asking for a 2–3 minute
   video from Indrodip. No video exists yet; nothing was invented.
5. **cal.com event type.** `/roadmap-session/schedule` points at the same
   public cal.com link as `/10k-roadmap` (`NEXT_PUBLIC_AUDIT_CAL_URL`, or the
   new `NEXT_PUBLIC_RS_CAL_URL` if you want this funnel on a separate event
   type for cleaner attribution/availability). Confirm whether that's
   intentional or whether `/roadmap-session` should get its own cal.com
   event type.

## Sending the copy I wrote (reminders + nurture)

6. **Reminder sequence** (`REMINDERS` in `content.ts`): instant
   confirmation, 24-hour, 2-hour, and a personal day-before note, all
   written in Indrodip's voice per the brief. The booking confirmation email
   *is* wired and sends today (`app/api/roadmap-session/record-booking`,
   via Resend). The 24h/2h/day-before sends are **copy only** — triggering
   them on a schedule needs either cal.com's own reminder settings or a
   cron job wired through `lib/comm/*`/`app/api/cron/*`, which is
   infrastructure, not funnel copy, and wasn't built here.
7. **Not-yet-qualified nurture** (`NURTURE` in `content.ts`, 3 emails).
   `lib/roadmap-session.ts`'s `enterNurture()` tags the contact
   (`roadmap-session-nurture`) and logs it so the CRM shows who's in the
   sequence, but actually sending these 3 emails on a day-0/3/7 schedule
   needs the same comms-engine wiring as #6.

## Domain / brand consistency (flagged, not changed)

8. **Outbound email FROM address.** `lib/roadmap-session.ts` and
   `app/api/roadmap-session/record-booking/route.ts` send from
   `indrodip@10kroadmap.org`, copied from the existing, already-verified
   pattern in `lib/roadmap-audit.ts`. The brief asks for
   `the5thglobal.consulting` consistently (and I did use
   `support@the5thglobal.consulting` everywhere in on-page copy/HELP), but I
   did **not** change the email FROM domain, because I can't verify from the
   repo whether `the5thglobal.consulting` is a Resend-verified sending
   domain. If it is, switching the FROM address is a one-line change in both
   files; if it isn't, switching it would silently break every transactional
   email (confirmations, admin alerts) for this and the existing audit
   funnel. Please confirm which domain's DNS (SPF/DKIM) is verified in
   Resend before this changes.

## Logic decisions I made to keep moving (easy to revisit)

9. **Quiz step 5 verdict.** "Yes" and "Need to discuss" both route to
   booking (qualified); only "No" routes to not-a-fit
   (`app/api/roadmap-session/verdict/route.ts`). The brief names the three
   options but doesn't say how "Need to discuss" should route — I treated it
   as still worth a call, since the whole session is free and low-friction.
   If you want "Need to discuss" to go to the nurture track instead, it's a
   one-line change in that route.
10. **Step 1 ("not currently running a business") is no longer an instant
    reject.** On `/10k-roadmap`, that answer ends the quiz immediately. On
    `/roadmap-session` it's informational — only step 5 determines the
    verdict. This matches the brief's literal "qualified/unqualified" gate
    being the step-5 investment question, but it is a real behavior change
    from the existing funnel's qualification logic. Flagging it explicitly
    in case that's not the intent.

## Performance measurement caveat

11. **Lighthouse numbers in `docs/changes.md` were run inside this
    sandboxed build container**, not against a deployed URL. The LCP metric
    in particular resolved to the site's global cookie-consent banner
    (`t5cc-panel`, injected by the root layout, unrelated to this route) and
    the simulated-throttling model disagreed sharply with the observed
    trace — both signs the absolute LCP number here isn't trustworthy.
    The byte-weight numbers (total page weight, image weight) are real and
    directly comparable before/after, since they come from actual network
    request sizes, not the throttling simulation. **Recommend re-running
    PageSpeed Insights or Lighthouse against the live deployed
    `/roadmap-session` URL** once it's shipped, for a trustworthy LCP number.
