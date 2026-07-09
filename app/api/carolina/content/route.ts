import { NextRequest, NextResponse } from 'next/server'
import { listContent, searchContent, getCategories } from '@/lib/cms'
import { sanitizeText } from '@/lib/validation'

export const dynamic = 'force-dynamic'

/* Public Content API used by the widget (and future apps).
   /api/carolina/content?type=program&featured=true
   /api/carolina/content?q=funnel            (search)
   /api/carolina/content?categories=1&type=knowledge  (taxonomy) */
export async function GET(req: NextRequest) {
  const u = new URL(req.url)
  const q = sanitizeText(u.searchParams.get('q'), 120)

  if (u.searchParams.get('categories')) {
    const cats = await getCategories(u.searchParams.get('type') || undefined)
    return NextResponse.json({ categories: cats }, { headers: { 'Cache-Control': 'public, max-age=60, s-maxage=300' } })
  }

  if (q) {
    const results = await searchContent(q, {
      type: u.searchParams.get('type') || undefined,
      limit: Math.min(Number(u.searchParams.get('limit')) || 12, 30),
    })
    return NextResponse.json({ results })
  }

  const items = await listContent({
    type: u.searchParams.get('type') || undefined,
    category: u.searchParams.get('category') || undefined,
    tag: u.searchParams.get('tag') || undefined,
    featured: u.searchParams.get('featured') === 'true' ? true : undefined,
    limit: Math.min(Number(u.searchParams.get('limit')) || 50, 100),
    offset: Number(u.searchParams.get('offset')) || 0,
  })
  return NextResponse.json({ items }, { headers: { 'Cache-Control': 'public, max-age=45, s-maxage=120' } })
}
