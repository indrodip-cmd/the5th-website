'use client'
/* Post-booking $1 offer — "Expertise To Income" workbook + 3 bonuses + 7-day
   The5th AI trial, priced at $1 today, auto-converting to $47/mo on day 7.

   This is a negative-option (trial-to-recurring) offer, so the recurring-billing
   terms are disclosed in plain language ABOVE every CTA — never in fine print —
   and checkout is gated behind an explicit acknowledgement checkbox, per FTC
   "click-to-cancel" / negative-option guidance. Card capture + a second
   disclosure happen inside the Whop embedded checkout itself.

   Checkout is Whop's embedded checkout (js.whop.com loader lives in the root
   layout). On success Whop redirects to RETURN_URL (/checkout/complete). */
import { useState } from 'react'

// ---- Brand tokens (shared with the rest of the site) ---------------------
const CREAM = '#FAF6F0'
const FOREST = '#1C4A32'
const GOLD = '#C9A84C'
const GOLD_DK = '#a9862f'
const PLUM = '#3D2645'
const INK = '#2a2233'
const MUTE = '#57505f'

// Whop plan configured as: $1 today → $47/mo starting day 7.
const PLAN_ID = process.env.NEXT_PUBLIC_WHOP_TRIAL_PLAN_ID || 'plan_falzVWtF41bQS'
const RETURN_URL =
  process.env.NEXT_PUBLIC_WHOP_TRIAL_RETURN_URL || 'https://the5th.consulting/checkout/complete'

const CHAPTERS: { t: string; d: string }[] = [
  { t: 'The 3-Layer Why Method', d: 'So the first hard week doesn’t take you out.' },
  { t: 'The Time-Money Trap Audit', d: 'See exactly where you’re stuck trading hours for dollars.' },
  { t: 'Your Expertise Inventory', d: 'Find the offer hiding inside knowledge that feels “too obvious.” It never is.' },
  { t: 'The $7 → $10K Product Ladder', d: 'How real digital product businesses actually scale.' },
  { t: 'The One Person Method', d: 'Stop speaking to everyone. Speak to the one person who buys.' },
  { t: 'The Complete Offer Stack', d: 'Bonuses, guarantee, pricing, and your one-sentence sales promise.' },
  { t: 'Your 7-Day Launch Plan', d: 'Written out day by day, post by post, script by script.' },
  { t: 'The Mindset Chapter', d: 'What to do on the slow days — because there will be slow days.' },
]

const BONUSES: { tag: string; t: string; d: string; v: string }[] = [
  { tag: 'Free trial', t: '7 Days of The5th AI', d: 'Our most premium AI system — think through your offer, audience, and launch in real time, right beside the workbook.', v: '$47/mo value' },
  { tag: 'Bonus', t: 'The 90-Day Content Calendar', d: '90 days of topics, pre-planned, so you’re never staring at a blank screen.', v: '$47 value' },
  { tag: 'Bonus', t: 'The Product Blueprint Template', d: 'The exact one-page planning doc we use with paying clients.', v: '$29 value' },
  { tag: 'Bonus', t: 'The Offer Stack Builder', d: 'A fill-in-the-blank doc that builds your full offer description in under 30 minutes.', v: '$29 value' },
]

