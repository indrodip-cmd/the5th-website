/* Registry for the Research section. Add a new entry here and create a matching
   app/research/<slug>/page.tsx to publish a post. The index page reads this
   list; each article page reads its own entry for the byline + SEO. */
export interface ResearchPost {
  slug: string
  title: string
  excerpt: string
  date: string        // ISO, for <time> + JSON-LD
  dateLabel: string   // human-readable
  readTime: string
  author: string
  authorRole: string
  tags: string[]
}

export const POSTS: ResearchPost[] = [
  {
    slug: 'vega-2-marketing-funnels-automation',
    title: 'Vega 2.0: How Our Own AI Will Run Marketing and Funnels',
    excerpt:
      'A plain look at what I am building. Vega is our own AI, and Vega 2.0 turns a funnel from a thing you set up once into a thing that runs and fixes itself. It learns your buyer, builds the offer and pages and emails, launches and tests them, and talks to every lead one to one, at scale. Here is how it works, why competent AI is already enough to change marketing, and what it leaves for the human to do.',
    date: '2026-09-16',
    dateLabel: 'September 16, 2026',
    readTime: '18 min read',
    author: 'Indrodip Ghosh',
    authorRole: 'Consumer Behavior & AI Researcher',
    tags: ['Vega', 'Marketing', 'AI Agents', 'Automation'],
  },
  {
    slug: 'how-persuasive-is-frontier-ai',
    title: 'The Persuasion Engine: A White Paper on How Good AI Has Become at Changing Our Minds',
    excerpt:
      'An original study, roughly a year and about $10,000 in the making, on a question I could no longer ignore: how persuasive has a leading frontier model become, and what happens to human judgment when a machine that can change your mind can also do it a million times at once, personalised to each person? Written in plain words from a behavioural-science point of view, grounded in the converging published evidence, and honest about where the real danger, and the real promise, sit.',
    date: '2026-09-15',
    dateLabel: 'September 15, 2026',
    readTime: '30 min read',
    author: 'Indrodip Ghosh',
    authorRole: 'Consumer Behavior & AI Researcher',
    tags: ['Behavioural Research', 'Persuasion', 'Artificial Intelligence', 'White Paper'],
  },
  {
    slug: 'is-ai-eroding-critical-thinking',
    title: 'Cognitive Debt: A White Paper on How Everyday AI Use May Be Eroding Our Critical Thinking',
    excerpt:
      'A white paper from my own behavioural research, looking at more than 100 American adults aged 30 to 60, on a question that started to worry me: does leaning on AI for everyday thinking quietly weaken the thinking itself? Written in plain words from a cognitive-science and neuroscience point of view, grounded in the converging published evidence, and ending with a practical protocol for using AI without losing your edge.',
    date: '2026-09-14',
    dateLabel: 'September 14, 2026',
    readTime: '32 min read',
    author: 'Indrodip Ghosh',
    authorRole: 'Consumer Behavior & AI Researcher',
    tags: ['Behavioural Research', 'Cognitive Science', 'Neuroscience', 'White Paper'],
  },
  {
    slug: 'future-of-ai-from-tools-to-agents',
    title: 'From Tools to Agents: A Plain-Language Field Guide to the Next Ten Years of AI',
    excerpt:
      'My working map of where AI is actually heading, written for someone with no technical background. The big shift is from software that answers to software that acts: agents, memory, the quiet collapse of the app interface, models that understand the physical world, and what all of it means for an ordinary working day. Honest about what I believe, and about what nobody yet knows.',
    date: '2026-09-10',
    dateLabel: 'September 10, 2026',
    readTime: '25 min read',
    author: 'Indrodip Ghosh',
    authorRole: 'Consumer Behavior & AI Researcher',
    tags: ['Artificial Intelligence', 'Future of AI', 'AI Agents', 'Society'],
  },
  {
    slug: 'agi-society-and-the-end-of-b2b-agencies',
    title: 'The Last Agency: AGI, the Society It Reshapes, and Why B2B Marketing Agencies Die First',
    excerpt:
      'A first-principles look at artificial general intelligence, what the word actually means, what it does to work and society, and then a blunt thesis about one industry sitting directly in the blast radius. The traditional B2B marketing agency priced the labor of making things. When that labor costs almost nothing, the model breaks. Here is how, what survives, and what replaces it.',
    date: '2026-09-02',
    dateLabel: 'September 2, 2026',
    readTime: '27 min read',
    author: 'Indrodip Ghosh',
    authorRole: 'Consumer Behavior & AI Researcher',
    tags: ['Artificial Intelligence', 'AGI', 'Economics', 'Marketing'],
  },
  {
    slug: 'chatgpt-tone-hindi-english',
    title: 'The Language You Ask In: How ChatGPT’s Tone Softens in Hindi and Sharpens in English',
    excerpt:
      'A story-first investigation into a small, strange observation: the same assistant seems to answer more warmly in Hindi and more bluntly in English. We follow it down through sociolinguistics, honorifics, English-heavy alignment data, and the research on prompt politeness, to ask what is really happening when the language you choose quietly changes the machine you get.',
    date: '2026-08-15',
    dateLabel: 'August 15, 2026',
    readTime: '24 min read',
    author: 'Indrodip Ghosh',
    authorRole: 'Consumer Behavior & AI Researcher',
    tags: ['Human Behavior', 'Artificial Intelligence', 'Language & Culture', 'Sociolinguistics'],
  },
  {
    slug: 'how-people-buy-expertise',
    title: 'The Anatomy of a Decision: An Evidence Synthesis of How People Buy Expertise',
    excerpt:
      'A full findings report synthesizing five decades of research across behavioral economics, services marketing, and psychology to answer one question: what actually governs the decision to buy a coach, consultant, or expert service? Covers the credence-good problem, dual-process decision-making, loss aversion, reference prices, the trust model, social proof, signaling, commitment and pre-payment, choice architecture, and the evidence on whether these services work, closing with an integrated model of the purchase decision.',
    date: '2026-07-18',
    dateLabel: 'July 18, 2026',
    readTime: '41 min read',
    author: 'Indrodip Ghosh',
    authorRole: 'Consumer Behavior & AI Researcher',
    tags: ['Consumer Behavior', 'Behavioral Economics', 'Decision Science', 'Evidence Synthesis'],
  },
  {
    slug: 'brain-ai-algorithmic-bridge',
    title: 'The Algorithmic Bridge: How Biological and Artificial Neural Networks Converge, Align, and Connect',
    excerpt:
      'A technical account of the brain–AI relationship for researchers: representational alignment metrics (RSA, CKA, encoding models), the biological credit-assignment problem and backpropagation approximations (feedback alignment, target propagation, predictive coding, equilibrium propagation), population geometry and manifold capacity, the convergence hypothesis, and the mathematics of the neural read/write interface. Equations included; no simplification.',
    date: '2026-06-12',
    dateLabel: 'June 12, 2026',
    readTime: '19 min read',
    author: 'Indrodip Ghosh',
    authorRole: 'Consumer Behavior & AI Researcher',
    tags: ['Neuroscience', 'Deep Learning', 'Neural Coding', 'Brain–Computer Interfaces'],
  },
  {
    slug: 'machine-consciousness-2035',
    title: 'The Road to Machine Consciousness: How Artificial Minds Could Wake Up by 2035',
    excerpt:
      'A deep, first-principles map of the problem, from the neuroscience of the conscious brain and the mathematics of integrated information to a concrete architectural blueprint and a year-by-year roadmap to 2035. Written for the curious layperson and the working researcher at once.',
    date: '2026-05-28',
    dateLabel: 'May 28, 2026',
    readTime: '17 min read',
    author: 'Indrodip Ghosh',
    authorRole: 'Consumer Behavior & AI Researcher',
    tags: ['Artificial Intelligence', 'Neuroscience', 'Consciousness', 'Mathematics'],
  },
]

export function getPost(slug: string): ResearchPost | undefined {
  return POSTS.find((p) => p.slug === slug)
}
