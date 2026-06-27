import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { sessionEnabled, sessionEmail } from '@/lib/session'

/* Returns the signed-in person's journey state so the /quiz AI Home can surface
   the single most valuable next step. Authorization comes ONLY from the signed
   session cookie (set after OTP verification) — never a body email, never any
   device fingerprint. When sessions are disabled, or no valid session is
   present, this responds { authenticated: false } and the UI shows the normal
   landing page, so deploying this never changes the live flow until OTP is on. */

export const dynamic = 'force-dynamic'

type Stage = 'client' | 'booked' | 'report_seen' | 'report_unseen' | 'assessing'

export async function GET(req: NextRequest) {
  try {
    // No session secret configured, or no valid cookie → anonymous visitor.
    if (!sessionEnabled()) return NextResponse.json({ authenticated: false })
    const email = sessionEmail(req)
    if (!email) return NextResponse.json({ authenticated: false })

    const supabase = (() => { try { return getSupabaseAdmin() } catch { return null } })()
    if (!supabase) return NextResponse.json({ authenticated: false })

    const { data: lead } = await supabase
      .from('quiz_leads')
      .select('name, email, roadmap, current_day, streak, revenue_logged, call_booked, converted_to_member, report_viewed_at')
      .eq('email', email)
      .maybeSingle()

    // Session is valid but we have no record yet (very rare). Treat as a fresh
    // verified visitor who still needs to complete the assessment.
    if (!lead) {
      return NextResponse.json({ authenticated: true, email, stage: 'assessing', hasReport: false })
    }

    // A real Business DNA Report is the markdown string written by
    // generate-roadmap. The short JSON object some flows pre-write is not it.
    const hasReport = typeof lead.roadmap === 'string' && lead.roadmap.length > 200
    const reportViewed = !!lead.report_viewed_at
    const callBooked = !!lead.call_booked
    const isClient = !!lead.converted_to_member

    const stage: Stage = isClient ? 'client'
      : callBooked ? 'booked'
      : !hasReport ? 'assessing'
      : reportViewed ? 'report_seen'
      : 'report_unseen'

    const name = (lead.name || '').trim()
    return NextResponse.json({
      authenticated: true,
      email,
      name,
      firstName: name.split(' ')[0] || '',
      stage,
      hasReport,
      reportViewed,
      callBooked,
      isClient,
      currentDay: lead.current_day || 1,
      streak: lead.streak || 0,
      revenueLogged: Number(lead.revenue_logged || 0),
    })
  } catch (err) {
    console.error('quiz/me error', err)
    // Fail closed to the normal landing page rather than leaking anything.
    return NextResponse.json({ authenticated: false })
  }
}
