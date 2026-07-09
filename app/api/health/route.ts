import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { embeddingProvider } from '@/lib/embeddings'
import { calKey } from '@/lib/calcom'

export const dynamic = 'force-dynamic'

/* Lightweight health probe for monitoring/uptime checks. No secrets returned. */
export async function GET() {
  const checks: Record<string, boolean | string> = {
    anthropic: !!process.env.ANTHROPIC_API_KEY,
    calcom: !!calKey(),
    resend: !!process.env.RESEND_API_KEY,
    embeddings: embeddingProvider() || 'off',
  }
  let db = false
  try {
    const { error } = await getSupabaseAdmin().from('cms_content').select('id', { head: true, count: 'exact' }).limit(1)
    db = !error
  } catch {
    db = false
  }
  checks.database = db
  const ok = db && !!process.env.ANTHROPIC_API_KEY
  return NextResponse.json({ ok, status: ok ? 'healthy' : 'degraded', checks, time: new Date().toISOString() }, { status: ok ? 200 : 503 })
}
