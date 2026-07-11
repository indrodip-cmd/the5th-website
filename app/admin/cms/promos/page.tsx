'use client'
/* Homepage Promotions manager (Patch 3I.5A) — every promotional card/section on
   the marketing site is editable here: copy, CTAs, artwork accent/gradient,
   optional imagery, order and visibility. A live premium preview mirrors exactly
   what visitors see (rendered generatively by /promos.js). */
import { useState } from 'react'
import { T, Card, Button, PageHeader, EmptyState, Modal, useAdminFetch, adminSend } from '@/components/admin/ui'

type Promo = Record<string, unknown>
const KINDS = ['product', 'announcement', 'hero', 'banner']
const blank: Promo = { kind: 'product', title: '', eyebrow: '', subtitle: '', description: '', features: [], badge: '', stat_label: '', stat_value: '', cta_label: 'Learn more', cta_href: '', secondary_label: '', secondary_href: '', accent: '#C9A84C', gradient: '', image_url: '', icon: '✦', enabled: true }

export default function PromosManager() {
  const { data, loading, reload } = useAdminFetch<{ promos: Promo[] }>('/api/admin/cms/promos')
  const [edit, setEdit] = useState<Promo | null>(null)
  const promos = data?.promos || []

  const move = async (i: number, dir: -1 | 1) => {
    const arr = [...promos]; const j = i + dir; if (j < 0 || j >= arr.length) return
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
    await adminSend('/api/admin/cms/promos', 'PATCH', { order: arr.map((p) => p.id) }); reload()
  }
  const toggle = async (p: Promo) => { await adminSend('/api/admin/cms/promos', 'POST', { id: p.id, enabled: !p.enabled }); reload() }
  const del = async (p: Promo) => { if (!confirm(`Delete "${p.title}"?`)) return; await adminSend(`/api/admin/cms/promos?id=${p.id}`, 'DELETE'); reload() }

  return (
    <>
      <PageHeader title="Homepage Promotions" subtitle="Premium product cards, announcements & banners — edit without code"
        actions={<Button onClick={() => setEdit({ ...blank })}>＋ New promo</Button>} />
      {loading && !data ? <div className="skeleton" style={{ height: 220, borderRadius: 16 }} /> : promos.length === 0 ? (
        <EmptyState title="No promotions yet" hint="Add your first premium product card." />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(320px,1fr))', gap: 18 }}>
          {promos.map((p, i) => (
            <div key={p.id as string} style={{ position: 'relative' }}>
              <PromoPreview p={p} />
              <div style={{ display: 'flex', gap: 6, marginTop: 8, alignItems: 'center' }}>
                <button className="a-pill" onClick={() => move(i, -1)} style={pillBtn} title="Move up">↑</button>
                <button className="a-pill" onClick={() => move(i, 1)} style={pillBtn} title="Move down">↓</button>
                <span className="a-pill" style={{ background: '#eef2f0', color: T.sub, textTransform: 'capitalize' }}>{p.kind as string}</span>
                <button className="a-pill" onClick={() => toggle(p)} style={{ ...pillBtn, background: p.enabled ? '#dcfce7' : '#f3f4f6', color: p.enabled ? '#16a34a' : T.muted }}>{p.enabled ? 'Live' : 'Hidden'}</button>
                <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
                  <Button variant="ghost" onClick={() => setEdit(p)}>Edit</Button>
                  <button className="a-pill" onClick={() => del(p)} style={{ ...pillBtn, color: T.danger }}>✕</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {edit && <PromoEditor promo={edit} onClose={() => setEdit(null)} onSaved={() => { setEdit(null); reload() }} />}
    </>
  )
}
const pillBtn: React.CSSProperties = { cursor: 'pointer', border: 'none', background: '#eef2f0', color: T.text }

/* Premium generative card — the exact look visitors get on the homepage. */
function PromoPreview({ p }: { p: Promo }) {
  const accent = (p.accent as string) || '#C9A84C'
  const grad = (p.gradient as string) || `radial-gradient(120% 120% at 15% 0%, ${accent}22, transparent 55%), linear-gradient(155deg,#2A1830 0%,#160D1A 55%,#0D0D0D 100%)`
  return (
    <div style={{ position: 'relative', borderRadius: 20, overflow: 'hidden', padding: 22, background: grad, border: '1px solid rgba(255,255,255,.08)', minHeight: 220, boxShadow: '0 24px 60px rgba(0,0,0,.4)', color: '#fff' }}>
      <div style={{ position: 'absolute', top: -40, right: -30, width: 180, height: 180, borderRadius: '50%', background: `radial-gradient(circle, ${accent}33, transparent 70%)`, pointerEvents: 'none' }} />
      {p.badge ? <span style={{ position: 'absolute', top: 16, right: 16, fontSize: 10.5, fontWeight: 800, letterSpacing: '.08em', textTransform: 'uppercase', color: '#1a1206', background: `linear-gradient(145deg, ${accent}, #a9862f)`, padding: '4px 10px', borderRadius: 999 }}>{p.badge as string}</span> : null}
      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ width: 46, height: 46, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, background: `${accent}1f`, border: `1px solid ${accent}44`, color: accent, marginBottom: 14 }}>{(p.icon as string) || '✦'}</div>
        {p.eyebrow ? <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: accent, marginBottom: 6 }}>{p.eyebrow as string}</div> : null}
        <div style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-.02em', lineHeight: 1.1, background: `linear-gradient(120deg,#fff,${accent})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>{(p.title as string) || 'Untitled'}</div>
        {p.subtitle ? <div style={{ fontSize: 13.5, color: 'rgba(255,255,255,.62)', marginTop: 4 }}>{p.subtitle as string}</div> : null}
        {p.description ? <div style={{ fontSize: 12.5, lineHeight: 1.55, color: 'rgba(255,255,255,.72)', marginTop: 10 }}>{String(p.description).slice(0, 150)}{String(p.description).length > 150 ? '…' : ''}</div> : null}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 16 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#1a1206', background: `linear-gradient(145deg, ${accent}, #a9862f)`, padding: '9px 15px', borderRadius: 12, boxShadow: `0 8px 22px ${accent}33` }}>{(p.cta_label as string) || 'Learn more'} →</span>
          {p.stat_value ? <span style={{ marginLeft: 'auto', textAlign: 'right' }}><b style={{ display: 'block', fontSize: 15, color: '#fff' }}>{p.stat_value as string}</b><i style={{ fontSize: 10.5, color: 'rgba(255,255,255,.5)', fontStyle: 'normal' }}>{p.stat_label as string}</i></span> : null}
        </div>
      </div>
    </div>
  )
}

