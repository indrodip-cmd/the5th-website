import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { getSupabaseAdmin } from '@/lib/supabase'
import { adminEmail } from '@/lib/session'
import { sanitizeText } from '@/lib/validation'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

const BUCKET = 'carolina'
const MAX_IMG = 5 * 1024 * 1024
const MAX_PDF = 12 * 1024 * 1024

function extOf(name: string, fallback: string) {
  const m = /\.([a-z0-9]+)$/i.exec(name || '')
  return (m ? m[1] : fallback).toLowerCase()
}

async function analyzePdf(base64: string, title: string) {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })
  const msg = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 900,
    system:
      'You write concise, on-brand sales copy for The5th Consulting (helps women 40+ turn expertise into income; calm, confident, never hypey, never guarantees income). ' +
      'You are given a free lead-magnet PDF. Respond ONLY with minified JSON, no prose.',
    messages: [
      {
        role: 'user',
        content: [
          { type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: base64 } },
          {
            type: 'text',
            text:
              `The resource title is "${title}". Return JSON with keys: ` +
              `"description" (1-2 sentence plain summary of what the reader gets), ` +
              `"selling_points" (array of 3-4 short benefit bullets), ` +
              `"hook" (one punchy persuasive line Carolina can use), ` +
              `"popup_message" (a short, warm proactive chat teaser under 140 chars offering the resource, first person as "Carolina", ending with an inviting question).`,
          },
        ],
      },
    ],
  })
  const text = msg.content.find((b) => b.type === 'text')
  const raw = text && text.type === 'text' ? text.text : '{}'
  try {
    const jsonStr = raw.slice(raw.indexOf('{'), raw.lastIndexOf('}') + 1)
    const parsed = JSON.parse(jsonStr)
    return {
      description: sanitizeText(parsed.description, 600) || null,
      selling_points: Array.isArray(parsed.selling_points) ? parsed.selling_points.slice(0, 5).map((s: unknown) => sanitizeText(s, 160)) : null,
      hook: sanitizeText(parsed.hook, 300) || null,
      popup_message: sanitizeText(parsed.popup_message, 200) || null,
    }
  } catch {
    return { description: null, selling_points: null, hook: null, popup_message: null }
  }
}

export async function POST(req: NextRequest) {
  if (!adminEmail(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const form = await req.formData().catch(() => null)
  if (!form) return NextResponse.json({ error: 'Expected multipart form data.' }, { status: 400 })

  const kind = String(form.get('kind') || '')
  const file = form.get('file')
  if (!(file instanceof File)) return NextResponse.json({ error: 'No file provided.' }, { status: 400 })

  const db = getSupabaseAdmin()
  const buf = Buffer.from(await file.arrayBuffer())

  // ── Avatar image ──
  if (kind === 'avatar') {
    if (buf.length > MAX_IMG) return NextResponse.json({ error: 'Image too large (max 5MB).' }, { status: 400 })
    if (!/^image\//.test(file.type)) return NextResponse.json({ error: 'Please upload an image file.' }, { status: 400 })
    const path = `avatar/${Date.now()}.${extOf(file.name, 'png')}`
    const up = await db.storage.from(BUCKET).upload(path, buf, { contentType: file.type, upsert: true })
    if (up.error) return NextResponse.json({ error: up.error.message }, { status: 500 })
    const url = db.storage.from(BUCKET).getPublicUrl(path).data.publicUrl
    await db.from('carolina_settings').upsert({ id: 1, avatar_url: url, updated_at: new Date().toISOString() }, { onConflict: 'id' })
    return NextResponse.json({ ok: true, avatar_url: url })
  }

  // ── Lead-magnet PDF ──
  if (kind === 'lead_magnet') {
    if (buf.length > MAX_PDF) return NextResponse.json({ error: 'PDF too large (max 12MB).' }, { status: 400 })
    if (file.type !== 'application/pdf') return NextResponse.json({ error: 'Please upload a PDF.' }, { status: 400 })
    const title = sanitizeText(form.get('title'), 160) || file.name.replace(/\.pdf$/i, '')
    const path = `lead-magnets/${Date.now()}.pdf`
    const up = await db.storage.from(BUCKET).upload(path, buf, { contentType: 'application/pdf', upsert: true })
    if (up.error) return NextResponse.json({ error: up.error.message }, { status: 500 })
    const url = db.storage.from(BUCKET).getPublicUrl(path).data.publicUrl

    // Let Claude read the PDF and write the persuasive copy.
    let copy = { description: null as string | null, selling_points: null as string[] | null, hook: null as string | null, popup_message: null as string | null }
    try { copy = await analyzePdf(buf.toString('base64'), title) } catch (e) { console.error('analyzePdf failed', e) }

    const { data: inserted, error } = await db
      .from('carolina_lead_magnets')
      .insert({ title, pdf_url: url, active: true, ...copy })
      .select()
      .single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // Make it the active magnet by default.
    await db.from('carolina_settings').upsert({ id: 1, active_lead_magnet: inserted.id, updated_at: new Date().toISOString() }, { onConflict: 'id' })
    return NextResponse.json({ ok: true, magnet: inserted })
  }

  return NextResponse.json({ error: 'Unknown upload kind.' }, { status: 400 })
}

/* DELETE ?id=<uuid> — remove a lead magnet. */
export async function DELETE(req: NextRequest) {
  if (!adminEmail(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const id = new URL(req.url).searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Missing id.' }, { status: 400 })
  const { error } = await getSupabaseAdmin().from('carolina_lead_magnets').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
