/* ============================================================================
   THE KNOWLEDGE ASSET — post-purchase nurture campaign (7-day AI-trial window)
   ----------------------------------------------------------------------------
   When someone buys the $7.93 workbook they get a 7-day The5th AI trial. This
   drip walks them through the book with real coaching, gets them to take the
   quiz (which activates their personalised AI coaching), reminds them 3 days
   before the trial ends, sells the membership, and — if they haven't booked
   their free strategy call — nudges them to book it (checked live against
   cal.com so we never nag someone who already booked).

   Storage: workbook_buyers (one row per buyer, stable purchased_at drives the
   relative schedule). Idempotency: event_email_log (unique email+email_key), so
   the daily cron can never double-send. Global suppression: email_unsubscribes
   is honoured on every send. SAFE by default — nothing sends unless the cron is
   run with WORKBOOK_CAMPAIGN_LIVE=true.
   ========================================================================== */
import { Resend } from 'resend'
import { getSupabaseAdmin } from './supabase'
import { isUnsubscribed, unsubscribeUrl } from './comm/unsubscribe'
import { getBookedEmails } from './calcom'
import { ctaButton, FROM, REPLY_TO } from './event-campaign'
import { resolveOrCreateContact, addTag, logActivity } from './crm'

const SITE = 'https://the5th.consulting'
export const WB = {
  book: `${SITE}/downloads/the-knowledge-asset.pdf`,
  quiz: `${SITE}/quiz`,
  ai: `${SITE}/ai`,
  aiCheckout: `${SITE}/ai-checkout`,
  platform: 'https://platform.the5th.consulting',
  call: 'https://cal.com/indrodip-ghosh-ut1vxh/60min',
  thankyou: `${SITE}/workbook/success`,
  logo: `${SITE}/images/logo-white.png`,
  trialDays: 7,
}

const C = { plum: '#2E1A35', plumMid: '#4a2f57', gold: '#C9A84C', goldDk: '#B0902F', green: '#1C4A32', parch: '#FAF6F0', ink: '#2b2430', inkSoft: '#514a41', border: '#ece4d8', link: '#1C6B45' }

const hi = (name?: string) => `Hi ${name && name.trim() ? name.trim().split(' ')[0] : 'there'},`
const p = (t: string) => `<p style="margin:0 0 16px">${t}</p>`
const h = (t: string) => `<p style="margin:22px 0 10px;font-family:Georgia,serif;font-size:19px;color:${C.plum};font-weight:700">${t}</p>`
const ul = (items: string[]) => `<ul style="margin:0 0 16px;padding-left:20px">${items.map((i) => `<li style="margin:0 0 8px">${i}</li>`).join('')}</ul>`
const a = (t: string, href: string) => `<a href="${href}" style="color:${C.link};text-decoration:underline">${t}</a>`

function preheader(text: string) {
  return `<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;height:0;width:0">${text}${'&nbsp;&zwnj;'.repeat(60)}</div>`
}

/* Light branded template — book-appropriate header + compliant footer. */
function renderWB(opts: { preview: string; kicker: string; title: string; body: string; unsubUrl?: string }) {
  const link = opts.unsubUrl || '#'
  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="x-apple-disable-message-reformatting"><title>The Knowledge Asset</title></head>
<body style="margin:0;padding:0;background:${C.parch};-webkit-font-smoothing:antialiased">
${preheader(opts.preview)}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.parch}">
  <tr><td align="center" style="padding:26px 14px">
    <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:600px;max-width:100%;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 20px 50px -30px rgba(46,26,53,.5)">
      <tr><td style="background:linear-gradient(140deg,${C.plumMid},${C.plum} 62%,#1f1128);padding:28px 40px 24px;text-align:center">
        <img src="${WB.logo}" alt="The5th Consulting" height="24" style="height:24px;margin-bottom:12px">
        <div style="font-family:Arial,sans-serif;font-size:11px;font-weight:700;letter-spacing:.2em;text-transform:uppercase;color:${C.gold}">${opts.kicker}</div>
        <div style="font-family:Georgia,serif;font-size:26px;line-height:1.25;color:#ffffff;margin-top:8px">${opts.title}</div>
      </td></tr>
      <tr><td style="padding:30px 40px 8px;font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:1.7;color:${C.inkSoft}">
        ${opts.body}
      </td></tr>
      <tr><td style="padding:6px 40px 26px;font-family:Arial,sans-serif;font-size:15px;color:${C.inkSoft}">
        <div style="border-top:1px solid ${C.border};padding-top:16px">
          Keep building,<br>
          <b style="color:${C.plum}">Indrodip &amp; the team at The5th</b><br>
          <span style="font-size:13px;color:${C.goldDk}">The5th Consulting</span>
        </div>
      </td></tr>
      <tr><td style="background:#f6f0e8;padding:20px 40px">
        <div style="font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.65;color:#9a9186">
          You're receiving this because you purchased <b>The Knowledge Asset</b> and started your 7-day The5th AI trial.
          <br><br>&copy; 2026 The5th Consulting · 15 Central Park West, NYC, NY 10023, USA<br>
          <a href="${link}" style="color:#9a9186;text-decoration:underline">Unsubscribe</a>
        </div>
      </td></tr>
    </table>
  </td></tr>
