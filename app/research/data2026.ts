/* "New in 2026" evidence layer for each research article.
   Every number here is taken from a named, dated source listed in `sources`.
   Preprints and vendor-run surveys are flagged in `caveat`. Nothing is estimated
   or invented; where two versions of a source disagree the safer figure is used. */

export interface Stat { value: number; prefix?: string; suffix?: string; decimals?: number; label: string; src: string }
export interface Source { label: string; url: string; date: string; note?: string }
export interface BarItem { label: string; value: number; note?: string; highlight?: boolean }
export interface LineSeries { name: string; color: string; points: [number, number][] }

export type Chart =
  | { kind: 'bars'; title: string; subtitle: string; unit: string; max?: number; items: BarItem[]; src: string }
  | { kind: 'lines'; title: string; subtitle: string; unit: string; xLabels: number[]; series: LineSeries[]; src: string }

export interface Data2026 {
  headline: string
  asOf: string
  takeaways: string[]
  stats: Stat[]
  chart?: Chart
  whyItMatters: string
  nextSteps: string[]
  caveat: string
  sources: Source[]
  related: string[]
  projector?: boolean
}

export const DATA: Record<string, Data2026> = {
  'how-ai-is-changing-how-people-buy': {
    headline: 'The numbers behind this paper, in one place: people use AI to look, and still check before they pay.',
    asOf: 'Evidence as of November 2026',
    takeaways: [
      'Use is mainstream: 49% of US adults use AI chatbots, and under-50s use them far more than older adults.',
      'AI-referred shoppers behave differently: Adobe found they convert 31% more and spend 45% more time on retail sites (holiday 2025).',
      'Trust has not kept pace: in one 2026 US survey 48.5% researched with AI but only 35.4% trusted its recommendations completely or mostly.',
      'People are comfortable with AI suggesting, and want a human decision at the end: 56% in McKinsey\u2019s European survey.',
      'The psychology is old (choice overload, trust, regret). The speed and scale are new.',
    ],
    stats: [
      { value: 49, suffix: '%', label: 'of US adults use AI chatbots (33% in 2024)', src: 'Pew, Feb 2026 survey, n=5,119' },
      { value: 31, suffix: '%', label: 'higher conversion for AI-referred retail visits', src: 'Adobe Analytics, holiday 2025' },
      { value: 48.5, suffix: '%', decimals: 1, label: 'used AI to research a purchase in 12 months', src: 'Alchemer, 2026, n=1,002 US shoppers' },
      { value: 35.4, suffix: '%', decimals: 1, label: 'trust AI recommendations completely or mostly', src: 'Alchemer, 2026' },
    ],
    chart: {
      kind: 'bars', title: 'The trust gap in AI shopping', subtitle: 'US shoppers (%), Alchemer 2026 benchmark, n=1,002', unit: '%', max: 60,
      items: [
        { label: 'Used AI to research a purchase (past 12 months)', value: 48.5, highlight: true },
        { label: 'Trust AI recommendations completely or mostly', value: 35.4 },
        { label: 'Trust online reviews more than other sources', value: 36.1 },
        { label: 'Trust friends and family more than other sources', value: 31.2 },
        { label: 'Trust AI more than other sources', value: 15.4 },
      ],
      src: 'Alchemer 2026 Retail AI report (vendor survey)',
    },
    whyItMatters: 'The buyer is not handing over the decision. They are handing over the legwork. Whoever is easiest for the machine to explain and easiest for a person to verify wins.',
    nextSteps: [
      'Make your offer easy for an AI to describe accurately: plain claims, real numbers, clear proof.',
      'Design the human check: reviews, named people, a visible guarantee, a conversation.',
      'Do not manipulate the assistant or the buyer: the evidence says persuasive and accurate pull apart.',
    ],
    caveat: 'Most figures here come from vendor or industry surveys with different samples and definitions of trust, so they are not directly comparable. This paper reports no survey of its own.',
    sources: [
      { label: 'Pew Research Center, Americans and AI 2026', url: 'https://www.pewresearch.org/wp-content/uploads/sites/20/2026/06/PI_2026.06.17_Americans-and-AI_REPORT.pdf', date: 'Jun 2026' },
      { label: 'Adobe, holiday shopping season 2025', url: 'https://news.adobe.com/news/2026/01/adobe-holiday-shopping-season', date: 'Jan 2026', note: 'Vendor data' },
      { label: 'Alchemer, 2026 retail AI report', url: 'https://www.alchemer.com/resources/benchmark-report/2026-retail-report-ai/', date: '2026', note: 'Vendor survey' },
      { label: 'McKinsey, From prompt to purchase', url: 'https://www.mckinsey.com/featured-insights/charts/from-prompt-to-purchase', date: '2026' },
    ],
    related: ['how-persuasive-is-frontier-ai', 'how-people-buy-expertise', 'is-ai-eroding-critical-thinking'],
  },

  'how-persuasive-is-frontier-ai': {
    headline: 'Since this paper was drafted, the largest persuasion experiments yet were published. They point the same way.',
    asOf: 'Updated November 2026',
    takeaways: [
      'Talking to an AI moves political opinions measurably, in experiments with tens of thousands of people.',
      'The techniques that made models more persuasive also made them less accurate.',
      'A live conversation outperforms the same arguments read as static text.',
      'Persuasion on opinions does not automatically predict persuasion on behaviour; the two can come apart.',
    ],
    stats: [
      { value: 76977, label: 'participants across three Science experiments', src: 'Cornell Chronicle summary of Science, Dec 2025' },
      { value: 19, label: 'language models compared', src: 'Same study' },
      { value: 707, label: 'political issues tested', src: 'Same study' },
      { value: 25, suffix: ' pts', label: 'largest shift for one persuasion-tuned model', src: 'Same study' },
    ],
    chart: {
      kind: 'bars', title: 'Conversation beats static text', subtitle: 'Extra opinion change from a live AI conversation versus reading the same message, UK experiment (percentage points)', unit: ' pp',
      items: [
        { label: 'GPT-4o', value: 2.94, note: '+41% over static text, p<.001' },
        { label: 'GPT-4.5', value: 3.6, note: '+52% over static text, p<.001', highlight: true },
      ],
      src: 'arXiv 2507.13919',
    },
    whyItMatters: 'Persuasion is now a measurable property of a model, and it scales to millions of conversations at once. The open question is no longer whether it works but who is allowed to point it at whom.',
    nextSteps: [
      'Treat any one-to-one AI conversation as a persuasive setting, not a neutral lookup.',
      'Ask of every confident answer: what would change this, and what is it leaving out?',
      'Take the live study on this site and compare your own shift with the published averages.',
    ],
    caveat: 'The 2026 behaviour-change preprint (arXiv 2604.09200) reports effects above 10 points on signing a real petition. Its HTML and PDF versions quote different headline figures (19.7 and 12.8 points), so treat the exact size as provisional.',
    sources: [
      { label: 'Cornell Chronicle: AI chatbots can effectively sway voters in either direction', url: 'https://www.news.cornell.edu/stories/2025/12/ai-chatbots-can-effectively-sway-voters-either-direction', date: 'Dec 2025', note: 'Summary of the Science paper' },
      { label: 'Conversation vs static text, UK experiment', url: 'https://arxiv.org/abs/2507.13919', date: '2025', note: 'Preprint' },
      { label: 'AI can persuade people to take political actions', url: 'https://arxiv.org/abs/2604.09200', date: '2026', note: 'Preprint, provisional' },
    ],
    related: ['is-ai-eroding-critical-thinking', 'chatgpt-tone-hindi-english', 'how-people-buy-expertise'],
  },

  'chatgpt-tone-hindi-english': {
    headline: 'Newer benchmarks keep finding the same thing: models do better in English than in Hindi, and the gap is topic-dependent.',
    asOf: 'Updated November 2026',
    takeaways: [
      'Large 2025 Indic benchmarks show a consistent English-over-Hindi accuracy gap.',
      'The gap is not uniform: strong models score very differently across domains within one language.',
      'Tone is learned from training data, so whichever language is better represented sets the default voice.',
    ],
    stats: [
      { value: 74166, label: 'question-answer pairs in BhashaBench V1', src: 'BhashaBench V1, 2025' },
      { value: 52494, label: 'in English', src: 'Same benchmark' },
      { value: 21672, label: 'in Hindi', src: 'Same benchmark' },
    ],
    chart: {
      kind: 'bars', title: 'Same model, very different domains', subtitle: 'GPT-4o accuracy on BhashaBench V1 domains (%)', unit: '%', max: 100,
      items: [
        { label: 'Legal', value: 76.49, highlight: true },
        { label: 'Ayurveda', value: 59.74 },
      ],
      src: 'BhashaBench V1',
    },
    whyItMatters: 'If the default voice and the default accuracy both favour English, then Hindi speakers get a quieter, less reliable assistant by design, not by accident.',
    nextSteps: [
      'When a model answers in Hindi, check names, dates and domain terms, which are the first things to slip.',
      'Prompt for register explicitly (formal, conversational, honorific) instead of trusting the default.',
    ],
    caveat: 'Benchmarks differ in how Hindi test sets were produced (native versus translated), which affects comparisons.',
    sources: [
      { label: 'Benchmarking Hindi LLMs (five translated Hindi evaluation sets)', url: 'https://arxiv.org/abs/2508.19831', date: '2025', note: 'Preprint' },
      { label: 'BhashaBench V1', url: 'https://arxiv.org/abs/2510.25409', date: 'Oct 2025', note: 'Findings of EMNLP 2026' },
    ],
    related: ['how-persuasive-is-frontier-ai', 'brain-ai-algorithmic-bridge', 'is-ai-eroding-critical-thinking'],
  },

  'how-people-buy-expertise': {
    headline: 'Buyers now start with an AI chatbot, then check what it told them with a human.',
    asOf: 'Updated November 2026',
    takeaways: [
      'Most B2B software buyers now research with AI chatbots, and many shortlist differently because of them.',
      'Even so, around seven in ten buyers validate AI-generated insight with a real person.',
      'For experts, being the human that AI recommends and buyers can verify is now the job.',
    ],
    stats: [
      { value: 71, suffix: '%', label: 'of B2B software buyers rely on AI chatbots for research (60% before)', src: 'G2, March 2026 (n=1,076; vendor-run)' },
      { value: 51, suffix: '%', label: 'start with a chatbot more often than Google', src: 'G2, March 2026' },
      { value: 69, suffix: '%', label: 'validate AI-generated insight with sales reps', src: 'Gartner, May 2026 (n=645)' },
      { value: 94, suffix: '%', label: 'of buyers use AI in the journey (up 5 points)', src: 'Forrester Buyers Journey 2025' },
    ],
    chart: {
      kind: 'bars', title: 'AI in the buying journey, 2026', subtitle: 'Share of B2B buyers (%)', unit: '%', max: 100,
      items: [
        { label: 'Use AI somewhere in the journey', value: 94 },
        { label: 'Rely on chatbots for software research', value: 71, highlight: true },
        { label: 'Validate AI insight with sales reps', value: 69 },
        { label: 'Start with a chatbot over Google', value: 51 },
      ],
      src: 'Forrester 2025; G2 and Gartner 2026',
    },
    whyItMatters: 'Trust is being assembled in two steps: a machine proposes, a person confirms. Credible, findable, specific expertise wins both steps.',
    nextSteps: [
      'Publish specific, checkable claims an AI can quote and a buyer can verify.',
      'Make the human step easy: a clear call, a real name, a visible track record.',
    ],
    caveat: 'The G2 figures come from a vendor-run survey of software buyers and should not be read as all buyers of all services.',
    sources: [
      { label: 'Gartner, B2B buyer survey (645 buyers)', url: 'https://www.gartner.com/en/newsroom', date: 'May 2026', note: 'Press-room link; search for the release' },
      { label: 'Forrester Buyers\' Journey Survey 2025', url: 'https://www.forrester.com/', date: '2025' },
      { label: 'G2 buyer behaviour report', url: 'https://www.g2.com/', date: 'Mar 2026', note: 'Vendor-run survey' },
    ],
    related: ['agi-society-and-the-end-of-b2b-agencies', 'vega-2-marketing-funnels-automation', 'how-persuasive-is-frontier-ai'],
  },

  'brain-ai-algorithmic-bridge': {
    headline: 'The brain-to-model bridge is real but narrower than the headlines: alignment fades once models outgrow human language skill.',
    asOf: 'Updated November 2026',
    takeaways: [
      'A 2025 EMNLP paper finds that early in training, models track the human language network, and that link fades as models exceed human proficiency.',
      'Model size alone is a weak predictor of brain alignment once feature count is controlled.',
      'A review of 25 fMRI studies calls the evidence cautiously optimistic but inconclusive.',
    ],
    stats: [
      { value: 25, label: 'fMRI studies in a 2025 UniReps review (2023 to 2025)', src: 'UniReps 2025' },
    ],
    whyItMatters: 'Similarity to the brain is not the same as understanding. The most capable models may be succeeding by different mechanisms than ours, which is exactly why the comparison keeps teaching us something.',
    nextSteps: [
      'Read "brain-like" claims as "correlates with a measured brain signal under a given task".',
      'Prefer papers that control for model size and training data.',
    ],
    caveat: 'Several 2025 and 2026 items here are preprints and have not completed peer review.',
    sources: [
      { label: 'From Language to Cognition: How LLMs Outgrow the Human Language Network', url: 'https://arxiv.org/abs/2503.01830', date: 'EMNLP 2025', note: 'Oral presentation' },
      { label: 'Project page, EPFL', url: 'https://language-to-cognition.epfl.ch', date: '2025' },
    ],
    related: ['machine-consciousness-2035', 'is-ai-eroding-critical-thinking', 'chatgpt-tone-hindi-english'],
  },

  'machine-consciousness-2035': {
    headline: 'Experts and the public disagree less than you might expect about when machine experience becomes plausible.',
    asOf: 'Updated November 2026',
    takeaways: [
      'In a 2025 survey, the median AI researcher put the chance that AI has subjective experience by 2034 at 25%.',
      'The public median was 30% for the same date, and both groups rise further by 2100 (summaries differ on the exact figure).',
      'A small digital-minds expert survey (n=67) put 90% on "possible in principle".',
    ],
    stats: [
      { value: 582, label: 'AI researchers surveyed', src: 'Dreksler et al., 2025' },
      { value: 838, label: 'US public respondents', src: 'Dreksler et al., 2025' },
      { value: 25, suffix: '%', label: 'researcher median chance by 2034', src: 'Dreksler et al., 2025' },
    ],
    chart: {
      kind: 'lines', title: 'When might AI have subjective experience?', subtitle: 'Median probability (%) by year, researchers vs US public', unit: '%', xLabels: [2024, 2034],
      series: [
        { name: 'AI researchers', color: '#3D2645', points: [[2024, 1], [2034, 25]] },
        { name: 'US public', color: '#C9A84C', points: [[2024, 5], [2034, 30]] },
      ],
      src: 'Dreksler et al., 2025',
    },
    whyItMatters: 'Because the uncertainty is wide, the sensible position is neither dismissal nor certainty, but building the measurement tools before the question becomes urgent.',
    nextSteps: [
      'Separate three questions: intelligence, behaviour that looks like feeling, and actual experience.',
      'Watch for survey updates; no 2026 edition of the researcher survey was found.',
    ],
    caveat: 'These are opinion surveys, not measurements of any system. They show belief, not fact. Summaries disagree on the researcher median for 2100 (60 or 70%), so only the 2024 and 2034 points are firm.',
    sources: [
      { label: 'Subjective experience in AI systems: what do AI researchers and the public believe?', url: 'https://arxiv.org/abs/2506.11945', date: 'Jun 2025', note: 'Preprint' },
    ],
    related: ['brain-ai-algorithmic-bridge', 'future-of-ai-from-tools-to-agents', 'agi-society-and-the-end-of-b2b-agencies'],
  },

  'vega-2-marketing-funnels-automation': {
    headline: 'Agents are in the funnel now, but most organisations are still experimenting, and a lot of "agent" products are not.',
    asOf: 'Updated November 2026',
    takeaways: [
      'Three in five companies are at least experimenting with agents, and under a quarter are scaling them anywhere.',
      'Gartner expects over 40% of agentic AI projects to be cancelled by the end of 2027.',
      'Only about 130 of thousands of vendors claiming agentic AI were judged real; the rest is "agent washing".',
    ],
    stats: [
      { value: 62, suffix: '%', label: 'at least experimenting with AI agents', src: 'McKinsey State of AI 2025' },
      { value: 23, suffix: '%', label: 'scaling agents somewhere in the business', src: 'McKinsey State of AI 2025' },
      { value: 40, suffix: '%', label: 'of agentic projects cancelled by end of 2027 (forecast)', src: 'Gartner, June 2025' },
      { value: 130, label: 'genuine agentic vendors out of thousands', src: 'Gartner, June 2025' },
    ],
    whyItMatters: 'Automation pays when it replaces a clear, repeated task. It fails when it is bought as a label. Start with one funnel step you can measure.',
    nextSteps: [
      'Pick one repeated step (lead reply, booking, follow-up) and time it before and after.',
      'Ask any vendor what the agent does unattended, and what it is not allowed to do.',
    ],
    caveat: 'The Gartner cancellation figure is a forecast, not an observed outcome.',
    sources: [
      { label: 'McKinsey, The State of AI', url: 'https://www.mckinsey.com/capabilities/quantumblack/our-insights/the-state-of-ai', date: '2025' },
      { label: 'Gartner press release on agentic AI project cancellations', url: 'https://www.gartner.com/en/newsroom/press-releases/2025-06-25-gartner-predicts-over-40-percent-of-agentic-ai-projects-will-be-canceled-by-end-of-2027', date: '25 Jun 2025' },
    ],
    related: ['future-of-ai-from-tools-to-agents', 'agi-society-and-the-end-of-b2b-agencies', 'how-people-buy-expertise'],
  },

  'future-of-ai-from-tools-to-agents': {
    headline: 'The length of task an AI can finish on its own keeps doubling, on a timescale of months, not years.',
    asOf: 'Updated November 2026',
    takeaways: [
      'METR measures the length of task (in human working time) that models complete about half the time.',
      'Overall that horizon doubled roughly every 196 days; for models since 2023 it was about 131 days, and since 2024 about 89 days.',
      'Adoption is broad: 49% of US adults now use AI chatbots, with ChatGPT at 44%.',
    ],
    stats: [
      { value: 196, suffix: ' days', label: 'doubling time of task horizon, overall (about 7 months)', src: 'METR Time Horizon 1.1, 29 Jan 2026' },
      { value: 89, suffix: ' days', label: 'doubling time for models from 2024 on', src: 'METR Time Horizon 1.1' },
      { value: 228, label: 'tasks in the suite', src: 'METR Time Horizon 1.1' },
      { value: 49, suffix: '%', label: 'of US adults use AI chatbots', src: 'Pew, Feb 2026 survey (n=5,119)' },
    ],
    chart: {
      kind: 'lines', title: 'ChatGPT use among US adults', subtitle: 'Share who have used ChatGPT (%)', unit: '%', xLabels: [2023, 2024, 2025, 2026],
      series: [{ name: 'ChatGPT', color: '#3D2645', points: [[2023, 18], [2024, 23], [2025, 34], [2026, 44]] }],
      src: 'Pew Research Center, June 2026',
    },
    whyItMatters: 'Doubling is easy to underestimate. A horizon measured in hours becomes days after a few cycles, which is where tools start to behave like colleagues.',
    nextSteps: [
      'Use the projector above to see what each doubling time implies, and how wide the uncertainty is.',
      'Track your own tasks: which ones already finish unattended?',
    ],
    caveat: 'METR flags wide uncertainty around these estimates, and the Pew comparison with 2024 is not like-for-like for the 49% figure.',
    projector: true,
    sources: [
      { label: 'METR, Time Horizon 1.1', url: 'https://metr.org/blog/2026-1-29-time-horizon-1-1', date: '29 Jan 2026' },
      { label: 'Pew Research Center on AI chatbot use', url: 'https://www.pewresearch.org/', date: '17 Jun 2026', note: 'Survey of 5,119 US adults, Feb 2026' },
    ],
    related: ['vega-2-marketing-funnels-automation', 'agi-society-and-the-end-of-b2b-agencies', 'machine-consciousness-2035'],
  },

  'is-ai-eroding-critical-thinking': {
    headline: 'The 2025 evidence is suggestive, not conclusive, and the authors themselves say so.',
    asOf: 'Updated November 2026',
    takeaways: [
      'In an MIT Media Lab study, people writing with no tools showed the strongest brain connectivity; with an LLM, the weakest.',
      'The sample was small (54 people, 18 in the last session) and the paper is a preprint.',
      'A Microsoft Research and CMU survey of 319 knowledge workers found more trust in AI went with less critical-thinking effort.',
    ],
    stats: [
      { value: 54, label: 'participants in the MIT Media Lab EEG study', src: 'Kosmyna et al., 2025 (preprint)' },
      { value: 319, label: 'knowledge workers surveyed by Microsoft Research and CMU', src: 'CHI 2025' },
      { value: 936, label: 'real-world examples analysed', src: 'CHI 2025' },
    ],
    chart: {
      kind: 'bars', title: 'Neural connectivity by writing condition', subtitle: 'Relative ordering reported in the MIT study (strongest to weakest)', unit: '', max: 3,
      items: [
        { label: 'Brain only', value: 3, note: 'Strongest connectivity' },
        { label: 'Search engine', value: 2, note: 'Moderate' },
        { label: 'LLM', value: 1, note: 'Weakest', highlight: true },
      ],
      src: 'Kosmyna et al., arXiv 2506.08872. Ordinal ranking only; the bars are not measured values.',
    },
    whyItMatters: 'Cognitive "debt" is a hypothesis, and the sensible response is a habit, not a panic: think first, then ask the model.',
    nextSteps: [
      'Draft your own view before you ask a model.',
      'Use the model to challenge you, not to answer for you.',
    ],
    caveat: 'The MIT paper is a preprint, not peer reviewed, and its authors describe "possible" cognitive debt, not proof. The Microsoft and CMU result is a correlation.',
    sources: [
      { label: 'Your Brain on ChatGPT, Kosmyna et al.', url: 'https://arxiv.org/abs/2506.08872', date: '2025', note: 'Preprint' },
      { label: 'Microsoft Research and CMU, CHI 2025', url: 'https://www.microsoft.com/en-us/research/', date: '2025' },
    ],
    related: ['how-persuasive-is-frontier-ai', 'brain-ai-algorithmic-bridge', 'future-of-ai-from-tools-to-agents'],
  },

  'agi-society-and-the-end-of-b2b-agencies': {
    headline: 'Agencies are adopting AI fast, and the labour data shows the first effect is fewer entry-level hires, not mass layoffs.',
    asOf: 'Updated November 2026',
    takeaways: [
      'Nine in ten US agencies use generative AI; about half use agentic AI for execution.',
      'In one survey, 14.2% of marketers cut agency spend because of AI, against 1.9% who raised it.',
      'Stanford researchers find a 19% employment gap for ages 22 to 25 in the most AI-exposed jobs, with no broad economy-wide displacement.',
    ],
    stats: [
      { value: 90, suffix: '%', label: 'of US agencies use generative AI', src: 'Forrester and 4As, 2026' },
      { value: 14.2, suffix: '%', decimals: 1, label: 'of marketers reduced agency spend due to AI', src: 'Marketing Week survey, n=2,350' },
      { value: 19, suffix: '%', label: 'below counterfactual employment, ages 22 to 25, most exposed jobs', src: 'Stanford Digital Economy Lab, Aug 2026 revision' },
      { value: 10, suffix: '%', label: 'of B2B buyers satisfied with agency execution', src: 'Forrester B2B' },
    ],
    chart: {
      kind: 'bars', title: 'Agency spend: which way is it moving?', subtitle: 'Marketers reporting a change because of AI (%)', unit: '%', max: 20,
      items: [
        { label: 'Reduced agency spend', value: 14.2, highlight: true },
        { label: 'Increased agency spend', value: 1.9 },
      ],
      src: 'Marketing Week, n=2,350 marketers',
    },
    whyItMatters: 'The pressure is on the commodity layer of agency work. Judgement, trust and accountable relationships are what stay valuable.',
    nextSteps: [
      'List which parts of your service a buyer could now get from a model, and move away from those.',
      'Sell the outcome and the accountable human, not the deliverable.',
    ],
    caveat: 'The Stanford result is descriptive, not causal. Survey figures come from different samples and should not be added together.',
    sources: [
      { label: 'Canaries in the Coal Mine, Stanford Digital Economy Lab', url: 'https://digitaleconomy.stanford.edu/publications/canaries-in-the-coal-mine/', date: 'Aug 2026 revision' },
      { label: 'Forrester and 4As agency survey', url: 'https://www.forrester.com/', date: '2026' },
      { label: 'Marketing Week marketer survey', url: 'https://www.marketingweek.com/', date: '2026' },
    ],
    related: ['how-people-buy-expertise', 'vega-2-marketing-funnels-automation', 'future-of-ai-from-tools-to-agents'],
  },
}
