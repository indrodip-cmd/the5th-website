/* Sales brief: what to know and say before a call, derived from the assessment.
   Pure and deterministic, so anyone on the team can run a great call from it. */
import { BLOCKERS } from './content'
import { DIM_IDS, type BlockerId } from './questions'
import { dimBandOf, type Result } from './engine'
import { DIM_COPY } from './content'

const T: Record<BlockerId, { opener: string; ask: string[]; say: string[]; avoid: string[]; objection: string }> = {
  worth: {
    opener: 'Your profile says the hardest part is not the work, it is feeling allowed to be paid well for it. Does that sound true for you?',
    ask: ['When you say your price out loud, what happens in your body?', 'Who in your life taught you what it means to earn from helping people?', 'What is the last thing you discounted or gave away, and why?'],
    say: ['"You are not asking for a favour, you are exchanging value for a result."', '"Let us look at what your best client result was actually worth to them."'],
    avoid: ['Do not argue with the belief or say "you just need confidence".', 'Do not rush to a price before they have named the value of their work.'],
    objection: 'If they say "I am not sure I am worth it", reflect it back: "That voice is exactly what the audit is built to work on. Whose voice is it?"',
  },
  pricing: {
    opener: 'Your profile says your prices sit well below the value you create. What are you charging today, and what did your best result do for the client?',
    ask: ['What is your effective hourly rate once you count prep and follow-up?', 'What was the best result a client got, and what was it worth to them?', 'When did you last say no to a client because the price felt too low?'],
    say: ['"Clients buy the result, so we price the result."', '"Raising your price for new clients first costs you nothing and teaches you a lot."'],
    avoid: ['Do not suggest a price before understanding the result they create.', 'Do not call their current price "wrong". Call it "ready to move".'],
    objection: 'If they say "my market cannot pay more", ask: "What have your best clients said when you quote them?" Usually nobody has tested it.',
  },
  clarity: {
    opener: 'Your profile says you are good at many things but nobody can tell exactly what to buy. If you had to pick one result to be known for, which would it be?',
    ask: ['Who are your three best clients and what did they have in common?', 'Which result gets you the strongest reaction when you describe it?', 'What are you afraid you will lose if you pick one thing?'],
    say: ['"A clear offer is a gift to your buyer. It saves them the work of guessing."', '"We choose one offer for the next 30 days, then widen."'],
    avoid: ['Do not suggest new tactics. They have enough ideas.', 'Do not let them describe more than one offer in the first ten minutes.'],
    objection: 'If they say "I need more research", answer: "Research feels safe. A small test with five people will teach you more this week."',
  },
  visibility: {
    opener: 'Your profile says too few of the right people know you exist. Where do most of your clients come from today, and what are you doing to reach more?',
    ask: ['Who could you message today who might benefit or know someone who would?', 'What stops you posting or reaching out: time, tech or fear of being seen?', 'What has worked even once to bring in a client?'],
    say: ['"You do not need a following, you need conversations."', '"Start with the people who already trust you."'],
    avoid: ['Do not push content calendars or ads.', 'Do not call it laziness. It is usually safety.'],
    objection: 'If they say "I hate social media", reply: "Then we do not start there. We start with ten warm conversations."',
  },
  selling: {
    opener: 'Your profile says people like you but conversations end without a clear invitation. Walk me through the last conversation that did not turn into a client.',
    ask: ['What do you say at the end of a call?', 'How many people said "let me think" in the last month?', 'What do you do after you send details?'],
    say: ['"A decision, yes or no, is kinder than silence."', '"We will give you a simple flow: understand, recommend, invite."'],
    avoid: ['Do not use pressure tactics. It will confirm their fear of selling.', 'Do not skip the diagnosis. Model the flow you want them to use.'],
    objection: 'If they say "I do not want to be pushy", answer: "Great. This is service, not pressure. Clear invitations are the opposite of pushy."',
  },
  system: {
    opener: 'Your profile says you start strong and then momentum fades. What was the last thing you started and stopped, and what got in the way?',
    ask: ['What are the three actions that brought you your last clients?', 'How many half-finished projects do you have right now?', 'What would a calm, repeatable week look like for you?'],
    say: ['"We cut your plan down to the few actions that actually pay."', '"One thing finished beats five things started."'],
    avoid: ['Do not add more tools, courses or tasks.', 'Do not praise ambition. Praise finishing.'],
    objection: 'If they say "I have no time", answer: "Good. Then the plan has to be 20 minutes a day, and we will build exactly that."',
  },
}

export interface Brief {
  headline: string
  snapshot: { label: string; value: string }[]
  gaps: string[]
  mindset: { name: string; score: number; band: string }[]
  opener: string
  discovery: string[]
  say: string[]
  avoid: string[]
  objections: { q: string; a: string }[]
  recommendation: { next: string; why: string; offers: string[] }
  text: string
}