</table>
</body></html>`
}

/* Reusable content blocks -------------------------------------------------- */
const quizBlock = (quizTaken: boolean) =>
  quizTaken
    ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0"><tr><td style="background:#f2f8f4;border-left:3px solid ${C.green};border-radius:0 10px 10px 0;padding:14px 18px;font-family:Arial,sans-serif;font-size:14px;color:#3e5c4c">✓ You've taken the assessment — your AI coach already knows your business. Just open The5th AI and pick up where you left off.</td></tr></table>`
    : `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0"><tr><td style="background:#fbf7ef;border:1px solid ${C.border};border-radius:12px;padding:20px 22px;text-align:center">
        <div style="font-family:Arial,sans-serif;font-size:11px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:${C.goldDk}">Do this first · 2 minutes</div>
        <div style="font-family:Georgia,serif;font-size:20px;color:${C.plum};margin:6px 0 6px">Activate your free AI coaching</div>
        <div style="font-family:Arial,sans-serif;font-size:14px;color:#5a5248;line-height:1.6;max-width:420px;margin:0 auto">Take the free 2-minute assessment. It gives your The5th AI coach the context it needs to coach <i>your</i> business — your niche, your goal, your next move.</div>
        ${ctaButton('Take the quiz &amp; activate AI coaching', WB.quiz, 'green')}
      </td></tr></table>`

const callBlock = (callBooked: boolean) =>
  callBooked
    ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0"><tr><td style="background:#f2f8f4;border-left:3px solid ${C.green};border-radius:0 10px 10px 0;padding:14px 18px;font-family:Arial,sans-serif;font-size:14px;color:#3e5c4c">✓ Your free strategy call is booked — come with your product idea and one question. We'll map your fastest path to $5K.</td></tr></table>`
    : `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0"><tr><td style="background:#fbf7ef;border:1px solid ${C.border};border-radius:12px;padding:20px 22px;text-align:center">
        <div style="font-family:Arial,sans-serif;font-size:11px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:${C.goldDk}">Your bonus · free</div>
        <div style="font-family:Georgia,serif;font-size:20px;color:${C.plum};margin:6px 0 6px">Book your free strategy call</div>
        <div style="font-family:Arial,sans-serif;font-size:14px;color:#5a5248;line-height:1.6;max-width:420px;margin:0 auto">A complimentary call for book buyers. We'll help you choose the one product to build first and map your path to your first $5K month.</div>
        ${ctaButton('Grab your free call', WB.call, 'gold')}
      </td></tr></table>`

const membershipBlock = (heading: string) =>
  `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:22px 0"><tr><td style="background:linear-gradient(160deg,#2A1830,#160D1A);border-radius:14px;padding:24px 24px;text-align:center">
      <div style="font-family:Arial,sans-serif;font-size:11px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:${C.gold}">${heading}</div>
      <div style="font-family:Georgia,serif;font-size:22px;color:#fff;margin:6px 0 8px">Keep The5th AI — your daily business coach</div>
      <div style="font-family:Arial,sans-serif;font-size:14px;color:rgba(246,239,227,.82);line-height:1.65;max-width:440px;margin:0 auto">It builds your product, writes your offer, plans your content, and keeps you accountable — every day. Members keep full access for <b style="color:#fff">$47/month</b>, cancel anytime.</div>
      ${ctaButton('Keep The5th AI — $47/mo', WB.ai, 'gold')}
    </td></tr></table>`

