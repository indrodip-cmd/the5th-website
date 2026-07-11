import { NextRequest, NextResponse } from 'next/server'
import { adminEmail } from '@/lib/session'
import { getSupabaseAdmin } from '@/lib/supabase'
import { sanitizeText } from '@/lib/validation'
import { searchMemories, getMemory, memoryStats, topEntities, entityGraph, recordDecision, listDecisions, recordExperiment, updateExperiment, listExperiments } from '@/lib/memory/store'
import { syncMemory, summarizeMonth } from '@/lib/memory/ingest'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

/* GET ?view=overview|timeline|search|entities|graph|decisions|experiments|memory */
export async function GET(req: NextRequest) {
  if (!adminEmail(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const db = getSupabaseAdmin()
  const sp = new URL(req.url).searchParams
  const view = sp.get('view') || 'overview'
  const opts = { query: sp.get('q') || undefined, type: sp.get('type') || undefined, entity: sp.get('entity') || undefined, topic: sp.get('topic') || undefined, from: sp.get('from') || undefined, to: sp.get('to') || undefined, limit: Number(sp.get('limit')) || undefined }

  if (view === 'overview') {
    const [stats, recent, summaries] = await Promise.all([
      memoryStats(),
      searchMemories({ limit: 12 }),
      db.from('memory_summaries').select('*').order('period_key', { ascending: false }).limit(6),
    ])
    return NextResponse.json({ stats, recent, summaries: summaries.data || [] })
  }
  if (view === 'memory') return NextResponse.json({ memory: await getMemory(sp.get('id') || '') })
  if (view === 'timeline' || view === 'search') return NextResponse.json({ memories: await searchMemories(opts) })
  if (view === 'entities') return NextResponse.json({ entities: await topEntities(opts.type, 60) })
  if (view === 'graph') return NextResponse.json(await entityGraph(sp.get('id') || ''))
  if (view === 'decisions') return NextResponse.json({ decisions: await listDecisions() })
  if (view === 'experiments') return NextResponse.json({ experiments: await listExperiments() })
  return NextResponse.json({ error: 'unknown view' }, { status: 400 })
}

/* POST { action } — record_decision | record_experiment | update_experiment | sync | summarize */
export async function POST(req: NextRequest) {
  const actor = adminEmail(req)
  if (!actor) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const b = await req.json().catch(() => ({}))
  const action = String(b?.action || '')

  if (action === 'record_decision') {
    if (!b?.title) return NextResponse.json({ error: 'Title required' }, { status: 400 })
    const d = await recordDecision({ title: sanitizeText(b.title, 200), description: b.description, category: b.category, decided_by: b.decided_by || actor, reason: b.reason, outcome: b.outcome, decided_at: b.decided_at })
    return NextResponse.json({ ok: true, decision: d })
  }
  if (action === 'record_experiment') {
    if (!b?.title) return NextResponse.json({ error: 'Title required' }, { status: 400 })
    return NextResponse.json({ ok: true, experiment: await recordExperiment(b) })
  }
  if (action === 'update_experiment') return NextResponse.json({ ok: true, experiment: await updateExperiment(String(b?.id), b?.patch || {}) })
  if (action === 'sync') return NextResponse.json({ ok: true, result: await syncMemory(40) })
  if (action === 'summarize') return NextResponse.json({ ok: true, result: await summarizeMonth(b?.month) })
  return NextResponse.json({ error: 'unknown action' }, { status: 400 })
}
