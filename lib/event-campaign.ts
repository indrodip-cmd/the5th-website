/* ============================================================================
   THE 3-DAY BREAKTHROUGH INTENSIVE, EMAIL CAMPAIGN
   ----------------------------------------------------------------------------
   One source of truth for every event email. Two flows:

     PRESALE  -> sell seats to existing members (curiosity, proof, scarcity).
                 Rendered with renderSimple(): plain, personal, no images and
                 no buttons, so Gmail treats it like a normal 1:1 email and
                 keeps it out of the Promotions tab.
     ONBOARD  -> post-purchase: welcome, hype, daily reminders. Rendered with
                 renderRich(): light branded layout with WhatsApp/calendar CTAs
                 that buyers expect.

   Every email carries the compliance footer (why they're receiving it, the
   business address, and a working one-click unsubscribe).
   ========================================================================== */

export const EVENT = {
  name: 'The 3-Day Breakthrough Intensive',
  short: 'Breakthrough Intensive',
  host: 'Indrodip Ghosh',
  price: '$27',
  dates: 'August 7 to 9, 2026',
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
  linkGreen: '#1C6B45',
}

export interface EmailCtx {
  name?: string
  unsubUrl?: string
}

const hi = (name?: string) => `Hi ${name && name.trim() ? name.trim().split(' ')[0] : 'there'},`
const p = (t: string) => `<p style="margin:0 0 16px">${t}</p>`

/* --- shared bits ---------------------------------------------------------- */

function preheader(text: string) {
  return `<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;height:0;width:0">${text}${'&nbsp;&zwnj;'.repeat(60)}</div>`
}

/** Compliance + why-you're-receiving-this footer, shared by both templates. */
function footer(unsubUrl: string | undefined, muted: string) {
  const link = unsubUrl || '#'
  return `
  <div style="font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.65;color:${muted}">
    You're receiving this email because you joined the $10K Roadmap Community and purchased access to the membership.
    <br><br>
    &copy; 2026 @ The5th Consulting (Formerly Known as 10kRoadmap)<br>
    15 Central Park West<br>
    NYC, NY 10023, United States of America
    <br><br>
    <a href="${link}" style="color:${muted};text-decoration:underline">Unsubscribe</a>
  </div>`
}

/** PLAIN, PERSONAL template. No images, no buttons, no cards. Reads like a
    normal email a human typed. Used for the promotional / invite flow. */
