'use client'
/* The Business Roadmap — INDIA landing page.
   A copy of the parent /10k-roadmap landing, localised to INR for an Indian
   audience. Reuses the shared UI kit, VSL player and tracking from the parent
   funnel; only the copy (./config) is India-specific. The dollar-figure
   case-study cards are dropped (kept: the real testimonial videos). */
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { LANDING, LEGAL, RATING, PRESS, T } from './config'
import { Fonts, Header, Footer, Btn, Reveal, useUtm } from '../ui'
import Vsl from '../Vsl'
import { track } from '../track'
import { VIDEO_REVIEWS } from '@/components/VideoWall'

const MAXW = 1120
const PADX = 'clamp(20px,5vw,22px)'
const SECY = 'clamp(58px,11vw,88px)'
const HERO_AVATARS = ['/clients/toril.jpg', '/clients/laurie.jpg', '/clients/jeanne.jpg', '/clients/angela.jpg', '/clients/hayley.jpg']

function GuaranteeBadge() {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: T.accentSoft, border: `1px solid ${T.accent}`, color: T.accentInk, borderRadius: 999, padding: '8px 15px', fontSize: 13, fontWeight: 700 }}>
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="M9 12l2 2 4-4" /></svg>
      {LANDING.guaranteeBadge}
    </span>
  )
}
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
  const go = (where: string) => { track('cta_click', { where }); router.push('/10k-roadmap/india/qualify') }
  const CTA = (where: string, label?: string) => <Btn onClick={() => go(where)} style={{ padding: '18px 42px', fontSize: 17 }}>{label || LANDING.ctaPrimary} →</Btn>

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
            <div style={{ marginTop: 24, maxWidth: 720, marginLeft: 'auto', marginRight: 'auto' }}>
              <p className="rm-serif" style={{ fontSize: 'clamp(19px,3vw,28px)', lineHeight: 1.22, margin: 0, fontWeight: 700 }}>{LANDING.guaranteeLine}</p>
              <p className="rm-serif" style={{ fontSize: 'clamp(24px,4.4vw,40px)', lineHeight: 1.08, margin: '8px auto 0', fontWeight: 800, color: T.accentInk }}>{LANDING.guaranteeEmphasis}</p>
            </div>
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
        <div style={{ maxWidth: MAXW, margin: '0 auto', padding: 'clamp(24px,4vw,32px) ' + PADX, textAlign: 'center' }}>
          <div style={{ fontSize: 11.5, letterSpacing: '.16em', textTransform: 'uppercase', color: T.text3, fontWeight: 700, marginBottom: 14 }}>{PRESS.label}</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'clamp(16px,4vw,38px)', justifyContent: 'center', alignItems: 'center' }}>
            {PRESS.items.map((p) => <span key={p} style={{ fontFamily: T.serif, fontSize: 'clamp(15px,2.4vw,19px)', color: T.text, opacity: 0.6, fontWeight: 700, whiteSpace: 'nowrap' }}>{p}</span>)}
          </div>
        </div>
      </section>

      {/* ── Recognition ── */}
      <section style={{ maxWidth: 720, margin: '0 auto', padding: SECY + ' ' + PADX, textAlign: 'center' }}>
        <Reveal>
          <h2 className="rm-serif" style={{ fontSize: 'clamp(26px,4.6vw,42px)', margin: '0 0 20px', fontWeight: 800, lineHeight: 1.08 }}>{LANDING.recognition.heading}</h2>
          {LANDING.recognition.lines.map((l, k) => <p key={k} style={{ color: T.text2, fontSize: 'clamp(16px,2.1vw,19px)', lineHeight: 1.6, margin: '0 0 10px' }}>{l}</p>)}
          <div style={{ margin: '22px auto', background: T.surface, border: `1px solid ${T.line}`, borderRadius: 14, padding: '18px 16px', maxWidth: 520 }}>
            <span className="rm-serif" style={{ fontSize: 'clamp(22px,4vw,32px)', fontWeight: 800, color: T.accentInk, letterSpacing: '.01em' }}>{LANDING.recognition.rollercoaster}</span>
          </div>
          <p style={{ color: T.text2, fontSize: 'clamp(15.5px,2vw,18px)', lineHeight: 1.65, margin: '0 auto', maxWidth: 600 }}>{LANDING.recognition.after}</p>
          <p className="rm-serif" style={{ fontSize: 'clamp(26px,4.6vw,40px)', fontWeight: 800, margin: '30px 0 18px' }}>{LANDING.recognition.turn}<span className="rm-mark">{LANDING.recognition.turnEmphasis}</span></p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
            {LANDING.recognition.close.map((c) => <span key={c} style={{ background: '#fff', border: `1px solid ${T.line}`, borderRadius: 999, padding: '10px 20px', fontSize: 15, fontWeight: 700, boxShadow: '0 10px 26px -20px rgba(46,26,53,.5)' }}>{c}</span>)}
          </div>
        </Reveal>
      </section>

      {/* ── The Business Roadmap: 6-area mechanism ── */}
      <section id="how" style={{ background: T.surface, borderTop: `1px solid ${T.line}`, borderBottom: `1px solid ${T.line}`, padding: SECY + ' ' + PADX }}>
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

      {/* ── Stop doing what doesn't work ── */}
      <section style={{ maxWidth: 820, margin: '0 auto', padding: SECY + ' ' + PADX }}>
        <Reveal><SectionHead heading={LANDING.stop.heading} /></Reveal>
        <Reveal>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 10, marginBottom: 30 }}>
            {LANDING.stop.nots.map((n) => (
              <div key={n} style={{ display: 'flex', gap: 11, alignItems: 'center', background: T.surface, borderRadius: 12, padding: '13px 16px' }}>
                <span style={{ color: T.danger, fontWeight: 800, fontSize: 15, flexShrink: 0 }}>✕</span>
                <span style={{ fontSize: 14.5, color: T.text2 }}>{n}</span>
              </div>
            ))}
          </div>
        </Reveal>
        <Reveal>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: 17, fontWeight: 700, marginBottom: 18 }}>{LANDING.stop.lead}</p>
            <div style={{ display: 'grid', gap: 10, maxWidth: 560, margin: '0 auto' }}>
              {LANDING.stop.questions.map((q, i) => (
                <div key={q} style={{ display: 'flex', gap: 12, alignItems: 'center', background: '#fff', border: `1px solid ${T.line}`, borderRadius: 12, padding: '14px 18px', textAlign: 'left' }}>
                  <span style={{ color: T.accentInk, fontFamily: T.serif, fontWeight: 800, fontSize: 16 }}>{i + 1}</span>
                  <span className="rm-serif" style={{ fontSize: 17, fontWeight: 700 }}>{q}</span>
                </div>
              ))}
            </div>
            <p className="rm-serif" style={{ fontSize: 20, fontWeight: 800, marginTop: 22 }}>{LANDING.stop.close}</p>
          </div>
        </Reveal>
      </section>

      {/* ── Results band ── */}
      <section id="proof" style={{ background: T.brand, color: '#fff', padding: SECY + ' ' + PADX }}>
        <div style={{ maxWidth: MAXW, margin: '0 auto', textAlign: 'center' }}>
          <Reveal>
            <h2 className="rm-serif" style={{ fontSize: 'clamp(24px,4vw,38px)', margin: '0 0 10px', fontWeight: 800, color: '#fff' }}>{LANDING.results.heading}</h2>
            <p style={{ color: 'rgba(255,255,255,.78)', fontSize: 16.5, lineHeight: 1.6, maxWidth: 640, margin: '0 auto 30px' }}>{LANDING.results.sub}</p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 26 }}>
              {LANDING.results.stats.map((st) => (
                <div key={st} style={{ background: 'rgba(255,255,255,.08)', border: '1px solid rgba(201,168,76,.4)', borderRadius: 14, padding: '16px 22px' }}>
                  <span className="rm-serif" style={{ fontSize: 'clamp(16px,2.2vw,20px)', fontWeight: 800, color: '#E4C879' }}>{st}</span>
                </div>
              ))}
            </div>
            <p style={{ color: 'rgba(255,255,255,.72)', fontSize: 15, lineHeight: 1.65, maxWidth: 620, margin: '0 auto' }}>{LANDING.results.principle}</p>
            <p style={{ color: 'rgba(255,255,255,.4)', fontSize: 11.5, marginTop: 16 }}>{LANDING.results.disclaimer}</p>
          </Reveal>
        </div>
      </section>

      {/* ── Video proof (real testimonials; no dollar-figure cards) ── */}
      <section style={{ padding: SECY + ' ' + PADX }}>
        <div style={{ maxWidth: MAXW, margin: '0 auto' }}>
          <Reveal><SectionHead heading={LANDING.proof.heading} sub={LANDING.proof.sub} /></Reveal>
          <Reveal>
            <div className="vid-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 16, marginBottom: 20 }}>
              {VIDEO_REVIEWS.slice(0, 6).map((v, k) => (
                <figure key={k} style={{ margin: 0, background: '#000', borderRadius: 14, overflow: 'hidden', border: `1px solid ${T.line}`, boxShadow: '0 14px 40px -30px rgba(46,26,53,.6)' }}>
                  <div style={{ position: 'relative', width: '100%', aspectRatio: `${v.w} / ${v.h}` }}>
                    <iframe src={v.src} title={`Client review ${k + 1}`} loading="lazy" allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share" allowFullScreen style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none' }} />
                  </div>
                </figure>
              ))}
            </div>
          </Reveal>
          <p style={{ color: T.text3, fontSize: 11.5, textAlign: 'center', marginTop: 22, maxWidth: 640, marginLeft: 'auto', marginRight: 'auto', lineHeight: 1.6 }}>{LANDING.proof.disclaimer}</p>
          <div style={{ textAlign: 'center', marginTop: 30 }}>
            <h3 className="rm-serif" style={{ fontSize: 'clamp(22px,3.2vw,30px)', fontWeight: 800, margin: '0 0 6px' }}>{LANDING.afterProof.big}</h3>
            <p className="rm-serif" style={{ fontSize: 'clamp(20px,3vw,26px)', margin: '0 0 24px' }}><span className="rm-mark">{LANDING.afterProof.line}</span></p>
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

      {/* ── How it works ── */}
      <section style={{ maxWidth: 760, margin: '0 auto', padding: SECY + ' ' + PADX }}>
        <Reveal><SectionHead heading={LANDING.how.heading} /></Reveal>
        <div style={{ display: 'grid', gap: 12 }}>
          {LANDING.how.steps.map((s) => (
            <Reveal key={s.n}>
              <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', background: '#fff', border: `1px solid ${T.line}`, borderRadius: 14, padding: '18px 20px' }}>
                <span style={{ width: 38, height: 38, borderRadius: 10, background: T.accentSoft, color: T.accentInk, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 14, flexShrink: 0 }}>{s.n}</span>
                <div><h3 className="rm-serif" style={{ fontSize: 18, fontWeight: 800, margin: '2px 0 5px' }}>{s.t}</h3><p style={{ color: T.text2, fontSize: 14.5, lineHeight: 1.55, margin: 0 }}>{s.d}</p></div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── The diagnosis ── */}
      <section style={{ maxWidth: 720, margin: '0 auto', padding: '0 ' + PADX + ' ' + SECY, textAlign: 'center' }}>
        <Reveal>
          <h2 className="rm-serif" style={{ fontSize: 'clamp(24px,4vw,36px)', margin: '0 0 12px', fontWeight: 800, lineHeight: 1.1 }}>{LANDING.diagnosis.heading}</h2>
          <p className="rm-serif" style={{ fontSize: 'clamp(19px,2.6vw,24px)', margin: '0 0 22px' }}>{LANDING.diagnosis.body.split('The diagnosis is.')[0]}<span className="rm-mark">The diagnosis is.</span></p>
          <div style={{ display: 'grid', gap: 9, maxWidth: 440, margin: '0 auto 22px', textAlign: 'left' }}>
            {LANDING.diagnosis.youLeave.map((y) => (
              <div key={y} style={{ display: 'flex', gap: 11, alignItems: 'center', background: T.surface, borderRadius: 12, padding: '12px 16px' }}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={T.accentInk} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><polyline points="20 6 9 17 4 12" /></svg>
                <span className="rm-serif" style={{ fontSize: 15.5, fontWeight: 700 }}>{y}</span>
              </div>
            ))}
          </div>
          <p style={{ color: T.text2, fontSize: 15.5, lineHeight: 1.6, marginBottom: 26 }}>{LANDING.diagnosis.close}</p>
          {CTA('diagnosis', LANDING.diagnosis.cta)}
        </Reveal>
      </section>

      {/* ── Guarantee ── */}
      <section style={{ maxWidth: 820, margin: '0 auto', padding: '0 ' + PADX + ' ' + SECY }}>
        <Reveal>
          <div style={{ background: '#fff', border: `1.5px solid ${T.accent}`, borderRadius: 22, padding: 'clamp(28px,5vw,46px)', textAlign: 'center', boxShadow: '0 30px 80px -50px rgba(94,46,134,.5)' }}>
            <div style={{ marginBottom: 18, display: 'flex', justifyContent: 'center' }}><GuaranteeBadge /></div>
            <h2 className="rm-serif" style={{ fontSize: 'clamp(24px,4vw,36px)', margin: '0 0 14px', fontWeight: 800, lineHeight: 1.1 }}>{LANDING.guarantee.heading}</h2>
            <p style={{ color: T.text2, fontSize: 16, lineHeight: 1.6, margin: '0 auto 22px', maxWidth: 560 }}>{LANDING.guarantee.body}</p>
            <div style={{ display: 'grid', gap: 10, textAlign: 'left', maxWidth: 460, margin: '0 auto 22px' }}>
              {LANDING.guarantee.terms.map((t) => (
                <div key={t} style={{ display: 'flex', gap: 11, alignItems: 'center', background: T.surface, borderRadius: 12, padding: '12px 16px' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={T.accentInk} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><polyline points="20 6 9 17 4 12" /></svg>
                  <span style={{ fontSize: 15, fontWeight: 600 }}>{t}</span>
                </div>
              ))}
            </div>
            <p style={{ fontSize: 16, fontWeight: 600, margin: '0 0 14px' }}>{LANDING.guarantee.payoff}</p>
            <p className="rm-serif" style={{ fontSize: 'clamp(24px,4.4vw,38px)', fontWeight: 800, margin: '0 0 6px', lineHeight: 1.1 }}>{LANDING.guarantee.big}</p>
            <p className="rm-serif" style={{ fontSize: 'clamp(22px,3.6vw,30px)', fontWeight: 800, margin: '0 0 20px', color: T.accentInk }}>{LANDING.guarantee.cheque}</p>
            {CTA('guarantee')}
            <p style={{ color: T.text3, fontSize: 11.5, lineHeight: 1.6, marginTop: 22, maxWidth: 620, marginLeft: 'auto', marginRight: 'auto' }}>{LANDING.guarantee.fine}</p>
          </div>
        </Reveal>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" style={{ maxWidth: 720, margin: '0 auto', padding: '0 ' + PADX + ' ' + SECY }}>
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
      <section style={{ background: T.brand, color: '#fff', padding: 'clamp(64px,10vw,96px) ' + PADX, textAlign: 'center' }}>
        <Reveal>
          <h2 className="rm-serif" style={{ fontSize: 'clamp(26px,4.6vw,44px)', margin: '0 auto 16px', maxWidth: 720, color: '#fff', fontWeight: 800, lineHeight: 1.08 }}>{LANDING.finalCta.heading}</h2>
          {LANDING.finalCta.lines.map((l) => <p key={l} style={{ color: 'rgba(255,255,255,.8)', fontSize: 'clamp(15.5px,2vw,18px)', margin: '0 0 4px' }}>{l}</p>)}
          <p className="rm-serif" style={{ fontSize: 'clamp(20px,3vw,28px)', color: '#fff', fontWeight: 800, margin: '26px auto 10px', maxWidth: 700, lineHeight: 1.15 }}>{LANDING.finalCta.big}</p>
          <p style={{ color: 'rgba(255,255,255,.82)', fontSize: 'clamp(15px,2vw,18px)', margin: '0 0 4px' }}>{LANDING.finalCta.guarantee}</p>
          <p className="rm-serif" style={{ fontSize: 'clamp(19px,2.8vw,26px)', color: '#E4C879', fontWeight: 800, margin: '0 0 30px' }}>{LANDING.finalCta.cheque}</p>
          <Btn onClick={() => go('final')} variant="ghost" style={{ padding: '18px 44px', fontSize: 17.5 }}>{LANDING.finalCta.cta} →</Btn>
          <p style={{ color: 'rgba(255,255,255,.55)', fontSize: 12.5, marginTop: 14 }}>{LANDING.finalCta.micro}</p>
        </Reveal>
      </section>

      <Footer legal={LEGAL} />

      {/* Sticky mobile CTA */}
      <div className="rm-sticky-cta" style={{ position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 60, padding: '10px 14px calc(10px + env(safe-area-inset-bottom))', background: 'rgba(255,255,255,.92)', backdropFilter: 'saturate(140%) blur(12px)', borderTop: `1px solid ${T.line}`, transform: showSticky ? 'translateY(0)' : 'translateY(120%)', transition: 'transform .3s cubic-bezier(.2,.7,.2,1)', boxShadow: '0 -8px 30px -20px rgba(46,26,53,.5)' }}>
        <button onClick={() => go('sticky')} className="rm-focus" style={{ width: '100%', background: 'linear-gradient(180deg,#6b39a0,#552879)', color: '#fff', border: 'none', borderRadius: 999, padding: '15px 20px', fontSize: 16, fontWeight: 700, cursor: 'pointer', fontFamily: T.sans }}>{LANDING.ctaPrimary} →</button>
      </div>

      <style>{`
        .rm-sticky-cta{display:none}
        @media(max-width:768px){.rm-sticky-cta{display:block}footer{padding-bottom:100px!important}}
        @media(max-width:560px){.vid-grid{grid-template-columns:1fr!important}.rm-grid3{grid-template-columns:1fr!important}}
      `}</style>
    </div>
  )
}
