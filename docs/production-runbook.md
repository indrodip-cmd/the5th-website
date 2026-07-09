# The5th AI Platform — Production Runbook (Part 3H)

Operational readiness for the concierge platform (CMS, Knowledge Engine, AI
Brain, Content Viewer, CRM, Booking, Admin, Automation). This documents the
hardening shipped in code and the ops procedures that live outside the app.

## 1. Shipped in code (Part 3H)
- **Health check**: `GET /api/health` → `{ ok, checks: { database, anthropic, calcom, resend, embeddings } }`, 200 healthy / 503 degraded. Point uptime monitoring here.
- **Rate limiting** (Upstash): chat 40/10m, booking 8/10m, availability 30/5m, subscribe 10/10m, public content 120/min — all per-IP. Admin routes are session-gated.
- **Prompt-injection defense**: system prompt treats all user messages, uploaded files, and retrieved content as untrusted DATA; refuses role changes, prompt/tool disclosure, and admin/unpublished access. Retrieval only ever queries `status='published'` + `visibility='public'`.
- **Feature flags** (kill switches, no redeploy): `attachments`, `booking`, `proactive`, `automation` — admin → Carolina → Feature Flags; served to the widget via `/api/carolina/config`.
- **GDPR erasure**: admin → CRM → contact → 🗑 deletes the contact + activities + notes + tasks + session.
- **Security headers**: HSTS(preload), X-Frame-Options SAMEORIGIN, X-Content-Type-Options nosniff, Referrer-Policy, Permissions-Policy, X-Permitted-Cross-Domain-Policies none; `/api/*` is `no-store`.
- **Input handling**: `sanitizeText` (control-char strip + length clamp) on every free-text field before it reaches DB or LLM; file uploads validated by type/size (images + PDF, ≤7MB, ≤5).
- **DB writes** use the service-role key server-side only; RLS is enabled on every table (no public policies) so the anon key can't read/write directly.

## 2. Environments
Recommend three Vercel projects / Git branches sharing this repo:
- **Development** (local + preview deploys), **Staging**, **Production**.
- Each needs its **own Supabase project** and its **own** env vars — never share production secrets. Preview deployments should point at staging Supabase, not prod.

## 3. Secrets / env vars (Vercel, never in the client)
`ANTHROPIC_API_KEY`, `CALCOM_API_KEY` (+ `CALCOM_EVENT_TYPE_ID` optional),
`RESEND_API_KEY`, `OPENAI_API_KEY` (for semantic embeddings — optional; keyword
search works without it), `NEXT_PUBLIC_SUPABASE_URL`,
`SUPABASE_SERVICE_ROLE_KEY`, `SESSION_SECRET`, `UPSTASH_REDIS_REST_URL/TOKEN`,
`CRON_SECRET`, `ADMIN_EMAILS`.

## 4. Auth / access
- Admin is OTP-gated (2 founder emails) with an httpOnly, Secure, SameSite=Lax,
  HMAC-signed session cookie (12h). All `/api/admin/*` check `adminEmail()`.
- **Deferred (recommended before team growth)**: granular RBAC (super-admin /
  sales / coach / editor / read-only), MFA, session revocation, device list.

## 5. Backups & disaster recovery
- **Database**: Supabase provides automated daily backups (PITR on paid tiers).
  Verify the schedule in the Supabase dashboard and **test a restore** into a
  scratch project quarterly.
- **Storage**: the `carolina` bucket (avatars, lead-magnet PDFs, media) — enable
  bucket backups / periodic export.
- **Config as data**: prompts, KB, agents, automations, AI config all live in
  Postgres → covered by DB backups. Migrations live in git history (Supabase MCP).
- **DR steps**: (1) restore DB from latest backup into a new project, (2) point
  `NEXT_PUBLIC_SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` at it, (3) redeploy,
  (4) hit `/api/health`, (5) run the quality gates below.

## 6. Monitoring & alerting
- Uptime: poll `/api/health` (503 = page the team).
- App logs: Vercel runtime logs; errors are `console.error`'d with context.
- In-app: automation failures + (recommended) high-intent leads raise rows in
  `notifications`; observability per chat turn in `carolina_events`
  (intent/state/score/latency) surfaced on the admin dashboard.
- **Deferred**: external error tracking (Sentry) + a notifications bell UI +
  cost/latency alert thresholds.

## 7. Performance
- Widget is a single inline-loaded script → opens instantly; media lazy-loaded;
  content API sends cache headers (note: global `/api/*` no-store currently wins
  — relax per-route if CDN caching of content is desired).
- DB indexes exist on hot paths (content type/status/tsv, chunks hnsw, events,
  leads stage/score, activities by contact).
- **Load testing (deferred / ops)**: run k6/Artillery against `/api/carolina`
  and `/api/carolina/content` at 100 / 1k / 10k VUs; watch Anthropic + Upstash +
  Supabase limits. The embedding/reindex job is the main long-running task —
  keep it admin-triggered/off the request path.

## 8. Quality gates (run before each production promotion)
1. `/api/health` returns `ok:true`.
2. Widget opens; Home renders; a program opens in the content viewer.
3. AI answers a product question and shows source chips (grounded).
4. Booking: pick a slot → confirm → email arrives → CRM shows `call_booked`.
5. save_lead creates a contact; CRM timeline logs activity.
6. An enabled automation fires and appears in the execution log.
7. Admin dashboard shows live KPIs/funnel.
8. Search returns relevant results.
9. Errors show friendly messages (no stack traces).
10. Reduced-motion + keyboard nav work in the widget.

## 9. Notable deferred items (not blockers, tracked)
Full RBAC/MFA, external error monitoring, CI/CD pipeline config
(lint→typecheck→build→e2e→deploy→health→rollback), automated test suites
(unit/integration/e2e/AI-regression/load), CSP (needs care with inline handlers
+ YouTube/analytics), automation delays/scheduler, i18n, and a formal data-
retention policy. The architecture supports all of these without redesign.

## 10. CI/CD (recommended shape)
GitHub Actions: on PR → `npm ci`, `tsc --noEmit`, `next build`, (tests) →
deploy Preview. On merge to `main` → deploy Production → curl `/api/health` →
auto-rollback on non-200. Vercel already gives immutable deploys + instant
rollback from the dashboard as the interim safety net.
