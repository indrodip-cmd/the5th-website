import { NextRequest, NextResponse } from 'next/server'
import { getBySlug, getRelated } from '@/lib/cms'

export const dynamic = 'force-dynamic'

/* Single content item by slug, with its related content — rendered in-chat. */
export async function GET(_req: NextRequest, ctx: { params: Promise<{ slug: string }> }) {
  const { slug } = await ctx.params
  const item = await getBySlug(slug)
  if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  const related = await getRelated(item.id)
  return NextResponse.json({ item, related }, { headers: { 'Cache-Control': 'public, max-age=45, s-maxage=120' } })
}