/* ============================ EMAIL DEFINITIONS ============================ */
export interface WBCtx { name?: string; quizTaken: boolean; callBooked: boolean; unsubUrl?: string }
export interface WBEmail { key: string; day: number; subject: string; preview: string; build: (ctx: WBCtx) => string }

export const WB_EMAILS: WBEmail[] = [
  {
    key: 'wb_d0_welcome',
    day: 0,
    subject: "You're in — here's your workbook + your free AI coaching",
    preview: 'Download the book, and take the 2-minute quiz to switch on your AI coach.',
    build: (ctx) => renderWB({ preview: 'Download your book and activate your AI coach.', kicker: 'Welcome', title: "You're in. Let's build.", unsubUrl: ctx.unsubUrl, body:
      p(hi(ctx.name)) +
      p(`Welcome to <b>The Knowledge Asset</b> — and to your <b>7-day free trial of The5th AI</b>. Over the next week I'll walk you through the book with real coaching, one focused email at a time. Do the work as you read and you'll finish with a real product, offer, and launch plan.`) +
      p(`First, grab your copy: ${a('Download the workbook (PDF)', WB.book)}.`) +
      h('Then switch on your AI coach') +
      p(`Your trial of The5th AI is live. The fastest way to make it useful is to take the free 2-minute assessment — it tells your AI coach exactly who you are and what you're building, so every answer is tailored to <i>your</i> business.`) +
      quizBlock(ctx.quizTaken) +
      p(`Tomorrow: the one mindset shift that separates people who build $10K months from people who keep planning. Open Chapter 1 tonight.`) +
      callBlock(ctx.callBooked),
    }),
  },
  {
    key: 'wb_d1_mindset',
    day: 1,
    subject: 'Coaching 1: stop selling hours, start building an asset',
    preview: 'The leverage shift — and the one product to build first.',
    build: (ctx) => renderWB({ preview: 'The asset mindset, and picking your first product.', kicker: 'Coaching · Day 1', title: 'The asset mindset', unsubUrl: ctx.unsubUrl, body:
      p(hi(ctx.name)) +
      p(`Here's the uncomfortable truth from Chapter 3: if your income depends on you showing up for every client, every call, every hour — you don't have a business, you have a job you can't leave.`) +
      p(`An <b>asset</b> is different. You build it once and it keeps earning: a product, a workbook, a mini-course, a toolkit. The goal this week isn't "more clients." It's to package something you already know into something people can buy without booking your calendar.`) +
      h("Today's work (20 minutes)") +
      ul([
        `Open your <b>Knowledge Inventory</b> (Chapter 1). List 10 things people ask you for advice on.`,
        `Circle the ONE where you get the strongest results and the most "how did you do that?" reactions.`,
        `That circled item is your first product. Don't overthink it — you're building a $7–$47 asset, not a masterpiece.`,
      ]) +
      p(`Stuck choosing? That's exactly what your AI coach is for. Open The5th AI and say: <i>"Here are 10 things people ask me for. Help me pick the one to turn into a $27 product and tell me why."</i>`) +
      quizBlock(ctx.quizTaken) +
      p(`Tomorrow: who you're really building for, and how to turn that circled skill into a specific product.`),
    }),
  },
  {
    key: 'wb_d2_audience_product',
    day: 2,
    subject: 'Coaching 2: the one person you build for',
    preview: 'Find your buyer, then design the product in one sitting.',
    build: (ctx) => renderWB({ preview: 'Your audience and your first digital product.', kicker: 'Coaching · Day 2', title: 'Audience + product', unsubUrl: ctx.unsubUrl, body:
      p(hi(ctx.name)) +
      p(`"Everyone" is not a customer. The fastest way to a product that sells is to build for <b>one specific person</b> at one specific moment (Chapter 4).`) +
      h("Today's work (25 minutes)") +
      ul([
        `Write one sentence: <i>"I help [who] go from [painful before] to [desired after]."</i>`,
        `Name the exact moment they'd go looking for help. That moment is your marketing.`,
        `Fill in your <b>Product Blueprint</b> (Chapter 5): the transformation, the format (PDF, mini-course, toolkit), and the price ($7–$47 to start).`,
      ]) +
      p(`Then hand it to your AI coach to sharpen: <i>"Here's my one-sentence promise and product idea. Tighten the promise, suggest a name, and outline the 5 sections."</i> That's a first draft of your product in minutes.`) +
      quizBlock(ctx.quizTaken) +
      p(`Tomorrow: turning that product into an offer people actually buy — and the content that sells it without feeling salesy.`),
    }),
  },
  {
    key: 'wb_d3_offer_content',
    day: 3,
    subject: 'Coaching 3: an offer that sells itself',
    preview: 'The offer stack + a simple content rhythm — and a free set of eyes on it.',
    build: (ctx) => renderWB({ preview: 'Build the offer and the content that sells it.', kicker: 'Coaching · Day 3', title: 'Offer + content', unsubUrl: ctx.unsubUrl, body:
      p(hi(ctx.name)) +
      p(`A product is <i>what</i> you make. An offer is <i>why</i> someone buys now. Chapter 6 builds your <b>Offer Stack</b>: the core result, what's included, who it's for, and the reason to act.`) +
      h("Today's work (25 minutes)") +
      ul([
        `Fill in the <b>Offer Stack Builder</b> — one page, fill-in-the-blank. Aim for a promise so clear the right person thinks "I need this."`,
        `Pick <b>one</b> content format you'll actually keep up (short posts, one email a week, one reel). Consistency beats reach.`,
        `Use the <b>90-Day Content Calendar</b> bonus for your first 7 topics so you never stare at a blank screen.`,
      ]) +
      p(`Ask your AI coach: <i>"Here's my offer. Write me 7 pieces of content that lead to it — hooks included."</i>`) +
      p(`And if you'd like a real human set of eyes on your offer before you launch, that's what your free bonus call is for:`) +
      callBlock(ctx.callBooked),
    }),
  },
  {
    key: 'wb_d4_trial_ending',
    day: 4,
    subject: 'Your The5th AI trial ends in 3 days',
    preview: "Here's what you've built — and how to keep your AI coach.",
    build: (ctx) => renderWB({ preview: 'Three days left on your AI trial.', kicker: 'Heads up', title: 'Your AI trial ends in 3 days', unsubUrl: ctx.unsubUrl, body:
      p(hi(ctx.name)) +
      p(`Quick heads up: your <b>7-day The5th AI trial ends in 3 days</b>. If you've been doing the work, look at what you already have — a product idea, a one-sentence promise, an offer, and your first content. Four days ago that was just knowledge in your head.`) +
      p(`The5th AI is the thing that keeps that momentum going after the book: it drafts, refines, plans your week, and keeps you accountable so you actually launch instead of drifting back to "someday."`) +
      membershipBlock('Keep going after your trial') +
      (ctx.quizTaken ? '' : p(`Haven't taken the assessment yet? Do it before the trial ends so your coach is fully set up: ${a('take the 2-minute quiz', WB.quiz)}.`)) +
      p(`Not sure if it's right for you? Just reply to this email — I read every one.`),
    }),
  },
  {
    key: 'wb_d5_launch_membership',
    day: 5,
    subject: 'Coaching 4: your simple launch plan (and the $10K roadmap)',
    preview: 'Launch without a funnel — and where this actually leads.',
    build: (ctx) => renderWB({ preview: 'Launch plan + the path to $10K months.', kicker: 'Coaching · Day 5', title: 'Launch + the roadmap', unsubUrl: ctx.unsubUrl, body:
      p(hi(ctx.name)) +
      p(`You don't need a complicated funnel to launch (Chapter 8). You need a simple plan and a deadline.`) +
      h('Your 7-day launch plan') +
      ul([
        `Days 1–3: warm people up — share the problem you solve and why it matters.`,
        `Day 4: open. Post your offer, email your list (even if it's 20 people), send DMs to people who fit.`,
        `Days 5–7: proof + urgency. Share early wins, answer objections, close.`,
      ]) +
      p(`Then it compounds. Chapter 9 is the product ladder: a $7 ebook leads to a $27 mini-course, a $47 toolkit, a strategy call, and eventually coaching. The same person, more value over time. That's how a $7 product becomes a $10K month.`) +
      membershipBlock('Build it with a coach in your corner') +
      p(`Want us to pressure-test your launch before you hit publish? Book your free call:`) +
      callBlock(ctx.callBooked),
    }),
  },
  {
    key: 'wb_d6_last_call',
    day: 6,
    subject: 'Your AI trial ends tomorrow',
    preview: 'Last chance to keep your AI coach at the trial — and to grab your free call.',
    build: (ctx) => renderWB({ preview: 'Your trial ends tomorrow.', kicker: 'Last day', title: 'Your trial ends tomorrow', unsubUrl: ctx.unsubUrl, body:
      p(hi(ctx.name)) +
      p(`Tomorrow your <b>7-day The5th AI trial ends</b>. If it's helped you move — even a little — the worst thing you can do now is lose the momentum.`) +
      p(`Members keep full access to The5th AI for <b>$47/month</b> (cancel anytime): daily coaching, product and offer drafting, content planning, and accountability so you actually finish and launch.`) +
      membershipBlock('Keep your coach — $47/mo') +
      p(`And your free strategy call is still on the table if you haven't used it:`) +
      callBlock(ctx.callBooked),
    }),
  },
  {
    key: 'wb_d7_decision',
    day: 7,
    subject: 'Your trial has ended — here’s how to keep going',
    preview: 'Keep The5th AI, and one last invite to book your free call.',
    build: (ctx) => renderWB({ preview: 'Keep going after your trial.', kicker: 'What next', title: 'Keep the momentum', unsubUrl: ctx.unsubUrl, body:
      p(hi(ctx.name)) +
      p(`Your The5th AI trial has ended — thank you for spending the week building with us. You've got the book for life, so the roadmap isn't going anywhere.`) +
      p(`If you want to keep your AI coach (and I'd love you to), you can continue for <b>$47/month</b>, cancel anytime. It's the difference between "I read a great book once" and "I built a business."`) +
      membershipBlock('Continue with The5th AI') +
      p(`Prefer to talk it through with a human first? Grab your complimentary strategy call — no pitch, just help mapping your next step:`) +
      callBlock(ctx.callBooked) +
      p(`Whatever you choose: open the workbook, do the next exercise, and ship. You already know more than you think.`),
    }),
  },
]
export const WB_BY_KEY: Record<string, WBEmail> = Object.fromEntries(WB_EMAILS.map((e) => [e.key, e]))

