import { NextRequest, NextResponse } from 'next/server'
import { verifyUnsub, saveUnsubFeedback } from '@/lib/comm/unsubscribe'

export const dynamic = 'force-dynamic'

/* Save the optional 1-5 experience rating left on the unsubscribe landing page.
   The token both authorizes the write and identifies the (already unsubscribed)
   email, so no separate auth is needed. */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  const token = typeof body?.token === 'string' ? body.token : ''
  const rating = Number(body?.rating)
  const feedback = typeof body?.feedback === 'string' ? body.feedback : ''

  const email = token ? verifyUnsub(token) : null
  if (!email || !Number.isFinite(rating) || rating < 1 || rating > 5) {
    return NextResponse.json({ error: 'invalid' }, { status: 400 })
  }

  try {
    await saveUnsubFeedback(email, rating, feedback)
  } catch (e) {
    console.error('unsubscribe feedback save failed', e)
    return NextResponse.json({ error: 'save_failed' }, { status: 500 })
  }
  return NextResponse.json({ ok: true })
}
