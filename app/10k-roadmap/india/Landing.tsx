'use client'
import './landing.css'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import IndiaExitPopup from './ExitPopup'
import { CASE_STUDIES } from '@/lib/case-studies'
import { VIDEO_REVIEWS } from '@/components/VideoWall'
import { LANDING, LEGAL, MANISHA, PRESS, RATING } from './config'
import { useUtm } from '../ui'
import { track } from '../track'

const PARTNERS = [
  {
    name: 'Indradip Ghosh',
    role: 'Founder and Principal Consultant',
    credential: 'Consumer Psychologist, University of California, Berkeley',
    recruitedBy: 'Recruited by Google & Anthropic',
    image: '/images/founder-golden-gate.webp',
  },
  {
    name: MANISHA.name,
    role: 'Director, Head of Growth',
    image: MANISHA.avatar,
  },
]

const INCLUSIONS = [
  'A 60-minute review with Indrodip and Manisha',
  'A review of your offer, positioning, and ideal buyer',
  'A personalized audit PDF and 100-day roadmap',
  'A digital copy of Expertise to Income',
  'An AI prompt toolkit shaped around your plan',
  'A call recording, only if you consent',
]

const PROCESS = [
  { title: 'Start with your context', text: 'Bring your offer, goals, and the way clients find you today.' },
  { title: 'Find the point to work on', text: 'Review your positioning, ideal buyer, and client journey with both partners.' },
  { title: 'Choose a practical next move', text: 'Leave with priorities, then receive your written roadmap within 48 hours.' },
]

const FEATURED_CASES = ['abbas-jamie', 'laurie-gerber', 'amalia', 'max', 'kate-winchester', 'susan-taylor']
  .map((slug) => CASE_STUDIES.find((study) => study.slug === slug))
  .filter((study): study is (typeof CASE_STUDIES)[number] => Boolean(study))

const INDIA_VIDEO_REVIEWS = [
  ...VIDEO_REVIEWS.slice(0, 7),
  ...VIDEO_REVIEWS.filter((review) => review.src.includes('1002983741962578') || review.src.includes('1000671825545007')),
]

const WISTIA_POSTERS: Record<string, string> = {
  '5yh07cwlui': 'https://embed-ssl.wistia.com/deliveries/d9074bc29ffa866e0506e9c6bc48f7042db286eb.jpg?image_crop_resized=960x540',
  'tnorqgs7dj': 'https://embed-ssl.wistia.com/deliveries/0ab9d9f3bcea82a1fec36cfefbd8ce6d140745c1.jpg?image_crop_resized=960x540',
  'yz9coq1jwd': 'https://embed-ssl.wistia.com/deliveries/67c58111b5465a6aedff2ee0d83136ed34fd1f1f.jpg?image_crop_resized=960x540',
  'ukn3ruu2nr': 'https://embed-ssl.wistia.com/deliveries/6e5c87a4f2ce1db81996a09a121ec6000ba7d847.jpg?image_crop_resized=960x540',
  'tikovukneu': 'https://embed-ssl.wistia.com/deliveries/d4d294be7abfa4d092ee62e7afa475c0832822ed.jpg?image_crop_resized=960x540',
  'oni4jy3cuf': 'https://embed-ssl.wistia.com/deliveries/700589756a1d69e67a952805afd03c7f97a3ae90.jpg?image_crop_resized=960x540',
  'tcqebjpgyk': 'https://embed-ssl.wistia.com/deliveries/9512736b0e273abbe506d78059eb08d721296bdf.jpg?image_crop_resized=960x540',
  '1002983741962578': '/clients/testimonial-posters/1002983741962578.webp',
  '1000671825545007': '/clients/testimonial-posters/1000671825545007.webp',
}

const FAQS = [
  {
    question: 'Who will I speak with?',
    answer: 'Your session is with Indradip Ghosh and Manisha Satpute, the two partners shown on this page.',
  },
  {
    question: 'What does the ₹199 deposit mean?',
    answer: 'It is a one-time booking deposit, not a recurring charge. The exact refund and guarantee terms are shown before you book.',
  },
  {
    question: 'What will I receive after the session?',
    answer: 'Your personalized audit PDF and 100-day roadmap arrive within 48 hours. The digital book and AI prompt toolkit are included. A call recording is shared only with your consent.',
  },
  {
    question: 'I already use AI. What does the audit add?',
    answer: 'AI can help you explore options. The audit adds a human review of your specific offer, ideal buyer, and client path, so you can decide which next step fits your business.',
  },
  {
    question: 'Do I have to join a program afterward?',
    answer: 'No. The session is a working review of your business. You can use the audit and roadmap without joining another service.',
  },
]

