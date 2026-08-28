'use client'
/* ─────────────────────────────────────────────────────────────────────────
   Ivy — the proactive AI sales concierge for the workbook page.

   Behaviour the page owner asked for:
   - Stays quiet, then proactively surfaces ~60s in (or on exit-intent) when the
     visitor hasn't decided yet.
   - When it reaches out, the message is VISIBLE in a teaser bubble above the
     launcher — the visitor can read exactly what Ivy said and start the
     conversation straight from it (the teaser text becomes the first message).
   - Full two-way chat backed by /api/workbook-chat (Claude Sonnet) that answers
     objections and closes the sale.
   Brand-styled (plum + gold + green + parchment, Cormorant + DM Sans).
   ───────────────────────────────────────────────────────────────────────── */
import { useEffect, useRef, useState } from 'react'

const PLUM = '#3D2645'
const PLUM_DK = '#2E1A35'
const GOLD = '#C9A84C'
const GOLD_LINE = 'rgba(201,168,76,0.35)'
const GREEN = '#1C4A32'
const PARCH = '#FAF6F0'
const INK = '#1A1A2E'
const INK_MID = '#403b3b'
const INK_MUTE = '#8A8075'
const BORDER = '#DDD8CF'
const WHITE = '#fff'
const SERIF = "'Cormorant Garamond', Georgia, Times, serif"
const SANS = "'DM Sans', system-ui, -apple-system, sans-serif"

const OPENER = "Hi — I'm Ivy 👋 Still weighing it up? The whole workbook is $7.93 and it's backed by our $5K promise. Want me to tell you what's inside?"

type Msg = { role: 'user' | 'assistant'; content: string }

/* Render assistant text with clickable links + line breaks. */
function RichText({ text }: { text: string }) {
  const parts = text.split(/(https?:\/\/[^\s)]+)/g)
  return (
    <>
      {parts.map((p, i) =>
        /^https?:\/\//.test(p)
          ? <a key={i} href={p} target="_blank" rel="noopener noreferrer" style={{ color: GREEN, fontWeight: 600, wordBreak: 'break-word' }}>{p}</a>
          : <span key={i}>{p}</span>
      )}
    </>
  )
}

