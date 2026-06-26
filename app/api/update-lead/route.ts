import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const getSupabase = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  const supabase = getSupabase()
  try {
    const body = await req.json()
    const { email, ...updates } = body

    if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 })

    const { error } = await supabase
      .from('quiz_leads')
      .update(updates)
      .eq('email', email)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
