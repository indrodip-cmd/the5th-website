'use client'
/* Sales page for the $4.99 ebook "Expertise to Income". Same dark/lime system
   as /10k-roadmap (shared Fonts/Header/Btn/Reveal/Footer kit). Long-form
   letter structure, but every claim comes from the book itself or from the
   existing client case studies: no invented ratings, review counts, awards
   or scarcity. */
import { createContext, useContext, useEffect } from 'react'
import { Fonts, Header, Btn, Reveal, Footer } from '../10k-roadmap/ui'
import { T, LEGAL, REAL_PROOF, RATING } from '../10k-roadmap/config'
import { ftrack, ftrackOnce } from './funnel'
import type { Assignment } from '@/lib/funnel/experiments'
import { DEFAULTS } from '@/lib/funnel/experiments'
import { PainCheck, ChapterExplorer, Flipbook, SlideToBuy, RoadmapBuilder, LeadMagnet, HourMath, TryChapter, TwoPaths, Timeline30, Objections, Diagram, CheckoutPanel } from './Lazy'
import { SectionTracker, ScrollBar, SpotlightLayer, TiltBook, Magnetic, ProgressChip } from './Interactive'
import { CountUp, FloatingBuy, Icon } from './Graphics'
import { BOOK_PRICE, BOOK_PAGES, BOOK_CHAPTERS, BOOK_GUARANTEE_DAYS, BOOK_CHECKOUT_PATH, BOOK_TITLE, BOOK_SUBTITLE, BOOK_LEGAL, CHAPTERS, FAQ, COMPANY_SALES, INDRODIP_CREDENTIALS, VALUATION_NOTE, PAINS, OUTCOMES, COMPARE, CLIENTS_SERVED } from './config'

const WRAP: React.CSSProperties = { maxWidth: 1080, margin: '0 auto', padding: '0 clamp(16px,4vw,24px)' }
const SEC: React.CSSProperties = { padding: 'clamp(54px,8vw,96px) 0' }
const CARD: React.CSSProperties = { background: 'var(--surface)', border: `1px solid var(--line)`, borderRadius: T.radius }
const IMG_LIME = '0 30px 80px -30px rgba(var(--limeRGB),.35)'

const VarCtx = createContext<Assignment>(DEFAULTS)
/* Wide diagrams keep a readable minimum width on phones and scroll sideways
   instead of shrinking their labels to a few pixels. */
function Wide({ children }: { children: React.ReactNode }) {
  return (
    <div className="bk-wide-wrap">
      <div className="bk-wide">{children}</div>
      <p className="bk-swipe">Swipe sideways to see the full picture</p>
    </div>
  )
}
function Paper({ k }: { k: string }) {
  return <div style={{ background: '#FFFDF7', borderRadius: 18, padding: 'clamp(12px,2vw,20px)', boxShadow: '0 24px 60px -30px rgba(0,0,0,.8)' }}><Wide><Diagram k={k} /></Wide></div>
}
function Check() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, marginTop: 2 }}><circle cx="12" cy="12" r="11" fill={'var(--accent)'} /><path d="M7 12.5l3.2 3.2L17 9" stroke={'var(--accentText)'} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
}
function Head({ eyebrow, title, sub, center = true }: { eyebrow: string; title: React.ReactNode; sub?: string; center?: boolean }) {
  return (
    <div style={{ textAlign: center ? 'center' : 'left', maxWidth: 760, margin: center ? '0 auto' : 0 }}>
      <div className="rm-eyebrow" style={{ marginBottom: 14 }}>{eyebrow}</div>
      <h2 className="rm-serif" style={{ fontSize: 'clamp(30px,4.6vw,48px)', margin: 0 }}>{title}</h2>
      {sub && <p style={{ color: 'var(--text2)', fontSize: 'clamp(16px,2vw,18px)', lineHeight: 1.65, margin: '16px 0 0' }}>{sub}</p>}
    </div>
  )
}
function Cta({ where, label, big }: { where: string; label?: string; big?: boolean }) {
  const v = useContext(VarCtx)
  const text = v.cta === 'book' ? `Get the Book Now: ${BOOK_PRICE.label}` : `Get Instant Access: ${BOOK_PRICE.label}`
  return (
    <Btn href={BOOK_CHECKOUT_PATH} onClick={() => ftrack('book_cta_click', { where })} style={big ? { fontSize: 18, padding: '19px 40px', minHeight: 62 } : undefined}>
      {label || text}
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
    </Btn>
  )
}
function Reassure() {
  return (
    <p style={{ color: 'var(--text3)', fontSize: 13, lineHeight: 1.6, margin: '14px 0 0' }}>
      Instant PDF download · {BOOK_GUARANTEE_DAYS}-day money-back guarantee · Secure checkout
    </p>
  )
}