function Check() {
  return <span className="check-mark" aria-hidden="true">✓</span>
}

function BookCover() {
  return (
    <div className="book-mockup" role="img" aria-label="Expertise to Income by Indradip Ghosh and Christine Mathison">
      <span className="book-page book-page--why" aria-hidden="true" />
      <span className="book-page book-page--diagnostic" aria-hidden="true" />
      <span className="book-page book-page--asset" aria-hidden="true" />
      <span className="book-page book-page--audience" aria-hidden="true" />
      <div className="book-preview" aria-hidden="true" />
      <span className="book-mockup__pages" aria-hidden="true" />
    </div>
  )
}

const BOOK_CHAPTERS = [
  'Understand Your Why', 'Diagnose Your Current Situation', 'The Asset Mindset',
  'Find Your Perfect Audience', 'Design Your First Digital Product',
  'Create a Simple Offer That Sells Itself', 'The Organic Content System',
  'Your Simple Launch Plan', 'Mindset for Consistent $10K Months',
]

function ClientVideoTestimonials() {
  const [activeVideo, setActiveVideo] = useState<string | null>(null)
  return (
    <div className="video-testimonials">
      {INDIA_VIDEO_REVIEWS.map((review, index) => {
        const id = review.src.match(/iframe\/([^?]+)/)?.[1] || review.src
        const isFacebook = review.src.includes('facebook.com')
        const posterKey = id.match(/(?:videos%2F|reel%2F)(\d+)/)?.[1] || id
        const poster = WISTIA_POSTERS[posterKey]
        return (
          <figure className="video-testimonial" key={review.src}>
            {activeVideo === id ? (
              <iframe
                src={isFacebook ? review.src : `https://fast.wistia.net/embed/iframe/${id}?seo=true&videoFoam=false&autoplay=1`}
                title={`Client video testimonial ${index + 1}`}
                allow="autoplay; encrypted-media; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <button
                type="button"
                className="video-testimonial__poster"
                style={poster ? { backgroundImage: `linear-gradient(180deg, transparent 45%, var(--color-ink) 100%), url("${poster}")` } : undefined}
                onClick={() => setActiveVideo(id)}
                aria-label={`Play client video testimonial ${index + 1}`}
              >
                <span className="video-testimonial__play" aria-hidden="true">
                  <svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z" fill="currentColor" /></svg>
                </span>
                <span className="video-testimonial__caption">Client video review {String(index + 1).padStart(2, '0')}</span>
              </button>
            )}
          </figure>
        )
      })}
    </div>
  )
}

