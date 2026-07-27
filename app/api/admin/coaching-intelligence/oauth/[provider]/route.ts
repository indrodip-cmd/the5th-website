import { NextRequest, NextResponse } from 'next/server'
import { adminEmail } from '@/lib/session'
import { oauthAuthorizeUrl } from '@/lib/coaching-connections'

// Start the OAuth flow for a provider (Zoom / Google Calendar / Calendly / PayPal).
export async function GET(req: NextRequest, ctx: { params: Promise<{ provider: string }> }) {
  const actor = adminEmail(req)
  const origin = new URL(req.url).origin
  const back = (q: string) => NextResponse.redirect(`${origin}/admin/coaching-intelligence?${q}`)
  if (!actor) return back('connect_error=Please sign in first')
  const { provider } = await ctx.params
  const redirectUri = `${origin}/api/admin/coaching-intelligence/oauth/${provider}/callback`
  const state = Buffer.from(`${provider}:${Date.now()}`).toString('base64url')
  const { url, error } = oauthAuthorizeUrl(provider, redirectUri, state)
  if (!url) return back(`connect_error=${encodeURIComponent(error || 'Could not start connection')}`)
  return NextResponse.redirect(url)
}
