'use client'

import React, { useState } from 'react'

/* Brand tokens (shared with /results, /quiz/results, AI Home). */
const C = {
  cream: '#FAF6F0', ivory: '#FBF8F2', creamDeep: '#EAE3D8',
  plum: '#3D2645', plumDark: '#2E1A35',
  gold: '#C9A84C', goldDeep: '#B0902F', goldLine: 'rgba(201,168,76,.32)',
  ink: '#1A1A2E', inkSoft: '#5a5550', muted: '#8A8075', border: '#E2DCD2', white: '#fff',
  green: '#1C4A32',
}

const CATEGORIES: { value: string; label: string }[] = [
  { value: 'bug', label: 'Report a bug / something broken' },
  { value: 'question', label: 'A question about the service' },
  { value: 'billing', label: 'Billing or payment' },
  { value: 'account', label: 'Account or login' },
  { value: 'feedback', label: 'Feedback or a suggestion' },
  { value: 'other', label: 'Something else' },
]

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '12px 14px', borderRadius: 12, border: `1px solid ${C.border}`,
  fontSize: 15, color: C.ink, background: C.white, outline: 'none', boxSizing: 'border-box',
  fontFamily: 'inherit',
}
const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: 12, fontWeight: 700, letterSpacing: '.04em', textTransform: 'uppercase',
  color: C.muted, marginBottom: 7,
}

export default function TicketForm({ compact = false }: { compact?: boolean }) {
  const [category, setCategory] = useState('bug')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [ref, setRef] = useState('')

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (message.trim().length < 5) { setError('Please describe the issue in a little more detail.'); return }
    setBusy(true)
    try {
      const res = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category, name, email, subject, message,
          pageUrl: typeof window !== 'undefined' ? window.location.href : '',
        }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data?.error || 'Something went wrong. Please try again.'); return }
      setRef(data.ref)
    } catch {
      setError('Network error. Please try again, or email support@10kroadmap.org.')
    } finally {
      setBusy(false)
    }
  }

  if (ref) {
    return (
      <div style={{
        background: C.white, border: `1px solid ${C.goldLine}`, borderRadius: 18,
        padding: compact ? '28px 24px' : '40px 34px', textAlign: 'center',
        boxShadow: '0 18px 44px -22px rgba(61,38,69,0.22)',
      }}>
        <div style={{
          width: 56, height: 56, borderRadius: '50%', background: 'rgba(28,74,50,0.10)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px',
          fontSize: 28,
        }}>✓</div>
        <h3 style={{ fontFamily: 'Georgia, serif', fontSize: 24, color: C.plumDark, margin: '0 0 8px' }}>
          Thank you, we&apos;re on it.
        </h3>
        <p style={{ fontSize: 15, color: C.inkSoft, lineHeight: 1.6, margin: '0 0 14px' }}>
          Your ticket has been logged{email ? ` and we’ll reply to ${email}` : ''}. Keep this reference for your records:
        </p>
        <div style={{
          display: 'inline-block', fontFamily: 'ui-monospace, Menlo, monospace', fontSize: 18, fontWeight: 700,
          color: C.goldDeep, background: C.cream, border: `1px dashed ${C.goldLine}`, borderRadius: 10, padding: '8px 18px',
          letterSpacing: '.05em',
        }}>{ref}</div>
        <div style={{ marginTop: 22 }}>
          <button onClick={() => { setRef(''); setMessage(''); setSubject('') }} style={{
            background: 'transparent', border: 'none', color: C.muted, fontSize: 14, cursor: 'pointer', textDecoration: 'underline',
          }}>Submit another</button>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={submit} style={{
      background: C.white, border: `1px solid ${C.border}`, borderRadius: 18,
      padding: compact ? '24px 22px' : '34px 32px',
      boxShadow: '0 18px 44px -22px rgba(61,38,69,0.18)',
    }}>
      <div style={{ marginBottom: 18 }}>
        <label style={labelStyle}>What can we help with?</label>
        <select value={category} onChange={e => setCategory(e.target.value)} style={{ ...inputStyle, appearance: 'none' }}>
          {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: compact ? '1fr' : '1fr 1fr', gap: 14, marginBottom: 18 }}>
        <div>
          <label style={labelStyle}>Your name <span style={{ color: C.muted, fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional)</span></label>
          <input value={name} onChange={e => setName(e.target.value)} style={inputStyle} placeholder="First name" />
        </div>
        <div>
          <label style={labelStyle}>Email <span style={{ color: C.muted, fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(so we can reply)</span></label>
          <input value={email} onChange={e => setEmail(e.target.value)} type="email" style={inputStyle} placeholder="you@email.com" />
        </div>
      </div>

      <div style={{ marginBottom: 18 }}>
        <label style={labelStyle}>Subject <span style={{ color: C.muted, fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional)</span></label>
        <input value={subject} onChange={e => setSubject(e.target.value)} style={inputStyle} placeholder="A short summary" />
      </div>

      <div style={{ marginBottom: 20 }}>
        <label style={labelStyle}>Tell us what happened</label>
        <textarea value={message} onChange={e => setMessage(e.target.value)} rows={compact ? 4 : 5}
          style={{ ...inputStyle, resize: 'vertical', minHeight: 110 }}
          placeholder="Describe the bug or question. If it's a bug, what were you doing when it happened?" />
      </div>

      {error && <div style={{ color: '#b4231f', fontSize: 14, marginBottom: 14 }}>{error}</div>}

      <button type="submit" disabled={busy} style={{
        width: '100%', padding: '14px 20px', borderRadius: 12, border: 'none',
        background: busy ? C.muted : `linear-gradient(135deg, ${C.gold}, ${C.goldDeep})`,
        color: C.plumDark, fontSize: 15, fontWeight: 700, letterSpacing: '.02em',
        cursor: busy ? 'default' : 'pointer', boxShadow: '0 10px 24px -10px rgba(201,168,76,0.55)',
      }}>{busy ? 'Sending…' : 'Submit ticket'}</button>

      <p style={{ fontSize: 12.5, color: C.muted, textAlign: 'center', margin: '14px 0 0', lineHeight: 1.5 }}>
        Prefer email? Reach us at <a href="mailto:support@10kroadmap.org" style={{ color: C.goldDeep }}>support@10kroadmap.org</a>
      </p>
    </form>
  )
}
