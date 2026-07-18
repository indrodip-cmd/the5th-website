import { ImageResponse } from 'next/og'

/* Branded 1200x630 share card. Next auto-wires this as og:image + twitter:image
   for /event/the-shift, so sharing the link on any platform shows the event
   name, dates and price automatically. */
export const alt = 'The 3-Day Breakthrough Intensive with Indrodip Ghosh'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

const PLUM = '#3D2645'
const PLUM_DARK = '#2E1A35'
const GOLD = '#C9A84C'

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '84px 90px',
          background: `linear-gradient(135deg, ${PLUM} 0%, ${PLUM_DARK} 100%)`,
          color: '#fff',
          position: 'relative',
        }}
      >
        {/* gold glow */}
        <div
          style={{
            position: 'absolute',
            top: -180,
            left: 380,
            width: 700,
            height: 500,
            background: 'radial-gradient(closest-side, rgba(201,168,76,0.22), transparent)',
            display: 'flex',
          }}
        />
        <div
          style={{
            display: 'flex',
            fontSize: 24,
            letterSpacing: 6,
            textTransform: 'uppercase',
            color: GOLD,
            fontWeight: 600,
          }}
        >
          Live 3-Day Intensive · Aug 7-9
        </div>
        <div style={{ display: 'flex', width: 90, height: 4, background: GOLD, margin: '28px 0 26px' }} />
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            fontSize: 78,
            lineHeight: 1.05,
            fontWeight: 700,
            maxWidth: 960,
            letterSpacing: -1,
          }}
        >
          The 3-Day Breakthrough Intensive
        </div>
        <div style={{ display: 'flex', marginTop: 26, fontSize: 34, color: 'rgba(255,255,255,0.86)', maxWidth: 900 }}>
          Build the offer that makes your next $5,000 · Just $27
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            marginTop: 46,
            fontSize: 27,
            color: 'rgba(255,255,255,0.7)',
          }}
        >
          <span style={{ display: 'flex', width: 12, height: 12, borderRadius: 6, background: GOLD, marginRight: 14 }} />
          Hosted by Indrodip Ghosh · The5th Consulting
        </div>
      </div>
    ),
    { ...size },
  )
}
