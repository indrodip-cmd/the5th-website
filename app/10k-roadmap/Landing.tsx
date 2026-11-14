'use client'
/* The $10K Roadmap — landing page.
   2026-11-14 design upgrade: premium dark-forest / acid-lime system, borrowed
   from a reference landing page's visual language (tokens, pill CTAs, stat
   strip, rounded cards, slider calculators) — not its brand, copy or images.
   Structure, tightened to ~8 sections after the LOCKED hero:
     Header → Hero (locked: copy/layout/photo/CTA wording unchanged) → press
     strip → proof/stats strip (76 clients · 12 nations · 4.8 rating · results)
     → Section 03 "more advice vs. actual diagnosis" (two contrasting cards)
     → Section 04 the 60-minute audit process (5 numbered steps) → Section 05
     everything you receive (6 deliverable cards + sample PDF download) →
     Section 06 interactive business calculators (3 tools, one slider panel)
     → Section 07 client results (featured proof cards + expandable grid) →
     real on-camera video testimonials (before the founder section, per
     priority #4) → Section 08 founder/credibility (two-column editorial) →
     Section 09 FAQ accordion + final booking card → footer.
     One page, no /qualify hop. Sticky mobile CTA always visible. */
import { useEffect, useMemo, useState } from 'react'
import { LANDING, LEGAL, RATING, PRESS, REAL_PROOF, AUDIT_CHECKOUT_URL } from './config'
import { Fonts, Header, Footer, Btn, Reveal, useUtm } from './ui'
import { track } from './track'
import VideoWall from '@/components/VideoWall'

const MAXW = 1180
const PADX = 'clamp(20px,5vw,22px)'
const SECY = 'clamp(30px,6vw,60px)'
const SECY_LG = 'clamp(30px,8vw,90px)'
// Premium dark-forest / acid-lime system.
const ACCENT = '#C9FF48'
const ACCENT_TEXT = '#0B0F08' // dark text used ON lime fills
const INK2 = '#0E130C'
const CARD = '#121810'
const CARD2 = '#182014'
const LINE = 'rgba(255,255,255,0.09)'
const LINE2 = 'rgba(255,255,255,0.18)'
const TEXT2 = '#9AA79A'
const TEXT3 = '#6F7D6F'
const CARD_RADIUS = 18
const CARD_SHADOW = '0 10px 50px -8px rgba(0,0,0,0.4)'
const CARD_PAD = 'clamp(22px,4vw,32px)'

function Stars() {
  return <span style={{ display: 'inline-flex', gap: 2 }} aria-hidden>{Array.from({ length: 5 }).map((_, i) => <svg key={i} width="16" height="16" viewBox="0 0 24 24" fill={ACCENT}><path d="M12 2l2.9 6.3 6.9.8-5.1 4.7 1.4 6.8L12 17.8 5.9 20.6l1.4-6.8L2.2 9.1l6.9-.8z" /></svg>)}</span>
}
function RatingRow() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
      <Stars /><span style={{ fontWeight: 800, fontSize: 14.5 }}>{RATING.score}</span>
      <span style={{ color: TEXT2, fontSize: 13 }}>{RATING.text}</span>
    </div>
  )
}
function SectionHead({ eyebrow, heading, sub, maxW, dark, align }: { eyebrow?: string; heading: string; sub?: string; maxW?: number; dark?: boolean; align?: 'left' | 'center' }) {
  const left = align === 'left'
  return (
    <div style={{ textAlign: left ? 'left' : 'center', marginBottom: 28, maxWidth: left ? undefined : (maxW || 680), marginLeft: left ? 0 : 'auto', marginRight: left ? 0 : 'auto' }}>
      {eyebrow && <div className="rm-eyebrow" style={{ marginBottom: 12, color: ACCENT }}>{eyebrow}</div>}
      <h2 className="rm-serif" style={{ fontSize: 'clamp(22px,4.6vw,42px)', margin: 0, fontWeight: 800, lineHeight: 1.1, color: dark ? '#fff' : undefined }}>{heading}</h2>
      {sub && <p style={{ color: dark ? 'rgba(255,255,255,.65)' : TEXT2, fontSize: 15.5, lineHeight: 1.6, marginTop: 12, maxWidth: left ? 560 : undefined }}>{sub}</p>}
    </div>
  )
}

/* Thin-stroke line-art icons, lime on dark. */
function StepIcon({ kind }: { kind: string }) {
  const c = { fill: 'none', stroke: ACCENT, strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }
  const box = { width: 48, height: 48, viewBox: '0 0 56 56' }
  if (kind === 'search') return <svg {...box}><circle cx={24} cy={24} r={13} {...c} /><line x1={33.5} y1={33.5} x2={46} y2={46} {...c} /></svg>
  if (kind === 'tag') return <svg {...box}><rect x={14} y={14} width={28} height={28} rx={6} transform="rotate(45 28 28)" {...c} /><circle cx={28} cy={18} r={2} fill={ACCENT} stroke="none" /></svg>
  if (kind === 'target') return <svg {...box}><circle cx={28} cy={28} r={18} {...c} /><circle cx={28} cy={28} r={10} {...c} /><circle cx={28} cy={28} r={3} fill={ACCENT} stroke="none" /></svg>
  if (kind === 'compass') return <svg {...box}><circle cx={28} cy={28} r={18} {...c} /><polygon points="28,16 32,28 28,40 24,28" fill={ACCENT} stroke="none" /></svg>
  return <svg {...box}><rect x={10} y={14} width={36} height={30} rx={5} {...c} /><line x1={10} y1={24} x2={46} y2={24} {...c} /><line x1={19} y1={9} x2={19} y2={18} {...c} /><line x1={37} y1={9} x2={37} y2={18} {...c} /><polyline points="19,34 25,40 38,27" {...c} /></svg>
}