export function renderSimple(opts: { preheaderText: string; bodyHtml: string; unsubUrl?: string }) {
  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="x-apple-disable-message-reformatting"><title>${EVENT.short}</title></head>
<body style="margin:0;padding:0;background:#ffffff">
${preheader(opts.preheaderText)}
<div style="max-width:600px;margin:0 auto;padding:26px 24px;font-family:-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:16px;line-height:1.62;color:#222222">
  ${opts.bodyHtml}
  <p style="margin:20px 0 0">Talk soon,<br>Indrodip</p>
  <div style="margin-top:26px;padding-top:16px;border-top:1px solid #eeeeee">
    ${footer(opts.unsubUrl, '#9a9a9a')}
  </div>
</div>
</body></html>`
}

/** Light branded template for the transactional / onboarding flow. */
export function renderRich(opts: {
  preheaderText: string
  kicker: string
  title: string
  bodyHtml: string
  unsubUrl?: string
}) {
  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="x-apple-disable-message-reformatting"><title>${EVENT.short}</title></head>
<body style="margin:0;padding:0;background:${C.parch};-webkit-font-smoothing:antialiased">
${preheader(opts.preheaderText)}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.parch}">
  <tr><td align="center" style="padding:26px 14px">
    <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:600px;max-width:100%;background:#ffffff;border-radius:18px;overflow:hidden;box-shadow:0 20px 50px -30px rgba(46,26,53,.5)">
      <tr><td style="background:linear-gradient(140deg,${C.plumMid},${C.plum} 62%,#1f1128);padding:30px 40px 26px;text-align:center">
        <img src="${EVENT.logo}" alt="The5th Consulting" height="26" style="height:26px;margin-bottom:14px">
        <div style="font-family:Arial,sans-serif;font-size:11px;font-weight:700;letter-spacing:.2em;text-transform:uppercase;color:${C.gold}">${opts.kicker}</div>
        <div style="font-family:Georgia,serif;font-size:27px;line-height:1.2;color:#ffffff;margin-top:8px">${opts.title}</div>
      </td></tr>
      <tr><td style="padding:32px 40px 8px;font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:1.7;color:${C.inkSoft}">
        ${opts.bodyHtml}
      </td></tr>
      <tr><td style="padding:6px 40px 28px;font-family:Arial,sans-serif;font-size:15px;color:${C.inkSoft}">
        <div style="border-top:1px solid ${C.border};padding-top:18px">
          See you in the room,<br>
          <b style="color:${C.plum}">${EVENT.host}</b><br>
          <span style="font-size:13px;color:${C.goldDk}">Founder, The5th Consulting</span>
        </div>
      </td></tr>
      <tr><td style="background:#f6f0e8;padding:22px 40px">
        ${footer(opts.unsubUrl, '#9a9186')}
      </td></tr>
    </table>
  </td></tr>
</table>
</body></html>`
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

function dayCards() {
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

/** Plain-text day list for the simple template. */
function dayLines() {
  return EVENT.days
    .map((d) => `<div style="margin:0 0 6px"><b>${d.n} (${d.date}):</b> ${d.title}</div>`)
    .join('')
}

function whatsappBlock() {
  return `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:22px 0">
    <tr><td style="background:#f2fbf4;border:2px solid ${C.wa};border-radius:16px;padding:22px 22px;text-align:center">
      <div style="font-family:Arial,sans-serif;font-size:11px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:#128C4B">Required · Do this first</div>
      <div style="font-family:Georgia,serif;font-size:22px;color:${C.plum};margin:6px 0 8px">Join the WhatsApp community</div>
      <div style="font-family:Arial,sans-serif;font-size:14px;color:#4f5a50;line-height:1.6;max-width:400px;margin:0 auto">Every joining link, reminder and last-minute update goes out in WhatsApp <b>first</b>. If you're not in it, you risk missing the session.</div>
      ${ctaButton('Join the WhatsApp community', EVENT.whatsappUrl, 'wa')}
    </td></tr>
  </table>`
}

const a = (text: string, href: string) => `<a href="${href}" style="color:${C.linkGreen};text-decoration:underline">${text}</a>`

/* ============================ EMAIL DEFINITIONS ============================ */

export interface EventEmail {
  key: string
  flow: 'presale' | 'onboard'
  subject: string
  preview: string
  build: (ctx: EmailCtx) => string
}

export const EMAILS: EventEmail[] = [
  /* ----------- PRESALE (plain, personal, no buttons) ---------------------- */
  {
    key: 'presale_invite',
    flow: 'presale',
    subject: `A quick invite from me (3 days, live)`,
    preview: `I'm going live Aug 7 to 9. I'd love for you to be there.`,
    build: (ctx) =>
      renderSimple({
        preheaderText: `I'm going live Aug 7 to 9. I'd love for you to be there.`,
        unsubUrl: ctx.unsubUrl,
        bodyHtml: `
        ${p(hi(ctx.name))}
        ${p(`I wanted to reach out personally. For 3 days I'm going live to walk through the exact process I use with coaches and consultants to fix the three things that quietly cap most businesses: your blocks, your offer, and your ability to close.`)}
        ${p(`Here's the plan:`)}
        <div style="margin:0 0 16px">${dayLines()}</div>
        ${p(`It runs ${EVENT.dates}, live at ${EVENT.timeLine}. It's just ${EVENT.price} to hold your seat, and if it isn't worth far more than that, you can ask for every cent back.`)}
        ${p(`If you want in, here's where to grab a seat: ${a('the5th.consulting/event/the-shift', EVENT.pageUrl)}`)}
        ${p(`Either way, glad to have you in the community. Reply if you have any questions, I read these.`)}`,
      }),
  },
  {
    key: 'presale_proof',
    flow: 'presale',
    subject: `what actually happens in these 3 days`,
    preview: `Who it's for, and what you walk away with.`,
    build: (ctx) =>
      renderSimple({
        preheaderText: `Who it's for, and what you walk away with.`,
        unsubUrl: ctx.unsubUrl,
        bodyHtml: `
        ${p(hi(ctx.name))}
        ${p(`Following up on the live thing I mentioned. A few people asked what actually happens across the 3 days, so here it is, in order:`)}
        <div style="margin:0 0 16px">${dayLines()}</div>
        ${p(`Most people don't have a traffic problem or an effort problem. They have a clarity problem. The offer isn't sharp, the pricing is scared, and the close is apologetic. These 3 days fix that.`)}
        ${p(`It's for coaches, consultants and service providers who are good at the work but tired of inconsistent income. It's not for anyone looking for a magic button.`)}
        ${p(`If that sounds like you, you can reserve a seat here: ${a('the5th.consulting/event/the-shift', EVENT.pageUrl)}`)}
        ${p(`It's ${EVENT.price}, fully guaranteed, and doors close when we go live on Aug 7.`)}`,
      }),
  },
  {
    key: 'presale_scarcity',
    flow: 'presale',
    subject: `last call before we go live`,
    preview: `Doors close Thursday when the first session starts.`,
    build: (ctx) =>
      renderSimple({
        preheaderText: `Doors close Thursday when the first session starts.`,
        unsubUrl: ctx.unsubUrl,
        bodyHtml: `
        ${p(hi(ctx.name))}
        ${p(`Quick and honest one. We go live Thursday, Aug 7, and enrollment closes the moment the first session starts. After that the room is sealed so the coaching stays intimate.`)}
        ${p(`If you've been meaning to grab your seat, this is the moment. Three days, one decision, ${EVENT.price}:`)}
        <div style="margin:0 0 16px">${dayLines()}</div>
        ${p(`Here's the link to save your seat before doors close: ${a('the5th.consulting/event/the-shift', EVENT.reserveUrl)}`)}
        ${p(`It's risk-free. Worth far more than ${EVENT.price} or your money back, no questions.`)}`,
      }),
  },

  /* ------------------------ ONBOARDING (rich) ----------------------------- */
  {
    key: 'welcome',
    flow: 'onboard',
    subject: `You're in. Do this one thing right now`,
    preview: `Your seat is confirmed. Join WhatsApp and add the sessions to your calendar.`,
    build: (ctx) =>
      renderRich({
        preheaderText: `Your seat is confirmed. One required step inside.`,
        kicker: `You're in · ${EVENT.dates}`,
        title: `Your seat is confirmed`,
        unsubUrl: ctx.unsubUrl,
        bodyHtml: `
        ${p(hi(ctx.name))}
        ${p(`Welcome to the <b>Breakthrough Intensive</b>. You made a smart call. Over the next 3 days we're going to fix your blocks, build your offer, and sharpen how you close.`)}
        ${p(`There's <b>one required step</b> before anything else.`)}
        ${whatsappBlock()}
        ${p(`<b>Then lock in the sessions</b> so nothing gets in the way:`)}
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:6px 0 4px">${dayCards()}</table>
        <div style="font-family:Arial,sans-serif;font-size:14px;color:${C.inkSoft};margin:0 0 8px">Session time: <b>${EVENT.timeLine}</b></div>
        ${ctaButton(`Add all 3 sessions to my calendar`, EVENT.thankYouUrl, 'gold')}
        ${p(`Come with a pen and a real business you want to move forward. See you in the room.`)}`,
      }),
  },
  {
    key: 'hype_prep',
    flow: 'onboard',
    subject: `Before Day 1: the one shift that makes this work`,
    preview: `A 10-minute prep that doubles what you'll get out of the 3 days.`,
    build: (ctx) =>
      renderRich({
        preheaderText: `A 10-minute prep that doubles your results.`,
        kicker: `Prep · Day 1 is coming`,
        title: `Do this before we begin`,
        unsubUrl: ctx.unsubUrl,
        bodyHtml: `
        ${p(hi(ctx.name))}
        ${p(`We start soon, and the people who get the most out of these 3 days all do the same thing first. They show up with a <b>real decision to make</b>, not a vague hope.`)}
        ${p(`So before Day 1, take 10 minutes and answer these:`)}
        <ul style="margin:0 0 16px;padding-left:20px;color:${C.inkSoft};font-size:16px;line-height:1.8">
          <li>What's the <b>one offer</b> you want to be selling by the end of this week?</li>
          <li>What's the belief or fear that quietly stops you from charging what you're worth?</li>
          <li>If this week worked, what would be <i>different</i> 30 days from now?</li>
        </ul>
        ${p(`Bring your answers. We'll use them live.`)}
        ${p(`And if you haven't joined the WhatsApp community yet, that's where your joining link and every reminder lands:`)}
        ${ctaButton(`Join WhatsApp`, EVENT.whatsappUrl, 'wa')}`,
      }),
  },
  {
    key: 'hype_proof',
    flow: 'onboard',
    subject: `This is what's about to happen for you`,
    preview: `A quick picture of where you'll be by Saturday night.`,
    build: (ctx) =>
      renderRich({
        preheaderText: `Where you'll be by Saturday night.`,
        kicker: `Almost time`,
        title: `Picture where you'll be Saturday`,
        unsubUrl: ctx.unsubUrl,
        bodyHtml: `
        ${p(hi(ctx.name))}
        ${p(`By the end of Day 3, here's what you'll walk away with:`)}
        <ul style="margin:0 0 16px;padding-left:20px;color:${C.inkSoft};font-size:16px;line-height:1.8">
          <li>The specific blocks that have been capping you, named and cleared</li>
          <li>A <b>finished, confident offer</b> you're proud to put a price on</li>
          <li>The exact words to sell it without ever feeling pushy</li>
        </ul>
        ${p(`That's not a someday goal. That's three days from now.`)}
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:6px 0 4px">${dayCards()}</table>
        ${p(`Show up <b>live</b> if you possibly can. The hot-seat coaching, where your offer and your words get workshopped in real time, only happens live.`)}
        ${ctaButton(`Make sure you're in WhatsApp`, EVENT.whatsappUrl, 'wa')}`,
      }),
  },
  {
    key: 'reminder_t1',
    flow: 'onboard',
    subject: `We begin tomorrow. Are you ready?`,
    preview: `Day 1 is tomorrow. Here's everything you need.`,
    build: (ctx) =>
      renderRich({
        preheaderText: `Day 1 is tomorrow. Here's everything you need.`,
        kicker: `Tomorrow · Day 1`,
        title: `We begin tomorrow`,
        unsubUrl: ctx.unsubUrl,
        bodyHtml: `
        ${p(hi(ctx.name))}
        ${p(`This is it. <b>Day 1 is tomorrow.</b> Two things to be ready:`)}
        <ul style="margin:0 0 16px;padding-left:20px;color:${C.inkSoft};font-size:16px;line-height:1.8">
          <li><b>Be in the WhatsApp community.</b> Your live link drops there first.</li>
          <li><b>Block the time:</b> ${EVENT.timeLine}. Bring a pen.</li>
        </ul>
        ${whatsappBlock()}
        ${p(`Tomorrow we clear the mental and money blocks that have been quietly running the show. Come ready to be honest. That's where the breakthrough starts.`)}`,
      }),
  },
  {
    key: 'reminder_day1',
    flow: 'onboard',
    subject: `We're LIVE today. Day 1: Mental & Money Blocks`,
    preview: `Doors are open. Join us in WhatsApp for the link.`,
    build: (ctx) =>
      renderRich({
        preheaderText: `We're live today. Join us in WhatsApp for the link.`,
        kicker: `Live today · Day 1`,
        title: `Day 1 is here`,
        unsubUrl: ctx.unsubUrl,
        bodyHtml: `
        ${p(hi(ctx.name))}
        ${p(`Today we go live for <b>Day 1, Overcome Your Mental &amp; Money Blocks.</b> This is the foundation everything else is built on, so don't miss it.`)}
        ${p(`Session starts at <b>${EVENT.timeLine}</b>. Your live link is in the WhatsApp community.`)}
        ${ctaButton(`Open WhatsApp for the live link`, EVENT.whatsappUrl, 'wa')}
        ${p(`See you in a few. Bring your pen.`)}`,
      }),
  },
  {
    key: 'reminder_day2',
    flow: 'onboard',
    subject: `Day 2 today: Create Your Offer`,
    preview: `Today we build the offer. Join us live.`,
    build: (ctx) =>
      renderRich({
        preheaderText: `Today we build your offer. Join us live.`,
        kicker: `Live today · Day 2`,
        title: `Day 2, let's build your offer`,
        unsubUrl: ctx.unsubUrl,
        bodyHtml: `
        ${p(hi(ctx.name))}
        ${p(`Yesterday you cleared the blocks. <b>Today we build the offer</b>, the thing you'll actually sell, priced with confidence.`)}
        ${p(`Same time: <b>${EVENT.timeLine}</b>. Live link is in WhatsApp.`)}
        ${ctaButton(`Open WhatsApp for the live link`, EVENT.whatsappUrl, 'wa')}
        ${p(`Come with the notes from Day 1. We're going to use them.`)}`,
      }),
  },
  {
    key: 'reminder_day3',
    flow: 'onboard',
    subject: `Day 3 (final): Get Paid, Sales & Closing`,
    preview: `The final session. Today you learn to close.`,
    build: (ctx) =>
      renderRich({
        preheaderText: `The final session. Today you learn to close.`,
        kicker: `Live today · Day 3 (final)`,
        title: `Day 3, get paid`,
        unsubUrl: ctx.unsubUrl,
        bodyHtml: `
        ${p(hi(ctx.name))}
        ${p(`Final day. You've cleared the blocks and built the offer. <b>Today you learn to sell it and close with confidence.</b> This is where the work turns into income.`)}
        ${p(`Last live session: <b>${EVENT.timeLine}</b>. Link's in WhatsApp.`)}
        ${ctaButton(`Open WhatsApp for the live link`, EVENT.whatsappUrl, 'wa')}
        ${p(`Show up and finish strong. I'll see you in the room.`)}`,
      }),
  },
]

export const EMAIL_BY_KEY: Record<string, EventEmail> = Object.fromEntries(EMAILS.map((e) => [e.key, e]))

/* ============================== SCHEDULE ==================================
   Calendar-driven sends (UTC dates). `welcome` fires on purchase, not a date.
   Presale emails go to the lead audience, onboard emails to registrants. The
   cron sends any due email once per recipient (event_email_log enforces it). */
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

// Sent from the dedicated the5th.10kroadmap.org subdomain (better deliverability,
// isolated sending reputation). Replies route back to the main inbox.
export const FROM = 'Indrodip at The5th <Indrodip@the5th.10kroadmap.org>'
export const REPLY_TO = 'Indrodip@10kroadmap.org'
