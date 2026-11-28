import React from 'react'
import { C } from './ui'
import { POSTS, type ResearchPost } from './posts'
import { HeroArt } from './art'
import { DATA } from './data2026'
import { ReadingProgress, TocSpy, StatTiles, BarChart, LineChart, HorizonProjector, ShareBar } from './charts'

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
const NAV: [string, string][] = [
  ['/', 'Home'], ['/about', 'About'], ['/programs', 'Programs'], ['/book', 'Book'], ['/ai', 'AI'],
  ['/resources', 'Resources'], ['/research', 'Research'], ['/results', 'Clients'],
]
export function ResearchHeader() {
  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 20, background: 'rgba(250,246,240,.9)', backdropFilter: 'saturate(140%) blur(10px)',
      borderBottom: `1px solid ${C.border}`,
    }}>
      <div className="rs-head" style={{ maxWidth: 1240, margin: '0 auto', padding: '12px clamp(16px,4vw,40px)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14 }}>
        <a href="/" aria-label="The5th Global Consulting" style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'flex-start', gap: 3, textDecoration: 'none', flexShrink: 0 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/the5th-logo-purple.png" alt="The5th Global Consulting" style={{ height: 32, width: 'auto', display: 'block' }} />
          <span style={{ fontSize: 10.5, letterSpacing: '.08em', color: C.goldDeep, fontWeight: 700, lineHeight: 1 }}>Indradip Ghosh™</span>
        </a>
        <nav className="rs-nav" aria-label="Main" style={{ display: 'flex', alignItems: 'center', gap: 'clamp(12px,2vw,26px)', overflowX: 'auto', scrollbarWidth: 'none' }}>
          {NAV.map(([href, label]) => {
            const on = href === '/research'
            return <a key={href} href={href} aria-current={on ? 'page' : undefined} style={{ color: on ? C.plumDark : C.muted, fontSize: 13.5, fontWeight: on ? 800 : 600, letterSpacing: '.02em', textDecoration: 'none', whiteSpace: 'nowrap', borderBottom: `2px solid ${on ? C.gold : 'transparent'}`, padding: '4px 0' }}>{label}</a>
          })}
          <a href="https://platform.the5thglobal.consulting" style={{ color: C.plumDark, fontSize: 13, fontWeight: 700, textDecoration: 'none', whiteSpace: 'nowrap', border: `1px solid ${C.border}`, borderRadius: 999, padding: '6px 14px', background: C.white }}>Log in</a>
        </nav>
      </div>
      <style>{`.rs-nav::-webkit-scrollbar{display:none}@media(max-width:860px){.rs-head{flex-direction:column;align-items:flex-start!important;gap:8px!important}.rs-nav{max-width:100%;width:100%}}`}</style>
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
            <img src="/images/logo-white.png" alt="The5th Global Consulting" style={{ height: 34, width: 'auto', opacity: 0.9, marginBottom: 6 }} />
            <div style={{ fontSize: 12, letterSpacing: '.08em', color: '#C9A84C', fontWeight: 700, marginBottom: 14 }}>Indradip Ghosh™</div>
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
          © 2026 The5th Global Consulting. All rights reserved.
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

/* ── Article layout (art hero · takeaways · TOC + column · 2026 data) ────*/
const eyebrow: React.CSSProperties = { fontSize: 11.5, fontWeight: 800, letterSpacing: '.14em', textTransform: 'uppercase', color: C.goldDeep }

export function ResearchArticleLayout({
  post, toc, lead, objective, children,
}: {
  post: ResearchPost
  toc: [string, string][]
  lead: React.ReactNode
  objective?: React.ReactNode
  children: React.ReactNode
}) {
  const d = DATA[post.slug]
  const related = (d?.related ?? []).map((s) => POSTS.find((p) => p.slug === s)).filter(Boolean) as ResearchPost[]
  const fullToc: [string, string][] = d ? [...toc, ['new-in-2026', 'New in 2026: the data']] : toc
  return (
    <ResearchPage>
      <ReadingProgress />
      {/* Hero */}
      <div style={{ borderBottom: `1px solid ${C.border}`, background: `linear-gradient(180deg, #FFFDFA 0%, ${C.cream} 100%)` }}>
        <div style={{ maxWidth: 820, margin: '0 auto', padding: 'clamp(34px,5vw,60px) clamp(20px,5vw,32px) clamp(24px,3vw,34px)' }}>
          <a href="/research" style={{ color: C.muted, fontSize: 14, fontWeight: 600, textDecoration: 'none' }}>← Research</a>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8, margin: '22px 0 18px' }}>
            {post.tags.map((t, i) => (
              <React.Fragment key={t}>
                {i > 0 && <span style={{ color: C.border }} aria-hidden>·</span>}
                <span style={eyebrow}>{t}</span>
              </React.Fragment>
            ))}
          </div>
          <h1 style={{ fontFamily: SERIF, fontSize: 'clamp(30px,5.2vw,50px)', lineHeight: 1.08, letterSpacing: '-.02em', color: C.plumDark, margin: '0 0 22px' }}>{post.title}</h1>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 18, flexWrap: 'wrap' }}>
            <div style={{ fontSize: 14, color: C.muted }}>
              <div style={{ fontSize: 15.5, fontWeight: 700, color: C.plum }}>{post.author}</div>
              <div style={{ marginTop: 3 }}>{post.authorRole} · {AUTHOR_DEGREE}</div>
              <div style={{ marginTop: 3 }}><time dateTime={post.date}>{post.dateLabel}</time> · {post.readTime}{d ? ` · ${d.asOf}` : ''}</div>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={AUTHOR_IMG} alt={post.author} style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover', border: `1px solid ${C.border}`, boxShadow: `0 0 0 3px rgba(201,168,76,.18)`, flexShrink: 0 }} />
          </div>
        </div>
        <div style={{ maxWidth: 1080, margin: '0 auto', padding: '0 clamp(16px,4vw,32px) clamp(24px,3vw,36px)' }}>
          <HeroArt slug={post.slug} height="clamp(170px, 30vw, 320px)" rounded={20} label={`Illustration: ${post.title}`} />
        </div>
      </div>

      {/* Body: sticky TOC + reading column */}
      <div className="rsch-body" style={{ maxWidth: 1080, margin: '0 auto', padding: 'clamp(30px,5vw,52px) clamp(20px,5vw,32px) 20px', display: 'grid', gridTemplateColumns: '220px minmax(0, 720px)', gap: 'clamp(28px,5vw,64px)', justifyContent: 'center' }}>
        <aside className="rsch-toc" style={{ position: 'sticky', top: 92, alignSelf: 'start', height: 'fit-content' }}>
          <div style={{ ...eyebrow, fontSize: 11, letterSpacing: '.14em', marginBottom: 14 }}>Contents</div>
          <TocSpy toc={fullToc} />
          <div style={{ marginTop: 22 }}><ShareBar title={post.title} /></div>
        </aside>

        <article>
          <div style={{ fontFamily: 'Georgia, serif', fontSize: 20, lineHeight: 1.7, color: C.plum, margin: '0 0 22px' }}>{lead}</div>

          {d && (
            <div style={{ background: C.white, border: `1px solid ${C.border}`, borderTop: `3px solid ${C.gold}`, borderRadius: 14, padding: '20px 22px', margin: '0 0 26px' }}>
              <div style={{ ...eyebrow, marginBottom: 12 }}>Key takeaways</div>
              <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'grid', gap: 11 }}>
                {d.takeaways.map((t, i) => (
                  <li key={i} style={{ display: 'grid', gridTemplateColumns: '26px 1fr', gap: 10, fontSize: 16, lineHeight: 1.6, color: C.inkSoft }}>
                    <span aria-hidden style={{ width: 24, height: 24, borderRadius: 24, background: 'rgba(201,168,76,.2)', color: C.plumDark, fontSize: 12.5, fontWeight: 800, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginTop: 2 }}>{i + 1}</span>
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {objective && (
            <div style={{ background: C.cream, border: `1px solid ${C.border}`, borderLeft: `3px solid ${C.gold}`, borderRadius: 12, padding: '20px 22px', margin: '0 0 30px' }}>
              <div style={{ ...eyebrow, marginBottom: 8 }}>Objective of this research</div>
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

          {/* New in 2026: sourced data update */}
          {d && (
            <section id="new-in-2026" style={{ margin: '56px 0 0', scrollMarginTop: 90 }}>
              <div style={{ background: C.plumDark, color: '#fff', borderRadius: 20, padding: 'clamp(22px,4.4vw,36px)', borderTop: `3px solid ${C.gold}` }}>
                <div style={{ ...eyebrow, color: C.gold }}>New in 2026 · {d.asOf}</div>
                <h2 style={{ fontFamily: SERIF, fontSize: 'clamp(23px,3.4vw,30px)', lineHeight: 1.18, letterSpacing: '-.015em', color: '#fff', margin: '12px 0 22px', fontWeight: 400 }}>{d.headline}</h2>
                <StatTiles stats={d.stats} />
              </div>

              {d.chart && (
                <div style={{ marginTop: 20 }}>
                  {d.chart.kind === 'bars'
                    ? <BarChart title={d.chart.title} subtitle={d.chart.subtitle} unit={d.chart.unit} items={d.chart.items} max={d.chart.max} src={d.chart.src} />
                    : <LineChart title={d.chart.title} subtitle={d.chart.subtitle} unit={d.chart.unit} xLabels={d.chart.xLabels} series={d.chart.series} src={d.chart.src} />}
                </div>
              )}
              {d.projector && <div style={{ marginTop: 20 }}><HorizonProjector /></div>}

              <div style={{ marginTop: 20, display: 'grid', gap: 14 }}>
                <div style={{ background: 'rgba(201,168,76,.09)', border: `1px solid ${C.goldLine}`, borderRadius: 14, padding: '18px 22px' }}>
                  <div style={{ ...eyebrow, marginBottom: 8 }}>Why it matters</div>
                  <div style={{ fontSize: 16.5, lineHeight: 1.7, color: C.inkSoft }}>{d.whyItMatters}</div>
                </div>
                <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 14, padding: '18px 22px' }}>
                  <div style={{ ...eyebrow, marginBottom: 10 }}>What to do with this</div>
                  <ul style={{ margin: 0, paddingLeft: 20 }}>
                    {d.nextSteps.map((n) => <li key={n} style={{ fontSize: 16, lineHeight: 1.65, color: C.inkSoft, margin: '0 0 8px' }}>{n}</li>)}
                  </ul>
                </div>
                <div style={{ border: `1px dashed ${C.border}`, borderRadius: 14, padding: '14px 18px', fontSize: 14, lineHeight: 1.6, color: C.muted }}>
                  <strong style={{ color: C.plum }}>Read with care.</strong> {d.caveat}
                </div>
                <div>
                  <div style={{ ...eyebrow, marginBottom: 10 }}>Sources</div>
                  <ol style={{ margin: 0, paddingLeft: 20 }}>
                    {d.sources.map((src) => (
                      <li key={src.url} style={{ fontSize: 14.5, lineHeight: 1.6, color: C.inkSoft, margin: '0 0 6px' }}>
                        <a href={src.url} target="_blank" rel="noopener noreferrer" style={{ color: C.plum, fontWeight: 600 }}>{src.label}</a>
                        <span style={{ color: C.muted }}> · {src.date}{src.note ? ` · ${src.note}` : ''}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            </section>
          )}

          {/* Related reading */}
          {related.length > 0 && (
            <section style={{ margin: '48px 0 0' }}>
              <div style={{ ...eyebrow, marginBottom: 14 }}>Keep reading</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 14 }}>
                {related.map((r) => (
                  <a key={r.slug} href={`/research/${r.slug}`} className="rsch-rel" style={{ textDecoration: 'none', color: 'inherit', border: `1px solid ${C.border}`, borderRadius: 14, overflow: 'hidden', background: C.white, display: 'block' }}>
                    <HeroArt slug={r.slug} height={104} />
                    <div style={{ padding: '14px 16px 16px' }}>
                      <div style={{ ...eyebrow, fontSize: 10.5, marginBottom: 7 }}>{r.tags[0]}</div>
                      <div style={{ fontFamily: SERIF, fontSize: 16.5, lineHeight: 1.25, color: C.plumDark, display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{r.title}</div>
                      <div style={{ fontSize: 12.5, color: C.muted, marginTop: 9 }}>{r.readTime}</div>
                    </div>
                  </a>
                ))}
              </div>
            </section>
          )}

          {/* About this research journal */}
          <div style={{ background: C.plumDark, color: '#fff', borderRadius: 18, padding: 'clamp(24px, 5vw, 34px)', margin: '48px 0 0' }}>
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
        .rsch-rel{transition:border-color .18s, transform .18s}
        .rsch-rel:hover{border-color:rgba(201,168,76,.6);transform:translateY(-2px)}
        @media(max-width:1000px){
          .rsch-body{grid-template-columns:minmax(0,720px)!important}
          .rsch-toc{display:none!important}
        }
      `}</style>
    </ResearchPage>
  )
}
