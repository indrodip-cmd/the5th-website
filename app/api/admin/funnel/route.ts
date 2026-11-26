import { NextRequest, NextResponse } from 'next/server'
import { adminEmail } from '@/lib/session'
import { getSupabaseAdmin } from '@/lib/supabase'
import { FRONT_BOOK, bump } from '@/lib/funnel/products'

export const dynamic = 'force-dynamic'

/* Book-funnel report: conversion, CTR, checkout, revenue and AOV, split by
   A/B variant, device and traffic source. Reads the first-party event stream
   (analytics_events) for behaviour and revenue_events (Whop webhook) for money,
   so revenue is real, server-confirmed revenue, not browser-reported. */
type Ev = { visitor_id: string | null; event_type: string; path: string | null; meta: Record<string, unknown> | null; created_at: string }
type Row = { visitors: Set<string>; cta: Set<string>; checkout: Set<string>; paid: Set<string>; leads: Set<string> }
const mk = (): Row => ({ visitors: new Set(), cta: new Set(), checkout: new Set(), paid: new Set(), leads: new Set() })

export async function GET(req: NextRequest) {
  if (!adminEmail(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const days = Math.min(Math.max(Number(new URL(req.url).searchParams.get('days')) || 30, 1), 180)
  const since = new Date(Date.now() - days * 864e5).toISOString()
  const db = getSupabaseAdmin()

  const { data: evs } = await db.from('analytics_events')
    .select('visitor_id,event_type,path,meta,created_at').gte('created_at', since)
    .or('path.eq./book,path.like./book/%').order('created_at', { ascending: false }).limit(60000)
  const events = (evs || []) as Ev[]

  const plans = [FRONT_BOOK.planId, bump()?.bundlePlanId || ''].filter(Boolean)
  const revenue = { orders: 0, gross: 0, bumpOrders: 0 }
  const revByDay: Record<string, number> = {}
  const revByVariant: Record<string, { orders: number; revenue: number }> = {}
  if (plans.length) {
    const { data: rev } = await db.from('revenue_events').select('amount,type,meta,occurred_at').eq('type', 'sale').gte('occurred_at', since).limit(20000)
    for (const r of rev || []) {
      const pid = String((r.meta as Record<string, unknown>)?.plan_id || '')
      if (!plans.includes(pid)) continue
      revenue.orders++; revenue.gross += Number(r.amount) || 0
      if (pid === bump()?.bundlePlanId) revenue.bumpOrders++
      const d = String(r.occurred_at).slice(0, 10); revByDay[d] = (revByDay[d] || 0) + (Number(r.amount) || 0)
      const exp = String(((r.meta as Record<string, unknown>)?.checkout_meta as Record<string, unknown> | undefined)?.exp || '')
      for (const part of exp.split(',')) if (part) { const v = (revByVariant[part] ||= { orders: 0, revenue: 0 }); v.orders++; v.revenue += Number(r.amount) || 0 }
    }
  }

  const total = mk()
  const by = { variant: {} as Record<string, Row>, device: {} as Record<string, Row>, source: {} as Record<string, Row> }
  const bucket = (g: Record<string, Row>, k: string) => (g[k] ||= mk())
  const exps: Record<string, string> = {}
  const clicks: Record<string, number> = {}
  const sections: Record<string, Set<string>> = {}

  for (const e of events) {
    const m = (e.meta || {}) as Record<string, unknown>
    const name = String(m.name || ''), vid = e.visitor_id || ''
    if (!vid) continue
    if (name === 'book_landing_view') {
      total.visitors.add(vid)
      const exp = String(m.exp || '')
      exps[vid] = exp
      for (const part of exp.split(',')) if (part) bucket(by.variant, part).visitors.add(vid)
      bucket(by.device, String(m.device || 'unknown')).visitors.add(vid)
      bucket(by.source, String(m.src || 'direct')).visitors.add(vid)
    }
  }
  const dims = (vid: string): Row[] => {
    const out: Row[] = [total]
    const exp = exps[vid] || ''
    for (const part of exp.split(',')) if (part && by.variant[part]) out.push(by.variant[part])
    return out
  }
  const devOf: Record<string, string> = {}, srcOf: Record<string, string> = {}
  for (const e of events) { const m = (e.meta || {}) as Record<string, unknown>; if (m.name === 'book_landing_view' && e.visitor_id) { devOf[e.visitor_id] = String(m.device || 'unknown'); srcOf[e.visitor_id] = String(m.src || 'direct') } }
  const mark = (vid: string, f: keyof Row) => {
    for (const r of dims(vid)) r[f].add(vid)
    if (devOf[vid]) by.device[devOf[vid]]?.[f].add(vid)
    if (srcOf[vid]) by.source[srcOf[vid]]?.[f].add(vid)
  }
  for (const e of events) {
    const m = (e.meta || {}) as Record<string, unknown>; const name = String(m.name || ''), vid = e.visitor_id || ''
    if (!vid) continue
    if (name === 'book_cta_click') { mark(vid, 'cta'); const w = String(m.where || 'unknown'); clicks[w] = (clicks[w] || 0) + 1 }
    else if (name === 'book_checkout_view' || name === 'book_checkout_started') mark(vid, 'checkout')
    else if (name === 'book_payment_success') mark(vid, 'paid')
    else if (name === 'book_lead') mark(vid, 'leads')
    else if (name === 'book_section_view') { const s = String(m.section || ''); (sections[s] ||= new Set()).add(vid) }
  }

  const fin = (r: Row) => ({ visitors: r.visitors.size, cta: r.cta.size, checkout: r.checkout.size, purchases: r.paid.size, leads: r.leads.size,
    ctr: r.visitors.size ? r.cta.size / r.visitors.size : 0, checkoutRate: r.visitors.size ? r.checkout.size / r.visitors.size : 0, cvr: r.visitors.size ? r.paid.size / r.visitors.size : 0 })
  const table = (g: Record<string, Row>) => Object.entries(g).map(([k, r]) => ({ key: k, ...fin(r) })).sort((a, b) => b.visitors - a.visitors)
  const visitors = total.visitors.size
  return NextResponse.json({
    days, generatedAt: new Date().toISOString(),
    summary: { ...fin(total), orders: revenue.orders, revenue: Math.round(revenue.gross * 100) / 100, aov: revenue.orders ? Math.round((revenue.gross / revenue.orders) * 100) / 100 : 0, revenuePerVisitor: visitors ? Math.round((revenue.gross / visitors) * 100) / 100 : 0, bumpTakeRate: revenue.orders ? revenue.bumpOrders / revenue.orders : 0 },
    variants: table(by.variant).map((v) => ({ ...v, orders: revByVariant[v.key]?.orders || 0, revenue: Math.round((revByVariant[v.key]?.revenue || 0) * 100) / 100, revenuePerVisitor: v.visitors ? Math.round(((revByVariant[v.key]?.revenue || 0) / v.visitors) * 100) / 100 : 0 })), devices: table(by.device), sources: table(by.source),
    ctaWhere: Object.entries(clicks).sort((a, b) => b[1] - a[1]).map(([where, n]) => ({ where, clicks: n })),
    sections: Object.entries(sections).map(([section, s]) => ({ section, visitors: s.size, reach: visitors ? s.size / visitors : 0 })).sort((a, b) => b.visitors - a.visitors),
    revenueByDay: Object.entries(revByDay).sort(([a], [b]) => a.localeCompare(b)).map(([date, amount]) => ({ date, amount })),
    notes: { purchasesCountClientConfirmed: true, revenueSource: 'Whop webhook (revenue_events), matched on plan id', planIdsConfigured: plans.length > 0 },
  })
}
