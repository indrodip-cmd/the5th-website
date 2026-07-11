'use client'
/* The5th AI — public demo. Minimalist, Claude/ChatGPT-style. 7 free chats;
   after the first, a gentle name+email gate. Captures the lead into the CRM. */
import { useEffect, useRef, useState } from 'react'

interface Msg { role: 'user' | 'assistant'; content: string }
const SUGGESTIONS = ['How do I price my first coaching offer?', 'Write me a warm outreach message', 'What should my $10K/month plan look like?']

function md(t: string) {
  return t.split('\n').map((line, i) => {
    const parts = line.split(/(\*\*[^*]+\*\*)/g).map((p, j) => p.startsWith('**') && p.endsWith('**') ? <strong key={j}>{p.slice(2, -2)}</strong> : <span key={j}>{p}</span>)
    if (/^\s*[-*]\s/.test(line)) return <div key={i} style={{ display: 'flex', gap: 10, padding: '3px 0' }}><span style={{ color: '#C9A84C' }}>•</span><span>{line.replace(/^\s*[-*]\s/, '')}</span></div>
    if (line.trim() === '') return <div key={i} style={{ height: 14 }} />
    return <div key={i}>{parts}</div>
  })
}

export default function Demo() {
  const [vid, setVid] = useState('')
  const [messages, setMessages] = useState<Msg[]>([])
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const [gate, setGate] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [remaining, setRemaining] = useState(7)
  const [limit, setLimit] = useState(false)
  const endRef = useRef<HTMLDivElement>(null)
  const started = messages.length > 0

  useEffect(() => {
    let v = ''
    try { v = localStorage.getItem('the5th_demo_vid') || ''; if (!v) { v = 'demo_' + Math.random().toString(36).slice(2) + Date.now().toString(36); localStorage.setItem('the5th_demo_vid', v) } } catch { v = 'demo_' + Date.now() }
    setVid(v)
  }, [])
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages, busy, gate])

  async function ask(text: string, contact?: { name: string; email: string }) {
    const history = contact ? messages : [...messages, { role: 'user' as const, content: text }]
    if (!contact) setMessages(history)
    setBusy(true)
    try {
      const r = await fetch('/api/demo/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ visitor_id: vid, messages: history, name: contact?.name, email: contact?.email }) }).then((x) => x.json())
      if (r.needsContact) { setGate(true); return }
      if (r.limitReached) { setLimit(true); return }
      if (r.reply) { setMessages((m) => [...m, { role: 'assistant', content: r.reply }]); setRemaining(r.remaining ?? remaining) }
    } catch { setMessages((m) => [...m, { role: 'assistant', content: 'Something went wrong — please try again.' }]) }
    finally { setBusy(false) }
  }

  const send = (t?: string) => { const msg = (t ?? input).trim(); if (!msg || busy || limit) return; setInput(''); ask(msg) }
  const submitGate = async () => {
    if (!name.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return
    setGate(false)
    await ask('', { name: name.trim(), email: email.trim() })   // unlock, then continue the last message
  }

  return (
    <div style={{ minHeight: '100dvh', background: '#faf9fb', display: 'flex', flexDirection: 'column', fontFamily: 'Inter, system-ui, sans-serif', color: '#1c1720' }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap'); *{box-sizing:border-box} @keyframes dot{0%,60%,100%{opacity:.3}30%{opacity:1}} @keyframes rise{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}`}</style>

      <header style={{ padding: '24px 34px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <a href="/ai" style={{ fontSize: 18, fontWeight: 800, letterSpacing: '-.01em', color: '#3D2645', textDecoration: 'none' }}>The<span style={{ color: '#C9A84C' }}>5th</span> AI</a>
        {started && <span style={{ marginLeft: 'auto', fontSize: 12.5, color: '#9b93a3' }}>{limit ? 'Demo complete' : `${remaining} free left`}</span>}
      </header>

      <main style={{ flex: 1, width: '100%', maxWidth: 768, margin: '0 auto', padding: '0 28px', display: 'flex', flexDirection: 'column' }}>
        {!started ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', paddingBottom: '15vh' }}>
            <div style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-.02em', textAlign: 'center', marginBottom: 40, color: '#2a2233' }}>What are you working on?</div>
            <Composer input={input} setInput={setInput} onSend={() => send()} busy={busy} autoFocus />
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center', marginTop: 24 }}>
              {SUGGESTIONS.map((s) => <button key={s} onClick={() => send(s)} style={chip}>{s}</button>)}
            </div>
          </div>
        ) : (
          <>
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px 0 28px' }}>
              {messages.map((m, i) => (
                <div key={i} style={{ animation: 'rise .25s ease', margin: '28px 0' }}>
                  {m.role === 'user'
                    ? <div style={{ display: 'flex', justifyContent: 'flex-end' }}><div style={{ background: '#3D2645', color: '#fff', padding: '13px 18px', borderRadius: '18px 18px 5px 18px', fontSize: 15.5, lineHeight: 1.55, maxWidth: '82%' }}>{m.content}</div></div>
                    : <div style={{ fontSize: 16.5, lineHeight: 1.8, color: '#2a2233' }}>{md(m.content)}</div>}
                </div>
              ))}
              {busy && <div style={{ display: 'flex', gap: 5, padding: '8px 0' }}>{[0, 1, 2].map((d) => <span key={d} style={{ width: 7, height: 7, borderRadius: '50%', background: '#C9A84C', animation: `dot 1.1s ${d * 0.16}s infinite` }} />)}</div>}
              {gate && <div style={{ animation: 'rise .25s ease', background: '#fff', border: '1px solid #ece7f0', borderRadius: 18, padding: 20, margin: '10px 0', boxShadow: '0 8px 30px rgba(40,20,50,.06)' }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#2a2233', marginBottom: 4 }}>Continue for free</div>
                <div style={{ fontSize: 13.5, color: '#6b6472', marginBottom: 14 }}>Tell us where to send your insights and keep chatting.</div>
                <input placeholder="First name" value={name} onChange={(e) => setName(e.target.value)} style={field} />
                <input placeholder="Email address" type="email" value={email} onChange={(e) => setEmail(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && submitGate()} style={{ ...field, marginTop: 8 }} />
                <button onClick={submitGate} style={{ ...gold, width: '100%', marginTop: 12 }}>Continue →</button>
                <div style={{ fontSize: 11, color: '#a49bad', marginTop: 8, textAlign: 'center' }}>No spam. Unsubscribe anytime.</div>
              </div>}
              {limit && <div style={{ animation: 'rise .25s ease', background: 'linear-gradient(160deg,#2A1830,#160D1A)', borderRadius: 20, padding: 26, margin: '12px 0', textAlign: 'center' }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: '#fff', marginBottom: 6 }}>You’ve explored the demo ✦</div>
                <div style={{ fontSize: 14, color: 'rgba(255,255,255,.7)', marginBottom: 18 }}>Get the full The5th AI — your CMO, trained on the 10K Roadmap, 24/7.</div>
                <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
                  <a href="/ai" style={gold}>Get The5th AI</a>
                  <a href="/call" style={ghost}>Book a call</a>
                </div>
              </div>}
              <div ref={endRef} />
            </div>
            {!limit && !gate && <div style={{ paddingBottom: 28 }}><Composer input={input} setInput={setInput} onSend={() => send()} busy={busy} /></div>}
          </>
        )}
      </main>
      <div style={{ textAlign: 'center', fontSize: 11.5, color: '#b3abbb', padding: '10px 0 16px' }}>Powered by The5th AI</div>
    </div>
  )
}

function Composer({ input, setInput, onSend, busy, autoFocus }: { input: string; setInput: (v: string) => void; onSend: () => void; busy: boolean; autoFocus?: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, background: '#fff', border: '1px solid #e7e2ec', borderRadius: 22, padding: '12px 12px 12px 22px', boxShadow: '0 8px 30px rgba(40,20,50,.07)' }}>
      <textarea value={input} onChange={(e) => setInput(e.target.value)} autoFocus={autoFocus} rows={1}
        onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); onSend() } }}
        placeholder="Ask The5th AI anything…"
        style={{ flex: 1, border: 'none', outline: 'none', resize: 'none', fontSize: 16.5, fontFamily: 'inherit', color: '#1c1720', background: 'none', maxHeight: 200, padding: '11px 0', lineHeight: 1.55 }} />
      <button onClick={onSend} disabled={busy || !input.trim()} aria-label="Send"
        style={{ width: 42, height: 42, borderRadius: 14, border: 'none', flexShrink: 0, cursor: busy || !input.trim() ? 'default' : 'pointer', background: input.trim() ? 'linear-gradient(145deg,#C9A84C,#a9862f)' : '#e7e2ec', color: input.trim() ? '#1a1206' : '#b3abbb', fontSize: 18, transition: 'background .2s' }}>↑</button>
    </div>
  )
}

const chip: React.CSSProperties = { border: '1px solid #e7e2ec', background: '#fff', borderRadius: 999, padding: '10px 17px', fontSize: 13.5, color: '#6b6472', cursor: 'pointer', fontFamily: 'inherit' }
const field: React.CSSProperties = { width: '100%', padding: '11px 14px', border: '1px solid #e7e2ec', borderRadius: 11, fontSize: 14.5, fontFamily: 'inherit', outline: 'none' }
const gold: React.CSSProperties = { display: 'inline-block', background: 'linear-gradient(145deg,#C9A84C,#a9862f)', color: '#1a1206', fontWeight: 700, fontSize: 14, padding: '11px 22px', borderRadius: 12, border: 'none', textDecoration: 'none', cursor: 'pointer' }
const ghost: React.CSSProperties = { display: 'inline-block', background: 'rgba(255,255,255,.1)', color: '#fff', fontWeight: 600, fontSize: 14, padding: '11px 22px', borderRadius: 12, border: '1px solid rgba(255,255,255,.2)', textDecoration: 'none' }
