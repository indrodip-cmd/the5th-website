/* The Income Blocker Quiz: preset answer library.

   Every sentence a visitor can see in their report lives here, written once and
   assembled by the engine. No AI, no waiting. Variety comes from combination:
     6 primary blockers x 5 secondary blockers      = 30 profile archetypes
     6 blockers x 4 business stages                 = 24 "next move" paragraphs
     8 niche lines, 5 income lines, 6 x 7 day plan  = 42 daily actions
     6 x 3 quick wins, 6 x 5 recognisable signs     = 48 more blocks */
import type { BlockerId, DimId, Answers } from './questions'

export interface BlockerContent {
  id: BlockerId
  code: string          // two-letter profile code
  name: string          // short noun used in lists
  archetype: string     // friendly profile name
  color: string
  tagline: string       // one-line verdict
  whatItIs: string[]    // two short paragraphs
  signs: string[]       // five "you might recognise this" lines
  why: string           // root cause
  costs: string         // what it quietly costs
  shifts: string[]      // three ideas that change it
  wins: string[]        // three quick wins for this week
  plan: { day: string; title: string; task: string }[]
  audit: string[]       // what the audit call does about it
}

export const BLOCKERS: Record<BlockerId, BlockerContent> = {
  clarity: {
    id: 'clarity', code: 'UE', name: 'Offer Clarity', archetype: 'The Undefined Expert', color: '#8FB7FF',
    tagline: 'You are good at many things, but nobody can tell exactly what to buy from you.',
    whatItIs: [
      'Clarity is the ability to say, in one sentence, who you help, what changes for them, and how. When that sentence is fuzzy, every other part of the business gets harder: marketing feels vague, prices feel arbitrary and sales conversations wander.',
      'It is rarely a lack of expertise. It is usually the opposite. You know so much that choosing one thing to sell feels like giving up everything else.',
    ],
    signs: ['You describe what you do differently every time someone asks', 'You keep adjusting your niche instead of testing it', 'People say "that sounds interesting" and then nothing happens', 'You have many ideas and no single offer you would stake a launch on', 'You read, research and plan more than you talk to buyers'],
    why: 'People pay for a specific result they can picture. A broad offer asks the buyer to do the work of figuring out what you can do for them, and most simply will not.',
    costs: 'Months of effort go into content, pages and conversations that cannot convert because the offer behind them is unclear.',
    shifts: ['Build the offer from your best client results, not from a blank page', 'Sell one transformation to one kind of person first, and widen later', 'Test the sentence in real conversations before you build anything'],
    wins: ['Write the one sentence: "I help [who] go from [problem] to [result] by [how]"', 'List your three best client results and what they had in common', 'Say your sentence to three people and write down their first question'],
    plan: [
      { day: 'Day 1', title: 'Find your proof', task: 'List every result you have helped someone reach. Circle the three you are proudest of.' },
      { day: 'Day 2', title: 'Spot the pattern', task: 'Write what those three people had in common: their situation, their problem, what they wanted.' },
      { day: 'Day 3', title: 'Draft your sentence', task: 'Complete "I help [who] go from [problem] to [result] by [how]". Write three versions.' },
      { day: 'Day 4', title: 'Name the outcome', task: 'Describe the result in the buyer\'s words, in one line a stranger would understand.' },
      { day: 'Day 5', title: 'Test it live', task: 'Say it to three people. Note what they ask next. That question is your next improvement.' },
      { day: 'Day 6', title: 'Shape the offer', task: 'Decide the format, the length and the finish line: what does "done" look like for the client?' },
      { day: 'Day 7', title: 'Commit', task: 'Choose one offer and one audience for the next 30 days. Write it on a card and put it where you work.' },
    ],
    audit: ['Turns your results into one clear, sellable offer', 'Tests the one-sentence version of it with you on the call', 'Gives you a written next step so you stop second-guessing'],
  },
  worth: {
    id: 'worth', code: 'QV', name: 'Self-Worth', archetype: 'The Quiet Voice', color: '#C9A6DC',
    tagline: 'An inner voice questions your right to be paid well, so you soften, hide or give away what would help most.',
    whatItIs: [
      'The self-worth block is the belief that your knowledge is ordinary, that charging is somehow wrong, or that someone else is more qualified to earn from it. It is not weakness. It is often the side effect of caring deeply about people.',
      'It shows up as mental blocks ("who am I to charge that?") and money blocks (guilt around receiving), and it quietly sets a ceiling on what you allow yourself to earn.',
    ],
    signs: ['You feel uneasy the moment you say a price out loud', 'You keep studying instead of launching because you are "not ready yet"', 'You give discounts before anyone has asked', 'Praise from clients is hard to believe or quickly brushed off', 'You compare yourself to people who started later and are earning more'],
    why: 'Beliefs about money and worth are learned early and run in the background. They decide what you ask for, what you accept and what you stop yourself from even trying. Strategy alone cannot override them.',
    costs: 'You work with the right people for too little, or you avoid putting yourself forward at all, and the people who need your help never find it.',
    shifts: ['Anchor your price to the result you create, not to the hours you spend', 'Collect proof of the change you made, and read it before every sales conversation', 'Practise saying your price out loud until it sounds like information, not a request'],
    wins: ['Write down three results clients got and what those results were worth to them', 'Say your full price out loud ten times, alone, until it feels flat and calm', 'Ask one past client what changed for them and write their words down exactly'],
    plan: [
      { day: 'Day 1', title: 'Name the voice', task: 'Write the exact sentence your inner critic says about charging. Seeing it on paper takes some of its power.' },
      { day: 'Day 2', title: 'Collect proof', task: 'Gather messages, results and thank-yous from people you have helped. Put them in one document.' },
      { day: 'Day 3', title: 'Value the change', task: 'For each result, write what that change was worth to the person, in money, time or peace of mind.' },
      { day: 'Day 4', title: 'Rewrite the story', task: 'Replace "who am I to charge?" with "this is the exchange for a result I create". Write it as your own sentence.' },
      { day: 'Day 5', title: 'Say it out loud', task: 'Practise your price aloud ten times, then once to a friend. Notice that nothing bad happens.' },
      { day: 'Day 6', title: 'Raise it a little', task: 'Choose a new price 20 to 30 percent higher than your current one. Write it down as your standard.' },
      { day: 'Day 7', title: 'Use it once', task: 'Quote the new price in a real conversation, calmly, then stop talking and let them answer.' },
    ],
    audit: ['Finds the specific belief capping your income, not just the symptom', 'Resets a price you can say calmly, based on your results', 'Gives you words for the moment the money conversation happens'],
  },
  pricing: {
    id: 'pricing', code: 'UC', name: 'Pricing', archetype: 'The Undercharger', color: '#E4C879',
    tagline: 'Your prices sit well below the value you create, so even good months do not move your income.',
    whatItIs: [
      'Pricing is the bridge between the value you create and the income you keep. When it is set too low, you need far more clients to earn the same, which leaves less time and energy for each one.',
      'Most experts price by hours or by what feels safe. Clients buy the result, so the price should reflect the result, not the time.',
    ],
    signs: ['You price by the hour or by what competitors charge', 'You discount before the client has hesitated', 'You are busy but your income does not reflect it', 'You feel resentful after sessions that were "too cheap"', 'Your best clients say you could charge more'],
    why: 'Low prices are rarely about the market. They come from uncertainty about value, so you set a price that feels easy to defend. Unfortunately it is also easy to ignore.',
    costs: 'Every client you take at a low price takes capacity you could have given to better-paying work, and the gap compounds every month.',
    shifts: ['Price the transformation, not the time it takes', 'Offer a package with a defined result and one clear price', 'Raise prices for new clients first and let the evidence build your confidence'],
    wins: ['Write what your best result is worth to the client and price at a small fraction of it', 'Turn your hourly rate into a three-session or six-week package with a result', 'Decide the lowest price you will accept and never go beneath it'],
    plan: [
      { day: 'Day 1', title: 'Audit your income', task: 'List what you earned last quarter, from whom, and how many hours it took. Find your real hourly rate.' },
      { day: 'Day 2', title: 'Value the result', task: 'Pick your best client outcome and write what it was worth to them. This is your pricing anchor.' },
      { day: 'Day 3', title: 'Build a package', task: 'Replace single sessions with one package: a defined result, a defined length and a single price.' },
      { day: 'Day 4', title: 'Set three tiers', task: 'Create a good, better and best option so a premium choice is always visible.' },
      { day: 'Day 5', title: 'Write the price line', task: 'Write one calm sentence that states the price and the result, with no apology and no justification.' },
      { day: 'Day 6', title: 'Define your floor', task: 'Decide your minimum price and your policy on discounts. Write it down.' },
      { day: 'Day 7', title: 'Launch the new price', task: 'Quote the new package to the next three people who ask. Record what happens.' },
    ],
    audit: ['Calculates what your current prices are really costing you each month', 'Designs a package and price that matches the result you deliver', 'Scripts the exact words for quoting it with confidence'],
  },
  visibility: {
    id: 'visibility', code: 'HE', name: 'Visibility', archetype: 'The Hidden Expert', color: '#7EE0C3',
    tagline: 'Too few of the right people know you exist, so great work stays invisible.',
    whatItIs: [
      'Visibility is simply the number of right-fit people who know what you do and trust you enough to talk. It does not require a huge following, and it does not require daily posting.',
      'For many experts it feels uncomfortable because being seen means being judged. The fix is a simple, repeatable routine that fits who you are, not a performance.',
    ],
    signs: ['Most clients come from the same small circle', 'You post inconsistently and then take long breaks', 'You avoid reaching out to people you could help', 'You assume visibility means going viral', 'You have strong results that almost nobody has heard about'],
    why: 'Buyers only choose from the options they can see. A brilliant offer that nobody encounters earns exactly the same as no offer at all.',
    costs: 'Every week without conversations is a week of potential clients choosing someone else who simply showed up.',
    shifts: ['Start with your existing network, warm conversations beat cold content', 'Share one useful idea in your own voice, repeated, not a polished performance', 'Aim for conversations, not followers'],
    wins: ['List 20 people who could benefit from your help or know someone who could', 'Message three of them with a genuine, no-pressure question about their situation', 'Share one short story of a client result in your own words'],
    plan: [
      { day: 'Day 1', title: 'Map your circle', task: 'List 50 people you know: past clients, colleagues, friends of friends. Mark the 20 warmest.' },
      { day: 'Day 2', title: 'Pick your message', task: 'Write one sentence about the problem you solve, in the words your clients use.' },
      { day: 'Day 3', title: 'Reach out', task: 'Message five people with a short, human note: how are they, and are they dealing with this problem?' },
      { day: 'Day 4', title: 'Share a story', task: 'Post one short client story: the situation, what you did, what changed. Remove names if needed.' },
      { day: 'Day 5', title: 'Follow up', task: 'Reply to every response and offer a short call to the ones who seem interested.' },
      { day: 'Day 6', title: 'Show your face', task: 'Record one two-minute video sharing one useful idea. Post it without editing it twice.' },
      { day: 'Day 7', title: 'Set your rhythm', task: 'Decide a minimum you can sustain: for example, three messages a day and one post a week.' },
    ],
    audit: ['Finds the fastest warm route to your next clients, without ads', 'Builds a simple weekly visibility routine you can actually keep', 'Writes the messages that start conversations naturally'],
  },
  selling: {
    id: 'selling', code: 'RC', name: 'Selling', archetype: 'The Reluctant Closer', color: '#FF9D7E',
    tagline: 'People like you, but conversations end without a clear invitation to buy.',
    whatItIs: [
      'Selling is helping someone decide whether your solution fits their problem. When it feels pushy, it is usually because it was never taught as service, so you avoid it or leave it vague.',
      'Without a clear invitation, even interested people drift away. A good conversation ends with a decision, a yes or a no, not silence.',
    ],
    signs: ['Prospects say "let me think about it" and disappear', 'You send details and wait to be contacted', 'You avoid the moment where you ask for a decision', 'You worry about sounding salesy', 'You lose people who clearly needed your help'],
    why: 'A decision requires a clear next step. When you do not offer one, the other person has to guess, and most people do not guess, they stall.',
    costs: 'Interest, referrals and effort turn into silence, which is one of the most expensive leaks because you already did the hard work of getting the conversation.',
    shifts: ['Treat every call as a diagnosis: understand, then recommend', 'Always end with a clear invitation and a specific next step', 'Follow up with a date and a question, not with "just checking in"'],
    wins: ['Write a three-question conversation: where are you, where do you want to be, what is stopping you', 'Prepare the sentence that invites a decision at the end of every call', 'Follow up with every person who said "let me think" this week'],
    plan: [
      { day: 'Day 1', title: 'Reframe selling', task: 'Write what selling means to you when it is service: helping someone decide. Keep that sentence visible.' },
      { day: 'Day 2', title: 'Build the question flow', task: 'Write three to five questions that help you understand their situation, goal and obstacle.' },
      { day: 'Day 3', title: 'Prepare the recommendation', task: 'Write how you will explain your offer in 60 seconds in terms of their answers.' },
      { day: 'Day 4', title: 'Script the invitation', task: 'Write a calm closing line: "Would you like to start?" followed by a clear next step.' },
      { day: 'Day 5', title: 'Rehearse', task: 'Run the whole conversation aloud with a friend, including the price and the ask.' },
      { day: 'Day 6', title: 'Revisit open conversations', task: 'Follow up with everyone who went quiet. Offer a decision and a date.' },
      { day: 'Day 7', title: 'Run it live', task: 'Have two real conversations using the flow. Note what worked and refine one thing.' },
    ],
    audit: ['Reviews exactly where your conversations stall', 'Gives you a simple, honest sales flow built for service', 'Scripts the closing invitation and the follow-up'],
  },
  system: {
    id: 'system', code: 'SS', name: 'Consistency', archetype: 'The Scattered Starter', color: '#B79CFF',
    tagline: 'You start strong, then momentum fades, so progress never stacks.',
    whatItIs: [
      'Consistency is the ability to keep a small set of income-producing actions running week after week. Without it, results arrive in bursts and disappear again.',
      'The cause is rarely discipline. It is usually too many things at once, no clear order and no way of seeing progress, which makes it easy to stop.',
    ],
    signs: ['You begin new projects before finishing the last', 'Tech and tools consume the time meant for clients', 'Some months are strong, then everything stalls', 'You have lots of half-built assets', 'You are not sure which actions are actually working'],
    why: 'Momentum comes from a few repeated actions, not from the next big idea. Without a simple routine and a way to track it, effort leaks into everything and builds into nothing.',
    costs: 'Income swings from month to month and good work does not compound, which makes the whole business feel harder than it needs to be.',
    shifts: ['Choose three weekly actions that create conversations and protect them', 'Finish one thing before starting another', 'Review the week on paper so you can see what is moving'],
    wins: ['Choose your three income-producing actions and block time for them this week', 'List everything unfinished and choose the one item to complete first', 'Set a 20-minute weekly review: what moved, what stalled, what is next'],
    plan: [
      { day: 'Day 1', title: 'Clear the table', task: 'List every unfinished project. Pick one to finish, park the rest in a "later" list.' },
      { day: 'Day 2', title: 'Choose three actions', task: 'Pick three weekly actions that directly create paying conversations. Ignore everything else for now.' },
      { day: 'Day 3', title: 'Protect the time', task: 'Block calendar slots for those three actions. Treat them like client appointments.' },
      { day: 'Day 4', title: 'Simplify your tools', task: 'Reduce to the minimum: one place for notes, one for clients, one for scheduling.' },
      { day: 'Day 5', title: 'Make it visible', task: 'Create a simple weekly tracker for your three actions. Mark each one when done.' },
      { day: 'Day 6', title: 'Do it imperfectly', task: 'Complete your actions even if they are not polished. Done beats perfect.' },
      { day: 'Day 7', title: 'Review and repeat', task: 'Hold a 20-minute review: what worked, what did not, what continues next week.' },
    ],
    audit: ['Cuts your plan down to the few actions that actually pay', 'Sets a weekly rhythm you can keep around your life', 'Shows what to stop doing so progress finally stacks'],
  },
}

