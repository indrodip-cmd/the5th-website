'use client'
/* Global ⌘K command palette — one search + quick actions across the platform.
   Keyboard-driven; searches contacts/meetings/opportunities/content/tasks and
   navigates or runs actions. */
import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { T } from './theme'

interface Item { id: string; group: string; icon: string; label: string; sub?: string; run: () => void }
type Row = Record<string, unknown>

// Every admin destination — including each Platform Control sub-tab (deep-linked
// via ?tab=) — so anything, however small, is one search away.
const NAV_ACTIONS: Array<{ icon: string; label: string; href: string; keywords: string; group: string }> = [
  // ── Command ──
  { icon: '◈', label: 'Command Center', href: '/admin/executive', keywords: 'overview kpis dashboard briefing priorities home', group: 'Command' },
  { icon: '◈', label: 'Business HQ', href: '/admin/hq', keywords: 'founder revenue mrr arr cash wise whop cal.com bookings brief coo vitals', group: 'Command' },
  { icon: '◉', label: 'Dashboard', href: '/admin', keywords: 'home', group: 'Command' },
  { icon: '🤖', label: 'Command AI', href: '/admin/ai', keywords: 'assistant chat ask question', group: 'Command' },
  { icon: '🚀', label: 'Launch readiness', href: '/admin/launch', keywords: 'checklist go live', group: 'Command' },
  { icon: '⚙︎', label: 'Agent Platform', href: '/admin/agents', keywords: 'agents automation specialists tools registry approvals', group: 'Command' },
  { icon: '⚡', label: 'Automation', href: '/admin/automation', keywords: 'workflows graph triggers studio', group: 'Command' },
  { icon: '🧠', label: 'Business Memory', href: '/admin/memory', keywords: 'organizational knowledge graph decisions experiments', group: 'Command' },
  // ── CRM ──
  { icon: '⧉', label: 'Contacts', href: '/admin/crm', keywords: 'crm people leads', group: 'CRM' },
  { icon: '▤', label: 'Pipeline', href: '/admin/crm/pipeline', keywords: 'deals opportunities kanban', group: 'CRM' },
  { icon: '◷', label: 'Meetings', href: '/admin/crm/meetings', keywords: 'calls fathom recordings', group: 'CRM' },
  { icon: '✓', label: 'Tasks', href: '/admin/crm/tasks', keywords: 'todo follow up', group: 'CRM' },
  { icon: '👥', label: 'CRM Members', href: '/admin/crm/members', keywords: 'contacts customers', group: 'CRM' },
  { icon: '📦', label: 'Products', href: '/admin/crm/products', keywords: 'catalog offers', group: 'CRM' },
  // ── Communications ──
  { icon: '✉', label: 'Communications', href: '/admin/communications', keywords: 'email sms broadcast provider resend brevo twilio', group: 'Communications' },
  { icon: '🎨', label: 'Email Studio', href: '/admin/communications/designer', keywords: 'email builder designer template brand visual', group: 'Communications' },
  { icon: '📣', label: 'Campaigns', href: '/admin/communications/campaigns', keywords: 'sequence drip campaign', group: 'Communications' },
  { icon: '💬', label: 'Live Inbox', href: '/admin/inbox', keywords: 'chat carolina takeover support', group: 'Communications' },
  // ── Growth ──
  { icon: '＄', label: 'Revenue', href: '/admin/revenue', keywords: 'money sales whop balance', group: 'Growth' },
  { icon: '🎟', label: 'Event Campaign', href: '/admin/events', keywords: 'breakthrough event presale', group: 'Growth' },
  { icon: '🧭', label: 'Journeys', href: '/admin/journeys', keywords: 'intent segments visitors journey intelligence', group: 'Growth' },
  { icon: '📈', label: 'Analytics', href: '/admin/analytics', keywords: 'stats reports traffic', group: 'Growth' },
  // ── Content ──
  { icon: '▦', label: 'CMS', href: '/admin/cms', keywords: 'content pages', group: 'Content' },
  { icon: '✦', label: 'Homepage Promos', href: '/admin/cms/promos', keywords: 'promotions banner homepage artwork', group: 'Content' },
  { icon: '📚', label: 'Knowledge', href: '/admin/knowledge', keywords: 'brain coaching knowledge base fathom', group: 'Content' },
  // ── Platform Control (member platform) ──
  { icon: '⚙', label: 'Platform Control', href: '/admin/platform', keywords: 'super admin member platform product control', group: 'Platform' },
  { icon: '👤', label: 'Platform · Members', href: '/admin/platform?tab=members', keywords: 'member tier deactivate add subscription upgrade downgrade', group: 'Platform' },
  { icon: '🪙', label: 'Platform · Credits', href: '/admin/platform?tab=credits', keywords: 'ai credits grant top up balance deduct', group: 'Platform' },
  { icon: '📞', label: 'Platform · Weekly Call', href: '/admin/platform?tab=calls', keywords: 'weekly coaching community call zoom schedule time timing reschedule cancel remove pause meeting', group: 'Platform' },
  { icon: '✉', label: 'Platform · Emails', href: '/admin/platform?tab=emails', keywords: 'email center broadcast send schedule pause live suspend resend automated flows drip pulse newsletter', group: 'Platform' },
  { icon: '🎓', label: 'Platform · Courses', href: '/admin/platform?tab=courses', keywords: 'course cms lessons modules publish curriculum', group: 'Platform' },
  { icon: '💲', label: 'Platform · Pricing', href: '/admin/platform?tab=pricing', keywords: 'plan price monthly yearly ai cost', group: 'Platform' },
  { icon: '🎥', label: 'Platform · Zoom settings', href: '/admin/platform?tab=zoom', keywords: 'zoom settings link passcode host meeting call', group: 'Platform' },
  { icon: '🧩', label: 'Platform · Onboarding', href: '/admin/platform?tab=onboarding', keywords: 'onboarding flow new member setup', group: 'Platform' },
  { icon: '🛡', label: 'Platform · Security', href: '/admin/platform?tab=security', keywords: 'blocked accounts unblock security events login', group: 'Platform' },
  { icon: '🧠', label: 'Platform · AI Training', href: '/admin/platform?tab=training', keywords: 'train brain transcript coaching calls prompt version fathom', group: 'Platform' },
  { icon: '🛒', label: 'Platform · Whop', href: '/admin/platform?tab=whop', keywords: 'whop billing webhook integration checkout', group: 'Platform' },
  { icon: '📐', label: 'Platform · Blueprints', href: '/admin/platform?tab=blueprints', keywords: 'member blueprint overview tiers', group: 'Platform' },
  // ── System ──
  { icon: '🔌', label: 'Integrations', href: '/admin/integrations', keywords: 'whop clarity connect events api keys', group: 'System' },
  { icon: '＄', label: 'Costs', href: '/admin/costs', keywords: 'ai cost spend usage', group: 'System' },
  { icon: '❤', label: 'System', href: '/admin/system', keywords: 'health status uptime', group: 'System' },
  { icon: '⚑', label: 'Feature Flags', href: '/admin/flags', keywords: 'flags toggles enable disable', group: 'System' },
  { icon: '⚙', label: 'Settings', href: '/admin/settings', keywords: 'config preferences', group: 'System' },
  { icon: '◲', label: 'Legacy tools', href: '/admin/legacy', keywords: 'old', group: 'System' },
]

