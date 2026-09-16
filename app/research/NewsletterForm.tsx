'use client'

import { useState } from 'react'

const G = { gold: '#C9A84C', goldDeep: '#E4C879' }

export default function NewsletterForm() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [state, setState] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')
  const [msg, setMsg] = useState('')

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (state === 'loading') return
    setState('loading'); setMsg('')
    try {
      const r = await fetch('/api/research/subscribe', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email }),
      })
      const j = await r.json().catch(() => ({}))
      if (!r.ok) { setState('error'); setMsg(j?.error || 'Something went wrong. Please try again.'); return }
      setState('done')
    } catch {
      setState('error'); setMsg('Network error. Please try again.')
    }
  }

  const field: React.CSSProperties = {
    width: '100%', background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.2)',
    borderRadius: 12, color: '#fff', fontSize: 15.5, padding: '14px 16px', fontFamily: 'inherit', outline: 'none',
  }

  if (state === 'done') {
    return (
      <div style={{ textAlign: 'center', padding: '8px 0' }}>
        <div style={{ fontSize: 34, marginBottom: 8 }} aria-hidden>✓</div>
        <h3 style={{ fontFamily: 'Georgia, serif', fontSize: 24, color: '#fff', margin: '0 0 8px' }}>You’re on the list.</h3>
        <p style={{ color: 'rgba(255,255,255,.75)', fontSize: 15.5, lineHeight: 1.6, margin: 0 }}>
          New research lands in your inbox the moment it’s published. No noise, no selling, just the work.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={submit} style={{ display: 'grid', gap: 12 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }} className="nl-row">
        <input aria-label="First name" placeholder="First name" value={name} onChange={(e) => setName(e.target.value)} style={field}
          onFocus={(e) => (e.currentTarget.style.borderColor = G.gold)} onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(255,255,255,.2)')} />
        <input aria-label="Email address" type="email" required placeholder="you@work.com" value={email} onChange={(e) => setEmail(e.target.value)} style={field}
          onFocus={(e) => (e.currentTarget.style.borderColor = G.gold)} onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(255,255,255,.2)')} />
      </div>
      <button type="submit" disabled={state === 'loading'} style={{
        appearance: 'none', border: 'none', cursor: state === 'loading' ? 'wait' : 'pointer',
        background: `linear-gradient(180deg, ${G.goldDeep}, ${G.gold})`, color: '#2E1A35', fontWeight: 800,
        fontSize: 16, borderRadius: 12, padding: '15px 20px', fontFamily: 'inherit', letterSpacing: '.01em',
        opacity: state === 'loading' ? 0.7 : 1, transition: 'filter .15s ease',
      }}>
        {state === 'loading' ? 'Subscribing…' : 'Get new research →'}
      </button>
      {state === 'error' && <p style={{ color: '#F0C4C0', fontSize: 13.5, margin: 0 }}>{msg}</p>}
      <p style={{ color: 'rgba(255,255,255,.5)', fontSize: 12.5, margin: '2px 0 0', lineHeight: 1.5 }}>
        Occasional, in-depth. Unsubscribe anytime.
      </p>
      <style>{`@media(max-width:520px){.nl-row{grid-template-columns:1fr!important}}`}</style>
    </form>
  )
}
