import type { Metadata } from 'next'
import { POSTS } from './posts'
import { C } from './ui'
import { ResearchPage, AUTHOR_IMG, AUTHOR_DEGREE } from './shell'
import { HeroArt } from './art'
import { DATA } from './data2026'
import Browser from './Browser'
import NewsletterForm from './NewsletterForm'

export const metadata: Metadata = {
  title: 'Research | The5th Global Consulting',
  description:
    'Long-form research from The5th Global Consulting on artificial intelligence, consumer behavior, neuroscience, and the science of machine minds. In-depth, first-principles writing for the curious and the technical alike.',
  alternates: { canonical: '/research' },
  openGraph: {
    type: 'website',
    url: 'https://the5thglobal.consulting/research',
    title: 'Research | The5th Global Consulting',
    description:
      'In-depth research on artificial intelligence, neuroscience, and the science of machine minds, written for the curious layperson and the working researcher.',
  },
}

const SERIF = "Georgia, 'Times New Roman', serif"
const MAXW = 1180
const PADX = 'clamp(20px,5vw,56px)'

// Pinned featured essay. Selected by slug (not array order) so it stays
// featured regardless of publish order, and it is also kept in the list below.
const TICK = [
  '76,977 people in the largest AI persuasion experiments (Science, 2025)',
  'AI task length doubling about every 7 months (METR, 2026)',
  '49% of US adults now use AI chatbots (Pew, 2026)',
  '71% of B2B software buyers research with AI chatbots (G2, 2026)',
  '69% of buyers still validate AI advice with a human (Gartner, 2026)',
  '14.2% of marketers cut agency spend because of AI (Marketing Week)',
]
const FEATURED_SLUG = 'how-persuasive-is-frontier-ai'

