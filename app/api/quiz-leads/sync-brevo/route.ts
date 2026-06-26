import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

interface LeadRow {
  email: string
  name: string
  current_day: number
  streak: number
  revenue_logged: number
  roadmap: { summary?: string } | null
  answers: Record<string, string | string[]>
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as { email?: string }
  const email = body.email
  if (!email) return NextResponse.json({ error: 'email required' }, { status: 400 })

  const supa = createClient(
    'https://hlcvxeujqjhropiignjq.supabase.co',
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  const { data, error } = await supa.from('quiz_leads').select('*').eq('email', email).single()
  if (error || !data) return NextResponse.json({ error: 'Lead not found' }, { status: 404 })

  const lead = data as LeadRow

  const res = await fetch('https://api.brevo.com/v3/contacts', {
    method: 'POST',
    headers: {
      'api-key': process.env.BREVO_API_KEY!,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      email: lead.email,
      firstName: lead.name,
      attributes: {
        FIRSTNAME: lead.name,
        CURRENT_DAY: lead.current_day,
        STREAK: lead.streak,
        REVENUE_LOGGED: lead.revenue_logged,
        QUIZ_COMPLETED: true,
        ROADMAP_SUMMARY: lead.roadmap?.summary ?? '',
        Q1_ROLE: String(lead.answers?.q1 ?? ''),
        Q2_INCOME: String(lead.answers?.q2 ?? ''),
        Q3_CHALLENGE: String(lead.answers?.q3 ?? ''),
      },
      listIds: [3],
      updateEnabled: true,
    }),
  })

  if (!res.ok) {
    const text = await res.text()
    return NextResponse.json({ error: text }, { status: res.status })
  }
  return NextResponse.json({ success: true })
}
