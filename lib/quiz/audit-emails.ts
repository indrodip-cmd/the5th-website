/* The 14-email sequence that sells the $29 audit call to people who took the
   Income Blocker Assessment and have not booked.

   Cadence (days after the report email): 1, 3, 5, 7, 10, 13, 16, 19, 22, 25, 28,
   32, 36, 41. Front-loaded while interest is hot (4 emails in week one), then
   spacing widens every few days so it never feels like pressure, and it runs
   for just under six weeks. Every email is personalised from the visitor's own
   profile, so nothing is generic. No fake deadlines and no fake scarcity.
   Stopped by lib/quiz/audit-mail.ts the moment they book, pay or unsubscribe. */
import { BLOCKERS, DIM_COPY } from './content'
import { DIM_IDS } from './questions'
import { dimBandOf, type Result } from './engine'
import { casesFor } from './real'

const SITE = (process.env.NEXT_PUBLIC_SITE_URL || 'https://the5thglobal.consulting').replace(/\/$/, '')
const ADDRESS = 'The5th Global Consulting · 15 Central Park West, New York, NY 10023'
const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c] as string))
const money = (n: number) => '$' + Math.round(n).toLocaleString('en-US')

export interface Step { n: number; day: number; key: string; label: string }
export const STEPS: Step[] = [
  { n: 1, day: 1, key: 'qa_01', label: 'What your profile really means' },
  { n: 2, day: 3, key: 'qa_02', label: 'The cost of the gap' },
  { n: 3, day: 5, key: 'qa_03', label: 'What happens in the 60 minutes' },
  { n: 4, day: 7, key: 'qa_04', label: 'A real expert in your position' },
  { n: 5, day: 10, key: 'qa_05', label: 'The myth that keeps you stuck' },
  { n: 6, day: 13, key: 'qa_06', label: '"I will do it myself"' },
  { n: 7, day: 16, key: 'qa_07', label: 'Is it a sales pitch?' },
  { n: 8, day: 19, key: 'qa_08', label: 'Plan check-in' },
  { n: 9, day: 22, key: 'qa_09', label: 'Why I built this' },
  { n: 10, day: 25, key: 'qa_10', label: 'Your questions answered' },
  { n: 11, day: 28, key: 'qa_11', label: 'What you leave with' },
  { n: 12, day: 32, key: 'qa_12', label: 'The blind spot in your answers' },
  { n: 13, day: 36, key: 'qa_13', label: 'Two ways forward' },
  { n: 14, day: 41, key: 'qa_14', label: 'Closing the loop' },
]
export const REPORT_KEY = 'qa_00'
export const STOP_KEY = 'qa_stop'

export interface Rendered { subject: string; html: string; text: string }
interface Ctx { first: string; r: Result; unsub: string }

const link = (r: Result, n: number) => `${SITE}/audit-checkout?src=quiz-email&e=${n}&p=${r.primary}&s=${r.secondary}&c=${r.code}&utm_source=email&utm_medium=sequence&utm_campaign=quiz-audit&utm_content=step${n}`
const reportLink = (r: Result, first: string) => `${SITE}/quiz/report?r=${r.code}&n=${encodeURIComponent(first)}`