/* ============================ SEND + ENROLL =============================== */
function htmlToText(html: string) {
  return html.replace(/<style[\s\S]*?<\/style>/gi, '').replace(/<[^>]+>/g, ' ').replace(/&nbsp;/gi, ' ').replace(/&amp;/gi, '&').replace(/&[a-z]+;/gi, '').replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim()
}

async function alreadySent(email: string, key: string) {
  const db = getSupabaseAdmin()
  const { data } = await db.from('event_email_log').select('id').eq('email', email).eq('email_key', key).maybeSingle()
  return !!data
}

export async function sendWorkbookEmail(email: string, key: string, ctx: WBCtx, opts: { log?: boolean; skipSuppress?: boolean } = {}): Promise<{ ok: boolean; error?: string }> {
  const { log = true, skipSuppress = false } = opts
  const def = WB_BY_KEY[key]
  if (!def) return { ok: false, error: 'unknown key' }
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) return { ok: false, error: 'RESEND_API_KEY missing' }
  const to = email.trim().toLowerCase()
  if (!skipSuppress && (await isUnsubscribed(to))) return { ok: false, error: 'unsubscribed' }
  const unsubUrl = unsubscribeUrl(to)
  const html = def.build({ ...ctx, unsubUrl })
  const resend = new Resend(apiKey)
  const { data, error } = await resend.emails.send({
    from: FROM,
    to,
    replyTo: REPLY_TO,
    subject: def.subject,
    html,
    text: htmlToText(html),
    headers: {
      'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
      'List-Unsubscribe': `<${unsubUrl}>, <mailto:Indrodip@10kroadmap.org?subject=unsubscribe>`,
    },
    tags: [{ name: 'campaign', value: 'workbook' }, { name: 'email_key', value: key }],
  })
  if (error) return { ok: false, error: String((error as { message?: string }).message || error) }
  if (log) await getSupabaseAdmin().from('event_email_log').upsert({ email: to, email_key: key, provider_id: data?.id || null }, { onConflict: 'email,email_key' }).then(() => {}, () => {})
  return { ok: true }
}