/* Deliverable icons — matched to the six "what you receive" cards. */
function DeliverableIcon({ kind }: { kind: string }) {
  const c = { fill: 'none', stroke: ACCENT, strokeWidth: 1.7, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }
  const box = { width: 30, height: 30, viewBox: '0 0 24 24' }
  if (kind === 'video') return <svg {...box}><rect x={2.5} y={5.5} width={13} height={13} rx={2.2} {...c} /><path d="M15.5 10l6-3.5v11l-6-3.5" {...c} /></svg>
  if (kind === 'file') return <svg {...box}><path d="M6 2.5h8l4 4v14a1 1 0 01-1 1H6a1 1 0 01-1-1v-17a1 1 0 011-1z" {...c} /><path d="M14 2.5v4h4" {...c} /><path d="M8 13h8M8 16.5h8M8 9.5h4" {...c} /></svg>
  if (kind === 'map') return <svg {...box}><path d="M9 3L3 5.5v15L9 18l6 2.5 6-2.5v-15l-6 2.5L9 3z" {...c} /><path d="M9 3v15M15 5.5v15" {...c} /></svg>
  if (kind === 'calculator') return <svg {...box}><rect x={4} y={2.5} width={16} height={19} rx={2.2} {...c} /><line x1={7} y1={6.5} x2={17} y2={6.5} {...c} /><circle cx={7.5} cy={11.5} r={1} fill={ACCENT} stroke="none" /><circle cx={12} cy={11.5} r={1} fill={ACCENT} stroke="none" /><circle cx={16.5} cy={11.5} r={1} fill={ACCENT} stroke="none" /><circle cx={7.5} cy={15.5} r={1} fill={ACCENT} stroke="none" /><circle cx={12} cy={15.5} r={1} fill={ACCENT} stroke="none" /><circle cx={16.5} cy={15.5} r={1} fill={ACCENT} stroke="none" /></svg>
  if (kind === 'brain') return <svg {...box}><path d="M9 3a3 3 0 00-3 3 3 3 0 00-2 5 3 3 0 002 5 3 3 0 003 3M9 3a3 3 0 013 3v12a3 3 0 01-3 3M15 3a3 3 0 013 3 3 3 0 012 5 3 3 0 01-2 5 3 3 0 01-3 3" {...c} /></svg>
  return <svg {...box}><path d="M12 3v12m0 0l-4.5-4.5M12 15l4.5-4.5" {...c} /><path d="M4 16v3a2 2 0 002 2h12a2 2 0 002-2v-3" {...c} /></svg>
}

function PressStrip() {
  return (
    <div style={{ padding: '22px ' + PADX + ' 0' }}>
      <div style={{ maxWidth: MAXW, margin: '0 auto', display: 'flex', gap: 'clamp(16px,4vw,40px)', justifyContent: 'center', flexWrap: 'wrap', alignItems: 'center' }}>
        {PRESS.items.map((p) => <span key={p} style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontWeight: 700, fontSize: 'clamp(13px,2vw,16px)', color: TEXT2, opacity: 0.6, whiteSpace: 'nowrap' }}>{p}</span>)}
      </div>
    </div>
  )
}

