'use client'
/* The Business Roadmap Audit — INDIA landing page.
   Mirrors a proven high-converting "clarity call" layout: a pain/agitation
   block in the reader's own voice, a risk-reversed headline, a hero card
   with concrete session details, a stat strip, a self-qualifying checklist,
   a 4-part clarity framework, a before/after transformation list, dense
   testimonial proof (real case studies + real on-camera video reviews), a
   founder/authority section, an objection-handling FAQ accordion, then a
   direct ₹199 booking CTA — no embedded qualification quiz, the booking
   deposit itself is the filter. Copy avoids asserting the reader's own
   financial status (Meta's Personal Attributes policy) and avoids absolute
   "0%/guaranteed" claims; income claims carry "results vary" disclaimers
   throughout, per Meta's business-opportunity / unrealistic-outcomes rules.
   Reuses the shared UI kit, tracking and real case-study proof from the
   parent funnel; only the copy (./config) is India-specific. */
import { useEffect, useState, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { LANDING, LEGAL, RATING, PRESS } from './config'
import { REAL_PROOF } from '../config'
import { Fonts, Header, Footer, Btn, Reveal, useUtm } from '../ui'
import { track } from '../track'
import VideoWall from '@/components/VideoWall'

const MAXW = 1120
const PADX = 'clamp(20px,5vw,22px)'
const SECY = 'clamp(30px,6vw,60px)'
const SECY_LG = 'clamp(30px,8vw,90px)'
const PURPLE = '#5E2E86'
const LINE = 'rgba(46,26,53,0.14)'
const TEXT2 = '#645a6e'
const TEXT3 = '#9a93a2'
const CARD_RADIUS = 28
const CARD_SHADOW = '0 10px 50px -8px rgba(46,26,53,0.14)'
const CARD_PAD = 'clamp(24px,5vw,44px)'

function Stars() {
  return <span style={{ display: 'inline-flex', gap: 2 }} aria-hidden>{Array.from({ length: 5 }).map((_, i) => <svg key={i} width="16" height="16" viewBox="0 0 24 24" fill={PURPLE}><path d="M12 2l2.9 6.3 6.9.8-5.1 4.7 1.4 6.8L12 17.8 5.9 20.6l1.4-6.8L2.2 9.1l6.9-.8z" /></svg>)}</span>
}
function RatingRow({ center }: { center?: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: center ? 'center' : 'flex-start', flexWrap: 'wrap' }}>
      <Stars /><span style={{ fontWeight: 800, fontSize: 14.5 }}>{RATING.score}</span>
      <span style={{ color: TEXT2, fontSize: 13 }}>{RATING.text}</span>
    </div>
  )
}
function SectionHead({ eyebrow, heading, sub, maxW, dark, align }: { eyebrow?: string; heading: string; sub?: string; maxW?: number; dark?: boolean; align?: 'left' | 'center' }) {
  const left = align === 'left'
  return (
    <div style={{ textAlign: left ? 'left' : 'center', marginBottom: 28, maxWidth: left ? undefined : (maxW || 680), marginLeft: left ? 0 : 'auto', marginRight: left ? 0 : 'auto' }}>
      {eyebrow && <div className="rm-eyebrow" style={{ marginBottom: 12, color: dark ? '#E4C879' : undefined }}>{eyebrow}</div>}
      <h2 className="rm-serif" style={{ fontSize: 'clamp(22px,4.6vw,42px)', margin: 0, fontWeight: 800, lineHeight: 1.25, color: dark ? '#fff' : undefined }}>{heading}</h2>
      {sub && <p style={{ color: dark ? 'rgba(255,255,255,.65)' : TEXT2, fontSize: 15.5, lineHeight: 1.6, marginTop: 12, maxWidth: left ? 560 : undefined, marginLeft: left ? 0 : 'auto', marginRight: left ? 0 : 'auto' }}>{sub}</p>}
    </div>
  )
}
function CheckIcon({ dark }: { dark?: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={dark ? '#E4C879' : PURPLE} strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden style={{ flexShrink: 0 }}>
      <circle cx="12" cy="12" r="10" />
      <path d="M8 12l3 3 5-6" />
    </svg>
  )
}
function CheckRow({ children, dark }: { children: ReactNode; dark?: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '14px 16px', borderRadius: 14, background: dark ? 'rgba(255,255,255,.06)' : '#fff', border: `1px solid ${dark ? 'rgba(255,255,255,.14)' : LINE}` }}>
      <CheckIcon dark={dark} />
      <span style={{ color: dark ? 'rgba(255,255,255,.88)' : '#2E1A35', fontSize: 15, lineHeight: 1.55, fontWeight: 600 }}>{children}</span>
    </div>
  )
}

