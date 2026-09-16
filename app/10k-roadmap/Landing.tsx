'use client'
/* The $10K Roadmap — landing page.
   Deliberately SHORT. One clear promise, one mechanism, tight proof, a fast
   qualify. Modelled on the /quiz feel: crisp, high-authority, momentum toward a
   single CTA. Every section earns its scroll. Light, premium, mobile-first. */
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { LANDING, LEGAL, RATING, PRESS, T } from './config'
import { Fonts, Header, Footer, Btn, Reveal, useUtm } from './ui'
import Vsl from './Vsl'
import { track } from './track'
import { VIDEO_REVIEWS } from '@/components/VideoWall'
import { CASE_STUDIES } from '@/lib/case-studies'

const MAXW = 1120
const PADX = 'clamp(20px,5vw,22px)'
const SECY = 'clamp(40px,7.5vw,62px)'
const HERO_AVATARS = ['/clients/toril.jpg', '/clients/laurie.jpg', '/clients/jeanne.jpg', '/clients/angela.jpg', '/clients/hayley.jpg']
const FEATURED_CASES = CASE_STUDIES.filter((s) => s.image)
const FEATURED_VIDEOS = VIDEO_REVIEWS

function Stars() {
  return <span style={{ display: 'inline-flex', gap: 2 }} aria-hidden>{Array.from({ length: 5 }).map((_, i) => <svg key={i} width="17" height="17" viewBox="0 0 24 24" fill={T.accent}><path d="M12 2l2.9 6.3 6.9.8-5.1 4.7 1.4 6.8L12 17.8 5.9 20.6l1.4-6.8L2.2 9.1l6.9-.8z" /></svg>)}</span>
}
function AvatarCluster() {
  return <div style={{ display: 'flex', alignItems: 'center' }} aria-hidden>{HERO_AVATARS.map((src, i) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img key={src} src={src} alt="" style={{ width: 34, height: 34, borderRadius: '50%', objectFit: 'cover', border: '2px solid #fff', marginLeft: i === 0 ? 0 : -10, boxShadow: '0 2px 8px -2px rgba(46,26,53,.4)' }} />
  ))}</div>
}
function RatingRow() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
      <AvatarCluster />
      <div style={{ textAlign: 'left' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Stars /><span style={{ fontWeight: 800, fontSize: 15 }}>{RATING.score}</span></div>
        <span style={{ color: T.text2, fontSize: 13 }}>{RATING.text}</span>
      </div>
    </div>
  )
}
/* Inline price flourish shown inside the CTA buttons: the $27 deposit struck
   through, waived to $0 today. `onDark` = purple/plum buttons (white text). */
function CtaPrice({ onDark }: { onDark?: boolean }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'baseline', gap: 6, marginLeft: 9, paddingLeft: 11, borderLeft: `1px solid ${onDark ? 'rgba(255,255,255,.3)' : T.line}` }}>
      <span style={{ textDecoration: 'line-through', textDecorationThickness: '1.5px', color: onDark ? 'rgba(255,255,255,.62)' : T.text3, fontWeight: 600, fontSize: '.9em' }}>$27</span>
      <span style={{ color: onDark ? '#E4C879' : T.accentInk, fontWeight: 800 }}>$0 today</span>
    </span>
  )
}
/* Click-to-load video facade. Third-party embeds (Wistia / Facebook) ship
   heavy JS, so mounting 24 of them on load tanks LCP/TBT. We render a cheap
   poster + play button and only create the real iframe on click. */
