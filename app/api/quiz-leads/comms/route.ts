import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { adminEmail } from '@/lib/session'
import { isValidEmail } from '@/lib/validation'

export const dynamic = 'force-dynamic'

/* GET /api/quiz-leads/comms?email=... — the full email/SMS history + open/click
   engagement for one quiz lead. Resolves the lead's CRM contact by email and
   returns every message linked to that contact OR addressed to their email
   (so sequence/broadcast emails are captured even without a contact link).
   Admin-only. */
export async function GET(req: NextRequest) {
  if (!adminEmail(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const email = (req.nextUrl.searchParams.get('email') || '').trim().toLowerCase()
  if (!email || !isValidEmail(email)) return NextResponse.json({ error: 'valid email required' }, { status: 400 })

  const db = getSupabaseAdmin()

  // Resolve the CRM contact (if any) for a stable id link.
  let contactId: string | null = null
  try {
    const { data: c } = await db.from('crm_contacts').select('id').eq('email', email).maybeSingle()
    contactId = (c?.id as string) || null
  } catch { /* non-fatal */ }

  const cols = 'id,channel,direction,to_addr,from_addr,subject,status,provider,source,created_at,sent_at,opened_at,clicked_at'
  const orFilter = contactId ? `contact_id.eq.${contactId},to_addr.eq.${email}` : `to_addr.eq.${email}`

  let rows: Record<string, unknown>[] = []
  try {
    const { data } = await db
      .from('comm_messages')
      .select(cols)
      .or(orFilter)
      .order('created_at', { ascending: false })
      .limit(200)
    rows = data || []
  } catch { rows = [] }

  const outbound = rows.filter((r) => r.direction === 'outbound')
  const sent = outbound.length
  const opened = outbound.filter((r) => r.opened_at || ['opened', 'clicked'].includes(String(r.status))).length
  const clicked = outbound.filter((r) => r.clicked_at || r.status === 'clicked').length
  const replies = rows.filter((r) => r.direction === 'inbound').length
  const openRate = sent ? Math.round((opened / sent) * 100) : 0
  const clickRate = sent ? Math.round((clicked / sent) * 100) : 0
  const engagement = Math.min(100, Math.round(opened * 8 + clicked * 15 + replies * 25))

  return NextResponse.json({
    contactId,
    messages: rows,
    stats: { sent, opened, clicked, replies, openRate, clickRate, engagement },
  })
}
