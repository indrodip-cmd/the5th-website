import { NextRequest, NextResponse } from 'next/server'
import { adminEmail } from '@/lib/session'
import { sanitizeText } from '@/lib/validation'
import { parseQuery, runSmartSearch } from '@/lib/smart-search'

export const dynamic = 'force-dynamic'
export const maxDuration = 30

/* POST { q } — natural-language contact search. Compiles to a constrained
   JSON filter (never SQL), then runs it safely. Returns the filter for transparency. */
export async function POST(req: NextRequest) {
  if (!adminEmail(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const q = sanitizeText((await req.json().catch(() => ({})))?.q, 300)
  if (!q) return NextResponse.json({ error: 'Query required.' }, { status: 400 })
  const filter = await parseQuery(q)
  const contacts = await runSmartSearch(filter)
  return NextResponse.json({ filter, contacts })
}
