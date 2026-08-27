'use client'

import React, { Suspense, useState } from 'react'
import Image from 'next/image'
import { useSearchParams } from 'next/navigation'

/* Branded landing shown after a one-click unsubscribe. Warm and empathetic —
   we genuinely wish them well — with an optional 1-5 experience rating. Also
   handles the invalid-link and resubscribed outcomes so every path is pretty. */

const C = {
  cream: '#FAF6F0', white: '#fff', plum: '#3D2645', plumDark: '#2E1A35',
  gold: '#C9A84C', goldDeep: '#B0902F', ink: '#1A1A2E', inkSoft: '#5a5550',
  muted: '#8A8075', border: '#ECE4DA',
}

type Mode = 'gone' | 'invalid' | 'resub'

function UnsubscribedInner() {
  const sp = useSearchParams()
  const token = sp.get('t') || ''
  const mode: Mode = sp.get('e') === 'invalid' ? 'invalid' : sp.get('resub') === '1' ? 'resub' : 'gone'

  const [rating, setRating] = useState(0)
  const [hover, setHover] = useState(0)
  const [comment, setComment] = useState('')
  const [sent, setSent] = useState(false)
  const [busy, setBusy] = useState(false)

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
    <div style={{ minHeight: '100vh', background: `linear-gradient(160deg, ${C.cream} 0%, #F3ECF1 55%, #EFE7EE 100%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', fontFamily: "'DM Sans', system-ui, -apple-system, sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;1,500;1,600&family=DM+Sans:wght@300;400;500;600&display=swap');*{box-sizing:border-box}`}</style>

      <div style={{ maxWidth: 520, width: '100%', background: C.white, border: `1px solid ${C.border}`, borderRadius: 22, padding: '48px 44px', textAlign: 'center', boxShadow: '0 40px 90px -50px rgba(46,26,53,.55)' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 34 }}>
          <Image src="/logo-the5th.png" alt="The5th" width={260} height={66} style={{ objectFit: 'contain', height: 60, width: 'auto', maxWidth: '80%' }} priority />
        </div>

        {mode === 'invalid' ? (
          <>
            <div style={{ fontSize: 40, marginBottom: 14 }}>✉️</div>
            <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 36, fontWeight: 600, color: C.ink, lineHeight: 1.08, margin: '0 0 14px' }}>
              This link has <em style={{ fontStyle: 'italic', color: C.goldDeep }}>expired.</em>
            </h1>
            <p style={{ fontSize: 15.5, color: C.inkSoft, lineHeight: 1.7, margin: '0 auto', maxWidth: 400 }}>
              This unsubscribe link is invalid or has already been used. If you&apos;re still getting emails you&apos;d rather not, just reply to any one of them with &ldquo;unsubscribe&rdquo; and we&apos;ll take care of it right away.
            </p>
            <p style={{ fontSize: 13, color: C.muted, marginTop: 26 }}>Questions? <a href="mailto:support@10kroadmap.org" style={{ color: C.goldDeep, fontWeight: 600 }}>support@10kroadmap.org</a></p>
          </>
        ) : mode === 'resub' ? (
          <>
            <div style={{ fontSize: 44, marginBottom: 14 }}>💛</div>
            <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 38, fontWeight: 600, color: C.ink, lineHeight: 1.06, margin: '0 0 14px' }}>
              Welcome <em style={{ fontStyle: 'italic', color: C.goldDeep }}>back.</em>
            </h1>
            <p style={{ fontSize: 16, color: C.inkSoft, lineHeight: 1.7, margin: '0 auto', maxWidth: 400 }}>
              You&apos;re resubscribed, and we&apos;re genuinely glad to have you. You&apos;ll start receiving our emails again soon.
            </p>
          </>
        ) : (
          <>
            <div style={{ fontSize: 44, marginBottom: 16 }}>🕊️</div>
            <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 'clamp(32px,7vw,40px)', fontWeight: 600, color: C.ink, lineHeight: 1.05, margin: '0 0 14px' }}>
              We&apos;re sorry to see you <em style={{ fontStyle: 'italic', color: C.goldDeep }}>go.</em>
            </h1>
            <p style={{ fontSize: 16, color: C.inkSoft, lineHeight: 1.7, margin: '0 auto 20px', maxWidth: 420 }}>
              You&apos;ve been unsubscribed, and you won&apos;t receive any more emails from us. It was a real pleasure having you along, and we hope the work served you well.
            </p>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#F3F8F4', border: '1px solid #D6E7DC', color: '#1C4A32', fontSize: 13, fontWeight: 600, padding: '9px 16px', borderRadius: 40 }}>
              <span>✓</span> Unsubscribed — no more emails
            </div>

            {!sent ? (
              <>
                <div style={{ borderTop: `1px solid ${C.border}`, margin: '30px 0 22px' }} />
                <p style={{ fontSize: 14.5, color: C.ink, fontWeight: 600, margin: '0 0 4px' }}>Before you go, how was your experience?</p>
                <p style={{ fontSize: 13, color: C.muted, margin: '0 0 16px' }}>It genuinely helps us do better.</p>
                <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginBottom: 18 }}>
                  {[1, 2, 3, 4, 5].map(n => (
                    <button key={n} onClick={() => setRating(n)} onMouseEnter={() => setHover(n)} onMouseLeave={() => setHover(0)}
                      aria-label={`${n} star${n > 1 ? 's' : ''}`}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 38, lineHeight: 1, padding: 2, color: (hover || rating) >= n ? C.gold : '#DAD2C6', transition: 'color .12s, transform .12s', transform: (hover || rating) >= n ? 'scale(1.08)' : 'none' }}>
                      ★
                    </button>
                  ))}
                </div>
                <textarea value={comment} onChange={e => setComment(e.target.value)} placeholder="Anything we could have done better? (optional)" rows={3}
                  style={{ width: '100%', padding: '13px 15px', fontSize: 14, border: `1px solid ${C.border}`, borderRadius: 12, outline: 'none', color: C.ink, background: C.cream, resize: 'vertical', fontFamily: 'inherit', marginBottom: 14 }} />
                <button onClick={send} disabled={busy || rating < 1}
                  style={{ width: '100%', padding: '14px 16px', fontSize: 15, fontWeight: 700, color: C.plumDark, background: rating < 1 ? '#EDE6DB' : `linear-gradient(180deg,#E4C879,${C.gold} 60%,${C.goldDeep})`, border: 'none', borderRadius: 12, cursor: rating < 1 ? 'default' : 'pointer', transition: 'background .2s' }}>
                  {busy ? 'Sending…' : 'Share feedback'}
                </button>
              </>
            ) : (
              <>
                <div style={{ borderTop: `1px solid ${C.border}`, margin: '30px 0 22px' }} />
                <div style={{ fontSize: 30, marginBottom: 10 }}>🙏</div>
                <p style={{ fontSize: 16, color: C.ink, lineHeight: 1.6, margin: 0 }}>Thank you, truly. That means a lot, and we wish you the very best on the road ahead.</p>
              </>
            )}

            <p style={{ fontSize: 13.5, color: C.muted, marginTop: 28, lineHeight: 1.6 }}>
              Changed your mind? The door&apos;s always open.{' '}
              <a href={token ? `/api/unsubscribe?token=${encodeURIComponent(token)}&resubscribe=1` : '#'} style={{ color: C.goldDeep, fontWeight: 700 }}>Resubscribe</a>
            </p>
          </>
        )}
      </div>
    </div>
  )
}

export default function UnsubscribedPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: C.cream }} />}>
      <UnsubscribedInner />
    </Suspense>
  )
}
