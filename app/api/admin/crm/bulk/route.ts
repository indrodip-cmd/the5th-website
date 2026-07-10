import { NextRequest, NextResponse } from 'next/server'
import { adminEmail } from '@/lib/session'
import { sanitizeText } from '@/lib/validation'
import { getSupabaseAdmin } from '@/lib/supabase'
import { addTag, softDeleteContact, audit } from '@/lib/crm'
import { moveOpportunity } from '@/lib/sales'

export const dynamic = 'force-dynamic'

/* Safe bulk actions on contacts (or opportunities for move_stage).
   Body: { action, ids: [], owner?, tags?, stage_id? } */
export async function POST(req: NextRequest) {
  const actor = adminEmail(req)
  if (!actor) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const b = await req.json().catch(() => ({}))
  const action = String(b?.action || '')
  const ids: string[] = Array.isArray(b?.ids) ? b.ids.map(String).slice(0, 500) : []
  if (!action || ids.length === 0) return NextResponse.json({ error: 'action and ids required.' }, { status: 400 })
  const db = getSupabaseAdmin()

  switch (action) {
    case 'assign_owner': {
      const owner = sanitizeText(b?.owner, 120)
      await db.from('crm_contacts').update({ owner: owner || null }).in('id', ids)
      await audit(actor, 'bulk.assign_owner', 'contact', null, null, null, { ids: ids.length, owner })
      return NextResponse.json({ ok: true, updated: ids.length })
    }
    case 'add_tags': {
      const tags: string[] = Array.isArray(b?.tags) ? b.tags.map((t: unknown) => sanitizeText(t, 40)).filter(Boolean) : []
      for (const id of ids) for (const t of tags) await addTag(id, t)
      return NextResponse.json({ ok: true, updated: ids.length })
    }
    case 'delete': {
      for (const id of ids) await softDeleteContact(id, actor)
      return NextResponse.json({ ok: true, deleted: ids.length })
    }
    case 'move_stage': {
      const stageId = String(b?.stage_id || '')
      if (!stageId) return NextResponse.json({ error: 'stage_id required.' }, { status: 400 })
      for (const id of ids) await moveOpportunity(id, stageId, undefined, actor)
      return NextResponse.json({ ok: true, moved: ids.length })
    }
    case 'export': {
      const { data } = await db.from('crm_contacts')
        .select('name,email,phone,company,country,pipeline_stage,lifecycle_stage,lead_score,owner,source,tags,revenue,created_at')
        .in('id', ids)
      const cols = ['name', 'email', 'phone', 'company', 'country', 'pipeline_stage', 'lifecycle_stage', 'lead_score', 'owner', 'source', 'revenue', 'created_at']
      const esc = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`
      const rows = (data || []).map((r) => cols.map((c) => esc((r as Record<string, unknown>)[c])).join(','))
      const csv = [cols.join(','), ...rows].join('\n')
      return NextResponse.json({ ok: true, csv })
    }
    default:
      return NextResponse.json({ error: 'Unknown action.' }, { status: 400 })
  }
}
