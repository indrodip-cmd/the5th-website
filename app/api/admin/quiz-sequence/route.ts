import { NextRequest, NextResponse } from 'next/server'
import { adminEmail } from '@/lib/session'
import { STEPS, renderStep } from '@/lib/quiz/audit-emails'
import { deliver } from '@/lib/quiz/audit-mail'
import { decode, score } from '@/lib/quiz/engine'
import { unsubscribeUrl } from '@/lib/comm/unsubscribe'

export const dynamic = 'force-dynamic'

/* Admin: GET ?n=1..14 -> rendered HTML preview (no n -> schedule list).
   POST {n, code?} -> test-send that email to the signed-in admin only. */
function sample(code?: string | null) {
  const a = code ? decode(code) : null
  return a ? score(a) : null
}

export async function GET(req: NextRequest) {
  if (!adminEmail(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const n = Number(req.nextUrl.searchParams.get('n'))
  if (!n) return NextResponse.json({ steps: STEPS })
  const r = sample(req.nextUrl.searchParams.get('code'))
  if (!r) return NextResponse.json({ error: 'Pass ?code=<report code> from a lead' }, { status: 400 })
  const out = renderStep(n, { first: 'Alex', r, unsub: '#' })
  return new NextResponse(out.html, { headers: { 'content-type': 'text/html; charset=utf-8' } })
}

export async function POST(req: NextRequest) {
  const admin = adminEmail(req)
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const b = await req.json().catch(() => ({}))
  const r = sample(b.code)
  if (!r || !STEPS.some((s) => s.n === b.n)) return NextResponse.json({ error: 'Need n (1-14) and code' }, { status: 400 })
  const unsub = unsubscribeUrl(admin)
  const out = renderStep(b.n, { first: 'Test', r, unsub })
  const res = await deliver(admin, `qa_test_${b.n}`, { ...out, subject: `[TEST] ${out.subject}` }, unsub)
  return NextResponse.json(res)
}
