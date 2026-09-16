import React from 'react'
import { C, rp } from './ui'
import type { ResearchPost } from './posts'

/* Dedicated, publication-style shell for the Research section — an editorial
   layout in the brand palette (plum / cream / gold), modelled on a modern
   research index + article template. Not PageShell: these pages are their own
   publication surface. Server components. */

const SANS = "'Public Sans', system-ui, -apple-system, sans-serif"
const SERIF = "Georgia, 'Times New Roman', serif"

/* ── Branded generative card art (deterministic per slug) ──────────────────*/
const GRADS = [
  'linear-gradient(140deg, #3D2645 0%, #2E1A35 100%)',
  'linear-gradient(140deg, #5E2E86 0%, #2E1A35 100%)',
  'linear-gradient(140deg, #2E1A35 0%, #231029 55%, #4a2a5e 100%)',
  'linear-gradient(140deg, #231029 0%, #3D2645 100%)',
]
function hash(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0
  return h
}
export function CardArt({ seed, height = 190, tall = false }: { seed: string; height?: number; tall?: boolean }) {
  const h = hash(seed)
  const g = GRADS[h % GRADS.length]
  const cx = 30 + (h % 45)      // 30–75%
  const cy = 12 + ((h >> 3) % 30) // 12–42%
  return (
    <div style={{ position: 'relative', height: tall ? '100%' : height, minHeight: height, background: g, overflow: 'hidden' }}>
      {/* soft gold glow */}
      <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(60% 60% at ${cx}% ${cy}%, rgba(228,200,121,.28), transparent 70%)` }} />
      {/* concentric rings */}
      <svg viewBox="0 0 400 240" preserveAspectRatio="xMidYMid slice" aria-hidden style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.5 }}>
        <g fill="none" stroke="#C9A84C" strokeOpacity="0.35">
          <circle cx={cx * 4} cy={cy * 2.4} r="46" strokeWidth="1" />
          <circle cx={cx * 4} cy={cy * 2.4} r="88" strokeWidth="1" strokeOpacity="0.22" />
          <circle cx={cx * 4} cy={cy * 2.4} r="132" strokeWidth="1" strokeOpacity="0.12" />
        </g>
      </svg>
      {/* wordmark watermark */}
      <span style={{ position: 'absolute', left: 18, bottom: 14, fontFamily: SERIF, fontStyle: 'italic', fontSize: 15, color: 'rgba(255,255,255,.4)', letterSpacing: '.02em' }}>
        the<span style={{ color: 'rgba(228,200,121,.75)' }}>5</span>th research
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
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '16px clamp(20px,5vw,44px)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
        <a href="/" aria-label="The5th Consulting" style={{ display: 'inline-flex', alignItems: 'center' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/the5th-logo-purple.png" alt="The5th Consulting" style={{ height: 38, width: 'auto', display: 'block' }} />
        </a>
        <nav style={{ display: 'flex', alignItems: 'center', gap: 'clamp(16px,3vw,30px)' }}>
          <a href="/research" style={{ color: C.plumDark, fontSize: 15, fontWeight: 700, textDecoration: 'none' }}>Research</a>
          <a href="/" style={{ color: C.muted, fontSize: 15, fontWeight: 600, textDecoration: 'none' }}>The5th ↗</a>
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
  post, toc, lead, children,
}: {
  post: ResearchPost
  toc: [string, string][]
  lead: React.ReactNode
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
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '6px 12px', fontSize: 14.5, color: C.muted }}>
            <span style={{ fontWeight: 700, color: C.plum }}>{post.author}</span>
            <span aria-hidden>·</span><span>{post.authorRole}</span>
            <span aria-hidden>·</span><time dateTime={post.date}>{post.dateLabel}</time>
            <span aria-hidden>·</span><span>{post.readTime}</span>
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
          <div style={{ ...rp.p, fontSize: 20, lineHeight: 1.7, color: C.plum, margin: '0 0 10px' }}>{lead}</div>
          {children}

          {/* About the series */}
          <div style={{ background: C.plumDark, color: '#fff', borderRadius: 18, padding: 'clamp(24px, 5vw, 34px)', margin: '52px 0 0' }}>
            <div style={{ fontSize: 11.5, fontWeight: 800, letterSpacing: '.16em', textTransform: 'uppercase', color: C.gold, marginBottom: 12 }}>About this series</div>
            <p style={{ fontSize: 16.5, lineHeight: 1.7, color: 'rgba(255,255,255,.86)', margin: '0 0 8px' }}>
              <strong>Research</strong> is where The5th Consulting works out loud on the questions at the edge of
              artificial intelligence, neuroscience, and human behaviour. Written by {post.author}, {post.authorRole}.
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