export default function BookOffer({ firstName }: { firstName?: string }) {
  const [agreed, setAgreed] = useState(false)
  const [checkoutOpen, setCheckoutOpen] = useState(false)

  return (
    <div style={{ maxWidth: 860, margin: '0 auto', animation: 'rise .5s ease' }}>
      <style>{css}</style>

      {/* Bridge from the confirmation into the offer */}
      <p style={{ textAlign: 'center', fontSize: 15, color: MUTE, lineHeight: 1.6, maxWidth: 620, margin: '0 auto 10px' }}>
        <b style={{ color: PLUM }}>Before our call — read this.</b> It’ll make our 20 minutes worth 10x more.
      </p>

      {/* ---- HERO ------------------------------------------------------- */}
      <section className="bo-hero">
        <div className="bo-hero-copy">
          <div className="bo-eyebrow">A gift before we talk</div>
          <h2 className="bo-h2">
            You didn’t book this call <span style={{ color: GOLD }}>by accident.</span>
          </h2>
          <p className="bo-lede">
            Something in you is done. Done trading hours for money. Done watching other people package what
            they know into something that sells while you sit on years of expertise nobody’s paying for yet.
          </p>
          <p className="bo-lede">
            I get it — because I’ve lived it. So before our call, I want you to have the exact system I used to
            go from zero clients to my first <b style={{ color: PLUM }}>$10K month</b>. It’s called{' '}
            <b style={{ color: PLUM }}>Expertise&nbsp;To&nbsp;Income</b>.
          </p>

          <div className="bo-price">
            <span className="bo-strike">$27</span>
            <span className="bo-now">$1 today</span>
            <span className="bo-price-note">because you booked a call</span>
          </div>

          <button type="button" className="bo-cta bo-cta-hero" onClick={scrollToFinal}>
            Get the book for $1 →
          </button>
          <p className="bo-microtrust">365-day money-back guarantee · Instant access · Cancel the trial anytime</p>
        </div>

        {/* CSS book mockup */}
        <div className="bo-book-wrap" aria-hidden>
          <div className="bo-book">
            <div className="bo-book-cover">
              <div className="bo-book-emblem">THE5TH</div>
              <div className="bo-book-title">Expertise<br />To Income</div>
              <div className="bo-book-rule" />
              <div className="bo-book-sub">The system for turning what you know into something that sells</div>
              <div className="bo-book-author">INDRODIP GHOSH</div>
            </div>
          </div>
          <div className="bo-book-badge">9-chapter<br /><b>workbook</b></div>
        </div>
      </section>

      {/* ---- STORY ------------------------------------------------------ */}
      <section className="bo-card bo-story">
        <p>
          I spent years building an agency, working with international clients. From the outside it looked like
          success. From the inside I was exhausted — every client who left felt like a loss I couldn’t recover
          from. I’d built a business that couldn’t run without me. <b>That’s not a business. That’s a job with
          extra steps.</b>
        </p>
        <p style={{ marginBottom: 0 }}>
          In 2024 I started over. Zero clients. But this time I used the one thing I’d been hiding — my story.
          By the end of that year I’d served 20+ clients and hit my first $10K month. Not with ads. Not with a
          big team. <b style={{ color: FOREST }}>With clarity, story, and a simple system.</b> That system is
          what’s inside this workbook — and I want you to have it before we even talk.
        </p>
      </section>

      {/* ---- WHAT'S INSIDE --------------------------------------------- */}
      <section>
        <h3 className="bo-h3">What’s inside the workbook</h3>
        <p className="bo-sub">
          Not a PDF you skim once and forget — a worksheet-by-worksheet workbook, the same frameworks I walk
          paying clients through. Every chapter ends by locking in what you just built, so by the last page
          you’re not “inspired.” You’re ready.
        </p>
        <div className="bo-grid">
          {CHAPTERS.map((c, i) => (
            <div className="bo-chip" key={c.t}>
              <div className="bo-chip-num">{String(i + 1).padStart(2, '0')}</div>
              <div>
                <div className="bo-chip-t">{c.t}</div>
                <div className="bo-chip-d">{c.d}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ---- BONUS STACK ----------------------------------------------- */}
      <section>
        <h3 className="bo-h3">And since you’re already in — more on top</h3>
        <div className="bo-bonus-list">
          {BONUSES.map((b) => (
            <div className="bo-bonus" key={b.t}>
              <div className="bo-bonus-check">✦</div>
              <div style={{ flex: 1 }}>
                <div className="bo-bonus-head">
                  <span className="bo-bonus-tag">{b.tag}</span>
                  <span className="bo-bonus-t">{b.t}</span>
                </div>
                <div className="bo-bonus-d">{b.d}</div>
              </div>
              <div className="bo-bonus-v">{b.v}</div>
            </div>
          ))}
        </div>
        <p className="bo-exclude">
          Your 7-day trial unlocks <b>The5th AI only</b>. Vega and other platform features aren’t included in
          the trial.
        </p>
      </section>

      {/* ---- GUARANTEE -------------------------------------------------- */}
      <section className="bo-card bo-guarantee">
        <div className="bo-seal">365</div>
        <div>
          <div className="bo-guarantee-t">A full-year, no-questions guarantee</div>
          <p style={{ margin: 0 }}>
            Not 7 days. Not 30. A full year. Read it, work through it, use the AI trial — and if it hasn’t paid
            for itself many times over, email me and I’ll refund your dollar. I’m not worried, because I’ve
            watched this exact material take people from stuck to their first sale.
          </p>
        </div>
      </section>

      {/* ---- FINAL CTA + DISCLOSURE ------------------------------------ */}
      <section id="bo-final" className="bo-final">
        <div className="bo-stack">
          <div className="bo-stack-row"><span>Expertise To Income workbook</span><span>$27</span></div>
          <div className="bo-stack-row"><span>7 days of The5th AI</span><span>$47/mo value</span></div>
          <div className="bo-stack-row"><span>90-Day Content Calendar</span><span>$47</span></div>
          <div className="bo-stack-row"><span>Product Blueprint Template</span><span>$29</span></div>
          <div className="bo-stack-row"><span>Offer Stack Builder</span><span>$29</span></div>
          <div className="bo-stack-total"><span>Your price today</span><span className="bo-stack-price">$1</span></div>
        </div>

        {/* Plain-language, unmissable negative-option disclosure — above the CTA. */}
        <div className="bo-disclosure">
          <div className="bo-disclosure-h">Please read before you buy</div>
          <p>
            Your <b>$1 today</b> unlocks the book, all 3 bonuses, and <b>7 days of free access to The5th AI</b>{' '}
            (Vega and other platform features aren’t included in the trial). <b>On day 7, unless you cancel,
            your card will be automatically charged $47 and billed monthly</b> until you cancel — no long-term
            commitment. You can cancel anytime, self-serve, from your membership dashboard. The book itself is
            still backed by the 365-day money-back guarantee.
          </p>
        </div>

        <label className="bo-ack">
          <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />
          <span>
            I understand I’m starting a $1, 7-day trial that automatically becomes <b>$47/month on day 7
            unless I cancel</b>, and that I can cancel anytime from my dashboard.
          </span>
        </label>

        <button
          type="button"
          disabled={!agreed}
          className={`bo-cta bo-cta-final ${agreed ? '' : 'bo-cta-off'}`}
          onClick={() => agreed && setCheckoutOpen(true)}
        >
          Get the book for $1 →
        </button>
        {!agreed && <p className="bo-tick">Tick the box above to continue</p>}

        <p className="bo-after">
          You already made the harder decision when you booked this call. This is the easy one. Right after
          checkout you’ll get <b>two emails</b>: one with your book &amp; bonuses (plus your call reminder), and
          one with your 7-day The5th AI trial access.
        </p>
      </section>

      <div className="bo-legal">
        Billing is handled securely by Whop. The 7-day trial converts to a recurring $47/month subscription on
        day 7 unless cancelled beforehand. Cancel anytime from your membership dashboard — cancelling during
        the trial means no $47 charge; cancelling after conversion keeps access until the end of the current
        billing period with no further charges.
      </div>

      {checkoutOpen && (
        <CheckoutModal firstName={firstName} onClose={() => setCheckoutOpen(false)} />
      )}
    </div>
  )
}

// ---- Whop embedded checkout, in a focused premium modal -------------------
function CheckoutModal({ firstName, onClose }: { firstName?: string; onClose: () => void }) {
  return (
    <div className="bo-modal" onClick={onClose}>
      <div className="bo-modal-card" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="bo-modal-x" onClick={onClose} aria-label="Close">✕</button>
        <div className="bo-modal-head">
          <div className="bo-modal-eyebrow">Secure checkout · Powered by Whop</div>
          <h3 className="bo-modal-title">
            Start your $1 trial{firstName ? `, ${firstName}` : ''}
          </h3>
          <p className="bo-modal-note">
            $1 today. On day 7, unless you cancel, your card is charged $47/mo — cancel anytime.
          </p>
        </div>
        {/* Whop embedded checkout — the loader script (in layout) mounts this. */}
        <div
          data-whop-checkout-plan-id={PLAN_ID}
          data-whop-checkout-return-url={RETURN_URL}
          style={{ height: 'fit-content', overflow: 'hidden', maxWidth: 500, margin: '0 auto', width: '100%' }}
        />
      </div>
    </div>
  )
}

function scrollToFinal() {
  document.getElementById('bo-final')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

const css = `
  .bo-hero{display:grid;grid-template-columns:1fr minmax(0,300px);gap:40px;align-items:center;margin:22px 0 8px}
  .bo-eyebrow{display:inline-block;font-size:11.5px;font-weight:700;letter-spacing:2.5px;text-transform:uppercase;color:${GOLD_DK};margin-bottom:14px}
  .bo-h2{font-family:Gelica,Georgia,serif;font-size:clamp(28px,4.4vw,42px);font-weight:700;letter-spacing:-.02em;line-height:1.08;color:${INK};margin:0 0 16px}
  .bo-lede{font-size:16px;color:${MUTE};line-height:1.65;margin:0 0 14px}
  .bo-price{display:flex;align-items:baseline;gap:12px;flex-wrap:wrap;margin:22px 0 18px}
  .bo-strike{font-size:22px;color:#b3abbb;text-decoration:line-through;font-weight:600}
  .bo-now{font-family:Gelica,Georgia,serif;font-size:34px;font-weight:700;color:${FOREST}}
  .bo-price-note{font-size:13px;color:${MUTE}}
  .bo-cta{display:inline-block;background:linear-gradient(145deg,${GOLD},${GOLD_DK});color:#1a1206;font-weight:800;font-size:17px;letter-spacing:.01em;padding:17px 34px;border-radius:14px;text-decoration:none;box-shadow:0 12px 34px rgba(169,134,47,.34);transition:transform .18s ease,box-shadow .18s ease;border:none;cursor:pointer;font-family:inherit}
  .bo-cta:hover{transform:translateY(-2px);box-shadow:0 18px 44px rgba(169,134,47,.42)}
  .bo-cta-off{background:#e7e2ec;color:#9c94a6;box-shadow:none;cursor:not-allowed}
  .bo-cta-off:hover{transform:none;box-shadow:none}
  .bo-microtrust{font-size:12.5px;color:${MUTE};margin-top:12px}

  .bo-book-wrap{position:relative;display:flex;justify-content:center}
  .bo-book{perspective:1200px}
  .bo-book-cover{width:240px;height:330px;border-radius:6px 12px 12px 6px;background:linear-gradient(135deg,${PLUM} 0%,#241428 100%);box-shadow:0 30px 60px rgba(40,20,50,.4),inset 8px 0 14px rgba(0,0,0,.35),inset -1px 0 0 rgba(255,255,255,.06);transform:rotateY(-16deg) rotateX(3deg);transform-style:preserve-3d;padding:30px 26px 26px 34px;display:flex;flex-direction:column;color:#fff;position:relative}
  .bo-book-cover::before{content:'';position:absolute;left:14px;top:0;bottom:0;width:2px;background:rgba(255,255,255,.10)}
  .bo-book-emblem{font-size:11px;font-weight:700;letter-spacing:4px;color:${GOLD}}
  .bo-book-title{font-family:Gelica,Georgia,serif;font-size:30px;font-weight:700;line-height:1.08;margin-top:auto;color:#fff}
  .bo-book-rule{width:46px;height:3px;background:${GOLD};margin:14px 0}
  .bo-book-sub{font-size:11.5px;line-height:1.45;color:rgba(255,255,255,.72)}
  .bo-book-author{margin-top:16px;font-size:10.5px;font-weight:700;letter-spacing:2.5px;color:${GOLD}}
  .bo-book-badge{position:absolute;right:-6px;top:-14px;background:linear-gradient(145deg,${GOLD},${GOLD_DK});color:#1a1206;font-size:12px;line-height:1.2;text-align:center;padding:12px 14px;border-radius:50%;width:78px;height:78px;display:flex;flex-direction:column;justify-content:center;box-shadow:0 10px 24px rgba(169,134,47,.4);transform:rotate(8deg)}

  .bo-card{background:#fff;border:1px solid #ece7f0;border-radius:20px;padding:30px 34px;box-shadow:0 10px 34px rgba(40,20,50,.05);margin:30px 0}
  .bo-story{font-size:15.5px;color:${MUTE};line-height:1.7}
  .bo-story p{margin:0 0 14px}
  .bo-story b{color:${INK}}

  .bo-h3{font-family:Gelica,Georgia,serif;font-size:clamp(22px,3vw,28px);font-weight:700;color:${INK};text-align:center;margin:44px 0 8px}
  .bo-sub{font-size:15px;color:${MUTE};line-height:1.6;text-align:center;max-width:640px;margin:0 auto 24px}
  .bo-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px}
  .bo-chip{display:flex;gap:14px;align-items:flex-start;background:#fff;border:1px solid #ece7f0;border-radius:14px;padding:16px 18px;box-shadow:0 6px 20px rgba(40,20,50,.04)}
  .bo-chip-num{font-family:Gelica,Georgia,serif;font-size:20px;font-weight:700;color:${GOLD};flex-shrink:0;line-height:1.2}
  .bo-chip-t{font-size:15px;font-weight:700;color:${INK};margin-bottom:3px}
  .bo-chip-d{font-size:13.5px;color:${MUTE};line-height:1.5}

  .bo-bonus-list{display:flex;flex-direction:column;gap:12px}
  .bo-bonus{display:flex;gap:16px;align-items:center;background:#fff;border:1px solid #ece7f0;border-radius:14px;padding:16px 20px;box-shadow:0 6px 20px rgba(40,20,50,.04)}
  .bo-bonus-check{color:${GOLD};font-size:20px;flex-shrink:0}
  .bo-bonus-head{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:3px}
  .bo-bonus-tag{font-size:10px;font-weight:800;letter-spacing:1px;text-transform:uppercase;color:${FOREST};background:#eaf7ef;padding:3px 8px;border-radius:999px}
  .bo-bonus-t{font-size:15.5px;font-weight:700;color:${INK}}
  .bo-bonus-d{font-size:13.5px;color:${MUTE};line-height:1.5}
  .bo-bonus-v{font-size:13px;font-weight:700;color:${GOLD_DK};white-space:nowrap;flex-shrink:0}
  .bo-exclude{font-size:13px;color:${MUTE};text-align:center;margin:16px auto 0;max-width:560px}

  .bo-guarantee{display:flex;gap:22px;align-items:center;background:linear-gradient(135deg,#f2f8f4,#fff)}
  .bo-seal{width:78px;height:78px;flex-shrink:0;border-radius:50%;border:3px solid ${FOREST};color:${FOREST};font-family:Gelica,Georgia,serif;font-weight:700;font-size:26px;display:flex;align-items:center;justify-content:center;box-shadow:inset 0 0 0 3px #fff,0 8px 20px rgba(28,74,50,.14)}
  .bo-guarantee-t{font-family:Gelica,Georgia,serif;font-size:19px;font-weight:700;color:${FOREST};margin-bottom:6px}
  .bo-guarantee p{font-size:14.5px;color:${MUTE};line-height:1.65}

  .bo-final{background:#fff;border:1px solid #ece7f0;border-radius:22px;padding:32px 34px;box-shadow:0 18px 50px rgba(40,20,50,.08);margin:40px 0 0}
  .bo-stack{border:1px dashed #ded7e4;border-radius:14px;padding:6px 18px;margin-bottom:22px}
  .bo-stack-row{display:flex;justify-content:space-between;gap:12px;padding:11px 0;border-bottom:1px solid #f1edf4;font-size:14.5px;color:${MUTE}}
  .bo-stack-total{display:flex;justify-content:space-between;align-items:center;padding:14px 0 12px;font-size:16px;font-weight:700;color:${INK}}
  .bo-stack-price{font-family:Gelica,Georgia,serif;font-size:30px;font-weight:700;color:${FOREST}}

  .bo-disclosure{background:#fff8ec;border:1px solid ${GOLD};border-left:4px solid ${GOLD};border-radius:12px;padding:16px 18px;margin-bottom:18px}
  .bo-disclosure-h{font-size:11px;font-weight:800;letter-spacing:1.5px;text-transform:uppercase;color:${GOLD_DK};margin-bottom:8px}
  .bo-disclosure p{font-size:14px;color:#4a4130;line-height:1.6;margin:0}

  .bo-ack{display:flex;gap:12px;align-items:flex-start;font-size:14px;color:${INK};line-height:1.55;background:${CREAM};border:1px solid #ece7f0;border-radius:12px;padding:14px 16px;margin-bottom:18px;cursor:pointer}
  .bo-ack input{width:20px;height:20px;flex-shrink:0;margin-top:1px;accent-color:${FOREST};cursor:pointer}

  .bo-cta-final{width:100%;text-align:center;box-sizing:border-box}
  .bo-tick{text-align:center;font-size:12.5px;color:${GOLD_DK};margin-top:10px}
  .bo-after{font-size:14px;color:${MUTE};line-height:1.6;text-align:center;margin:18px auto 0;max-width:600px}
  .bo-after b{color:${PLUM}}

  .bo-legal{font-size:11.5px;color:#a99fb2;line-height:1.6;text-align:center;max-width:680px;margin:22px auto 0}

  .bo-modal{position:fixed;inset:0;z-index:3000;display:flex;align-items:center;justify-content:center;padding:20px;background:rgba(28,20,40,.55);backdrop-filter:blur(6px);animation:rise .25s ease}
  .bo-modal-card{position:relative;background:${CREAM};border-radius:22px;width:100%;max-width:560px;max-height:92vh;overflow:auto;padding:26px 24px 28px;box-shadow:0 30px 90px rgba(20,10,30,.4);border:1px solid #ece7f0}
  .bo-modal-x{position:absolute;top:14px;right:16px;width:32px;height:32px;border-radius:50%;border:none;background:#fff;color:${MUTE};font-size:15px;cursor:pointer;box-shadow:0 4px 12px rgba(40,20,50,.1)}
  .bo-modal-head{text-align:center;margin-bottom:18px}
  .bo-modal-eyebrow{font-size:10.5px;font-weight:800;letter-spacing:1.5px;text-transform:uppercase;color:${FOREST}}
  .bo-modal-title{font-family:Gelica,Georgia,serif;font-size:24px;font-weight:700;color:${INK};margin:8px 0 6px}
  .bo-modal-note{font-size:12.5px;color:${MUTE};line-height:1.5;max-width:380px;margin:0 auto}

  @media(max-width:760px){
    .bo-hero{grid-template-columns:1fr;gap:30px;text-align:center}
    .bo-price{justify-content:center}
    .bo-book-wrap{order:-1}
    .bo-book-cover{transform:rotateY(-12deg)}
    .bo-grid{grid-template-columns:1fr}
    .bo-guarantee{flex-direction:column;text-align:center}
    .bo-bonus{flex-wrap:wrap}
    .bo-card,.bo-final{padding:24px 20px}
  }
`