export default function CommandPalette() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState('')
  const [results, setResults] = useState<Item[]>([])
  const [sel, setSel] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setOpen((o) => !o) }
      if (e.key === 'Escape') setOpen(false)
    }
    // Also open when the topbar search box (or anything) requests it.
    const onOpen = () => setOpen(true)
    window.addEventListener('keydown', onKey)
    window.addEventListener('admin:open-search', onOpen)
    return () => { window.removeEventListener('keydown', onKey); window.removeEventListener('admin:open-search', onOpen) }
  }, [])
  useEffect(() => { if (open) { setQ(''); setSel(0); setTimeout(() => inputRef.current?.focus(), 30) } }, [open])

  const go = useCallback((href: string) => { setOpen(false); router.push(href) }, [router])

  useEffect(() => {
    const nav: Item[] = NAV_ACTIONS
      .filter((a) => !q || (a.label + ' ' + a.keywords).toLowerCase().includes(q.toLowerCase()))
      .map((a) => ({ id: 'nav-' + a.href, group: a.group, icon: a.icon, label: a.label, run: () => go(a.href) }))
    if (!q.trim()) { setResults(nav); setSel(0); return }
    let alive = true
    const t = setTimeout(async () => {
      try {
        const r = await fetch(`/api/admin/global-search?q=${encodeURIComponent(q)}`)
        const d = r.ok ? await r.json() : {}
        if (!alive) return
        const out: Item[] = [...nav]
        for (const c of (d.contacts || []) as Row[]) out.push({ id: 'c' + c.id, group: 'Contacts', icon: '⧉', label: (c.name as string) || (c.email as string), sub: c.email as string, run: () => go(`/admin/crm/${c.id}`) })
        for (const o of (d.opportunities || []) as Row[]) out.push({ id: 'o' + o.id, group: 'Opportunities', icon: '▤', label: o.name as string, sub: `$${Number(o.value || 0).toLocaleString()}`, run: () => go(`/admin/crm/${o.contact_id}`) })
        for (const m of (d.meetings || []) as Row[]) out.push({ id: 'm' + m.id, group: 'Meetings', icon: '◷', label: m.title as string, sub: m.status as string, run: () => go(`/admin/crm/meetings/${m.id}`) })
        for (const ct of (d.content || []) as Row[]) out.push({ id: 'ct' + ct.id, group: 'Content', icon: '▦', label: ct.title as string, sub: ct.type as string, run: () => go('/admin/cms') })
        for (const tk of (d.tasks || []) as Row[]) out.push({ id: 't' + tk.id, group: 'Tasks', icon: '✓', label: tk.title as string, run: () => go('/admin/crm/tasks') })
        setResults(out); setSel(0)
      } catch { setResults(nav) }
    }, 180)
    return () => { alive = false; clearTimeout(t) }
  }, [q, go])

  if (!open) return null
  const onKeyNav = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setSel((s) => Math.min(s + 1, results.length - 1)) }
    if (e.key === 'ArrowUp') { e.preventDefault(); setSel((s) => Math.max(s - 1, 0)) }
    if (e.key === 'Enter') { e.preventDefault(); results[sel]?.run() }
  }

  let lastGroup = ''
  return (
    <>
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(10,26,15,0.35)', zIndex: 300 }} onClick={() => setOpen(false)} />
      <div style={{ position: 'fixed', top: '12vh', left: '50%', transform: 'translateX(-50%)', width: 'min(620px, 94vw)', background: '#fff', borderRadius: 14, boxShadow: '0 24px 70px rgba(0,0,0,0.3)', zIndex: 301, overflow: 'hidden' }}>
        <input ref={inputRef} value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={onKeyNav} placeholder="Search or jump to…  (⌘K)"
          style={{ width: '100%', padding: '18px 20px', border: 'none', borderBottom: `1px solid ${T.border}`, fontSize: 16, outline: 'none', fontFamily: 'inherit', color: T.text }} />
        <div style={{ maxHeight: '52vh', overflowY: 'auto', padding: 6 }}>
          {results.length === 0 ? <div style={{ padding: 24, textAlign: 'center', color: T.muted, fontSize: 14 }}>No results</div> : results.map((it, i) => {
            const header = it.group !== lastGroup ? it.group : null; lastGroup = it.group
            return (
              <div key={it.id}>
                {header && <div style={{ padding: '10px 14px 4px', fontSize: 11, fontWeight: 700, color: T.muted, textTransform: 'uppercase', letterSpacing: '.05em' }}>{header}</div>}
                <button onClick={it.run} onMouseEnter={() => setSel(i)}
                  style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', textAlign: 'left', padding: '10px 14px', borderRadius: 9, border: 'none', cursor: 'pointer', background: sel === i ? '#f0fdf4' : 'transparent', fontFamily: 'inherit' }}>
                  <span style={{ width: 20, textAlign: 'center' }}>{it.icon}</span>
                  <span style={{ flex: 1, fontSize: 14, color: T.ink, fontWeight: 500 }}>{it.label}</span>
                  {it.sub && <span style={{ fontSize: 12, color: T.muted }}>{it.sub}</span>}
                </button>
              </div>
            )
          })}
        </div>
      </div>
    </>
  )
}
