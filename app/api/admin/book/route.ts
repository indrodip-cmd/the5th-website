import { NextRequest, NextResponse } from 'next/server'
import { adminEmail } from '@/lib/session'
import { getSupabaseAdmin } from '@/lib/supabase'
import { FRONT_BOOK, bump } from '@/lib/funnel/products'
import { KEYS } from '@/lib/book-mail'

export const dynamic = 'force-dynamic'

/* Book customers, Chapter 1 leads, downloads and email performance in one
   report. Built entirely from existing tables:
     revenue_events   purchases (server-confirmed, matched on the Whop plan id)
     event_email_log  every email sent, with open/click timestamps from Resend
     analytics_events 'download' rows written by /api/book/download
     email_unsubscribes, crm_contacts for names and suppression. */
type Log = { email: string; email_key: string; sent_at: string; opened_at: string | null; clicked_at: string | null; bounced_at: string | null; complained_at: string | null }
type Dl = { created_at: string; meta: { kind?: string; email?: string | null } | null }

export async function GET(req: NextRequest) {
  if (!adminEmail(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const days = Math.min(Math.max(Number(new URL(req.url).searchParams.get('days')) || 90, 1), 365)
  const since = new Date(Date.now() - days * 864e5).toISOString()
  const db = getSupabaseAdmin()

  const plans = [FRONT_BOOK.planId, bump()?.bundlePlanId || ''].filter(Boolean)
  const [{ data: logsRaw }, { data: dlRaw }, { data: revRaw }, { data: unsubRaw }] = await Promise.all([
    db.from('event_email_log').select('email,email_key,sent_at,opened_at,clicked_at,bounced_at,complained_at').like('email_key', 'book_%').gte('sent_at', since).limit(50000),
    db.from('analytics_events').select('created_at,meta').eq('event_type', 'download').eq('path', '/api/book/download').gte('created_at', since).limit(50000),
    db.from('revenue_events').select('amount,occurred_at,contact_id,meta,external_id').eq('type', 'sale').gte('occurred_at', since).order('occurred_at', { ascending: false }).limit(5000),
    db.from('email_unsubscribes').select('email').limit(50000),
  ])
  const logs = (logsRaw || []) as Log[]
  const dls = (dlRaw || []) as Dl[]
  const unsub = new Set((unsubRaw || []).map((u) => String(u.email).toLowerCase()))

  // purchases
  const sales = (revRaw || []).filter((r) => plans.includes(String((r.meta as Record<string, unknown>)?.plan_id || '')))
  const ids = [...new Set(sales.map((s) => s.contact_id).filter(Boolean))] as string[]
  const { data: cons } = ids.length ? await db.from('crm_contacts').select('id,email,name').in('id', ids) : { data: [] as { id: string; email: string; name: string | null }[] }
  const byId = new Map((cons || []).map((c) => [c.id, c]))

  const logBy = new Map<string, Log[]>()
  for (const l of logs) { const k = l.email.toLowerCase(); logBy.set(k, [...(logBy.get(k) || []), l]) }
  const dlCount = (email: string, kind: string) => dls.filter((d) => d.meta?.kind === kind && (d.meta?.email || '').toLowerCase() === email).length
  const lastDl = (email: string, kind: string) => dls.filter((d) => d.meta?.kind === kind && (d.meta?.email || '').toLowerCase() === email).map((d) => d.created_at).sort().pop() || null
  const row = (email: string, key: string) => (logBy.get(email) || []).find((l) => l.email_key === key)

  const buyers = sales.map((s) => {
    const c = byId.get(String(s.contact_id)); const email = (c?.email || '').toLowerCase()
    const mail = email ? row(email, KEYS.purchase) : undefined
    return { email: email || '(unknown)', name: c?.name || null, amount: Number(s.amount) || 0, at: s.occurred_at, emailed: !!mail, emailedAt: mail?.sent_at || null, opened: !!mail?.opened_at, clicked: !!mail?.clicked_at, downloads: email ? dlCount(email, 'book') : 0, lastDownload: email ? lastDl(email, 'book') : null, bundle: String((s.meta as Record<string, unknown>)?.plan_id || '') === bump()?.bundlePlanId }
  })
  const buyerSet = new Set(buyers.map((b) => b.email))

  const leadRows = logs.filter((l) => l.email_key === KEYS.chapter1).sort((a, b) => b.sent_at.localeCompare(a.sent_at))
  const leads = leadRows.map((l) => {
    const email = l.email.toLowerCase(); const steps = [1, 2, 3, 4, 5].map((n) => row(email, KEYS.step(n)))
    return { email, at: l.sent_at, opened: !!l.opened_at, clicked: !!l.clicked_at, downloads: dlCount(email, 'chapter1'), campaignSent: steps.filter(Boolean).length, lastStep: steps.reduce((m, s, i) => (s ? i + 1 : m), 0), campaignOpened: steps.filter((s) => s?.opened_at).length, bought: buyerSet.has(email), unsubscribed: unsub.has(email), bounced: !!l.bounced_at }
  })

  const stat = (key: string) => { const r = logs.filter((l) => l.email_key === key); const sent = r.length; return { sent, opened: r.filter((x) => x.opened_at).length, clicked: r.filter((x) => x.clicked_at).length, bounced: r.filter((x) => x.bounced_at).length, complained: r.filter((x) => x.complained_at).length } }
  const emails = [
    { key: KEYS.chapter1, label: 'Chapter 1 delivery', ...stat(KEYS.chapter1) },
    ...[1, 2, 3, 4, 5].map((n) => ({ key: KEYS.step(n), label: `Campaign ${n}`, ...stat(KEYS.step(n)) })),
    { key: KEYS.purchase, label: 'Purchase delivery', ...stat(KEYS.purchase) },
  ]

  const byDay: Record<string, { chapter1: number; book: number }> = {}
  for (const d of dls) { const day = d.created_at.slice(0, 10); const o = (byDay[day] ||= { chapter1: 0, book: 0 }); if (d.meta?.kind === 'book') o.book++; else o.chapter1++ }

  const leadEmails = new Set(leads.map((l) => l.email))
  const revenue = buyers.reduce((s, b) => s + b.amount, 0)
  return NextResponse.json({
    days, generatedAt: new Date().toISOString(),
    kpis: {
      leads: leads.length, chapter1Downloads: dls.filter((d) => d.meta?.kind !== 'book').length, chapter1Downloaders: new Set(dls.filter((d) => d.meta?.kind !== 'book' && d.meta?.email).map((d) => d.meta!.email!.toLowerCase())).size,
      buyers: buyers.length, revenue: Math.round(revenue * 100) / 100, bookDownloads: dls.filter((d) => d.meta?.kind === 'book').length,
      buyersWhoDownloaded: buyers.filter((b) => b.downloads > 0).length, leadsWhoBought: [...buyerSet].filter((e) => leadEmails.has(e)).length,
      leadToBuyer: leads.length ? [...buyerSet].filter((e) => leadEmails.has(e)).length / leads.length : 0,
      emailsSent: logs.length, unsubscribedLeads: leads.filter((l) => l.unsubscribed).length,
    },
    emails, buyers: buyers.slice(0, 200), leads: leads.slice(0, 300),
    downloadsByDay: Object.entries(byDay).sort(([a], [b]) => a.localeCompare(b)).map(([date, v]) => ({ date, ...v })),
    notes: { opensTracked: logs.some((l) => l.opened_at), plansConfigured: plans.length > 0 },
  })
}
