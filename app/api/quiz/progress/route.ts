import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const { email, day, tasksCompleted, revenueLogged } = await req.json()
    if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 })

    const { data: lead } = await getSupabaseAdmin()
      .from('quiz_leads')
      .select('id, current_day, streak, revenue_logged, last_visit')
      .eq('email', email)
      .single()

    if (!lead) return NextResponse.json({ error: 'Lead not found' }, { status: 404 })

    // Update progress log
    await getSupabaseAdmin().from('quiz_progress').insert({
      lead_id: lead.id,
      day: day || lead.current_day,
      tasks_completed: tasksCompleted || [],
      revenue_logged: revenueLogged || 0
    })

    // Calculate streak
    const today = new Date().toISOString().split('T')[0]
    const lastVisit = lead.last_visit
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
    const newStreak = lastVisit === yesterday ? (lead.streak || 0) + 1 : lastVisit === today ? lead.streak : 1

    // Update lead
    const newDay = Math.min((day || lead.current_day) + 1, 15)
    const newRevenue = (lead.revenue_logged || 0) + (revenueLogged || 0)

    await getSupabaseAdmin().from('quiz_leads').update({
      current_day: tasksCompleted?.length > 0 ? newDay : lead.current_day,
      streak: newStreak,
      revenue_logged: newRevenue,
      last_visit: today
    }).eq('id', lead.id)

    return NextResponse.json({ success: true, current_day: newDay, streak: newStreak, revenue_logged: newRevenue })
  } catch (err) {
    console.error('progress error', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
