import { NextRequest, NextResponse } from 'next/server'
import { adminEmail } from '@/lib/session'
import { costSummary } from '@/lib/costs'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

export async function GET(req: NextRequest) {
  if (!adminEmail(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  return NextResponse.json({ costs: await costSummary() })
}
