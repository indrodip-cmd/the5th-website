import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import { dailyTaskEmail } from '@/lib/email-templates'
import { currentUnlockedDay, taskForDay, PLAN_LENGTH } from '@/lib/plan'

export const dynamic = 'force-dynamic'

const FROM = 'Indrodip | The5th <noreply@10kroadmap.org>'
const DASH_URL = 'https://the5th.consulting/quiz/dashboard'

const getSupabase = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

/* Once a day: for everyone who has started their 7-Day Action Plan (i.e. opened
   the dashboard at least once), email them when a new day unlocks. task_email_day
   tracks the last day we announced, so nobody gets the same day twice and people
   who skip a day just get nudged to the current one. */
export async function GET(req: NextRequest) {
  if (req.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = getSupabase()
  const resend = new Resend(process.env.RESEND_API_KEY || 'placeholder')

  const { data: leads, error } = await supabase
    .from('quiz_leads')
    .select('email, name, roadmap, plan_started_at, task_email_day')
    .not('plan_started_at', 'is', null)
    .lt('task_email_day', PLAN_LENGTH)
    .limit(1000)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  let sent = 0
  for (const lead of leads || []) {
    const started = lead.plan_started_at as string
    const emailed = (lead.task_email_day as number) || 0
    const cur = currentUnlockedDay(started)
    // Nothing new to announce (Day 1 is delivered via the dashboard itself).
    if (cur < 2 || cur <= emailed) continue

    const email = lead.email as string
    const firstName = ((lead.name as string) || '').split(' ')[0] || 'there'
    const roadmap = typeof lead.roadmap === 'string' ? lead.roadmap : null
    const task = taskForDay(roadmap, cur)
    try {
      await resend.emails.send({
        from: FROM,
        to: email,
        subject: `Day ${cur} of your action plan is unlocked`,
        html: dailyTaskEmail(firstName, cur, task, DASH_URL),
        text: `Hi ${firstName},\n\nDay ${cur} of your 7-Day Action Plan is unlocked.\n\nToday: ${task}\n\nOpen your dashboard: ${DASH_URL}\n\n— Indrodip`,
      })
      await supabase.from('quiz_leads').update({ task_email_day: cur }).eq('email', email)
      sent++
    } catch (e) {
      console.error('daily-tasks send failed', email, e)
    }
  }

  return NextResponse.json({ ok: true, scanned: leads?.length || 0, sent })
}
