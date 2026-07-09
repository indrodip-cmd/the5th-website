import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { adminEmail } from '@/lib/session'

export async function GET(req: NextRequest) {
  // Lead data is sensitive — only an authenticated admin may read it.
  if (!adminEmail(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await getSupabaseAdmin()
    .from('quiz_leads')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ leads: data ?? [] })
}
