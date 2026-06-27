import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { sessionEnabled, sessionEmail } from '@/lib/session'

/* Returns a returning user's ALREADY-SAVED Business DNA Report, authorized by
   the signed session cookie. It never regenerates the AI report — it only reads
   what is stored — so reopening the report costs nothing and is identical every
   time. Also stamps report_viewed_at on first view so the AI Home knows the
   report has been seen.

   Used by /quiz/results to hydrate the page for a returning user whose browser
   sessionStorage no longer holds their answers. */

export const dynamic = 'force-dynamic'

const ARCHETYPE: Record<string, string> = {
  starting: 'The Pioneer', idea: 'The Pioneer', launched: 'The Pathfinder',
  scaling: 'The Builder', established: 'The Luminary',
}

export async function GET(req: NextRequest) {
  try {
    // Without sessions there is no notion of "their" report to return securely.
    if (!sessionEnabled()) return NextResponse.json({ error: 'Sessions are not enabled.' }, { status: 404 })
    const email = sessionEmail(req)
    if (!email) return NextResponse.json({ error: 'Please verify your email to view your report.' }, { status: 401 })

    const supabase = (() => { try { return getSupabaseAdmin() } catch { return null } })()
    if (!supabase) return NextResponse.json({ error: 'Server error' }, { status: 500 })

    const { data: lead } = await supabase
      .from('quiz_leads')
      .select('name, email, roadmap, answers, report_viewed_at')
      .eq('email', email)
      .maybeSingle()

    const roadmap = typeof lead?.roadmap === 'string' && lead.roadmap.length > 200 ? lead.roadmap : ''
    if (!lead || !roadmap) {
      // Authenticated, but nothing saved to show yet.
      return NextResponse.json({ hasReport: false })
    }

    // Stamp first-view time without overwriting an earlier one.
    if (!lead.report_viewed_at) {
      try {
        await supabase.from('quiz_leads')
          .update({ report_viewed_at: new Date().toISOString() })
          .eq('email', email)
          .is('report_viewed_at', null)
      } catch { /* non-fatal */ }
    }

    const answers = (lead.answers && typeof lead.answers === 'object') ? lead.answers as Record<string, string> : {}
    return NextResponse.json({
      hasReport: true,
      cached: true,
      name: lead.name || '',
      email: lead.email || email,
      answers,
      roadmap,
      archetype: ARCHETYPE[String(answers.q1)] || 'The Pioneer',
      personality: (answers.q2 as string) || 'action',
    })
  } catch (err) {
    console.error('quiz/report error', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
