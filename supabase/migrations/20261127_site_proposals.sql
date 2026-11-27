-- Overnight self-improvement: AI-drafted copy proposals that only go live after human approval.
create table if not exists public.site_proposals (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  element_id text not null,
  page text not null,
  current_text text not null,
  proposed_text text not null,
  rationale text,
  metrics jsonb,
  status text not null default 'pending' check (status in ('pending','approved','rejected','reverted')),
  decided_at timestamptz,
  decided_by text
);
create index if not exists site_proposals_status_idx on public.site_proposals (status, created_at desc);
create index if not exists site_proposals_element_idx on public.site_proposals (element_id, status);
alter table public.site_proposals enable row level security;
