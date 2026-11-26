/* The Income Blocker Quiz: question bank.

   Pure data, no AI. Every option adds weighted points to one or more of the six
   income blockers; lib/quiz/engine.ts turns those into a deterministic result,
   so a report is instant and always identical for the same answers.

   Six legacy answer keys are written alongside the new ones so the admin
   qualification score (lib/qualification) keeps working unchanged:
     q1 stage · q18 revenue goal · q20 urgency · q19 weekly hours · q10 price
     confidence · qmp1 comfort charging premium. */

export type BlockerId = 'clarity' | 'worth' | 'pricing' | 'visibility' | 'selling' | 'system'
export const BLOCKER_IDS: BlockerId[] = ['clarity', 'worth', 'pricing', 'visibility', 'selling', 'system']

type W = Partial<Record<BlockerId, number>>

export interface Opt {
  v: string
  label: string
  sub?: string
  icon: string
  w?: W
  /** One warm line shown right after the answer. */
  reflect?: string
}

export type DimId = 'deserve' | 'comfort' | 'risk' | 'compare'
export const DIM_IDS: DimId[] = ['deserve', 'comfort', 'risk', 'compare']
/** A Likert statement (agree 1-5). `rev` = agreeing is the unhealthy direction. */
export interface Item { id: string; text: string; dim: DimId; rev: boolean }

export type PartId = 'business' | 'mindset' | 'patterns' | 'readiness'
export const PARTS: Record<PartId, { n: number; name: string }> = {
  business: { n: 1, name: 'Your business' },
  mindset: { n: 2, name: 'Your money mindset' },
  patterns: { n: 3, name: 'Your inner patterns' },
  readiness: { n: 4, name: 'Your readiness' },
}

interface Base { id: string; title: string; sub: string; icon: string; part: PartId }
export type Q =
  | (Base & { type: 'single'; options: Opt[] })
  | (Base & { type: 'multi'; max: number; options: Opt[] })
  | (Base & { type: 'scale'; lowLabel: string; highLabel: string; reflect: Record<number, string> })
  | (Base & { type: 'matrix'; items: Item[] })