/* Pair engine: primary effect + secondary compounding = 30 distinct profiles. */
const LEAD: Record<BlockerId, string> = {
  clarity: 'Right now the biggest drag is that your offer is hard to say in one sentence, so people cannot tell what to buy.',
  worth: 'Right now the biggest drag is an inner voice that questions your right to be paid well.',
  pricing: 'Right now the biggest drag is that your prices sit well below the value you create.',
  visibility: 'Right now the biggest drag is that too few of the right people know you exist.',
  selling: 'Right now the biggest drag is that conversations end without a clear invitation to buy.',
  system: 'Right now the biggest drag is that you start strong and then lose momentum.',
}
const COMPOUND: Record<BlockerId, string> = {
  clarity: 'It is compounded by an offer that is still fuzzy, which makes every other step harder.',
  worth: 'It is compounded by self-doubt, which makes you soften or hide the very things that would help.',
  pricing: 'It is compounded by low prices, so even good months do not move your income.',
  visibility: 'It is compounded by low visibility, so there are few conversations to learn from.',
  selling: 'It is compounded by uncomfortable sales conversations, so interest rarely turns into clients.',
  system: 'It is compounded by inconsistent follow-through, so progress never stacks.',
}
export function pairLine(p: BlockerId, s: BlockerId): string {
  return `${LEAD[p]} ${COMPOUND[s]}`
}

