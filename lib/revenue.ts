/* Revenue engine (3I.4) — the normalized, provider-agnostic revenue model the
   Business Command Center reads. Whop (and future Stripe/Razorpay) feed
   recordRevenueEvent(); nothing in the dashboard talks to a provider API. */
import { getSupabaseAdmin } from '@/lib/supabase'
import { emitEvent } from '@/lib/events'
import { resolveContact, logActivity } from '@/lib/crm'
import { recordPurchase, recordRefund } from '@/lib/purchases'
import { notify } from '@/lib/notifications'

type Row = Record<string, unknown>

export interface RevenueEvent {
  provider: string
  external_id?: string
  type: 'sale' | 'refund' | 'renewal' | 'membership_created' | 'membership_cancelled' | 'payout'
  email?: string
  product?: string
  amount: number
  net_amount?: number
  fee?: number
  currency?: string
  occurred_at?: string
  meta?: Row
}

/* Idempotent: unique(provider, external_id, type) prevents double-processing.
   Sale/refund also flow into per-contact purchases + LTV. */
export async function recordRevenueEvent(evt: RevenueEvent): Promise<{ ok: boolean; duplicate?: boolean }> {
  const db = getSupabaseAdmin()
  const contact = evt.email ? await resolveContact({ email: evt.email }) : null
  const contactId = (contact?.id as string) || null

  const { error } = await db.from('revenue_events').insert({
    provider: evt.provider, external_id: evt.external_id || null, type: evt.type,
    contact_id: contactId, product: evt.product || null, amount: evt.amount,
    net_amount: evt.net_amount ?? null, fee: evt.fee ?? null, currency: evt.currency || 'USD',
    occurred_at: evt.occurred_at || new Date().toISOString(), meta: evt.meta || {},
  })
  if (error) {
    if (error.code === '23505') return { ok: true, duplicate: true } // unique violation → already processed
    console.error('recordRevenueEvent failed', error)
    return { ok: false }
  }

  // Per-contact purchase + LTV + timeline
  if (contactId && evt.type === 'sale') {
    await recordPurchase({ contactId, product: evt.product || 'Purchase', amount: evt.amount, currency: evt.currency, provider: evt.provider, externalId: evt.external_id, purchasedAt: evt.occurred_at }, 'webhook')
  } else if (contactId && evt.type === 'refund' && evt.email) {
    await logActivity(evt.email, 'deal', `Refund: ${evt.product || ''}`, `-$${Number(evt.amount).toLocaleString()}`, { provider: evt.provider })
  }

  if (evt.type === 'sale') await notify('sale', `New sale: ${evt.product || 'purchase'}`, `$${Number(evt.amount).toLocaleString()} ${evt.currency || 'USD'}${evt.email ? ` · ${evt.email}` : ''}`)
  else if (evt.type === 'refund') await notify('refund', `Refund: ${evt.product || ''}`, `-$${Number(evt.amount).toLocaleString()}`)
  emitEvent('revenue_recorded', { provider: evt.provider, type: evt.type, amount: evt.amount, email: evt.email })
  return { ok: true }
}

// ── Summaries the dashboard consumes ──
function windowStart(kind: 'today' | 'yesterday' | 'week' | 'month' | 'year'): string {
  const n = new Date()
  if (kind === 'today') return new Date(n.getFullYear(), n.getMonth(), n.getDate()).toISOString()
  if (kind === 'yesterday') return new Date(n.getFullYear(), n.getMonth(), n.getDate() - 1).toISOString()
  if (kind === 'week') return new Date(n.getTime() - 7 * 86400000).toISOString()
  if (kind === 'month') return new Date(n.getFullYear(), n.getMonth(), 1).toISOString()
  return new Date(n.getFullYear(), 0, 1).toISOString()
}

export async function getRevenueSummary() {
  const db = getSupabaseAdmin()
  const [{ data }, membersAgg] = await Promise.all([
    db.from('revenue_events').select('type,amount,product,occurred_at,currency').limit(50000),
    db.from('whop_members').select('usd_total_spent'),
  ])
  const events = (data || []) as Row[]
  // Members' server-calculated LTV = a reliable lifetime figure even before any
  // payment backfill (today/week/month still need dated events).
  const membersLtv = (membersAgg.data || []).reduce((s, m) => s + Number((m as Row).usd_total_spent || 0), 0)
  const sales = events.filter((e) => e.type === 'sale')
  const refunds = events.filter((e) => e.type === 'refund')
  const sum = (rows: Row[], since?: string) => rows.filter((r) => !since || (r.occurred_at as string) >= since).reduce((s, r) => s + Number(r.amount || 0), 0)
  const todayStart = windowStart('today'), yStart = windowStart('yesterday')

  const products = new Map<string, { count: number; revenue: number }>()
  for (const s of sales) { const k = (s.product as string) || 'Unknown'; const c = products.get(k) || { count: 0, revenue: 0 }; c.count++; c.revenue += Number(s.amount || 0); products.set(k, c) }

  const refundTotal = sum(refunds)
  const eventsLifetime = sum(sales)
  // Prefer real payment events; fall back to members' aggregate LTV so Lifetime
  // is never $0 once members are synced (even before a payment backfill).
  const lifetime = eventsLifetime > 0 ? eventsLifetime : Math.round(membersLtv * 100) / 100
  return {
    today: sum(sales, todayStart),
    yesterday: sum(sales.filter((s) => (s.occurred_at as string) < todayStart), yStart),
    week: sum(sales, windowStart('week')),
    month: sum(sales, windowStart('month')),
    year: sum(sales, windowStart('year')),
    lifetime,
    membersLtv: Math.round(membersLtv * 100) / 100,
    refunds: refundTotal,
    netLifetime: lifetime - refundTotal,
    aov: sales.length ? Math.round((eventsLifetime / sales.length) * 100) / 100 : 0,
    salesCount: sales.length,
    topProducts: [...products].map(([product, v]) => ({ product, ...v })).sort((a, b) => b.revenue - a.revenue).slice(0, 6),
  }
}

export async function getBalances() {
  const db = getSupabaseAdmin()
  const { data } = await db.from('revenue_balances').select('*').order('synced_at', { ascending: false }).limit(50)
  // latest snapshot per provider+currency
  const latest = new Map<string, Row>()
  for (const b of data || []) { const k = `${b.provider}::${b.currency}`; if (!latest.has(k)) latest.set(k, b) }
  return [...latest.values()]
}

export async function getRevenueTrend(days = 30): Promise<Array<{ date: string; amount: number }>> {
  const since = new Date(Date.now() - days * 86400000).toISOString()
  const { data } = await getSupabaseAdmin().from('revenue_events').select('amount,occurred_at').eq('type', 'sale').gte('occurred_at', since).limit(20000)
  const byDay = new Map<string, number>()
  for (const e of data || []) { const d = new Date(e.occurred_at as string).toISOString().slice(0, 10); byDay.set(d, (byDay.get(d) || 0) + Number(e.amount || 0)) }
  const out: Array<{ date: string; amount: number }> = []
  for (let i = days - 1; i >= 0; i--) { const d = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10); out.push({ date: d, amount: Math.round((byDay.get(d) || 0) * 100) / 100 }) }
  return out
}