const POOL: Q[] = [
  {
    id: 'stage', part: 'business', type: 'single', icon: 'compass',
    title: 'Where is your expertise business right now?',
    sub: 'Honest answers give you the most useful report.',
    options: [
      { v: 'idea', label: 'It is still an idea', sub: 'I know what I could offer, but have not launched', icon: 'seed', w: { clarity: 3, visibility: 1 }, reflect: 'Good place to start. Clarity now saves months later.' },
      { v: 'starting', label: 'Just starting out', sub: 'A few conversations, little or no income yet', icon: 'spark', w: { clarity: 2, visibility: 2 }, reflect: 'The first clients are the hardest. A clear path makes them easier.' },
      { v: 'launched', label: 'Launched, with some clients', sub: 'Money comes in, but it is not consistent', icon: 'rocket', w: { selling: 1, system: 1 }, reflect: 'You have proof it works. Now it needs to repeat.' },
      { v: 'scaling', label: 'Established and ready to grow', sub: 'Steady clients, I want the next level', icon: 'chart', w: { system: 2 }, reflect: 'Growth from here is about systems, not more effort.' },
    ],
  },
  {
    id: 'niche', part: 'business', type: 'single', icon: 'people',
    title: 'Who do you help?',
    sub: 'So your report speaks your language.',
    options: [
      { v: 'wellness', label: 'Health and wellness', sub: 'Body, energy, healing, nutrition', icon: 'leaf', reflect: 'Work that changes how people feel every day.' },
      { v: 'mindset', label: 'Mindset and life coaching', sub: 'Confidence, purpose, transitions', icon: 'bulb', reflect: 'People pay for a changed life, not for sessions.' },
      { v: 'career', label: 'Career and leadership', sub: 'Executives, career change, burnout', icon: 'briefcase', reflect: 'Professionals value speed and certainty.' },
      { v: 'business', label: 'Business and consulting', sub: 'Growth, strategy, operations', icon: 'chart', reflect: 'Business buyers pay for outcomes they can measure.' },
      { v: 'relationships', label: 'Relationships and family', sub: 'Dating, marriage, parenting', icon: 'heart', reflect: 'You work with what matters most to people.' },
      { v: 'money', label: 'Money and wealth', sub: 'Debt, investing, financial freedom', icon: 'coin', reflect: 'Trust is the product here, and you already carry it.' },
      { v: 'spiritual', label: 'Spiritual and energy work', sub: 'Healing, intuition, consciousness', icon: 'moon', reflect: 'Deep work deserves a clear, confident offer.' },
      { v: 'creative', label: 'Creative or something else', sub: 'Art, writing, craft, other expertise', icon: 'pen', reflect: 'Every kind of expertise can be packaged.' },
    ],
  },
  {
    id: 'income', part: 'business', type: 'single', icon: 'coin',
    title: 'What does your expertise bring in each month today?',
    sub: 'Rough is fine. This is private.',
    options: [
      { v: 'none', label: 'Nothing yet', icon: 'zero', w: { visibility: 1, clarity: 1 }, reflect: 'Everyone starts at zero. The question is how fast you leave it.' },
      { v: 'u1k', label: 'Under $1,000', icon: 'seed', w: { pricing: 1, selling: 1 }, reflect: 'You have started. Now the work is to raise the value of each client.' },
      { v: '1-3k', label: '$1,000 to $3,000', icon: 'spark', w: { pricing: 1 }, reflect: 'This is where undercharging usually hides.' },
      { v: '3-10k', label: '$3,000 to $10,000', icon: 'rocket', w: { system: 1 }, reflect: 'Real traction. Consistency is the next lever.' },
      { v: '10k+', label: '$10,000 or more', icon: 'chart', w: { system: 1 }, reflect: 'Strong base. The question is how to scale it without burning out.' },
    ],
  },
  {
    id: 'goal', part: 'business', type: 'single', icon: 'target',
    title: 'What monthly income would feel like a breakthrough?',
    sub: 'Pick the number that excites you, not the safe one.',
    options: [
      { v: '1-3k', label: '$1,000 to $3,000', sub: 'Meaningful extra income', icon: 'seed', reflect: 'A solid first milestone.' },
      { v: '3-5k', label: '$3,000 to $5,000', sub: 'A reliable second income', icon: 'spark', reflect: 'Achievable with the right offer and a few clients.' },
      { v: '5-10k', label: '$5,000 to $10,000', sub: 'A serious, full-time business', icon: 'rocket', reflect: 'This is where a clear premium offer matters most.' },
      { v: '10k+', label: '$10,000 or more', sub: 'A premium expertise business', icon: 'crown', reflect: 'Ambitious. It needs the right offer, price and system.' },
    ],
  },
  {
    id: 'wall', part: 'patterns', type: 'single', icon: 'wall',
    title: 'What feels like the biggest wall?',
    sub: 'Choose the one that stings the most.',
    options: [
      { v: 'what', label: 'I am not sure what to sell, or to whom', icon: 'fog', w: { clarity: 4 }, reflect: 'Very common, and very fixable. Clarity comes from your results, not more research.' },
      { v: 'seen', label: 'I know my offer, but nobody sees it', icon: 'eye', w: { visibility: 4 }, reflect: 'The right people cannot buy what they cannot find.' },
      { v: 'buy', label: 'People like me, but they do not buy', icon: 'door', w: { selling: 4, pricing: 1 }, reflect: 'Interest without a clear invitation rarely turns into a yes.' },
      { v: 'under', label: 'I charge less than I know I am worth', icon: 'scale', w: { pricing: 4, worth: 1 }, reflect: 'Underpricing is usually a belief problem wearing a business costume.' },
      { v: 'should', label: 'Something in me says I should not charge much', icon: 'voice', w: { worth: 4, pricing: 1 }, reflect: 'That voice is learned, so it can be unlearned.' },
      { v: 'fizzle', label: 'I start strong, then lose steam or get overwhelmed', icon: 'wave', w: { system: 4 }, reflect: 'Momentum is a system, not a personality trait.' },
    ],
  },
  {
    id: 'price', part: 'patterns', type: 'scale', icon: 'scale',
    title: 'When you say your price out loud, how steady do you feel?',
    sub: 'Think of the last time someone asked what you charge.',
    lowLabel: 'My voice shrinks', highLabel: 'Calm and clear',
    reflect: { 1: 'That shrinking feeling is the single biggest income lever to work on.', 2: 'You are not alone. This is the most common pattern in our reports.', 3: 'Steady on some days, shaky on others. That is fixable.', 4: 'Good. A little more certainty will pay off quickly.', 5: 'Strong. Keep that calm and build the offer around it.' },
  },
  {
    id: 'comfort', part: 'patterns', type: 'scale', icon: 'crown',
    title: 'How comfortable are you charging premium prices for helping people?',
    sub: 'Premium means a price that reflects the change you create.',
    lowLabel: 'It feels wrong', highLabel: 'Completely fine',
    reflect: { 1: 'Many healers and coaches feel this. It is a money story, not a fact.', 2: 'There is a block here, and naming it is the first step.', 3: 'Mixed feelings are normal. Clear value helps the feeling settle.', 4: 'You are close. A few shifts will lock it in.', 5: 'Excellent. You can focus on the offer and the system.' },
  },
  {
    id: 'voices', part: 'patterns', type: 'multi', max: 3, icon: 'voice',
    title: 'Which of these voices do you hear most?',
    sub: 'Pick up to three. They tell us what is really in the way.',
    options: [
      { v: 'who', label: 'Who am I to charge that much?', icon: 'voice', w: { worth: 3 } },
      { v: 'free', label: 'People expect my help for free', icon: 'gift', w: { pricing: 2, worth: 1 } },
      { v: 'pushy', label: 'Selling feels pushy', icon: 'hand', w: { selling: 3 } },
      { v: 'course', label: 'I need one more course before I am ready', icon: 'book', w: { worth: 2, clarity: 1 } },
      { v: 'compare', label: 'Everyone online is further ahead than me', icon: 'ladder', w: { worth: 2, visibility: 1 } },
      { v: 'late', label: 'Maybe it is too late for me to start', icon: 'clock', w: { worth: 2, visibility: 1 } },
      { v: 'seen', label: 'I do not want to be seen online', icon: 'eye', w: { visibility: 3 } },
      { v: 'tech', label: 'Tech and funnels overwhelm me', icon: 'gear', w: { system: 3 } },
      { v: 'niche', label: 'I cannot pick one niche', icon: 'fog', w: { clarity: 3 } },
    ],
  },
  {
    id: 'sources', part: 'business', type: 'multi', max: 3, icon: 'net',
    title: 'Where do your clients come from today?',
    sub: 'Pick all that apply, up to three.',
    options: [
      { v: 'nobody', label: 'Honestly, nowhere yet', icon: 'zero', w: { visibility: 3 } },
      { v: 'referrals', label: 'Referrals and word of mouth', icon: 'people', w: { visibility: 1 } },
      { v: 'social', label: 'Social media posts', icon: 'phone', w: { visibility: 1, selling: 1 } },
      { v: 'network', label: 'Direct conversations with my network', icon: 'chat', w: {} },
      { v: 'events', label: 'Events, talks or podcasts', icon: 'mic', w: { system: 1 } },
      { v: 'ads', label: 'Paid ads', icon: 'bolt', w: { system: 1, pricing: 1 } },
    ],
  },
  {
    id: 'ask', part: 'patterns', type: 'single', icon: 'chat',
    title: 'Someone asks, "How much do you charge?" What usually happens?',
    sub: 'Be honest. This one tells us a lot.',
    options: [
      { v: 'freeze', label: 'I freeze or ramble, then offer a discount', icon: 'wave', w: { pricing: 3, worth: 2 }, reflect: 'Very human, and a clear sign of where to start.' },
      { v: 'justify', label: 'I quote it, then explain why it is worth it', icon: 'scale', w: { pricing: 2, selling: 1 }, reflect: 'Justifying a price tells the buyer you doubt it.' },
      { v: 'hope', label: 'I send details and hope they reply', icon: 'mail', w: { selling: 3 }, reflect: 'Hope is not a follow-up system.' },
      { v: 'calm', label: 'I state it calmly and ask for a decision', icon: 'check', reflect: 'That is a real strength to build on.' },
      { v: 'never', label: 'I have not had that conversation yet', icon: 'door', w: { selling: 1, visibility: 2 }, reflect: 'Then the first goal is simply more conversations.' },
    ],
  },
  {
    id: 'hours', part: 'business', type: 'single', icon: 'clock',
    title: 'How much time can you give this each week?',
    sub: 'Realistic, not ideal.',
    options: [
      { v: 'lt5', label: 'Under 5 hours', icon: 'clock', w: { system: 2 }, reflect: 'Small, focused blocks win. The plan will fit that.' },
      { v: '5-10', label: '5 to 10 hours', icon: 'clock', w: { system: 1 }, reflect: 'Enough to build real momentum.' },
      { v: '10-20', label: '10 to 20 hours', icon: 'clock', reflect: 'You can move fast with that.' },
      { v: '20+', label: '20 hours or more', icon: 'clock', reflect: 'Full focus. Direction matters more than effort now.' },
    ],
  },
  {
    id: 'urgency', part: 'readiness', type: 'scale', icon: 'bolt',
    title: 'How soon do you want this to change?',
    sub: 'There is no wrong answer.',
    lowLabel: 'Someday', highLabel: 'Right now',
    reflect: { 1: 'No rush. Your report will still give you a clear picture.', 2: 'Steady pace. We will keep the plan gentle.', 3: 'Soon. Momentum matters, and your plan reflects it.', 4: 'You are ready to move. Your plan is built for that.', 5: 'Ready now. The first step will take you under an hour.' },
  },
  {
    id: 'mind1', part: 'mindset', type: 'matrix', icon: 'heart',
    title: 'How true are these for you?',
    sub: 'Go with your first reaction. There are no right answers.',
    items: [
      { id: 'd1', dim: 'deserve', rev: false, text: 'I believe I deserve to be paid well for helping people.' },
      { id: 'd2', dim: 'deserve', rev: true, text: 'I feel guilty when I earn good money from my help.' },
      { id: 'c1', dim: 'comfort', rev: true, text: 'I avoid looking at my numbers or talking about money.' },
      { id: 'c2', dim: 'comfort', rev: false, text: 'I can talk about price with a client without feeling awkward.' },
    ],
  },
  {
    id: 'mind2', part: 'mindset', type: 'matrix', icon: 'scale',
    title: 'And these?',
    sub: 'Same rule: first reaction, no right answers.',
    items: [
      { id: 'r1', dim: 'risk', rev: true, text: 'I would rather stay safe than risk a bolder offer or a higher price.' },
      { id: 'r2', dim: 'risk', rev: true, text: 'Even when things go well, I worry there will not be enough.' },
      { id: 'p1', dim: 'compare', rev: true, text: 'I judge my own worth by how I compare to others online.' },
      { id: 'p2', dim: 'compare', rev: true, text: 'I feel I need one more qualification before I can charge fully.' },
    ],
  },
  {
    id: 'decide', part: 'patterns', type: 'single', icon: 'compass',
    title: 'When you have a new idea, what do you usually do?',
    sub: 'This shows how you move, which shapes your plan.',
    options: [
      { v: 'fast', label: 'Jump in fast, then lose interest', icon: 'bolt', w: { system: 3 }, reflect: 'Energy is a gift. It just needs a container.' },
      { v: 'research', label: 'Research until it feels perfect', icon: 'book', w: { clarity: 2, worth: 1, system: 1 }, reflect: 'Preparation can quietly become hiding.' },
      { v: 'ask', label: 'Ask everyone for their opinion first', icon: 'people', w: { worth: 2, clarity: 1 }, reflect: 'Other people\'s opinions can drown out your own.' },
      { v: 'wait', label: 'Wait for the right moment', icon: 'clock', w: { system: 2, visibility: 1 }, reflect: 'The right moment is usually the one you make.' },
      { v: 'test', label: 'Test it small and learn', icon: 'target', reflect: 'That is the strongest way to move. Keep it.' },
    ],
  },
  {
    id: 'tried', part: 'readiness', type: 'multi', max: 4, icon: 'map',
    title: 'What have you already tried to grow your income?',
    sub: 'Pick all that apply, up to four.',
    options: [
      { v: 'courses', label: 'Online courses or programs', icon: 'book', w: { system: 1, clarity: 1 } },
      { v: 'coach', label: 'A coach or mentor', icon: 'people', w: { selling: 1 } },
      { v: 'ads', label: 'Paid ads', icon: 'bolt', w: { visibility: 1, system: 1 } },
      { v: 'content', label: 'Posting content regularly', icon: 'phone', w: { visibility: 1 } },
      { v: 'mastermind', label: 'A mastermind or community', icon: 'net' },
      { v: 'nothing', label: 'Nothing yet', icon: 'zero', w: { clarity: 1, visibility: 1 } },
    ],
  },
  {
    id: 'support', part: 'readiness', type: 'single', icon: 'hand',
    title: 'How do you prefer to get help?',
    sub: 'So your next step fits how you actually learn.',
    options: [
      { v: 'self', label: 'On my own, at my own pace', sub: 'Guides, courses and tools', icon: 'book', reflect: 'Good. Your plan is built to be done independently.' },
      { v: 'group', label: 'With a group and some structure', sub: 'Community and shared momentum', icon: 'people', reflect: 'Accountability helps you most.' },
      { v: 'one', label: 'One to one with an expert', sub: 'Personal guidance on my situation', icon: 'chat', reflect: 'Personal attention is what unlocks you.' },
      { v: 'done', label: 'Done with me, or done for me', sub: 'I want the heavy lifting handled', icon: 'gear', reflect: 'Handing off the build lets you focus on clients.' },
    ],
  },
  {
    id: 'invest', part: 'readiness', type: 'single', icon: 'coin',
    title: 'If you found exactly the right help, how would you feel about investing in it?',
    sub: 'Honest is helpful. There is no wrong answer.',
    options: [
      { v: 'now', label: 'I would invest this week', icon: 'rocket', reflect: 'You are ready to move.' },
      { v: 'month', label: 'Within the next month', icon: 'clock', reflect: 'A clear plan will help you decide with confidence.' },
      { v: 'sure', label: 'I need to be very sure first', icon: 'shield', reflect: 'Fair. Evidence and clarity come before commitment.' },
      { v: 'tight', label: 'Budget is tight right now', icon: 'coin', reflect: 'Then your plan starts with the smallest, lowest-cost steps.' },
    ],
  },
]

/* Final order: four parts, 18 screens. */
const ORDER = ['stage','niche','income','goal','hours','sources','mind1','mind2','wall','price','comfort','voices','ask','decide','tried','support','invest','urgency']
export const QUESTIONS: Q[] = ORDER.map((id) => POOL.find((q) => q.id === id)!)

/* Legacy keys consumed by lib/qualification (admin lead score). */
export const LEGACY: Record<string, string> = {
  stage: 'q1', goal: 'q18', urgency: 'q20', hours: 'q19', price: 'q10', comfort: 'qmp1',
}

export type Answers = Record<string, string | string[]>

/** Every stored answer key, in order (matrix screens contribute their item ids). */
export const ANSWER_KEYS: string[] = QUESTIONS.flatMap((q) => (q.type === 'matrix' ? q.items.map((i) => i.id) : [q.id]))
export const ITEMS: Item[] = QUESTIONS.flatMap((q) => (q.type === 'matrix' ? q.items : []))