export default function ResearchIndex() {
  const fresh: Record<string, string> = Object.fromEntries(Object.entries(DATA).map(([k, v]) => [k, v.headline]))
  const featured = POSTS.find((p) => p.slug === FEATURED_SLUG) ?? POSTS[0]

  return (
    <ResearchPage>
      {/* Hero: dark, futuristic */}
      <section style={{ position: 'relative', overflow: 'hidden', background: 'radial-gradient(90% 120% at 80% 0%, #4a2a5e 0%, #2a1433 40%, #140919 100%)', color: '#fff' }}>
        <div aria-hidden style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(228,200,121,.07) 1px, transparent 1px), linear-gradient(90deg, rgba(228,200,121,.07) 1px, transparent 1px)', backgroundSize: '56px 56px', maskImage: 'radial-gradient(70% 80% at 70% 30%, #000, transparent 75%)', WebkitMaskImage: 'radial-gradient(70% 80% at 70% 30%, #000, transparent 75%)' }} />
        <div aria-hidden className="r-orbit" style={{ position: 'absolute', right: '-8%', top: '-12%', width: 'min(760px, 90vw)', aspectRatio: '1', pointerEvents: 'none' }}>
          <svg viewBox="0 0 400 400" style={{ width: '100%', height: '100%' }}>
            <g fill="none" stroke="#E4C879" strokeWidth=".6">
              <circle cx="200" cy="200" r="70" strokeOpacity=".5" /><circle cx="200" cy="200" r="110" strokeOpacity=".35" strokeDasharray="2 6" />
              <circle cx="200" cy="200" r="150" strokeOpacity=".28" /><circle cx="200" cy="200" r="190" strokeOpacity=".18" strokeDasharray="1 8" />
            </g>
            <g fill="#E4C879"><circle cx="270" cy="200" r="4" /><circle cx="90" cy="200" r="3" opacity=".7" /><circle cx="200" cy="40" r="3.5" /><circle cx="330" cy="260" r="2.5" opacity=".6" /></g>
            <circle cx="200" cy="200" r="16" fill="#C9A84C" opacity=".9" />
          </svg>
        </div>
        <div style={{ position: 'relative', maxWidth: MAXW, margin: '0 auto', padding: `clamp(48px,9vw,110px) ${PADX} clamp(40px,6vw,64px)` }}>
          <div className="r-hero" style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) auto', gap: 'clamp(28px,5vw,72px)', alignItems: 'center' }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, fontSize: 11.5, letterSpacing: '.22em', textTransform: 'uppercase', color: C.gold, fontWeight: 700, border: '1px solid rgba(228,200,121,.35)', borderRadius: 999, padding: '7px 14px', background: 'rgba(255,255,255,.04)' }}>
                <span aria-hidden className="r-pulse" style={{ width: 7, height: 7, borderRadius: 7, background: C.gold }} />
                The5th Research Lab · 2026
              </div>
              <h1 style={{ fontFamily: SERIF, fontSize: 'clamp(40px,8.4vw,96px)', lineHeight: 0.98, letterSpacing: '-.035em', margin: '26px 0 0', fontWeight: 400 }}>
                Where AI meets<br /><span style={{ background: 'linear-gradient(90deg,#E4C879,#C9A84C 50%,#fff)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent', fontStyle: 'italic' }}>the human mind.</span>
              </h1>
              <p style={{ fontSize: 'clamp(17px,2vw,21px)', lineHeight: 1.6, color: 'rgba(255,255,255,.74)', maxWidth: 600, margin: '26px 0 0' }}>
                Independent research by Indrodip Ghosh on how artificial intelligence really works and what it is doing to the way we decide, buy, trust and think. Interactive data, sourced and updated for 2026.
              </p>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 30 }}>
                <a href={`/research/${featured.slug}`} style={{ background: C.gold, color: C.plumDark, fontWeight: 800, fontSize: 15, textDecoration: 'none', borderRadius: 999, padding: '14px 24px' }}>Read the latest paper</a>
                <a href="/research/study" style={{ border: '1px solid rgba(255,255,255,.35)', color: '#fff', fontWeight: 700, fontSize: 15, textDecoration: 'none', borderRadius: 999, padding: '14px 24px', background: 'rgba(255,255,255,.05)' }}>Join the live study</a>
              </div>
              <div className="r-hero-meta" style={{ display: 'flex', gap: '10px 26px', marginTop: 30, flexWrap: 'wrap', fontSize: 13.5, color: 'rgba(255,255,255,.6)' }}>
                <span><strong style={{ color: '#fff' }}>{POSTS.length}</strong> papers</span>
                <span><strong style={{ color: '#fff' }}>{Object.keys(DATA).length}</strong> with 2026 data</span>
                <span><strong style={{ color: '#fff' }}>{POSTS.reduce((n, p) => n + (parseInt(p.readTime, 10) || 0), 0)}</strong> minutes of reading</span>
              </div>
            </div>
            <aside className="r-hero-author" style={{ width: 240, textAlign: 'center', flexShrink: 0, background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.16)', backdropFilter: 'blur(10px)', borderRadius: 22, padding: '26px 20px' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={AUTHOR_IMG} alt="Indrodip Ghosh" style={{ width: 120, height: 120, borderRadius: '50%', objectFit: 'cover', margin: '0 auto', display: 'block', border: '1px solid rgba(255,255,255,.3)', boxShadow: '0 0 0 5px rgba(201,168,76,.2), 0 0 50px rgba(201,168,76,.25)' }} />
              <div style={{ fontFamily: SERIF, fontSize: 20, marginTop: 16 }}>Indrodip Ghosh</div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,.75)', marginTop: 5, lineHeight: 1.45 }}>Consumer Psychologist &amp; Independent AI Researcher</div>
              <div style={{ height: 1, width: 40, background: C.gold, margin: '12px auto' }} />
              <div style={{ fontSize: 12.5, color: C.gold, lineHeight: 1.5 }}>{AUTHOR_DEGREE}</div>
            </aside>
          </div>
        </div>
        {/* Ticker */}
        <div style={{ position: 'relative', borderTop: '1px solid rgba(255,255,255,.1)', background: 'rgba(0,0,0,.25)', overflow: 'hidden' }}>
          <div className="r-ticker" style={{ display: 'flex', gap: 48, whiteSpace: 'nowrap', padding: '14px 0', width: 'max-content', fontSize: 13.5, color: 'rgba(255,255,255,.78)' }}>
            {[...TICK, ...TICK].map((t, i) => <span key={i}><span style={{ color: C.gold, marginRight: 10 }}>◆</span>{t}</span>)}
          </div>
        </div>
      </section>

      {/* Featured */}
      {featured && (
        <section style={{ maxWidth: MAXW, margin: '0 auto', padding: `clamp(20px,3vw,32px) ${PADX} 0` }}>
          <a href={`/research/${featured.slug}`} className="r-feat" style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0, textDecoration: 'none', color: 'inherit',
            border: `1px solid ${C.border}`, borderRadius: 20, overflow: 'hidden', background: C.white,
          }}>
            <div className="r-feat-art" style={{ minHeight: 340 }}><HeroArt slug={featured.slug} height="100%" /></div>
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

      {/* 2026 data strip */}
      <section style={{ maxWidth: MAXW, margin: '0 auto', padding: `clamp(40px,5vw,64px) ${PADX} 0` }}>
        <div style={{ background: C.plumDark, borderRadius: 20, borderTop: `2px solid ${C.gold}`, padding: 'clamp(24px,4vw,40px)', color: '#fff' }}>
          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '.2em', textTransform: 'uppercase', color: C.gold, marginBottom: 14 }}>New in 2026</div>
          <h2 style={{ fontFamily: SERIF, fontSize: 'clamp(22px,3vw,30px)', lineHeight: 1.18, margin: '0 0 22px', fontWeight: 400 }}>Every essay now carries a sourced 2026 data update.</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
            {[
              ['76,977', 'people in the largest AI persuasion experiments yet (Science, Dec 2025)'],
              ['~7 months', 'doubling time of the task length AI can finish alone (METR, Jan 2026)'],
              ['49%', 'of US adults now use AI chatbots (Pew, Feb 2026 survey)'],
              ['71%', 'of B2B software buyers research with AI chatbots (G2, Mar 2026)'],
            ].map(([n, l]) => (
              <div key={n} style={{ background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.14)', borderRadius: 14, padding: '16px 18px' }}>
                <div style={{ fontFamily: SERIF, fontSize: 32, color: C.gold, lineHeight: 1 }}>{n}</div>
                <div style={{ fontSize: 13.5, lineHeight: 1.5, color: 'rgba(255,255,255,.82)', marginTop: 8 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Browse */}
      <section style={{ maxWidth: MAXW, margin: '0 auto', padding: `clamp(44px,6vw,76px) ${PADX} 0` }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 18 }}>
          <h2 style={{ fontSize: 12, letterSpacing: '.24em', textTransform: 'uppercase', color: C.muted, fontWeight: 600, margin: 0 }}>All research</h2>
          <span style={{ fontSize: 12.5, color: C.muted }}>{POSTS.length} essays</span>
        </div>
        <Browser posts={POSTS} fresh={fresh} />
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
        .r-orbit{animation:r-spin 90s linear infinite}
        .r-ticker{animation:r-tick 60s linear infinite}
        .r-pulse{animation:r-pulse 2s ease-in-out infinite}
        @keyframes r-spin{to{transform:rotate(360deg)}}
        @keyframes r-tick{to{transform:translateX(-50%)}}
        @keyframes r-pulse{0%,100%{box-shadow:0 0 0 0 rgba(201,168,76,.6)}50%{box-shadow:0 0 0 7px rgba(201,168,76,0)}}
        @media(prefers-reduced-motion:reduce){.r-orbit,.r-ticker,.r-pulse{animation:none}}
        .r-feat{transition:border-color .2s ease, box-shadow .3s ease}
        .r-feat:hover{border-color:rgba(201,168,76,.55);box-shadow:0 40px 90px -60px rgba(46,26,53,.5)}
        .r-feat:hover .r-feat-art :is(div,svg){filter:saturate(1.05)}
        .r-study{transition:border-color .18s ease, background .18s ease}
        .r-study:hover{border-color:rgba(201,168,76,.55)}
        .r-study:hover .r-study-cta{color:${C.goldDeep}}
        .r-card{transition:border-color .2s ease, transform .2s ease, box-shadow .3s ease}
        .r-card:hover{border-color:rgba(201,168,76,.6);transform:translateY(-3px);box-shadow:0 30px 60px -40px rgba(46,26,53,.5)}
        .r-row{transition:background .18s ease}
        .r-row:hover{background:rgba(201,168,76,.05)}
        .r-row:hover .r-row-title{color:${C.goldDeep}}
        .r-row:hover .r-row-cta{opacity:1}
        @media(max-width:820px){
          .r-hero{grid-template-columns:minmax(0,1fr)!important}.r-hero>*{min-width:0}
          .r-hero-author{width:100%!important;display:flex;align-items:center;gap:16px;text-align:left!important;padding:16px!important}
          .r-hero-author img{width:72px!important;height:72px!important;margin:0!important}
          .r-hero-author > div:nth-child(4){display:none}
          .r-feat{grid-template-columns:minmax(0,1fr)!important}
          .r-feat-art{min-height:220px!important}
          .r-row{grid-template-columns:minmax(0,1fr)!important;gap:14px!important}
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
