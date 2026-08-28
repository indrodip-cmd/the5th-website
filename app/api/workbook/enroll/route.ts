import { NextRequest, NextResponse } from 'next/server'
import { limit, clientIp } from '@/lib/rateLimit'
import { isValidEmail, sanitizeText } from '@/lib/validation'
import { enrollWorkbookBuyer } from '@/lib/workbook-campaign'

export const dynamic = 'force-dynamic'
export const maxDuration = 30

/* Enrol a Knowledge Asset buyer into the 7-day nurture (and send the day-0
   welcome). Called by the thank-you page after checkout, and/or by the Whop
   payment webhook (send header x-webhook-secret: CRON_SECRET to skip the IP
   rate limit for server-to-server calls). Fails soft so it never blocks the
   buyer's post-purchase experience. */
export async function POST(req: NextRequest) {
  try {
    const trusted = req.headers.get('x-webhook-secret') && req.headers.get('x-webhook-secret') === process.env.CRON_SECRET
    if (!trusted) {
      const rl = await limit(`wb-enroll:${clientIp(req)}`, 8, 60)
      if (!rl.ok) return NextResponse.json({ ok: false, error: 'rate_limited' }, { status: 429 })
    }
    const body = await req.json().catch(() => ({}))
    const email = String(body?.email || '')
    if (!isValidEmail(email)) return NextResponse.json({ ok: false, error: 'invalid_email' }, { status: 400 })
    const name = sanitizeText(body?.name, 80) || null
    const source = sanitizeText(body?.source, 40) || 'workbook_thankyou'
    const r = await enrollWorkbookBuyer(email, name, source)
    return NextResponse.json({ ok: r.ok, enrolled: r.enrolled ?? false })
  } catch {
    // Never surface an error to the buyer's success page.
    return NextResponse.json({ ok: true })
  }
}
