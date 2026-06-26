import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  const supa = createClient(
    'https://hlcvxeujqjhropiignjq.supabase.co',
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  const { data, error } = await supa
    .from('quiz_leads')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ leads: data ?? [] })
}
