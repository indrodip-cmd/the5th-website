import { NextRequest, NextResponse } from 'next/server'
import { ingestTranscript } from '@/lib/coaching-intelligence'

export const maxDuration = 120

// Universal provider ingest webhook. Any meeting provider (Zoom, Grain, Otter,
// Read.ai, Google Meet) or an automation (Zapier/Make) can POST a transcript
// here. Guarded by a shared secret (CI_WEBHOOK_SECRET) via header or ?token=.
export async function POST(req: NextRequest) {
  const secret = process.env.CI_WEBHOOK_SECRET
  if (!secret) return NextResponse.json({ error: 'Webhook not configured' }, { status: 503 })
  const token = req.headers.get('x-ci-token') || new URL(req.url).searchParams.get('token') || ''
  if (token !== secret) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const b = await req.json().catch(() => ({}))
    const r = await ingestTranscript({
      transcript: String(b?.transcript || ''),
      title: b?.title,
      meeting_type: b?.meeting_type,
      provider: b?.provider || 'webhook',
      contact_name: b?.contact_name,
      contact_email: b?.contact_email,
      meeting_date: b?.meeting_date,
      recording_url: b?.recording_url,
      external_id: b?.external_id,
      created_by: `webhook:${b?.provider || 'external'}`,
    })
    return NextResponse.json(r, { status: r.ok ? 200 : 400 })
  } catch {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 })
  }
}
