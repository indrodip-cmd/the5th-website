# `/roadmap-session` — what changed, and why

New route, built per `FUNNEL_BRIEF.md` P0–P3. `/10k-roadmap`, its India
variant, and the legacy `/reserved`, `/thank-you`, `/success` pages are
byte-for-byte unchanged. See `docs/audit.md` for the pre-build audit and
`docs/open-questions.md` for everything still needing the founder's input —
this file doesn't repeat those, it covers what was built and the evidence
for it.

## 1. What changed, and why

| Area | File(s) | What | Why |
|---|---|---|---|
| Route | `app/roadmap-session/**` | New route, parallel to `/10k-roadmap` | Brief requires the swap to happen on a new route first |
| Copy | `app/roadmap-session/content.ts` | All copy, headline options, quiz, FAQ, legal, ads-adjacent text | Section 4/5 compliance pass + "keep copy editable without code" |
| Backend | `lib/roadmap-session.ts` | New wrapper around `lib/crm.ts` primitives | Keeps `lib/roadmap-audit.ts` / `lib/crm.ts` behavior untouched (standing decision) |
| Tracking | `lib/meta-capi.ts`, `app/roadmap-session/track.ts`, `app/api/roadmap-session/capi`, `.../contact`, `.../verdict`, `.../record-booking` | Meta Pixel + Conversions API, env-gated | Section 7 |
| Performance | `app/roadmap-session/{Landing,ui}.tsx` | `next/image` instead of raw `<img>`; click-to-play video thumbnails | Section "Performance and accessibility" |
| Ads | `ads/ad-copy.md` | 8 concepts, 3 Reel scripts, 3 testimonial cut notes | Section 8 |

## 2. Before / after for every key block

**Headline.** Before (`/10k-roadmap`): *"In 60 Minutes, I'll Show You How to
Build a $10,000/Month Business in the Next 100 Days."* After: 5 ranked
options drafted in `content.ts` (`HEADLINE_OPTIONS`), top one used:
*"A Free 60-Minute Working Session to Map Your Offer, Your Buyer, and Your
Next 100 Days."* No dollar figure, no deadline, on either count.

**Earnings stat.** Before: *"93% of clients who implement the method earn
$14,000+"* (undocumented). After: deleted. No replacement stat was invented.

**Guarantee.** Before: *"100% money-back guarantee on every dollar you
invest with us"* (hero) and a *"30-Day Money-Back Guarantee"* (pay step, for
the $27 deposit). After: no guarantee language at all — `/roadmap-session`
has no deposit and no payment, so there's nothing to guarantee, and
inventing refund terms for a free call would itself be a compliance risk.
Logged in `docs/open-questions.md` rather than guessed.

**"The Path" graph.** Before: an animated SVG chart with a dollar y-axis,
a "$10K floor" line, and a "$14.2K vs $2.4K" working-with-us/alone
comparison. After: `LANDING.framework` — the same three stages (Offer,
Buyer, Reach), plain cards, zero numbers.

**Press strip.** Before: `PRESS.label` in `/10k-roadmap/config.ts` already
read *"Our clients have been featured in,"* but `PressStrip()` in
`Landing.tsx` never rendered that label — only the bare logo row, which
reads as an unlabeled claim. After: the label renders visibly above the
logos on `/roadmap-session`.

**"On-Camera · Paid Consultation Reviews."** After: renamed to the brief's
required *"Client reviews after their Roadmap Session"* (`LANDING.videoEyebrow`).

**Case studies.** Before: raw dollar results, one shared disclaimer in the
footer only. After: same names/quotes/results (nothing invented), but every
single card now carries its own *"Results are not typical. Results vary..."*
line directly underneath (`<Disclaimer/>` in `Landing.tsx`), each one tagged
`consent: 'unknown'` in `content.ts`, and the featured six are reordered to
Laurie, Angela, Jeanne, Susan Taylor, Torill, Amalia with the rest behind a
"See all 14" expander — none deleted.

