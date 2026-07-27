import { NextRequest, NextResponse } from 'next/server'
import { adminEmail } from '@/lib/session'
import { getSupabaseAdmin } from '@/lib/supabase'
import { roleOf, can, audit } from '@/lib/coaching-security'
import { buildCustomerProfile } from '@/lib/coaching-intelligence'

export const maxDuration = 120
const BUCKET = 'crm' // reuse the existing private CRM bucket (signed URLs)

// Upload a client file into their space (Knowledge Vault). Text files also get
// their contents indexed so the AI can use them.
export async function POST(req: NextRequest) {
  const actor = adminEmail(req)
  if (!actor) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const role = await roleOf(actor)
  if (!can(role, 'ingest')) return NextResponse.json({ error: `Your role (${role}) can't add files.` }, { status: 403 })

  try {
    const form = await req.formData()
    const file = form.get('file')
    const key = String(form.get('contact_key') || '')
    if (!(file instanceof Blob) || !key) return NextResponse.json({ error: 'Missing file or client.' }, { status: 400 })
    const name = (file as File).name || 'file'
    const buf = Buffer.from(await file.arrayBuffer())
    const safe = name.replace(/[^\w.\-]+/g, '_').slice(-80)
    const path = `coaching/${encodeURIComponent(key)}/${Date.now()}-${safe}`
    const db = getSupabaseAdmin()
    const up = await db.storage.from(BUCKET).upload(path, buf, { contentType: (file as File).type || 'application/octet-stream', upsert: false })
    if (up.error) return NextResponse.json({ error: 'Upload failed: ' + up.error.message }, { status: 500 })

    // Index text-ish files so the AI can read them; binaries are just stored.
    let text = ''
    if (/\.(txt|md|csv|vtt|srt|json)$/i.test(name) || (file as File).type?.startsWith('text')) {
      text = buf.toString('utf8').slice(0, 200000)
    }
    await db.from('ci_documents').insert({ contact_key: key, name, doc_type: 'file', url: path, text: text || null })
    audit(actor, 'upload_file', 'client', key, { name }).catch(() => {})
    buildCustomerProfile(key).catch(() => {})
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('ci upload', e instanceof Error ? e.message : e)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
