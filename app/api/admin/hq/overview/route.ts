// app/api/admin/hq/overview/route.ts
// Founder Command Center — single aggregated payload for the whole business.
// Ported from the5th-platform /api/hq. Gated by the website's server-side
// admin session (adminEmail cookie), not a client-passed email.

import { NextRequest, NextResponse } from 'next/server'
import { adminEmail } from '@/lib/session'
import { buildMetrics } from '@/lib/hq/metrics'
import { getWhopRevenue } from '@/lib/hq/whop'
import { getCalBookings } from '@/lib/hq/calcom'
import { getBrevoStats } from '@/lib/hq/brevo'
import { getWiseBalances } from '@/lib/hq/wise'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

export async function POST(req: NextRequest) {
  if (!adminEmail(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const [metrics, whop, calcom, brevo, wise] = await Promise.all([
      buildMetrics(),
      getWhopRevenue(),
      getCalBookings(),
      getBrevoStats(),
      getWiseBalances(),
    ])

    // Revenue is ONLY ever real Whop data. Not connected → zeros + a connect prompt.
    const revenue = { ...whop }

    const bookings = {
      connected: calcom.connected,
      note: calcom.note,
      upcoming: calcom.upcoming,
      upcoming7d: calcom.upcoming7d,
      upcomingTotal: calcom.upcomingTotal,
      booked30d: calcom.booked30d,
      cancelled30d: calcom.cancelled30d,
      noShows30d: calcom.noShows30d,
      recordedCalls30d: metrics.bookings.calls30d,
    }

    return NextResponse.json({
      ...metrics,
      revenue,
      bookings,
      email: brevo,
      cash: wise,
      integrations: {
        whop: whop.connected,
        calcom: calcom.connected,
        brevo: brevo.connected,
        wise: wise.connected,
      },
    })
  } catch (err) {
    console.error('[admin/hq/overview]', err)
    return NextResponse.json({ error: err instanceof Error ? err.message : 'error' }, { status: 500 })
  }
}
