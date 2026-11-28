'use client'
import React, { useMemo, useState } from 'react'
import { C } from './ui'
import { HeroArt } from './art'
import type { ResearchPost } from './posts'

const SERIF = "Georgia, 'Times New Roman', serif"
const SANS = "'Public Sans', system-ui, -apple-system, sans-serif"

export default function Browser({ posts, fresh }: { posts: ResearchPost[]; fresh: Record<string, string> }) {
  const tags = useMemo(() => {
    const m = new Map<string, number>()
    posts.forEach((p) => p.tags.forEach((t) => m.set(t, (m.get(t) ?? 0) + 1)))
    return [...m.entries()].sort((a, b) => b[1] - a[1]).map(([t]) => t)
  }, [posts])
  const [tag, setTag] = useState<string | null>(null)
  const [q, setQ] = useState('')
  const [sort, setSort] = useState<'new' | 'short'>('new')
  const mins = (r: string) => parseInt(r, 10) || 0
  const list = useMemo(() => {
    const k = q.trim().toLowerCase()
    const out = posts.filter((p) => (!tag || p.tags.includes(tag)) && (!k || (p.title + ' ' + p.excerpt + ' ' + p.tags.join(' ')).toLowerCase().includes(k)))
    return sort === 'new' ? out : [...out].sort((a, b) => mins(a.readTime) - mins(b.readTime))
  }, [posts, tag, q, sort])
  const chip = (on: boolean): React.CSSProperties => ({ fontFamily: SANS, fontSize: 13, fontWeight: 700, color: on ? '#fff' : C.plumDark, background: on ? C.plumDark : C.white, border: `1px solid ${on ? C.plumDark : C.border}`, borderRadius: 999, padding: '7px 14px', cursor: 'pointer', whiteSpace: 'nowrap' })
  return (
    <div>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center', marginBottom: 16 }}>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search research" aria-label="Search research" style={{ fontFamily: SANS, fontSize: 15, flex: '1 1 220px', minWidth: 0, padding: '11px 16px', borderRadius: 999, border: `1px solid ${C.border}`, background: C.white, color: C.ink, outline: 'none' }} />
        <div style={{ display: 'flex', gap: 8 }}>
          <button type="button" onClick={() => setSort('new')} aria-pressed={sort === 'new'} style={chip(sort === 'new')}>Newest</button>
          <button type="button" onClick={() => setSort('short')} aria-pressed={sort === 'short'} style={chip(sort === 'short')}>Shortest</button>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 6, marginBottom: 22 }}>
        <button type="button" onClick={() => setTag(null)} aria-pressed={tag === null} style={chip(tag === null)}>All ({posts.length})</button>
        {tags.map((t) => <button key={t} type="button" onClick={() => setTag(tag === t ? null : t)} aria-pressed={tag === t} style={chip(tag === t)}>{t}</button>)}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 310px), 1fr))', gap: 22 }}>
        {list.map((p) => (
          <a key={p.slug} href={`/research/${p.slug}`} className="r-card" style={{ textDecoration: 'none', color: 'inherit', border: `1px solid ${C.border}`, borderRadius: 18, overflow: 'hidden', background: C.white, display: 'flex', flexDirection: 'column' }}>
            <div className="r-card-art"><HeroArt slug={p.slug} height={170} /></div>
            <div style={{ padding: '20px 22px 22px', display: 'flex', flexDirection: 'column', flex: 1 }}>
              <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '.14em', textTransform: 'uppercase', color: C.goldDeep, marginBottom: 10 }}>{p.tags.slice(0, 2).join(' · ')}</div>
              <h3 className="r-card-title" style={{ fontFamily: SERIF, fontSize: 21, lineHeight: 1.2, letterSpacing: '-.01em', color: C.plumDark, margin: '0 0 12px', fontWeight: 400, display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{p.title}</h3>
              <p style={{ fontSize: 14.5, lineHeight: 1.6, color: C.inkSoft, margin: '0 0 16px', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{p.excerpt}</p>
              {fresh[p.slug] && (
                <div style={{ fontSize: 12.5, lineHeight: 1.5, color: C.plumDark, background: 'rgba(201,168,76,.14)', border: `1px solid ${C.goldLine}`, borderRadius: 10, padding: '8px 11px', marginBottom: 14 }}>
                  <strong style={{ color: C.goldDeep }}>New in 2026:</strong> {fresh[p.slug]}
                </div>
              )}
              <div style={{ marginTop: 'auto', display: 'flex', gap: 10, fontSize: 13, color: C.muted, alignItems: 'center' }}>
                <time dateTime={p.date}>{p.dateLabel}</time><span aria-hidden>·</span><span>{p.readTime}</span>
              </div>
            </div>
          </a>
        ))}
      </div>
      {list.length === 0 && <p style={{ fontSize: 16, color: C.muted, padding: '30px 0' }}>Nothing matches. Clear the search or the topic filter.</p>}
    </div>
  )
}
