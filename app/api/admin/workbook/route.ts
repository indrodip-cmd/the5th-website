import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { adminEmail } from '@/lib/session'
import { WB_EMAILS } from '@/lib/workbook-campaign'

export const dynamic = 'force-dynamic'

/* Admin-only: The Knowledge Asset buyers + where each one is in the 7-day
   nurture. Buyer data is sensitive, so an authenticated admin session is
   required. Joins workbook_buyers with event_email_log (wb_* keys) to show how
   many campaign emails each person has received. */
export async function GET(req: NextRequest) {
  if (!adminEmail(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const db = getSupabaseAdmin()

  const { data: rows, error } = await db
    .from('workbook_buyers')
    .select('email,name,source,purchased_at,trial_ends_at,quiz_taken,call_booked,unsubscribed,created_at')
    .order('purchased_at', { ascending: false })
    .limit(5000)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Campaign emails received, grouped by buyer.
  const { data: logs } = await db
    .from('event_email_log')
    .select('email,email_key,created_at')
    .like('email_key', 'wb_%')
    .limit(50000)
  const byEmail: Record<string, { keys: Set<string>; last: string | null; at: Record<string, string> }> = {}
  for (const l of logs || []) {
    const e = String(l.email).toLowerCase()
    if (!byEmail[e]) byEmail[e] = { keys: new Set(), last: null, at: {} }
    byEmail[e].keys.add(String(l.email_key))
    byEmail[e].at[String(l.email_key)] = String(l.created_at)
    if (!byEmail[e].last || String(l.created_at) > byEmail[e].last!) byEmail[e].last = String(l.created_at)
  }

  const now = Date.now()
  const totalEmails = WB_EMAILS.length
  const buyers = (rows || []).map((b) => {
    const e = String(b.email).toLowerCase()
    const purchased = b.purchased_at ? new Date(b.purchased_at).getTime() : now
    const daysSince = Math.floor((now - purchased) / 86400000)
    const trialLeft = b.trial_ends_at ? Math.max(0, Math.ceil((new Date(b.trial_ends_at).getTime() - now) / 86400000)) : Math.max(0, 7 - daysSince)
    const log = byEmail[e]
    const sentCount = log ? log.keys.size : 0
    return {
      email: b.email,
      name: b.name,
      source: b.source,
      purchased_at: b.purchased_at,
      trial_ends_at: b.trial_ends_at,
      quiz_taken: !!b.quiz_taken,
      call_booked: !!b.call_booked,
      unsubscribed: !!b.unsubscribed,
      day: daysSince,
      trial_left: trialLeft,
      trial_active: trialLeft > 0,
      sent_count: sentCount,
      total_emails: totalEmails,
      last_email_at: log?.last || null,
      sent_keys: log ? [...log.keys] : [],
      // Per-email timeline for the drawer: every step + when it was sent (if it was).
      timeline: WB_EMAILS.map((def) => ({ key: def.key, day: def.day, subject: def.subject, sent_at: log?.at[def.key] || null })),
    }
  })

  const stats = {
    total: buyers.length,
    trial_active: buyers.filter((b) => b.trial_active && !b.unsubscribed).length,
    quiz_taken: buyers.filter((b) => b.quiz_taken).length,
    call_booked: buyers.filter((b) => b.call_booked).length,
    unsubscribed: buyers.filter((b) => b.unsubscribed).length,
    emails_sent: buyers.reduce((s, b) => s + b.sent_count, 0),
    live: process.env.WORKBOOK_CAMPAIGN_LIVE === 'true',
  }

  return NextResponse.json({ buyers, stats, sequence: WB_EMAILS.map((e) => ({ key: e.key, day: e.day, subject: e.subject })) })
}
