import { ImageResponse } from 'next/og'
import type { ResearchPost } from './posts'

/* Shared 1200x630 branded share card for Research. Each article colocates an
   opengraph-image.tsx that calls researchOg(post); Next auto-wires it as
   og:image + twitter:image for that route. Satori (next/og) supports flexbox
   only, so every container is display:flex. */
export const OG_SIZE = { width: 1200, height: 630 }
export const OG_CONTENT_TYPE = 'image/png'

const PLUM = '#3D2645'
const PLUM_DARK = '#2E1A35'
const GOLD = '#C9A84C'

export function researchOg(post: ResearchPost) {
  const len = post.title.length
  const titleSize = len > 78 ? 50 : len > 56 ? 60 : 72
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center',
          padding: '84px 90px', background: `linear-gradient(135deg, ${PLUM} 0%, ${PLUM_DARK} 100%)`,
          color: '#fff', position: 'relative',
        }}
      >
        <div
          style={{
            position: 'absolute', top: -190, left: 430, width: 720, height: 540,
            background: 'radial-gradient(closest-side, rgba(201,168,76,0.24), transparent)', display: 'flex',
          }}
        />
        <div style={{ display: 'flex', fontSize: 23, letterSpacing: 5, textTransform: 'uppercase', color: GOLD, fontWeight: 600 }}>
          {(post.tags[0] || 'Research')} · The5th Research
        </div>
        <div style={{ display: 'flex', width: 90, height: 4, background: GOLD, margin: '26px 0 24px' }} />
        <div style={{ display: 'flex', flexWrap: 'wrap', fontSize: titleSize, lineHeight: 1.06, fontWeight: 700, maxWidth: 1010, letterSpacing: -1 }}>
          {post.title}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', marginTop: 44, fontSize: 26, color: 'rgba(255,255,255,0.72)' }}>
          <span style={{ display: 'flex', width: 12, height: 12, borderRadius: 6, background: GOLD, marginRight: 14 }} />
          Independent research · Indrodip Ghosh · {post.dateLabel}
        </div>
      </div>
    ),
    { ...OG_SIZE },
  )
}