/* 24 stage x blocker "next move" paragraphs. */
export type Stage = 'idea' | 'starting' | 'launched' | 'scaling'
export const STAGE_MOVES: Record<BlockerId, Record<Stage, string>> = {
  clarity: {
    idea: 'Before you build anything, validate one offer with five conversations. Your best next move is a clear sentence tested on real people.',
    starting: 'You have started, so now narrow. Choose one audience and one result and run every conversation through that lens for 30 days.',
    launched: 'You have clients, so mine them. Find what your best three clients share and rebuild the offer around that pattern.',
    scaling: 'You have traction, so sharpen. Turn your strongest results into a signature offer that is easy to explain and easy to refer.',
  },
  worth: {
    idea: 'Start by collecting proof from your past work, even outside business. It is the evidence your inner voice cannot argue with.',
    starting: 'Make your first paid offer small but not cheap, and practise saying the price aloud before every conversation.',
    launched: 'Raise your price for the next client and notice that the world does not end. Evidence is the fastest way to change the story.',
    scaling: 'Your results already speak. Replace discounting with a clear premium tier and let the beliefs catch up with the facts.',
  },
  pricing: {
    idea: 'Decide your price before you launch, from the value of the result. It is much easier to start high than to raise it later.',
    starting: 'Turn single sessions into one package with a clear result and one price, and use it for your first five clients.',
    launched: 'Raise prices on every new client now. Keep existing clients where they are and let new business set the standard.',
    scaling: 'Introduce a premium tier above your current best offer. The highest option often makes the middle one feel easy.',
  },
  visibility: {
    idea: 'Skip content for now. Make a list of 50 people and start 10 genuine conversations, since conversations create the first clients.',
    starting: 'Build a small weekly routine of outreach and one story post. Consistency beats volume at this stage.',
    launched: 'Ask every happy client for one introduction and share one result story a week. Your best marketing is already working.',
    scaling: 'Systemise what works: a referral rhythm, a regular piece of content and a partnership or two that bring qualified people to you.',
  },
  selling: {
    idea: 'Practise the conversation before you need it. Rehearse a simple question flow and ask for feedback from friendly people.',
    starting: 'Have as many real conversations as you can, and end each one with a clear next step so you learn what works.',
    launched: 'Review the last ten conversations that stalled. Add a closing invitation and a dated follow-up to every one.',
    scaling: 'Document your best calls into a repeatable flow so that anyone on your team could run it, and so you stop relying on charm.',
  },
  system: {
    idea: 'Pick one small routine and keep it for 14 days. The habit matters more than the choice of tool or tactic.',
    starting: 'Choose three weekly actions that create conversations and protect them in your calendar like client sessions.',
    launched: 'Cut your plan to the three things that brought clients last quarter and stop doing the rest for the next 30 days.',
    scaling: 'Move the repeatable parts into simple automations and checklists so growth no longer depends on your daily energy.',
  },
}

