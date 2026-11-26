'use client'
/* Sales page for the $4.99 ebook "Expertise to Income". Same dark/lime system
   as /10k-roadmap (shared Fonts/Header/Btn/Reveal/Footer kit). Long-form
   letter structure, but every claim comes from the book itself or from the
   existing client case studies: no invented ratings, review counts, awards
   or scarcity. */
import { useEffect } from 'react'
import { Fonts, Header, Btn, Reveal, Footer } from '../10k-roadmap/ui'
import { T, LEGAL, REAL_PROOF } from '../10k-roadmap/config'
import { track } from '../10k-roadmap/track'
import { DIAGRAMS } from './diagrams'
import { BOOK_PRICE, BOOK_PAGES, BOOK_CHAPTERS, BOOK_GUARANTEE_DAYS, BOOK_CHECKOUT_PATH, BOOK_TITLE, BOOK_SUBTITLE, BOOK_LEGAL, CHAPTERS, FAQ } from './config'

const WRAP: React.CSSProperties = { maxWidth: 1080, margin: '0 auto', padding: '0 clamp(16px,4vw,24px)' }
const SEC: React.CSSProperties = { padding: 'clamp(54px,8vw,96px) 0' }
const CARD: React.CSSProperties = { background: T.surface, border: `1px solid ${T.line}`, borderRadius: T.radius }
const IMG_LIME = '0 30px 80px -30px rgba(201,255,72,.35)'

function Diagram({ k, max }: { k: string; max?: number }) {
  return <div style={{ maxWidth: max, margin: '0 auto' }} dangerouslySetInnerHTML={{ __html: DIAGRAMS[k] }} />
}
function Paper({ k }: { k: string }) {
  return <div style={{ background: '#FFFDF7', borderRadius: 18, padding: 'clamp(12px,2vw,20px)', boxShadow: '0 24px 60px -30px rgba(0,0,0,.8)' }}><Diagram k={k} /></div>
}
function Check() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, marginTop: 2 }}><circle cx="12" cy="12" r="11" fill={T.accent} /><path d="M7 12.5l3.2 3.2L17 9" stroke={T.accentText} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
}
function Head({ eyebrow, title, sub, center = true }: { eyebrow: string; title: React.ReactNode; sub?: string; center?: boolean }) {
  return (
    <div style={{ textAlign: center ? 'center' : 'left', maxWidth: 760, margin: center ? '0 auto' : 0 }}>
      <div className="rm-eyebrow" style={{ marginBottom: 14 }}>{eyebrow}</div>
      <h2 className="rm-serif" style={{ fontSize: 'clamp(30px,4.6vw,48px)', margin: 0 }}>{title}</h2>
      {sub && <p style={{ color: T.text2, fontSize: 'clamp(16px,2vw,18px)', lineHeight: 1.65, margin: '16px 0 0' }}>{sub}</p>}
    </div>
  )
}
function Cta({ where, label, big }: { where: string; label?: string; big?: boolean }) {
  return (
    <Btn href={BOOK_CHECKOUT_PATH} onClick={() => track('book_cta_click', { where })} style={big ? { fontSize: 18, padding: '19px 40px', minHeight: 62 } : undefined}>
      {label || `Get Instant Access: ${BOOK_PRICE.label}`}
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
    </Btn>
  )
}
function Reassure() {
  return (
    <p style={{ color: T.text3, fontSize: 13, lineHeight: 1.6, margin: '14px 0 0' }}>
      Instant PDF download · {BOOK_GUARANTEE_DAYS}-day money-back guarantee · Secure checkout
    </p>
  )
}

