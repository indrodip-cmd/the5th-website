import { NextRequest, NextResponse } from 'next/server'
import { sendDueReminders } from '@/lib/audit-followup'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

/* Pre-call reminders (24h and 1h) for the $29 audit. Needs a scheduler that hits
   this every ~15 minutes with `Authorization: Bearer $CRON_SECRET` (vercel.json
   only has daily crons, so this is intentionally not registered there). Sends
   nothing about the post-call assets beyond the one-line mention. */
export async function GET(req: NextRequest) {
  if (req.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  return NextResponse.json({ ok: true, ...(await sendDueReminders()) })
}
