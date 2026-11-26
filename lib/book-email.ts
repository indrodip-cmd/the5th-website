/* Email templates for the Expertise to Income book funnel.

   Self-contained on purpose (no path aliases, no server imports) so these can be
   rendered anywhere: the sender, the admin preview, a script. Every email is one
   branded layout (table-based, inline styles, bulletproof button, preheader,
   plain-text twin) with its own copy. Only claims that exist in the book or on
   the site are used: no countdowns, no fake scarcity, no invented numbers. */

export const SITE = 'https://the5thglobal.consulting'
const C = {
  forest: '#07200F', forest2: '#0C3A28', lime: '#C9FF48', limeDk: '#9BE02A', ink: '#14201A', soft: '#44544B', mute: '#6A7A70',
  paper: '#EEF2E6', card: '#FFFFFF', tint: '#F4F8EA', line: '#DDE6D2', link: '#1B6B3A',
}
export const IMG = {
  logo: `${SITE}/images/logo-white.png`,
  book: `${SITE}/images/book/email-book.png`,
  indrodip: `${SITE}/images/book/email-indrodip.jpg`,
}
export const BOOK_LINK = (campaign: string) => `${SITE}/book?utm_source=email&utm_medium=book-campaign&utm_campaign=${campaign}#checkout`

export type Rendered = { subject: string; html: string; text: string }

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
const strip = (h: string) => h.replace(/<br\s*\/?>/gi, '\n').replace(/<\/p>/gi, '\n\n').replace(/<li[^>]*>/gi, '- ').replace(/<a [^>]*href="([^"]+)"[^>]*>(.*?)<\/a>/gi, '$2 ($1)').replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&rsquo;/g, "'").replace(/\n{3,}/g, '\n\n').trim()

const P = (t: string) => `<p style="margin:0 0 18px;font-family:Georgia,'Times New Roman',serif;font-size:17px;line-height:1.7;color:${C.ink}">${t}</p>`
const H = (t: string) => `<p style="margin:26px 0 10px;font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:${C.link}">${t}</p>`
const LIST = (items: string[]) => `<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin:0 0 20px">${items.map((i) => `<tr><td width="30" valign="top" style="padding:3px 0 10px"><div style="width:20px;height:20px;border-radius:10px;background:${C.lime};text-align:center;font:700 12px/20px Arial,sans-serif;color:${C.forest}">&#10003;</div></td><td valign="top" style="padding:0 0 10px;font-family:Georgia,'Times New Roman',serif;font-size:16.5px;line-height:1.6;color:${C.ink}">${i}</td></tr>`).join('')}</table>`
const QUOTE = (t: string) => `<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin:6px 0 22px"><tr><td width="5" style="background:${C.lime};border-radius:3px">&nbsp;</td><td style="padding:14px 18px;background:${C.tint};border-radius:0 12px 12px 0;font-family:Georgia,'Times New Roman',serif;font-style:italic;font-size:17px;line-height:1.6;color:${C.forest2}">${t}</td></tr></table>`
const BTN = (label: string, href: string) => `<table role="presentation" align="center" cellpadding="0" cellspacing="0" style="margin:8px auto"><tr><td align="center" bgcolor="${C.lime}" style="border-radius:999px;mso-padding-alt:0"><a href="${href}" target="_blank" style="display:inline-block;padding:17px 34px;font-family:Arial,Helvetica,sans-serif;font-size:17px;font-weight:800;color:${C.forest};text-decoration:none;border-radius:999px;background:${C.lime}">${label}&nbsp;&rarr;</a></td></tr></table>`
const BIG = (n: string, label: string) => `<td align="center" width="33%" style="padding:6px 8px"><div style="font:900 28px/1.1 Arial,sans-serif;color:${C.forest2}">${n}</div><div style="font:600 12px/1.4 Arial,sans-serif;color:${C.mute};text-transform:uppercase;letter-spacing:.08em;margin-top:4px">${label}</div></td>`
export const STATS = `<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin:4px 0 24px;border-top:1px solid ${C.line};border-bottom:1px solid ${C.line}"><tr>${BIG('104', 'pages')}${BIG('9', 'chapters')}${BIG('365', 'day guarantee')}</tr></table>`

interface Layout { preview: string; kicker: string; title: string; body: string; cta?: { label: string; href: string }; ps?: string; hero?: 'book' | 'none'; unsub?: string; transactional?: boolean }