const moneyF = (n: number) => '$' + Math.round(n).toLocaleString('en-US')

export function salesBrief(r: Result): Brief {
  const P = BLOCKERS[r.primary], S = BLOCKERS[r.secondary]
  const t = T[r.primary]
  const hint = T[r.secondary]
  const investLabel = { now: 'Would invest this week', month: 'Would invest within a month', sure: 'Needs to be very sure first', tight: 'Budget is tight' }[r.invest] || r.invest
  const supportLabel = { self: 'Prefers to do it themselves', group: 'Prefers group and structure', one: 'Prefers 1:1 with an expert', done: 'Wants it done with or for them' }[r.support] || r.support

  const snapshot = [
    { label: 'Profile', value: `${r.archetype} (${r.profileId})` },
    { label: 'Main / second blocker', value: `${P.name} (${r.intensities[r.primary]}) / ${S.name} (${r.intensities[r.secondary]})` },
    { label: 'Income today / goal', value: `${moneyF(r.gap.current)} / ${moneyF(r.gap.target)} a month` },
    { label: 'Monthly gap', value: `${moneyF(r.gap.monthly)} (${moneyF(r.gap.yearly)} a year)` },
    { label: 'Readiness', value: `${r.readinessScore}/100 (${r.readiness}), urgency ${r.urgency}/5` },
    { label: 'Investment signal', value: investLabel },
    { label: 'Help style', value: supportLabel },
    { label: 'Stage / niche', value: `${r.stage} / ${r.nicheLine.who}` },
  ]

  const gaps = [
    `${P.name}: ${P.tagline}`,
    `Compounded by ${S.name.toLowerCase()}: ${S.tagline}`,
    ...r.blindSpots,
    `${moneyF(r.gap.monthly)} a month between today and the goal they named.`,
  ]

  const objections = [
    { q: '"I need to think about it."', a: `Ask what exactly they need to think through. Usually it is ${P.name.toLowerCase()}. Offer the $29 audit as the low-risk way to get clarity, with the 7-day money-back guarantee.` },
    { q: '"I can do it myself with the plan."', a: 'Agree the plan helps. Then ask how many times they have started alone and stalled. The audit adds an outside view of their numbers.' },
    { q: '"I do not have the money right now."', a: r.invest === 'tight' ? 'They told us budget is tight. Lead with the $29 audit only, not a larger program.' : '$29 is the smallest step. Do not discount. Ask what outcome would make it worth it.' },
    { q: '"I have tried this before."', a: `That matches their pattern (${r.tried.length} things tried). Ask what was missing: usually a diagnosis of the real block, which is what the report and audit provide.` },
    { q: 'Blocker-specific', a: t.objection },
  ]

  const rec = (() => {
    if (r.readiness === 'hot' && r.invest !== 'tight') return { next: 'Book the $29 audit now. After it, propose Fast Forward.', why: `Urgency ${r.urgency}/5 and willing to invest. Strike while the report is fresh.`, offers: ['$29 Private Business Audit (this call)', 'Fast Forward 1:1: now $2,500 (standard $5,500), only after the audit'] }
    if (r.readiness === 'warm') return { next: 'Book the $29 audit and a follow-up in 3 days.', why: 'Interested but needs a clear next step and a small commitment.', offers: ['$29 Private Business Audit', 'The Collective as a gentler follow-on'] }
    return { next: 'Send the report link and the 7-day plan, then invite to the $29 audit.', why: 'Still exploring. Build trust before asking for a commitment.', offers: ['7-day plan first', '$29 audit when ready'] }
  })()

  const discovery = [...t.ask, ...hint.ask.slice(0, 2)]
  const mindset = DIM_IDS.map((d) => ({ name: DIM_COPY[d].name, score: r.dims[d], band: dimBandOf(r.dims[d]) }))

  const text = [
    `SALES BRIEF: ${r.archetype} (${r.profileId})`,
    ...snapshot.map((s) => `${s.label}: ${s.value}`),
    '', 'THE GAP', ...gaps.map((g) => '- ' + g),
    '', 'OPENING LINE', t.opener,
    '', 'DISCOVERY QUESTIONS', ...discovery.map((d) => '- ' + d),
    '', 'SAY', ...t.say.map((d) => '- ' + d),
    '', 'AVOID', ...t.avoid.map((d) => '- ' + d),
    '', 'OBJECTIONS', ...objections.map((o) => `${o.q} ${o.a}`),
    '', 'RECOMMENDED NEXT STEP', rec.next, rec.why,
  ].join('\n')

  return { headline: `${r.archetype} · ${P.name} + ${S.name}`, snapshot, gaps, mindset, opener: t.opener, discovery, say: t.say, avoid: t.avoid, objections, recommendation: rec, text }
}
