import { NextRequest, NextResponse } from 'next/server'
import { adminEmail } from '@/lib/session'
import { getSupabaseAdmin } from '@/lib/supabase'
import { sanitizeText } from '@/lib/validation'
import { countAudience, sendCampaign, enrollContact, reviewCampaign, campaignStats, campaignChecklist, type Audience } from '@/lib/comm/campaigns'
import { processQueue } from '@/lib/comm/engine'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

export async function GET(req: NextRequest) {
  if (!adminEmail(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const db = getSupabaseAdmin()
  const sp = new URL(req.url).searchParams
  const view = sp.get('view') || 'all'
  if (view === 'sequence') {
    const id = sp.get('id')
    const [{ data: seq }, { data: steps }, { count: enrolled }] = await Promise.all([
      db.from('comm_sequences').select('*').eq('id', id).maybeSingle(),
      db.from('comm_sequence_steps').select('*').eq('sequence_id', id).order('step_order'),
      db.from('comm_sequence_enrollments').select('id', { count: 'exact', head: true }).eq('sequence_id', id),
    ])
    return NextResponse.json({ sequence: seq, steps: steps || [], enrolled: enrolled || 0 })
  }
  if (view === 'review') return NextResponse.json({ review: await reviewCampaign(sp.get('id') || '') })
  if (view === 'stats') return NextResponse.json({ stats: await campaignStats(sp.get('id') || ''), checklist: await campaignChecklist(sp.get('id') || '') })
  const [campaigns, sequences, templates] = await Promise.all([
    db.from('comm_campaigns').select('*').order('created_at', { ascending: false }),
    db.from('comm_sequences').select('*').order('created_at', { ascending: false }),
    db.from('comm_templates').select('id,name,subject').eq('channel', 'email').order('updated_at', { ascending: false }),
  ])
  return NextResponse.json({ campaigns: campaigns.data || [], sequences: sequences.data || [], templates: templates.data || [] })
}

export async function POST(req: NextRequest) {
  const actor = adminEmail(req)
  if (!actor) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const b = await req.json().catch(() => ({}))
  const db = getSupabaseAdmin()
  const action = String(b?.action || '')

  if (action === 'audience_count') return NextResponse.json({ count: await countAudience((b?.audience as Audience) || {}) })

  if (action === 'save_campaign') {
    const row: Row = { name: sanitizeText(b?.name, 120) || 'Untitled campaign', template_id: b?.template_id || null, subject: b?.subject || null, audience: b?.audience || {}, scheduled_at: b?.scheduled_at || null, status: b?.scheduled_at ? 'scheduled' : 'draft', updated_at: new Date().toISOString() }
    if (b?.id) { await db.from('comm_campaigns').update(row).eq('id', b.id); return NextResponse.json({ ok: true, id: b.id }) }
    const { data } = await db.from('comm_campaigns').insert({ ...row, created_by: actor }).select('id').single()
    return NextResponse.json({ ok: true, id: data?.id })
  }
  if (action === 'send_campaign') {
    if (b?.require_ready) { const cl = await campaignChecklist(String(b?.id)); if (!cl.filter((x) => x.critical).every((x) => x.ok)) return NextResponse.json({ error: 'Pre-launch checks failed', checklist: cl }, { status: 400 }) }
    await db.from('comm_campaigns').update({ status: 'sending' }).eq('id', b?.id)
    const r = await sendCampaign(String(b?.id))
    // Immediate send for small campaigns (don't wait for the daily cron).
    if (r.queued > 0 && r.queued <= 300) await processQueue(r.queued).catch(() => {})
    return NextResponse.json({ ok: true, ...r })
  }
  if (action === 'delete_campaign') { await db.from('comm_campaigns').delete().eq('id', b?.id); return NextResponse.json({ ok: true }) }

  if (action === 'save_sequence') {
    const row: Row = { name: sanitizeText(b?.name, 120) || 'Untitled sequence', description: b?.description || null, status: b?.status || 'draft', updated_at: new Date().toISOString() }
    if (b?.id) { await db.from('comm_sequences').update(row).eq('id', b.id); return NextResponse.json({ ok: true, id: b.id }) }
    const { data } = await db.from('comm_sequences').insert({ ...row, created_by: actor }).select('id').single()
    return NextResponse.json({ ok: true, id: data?.id })
  }
  if (action === 'toggle_sequence') { await db.from('comm_sequences').update({ status: b?.status || 'paused', updated_at: new Date().toISOString() }).eq('id', b?.id); return NextResponse.json({ ok: true }) }
  if (action === 'delete_sequence') { await db.from('comm_sequences').delete().eq('id', b?.id); return NextResponse.json({ ok: true }) }
  if (action === 'add_step') {
    const { count } = await db.from('comm_sequence_steps').select('id', { count: 'exact', head: true }).eq('sequence_id', b?.sequence_id)
    await db.from('comm_sequence_steps').insert({ sequence_id: b?.sequence_id, step_order: count || 0, template_id: b?.template_id || null, subject: b?.subject || null, delay_hours: Number(b?.delay_hours) || 24 })
    return NextResponse.json({ ok: true })
  }
  if (action === 'delete_step') { await db.from('comm_sequence_steps').delete().eq('id', b?.id); return NextResponse.json({ ok: true }) }
  if (action === 'enroll') { return NextResponse.json(await enrollContact(String(b?.sequence_id), { contactId: b?.contact_id, email: b?.email })) }

  return NextResponse.json({ error: 'unknown action' }, { status: 400 })
}
type Row = Record<string, unknown>
