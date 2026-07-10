import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { getSupabaseAdmin } from '@/lib/supabase'
import { adminEmail } from '@/lib/session'
import { generateInsight, getInsights } from '@/lib/ai-coach'

export const dynamic = 'force-dynamic'
export const maxDuration = 30

/* GET ?contact_id= or ?opportunity_id= — latest cached insights per kind. */
export async function GET(req: NextRequest) {
  if (!adminEmail(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const sp = new URL(req.url).searchParams
  const contactId = sp.get('contact_id') || undefined
  const opportunityId = sp.get('opportunity_id') || undefined
  if (!contactId && !opportunityId) return NextResponse.json({ insights: [] })
  return NextResponse.json({ insights: await getInsights({ contactId, opportunityId }) })
}

/* POST
   - { kind, contact_id | opportunity_id } → generate + cache a grounded insight
   - { email } → legacy single-shot analyst summary (kept for the old admin tab) */
export async function POST(req: NextRequest) {
  if (!adminEmail(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!process.env.ANTHROPIC_API_KEY) return NextResponse.json({ error: 'AI not configured.' }, { status: 500 })
  const b = await req.json().catch(() => ({}))

  // New insight engine
  if (b?.kind && (b?.contact_id || b?.opportunity_id)) {
    const insight = await generateInsight(String(b.kind), { contactId: b.contact_id || undefined, opportunityId: b.opportunity_id || undefined })
    if (!insight) return NextResponse.json({ error: 'Could not generate insight.' }, { status: 502 })
    return NextResponse.json({ ok: true, insight })
  }

  // Legacy: analyst summary by email
  const email = String(b?.email || '').trim().toLowerCase()
  if (!email) return NextResponse.json({ error: 'Missing email or kind.' }, { status: 400 })
  const db = getSupabaseAdmin()
  const [{ data: contact }, { data: acts }, { data: notes }] = await Promise.all([
    db.from('crm_contacts').select('name,interest,business_stage,lead_score,pipeline_stage,call_booked,country,notes,tags').eq('email', email).maybeSingle(),
    db.from('crm_activities').select('type,title,created_at').eq('contact_email', email).order('created_at', { ascending: false }).limit(30),
    db.from('crm_notes').select('body').eq('contact_email', email).limit(10),
  ])
  if (!contact) return NextResponse.json({ error: 'Contact not found.' }, { status: 404 })
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  const msg = await client.messages.create({
    model: 'claude-sonnet-4-6', max_tokens: 700,
    system:
      'You are a sales analyst for The5th (helps women 40+ turn expertise into income via Fast Forward coaching and The5th AI). Analyse one CRM contact and return ONLY minified JSON with keys: ' +
      '"summary" (2-3 sentence factual summary), "signals" (array of 2-4 short buying-signal or risk bullets), "next_action" (one specific recommended next step), "email_draft" ({"subject","body"} a short, warm, non-pushy follow-up email; plain text, no placeholders you can\'t fill). Never invent facts, pricing, or results.',
    messages: [{ role: 'user', content: `Contact: ${JSON.stringify(contact)}\nActivity (newest first): ${JSON.stringify(acts)}\nNotes: ${JSON.stringify(notes)}` }],
  })
  const text = msg.content.find((bl) => bl.type === 'text')
  const raw = text && text.type === 'text' ? text.text : '{}'
  try {
    const parsed = JSON.parse(raw.slice(raw.indexOf('{'), raw.lastIndexOf('}') + 1))
    return NextResponse.json({ ok: true, insights: parsed })
  } catch {
    return NextResponse.json({ error: 'Could not parse insights.' }, { status: 502 })
  }
}
