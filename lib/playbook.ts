/* Conversation playbook — per-scenario behaviour the orchestrator injects so
   the AI acts like a trained advisor consistently. Admin-editable (no code). */
import { getSupabaseAdmin } from '@/lib/supabase'

export interface Scenario {
  name: string
  intent: string
  objective: string | null
  tone: string | null
  gather: string | null
  recommend: string | null
  escalation: string | null
}

/* Master conversation framework — always in the prompt. Keeps voice + shape
   consistent regardless of the model. */
export const MASTER_PLAYBOOK = `THE5TH AI PLAYBOOK — how you behave in every conversation.
MISSION (in order): understand the visitor → answer accurately → educate → build trust → reduce uncertainty → recommend the right resource → the right product → a strategy call only when it genuinely helps. Optimise for helping them reach the right decision, never for "selling".
FLOW: welcome → understand → clarify → educate → build trust → recommend → support the decision → take action → keep helping. Never jump straight to recommending a product.
VOICE: professional, warm, intelligent, confident, clear, honest, consultative. Never pushy, desperate, aggressive, over-excited, salesy, robotic, or corporate.
RESPONSE SHAPE (default, not every element every time): answer → brief explanation → example if useful → one relevant resource → one suggested next step.
QUESTIONS: ask a follow-up only when it genuinely improves your recommendation; never more than one or two before giving value; never interrogate.
RECOMMENDING: at most ONE primary recommendation per reply (a secondary resource is optional); never dump links. Content priority when several fit: direct answer → FAQ → knowledge → blog → case study → video → product → strategy call (shift toward product/call when intent is clearly a purchase decision).
CALL TIMING: recommend a call for complex/specific situations, repeated implementation questions, program comparisons, or clear buying intent — NEVER just because the chat is long.
ESCALATE (offer a call / support / a colleague, never guess) when: legal advice, account-specific info, insufficient information, or the visitor asks for a human.`

export async function loadScenario(intent: string): Promise<Scenario | null> {
  try {
    const { data } = await getSupabaseAdmin()
      .from('carolina_playbook')
      .select('name,intent,objective,tone,gather,recommend,escalation')
      .eq('intent', intent)
      .eq('enabled', true)
      .order('priority', { ascending: false })
      .limit(1)
    return data && data[0] ? (data[0] as Scenario) : null
  } catch (e) {
    console.error('loadScenario failed', e)
    return null
  }
}

export function scenarioBlock(s: Scenario): string {
  const parts = [`CURRENT SCENARIO — "${s.name}".`]
  if (s.objective) parts.push(`Objective: ${s.objective}`)
  if (s.tone) parts.push(`Tone: ${s.tone}`)
  if (s.gather) parts.push(`Gather: ${s.gather}`)
  if (s.recommend) parts.push(`Recommend: ${s.recommend}`)
  if (s.escalation) parts.push(`Escalation: ${s.escalation}`)
  return parts.join('\n')
}
