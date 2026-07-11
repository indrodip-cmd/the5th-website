import { NextRequest, NextResponse } from 'next/server'
import { adminEmail } from '@/lib/session'
import { listFlags, setFlag, enabledFlagKeys } from '@/lib/flags'

export const dynamic = 'force-dynamic'

/* GET — full flag list, or ?keys=1 for just the enabled keys (used by the shell). */
export async function GET(req: NextRequest) {
  if (!adminEmail(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (new URL(req.url).searchParams.get('keys')) return NextResponse.json({ enabled: await enabledFlagKeys() })
  return NextResponse.json({ flags: await listFlags() })
}

/* POST { key, ...patch } — toggle/adjust a flag (no deploy needed). */
export async function POST(req: NextRequest) {
  if (!adminEmail(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const b = await req.json().catch(() => ({}))
  if (!b?.key) return NextResponse.json({ error: 'key required' }, { status: 400 })
  await setFlag(String(b.key), b)
  return NextResponse.json({ ok: true })
}
