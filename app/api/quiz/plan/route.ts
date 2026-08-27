import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { sessionEmail, sessionEnabled } from '@/lib/session'
import { buildPlan, PLAN_LENGTH, currentUnlockedDay } from '@/lib/plan'

export const dynamic = 'force-dynamic'

/* Resolve the authenticated lead from the signed session cookie. Never trusts a
   body email, so one person can only ever read or change their own plan. */
function authedEmail(req: NextRequest): string | null {
  if (!sessionEnabled()) return null
  return sessionEmail(req)
}

async function loadLead(email: string) {
  const supabase = getSupabaseAdmin()
  const { data } = await supabase
    .from('quiz_leads')
    .select('name, roadmap, plan_started_at, tasks_progress')
    .eq('email', email)
    .maybeSingle()
  return { supabase, data }
}

export async function GET(req: NextRequest) {
  try {
    const email = authedEmail(req)
    if (!email) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

    const { supabase, data } = await loadLead(email)
    if (!data) return NextResponse.json({ error: 'not_found' }, { status: 404 })

    // First visit: anchor the 7-day clock to now so the cadence starts when they
    // actually begin, not when they happened to take the quiz.
    let startedAt = data.plan_started_at as string | null
    if (!startedAt) {
      startedAt = new Date().toISOString()
      // task_email_day = 1: Day 1 is "delivered" the moment they open the board,
      // so the daily cron starts nudging from Day 2 rather than re-announcing Day 1.
      try { await supabase.from('quiz_leads').update({ plan_started_at: startedAt, task_email_day: 1 }).eq('email', email) } catch { /* non-fatal */ }
    }

    const roadmap = typeof data.roadmap === 'string' ? data.roadmap : null
    const progress = (data.tasks_progress as Record<string, Record<string, boolean>> | null) || {}
    const plan = buildPlan({ roadmap, startedAt, progress })

    return NextResponse.json({
      name: (data.name as string) || '',
      ...plan,
    })
  } catch (err) {
    console.error('plan GET error', err)
    return NextResponse.json({ error: 'server_error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const email = authedEmail(req)
    if (!email) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

    const body = await req.json().catch(() => null)
    const day = Number(body?.day)
    const index = Number(body?.index)
    const done = !!body?.done
    if (!Number.isInteger(day) || day < 1 || day > PLAN_LENGTH || !Number.isInteger(index) || index < 0 || index > 20) {
      return NextResponse.json({ error: 'bad_request' }, { status: 400 })
    }

    const { supabase, data } = await loadLead(email)
    if (!data) return NextResponse.json({ error: 'not_found' }, { status: 404 })

    // Can only tick tasks on a day that has actually unlocked.
    const startedAt = (data.plan_started_at as string | null) || new Date().toISOString()
    if (day > currentUnlockedDay(startedAt)) {
      return NextResponse.json({ error: 'locked' }, { status: 403 })
    }

    const progress = (data.tasks_progress as Record<string, Record<string, boolean>> | null) || {}
    const dayKey = String(day)
    progress[dayKey] = { ...(progress[dayKey] || {}), [String(index)]: done }

    const { error } = await supabase.from('quiz_leads').update({ tasks_progress: progress }).eq('email', email)
    if (error) return NextResponse.json({ error: 'save_failed' }, { status: 500 })

    return NextResponse.json({ ok: true, tasks_progress: progress })
  } catch (err) {
    console.error('plan POST error', err)
    return NextResponse.json({ error: 'server_error' }, { status: 500 })
  }
}