/* 8 niche lines. */
export type Niche = 'wellness' | 'mindset' | 'career' | 'business' | 'relationships' | 'money' | 'spiritual' | 'creative'
export const NICHE_LINES: Record<Niche, { who: string; line: string }> = {
  wellness: { who: 'health and wellness experts', line: 'Clients in wellness buy a changed day-to-day experience: more energy, less pain, a body they trust. Your offer should name the change they will feel.' },
  mindset: { who: 'mindset and life coaches', line: 'Clients buy a different life, not sessions. Your offer should be a journey with a clear start, a finish line and visible proof along the way.' },
  career: { who: 'career and leadership coaches', line: 'Professionals buy speed and certainty. Your offer should promise a specific career or leadership outcome in a defined time.' },
  business: { who: 'business consultants', line: 'Business buyers buy measurable outcomes. Your offer should be tied to a number: revenue, time saved or problems removed.' },
  relationships: { who: 'relationship and family coaches', line: 'Clients buy peace and connection. Your offer should describe the relationship they want and the first visible sign it is changing.' },
  money: { who: 'money and wealth coaches', line: 'Clients buy security and freedom. Trust is the product, so show the method clearly and the steps they will take.' },
  spiritual: { who: 'spiritual and energy practitioners', line: 'Clients buy clarity, release and meaning. A clear structure and a defined journey make deep work easy to say yes to.' },
  creative: { who: 'creative experts', line: 'Clients buy a skill they can use or a result they can show. Package your craft into a clear transformation with a visible finished piece.' },
}

