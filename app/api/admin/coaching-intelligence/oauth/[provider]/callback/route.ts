import { NextRequest, NextResponse } from 'next/server'
import { adminEmail } from '@/lib/session'
import { oauthExchange } from '@/lib/coaching-connections'
import { audit } from '@/lib/coaching-security'

// OAuth callback: exchange the code for tokens, store the connection, and send
// the admin back to the module with a success/error notice.
export async function GET(req: NextRequest, ctx: { params: Promise<{ provider: string }> }) {
  const actor = adminEmail(req)
  const u = new URL(req.url)
  const origin = u.origin
  const back = (q: string) => NextResponse.redirect(`${origin}/admin/coaching-intelligence?${q}`)
  if (!actor) return back('connect_error=Please sign in first')
  const { provider } = await ctx.params
  const code = u.searchParams.get('code')
  if (!code) return back(`connect_error=${encodeURIComponent(u.searchParams.get('error_description') || u.searchParams.get('error') || 'No authorization code')}`)
  const redirectUri = `${origin}/api/admin/coaching-intelligence/oauth/${provider}/callback`
  const r = await oauthExchange(provider, code, redirectUri, actor)
  if (r.ok) audit(actor, 'connect_app', 'connection', provider).catch(() => {})
  return back(r.ok ? `connected=${provider}` : `connect_error=${encodeURIComponent(r.error || 'Connection failed')}`)
}
