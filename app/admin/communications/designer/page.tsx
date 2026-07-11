'use client'
/* Email Design Studio (3I.8A.2) — premium block-based email builder. Palette →
   ordered blocks → live server-rendered preview (desktop/mobile), persona preview
   sandbox, AI generate + AI design-quality review, versioning, send test. */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { T, Card, Button, Modal, adminSend } from '@/components/admin/ui'
import { BLOCK_DEFS, defaultBlock as libDefaultBlock, type Block } from '@/lib/email/render'

type Row = Record<string, unknown>
const TEXTAREA_KEYS = new Set(['text', 'subtitle', 'description', 'quote', 'features', 'items', 'leftText', 'rightText', 'code', 'c1', 'c2', 'c3'])
const NUM_KEYS = new Set(['size', 'height', 'width', 'radius'])
const uid = () => 'b' + Math.random().toString(36).slice(2, 8)

export default function DesignerPage() {
  const [id, setId] = useState<string | null>(null)
  const [ready, setReady] = useState(false)
  useEffect(() => { const p = new URLSearchParams(window.location.search).get('id'); setId(p); setReady(true) }, [])
  if (!ready) return <div className="skeleton" style={{ height: 400, borderRadius: 14 }} />
  return <Designer templateId={id} />
}

function Designer({ templateId }: { templateId: string | null }) {
  const [name, setName] = useState('Untitled email')
  const [subject, setSubject] = useState('')
  const [category, setCategory] = useState('general')
  const [status, setStatus] = useState('draft')
  const [blocks, setBlocks] = useState<Block[]>([])
  const [sel, setSel] = useState<string | null>(null)
  const [id, setId] = useState<string | null>(templateId)
  const [device, setDevice] = useState<'desktop' | 'mobile'>('desktop')
  const [persona, setPersona] = useState('')
  const [html, setHtml] = useState('')
  const [busy, setBusy] = useState('')
  const [quality, setQuality] = useState<Row | null>(null)
  const [showGen, setShowGen] = useState(false)
  const [showVersions, setShowVersions] = useState(false)
  const DEFS = BLOCK_DEFS

  // Load existing template.
  useEffect(() => {
    if (!templateId) return
    fetch(`/api/admin/communications/designer?view=template&id=${templateId}`).then((r) => r.json()).then((d) => {
      const t = d.template; if (!t) return
      setName(t.name || 'Untitled'); setSubject(t.subject || ''); setCategory(t.category || 'general'); setStatus(t.status || 'draft')
      setBlocks(((t.design?.blocks as Block[]) || []).map((b) => ({ ...b, id: b.id || uid() }))); setQuality(t.quality || null)
    })
  }, [templateId])

  const design = useMemo(() => ({ blocks }), [blocks])
  // Debounced live preview via the server renderer.
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const renderPreview = useCallback(() => {
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(async () => {
      const r = await adminSend('/api/admin/communications/designer', 'POST', { action: 'preview', design, persona }) as Row
      setHtml((r?.html as string) || '')
    }, 400)
  }, [design, persona])
  useEffect(() => { renderPreview() }, [renderPreview])

  const addBlock = (type: string) => { const nb = { ...libDefaultBlock(type), id: uid() }; setBlocks((bs) => { const i = sel ? bs.findIndex((b) => b.id === sel) : bs.length - 1; const arr = [...bs]; arr.splice(i + 1, 0, nb); return arr }); setSel(nb.id) }
  const update = (bid: string, props: Row) => setBlocks((bs) => bs.map((b) => b.id === bid ? { ...b, props } : b))
  const remove = (bid: string) => setBlocks((bs) => bs.filter((b) => b.id !== bid))
  const dup = (bid: string) => setBlocks((bs) => { const i = bs.findIndex((b) => b.id === bid); if (i < 0) return bs; const arr = [...bs]; arr.splice(i + 1, 0, { ...bs[i], id: uid() }); return arr })
  const move = (bid: string, dir: -1 | 1) => setBlocks((bs) => { const i = bs.findIndex((b) => b.id === bid); const j = i + dir; if (j < 0 || j >= bs.length) return bs; const arr = [...bs]; ;[arr[i], arr[j]] = [arr[j], arr[i]]; return arr })

  const save = async (publish?: boolean) => {
    setBusy(publish ? 'publish' : 'save')
    try {
      const r = await adminSend('/api/admin/communications/designer', 'POST', { action: 'save', id, name, subject, category, status, design, quality }) as Row
      if (r?.id) setId(r.id as string)
      if (publish && r?.id) { await adminSend('/api/admin/communications/designer', 'POST', { action: 'publish', id: r.id }); setStatus('published') }
    } catch (e) { alert(String(e instanceof Error ? e.message : e)) } finally { setBusy('') }
  }
  const review = async () => {
    setBusy('review')
    try { const r = await adminSend('/api/admin/communications/designer', 'POST', { action: 'review', subject, design }) as Row; if (r?.ok) setQuality(r.review as Row); else alert((r?.error as string) || 'Review failed') }
    finally { setBusy('') }
  }
  const sendTest = async () => { const to = prompt('Send test email to:'); if (!to) return; const r = await adminSend('/api/admin/communications/designer', 'POST', { action: 'send_test', to, subject, design }) as Row; alert(r?.ok ? 'Sent — check your inbox.' : `Failed: ${(r?.result as Row)?.error || ''}`) }
  const download = (content: string, filename: string, mime: string) => { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([content], { type: mime })); a.download = filename; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1000) }
  const exportHtml = async () => { const r = await adminSend('/api/admin/communications/designer', 'POST', { action: 'preview', design, persona: '' }) as Row; download((r?.html as string) || html, `${name || 'email'}.html`, 'text/html') }
  const exportJson = () => download(JSON.stringify({ name, subject, category, design }, null, 2), `${name || 'email'}.json`, 'application/json')
  const importHtml = () => { const code = prompt('Paste HTML to import as a block:'); if (code) { setBlocks((bs) => [...bs, { ...libDefaultBlock('html'), id: uid(), props: { code } }]) } }

  const selBlock = blocks.find((b) => b.id === sel)
  const score = quality?.score as number | undefined
  // Lightweight pre-publish accessibility check (complements the AI review).
  const a11y = useMemo(() => {
    const issues: string[] = []
    const noAlt = blocks.filter((b) => b.type === 'image' && !b.props.alt).length
    if (noAlt) issues.push(`${noAlt} image(s) missing alt text`)
    if (!blocks.some((b) => b.type === 'heading')) issues.push('No heading — add structure for screen readers')
    if (!blocks.some((b) => ['button', 'cta', 'pricing', 'product', 'appointment', 'ai_recommendation'].includes(b.type))) issues.push('No clear call-to-action')
    return issues
  }, [blocks])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 116px)' }}>
      {/* Top bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, flexWrap: 'wrap' }}>
        <Link href="/admin/communications" style={{ color: T.sub, textDecoration: 'none', fontSize: 13 }}>← Library</Link>
        <input className="a-input" style={{ maxWidth: 220, fontWeight: 700 }} value={name} onChange={(e) => setName(e.target.value)} />
        <input className="a-input" style={{ flex: 1, minWidth: 160 }} placeholder="Subject line (use {{first_name}})" value={subject} onChange={(e) => setSubject(e.target.value)} />
        <span className="a-pill" style={{ background: status === 'published' ? '#dcfce7' : '#f3f4f6', color: status === 'published' ? '#16a34a' : T.sub }}>{status}</span>
        {typeof score === 'number' && <span className="a-pill" style={{ background: score >= 80 ? '#dcfce7' : score >= 60 ? '#fef3c7' : '#fee2e2', color: score >= 80 ? '#16a34a' : score >= 60 ? '#d97706' : '#dc2626', cursor: 'pointer' }} onClick={() => setShowVersions(false)}>Score {score}</span>}
        <Button variant="ghost" onClick={() => setShowGen(true)}>✦ AI</Button>
        <Button variant="ghost" disabled={busy === 'review'} onClick={review}>{busy === 'review' ? 'Reviewing…' : 'Review'}</Button>
        {id && <Button variant="ghost" onClick={() => setShowVersions(true)}>History</Button>}
        <details style={{ position: 'relative' }}>
          <summary style={{ listStyle: 'none', cursor: 'pointer' }}><span className="a-pill" style={{ background: '#eef2f0', color: T.sub }}>⋯</span></summary>
          <div style={{ position: 'absolute', right: 0, zIndex: 10, marginTop: 4, background: '#fff', border: `1px solid ${T.border}`, borderRadius: 10, boxShadow: '0 10px 30px rgba(0,0,0,.15)', padding: 6, minWidth: 150 }}>
            {[['Export HTML', exportHtml], ['Export JSON', exportJson], ['Import HTML', importHtml], ['Send test', sendTest]].map(([l, fn]) => <button key={l as string} onClick={() => (fn as () => void)()} style={{ display: 'block', width: '100%', textAlign: 'left', border: 'none', background: 'none', padding: '7px 9px', borderRadius: 7, cursor: 'pointer', fontSize: 13, color: T.text }}>{l as string}</button>)}
          </div>
        </details>
        <Button disabled={!!busy} onClick={() => save(false)}>{busy === 'save' ? 'Saving…' : 'Save'}</Button>
        <Button disabled={!!busy} onClick={() => save(true)}>{busy === 'publish' ? 'Publishing…' : 'Publish'}</Button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr 300px', gap: 12, flex: 1, minHeight: 0 }}>
        {/* Palette */}
        <Card pad={10} style={{ overflowY: 'auto' }}>
          {['Basic', 'Layout', 'Premium', 'Advanced'].map((g) => (
            <div key={g} style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '.05em', color: T.muted, textTransform: 'uppercase', margin: '4px 4px 6px' }}>{g}</div>
              {DEFS.filter((d) => d.group === g).map((d) => (
                <button key={d.type} onClick={() => addBlock(d.type)} style={{ display: 'flex', gap: 8, alignItems: 'center', width: '100%', border: `1px solid ${T.border}`, background: '#fff', borderRadius: 8, padding: '7px 9px', marginBottom: 4, cursor: 'pointer', fontSize: 12.5, color: T.text, textAlign: 'left' }}>
                  <span style={{ width: 18, textAlign: 'center', color: T.green }}>{d.icon}</span>{d.label}
                </button>
              ))}
            </div>
          ))}
        </Card>

        {/* Preview */}
        <Card pad={0} style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column', background: '#f4f2f6' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderBottom: `1px solid ${T.border}`, background: '#fff' }}>
            {(['desktop', 'mobile'] as const).map((d) => <button key={d} className="tab-btn" onClick={() => setDevice(d)} style={{ background: device === d ? T.green2 : '#fff', color: device === d ? '#fff' : T.sub, border: `1px solid ${device === d ? T.green2 : T.border}`, textTransform: 'capitalize', padding: '4px 10px' }}>{d}</button>)}
            <select className="a-input" style={{ maxWidth: 190, marginLeft: 'auto' }} value={persona} onChange={(e) => setPersona(e.target.value)}>
              <option value="">Preview: raw merge tags</option>
              {['New Lead', 'Fast Forward Customer', 'The5th AI Customer', 'Newsletter Subscriber'].map((p) => <option key={p} value={p}>Preview as: {p}</option>)}
            </select>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', justifyContent: 'center', padding: 16 }}>
            <iframe title="preview" srcDoc={html} style={{ width: device === 'mobile' ? 380 : '100%', maxWidth: device === 'mobile' ? 380 : 680, height: '100%', minHeight: 500, border: 'none', borderRadius: 10, background: '#fff', boxShadow: '0 8px 30px rgba(0,0,0,.08)' }} />
          </div>
        </Card>

        {/* Right: block list + config */}
        <Card pad={12} style={{ overflowY: 'auto' }}>
          {quality && <div style={{ marginBottom: 12, padding: 10, borderRadius: 10, background: '#faf8fc', border: `1px solid ${T.border}` }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: T.ink, marginBottom: 4 }}>Design score {quality.score as number}/100</div>
            <div style={{ fontSize: 11.5, color: T.sub, marginBottom: 6 }}>{quality.summary as string}</div>
            {((quality.suggestions as string[]) || []).slice(0, 4).map((s, i) => <div key={i} style={{ fontSize: 11.5, color: T.sub, display: 'flex', gap: 5 }}><span style={{ color: T.green }}>•</span>{s}</div>)}
          </div>}
          {a11y.length > 0 && <div style={{ marginBottom: 12, padding: 10, borderRadius: 10, background: '#fffdf6', border: '1px solid #f0e2b8' }}>
            <div style={{ fontSize: 11.5, fontWeight: 700, color: '#a87b1a', marginBottom: 4 }}>♿ Accessibility ({a11y.length})</div>
            {a11y.map((s, i) => <div key={i} style={{ fontSize: 11.5, color: '#8a6d2a' }}>• {s}</div>)}
          </div>}
          <div style={{ fontSize: 11, fontWeight: 700, color: T.muted, textTransform: 'uppercase', marginBottom: 6 }}>Blocks ({blocks.length})</div>
          {blocks.map((b, i) => (
            <div key={b.id} onClick={() => setSel(b.id)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 8px', borderRadius: 8, marginBottom: 4, cursor: 'pointer', border: `1px solid ${sel === b.id ? T.green2 : T.border}`, background: sel === b.id ? '#eef7f1' : '#fff' }}>
              <span style={{ fontSize: 12.5, color: T.text, flex: 1, textTransform: 'capitalize' }}>{b.type}</span>
              <button onClick={(e) => { e.stopPropagation(); move(b.id, -1) }} style={mini}>↑</button>
              <button onClick={(e) => { e.stopPropagation(); move(b.id, 1) }} style={mini}>↓</button>
              <button onClick={(e) => { e.stopPropagation(); dup(b.id) }} style={mini}>⎘</button>
              <button onClick={(e) => { e.stopPropagation(); remove(b.id) }} style={{ ...mini, color: T.danger }}>✕</button>
            </div>
          ))}
          {selBlock && <div style={{ marginTop: 12, borderTop: `1px solid ${T.border}`, paddingTop: 12 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: T.ink, marginBottom: 8, textTransform: 'capitalize' }}>{selBlock.type} settings</div>
            {Object.keys(selBlock.props).length === 0 ? <div style={{ fontSize: 12, color: T.muted }}>No settings.</div> : Object.keys(selBlock.props).map((k) => (
              <label key={k} style={{ display: 'block', marginBottom: 8 }}>
                <span style={{ fontSize: 10.5, fontWeight: 700, color: T.sub, textTransform: 'uppercase' }}>{k}</span>
                {TEXTAREA_KEYS.has(k)
                  ? <textarea className="a-input" style={{ marginTop: 3, minHeight: 60, fontSize: 12.5 }} value={String(selBlock.props[k] ?? '')} onChange={(e) => update(selBlock.id, { ...selBlock.props, [k]: e.target.value })} />
                  : <input className="a-input" style={{ marginTop: 3 }} type={NUM_KEYS.has(k) ? 'number' : 'text'} value={String(selBlock.props[k] ?? '')} onChange={(e) => update(selBlock.id, { ...selBlock.props, [k]: NUM_KEYS.has(k) ? Number(e.target.value) : e.target.value })} />}
              </label>
            ))}
          </div>}
        </Card>
      </div>

      {showGen && <GenModal onClose={() => setShowGen(false)} onDone={(t) => { setName(t.name as string || name); setSubject(t.subject as string || subject); setBlocks(((t.design as Row)?.blocks as Block[] || []).map((b) => ({ ...b, id: uid() }))); setShowGen(false) }} />}
      {showVersions && id && <VersionsModal templateId={id} onClose={() => setShowVersions(false)} onRestored={() => { setShowVersions(false); window.location.reload() }} />}
    </div>
  )
}

