'use client'
/* The5th AI — public demo, styled like a premium AI product (ChatGPT/Claude).
   Sidebar + Projects, time-of-day greeting, presets, 7 free chats → pay modal,
   login/signup, and an in-page Whop checkout. The AI qualifies + nudges the
   $1 / 7-day trial (free ebook). */
import { useEffect, useMemo, useRef, useState } from 'react'

interface Msg { role: 'user' | 'assistant'; content: string }

const CREAM = '#FAF6F0', FOREST = '#1C4A32', GOLD = '#C9A84C', GOLD_DK = '#a9862f', PLUM = '#3D2645', INK = '#1f1a24', MUTE = '#6b6470'
const PLATFORM = 'https://platform.the5th.consulting'

const PRESETS = ['Check my content', 'Plan my next $10K month', 'Fix my funnel leaks', 'Write a warm outreach', 'Package my offer']
const PROJECTS = [
  { icon: '🚀', name: 'Launch Plan', seed: 'Help me build a 7-day launch plan for my offer, day by day.' },
  { icon: '✍️', name: 'Content Engine', seed: 'Give me a week of content ideas and hooks for my audience.' },
  { icon: '🧱', name: 'Offer Builder', seed: 'Help me package my expertise into one clear, sellable offer.' },
  { icon: '💬', name: 'Sales Scripts', seed: 'Write me a warm, non-pushy DM outreach script.' },
]
const PLANS = [
  { key: 'trial', badge: 'Best place to start', title: '$1 Starter', price: '$1', cadence: 'today', sub: 'The Expertise To Income ebook (free) + 7 days of The5th AI. Becomes $47/mo on day 7 unless you cancel.', id: process.env.NEXT_PUBLIC_WHOP_TRIAL_PLAN_ID || 'plan_falzVWtF41bQS', type: 'trial' },
  { key: 'ai', title: 'The5th AI', price: '$47', cadence: '/mo', sub: 'The5th AI + Vega + My Journey — your AI strategist, always on.', id: process.env.NEXT_PUBLIC_WHOP_AI_MONTHLY_PLAN_ID || 'plan_3j4lU1rGraSsI', type: 'ai' },
  { key: 'collective', title: 'The Collective', price: '$197', cadence: '/mo', sub: 'Everything — weekly live calls, AI, Vega, courses & community.', id: process.env.NEXT_PUBLIC_WHOP_COLLECTIVE_MONTHLY_PLAN_ID || 'plan_8iKDrh6vc0Anu', type: 'collective' },
]

function greetingFor(h: number) {
  if (h >= 5 && h < 12) return { big: 'Good morning.', sub: 'Great day to plan your business.' }
  if (h >= 12 && h < 17) return { big: 'Good afternoon.', sub: 'Let’s fix your business leaks.' }
  if (h >= 17 && h < 22) return { big: 'Good evening.', sub: 'Let’s review your business.' }
  return { big: 'Coffee & The5th AI?', sub: 'Late night — let’s make it count.' }
}

function md(t: string) {
  return t.split('\n').map((line, i) => {
    const parts = line.split(/(\*\*[^*]+\*\*)/g).map((p, j) => (p.startsWith('**') && p.endsWith('**') ? <strong key={j}>{p.slice(2, -2)}</strong> : <span key={j}>{p}</span>))
    if (/^\s*[-*]\s/.test(line)) return <div key={i} style={{ display: 'flex', gap: 10, padding: '3px 0' }}><span style={{ color: GOLD }}>•</span><span>{line.replace(/^\s*[-*]\s/, '')}</span></div>
    if (line.trim() === '') return <div key={i} style={{ height: 12 }} />
    return <div key={i}>{parts}</div>
  })
}

