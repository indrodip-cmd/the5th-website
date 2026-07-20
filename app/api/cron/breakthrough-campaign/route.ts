import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { SCHEDULE, EMAIL_BY_KEY } from '@/lib/event-campaign'
import { sendCampaignEmail, unsubUrlFor } from '@/lib/event-enroll'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

/* Daily scheduler for the Breakthrough Intensive campaign.

   Runs once a day (Vercel cron). For every scheduled email whose date has
   arrived, it sends to the right audience — presale emails to leads
   (list='lead'), onboard emails to buyers (list='buyer') — exactly once per
   recipient (unique(email,email_key) in event_email_log makes it idempotent).

   SAFETY: does nothing unless EVENT_CAMPAIGN_LIVE === 'true'. That gate lets
   us build + test the whole campaign without a single real send. */

export async function GET(req: NextRequest) {
  if (req.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }
  if (process.env.EVENT_CAMPAIGN_LIVE !== 'true') {
    return NextResponse.json({ ok: true, skipped: 'campaign not live (set EVENT_CAMPAIGN_LIVE=true)' })
  }

  const today = new Date().toISOString().slice(0, 10)
  const due = SCHEDULE.filter((s) => s.date <= today)
  if (!due.length) return NextResponse.json({ ok: true, due: 0 })

  const db = getSupabaseAdmin()
  const summary: Record<string, { sent: number; skipped: number; errors: number }> = {}

  for (const item of due) {
    const def = EMAIL_BY_KEY[item.key]
    if (!def) continue
    const list = def.flow === 'presale' ? 'lead' : 'buyer'
    summary[item.key] = { sent: 0, skipped: 0, errors: 0 }

    const { data: people } = await db
      .from('event_registrants')
      .select('email,name')
      .eq('event_key', 'breakthrough')
      .eq('list', list)
      .eq('unsubscribed', false)
      .limit(5000)

    for (const person of people || []) {
      const email = String(person.email).toLowerCase()
      // Idempotency: already logged?
      const { data: seen } = await db.from('event_email_log').select('id').eq('email', email).eq('email_key', item.key).maybeSingle()
      if (seen) {
        summary[item.key].skipped++
        continue
      }
      const r = await sendCampaignEmail({ key: item.key, to: email, name: person.name || undefined, log: true, unsubUrl: unsubUrlFor(email) })
      if (r.ok) summary[item.key].sent++
      else summary[item.key].errors++
    }
  }

  return NextResponse.json({ ok: true, date: today, summary })
}
