/* ============================================================================
   THE 3-DAY BREAKTHROUGH INTENSIVE — EMAIL CAMPAIGN
   ----------------------------------------------------------------------------
   One source of truth for every event email + a world-class, mobile-safe HTML
   template that mirrors the /event/the-shift house style (plum + gold, serif
   display, forest-green CTA). Two flows:

     PRESALE  → sell seats to a lead audience (curiosity → proof → scarcity)
     ONBOARD  → post-purchase: welcome → hype → daily reminders

   Pure functions only. Sending + enrollment live in the API routes.
   ========================================================================== */

export const EVENT = {
  name: 'The 3-Day Breakthrough Intensive',
  short: 'Breakthrough Intensive',
  host: 'Indrodip Ghosh',
  price: '$27',
  dates: 'August 7–9, 2026',
  timeLine: '11:00 AM PT · 1:00 PM CT · 2:00 PM ET · 6:00 PM GMT',
  pageUrl: 'https://the5th.consulting/event/the-shift',
  reserveUrl: 'https://the5th.consulting/event/the-shift#reserve',
  thankYouUrl: 'https://the5th.consulting/event/the-shift/thank-you',
  whatsappUrl: 'https://chat.whatsapp.com/BDStDEgHpXeC2hNaxfXCpR',
  logo: 'https://the5th.consulting/images/logo-white.png',
  days: [
    { n: 'Day 1', title: 'Overcome Your Mental & Money Blocks', date: 'Thursday, Aug 7' },
    { n: 'Day 2', title: 'Create Your Offer', date: 'Friday, Aug 8' },
    { n: 'Day 3', title: 'Get Better at Sales & Close With Confidence', date: 'Saturday, Aug 9' },
  ],
}

const C = {
  plum: '#2E1A35',
  plumMid: '#4a2f57',
  gold: '#C9A84C',
  goldDk: '#B0902F',
  green: '#1C4A32',
  greenMid: '#2d6a4f',
  parch: '#FAF6F0',
  ink: '#2b2430',
  inkSoft: '#5a5248',
  border: '#ece4d8',
  wa: '#25D366',
}

export interface EmailCtx {
  name?: string
  unsubUrl?: string
}

/* --- reusable building blocks (all inline-styled for email clients) -------- */

function preheader(text: string) {
  // Hidden preview text that trails invisible spacers so clients don't leak body.
  return `<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;height:0;width:0">${text}${'&nbsp;&zwnj;'.repeat(60)}</div>`
}

export function ctaButton(text: string, href: string, kind: 'gold' | 'green' | 'wa' = 'green') {
  const bg =
    kind === 'wa'
      ? `linear-gradient(180deg,#2CE972 0%,${C.wa} 55%,#1EB958 100%)`
      : kind === 'gold'
        ? `linear-gradient(180deg,#E4C879 0%,${C.gold} 55%,#B8983F 100%)`
        : `linear-gradient(135deg,${C.greenMid},${C.green})`
  const color = kind === 'green' ? '#ffffff' : kind === 'wa' ? '#08331B' : C.plum
  return `
  <table role="presentation" cellpadding="0" cellspacing="0" style="margin:26px auto 6px"><tr><td style="border-radius:999px" bgcolor="${kind === 'green' ? C.green : C.gold}">
    <a href="${href}" target="_blank" style="display:inline-block;padding:16px 40px;background:${bg};color:${color};font-family:Arial,Helvetica,sans-serif;font-weight:700;font-size:16px;letter-spacing:.01em;border-radius:999px;text-decoration:none">${text}</a>
  </td></tr></table>`
}

function dayList() {
  return EVENT.days
    .map(
      (d) => `
    <tr><td style="padding:0 0 10px">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f7f2ec;border-left:3px solid ${C.gold};border-radius:0 10px 10px 0">
        <tr><td style="padding:12px 16px">
          <div style="font-family:Arial,sans-serif;font-size:11px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:${C.goldDk}">${d.n} · ${d.date}</div>
          <div style="font-family:Georgia,serif;font-size:18px;color:${C.plum};margin-top:3px">${d.title}</div>
        </td></tr>
      </table>
    </td></tr>`,
    )
    .join('')
}

