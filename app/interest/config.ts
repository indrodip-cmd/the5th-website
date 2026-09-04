/* Business Interest Registration — shared config.

   Single source of truth for the form's option vocabulary. Imported by BOTH
   the client form and the server route so submissions are validated against
   the exact same set of allowed values (never trust the client). Mirrors the
   pattern used by /10k-roadmap/config.ts. */

export const SOURCE = 'interest-registration'
export const LANDING_PATH = '/interest'

/* Brand tokens (from the site palette + Gelica, already loaded in globals.css). */
export const C = {
  cream: '#FAF6F0',
  creamAlt: '#FBF6EF',
  ink: '#1C1A22',
  inkSoft: '#4A4550',
  line: '#E7DFD4',
  purple: '#552879',
  purpleSoft: '#6B39A0',
  gold: '#E4C879',
  white: '#FFFFFF',
} as const

export type Option = { value: string; label: string; hint?: string }
export type FieldId =
  | 'business_type' | 'niche' | 'business_stage' | 'monthly_revenue'
  | 'ai_business_type' | 'primary_goal' | 'help_needed'

export const BUSINESS_TYPES: Option[] = [
  { value: 'coaching', label: 'Start a coaching business' },
  { value: 'consulting', label: 'Consulting business' },
  { value: 'agency', label: 'Agency' },
  { value: 'course', label: 'Course / digital product' },
  { value: 'ai', label: 'AI business' },
  { value: 'unsure', label: 'Not sure yet' },
]

export const NICHES: Option[] = [
  { value: 'health_fitness', label: 'Health & fitness' },
  { value: 'business_career', label: 'Business & career' },
  { value: 'mindset_life', label: 'Mindset & life' },
  { value: 'relationships', label: 'Relationships' },
  { value: 'money_finance', label: 'Money & finance' },
  { value: 'marketing_sales', label: 'Marketing & sales' },
  { value: 'content_creator', label: 'Content & creator economy' },
  { value: 'tech_ai', label: 'Tech & AI' },
  { value: 'spirituality', label: 'Spirituality & purpose' },
  { value: 'other', label: 'Other / something else' },
]

export const BUSINESS_STAGES: Option[] = [
  { value: 'exploring', label: 'Just exploring' },
  { value: 'idea', label: 'I have an idea' },
  { value: 'have_business', label: 'I already have a business' },
  { value: 'have_clients', label: 'I have clients but want to grow' },
  { value: '5k_plus', label: 'I already make $5K+/month' },
]

/* Stages that imply an existing, revenue-generating business => ask revenue. */
export const REVENUE_STAGES = new Set(['have_business', 'have_clients', '5k_plus'])

export const MONTHLY_REVENUE: Option[] = [
  { value: '0', label: '$0' },
  { value: '1k_3k', label: '$1K–$3K' },
  { value: '3k_5k', label: '$3K–$5K' },
  { value: '5k_10k', label: '$5K–$10K' },
  { value: '10k_25k', label: '$10K–$25K' },
  { value: '25k_plus', label: '$25K+' },
]

export const AI_BUSINESS_TYPES: Option[] = [
  { value: 'ai_saas', label: 'AI SaaS' },
  { value: 'ai_agency', label: 'AI agency' },
  { value: 'ai_consulting', label: 'AI consulting' },
  { value: 'ai_automation', label: 'AI automation' },
  { value: 'ai_agents', label: 'AI agents' },
  { value: 'other', label: 'Other' },
]

export const PRIMARY_GOALS: Option[] = [
  { value: 'first_clients', label: 'Get my first clients' },
  { value: '5k_month', label: 'Reach $5K/month' },
  { value: '10k_month', label: 'Reach $10K/month' },
  { value: 'scale', label: 'Scale an existing business' },
  { value: 'lead_gen', label: 'Build predictable lead generation' },
  { value: 'systems', label: 'Build systems & automation' },
  { value: 'other', label: 'Other' },
]

export const HELP_NEEDED: Option[] = [
  { value: 'positioning', label: 'Positioning' },
  { value: 'offer', label: 'Offer creation' },
  { value: 'lead_gen', label: 'Lead generation' },
  { value: 'content', label: 'Content' },
  { value: 'sales', label: 'Sales' },
  { value: 'funnels', label: 'Funnels' },
  { value: 'ai_automation', label: 'AI & automation' },
  { value: 'scaling', label: 'Scaling' },
]

/* Server-side lookup: allowed values per single-select field. */
export const ALLOWED: Record<string, Set<string>> = {
  business_type: new Set(BUSINESS_TYPES.map((o) => o.value)),
  niche: new Set(NICHES.map((o) => o.value)),
  business_stage: new Set(BUSINESS_STAGES.map((o) => o.value)),
  monthly_revenue: new Set(MONTHLY_REVENUE.map((o) => o.value)),
  ai_business_type: new Set(AI_BUSINESS_TYPES.map((o) => o.value)),
  primary_goal: new Set(PRIMARY_GOALS.map((o) => o.value)),
  help_needed: new Set(HELP_NEEDED.map((o) => o.value)),
}

export function labelFor(field: FieldId, value: string): string {
  const map: Record<FieldId, Option[]> = {
    business_type: BUSINESS_TYPES, niche: NICHES, business_stage: BUSINESS_STAGES,
    monthly_revenue: MONTHLY_REVENUE, ai_business_type: AI_BUSINESS_TYPES,
    primary_goal: PRIMARY_GOALS, help_needed: HELP_NEEDED,
  }
  return map[field]?.find((o) => o.value === value)?.label || value
}
