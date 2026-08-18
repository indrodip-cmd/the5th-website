'use client'
/* The $10K Roadmap Audit, landing page.
   Light, clean, high-authority. Direct-response hierarchy; mobile-first spacing
   via clamp() so nothing feels loose on desktop or cramped on phones. */
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { LANDING, LEGAL, RATING, PRESS, T } from './config'
import { Fonts, Header, Footer, Btn, Reveal, useUtm } from './ui'
import Vsl from './Vsl'
import { track } from './track'
import { VIDEO_REVIEWS } from '@/components/VideoWall'
import { CASE_STUDIES } from '@/lib/case-studies'

// Real client faces for the hero trust cluster (photos already on the site).
const HERO_AVATARS = ['/clients/toril.jpg', '/clients/laurie.jpg', '/clients/jeanne.jpg', '/clients/angela.jpg', '/clients/hayley.jpg']
// Featured case studies (real, from the published library) — those with a photo.
const FEATURED_CASES = CASE_STUDIES.filter((s) => s.image).slice(0, 9)

const MAXW = 1120
const PADX = 'clamp(18px,5vw,22px)'
const SECY = 'clamp(46px,8vw,80px)' // section vertical rhythm

function GuaranteeBadge() {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: T.accentSoft, border: `1px solid ${T.accent}`, color: T.accentInk, borderRadius: 999, padding: '8px 15px', fontSize: 13, fontWeight: 700 }}>
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="M9 12l2 2 4-4" /></svg>
      {LANDING.guaranteeBadge}
    </span>
  )
}

function Stars() {
  return (
    <span style={{ display: 'inline-flex', gap: 2 }} aria-hidden>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} width="17" height="17" viewBox="0 0 24 24" fill={T.accent}><path d="M12 2l2.9 6.3 6.9.8-5.1 4.7 1.4 6.8L12 17.8 5.9 20.6l1.4-6.8L2.2 9.1l6.9-.8z" /></svg>
      ))}
    </span>
  )
}

function AvatarCluster() {
  return (
    <div style={{ display: 'flex', alignItems: 'center' }} aria-hidden>
      {HERO_AVATARS.map((src, i) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img key={src} src={src} alt="" style={{ width: 34, height: 34, borderRadius: '50%', objectFit: 'cover', border: '2px solid #fff', marginLeft: i === 0 ? 0 : -10, boxShadow: '0 2px 8px -2px rgba(46,26,53,.4)' }} />
      ))}
    </div>
  )
}

function RatingRow({ center }: { center?: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, justifyContent: center ? 'center' : 'flex-start', flexWrap: 'wrap' }}>
      <AvatarCluster />
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: center ? 'flex-start' : 'flex-start', gap: 2 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Stars />
          <span style={{ fontWeight: 800, fontSize: 15 }}>{RATING.score}</span>
        </div>
        <span style={{ color: T.text2, fontSize: 13 }}>{RATING.text}</span>
      </div>
    </div>
  )
}

function PressStrip() {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: 11.5, letterSpacing: '.16em', textTransform: 'uppercase', color: T.text3, fontWeight: 700, marginBottom: 14 }}>{PRESS.label}</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'clamp(16px,4vw,38px)', justifyContent: 'center', alignItems: 'center' }}>
        {PRESS.items.map((p) => (
          <span key={p} className="rm-serif" style={{ fontSize: 'clamp(15px,2.4vw,20px)', color: T.text, opacity: 0.62, fontWeight: 600, whiteSpace: 'nowrap' }}>{p}</span>
        ))}
      </div>
    </div>
  )
}