export default function BookLanding({ exp }: { exp?: Assignment }) {
  // `exp` is the server-resolved A/B bucket, so the first paint is already the
  // visitor's variant (no flicker, no layout shift).
  const V: Assignment = exp || DEFAULTS
  useEffect(() => { ftrackOnce('landing', 'book_landing_view') }, [])
  const TH = V.theme === 'dark' ? 'th-dark' : 'th-light'
  const proof = REAL_PROOF.filter((p) => ['Shyama Prasad Goswami', 'Girish', 'Laurie'].includes(p.name))

  return (
    <VarCtx.Provider value={V}>
    <div className="th-dark" style={{ background: 'var(--bg)', color: 'var(--text)', fontFamily: T.sans, paddingBottom: 76, overflowX: 'clip' }}>
      <Fonts external={false} />
      <ScrollBar />
      <SectionTracker />
      <ProgressChip />
      <SpotlightLayer />
      <style>{`
        .th-dark{--bg:#070A06;--bg2:var(--cardB);--surface:#121810;--surface2:#182014;--line:rgba(var(--inkRGB),.09);--lineStrong:rgba(var(--inkRGB),.18);--text:#F2F6EC;--text2:#9AA79A;--text3:#6F7D6F;--accent:#C9FF48;--accentInk:#C9FF48;--accentSoft:rgba(var(--limeRGB),.14);--accentText:#0B0F08;--accentHi:var(--accentHi);--limeRGB:201,255,72;--inkRGB:255,255,255;--cardA:var(--cardA);--cardB:var(--cardB);--body:var(--body);color:var(--text);background:var(--bg)}
        .th-light{--bg:#FBF9F2;--bg2:#F3F0E6;--surface:#FFFFFF;--surface2:#F1F4EA;--line:rgba(12,40,24,.12);--lineStrong:rgba(12,40,24,.26);--text:#14201A;--text2:#44544B;--text3:#66766C;--accent:#B8F53A;--accentInk:#1B6B3A;--accentSoft:rgba(27,107,58,.10);--accentText:#0B0F08;--accentHi:#DFFB8F;--limeRGB:27,107,58;--inkRGB:12,40,24;--cardA:#FFFFFF;--cardB:#F4F7EC;--body:#2D3B33;color:var(--text);background:var(--bg)}
        .th-light .rm-eyebrow,.th-light .rm-mark{color:var(--accentInk)}
        .th-light .bk-spot,.th-light [class~=bk-card]{box-shadow:0 1px 2px rgba(12,40,24,.05)}
        .th-light .rm-btn,.th-light .bk-pulse a{box-shadow:0 10px 24px -10px rgba(12,40,24,.45),0 0 0 1px rgba(12,40,24,.12)}
        .bk-hero{display:grid;grid-template-columns:minmax(0,1.1fr) minmax(0,.9fr);gap:clamp(24px,5vw,64px);align-items:center}
        .bk-2{display:grid;grid-template-columns:1fr 1fr;gap:clamp(20px,4vw,48px);align-items:center}
        .bk-3{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px}
        .bk-ch{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px}
        .bk-sticky{position:fixed;left:0;right:0;bottom:0;z-index:60;display:none;padding:10px 14px calc(10px + env(safe-area-inset-bottom));background:rgba(7,10,6,.94);border-top:1px solid var(--line);backdrop-filter:blur(10px)}
        .bk-faq summary{list-style:none;cursor:pointer}.bk-faq summary::-webkit-details-marker{display:none}
        .bk-faq[open] .bk-plus{transform:rotate(45deg)}
        @media(max-width:900px){.bk-hero,.bk-2{grid-template-columns:1fr}.bk-3,.bk-ch{grid-template-columns:1fr 1fr}.bk-sticky{display:block}}
        @media(min-width:601px) and (max-width:900px){.bk-hero>*:nth-child(2){order:-1}.bk-hero-art{min-height:380px!important;max-width:560px;margin:0 auto}}
        @media(min-width:901px) and (max-width:1120px){.bk-hero h1{font-size:clamp(32px,4.3vw,46px)!important}}
        @media(max-height:480px) and (orientation:landscape){.bk-hero-art{min-height:300px!important}}
        .bk-2>*,.bk-3>*,.bk-ch>*,.bk-hero>*{min-width:0}
        .bk-wide-wrap{min-width:0;max-width:100%}
        .bk-4{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:16px}
        .bk-4>*{min-width:0}.bk-arrow{position:absolute;right:-17px;top:36px;z-index:2;width:18px;text-align:center;color:var(--accentInk);font-weight:800;font-size:18px}
        .bk-4>*:last-child .bk-arrow{display:none}
        .bk-float{display:none}
        .bk-grid-bg{background-image:linear-gradient(rgba(var(--inkRGB),.035) 1px,transparent 1px),linear-gradient(90deg,rgba(var(--inkRGB),.035) 1px,transparent 1px);background-size:44px 44px;-webkit-mask-image:radial-gradient(70% 70% at 50% 30%,#000,transparent);mask-image:radial-gradient(70% 70% at 50% 30%,#000,transparent)}
        .bk-range{-webkit-appearance:none;appearance:none;height:34px;background:transparent;outline:none;margin:0;touch-action:pan-y}
        .bk-range::-webkit-slider-runnable-track{height:6px;border-radius:3px;background:rgba(var(--inkRGB),.16)}
        .bk-range::-moz-range-track{height:6px;border-radius:3px;background:rgba(var(--inkRGB),.16)}
        .bk-range::-webkit-slider-thumb{-webkit-appearance:none;margin-top:-10px;width:26px;height:26px;border-radius:50%;background:var(--accent);border:3px solid #0a0e08;box-shadow:0 0 0 2px var(--accent);cursor:pointer}
        .bk-range::-moz-range-thumb{width:22px;height:22px;border-radius:50%;background:var(--accent);border:3px solid #0a0e08;box-shadow:0 0 0 2px var(--accent);cursor:pointer}
        .bk-range:focus-visible{outline:2px solid var(--accent);outline-offset:6px}
        @keyframes bk-floaty{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
        @keyframes bk-pulse{0%,100%{box-shadow:0 14px 30px -14px rgba(var(--limeRGB),.5),0 0 0 0 rgba(var(--limeRGB),.35)}50%{box-shadow:0 14px 30px -14px rgba(var(--limeRGB),.5),0 0 0 10px rgba(var(--limeRGB),0)}}
        .bk-book{animation:bk-floaty 6s ease-in-out infinite}
        .bk-pulse{animation:bk-pulse 2.6s ease-in-out infinite}
        @media(prefers-reduced-motion:reduce){.bk-book,.bk-pulse{animation:none}}
        @media(min-width:901px){.bk-float{display:flex!important}}
        @media(max-width:1000px){.bk-4{grid-template-columns:repeat(2,minmax(0,1fr))}.bk-arrow{display:none}}
        @media(max-width:860px){.bk-math{grid-template-columns:1fr!important}}
        @media(max-width:560px){.bk-4{grid-template-columns:1fr}}
        .bk-opt{display:grid;grid-template-columns:1fr 1fr;gap:12px}
        .bk-chip{bottom:86px}
        @media(min-width:901px){.bk-chip{bottom:22px}}
        @media(max-width:560px){.bk-opt{grid-template-columns:1fr}}
        .bk-spot{position:relative}
        .bk-spot::before{content:'';position:absolute;inset:0;border-radius:inherit;background:radial-gradient(280px circle at var(--mx,50%) var(--my,50%),rgba(var(--limeRGB),.13),transparent 60%);opacity:0;transition:opacity .25s;pointer-events:none}
        .bk-spot:hover::before{opacity:1}
        .rm-btn:active,.bk-pulse a:active{transform:scale(.97)!important}
        .bk-explorer{display:grid;grid-template-columns:minmax(0,300px) minmax(0,1fr);gap:22px;align-items:stretch}
        .bk-tabs{display:flex;flex-direction:column;gap:6px}
        .bk-panel{animation:bk-in .45s cubic-bezier(.16,1,.3,1)}
        @keyframes bk-in{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}
        .bk-in{animation:bk-in .5s cubic-bezier(.16,1,.3,1)}
        @keyframes bk-flipr{from{opacity:0;transform:rotateY(-28deg) translateX(40px);transform-origin:left center}to{opacity:1;transform:none}}
        @keyframes bk-flipl{from{opacity:0;transform:rotateY(28deg) translateX(-40px);transform-origin:right center}to{opacity:1;transform:none}}
        .bk-flip-r{animation:bk-flipr .55s cubic-bezier(.16,1,.3,1)}.bk-flip-l{animation:bk-flipl .55s cubic-bezier(.16,1,.3,1)}
        .bk-fl-btn{position:absolute;top:50%;transform:translateY(-50%);width:48px;height:48px;border-radius:50%;border:1px solid rgba(var(--inkRGB),.25);background:rgba(7,10,6,.78);color:#fff;font-size:20px;cursor:pointer;backdrop-filter:blur(6px);transition:transform .2s,background .2s}
        .bk-fl-btn:hover{background:var(--accent);color:var(--accentText);transform:translateY(-50%) scale(1.08)}
        @media(max-width:860px){.bk-explorer{grid-template-columns:1fr}.bk-tabs{flex-direction:row;overflow-x:auto;-webkit-overflow-scrolling:touch;padding-bottom:6px;gap:8px}.bk-tab-t{display:none}.bk-tabs button{padding:8px!important}}
        @media(prefers-reduced-motion:reduce){.bk-panel,.bk-in,.bk-flip-r,.bk-flip-l{animation:none}}
        .bk-swipe{display:none}.bk-lbl{display:none}
        @media(max-width:640px){
          .bk-wide-wrap{position:relative}
          .bk-wide{overflow-x:auto;-webkit-overflow-scrolling:touch;margin:0 -4px;padding:0 4px 4px}
          .bk-wide>*{min-width:560px}
          .bk-swipe{display:block;text-align:center;font-size:11.5px;color:var(--text3);margin:8px 0 0}
          .bk-bar-long{display:none}.bk-bar-short{display:inline!important}
          .bk-hero-bullets li:nth-child(n+4){display:none}
          .bk-hero h1{font-size:34px!important}
          .bk-cta-row{flex-direction:column;align-items:stretch!important;gap:12px!important}
          .bk-cta-row a{width:100%}
          .bk-cmp-head{display:none!important}
          .bk-lbl{display:block;font-size:11px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;margin-bottom:4px}
        }
        @media(max-width:560px){.bk-3,.bk-ch{grid-template-columns:1fr}.bk-cmp{grid-template-columns:1fr!important}}
      `}</style>

      {/* Top bar */}
      <div style={{ background: 'var(--accent)', color: 'var(--accentText)', textAlign: 'center', fontSize: 13, fontWeight: 700, padding: '9px 14px', letterSpacing: '.01em' }}>
        <span className="bk-bar-long">Instant PDF download · {BOOK_PAGES} pages · {BOOK_CHAPTERS} chapters · only {BOOK_PRICE.label}</span>
        <span className="bk-bar-short" style={{ display: 'none' }}>Instant PDF · {BOOK_PAGES} pages · only {BOOK_PRICE.label}</span>
      </div>
      <Header homeHref="/book" />

      <main>
      {/* ── Hero ── */}
      <section data-sec="hero" className="th-dark" id="bk-hero" style={{ position: 'relative', padding: 'clamp(34px,6vw,76px) 0 clamp(44px,6vw,84px)', background: 'radial-gradient(70% 60% at 78% 20%, rgba(var(--limeRGB),.12), transparent 60%), radial-gradient(50% 50% at 8% 90%, rgba(47,168,102,.14), transparent 70%)', overflow: 'hidden' }}>
        <div className="bk-grid-bg" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }} />
        <div style={{ ...WRAP, position: 'relative' }} className="bk-hero">
          <Reveal eager>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '8px 16px', borderRadius: 999, border: `1px solid rgba(var(--limeRGB),.35)`, background: 'var(--accentSoft)', fontSize: 12.5, fontWeight: 700, letterSpacing: '.04em', color: 'var(--accentInk)', marginBottom: 22, lineHeight: 1.35 }}>
              <Icon name="target" size={16} />For coaches, consultants and healers who are done trading hours for money
            </div>
            <h1 className="rm-serif" style={{ fontSize: 'clamp(34px,5.1vw,58px)', margin: 0 }}>
              {V.headline === 'value'
                ? <>Your Expertise Is Worth More Than Your Hours. <span className="rm-mark">Package It Into Your First Digital Product.</span></>
                : <>Turn What You Know Into <span className="rm-mark">Income That Does Not Stop When You Do</span></>}
            </h1>
            <p style={{ color: 'var(--text2)', fontSize: 'clamp(17px,2.1vw,20px)', lineHeight: 1.65, margin: '22px 0 0', maxWidth: 580 }}>
              <strong style={{ color: 'var(--text)' }}>Expertise to Income</strong> is a {BOOK_PAGES}-page, step-by-step workbook that takes you from expertise to a finished digital product, a simple offer and a 7-day launch plan. No team. No ads. No tech skills.
            </p>
            <p style={{ margin: '16px 0 0', maxWidth: 580, fontSize: 16, lineHeight: 1.6, color: 'var(--text)', borderLeft: `3px solid var(--accent)`, paddingLeft: 14 }}>
              Every week you keep trading hours, you build something you do not own.
            </p>
            <ul className="bk-hero-bullets" style={{ listStyle: 'none', padding: 0, margin: '24px 0 0', display: 'grid', gap: 12, maxWidth: 580 }}>
              {['Find the one thing you know that people will pay for', 'Choose your ideal buyer and write for them', 'Design, price and package your first product', 'Write an offer with a guarantee that is easy to say yes to', 'Launch in 7 days with scripts for your first ten sales'].map((t) => (
                <li key={t} style={{ display: 'flex', gap: 12, fontSize: 16, lineHeight: 1.5, color: 'var(--text)' }}><Check />{t}</li>
              ))}
            </ul>
            <div className="bk-cta-row" style={{ display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap', margin: '30px 0 0' }}>
              <span className="bk-pulse" style={{ borderRadius: 999, display: 'inline-flex' }}><Magnetic><Cta where="hero" big /></Magnetic></span>
              <div style={{ lineHeight: 1.1 }}>
                <div className="rm-serif" style={{ fontSize: 40 }}>{BOOK_PRICE.label}</div>
                <div style={{ fontSize: 12.5, color: 'var(--text3)', marginTop: 4 }}>less than one coffee</div>
              </div>
            </div>
            <Reassure />
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 22, fontSize: 13.5, color: 'var(--text2)', lineHeight: 1.45 }}>
              <span style={{ display: 'flex', flexShrink: 0 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/images/book/indrodip-sm.webp" alt="Indrodip Ghosh" width={40} height={40} style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover', border: `2px solid var(--accent)` }} />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/images/book/christinee-sm.webp" alt="Christinee Mathison" width={40} height={40} style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover', border: `2px solid var(--accent)`, marginLeft: -10 }} />
              </span>
              <span>By <strong style={{ color: 'var(--text)' }}>Indrodip Ghosh</strong> and <strong style={{ color: 'var(--text)' }}>Christinee Mathison</strong>. The5th has worked with {CLIENTS_SERVED} clients and generated {COMPANY_SALES}.</span>
            </div>
          </Reveal>
          <Reveal eager delay={0.08} style={{}}>
            <div className="bk-hero-art" style={{ position: 'relative', textAlign: 'center', minHeight: 'clamp(320px,46vw,560px)' }}>
              <div style={{ position: 'absolute', inset: '6% 2%', background: 'radial-gradient(closest-side, rgba(var(--limeRGB),.30), transparent)', filter: 'blur(34px)' }} />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/book/spread-20.webp" alt="" aria-hidden="true" fetchPriority="low" decoding="async" width={1400} height={1000} style={{ position: 'absolute', left: '-14%', bottom: '4%', width: '62%', height: 'auto', borderRadius: 10, transform: 'rotate(-9deg)', boxShadow: '0 30px 60px -20px rgba(0,0,0,.8)', opacity: 0.92 }} />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/book/spread-53.webp" alt="" aria-hidden="true" fetchPriority="low" decoding="async" width={1400} height={1000} style={{ position: 'absolute', right: '-14%', bottom: '10%', width: '62%', height: 'auto', borderRadius: 10, transform: 'rotate(8deg)', boxShadow: '0 30px 60px -20px rgba(0,0,0,.8)', opacity: 0.92 }} />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <TiltBook><img className="bk-book" src="/images/book/book-3d.webp" alt={`${BOOK_TITLE}: ${BOOK_SUBTITLE}, book cover`} width={794} height={986} fetchPriority="high" draggable={false} style={{ position: 'relative', width: '100%', height: 'auto', display: 'block' }} /></TiltBook>
              <div style={{ position: 'absolute', left: '4%', top: '8%', ...CARD, padding: '10px 14px', fontSize: 13, fontWeight: 700, background: 'rgba(18,24,16,.94)' }}><span style={{ color: 'var(--accentInk)' }}>{BOOK_CHAPTERS}</span> chapters</div>
              <div style={{ position: 'absolute', right: '2%', top: '30%', ...CARD, padding: '10px 14px', fontSize: 13, fontWeight: 700, background: 'rgba(18,24,16,.94)' }}><span style={{ color: 'var(--accentInk)' }}>{BOOK_PAGES}</span> pages</div>
              <div style={{ position: 'absolute', left: '8%', bottom: '2%', ...CARD, padding: '10px 14px', fontSize: 13, fontWeight: 700, background: 'rgba(18,24,16,.94)' }}>Instant <span style={{ color: 'var(--accentInk)' }}>PDF</span> download</div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Proof band ── */}
      <section data-sec="proof" className="th-dark" aria-label="The5th in numbers" style={{ borderTop: `1px solid var(--line)`, borderBottom: `1px solid var(--line)`, background: 'var(--surface)', padding: 'clamp(30px,5vw,46px) 0' }}>
        <div style={{ ...WRAP, display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(170px,1fr))', gap: 22, textAlign: 'center' }}>
          {[{ n: <CountUp to={15} prefix="$" suffix="M+" />, l: 'in sales generated by The5th' }, { n: <CountUp to={CLIENTS_SERVED} />, l: 'clients we have worked with' }, { n: <CountUp to={12} />, l: 'nations, coached remotely' }, { n: <CountUp to={4.8} decimals={1} />, l: 'average rating from 76 coaches' }].map((x) => (
            <div key={x.l}><div className="rm-serif" style={{ fontSize: 'clamp(34px,5vw,50px)', color: 'var(--accentInk)' }}>{x.n}</div><div style={{ color: 'var(--text2)', fontSize: 14, marginTop: 6, lineHeight: 1.4 }}>{x.l}</div></div>
          ))}
        </div>
      </section>

      {/* ── Does this sound like you? ── */}
      <section data-sec="pain" className={TH} style={{ ...SEC, paddingTop: 'clamp(30px,5vw,56px)' }}>
        <div style={{ ...WRAP, maxWidth: 820 }}>
          <Reveal>
            <div className="rm-eyebrow" style={{ marginBottom: 14, textAlign: 'center' }}>Does this sound like you? Tap what does.</div>
            <h2 className="rm-serif" style={{ fontSize: 'clamp(30px,4.6vw,48px)', margin: '0 0 20px', textAlign: 'center' }}>You are not short of expertise. <span className="rm-mark">You are short of a system.</span></h2>
            <div style={{ marginTop: 30 }}><PainCheck /></div>
            <p style={{ fontSize: 'clamp(18px,2.2vw,21px)', lineHeight: 1.7, color: 'var(--body)', margin: '34px 0 0' }}>
              If that is you, nothing is wrong with you. This is not a talent problem. <strong style={{ color: 'var(--text)' }}>It is a packaging problem</strong>, and the gap between what you know and what you earn gets wider every month it stays that way. Nobody showed you how to turn what you know into something you can name, price, sell and launch. <strong style={{ color: 'var(--text)' }}>That is exactly what this book teaches.</strong>
            </p>
          </Reveal>
        </div>
      </section>

      {/* ── Do the math ── */}
      <section data-sec="math" className={TH} style={{ ...SEC, background: 'var(--surface)', borderTop: `1px solid var(--line)`, borderBottom: `1px solid var(--line)` }}>
        <div style={WRAP}>
          <Reveal><Head eyebrow="Do the math" title={<>What is one more year of trading hours <span className="rm-mark">really costing you?</span></>} sub="If you work 40 hours a week, that is about 2,080 hours a year, and none of them build something you own. Move the sliders to your own numbers and see the gap." /></Reveal>
          <Reveal delay={0.05} style={{ marginTop: 40 }}><HourMath /></Reveal>
          <Reveal style={{ textAlign: 'center', marginTop: 34 }}><Cta where="math" label="Close the gap: get the book" /><Reassure /></Reveal>
        </div>
      </section>

      {/* ── Why experts stay stuck ── */}
      <section data-sec="idea" className={TH} style={{ ...SEC, background: 'var(--surface)', borderTop: `1px solid var(--line)`, borderBottom: `1px solid var(--line)` }}>
        <div style={WRAP}>
          <Reveal><Head eyebrow="The big idea" title={<>Stop trading hours. <span className="rm-mark">Start owning an asset.</span></>} sub="When you are paid for your time, your income stops the moment you do. A digital product works differently: you create it once and can sell it again and again. The book walks you from the first to the second, step by step." /></Reveal>
          <Reveal delay={0.05} style={{ marginTop: 44 }}><Diagram k="income_types" max={840} /></Reveal>
          <Reveal delay={0.05} style={{ marginTop: 28 }}><Diagram k="three_models" max={840} /></Reveal>
        </div>
      </section>

      {/* ── Letter ── */}
      <section data-sec="story" className={TH} style={SEC}>
        <div style={{ ...WRAP, maxWidth: 760 }}>
          <Reveal>
            <div className="rm-eyebrow" style={{ marginBottom: 14 }}>Why we wrote this book · from Indrodip Ghosh</div>
            <h2 className="rm-serif" style={{ fontSize: 'clamp(30px,4.6vw,46px)', margin: '0 0 28px' }}>I almost took the salary. Here is why I said no.</h2>
            <div style={{ display: 'grid', gap: 18, fontSize: 'clamp(17px,2vw,19px)', lineHeight: 1.75, color: 'var(--body)' }}>
              <p style={{ margin: 0 }}>I did not grow up knowing how to build a business. I grew up in India, where the unspoken rule is: study hard, get a job, be safe. No one in my world was talking about digital products or online income.</p>
              <p style={{ margin: 0 }}>In 2016, my roommate and I built a working prototype of a better speaker. Then our lead engineer dropped out. No tech, no funding, no guidance. <strong style={{ color: 'var(--text)' }}>It fell apart. That was my first failure. It would not be the last.</strong></p>
              <p style={{ margin: 0 }}>I tried event management. I learned digital marketing. In 2019 I launched an agency, and by 2021 we were running campaigns for international clients, including Booking.com. From the outside it looked like success. From the inside I was exhausted, trading hours for money.</p>
              <p style={{ margin: 0 }}>I had built a business that could not run without me. That is not a business. <strong style={{ color: 'var(--text)' }}>That is a job with extra steps.</strong></p>
              <p style={{ margin: 0 }}>In 2023, Google offered me a position. A salary. Stability. I almost said yes. But I did not build all of this just to sit in an office, living paycheck to paycheck with no freedom.</p>
              <p style={{ margin: 0 }}>So in 2024 I started over with digital products and coaching. I stopped hiding my background and showed up as exactly who I was. My clients, mostly men and women over 45 starting their first online business, did not care where I was from. They cared that I understood their fear of being seen, of technology, of failing at something they had dreamed about for years.</p>
              <p style={{ margin: 0 }}>By the end of 2024 I had served 20+ clients and hit my first $10K month. Not with ads. Not with a big team. Just with clarity, story, and a simple system.</p>
              <p style={{ margin: 0 }}>This workbook is that system, written down. It is everything I wish I had in 2016, or 2020, or 2022. Christinee and I wrote it so you do not have to fail your way forward like I did.</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 30 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/book/indrodip-sm.webp" alt="Indrodip Ghosh" width={64} height={64} style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover', border: `2px solid var(--accent)` }} />
              <div><div style={{ fontWeight: 800, fontSize: 17 }}>Indrodip Ghosh</div><div style={{ color: 'var(--text3)', fontSize: 13, lineHeight: 1.5 }}>Co-author · Founder, The5th Global Consulting<br />Consumer Psychologist, UC Berkeley · AI startup founder</div></div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── What you will learn ── */}
      <section data-sec="chapters" className={TH} id="inside" style={SEC}>
        <div style={WRAP}>
          <Reveal><Head eyebrow="What you will learn" title={<>Nine skills that take you from <span className="rm-mark">expertise to income</span></>} sub="Tap through the road. Each stop teaches one skill, shows it with a real example, and ends with something you have written down." /></Reveal>
          <Reveal delay={0.04} style={{ marginTop: 36 }}><Wide><Diagram k="roadmap_glance" max={720} /></Wide></Reveal>
          <Reveal delay={0.06} style={{ marginTop: 36 }}><ChapterExplorer /></Reveal>
          <Reveal style={{ textAlign: 'center', marginTop: 40 }}><Cta where="learn" /><Reassure /></Reveal>
        </div>
      </section>

      {/* ── Try chapter 1 ── */}
      <section data-sec="try" className={TH} style={{ ...SEC, background: 'radial-gradient(60% 80% at 50% 0%, rgba(var(--limeRGB),.10), transparent 70%), ' + 'var(--surface)', borderTop: `1px solid var(--line)`, borderBottom: `1px solid var(--line)` }}>
        <div style={WRAP}>
          <Reveal><Head eyebrow="Try it before you buy it" title={<>Do the first exercise of Chapter 1 <span className="rm-mark">right now</span></>} sub="Two minutes, three questions. This is the same method the book uses to find the reason that keeps you going when it gets quiet." /></Reveal>
          <Reveal delay={0.05} style={{ marginTop: 40 }}><TryChapter /></Reveal>
        </div>
      </section>

      {/* ── Build your plan ── */}
      <section data-sec="plan" className={TH} style={SEC}>
        <div style={WRAP}>
          <Reveal><Head eyebrow="Build it with us" title={<>Get your personal 30-day starting plan <span className="rm-mark">in four taps</span></>} sub="Answer three quick questions and see which chapters to start with and what you would do in your first month. It takes 20 seconds, and nothing is saved or sent." /></Reveal>
          <Reveal delay={0.05} style={{ marginTop: 40 }}><RoadmapBuilder /></Reveal>
        </div>
      </section>

      {/* ── Look inside ── */}
      <section data-sec="pages" className={TH} style={SEC}>
        <div style={WRAP}>
          <Reveal><Head eyebrow="A look inside" title={<>Not a wall of text. A book you will <span className="rm-mark">actually finish.</span></>} sub="Real pages from the book. Swipe or tap through them: story-led lessons, clear diagrams, worked examples and worksheets with space to write." /></Reveal>
          <Reveal delay={0.05} style={{ marginTop: 44, maxWidth: 980, marginLeft: 'auto', marginRight: 'auto' }}><Flipbook /></Reveal>
        </div>
      </section>

      {/* ── Real client results ── */}
      <section data-sec="results" className={TH} style={SEC}>
        <div style={WRAP}>
          <Reveal><Head eyebrow="The system in action" title={<>What happens when experts <span className="rm-mark">apply this system</span></>} sub="Real clients of the 10K Roadmap coaching program, the same framework this book teaches. These are specific people's results, not typical outcomes and not results of reading the book alone." /></Reveal>
          <div className="bk-3" style={{ marginTop: 40 }}>
            {proof.map((p, i) => (
              <Reveal key={p.name} delay={i * 0.05}>
                <div style={{ ...CARD, padding: 22, height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                    {p.photo && /* eslint-disable-next-line @next/next/no-img-element */ <img src={p.photo} alt={p.name} loading="lazy" width={52} height={52} style={{ width: 52, height: 52, borderRadius: '50%', objectFit: 'cover', border: `1.5px solid var(--line)` }} />}
                    <div><div style={{ fontWeight: 800, fontSize: 15 }}>{p.name}</div><div style={{ color: 'var(--text3)', fontSize: 12.5, lineHeight: 1.35 }}>{p.role}</div></div>
                  </div>
                  <div className="rm-serif" style={{ fontSize: 24, color: 'var(--accentInk)', marginBottom: 10 }}>{p.result}</div>
                  <p style={{ color: 'var(--text2)', fontSize: 14.5, lineHeight: 1.65, margin: 0 }}>{p.quote}</p>
                </div>
              </Reveal>
            ))}
          </div>
          <p style={{ color: 'var(--text3)', fontSize: 12.5, lineHeight: 1.6, textAlign: 'center', maxWidth: 640, margin: '22px auto 0' }}>Individual results from the coaching program. Not typical. See the earnings disclaimer below.</p>
        </div>
      </section>

      {/* ── Why a workbook ── */}
      <section data-sec="compare" className={TH} style={SEC}>
        <div style={{ ...WRAP, maxWidth: 900 }}>
          <Reveal><Head eyebrow="Why this works" title={<>Why a workbook beats <span className="rm-mark">another course</span></>} sub="Most people do not fail because they lack information. They fail because they never finish. This book is built to be finished." /></Reveal>
          <Reveal delay={0.05}>
            <div style={{ ...CARD, marginTop: 40, overflow: 'hidden' }}>
              <div className="bk-cmp" style={{ display: 'grid', gridTemplateColumns: '120px 1fr 1fr', background: 'var(--surface2)', fontSize: 12, fontWeight: 800, letterSpacing: '.12em', textTransform: 'uppercase' }}>
                <div style={{ padding: '14px 16px', color: 'var(--text3)' }} />
                <div style={{ padding: '14px 16px', color: 'var(--accentInk)' }}>Expertise to Income</div>
                <div style={{ padding: '14px 16px', color: 'var(--text3)' }}>A typical online course</div>
              </div>
              {COMPARE.map((r) => (
                <div key={r.k} className="bk-cmp" style={{ display: 'grid', gridTemplateColumns: '120px 1fr 1fr', borderTop: `1px solid var(--line)`, fontSize: 15, lineHeight: 1.55 }}>
                  <div style={{ padding: '16px', fontWeight: 800, color: 'var(--text)' }}>{r.k}</div>
                  <div style={{ padding: '16px', color: 'var(--text)', display: 'flex', gap: 10 }}><span style={{ color: 'var(--accentInk)', fontWeight: 800 }}>✓</span>{r.book}</div>
                  <div style={{ padding: '16px', color: 'var(--text3)', display: 'flex', gap: 10 }}><span style={{ color: T.danger, fontWeight: 800 }}>×</span>{r.other}</div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Objections ── */}
      <section data-sec="objections" className={TH} style={{ ...SEC, background: 'var(--surface)', borderTop: `1px solid var(--line)`, borderBottom: `1px solid var(--line)` }}>
        <div style={WRAP}>
          <Reveal><Head eyebrow="Still thinking about it?" title={<>Every reason not to start, <span className="rm-mark">answered honestly</span></>} sub="If one of these is what is holding you back, it is the same thing that has been holding your income back." /></Reveal>
          <Reveal delay={0.05} style={{ marginTop: 44 }}><Objections /></Reveal>
        </div>
      </section>

      {/* ── For / not for ── */}
      <section data-sec="fit" className={TH} style={{ ...SEC, background: 'var(--surface)', borderTop: `1px solid var(--line)`, borderBottom: `1px solid var(--line)` }}>
        <div style={WRAP}>
          <Reveal><Head eyebrow="Is it for you?" title="This book is for you if..." /></Reveal>
          <div className="bk-2" style={{ marginTop: 40, alignItems: 'stretch' }}>
            <Reveal><div style={{ ...CARD, padding: 26, height: '100%' }}>
              <div style={{ fontWeight: 800, color: 'var(--accentInk)', fontSize: 13, letterSpacing: '.14em', textTransform: 'uppercase', marginBottom: 16 }}>Yes, if you are</div>
              <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 14 }}>
                {['A coach, consultant, healer or expert tired of trading time for money', 'Sitting on knowledge you have not yet packaged', 'Over 40 and worried you started too late', 'Not tech-savvy and want every step explained in plain English', 'Ready to do the work, not just read about it'].map((t) => <li key={t} style={{ display: 'flex', gap: 12, fontSize: 16, lineHeight: 1.5 }}><Check />{t}</li>)}
              </ul>
            </div></Reveal>
            <Reveal delay={0.06}><div style={{ ...CARD, padding: 26, height: '100%' }}>
              <div style={{ fontWeight: 800, color: 'var(--text3)', fontSize: 13, letterSpacing: '.14em', textTransform: 'uppercase', marginBottom: 16 }}>Probably not, if you want</div>
              <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 14 }}>
                {['A get-rich-quick shortcut. This is a workbook: it only works if you work it', 'A guarantee of income. No honest book can give you one', 'To skip the exercises and just skim', 'A video course. This one is read and written, chapter by chapter'].map((t) => <li key={t} style={{ display: 'flex', gap: 12, fontSize: 16, lineHeight: 1.5, color: 'var(--text2)' }}><span style={{ color: T.danger, fontWeight: 800, width: 20, textAlign: 'center', flexShrink: 0 }}>×</span>{t}</li>)}
              </ul>
            </div></Reveal>
          </div>
        </div>
      </section>

      {/* ── What you get + why $4.99 ── */}
      <section data-sec="offer" className={TH} style={SEC}>
        <div style={WRAP} className="bk-2">
          <Reveal>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/book/cover.webp" alt={`${BOOK_TITLE} cover`} loading="lazy" width={840} height={1200} style={{ width: 'min(100%, 380px)', height: 'auto', display: 'block', margin: '0 auto', borderRadius: 8, boxShadow: IMG_LIME }} />
          </Reveal>
          <Reveal delay={0.06}>
            <div className="rm-eyebrow" style={{ marginBottom: 14 }}>Everything you get</div>
            <h2 className="rm-serif" style={{ fontSize: 'clamp(28px,4vw,42px)', margin: '0 0 22px' }}>The complete workbook, instantly, for {BOOK_PRICE.label}.</h2>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 13 }}>
              {[`The full ${BOOK_PAGES}-page ${BOOK_TITLE} workbook (PDF)`, 'Every worksheet: your why, your one person, product blueprint, offer stack', 'The 3-layer why, one-person, and pain-to-product frameworks', 'A 7-day launch plan with copy-and-personalise message scripts', 'A 30-day content map plus 5 selling-without-selling posts', 'Step-by-step set-up for Facebook, Instagram and a selling platform', 'A 5-minute daily ritual and a doubt response plan to keep you going'].map((t) => <li key={t} style={{ display: 'flex', gap: 12, fontSize: 16, lineHeight: 1.5 }}><Check />{t}</li>)}
            </ul>
            <p style={{ color: 'var(--text2)', fontSize: 15.5, lineHeight: 1.7, margin: '22px 0 0' }}><strong style={{ color: 'var(--text)' }}>Why only {BOOK_PRICE.label}?</strong> So that money is never the reason you do not start. The book has one job: to take you from stuck to a finished plan. If you later want someone to go through your business with you, there is a private audit. The book stands on its own.</p>
            <div className="bk-cta-row" style={{ display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap', marginTop: 28 }}>
              <Cta where="stack" big />
              <div className="rm-serif" style={{ fontSize: 40 }}>{BOOK_PRICE.label}</div>
            </div>
            <Reassure />
          </Reveal>
        </div>
      </section>

      {/* ── Guarantee ── */}
      <section data-sec="guarantee" className={TH} style={{ padding: 'clamp(54px,8vw,96px) 0' }}>
        <div style={{ ...WRAP, maxWidth: 820 }}>
          <Reveal>
            <div style={{ ...CARD, padding: 'clamp(24px,4vw,40px)', display: 'flex', gap: 22, alignItems: 'center', flexWrap: 'wrap', borderColor: 'rgba(var(--limeRGB),.35)', background: 'linear-gradient(135deg, rgba(var(--limeRGB),.08), rgba(var(--limeRGB),0))' }}>
              <svg width="64" height="64" viewBox="0 0 48 48" fill="none" stroke={'var(--accent)'} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><path d="M24 5l15 5v12c0 10-6 17-15 21C15 39 9 32 9 22V10z" /><path d="M17 24l5 5 9-10" /></svg>
              <div style={{ flex: '1 1 320px' }}>
                <h3 className="rm-serif" style={{ fontSize: 26, margin: '0 0 8px' }}>{BOOK_GUARANTEE_DAYS}-day money-back guarantee</h3>
                <p style={{ color: 'var(--text2)', fontSize: 16, lineHeight: 1.65, margin: 0 }}>Read it, do the exercises, and if it is not worth every cent, email us any time within a full year ({BOOK_GUARANTEE_DAYS} days) of purchase for a refund. You carry no risk: the risk is ours. The only way to lose is to never start.</p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Checkout, embedded: the form is on the page, not a click away ── */}
      <section id="checkout" data-sec="checkout" className="th-dark" style={{ ...SEC, background: 'radial-gradient(60% 70% at 50% 0%, rgba(var(--limeRGB),.12), transparent 70%), var(--bg)', scrollMarginTop: 80 }}>
        <div style={WRAP}>
          <Reveal><Head eyebrow="Get it now" title={<>Get <span className="rm-mark">Expertise to Income</span> in the next two minutes</>} sub={`Instant PDF download, then read Chapter 1 tonight. Covered by a ${BOOK_GUARANTEE_DAYS}-day money-back guarantee, which means a full year.`} /></Reveal>
          <div className="bk-2" style={{ marginTop: 40, alignItems: 'start' }}>
            <Reveal>
              <div className="bk-spot" style={{ ...CARD, padding: 'clamp(20px,3vw,30px)' }}>
                <div style={{ display: 'flex', gap: 18, alignItems: 'center', marginBottom: 20 }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/images/book/cover.webp" alt={`${BOOK_TITLE} cover`} loading="lazy" width={96} height={137} style={{ width: 96, height: 'auto', borderRadius: 6, boxShadow: '0 16px 30px -14px rgba(0,0,0,.7)', flexShrink: 0 }} />
                  <div>
                    <div style={{ fontFamily: T.serif, fontWeight: 800, fontSize: 21, lineHeight: 1.2 }}>{BOOK_TITLE}</div>
                    <div style={{ color: T.text3, fontSize: 13.5, margin: '4px 0 8px' }}>{BOOK_SUBTITLE} · {BOOK_PAGES} pages · PDF</div>
                    <div className="rm-serif" style={{ fontSize: 34 }}>{BOOK_PRICE.label}</div>
                  </div>
                </div>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 12, fontSize: 15.5, lineHeight: 1.5 }}>
                  {[`All ${BOOK_CHAPTERS} chapters and every worksheet`, 'The 7-day launch plan with message scripts', 'A 30-day content map and 5 posts that sell', `${BOOK_GUARANTEE_DAYS}-day money-back guarantee (a full year)`, 'Read on any device, or print it and write in it'].map((t) => (
                    <li key={t} style={{ display: 'flex', gap: 12 }}><Check />{t}</li>
                  ))}
                </ul>
                <p style={{ margin: '20px 0 0', paddingTop: 16, borderTop: `1px solid ${T.line}`, fontSize: 13.5, color: T.text3, lineHeight: 1.6 }}>Your download link arrives on the confirmation page and by email the moment payment goes through. One-time payment, no subscription.</p>
              </div>
            </Reveal>
            <Reveal delay={0.06}><CheckoutPanel /></Reveal>
          </div>
        </div>
      </section>

      {/* ── Authors ── */}
      <section data-sec="authors" className={TH} id="authors" style={{ ...SEC, background: 'var(--surface)', borderTop: `1px solid var(--line)`, borderBottom: `1px solid var(--line)` }}>
        <div style={WRAP}>
          <Reveal><Head eyebrow="The authors" title="Meet the authors" sub="Indrodip Ghosh founded The5th Global Consulting and wrote the strategy chapters. Co-author Christinee Mathison wrote the audience, product, offer, content and mindset chapters." /></Reveal>
          <div className="bk-2" style={{ marginTop: 40, alignItems: 'stretch' }}>
            {[{ img: '/images/book/indrodip.jpg', name: 'Indrodip Ghosh', tag: 'Founder · Strategy and systems', body: `Consumer psychologist (University of California, Berkeley), AI startup founder and founder of The5th Global Consulting, which has generated ${COMPANY_SALES}. Recruited by Google, Anthropic, Mastermind.com and ClickFunnels, he runs The5th from Kolkata, India, working with coaches and consultants across the US and Canada. He has built and rebuilt businesses from scratch, guided 20+ clients toward their first $10K months, and wrote the Introduction and Chapters 1, 2, 3 and 8.`, extra: INDRODIP_CREDENTIALS },
              { img: '/images/book/christinee.jpg', name: 'Christinee Mathison', tag: 'Co-author · Transformation and clarity', body: 'Mindset coach with deep expertise in audience clarity and offer building. She works with coaches, consultants and healers who know they have something valuable to offer but have not yet found the system to package and sell it with confidence. She co-wrote this book and authored Chapters 4, 5, 6, 7 and 9.', extra: [] as string[] }].map((a, i) => (
              <Reveal key={a.name} delay={i * 0.06}>
                <div style={{ ...CARD, overflow: 'hidden', height: '100%', background: 'var(--bg)' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={a.img} alt={a.name} loading="lazy" width={472} height={520} style={{ width: '100%', height: 'auto', aspectRatio: '4 / 3.2', objectFit: 'cover', objectPosition: 'center 25%', display: 'block' }} />
                  <div style={{ padding: 24 }}>
                    <div style={{ fontFamily: T.serif, fontWeight: 800, fontSize: 22 }}>{a.name}</div>
                    <div className="rm-eyebrow" style={{ margin: '6px 0 12px' }}>{a.tag}</div>
                    <p style={{ color: 'var(--text2)', fontSize: 15.5, lineHeight: 1.65, margin: 0 }}>{a.body}</p>
                    {a.extra.length > 0 && (
                      <ul style={{ listStyle: 'none', padding: 0, margin: '16px 0 0', display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {a.extra.map((t) => <li key={t} style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--accentInk)', background: 'var(--accentSoft)', borderRadius: 999, padding: '6px 12px', lineHeight: 1.3 }}>{t}</li>)}
                      </ul>
                    )}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
          <p style={{ color: 'var(--text3)', fontSize: 12, lineHeight: 1.6, textAlign: 'center', maxWidth: 680, margin: '22px auto 0' }}>{VALUATION_NOTE}</p>
        </div>
      </section>

      {/* ── Free Chapter 1 (email capture) ── */}
      <section data-sec="lead" className={TH} style={{ ...SEC, paddingTop: 'clamp(40px,6vw,70px)', paddingBottom: 'clamp(40px,6vw,70px)' }}>
        <div style={{ ...WRAP, maxWidth: 760 }}>
          <Reveal><LeadMagnet /></Reveal>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section data-sec="faq" className={TH} id="faq" style={{ ...SEC, background: 'var(--surface)', borderTop: `1px solid var(--line)`, borderBottom: `1px solid var(--line)` }}>
        <div style={{ ...WRAP, maxWidth: 820 }}>
          <Reveal><Head eyebrow="Questions" title="Before you buy" /></Reveal>
          <div style={{ marginTop: 36, display: 'grid', gap: 12 }}>
            {FAQ.map((f) => (
              <details key={f.q} className="bk-faq" style={{ ...CARD, padding: '18px 22px', background: 'var(--bg)' }}>
                <summary style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, fontWeight: 700, fontSize: 17, lineHeight: 1.4 }}>
                  {f.q}
                  <span className="bk-plus" style={{ color: 'var(--accentInk)', fontSize: 26, fontWeight: 400, lineHeight: 1, transition: 'transform .25s', flexShrink: 0 }}>+</span>
                </summary>
                <p style={{ color: 'var(--text2)', fontSize: 15.5, lineHeight: 1.7, margin: '12px 0 0' }}>{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section data-sec="final" className="th-dark" id="bk-final" style={{ ...SEC, textAlign: 'center', background: 'radial-gradient(60% 70% at 50% 0%, rgba(var(--limeRGB),.14), transparent 70%)' }}>
        <div style={{ ...WRAP, maxWidth: 780 }}>
          <Reveal>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/book/book-3d.webp" alt={`${BOOK_TITLE} book`} loading="lazy" width={794} height={986} style={{ width: 'min(100%, 300px)', height: 'auto', margin: '0 auto 8px' }} />
            <h2 className="rm-serif" style={{ fontSize: 'clamp(32px,5vw,54px)', margin: '0 0 16px' }}>Another year of trading hours, or <span className="rm-mark">a product with your name on it?</span></h2>
            <p style={{ color: 'var(--text2)', fontSize: 18, lineHeight: 1.65, margin: '0 0 28px' }}>In one sitting tonight you can write down your why. In a few weeks you can have a product, an offer and a launch date on paper. For {BOOK_PRICE.label} and a full year of protection.</p>
            <span className="bk-pulse" style={{ borderRadius: 999, display: 'inline-flex' }}><Cta where="final" big label={`Yes, I am ready: ${BOOK_PRICE.label}`} /></span>
            <Reassure />
            <div style={{ margin: '30px 0 6px' }}><div style={{ fontSize: 13, color: 'var(--text3)', marginBottom: 12, letterSpacing: '.06em', textTransform: 'uppercase', fontWeight: 700 }}>Or feel it for yourself</div><SlideToBuy /></div>
            <p style={{ color: 'var(--text2)', fontSize: 15.5, lineHeight: 1.75, margin: '38px 0 0', textAlign: 'left', borderTop: `1px solid var(--line)`, paddingTop: 24 }}>
              <strong style={{ color: 'var(--text)' }}>P.S.</strong> The hard part is not the book. It is the next twelve months, which you will live whether you start tonight or not. Most people who download a workbook feel inspired for a few days and then go back to what they were doing, because they never wrote anything down. Do Chapter 1 tonight. If it is not worth {BOOK_PRICE.label}, you can have every cent back any time in the next year. The only thing you can lose by starting is nothing.
            </p>
          </Reveal>
        </div>
      </section>

      </main>
      <FloatingBuy />

      <Footer legal={{ ...LEGAL, earnings: BOOK_LEGAL }} />

      {/* Mobile sticky CTA */}
      <div className="bk-sticky">
        <Btn href={BOOK_CHECKOUT_PATH} onClick={() => ftrack('book_cta_click', { where: 'sticky' })} full style={{ minHeight: 50, padding: '12px 20px', fontSize: 16 }}>Get the Book: {BOOK_PRICE.label}</Btn>
      </div>
    </div>
    </VarCtx.Provider>
  )
}