/* 5 income-position lines. */
export type IncomeKey = 'none' | 'u1k' | '1-3k' | '3-10k' | '10k+'
export const INCOME_LINES: Record<IncomeKey, string> = {
  none: 'You are at the very start of the income curve, where one clear offer and a few conversations change everything.',
  u1k: 'You have proved that someone will pay. The next job is to increase the value of each client, not only the number of them.',
  '1-3k': 'This range is where undercharging and inconsistency usually hide, so small changes here move the number fast.',
  '3-10k': 'You have a real business. Predictability and price are now worth more than more clients.',
  '10k+': 'You already earn well, so your opportunity is leverage: more income with the same effort.',
}

export const GOAL_LABEL: Record<string, string> = { '1-3k': '$2,000', '3-5k': '$4,000', '5-10k': '$7,500', '10k+': '$12,000' }

/* Strengths: shown for the two calmest blockers. */
export const STRENGTH_LINES: Record<BlockerId, string> = {
  clarity: 'You know who you help and what changes for them. That clarity is rare, and it makes every other step easier.',
  worth: 'You back your own value. That inner steadiness makes pricing and selling far easier than it is for most experts.',
  pricing: 'You price with confidence, so more of your effort turns into income.',
  visibility: 'People already know what you do. Your work reaches the right audience.',
  selling: 'You close conversations with a clear invitation, which is the skill most experts struggle with.',
  system: 'You follow through. Consistency is already one of your strengths, and it compounds.',
}

