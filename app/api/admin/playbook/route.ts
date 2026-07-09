import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { adminEmail } from '@/lib/session'
import { sanitizeText } from '@/lib/validation'

export const dynamic = 'force-dynamic'

export const PLAYBOOK_INTENTS = [
  'greeting', 'general', 'pricing', 'guarantee', 'comparison', 'objection',
  'purchase', 'booking', 'program', 'product', 'case_study', 'support', 'human',
]

export async function GET(req: NextRequest) {
  if (!adminEmail(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { data } = await getSupabaseAdmin().from('carolina_playbook').select('*').order('intent', { ascending: true })
  return NextResponse.json({ scenarios: data || [], intents: PLAYBOOK_INTENTS })
}

export async function POST(req: NextRequest) {
  if (!adminEmail(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const b = await req.json().catch(() => ({}))
  if (!b?.name || !b?.intent) return NextResponse.json({ error: 'Name and intent required.' }, { status: 400 })
  const row: Record<string, unknown> = {
    name: sanitizeText(b.name, 120),
    intent: sanitizeText(b.intent, 40),
    objective: sanitizeText(b.objective, 2000) || null,
    tone: sanitizeText(b.tone, 300) || null,
    gather: sanitizeText(b.gather, 500) || null,
    recommend: sanitizeText(b.recommend, 1000) || null,
    escalation: sanitizeText(b.escalation, 500) || null,
    enabled: b.enabled !== false,
    priority: Number.isFinite(b.priority) ? Math.round(b.priority) : 0,
    updated_at: new Date().toISOString(),
  }
  const db = getSupabaseAdmin()
  if (b.id) {
    const { error } = await db.from('carolina_playbook').update(row).eq('id', b.id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true, id: b.id })
  }
  const { data, error } = await db.from('carolina_playbook').insert(row).select('id').single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true, id: data.id })
}

export async function DELETE(req: NextRequest) {
  if (!adminEmail(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const id = new URL(req.url).searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Missing id.' }, { status: 400 })
  const { error } = await getSupabaseAdmin().from('carolina_playbook').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