function PromoEditor({ promo, onClose, onSaved }: { promo: Promo; onClose: () => void; onSaved: () => void }) {
  const [p, setP] = useState<Promo>({ ...promo, features: (promo.features as string[]) || [] })
  const [busy, setBusy] = useState(false)
  const [uploading, setUploading] = useState(false)
  const set = (k: string, v: unknown) => setP((x) => ({ ...x, [k]: v }))
  const save = async () => {
    setBusy(true)
    try { await adminSend('/api/admin/cms/promos', 'POST', p); onSaved() }
    catch (e) { alert(String(e instanceof Error ? e.message : e)) } finally { setBusy(false) }
  }
  const upload = async (file: File) => {
    setUploading(true)
    try {
      const fd = new FormData(); fd.append('kind', 'media'); fd.append('file', file)
      const r = await fetch('/api/admin/carolina/upload', { method: 'POST', body: fd }).then((x) => x.json())
      if (r?.url) set('image_url', r.url); else alert(r?.error || 'Upload failed')
    } catch (e) { alert(String(e)) } finally { setUploading(false) }
  }
  const F = ({ label, k, ph, area }: { label: string; k: string; ph?: string; area?: boolean }) => (
    <label style={{ display: 'block', marginBottom: 10 }}>
      <span style={{ fontSize: 11.5, fontWeight: 700, color: T.sub, textTransform: 'uppercase', letterSpacing: '.04em' }}>{label}</span>
      {area
        ? <textarea className="a-input" style={{ marginTop: 4, minHeight: 64 }} value={(p[k] as string) || ''} placeholder={ph} onChange={(e) => set(k, e.target.value)} />
        : <input className="a-input" style={{ marginTop: 4 }} value={(p[k] as string) || ''} placeholder={ph} onChange={(e) => set(k, e.target.value)} />}
    </label>
  )
  return (
    <Modal open onClose={onClose} title={promo.id ? 'Edit promotion' : 'New promotion'}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div style={{ maxHeight: '62vh', overflowY: 'auto', paddingRight: 6 }}>
          <label style={{ display: 'block', marginBottom: 10 }}>
            <span style={{ fontSize: 11.5, fontWeight: 700, color: T.sub, textTransform: 'uppercase' }}>Kind</span>
            <select className="a-input" style={{ marginTop: 4 }} value={(p.kind as string) || 'product'} onChange={(e) => set('kind', e.target.value)}>{KINDS.map((k) => <option key={k} value={k}>{k}</option>)}</select>
          </label>
          <F label="Eyebrow (small label)" k="eyebrow" ph="Private 5-Month Program" />
          <F label="Title" k="title" ph="Fast Forward" />
          <F label="Subtitle" k="subtitle" ph="Idea to enrolled clients in 90 days" />
          <F label="Description" k="description" area ph="What it is and who it's for…" />
          <label style={{ display: 'block', marginBottom: 10 }}>
            <span style={{ fontSize: 11.5, fontWeight: 700, color: T.sub, textTransform: 'uppercase' }}>Feature bullets (one per line)</span>
            <textarea className="a-input" style={{ marginTop: 4, minHeight: 74 }} value={((p.features as string[]) || []).join('\n')} onChange={(e) => set('features', e.target.value.split('\n').map((s) => s.trim()).filter(Boolean))} />
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}><F label="CTA label" k="cta_label" ph="See what's inside" /><F label="CTA link" k="cta_href" ph="/fast-forward" /></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}><F label="Secondary label" k="secondary_label" ph="Book a call" /><F label="Secondary link" k="secondary_href" ph="/call" /></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}><F label="Stat value" k="stat_value" ph="90 days" /><F label="Stat label" k="stat_label" ph="Timeline" /></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
            <F label="Badge" k="badge" ph="Flagship" /><F label="Icon" k="icon" ph="✦" />
            <label style={{ display: 'block', marginBottom: 10 }}>
              <span style={{ fontSize: 11.5, fontWeight: 700, color: T.sub, textTransform: 'uppercase' }}>Accent</span>
              <input type="color" className="a-input" style={{ marginTop: 4, height: 40, padding: 3 }} value={(p.accent as string) || '#C9A84C'} onChange={(e) => set('accent', e.target.value)} />
            </label>
          </div>
          <F label="Gradient (advanced, optional CSS)" k="gradient" ph="linear-gradient(...)" />
          <label style={{ display: 'block', marginBottom: 10 }}>
            <span style={{ fontSize: 11.5, fontWeight: 700, color: T.sub, textTransform: 'uppercase' }}>Product image (optional)</span>
            <div style={{ display: 'flex', gap: 8, marginTop: 4, alignItems: 'center' }}>
              <input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} style={{ fontSize: 12 }} />
              {uploading && <span style={{ fontSize: 12, color: T.muted }}>Uploading…</span>}
              {p.image_url ? <button className="a-pill" style={pillBtn} onClick={() => set('image_url', '')}>Remove</button> : null}
            </div>
          </label>
        </div>
        <div>
          <div style={{ fontSize: 11.5, fontWeight: 700, color: T.sub, textTransform: 'uppercase', marginBottom: 8 }}>Live preview</div>
          <PromoPreview p={p} />
          <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
            <Button disabled={busy || !(p.title as string)?.trim()} onClick={save}>{busy ? 'Saving…' : 'Save promotion'}</Button>
            <Button variant="ghost" onClick={onClose}>Cancel</Button>
          </div>
        </div>
      </div>
    </Modal>
  )
}
