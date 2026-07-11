import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

/* Public — enabled homepage promos (products / announcements / hero), ordered.
   Consumed client-side by /promos.js on the static marketing site. */
export async function GET() {
  const { data } = await getSupabaseAdmin().from('homepage_promos')
    .select('slug,kind,eyebrow,title,subtitle,description,features,badge,stat_label,stat_value,cta_label,cta_href,secondary_label,secondary_href,accent,gradient,image_url,image_mobile_url,icon,theme,sort')
    .eq('enabled', true).order('kind').order('sort').order('created_at')
  return NextResponse.json({ promos: data || [] }, {
    headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' },
  })
}
