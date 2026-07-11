'use client'
/* Email Design Studio (3I.8A.2) — premium block-based email builder. Palette →
   ordered blocks → live server-rendered preview (desktop/mobile), persona preview
   sandbox, AI generate + AI design-quality review, versioning, send test. */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { T, Card, Button, Modal, adminSend } from '@/components/admin/ui'

type Row = Record<string, unknown>
interface Block { id: string; type: string; props: Row }
interface Def { type: string; label: string; icon: string; group: string; defaults: Row }
const TEXTAREA_KEYS = new Set(['text', 'subtitle', 'description', 'quote', 'features', 'items', 'leftText', 'rightText', 'code'])
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

  const addBlock = (type: string) => { const nb = { ...defaultBlock(type), id: uid() }; setBlocks((bs) => { const i = sel ? bs.findIndex((b) => b.id === sel) : bs.length - 1; const arr = [...bs]; arr.splice(i + 1, 0, nb); return arr }); setSel(nb.id) }
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

  const selBlock = blocks.find((b) => b.id === sel)
  const score = quality?.score as number | undefined

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
        <Button variant="ghost" onClick={sendTest}>Test</Button>
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
    </div>
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

// Block catalog (mirrors lib/email/render.ts BLOCK_DEFS for the palette + defaults).
const BLOCK_DEFS: Def[] = [
  { type: 'heading', label: 'Heading', icon: 'H', group: 'Basic', defaults: { text: 'Your headline here', size: 28, align: 'center' } },
  { type: 'text', label: 'Paragraph', icon: '¶', group: 'Basic', defaults: { text: 'Write your message here. Use {{first_name}} to personalize.', size: 15, align: 'left' } },
  { type: 'button', label: 'Button', icon: '▭', group: 'Basic', defaults: { text: 'Learn more', url: 'https://the5th.co', align: 'center' } },
  { type: 'image', label: 'Image', icon: '🖼', group: 'Basic', defaults: { src: '', alt: '', url: '', width: 100 } },
  { type: 'divider', label: 'Divider', icon: '—', group: 'Basic', defaults: {} },
  { type: 'spacer', label: 'Spacer', icon: '⇕', group: 'Basic', defaults: { height: 24 } },
  { type: 'list', label: 'List', icon: '≡', group: 'Basic', defaults: { items: 'First point\nSecond point\nThird point' } },
  { type: 'quote', label: 'Quote', icon: '❝', group: 'Basic', defaults: { text: 'A short, powerful quote.', author: '' } },
  { type: 'columns', label: 'Two columns', icon: '▥', group: 'Layout', defaults: { leftText: 'Left column', rightText: 'Right column' } },
  { type: 'cta', label: 'CTA banner', icon: '★', group: 'Premium', defaults: { title: 'Ready to take the next step?', subtitle: 'Book a free strategy call with the team.', buttonText: 'Book a call', buttonUrl: 'https://the5th.co/call' } },
  { type: 'pricing', label: 'Pricing card', icon: '$', group: 'Premium', defaults: { title: 'Fast Forward', price: '$', period: '5-month program', features: 'Weekly 1:1 coaching\nThe Wisdom-to-Income Method\nClient acquisition systems', buttonText: "See what's inside", buttonUrl: 'https://the5th.co/fast-forward' } },
  { type: 'testimonial', label: 'Testimonial', icon: '“', group: 'Premium', defaults: { quote: 'This changed everything for my business.', author: 'Happy Client', role: 'Founder' } },
  { type: 'guarantee', label: 'Guarantee box', icon: '✓', group: 'Premium', defaults: { title: '100% Money-Back Guarantee', text: "If you meet the requirements and don't get the result, we refund your investment." } },
  { type: 'product', label: 'Product card', icon: '▦', group: 'Premium', defaults: { title: 'The5th AI', subtitle: 'Your personal CMO, 24/7', description: 'Trained to help you build a coaching business — writes offers, emails and content.', buttonText: 'Explore', buttonUrl: 'https://the5th.co/ai', image: '' } },
  { type: 'signature', label: 'Signature', icon: '✍', group: 'Premium', defaults: { name: 'Indrodip', title: 'Founder, The5th' } },
  { type: 'social', label: 'Social links', icon: '@', group: 'Premium', defaults: {} },
  { type: 'html', label: 'Custom HTML', icon: '</>', group: 'Advanced', defaults: { code: '<p>Custom HTML…</p>' } },
]
function defaultBlock(type: string): Block { const d = BLOCK_DEFS.find((b) => b.type === type); return { id: uid(), type, props: JSON.parse(JSON.stringify(d?.defaults || {})) } }
