# Command AI — Architecture Review & Build Strategy (Part 3I.3.5)

**Analysis only. No code changed in either repo.** Prepared 2026-07-10.

Purpose: audit the existing public AI (`the5th-platform`) so the new internal
**Command AI** (Chief of Staff, `/admin/ai` in `the5th-website`) **extends** the
AI foundation instead of duplicating it — one AI platform, multiple experiences.

---

## 0. The two repos + the unifying fact

| | `the5th-website` (this repo) | `the5th-platform` (GitHub: indrodip-cmd/the5th-platform) |
|---|---|---|
| Role | Marketing site + **Carolina** public concierge + the **CRM/Command Center** (3I.1–3I.5) | Public **member** AI product (coaching AI "the5th" + "Vega" design AI), Founder HQ |
| AI | `app/api/carolina/route.ts` (tool-loop, Sonnet), `lib/ai-coach.ts` (admin coach), vector RAG over CMS (`cms_chunks`), `lib/ai-usage.ts`, `lib/cost-guard.ts` | `app/api/chat/route.ts` (streaming, `MODELS` map), authored-brain + golden-answers, `user_ai_memory`, call-intelligence |
| Provider | Anthropic only | Anthropic only |

**★ Both deploy separately but share ONE Supabase project (`hlcvxeujqjhropiignjq`).**
Every table is reachable from either app with the service-role key. This is the
key architectural leverage: **Command AI does not need to call `the5th-platform`
— it reads the same database directly.**

---

## 1. `the5th-platform` AI architecture (audit)

- **Provider / models:** `@anthropic-ai/sdk` only. A `MODELS` map (`the5th`, `vega` → both `claude-sonnet-4-6`) selects a persona/model by key. Cheap Haiku (`claude-haiku-4-5`) for extraction + self-monitor. **No provider abstraction, no OpenAI/Gemini, no fallback.**
- **Entry point:** `app/api/chat/route.ts` (613 lines). Streams via `anthropic.messages.stream`. Two flows: coaching ("the5th") and Vega (design/PDF/ebook). A pre-pass Haiku "extraction" builds context.
- **Prompt orchestration:** system prompt = **compiled brain** (`ai_prompt_versions`, `is_active`) + **golden answers** (retrieved by keyword/topic overlap, `relevantGolden`) + **project instructions** (`ai_projects.system_prompt`) + **`user_ai_memory`** (long-term, upserted per user).
- **Knowledge (RAG):** *not vector*. Authored brain compiled from `ai_training_data` via `lib/training.ts::rebuildBrain` (writes a new active `ai_prompt_versions`), plus golden-answer keyword retrieval. (Vector/embeddings live only in `the5th-website`: `cms_chunks`, `content_embeddings`, `lib/embeddings.ts`, `lib/retrieval.ts`.)
- **Memory:** `ai_conversations` + `ai_messages` (history), `ai_projects` (project chats), `user_ai_memory` (long-term).
- **Meeting intelligence:** `app/api/sync-call-intelligence` — Fathom transcript → Haiku extraction per `call_type` (discovery / 1on1 / group / strategy) → `call_intelligence` (summary, `action_items`, `training_context`) → also feeds `ai_training_data` (brain learns from real calls). `fathom-sync`, `zoom-*`, `coaching_calls` (312 rows), `call_intelligence` (158 rows).
- **Quality loop:** after each reply, a Haiku pass checks it doesn't contradict golden answers → auto-writes `answer_flags`.
- **Infra:** `lib/credits.ts` (per-member AI credits), `lib/rateLimit.ts`, `lib/apiGuard.ts` (`withApiGuard`, `sanitizeString/UUID`, security headers, session auth). Voice: `eva-call` + `elevenlabs-tts`. `parse-document`. HQ: `hq-brief`/`hq-dashboard`/`hq/overview`.
- **Data owned by the platform (shared DB):** `members`, `coaching_calls`, `call_intelligence`, `ai_conversations`, `ai_messages`, `ai_projects`, `ai_prompt_versions`, `ai_training_data`, `prompt_library` (200), `golden_answers`, `user_ai_memory`, `memberships`, `monthly_goals`, `daily_checkins`, `roadmap_*`, `client_*`, `platform_courses`, `hq_outputs`.

**Strengths:** clean prompt-brain compilation, golden-answer correction loop, real call-intelligence extraction, streaming, credits/guards.
**Gaps for an executive AI:** single provider (no router/fallback), keyword-only retrieval (no semantic search over calls/CRM), no cross-business tool layer, no admin/exec surface, no per-request cost telemetry (the website has this now).

---

## 2. What `the5th-website` already provides (reuse directly — same repo)

