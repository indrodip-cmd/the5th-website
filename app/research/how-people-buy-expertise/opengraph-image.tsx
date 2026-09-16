import { getPost } from '../posts'
import { researchOg, OG_SIZE, OG_CONTENT_TYPE } from '../og'

const post = getPost('how-people-buy-expertise')!
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE
export const alt = post.title
export default function Image() { return researchOg(post) }
