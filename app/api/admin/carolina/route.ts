import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { adminEmail } from '@/lib/session'
import { sanitizeText } from '@/lib/validation'

export const dynamic = 'force-dynamic'

/* GET: current Carolina settings + all lead magnets (admin only). */
export async function GET(req: NextRequest) {
  if (!adminEmail(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const db = getSupabaseAdmin()
  const [{ data: settings }, { data: magnets }, { data: agents }] = await Promise.all([
    db.from('carolina_settings').select('*').eq('id', 1).single(),
    db.from('carolina_lead_magnets').select('*').order('created_at', { ascending: false }),
    db.from('carolina_agents').select('*').order('sort', { ascending: true }),
  ])
  return NextResponse.json({ settings: settings || null, magnets: magnets || [], agents: agents || [] })
}

/* PATCH: update editable settings fields. */
export async function PATCH(req: NextRequest) {
  if (!adminEmail(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json().catch(() => null)
  if (!body || typeof body !== 'object') return NextResponse.json({ error: 'Bad request' }, { status: 400 })

  const patch: Record<string, unknown> = { id: 1, updated_at: new Date().toISOString() }
  if (typeof body.greeting === 'string') patch.greeting = sanitizeText(body.greeting, 600)
  if (typeof body.persona === 'string') patch.persona = sanitizeText(body.persona, 4000)
  if (typeof body.knowledge_base === 'string') patch.knowledge_base = sanitizeText(body.knowledge_base, 20000)
  if (typeof body.proactive_enabled === 'boolean') patch.proactive_enabled = body.proactive_enabled
  if (Number.isFinite(body.proactive_delay_seconds)) {
    patch.proactive_delay_seconds = Math.min(Math.max(Math.round(body.proactive_delay_seconds), 0), 120)
  }
  if (typeof body.active_lead_magnet === 'string' || body.active_lead_magnet === null) {
    patch.active_lead_magnet = body.active_lead_magnet || null
  }
  if (body.ai_config && typeof body.ai_config === 'object') {
    const c = body.ai_config as Record<string, unknown>
    patch.ai_config = {
      model: typeof c.model === 'string' ? c.model : 'claude-sonnet-4-6',
      temperature: Math.min(Math.max(Number(c.temperature) || 0.7, 0), 1),
      cta_threshold: Math.min(Math.max(Math.round(Number(c.cta_threshold) || 8), 1), 40),
      retrieval_limit: Math.min(Math.max(Math.round(Number(c.retrieval_limit) || 5), 1), 12),
      max_tokens: Math.min(Math.max(Math.round(Number(c.max_tokens) || 700), 200), 2000),
    }
  }

  const { error } = await getSupabaseAdmin().from('carolina_settings').upsert(patch, { onConflict: 'id' })
  if (error) {
    console.error('carolina settings patch failed', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json({ ok: true })
}
