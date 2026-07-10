'use client'
/* AI Sales Coach — a grounded, admin-only assistant slide-over. Reads the CRM
   via tools server-side; never fabricates. Mounted in the Workspace topbar. */
import { useRef, useState, useEffect } from 'react'
import { T } from './theme'
import { Drawer, Button } from './ui'

interface Msg { role: 'user' | 'assistant'; content: string }

export default function CoachChat() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Msg[]>([])
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const endRef = useRef<HTMLDivElement>(null)
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages, busy])

  const send = async () => {
    const text = input.trim()
    if (!text || busy) return
    const next = [...messages, { role: 'user' as const, content: text }]
    setMessages(next); setInput(''); setBusy(true)
    try {
      const res = await fetch('/api/admin/crm/coach', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages: next }) })
      const d = await res.json().catch(() => ({}))
      setMessages([...next, { role: 'assistant', content: d?.reply || d?.error || 'Something went wrong.' }])
    } catch { setMessages([...next, { role: 'assistant', content: 'Network error.' }]) } finally { setBusy(false) }
  }

  const suggestions = ['Who are my hottest leads right now?', 'Summarize my pipeline', 'Which leads have gone quiet?']

  return (
    <>
      <button onClick={() => setOpen(true)}
        style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '8px 14px', borderRadius: 9, border: `1px solid ${T.green2}`, background: '#f0fdf4', color: T.green, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
        ✨ Coach
      </button>
      <Drawer open={open} onClose={() => setOpen(false)} width={480}>
        <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
          <div style={{ padding: '18px 22px', borderBottom: `1px solid ${T.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div><div style={{ fontSize: 16, fontWeight: 800, color: T.ink }}>AI Sales Coach</div><div style={{ fontSize: 12, color: T.sub }}>Grounded in your CRM — never invents.</div></div>
            <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', fontSize: 22, color: T.sub, cursor: 'pointer' }}>×</button>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: 18, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {messages.length === 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ fontSize: 13, color: T.sub, marginBottom: 4 }}>Ask about your leads, pipeline or a contact:</div>
                {suggestions.map((s) => <button key={s} onClick={() => setInput(s)} style={{ textAlign: 'left', padding: '10px 12px', borderRadius: 10, border: `1px solid ${T.border}`, background: '#fafbfa', color: T.text, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>{s}</button>)}
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} style={{ alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '86%', padding: '10px 14px', borderRadius: 12, background: m.role === 'user' ? T.green2 : '#f3f4f6', color: m.role === 'user' ? '#fff' : T.text, fontSize: 14, lineHeight: 1.55, whiteSpace: 'pre-wrap' }}>{m.content}</div>
            ))}
            {busy && <div style={{ alignSelf: 'flex-start', padding: '10px 14px', borderRadius: 12, background: '#f3f4f6', color: T.muted, fontSize: 14 }}>Thinking…</div>}
            <div ref={endRef} />
          </div>
          <div style={{ padding: 16, borderTop: `1px solid ${T.border}`, display: 'flex', gap: 8 }}>
            <input className="a-input" placeholder="Ask the coach…" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && send()} />
            <Button disabled={busy || !input.trim()} onClick={send}>Send</Button>
          </div>
        </div>
      </Drawer>
    </>
  )
}
