'use client'
/* The Business Roadmap Audit — INDIA landing page.
   Hallmark redesign (full depth, theme Dusk): same content, wiring, booking
   flow and legal copy as before; the visual system and composition are new.
   See .hallmark/log.json and the handoff in the PR description for the
   before/after record. Keeps every link, field, handler, test hook and the
   case-study/video proof from the parent funnel; only ./config is
   India-specific. Copy still avoids asserting the reader's own financial
   status (Meta's Personal Attributes policy) and absolute "0%/guaranteed"
   claims; income claims carry "results vary" disclaimers, per Meta's
   business-opportunity rules. */
import './landing.css'
import { useEffect, useState, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { LANDING, LEGAL, RATING, PRESS } from './config'
import { REAL_PROOF } from '../config'
import { useUtm } from '../ui'
import { track } from '../track'
import VideoWall from '@/components/VideoWall'

/* Content renders visible immediately, always. A full-page capture tool
   (and some real browsers) never fires an IntersectionObserver for content
   outside the original viewport, which previously left whole sections of
   this booking page invisible — worse than losing a scroll-fade-in. This
   wrapper is kept only so call sites don't need to change if a safer
   reveal pattern is reintroduced later. */
function Reveal({ children }: { children: ReactNode; i?: number }) {
  return <>{children}</>
}

function CheckIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="12" r="10" />
      <path d="M8 12l3 3 5-6" />
    </svg>
  )
}
function GuaranteeIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="M9 12l2 2 4-4" />
    </svg>
  )
}
function Stars() {
  return (
    <span className="rating__stars" aria-hidden>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style={{ color: 'var(--color-accent-hi)' }}>
          <path d="M12 2l2.9 6.3 6.9.8-5.1 4.7 1.4 6.8L12 17.8 5.9 20.6l1.4-6.8L2.2 9.1l6.9-.8z" />
        </svg>
      ))}
    </span>
  )
}
function Rating() {
  return (
    <span className="rating">
      <Stars />
      <span className="rating__score">{RATING.score}</span>
      <span className="rating__text">{RATING.text}</span>
    </span>
  )
}
function CheckList({ items }: { items: string[] }) {
  return (
    <ul className="check-list">
      {items.map((it) => (
        <li key={it} className="check-item"><CheckIcon /><span>{it}</span></li>
      ))}
    </ul>
  )
}

/* A jagged income line settling into a flat one: the one fact the pain
   section is about, shown instead of explained in three paragraphs. */
function IncomeGraphic() {
  return (
    <svg className="pain__graphic" viewBox="0 0 640 160" fill="none" aria-hidden>
      <path d="M8 60 L100 100 L180 40 L260 120 L340 55 L420 115 L480 70" stroke="var(--color-muted)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M480 70 L560 68 L632 66" stroke="var(--color-accent-deep)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="2 10" />
      <circle cx="8" cy="60" r="5" fill="var(--color-muted)" />
      <circle cx="480" cy="70" r="5" fill="var(--color-ink)" />
      <circle cx="632" cy="66" r="6" fill="var(--color-accent)" />
    </svg>
  )
}

/* The 3-part method as a line, not a list: one connected flow instead of
   three separate paragraphs. */
function MethodGraphic() {
  return (
    <svg className="steps__graphic" viewBox="0 0 640 24" fill="none" aria-hidden>
      <line x1="20" y1="12" x2="620" y2="12" stroke="var(--color-rule)" strokeWidth="2" />
      <circle cx="20" cy="12" r="7" fill="var(--color-accent)" />
      <circle cx="320" cy="12" r="7" fill="var(--color-accent)" />
      <circle cx="620" cy="12" r="7" fill="var(--color-accent)" />
    </svg>
  )
}