/** Enrol a buyer (idempotent) and send the day-0 welcome once. Safe to call
    from the thank-you page or a Whop webhook. */
export async function enrollWorkbookBuyer(email: string, name?: string | null, source = 'workbook'): Promise<{ ok: boolean; enrolled?: boolean; error?: string }> {
  const e = (email || '').trim().toLowerCase()
  if (!e || !e.includes('@')) return { ok: false, error: 'invalid email' }
  const db = getSupabaseAdmin()
  const { data: existing } = await db.from('workbook_buyers').select('email').eq('email', e).maybeSingle()
  if (!existing) {
    const now = new Date()
    const ends = new Date(now.getTime() + WB.trialDays * 86400000)
    await db.from('workbook_buyers').insert({ email: e, name: name || null, source, purchased_at: now.toISOString(), trial_ends_at: ends.toISOString() }).then(() => {}, () => {})
    // Mirror the buyer into the CRM: contact + "Workbook Buyer" tag + a purchase
    // on their timeline, so the book shows up alongside everything else.
    try {
      const contact = await resolveOrCreateContact({ email: e, name: name || undefined, source: 'workbook' }, { source: 'workbook' })
      if (contact?.id) await addTag(contact.id as string, 'Workbook Buyer', '#C9A84C')
      await logActivity(e, 'purchase', 'Bought The Knowledge Asset', '$7.93 workbook + 7-day The5th AI trial', { product: 'knowledge_asset', price: 7.93, source }, 'workbook')
    } catch { /* CRM sync is best-effort — never block enrollment */ }
  } else if (name) {
    await db.from('workbook_buyers').update({ name }).eq('email', e).then(() => {}, () => {})
  }
  // Send the day-0 welcome now — but ONLY when the campaign is live. Until then
  // the buyer is still recorded, and the daily cron will send day-0 (day <=
  // daysSince) the moment WORKBOOK_CAMPAIGN_LIVE flips on, so nothing is lost.
  if (process.env.WORKBOOK_CAMPAIGN_LIVE === 'true' && !(await alreadySent(e, 'wb_d0_welcome'))) {
    const quizTaken = await quizTakenFor(e)
    await sendWorkbookEmail(e, 'wb_d0_welcome', { name: name || undefined, quizTaken, callBooked: false })
  }
  return { ok: true, enrolled: !existing }
}

