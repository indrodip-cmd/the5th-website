import { NextRequest, NextResponse } from 'next/server'
import { adminEmail } from '@/lib/session'
import { TEMPLATES } from '@/lib/book-email'

export const dynamic = 'force-dynamic'
/* Admin-only HTML preview of any book email: /api/admin/book/preview?t=chapter1|purchase|c1..c5 */
export async function GET(req: NextRequest) {
  if (!adminEmail(req)) return new NextResponse('Unauthorized', { status: 401 })
  const t = new URL(req.url).searchParams.get('t') || 'chapter1'
  const fn = TEMPLATES[t]; if (!fn) return new NextResponse('Unknown template', { status: 404 })
  const r = fn({ name: 'Maria', unsub: '#', downloadUrl: '#' })
  return new NextResponse(r.html, { headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' } })
}
