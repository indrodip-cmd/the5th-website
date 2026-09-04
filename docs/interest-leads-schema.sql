-- Schema of record for the Business Interest Registration funnel (/interest).
-- Applied to Supabase directly (this repo does not track a migrations dir;
-- tables like vsl_leads / crm_* live in the DB). Kept here for reference.
--
-- Written by: app/api/interest/route.ts -> lib/interest-leads.ts (service role).
-- Also mirrored into crm_contacts + crm_business_profiles via lib/crm.ts.

create table if not exists public.interest_leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  -- contact
  name        text,
  email       text not null,
  phone       text,
  country     text,

  -- qualification / segmentation
  business_type   text,   -- coaching | consulting | agency | course | ai | unsure
  niche           text,   -- allowed value, or 'other:<free text>'
  business_stage  text,   -- exploring | idea | have_business | have_clients | 5k_plus
  monthly_revenue text,   -- null unless the stage implies an existing business
  primary_goal    text,
  help_needed     text[] not null default '{}',
  ai_business_type text,  -- null unless business_type = ai

  -- attribution
  source        text not null default 'interest-registration',
  landing_page  text,
  referrer      text,
  utm           jsonb not null default '{}'::jsonb,  -- utm_source/medium/campaign/content/term
  visitor_id    text,

  -- links + raw payload
  crm_contact_id uuid,
  answers        jsonb not null default '{}'::jsonb,
  status         text not null default 'new'
);

-- The app always writes a normalized (lowercased) email, so a plain unique
-- constraint on the column is correct and can back the ON CONFLICT (email) upsert.
alter table public.interest_leads
  add constraint interest_leads_email_key unique (email);

create index if not exists interest_leads_created_at_idx on public.interest_leads (created_at desc);
create index if not exists interest_leads_business_type_idx on public.interest_leads (business_type);
create index if not exists interest_leads_business_stage_idx on public.interest_leads (business_stage);

-- Service-role only: RLS on, no anon/authenticated policies. The app writes via
-- SUPABASE_SERVICE_ROLE_KEY (which bypasses RLS); the anon key cannot read or
-- write this lead data. Matches the posture of vsl_leads / quiz_leads.
alter table public.interest_leads enable row level security;

create trigger interest_leads_set_updated_at
  before update on public.interest_leads
  for each row execute function public.set_updated_at();
