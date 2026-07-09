import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { getSupabaseAdmin } from '@/lib/supabase'
import { adminEmail } from '@/lib/session'

export const dynamic = 'force-dynamic'
export const maxDuration = 30

/* AI sales insights for a contact: summary, buying signals, next best action,
   and a ready-to-send follow-up email draft. */
export async function POST(req: NextRequest) {
  if (!adminEmail(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!process.env.ANTHROPIC_API_KEY) return NextResponse.json({ error: 'AI not configured.' }, { status: 500 })
  const email = String((await req.json().catch(() => ({})))?.email || '').trim().toLowerCase()
  if (!email) return NextResponse.json({ error: 'Missing email.' }, { status: 400 })

  const db = getSupabaseAdmin()
  const [{ data: contact }, { data: acts }, { data: notes }] = await Promise.all([
    db.from('carolina_leads').select('name,interest,business_stage,lead_score,pipeline_stage,call_booked,country,notes,tags').eq('email', email).single(),
    db.from('crm_activities').select('type,title,created_at').eq('contact_email', email).order('created_at', { ascending: false }).limit(30),
    db.from('crm_notes').select('body').eq('contact_email', email).limit(10),
  ])
  if (!contact) return NextResponse.json({ error: 'Contact not found.' }, { status: 404 })

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  const msg = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 700,
    system:
      'You are a sales analyst for The5th (helps women 40+ turn expertise into income via Fast Forward coaching and The5th AI). Analyse one CRM contact and return ONLY minified JSON with keys: ' +
      '"summary" (2-3 sentence factual summary), "signals" (array of 2-4 short buying-signal or risk bullets), "next_action" (one specific recommended next step), "email_draft" ({"subject","body"} a short, warm, non-pushy follow-up email; plain text, no placeholders you can\'t fill). Never invent facts, pricing, or results.',
    messages: [{ role: 'user', content: `Contact: ${JSON.stringify(contact)}\nActivity (newest first): ${JSON.stringify(acts)}\nNotes: ${JSON.stringify(notes)}` }],
  })
  const text = msg.content.find((b) => b.type === 'text')
  const raw = text && text.type === 'text' ? text.text : '{}'
  try {
    const parsed = JSON.parse(raw.slice(raw.indexOf('{'), raw.lastIndexOf('}') + 1))
    return NextResponse.json({ ok: true, insights: parsed })
  } catch {
    return NextResponse.json({ error: 'Could not parse insights.' }, { status: 502 })
  }
}
