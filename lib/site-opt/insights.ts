/* Overnight self-improvement. Reads the last 7 days of first-party events, finds the
   weakest key buttons and pages, asks Claude for a better wording, and stores it as a
   PENDING proposal. Nothing is ever applied here: a human approves in /admin/improvements. */
import Anthropic from '@anthropic-ai/sdk'
import { Resend } from 'resend'
import { getSupabaseAdmin } from '@/lib/supabase'
import { FROM, REPLY_TO } from '@/lib/event-campaign'
import { OPT_ELEMENTS, type OptElement } from './registry'

const MODEL = 'claude-sonnet-4-6'
const SITE = (process.env.NEXT_PUBLIC_SITE_URL || 'https://the5thglobal.consulting').replace(/\/$/, '')
const MIN_VIEWS = Number(process.env.SITE_OPT_MIN_VIEWS || 30)

type Ev = { event_type: string; path: string | null; scroll_pct: number | null; visitor_id: string | null; meta: Record<string, unknown> | null }
type PageStat = { path: string; visitors: number; avgScroll: number; deep: number }
type CtaStat = { id: string; page: string; visitors: number; clicks: number; ctr: number }

export async function computeMetrics(days = 7) {
  const db = getSupabaseAdmin()
  const since = new Date(Date.now() - days * 864e5).toISOString()
  const rows: Ev[] = []
  for (let from = 0; from < 20000; from += 1000) {
    const { data } = await db.from('analytics_events').select('event_type,path,scroll_pct,visitor_id,meta').gte('created_at', since).in('event_type', ['pageview', 'scroll', 'cta_click']).range(from, from + 999)
    if (!data?.length) break
    rows.push(...(data as Ev[]))
    if (data.length < 1000) break
  }
  const norm = (p: string | null) => (p || '/').replace(/\/+$/, '') || '/'
  const views = new Map<string, Set<string>>()
  const scrolls = new Map<string, number[]>()
  const clicks = new Map<string, Set<string>>()
  for (const e of rows) {
    const p = norm(e.path), v = e.visitor_id || 'anon'
    if (e.event_type === 'pageview') (views.get(p) || views.set(p, new Set()).get(p)!).add(v)
    else if (e.event_type === 'scroll' && e.scroll_pct != null) (scrolls.get(p) || scrolls.set(p, []).get(p)!).push(e.scroll_pct)
    else if (e.event_type === 'cta_click') {
      const cta = typeof e.meta?.cta === 'string' ? (e.meta.cta as string) : ''
      if (cta) (clicks.get(`${p}|${cta}`) || clicks.set(`${p}|${cta}`, new Set()).get(`${p}|${cta}`)!).add(v)
    }
  }
  const pages: PageStat[] = [...views.entries()].map(([path, set]) => {
    const s = scrolls.get(path) || []
    return { path, visitors: set.size, avgScroll: s.length ? Math.round(s.reduce((a, b) => a + b, 0) / s.length) : 0, deep: s.length ? Math.round((s.filter((x) => x >= 75).length / s.length) * 100) : 0 }
  }).sort((a, b) => b.visitors - a.visitors)
  const ctas: CtaStat[] = OPT_ELEMENTS.map((el) => {
    const vis = views.get(el.page)?.size || 0
    const c = clicks.get(`${el.page}|${el.cta}`)?.size || 0
    return { id: el.id, page: el.page, visitors: vis, clicks: c, ctr: vis ? Math.round((c / vis) * 1000) / 10 : 0 }
  })
  return { days, pages, ctas }
}

function valid(el: OptElement, text: string): boolean {
  if (!text || text.length < 8 || text.length > 70) return false
  if (/[<>]/.test(text)) return false
  const prices = el.current.match(/\$[\d,]+(\.\d+)?/g) || []
  if (prices.some((p) => !text.includes(p))) return false           // never alter or drop a price
  if (/\b(guarantee[sd]?|free|%|only \d|last chance|hurry|limited|ends)\b/i.test(text) && !/\b(guarantee|free)\b/i.test(el.current)) return false // no new claims or fake urgency
  return true
}

