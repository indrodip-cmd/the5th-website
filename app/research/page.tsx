import type { Metadata } from 'next'
import { POSTS } from './posts'
import { C } from './ui'
import { ResearchPage, CardArt, AUTHOR_IMG, AUTHOR_DEGREE } from './shell'
import NewsletterForm from './NewsletterForm'

export const metadata: Metadata = {
  title: 'Research | The5th Consulting',
  description:
    'Long-form research from The5th Consulting on artificial intelligence, consumer behavior, neuroscience, and the science of machine minds. In-depth, first-principles writing for the curious and the technical alike.',
  alternates: { canonical: '/research' },
  openGraph: {
    type: 'website',
    url: 'https://the5th.consulting/research',
    title: 'Research | The5th Consulting',
    description:
      'In-depth research on artificial intelligence, neuroscience, and the science of machine minds, written for the curious layperson and the working researcher.',
  },
}

const SERIF = "Georgia, 'Times New Roman', serif"
const MAXW = 1180
const PADX = 'clamp(20px,5vw,56px)'

// Pinned featured essay. Selected by slug (not array order) so it stays
// featured regardless of publish order, and it is also kept in the list below.
const FEATURED_SLUG = 'how-persuasive-is-frontier-ai'

export default function ResearchIndex() {
  const featured = POSTS.find((p) => p.slug === FEATURED_SLUG) ?? POSTS[0]

  return (
    <ResearchPage>
      {/* Hero */}
      <section style={{ maxWidth: MAXW, margin: '0 auto', padding: `clamp(44px,9vw,120px) ${PADX} clamp(30px,4vw,44px)` }}>
        <div className="r-hero" style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 'clamp(28px,5vw,72px)', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 12, letterSpacing: '.24em', textTransform: 'uppercase', color: C.muted, fontWeight: 600, marginBottom: 22 }}>
              The5th <span style={{ color: C.goldDeep }}>·</span> Independent Research
            </div>
            <h1 style={{ fontFamily: SERIF, fontSize: 'clamp(46px,12vw,116px)', lineHeight: 0.94, letterSpacing: '-.035em', color: C.plumDark, margin: 0, fontWeight: 400 }}>Research</h1>
            <p style={{ fontSize: 'clamp(18px,2.2vw,22px)', lineHeight: 1.55, color: C.inkSoft, maxWidth: 620, margin: '30px 0 0', fontWeight: 400 }}>
              A personal research journal by Indrodip Ghosh. Long, careful essays on how artificial intelligence really works
              and where it is taking us, written so anyone can follow, and precise enough for anyone who cannot.
            </p>
            <div className="r-hero-meta" style={{ display: 'flex', gap: 24, marginTop: 34, fontSize: 13, color: C.muted, letterSpacing: '.02em', flexWrap: 'wrap' }}>
              <span>{POSTS.length} essays</span>
              <span aria-hidden style={{ color: C.border }}>|</span>
              <span>Updated regularly</span>
              <span aria-hidden style={{ color: C.border }}>|</span>
              <a href="/research/study" style={{ color: C.goldDeep, textDecoration: 'none', fontWeight: 600 }}>Live study open ↗</a>
            </div>
          </div>
          {/* Author */}
          <aside className="r-hero-author" style={{ width: 210, textAlign: 'center', flexShrink: 0 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={AUTHOR_IMG} alt="Indrodip Ghosh" style={{ width: 132, height: 132, borderRadius: '50%', objectFit: 'cover', margin: '0 auto', display: 'block', border: `1px solid ${C.border}`, boxShadow: `0 0 0 5px rgba(201,168,76,.14), 0 24px 50px -30px rgba(46,26,53,.5)` }} />
            <div style={{ fontFamily: SERIF, fontSize: 19, color: C.plumDark, marginTop: 18 }}>Indrodip Ghosh</div>
            <div style={{ fontSize: 12.5, color: C.muted, marginTop: 4 }}>Consumer Behavior &amp; AI Researcher</div>
            <div style={{ height: 1, width: 40, background: C.gold, margin: '12px auto' }} />
            <div style={{ fontSize: 12.5, color: C.inkSoft, lineHeight: 1.5 }}>{AUTHOR_DEGREE}</div>
          </aside>
        </div>
      </section>

      {/* Featured */}
      {featured && (
        <section style={{ maxWidth: MAXW, margin: '0 auto', padding: `clamp(20px,3vw,32px) ${PADX} 0` }}>
          <a href={`/research/${featured.slug}`} className="r-feat" style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0, textDecoration: 'none', color: 'inherit',
            border: `1px solid ${C.border}`, borderRadius: 20, overflow: 'hidden', background: C.white,
          }}>
            <div className="r-feat-art" style={{ minHeight: 340 }}><CardArt seed={featured.slug} tall /></div>
            <div style={{ padding: 'clamp(30px,4vw,56px)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                <span style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '.16em', textTransform: 'uppercase', color: C.goldDeep }}>Featured</span>
                <span aria-hidden style={{ width: 4, height: 4, borderRadius: 4, background: C.border }} />
                <span style={{ fontSize: 11.5, letterSpacing: '.1em', textTransform: 'uppercase', color: C.muted }}>{featured.tags[0]}</span>
              </div>
              <h2 style={{ fontFamily: SERIF, fontSize: 'clamp(26px,3.2vw,38px)', lineHeight: 1.1, letterSpacing: '-.02em', color: C.plumDark, margin: '0 0 18px', fontWeight: 400 }}>{featured.title}</h2>
              <p style={{ fontSize: 16.5, lineHeight: 1.6, color: C.inkSoft, margin: '0 0 26px', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{featured.excerpt}</p>
              <div className="r-feat-meta" style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 13.5, color: C.muted }}>
                <time dateTime={featured.date}>{featured.dateLabel}</time>
                <span aria-hidden style={{ color: C.border }}>|</span>
                <span>{featured.readTime}</span>
                <span className="r-feat-cta" style={{ marginLeft: 'auto', color: C.plumDark, fontWeight: 600, borderBottom: `1px solid ${C.goldDeep}`, paddingBottom: 2 }}>Read essay</span>
              </div>
            </div>
          </a>
        </section>
      )}

      {/* Live study, slim */}
      <section style={{ maxWidth: MAXW, margin: '0 auto', padding: `clamp(20px,3vw,28px) ${PADX} 0` }}>
        <a href="/research/study" className="r-study" style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap', textDecoration: 'none', color: 'inherit', border: `1px solid ${C.border}`, borderRadius: 14, padding: '16px 22px', background: C.white }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 10.5, fontWeight: 700, letterSpacing: '.16em', textTransform: 'uppercase', color: C.goldDeep }}>
            <span aria-hidden style={{ width: 7, height: 7, borderRadius: 7, background: C.gold, boxShadow: `0 0 0 4px rgba(201,168,76,.18)` }} />
            Live study
          </span>
          <span style={{ fontSize: 15, color: C.inkSoft }}>Take part in the research: is AI changing how we think? About 6 minutes, fully anonymous.</span>
          <span className="r-study-cta" style={{ marginLeft: 'auto', fontSize: 14, fontWeight: 600, color: C.plumDark, whiteSpace: 'nowrap' }}>Take the study →</span>
        </a>
      </section>

      {/* Index list */}
      <section style={{ maxWidth: MAXW, margin: '0 auto', padding: `clamp(52px,7vw,88px) ${PADX} 0` }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 8 }}>
          <h2 style={{ fontSize: 12, letterSpacing: '.24em', textTransform: 'uppercase', color: C.muted, fontWeight: 600, margin: 0 }}>All research</h2>
          <span style={{ fontSize: 12.5, color: C.muted }}>{POSTS.length} essays</span>
        </div>

        <div>
          {POSTS.map((p, i) => (
            <a key={p.slug} href={`/research/${p.slug}`} className="r-row" style={{
              display: 'grid', gridTemplateColumns: '1fr 180px', gap: 'clamp(16px,4vw,48px)', textDecoration: 'none', color: 'inherit',
              borderTop: `1px solid ${C.border}`, padding: 'clamp(26px,3.4vw,40px) 12px', alignItems: 'start',
              borderBottom: i === POSTS.length - 1 ? `1px solid ${C.border}` : 'none',
            }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', color: C.goldDeep, marginBottom: 12 }}>{p.tags[0]}</div>
                <h3 className="r-row-title" style={{ fontFamily: SERIF, fontSize: 'clamp(22px,2.8vw,30px)', lineHeight: 1.14, letterSpacing: '-.02em', color: C.plumDark, margin: '0 0 12px', fontWeight: 400, transition: 'color .18s ease' }}>{p.title}</h3>
                <p style={{ fontSize: 15.5, lineHeight: 1.6, color: C.inkSoft, margin: 0, maxWidth: 640, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{p.excerpt}</p>
              </div>
              <div className="r-row-meta" style={{ textAlign: 'right', fontSize: 13, color: C.muted, lineHeight: 1.7, paddingTop: 26 }}>
                <time dateTime={p.date} style={{ display: 'block' }}>{p.dateLabel}</time>
                <span style={{ display: 'block' }}>{p.readTime}</span>
                <span className="r-row-cta" style={{ display: 'inline-block', marginTop: 10, color: C.plumDark, fontWeight: 600, opacity: 0, transition: 'opacity .18s ease' }}>Read →</span>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* Newsletter */}
      <section style={{ maxWidth: MAXW, margin: '0 auto', padding: `clamp(56px,7vw,90px) ${PADX} 0` }}>
        <div style={{ background: C.plumDark, borderRadius: 20, borderTop: `2px solid ${C.gold}`, padding: 'clamp(30px,5vw,54px)', overflow: 'hidden' }}>
          <div className="nl-grid" style={{ display: 'grid', gridTemplateColumns: '1.15fr 1fr', gap: 'clamp(28px,4vw,56px)', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.2em', textTransform: 'uppercase', color: C.gold, marginBottom: 16 }}>The Research Newsletter</div>
              <h2 style={{ fontFamily: SERIF, fontSize: 'clamp(25px,3.4vw,36px)', lineHeight: 1.12, letterSpacing: '-.02em', color: '#fff', margin: '0 0 14px', fontWeight: 400 }}>
                Ideas at the edge of AI, mind, and behaviour, in your inbox.
              </h2>
              <p style={{ fontSize: 16, lineHeight: 1.6, color: 'rgba(255,255,255,.7)', margin: 0 }}>
                Rare, and always in depth. Join the researchers, founders, and simply curious who read each new essay the day it drops.
              </p>
            </div>
            <div style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.12)', borderRadius: 14, padding: 'clamp(20px,3vw,26px)' }}>
              <NewsletterForm />
            </div>
          </div>
        </div>
      </section>

      <style>{`
        .r-feat{transition:border-color .2s ease, box-shadow .3s ease}
        .r-feat:hover{border-color:rgba(201,168,76,.55);box-shadow:0 40px 90px -60px rgba(46,26,53,.5)}
        .r-feat:hover .r-feat-art :is(div,svg){filter:saturate(1.05)}
        .r-study{transition:border-color .18s ease, background .18s ease}
        .r-study:hover{border-color:rgba(201,168,76,.55)}
        .r-study:hover .r-study-cta{color:${C.goldDeep}}
        .r-row{transition:background .18s ease}
        .r-row:hover{background:rgba(201,168,76,.05)}
        .r-row:hover .r-row-title{color:${C.goldDeep}}
        .r-row:hover .r-row-cta{opacity:1}
        @media(max-width:820px){
          .r-hero{grid-template-columns:1fr!important}
          .r-hero-author{width:100%!important;display:flex;align-items:center;gap:16px;text-align:left!important;margin-top:6px}
          .r-hero-author img{width:72px!important;height:72px!important;margin:0!important}
          .r-hero-author > div:nth-child(4){display:none}
          .r-feat{grid-template-columns:1fr!important}
          .r-feat-art{min-height:220px!important}
          .r-row{grid-template-columns:1fr!important;gap:14px!important}
          .r-row-meta{text-align:left!important;padding-top:0!important;display:flex;gap:14px;align-items:center}
          .r-row-meta time{display:inline!important}
          .r-row-meta span{display:inline!important}
          .nl-grid{grid-template-columns:1fr!important}
        }
        @media(max-width:560px){
          .r-study{align-items:flex-start!important;gap:10px!important;padding:16px 18px!important}
          .r-study-cta{margin-left:0!important}
          .r-feat-cta{margin-left:0!important}
          .r-feat-meta{flex-wrap:wrap!important;row-gap:10px!important}
          .r-hero-meta{gap:12px 16px!important}
        }
      `}</style>
    </ResearchPage>
  )
}
