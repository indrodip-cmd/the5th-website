import React from 'react'
import { C, rp } from './ui'
import type { ResearchPost } from './posts'

/* Dedicated, publication-style shell for the Research section, an editorial
   layout in the brand palette (plum / cream / gold), modelled on a modern
   research index + article template. Not PageShell: these pages are their own
   publication surface. Server components. */

const SANS = "'Public Sans', system-ui, -apple-system, sans-serif"
const SERIF = "Georgia, 'Times New Roman', serif"

/* Author identity, shown in article bylines and on the research home page. */
export const AUTHOR_IMG = '/images/founder.png'
export const AUTHOR_DEGREE = 'Human-Computer Interaction · University of California'

/* ── Branded generative card art (deterministic per slug) ──────────────────*/
const GRADS = [
  'linear-gradient(150deg, #3a2145 0%, #241129 58%, #1b0d20 100%)',
  'linear-gradient(150deg, #472a5c 0%, #2a1633 60%, #1b0d20 100%)',
  'linear-gradient(150deg, #2e1a35 0%, #20101f 100%)',
  'linear-gradient(150deg, #331d3f 0%, #231029 100%)',
]
function hash(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0
  return h
}
/* Refined, premium generative art: a deep plum field, one soft off-center gold
   glow, and a set of fine concentric gold arcs. Calm and expensive, not busy. */