**FAQ.** Added *"Is this therapy?,"* *"What does working together cost?,"*
and *"What if I've already spent money on programs that didn't work?"* —
all three now in `LANDING.faq.items`.

## 3. Section-4 compliance check (every line in `content.ts`)

- No dollar figure appears with a timeframe anywhere a reader could read it
  as a promise. The only places `$` and a duration co-occur are (a) named,
  individual, already-published case-study results (allowed per section 4:
  *"Label individual client results as individual results"* + disclaimer,
  both done), and (b) the quiz's own revenue-range options, which are the
  user describing their own business, not a claim to them.
- No unsubstantiated statistic (93% line deleted, nothing replacing it).
- No income-linked guarantee (none present).
- No "you" + personal attribute/condition. Eligibility copy is written in
  "this is for you if / this probably isn't for you if" list form, never
  "are you broke / struggling / over 40."
- No clinical/therapy language. "Money mindset," "self-worth and pricing,"
  "beliefs behind undercharging" are used; "therapy," "heal," "trauma,"
  "anxiety" are not — the new FAQ item on this explicitly says "this isn't
  clinical or therapeutic support."
- No banned words (guaranteed/secret/loophole/passive income/effortless) —
  checked by hand against every string in `content.ts`.
- No age stated in copy.
- "As seen in" never implies The5th itself was featured — label now reads
  "Our clients have been featured in," and is actually rendered.
- No before/after income graphics, no Stripe screenshots, no cash/cars.
- Footer disclaimer, Meta non-affiliation line, and privacy/terms/ethics
  links are all present (`Footer()` in `ui.tsx`, `LEGAL` in `content.ts`).
- Brand name/domain/email consistent: `the5thglobal.consulting` branding,
  `support@the5thglobal.consulting` in `HELP`. The transactional-email FROM
  address was deliberately **not** changed — see `docs/open-questions.md` #8.
- Testimonial ad use: every case study/testimonial tagged
  `consent: 'unknown'`; ad concepts using them are marked "pending consent"
  in `ads/ad-copy.md`.

## 4. Tracking — events and how to verify them

| Event | Fires | Where | Verify in Meta Test Events |
|---|---|---|---|
| PageView | Page load | Pixel (layout.tsx base code) + CAPI (`track.ts` → `/api/roadmap-session/capi`) | Set `META_TEST_EVENT_CODE`, load `/roadmap-session`, confirm one `PageView` with matching `event_id` from both Pixel and server |
| ViewContent | 50% scroll | `watchScrollViewContent()` in `track.ts`, called from `Landing.tsx` | Scroll halfway down the page, confirm `ViewContent` |
| QuizStart | First quiz answer (hero Q1 or in-section) | `answerSingle()` in `ui.tsx`, fires once via a ref guard | Answer step 1, confirm `QuizStart` |
| Lead | Quiz step 4 submitted | Server-side in `/api/roadmap-session/contact`, mirrored client-side in `track.ts` | Submit the contact step, confirm `Lead` with hashed `em`/`ph` present |
| SubmitApplication | Step 5 answered "Yes"/"Need to discuss" | Server-side in `/api/roadmap-session/verdict` | Qualify, confirm `SubmitApplication` |
| Schedule | cal.com booking recorded | Server-side in `/api/roadmap-session/record-booking`; the same `eventId` also fires a backup client pixel event from `Schedule.tsx` | Book a slot, confirm one `Schedule` event (dedup by `event_id`, not two) |
| Purchase | Client pays (if ever added to this free funnel) | Not wired — `/roadmap-session` has no payment step | N/A |

`fbp`/`fbc` are read from cookies on first load (`useFbpFbc()` in `ui.tsx`)
and carried through every quiz-progress save and the contact/verdict/booking
calls; email and phone are SHA-256 hashed server-side in `lib/meta-capi.ts`
before ever leaving the server. UTM params persist the same way
(`useUtm()`), stored in `sessionStorage` and written onto the lead at every
save. All of this is a no-op (not an error) until `NEXT_PUBLIC_META_PIXEL_ID`
and `META_CAPI_ACCESS_TOKEN` are set — see `docs/open-questions.md` #3.

