import { NextRequest, NextResponse } from 'next/server'
import { adminEmail } from '@/lib/session'
import { getSupabaseAdmin } from '@/lib/supabase'
import { EMAILS, EMAIL_BY_KEY } from '@/lib/event-campaign'

export const dynamic = 'force-dynamic'

const TICKET_PRICE = 27

/* Breakthrough Intensive dashboard data: per-email delivery/open/click/bounce
   metrics (real sends only — test sends are never logged) + event sales. */
export async function GET(req: NextRequest) {
  if (!adminEmail(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const db = getSupabaseAdmin()

  const [logRes, regRes] = await Promise.all([
    db.from('event_email_log').select('email_key,delivered_at,opened_at,clicked_at,bounced_at,complained_at,open_count,click_count').limit(20000),
    db.from('event_registrants').select('list,unsubscribed').eq('event_key', 'breakthrough').limit(20000),
  ])
  const logs = logRes.data || []
  const regs = regRes.data || []

  type Agg = { sent: number; delivered: number; opened: number; clicked: number; bounced: number; complained: number; openHits: number; clickHits: number }
  const blank = (): Agg => ({ sent: 0, delivered: 0, opened: 0, clicked: 0, bounced: 0, complained: 0, openHits: 0, clickHits: 0 })
  const byKey: Record<string, Agg> = {}
  const totals = blank()

  for (const r of logs) {
    const k = String(r.email_key)
    const g = (byKey[k] ||= blank())
    const bump = (a: Agg) => {
      a.sent++
      if (r.delivered_at) a.delivered++
      if (r.opened_at) a.opened++
      if (r.clicked_at) a.clicked++
      if (r.bounced_at) a.bounced++
      if (r.complained_at) a.complained++
      a.openHits += Number(r.open_count || 0)
      a.clickHits += Number(r.click_count || 0)
    }
    bump(g)
    bump(totals)
  }

  const pct = (n: number, d: number) => (d > 0 ? Math.round((n / d) * 1000) / 10 : 0)
  const perEmail = EMAILS.map((e) => {
    const g = byKey[e.key] || blank()
    const base = g.delivered || g.sent // open/click rate off delivered when we have it
    return {
      key: e.key,
      subject: e.subject,
      flow: e.flow,
      sent: g.sent,
      delivered: g.delivered,
      opened: g.opened,
      openRate: pct(g.opened, base),
      clicked: g.clicked,
      clickRate: pct(g.clicked, base),
      bounced: g.bounced,
      complained: g.complained,
    }
  }).filter((e) => e.sent > 0 || EMAIL_BY_KEY[e.key]) // keep all defined emails

  // Audience
  const leads = regs.filter((r) => r.list === 'lead' && !r.unsubscribed).length
  const buyers = regs.filter((r) => r.list === 'buyer' && !r.unsubscribed).length
  const unsubscribed = regs.filter((r) => r.unsubscribed).length

  // Sales — fixed $27 ticket
  const tickets = regs.filter((r) => r.list === 'buyer').length
  const revenue = tickets * TICKET_PRICE
  const audienceTotal = leads + buyers
  const conversionRate = pct(buyers, audienceTotal)

  return NextResponse.json({
    ok: true,
    totals: {
      sent: totals.sent,
      delivered: totals.delivered,
      opened: totals.opened,
      openRate: pct(totals.opened, totals.delivered || totals.sent),
      clicked: totals.clicked,
      clickRate: pct(totals.clicked, totals.delivered || totals.sent),
      bounced: totals.bounced,
      complained: totals.complained,
    },
    audience: { leads, buyers, unsubscribed, total: audienceTotal },
    sales: { tickets, revenue, ticketPrice: TICKET_PRICE, conversionRate },
    perEmail,
  })
}
