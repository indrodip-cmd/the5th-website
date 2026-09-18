import { researchOg, OG_SIZE, OG_CONTENT_TYPE } from './og'
import type { ResearchPost } from './posts'

/* Index share card. Reuses the article renderer with a journal-level "post". */
const indexCard: ResearchPost = {
  slug: 'research',
  title: 'Research: how AI actually works, and what is coming',
  excerpt: '',
  date: '',
  dateLabel: 'A self-taught researcher’s journal',
  readTime: '',
  author: 'Indrodip Ghosh',
  authorRole: '',
  tags: ['Independent research'],
  metaTitle: 'Research | The5th Consulting',
  metaDescription: '',
  keywords: [],
}

export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE
export const alt = 'Research · The5th Consulting'
export default function Image() { return researchOg(indexCard) }