function TestimonialCard({ index = 7 }: { index?: number }) {
  const t = REAL_PROOF[index] // defaults to Laurie — has a photo, carries the hero testimonial slot
  return (
    <div style={{ maxWidth: 680, margin: '0 auto', display: 'flex', gap: 'clamp(18px,3vw,30px)', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={t.photo} alt={t.name} style={{ width: 96, height: 96, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
      <div style={{ flex: '1 1 380px', minWidth: 260 }}>
        <p style={{ fontSize: 17, lineHeight: 1.65, color: '#F2F6EC', fontStyle: 'italic', margin: '0 0 10px' }}>&ldquo;{t.quote.replace(/^[“"]|[”"]$/g, '')}&rdquo;</p>
        <div style={{ fontSize: 14, lineHeight: 1.5 }}><strong style={{ fontWeight: 800 }}>{t.name}</strong>, {t.result} <span style={{ color: TEXT3 }}>· {t.role}</span></div>
      </div>
    </div>
  )
}

/* A single documented-result proof card: photo, name, business type, result, quote. */
function ProofCard({ c }: { c: typeof REAL_PROOF[number] }) {
  return (
    <div style={{ background: CARD, border: `1px solid ${LINE}`, borderRadius: CARD_RADIUS, padding: 20, display: 'flex', flexDirection: 'column', gap: 12, height: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {c.photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={c.photo} alt={c.name} style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
        ) : (
          <span style={{ width: 44, height: 44, borderRadius: '50%', background: CARD2, border: `1px solid ${LINE2}`, color: ACCENT, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 16, flexShrink: 0 }}>{c.name[0]}</span>
        )}
        <div>
          <div style={{ fontWeight: 800, fontSize: 14.5 }}>{c.name}</div>
          <div style={{ color: TEXT3, fontSize: 11.5, textTransform: 'uppercase', letterSpacing: '.04em' }}>{c.role}</div>
        </div>
      </div>
      <p style={{ color: TEXT2, fontSize: 14, lineHeight: 1.6, margin: 0, flex: 1 }}>&ldquo;{c.quote.replace(/^[“"]|[”"]$/g, '')}&rdquo;</p>
      <div className="rm-serif" style={{ color: ACCENT, fontWeight: 800, fontSize: 'clamp(18px,2.2vw,22px)' }}>{c.result}</div>
    </div>
  )
}

/* ── Section 06: one unified revenue-engine calculator ────────────────────
   Every input (revenue goal, offer price, and both funnel conversion rates)
   feeds a single cascading model — goal → clients → booked calls → leads —
   rendered as one real funnel, plus a live pricing-leverage readout. One
   complex, meaningful tool instead of three disconnected tabs. Transparent,
   editable math on the numbers the visitor enters; division-by-zero guarded
   throughout, no email-gate, no guarantees implied. */
function Calculators() {
  const [goal, setGoal] = useState(10000)
  const [offerPrice, setOfferPrice] = useState(1500)
  const [closeRate, setCloseRate] = useState(25) // booked call → client
  const [bookRate, setBookRate] = useState(40)   // lead → booked call

  const safeDiv = (a: number, b: number) => (b > 0 ? a / b : 0)
  const fmt = (n: number) => '$' + Math.round(n).toLocaleString('en-US')
  const fmtK = (n: number) => n >= 1000 ? '$' + (n / 1000).toFixed(n % 1000 === 0 ? 0 : 1) + 'K' : fmt(n)

  const model = useMemo(() => {
    const close = closeRate / 100, book = bookRate / 100
    const clients = safeDiv(goal, offerPrice)
    const bookedCalls = safeDiv(clients, close)
    const leads = safeDiv(bookedCalls, book)
    const revenuePerLead = safeDiv(goal, leads)
    // Pricing leverage: the same revenue goal at offer price +25%, holding
    // conversion rates constant, shows how many fewer clients (and calls,
    // and leads) a higher price would require.
    const higherPrice = Math.round(offerPrice * 1.25)
    const clientsAtHigherPrice = safeDiv(goal, higherPrice)
    const leadsAtHigherPrice = safeDiv(safeDiv(clientsAtHigherPrice, close), book)
    const leadsSaved = Math.max(0, leads - leadsAtHigherPrice)
    return { clients, bookedCalls, leads, revenuePerLead, higherPrice, clientsAtHigherPrice, leadsAtHigherPrice, leadsSaved }
  }, [goal, offerPrice, closeRate, bookRate])

  const sliderStyle: React.CSSProperties = { width: '100%', height: 5, borderRadius: 999, accentColor: ACCENT, background: 'rgba(255,255,255,.13)' }
  const Field = ({ label, display, children }: { label: string; display: string; children: React.ReactNode }) => (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12, marginBottom: 10 }}>
        <span style={{ fontSize: 13.5, color: TEXT2 }}>{label}</span>
        <span style={{ fontSize: 15, fontWeight: 800, color: ACCENT, fontVariantNumeric: 'tabular-nums' }}>{display}</span>
      </div>
      {children}
    </div>
  )

  // The funnel itself: leads at the top (widest), narrowing down to clients
  // and the revenue goal at the bottom. Bar widths are proportional to the
  // top-of-funnel lead count so the shrink is visually honest, not stylized.
  const stages = [
    { label: 'Leads needed', value: model.leads, display: Math.ceil(model.leads).toLocaleString('en-US'), note: 'per month, at your lead→call rate' },
    { label: 'Booked calls needed', value: model.bookedCalls, display: Math.ceil(model.bookedCalls).toLocaleString('en-US'), note: 'per month, at your call→client rate' },
    { label: 'Clients needed', value: model.clients, display: model.clients.toFixed(1), note: `per month at ${fmt(offerPrice)}/client` },
    { label: 'Monthly revenue', value: 0, display: fmt(goal), note: 'your stated goal' },
  ]
  const maxV = Math.max(model.leads, 1)

  return (
    <div>
      <div className="rm-calc-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'clamp(18px,3vw,28px)', alignItems: 'start' }}>
        {/* Controls */}
        <div style={{ background: CARD, border: `1px solid ${LINE}`, borderRadius: CARD_RADIUS, padding: CARD_PAD }}>
          <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: '.08em', textTransform: 'uppercase', color: TEXT3, marginBottom: 18 }}>Your Numbers</div>
          <Field label="Monthly revenue goal" display={fmt(goal)}>
            <input type="range" min={1000} max={100000} step={500} value={goal} onChange={(e) => setGoal(+e.target.value)} style={sliderStyle} />
          </Field>
          <Field label="Average offer price" display={fmt(offerPrice)}>
            <input type="range" min={50} max={10000} step={50} value={offerPrice} onChange={(e) => setOfferPrice(+e.target.value)} style={sliderStyle} />
          </Field>
          <Field label="Booked call → client rate" display={closeRate + '%'}>
            <input type="range" min={1} max={100} step={1} value={closeRate} onChange={(e) => setCloseRate(+e.target.value)} style={sliderStyle} />
          </Field>
          <Field label="Lead → booked call rate" display={bookRate + '%'}>
            <input type="range" min={1} max={100} step={1} value={bookRate} onChange={(e) => setBookRate(+e.target.value)} style={sliderStyle} />
          </Field>

          <div style={{ marginTop: 22, paddingTop: 18, borderTop: `1px solid ${LINE}` }}>
            <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: '.08em', textTransform: 'uppercase', color: ACCENT, marginBottom: 10 }}>Pricing Leverage</div>
            <p style={{ color: TEXT2, fontSize: 13.5, lineHeight: 1.6, margin: 0 }}>
              At <strong style={{ color: '#F2F6EC' }}>{fmt(model.higherPrice)}</strong> (+25%), the same {fmt(goal)}/month goal needs only{' '}
              <strong style={{ color: ACCENT }}>{Math.ceil(model.leadsAtHigherPrice).toLocaleString('en-US')} leads</strong> instead of{' '}
              {Math.ceil(model.leads).toLocaleString('en-US')} — {Math.ceil(model.leadsSaved).toLocaleString('en-US')} fewer leads to find every month.
            </p>
          </div>
        </div>

        {/* The funnel */}
        <div style={{ background: 'linear-gradient(150deg,rgba(201,255,72,.1),rgba(201,255,72,.02))', border: '1px solid rgba(201,255,72,.28)', borderRadius: CARD_RADIUS, padding: CARD_PAD }}>
          <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: '.08em', textTransform: 'uppercase', color: TEXT3, marginBottom: 18 }}>Your Revenue Engine</div>
          <div style={{ display: 'grid', gap: 10 }}>
            {stages.map((s, i) => {
              const widthPct = i === 3 ? 100 : Math.max(18, Math.min(100, (s.value / maxV) * 100))
              return (
                <div key={s.label}>
                  <div style={{ width: `${widthPct}%`, minWidth: '46%', marginLeft: 'auto', marginRight: 'auto', background: i === 3 ? ACCENT : `rgba(201,255,72,${0.42 - i * 0.08})`, borderRadius: 10, padding: '12px 16px', transition: 'width .25s ease' }}>
                    <strong style={{ display: 'block', fontSize: i === 3 ? 22 : 19, fontWeight: 800, color: i === 3 ? ACCENT_TEXT : '#0B0F08', letterSpacing: '-.01em', fontVariantNumeric: 'tabular-nums', textAlign: 'center' }}>{s.display}</strong>
                  </div>
                  <div style={{ textAlign: 'center', marginTop: 6 }}>
                    <span style={{ fontSize: 12.5, fontWeight: 700, color: '#F2F6EC' }}>{s.label}</span>
                    <span style={{ fontSize: 11.5, color: TEXT3 }}> · {s.note}</span>
                  </div>
                </div>
              )
            })}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 20 }}>
            <div style={{ background: CARD, border: `1px solid ${LINE}`, borderRadius: 14, padding: '14px 16px' }}>
              <strong style={{ display: 'block', fontSize: 18, fontWeight: 800 }}>{(model.clients / 4.33).toFixed(1)}</strong>
              <span style={{ fontSize: 11.5, color: TEXT3 }}>clients needed per week</span>
            </div>
            <div style={{ background: CARD, border: `1px solid ${LINE}`, borderRadius: 14, padding: '14px 16px' }}>
              <strong style={{ display: 'block', fontSize: 18, fontWeight: 800 }}>{fmtK(model.revenuePerLead)}</strong>
              <span style={{ fontSize: 11.5, color: TEXT3 }}>revenue value per lead</span>
            </div>
          </div>
        </div>
      </div>
      <p style={{ color: TEXT3, fontSize: 11.5, textAlign: 'center', marginTop: 20, maxWidth: 580, marginLeft: 'auto', marginRight: 'auto' }}>{LANDING.calculators.disclaimer}</p>
    </div>
  )
}

