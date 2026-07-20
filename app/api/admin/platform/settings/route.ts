import { NextRequest, NextResponse } from 'next/server'
import { adminEmail } from '@/lib/session'
import { getSetting, saveSetting } from '@/lib/platform/admin'

export const dynamic = 'force-dynamic'

// GET /api/admin/platform/settings?keys=pricing,zoom,onboarding
export async function GET(req: NextRequest) {
  if (!adminEmail(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const keys = (req.nextUrl.searchParams.get('keys') || '').split(',').filter(Boolean)
  const out: Record<string, unknown> = {}
  await Promise.all(keys.map(async (k) => { out[k] = await getSetting(k) }))
  return NextResponse.json({ settings: out })
}

export async function POST(req: NextRequest) {
  if (!adminEmail(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { key, value } = await req.json().catch(() => ({}))
  if (!key) return NextResponse.json({ error: 'key required' }, { status: 400 })
  try { return NextResponse.json(await saveSetting(key, value)) }
  catch (e) { return NextResponse.json({ error: e instanceof Error ? e.message : 'error' }, { status: 500 }) }
}
