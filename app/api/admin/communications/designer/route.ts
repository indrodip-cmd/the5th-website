import { NextRequest, NextResponse } from 'next/server'
import { adminEmail } from '@/lib/session'
import { getSupabaseAdmin } from '@/lib/supabase'
import { sanitizeText } from '@/lib/validation'
import { renderEmail, type Brand, type Block } from '@/lib/email/render'
import { generateEmailDesign, reviewDesign } from '@/lib/email/ai'
import { sendMessage } from '@/lib/comm/engine'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

const PERSONAS: Record<string, Record<string, string>> = {
  'New Lead': { first_name: 'Sarah', name: 'Sarah Mitchell', email: 'sarah@example.com', business_type: 'coaching', lead_score: '35', recommended_product: 'Fast Forward' },
  'Fast Forward Customer': { first_name: 'Jeanne', name: 'Jeanne Roberts', email: 'jeanne@example.com', business_type: 'consulting', customer_status: 'active', recommended_product: 'The Collective' },
  'The5th AI Customer': { first_name: 'Angela', name: 'Angela Cruz', email: 'angela@example.com', customer_status: 'active', recommended_product: 'Fast Forward' },
  'Newsletter Subscriber': { first_name: 'there', name: '', email: 'reader@example.com', recommended_product: 'The5th AI' },
}

async function getBrand(): Promise<Brand> {
  const { data } = await getSupabaseAdmin().from('email_brand').select('*').eq('id', 1).maybeSingle()
  return (data as unknown as Brand) || ({ company_name: 'The5th', primary_color: '#3D2645', secondary_color: '#160D1A', accent_color: '#C9A84C', text_color: '#2b2530', bg_color: '#f4f2f6', radius: 12, font: 'Inter, Arial, sans-serif', width: 600 } as Brand)
}

export async function GET(req: NextRequest) {
  if (!adminEmail(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const db = getSupabaseAdmin()
  const sp = new URL(req.url).searchParams
  const view = sp.get('view') || 'list'
  if (view === 'brand') return NextResponse.json({ brand: await getBrand() })
  if (view === 'personas') return NextResponse.json({ personas: Object.keys(PERSONAS) })
  if (view === 'template') {
    const { data } = await db.from('comm_templates').select('*').eq('id', sp.get('id')).maybeSingle()
    return NextResponse.json({ template: data, brand: await getBrand() })
  }
  if (view === 'versions') { const { data } = await db.from('email_template_versions').select('id,version,name,created_by,created_at').eq('template_id', sp.get('id')).order('version', { ascending: false }); return NextResponse.json({ versions: data || [] }) }
  const { data } = await db.from('comm_templates').select('id,name,category,status,subject,updated_at,quality').eq('channel', 'email').order('updated_at', { ascending: false })
  return NextResponse.json({ templates: data || [] })
}

export async function POST(req: NextRequest) {
  const actor = adminEmail(req)
  if (!actor) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const b = await req.json().catch(() => ({}))
  const db = getSupabaseAdmin()
  const action = String(b?.action || '')

  if (action === 'generate') {
    const r = await generateEmailDesign(sanitizeText(b?.prompt, 1500), actor)
    return NextResponse.json(r)
  }
  if (action === 'review') {
    return NextResponse.json(await reviewDesign({ subject: b?.subject, blocks: (b?.design?.blocks as Block[]) || [] }, actor))
  }
  if (action === 'preview') {
    const brand = await getBrand()
    const vars = PERSONAS[b?.persona as string] || undefined
    return NextResponse.json({ html: renderEmail(b?.design || { blocks: [] }, brand, vars) })
  }
  if (action === 'save') {
    const brand = await getBrand()
    const html = renderEmail(b?.design || { blocks: [] }, brand)
    const row: Record<string, unknown> = {
      name: sanitizeText(b?.name, 120) || 'Untitled email', channel: 'email', category: b?.category || 'general',
      subject: b?.subject ? sanitizeText(b.subject, 240) : null, design: b?.design || {}, body: html,
      status: b?.status || 'draft', tags: b?.tags || [], quality: b?.quality || null, updated_at: new Date().toISOString(),
    }
    let id = b?.id as string | undefined
    if (id) { await db.from('comm_templates').update(row).eq('id', id) }
    else { const { data } = await db.from('comm_templates').insert({ ...row, created_by: actor }).select('id').single(); id = data?.id as string }
    return NextResponse.json({ ok: true, id, html })
  }
  if (action === 'publish') {
    const { data: t } = await db.from('comm_templates').select('*').eq('id', b?.id).maybeSingle()
    if (!t) return NextResponse.json({ error: 'not found' }, { status: 404 })
    const version = Number(t.version || 1)
    await db.from('email_template_versions').insert({ template_id: t.id, version, name: t.name, subject: t.subject, design: t.design, html: t.body, created_by: actor })
    await db.from('comm_templates').update({ status: 'published', version: version + 1, updated_at: new Date().toISOString() }).eq('id', b?.id)
    return NextResponse.json({ ok: true })
  }
  if (action === 'duplicate') {
    const { data: t } = await db.from('comm_templates').select('*').eq('id', b?.id).maybeSingle()
    if (!t) return NextResponse.json({ error: 'not found' }, { status: 404 })
    const { data } = await db.from('comm_templates').insert({ name: `${t.name} (copy)`, channel: 'email', category: t.category, subject: t.subject, design: t.design, body: t.body, status: 'draft', created_by: actor }).select('id').single()
    return NextResponse.json({ ok: true, id: data?.id })
  }
  if (action === 'restore_version') {
    const { data: v } = await db.from('email_template_versions').select('*').eq('id', b?.version_id).maybeSingle()
    if (!v) return NextResponse.json({ error: 'not found' }, { status: 404 })
    await db.from('comm_templates').update({ design: v.design, body: v.html, subject: v.subject, name: v.name, updated_at: new Date().toISOString() }).eq('id', v.template_id)
    return NextResponse.json({ ok: true })
  }
  if (action === 'delete') { await db.from('comm_templates').delete().eq('id', b?.id); return NextResponse.json({ ok: true }) }
  if (action === 'send_test') {
    if (!b?.to) return NextResponse.json({ error: 'Recipient required' }, { status: 400 })
    const brand = await getBrand()
    const html = renderEmail(b?.design || { blocks: [] }, brand)
    const r = await sendMessage({ channel: 'email', to: String(b.to), subject: (b?.subject || 'Test email') as string, html, source: 'system', contactEmail: String(b.to) })
    return NextResponse.json({ ok: r.status !== 'failed', result: r })
  }
  if (action === 'save_brand') {
    const allowed = ['company_name', 'logo_url', 'logo_dark_url', 'primary_color', 'secondary_color', 'accent_color', 'text_color', 'bg_color', 'radius', 'font', 'width', 'footer_address', 'support_email', 'privacy_url', 'terms_url', 'unsubscribe_text', 'social']
    const row: Record<string, unknown> = { id: 1, updated_at: new Date().toISOString() }
    for (const k of allowed) if (k in b) row[k] = b[k]
    await db.from('email_brand').upsert(row, { onConflict: 'id' })
    return NextResponse.json({ ok: true })
  }
  return NextResponse.json({ error: 'unknown action' }, { status: 400 })
}
