import { NextRequest, NextResponse } from 'next/server'
import { adminEmail } from '@/lib/session'
import { getSupabaseAdmin } from '@/lib/supabase'
import { analyzeMeeting, buildCustomerProfile, askSuccessCoach, contactKeyFrom, importFathom, listFrameworks, upsertFramework, deleteFramework, executiveInsights, performanceTrends, generateSuccessPlan, startRoleplay, roleplayReply, scoreRoleplay, MEETING_TYPES } from '@/lib/coaching-intelligence'

export const maxDuration = 120

// GET: dashboard | meetings | reviews | profiles | profile(&key)
export async function GET(req: NextRequest) {
  const actor = adminEmail(req)
  if (!actor) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const sb = getSupabaseAdmin()
  const url = new URL(req.url)
  const view = url.searchParams.get('view') || 'dashboard'

  try {
    if (view === 'profile') {
      const key = url.searchParams.get('key') || ''
      const [{ data: profile }, { data: meetings }, { data: docs }] = await Promise.all([
        sb.from('ci_customer_profiles').select('*').eq('contact_key', key).maybeSingle(),
        sb.from('ci_meetings').select('id, title, meeting_type, meeting_date, outcome, status, ai_summary, scores').eq('contact_key', key).order('meeting_date', { ascending: false }),
        sb.from('ci_documents').select('id, name, doc_type, created_at').eq('contact_key', key).order('created_at', { ascending: false }),
      ])
      return NextResponse.json({ profile, meetings: meetings || [], docs: docs || [] })
    }
    if (view === 'meeting') {
      const id = url.searchParams.get('id') || ''
      const { data } = await sb.from('ci_meetings').select('*').eq('id', id).maybeSingle()
      return NextResponse.json({ meeting: data })
    }
    if (view === 'frameworks') {
      return NextResponse.json({ frameworks: await listFrameworks(false) })
    }
    if (view === 'insights') {
      return NextResponse.json(await executiveInsights())
    }
    if (view === 'trends') {
      return NextResponse.json(await performanceTrends())
    }
    if (view === 'roleplays') {
      const { data } = await sb.from('ci_roleplays').select('id, scenario, difficulty, score, created_at').eq('created_by', actor).order('created_at', { ascending: false }).limit(50)
      return NextResponse.json({ roleplays: data || [] })
    }
    if (view === 'profiles') {
      const { data } = await sb.from('ci_customer_profiles').select('*').order('health_score', { ascending: true }).limit(300)
      return NextResponse.json({ profiles: data || [] })
    }
    if (view === 'meetings') {
      const { data } = await sb.from('ci_meetings').select('id, title, meeting_type, provider, contact_key, contact_name, contact_email, meeting_date, outcome, status, created_at').order('created_at', { ascending: false }).limit(300)
      return NextResponse.json({ meetings: data || [] })
    }

    // dashboard
    const [{ data: meetings }, { data: profiles }] = await Promise.all([
      sb.from('ci_meetings').select('id, meeting_type, outcome, status, scores, created_at, contact_key').order('created_at', { ascending: false }).limit(500),
      sb.from('ci_customer_profiles').select('contact_key, name, health_score, engagement_score, risk').order('health_score', { ascending: true }).limit(500),
    ])
    const mrows = meetings || []
    const analyzed = mrows.filter((m) => m.status === 'analyzed')
    const avg = (key: string) => {
      const vals = analyzed.map((m) => Number((m.scores as Record<string, number> | null)?.[key])).filter((n) => Number.isFinite(n))
      return vals.length ? Math.round((vals.reduce((s, n) => s + n, 0) / vals.length) * 10) / 10 : null
    }
    const byType: Record<string, number> = {}
    for (const m of mrows) byType[m.meeting_type] = (byType[m.meeting_type] || 0) + 1
    const won = analyzed.filter((m) => m.outcome === 'won').length
    const lost = analyzed.filter((m) => m.outcome === 'lost').length
    return NextResponse.json({
      totals: { meetings: mrows.length, analyzed: analyzed.length, pending: mrows.length - analyzed.length, customers: (profiles || []).length },
      win_rate: won + lost > 0 ? Math.round((won / (won + lost)) * 100) : null,
      won, lost,
      by_type: byType,
      avg_scores: { discovery: avg('discovery'), closing: avg('closing'), listening: avg('active_listening') || avg('listening'), objection: avg('objection_handling') },
      at_risk: (profiles || []).filter((p) => p.risk === 'high').slice(0, 10),
      profiles: (profiles || []).slice(0, 12),
    })
  } catch (e) {
    console.error('coaching-intel GET', e instanceof Error ? e.message : e)
    return NextResponse.json({ error: 'Failed to load' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const actor = adminEmail(req)
  if (!actor) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const sb = getSupabaseAdmin()
  try {
    const body = await req.json().catch(() => ({}))
    const action = String(body?.action || '')

    if (action === 'ingest') {
      const transcript = String(body?.transcript || '').trim()
      if (transcript.length < 40) return NextResponse.json({ error: 'Paste a longer transcript.' }, { status: 400 })
      const type = MEETING_TYPES.includes(body?.meeting_type) ? body.meeting_type : 'other'
      const key = contactKeyFrom(body?.contact_email, body?.contact_name)
      const { data, error } = await sb.from('ci_meetings').insert({
        title: body?.title || null,
        meeting_type: type,
        provider: body?.provider || 'manual',
        contact_key: key,
        contact_name: body?.contact_name || null,
        contact_email: body?.contact_email || null,
        meeting_date: body?.meeting_date || null,
        duration_min: body?.duration_min || null,
        participants: body?.participants || null,
        recording_url: body?.recording_url || null,
        transcript,
        created_by: actor,
      }).select('id').single()
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      // Analyze immediately (best-effort; the row exists either way).
      const r = await analyzeMeeting(data.id as string)
      return NextResponse.json({ ok: true, id: data.id, analyzed: r.ok, analyzeError: r.error })
    }

    if (action === 'analyze') {
      const r = await analyzeMeeting(String(body?.id || ''))
      return NextResponse.json(r.ok ? { ok: true } : { error: r.error }, { status: r.ok ? 200 : 400 })
    }

    if (action === 'classify') {
      const type = MEETING_TYPES.includes(body?.meeting_type) ? body.meeting_type : 'other'
      await sb.from('ci_meetings').update({ meeting_type: type, updated_at: new Date().toISOString() }).eq('id', String(body?.id || ''))
      return NextResponse.json({ ok: true })
    }

    if (action === 'add_document') {
      const key = contactKeyFrom(body?.contact_email, body?.contact_name || body?.contact_key)
      await sb.from('ci_documents').insert({ contact_key: key, name: body?.name || 'Document', doc_type: body?.doc_type || 'note', text: String(body?.text || '').slice(0, 200000), url: body?.url || null })
      buildCustomerProfile(key).catch(() => {})
      return NextResponse.json({ ok: true })
    }

    if (action === 'rebuild_profile') {
      const r = await buildCustomerProfile(String(body?.key || ''))
      return NextResponse.json({ ok: r.ok })
    }

    if (action === 'ask') {
      const answer = await askSuccessCoach(String(body?.key || ''), String(body?.question || ''))
      return NextResponse.json({ answer })
    }

    if (action === 'sync_fathom') {
      const r = await importFathom(Number(body?.since_days) || 30)
      return NextResponse.json(r)
    }

    if (action === 'save_framework') {
      const r = await upsertFramework({ id: body?.id, name: body?.name, kind: body?.kind, body: body?.body, meeting_types: body?.meeting_types, active: body?.active, created_by: actor })
      return NextResponse.json(r)
    }
    if (action === 'delete_framework') {
      return NextResponse.json(await deleteFramework(String(body?.id || '')))
    }
    if (action === 'success_plan') {
      return NextResponse.json(await generateSuccessPlan(String(body?.key || '')))
    }
    if (action === 'roleplay_start') {
      return NextResponse.json(await startRoleplay(String(body?.scenario || 'sales_call'), String(body?.difficulty || 'realistic'), actor))
    }
    if (action === 'roleplay_reply') {
      return NextResponse.json(await roleplayReply(String(body?.id || ''), String(body?.message || '')))
    }
    if (action === 'roleplay_score') {
      return NextResponse.json(await scoreRoleplay(String(body?.id || '')))
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
  } catch (e) {
    console.error('coaching-intel POST', e instanceof Error ? e.message : e)
    return NextResponse.json({ error: 'Request failed' }, { status: 500 })
  }
}
