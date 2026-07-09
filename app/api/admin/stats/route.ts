import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { adminEmail } from '@/lib/session'

export async function GET(req: NextRequest) {
  if (!adminEmail(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const url = new URL(req.url)
  const daysRaw = parseInt(url.searchParams.get('days') || '30', 10)
  const days = Number.isFinite(daysRaw) ? Math.min(Math.max(daysRaw, 1), 365) : 30

  const { data, error } = await getSupabaseAdmin().rpc('get_admin_analytics', { days })
  if (error) {
    console.error('admin/stats: rpc failed', JSON.stringify({ code: error.code, message: error.message }))
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json({ stats: data })
}
