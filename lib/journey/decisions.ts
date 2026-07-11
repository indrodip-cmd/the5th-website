/* AI Decision Engine (3I.8B.2) — turns journey intelligence into a prioritized
   Next-Best-Action per contact. Batch-refreshed (cron), surfaced on the Journey
   Intelligence dashboard + Command AI. Respects human decisions (won't reopen a
   dismissed/done rec). Reuses computeJourney; no duplicate scoring logic. */
import { getSupabaseAdmin } from '@/lib/supabase'
import { computeJourney } from '@/lib/journey/intent'

type Row = Record<string, unknown>

// Segment → base urgency (higher = act sooner).
const PRIORITY: Record<string, number> = { 'Ready to Buy': 92, 'High Intent': 84, 'At Risk': 80, 'Warm Lead': 60, Customer: 52, Researching: 40, 'Cold Visitor': 15 }

function toRec(j: Row): { action: string; reason: string; priority: number } | null {
  const seg = String(j.segment || '')
  if (seg === 'Cold Visitor') return null
  const scores = (j.scores as Row) || {}
  const signals = (j.signals as string[]) || []
  let priority = PRIORITY[seg] ?? 40
  // Nudge by the sharpest score.
  priority += Math.round((Number(scores.buying_intent || 0) + Number(scores.readiness || 0)) / 40)
  return { action: String(j.next_best_action || 'Follow up'), reason: signals[0] || `Segment: ${seg}`, priority: Math.min(100, priority) }
}

/* Recompute recommendations for the most relevant contacts. */
export async function refreshRecommendations(limit = 40): Promise<{ scanned: number; written: number }> {
  const db = getSupabaseAdmin()
  const { data: cands } = await db.from('crm_contacts').select('id')
    .is('deleted_at', null).or('lead_score.gte.20,revenue.gt.0,call_booked.eq.true')
    .order('last_activity_at', { ascending: false, nullsFirst: false }).limit(limit)
  let written = 0
  for (const c of cands || []) {
    const j = await computeJourney(c.id as string).catch(() => null)
    if (!j) continue
    const rec = toRec(j)
    const { data: existing } = await db.from('journey_recommendations').select('status').eq('contact_id', c.id).maybeSingle()
    if (!rec) { if (existing && existing.status === 'open') await db.from('journey_recommendations').delete().eq('contact_id', c.id); continue }
    const base = { contact_id: c.id, contact_email: (j.contact as Row)?.email || null, contact_name: (j.contact as Row)?.name || null, action: rec.action, reason: rec.reason, priority: rec.priority, segment: j.segment, lifecycle: j.lifecycle, scores: j.scores, updated_at: new Date().toISOString() }
    if (existing) {
      // Refresh content but never override a human's done/dismissed decision.
      await db.from('journey_recommendations').update(existing.status === 'open' ? base : { ...base, status: existing.status }).eq('contact_id', c.id)
    } else { await db.from('journey_recommendations').insert(base) }
    written++
  }
  return { scanned: (cands || []).length, written }
}

export async function topRecommendations(status = 'open', limit = 30): Promise<Row[]> {
  const { data } = await getSupabaseAdmin().from('journey_recommendations').select('*').eq('status', status).order('priority', { ascending: false }).limit(limit)
  return data || []
}

export async function decideRecommendation(id: string, status: string, actor: string): Promise<void> {
  await getSupabaseAdmin().from('journey_recommendations').update({ status, decided_by: actor, decided_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq('id', id)
}

export async function intelligenceDashboard(): Promise<Row> {
  const db = getSupabaseAdmin()
  const [{ data: recs }, { data: lifecycles }, { count: openOpps }] = await Promise.all([
    db.from('journey_recommendations').select('segment,status').limit(5000),
    db.from('crm_contacts').select('lifecycle_stage').is('deleted_at', null).limit(20000),
    db.from('crm_opportunities').select('id', { count: 'exact', head: true }).eq('status', 'open').is('deleted_at', null),
  ])
  const openRecs = (recs || []).filter((r) => r.status === 'open')
  const bySeg = (s: string) => openRecs.filter((r) => r.segment === s).length
  const lc = new Map<string, number>()
  for (const r of lifecycles || []) lc.set((r.lifecycle_stage as string) || 'unknown', (lc.get((r.lifecycle_stage as string) || 'unknown') || 0) + 1)
  return {
    open: openRecs.length,
    highIntent: bySeg('High Intent') + bySeg('Ready to Buy'),
    atRisk: bySeg('At Risk'),
    warm: bySeg('Warm Lead'),
    openOpportunities: openOpps || 0,
    lifecycle: [...lc].map(([stage, count]) => ({ stage, count })).sort((a, b) => b.count - a.count),
  }
}
