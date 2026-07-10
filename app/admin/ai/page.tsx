'use client'
/* Command AI — the internal executive AI / Chief of Staff. ChatGPT-style page
   inside the Workspace, grounded in the whole business (CRM, meetings, revenue,
   coaching calls, knowledge). Admin-only. */
import { useEffect, useRef, useState } from 'react'
import { T, Button } from '@/components/admin/ui'

type Row = Record<string, unknown>
interface Msg { role: 'user' | 'assistant'; content: string; tools_used?: string[] }

const SUGGESTIONS = [
  "Give me today's executive briefing",
  'Who should I follow up with today?',
  'What are my biggest revenue opportunities right now?',
  'Which objections came up most in recent calls?',
  'Prepare me for my upcoming strategy calls',
  'What happened in my business this week?',
]

/* Tiny markdown: headers, bullets, **bold**. */
function renderMd(text: string) {
  return text.split('\n').map((line, i) => {
    const bold = (s: string) => s.split(/(\*\*[^*]+\*\*)/g).map((p, j) => p.startsWith('**') && p.endsWith('**') ? <strong key={j}>{p.slice(2, -2)}</strong> : <span key={j}>{p}</span>)
    if (/^#{1,3}\s/.test(line)) return <div key={i} style={{ fontSize: 15, fontWeight: 800, color: T.ink, margin: '10px 0 4px' }}>{bold(line.replace(/^#{1,3}\s/, ''))}</div>
    if (/^\s*[-*]\s/.test(line)) return <div key={i} style={{ display: 'flex', gap: 8, paddingLeft: 6 }}><span style={{ color: T.green }}>•</span><span>{bold(line.replace(/^\s*[-*]\s/, ''))}</span></div>
    if (line.trim() === '') return <div key={i} style={{ height: 8 }} />
    return <div key={i}>{bold(line)}</div>
  })
}

export default function CommandAiPage() {
  const [threads, setThreads] = useState<Row[]>([])
  const [threadId, setThreadId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Msg[]>([])
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const endRef = useRef<HTMLDivElement>(null)

  const loadThreads = () => fetch('/api/admin/ai').then((r) => r.ok ? r.json() : null).then((d) => d && setThreads(d.threads || [])).catch(() => {})
  useEffect(() => { loadThreads() }, [])
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages, busy])

  const openThread = async (id: string) => {
    setThreadId(id)
    const d = await fetch(`/api/admin/ai?thread=${id}`).then((r) => r.ok ? r.json() : null).catch(() => null)
    setMessages((d?.messages || []).map((m: Row) => ({ role: m.role as 'user' | 'assistant', content: m.content as string, tools_used: (m.tools_used as string[]) || [] })))
  }
  const newChat = () => { setThreadId(null); setMessages([]) }

  const send = async (text?: string) => {
    const msg = (text ?? input).trim()
    if (!msg || busy) return
    setInput(''); setMessages((m) => [...m, { role: 'user', content: msg }]); setBusy(true)
    try {
      const d = await fetch('/api/admin/ai', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'chat', thread_id: threadId, message: msg }) }).then((r) => r.json())
      if (d?.thread_id && !threadId) setThreadId(d.thread_id)
      setMessages((m) => [...m, { role: 'assistant', content: d?.reply || d?.error || 'Something went wrong.', tools_used: d?.toolsUsed || [] }])
      loadThreads()
    } catch { setMessages((m) => [...m, { role: 'assistant', content: 'Network error.' }]) } finally { setBusy(false) }
  }

  const del = async (id: string, e: React.MouseEvent) => { e.stopPropagation(); await fetch('/api/admin/ai', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'delete', thread_id: id }) }); if (id === threadId) newChat(); loadThreads() }

  return (
    <div style={{ display: 'flex', gap: 16, height: 'calc(100vh - 116px)' }}>
      {/* Threads */}
      <div style={{ width: 240, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <Button onClick={newChat}>＋ New chat</Button>
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 3 }}>
          {threads.map((t) => (
            <div key={t.id as string} onClick={() => openThread(t.id as string)}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 11px', borderRadius: 9, cursor: 'pointer', background: threadId === t.id ? '#eef7f1' : 'transparent', fontSize: 13, color: T.text }}>
              <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{(t.title as string) || 'New chat'}</span>
              <button onClick={(e) => del(t.id as string, e)} style={{ border: 'none', background: 'none', color: T.muted, cursor: 'pointer', fontSize: 13 }}>×</button>
            </div>
          ))}
        </div>
      </div>

      {/* Conversation */}
      <div className="a-card" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: 0 }}>
        <div style={{ padding: '14px 20px', borderBottom: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 18 }}>🤖</span>
          <div><div style={{ fontSize: 15, fontWeight: 800, color: T.ink }}>Command AI</div><div style={{ fontSize: 12, color: T.sub }}>Your Chief of Staff — grounded in the whole business</div></div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: 20 }}>
          {messages.length === 0 && !busy && (
            <div style={{ maxWidth: 640, margin: '6vh auto 0' }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: T.ink, marginBottom: 6 }}>What do you want to know about the business?</div>
              <div style={{ fontSize: 13.5, color: T.sub, marginBottom: 18 }}>Grounded in CRM, meetings & Fathom transcripts, coaching calls, revenue, members and the knowledge base.</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {SUGGESTIONS.map((s) => <button key={s} onClick={() => send(s)} style={{ textAlign: 'left', padding: '12px 14px', borderRadius: 10, border: `1px solid ${T.border}`, background: '#fafbfa', color: T.text, fontSize: 13.5, cursor: 'pointer', fontFamily: 'inherit' }}>{s}</button>)}
              </div>
            </div>
          )}
          <div style={{ maxWidth: 760, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
            {messages.map((m, i) => (
              <div key={i} style={{ alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: m.role === 'user' ? '80%' : '100%' }}>
                <div style={{ padding: m.role === 'user' ? '11px 15px' : '2px 2px', borderRadius: 14, background: m.role === 'user' ? T.green2 : 'transparent', color: m.role === 'user' ? '#fff' : T.text, fontSize: 14.5, lineHeight: 1.6 }}>
                  {m.role === 'user' ? m.content : renderMd(m.content)}
                </div>
                {m.role === 'assistant' && m.tools_used && m.tools_used.length > 0 && (
                  <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginTop: 8 }}>
                    {[...new Set(m.tools_used)].map((tool) => <span key={tool} className="a-pill" style={{ background: '#eef2f0', color: T.green, fontSize: 11 }}>⚡ {tool}</span>)}
                  </div>
                )}
              </div>
            ))}
            {busy && <div style={{ alignSelf: 'flex-start', color: T.muted, fontSize: 14 }}>Thinking — reading the business data…</div>}
            <div ref={endRef} />
          </div>
        </div>

        <div style={{ padding: 16, borderTop: `1px solid ${T.border}`, display: 'flex', gap: 8 }}>
          <input className="a-input" placeholder="Ask Command AI anything about the business…" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && send()} disabled={busy} />
          <Button variant="ghost" disabled={busy} onClick={() => send("Give me today's executive briefing with revenue, sales, meetings, tasks, hot leads and my top 3 priorities.")}>Briefing</Button>
          <Button disabled={busy || !input.trim()} onClick={() => send()}>Send</Button>
        </div>
      </div>
    </div>
  )
}
