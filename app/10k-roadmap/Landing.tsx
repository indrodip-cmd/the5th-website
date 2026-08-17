'use client'
/* The $10K Roadmap Audit — landing page.
   Light, clean, high-authority ($10K+ advisory firm). Direct-response
   hierarchy: promise → risk reversal → VSL → CTA → proof → mechanism →
   qualification → guarantee → FAQ → final CTA. Psychology lives in the copy
   and structure, not a dark interface. The5th brand: plum + gold on white/cream. */
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { LANDING, LEGAL, REAL_PROOF, T } from './config'
import { Fonts, Header, Footer, Btn, Reveal, VideoModal, useUtm } from './ui'
import Vsl from './Vsl'
import { track } from './track'
import { VIDEO_REVIEWS } from '@/components/VideoWall'

const MAXW = 1120

function GuaranteeBadge({ small }: { small?: boolean }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: T.accentSoft, border: `1px solid ${T.accent}`, color: T.accentInk, borderRadius: 999, padding: small ? '7px 14px' : '9px 16px', fontSize: small ? 12.5 : 13.5, fontWeight: 700, letterSpacing: '.01em' }}>
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="M9 12l2 2 4-4" /></svg>
      {LANDING.guaranteeBadge}
    </span>
  )
}

export default function Landing({ videoUrl }: { videoUrl: string }) {
  const router = useRouter()
  const [modal, setModal] = useState<string | null>(null)
  useUtm()
  useEffect(() => { track('page_view') }, [])
  const go = (where: string) => { track('cta_click', { where }); router.push('/10k-roadmap/qualify') }

  return (
    <div style={{ background: T.bg, color: T.text, fontFamily: T.sans, overflowX: 'hidden' }}>
      <Fonts />
      <Header cta={<Btn onClick={() => go('nav')} style={{ padding: '11px 22px', fontSize: 14 }}>{LANDING.ctaPrimary} →</Btn>} />

      {/* ── Hero: promise → guarantee → VSL → CTA ── */}
      <section style={{ maxWidth: MAXW, margin: '0 auto', padding: '48px 22px 24px', textAlign: 'center' }}>
        <Reveal>
          <div className="rm-eyebrow" style={{ marginBottom: 18 }}>{LANDING.eyebrow}</div>
          <h1 className="rm-serif" style={{ fontSize: 'clamp(34px,6.2vw,64px)', margin: '0 auto', maxWidth: 940, fontWeight: 700 }}>
            {LANDING.headlineLead}<span className="rm-mark">{LANDING.headlineEmphasis}</span>
          </h1>
          <p style={{ color: T.text2, fontSize: 'clamp(16px,2vw,20px)', lineHeight: 1.55, maxWidth: 620, margin: '20px auto 0' }}>{LANDING.sub}</p>
          <div style={{ marginTop: 22 }}><GuaranteeBadge /></div>
        </Reveal>

        <Reveal delay={120} style={{ marginTop: 34, maxWidth: 920, marginLeft: 'auto', marginRight: 'auto' }}>
          <Vsl url={videoUrl} />
        </Reveal>

        <Reveal delay={200} style={{ marginTop: 28 }}>
          <Btn onClick={() => go('hero')} style={{ padding: '18px 42px', fontSize: 17 }}>{LANDING.ctaPrimary} →</Btn>
          <p style={{ color: T.text3, fontSize: 13, marginTop: 13 }}>{LANDING.ctaMicro}</p>
        </Reveal>
      </section>

      {/* ── Recognition → tension ── */}
      <section style={{ background: T.surface, borderTop: `1px solid ${T.line}`, borderBottom: `1px solid ${T.line}`, marginTop: 40 }}>
        <div style={{ maxWidth: 760, margin: '0 auto', padding: '72px 22px', textAlign: 'center' }}>
          <Reveal>
            {LANDING.recognition.lines.map((l, k) => (
              <p key={k} className="rm-serif" style={{ fontSize: 'clamp(22px,3.4vw,30px)', color: k === 0 ? T.text : T.text2, margin: '0 0 10px', fontWeight: 400 }}>{l}</p>
            ))}
            <div style={{ height: 30 }} />
            <p className="rm-serif" style={{ fontSize: 'clamp(24px,3.6vw,34px)', margin: '0 0 6px' }}>{LANDING.recognition.turn}</p>
            <p className="rm-serif" style={{ fontSize: 'clamp(24px,3.6vw,34px)', margin: 0 }}>{LANDING.recognition.turn2}<span className="rm-mark">{LANDING.recognition.turn2Emphasis}</span></p>
          </Reveal>
        </div>
      </section>

      {/* ── Mechanism chain ── */}
      <section id="how" style={{ maxWidth: MAXW, margin: '0 auto', padding: '80px 22px' }}>
        <Reveal style={{ textAlign: 'center', marginBottom: 40 }}>
          <h2 className="rm-serif" style={{ fontSize: 'clamp(26px,4vw,42px)', margin: '0 auto', maxWidth: 720, fontWeight: 700 }}>{LANDING.mechanism.heading}</h2>
          <p style={{ color: T.text2, fontSize: 17, marginTop: 12 }}>{LANDING.mechanism.sub}</p>
        </Reveal>
        <Reveal>
          <div className="mech-chain" style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center', alignItems: 'stretch' }}>
            {LANDING.mechanism.chain.map((step, k) => (
              <div key={step} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ background: '#fff', border: `1px solid ${T.line}`, borderRadius: 14, padding: '15px 20px', minWidth: 150, textAlign: 'center', boxShadow: '0 10px 30px -24px rgba(46,26,53,.5)' }}>
                  <span style={{ color: T.accentInk, fontSize: 12, fontWeight: 800, letterSpacing: '.05em', display: 'block', marginBottom: 4 }}>{String(k + 1).padStart(2, '0')}</span>
                  <span style={{ fontSize: 15, fontWeight: 600 }}>{step}</span>
                </div>
                {k < LANDING.mechanism.chain.length - 1 && <span className="mech-arrow" style={{ color: T.accentInk, fontSize: 18, fontWeight: 700 }}>→</span>}
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      {/* ── Proof ── */}
      <section id="proof" style={{ background: T.surface, borderTop: `1px solid ${T.line}`, borderBottom: `1px solid ${T.line}`, padding: '80px 22px' }}>
        <div style={{ maxWidth: MAXW, margin: '0 auto' }}>
          <Reveal style={{ textAlign: 'center', marginBottom: 42 }}>
            <h2 className="rm-serif" style={{ fontSize: 'clamp(28px,4.4vw,46px)', margin: 0, fontWeight: 700 }}>{LANDING.proof.heading}</h2>
            <p style={{ color: T.text2, fontSize: 17, marginTop: 12 }}>{LANDING.proof.sub}</p>
          </Reveal>

          {/* Featured + supporting testimonial videos */}
          <Reveal>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 16, marginBottom: 22 }}>
              {VIDEO_REVIEWS.slice(0, 4).map((v, k) => (
                <button key={k} onClick={() => setModal(v.src)} className="rm-focus rm-vt" aria-label={`Play client story ${k + 1}`}
                  style={{ position: 'relative', border: `1px solid ${T.line}`, borderRadius: 16, overflow: 'hidden', cursor: 'pointer', aspectRatio: '16/10', background: '#fff', padding: 0, boxShadow: '0 14px 40px -28px rgba(46,26,53,.6)' }}>
                  <span style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(180deg,#FBF8F2,#F1E9DC)' }}>
                    <span style={{ width: 54, height: 54, borderRadius: '50%', background: T.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 22px -6px rgba(201,168,76,.7)' }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill={T.brand}><path d="M8 5v14l11-7z" /></svg>
                    </span>
                  </span>
                  <span style={{ position: 'absolute', left: 12, bottom: 10, color: T.text, fontSize: 12.5, fontWeight: 700 }}>Client story</span>
                </button>
              ))}
            </div>
          </Reveal>

          {/* Real case-study cards */}
          <Reveal>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 16 }}>
              {REAL_PROOF.map((p) => (
                <figure key={p.name} style={{ margin: 0, background: '#fff', border: `1px solid ${T.line}`, borderRadius: 16, padding: 22, display: 'flex', flexDirection: 'column', gap: 12, boxShadow: '0 14px 40px -30px rgba(46,26,53,.6)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    {p.photo && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.photo} alt={p.name} style={{ width: 46, height: 46, borderRadius: '50%', objectFit: 'cover', border: `1px solid ${T.line}` }} />
                    )}
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 15 }}>{p.name}</div>
                      <div style={{ color: T.text3, fontSize: 12.5 }}>{p.role}</div>
                    </div>
                  </div>
                  <div className="rm-serif" style={{ color: T.accentInk, fontSize: 21, fontWeight: 700 }}>{p.result}</div>
                  <p style={{ color: T.text2, fontSize: 14, lineHeight: 1.6, margin: 0 }}>{p.quote}</p>
                </figure>
              ))}
            </div>
          </Reveal>
          <p style={{ color: T.text3, fontSize: 11.5, textAlign: 'center', marginTop: 26, maxWidth: 640, marginLeft: 'auto', marginRight: 'auto', lineHeight: 1.6 }}>{LANDING.proof.disclaimer}</p>
        </div>
      </section>

      {/* ── Proof CTA ── */}
      <section style={{ maxWidth: 760, margin: '0 auto', padding: '80px 22px', textAlign: 'center' }}>
        <Reveal>
          <h2 className="rm-serif" style={{ fontSize: 'clamp(26px,4vw,40px)', margin: '0 auto 8px', maxWidth: 640, fontWeight: 700 }}>{LANDING.afterProof.big}</h2>
          <p className="rm-serif" style={{ fontSize: 'clamp(22px,3vw,30px)', margin: '0 0 30px' }}><span className="rm-mark">{LANDING.afterProof.line}</span></p>
          <Btn onClick={() => go('after-proof')} style={{ padding: '18px 42px', fontSize: 17 }}>{LANDING.afterProof.cta} →</Btn>
        </Reveal>
      </section>

      {/* ── Who this is for ── */}
      <section style={{ maxWidth: MAXW, margin: '0 auto', padding: '10px 22px 80px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 20 }}>
          <Reveal>
            <div style={{ background: T.surface, border: `1px solid ${T.line}`, borderRadius: 18, padding: '30px 28px', height: '100%' }}>
              <h3 className="rm-serif" style={{ fontSize: 24, margin: '0 0 20px', fontWeight: 700 }}>{LANDING.forYou.heading}</h3>
              {LANDING.forYou.yes.map((y) => (
                <div key={y} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 13 }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={T.accentInk} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" style={{ marginTop: 2, flexShrink: 0 }}><polyline points="20 6 9 17 4 12" /></svg>
                  <span style={{ color: T.text, fontSize: 15.5, lineHeight: 1.5 }}>{y}</span>
                </div>
              ))}
            </div>
          </Reveal>
          <Reveal delay={100}>
            <div style={{ background: '#fff', border: `1px solid ${T.line}`, borderRadius: 18, padding: '30px 28px', height: '100%' }}>
              <h3 className="rm-serif" style={{ fontSize: 24, margin: '0 0 20px', color: T.text2, fontWeight: 700 }}>{LANDING.forYou.notHeading}</h3>
              {LANDING.forYou.no.map((n) => (
                <div key={n} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 13 }}>
                  <span style={{ color: T.text3, marginTop: 1, flexShrink: 0, fontWeight: 700 }}>✕</span>
                  <span style={{ color: T.text2, fontSize: 15.5, lineHeight: 1.5 }}>{n}</span>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Guarantee (risk reversal) ── */}
      <section style={{ maxWidth: 820, margin: '0 auto', padding: '10px 22px 80px' }}>
        <Reveal>
          <div style={{ background: '#fff', border: `1.5px solid ${T.accent}`, borderRadius: 22, padding: 'clamp(30px,5vw,48px)', textAlign: 'center', boxShadow: '0 30px 80px -50px rgba(201,168,76,.6)' }}>
            <div style={{ marginBottom: 18 }}><GuaranteeBadge /></div>
            <h2 className="rm-serif" style={{ fontSize: 'clamp(26px,4vw,38px)', margin: '0 0 18px', fontWeight: 700 }}>{LANDING.guarantee.heading}</h2>
            <p style={{ color: T.text2, fontSize: 16.5, lineHeight: 1.65, margin: '0 auto 24px', maxWidth: 620 }}>{LANDING.guarantee.intro}</p>
            <div style={{ display: 'grid', gap: 12, textAlign: 'left', maxWidth: 620, margin: '0 auto' }}>
              {LANDING.guarantee.terms.map((t) => (
                <div key={t} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', background: T.surface, borderRadius: 12, padding: '14px 18px' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={T.accentInk} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" style={{ marginTop: 2, flexShrink: 0 }}><polyline points="20 6 9 17 4 12" /></svg>
                  <span style={{ color: T.text, fontSize: 15, lineHeight: 1.6 }}>{t}</span>
                </div>
              ))}
            </div>
            <a href={LANDING.guarantee.policyHref} style={{ display: 'inline-block', marginTop: 22, color: T.accentInk, fontSize: 14, fontWeight: 600, textDecoration: 'underline', textUnderlineOffset: 3 }}>{LANDING.guarantee.policyLabel} →</a>
          </div>
        </Reveal>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" style={{ maxWidth: 760, margin: '0 auto', padding: '10px 22px 80px' }}>
        <Reveal>
          <div style={{ display: 'grid', gap: 12 }}>
            {LANDING.faq.map((f) => (
              <details key={f.q} style={{ background: '#fff', border: `1px solid ${T.line}`, borderRadius: 14, padding: '18px 22px' }}>
                <summary style={{ cursor: 'pointer', fontSize: 17, fontWeight: 600, listStyle: 'none' }}>{f.q}</summary>
                <p style={{ color: T.text2, fontSize: 15, lineHeight: 1.7, margin: '12px 0 0' }}>{f.a}</p>
              </details>
            ))}
          </div>
        </Reveal>
      </section>

      {/* ── Final CTA (brand plum) ── */}
      <section style={{ background: T.brand, color: '#fff', padding: '96px 22px', textAlign: 'center' }}>
        <Reveal>
          <div style={{ marginBottom: 22, display: 'flex', justifyContent: 'center' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(201,168,76,.16)', border: `1px solid ${T.accent}`, color: T.accent, borderRadius: 999, padding: '8px 15px', fontSize: 12.5, fontWeight: 700 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="M9 12l2 2 4-4" /></svg>
              {LANDING.guaranteeBadge}
            </span>
          </div>
          <h2 className="rm-serif" style={{ fontSize: 'clamp(30px,5.4vw,54px)', margin: '0 auto', maxWidth: 780, color: '#fff', fontWeight: 700 }}>{LANDING.finalCta.heading}</h2>
          <p style={{ color: 'rgba(255,255,255,.8)', fontSize: 'clamp(16px,2vw,20px)', margin: '18px auto 34px', maxWidth: 600 }}>{LANDING.finalCta.sub}</p>
          <Btn onClick={() => go('final')} style={{ padding: '19px 48px', fontSize: 18 }}>{LANDING.finalCta.cta} →</Btn>
          <p style={{ color: 'rgba(255,255,255,.55)', fontSize: 13, marginTop: 16 }}>{LANDING.finalCta.micro}</p>
        </Reveal>
      </section>

      <Footer legal={LEGAL} />

      {modal && <VideoModal src={modal} onClose={() => setModal(null)} />}

      <style>{`
        .rm-vt{transition:transform .18s ease, box-shadow .18s ease}
        .rm-vt:hover{transform:translateY(-3px);box-shadow:0 22px 50px -28px rgba(46,26,53,.6)}
        @media(max-width:680px){
          .mech-chain > div{flex-direction:column;gap:8px}
          .mech-arrow{transform:rotate(90deg)}
        }
      `}</style>
    </div>
  )
}
