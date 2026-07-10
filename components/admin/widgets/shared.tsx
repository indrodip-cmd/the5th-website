'use client'
/* Small building blocks shared by widgets. */
import React from 'react'
import Link from 'next/link'
import { T } from '../theme'

export function KpiView({ label, value, sub, accent, loading }: { label: string; value: string; sub?: string; accent?: boolean; loading?: boolean }) {
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      {loading ? <div className="skeleton" style={{ height: 30, width: 90, marginBottom: 8 }} /> : (
        <div style={{ fontSize: 26, fontWeight: 800, color: accent ? '#fff' : T.ink, lineHeight: 1.1 }}>{value}</div>
      )}
      <div style={{ fontSize: 12.5, color: accent ? 'rgba(255,255,255,0.75)' : T.sub, marginTop: 6, fontWeight: 500 }}>{label}</div>
      {sub && <div style={{ fontSize: 11, color: accent ? 'rgba(255,255,255,0.55)' : T.muted, marginTop: 2 }}>{sub}</div>}
    </div>
  )
}

export function WidgetTitle({ title, action }: { title: string; action?: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
      <h3 style={{ fontSize: 13, fontWeight: 700, color: T.ink }}>{title}</h3>
      {action}
    </div>
  )
}

export function ListRow({ icon, title, sub, meta, href }: { icon?: React.ReactNode; title: string; sub?: string; meta?: string; href?: string }) {
  const inner = (
    <>
      {icon != null && <span style={{ width: 20, textAlign: 'center' }}>{icon}</span>}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13.5, fontWeight: 600, color: T.ink, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{title}</div>
        {sub && <div style={{ fontSize: 12, color: T.sub, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{sub}</div>}
      </div>
      {meta && <span style={{ fontSize: 12, color: T.muted, whiteSpace: 'nowrap' }}>{meta}</span>}
    </>
  )
  const style: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: 9, padding: '7px 0', borderBottom: '1px solid #f4f5f4', textDecoration: 'none' }
  return href ? <Link href={href} style={style}>{inner}</Link> : <div style={style}>{inner}</div>
}

export function NotConnected({ label }: { label: string }) {
  return (
    <div style={{ padding: '22px 8px', textAlign: 'center' }}>
      <div style={{ fontSize: 13, color: T.sub, fontWeight: 600 }}>{label} not connected</div>
      <Link href="/admin/integrations" style={{ fontSize: 12, color: T.green, textDecoration: 'none' }}>Set up in Integrations →</Link>
    </div>
  )
}

export function Empty({ label }: { label: string }) {
  return <div style={{ padding: '18px 8px', textAlign: 'center', color: T.muted, fontSize: 13 }}>{label}</div>
}
