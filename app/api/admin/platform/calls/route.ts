import { NextRequest, NextResponse } from 'next/server'
import { adminEmail } from '@/lib/session'
import { getCallConfig, saveCallSettings, setCallActive, cancelOccurrence, rescheduleOccurrence, restoreOccurrence } from '@/lib/platform/calls'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  if (!adminEmail(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  return NextResponse.json(await getCallConfig())
}

export async function POST(req: NextRequest) {
  if (!adminEmail(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const b = await req.json().catch(() => ({}))
  try {
    switch (b.action) {
      case 'save_settings': return NextResponse.json(await saveCallSettings(b))
      case 'set_active': return NextResponse.json(await setCallActive(!!b.active))
      case 'cancel': return NextResponse.json(await cancelOccurrence(b.originalDate, b.note))
      case 'reschedule': return NextResponse.json(await rescheduleOccurrence(b.originalDate, b.newDate, Number(b.newHour), Number(b.newMinute), b.note))
      case 'restore': return NextResponse.json(await restoreOccurrence(b.originalDate))
      default: return NextResponse.json({ error: 'unknown action' }, { status: 400 })
    }
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'error' }, { status: 500 })
  }
}
