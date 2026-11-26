'use client'
/* Graphic and interactive blocks for the /book sales page. Everything here is
   either decoration or the visitor's own arithmetic: nothing invents a
   statistic, a review or a deadline. */
import { useEffect, useRef, useState } from 'react'
import { T } from '../10k-roadmap/config'
import { ftrack } from './funnel'
import { BOOK_PRICE, BOOK_CHECKOUT_PATH, BOOK_GUARANTEE_DAYS } from './config'
import { mark } from './events'

/* ── icons (24-unit strokes, same family as the book) ── */
const PATHS: Record<string, string> = {
  clock: '<circle cx="24" cy="24" r="18"/><path d="M24 12v13l9 5"/>',
  target: '<circle cx="24" cy="24" r="17"/><circle cx="24" cy="24" r="10"/><circle cx="24" cy="24" r="3"/>',
  shield: '<path d="M24 5l15 5v12c0 10-6 17-15 21C15 39 9 32 9 22V10z"/><path d="M17 24l5 5 9-10"/>',
  rocket: '<path d="M24 6c8 4 12 12 10 22l-6 6h-8l-6-6C12 18 16 10 24 6z"/><circle cx="24" cy="19" r="3.5"/><path d="M14 30l-6 4 2 6 8-4M34 30l6 4-2 6-8-4"/>',
  bulb: '<path d="M17 33c0-3-5-6-5-12a12 12 0 0 1 24 0c0 6-5 9-5 12z"/><path d="M18 38h12M20 43h8"/>',
  heart: '<path d="M24 41C8 29 6 20 11 14c4-4 10-3 13 2 3-5 9-6 13-2 5 6 3 15-13 27z"/>',
  chat: '<path d="M8 10h32a2 2 0 0 1 2 2v18a2 2 0 0 1-2 2H26l-9 8v-8H8a2 2 0 0 1-2-2V12a2 2 0 0 1 2-2z"/><path d="M15 18h18M15 25h11"/>',
  book: '<path d="M8 10c6-2 12-2 16 2 4-4 10-4 16-2v28c-6-2-12-2-16 2-4-4-10-4-16-2z"/><path d="M24 12v28"/>',
  coin: '<ellipse cx="24" cy="14" rx="14" ry="6"/><path d="M10 14v10c0 3.3 6.3 6 14 6s14-2.7 14-6V14M10 24v10c0 3.3 6.3 6 14 6s14-2.7 14-6V24"/>',
  user: '<circle cx="24" cy="16" r="8"/><path d="M8 42c0-9 7-14 16-14s16 5 16 14"/>',
  lock: '<rect x="9" y="21" width="30" height="21" rx="5"/><path d="M15 21v-6a9 9 0 0 1 18 0v6"/>',
  star: '<path d="M24 5l5.6 12.2 13.4 1.5-10 9 2.8 13.1L24 34l-11.8 6.8 2.8-13.1-10-9 13.4-1.5z"/>',
  flag: '<path d="M12 6v38M12 8h26l-6 9 6 9H12"/>',
  pen: '<path d="M8 40l3-10L33 8l7 7-22 22z"/><path d="M28 13l7 7"/>',
}
export function Icon({ name, size = 24, stroke = 'var(--accent)', sw = 3 }: { name: string; size?: number; stroke?: string; sw?: number }) {
  return <svg width={size} height={size} viewBox="0 0 48 48" fill="none" stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" dangerouslySetInnerHTML={{ __html: PATHS[name] || '' }} />
}

const CARD: React.CSSProperties = { background: 'var(--surface)', border: `1px solid var(--line)`, borderRadius: T.radius }
const money = (n: number) => '$' + Math.round(n).toLocaleString('en-US')