export function layout(o: Layout): string {
  const hero = o.hero !== 'none'
  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"><meta name="x-apple-disable-message-reformatting"><title>${esc(o.title)}</title>
<style>@media (max-width:620px){.wrap{width:100%!important}.pad{padding-left:22px!important;padding-right:22px!important}.h1{font-size:28px!important}.bk{width:200px!important}}</style></head>
<body style="margin:0;padding:0;background:${C.paper};-webkit-font-smoothing:antialiased">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;height:0;width:0">${esc(o.preview)}${'&nbsp;&zwnj;'.repeat(70)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="${C.paper}" style="background:${C.paper}"><tr><td align="center" style="padding:26px 12px">
<table role="presentation" class="wrap" width="600" cellpadding="0" cellspacing="0" style="width:600px;max-width:100%;background:${C.card};border-radius:20px;overflow:hidden;box-shadow:0 24px 60px -34px rgba(7,32,15,.55)">
  <tr><td class="pad" bgcolor="${C.forest}" align="center" style="background:${C.forest};padding:22px 40px 0"><img src="${IMG.logo}" alt="The5th Global Consulting" height="28" style="height:28px;display:block;margin:0 auto 10px"></td></tr>
  <tr><td class="pad" bgcolor="${C.forest}" align="center" style="background:linear-gradient(180deg,${C.forest} 0%,${C.forest2} 100%);background-color:${C.forest};padding:8px 40px ${hero ? '0' : '34px'}">
    <div style="font:800 11px/1 Arial,sans-serif;letter-spacing:.26em;text-transform:uppercase;color:${C.lime};margin:10px 0 14px">${esc(o.kicker)}</div>
    <div class="h1" style="font-family:Arial,Helvetica,sans-serif;font-weight:900;font-size:34px;line-height:1.12;letter-spacing:-.02em;color:#FFFFFF">${o.title}</div>
    ${hero ? `<div style="padding:26px 0 0"><img class="bk" src="${IMG.book}" width="260" alt="Expertise to Income, the book" style="width:260px;max-width:70%;height:auto;display:block;margin:0 auto"></div>` : ''}
  </td></tr>
  <tr><td height="6" bgcolor="${C.lime}" style="background:${C.lime};font-size:0;line-height:0">&nbsp;</td></tr>
  <tr><td class="pad" style="padding:34px 44px 10px">
    ${o.body}
    ${o.cta ? `<div style="text-align:center;margin:10px 0 6px">${BTN(o.cta.label, o.cta.href)}</div>` : ''}
    ${o.ps ? `<div style="margin:26px 0 4px;padding-top:20px;border-top:1px solid ${C.line}">${P(`<b>P.S.</b> ${o.ps}`)}</div>` : ''}
  </td></tr>
  <tr><td class="pad" style="padding:6px 44px 30px">
    <table role="presentation" cellpadding="0" cellspacing="0"><tr>
      <td width="66" valign="middle"><img src="${IMG.indrodip}" width="56" height="56" alt="Indrodip" style="width:56px;height:56px;border-radius:28px;display:block;border:2px solid ${C.lime}"></td>
      <td valign="middle" style="font-family:Arial,Helvetica,sans-serif;font-size:14.5px;line-height:1.5;color:${C.soft}"><b style="color:${C.ink}">Indrodip Ghosh</b><br>Co-author, Expertise to Income<br>Founder, The5th Global Consulting</td>
    </tr></table>
  </td></tr>
  <tr><td class="pad" bgcolor="${C.tint}" style="background:${C.tint};padding:22px 44px;border-top:1px solid ${C.line};font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.65;color:${C.mute}">
    ${o.transactional ? 'You are receiving this because you purchased Expertise to Income.' : 'You are receiving this because you asked for Chapter 1 of Expertise to Income at the5thglobal.consulting.'}
    ${o.unsub && !o.transactional ? ` <a href="${o.unsub}" style="color:${C.link};text-decoration:underline">Unsubscribe</a>.` : ''}<br>
    The5th Global Consulting. Educational content only; no guarantee of income or results. Your results depend on your effort, offer and market.
  </td></tr>
</table>
</td></tr></table></body></html>`
}

const first = (n?: string) => (n && n.trim() ? n.trim().split(' ')[0] : 'there')
function finish(subject: string, o: Layout): Rendered { return { subject, html: layout(o), text: strip(`${o.title}\n\n${o.body}\n\n${o.cta ? o.cta.label + ': ' + o.cta.href : ''}\n\n${o.ps ? 'P.S. ' + o.ps : ''}\n\n- Indrodip Ghosh`) } }

export type Ctx = { name?: string; unsub?: string; downloadUrl?: string }

/* ── 0a. Chapter 1 delivery (immediately after the signup) ─────────────── */
export function chapter1(c: Ctx): Rendered {
  return finish('Your free Chapter 1 is here (6 pages, one sitting)', {
    preview: 'Six pages. Your why, your non-negotiables, your 12-month vision.', kicker: 'Your free chapter', title: 'Chapter 1 is yours.', unsub: c.unsub, hero: 'book',
    body: P(`Hi ${esc(first(c.name))},`) + P('Thank you for asking for Chapter 1 of <i>Expertise to Income</i>. It is six pages and takes one sitting.') +
      H('What you will do in it') + LIST(['Use the 3-layer method to find the real reason behind your business, the one that keeps you going on slow days.', 'Write your non-negotiables: your time, your money, your lifestyle and your values.', 'Finish with one clear sentence about where you want to be in 12 months.']) +
      QUOTE('Start with your surface reason. Then ask: &ldquo;But why does that matter?&rdquo; Then ask it again. Three layers down, you find the real answer.') +
      P('Do the exercise with a pen. Insight without action is just entertainment, and the pages only work if you write on them.'),
    cta: { label: 'Download Chapter 1', href: c.downloadUrl || `${SITE}/documents/expertise-to-income-chapter-1.pdf` },
    ps: `Over the next two weeks I will send you a few short notes from the book. If you would rather not get them, there is an unsubscribe link at the bottom, no hard feelings.`,
  })
}

/* ── 0b. Purchase delivery ─────────────────────────────────────────────── */
export function purchase(c: Ctx): Rendered {
  return finish('Your book is here: Expertise to Income (download inside)', {
    preview: 'Your 104-page workbook, ready to download. Start with Chapter 1 tonight.', kicker: 'Payment received', title: 'Your book is here.', hero: 'book', transactional: true,
    body: P(`Hi ${esc(first(c.name))},`) + P('Thank you for buying <i>Expertise to Income</i>. Your copy is ready: the full 104-page workbook as a PDF. Read it on any device, or print it and write in it.') + STATS +
      H('Do this tonight') + LIST(['<b>Download the PDF</b> and save it somewhere easy to find.', '<b>Sign your 30-day commitment</b> on the first pages. It sounds small. It is not.', '<b>Do Chapter 1</b> and write your Layer 3 why. One sitting is enough.']) +
      P('Then go one chapter a week. Nine chapters, nine stops on the road from expertise to a finished product, an offer and a launch date.'),
    cta: { label: 'Download your book', href: c.downloadUrl || `${SITE}/book/thank-you?status=succeeded` },
    ps: 'You are covered by a 365-day money-back guarantee. If it is not worth every cent, reply to this email and I will sort it out. And if you get stuck on any exercise, reply and tell me where. I read every message.',
  })
}

/* ── 5 campaign emails for people who took Chapter 1 and have not bought ── */
export const CAMPAIGN_DAYS = [1, 3, 5, 8, 12] as const
export type CampaignStep = 1 | 2 | 3 | 4 | 5

export function campaign(step: CampaignStep, c: Ctx): Rendered {
  const hi = P(`Hi ${esc(first(c.name))},`)
  const base = { unsub: c.unsub, hero: 'none' as const }
  switch (step) {
    case 1: return finish('Did you write your Layer 3 why?', { ...base, preview: 'One fitness coach started with "I want more clients." Her real reason was very different.', kicker: 'A quick check-in', title: 'Did you write your why?',
      body: hi + P('Yesterday I sent you Chapter 1. Most people read it, nod, and move on without writing anything down. That is the part that changes things, so here is a real example of what the exercise can uncover.') +
        QUOTE('A fitness coach said her Layer 1 was &ldquo;I want more clients.&rdquo; Layer 2: &ldquo;So I can stop working weekends.&rdquo; Her real Layer 3: &ldquo;Because my children are growing up and I keep missing it.&rdquo;') +
        P('That is not a strategy. It is a reason not to quit. It is also the difference between a business you abandon in week three and one you build.') +
        P('If you have not done it yet, open Chapter 1 and give it ten honest minutes. Then you have the foundation, and the next eight chapters turn it into a product, an offer and a launch date.'),
      cta: { label: 'Get the full book: $4.99', href: BOOK_LINK('c1-d1') }, ps: 'The whole book is $4.99 with a 365-day money-back guarantee. The risk is mine, not yours.' })
    case 2: return finish('The hours you will never get back', { ...base, preview: '2,080 hours a year. None of them build something you own.', kicker: 'A short story', title: 'A job with extra steps.',
      body: hi + P('In 2023, Google offered me a job. A salary. Stability. I almost said yes.') + P('At the time I was running an agency for international clients. From the outside it looked like success. From the inside I was exhausted, trading hours for money. I had built a business that could not run without me. That is not a business. <b>That is a job with extra steps.</b>') +
        P('If you work 40 hours a week, that is about 2,080 hours a year. Income that stops the week you stop is real, but there is a ceiling on it, and the ceiling is the number of hours you have.') +
        P('A digital product works differently. You create it once and it can be sold again and again. The book walks you from the first kind of income to the second, one chapter at a time.'),
      cta: { label: 'See the book', href: BOOK_LINK('c1-d3') }, ps: 'On the page there is a small calculator. Put in your own hours and your own rate and see the gap for yourself. It is arithmetic, not a promise.' })
    case 3: return finish('"What I know is too basic"', { ...base, preview: 'She spent six months convincing herself her knowledge was too basic.', kicker: 'The most common thing I hear', title: '&ldquo;What I know is too basic.&rdquo;',
      body: hi + P('A healing practitioner I worked with spent six months convincing herself that her knowledge of trauma recovery was too basic. She had helped herself recover from burnout after a 20-year corporate career.') +
        QUOTE('That was not basic. That was a $997 course waiting to exist.') +
        P('Obvious to you is a breakthrough to someone else. Your lived experience is a curriculum. Your scars are a roadmap.') +
        P('Chapter 2 gives you an expertise inventory: a set of questions that pull out what you know, what you have solved, and what people already come to you for. Most people finish it with two or three product ideas they did not have an hour earlier.'),
      cta: { label: 'Start with Chapter 2', href: BOOK_LINK('c1-d5') }, ps: 'One example from a client, not a typical result and not a promise. What it shows is how often people underestimate what they know.' })
    case 4: return finish('Inside the other eight chapters', { ...base, preview: 'What you walk away with at every stop on the road.', kicker: 'What is inside', title: 'The whole road, stop by stop.',
      body: hi + P('You have seen Chapter 1. Here is what the rest of the book does, and what you hold in your hands after each stop:') +
        LIST(['<b>2. Diagnose</b>: your income breakdown, your biggest leaks, your expertise inventory.', '<b>3. The asset mindset</b>: your first product idea and your place on the $7 to $10K ladder.', '<b>4. Your perfect audience</b>: a 10-detail profile of your One Person.', '<b>5. Your first product</b>: a blueprint and a one-sentence sales promise.', '<b>6. A simple offer</b>: your offer stack and a one-page description.', '<b>7. The content system</b>: a 30-day content map and five posts that sell.', '<b>8. Your launch plan</b>: set-up step by step, a 7-day launch and scripts for your first ten messages.', '<b>9. Mindset</b>: a plan for rejection, slow days and doubt.']) +
        STATS + P('It is a workbook, not a video series. You read a short chapter, then write on the page. You finish with decisions made, not just ideas.'),
      cta: { label: 'Get the book: $4.99', href: BOOK_LINK('c1-d8') }, ps: '365-day money-back guarantee. If you do the first two chapters and it is not for you, email me and you get every cent back.' })
    case 5: return finish('My last note about the book', { ...base, preview: 'No countdown, no pressure. Just one honest thought.', kicker: 'One more thing', title: 'No pressure. One honest thought.',
      body: hi + P('This is the last email in this short series, and I am not going to invent a deadline. The book is $4.99 tomorrow and next month too.') +
        P('Here is the honest version. Most people who read Chapter 1 feel a spark, then go back to what they were doing, and a year later they are in the same place with the same knowledge nobody can buy yet. The only thing that breaks that pattern is writing things down and taking the next small step.') +
        P('If that is not for you, that is completely fine. If it is, the cost is $4.99 and a full year of protection: if it is not worth it, you get your money back.') +
        P('Whatever you decide, I hope Chapter 1 gave you something real to hold onto.'),
      cta: { label: 'Get Expertise to Income', href: BOOK_LINK('c1-d12') }, ps: 'Reply to this email with one question about the book and I will answer it myself.' })
  }
}

export const TEMPLATES: Record<string, (c: Ctx) => Rendered> = {
  chapter1, purchase,
  c1: (c) => campaign(1, c), c2: (c) => campaign(2, c), c3: (c) => campaign(3, c), c4: (c) => campaign(4, c), c5: (c) => campaign(5, c),
}