/* Mindset map: four dimensions, 0-100, higher = healthier. */
export const DIM_COPY: Record<DimId, { name: string; what: string; strong: string; developing: string; attention: string }> = {
  deserve: {
    name: 'Money worth', what: 'How deserving you feel of being paid well for helping people.',
    strong: 'You feel entitled to be paid well for the change you create, which makes premium pricing natural.',
    developing: 'You mostly believe you deserve to be paid, but guilt appears at times. Proof and practice will settle it.',
    attention: 'Guilt or doubt about earning from your help is shaping what you ask for. This is the most valuable place to work.',
  },
  comfort: {
    name: 'Money comfort', what: 'How at ease you are with numbers and price conversations.',
    strong: 'You can look at your numbers and talk price calmly, which keeps your business honest and your sales clear.',
    developing: 'You manage money conversations, though they cost you some energy. Scripts and routines will make them easy.',
    attention: 'You tend to avoid numbers and price talk, which hides leaks and makes sales conversations harder than they need to be.',
  },
  risk: {
    name: 'Risk and scarcity', what: 'How safe you feel making a bold offer or setting a higher price.',
    strong: 'You can make bold offers and hold higher prices without panic, which is a real advantage.',
    developing: 'You will take some risk, but scarcity thoughts creep in. Small tested steps will build your tolerance.',
    attention: 'Safety-seeking and scarcity worry are keeping your offer and price smaller than your results justify.',
  },
  compare: {
    name: 'Comparison and proof', what: 'How much you measure your worth against others, or against a missing qualification.',
    strong: 'You measure yourself by your own results rather than by other people, which protects your confidence.',
    developing: 'Comparison affects you on some days. Collecting your own proof will quieten it.',
    attention: 'Comparing yourself with others, or waiting for one more qualification, is delaying your launch and your pricing.',
  },
}

