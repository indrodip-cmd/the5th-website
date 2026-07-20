import { NextRequest, NextResponse } from 'next/server'
import { adminEmail } from '@/lib/session'
import {
  listFlows, setFlowStatus, saveFlowOverride,
  listBroadcasts, createBroadcast, sendBroadcast, pauseBroadcast, resumeBroadcast, cancelBroadcast,
  sendTest, dispatchScheduled, audienceCount, AUDIENCES,
} from '@/lib/platform/email'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

export async function GET(req: NextRequest) {
  if (!adminEmail(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  // Opportunistic: fire any scheduled broadcasts that are due when the founder
  // opens the center (Hobby plan has no sub-daily cron). Non-fatal.
  try { await dispatchScheduled() } catch { /* ignore */ }
  const [flows, broadcasts] = await Promise.all([listFlows(), listBroadcasts()])
  return NextResponse.json({ flows, broadcasts, audiences: AUDIENCES })
}

export async function POST(req: NextRequest) {
  const actor = adminEmail(req)
  if (!actor) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const b = await req.json().catch(() => ({}))
  try {
    switch (b.action) {
      case 'set_flow_status': return NextResponse.json(await setFlowStatus(b.key, b.status, actor))
      case 'save_flow_override': return NextResponse.json(await saveFlowOverride(b.key, b.subject_override ?? null, b.body_override ?? null, actor))
      case 'audience_count': return NextResponse.json({ count: await audienceCount(b.audience || 'all') })
      case 'create_broadcast': {
        if (!b.subject || !b.body) return NextResponse.json({ error: 'subject and body required' }, { status: 400 })
        const bc = await createBroadcast({ subject: b.subject, body: b.body, audience: b.audience || 'all', scheduled_at: b.scheduled_at || null, actor })
        if (b.send_now) { const r = await sendBroadcast(bc.id); return NextResponse.json({ broadcast: bc, ...r }) }
        return NextResponse.json({ broadcast: bc })
      }
      case 'send_broadcast': return NextResponse.json(await sendBroadcast(b.id))
      case 'pause_broadcast': return NextResponse.json(await pauseBroadcast(b.id))
      case 'resume_broadcast': return NextResponse.json(await resumeBroadcast(b.id))
      case 'cancel_broadcast': return NextResponse.json(await cancelBroadcast(b.id))
      case 'send_test': {
        if (!b.to || !b.subject) return NextResponse.json({ error: 'to and subject required' }, { status: 400 })
        return NextResponse.json(await sendTest(b.to, b.subject, b.body || ''))
      }
      case 'dispatch_scheduled': return NextResponse.json(await dispatchScheduled())
      default: return NextResponse.json({ error: 'unknown action' }, { status: 400 })
    }
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'error' }, { status: 500 })
  }
}