/* ── count-up numbers ── */
export function CountUp({ to, prefix = '', suffix = '', decimals = 0 }: { to: number; prefix?: string; suffix?: string; decimals?: number }) {
  const ref = useRef<HTMLSpanElement | null>(null)
  // Starts at the final value (correct with no JS and for crawlers), then
  // replays from zero the first time it scrolls into view.
  const [v, setV] = useState(to)
  useEffect(() => {
    const el = ref.current; if (!el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || typeof IntersectionObserver === 'undefined') return
    let raf = 0
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return
      io.disconnect()
      const t0 = performance.now(), dur = 1400
      const tick = (t: number) => { const p = Math.min(1, (t - t0) / dur); setV(to * (1 - Math.pow(1 - p, 3))); if (p < 1) raf = requestAnimationFrame(tick) }
      raf = requestAnimationFrame(tick)
    }, { threshold: 0.4 })
    io.observe(el)
    return () => { io.disconnect(); cancelAnimationFrame(raf) }
  }, [to])
  return <span ref={ref}>{prefix}{v.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}{suffix}</span>
}

/* ── Do the math on your time ── */
export function HourMath() {
  const [hours, setHours] = useState(40)
  const [rate, setRate] = useState(75)
  const [sales, setSales] = useState(10)
  const [price, setPrice] = useState(27)
  const time = hours * rate * 48
  const product = sales * price * 52
  const eq = rate > 0 ? product / rate : 0
  const max = Math.max(time, product, 1)
  const slider = (label: string, val: number, set: (n: number) => void, min: number, max_: number, step: number, fmt: (n: number) => string) => (
    <label style={{ display: 'block', marginBottom: 22 }}>
      <span style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', fontSize: 14, color: 'var(--text2)', marginBottom: 10 }}>
        <span>{label}</span><strong style={{ color: 'var(--text)', fontSize: 20, fontFamily: T.serif }}>{fmt(val)}</strong>
      </span>
      <input className="bk-range" type="range" min={min} max={max_} step={step} value={val} onChange={(e) => { set(Number(e.target.value)); mark('math') }} aria-label={label} style={{ width: '100%' }} />
    </label>
  )
  return (
    <div style={{ ...CARD, padding: 'clamp(20px,3.4vw,36px)', background: 'linear-gradient(160deg, var(--cardA), var(--cardB))', borderColor: 'rgba(var(--limeRGB),.22)' }}>
      <div className="bk-math" style={{ display: 'grid', gridTemplateColumns: 'minmax(0,.9fr) minmax(0,1.1fr)', gap: 'clamp(22px,4vw,44px)', alignItems: 'center' }}>
        <div>
          <div className="rm-eyebrow" style={{ marginBottom: 18 }}>Step 1 · Your time</div>
          {slider('Hours you work per week', hours, setHours, 5, 70, 1, (n) => `${n} hrs`)}
          {slider('What an hour of your time is worth', rate, setRate, 15, 500, 5, (n) => `$${n}`)}
          <div className="rm-eyebrow" style={{ margin: '28px 0 18px' }}>Step 2 · Your first product</div>
          {slider('Sales per week (your own guess)', sales, setSales, 1, 60, 1, (n) => `${n} / wk`)}
          <div style={{ fontSize: 14, color: 'var(--text2)', marginBottom: 10 }}>Product price</div>
          <div style={{ display: 'flex', gap: 10 }}>
            {[7, 27, 47, 97].map((p) => (
              <button key={p} onClick={() => setPrice(p)} aria-pressed={price === p} style={{ flex: 1, padding: '11px 0', borderRadius: 12, cursor: 'pointer', fontWeight: 800, fontSize: 15, border: `1px solid ${price === p ? 'var(--accent)' : 'var(--line)'}`, background: price === p ? 'var(--accentSoft)' : 'transparent', color: price === p ? 'var(--accentInk)' : 'var(--text2)' }}>${p}</button>
            ))}
          </div>
        </div>
        <div>
          <div style={{ fontSize: 13, color: 'var(--text3)', marginBottom: 8 }}>What your time earns in a year (48 working weeks)</div>
          <div style={{ height: 46, borderRadius: 12, background: 'rgba(var(--inkRGB),.05)', overflow: 'hidden', marginBottom: 6 }}>
            <div style={{ height: '100%', width: `${(time / max) * 100}%`, minWidth: 6, background: 'linear-gradient(90deg,#ff7a59,#ffb199)', transition: 'width .45s cubic-bezier(.16,1,.3,1)', display: 'flex', alignItems: 'center', paddingLeft: 14, color: '#2a0d05', fontWeight: 800, whiteSpace: 'nowrap' }}>{time / max > 0.3 ? money(time) : ''}</div>
          </div>
          {time / max <= 0.3 && <div style={{ fontWeight: 800, marginBottom: 4 }}>{money(time)}</div>}
          <div style={{ fontSize: 12.5, color: 'var(--text3)', marginBottom: 22 }}>…and it stops the week you stop. There are only so many hours.</div>

          <div style={{ fontSize: 13, color: 'var(--text3)', marginBottom: 8 }}>What one {money(price)} product could add in a year at {sales} sales a week</div>
          <div style={{ height: 46, borderRadius: 12, background: 'rgba(var(--inkRGB),.05)', overflow: 'hidden', marginBottom: 6 }}>
            <div style={{ height: '100%', width: `${(product / max) * 100}%`, minWidth: 6, background: `linear-gradient(90deg, var(--accent), var(--accentHi))`, transition: 'width .45s cubic-bezier(.16,1,.3,1)', display: 'flex', alignItems: 'center', paddingLeft: 14, color: 'var(--accentText)', fontWeight: 800, whiteSpace: 'nowrap' }}>{product / max > 0.3 ? money(product) : ''}</div>
          </div>
          {product / max <= 0.3 && <div style={{ fontWeight: 800, marginBottom: 4, color: 'var(--accentInk)' }}>{money(product)}</div>}
          <div style={{ fontSize: 12.5, color: 'var(--text3)', marginBottom: 24 }}>…built once, sold again and again.</div>

          <div style={{ borderRadius: 16, padding: '18px 20px', background: 'var(--accentSoft)', border: `1px solid rgba(var(--limeRGB),.3)` }}>
            <div style={{ fontSize: 14, color: 'var(--text2)', lineHeight: 1.5 }}>On your own numbers, that product would equal</div>
            <div className="rm-serif" style={{ fontSize: 'clamp(30px,5vw,44px)', color: 'var(--accentInk)', margin: '4px 0' }}>{Math.round(eq).toLocaleString('en-US')} hours</div>
            <div style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.5 }}>of your life you would no longer have to trade. {sales * price * 52 > 0 && eq > 400 ? 'That is more than ten full work weeks.' : ''}</div>
          </div>
        </div>
      </div>
      <p style={{ color: 'var(--text3)', fontSize: 12, lineHeight: 1.6, margin: '22px 0 0' }}>An illustration using the numbers you choose. It is arithmetic, not a forecast or a promise of results. The book teaches how to find, price and launch the product.</p>
    </div>
  )
}

