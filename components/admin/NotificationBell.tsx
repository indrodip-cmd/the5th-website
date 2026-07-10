'use client'
/* Notification Center — topbar bell with unread badge + dropdown. Polls. */
import { useEffect, useRef, useState } from 'react'
import { T } from './theme'

type Row = Record<string, unknown>
const ICON: Record<string, string> = { sale: '💰', refund: '↩️', booking: '📅', webhook_failure: '⚠️', automation_failed: '⚠️', integration_error: '🔌', meeting_completed: '✓' }

export default function NotificationBell() {
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState<Row[]>([])
  const [unread, setUnread] = useState(0)
  const ref = useRef<HTMLDivElement>(null)

  const load = () => fetch('/api/admin/notifications').then((r) => r.ok ? r.json() : null).then((d) => { if (d) { setItems(d.notifications || []); setUnread(d.unread || 0) } }).catch(() => {})
  useEffect(() => { load(); const t = setInterval(load, 30000); return () => clearInterval(t) }, [])
  useEffect(() => {
    const onDoc = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', onDoc); return () => document.removeEventListener('mousedown', onDoc)
  }, [])

  const openPanel = () => { setOpen((o) => !o); if (!open && unread) { fetch('/api/admin/notifications', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ all: true }) }).then(() => setUnread(0)) } }

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button onClick={openPanel} style={{ position: 'relative', background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, padding: 6, lineHeight: 1 }} title="Notifications">
        🔔
        {unread > 0 && <span style={{ position: 'absolute', top: 0, right: 0, background: T.danger, color: '#fff', fontSize: 10, fontWeight: 700, borderRadius: 10, minWidth: 16, height: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 4px' }}>{unread > 9 ? '9+' : unread}</span>}
      </button>
      {open && (
        <div style={{ position: 'absolute', right: 0, top: 42, width: 340, maxHeight: 440, overflowY: 'auto', background: '#fff', border: `1px solid ${T.border}`, borderRadius: 12, boxShadow: '0 12px 40px rgba(0,0,0,0.16)', zIndex: 60 }}>
          <div style={{ padding: '12px 16px', borderBottom: `1px solid ${T.border}`, fontSize: 13, fontWeight: 700, color: T.ink }}>Notifications</div>
          {items.length === 0 ? <div style={{ padding: '28px 16px', textAlign: 'center', color: T.muted, fontSize: 13 }}>No notifications</div> : items.map((n) => (
            <div key={n.id as string} style={{ display: 'flex', gap: 10, padding: '11px 16px', borderBottom: '1px solid #f4f5f4', background: n.read ? '#fff' : '#f0fdf4' }}>
              <span>{ICON[n.type as string] || '🔔'}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: T.ink }}>{n.title as string}</div>
                {n.body ? <div style={{ fontSize: 12.5, color: T.sub }}>{n.body as string}</div> : null}
                <div style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>{new Date(n.created_at as string).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
