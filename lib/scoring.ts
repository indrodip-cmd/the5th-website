/* Lead scoring — turns a contact's activity trail into a 0-100 score + band.
   Kept dependency-light (supabase + events only) so lib/crm can hook bumpScore
   from logActivity without an import cycle. */
import { getSupabaseAdmin } from '@/lib/supabase'
import { emitEvent } from '@/lib/events'

/* Points per activity type. Tuned for a coaching/consulting sales motion. */
export const SCORE_WEIGHTS: Record<string, number> = {
  call_booked: 25,
  meeting_completed: 20,
  proposal_viewed: 15,
  deal: 12,
  program_view: 8,
  case_study: 6,
  chat: 5,
  knowledge: 4,
  repeat_visit: 3,
  lead: 2,
  email: 1,
}

export type Band = 'Cold' | 'Warm' | 'Hot' | 'Very Hot'
export function band(score: number): Band {
  if (score >= 75) return 'Very Hot'
  if (score >= 50) return 'Hot'
  if (score >= 25) return 'Warm'
  return 'Cold'
}
export function bandColor(b: Band): string {
  return b === 'Very Hot' ? '#dc2626' : b === 'Hot' ? '#ea580c' : b === 'Warm' ? '#d97706' : '#6b7280'
}

/* Incremental bump on a single new activity (called from logActivity). Cheap:
   one read + conditional update. Never throws into the caller. */
export async function bumpScore(contactId: string, activityType: string) {
  const w = SCORE_WEIGHTS[activityType]
  if (!w) return
  try {
    const db = getSupabaseAdmin()
    const { data } = await db.from('crm_contacts').select('lead_score').eq('id', contactId).maybeSingle()
    const before = Number(data?.lead_score || 0)
    const next = Math.min(100, before + w)
    if (next !== before) {
      await db.from('crm_contacts').update({ lead_score: next }).eq('id', contactId)
      emitEvent('lead_score_changed', { contact_id: contactId, lead_score: next, delta: next - before })
    }
  } catch (e) { console.error('bumpScore failed', e) }
}

/* Full recompute from the activity history (idempotent). Caps each activity
   type's total contribution so a single repeated signal can't dominate. */
export async function recomputeLeadScore(contactId: string): Promise<number> {
  const db = getSupabaseAdmin()
  const { data: acts } = await db.from('crm_activities').select('type').eq('contact_id', contactId)
  const perType = new Map<string, number>()
  for (const a of acts || []) perType.set(a.type as string, (perType.get(a.type as string) || 0) + 1)
  let score = 0
  for (const [type, count] of perType) {
    const w = SCORE_WEIGHTS[type] || 0
    // diminishing returns: full weight for the first, half for repeats, capped.
    score += Math.min(w * (1 + Math.min(count - 1, 4) * 0.5), w * 3)
  }
  score = Math.max(0, Math.min(100, Math.round(score)))
  await db.from('crm_contacts').update({ lead_score: score }).eq('id', contactId)
  emitEvent('lead_score_changed', { contact_id: contactId, lead_score: score })
  return score
}
