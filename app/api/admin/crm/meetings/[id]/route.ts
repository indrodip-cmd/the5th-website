import { NextRequest, NextResponse } from 'next/server'
import { adminEmail } from '@/lib/session'
import { sanitizeText } from '@/lib/validation'
import { getMeeting, setMeetingNotes, attachFathom } from '@/lib/meetings'

export const dynamic = 'force-dynamic'

/* GET — meeting detail (meeting + contact + opportunity + tasks). */
export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  if (!adminEmail(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await ctx.params
  const data = await getMeeting(id)
  if (!data) return NextResponse.json({ error: 'Not found.' }, { status: 404 })
  return NextResponse.json(data)
}

/* PATCH — update notes, or manually attach a recording link ({ fathom_share_url } / { notes }). */
export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  if (!adminEmail(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await ctx.params
  const b = await req.json().catch(() => ({}))
  if (typeof b?.fathom_share_url === 'string' || typeof b?.recording_url === 'string') {
    const row = await attachFathom(id, { fathom_share_url: b.fathom_share_url, recording_url: b.recording_url })
    return NextResponse.json({ ok: true, meeting: row })
  }
  if (typeof b?.notes === 'string') {
    const row = await setMeetingNotes(id, sanitizeText(b.notes, 8000))
    return NextResponse.json({ ok: true, meeting: row })
  }
  return NextResponse.json({ error: 'Nothing to update.' }, { status: 400 })
}
