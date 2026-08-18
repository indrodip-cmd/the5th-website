import { ImageResponse } from 'next/og'

/* Branded 1200x630 share card for /10k-roadmap. Next auto-wires this as
   og:image AND twitter:image, so pasting the link (iMessage, WhatsApp,
   LinkedIn, X, etc.) shows this card instead of a generic preview. Generated at
   the edge — no static asset to maintain. */
export const alt = 'The $10K Roadmap Audit — for coaches & consultants | The5th Consulting'
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
          width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
          justifyContent: 'center', padding: '80px 88px', color: '#fff', position: 'relative',
          background: `linear-gradient(135deg, ${PLUM} 0%, ${PLUM_DARK} 100%)`,
        }}
      >
        {/* soft gold glow */}
        <div style={{ position: 'absolute', top: -160, right: -80, width: 700, height: 520, display: 'flex', background: 'radial-gradient(closest-side, rgba(201,168,76,0.24), transparent)' }} />

        <div style={{ display: 'flex', fontSize: 23, letterSpacing: 6, textTransform: 'uppercase', color: GOLD, fontWeight: 700 }}>
          For Coaches &amp; Consultants 40+
        </div>
        <div style={{ display: 'flex', width: 88, height: 4, background: GOLD, margin: '26px 0 24px' }} />

        <div style={{ display: 'flex', fontSize: 72, lineHeight: 1.06, fontWeight: 800, letterSpacing: -1.5, maxWidth: 1000 }}>
          Build a Predictable $10K/Month Coaching Business.
        </div>

        <div style={{ display: 'flex', fontSize: 30, lineHeight: 1.4, color: 'rgba(255,255,255,0.82)', marginTop: 26, maxWidth: 940 }}>
          A private 60-minute Roadmap Audit. Find the bottleneck, get the plan — with a 100% money-back guarantee.
        </div>

        <div style={{ display: 'flex', alignItems: 'center', marginTop: 48, fontSize: 22, fontWeight: 700, letterSpacing: 3, color: '#fff' }}>
          <span style={{ display: 'flex' }}>THE5TH CONSULTING</span>
          <span style={{ display: 'flex', width: 6, height: 6, borderRadius: 6, background: GOLD, margin: '0 16px' }} />
          <span style={{ display: 'flex', color: 'rgba(255,255,255,0.6)', letterSpacing: 0, fontWeight: 500 }}>the5th.consulting/10k-roadmap</span>
        </div>
      </div>
    ),
    { ...size },
  )
}
