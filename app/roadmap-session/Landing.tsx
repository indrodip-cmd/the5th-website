'use client'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import { LANDING, RATING, FEATURED_CASES, MORE_CASES, T, type CaseStudy } from './content'
import { Fonts, Header, Footer, Btn, Reveal, QuizProvider, QuizSection, OptionGrid, useQuiz, useUtm } from './ui'
import { track, watchScrollViewContent } from './track'
import { VIDEO_REVIEWS } from '@/components/VideoWall'

const MAXW = 1120
const PADX = 'clamp(20px,5vw,22px)'
const SECY = 'clamp(30px,6vw,60px)'
const LINE = T.line
const CARD_RADIUS = 24
const CARD_SHADOW = '0 10px 50px -8px rgba(46,26,53,.14)'
const CARD_PAD = 'clamp(22px,5vw,40px)'

function Stars() {
  return <span style={{ display: 'inline-flex', gap: 2 }} aria-hidden>{Array.from({ length: 5 }).map((_, i) => <svg key={i} width="16" height="16" viewBox="0 0 24 24" fill={T.accent}><path d="M12 2l2.9 6.3 6.9.8-5.1 4.7 1.4 6.8L12 17.8 5.9 20.6l1.4-6.8L2.2 9.1l6.9-.8z" /></svg>)}</span>
}
function RatingRow() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
      <Stars /><span style={{ fontWeight: 800, fontSize: 14.5 }}>{RATING.score}</span>
      <span style={{ color: T.text2, fontSize: 13 }}>{RATING.text}</span>
    </div>
  )
}
function SectionHead({ eyebrow, heading, sub, maxW }: { eyebrow?: string; heading: string; sub?: string; maxW?: number }) {
  return (
    <div style={{ textAlign: 'center', marginBottom: 28, maxWidth: maxW || 680, marginLeft: 'auto', marginRight: 'auto' }}>
      {eyebrow && <div className="rs-eyebrow" style={{ marginBottom: 12 }}>{eyebrow}</div>}
      <h2 className="rs-serif" style={{ fontSize: 'clamp(22px,4.6vw,38px)', margin: 0, fontWeight: 800, lineHeight: 1.25 }}>{heading}</h2>
      {sub && <p style={{ color: T.text2, fontSize: 15.5, lineHeight: 1.6, marginTop: 12 }}>{sub}</p>}
    </div>
  )
}
function Disclaimer({ style }: { style?: React.CSSProperties }) {
  return <p style={{ color: T.text3, fontSize: 11.5, lineHeight: 1.5, margin: '8px 0 0', ...style }}>Results are not typical. Results vary. This is an individual client result, not a promise of what you will achieve.</p>
}

function StepIcon({ kind }: { kind: string }) {
  const c = { fill: 'none', stroke: T.accent, strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }
  const box = { width: 48, height: 48, viewBox: '0 0 56 56' }
  if (kind === 'search') return <svg {...box}><circle cx={24} cy={24} r={13} {...c} /><line x1={33.5} y1={33.5} x2={46} y2={46} {...c} /></svg>
  if (kind === 'tag') return <svg {...box}><rect x={14} y={14} width={28} height={28} rx={6} transform="rotate(45 28 28)" {...c} /><circle cx={28} cy={18} r={2} fill={T.accent} stroke="none" /></svg>
  if (kind === 'target') return <svg {...box}><circle cx={28} cy={28} r={18} {...c} /><circle cx={28} cy={28} r={10} {...c} /><circle cx={28} cy={28} r={3} fill={T.accent} stroke="none" /></svg>
  if (kind === 'compass') return <svg {...box}><circle cx={28} cy={28} r={18} {...c} /><polygon points="28,16 32,28 28,40 24,28" fill={T.accent} stroke="none" /></svg>
  return <svg {...box}><rect x={10} y={14} width={36} height={30} rx={5} {...c} /><line x1={10} y1={24} x2={46} y2={24} {...c} /><polyline points="19,34 25,40 38,27" {...c} /></svg>
}