export default function Landing() {
  const router = useRouter()
  const [stickyVisible, setStickyVisible] = useState(false)
  useUtm()

  useEffect(() => { track('page_view') }, [])
  useEffect(() => {
    const onScroll = () => setStickyVisible(window.scrollY > 520)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  useEffect(() => { router.prefetch('/10k-roadmap/india/pay') }, [router])

  const goApply = (where: string) => {
    track('cta_click', { where })
    router.push('/10k-roadmap/india/pay')
  }

  return (
    <div className="india-landing">
      <a className="skip" href="#main">Skip to content</a>

      <header className="nav">
        <div className="container nav__inner">
          <a className="nav__brand" href="/india" aria-label="The5th Global Consulting India audit home">
            <Image src="/images/the5th-logo-colorful.png" alt="The5th Global Consulting" width={192} height={75} priority />
          </a>
          <nav className="nav__links" aria-label="Page sections">
            <a href="#included">What you receive</a>
            <a href="#client-work">Client work</a>
            <a href="#voices">Video reviews</a>
            <a href="#partners">Meet the partners</a>
          </nav>
          <button type="button" className="btn nav__cta" onClick={() => goApply('nav')}>Book Your ₹199 Session</button>
        </div>
      </header>

      <main id="main">
        <section className="hero">
          <div className="container hero__grid">
            <div className="hero__text">
              <p className="hero__eyebrow">Your ₹10 Lakh/Month Business Roadmap</p>
              <h1>{LANDING.headline}</h1>
              <p className="hero__lede">{LANDING.headlineSub}</p>
              <div className="hero__actions"><button type="button" className="btn hero__cta" onClick={() => goApply('hero')}>Book Your ₹199 Strategy Session</button><a className="hero__secondary" href="#process">See How It Works</a></div>
              <p className="hero__note">₹199 one-time booking deposit. No recurring charge. Refund terms apply.</p>
              <div className="hero__guarantee"><strong>200% Guarantee for Qualified Applicants</strong><span>The ₹400 total refund (₹199 + ₹201) applies only when we confirm your coaching business is a fit, you have experience, a prior sale, and capacity to consider coaching, then fail to deliver the promised audit. If we decline you, request the standard ₹199 refund. Disliking it alone does not qualify for the extra ₹201.</span></div>
              <p className="hero__authority">AI Startup Founder, ~$6M Startup Valuation, Backed by University of California alumni</p>
              <p className="hero__rating"><strong>{RATING.score}</strong><span>{RATING.text}</span></p>
              <div className="hero__facts" aria-label="Session details">
                <span>With both partners</span><span>On Zoom</span>
              </div>
            </div>

            <div className="hero__partners" aria-label="Meet your audit partners">
              {PARTNERS.map((person) => (
                <article className="hero-person" key={person.name}>
                  <div className="hero-person__photo">
                    <Image src={person.image} alt={person.name} width={300} height={360} sizes="(max-width: 700px) 44vw, 280px" priority />
                  </div>
                  <div className="hero-person__caption">
                    <strong>{person.name}</strong>
                    <span>{person.role}</span>
                    {person.credential && <span className="hero-person__credential"><b>{person.credential}</b><span>{person.recruitedBy}</span></span>}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="featured-strip" aria-label={PRESS.label}>
          <div className="container featured-strip__inner">
            <p>{PRESS.label}</p>
            <div className="featured-strip__names">
              {PRESS.items.map((publication) => <span key={publication}>{publication}</span>)}
            </div>
          </div>
        </section>

        <section id="included" className="included band-s">
          <div className="container included__grid">
            <div>
              <h2>What you get from the audit</h2>
              <p className="section-lede">A focused review, followed by a plan built around the business you bring.</p>
              <ul className="included__list">
                {INCLUSIONS.map((item) => <li key={item}><Check /><span>{item}</span></li>)}
              </ul>
              <p className="included__delivery">Your written audit and roadmap arrive within 48 hours of your session.</p>
              <div className="included__sample">
                <a href="/documents/sample-audit-report.pdf" target="_blank" rel="noopener noreferrer" onClick={() => track('cta_click', { where: 'india_sample_pdf' })}>View a 17-page sample audit</a>
                <span>Illustrative example; figures are shown in USD.</span>
              </div>
            </div>

            <aside className="book-card" aria-label="Included digital book">
              <div className="book-card__visual"><BookCover /></div>
              <div className="book-card__copy">
                <p className="book-card__label"><span>Included to keep</span><span>9 chapters. Original price: ₹425.</span></p>
                <h3>Expertise to Income</h3>
                <p>Your complete guide to building a digital-product business that can generate $10,000 a month without a team, ads, or years of experience.</p>
                <ol className="book-card__chapters">{BOOK_CHAPTERS.map((chapter) => <li key={chapter}>{chapter}</li>)}</ol>
                <p className="book-card__authors">By Indradip Ghosh &amp; Christine Mathison</p>
              </div>
            </aside>
          </div>
        </section>

        <section id="process" className="process band-s">
          <div className="container">
            <div className="section-heading">
              <h2>A focused audit, in three steps</h2>
            </div>
            <ol className="process__steps">
              {PROCESS.map((step, i) => (
                <li className="process-step" key={step.title}>
                  <span className="process-step__number">{String(i + 1).padStart(2, '0')}</span>
                  <div><h3>{step.title}</h3><p>{step.text}</p></div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section id="client-work" className="client-work band-s">
          <div className="container client-work__inner">
            <div className="client-work__heading">
              <h2>Selected client stories. The work behind the numbers.</h2>
              <p>See where each business started, what we built, and the reported result. Outcomes vary by business and market.</p>
            </div>
            <div className="client-work__stories">
              {FEATURED_CASES.map((study, index) => (
                <article className="case-study-card" key={study.slug}>
                  <div className="case-study-card__image">
                    {study.image && <Image src={study.image} alt={`${study.name}, client case study`} fill sizes="(max-width: 768px) 100vw, (max-width: 1280px) 48vw, 32vw" loading="eager" />}
                    <span className="case-study-card__index">0{index + 1}</span>
                  </div>
                  <div className="case-study-card__copy">
                    <h3>{study.name}</h3>
                    <p className="case-story__meta">{study.location || study.category} / {study.niche}</p>
                    <p className="case-story__tagline">{study.tagline}</p>
                    <div className="case-story__result">
                      <strong>{study.headline.v}</strong>
                      <span>{study.headline.period} · USD</span>
                    </div>
                    <p className="case-study-card__work">{study.whatWeDid}</p>
                    {study.metrics && <div className="case-story__metrics">{study.metrics.slice(0, 2).map((metric) => <span key={metric.l}><b>{metric.v}</b>{metric.l}</span>)}</div>}
                  </div>
                </article>
              ))}
            </div>
            <div className="client-work__foot">
              <p>Published client outcomes shown in USD. Individual results vary; these are not typical or guaranteed results.</p>
              <a href="/results">Explore the case study library</a>
            </div>
            <div className="proof-booking"><p>Want a clearer next move for your business?</p><button type="button" className="btn btn--inverse" onClick={() => goApply('case-study-proof')}>Book the audit for ₹199</button><span>Refundable booking deposit · no recurring charge</span></div>
          </div>
        </section>

        <section id="voices" className="voices band-s">
          <div className="container voices__inner">
            <div className="voices__heading">
              <h2>Hear from clients in their own words.</h2>
              <p>Hear directly from clients after their strategy sessions. Tap any review to play.</p>
            </div>
            <ClientVideoTestimonials />
            <div className="voices__cta"><span>See what a focused review could uncover in your business.</span><button type="button" className="btn" onClick={() => goApply('video-testimonials')}>Book the ₹199 audit</button></div>
          </div>
        </section>

        <section id="partners" className="partners band-s">
          <div className="container partners__inner">
            <div className="section-heading">
              <h2>Meet the people behind your audit</h2>
            </div>
            <div className="partner-bios">
              <article className="partner-bio">
                <div className="partner-bio__initial">I</div>
                <div>
                  <h3>Indradip Ghosh</h3>
                  <p className="partner-bio__role">Founder and Principal Consultant</p>
                  <p>{LANDING.heroCard.credential}. Recruited by Google and Anthropic. Founder of The5th and an AI startup with an approximate $6M valuation.</p>
                  <p className="partner-bio__proof">{LANDING.heroCard.featuredIn}. The startup is backed by University of California alumni. {LANDING.founderCredsNote}</p>
                </div>
              </article>
              <article className="partner-bio">
                <div className="partner-bio__initial">M</div>
                <div><h3>{MANISHA.name}</h3><p>Director, Head of Growth. {MANISHA.bio}</p></div>
              </article>
            </div>
              <p className="partners__reach">The5th has advised 76 coaches and consultants across 12 countries. Individual results vary.</p>
          </div>
        </section>

        <section id="faq" className="faq band-s">
          <div className="container faq__inner">
            <div className="section-heading"><h2>Questions before you book</h2></div>
            <div className="faq__list">
              {FAQS.map((item) => (
                <details className="faq__item" key={item.question}>
                  <summary>{item.question}<span aria-hidden="true">+</span></summary>
                  <p>{item.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="booking band-s">
          <div className="container booking__inner">
            <div>
              <h2>Get a clearer next step</h2>
              <p className="booking__lede">Review your business with Indrodip and Manisha, then decide what you want to do with the plan.</p>
            </div>
            <div className="booking__action">
              <span className="booking__price">₹199</span>
              <span className="booking__price-note">Refundable booking deposit</span>
              <button type="button" className="btn btn--inverse" onClick={() => goApply('final')}>{LANDING.ctaPrimary}</button>
              <p><a href="/refund#india-roadmap">Read refund eligibility and terms</a></p>
            </div>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="container site-footer__inner">
          <Image className="site-footer__brand" src="/images/the5th-logo-colorful.png" alt="The5th Global Consulting" width={192} height={75} />
          <div className="site-footer__links">
            <a href="/privacy">Privacy Policy</a><a href="/disclaimer">Disclaimer</a><a href="/refund">Refund Policy</a>
            {LEGAL.links.filter((link) => !['Privacy Policy', 'Privacy', 'Disclaimer', 'Refund Policy'].includes(link.label)).map((link) => <a key={link.label} href={link.href}>{link.label}</a>)}
          </div>
          <p className="legal">{LEGAL.earnings}</p>
          <p className="legal">{LEGAL.meta}</p>
          <p className="copyright">{LEGAL.copyright}</p>
        </div>
      </footer>

      <div className={`sticky-cta${stickyVisible ? ' is-visible' : ''}`}>
        <button type="button" className="btn" onClick={() => goApply('sticky')}>{LANDING.ctaPrimary}</button>
      </div>
      <IndiaExitPopup onBook={() => goApply('india_exit_popup')} />
    </div>
  )
}