async function draft(el: OptElement, stat: CtaStat, page?: PageStat): Promise<{ text: string; why: string } | null> {
  if (!process.env.ANTHROPIC_API_KEY) return null
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  const prompt = `You improve button copy for The5th Global Consulting, which helps experienced professionals (coaches, consultants, healers, experts 40+) turn expertise into client income. Tone: warm, direct, premium, honest.

Button purpose: ${el.purpose}
Current text: "${el.current}"
Last ${7} days: ${stat.visitors} visitors on the page, ${stat.clicks} clicked this button (${stat.ctr}%).${page ? ` Average scroll depth on the page: ${page.avgScroll}%.` : ''}

Write ONE alternative that could raise clicks. Rules: 8-60 characters; keep any price exactly as written; end with the same arrow character if the current text has one; no hype, no fake urgency or scarcity, no new promises or guarantees, no emojis, plain text only. Make it specific and about the visitor's benefit.
Reply as JSON only: {"text":"...","why":"one sentence on why this should work"}`
  const res = await client.messages.create({ model: MODEL, max_tokens: 300, temperature: 0.7, messages: [{ role: 'user', content: prompt }] })
  const raw = res.content.map((b) => (b.type === 'text' ? b.text : '')).join('')
  const m = raw.match(/\{[\s\S]*\}/)
  if (!m) return null
  try {
    const j = JSON.parse(m[0]) as { text?: string; why?: string }
    const text = String(j.text || '').trim()
    if (!valid(el, text) || text === el.current) return null
    return { text, why: String(j.why || '').slice(0, 300) }
  } catch { return null }
}

export async function runSiteInsights(opts: { dry?: boolean } = {}) {
  const db = getSupabaseAdmin()
  const metrics = await computeMetrics(7)
  const { data: open } = await db.from('site_proposals').select('element_id,status').in('status', ['pending', 'approved'])
  const taken = new Set((open || []).map((r) => r.element_id as string))

  const candidates = metrics.ctas.filter((c) => c.visitors >= MIN_VIEWS && !taken.has(c.id)).sort((a, b) => a.ctr - b.ctr).slice(0, 2)
  const made: Array<{ id: string; from: string; to: string; why: string }> = []
  for (const c of candidates) {
    const el = OPT_ELEMENTS.find((e) => e.id === c.id)!
    const page = metrics.pages.find((p) => p.path === el.page)
    const d = await draft(el, c, page).catch(() => null)
    if (!d) continue
    made.push({ id: el.id, from: el.current, to: d.text, why: d.why })
    if (!opts.dry) await db.from('site_proposals').insert({ element_id: el.id, page: el.page, current_text: el.current, proposed_text: d.text, rationale: d.why, metrics: { visitors: c.visitors, clicks: c.clicks, ctr: c.ctr, avgScroll: page?.avgScroll ?? null, days: 7 } })
  }

  const leaks = metrics.pages.filter((p) => p.visitors >= MIN_VIEWS && p.avgScroll < 35).slice(0, 5)
  if (!opts.dry && (made.length || leaks.length)) await digest(made, leaks, metrics.ctas.filter((c) => c.visitors >= MIN_VIEWS))
  return { ok: true, minViews: MIN_VIEWS, pagesSeen: metrics.pages.length, eligible: metrics.ctas.filter((c) => c.visitors >= MIN_VIEWS).length, proposals: made, leaks, sentEmail: !opts.dry && !!(made.length || leaks.length) }
}

async function digest(made: Array<{ id: string; from: string; to: string; why: string }>, leaks: PageStat[], ctas: CtaStat[]) {
  const key = process.env.RESEND_API_KEY
  if (!key) return
  const to = process.env.ADMIN_NOTIFY_EMAIL || REPLY_TO
  const lines: string[] = ['Overnight site review. Nothing has changed on the live site. Approve or reject each proposal here:', `${SITE}/admin/improvements`, '']
  if (made.length) { lines.push('PROPOSED CHANGES'); for (const m of made) lines.push(`- ${m.id}`, `  now:      ${m.from}`, `  proposed: ${m.to}`, `  why:      ${m.why}`, '') }
  if (ctas.length) { lines.push('BUTTON PERFORMANCE (7 days)'); for (const c of ctas) lines.push(`- ${c.id}: ${c.clicks} clicks / ${c.visitors} visitors (${c.ctr}%)`); lines.push('') }
  if (leaks.length) { lines.push('PAGES WHERE VISITORS LEAVE EARLY (average scroll under 35%)'); for (const p of leaks) lines.push(`- ${p.path}: ${p.visitors} visitors, avg scroll ${p.avgScroll}%`); lines.push('') }
  await new Resend(key).emails.send({ from: FROM, to, subject: `Site review: ${made.length} proposal${made.length === 1 ? '' : 's'} waiting for approval`, text: lines.join('\n') }).catch(() => {})
}
