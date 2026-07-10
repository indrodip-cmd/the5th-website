import { NextRequest, NextResponse } from 'next/server'
import { syncCalcomBookings, syncFathomRecordings } from '@/lib/meetings'
import { runAllSyncs } from '@/lib/integrations'
import { refreshContentStats } from '@/lib/content-attribution'
import { whopSyncProducts, whopSyncMembers } from '@/lib/connectors/whop'

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
  return NextResponse.json({ ok: true, calcom, fathom, integrations, whopProducts, whopMembers, content })
}