function PressStrip() {
  return (
    <div style={{ padding: '22px ' + PADX + ' 0' }}>
      <div style={{ maxWidth: MAXW, margin: '0 auto 16px', textAlign: 'center' }}>
        <span style={{ fontSize: 11.5, fontWeight: 800, letterSpacing: '.14em', textTransform: 'uppercase', color: TEXT3 }}>{PRESS.label}</span>
      </div>
      <div style={{ maxWidth: MAXW, margin: '0 auto', display: 'flex', gap: 'clamp(22px,5vw,52px)', justifyContent: 'center', flexWrap: 'wrap', alignItems: 'center' }}>
        {PRESS.items.map((p) => <span key={p} style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontWeight: 700, fontSize: 'clamp(16px,2.8vw,22px)', color: TEXT2, opacity: 0.75, whiteSpace: 'nowrap' }}>{p}</span>)}
      </div>
    </div>
  )
}

function FaqItem({ q, a, open }: { q: string; a: string; open?: boolean }) {
  return (
    <details open={open} style={{ borderBottom: `1px solid ${LINE}`, padding: '18px 0' }}>
      <summary className="rm-focus" style={{ cursor: 'pointer', listStyle: 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, fontSize: 16.5, fontWeight: 800, color: '#2E1A35' }}>
        {q}
        <span className="rm-faq-icon" style={{ flexShrink: 0, width: 26, height: 26, borderRadius: '50%', border: `1.5px solid ${LINE}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700, color: PURPLE }} aria-hidden>+</span>
      </summary>
      <p style={{ color: TEXT2, fontSize: 14.5, lineHeight: 1.65, margin: '12px 0 0', maxWidth: 640 }}>{a}</p>
      <style>{`details[open] .rm-faq-icon{transform:rotate(45deg)}summary::-webkit-details-marker{display:none}`}</style>
    </details>
  )
}

export default function Landing() {
  const router = useRouter()
  const [showSticky, setShowSticky] = useState(false)
  useUtm()
  useEffect(() => { track('page_view') }, [])
  useEffect(() => { const on = () => setShowSticky(window.scrollY > 620); on(); window.addEventListener('scroll', on, { passive: true }); return () => window.removeEventListener('scroll', on) }, [])
  // Prefetch the ₹199 booking step so the CTA navigates instantly instead of
  // stalling on the first-ever fetch/compile of that route's chunk.
  useEffect(() => { router.prefetch('/10k-roadmap/india/pay') }, [router])
  const goApply = (where: string) => {
    track('cta_click', { where })
    router.push('/10k-roadmap/india/pay')
  }
  const CTA = (where: string, label?: string) => <Btn onClick={() => goApply(where)} style={{ padding: '16px 34px', fontSize: 17 }}>{label || LANDING.ctaPrimary} <span aria-hidden>→</span></Btn>

  const testimonialProof = REAL_PROOF.filter((c) => LANDING.caseStudies.names.includes(c.name))

  return (
    <div style={{ background: '#ffffff', color: '#2E1A35', fontFamily: "'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif", overflowX: 'hidden' }}>
      <Fonts />
      <Header nav={LANDING.nav} showFounder homeHref="/10k-roadmap/india" />

      {/* ── Hero: attention line, risk-reversed headline, hero card ── */}
      <div style={{ background: 'radial-gradient(110% 60% at 15% -6%, #FBF6EF 0%, #ffffff 62%)' }}>
        <section style={{ maxWidth: MAXW, margin: '0 auto', padding: 'clamp(30px,6vw,56px) ' + PADX + ' 20px', display: 'flex', gap: 'clamp(24px,5vw,56px)', alignItems: 'flex-start', flexWrap: 'wrap' }} className="rm-hero">
          <div style={{ flex: '1 1 440px', minWidth: 300 }}>
            <Reveal>
              <div className="rm-eyebrow" style={{ marginBottom: 14, color: PURPLE }}>{LANDING.eyebrowAttention}</div>
              <h1 className="rm-serif" style={{ fontSize: 'clamp(30px,5.2vw,50px)', margin: 0, fontWeight: 800, lineHeight: 1.1 }}>
                {LANDING.headlinePre}<span style={{ color: PURPLE, textDecoration: 'underline', textDecorationColor: 'rgba(94,46,134,.35)', textUnderlineOffset: 6 }}>{LANDING.headlineHighlight}</span>{LANDING.headlinePost}
              </h1>
              <p style={{ color: TEXT2, fontSize: 'clamp(15.5px,1.8vw,18px)', lineHeight: 1.55, maxWidth: 520, margin: '16px 0 0', fontWeight: 500 }}>{LANDING.headlineSub}</p>
            </Reveal>
            <Reveal delay={100} style={{ marginTop: 24 }}>
              <div className="rm-hero-ctas" style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                {CTA('hero')}
                <Btn onClick={() => { track('cta_click', { where: 'hero_secondary' }); document.getElementById(LANDING.ctaSecondary.href.slice(1))?.scrollIntoView({ behavior: 'smooth', block: 'start' }) }} variant="outline" style={{ padding: '16px 28px', fontSize: 16 }}>{LANDING.ctaSecondary.label}</Btn>
              </div>
              <p style={{ color: TEXT3, fontSize: 12.5, marginTop: 14 }}>{LANDING.ctaMicro}</p>
              <p className="rm-hero-guarantee" style={{ color: PURPLE, fontSize: 13, fontWeight: 800, marginTop: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                <CheckIcon />
                {LANDING.guaranteeShort}
              </p>
              <div className="rm-hero-rating" style={{ marginTop: 16 }}><RatingRow /></div>
            </Reveal>
          </div>
          <Reveal delay={150} style={{ flex: '1 1 320px', minWidth: 280, maxWidth: 380, margin: '0 auto' }}>
            <div style={{ background: '#fff', borderRadius: 24, boxShadow: '0 30px 60px -24px rgba(46,26,53,.25)', border: `1px solid ${LINE}`, overflow: 'hidden' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/founder-mvm.jpg" alt={`${LANDING.heroCard.name}, ${LANDING.heroCard.role}`} style={{ width: '100%', aspectRatio: '4/5', objectFit: 'cover', objectPosition: 'top', display: 'block' }} />
              <div style={{ padding: '16px 18px 18px' }}>
                <div style={{ fontWeight: 800, fontSize: 15 }}>{LANDING.heroCard.name}</div>
                <div style={{ color: TEXT3, fontSize: 12.5, marginBottom: 14 }}>{LANDING.heroCard.role}</div>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  {LANDING.heroCard.chips.map((c) => (
                    <div key={c.t} style={{ flex: '1 1 120px', background: '#FAF6F0', borderRadius: 12, padding: '10px 12px' }}>
                      <div style={{ fontWeight: 800, fontSize: 13 }}>{c.t}</div>
                      <div style={{ color: TEXT3, fontSize: 11.5 }}>{c.s}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>
        </section>
      </div>

      <PressStrip />

      {/* ── Pain / agitation: named in the reader's own voice before any
             pitch, so they feel understood before they're sold anything. ── */}
      <section style={{ padding: SECY + ' ' + PADX }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          <Reveal><SectionHead eyebrow={LANDING.pain.eyebrow} heading={LANDING.pain.heading} maxW={680} /></Reveal>
          <Reveal>
            <div style={{ display: 'grid', gap: 16 }}>
              {LANDING.pain.lines.map((l) => <p key={l} style={{ color: TEXT2, fontSize: 16, lineHeight: 1.7, margin: 0 }}>{l}</p>)}
            </div>
          </Reveal>
          <Reveal>
            <p style={{ color: '#2E1A35', fontWeight: 700, fontSize: 16.5, lineHeight: 1.6, marginTop: 20, paddingLeft: 16, borderLeft: `3px solid ${PURPLE}` }}>{LANDING.pain.close}</p>
          </Reveal>
        </div>
      </section>

      {/* ── Stat strip ── */}
      <section style={{ padding: SECY + ' ' + PADX + ' 0' }}>
        <div style={{ maxWidth: MAXW, margin: '0 auto' }}>
          <Reveal>
            <div className="rm-grid4" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: 'clamp(10px,2vw,16px)' }}>
              {LANDING.stats.map((s) => (
                <div key={s.l} style={{ background: '#fff', borderRadius: 18, boxShadow: CARD_SHADOW, padding: '20px 16px', textAlign: 'center' }}>
                  <div className="rm-serif" style={{ fontSize: 'clamp(20px,2.6vw,26px)', fontWeight: 800, color: PURPLE }}>{s.v}</div>
                  <div style={{ color: TEXT3, fontSize: 12, fontWeight: 700, marginTop: 4 }}>{s.l}</div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── "Who is this for?" self-qualifying checklist ── */}
      <section id="who" style={{ padding: SECY + ' ' + PADX }}>
        <div style={{ maxWidth: 820, margin: '0 auto' }}>
          <Reveal><SectionHead eyebrow={LANDING.whoIsThis.eyebrow} heading={LANDING.whoIsThis.heading} sub={LANDING.whoIsThis.sub} maxW={640} /></Reveal>
          <Reveal>
            <div style={{ display: 'grid', gap: 10 }}>
              {LANDING.whoIsThis.items.map((it) => <CheckRow key={it}>{it}</CheckRow>)}
            </div>
          </Reveal>
          <Reveal>
            <div style={{ marginTop: 24, background: PURPLE, borderRadius: CARD_RADIUS, padding: CARD_PAD, textAlign: 'center' }}>
              <p style={{ color: '#fff', fontWeight: 800, fontSize: 'clamp(16px,2.4vw,19px)', lineHeight: 1.5, margin: '0 0 18px' }}>{LANDING.whoIsThis.bannerHeading}</p>
              <Btn onClick={() => goApply('who_banner')} variant="ghost" style={{ padding: '16px 34px', fontSize: 17 }}>{LANDING.ctaPrimary} <span aria-hidden>→</span></Btn>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Clarity: 4-box framework + dark "Your Next Step" banner ── */}
      <section id="clarity" style={{ background: '#FAF6F0', borderTop: `1px solid ${LINE}`, borderBottom: `1px solid ${LINE}`, padding: SECY + ' ' + PADX }}>
        <div style={{ maxWidth: MAXW, margin: '0 auto' }}>
          <Reveal><SectionHead eyebrow={LANDING.clarity.eyebrow} heading={LANDING.clarity.heading} sub={LANDING.clarity.sub} maxW={680} /></Reveal>
          <Reveal>
            <div className="rm-grid2" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: 'clamp(14px,2.5vw,24px)', marginBottom: 24 }}>
              {LANDING.clarity.boxes.map((b) => (
                <div key={b.n} style={{ background: '#fff', borderRadius: CARD_RADIUS, boxShadow: CARD_SHADOW, padding: CARD_PAD }}>
                  <div style={{ fontSize: 12, fontWeight: 800, color: TEXT3, letterSpacing: '.06em', marginBottom: 8 }}>{b.n}</div>
                  <h3 style={{ fontSize: 18, fontWeight: 800, margin: '0 0 8px' }}>{b.t}</h3>
                  <p style={{ color: TEXT2, fontSize: 14.5, lineHeight: 1.6, margin: 0 }}>{b.d}</p>
                </div>
              ))}
            </div>
          </Reveal>
          <Reveal>
            <div style={{ background: '#2E1A35', borderRadius: CARD_RADIUS, padding: CARD_PAD, display: 'flex', gap: 20, alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
              <div>
                <div className="rm-eyebrow" style={{ marginBottom: 8, color: '#E4C879' }}>{LANDING.clarity.nextStep.eyebrow}</div>
                <h3 className="rm-serif" style={{ color: '#fff', fontSize: 'clamp(19px,2.6vw,24px)', margin: '0 0 8px', fontWeight: 800 }}>{LANDING.clarity.nextStep.heading}</h3>
                <p style={{ color: 'rgba(255,255,255,.65)', fontSize: 14, lineHeight: 1.6, margin: 0, maxWidth: 420 }}>{LANDING.clarity.nextStep.sub}</p>
              </div>
              <Btn onClick={() => goApply('clarity_next_step')} style={{ padding: '16px 30px', fontSize: 16, flexShrink: 0 }}>{LANDING.ctaPrimary} <span aria-hidden>→</span></Btn>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Transformation: before/after imagine checklist ── */}
      <section style={{ padding: SECY + ' ' + PADX }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <Reveal><SectionHead eyebrow={LANDING.transformation.eyebrow} heading={LANDING.transformation.heading} maxW={640} /></Reveal>
          <Reveal>
            <div className="rm-grid2" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: 10 }}>
              {LANDING.transformation.items.map((it) => <CheckRow key={it}>{it}</CheckRow>)}
            </div>
          </Reveal>
          <Reveal>
            <div style={{ marginTop: 24, background: '#FAF6F0', border: `1px solid ${LINE}`, borderRadius: CARD_RADIUS, padding: CARD_PAD, textAlign: 'center' }}>
              <p style={{ fontWeight: 700, fontSize: 16, margin: '0 0 16px' }}>{LANDING.transformation.close}</p>
              {CTA('transformation')}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Proof: real testimonials, dark section ── */}
      <section id="proof" style={{ background: '#2E1A35', color: '#fff', padding: SECY_LG + ' ' + PADX }}>
        <div style={{ maxWidth: MAXW, margin: '0 auto' }}>
          <Reveal><SectionHead eyebrow={LANDING.proof.eyebrow} heading={LANDING.proof.heading} dark maxW={680} /></Reveal>
          <Reveal>
            <div style={{ textAlign: 'center', marginBottom: 32 }}>
              <span style={{ display: 'inline-block', background: 'rgba(228,200,121,.12)', border: '1px solid rgba(228,200,121,.4)', borderRadius: 999, padding: '10px 22px', color: '#E4C879', fontWeight: 800, fontSize: 'clamp(14px,2vw,16px)' }}>{LANDING.proof.revenueLine}</span>
            </div>
          </Reveal>
          <Reveal>
            <div className="rm-grid3" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 'clamp(14px,2.5vw,24px)' }}>
              {testimonialProof.map((c) => (
                <div key={c.name} style={{ background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.14)', borderRadius: CARD_RADIUS, padding: CARD_PAD }}>
                  <div style={{ marginBottom: 12 }}><Stars /></div>
                  <div className="rm-serif" style={{ color: '#E4C879', fontWeight: 800, fontSize: 'clamp(17px,2.2vw,20px)', margin: '0 0 10px' }}>{c.result}</div>
                  <p style={{ color: 'rgba(255,255,255,.78)', fontSize: 14.5, lineHeight: 1.6, margin: '0 0 16px', fontStyle: 'italic' }}>&ldquo;{c.quote.replace(/^[“"]|[”"]$/g, '')}&rdquo;</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    {c.photo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={c.photo} alt={c.name} style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }} />
                    ) : (
                      <span style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(180deg,#6b39a0,#552879)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 15 }}>{c.name[0]}</span>
                    )}
                    <div>
                      <div style={{ fontWeight: 800, fontSize: 13.5 }}>{c.name}</div>
                      <div style={{ color: 'rgba(255,255,255,.5)', fontSize: 11.5 }}>{c.role}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
          <p style={{ color: 'rgba(255,255,255,.4)', fontSize: 11.5, textAlign: 'center', margin: '18px 0 0' }}>{LANDING.proof.disclaimer}</p>
          <Reveal><div style={{ textAlign: 'center', marginTop: 28 }}>{CTA('proof')}</div></Reveal>
        </div>
      </section>

      {/* ── Video testimonials: real on-camera client reviews ── */}
      <section style={{ background: '#FAF6F0', borderBottom: `1px solid ${LINE}`, padding: SECY + ' ' + PADX }}>
        <div style={{ maxWidth: MAXW, margin: '0 auto' }}>
          <Reveal><SectionHead eyebrow="On-Camera · Client Reviews" heading="Hear it from them directly." sub="Unscripted reactions from clients. Tap any clip to play." maxW={620} /></Reveal>
          <Reveal><VideoWall columns={3} limit={12} /></Reveal>
        </div>
      </section>

      {/* ── Meet Your Mentor ── */}
      <section style={{ padding: SECY + ' ' + PADX }}>
        <div style={{ maxWidth: 820, margin: '0 auto' }}>
          <Reveal><SectionHead eyebrow={LANDING.founder.eyebrow} heading={LANDING.founder.heading} maxW={640} /></Reveal>
          <Reveal>
            <div style={{ background: '#fff', border: `1px solid ${LINE}`, borderRadius: CARD_RADIUS, boxShadow: CARD_SHADOW, padding: 'clamp(22px,4vw,34px)', display: 'flex', gap: 24, alignItems: 'flex-start', flexWrap: 'wrap' }} className="rm-founder-row">
              <div style={{ flexShrink: 0, textAlign: 'center', width: 150, margin: '0 auto' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/images/founder-mvm.jpg" alt={LANDING.founder.name} style={{ width: 130, height: 130, borderRadius: '50%', objectFit: 'cover', objectPosition: 'top', border: `3px solid ${LINE}` }} />
                <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 14, flexWrap: 'wrap' }}>
                  {LANDING.founder.stats.map((s) => (
                    <div key={s.l} style={{ background: '#FAF6F0', borderRadius: 10, padding: '6px 10px', textAlign: 'center' }}>
                      <div style={{ fontWeight: 800, fontSize: 13, color: PURPLE }}>{s.v}</div>
                      <div style={{ color: TEXT3, fontSize: 9.5, fontWeight: 700 }}>{s.l}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ flex: 1, minWidth: 260 }}>
                <blockquote style={{ margin: '0 0 14px', paddingLeft: 16, borderLeft: `3px solid ${PURPLE}`, color: '#2E1A35', fontSize: 16.5, lineHeight: 1.55, fontStyle: 'italic' }}>&ldquo;{LANDING.founder.quote}&rdquo;</blockquote>
                <p style={{ color: TEXT2, fontSize: 14.5, lineHeight: 1.65, margin: '0 0 14px' }}>{LANDING.founder.body}</p>
                <div style={{ fontWeight: 800, fontSize: 14.5 }}>{LANDING.founder.name}</div>
                <div style={{ color: TEXT3, fontSize: 12.5 }}>{LANDING.founder.role}</div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── FAQ: accordion ── */}
      <section id="faq" style={{ background: '#FAF6F0', borderTop: `1px solid ${LINE}`, borderBottom: `1px solid ${LINE}`, padding: SECY + ' ' + PADX }}>
        <div style={{ maxWidth: 740, margin: '0 auto' }}>
          <Reveal><SectionHead eyebrow={LANDING.faq.eyebrow} heading={LANDING.faq.heading} maxW={520} /></Reveal>
          <Reveal>
            <div style={{ background: '#fff', borderRadius: CARD_RADIUS, boxShadow: CARD_SHADOW, padding: 'clamp(10px,3vw,28px)' }}>
              {LANDING.faq.items.map((it, i) => <FaqItem key={it.q} q={it.q} a={it.a} open={i === 0} />)}
            </div>
          </Reveal>
          <Reveal><div style={{ textAlign: 'center', marginTop: 28 }}>{CTA('faq')}</div></Reveal>
        </div>
      </section>

      {/* ── Apply: direct ₹199 booking CTA, no qualification quiz — the
             refundable deposit itself is the filter. ── */}
      <section id="apply" style={{ background: '#2E1A35', padding: SECY + ' ' + PADX }}>
        <div style={{ maxWidth: 720, margin: '0 auto', textAlign: 'center' }}>
          <Reveal>
            <div className="rm-eyebrow" style={{ marginBottom: 12, color: '#E4C879' }}>{LANDING.apply.eyebrow}</div>
            <h2 className="rm-serif" style={{ fontSize: 'clamp(24px,4vw,36px)', margin: 0, fontWeight: 800, color: '#fff', lineHeight: 1.15 }}>{LANDING.apply.heading}</h2>
            <p style={{ color: 'rgba(255,255,255,.65)', fontSize: 15, lineHeight: 1.6, maxWidth: 520, margin: '14px auto 0' }}>{LANDING.apply.sub}</p>
          </Reveal>
          <Reveal>
            <div style={{ maxWidth: 420, margin: '28px auto 0', background: '#fff', borderRadius: 20, padding: 'clamp(24px,5vw,34px)', boxShadow: '0 30px 70px -30px rgba(0,0,0,.5)' }}>
              <div className="rm-serif" style={{ fontSize: 44, fontWeight: 800, color: PURPLE }}>₹199</div>
              <div style={{ color: TEXT3, fontSize: 13, fontWeight: 700, marginBottom: 20 }}>{LANDING.apply.priceLine}</div>
              <Btn onClick={() => goApply('apply_section')} full style={{ padding: '17px 28px', fontSize: 17 }}>{LANDING.ctaPrimary} <span aria-hidden>→</span></Btn>
              <p style={{ color: TEXT3, fontSize: 12.5, marginTop: 14, lineHeight: 1.5 }}>{LANDING.apply.micro}</p>
            </div>
            <p style={{ color: '#E4C879', fontSize: 13, fontWeight: 800, marginTop: 20, maxWidth: 520, marginLeft: 'auto', marginRight: 'auto' }}>{LANDING.guaranteeShort}</p>
          </Reveal>
        </div>
      </section>

      {/* ── Reach ── */}
      <section style={{ padding: '26px ' + PADX, textAlign: 'center' }}>
        <p style={{ color: TEXT2, fontSize: 13.5, margin: 0 }}>
          <span style={{ fontWeight: 800, color: '#2E1A35' }}>{LANDING.reach.stat}</span> {LANDING.reach.body}
        </p>
      </section>

      <Footer legal={LEGAL} />

      {/* Sticky mobile CTA */}
      <div className="rm-sticky-cta" style={{ position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 60, padding: '10px 14px calc(10px + env(safe-area-inset-bottom))', background: 'rgba(255,255,255,.92)', backdropFilter: 'saturate(140%) blur(12px)', borderTop: `1px solid ${LINE}`, transform: showSticky ? 'translateY(0)' : 'translateY(120%)', transition: 'transform .3s cubic-bezier(.2,.7,.2,1)', boxShadow: '0 -8px 30px -20px rgba(46,26,53,.5)' }}>
        <button onClick={() => goApply('sticky')} className="rm-focus" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', gap: 4, background: 'linear-gradient(180deg,#6b39a0,#552879)', color: '#fff', border: 'none', borderRadius: 999, padding: '15px 20px', fontSize: 16, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>{LANDING.ctaPrimary} <span aria-hidden>→</span></button>
      </div>

      <style>{`
        .rm-sticky-cta{display:none}
        @media(max-width:768px){.rm-sticky-cta{display:block}footer{padding-bottom:100px!important}}
        @media(max-width:900px){.rm-hero{flex-direction:column;text-align:center}.rm-hero > div:first-child{text-align:center}.rm-hero p{margin-left:auto;margin-right:auto}.rm-hero-ctas,.rm-hero-guarantee,.rm-hero-rating>div{justify-content:center!important}}
        @media(min-width:561px) and (max-width:899px){.rm-grid3{grid-template-columns:1fr!important}}
        @media(max-width:560px){.rm-grid2,.rm-grid3,.rm-grid4{grid-template-columns:1fr!important}.rm-founder-row{flex-direction:column;align-items:center!important;text-align:center}}
      `}</style>
    </div>
  )
}
