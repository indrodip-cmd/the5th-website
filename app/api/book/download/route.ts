import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'
import { limit, clientIp } from '@/lib/rateLimit'
import { verifyDownload, logDownload } from '@/lib/book-mail'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/* Tracked, signed download for the book.
   - k=book     the full PDF. Requires a valid signed token (from the purchase
                email), so the file is not guessable or hot-linkable.
   - k=chapter1 the free sample. Open to everyone; a token, when present, just
                attributes the download to the person.
   Every successful download is logged to analytics_events for /admin/book.
   Files are bundled with the function via outputFileTracingIncludes. */
const NAMES = { book: 'Expertise-to-Income.pdf', chapter1: 'Expertise-to-Income-Chapter-1.pdf' } as const
// Literal paths (not computed) so the bundler traces exactly these two files.
const readBook = () => fs.readFile(path.join(process.cwd(), 'ebook', 'expertise-to-income.pdf'))
const readChapter1 = () => fs.readFile(path.join(process.cwd(), 'public', 'documents', 'expertise-to-income-chapter-1.pdf'))

export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const kind = (url.searchParams.get('k') === 'book' ? 'book' : 'chapter1') as keyof typeof NAMES
  const tok = verifyDownload(url.searchParams.get('t'))
  const ip = clientIp(req)
  // Fail open: a limiter or database hiccup must never stop a paying customer's download.
  try { const lim = await limit(`bookdl:${ip}`, 30, 600); if (!lim.ok) return NextResponse.json({ error: 'Too many downloads. Please try again shortly.' }, { status: 429 }) } catch { /* noop */ }

  if (kind === 'book' && (!tok || tok.kind !== 'book')) {
    return new NextResponse('This download link is invalid or has expired. Reply to your purchase email and we will send a new one.', { status: 403, headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
  }
  try {
    const buf = kind === 'book' ? await readBook() : await readChapter1()
    try { await logDownload(kind, tok?.email || null, { ip, ua: req.headers.get('user-agent') || '' }) } catch { /* counting must never block the file */ }
    return new NextResponse(new Uint8Array(buf), {
      status: 200,
      headers: { 'Content-Type': 'application/pdf', 'Content-Disposition': `attachment; filename="${NAMES[kind]}"`, 'Cache-Control': 'private, no-store', 'X-Content-Type-Options': 'nosniff' },
    })
  } catch (e) {
    console.error('book download failed', e)
    return NextResponse.json({ error: 'File unavailable. Please contact support.' }, { status: 500 })
  }
}
