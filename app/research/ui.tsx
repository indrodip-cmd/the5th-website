import React from 'react'

/* Presentational primitives shared by Research articles. Server components,
   dependency-free. Math is set in a monospace "equation" card using unicode
   symbols (Φ, Σ, ∫, ∂, ≈, ⟨⟩) so we avoid pulling in a heavy math renderer. */
export const C = {
  cream: '#FAF6F0', plum: '#3D2645', plumDark: '#2E1A35', plumDeep: '#231029',
  gold: '#C9A84C', goldDeep: '#B0902F', goldLine: 'rgba(201,168,76,.32)',
  ink: '#1A1A2E', inkSoft: '#4a4038', muted: '#8A8075', border: '#E2DCD2', white: '#fff',
}

export const rp = {
  h2: { fontFamily: 'Georgia, serif', fontSize: 'clamp(24px, 3.6vw, 32px)', color: C.plumDark, margin: '52px 0 14px', letterSpacing: '-.015em', lineHeight: 1.14, scrollMarginTop: 90 } as React.CSSProperties,
  h3: { fontFamily: 'Georgia, serif', fontSize: 'clamp(19px, 2.4vw, 23px)', color: C.plum, margin: '30px 0 10px', lineHeight: 1.2 } as React.CSSProperties,
  p: { fontSize: 17, lineHeight: 1.75, color: C.inkSoft, margin: '0 0 18px' } as React.CSSProperties,
  li: { fontSize: 17, lineHeight: 1.7, color: C.inkSoft, margin: '0 0 10px' } as React.CSSProperties,
  strong: { color: C.plumDark, fontWeight: 700 } as React.CSSProperties,
}

/* Centered display equation with an optional right-aligned label. */
export function Eq({ children, label }: { children: React.ReactNode; label?: string }) {
  return (
    <div style={{ background: C.cream, border: `1px solid ${C.border}`, borderLeft: `3px solid ${C.gold}`, borderRadius: 12, padding: '18px 22px', margin: '0 0 20px', display: 'flex', alignItems: 'center', gap: 16, overflowX: 'auto' }}>
      <div style={{ flex: 1, fontFamily: "'Cambria Math', 'STIX Two Math', Georgia, serif", fontSize: 18, color: C.plumDark, lineHeight: 1.7, whiteSpace: 'nowrap' }}>
        {children}
      </div>
      {label && <div style={{ color: C.muted, fontSize: 13, fontWeight: 700, whiteSpace: 'nowrap' }}>{label}</div>}
    </div>
  )
}

/* "In plain terms" aside, the layperson translation of a technical passage. */
export function Plain({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ background: 'rgba(201,168,76,.09)', border: `1px solid ${C.goldLine}`, borderRadius: 14, padding: '18px 22px', margin: '0 0 22px' }}>
      <div style={{ fontSize: 11.5, fontWeight: 800, letterSpacing: '.14em', textTransform: 'uppercase', color: C.goldDeep, marginBottom: 8 }}>In plain terms</div>
      <div style={{ fontSize: 16.5, lineHeight: 1.7, color: C.inkSoft }}>{children}</div>
    </div>
  )
}

export function Divider() {
  return <div style={{ height: 1, background: C.border, margin: '46px 0' }} />
}

/* Inline math token, e.g. <M>Φ</M>, styled to match the equation cards. */
export function M({ children }: { children: React.ReactNode }) {
  return <span style={{ fontFamily: "'Cambria Math', 'STIX Two Math', Georgia, serif", fontStyle: 'italic', color: C.plum }}>{children}</span>
}
