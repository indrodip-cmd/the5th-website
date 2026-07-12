'use client'
/* Whop return URL after the $1 trial checkout. Premium "you're in" moment:
   confirms the two emails, the book + bonuses, the live 7-day The5th AI trial,
   and points to the platform. No PII is required — Whop drives fulfilment via
   webhook; this page is the celebratory hand-off. */
import { useEffect } from 'react'

const FOREST = '#1C4A32'
const FOREST_2 = '#2d6a4f'
const GOLD = '#C9A84C'
const GOLD_DK = '#a9862f'
const INK = '#2a2233'
const MUTE = '#57505f'

const PLATFORM_URL = 'https://platform.the5th.consulting'

export default function CheckoutComplete() {
  useEffect(() => {
    // Light confetti if the site's canvas-confetti is around; silent otherwise.
    ;(async () => {
      try {
        const mod = await import('canvas-confetti')
        const confetti = mod.default
        confetti({ particleCount: 90, spread: 70, origin: { y: 0.35 }, colors: [GOLD, FOREST, '#fff'] })
      } catch {}
    })()
  }, [])

  const steps: { icon: string; t: string; d: string }[] = [
    { icon: '📬', t: 'Check your inbox', d: 'Two emails are on their way — your book & bonuses (with your call reminder), and your 7-day The5th AI trial access.' },
    { icon: '📘', t: 'Your book is saved for life', d: 'Expertise To Income + all 3 bonuses live in your platform Library — yours to keep, forever, even after the trial.' },
    { icon: '🤖', t: 'The5th AI is live for 7 days', d: 'Think through your offer, your One Person, and your launch in real time — right beside the workbook.' },
    { icon: '📞', t: 'Come to our call ready', d: 'Fill out the worksheets before we talk. We’ll spend our 20 minutes building your launch, not starting from zero.' },
  ]

  return (
    <div style={{ minHeight: '100dvh', background: 'radial-gradient(120% 80% at 50% -10%, #f3ecfa 0%, #faf8fc 55%)', fontFamily: 'Inter, system-ui, sans-serif', color: INK }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        @keyframes pop{0%{transform:scale(.6);opacity:0}60%{transform:scale(1.08)}100%{transform:scale(1);opacity:1}}
        @keyframes rise{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}`}</style>

      <header style={{ padding: '26px 28px', display: 'flex', justifyContent: 'center' }}>
        <a href="/"><img src="/public/images/logo.png" alt="The5th Consulting" style={{ height: 40, width: 'auto' }} /></a>
      </header>

      <main style={{ maxWidth: 640, margin: '0 auto', padding: '10px 24px 70px', textAlign: 'center' }}>
        <div style={{ width: 92, height: 92, borderRadius: '50%', margin: '10px auto 24px', background: `linear-gradient(160deg,${FOREST},${FOREST_2})`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 16px 48px rgba(28,74,50,.4)', animation: 'pop .5s cubic-bezier(.22,1.4,.4,1)' }}>
          <svg width="46" height="46" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
        </div>

        <div style={{ display: 'inline-block', fontSize: 11.5, fontWeight: 800, letterSpacing: 2.5, textTransform: 'uppercase', color: GOLD_DK, marginBottom: 12 }}>
          Payment confirmed · You’re in
        </div>
        <h1 style={{ fontFamily: 'Gelica, Georgia, serif', fontSize: 'clamp(30px,5vw,44px)', fontWeight: 800, letterSpacing: '-.02em', lineHeight: 1.08, color: INK, margin: 0, animation: 'rise .5s ease' }}>
          Welcome in ✦ Your book<br />and trial are ready.
        </h1>
        <p style={{ fontSize: 16.5, color: MUTE, lineHeight: 1.65, marginTop: 16, maxWidth: 520, marginLeft: 'auto', marginRight: 'auto' }}>
          That’s the easy decision made. Everything I promised is unlocking in your platform right now — here’s exactly what happens next.
        </p>

        <div style={{ display: 'grid', gap: 12, margin: '30px 0 8px', textAlign: 'left' }}>
          {steps.map((s, i) => (
            <div key={s.t} style={{ display: 'flex', gap: 16, alignItems: 'flex-start', background: '#fff', border: '1px solid #ece7f0', borderRadius: 16, padding: '18px 20px', boxShadow: '0 8px 28px rgba(40,20,50,.05)', animation: `rise .5s ease ${0.1 + i * 0.08}s both` }}>
              <div style={{ fontSize: 24, lineHeight: 1.1, flexShrink: 0 }}>{s.icon}</div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, color: INK, marginBottom: 3 }}>{s.t}</div>
                <div style={{ fontSize: 14, color: MUTE, lineHeight: 1.6 }}>{s.d}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Billing reminder — keep the negative-option terms visible post-purchase. */}
        <div style={{ background: '#fff8ec', border: `1px solid ${GOLD}`, borderRadius: 12, padding: '14px 18px', margin: '18px 0 26px', textAlign: 'left' }}>
          <p style={{ fontSize: 13, color: '#4a4130', lineHeight: 1.6, margin: 0 }}>
            <b>A quick reminder:</b> your $1 covers the book, the bonuses, and 7 days of The5th AI. On day 7, unless you cancel, your card is charged $47 and billed monthly — cancel anytime, self-serve, from your membership dashboard. The book stays yours for life either way.
          </p>
        </div>

        <a href={PLATFORM_URL} style={{ display: 'inline-block', background: `linear-gradient(145deg,${GOLD},${GOLD_DK})`, color: '#1a1206', fontWeight: 800, fontSize: 16.5, padding: '16px 36px', borderRadius: 14, textDecoration: 'none', boxShadow: '0 12px 34px rgba(169,134,47,.34)' }}>
          Open your platform →
        </a>
        <p style={{ fontSize: 12.5, color: MUTE, marginTop: 12 }}>
          Log in with the email you just used — no password, just a 6-digit code.
        </p>
      </main>

      <div style={{ textAlign: 'center', fontSize: 12, color: '#b3abbb', padding: '0 0 22px' }}>© 2026 The5th Consulting</div>
    </div>
  )
}
