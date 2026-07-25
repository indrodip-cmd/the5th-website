import React from 'react'

/* Shared shell for the help / legal content pages. Server component. */
const C = {
  cream: '#FAF6F0', plum: '#3D2645', plumDark: '#2E1A35', plumDeep: '#231029',
  gold: '#C9A84C', goldDeep: '#B0902F', goldLine: 'rgba(201,168,76,.32)',
  ink: '#1A1A2E', inkSoft: '#4a4038', muted: '#8A8075', border: '#E2DCD2', white: '#fff',
}

const FOOTER_LINKS: { href: string; label: string }[] = [
  { href: '/help', label: 'Help & Support' },
  { href: '/privacy', label: 'Privacy Policy' },
  { href: '/terms', label: 'Terms of Use' },
  { href: '/refund', label: 'Refund Policy' },
  { href: '/data-usage', label: 'Data Usage' },
  { href: '/code-of-ethics', label: 'Code of Ethics' },
  { href: '/disclaimer', label: 'Earnings Disclaimer' },
  { href: '/california', label: 'California Privacy Rights' },
]

export default function PageShell({
  eyebrow, title, intro, children, wide = false,
}: {
  eyebrow?: string
  title: string
  intro?: string
  children: React.ReactNode
  wide?: boolean
}) {
  return (
    <div style={{ background: C.cream, minHeight: '100vh', color: C.ink, fontFamily: "'Public Sans', system-ui, sans-serif" }}>
      {/* Header */}
      <header style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '20px clamp(20px, 5vw, 56px)', borderBottom: `1px solid ${C.border}`,
        position: 'sticky', top: 0, background: 'rgba(250,246,240,0.9)', backdropFilter: 'blur(10px)', zIndex: 10,
      }}>
        <a href="/" style={{ textDecoration: 'none', color: C.plumDark, fontWeight: 800, fontSize: 20, letterSpacing: '-.01em' }}>
          The5th <span style={{ color: C.goldDeep }}>Consulting</span>
        </a>
        <a href="/" style={{ textDecoration: 'none', color: C.muted, fontSize: 14, fontWeight: 600 }}>← Back to home</a>
      </header>

      {/* Hero */}
      <div style={{ maxWidth: wide ? 860 : 760, margin: '0 auto', padding: '56px clamp(20px, 5vw, 32px) 0' }}>
        {eyebrow && (
          <div style={{ fontSize: 12, letterSpacing: '.2em', textTransform: 'uppercase', color: C.goldDeep, fontWeight: 700, marginBottom: 14 }}>
            {eyebrow}
          </div>
        )}
        <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(34px, 6vw, 52px)', lineHeight: 1.05, color: C.plumDark, margin: '0 0 18px', letterSpacing: '-.02em' }}>
          {title}
        </h1>
        {intro && <p style={{ fontSize: 18, lineHeight: 1.65, color: C.inkSoft, margin: '0 0 8px', maxWidth: 640 }}>{intro}</p>}
      </div>

      {/* Body */}
      <main style={{ maxWidth: wide ? 860 : 760, margin: '0 auto', padding: '28px clamp(20px, 5vw, 32px) 80px' }}>
        {children}
      </main>

      {/* Footer */}
      <footer style={{ borderTop: `1px solid ${C.border}`, background: C.white, padding: '40px clamp(20px, 5vw, 56px)' }}>
        <div style={{ maxWidth: 980, margin: '0 auto' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px 26px', marginBottom: 20 }}>
            {FOOTER_LINKS.map(l => (
              <a key={l.href} href={l.href} style={{ color: C.muted, fontSize: 14, textDecoration: 'none' }}>{l.label}</a>
            ))}
            <a href="mailto:support@10kroadmap.org" style={{ color: C.muted, fontSize: 14, textDecoration: 'none' }}>Contact</a>
          </div>
          <div style={{ fontSize: 13, color: C.muted }}>© 2026 The5th Consulting. All rights reserved.</div>
        </div>
      </footer>
    </div>
  )
}

/* Shared content primitives for the legal/help pages. */
export const prose = {
  h2: { fontFamily: 'Georgia, serif', fontSize: 24, color: C.plumDark, margin: '38px 0 12px' } as React.CSSProperties,
  p: { fontSize: 16, lineHeight: 1.72, color: C.inkSoft, margin: '0 0 16px' } as React.CSSProperties,
  li: { fontSize: 16, lineHeight: 1.7, color: C.inkSoft, margin: '0 0 9px' } as React.CSSProperties,
  card: {
    background: C.white, border: `1px solid ${C.border}`, borderRadius: 16, padding: '22px 24px', margin: '0 0 16px',
  } as React.CSSProperties,
}