function VersionsModal({ templateId, onClose, onRestored }: { templateId: string; onClose: () => void; onRestored: () => void }) {
  const [versions, setVersions] = useState<Row[]>([])
  useEffect(() => { fetch(`/api/admin/communications/designer?view=versions&id=${templateId}`).then((r) => r.json()).then((d) => setVersions(d.versions || [])) }, [templateId])
  const restore = async (vid: string) => { if (!confirm('Restore this version? Current unsaved changes will be replaced.')) return; await adminSend('/api/admin/communications/designer', 'POST', { action: 'restore_version', version_id: vid }); onRestored() }
  return (
    <Modal open onClose={onClose} title="Version history">
      {versions.length === 0 ? <div style={{ fontSize: 13, color: T.sub }}>No published versions yet. Publish to snapshot a version.</div> : versions.map((v) => (
        <div key={v.id as string} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 0', borderBottom: `1px solid ${T.border}` }}>
          <span style={{ flex: 1, fontSize: 13, color: T.ink }}>v{v.version as number} · {v.name as string}</span>
          <span style={{ fontSize: 11.5, color: T.muted }}>{new Date(v.created_at as string).toLocaleDateString()}</span>
          <Button variant="ghost" onClick={() => restore(v.id as string)}>Restore</Button>
        </div>
      ))}
    </Modal>
  )
}
const mini: React.CSSProperties = { border: 'none', background: '#f1f3f2', width: 20, height: 20, borderRadius: 5, cursor: 'pointer', color: '#6b7280', fontSize: 11 }

function GenModal({ onClose, onDone }: { onClose: () => void; onDone: (t: Row) => void }) {
  const [prompt, setPrompt] = useState('')
  const [busy, setBusy] = useState(false)
  const go = async () => { if (!prompt.trim()) return; setBusy(true); try { const r = await adminSend('/api/admin/communications/designer', 'POST', { action: 'generate', prompt }) as Row; if (r?.ok) onDone(r.template as Row); else alert((r?.error as string) || 'Failed') } finally { setBusy(false) } }
  return (
    <Modal open onClose={onClose} title="✦ Generate email with AI">
      <div style={{ fontSize: 13, color: T.sub, marginBottom: 10 }}>Describe the email — AI drafts the full layout, copy and CTA. You can edit everything after.</div>
      <textarea className="a-input" style={{ minHeight: 90, marginBottom: 10 }} placeholder="e.g. A launch email for Fast Forward with a guarantee box and a book-a-call CTA" value={prompt} onChange={(e) => setPrompt(e.target.value)} />
      <Button disabled={busy || !prompt.trim()} onClick={go}>{busy ? 'Designing…' : 'Generate'}</Button>
    </Modal>
  )
}