function VideoFacade({ v, index }: { v: { src: string; w: number; h: number }; index: number }) {
  const [play, setPlay] = useState(false)
  const src = v.src + (v.src.includes('wistia') ? '&autoPlay=true' : '&autoplay=1')
  return (
    <figure className="vid-card" style={{ margin: '0 0 16px', background: '#231029', borderRadius: 14, overflow: 'hidden', border: `1px solid ${T.line}`, boxShadow: '0 14px 40px -30px rgba(46,26,53,.6)' }}>
      <div style={{ position: 'relative', width: '100%', aspectRatio: `${v.w} / ${v.h}` }}>
        {play ? (
          <iframe src={src} title={`Client review ${index + 1}`} allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share" allowFullScreen style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none' }} />
        ) : (
          <button onClick={() => setPlay(true)} aria-label={`Play client review ${index + 1}`} className="rm-focus vid-poster"
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'radial-gradient(120% 90% at 50% 30%, #3a1f45, #231029)' }}>
            <span className="vid-play" style={{ width: 62, height: 62, borderRadius: '50%', background: T.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 12px 30px -8px rgba(94,46,134,.7)', transition: 'transform .18s ease' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="#fff" style={{ marginLeft: 3 }}><path d="M8 5v14l11-7z" /></svg>
            </span>
          </button>
        )}
      </div>
    </figure>
  )
}
function SectionHead({ eyebrow, heading, sub, maxW }: { eyebrow?: string; heading: string; sub?: string; maxW?: number }) {
  return (
    <div style={{ textAlign: 'center', marginBottom: 34, maxWidth: maxW || 760, marginLeft: 'auto', marginRight: 'auto' }}>
      {eyebrow && <div className="rm-eyebrow" style={{ marginBottom: 14 }}>{eyebrow}</div>}
      <h2 className="rm-serif" style={{ fontSize: 'clamp(26px,4.4vw,42px)', margin: 0, fontWeight: 800, lineHeight: 1.08 }}>{heading}</h2>
      {sub && <p style={{ color: T.text2, fontSize: 17, lineHeight: 1.6, marginTop: 14 }}>{sub}</p>}
    </div>
  )
}

