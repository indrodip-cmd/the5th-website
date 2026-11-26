'use client'
/* Pre-call sales brief for a quiz lead: the gap, the talk track, the objections.
   Computed from the lead's saved assessment code, so it works for every lead. */
import { useMemo, useState } from 'react'
import { decode, score } from '@/lib/quiz/engine'
import { salesBrief } from '@/lib/quiz/brief'

export default function SalesBrief({ code }: { code: string }) {
  const [copied, setCopied] = useState(false)
  const b = useMemo(() => { const a = decode(code); return a ? salesBrief(score(a)) : null }, [code])
  if (!b) return null
  const box: React.CSSProperties = { border: '1px solid #e2dcd2', borderRadius: 12, padding: '12px 14px', background: '#fff', marginTop: 10 }
  const h: React.CSSProperties = { fontSize: 11, letterSpacing: '.14em', textTransform: 'uppercase', fontWeight: 800, color: '#8a6d1f', marginBottom: 6 }
  const ul: React.CSSProperties = { margin: 0, paddingLeft: 18, fontSize: 13.5, lineHeight: 1.55, color: '#2a2a3a' }
  return (
    <div style={{ marginTop: 18, border: '2px solid #C9A84C', borderRadius: 16, padding: 16, background: '#fffaf0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <div><div style={{ fontSize: 11, letterSpacing: '.18em', textTransform: 'uppercase', fontWeight: 800, color: '#8a6d1f' }}>Sales brief · Income OS</div><div style={{ fontSize: 17, fontWeight: 800, color: '#2E1A35' }}>{b.headline}</div></div>
        <button type="button" onClick={async () => { try { await navigator.clipboard.writeText(b.text); setCopied(true); setTimeout(() => setCopied(false), 1800) } catch { /* ignore */ } }} style={{ padding: '8px 14px', borderRadius: 8, border: '1px solid #C9A84C', background: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: 12.5 }}>{copied ? 'Copied' : 'Copy brief'}</button>
      </div>
      <div style={{ ...box }}><div style={h}>Snapshot</div>{b.snapshot.map((s) => <div key={s.label} style={{ display: 'flex', gap: 10, fontSize: 13.5, padding: '3px 0' }}><span style={{ width: 150, color: '#7a7268', flex: 'none' }}>{s.label}</span><b>{s.value}</b></div>)}</div>
      <div style={box}><div style={h}>Their gap</div><ul style={ul}>{b.gaps.map((g) => <li key={g}>{g}</li>)}</ul></div>
      <div style={box}><div style={h}>Mindset map (higher is healthier)</div>{b.mindset.map((m) => <div key={m.name} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, padding: '3px 0' }}><span style={{ width: 130 }}>{m.name}</span><div style={{ flex: 1, height: 8, background: '#eee6d6', borderRadius: 9 }}><div style={{ width: `${m.score}%`, height: 8, borderRadius: 9, background: m.band === 'strong' ? '#3fae8c' : m.band === 'developing' ? '#C9A84C' : '#d9604a' }} /></div><b style={{ width: 28 }}>{m.score}</b></div>)}</div>
      <div style={box}><div style={h}>Opening line</div><p style={{ margin: 0, fontSize: 14, lineHeight: 1.55 }}>{b.opener}</p></div>
      <div style={box}><div style={h}>Discovery questions</div><ul style={ul}>{b.discovery.map((d) => <li key={d}>{d}</li>)}</ul></div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <div style={box}><div style={{ ...h, color: '#2f8a6f' }}>Say</div><ul style={ul}>{b.say.map((d) => <li key={d}>{d}</li>)}</ul></div>
        <div style={box}><div style={{ ...h, color: '#b4503d' }}>Avoid</div><ul style={ul}>{b.avoid.map((d) => <li key={d}>{d}</li>)}</ul></div>
      </div>
      <div style={box}><div style={h}>Likely objections</div>{b.objections.map((o) => <p key={o.q} style={{ margin: '0 0 8px', fontSize: 13.5, lineHeight: 1.5 }}><b>{o.q}</b> {o.a}</p>)}</div>
      <div style={{ ...box, borderColor: '#C9A84C', background: '#fff7e0' }}><div style={h}>Recommended next step</div><p style={{ margin: 0, fontSize: 14, fontWeight: 700 }}>{b.recommendation.next}</p><p style={{ margin: '4px 0 6px', fontSize: 13.5 }}>{b.recommendation.why}</p><ul style={ul}>{b.recommendation.offers.map((o) => <li key={o}>{o}</li>)}</ul></div>
    </div>
  )
}
