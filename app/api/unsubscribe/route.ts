import { NextRequest, NextResponse } from 'next/server'
import { verifyUnsub, unsubscribe, resubscribe } from '@/lib/comm/unsubscribe'

export const dynamic = 'force-dynamic'

/* Unsubscribe endpoints. GET performs the action then hands off to the branded
   /unsubscribed page for all outcomes (unsubscribed / invalid / resubscribed).
   POST is the RFC-8058 one-click endpoint mailbox providers call directly. */

export async function POST(req: NextRequest) {
  const token = new URL(req.url).searchParams.get('token') || (await req.text().then((t) => new URLSearchParams(t).get('token')).catch(() => null))
  const email = token ? verifyUnsub(token) : null
  if (email) await unsubscribe(email, 'one-click', 'list-unsubscribe')
  return NextResponse.json({ ok: !!email })
}

export async function GET(req: NextRequest) {
  const sp = new URL(req.url).searchParams
  const token = sp.get('token')
  const email = token ? verifyUnsub(token) : null

  if (!email) return NextResponse.redirect(new URL('/unsubscribed?e=invalid', req.url))

  if (sp.get('resubscribe') === '1') {
    await resubscribe(email)
    return NextResponse.redirect(new URL(`/unsubscribed?resub=1&t=${encodeURIComponent(token!)}`, req.url))
  }

  // One click unsubscribes immediately (ours + Beehiiv), then lands them on the
  // branded "sorry to see you go" page with an optional experience rating.
  await unsubscribe(email, 'link', 'link')
  return NextResponse.redirect(new URL(`/unsubscribed?t=${encodeURIComponent(token!)}`, req.url))
}
