'use client'
/* Cold-traffic opt-in. One promise, one form (first name + email), one button.
   No navigation, no exit links. Mobile-first. On success we stash the lead in
   localStorage and hand off to the gated watch page. */
import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { OPT_IN } from './config'

const CREAM = '#FAF6F0'
const PLUM = '#2E1A35'
const GOLD = '#C9A84C'
const GOLD_DK = '#a9862f'
const INK = '#2a2233'
const MUTE = '#57505f'

function readVisitorId(): string | null {
  try {
    const ls = localStorage.getItem('t5_visitor_id') || localStorage.getItem('visitor_id')
    if (ls) return ls
    const m = document.cookie.match(/(?:^|;\s*)(?:t5_vid|visitor_id)=([^;]+)/)
    return m ? decodeURIComponent(m[1]) : null
  } catch {
    return null
  }
}

function readUtm(): Record<string, string> {
  const out: Record<string, string> = {}
  try {
    const p = new URLSearchParams(window.location.search)
    for (const k of ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'fbclid', 'gclid']) {
      const v = p.get(k)
      if (v) out[k] = v.slice(0, 120)
    }
  } catch { /* noop */ }
  return out
}

export default function OptInView() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const meta = useRef<{ visitor_id: string | null; utm: Record<string, string> }>({ visitor_id: null, utm: {} })

  useEffect(() => {
    meta.current = { visitor_id: readVisitorId(), utm: readUtm() }
    // Warm the watch route so the hand-off feels instant.
    router.prefetch('/lp/make-10k-month/watch')
  }, [router])

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (loading) return
    setError('')
    if (!name.trim()) return setError('Please enter your first name.')
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) return setError('Please enter a valid email.')

    setLoading(true)
    try {
      const res = await fetch('/api/lp/opt-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          visitor_id: meta.current.visitor_id,
          utm: meta.current.utm,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(data?.error || 'Something went wrong. Please try again.')
        setLoading(false)
        return
      }
      try {
        localStorage.setItem('vsl_make10k', JSON.stringify({ name: data.name, email: data.email, t: Date.now() }))
      } catch { /* noop */ }
      router.push('/lp/make-10k-month/watch')
    } catch {
      setError('Network error. Please try again.')
      setLoading(false)
    }
  }

  return (
    <main style={{ minHeight: '100dvh', background: `radial-gradient(120% 70% at 50% -10%, #f7efe4 0%, ${CREAM} 60%)`, color: INK }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        .lp-wrap{font-family:Inter,system-ui,sans-serif}
        .lp-h1{font-family:Gelica,Georgia,serif}
        @keyframes lpRise{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
        .lp-rise{animation:lpRise .5s ease both}
        .lp-input:focus{outline:none;border-color:${GOLD}!important;box-shadow:0 0 0 3px rgba(201,168,76,.18)!important}
        .lp-btn{transition:transform .12s ease,box-shadow .12s ease,filter .12s ease}
        .lp-btn:hover:not(:disabled){transform:translateY(-1px);filter:brightness(1.04)}
        .lp-btn:active:not(:disabled){transform:translateY(0)}
      `}</style>

      <div className="lp-wrap" style={{ maxWidth: 620, margin: '0 auto', padding: '30px 20px 64px' }}>
        {/* Brand mark — intentionally NOT a link (no funnel exits) */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 26 }}>
          <span style={{ fontFamily: 'Inter,sans-serif', fontWeight: 800, letterSpacing: 3, fontSize: 12, color: PLUM }}>
            THE5TH CONSULTING
          </span>
        </div>

        <div className="lp-rise" style={{ textAlign: 'center' }}>
          <div style={{ display: 'inline-block', fontSize: 11, fontWeight: 800, letterSpacing: 1.6, color: GOLD_DK, background: '#fff7e6', border: '1px solid #f0e2bd', borderRadius: 999, padding: '7px 14px', marginBottom: 18 }}>
            {OPT_IN.eyebrow}
          </div>
          <h1 className="lp-h1" style={{ fontSize: 'clamp(30px,7vw,46px)', fontWeight: 700, lineHeight: 1.1, letterSpacing: '-.02em', margin: '0 auto 16px', maxWidth: 560, color: INK }}>
            {OPT_IN.headline}
          </h1>
          <p style={{ fontSize: 'clamp(16px,3.6vw,18px)', lineHeight: 1.6, color: MUTE, margin: '0 auto', maxWidth: 500 }}>
            {OPT_IN.sub}
          </p>
        </div>

        {/* Form card */}
        <form onSubmit={submit} className="lp-rise" style={{ animationDelay: '.08s', marginTop: 30, background: '#fff', border: '1px solid #efe7db', borderRadius: 20, boxShadow: '0 20px 50px rgba(46,26,53,.10)', padding: 'clamp(20px,5vw,30px)' }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: INK, marginBottom: 7 }}>First name</label>
          <input
            className="lp-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your first name"
            autoComplete="given-name"
            enterKeyHint="next"
            style={inputStyle}
          />
          <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: INK, margin: '16px 0 7px' }}>Email address</label>
          <input
            className="lp-input"
            type="email"
            inputMode="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@email.com"
            autoComplete="email"
            enterKeyHint="go"
            style={inputStyle}
          />

          {error && (
            <div style={{ marginTop: 12, color: '#a3341f', background: '#fdeee9', border: '1px solid #f6cabb', borderRadius: 10, padding: '10px 12px', fontSize: 13.5 }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="lp-btn"
            style={{
              width: '100%', marginTop: 18, padding: '17px 22px', border: 'none', borderRadius: 12,
              background: loading ? '#5b4a5f' : `linear-gradient(180deg, ${PLUM}, #241028)`, color: '#fff',
              fontWeight: 800, fontSize: 17, letterSpacing: '.01em', cursor: loading ? 'wait' : 'pointer',
              boxShadow: '0 10px 24px rgba(46,26,53,.28)', fontFamily: 'Inter,sans-serif',
            }}
          >
            {loading ? 'Getting your access…' : OPT_IN.ctaLabel}
          </button>

          <p style={{ textAlign: 'center', fontSize: 12.5, color: '#8a8075', marginTop: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#8a8075" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
            {OPT_IN.microtrust}
          </p>
        </form>

        {/* Proof bullets */}
        <div className="lp-rise" style={{ animationDelay: '.16s', marginTop: 30 }}>
          <p style={{ textAlign: 'center', fontSize: 12.5, fontWeight: 700, letterSpacing: 1.4, color: GOLD_DK, marginBottom: 16 }}>
            IN THIS FREE TRAINING YOU’LL SEE
          </p>
          <div style={{ display: 'grid', gap: 12 }}>
            {OPT_IN.bullets.map((b) => (
              <div key={b} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', background: '#fffdf9', border: '1px solid #efe7db', borderRadius: 14, padding: '14px 16px' }}>
                <span style={{ width: 24, height: 24, flexShrink: 0, borderRadius: '50%', background: PLUM, display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 1 }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                </span>
                <span style={{ fontSize: 15, lineHeight: 1.5, color: INK }}>{b}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Social proof */}
        <div className="lp-rise" style={{ animationDelay: '.22s', textAlign: 'center', marginTop: 28 }}>
          <div style={{ color: GOLD, fontSize: 18, letterSpacing: 2 }}>★★★★★</div>
          <p style={{ fontSize: 13, color: MUTE, marginTop: 6 }}>
            Trusted by women turning decades of expertise into income.
          </p>
        </div>
      </div>
    </main>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '15px 16px', fontSize: 16, borderRadius: 12,
  border: '1.5px solid #e3d9cb', background: '#fffdfa', color: '#2a2233',
  fontFamily: 'Inter,sans-serif', transition: 'border-color .12s ease, box-shadow .12s ease',
}