function whatsappBlock(required = true) {
  return `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:22px 0">
    <tr><td style="background:#f2fbf4;border:2px solid ${C.wa};border-radius:16px;padding:22px 22px;text-align:center">
      <div style="font-family:Arial,sans-serif;font-size:11px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:#128C4B">${required ? 'Required · Do this first' : 'Join us'}</div>
      <div style="font-family:Georgia,serif;font-size:22px;color:${C.plum};margin:6px 0 8px">Join the WhatsApp community</div>
      <div style="font-family:Arial,sans-serif;font-size:14px;color:#4f5a50;line-height:1.6;max-width:400px;margin:0 auto">Every joining link, reminder and last-minute update goes out in WhatsApp <b>first</b>. If you're not in it, you risk missing the session.</div>
      ${ctaButton('Join the WhatsApp community →', EVENT.whatsappUrl, 'wa')}
    </td></tr>
  </table>`
}

/** World-class responsive shell. */
export function renderEmail(opts: {
  preheaderText: string
  kicker: string
  title: string
  bodyHtml: string
  unsubUrl?: string
}) {
  return `<!DOCTYPE html>
<html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="x-apple-disable-message-reformatting">
<title>${EVENT.short}</title>
</head>
<body style="margin:0;padding:0;background:${C.parch};-webkit-font-smoothing:antialiased">
${preheader(opts.preheaderText)}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.parch}">
  <tr><td align="center" style="padding:26px 14px">
    <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:600px;max-width:100%;background:#ffffff;border-radius:18px;overflow:hidden;box-shadow:0 20px 50px -30px rgba(46,26,53,.5)">

      <!-- Header -->
      <tr><td style="background:linear-gradient(140deg,${C.plumMid},${C.plum} 62%,#1f1128);padding:30px 40px 26px;text-align:center">
        <img src="${EVENT.logo}" alt="The5th Consulting" height="26" style="height:26px;margin-bottom:14px">
        <div style="font-family:Arial,sans-serif;font-size:11px;font-weight:700;letter-spacing:.2em;text-transform:uppercase;color:${C.gold}">${opts.kicker}</div>
        <div style="font-family:Georgia,serif;font-size:27px;line-height:1.2;color:#ffffff;margin-top:8px">${opts.title}</div>
      </td></tr>

      <!-- Body -->
      <tr><td style="padding:32px 40px 8px;font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:1.7;color:${C.inkSoft}">
        ${opts.bodyHtml}
      </td></tr>

      <!-- Signature -->
      <tr><td style="padding:6px 40px 30px;font-family:Arial,sans-serif;font-size:15px;color:${C.inkSoft}">
        <div style="border-top:1px solid ${C.border};padding-top:18px">
          See you in the room,<br>
          <b style="color:${C.plum}">${EVENT.host}</b><br>
          <span style="font-size:13px;color:${C.goldDk}">Founder, The5th Consulting</span>
        </div>
      </td></tr>

      <!-- Footer -->
      <tr><td style="background:#f6f0e8;padding:22px 40px;text-align:center;font-family:Arial,sans-serif">
        <div style="font-size:12px;color:#9a9186;line-height:1.6">The5th Consulting · Indrodip Ghosh · Indrodip@10kroadmap.org</div>
        <div style="font-size:11px;color:#b7ac9f;margin-top:6px"><a href="${opts.unsubUrl || '{{unsubscribe}}'}" style="color:#b7ac9f;text-decoration:underline">Unsubscribe</a></div>
      </td></tr>

    </table>
  </td></tr>
</table>
</body></html>`
}

const hi = (name?: string) => `Hi ${name && name.trim() ? name.trim().split(' ')[0] : 'there'},`
const p = (t: string) => `<p style="margin:0 0 16px">${t}</p>`

/* ============================ EMAIL DEFINITIONS ============================ */

export interface EventEmail {
  key: string
  flow: 'presale' | 'onboard'
  subject: string
  preview: string
  build: (ctx: EmailCtx) => string
}