/* ── FAQ accordion ──────────────────────────────────────────────────────── */
function FaqAccordion({ items }: { items: typeof LANDING.faq.items }) {
  const [open, setOpen] = useState(0)
  return (
    <div style={{ display: 'grid', gap: 10 }}>
      {items.map((it, i) => {
        const isOpen = open === i
        return (
          <div key={it.q} style={{ background: CARD, border: `1px solid ${isOpen ? LINE2 : LINE}`, borderRadius: 14, overflow: 'hidden' }}>
            <button onClick={() => setOpen(isOpen ? -1 : i)} className="rm-focus" aria-expanded={isOpen}
              style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14, textAlign: 'left', background: 'transparent', border: 'none', cursor: 'pointer', padding: '18px 20px', fontFamily: 'inherit' }}>
              <span style={{ fontSize: 15.5, fontWeight: 700, color: '#F2F6EC' }}>{it.q}</span>
              <span aria-hidden style={{ flexShrink: 0, width: 22, height: 22, borderRadius: '50%', border: `1px solid ${LINE2}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: ACCENT, fontSize: 15, transform: isOpen ? 'rotate(45deg)' : 'none', transition: 'transform .2s' }}>+</span>
            </button>
            {isOpen && <p style={{ color: TEXT2, fontSize: 14.5, lineHeight: 1.65, margin: 0, padding: '0 20px 18px', maxWidth: 640 }}>{it.a}</p>}
          </div>
        )
      })}
    </div>
  )
}

export default function Landing() {
  const [showSticky, setShowSticky] = useState(false)
  const [showAllProof, setShowAllProof] = useState(false)
  useUtm()
  useEffect(() => { track('page_view') }, [])
  useEffect(() => { const on = () => setShowSticky(window.scrollY > 620); on(); window.addEventListener('scroll', on, { passive: true }); return () => window.removeEventListener('scroll', on) }, [])
  // Every CTA on this page links straight to the Whop product page for the
  // $29 audit — no internal qualification/schedule hop in between.
  const CTA = (where: string, label?: string) => <Btn href={AUDIT_CHECKOUT_URL} onClick={() => track('cta_click', { where })} style={{ padding: '16px 34px', fontSize: 16.5 }}>{label || LANDING.ctaStandard} <span aria-hidden>→</span></Btn>
  // For this page's US/Canada-first audience, lead the proof list with named
  // North American clients, without reordering the shared REAL_PROOF array
  // other pages also read.
  const NA_FIRST = ['Amalia', 'Max', 'Susan Taylor', 'Laurie', 'Angela', 'Jeanne', 'Seth']
  const orderedProof = [...REAL_PROOF].sort((a, b) => {
    const ai = NA_FIRST.includes(a.name) ? 0 : 1
    const bi = NA_FIRST.includes(b.name) ? 0 : 1
    return ai - bi
  })
  const featuredProof = orderedProof.slice(0, 6)
  const restProof = orderedProof.slice(6)

  return (
    <div style={{ background: '#070A06', color: '#F2F6EC', fontFamily: "'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif", overflowX: 'hidden' }}>
      <Fonts />
      <Header nav={LANDING.nav} showFounder />

      {/* ── Hero: LOCKED — copy, layout, photo and CTA wording unchanged ── */}
      <div style={{ background: 'radial-gradient(110% 60% at 15% -6%, rgba(201,255,72,0.12) 0%, #070A06 62%)' }}>
        <section style={{ maxWidth: MAXW, margin: '0 auto', padding: 'clamp(30px,6vw,56px) ' + PADX + ' 20px', display: 'flex', gap: 'clamp(24px,5vw,56px)', alignItems: 'center', flexWrap: 'wrap' }} className="rm-hero">
          <div style={{ flex: '1 1 440px', minWidth: 300 }}>
            <Reveal>
              <div className="rm-eyebrow" style={{ marginBottom: 14 }}>{LANDING.eyebrow}</div>
              <h1 className="rm-serif" style={{ fontSize: 'clamp(32px,5.6vw,54px)', margin: 0, fontWeight: 800, lineHeight: 1.04 }}>{LANDING.headline}</h1>
              <p style={{ color: TEXT2, fontSize: 'clamp(15.5px,1.8vw,18px)', lineHeight: 1.55, maxWidth: 520, margin: '16px 0 0', fontWeight: 500 }}>{LANDING.headlineSub}</p>
            </Reveal>
            <Reveal delay={100} style={{ marginTop: 24 }}>
              <div className="rm-hero-ctas" style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <Btn href={AUDIT_CHECKOUT_URL} onClick={() => track('cta_click', { where: 'hero' })} style={{ padding: '16px 34px', fontSize: 17 }}>{LANDING.ctaPrimary} <span aria-hidden>→</span></Btn>
                <Btn onClick={() => { track('cta_click', { where: 'hero_secondary' }); document.getElementById('proof')?.scrollIntoView({ behavior: 'smooth', block: 'start' }) }} variant="outline" style={{ padding: '16px 28px', fontSize: 16 }}>{LANDING.ctaSecondary.label}</Btn>
              </div>
              <p style={{ color: TEXT3, fontSize: 12.5, marginTop: 14 }}>{LANDING.ctaMicro}</p>
              <p className="rm-hero-guarantee" style={{ color: ACCENT, fontSize: 13, fontWeight: 800, marginTop: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" aria-hidden><circle cx="12" cy="12" r="10" /><path d="M8 12l3 3 5-6" /></svg>
                {LANDING.guarantee}
              </p>
              <div className="rm-hero-rating" style={{ marginTop: 16 }}><RatingRow /></div>
            </Reveal>
          </div>
          <Reveal delay={150} style={{ flex: '1 1 300px', minWidth: 260, maxWidth: 400, margin: '0 auto' }}>
            <div style={{ position: 'relative' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/founder-golden-gate.webp" alt={`${LANDING.heroCard.name}, ${LANDING.heroCard.role}`} style={{ width: '100%', aspectRatio: '4/5', objectFit: 'cover', objectPosition: '50% 22%', borderRadius: 24, boxShadow: '0 30px 60px -24px rgba(0,0,0,.6)' }} />
              <div style={{ position: 'absolute', left: 16, right: 16, bottom: 16, padding: '12px 16px', borderRadius: 12, background: 'rgba(7,10,6,.55)', backdropFilter: 'blur(6px)', border: '1px solid rgba(255,255,255,.18)', textAlign: 'center' }}>
                <span style={{ fontWeight: 800, fontSize: 15.5, color: '#fff' }}>{LANDING.heroCard.credential}</span>
                {LANDING.heroCard.recruitedBy && (
                  <span style={{ display: 'block', marginTop: 6, fontWeight: 700, fontSize: 12.5, color: ACCENT }}>{LANDING.heroCard.recruitedBy}</span>
                )}
              </div>
            </div>
            <div style={{ marginTop: 18, textAlign: 'center' }}>
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
                <span style={{ fontWeight: 800, fontSize: 15 }}>{LANDING.heroCard.name}</span>
                <span style={{ color: TEXT3, fontSize: 13 }}>{LANDING.heroCard.role}</span>
              </div>
              <div style={{ marginTop: 10, display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 18 }}>
                {LANDING.heroCard.chips.map((c) => (
                  <span key={c.t} style={{ fontSize: 13, color: TEXT3 }}><strong style={{ color: '#fff', fontWeight: 800 }}>{c.t}</strong> {c.s}</span>
                ))}
              </div>
            </div>
          </Reveal>
        </section>
      </div>

      <PressStrip />

      <section style={{ padding: SECY_LG + ' ' + PADX }}>
        <Reveal><TestimonialCard /></Reveal>
      </section>

      {/* ── Section 02: social proof — compact stats strip + result pills ── */}
      <section id="proof" style={{ background: INK2, color: '#fff', padding: 'clamp(30px,5vw,48px) ' + PADX }}>
        <div style={{ maxWidth: MAXW, margin: '0 auto' }}>
          <Reveal>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <div className="rm-eyebrow" style={{ marginBottom: 10, color: ACCENT }}>{LANDING.proof.eyebrow}</div>
              <h2 className="rm-serif" style={{ fontSize: 'clamp(20px,3.2vw,28px)', margin: 0, fontWeight: 800, color: '#fff' }}>{LANDING.proof.heading}</h2>
            </div>
          </Reveal>
          <Reveal>
            <div className="rm-stats" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 1, background: LINE, border: `1px solid ${LINE}`, borderRadius: CARD_RADIUS, overflow: 'hidden' }}>
              {[
                { b: '76', s: 'Coaches & consultants served' },
                { b: '12', s: 'Nations, coached remotely' },
                { b: RATING.score, s: 'Average client rating' },
                { b: '$29', s: 'The entire audit, refundable' },
              ].map((s) => (
                <div key={s.s} style={{ background: INK2, padding: '22px 18px' }}>
                  <strong className="rm-serif" style={{ display: 'block', fontSize: 'clamp(26px,3.6vw,36px)', fontWeight: 800, color: ACCENT, lineHeight: 1 }}>{s.b}</strong>
                  <span style={{ display: 'block', marginTop: 9, fontSize: 12.5, color: 'rgba(255,255,255,.6)', lineHeight: 1.4 }}>{s.s}</span>
                </div>
              ))}
            </div>
          </Reveal>
          <Reveal>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap', marginTop: 20 }}>
              {LANDING.proof.stats.map((st) => (
                <div key={st} style={{ background: 'rgba(255,255,255,.05)', border: `1px solid ${LINE2}`, borderRadius: 999, padding: '10px 18px' }}>
                  <span style={{ fontSize: 13.5, fontWeight: 700, color: '#F2F6EC' }}>{st}</span>
                </div>
              ))}
            </div>
            <p style={{ color: 'rgba(255,255,255,.4)', fontSize: 11.5, textAlign: 'center', marginTop: 14 }}>{LANDING.proof.disclaimer}</p>
          </Reveal>
        </div>
      </section>

      {/* ── Section 03: the problem — more advice vs. an actual diagnosis ── */}
      <section style={{ padding: SECY + ' ' + PADX }}>
        <div style={{ maxWidth: MAXW, margin: '0 auto' }}>
          <Reveal><SectionHead eyebrow={LANDING.problem.eyebrow} heading={LANDING.problem.heading} sub={LANDING.problem.sub} maxW={720} /></Reveal>
          <Reveal>
            <div className="rm-grid2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'clamp(16px,2.5vw,26px)' }}>
              <div style={{ background: CARD, border: `1px solid ${LINE}`, borderRadius: CARD_RADIUS, padding: CARD_PAD }}>
                <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: '.1em', textTransform: 'uppercase', color: TEXT3, marginBottom: 16 }}>{LANDING.problem.moreAdvice.title}</div>
                <div style={{ display: 'grid', gap: 12 }}>
                  {LANDING.problem.moreAdvice.items.map((it) => (
                    <div key={it} style={{ display: 'flex', gap: 10, fontSize: 14.5, color: TEXT2, lineHeight: 1.5 }}>
                      <span aria-hidden style={{ color: '#E8806F', fontWeight: 800, flexShrink: 0 }}>×</span>{it}
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ background: 'linear-gradient(180deg,rgba(201,255,72,.055),' + CARD + ')', border: '1px solid rgba(201,255,72,.28)', borderRadius: CARD_RADIUS, padding: CARD_PAD }}>
                <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: '.1em', textTransform: 'uppercase', color: ACCENT, marginBottom: 16 }}>{LANDING.problem.diagnosis.title}</div>
                <div style={{ display: 'grid', gap: 12 }}>
                  {LANDING.problem.diagnosis.items.map((it) => (
                    <div key={it} style={{ display: 'flex', gap: 10, fontSize: 14.5, color: '#DBE3D6', lineHeight: 1.5 }}>
                      <span aria-hidden style={{ color: ACCENT, fontWeight: 800, flexShrink: 0 }}>✓</span>{it}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>
          <Reveal>
            <div style={{ textAlign: 'center', marginTop: 32 }}>
              <p style={{ fontWeight: 700, fontSize: 16.5, marginBottom: 18 }}>{LANDING.problem.close}</p>
              {CTA('problem_cta')}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Section 04: the 60-minute audit process ── */}
      <section id="call" style={{ background: CARD2, borderTop: `1px solid ${LINE}`, borderBottom: `1px solid ${LINE}`, padding: SECY + ' ' + PADX }}>
        <div style={{ maxWidth: MAXW, margin: '0 auto' }}>
          <Reveal><SectionHead eyebrow={LANDING.call.eyebrow} heading={LANDING.call.heading} sub={LANDING.call.sub} maxW={640} /></Reveal>
          <Reveal>
            <div className="rm-steps5" style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 14, marginTop: 12 }}>
              {LANDING.call.steps.map((s) => (
                <div key={s.n} style={{ background: CARD, border: `1px solid ${LINE}`, borderRadius: 16, padding: 18 }}>
                  <div style={{ marginBottom: 12 }}><StepIcon kind={s.icon} /></div>
                  <div style={{ fontSize: 11, fontWeight: 800, color: ACCENT, letterSpacing: '.08em', marginBottom: 8 }}>STEP {s.n}</div>
                  <h3 style={{ fontSize: 15, fontWeight: 800, margin: '0 0 6px' }}>{s.t}</h3>
                  <p style={{ color: TEXT2, fontSize: 13, lineHeight: 1.5, margin: 0 }}>{s.d}</p>
                </div>
              ))}
            </div>
          </Reveal>
          <Reveal>
            <p style={{ textAlign: 'center', color: TEXT3, fontSize: 13.5, lineHeight: 1.6, maxWidth: 560, margin: '28px auto 0' }}>{LANDING.call.note}</p>
          </Reveal>
        </div>
      </section>

      {/* ── Section 05: everything you receive ── */}
      <section id="deliverables" style={{ padding: SECY + ' ' + PADX }}>
        <div style={{ maxWidth: MAXW, margin: '0 auto' }}>
          <Reveal><SectionHead eyebrow={LANDING.deliverables.eyebrow} heading={LANDING.deliverables.heading} sub={LANDING.deliverables.sub} maxW={680} /></Reveal>
          <Reveal>
            <div className="rm-grid3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 'clamp(14px,2.5vw,20px)' }}>
              {LANDING.deliverables.items.map((d, i) => (
                <div key={d.t} style={{ background: i < 2 ? 'linear-gradient(180deg,rgba(201,255,72,.055),' + CARD + ')' : CARD, border: `1px solid ${i < 2 ? 'rgba(201,255,72,.28)' : LINE}`, borderRadius: CARD_RADIUS, padding: CARD_PAD }}>
                  <div style={{ width: 54, height: 54, borderRadius: 14, background: CARD2, border: `1px solid ${LINE}`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                    <DeliverableIcon kind={d.icon} />
                  </div>
                  <h3 style={{ fontSize: 16, fontWeight: 800, margin: '0 0 8px' }}>{d.t}</h3>
                  <p style={{ color: TEXT2, fontSize: 13.5, lineHeight: 1.55, margin: 0 }}>{d.d}</p>
                  {d.icon === 'download' && (
                    <a href="/documents/sample-audit-report.pdf" target="_blank" rel="noopener noreferrer" onClick={() => track('cta_click', { where: 'sample_pdf' })}
                      className="rm-focus" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginTop: 14, fontSize: 13, fontWeight: 800, color: ACCENT_TEXT, background: ACCENT, borderRadius: 999, padding: '9px 16px' }}>
                      {LANDING.deliverables.sampleCta} <span aria-hidden>→</span>
                    </a>
                  )}
                </div>
              ))}
            </div>
          </Reveal>
          <Reveal>
            <p style={{ textAlign: 'center', color: TEXT3, fontSize: 12.5, lineHeight: 1.6, maxWidth: 560, margin: '18px auto 0' }}>{LANDING.deliverables.sampleNote}</p>
            <p style={{ textAlign: 'center', color: TEXT2, fontSize: 13.5, lineHeight: 1.6, maxWidth: 620, margin: '10px auto 0', fontWeight: 600 }}>{LANDING.deliverables.note}</p>
          </Reveal>
        </div>
      </section>

      {/* ── Section 06: interactive business calculators ── */}
      <section id="calculators" style={{ background: CARD2, borderTop: `1px solid ${LINE}`, borderBottom: `1px solid ${LINE}`, padding: SECY + ' ' + PADX }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <Reveal><SectionHead eyebrow={LANDING.calculators.eyebrow} heading={LANDING.calculators.heading} sub={LANDING.calculators.sub} maxW={640} /></Reveal>
          <Reveal><Calculators /></Reveal>
        </div>
      </section>

      {/* ── Section 07: client results — featured proof cards + expandable grid ── */}
      <section style={{ padding: SECY_LG + ' ' + PADX }}>
        <div style={{ maxWidth: MAXW, margin: '0 auto' }}>
          <Reveal><SectionHead eyebrow={LANDING.caseStudies.eyebrow} heading={LANDING.caseStudies.heading} maxW={640} /></Reveal>
          <Reveal>
            <div className="rm-grid3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 'clamp(14px,2.5vw,20px)' }}>
              {featuredProof.map((c) => <ProofCard key={c.name} c={c} />)}
            </div>
          </Reveal>
          {restProof.length > 0 && (
            <>
              {showAllProof && (
                <Reveal>
                  <div className="rm-grid3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 'clamp(14px,2.5vw,20px)', marginTop: 'clamp(14px,2.5vw,20px)' }}>
                    {restProof.map((c) => <ProofCard key={c.name} c={c} />)}
                  </div>
                </Reveal>
              )}
              <div style={{ textAlign: 'center', marginTop: 28 }}>
                <button onClick={() => setShowAllProof((v) => !v)} className="rm-focus"
                  style={{ background: 'transparent', border: `1px solid ${LINE2}`, color: '#F2F6EC', borderRadius: 999, padding: '12px 22px', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                  {showAllProof ? 'Show fewer results' : `Show all ${orderedProof.length} client results`}
                </button>
              </div>
            </>
          )}
          <Reveal>
            <div style={{ marginTop: SECY_LG }}><TestimonialCard index={8} /></div>
          </Reveal>
        </div>
      </section>

      {/* ── Video testimonials: real on-camera client reviews, shown before
             the founder section per the priority ordering ── */}
      <section id="proof2" style={{ background: CARD2, borderTop: `1px solid ${LINE}`, borderBottom: `1px solid ${LINE}`, padding: SECY + ' ' + PADX }}>
        <div style={{ maxWidth: MAXW, margin: '0 auto' }}>
          <Reveal><SectionHead eyebrow="On-Camera · Paid Consultation Reviews" heading="Hear it from them directly." sub="Unscripted reactions from clients after their Roadmap Session. Tap any clip to play." maxW={620} /></Reveal>
          <Reveal><VideoWall columns={3} limit={9} /></Reveal>
        </div>
      </section>

      {/* ── Section 08: founder / credibility — editorial two-column layout ── */}
      <section id="why-us" style={{ background: INK2, color: '#fff', padding: SECY + ' ' + PADX }}>
        <div style={{ maxWidth: 820, margin: '0 auto' }}>
          <Reveal><SectionHead eyebrow={LANDING.founder.eyebrow} heading={LANDING.founder.heading} dark maxW={640} /></Reveal>
          <div style={{ display: 'grid', gap: 20, marginTop: 4 }}>
            {[
              { photo: '/images/founder.png', ...LANDING.founder },
              { ...LANDING.founder2 },
            ].map((p) => (
              <Reveal key={p.name}>
                <div style={{ background: 'rgba(255,255,255,.04)', border: `1px solid ${LINE2}`, borderRadius: 20, padding: 'clamp(22px,4vw,34px)', display: 'flex', gap: 24, alignItems: 'flex-start', flexWrap: 'wrap' }} className="rm-founder-row">
                  <div style={{ flexShrink: 0, textAlign: 'center', width: 140, margin: '0 auto' }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.photo} alt={p.name} style={{ width: 120, height: 120, borderRadius: '50%', objectFit: 'cover', border: '3px solid rgba(255,255,255,.2)' }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 260 }}>
                    {'creds' in p && p.creds && (
                      <p style={{ fontSize: 13, color: 'rgba(255,255,255,.65)', margin: '0 0 14px' }}>{p.creds.join(', ')}</p>
                    )}
                    <blockquote style={{ margin: '0 0 14px', paddingLeft: 16, borderLeft: '3px solid ' + ACCENT, color: '#fff', fontSize: 16.5, lineHeight: 1.55, fontStyle: 'italic' }}>&ldquo;{p.quote}&rdquo;</blockquote>
                    <p style={{ color: 'rgba(255,255,255,.7)', fontSize: 14.5, lineHeight: 1.65, margin: '0 0 14px' }}>{p.body}</p>
                    <div style={{ fontWeight: 800, fontSize: 14.5 }}>{p.name}</div>
                    <div style={{ color: 'rgba(255,255,255,.5)', fontSize: 12.5 }}>{p.role}</div>
                    {'credsNote' in p && p.credsNote && (
                      <p style={{ fontSize: 12, color: 'rgba(255,255,255,.45)', marginTop: 10, maxWidth: 480 }}>{p.credsNote}</p>
                    )}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
          {/* Two real photos backing the "recruited by" claim above: a
              ClickFunnels event and the Millionaire Mindset Mastermind. */}
          <Reveal>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 20, marginTop: 20 }}>
              <figure style={{ margin: 0 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/images/founder-clickfunnels-event.webp" alt="Indrodip Ghosh at a ClickFunnels event" style={{ width: '100%', aspectRatio: '3/4', objectFit: 'cover', borderRadius: 16, boxShadow: '0 20px 40px -20px rgba(0,0,0,.6)' }} />
                <figcaption style={{ textAlign: 'center', marginTop: 10, fontSize: 13, color: 'rgba(255,255,255,.55)' }}>At a ClickFunnels event.</figcaption>
              </figure>
              <figure style={{ margin: 0 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/images/founder-mastermind-event.webp" alt="Indrodip Ghosh at the Millionaire Mindset Mastermind" style={{ width: '100%', aspectRatio: '3/4', objectFit: 'cover', borderRadius: 16, boxShadow: '0 20px 40px -20px rgba(0,0,0,.6)' }} />
                <figcaption style={{ textAlign: 'center', marginTop: 10, fontSize: 13, color: 'rgba(255,255,255,.55)' }}>At the Millionaire Mindset Mastermind.</figcaption>
              </figure>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Section 09: FAQ accordion + final booking card ── */}
      <section id="faq" style={{ padding: SECY + ' ' + PADX }}>
        <div style={{ maxWidth: 740, margin: '0 auto' }}>
          <Reveal><SectionHead eyebrow={LANDING.faq.eyebrow} heading={LANDING.faq.heading} maxW={620} /></Reveal>
          <Reveal><FaqAccordion items={LANDING.faq.items} /></Reveal>
        </div>
      </section>

      <section id="apply" style={{ background: INK2, padding: SECY + ' ' + PADX }}>
        <div style={{ maxWidth: 820, margin: '0 auto' }}>
          <Reveal>
            <div style={{ textAlign: 'center', marginBottom: 28 }}>
              <div className="rm-eyebrow" style={{ marginBottom: 12, color: ACCENT }}>{LANDING.apply.eyebrow}</div>
              <h2 className="rm-serif" style={{ fontSize: 'clamp(24px,4vw,38px)', margin: 0, fontWeight: 800, color: '#fff', lineHeight: 1.12, maxWidth: 680, marginLeft: 'auto', marginRight: 'auto' }}>{LANDING.apply.heading}</h2>
            </div>
          </Reveal>
          <Reveal>
            <div style={{ background: 'linear-gradient(160deg,rgba(201,255,72,.11),rgba(201,255,72,.02))', border: '1px solid rgba(201,255,72,.24)', borderRadius: 26, padding: 'clamp(26px,5vw,48px)', textAlign: 'center' }}>
              <div className="rm-cols2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 30px', textAlign: 'left', maxWidth: 560, margin: '0 auto 24px' }}>
                {LANDING.apply.includes.map((it) => (
                  <div key={it} style={{ display: 'flex', gap: 10, fontSize: 14, color: '#DBE3D6', lineHeight: 1.4 }}>
                    <span aria-hidden style={{ color: ACCENT, fontWeight: 800, flexShrink: 0 }}>✓</span>{it}
                  </div>
                ))}
              </div>
              <div style={{ fontSize: 14, color: TEXT2, fontWeight: 700, marginBottom: 20 }}>{LANDING.apply.priceNote}</div>
              <div style={{ display: 'flex', justifyContent: 'center' }}>{CTA('apply_card')}</div>
              <p style={{ color: ACCENT, fontSize: 13, fontWeight: 800, marginTop: 16, maxWidth: 560, marginLeft: 'auto', marginRight: 'auto' }}>{LANDING.guarantee}</p>
            </div>
          </Reveal>
          <Reveal>
            <p style={{ color: 'rgba(255,255,255,.55)', fontSize: 12.5, marginTop: 28, maxWidth: 680, margin: '28px auto 0', textAlign: 'center' }}>{LANDING.apply.micro}</p>
          </Reveal>
        </div>
      </section>

      <Footer legal={LEGAL} />

      {/* Sticky mobile CTA */}
      <div className="rm-sticky-cta" style={{ position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 60, padding: '10px 14px calc(10px + env(safe-area-inset-bottom))', background: 'rgba(7,10,6,.92)', backdropFilter: 'saturate(140%) blur(12px)', borderTop: `1px solid ${LINE}`, transform: showSticky ? 'translateY(0)' : 'translateY(120%)', transition: 'transform .3s cubic-bezier(.2,.7,.2,1)', boxShadow: '0 -8px 30px -20px rgba(0,0,0,.6)' }}>
        <a href={AUDIT_CHECKOUT_URL} onClick={() => track('cta_click', { where: 'sticky' })} className="rm-focus" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', gap: 4, background: ACCENT, color: ACCENT_TEXT, border: 'none', borderRadius: 999, padding: '15px 20px', fontSize: 15.5, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', textDecoration: 'none' }}>{LANDING.ctaStandard} <span aria-hidden>→</span></a>
      </div>

      <style>{`
        .rm-sticky-cta{display:none}
        @media(max-width:768px){.rm-sticky-cta{display:block}footer{padding-bottom:100px!important}}
        @media(max-width:900px){.rm-hero{flex-direction:column;text-align:center}.rm-hero > div:first-child{text-align:center}.rm-hero p{margin-left:auto;margin-right:auto}.rm-hero-ctas,.rm-hero-guarantee,.rm-hero-rating>div{justify-content:center!important}}
        @media(min-width:769px) and (max-width:1024px){.rm-grid3{grid-template-columns:1fr 1fr!important}.rm-steps5{grid-template-columns:1fr 1fr 1fr!important}}
        @media(max-width:768px){.rm-grid2,.rm-grid3,.rm-steps5,.rm-stats,.rm-calc-grid,.rm-cols2{grid-template-columns:1fr!important}.rm-founder-row{flex-direction:column;align-items:center!important;text-align:center}}
      `}</style>
    </div>
  )
}