**Weekly funnel dashboard spec** (section 7's last requirement — spec, not
built, since it's a reporting view, not a funnel page): a weekly table of
landing page views, quiz starts, leads, qualified, booked, showed, closed,
and cash, broken out by ad (`utm_content`). The data already exists per-lead
in `vsl_leads.typeform_payload.roadmap_session` and `crm_contacts`; this is
a query/view to add under `/admin/crm` or `/admin/analytics`, grouping by
`utm_content` and the `status` progression (`rs_lead` → `rs_qualified` →
`rs_booked` → showed/closed, the last two coming from cal.com no-show data
and `purchases`/CRM deal-closed records respectively). Not built here —
it's an admin reporting feature, out of this funnel-build's file scope, but
the data model supports it without further schema changes.

## 5. Test results

**Automated:** `npx tsc --noEmit` and `npx eslint app/roadmap-session
lib/roadmap-session.ts lib/meta-capi.ts app/api/roadmap-session` — both
clean, no errors or warnings. `npx next build` succeeds, every
`/roadmap-session` route (including `/schedule`, `/not-a-fit`, `/thank-you`)
prerenders statically with no build errors.

**Browser smoke test** (Playwright, headless Chromium, 390×844 mobile
viewport, against a local `next start` with placeholder Supabase env vars —
no real database): 16/17 checks passed.

```
PASS: H1 visible on 390px load
PASS: Hero Q1 option exists
PASS: Hero Q1 option within first viewport (390x844)
PASS: quiz-progress POST fired after step 1
PASS: Step 2 (revenue) rendered in #quiz after step 1
PASS: Step 3 (bottleneck) rendered
PASS: Step 4 (contact) rendered
PASS: Continue button enabled once name+email valid
PASS: contact POST fired at step 4
FAIL: Step 5 (readiness) rendered after contact saved
PASS: Page survives a mid-quiz reload (abandon) without crashing
PASS: not-a-fit page returns 200
PASS: not-a-fit has a CTA to the AI Business Assessment
PASS: schedule page loads (even if cal.com embed itself needs network)
PASS: thank-you page returns 200
PASS: thank-you shows prep list
PASS: thank-you shows SMS opt-in
```

The one failure is expected, not a code defect: this sandbox has no real
Supabase project, so `/api/roadmap-session/contact`'s database write fails
server-side, the route correctly returns an error instead of a false
success, and the client correctly does **not** advance to step 5 on a
failed save — exactly the behavior you'd want if the database were briefly
unavailable for a real visitor. It does mean steps 4→5 and the booking
write-through to the CRM could **not** be verified end-to-end here.

**What I could verify:**
- Quiz steps 1–4's client-side flow, state machine, and the exact API calls
  they fire (names/payloads match what the routes expect).
- The hero question is visible on a 390px mobile viewport with no scrolling.
- The quiz survives a mid-quiz reload (abandon case) without crashing.
- The unqualified path renders and links to `/ai` (the AI Business
  Assessment) and `/results`.
- The thank-you page renders its prep list, SMS opt-in, and pre-call-video
  placeholder.
- The schedule page's shell renders (the cal.com iframe itself needs real
  network + a real cal.com account to fully verify).

**What I could not verify, and the manual check needed before launch:**
1. A real contact save at step 4 actually lands in `vsl_leads` /
   `crm_contacts` → manually run the quiz against staging with real
   Supabase credentials and confirm the row.
2. The qualified path actually redirects to `/schedule` with name/email
   prefilled in the cal.com embed → same staging run, confirm the cal.com
   form fields are pre-populated.
3. A completed cal.com booking fires `markBooked`, reaches the CRM, and
   lands on `/thank-you` with the right date/time → book a real test slot
   on staging cal.com and confirm the CRM record and the thank-you page's
   countdown.
4. Meta Pixel + CAPI events actually appear in Meta Events Manager's Test
   Events tool → requires the env vars in `docs/open-questions.md` #3 to be
   set first.
