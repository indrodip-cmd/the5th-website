'use client'
/* The $10K Roadmap Audit — landing page.
   Dark, editorial, minimal. One continuous psychological journey:
   recognition → tension → curiosity → trust → qualification. Every section
   earns its place; the CTA repeats but never nags. */
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { LANDING, LEGAL, REAL_PROOF, DEPOSIT, T } from './config'
import { Fonts, Header, Footer, Btn, Reveal, VideoModal, useUtm } from './ui'
import Vsl from './Vsl'
import { track } from './track'
import { VIDEO_REVIEWS } from '@/components/VideoWall'

const MAXW = 1160

export default function Landing({ videoUrl }: { videoUrl: string }) {
  const router = useRouter()
  const [modal, setModal] = useState<string | null>(null)
  useUtm()

  useEffect(() => { track('page_view') }, [])

  const go = (where: string) => { track('cta_click', { where }); router.push('/10k-roadmap/qualify') }

  return (
    <div style={{ background: T.bg, color: T.text, fontFamily: T.sans, overflowX: 'hidden' }}>
      <Fonts />
      <Header cta={<Btn onClick={() => go('nav')} style={{ padding: '11px 22px', fontSize: 14 }}>{LANDING.ctaPrimary}</Btn>} />

      {/* ── Hero + VSL ── */}
      <section style={{ maxWidth: MAXW, margin: '0 auto', padding: '54px 22px 20px', textAlign: 'center' }}>
        <Reveal>
          <div className="rm-eyebrow" style={{ marginBottom: 20 }}>{LANDING.eyebrow}</div>
          <h1 className="rm-serif" style={{ fontSize: 'clamp(34px,6vw,68px)', margin: '0 auto', maxWidth: 900 }}>{LANDING.headline}</h1>
          <p style={{ color: T.text2, fontSize: 'clamp(16px,2vw,20px)', lineHeight: 1.6, maxWidth: 660, margin: '22px auto 0' }}>{LANDING.sub}</p>
        </Reveal>
        <Reveal delay={120} style={{ marginTop: 40, maxWidth: 960, marginLeft: 'auto', marginRight: 'auto' }}>
          <Vsl url={videoUrl} />
        </Reveal>
        <Reveal delay={200} style={{ marginTop: 30 }}>
          <Btn onClick={() => go('hero')} style={{ padding: '18px 40px', fontSize: 17 }}>{LANDING.ctaPrimary}</Btn>
          <p style={{ color: T.text3, fontSize: 13, marginTop: 14 }}>{LANDING.ctaMicro}</p>
        </Reveal>
      </section>

      {/* ── Recognition → tension ── */}
      <section style={{ maxWidth: 760, margin: '0 auto', padding: '70px 22px', textAlign: 'center' }}>
        <Reveal>
          {LANDING.recognition.lines.map((l, k) => (
            <p key={k} className="rm-serif" style={{ fontSize: 'clamp(22px,3.4vw,30px)', color: k === 0 ? T.text : T.text2, margin: '0 0 10px', fontWeight: 400 }}>{l}</p>
          ))}
          <div style={{ height: 34 }} />
          <p className="rm-serif" style={{ fontSize: 'clamp(24px,3.6vw,34px)', margin: '0 0 6px' }}>{LANDING.recognition.turn}</p>
          <p className="rm-serif" style={{ fontSize: 'clamp(24px,3.6vw,34px)', color: T.accent, margin: 0 }}>{LANDING.recognition.turn2}</p>
        </Reveal>
      </section>

      {/* ── Mechanism chain ── */}
      <section id="how" style={{ maxWidth: MAXW, margin: '0 auto', padding: '40px 22px 80px' }}>
        <Reveal style={{ textAlign: 'center', marginBottom: 40 }}>
          <h2 className="rm-serif" style={{ fontSize: 'clamp(26px,4vw,42px)', margin: '0 auto', maxWidth: 720 }}>{LANDING.mechanism.heading}</h2>
          <p style={{ color: T.text2, fontSize: 17, marginTop: 14 }}>{LANDING.mechanism.sub}</p>
        </Reveal>
        <Reveal>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center', alignItems: 'stretch' }}>
            {LANDING.mechanism.chain.map((step, k) => (
              <div key={step} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ background: T.surface, border: `1px solid ${T.line}`, borderRadius: 12, padding: '16px 20px', minWidth: 150, textAlign: 'center' }}>
                  <span style={{ color: T.accent, fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 4 }}>{String(k + 1).padStart(2, '0')}</span>
                  <span style={{ fontSize: 15, fontWeight: 600 }}>{step}</span>
                </div>
                {k < LANDING.mechanism.chain.length - 1 && <span style={{ color: T.text3, fontSize: 18 }}>→</span>}
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      {/* ── Proof ── */}
      <section id="proof" style={{ background: T.surface, borderTop: `1px solid ${T.line}`, borderBottom: `1px solid ${T.line}`, padding: '80px 22px' }}>
        <div style={{ maxWidth: MAXW, margin: '0 auto' }}>
          <Reveal style={{ textAlign: 'center', marginBottom: 44 }}>
            <h2 className="rm-serif" style={{ fontSize: 'clamp(28px,4.4vw,46px)', margin: 0 }}>{LANDING.proof.heading}</h2>
            <p style={{ color: T.text2, fontSize: 17, marginTop: 12 }}>{LANDING.proof.sub}</p>
          </Reveal>

          {/* Video testimonials */}
          <Reveal>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(230px,1fr))', gap: 16, marginBottom: 40 }}>
              {VIDEO_REVIEWS.slice(0, 4).map((v, k) => (
                <button key={k} onClick={() => setModal(v.src)} className="rm-focus rm-vt"
                  aria-label={`Play client story ${k + 1}`}
                  style={{ position: 'relative', border: `1px solid ${T.line}`, borderRadius: 14, overflow: 'hidden', cursor: 'pointer', aspectRatio: '16/10', background: '#0c0c0c', padding: 0 }}>
                  <span style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ width: 54, height: 54, borderRadius: '50%', background: 'rgba(201,168,76,.92)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="#12100a"><path d="M8 5v14l11-7z" /></svg>
                    </span>
                  </span>
                  <span style={{ position: 'absolute', left: 12, bottom: 10, color: '#fff', fontSize: 12.5, fontWeight: 600 }}>Client story</span>
                </button>
              ))}
            </div>
          </Reveal>

          {/* Real case-study cards */}
          <Reveal>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 16 }}>
              {REAL_PROOF.map((p) => (
                <figure key={p.name} style={{ margin: 0, background: T.surface2, border: `1px solid ${T.line}`, borderRadius: 16, padding: 22, display: 'flex', flexDirection: 'column', gap: 12 }}>
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
                  <div className="rm-serif" style={{ color: T.accent, fontSize: 21 }}>{p.result}</div>
                  <p style={{ color: T.text2, fontSize: 14, lineHeight: 1.6, margin: 0 }}>{p.quote}</p>
                </figure>
              ))}
            </div>
          </Reveal>
          <p style={{ color: T.text3, fontSize: 11.5, textAlign: 'center', marginTop: 26, maxWidth: 640, marginLeft: 'auto', marginRight: 'auto', lineHeight: 1.6 }}>{LANDING.proof.disclaimer}</p>
        </div>
      </section>

      {/* ── After proof CTA ── */}
      <section style={{ maxWidth: 760, margin: '0 auto', padding: '80px 22px', textAlign: 'center' }}>
        <Reveal>
          <h2 className="rm-serif" style={{ fontSize: 'clamp(26px,4vw,40px)', margin: '0 auto 8px', maxWidth: 640 }}>{LANDING.afterProof.big}</h2>
          <p className="rm-serif" style={{ fontSize: 'clamp(22px,3vw,30px)', color: T.accent, margin: '0 0 30px' }}>{LANDING.afterProof.line}</p>
          <Btn onClick={() => go('after-proof')} style={{ padding: '18px 40px', fontSize: 17 }}>{LANDING.afterProof.cta}</Btn>
        </Reveal>
      </section>

      {/* ── Who this is for ── */}
      <section style={{ maxWidth: MAXW, margin: '0 auto', padding: '30px 22px 80px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 20 }}>
          <Reveal>
            <div style={{ background: T.surface, border: `1px solid ${T.line}`, borderRadius: 18, padding: '30px 28px', height: '100%' }}>
              <h3 className="rm-serif" style={{ fontSize: 24, margin: '0 0 20px' }}>{LANDING.forYou.heading}</h3>
              {LANDING.forYou.yes.map((y) => (
                <div key={y} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 13 }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={T.accent} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginTop: 2, flexShrink: 0 }}><polyline points="20 6 9 17 4 12" /></svg>
                  <span style={{ color: T.text, fontSize: 15.5, lineHeight: 1.5 }}>{y}</span>
                </div>
              ))}
            </div>
          </Reveal>
          <Reveal delay={100}>
            <div style={{ background: 'transparent', border: `1px solid ${T.line}`, borderRadius: 18, padding: '30px 28px', height: '100%' }}>
              <h3 className="rm-serif" style={{ fontSize: 24, margin: '0 0 20px', color: T.text2 }}>{LANDING.forYou.notHeading}</h3>
              {LANDING.forYou.no.map((n) => (
                <div key={n} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 13 }}>
                  <span style={{ color: T.text3, marginTop: 1, flexShrink: 0 }}>—</span>
                  <span style={{ color: T.text2, fontSize: 15.5, lineHeight: 1.5 }}>{n}</span>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Deposit ── */}
      <section style={{ maxWidth: 760, margin: '0 auto', padding: '30px 22px 80px' }}>
        <Reveal>
          <div style={{ background: T.surface, border: `1px solid ${T.line}`, borderRadius: 20, padding: 'clamp(28px,5vw,44px)' }}>
            <div className="rm-eyebrow" style={{ marginBottom: 14 }}>{DEPOSIT.label} commitment deposit</div>
            <h2 className="rm-serif" style={{ fontSize: 'clamp(24px,3.6vw,34px)', margin: '0 0 16px' }}>{LANDING.deposit.heading}</h2>
            <p style={{ color: T.text2, fontSize: 16, lineHeight: 1.7, margin: '0 0 22px' }}>{LANDING.deposit.body}</p>
            <div style={{ display: 'grid', gap: 12 }}>
              {LANDING.deposit.terms.map((t) => (
                <div key={t} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <span style={{ color: T.accent, marginTop: 1 }}>◆</span>
                  <span style={{ color: T.text2, fontSize: 14.5, lineHeight: 1.6 }}>{t}</span>
                </div>
              ))}
            </div>
            <a href={LANDING.deposit.policyHref} style={{ display: 'inline-block', marginTop: 20, color: T.accent, fontSize: 13.5, textDecoration: 'underline', textUnderlineOffset: 3 }}>{LANDING.deposit.policyLabel} →</a>
          </div>
        </Reveal>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" style={{ maxWidth: 760, margin: '0 auto', padding: '20px 22px 80px' }}>
        <Reveal>
          <div style={{ display: 'grid', gap: 12 }}>
            {LANDING.faq.map((f) => (
              <details key={f.q} style={{ background: T.surface, border: `1px solid ${T.line}`, borderRadius: 14, padding: '18px 22px' }}>
                <summary style={{ cursor: 'pointer', fontSize: 17, fontWeight: 600, listStyle: 'none' }}>{f.q}</summary>
                <p style={{ color: T.text2, fontSize: 15, lineHeight: 1.7, margin: '12px 0 0' }}>{f.a}</p>
              </details>
            ))}
          </div>
        </Reveal>
      </section>

      {/* ── Final CTA ── */}
      <section style={{ position: 'relative', padding: '100px 22px', textAlign: 'center', background: 'radial-gradient(120% 100% at 50% 0%, #14110a 0%, #080808 60%)', borderTop: `1px solid ${T.line}` }}>
        <Reveal>
          <h2 className="rm-serif" style={{ fontSize: 'clamp(30px,5.4vw,56px)', margin: '0 auto', maxWidth: 780 }}>{LANDING.finalCta.heading}</h2>
          <p style={{ color: T.text2, fontSize: 'clamp(16px,2vw,20px)', margin: '18px auto 34px', maxWidth: 560 }}>{LANDING.finalCta.sub}</p>
          <Btn onClick={() => go('final')} style={{ padding: '19px 46px', fontSize: 18 }}>{LANDING.finalCta.cta}</Btn>
          <p style={{ color: T.text3, fontSize: 13, marginTop: 16 }}>{LANDING.finalCta.micro}</p>
        </Reveal>
      </section>

      <Footer legal={LEGAL} />

      {modal && <VideoModal src={modal} onClose={() => setModal(null)} />}

      <style>{`.rm-vt{transition:transform .18s ease, border-color .18s ease}.rm-vt:hover{transform:translateY(-3px);border-color:${T.lineStrong}}`}</style>
    </div>
  )
}
