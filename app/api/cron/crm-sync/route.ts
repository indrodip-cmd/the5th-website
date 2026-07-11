import { NextRequest, NextResponse } from 'next/server'
import { syncCalcomBookings, syncFathomRecordings } from '@/lib/meetings'
import { runAllSyncs } from '@/lib/integrations'
import { refreshContentStats } from '@/lib/content-attribution'
import { whopSyncProducts, whopSyncMembers } from '@/lib/connectors/whop'
import { syncCoachingIntel } from '@/lib/coaching-intel'
import { processScheduledRuns } from '@/lib/automation/engine'
import { syncMemory, summarizeMonth } from '@/lib/memory/ingest'
import { processQueue } from '@/lib/comm/engine'
import { runHealthAlerts } from '@/lib/alerts'

export const dynamic = 'force-dynamic'
export const maxDuration = 120

/* Single daily CRM sync (fits the Hobby plan's 2-cron / once-daily limits):
   reconcile Cal.com bookings + Fathom recordings, run configured integrations
   (Clarity live; GA4/GSC/ads when creds present), and refresh content stats.
   Everything no-ops safely when its credentials aren't set. */
export async function GET(req: NextRequest) {
  if (req.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const calcom = await syncCalcomBookings().catch((e) => ({ error: String(e) }))
  const fathom = await syncFathomRecordings().catch((e) => ({ error: String(e) }))
  const integrations = await runAllSyncs().catch((e) => ({ error: String(e) })) // includes whop balances
  const whopProducts = await whopSyncProducts().catch((e) => ({ error: String(e) }))
  const whopMembers = await whopSyncMembers().catch((e) => ({ error: String(e) }))
  const content = await refreshContentStats().catch((e) => ({ error: String(e) }))
  // Analyze new Fathom coaching/sales calls into structured coaching intelligence
  // (batched + resumable; safely no-ops without ANTHROPIC_API_KEY).
  const coaching = await syncCoachingIntel(20).catch((e) => ({ error: String(e) }))
  // Resume Automation Studio workflows whose scheduled delays have elapsed.
  const automation = await processScheduledRuns().catch((e) => ({ error: String(e) }))
  // Business Memory: ingest new platform data + roll up this month's digest.
  const memory = await syncMemory(40).catch((e) => ({ error: String(e) }))
  const memorySummary = await summarizeMonth().catch((e) => ({ error: String(e) }))
  // Communication Engine: deliver scheduled + retry-pending messages.
  const comms = await processQueue(60).catch((e) => ({ error: String(e) }))
  const alerts = await runHealthAlerts().catch((e) => ({ error: String(e) }))
  return NextResponse.json({ ok: true, calcom, fathom, integrations, whopProducts, whopMembers, content, coaching, automation, memory, memorySummary, comms, alerts })
}
