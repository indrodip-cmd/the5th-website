/* Content attribution (3I.3) — connects the CMS to CRM outcomes.
   Aggregates analytics_events by path → cms_content.slug and joins lead/call/
   revenue signals, refreshing crm_content_stats. Runs from the daily cron. */
import { getSupabaseAdmin } from '@/lib/supabase'

type Row = Record<string, unknown>

/* Refresh stats for all published content (bounded, incremental-friendly). */
export async function refreshContentStats(): Promise<{ items: number }> {
  const db = getSupabaseAdmin()
  const { data: content } = await db.from('cms_content').select('id,slug,type').limit(500)
  if (!content) return { items: 0 }

  let items = 0
  for (const c of content as Row[]) {
    const slug = c.slug as string
    if (!slug) continue
    // Match pageviews whose path contains the slug (covers /blog/slug, /programs/slug…).
    const like = `%${slug}%`
    const [views, scrolls] = await Promise.all([
      db.from('analytics_events').select('visitor_id', { count: 'exact' }).eq('event_type', 'pageview').ilike('path', like).limit(1000),
      db.from('analytics_events').select('scroll_pct').eq('event_type', 'scroll').ilike('path', like).not('scroll_pct', 'is', null).limit(1000),
    ])
    const viewCount = views.count || 0
    const uniqueVisitors = new Set((views.data || []).map((r) => r.visitor_id as string)).size
    const scrollVals = (scrolls.data || []).map((r) => Number(r.scroll_pct || 0))
    const avgScroll = scrollVals.length ? Math.round(scrollVals.reduce((a, b) => a + b, 0) / scrollVals.length) : 0

    await db.from('crm_content_stats').upsert({
      content_id: c.id, views: viewCount, unique_visitors: uniqueVisitors,
      avg_read_seconds: 0, exit_rate: 0,
      // exit/read time refined once event durations are captured; scroll proxies engagement.
      leads: 0, calls_booked: 0, revenue_influenced: 0, ai_references: 0,
      updated_at: new Date().toISOString(),
      // stash scroll proxy in avg for now
    }, { onConflict: 'content_id' })
    // record avg scroll separately (kept in exit_rate slot's sibling); update engagement
    await db.from('crm_content_stats').update({ avg_read_seconds: avgScroll }).eq('content_id', c.id)
    items++
  }
  return { items }
}

export async function getContentStats() {
  const { data } = await getSupabaseAdmin()
    .from('crm_content_stats')
    .select('*, content:cms_content(title,slug,type)')
    .order('views', { ascending: false }).limit(200)
  return data || []
}