export default function WorkbookChat() {
  const [open, setOpen] = useState(false)
  const [teaser, setTeaser] = useState(false)
  const [messages, setMessages] = useState<Msg[]>([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const firedRef = useRef(false)
  const scrollRef = useRef<HTMLDivElement | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)

  // Proactive trigger: 60s dwell OR exit-intent, once per session.
  useEffect(() => {
    if (typeof window === 'undefined') return
    try { if (sessionStorage.getItem('ka_chat_seen') === '1') return } catch { /* ignore */ }
    const fire = () => {
      if (firedRef.current) return
      firedRef.current = true
      try { sessionStorage.setItem('ka_chat_seen', '1') } catch { /* ignore */ }
      setMessages([{ role: 'assistant', content: OPENER }])
      setTeaser(true)
    }
    const t = setTimeout(fire, 60000)
    const onLeave = (e: MouseEvent) => { if (e.clientY <= 0) fire() }
    document.addEventListener('mouseout', onLeave)
    return () => { clearTimeout(t); document.removeEventListener('mouseout', onLeave) }
  }, [])

  // Autoscroll on new messages / typing.
  useEffect(() => { const el = scrollRef.current; if (el) el.scrollTop = el.scrollHeight }, [messages, sending, open])

  const launch = () => {
    setTeaser(false)
    setOpen(true)
    if (!messages.length) setMessages([{ role: 'assistant', content: OPENER }])
    setTimeout(() => inputRef.current?.focus(), 60)
  }

  const send = async (text: string) => {
    const clean = text.trim()
    if (!clean || sending) return
    const next: Msg[] = [...messages, { role: 'user', content: clean }]
    setMessages(next)
    setInput('')
    setSending(true)
    try {
      const r = await fetch('/api/workbook-chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages: next }) })
      const data = await r.json().catch(() => ({}))
      setMessages([...next, { role: 'assistant', content: data?.reply || "I hit a snag — but the button on the page gets you in for $7.93 with the $5K promise." }])
    } catch {
      setMessages([...next, { role: 'assistant', content: "I hit a snag — but the green button on the page gets you in for $7.93 with the $5K promise." }])
    } finally {
      setSending(false)
      setTimeout(() => inputRef.current?.focus(), 40)
    }
  }

  const CHIPS = ["What's inside?", 'How does the $5K promise work?', 'I have no time', 'Is it worth $7.93?']

  return (
    <div style={{ fontFamily: SANS, position: 'fixed', right: 'clamp(14px,3vw,26px)', bottom: 'clamp(78px,9vw,26px)', zIndex: 60, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 12, pointerEvents: 'none' }}>
      {/* Panel */}
      {open && (
        <div role="dialog" aria-label="Chat with Ivy" style={{ pointerEvents: 'auto', width: 'min(370px, calc(100vw - 28px))', height: 'min(520px, calc(100dvh - 130px))', background: PARCH, border: `1px solid ${BORDER}`, borderRadius: 16, boxShadow: '0 30px 80px rgba(46,26,53,.34)', display: 'flex', flexDirection: 'column', overflow: 'hidden', animation: 'kachat-in .28s cubic-bezier(.22,1,.36,1)' }}>
          {/* Header */}
          <div style={{ background: `linear-gradient(160deg,${PLUM},${PLUM_DK})`, color: WHITE, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 11, borderBottom: `1px solid ${GOLD_LINE}` }}>
            <div style={{ width: 38, height: 38, borderRadius: '50%', background: `linear-gradient(180deg,#E4C879,#C9A84C)`, color: PLUM_DK, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: SERIF, fontWeight: 600, fontSize: 20, flexShrink: 0 }}>I</div>
            <div style={{ lineHeight: 1.2, flex: 1 }}>
              <div style={{ fontFamily: SERIF, fontSize: 19, fontWeight: 600 }}>Ivy</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,.72)', display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ width: 7, height: 7, borderRadius: '50%', background: '#5fd08a' }} /> The Knowledge Asset concierge</div>
            </div>
            <button type="button" aria-label="Close chat" onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,.8)', cursor: 'pointer', fontSize: 22, lineHeight: 1, padding: 4 }}>×</button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '16px 14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {messages.map((m, i) => (
              <div key={i} style={{ alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '86%' }}>
                <div style={{ background: m.role === 'user' ? GREEN : WHITE, color: m.role === 'user' ? WHITE : INK_MID, border: m.role === 'user' ? 'none' : `1px solid ${BORDER}`, borderRadius: m.role === 'user' ? '14px 14px 4px 14px' : '14px 14px 14px 4px', padding: '10px 13px', fontSize: 14.5, lineHeight: 1.55, whiteSpace: 'pre-wrap' }}>
                  <RichText text={m.content} />
                </div>
              </div>
            ))}
            {sending && (
              <div style={{ alignSelf: 'flex-start', background: WHITE, border: `1px solid ${BORDER}`, borderRadius: '14px 14px 14px 4px', padding: '12px 14px', display: 'flex', gap: 4 }}>
                {[0, 1, 2].map((d) => <span key={d} style={{ width: 6, height: 6, borderRadius: '50%', background: INK_MUTE, animation: `kachat-dot 1s ${d * 0.15}s infinite ease-in-out` }} />)}
              </div>
            )}
            {messages.length <= 1 && !sending && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginTop: 4 }}>
                {CHIPS.map((c) => (
                  <button key={c} type="button" onClick={() => send(c)} style={{ background: WHITE, border: `1px solid ${GOLD_LINE}`, color: PLUM, fontFamily: SANS, fontSize: 12.5, fontWeight: 500, padding: '7px 12px', borderRadius: 100, cursor: 'pointer' }}>{c}</button>
                ))}
              </div>
            )}
          </div>

          {/* Composer */}
          <form onSubmit={(e) => { e.preventDefault(); send(input) }} style={{ borderTop: `1px solid ${BORDER}`, background: WHITE, padding: '10px 10px 10px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <input ref={inputRef} value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask Ivy anything…" aria-label="Message" style={{ flex: 1, border: 'none', outline: 'none', fontFamily: SANS, fontSize: 14.5, color: INK, background: 'transparent', minWidth: 0 }} />
            <button type="submit" aria-label="Send" disabled={!input.trim() || sending} style={{ width: 40, height: 40, borderRadius: '50%', border: 'none', background: input.trim() && !sending ? GREEN : '#c9c4bb', color: WHITE, cursor: input.trim() && !sending ? 'pointer' : 'default', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background .2s' }}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>
            </button>
          </form>
          <div style={{ background: WHITE, textAlign: 'center', fontSize: 10.5, color: INK_MUTE, padding: '0 0 8px' }}>Ivy is an AI assistant · answers may be imperfect</div>
        </div>
      )}

      {/* Teaser bubble (visible proactive message) */}
      {teaser && !open && (
        <div style={{ pointerEvents: 'auto', width: 'min(300px, calc(100vw - 40px))', background: WHITE, border: `1px solid ${BORDER}`, borderRadius: '16px 16px 4px 16px', boxShadow: '0 20px 50px rgba(46,26,53,.24)', padding: '14px 14px 14px 15px', position: 'relative', animation: 'kachat-in .3s cubic-bezier(.22,1,.36,1)', cursor: 'pointer' }} onClick={launch}>
          <button type="button" aria-label="Dismiss" onClick={(e) => { e.stopPropagation(); setTeaser(false) }} style={{ position: 'absolute', top: 6, right: 8, background: 'none', border: 'none', color: INK_MUTE, cursor: 'pointer', fontSize: 16, lineHeight: 1 }}>×</button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 7 }}>
            <div style={{ width: 26, height: 26, borderRadius: '50%', background: `linear-gradient(180deg,#E4C879,#C9A84C)`, color: PLUM_DK, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: SERIF, fontWeight: 600, fontSize: 14 }}>I</div>
            <span style={{ fontFamily: SANS, fontSize: 12, fontWeight: 700, color: PLUM, letterSpacing: '.02em' }}>Ivy</span>
          </div>
          <p style={{ fontFamily: SANS, fontSize: 14, lineHeight: 1.5, color: INK_MID, margin: 0 }}>{OPENER}</p>
          <div style={{ marginTop: 10, display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: SANS, fontSize: 12.5, fontWeight: 600, color: GREEN }}>Reply to Ivy <span aria-hidden>→</span></div>
        </div>
      )}

      {/* Launcher */}
      <button type="button" aria-label={open ? 'Close chat' : 'Chat with Ivy'} onClick={() => (open ? setOpen(false) : launch())} style={{ pointerEvents: 'auto', width: 58, height: 58, borderRadius: '50%', border: `1px solid ${GOLD_LINE}`, background: `linear-gradient(160deg,${PLUM},${PLUM_DK})`, color: WHITE, cursor: 'pointer', boxShadow: '0 14px 34px rgba(46,26,53,.36)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', flexShrink: 0 }}>
        {!open && teaser && <span style={{ position: 'absolute', top: -2, right: -2, width: 16, height: 16, borderRadius: '50%', background: GREEN, border: `2px solid ${PARCH}` }} />}
        {open ? (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M21 11.5a8.38 8.38 0 0 1-8.5 8.5 8.5 8.5 0 0 1-3.6-.8L3 21l1.9-5.7A8.38 8.38 0 0 1 4 11.5 8.5 8.5 0 0 1 12.5 3 8.38 8.38 0 0 1 21 11.5z" /></svg>
        )}
      </button>

      <style>{`
        @keyframes kachat-in{from{opacity:0;transform:translateY(14px) scale(.98)}to{opacity:1;transform:none}}
        @keyframes kachat-dot{0%,80%,100%{transform:scale(.6);opacity:.4}40%{transform:scale(1);opacity:1}}
        @media(prefers-reduced-motion:reduce){[style*="kachat-in"]{animation:none!important}}
      `}</style>
    </div>
  )
}
