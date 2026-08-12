import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { adminEmail } from '@/lib/session'
import { scoreLead } from '@/lib/qualification'

export async function GET(req: NextRequest) {
  // Lead data is sensitive — only an authenticated admin may read it.
  if (!adminEmail(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await getSupabaseAdmin()
    .from('quiz_leads')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Attach a computed lead-qualification score to every lead (single source of
  // truth: lib/qualification). The `answers` jsonb column holds the real quiz
  // answers (quiz_answers is legacy/empty).
  const leads = (data ?? []).map((l) => ({
    ...l,
    qualification: scoreLead((l.answers as Record<string, string | string[]>) || null),
  }))
  return NextResponse.json({ leads })
}
