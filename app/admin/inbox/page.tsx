'use client'
/* Live inbox — watch Carolina conversations and take charge. When Indrodip
   takes over, the AI goes quiet and his replies show in the visitor's widget
   as "Indrodip took over". */
import { useEffect, useRef, useState } from 'react'

type Chat = { conversation_id: string; name?: string; email?: string; status: string; last_message?: string; updated_at: string }
type Msg = { id: number; sender: string; text: string; created_at: string }

const GREEN = '#1C4A32', GOLD = '#a9862f', INK = '#1a1a1a', MUTE = '#6b6560'

export default function AdminInbox() {
  const [chats, setChats] = useState<Chat[]>([])
  const [active, setActive] = useState<string | null>(null)
  const [msgs, setMsgs] = useState<Msg[]>([])
  const [status, setStatus] = useState<'bot' | 'human'>('bot')
  const [text, setText] = useState('')
  const scroller = useRef<HTMLDivElement>(null)
  const lastVisitorId = useRef(0)
  const lastTyping = useRef(0)
  const actx = useRef<AudioContext | null>(null)
  const notifSeen = useRef(0)
  const [alerts, setAlerts] = useState(false)

  // Desktop + title-bar alert when a visitor messages while the tab is away.
  function notifyVisitor(text: string, conversationId: string) {
    if (document.hidden) {
      document.title = '🔴 New message • Live Inbox'
      if (alerts && 'Notification' in window && Notification.permission === 'granted') {
        try {
          const n = new Notification('New message from a visitor', { body: (text || '').slice(0, 120), tag: 'carolina-inbox', icon: '/images/founder.png' })
          n.onclick = () => { window.focus(); setActive(conversationId); n.close() }
        } catch {}
      }
    }
    ding()
  }
  async function enableAlerts() {
    setAlerts(true)
    try { if ('Notification' in window && Notification.permission !== 'granted') await Notification.requestPermission() } catch {}
    try { if (!actx.current) actx.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)() } catch {}
  }

  useEffect(() => {
    const restore = () => { if (!document.hidden) document.title = 'Live Inbox' }
    document.addEventListener('visibilitychange', restore)
    return () => document.removeEventListener('visibilitychange', restore)
  }, [])

  function ding() {
    try {
      if (!actx.current) actx.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
      const c = actx.current!
      ;[784, 1046].forEach((f, i) => { const o = c.createOscillator(), g = c.createGain(); o.type = 'sine'; o.frequency.value = f; g.gain.value = 0.06; o.connect(g); g.connect(c.destination); const t = c.currentTime + i * 0.1; o.start(t); g.gain.setValueAtTime(0.06, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.25); o.stop(t + 0.27) })
    } catch {}
  }
  function sendTyping() {
    const now = Date.now()
    if (!active || status !== 'human' || now - lastTyping.current < 1500) return
    lastTyping.current = now
    fetch('/api/admin/carolina/live', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ conversationId: active, action: 'typing' }) }).catch(() => {})
  }

  async function loadChats() {
    try {
      const r = await fetch('/api/admin/carolina/live'); const j = await r.json(); setChats(j.chats || [])
      const lv = j.latestVisitor
      if (lv && lv.id > notifSeen.current) {
        if (notifSeen.current) notifyVisitor(lv.text, lv.conversation_id)  // skip the very first load
        notifSeen.current = lv.id
      }
    } catch {}
  }
  async function loadThread(id: string) {
    try {
      const r = await fetch('/api/admin/carolina/live?conversationId=' + encodeURIComponent(id))
      const j = await r.json(); const m: Msg[] = j.messages || []
      const maxV = m.filter((x) => x.sender === 'visitor').reduce((a, x) => Math.max(a, x.id), 0)
      if (lastVisitorId.current && maxV > lastVisitorId.current) ding()  // new visitor message → notify
      lastVisitorId.current = maxV
      setMsgs(m); setStatus(j.chat?.status === 'human' ? 'human' : 'bot')
    } catch {}
  }
  async function control(action: string, extra?: Record<string, unknown>) {
    if (!active) return
    await fetch('/api/admin/carolina/live', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ conversationId: active, action, ...extra }) })
    loadThread(active)
  }

  useEffect(() => { loadChats(); const t = setInterval(loadChats, 5000); return () => clearInterval(t) }, [])
  useEffect(() => { if (!active) return; lastVisitorId.current = 0; loadThread(active); const t = setInterval(() => loadThread(active), 3000); return () => clearInterval(t) }, [active])
  useEffect(() => { scroller.current?.scrollTo({ top: scroller.current.scrollHeight }) }, [msgs])

  async function send() {
    const t = text.trim(); if (!t) return
    setText(''); await control('send', { text: t })
  }

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 20px)', fontFamily: "'Public Sans',system-ui,sans-serif", color: INK, background: '#faf8f4' }}>
      {/* List */}
      <div style={{ width: 320, borderRight: '1px solid #e8e3dc', overflowY: 'auto', flexShrink: 0 }}>
        <div style={{ padding: '18px 18px 12px' }}>
          <h1 style={{ fontFamily: 'Georgia,serif', fontSize: 22, fontWeight: 700, margin: 0, color: INK }}>Live Inbox</h1>
          <p style={{ fontSize: 12.5, color: MUTE, margin: '4px 0 8px' }}>Watch chats and take charge anytime.</p>
          <button onClick={enableAlerts} style={{ fontSize: 11.5, fontWeight: 700, padding: '6px 12px', borderRadius: 999, border: '1px solid ' + (alerts ? GREEN : '#e2dcd2'), background: alerts ? GREEN : '#fff', color: alerts ? '#fff' : MUTE, cursor: 'pointer' }}>
            {alerts ? '🔔 Alerts on' : '🔕 Enable desktop alerts'}
          </button>
        </div>
        {chats.length === 0 && <p style={{ padding: 18, fontSize: 13, color: MUTE }}>No conversations yet.</p>}
        {chats.map((c) => (
          <button key={c.conversation_id} onClick={() => setActive(c.conversation_id)} style={{ display: 'block', width: '100%', textAlign: 'left', padding: '13px 18px', border: 'none', borderBottom: '1px solid #f1ece3', background: active === c.conversation_id ? '#fff' : 'transparent', cursor: 'pointer', fontFamily: 'inherit' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: INK, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.name || c.email || c.conversation_id.slice(0, 16)}</span>
              {c.status === 'human' && <span style={{ fontSize: 9.5, fontWeight: 800, letterSpacing: 0.5, color: '#fff', background: GOLD, borderRadius: 999, padding: '2px 7px' }}>YOU</span>}
            </div>
            <div style={{ fontSize: 12.5, color: MUTE, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: 3 }}>{c.last_message || '…'}</div>
          </button>
        ))}
      </div>

      {/* Thread */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {!active ? (
          <div style={{ margin: 'auto', color: MUTE, fontSize: 14 }}>Select a conversation to view it.</div>
        ) : (
          <>
            <div style={{ padding: '14px 20px', borderBottom: '1px solid #e8e3dc', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, background: '#fff' }}>
              <div style={{ fontSize: 13.5, color: MUTE }}>{status === 'human' ? '🟢 You are in control — Carolina is paused' : 'Carolina is handling this chat'}</div>
              {status === 'human'
                ? <button onClick={() => control('release')} style={{ padding: '8px 16px', borderRadius: 10, border: '1px solid #e8e3dc', background: '#fff', color: MUTE, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>Hand back to Carolina</button>
                : <button onClick={() => control('takeover')} style={{ padding: '8px 18px', borderRadius: 10, border: 'none', background: GREEN, color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>Take over →</button>}
            </div>

            <div ref={scroller} style={{ flex: 1, overflowY: 'auto', padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {msgs.map((m) => (
                <div key={m.id} style={{ alignSelf: m.sender === 'visitor' ? 'flex-start' : 'flex-end', maxWidth: '76%' }}>
                  <div style={{ fontSize: 10.5, color: MUTE, marginBottom: 3, textAlign: m.sender === 'visitor' ? 'left' : 'right' }}>{m.sender === 'visitor' ? 'Visitor' : m.sender === 'human' ? 'You (Indrodip)' : 'Carolina'}</div>
                  <div style={{ padding: '10px 13px', borderRadius: 14, fontSize: 14, lineHeight: 1.5, whiteSpace: 'pre-wrap', background: m.sender === 'visitor' ? '#fff' : m.sender === 'human' ? GREEN : '#efeae2', color: m.sender === 'human' ? '#fff' : INK, border: m.sender === 'visitor' ? '1px solid #e8e3dc' : 'none' }}>{m.text}</div>
                </div>
              ))}
            </div>

            <div style={{ padding: 14, borderTop: '1px solid #e8e3dc', background: '#fff' }}>
              <div style={{ display: 'flex', gap: 8 }}>
                <input value={text} onChange={(e) => { setText(e.target.value); sendTyping() }} onKeyDown={(e) => { if (e.key === 'Enter') send() }} placeholder={status === 'human' ? 'Reply as Indrodip…' : 'Take over to reply…'} style={{ flex: 1, padding: '11px 14px', borderRadius: 12, border: '1px solid #e2dcd2', fontSize: 14, fontFamily: 'inherit', outline: 'none' }} />
                <button onClick={send} disabled={!text.trim()} style={{ padding: '0 20px', borderRadius: 12, border: 'none', background: text.trim() ? GREEN : '#e2dcd2', color: '#fff', fontSize: 14, fontWeight: 700, cursor: text.trim() ? 'pointer' : 'default' }}>Send</button>
              </div>
              <p style={{ fontSize: 11, color: MUTE, margin: '8px 0 0' }}>Sending a message takes over automatically — the visitor sees “Indrodip took over.”</p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
