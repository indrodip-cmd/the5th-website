/* Cost protection (3I.5) — configurable AI spend guards, enforced in the AI
   hot path. All settings live in platform_settings and DEFAULT to off/unlimited,
   so nothing changes until an admin sets them. Fail-open on errors (never take
   the concierge down because a check failed). */
import { getSupabaseAdmin } from '@/lib/supabase'
import { notify } from '@/lib/notifications'

const KEYS = ['ai_daily_budget_usd', 'ai_monthly_budget_usd', 'ai_max_cost_per_conversation', 'ai_max_tokens_per_request', 'ai_max_msgs_per_visitor', 'ai_emergency_off', 'ai_throttle_on_budget'] as const

export interface CostSettings {
  dailyBudget: number; monthlyBudget: number; maxCostPerConversation: number
  maxTokens: number; msgCap: number; emergencyOff: boolean; throttleOnBudget: boolean
}

function toNum(v: unknown): number { const n = Number(typeof v === 'string' ? v.replace(/"/g, '') : v); return Number.isFinite(n) ? n : 0 }
function toBool(v: unknown): boolean { return v === true || v === 'true' || v === '"true"' || v === 1 }

export async function getCostSettings(): Promise<CostSettings> {
  try {
    const { data } = await getSupabaseAdmin().from('platform_settings').select('key,value').in('key', KEYS as unknown as string[])
    const m = new Map((data || []).map((r) => [r.key as string, r.value]))
    return {
      dailyBudget: toNum(m.get('ai_daily_budget_usd')), monthlyBudget: toNum(m.get('ai_monthly_budget_usd')),
      maxCostPerConversation: toNum(m.get('ai_max_cost_per_conversation')), maxTokens: toNum(m.get('ai_max_tokens_per_request')),
      msgCap: toNum(m.get('ai_max_msgs_per_visitor')), emergencyOff: toBool(m.get('ai_emergency_off')), throttleOnBudget: toBool(m.get('ai_throttle_on_budget')),
    }
  } catch {
    return { dailyBudget: 0, monthlyBudget: 0, maxCostPerConversation: 0, maxTokens: 0, msgCap: 0, emergencyOff: false, throttleOnBudget: false }
  }
}

export interface CostDecision { allowed: boolean; reason?: 'emergency' | 'visitor_cap' | 'budget'; maxTokens: number }

let lastBudgetAlert = 0

/* Consulted by public AI routes BEFORE calling Anthropic. Fail-open. */
export async function checkAiAllowed(input: { visitorId?: string | null }): Promise<CostDecision> {
  try {
    const s = await getCostSettings()
    const maxTokens = s.maxTokens > 0 ? s.maxTokens : 100000
    if (s.emergencyOff) return { allowed: false, reason: 'emergency', maxTokens }

    const db = getSupabaseAdmin()
    // Per-visitor 24h message cap
    if (s.msgCap > 0 && input.visitorId) {
      const since = new Date(Date.now() - 86400000).toISOString()
      const { count } = await db.from('ai_events').select('id', { count: 'exact', head: true }).eq('endpoint', 'carolina').eq('visitor_id', input.visitorId).gte('created_at', since)
      if ((count || 0) >= s.msgCap) return { allowed: false, reason: 'visitor_cap', maxTokens }
    }
    // Daily budget throttle
    if (s.throttleOnBudget && s.dailyBudget > 0) {
      const dayStart = new Date(); dayStart.setHours(0, 0, 0, 0)
      const { data } = await db.from('ai_events').select('cost_usd').gte('created_at', dayStart.toISOString()).limit(100000)
      const spent = (data || []).reduce((sum, r) => sum + Number((r as Record<string, unknown>).cost_usd || 0), 0)
      if (spent >= s.dailyBudget) {
        if (Date.now() - lastBudgetAlert > 3600000) { lastBudgetAlert = Date.now(); notify('ai_budget', 'AI daily budget reached', `Spent $${spent.toFixed(2)} of $${s.dailyBudget} — public AI throttled.`) }
        return { allowed: false, reason: 'budget', maxTokens }
      }
    }
    return { allowed: true, maxTokens }
  } catch {
    return { allowed: true, maxTokens: 100000 } // fail-open
  }
}
