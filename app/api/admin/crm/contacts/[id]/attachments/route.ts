import { NextRequest, NextResponse } from 'next/server'
import { adminEmail } from '@/lib/session'
import { getSupabaseAdmin } from '@/lib/supabase'
import { addAttachment } from '@/lib/crm'

export const dynamic = 'force-dynamic'
export const maxDuration = 30

const BUCKET = 'crm'
const MAX_BYTES = 25 * 1024 * 1024 // 25MB

/* GET
   - ?file=<attachment_id> → 302 redirect to a short-lived signed URL
   - otherwise → list attachments for the contact */
export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  if (!adminEmail(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await ctx.params
  const db = getSupabaseAdmin()
  const fileId = new URL(req.url).searchParams.get('file')
  if (fileId) {
    const { data: att } = await db.from('crm_attachments').select('storage_path').eq('id', fileId).eq('contact_id', id).maybeSingle()
    if (!att) return NextResponse.json({ error: 'Not found.' }, { status: 404 })
    const { data: signed } = await db.storage.from(BUCKET).createSignedUrl(att.storage_path as string, 120)
    if (!signed?.signedUrl) return NextResponse.json({ error: 'Could not sign URL.' }, { status: 500 })
    return NextResponse.redirect(signed.signedUrl)
  }
  const { data } = await db.from('crm_attachments').select('*').eq('contact_id', id).order('created_at', { ascending: false })
  return NextResponse.json({ attachments: data || [] })
}

/* POST — multipart upload (field "file") → private crm bucket + attachment row. */
export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const actor = adminEmail(req)
  if (!actor) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await ctx.params
  const form = await req.formData().catch(() => null)
  const file = form?.get('file')
  if (!(file instanceof File)) return NextResponse.json({ error: 'No file provided.' }, { status: 400 })
  if (file.size > MAX_BYTES) return NextResponse.json({ error: 'File too large (max 25MB).' }, { status: 413 })

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 120) || 'file'
  const path = `${id}/${Date.now()}-${safeName}`
  const buffer = Buffer.from(await file.arrayBuffer())
  const db = getSupabaseAdmin()
  const { error } = await db.storage.from(BUCKET).upload(path, buffer, { contentType: file.type || 'application/octet-stream', upsert: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const attachment = await addAttachment({
    contactId: id, fileName: safeName, mime: file.type || undefined,
    sizeBytes: file.size, storagePath: path, uploadedBy: actor,
  })
  return NextResponse.json({ ok: true, attachment })
}
