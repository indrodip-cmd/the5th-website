import { NextRequest, NextResponse } from 'next/server'
import { adminEmail } from '@/lib/session'
import { getSecurity, unblockAccount } from '@/lib/platform/admin'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  if (!adminEmail(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  return NextResponse.json(await getSecurity())
}

export async function PATCH(req: NextRequest) {
  if (!adminEmail(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { targetUserId, targetEmail } = await req.json().catch(() => ({}))
  if (!targetUserId) return NextResponse.json({ error: 'targetUserId required' }, { status: 400 })
  try { return NextResponse.json(await unblockAccount(targetUserId, targetEmail || '')) }
  catch (e) { return NextResponse.json({ error: e instanceof Error ? e.message : 'error' }, { status: 500 }) }
}