/* ── layout ── */
function layout(c: Ctx, o: { pre: string; kicker: string; head: string; body: string[]; cta?: string; ps?: string; n: number }): string {
  const { r } = c
  const p = o.body.map((b) => b.startsWith('<') ? b : `<p style="margin:0 0 16px;font-size:16px;line-height:1.7;color:#2a2a3a">${b}</p>`).join('')
  const btn = `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:8px 0 6px"><tr><td style="background:#C9A84C;border-radius:8px"><a href="${link(r, o.n)}" style="display:inline-block;padding:16px 28px;font-weight:700;font-size:16px;color:#2E1A35;text-decoration:none">${esc(o.cta || 'Book my $29 audit')} &rarr;</a></td></tr></table>`
  return `<!doctype html><html><body style="margin:0;background:#F4EEE4;font-family:Helvetica,Arial,sans-serif">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent">${esc(o.pre)}</div>
<table width="100%" cellpadding="0" cellspacing="0" style="background:#F4EEE4"><tr><td align="center" style="padding:22px 12px">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden">
<tr><td style="background:#2E1A35;padding:22px 28px"><div style="font-size:11px;letter-spacing:.2em;text-transform:uppercase;color:#C9A84C;font-weight:700">${esc(o.kicker)}</div>
<div style="font-family:Georgia,serif;font-size:27px;line-height:1.18;color:#ffffff;margin-top:8px">${o.head}</div></td></tr>
<tr><td style="padding:26px 28px 8px">${p}${btn}
<p style="margin:12px 0 0;font-size:12.5px;color:#8A8075">$29 · 60 minutes · 7-day money-back guarantee</p>
${o.ps ? `<p style="margin:22px 0 0;font-size:15px;line-height:1.6;color:#2a2a3a"><b>P.S.</b> ${o.ps}</p>` : ''}
<p style="margin:22px 0 0;font-size:15px;color:#2a2a3a">Indrodip</p>
<p style="margin:2px 0 18px;font-size:13px;color:#8A8075">Your profile: <a href="${reportLink(r, c.first)}" style="color:#8A6D1F">${esc(r.archetype)} (${esc(r.profileId)})</a></p>
</td></tr>
<tr><td style="padding:0 28px 24px;font-size:11.5px;line-height:1.6;color:#8A8075;border-top:1px solid #EFE8DA"><br>You are receiving this because you took the Income Blocker Assessment. Reply to this email any time, I read every one.<br>${esc(ADDRESS)}<br><a href="${c.unsub}" style="color:#8A8075">Unsubscribe</a></td></tr>
</table></td></tr></table></body></html>`
}

const strip = (h: string) => h.replace(/<style[\s\S]*?<\/style>/gi, '').replace(/<a [^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi, '$2 ($1)').replace(/<\/(p|div|tr|h\d|li)>/gi, '\n').replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]+>/g, '').replace(/&rarr;/g, '->').replace(/&amp;/g, '&').replace(/\n{3,}/g, '\n\n').trim()
const li = (items: string[]) => `<ul style="margin:0 0 16px;padding-left:20px;font-size:16px;line-height:1.7;color:#2a2a3a">${items.map((i) => `<li style="margin:0 0 6px">${i}</li>`).join('')}</ul>`
const box = (t: string) => `<div style="margin:0 0 18px;padding:14px 16px;border-left:3px solid #C9A84C;background:#FBF6E8;border-radius:0 10px 10px 0;font-size:15.5px;line-height:1.65;color:#2E1A35">${t}</div>`