export default function Landing({ videoUrl }: { videoUrl: string }) {
  const router = useRouter()
  const [showSticky, setShowSticky] = useState(false)
  useUtm()
  useEffect(() => { track('page_view') }, [])
  useEffect(() => { const on = () => setShowSticky(window.scrollY > 620); on(); window.addEventListener('scroll', on, { passive: true }); return () => window.removeEventListener('scroll', on) }, [])
  const go = (where: string) => { track('cta_click', { where }); router.push('/10k-roadmap/qualify') }
  const CTA = (where: string, label?: string) => <Btn onClick={() => go(where)} style={{ padding: '16px 34px', fontSize: 17, flexWrap: 'wrap' }}>{label || LANDING.ctaPrimary}<CtaPrice onDark /> <span aria-hidden>→</span></Btn>

  return (
    <div style={{ background: T.bg, color: T.text, fontFamily: T.sans, overflowX: 'hidden' }}>
      <Fonts />
      <Header nav={LANDING.nav} />

      {/* ── Hero ── */}
      <div style={{ background: 'radial-gradient(110% 60% at 50% -6%, #FBF6EF 0%, #ffffff 62%)' }}>
        <section style={{ maxWidth: MAXW, margin: '0 auto', padding: 'clamp(26px,5vw,46px) ' + PADX + ' 18px', textAlign: 'center' }}>
          <Reveal>
            <div className="rm-eyebrow" style={{ marginBottom: 16 }}>{LANDING.eyebrow}</div>
            <h1 className="rm-serif" style={{ fontSize: 'clamp(31px,6vw,58px)', margin: '0 auto', maxWidth: 940, fontWeight: 800, lineHeight: 1.05 }}>{LANDING.headline}</h1>
            <p style={{ color: T.text2, fontSize: 'clamp(16px,2.1vw,21px)', lineHeight: 1.5, maxWidth: 640, margin: '18px auto 0', fontWeight: 500 }}>{LANDING.headlineSub}</p>
          </Reveal>
          <Reveal delay={100} style={{ marginTop: 30, maxWidth: 920, marginLeft: 'auto', marginRight: 'auto' }}><Vsl url={videoUrl} /></Reveal>
          <Reveal delay={160} style={{ marginTop: 24 }}>
            {CTA('hero')}
            <p style={{ color: T.text3, fontSize: 12.5, marginTop: 13 }}>{LANDING.ctaMicro}</p>
            <div style={{ marginTop: 18 }}><RatingRow /></div>
          </Reveal>
        </section>
      </div>

      {/* ── Press strip ── */}
      <section style={{ background: T.surface, borderTop: `1px solid ${T.line}`, borderBottom: `1px solid ${T.line}`, marginTop: 34 }}>
        <div style={{ maxWidth: MAXW, margin: '0 auto', padding: 'clamp(20px,3.4vw,26px) ' + PADX, textAlign: 'center' }}>
          <div style={{ fontSize: 11.5, letterSpacing: '.16em', textTransform: 'uppercase', color: T.text3, fontWeight: 700, marginBottom: 14 }}>{PRESS.label}</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'clamp(16px,4vw,38px)', justifyContent: 'center', alignItems: 'center' }}>
            {PRESS.items.map((p) => <span key={p} style={{ fontFamily: T.serif, fontSize: 'clamp(15px,2.4vw,19px)', color: T.text, opacity: 0.6, fontWeight: 700, whiteSpace: 'nowrap' }}>{p}</span>)}
          </div>
        </div>
      </section>

      {/* ── The 10K Roadmap: 6-area mechanism ── */}
      <section id="how" style={{ padding: SECY + ' ' + PADX }}>
        <div style={{ maxWidth: MAXW, margin: '0 auto' }}>
          <Reveal><SectionHead eyebrow={LANDING.roadmap.eyebrow} heading={LANDING.roadmap.heading} sub={LANDING.roadmap.sub} maxW={720} /></Reveal>
          <Reveal>
            <div className="rm-grid3" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 16 }}>
              {LANDING.roadmap.steps.map((s) => (
                <div key={s.n} style={{ background: '#fff', border: `1px solid ${T.line}`, borderRadius: 18, padding: '24px 22px', boxShadow: '0 16px 44px -34px rgba(46,26,53,.5)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                    <span style={{ width: 40, height: 40, borderRadius: 12, background: 'linear-gradient(180deg,#6b39a0,#552879)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 14, flexShrink: 0 }}>{s.n}</span>
                    <h3 className="rm-serif" style={{ fontSize: 19, fontWeight: 800, margin: 0 }}>{s.t}</h3>
                  </div>
                  <p style={{ color: T.text2, fontSize: 14.5, lineHeight: 1.6, margin: 0 }}>{s.d}</p>
                </div>
              ))}
            </div>
          </Reveal>
          <Reveal style={{ textAlign: 'center', marginTop: 34 }}>
            <p className="rm-serif" style={{ fontSize: 'clamp(22px,3.4vw,30px)', fontWeight: 800, margin: 0 }}>{LANDING.roadmap.close}<span className="rm-mark">{LANDING.roadmap.closeEmphasis}</span></p>
          </Reveal>
        </div>
      </section>

      {/* ── Proof: stats band + video + case studies + CTA ── */}
      <section id="proof" style={{ background: T.brand, color: '#fff', padding: 'clamp(40px,6vw,56px) ' + PADX }}>
        <div style={{ maxWidth: MAXW, margin: '0 auto', textAlign: 'center' }}>
          <Reveal>
            <h2 className="rm-serif" style={{ fontSize: 'clamp(24px,4vw,38px)', margin: '0 0 26px', fontWeight: 800, color: '#fff' }}>{LANDING.results.heading}</h2>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              {LANDING.results.stats.map((st) => (
                <div key={st} style={{ background: 'rgba(255,255,255,.08)', border: '1px solid rgba(201,168,76,.4)', borderRadius: 14, padding: '16px 22px' }}>
                  <span className="rm-serif" style={{ fontSize: 'clamp(18px,2.4vw,24px)', fontWeight: 800, color: '#E4C879' }}>{st}</span>
                </div>
              ))}
            </div>
            <p style={{ color: 'rgba(255,255,255,.4)', fontSize: 11.5, marginTop: 16 }}>{LANDING.results.disclaimer}</p>
          </Reveal>
        </div>
      </section>

      <section style={{ padding: SECY + ' ' + PADX }}>
        <div style={{ maxWidth: MAXW, margin: '0 auto' }}>
          <Reveal><SectionHead heading={LANDING.proof.heading} sub={LANDING.proof.sub} /></Reveal>
          <Reveal>
            <div className="vid-grid" style={{ marginBottom: 4 }}>
              {FEATURED_VIDEOS.map((v, k) => <VideoFacade key={k} v={v} index={k} />)}
            </div>
          </Reveal>
          <Reveal>
            <div className="cs-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 16 }}>
              {FEATURED_CASES.map((s) => (
                <figure key={s.slug} className="cs-card" style={{ margin: 0, background: '#fff', border: `1px solid ${T.line}`, borderRadius: 18, padding: 22, display: 'flex', flexDirection: 'column', gap: 14, boxShadow: '0 20px 50px -34px rgba(46,26,53,.5)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 13 }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={s.image} alt={s.name} loading="lazy" decoding="async" width={54} height={54} style={{ width: 54, height: 54, borderRadius: '50%', objectFit: 'cover', border: `2px solid ${T.surface}`, boxShadow: '0 4px 12px -4px rgba(46,26,53,.4)' }} />
                    <div><div style={{ fontWeight: 700, fontSize: 15.5 }}>{s.name}</div><div style={{ color: T.text3, fontSize: 12.5, lineHeight: 1.35 }}>{s.niche}</div><div style={{ color: T.text3, fontSize: 11.5 }}>{s.location}</div></div>
                  </div>
                  <div style={{ borderTop: `1px solid ${T.line}`, paddingTop: 14 }}><div className="rm-serif" style={{ color: T.accentInk, fontSize: 28, fontWeight: 800, lineHeight: 1 }}>{s.headline.v}</div><div style={{ color: T.text2, fontSize: 12.5, marginTop: 5, fontWeight: 600 }}>{s.headline.period}</div></div>
                  <p className="cs-tag" style={{ color: T.text2, fontSize: 13.5, lineHeight: 1.5, margin: 0 }}>{s.tagline}</p>
                </figure>
              ))}
            </div>
          </Reveal>
          <p style={{ color: T.text3, fontSize: 11.5, textAlign: 'center', marginTop: 22, maxWidth: 640, marginLeft: 'auto', marginRight: 'auto', lineHeight: 1.6 }}>{LANDING.proof.disclaimer}</p>
          <div style={{ textAlign: 'center', marginTop: 30 }}>
            <p className="rm-serif" style={{ fontSize: 'clamp(20px,3vw,26px)', margin: '0 0 24px' }}>{LANDING.afterProof.big} <span className="rm-mark">{LANDING.afterProof.line}</span></p>
            {CTA('after-proof')}
          </div>
        </div>
      </section>

      {/* ── For you / not for you ── */}
      <section style={{ background: T.surface, borderTop: `1px solid ${T.line}`, borderBottom: `1px solid ${T.line}`, padding: SECY + ' ' + PADX }}>
        <div style={{ maxWidth: MAXW, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 16 }}>
            <Reveal>
              <div style={{ background: '#fff', border: `1px solid ${T.line}`, borderRadius: 18, padding: 'clamp(24px,5vw,30px)', height: '100%' }}>
                <h3 className="rm-serif" style={{ fontSize: 23, margin: '0 0 16px', fontWeight: 800 }}>{LANDING.forYou.heading}</h3>
                {LANDING.forYou.yes.map((y) => (
                  <div key={y} style={{ display: 'flex', gap: 11, alignItems: 'flex-start', marginBottom: 12 }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={T.accentInk} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" style={{ marginTop: 2, flexShrink: 0 }}><polyline points="20 6 9 17 4 12" /></svg>
                    <span style={{ fontSize: 15, lineHeight: 1.45 }}>{y}</span>
                  </div>
                ))}
              </div>
            </Reveal>
            <Reveal delay={80}>
              <div style={{ background: '#fff', border: `1px solid ${T.line}`, borderRadius: 18, padding: 'clamp(24px,5vw,30px)', height: '100%' }}>
                <h3 className="rm-serif" style={{ fontSize: 23, margin: '0 0 16px', color: T.text2, fontWeight: 800 }}>{LANDING.forYou.notHeading}</h3>
                {LANDING.forYou.no.map((n) => (
                  <div key={n} style={{ display: 'flex', gap: 11, alignItems: 'flex-start', marginBottom: 12 }}>
                    <span style={{ color: T.danger, marginTop: 1, flexShrink: 0, fontWeight: 800 }}>✕</span>
                    <span style={{ color: T.text2, fontSize: 15, lineHeight: 1.45 }}>{n}</span>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
          <p className="rm-serif" style={{ textAlign: 'center', fontSize: 'clamp(19px,2.6vw,24px)', fontWeight: 800, marginTop: 26 }}>{LANDING.forYou.close}</p>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" style={{ maxWidth: 720, margin: '0 auto', padding: SECY + ' ' + PADX }}>
        <Reveal>
          <div style={{ display: 'grid', gap: 10 }}>
            {LANDING.faq.map((f) => (
              <details key={f.q} style={{ background: '#fff', border: `1px solid ${T.line}`, borderRadius: 14, padding: '16px 20px' }}>
                <summary style={{ cursor: 'pointer', fontSize: 16.5, fontWeight: 700, listStyle: 'none' }}>{f.q}</summary>
                <p style={{ color: T.text2, fontSize: 14.5, lineHeight: 1.6, margin: '10px 0 0' }}>{f.a}</p>
              </details>
            ))}
          </div>
        </Reveal>
      </section>

      {/* ── Final CTA ── */}
      <section style={{ background: T.brand, color: '#fff', padding: 'clamp(48px,8vw,72px) ' + PADX, textAlign: 'center' }}>
        <Reveal>
          <h2 className="rm-serif" style={{ fontSize: 'clamp(26px,4.6vw,44px)', margin: '0 auto 16px', maxWidth: 720, color: '#fff', fontWeight: 800, lineHeight: 1.08 }}>{LANDING.finalCta.heading}</h2>
          {LANDING.finalCta.lines.map((l) => <p key={l} style={{ color: 'rgba(255,255,255,.8)', fontSize: 'clamp(15.5px,2vw,18px)', margin: '0 0 4px' }}>{l}</p>)}
          <p className="rm-serif" style={{ fontSize: 'clamp(20px,3vw,28px)', color: '#fff', fontWeight: 800, margin: '26px auto 30px', maxWidth: 700, lineHeight: 1.15 }}>{LANDING.finalCta.big}</p>
          <Btn onClick={() => go('final')} variant="ghost" style={{ padding: '16px 38px', fontSize: 17.5, flexWrap: 'wrap' }}>{LANDING.finalCta.cta}<CtaPrice /> <span aria-hidden>→</span></Btn>
          <p style={{ color: 'rgba(255,255,255,.55)', fontSize: 12.5, marginTop: 14 }}>{LANDING.finalCta.micro}</p>
        </Reveal>
      </section>

      <Footer legal={LEGAL} />

      {/* Sticky mobile CTA */}
      <div className="rm-sticky-cta" style={{ position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 60, padding: '10px 14px calc(10px + env(safe-area-inset-bottom))', background: 'rgba(255,255,255,.92)', backdropFilter: 'saturate(140%) blur(12px)', borderTop: `1px solid ${T.line}`, transform: showSticky ? 'translateY(0)' : 'translateY(120%)', transition: 'transform .3s cubic-bezier(.2,.7,.2,1)', boxShadow: '0 -8px 30px -20px rgba(46,26,53,.5)' }}>
        <button onClick={() => go('sticky')} className="rm-focus" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', gap: 4, background: 'linear-gradient(180deg,#6b39a0,#552879)', color: '#fff', border: 'none', borderRadius: 999, padding: '15px 20px', fontSize: 16, fontWeight: 700, cursor: 'pointer', fontFamily: T.sans }}>{LANDING.ctaPrimary}<CtaPrice onDark /> <span aria-hidden>→</span></button>
      </div>

      <style>{`
        .cs-card{transition:transform .22s cubic-bezier(.2,.7,.2,1), box-shadow .22s ease}
        .cs-card:hover{transform:translateY(-4px);box-shadow:0 30px 64px -34px rgba(46,26,53,.55)}
        .cs-tag{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
        .rm-sticky-cta{display:none}
        .vid-grid{column-count:3;column-gap:16px}
        .vid-card{-webkit-column-break-inside:avoid;break-inside:avoid}
        .vid-poster:hover .vid-play{transform:scale(1.08)}
        @media(max-width:768px){.rm-sticky-cta{display:block}footer{padding-bottom:100px!important}}
        @media(max-width:900px){.vid-grid{column-count:2}}
        @media(max-width:560px){.vid-grid{column-count:1}.cs-grid,.rm-grid3{grid-template-columns:1fr!important}}
      `}</style>
    </div>
  )
}
