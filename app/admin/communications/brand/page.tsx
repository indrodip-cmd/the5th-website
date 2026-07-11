'use client'
/* Global Brand System (3I.8A.2) — one place controls every email's look. Changing
   a token re-renders all templates on their next save/preview via lib/email/render. */
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { T, Card, Button, PageHeader, adminSend } from '@/components/admin/ui'

type Row = Record<string, unknown>
const COLORS = [['primary_color', 'Primary'], ['secondary_color', 'Secondary'], ['accent_color', 'Accent'], ['text_color', 'Text'], ['bg_color', 'Background']]
const TEXTS = [['company_name', 'Company name'], ['logo_url', 'Logo URL'], ['font', 'Font stack'], ['footer_address', 'Footer address'], ['support_email', 'Support email'], ['privacy_url', 'Privacy URL'], ['terms_url', 'Terms URL'], ['unsubscribe_text', 'Unsubscribe text']]
const NUMS = [['radius', 'Corner radius'], ['width', 'Email width']]

export default function BrandPage() {
  const [b, setB] = useState<Row | null>(null)
  const [busy, setBusy] = useState(false)
  const [saved, setSaved] = useState(false)
  useEffect(() => { fetch('/api/admin/communications/designer?view=brand').then((r) => r.json()).then((d) => setB(d.brand || {})) }, [])
  const set = (k: string, v: unknown) => { setB((x) => ({ ...(x || {}), [k]: v })); setSaved(false) }
  const setSocial = (k: string, v: string) => setB((x) => ({ ...(x || {}), social: { ...((x?.social as Row) || {}), [k]: v } }))
  const save = async () => { setBusy(true); try { await adminSend('/api/admin/communications/designer', 'POST', { action: 'save_brand', ...b }); setSaved(true) } finally { setBusy(false) } }
  if (!b) return <div className="skeleton" style={{ height: 300, borderRadius: 14 }} />
  const social = (b.social as Row) || {}

  return (
    <>
      <PageHeader title="Brand System" subtitle="One source of truth for every email"
        actions={<div style={{ display: 'flex', gap: 8, alignItems: 'center' }}><Link href="/admin/communications" style={{ color: T.sub, textDecoration: 'none', fontSize: 13 }}>← Communications</Link><Button disabled={busy} onClick={save}>{busy ? 'Saving…' : saved ? 'Saved ✓' : 'Save brand'}</Button></div>} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <Card>
          <div style={{ fontSize: 13, fontWeight: 700, color: T.ink, marginBottom: 12 }}>Colors</div>
          {COLORS.map(([k, label]) => (
            <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <input type="color" value={String(b[k] || '#000000')} onChange={(e) => set(k, e.target.value)} style={{ width: 40, height: 34, border: 'none', borderRadius: 8, background: 'none' }} />
              <span style={{ flex: 1, fontSize: 13, color: T.text }}>{label}</span>
              <input className="a-input" style={{ maxWidth: 110 }} value={String(b[k] || '')} onChange={(e) => set(k, e.target.value)} />
            </div>
          ))}
          <div style={{ fontSize: 13, fontWeight: 700, color: T.ink, margin: '14px 0 10px' }}>Layout</div>
          {NUMS.map(([k, label]) => (
            <label key={k} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}><span style={{ flex: 1, fontSize: 13, color: T.text }}>{label}</span><input className="a-input" type="number" style={{ maxWidth: 110 }} value={Number(b[k] || 0)} onChange={(e) => set(k, Number(e.target.value))} /></label>
          ))}
        </Card>
        <Card>
          <div style={{ fontSize: 13, fontWeight: 700, color: T.ink, marginBottom: 12 }}>Identity & footer</div>
          {TEXTS.map(([k, label]) => (
            <label key={k} style={{ display: 'block', marginBottom: 10 }}><span style={{ fontSize: 11, fontWeight: 700, color: T.sub, textTransform: 'uppercase' }}>{label}</span><input className="a-input" style={{ marginTop: 3 }} value={String(b[k] || '')} onChange={(e) => set(k, e.target.value)} /></label>
          ))}
          <div style={{ fontSize: 13, fontWeight: 700, color: T.ink, margin: '14px 0 10px' }}>Social links</div>
          {['Instagram', 'LinkedIn', 'YouTube', 'Facebook'].map((s) => (
            <label key={s} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}><span style={{ width: 90, fontSize: 12.5, color: T.text }}>{s}</span><input className="a-input" placeholder="https://…" value={String(social[s] || '')} onChange={(e) => setSocial(s, e.target.value)} /></label>
          ))}
        </Card>
      </div>
    </>
  )
}