export default function Landing() {
  const router = useRouter()
  const [solid, setSolid] = useState(false)
  const [stickyVisible, setStickyVisible] = useState(false)
  useUtm()
  useEffect(() => { track('page_view') }, [])
  useEffect(() => {
    const onScroll = () => { setSolid(window.scrollY > 40); setStickyVisible(window.scrollY > 620) }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  // Prefetch the ₹199 booking step so the CTA navigates instantly instead of
  // stalling on the first-ever fetch/compile of that route's chunk.
  useEffect(() => { router.prefetch('/10k-roadmap/india/pay') }, [router])
  const goApply = (where: string) => {
    track('cta_click', { where })
    router.push('/10k-roadmap/india/pay')
  }

  const testimonialProof = REAL_PROOF.filter((c) => LANDING.caseStudies.names.includes(c.name))
  // Shortened for the button itself (49a: a control must not wrap); the full line,
  // LANDING.ctaPrimary, still reads in the hero's and the apply card's fine print.
  const CTA_LABEL = 'Book the audit — ₹199'

  return (
    <div className="india-landing">
      <a className="skip" href="#main">Skip to content</a>

      {/* ── Nav: edge-aligned, turns to slate glass once scrolled ── */}
      <header className={`nav${solid ? ' is-solid' : ''}`}>
        <div className="container nav__inner">
          <a className="nav__brand" href="/10k-roadmap/india" aria-label="The5th Global Consulting">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/the5th-consulting-header-tight-white-187x80.png" alt="The5th Global Consulting" />
          </a>
          <nav className="nav__links" aria-label="Page sections">
            {LANDING.nav.map((l) => <a key={l.label} href={l.href}>{l.label}</a>)}
          </nav>
          <div className="nav__right">
            <button className="btn" onClick={() => goApply('nav')}>Book the audit</button>
          </div>
        </div>
      </header>

      <main id="main">
        {/* ── Hero: one centered statement. Headline, one sentence, the
               action — nothing else is asked to fit the fold (44b). ── */}
        <section className="hero">
          <div className="container hero__center">
            <Reveal>
              <p className="hero__kicker">A private 1:1 business audit for full-time coaches in India.</p>
              <h1>
                {LANDING.headlinePre}<span className="hero__accent">{LANDING.headlineHighlight}</span>{LANDING.headlinePost}
              </h1>
              <p className="lede">{LANDING.headlineSub}</p>
            </Reveal>
            <Reveal i={1}>
              <div className="hero__ctas">
                <button className="btn" onClick={() => goApply('hero')}>{CTA_LABEL}</button>
                <button
                  className="btn btn--quiet"
                  onClick={() => { track('cta_click', { where: 'hero_secondary' }); document.getElementById(LANDING.ctaSecondary.href.slice(1))?.scrollIntoView({ behavior: 'smooth', block: 'start' }) }}
                >
                  {LANDING.ctaSecondary.label}
                </button>
              </div>
              <p className="hero__fineprint">{LANDING.ctaMicro}</p>
              <p className="hero__guarantee"><GuaranteeIcon /><span>{LANDING.guaranteeBadge}: {LANDING.guaranteeShort}</span></p>
              <div className="hero__rating"><Rating /></div>
            </Reveal>
          </div>
        </section>

        {/* ── The photo: its own section, so the fold check above judges the
               statement alone, the way the job actually reads (12, 44b). One
               big image, then a plain caption. No card, no split columns. ── */}
        <section className="hero-stage">
          <Reveal>
            <div className="hero__stage">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="hero__photo" src="/images/founder-golden-gate.webp" alt={`${LANDING.heroCard.name}, ${LANDING.heroCard.role}`} />
            </div>
          </Reveal>

          <Reveal i={1}>
            <div className="container hero__caption">
              <div className="hero__caption-id">
                <span className="hero__caption-name">{LANDING.heroCard.name}</span>
                <span className="hero__caption-role">{LANDING.heroCard.role}</span>
              </div>
              <div className="hero__caption-credential">{LANDING.heroCard.credential}</div>
              <div className="hero__caption-chips">
                {LANDING.heroCard.chips.map((c) => (
                  <span key={c.t} className="hero__caption-chip"><b>{c.t}</b> {c.s}</span>
                ))}
              </div>
            </div>
          </Reveal>
        </section>

        {/* ── Pain: named in the reader's own voice before any pitch ──
            The session facts and the trust row open the section, just below
            the fold, outside the hero's own screen (layout.md § 6: the hero
            is the first screen only). ── */}
        <section className="pain band-s">
          <div className="container">
            <Reveal>
              <div className="figures">
                {LANDING.stats.map((s) => (
                  <div key={s.l}>
                    <b>{s.v}</b>
                    <span>{s.l}</span>
                  </div>
                ))}
              </div>
            </Reveal>
            <div className="trust">
              <div className="trust__row">
                {PRESS.items.map((p) => <span key={p}>{p}</span>)}
              </div>
              <p className="trust__label">{PRESS.label}</p>
            </div>
          </div>
          <div className="container pain__inner">
            <Reveal><h2>{LANDING.pain.heading}</h2></Reveal>
            <Reveal i={1}><IncomeGraphic /></Reveal>
            <Reveal i={1}>
              <div className="pain__lines">
                {LANDING.pain.lines.map((l) => <p key={l}>{l}</p>)}
              </div>
            </Reveal>
            <Reveal i={2}><p className="pain__close">{LANDING.pain.close}</p></Reveal>
          </div>
        </section>

        {/* ── Mechanism: the named 3-step method, then the next step ── */}
        <section id="clarity" className="clarity-band band-s">
          <div className="container">
            <Reveal>
              <div className="steps__head">
                <h2>{LANDING.mechanism.heading}</h2>
                <p className="lede">{LANDING.mechanism.sub}</p>
              </div>
            </Reveal>
            <Reveal i={1}>
              <div className="steps__flow">
                <MethodGraphic />
                <ol className="steps__list">
                  {LANDING.mechanism.steps.map((s) => (
                    <li key={s.n} className="step">
                      <span className="step__num" />
                      <h3>{s.t}</h3>
                      <p>{s.d}</p>
                    </li>
                  ))}
                </ol>
              </div>
            </Reveal>
            <Reveal i={2}><p className="steps__close">{LANDING.mechanism.close}</p></Reveal>
            <Reveal i={3}>
              <div className="clarity__next">
                <div>
                  <h3>{LANDING.clarity.nextStep.heading}</h3>
                  <p>{LANDING.clarity.nextStep.sub}</p>
                </div>
                <button className="btn" onClick={() => goApply('clarity_next_step')}>{CTA_LABEL}</button>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ── Who it's for, and what changes once the bottleneck is fixed ── */}
        <section id="who">
          <div className="container">
            <Reveal>
              <div className="qualify__head">
                <h2>{LANDING.whoIsThis.heading}</h2>
                <p className="lede">{LANDING.whoIsThis.sub}</p>
              </div>
            </Reveal>
            <Reveal i={1}>
              <div className="qualify__cols">
                <div className="qualify__col">
                  <h3>Is this you?</h3>
                  <CheckList items={LANDING.whoIsThis.items} />
                </div>
                <div className="qualify__col">
                  <h3>{LANDING.transformation.heading}</h3>
                  <CheckList items={LANDING.transformation.items} />
                </div>
              </div>
              <div className="qualify__banner">
                <p>{LANDING.whoIsThis.bannerHeading}</p>
                <button className="btn" onClick={() => goApply('who_banner')}>{CTA_LABEL}</button>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ── Proof: real case studies and real on-camera reviews ── */}
        <section id="proof" className="proof">
          <div className="container">
            <Reveal>
              <div className="proof__head">
                <h2>{LANDING.proof.heading}</h2>
              </div>
            </Reveal>
            <Reveal i={1}>
              <div className="proof__banner"><span>{LANDING.proof.revenueLine}</span></div>
            </Reveal>
            <Reveal i={2}>
              <div className="proof__grid">
                {testimonialProof.map((c) => (
                  <div key={c.name} className="proof__card">
                    {c.photo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img className="proof__avatar" src={c.photo} alt={c.name} />
                    ) : (
                      <span className="proof__avatar proof__avatar--mono" aria-hidden>{c.name[0]}</span>
                    )}
                    <div>
                      <div className="proof__result">{c.result}</div>
                      <div className="proof__name">{c.name} <span className="proof__role">{c.role.split('·')[0].trim()}</span></div>
                    </div>
                  </div>
                ))}
              </div>
            </Reveal>
            <p className="proof__disclaimer">{LANDING.proof.disclaimer}</p>

            <div className="videos">
              <Reveal>
                <div className="videos__head">
                  <h3>Hear it from them directly.</h3>
                  <p>Unscripted, on-camera reactions from clients. Tap any clip to play.</p>
                </div>
              </Reveal>
              <Reveal i={1}><VideoWall columns={3} limit={12} /></Reveal>
            </div>

            <Reveal i={2}><div className="proof__cta"><button className="btn" onClick={() => goApply('proof')}>{CTA_LABEL}</button></div></Reveal>
          </div>
        </section>

        {/* ── Meet your mentor ── */}
        <section className="founder-band">
          <div className="container">
            <Reveal><h2 style={{ marginBottom: 'var(--space-2xl)', maxWidth: '36rem', marginInline: 'auto', textAlign: 'center', fontSize: 'var(--text-display-s)' }}>{LANDING.founder.heading}</h2></Reveal>
            <Reveal i={1}>
              <div className="founder founder__row glass-panel">
                <div className="founder__photo-wrap">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img className="founder__photo" src="/images/founder.png" alt={LANDING.founder.name} />
                  <div className="founder__stats">
                    {LANDING.founder.stats.map((s) => (
                      <div key={s.l} className="founder__stat"><b>{s.v}</b><span>{s.l}</span></div>
                    ))}
                  </div>
                </div>
                <div>
                  <blockquote>&ldquo;{LANDING.founder.quote}&rdquo;</blockquote>
                  <p className="founder__body">{LANDING.founder.body}</p>
                  <div className="founder__name">{LANDING.founder.name}</div>
                  <div className="founder__role">{LANDING.founder.role}</div>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section id="faq" className="faq-band band-s">
          <div className="container">
            <Reveal>
              <div className="faq__head">
                <h2>{LANDING.faq.heading}</h2>
              </div>
            </Reveal>
            <Reveal i={1}>
              <div className="faq__list">
                {LANDING.faq.items.map((it, i) => (
                  <details key={it.q} className="faq__item" open={i === 0}>
                    <summary>{it.q}<span className="faq__icon" aria-hidden>+</span></summary>
                    <p>{it.a}</p>
                  </details>
                ))}
              </div>
            </Reveal>
          </div>
        </section>

        {/* ── Apply: direct ₹199 booking, the refundable deposit is the filter ── */}
        <section id="apply" className="apply">
          <div className="container apply__inner">
            <Reveal>
              <h2>{LANDING.apply.heading}</h2>
              <p className="lede">{LANDING.apply.sub}</p>
            </Reveal>
            <Reveal i={1}>
              <ul className="apply__points">
                {LANDING.apply.points.map((p) => <li key={p}><CheckIcon /><span>{p}</span></li>)}
              </ul>
            </Reveal>
            <Reveal i={2}>
              <div className="apply__card glass-panel">
                <span className="apply__badge"><GuaranteeIcon />{LANDING.guaranteeBadge}</span>
                <div className="apply__price">₹199</div>
                <div className="apply__price-line">{LANDING.apply.priceLine}</div>
                <button className="btn btn--full" onClick={() => goApply('apply_section')}>{CTA_LABEL}</button>
                <p className="apply__micro">{LANDING.apply.micro}</p>
              </div>
            </Reveal>
            <Reveal i={3}>
              <div className="apply__guarantee-full">
                <span className="apply__guarantee-badge">{LANDING.guaranteeBadge}</span>
                <h3>{LANDING.guaranteeFull.heading}</h3>
                <p>{LANDING.guaranteeFull.body}</p>
                <p className="apply__guarantee-sub">{LANDING.guaranteeFull.sub}</p>
                <p className="apply__guarantee-terms">{LANDING.guaranteeFull.terms}</p>
              </div>
            </Reveal>
          </div>
        </section>

      </main>

      {/* ── Footer (mast), opening on the reach line ── */}
      <footer className="site-footer">
        <div className="container site-footer__inner">
          <p className="reach"><b>{LANDING.reach.stat}</b> {LANDING.reach.body}</p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="site-footer__brand" src="/images/logo-white.png" alt="The5th Global Consulting" />
          <div className="site-footer__links">
            {LEGAL.links.map((l) => <a key={l.label} href={l.href}>{l.label}</a>)}
          </div>
          <p className="legal">{LEGAL.earnings}</p>
          <p className="legal">{LEGAL.meta}</p>
          <p className="copyright">{LEGAL.copyright}</p>
        </div>
      </footer>

      {/* Sticky mobile CTA */}
      <div className={`sticky-cta${stickyVisible ? ' is-visible' : ''}`}>
        <button className="btn btn--full" onClick={() => goApply('sticky')}>{CTA_LABEL}</button>
      </div>
    </div>
  )
}
