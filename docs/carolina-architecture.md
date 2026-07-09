# The5th AI Concierge — System Architecture (Part 3.0)

Planning document. **No feature code is written in this stage** — this is the
audit + proposed architecture to review before building the CMS, search, and
backend intelligence in Parts 3A+.

---

## 1. What exists today (audit)

Everything lives inside the existing Next.js app (`~/the5th-website`) and
deploys with it — no separate service.

### Frontend
- **`public/carolina.js`** (~2,200 lines) — the entire widget: launcher,
  Home, 5-tab nav, chat, article/content viewer, composer, cards, markdown
  renderer, motion, attachments. Loaded site-wide via one `<script>` (works on
  the static marketing HTML *and* the Next app). Framework-free by necessity.

### API (Next route handlers)
- `POST /api/carolina` — the conversation engine (Claude Sonnet 4.6, agentic
  tool loop: `save_lead`, `navigate_user`, `get_lead_magnet`, `get_availability`,
  `book_appointment`, `transfer_conversation`, `show_card`). Multi-agent
  (Carolina/Natasha/Benjamin) + attachments (image/PDF) + context field.
- `GET /api/carolina/config` — public widget config (avatars, greeting,
  proactive popup, agents).
- `POST /api/carolina/subscribe` — newsletter opt-in.
- `GET|PATCH /api/admin/carolina` + `POST|DELETE .../upload` — admin config,
  agent/avatar/lead-magnet uploads.

### Lib
- `lib/carolina-config.ts` — settings/agents/lead-magnet loaders.
- `lib/calcom.ts` — cal.com v2 (availability + booking).
- `lib/carolina-email.ts` — Resend confirmation email.
- `lib/supabase.ts`, `lib/rateLimit.ts`, `lib/validation.ts`, `lib/session.ts` — shared.

### Data (Supabase project `hlcvxeujqjhropiignjq`, RLS on, service-role writes)
- `carolina_leads`, `carolina_settings` (singleton, holds the sales KB),
  `carolina_lead_magnets`, `carolina_agents`.
- Storage bucket `carolina/` (avatars, agent photos, lead-magnet PDFs).

### Admin
- `/admin` → "Carolina" tab (avatar, greeting, proactive, KB, persona, lead
  magnets, team agents). ~1,000-line page component.

### Env
`ANTHROPIC_API_KEY`, `CALCOM_API_KEY` (+ aliases), `CALCOM_EVENT_TYPE_ID`,
`RESEND_API_KEY`, plus Supabase / rate-limit / session secrets.

---

## 2. Issues & risks (why refactor before Part 3A)

1. **Content is hardcoded in the widget.** `PROGRAMS`, `KB_CATS`, and the empty
   `BLOG / VIDEOS / STORIES / EVENTS / ANNOUNCEMENTS` arrays live in
   `carolina.js`. Part 3.0's central rule ("no hardcoded content, everything via
   CMS") is not yet met. This is the #1 thing to fix.
2. **`carolina.js` is a 2,200-line monolith.** Fine so far, but it mixes data,
   rendering, state, API, and motion. Needs a light internal module split before
   it grows further.
3. **Two sources of truth for content.** Programs exist both in `carolina.js`
   (widget cards + article viewer) and as static marketing pages in `/public`.
   The AI can `show_card`/`navigate`, but there is no shared content model.
4. **No search engine.** Knowledge "categories" just seed a chat; there is no
   real KB/article corpus or retrieval.
5. **AI knowledge is a single authored prompt** (`carolina_settings.knowledge_base`),
   not grounded in a content corpus → limited recommendation intelligence and a
   real (if guarded) hallucination surface as scope grows.
6. **Analytics are minimal.** First-party `track.js` + GA exist; no
   chat/content/CTA event stream tied to the funnel.

Nothing here is broken — the widget is production-quality. These are the gaps
between "great sales widget" and Part 3.0's "content + conversion platform."

---

## 3. Target architecture (service boundaries)

```
                       ┌─────────────────────────────┐
  Marketing site ─────▶│  Widget loader (carolina.js) │  (static HTML + Next)
                       └──────────────┬──────────────┘
                                      │  fetch config / content / chat
        ┌─────────────────────────────┼──────────────────────────────┐
        ▼                             ▼                               ▼
  Config API                   Content API (NEW)               Conversation API
  /api/carolina/config    /api/carolina/content/*          /api/carolina (chat)
        │                             │                               │
        │                     ┌───────┴────────┐               ┌──────┴───────┐
        ▼                     ▼                ▼               ▼              ▼
   Settings/Agents       CMS store       Search engine     AI Brain      Tools layer
   (Supabase)          (Supabase)      (pg + embeddings)  (Claude)    cal.com·Resend·
                                                          + Retrieval   leads·CRM
        └───────────────────────────── Analytics event bus ────────────────────┘
```

**Boundaries**
- **Widget** — presentation only. No hardcoded content; fetches everything.
- **Content service (CMS)** — one store, one content model, one renderer.
- **Search service** — keyword + semantic (pgvector) hybrid over CMS content.
- **AI Brain** — prompt orchestration, intent, recommendation, memory. Grounded
  by retrieval from the CMS/search.
- **Tools layer** — cal.com, Resend, lead capture, future CRM. Already exists;
  keep as isolated functions.
- **Analytics** — one event ingest endpoint; every module emits events.
- **Admin** — CRUD over the CMS + AI config. Extends the existing `/admin`.

Keep the current stack (Next + Supabase + Claude). No new frameworks.

---

## 4. Unified content model

One base table drives every content type; type-specific fields go in a JSONB
`data` column (or per-type tables that share the base). Powers one renderer.

