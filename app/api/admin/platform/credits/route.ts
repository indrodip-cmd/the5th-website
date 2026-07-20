import { NextRequest, NextResponse } from 'next/server'
import { adminEmail } from '@/lib/session'
import { grantCredits } from '@/lib/platform/admin'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  if (!adminEmail(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { memberId, amount } = await req.json().catch(() => ({}))
  const amt = Number(amount)
  if (!memberId || !amt) return NextResponse.json({ error: 'memberId and non-zero amount required' }, { status: 400 })
  try {
    const r = await grantCredits(memberId, amt)
    return NextResponse.json({ ok: true, balance: r.balance })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'error' }, { status: 500 })
  }
}
