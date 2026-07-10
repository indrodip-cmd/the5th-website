import { NextRequest, NextResponse } from 'next/server'
import { adminEmail } from '@/lib/session'
import { getSupabaseAdmin } from '@/lib/supabase'
import { whopSyncProducts } from '@/lib/connectors/whop'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

/* GET — synced Whop product catalog. */
export async function GET(req: NextRequest) {
  if (!adminEmail(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { data } = await getSupabaseAdmin().from('whop_products').select('*').order('product_created_at', { ascending: false, nullsFirst: false })
  return NextResponse.json({ products: data || [] })
}

/* POST ?action=sync — full product sync from Whop. */
export async function POST(req: NextRequest) {
  if (!adminEmail(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  return NextResponse.json(await whopSyncProducts())
}
