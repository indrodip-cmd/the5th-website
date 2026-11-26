import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { stopSelling, resumeSelling } from '@/lib/quiz/audit-mail'

export const dynamic = 'force-dynamic'

/* cal.com webhook: stops the audit sales emails the instant someone books, and
   resumes them if that booking is cancelled (and they still have not booked or
   paid). Set up in cal.com: Settings > Developer > Webhooks > subscriber URL
   https://the5thglobal.consulting/api/webhooks/cal, events BOOKING_CREATED,
   BOOKING_RESCHEDULED, BOOKING_CANCELLED, with a secret saved as CAL_WEBHOOK_SECRET.
   Without the secret this endpoint ignores everything; the daily cron still stops
   emails by polling cal.com, so nothing breaks while it is being set up. */
export async function POST(req: NextRequest) {
  const secret = process.env.CAL_WEBHOOK_SECRET
  const raw = await req.text()
  if (!secret) return NextResponse.json({ ok: true, ignored: 'CAL_WEBHOOK_SECRET not set' })
  const sig = req.headers.get('x-cal-signature-256') || ''
  const want = crypto.createHmac('sha256', secret).update(raw).digest('hex')
  if (sig.length !== want.length || !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(want))) return NextResponse.json({ error: 'bad signature' }, { status: 401 })

  try {
    const j = JSON.parse(raw)
    const ev = String(j?.triggerEvent || '')
    const emails: string[] = [...(j?.payload?.attendees || []).map((a: { email?: string }) => a?.email), j?.payload?.responses?.email?.value].filter((x: unknown): x is string => typeof x === 'string' && x.includes('@'))
    for (const e of emails) {
      if (ev === 'BOOKING_CREATED' || ev === 'BOOKING_RESCHEDULED' || ev === 'BOOKING_PAID') await stopSelling(e, 'cal_booking')
      else if (ev === 'BOOKING_CANCELLED' || ev === 'BOOKING_REJECTED') await resumeSelling(e, 'cal_booking')
    }
    return NextResponse.json({ ok: true, event: ev, emails: emails.length })
  } catch { return NextResponse.json({ ok: true }) }
}
