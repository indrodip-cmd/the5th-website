'use client'
/* Global ⌘K command palette — one search + quick actions across the platform.
   Keyboard-driven; searches contacts/meetings/opportunities/content/tasks and
   navigates or runs actions. */
import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { T } from './theme'

interface Item { id: string; group: string; icon: string; label: string; sub?: string; run: () => void }
type Row = Record<string, unknown>

const NAV_ACTIONS: Array<{ icon: string; label: string; href: string; keywords: string }> = [
  { icon: '◉', label: 'Dashboard', href: '/admin', keywords: 'home command center' },
  { icon: '⧉', label: 'Contacts', href: '/admin/crm', keywords: 'crm people leads' },
  { icon: '▤', label: 'Pipeline', href: '/admin/crm/pipeline', keywords: 'deals opportunities kanban' },
  { icon: '◷', label: 'Meetings', href: '/admin/crm/meetings', keywords: 'calls zoom fathom' },
  { icon: '✓', label: 'Tasks', href: '/admin/crm/tasks', keywords: 'todo follow up' },
  { icon: '＄', label: 'Revenue', href: '/admin/revenue', keywords: 'money sales whop balance' },
  { icon: '📈', label: 'Analytics', href: '/admin/analytics', keywords: 'stats reports' },
  { icon: '🔌', label: 'Integrations', href: '/admin/integrations', keywords: 'whop clarity connect events' },
  { icon: '⚙', label: 'Settings', href: '/admin/settings', keywords: 'config' },
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
    window.addEventListener('keydown', onKey); return () => window.removeEventListener('keydown', onKey)
  }, [])
  useEffect(() => { if (open) { setQ(''); setSel(0); setTimeout(() => inputRef.current?.focus(), 30) } }, [open])

  const go = useCallback((href: string) => { setOpen(false); router.push(href) }, [router])

  useEffect(() => {
    const nav: Item[] = NAV_ACTIONS
      .filter((a) => !q || (a.label + ' ' + a.keywords).toLowerCase().includes(q.toLowerCase()))
      .map((a) => ({ id: 'nav-' + a.href, group: 'Go to', icon: a.icon, label: a.label, run: () => go(a.href) }))
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
