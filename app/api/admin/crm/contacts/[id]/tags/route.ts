import { NextRequest, NextResponse } from 'next/server'
import { adminEmail } from '@/lib/session'
import { sanitizeText } from '@/lib/validation'
import { addTag, removeTag, setTags } from '@/lib/crm'

export const dynamic = 'force-dynamic'

/* POST — add a single tag ({ name, color? }). */
export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  if (!adminEmail(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await ctx.params
  const b = await req.json().catch(() => ({}))
  const name = sanitizeText(b?.name, 40)
  if (!name) return NextResponse.json({ error: 'Tag name required.' }, { status: 400 })
  await addTag(id, name, typeof b?.color === 'string' ? b.color : undefined)
  return NextResponse.json({ ok: true })
}

/* PUT — replace a contact's full tag set ({ tags: [] }). */
export async function PUT(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  if (!adminEmail(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await ctx.params
  const b = await req.json().catch(() => ({}))
  const tags = Array.isArray(b?.tags) ? b.tags.map((t: unknown) => sanitizeText(t, 40)).filter(Boolean) : []
  await setTags(id, tags)
  return NextResponse.json({ ok: true })
}

/* DELETE ?name= — remove a tag. */
export async function DELETE(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  if (!adminEmail(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await ctx.params
  const name = new URL(req.url).searchParams.get('name')
  if (!name) return NextResponse.json({ error: 'name required.' }, { status: 400 })
  await removeTag(id, name)
  return NextResponse.json({ ok: true })
}
