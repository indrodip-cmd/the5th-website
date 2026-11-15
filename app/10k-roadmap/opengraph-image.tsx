import { ImageResponse } from 'next/og'
import fs from 'node:fs'
import path from 'node:path'

/* Branded 1200x630 share card, auto-wired by Next as og:image + twitter:image
   (the file-convention Next uses across this codebase — see /results,
   /event/the-shift, /research/*). Every link-preview surface that reads
   Open Graph tags picks this up automatically, Zoom chat included; there is
   no separate thing to configure per platform.

   Composed, not a raw screenshot of the live page: the previous version
   (a Playwright screenshot of the real hero) put the founder photo flush
   against the right edge and the headline flush against the left edge, so
   any platform that crops toward a square or a tighter ratio (several do,
   WhatsApp among them) cut the photo off at the side. Everything here sits
   centered with generous margin on all sides so a center-crop never loses
   the subject or the headline. */
export const alt = "You've Tried Coaches, ChatGPT And Claude. So Why Aren't You Making Consistent Money? | The5th $29 Private Business Audit"
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

const BG = '#070A06'
const ACCENT = '#C9FF48'

export default function OpengraphImage() {
  const photo = fs.readFileSync(path.join(process.cwd(), 'public', 'images', 'founder-og.jpg')).toString('base64')

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: BG,
          padding: '64px 120px',
          fontFamily: 'sans-serif',
          borderTop: `6px solid ${ACCENT}`,
        }}
      >
        <div
          style={{
            display: 'flex',
            fontSize: 19,
            letterSpacing: 2.5,
            textTransform: 'uppercase',
            color: ACCENT,
            fontWeight: 700,
            textAlign: 'center',
            whiteSpace: 'nowrap',
          }}
        >
          For Coaches &amp; Consultants Who Are Done Buying Programs
        </div>
        <div
          style={{
            display: 'flex',
            textAlign: 'center',
            justifyContent: 'center',
            fontSize: 52,
            lineHeight: 1.16,
            fontWeight: 800,
            color: '#fff',
            maxWidth: 680,
            marginTop: 20,
          }}
        >
          So Why Aren&apos;t You Making Consistent Money?
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 20,
            marginTop: 38,
            background: 'rgba(255,255,255,.06)',
            border: '1px solid rgba(255,255,255,.16)',
            borderRadius: 999,
            padding: '12px 28px 12px 12px',
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`data:image/jpeg;base64,${photo}`}
            width={64}
            height={64}
            style={{ borderRadius: '50%', objectFit: 'cover', border: `2px solid ${ACCENT}` }}
          />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', fontSize: 22, fontWeight: 700, color: '#fff' }}>Indrodip Ghosh</div>
            <div style={{ display: 'flex', fontSize: 17, color: 'rgba(255,255,255,.62)' }}>$29 Private Business Audit, Refundable</div>
          </div>
        </div>
      </div>
    ),
    { ...size },
  )
}
