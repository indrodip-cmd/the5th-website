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
    slug: 'brain-ai-algorithmic-bridge',
    title: 'The Algorithmic Bridge: How Biological and Artificial Neural Networks Converge, Align, and Connect',
    excerpt:
      'A technical account of the brain–AI relationship for researchers: representational alignment metrics (RSA, CKA, encoding models), the biological credit-assignment problem and backpropagation approximations (feedback alignment, target propagation, predictive coding, equilibrium propagation), population geometry and manifold capacity, the convergence hypothesis, and the mathematics of the neural read/write interface. Equations included; no simplification.',
    date: '2026-09-16',
    dateLabel: 'September 16, 2026',
    readTime: '19 min read',
    author: 'Indrodip Ghosh',
    authorRole: 'Consumer Behavior & AI Researcher',
    tags: ['Neuroscience', 'Deep Learning', 'Neural Coding', 'Brain–Computer Interfaces'],
  },
  {
    slug: 'machine-consciousness-2035',
    title: 'The Road to Machine Consciousness: How Artificial Minds Could Wake Up by 2035',
    excerpt:
      'A deep, first-principles map of the problem — from the neuroscience of the conscious brain and the mathematics of integrated information to a concrete architectural blueprint and a year-by-year roadmap to 2035. Written for the curious layperson and the working researcher at once.',
    date: '2026-09-16',
    dateLabel: 'September 16, 2026',
    readTime: '17 min read',
    author: 'Indrodip Ghosh',
    authorRole: 'Consumer Behavior & AI Researcher',
    tags: ['Artificial Intelligence', 'Neuroscience', 'Consciousness', 'Mathematics'],
  },
]

export function getPost(slug: string): ResearchPost | undefined {
  return POSTS.find((p) => p.slug === slug)
}
