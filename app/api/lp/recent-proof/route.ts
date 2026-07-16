import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

/* Cached for 60s across ALL visitors (Next data cache) — the DB is queried at
   most ~once/minute regardless of traffic, so ad spikes don't load the server. */
export const revalidate = 60

/* Recent REAL opt-ins for the social-proof popups — first name + city/country
   only (no email/phone). Woven into the simulated feed on the landing page. */
function flagFromCC(cc?: string | null): string {
  if (!cc || cc.length !== 2) return '🌍'
  const up = cc.toUpperCase()
  if (!/^[A-Z]{2}$/.test(up)) return '🌍'
  return String.fromCodePoint(...[...up].map((c) => 127397 + c.charCodeAt(0)))
}

export async function GET() {
  try {
    const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
    const { data } = await getSupabaseAdmin()
      .from('vsl_leads')
      .select('name, city, country, opted_in_at')
      .eq('source', 'make-10k-month')
      .gte('opted_in_at', since)
      .order('opted_in_at', { ascending: false })
      .limit(40)

    const items = (data || [])
      .map((r) => {
        const first = String(r.name || '').trim().split(/\s+/)[0] || ''
        const place = (r.city as string) || ''
        if (!first || (!place && !r.country)) return null
        return { name: first, city: place || 'their city', flag: flagFromCC(r.country as string) }
      })
      .filter(Boolean)

    return NextResponse.json({ items }, { headers: { 'Cache-Control': 'public, max-age=60' } })
  } catch {
    return NextResponse.json({ items: [] })
  }
}
