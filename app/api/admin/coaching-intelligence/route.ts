import { NextRequest, NextResponse } from 'next/server'
import { adminEmail } from '@/lib/session'
import { getSupabaseAdmin } from '@/lib/supabase'
import { analyzeMeeting, buildCustomerProfile, askSuccessCoach, contactKeyFrom, importFathom, listFrameworks, upsertFramework, deleteFramework, executiveInsights, performanceTrends, generateSuccessPlan, startRoleplay, roleplayReply, scoreRoleplay, listRubrics, upsertRubric, deleteRubric, buildTimeline, renderMeetingReport, renderCustomerReport, renderMeetingMarkdown, renderCustomerMarkdown, sendFollowupFromMeeting, createTaskFromMeeting, importFireflies, addClient, MEETING_TYPES } from '@/lib/coaching-intelligence'
import { roleOf, can, capsFor, audit, listRoles, setRole, removeRole, getSettings, updateSettings, applyRetention, listAudit, type Cap } from '@/lib/coaching-security'

export const maxDuration = 120

// GET: dashboard | meetings | reviews | profiles | profile(&key)
export async function GET(req: NextRequest) {
  const actor = adminEmail(req)
  if (!actor) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const sb = getSupabaseAdmin()
  const url = new URL(req.url)
  const view = url.searchParams.get('view') || 'dashboard'
  const role = await roleOf(actor)

  try {
    if (view === 'me') {
      return NextResponse.json({ actor, role, caps: capsFor(role), settings: await getSettings() })
    }
    if (view === 'roles') {
      if (!can(role, 'manage_roles')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      return NextResponse.json({ roles: await listRoles() })
    }
    if (view === 'audit') {
      if (!can(role, 'manage_settings')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      return NextResponse.json({ audit: await listAudit(300) })
    }
    if (view === 'settings') {
      return NextResponse.json(await getSettings())
    }
    if (view === 'file') {
      const { data: doc } = await sb.from('ci_documents').select('url, name').eq('id', url.searchParams.get('id') || '').maybeSingle()
      if (!doc?.url) return NextResponse.json({ error: 'Not found' }, { status: 404 })
      const { data: signed } = await sb.storage.from('crm').createSignedUrl(String(doc.url), 300)
      if (!signed?.signedUrl) return NextResponse.json({ error: 'Unavailable' }, { status: 404 })
      return NextResponse.redirect(signed.signedUrl)
    }
    if ((view === 'report' || view === 'export_csv') && !can(role, 'export')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    if (view === 'report') audit(actor, 'export_report', url.searchParams.get('kind') || 'meeting', url.searchParams.get('id') || url.searchParams.get('key') || '').catch(() => {})
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
    if (view === 'rubrics') {
      return NextResponse.json({ rubrics: await listRubrics(false) })
    }
    if (view === 'timeline') {
      return NextResponse.json(await buildTimeline(url.searchParams.get('key') || ''))
    }
    if (view === 'report') {
      const kind = url.searchParams.get('kind'); const fmt = url.searchParams.get('format') || 'html'
      const id = url.searchParams.get('id') || ''; const key = url.searchParams.get('key') || ''
      if (fmt === 'md') {
        const md = kind === 'customer' ? await renderCustomerMarkdown(key) : await renderMeetingMarkdown(id)
        return new Response(md, { headers: { 'Content-Type': 'text/markdown; charset=utf-8', 'Content-Disposition': 'attachment; filename="coaching-report.md"' } })
      }
      const html = kind === 'customer' ? await renderCustomerReport(key) : await renderMeetingReport(id)
      if (fmt === 'doc') return new Response(html, { headers: { 'Content-Type': 'application/msword; charset=utf-8', 'Content-Disposition': 'attachment; filename="coaching-report.doc"' } })
      return new Response(html, { headers: { 'Content-Type': 'text/html; charset=utf-8' } })
    }
    if (view === 'export_csv') {
      const { data } = await sb.from('ci_meetings').select('created_at, meeting_type, contact_name, contact_email, outcome, status').order('created_at', { ascending: false }).limit(2000)
      const rows = data || []
      const header = 'date,type,customer,email,outcome,status'
      const csv = [header, ...rows.map((r) => [r.created_at?.slice(0, 10), r.meeting_type, r.contact_name || '', r.contact_email || '', r.outcome || '', r.status].map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`).join(','))].join('\n')
      return new Response(csv, { headers: { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': 'attachment; filename="coaching-meetings.csv"' } })
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
    const role = await roleOf(actor)
    const CAP: Record<string, Cap> = {
      ingest: 'ingest', analyze: 'analyze', classify: 'analyze', add_document: 'ingest', rebuild_profile: 'analyze', ask: 'ask',
      sync_fathom: 'fathom', sync_fireflies: 'fathom', save_framework: 'manage_content', delete_framework: 'manage_content', success_plan: 'success_plan',
      roleplay_start: 'roleplay', roleplay_reply: 'roleplay', roleplay_score: 'roleplay', save_rubric: 'manage_content', delete_rubric: 'manage_content',
      send_followup: 'actions', create_task: 'actions', set_role: 'manage_roles', remove_role: 'manage_roles', update_settings: 'manage_settings', apply_retention: 'retention', add_client: 'ingest',
    }
    const need = CAP[action]
    if (need && !can(role, need)) return NextResponse.json({ error: `Your role (${role}) can't perform this action.` }, { status: 403 })

    if (action === 'set_role') { const r = await setRole(String(body?.email || ''), body?.role, actor); await audit(actor, 'set_role', 'role', body?.email, { role: body?.role }); return NextResponse.json(r) }
    if (action === 'remove_role') { const r = await removeRole(String(body?.email || '')); await audit(actor, 'remove_role', 'role', body?.email); return NextResponse.json(r) }
    if (action === 'update_settings') { const r = await updateSettings({ retention_days: body?.retention_days, consent_required: body?.consent_required }, actor); await audit(actor, 'update_settings', 'settings', '1', body); return NextResponse.json(r) }
    if (action === 'apply_retention') { const r = await applyRetention(); await audit(actor, 'apply_retention', 'settings', '1', { purged: r.purged }); return NextResponse.json(r) }

    if (action === 'ingest') {
      const transcript = String(body?.transcript || '').trim()
      if (transcript.length < 40) return NextResponse.json({ error: 'Paste a longer transcript.' }, { status: 400 })
      const settings = await getSettings()
      if (settings.consent_required && body?.consent === false) return NextResponse.json({ error: 'Consent is required to ingest recordings (governance policy). Confirm consent to proceed.' }, { status: 400 })
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
        consent: body?.consent !== false,
        created_by: actor,
      }).select('id').single()
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      audit(actor, 'ingest', 'meeting', data.id as string, { type, provider: body?.provider || 'manual' }).catch(() => {})
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

    if (action === 'add_client') {
      const r = await addClient(String(body?.name || ''), String(body?.email || ''))
      if (r.ok) audit(actor, 'add_client', 'client', r.key).catch(() => {})
      return NextResponse.json(r, { status: r.ok ? 200 : 400 })
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
      audit(actor, 'sync_fathom', 'provider', 'fathom', { imported: r.imported }).catch(() => {})
      return NextResponse.json(r)
    }
    if (action === 'sync_fireflies') {
      const r = await importFireflies(Number(body?.since_days) || 30)
      audit(actor, 'sync_fireflies', 'provider', 'fireflies', { imported: r.imported }).catch(() => {})
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
    if (action === 'save_rubric') {
      return NextResponse.json(await upsertRubric({ id: body?.id, name: body?.name, meeting_types: body?.meeting_types, categories: body?.categories || [], active: body?.active, created_by: actor }))
    }
    if (action === 'delete_rubric') {
      return NextResponse.json(await deleteRubric(String(body?.id || '')))
    }
    if (action === 'send_followup') {
      const r = await sendFollowupFromMeeting(String(body?.id || ''))
      return NextResponse.json(r, { status: r.ok ? 200 : 400 })
    }
    if (action === 'create_task') {
      const r = await createTaskFromMeeting(String(body?.id || ''))
      return NextResponse.json(r, { status: r.ok ? 200 : 400 })
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
  } catch (e) {
    console.error('coaching-intel POST', e instanceof Error ? e.message : e)
    return NextResponse.json({ error: 'Request failed' }, { status: 500 })
  }
}