Base fields: `id, type, slug, title, subtitle, description, cover_image,
category, tags[], author, published_at, updated_at, reading_time, featured,
status(draft|published), visibility, seo(jsonb), related[](ids), data(jsonb)`.

Types: `program, product, article, knowledge, video, case_study, faq,
testimonial, announcement, event`.

- **Programs/products** ⇒ features, price ref, guarantee, CTAs.
- **Articles/knowledge** ⇒ rich body (markdown/blocks), FAQ, related.
- **Case studies** ⇒ client, industry, metrics, quote, screenshots.
- **Videos** ⇒ provider+id, duration, transcript, summary.

Relationships via `related[]` → the AI and renderer surface "related articles /
videos / case studies / book a call" consistently.

---

## 5. AI request lifecycle (target)

```
user message (+ context: what they're viewing, +attachments)
      ▼
intent detection (buy / compare / learn / support / book / off-topic)
      ▼
retrieval: hybrid search over CMS content → top-k snippets + card refs
      ▼
prompt orchestration: system(persona+guardrails+framework) + KB + retrieved
                       context + lead profile + conversation memory
      ▼
Claude (streaming) + tools (save_lead, show_card, book_appointment, transfer…)
      ▼
response: streamed text + in-chat cards/content refs + contextual suggestions
      ▼
analytics events + progressive lead profile update (→ future CRM sync)
```

Memory: keep per-conversation profile (business, goal, revenue range, interest,
intent score) so questions aren't repeated. Today it's client-side only; move a
summary server-side keyed to the lead.

---

## 6. Proposed refactor (before Part 3A backend)

Low-risk, incremental — no visual change:

1. **Split `carolina.js` into modules** concatenated at build (or ES modules
   loaded by the loader): `tokens/motion`, `markdown`, `cards`, `content-viewer`,
   `chat`, `composer`, `home`, `api-client`, `state`. Keep the single
   `<script>` include.
2. **Move content out of the widget** into a **Content API** backed by new CMS
   tables, seeded from today's `PROGRAMS`. Widget fetches content; the AI
   `show_card`/content refs point at CMS ids.
3. **One content renderer** (already ~80% there via `renderCard` + the article
   viewer) — extend to all types, driven by the content model.
4. **Analytics event endpoint** `POST /api/carolina/event` + a thin
   `track(event, props)` in the widget; store to a `carolina_events` table.
5. Leave chat/tools/cal.com/email as-is — they're already clean boundaries.

---

## 7. Suggested build order (Parts 3A+)

1. **CMS foundation** — content tables + Content API + admin CRUD + seed
   Programs. (Unblocks everything; removes hardcoded content.)
2. **Content renderer + viewers** — article/case-study/video viewers in-chat,
   all from the model. Wire `show_card`/content refs to open them internally.
3. **Search** — keyword first, then pgvector semantic + hybrid ranking; power
   the Knowledge tab and AI retrieval.
4. **AI grounding** — retrieval-augmented prompts + intent + recommendation
   reasons + server-side lead memory.
5. **Analytics + admin dashboards** — event stream → funnel metrics.
6. **CRM sync** (Attio/HubSpot) — isolated adapter over the lead profile.

Each is shippable independently and preserves the current UX.

---

## 8. Non-functional targets
- First paint of widget < 2s; chat opens instantly (already true — inline JS).
- Lazy-load media + content; cache CMS responses; prefetch likely content.
- Security: keep rate-limiting, input sanitisation, prompt-injection guards
  (untrusted-content boundaries for retrieved text + uploaded files), service-
  role-only DB writes, secrets in env, admin behind the existing OTP session.

---

## 9. Decisions — LOCKED (approved for Part 3A)
- ✅ **CMS-first** build order approved.
- ✅ **CMS v1 scope: the full content set** — programs, products, articles,
  knowledge, videos, case studies, FAQs, testimonials, announcements, events.
- ✅ **Search: semantic from day one** — pgvector embeddings + hybrid
  (keyword + vector) ranking. Needs an embedding pipeline (Anthropic/OpenAI or
  Supabase edge) + `content_embeddings` (vector) column/table.
- ✅ **Refactor `carolina.js` into modules right before Part 3A**, concatenated
  into the single site-wide script (no visual change, no new framework).
- ↪ **CRM**: default to **Attio** (already connected) via an isolated adapter;
  confirm at the CRM step.

### Part 3A execution plan (concrete)
1. **Refactor** `public/carolina.js` → `public/carolina/*.js` modules
   (state, tokens+motion, markdown, cards, content-viewer, home, chat, composer,
   api-client) built/concatenated into `public/carolina.js`. Behaviour-identical.
2. **CMS schema** (Supabase): `cms_content` (base model + JSONB `data`),
   `cms_categories`, `cms_tags`, `cms_relations`, `content_embeddings` (pgvector).
   Enable the `vector` extension.
3. **Content API**: `GET /api/carolina/content` (list/filter),
   `GET /api/carolina/content/[slug]`, `GET /api/carolina/search` (hybrid).
4. **Admin CRUD**: extend `/admin` with a Content manager (create/edit/publish
   each type, media upload, relations) — reuse the existing OTP-gated admin.
5. **Embedding pipeline**: on publish, embed title+description+body → upsert to
   `content_embeddings`.
6. **Seed** from today's hardcoded `PROGRAMS`; widget switches to fetching
   content from the Content API (removes hardcoded arrays).
7. **AI grounding**: retrieval step in `/api/carolina` injects top-k content
   into the prompt; `show_card`/content refs point at CMS ids.
