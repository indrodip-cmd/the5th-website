import type { Metadata } from 'next'
import { POSTS } from './posts'
import { C } from './ui'
import { ResearchPage, CardArt } from './shell'
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

export default function ResearchIndex() {
  const [featured, ...rest] = POSTS

  return (
    <ResearchPage>
      {/* Hero */}
      <section style={{ maxWidth: 1080, margin: '0 auto', padding: 'clamp(48px,7vw,88px) clamp(20px,5vw,44px) clamp(28px,4vw,44px)' }}>
        <div style={{ fontSize: 12, letterSpacing: '.2em', textTransform: 'uppercase', color: C.goldDeep, fontWeight: 700, marginBottom: 16 }}>Independent research · Indrodip Ghosh</div>
        <h1 style={{ fontFamily: SERIF, fontSize: 'clamp(44px,9vw,92px)', lineHeight: 0.98, letterSpacing: '-.03em', color: C.plumDark, margin: 0 }}>Research</h1>
        <p style={{ fontSize: 'clamp(17px,2.2vw,20px)', lineHeight: 1.6, color: C.inkSoft, maxWidth: 660, margin: '24px 0 0' }}>
          This is my personal research journal. I am a self-taught researcher trying to work out, in plain language, how
          artificial intelligence really works and where it is taking us. Every piece is my own investigation, written so
          that anyone, with no background at all, can follow it and understand a little more of what is coming.
        </p>
      </section>

      {/* Live study banner */}
      <section style={{ maxWidth: 1080, margin: '0 auto', padding: '0 clamp(20px,5vw,44px)' }}>
        <a href="/research/study" style={{ display: 'flex', alignItems: 'center', gap: 14, justifyContent: 'space-between', flexWrap: 'wrap', textDecoration: 'none', background: 'linear-gradient(120deg, #3D2645, #231029)', borderRadius: 16, padding: '18px 22px', boxShadow: '0 20px 50px -40px rgba(46,26,53,.6)' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: '.14em', textTransform: 'uppercase', color: '#E4C879', border: '1px solid rgba(228,200,121,.4)', borderRadius: 999, padding: '4px 11px' }}>Live study</span>
            <span style={{ fontSize: 15.5, color: 'rgba(255,255,255,.9)' }}>Take part in my research: is AI changing how we think? About 6 minutes, anonymous.</span>
          </span>
          <span style={{ color: '#E4C879', fontWeight: 800, whiteSpace: 'nowrap' }}>Take the study →</span>
        </a>
      </section>

      {/* Featured */}
      {featured && (
        <section style={{ maxWidth: 1080, margin: '0 auto', padding: '0 clamp(20px,5vw,44px)' }}>
          <a href={`/research/${featured.slug}`} className="rsch-feat" style={{
            display: 'grid', gridTemplateColumns: '1.05fr 1fr', textDecoration: 'none', color: 'inherit',
            border: `1px solid ${C.border}`, borderRadius: 22, overflow: 'hidden', background: C.white,
            boxShadow: '0 26px 60px -44px rgba(46,26,53,.55)',
          }}>
            <div style={{ minHeight: 280 }}><CardArt seed={featured.slug} tall /></div>
            <div style={{ padding: 'clamp(26px,3.5vw,40px)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: '.12em', textTransform: 'uppercase', color: '#fff', background: C.gold, borderRadius: 999, padding: '4px 12px' }}>Featured</span>
                <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: C.goldDeep }}>{featured.tags[0]}</span>
              </div>
              <h2 style={{ fontFamily: SERIF, fontSize: 'clamp(24px,3.2vw,34px)', lineHeight: 1.12, letterSpacing: '-.015em', color: C.plumDark, margin: '0 0 14px' }}>{featured.title}</h2>
              <p style={{ fontSize: 16, lineHeight: 1.62, color: C.inkSoft, margin: '0 0 20px' }}>{featured.excerpt}</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '4px 10px', fontSize: 13.5, color: C.muted }}>
                <time dateTime={featured.date}>{featured.dateLabel}</time>
                <span aria-hidden>·</span><span>{featured.readTime}</span>
                <span className="rsch-feat-cta" style={{ marginLeft: 'auto', color: C.goldDeep, fontWeight: 700 }}>Read →</span>
              </div>
            </div>
          </a>
        </section>
      )}

      {/* All posts grid */}
      <section style={{ maxWidth: 1080, margin: '0 auto', padding: 'clamp(44px,6vw,68px) clamp(20px,5vw,44px) 0' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', borderBottom: `1px solid ${C.border}`, paddingBottom: 14, marginBottom: 30 }}>
          <h2 style={{ fontFamily: SERIF, fontSize: 24, color: C.plumDark, margin: 0 }}>All research</h2>
          <span style={{ fontSize: 13.5, color: C.muted }}>{POSTS.length} {POSTS.length === 1 ? 'article' : 'articles'}</span>
        </div>

        <div className="rsch-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 24 }}>
          {(rest.length ? rest : POSTS).map((p) => (
            <a key={p.slug} href={`/research/${p.slug}`} className="rsch-card" style={{
              display: 'flex', flexDirection: 'column', textDecoration: 'none', color: 'inherit',
              border: `1px solid ${C.border}`, borderRadius: 18, overflow: 'hidden', background: C.white,
              boxShadow: '0 18px 44px -38px rgba(46,26,53,.5)',
            }}>
              <CardArt seed={p.slug} height={168} />
              <div style={{ padding: '22px 22px 24px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                <span style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: C.goldDeep, marginBottom: 10 }}>{p.tags[0]}</span>
                <h3 style={{ fontFamily: SERIF, fontSize: 21, lineHeight: 1.18, letterSpacing: '-.01em', color: C.plumDark, margin: '0 0 10px' }}>{p.title}</h3>
                <p style={{ fontSize: 14.5, lineHeight: 1.6, color: C.inkSoft, margin: '0 0 18px', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{p.excerpt}</p>
                <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: C.muted }}>
                  <time dateTime={p.date}>{p.dateLabel}</time><span aria-hidden>·</span><span>{p.readTime}</span>
                </div>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* Newsletter */}
      <section style={{ maxWidth: 1080, margin: '0 auto', padding: 'clamp(44px,6vw,72px) clamp(20px,5vw,44px) 0' }}>
        <div style={{
          background: `radial-gradient(120% 120% at 85% 0%, #3D2645 0%, ${C.plumDark} 55%, #231029 100%)`,
          borderRadius: 22, padding: 'clamp(28px,5vw,48px)', overflow: 'hidden',
          boxShadow: '0 30px 70px -44px rgba(46,26,53,.7)',
        }}>
          <div className="nl-grid" style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 'clamp(24px,4vw,44px)', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 11.5, fontWeight: 800, letterSpacing: '.16em', textTransform: 'uppercase', color: C.gold, marginBottom: 12 }}>The Research Newsletter</div>
              <h2 style={{ fontFamily: SERIF, fontSize: 'clamp(24px,3.6vw,34px)', lineHeight: 1.12, letterSpacing: '-.015em', color: '#fff', margin: '0 0 12px' }}>
                Ideas at the edge of AI, mind, and behaviour, in your inbox.
              </h2>
              <p style={{ fontSize: 16.5, lineHeight: 1.65, color: 'rgba(255,255,255,.78)', margin: 0 }}>
                We publish rarely and go deep. Join researchers, founders, and the plain curious who get each new piece the day it drops.
              </p>
            </div>
            <div style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.12)', borderRadius: 16, padding: 'clamp(20px,3vw,26px)' }}>
              <NewsletterForm />
            </div>
          </div>
        </div>
      </section>

      <style>{`
        .rsch-card, .rsch-feat{transition:transform .18s ease, box-shadow .18s ease, border-color .18s ease}
        .rsch-card:hover, .rsch-feat:hover{transform:translateY(-4px);box-shadow:0 34px 70px -40px rgba(46,26,53,.55);border-color:rgba(201,168,76,.5)}
        .rsch-feat:hover .rsch-feat-cta{text-decoration:underline}
        @media(max-width:820px){.rsch-feat{grid-template-columns:1fr!important}}
        @media(max-width:720px){.nl-grid{grid-template-columns:1fr!important}}
      `}</style>
    </ResearchPage>
  )
}
