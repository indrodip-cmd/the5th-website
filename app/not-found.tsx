import Link from 'next/link'

export const metadata = { title: 'Page not found · The5th Consulting' }

export default function NotFound() {
  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(168deg,#3D2645,#2E1A35 60%,#231029)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '40px 24px', fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <div style={{ maxWidth: 520 }}>
        <div style={{ fontSize: 13, letterSpacing: '.22em', textTransform: 'uppercase', color: '#C9A84C', fontWeight: 700, marginBottom: 18 }}>Error 404</div>
        <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 'clamp(40px,8vw,72px)', fontWeight: 500, lineHeight: 1.02, letterSpacing: '-.02em', marginBottom: 18 }}>
          This page wandered off.
        </h1>
        <p style={{ fontSize: 17, fontWeight: 300, color: 'rgba(255,255,255,.72)', lineHeight: 1.7, marginBottom: 34 }}>
          The link may be old or mistyped. Let&apos;s get you back to something useful.
        </p>
        <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/" style={{ display: 'inline-block', background: 'linear-gradient(180deg,#E4C879,#C9A84C 60%,#B0902F)', color: '#2E1A35', fontSize: 15, fontWeight: 700, padding: '15px 34px', borderRadius: 6, textDecoration: 'none' }}>Back to Home →</Link>
          <Link href="/quiz" style={{ display: 'inline-block', color: '#fff', fontSize: 15, fontWeight: 600, padding: '15px 30px', borderRadius: 6, textDecoration: 'none', border: '1px solid rgba(255,255,255,.4)' }}>Take the Assessment</Link>
        </div>
      </div>
    </div>
  )
}