export const EMAILS: EventEmail[] = [
  /* ----------------------------- PRESALE ---------------------------------- */
  {
    key: 'presale_invite',
    flow: 'presale',
    subject: `You're invited: 3 days that change how your business makes money`,
    preview: `Live with me, Aug 7–9. Just $27. Here's exactly what we'll do.`,
    build: (ctx) =>
      renderEmail({
        preheaderText: `Live with me, Aug 7–9. Just $27.`,
        kicker: `${EVENT.dates} · Live · ${EVENT.price}`,
        title: `You're invited to the Breakthrough Intensive`,
        unsubUrl: ctx.unsubUrl,
        bodyHtml: `
        ${p(hi(ctx.name))}
        ${p(`For 3 days, I'm going live to walk you through the exact process I use with coaches and consultants to fix the three things that quietly cap most businesses: <b>your blocks, your offer, and your ability to close.</b>`)}
        ${p(`No fluff. No 4-hour pitch. Just three focused sessions where you'll actually build something:`)}
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:6px 0 4px">${dayList()}</table>
        ${p(`It's <b>${EVENT.price}</b> — the price of lunch you'd forget by Friday. Seats are limited to keep the coaching intimate, and doors close the moment we go live.`)}
        ${ctaButton(`Claim my $27 seat →`, EVENT.reserveUrl, 'green')}
        ${p(`<span style="font-size:13px;color:#8a8075">If it's not worth 100× the ${EVENT.price}, ask and get every cent back. There's no version of this where you lose.</span>`)}`,
      }),
  },
  {
    key: 'presale_proof',
    flow: 'presale',
    subject: `What actually happens in these 3 days (and who it's for)`,
    preview: `Real clients. Real numbers. Here's what changes.`,
    build: (ctx) =>
      renderEmail({
        preheaderText: `Real clients, real numbers — here's what changes.`,
        kicker: `Live · ${EVENT.dates}`,
        title: `This is what's possible in 3 days`,
        unsubUrl: ctx.unsubUrl,
        bodyHtml: `
        ${p(hi(ctx.name))}
        ${p(`Most people don't have a traffic problem or an effort problem. They have a <i>clarity</i> problem — the offer isn't sharp, the pricing is scared, and the close is apologetic.`)}
        ${p(`These 3 days fix that in order:`)}
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:6px 0 4px">${dayList()}</table>
        ${p(`<b>Who it's for:</b> coaches, consultants and service providers who are good at the work but tired of inconsistent income. <b>Who it's not for:</b> anyone looking for a magic button.`)}
        ${p(`People walk out of the last challenge with a finished offer and the words to sell it. You've probably already seen a few of their reactions on the page.`)}
        ${ctaButton(`See what they're saying + reserve →`, EVENT.pageUrl, 'green')}
        ${p(`${EVENT.price}. Fully guaranteed. Doors close Aug 7.`)}`,
      }),
  },
  {
    key: 'presale_scarcity',
    flow: 'presale',
    subject: `Doors close when we go live (Aug 7)`,
    preview: `This is the last call for the Breakthrough Intensive.`,
    build: (ctx) =>
      renderEmail({
        preheaderText: `Last call — doors close when we go live.`,
        kicker: `Final call · Doors close Aug 7`,
        title: `Last call before we go live`,
        unsubUrl: ctx.unsubUrl,
        bodyHtml: `
        ${p(hi(ctx.name))}
        ${p(`Quick and honest one. We go live <b>Thursday, Aug 7</b>, and enrollment closes the moment the first session starts. After that, the room is sealed so the coaching stays intimate.`)}
        ${p(`If you've been meaning to grab your seat, this is the moment. Three days, one decision, ${EVENT.price}:`)}
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:6px 0 4px">${dayList()}</table>
        ${ctaButton(`Save my seat before doors close →`, EVENT.reserveUrl, 'green')}
        ${p(`<span style="font-size:13px;color:#8a8075">Risk-free: worth far more than ${EVENT.price} or your money back, no questions.</span>`)}`,
      }),
  },

  /* ---------------------------- ONBOARDING -------------------------------- */
  {
    key: 'welcome',
    flow: 'onboard',
    subject: `You're in 🎉 Do this one thing right now`,
    preview: `Your seat is confirmed. Join WhatsApp + add the sessions to your calendar.`,
    build: (ctx) =>
      renderEmail({
        preheaderText: `Your seat is confirmed — one required step inside.`,
        kicker: `You're in · ${EVENT.dates}`,
        title: `Your seat is confirmed 🎉`,
        unsubUrl: ctx.unsubUrl,
        bodyHtml: `
        ${p(hi(ctx.name))}
        ${p(`Welcome to the <b>Breakthrough Intensive</b>. You made a smart call — over the next 3 days we're going to fix your blocks, build your offer, and sharpen how you close.`)}
        ${p(`There's <b>one required step</b> before anything else 👇`)}
        ${whatsappBlock(true)}
        ${p(`<b>Then, lock in the sessions</b> so nothing gets in the way:`)}
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:6px 0 4px">${dayList()}</table>
        <div style="font-family:Arial,sans-serif;font-size:14px;color:${C.inkSoft};margin:0 0 8px">Session time: <b>${EVENT.timeLine}</b></div>
        ${ctaButton(`Add all 3 sessions to my calendar →`, EVENT.thankYouUrl, 'gold')}
        ${p(`Come with a pen and a real business you want to move forward. See you in the room.`)}`,
      }),
  },
  {
    key: 'hype_prep',
    flow: 'onboard',
    subject: `Before Day 1: the one shift that makes this work`,
    preview: `A 10-minute prep that doubles what you'll get out of the 3 days.`,
    build: (ctx) =>
      renderEmail({
        preheaderText: `A 10-minute prep that doubles your results.`,
        kicker: `Prep · Day 1 is coming`,
        title: `Do this before we begin`,
        unsubUrl: ctx.unsubUrl,
        bodyHtml: `
        ${p(hi(ctx.name))}
        ${p(`We start soon, and the people who get the most out of these 3 days all do the same thing first: they show up with a <b>real decision to make</b>, not a vague hope.`)}
        ${p(`So before Day 1, take 10 minutes and answer these:`)}
        <ul style="margin:0 0 16px;padding-left:20px;color:${C.inkSoft};font-size:16px;line-height:1.8">
          <li>What's the <b>one offer</b> you want to be selling by the end of this week?</li>
          <li>What's the belief or fear that quietly stops you from charging what you're worth?</li>
          <li>If this week worked, what would be <i>different</i> 30 days from now?</li>
        </ul>
        ${p(`Bring your answers. We'll use them live.`)}
        ${p(`And if you haven't joined the WhatsApp community yet — that's where your joining link and every reminder lands:`)}
        ${ctaButton(`Join WhatsApp →`, EVENT.whatsappUrl, 'wa')}`,
      }),
  },
  {
    key: 'hype_proof',
    flow: 'onboard',
    subject: `This is what's about to happen for you`,
    preview: `A quick picture of where you'll be by Saturday night.`,
    build: (ctx) =>
      renderEmail({
        preheaderText: `Where you'll be by Saturday night.`,
        kicker: `Almost time`,
        title: `Picture where you'll be Saturday`,
        unsubUrl: ctx.unsubUrl,
        bodyHtml: `
        ${p(hi(ctx.name))}
        ${p(`By the end of Day 3, here's what you'll walk away with:`)}
        <ul style="margin:0 0 16px;padding-left:20px;color:${C.inkSoft};font-size:16px;line-height:1.8">
          <li>The specific blocks that have been capping you — named and cleared</li>
          <li>A <b>finished, confident offer</b> you're proud to put a price on</li>
          <li>The exact words to sell it without ever feeling pushy</li>
        </ul>
        ${p(`That's not a someday goal. That's three days from now.`)}
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:6px 0 4px">${dayList()}</table>
        ${p(`Show up <b>live</b> if you possibly can — the hot-seat coaching, where your offer and your words get workshopped in real time, only happens live.`)}
        ${ctaButton(`Make sure you're in WhatsApp →`, EVENT.whatsappUrl, 'wa')}`,
      }),
  },
  {
    key: 'reminder_t1',
    flow: 'onboard',
    subject: `We begin tomorrow — are you ready?`,
    preview: `Day 1 is tomorrow. Here's everything you need.`,
    build: (ctx) =>
      renderEmail({
        preheaderText: `Day 1 is tomorrow — here's everything you need.`,
        kicker: `Tomorrow · Day 1`,
        title: `We begin tomorrow`,
        unsubUrl: ctx.unsubUrl,
        bodyHtml: `
        ${p(hi(ctx.name))}
        ${p(`This is it — <b>Day 1 is tomorrow.</b> Two things to be ready:`)}
        <ul style="margin:0 0 16px;padding-left:20px;color:${C.inkSoft};font-size:16px;line-height:1.8">
          <li><b>Be in the WhatsApp community.</b> Your live link drops there first.</li>
          <li><b>Block the time:</b> ${EVENT.timeLine}. Bring a pen.</li>
        </ul>
        ${whatsappBlock(true)}
        ${p(`Tomorrow we clear the mental & money blocks that have been quietly running the show. Come ready to be honest — that's where the breakthrough starts.`)}`,
      }),
  },
  {
    key: 'reminder_day1',
    flow: 'onboard',
    subject: `🔴 We're LIVE today — Day 1: Mental & Money Blocks`,
    preview: `Doors are open. Join us in WhatsApp for the link.`,
    build: (ctx) =>
      renderEmail({
        preheaderText: `We're live today — join us in WhatsApp for the link.`,
        kicker: `🔴 Live today · Day 1`,
        title: `Day 1 is here`,
        unsubUrl: ctx.unsubUrl,
        bodyHtml: `
        ${p(hi(ctx.name))}
        ${p(`Today we go live for <b>Day 1 — Overcome Your Mental & Money Blocks.</b> This is the foundation everything else is built on, so don't miss it.`)}
        ${p(`Session starts at <b>${EVENT.timeLine}</b>. Your live link is in the WhatsApp community 👇`)}
        ${ctaButton(`Open WhatsApp for the live link →`, EVENT.whatsappUrl, 'wa')}
        ${p(`See you in a few. Bring your pen.`)}`,
      }),
  },
  {
    key: 'reminder_day2',
    flow: 'onboard',
    subject: `🔴 Day 2 today — Create Your Offer`,
    preview: `Today we build the offer. Join us live.`,
    build: (ctx) =>
      renderEmail({
        preheaderText: `Today we build your offer — join us live.`,
        kicker: `🔴 Live today · Day 2`,
        title: `Day 2 — let's build your offer`,
        unsubUrl: ctx.unsubUrl,
        bodyHtml: `
        ${p(hi(ctx.name))}
        ${p(`Yesterday you cleared the blocks. <b>Today we build the offer</b> — the thing you'll actually sell, priced with confidence.`)}
        ${p(`Same time: <b>${EVENT.timeLine}</b>. Live link is in WhatsApp 👇`)}
        ${ctaButton(`Open WhatsApp for the live link →`, EVENT.whatsappUrl, 'wa')}
        ${p(`Come with the notes from Day 1. We're going to use them.`)}`,
      }),
  },
  {
    key: 'reminder_day3',
    flow: 'onboard',
    subject: `🔴 Day 3 (final) — Get Paid: Sales & Closing`,
    preview: `The final session. Today you learn to close.`,
    build: (ctx) =>
      renderEmail({
        preheaderText: `The final session — today you learn to close.`,
        kicker: `🔴 Live today · Day 3 (final)`,
        title: `Day 3 — get paid`,
        unsubUrl: ctx.unsubUrl,
        bodyHtml: `
        ${p(hi(ctx.name))}
        ${p(`Final day. You've cleared the blocks and built the offer — <b>today you learn to sell it and close with confidence.</b> This is where the work turns into income.`)}
        ${p(`Last live session: <b>${EVENT.timeLine}</b>. Link's in WhatsApp 👇`)}
        ${ctaButton(`Open WhatsApp for the live link →`, EVENT.whatsappUrl, 'wa')}
        ${p(`Show up and finish strong. I'll see you in the room.`)}`,
      }),
  },
]

export const EMAIL_BY_KEY: Record<string, EventEmail> = Object.fromEntries(EMAILS.map((e) => [e.key, e]))

/* ============================== SCHEDULE ==================================
   Calendar-driven sends (UTC dates). `welcome` is excluded — it fires on
   purchase, not on a date. Presale emails go to the lead audience; onboard
   emails go to registrants. The cron compares today's date and sends any
   due email once per recipient (idempotency enforced by event_email_log).   */
export interface ScheduledSend {
  date: string // YYYY-MM-DD (UTC)
  key: string
}

export const SCHEDULE: ScheduledSend[] = [
  { date: '2026-07-22', key: 'presale_invite' },
  { date: '2026-07-31', key: 'presale_proof' },
  { date: '2026-08-06', key: 'presale_scarcity' },
  { date: '2026-08-03', key: 'hype_prep' },
  { date: '2026-08-05', key: 'hype_proof' },
  { date: '2026-08-06', key: 'reminder_t1' },
  { date: '2026-08-07', key: 'reminder_day1' },
  { date: '2026-08-08', key: 'reminder_day2' },
  { date: '2026-08-09', key: 'reminder_day3' },
]

export const FROM = 'Indrodip at The5th <Indrodip@10kroadmap.org>'