export function renderStep(n: number, c: Ctx): Rendered {
  const { r, first } = c
  const P = BLOCKERS[r.primary], S = BLOCKERS[r.secondary]
  const hi = first ? `${first}, ` : ''
  const kase = casesFor(r.niche, 1)[0]
  const weakest = [...DIM_IDS].sort((a, b) => r.dims[a] - r.dims[b])[0]
  let subject = ''
  let body: string[] = []
  let head = ''
  let kicker = 'Your Income Blocker profile'
  let pre = ''
  let cta: string | undefined
  let ps: string | undefined

  switch (n) {
    case 1:
      subject = `${hi}what "${P.archetype}" really means`.replace(/^, /, '')
      pre = `One thing your profile says that most people miss.`
      head = `You are <i style="color:#E4C879">${esc(P.archetype)}</i>.`
      body = [`Yesterday you finished the assessment. I want to translate one line from your report into plain English.`, esc(P.tagline), box(esc(r.pair)), `Here is the part people miss. This is not a flaw in you. It is a pattern, and patterns respond to the right next step. The fastest one for ${esc(P.name.toLowerCase())} is this:`, `<b>${esc(P.wins[0])}</b>`, `Do that today. It takes under an hour. If you want a second pair of eyes on your numbers while you do, that is exactly what the 60-minute audit is for.`]
      ps = `Your full report is still here: <a href="${reportLink(r, first)}" style="color:#8A6D1F">open it</a>.`
      break
    case 2:
      subject = `The ${money(r.gap.monthly)} gap in your report`
      pre = `Simple arithmetic from your own answers.`
      head = `The distance between ${money(r.gap.current)} and ${money(r.gap.target)}.`
      kicker = 'Your gap, in numbers'
      body = [`You told us you earn about ${money(r.gap.current)} a month from your expertise and that a breakthrough would be ${money(r.gap.target)}.`, box(`That is a gap of <b>${money(r.gap.monthly)} a month</b>, or <b>${money(r.gap.yearly)} over 12 months</b>. This is simple arithmetic from your answers, not a forecast.`), `Most experts try to close a gap like that by working harder. The data in your profile says the lever is different: your main block is ${esc(P.name.toLowerCase())}, and until that moves, more effort mostly produces more of the same month.`, `A $29 audit call is the smallest possible step to find what is actually holding that number down, with a 7-day money-back guarantee if it does not give you a usable next step.`]
      break
    case 3:
      subject = `What happens in the 60 minutes (and what you keep)`
      pre = `So you know exactly what you are booking.`
      head = `No mystery. Here is the call.`
      kicker = 'The $29 audit, step by step'
      body = [`People tell me they hesitate because they do not know what the call actually is. Here it is:`, li([`<b>Minutes 0 to 10:</b> we open your profile (${esc(r.profileId)}) and confirm what is really behind your ${esc(P.name.toLowerCase())} block.`, `<b>Minutes 10 to 40:</b> we go through your real numbers, your offer and your price, and find where income leaks.`, `<b>Minutes 40 to 60:</b> we turn it into a written next step you can start the same day.`]), `You leave with a <b>written audit and a 100-day roadmap</b>. After the call you also receive the 104-page <i>Expertise to Income</i> workbook and access to The5th AI.`, `To get the most from it, have your last 90 days of revenue, your current offer and price, and one sentence about your biggest bottleneck ready.`]
      break
    case 4:
      subject = `${kase.name} was where you are`
      pre = `A real expert, a real result.`
      head = `${esc(kase.name)} started like you.`
      kicker = 'A real client, published result'
      body = [`${esc(kase.name)} is a ${esc(kase.role.toLowerCase())}. ${esc(kase.name)} reported <b>${money(kase.amount)}${kase.plus ? '+' : ''}</b> in ${esc(kase.when)} after working with us.`, `I am not sharing this to promise you the same. Individual results vary and depend on what you do. I am sharing it because the starting point is familiar: skilled, committed, and held back by one or two blockers that were not obvious from the inside.`, `Your profile names yours: ${esc(P.name.toLowerCase())} first, then ${esc(S.name.toLowerCase())}. The audit is where we turn that into a plan for your business.`, `<span style="font-size:12.5px;color:#8A8075">Published client result from the5thglobal.consulting/results. Individual results vary.</span>`]
      break
    case 5: {
      const myth: Record<string, string> = {
        worth: 'I need to feel more confident before I charge more.',
        pricing: 'My market simply cannot pay more.',
        clarity: 'I need more research before I choose one offer.',
        visibility: 'I need a big following before people will buy.',
        selling: 'Good work sells itself.',
        system: 'I just need more discipline.',
      }
      const truth: Record<string, string> = {
        worth: 'Confidence follows evidence, not the other way around. Collect proof of your results, quote a higher price once, and watch what happens. The feeling catches up to the facts.',
        pricing: 'Almost nobody tests it. Quote a higher price to the next three new clients and record the replies. Most experts find the ceiling is far higher than they assumed.',
        clarity: 'Research feels safe and gives the illusion of progress. Five conversations with real people will teach you more than five more weeks of reading.',
        visibility: 'You need conversations, not followers. Ten warm conversations with people who already trust you beat 10,000 strangers scrolling past.',
        selling: 'Good work sells only when someone asks for the decision. A clear, kind invitation at the end of every conversation is the single biggest change most experts make.',
        system: 'Discipline is a poor plan. A tiny, protected routine of three actions a week beats willpower every time.',
      }
      subject = `The myth that keeps ${P.name.toLowerCase()} experts stuck`
      pre = `You might be telling yourself this one.`
      head = `The myth: "${esc(myth[r.primary])}"`
      kicker = `A myth about ${P.name.toLowerCase()}`
      body = [`Every blocker has a story that sounds sensible. For ${esc(P.name.toLowerCase())} it is usually this one: <i>${esc(myth[r.primary])}</i>`, esc(truth[r.primary]), `If you want to test that against your own numbers instead of taking my word for it, the audit does exactly that in an hour.`]
      break
    }
    case 6:
      subject = `"I will just do it myself" (an honest answer)`
      pre = `Maybe you should. Here is how to decide.`
      head = `You can do this yourself. Here is when not to.`
      kicker = 'An honest answer'
      body = [`Many people finish the assessment and think: I have my plan, I will take it from here. Sometimes that is exactly right.`, `It is the wrong call when any of these is true:`, li([`You have started and stalled before (${r.tried.length ? `you told us you have tried ${r.tried.length} thing${r.tried.length === 1 ? '' : 's'} already` : 'it is a common pattern'}).`, `Your main block is something you cannot see from inside, which is true of ${esc(P.name.toLowerCase())} for most people.`, `You would rather save three months than save $29.`]), `If you are going alone, use the 7-day plan in your report. If you want an outside view of your numbers first, the audit is built for that, and you keep the written roadmap either way.`]
      break
    case 7:
      subject = `Is the audit a sales pitch? Straight answer.`
      pre = `What I will and will not do on the call.`
      head = `It is a working session, not a pitch.`
      kicker = 'A straight answer'
      body = [`Fair question, and I would ask it too. Here is how the call works:`, li([`It is <b>60 minutes, 1:1, on video</b> with me and Manisha Satpute.`, `We work on <b>your</b> numbers, your offer and your price. Not a script.`, `You leave with a <b>written audit and a 100-day roadmap</b> whether or not you ever work with us again.`, `If it does not give you real clarity or a usable next step, email us within 7 days for a full refund. No conditions.`]), `If I can see a way we could work together later, I will say so honestly. If I cannot, I will say that too.`]
      break
    case 8:
      subject = `Did you start your 7-day plan?`
      pre = `Where are you on your 7-day plan?`
      head = `How is your 7-day plan going?`
      kicker = 'A friendly check-in'
      body = [`It has been about two and a half weeks since your report. Here is the plan we built for ${esc(P.name.toLowerCase())}, in case you want to pick it back up:`, li(P.plan.map((d) => `<b>${esc(d.day)}:</b> ${esc(d.title)}`)), `If you finished it, brilliant. Retake the assessment at <a href="${SITE}/quiz" style="color:#8A6D1F">${SITE.replace('https://', '')}/quiz</a> and see which blockers moved.`, `If you stalled, that is information, not failure. It is exactly the kind of thing we look at on the audit.`]
      cta = 'Talk it through on the audit'
      break
    case 9:
      subject = `Why I built this (a short story)`
      pre = `The reason The5th exists.`
      head = `I grew up around people like you.`
      kicker = 'A note from the founder'
      body = [`I grew up surrounded by talented professionals who spent years helping families, communities, workplaces and businesses, yet rarely got paid for the value they created.`, `Later, as a marketer and funnel strategist, I saw the same pattern everywhere. People with 20, 30, even 40 years of experience believed they had nothing worth selling, while people with far less expertise built successful online businesses.`, `That disconnect is why The5th exists, and why the assessment you took looks at the beliefs behind the numbers, not only the tactics. Your knowledge is not a hobby. It is an asset.`, `The audit is the fastest way I know to start treating it like one.`]
      break
    case 10:
      subject = `Your questions about the $29 audit, answered`
      pre = `Time, price, guarantee, fit.`
      head = `The five questions people ask.`
      kicker = 'Quick answers'
      body = [li([`<b>How long is it?</b> 60 minutes, 1:1, on video.`, `<b>What does it cost?</b> $29, one time. No upsell is required to get your written audit and roadmap.`, `<b>What if it is not useful?</b> Email us within 7 days for a full refund, no conditions.`, `<b>What if I am not a fit?</b> We will tell you honestly, and you still keep what we produce.`, `<b>Do I need to prepare?</b> Have your last 90 days of revenue, your current offer and price, and one sentence about your biggest bottleneck.`]), `Anything else? Just reply to this email and I will answer personally.`]
      break
    case 11:
      subject = `What you leave the call with`
      pre = `Four things, one hour, $29.`
      head = `Four things you walk away with.`
      kicker = 'What the audit delivers'
      body = [li([`<b>A written audit</b> of where your offer, price and positioning leak income.`, `<b>A 100-day roadmap</b> built around your two blockers: ${esc(P.name.toLowerCase())} and ${esc(S.name.toLowerCase())}.`, `<b>The 104-page <i>Expertise to Income</i> workbook</b>, sent after your session.`, `<b>Access to The5th AI</b>, your coaching copilot, sent after your session.`]), `Most people spend more than $29 on a single course that never gets finished. This is one hour with two people who look at your actual business, and a plan you keep.`]
      break
    case 12: {
      const spot = r.blindSpots[0]
      subject = spot ? `The blind spot in your answers` : `The strength hiding in your answers`
      pre = spot ? 'Two of your answers pulled in opposite directions.' : 'Something your profile does very well.'
      head = spot ? `One thing your answers contradict.` : `One thing you do really well.`
      kicker = 'From your profile'
      body = spot
        ? [`When we compared your answers, two of them pulled in opposite directions. In plain English:`, box(esc(spot)), `Blind spots are almost impossible to see alone, which is why they cost so much. On the audit call we look at this directly, with your numbers in front of us.`, `Your weakest mindset scale is <b>${esc(DIM_COPY[weakest].name.toLowerCase())}</b> (${dimBandOf(r.dims[weakest]) === 'attention' ? 'needs attention' : 'developing'}). ${esc(DIM_COPY[weakest][dimBandOf(r.dims[weakest])])}`]
        : [`Your answers were unusually consistent, which is a good sign. One of your standout strengths:`, box(esc(r.strengths[0] || 'You back your own value.')), `The audit helps you build on strengths like that instead of only fixing weaknesses, and turn them into a plan for the next 100 days.`]
      break
    }
    case 13:
      subject = `Two ways forward from here`
      pre = `Both are fine. Here is the honest difference.`
      head = `Two ways forward.`
      kicker = 'A simple choice'
      body = [`You have two honest options from here.`, `<b>Option one:</b> keep going alone. Use your report and 7-day plan, retake the assessment in a few weeks, and see how much moves. Many people do this and do well.`, `<b>Option two:</b> spend $29 and 60 minutes to have two people look at your real numbers and give you a written roadmap, with a 7-day money-back guarantee if it is not useful.`, `The only choice I would not recommend is the third one: reading this and doing nothing, because that guarantees the gap of ${money(r.gap.monthly)} a month stays exactly where it is.`]
      break
    case 14:
      subject = `Should I close your file, ${first || 'friend'}?`.replace(' , ', ' ')
      pre = `This is my last note about the audit.`
      head = `Should I close your file?`
      kicker = 'My last note'
      body = [`This is the last email in this series, so I will be brief.`, `Your profile (${esc(r.profileId)}) says your main block is ${esc(P.name.toLowerCase())} and your second is ${esc(S.name.toLowerCase())}. Nothing about that has changed, and the offer stands: $29, 60 minutes, a written audit and a 100-day roadmap, with a 7-day money-back guarantee.`, `If it is not the right time, no problem at all. Just reply "later" and I will leave it there. If you would rather book it, the button below goes straight to checkout.`, `Either way, thank you for taking the assessment. I hope it showed you something useful.`]
      cta = 'Yes, book my audit'
      ps = `Your report and 7-day plan stay available any time at <a href="${reportLink(r, first)}" style="color:#8A6D1F">your link</a>.`
      break
    default:
      throw new Error('unknown step ' + n)
  }

  const html = layout(c, { pre, kicker, head, body, cta, ps, n })
  return { subject: subject.replace(/\s+/g, ' ').trim(), html, text: strip(html) }
}