export default function Landing({ videoUrl }: { videoUrl: string }) {
  const router = useRouter()
  const [showSticky, setShowSticky] = useState(false)
  useUtm()
  useEffect(() => { track('page_view') }, [])
  useEffect(() => {
    const on = () => setShowSticky(window.scrollY > 620)
    on(); window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [])
  const go = (where: string) => { track('cta_click', { where }); router.push('/10k-roadmap/qualify') }

  return (
    <div style={{ background: T.bg, color: T.text, fontFamily: T.sans, overflowX: 'hidden' }}>
      <Fonts />
      <Header nav={LANDING.nav} />

      {/* ── Hero ── */}
      <div style={{ background: 'radial-gradient(110% 60% at 50% -6%, #FBF6EF 0%, #ffffff 62%)' }}>
      <section style={{ maxWidth: MAXW, margin: '0 auto', padding: 'clamp(26px,5vw,46px) ' + PADX + ' 18px', textAlign: 'center' }}>
        <Reveal>
          <div className="rm-eyebrow" style={{ marginBottom: 14 }}>{LANDING.eyebrow}</div>
          <h1 className="rm-serif" style={{ fontSize: 'clamp(31px,6.2vw,60px)', margin: '0 auto', maxWidth: 940, fontWeight: 700, lineHeight: 1.04 }}>
            {LANDING.headlineLead}<span className="rm-mark">{LANDING.headlineEmphasis}</span>
          </h1>
          <p style={{ color: T.text2, fontSize: 'clamp(15.5px,2vw,19px)', lineHeight: 1.45, maxWidth: 600, margin: '16px auto 0' }}>{LANDING.sub}</p>
          <div style={{ marginTop: 18, display: 'flex', justifyContent: 'center' }}><GuaranteeBadge /></div>
        </Reveal>

        <Reveal delay={100} style={{ marginTop: 26, maxWidth: 900, marginLeft: 'auto', marginRight: 'auto' }}>
          <Vsl url={videoUrl} />
        </Reveal>

        <Reveal delay={160} style={{ marginTop: 22 }}>
          <Btn onClick={() => go('hero')} style={{ padding: '17px 38px', fontSize: 17 }}>{LANDING.ctaPrimary} →</Btn>
          <p style={{ color: T.text3, fontSize: 12.5, marginTop: 11 }}>{LANDING.ctaMicro}</p>
          <div style={{ marginTop: 16 }}><RatingRow center /></div>
        </Reveal>
      </section>
      </div>

      {/* ── Press strip ── */}
      <section style={{ background: T.surface, borderTop: `1px solid ${T.line}`, borderBottom: `1px solid ${T.line}` }}>
        <div style={{ maxWidth: MAXW, margin: '0 auto', padding: 'clamp(24px,4vw,32px) ' + PADX }}>
          <PressStrip />
        </div>
      </section>

      {/* ── Recognition → tension ── */}
      <section style={{ maxWidth: 720, margin: '0 auto', padding: SECY + ' ' + PADX, textAlign: 'center' }}>
        <Reveal>
          {LANDING.recognition.lines.map((l, k) => (
            <p key={k} className="rm-serif" style={{ fontSize: 'clamp(21px,3.2vw,29px)', color: k === 0 ? T.text : T.text2, margin: '0 0 6px', fontWeight: 500, lineHeight: 1.22 }}>{l}</p>
          ))}
          <div style={{ height: 22 }} />
          <p className="rm-serif" style={{ fontSize: 'clamp(23px,3.4vw,32px)', margin: '0 0 4px', fontWeight: 600 }}>{LANDING.recognition.turn}</p>
          <p className="rm-serif" style={{ fontSize: 'clamp(23px,3.4vw,32px)', margin: 0, fontWeight: 600 }}>{LANDING.recognition.turn2}<span className="rm-mark">{LANDING.recognition.turn2Emphasis}</span></p>
        </Reveal>
      </section>

      {/* ── Mechanism chain ── */}
      <section id="how" style={{ maxWidth: MAXW, margin: '0 auto', padding: '0 ' + PADX + ' ' + SECY }}>
        <Reveal style={{ textAlign: 'center', marginBottom: 30 }}>
          <h2 className="rm-serif" style={{ fontSize: 'clamp(25px,4vw,40px)', margin: '0 auto', maxWidth: 720, fontWeight: 700, lineHeight: 1.1 }}>{LANDING.mechanism.heading}</h2>
          <p style={{ color: T.text2, fontSize: 16, marginTop: 10 }}>{LANDING.mechanism.sub}</p>
        </Reveal>
        <Reveal>
          <div className="mech-chain" style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', alignItems: 'stretch' }}>
            {LANDING.mechanism.chain.map((step, k) => (
              <div key={step} className="mech-item" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ background: '#fff', border: `1px solid ${T.line}`, borderRadius: 12, padding: '13px 16px', minWidth: 132, textAlign: 'center', boxShadow: '0 10px 30px -24px rgba(46,26,53,.5)' }}>
                  <span style={{ color: T.accentInk, fontSize: 11.5, fontWeight: 800, letterSpacing: '.05em', display: 'block', marginBottom: 3 }}>{String(k + 1).padStart(2, '0')}</span>
                  <span style={{ fontSize: 14.5, fontWeight: 600 }}>{step}</span>
                </div>
                {k < LANDING.mechanism.chain.length - 1 && <span className="mech-arrow" style={{ color: T.accentInk, fontSize: 17, fontWeight: 700 }}>→</span>}
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      {/* ── Proof (inline-loading video testimonials) ── */}
      <section id="proof" style={{ background: T.surface, borderTop: `1px solid ${T.line}`, borderBottom: `1px solid ${T.line}`, padding: SECY + ' ' + PADX }}>
        <div style={{ maxWidth: MAXW, margin: '0 auto' }}>
          <Reveal style={{ textAlign: 'center', marginBottom: 30 }}>
            <h2 className="rm-serif" style={{ fontSize: 'clamp(27px,4.4vw,44px)', margin: 0, fontWeight: 700, lineHeight: 1.06 }}>{LANDING.proof.heading}</h2>
            <p style={{ color: T.text2, fontSize: 16, marginTop: 10 }}>{LANDING.proof.sub}</p>
            <div style={{ marginTop: 16, display: 'flex', justifyContent: 'center' }}><RatingRow center /></div>
          </Reveal>

          {/* Real on-camera reviews, embedded so they load in place */}
          <Reveal>
            <div className="vid-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 16, marginBottom: 22 }}>
              {VIDEO_REVIEWS.slice(0, 6).map((v, k) => (
                <figure key={k} style={{ margin: 0, background: '#000', borderRadius: 14, overflow: 'hidden', border: `1px solid ${T.line}`, boxShadow: '0 14px 40px -30px rgba(46,26,53,.6)' }}>
                  <div style={{ position: 'relative', width: '100%', aspectRatio: `${v.w} / ${v.h}` }}>
                    <iframe src={v.src} title={`Client review ${k + 1}`} loading="lazy" allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share" allowFullScreen
                      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none' }} />
                  </div>
                </figure>
              ))}
            </div>
          </Reveal>

          {/* Real case studies from the published library (photos + results) */}
          <Reveal>
            <div className="cs-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 16 }}>
              {FEATURED_CASES.map((s) => (
                <figure key={s.slug} className="cs-card" style={{ margin: 0, background: '#fff', border: `1px solid ${T.line}`, borderRadius: 18, padding: 22, display: 'flex', flexDirection: 'column', gap: 14, boxShadow: '0 20px 50px -34px rgba(46,26,53,.5)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 13 }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={s.image} alt={s.name} loading="lazy" style={{ width: 54, height: 54, borderRadius: '50%', objectFit: 'cover', border: `2px solid ${T.surface}`, boxShadow: '0 4px 12px -4px rgba(46,26,53,.4)' }} />
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 15.5 }}>{s.name}</div>
                      <div style={{ color: T.text3, fontSize: 12.5, lineHeight: 1.35 }}>{s.niche}</div>
                      <div style={{ color: T.text3, fontSize: 11.5 }}>{s.location}</div>
                    </div>
                  </div>
                  <div style={{ borderTop: `1px solid ${T.line}`, paddingTop: 14 }}>
                    <div className="rm-serif" style={{ color: T.accentInk, fontSize: 28, fontWeight: 800, lineHeight: 1 }}>{s.headline.v}</div>
                    <div style={{ color: T.text2, fontSize: 12.5, marginTop: 5, fontWeight: 600 }}>{s.headline.period}</div>
                  </div>
                  <p className="cs-tag" style={{ color: T.text2, fontSize: 13.5, lineHeight: 1.5, margin: 0 }}>{s.tagline}</p>
                </figure>
              ))}
            </div>
          </Reveal>
          <p style={{ color: T.text3, fontSize: 11.5, textAlign: 'center', marginTop: 22, maxWidth: 640, marginLeft: 'auto', marginRight: 'auto', lineHeight: 1.6 }}>{LANDING.proof.disclaimer}</p>
        </div>
      </section>

      {/* ── Proof CTA ── */}
      <section style={{ maxWidth: 720, margin: '0 auto', padding: SECY + ' ' + PADX, textAlign: 'center' }}>
        <Reveal>
          <h2 className="rm-serif" style={{ fontSize: 'clamp(25px,4vw,38px)', margin: '0 auto 6px', maxWidth: 620, fontWeight: 700, lineHeight: 1.1 }}>{LANDING.afterProof.big}</h2>
          <p className="rm-serif" style={{ fontSize: 'clamp(21px,3vw,29px)', margin: '0 0 26px', fontWeight: 600 }}><span className="rm-mark">{LANDING.afterProof.line}</span></p>
          <Btn onClick={() => go('after-proof')} style={{ padding: '17px 38px', fontSize: 17 }}>{LANDING.afterProof.cta} →</Btn>
        </Reveal>
      </section>

      {/* ── Who this is for ── */}
      <section style={{ maxWidth: MAXW, margin: '0 auto', padding: '0 ' + PADX + ' ' + SECY }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 16 }}>
          <Reveal>
            <div style={{ background: T.surface, border: `1px solid ${T.line}`, borderRadius: 18, padding: 'clamp(24px,5vw,30px)', height: '100%' }}>
              <h3 className="rm-serif" style={{ fontSize: 23, margin: '0 0 16px', fontWeight: 700 }}>{LANDING.forYou.heading}</h3>
              {LANDING.forYou.yes.map((y) => (
                <div key={y} style={{ display: 'flex', gap: 11, alignItems: 'flex-start', marginBottom: 11 }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={T.accentInk} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" style={{ marginTop: 2, flexShrink: 0 }}><polyline points="20 6 9 17 4 12" /></svg>
                  <span style={{ color: T.text, fontSize: 15, lineHeight: 1.45 }}>{y}</span>
                </div>
              ))}
            </div>
          </Reveal>
          <Reveal delay={80}>
            <div style={{ background: '#fff', border: `1px solid ${T.line}`, borderRadius: 18, padding: 'clamp(24px,5vw,30px)', height: '100%' }}>
              <h3 className="rm-serif" style={{ fontSize: 23, margin: '0 0 16px', color: T.text2, fontWeight: 700 }}>{LANDING.forYou.notHeading}</h3>
              {LANDING.forYou.no.map((n) => (
                <div key={n} style={{ display: 'flex', gap: 11, alignItems: 'flex-start', marginBottom: 11 }}>
                  <span style={{ color: T.text3, marginTop: 1, flexShrink: 0, fontWeight: 700 }}>✕</span>
                  <span style={{ color: T.text2, fontSize: 15, lineHeight: 1.45 }}>{n}</span>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Guarantee (risk reversal) ── */}
      <section style={{ maxWidth: 820, margin: '0 auto', padding: '0 ' + PADX + ' ' + SECY }}>
        <Reveal>
          <div style={{ background: '#fff', border: `1.5px solid ${T.accent}`, borderRadius: 22, padding: 'clamp(26px,5vw,46px)', textAlign: 'center', boxShadow: '0 30px 80px -50px rgba(94,46,134,.5)' }}>
            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'center' }}><GuaranteeBadge /></div>
            <h2 className="rm-serif" style={{ fontSize: 'clamp(25px,4vw,36px)', margin: '0 0 14px', fontWeight: 700, lineHeight: 1.1 }}>{LANDING.guarantee.heading}</h2>
            <p style={{ color: T.text2, fontSize: 16, lineHeight: 1.55, margin: '0 auto 20px', maxWidth: 600 }}>{LANDING.guarantee.intro}</p>
            <div style={{ display: 'grid', gap: 10, textAlign: 'left', maxWidth: 600, margin: '0 auto' }}>
              {LANDING.guarantee.terms.map((t) => (
                <div key={t} style={{ display: 'flex', gap: 11, alignItems: 'flex-start', background: T.surface, borderRadius: 12, padding: '13px 16px' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={T.accentInk} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" style={{ marginTop: 2, flexShrink: 0 }}><polyline points="20 6 9 17 4 12" /></svg>
                  <span style={{ color: T.text, fontSize: 14.5, lineHeight: 1.55 }}>{t}</span>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" style={{ maxWidth: 720, margin: '0 auto', padding: '0 ' + PADX + ' ' + SECY }}>
        <Reveal>
          <div style={{ display: 'grid', gap: 10 }}>
            {LANDING.faq.map((f) => (
              <details key={f.q} style={{ background: '#fff', border: `1px solid ${T.line}`, borderRadius: 14, padding: '16px 20px' }}>
                <summary style={{ cursor: 'pointer', fontSize: 16.5, fontWeight: 600, listStyle: 'none' }}>{f.q}</summary>
                <p style={{ color: T.text2, fontSize: 14.5, lineHeight: 1.6, margin: '10px 0 0' }}>{f.a}</p>
              </details>
            ))}
          </div>
        </Reveal>
      </section>

      {/* ── Final CTA (brand plum) ── */}
      <section style={{ background: T.brand, color: '#fff', padding: 'clamp(60px,10vw,92px) ' + PADX, textAlign: 'center' }}>
        <Reveal>
          <div style={{ marginBottom: 18, display: 'flex', justifyContent: 'center' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,.12)', border: '1px solid rgba(255,255,255,.32)', color: '#fff', borderRadius: 999, padding: '8px 15px', fontSize: 12.5, fontWeight: 700 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="M9 12l2 2 4-4" /></svg>
              {LANDING.guaranteeBadge}
            </span>
          </div>
          <h2 className="rm-serif" style={{ fontSize: 'clamp(29px,5.4vw,52px)', margin: '0 auto', maxWidth: 780, color: '#fff', fontWeight: 700, lineHeight: 1.06 }}>{LANDING.finalCta.heading}</h2>
          <p style={{ color: 'rgba(255,255,255,.8)', fontSize: 'clamp(15.5px,2vw,19px)', margin: '16px auto 30px', maxWidth: 580, lineHeight: 1.45 }}>{LANDING.finalCta.sub}</p>
          <Btn onClick={() => go('final')} variant="ghost" style={{ padding: '18px 44px', fontSize: 17.5 }}>{LANDING.finalCta.cta} →</Btn>
          <p style={{ color: 'rgba(255,255,255,.55)', fontSize: 12.5, marginTop: 14 }}>{LANDING.finalCta.micro}</p>
        </Reveal>
      </section>

      <Footer legal={LEGAL} />

      {/* Sticky mobile CTA — app-like, appears once past the hero */}
      <div className="rm-sticky-cta" style={{ position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 60, padding: '10px 14px calc(10px + env(safe-area-inset-bottom))', background: 'rgba(255,255,255,.92)', backdropFilter: 'saturate(140%) blur(12px)', borderTop: `1px solid ${T.line}`, transform: showSticky ? 'translateY(0)' : 'translateY(120%)', transition: 'transform .3s cubic-bezier(.2,.7,.2,1)', boxShadow: '0 -8px 30px -20px rgba(46,26,53,.5)' }}>
        <button onClick={() => go('sticky')} className="rm-focus" style={{ width: '100%', background: T.accent, color: '#fff', border: 'none', borderRadius: 999, padding: '15px 20px', fontSize: 16, fontWeight: 700, cursor: 'pointer', fontFamily: T.sans }}>
          {LANDING.ctaPrimary} →
        </button>
      </div>

      <style>{`
        .cs-card{transition:transform .22s cubic-bezier(.2,.7,.2,1), box-shadow .22s ease}
        .cs-card:hover{transform:translateY(-4px);box-shadow:0 30px 64px -34px rgba(46,26,53,.55)}
        .cs-tag{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
        .rm-sticky-cta{display:none}
        @media(max-width:768px){.rm-sticky-cta{display:block}footer{padding-bottom:100px!important}}
        @media(max-width:560px){
          .mech-item{flex-direction:column;gap:6px}
          .mech-item > div{min-width:min(220px,80vw)!important;width:100%}
          .mech-arrow{transform:rotate(90deg)}
          .vid-grid{grid-template-columns:1fr!important}
          .cs-grid{grid-template-columns:1fr!important}
        }
      `}</style>
    </div>
  )
}
