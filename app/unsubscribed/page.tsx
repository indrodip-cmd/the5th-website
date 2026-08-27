'use client'

import React, { useEffect, useState } from 'react'

/* Landing page shown after a one-click unsubscribe. Confirms the unsubscribe,
   says a warm goodbye, and invites a quick 1-5 rating of the experience. */

const C = {
  cream: '#FAF6F0', white: '#fff', plum: '#3D2645', plumDark: '#2E1A35',
  gold: '#C9A84C', goldDeep: '#B0902F', ink: '#1A1A2E', inkSoft: '#5a5550',
  muted: '#8A8075', border: '#E2DCD2',
}

export default function UnsubscribedPage() {
  const [token, setToken] = useState('')
  const [rating, setRating] = useState(0)
  const [hover, setHover] = useState(0)
  const [comment, setComment] = useState('')
  const [sent, setSent] = useState(false)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    try { setToken(new URLSearchParams(window.location.search).get('t') || '') } catch { /* ignore */ }
  }, [])

  const send = async () => {
    if (!token || rating < 1) return
    setBusy(true)
    try {
      await fetch('/api/unsubscribe/feedback', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, rating, feedback: comment }),
      })
    } catch { /* best-effort */ }
    setBusy(false); setSent(true)
  }

  return (
    <div style={{ minHeight: '100vh', background: C.cream, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px 20px', fontFamily: "'DM Sans', system-ui, -apple-system, sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;1,500&family=DM+Sans:wght@300;400;500;600&display=swap');*{box-sizing:border-box}`}</style>
      <div style={{ maxWidth: 480, width: '100%', background: C.white, border: `1px solid ${C.border}`, borderRadius: 18, padding: '44px 40px', textAlign: 'center', boxShadow: '0 24px 60px -44px rgba(46,26,53,.5)' }}>
        <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 24, fontWeight: 600, color: C.plum, marginBottom: 22 }}>The<em style={{ color: C.goldDeep }}>5th</em></div>

        <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 34, fontWeight: 600, color: C.ink, lineHeight: 1.1, margin: '0 0 12px' }}>
          We&apos;re sorry to see you <em style={{ fontStyle: 'italic', color: C.goldDeep }}>go.</em>
        </h1>
        <p style={{ fontSize: 15.5, color: C.inkSoft, lineHeight: 1.65, margin: '0 0 8px' }}>
          You&apos;ve been unsubscribed and won&apos;t receive further marketing emails from us. You&apos;ll still get essential account and payment messages.
        </p>

        {!sent ? (
          <>
            <div style={{ borderTop: `1px solid ${C.border}`, margin: '28px 0 22px' }} />
            <p style={{ fontSize: 14, color: C.ink, fontWeight: 600, margin: '0 0 14px' }}>Before you go, how was your experience?</p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 18 }}>
              {[1, 2, 3, 4, 5].map(n => (
                <button key={n} onClick={() => setRating(n)} onMouseEnter={() => setHover(n)} onMouseLeave={() => setHover(0)}
                  aria-label={`${n} star${n > 1 ? 's' : ''}`}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 34, lineHeight: 1, padding: 2, color: (hover || rating) >= n ? C.gold : '#D8D0C4', transition: 'color .12s' }}>
                  ★
                </button>
              ))}
            </div>
            <textarea value={comment} onChange={e => setComment(e.target.value)} placeholder="Anything we could have done better? (optional)" rows={3}
              style={{ width: '100%', padding: '12px 14px', fontSize: 14, border: `1px solid ${C.border}`, borderRadius: 10, outline: 'none', color: C.ink, background: C.cream, resize: 'vertical', fontFamily: 'inherit', marginBottom: 14 }} />
            <button onClick={send} disabled={busy || rating < 1}
              style={{ width: '100%', padding: '13px 16px', fontSize: 15, fontWeight: 700, color: C.plumDark, background: rating < 1 ? '#E7DFD2' : `linear-gradient(180deg,#E4C879,${C.gold} 60%,${C.goldDeep})`, border: 'none', borderRadius: 10, cursor: rating < 1 ? 'default' : 'pointer' }}>
              {busy ? 'Sending…' : 'Send feedback'}
            </button>
          </>
        ) : (
          <>
            <div style={{ borderTop: `1px solid ${C.border}`, margin: '28px 0 22px' }} />
            <p style={{ fontSize: 15.5, color: C.ink, lineHeight: 1.6, margin: 0 }}>Thank you, that genuinely helps. We wish you the very best.</p>
          </>
        )}

        <p style={{ fontSize: 13, color: C.muted, marginTop: 26 }}>
          Changed your mind?{' '}
          <a href={token ? `/api/unsubscribe?token=${encodeURIComponent(token)}&resubscribe=1` : '#'} style={{ color: C.goldDeep, fontWeight: 600 }}>Resubscribe</a>
        </p>
      </div>
    </div>
  )
}
