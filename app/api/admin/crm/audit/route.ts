import { NextRequest, NextResponse } from 'next/server'
import { adminEmail } from '@/lib/session'
import { getSupabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

/* GET — audit log, optionally scoped to ?contact_id=. */
export async function GET(req: NextRequest) {
  if (!adminEmail(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const sp = new URL(req.url).searchParams
  let q = getSupabaseAdmin().from('crm_audit_log').select('*').order('created_at', { ascending: false }).limit(200)
  const contactId = sp.get('contact_id')
  if (contactId) q = q.eq('contact_id', contactId)
  const { data } = await q
  return NextResponse.json({ entries: data || [] })
}
