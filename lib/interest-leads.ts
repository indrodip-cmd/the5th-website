/* ─────────────────────────────────────────────────────────────────────────
   Business Interest Registration — server-side lead persistence.

   Two destinations, both fail-soft (a lead is never lost to a mirror error):
     1. interest_leads          — dedicated, structured, filterable table.
     2. crm_contacts (+ profile) — the company-wide CRM via lib/crm.ts, so this
        funnel's leads land in the same unified pipeline as every other source.

   Values are validated against app/interest/config.ts BEFORE they get here.
   ───────────────────────────────────────────────────────────────────────── */
import { getSupabaseAdmin } from '@/lib/supabase'
import {
  normEmail, normPhone, resolveOrCreateContact, setBusinessProfile, logActivity,
} from '@/lib/crm'
import { labelFor } from '@/app/interest/config'

export interface InterestLead {
  name: string | null
  email: string
  phone: string | null
  country: string | null
  business_type: string | null
  niche: string | null
  business_stage: string | null
  monthly_revenue: string | null
  primary_goal: string | null
  help_needed: string[]
  ai_business_type: string | null
  utm: Record<string, string>
  landing_page: string | null
  referrer: string | null
  visitor_id: string | null
  answers: Record<string, unknown>
}

/* Map the CRM business_stage vocabulary onto this funnel's stages. */
const CRM_STAGE: Record<string, string> = {
  exploring: 'Exploring', idea: 'Idea', have_business: 'Running',
  have_clients: 'Growing', '5k_plus': 'Scaling',
}

export async function saveInterestLead(
  input: InterestLead,
): Promise<{ ok: boolean; contactId: string | null; error?: string }> {
  const email = normEmail(input.email)
  if (!email) return { ok: false, contactId: null, error: 'invalid_email' }
  const phone = normPhone(input.phone)
  const name = (input.name || '').trim().slice(0, 120) || null

  const db = getSupabaseAdmin()

  // 1. Dedicated table (upsert on lower(email)). This is the durable record;
  //    do it first so a CRM hiccup can never drop the lead.
  const row = {
    name, email, phone,
    country: input.country?.slice(0, 80) || null,
    business_type: input.business_type,
    niche: input.niche,
    business_stage: input.business_stage,
    monthly_revenue: input.monthly_revenue,
    primary_goal: input.primary_goal,
    help_needed: input.help_needed,
    ai_business_type: input.ai_business_type,
    utm: input.utm || {},
    landing_page: input.landing_page,
    referrer: input.referrer,
    visitor_id: input.visitor_id,
    answers: input.answers || {},
    status: 'new',
    updated_at: new Date().toISOString(),
  }
  const { error: upErr } = await db
    .from('interest_leads')
    .upsert(row, { onConflict: 'email' })
  if (upErr) {
    // A race on the unique(email) index — patch the existing row instead.
    await db.from('interest_leads').update(row).eq('email', email)
  }

  // 2. Mirror into the CRM. Fail-soft: log and continue.
  let contactId: string | null = null
  try {
    const contact = await resolveOrCreateContact(
      {
        email, name, phone,
        country: input.country || undefined,
        source: 'interest-registration',
        interest: input.business_type ? labelFor('business_type', input.business_type) : undefined,
        business_stage: input.business_stage ? CRM_STAGE[input.business_stage] : undefined,
        utm_source: input.utm?.utm_source,
        utm_medium: input.utm?.utm_medium,
        utm_campaign: input.utm?.utm_campaign,
        tags: ['interest-registration', ...(input.business_type ? [input.business_type] : [])],
      },
      { source: 'interest-registration' },
    )
    contactId = (contact?.id as string) || null

    if (contactId) {
      await db.from('interest_leads').update({ crm_contact_id: contactId }).eq('email', email)
      await setBusinessProfile(contactId, {
        industry: input.niche ? labelFor('niche', input.niche) : null,
        business_model: input.business_type ? labelFor('business_type', input.business_type) : null,
        revenue_range: input.monthly_revenue ? labelFor('monthly_revenue', input.monthly_revenue) : null,
        main_goal: input.primary_goal ? labelFor('primary_goal', input.primary_goal) : null,
        data: {
          help_needed: input.help_needed.map((v) => labelFor('help_needed', v)),
          ai_business_type: input.ai_business_type
            ? labelFor('ai_business_type', input.ai_business_type) : null,
          source: 'interest-registration',
        },
      })
    }

    await logActivity(
      email, 'lead',
      'Business interest registration',
      [
        input.business_type && `Building: ${labelFor('business_type', input.business_type)}`,
        input.niche && `Niche: ${labelFor('niche', input.niche)}`,
        input.business_stage && `Stage: ${labelFor('business_stage', input.business_stage)}`,
        input.primary_goal && `Goal: ${labelFor('primary_goal', input.primary_goal)}`,
      ].filter(Boolean).join(' · ') || undefined,
      { funnel: 'interest-registration', ...row, utm: input.utm },
    )
  } catch (e) {
    console.error('interest-registration CRM mirror failed', e)
  }

  return { ok: true, contactId }
}
