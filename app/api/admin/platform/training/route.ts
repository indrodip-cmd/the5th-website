import { NextRequest, NextResponse } from 'next/server'
import { adminEmail } from '@/lib/session'
import { getTraining, saveTranscript, deleteTranscript } from '@/lib/platform/admin'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  if (!adminEmail(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  return NextResponse.json(await getTraining())
}

export async function POST(req: NextRequest) {
  if (!adminEmail(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const b = await req.json().catch(() => ({}))
  try {
    if (b.action === 'save_transcript') {
      if (!b.title) return NextResponse.json({ error: 'title required' }, { status: 400 })
      return NextResponse.json(await saveTranscript(b.title, b.content || '', b.date))
    }
    if (b.action === 'delete_transcript') {
      return NextResponse.json(await deleteTranscript(b.id, b.fathomId))
    }
    return NextResponse.json({ error: 'unknown action' }, { status: 400 })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'error' }, { status: 500 })
  }
}
