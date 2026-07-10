import { NextRequest, NextResponse } from 'next/server'
import { adminEmail } from '@/lib/session'
import { getSupabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

/* GET — sync history / logs for one provider. */
export async function GET(req: NextRequest, ctx: { params: Promise<{ provider: string }> }) {
  if (!adminEmail(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { provider } = await ctx.params
  const { data } = await getSupabaseAdmin().from('crm_integration_syncs')
    .select('*').eq('provider', provider).order('started_at', { ascending: false }).limit(50)
  return NextResponse.json({ logs: data || [] })
}