export function CardArt({ seed, height = 190, tall = false }: { seed: string; height?: number; tall?: boolean }) {
  const h = hash(seed)
  const g = GRADS[h % GRADS.length]
  const cx = 60 + (h % 28)         // 60–88%
  const cy = 16 + ((h >> 3) % 22)  // 16–38%
  const ox = cx * 5, oy = cy * 4   // arc centre in the 500x300 viewBox
  return (
    <div style={{ position: 'relative', height: tall ? '100%' : height, minHeight: height, background: g, overflow: 'hidden' }}>
      {/* soft gold glow */}
      <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(70% 70% at ${cx}% ${cy}%, rgba(228,200,121,.20), transparent 72%)` }} />
      {/* fine concentric arcs */}
      <svg viewBox="0 0 500 300" preserveAspectRatio="xMidYMid slice" aria-hidden style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
        <g fill="none" stroke="#C9A84C" strokeWidth="0.75">
          {[54, 96, 142, 192, 246].map((r, i) => (
            <circle key={r} cx={ox} cy={oy} r={r} strokeOpacity={0.3 - i * 0.05} />
          ))}
        </g>
      </svg>
      {/* inner hairline for depth */}
      <div style={{ position: 'absolute', inset: 0, boxShadow: 'inset 0 0 0 1px rgba(255,255,255,.05), inset 0 -60px 80px -40px rgba(0,0,0,.35)' }} />
      {/* wordmark */}
      <span style={{ position: 'absolute', left: 20, bottom: 16, fontFamily: SERIF, fontStyle: 'italic', fontSize: 14, color: 'rgba(255,255,255,.34)', letterSpacing: '.03em' }}>
        the<span style={{ color: 'rgba(228,200,121,.7)' }}>5</span>th research
      </span>
    </div>
  )
}

/* ── Header ────────────────────────────────────────────────────────────────*/
export function ResearchHeader() {
  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 20, background: 'rgba(250,246,240,.86)', backdropFilter: 'saturate(140%) blur(10px)',
      borderBottom: `1px solid ${C.border}`,
    }}>
      <div style={{ maxWidth: 1180, margin: '0 auto', padding: '15px clamp(20px,5vw,56px)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
        <a href="/" aria-label="The5th Consulting" style={{ display: 'inline-flex', alignItems: 'center' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/the5th-logo-purple.png" alt="The5th Consulting" style={{ height: 34, width: 'auto', display: 'block' }} />
        </a>
        <nav style={{ display: 'flex', alignItems: 'center', gap: 'clamp(20px,4vw,34px)' }}>
          <a href="/research" style={{ color: C.plumDark, fontSize: 13.5, fontWeight: 600, letterSpacing: '.02em', textDecoration: 'none' }}>Research</a>
          <a href="/research/study" style={{ color: C.muted, fontSize: 13.5, fontWeight: 600, letterSpacing: '.02em', textDecoration: 'none' }}>Study</a>
          <a href="/" style={{ color: C.muted, fontSize: 13.5, fontWeight: 600, letterSpacing: '.02em', textDecoration: 'none' }}>The5th ↗</a>
        </nav>
      </div>
    </header>
  )
}

/* ── Footer ──────────────────────────────────────────────────────────────*/
const FLINKS = [
  { href: '/', label: 'Home' },
  { href: '/research', label: 'All research' },
  { href: '/support', label: 'Support' },
  { href: '/data-usage', label: 'Data Usage' },
  { href: '/ethics', label: 'Code of Ethics' },
  { href: 'mailto:indrodip@10kroadmap.org', label: 'Contact' },
]
export function ResearchFooter() {
  return (
    <footer style={{ background: C.plumDark, color: '#fff', marginTop: 72 }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '52px clamp(20px,5vw,44px) 40px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: 24, alignItems: 'flex-start' }}>
          <div style={{ maxWidth: 320 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/logo-white.png" alt="The5th Consulting" style={{ height: 34, width: 'auto', opacity: 0.9, marginBottom: 14 }} />
            <p style={{ fontSize: 14.5, lineHeight: 1.7, color: 'rgba(255,255,255,.6)', margin: 0 }}>
              Research at the edge of artificial intelligence, neuroscience, and human behaviour.
            </p>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px 26px' }}>
            {FLINKS.map((l) => (
              <a key={l.label} href={l.href} style={{ color: 'rgba(255,255,255,.72)', fontSize: 14.5, textDecoration: 'none' }}>{l.label}</a>
            ))}
          </div>
        </div>
        <div style={{ borderTop: '1px solid rgba(255,255,255,.14)', marginTop: 34, paddingTop: 20, fontSize: 13, color: 'rgba(255,255,255,.5)' }}>
          © 2026 The5th Consulting. All rights reserved.
        </div>
      </div>
    </footer>
  )
}

/* ── Page wrapper ──────────────────────────────────────────────────────────*/
export function ResearchPage({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ background: C.cream, minHeight: '100vh', color: C.ink, fontFamily: SANS }}>
      <ResearchHeader />
      {children}
      <ResearchFooter />
    </div>
  )
}

/* ── Article layout (category eyebrow · big title · meta · TOC + column) ───*/
export function ResearchArticleLayout({
  post, toc, lead, objective, children,
}: {
  post: ResearchPost
  toc: [string, string][]
  lead: React.ReactNode
  objective?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <ResearchPage>
      {/* Hero */}
      <div style={{ borderBottom: `1px solid ${C.border}`, background: `linear-gradient(180deg, #FFFDFA 0%, ${C.cream} 100%)` }}>
        <div style={{ maxWidth: 820, margin: '0 auto', padding: 'clamp(40px,6vw,72px) clamp(20px,5vw,32px) clamp(28px,4vw,40px)' }}>
          <a href="/research" style={{ color: C.muted, fontSize: 14, fontWeight: 600, textDecoration: 'none' }}>← Research</a>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8, margin: '22px 0 18px' }}>
            {post.tags.map((t, i) => (
              <React.Fragment key={t}>
                {i > 0 && <span style={{ color: C.border }} aria-hidden>·</span>}
                <span style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: C.goldDeep }}>{t}</span>
              </React.Fragment>
            ))}
          </div>
          <h1 style={{ fontFamily: SERIF, fontSize: 'clamp(32px,5.4vw,52px)', lineHeight: 1.08, letterSpacing: '-.02em', color: C.plumDark, margin: '0 0 22px' }}>{post.title}</h1>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 18, flexWrap: 'wrap' }}>
            <div style={{ fontSize: 14, color: C.muted }}>
              <div style={{ fontSize: 15.5, fontWeight: 700, color: C.plum }}>{post.author}</div>
              <div style={{ marginTop: 3 }}>{post.authorRole} · {AUTHOR_DEGREE}</div>
              <div style={{ marginTop: 3 }}><time dateTime={post.date}>{post.dateLabel}</time> · {post.readTime}</div>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={AUTHOR_IMG} alt={post.author} style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover', border: `1px solid ${C.border}`, boxShadow: `0 0 0 3px rgba(201,168,76,.18)`, flexShrink: 0 }} />
          </div>
        </div>
      </div>

      {/* Body: sticky TOC + reading column */}
      <div className="rsch-body" style={{ maxWidth: 1080, margin: '0 auto', padding: 'clamp(30px,5vw,52px) clamp(20px,5vw,32px) 20px', display: 'grid', gridTemplateColumns: '220px minmax(0, 720px)', gap: 'clamp(28px,5vw,64px)', justifyContent: 'center' }}>
        <aside className="rsch-toc" style={{ position: 'sticky', top: 92, alignSelf: 'start', height: 'fit-content' }}>
          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '.14em', textTransform: 'uppercase', color: C.goldDeep, marginBottom: 14 }}>Contents</div>
          <nav style={{ display: 'grid', gap: 10, borderLeft: `1px solid ${C.border}`, paddingLeft: 16 }}>
            {toc.map(([id, label]) => (
              <a key={id} href={`#${id}`} style={{ color: C.inkSoft, fontSize: 13.5, lineHeight: 1.4, textDecoration: 'none' }}>{label}</a>
            ))}
          </nav>
        </aside>

        <article>
          <div style={{ ...rp.p, fontSize: 20, lineHeight: 1.7, color: C.plum, margin: '0 0 18px' }}>{lead}</div>
          {objective && (
            <div style={{ background: C.cream, border: `1px solid ${C.border}`, borderLeft: `3px solid ${C.gold}`, borderRadius: 12, padding: '20px 22px', margin: '0 0 30px' }}>
              <div style={{ fontSize: 11.5, fontWeight: 800, letterSpacing: '.14em', textTransform: 'uppercase', color: C.goldDeep, marginBottom: 8 }}>Objective of this research</div>
              <div style={{ fontSize: 16, lineHeight: 1.7, color: C.inkSoft }}>{objective}</div>
              <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${C.border}`, fontSize: 13, color: C.muted, lineHeight: 1.6 }}>
                Independent research by {post.author}. I am a self-taught researcher, and this is one entry in an ongoing
                journey to understand, in plain language, how AI actually works and where it is taking us. The questions,
                the investigation, and the conclusions are my own; where I build on published studies I name them, so you
                can check my work and learn alongside me.
              </div>
            </div>
          )}
          {children}

          {/* About this research journal */}
          <div style={{ background: C.plumDark, color: '#fff', borderRadius: 18, padding: 'clamp(24px, 5vw, 34px)', margin: '52px 0 0' }}>
            <div style={{ fontSize: 11.5, fontWeight: 800, letterSpacing: '.16em', textTransform: 'uppercase', color: C.gold, marginBottom: 12 }}>About this research</div>
            <p style={{ fontSize: 16.5, lineHeight: 1.7, color: 'rgba(255,255,255,.86)', margin: '0 0 8px' }}>
              <strong>Research</strong> is my personal research journal. I am {post.author}, a self-taught researcher
              working in the open on how artificial intelligence really works, what it means for people, and what is
              coming next. I try to write every piece so that anyone, with no background at all, can follow it and come
              away understanding a little more.
            </p>
            <a href="/research" style={{ color: C.gold, fontWeight: 700, textDecoration: 'none' }}>← Back to all research</a>
          </div>
        </article>
      </div>

      <style>{`
        .rsch-toc a:hover{color:${C.plumDark}}
        @media(max-width:1000px){
          .rsch-body{grid-template-columns:minmax(0,720px)!important}
          .rsch-toc{display:none!important}
        }
      `}</style>
    </ResearchPage>
  )
}