export default function BookLanding() {
  useEffect(() => { track('book_view') }, [])
  const proof = REAL_PROOF.filter((p) => ['Shyama Prasad Goswami', 'Girish', 'Laurie'].includes(p.name))

  return (
    <div style={{ background: T.bg, color: T.text, fontFamily: T.sans, paddingBottom: 76 }}>
      <Fonts />
      <style>{`
        .bk-hero{display:grid;grid-template-columns:minmax(0,1.1fr) minmax(0,.9fr);gap:clamp(24px,5vw,64px);align-items:center}
        .bk-2{display:grid;grid-template-columns:1fr 1fr;gap:clamp(20px,4vw,48px);align-items:center}
        .bk-3{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px}
        .bk-ch{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px}
        .bk-sticky{position:fixed;left:0;right:0;bottom:0;z-index:60;display:none;padding:10px 14px calc(10px + env(safe-area-inset-bottom));background:rgba(7,10,6,.94);border-top:1px solid ${T.line};backdrop-filter:blur(10px)}
        .bk-faq summary{list-style:none;cursor:pointer}.bk-faq summary::-webkit-details-marker{display:none}
        .bk-faq[open] .bk-plus{transform:rotate(45deg)}
        @media(max-width:900px){.bk-hero,.bk-2{grid-template-columns:1fr}.bk-3,.bk-ch{grid-template-columns:1fr 1fr}.bk-sticky{display:block}.bk-hero-art{order:-1}}
        @media(max-width:560px){.bk-3,.bk-ch{grid-template-columns:1fr}}
      `}</style>

      {/* Top bar */}
      <div style={{ background: T.accent, color: T.accentText, textAlign: 'center', fontSize: 13, fontWeight: 700, padding: '9px 14px', letterSpacing: '.01em' }}>
        Instant PDF download · {BOOK_PAGES} pages · {BOOK_CHAPTERS} chapters · only {BOOK_PRICE.label}
      </div>
      <Header homeHref="/book" nav={[{ label: 'Inside the book', href: '#inside' }, { label: 'The authors', href: '#authors' }, { label: 'FAQ', href: '#faq' }]} />

      {/* ── Hero ── */}
      <section style={{ padding: 'clamp(34px,6vw,72px) 0 clamp(40px,6vw,76px)', background: 'radial-gradient(70% 60% at 78% 20%, rgba(201,255,72,.10), transparent 60%)' }}>
        <div style={WRAP} className="bk-hero">
          <Reveal>
            <div className="rm-eyebrow" style={{ marginBottom: 16 }}>{BOOK_SUBTITLE}</div>
            <h1 className="rm-serif" style={{ fontSize: 'clamp(38px,6.2vw,68px)', margin: 0 }}>
              Stop Selling Your Time. <span className="rm-mark">Start Building an Asset.</span>
            </h1>
            <p style={{ color: T.text2, fontSize: 'clamp(17px,2.1vw,20px)', lineHeight: 1.65, margin: '22px 0 0', maxWidth: 560 }}>
              A story-driven, {BOOK_PAGES}-page workbook that takes a coach, consultant or healer from <strong style={{ color: T.text }}>expertise</strong> to a first digital product, a simple offer and a launch plan. No team. No ads. No tech degree.
            </p>
            <ul style={{ listStyle: 'none', padding: 0, margin: '26px 0 0', display: 'grid', gap: 12, maxWidth: 560 }}>
              {['9 chapters that walk you from your why to launch week', 'Worksheets you fill in as you read, so you finish with real decisions', 'Word-for-word message scripts and a 7-day launch plan', 'A 30-day content map and 5 posts that sell without selling'].map((t) => (
                <li key={t} style={{ display: 'flex', gap: 12, fontSize: 16, lineHeight: 1.5, color: T.text }}><Check />{t}</li>
              ))}
            </ul>
            <div style={{ display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap', margin: '30px 0 0' }}>
              <Cta where="hero" big />
              <div style={{ lineHeight: 1.1 }}>
                <div className="rm-serif" style={{ fontSize: 40 }}>{BOOK_PRICE.label}</div>
                <div style={{ fontSize: 12.5, color: T.text3, marginTop: 4 }}>one-time, no subscription</div>
              </div>
            </div>
            <Reassure />
          </Reveal>
          <Reveal delay={0.08} style={{}}>
            <div className="bk-hero-art" style={{ position: 'relative', textAlign: 'center' }}>
              <div style={{ position: 'absolute', inset: '8% 6%', background: 'radial-gradient(closest-side, rgba(201,255,72,.28), transparent)', filter: 'blur(30px)' }} />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/book/book-3d.webp" alt={`${BOOK_TITLE}: ${BOOK_SUBTITLE}, book cover`} width={794} height={986} style={{ position: 'relative', width: 'min(100%, 440px)', height: 'auto' }} />
              <div style={{ position: 'absolute', left: '2%', top: '14%', ...CARD, padding: '10px 14px', fontSize: 13, fontWeight: 700, background: 'rgba(18,24,16,.92)' }}><span style={{ color: T.accentInk }}>{BOOK_CHAPTERS}</span> chapters</div>
              <div style={{ position: 'absolute', right: '0%', top: '40%', ...CARD, padding: '10px 14px', fontSize: 13, fontWeight: 700, background: 'rgba(18,24,16,.92)' }}><span style={{ color: T.accentInk }}>{BOOK_PAGES}</span> pages</div>
              <div style={{ position: 'absolute', left: '4%', bottom: '10%', ...CARD, padding: '10px 14px', fontSize: 13, fontWeight: 700, background: 'rgba(18,24,16,.92)' }}>Instant <span style={{ color: T.accentInk }}>PDF</span> download</div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Authors strip ── */}
      <section style={{ borderTop: `1px solid ${T.line}`, borderBottom: `1px solid ${T.line}`, background: T.surface, padding: '22px 0' }}>
        <div style={{ ...WRAP, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, flexWrap: 'wrap', textAlign: 'center' }}>
          <span style={{ display: 'flex' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/book/indrodip.jpg" alt="Indrodip Ghosh" width={48} height={48} style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover', border: `2px solid ${T.accent}` }} />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/book/christinee.jpg" alt="Christinee Mathison" width={48} height={48} style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover', border: `2px solid ${T.accent}`, marginLeft: -12 }} />
          </span>
          <span style={{ fontSize: 15, color: T.text2, lineHeight: 1.5 }}>Written by <strong style={{ color: T.text }}>Indrodip Ghosh</strong> and <strong style={{ color: T.text }}>Christinee Mathison</strong>, two equal partners behind The5th. Indrodip has guided 20+ clients to their first $10K months.</span>
        </div>
      </section>

      {/* ── Letter ── */}
      <section style={SEC}>
        <div style={{ ...WRAP, maxWidth: 760 }}>
          <Reveal>
            <div className="rm-eyebrow" style={{ marginBottom: 14 }}>From the desk of Indrodip Ghosh</div>
            <h2 className="rm-serif" style={{ fontSize: 'clamp(30px,4.6vw,46px)', margin: '0 0 28px' }}>I almost took the salary. Here is why I said no.</h2>
            <div style={{ display: 'grid', gap: 18, fontSize: 'clamp(17px,2vw,19px)', lineHeight: 1.75, color: '#D5DDCF' }}>
              <p style={{ margin: 0 }}>I did not grow up knowing how to build a business. I grew up in India, where the unspoken rule is: study hard, get a job, be safe. No one in my world was talking about digital products or online income.</p>
              <p style={{ margin: 0 }}>In 2016, my roommate and I built a working prototype of a better speaker. Then our lead engineer dropped out. No tech, no funding, no guidance. <strong style={{ color: T.text }}>It fell apart. That was my first failure. It would not be the last.</strong></p>
              <p style={{ margin: 0 }}>I tried event management. I learned digital marketing. In 2019 I launched an agency, and by 2021 we were running campaigns for international clients, including Booking.com. From the outside it looked like success. From the inside I was exhausted, trading hours for money.</p>
              <p style={{ margin: 0 }}>{`I had built a business that could not run without me. That is not a business. `}<strong style={{ color: T.text }}>That is a job with extra steps.</strong></p>
              <p style={{ margin: 0 }}>In 2023, Google offered me a position. A salary. Stability. I almost said yes. But I did not build all of this just to sit in an office, living paycheck to paycheck with no freedom.</p>
              <p style={{ margin: 0 }}>So in 2024 I started over with digital products and coaching. I stopped hiding my background and showed up as exactly who I was. My clients, mostly men and women over 45 starting their first online business, did not care where I was from. They cared that I understood their fear of being seen, of technology, of failing at something they had dreamed about for years.</p>
              <p style={{ margin: 0 }}>By the end of 2024 I had served 20+ clients and hit my first $10K month. Not with ads. Not with a big team. Just with clarity, story, and a simple system.</p>
              <p style={{ margin: 0 }}>This workbook is everything I wish I had in 2016, or 2020, or 2022. Christinee and I wrote it so you do not have to fail your way forward like I did.</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 30 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/book/indrodip.jpg" alt="Indrodip Ghosh" width={64} height={64} style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover', border: `2px solid ${T.accent}` }} />
              <div><div style={{ fontWeight: 800, fontSize: 17 }}>Indrodip Ghosh</div><div style={{ color: T.text3, fontSize: 13 }}>Co-author, founder of The5th Global Consulting</div></div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── The problem: three kinds of income ── */}
      <section style={{ ...SEC, background: T.surface, borderTop: `1px solid ${T.line}`, borderBottom: `1px solid ${T.line}` }}>
        <div style={WRAP}>
          <Reveal><Head eyebrow="Why experts stay stuck" title={<>Most experts are paid in the <span className="rm-mark">wrong kind</span> of income</>} sub="If your income stops the moment you stop working, you do not own a business. You own a job with extra steps. The book shows you how to move from trading time to building something that sells repeatedly." /></Reveal>
          <Reveal delay={0.05} style={{ marginTop: 44 }}><Diagram k="income_types" max={840} /></Reveal>
          <Reveal delay={0.05} style={{ marginTop: 28 }}><Diagram k="three_models" max={840} /></Reveal>
        </div>
      </section>

      {/* ── Inside: 9 chapters ── */}
      <section id="inside" style={SEC}>
        <div style={WRAP}>
          <Reveal><Head eyebrow="Inside the book" title={<>Nine stops. <span className="rm-mark">One road</span> from expertise to income.</>} sub="Each chapter builds on the last. You read a short story-led lesson, then fill in the worksheets that turn it into your own plan." /></Reveal>
          <Reveal delay={0.04} style={{ marginTop: 40 }}><Diagram k="roadmap_glance" max={760} /></Reveal>
          <div className="bk-ch" style={{ marginTop: 40 }}>
            {CHAPTERS.map((c, i) => (
              <Reveal key={c.n} delay={(i % 3) * 0.05}>
                <div style={{ ...CARD, padding: 20, height: '100%' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                    <span className="rm-serif" style={{ width: 38, height: 38, borderRadius: '50%', background: T.accent, color: T.accentText, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>{c.n}</span>
                    <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', color: T.text3 }}>by {c.by}</span>
                  </div>
                  <h3 style={{ fontFamily: T.serif, fontSize: 18, lineHeight: 1.25, margin: '0 0 8px', letterSpacing: '-.01em' }}>{c.title}</h3>
                  <p style={{ color: T.text2, fontSize: 14.5, lineHeight: 1.6, margin: 0 }}>{c.line}</p>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal style={{ textAlign: 'center', marginTop: 40 }}><Cta where="chapters" /><Reassure /></Reveal>
        </div>
      </section>

      {/* ── Look inside ── */}
      <section style={{ ...SEC, background: T.surface, borderTop: `1px solid ${T.line}`, borderBottom: `1px solid ${T.line}` }}>
        <div style={WRAP}>
          <Reveal><Head eyebrow="A look inside" title={<>Not a wall of text. A book you will <span className="rm-mark">actually finish.</span></>} sub={`Illustrated diagrams, worked examples, story-led lessons and worksheets on every chapter. Every chapter ends with a "write it down" page before you move on.`} /></Reveal>
          <div className="bk-2" style={{ marginTop: 44, alignItems: 'start' }}>
            {[16, 20, 53, 93].map((n, i) => (
              <Reveal key={n} delay={(i % 2) * 0.06}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`/images/book/spread-${n}.webp`} alt="Two pages from inside the book" loading="lazy" width={1400} height={1000} style={{ width: '100%', height: 'auto', borderRadius: 14, boxShadow: IMG_LIME, border: `1px solid ${T.line}` }} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Frameworks (graphs) ── */}
      <section style={SEC}>
        <div style={WRAP}>
          <Reveal><Head eyebrow="The frameworks" title={<>Simple pictures for <span className="rm-mark">big ideas</span></>} sub="You will learn the product ladder, the pain-to-product bridge, the 7-day launch path and the math of 1% a day, each with a worksheet to apply it." /></Reveal>
          <div className="bk-2" style={{ marginTop: 44, alignItems: 'start' }}>
            <Reveal><Paper k="ladder_stairs" /></Reveal>
            <Reveal delay={0.05}><Paper k="bridge" /></Reveal>
            <Reveal><Paper k="launch_path" /></Reveal>
            <Reveal delay={0.05}><Paper k="one_percent" /></Reveal>
          </div>
        </div>
      </section>

      {/* ── For / not for ── */}
      <section style={{ ...SEC, background: T.surface, borderTop: `1px solid ${T.line}`, borderBottom: `1px solid ${T.line}` }}>
        <div style={WRAP}>
          <Reveal><Head eyebrow="Is it for you?" title="This book is for you if..." /></Reveal>
          <div className="bk-2" style={{ marginTop: 40, alignItems: 'stretch' }}>
            <Reveal><div style={{ ...CARD, padding: 26, height: '100%' }}>
              <div style={{ fontWeight: 800, color: T.accentInk, fontSize: 13, letterSpacing: '.14em', textTransform: 'uppercase', marginBottom: 16 }}>Yes, if you are</div>
              <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 14 }}>
                {['A coach, consultant, healer or expert tired of trading time for money', 'Sitting on knowledge you have not yet packaged', 'Over 40 and worried you started too late', 'Not tech-savvy and want every step explained in plain English', 'Ready to do the work, not just read about it'].map((t) => <li key={t} style={{ display: 'flex', gap: 12, fontSize: 16, lineHeight: 1.5 }}><Check />{t}</li>)}
              </ul>
            </div></Reveal>
            <Reveal delay={0.06}><div style={{ ...CARD, padding: 26, height: '100%' }}>
              <div style={{ fontWeight: 800, color: T.text3, fontSize: 13, letterSpacing: '.14em', textTransform: 'uppercase', marginBottom: 16 }}>Probably not, if you want</div>
              <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 14 }}>
                {['A get-rich-quick shortcut. This is a workbook: it only works if you work it', 'A guarantee of income. No honest book can give you one', 'To skip the exercises and just skim', 'A video course. This one is read and written, chapter by chapter'].map((t) => <li key={t} style={{ display: 'flex', gap: 12, fontSize: 16, lineHeight: 1.5, color: T.text2 }}><span style={{ color: T.danger, fontWeight: 800, width: 20, textAlign: 'center', flexShrink: 0 }}>×</span>{t}</li>)}
              </ul>
            </div></Reveal>
          </div>
        </div>
      </section>

      {/* ── What you get ── */}
      <section style={SEC}>
        <div style={WRAP} className="bk-2">
          <Reveal>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/book/cover.webp" alt={`${BOOK_TITLE} cover`} loading="lazy" width={840} height={1200} style={{ width: 'min(100%, 380px)', height: 'auto', display: 'block', margin: '0 auto', borderRadius: 8, boxShadow: IMG_LIME }} />
          </Reveal>
          <Reveal delay={0.06}>
            <div className="rm-eyebrow" style={{ marginBottom: 14 }}>Everything you get</div>
            <h2 className="rm-serif" style={{ fontSize: 'clamp(28px,4vw,42px)', margin: '0 0 22px' }}>The complete workbook, instantly.</h2>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 13 }}>
              {[`The full ${BOOK_PAGES}-page ${BOOK_TITLE} workbook (PDF)`, 'Every worksheet: your why, your one person, product blueprint, offer stack', 'The 3-layer why, one-person, and pain-to-product frameworks', 'A 7-day launch plan with copy-and-personalise message scripts', 'A 30-day content map plus 5 selling-without-selling posts', 'Step-by-step set-up for Facebook, Instagram and a selling platform', 'A 5-minute daily ritual and a doubt response plan to keep you going'].map((t) => <li key={t} style={{ display: 'flex', gap: 12, fontSize: 16, lineHeight: 1.5 }}><Check />{t}</li>)}
            </ul>
            <div style={{ display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap', marginTop: 30 }}>
              <Cta where="stack" big />
              <div className="rm-serif" style={{ fontSize: 40 }}>{BOOK_PRICE.label}</div>
            </div>
            <Reassure />
          </Reveal>
        </div>
      </section>

      {/* ── Guarantee ── */}
      <section style={{ padding: '0 0 clamp(54px,8vw,96px)' }}>
        <div style={{ ...WRAP, maxWidth: 820 }}>
          <Reveal>
            <div style={{ ...CARD, padding: 'clamp(24px,4vw,40px)', display: 'flex', gap: 22, alignItems: 'center', flexWrap: 'wrap', borderColor: 'rgba(201,255,72,.35)', background: 'linear-gradient(135deg, rgba(201,255,72,.08), rgba(201,255,72,0))' }}>
              <svg width="64" height="64" viewBox="0 0 48 48" fill="none" stroke={T.accent} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><path d="M24 5l15 5v12c0 10-6 17-15 21C15 39 9 32 9 22V10z" /><path d="M17 24l5 5 9-10" /></svg>
              <div style={{ flex: '1 1 320px' }}>
                <h3 className="rm-serif" style={{ fontSize: 26, margin: '0 0 8px' }}>{BOOK_GUARANTEE_DAYS}-day money-back guarantee</h3>
                <p style={{ color: T.text2, fontSize: 16, lineHeight: 1.65, margin: 0 }}>Read it, do the first chapter, and if it is not worth every cent, email us within {BOOK_GUARANTEE_DAYS} days of purchase for a full refund. At {BOOK_PRICE.label} the risk is tiny, and we would rather you feel it was fair.</p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Authors ── */}
      <section id="authors" style={{ ...SEC, background: T.surface, borderTop: `1px solid ${T.line}`, borderBottom: `1px solid ${T.line}` }}>
        <div style={WRAP}>
          <Reveal><Head eyebrow="The authors" title="Two voices. One mission." sub="Two equal partners who share one goal: to help experts stop trading their time for money and start building something that works without them." /></Reveal>
          <div className="bk-2" style={{ marginTop: 40, alignItems: 'stretch' }}>
            {[{ img: '/images/book/indrodip.jpg', name: 'Indrodip Ghosh', tag: 'Strategy and systems', body: 'Digital product strategist who has built and rebuilt businesses from scratch: an agency serving international clients, a corporate job offer declined, and a move into digital products and coaching. He has guided 20+ clients toward their first $10K months, and wrote the Introduction and Chapters 1, 2, 3 and 8.' },
              { img: '/images/book/christinee.jpg', name: 'Christinee Mathison', tag: 'Transformation and clarity', body: 'Mindset coach with deep expertise in audience clarity and offer building. She works with coaches, consultants and healers who know they have something valuable to offer but have not yet found the system to package and sell it with confidence. She wrote Chapters 4, 5, 6, 7 and 9.' }].map((a, i) => (
              <Reveal key={a.name} delay={i * 0.06}>
                <div style={{ ...CARD, overflow: 'hidden', height: '100%', background: T.bg }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={a.img} alt={a.name} loading="lazy" width={472} height={520} style={{ width: '100%', height: 'auto', aspectRatio: '4 / 3.2', objectFit: 'cover', objectPosition: 'center 25%', display: 'block' }} />
                  <div style={{ padding: 24 }}>
                    <div style={{ fontFamily: T.serif, fontWeight: 800, fontSize: 22 }}>{a.name}</div>
                    <div className="rm-eyebrow" style={{ margin: '6px 0 12px' }}>{a.tag}</div>
                    <p style={{ color: T.text2, fontSize: 15.5, lineHeight: 1.65, margin: 0 }}>{a.body}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Real client results ── */}
      <section style={SEC}>
        <div style={WRAP}>
          <Reveal><Head eyebrow="The system in action" title={<>What happens when experts <span className="rm-mark">apply this system</span></>} sub="Real clients of the 10K Roadmap coaching program, the same framework this book teaches. These are specific people's results, not typical outcomes and not results of reading the book alone." /></Reveal>
          <div className="bk-3" style={{ marginTop: 40 }}>
            {proof.map((p, i) => (
              <Reveal key={p.name} delay={i * 0.05}>
                <div style={{ ...CARD, padding: 22, height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                    {p.photo && /* eslint-disable-next-line @next/next/no-img-element */ <img src={p.photo} alt={p.name} loading="lazy" width={52} height={52} style={{ width: 52, height: 52, borderRadius: '50%', objectFit: 'cover', border: `1.5px solid ${T.line}` }} />}
                    <div><div style={{ fontWeight: 800, fontSize: 15 }}>{p.name}</div><div style={{ color: T.text3, fontSize: 12.5, lineHeight: 1.35 }}>{p.role}</div></div>
                  </div>
                  <div className="rm-serif" style={{ fontSize: 24, color: T.accentInk, marginBottom: 10 }}>{p.result}</div>
                  <p style={{ color: T.text2, fontSize: 14.5, lineHeight: 1.65, margin: 0 }}>{p.quote}</p>
                </div>
              </Reveal>
            ))}
          </div>
          <p style={{ color: T.text3, fontSize: 12.5, lineHeight: 1.6, textAlign: 'center', maxWidth: 640, margin: '22px auto 0' }}>Individual results from the coaching program. Not typical. See the earnings disclaimer below.</p>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" style={{ ...SEC, background: T.surface, borderTop: `1px solid ${T.line}`, borderBottom: `1px solid ${T.line}` }}>
        <div style={{ ...WRAP, maxWidth: 820 }}>
          <Reveal><Head eyebrow="Questions" title="Before you buy" /></Reveal>
          <div style={{ marginTop: 36, display: 'grid', gap: 12 }}>
            {FAQ.map((f) => (
              <details key={f.q} className="bk-faq" style={{ ...CARD, padding: '18px 22px', background: T.bg }}>
                <summary style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, fontWeight: 700, fontSize: 17, lineHeight: 1.4 }}>
                  {f.q}
                  <span className="bk-plus" style={{ color: T.accentInk, fontSize: 26, fontWeight: 400, lineHeight: 1, transition: 'transform .25s', flexShrink: 0 }}>+</span>
                </summary>
                <p style={{ color: T.text2, fontSize: 15.5, lineHeight: 1.7, margin: '12px 0 0' }}>{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section style={{ ...SEC, textAlign: 'center', background: 'radial-gradient(60% 70% at 50% 0%, rgba(201,255,72,.12), transparent 70%)' }}>
        <div style={{ ...WRAP, maxWidth: 760 }}>
          <Reveal>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/book/book-3d.webp" alt={`${BOOK_TITLE} book`} loading="lazy" width={794} height={986} style={{ width: 'min(100%, 300px)', height: 'auto', margin: '0 auto 8px' }} />
            <h2 className="rm-serif" style={{ fontSize: 'clamp(32px,5vw,52px)', margin: '0 0 16px' }}>Your expertise is worth more than your hours.</h2>
            <p style={{ color: T.text2, fontSize: 18, lineHeight: 1.65, margin: '0 0 28px' }}>For the price of a coffee you get the whole roadmap: your why, your one person, a product, an offer and a launch date.</p>
            <Cta where="final" big />
            <Reassure />
            <p style={{ color: T.text2, fontSize: 15.5, lineHeight: 1.7, margin: '38px 0 0', textAlign: 'left', borderTop: `1px solid ${T.line}`, paddingTop: 24 }}>
              <strong style={{ color: T.text }}>P.S.</strong> Most people who download a workbook feel inspired for a few days and then go back to what they were doing. The only thing that changes that is writing your answers down. Start with Chapter 1 tonight: it takes one sitting, and you will have your why on paper. If it is not worth {BOOK_PRICE.label}, the {BOOK_GUARANTEE_DAYS}-day guarantee has you covered.
            </p>
          </Reveal>
        </div>
      </section>

      <Footer legal={{ ...LEGAL, earnings: BOOK_LEGAL }} />

      {/* Mobile sticky CTA */}
      <div className="bk-sticky">
        <Btn href={BOOK_CHECKOUT_PATH} onClick={() => track('book_cta_click', { where: 'sticky' })} full style={{ minHeight: 50, padding: '12px 20px', fontSize: 16 }}>Get the Book: {BOOK_PRICE.label}</Btn>
      </div>
    </div>
  )
}