/* Click-to-play thumbnail: zero iframes mount until tapped (brief P3). */
function LazyVideo({ src, w, h, index }: { src: string; w: number; h: number; index: number }) {
  const [playing, setPlaying] = useState(false)
  return (
    <div style={{ position: 'relative', width: '100%', aspectRatio: `${w} / ${h}`, background: '#231029', borderRadius: 16, overflow: 'hidden', boxShadow: CARD_SHADOW }}>
      {playing ? (
        <iframe src={src} title={`Client review ${index + 1}`} loading="lazy" allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share" allowFullScreen style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none' }} />
      ) : (
        <button className="rs-focus" aria-label={`Play client review ${index + 1}`} onClick={() => setPlaying(true)}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none', background: 'linear-gradient(160deg,#3a1f45,#1c0f22)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ width: 60, height: 60, minWidth: 44, minHeight: 44, borderRadius: '50%', background: 'rgba(255,255,255,.92)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill={T.accent}><path d="M8 5v14l11-7z" /></svg>
          </span>
        </button>
      )}
    </div>
  )
}

function CaseCard({ c }: { c: CaseStudy }) {
  return (
    <div style={{ borderTop: `1px solid ${LINE}`, paddingTop: SECY, paddingBottom: SECY }}>
      {c.photo ? (
        <Image src={c.photo} alt={`${c.name}, client`} width={56} height={56} loading="lazy" style={{ width: 56, height: 56, borderRadius: '50%', objectFit: 'cover', marginBottom: 16 }} />
      ) : (
        <span aria-hidden style={{ width: 56, height: 56, borderRadius: '50%', background: 'linear-gradient(180deg,#6b39a0,#552879)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 19, marginBottom: 16 }}>{c.name[0]}</span>
      )}
      <div className="rs-serif" style={{ color: T.accent, fontWeight: 800, fontSize: 'clamp(19px,2.6vw,23px)', margin: '0 0 10px' }}>{c.result}</div>
      <p style={{ color: T.text2, fontSize: 15, lineHeight: 1.65, margin: '0 0 10px', fontStyle: 'italic' }}>&ldquo;{c.quote.replace(/^[“"]|[”"]$/g, '')}&rdquo;</p>
      <div style={{ fontWeight: 800, fontSize: 14 }}>{c.name}</div>
      <div style={{ color: T.text3, fontSize: 12.5 }}>{c.role}</div>
      <Disclaimer />
    </div>
  )
}

function HeroQuiz() {
  const { state, jumpToQuiz } = useQuiz()
  const step0 = { id: 'business_type', type: 'single' as const, prompt: 'What best describes what you do?', options: LANDING_Q1 }
  if (state.index > 0) {
    return (
      <div style={{ background: '#fff', borderRadius: 20, padding: 'clamp(18px,4vw,26px)', boxShadow: CARD_SHADOW }}>
        <p style={{ fontSize: 14.5, fontWeight: 700, color: T.text2, margin: '0 0 12px' }}>Picking up where you left off —</p>
        <Btn onClick={jumpToQuiz} full>Continue your quiz →</Btn>
      </div>
    )
  }
  return (
    <div style={{ background: '#fff', borderRadius: 20, padding: 'clamp(18px,4vw,26px)', boxShadow: CARD_SHADOW }}>
      <h2 style={{ fontSize: 17, fontWeight: 800, margin: '0 0 14px' }}>{step0.prompt}</h2>
      <OptionGrid step={step0} large />
    </div>
  )
}
const LANDING_Q1 = [
  { value: 'coach', label: 'I’m a coach' },
  { value: 'consultant', label: 'I’m a consultant' },
  { value: 'both', label: 'I’m both a coach and consultant' },
  { value: 'expert', label: 'I run another type of expert / service business' },
  { value: 'none', label: 'I’m not currently running a business' },
]

function PageBody() {
  const { jumpToQuiz } = useQuiz()
  const [showSticky, setShowSticky] = useState(false)
  const [expanded, setExpanded] = useState(false)
  useUtm()

  useEffect(() => { track('PageView') }, [])
  useEffect(() => watchScrollViewContent(() => track('ViewContent')), [])
  useEffect(() => { const on = () => setShowSticky(window.scrollY > 560); on(); window.addEventListener('scroll', on, { passive: true }); return () => window.removeEventListener('scroll', on) }, [])

  const goQuiz = (where: string) => { track('cta_click', { where }); jumpToQuiz() }

  return (
    <div style={{ background: '#fff', color: T.text, fontFamily: T.sans, overflowX: 'hidden' }}>
      <Fonts />
      <Header />

      {/* ── Hero: headline + subhead + founder photo + Q1 buttons, all visible on a 390px phone without scrolling ── */}
      <div style={{ background: 'radial-gradient(110% 60% at 15% -6%, #FBF6EF 0%, #ffffff 62%)' }}>
        <section style={{ maxWidth: MAXW, margin: '0 auto', padding: 'clamp(22px,5vw,48px) ' + PADX + ' 20px', display: 'flex', gap: 'clamp(20px,5vw,48px)', alignItems: 'flex-start', flexWrap: 'wrap' }} className="rs-hero">
          <div style={{ flex: '1 1 440px', minWidth: 300 }}>
            <Reveal>
              <div className="rs-eyebrow" style={{ marginBottom: 12 }}>{LANDING.eyebrow}</div>
              <h1 className="rs-serif" style={{ fontSize: 'clamp(26px,5.2vw,46px)', margin: 0, fontWeight: 800, lineHeight: 1.08 }}>{LANDING.headline}</h1>
              <p style={{ color: T.text2, fontSize: 'clamp(15px,1.8vw,17px)', lineHeight: 1.55, maxWidth: 520, margin: '14px 0 0' }}>{LANDING.headlineSub}</p>
              <p style={{ color: T.accentInk, fontWeight: 800, fontSize: 13.5, marginTop: 12 }}>{LANDING.heroMicro}</p>
            </Reveal>
            <Reveal delay={100} style={{ marginTop: 18, display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap' }}>
              <Image src="/images/founder.png" alt="Indrodip Ghosh, founder of The5th Global Consulting" width={56} height={56} priority style={{ width: 56, height: 56, borderRadius: '50%', objectFit: 'cover', border: `2px solid ${T.line}` }} />
              <RatingRow />
            </Reveal>
          </div>
        </section>
        <section style={{ maxWidth: 560, margin: '0 auto', padding: '0 ' + PADX + ' 28px' }}>
          <Reveal delay={150}><HeroQuiz /></Reveal>
        </section>
      </div>

      {/* ── Press strip, label actually rendered (brief: "Our clients have been featured in", not a bare logo row) ── */}
      <div style={{ padding: '18px ' + PADX + ' 0' }}>
        <div style={{ maxWidth: MAXW, margin: '0 auto', textAlign: 'center' }}>
          <p style={{ color: T.text3, fontSize: 12, fontWeight: 700, letterSpacing: '.04em', textTransform: 'uppercase', marginBottom: 12 }}>{LANDING.press.label}</p>
          <div style={{ display: 'flex', gap: 'clamp(16px,4vw,36px)', justifyContent: 'center', flexWrap: 'wrap' }}>
            {LANDING.press.items.map((p) => <span key={p} style={{ fontFamily: 'Georgia, serif', fontWeight: 700, fontSize: 'clamp(12px,2vw,15px)', color: T.text2, opacity: 0.6 }}>{p}</span>)}
          </div>
        </div>
      </div>

      {/* ── Proof strip (3 result cards, each with its own disclaimer, directly beneath — brief P0-7 + section 6 step 2) ── */}
      <section id="proof" style={{ background: '#2E1A35', color: '#fff', padding: 'clamp(28px,4.5vw,40px) ' + PADX, marginTop: 28 }}>
        <div style={{ maxWidth: MAXW, margin: '0 auto', textAlign: 'center' }}>
          <Reveal>
            <div className="rs-eyebrow" style={{ marginBottom: 10, color: T.gold }}>{LANDING.proof.eyebrow}</div>
            <h2 className="rs-serif" style={{ fontSize: 'clamp(20px,3.2vw,28px)', margin: '0 0 20px', fontWeight: 800, color: '#fff' }}>{LANDING.proof.heading}</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 14, maxWidth: 820, margin: '0 auto' }}>
              {LANDING.proof.stats.slice(0, 3).map((st) => (
                <div key={st} style={{ background: 'rgba(255,255,255,.08)', border: `1px solid ${T.gold}66`, borderRadius: 14, padding: '16px 18px' }}>
                  <span className="rs-serif" style={{ fontSize: 'clamp(14px,2vw,17px)', fontWeight: 800, color: T.gold }}>{st}</span>
                  <p style={{ color: 'rgba(255,255,255,.55)', fontSize: 11, margin: '8px 0 0', lineHeight: 1.5 }}>Individual result. Not typical. Results vary.</p>
                </div>
              ))}
            </div>
            <p style={{ color: 'rgba(255,255,255,.45)', fontSize: 11.5, marginTop: 16, maxWidth: 560, marginLeft: 'auto', marginRight: 'auto' }}>{LANDING.proof.disclaimer}</p>
          </Reveal>
        </div>
      </section>

      {/* ── Who it's for / not for ── */}
      <section style={{ padding: SECY + ' ' + PADX }}>
        <div style={{ maxWidth: MAXW, margin: '0 auto' }}>
          <Reveal><SectionHead eyebrow={LANDING.eligibility.eyebrow} heading={LANDING.eligibility.heading} /></Reveal>
          <Reveal>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 'clamp(14px,2.5vw,24px)' }}>
              <div style={{ background: '#fff', borderRadius: CARD_RADIUS, boxShadow: CARD_SHADOW, padding: CARD_PAD }}>
                <h3 style={{ fontSize: 14, fontWeight: 800, color: T.accentInk, margin: '0 0 14px' }}>{LANDING.eligibility.forHeading}</h3>
                <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'grid', gap: 12 }}>
                  {LANDING.eligibility.forItems.map((it) => (
                    <li key={it} style={{ display: 'flex', gap: 10, color: T.text2, fontSize: 14.5, lineHeight: 1.6 }}>
                      <span aria-hidden style={{ color: T.accentInk, fontWeight: 800 }}>✓</span><span>{it}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div style={{ background: T.surface, borderRadius: CARD_RADIUS, boxShadow: CARD_SHADOW, padding: CARD_PAD }}>
                <h3 style={{ fontSize: 14, fontWeight: 800, color: T.text3, margin: '0 0 14px' }}>{LANDING.eligibility.notHeading}</h3>
                <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'grid', gap: 12 }}>
                  {LANDING.eligibility.notItems.map((it) => (
                    <li key={it} style={{ display: 'flex', gap: 10, color: T.text2, fontSize: 14.5, lineHeight: 1.6 }}>
                      <span aria-hidden style={{ color: T.text3, fontWeight: 800 }}>–</span><span>{it}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── What happens in your 60 minutes ── */}
      <section id="call" style={{ background: T.surface, borderTop: `1px solid ${LINE}`, borderBottom: `1px solid ${LINE}`, padding: SECY + ' ' + PADX }}>
        <div style={{ maxWidth: MAXW, margin: '0 auto' }}>
          <Reveal><SectionHead eyebrow={LANDING.call.eyebrow} heading={LANDING.call.heading} sub={LANDING.call.sub} /></Reveal>
          <div style={{ display: 'grid', gap: 'clamp(22px,4vw,32px)', marginTop: 12 }}>
            {LANDING.call.steps.map((s) => (
              <Reveal key={s.n}>
                <div style={{ display: 'flex', gap: 'clamp(16px,4vw,32px)', alignItems: 'center', flexWrap: 'wrap' }}>
                  <div style={{ flexShrink: 0, width: 84, height: 84, borderRadius: 18, background: '#fff', border: `1px solid ${LINE}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <StepIcon kind={s.icon} />
                  </div>
                  <div style={{ flex: '0 1 460px', minWidth: 260 }}>
                    <div style={{ fontSize: 11.5, fontWeight: 800, color: T.text3, letterSpacing: '.06em', marginBottom: 6 }}>STEP {s.n}</div>
                    <h3 style={{ fontSize: 18, fontWeight: 800, margin: '0 0 6px' }}>{s.t}</h3>
                    <p style={{ color: T.text2, fontSize: 14.5, lineHeight: 1.6, margin: 0 }}>{s.d}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── 2-3 video testimonials, click-to-play (no iframe mounts until tapped) ── */}
      <section style={{ padding: SECY + ' ' + PADX }}>
        <div style={{ maxWidth: MAXW, margin: '0 auto' }}>
          <Reveal><SectionHead eyebrow={LANDING.videoEyebrow} heading={LANDING.videoHeading} sub={LANDING.videoSub} /></Reveal>
          <Reveal>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 18, maxWidth: 900, margin: '0 auto' }}>
              {VIDEO_REVIEWS.slice(0, 3).map((r, i) => <LazyVideo key={r.src} src={r.src} w={r.w} h={r.h} index={i} />)}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── 3-stage framework, no dollar axis (brief P0-4) ── */}
      <section id="path" style={{ background: T.surface, borderTop: `1px solid ${LINE}`, borderBottom: `1px solid ${LINE}`, padding: SECY + ' ' + PADX }}>
        <div style={{ maxWidth: MAXW, margin: '0 auto' }}>
          <Reveal><SectionHead eyebrow={LANDING.framework.eyebrow} heading={LANDING.framework.heading} sub={LANDING.framework.sub} /></Reveal>
          <Reveal>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 'clamp(14px,2.5vw,24px)' }}>
              {LANDING.framework.stages.map((p, i) => (
                <div key={p.tag} style={{ background: '#fff', borderRadius: CARD_RADIUS, boxShadow: CARD_SHADOW, padding: CARD_PAD }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                    <span style={{ width: 30, height: 30, borderRadius: 9, background: 'linear-gradient(180deg,#6b39a0,#552879)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 13 }}>{i + 1}</span>
                    <span style={{ fontSize: 12, fontWeight: 800, color: T.accentInk, textTransform: 'uppercase', letterSpacing: '.04em' }}>{p.tag}</span>
                  </div>
                  <h3 style={{ fontSize: 17, fontWeight: 800, margin: '0 0 8px' }}>{p.t}</h3>
                  <p style={{ color: T.text2, fontSize: 14.5, lineHeight: 1.6, margin: 0 }}>{p.d}</p>
                </div>
              ))}
            </div>
          </Reveal>
          <Reveal>
            <div style={{ textAlign: 'center', marginTop: 28 }}>
              <Btn onClick={() => goQuiz('path_cta')}>{LANDING.ctaPrimary} →</Btn>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Who you'll speak with ── */}
      <section style={{ background: '#2E1A35', color: '#fff', padding: SECY + ' ' + PADX }}>
        <div style={{ maxWidth: 820, margin: '0 auto' }}>
          <Reveal><SectionHead eyebrow={LANDING.founder.eyebrow} heading={LANDING.founder.heading} /></Reveal>
          <div style={{ display: 'grid', gap: 18, marginTop: 4 }}>
            {[{ photo: '/images/founder.png', ...LANDING.founder }, { ...LANDING.founder2 }].map((p) => (
              <Reveal key={p.name}>
                <div style={{ background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.14)', borderRadius: 20, padding: 'clamp(20px,4vw,30px)', display: 'flex', gap: 22, alignItems: 'flex-start', flexWrap: 'wrap' }} className="rs-founder-row">
                  <div style={{ flexShrink: 0, textAlign: 'center', width: 120, margin: '0 auto' }}>
                    <Image src={p.photo} alt={p.name} width={100} height={100} loading="lazy" style={{ width: 100, height: 100, borderRadius: '50%', objectFit: 'cover', border: '3px solid rgba(255,255,255,.2)' }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 260 }}>
                    <blockquote style={{ margin: '0 0 12px', paddingLeft: 16, borderLeft: `3px solid ${T.gold}`, color: '#fff', fontSize: 16, lineHeight: 1.55, fontStyle: 'italic' }}>&ldquo;{p.quote}&rdquo;</blockquote>
                    <p style={{ color: 'rgba(255,255,255,.7)', fontSize: 14, lineHeight: 1.65, margin: '0 0 12px' }}>{p.body}</p>
                    <div style={{ fontWeight: 800, fontSize: 14.5 }}>{p.name}</div>
                    <div style={{ color: 'rgba(255,255,255,.5)', fontSize: 12.5 }}>{p.role}</div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Case studies: 5-6 featured, "See all 14" expander (brief P1 item 10) ── */}
      <section style={{ background: '#fff', padding: SECY + ' ' + PADX }}>
        <div style={{ maxWidth: MAXW, margin: '0 auto' }}>
          <Reveal><SectionHead eyebrow={LANDING.caseStudies.eyebrow} heading={LANDING.caseStudies.heading} /></Reveal>
          <Reveal>
            <div style={{ maxWidth: 714, margin: '0 auto' }}>
              {FEATURED_CASES.map((c) => <CaseCard key={c.name} c={c} />)}
              {expanded && MORE_CASES.map((c) => <CaseCard key={c.name} c={c} />)}
            </div>
            <div style={{ textAlign: 'center', marginTop: 20 }}>
              <Btn variant="outline" onClick={() => setExpanded((x) => !x)}>{expanded ? LANDING.caseStudies.collapseLabel : LANDING.caseStudies.expanderLabel}</Btn>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" style={{ padding: SECY + ' ' + PADX }}>
        <div style={{ maxWidth: 740, margin: '0 auto' }}>
          <Reveal>
            <div className="rs-eyebrow" style={{ marginBottom: 10 }}>{LANDING.faq.eyebrow}</div>
            <h2 className="rs-serif" style={{ fontSize: 'clamp(24px,4vw,32px)', margin: '0 0 20px', fontWeight: 800 }}>{LANDING.faq.heading}</h2>
          </Reveal>
          {LANDING.faq.items.map((it, i) => (
            <Reveal key={it.q}>
              <div style={{ paddingBottom: 20, marginBottom: i < LANDING.faq.items.length - 1 ? 20 : 0, borderBottom: i < LANDING.faq.items.length - 1 ? `1px solid ${LINE}` : 'none' }}>
                <h3 style={{ fontSize: 16, fontWeight: 800, margin: '0 0 8px' }}>{it.q}</h3>
                <p style={{ color: T.text2, fontSize: 14.5, lineHeight: 1.65, margin: 0 }}>{it.a}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── Full quiz + footer ── */}
      <section id="quiz" style={{ background: T.surface, borderTop: `1px solid ${LINE}`, padding: SECY + ' ' + PADX }}>
        <div style={{ maxWidth: MAXW, margin: '0 auto', textAlign: 'center' }}>
          <Reveal>
            <div className="rs-eyebrow" style={{ marginBottom: 12 }}>Apply Now</div>
            <h2 className="rs-serif" style={{ fontSize: 'clamp(24px,4vw,34px)', margin: '0 0 24px', fontWeight: 800 }}>Let’s find out if you qualify.</h2>
          </Reveal>
          <Reveal>
            <div style={{ maxWidth: 680, margin: '0 auto', background: '#fff', borderRadius: 20, padding: 'clamp(20px,4vw,32px)', boxShadow: '0 30px 70px -40px rgba(46,26,53,.5)', textAlign: 'left' }}>
              <QuizSection />
            </div>
            <p style={{ color: T.text2, fontSize: 12.5, marginTop: 20 }}>Free · No pressure · If we’re not the right fit, we’ll say so and point you to a better next step.</p>
          </Reveal>
        </div>
      </section>

      <Footer />

      {/* ── Sticky mobile CTA (brief P1 item 8) ── */}
      <div className="rs-sticky-cta" style={{ position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 60, padding: '10px 14px calc(10px + env(safe-area-inset-bottom))', background: 'rgba(255,255,255,.94)', backdropFilter: 'saturate(140%) blur(12px)', borderTop: `1px solid ${LINE}`, transform: showSticky ? 'translateY(0)' : 'translateY(120%)', transition: 'transform .3s cubic-bezier(.2,.7,.2,1)' }}>
        <button onClick={() => goQuiz('sticky')} className="rs-focus" style={{ width: '100%', minHeight: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: 'linear-gradient(180deg,#6b39a0,#552879)', color: '#fff', border: 'none', borderRadius: 999, padding: '14px 20px', fontSize: 16, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>{LANDING.ctaPrimaryShort} →</button>
      </div>

      <style>{`
        .rs-sticky-cta{display:none}
        @media(max-width:768px){.rs-sticky-cta{display:block}footer{padding-bottom:100px!important}}
        @media(max-width:900px){.rs-hero{text-align:center;justify-content:center}.rs-hero>div:first-child{text-align:center}.rs-hero p{margin-left:auto;margin-right:auto}}
        @media(max-width:560px){.rs-founder-row{flex-direction:column;align-items:center!important;text-align:center}}
      `}</style>
    </div>
  )
}

export default function Landing() {
  return (
    <QuizProvider>
      <PageBody />
    </QuizProvider>
  )
}