/* Blind spots: contradictions in the answers. At most three are shown. */
export interface BlindCtx {
  answers: Answers
  dims: Record<DimId, number>
  intensities: Record<BlockerId, number>
  tried: string[]
  goalKey: string
  incomeKey: string
  urgency: number
  hours: string
  invest: string
}
const a1 = (v: string | string[] | undefined): string => (Array.isArray(v) ? v[0] || '' : v || '')
export const BLIND_SPOTS: { id: string; line: string; when: (c: BlindCtx) => boolean }[] = [
  { id: 'goal-vs-price', line: 'You aim high but feel shaky stating a price. The goal will stay out of reach until your price feels steady.', when: (c) => (c.goalKey === '10k+' || c.goalKey === '5-10k') && Number(a1(c.answers.price)) <= 2 },
  { id: 'calm-vs-comfort', line: 'You can state a price calmly, yet you do not feel comfortable receiving premium money. That can show up later as discounting or avoiding follow-up.', when: (c) => a1(c.answers.ask) === 'calm' && Number(a1(c.answers.comfort)) <= 2 },
  { id: 'learning-hides', line: 'You may be using learning to avoid choosing. More courses will not add clarity. A small test with real people will.', when: (c) => a1(c.answers.wall) === 'what' && (a1(c.answers.voices).includes('course') || (c.answers.voices as string[] | undefined)?.includes('course') === true) },
  { id: 'fast-little-time', line: 'You want change fast but have little time. Your plan has to be tiny and daily, not big and weekly.', when: (c) => c.urgency >= 4 && c.hours === 'lt5' },
  { id: 'tactics-not-system', line: 'You have tried many tactics but not one system. The next step is fewer things, done in the right order.', when: (c) => c.tried.length >= 3 && c.intensities.system >= 55 },
  { id: 'earn-but-guilty', line: 'You already earn well, yet part of you does not feel entitled to it. That can cap growth even when your results are strong.', when: (c) => (c.incomeKey === '3-10k' || c.incomeKey === '10k+') && c.dims.deserve <= 45 },
  { id: 'compare-visibility', line: 'Comparing yourself with others online is probably why visibility feels unsafe, rather than a lack of things to say.', when: (c) => c.dims.compare <= 45 && c.intensities.visibility >= 55 },
  { id: 'big-goal-tight', line: 'You want a big result while feeling budget pressure. Start with the smallest paid step, not the biggest program.', when: (c) => c.invest === 'tight' && (c.goalKey === '10k+' || c.goalKey === '5-10k') },
  { id: 'dont-look', line: 'You avoid looking at your numbers, which makes it hard to see where income leaks. A simple weekly look will change what you notice.', when: (c) => c.dims.comfort <= 40 && c.incomeKey !== 'none' },
]
