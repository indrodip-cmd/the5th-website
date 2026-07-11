import { NextRequest, NextResponse } from 'next/server'
import { adminEmail } from '@/lib/session'
import { getSupabaseAdmin } from '@/lib/supabase'
import { sanitizeText } from '@/lib/validation'
import { PROVIDERS, getProvider } from '@/lib/comm/providers'
import { sendMessage, deliver } from '@/lib/comm/engine'
import { setSecret, isEnvSecret } from '@/lib/comm/config'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

async function providerView() {
  const db = getSupabaseAdmin()
  const { data: rows } = await db.from('comm_providers').select('*').order('priority')
  return Promise.all((rows || []).map(async (r) => {
    const a = getProvider(r.slug as string)
    return {
      ...r, configured: a ? await a.isConfigured() : false,
      requiredSecrets: (a?.requiredSecrets || []).map((s) => ({ name: s, fromEnv: isEnvSecret(s) })),
      capabilities: a?.capabilities || r.capabilities,
    }
  }))
}

/* GET ?view=dashboard|messages|providers|templates|senders|domains */
export async function GET(req: NextRequest) {
  if (!adminEmail(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const db = getSupabaseAdmin()
  const sp = new URL(req.url).searchParams
  const view = sp.get('view') || 'dashboard'

  if (view === 'providers') return NextResponse.json({ providers: await providerView() })
  if (view === 'templates') { const { data } = await db.from('comm_templates').select('*').order('updated_at', { ascending: false }); return NextResponse.json({ templates: data || [] }) }
  if (view === 'senders') { const { data } = await db.from('comm_senders').select('*').order('is_default', { ascending: false }); return NextResponse.json({ senders: data || [] }) }
  if (view === 'domains') { const { data } = await db.from('comm_domains').select('*').order('created_at'); return NextResponse.json({ domains: data || [] }) }
  if (view === 'messages') {
    let q = db.from('comm_messages').select('id,channel,provider,to_addr,subject,status,source,contact_email,error,created_at,sent_at').order('created_at', { ascending: false }).limit(120)
    if (sp.get('status')) q = q.eq('status', sp.get('status'))
    if (sp.get('channel')) q = q.eq('channel', sp.get('channel'))
    if (sp.get('q')) { const like = `%${sp.get('q')}%`; q = q.or(`to_addr.ilike.${like},subject.ilike.${like},contact_email.ilike.${like}`) }
    const { data } = await q
    return NextResponse.json({ messages: data || [] })
  }
  // dashboard
  const { data: recent } = await db.from('comm_messages').select('channel,provider,status,created_at').gte('created_at', new Date(Date.now() - 30 * 86400000).toISOString()).limit(5000)
  const rows = recent || []
  const byStatus: Record<string, number> = {}; const byProvider: Record<string, number> = {}
  for (const r of rows) { byStatus[r.status as string] = (byStatus[r.status as string] || 0) + 1; if (r.provider) byProvider[r.provider as string] = (byProvider[r.provider as string] || 0) + 1 }
  const { data: latest } = await db.from('comm_messages').select('id,channel,provider,to_addr,subject,status,created_at').order('created_at', { ascending: false }).limit(10)
  return NextResponse.json({ total: rows.length, byStatus, byProvider, providers: await providerView(), recent: latest || [] })
}

/* POST { action } */
export async function POST(req: NextRequest) {
  const actor = adminEmail(req)
  if (!actor) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const b = await req.json().catch(() => ({}))
  const db = getSupabaseAdmin()
  const action = String(b?.action || '')

  if (action === 'send') {
    if (!b?.to) return NextResponse.json({ error: 'Recipient required' }, { status: 400 })
    const r = await sendMessage({ channel: b.channel || 'email', to: String(b.to), subject: b.subject ? sanitizeText(b.subject, 240) : undefined, html: b.channel === 'sms' ? undefined : b.body, text: b.body, source: 'manual', scheduledAt: b.scheduled_at, contactEmail: b.contact_email })
    return NextResponse.json({ ok: r.status !== 'failed', result: r })
  }
  if (action === 'retry') { const r = await deliver(String(b?.id)); return NextResponse.json({ ok: true, result: r }) }
  if (action === 'cancel') { await db.from('comm_messages').update({ status: 'cancelled', updated_at: new Date().toISOString() }).eq('id', b?.id).in('status', ['queued', 'scheduled']); return NextResponse.json({ ok: true }) }

  if (action === 'save_provider') { await db.from('comm_providers').update({ enabled: b.enabled, priority: b.priority, config: b.config || {}, updated_at: new Date().toISOString() }).eq('slug', b.slug); return NextResponse.json({ ok: true }) }
  if (action === 'save_secret') { if (!b?.name || b?.value == null) return NextResponse.json({ error: 'name+value' }, { status: 400 }); await setSecret(String(b.name), String(b.value)); return NextResponse.json({ ok: true }) }
  if (action === 'health_check') {
    const results = await Promise.all(PROVIDERS.map(async (p) => { const ok = await p.isConfigured(); const status = ok ? 'online' : 'offline'; await db.from('comm_providers').update({ status, last_check: new Date().toISOString(), health: { configured: ok } }).eq('slug', p.slug); return { slug: p.slug, status } }))
    return NextResponse.json({ ok: true, results })
  }

  if (action === 'save_template') {
    const row = { name: sanitizeText(b.name, 120), channel: b.channel || 'email', category: b.category || 'general', subject: b.subject || null, body: b.body || '', variables: b.variables || [], updated_at: new Date().toISOString(), created_by: actor }
    if (b.id) { await db.from('comm_templates').update(row).eq('id', b.id); return NextResponse.json({ ok: true }) }
    const { data } = await db.from('comm_templates').insert(row).select('*').single(); return NextResponse.json({ ok: true, template: data })
  }
  if (action === 'delete_template') { await db.from('comm_templates').delete().eq('id', b?.id); return NextResponse.json({ ok: true }) }
  if (action === 'save_sender') {
    const row = { name: sanitizeText(b.name, 120), email: String(b.email || '').toLowerCase(), reply_to: b.reply_to || null, signature: b.signature || null, enabled: b.enabled !== false, is_default: !!b.is_default }
    if (row.is_default) await db.from('comm_senders').update({ is_default: false }).neq('email', row.email)
    await db.from('comm_senders').upsert(row, { onConflict: 'email' }); return NextResponse.json({ ok: true })
  }
  if (action === 'add_domain') { await db.from('comm_domains').upsert({ domain: String(b.domain || '').toLowerCase() }, { onConflict: 'domain' }); return NextResponse.json({ ok: true }) }

  return NextResponse.json({ error: 'unknown action' }, { status: 400 })
}
