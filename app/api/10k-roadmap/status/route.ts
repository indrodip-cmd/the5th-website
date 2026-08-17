import { NextRequest, NextResponse } from 'next/server'
import { getAuditStatus } from '@/lib/roadmap-audit'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/* Server-side payment/booking gate. The /reserved page polls this after the
   Whop redirect; only a webhook-confirmed `paid` unlocks the deep diagnostic
   and booking. Never trusts the client for payment state. */
export async function GET(req: NextRequest) {
  const email = (new URL(req.url).searchParams.get('email') || '').trim().toLowerCase()
  if (!email) return NextResponse.json({ found: false, paid: false }, { status: 400 })
  const status = await getAuditStatus(email)
  return NextResponse.json(status, { headers: { 'Cache-Control': 'no-store' } })
}
