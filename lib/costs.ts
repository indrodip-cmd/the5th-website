/* Cost Intelligence — unifies spend across providers (AI + email + SMS) with
   per-unit economics and a simple spike detector. Read-only aggregation over
   ai_events + comm_messages; rates are editable estimates. */
import { getSupabaseAdmin } from '@/lib/supabase'

type Row = Record<string, unknown>
const EMAIL_RATE = 0.0004   // ~Resend blended $/email
const SMS_RATE = 0.0079     // ~Twilio US $/segment

export async function costSummary(): Promise<Row> {
  const db = getSupabaseAdmin()
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
  const daysElapsed = Math.max(1, now.getDate())

  const [ai, comms, bookings, convos] = await Promise.all([
    db.from('ai_events').select('model,endpoint,cost_usd,created_at').gte('created_at', monthStart).limit(100000),
    db.from('comm_messages').select('channel,created_at').eq('direction', 'outbound').gte('created_at', monthStart).limit(100000),
    db.from('crm_meetings').select('id', { count: 'exact', head: true }).gte('created_at', monthStart),
    db.from('command_ai_threads').select('id', { count: 'exact', head: true }).gte('created_at', monthStart),
  ])
  const aiRows = (ai.data || []) as Row[]
  const aiMonth = aiRows.reduce((s, r) => s + Number(r.cost_usd || 0), 0)
  const aiToday = aiRows.filter((r) => (r.created_at as string) >= todayStart).reduce((s, r) => s + Number(r.cost_usd || 0), 0)
  const byModel = new Map<string, number>(); const byEndpoint = new Map<string, number>()
  for (const r of aiRows) { byModel.set((r.model as string) || 'unknown', (byModel.get((r.model as string) || 'unknown') || 0) + Number(r.cost_usd || 0)); byEndpoint.set((r.endpoint as string) || 'other', (byEndpoint.get((r.endpoint as string) || 'other') || 0) + Number(r.cost_usd || 0)) }

  const cm = (comms.data || []) as Row[]
  const emailCount = cm.filter((m) => m.channel === 'email').length
  const smsCount = cm.filter((m) => m.channel === 'sms' || m.channel === 'whatsapp').length
  const emailCost = emailCount * EMAIL_RATE, smsCost = smsCount * SMS_RATE, commsMonth = emailCost + smsCost
  const total = aiMonth + commsMonth
  const round = (n: number) => Math.round(n * 100) / 100

  const avgDaily = aiMonth / daysElapsed
  const spike = aiToday > Math.max(1, avgDaily) * 2.5 && aiToday > 1
    ? `Today's AI spend ($${round(aiToday)}) is ${Math.round(aiToday / Math.max(0.01, avgDaily))}× the daily average — worth a look.` : null

  return {
    total_month: round(total), ai_month: round(aiMonth), ai_today: round(aiToday), comms_month: round(commsMonth),
    providers: [
      { name: 'Anthropic (AI)', cost: round(aiMonth) },
      { name: 'Resend (email)', cost: round(emailCost), units: emailCount },
      { name: 'Twilio (SMS)', cost: round(smsCost), units: smsCount },
    ].sort((a, b) => b.cost - a.cost),
    byModel: [...byModel].map(([k, v]) => ({ model: k, cost: round(v) })).sort((a, b) => b.cost - a.cost),
    byEndpoint: [...byEndpoint].map(([k, v]) => ({ endpoint: k, cost: round(v) })).sort((a, b) => b.cost - a.cost).slice(0, 10),
    perUnit: {
      per_ai_conversation: (convos.count || 0) ? round(aiMonth / (convos.count as number)) : 0,
      per_booking: (bookings.count || 0) ? round(total / (bookings.count as number)) : 0,
      emails: emailCount, sms: smsCount, conversations: convos.count || 0, bookings: bookings.count || 0,
    },
    spike,
  }
}