export default function Demo() {
  const [vid, setVid] = useState('')
  const [messages, setMessages] = useState<Msg[]>([])
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const [remaining, setRemaining] = useState(7)
  const [showPay, setShowPay] = useState(false)
  const [payReason, setPayReason] = useState<'signup' | 'limit'>('signup')
  const [plan, setPlan] = useState(PLANS[0])
  const [sidebar, setSidebar] = useState(false)
  const endRef = useRef<HTMLDivElement>(null)
  const started = messages.length > 0
  const greeting = useMemo(() => greetingFor(new Date().getHours()), [])

  useEffect(() => {
    let v = ''
    try { v = localStorage.getItem('the5th_demo_vid') || ''; if (!v) { v = 'demo_' + Math.random().toString(36).slice(2) + Date.now().toString(36); localStorage.setItem('the5th_demo_vid', v) } } catch { v = 'demo_' + Date.now() }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- the visitor id is only knowable on the client after mount
    setVid(v)
    const SRC = 'https://js.whop.com/static/checkout/loader.js'
    if (!document.querySelector(`script[src="${SRC}"]`)) { const s = document.createElement('script'); s.src = SRC; s.async = true; document.body.appendChild(s) }
  }, [])
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages, busy])

  async function ask(text: string) {
    const history = [...messages, { role: 'user' as const, content: text }]
    setMessages(history); setBusy(true)
    try {
      const r = await fetch('/api/demo/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ visitor_id: vid, messages: history }) }).then((x) => x.json())
      if (r.limitReached) { setPayReason('limit'); setShowPay(true); return }
      if (r.reply) { setMessages((m) => [...m, { role: 'assistant', content: r.reply }]); setRemaining(r.remaining ?? remaining) }
    } catch { setMessages((m) => [...m, { role: 'assistant', content: 'Something went wrong — please try again.' }]) }
    finally { setBusy(false) }
  }
  const send = (t?: string) => { const msg = (t ?? input).trim(); if (!msg || busy) return; if (remaining <= 0) { setPayReason('limit'); setShowPay(true); return } setInput(''); setSidebar(false); ask(msg) }
  const openSignup = () => { setPayReason('signup'); setPlan(PLANS[0]); setShowPay(true) }

  return (
    <div style={{ height: '100dvh', display: 'flex', background: '#fff', fontFamily: 'Inter, system-ui, sans-serif', color: INK, overflow: 'hidden' }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');*{box-sizing:border-box}
        @keyframes dot{0%,60%,100%{opacity:.25}30%{opacity:1}}@keyframes rise{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
        .d-side{width:264px;flex-shrink:0;background:${CREAM};border-right:1px solid #ece7f0;display:flex;flex-direction:column;transition:transform .25s ease}
        .d-scroll::-webkit-scrollbar{width:6px}.d-scroll::-webkit-scrollbar-thumb{background:#e2dbe8;border-radius:8px}
        .d-chip{border:1px solid #e7e1ec;background:#fff;color:${INK};border-radius:999px;padding:9px 15px;font-size:13.5px;cursor:pointer;font-family:inherit;transition:border-color .15s,transform .15s}
        .d-chip:hover{border-color:${GOLD};transform:translateY(-1px)}
        .d-proj{display:flex;align-items:center;gap:10px;padding:9px 11px;border-radius:10px;cursor:pointer;font-size:13.5px;color:${INK};transition:background .15s}
        .d-proj:hover{background:#fff}
        .d-burger{display:none}
        @media(max-width:820px){.d-side{position:fixed;inset:0 auto 0 0;z-index:60;transform:translateX(-100%);box-shadow:0 0 60px rgba(0,0,0,.2)}.d-side.open{transform:none}.d-burger{display:block!important}}`}</style>

      {sidebar && <div onClick={() => setSidebar(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(20,10,30,.35)', zIndex: 55 }} />}
      <aside className={'d-side' + (sidebar ? ' open' : '')}>
        <div style={{ padding: '18px 16px 12px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 9, background: `linear-gradient(145deg,${GOLD},${GOLD_DK})`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: PLUM, fontWeight: 800, fontFamily: 'Georgia,serif' }}>5</div>
          <div style={{ fontWeight: 800, fontSize: 15.5 }}>The5th AI</div>
        </div>
        <div style={{ padding: '4px 12px 10px' }}>
          <button onClick={() => { setMessages([]); setSidebar(false) }} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 9, padding: '10px 12px', borderRadius: 11, border: '1px solid #e7e1ec', background: '#fff', color: INK, fontSize: 13.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
            <span style={{ fontSize: 16 }}>✎</span> New chat
          </button>
        </div>
        <div className="d-scroll" style={{ flex: 1, overflowY: 'auto', padding: '6px 8px' }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: MUTE, padding: '8px 8px 6px' }}>Projects</div>
          {PROJECTS.map((p) => (<div key={p.name} className="d-proj" onClick={() => send(p.seed)}><span>{p.icon}</span><span>{p.name}</span></div>))}
        </div>
        <div style={{ padding: 12, borderTop: '1px solid #ece7f0' }}>
          <button onClick={openSignup} style={{ width: '100%', padding: '11px', borderRadius: 11, border: 'none', background: `linear-gradient(145deg,${GOLD},${GOLD_DK})`, color: '#1a1206', fontWeight: 800, fontSize: 13.5, cursor: 'pointer', fontFamily: 'inherit' }}>Start for $1 — get the ebook</button>
        </div>
      </aside>

      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 18px', borderBottom: '1px solid #f0ecf3' }}>
          <button onClick={() => setSidebar(true)} className="d-burger" style={{ border: 'none', background: 'transparent', fontSize: 20, cursor: 'pointer' }}>☰</button>
          <div style={{ fontSize: 13.5, color: MUTE }}>{started ? `${remaining} free ${remaining === 1 ? 'reply' : 'replies'} left` : 'The5th AI — live demo'}</div>
          <div style={{ display: 'flex', gap: 8 }}>
            <a href={PLATFORM} style={{ padding: '8px 15px', borderRadius: 10, border: '1px solid #e7e1ec', color: INK, fontSize: 13.5, fontWeight: 600, textDecoration: 'none' }}>Log in</a>
            <button onClick={openSignup} style={{ padding: '8px 16px', borderRadius: 10, border: 'none', background: FOREST, color: '#fff', fontSize: 13.5, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>Sign up</button>
          </div>
        </header>

        <div className="d-scroll" style={{ flex: 1, overflowY: 'auto' }}>
          {!started ? (
            <div style={{ maxWidth: 720, margin: '0 auto', padding: '9vh 20px 20px', animation: 'rise .5s ease' }}>
              <h1 style={{ fontFamily: 'Gelica, Georgia, serif', fontSize: 'clamp(30px,5vw,44px)', fontWeight: 700, letterSpacing: '-.02em', margin: 0, color: INK }}>
                {greeting.big} <span style={{ color: GOLD_DK }}>{greeting.sub}</span>
              </h1>
              <p style={{ fontSize: 16.5, color: MUTE, lineHeight: 1.6, marginTop: 14, maxWidth: 560 }}>
                I’m The5th AI. Tell me what you’re building and where you’re stuck — I’ll help you decide your next move, and whether The5th is right for you.
              </p>
              <div style={{ marginTop: 26 }}><Composer input={input} setInput={setInput} onSend={() => send()} busy={busy} big /></div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 9, marginTop: 18 }}>
                {PRESETS.map((s) => <button key={s} className="d-chip" onClick={() => send(s)}>{s}</button>)}
              </div>
            </div>
          ) : (
            <div style={{ maxWidth: 720, margin: '0 auto', padding: '22px 20px 12px' }}>
              {messages.map((m, i) => (
                <div key={i} style={{ display: 'flex', gap: 13, margin: '18px 0', animation: 'rise .3s ease' }}>
                  <div style={{ width: 30, height: 30, borderRadius: 8, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, background: m.role === 'user' ? '#ece7f0' : `linear-gradient(145deg,${GOLD},${GOLD_DK})`, color: m.role === 'user' ? PLUM : '#1a1206', fontFamily: 'Georgia,serif' }}>{m.role === 'user' ? 'You' : '5'}</div>
                  <div style={{ flex: 1, fontSize: 15.5, lineHeight: 1.72, color: INK, paddingTop: 3 }}>{md(m.content)}</div>
                </div>
              ))}
              {busy && <div style={{ display: 'flex', gap: 13, margin: '18px 0' }}><div style={{ width: 30, height: 30, borderRadius: 8, background: `linear-gradient(145deg,${GOLD},${GOLD_DK})`, color: '#1a1206', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontFamily: 'Georgia,serif' }}>5</div><div style={{ display: 'flex', gap: 4, alignItems: 'center', paddingTop: 12 }}>{[0, 1, 2].map((i) => <span key={i} style={{ width: 7, height: 7, borderRadius: '50%', background: GOLD_DK, animation: `dot 1.2s ${i * 0.15}s infinite` }} />)}</div></div>}
              <div ref={endRef} />
            </div>
          )}
        </div>

        {started && (
          <div style={{ borderTop: '1px solid #f0ecf3', padding: '12px 20px 6px' }}>
            <div style={{ maxWidth: 720, margin: '0 auto' }}><Composer input={input} setInput={setInput} onSend={() => send()} busy={busy} /></div>
          </div>
        )}
        <footer style={{ textAlign: 'center', padding: '8px 20px 14px', fontSize: 11.5, color: '#a99fb2', lineHeight: 1.5 }}>
          The5th AI, designed by The5th Consulting. By using it, you agree to our <a href="/terms" style={{ color: '#a99fb2', textDecoration: 'underline' }}>Terms</a> &amp; <a href="/privacy" style={{ color: '#a99fb2', textDecoration: 'underline' }}>Privacy Policy</a>. Chats may be reviewed and used to improve our AI models. <a href="/privacy" style={{ color: GOLD_DK, textDecoration: 'underline' }}>Learn more</a>.
        </footer>
      </main>

      {showPay && <PayModal reason={payReason} plan={plan} setPlan={setPlan} onClose={() => setShowPay(false)} />}
    </div>
  )
}

function Composer({ input, setInput, onSend, busy, big }: { input: string; setInput: (v: string) => void; onSend: () => void; busy: boolean; big?: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, background: '#fff', border: '1px solid #e2dbe8', borderRadius: 16, padding: '8px 8px 8px 16px', boxShadow: big ? '0 10px 34px rgba(40,20,50,.06)' : 'none' }}>
      <textarea value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); onSend() } }} rows={1} placeholder="Message The5th AI…"
        style={{ flex: 1, resize: 'none', border: 'none', outline: 'none', fontSize: 15.5, fontFamily: 'inherit', color: INK, maxHeight: 160, padding: big ? '10px 0' : '8px 0', background: 'transparent' }} />
      <button onClick={onSend} disabled={busy || !input.trim()} aria-label="Send" style={{ width: 40, height: 40, flexShrink: 0, borderRadius: 11, border: 'none', cursor: busy || !input.trim() ? 'default' : 'pointer', background: input.trim() ? FOREST : '#ece7f0', color: input.trim() ? '#fff' : '#b3abbb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="19" x2="12" y2="5" /><polyline points="5 12 12 5 19 12" /></svg>
      </button>
    </div>
  )
}

function PayModal({ reason, plan, setPlan, onClose }: { reason: 'signup' | 'limit'; plan: typeof PLANS[number]; setPlan: (p: typeof PLANS[number]) => void; onClose: () => void }) {
  const redirect = `https://the5th.consulting/checkout/complete?type=${plan.type}`
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={onClose}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(28,20,40,.5)', backdropFilter: 'blur(6px)' }} />
      <div onClick={(e) => e.stopPropagation()} style={{ position: 'relative', background: CREAM, borderRadius: 22, width: '100%', maxWidth: 540, maxHeight: '92vh', overflow: 'auto', boxShadow: '0 30px 90px rgba(20,10,30,.4)', border: '1px solid #ece7f0' }}>
        <button onClick={onClose} aria-label="Close" style={{ position: 'absolute', top: 14, right: 16, width: 32, height: 32, borderRadius: '50%', border: 'none', background: '#fff', color: MUTE, cursor: 'pointer', fontSize: 15 }}>✕</button>
        <div style={{ padding: '26px 24px 6px', textAlign: 'center' }}>
          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', color: FOREST }}>{reason === 'limit' ? 'You’re out of free replies' : 'Start with The5th'}</div>
          <h2 style={{ fontFamily: 'Gelica, Georgia, serif', fontSize: 25, fontWeight: 700, color: INK, margin: '8px 0 4px' }}>{reason === 'limit' ? 'Loved it? Keep going.' : 'Pick your plan'}</h2>
          <p style={{ fontSize: 13.5, color: MUTE, margin: 0 }}>Start for $1 today — includes the free ebook and 7 days of The5th AI.</p>
        </div>
        <div style={{ padding: '16px 20px 4px', display: 'grid', gap: 10 }}>
          {PLANS.map((p) => (
            <button key={p.key} onClick={() => setPlan(p)} style={{ textAlign: 'left', display: 'flex', alignItems: 'center', gap: 12, padding: '13px 15px', borderRadius: 14, cursor: 'pointer', fontFamily: 'inherit', background: '#fff', border: `2px solid ${plan.key === p.key ? FOREST : '#ece7f0'}` }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 15, fontWeight: 700, color: INK }}>{p.title}</span>
                  {p.badge && <span style={{ fontSize: 9.5, fontWeight: 800, letterSpacing: .5, color: '#fff', background: GOLD_DK, borderRadius: 999, padding: '2px 7px' }}>{p.badge.toUpperCase()}</span>}
                </div>
                <div style={{ fontSize: 12.5, color: MUTE, lineHeight: 1.45, marginTop: 3 }}>{p.sub}</div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}><span style={{ fontFamily: 'Gelica,Georgia,serif', fontSize: 22, fontWeight: 700, color: FOREST }}>{p.price}</span><span style={{ fontSize: 12, color: MUTE }}> {p.cadence}</span></div>
            </button>
          ))}
        </div>
        <div style={{ padding: '10px 20px 22px' }}>
          <div key={plan.id} data-whop-checkout-plan-id={plan.id} data-whop-checkout-theme="light" data-whop-checkout-redirect-url={redirect} style={{ height: 'fit-content', overflow: 'hidden', maxWidth: 500, margin: '0 auto', width: '100%', minHeight: 70 }} />
          <p style={{ textAlign: 'center', fontSize: 11, color: '#a99fb2', marginTop: 10 }}>Secure checkout · Powered by Whop · Cancel anytime</p>
        </div>
      </div>
    </div>
  )
}