- **Grounded tool-loop:** `lib/ai-coach.ts` — `coachChat()` already does an Anthropic tool-loop over CRM (`search_contacts`, `get_contact`, `hot_leads`, `pipeline_summary`) with a strict "cite data / never fabricate" system prompt. **Command AI is a superset of this.**
- **Vector RAG:** `lib/retrieval.ts` + `lib/embeddings.ts` + `cms_chunks` (semantic search over CMS/knowledge).
- **Telemetry + guardrails:** `lib/ai-usage.ts` (`logAiEvent`, cost), `lib/cost-guard.ts`, `lib/system-log.ts`.
- **Business data libs:** `lib/crm.ts`, `lib/sales.ts`, `lib/meetings.ts` (incl. Fathom transcript/summary on `crm_meetings`), `lib/revenue.ts`, `lib/content-attribution.ts`, `lib/connectors/whop.ts`.
- **UI:** shared shell `components/admin/*`, and `components/admin/CoachChat.tsx` (a working grounded chat drawer) as the seed for the `/admin/ai` full page.
- **Auth:** `adminEmail(req)` (OTP session) — admin-gated already.

---

## 3. Recommended: one Shared AI Core (in `the5th-website`)

Command AI lives in **`the5th-website`** (where the admin/CRM already is) and consumes the shared DB. Extract a small **AI core** both the website's AIs use:

```
                         Shared AI Core (lib/ai/)
  model-router  · tool-registry · rag · memory · logging(ai_usage) · guards
        │                    │                     │
   Carolina (public)   Command AI (admin)    future agents
```

- **Model router (`lib/ai/router.ts`)** — the one genuine new abstraction: `complete({ task, messages, tools, stream })` picks a provider+model per task from config (default Anthropic Sonnet/Haiku; pluggable Gemini/OpenAI later) with fallback. Replaces today's hardcoded model strings. Keep it thin.
- **Tool registry (`lib/ai/tools.ts`)** — modular, permission-checked, read-only tools returning only authorized data: `search_crm`, `get_contact_360`, `revenue_metrics`, `pipeline_stats`, `search_meetings` (crm_meetings + `call_intelligence` + `coaching_calls`), `get_transcript`, `search_cms` (vector via `lib/retrieval`), `knowledge_base` (`golden_answers` + `ai_prompt_versions`), `list_tasks`, `dashboard_metrics`, `whop_members/products`. Carolina's tools become a public subset of the same registry.
- **RAG** — reuse `lib/retrieval.ts`; extend the corpus to index `call_intelligence`/transcripts so Command AI can *semantically* recall meetings (the platform can't do this today).
- **Memory** — reuse `ai_conversations`/`ai_messages` (+ `user_ai_memory`) for Command AI threads.
- **Logging/guards** — reuse `lib/ai-usage.ts` + `lib/cost-guard.ts` unchanged.

**Shared vs isolated:** SHARE the DB, RAG, telemetry, guards, design system, and (new) model-router + tool-registry. KEEP ISOLATED: the public persona/prompt-brain (customer voice) vs the admin Chief-of-Staff persona (privileged, blunt, exec-focused), and permissions (admin-only tools never exposed to Carolina).

---

## 4. Command AI build plan (next phase — not this task)

1. **`lib/ai/` core**: model-router + tool-registry (wrap existing CRM/revenue/meeting/RAG libs) + a `commandChat()` streaming tool-loop (extends `lib/ai-coach.coachChat`).
2. **Route + UI**: `/admin/ai` full-page ChatGPT-style streaming chat (evolve `CoachChat.tsx`), threads persisted in `ai_conversations`, sidebar item "🤖 Command AI".
3. **Briefings**: `dailyBriefing()` (revenue/sales/meetings/tasks/bookings/AI-usage/alerts) → a `/admin` widget + `/admin/ai` command; **pre-meeting brief** and **post-meeting intelligence** built from `crm_meetings` Fathom data + `call_intelligence` (reuse the platform's extraction shape).
4. **Model providers**: Anthropic now; router ready for Gemini/OpenAI (Experiment Lab).
5. **Security**: every tool enforces `adminEmail` + role; never expose prompts/secrets; grounded/no-fabrication; log to `ai_events`.

**Effort:** moderate — most data libs + a grounded tool-loop + RAG + telemetry already exist; the new work is the router, the expanded tool registry, the streaming `/admin/ai` UI, and the briefing generators. No rewrite of either AI.

**Risks:** (a) cross-repo drift — mitigate by treating the shared **DB schema** as the contract, not shared code; (b) semantic search over transcripts needs an embedding/index step (cost) — start keyword+recent, add vectors incrementally; (c) permissions — enforce in each tool, not the prompt.

---

## 5. Bottom line
Do **not** fork the platform AI. Build Command AI in `the5th-website` on a thin shared AI core (model-router + tool-registry + existing RAG/telemetry/guards), reading the **one shared Supabase DB** for both website (CRM/revenue/meetings/CMS) and platform (coaching calls/call-intelligence/brain). That yields a single grounded executive AI — "what happened with Sarah, what objections, what did I promise, what next?" answered from Fathom + CRM + tasks + notes + knowledge — without duplicating infrastructure.