/* ── Try Chapter 1 now (nothing is stored or sent) ── */
export function TryChapter() {
  const [step, setStep] = useState(0)
  const [a, setA] = useState(['', '', ''])
  const prompts = [
    { n: 1, q: 'I want to build this business because...', ph: 'e.g. I want more clients' },
    { n: 2, q: 'And that matters to me because...', ph: 'e.g. so I can stop working weekends' },
    { n: 3, q: 'The real reason, what I am truly fighting for:', ph: 'e.g. because my kids are growing up and I keep missing it' },
  ]
  const set = (i: number, v: string) => setA((p) => p.map((x, j) => (j === i ? v : x)))
  const done = step >= 3
  return (
    <div style={{ ...CARD, padding: 'clamp(22px,3.6vw,40px)', maxWidth: 760, margin: '0 auto', borderColor: 'rgba(var(--limeRGB),.25)', background: 'linear-gradient(160deg,var(--cardA),var(--cardB))' }}>
      <div style={{ display: 'flex', gap: 8, marginBottom: 22 }}>
        {[0, 1, 2].map((i) => <div key={i} style={{ flex: 1, height: 5, borderRadius: 3, background: i < step || done ? 'var(--accent)' : i === step ? 'rgba(var(--limeRGB),.4)' : 'rgba(var(--inkRGB),.1)' }} />)}
      </div>
      {!done ? (
        <>
          <div className="rm-eyebrow" style={{ marginBottom: 10 }}>Layer {prompts[step].n} of 3</div>
          {step > 0 && <p style={{ margin: '0 0 12px', color: 'var(--text3)', fontSize: 14, fontStyle: 'italic' }}>You wrote: “{a[step - 1]}”</p>}
          <label htmlFor="tc" style={{ display: 'block', fontFamily: T.serif, fontWeight: 800, fontSize: 'clamp(20px,3vw,26px)', lineHeight: 1.3, marginBottom: 16 }}>{prompts[step].q}</label>
          <textarea id="tc" rows={3} value={a[step]} onChange={(e) => set(step, e.target.value)} placeholder={prompts[step].ph}
            style={{ width: '100%', boxSizing: 'border-box', padding: '14px 16px', fontSize: 16, lineHeight: 1.5, background: 'rgba(var(--inkRGB),.05)', border: `1px solid var(--lineStrong)`, borderRadius: 12, fontFamily: 'inherit', color: 'var(--text)', outline: 'none', resize: 'vertical' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, gap: 12, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 12.5, color: 'var(--text3)', display: 'flex', alignItems: 'center', gap: 6 }}><Icon name="lock" size={14} stroke={'var(--text3)'} sw={3.4} /> Stays on your device. Nothing is saved or sent.</span>
            <button onClick={() => { if (a[step].trim().length > 1) { setStep(step + 1); if (step === 2) mark('why'); if (step === 0) ftrack('book_cta_click', { where: 'try_chapter_start' }) } }} disabled={a[step].trim().length < 2}
              style={{ padding: '13px 26px', borderRadius: 999, border: 0, fontWeight: 800, fontSize: 15, cursor: a[step].trim().length < 2 ? 'not-allowed' : 'pointer', background: 'var(--accent)', color: 'var(--accentText)', opacity: a[step].trim().length < 2 ? 0.45 : 1 }}>{step < 2 ? 'Go deeper →' : 'Show me my why →'}</button>
          </div>
        </>
      ) : (
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--accent)', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="heart" size={28} stroke={'var(--accentText)'} sw={3} /></div>
          <div className="rm-eyebrow" style={{ marginBottom: 10 }}>Your real reason</div>
          <blockquote className="rm-serif" style={{ fontSize: 'clamp(22px,3.6vw,32px)', margin: '0 0 18px', lineHeight: 1.25, color: 'var(--accentInk)' }}>“{a[2]}”</blockquote>
          <p style={{ color: 'var(--text2)', fontSize: 16, lineHeight: 1.7, margin: '0 auto 22px', maxWidth: 520 }}>You just completed the first exercise of Chapter 1, and it took about two minutes. That reason is what keeps you going when it gets quiet. <strong style={{ color: 'var(--text)' }}>The other eight chapters turn it into a product, an offer and a launch date.</strong></p>
          <a href={BOOK_CHECKOUT_PATH} onClick={() => ftrack('book_cta_click', { where: 'try_chapter_done' })} className="rm-btn" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '17px 34px', borderRadius: 999, background: 'var(--accent)', color: 'var(--accentText)', fontWeight: 800, fontSize: 17, textDecoration: 'none' }}>Continue with the book: {BOOK_PRICE.label} →</a>
          <div><button onClick={() => { setStep(0); setA(['', '', '']) }} style={{ marginTop: 14, background: 'none', border: 0, color: 'var(--text3)', fontSize: 13, cursor: 'pointer', textDecoration: 'underline' }}>Start over</button></div>
        </div>
      )}
    </div>
  )
}

