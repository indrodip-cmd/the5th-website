'use client'
/* /event/the-shift — "The 3-Day Breakthrough Intensive", a $27 live event
   hosted by Indrodip Ghosh (Aug 7–9). Built to the5th.consulting's editorial
   house style: Cormorant Garamond + DM Sans, plum hero, forest-green solid
   CTAs, gold hairline accents. Payment via the Whop EMBEDDED checkout (dark
   theme, gold accent); the js.whop.com loader lives in the root layout and we
   re-inject it here to survive client-side navigation. "The Shift" is the
   donation program tied to the guarantee — not the event name. */
import { useEffect } from 'react'

/* ── Whop checkout config ── */
const WHOP_PLAN_ID = 'plan_ZXh5ZISKwiWDy'
const WHOP_ACCENT = '#c3a348' // gold accent
const WHOP_BG = '#35213c' // dark plum checkout background
const RETURN_URL = 'https://the5th.consulting/event/the-shift/thank-you'
const WHOP_HOSTED_URL = 'https://whop.com/10kroadmap-org/the-shift-b0/'

/* Live session time: 11:00 AM PT (PDT, UTC-7 in August). */
const TIME_LINE = '11:00 AM PT · 12 PM MT · 1 PM CT · 2 PM ET · 6 PM GMT'

const CLIENT_AVATARS = Array.from({ length: 8 }, (_, i) => `/clients/c${i + 1}.jpg`)

const DAYS = [
  {
    n: 'Day One',
    date: 'Thu · Aug 7',
    title: 'Overcome Your Mental & Money Blocks',
    body:
      "The real reason you've been stuck was never a missing strategy. Today we name the invisible obstacle out loud — the fear, the old money story, the self-doubt wearing the disguise of perfectionism — and move past it. You leave with a why strong enough to survive the hard days.",
    take: 'Name the block that has quietly run your business for years.',
  },
  {
    n: 'Day Two',
    date: 'Fri · Aug 8',
    title: 'Create Your Offer',
    body:
      'Most offers fail before they ever launch — because they describe what you do instead of what changes for the person you help. With a simple four-part framework, you build an offer so specific your ideal client thinks, “how does she know exactly what I’m going through?” That isn’t marketing anymore. That’s trust.',
    take: 'Walk away with a clear, specific offer you actually believe in.',
  },
  {
    n: 'Day Three',
    date: 'Sat · Aug 9',
    title: 'Get Better at Sales & Close With Confidence',
    body:
      "Selling isn't manipulation — it's helping someone make a decision that's already right for them, faster than they'd reach it alone. You get the exact call structure, the two objections that surface most, and the words to handle them with warmth instead of pressure.",
    take: 'Learn to sell it without ever feeling pushy or gross.',
  },
]

const WALKAWAY = [
  'The real reason you’ve been stuck — and how to finally move past it',
  'A clear, specific offer you feel genuinely confident selling',
  'A simple, honest sales approach that never feels forced',
  'Three days of live teaching, plus replays and a printable workbook',
  'Live hot-seat coaching — your offer and words workshopped in real time',
]

const PAINS = [
  'You’ve invested in courses before and didn’t get the traction you hoped for.',
  'You know you’re good at what you do — but talking about it makes you shrink.',
  'You undercharge, then quietly resent it.',
  'You’re not short on information. You’re short on clarity and belief.',
]

const INCLUDES = [
  '3 live sessions with Indrodip (Aug 7, 8 & 9)',
  'Live hot-seat coaching on your offer & your words',
  'Lifetime recordings + The Breakthrough Workbook',
  '7 days of The5th AI, free',
  '30-day money-back guarantee (or it funds The Shift)',
]

/* Itemised value stack. Prices are anchoring values (what each piece is worth
   sold separately); attendees get all of it for $27. */
const VALUE_STACK = [
  { item: 'The 3-Day Breakthrough Intensive', desc: '3 live sessions — blocks, offer & sales — with Indrodip', price: '$497' },
  { item: 'Live Hot-Seat Coaching', desc: 'Your offer and your exact words, workshopped live in the room', price: '$300' },
  { item: 'The Breakthrough Workbook', desc: 'Our printable, fill-in companion so every insight sticks', price: '$47' },
  { item: 'Lifetime Session Recordings', desc: 'Every session, yours to re-watch whenever you need it', price: '$97' },
  { item: '7 Days of The5th AI — Free', desc: 'Your AI business coach, on call the moment the event ends', price: '$47' },
  { item: 'Bonus: The Offer & Sales Scripts', desc: 'The exact frameworks and objection responses from Days 2 & 3', price: '$37' },
]
const VALUE_TOTAL = '$1,025'

