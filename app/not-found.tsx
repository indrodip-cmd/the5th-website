import Link from 'next/link'

export const metadata = { title: 'Page not found · The5th Consulting' }

/* Animated, on-brand 404. The giant "404" (with a spinning ring for the middle
   zero) sits over a slowly drifting field of gold orbs — the same "big number +
   subhead + text + button" structure as the reference, rebuilt with pure CSS so
   there's no GIF to break, and wired to our own buttons. */
export default function NotFound() {
  const C = { plum: '#2E1A35', plumDeep: '#231029', gold: '#C9A84C', goldSoft: '#E4C879', goldDeep: '#B0902F' }
  return (
    <section
      style={{
        position: 'relative', minHeight: '100vh', overflow: 'hidden',
        background: `radial-gradient(120% 120% at 50% -10%, ${C.plum} 0%, ${C.plumDeep} 70%)`,
        color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
        textAlign: 'center', padding: '48px 24px',
        fontFamily: "'Public Sans', system-ui, -apple-system, sans-serif",
      }}
    >
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes nf-float { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-16px) } }
        @keyframes nf-spin { to { transform: rotate(360deg) } }
        @keyframes nf-shimmer { 0%,100% { background-position: 0% 50% } 50% { background-position: 100% 50% } }
        @keyframes nf-rise { from { opacity: 0; transform: translateY(14px) } to { opacity: 1; transform: none } }
        @keyframes nf-drift1 { 0%,100% { transform: translate(0,0) } 50% { transform: translate(40px,-30px) } }
        @keyframes nf-drift2 { 0%,100% { transform: translate(0,0) } 50% { transform: translate(-50px,24px) } }
        @keyframes nf-drift3 { 0%,100% { transform: translate(0,0) } 50% { transform: translate(24px,36px) } }
        .nf-orb { position: absolute; border-radius: 50%; filter: blur(40px); pointer-events: none; }
        .nf-code { display: inline-flex; align-items: center; justify-content: center; gap: clamp(6px, 2vw, 22px);
          font-family: Georgia, 'Times New Roman', serif; font-weight: 700; line-height: 1;
          font-size: clamp(96px, 22vw, 210px); animation: nf-float 5s ease-in-out infinite; }
        .nf-digit { background: linear-gradient(120deg, ${C.goldSoft}, ${C.gold} 45%, ${C.goldDeep}, ${C.goldSoft});
          background-size: 220% 220%; -webkit-background-clip: text; background-clip: text; color: transparent;
          -webkit-text-fill-color: transparent; animation: nf-shimmer 6s ease-in-out infinite;
          text-shadow: 0 24px 60px rgba(201,168,76,0.18); }
        .nf-ring { width: clamp(74px, 16vw, 158px); height: clamp(74px, 16vw, 158px); border-radius: 50%;
          border: clamp(7px, 1.6vw, 15px) solid rgba(201,168,76,0.16); border-top-color: ${C.gold};
          border-right-color: ${C.goldSoft}; animation: nf-spin 2.6s linear infinite; flex-shrink: 0; }
        .nf-in > * { animation: nf-rise .7s cubic-bezier(.22,1,.36,1) both; }
        .nf-in > *:nth-child(2) { animation-delay: .05s } .nf-in > *:nth-child(3) { animation-delay: .12s }
        .nf-in > *:nth-child(4) { animation-delay: .19s } .nf-in > *:nth-child(5) { animation-delay: .26s }
        .nf-btn { display: inline-block; font-size: 15px; font-weight: 700; padding: 15px 34px; border-radius: 8px;
          text-decoration: none; transition: transform .18s ease, box-shadow .18s ease; }
        .nf-btn:hover { transform: translateY(-2px) }
        @media (prefers-reduced-motion: reduce) {
          .nf-code, .nf-ring, .nf-digit, .nf-orb, .nf-in > * { animation: none !important }
        }
      ` }} />

      {/* drifting gold orbs */}
      <span className="nf-orb" style={{ top: '-60px', left: '-40px', width: 320, height: 320, background: 'rgba(201,168,76,0.22)', animation: 'nf-drift1 16s ease-in-out infinite' }} />
      <span className="nf-orb" style={{ bottom: '-80px', right: '-30px', width: 380, height: 380, background: 'rgba(108,95,199,0.20)', animation: 'nf-drift2 20s ease-in-out infinite' }} />
      <span className="nf-orb" style={{ top: '40%', right: '18%', width: 180, height: 180, background: 'rgba(228,200,121,0.16)', animation: 'nf-drift3 14s ease-in-out infinite' }} />

      <div className="nf-in" style={{ position: 'relative', zIndex: 1, maxWidth: 560 }}>
        <div style={{ fontSize: 13, letterSpacing: '.24em', textTransform: 'uppercase', color: C.gold, fontWeight: 700, marginBottom: 6 }}>
          Error 404
        </div>

        <div className="nf-code" aria-label="404">
          <span className="nf-digit">4</span>
          <span className="nf-ring" aria-hidden="true" />
          <span className="nf-digit">4</span>
        </div>

        <h1 style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontSize: 'clamp(30px,5.5vw,46px)', fontWeight: 500, lineHeight: 1.08, letterSpacing: '-.01em', margin: '10px 0 14px' }}>
          This page wandered off.
        </h1>

        <p style={{ fontSize: 17, color: 'rgba(255,255,255,.72)', lineHeight: 1.7, margin: '0 auto 34px', maxWidth: 440 }}>
          The link may be old or mistyped. Let&apos;s get you back to something useful.
        </p>

        <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/" className="nf-btn" style={{ background: `linear-gradient(180deg, ${C.goldSoft}, ${C.gold} 60%, ${C.goldDeep})`, color: C.plum, boxShadow: '0 14px 30px -10px rgba(201,168,76,0.55)' }}>
            Back to Home →
          </Link>
          {/* Plain anchor (full load) so the quiz's distraction-free guards in
              carolina.js / cookie-consent.js always apply on entry. */}
          <a href="/quiz" className="nf-btn" style={{ color: '#fff', border: '1px solid rgba(255,255,255,.38)' }}>
            Take the Assessment
          </a>
        </div>

        <div style={{ marginTop: 22 }}>
          <Link href="/support" style={{ fontSize: 14, color: 'rgba(255,255,255,.6)', textDecoration: 'none', borderBottom: '1px solid rgba(255,255,255,.25)', paddingBottom: 1 }}>
            Looking for something? Get help →
          </Link>
        </div>
      </div>
    </section>
  )
}