/* ── Two paths, one year from now ── */
export function TwoPaths() {
  const A = ['Same hours, same income ceiling', 'Still “someday” for the product', 'Knowledge nobody can buy yet', 'One more year of trading time']
  const B = ['A product page that is live', 'An offer with a guarantee', 'A content habit that attracts buyers', 'Income that does not need your hours']
  const col = (title: string, tone: 'bad' | 'good', items: string[], line: string) => (
    <div className="bk-spot" style={{ ...CARD, padding: 'clamp(20px,3vw,30px)', height: '100%', position: 'relative', overflow: 'hidden', borderColor: tone === 'good' ? 'rgba(var(--limeRGB),.4)' : 'var(--line)', background: tone === 'good' ? 'linear-gradient(160deg, rgba(var(--limeRGB),.10), rgba(var(--limeRGB),.02))' : 'var(--surface)' }}>
      <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: '.16em', textTransform: 'uppercase', color: tone === 'good' ? 'var(--accentInk)' : 'var(--text3)', marginBottom: 6 }}>{tone === 'good' ? 'Path B' : 'Path A'}</div>
      <h3 style={{ fontFamily: T.serif, fontSize: 'clamp(22px,3vw,28px)', margin: '0 0 18px', lineHeight: 1.2 }}>{title}</h3>
      <svg viewBox="0 0 320 90" width="100%" height="90" aria-hidden="true" style={{ display: 'block', marginBottom: 18 }}>
        <path d="M6 80 H314" stroke="rgba(var(--inkRGB),.14)" strokeWidth="2" />
        <path d={line} stroke={tone === 'good' ? 'var(--accent)' : '#ff7a59'} strokeWidth="5" strokeLinecap="round" fill="none" strokeDasharray={tone === 'good' ? undefined : '2 9'} />
        <circle cx="314" cy={tone === 'good' ? 12 : 56} r="7" fill={tone === 'good' ? 'var(--accent)' : '#ff7a59'} />
      </svg>
      <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 12 }}>
        {items.map((t) => (
          <li key={t} style={{ display: 'flex', gap: 12, fontSize: 16, lineHeight: 1.45, color: tone === 'good' ? 'var(--text)' : 'var(--text2)' }}>
            <span style={{ fontWeight: 800, color: tone === 'good' ? 'var(--accentInk)' : T.danger, flexShrink: 0 }}>{tone === 'good' ? '✓' : '×'}</span>{t}
          </li>
        ))}
      </ul>
    </div>
  )
  return (
    <div className="bk-2" style={{ alignItems: 'stretch' }}>
      {col('You keep things as they are', 'bad', A, 'M6 56 H314')}
      {col('You do the nine chapters', 'good', B, 'M6 78 C 90 76 150 60 200 38 S 280 14 314 12')}
    </div>
  )
}