const FAQ = [
  {
    q: 'Who is this really for?',
    a: 'Coaches, consultants and service providers — often 40+ — who feel capable and experienced but stuck. You’ve likely invested before and didn’t get the traction you hoped for. You’re not looking for more information. You’re looking for someone to finally make it make sense.',
  },
  {
    q: 'What if I can’t attend live?',
    a: 'Come live if you can — the hot-seat coaching is where the magic happens. But every session is recorded, and you get replay access plus the workbook, so nothing is lost if life gets in the way.',
  },
  {
    q: 'Is $27 really the full price?',
    a: 'Yes. $27 for all three days. It’s intentionally low so the decision is easy — and because of how the guarantee works, it may end up costing you nothing at all.',
  },
  {
    q: 'Will I be pitched the whole time?',
    a: 'No. You’ll get a genuinely transformative experience worth far more than $27. On Day 3 you’ll hear about what comes next if you want it — but only after you already have your block named, your offer built, and your sales approach in hand.',
  },
]

const CHECK = (stroke: string) => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
)

export default function TheShiftView() {
  // Guarantee the Whop embedded-checkout loader runs on this route even after
  // client-side SPA navigation (it also lives in the root layout).
  useEffect(() => {
    const SRC = 'https://js.whop.com/static/checkout/loader.js'
    if (!document.querySelector(`script[src="${SRC}"]`)) {
      const s = document.createElement('script')
      s.src = SRC
      s.async = true
      document.body.appendChild(s)
    }
  }, [])

  return (
    <div className="ts-root">
      <style>{CSS}</style>

      {/* ── Nav ── */}
      <nav className="ts-nav">
        <div className="ts-nav__in">
          <a href="/" aria-label="The5th Consulting">
            <img src="/images/logo.png" alt="The5th Consulting" className="ts-nav__logo" />
          </a>
          <a href="#reserve" className="ts-btn ts-btn--green ts-btn--sm">
            Reserve your seat · $27
          </a>
        </div>
      </nav>

      {/* ── Hero (plum) ── */}
      <header className="ts-hero">
        <div className="ts-hero__in">
          <div className="ts-eyebrow ts-eyebrow--gold">A Live 3-Day Intensive · August 7–9, 2026</div>
          <h1 className="ts-h1 ts-hero__title">
            The 3-Day Breakthrough <em>Intensive</em>
          </h1>
          <p className="ts-lede">
            Three days to clear the block that’s kept you stuck, build an offer you actually believe in, and learn to
            sell it — <em className="ts-i-gold">without ever feeling pushy.</em>
          </p>

          <div className="ts-time-chip">
            <span className="ts-time-chip__dot" /> Live at {TIME_LINE}
          </div>

          <div className="ts-hero__cta">
            <a href="#reserve" className="ts-btn ts-btn--light">
              Claim your seat — $27
            </a>
            <a href="#arc" className="ts-textlink ts-textlink--onplum">
              See the 3-day arc ↓
            </a>
          </div>

          <div className="ts-hero__proof">
            <div className="ts-avatars">
              {CLIENT_AVATARS.map((src, i) => (
                <img
                  key={src}
                  src={src}
                  alt=""
                  onError={(e) => {
                    ;(e.currentTarget as HTMLImageElement).style.display = 'none'
                  }}
                  style={{ marginLeft: i === 0 ? 0 : -12 }}
                />
              ))}
            </div>
            <div className="ts-hero__proofText">
              Hosted by <strong>Indrodip Ghosh</strong> · trusted by coaches &amp; consultants worldwide
            </div>
          </div>
        </div>
      </header>

      {/* ── Promise ── */}
      <section className="ts-band ts-band--parch">
        <div className="ts-sec ts-narrow ts-center">
          <hr className="ts-rule" />
          <p className="ts-statement">
            You don’t fail to reach your income goal because of your skills, your marketing, or your strategy. You get
            stuck because of a block you’ve <em className="ts-i-plum">never named out loud</em>. In three days, we name
            it — and move past it, together.
          </p>
        </div>
      </section>

      {/* ── Is this you ── */}
      <section className="ts-band ts-band--mid">
        <div className="ts-sec">
          <div className="ts-center ts-head">
            <div className="ts-eyebrow">Is this you?</div>
            <h2 className="ts-h2">Capable, experienced — and quietly stuck.</h2>
          </div>
          <div className="ts-pains">
            {PAINS.map((t) => (
              <div key={t} className="ts-pain">
                <span className="ts-pain__mark">—</span>
                <span>{t}</span>
              </div>
            ))}
          </div>
          <p className="ts-center ts-muted ts-mt">If you nodded even once, this was built for you.</p>
        </div>
      </section>

      {/* ── 3-day arc ── */}
      <section id="arc" className="ts-band ts-band--parch">
        <div className="ts-sec">
          <div className="ts-center ts-head">
            <div className="ts-eyebrow">The 3-day arc</div>
            <h2 className="ts-h2">Each day delivers one real breakthrough.</h2>
            <p className="ts-muted ts-sub">Nothing withheld. You get the real thing, every single day.</p>
          </div>
          <div className="ts-days">
            {DAYS.map((d) => (
              <article key={d.n} className="ts-day">
                <div className="ts-day__top">
                  <span className="ts-day__n">{d.n}</span>
                  <span className="ts-day__date">{d.date} · 11 AM PT</span>
                </div>
                <h3 className="ts-day__title">{d.title}</h3>
                <p className="ts-day__body">{d.body}</p>
                <div className="ts-day__take">
                  <span className="ts-day__takeMark">{CHECK('#1C4A32')}</span>
                  {d.take}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── Walk away ── */}
      <section className="ts-band ts-band--mid">
        <div className="ts-sec ts-walk">
          <div className="ts-walk__intro">
            <div className="ts-eyebrow">What you’ll walk away with</div>
            <h2 className="ts-h2">Three days that pay for themselves in the first hour.</h2>
            <hr className="ts-rule ts-rule--left" />
          </div>
          <ul className="ts-checklist">
            {WALKAWAY.map((f) => (
              <li key={f}>
                <span className="ts-checklist__mark">{CHECK('#B0902F')}</span>
                {f}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── Founder ── */}
      <section className="ts-band ts-band--plum">
        <div className="ts-sec ts-bio">
          <div className="ts-bio__portrait">
            <img src="/images/founder.png" alt="Indrodip Ghosh" />
          </div>
          <div className="ts-bio__text">
            <div className="ts-eyebrow ts-eyebrow--gold">Your host</div>
            <h2 className="ts-h2 ts-h2--onplum">Indrodip Ghosh</h2>
            <p>
              I know what it feels like to believe in something completely and watch it fall apart anyway. I put close
              to <strong>$30,000</strong> into courses and masterminds looking for the piece I thought I was missing. I
              worked out of cafés because I couldn’t afford an office. I lost count of failed sales calls somewhere past{' '}
              <strong>300</strong>.
            </p>
            <p>
              What I lacked was never effort or ideas — it was clarity on one thing. That obsession with understanding
              business, psychology, marketing, sales, and how people really make decisions became my career. Today I’ve
              advised Fortune 500 executives, billion-dollar companies, celebrity coaches, government organizations, and
              entrepreneurs around the world.
            </p>
            <p className="ts-bio__pull">
              These three days are the exact process I wish someone had walked me through years ago.
            </p>
          </div>
        </div>
      </section>

      {/* ── Value stack ── */}
      <section className="ts-band ts-band--mid">
        <div className="ts-sec ts-narrow">
          <div className="ts-center ts-head">
            <div className="ts-eyebrow">Everything you get</div>
            <h2 className="ts-h2">
              Over <em className="ts-i-plum">{VALUE_TOTAL}</em> of value. Yours today for $27.
            </h2>
          </div>
          <div className="ts-stack">
            {VALUE_STACK.map((v) => (
              <div key={v.item} className="ts-stack__row">
                <span className="ts-stack__mark">{CHECK('#B0902F')}</span>
                <div className="ts-stack__body">
                  <div className="ts-stack__item">{v.item}</div>
                  <div className="ts-stack__desc">{v.desc}</div>
                </div>
                <span className="ts-stack__price">{v.price}</span>
              </div>
            ))}
            <div className="ts-stack__total">
              <span>Total value</span>
              <span className="ts-stack__totalVal">{VALUE_TOTAL}</span>
            </div>
            <div className="ts-stack__today">
              <span>Your price today</span>
              <span className="ts-stack__todayVal">$27</span>
            </div>
          </div>
          <div className="ts-center" style={{ marginTop: 30 }}>
            <a href="#reserve" className="ts-btn ts-btn--green">
              Get all of it for $27
            </a>
          </div>
        </div>
      </section>

      {/* ── Guarantee / The Shift ── */}
      <section className="ts-band ts-band--parch">
        <div className="ts-sec ts-narrow">
          <div className="ts-guarantee">
            <div className="ts-eyebrow ts-eyebrow--onGreen">Zero risk · Real impact</div>
            <h2 className="ts-guarantee__h">The 30-Day, No-Questions Guarantee</h2>
            <p className="ts-guarantee__p">
              Show up, do the work, and if you don’t feel it was worth far more than $27, email us within{' '}
              <strong>30 days</strong> for a full refund. No questions, no forms, no hoops.
            </p>
            <div className="ts-guarantee__box">
              And here’s the part that makes this different: <strong>if you don’t ask for a refund</strong>, we donate
              your entire registration to <em className="ts-i-gold">The Shift</em> — a children’s wellness program
              supporting kids in war-affected countries. Your $27 either transforms your business, or changes a child’s
              week. There is no version of this where you lose.
            </div>
          </div>
        </div>
      </section>

      {/* ── Reserve / checkout ── */}
      <section id="reserve" className="ts-band ts-band--mid ts-reserve">
        <div className="ts-sec ts-checkout">
          <div className="ts-checkout__left">
            <div className="ts-eyebrow">Reserve your seat</div>
            <h2 className="ts-h2">One decision. Three days. A different business.</h2>
            <p className="ts-muted ts-sub">
              All three live sessions, hot-seat coaching, replays and the workbook — for the price of a lunch you’d
              forget by Friday.
            </p>
            <ul className="ts-checklist ts-checklist--tight">
              {INCLUDES.map((f) => (
                <li key={f}>
                  <span className="ts-checklist__mark ts-checklist__mark--green">{CHECK('#1C4A32')}</span>
                  {f}
                </li>
              ))}
            </ul>
          </div>

          <div className="ts-checkout__right">
            <div className="ts-price-card">
              <div className="ts-price-card__eyebrow">The 3-Day Breakthrough Intensive</div>
              <div className="ts-price-card__value">{VALUE_TOTAL} value</div>
              <div className="ts-price-card__price">
                <span className="ts-price-card__amt">$27</span>
                <span className="ts-price-card__cad">one time</span>
              </div>
              <div className="ts-price-card__note">Instant confirmation · all 3 days + replays + bonuses</div>

              {/* Whop embedded checkout — dark theme, gold accent */}
              <div
                data-whop-checkout-plan-id={WHOP_PLAN_ID}
                data-whop-checkout-theme="dark"
                data-whop-checkout-theme-accent-color={WHOP_ACCENT}
                data-whop-checkout-theme-background-color={WHOP_BG}
                data-whop-checkout-redirect-url={RETURN_URL}
                className="ts-whop"
              />

              <div className="ts-price-card__secure">Secure checkout · powered by Whop · 30-day guarantee</div>
              <a href={WHOP_HOSTED_URL} className="ts-price-card__fallback">
                Trouble checking out? Open secure checkout →
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="ts-band ts-band--parch">
        <div className="ts-sec ts-narrow">
          <div className="ts-center ts-head">
            <div className="ts-eyebrow">Questions</div>
            <h2 className="ts-h2">Before you decide</h2>
          </div>
          <div className="ts-faq">
            {FAQ.map((f) => (
              <div key={f.q} className="ts-faq__item">
                <div className="ts-faq__q">{f.q}</div>
                <p className="ts-faq__a">{f.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA (plum) ── */}
      <section className="ts-band ts-band--plum ts-final">
        <div className="ts-sec ts-narrow ts-center">
          <hr className="ts-rule" />
          <h2 className="ts-h1 ts-final__h">
            Three days from now, you could finally know your <em>why</em>, your offer, and your words.
          </h2>
          <p className="ts-final__p">
            August 7, 8 &amp; 9 · 11 AM PT · just $27. And if it doesn’t land, it funds a child’s wellness instead.
          </p>
          <a href="#reserve" className="ts-btn ts-btn--light">
            Claim your seat — $27
          </a>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="ts-footer">
        <div className="ts-footer__links">
          <a href="/privacy">Privacy</a>
          <span>·</span>
          <a href="/terms">Terms</a>
          <span>·</span>
          <a href="/refund">Refund</a>
        </div>
        © 2026 The5th Consulting · Hosted by Indrodip Ghosh
      </footer>
    </div>
  )
}

/* ── Styles: driven by the5th brand tokens (see public/index.html) ── */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,300;1,400;1,600&family=DM+Sans:wght@300;400;500;600&display=swap');

.ts-root{
  --plum:#3D2645;--plum-dark:#2E1A35;--plum-mid:#4E3158;
  --gold:#C9A84C;--gold-dk:#B0902F;--gold-soft:rgba(201,168,76,.12);
  --green:#1C4A32;--green-dk:#143826;
  --ink:#1A1A2E;--ink-mid:#403b3b;--muted:#8A8075;
  --parch:#FAF6F0;--parch-mid:#F2EDE6;--parch-deep:#EAE3D8;--border:#DDD8CF;
  --serif:'Cormorant Garamond',Georgia,Times,serif;
  --sans:'DM Sans',system-ui,-apple-system,sans-serif;
  background:var(--parch);color:var(--ink);font-family:var(--sans);
  overflow-x:hidden;-webkit-font-smoothing:antialiased;
}
.ts-root em{font-style:italic}
@keyframes tsRise{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:none}}

/* Nav */
.ts-nav{position:sticky;top:0;z-index:40;background:rgba(250,246,240,.86);backdrop-filter:blur(10px);border-bottom:1px solid var(--border)}
.ts-nav__in{max-width:1120px;margin:0 auto;padding:13px 24px;display:flex;align-items:center;justify-content:space-between}
.ts-nav__logo{height:32px;width:auto;display:block}

/* Buttons */
.ts-btn{display:inline-block;font-family:var(--sans);font-weight:600;font-size:.9375rem;letter-spacing:.02em;padding:1.05rem 2.4rem;border:none;cursor:pointer;text-decoration:none;transition:background .2s ease,color .2s ease,transform .2s ease,box-shadow .2s ease}
.ts-btn--sm{padding:.7rem 1.35rem;font-size:.82rem}
.ts-btn--green{background:var(--green);color:#fff}
.ts-btn--green:hover{background:var(--green-dk);transform:translateY(-1px);box-shadow:0 12px 30px rgba(20,56,38,.28)}
.ts-btn--light{background:#fff;color:var(--plum)}
.ts-btn--light:hover{background:var(--parch);color:var(--plum-dark);transform:translateY(-1px);box-shadow:0 14px 34px rgba(0,0,0,.18)}

.ts-textlink{font-family:var(--sans);font-weight:500;font-size:.9375rem;text-decoration:none;color:var(--gold-dk);transition:color .15s ease}
.ts-textlink:hover{color:var(--gold)}
.ts-textlink--onplum{color:rgba(255,255,255,.72)}
.ts-textlink--onplum:hover{color:#fff}

/* Eyebrow + rules */
.ts-eyebrow{font-family:var(--sans);font-size:.6875rem;font-weight:600;letter-spacing:.16em;text-transform:uppercase;color:var(--gold-dk)}
.ts-eyebrow--gold{color:var(--gold)}
.ts-eyebrow--onGreen{color:#D8E8DC}
.ts-rule{width:44px;height:1.5px;background:var(--gold);border:0;margin:0 auto 22px}
.ts-rule--left{margin:20px 0 0}

/* Layout helpers */
.ts-sec{max-width:1120px;margin:0 auto;padding:0 24px}
.ts-narrow{max-width:760px}
.ts-center{text-align:center}
.ts-band{padding:clamp(56px,8vw,92px) 0}
.ts-band--parch{background:var(--parch)}
.ts-band--mid{background:var(--parch-mid)}
.ts-band--plum{background:var(--plum);color:#fff}
.ts-head{margin-bottom:44px}
.ts-mt{margin-top:26px}
.ts-sub{margin-top:12px}
.ts-muted{color:var(--muted);font-size:1.0625rem;line-height:1.6}

/* Type */
.ts-h1{font-family:var(--serif);font-weight:600;font-size:clamp(2.6rem,6vw,4.6rem);line-height:1.02;letter-spacing:-.03em;margin:0}
.ts-h1 em{font-weight:300;color:var(--gold)}
.ts-h2{font-family:var(--serif);font-weight:600;font-size:clamp(2rem,4vw,3rem);line-height:1.08;letter-spacing:-.02em;color:var(--plum);margin:12px 0 0}
.ts-h2--onplum{color:#fff}
.ts-lede{font-family:var(--sans);font-weight:300;font-size:clamp(1.05rem,2vw,1.3rem);line-height:1.7;color:rgba(255,255,255,.82);max-width:560px;margin:22px auto 0}
.ts-i-gold{color:var(--gold-dk)}
.ts-lede .ts-i-gold,.ts-final em{color:var(--gold)}
.ts-i-plum{color:var(--plum)}
.ts-statement{font-family:var(--serif);font-size:clamp(1.5rem,3.2vw,2.15rem);line-height:1.4;color:var(--ink);margin:0}
.ts-statement em{color:var(--plum-mid)}

/* Hero */
.ts-hero{position:relative;background:var(--plum);color:#fff;overflow:hidden}
.ts-hero:before{content:'';position:absolute;inset:0;background:radial-gradient(120% 90% at 50% -20%,rgba(201,168,76,.14) 0%,transparent 55%);pointer-events:none}
.ts-hero:after{content:'';position:absolute;left:0;right:0;bottom:0;height:70px;background:linear-gradient(to top,var(--parch),transparent);pointer-events:none}
.ts-hero__in{position:relative;z-index:1;max-width:900px;margin:0 auto;padding:clamp(70px,10vw,112px) 24px clamp(66px,8vw,92px);text-align:center;animation:tsRise .6s ease}
.ts-hero__title{margin:18px 0 0;color:#fff}
.ts-hero__title em{color:var(--gold)}
.ts-time-chip{display:inline-flex;align-items:center;gap:.6rem;margin-top:26px;padding:.6rem 1.15rem;border:1px solid rgba(255,255,255,.2);border-radius:999px;font-size:.82rem;letter-spacing:.02em;color:rgba(255,255,255,.85)}
.ts-time-chip__dot{width:7px;height:7px;border-radius:50%;background:var(--gold);box-shadow:0 0 0 4px rgba(201,168,76,.22)}
.ts-hero__cta{display:flex;align-items:center;justify-content:center;gap:1.6rem;flex-wrap:wrap;margin-top:30px}
.ts-hero__proof{display:flex;align-items:center;justify-content:center;gap:14px;flex-wrap:wrap;margin-top:34px}
.ts-avatars{display:flex}
.ts-avatars img{width:38px;height:38px;border-radius:50%;object-fit:cover;border:2px solid var(--plum);box-shadow:0 2px 8px rgba(0,0,0,.3)}
.ts-hero__proofText{font-size:.875rem;color:rgba(255,255,255,.66)}
.ts-hero__proofText strong{color:#fff;font-weight:600}

/* Pains */
.ts-pains{max-width:820px;margin:0 auto;display:grid;grid-template-columns:1fr 1fr;gap:0 46px}
.ts-pain{display:flex;gap:14px;padding:20px 0;border-bottom:1px solid var(--border);font-size:1.0625rem;line-height:1.55;color:var(--ink-mid)}
.ts-pain__mark{color:var(--gold-dk);font-weight:600}

/* Days */
.ts-days{display:grid;grid-template-columns:repeat(3,1fr);gap:22px}
.ts-day{background:#fff;border:1px solid var(--border);padding:32px 30px;display:flex;flex-direction:column;transition:transform .2s ease,box-shadow .2s ease}
.ts-day:hover{transform:translateY(-3px);box-shadow:0 22px 50px rgba(46,26,53,.1)}
.ts-day__top{display:flex;align-items:baseline;justify-content:space-between;margin-bottom:14px}
.ts-day__n{font-family:var(--serif);font-style:italic;font-weight:500;font-size:1.5rem;color:var(--gold-dk)}
.ts-day__date{font-size:.78rem;letter-spacing:.06em;text-transform:uppercase;color:var(--muted)}
.ts-day__title{font-family:var(--serif);font-weight:600;font-size:1.6rem;line-height:1.12;color:var(--plum);margin:0 0 12px}
.ts-day__body{font-size:.95rem;line-height:1.65;color:var(--ink-mid);margin:0;flex:1}
.ts-day__take{display:flex;gap:9px;align-items:flex-start;margin-top:20px;padding-top:16px;border-top:1px solid var(--border);font-size:.9rem;font-weight:500;color:var(--green);line-height:1.45}
.ts-day__takeMark{margin-top:2px;flex-shrink:0}

/* Walk away / checklist */
.ts-walk{display:grid;grid-template-columns:1fr 1fr;gap:56px;align-items:center}
.ts-checklist{list-style:none;margin:0;padding:0;display:grid;gap:18px}
.ts-checklist--tight{gap:14px;margin-top:26px}
.ts-checklist li{display:flex;gap:14px;align-items:flex-start;font-size:1.0625rem;line-height:1.5;color:var(--ink)}
.ts-checklist__mark{width:24px;height:24px;border-radius:50%;background:var(--gold-soft);flex-shrink:0;display:flex;align-items:center;justify-content:center;margin-top:1px}
.ts-checklist__mark--green{background:#eaf3ee}

/* Bio */
.ts-bio{display:grid;grid-template-columns:300px 1fr;gap:52px;align-items:center}
.ts-bio__portrait{justify-self:center;position:relative}
.ts-bio__portrait img{width:300px;max-width:76vw;display:block;object-fit:cover;border:1px solid rgba(201,168,76,.4);box-shadow:0 26px 60px rgba(0,0,0,.34)}
.ts-bio__text p{font-size:1.0625rem;line-height:1.75;color:rgba(255,255,255,.82);margin:16px 0 0;font-weight:300}
.ts-bio__text strong{color:#fff;font-weight:600}
.ts-bio__pull{font-family:var(--serif)!important;font-style:italic;font-size:1.45rem!important;line-height:1.4!important;color:var(--gold)!important;margin-top:22px!important}

/* Value stack */
.ts-stack{background:#fff;border:1px solid var(--border);padding:clamp(20px,4vw,36px) clamp(20px,4vw,40px);box-shadow:0 22px 56px rgba(46,26,53,.08)}
.ts-stack__row{display:flex;align-items:flex-start;gap:16px;padding:18px 0;border-bottom:1px solid var(--border)}
.ts-stack__mark{width:24px;height:24px;border-radius:50%;background:var(--gold-soft);flex-shrink:0;display:flex;align-items:center;justify-content:center;margin-top:2px}
.ts-stack__body{flex:1}
.ts-stack__item{font-family:var(--serif);font-weight:600;font-size:1.32rem;line-height:1.2;color:var(--plum)}
.ts-stack__desc{font-size:.9rem;line-height:1.5;color:var(--muted);margin-top:3px}
.ts-stack__price{font-family:var(--sans);font-weight:600;font-size:1rem;color:var(--gold-dk);white-space:nowrap;margin-top:2px}
.ts-stack__total{display:flex;align-items:center;justify-content:space-between;padding:20px 0 4px;font-family:var(--sans);font-size:1.02rem;color:var(--muted)}
.ts-stack__totalVal{font-family:var(--serif);font-size:1.5rem;color:var(--ink-mid);text-decoration:line-through;text-decoration-color:rgba(138,128,117,.7)}
.ts-stack__today{display:flex;align-items:center;justify-content:space-between;padding:14px 18px;margin-top:10px;background:var(--parch-mid);border:1px solid var(--gold);font-weight:600;color:var(--plum)}
.ts-stack__todayVal{font-family:var(--serif);font-weight:600;font-size:2rem;color:var(--green)}

/* Guarantee */
.ts-guarantee{background:linear-gradient(165deg,#1f4230 0%,var(--green) 62%,#173d2a 100%);color:#EAF3EC;padding:clamp(30px,5vw,52px);text-align:center;box-shadow:0 26px 64px rgba(20,56,38,.24)}
.ts-guarantee__h{font-family:var(--serif);font-weight:600;font-size:clamp(1.9rem,3.6vw,2.6rem);line-height:1.14;color:#fff;margin:14px 0 0}
.ts-guarantee__p{font-size:1.05rem;line-height:1.7;color:#DCEAE0;max-width:560px;margin:16px auto 0}
.ts-guarantee__box{margin-top:22px;padding:22px 24px;border:1px solid rgba(255,255,255,.18);background:rgba(255,255,255,.06);font-size:1.02rem;line-height:1.7;color:#F1F8F3}
.ts-guarantee__box .ts-i-gold{color:var(--gold)}

/* Reserve / checkout */
.ts-checkout{display:grid;grid-template-columns:1fr minmax(0,430px);gap:56px;align-items:start}
.ts-checkout__right{position:sticky;top:88px}
.ts-price-card{background:linear-gradient(165deg,#402a4c 0%,var(--plum-dark) 60%,#251530 100%);border:1px solid rgba(201,168,76,.3);padding:28px 24px 24px;box-shadow:0 30px 70px rgba(46,26,53,.34)}
.ts-price-card__eyebrow{text-align:center;font-family:var(--sans);font-size:.68rem;font-weight:600;letter-spacing:.14em;text-transform:uppercase;color:var(--gold)}
.ts-price-card__value{text-align:center;font-size:.82rem;color:rgba(255,255,255,.55);text-decoration:line-through;margin-top:8px}
.ts-price-card__price{display:flex;align-items:baseline;justify-content:center;gap:7px;margin-top:2px}
.ts-price-card__amt{font-family:var(--serif);font-weight:600;font-size:3.4rem;line-height:1;color:var(--gold)}
.ts-price-card__cad{font-size:.9rem;color:rgba(255,255,255,.66)}
.ts-price-card__note{text-align:center;font-size:.78rem;color:rgba(255,255,255,.6);margin-top:6px}
.ts-whop{max-width:500px;width:100%;margin:14px auto 0;min-height:80px;overflow:hidden}
.ts-price-card__secure{text-align:center;font-size:.72rem;color:rgba(255,255,255,.5);margin-top:12px;line-height:1.5}
.ts-price-card__fallback{display:block;text-align:center;font-size:.76rem;color:var(--gold);text-decoration:underline;margin-top:8px}

/* FAQ */
.ts-faq{display:grid;gap:0;border-top:1px solid var(--border)}
.ts-faq__item{padding:26px 4px;border-bottom:1px solid var(--border)}
.ts-faq__q{font-family:var(--serif);font-weight:600;font-size:1.4rem;color:var(--plum);margin-bottom:8px}
.ts-faq__a{font-size:1rem;line-height:1.65;color:var(--ink-mid);margin:0}

/* Final */
.ts-final__h{color:#fff;font-size:clamp(2.1rem,4.6vw,3.4rem)}
.ts-final__h em{color:var(--gold)}
.ts-final__p{font-size:1.0625rem;line-height:1.6;color:#E6DCEC;margin:18px 0 28px}

/* Footer */
.ts-footer{text-align:center;font-size:.8rem;color:var(--muted);background:var(--parch-deep);padding:30px 20px 36px}
.ts-footer__links{margin-bottom:10px;display:flex;gap:10px;justify-content:center;align-items:center}
.ts-footer__links a{color:var(--ink-mid);text-decoration:none}
.ts-footer__links a:hover{color:var(--plum)}

/* Responsive */
@media(max-width:860px){
  .ts-days{grid-template-columns:1fr}
  .ts-walk{grid-template-columns:1fr;gap:28px}
  .ts-bio{grid-template-columns:1fr;gap:26px;text-align:center}
  .ts-bio__pull{text-align:center}
  .ts-checkout{grid-template-columns:1fr;gap:30px}
  .ts-checkout__right{position:static}
  .ts-pains{grid-template-columns:1fr;gap:0}
}
@media(max-width:520px){
  .ts-nav__in{padding:11px 16px}
  .ts-hero__cta{flex-direction:column;gap:16px}
  .ts-btn{width:100%;text-align:center}
}
`