async function quizTakenFor(email: string): Promise<boolean> {
  const { data } = await getSupabaseAdmin().from('quiz_leads').select('email').eq('email', email).maybeSingle()
  return !!data
}

/* ============================ DAILY RUNNER =============================== */
export async function runWorkbookCampaign(): Promise<{ ok: boolean; buyers: number; sent: number; skipped: number; errors: number; by: Record<string, number> }> {
  const db = getSupabaseAdmin()
  const { data: buyers } = await db.from('workbook_buyers').select('email,name,purchased_at,unsubscribed').eq('unsubscribed', false).limit(5000)
  const list = buyers || []
  const by: Record<string, number> = {}
  let sent = 0, skipped = 0, errors = 0
  if (!list.length) return { ok: true, buyers: 0, sent, skipped, errors, by }

  // Pull the two "status" signals once for the whole batch.
  const booked = await getBookedEmails()
  const { data: quizRows } = await db.from('quiz_leads').select('email').limit(10000)
  const quizSet = new Set((quizRows || []).map((r) => String(r.email || '').toLowerCase()))

  const now = Date.now()
  for (const b of list) {
    const email = String(b.email).toLowerCase()
    const purchased = b.purchased_at ? new Date(b.purchased_at).getTime() : now
    const daysSince = Math.floor((now - purchased) / 86400000)
    const quizTaken = quizSet.has(email)
    const callBooked = booked.has(email)
    // Keep the row's convenience flags fresh for the admin view.
    db.from('workbook_buyers').update({ quiz_taken: quizTaken, call_booked: callBooked }).eq('email', email).then(() => {}, () => {})

    for (const def of WB_EMAILS) {
      if (def.day > daysSince) continue
      if (await alreadySent(email, def.key)) { skipped++; continue }
      const r = await sendWorkbookEmail(email, def.key, { name: b.name || undefined, quizTaken, callBooked })
      if (r.ok) { sent++; by[def.key] = (by[def.key] || 0) + 1 }
      else if (r.error === 'unsubscribed') { skipped++ }
      else { errors++ }
    }
  }
  return { ok: true, buyers: list.length, sent, skipped, errors, by }
}