/* ── Your first 30 days ── */
export function Timeline30() {
  const steps = [
    { w: 'Tonight', icon: 'heart', t: 'Write your real why', d: 'Chapter 1: the 3-layer method, your non-negotiables and a one-sentence 12-month vision.' },
    { w: 'Week 1', icon: 'target', t: 'Find what to sell, and who to sell it to', d: 'Chapters 2 to 4: your expertise inventory and a clear picture of your One Person.' },
    { w: 'Week 2', icon: 'coin', t: 'Design the product and the offer', d: 'Chapters 5 and 6: format, price, sales promise, bonuses and a guarantee.' },
    { w: 'Weeks 3 to 4', icon: 'rocket', t: 'Build the habit and set the date', d: 'Chapters 7 to 9: your content plan, your launch plan with scripts, and your launch date.' },
  ]
  return (
    <div className="bk-4" style={{ position: 'relative' }}>
      {steps.map((s, i) => (
        <div key={s.w} className="bk-spot" style={{ ...CARD, padding: 22, position: 'relative', height: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
            <span style={{ width: 46, height: 46, borderRadius: 14, background: 'var(--accentSoft)', border: '1px solid rgba(var(--limeRGB),.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon name={s.icon} size={24} /></span>
            <span style={{ fontSize: 12, fontWeight: 800, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--accentInk)' }}>{s.w}</span>
          </div>
          <h3 style={{ fontFamily: T.serif, fontSize: 19, lineHeight: 1.25, margin: '0 0 8px' }}>{s.t}</h3>
          <p style={{ color: 'var(--text2)', fontSize: 15, lineHeight: 1.6, margin: 0 }}>{s.d}</p>
          {i < steps.length - 1 && <span className="bk-arrow" aria-hidden="true">→</span>}
        </div>
      ))}
    </div>
  )
}

/* ── Objections ── */
const OBJ = [
  { icon: 'clock', q: '“I do not have time.”', a: 'The book is built for one chapter a week, and each exercise is short. If you can find the time to read this page, you can find 30 minutes for Chapter 1.' },
  { icon: 'lock', q: '“I am not tech-savvy.”', a: 'Chapter 8 explains every tool before it uses it: what a selling platform is, where to click, how to test it. If you can send an email, you can follow it.' },
  { icon: 'user', q: '“I do not have an audience.”', a: 'Your first sales are meant to come from people who already know you, through personal messages. You do not need a following to start.' },
  { icon: 'bulb', q: '“What I know is too basic.”', a: 'Obvious to you is a breakthrough to someone else. Chapter 2 gives you an inventory to prove it, and a real example of a practitioner who thought exactly that.' },
  { icon: 'book', q: '“I have bought courses and quit.”', a: 'This is a workbook, not a video series. Each chapter is short and ends with a page you write on, so you can see yourself finishing it.' },
  { icon: 'shield', q: '“What if it does not work for me?”', a: `Then you get every cent back. You are covered for ${BOOK_GUARANTEE_DAYS} days, a full year. The risk is ours, not yours.` },
]
export function Objections() {
  return (
    <div className="bk-3">
      {OBJ.map((o) => (
        <div key={o.q} className="bk-spot" style={{ ...CARD, padding: 22, height: '100%' }}>
          <span style={{ width: 44, height: 44, borderRadius: 14, background: 'var(--accentSoft)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}><Icon name={o.icon} size={22} /></span>
          <div style={{ fontFamily: T.serif, fontWeight: 800, fontSize: 18, lineHeight: 1.3, marginBottom: 8 }}>{o.q}</div>
          <p style={{ color: 'var(--text2)', fontSize: 15, lineHeight: 1.65, margin: 0 }}>{o.a}</p>
        </div>
      ))}
    </div>
  )
}

/* ── Desktop floating buy pill (phones already have the bottom bar) ── */
export function FloatingBuy() {
  const [show, setShow] = useState(false)
  useEffect(() => {
    const hero = document.getElementById('bk-hero')
    if (!hero || typeof IntersectionObserver === 'undefined') return
    let heroGone = false, nearCta = 0
    const upd = () => setShow(heroGone && nearCta === 0)
    const a = new IntersectionObserver(([e]) => { heroGone = !e.isIntersecting && e.boundingClientRect.top < 0; upd() }, { threshold: 0 })
    a.observe(hero)
    // hide the pill whenever another buy button is already on screen
    const seen = new Set<Element>()
    const b = new IntersectionObserver((entries) => { entries.forEach((e) => { if (e.isIntersecting) seen.add(e.target); else seen.delete(e.target) }); nearCta = seen.size; upd() }, { threshold: 0.2 })
    document.querySelectorAll('a[href="' + BOOK_CHECKOUT_PATH + '"]:not(.bk-float), #bk-final, #checkout').forEach((el) => b.observe(el))
    return () => { a.disconnect(); b.disconnect() }
  }, [])
  return (
    <a href={BOOK_CHECKOUT_PATH} onClick={() => ftrack('book_cta_click', { where: 'floating' })} className="bk-float" style={{ position: 'fixed', left: '50%', bottom: 22, zIndex: 55, transform: `translate(-50%, ${show ? 0 : 140}%)`, opacity: show ? 1 : 0, pointerEvents: show ? 'auto' : 'none', transition: 'transform .4s cubic-bezier(.16,1,.3,1), opacity .3s', display: 'none', alignItems: 'center', gap: 14, padding: '10px 12px 10px 22px', borderRadius: 999, background: 'rgba(12,16,10,.94)', border: `1px solid var(--lineStrong)`, boxShadow: '0 20px 50px -14px rgba(0,0,0,.8), 0 0 0 1px rgba(var(--limeRGB),.15)', backdropFilter: 'blur(14px)', color: 'var(--text)', textDecoration: 'none', fontWeight: 700, fontSize: 15 }}>
      <span>Expertise to Income <span style={{ color: 'var(--text3)', fontWeight: 500 }}>· {BOOK_PRICE.label} · {BOOK_GUARANTEE_DAYS}-day guarantee</span></span>
      <span style={{ background: 'var(--accent)', color: 'var(--accentText)', borderRadius: 999, padding: '11px 20px', fontWeight: 800 }}>Get the book →</span>
    </a>
  )
}
