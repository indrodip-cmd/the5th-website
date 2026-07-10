import { NextRequest, NextResponse } from 'next/server'
import { verifyWebhook, urlValidationResponse } from '@/lib/zoom'
import { upsertMeeting, attachZoom } from '@/lib/meetings'
import { getSupabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

/* Zoom event webhook. Handles the URL-validation handshake and ingests
   meeting/recording events. No-ops safely if Zoom isn't configured. */
export async function POST(req: NextRequest) {
  const raw = await req.text()
  let body: Record<string, unknown>
  try { body = JSON.parse(raw) } catch { return NextResponse.json({ error: 'bad json' }, { status: 400 }) }
  const event = String(body.event || '')
  const object = (body.payload as { object?: Record<string, unknown> })?.object || {}

  // 1) URL validation handshake (no signature yet).
  if (event === 'endpoint.url_validation') {
    const plainToken = String((body.payload as { plainToken?: string })?.plainToken || '')
    return NextResponse.json(urlValidationResponse(plainToken))
  }

  // 2) Verify signature for all other events.
  const ok = verifyWebhook(raw, req.headers.get('x-zm-signature'), req.headers.get('x-zm-request-timestamp'))
  if (!ok) return NextResponse.json({ error: 'invalid signature' }, { status: 401 })

  try {
    const externalId = String(object.uuid || object.id || '')
    if (!externalId) return NextResponse.json({ ok: true })

    if (event === 'meeting.ended' || event === 'meeting.started') {
      await upsertMeeting({
        provider: 'zoom', external_id: externalId, title: String(object.topic || 'Zoom meeting'),
        starts_at: (object.start_time as string) || undefined,
        status: event === 'meeting.ended' ? 'completed' : 'upcoming',
        join_url: (object.join_url as string) || undefined,
        extra: { zoom_uuid: String(object.uuid || '') },
      })
    } else if (event === 'recording.completed') {
      const rec = (object.recording_files as Array<Record<string, unknown>>)?.find((f) => f.file_type === 'MP4')
      // Ensure a meeting row exists, then attach the recording.
      const meeting = await upsertMeeting({
        provider: 'zoom', external_id: externalId, title: String(object.topic || 'Zoom meeting'),
        starts_at: (object.start_time as string) || undefined, status: 'completed',
        extra: { zoom_uuid: String(object.uuid || '') },
      })
      if (meeting) {
        await attachZoom(meeting.id as string, {
          recording_url: (object.share_url as string) || (rec?.play_url as string) || undefined,
          zoom_uuid: String(object.uuid || ''), duration_min: Number(object.duration) || undefined,
        })
      }
    }
  } catch (e) {
    console.error('zoom webhook failed', e)
    // Log but 200 so Zoom does not retry-storm.
    await getSupabaseAdmin().from('notifications').insert({ type: 'zoom_webhook_error', title: 'Zoom webhook error', body: String(e) }).then(() => {}, () => {})
  }
  return NextResponse.json({ ok: true })
}