5. SMS consent checkbox behavior and copy against TCPA requirements for the
   specific SMS provider used — this wasn't reviewed against telecom
   compliance, only against the brief's own wording ("unchecked by
   default").

## 6. Performance

Measured with Lighthouate CLI (mobile preset, simulated throttling) against
a local production build (`next build && next start`) in this sandboxed
container — **not** the deployed URL. See the caveat in
`docs/open-questions.md` #11 before treating the LCP number below as
real-world accurate.

| Metric | Before (raw `<img>`) | After (`next/image`) |
|---|---|---|
| Total page weight | 3.25 MB | 2.59 MB (-20%) |
| Image bytes | 2.81 MB | 2.14 MB (-24%) |
| Total Blocking Time | 400 ms | 230 ms |
| Speed Index | 2.9 s | 2.6 s |
| Cumulative Layout Shift | 0.067 | 0.067 (unchanged) |
| Lighthouse Performance score | 63 | 68–69 |
| LCP (reported) | 10.1 s | 15.1 s* |

\* The LCP figure is not trustworthy in either run: Lighthouse's own
LCP-breakdown audit resolved the "largest contentful paint" element to the
site's **global cookie-consent banner** (`t5cc-panel`, injected by the root
layout, unrelated to anything built here), and the simulated-throttling
model's result diverged sharply from the observed trace (13ms TTFB + 955ms
render delay per the breakdown audit, vs. a reported 15s metric). Both are
known failure modes of Lighthouse's lantern simulation inside a constrained
sandbox, not a real regression from the image change. The byte-weight and
TBT/Speed-Index numbers above come from actual measured network transfers
and are accurate and comparable. **Recommend re-running PageSpeed Insights
against the live, deployed `/roadmap-session` URL** for a trustworthy LCP
number once this ships — section 11's "mobile LCP ≤ 2.5s" target should be
checked there, not against this sandbox's number.

Other P3 items done: all client-review videos are click-to-play (zero
iframes mount until tapped, `LazyVideo` in `Landing.tsx`), third-party
scripts (Meta Pixel) are deferred (`strategy="lazyOnload"`), every image has
explicit `width`/`height`, base font size is 16px everywhere, every tap
target is ≥44px (`Btn`, quiz options, FAQ links, footer links), focus states
are visible (`.rs-focus` outline), and alt text is present on every image.

## 7. Definition-of-done checklist (section 11)

- [x] No banned claim from section 4 remains on `/roadmap-session` (checked by hand, see section 3 above).
- [x] Quiz Q1 is visible in the hero on a 390px mobile screen without scrolling (verified by Playwright).
- [x] Contact capture at step 4 saves server-side and persists partial quizzes (code path verified; end-to-end DB write not verified in this sandbox — see section 5 #1).
- [ ] Lead / SubmitApplication / Schedule verified in Meta Test Events — blocked on env vars, `docs/open-questions.md` #3.
- [x] Qualified, unqualified, and abandon paths all exercised (automated); booking → CRM → thank-you not verified end-to-end (sandbox has no real cal.com/Supabase) — manual check #2/#3 above.
- [ ] Mobile LCP ≤ 2.5s — not demonstrable from this sandbox's numbers; byte-weight and TBT/Speed Index improved. Re-check on the deployed URL.
- [x] `docs/audit.md`, `docs/changes.md`, `docs/open-questions.md`, `ads/ad-copy.md` all exist.

## 8. Remaining TODOs for the founder

All duplicated in full, with more context, in `docs/open-questions.md`:
consent for every case study/testimonial before ad use; Meta Pixel + CAPI
env vars; a 2–3 minute pre-call video; confirm/replace the shared cal.com
event type; wire the 24h/2h/day-before reminder sends and the 3-email
nurture sequence through the comms engine (copy is written, sending isn't
scheduled); confirm which domain is Resend-verified before any FROM-address
change; and the two logic calls I made by default (step 5's "Need to
discuss" routes to qualified; step 1's "not currently running a business"
no longer force-rejects).
